import { Link } from "@tanstack/react-router";
import { ACCESS_PLANS } from "@/lib/plans";
import { CurrencyToggle, useCurrency } from "@/hooks/use-currency";
export function LandingPlans() {
  const { currency } = useCurrency();
  return (
    <div className="ovu-pass-options">
      <div className="ovu-pass-included">
        <p>
          Every pass includes the full 3D universe, 100,000+ stars, exoplanets and galaxies, plus
          all 24 academy modules and certificates.
        </p>
        <div className="ovu-currency">
          <span>Currency</span>
          <CurrencyToggle />
        </div>
      </div>
      {Object.values(ACCESS_PLANS).map((plan) => (
        <article key={plan.id} className="ovu-pass-row">
          <h3>{plan.name}</h3>
          <p className="ovu-pass-price">{plan.prices[currency].label}</p>
          <p>
            {plan.note}
            <br />
            <span>One-time payment</span>
          </p>
          <Link to="/checkout" search={{ plan: plan.id }} className="ovu-button">
            Select {plan.name}
          </Link>
        </article>
      ))}
    </div>
  );
}
