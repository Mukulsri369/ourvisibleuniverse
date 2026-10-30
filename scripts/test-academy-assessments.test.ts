import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, test } from "node:test";
import { database, closeDatabase } from "../src/backend/db.server";
import {
  startStoredAssessment,
  gradeStoredAssessment,
} from "../src/backend/academy-assessments.server";
import { FINAL_EXAM_BLUEPRINT } from "../src/lib/academy/assessment-types";
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
    [id, "Synthetic Assessment Fixture", email],
  );
  return { id, email, emailVerified: true };
}
async function answers(id: string) {
  const [rows]: any = await database().execute(
    "SELECT question_snapshot FROM academy_assessment_sessions WHERE id=?",
    [id],
  );
  const questions =
    typeof rows[0].question_snapshot === "string"
      ? JSON.parse(rows[0].question_snapshot)
      : rows[0].question_snapshot;
  return Object.fromEntries(questions.map((q: any) => [q.id, q.correctAnswer]));
}
async function elapsed(id: string) {
  await database().execute(
    `UPDATE academy_assessment_sessions
    SET started_at=DATE_SUB(CURRENT_TIMESTAMP(6),INTERVAL 6 SECOND) WHERE id=?`,
    [id],
  );
}
after(async () => {
  for (const id of users) {
    await database().execute("DELETE FROM academy_assessment_sessions WHERE user_id=?", [id]);
    await database().execute("DELETE FROM auth_user WHERE id=?", [id]);
  }
  await closeDatabase();
});

test("server-issued snapshots cover all modules/levels without exposing answers and survive reconnect", async () => {
  const actor = await user();
  let first: any;
  for (const level of ["junior", "explorer", "astronomer"] as const) {
    for (let n = 1; n <= 24; n++) {
      const attempt = await startStoredAssessment(actor, {
        moduleId: String(n),
        level,
        mode: "practice",
      });
      first ??= attempt;
      assert.equal(attempt.moduleId, String(n).padStart(2, "0"));
      assert.ok(attempt.questions.length > 0);
      assert.equal(attempt.totalQuestions, attempt.questions.length);
      for (const question of attempt.questions) {
        assert.equal(Object.hasOwn(question, "correctAnswer"), false);
        assert.equal(Object.hasOwn(question, "explanation"), false);
        assert.ok(question.options.length > 1);
      }
    }
  }
  const correct = await answers(first.attemptId);
  await elapsed(first.attemptId);
  await closeDatabase();
  const input = {
    attemptId: first.attemptId,
    moduleId: first.moduleId,
    level: first.level,
    mode: first.mode,
    answers: correct,
    idempotencyKey: randomUUID(),
  };
  const results = await Promise.all(
    Array.from({ length: 10 }, () => gradeStoredAssessment(actor, input)),
  );
  assert.equal(results[0].percentage, 100);
  for (const result of results) assert.deepEqual(result, results[0]);
  assert.equal(results[0].verifiedCompletionAwarded, false);
  assert.equal(results[0].certificateEligible, false);
  const [records]: any = await database().execute(
    "SELECT assessment_id FROM academy_assessment_attempts WHERE user_id=?",
    [actor.id],
  );
  assert.deepEqual(
    records.map((r: any) => r.assessment_id),
    ["practice_quiz_module_01"],
  );
});

test("ownership, issued metadata, server duration, expiry and replay identities are enforced", async () => {
  const actor = await user(),
    other = await user();
  const start = await startStoredAssessment(actor, { moduleId: "01" });
  const correct = await answers(start.attemptId);
  const input = { attemptId: start.attemptId, moduleId: "01", answers: correct };
  await assert.rejects(() => gradeStoredAssessment(other, input), /does not match/);
  await assert.rejects(
    () => gradeStoredAssessment(actor, { ...input, moduleId: "02" }),
    /does not match/,
  );
  await assert.rejects(
    () => gradeStoredAssessment(actor, { ...input, level: "junior" }),
    /does not match/,
  );
  await assert.rejects(
    () => gradeStoredAssessment(actor, { ...input, mode: "practice" }),
    /does not match/,
  );
  await assert.rejects(
    () => gradeStoredAssessment(actor, { ...input, answers: { invented: 0 } }),
    /not assigned/,
  );
  await assert.rejects(
    () => gradeStoredAssessment(actor, { ...input, clientDurationSeconds: 500 }),
    /too soon/,
  );
  await elapsed(start.attemptId);
  const graded = await gradeStoredAssessment(actor, input);
  assert.equal(graded.passed, true);
  await assert.rejects(() => gradeStoredAssessment(actor, { ...input, answers: {} }), /conflicts/);
  await assert.rejects(
    () => gradeStoredAssessment(actor, { ...input, idempotencyKey: "another" }),
    /conflicts/,
  );
  const expired = await startStoredAssessment(actor, { moduleId: "02" });
  await database().execute(
    `UPDATE academy_assessment_sessions
    SET started_at=DATE_SUB(CURRENT_TIMESTAMP(6),INTERVAL 3 HOUR),
    expires_at=DATE_SUB(CURRENT_TIMESTAMP(6),INTERVAL 1 HOUR) WHERE id=?`,
    [expired.attemptId],
  );
  await assert.rejects(
    () =>
      gradeStoredAssessment(actor, { attemptId: expired.attemptId, moduleId: "02", answers: {} }),
    /expired/,
  );
  await assert.rejects(() => startStoredAssessment(null, { moduleId: "01" }));
  await assert.rejects(() => startStoredAssessment(actor, { moduleId: "25" }));
  await assert.rejects(() => startStoredAssessment(actor, { moduleId: "01", userId: other.id }));
  await database().execute("UPDATE auth_user SET emailVerified=false WHERE id=?", [actor.id]);
  await assert.rejects(() => startStoredAssessment(actor, { moduleId: "01" }));
});

test("official final exam requires 24 database-verified modules and preserves the 20-question blueprint", async () => {
  const actor = await user();
  await assert.rejects(() => startStoredAssessment(actor, { moduleId: "exam" }), /24 verified/);
  const practice = await startStoredAssessment(actor, { moduleId: "exam", mode: "practice" });
  assert.equal(practice.questions.length, 20);
  for (let n = 1; n <= 24; n++) {
    await database().execute(
      `INSERT INTO academy_verified_completions
      (user_id,module_id,idempotency_key) VALUES(?,?,?)`,
      [actor.id, String(n).padStart(2, "0"), randomUUID()],
    );
  }
  const attempt = await startStoredAssessment(actor, { moduleId: "24-capstone" });
  assert.equal(attempt.moduleId, "exam");
  for (const [stage, expected] of Object.entries(FINAL_EXAM_BLUEPRINT.stageDistribution)) {
    assert.equal(attempt.questions.filter((q) => q.stageId === Number(stage)).length, expected);
  }
  const input = {
    attemptId: attempt.attemptId,
    moduleId: "exam",
    answers: await answers(attempt.attemptId),
  };
  await elapsed(attempt.attemptId);
  await database().execute(
    "DELETE FROM academy_verified_completions WHERE user_id=? AND module_id='24'",
    [actor.id],
  );
  await assert.rejects(() => gradeStoredAssessment(actor, input), /24 verified/);
  const [attempts]: any = await database().execute(
    "SELECT id FROM academy_assessment_attempts WHERE user_id=?",
    [actor.id],
  );
  assert.equal(attempts.length, 0);
});
