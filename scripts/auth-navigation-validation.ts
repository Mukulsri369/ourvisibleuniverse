import assert from "node:assert/strict";
import {
  authDestination,
  googleAuthCallback,
  readAuthNext,
  saveAuthNext,
  clearAuthNext,
} from "../src/lib/auth-navigation";

const cases: Array<[unknown, unknown, boolean, string]> = [
  ["/checkout?plan=year", null, false, "/checkout?plan=year"],
  [undefined, "/account", false, "/account"],
  [undefined, undefined, true, "/learn"],
  [undefined, undefined, false, "/universe"],
  ["https://evil.example", "//evil.example", false, "/universe"],
  [undefined, "/\\evil.example", true, "/learn"],
  [undefined, "/\n//evil.example", false, "/universe"],
  ["/learn/module-1?lesson=intro#quiz", "/account", true, "/learn/module-1?lesson=intro#quiz"],
];
for (const [next, saved, student, expected] of cases)
  assert.equal(authDestination(next, saved, student), expected);
for (const origin of [
  "https://ourvisibleuniverse.in",
  "https://example.lovable.app",
  "http://localhost:3000",
]) {
  const callback = new URL(googleAuthCallback(origin, "/checkout?plan=year"));
  assert.equal(callback.origin, origin);
  assert.equal(callback.pathname, "/auth");
  assert.equal(callback.searchParams.get("next"), "/checkout?plan=year");
  assert.equal(
    authDestination(callback.searchParams.get("next"), null, false),
    "/checkout?plan=year",
  );
}
const blockedStorage = {
  getItem() {
    throw Error("blocked");
  },
  setItem() {
    throw Error("blocked");
  },
  removeItem() {
    throw Error("blocked");
  },
};
Object.defineProperty(globalThis, "sessionStorage", { value: blockedStorage, configurable: true });
assert.equal(readAuthNext(), null);
assert.doesNotThrow(() => saveAuthNext("/learn"));
assert.doesNotThrow(clearAuthNext);
delete (globalThis as { sessionStorage?: unknown }).sessionStorage;
console.log(
  "Auth navigation checks passed: destinations, redirect safety, three hosting origins, blocked storage.",
);
