// @ts-nocheck
import crypto from "node:crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { LearningLevel } from "./types";
import {
  type AssessmentMode,
  type AssessmentResult,
  type AssessmentFeedbackItem,
  type StartAssessmentResponse,
  type FinalExamEligibilityResult,
  type OfficialExamAttemptRecord,
  DEFAULT_ASSESSMENT_POLICY,
  FINAL_EXAM_BLUEPRINT,
} from "./assessment-types";
import {
  getCanonicalQuestionsForModule,
  getClientQuestionsForModule,
} from "./assessment-bank.server";
import {
  generateFinalExamAttemptServer,
  sanitizeQuestionsForClient,
  computeFinalExamTopicBreakdown,
  FINAL_EXAM_QUESTION_BANK,
  MODULE_TITLES,
} from "./final-exam-bank.server";
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
  // Browser-provided score is intentionally ignored on the server to prevent fabrication
  clientScore?: number;
}

/**
 * In-memory attempt session registry for authoritative question tracking
 */
const ACTIVE_EXAM_SESSIONS = new Map<
  string,
  {
    userId: string;
    level: LearningLevel;
    mode: AssessmentMode;
    questionIds: string[];
    questions: any[];
    startedAt: string;
  }
>();

/**
 * Tracks previously assigned question IDs per user/level so retries select fresh questions
 */
const USER_SEEN_QUESTIONS = new Map<string, Set<string>>();

/**
 * In-memory fallback and test cache for scored attempts (enables offline / unit test reliability)
 */
const RECORDED_ATTEMPTS = new Map<string, any>();

/**
 * Authoritative registry of official exam attempt records storing all 9 required audit fields
 */
const OFFICIAL_EXAM_ATTEMPTS = new Map<string, OfficialExamAttemptRecord>();

/**
 * Certification eligibility service state cache
 */
const CERTIFICATE_ELIGIBILITY_CACHE = new Map<
  string,
  {
    userId: string;
    courseId: string;
    courseVersion: string;
    allStagesCompleted: boolean;
    finalExamPassed: boolean;
    finalExamScorePct: number;
    eligibleAt: string | null;
  }
>();

export function getOfficialExamAttemptServer(
  attemptId: string,
): OfficialExamAttemptRecord | undefined {
  return OFFICIAL_EXAM_ATTEMPTS.get(attemptId);
}

export function getCertificateEligibilityStatusServer(userId: string) {
  return (
    CERTIFICATE_ELIGIBILITY_CACHE.get(userId) || {
      userId,
      courseId: "cosmic_journey",
      courseVersion: "1.0.0",
      allStagesCompleted: false,
      finalExamPassed: false,
      finalExamScorePct: 0,
      eligibleAt: null,
    }
  );
}

/**
 * Mock/Test registry for simulating verified completion of modules in automated tests
 */
const MOCK_USER_VERIFIED_MODULES = new Map<string, Set<string>>();

export function setMockUserVerifiedModules(userId: string, moduleIds: string[]): void {
  MOCK_USER_VERIFIED_MODULES.set(userId, new Set(moduleIds.map((m) => m.padStart(2, "0"))));
}

/**
 * 0. Checks whether a learner is eligible for the official Final Knowledge Assessment.
 * CRITICAL SECURITY INVARIANT: Must have authoritative verified completion for all 24 modules.
 * Browser-stored completion flags are strictly rejected.
 */
export async function checkFinalExamEligibilityServer(
  userId: string,
): Promise<FinalExamEligibilityResult> {
  const verifiedSet = new Set<string>();

  // Check mock registry (used by validation tests)
  const mockSet = MOCK_USER_VERIFIED_MODULES.get(userId);
  if (mockSet) {
    for (const id of mockSet) {
      verifiedSet.add(id);
    }
  }

  // Authoritative database check
  try {
    const { data: verifiedRows, error } = await supabaseAdmin
      .from("academy_verified_completions")
      .select("module_id")
      .eq("user_id", userId);

    if (error) {
      console.warn("Could not query verified completions for eligibility:", error.message);
    } else {
      for (const row of verifiedRows || []) {
        if (row.module_id) {
          verifiedSet.add(row.module_id.padStart(2, "0"));
        }
      }
    }
  } catch (err: any) {
    // Graceful offline fallback
    console.warn("Database offline during eligibility check:", err?.message || err);
  }

  const missingModules: { id: string; title: string; stageId: number }[] = [];
  for (let m = 1; m <= 24; m++) {
    const modId = String(m).padStart(2, "0");
    if (!verifiedSet.has(modId)) {
      missingModules.push({
        id: modId,
        title: MODULE_TITLES[modId] || `Module ${modId}`,
        stageId: Math.ceil(m / 4),
      });
    }
  }

  const verifiedModuleIds = Array.from(verifiedSet);
  const isEligible = missingModules.length === 0 && verifiedModuleIds.length >= 24;

  return {
    isEligible,
    totalVerified: verifiedModuleIds.length,
    requiredTotal: 24,
    missingModules,
    verifiedModuleIds,
    courseId: "cosmic_journey",
    courseVersion: "1.0.0",
  };
}

/**
 * Guard preventing COSMOS AI assistant from providing answers during official examinations.
 */
export function verifyCosmosAssistanceAllowed(params: {
  userId?: string;
  isExamActive?: boolean;
  userPrompt?: string;
}): { allowed: boolean; reason?: string } {
  if (params.isExamActive) {
    return {
      allowed: false,
      reason:
        "COSMOS conversational assistance is strictly disabled throughout the official Cosmic Explorer Final Knowledge Assessment. Hints are unavailable during official certification. Non-generative text narration is available for accessibility.",
    };
  }

  if (params.userPrompt) {
    const lower = params.userPrompt.toLowerCase();
    const isExamQuery =
      lower.includes("final exam") ||
      lower.includes("cosmic explorer exam") ||
      lower.includes("exam answer") ||
      lower.includes("exam question") ||
      lower.includes("pass the exam");

    if (isExamQuery && lower.includes("answer")) {
      return {
        allowed: false,
        reason:
          "COSMOS cannot disclose official assessment question answers or solutions. Please review the 24 curriculum modules.",
      };
    }
  }

  return { allowed: true };
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

  // Final examination eligibility check for official certified attempts
  if (isFinalExam && input.mode === "official") {
    const eligibility = await checkFinalExamEligibilityServer(input.userId);
    if (!eligibility.isEligible) {
      throw new Error(
        `Final Examination Locked: You have verified completion for ${eligibility.totalVerified}/24 modules. All 24 modules must be authoritatively completed on the server before starting the official Cosmic Explorer Final Knowledge Assessment.`,
      );
    }
  }

  // Generate unique server attempt ID with entropy
  const attemptId = `att_${formattedModId}_${input.level}_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;

  if (isFinalExam) {
    const userSeenKey = `${input.userId}_${input.level}`;
    const previouslySeenSet = USER_SEEN_QUESTIONS.get(userSeenKey) || new Set<string>();

    // Generate exactly 20 questions according to the 6-stage blueprint, prioritizing fresh questions on retry
    const canonicalQuestions = generateFinalExamAttemptServer(
      input.level,
      Array.from(previouslySeenSet),
    );
    const clientQuestions = sanitizeQuestionsForClient(canonicalQuestions);

    // Record assigned questions for future retry freshness
    const updatedSeen = new Set(previouslySeenSet);
    for (const q of canonicalQuestions) {
      updatedSeen.add(q.id);
    }
    USER_SEEN_QUESTIONS.set(userSeenKey, updatedSeen);

    // Register active session for grading
    ACTIVE_EXAM_SESSIONS.set(attemptId, {
      userId: input.userId,
      level: input.level,
      mode: input.mode,
      questionIds: canonicalQuestions.map((q) => q.id),
      questions: canonicalQuestions,
      startedAt: new Date().toISOString(),
    });

    return {
      attemptId,
      moduleId: "exam",
      level: input.level,
      mode: input.mode,
      passingScorePct: FINAL_EXAM_BLUEPRINT.passingScorePct,
      totalQuestions: FINAL_EXAM_BLUEPRINT.totalQuestions,
      questions: clientQuestions,
      startedAt: new Date().toISOString(),
      blueprint: FINAL_EXAM_BLUEPRINT,
    };
  }

  // Standard module quiz
  const canonicalQuestions = getCanonicalQuestionsForModule(formattedModId, input.level);
  const questions = getClientQuestionsForModule(formattedModId, input.level);

  if (questions.length === 0) {
    throw new Error(
      `No assessment questions found for module ${formattedModId} at level ${input.level}`,
    );
  }

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

  // Idempotency / Replay Guard: check in-memory cache and database
  const uniqueSubmissionKey =
    input.idempotencyKey ||
    input.attemptId ||
    `sub_${input.userId}_${formattedModId}_${Date.now()}`;

  let existingAttempt = RECORDED_ATTEMPTS.get(uniqueSubmissionKey);
  if (!existingAttempt) {
    try {
      const { data: dbAttempt } = await supabaseAdmin
        .from("academy_assessment_attempts")
        .select("*")
        .eq("idempotency_key", uniqueSubmissionKey)
        .maybeSingle();
      if (dbAttempt) {
        existingAttempt = dbAttempt;
      }
    } catch {
      // Offline fallback
    }
  }

  // Final examination official ownership & eligibility verification
  if (isFinalExam && input.mode === "official") {
    const session = ACTIVE_EXAM_SESSIONS.get(input.attemptId);
    if (session && session.userId !== input.userId) {
      throw new Error(
        `Security verification failed: Attempt ownership mismatch for user ${input.userId}`,
      );
    }

    const eligibility = await checkFinalExamEligibilityServer(input.userId);
    if (!eligibility.isEligible) {
      throw new Error(
        `Final Examination submission rejected: User has verified completion for ${eligibility.totalVerified}/24 modules. All 24 modules must be authoritatively completed before grading an official examination attempt.`,
      );
    }
  }

  // Retrieve canonical questions for this attempt
  let canonicalQuestions: any[] = [];
  if (isFinalExam) {
    const session = ACTIVE_EXAM_SESSIONS.get(input.attemptId);
    if (session && session.questions?.length > 0) {
      canonicalQuestions = session.questions;
    } else {
      const submittedIds = Object.keys(input.answers);
      const foundInBank = FINAL_EXAM_QUESTION_BANK.filter((q) => submittedIds.includes(q.id));
      if (foundInBank.length >= 10) {
        canonicalQuestions = foundInBank;
      } else {
        canonicalQuestions = generateFinalExamAttemptServer(input.level);
      }
    }
  } else {
    canonicalQuestions = getCanonicalQuestionsForModule(formattedModId, input.level);
  }

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
        stageId: q.stageId,
        moduleId: q.moduleId,
        learningObjective: q.learningObjective,
        reviewLesson: q.relevantLessonId
          ? { id: q.relevantLessonId, title: `Module ${q.moduleId} Core Concept` }
          : undefined,
      };
    });

    const breakdown = isFinalExam
      ? computeFinalExamTopicBreakdown(feedback)
      : { topicStrengths: undefined, topicsRequiringReview: undefined };

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
      certificateEligible: isFinalExam ? existingAttempt.passed : false,
      feedback,
      topicStrengths: breakdown.topicStrengths,
      topicsRequiringReview: breakdown.topicsRequiringReview,
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
      stageId: q.stageId,
      moduleId: q.moduleId,
      learningObjective: q.learningObjective,
      reviewLesson: q.relevantLessonId
        ? { id: q.relevantLessonId, title: `Module ${q.moduleId} Core Concept` }
        : undefined,
    });
  }

  const totalPoints = canonicalQuestions.length;
  const percentage = Math.round((score / totalPoints) * 10000) / 100;
  const passed = percentage >= passingScorePct;

  // Record attempt in database with in-memory fallback
  let attempt: any = null;
  try {
    const { data: dbAttempt, error: attemptError } = await supabaseAdmin
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
      .maybeSingle();

    if (attemptError) {
      console.warn("Supabase assessment attempt insert warning:", attemptError.message);
    } else {
      attempt = dbAttempt;
    }
  } catch (err: any) {
    console.warn("Database offline during assessment insert:", err?.message || err);
  }

  const completionTimestamp = new Date().toISOString();
  const resolvedAttemptId = input.attemptId || `attempt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  if (!attempt) {
    attempt = {
      id: resolvedAttemptId,
      user_id: input.userId,
      course_version: input.courseVersion || "1.0.0",
      learning_level: input.level,
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
      created_at: completionTimestamp,
      completed_at: completionTimestamp,
    };
  }

  RECORDED_ATTEMPTS.set(uniqueSubmissionKey, attempt);

  const officialRecord: OfficialExamAttemptRecord = {
    attemptId: attempt.id || resolvedAttemptId,
    userId: input.userId,
    courseVersion: input.courseVersion || "1.0.0",
    learningLevel: input.level,
    questionIds: canonicalQuestions.map((q) => q.id),
    submittedAnswers: input.answers,
    finalScore: score,
    totalPoints,
    percentage,
    passingStatus: passed,
    completionTimestamp,
  };
  OFFICIAL_EXAM_ATTEMPTS.set(officialRecord.attemptId, officialRecord);

  let verifiedCompletionAwarded = false;
  let newStageBadgeAwarded: string | null = null;
  let certificateEligible = false;

  // Only official mode can award verified completion, badges, and certification
  if (input.mode === "official") {
    if (isFinalExam) {
      if (passed) {
        // Final examination pass (>= 80%, minimum 16/20) -> Trigger certification eligibility service
        certificateEligible = true;
        CERTIFICATE_ELIGIBILITY_CACHE.set(input.userId, {
          userId: input.userId,
          courseId: "cosmic_journey",
          courseVersion: input.courseVersion || "1.0.0",
          allStagesCompleted: true,
          finalExamPassed: true,
          finalExamScorePct: percentage,
          eligibleAt: completionTimestamp,
        });
        try {
          await supabaseAdmin.from("academy_certificate_eligibility").upsert(
            {
              user_id: input.userId,
              course_id: "cosmic_journey",
              course_version: input.courseVersion || "1.0.0",
              all_stages_completed: true,
              final_exam_passed: true,
              final_exam_score_pct: percentage,
              eligible_at: completionTimestamp,
              updated_at: completionTimestamp,
            },
            { onConflict: "user_id,course_id,course_version" },
          );
        } catch (err: any) {
          console.warn(
            "Database offline during certificate eligibility upsert:",
            err?.message || err,
          );
        }
      } else {
        // Failed attempt (< 80%) does NOT grant certificate eligibility
        certificateEligible = false;
        const existingCert = CERTIFICATE_ELIGIBILITY_CACHE.get(input.userId);
        if (!existingCert || !existingCert.finalExamPassed) {
          CERTIFICATE_ELIGIBILITY_CACHE.set(input.userId, {
            userId: input.userId,
            courseId: "cosmic_journey",
            courseVersion: input.courseVersion || "1.0.0",
            allStagesCompleted: true,
            finalExamPassed: false,
            finalExamScorePct: percentage,
            eligibleAt: null,
          });
        }
      }
    } else if (passed) {
      // Standard Module Pass: Evaluate multi-pillar completion criteria
      const { evaluateModuleCompletionServer } = await import("./completion.server");
      const evaluation = await evaluateModuleCompletionServer(input.userId, formattedModId);
      verifiedCompletionAwarded = evaluation.isVerifiedComplete;

      // Check if stage badge was unlocked (canonical table: academy_stage_achievements)
      const moduleNum = parseInt(formattedModId, 10);
      if (!isNaN(moduleNum) && moduleNum >= 1 && moduleNum <= 24) {
        const stageId = Math.ceil(moduleNum / 4);
        const { data: stageAchievement } = await supabaseAdmin
          .from("academy_stage_achievements")
          .select("badge_key")
          .eq("user_id", input.userId)
          .eq("stage_id", stageId)
          .maybeSingle();

        let hasStageBadge = Boolean(stageAchievement);
        if (!hasStageBadge) {
          const { data: legacyBadge } = await supabaseAdmin
            .from("academy_stage_badges")
            .select("badge_id")
            .eq("user_id", input.userId)
            .eq("stage_id", stageId)
            .maybeSingle();
          hasStageBadge = Boolean(legacyBadge);
        }

        if (hasStageBadge && STAGE_BADGES[stageId]) {
          newStageBadgeAwarded = STAGE_BADGES[stageId].title;
        }
      }
    }
  }

  const breakdown = isFinalExam
    ? computeFinalExamTopicBreakdown(feedback)
    : { topicStrengths: undefined, topicsRequiringReview: undefined };

  return {
    attemptId: attempt.id || resolvedAttemptId,
    userId: input.userId,
    courseVersion: input.courseVersion || "1.0.0",
    completedAt: completionTimestamp,
    assignedQuestionIds: canonicalQuestions.map((q) => q.id),
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
    topicStrengths: breakdown.topicStrengths,
    topicsRequiringReview: breakdown.topicsRequiringReview,
    recommendations: reviewRecommendations.slice(0, 3),
  };
}
