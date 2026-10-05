import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { ACCESS_PLANS, isPlanId } from "@/lib/plans";

const checkoutInput = z.object({ planId: z.string() });
const verificationInput = z.object({
  razorpay_order_id: z.string().min(1).max(100),
  razorpay_payment_id: z.string().min(1).max(100),
  razorpay_signature: z.string().regex(/^[a-fA-F0-9]{64}$/),
});

export const createRazorpayCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(input => checkoutInput.parse(input))
  .handler(async ({ data, context }) => {
    if (!isPlanId(data.planId)) throw new Error("Invalid access pass");
    try {
      const { createRazorpayOrder, getRazorpayConfig, getRazorpayMode } = await import("@/lib/razorpay.server");
      const mode = getRazorpayMode();
      const order = await createRazorpayOrder({ planId: data.planId, userId: context.userId, mode });
      const { keyId } = getRazorpayConfig(mode);
      const { data: userData } = await context.supabase.auth.getUser();
      return {
        keyId,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        customerEmail: userData.user?.email ?? "",
        planName: ACCESS_PLANS[data.planId].name,
        mode,
      };
    } catch (error) {
      console.error("Unable to create Razorpay order", error);
      throw new Error("Payment checkout is temporarily unavailable. Please try again later.");
    }
  });

export const confirmRazorpayPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(input => verificationInput.parse(input))
  .handler(async ({ data, context }) => {
    try {
      const { fulfillRazorpayPayment, getRazorpayMode, verifyRazorpaySignature } = await import("@/lib/razorpay.server");
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
      throw new Error("We could not confirm this payment. If you were charged, contact support before trying again.");
    }
  });

export const getMyAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getRazorpayMode } = await import("@/lib/razorpay.server");
    const environment = getRazorpayMode() === "live" ? "live" : "sandbox";
    const { data, error } = await context.supabase
      .from("access_passes")
      .select("price_id,access_days,starts_at,expires_at,status")
      .eq("user_id", context.userId)
      .eq("environment", environment)
      .order("expires_at", { ascending: false })
      .limit(1);
    if (error) throw error;
    return { access: data?.[0] ?? null, environment };
  });
