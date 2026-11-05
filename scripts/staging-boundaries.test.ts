import assert from "node:assert/strict";
import { test } from "node:test";
import { stagingConfiguration } from "./prepare-staging-config.mjs";
import { deploymentHeaders } from "../src/lib/deployment-headers";
const built = { main: "index.js", assets: { directory: "../client" }, workers_dev: false,
  vars: { SUPABASE_URL: "https://pdvwkdggyyrfkoqrpbji.supabase.co", RAZORPAY_LIVE_KEY_SECRET: "synthetic-forbidden-value" } };
const input = { accountId: "1".repeat(32), origin: "https://ovu-supabase-staging.synthetic-qa.workers.dev", publishableKey: "sb_publishable_synthetic_qa", plan: "free" };
test("staging config preserves generated paths but includes only explicit public/test bindings", () => {
  const config = stagingConfiguration(built, input);
  assert.equal(config.main, "index.js"); assert.deepEqual(config.assets, built.assets);
  assert.equal(config.workers_dev, true); assert.equal(config.preview_urls, false);
  assert.equal(config.name, "ovu-supabase-staging"); assert.equal(config.topLevelName, config.name);
  assert.deepEqual(config.routes, []); assert.deepEqual(config.triggers, {});
  assert.equal(config.vars.RAZORPAY_MODE, "test"); assert.equal(config.vars.RAZORPAY_LIVE_KEY_SECRET, undefined);
  assert.equal(config.vars.SUPABASE_SERVICE_ROLE_KEY, undefined); assert.equal(config.limits, undefined);
  assert.equal(stagingConfiguration(built, { ...input, plan: "paid" }).limits.cpu_ms, 1000);
  assert.equal(built.workers_dev, false);
});
test("staging preparation rejects production origins, wrong accounts/projects, inherited jobs and private keys", () => {
  for (const origin of ["https://ourvisibleuniverse.in", "http://ovu-supabase-staging.synthetic-qa.workers.dev", input.origin + "/wrong", input.origin + "?token=bad", "https://other-worker.synthetic-qa.workers.dev"])
    assert.throws(() => stagingConfiguration(built, { ...input, origin }));
  assert.throws(() => stagingConfiguration(built, { ...input, accountId: "unknown" }));
  assert.throws(() => stagingConfiguration(built, { ...input, publishableKey: "sb_secret_forbidden" }));
  assert.throws(() => stagingConfiguration(built, { ...input, plan: "upgrade" }));
  assert.throws(() => stagingConfiguration({ ...built, vars: { SUPABASE_URL: "https://wrong.supabase.co" } }, input));
  assert.throws(() => stagingConfiguration({ ...built, routes: ["ourvisibleuniverse.in/*"] }, input));
  assert.throws(() => stagingConfiguration({ ...built, triggers: { crons: ["* * * * *"] } }, input));
});
test("production and local responses retain their exact original headers and stream", () => {
  const response = new Response("original", { headers: { "Cache-Control": "private", "Set-Cookie": "synthetic=qa" } });
  assert.equal(deploymentHeaders(response, {}), response);
  assert.equal(deploymentHeaders(response, { OVU_DEPLOYMENT_STAGE: "production" }), response);
  assert.equal(response.headers.get("X-Robots-Tag"), null);
});
test("staging HTML, redirects and errors deny indexing while retaining status, cookies and content", async () => {
  for (const status of [200, 302, 500]) {
    const response = deploymentHeaders(new Response("synthetic-page", { status, headers: { "Content-Type": "text/html", "Set-Cookie": "synthetic=qa", Location: "/auth" } }), { OVU_DEPLOYMENT_STAGE: "staging" });
    assert.equal(response.status, status); assert.equal(response.headers.get("X-Robots-Tag"), "noindex, nofollow, noarchive");
    assert.equal(response.headers.get("Set-Cookie"), "synthetic=qa"); assert.equal(response.headers.get("Location"), "/auth");
    assert.equal(await response.text(), "synthetic-page");
  }
});
