import assert from "node:assert/strict";
import { test } from "node:test";
import { assertOfflineOwner, flushAcknowledgedOfflineActions, isPersistedAcknowledgement, type OfflineAction } from "../src/lib/academy/offline-queue";

const ownerId = "11111111-1111-4111-8111-111111111111";
const action = (id: string, type: OfflineAction["type"] = "lesson_progress"): OfflineAction => ({ id, type, payload: {}, ownerId, timestamp: "2026-11-04T00:00:00Z" });
function fixture(initial: OfflineAction[]) {
  let value = structuredClone(initial);
  return { ownerId, read: () => structuredClone(value), write: (next: OfflineAction[]) => { value = structuredClone(next); } };
}
test("only positively acknowledged reading/activity events are removed", async () => {
  const storage = fixture([action("reading"), action("activity", "activity_evidence")]);
  assert.equal(await flushAcknowledgedOfflineActions({ ...storage, send: async () => ({ success: true }) }), 0);
  assert.deepEqual(storage.read(), []);
});
test("false, absent and failed acknowledgements preserve the original retry records", async () => {
  const initial = [action("false"), action("absent"), action("outage")], storage = fixture(initial);
  const pending = await flushAcknowledgedOfflineActions({ ...storage, send: async event => {
    if (event.id === "outage") throw new Error("Synthetic network outage");
    return event.id === "false" ? { success: false } : null;
  } });
  assert.equal(pending, 3); assert.deepEqual(storage.read(), initial);
});
test("events appended while a request is pending survive the older flush snapshot", async () => {
  const storage = fixture([action("existing")]);
  const pending = await flushAcknowledgedOfflineActions({ ...storage, send: async () => {
    storage.write([...storage.read(), action("new-reading")]);
    return { success: true };
  } });
  assert.equal(pending, 1); assert.deepEqual(storage.read().map(event => event.id), ["new-reading"]);
});
test("retry IDs are retained once and unsupported actions never reach an API", async () => {
  const unsupported = { ...action("untrusted"), type: "grant_access" } as unknown as OfflineAction;
  const storage = fixture([action("retry"), action("retry"), unsupported]); let calls = 0;
  await flushAcknowledgedOfflineActions({ ...storage, send: async () => { calls++; return { success: false }; } });
  assert.equal(calls, 1); assert.deepEqual(storage.read().map(event => event.id), ["retry", "untrusted"]);
});
test("only a boolean true in the acknowledgement object confirms persistence", () => {
  for (const value of [null, undefined, true, "true", {}, { success: "true" }, { success: 1 }, { success: false }]) {
    assert.equal(isPersistedAcknowledgement(value), false);
  }
  assert.equal(isPersistedAcknowledgement({ success: true }), true);
});

test("another account, anonymous practice and legacy unowned actions are never uploaded", async () => {
  const own = action("own"), other = { ...action("other"), ownerId: "other-user" },
    guest = { ...action("guest"), ownerId: null }, legacy = { ...action("legacy"), ownerId: undefined };
  const storage = fixture([own, other, guest, legacy]);
  const sent: string[] = [];
  await flushAcknowledgedOfflineActions({ ...storage, send: async event => { sent.push(event.id); return { success: true }; } });
  assert.deepEqual(sent, ["own"]);
  assert.deepEqual(storage.read().map(event => event.id), ["other", "guest", "legacy"]);
});

test("server ownership binding rejects an account switch even if the browser changes its bearer token", () => {
  assert.doesNotThrow(() => assertOfflineOwner(ownerId, ownerId));
  assert.doesNotThrow(() => assertOfflineOwner(undefined, ownerId));
  assert.throws(() => assertOfflineOwner(ownerId, "different-user"), /another account/);
});
