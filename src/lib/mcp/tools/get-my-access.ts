import { defineTool, ToolError } from "../tool";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_my_access",
  title: "Get my access status",
  description: "Show whether the signed-in user has an active universe pass and when it expires.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) throw new ToolError("Not signed in.");
    const { data, error } = await supabaseForUser(ctx)
      .from("access_passes")
      .select("access_days, starts_at, expires_at, status")
      .eq("user_id", ctx.getUserId()!)
      .order("expires_at", { ascending: false });
    if (error) throw new ToolError("Access status is unavailable. Please try again.");
    const now = Date.now();
    const passes = (data ?? []).map((p) => ({
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
