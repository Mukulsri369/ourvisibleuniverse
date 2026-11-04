import { readFile } from "node:fs/promises";

// Produce a reviewable transaction; never connect to or modify a remote database.
export async function adminOAuthMigrationBundle() {
  const names = ["0006_independent_administration", "0007_scoped_oauth_access"];
  const migrations = await Promise.all(names.map(name => readFile(new URL(`../drizzle/migrations/${name}.sql`, import.meta.url), "utf8")));
  return `-- TARGET: new OVU Supabase project pdvwkdggyyrfkoqrpbji only.
-- No account is promoted by this SQL. Existing access/certificate rows must stay unchanged.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';
DO $preflight$ BEGIN
 PERFORM set_config('ovu_migration.access_digest',(SELECT md5(coalesce(jsonb_agg(to_jsonb(a) ORDER BY a.id)::text,'[]')) FROM public.access_passes a),true);
 PERFORM set_config('ovu_migration.certificate_digest',(SELECT md5(coalesce(jsonb_agg(to_jsonb(c) ORDER BY c.id)::text,'[]')) FROM public.academy_certificates c),true);
END $preflight$;
${migrations.join("\n")}
DO $integrity$ BEGIN
 IF (SELECT md5(coalesce(jsonb_agg(to_jsonb(a) ORDER BY a.id)::text,'[]')) FROM public.access_passes a) <> current_setting('ovu_migration.access_digest') THEN RAISE EXCEPTION 'Access records changed; rolling back'; END IF;
 IF (SELECT md5(coalesce(jsonb_agg(to_jsonb(c) ORDER BY c.id)::text,'[]')) FROM public.academy_certificates c) <> current_setting('ovu_migration.certificate_digest') THEN RAISE EXCEPTION 'Certificate records changed; rolling back'; END IF;
END $integrity$;
COMMIT;
SELECT 'Admin schema and scoped OAuth installed; existing access and certificate records unchanged' AS migration_result;
`;
}
