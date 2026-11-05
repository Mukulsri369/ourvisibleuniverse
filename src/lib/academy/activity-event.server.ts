import { createHash } from "node:crypto";

function canonical(value: unknown, seen: WeakSet<object>, depth = 0): unknown {
  if (depth > 16) throw new Error("Activity payload is too deeply nested");
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "object" || !value) throw new Error("Activity payload must contain JSON values");
  if (seen.has(value)) throw new Error("Activity payload must not be cyclic");
  seen.add(value);
  try {
    if (Array.isArray(value)) return value.map(item => canonical(item === undefined ? null : item, seen, depth + 1));
    if (![Object.prototype, null].includes(Object.getPrototypeOf(value))) throw new Error("Activity payload must contain plain objects");
    const result: Record<string, unknown> = Object.create(null);
    for (const key of Object.keys(value).sort()) {
      const item = (value as Record<string, unknown>)[key];
      if (item !== undefined) result[key] = canonical(item, seen, depth + 1);
    }
    return result;
  } finally { seen.delete(value); }
}

/** Content identity for retry deduplication, never an authentication credential. */
export function activityEventIdentity(input: { userId: string; moduleId: string; activityId: string;
  payload: Record<string, unknown>; accessible: boolean; clientTimestamp?: string; clientEventId?: string }) {
  if (input.clientEventId !== undefined && !/^[\w:.-]{3,120}$/.test(input.clientEventId)) throw new Error("Invalid activity event ID");
  const serialized = JSON.stringify(canonical({ userId: input.userId, moduleId: input.moduleId,
    activityId: input.activityId, payload: input.payload, accessible: input.accessible, clientTimestamp: input.clientTimestamp ?? null }, new WeakSet()));
  if (new TextEncoder().encode(serialized).byteLength > 64 * 1024) throw new Error("Activity payload is too large");
  const fingerprint = createHash("sha256").update(serialized).digest("hex");
  return { fingerprint, eventId: input.clientEventId ? "client:" + input.clientEventId : "digest:" + fingerprint };
}
