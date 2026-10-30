import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, test } from "node:test";
import { database, closeDatabase } from "../src/backend/db.server";
import { getLessonProgress, saveLessonProgress } from "../src/backend/academy-progress.server";
import type { Principal } from "../src/backend/authorization.server";

assert.equal(process.env.DB_HOST, "127.0.0.1");
assert.equal(process.env.DB_PORT, "3307");
assert.equal(process.env.DB_NAME, "ovu_main");
const users: string[] = [];
async function user(): Promise<Principal> {
  const id = randomUUID(),
    email = id + "@example.test";
  users.push(id);
  await database().execute(
    "INSERT INTO auth_user(id,name,email,emailVerified) VALUES(?,?,?,true)",
    [id, "Synthetic Academy Fixture", email],
  );
  return { id, email, emailVerified: true };
}
const reading = {
  moduleId: "01",
  lessonId: "01-core",
  scrollDepthPercent: 75,
  timeSpentSeconds: 80,
  isBookmarked: true,
};
after(async () => {
  for (const id of users) await database().execute("DELETE FROM auth_user WHERE id=?", [id]);
  await closeDatabase();
});

test("canonical curriculum includes all 24 modules, active versions and matching core lessons", async () => {
  const [rows]: any = await database().query(`SELECT m.id,m.number,m.stage_id,l.id AS lesson_id,
    l.objectives,v.minimum_quiz_score_pct FROM academy_modules m
    JOIN academy_lessons l ON l.module_id=m.id
    JOIN academy_module_versions v ON v.module_id=m.id AND v.version='1.0.0'
    WHERE m.course_id='cosmic_journey' ORDER BY m.number`);
  assert.equal(rows.length, 24);
  for (const [index, row] of rows.entries()) {
    assert.equal(row.id, String(index + 1).padStart(2, "0"));
    assert.equal(row.lesson_id, row.id + "-core");
    assert.equal(Number(row.stage_id), Math.ceil((index + 1) / 4));
    assert.equal(Number(row.minimum_quiz_score_pct), 80);
    assert.equal(
      (typeof row.objectives === "string" ? JSON.parse(row.objectives) : row.objectives).length,
      3,
    );
  }
});

test("concurrent lesson retries are monotonic, privately scoped and survive reconnect without certification", async () => {
  const actor = await user(),
    other = await user();
  await Promise.all(
    Array.from({ length: 12 }, (_, i) =>
      saveLessonProgress(actor, {
        ...reading,
        scrollDepthPercent: i * 8,
        timeSpentSeconds: i * 10,
      }),
    ),
  );
  await saveLessonProgress(actor, {
    ...reading,
    scrollDepthPercent: 2,
    timeSpentSeconds: 1,
    isBookmarked: false,
  });
  const { isBookmarked: _bookmark, ...withoutBookmark } = reading;
  await saveLessonProgress(actor, withoutBookmark);
  await closeDatabase();
  const records = await getLessonProgress(actor);
  assert.equal(records.lessons.length, 1);
  assert.equal(records.lessons[0].scroll_depth_percent, 88);
  assert.equal(records.lessons[0].time_spent_seconds, 110);
  assert.equal(records.lessons[0].is_bookmarked, false);
  assert.match(records.lessons[0].last_accessed_at, /Z$/);
  assert.deepEqual((await getLessonProgress(other)).lessons, []);
  const [progress]: any = await database().execute(
    "SELECT * FROM academy_module_progress WHERE user_id=?",
    [actor.id],
  );
  assert.equal(progress[0].percent, 88);
  assert.equal(progress[0].status, "in_progress");
  assert.equal(Boolean(progress[0].verified_quiz_passed), false);
  for (const table of ["academy_verified_completions", "academy_certificates", "access_passes"]) {
    const [rows]: any = await database().execute(
      `SELECT COUNT(*) AS n FROM ${table} WHERE user_id=?`,
      [actor.id],
    );
    assert.equal(Number(rows[0].n), 0);
  }
});

test("invalid lessons, forged identities, invalid telemetry and direct mismatched module writes are denied", async () => {
  const actor = await user();
  for (const input of [
    { ...reading, moduleId: "02" },
    { ...reading, lessonId: "missing" },
    { ...reading, userId: randomUUID() },
    { ...reading, moduleId: "25" },
    { ...reading, timeSpentSeconds: -1 },
    { ...reading, timeSpentSeconds: 0.1 },
    { ...reading, scrollDepthPercent: NaN },
    { ...reading, scrollDepthPercent: 101 },
  ])
    await assert.rejects(() => saveLessonProgress(actor, input));
  await assert.rejects(() => saveLessonProgress(null, reading));
  await assert.rejects(() => saveLessonProgress({ ...actor, emailVerified: false }, reading));
  await database().execute("UPDATE auth_user SET emailVerified=false WHERE id=?", [actor.id]);
  await assert.rejects(() => saveLessonProgress(actor, reading));
  await assert.rejects(() => getLessonProgress(actor));
  await assert.rejects(
    database().execute(
      `INSERT INTO academy_lesson_progress
    (user_id,module_id,lesson_id) VALUES(?, '02', '01-core')`,
      [actor.id],
    ),
  );
  const [rows]: any = await database().execute(
    "SELECT * FROM academy_lesson_progress WHERE user_id=?",
    [actor.id],
  );
  assert.equal(rows.length, 0);
});
