export interface OfflineAction {
  id: string;
  type: "activity_evidence" | "lesson_progress";
  payload: Record<string, unknown>;
  timestamp: string;
  ownerId?: string | null;
}

/** A queued action cannot be reassigned by the auth middleware during sign-in. */
export function assertOfflineOwner(expected: string | undefined, authenticated: string) {
  if (expected !== undefined && expected !== authenticated)
    throw new Error("Queued learning activity belongs to another account. Sign in to its original account to synchronize it.");
}

export function isPersistedAcknowledgement(value: unknown): value is { success: true } {
  return typeof value === "object" && value !== null && "success" in value && value.success === true;
}

/** A successful HTTP promise is not an acknowledgement of a persisted event. */
export async function flushAcknowledgedOfflineActions(storage: {
  ownerId: string;
  read(): OfflineAction[];
  write?(actions: OfflineAction[]): void;
  send(action: OfflineAction): Promise<unknown>;
  acknowledge?(actions: OfflineAction[]): void;
}) {
  const snapshot = [...new Map(storage.read().map(action => [String(action.ownerId) + ":" + action.id, action])).values()], remaining: OfflineAction[] = [], acknowledged: OfflineAction[] = [];
  for (const action of snapshot) {
    // Legacy/unowned and anonymous actions remain local practice. Never guess
    // their identity or replay them into the next account that signs in.
    if (action.ownerId !== storage.ownerId) { remaining.push(action); continue; }
    if (!["activity_evidence", "lesson_progress"].includes(action.type)) { remaining.push(action); continue; }
    try {
      const saved = await storage.send(action);
      if (!isPersistedAcknowledgement(saved)) remaining.push(action);
      else acknowledged.push(action);
    } catch { remaining.push(action); }
  }
  if (storage.acknowledge) {
    storage.acknowledge(acknowledged);
    return storage.read().filter(action => action.ownerId === storage.ownerId).length;
  }
  // UI events can be appended while a network request is pending. Retain those
  // alongside unacknowledged events rather than overwriting the newer queue.
  const key = (action: OfflineAction) => String(action.ownerId) + ":" + action.id;
  const originalIds = new Set(snapshot.map(key));
  const appended = storage.read().filter(action => !originalIds.has(key(action)));
  const retained = [...new Map([...remaining, ...appended].map(action => [key(action), action])).values()];
  if (!storage.write) throw new Error("Offline storage requires acknowledgement or snapshot persistence");
  storage.write(retained);
  return retained.filter(action => action.ownerId === storage.ownerId).length;
}
