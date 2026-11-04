import assert from "node:assert/strict";
import { test } from "node:test";
import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT } from "jose";
import { verifyMcpToken, resourceOrigin } from "../src/lib/mcp/auth.server";
import { handleMcpRequest, protectedResourceMetadata } from "../src/lib/mcp/handler.server";
import getMyAccess from "../src/lib/mcp/tools/get-my-access";
import { supabaseForUser } from "../src/lib/mcp/supabase";

const issuer = "https://pdvwkdggyyrfkoqrpbji.supabase.co/auth/v1";
const base = "http://127.0.0.1:31751";
const pair = await generateKeyPair("ES256");
const jwk = await exportJWK(pair.publicKey);
const keys = createLocalJWKSet({ keys: [{ ...jwk, kid: "test", alg: "ES256" }] });
async function token(overrides: Record<string, unknown> = {}) {
  return new SignJWT({ role: "authenticated", client_id: "test-oauth-client", ...overrides })
    .setProtectedHeader({ alg: "ES256", kid: "test" }).setIssuer(issuer).setAudience("authenticated")
    .setSubject("user-alice").setIssuedAt().setExpirationTime("5m").sign(pair.privateKey);
}
function post(body: unknown, bearer = "test-token") {
  return new Request(`${base}/mcp`, { method: "POST", headers: {
    "Content-Type": "application/json", Accept: "application/json, text/event-stream",
    "MCP-Protocol-Version": "2025-11-25", Authorization: `Bearer ${bearer}`,
  }, body: JSON.stringify(body) });
}
async function result(response: Response) {
  assert.equal(response.status, 200);
  const text = await response.text();
  return JSON.parse(text.startsWith("event:") ? text.split("\n").find(line => line.startsWith("data:"))!.slice(5) : text);
}
const testVerifier = (value: string) => verifyMcpToken(value, issuer, keys);

test("signed OAuth user tokens validate; browser/service-role/wrong-client tokens do not", async () => {
  assert.equal((await testVerifier(await token())).userId, "user-alice");
  for (const claims of [{ client_id: undefined }, { client_id: "" }, { role: "service_role" }, { role: "anon" }]) {
    await assert.rejects(testVerifier(await token(claims)));
  }
  for (const [iss, aud, expiry] of [["https://attacker.invalid", "authenticated", "5m"], [issuer, "other-api", "5m"], [issuer, "authenticated", "-1m"]]) {
    const invalid = await new SignJWT({ client_id: "test", role: "authenticated" }).setProtectedHeader({ alg: "ES256", kid: "test" })
      .setSubject("user-alice").setIssuer(iss).setAudience(aud).setIssuedAt().setExpirationTime(expiry).sign(pair.privateKey);
    await assert.rejects(testVerifier(invalid));
  }
  await assert.rejects(testVerifier("forged.token.value"));
});

test("metadata ignores spoofed forwarding headers and rejects unrecognized origins", async () => {
  process.env.SUPABASE_URL = issuer.replace(/\/auth\/v1$/, "");
  const response = protectedResourceMetadata(new Request(`${base}/.well-known/oauth-protected-resource`, { headers: { "X-Forwarded-Host": "attacker.invalid", "X-Forwarded-Proto": "https" } }));
  assert.equal((await response.json()).resource, `${base}/mcp`);
  assert.throws(() => resourceOrigin(new Request("https://attacker.invalid/mcp")));
  assert.throws(() => resourceOrigin(new Request(`${base}/mcp`, { headers: { Origin: "https://attacker.invalid" } })));
});

test("all MCP tools require a verified OAuth token", async () => {
  const unsigned = await handleMcpRequest(new Request(`${base}/mcp`));
  assert.equal(unsigned.status, 401);
  assert.match(unsigned.headers.get("www-authenticate")!, /oauth-protected-resource/);
  assert.equal((await handleMcpRequest(post({ jsonrpc: "2.0", id: 1, method: "tools/list" }, "invalid"), testVerifier)).status, 401);
});

test("official HTTP SDK retains all four tools and scientific catalogue results", async () => {
  const bearer = await token();
  const list = await result(await handleMcpRequest(post({ jsonrpc: "2.0", id: 1, method: "tools/list" }, bearer), testVerifier));
  assert.deepEqual(list.result.tools.map((tool: { name: string }) => tool.name).sort(), ["get_catalog_entry", "get_my_access", "list_access_plans", "search_catalog"]);
  for (const [name, args, expected] of [
    ["search_catalog", { query: "Sirius", kind: "star" }, "Sirius"],
    ["get_catalog_entry", { name: "Sirius" }, "Sirius"],
    ["list_access_plans", {}, "One-time payment"],
  ] as const) {
    const call = await result(await handleMcpRequest(post({ jsonrpc: "2.0", id: 2, method: "tools/call", params: { name, arguments: args } }, bearer), testVerifier));
    assert.ok(!call.error && !call.result.isError, JSON.stringify(call));
    assert.match(JSON.stringify(call.result), new RegExp(expected));
  }
  const invalid = await result(await handleMcpRequest(post({ jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "search_catalog", arguments: { query: "Sirius", limit: 1000 } } }, bearer), testVerifier));
  assert.ok(invalid.error || invalid.result.isError, "SDK must reject invalid tool inputs");
});

test("private access uses each caller's JWT and a scoped summary RPC; future passes are inactive", async () => {
  const previousFetch = globalThis.fetch;
  process.env.SUPABASE_URL = issuer.replace(/\/auth\/v1$/, "");
  process.env.SUPABASE_PUBLISHABLE_KEY = "sb_publishable_synthetic_test_only";
  const seen: Array<{ url: string; bearer: string | null; key: string | null; body: unknown }> = [];
  globalThis.fetch = async (input, init) => {
    const headers = new Headers(init?.headers);
    seen.push({ url: String(input), bearer: headers.get("authorization"), key: headers.get("apikey"), body: JSON.parse(String(init?.body ?? "{}")) });
    return new Response(JSON.stringify([{ access_days: 30, starts_at: "2099-01-01T00:00:00Z", expires_at: "2099-02-01T00:00:00Z", status: "active" }]), { headers: { "Content-Type": "application/json" } });
  };
  try {
    for (const user of ["alice", "bob"]) {
      const response = await getMyAccess.handler({}, { getToken: () => `jwt-${user}`, getUserId: () => user, isAuthenticated: () => true });
      assert.equal(response.structuredContent?.active, false);
    }
    assert.equal(seen.length, 2);
    for (let i = 0; i < seen.length; i++) {
      const user = ["alice", "bob"][i];
      assert.equal(new URL(seen[i].url).pathname, "/rest/v1/rpc/get_my_access_summary");
      assert.deepEqual(seen[i].body, { p_environment: process.env.RAZORPAY_MODE === "live" ? "live" : "sandbox" }, "No caller-supplied user ID or payment identifiers");
      assert.equal(seen[i].bearer, `Bearer jwt-${user}`);
      assert.equal(seen[i].key, "sb_publishable_synthetic_test_only");
    }
  } finally { globalThis.fetch = previousFetch; }
});

test("MCP never accepts an admin key through legacy public-key configuration", () => {
  const names = ["SUPABASE_PUBLISHABLE_KEY", "VITE_SUPABASE_PUBLISHABLE_KEY", "SUPABASE_PUBLISHABLE_KEYS", "SUPABASE_ANON_KEY", "VITE_SUPABASE_ANON_KEY"];
  const previous = names.map(name => process.env[name]);
  try {
    for (const name of names) delete process.env[name];
    process.env.SUPABASE_ANON_KEY = `header.${Buffer.from(JSON.stringify({ role: "service_role" })).toString("base64url")}.signature`;
    assert.throws(() => supabaseForUser({ getToken: () => "verified-user-jwt", getUserId: () => "alice", isAuthenticated: () => true }), /anon key/);
  } finally {
    names.forEach((name, index) => { if (previous[index] === undefined) delete process.env[name]; else process.env[name] = previous[index]; });
  }
});
