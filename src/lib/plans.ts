export const ACCESS_PLANS = {
  universe_30_days: { id: "universe_30_days", name: "30 days", days: 30, price: "₹179", note: "Flexible access" },
  universe_180_days: { id: "universe_180_days", name: "180 days", days: 180, price: "₹799", note: "Save 26%" },
  universe_365_days: { id: "universe_365_days", name: "365 days", days: 365, price: "₹1,399", note: "Save 35%" },
} as const;
export type PlanId = keyof typeof ACCESS_PLANS;
export function isPlanId(value: unknown): value is PlanId {
  return typeof value === "string" && value in ACCESS_PLANS;
}