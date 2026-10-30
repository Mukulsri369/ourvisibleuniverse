import { randomInt } from "node:crypto";
import type { PoolConnection } from "mysql2/promise";
import { transaction } from "./db.server";
import type { Principal } from "./authorization.server";
import { updateProfileInput, syncProgressInput } from "../lib/academy/student-inputs";
import {
  applyChildSafetyRules,
  DEFAULT_ACCESSIBILITY_SETTINGS,
  DEFAULT_LEARNING_SETTINGS,
  type StudentProfile,
} from "../lib/academy/student-types";

function verified(principal: Principal | null) {
  if (!principal?.emailVerified) throw new Error("Verified student account required");
  return principal;
}
function publicId() {
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  return "STU-" + Array.from({ length: 8 }, () => alphabet[randomInt(alphabet.length)]).join("");
}
function json(value: any) {
  return typeof value === "string" ? JSON.parse(value) : value;
}
function profile(row: any): StudentProfile {
  return {
    ...row,
    accessibility_settings: {
      ...DEFAULT_ACCESSIBILITY_SETTINGS,
      ...json(row.accessibility_settings),
    },
    learning_settings: { ...DEFAULT_LEARNING_SETTINGS, ...json(row.learning_settings) },
    created_at: new Date(row.created_at).toISOString(),
    updated_at: new Date(row.updated_at).toISOString(),
    guardian_consent_date: row.guardian_consent_date
      ? new Date(row.guardian_consent_date).toISOString()
      : null,
  };
}
async function load(c: PoolConnection, userId: string) {
  // Serialize first-time profile creation per identity without replacing an existing public ID.
  const [identities]: any = await c.execute(
    "SELECT id FROM auth_user WHERE id=? AND emailVerified=true FOR UPDATE",
    [userId],
  );
  if (!identities.length) throw new Error("Verified student account required");
  const [rows]: any = await c.execute("SELECT * FROM student_profiles WHERE user_id=? FOR UPDATE", [
    userId,
  ]);
  if (rows.length) return { profile: profile(rows[0]), isNew: false };
  for (let attempt = 0; ; attempt++) {
    try {
      await c.execute("INSERT INTO student_profiles(user_id,student_public_id) VALUES(?,?)", [
        userId,
        publicId(),
      ]);
      break;
    } catch (error: any) {
      if (error.code !== "ER_DUP_ENTRY" || attempt >= 2) throw error;
    }
  }
  const [created]: any = await c.execute("SELECT * FROM student_profiles WHERE user_id=?", [
    userId,
  ]);
  return { profile: profile(created[0]), isNew: true };
}

export function getStudentProfile(principal: Principal | null) {
  const actor = verified(principal);
  return transaction((c) => load(c, actor.id));
}

export function updateStudentProfile(principal: Principal | null, input: unknown) {
  const actor = verified(principal),
    changes = updateProfileInput.parse(input);
  return transaction(async (c) => {
    const existing = (await load(c, actor.id)).profile;
    // Apply privacy rules to the merged profile, including its stored age bracket.
    const merged = {
      ...existing,
      ...changes,
      accessibility_settings: {
        ...existing.accessibility_settings,
        ...changes.accessibility_settings,
      },
      learning_settings: { ...existing.learning_settings, ...changes.learning_settings },
    };
    const safe = applyChildSafetyRules(merged) as StudentProfile;
    const guardianDate =
      changes.guardian_consent_status === "guardian_consented"
        ? new Date()
        : safe.guardian_consent_date
          ? new Date(safe.guardian_consent_date)
          : null;
    await c.execute(
      `UPDATE student_profiles SET display_name=?,certificate_name=?,selected_level=?,preferred_language=?,age_bracket=?,guardian_consent_status=?,guardian_email=?,guardian_consent_date=?,profile_visibility=?,accessibility_settings=?,learning_settings=?,updated_at=CURRENT_TIMESTAMP(6) WHERE user_id=?`,
      [
        safe.display_name,
        safe.certificate_name,
        safe.selected_level,
        safe.preferred_language,
        safe.age_bracket,
        safe.guardian_consent_status,
        safe.guardian_email ?? null,
        guardianDate,
        safe.profile_visibility,
        JSON.stringify(safe.accessibility_settings),
        JSON.stringify(safe.learning_settings),
        actor.id,
      ],
    );
    return { success: true, profile: (await load(c, actor.id)).profile };
  });
}

export function syncGuestProgress(principal: Principal | null, input: unknown) {
  const actor = verified(principal),
    data = syncProgressInput.parse(input);
  return transaction(async (c) => {
    await load(c, actor.id);
    if (data.selectedLevel)
      await c.execute(
        "UPDATE student_profiles SET selected_level=?,updated_at=CURRENT_TIMESTAMP(6) WHERE user_id=?",
        [data.selectedLevel, actor.id],
      );
    for (const [moduleId, info] of Object.entries(data.moduleProgress)) {
      const id = moduleId.padStart(2, "0");
      const completed =
        info.status === "completed"
          ? info.completedAt
            ? new Date(info.completedAt)
            : new Date()
          : null;
      if (completed && !Number.isFinite(completed.getTime()))
        throw new Error("Invalid progress completion time");
      // Guest claims are progress only. They never create verified quiz completions,
      // exam eligibility, certificates or paid access, and cannot erase saved progress.
      await c.execute(
        `INSERT INTO academy_module_progress(user_id,module_id,status,percent,time_spent_seconds,completed_at) VALUES(?,?,?,?,?,?)
        ON DUPLICATE KEY UPDATE status=CASE WHEN status='completed' OR VALUES(status)='completed' THEN 'completed' WHEN status='in_progress' OR VALUES(status)='in_progress' THEN 'in_progress' ELSE 'not_started' END,percent=GREATEST(percent,VALUES(percent)),time_spent_seconds=GREATEST(time_spent_seconds,VALUES(time_spent_seconds)),completed_at=COALESCE(completed_at,VALUES(completed_at)),updated_at=CURRENT_TIMESTAMP(6)`,
        [
          actor.id,
          id,
          info.status,
          Math.round(info.percent),
          Math.floor(info.timeSpentSeconds ?? 0),
          completed,
        ],
      );
    }
    const [progress]: any = await c.execute(
      "SELECT * FROM academy_module_progress WHERE user_id=? ORDER BY module_id",
      [actor.id],
    );
    return {
      success: true,
      progress: progress.map((row: any) => ({
        ...row,
        verified_quiz_passed: Boolean(row.verified_quiz_passed),
        first_started_at: new Date(row.first_started_at).toISOString(),
        updated_at: new Date(row.updated_at).toISOString(),
        completed_at: row.completed_at ? new Date(row.completed_at).toISOString() : null,
      })),
    };
  });
}

export { load as ensureStudentProfileInTransaction };
