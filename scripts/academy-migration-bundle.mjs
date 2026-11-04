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
