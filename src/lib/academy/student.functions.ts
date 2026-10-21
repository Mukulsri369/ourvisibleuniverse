// @ts-nocheck
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  type StudentProfile,
  generateStudentPublicId,
  applyChildSafetyRules,
  DEFAULT_ACCESSIBILITY_SETTINGS,
  DEFAULT_LEARNING_SETTINGS,
} from "./student-types";

const updateProfileInput = z.object({
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
  moduleProgress: z.record(
    z.string(),
    z.object({
      status: z.enum(["not_started", "in_progress", "completed"]),
      percent: z.number().min(0).max(100),
      timeSpentSeconds: z.number().optional(),
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
    const { supabase, userId } = context;

    try {
      const { data, error } = await supabase
        .from("student_profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.warn("Could not query student_profiles table:", error.message);
      }

      if (data) {
        const profile: StudentProfile = {
          user_id: data.user_id,
          student_public_id: data.student_public_id,
          display_name: data.display_name,
          certificate_name: data.certificate_name,
          selected_level: data.selected_level as StudentProfile["selected_level"],
          preferred_language: data.preferred_language,
          age_bracket: data.age_bracket as StudentProfile["age_bracket"],
          guardian_consent_status:
            data.guardian_consent_status as StudentProfile["guardian_consent_status"],
          guardian_email: data.guardian_email,
          guardian_consent_date: data.guardian_consent_date,
          profile_visibility: data.profile_visibility as StudentProfile["profile_visibility"],
          accessibility_settings: {
            ...DEFAULT_ACCESSIBILITY_SETTINGS,
            ...((data.accessibility_settings as any) || {}),
          },
          learning_settings: {
            ...DEFAULT_LEARNING_SETTINGS,
            ...((data.learning_settings as any) || {}),
          },
          created_at: data.created_at,
          updated_at: data.updated_at,
        };
        return { profile, isNew: false };
      }

      // Profile does not exist yet. Initialize default profile.
      const newPublicId = generateStudentPublicId();
      const initialProfileData = {
        user_id: userId,
        student_public_id: newPublicId,
        display_name: "Cosmic Explorer",
        certificate_name: "Cosmic Explorer",
        selected_level: "explorer" as const,
        preferred_language: "en",
        age_bracket: "13_to_17" as const,
        guardian_consent_status: "not_required" as const,
        guardian_email: null,
        guardian_consent_date: null,
        profile_visibility: "private" as const,
        accessibility_settings: DEFAULT_ACCESSIBILITY_SETTINGS,
        learning_settings: DEFAULT_LEARNING_SETTINGS,
      };

      const { data: created, error: insertError } = await supabase
        .from("student_profiles")
        .insert(initialProfileData)
        .select()
        .single();

      if (insertError) {
        console.warn("Failed to insert student_profiles, returning fallback:", insertError.message);
        // Fallback for transient DB states
        return {
          profile: {
            ...initialProfileData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          isNew: true,
        };
      }

      return {
        profile: {
          user_id: created.user_id,
          student_public_id: created.student_public_id,
          display_name: created.display_name,
          certificate_name: created.certificate_name,
          selected_level: created.selected_level as StudentProfile["selected_level"],
          preferred_language: created.preferred_language,
          age_bracket: created.age_bracket as StudentProfile["age_bracket"],
          guardian_consent_status:
            created.guardian_consent_status as StudentProfile["guardian_consent_status"],
          guardian_email: created.guardian_email,
          guardian_consent_date: created.guardian_consent_date,
          profile_visibility: created.profile_visibility as StudentProfile["profile_visibility"],
          accessibility_settings: {
            ...DEFAULT_ACCESSIBILITY_SETTINGS,
            ...((created.accessibility_settings as any) || {}),
          },
          learning_settings: {
            ...DEFAULT_LEARNING_SETTINGS,
            ...((created.learning_settings as any) || {}),
          },
          created_at: created.created_at,
          updated_at: created.updated_at,
        },
        isNew: true,
      };
    } catch (err) {
      console.error("Error in getMyStudentProfile:", err);
      // Return safe client profile fallback
      return {
        profile: {
          user_id: userId,
          student_public_id: generateStudentPublicId(),
          display_name: "Cosmic Explorer",
          certificate_name: "Cosmic Explorer",
          selected_level: "explorer",
          preferred_language: "en",
          age_bracket: "13_to_17",
          guardian_consent_status: "not_required",
          guardian_email: null,
          guardian_consent_date: null,
          profile_visibility: "private",
          accessibility_settings: DEFAULT_ACCESSIBILITY_SETTINGS,
          learning_settings: DEFAULT_LEARNING_SETTINGS,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        isNew: true,
      };
    }
  });

/**
 * Updates student profile with strict validation and child safety enforcement.
 */
export const updateMyStudentProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => updateProfileInput.parse(input))
  .handler(async ({ data, context }): Promise<{ success: boolean; profile: StudentProfile }> => {
    const { supabase, userId } = context;

    // Apply Child Safety Rules (forces private profile for <13, sanitizes PII/emails)
    const sanitized = applyChildSafetyRules(data);

    // Fetch existing profile to merge jsonb fields
    const { data: existing } = await supabase
      .from("student_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

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
 * Synchronizes local guest progress with the database profile upon login/registration.
 * Preserves all previous module completions when switching learning levels.
 */
export const syncStudentProgress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => syncProgressInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    try {
      // 1. If level is provided, optionally update student profile selected_level
      if (data.selectedLevel) {
        await supabase
          .from("student_profiles")
          .update({
            selected_level: data.selectedLevel,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);
      }

      // 2. Upsert module progress records
      const moduleEntries = Object.entries(data.moduleProgress);
      for (const [moduleId, info] of moduleEntries) {
        // Module id must be 2 digits e.g. "01"
        const formattedId = moduleId.padStart(2, "0");
        if (!/^[0-2][0-9]$/.test(formattedId)) continue;

        await supabase.from("academy_module_progress").upsert(
          {
            user_id: userId,
            module_id: formattedId,
            status: info.status,
            percent: info.percent,
            time_spent_seconds: info.timeSpentSeconds || 0,
            completed_at:
              info.status === "completed" ? info.completedAt || new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,module_id" },
        );
      }

      // 3. Fetch current all module progresses for user
      const { data: currentProgress } = await supabase
        .from("academy_module_progress")
        .select("*")
        .eq("user_id", userId);

      return {
        success: true,
        progress: currentProgress || [],
      };
    } catch (err) {
      console.error("Failed to sync student progress:", err);
      return { success: false, error: String(err) };
    }
  });
