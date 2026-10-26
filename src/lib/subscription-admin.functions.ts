import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
const environment = z.enum(["live", "sandbox"]);
const query = z.object({
  environment,
  search: z.string().trim().max(200).default(""),
  status: z.enum(["all", "active", "expired", "refunded", "failed"]).default("all"),
  page: z.number().int().min(0).max(100000).default(0),
});
export const getSubscriptionAdminStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getRazorpayMode } = await import("@/lib/razorpay.server");
    const currentEnvironment =
      getRazorpayMode() === "live" ? ("live" as const) : ("sandbox" as const);
    const db = context.supabase as unknown as SupabaseClient;
    const { data, error } = await db.rpc("is_subscription_admin");
    if (error) {
      if (error.code === "PGRST202" || error.code === "42883") {
        const { data: identity } = await context.supabase.auth.getUser();
        return {
          environment: currentEnvironment,
          isAdmin: false,
          setupRequired:
            identity.user?.email?.toLowerCase() === "mukul.srivastava.025@gmail.com" &&
            !!identity.user.email_confirmed_at,
        };
      }
      throw new Error("Unable to verify administrator access. Please retry.");
    }
    return { isAdmin: data === true, setupRequired: false, environment: currentEnvironment };
  });
export const listSubscribers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => query.parse(input))
  .handler(async ({ data, context }) => {
    const db = context.supabase as unknown as SupabaseClient;
    const result = await db.rpc("admin_list_subscribers", {
      p_environment: data.environment,
      p_search: data.search,
      p_status: data.status,
      p_offset: data.page * 50,
      p_limit: 50,
    });
    if (result.error)
      throw new Error(
        result.error.code === "42501"
          ? "Administrator access required"
          : "Unable to load subscribers. Please retry.",
      );
    return result.data as SubscriberPage;
  });
export type Subscriber = {
  user_id: string;
  email: string;
  name: string;
  price_id: string;
  access_days: number;
  starts_at: string;
  expires_at: string;
  status: string;
  has_access: boolean;
  source: string;
};
export type SubscriberPage = {
  users: Subscriber[];
  total: number;
  active: number;
  subscribers: number;
};
const grant = z.object({
  email: z.email().max(254),
  days: z.union([z.literal(30), z.literal(180), z.literal(365)]),
  environment,
  reason: z.string().trim().min(3).max(500),
  requestId: z.uuid(),
});
export const grantSubscriberAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => grant.parse(input))
  .handler(async ({ data, context }) => {
    const db = context.supabase as unknown as SupabaseClient;
    const result = await db.rpc("admin_grant_access", {
      p_email: data.email,
      p_days: data.days,
      p_environment: data.environment,
      p_reason: data.reason,
      p_request_id: data.requestId,
    });
    if (result.error) {
      if (result.error.code === "42501") throw new Error("Administrator access required");
      if (result.error.message.includes("must sign in"))
        throw new Error("Ask this user to sign in and verify their email first.");
      throw new Error(
        "Unable to grant access. Retry with the same request; access will not be duplicated.",
      );
    }
    return result.data as { expiresAt: string; userId: string };
  });
