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
            className={`rounded-3xl border p-8 transition-all duration-300 hover:-translate-y-1 ${
              index === 2
                ? "border-cyan-500/50 bg-cyan-950/20 backdrop-blur-md shadow-xl shadow-cyan-500/10"
                : "border-white/10 bg-slate-900/50 backdrop-blur-md hover:border-white/20"
            }`}
          >
            <p className="text-sm font-semibold text-cyan-400">{plan.note}</p>
            <h3 className="mt-3 text-2xl font-bold text-white">{plan.name}</h3>
            <p className="mt-4 text-4xl font-extrabold text-white">{plan.prices[currency].label}</p>
            <p className="mt-2 text-sm text-slate-400">
              One payment. Access starts after confirmation.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-300">
              <li className="flex gap-2">
                <Check className="size-4 text-cyan-400 shrink-0" />
                Full interactive universe
              </li>
              <li className="flex gap-2">
                <Check className="size-4 text-cyan-400 shrink-0" />
                All galaxies, systems and objects
              </li>
              <li className="flex gap-2">
                <Check className="size-4 text-cyan-400 shrink-0" />
                No automatic renewal
              </li>
            </ul>
            <Button
              asChild
              className={`mt-8 w-full ${
                index === 2
                  ? "bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-semibold shadow-lg shadow-cyan-500/20"
                  : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
              }`}
            >
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
