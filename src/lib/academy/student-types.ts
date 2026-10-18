import type { LearningLevel } from "./types";

export type AgeBracket = "under_13" | "13_to_17" | "18_plus";

export type GuardianConsentStatus =
  "not_required" | "pending_guardian" | "guardian_consented" | "verified_adult";

export type ProfileVisibility = "private" | "students_only" | "public";

export interface AcademyAccessibilitySettings {
  reducedMotion: boolean;
  highContrast: boolean;
  soundEffects: boolean;
  fontSize: "normal" | "large" | "extra-large";
  dyslexiaFriendlyFont: boolean;
  screenReaderFriendly: boolean;
}

export interface AcademyLearningSettings {
  autoAdvanceAudio: boolean;
  hintMode: boolean;
  voiceGuide: boolean;
  dailyGoalMinutes: number;
}

export interface StudentProfile {
  user_id: string;
  student_public_id: string; // e.g. STU-9A4B2C8D (NEVER user's email address)
  display_name: string;
  certificate_name: string;
  selected_level: LearningLevel;
  preferred_language: string;
  age_bracket: AgeBracket;
  guardian_consent_status: GuardianConsentStatus;
  guardian_email?: string | null;
  guardian_consent_date?: string | null;
  profile_visibility: ProfileVisibility;
  accessibility_settings: AcademyAccessibilitySettings;
  learning_settings: AcademyLearningSettings;
  created_at: string;
  updated_at: string;
}

export const DEFAULT_ACCESSIBILITY_SETTINGS: AcademyAccessibilitySettings = {
  reducedMotion: false,
  highContrast: false,
  soundEffects: false,
  fontSize: "normal",
  dyslexiaFriendlyFont: false,
  screenReaderFriendly: false,
};

export const DEFAULT_LEARNING_SETTINGS: AcademyLearningSettings = {
  autoAdvanceAudio: false,
  hintMode: true,
  voiceGuide: true,
  dailyGoalMinutes: 15,
};

export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English", flag: "🌐" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
  { code: "zh", name: "Chinese", nativeName: "中文", flag: "🇨🇳" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
] as const;

/**
 * Generates an astronomical student public identifier.
 * Format: STU- followed by an 8-character high-entropy alphanumeric code.
 * Email addresses MUST NEVER be used as public certificate or student IDs.
 */
export function generateStudentPublicId(): string {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // exclude easily confused chars (0, 1, I, O)
  let id = "STU-";
  for (let i = 0; i < 8; i++) {
    const rand = Math.floor(Math.random() * chars.length);
    id += chars[rand];
  }
  return id;
}

/**
 * Child Safety & Privacy Sanitizer.
 * Enforces that display names and certificate names:
 * 1. Do NOT contain email addresses
 * 2. Do NOT contain phone numbers or URLs
 * 3. Fall back to a safe default if blank or invalid
 */
export function sanitizeStudentName(
  input: string | undefined | null,
  fallback = "Cosmic Explorer",
): string {
  if (!input) return fallback;
  let cleaned = input.trim();

  // Strip email addresses
  cleaned = cleaned.replace(/[\w.-]+@[\w.-]+\.\w+/g, "");

  // Strip phone numbers / consecutive digit sequences >= 7
  cleaned = cleaned.replace(/\b\d{7,}\b/g, "");

  // Strip URLs
  cleaned = cleaned.replace(/https?:\/\/\S+/gi, "");

  // Remove leading/trailing non-alphanumeric punctuation
  cleaned = cleaned.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, "").trim();

  if (cleaned.length < 2) return fallback;
  return cleaned.slice(0, 36);
}

/**
 * Child-safety & COPPA / GDPR-K Privacy Guard.
 * - Under 13 must ALWAYS have profile_visibility = 'private'
 * - Under 13 requires guardian consent status tracked
 * - Under 18 defaults to 'private'
 */
export function applyChildSafetyRules(profile: Partial<StudentProfile>): Partial<StudentProfile> {
  const adjusted = { ...profile };

  if (adjusted.display_name) {
    adjusted.display_name = sanitizeStudentName(adjusted.display_name, "Cosmic Explorer");
  }
  if (adjusted.certificate_name) {
    adjusted.certificate_name = sanitizeStudentName(adjusted.certificate_name, "Cosmic Explorer");
  }

  if (adjusted.age_bracket === "under_13") {
    adjusted.profile_visibility = "private";
    if (!adjusted.guardian_consent_status || adjusted.guardian_consent_status === "not_required") {
      adjusted.guardian_consent_status = "pending_guardian";
    }
  } else if (adjusted.age_bracket === "13_to_17") {
    // If not explicitly set, default minor to private
    if (!adjusted.profile_visibility) {
      adjusted.profile_visibility = "private";
    }
  }

  return adjusted;
}
