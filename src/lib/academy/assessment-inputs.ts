import { z } from "zod";

const moduleId = z
  .string()
  .regex(/^(?:0?[1-9]|1[0-9]|2[0-4]|exam|24-capstone)$/)
  .transform((value) => (value === "24-capstone" ? "exam" : value.padStart(2, "0")));
export const storedAssessmentStartInput = z
  .object({
    moduleId,
    level: z.enum(["junior", "explorer", "astronomer"]).default("explorer"),
    mode: z.enum(["official", "practice"]).default("official"),
  })
  .strict();
export const storedAssessmentSubmitInput = z
  .object({
    attemptId: z.string().uuid(),
    moduleId,
    level: z.enum(["junior", "explorer", "astronomer"]).default("explorer"),
    mode: z.enum(["official", "practice"]).default("official"),
    answers: z
      .record(
        z.string().min(1).max(120),
        z.union([
          z.number().int().min(0).max(100),
          z.array(z.number().int().min(0).max(100)).max(100),
        ]),
      )
      .refine((value) => Object.keys(value).length <= 100, "Too many answers"),
    clientDurationSeconds: z.number().finite().min(0).max(86400).optional(),
    idempotencyKey: z.string().min(1).max(120).optional(),
  })
  .strict();
