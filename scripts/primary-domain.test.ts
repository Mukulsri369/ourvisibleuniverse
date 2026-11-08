import assert from "node:assert/strict";
import { test } from "node:test";
import { primaryDomainRedirect } from "../src/lib/primary-domain";

const live = {
  OVU_DEPLOYMENT_STAGE: "production",
  PUBLIC_APP_ORIGIN: "https://ourvisibleuniverse.com",
};
test("primary-domain redirect preserves routes and encoded query parameters on each legacy alias", () => {
  for (const host of [
    "ourvisibleuniverse.in",
    "www.ourvisibleuniverse.in",
    "www.ourvisibleuniverse.com",
  ]) {
    const response = primaryDomainRedirect(
      new Request(`https://${host}/learn?next=%2Funiverse&x=1`),
      live,
    )!;
    assert.equal(response.status, 308);
    assert.equal(
      response.headers.get("location"),
      "https://ourvisibleuniverse.com/learn?next=%2Funiverse&x=1",
    );
    assert.equal(response.headers.get("cache-control"), "no-store");
  }
});
test("callbacks, authenticated machine requests and prior-origin password recovery keep their origin", () => {
  for (const pathname of [
    "/auth?code=old",
    "/auth-reset?code=old",
    "/api/public/payments/razorpay?mode=live",
    "/mcp",
    "/.well-known/oauth-protected-resource",
    "/_server/function",
    "/assets/app.js",
  ]) {
    assert.equal(
      primaryDomainRedirect(new Request(`https://ourvisibleuniverse.in${pathname}`), live),
      null,
    );
  }
  assert.equal(
    primaryDomainRedirect(
      new Request("https://ourvisibleuniverse.in/pricing", { method: "POST" }),
      live,
    ),
    null,
  );
});
test("redirect activates only for the explicit production origin and never trusts forwarded hosts", () => {
  const request = new Request("https://ourvisibleuniverse.in/");
  for (const env of [
    undefined,
    {},
    { ...live, OVU_DEPLOYMENT_STAGE: "staging" },
    { ...live, PUBLIC_APP_ORIGIN: "https://ourvisibleuniverse.in" },
  ]) {
    assert.equal(primaryDomainRedirect(request, env), null);
  }
  for (const origin of [
    "https://ourvisibleuniverse.com",
    "https://attacker.invalid",
    "http://127.0.0.1:31751",
    "https://ovu-supabase-staging.mukul-srivastava-025.workers.dev",
  ]) {
    assert.equal(
      primaryDomainRedirect(
        new Request(origin, { headers: { "X-Forwarded-Host": "ourvisibleuniverse.in" } }),
        live,
      ),
      null,
    );
  }
});
