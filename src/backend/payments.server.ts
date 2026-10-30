import { createHash } from "node:crypto";
import { z } from "zod";
import { database } from "./db.server";
import {
  recordOrder,
  applyCapturedPayment,
  type StoredOrder,
  type VerifiedEvent,
} from "./access.server";
import { ACCESS_PLANS, type PlanId, type Currency } from "../lib/plans";
import {
  createRazorpayOrder,
  getRazorpayConfig,
  getRazorpayMode,
  razorpayRequest,
  verifyRazorpaySignature,
  verifyRazorpayWebhook,
  type RazorpayMode,
  type RazorpayPayment,
  type RazorpayOrder,
} from "../lib/razorpay.server";

const identifier = z.string().regex(/^[\w-]{1,100}$/);
const paymentSchema = z.object({
  id: identifier,
  order_id: identifier,
  amount: z.number().int().positive().safe(),
  currency: z.enum(["INR", "USD"]),
  captured: z.boolean(),
  status: z.string(),
  amount_refunded: z.number().int().nonnegative().safe(),
});

export const paymentMode = getRazorpayMode;

export class PaymentRequestError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export interface PaymentProvider {
  create(options: {
    planId: PlanId;
    currency: Currency;
    userId: string;
    mode: RazorpayMode;
  }): Promise<RazorpayOrder>;
  payment(id: string, mode: RazorpayMode): Promise<RazorpayPayment>;
  order(id: string, mode: RazorpayMode): Promise<RazorpayOrder>;
  payments(orderId: string, mode: RazorpayMode): Promise<{ items: RazorpayPayment[] }>;
}
const provider: PaymentProvider = {
  create: createRazorpayOrder,
  payment: (id, mode) =>
    razorpayRequest(`/payments/${encodeURIComponent(id)}`, { method: "GET" }, mode),
  order: (id, mode) =>
    razorpayRequest(`/orders/${encodeURIComponent(id)}`, { method: "GET" }, mode),
  payments: (id, mode) =>
    razorpayRequest(`/orders/${encodeURIComponent(id)}/payments`, { method: "GET" }, mode),
};

export function paymentService(api: PaymentProvider = provider) {
  async function storedOrder(
    orderId: string,
    mode: RazorpayMode,
    userId?: string,
  ): Promise<StoredOrder> {
    identifier.parse(orderId);
    const environment = mode === "test" ? "sandbox" : "live";
    const [rows]: any = await database().execute(
      "SELECT * FROM payment_orders WHERE environment=? AND order_id=?",
      [environment, orderId],
    );
    const row = rows[0];
    if (!row || (userId && row.user_id !== userId)) throw new Error("Order not found");
    return {
      environment,
      orderId: row.order_id,
      userId: row.user_id,
      planId: row.plan_id,
      days: Number(row.access_days),
      amount: Number(row.amount_minor),
      currency: row.currency,
    };
  }
  async function reconcile(
    orderId: string,
    paymentId: string,
    mode: RazorpayMode,
    userId?: string,
    event?: VerifiedEvent,
  ) {
    const stored = await storedOrder(orderId, mode, userId);
    identifier.parse(paymentId);
    const payment = paymentSchema.parse(await api.payment(paymentId, mode));
    const order = await api.order(stored.orderId, mode);
    if (
      payment.id !== paymentId ||
      payment.order_id !== stored.orderId ||
      order.id !== stored.orderId ||
      payment.amount !== stored.amount ||
      order.amount !== stored.amount ||
      payment.currency !== stored.currency ||
      order.currency !== stored.currency ||
      order.status !== "paid" ||
      order.amount_paid !== stored.amount
    )
      throw new Error("Provider payment details do not match the stored order");
    if (!payment.captured || !["captured", "refunded"].includes(payment.status))
      throw new Error("Payment has not been captured");
    if (payment.amount_refunded > stored.amount) throw new Error("Invalid provider refund");
    // Capture and any already-observed refund are persisted atomically, including
    // refund-before-capture delivery. Provider notes and current prices cannot change history.
    return applyCapturedPayment(
      { ...stored, paymentId, refundedAmount: payment.amount_refunded },
      event,
    );
  }
  return {
    async checkout(userId: string, planId: PlanId, currency: Currency) {
      const mode = paymentMode(),
        plan = ACCESS_PLANS[planId];
      if (!plan || !["INR", "USD"].includes(currency)) throw new Error("Invalid plan");
      const order = await api.create({ userId, planId, currency, mode });
      identifier.parse(order.id);
      if (
        order.amount !== plan.prices[currency].amount ||
        order.currency !== currency ||
        order.status !== "created"
      )
        throw new Error("Unexpected provider order");
      await recordOrder({
        userId,
        orderId: order.id,
        planId,
        days: plan.days,
        currency,
        amount: order.amount,
        environment: mode === "test" ? "sandbox" : "live",
      });
      // Never return an order to Checkout before durable ownership/price registration.
      return {
        orderId: order.id,
        amount: order.amount,
        currency,
        mode,
        keyId: getRazorpayConfig(mode).keyId,
      };
    },
    async confirm(
      userId: string,
      input: { orderId: string; paymentId: string; signature: string },
    ) {
      const mode = paymentMode();
      await storedOrder(input.orderId, mode, userId);
      if (!(await verifyRazorpaySignature({ ...input, mode })))
        throw new Error("Invalid payment signature");
      return reconcile(input.orderId, input.paymentId, mode, userId);
    },
    async recover(userId: string, orderId: string) {
      const mode = paymentMode();
      await storedOrder(orderId, mode, userId);
      const result = await api.payments(orderId, mode);
      const captured = result.items.filter(
        (p) => p.captured && ["captured", "refunded"].includes(p.status),
      );
      if (captured.length !== 1)
        throw new Error("No unique captured payment is available for recovery");
      return reconcile(orderId, captured[0].id, mode, userId);
    },
    async webhook(rawBody: string, signature: string, eventId: string, mode: RazorpayMode) {
      if (mode !== paymentMode())
        throw new PaymentRequestError(400, "Webhook environment mismatch");
      if (Buffer.byteLength(rawBody) > 256 * 1024)
        throw new PaymentRequestError(413, "Webhook request too large");
      if (!(await verifyRazorpayWebhook(rawBody, signature, mode)))
        throw new PaymentRequestError(401, "Invalid webhook signature");
      if (!/^[\w-]{1,160}$/.test(eventId))
        throw new PaymentRequestError(400, "Webhook event identifier required");
      const body = z.object({ event: z.string(), payload: z.unknown() }).parse(JSON.parse(rawBody));
      const event = {
        id: eventId,
        type: body.event,
        bodyHash: createHash("sha256").update(rawBody).digest("hex"),
      };
      if (["payment.captured", "order.paid", "refund.processed"].includes(body.event)) {
        // Refund payloads identify a payment; always fetch its current authenticated state.
        const payload = z
          .object({
            payment: z
              .object({ entity: z.object({ id: identifier, order_id: identifier }) })
              .optional(),
            refund: z.object({ entity: z.object({ payment_id: identifier }) }).optional(),
          })
          .parse(body.payload);
        const id = payload.payment?.entity.id ?? payload.refund?.entity.payment_id;
        if (!id) throw new Error("Missing payment reference");
        const payment = await api.payment(id, mode);
        return reconcile(payment.order_id, id, mode, undefined, event);
      }
      // Other notifications never grant access. Failed attempts leave checkout retryable.
      return { ignored: true };
    },
  };
}
