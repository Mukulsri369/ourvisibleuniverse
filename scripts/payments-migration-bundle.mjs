import { readFile } from "node:fs/promises";
const allocationColumns=["allocated_starts_at","allocated_expires_at","original_expires_at","parent_pass_id","allocation_version","expiry_is_fixed"];
const accessDigest=`(SELECT md5(coalesce(jsonb_agg(to_jsonb(p)-ARRAY[${allocationColumns.map(value=>`'${value}'`).join(',')}] ORDER BY p.id)::text,'[]')) FROM public.access_passes p)`;
export async function paymentDryRunBundle(){
 let migration=await readFile(new URL('../drizzle/migrations/0012_durable_payments.sql',import.meta.url),'utf8');
 migration=migration.replaceAll('public.','pg_temp.').replaceAll('auth.users','pg_temp.fixture_users')
  .replaceAll('CREATE TABLE IF NOT EXISTS pg_temp.','CREATE TEMP TABLE IF NOT EXISTS pg_temp.');
 const qa=await readFile(new URL('./payments-database-qa.sql',import.meta.url),'utf8');
 const assertions=[...qa.matchAll(/PERFORM pg_temp\.payment_assert\(/g)].length;
 return `-- DRY RUN: only this session's temporary schema; no real users/orders/entitlements mutated.
BEGIN;
SET LOCAL lock_timeout='5s'; SET LOCAL statement_timeout='30s'; SET LOCAL idle_in_transaction_session_timeout='30s';
SELECT set_config('ovu.payment_source_digest',${accessDigest},true);
CREATE TEMP TABLE fixture_users(id uuid PRIMARY KEY);
INSERT INTO pg_temp.fixture_users SELECT id FROM auth.users;
CREATE TEMP TABLE access_passes (LIKE public.access_passes INCLUDING ALL);
INSERT INTO pg_temp.access_passes SELECT * FROM public.access_passes;
${migration}
${qa}
DO $check$ BEGIN
 IF current_setting('ovu.payment_qa_checks')::integer<>${assertions} THEN RAISE EXCEPTION 'Payment QA assertion count mismatch'; END IF;
 IF ${accessDigest}<>current_setting('ovu.payment_source_digest') THEN RAISE EXCEPTION 'Real source access data changed'; END IF;
END $check$;
ROLLBACK;
SELECT jsonb_build_object('temporary_schema_payment_checks',${assertions},'real_customer_writes',0,'real_provider_calls',0,'rolled_back',true) AS payment_dry_run_result;`;
}
export async function paymentInstallationBundle(){
 const migration=await readFile(new URL('../drizzle/migrations/0012_durable_payments.sql',import.meta.url),'utf8');
 return `-- Owned OVU Supabase project only; preserve existing identity and entitlement fields.
BEGIN;
SET LOCAL lock_timeout='5s';SET LOCAL statement_timeout='30s';
SELECT set_config('ovu.payment_before_digest',${accessDigest},true);
${migration}
DO $guard$ BEGIN
 IF ${accessDigest}<>current_setting('ovu.payment_before_digest') THEN RAISE EXCEPTION 'Original entitlement fields changed; rolling back'; END IF;
END $guard$;
COMMIT;
SELECT jsonb_build_object('payment_tables_installed',4,'existing_access_records',(SELECT count(*) FROM public.access_passes),'provider_calls',0,'payment_mode_changed',false) AS payment_installation_result;`;
}
