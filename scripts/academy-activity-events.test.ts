import assert from "node:assert/strict";
import { test } from "node:test";
import { activityEventIdentity } from "../src/lib/academy/activity-event.server";

const input = { userId: "fixture-user", moduleId: "01", activityId: "fixture-activity", accessible: false };
test("retry identity is stable across object-key order and binds event ownership/content", () => {
  const first = activityEventIdentity({ ...input, payload: { b: 2, a: [1, 2] } });
  assert.deepEqual(first, activityEventIdentity({ ...input, payload: { a: [1, 2], b: 2 } }));
  assert.notEqual(first.fingerprint, activityEventIdentity({ ...input, userId: "other", payload: { b: 2, a: [1, 2] } }).fingerprint);
  assert.notEqual(first.fingerprint, activityEventIdentity({ ...input, payload: { a: [2, 1], b: 2 } }).fingerprint);
  const explicit = activityEventIdentity({ ...input, payload: {}, clientEventId: "fixture-event-1" });
  assert.equal(explicit.eventId, "client:fixture-event-1");
});
test("cyclic, non-JSON, oversized or invalid-ID events cannot be acknowledged", () => {
  const cyclic: Record<string, unknown> = {}; cyclic.self = cyclic;
  for (const payload of [cyclic, { value: Infinity }, { value: new Date() }, { value: "x".repeat(70 * 1024) }]) {
    assert.throws(() => activityEventIdentity({ ...input, payload }));
  }
  assert.throws(() => activityEventIdentity({ ...input, payload: {}, clientEventId: "../../invalid" }));
});
