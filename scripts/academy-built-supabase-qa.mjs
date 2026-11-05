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
const certificationFixtures = process.argv.includes("--with-certification-fixtures");
const completionFixtures = process.argv.includes("--with-completion-fixtures") || certificationFixtures;
let userId, accessToken, worker, stage = "preflight", lastRpc, cleanupComplete = false, precedingIds = [];
const report = { disposableFixture: true, paymentsPerformed: false, completed: false };
const heartbeat = setInterval(() => console.log("Academy QA stage: " + stage), 15_000);
heartbeat.unref();
const evidence = resolve(import.meta.dirname, "../../../evidence/ovu-academy-built-supabase-results.json");

async function api(path, { method = "GET", body, user = false, publicOnly = false, prefer } = {}) {
  const headers = { apikey: publicOnly || user ? publicKey : serverKey, "User-Agent": "OVU-Development-QA/1.0" };
  if (user) headers.Authorization = `Bearer ${accessToken}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (prefer) headers.Prefer = prefer;
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
  lastRpc = name;
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
  stage = "profile-navigation-boundaries";
  const initialized = await Promise.all(Array.from({ length: 3 }, () => rpc("getMyStudentProfile", undefined, false, "GET")));
  assert.equal(new Set(initialized.map(item => item.profile.student_public_id)).size, 1);
  assert.ok(initialized[0].profile.student_public_id.startsWith("STU-"));
  await assert.rejects(() => rpc("updateMyStudentProfile", { expectedUserId: "00000000-0000-4000-8000-000000000000", display_name: "Wrong Account" }), /another account/);
  await assert.rejects(() => rpc("syncStudentProgress", { expectedUserId: "00000000-0000-4000-8000-000000000000", moduleProgress: {} }), /another account/);
  await rpc("updateMyStudentProfile", { expectedUserId: userId, age_bracket: "18_plus", profile_visibility: "public", guardian_email: "synthetic-guardian@example.invalid" });
  const rawPublicProfile = await api(`/rest/v1/student_profiles?select=*&user_id=eq.${userId}`, { publicOnly: true });
  assert.deepEqual(await success(rawPublicProfile), []);
  const rawOwnProfile = await success(await api(`/rest/v1/student_profiles?select=user_id&user_id=eq.${userId}`, { user: true }));
  assert.equal(rawOwnProfile.length, 1);
  const forgedProgress = await api("/rest/v1/academy_module_progress", { method: "POST", user: true, body: { user_id: userId, module_id: "24", percent: 100, verified_quiz_passed: true } });
  assert.equal(forgedProgress.status, 403);
  const rawSync = await api("/rest/v1/rpc/academy_sync_navigation", { method: "POST", user: true, body: { p_user_id: userId, p_progress: {}, p_level: null } });
  assert.ok([401,403,404].includes(rawSync.status));
  const firstNavigation = await rpc("syncStudentProgress", { expectedUserId: userId, moduleProgress: { "02": { status: "in_progress", percent: 45, timeSpentSeconds: 30 } } });
  assert.equal(firstNavigation.success, true);
  const retriedNavigation = await rpc("syncStudentProgress", { expectedUserId: userId, moduleProgress: { "02": { status: "not_started", percent: 0, timeSpentSeconds: 1 } } });
  const navigated = retriedNavigation.progress.find(item => item.module_id === "02");
  assert.equal(navigated.percent, 45); assert.equal(navigated.time_spent_seconds, 30); assert.equal(navigated.verified_quiz_passed, false);
  await rpc("updateMyStudentProfile", { expectedUserId: userId, profile_visibility: "private", guardian_email: null });
  report.profileNavigationBoundaries = true;
  stage = "start-official-quiz";
  await assert.rejects(() => rpc("recordLessonProgress", { expectedUserId: "00000000-0000-4000-8000-000000000000",
    moduleId: "01", lessonId: "01-core", scrollDepthPercent: 50, timeSpentSeconds: 60 }), /another account/);
  await assert.rejects(() => rpc("recordActivityEvidence", { expectedUserId: "00000000-0000-4000-8000-000000000000",
    moduleId: "01", activityType: "act_01_cosmic_zoom", evidencePayload: {}, clientTimestamp: new Date().toISOString() }), /another account/);
  report.accountSwitchDenials = true;
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
    if (certificationFixtures) {
      report.completed = false;
      const { academyActivityFixtures } = await import("./helpers/academy-activity-fixtures.mjs");
      const { FINAL_EXAM_QUESTION_BANK } = await import("../src/lib/academy/final-exam-bank.server.ts");
      const sessions = [];
      for (let index = 5; index <= 24; index++) {
        const moduleId = String(index).padStart(2, "0"); stage = "certification-module-" + moduleId;
        assert.equal((await rpc("recordLessonProgress", { moduleId, lessonId: moduleId + "-core", scrollDepthPercent: 90, timeSpentSeconds: 120, expectedUserId: userId })).success, true);
        for (const activity of MODULE_COMPLETION_RULES[moduleId].requiredActivities) {
          const outcome = await rpc("submitActivityOutcome", { moduleId, activityId: activity.id, payload: academyActivityFixtures[moduleId], clientEventId: "full-qa:" + runId + ":" + activity.id });
          assert.equal(outcome.success, true); assert.ok(outcome.evidenceId);
        }
        const session = await rpc("startAssessmentAttempt", { moduleId, level: "explorer", mode: "official" });
        const canonical = getCanonicalQuestionsForModule(moduleId, "explorer");
        sessions.push({ attemptId: session.attemptId, moduleId, level: "explorer", mode: "official", clientDurationSeconds: 10,
          answers: Object.fromEntries(session.questions.map(question => [question.id, canonical.find(q => q.id === question.id).correctAnswer])) });
      }
      stage = "complete-all-24-modules"; await new Promise(done => setTimeout(done, 5500));
      for (let index = 0; index < sessions.length; index += 4) {
        const results = await Promise.all(sessions.slice(index, index + 4).map(session => rpc("submitAssessmentAttempt", session)));
        assert.ok(results.every(result => result.passed && result.percentage === 100 && result.verifiedCompletionAwarded));
      }
      const allProgress = await rpc("getAuthoritativeProgress", {}, false, "GET");
      assert.equal(Object.keys(allProgress.verifiedCompletions).length, 24);
      assert.equal(Object.keys(allProgress.stageAchievements).length, 6);
      assert.equal(allProgress.isCertificateEligible, false);
      const canonicalNavigation = await rpc("syncStudentProgress", { expectedUserId: userId,
        moduleProgress: { "01": { status: "not_started", percent: 0, timeSpentSeconds: 0 } } });
      const officialRow = canonicalNavigation.progress.find(row => row.module_id === "01");
      assert.equal(officialRow.percent, 100); assert.equal(officialRow.verified_quiz_passed, true);
      assert.equal(officialRow.status, "completed");
      report.canonicalNavigationPreserved = true;
      await assert.rejects(() => rpc("issueOfficialCertificate", {}), /issuance denied/);
      stage = "official-final-at-exactly-80-percent";
      const final = await rpc("startAssessmentAttempt", { moduleId: "exam", level: "explorer", mode: "official" });
      assert.equal(final.questions.length, 20);
      await new Promise(done => setTimeout(done, 5500));
      const finalResult = await rpc("submitAssessmentAttempt", { attemptId: final.attemptId, moduleId: "exam", level: "explorer", mode: "official", clientDurationSeconds: 10,
        answers: Object.fromEntries(final.questions.map((question, index) => [question.id, index < 16 ? FINAL_EXAM_QUESTION_BANK.find(q => q.id === question.id).correctAnswer : -1])) });
      assert.equal(finalResult.percentage, 80); assert.equal(finalResult.passed, true); assert.equal(finalResult.certificateEligible, true);
      stage = "private-synthetic-certificate-profile";
      const profile = await api("/rest/v1/student_profiles?on_conflict=user_id", { method: "POST", prefer: "resolution=merge-duplicates,return=representation",
        body: { user_id: userId, student_public_id: "STU-QA-" + runId.slice(0, 8).toUpperCase(), display_name: "Synthetic QA Alias",
          certificate_name: "Synthetic QA Certificate Learner", selected_level: "explorer", age_bracket: "18_plus", profile_visibility: "private" } });
      assert.ok([200, 201].includes(profile.status));
      stage = "concurrent-certificate-issuance";
      const issued = await Promise.all(Array.from({ length: 4 }, () => rpc("issueOfficialCertificate", { level: "astronomer", userId: "00000000-0000-4000-8000-000000000000" })));
      assert.ok(issued.every(result => result.success)); assert.equal(new Set(issued.map(result => result.certificate.id)).size, 1);
      assert.equal(issued.filter(result => !result.isExisting).length, 1);
      const certificate = issued[0].certificate;
      assert.equal(certificate.userId, userId); assert.equal(certificate.learningLevel, "explorer");
      assert.equal(certificate.finalScorePercentage, 80); assert.equal(certificate.metadata.signatureVersion, 2);
      const number = certificate.certificateNumber;
      const rawAnonymous = await api("/rest/v1/academy_certificates?select=certificate_number", { publicOnly: true });
      assert.deepEqual(await success(rawAnonymous), []);
      const verified = await rpc("verifyCertificatePublic", { certificateId: number }, true, "GET");
      assert.equal(verified.isValid, true); assert.equal(verified.studentName, "Verified Explorer");
      await assert.rejects(() => rpc("generateCertificatePdfPayload", { certificateNumber: number }, true), /download is private/);
      await assert.rejects(() => rpc("getCertificateOpenBadgePayload", { certificateNumber: number }, true, "GET"), /download is private/);
      stage = "owner-pdf-and-open-badges";
      for (const theme of ["cosmic_dark", "print_light"]) {
        const pdf = await rpc("generateCertificatePdfPayload", { certificateNumber: number, theme });
        assert.equal(Buffer.from(pdf.base64, "base64").subarray(0, 4).toString(), "%PDF");
      }
      const badge = await rpc("getCertificateOpenBadgePayload", { certificateNumber: number }, false, "GET");
      assert.ok(JSON.stringify(badge).includes("OpenBadgeCredential"));
      stage = "public-sharing-and-minor-consent-boundaries";
      const publicOptIn = await api(`/rest/v1/student_profiles?user_id=eq.${userId}`, { method: "PATCH", body: { profile_visibility: "public" } });
      assert.ok([200, 204].includes(publicOptIn.status));
      assert.equal((await rpc("verifyCertificatePublic", { certificateId: number }, true, "GET")).studentName, certificate.certificateName);
      assert.ok(JSON.stringify(await rpc("getCertificateOpenBadgePayload", { certificateNumber: number }, true, "GET")).includes("OpenBadgeCredential"));
      const minorProfile = await api(`/rest/v1/student_profiles?user_id=eq.${userId}`, { method: "PATCH", body: { age_bracket: "under_13", guardian_consent_status: "pending_guardian" } });
      assert.ok([200, 204].includes(minorProfile.status));
      assert.equal((await rpc("verifyCertificatePublic", { certificateId: number }, true, "GET")).studentName, "Verified Student");
      await assert.rejects(() => rpc("getCertificateOpenBadgePayload", { certificateNumber: number }, true, "GET"), /download is private/);
      const resetProfile = await api(`/rest/v1/student_profiles?user_id=eq.${userId}`, { method: "PATCH", body: { profile_visibility: "private", age_bracket: "18_plus", guardian_consent_status: "not_required" } });
      assert.ok([200, 204].includes(resetProfile.status));
      stage = "certificate-recovery-after-worker-restart";
      await worker.stop(); worker = await startWorker();
      assert.equal((await rpc("getActiveCertificate", {}, false, "GET")).certificateNumber, number);
      assert.equal((await rpc("issueOfficialCertificate", {})).isExisting, true);
      stage = "regular-student-denied-admin-mutation";
      await assert.rejects(() => rpc("adminRevokeCertificate", { certificateNumber: number, reason: "Synthetic unauthorized request" }), /Access denied/);
      // Temporary administrator authority is confined to this freshly created,
      // marked development fixture and is removed below before fixture cleanup.
      stage = "temporary-fixture-admin";
      await success(await api("/auth/v1/admin/users/" + userId, { method: "PUT", body: { app_metadata: { ovu_migration_fixture: runId, role: "admin" } } }));
      const refreshed = await success(await api("/auth/v1/token?grant_type=refresh_token", { method: "POST", publicOnly: true, body: { refresh_token: signed.refresh_token } }));
      accessToken = refreshed.access_token;
      stage = "audited-certificate-admin-workflow";
      const corrected = await rpc("adminCorrectCertificate", { certificateNumber: number, reason: "Synthetic QA correction", updatedCertificateName: "Corrected Synthetic QA Learner" });
      assert.equal(corrected.certificate.certificateName, "Corrected Synthetic QA Learner");
      assert.equal((await rpc("verifyCertificatePublic", { certificateId: number }, true, "GET")).isValid, true);
      const reissued = await rpc("adminReissueCertificate", { certificateNumber: number, reason: "Synthetic QA reissue" });
      const replacement = reissued.newCertificate.certificateNumber;
      assert.notEqual(replacement, number);
      assert.equal((await rpc("adminReissueCertificate", { certificateNumber: number, reason: "Synthetic QA retry" })).newCertificate.certificateNumber, replacement);
      const details = await rpc("adminGetCertificateDetails", { certificateNumber: replacement });
      assert.equal(details.assessmentEvidence.totalModulesCompleted, 24); assert.equal(details.assessmentEvidence.examPassed, true);
      assert.equal((await rpc("verifyCertificatePublic", { certificateId: number }, true, "GET")).status, "superseded");
      await rpc("adminRevokeCertificate", { certificateNumber: replacement, reason: "Synthetic QA revocation" });
      await rpc("adminRevokeCertificate", { certificateNumber: replacement, reason: "Synthetic QA retry" });
      assert.equal((await rpc("verifyCertificatePublic", { certificateId: replacement }, true, "GET")).status, "revoked");
      for (const action of ["issue_certificate", "correct_certificate", "reissue_certificate", "revoke_certificate"]) {
        const rows = await success(await api(`/rest/v1/academy_audit_log?select=id&actor_id=eq.${userId}&action=eq.${action}`));
        assert.equal(rows.length, 1);
      }
      stage = "stale-admin-claims-denied-after-role-removal";
      await success(await api("/auth/v1/admin/users/" + userId, { method: "PUT", body: { app_metadata: { ovu_migration_fixture: runId, role: null } } }));
      await assert.rejects(() => rpc("adminRevokeCertificate", { certificateNumber: replacement, reason: "Synthetic stale-role request" }), /Access denied/);
      assert.deepEqual(await success(await api(`/rest/v1/access_passes?select=*&user_id=eq.${userId}`)), []);
      Object.assign(report.checks, { all24Modules: true, sixStageAwards: true, officialFinalAt80: true, concurrentCertificateIssuance: true,
        certificateRestartRecovery: true, privatePublicRedaction: true, privateAnonymousExportsDenied: true, ownerPdfBothThemes: true,
        ownerOpenBadges: true, rawCertificateRls: true, regularStudentAdminDenied: true, correction: true, reissueLineageRetry: true,
        revocationRetry: true, atomicAdminAuditCounts: true, staleAdminClaimsDenied: true, temporaryFixtureAdminRemoved: true,
        explicitPublicSharing: true, minorPublicSharingDeniedWithoutConsent: true });
      report.completed = true;
    }
  }
  report.precedingIdentityCount = precedingIds.length;
} catch (error) {
  const categories = ["No Start context", "Official assessment could not be saved", "Official assessment storage is unavailable", "Official assessment was not confirmed", "Invalid authentication", "Attempt ownership mismatch"];
  report.failure = { stage, lastRpc, type: error?.name ?? "Error", category: categories.find(value => String(error?.message).includes(value)) ?? "Protocol or assertion failure",
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
else console.log("PASS: actual Supabase + built Worker restart/retries/permissions" +
  (certificationFixtures ? ", all 24 modules and certification/admin/privacy workflows" : completionFixtures ? ", concurrent controlled stage fixtures" : ", no awards") +
  "; no paid access; owned synthetic fixture removed");
