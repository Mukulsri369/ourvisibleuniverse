import assert from "node:assert/strict";
import { before, after, test } from "node:test";
import { readFile, mkdtemp, realpath, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve, dirname, basename } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { PGlite } from "@electric-sql/pglite";
import { academyPostgresFetch } from "./helpers/academy-postgres-rest.mjs";
import { durableAcademyMigrationBundle, atomicCompletionMigrationBundle } from "./academy-migration-bundle.mjs";

// Production branch, real PostgreSQL, synthetic users, no network or customer keys.
process.env.NODE_ENV = "production";
process.env.SUPABASE_URL = "http://127.0.0.1:37999";
process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_secret_synthetic_postgres_test_only";
let db: PGlite;
const transportControl = { unavailable: false, calls: 0 };
const priorFetch = globalThis.fetch;
globalThis.fetch = academyPostgresFetch(() => db, transportControl);
const { startAssessmentServer, submitAssessmentAttemptServer } = await import("../src/lib/academy/assessment.server");
const { FINAL_EXAM_QUESTION_BANK } = await import("../src/lib/academy/final-exam-bank.server");
const correctAnswers = (questions: { id: string }[], correctCount = 20) => Object.fromEntries(questions.map((q, index) => {
  const canonical = FINAL_EXAM_QUESTION_BANK.find(item => item.id === q.id)!;
  return [q.id, index < correctCount ? canonical.correctAnswer : -1];
}));

if (process.argv.includes("--restart-submit")) {
  const index = process.argv.indexOf("--restart-submit"), [directory, userId, attemptId, serializedAnswers] = process.argv.slice(index + 1);
  db = new PGlite(directory);
  try {
    const result = await submitAssessmentAttemptServer({ userId, attemptId, moduleId: "exam", level: "explorer", mode: "official", answers: JSON.parse(serializedAnswers), clientDurationSeconds: 60 });
    console.log(JSON.stringify({ attemptId: result.attemptId, percentage: result.percentage, totalPoints: result.totalPoints, passed: result.passed }));
  } finally { await db.close(); globalThis.fetch = priorFetch; }
} else {
  const user = crypto.randomUUID(), other = crypto.randomUUID();
  let directory: string, session: Awaited<ReturnType<typeof startAssessmentServer>>, answers: Record<string, number | number[]>;
  let originalAttemptId: string;
  const loadSql = (name: string) => readFile(new URL(`../drizzle/migrations/${name}.sql`, import.meta.url), "utf8");
  before(async () => {
    directory = await mkdtemp(resolve(tmpdir(), "ovu-academy-"));
    db = new PGlite(directory);
    await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
      CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid PRIMARY KEY);
      CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT nullif(current_setting('test.user_id',true),'')::uuid $$;`);
    for (const migration of ["0000_create_paid_access_passes", "0003_create_academy_student_profiles", "0004_create_secure_learning_database", "0008_durable_official_assessments", "0009_atomic_module_completion"]) await db.exec(await loadSql(migration));
    await db.query("INSERT INTO auth.users(id) VALUES($1),($2)", [user, other]);
    await db.query("INSERT INTO public.academy_verified_completions(user_id,module_id,idempotency_key) SELECT $1,id,'fixture:'||id FROM public.academy_modules", [user]);
  });
  after(async () => {
    await db.close(); globalThis.fetch = priorFetch;
    const expectedParent = await realpath(tmpdir()), resolved = await realpath(directory);
    if (dirname(resolved).toLowerCase() !== expectedParent.toLowerCase() || !basename(resolved).startsWith("ovu-academy-")) throw new Error("Refusing unexpected test cleanup target");
    await rm(resolved, { recursive: true, force: true });
  });

  test("official start persists assigned canonical questions and returns no grading answers", async () => {
    await db.exec(await loadSql("0008_durable_official_assessments"));
    session = await startAssessmentServer({ userId: user, moduleId: "exam", level: "explorer", mode: "official" });
    assert.equal(session.questions.length, 20);
    assert.ok(session.questions.every(q => !("correctAnswer" in q) && !("explanation" in q)));
    const rows = (await db.query<{ question_snapshot: unknown[] }>("SELECT question_snapshot FROM public.academy_assessment_sessions WHERE id=$1", [session.attemptId])).rows;
    assert.equal(rows[0].question_snapshot.length, 20);
    answers = correctAnswers(session.questions, 16);
  });

  test("client-reported elapsed time cannot bypass the server's minimum duration", async () => {
    await assert.rejects(() => submitAssessmentAttemptServer({ userId: user, attemptId: session.attemptId, moduleId: "exam", level: "explorer", mode: "official", answers, clientDurationSeconds: 60 }), /not confirmed/);
    assert.equal((await db.query<{ count: number }>("SELECT count(*)::int AS count FROM public.academy_assessment_attempts")).rows[0].count, 0);
    await db.query("UPDATE public.academy_assessment_sessions SET started_at=now()-interval '10 seconds' WHERE id=$1", [session.attemptId]);
  });

  test("a new Node process recovers the session and grades exactly the assigned 20 questions", async () => {
    await db.close();
    try {
      const child = await promisify(execFile)(process.execPath, ["--import", "tsx", "scripts/academy-durable-postgres.test.ts", "--restart-submit", directory, user, session.attemptId, JSON.stringify(answers)], { cwd: process.cwd(), windowsHide: true, timeout: 60_000 });
      const result = JSON.parse(child.stdout.trim());
      assert.equal(result.percentage, 80); assert.equal(result.totalPoints, 20); assert.equal(result.passed, true);
      originalAttemptId = result.attemptId;
    } finally { db = new PGlite(directory); }
    assert.equal((await db.query<{ final_exam_passed: boolean }>("SELECT final_exam_passed FROM public.academy_certificate_eligibility WHERE user_id=$1", [user])).rows[0].final_exam_passed, true);
    assert.equal((await db.query<{ count: number }>("SELECT count(*)::int AS count FROM public.academy_certificates")).rows[0].count, 0);
  });

  test("identical retries return the original result and changed answers cannot replace it", async () => {
    const retry = await submitAssessmentAttemptServer({ userId: user, attemptId: session.attemptId, moduleId: "exam", level: "explorer", mode: "official", answers, clientDurationSeconds: 60, idempotencyKey: "different-browser-key" });
    assert.equal(retry.attemptId, originalAttemptId); assert.equal(retry.percentage, 80);
    await assert.rejects(() => submitAssessmentAttemptServer({ userId: user, attemptId: session.attemptId, moduleId: "exam", level: "explorer", mode: "official", answers: correctAnswers(session.questions, 20), clientDurationSeconds: 60 }), /not confirmed/);
    assert.equal((await db.query<{ count: number }>("SELECT count(*)::int AS count FROM public.academy_assessment_attempts")).rows[0].count, 1);
  });

  test("ownership, level and fabricated session identities are enforced before grading", async () => {
    for (const input of [{ userId: other, level: "explorer" as const, attemptId: session.attemptId }, { userId: user, level: "junior" as const, attemptId: session.attemptId }, { userId: user, level: "explorer" as const, attemptId: "att_fabricated" }]) {
      await assert.rejects(() => submitAssessmentAttemptServer({ ...input, moduleId: "exam", mode: "official", answers, clientDurationSeconds: 60 }), /ownership mismatch/);
    }
  });

  test("a storage outage cannot fall back to a successful official start or result", async () => {
    transportControl.unavailable = true;
    try {
      await assert.rejects(() => startAssessmentServer({ userId: user, moduleId: "01", level: "explorer", mode: "official" }), /could not be saved/);
      await assert.rejects(() => submitAssessmentAttemptServer({ userId: user, attemptId: session.attemptId, moduleId: "exam", level: "explorer", mode: "official", answers, clientDurationSeconds: 60 }), /storage is unavailable/);
    } finally { transportControl.unavailable = false; }
  });

  test("neither authenticated website nor delegated clients can read canonical snapshots or grade directly", async () => {
    for (const role of ["anon", "authenticated"]) {
      await db.exec(`SET ROLE ${role}`);
      try {
        await assert.rejects(() => db.query("SELECT * FROM public.academy_assessment_sessions"), /permission denied/);
        await assert.rejects(() => db.query("SELECT public.academy_commit_official_attempt($1,$2,'{}',NULL)", [session.attemptId, user]), /permission denied/);
      } finally { await db.exec("RESET ROLE"); }
    }
  });

  test("SQL independently rejects a forged grade and rolls back eligibility failures", async () => {
    const next = await startAssessmentServer({ userId: user, moduleId: "exam", level: "explorer", mode: "official" });
    const nextAnswers = correctAnswers(next.questions, 20);
    await db.query("UPDATE public.academy_assessment_sessions SET started_at=now()-interval '10 seconds' WHERE id=$1", [next.attemptId]);
    await assert.rejects(() => db.query("SELECT public.academy_commit_official_attempt($1,$2,$3,$4)", [next.attemptId, user, JSON.stringify(nextAnswers), JSON.stringify({ score: 0, totalPoints: 20, percentage: 0, passed: false })]), /canonical snapshot/);
    await db.exec("CREATE FUNCTION public.fail_synthetic_eligibility() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Synthetic eligibility outage'; END $$; CREATE TRIGGER synthetic_eligibility_failure BEFORE INSERT OR UPDATE ON public.academy_certificate_eligibility FOR EACH ROW EXECUTE FUNCTION public.fail_synthetic_eligibility();");
    try { await assert.rejects(() => submitAssessmentAttemptServer({ userId: user, attemptId: next.attemptId, moduleId: "exam", level: "explorer", mode: "official", answers: nextAnswers, clientDurationSeconds: 60 }), /not confirmed/); }
    finally { await db.exec("DROP TRIGGER synthetic_eligibility_failure ON public.academy_certificate_eligibility; DROP FUNCTION public.fail_synthetic_eligibility()"); }
    assert.equal((await db.query<{ count: number }>("SELECT count(*)::int AS count FROM public.academy_assessment_attempts WHERE session_id=$1", [next.attemptId])).rows[0].count, 0);
    assert.equal((await db.query<{ completed_at: string | null }>("SELECT completed_at FROM public.academy_assessment_sessions WHERE id=$1", [next.attemptId])).rows[0].completed_at, null);
  });

  test("practice and unreconciled historical passes cannot satisfy official module completion", async () => {
    const { getModuleCompletionRule } = await import("../src/lib/academy/completion-rules");
    const { evaluateModuleCompletionServer } = await import("../src/lib/academy/completion.server");
    const rule = getModuleCompletionRule("01")!;
    await db.exec("INSERT INTO public.academy_lessons(id,module_id,title,visualization_type) VALUES('fixture-lesson','01','Synthetic reading','fixture')");
    await db.query("INSERT INTO public.academy_lesson_progress(user_id,module_id,lesson_id,time_spent_seconds,scroll_depth_percent) VALUES($1,'01','fixture-lesson',600,100)", [other]);
    for (const activity of rule.requiredActivities) {
      await db.query("INSERT INTO public.academy_activity_evidence(user_id,module_id,activity_type,evidence_payload,client_timestamp,verification_status) VALUES($1,'01',$2,'{}',now(),'verified')", [other, activity.id]);
    }
    for (const mode of ["practice", null]) {
      await db.query("INSERT INTO public.academy_assessment_attempts(user_id,assessment_id,answers_payload,score,total_points,percentage,passed,mode) VALUES($1,'quiz_module_01','{}',5,5,100,true,$2)", [other, mode]);
    }
    const result = await evaluateModuleCompletionServer(other, "01");
    assert.equal(result.isVerifiedComplete, false);
    assert.ok(result.checklist.filter(item => item.category !== "assessment").every(item => item.isSatisfied), "Other original requirements are satisfied; only an official assessment is missing");
    assert.ok(result.checklist.some(item => item.category === "assessment" && !item.isSatisfied));
    assert.equal((await db.query<{ count: number }>("SELECT count(*)::int AS count FROM public.academy_verified_completions WHERE user_id=$1", [other])).rows[0].count, 0);
  });

  test("the exact additive migration transaction preserves records and rolls back attempted deletion", async () => {
    const bundle = await durableAcademyMigrationBundle();
    await db.exec(bundle); await db.exec(bundle);
    const before = (await db.query<{ count: number }>("SELECT count(*)::int AS count FROM public.academy_assessment_attempts")).rows[0].count;
    assert.ok(before > 0);
    const corrupt = bundle.replace("DO $after$ BEGIN", "DELETE FROM public.academy_assessment_attempts; DO $after$ BEGIN");
    await assert.rejects(() => db.exec(corrupt), /Assessment records changed/);
    await db.exec("ROLLBACK");
    assert.equal((await db.query<{ count: number }>("SELECT count(*)::int AS count FROM public.academy_assessment_attempts")).rows[0].count, before);
  });

  test("anonymous passing practice and its retries work without database calls or official eligibility", async () => {
    const beforeCalls = transportControl.calls;
    transportControl.unavailable = true;
    try {
      const practice = await startAssessmentServer({ userId: "anon_fixture", moduleId: "exam", level: "explorer", mode: "practice" });
      const input = { userId: `anon_${practice.attemptId}`, attemptId: practice.attemptId, moduleId: "exam", level: "explorer" as const, mode: "practice" as const, answers: correctAnswers(practice.questions), clientDurationSeconds: 10 };
      for (const result of [await submitAssessmentAttemptServer(input), await submitAssessmentAttemptServer(input)]) {
        assert.equal(result.percentage, 100); assert.equal(result.passed, true);
        assert.equal(result.certificateEligible, false); assert.equal(result.verifiedCompletionAwarded, false);
      }
      assert.equal(transportControl.calls, beforeCalls, "Anonymous practice never attempts an invalid UUID write or official read");
    } finally { transportControl.unavailable = false; }
  });

  async function preparedModule(moduleId: string) {
    const { getModuleCompletionRule } = await import("../src/lib/academy/completion-rules");
    const { getCanonicalQuestionsForModule } = await import("../src/lib/academy/assessment-bank.server");
    const rule = getModuleCompletionRule(moduleId)!;
    if (moduleId !== "01") {
      await db.query("INSERT INTO public.academy_lessons(id,module_id,title,visualization_type) VALUES($1,$2,'Synthetic reading','fixture')", ["fixture-" + moduleId, moduleId]);
      await db.query("INSERT INTO public.academy_lesson_progress(user_id,module_id,lesson_id,time_spent_seconds,scroll_depth_percent) VALUES($1,$2,$3,600,100)", [other, moduleId, "fixture-" + moduleId]);
      for (const activity of rule.requiredActivities) await db.query("INSERT INTO public.academy_activity_evidence(user_id,module_id,activity_type,client_timestamp,verification_status) VALUES($1,$2,$3,now(),'verified')", [other, moduleId, activity.id]);
    }
    const started = await startAssessmentServer({ userId: other, moduleId, level: "explorer", mode: "official" });
    const canonical = getCanonicalQuestionsForModule(moduleId, "explorer");
    const responses = Object.fromEntries(started.questions.map(q => [q.id, canonical.find(item => item.id === q.id)!.correctAnswer]));
    await db.query("UPDATE public.academy_assessment_sessions SET started_at=now()-interval '10 seconds' WHERE id=$1", [started.attemptId]);
    return { userId: other, attemptId: started.attemptId, moduleId, level: "explorer" as const, mode: "official" as const, answers: responses, clientDurationSeconds: 10 };
  }

  test("verified completion, progress and one audit event persist together without duplicate retry awards", async () => {
    const input = await preparedModule("01");
    const first = await submitAssessmentAttemptServer(input), retry = await submitAssessmentAttemptServer(input);
    assert.equal(first.verifiedCompletionAwarded, true); assert.equal(retry.attemptId, first.attemptId);
    assert.equal((await db.query<{ count: number }>("SELECT count(*)::int AS count FROM public.academy_verified_completions WHERE user_id=$1 AND module_id='01'", [other])).rows[0].count, 1);
    const progress = (await db.query<{ status: string; percent: number; verified_quiz_passed: boolean }>("SELECT status,percent,verified_quiz_passed FROM public.academy_module_progress WHERE user_id=$1 AND module_id='01'", [other])).rows[0];
    assert.deepEqual(progress, { status: "completed", percent: 100, verified_quiz_passed: true });
    assert.equal((await db.query<{ count: number }>("SELECT count(*)::int AS count FROM public.academy_audit_log WHERE actor_id=$1 AND action='verified_completion_awarded'", [other])).rows[0].count, 1);
  });

  test("an audit failure rolls back completion and progress; retry recovers from the already-recorded grade", async () => {
    const input = await preparedModule("02");
    await db.exec("CREATE FUNCTION public.fail_completion_audit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Synthetic completion audit outage'; END $$; CREATE TRIGGER completion_audit_failure BEFORE INSERT ON public.academy_audit_log FOR EACH ROW EXECUTE FUNCTION public.fail_completion_audit();");
    try { await assert.rejects(() => submitAssessmentAttemptServer(input), /completion was not confirmed/); }
    finally { await db.exec("DROP TRIGGER completion_audit_failure ON public.academy_audit_log; DROP FUNCTION public.fail_completion_audit()"); }
    for (const table of ["academy_verified_completions", "academy_module_progress"]) {
      assert.equal((await db.query<{ count: number }>(`SELECT count(*)::int AS count FROM public.${table} WHERE user_id=$1 AND module_id='02'`, [other])).rows[0].count, 0);
    }
    assert.equal((await db.query<{ count: number }>("SELECT count(*)::int AS count FROM public.academy_assessment_attempts WHERE session_id=$1", [input.attemptId])).rows[0].count, 1);
    assert.equal((await submitAssessmentAttemptServer(input)).verifiedCompletionAwarded, true);
  });

  test("canonical and compatibility badges roll back together, then retry creates one stage award", async () => {
    await submitAssessmentAttemptServer(await preparedModule("03"));
    const fourth = await preparedModule("04");
    await db.exec("CREATE FUNCTION public.fail_legacy_badge() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Synthetic legacy badge outage'; END $$; CREATE TRIGGER legacy_badge_failure BEFORE INSERT ON public.academy_stage_badges FOR EACH ROW EXECUTE FUNCTION public.fail_legacy_badge();");
    try { await assert.rejects(() => submitAssessmentAttemptServer(fourth), /completion was not confirmed/); }
    finally { await db.exec("DROP TRIGGER legacy_badge_failure ON public.academy_stage_badges; DROP FUNCTION public.fail_legacy_badge()"); }
    assert.equal((await db.query<{ count: number }>("SELECT count(*)::int AS count FROM public.academy_stage_achievements WHERE user_id=$1", [other])).rows[0].count, 0);
    const result = await submitAssessmentAttemptServer(fourth);
    assert.equal(result.newStageBadgeAwarded, "First Stargazer");
    for (let i = 0; i < 3; i++) assert.equal((await submitAssessmentAttemptServer(fourth)).newStageBadgeAwarded, null);
    for (const table of ["academy_stage_achievements", "academy_stage_badges"]) {
      assert.equal((await db.query<{ count: number }>(`SELECT count(*)::int AS count FROM public.${table} WHERE user_id=$1 AND stage_id=1`, [other])).rows[0].count, 1);
    }
    assert.equal((await db.query<{ count: number }>("SELECT count(*)::int AS count FROM public.academy_audit_log WHERE actor_id=$1 AND action='verified_completion_awarded'", [other])).rows[0].count, 4);
  });

  test("a client can upload only unverified own telemetry and cannot invoke completion directly", async () => {
    await db.exec("GRANT INSERT ON public.academy_activity_evidence TO authenticated");
    await db.query("SELECT set_config('test.user_id',$1,false)", [other]);
    await db.exec("SET ROLE authenticated");
    try {
      await assert.rejects(() => db.query("INSERT INTO public.academy_activity_evidence(user_id,module_id,activity_type,client_timestamp,verification_status) VALUES($1,'05','forged',now(),'verified')", [other]), /row-level security/);
      await db.query("INSERT INTO public.academy_activity_evidence(user_id,module_id,activity_type,client_timestamp,verification_status) VALUES($1,'05','untrusted',now(),'submitted')", [other]);
      await assert.rejects(() => db.query("SELECT public.academy_apply_verified_completion($1,'01','{}','badge')", [other]), /permission denied/);
    } finally { await db.exec("RESET ROLE"); }
  });

  test("repairing existing completion never downgrades an already-earned final-exam eligibility record", async () => {
    const { evaluateModuleCompletionServer } = await import("../src/lib/academy/completion.server");
    const before = (await db.query("SELECT * FROM public.academy_certificate_eligibility WHERE user_id=$1", [user])).rows;
    assert.equal((await evaluateModuleCompletionServer(user, "01")).isVerifiedComplete, true);
    assert.deepEqual((await db.query("SELECT * FROM public.academy_certificate_eligibility WHERE user_id=$1", [user])).rows, before);
  });

  test("achievement revalidation preserves earned dates and an outage cannot revoke existing awards", async () => {
    const { syncAndEvaluateStageAchievementsServer } = await import("../src/lib/academy/achievements.server");
    const first = await syncAndEvaluateStageAchievementsServer(other);
    assert.equal(first.stages[1].isUnlocked, true);
    const retry = await syncAndEvaluateStageAchievementsServer(other);
    assert.equal(retry.stages[1].awardedAt, first.stages[1].awardedAt);
    transportControl.unavailable = true;
    try { await assert.rejects(() => syncAndEvaluateStageAchievementsServer(other), /revalidation is unavailable/); }
    finally { transportControl.unavailable = false; }
    assert.equal((await db.query<{ count: number }>("SELECT count(*)::int AS count FROM public.academy_stage_achievements WHERE user_id=$1 AND stage_id=1", [other])).rows[0].count, 1);
  });

  test("actual completion invalidation revokes both badge representations once, with an audit record", async () => {
    const { syncAndEvaluateStageAchievementsServer } = await import("../src/lib/academy/achievements.server");
    await db.query("DELETE FROM public.academy_verified_completions WHERE user_id=$1 AND module_id='04'", [other]);
    const result = await syncAndEvaluateStageAchievementsServer(other);
    assert.equal(result.stages[1].isUnlocked, false);
    await syncAndEvaluateStageAchievementsServer(other);
    for (const table of ["academy_stage_achievements", "academy_stage_badges"]) {
      assert.equal((await db.query<{ count: number }>(`SELECT count(*)::int AS count FROM public.${table} WHERE user_id=$1 AND stage_id=1`, [other])).rows[0].count, 0);
    }
    assert.equal((await db.query<{ count: number }>("SELECT count(*)::int AS count FROM public.academy_audit_log WHERE actor_id=$1 AND action='stage_achievement_revoked'", [other])).rows[0].count, 1);
  });

  test("legacy server-graded practice retains scores but cannot create verified completion or certification", async () => {
    const { gradeAssessmentAndVerifyServer } = await import("../src/lib/academy/learning.server");
    const before = (await db.query<{ count: number }>("SELECT count(*)::int AS count FROM public.academy_verified_completions WHERE user_id=$1", [other])).rows[0].count;
    const input = { userId: other, moduleId: "04", answers: {}, idempotencyKey: "legacy-practice-fixture" };
    const first = await gradeAssessmentAndVerifyServer(input), retry = await gradeAssessmentAndVerifyServer(input);
    assert.equal(first.mode, "practice"); assert.equal(retry.attemptId, first.attemptId);
    assert.equal(first.verifiedCompletionAwarded, false); assert.equal(first.certificateEligible, false);
    assert.equal((await db.query<{ count: number }>("SELECT count(*)::int AS count FROM public.academy_verified_completions WHERE user_id=$1", [other])).rows[0].count, before);
  });

  test("reading retries are monotonic, preserve bookmarks and reject mismatched lesson/module IDs", async () => {
    for (const [scroll, seconds, bookmark] of [[90, 120, true], [10, 5, null], [90, 120, null]]) {
      await db.query("SELECT public.academy_record_lesson_progress($1,'01','01-core',$2,$3,$4)", [other, scroll, seconds, bookmark]);
    }
    const row = (await db.query("SELECT scroll_depth_percent,time_spent_seconds,is_bookmarked FROM public.academy_lesson_progress WHERE user_id=$1 AND lesson_id='01-core'", [other])).rows[0];
    assert.deepEqual(row, { scroll_depth_percent: 90, time_spent_seconds: 120, is_bookmarked: true });
    await assert.rejects(() => db.query("SELECT public.academy_record_lesson_progress($1,'02','01-core',100,600,NULL)", [other]), /Invalid reading/);
  });

  test("the completion migration preserves all learning/access records and rejects injected data deletion", async () => {
    const bundle = await atomicCompletionMigrationBundle();
    await db.exec(bundle); await db.exec(bundle);
    const before = (await db.query<{ count: number }>("SELECT count(*)::int AS count FROM public.academy_module_progress")).rows[0].count;
    assert.ok(before > 0);
    await assert.rejects(() => db.exec(bundle.replace("DO $after$ BEGIN", "DELETE FROM public.academy_module_progress; DO $after$ BEGIN")), /Existing academy_module_progress records changed/);
    await db.exec("ROLLBACK");
    assert.equal((await db.query<{ count: number }>("SELECT count(*)::int AS count FROM public.academy_module_progress")).rows[0].count, before);
  });

  test("validated event retries retain one evidence record and reject changed content under the same event ID", async () => {
    const { recordValidatedActivityOutcomeServer } = await import("../src/lib/academy/completion.server");
    const first = await recordValidatedActivityOutcomeServer(other, "05", "act_05_seasons_eclipse_sim", { nodesAligned: true, predictedCount: 2 }, false, "2026-11-04T00:00:00Z", "fixture-evidence-05");
    const retry = await recordValidatedActivityOutcomeServer(other, "05", "act_05_seasons_eclipse_sim", { predictedCount: 2, nodesAligned: true }, false, "2026-11-04T00:00:00Z", "fixture-evidence-05");
    assert.equal(first.success, true);
    assert.ok("evidenceId" in first && typeof first.evidenceId === "string");
    assert.ok("evidenceId" in retry && typeof retry.evidenceId === "string");
    assert.equal(retry.evidenceId, first.evidenceId);
    await assert.rejects(() => recordValidatedActivityOutcomeServer(other, "05", "act_05_seasons_eclipse_sim", { nodesAligned: true, predictedCount: 3 }, false, "2026-11-04T00:00:00Z", "fixture-evidence-05"), /different or unverified evidence/);
    assert.equal((await db.query<{ count: number }>("SELECT count(*)::int AS count FROM public.academy_activity_evidence WHERE user_id=$1 AND client_event_id='client:fixture-evidence-05'", [other])).rows[0].count, 1);
  });

  test("anonymous activity validation remains practice-only without database calls or official awards", async () => {
    const { recordValidatedActivityOutcomeServer } = await import("../src/lib/academy/completion.server");
    const calls = transportControl.calls;
    const result = await recordValidatedActivityOutcomeServer("anon_fixture", "05", "act_05_seasons_eclipse_sim", { nodesAligned: true });
    assert.equal(result.success, true); assert.ok("practiceOnly" in result && result.practiceOnly === true);
    assert.equal(result.evaluation.isVerifiedComplete, false);
    assert.equal("evidenceId" in result ? result.evidenceId : undefined, undefined);
    assert.equal(transportControl.calls, calls);
  });
}
