import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Check } from "lucide-react";
import { ACCESS_PLANS } from "@/lib/plans";
import { CurrencyToggle, useCurrency } from "@/hooks/use-currency";

export function Plans() {
  const { currency } = useCurrency();
  return (
    <div>
      <div className="mb-6 flex items-center justify-end gap-3 font-mono text-xs text-white/50">
        <span>Currency</span>
        <CurrencyToggle />
      </div>

      {/* Architectural 1px Hairline Grid */}
      <div className="grid gap-px overflow-hidden rounded-3xl border border-white/[0.12] bg-white/[0.12] lg:grid-cols-3">
        {Object.values(ACCESS_PLANS).map((plan, index) => {
          const isFeatured = index === 2;
          return (
            <article
              key={plan.id}
              className={`flex flex-col justify-between p-9 sm:p-11 transition-colors duration-300 ${
                isFeatured
                  ? "bg-gradient-to-b from-[#111522] to-[#070910]"
                  : "bg-[#06080e]/95 hover:bg-[#0a0d16]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.24em]">
                  <span className={isFeatured ? "text-[#f5d08a]" : "text-white/45"}>
                    {plan.note}
                  </span>
                  {isFeatured && (
                    <span className="rounded-full border border-[#f5d08a]/40 bg-[#f5d08a]/10 px-2.5 py-0.5 text-[9px] font-semibold text-[#f5d08a]">
                      POPULAR
                    </span>
                  )}
                </div>

                <h3
                  className="mt-4 text-2xl font-medium uppercase text-white"
                  style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
                >
                  {plan.name}
                </h3>

                <p className="mt-5 font-mono text-4xl font-semibold tracking-tight text-white tabular-nums">
                  {plan.prices[currency].label}
                </p>

                <p className="mt-2 text-xs text-white/45">
                  One-time payment · No auto-renewal
                </p>

                <ul className="mt-8 space-y-3 border-t border-white/[0.08] pt-6 text-sm font-light text-white/75">
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 shrink-0 text-[#f5d08a]" />
                    <span>Full 3D Relativistic Universe</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 shrink-0 text-[#f5d08a]" />
                    <span>100,000+ Stars, Exoplanets & Galaxies</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 shrink-0 text-[#f5d08a]" />
                    <span>24-Module Academy & Certificates</span>
                  </li>
                </ul>
              </div>

              <Link
                to="/checkout"
                search={{ plan: plan.id }}
                className={`group mt-10 inline-flex h-12 w-full items-center justify-between rounded-full pl-6 pr-2 text-xs font-semibold uppercase tracking-[0.18em] transition-all duration-300 ${
                  isFeatured
                    ? "bg-[#f5d08a] text-[#05060a] hover:bg-white"
                    : "border border-white/15 bg-white/[0.04] text-white hover:border-white/35 hover:bg-white/[0.1]"
                }`}
              >
                <span>Select {plan.name}</span>
                <span
                  className={`flex size-8 items-center justify-center rounded-full transition-transform duration-300 group-hover:rotate-45 ${
                    isFeatured
                      ? "bg-[#05060a] text-[#f5d08a]"
                      : "bg-white/10 text-white"
                  }`}
                >
                  <ArrowUpRight className="size-4" />
                </span>
              </Link>
            </article>
          );
        })}
      </div>
    </div>
  );
}
