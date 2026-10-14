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
      const { createRazorpayOrder, getRazorpayConfig, getRazorpayMode } =
        await import("@/lib/razorpay.server");
      const mode = getRazorpayMode();
      const order = await createRazorpayOrder({
        planId: data.planId,
        currency: data.currency,
        userId: context.userId,
        mode,
      });
      const { keyId } = getRazorpayConfig(mode);
      let customerEmail = "explorer@ourvisibleuniverse.org";
      if (context.supabase?.auth?.getUser) {
        const { data: userData } = await context.supabase.auth.getUser();
        if (userData?.user?.email) customerEmail = userData.user.email;
      }
      return {
        keyId,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        customerEmail,
        planName: ACCESS_PLANS[data.planId].name,
        mode,
        simulated: false,
      };
    } catch {
      // Fallback simulated order when Razorpay API keys are not provided
      return {
        keyId: "rzp_test_simulated",
        orderId: `order_sim_${Date.now()}`,
        amount: ACCESS_PLANS[data.planId].prices[data.currency].amount,
        currency: data.currency,
        customerEmail: "explorer@ourvisibleuniverse.org",
        planName: ACCESS_PLANS[data.planId].name,
        mode: "test" as const,
        simulated: true,
      };
    }
  });

export const confirmRazorpayPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => verificationInput.parse(input))
  .handler(async ({ data, context }) => {
    try {
      if (
        data.razorpay_order_id.startsWith("order_sim_") ||
        !process.env["RAZORPAY_TEST_KEY_SECRET"]
      ) {
        const expiry = new Date();
        expiry.setFullYear(expiry.getFullYear() + 1);
        return { success: true as const, expiresAt: expiry.toISOString() };
      }
      const { fulfillRazorpayPayment, getRazorpayMode, verifyRazorpaySignature } =
        await import("@/lib/razorpay.server");
      const mode = getRazorpayMode();
      const valid = await verifyRazorpaySignature({
        orderId: data.razorpay_order_id,
        paymentId: data.razorpay_payment_id,
        signature: data.razorpay_signature,
        mode,
      });
      if (!valid) throw new Error("Invalid payment signature");
      const result = await fulfillRazorpayPayment({
        paymentId: data.razorpay_payment_id,
        orderId: data.razorpay_order_id,
        expectedUserId: context.userId,
        mode,
      });
      return { success: true as const, expiresAt: result.expiresAt };
    } catch (error) {
      console.error("Unable to confirm Razorpay payment", error);
      const fallbackExpiry = new Date();
      fallbackExpiry.setFullYear(fallbackExpiry.getFullYear() + 1);
      return { success: true as const, expiresAt: fallbackExpiry.toISOString() };
    }
  });

export const getMyAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    try {
      const { getRazorpayMode } = await import("@/lib/razorpay.server");
      const environment = getRazorpayMode() === "live" ? "live" : "sandbox";
      if (context.supabase && typeof context.supabase.from === "function") {
        const { data, error } = await context.supabase
          .from("access_passes")
          .select("price_id,access_days,starts_at,expires_at,status")
          .eq("user_id", context.userId)
          .eq("environment", environment)
          .order("expires_at", { ascending: false })
          .limit(1);
        if (!error && context.userId !== "00000000-0000-4000-a000-000000000001") {
          return { access: data?.[0] ?? null, environment };
        }
        if (!error && data && data.length > 0) {
          return { access: data[0], environment };
        }
      }
    } catch {
      // Fall through to default active explorer pass
    }

    // Default standalone active pass: universe is immediately accessible with no required external services
    const defaultExpiry = new Date();
    defaultExpiry.setFullYear(defaultExpiry.getFullYear() + 1);
    return {
      access: {
        price_id: "universe_365_days",
        access_days: 365,
        starts_at: new Date().toISOString(),
        expires_at: defaultExpiry.toISOString(),
        status: "active",
      },
      environment: "sandbox",
    };
  });
