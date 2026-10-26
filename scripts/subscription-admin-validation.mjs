import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const { PGlite } = await import(
  process.env.PGLITE_MODULE ||
    new URL(
      "../.taste-skill/sql-test/node_modules/@electric-sql/pglite/dist/index.js",
      import.meta.url,
    ).href
);
const db = new PGlite();
try {
  await db.exec(
    "CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role; CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid PRIMARY KEY,email text,email_confirmed_at timestamptz,raw_user_meta_data jsonb DEFAULT '{}'::jsonb); CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS 'SELECT nullif(current_setting(''request.jwt.claim.sub'',true),'''')::uuid'; GRANT USAGE ON SCHEMA auth TO anon,authenticated,service_role;",
  );
  for (const name of [
    "0000_create_paid_access_passes.sql",
    "0001_add_atomic_access_activation.sql",
    "0005_subscription_administration.sql",
  ])
    await db.exec(
      await readFile(new URL("../drizzle/migrations/" + name, import.meta.url), "utf8"),
    );
  const owner = crypto.randomUUID(),
    user = crypto.randomUUID(),
    stranger = crypto.randomUUID(),
    unverified = crypto.randomUUID();
  await db.query(
    "INSERT INTO auth.users(id,email,email_confirmed_at,raw_user_meta_data) VALUES ($1,$2,NULL,$3),($4,$5,now(),$6),($7,$8,now(),$9),($10,$11,NULL,$12)",
    [
      owner,
      "mukul.srivastava.025@gmail.com",
      "{}",
      user,
      "anika@example.test",
      '{"full_name":"Anika Rao"}',
      stranger,
      "stranger@example.test",
      '{"role":"admin","email":"mukul.srivastava.025@gmail.com"}',
      unverified,
      "pending@example.test",
      "{}",
    ],
  );
  const actor = async (id, role, fn) => {
    await db.exec("SET ROLE " + role);
    await db.query("SELECT set_config('request.jwt.claim.sub',$1,false)", [id]);
    try {
      return await fn();
    } finally {
      await db.exec("RESET ROLE");
    }
  };
  const adminStatus = async () =>
    (await db.query("SELECT public.is_subscription_admin() AS value")).rows[0].value;
  assert.equal(
    await actor(owner, "authenticated", adminStatus),
    false,
    "Unverified owner is denied",
  );
  assert.equal(
    await actor(stranger, "authenticated", adminStatus),
    false,
    "User-editable role/email metadata cannot grant admin",
  );
  await assert.rejects(
    () =>
      actor(stranger, "authenticated", () => db.query("SELECT public.admin_list_subscribers()")),
    /Administrator access required/,
  );
  await assert.rejects(
    () => actor(stranger, "anon", () => db.query("SELECT public.admin_list_subscribers()")),
    /permission denied/,
  );
  await db.query("UPDATE auth.users SET email_confirmed_at=now() WHERE id=$1", [owner]);
  assert.equal(await actor(owner, "authenticated", adminStatus), true);
  const grant = async (email, days, id, reason = "Support access") =>
    actor(
      owner,
      "authenticated",
      async () =>
        (
          await db.query("SELECT public.admin_grant_access($1,$2,'live',$3,$4) AS value", [
            email,
            days,
            reason,
            id,
          ])
        ).rows[0].value,
    );
  const request = crypto.randomUUID(),
    first = await grant("anika@example.test", 30, request),
    retry = await grant("anika@example.test", 30, request);
  assert.deepEqual(first, retry, "Retries cannot extend twice");
  assert.equal(
    (await db.query("SELECT count(*)::int AS n FROM public.access_passes")).rows[0].n,
    1,
  );
  assert.equal(
    (await db.query("SELECT count(*)::int AS n FROM public.access_admin_audit")).rows[0].n,
    1,
  );
  await assert.rejects(() => grant("anika@example.test", 180, request), /does not match/);
  const extension = await grant("anika@example.test", 180, crypto.randomUUID());
  assert.equal(new Date(extension.expiresAt) - new Date(first.expiresAt), 180 * 86400000);
  await assert.rejects(
    () => grant("missing@example.test", 30, crypto.randomUUID()),
    /must sign in/,
  );
  await assert.rejects(
    () => grant("pending@example.test", 30, crypto.randomUUID()),
    /must sign in/,
  );
  await assert.rejects(
    () =>
      actor(stranger, "authenticated", () =>
        db.query(
          "SELECT public.admin_grant_access('anika@example.test',365,'live','Forged role',$1)",
          [crypto.randomUUID()],
        ),
      ),
    /Administrator access required/,
  );
  await assert.rejects(
    () =>
      actor(user, "authenticated", () =>
        db.query("SELECT public.apply_access_purchase($1,'forged',NULL,'fake',365,'live')", [user]),
      ),
    /permission denied/,
  );
  await db.query(
    "INSERT INTO public.access_passes(user_id,payment_session_id,price_id,access_days,environment,status,expires_at) VALUES($1,'refunded-long','test',365,'live','refunded',now()+interval '600 days')",
    [user],
  );
  const listing = await actor(
    owner,
    "authenticated",
    async () =>
      (await db.query("SELECT public.admin_list_subscribers('live','','all',0,50) AS value"))
        .rows[0].value,
  );
  assert.equal(listing.total, 1);
  assert.equal(listing.active, 1);
  assert.equal(
    listing.users[0].status,
    "active",
    "Effective access wins over a refunded historical pass",
  );
  assert.equal(listing.users[0].email, "anika@example.test");
  assert.equal(listing.users[0].source, "Admin grant");
  const sandbox = await actor(
    owner,
    "authenticated",
    async () =>
      (await db.query("SELECT public.admin_list_subscribers('sandbox','','all',0,50) AS value"))
        .rows[0].value,
  );
  assert.equal(sandbox.total, 0);
  const privateRows = await actor(stranger, "authenticated", () =>
    db.query("SELECT * FROM public.access_passes"),
  );
  assert.equal(privateRows.rows.length, 0, "Other users cannot read subscriber passes");
  await assert.rejects(
    () => actor(user, "authenticated", () => db.query("SELECT * FROM public.access_admin_audit")),
    /permission denied/,
  );
  console.log(
    "PASS: real PostgreSQL migrations, verified-owner authorization, forged metadata rejection, subscriber privacy, atomic access extension, idempotency, audit, effective access and environment isolation",
  );
} finally {
  await db.close();
}
