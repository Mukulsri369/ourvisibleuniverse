import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { getOrCreateStudentProfile } from "./student-profile.server";
import { assertOfflineOwner } from "./offline-queue";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  type StudentProfile,
  applyChildSafetyRules,
  DEFAULT_ACCESSIBILITY_SETTINGS,
  DEFAULT_LEARNING_SETTINGS,
} from "./student-types";

const updateProfileInput = z.object({
  expectedUserId: z.string().uuid().optional(),
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

const syncProgressInput = z.object({
  expectedUserId: z.string().uuid().optional(),
  moduleProgress: z.record(
    z.string(),
    z.object({
      status: z.enum(["not_started", "in_progress", "completed"]),
      percent: z.number().min(0).max(100),
      timeSpentSeconds: z.number().min(0).max(2147483647).optional(),
      completedAt: z.string().optional(),
    }),
  ),
  selectedLevel: z.enum(["junior", "explorer", "astronomer"]).optional(),
});

/**
 * Retrieves or lazily initializes the authenticated user's student profile.
 * Guarantees that every registered user has a secure, email-free student public ID.
 */
export const getMyStudentProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ profile: StudentProfile; isNew: boolean }> => {
    return getOrCreateStudentProfile(context.supabase as unknown as SupabaseClient, context.userId);
  });

/**
 * Updates student profile with strict validation and child safety enforcement.
 */
export const updateMyStudentProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => updateProfileInput.parse(input))
  .handler(async ({ data, context }): Promise<{ success: boolean; profile: StudentProfile }> => {
    // The legacy generated SDK schema predates Academy tables. Keep this narrow
    // SDK boundary explicit while the validated API and domain types stay checked.
    const supabase = context.supabase as unknown as SupabaseClient;
    const { userId } = context;

    assertOfflineOwner(data.expectedUserId, userId);

    // Fetch existing profile to merge jsonb fields
    const { data: existing, error: existingError } = await supabase
      .from("student_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (existingError || !existing) throw new Error("Student profile must be loaded before it can be updated.");
    const sanitized = applyChildSafetyRules({ ...data, age_bracket: data.age_bracket ?? existing.age_bracket,
      profile_visibility: data.profile_visibility ?? existing.profile_visibility,
      guardian_consent_status: data.guardian_consent_status ?? existing.guardian_consent_status,
      accessibility_settings: { ...DEFAULT_ACCESSIBILITY_SETTINGS, ...existing.accessibility_settings, ...data.accessibility_settings },
      learning_settings: { ...DEFAULT_LEARNING_SETTINGS, ...existing.learning_settings, ...data.learning_settings } });

    const mergedAccessibility = {
      ...DEFAULT_ACCESSIBILITY_SETTINGS,
      ...((existing?.accessibility_settings as any) || {}),
      ...(sanitized.accessibility_settings || {}),
    };

    const mergedLearning = {
      ...DEFAULT_LEARNING_SETTINGS,
      ...((existing?.learning_settings as any) || {}),
      ...(sanitized.learning_settings || {}),
    };

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
      accessibility_settings: mergedAccessibility,
      learning_settings: mergedLearning,
    };

    if (sanitized.display_name !== undefined) updatePayload.display_name = sanitized.display_name;
    if (sanitized.certificate_name !== undefined)
      updatePayload.certificate_name = sanitized.certificate_name;
    if (sanitized.selected_level !== undefined)
      updatePayload.selected_level = sanitized.selected_level;
    if (sanitized.preferred_language !== undefined)
      updatePayload.preferred_language = sanitized.preferred_language;
    if (sanitized.age_bracket !== undefined) updatePayload.age_bracket = sanitized.age_bracket;
    if (sanitized.guardian_consent_status !== undefined) {
      updatePayload.guardian_consent_status = sanitized.guardian_consent_status;
      if (sanitized.guardian_consent_status === "guardian_consented") {
        updatePayload.guardian_consent_date = new Date().toISOString();
      }
    }
    if (sanitized.guardian_email !== undefined)
      updatePayload.guardian_email = sanitized.guardian_email;
    if (sanitized.profile_visibility !== undefined)
      updatePayload.profile_visibility = sanitized.profile_visibility;

    const { data: updated, error } = await supabase
      .from("student_profiles")
      .update(updatePayload)
      .eq("user_id", userId)
      .select()
      .single();

    if (error || !updated) {
      throw new Error(`Failed to update student profile: ${error?.message || "Unknown error"}`);
    }

    const profile: StudentProfile = {
      user_id: updated.user_id,
      student_public_id: updated.student_public_id,
      display_name: updated.display_name,
      certificate_name: updated.certificate_name,
      selected_level: updated.selected_level as StudentProfile["selected_level"],
      preferred_language: updated.preferred_language,
      age_bracket: updated.age_bracket as StudentProfile["age_bracket"],
      guardian_consent_status:
        updated.guardian_consent_status as StudentProfile["guardian_consent_status"],
      guardian_email: updated.guardian_email,
      guardian_consent_date: updated.guardian_consent_date,
      profile_visibility: updated.profile_visibility as StudentProfile["profile_visibility"],
      accessibility_settings: mergedAccessibility,
      learning_settings: mergedLearning,
      created_at: updated.created_at,
      updated_at: updated.updated_at,
    };

    return { success: true, profile };
  });

/**
 * Synchronizes account-owned unverified navigation; never promotes guest practice to official awards.
 * Preserves all previous module completions when switching learning levels.
 */
export const syncStudentProgress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => syncProgressInput.parse(input))
  .handler(async ({ data, context }): Promise<{ success: true; progress: Array<{
    module_id: string; user_id: string; status: string; percent: number;
    time_spent_seconds: number; verified_quiz_passed: boolean; completed_at: string | null;
  }> }> => {
    assertOfflineOwner(data.expectedUserId, context.userId);
    const db = supabaseAdmin as unknown as SupabaseClient;
    const { data: result, error } = await db.rpc("academy_sync_navigation", {
      p_user_id: context.userId, p_progress: data.moduleProgress, p_level: data.selectedLevel ?? null,
    });
    if (error || result?.success !== true) throw new Error("Navigation synchronization was not confirmed. Retry when connectivity is restored.");
    return result;
  });
