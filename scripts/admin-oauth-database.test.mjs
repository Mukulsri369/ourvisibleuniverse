import assert from "node:assert/strict";
import { before, after, test } from "node:test";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { adminOAuthMigrationBundle } from "./admin-oauth-migration-bundle.mjs";

// Real PostgreSQL engine, isolated synthetic rows. No network, Supabase or payment keys.
const db = new PGlite();
const owner = crypto.randomUUID(), alice = crypto.randomUUID(), bob = crypto.randomUUID();
const sql = async name => readFile(new URL(`../drizzle/migrations/${name}.sql`, import.meta.url), "utf8");
const migrations = ["0006_independent_administration", "0007_scoped_oauth_access"];
async function actor(id, operation, clientId) {
  await db.exec("SET ROLE authenticated");
  await db.query("SELECT set_config('request.jwt.claims',$1,false)", [JSON.stringify({ sub: id, role: "authenticated", ...(clientId ? { client_id: clientId } : {}) })]);
  try { return await operation(); } finally { await db.exec("RESET ROLE"); }
}
async function grant(days, request = crypto.randomUUID(), env = "sandbox", reason = "Synthetic access test") {
  return actor(owner, async () => (await db.query("SELECT public.admin_grant_access('alice@example.test',$1,$2,$3,$4) AS result", [days, env, reason, request])).rows[0].result);
}
before(async () => {
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
    CREATE SCHEMA auth;
    CREATE TABLE auth.users(id uuid PRIMARY KEY,email text,email_confirmed_at timestamptz,raw_user_meta_data jsonb DEFAULT '{}'::jsonb,raw_app_meta_data jsonb DEFAULT '{}'::jsonb);
    CREATE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE AS $$ SELECT coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb $$;
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(auth.jwt()->>'sub','')::uuid $$;
    GRANT USAGE ON SCHEMA auth,public TO anon,authenticated,service_role;`);
  for (const migration of ["0000_create_paid_access_passes", "0001_add_atomic_access_activation", "0003_create_academy_student_profiles", "0004_create_secure_learning_database"]) await db.exec(await sql(migration));
  // Supabase defaults grant table access; policies must enforce the actual boundary.
  await db.exec("GRANT SELECT,INSERT,UPDATE,DELETE ON ALL TABLES IN SCHEMA public TO authenticated");
  for (const migration of migrations) await db.exec(await sql(migration));
  await db.query("INSERT INTO auth.users(id,email,email_confirmed_at,raw_user_meta_data) VALUES($1,'owner@example.test',now(),'{}'),($2,'alice@example.test',now(),'{\"role\":\"admin\"}'),($3,'bob@example.test',now(),'{}')", [owner, alice, bob]);
});
after(() => db.close());

test("review bundle applies atomically and preserves existing access/certificate rows", async () => {
  const bundle = await adminOAuthMigrationBundle();
  await db.exec(bundle);
  await db.exec(bundle);
  // Deliberately corrupt the reviewed transaction to exercise the guard and rollback.
  const altered = bundle.replace("DO $integrity$ BEGIN", "DELETE FROM public.access_passes; DO $integrity$ BEGIN");
  await db.query("INSERT INTO public.access_passes(user_id,payment_session_id,price_id,access_days,environment,expires_at) VALUES($1,'bundle-fixture','test',30,'sandbox',now()+interval '30 days')", [bob]);
  await assert.rejects(() => db.exec(altered), /Access records changed/);
  await db.exec("ROLLBACK");
  assert.equal((await db.query("SELECT count(*)::int AS count FROM public.access_passes WHERE payment_session_id='bundle-fixture'")).rows[0].count, 1);
  await db.exec("DELETE FROM public.access_passes WHERE payment_session_id='bundle-fixture'");
});

test("admin migration is repeatable and grants nobody implicit authority", async () => {
  for (const migration of migrations) await db.exec(await sql(migration));
  for (const id of [owner, alice, bob]) assert.equal(await actor(id, async () => (await db.query("SELECT public.is_subscription_admin() AS value")).rows[0].value), false);
  await assert.rejects(() => actor(alice, () => db.query("SELECT public.admin_list_subscribers()")), /Administrator access required/);
  await db.exec("SET ROLE anon");
  try { await assert.rejects(() => db.query("SELECT public.admin_list_subscribers()"), /permission denied/); }
  finally { await db.exec("RESET ROLE"); }
  await db.query("UPDATE auth.users SET raw_app_meta_data='{\"role\":\"admin\"}' WHERE id=$1", [owner]);
  assert.equal(await actor(owner, async () => (await db.query("SELECT public.is_subscription_admin() AS value")).rows[0].value), true);
});

test("trusted admin authority cannot be delegated through an OAuth token", async () => {
  assert.equal(await actor(owner, async () => (await db.query("SELECT public.is_subscription_admin() AS value")).rows[0].value, "test-oauth-client"), false);
  await assert.rejects(() => actor(owner, () => db.query("SELECT public.admin_list_subscribers()"), "test-oauth-client"), /Administrator access required/);
  await db.query("UPDATE auth.users SET email_confirmed_at=NULL WHERE id=$1", [owner]);
  assert.equal(await actor(owner, async () => (await db.query("SELECT public.is_subscription_admin() AS value")).rows[0].value), false);
  await db.query("UPDATE auth.users SET email_confirmed_at=now() WHERE id=$1", [owner]);
});

test("manual grants are atomic, audited, idempotent and isolated by environment", async () => {
  const id = crypto.randomUUID();
  const first = await grant(30, id), retry = await grant(30, id);
  assert.deepEqual(first, retry);
  assert.equal((await db.query("SELECT count(*)::int AS count FROM public.access_admin_audit")).rows[0].count, 1);
  assert.equal((await db.query("SELECT count(*)::int AS count FROM public.access_passes")).rows[0].count, 1);
  await assert.rejects(() => grant(180, id), /does not match/);
  const extended = await grant(180);
  assert.equal(new Date(extended.expiresAt) - new Date(first.expiresAt), 180 * 86400000);
  const live = await actor(owner, async () => (await db.query("SELECT public.admin_list_subscribers('live') AS page")).rows[0].page);
  assert.equal(live.total, 0);
  const sandbox = await actor(owner, async () => (await db.query("SELECT public.admin_list_subscribers('sandbox') AS page")).rows[0].page);
  assert.equal(sandbox.total, 1);
  await assert.rejects(() => actor(alice, () => db.query("SELECT * FROM public.access_admin_audit")), /permission denied/);
});

test("null/invalid grant input and changed retries cannot mutate data", async () => {
  const before = (await db.query("SELECT count(*)::int AS count FROM public.access_passes")).rows[0].count;
  for (const [email, days, env, reason, id] of [
    [null, 30, "sandbox", "Synthetic test", crypto.randomUUID()],
    ["alice@example.test", null, "sandbox", "Synthetic test", crypto.randomUUID()],
    ["alice@example.test", 30, null, "Synthetic test", crypto.randomUUID()],
    ["alice@example.test", 30, "sandbox", null, crypto.randomUUID()],
    ["alice@example.test", 30, "sandbox", "Synthetic test", null],
    ["alice@example.test", 1, "sandbox", "Synthetic test", crypto.randomUUID()],
  ]) await assert.rejects(() => actor(owner, () => db.query("SELECT public.admin_grant_access($1,$2,$3,$4,$5)", [email, days, env, reason, id])), /Invalid grant/);
  assert.equal((await db.query("SELECT count(*)::int AS count FROM public.access_passes")).rows[0].count, before);
  await assert.rejects(() => actor(owner, () => db.query("SELECT public.admin_list_subscribers(NULL)")), /Invalid filters/);
});

test("audit insertion failure rolls back the access extension in the same transaction", async () => {
  const before = await db.query("SELECT count(*)::int AS count,max(expires_at) AS expiry FROM public.access_passes WHERE user_id=$1", [alice]);
  await db.exec(`CREATE FUNCTION public.fail_synthetic_audit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Synthetic audit failure'; END $$;
    CREATE TRIGGER synthetic_audit_failure BEFORE INSERT ON public.access_admin_audit FOR EACH ROW EXECUTE FUNCTION public.fail_synthetic_audit();`);
  try { await assert.rejects(() => grant(365), /Synthetic audit failure/); }
  finally { await db.exec("DROP TRIGGER synthetic_audit_failure ON public.access_admin_audit; DROP FUNCTION public.fail_synthetic_audit()"); }
  assert.deepEqual((await db.query("SELECT count(*)::int AS count,max(expires_at) AS expiry FROM public.access_passes WHERE user_id=$1", [alice])).rows, before.rows);
});

test("OAuth summary reveals only its own user and environment without payment identifiers", async () => {
  await db.query("INSERT INTO public.access_passes(user_id,payment_session_id,payment_customer_id,price_id,access_days,environment,expires_at) VALUES($1,'private-bob-payment','private-customer','test',30,'sandbox',now()+interval '30 days')", [bob]);
  for (const id of [alice, bob]) {
    const direct = await actor(id, () => db.query("SELECT * FROM public.access_passes"), "test-oauth-client");
    assert.equal(direct.rows.length, 0);
    const summary = await actor(id, () => db.query("SELECT * FROM public.get_my_access_summary('sandbox')"), "test-oauth-client");
    assert.equal(summary.rows.length, id === alice ? 2 : 1);
    assert.deepEqual(Object.keys(summary.rows[0]).sort(), ["access_days", "expires_at", "starts_at", "status"]);
    assert.ok(!JSON.stringify(summary.rows).includes("private-bob-payment"));
  }
  assert.equal((await actor(alice, () => db.query("SELECT * FROM public.get_my_access_summary('live')"), "test-oauth-client")).rows.length, 0);
  await assert.rejects(() => actor(alice, () => db.query("SELECT public.apply_access_purchase($1,'forged',NULL,'fake',365,'sandbox')", [alice]), "test-oauth-client"), /permission denied/);
});

test("OAuth cannot read or update Academy profiles, including an administrator's own profile", async () => {
  await db.query("INSERT INTO public.student_profiles(user_id,student_public_id,display_name,certificate_name) VALUES($1,'STU-SAFE1111','Synthetic learner','Private learner')", [owner]);
  assert.equal((await actor(owner, () => db.query("SELECT * FROM public.student_profiles"))).rows.length, 1);
  assert.equal((await actor(owner, () => db.query("SELECT * FROM public.student_profiles"), "test-oauth-client")).rows.length, 0);
  assert.equal((await actor(owner, () => db.query("UPDATE public.student_profiles SET display_name='forged' RETURNING *"), "test-oauth-client")).rows.length, 0);
  assert.equal((await actor(owner, () => db.query("SELECT display_name FROM public.student_profiles"))).rows[0].display_name, "Synthetic learner");
});
