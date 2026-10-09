export const CURRENCIES = ["INR", "USD"] as const;
export type Currency = (typeof CURRENCIES)[number];
export function isCurrency(value: unknown): value is Currency {
  return value === "INR" || value === "USD";
}

export const ACCESS_PLANS = {
  universe_30_days: { id: "universe_30_days", name: "30 days", days: 30, price: "₹179", amount: 17900, note: "Flexible access",
    prices: { INR: { label: "₹179", amount: 17900 }, USD: { label: "$2.49", amount: 249 } } },
  universe_180_days: { id: "universe_180_days", name: "180 days", days: 180, price: "₹799", amount: 79900, note: "Save 26%",
    prices: { INR: { label: "₹799", amount: 79900 }, USD: { label: "$9.99", amount: 999 } } },
  universe_365_days: { id: "universe_365_days", name: "365 days", days: 365, price: "₹1,399", amount: 139900, note: "Save 35%",
    prices: { INR: { label: "₹1,399", amount: 139900 }, USD: { label: "$16.99", amount: 1699 } } },
} as const;
export type PlanId = keyof typeof ACCESS_PLANS;
export function isPlanId(value: unknown): value is PlanId {
  return typeof value === "string" && value in ACCESS_PLANS;
}
export function planPrice(planId: PlanId, currency: Currency) {
  return ACCESS_PLANS[planId].prices[currency];
}
