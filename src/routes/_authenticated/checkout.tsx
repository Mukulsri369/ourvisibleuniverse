import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PaymentTestModeBanner } from "@/components/payments/PaymentTestModeBanner";
import { StripeEmbeddedCheckout } from "@/components/payments/StripeEmbeddedCheckout";
import { isPlanId } from "@/lib/plans";

export const Route = createFileRoute("/_authenticated/checkout")({
  validateSearch: (s: Record<string, unknown>) => ({ plan: isPlanId(s.plan) ? s.plan : "universe_30_days" }),
  head: () => ({ meta: [{ title:"Secure checkout — Our Visible Universe" },{name:"description",content:"Complete payment for your access pass."},{property:"og:title",content:"Secure checkout — Our Visible Universe"},{property:"og:description",content:"Complete payment for your access pass."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary"}] }), component: CheckoutPage,
});
function CheckoutPage() { const { plan }=Route.useSearch(); return <div className="min-h-screen bg-background"><PaymentTestModeBanner/><header className="border-b border-border px-5 py-4"><Link to="/pricing" className="inline-flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft className="size-4"/>Back to passes</Link></header><main className="mx-auto max-w-3xl px-4 py-10"><h1 className="mb-7 text-3xl font-semibold">Complete your access</h1><StripeEmbeddedCheckout priceId={plan}/></main></div>; }