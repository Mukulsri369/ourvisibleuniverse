// @ts-nocheck
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { LearningLevel } from "./types";
import type { AssessmentMode } from "./assessment-types";

const startAssessmentSchema = z.object({
  moduleId: z.string().min(1).max(20),
  level: z.enum(["junior", "explorer", "astronomer"]).default("explorer"),
  mode: z.enum(["official", "practice"]).default("official"),
});

const submitAssessmentSchema = z.object({
  attemptId: z.string().min(3).max(120),
  moduleId: z.string().min(1).max(20),
  level: z.enum(["junior", "explorer", "astronomer"]).default("explorer"),
  mode: z.enum(["official", "practice"]).default("official"),
  answers: z.record(z.string(), z.union([z.number(), z.array(z.number())])),
  clientDurationSeconds: z.number().min(0).optional(),
  idempotencyKey: z.string().optional(),
});

/**
 * Starts a new assessment attempt.
 * Returns only sanitized questions (NO correct answers, NO explanations).
 */
export const startAssessmentAttempt = createServerFn({ method: "POST" })
  .inputValidator((input) => startAssessmentSchema.parse(input))
  .handler(async ({ data }) => {
    let userId = `anon_${Math.random().toString(36).substring(2, 9)}`;

    try {
      const { getRequest } = await import("@tanstack/react-start/server");
      const request = getRequest();
      const authHeader = request?.headers?.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: userData } = await supabaseAdmin.auth.getUser(token);
        if (userData?.user?.id) {
          userId = userData.user.id;
        }
      }
    } catch {
      // Unauthenticated / anonymous visitor
    }

    const { startAssessmentServer } = await import("./assessment.server");
    return startAssessmentServer({
      userId,
      moduleId: data.moduleId,
      level: data.level as LearningLevel,
      mode: data.mode as AssessmentMode,
    });
  });

/**
 * Submits candidate answers for server-side grading.
 * Enforces ownership, rate-limits, scores against canonical keys,
 * and if >= 70% in official mode, records verified completion and stage badges.
 */
export const submitAssessmentAttempt = createServerFn({ method: "POST" })
  .inputValidator((input) => submitAssessmentSchema.parse(input))
  .handler(async ({ data }) => {
    let userId = "";

    try {
      const { getRequest } = await import("@tanstack/react-start/server");
      const request = getRequest();
      const authHeader = request?.headers?.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: userData } = await supabaseAdmin.auth.getUser(token);
        if (userData?.user?.id) {
          userId = userData.user.id;
        }
      }
    } catch {
      // Unauthenticated
    }

    // Official certified module assessments require student authentication
    if (data.mode === "official" && !userId) {
      throw new Error("Student authentication required for official certified module assessments.");
    }

    if (!userId) {
      userId = `anon_${Math.random().toString(36).substring(2, 9)}`;
    }

    const { submitAssessmentAttemptServer } = await import("./assessment.server");
    return submitAssessmentAttemptServer({
      userId,
      attemptId: data.attemptId,
      moduleId: data.moduleId,
      level: data.level as LearningLevel,
      mode: data.mode as AssessmentMode,
      answers: data.answers,
      clientDurationSeconds: data.clientDurationSeconds,
      idempotencyKey: data.idempotencyKey,
    });
  });

/**
 * Helper to resolve authenticated userId strictly from request Bearer token.
 * Never trusts client-supplied userId parameters.
 */
async function resolveAuthenticatedUserId(): Promise<string> {
  try {
    const { getRequest } = await import("@tanstack/react-start/server");
    const request = getRequest();
    const authHeader = request?.headers?.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: userData } = await supabaseAdmin.auth.getUser(token);
      if (userData?.user?.id) {
        return userData.user.id;
      }
    }
  } catch {
    // Unauthenticated
  }

  return "";
}

/**
 * Checks server-authoritative eligibility for the Cosmic Explorer Final Knowledge Assessment.
 * Verifies that all 24 modules have verified completion on the backend.
 */
export const getFinalExamEligibility = createServerFn({ method: "POST" })
  .inputValidator((input: { userId?: string } = {}) => input)
  .handler(async () => {
    const userId = await resolveAuthenticatedUserId();

    if (!userId) {
      return {
        isEligible: false,
        totalVerified: 0,
        requiredTotal: 24,
        missingModules: [],
        verifiedModuleIds: [],
        courseId: "cosmic_journey",
        courseVersion: "1.0.0",
      };
    }

    const { checkFinalExamEligibilityServer } = await import("./assessment.server");
    return checkFinalExamEligibilityServer(userId);
  });

/**
 * Authoritative certificate claim verification.
 * Strictly verifies that the student has passed the final examination in the database.
 */
export const claimOfficialCertificate = createServerFn({ method: "POST" })
  .inputValidator((input: { courseVersion?: string; userId?: string } = {}) => input)
  .handler(async () => {
    const userId = await resolveAuthenticatedUserId();

    if (!userId) {
      throw new Error("Student authentication required to claim official verified certificate.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { getCertificateEligibilityStatusServer } = await import("./assessment.server");

    const { data: eligibility, error } = await supabaseAdmin
      .from("academy_certificate_eligibility")
      .select("*")
      .eq("user_id", userId)
      .eq("final_exam_passed", true)
      .maybeSingle();

    const cachedEligibility = getCertificateEligibilityStatusServer(userId);

    if ((!error && eligibility) || cachedEligibility.finalExamPassed) {
      return {
        eligible: true,
        scorePercentage:
          eligibility?.final_exam_score_pct ?? cachedEligibility.finalExamScorePct,
        eligibleAt: eligibility?.eligible_at ?? cachedEligibility.eligibleAt,
        courseId: eligibility?.course_id ?? cachedEligibility.courseId,
        courseVersion: eligibility?.course_version ?? cachedEligibility.courseVersion,
      };
    }

    throw new Error(
      "Certificate verification denied: You must complete all 24 modules and pass the Cosmic Explorer Final Knowledge Assessment (>= 80%) before an official certificate can be issued.",
    );
  });
