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
import { requireCertificateSigningSecret } from "./certificate-signing.server";

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
  return crypto.createHmac("sha256", requireCertificateSigningSecret()).update(payload).digest("hex");
}

export interface ActivityEvidenceInput {
  userId: string;
  moduleId: string;
  activityType: string;
  evidencePayload: Record<string, unknown>;
  clientTimestamp: string;
  clientEventId?: string;
}

/**
 * 1. Authoritative Evidence Logging
 * Students can log telemetry from 3D simulations and labs.
 */
export async function recordActivityEvidenceServer(input: ActivityEvidenceInput) {
  const { getModuleCompletionRule } = await import("./completion-rules");
  const { recordValidatedActivityOutcomeServer } = await import("./completion.server");
  const moduleId = input.moduleId.padStart(2, "0");
  const rule = getModuleCompletionRule(moduleId);
  const accessible = Boolean(rule?.requiredActivities.some(activity => activity.accessibleAlternativeId === input.activityType));
  const result = await recordValidatedActivityOutcomeServer(input.userId, moduleId, input.activityType,
    input.evidencePayload, accessible, input.clientTimestamp, input.clientEventId);
  return { id: result.evidenceId, ...result };
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
  mode: "practice";
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
// Compatibility grading remains practice. Official assessments require a server-issued
// durable session through assessment.functions; an offline score is never an award.
export async function gradeAssessmentAndVerifyServer(input: SubmitAssessmentInput): Promise<GradedAssessmentResult> {
  const moduleId = input.moduleId.padStart(2, "0"), questions = MODULE_QUIZZES[moduleId] || [];
  if (!questions.length) throw new Error("No practice assessment exists for this module");
  const key = "legacy-practice:" + input.userId + ":" + (input.idempotencyKey || crypto.randomUUID());
  const loadExisting = async () => supabaseAdmin.from("academy_assessment_attempts").select("*")
    .eq("user_id", input.userId).eq("idempotency_key", key).eq("mode", "practice").maybeSingle();
  const previous = await loadExisting();
  if (previous.error) throw new Error("Practice grading storage is unavailable");
  let attempt = previous.data;
  if (!attempt) {
    const score = questions.reduce((total, question, index) => total + (input.answers[index] === getQuestionCorrectIndex(question) ? 1 : 0), 0);
    const percentage = Math.round(score / questions.length * 10000) / 100;
    const recorded = await supabaseAdmin.from("academy_assessment_attempts").insert({
      user_id: input.userId, mode: "practice", learning_level: "explorer", course_version: input.courseVersion || "1.0.0",
      assessment_id: "quiz_module_" + moduleId, assessment_version: "1.0.0", question_set_version: "1.0.0",
      assigned_question_ids: questions.map((q, index) => q.id || "q_" + index), answers_payload: input.answers,
      score, total_points: questions.length, percentage, passed: percentage >= 80,
      client_duration_seconds: input.clientDurationSeconds ?? null, idempotency_key: key,
    }).select().single();
    if (recorded.error?.code === "23505") attempt = (await loadExisting()).data;
    else if (recorded.error) throw new Error("Practice assessment was not saved. Retry when storage is available.");
    else attempt = recorded.data;
  }
  if (!attempt) throw new Error("Practice assessment was not confirmed");
  return { attemptId: attempt.id, moduleId, mode: "practice", score: attempt.score,
    totalPoints: attempt.total_points, percentage: attempt.percentage, passed: attempt.passed,
    verifiedCompletionAwarded: false, newStageBadgeAwarded: null, certificateEligible: false,
    feedback: questions.map((question, index) => ({ questionIndex: index,
      isCorrect: attempt.answers_payload?.[index] === getQuestionCorrectIndex(question),
      correctOptionIndex: getQuestionCorrectIndex(question), explanation: question.explanation || "Correct astronomical principle verified." })) };
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
    { data: moduleProgressRows, error: moduleError },
    { data: evidenceRows, error: evidenceError },
    { data: verifiedRows, error: verifiedError },
    { data: stageRows, error: stageError },
    { data: eligibilityRow, error: eligibilityError },
  ] = await Promise.all([
    supabaseAdmin.from("academy_module_progress").select("*").eq("user_id", userId),
    supabaseAdmin.from("academy_activity_evidence").select("module_id").eq("user_id", userId),
    supabaseAdmin.from("academy_verified_completions").select("*").eq("user_id", userId),
    supabaseAdmin.from("academy_stage_achievements").select("*").eq("user_id", userId),
    supabaseAdmin
      .from("academy_certificate_eligibility")
      .select("*")
      .eq("user_id", userId)
      .eq("course_id", "cosmic_journey")
      .eq("course_version", "1.0.0")
      .maybeSingle(),
  ]);

  if ([moduleError, evidenceError, verifiedError, stageError, eligibilityError].some(Boolean)) throw new Error("Authoritative learning progress is unavailable. Retry when storage is available.");

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
      achievementsPayload.allStagesUnlocked && eligibilityRow?.final_exam_passed === true && (eligibilityRow?.final_exam_score_pct ?? 0) >= 80,
  };
}
