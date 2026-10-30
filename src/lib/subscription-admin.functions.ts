import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireIndependentAuth } from "@/backend/session-middleware";
const environment = z.enum(["live", "sandbox"]);
const query = z
  .object({
    environment,
    search: z.string().trim().max(200).default(""),
    status: z.enum(["all", "active", "expired", "refunded", "failed"]).default("all"),
    page: z.number().int().min(0).max(100000).default(0),
  })
  .strict();
const grant = z
  .object({
    email: z.email().max(254),
    days: z.union([z.literal(30), z.literal(180), z.literal(365)]),
    environment,
    reason: z.string().trim().min(3).max(500),
    requestId: z.uuid(),
  })
  .strict();

export const getSubscriptionAdminStatus = createServerFn({ method: "GET" })
  .middleware([requireIndependentAuth])
  .handler(async ({ context }) => {
    const [{ subscriptionAdminStatus }, { paymentMode }] = await Promise.all([
      import("@/backend/subscribers.server"),
      import("@/backend/payments.server"),
    ]);
    return {
      isAdmin: await subscriptionAdminStatus(context.principal),
      setupRequired: false,
      environment: paymentMode() === "live" ? ("live" as const) : ("sandbox" as const),
    };
  });
export const listSubscribers = createServerFn({ method: "GET" })
  .middleware([requireIndependentAuth])
  .inputValidator((input) => query.parse(input))
  .handler(async ({ context, data }) => {
    const { readSubscribers } = await import("@/backend/subscribers.server");
    return (await readSubscribers(context.principal, data)) as SubscriberPage;
  });
export const grantSubscriberAccess = createServerFn({ method: "POST" })
  .middleware([requireIndependentAuth])
  .inputValidator((input) => grant.parse(input))
  .handler(async ({ context, data }) => {
    const { grantByEmail } = await import("@/backend/subscribers.server");
    return grantByEmail(context.principal, data);
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
