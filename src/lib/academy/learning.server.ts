// @ts-nocheck
import crypto from "node:crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { MODULE_01_LESSON } from "@/lib/academy/lessons/module-01-our-place";
import { MODULE_02_QUIZ } from "@/lib/academy/lessons/module-02-night-sky";
import { MODULE_03_QUIZ } from "@/lib/academy/lessons/module-03-cosmic-scale";
import { MODULE_04_QUIZ } from "@/lib/academy/lessons/module-04-light-time";
import { MODULE_05_QUIZ } from "@/lib/academy/lessons/module-05-earth-moon";
import { MODULE_06_QUIZ } from "@/lib/academy/lessons/module-06-solar-system";
import { MODULE_07_QUIZ } from "@/lib/academy/lessons/module-07-the-sun";
import { MODULE_08_LESSON } from "@/lib/academy/lessons/module-08-gravity-orbits";
import { MODULE_09_LESSON } from "@/lib/academy/lessons/module-09-stars";
import { MODULE_10_QUIZ_QUESTIONS } from "@/lib/academy/lessons/module-10-stellar-evolution";
import { MODULE_11_QUIZ_QUESTIONS } from "@/lib/academy/lessons/module-11-nebulae";
import { MODULE_12_QUIZ } from "@/lib/academy/lessons/module-12-exoplanets";
import { MODULE_13_QUIZ_QUESTIONS } from "@/lib/academy/lessons/module-13-galaxies";
import { MODULE_14_QUIZ } from "@/lib/academy/lessons/module-14-black-holes";
import { MODULE_15_QUIZ } from "@/lib/academy/lessons/module-15-cosmic-web";
import { MODULE_16_QUIZ } from "@/lib/academy/lessons/module-16-dark-matter-energy";
import { MODULE_17_QUIZ } from "@/lib/academy/lessons/module-17-big-bang";
import { MODULE_18_QUIZ } from "@/lib/academy/lessons/module-18-expanding-universe";
import { MODULE_19_QUIZ } from "@/lib/academy/lessons/module-19-history-cosmology";
import { MODULE_20_QUIZ } from "@/lib/academy/lessons/module-20-future-universe";
import { MODULE_21_QUIZ } from "@/lib/academy/lessons/module-21-telescopes";
import { MODULE_22_QUIZ } from "@/lib/academy/lessons/module-22-space-missions";
import { MODULE_23_QUIZ } from "@/lib/academy/lessons/module-23-astrobiology";
import { MODULE_24_QUIZ } from "@/lib/academy/lessons/module-24-cosmic-lab";
import { STAGE_BADGES } from "./stage-badges";

const MODULE_QUIZZES: Record<string, any[]> = {
  "01": (MODULE_01_LESSON as any).gradeLevelContent.explorer.quizQuestions,
  "02": MODULE_02_QUIZ as any[],
  "03": MODULE_03_QUIZ as any[],
  "04": MODULE_04_QUIZ as any[],
  "05": MODULE_05_QUIZ as any[],
  "06": (MODULE_06_QUIZ as any).explorer || (MODULE_06_QUIZ as any),
  "07": MODULE_07_QUIZ as any[],
  "08": (MODULE_08_LESSON as any).gradeLevelContent.explorer.quizQuestions,
  "09": (MODULE_09_LESSON as any).gradeLevelContent.explorer.quizQuestions,
  "10": MODULE_10_QUIZ_QUESTIONS as any[],
  "11": MODULE_11_QUIZ_QUESTIONS as any[],
  "12": MODULE_12_QUIZ as any[],
  "13": (MODULE_13_QUIZ_QUESTIONS as any).explorer || (MODULE_13_QUIZ_QUESTIONS as any),
  "14": MODULE_14_QUIZ as any[],
  "15": MODULE_15_QUIZ as any[],
  "16": MODULE_16_QUIZ as any[],
  "17": MODULE_17_QUIZ as any[],
  "18": MODULE_18_QUIZ as any[],
  "19": MODULE_19_QUIZ as any[],
  "20": MODULE_20_QUIZ as any[],
  "21": MODULE_21_QUIZ as any[],
  "22": MODULE_22_QUIZ as any[],
  "23": MODULE_23_QUIZ as any[],
  "24": MODULE_24_QUIZ as any[],
};

function getQuestionCorrectIndex(q: any): number {
  if (typeof q.correctIndex === "number") return q.correctIndex;
  if (typeof q.correctAnswerIndex === "number") return q.correctAnswerIndex;
  if (typeof q.correctAnswer === "number") return q.correctAnswer;
  return 0;
}

const HMAC_SECRET =
  process.env.CERTIFICATE_HMAC_SECRET || "cosmic_academy_authoritative_signature_salt_2026";

export function generateCertificateVerificationHash(data: {
  certificateNumber: string;
  userId: string;
  studentPublicId: string;
  courseVersion: string;
  issueDate: string;
  finalScore: number;
}): string {
  const payload = [
    data.certificateNumber,
    data.userId,
    data.studentPublicId,
    data.courseVersion,
    data.issueDate,
    data.finalScore.toFixed(2),
  ].join("::");
  return crypto.createHmac("sha256", HMAC_SECRET).update(payload).digest("hex");
}

export interface ActivityEvidenceInput {
  userId: string;
  moduleId: string;
  activityType: string;
  evidencePayload: Record<string, unknown>;
  clientTimestamp: string;
}

/**
 * 1. Authoritative Evidence Logging
 * Students can log telemetry from 3D simulations and labs.
 */
export async function recordActivityEvidenceServer(input: ActivityEvidenceInput) {
  const formattedModuleId = input.moduleId.padStart(2, "0");
  const { validateActivityOutcomeServer } = await import("./activity-validator.server");
  const validation = validateActivityOutcomeServer(input.activityType, input.evidencePayload);

  if (!validation.isValid) {
    console.warn(`Activity evidence rejected for ${input.activityType}:`, validation.reason);
    return null;
  }

  const { data: evidence, error } = await supabaseAdmin
    .from("academy_activity_evidence")
    .insert({
      user_id: input.userId,
      module_id: formattedModuleId,
      activity_type: input.activityType,
      evidence_payload: {
        ...input.evidencePayload,
        validationReason: validation.reason,
      } as any,
      client_timestamp: input.clientTimestamp,
      verification_status: "verified",
      verified_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.warn("Could not insert activity evidence:", error.message);
    return null;
  }

  // Trigger server-authoritative completion recheck
  const { evaluateModuleCompletionServer } = await import("./completion.server");
  await evaluateModuleCompletionServer(input.userId, formattedModuleId);

  return evidence;
}

export interface SubmitAssessmentInput {
  userId: string;
  moduleId: string;
  answers: Record<number, number>; // questionIndex -> selectedOptionIndex
  clientDurationSeconds?: number;
  idempotencyKey?: string;
  courseVersion?: string;
}

export interface GradedAssessmentResult {
  attemptId: string;
  moduleId: string;
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  verifiedCompletionAwarded: boolean;
  newStageBadgeAwarded: string | null;
  certificateEligible: boolean;
  feedback: {
    questionIndex: number;
    isCorrect: boolean;
    correctOptionIndex: number;
    explanation: string;
  }[];
}

/**
 * 2. Authoritative Server Grading & Verification Engine
 * Strictly computes score from server-side questions and issues verified completions and badges.
 */
export async function gradeAssessmentAndVerifyServer(
  input: SubmitAssessmentInput,
): Promise<GradedAssessmentResult> {
  const formattedModuleId = input.moduleId.padStart(2, "0");
  const questions = MODULE_QUIZZES[formattedModuleId] || [];

  if (questions.length === 0) {
    throw new Error(`No canonical assessment found for module ${formattedModuleId}`);
  }

  // Idempotency check: if this idempotency key was already submitted, return the existing attempt
  if (input.idempotencyKey) {
    const { data: existingAttempt } = await supabaseAdmin
      .from("academy_assessment_attempts")
      .select("*")
      .eq("idempotency_key", input.idempotencyKey)
      .maybeSingle();

    if (existingAttempt) {
      const feedback = questions.map((q, idx) => {
        const correctIndex = getQuestionCorrectIndex(q);
        const userChoice = (existingAttempt.answers_payload as any)?.[idx];
        return {
          questionIndex: idx,
          isCorrect: userChoice === correctIndex,
          correctOptionIndex: correctIndex,
          explanation: q.explanation || "Correct astronomical principle verified.",
        };
      });

      return {
        attemptId: existingAttempt.id,
        moduleId: formattedModuleId,
        score: existingAttempt.score,
        totalPoints: existingAttempt.total_points,
        percentage: existingAttempt.percentage,
        passed: existingAttempt.passed,
        verifiedCompletionAwarded: false,
        newStageBadgeAwarded: null,
        certificateEligible: false,
        feedback,
      };
    }
  }

  // Grade on server
  let score = 0;
  const feedback = questions.map((q, idx) => {
    const correctIndex = getQuestionCorrectIndex(q);
    const userChoice = input.answers[idx];
    const isCorrect = userChoice === correctIndex;
    if (isCorrect) score++;

    return {
      questionIndex: idx,
      isCorrect,
      correctOptionIndex: correctIndex,
      explanation: q.explanation || "Correct astronomical principle verified.",
    };
  });

  const totalPoints = questions.length;
  const percentage = Math.round((score / totalPoints) * 10000) / 100;
  const passed = percentage >= 80.0;

  // Record attempt in database
  const idempotencyKey =
    input.idempotencyKey ||
    `attempt_${input.userId}_${formattedModuleId}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  const { data: attempt, error: attemptError } = await supabaseAdmin
    .from("academy_assessment_attempts")
    .insert({
      user_id: input.userId,
      assessment_id: `quiz_module_${formattedModuleId}`,
      assessment_version: "1.0.0",
      question_set_version: "1.0.0",
      assigned_question_ids: questions.map((q, i) => q.id || `q_${i}`),
      answers_payload: input.answers as any,
      score,
      total_points: totalPoints,
      percentage,
      passed,
      client_duration_seconds: input.clientDurationSeconds ?? null,
      idempotency_key: idempotencyKey,
    })
    .select()
    .single();

  if (attemptError || !attempt) {
    throw new Error(
      `Failed to record assessment attempt: ${attemptError?.message || "Unknown error"}`,
    );
  }

  let verifiedCompletionAwarded = false;
  let newStageBadgeAwarded: string | null = null;
  let certificateEligible = false;

  // If passed, evaluate whether all module criteria (reading + activities + assessment) are met
  if (passed) {
    const { evaluateModuleCompletionServer } = await import("./completion.server");
    const evaluation = await evaluateModuleCompletionServer(input.userId, formattedModuleId);
    verifiedCompletionAwarded = evaluation.isVerifiedComplete;

    // Check if stage badge was unlocked
    const moduleNum = parseInt(formattedModuleId, 10);
    if (!isNaN(moduleNum) && moduleNum >= 1 && moduleNum <= 24) {
      const stageId = Math.ceil(moduleNum / 4);
      const { data: stageBadge } = await supabaseAdmin
        .from("academy_stage_badges")
        .select("badge_id")
        .eq("user_id", input.userId)
        .eq("stage_id", stageId)
        .maybeSingle();

      if (stageBadge && STAGE_BADGES[stageId]) {
        newStageBadgeAwarded = STAGE_BADGES[stageId].title;
      }
    }

    // Check total verified completions for certificate eligibility
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
  }

  return {
    attemptId: attempt.id,
    moduleId: formattedModuleId,
    score,
    totalPoints,
    percentage,
    passed,
    verifiedCompletionAwarded,
    newStageBadgeAwarded,
    certificateEligible,
    feedback,
  };
}

export interface AuthoritativeProgressData {
  userId: string;
  unverifiedProgress: Record<string, { percent: number; status: string }>;
  activityEvidenceCount: Record<string, number>;
  verifiedCompletions: Record<
    string,
    {
      moduleVersion: string;
      verifiedAt: string;
      qualifyingAttemptId: string | null;
    }
  >;
  stageAchievements: Record<number, { badgeId: string; awardedAt: string }>;
  isCertificateEligible: boolean;
}

/**
 * 3. Authoritative Progress Loader
 * Distinguishes unverified navigation progress, activity evidence, and verified completion.
 */
export async function getAuthoritativeProgressServer(
  userId: string,
): Promise<AuthoritativeProgressData> {
  const [
    { data: moduleProgressRows },
    { data: evidenceRows },
    { data: verifiedRows },
    { data: stageRows },
    { data: eligibilityRow },
  ] = await Promise.all([
    supabaseAdmin.from("academy_module_progress").select("*").eq("user_id", userId),
    supabaseAdmin.from("academy_activity_evidence").select("module_id").eq("user_id", userId),
    supabaseAdmin.from("academy_verified_completions").select("*").eq("user_id", userId),
    supabaseAdmin.from("academy_stage_achievements").select("*").eq("user_id", userId),
    supabaseAdmin
      .from("academy_certificate_eligibility")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  const unverifiedProgress: Record<string, { percent: number; status: string }> = {};
  for (const row of moduleProgressRows || []) {
    unverifiedProgress[row.module_id] = {
      percent: row.percent,
      status: row.status,
    };
  }

  const activityEvidenceCount: Record<string, number> = {};
  for (const row of evidenceRows || []) {
    activityEvidenceCount[row.module_id] = (activityEvidenceCount[row.module_id] || 0) + 1;
  }

  const verifiedCompletions: Record<
    string,
    {
      moduleVersion: string;
      verifiedAt: string;
      qualifyingAttemptId: string | null;
    }
  > = {};
  for (const row of verifiedRows || []) {
    verifiedCompletions[row.module_id] = {
      moduleVersion: row.module_version,
      verifiedAt: row.verified_at,
      qualifyingAttemptId: row.qualifying_assessment_attempt_id,
    };
  }

  const { syncAndEvaluateStageAchievementsServer } = await import("./achievements.server");
  const achievementsPayload = await syncAndEvaluateStageAchievementsServer(userId);

  const stageAchievements: Record<number, { badgeId: string; awardedAt: string }> = {};
  for (const [stageIdStr, status] of Object.entries(achievementsPayload.stages)) {
    if (status.isUnlocked && status.awardedAt) {
      stageAchievements[parseInt(stageIdStr, 10)] = {
        badgeId: status.badge.badgeId,
        awardedAt: status.awardedAt,
      };
    }
  }

  return {
    userId,
    unverifiedProgress,
    activityEvidenceCount,
    verifiedCompletions,
    stageAchievements,
    achievementsDetail: achievementsPayload,
    isCertificateEligible:
      Boolean(eligibilityRow?.all_stages_completed) || achievementsPayload.allStagesUnlocked,
  };
}
