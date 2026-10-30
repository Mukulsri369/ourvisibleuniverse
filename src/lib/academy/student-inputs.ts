import { z } from "zod";

export const updateProfileInput = z.object({
  display_name: z.string().min(2).max(40).optional(),
  certificate_name: z.string().min(2).max(40).optional(),
  selected_level: z.enum(["junior", "explorer", "astronomer"]).optional(),
  preferred_language: z.string().min(2).max(10).optional(),
  age_bracket: z.enum(["under_13", "13_to_17", "18_plus"]).optional(),
  guardian_consent_status: z
    .enum(["not_required", "pending_guardian", "guardian_consented", "verified_adult"])
    .optional(),
  guardian_email: z.string().email().nullable().optional(),
  profile_visibility: z.enum(["private", "students_only", "public"]).optional(),
  accessibility_settings: z
    .object({
      reducedMotion: z.boolean(),
      highContrast: z.boolean(),
      soundEffects: z.boolean(),
      fontSize: z.enum(["normal", "large", "extra-large"]),
      dyslexiaFriendlyFont: z.boolean(),
      screenReaderFriendly: z.boolean(),
    })
    .partial()
    .optional(),
  learning_settings: z
    .object({
      autoAdvanceAudio: z.boolean(),
      hintMode: z.boolean(),
      voiceGuide: z.boolean(),
      dailyGoalMinutes: z.number().min(5).max(120),
    })
    .partial()
    .optional(),
});

export const syncProgressInput = z
  .object({
    moduleProgress: z.record(
      z.string(),
      z.object({
        status: z.enum(["not_started", "in_progress", "completed"]),
        percent: z.number().min(0).max(100),
        timeSpentSeconds: z.number().min(0).max(315360000).optional(),
        completedAt: z.string().optional(),
      }),
    ),
    selectedLevel: z.enum(["junior", "explorer", "astronomer"]).optional(),
  })
  .superRefine((value, context) => {
    if (
      Object.keys(value.moduleProgress).length > 24 ||
      Object.keys(value.moduleProgress).some((id) => !/^0?[1-9]$|^1[0-9]$|^2[0-4]$/.test(id))
    )
      context.addIssue({ code: "custom", message: "Invalid academy module progress" });
  });
