import assert from "node:assert/strict";
import { randomUUID, createHash } from "node:crypto";
import { test, after } from "node:test";
import { database, closeDatabase } from "../src/backend/db.server";
import {
  applyCapturedPayment,
  applyVerifiedRefund,
  adminChangeAccess,
  getAccess,
  recordOrder,
  type VerifiedCapture,
} from "../src/backend/access.server";

assert.equal(process.env.DB_HOST, "127.0.0.1");
assert.equal(process.env.DB_PORT, "3307");
assert.equal(process.env.DB_NAME, "ovu_main");
const users: string[] = [];
async function user() {
  const id = randomUUID();
  users.push(id);
  await database().execute(
    "INSERT INTO auth_user(id,name,email,emailVerified) VALUES(?,?,?,true)",
    [id, "Synthetic Access Test", id + "@example.test"],
  );
  return id;
}
async function capture(userId: string, days = 30, environment: "sandbox" | "live" = "sandbox") {
  const payment: VerifiedCapture = {
    userId,
    days,
    environment,
    orderId: "order_test_" + randomUUID().replaceAll("-", ""),
    paymentId: "pay_test_" + randomUUID().replaceAll("-", ""),
    planId: "universe_" + days + "_days",
    amount: 17900,
    currency: "INR",
  };
  await recordOrder(payment);
  return payment;
}
after(async () => {
  for (const id of users) {
    await database().execute("DELETE FROM admin_access_changes WHERE user_id=? OR actor_id=?", [
      id,
      id,
    ]);
    await database().execute("DELETE FROM access_admin_audit WHERE user_id=? OR actor_id=?", [
      id,
      id,
    ]);
    await database().execute("DELETE FROM entitlement_refund_adjustments WHERE user_id=?", [id]);
    await database().execute("DELETE FROM payment_transactions WHERE user_id=?", [id]);
    await database().execute("DELETE FROM payment_orders WHERE user_id=?", [id]);
    await database().execute("UPDATE access_passes SET parent_pass_id=NULL WHERE user_id=?", [id]);
    await database().execute("DELETE FROM access_passes WHERE user_id=?", [id]);
    await database().execute("DELETE FROM entitlement_locks WHERE user_id=?", [id]);
    await database().execute("DELETE FROM auth_user WHERE id=?", [id]);
  }
  await database().execute("DELETE FROM payment_events WHERE event_id LIKE 'evt_migration_test_%'");
  await closeDatabase();
});

test("20 concurrent callback/webhook replays grant one purchase exactly once", async () => {
  const id = await user(),
    payment = await capture(id);
  const results = await Promise.all(
    Array.from({ length: 20 }, () => applyCapturedPayment(payment)),
  );
  assert.equal(new Set(results.map((r) => r.expiresAt)).size, 1);
  assert.equal(results.filter((r) => !r.duplicate).length, 1);
  const [rows]: any = await database().execute(
    "SELECT COUNT(*) AS count FROM access_passes WHERE user_id=?",
    [id],
  );
  assert.equal(Number(rows[0].count), 1);
});

test("different concurrent purchases serialize and extend the current expiry", async () => {
  const id = await user();
  const one = await capture(id, 30),
    two = await capture(id, 180);
  const start = Date.now();
  await Promise.all([applyCapturedPayment(one), applyCapturedPayment(two)]);
  const access = await getAccess(id, "sandbox");
  assert.ok(Math.abs(new Date(access.expires_at).getTime() - start - 210 * 86400000) < 5000);
  assert.equal(await getAccess(id, "live"), null);
});

test("stored ownership, order, amount, currency and plan are authoritative", async () => {
  const id = await user(),
    other = await user(),
    payment = await capture(id);
  for (const change of [
    { userId: other },
    { amount: 1 },
    { currency: "USD" as const },
    { days: 180 },
    { planId: "forged_plan" },
  ])
    await assert.rejects(applyCapturedPayment({ ...payment, ...change }), /stored order/);
  await applyCapturedPayment(payment);
  await assert.rejects(
    applyCapturedPayment({ ...payment, paymentId: "pay_test_" + randomUUID().replaceAll("-", "") }),
    /already fulfilled/,
  );
});

test("durable event IDs reject collisions and retries do not extend access", async () => {
  const id = await user(),
    payment = await capture(id);
  const event = {
    id: "evt_migration_test_" + randomUUID().replaceAll("-", ""),
    type: "payment.captured",
    bodyHash: createHash("sha256").update("fixture").digest("hex"),
  };
  const first = await applyCapturedPayment(payment, event),
    again = await applyCapturedPayment(payment, event);
  assert.equal(first.expiresAt, again.expiresAt);
  await assert.rejects(
    applyCapturedPayment(payment, { ...event, bodyHash: "a".repeat(64) }),
    /collision/,
  );
  const [rows]: any = await database().execute(
    "SELECT state FROM payment_events WHERE environment=? AND event_id=?",
    ["sandbox", event.id],
  );
  assert.equal(rows[0].state, "processed");
});

test("partial/full and out-of-order refund notifications cannot resurrect access", async () => {
  const id = await user(),
    payment = await capture(id);
  await applyCapturedPayment(payment);
  const refund = {
    userId: id,
    environment: "sandbox" as const,
    paymentId: payment.paymentId,
    refundedAmount: 100,
  };
  assert.equal((await applyVerifiedRefund(refund)).state, "partially_refunded");
  assert.ok(await getAccess(id, "sandbox"));
  await assert.rejects(
    applyVerifiedRefund({ ...refund, refundedAmount: payment.amount + 1 }),
    /exceeds/,
  );
  assert.equal(
    (await applyVerifiedRefund({ ...refund, refundedAmount: payment.amount })).state,
    "refunded",
  );
  assert.equal((await applyVerifiedRefund(refund)).state, "refunded");
  assert.equal((await applyCapturedPayment(payment)).status, "refunded");
  assert.equal(await getAccess(id, "sandbox"), null);
});

test("refund observed before capture notification records history without ever activating the purchase", async () => {
  const id = await user(),
    payment = await capture(id);
  assert.equal(
    (await applyCapturedPayment({ ...payment, refundedAmount: payment.amount })).status,
    "refunded",
  );
  assert.equal(await getAccess(id, "sandbox"), null);
  assert.equal((await applyCapturedPayment(payment)).status, "refunded");
  assert.equal(await getAccess(id, "sandbox"), null);
  await assert.rejects(
    applyCapturedPayment({ ...payment, refundedAmount: payment.amount + 1 }),
    /refund amount/,
  );
});

test("administrative grants require verified roles and are audited, idempotent and revocable", async () => {
  const id = await user(),
    admin = await user();
  const principal = { id: admin, email: admin + "@example.test", emailVerified: true };
  const input = {
    requestId: randomUUID(),
    userId: id,
    environment: "sandbox" as const,
    action: "grant" as const,
    reason: "Synthetic migration fixture",
    days: 30,
  };
  await assert.rejects(adminChangeAccess(principal, input), /Administrator/);
  await database().execute("INSERT INTO app_roles(user_id,role) VALUES(?,?)", [admin, "admin"]);
  await assert.rejects(
    adminChangeAccess({ ...principal, emailVerified: false }, input),
    /Administrator/,
  );
  const grant = await adminChangeAccess(principal, input);
  assert.deepEqual(await adminChangeAccess(principal, input), grant);
  await assert.rejects(adminChangeAccess(principal, { ...input, days: 180 }), /conflicts/);
  assert.ok(await getAccess(id, "sandbox"));
  await adminChangeAccess(principal, {
    ...input,
    requestId: randomUUID(),
    action: "revoke",
    passId: grant.passId,
  });
  assert.equal(await getAccess(id, "sandbox"), null);
  const [rows]: any = await database().execute(
    "SELECT COUNT(*) AS count FROM admin_access_changes WHERE user_id=?",
    [id],
  );
  assert.equal(Number(rows[0].count), 2);
});

test("future and expired rows cannot grant access just because another date is later", async () => {
  const id = await user(),
    payment = await capture(id);
  await applyCapturedPayment(payment);
  await database().execute(
    "UPDATE access_passes SET starts_at=TIMESTAMPADD(DAY,1,CURRENT_TIMESTAMP(6)) WHERE user_id=?",
    [id],
  );
  assert.equal(await getAccess(id, "sandbox"), null);
  await database().execute(
    "UPDATE access_passes SET starts_at=TIMESTAMPADD(DAY,-2,CURRENT_TIMESTAMP(6)),expires_at=CURRENT_TIMESTAMP(6) WHERE user_id=?",
    [id],
  );
  assert.equal(await getAccess(id, "sandbox"), null);
});
