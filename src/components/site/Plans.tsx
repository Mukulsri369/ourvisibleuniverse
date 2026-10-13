import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { ACCESS_PLANS } from "@/lib/plans";
import { Button } from "@/components/ui/button";
import { CurrencyToggle, useCurrency } from "@/hooks/use-currency";
export function Plans() {
  const { currency } = useCurrency();
  return (
    <div>
      <div className="mb-5 flex items-center justify-end gap-3">
        <span className="text-sm text-muted-foreground">Currency</span>
        <CurrencyToggle />
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        {Object.values(ACCESS_PLANS).map((plan, index) => (
          <article
            key={plan.id}
            className={`border p-7 ${index === 2 ? "border-primary bg-primary/5" : "border-border bg-card"}`}
          >
            <p className="text-sm font-semibold text-primary">{plan.note}</p>
            <h3 className="mt-3 text-2xl font-semibold">{plan.name}</h3>
            <p className="mt-4 text-4xl font-semibold">{plan.prices[currency].label}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              One payment. Access starts after confirmation.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex gap-2">
                <Check className="size-4 text-primary" />
                Full interactive universe
              </li>
              <li className="flex gap-2">
                <Check className="size-4 text-primary" />
                All galaxies, systems and objects
              </li>
              <li className="flex gap-2">
                <Check className="size-4 text-primary" />
                No automatic renewal
              </li>
            </ul>
            <Button asChild className="mt-7 w-full">
              <Link to="/checkout" search={{ plan: plan.id }}>
                Choose {plan.name}
              </Link>
            </Button>
          </article>
        ))}
      </div>
    </div>
  );
}
