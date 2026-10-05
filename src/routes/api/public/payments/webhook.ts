import { createFileRoute } from "@tanstack/react-router";
import { type StripeEnv, verifyWebhook } from "@/lib/stripe.server";
import { ACCESS_PLANS, isPlanId } from "@/lib/plans";

async function fulfill(session: Record<string, unknown>, env: StripeEnv) {
  const metadata = session.metadata as Record<string, string> | undefined;
  const userId = metadata?.userId;
  const priceId = metadata?.priceId;
  const sessionId = typeof session.id === "string" ? session.id : undefined;
  if (!userId || !sessionId || !isPlanId(priceId)) throw new Error("Payment is missing access metadata");
  const customerId = typeof session.customer === "string" ? session.customer : "";
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.rpc("apply_access_purchase", {
    p_user_id: userId,
    p_payment_session_id: sessionId,
    p_payment_customer_id: customerId,
    p_price_id: priceId,
    p_access_days: ACCESS_PLANS[priceId].days,
    p_environment: env,
  });
  if (error) throw error;
}

export const Route = createFileRoute("/api/public/payments/webhook")({
  server: { handlers: { POST: async ({ request }) => {
    const rawEnv = new URL(request.url).searchParams.get("env");
    if (rawEnv !== "sandbox" && rawEnv !== "live") return new Response("Invalid environment", { status: 400 });
    try {
      const event = await verifyWebhook(request, rawEnv);
      if ((event.type === "checkout.session.completed" || event.type === "transaction.completed") && event.data.object.payment_status !== "unpaid") {
        await fulfill(event.data.object, rawEnv);
      }
      if (event.type === "checkout.session.async_payment_succeeded") await fulfill(event.data.object, rawEnv);
      return Response.json({ received: true });
    } catch (error) {
      console.error("Payment notification error", error);
      return new Response("Invalid payment notification", { status: 400 });
    }
  } } },
});