// Explicitly local interactive QA. Register the public client and obtain consent first.
// Tokens/verifiers stay in memory. This script neither registers clients nor writes data.
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { Client, StreamableHTTPClientTransport, UnauthorizedError } from "@modelcontextprotocol/client";

const base = "http://127.0.0.1:31751", callbackOrigin = "http://127.0.0.1:31752";
const project = "https://pdvwkdggyyrfkoqrpbji.supabase.co", issuer = project + "/auth/v1";
const clientId = process.argv[process.argv.indexOf("--client-id") + 1];
if (!process.argv.includes("--client-id") || !/^[\w.-]{8,128}$/.test(clientId ?? "")) throw new Error("Supply the approved public client ID using --client-id");
const publicKey = process.env.SUPABASE_PUBLISHABLE_KEY;
if (!publicKey?.startsWith("sb_publishable_")) throw new Error("The approved project's publishable key is required");
let tokenSet, verifier, discovery, authorizationUrl, consumed = false;
let status = { phase: "starting", clientRegisteredByThisScript: false, grantsOrPaymentsPerformed: false };
const state = randomBytes(32).toString("base64url");
const assertIssuer = ctx => { if (ctx?.issuer && ctx.issuer !== issuer) throw new Error("Unexpected issuer"); };
const provider = {
  redirectUrl: callbackOrigin + "/callback",
  clientMetadata: { client_name: "OVU Local MCP QA", redirect_uris: [callbackOrigin + "/callback"], token_endpoint_auth_method: "none", grant_types: ["authorization_code", "refresh_token"], response_types: ["code"], scope: "openid" },
  state: () => state,
  clientInformation(ctx) { assertIssuer(ctx); return { client_id: clientId, token_endpoint_auth_method: "none", issuer }; },
  tokens(ctx) { assertIssuer(ctx); return tokenSet; },
  saveTokens(value, ctx) { assertIssuer(ctx); if (value.issuer !== issuer) throw new Error("Unexpected token issuer stamp"); tokenSet = value; },
  saveCodeVerifier(value) { verifier = value; },
  saveDiscoveryState(value) {
    if (value.authorizationServerUrl !== issuer || value.authorizationServerMetadata?.issuer !== issuer) throw new Error("Unexpected discovery issuer");
    discovery = value;
  },
  discoveryState() { return discovery; },
  codeVerifier() { if (!verifier) throw new Error("Missing PKCE verifier"); return verifier; },
  redirectToAuthorization(url) { if (url.origin !== project || url.pathname !== "/auth/v1/oauth/authorize") throw new Error("Unexpected authorization destination"); authorizationUrl = url.href; },
  invalidateCredentials(scope) { if (["all", "tokens"].includes(scope)) tokenSet = undefined; if (["all", "verifier"].includes(scope)) verifier = undefined; if (["all", "discovery"].includes(scope)) discovery = undefined; },
};
const safeFetch = (input, init) => {
  const url = new URL(typeof input === "string" || input instanceof URL ? input : input.url);
  if (![base, project].includes(url.origin)) throw new Error("Unexpected QA network destination");
  return fetch(input, { ...init, redirect: "error" });
};
const newClient = () => new Client({ name: "ovu-local-mcp-qa", version: "1.0.0" });
const newTransport = () => new StreamableHTTPClientTransport(new URL(base + "/mcp"), { authProvider: provider, fetch: safeFetch });
let client = newClient(), transport = newTransport();

async function checkBoundaries() {
  const headers = { apikey: publicKey, Authorization: `Bearer ${tokenSet.access_token}` };
  for (const table of ["student_profiles", "access_passes"]) {
    const response = await safeFetch(project + `/rest/v1/${table}?select=*&limit=1`, { headers });
    assert.equal(response.status, 200); assert.deepEqual(await response.json(), [], "OAuth tokens cannot read private raw tables");
  }
  const summary = await safeFetch(project + "/rest/v1/rpc/get_my_access_summary", { method: "POST", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify({ p_environment: "sandbox" }) });
  assert.equal(summary.status, 200);
  for (const row of await summary.json()) assert.deepEqual(Object.keys(row).sort(), ["access_days", "expires_at", "starts_at", "status"]);
  const admin = await safeFetch(project + "/rest/v1/rpc/admin_list_subscribers", { method: "POST", headers: { ...headers, "Content-Type": "application/json" }, body: "{}" });
  assert.equal(admin.status, 403, "Even an administrator's delegated OAuth token must not be an admin API token");
  let functionId;
  const assets = resolve(import.meta.dirname, "../dist/server/assets");
  for (const name of (await readdir(assets)).filter(name => /^server-.*\.js$/.test(name))) {
    const code = await readFile(resolve(assets, name), "utf8");
    functionId = code.match(/"([a-f0-9]{64})":\s*\{\s*functionName:\s*"getSubscriptionAdminStatus_createServerFn_handler"/)?.[1];
    if (functionId) break;
  }
  assert.ok(functionId, "The built website function must be available for the boundary test");
  const website = await safeFetch(base + "/_serverFn/" + functionId, { headers: { Authorization: headers.Authorization, "x-tsr-serverFn": "true", Accept: "application/json" } });
  assert.equal(website.status, 403, "Delegated OAuth tokens must not invoke website server functions");
}

const server = createServer(async (request, response) => {
  response.setHeader("Cache-Control", "no-store"); response.setHeader("Referrer-Policy", "no-referrer");
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  if (request.headers.host !== "127.0.0.1:31752" || request.method !== "GET") { response.writeHead(403).end(); return; }
  const url = new URL(request.url, callbackOrigin);
  if (url.origin !== callbackOrigin) { response.writeHead(403).end(); return; }
  if (url.pathname === "/start") {
    if (!authorizationUrl || consumed) { response.writeHead(409).end('{"error":"Start a fresh QA session"}'); return; }
    response.writeHead(302, { Location: authorizationUrl }).end(); return;
  }
  if (url.pathname === "/callback") {
    const supplied = url.searchParams.get("state") ?? "";
    const suppliedState = Buffer.from(supplied), expectedState = Buffer.from(state);
    if (consumed || suppliedState.length !== expectedState.length || !timingSafeEqual(suppliedState, expectedState)) { response.writeHead(400).end('{"error":"Invalid callback state"}'); return; }
    consumed = true;
    try {
      const code = url.searchParams.get("code");
      if (url.searchParams.has("error") || !code) throw new Error("Authorization denied");
      status.step = "token-exchange";
      await transport.finishAuth(url.searchParams);
      status.step = "mcp-connect";
      // The initial unauthorized connection already started its transport. Reconnect
      // using a fresh protocol instance and the same memory-only authorized provider.
      await client.close();
      client = newClient(); transport = newTransport();
      await client.connect(transport);
      status.step = "list-tools";
      const tools = await client.listTools();
      assert.deepEqual(tools.tools.map(tool => tool.name).sort(), ["get_catalog_entry", "get_my_access", "list_access_plans", "search_catalog"]);
      for (const [name, args] of [["search_catalog", { query: "Sirius", kind: "star" }], ["get_catalog_entry", { name: "Sirius" }], ["list_access_plans", {}], ["get_my_access", {}]]) {
        status.step = name;
        const result = await client.callTool({ name, arguments: args }); assert.ok(!result.isError, `Tool failed: ${name}`);
      }
      status.step = "authorization-boundaries";
      await checkBoundaries();
      status = { ...status, phase: "passed", toolsVerified: 4, privateTablesDenied: true, adminApiDenied: true, websiteApiDenied: true, tokenPersistence: "memory-only" };
      console.log("PASS: actual OAuth PKCE exchange, all four MCP tools, private-table/admin/website boundaries");
    } catch (error) {
      const safeReasons = ["Unexpected issuer", "Unexpected token issuer stamp", "Unexpected discovery issuer", "Missing PKCE verifier", "Unexpected authorization destination", "Unexpected QA network destination", "Authorization denied"];
      status = { ...status, phase: "failed", errorType: error?.name ?? "Error", reason: safeReasons.includes(error?.message) ? error.message : "Protocol or assertion failure; credential details withheld", ...(typeof error?.actual === "number" ? { actual: error.actual, expected: error.expected } : {}) };
      console.error("Local MCP OAuth QA failed; no tokens or callback details were logged.");
    }
    response.writeHead(303, { Location: "/status" }).end(); return;
  }
  if (url.pathname === "/status") { response.end(JSON.stringify(status)); return; }
  response.writeHead(404).end();
});
await new Promise((done, reject) => { server.once("error", reject); server.listen(31752, "127.0.0.1", done); });
try { await client.connect(transport); } catch (error) {
  if (!(error instanceof UnauthorizedError) || !authorizationUrl) { server.close(); throw new Error("OAuth discovery or pre-registered client setup failed"); }
}
status.phase = "awaiting-user-consent";
console.log("Local MCP OAuth QA ready: http://127.0.0.1:31752/start");
async function stop() { tokenSet = undefined; verifier = undefined; discovery = undefined; await client.close().catch(() => {}); server.close(() => process.exit(0)); }
process.once("SIGINT", stop); process.once("SIGTERM", stop);
