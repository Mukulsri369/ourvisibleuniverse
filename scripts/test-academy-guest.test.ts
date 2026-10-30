import assert from "node:assert/strict";
import { test } from "node:test";
import { createIndependentAuth } from "../src/backend/auth.server";
import { database, closeDatabase } from "../src/backend/db.server";
import {
  startStoredAssessment,
  gradeStoredAssessment,
} from "../src/backend/academy-assessments.server";
assert.equal(process.env.DB_NAME, "ovu_main");
assert.equal(process.env.DB_PORT, "3307");
assert.equal(process.env.DB_HOST, "127.0.0.1");
test("library anonymous cookie sessions support practice but cannot earn official awards", async () => {
  let id = "";
  try {
    const auth = createIndependentAuth();
    const origin = process.env.BETTER_AUTH_URL!;
    const response = await auth.handler(
      new Request(origin + "/api/auth/sign-in/anonymous", {
        method: "POST",
        headers: { origin, "content-type": "application/json" },
        body: "{}",
      }),
    );
    assert.equal(response.status, 200);
    const cookie = response.headers
      .getSetCookie()
      .map((c) => c.split(";")[0])
      .join("; ");
    const session = await auth.api.getSession({ headers: new Headers({ cookie }) });
    assert.ok(session);
    id = session.user.id;
    assert.equal(session.user.emailVerified, false);
    const attempt = await startStoredAssessment(session.user, { moduleId: "01", mode: "practice" });
    await assert.rejects(() =>
      startStoredAssessment(session.user, { moduleId: "01", mode: "official" }),
    );
    const [rows]: any = await database().execute(
      "SELECT question_snapshot FROM academy_assessment_sessions WHERE id=?",
      [attempt.attemptId],
    );
    const questions =
      typeof rows[0].question_snapshot === "string"
        ? JSON.parse(rows[0].question_snapshot)
        : rows[0].question_snapshot;
    await database().execute(
      "UPDATE academy_assessment_sessions SET started_at=DATE_SUB(CURRENT_TIMESTAMP(6),INTERVAL 6 SECOND) WHERE id=?",
      [attempt.attemptId],
    );
    const result = await gradeStoredAssessment(session.user, {
      attemptId: attempt.attemptId,
      moduleId: "01",
      mode: "practice",
      answers: Object.fromEntries(questions.map((q: any) => [q.id, q.correctAnswer])),
    });
    assert.equal(result.passed, true);
    assert.equal(result.verifiedCompletionAwarded, false);
    assert.equal(result.certificateEligible, false);
    for (const table of ["academy_verified_completions", "academy_certificates", "access_passes"]) {
      const [count]: any = await database().execute(
        "SELECT COUNT(*) AS n FROM " + table + " WHERE user_id=?",
        [id],
      );
      assert.equal(Number(count[0].n), 0);
    }
  } finally {
    if (id) {
      await database().execute("DELETE FROM academy_assessment_sessions WHERE user_id=?", [id]);
      await database().execute("DELETE FROM auth_user WHERE id=?", [id]);
    }
    await closeDatabase();
  }
});
