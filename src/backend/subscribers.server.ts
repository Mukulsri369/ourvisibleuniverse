import { z } from "zod";
import { database, transaction } from "./db.server";
import { requireAdmin, type Principal } from "./authorization.server";
import { adminChangeAccess } from "./access.server";

export const subscriberQuery = z
  .object({
    environment: z.enum(["live", "sandbox"]),
    search: z.string().trim().max(200).default(""),
    status: z.enum(["all", "active", "expired", "refunded", "failed"]).default("all"),
    page: z.number().int().min(0).max(100000).default(0),
  })
  .strict();
export const subscriberGrant = z
  .object({
    email: z.email().max(254),
    days: z.union([z.literal(30), z.literal(180), z.literal(365)]),
    environment: z.enum(["live", "sandbox"]),
    reason: z.string().trim().min(3).max(500),
    requestId: z.uuid(),
  })
  .strict();

export async function subscriptionAdminStatus(actor: Principal | null) {
  try {
    await requireAdmin(actor);
    return true;
  } catch (error) {
    if (error instanceof Error && error.message === "Administrator access required") return false;
    throw error;
  }
}

export async function readSubscribers(actor: Principal | null, input: unknown) {
  const data = subscriberQuery.parse(input);
  return transaction(async (c) => {
    await requireAdmin(actor, c);
    const people = `WITH ranked AS (
      SELECT p.*,ROW_NUMBER() OVER(PARTITION BY user_id ORDER BY (status='active' AND starts_at<=CURRENT_TIMESTAMP(6) AND expires_at>CURRENT_TIMESTAMP(6)) DESC,expires_at DESC,created_at DESC,id) AS ranking
      FROM access_passes p WHERE environment=?
    ), people AS (
      SELECT p.user_id,u.email,u.name,p.price_id,p.access_days,p.starts_at,p.expires_at,
      CASE WHEN p.status='active' AND p.expires_at<=CURRENT_TIMESTAMP(6) THEN 'expired' WHEN p.status='active' AND p.starts_at>CURRENT_TIMESTAMP(6) THEN 'scheduled' ELSE p.status END AS status,
      (p.status='active' AND p.starts_at<=CURRENT_TIMESTAMP(6) AND p.expires_at>CURRENT_TIMESTAMP(6)) AS has_access,
      CASE WHEN p.payment_session_id LIKE 'admin:%' THEN 'Admin grant' ELSE 'Payment' END AS source
      FROM ranked p JOIN auth_user u ON u.id=p.user_id WHERE p.ranking=1
    ), filtered AS (
      SELECT * FROM people WHERE (?='all' OR status=?) AND INSTR(LOWER(CONCAT(COALESCE(email,''),' ',name)),LOWER(?))>0
    )`;
    const params = [data.environment, data.status, data.status, data.search];
    const [users]: any = await c.execute(
      people + " SELECT * FROM filtered ORDER BY expires_at DESC,user_id LIMIT 50 OFFSET ?",
      [...params, data.page * 50],
    );
    const [counts]: any = await c.execute(
      people +
        ` SELECT (SELECT COUNT(*) FROM filtered) AS total,(SELECT COUNT(*) FROM people WHERE has_access) AS active,(SELECT COUNT(*) FROM people) AS subscribers`,
      params,
    );
    return {
      users: users.map((u: any) => ({
        ...u,
        access_days: Number(u.access_days),
        has_access: Boolean(u.has_access),
        starts_at: new Date(u.starts_at).toISOString(),
        expires_at: new Date(u.expires_at).toISOString(),
      })),
      total: Number(counts[0].total),
      active: Number(counts[0].active),
      subscribers: Number(counts[0].subscribers),
    };
  });
}

export async function grantByEmail(actor: Principal | null, input: unknown) {
  await requireAdmin(actor);
  const data = subscriberGrant.parse(input);
  const [rows]: any = await database().execute(
    "SELECT id FROM auth_user WHERE LOWER(email)=LOWER(?) AND emailVerified=true",
    [data.email.trim()],
  );
  if (rows.length !== 1) throw new Error("Ask this user to sign in and verify their email first.");
  const grant = await adminChangeAccess(actor, {
    requestId: data.requestId,
    userId: rows[0].id,
    environment: data.environment,
    action: "grant",
    reason: data.reason,
    days: data.days,
  });
  return { expiresAt: grant.expiresAt, userId: rows[0].id };
}
