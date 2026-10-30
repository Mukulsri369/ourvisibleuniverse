import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, test } from "node:test";
import { database, closeDatabase } from "../src/backend/db.server";
import {
  startStoredAssessment,
  gradeStoredAssessment,
} from "../src/backend/academy-assessments.server";
import { saveLessonProgress } from "../src/backend/academy-progress.server";
import { recordActivity, recheckCompletion } from "../src/backend/academy-completion.server";
import {
  issueCertificate,
  activeCertificate,
  verifyCertificate,
  privateCertificate,
  changeCertificate,
} from "../src/backend/academy-certificates.server";
import { getModuleCompletionRule } from "../src/lib/academy/completion-rules";
import { json } from "../src/backend/academy-common.server";
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
    [id, "Synthetic certification fixture", email],
  );
  return { id, email, emailVerified: true };
}
async function submission(actor: Principal, moduleId: string, mode = "official") {
  const start = await startStoredAssessment(actor, { moduleId, mode });
  const [rows]: any = await database().execute(
    "SELECT question_snapshot FROM academy_assessment_sessions WHERE id=?",
    [start.attemptId],
  );
  const answers = Object.fromEntries(
    json<any[]>(rows[0].question_snapshot).map((q) => [q.id, q.correctAnswer]),
  );
  await database().execute(
    "UPDATE academy_assessment_sessions SET started_at=DATE_SUB(CURRENT_TIMESTAMP(6),INTERVAL 6 SECOND) WHERE id=?",
    [start.attemptId],
  );
  return { attemptId: start.attemptId, moduleId, mode, answers };
}
const payloads: Record<string, any> = {
  "01": { stepCount: 15, minScaleMeters: 1, maxScaleMeters: 1e26 },
  "02": { alignedCount: 3, polarisLocated: true },
  "03": { parallaxArcsec: 0.772, distanceParsecs: 1.295 },
  "04": { benchmarkCount: 4, lookbackTimeGyr: 13.4 },
  "05": { nodesAligned: true, predictedCount: 2 },
  "06": { classifiedCount: 4 },
  "07": { coreTempK: 15600000, cmeTraced: true },
  "08": { eccentricity: 0.045, semiMajorAxisAU: 1, periapsisKm: 1250, success: true },
  "09": { placedCount: 5, accuracyPct: 95 },
  "10": { massSolar: 20, stagesSequenced: 5, correctSequence: true, success: true },
  "11": { cloudMassSolar: 100, jeansMassSolar: 25, collapseTriggered: true },
  "12": { transitDepthPpm: 120, radiusRatio: 0.011 },
  "13": { classifiedCount: 5 },
  "14": { massSolar: 10, radiusKm: 29.5 },
  "15": { inspectedNodes: 4 },
  "16": { darkMatterRatio: 5.2, nfwFitted: true },
  "17": { peaksAnalyzed: 3, baryonDensity: 0.022, coldDarkMatterDensity: 0.12 },
  "18": { redshift: 1.5, velocityKmS: 450000 },
  "19": { modelsCompared: 2, retrogradeDemonstrated: true },
  "20": { erasOrderedCount: 4 },
  "21": { apertureMeters: 6.5, wavelengthNm: 550, success: true },
  "22": { deltaVKmS: 7.2, flybySuccessful: true },
  "23": { biosignaturesAnalyzed: 3, methaneOxygenDetected: true },
  "24": { experimentsCompleted: 3, synthesisCalibrated: true },
};
after(async () => {
  for (const id of users) {
    await database().execute("DELETE FROM academy_certificate_operations WHERE actor_id=?", [id]);
    await database().execute("DELETE FROM academy_audit_log WHERE actor_id=?", [id]);
    await database().execute("DELETE FROM academy_verified_completions WHERE user_id=?", [id]);
    await database().execute("DELETE FROM academy_assessment_sessions WHERE user_id=?", [id]);
    await database().execute("DELETE FROM auth_user WHERE id=?", [id]);
  }
  await closeDatabase();
});

test("24-module journey atomically awards achievements and one signed certificate; rollback, restart, privacy and admin retries hold", async () => {
  const actor = await user(),
    other = await user(),
    admin = await user();
  await database().execute("INSERT INTO app_roles(user_id,role) VALUES(?,'admin')", [admin.id]);
  for (let n = 1; n <= 24; n++) {
    const moduleId = String(n).padStart(2, "0"),
      activityId = getModuleCompletionRule(moduleId)!.requiredActivities[0].id;
    const quiz = await submission(actor, moduleId);
    const scored = await gradeStoredAssessment(actor, quiz);
    assert.equal(scored.passed, true);
    assert.equal(scored.verifiedCompletionAwarded, false);
    await saveLessonProgress(actor, {
      moduleId,
      lessonId: moduleId + "-core",
      scrollDepthPercent: 80,
      timeSpentSeconds: 90,
    });
    assert.equal((await recheckCompletion(actor, moduleId)).isVerifiedComplete, false);
    const evidence = { moduleId, activityId, payload: payloads[moduleId], requestId: randomUUID() };
    const outcomes = await Promise.all([
      recordActivity(actor, evidence),
      recordActivity(actor, evidence),
    ]);
    assert.equal(outcomes[0].success, true, `module ${moduleId}: ${outcomes[0].reason}`);
    assert.equal(outcomes[0].evaluation.isVerifiedComplete, true);
    assert.equal(outcomes[0].evidenceId, outcomes[1].evidenceId);
    await assert.rejects(() => recordActivity(actor, { ...evidence, payload: {} }));
  }
  for (const [table, expected] of [
    ["academy_verified_completions", 24],
    ["academy_stage_achievements", 6],
    ["academy_activity_evidence", 24],
    ["academy_certificates", 0],
  ] as const) {
    const [rows]: any = await database().execute(
      `SELECT COUNT(*) AS n FROM ${table} WHERE user_id=?`,
      [actor.id],
    );
    assert.equal(Number(rows[0].n), expected);
  }
  const exam = await submission(actor, "exam");
  const key = process.env.CERTIFICATE_SIGNING_SECRET;
  delete process.env.CERTIFICATE_SIGNING_SECRET;
  try {
    await assert.rejects(() => gradeStoredAssessment(actor, exam), /signing configuration/);
  } finally {
    process.env.CERTIFICATE_SIGNING_SECRET = key;
  }
  const [rolled]: any = await database().execute(
    "SELECT id FROM academy_assessment_attempts WHERE user_id=? AND assessment_id='final_exam'",
    [actor.id],
  );
  assert.equal(rolled.length, 0);
  const [pending]: any = await database().execute(
    "SELECT submitted_at FROM academy_assessment_sessions WHERE id=?",
    [exam.attemptId],
  );
  assert.equal(pending[0].submitted_at, null);
  const verdicts = await Promise.all(
    Array.from({ length: 6 }, () => gradeStoredAssessment(actor, exam)),
  );
  for (const result of verdicts) {
    assert.equal(result.certificateEligible, true);
    assert.equal(result.percentage, 100);
  }
  const certificates = await Promise.all(Array.from({ length: 6 }, () => issueCertificate(actor)));
  assert.equal(new Set(certificates.map((c) => c.certificate.id)).size, 1);
  const certificate = certificates[0].certificate;
  await closeDatabase();
  assert.equal((await activeCertificate(actor))?.id, certificate.id);
  const publicResult = await verifyCertificate(certificate.certificateNumber);
  assert.equal(publicResult.isValid, true);
  assert.equal(publicResult.studentName, "Verified Student");
  assert.equal(publicResult.isMinorProtected, true);
  await assert.rejects(() => privateCertificate(other, certificate.certificateNumber));
  assert.equal((await privateCertificate(actor, certificate.certificateNumber)).id, certificate.id);
  await database().execute(
    "UPDATE academy_certificates SET certificate_name='tampered' WHERE id=?",
    [certificate.id],
  );
  assert.equal((await verifyCertificate(certificate.certificateNumber)).isValid, false);
  await database().execute("UPDATE academy_certificates SET certificate_name=? WHERE id=?", [
    certificate.certificateName,
    certificate.id,
  ]);
  const revoke = {
    requestId: randomUUID(),
    certificateNumber: certificate.certificateNumber,
    reason: "Synthetic test revocation",
  };
  await assert.rejects(() => changeCertificate(other, "revoke", revoke));
  const revoked = await Promise.all([
    changeCertificate(admin, "revoke", revoke),
    changeCertificate(admin, "revoke", revoke),
  ]);
  assert.deepEqual(revoked[0], revoked[1]);
  assert.equal((await verifyCertificate(certificate.certificateNumber)).status, "revoked");
  await assert.rejects(() => issueCertificate(actor), /administrator review/);
  const replacement = {
    requestId: randomUUID(),
    certificateNumber: certificate.certificateNumber,
    reason: "Synthetic test reissue",
    updatedCertificateName: "Corrected Explorer",
  };
  const reissued = await Promise.all([
    changeCertificate(admin, "reissue", replacement),
    changeCertificate(admin, "reissue", replacement),
  ]);
  assert.equal(reissued[0].certificate.id, reissued[1].certificate.id);
  assert.notEqual(reissued[0].certificate.id, certificate.id);
  assert.equal((await verifyCertificate(certificate.certificateNumber)).status, "superseded");
  assert.equal((await verifyCertificate(reissued[0].certificate.certificateNumber)).isValid, true);
});
