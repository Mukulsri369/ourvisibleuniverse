// Explicit nonproduction integration QA. Creates and removes only its own marked
// synthetic identity in the approved development project. No email is sent, no
// passwords are set. Optional completion fixtures belong only to that disposable
// identity; no existing student's progress or paid access is modified.
import assert from "node:assert/strict";
import { createServer } from "node:net";
import { once } from "node:events";
import { resolve, dirname } from "node:path";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { unstable_dev } from "wrangler";
import { runWithStartContext } from "@tanstack/start-storage-context";

if (!process.argv.includes("--disposable-development-fixture")) throw new Error("Explicit disposable development fixture flag required");
const project = "https://pdvwkdggyyrfkoqrpbji.supabase.co";
assert.equal(process.env.SUPABASE_URL, project);
const serverKey = process.env.SUPABASE_SERVICE_ROLE_KEY, publicKey = process.env.SUPABASE_PUBLISHABLE_KEY;
assert.ok(serverKey?.startsWith("sb_secret_") && publicKey?.startsWith("sb_publishable_"));
assert.ok(!process.env.RAZORPAY_TEST_KEY_SECRET && !process.env.RAZORPAY_LIVE_KEY_SECRET);
const runId = crypto.randomUUID(), email = `ovu.qa.${runId}@example.test`;
const completionFixtures = process.argv.includes("--with-completion-fixtures");
let userId, accessToken, worker, stage = "preflight", cleanupComplete = false, precedingIds = [];
const report = { disposableFixture: true, paymentsPerformed: false, completed: false };
const heartbeat = setInterval(() => console.log("Academy QA stage: " + stage), 15_000);
heartbeat.unref();
const evidence = resolve(import.meta.dirname, "../../../evidence/ovu-academy-built-supabase-results.json");

async function api(path, { method = "GET", body, user = false, publicOnly = false } = {}) {
  const headers = { apikey: publicOnly || user ? publicKey : serverKey, "User-Agent": "OVU-Development-QA/1.0" };
  if (user) headers.Authorization = `Bearer ${accessToken}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const response = await fetch(project + path, { method, headers, ...(body !== undefined ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(15_000), redirect: "error" });
  return response;
}
async function success(response) { assert.equal(response.status, 200, `Development API rejected at ${stage}`); return response.json(); }
const root = resolve(import.meta.dirname, ".."), config = resolve(root, "dist/server/wrangler.json");
const built = JSON.parse(await readFile(config, "utf8"));
let manifest = "";
for (const file of await readdir(resolve(root, "dist/server/assets"))) {
  if (/^server-.*\.js$/.test(file)) manifest += await readFile(resolve(root, "dist/server/assets", file), "utf8");
}
// Use TanStack's installed serializer/parser for the actual server-function wire format.
const { serverFnFetcher } = await import(new URL("./serverFnFetcher.js", import.meta.resolve("@tanstack/start-client-core/client-rpc")));
const probe = createServer(); probe.listen(0, "127.0.0.1"); await once(probe, "listening");
const port = probe.address().port; await new Promise(done => probe.close(done));
const origin = `http://127.0.0.1:${port}`;
async function startWorker() {
  const vars = Object.fromEntries(["SUPABASE_URL", "SUPABASE_PUBLISHABLE_KEY", "SUPABASE_SERVICE_ROLE_KEY", "CERTIFICATE_SIGNING_SECRET"].map(key => [key, process.env[key]]));
  vars.RAZORPAY_MODE = "test"; vars.PUBLIC_APP_ORIGIN = origin;
  return unstable_dev(resolve(dirname(config), built.main), { config, ip: "127.0.0.1", port, local: true, bundle: false, vars,
    persistTo: resolve(tmpdir(), "ovu-academy-integration", runId), logLevel: "error",
    experimental: { disableExperimentalWarning: true, disableDevRegistry: true } });
}
async function rpc(name, data, anonymous = false, method = "POST") {
  const id = manifest.match(new RegExp(`"([a-f0-9]{64})":\\s*\\{\\s*functionName:\\s*"${name}_createServerFn_handler"`))?.[1];
  assert.ok(id, `Missing built function ${name}`);
  const envelope = await runWithStartContext({ startOptions: { serializationAdapters: [] } }, () =>
    serverFnFetcher(`${origin}/_serverFn/${id}`, [{ method, data, headers: anonymous ? {} : { Authorization: `Bearer ${accessToken}` } }],
      (url, init) => fetch(url, { ...init, signal: AbortSignal.timeout(120_000) })));
  if (envelope?.error) throw envelope.error;
  return envelope?.result ?? envelope;
}
try {
  const originalUsers = await success(await api("/auth/v1/admin/users?page=1&per_page=1000"));
  precedingIds = originalUsers.users.map(user => user.id).sort();
  stage = "create-disposable-identity";
  const created = await success(await api("/auth/v1/admin/users", { method: "POST", body: { email, email_confirm: true, app_metadata: { ovu_migration_fixture: runId } } }));
  assert.ok(created.id && !precedingIds.includes(created.id)); userId = created.id;
  assert.equal(created.app_metadata.ovu_migration_fixture, runId);
  stage = "private-fixture-sign-in";
  const link = await success(await api("/auth/v1/admin/generate_link", { method: "POST", body: { type: "magiclink", email } }));
  assert.ok(link.hashed_token || link.properties?.hashed_token);
  const signed = await success(await api("/auth/v1/verify", { method: "POST", publicOnly: true, body: { type: "magiclink", token_hash: link.hashed_token ?? link.properties.hashed_token } }));
  assert.equal(signed.user.id, userId); accessToken = signed.access_token; assert.ok(accessToken);
  stage = "start-built-worker"; worker = await startWorker();
  stage = "start-official-quiz";
  const session = await rpc("startAssessmentAttempt", { moduleId: "01", level: "explorer", mode: "official" });
  assert.ok(session.attemptId); assert.ok(session.questions.length > 0);
  assert.ok(session.questions.every(q => !("correctAnswer" in q) && !("explanation" in q)));
  const privateSessions = await api(`/rest/v1/academy_assessment_sessions?select=id&user_id=eq.${userId}`, { user: true });
  assert.equal(privateSessions.status, 403);
  const directGrade = await api("/rest/v1/rpc/academy_commit_official_attempt", { method: "POST", user: true, body: { p_session_id: session.attemptId, p_user_id: userId, p_answers: {}, p_result: null } });
  assert.equal(directGrade.status, 403);
  stage = "cold-restart-worker"; await worker.stop(); worker = undefined;
  // The database enforces five actual seconds independently of this reported duration.
  await new Promise(done => setTimeout(done, 5500)); worker = await startWorker();
  stage = "submit-after-restart";
  const answers = Object.fromEntries(session.questions.map(q => [q.id, -1]));
  const submission = { attemptId: session.attemptId, moduleId: "01", level: "explorer", mode: "official", answers, clientDurationSeconds: 10, clientScore: 100 };
  const result = await rpc("submitAssessmentAttempt", submission);
  assert.equal(result.percentage, 0); assert.equal(result.passed, false);
  assert.equal(result.certificateEligible, false); assert.equal(result.verifiedCompletionAwarded, false);
  stage = "verify-idempotent-retry";
  const retry = await rpc("submitAssessmentAttempt", { ...submission, idempotencyKey: "different-qa-browser-key" });
  assert.equal(retry.attemptId, result.attemptId); assert.equal(retry.percentage, result.percentage);
  stage = "concurrent-identical-retries";
  const parallel = await Promise.all(Array.from({ length: 4 }, () => rpc("submitAssessmentAttempt", submission)));
  assert.ok(parallel.every(value => value.attemptId === result.attemptId && value.percentage === 0));
  await assert.rejects(() => rpc("submitAssessmentAttempt", { ...submission, answers: {} }), /not confirmed/);
  stage = "concurrent-conflicting-submissions";
  const racingSession = await rpc("startAssessmentAttempt", { moduleId: "01", level: "explorer", mode: "official" });
  await new Promise(done => setTimeout(done, 5500));
  const racing = await Promise.allSettled([-1, -2].map(choice => rpc("submitAssessmentAttempt", {
    ...submission, attemptId: racingSession.attemptId, answers: Object.fromEntries(racingSession.questions.map(q => [q.id, choice])),
  })));
  assert.equal(racing.filter(value => value.status === "fulfilled").length, 1);
  assert.equal(racing.filter(value => value.status === "rejected").length, 1);
  stage = "verify-no-awards";
  for (const table of ["academy_verified_completions", "academy_certificate_eligibility", "academy_certificates", "access_passes"]) {
    const rows = await success(await api(`/rest/v1/${table}?select=*&user_id=eq.${userId}`));
    assert.deepEqual(rows, [], `No grants or eligibility may be created: ${table}`);
  }
  const attempts = await success(await api(`/rest/v1/academy_assessment_attempts?select=id,mode,session_id,percentage&user_id=eq.${userId}`));
  assert.equal(attempts.length, 2);
  assert.ok(attempts.every(attempt => attempt.mode === "official" && attempt.percentage === 0));
  assert.equal(attempts.filter(attempt => attempt.session_id === session.attemptId).length, 1);
  assert.equal(attempts.filter(attempt => attempt.session_id === racingSession.attemptId).length, 1);
  stage = "anonymous-practice";
  await assert.rejects(() => rpc("startAssessmentAttempt", { moduleId: "01", level: "explorer", mode: "official" }, true), /authentication required/);
  const practice = await rpc("startAssessmentAttempt", { moduleId: "01", level: "explorer", mode: "practice" }, true);
  const practiceInput = { attemptId: practice.attemptId, moduleId: "01", level: "explorer", mode: "practice", answers: {}, clientDurationSeconds: 10 };
  const practiceResult = await rpc("submitAssessmentAttempt", practiceInput, true);
  const practiceRetry = await rpc("submitAssessmentAttempt", practiceInput, true);
  assert.equal(practiceResult.attemptId, practiceRetry.attemptId);
  assert.equal(practiceRetry.certificateEligible, false); assert.equal(practiceRetry.verifiedCompletionAwarded, false);
  report.completed = true; report.checks = { actualSupabase: true, builtWorkerColdRestart: true, serverGrading: true, originalAttemptOnRetry: true, concurrentIdenticalRetries: true, concurrentConflictingSubmissions: true, changedAnswersRejected: true, rawSnapshotDenied: true, directGradingDenied: true, noAwardsOrAccess: true, anonymousPracticeRetry: true, anonymousOfficialDenied: true };
  if (completionFixtures) {
    report.completed = false; stage = "prepare-controlled-stage-fixture";
    const { getCanonicalQuestionsForModule } = await import("../src/lib/academy/assessment-bank.server.ts");
    const { MODULE_COMPLETION_RULES } = await import("../src/lib/academy/completion-rules.ts");
    const payloads = {
      "01": { stepCount: 15, minScaleMeters: 1, maxScaleMeters: 1e26, powersOfTenStepsCompleted: 15 },
      "02": { alignedCount: 3, polarisLocated: true, constellationsIdentified: 3 },
      "03": { parallaxArcsec: 0.772, distanceParsecs: 1.295 },
      "04": { benchmarkCount: 4, lookbackTimeGyr: 13.4, benchmarksCompleted: 4 },
    };
    const forbiddenEvidence = await api("/rest/v1/academy_activity_evidence", { method: "POST", user: true,
      body: { user_id: userId, module_id: "01", activity_type: "act_01_cosmic_zoom", evidence_payload: {}, client_timestamp: new Date().toISOString(), verification_status: "verified" } });
    assert.equal(forbiddenEvidence.status, 403);
    const successfulSessions = [];
    for (const moduleId of ["01", "02", "03", "04"]) {
      stage = "reading-and-activity-" + moduleId;
      const reading = await rpc("recordLessonProgress", { moduleId, lessonId: moduleId + "-core", scrollDepthPercent: 90, timeSpentSeconds: 120, isBookmarked: true });
      assert.equal(reading.success, true);
      assert.equal((await rpc("recordLessonProgress", { moduleId, lessonId: moduleId + "-core", scrollDepthPercent: 10, timeSpentSeconds: 5 })).success, true);
      const activities = MODULE_COMPLETION_RULES[moduleId].requiredActivities;
      assert.equal(activities.length, 1, "Update first-stage fixtures when the curriculum changes");
      const event = { moduleId, activityId: activities[0].id, payload: payloads[moduleId], clientEventId: "qa:" + runId + ":" + moduleId };
      const outcome = await rpc("submitActivityOutcome", event), duplicate = await rpc("submitActivityOutcome", event);
      assert.equal(outcome.success, true); assert.ok(outcome.evidenceId);
      assert.equal(duplicate.evidenceId, outcome.evidenceId);
      if (moduleId === "01") await assert.rejects(() => rpc("submitActivityOutcome", { ...event, payload: { ...event.payload, stepCount: 16 } }), /different or unverified evidence/);
      const official = await rpc("startAssessmentAttempt", { moduleId, level: "explorer", mode: "official" });
      const canonical = getCanonicalQuestionsForModule(moduleId, "explorer");
      successfulSessions.push({ attemptId: official.attemptId, moduleId, level: "explorer", mode: "official",
        answers: Object.fromEntries(official.questions.map(q => [q.id, canonical.find(item => item.id === q.id).correctAnswer])), clientDurationSeconds: 10 });
    }
    stage = "concurrent-positive-completions";
    await new Promise(done => setTimeout(done, 5500));
    const successful = await Promise.all(successfulSessions.map(input => rpc("submitAssessmentAttempt", input)));
    report.controlledResults = successful.map(result => ({ percentage: result.percentage, passed: result.passed,
      verifiedCompletionAwarded: result.verifiedCompletionAwarded, newStageBadgeAwarded: result.newStageBadgeAwarded }));
    assert.ok(successful.every(result => result.passed && result.percentage === 100 && result.verifiedCompletionAwarded));
    assert.equal(successful.filter(result => result.newStageBadgeAwarded === "First Stargazer").length, 1);
    // The rendered Academy consumes this endpoint, which includes canonical
    // achievement revalidation. The unused standalone wrapper is tree-shaken.
    const award = (await rpc("getAuthoritativeProgress", {}, false, "GET")).achievementsDetail;
    assert.equal(award.totalEarnedCount, 1); assert.equal(award.stages[1].isUnlocked, true);
    for (const input of successfulSessions) assert.equal((await rpc("submitAssessmentAttempt", input)).newStageBadgeAwarded, null);
    const afterRetry = (await rpc("getAuthoritativeProgress", {}, false, "GET")).achievementsDetail;
    assert.equal(afterRetry.stages[1].awardedAt, award.stages[1].awardedAt);
    stage = "verify-controlled-stage-records";
    for (const table of ["academy_stage_achievements", "academy_stage_badges"]) {
      const rows = await success(await api(`/rest/v1/${table}?select=*&user_id=eq.${userId}`));
      assert.equal(rows.length, 1); assert.equal(rows[0].stage_id, 1);
    }
    const completions = await success(await api(`/rest/v1/academy_verified_completions?select=module_id&user_id=eq.${userId}`));
    assert.deepEqual(completions.map(row => row.module_id).sort(), ["01", "02", "03", "04"]);
    const evidenceRows = await success(await api(`/rest/v1/academy_activity_evidence?select=id&user_id=eq.${userId}`));
    assert.equal(evidenceRows.length, 4);
    const audit = await success(await api(`/rest/v1/academy_audit_log?select=id&actor_id=eq.${userId}&action=eq.verified_completion_awarded`));
    assert.equal(audit.length, 4);
    const readingRows = await success(await api(`/rest/v1/academy_lesson_progress?select=scroll_depth_percent,time_spent_seconds,is_bookmarked&user_id=eq.${userId}`));
    assert.equal(readingRows.length, 4);
    assert.ok(readingRows.every(row => row.scroll_depth_percent === 90 && row.time_spent_seconds === 120 && row.is_bookmarked));
    for (const table of ["academy_certificate_eligibility", "academy_certificates", "access_passes"]) assert.deepEqual(await success(await api(`/rest/v1/${table}?select=*&user_id=eq.${userId}`)), []);
    const progress = await rpc("getAuthoritativeProgress", {}, false, "GET");
    assert.equal(Object.keys(progress.verifiedCompletions).length, 4); assert.equal(progress.isCertificateEligible, false);
    const guestActivity = await rpc("submitActivityOutcome", { moduleId: "01", activityId: "act_01_cosmic_zoom", payload: payloads["01"] }, true);
    assert.equal(guestActivity.practiceOnly, true); assert.equal(guestActivity.evaluation.isVerifiedComplete, false);
    report.checks.failedAssessmentsDidNotAward = true; delete report.checks.noAwardsOrAccess;
    Object.assign(report.checks, { controlledFirstStageFixture: true, concurrentModuleAwards: true, oneStageAward: true,
      activityRetryDeduplication: true, monotonicReading: true, preservedBookmark: true, noPaidAccess: true,
      noCertificateEligibilityFromFirstStage: true, anonymousActivityPracticeOnly: true });
    report.completed = true;
  }
  report.precedingIdentityCount = precedingIds.length;
} catch (error) {
  const categories = ["No Start context", "Official assessment could not be saved", "Official assessment storage is unavailable", "Official assessment was not confirmed", "Invalid authentication", "Attempt ownership mismatch"];
  report.failure = { stage, type: error?.name ?? "Error", category: categories.find(value => String(error?.message).includes(value)) ?? "Protocol or assertion failure",
    sourceLine: String(error?.stack).match(/academy-built-supabase-qa\.mjs:(\d+):/)?.[1],
    ...(typeof error?.actual === "number" ? { actual: error.actual, expected: error.expected } : {}) };
} finally {
  clearInterval(heartbeat);
  if (worker) await worker.stop();
  if (userId) {
    stage = "remove-owned-disposable-fixture";
    try {
      const owned = await success(await api("/auth/v1/admin/users/" + userId));
      assert.equal(owned.email, email); assert.equal(owned.app_metadata.ovu_migration_fixture, runId);
      // Explicitly remove only this run's child/audit rows before auth CASCADE;
      // assessment qualification FKs use RESTRICT, and audit actors use SET NULL.
      for (const [table, key] of [["academy_audit_log", "actor_id"], ["academy_verified_completions", "user_id"]]) {
        const removedRows = await api(`/rest/v1/${table}?${key}=eq.${userId}`, { method: "DELETE" });
        assert.ok([200, 204].includes(removedRows.status));
      }
      const removed = await api("/auth/v1/admin/users/" + userId, { method: "DELETE" });
      assert.equal(removed.status, 200);
      const remaining = await success(await api(`/rest/v1/academy_assessment_sessions?select=id&user_id=eq.${userId}`));
      assert.deepEqual(remaining, []);
      const remainingUsers = await success(await api("/auth/v1/admin/users?page=1&per_page=1000"));
      assert.deepEqual(remainingUsers.users.map(user => user.id).sort(), precedingIds);
      report.precedingIdentitiesPreserved = true; cleanupComplete = true;
    } catch { report.cleanupFailure = true; }
  }
  accessToken = undefined;
  report.fixtureRemoved = cleanupComplete;
  // Only a newly-created synthetic ID is recorded if recovery is required, never tokens.
  if (userId && !cleanupComplete) report.orphanedFixtureId = userId;
  await writeFile(evidence, JSON.stringify(report, null, 2), "utf8");
}
if (!report.completed || !cleanupComplete) { console.error(`FAIL: actual built/Supabase Academy QA at ${report.failure?.stage ?? stage}; credential details withheld; inspect private evidence.`); process.exitCode = 1; }
else console.log("PASS: actual Supabase + built Worker restart/retries/permissions" + (completionFixtures ? ", concurrent controlled stage fixtures" : ", no awards") + "; no paid access; owned synthetic fixture removed");
