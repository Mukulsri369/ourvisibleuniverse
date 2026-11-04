// Explicit nonproduction integration QA. Creates and removes only its own marked
// synthetic identity in the approved development project. No email is sent, no
// passwords are set, and no completion, certificate or paid access is granted.
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
let userId, accessToken, worker, stage = "preflight", cleanupComplete = false, precedingIds = [];
const report = { disposableFixture: true, paymentsPerformed: false, completed: false };
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
async function rpc(name, data, anonymous = false) {
  const id = manifest.match(new RegExp(`"([a-f0-9]{64})":\\s*\\{\\s*functionName:\\s*"${name}_createServerFn_handler"`))?.[1];
  assert.ok(id, `Missing built function ${name}`);
  const envelope = await runWithStartContext({ startOptions: { serializationAdapters: [] } }, () =>
    serverFnFetcher(`${origin}/_serverFn/${id}`, [{ method: "POST", data, headers: anonymous ? {} : { Authorization: `Bearer ${accessToken}` } }], fetch));
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
  report.precedingIdentityCount = precedingIds.length;
} catch (error) {
  const categories = ["No Start context", "Official assessment could not be saved", "Official assessment storage is unavailable", "Official assessment was not confirmed", "Invalid authentication", "Attempt ownership mismatch"];
  report.failure = { stage, type: error?.name ?? "Error", category: categories.find(value => String(error?.message).includes(value)) ?? "Protocol or assertion failure", ...(typeof error?.actual === "number" ? { actual: error.actual, expected: error.expected } : {}) };
} finally {
  if (worker) await worker.stop();
  if (userId) {
    stage = "remove-owned-disposable-fixture";
    try {
      const owned = await success(await api("/auth/v1/admin/users/" + userId));
      assert.equal(owned.email, email); assert.equal(owned.app_metadata.ovu_migration_fixture, runId);
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
else console.log("PASS: actual Supabase + built Worker cold restart, grading/retries, privilege denials, no awards/access, owned synthetic fixture removed");
