import { readFile } from "node:fs/promises";

export async function durableAcademyMigrationBundle() {
  const migration = await readFile(new URL("../drizzle/migrations/0008_durable_official_assessments.sql", import.meta.url), "utf8");
  return `-- New OVU project pdvwkdggyyrfkoqrpbji only; no award or customer import.
BEGIN;
SET LOCAL lock_timeout='5s';
SET LOCAL statement_timeout='30s';
DO $before$ BEGIN
 PERFORM set_config('ovu_academy.attempt_digest',(SELECT md5(coalesce(jsonb_agg(to_jsonb(a)-'mode'-'session_id'-'learning_level'-'course_version' ORDER BY a.id)::text,'[]')) FROM public.academy_assessment_attempts a),true);
 PERFORM set_config('ovu_academy.eligibility_digest',(SELECT md5(coalesce(jsonb_agg(to_jsonb(e) ORDER BY e.id)::text,'[]')) FROM public.academy_certificate_eligibility e),true);
 PERFORM set_config('ovu_academy.certificate_digest',(SELECT md5(coalesce(jsonb_agg(to_jsonb(c) ORDER BY c.id)::text,'[]')) FROM public.academy_certificates c),true);
END $before$;
${migration}
DO $after$ BEGIN
 IF (SELECT md5(coalesce(jsonb_agg(to_jsonb(a)-'mode'-'session_id'-'learning_level'-'course_version' ORDER BY a.id)::text,'[]')) FROM public.academy_assessment_attempts a)<>current_setting('ovu_academy.attempt_digest') THEN RAISE EXCEPTION 'Assessment records changed; rolling back'; END IF;
 IF (SELECT md5(coalesce(jsonb_agg(to_jsonb(e) ORDER BY e.id)::text,'[]')) FROM public.academy_certificate_eligibility e)<>current_setting('ovu_academy.eligibility_digest') THEN RAISE EXCEPTION 'Eligibility records changed; rolling back'; END IF;
 IF (SELECT md5(coalesce(jsonb_agg(to_jsonb(c) ORDER BY c.id)::text,'[]')) FROM public.academy_certificates c)<>current_setting('ovu_academy.certificate_digest') THEN RAISE EXCEPTION 'Certificate records changed; rolling back'; END IF;
END $after$;
COMMIT;
SELECT 'Durable official assessment schema installed; existing attempts, eligibility and certificates preserved' AS migration_result;
`;
}

export const completionIntegrityTables = ["academy_verified_completions", "academy_module_progress", "academy_stage_achievements", "academy_stage_badges", "academy_certificate_eligibility", "academy_audit_log", "academy_activity_evidence", "academy_certificates", "access_passes"];
const completionRecord = table => table === "academy_activity_evidence" ? "to_jsonb(r)-'client_event_id'-'payload_fingerprint'" : "to_jsonb(r)";

export function atomicCompletionPreflightQuery() {
  return `SELECT jsonb_build_object('captured_at',now(),
 'digests',jsonb_build_object(${completionIntegrityTables.map(table => `'${table}',(SELECT md5(coalesce(jsonb_agg(${completionRecord(table)} ORDER BY r.id)::text,'[]')) FROM public.${table} r)`).join(",\n")}),
 'counts',jsonb_build_object(${completionIntegrityTables.map(table => `'${table}',(SELECT count(*) FROM public.${table})`).join(",\n")}),
 'modules',(SELECT coalesce(jsonb_agg(jsonb_build_object('id',id,'stageId',stage_id) ORDER BY id),'[]') FROM public.academy_modules WHERE course_id='cosmic_journey'),
 'core_lesson_ids',(SELECT coalesce(jsonb_agg(id ORDER BY id),'[]') FROM public.academy_lessons WHERE id=module_id||'-core'),
 'functions',(SELECT coalesce(jsonb_agg(jsonb_build_object('name',p.proname,'arguments',pg_get_function_identity_arguments(p.oid),'definition',pg_get_functiondef(p.oid),'privileges',p.proacl::text)),'[]') FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname IN ('academy_apply_verified_completion','academy_sync_stage_achievements','academy_record_lesson_progress')),
 'evidence_policies',(SELECT coalesce(jsonb_agg(to_jsonb(p)),'[]') FROM pg_policies p WHERE schemaname='public' AND tablename='academy_activity_evidence')) AS completion_preflight;`;
}

export async function atomicCompletionMigrationBundle() {
  const migration = await readFile(new URL("../drizzle/migrations/0009_atomic_module_completion.sql", import.meta.url), "utf8");
  const digest = table => `(SELECT md5(coalesce(jsonb_agg(${completionRecord(table)} ORDER BY r.id)::text,'[]')) FROM public.${table} r)`;
  return `-- New OVU project pdvwkdggyyrfkoqrpbji only; installs functions/policy, grants no awards.
BEGIN;
SET LOCAL lock_timeout='5s';
SET LOCAL statement_timeout='30s';
DO $before$ BEGIN
${completionIntegrityTables.map(table => ` PERFORM set_config('ovu_completion.${table}',${digest(table)},true);`).join("\n")}
END $before$;
${migration}
DO $after$ BEGIN
${completionIntegrityTables.map(table => ` IF ${digest(table)}<>current_setting('ovu_completion.${table}') THEN RAISE EXCEPTION 'Existing ${table} records changed; rolling back'; END IF;`).join("\n")}
END $after$;
COMMIT;
SELECT 'Atomic completion, achievements and reading schema installed; existing records preserved' AS migration_result;
`;
}

export const certificateIntegrityTables = [...completionIntegrityTables, "student_profiles", "academy_assessment_attempts", "academy_assessment_sessions"];
const certificateRowOrder = table => table === "student_profiles" ? "r.user_id" : "r.id";
export function certificatePreflightQuery() {
  return `SELECT jsonb_build_object('captured_at',now(),'digests',jsonb_build_object(${certificateIntegrityTables.map(table => `'${table}',(SELECT md5(coalesce(jsonb_agg(to_jsonb(r) ORDER BY ${certificateRowOrder(table)})::text,'[]')) FROM public.${table} r)`).join(",")}),
 'counts',jsonb_build_object(${certificateIntegrityTables.map(table => `'${table}',(SELECT count(*) FROM public.${table})`).join(",")}),
 'functions',(SELECT coalesce(jsonb_agg(jsonb_build_object('name',p.proname,'arguments',pg_get_function_identity_arguments(p.oid),'definition',pg_get_functiondef(p.oid),'privileges',p.proacl::text)),'[]') FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname IN ('academy_certificate_context','academy_insert_signed_certificate','academy_issue_certificate','academy_admin_certificate_change')),
 'policies',(SELECT coalesce(jsonb_agg(to_jsonb(p)),'[]') FROM pg_policies p WHERE schemaname='public' AND tablename='academy_certificates'),
 'indexes',(SELECT coalesce(jsonb_agg(to_jsonb(i)),'[]') FROM pg_indexes i WHERE schemaname='public' AND tablename='academy_certificates')) AS certificate_preflight;`;
}
export async function atomicCertificateMigrationBundle() {
  const migration = await readFile(new URL("../drizzle/migrations/0010_atomic_certificates.sql", import.meta.url), "utf8");
  const digest = table => `(SELECT md5(coalesce(jsonb_agg(to_jsonb(r) ORDER BY ${certificateRowOrder(table)})::text,'[]')) FROM public.${table} r)`;
  return `-- New OVU development project pdvwkdggyyrfkoqrpbji only; no certificate issuance/customer import.
BEGIN;
SET LOCAL lock_timeout='5s'; SET LOCAL statement_timeout='30s';
DO $before$ BEGIN
${certificateIntegrityTables.map(table => `PERFORM set_config('ovu_certificate.${table}',${digest(table)},true);`).join("\n")}
END $before$;
${migration}
DO $after$ BEGIN
${certificateIntegrityTables.map(table => `IF ${digest(table)}<>current_setting('ovu_certificate.${table}') THEN RAISE EXCEPTION 'Existing ${table} records changed; rolling back'; END IF;`).join("\n")}
END $after$;
COMMIT;
SELECT 'Atomic certificate functions and privacy policy installed; all existing records preserved' AS migration_result;
`;
}
