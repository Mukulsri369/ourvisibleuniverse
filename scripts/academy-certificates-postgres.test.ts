import assert from "node:assert/strict";
import { before, after, test } from "node:test";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { academyPostgresFetch } from "./helpers/academy-postgres-rest.mjs";
import { atomicCertificateMigrationBundle } from "./academy-migration-bundle.mjs";

process.env.NODE_ENV = "production";
process.env.SUPABASE_URL = "http://127.0.0.1:37999";
process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_secret_synthetic_postgres_test_only";
process.env.CERTIFICATE_SIGNING_SECRET = "synthetic-certificate-postgres-key-at-least-32-characters";
const db = new PGlite(), user = crypto.randomUUID(), other = crypto.randomUUID(), actor = crypto.randomUUID();
const control = { unavailable: false, failProfile: false }, priorFetch = globalThis.fetch;
globalThis.fetch = academyPostgresFetch(() => db, control);
const { issueOfficialCertificateServer, verifyCertificatePublicServer } = await import("../src/lib/academy/certificate.server");
const { changeCertificateTransaction } = await import("../src/lib/academy/certificate-transactions.server");
const { certificateForExport } = await import("../src/lib/academy/certificate-access.server");
const { certificateHashMatches } = await import("../src/lib/academy/certificate-integrity.server");
const { startAssessmentServer, submitAssessmentAttemptServer } = await import("../src/lib/academy/assessment.server");
const { FINAL_EXAM_QUESTION_BANK } = await import("../src/lib/academy/final-exam-bank.server");
let number: string, replacement: string;
before(async () => {
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
    CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid PRIMARY KEY);
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT nullif(current_setting('test.user_id',true),'')::uuid $$;`);
  for (const name of ["0000_create_paid_access_passes", "0003_create_academy_student_profiles", "0004_create_secure_learning_database",
    "0008_durable_official_assessments", "0009_atomic_module_completion", "0010_atomic_certificates"])
    await db.exec(await readFile(new URL(`../drizzle/migrations/${name}.sql`, import.meta.url), "utf8"));
  await db.query("INSERT INTO auth.users(id) VALUES($1),($2),($3)", [user, other, actor]);
  await db.query("INSERT INTO public.student_profiles(user_id,student_public_id,display_name,certificate_name,age_bracket,profile_visibility) VALUES($1,'STU-CERT-QA','Private Fixture Alias','Private Fixture Full Name','18_plus','private')", [user]);
  await qualify(user, 16);
});
after(async () => { globalThis.fetch = priorFetch; await db.close(); });
async function qualify(id: string, correct: number) {
  await db.query("INSERT INTO public.academy_verified_completions(user_id,module_id,idempotency_key) SELECT $1::uuid,id,'cert-fixture:'||$1::text||':'||id FROM public.academy_modules ON CONFLICT DO NOTHING", [id]);
  const session = await startAssessmentServer({ userId: id, moduleId: "exam", level: "explorer", mode: "official" });
  await db.query("UPDATE public.academy_assessment_sessions SET started_at=now()-interval '10 seconds' WHERE id=$1", [session.attemptId]);
  return submitAssessmentAttemptServer({ userId: id, attemptId: session.attemptId, moduleId: "exam", level: "explorer", mode: "official", clientDurationSeconds: 60,
    answers: Object.fromEntries(session.questions.map((q, index) => [q.id, index < correct ? FINAL_EXAM_QUESTION_BANK.find(item => item.id === q.id)!.correctAnswer : -1])) });
}
async function certificate(num: string) { return (await db.query("SELECT * FROM public.academy_certificates WHERE certificate_number=$1", [num])).rows[0]; }
async function failAudit(action: string) {
  await db.exec(`CREATE FUNCTION public.fail_certificate_audit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.action='${action}' THEN RAISE EXCEPTION 'Synthetic certificate audit outage'; END IF; RETURN NEW; END $$;
    CREATE TRIGGER fail_certificate_audit BEFORE INSERT ON public.academy_audit_log FOR EACH ROW EXECUTE FUNCTION public.fail_certificate_audit();`);
}
async function recoverAudit() { await db.exec("DROP TRIGGER fail_certificate_audit ON public.academy_audit_log; DROP FUNCTION public.fail_certificate_audit()"); }
async function auditCount(action: string) { return (await db.query<{ n: number }>("SELECT count(*)::int AS n FROM public.academy_audit_log WHERE action=$1", [action])).rows[0].n; }

test("cached eligibility and a passing practice attempt cannot qualify a certificate", async () => {
  await db.query("INSERT INTO public.academy_certificate_eligibility(user_id,course_id,course_version,all_stages_completed,final_exam_passed,final_exam_score_pct) VALUES($1,'cosmic_journey','1.0.0',true,true,100)", [other]);
  await db.query("INSERT INTO public.academy_assessment_attempts(user_id,assessment_id,answers_payload,score,total_points,percentage,passed,mode) VALUES($1,'cosmic_explorer_final_exam','{}',20,20,100,true,'practice')", [other]);
  await assert.rejects(() => issueOfficialCertificateServer(other), /issuance denied/);
  assert.equal((await db.query("SELECT * FROM public.academy_certificates")).rows.length, 0);
});
test("missing signing key or a storage outage never creates a certificate", async () => {
  const secret = process.env.CERTIFICATE_SIGNING_SECRET;
  try { delete process.env.CERTIFICATE_SIGNING_SECRET; await assert.rejects(() => issueOfficialCertificateServer(user), /signing|private|secret/i); }
  finally { process.env.CERTIFICATE_SIGNING_SECRET = secret; }
  control.unavailable = true;
  try { await assert.rejects(() => issueOfficialCertificateServer(user), /storage unavailable/); }
  finally { control.unavailable = false; }
  assert.equal((await db.query("SELECT * FROM public.academy_certificates")).rows.length, 0);
});
test("concurrent production issuance returns one certificate, one audit and the actual earned level", async () => {
  const results = await Promise.all(Array.from({ length: 4 }, () => issueOfficialCertificateServer(user, "astronomer")));
  assert.equal(new Set(results.map(row => row.certificate.id)).size, 1);
  assert.equal(results.filter(row => !row.isExisting).length, 1);
  assert.equal(results[0].certificate.finalScorePercentage, 80);
  assert.equal(results[0].certificate.learningLevel, "explorer");
  number = results[0].certificate.certificateNumber;
  assert.equal((await certificate(number)).metadata.signatureVersion, 2);
  assert.equal(await auditCount("issue_certificate"), 1);
});
test("v2 integrity binds the recipient identity, level and curriculum while preserving valid verification", async () => {
  const row = await certificate(number);
  assert.equal(certificateHashMatches(row), true);
  for (const change of [{ certificate_name: "Forged Name" }, { display_name: "Forged Alias" }, { learning_level: "astronomer" }, { student_public_id: "STU-FORGED" }, { curriculum_version: "forged" }, { metadata: { signatureVersion: 3 } }])
    assert.equal(certificateHashMatches({ ...row, ...change }), false);
  assert.equal((await verifyCertificatePublicServer(number)).isValid, true);
});
test("private and minor identities stay redacted; exports require ownership, administration or explicit public consent", async () => {
  const publicResult = await verifyCertificatePublicServer(number);
  assert.equal(publicResult.studentName, "Verified Explorer");
  await assert.rejects(() => certificateForExport(number), /download is private/);
  await assert.rejects(() => certificateForExport(number, other), /download is private/);
  assert.equal((await certificateForExport(number, user)).certificate_number, number);
  await db.query("UPDATE public.student_profiles SET profile_visibility='public' WHERE user_id=$1", [user]);
  assert.equal((await certificateForExport(number)).certificate_number, number);
  await db.query("UPDATE public.student_profiles SET age_bracket='under_13',guardian_consent_status='pending_guardian' WHERE user_id=$1", [user]);
  assert.equal((await verifyCertificatePublicServer(number)).studentName, "Verified Student");
  await assert.rejects(() => certificateForExport(number), /download is private/);
  await db.query("UPDATE public.student_profiles SET guardian_consent_status='guardian_consented' WHERE user_id=$1", [user]);
  assert.equal((await certificateForExport(number)).certificate_number, number);
  control.failProfile = true;
  try {
    assert.equal((await verifyCertificatePublicServer(number)).studentName, "Verified Explorer");
    await assert.rejects(() => certificateForExport(number), /download is private/);
    assert.equal((await certificateForExport(number, user)).certificate_number, number);
  } finally { control.failProfile = false; }
  await db.query("UPDATE public.student_profiles SET profile_visibility='private',age_bracket='18_plus' WHERE user_id=$1", [user]);
});
test("qualification is rechecked after the signing context, independently of cached eligibility", async () => {
  await qualify(other, 20);
  const context = (await db.query<{ context: { attemptId: string } }>("SELECT public.academy_certificate_context($1) AS context", [other])).rows[0].context;
  await db.query("DELETE FROM public.academy_verified_completions WHERE user_id=$1 AND module_id='24'", [other]);
  await assert.rejects(() => db.query("SELECT public.academy_issue_certificate($1,$2,'{}')", [other, context.attemptId]), /issuance denied/);
  await db.query("INSERT INTO public.academy_verified_completions(user_id,module_id,idempotency_key) VALUES($1,'24','restored-cert-fixture-24')", [other]);
});
test("issuance rolls back when the audit cannot persist", async () => {
  await failAudit("issue_certificate");
  try { await assert.rejects(() => issueOfficialCertificateServer(other), /not confirmed/); }
  finally { await recoverAudit(); }
  assert.equal((await db.query("SELECT * FROM public.academy_certificates WHERE user_id=$1", [other])).rows.length, 0);
  assert.equal((await issueOfficialCertificateServer(other)).isExisting, false);
  assert.equal(await auditCount("issue_certificate"), 2);
});

test("the exact certificate migration is repeatable, preserves records and rolls back injected deletion", async () => {
  const bundle = await atomicCertificateMigrationBundle();
  await db.exec(bundle); await db.exec(bundle);
  const before = (await db.query("SELECT * FROM public.academy_certificates ORDER BY id")).rows;
  await assert.rejects(() => db.exec(bundle.replace("DO $after$ BEGIN", "DELETE FROM public.academy_certificates; DO $after$ BEGIN")), /Existing academy_certificates records changed/);
  await db.exec("ROLLBACK");
  assert.deepEqual((await db.query("SELECT * FROM public.academy_certificates ORDER BY id")).rows, before);
});
test("correction and its audit roll back together, then an identical retry adds no audit", async () => {
  const before = await certificate(number);
  await failAudit("correct_certificate");
  try { await assert.rejects(() => changeCertificateTransaction(actor, number, "correct", "Synthetic name correction", { updatedCertificateName: "Corrected Fixture Name" }), /not confirmed/); }
  finally { await recoverAudit(); }
  assert.deepEqual(await certificate(number), before);
  const corrected = await changeCertificateTransaction(actor, number, "correct", "Synthetic name correction", { updatedCertificateName: "Corrected Fixture Name" });
  assert.equal(certificateHashMatches(corrected.certificate), true);
  assert.equal(corrected.certificate.certificate_name, "Corrected Fixture Name");
  await changeCertificateTransaction(actor, number, "correct", "Synthetic retry", { updatedCertificateName: "Corrected Fixture Name" });
  assert.equal(await auditCount("correct_certificate"), 1);
});
test("failed reissuance preserves the original; successful retries retain exactly one replacement and lineage", async () => {
  const before = await certificate(number);
  await failAudit("reissue_certificate");
  try { await assert.rejects(() => changeCertificateTransaction(actor, number, "reissue", "Synthetic reissue"), /not confirmed/); }
  finally { await recoverAudit(); }
  assert.deepEqual(await certificate(number), before);
  const reissued = await changeCertificateTransaction(actor, number, "reissue", "Synthetic reissue");
  replacement = reissued.certificate.certificate_number;
  assert.notEqual(replacement, number); assert.equal(certificateHashMatches(reissued.certificate), true);
  assert.equal((await certificate(number)).status, "superseded");
  assert.equal((await certificate(number)).metadata.supersededBy, replacement);
  assert.equal(reissued.certificate.metadata.supersedes, number);
  const retry = await changeCertificateTransaction(actor, number, "reissue", "Synthetic retry");
  assert.equal(retry.certificate.certificate_number, replacement);
  assert.equal(await auditCount("reissue_certificate"), 1);
});
test("revocation is durable, audited once and cannot report success during an audit outage", async () => {
  await failAudit("revoke_certificate");
  try { await assert.rejects(() => changeCertificateTransaction(actor, replacement, "revoke", "Synthetic revocation"), /not confirmed/); }
  finally { await recoverAudit(); }
  assert.equal((await certificate(replacement)).status, "active");
  await changeCertificateTransaction(actor, replacement, "revoke", "Synthetic revocation");
  await changeCertificateTransaction(actor, replacement, "revoke", "Synthetic retry");
  assert.equal((await verifyCertificatePublicServer(replacement)).status, "revoked");
  assert.equal(await auditCount("revoke_certificate"), 1);
});
test("raw certificate RLS denies anonymous and other-user reads; transaction helpers deny caller execution", async () => {
  await db.exec("SET ROLE anon");
  try { assert.equal((await db.query("SELECT * FROM public.academy_certificates")).rows.length, 0); }
  finally { await db.exec("RESET ROLE"); }
  await db.query("SELECT set_config('test.user_id',$1,false)", [actor]);
  await db.exec("SET ROLE authenticated");
  try {
    assert.equal((await db.query("SELECT * FROM public.academy_certificates")).rows.length, 0);
    await assert.rejects(() => db.query("SELECT public.academy_certificate_context($1)", [user]), /permission denied/);
    await assert.rejects(() => db.query("SELECT public.academy_issue_certificate($1,NULL,'{}')", [user]), /permission denied/);
    await assert.rejects(() => db.query("SELECT public.academy_admin_certificate_change($1,'x','revoke','x')", [actor]), /permission denied/);
    await assert.rejects(() => db.exec("SELECT public.academy_insert_signed_certificate('{}')"), /permission denied/);
  } finally { await db.exec("RESET ROLE"); }
  await db.query("SELECT set_config('test.user_id',$1,false)", [user]); await db.exec("SET ROLE authenticated");
  try { assert.equal((await db.query("SELECT * FROM public.academy_certificates")).rows.length, 2); }
  finally { await db.exec("RESET ROLE"); }
});
