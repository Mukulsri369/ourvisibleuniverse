import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { ACCESS_PLANS, isPlanId } from "@/lib/plans";

const checkoutInput = z.object({
  planId: z.string(),
  currency: z.enum(["INR", "USD"]).default("INR"),
});
const verificationInput = z.object({
  razorpay_order_id: z.string().min(1).max(100),
  razorpay_payment_id: z.string().min(1).max(100),
  razorpay_signature: z.string().regex(/^[a-fA-F0-9]{64}$/),
});

export const createRazorpayCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => checkoutInput.parse(input))
  .handler(async ({ data, context }) => {
    if (!isPlanId(data.planId)) throw new Error("Invalid access pass");
    try {
      const { paymentRuntime } = await import("@/lib/payment-runtime.server");
      const order = await paymentRuntime().checkout(context.userId, data.planId, data.currency);
      const { data: userData } = await context.supabase.auth.getUser();
      return {
        keyId: order.keyId,
        orderId: order.orderId,
        amount: order.amount,
        currency: order.currency,
        customerEmail: userData.user?.email ?? "",
        planName: ACCESS_PLANS[data.planId].name,
        mode: order.mode,
      };
    } catch (error) {
      console.error("Unable to create Razorpay order", error);
      throw new Error("Payment checkout is temporarily unavailable. Please try again later.");
    }
  });

export const confirmRazorpayPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => verificationInput.parse(input))
  .handler(async ({ data, context }) => {
    try {
      const { paymentRuntime } = await import("@/lib/payment-runtime.server");
      const result = await paymentRuntime().confirm(context.userId, { orderId: data.razorpay_order_id,
        paymentId: data.razorpay_payment_id, signature: data.razorpay_signature });
      return { success: true as const, ...result };
    } catch (error) {
      console.error("Unable to confirm Razorpay payment", error);
      throw new Error(
        "We could not confirm this payment. If you were charged, contact support before trying again.",
      );
    }
  });

export const recoverRazorpayPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ orderId: z.string().regex(/^order_[A-Za-z0-9]+$/).max(100) }).parse(input))
  .handler(async ({ data, context }) => {
    try {
      const { paymentRuntime } = await import("@/lib/payment-runtime.server");
      return await paymentRuntime().recover(context.userId, data.orderId);
    } catch {
      throw new Error("No confirmed payment could be recovered yet. Check your account or retry later before starting another payment.");
    }
  });

// Recoverable order references come from the authenticated server, not browser storage.
export const getMyPendingPayments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { getRazorpayMode } = await import("@/lib/razorpay.server");
    const db = supabaseAdmin as unknown as import("@supabase/supabase-js").SupabaseClient;
    const { data, error } = await db.from("payment_orders").select("order_id,created_at,amount_minor,currency")
      .eq("user_id", context.userId).eq("environment", getRazorpayMode() === "live" ? "live" : "sandbox")
      .eq("state", "created").gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString())
      .order("created_at", { ascending: false }).limit(5);
    if (error) throw new Error("Pending checkout history is temporarily unavailable.");
    return z.array(z.object({ order_id: z.string().regex(/^order_[A-Za-z0-9]+$/), created_at: z.string(),
      amount_minor: z.number().int().positive(), currency: z.enum(["INR", "USD"]) })).parse(data);
  });

export const getMyAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getAccessEnvironment } = await import("@/lib/access-environment.server");
    const environment = getAccessEnvironment();
    const now = new Date().toISOString();
    const { data: active, error: activeError } = await context.supabase
      .from("access_passes")
      .select("price_id,access_days,starts_at,expires_at,status")
      .eq("user_id", context.userId)
      .eq("environment", environment)
      .eq("status", "active")
      .lte("starts_at", now)
      .gt("expires_at", now)
      .order("expires_at", { ascending: false })
      .limit(1);
    if (activeError) throw activeError;
    if (active?.[0]) return { access: active[0], environment };
    const { data, error } = await context.supabase
      .from("access_passes")
      .select("price_id,access_days,starts_at,expires_at,status")
      .eq("user_id", context.userId)
      .eq("environment", environment)
      .order("expires_at", { ascending: false })
      .limit(1);
    if (error) throw error;
    const latest = data?.[0];
    // Historical or scheduled rows must not grant access merely because their expiry is later.
    return {
      access: latest
        ? {
            ...latest,
            status:
              latest.status === "active"
                ? new Date(latest.starts_at).getTime() > new Date(now).getTime()
                  ? "scheduled"
                  : "expired"
                : latest.status,
          }
        : null,
      environment,
    };
  });
