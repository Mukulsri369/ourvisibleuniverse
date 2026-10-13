import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check } from "lucide-react";
import { RazorpayCheckout } from "@/components/payments/RazorpayCheckout";
import { PublicLayout } from "@/components/site/PublicLayout";
import { isPlanId, ACCESS_PLANS } from "@/lib/plans";
import { CurrencyToggle, useCurrency } from "@/hooks/use-currency";

export const Route = createFileRoute("/_authenticated/checkout")({
  validateSearch: (search: Record<string, unknown>) => ({
    plan: isPlanId(search.plan) ? search.plan : "universe_30_days",
  }),
  head: () => ({
    meta: [
      { title: "Secure checkout — Our Visible Universe" },
      {
        name: "description",
        content: "Complete payment for your fixed-term universe access pass.",
      },
      { property: "og:title", content: "Secure checkout — Our Visible Universe" },
      {
        property: "og:description",
        content: "Complete payment for your fixed-term universe access pass.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { plan: planId } = Route.useSearch();
  const plan = ACCESS_PLANS[planId];
  const { currency } = useCurrency();
  const price = plan.prices[currency].label;
  return (
    <PublicLayout>
      <main className="mx-auto max-w-3xl px-5 pb-24 pt-36 lg:px-8">
        <Link
          to="/pricing"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to pricing
        </Link>
        <p className="mt-10 text-sm font-semibold uppercase text-primary">Secure payment</p>
        <h1 className="mt-3 text-4xl font-semibold">Complete your {plan.name} pass</h1>
        <p className="mt-4 leading-7 text-muted-foreground">
          One payment of {price}. Your access begins after payment confirmation and does not renew
          automatically.
        </p>
        <section className="mt-10 border border-border bg-card p-7">
          <div className="flex items-center justify-end">
            <CurrencyToggle />
          </div>
          <div className="mt-4 flex items-baseline justify-between gap-4">
            <h2 className="text-xl font-semibold">Our Visible Universe</h2>
            <p className="text-3xl font-semibold">{price}</p>
          </div>
          <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <Check className="size-4 text-primary" />
              Complete 3D universe for {plan.days} days
            </li>
            <li className="flex gap-2">
              <Check className="size-4 text-primary" />
              No automatic renewal
            </li>
            <li className="flex gap-2">
              <Check className="size-4 text-primary" />
              Access activates after secure confirmation
            </li>
          </ul>
          <RazorpayCheckout planId={planId} currency={currency} label={`Pay ${price}`} />
          <p className="mt-4 text-xs leading-5 text-muted-foreground">
            Payments are processed securely by Razorpay. International cards are charged in USD. Do
            not close this page until confirmation is complete.
          </p>
        </section>
      </main>
    </PublicLayout>
  );
}
