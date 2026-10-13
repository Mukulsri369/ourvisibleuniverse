import { useEffect, useState } from "react";
import { isCurrency, type Currency } from "@/lib/plans";

const KEY = "ovu-currency";
const listeners = new Set<(c: Currency) => void>();

function detectCurrency(): Currency {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
    if (tz === "Asia/Kolkata" || tz === "Asia/Calcutta") return "INR";
    const langs = navigator.languages ?? [navigator.language];
    if (langs.some((l) => /-IN$/i.test(l))) return "INR";
  } catch {
    /* ignore */
  }
  return "USD";
}

export function useCurrency() {
  const [currency, setState] = useState<Currency>("INR");
  useEffect(() => {
    const saved = localStorage.getItem(KEY);
    setState(isCurrency(saved) ? saved : detectCurrency());
    listeners.add(setState);
    return () => {
      listeners.delete(setState);
    };
  }, []);
  const setCurrency = (c: Currency) => {
    localStorage.setItem(KEY, c);
    listeners.forEach((l) => l(c));
  };
  return { currency, setCurrency };
}

export function CurrencyToggle() {
  const { currency, setCurrency } = useCurrency();
  return (
    <div className="inline-flex border border-border text-sm" role="group" aria-label="Currency">
      {(["INR", "USD"] as const).map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => setCurrency(c)}
          aria-pressed={currency === c}
          className={`px-3 py-1.5 ${currency === c ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          {c === "INR" ? "₹ INR" : "$ USD"}
        </button>
      ))}
    </div>
  );
}
