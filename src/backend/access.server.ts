import type { PoolConnection } from "mysql2/promise";
import { randomUUID } from "node:crypto";
import { database, transaction } from "./db.server";
import { requireAdmin, type Principal } from "./authorization.server";

export type AccessEnvironment = "sandbox" | "live";
export interface StoredOrder {
  environment: AccessEnvironment;
  orderId: string;
  userId: string;
  planId: string;
  days: number;
  amount: number;
  currency: "INR" | "USD";
}
export interface VerifiedCapture extends StoredOrder {
  paymentId: string;
  refundedAmount?: number;
}
export interface VerifiedEvent {
  id: string;
  type: string;
  bodyHash: string;
}

function validateOrder(order: StoredOrder) {
  if (
    !["sandbox", "live"].includes(order.environment) ||
    ![30, 180, 365].includes(order.days) ||
    !["INR", "USD"].includes(order.currency) ||
    !Number.isSafeInteger(order.amount) ||
    order.amount <= 0 ||
    !/^[\w-]{1,100}$/.test(order.orderId) ||
    !/^[\w-]{1,80}$/.test(order.planId) ||
    !/^[a-f\d-]{36}$/i.test(order.userId)
  )
    throw new Error("Invalid verified order");
}

async function lockEntitlements(
  connection: PoolConnection,
  userId: string,
  environment: AccessEnvironment,
) {
  // Duplicate-key UPDATE takes the exclusive row lock directly. INSERT IGNORE followed
  // by FOR UPDATE can deadlock when concurrent callers upgrade shared duplicate locks.
  await connection.execute(
    "INSERT INTO entitlement_locks(user_id,environment) VALUES(?,?) ON DUPLICATE KEY UPDATE user_id=VALUES(user_id)",
    [userId, environment],
  );
  const [rows]: any = await connection.execute(
    "SELECT user_id FROM entitlement_locks WHERE user_id=? AND environment=? FOR UPDATE",
    [userId, environment],
  );
  if (rows.length !== 1) throw new Error("Unknown access account");
}

async function retryTransaction<T>(work: (c: PoolConnection) => Promise<T>): Promise<T> {
  for (let attempt = 0; ; attempt++)
    try {
      return await transaction(work);
    } catch (error: any) {
      if (attempt >= 2 || !["ER_LOCK_DEADLOCK", "ER_LOCK_WAIT_TIMEOUT"].includes(error?.code))
        throw error;
      await new Promise((resolve) => setTimeout(resolve, 20 * (attempt + 1)));
    }
}

export async function recordOrder(order: StoredOrder) {
  validateOrder(order);
  await database().execute(
    `INSERT INTO payment_orders(environment,order_id,user_id,plan_id,access_days,amount_minor,currency)
    VALUES(?,?,?,?,?,?,?)`,
    [
      order.environment,
      order.orderId,
      order.userId,
      order.planId,
      order.days,
      order.amount,
      order.currency,
    ],
  );
}

async function beginEvent(
  c: PoolConnection,
  environment: AccessEnvironment,
  event?: VerifiedEvent,
) {
  if (!event) return false;
  if (
    !/^[\w-]{1,160}$/.test(event.id) ||
    !/^\w[\w.]{0,79}$/.test(event.type) ||
    !/^[a-f\d]{64}$/.test(event.bodyHash)
  )
    throw new Error("Invalid verified event");
  const [rows]: any = await c.execute(
    "SELECT body_sha256,state FROM payment_events WHERE environment=? AND event_id=? FOR UPDATE",
    [environment, event.id],
  );
  if (rows.length) {
    if (rows[0].body_sha256 !== event.bodyHash) throw new Error("Webhook event ID collision");
    if (rows[0].state === "processed") return true;
  } else
    await c.execute(
      "INSERT INTO payment_events(environment,event_id,event_type,body_sha256) VALUES(?,?,?,?)",
      [environment, event.id, event.type, event.bodyHash],
    );
  return false;
}

async function finishEvent(
  c: PoolConnection,
  environment: AccessEnvironment,
  event?: VerifiedEvent,
) {
  if (event)
    await c.execute(
      "UPDATE payment_events SET state='processed',processed_at=CURRENT_TIMESTAMP(6) WHERE environment=? AND event_id=?",
      [environment, event.id],
    );
}

async function grantInTransaction(
  c: PoolConnection,
  options: {
    userId: string;
    environment: AccessEnvironment;
    reference: string;
    orderId: string | null;
    planId: string;
    days: number;
  },
) {
  const [parent]: any = await c.execute(
    `SELECT id,DATE_FORMAT(expires_at,'%Y-%m-%d %H:%i:%s.%f') AS expiry FROM access_passes
    WHERE user_id=? AND environment=? AND status='active' AND expires_at>CURRENT_TIMESTAMP(6) ORDER BY expires_at DESC,created_at DESC,id LIMIT 1 FOR UPDATE`,
    [options.userId, options.environment],
  );
  const [baseRows]: any = await c.execute(
    "SELECT DATE_FORMAT(GREATEST(CURRENT_TIMESTAMP(6),COALESCE(?,CURRENT_TIMESTAMP(6))),'%Y-%m-%d %H:%i:%s.%f') AS base",
    [parent[0]?.expiry ?? null],
  );
  const [expiry]: any = await c.execute(
    "SELECT DATE_FORMAT(TIMESTAMPADD(DAY,?,?), '%Y-%m-%d %H:%i:%s.%f') AS expires_at",
    [options.days, baseRows[0].base],
  );
  const id = randomUUID();
  await c.execute(
    `INSERT INTO access_passes(id,user_id,payment_session_id,payment_customer_id,price_id,access_days,environment,expires_at,allocated_starts_at,allocated_expires_at,original_expires_at,parent_pass_id,allocation_version)
    VALUES(?,?,?,?,?,?,?,?,?,?,?,?,1)`,
    [
      id,
      options.userId,
      options.reference,
      options.orderId,
      options.planId,
      options.days,
      options.environment,
      expiry[0].expires_at,
      baseRows[0].base,
      expiry[0].expires_at,
      expiry[0].expires_at,
      parent[0]?.id ?? null,
    ],
  );
  return {
    passId: id,
    expiresAt: new Date(expiry[0].expires_at.replace(" ", "T") + "Z").toISOString(),
  };
}

/** Caller holds the user's entitlement lock and the payment row lock. */
async function revokeAndRebaseRefund(
  c: PoolConnection,
  options: { userId: string; environment: AccessEnvironment; paymentId: string },
) {
  const args = [options.environment, options.paymentId];
  const [ledger]: any = await c.execute(
    "SELECT refund_rebased_at FROM payment_transactions WHERE environment=? AND payment_id=? FOR UPDATE",
    args,
  );
  if (ledger[0]?.refund_rebased_at) return;
  const [unreconciled]: any = await c.execute(
    "SELECT id FROM access_passes WHERE user_id=? AND environment=? AND status='active' AND expires_at>CURRENT_TIMESTAMP(6) AND allocation_version<>1 LIMIT 1",
    [options.userId, options.environment],
  );
  if (unreconciled.length)
    throw new Error("Legacy entitlement allocations require reconciliation before refunds");
  const [clock]: any = await c.query(
    "SELECT DATE_FORMAT(CURRENT_TIMESTAMP(6),'%Y-%m-%d %H:%i:%s.%f') AS at",
  );
  const at = clock[0].at;
  const [passes]: any = await c.execute(
    `SELECT id,allocation_version,GREATEST(0,TIMESTAMPDIFF(MICROSECOND,GREATEST(?,allocated_starts_at),allocated_expires_at)) AS unused
    FROM access_passes WHERE user_id=? AND environment=? AND payment_session_id=? FOR UPDATE`,
    [at, options.userId, options.environment, options.paymentId],
  );
  if (passes.length !== 1 || Number(passes[0].allocation_version) !== 1)
    throw new Error("Payment allocation requires reconciliation");
  const unused = Number(passes[0].unused);
  if (!Number.isSafeInteger(unused) || unused < 0) throw new Error("Invalid refund allocation");
  await c.execute("UPDATE access_passes SET status='refunded',updated_at=? WHERE id=?", [
    at,
    passes[0].id,
  ]);
  const queue = [{ id: passes[0].id, shift: unused }],
    visited = new Set<string>();
  while (queue.length) {
    const parent = queue.shift()!;
    if (visited.has(parent.id)) throw new Error("Invalid entitlement lineage");
    visited.add(parent.id);
    if (parent.shift === 0) continue;
    const [children]: any = await c.execute(
      `SELECT id,status,expiry_is_fixed,allocation_version,
      GREATEST(0,TIMESTAMPDIFF(MICROSECOND,GREATEST(?,created_at),allocated_starts_at)) AS available_shift
      FROM access_passes WHERE parent_pass_id=? AND user_id=? AND environment=? FOR UPDATE`,
      [at, parent.id, options.userId, options.environment],
    );
    for (const child of children) {
      // Explicit dates are contractual anchors. Neither they nor their descendants move.
      if (child.expiry_is_fixed) continue;
      if (Number(child.allocation_version) !== 1)
        throw new Error("Dependent allocation requires reconciliation");
      let shift = parent.shift;
      if (child.status === "active") {
        shift = Math.min(parent.shift, Number(child.available_shift));
        if (!Number.isSafeInteger(shift) || shift < 0)
          throw new Error("Invalid dependent allocation");
        if (shift > 0) {
          await c.execute(
            `INSERT INTO entitlement_refund_adjustments(id,environment,payment_id,user_id,pass_id,previous_expiry,updated_expiry,removed_microseconds)
            SELECT ?,?,?,?,?,expires_at,TIMESTAMPADD(MICROSECOND,-?,expires_at),? FROM access_passes WHERE id=?`,
            [
              randomUUID(),
              options.environment,
              options.paymentId,
              options.userId,
              child.id,
              shift,
              shift,
              child.id,
            ],
          );
          await c.execute(
            `UPDATE access_passes SET allocated_starts_at=TIMESTAMPADD(MICROSECOND,-?,allocated_starts_at),allocated_expires_at=TIMESTAMPADD(MICROSECOND,-?,allocated_expires_at),expires_at=TIMESTAMPADD(MICROSECOND,-?,expires_at),updated_at=? WHERE id=?`,
            [shift, shift, shift, at, child.id],
          );
        }
      }
      queue.push({ id: child.id, shift });
    }
  }
  await c.execute(
    "UPDATE payment_transactions SET refund_unused_microseconds=?,refund_rebased_at=? WHERE environment=? AND payment_id=?",
    [unused, at, ...args],
  );
}

/** Only call after provider HMAC/captured-status/amount/currency/ownership verification. */
export async function applyCapturedPayment(payment: VerifiedCapture, event?: VerifiedEvent) {
  validateOrder(payment);
  if (!/^[\w-]{1,100}$/.test(payment.paymentId)) throw new Error("Invalid payment identifier");
  const refunded = payment.refundedAmount ?? 0;
  if (!Number.isSafeInteger(refunded) || refunded < 0 || refunded > payment.amount)
    throw new Error("Invalid verified refund amount");
  return retryTransaction(async (c) => {
    await lockEntitlements(c, payment.userId, payment.environment);
    const [orders]: any = await c.execute(
      "SELECT * FROM payment_orders WHERE environment=? AND order_id=? FOR UPDATE",
      [payment.environment, payment.orderId],
    );
    const order = orders[0];
    if (
      !order ||
      order.user_id !== payment.userId ||
      order.plan_id !== payment.planId ||
      Number(order.access_days) !== payment.days ||
      Number(order.amount_minor) !== payment.amount ||
      order.currency !== payment.currency
    )
      throw new Error("Payment does not match the stored order");
    await beginEvent(c, payment.environment, event);
    const [prior]: any = await c.execute(
      "SELECT * FROM payment_transactions WHERE environment=? AND payment_id=? FOR UPDATE",
      [payment.environment, payment.paymentId],
    );
    if (prior.length) {
      const row = prior[0];
      if (
        row.order_id !== payment.orderId ||
        row.user_id !== payment.userId ||
        Number(row.amount_minor) !== payment.amount ||
        row.currency !== payment.currency
      )
        throw new Error("Payment ownership conflict");
      const [passes]: any = await c.execute(
        "SELECT id,expires_at,status FROM access_passes WHERE payment_session_id=? AND environment=?",
        [payment.paymentId, payment.environment],
      );
      if (!passes.length) throw new Error("Payment ledger requires reconciliation");
      const cumulative = Math.max(Number(row.refunded_minor), refunded);
      const state =
        cumulative === payment.amount
          ? "refunded"
          : cumulative > 0
            ? "partially_refunded"
            : "captured";
      await c.execute(
        "UPDATE payment_transactions SET refunded_minor=?,state=? WHERE environment=? AND payment_id=?",
        [cumulative, state, payment.environment, payment.paymentId],
      );
      if (state === "refunded") {
        await revokeAndRebaseRefund(c, payment);
        passes[0].status = "refunded";
      }
      await finishEvent(c, payment.environment, event);
      return {
        passId: passes[0].id,
        expiresAt: new Date(passes[0].expires_at).toISOString(),
        status: passes[0].status,
        duplicate: true,
      };
    }
    if (order.state === "paid") throw new Error("Order already fulfilled by another payment");
    const state =
      refunded === payment.amount ? "refunded" : refunded > 0 ? "partially_refunded" : "captured";
    await c.execute(
      `INSERT INTO payment_transactions(environment,payment_id,order_id,user_id,amount_minor,currency,state,refunded_minor)
      VALUES(?,?,?,?,?,?,?,?)`,
      [
        payment.environment,
        payment.paymentId,
        payment.orderId,
        payment.userId,
        payment.amount,
        payment.currency,
        state,
        refunded,
      ],
    );
    const grant = await grantInTransaction(c, {
      userId: payment.userId,
      environment: payment.environment,
      reference: payment.paymentId,
      orderId: payment.orderId,
      planId: payment.planId,
      days: payment.days,
    });
    if (state === "refunded") await revokeAndRebaseRefund(c, payment);
    await c.execute("UPDATE payment_orders SET state='paid' WHERE environment=? AND order_id=?", [
      payment.environment,
      payment.orderId,
    ]);
    await finishEvent(c, payment.environment, event);
    return { ...grant, status: state === "refunded" ? "refunded" : "active", duplicate: false };
  });
}

/** Cumulative refunded amount must come from an authenticated provider fetch, never the browser. */
export async function applyVerifiedRefund(
  options: {
    environment: AccessEnvironment;
    paymentId: string;
    userId: string;
    refundedAmount: number;
  },
  event?: VerifiedEvent,
) {
  if (
    !Number.isSafeInteger(options.refundedAmount) ||
    options.refundedAmount < 0 ||
    !["sandbox", "live"].includes(options.environment)
  )
    throw new Error("Invalid verified refund");
  return retryTransaction(async (c) => {
    await lockEntitlements(c, options.userId, options.environment);
    const [rows]: any = await c.execute(
      "SELECT * FROM payment_transactions WHERE environment=? AND payment_id=? FOR UPDATE",
      [options.environment, options.paymentId],
    );
    const row = rows[0];
    if (!row || row.user_id !== options.userId) throw new Error("Unknown refund payment");
    if (options.refundedAmount > Number(row.amount_minor))
      throw new Error("Refund exceeds captured amount");
    await beginEvent(c, options.environment, event);
    const refunded = Math.max(Number(row.refunded_minor), options.refundedAmount);
    const state =
      refunded === Number(row.amount_minor)
        ? "refunded"
        : refunded > 0
          ? "partially_refunded"
          : "captured";
    await c.execute(
      "UPDATE payment_transactions SET refunded_minor=?,state=? WHERE environment=? AND payment_id=?",
      [refunded, state, options.environment, options.paymentId],
    );
    if (state === "refunded") await revokeAndRebaseRefund(c, options);
    await finishEvent(c, options.environment, event);
    return { state, refundedAmount: refunded };
  });
}

export async function getAccess(userId: string, environment: AccessEnvironment) {
  if (!["sandbox", "live"].includes(environment)) throw new Error("Invalid environment");
  const [rows]: any = await database().execute(
    `SELECT id,price_id,access_days,starts_at,expires_at,status FROM access_passes
    WHERE user_id=? AND environment=? AND status='active' AND starts_at<=CURRENT_TIMESTAMP(6) AND expires_at>CURRENT_TIMESTAMP(6)
    ORDER BY expires_at DESC LIMIT 1`,
    [userId, environment],
  );
  return rows[0] ?? null;
}

export async function adminChangeAccess(
  actor: Principal | null,
  input: {
    requestId: string;
    userId: string;
    environment: AccessEnvironment;
    action: "grant" | "revoke" | "set_expiry";
    reason: string;
    days?: number;
    passId?: string;
    expiresAt?: string;
  },
) {
  if (
    !actor ||
    !/^[a-f\d-]{36}$/i.test(input.requestId) ||
    !["sandbox", "live"].includes(input.environment) ||
    !["grant", "revoke", "set_expiry"].includes(input.action) ||
    input.reason.trim().length < 3 ||
    input.reason.length > 500
  )
    throw new Error("Invalid administrative access change");
  if (input.action === "grant" && ![30, 180, 365].includes(input.days!))
    throw new Error("Invalid access duration");
  if (input.action !== "grant" && !input.passId) throw new Error("Access record is required");
  if (
    input.action === "set_expiry" &&
    (!input.expiresAt || !Number.isFinite(Date.parse(input.expiresAt)))
  )
    throw new Error("Invalid access expiry");
  const parameters = JSON.stringify({
    userId: input.userId,
    environment: input.environment,
    action: input.action,
    reason: input.reason.trim(),
    days: input.days ?? null,
    passId: input.passId ?? null,
    expiresAt: input.expiresAt ?? null,
  });
  return retryTransaction(async (c) => {
    await requireAdmin(actor, c);
    await lockEntitlements(c, input.userId, input.environment);
    const [prior]: any = await c.execute(
      "SELECT actor_id,parameters,result FROM admin_access_changes WHERE request_id=? FOR UPDATE",
      [input.requestId],
    );
    if (prior.length) {
      const previousParameters =
        typeof prior[0].parameters === "string"
          ? JSON.parse(prior[0].parameters)
          : prior[0].parameters;
      if (prior[0].actor_id !== actor.id || JSON.stringify(previousParameters) !== parameters)
        throw new Error("Admin request ID conflicts with its original values");
      return typeof prior[0].result === "string" ? JSON.parse(prior[0].result) : prior[0].result;
    }
    let result: { passId: string; expiresAt: string };
    if (input.action === "grant") {
      result = await grantInTransaction(c, {
        userId: input.userId,
        environment: input.environment,
        reference: "admin:" + input.requestId,
        orderId: null,
        planId: "admin_grant_" + input.days + "_days",
        days: input.days!,
      });
    } else {
      const [passes]: any = await c.execute(
        "SELECT id,status FROM access_passes WHERE id=? AND user_id=? AND environment=? FOR UPDATE",
        [input.passId!, input.userId, input.environment],
      );
      if (!passes.length) throw new Error("Access record not found");
      if (passes[0].status === "refunded")
        throw new Error("A refunded payment cannot be reactivated; grant access separately");
      const expires = input.action === "revoke" ? new Date() : new Date(input.expiresAt!);
      const status = expires.getTime() <= Date.now() ? "expired" : "active";
      await c.execute(
        "UPDATE access_passes SET expires_at=?,status=?,expiry_is_fixed=true,updated_at=CURRENT_TIMESTAMP(6) WHERE id=?",
        [expires, status, input.passId!],
      );
      result = { passId: input.passId!, expiresAt: expires.toISOString() };
    }
    await c.execute(
      `INSERT INTO admin_access_changes(request_id,actor_id,user_id,environment,action,reason,parameters,result)
      VALUES(?,?,?,?,?,?,?,?)`,
      [
        input.requestId,
        actor.id,
        input.userId,
        input.environment,
        input.action,
        input.reason.trim(),
        parameters,
        JSON.stringify(result),
      ],
    );
    return result;
  });
}
