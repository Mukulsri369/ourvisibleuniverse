import type { SupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_ACCESSIBILITY_SETTINGS, DEFAULT_LEARNING_SETTINGS, generateStudentPublicId, type StudentProfile } from "./student-types";

function profileFromRow(row: Record<string, any>): StudentProfile {
  return { ...row, accessibility_settings: { ...DEFAULT_ACCESSIBILITY_SETTINGS, ...row.accessibility_settings },
    learning_settings: { ...DEFAULT_LEARNING_SETTINGS, ...row.learning_settings } } as StudentProfile;
}

/** Never advertise a generated public ID until its actual row has committed. */
export async function getOrCreateStudentProfile(client: SupabaseClient, userId: string) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const existing = await client.from("student_profiles").select("*").eq("user_id", userId).maybeSingle();
    if (existing.error) throw new Error("Student profile storage is unavailable. Retry when connectivity is restored.");
    if (existing.data) return { profile: profileFromRow(existing.data), isNew: false };
    const created = await client.from("student_profiles").insert({ user_id: userId, student_public_id: generateStudentPublicId(),
      display_name: "Cosmic Explorer", certificate_name: "Cosmic Explorer", selected_level: "explorer", preferred_language: "en",
      age_bracket: "13_to_17", guardian_consent_status: "not_required", profile_visibility: "private",
      accessibility_settings: DEFAULT_ACCESSIBILITY_SETTINGS, learning_settings: DEFAULT_LEARNING_SETTINGS }).select("*").single();
    if (!created.error && created.data) return { profile: profileFromRow(created.data), isNew: true };
    if (created.error?.code !== "23505") throw new Error("Student profile could not be saved. No new public ID has been assumed persisted.");
    // Concurrent initialization or a public-ID collision: re-read the user's
    // committed row before generating another candidate. Never overwrite it.
  }
  throw new Error("Student profile initialization could not be confirmed. Please retry.");
}
