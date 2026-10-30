import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireIndependentAuth } from "@/backend/session-middleware";
import { ACCESS_PLANS, isPlanId } from "@/lib/plans";

const checkoutInput = z
  .object({ planId: z.string(), currency: z.enum(["INR", "USD"]).default("INR") })
  .strict();
const verificationInput = z
  .object({
    razorpay_order_id: z.string().regex(/^[\w-]{1,100}$/),
    razorpay_payment_id: z.string().regex(/^[\w-]{1,100}$/),
    razorpay_signature: z.string().regex(/^[a-fA-F0-9]{64}$/),
  })
  .strict();

export const createRazorpayCheckout = createServerFn({ method: "POST" })
  .middleware([requireIndependentAuth])
  .inputValidator((input) => checkoutInput.parse(input))
  .handler(async ({ data, context }) => {
    if (!isPlanId(data.planId)) throw new Error("Invalid access pass");
    const { paymentService } = await import("@/backend/payments.server");
    try {
      const checkout = await paymentService().checkout(context.userId, data.planId, data.currency);
      return {
        ...checkout,
        customerEmail: context.principal.email,
        planName: ACCESS_PLANS[data.planId].name,
      };
    } catch {
      throw new Error("Payment checkout is temporarily unavailable. Please try again later.");
    }
  });

export const confirmRazorpayPayment = createServerFn({ method: "POST" })
  .middleware([requireIndependentAuth])
  .inputValidator((input) => verificationInput.parse(input))
  .handler(async ({ data, context }) => {
    const { paymentService } = await import("@/backend/payments.server");
    let result: Awaited<ReturnType<ReturnType<typeof paymentService>["confirm"]>>;
    try {
      result = await paymentService().confirm(context.userId, {
        orderId: data.razorpay_order_id,
        paymentId: data.razorpay_payment_id,
        signature: data.razorpay_signature,
      });
    } catch {
      throw new Error(
        "We could not confirm this payment. If you were charged, contact support before trying again.",
      );
    }
    if (result.status === "refunded")
      throw new Error("This payment was refunded. Access was not activated.");
    if (result.status !== "active" || new Date(result.expiresAt).getTime() <= Date.now())
      throw new Error(
        "This purchase no longer has active access. Contact support if you need help.",
      );
    return { success: true as const, expiresAt: result.expiresAt };
  });

export const getMyAccess = createServerFn({ method: "GET" })
  .middleware([requireIndependentAuth])
  .handler(async ({ context }) => {
    const [{ paymentMode }, { getAccess }, { database }] = await Promise.all([
      import("@/backend/payments.server"),
      import("@/backend/access.server"),
      import("@/backend/db.server"),
    ]);
    const environment = paymentMode() === "live" ? ("live" as const) : ("sandbox" as const);
    let row = await getAccess(context.userId, environment);
    if (!row) {
      const [rows]: any = await database().execute(
        "SELECT price_id,access_days,starts_at,expires_at,status FROM access_passes WHERE user_id=? AND environment=? ORDER BY expires_at DESC LIMIT 1",
        [context.userId, environment],
      );
      row = rows[0] ?? null;
      if (row?.status === "active")
        row = {
          ...row,
          status: new Date(row.starts_at).getTime() > Date.now() ? "scheduled" : "expired",
        };
    }
    return {
      access: row
        ? {
            price_id: String(row.price_id),
            access_days: Number(row.access_days),
            starts_at: new Date(row.starts_at).toISOString(),
            expires_at: new Date(row.expires_at).toISOString(),
            status: String(row.status),
          }
        : null,
      environment,
    };
  });
