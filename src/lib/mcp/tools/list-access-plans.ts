import { defineTool } from "@lovable.dev/mcp-js";
import { ACCESS_PLANS } from "@/lib/plans";

export default defineTool({
  name: "list_access_plans",
  title: "List access plans",
  description: "List the fixed-term universe access passes with their INR and USD prices.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const plans = Object.values(ACCESS_PLANS).map((p) => ({ id: p.id, name: p.name, days: p.days, note: p.note, inr: p.prices.INR.label, usd: p.prices.USD.label }));
    return {
      content: [{ type: "text", text: plans.map((p) => `${p.name}: ${p.inr} / ${p.usd} (${p.note})`).join("\n") + "\nOne-time payment, no auto-renewal. Buy at https://ourvisibleuniverse.in/pricing" }],
      structuredContent: { plans },
    };
  },
});
