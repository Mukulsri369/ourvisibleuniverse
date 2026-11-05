import { z } from "zod";
import { ACCESS_PLANS, isPlanId, isCurrency, type PlanId, type Currency } from "./plans";

const identifier = z.string().regex(/^[A-Za-z0-9_]{1,100}$/);
const paymentSchema = z.object({ id: identifier, order_id: identifier, amount: z.number().int().positive().safe(),
  currency: z.enum(["INR", "USD"]), captured: z.boolean(), status: z.string(), amount_refunded: z.number().int().nonnegative().safe() });
const orderSchema = z.object({ id: identifier, amount: z.number().int().positive().safe(), currency: z.enum(["INR", "USD"]),
  status: z.string(), amount_paid: z.number().int().nonnegative().safe() });
export type PaymentMode = "test" | "live";
export type StoredPaymentOrder = { environment: "sandbox" | "live"; orderId: string; userId: string; planId: PlanId;
  days: 30 | 180 | 365; amount: number; currency: Currency };
export type VerifiedPaymentEvent = { id: string; type: string; bodyHash: string };
export type FulfilledPayment = { expiresAt: string; planId: string; status: string; duplicate: boolean };
export interface PaymentStore {
  order(orderId: string, environment: "sandbox" | "live"): Promise<StoredPaymentOrder | null>;
  record(order: StoredPaymentOrder): Promise<void>;
  apply(order: StoredPaymentOrder, paymentId: string, refundedAmount: number, event?: VerifiedPaymentEvent): Promise<FulfilledPayment>;
  ignored(environment: "sandbox" | "live", event: VerifiedPaymentEvent): Promise<void>;
}
export interface PaymentProvider {
  create(input: { planId: PlanId; currency: Currency; userId: string; mode: PaymentMode }): Promise<unknown>;
  order(id: string, mode: PaymentMode): Promise<unknown>;
  payment(id: string, mode: PaymentMode): Promise<unknown>;
  payments(orderId: string, mode: PaymentMode): Promise<{ items: unknown[] }>;
}
export class PaymentRequestError extends Error {
  constructor(readonly status: number, message: string) { super(message); }
}
export function createPaymentService(dependencies: {
  mode: PaymentMode; keyId: () => string; provider: PaymentProvider; store: PaymentStore;
  verifySignature(input: { orderId: string; paymentId: string; signature: string; mode: PaymentMode }): Promise<boolean>;
  verifyWebhook(body: string, signature: string, mode: PaymentMode): Promise<boolean>;
}) {
  const { provider, store, mode } = dependencies;
  const environment = mode === "live" ? "live" : "sandbox";
  async function registered(orderId: string, userId?: string) {
    identifier.parse(orderId);
    const order = await store.order(orderId, environment);
    if (!order || (userId && order.userId !== userId)) throw new PaymentRequestError(404, "Order not found");
    return order;
  }
  async function reconcile(stored: StoredPaymentOrder, paymentId: string, event?: VerifiedPaymentEvent) {
    identifier.parse(paymentId);
    const payment = paymentSchema.parse(await provider.payment(paymentId, mode));
    const order = orderSchema.parse(await provider.order(stored.orderId, mode));
    if (payment.id !== paymentId || payment.order_id !== stored.orderId || order.id !== stored.orderId ||
      payment.amount !== stored.amount || order.amount !== stored.amount || payment.currency !== stored.currency ||
      order.currency !== stored.currency || order.status !== "paid" || order.amount_paid !== stored.amount)
      throw new PaymentRequestError(400, "Payment does not match the stored order");
    if (!payment.captured || !["captured", "refunded"].includes(payment.status))
      throw new PaymentRequestError(400, "Payment has not been captured");
    if (payment.amount_refunded > stored.amount) throw new PaymentRequestError(400, "Invalid verified refund amount");
    // Cumulative provider refund state is persisted in the same transaction as access.
    return store.apply(stored, payment.id, payment.amount_refunded, event);
  }
  async function uniqueCaptured(orderId: string) {
    const collection = await provider.payments(orderId, mode);
    if (!Array.isArray(collection.items)) throw new Error("Payment collection unavailable");
    const captured = collection.items.map(item => paymentSchema.parse(item)).filter(payment =>
      payment.order_id === orderId && payment.captured && ["captured", "refunded"].includes(payment.status));
    if (captured.length !== 1) throw new PaymentRequestError(409, "No unique captured payment is available yet");
    return captured[0];
  }
  return {
    async checkout(userId: string, planId: PlanId, currency: Currency) {
      if (!isPlanId(planId) || !isCurrency(currency)) throw new PaymentRequestError(400, "Invalid access plan");
      const plan = ACCESS_PLANS[planId], price = plan.prices[currency];
      // Read configuration before creating a provider order.
      const keyId = dependencies.keyId();
      const created = orderSchema.parse(await provider.create({ userId, planId, currency, mode }));
      if (!created.id.startsWith("order_") || created.amount !== price.amount || created.currency !== currency ||
        created.status !== "created" || created.amount_paid !== 0) throw new Error("Unexpected provider order");
      await store.record({ environment, orderId: created.id, userId, planId, days: plan.days, amount: price.amount, currency });
      // Never expose the Checkout order before durable ownership/price registration.
      return { orderId: created.id, amount: price.amount, currency, keyId, mode, planName: plan.name };
    },
    async confirm(userId: string, input: { orderId: string; paymentId: string; signature: string }) {
      const stored = await registered(input.orderId, userId);
      if (!/^[a-fA-F0-9]{64}$/.test(input.signature) || !await dependencies.verifySignature({ ...input, mode }))
        throw new PaymentRequestError(401, "Invalid payment signature");
      return reconcile(stored, input.paymentId);
    },
    async recover(userId: string, orderId: string) {
      const stored = await registered(orderId, userId);
      const payment = await uniqueCaptured(orderId);
      return reconcile(stored, payment.id);
    },
    async fulfillVerified(orderId: string, paymentId: string, expectedUserId?: string) {
      return reconcile(await registered(orderId, expectedUserId), paymentId);
    },
    async webhook(rawBody: string, signature: string, eventId: string, requestedMode: PaymentMode) {
      if (requestedMode !== mode) throw new PaymentRequestError(400, "Webhook environment mismatch");
      if (new TextEncoder().encode(rawBody).length > 256 * 1024) throw new PaymentRequestError(413, "Webhook body too large");
      if (!/^[a-fA-F0-9]{64}$/.test(signature) || !await dependencies.verifyWebhook(rawBody, signature, mode))
        throw new PaymentRequestError(401, "Invalid webhook signature");
      if (!/^[A-Za-z0-9_-]{1,160}$/.test(eventId)) throw new PaymentRequestError(400, "Webhook event identifier required");
      let parsed: unknown;
      try { parsed = JSON.parse(rawBody); } catch { throw new PaymentRequestError(400, "Invalid webhook body"); }
      const parsedBody = z.object({ event: z.string().regex(/^[A-Za-z0-9_.]{1,80}$/), payload: z.unknown() }).safeParse(parsed);
      if (!parsedBody.success) throw new PaymentRequestError(400, "Invalid webhook body");
      const body = parsedBody.data;
      const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(rawBody));
      const event = { id: eventId, type: body.event, bodyHash: Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, "0")).join("") };
      if (!["payment.captured", "order.paid", "refund.processed"].includes(body.event)) {
        await store.ignored(environment, event); return { ignored: true };
      }
      const parsedPayload = z.object({ payment: z.object({ entity: z.object({ id: identifier }) }).optional(),
        refund: z.object({ entity: z.object({ payment_id: identifier }) }).optional(),
        order: z.object({ entity: z.object({ id: identifier }) }).optional() }).safeParse(body.payload);
      if (!parsedPayload.success) throw new PaymentRequestError(400, "Invalid webhook payment reference");
      const payload = parsedPayload.data;
      let paymentId = payload.payment?.entity.id ?? payload.refund?.entity.payment_id;
      let orderId = payload.order?.entity.id;
      if (paymentId) orderId = paymentSchema.parse(await provider.payment(paymentId, mode)).order_id;
      if (!orderId) throw new PaymentRequestError(400, "Missing payment reference");
      const stored = await store.order(orderId, environment);
      // Other origins may share this merchant. Their existing webhook remains authoritative.
      if (!stored) { await store.ignored(environment, event); return { ignored: true, reason: "unregistered_order" }; }
      if (!paymentId) paymentId = (await uniqueCaptured(orderId)).id;
      return reconcile(stored, paymentId, event);
    },
  };
}
