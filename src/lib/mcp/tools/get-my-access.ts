import { defineTool, ToolError } from "../tool";
import { supabaseForUser } from "../supabase";
import { z } from "zod";
import { getAccessEnvironment } from "../../access-environment.server";

const accessSummary = z.array(z.object({
  access_days: z.number().int().positive(),
  starts_at: z.iso.datetime({ offset: true }),
  expires_at: z.iso.datetime({ offset: true }),
  status: z.enum(["active", "expired", "refunded", "failed"]),
}));

export default defineTool({
  name: "get_my_access",
  title: "Get my access status",
  description: "Show whether the signed-in user has an active universe pass and when it expires.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) throw new ToolError("Not signed in.");
    const { data, error } = await supabaseForUser(ctx)
      .rpc("get_my_access_summary", { p_environment: getAccessEnvironment() });
    if (error) throw new ToolError("Access status is unavailable. Please try again.");
    const parsed = accessSummary.safeParse(data);
    if (!parsed.success) throw new ToolError("Access status is unavailable. Please try again.");
    const now = Date.now();
    const passes = parsed.data.map((p) => ({
      days: p.access_days,
      startsAt: p.starts_at,
      expiresAt: p.expires_at,
      status: p.status,
    }));
    const active = passes.find(
      (p) => p.status === "active" && new Date(p.startsAt).getTime() <= now && new Date(p.expiresAt).getTime() > now,
    );
    const text = active
      ? `Active pass until ${active.expiresAt} (${Math.ceil((new Date(active.expiresAt).getTime() - now) / 86400000)} days left).`
      : "No active pass. See list_access_plans.";
    return {
      content: [{ type: "text", text }],
      structuredContent: { active: Boolean(active), passes },
    };
  },
});
