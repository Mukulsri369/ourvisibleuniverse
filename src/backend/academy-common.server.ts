import { createHash } from "node:crypto";
import type { PoolConnection } from "mysql2/promise";
import type { Principal } from "./authorization.server";

export function json<T = any>(value: T | string): T {
  return typeof value === "string" ? JSON.parse(value) : value;
}
export function stableHash(value: unknown): string {
  const stable = (v: any): any =>
    Array.isArray(v)
      ? v.map(stable)
      : v !== null && typeof v === "object"
        ? Object.fromEntries(
            Object.keys(v)
              .sort()
              .map((k) => [k, stable(v[k])]),
          )
        : v;
  return createHash("sha256")
    .update(JSON.stringify(stable(value)))
    .digest("hex");
}
export async function lockLearner(
  c: PoolConnection,
  principal: Principal | null,
  allowPractice = false,
) {
  if (!principal) throw new Error("Student session required");
  const [rows]: any = await c.execute(
    "SELECT id,emailVerified,isAnonymous FROM auth_user WHERE id=? FOR UPDATE",
    [principal.id],
  );
  const row = rows[0];
  if (!row || (!row.emailVerified && !(allowPractice && row.isAnonymous)))
    throw new Error("Verified student account required");
  return principal.id;
}
export async function academyAudit(
  c: PoolConnection,
  actor: string,
  action: string,
  entity: string,
  state: unknown,
  previous: unknown = null,
  role = "service_role",
) {
  await c.execute(
    `INSERT INTO academy_audit_log(actor_id,actor_role,action,entity_type,entity_id,previous_state,new_state)
    VALUES(?,?,?,'academy',?,?,?)`,
    [actor, role, action, entity, JSON.stringify(previous), JSON.stringify(state)],
  );
}
