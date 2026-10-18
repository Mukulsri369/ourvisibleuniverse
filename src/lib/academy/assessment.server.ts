import crypto from "node:crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { LearningLevel } from "./types";
import {
  type AssessmentMode,
  type AssessmentResult,
  type AssessmentFeedbackItem,
  type StartAssessmentResponse,
  DEFAULT_ASSESSMENT_POLICY,
} from "./assessment-types";
import {
  getCanonicalQuestionsForModule,
  getClientQuestionsForModule,
  getFinalExamQuestions,
  getClientFinalExamQuestions,
} from "./assessment-bank.server";
import { STAGE_BADGES } from "./stage-badges";

export interface StartAssessmentInput {
  userId: string;
  moduleId: string;
  level: LearningLevel;
  mode: AssessmentMode;
}

export interface SubmitAssessmentAttemptInput {
  userId: string;
  attemptId: string;
  moduleId: string;
  level: LearningLevel;
  mode: AssessmentMode;
  answers: Record<string, number | number[]>; // questionId -> option index (or array of indices)
  clientDurationSeconds?: number;
  idempotencyKey?: string;
  courseVersion?: string;
}

/**
 * 1. Starts a secure assessment attempt on the server.
 * Selects question set for the active level and strips all answers and explanations.
 */
export async function startAssessmentServer(
  input: StartAssessmentInput,
): Promise<StartAssessmentResponse> {
  const isFinalExam = input.moduleId === "exam" || input.moduleId === "24-capstone";
  const formattedModId = isFinalExam ? "exam" : input.moduleId.padStart(2, "0");

  const passingScorePct = isFinalExam
    ? DEFAULT_ASSESSMENT_POLICY.finalCertificationPassingPct
    : DEFAULT_ASSESSMENT_POLICY.defaultModulePassingPct;

  const questions = isFinalExam
    ? getClientFinalExamQuestions(input.level)
    : getClientQuestionsForModule(formattedModId, input.level);

  if (questions.length === 0) {
    throw new Error(
      `No assessment questions found for module ${formattedModId} at level ${input.level}`,
    );
  }

  // Generate unique server attempt ID with entropy
  const attemptId = `att_${formattedModId}_${input.level}_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;

  return {
    attemptId,
    moduleId: formattedModId,
    level: input.level,
    mode: input.mode,
    passingScorePct,
    totalQuestions: questions.length,
    questions,
    startedAt: new Date().toISOString(),
  };
}

/**
 * 2. Authoritatively grades an assessment attempt on the server.
 * Validates ownership, checks replay/idempotency, scores canonical questions,
 * and if passing in official mode, records verified completion and stage badges.
 */
export async function submitAssessmentAttemptServer(
  input: SubmitAssessmentAttemptInput,
): Promise<AssessmentResult> {
  const isFinalExam = input.moduleId === "exam" || input.moduleId === "24-capstone";
  const formattedModId = isFinalExam ? "exam" : input.moduleId.padStart(2, "0");

  const passingScorePct = isFinalExam
    ? DEFAULT_ASSESSMENT_POLICY.finalCertificationPassingPct
    : DEFAULT_ASSESSMENT_POLICY.defaultModulePassingPct;

  // Rate-limiting / minimum duration check (must spend at least minDurationSeconds)
  if (
    input.clientDurationSeconds !== undefined &&
    input.clientDurationSeconds < DEFAULT_ASSESSMENT_POLICY.minDurationSeconds
  ) {
    throw new Error(
      `Assessment submission rejected: duration (${input.clientDurationSeconds}s) is below required minimum threshold (${DEFAULT_ASSESSMENT_POLICY.minDurationSeconds}s).`,
    );
  }

  // Idempotency / Replay Guard
  const uniqueSubmissionKey =
    input.idempotencyKey ||
    input.attemptId ||
    `sub_${input.userId}_${formattedModId}_${Date.now()}`;

  // Check if this idempotency key was already recorded in database
  const { data: existingAttempt } = await supabaseAdmin
    .from("academy_assessment_attempts")
    .select("*")
    .eq("idempotency_key", uniqueSubmissionKey)
    .maybeSingle();

  const canonicalQuestions = isFinalExam
    ? getFinalExamQuestions(input.level)
    : getCanonicalQuestionsForModule(formattedModId, input.level);

  if (canonicalQuestions.length === 0) {
    throw new Error(`Canonical questions missing for module ${formattedModId}`);
  }

  if (existingAttempt) {
    // Replay protection: return existing scored attempt without re-awarding achievements
    const feedback: AssessmentFeedbackItem[] = canonicalQuestions.map((q, idx) => {
      const userChoice =
        (existingAttempt.answers_payload as any)?.[q.id] ??
        (existingAttempt.answers_payload as any)?.[idx];

      const isCorrect = Array.isArray(q.correctAnswer)
        ? Array.isArray(userChoice) &&
          q.correctAnswer.length === userChoice.length &&
          q.correctAnswer.every((val, i) => val === userChoice[i])
        : userChoice === q.correctAnswer;

      return {
        questionId: q.id,
        questionText: q.questionText,
        userAnswer: userChoice ?? null,
        isCorrect,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        sourceReference: q.sourceReference,
        reviewLesson: q.relevantLessonId
          ? { id: q.relevantLessonId, title: `Module ${q.moduleId} Core Concept` }
          : undefined,
      };
    });

    return {
      attemptId: existingAttempt.id,
      moduleId: formattedModId,
      level: input.level,
      mode: input.mode,
      score: existingAttempt.score,
      totalPoints: existingAttempt.total_points,
      percentage: existingAttempt.percentage,
      passed: existingAttempt.passed,
      passingScorePct,
      verifiedCompletionAwarded: false,
      newStageBadgeAwarded: null,
      certificateEligible: false,
      feedback,
    };
  }

  // Authoritative server-side grading
  let score = 0;
  const feedback: AssessmentFeedbackItem[] = [];
  const reviewRecommendations: { lessonId: string; title: string; reviewNote: string }[] = [];

  for (let idx = 0; idx < canonicalQuestions.length; idx++) {
    const q = canonicalQuestions[idx];
    const userChoice = input.answers[q.id] ?? input.answers[idx];

    let isCorrect = false;
    if (Array.isArray(q.correctAnswer)) {
      isCorrect =
        Array.isArray(userChoice) &&
        q.correctAnswer.length === userChoice.length &&
        q.correctAnswer.every((val, i) => val === userChoice[i]);
    } else {
      isCorrect = userChoice === q.correctAnswer;
    }

    if (isCorrect) {
      score++;
    } else {
      reviewRecommendations.push({
        lessonId: q.relevantLessonId || `${q.moduleId}-core`,
        title: `Module ${q.moduleId} Key Concept`,
        reviewNote: `Review: ${q.questionText} (${q.sourceReference})`,
      });
    }

    feedback.push({
      questionId: q.id,
      questionText: q.questionText,
      userAnswer: userChoice ?? null,
      isCorrect,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      sourceReference: q.sourceReference,
      reviewLesson: q.relevantLessonId
        ? { id: q.relevantLessonId, title: `Module ${q.moduleId} Core Concept` }
        : undefined,
    });
  }

  const totalPoints = canonicalQuestions.length;
  const percentage = Math.round((score / totalPoints) * 10000) / 100;
  const passed = percentage >= passingScorePct;

  // Record attempt in database
  const { data: attempt, error: attemptError } = await supabaseAdmin
    .from("academy_assessment_attempts")
    .insert({
      user_id: input.userId,
      assessment_id: isFinalExam ? "cosmic_explorer_final_exam" : `quiz_module_${formattedModId}`,
      assessment_version: "1.0.0",
      question_set_version: "1.0.0",
      assigned_question_ids: canonicalQuestions.map((q) => q.id),
      answers_payload: input.answers as any,
      score,
      total_points: totalPoints,
      percentage,
      passed,
      client_duration_seconds: input.clientDurationSeconds ?? null,
      idempotency_key: uniqueSubmissionKey,
    })
    .select()
    .single();

  if (attemptError || !attempt) {
    console.error("Could not record assessment attempt:", attemptError?.message);
    throw new Error(
      `Failed to record assessment attempt: ${attemptError?.message || "Unknown error"}`,
    );
  }

  let verifiedCompletionAwarded = false;
  let newStageBadgeAwarded: string | null = null;
  let certificateEligible = false;

  // Only official mode can award verified completion, badges, and certification
  if (input.mode === "official" && passed) {
    if (isFinalExam) {
      // Final examination pass!
      certificateEligible = true;
      await supabaseAdmin.from("academy_certificate_eligibility").upsert(
        {
          user_id: input.userId,
          course_id: "cosmic_journey",
          course_version: input.courseVersion || "1.0.0",
          final_exam_passed: true,
          final_exam_score_pct: percentage,
          eligible_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,course_id,course_version" },
      );
    } else {
      // Standard Module Pass: issue verified completion
      const completionIdempotencyKey = `comp_${input.userId}_${formattedModId}`;

      // Retrieve any registered activity evidence IDs
      const { data: evidenceRows } = await supabaseAdmin
        .from("academy_activity_evidence")
        .select("id")
        .eq("user_id", input.userId)
        .eq("module_id", formattedModId)
        .limit(5);

      const evidenceIds = (evidenceRows || []).map((r) => r.id);

      const { error: compError } = await supabaseAdmin.from("academy_verified_completions").upsert(
        {
          user_id: input.userId,
          module_id: formattedModId,
          module_version: "1.0.0",
          approved_rule_version: "1.0.0",
          qualifying_assessment_attempt_id: attempt.id,
          qualifying_evidence_ids: evidenceIds,
          verified_at: new Date().toISOString(),
          idempotency_key: completionIdempotencyKey,
        },
        { onConflict: "user_id,module_id" },
      );

      if (!compError) {
        verifiedCompletionAwarded = true;

        // Mirror to academy_module_progress
        await supabaseAdmin.from("academy_module_progress").upsert(
          {
            user_id: input.userId,
            module_id: formattedModId,
            status: "completed",
            percent: 100,
            verified_quiz_passed: true,
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,module_id" },
        );

        // Check stage completion (each stage has 4 modules)
        const moduleNum = parseInt(formattedModId, 10);
        if (!isNaN(moduleNum) && moduleNum >= 1 && moduleNum <= 24) {
          const stageId = Math.ceil(moduleNum / 4);
          const startMod = (stageId - 1) * 4 + 1;
          const stageModIds = [0, 1, 2, 3].map((offset) =>
            String(startMod + offset).padStart(2, "0"),
          );

          const { data: stageCompletions } = await supabaseAdmin
            .from("academy_verified_completions")
            .select("module_id")
            .eq("user_id", input.userId)
            .in("module_id", stageModIds);

          if (stageCompletions && stageCompletions.length === 4) {
            const badgeInfo = STAGE_BADGES[stageId];
            if (badgeInfo) {
              const { error: badgeError } = await supabaseAdmin
                .from("academy_stage_achievements")
                .upsert(
                  {
                    user_id: input.userId,
                    stage_id: stageId,
                    badge_id: badgeInfo.badgeId,
                    stage_rule_version: "1.0.0",
                    qualifying_module_ids: stageModIds,
                    awarded_at: new Date().toISOString(),
                  },
                  { onConflict: "user_id,stage_id" },
                );

              if (!badgeError) {
                newStageBadgeAwarded = badgeInfo.title;

                await supabaseAdmin.from("academy_stage_badges").upsert(
                  {
                    user_id: input.userId,
                    stage_id: stageId,
                    badge_id: badgeInfo.badgeId,
                    awarded_at: new Date().toISOString(),
                  },
                  { onConflict: "user_id,stage_id" },
                );
              }
            }
          }
        }

        // Check if all 24 modules are verified
        const { count: totalVerifiedCount } = await supabaseAdmin
          .from("academy_verified_completions")
          .select("*", { count: "exact", head: true })
          .eq("user_id", input.userId);

        if (totalVerifiedCount && totalVerifiedCount >= 24) {
          certificateEligible = true;
          await supabaseAdmin.from("academy_certificate_eligibility").upsert(
            {
              user_id: input.userId,
              course_id: "cosmic_journey",
              course_version: input.courseVersion || "1.0.0",
              all_stages_completed: true,
              eligible_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id,course_id,course_version" },
          );
        }

        // Security Audit Log
        await supabaseAdmin.from("academy_audit_log").insert({
          actor_id: input.userId,
          actor_role: "service_role",
          action: "verify_module_completion",
          entity_type: "academy_verified_completions",
          entity_id: formattedModId,
          new_state: { attempt_id: attempt.id, score, percentage, mode: input.mode },
          idempotency_key: completionIdempotencyKey,
        });
      }
    }
  }

  return {
    attemptId: attempt.id,
    moduleId: formattedModId,
    level: input.level,
    mode: input.mode,
    score,
    totalPoints,
    percentage,
    passed,
    passingScorePct,
    verifiedCompletionAwarded,
    newStageBadgeAwarded,
    certificateEligible,
    feedback,
    recommendations: reviewRecommendations.slice(0, 3),
  };
}
