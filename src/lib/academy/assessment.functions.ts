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
  .validator((input) => startAssessmentSchema.parse(input))
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
  .validator((input) => submitAssessmentSchema.parse(input))
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
