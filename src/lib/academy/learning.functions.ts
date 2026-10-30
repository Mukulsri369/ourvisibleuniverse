// @ts-nocheck
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireIndependentAuth } from "../../backend/session-middleware";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const activityEvidenceInput = z.object({
  moduleId: z.string().min(1).max(5),
  activityType: z.string().min(2).max(100),
  evidencePayload: z.record(z.string(), z.unknown()),
  clientTimestamp: z.string(),
});

const submitAssessmentInput = z.object({
  moduleId: z.string().min(1).max(5),
  answers: z.record(z.string(), z.number()), // coerced map: questionIndex -> selectedOptionIndex
  clientDurationSeconds: z.number().optional(),
  idempotencyKey: z.string().optional(),
});

import { lessonProgressInput } from "./lesson-progress-inputs";

/**
 * Submits interactive lab/3D simulation telemetry evidence to the server.
 */
export const recordActivityEvidence = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => activityEvidenceInput.parse(input))
  .handler(async ({ data, context }) => {
    const { recordActivityEvidenceServer } = await import("./learning.server");
    return recordActivityEvidenceServer({
      userId: context.userId,
      moduleId: data.moduleId,
      activityType: data.activityType,
      evidencePayload: data.evidencePayload,
      clientTimestamp: data.clientTimestamp,
    });
  });

/**
 * Authoritatively grades a module knowledge assessment on the server.
 * Evaluates canonical question answers on the server, creates attempt records,
 * and if >= 80%, issues verified completion and stage badges.
 */
export const submitAssessmentForGrading = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => submitAssessmentInput.parse(input))
  .handler(async ({ data, context }) => {
    const { gradeAssessmentAndVerifyServer } = await import("./learning.server");

    // Convert string keys to numbers for question indexing
    const formattedAnswers: Record<number, number> = {};
    for (const [k, v] of Object.entries(data.answers)) {
      formattedAnswers[parseInt(k, 10)] = v;
    }

    return gradeAssessmentAndVerifyServer({
      userId: context.userId,
      moduleId: data.moduleId,
      answers: formattedAnswers,
      clientDurationSeconds: data.clientDurationSeconds,
      idempotencyKey: data.idempotencyKey,
    });
  });

/**
 * Retrieves the student's authoritative learning state, cleanly separating:
 * A. Unverified navigation progress
 * B. Submitted activity evidence
 * C. Authoritative verified completions and stage badges
 */
export const getAuthoritativeProgress = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getAuthoritativeProgressServer } = await import("./learning.server");
    return getAuthoritativeProgressServer(context.userId);
  });

/**
 * Saves unverified lesson reading position and time spent.
 */
export const recordLessonProgress = createServerFn({ method: "POST" })
  .middleware([requireIndependentAuth])
  .inputValidator((input) => lessonProgressInput.parse(input))
  .handler(async ({ data, context }) => {
    const { saveLessonProgress } = await import("../../backend/academy-progress.server");
    return saveLessonProgress(context.principal, data);
  });
