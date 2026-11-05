import type { OfflineAction } from "./offline-queue";

export interface JournalStorage {
  readonly length: number;
  key(index: number): string | null;
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}
export const LEGACY_OFFLINE_QUEUE_KEY = "cosmic_academy_offline_queue_v1";
const prefix = LEGACY_OFFLINE_QUEUE_KEY + ":journal:";
export const isOfflineJournalKey = (key: string | null) => key === LEGACY_OFFLINE_QUEUE_KEY || Boolean(key?.startsWith(prefix));
const identity = (action: OfflineAction) => encodeURIComponent(action.ownerId === undefined ? "unowned" : action.ownerId ?? "guest") + ":" + encodeURIComponent(action.id);
const eventKey = (action: OfflineAction) => prefix + "event:" + identity(action);
const ackKey = (action: OfflineAction) => prefix + "ack:" + identity(action);
const valid = (value: unknown): value is OfflineAction => Boolean(value && typeof value === "object" &&
  typeof (value as OfflineAction).id === "string" && typeof (value as OfflineAction).type === "string" &&
  typeof (value as OfflineAction).payload === "object" && (value as OfflineAction).payload !== null &&
  typeof (value as OfflineAction).timestamp === "string" &&
  ((value as OfflineAction).ownerId == null || typeof (value as OfflineAction).ownerId === "string"));

/** Each append is one atomic localStorage write, without a shared-array overwrite. */
export function appendOfflineAction(storage: JournalStorage, action: OfflineAction) {
  if (!valid(action) || !["activity_evidence", "lesson_progress"].includes(action.type)) throw new Error("Invalid offline learning event");
  const key = eventKey(action), serialized = JSON.stringify(action), previous = storage.getItem(key);
  if (previous !== null && previous !== serialized) throw new Error("Offline event ID already contains different content");
  let legacy: unknown = [];
  try { legacy = JSON.parse(storage.getItem(LEGACY_OFFLINE_QUEUE_KEY) ?? "[]"); } catch { /* Retain a corrupt legacy array. */ }
  if (Array.isArray(legacy) && legacy.some(value => valid(value) && identity(value) === identity(action) && JSON.stringify(value) !== serialized))
    throw new Error("Offline event ID already contains different legacy content");
  if (storage.getItem(ackKey(action)) !== null) return;
  storage.setItem(key, serialized);
}

export function readOfflineActions(storage: JournalStorage): OfflineAction[] {
  const events = new Map<string, OfflineAction>();
  const add = (value: unknown) => {
    if (valid(value) && storage.getItem(ackKey(value)) === null && !events.has(identity(value))) events.set(identity(value), value);
  };
  // Preserve legacy bytes. Unowned/anonymous work stays local; acknowledged
  // owned legacy entries are suppressed by per-event tombstones, not rewrites.
  try { const legacy = JSON.parse(storage.getItem(LEGACY_OFFLINE_QUEUE_KEY) ?? "[]"); if (Array.isArray(legacy)) legacy.forEach(add); }
  catch { /* A corrupt legacy entry must not hide newer independent records. */ }
  const keys = Array.from({ length: storage.length }, (_, index) => storage.key(index));
  for (const key of keys) {
    if (!key?.startsWith(prefix + "event:")) continue;
    try { add(JSON.parse(storage.getItem(key) ?? "null")); } catch { /* Retain the corrupt original for recovery. */ }
  }
  return [...events.values()];
}

/** Never delete a newer unrelated event or rewrite another tab's snapshot. */
export function acknowledgeOfflineActions(storage: JournalStorage, actions: OfflineAction[]) {
  let legacy: OfflineAction[] = [];
  try { const value = JSON.parse(storage.getItem(LEGACY_OFFLINE_QUEUE_KEY) ?? "[]"); if (Array.isArray(value)) legacy = value.filter(valid); } catch { /* Preserve original bytes. */ }
  const legacyIds = new Set(legacy.map(identity));
  for (const action of actions) {
    // Only legacy arrays need tombstones. New records can be removed directly;
    // a very late identical append is safely acknowledged by server idempotency.
    // This avoids accumulating an unbounded tombstone for every reading update.
    if (legacyIds.has(identity(action))) storage.setItem(ackKey(action), "1");
    storage.removeItem(eventKey(action));
  }
}
