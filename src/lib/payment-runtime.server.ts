import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { isPlanId } from "./plans";
import { createPaymentService, type PaymentStore, type StoredPaymentOrder } from "./payment-service.server";
import { createRazorpayOrder, razorpayRequest, getRazorpayMode, getRazorpayConfig, verifyRazorpaySignature, verifyRazorpayWebhook } from "./razorpay.server";

const storedSchema = z.object({ environment: z.enum(["sandbox", "live"]), order_id: z.string(), user_id: z.uuid(),
  plan_id: z.string(), access_days: z.union([z.literal(30), z.literal(180), z.literal(365)]),
  amount_minor: z.number().int().positive().safe(), currency: z.enum(["INR", "USD"]) });
const resultSchema = z.object({ expiresAt: z.iso.datetime({ offset: true }), planId: z.string(),
  status: z.enum(["active", "expired", "scheduled", "refunded", "failed"]), duplicate: z.boolean() });

export function paymentRuntime() {
  const db = supabaseAdmin as unknown as SupabaseClient;
  const store: PaymentStore = {
    async order(orderId, environment) {
      const result = await db.from("payment_orders").select("environment,order_id,user_id,plan_id,access_days,amount_minor,currency")
        .eq("environment", environment).eq("order_id", orderId).maybeSingle();
      if (result.error) throw new Error("Payment storage is unavailable");
      if (!result.data) return null;
      const row = storedSchema.parse(result.data);
      if (!isPlanId(row.plan_id)) throw new Error("Stored payment plan requires reconciliation");
      return { environment: row.environment, orderId: row.order_id, userId: row.user_id, planId: row.plan_id,
        days: row.access_days, amount: row.amount_minor, currency: row.currency } satisfies StoredPaymentOrder;
    },
    async record(order) {
      const result = await db.from("payment_orders").insert({ environment: order.environment, order_id: order.orderId,
        user_id: order.userId, plan_id: order.planId, access_days: order.days, amount_minor: order.amount, currency: order.currency });
      if (result.error) throw new Error("Payment order could not be registered safely");
    },
    async apply(order, paymentId, refundedAmount, event) {
      const result = await db.rpc("payment_apply_verified_capture", { p_environment: order.environment, p_order_id: order.orderId,
        p_payment_id: paymentId, p_user_id: order.userId, p_amount: order.amount, p_currency: order.currency, p_refunded: refundedAmount,
        p_event_id: event?.id ?? null, p_event_type: event?.type ?? null, p_body_sha256: event?.bodyHash ?? null });
      if (result.error) throw new Error("Payment reconciliation could not be completed safely");
      return resultSchema.parse(result.data);
    },
    async ignored(environment, event) {
      const result = await db.rpc("payment_record_event", { p_environment: environment, p_event_id: event.id,
        p_event_type: event.type, p_body_sha256: event.bodyHash, p_state: "ignored" });
      if (result.error) throw new Error("Payment event could not be recorded safely");
    },
  };
  return createPaymentService({ mode: getRazorpayMode(), keyId: () => getRazorpayConfig().keyId, store,
    provider: { create: createRazorpayOrder,
      order: (id, mode) => razorpayRequest(`/orders/${encodeURIComponent(id)}`, { method: "GET" }, mode),
      payment: (id, mode) => razorpayRequest(`/payments/${encodeURIComponent(id)}`, { method: "GET" }, mode),
      payments: (id, mode) => razorpayRequest(`/orders/${encodeURIComponent(id)}/payments`, { method: "GET" }, mode) },
    verifySignature: verifyRazorpaySignature, verifyWebhook: verifyRazorpayWebhook });
}
