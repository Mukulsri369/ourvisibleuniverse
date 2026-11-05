import assert from "node:assert/strict";
import { test } from "node:test";
import { decodeCopyValue, readCopyTables, reconciliationPlan } from "./customer-reconciliation.mjs";
const id = "11111111-1111-4111-8111-111111111111",
  targetId = "22222222-2222-4222-8222-222222222222";
const date = "2026-10-29T00:00:00Z",
  now = new Date("2026-11-05T00:00:00Z");
const user = {
  id,
  email: "fixture@example.test",
  email_confirmed_at: date,
  encrypted_password: "synthetic-hash",
  created_at: date,
  deleted_at: null,
  banned_until: null,
  is_anonymous: "f",
  is_sso_user: "f",
};
const pass = {
  id: "33333333-3333-4333-8333-333333333333",
  user_id: id,
  payment_session_id: "pay_synthetic",
  payment_customer_id: "order_synthetic",
  price_id: "universe_30",
  access_days: "30",
  status: "active",
  environment: "live",
  starts_at: date,
  expires_at: "2026-11-28T00:00:00Z",
  created_at: date,
  updated_at: date,
};
function copy(name, rows) {
  const columns = Object.keys(rows[0] ?? (name === "auth.users" ? user : pass));
  return (
    `COPY ${name} (${columns.join(", ")}) FROM stdin;\n` +
    rows
      .map((row) =>
        columns
          .map((key) =>
            row[key] === null
              ? "\\N"
              : String(row[key])
                  .replaceAll("\\", "\\\\")
                  .replaceAll("\t", "\\t")
                  .replaceAll("\n", "\\n"),
          )
          .join("\t"),
      )
      .join("\n") +
    (rows.length ? "\n" : "") +
    "\\.\n"
  );
}
const sql = (users = [user], passes = [pass]) =>
  copy("auth.users", users) + copy("public.access_passes", passes);
test("COPY data decoder distinguishes SQL null and literal escapes", () => {
  assert.equal(decodeCopyValue("\\N"), null);
  assert.equal(decodeCopyValue("\\\\N"), "\\N");
  assert.equal(decodeCopyValue("a\\tb\\n\\134"), "a\tb\n\\");
  assert.equal(
    readCopyTables(copy("auth.users", [{ ...user, note: "one\ntwo\tthree\\four" }])).get(
      "auth.users",
    ).rows[0].note,
    "one\ntwo\tthree\\four",
  );
});
test("malformed, repeated and truncated COPY input fails closed", () => {
  assert.throws(() => readCopyTables("COPY auth.users (id, email) FROM stdin;\none\n\\.\n"));
  assert.throws(() => readCopyTables(copy("auth.users", [user]) + copy("auth.users", [user])));
  assert.throws(() => readCopyTables("COPY auth.users (id) FROM stdin;\none"));
});
test("new identities retain original ids and access dates/references without new purchases", () => {
  const plan = reconciliationPlan(sql(), [], [], now);
  assert.equal(plan.summary.conflicts, 0);
  assert.equal(plan.mappings[0].targetId, id);
  assert.deepEqual(plan.passes[0].record, { ...pass, access_days: 30 });
  assert.equal(plan.summary.writesPerformed, 0);
  assert.equal(plan.summary.linkedLiveCustomers, 1);
  assert.ok(!JSON.stringify(plan).includes("synthetic-hash"));
});
test("verified email mapping preserves the existing account id and never copies old admin metadata", () => {
  const source = { ...user, raw_app_meta_data: '{"role":"admin"}' };
  const plan = reconciliationPlan(sql([source]), [{ ...user, id: targetId }], [], now);
  assert.equal(plan.summary.preservedAccounts, 1);
  assert.equal(plan.passes[0].record.user_id, targetId);
  assert.ok(!JSON.stringify(plan).includes('"role":"admin"'));
});
test("unverified matches, conflicting id ownership and ambiguous emails are blocked", () => {
  for (const target of [
    { ...user, email_confirmed_at: null },
    { ...user, email: "different@example.test" },
  ])
    assert.ok(reconciliationPlan(sql(), [target], [], now).conflicts.length > 0);
  assert.ok(
    reconciliationPlan(sql([user, { ...user, id: targetId }]), [], [], now).conflicts.length > 0,
  );
});
test("banned, deleted and SSO accounts require explicit handling instead of activation", () => {
  for (const change of [
    { banned_until: "2027-01-01T00:00:00Z" },
    { deleted_at: date },
    { is_sso_user: "t" },
  ]) {
    const plan = reconciliationPlan(sql([{ ...user, ...change }]), [], [], now);
    assert.equal(plan.mappings.length, 0);
    assert.ok(plan.conflicts.length);
  }
});
test("access import is exact and idempotent; differences and duplicate references block", () => {
  const same = { ...pass, access_days: 30 };
  assert.equal(
    reconciliationPlan(sql(), [], [same], now).passes[0].action,
    "preserve-identical-record",
  );
  assert.ok(
    reconciliationPlan(sql(), [], [{ ...same, expires_at: "2027-01-01T00:00:00Z" }], now).conflicts
      .length,
  );
  assert.ok(reconciliationPlan(sql([user], [pass, pass]), [], [], now).conflicts.length);
});
test("expired live history and sandbox history do not become a new live entitlement", () => {
  const plan = reconciliationPlan(
    sql(
      [user],
      [
        { ...pass, expires_at: "2026-11-01T00:00:00Z" },
        { ...pass, id: targetId, environment: "sandbox" },
      ],
    ),
    [],
    [],
    now,
  );
  assert.equal(plan.summary.withinPeriodLiveRecords, 0);
  assert.equal(plan.summary.sandboxAccessRecords, 1);
  assert.equal(plan.passes[0].record.expires_at, "2026-11-01T00:00:00Z");
});
test("new public data outside the older export inventory is explicitly reported", () => {
  const plan = reconciliationPlan(
    sql() + copy("public.student_profiles", [{ user_id: id }]),
    [],
    [],
    now,
  );
  assert.equal(plan.summary.unhandledPublicTables, 1);
});
