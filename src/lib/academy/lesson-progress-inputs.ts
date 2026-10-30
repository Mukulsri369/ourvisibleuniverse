import { z } from "zod";

export const lessonProgressInput = z
  .object({
    moduleId: z
      .string()
      .regex(/^(?:0?[1-9]|1[0-9]|2[0-4])$/)
      .transform((value) => value.padStart(2, "0")),
    lessonId: z.string().min(1).max(100),
    scrollDepthPercent: z.number().finite().min(0).max(100).transform(Math.floor),
    timeSpentSeconds: z.number().int().min(0).max(604800),
    isBookmarked: z.boolean().optional(),
  })
  .strict();
