import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { createCheckoutSession } from "@/utils/payments.functions";
import type { PlanId } from "@/lib/plans";

export function StripeEmbeddedCheckout({ priceId }: { priceId: PlanId }) {
  const fetchClientSecret = async () => {
    const result = await createCheckoutSession({ data: {
      priceId,
      environment: getStripeEnvironment(),
      returnUrl: `${window.location.origin}/checkout/return`,
    } });
    if ("error" in result) throw new Error(result.error);
    if (!result.clientSecret) throw new Error("The payment form could not be opened.");
    return result.clientSecret;
  };
  return <EmbeddedCheckoutProvider stripe={getStripe()} options={{ fetchClientSecret }}><EmbeddedCheckout /></EmbeddedCheckoutProvider>;
}