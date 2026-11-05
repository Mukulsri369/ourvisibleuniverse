export interface OfflineAction {
  id: string;
  type: "activity_evidence" | "lesson_progress";
  payload: Record<string, unknown>;
  timestamp: string;
}

export function isPersistedAcknowledgement(value: unknown): value is { success: true } {
  return typeof value === "object" && value !== null && "success" in value && value.success === true;
}

/** A successful HTTP promise is not an acknowledgement of a persisted event. */
export async function flushAcknowledgedOfflineActions(storage: {
  read(): OfflineAction[];
  write(actions: OfflineAction[]): void;
  send(action: OfflineAction): Promise<unknown>;
}) {
  const snapshot = [...new Map(storage.read().map(action => [action.id, action])).values()], remaining: OfflineAction[] = [];
  for (const action of snapshot) {
    if (!["activity_evidence", "lesson_progress"].includes(action.type)) { remaining.push(action); continue; }
    try {
      const saved = await storage.send(action);
      if (!isPersistedAcknowledgement(saved)) remaining.push(action);
    } catch { remaining.push(action); }
  }
  // UI events can be appended while a network request is pending. Retain those
  // alongside unacknowledged events rather than overwriting the newer queue.
  const originalIds = new Set(snapshot.map(action => action.id));
  const appended = storage.read().filter(action => !originalIds.has(action.id));
  const retained = [...new Map([...remaining, ...appended].map(action => [action.id, action])).values()];
  storage.write(retained);
  return retained.length;
}
