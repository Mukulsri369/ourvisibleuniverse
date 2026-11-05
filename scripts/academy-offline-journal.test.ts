import assert from "node:assert/strict";
import { test } from "node:test";
import { acknowledgeOfflineActions, appendOfflineAction, LEGACY_OFFLINE_QUEUE_KEY, readOfflineActions, type JournalStorage } from "../src/lib/academy/offline-journal";
import { flushAcknowledgedOfflineActions, type OfflineAction } from "../src/lib/academy/offline-queue";

function memoryStorage(): JournalStorage {
  const values = new Map<string, string>();
  return { get length() { return values.size; }, key: index => [...values.keys()][index] ?? null,
    getItem: key => values.get(key) ?? null, setItem: (key, value) => { values.set(key, value); }, removeItem: key => { values.delete(key); } };
}
const event = (id: string, ownerId: string | null = "account-a"): OfflineAction => ({ id, ownerId,
  type: "lesson_progress", payload: { moduleId: "01", lessonId: "01-core", scrollDepthPercent: 80, timeSpentSeconds: 120 }, timestamp: "2026-11-05T00:00:00Z" });
const adapter = (storage: JournalStorage, send: (action: OfflineAction) => Promise<unknown>) => ({ ownerId: "account-a",
  read: () => readOfflineActions(storage), acknowledge: (actions: OfflineAction[]) => acknowledgeOfflineActions(storage, actions), send });

test("tabs append independently after reading the same empty snapshot without overwriting each other", () => {
  const storage = memoryStorage();
  assert.deepEqual(readOfflineActions(storage), []); assert.deepEqual(readOfflineActions(storage), []);
  appendOfflineAction(storage, event("tab-b")); appendOfflineAction(storage, event("tab-a"));
  assert.deepEqual(readOfflineActions(storage).map(action => action.id).sort(), ["tab-a", "tab-b"]);
});
test("acknowledgement removes only the confirmed event while another tab appends new work", async () => {
  const storage = memoryStorage(); appendOfflineAction(storage, event("in-flight"));
  const pending = await flushAcknowledgedOfflineActions(adapter(storage, async () => {
    appendOfflineAction(storage, event("new-tab-event")); return { success: true };
  }));
  assert.equal(pending, 1); assert.deepEqual(readOfflineActions(storage).map(action => action.id), ["new-tab-event"]);
});
test("simultaneous flush acknowledgements cannot remove a third event added during either request", async () => {
  const storage = memoryStorage(); appendOfflineAction(storage, event("shared"));
  let release!: () => void; const gate = new Promise<void>(done => { release = done; }); let started = 0;
  const send = async () => { if (++started === 2) { appendOfflineAction(storage, event("unrelated")); release(); } await gate; return { success: true }; };
  await Promise.all([flushAcknowledgedOfflineActions(adapter(storage, send)), flushAcknowledgedOfflineActions(adapter(storage, send))]);
  assert.equal(started, 2); assert.deepEqual(readOfflineActions(storage).map(action => action.id), ["unrelated"]);
});
test("legacy bytes are preserved and only acknowledged owned entries receive tombstones", async () => {
  const storage = memoryStorage(), old = JSON.stringify([event("owned-legacy"), event("guest-legacy", null), { ...event("unowned-legacy"), ownerId: undefined }]);
  storage.setItem(LEGACY_OFFLINE_QUEUE_KEY, old); const sent: string[] = [];
  await flushAcknowledgedOfflineActions(adapter(storage, async action => { sent.push(action.id); return { success: true }; }));
  assert.deepEqual(sent, ["owned-legacy"]); assert.equal(storage.getItem(LEGACY_OFFLINE_QUEUE_KEY), old);
  assert.throws(() => appendOfflineAction(storage, { ...event("owned-legacy"), payload: { changed: true } }), /different legacy content/);
  assert.deepEqual(readOfflineActions(storage).map(action => action.id), ["guest-legacy", "unowned-legacy"]);
});
test("identical IDs in different accounts do not overwrite or acknowledge each other", async () => {
  const storage = memoryStorage(); appendOfflineAction(storage, event("same")); appendOfflineAction(storage, event("same", "account-b"));
  await flushAcknowledgedOfflineActions(adapter(storage, async () => ({ success: true })));
  assert.deepEqual(readOfflineActions(storage).map(action => action.ownerId), ["account-b"]);
});
test("failed requests and unavailable storage never discard unacknowledged events", async () => {
  const storage = memoryStorage(); appendOfflineAction(storage, event("keep"));
  await flushAcknowledgedOfflineActions(adapter(storage, async () => { throw new Error("Synthetic offline network"); }));
  assert.equal(readOfflineActions(storage).length, 1);
  const full = { ...storage, setItem: () => { throw new Error("Synthetic quota failure"); } };
  assert.throws(() => appendOfflineAction(full, event("new")), /quota failure/);
  assert.deepEqual(readOfflineActions(storage).map(action => action.id), ["keep"]);
});
test("duplicate appends retain one record; conflicting content cannot replace pending work", () => {
  const storage = memoryStorage(); appendOfflineAction(storage, event("immutable")); appendOfflineAction(storage, event("immutable"));
  assert.throws(() => appendOfflineAction(storage, { ...event("immutable"), payload: { changed: true } }), /different content/);
  assert.deepEqual(readOfflineActions(storage), [event("immutable")]);
});
test("a corrupt legacy array cannot hide independently stored new events", () => {
  const storage = memoryStorage(); storage.setItem(LEGACY_OFFLINE_QUEUE_KEY, "broken-json"); appendOfflineAction(storage, event("valid"));
  assert.equal(readOfflineActions(storage).length, 1); assert.equal(storage.getItem(LEGACY_OFFLINE_QUEUE_KEY), "broken-json");
});
