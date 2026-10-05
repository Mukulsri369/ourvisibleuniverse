import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { ACCESS_PLANS, isPlanId } from "@/lib/plans";
import { createStripeClient, getStripeErrorMessage, type StripeEnv } from "@/lib/stripe.server";

async function resolveOrCreateCustomer(
  stripe: ReturnType<typeof createStripeClient>,
  options: { email?: string; userId: string },
): Promise<string> {
  if (!/^[a-zA-Z0-9_-]+$/.test(options.userId)) throw new Error("Invalid userId");
  const found = await stripe.customers.search({ query: `metadata['userId']:'${options.userId}'`, limit: 1 });
  if (found.data[0]) return found.data[0].id;
  if (options.email) {
    const existing = await stripe.customers.list({ email: options.email, limit: 1 });
    const customer = existing.data[0];
    if (customer) {
      if (customer.metadata?.userId !== options.userId) {
        await stripe.customers.update(customer.id, { metadata: { ...customer.metadata, userId: options.userId } });
      }
      return customer.id;
    }
  }
  const created = await stripe.customers.create({
    ...(options.email && { email: options.email }),
    metadata: { userId: options.userId },
  });
  return created.id;
}

export const createCheckoutSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { priceId: string; returnUrl: string; environment: StripeEnv }) => {
    if (!isPlanId(data.priceId)) throw new Error("Invalid access pass");
    if (data.environment !== "sandbox" && data.environment !== "live") throw new Error("Invalid payment environment");
    const returnUrl = new URL(data.returnUrl);
    if (!returnUrl.pathname.endsWith("/checkout/return")) throw new Error("Invalid return address");
    return { ...data, priceId: data.priceId, returnUrl: data.returnUrl };
  })
  .handler(async ({ data, context }) => {
    try {
      const stripe = createStripeClient(data.environment);
      const prices = await stripe.prices.list({ lookup_keys: [data.priceId] });
      const price = prices.data[0];
      if (!price) throw new Error("Access pass not found");
      const { data: userData } = await context.supabase.auth.getUser();
      const customerId = await resolveOrCreateCustomer(stripe, { userId: context.userId, email: userData.user?.email });
      const productId = typeof price.product === "string" ? price.product : price.product.id;
      const product = await stripe.products.retrieve(productId);
      const plan = ACCESS_PLANS[data.priceId];
      const session = await stripe.checkout.sessions.create({
        line_items: [{ price: price.id, quantity: 1 }],
        mode: "payment",
        ui_mode: "embedded_page",
        return_url: `${data.returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
        customer: customerId,
        automatic_tax: { enabled: true },
        payment_intent_data: { description: `${product.name} — ${plan.name}` },
        metadata: { userId: context.userId, priceId: data.priceId, accessDays: String(plan.days), managed_payments: "false" },
      });
      return { clientSecret: session.client_secret ?? "" };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });

export const getMyAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { environment: StripeEnv }) => data)
  .handler(async ({ data, context }) => {
    const { data: passes, error } = await context.supabase
      .from("access_passes")
      .select("price_id,access_days,starts_at,expires_at,status")
      .eq("user_id", context.userId)
      .eq("environment", data.environment)
      .order("expires_at", { ascending: false })
      .limit(1);
    if (error) throw error;
    return passes?.[0] ?? null;
  });