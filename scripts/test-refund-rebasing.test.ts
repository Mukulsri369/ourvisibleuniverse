import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, test } from "node:test";
import { database, closeDatabase } from "../src/backend/db.server";
import {
  recordOrder,
  applyCapturedPayment,
  applyVerifiedRefund,
  adminChangeAccess,
  getAccess,
  type VerifiedCapture,
} from "../src/backend/access.server";
import type { Principal } from "../src/backend/authorization.server";
import { ACCESS_PLANS } from "../src/lib/plans";

assert.equal(process.env.DB_HOST, "127.0.0.1");
assert.equal(process.env.DB_PORT, "3307");
assert.equal(process.env.DB_NAME, "ovu_main");
const users: string[] = [],
  day = 86400000;
async function user(): Promise<Principal> {
  const id = randomUUID();
  users.push(id);
  const email = id + "@example.test";
  await database().execute(
    "INSERT INTO auth_user(id,name,email,emailVerified) VALUES(?,?,?,true)",
    [id, "Synthetic Refund Test", email],
  );
  return { id, email, emailVerified: true };
}
async function purchase(
  userId: string,
  days: 30 | 180 | 365 = 30,
  environment: "sandbox" | "live" = "sandbox",
) {
  const plan = ACCESS_PLANS[`universe_${days}_days`];
  const payment: VerifiedCapture = {
    userId,
    days,
    environment,
    orderId: "order_" + randomUUID().replaceAll("-", ""),
    paymentId: "pay_" + randomUUID().replaceAll("-", ""),
    planId: plan.id,
    amount: plan.amount,
    currency: "INR",
  };
  await recordOrder(payment);
  return { payment, ...(await applyCapturedPayment(payment)) };
}
async function rows(userId: string) {
  const [result]: any = await database().execute(
    "SELECT * FROM access_passes WHERE user_id=? ORDER BY created_at,id",
    [userId],
  );
  return result as any[];
}
async function elapsed(userId: string, days: number) {
  await database().execute(
    `UPDATE access_passes SET created_at=TIMESTAMPADD(DAY,-?,created_at),starts_at=TIMESTAMPADD(DAY,-?,starts_at),expires_at=TIMESTAMPADD(DAY,-?,expires_at),allocated_starts_at=TIMESTAMPADD(DAY,-?,allocated_starts_at),allocated_expires_at=TIMESTAMPADD(DAY,-?,allocated_expires_at),original_expires_at=TIMESTAMPADD(DAY,-?,original_expires_at) WHERE user_id=?`,
    [days, days, days, days, days, days, userId],
  );
}
async function refund(payment: VerifiedCapture) {
  return applyVerifiedRefund({
    userId: payment.userId,
    environment: payment.environment,
    paymentId: payment.paymentId,
    refundedAmount: payment.amount,
  });
}
after(async () => {
  for (const id of users) {
    await database().execute("DELETE FROM entitlement_refund_adjustments WHERE user_id=?", [id]);
    await database().execute("DELETE FROM admin_access_changes WHERE user_id=? OR actor_id=?", [
      id,
      id,
    ]);
    await database().execute("DELETE FROM payment_transactions WHERE user_id=?", [id]);
    await database().execute("DELETE FROM payment_orders WHERE user_id=?", [id]);
    await database().execute("UPDATE access_passes SET parent_pass_id=NULL WHERE user_id=?", [id]);
    await database().execute("DELETE FROM access_passes WHERE user_id=?", [id]);
    await database().execute("DELETE FROM entitlement_locks WHERE user_id=?", [id]);
  }
  for (const id of users) await database().execute("DELETE FROM auth_user WHERE id=?", [id]);
  await closeDatabase();
});

test("only unused refunded time is removed from later purchases, with original expiries and adjustments preserved", async () => {
  const actor = await user(),
    a = await purchase(actor.id),
    b = await purchase(actor.id, 180),
    c = await purchase(actor.id);
  await elapsed(actor.id, 10);
  const before = await rows(actor.id),
    bBefore = before.find((r) => r.id === b.passId),
    cBefore = before.find((r) => r.id === c.passId);
  await refund(a.payment);
  const afterRows = await rows(actor.id),
    bAfter = afterRows.find((r) => r.id === b.passId),
    cAfter = afterRows.find((r) => r.id === c.passId);
  assert.equal(afterRows.find((r) => r.id === a.passId).status, "refunded");
  for (const [old, current] of [
    [bBefore, bAfter],
    [cBefore, cAfter],
  ]) {
    assert.ok(
      Math.abs(
        new Date(old.expires_at).getTime() - new Date(current.expires_at).getTime() - 20 * day,
      ) < 3000,
    );
    assert.equal(
      new Date(current.original_expires_at).getTime(),
      new Date(old.original_expires_at).getTime(),
    );
    assert.equal(
      new Date(current.allocated_expires_at).getTime() -
        new Date(current.allocated_starts_at).getTime(),
      Number(current.access_days) * day,
    );
  }
  const [ledger]: any = await database().execute(
    "SELECT refund_unused_microseconds,refund_rebased_at FROM payment_transactions WHERE payment_id=?",
    [a.payment.paymentId],
  );
  assert.ok(Math.abs(Number(ledger[0].refund_unused_microseconds) / 1000 - 20 * day) < 3000);
  assert.ok(ledger[0].refund_rebased_at);
  const [audit]: any = await database().execute(
    "SELECT COUNT(*) AS n FROM entitlement_refund_adjustments WHERE payment_id=?",
    [a.payment.paymentId],
  );
  assert.equal(Number(audit[0].n), 2);
  await Promise.all(Array.from({ length: 12 }, () => refund(a.payment)));
  await applyCapturedPayment(a.payment);
  assert.equal(
    new Date((await rows(actor.id)).find((r) => r.id === c.passId).expires_at).getTime(),
    new Date(cAfter.expires_at).getTime(),
  );
  await refund(b.payment);
  assert.ok(
    Math.abs(
      new Date((await getAccess(actor.id, "sandbox")).expires_at).getTime() - Date.now() - 30 * day,
    ) < 3000,
  );
});

test("already-consumed purchases do not subtract time from remaining access", async () => {
  const actor = await user(),
    a = await purchase(actor.id),
    b = await purchase(actor.id, 180);
  await elapsed(actor.id, 40);
  const original = (await rows(actor.id)).find((r) => r.id === b.passId).expires_at;
  await refund(a.payment);
  assert.equal(
    new Date((await getAccess(actor.id, "sandbox")).expires_at).getTime(),
    new Date(original).getTime(),
  );
  const [ledger]: any = await database().execute(
    "SELECT refund_unused_microseconds FROM payment_transactions WHERE payment_id=?",
    [a.payment.paymentId],
  );
  assert.equal(Number(ledger[0].refund_unused_microseconds), 0);
});

test("partial refunds leave access intact and concurrent full refunds preserve the surviving duration", async () => {
  const actor = await user(),
    a = await purchase(actor.id),
    b = await purchase(actor.id, 180);
  await purchase(actor.id);
  const before = new Date((await getAccess(actor.id, "sandbox")).expires_at).getTime();
  await applyVerifiedRefund({
    userId: actor.id,
    environment: "sandbox",
    paymentId: a.payment.paymentId,
    refundedAmount: 100,
  });
  assert.equal(new Date((await getAccess(actor.id, "sandbox")).expires_at).getTime(), before);
  await Promise.all([refund(a.payment), refund(b.payment)]);
  assert.ok(
    Math.abs(
      new Date((await getAccess(actor.id, "sandbox")).expires_at).getTime() - Date.now() - 30 * day,
    ) < 3000,
  );
});

test("manual duration grants retain their duration; fixed admin dates anchor their descendants", async () => {
  const actor = await user(),
    admin = await user();
  await database().execute("INSERT INTO app_roles(user_id,role) VALUES(?,?)", [admin.id, "admin"]);
  const a = await purchase(actor.id);
  const manual = await adminChangeAccess(admin, {
    requestId: randomUUID(),
    userId: actor.id,
    environment: "sandbox",
    action: "grant",
    days: 30,
    reason: "Synthetic refund policy test",
  });
  await refund(a.payment);
  assert.ok(
    Math.abs(
      new Date((await getAccess(actor.id, "sandbox")).expires_at).getTime() - Date.now() - 30 * day,
    ) < 3000,
  );
  const second = await user(),
    first = await purchase(second.id);
  const fixed = await adminChangeAccess(admin, {
    requestId: randomUUID(),
    userId: second.id,
    environment: "sandbox",
    action: "grant",
    days: 30,
    reason: "Synthetic fixed-date test",
  });
  const expiry = new Date(Date.now() + 100 * day).toISOString();
  await adminChangeAccess(admin, {
    requestId: randomUUID(),
    userId: second.id,
    environment: "sandbox",
    action: "set_expiry",
    passId: fixed.passId,
    expiresAt: expiry,
    reason: "Preserve explicit authorized date",
  });
  const later = await purchase(second.id, 180),
    before = await rows(second.id);
  await refund(first.payment);
  const afterRows = await rows(second.id);
  for (const id of [fixed.passId, later.passId])
    assert.equal(
      new Date(afterRows.find((r) => r.id === id).expires_at).getTime(),
      new Date(before.find((r) => r.id === id).expires_at).getTime(),
    );
  assert.ok((await rows(actor.id)).find((r) => r.id === manual.passId));
});

test("unreconciled legacy data blocks automatic adjustments without inventing dates or changing the ledger", async () => {
  const actor = await user(),
    a = await purchase(actor.id);
  await database().execute("UPDATE access_passes SET allocation_version=0 WHERE id=?", [a.passId]);
  await assert.rejects(refund(a.payment), /reconciliation/);
  const [ledger]: any = await database().execute(
    "SELECT refunded_minor FROM payment_transactions WHERE payment_id=?",
    [a.payment.paymentId],
  );
  assert.equal(Number(ledger[0].refunded_minor), 0);
  assert.ok(await getAccess(actor.id, "sandbox"));
});
