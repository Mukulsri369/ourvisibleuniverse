import { createHash, randomUUID } from "node:crypto";
import type { PoolConnection } from "mysql2/promise";
import { lockLearner } from "./academy-common.server";
import { evaluateCompletion, syncAchievements } from "./academy-completion.server";
import { issueCertificateInTransaction } from "./academy-certificates.server";
import { STAGE_BADGES } from "../lib/academy/stage-badges";
import { ensureStudentProfileInTransaction } from "./student.server";
import { transaction } from "./db.server";
import type { Principal } from "./authorization.server";
import {
  storedAssessmentStartInput,
  storedAssessmentSubmitInput,
} from "../lib/academy/assessment-inputs";
import { getCanonicalQuestionsForModule } from "../lib/academy/assessment-bank.server";
import {
  generateFinalExamAttemptServer,
  sanitizeQuestionsForClient,
  computeFinalExamTopicBreakdown,
} from "../lib/academy/final-exam-bank.server";
import {
  DEFAULT_ASSESSMENT_POLICY,
  FINAL_EXAM_BLUEPRINT,
  type AssessmentResult,
  type CanonicalAssessmentQuestion,
  type StartAssessmentResponse,
} from "../lib/academy/assessment-types";

function json<T>(value: T | string): T {
  return typeof value === "string" ? JSON.parse(value) : value;
}
async function requireFinalEligibility(connection: PoolConnection, userId: string) {
  const [rows]: any = await connection.execute(
    "SELECT module_id FROM academy_verified_completions WHERE user_id=?",
    [userId],
  );
  const verified = new Set(rows.map((row: any) => row.module_id));
  if (
    !Array.from({ length: 24 }, (_, i) => String(i + 1).padStart(2, "0")).every((id) =>
      verified.has(id),
    )
  )
    throw new Error("Complete all 24 verified modules before the official final examination");
}

/** Server-issued question snapshots and learner authorization. */
export async function startStoredAssessment(
  principal: Principal | null,
  input: unknown,
): Promise<StartAssessmentResponse> {
  const data = storedAssessmentStartInput.parse(input);
  return transaction(async (connection) => {
    const userId = await lockLearner(connection, principal, data.mode === "practice");
    if (data.moduleId === "exam" && data.mode === "official")
      await requireFinalEligibility(connection, userId);
    if (data.mode === "official") await ensureStudentProfileInTransaction(connection, userId);
    // Preserve question freshness across restarts, rather than keeping a process-local Set.
    const [past]: any = await connection.execute(
      `SELECT question_snapshot FROM academy_assessment_sessions
      WHERE user_id=? AND learning_level=? AND module_id='exam' ORDER BY started_at DESC LIMIT 50`,
      [userId, data.level],
    );
    const seen = past.flatMap((row: any) =>
      json<CanonicalAssessmentQuestion[]>(row.question_snapshot).map((q) => q.id),
    );
    const questions: CanonicalAssessmentQuestion[] =
      data.moduleId === "exam"
        ? generateFinalExamAttemptServer(data.level, seen)
        : getCanonicalQuestionsForModule(data.moduleId, data.level);
    if (!questions.length) throw new Error("Canonical assessment questions unavailable");
    const id = randomUUID();
    const passingScorePct =
      data.moduleId === "exam"
        ? DEFAULT_ASSESSMENT_POLICY.finalCertificationPassingPct
        : DEFAULT_ASSESSMENT_POLICY.defaultModulePassingPct;
    await connection.execute(
      `INSERT INTO academy_assessment_sessions
      (id,user_id,module_id,learning_level,mode,question_snapshot,passing_score_pct,expires_at)
      VALUES(?,?,?,?,?,?,?,DATE_ADD(CURRENT_TIMESTAMP(6),INTERVAL 2 HOUR))`,
      [
        id,
        userId,
        data.moduleId,
        data.level,
        data.mode,
        JSON.stringify(questions),
        passingScorePct,
      ],
    );
    const [times]: any = await connection.execute(
      "SELECT started_at FROM academy_assessment_sessions WHERE id=?",
      [id],
    );
    return {
      attemptId: id,
      moduleId: data.moduleId,
      level: data.level,
      mode: data.mode,
      passingScorePct,
      totalQuestions: questions.length,
      questions: sanitizeQuestionsForClient(questions),
      startedAt: new Date(times[0].started_at).toISOString(),
      ...(data.moduleId === "exam" ? { blueprint: FINAL_EXAM_BLUEPRINT } : {}),
    };
  });
}

/** Grading, completion, achievements, eligibility and issuance commit atomically. */
export async function gradeStoredAssessment(
  principal: Principal | null,
  input: unknown,
): Promise<AssessmentResult> {
  const data = storedAssessmentSubmitInput.parse(input);
  return transaction(async (connection) => {
    const userId = await lockLearner(connection, principal, data.mode === "practice");
    const [sessions]: any = await connection.execute(
      `SELECT *,
      TIMESTAMPDIFF(SECOND,started_at,CURRENT_TIMESTAMP(6)) AS elapsed_seconds,
      expires_at<=CURRENT_TIMESTAMP(6) AS expired FROM academy_assessment_sessions
      WHERE id=? AND user_id=? FOR UPDATE`,
      [data.attemptId, userId],
    );
    const session = sessions[0];
    if (
      !session ||
      session.module_id !== data.moduleId ||
      session.learning_level !== data.level ||
      session.mode !== data.mode
    )
      throw new Error(
        "Assessment attempt does not match the signed-in learner and selected assessment",
      );
    const questions = json<CanonicalAssessmentQuestion[]>(session.question_snapshot);
    const ids = new Set(questions.map((q) => q.id));
    if (Object.keys(data.answers).some((id) => !ids.has(id)))
      throw new Error("Answer was not assigned to this attempt");
    // Sort keys for stable retry comparison; do not include optional client timing in the answer identity.
    const answers = Object.fromEntries(
      Object.entries(data.answers).sort(([a], [b]) => a.localeCompare(b)),
    );
    const hash = createHash("sha256").update(JSON.stringify(answers)).digest("hex");
    const key = data.idempotencyKey ?? data.attemptId;
    if (session.submitted_at) {
      if (session.submission_key !== key || session.submission_hash !== hash)
        throw new Error("Assessment retry conflicts with the recorded submission");
      return json<AssessmentResult>(session.verdict);
    }
    if (Boolean(session.expired))
      throw new Error("Assessment attempt expired; start a new attempt");
    if (Number(session.elapsed_seconds) < DEFAULT_ASSESSMENT_POLICY.minDurationSeconds)
      throw new Error("Assessment submission is too soon after the server-issued start");
    if (data.moduleId === "exam" && data.mode === "official")
      await requireFinalEligibility(connection, userId);
    const feedback = questions.map((q) => {
      const choice = answers[q.id] ?? null;
      const isCorrect = Array.isArray(q.correctAnswer)
        ? Array.isArray(choice) &&
          q.correctAnswer.length === choice.length &&
          q.correctAnswer.every((v, i) => v === choice[i])
        : choice === q.correctAnswer;
      return {
        questionId: q.id,
        questionText: q.questionText,
        userAnswer: choice,
        isCorrect,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        sourceReference: q.sourceReference,
        stageId: q.stageId,
        moduleId: q.moduleId,
        learningObjective: q.learningObjective,
        ...(q.relevantLessonId
          ? { reviewLesson: { id: q.relevantLessonId, title: `Module ${q.moduleId} Core Concept` } }
          : {}),
      };
    });
    const score = feedback.filter((f) => f.isCorrect).length;
    const percentage = Math.round((score / questions.length) * 10000) / 100;
    const result: AssessmentResult = {
      attemptId: data.attemptId,
      userId,
      courseVersion: session.course_version,
      moduleId: data.moduleId,
      level: data.level,
      mode: data.mode,
      score,
      totalPoints: questions.length,
      percentage,
      passed: percentage >= session.passing_score_pct,
      passingScorePct: session.passing_score_pct,
      assignedQuestionIds: questions.map((q) => q.id),
      verifiedCompletionAwarded: false,
      newStageBadgeAwarded: null,
      certificateEligible: false,
      feedback,
      ...(data.moduleId === "exam" ? computeFinalExamTopicBreakdown(feedback) : {}),
    };
    // Return the same JSON shape on the first response and every durable replay.
    const verdict = json<AssessmentResult>(JSON.stringify(result));
    const attemptId = randomUUID();
    await connection.execute(
      `INSERT INTO academy_assessment_attempts
      (id,user_id,assessment_id,assigned_question_ids,answers_payload,score,total_points,percentage,passed,
      client_duration_seconds,idempotency_key) VALUES(?,?,?,?,?,?,?,?,?,?,?)`,
      [
        attemptId,
        userId,
        (data.mode === "practice" ? "practice_" : "") +
          (data.moduleId === "exam" ? "final_exam" : `quiz_module_${data.moduleId}`),
        JSON.stringify(result.assignedQuestionIds),
        JSON.stringify(answers),
        score,
        questions.length,
        percentage,
        result.passed,
        data.clientDurationSeconds === undefined ? null : Math.floor(data.clientDurationSeconds),
        `stored_${data.attemptId}`,
      ],
    );
    await connection.execute(
      `UPDATE academy_assessment_sessions SET submission_key=?,submission_hash=?,
      verdict=?,recorded_attempt_id=?,submitted_at=CURRENT_TIMESTAMP(6) WHERE id=?`,
      [key, hash, JSON.stringify(verdict), attemptId, data.attemptId],
    );
    if (data.mode === "official") {
      if (data.moduleId !== "exam") {
        const stage = Math.ceil(Number(data.moduleId) / 4);
        const [priorBadges]: any = await connection.execute(
          "SELECT id FROM academy_stage_achievements WHERE user_id=? AND stage_id=?",
          [userId, stage],
        );
        const evaluation = await evaluateCompletion(connection, userId, data.moduleId);
        verdict.verifiedCompletionAwarded = evaluation.isVerifiedComplete;
        const [badges]: any = await connection.execute(
          "SELECT id FROM academy_stage_achievements WHERE user_id=? AND stage_id=?",
          [userId, stage],
        );
        if (!priorBadges.length && badges.length)
          verdict.newStageBadgeAwarded = STAGE_BADGES[stage].title;
      } else if (verdict.passed) {
        await syncAchievements(connection, userId);
        await connection.execute(
          "UPDATE academy_certificate_eligibility SET final_exam_passed=true,final_exam_score_pct=GREATEST(COALESCE(final_exam_score_pct,0),?),eligible_at=COALESCE(eligible_at,CURRENT_TIMESTAMP(6)),updated_at=CURRENT_TIMESTAMP(6) WHERE user_id=? AND course_id='cosmic_journey' AND course_version='1.0.0'",
          [verdict.percentage, userId],
        );
        await issueCertificateInTransaction(connection, userId);
        verdict.certificateEligible = true;
      }
      await connection.execute("UPDATE academy_assessment_sessions SET verdict=? WHERE id=?", [
        JSON.stringify(verdict),
        data.attemptId,
      ]);
    }
    return verdict;
  });
}
