import assert from "node:assert/strict";
import { before, after, test } from "node:test";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { createClient } from "@supabase/supabase-js";
import { academyPostgresFetch } from "./helpers/academy-postgres-rest.mjs";
import { profileNavigationMigrationBundle } from "./academy-migration-bundle.mjs";
import { getOrCreateStudentProfile } from "../src/lib/academy/student-profile.server";
const db = new PGlite(), user = crypto.randomUUID(), other = crypto.randomUUID(), newUser = crypto.randomUUID();
const control = { unavailable: false };
const client = createClient("http://127.0.0.1:37999", "synthetic-profile-test-key", { global: { fetch: academyPostgresFetch(() => db, control) }, auth: { persistSession: false, autoRefreshToken: false } });
before(async () => {
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
    CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid PRIMARY KEY);
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT nullif(current_setting('test.user_id',true),'')::uuid $$;
    GRANT USAGE ON SCHEMA auth TO anon,authenticated;`);
  for (const name of ["0000_create_paid_access_passes", "0003_create_academy_student_profiles", "0004_create_secure_learning_database", "0008_durable_official_assessments", "0009_atomic_module_completion", "0010_atomic_certificates", "0011_profile_navigation_boundaries"])
    await db.exec(await readFile(new URL(`../drizzle/migrations/${name}.sql`, import.meta.url), "utf8"));
  await db.query("INSERT INTO auth.users(id) VALUES($1),($2),($3)", [user, other, newUser]);
  await db.query("INSERT INTO student_profiles(user_id,student_public_id,profile_visibility,guardian_email) VALUES($1,'STU-PRIVATE-CONTACT','public','guardian@example.invalid')", [user]);
});
after(async () => { await db.close(); });
async function sync(progress: object, level: string | null = null) {
  return (await db.query<{ result: any }>("SELECT public.academy_sync_navigation($1,$2,$3) AS result", [user, JSON.stringify(progress), level])).rows[0].result;
}
test("public visibility does not expose raw profile contacts to anonymous or unrelated users", async () => {
  for (const role of ["anon", "authenticated"]) {
    await db.query("SELECT set_config('test.user_id',$1,false)", [other]);
    await db.exec(`SET ROLE ${role}`);
    try { assert.equal((await db.query("SELECT * FROM student_profiles")).rows.length, 0); }
    finally { await db.exec("RESET ROLE"); }
  }
  await db.query("SELECT set_config('test.user_id',$1,false)", [user]);
  await db.exec("SET ROLE authenticated");
  try { assert.equal((await db.query("SELECT guardian_email FROM student_profiles")).rows.length, 1); }
  finally { await db.exec("RESET ROLE"); }
});
test("authenticated clients cannot forge authoritative progress or invoke service synchronization", async () => {
  await db.exec("SET ROLE authenticated");
  try {
    await assert.rejects(() => db.query("INSERT INTO academy_module_progress(user_id,module_id,verified_quiz_passed) VALUES($1,'01',true)", [user]), /permission denied/);
    await assert.rejects(() => db.query("UPDATE academy_module_progress SET verified_quiz_passed=true"), /permission denied/);
    await assert.rejects(() => sync({}), /permission denied/);
  } finally { await db.exec("RESET ROLE"); }
});
test("navigation is monotonic but cannot award official completion, badges, certificates or access", async () => {
  await sync({ "1": { status: "completed", percent: 100, timeSpentSeconds: 30 } });
  const result = await sync({ "01": { status: "not_started", percent: 0, timeSpentSeconds: 1 } });
  assert.equal(result.success, true);
  assert.equal(result.progress[0].percent, 100);
  assert.equal(result.progress[0].time_spent_seconds, 30);
  assert.equal(result.progress[0].verified_quiz_passed, false);
  for (const table of ["academy_verified_completions", "academy_stage_badges", "academy_certificates", "access_passes"])
    assert.equal((await db.query(`SELECT * FROM ${table}`)).rows.length, 0);
});
test("old navigation cannot downgrade canonical completion or change its award date", async () => {
  await db.query("INSERT INTO academy_verified_completions(user_id,module_id,idempotency_key,verified_at) VALUES($1,'01','profile-navigation-fixture','2026-01-01T00:00:00Z')", [user]);
  const result = await sync({ "01": { status: "in_progress", percent: 5, timeSpentSeconds: 2, completedAt: "2099-01-01" } });
  assert.equal(result.progress[0].percent, 100);
  assert.equal(result.progress[0].status, "completed");
  assert.equal(result.progress[0].verified_quiz_passed, true);
  assert.equal(new Date(result.progress[0].completed_at).toISOString(), "2026-01-01T00:00:00.000Z");
});
test("invalid batches roll back navigation and profile changes together", async () => {
  await assert.rejects(() => sync({ "02": { status: "in_progress", percent: 50 }, "03": { percent: 30 } }, "junior"), /Invalid navigation/);
  assert.equal((await db.query("SELECT * FROM academy_module_progress WHERE module_id='02'")).rows.length, 0);
  assert.equal((await db.query("SELECT selected_level FROM student_profiles WHERE user_id=$1", [user])).rows[0].selected_level, "explorer");
  const result = await sync({ "010": { status: "completed", percent: 100 }, "00": { status: "completed", percent: 100 }, "25": { status: "completed", percent: 100 } });
  assert.equal(result.progress.length, 1);
});
test("concurrent profile initialization returns the same committed public ID without overwriting an existing profile", async () => {
  const results = await Promise.all(Array.from({ length: 4 }, () => getOrCreateStudentProfile(client, newUser)));
  assert.equal(new Set(results.map(result => result.profile.student_public_id)).size, 1);
  assert.equal(results.filter(result => result.isNew).length, 1);
  assert.equal((await db.query("SELECT * FROM student_profiles WHERE user_id=$1", [newUser])).rows.length, 1);
  assert.equal((await getOrCreateStudentProfile(client, user)).profile.guardian_email, "guardian@example.invalid");
});
test("profile storage failure throws instead of reporting an invented persisted student identity", async () => {
  control.unavailable = true;
  try { await assert.rejects(() => getOrCreateStudentProfile(client, other), /storage is unavailable/); }
  finally { control.unavailable = false; }
  assert.equal((await db.query("SELECT * FROM student_profiles WHERE user_id=$1", [other])).rows.length, 0);
});
test("guarded profile migration repeats safely and rolls back accidental record changes", async () => {
  const bundle = await profileNavigationMigrationBundle();
  await db.exec(bundle);
  await db.exec(bundle);
  const bad = bundle.replace("DO $after$ BEGIN", "DELETE FROM public.student_profiles;\nDO $after$ BEGIN");
  await assert.rejects(() => db.exec(bad), /records changed/);
  await db.exec("ROLLBACK");
  assert.equal((await db.query("SELECT * FROM student_profiles")).rows.length, 2);
});
