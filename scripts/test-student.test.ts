import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test, after } from "node:test";
import { database, closeDatabase } from "../src/backend/db.server";
import {
  getStudentProfile,
  updateStudentProfile,
  syncGuestProgress,
} from "../src/backend/student.server";
import type { Principal } from "../src/backend/authorization.server";

assert.equal(process.env.DB_HOST, "127.0.0.1");
assert.equal(process.env.DB_PORT, "3307");
assert.equal(process.env.DB_NAME, "ovu_main");
const users: string[] = [];
async function user(): Promise<Principal> {
  const id = randomUUID();
  users.push(id);
  const email = id + "@example.test";
  await database().execute(
    "INSERT INTO auth_user(id,name,email,emailVerified) VALUES(?,?,?,true)",
    [id, "Synthetic Student Test", email],
  );
  return { id, email, emailVerified: true };
}
after(async () => {
  for (const id of users) await database().execute("DELETE FROM auth_user WHERE id=?", [id]);
  await closeDatabase();
});

test("student creation is concurrency-safe and updates are restricted to the session identity", async () => {
  const one = await user(),
    two = await user();
  const results = await Promise.all(Array.from({ length: 12 }, () => getStudentProfile(one)));
  assert.equal(new Set(results.map((r) => r.profile.student_public_id)).size, 1);
  assert.equal(results.filter((r) => r.isNew).length, 1);
  assert.match(results[0].profile.student_public_id, /^STU-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{8}$/);
  const second = await getStudentProfile(two);
  const changed = await updateStudentProfile(one, {
    user_id: two.id,
    display_name: "Changed Explorer",
  });
  assert.equal(changed.profile.user_id, one.id);
  assert.equal(changed.profile.display_name, "Changed Explorer");
  assert.equal((await getStudentProfile(two)).profile.display_name, second.profile.display_name);
  await assert.rejects(async () => getStudentProfile({ ...one, emailVerified: false }), /Verified/);
});

test("stored child privacy and preference JSON survive partial updates without leaking public identity data", async () => {
  const actor = await user();
  await updateStudentProfile(actor, {
    age_bracket: "under_13",
    display_name: "Explorer private@example.test",
    profile_visibility: "public",
    accessibility_settings: { highContrast: true },
  });
  const changed = await updateStudentProfile(actor, {
    profile_visibility: "public",
    learning_settings: { dailyGoalMinutes: 25 },
  });
  assert.equal(changed.profile.profile_visibility, "private");
  assert.equal(changed.profile.guardian_consent_status, "pending_guardian");
  assert.equal(changed.profile.display_name.includes("@"), false);
  assert.equal(changed.profile.accessibility_settings.highContrast, true);
  assert.equal(changed.profile.accessibility_settings.screenReaderFriendly, false);
  assert.equal(changed.profile.learning_settings.dailyGoalMinutes, 25);
});

test("guest sync is persistent and monotonic but never creates official completions or entitlements", async () => {
  const actor = await user();
  await syncGuestProgress(actor, {
    moduleProgress: {
      "1": { status: "completed", percent: 100, timeSpentSeconds: 20, verified_quiz_passed: true },
    },
  });
  const result = await syncGuestProgress(actor, {
    moduleProgress: { "01": { status: "not_started", percent: 0, timeSpentSeconds: 0 } },
  });
  assert.equal(result.progress[0].percent, 100);
  assert.equal(result.progress[0].status, "completed");
  assert.equal(result.progress[0].verified_quiz_passed, false);
  assert.equal(result.progress[0].time_spent_seconds, 20);
  for (const table of ["academy_verified_completions", "academy_certificates", "access_passes"]) {
    const [rows]: any = await database().execute(
      `SELECT COUNT(*) AS n FROM ${table} WHERE user_id=?`,
      [actor.id],
    );
    assert.equal(Number(rows[0].n), 0);
  }
  await assert.rejects(async () =>
    syncGuestProgress(actor, { moduleProgress: { "25": { status: "completed", percent: 100 } } }),
  );
  await assert.rejects(async () =>
    syncGuestProgress(actor, {
      moduleProgress: {
        "02": { status: "completed", percent: 100 },
        "03": { status: "completed", percent: 100, completedAt: "invalid-date" },
      },
    }),
  );
  const [rows]: any = await database().execute(
    "SELECT module_id FROM academy_module_progress WHERE user_id=?",
    [actor.id],
  );
  assert.deepEqual(
    rows.map((r: any) => r.module_id),
    ["01"],
  );
});
