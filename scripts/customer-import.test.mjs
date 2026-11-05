import assert from "node:assert/strict";
import { test } from "node:test";
import { importCustomers, accountImportPayload } from "./customer-import.mjs";
import { reconciliationPlan } from "./customer-reconciliation.mjs";
const id = "11111111-1111-4111-8111-111111111111",
  owner = "22222222-2222-4222-8222-222222222222";
const date = "2026-11-05T10:00:00Z",
  now = new Date("2026-11-05T14:00:00Z");
const user = {
  id,
  email: "fixture@example.test",
  email_confirmed_at: date,
  encrypted_password: "$2b$10$" + "a".repeat(53),
  created_at: date,
  raw_user_meta_data: JSON.stringify({
    name: "Fixture",
    role: "admin",
    guardianEmail: "private@example.test",
  }),
  raw_app_meta_data: '{"role":"service_role"}',
  deleted_at: null,
  banned_until: null,
  is_anonymous: "f",
  is_sso_user: "f",
  phone: null,
};
const pass = {
  id: "33333333-3333-4333-8333-333333333333",
  user_id: id,
  payment_session_id: "qa_import_reference",
  payment_customer_id: "qa_order_reference",
  price_id: "universe_30_days",
  access_days: "30",
  status: "active",
  environment: "live",
  starts_at: date,
  expires_at: "2026-12-05T10:00:00.123456Z",
  created_at: date,
  updated_at: date,
};
function copy(name, rows, fallback) {
  const keys = Object.keys(rows[0] ?? fallback);
  return (
    `COPY ${name} (${keys.join(", ")}) FROM stdin;\n` +
    rows
      .map((row) =>
        keys
          .map((k) =>
            row[k] === null
              ? "\\N"
              : String(row[k])
                  .replaceAll("\\", "\\\\")
                  .replaceAll("\n", "\\n")
                  .replaceAll("\t", "\\t"),
          )
          .join("\t"),
      )
      .join("\n") +
    (rows.length ? "\n" : "") +
    "\\.\n"
  );
}
function setup(users = [user], passes = [pass]) {
  const sql = copy("auth.users", users, user) + copy("public.access_passes", passes, pass);
  const state = {
    users: [
      {
        id: owner,
        email: "existing@example.test",
        role: "authenticated",
        email_confirmed_at: date,
        app_metadata: { ovu_admin: true },
        user_metadata: { name: "Preserve owner" },
      },
    ],
    passes: [],
    creates: 0,
    inserts: 0,
  };
  const api = {
    listUsers: async () => structuredClone(state.users),
    listPasses: async () => structuredClone(state.passes),
    createUser: async (payload) => {
      state.creates++;
      const created = {
        id: payload.id,
        email: payload.email,
        role: "authenticated",
        email_confirmed_at: payload.email_confirm ? date : null,
        app_metadata: payload.app_metadata,
        user_metadata: payload.user_metadata,
      };
      state.users.push(created);
      return structuredClone(created);
    },
    insertPasses: async (rows) => {
      state.inserts++;
      state.passes.push(...structuredClone(rows));
    },
  };
  const input = {
    sql,
    expectedSqlSha256: reconciliationPlan(sql, state.users, state.passes, now).sourceSqlSha256,
    sourceCapturedAt: date,
    runId: "synthetic-run",
    now,
    api,
  };
  return { state, api, input };
}
test("append-only import preserves source ids, exact expiry, existing owner and provider-independent history", async () => {
  const f = setup(),
    prior = structuredClone(f.state.users[0]);
  const result = await importCustomers(f.input);
  assert.equal(result.summary.completed, true);
  assert.equal(result.summary.accountsCreated, 1);
  assert.equal(result.summary.supportedPasswordHashesTransferred, 1);
  assert.deepEqual(f.state.users[0], prior);
  assert.deepEqual(f.state.passes, [{ ...pass, access_days: 30 }]);
  assert.equal(f.state.users[1].app_metadata.role, undefined);
  assert.deepEqual(f.state.users[1].user_metadata, { name: "Fixture" });
  assert.equal(result.summary.userEmailsSent, 0);
  assert.equal(result.summary.providerPayments, 0);
});
test("rerunning an imported snapshot does not duplicate identities, access or change credentials", async () => {
  const f = setup();
  await importCustomers(f.input);
  const before = structuredClone(f.state);
  const second = await importCustomers(f.input);
  assert.equal(second.summary.accountsCreated, 0);
  assert.equal(second.summary.historicalPassesInserted, 0);
  assert.deepEqual(f.state, before);
});
test("unconfirmed source accounts remain unconfirmed and are resumable without granting access", async () => {
  const f = setup([{ ...user, email_confirmed_at: null }], []);
  await importCustomers(f.input);
  assert.equal(f.state.users[1].email_confirmed_at, null);
  await importCustomers(f.input);
  assert.equal(f.state.creates, 1);
  assert.equal(f.state.passes.length, 0);
});
test("stale snapshots and source hash mismatches perform no writes", async () => {
  for (const change of [
    { sourceCapturedAt: "2026-10-29T00:00:00Z" },
    { expectedSqlSha256: "wrong" },
  ]) {
    const f = setup();
    await assert.rejects(importCustomers({ ...f.input, ...change }));
    assert.equal(f.state.creates, 0);
    assert.equal(f.state.inserts, 0);
  }
});
test("all credential/profile payloads are checked before any account is created", async () => {
  const second = {
    ...user,
    id: "44444444-4444-4444-8444-444444444444",
    email: "second@example.test",
    encrypted_password: "unsupported",
  };
  const f = setup([user, second]);
  await assert.rejects(importCustomers(f.input));
  assert.equal(f.state.creates, 0);
  assert.throws(() =>
    accountImportPayload(
      { ...user, phone: "+12345678901" },
      { action: "create-original-id", targetId: id },
      {},
    ),
  );
});
test("a failed access batch leaves accounts intact and can resume without account recreation", async () => {
  const f = setup(),
    insert = f.api.insertPasses;
  f.api.insertPasses = async () => {
    throw new Error("synthetic transaction failure");
  };
  await assert.rejects(importCustomers(f.input));
  assert.equal(f.state.creates, 1);
  assert.equal(f.state.passes.length, 0);
  f.api.insertPasses = insert;
  await importCustomers(f.input);
  assert.equal(f.state.creates, 1);
  assert.equal(f.state.passes.length, 1);
});
test("sub-millisecond expiry changes are detected rather than silently accepted", () => {
  const f = setup();
  const changed = { ...pass, access_days: 30, expires_at: "2026-12-05T10:00:00.123457Z" };
  assert.ok(reconciliationPlan(f.input.sql, f.state.users, [changed], now).conflicts.length);
});
test("active disposable QA accounts cannot become a customer-import baseline", async () => {
  const f = setup(); f.state.users[0].app_metadata.ovu_import_read_fixture = "synthetic-fixture";
  await assert.rejects(importCustomers(f.input)); assert.equal(f.state.creates, 0); assert.equal(f.state.inserts, 0);
});
test("MFA or passkey credentials cannot silently be omitted during an account import", async () => {
  for (const table of ["auth.mfa_factors", "auth.webauthn_credentials"]) {
    const f = setup(); f.input.sql += `COPY ${table} (id) FROM stdin;\nsynthetic-factor\n\\.\n`;
    f.input.expectedSqlSha256 = reconciliationPlan(f.input.sql, f.state.users, f.state.passes, now).sourceSqlSha256;
    await assert.rejects(importCustomers(f.input)); assert.equal(f.state.creates, 0);
  }
});
