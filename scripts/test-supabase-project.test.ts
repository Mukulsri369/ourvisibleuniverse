import assert from "node:assert/strict";
import { test } from "node:test";

const target = "https://pdvwkdggyyrfkoqrpbji.supabase.co";
test("OVU target project is reachable with separate public/server keys and its existing schema", async () => {
  assert.equal(process.env.SUPABASE_URL, target, "Only the user's new OVU project may be inspected");
  const publicKey = process.env.SUPABASE_PUBLISHABLE_KEY ?? "";
  const serverKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  assert.ok(publicKey.startsWith("sb_publishable_"), "Public key configuration is required");
  assert.ok(serverKey.startsWith("sb_secret_"), "Server key configuration is required");
  assert.ok(publicKey !== serverKey, "Server and browser credentials must remain separate");
  assert.equal(process.env.VITE_SUPABASE_PUBLISHABLE_KEY, publicKey);
  const schemaResponse = await fetch(target + "/rest/v1/", {
    headers: { apikey: serverKey, accept: "application/openapi+json" },
    signal: AbortSignal.timeout(15_000),
  });
  assert.equal(schemaResponse.status, 200, "Read-only schema connection failed");
  const schema = await schemaResponse.json() as { definitions: Record<string, unknown>; paths: Record<string, unknown> };
  for (const table of ["access_passes", "student_profiles", "astronomical_objects", "academy_assessment_attempts", "academy_lesson_progress", "academy_module_progress", "academy_certificates", "academy_verified_completions"])
    assert.ok(schema.definitions?.[table], "Missing expected table: " + table);
  assert.ok(schema.paths?.["/rpc/apply_access_purchase"], "Payment-access RPC must exist; this test never invokes it");
  const settings = await fetch(target + "/auth/v1/settings", {
    headers: { apikey: publicKey }, signal: AbortSignal.timeout(15_000),
  });
  assert.equal(settings.status, 200, "Public authentication connection failed");
  const auth = await settings.json() as { external?: { email?: boolean; google?: boolean } };
  assert.equal(auth.external?.email, true, "Email authentication is disabled in the target project");
  assert.equal(auth.external?.google, true, "Approved Google sign-in must remain enabled");
  console.log("Verified read-only schema access and public authentication settings; Google OAuth configured: " + Boolean(auth.external?.google));
});

test("approved administrator and scoped-summary schema is present and denies anonymous execution", async () => {
  assert.equal(process.env.SUPABASE_URL, target);
  const response = await fetch(target + "/rest/v1/", {
    headers: { apikey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "", accept: "application/openapi+json" },
    signal: AbortSignal.timeout(15_000),
  });
  assert.equal(response.status, 200);
  const schema = await response.json() as { definitions: Record<string, unknown> };
  assert.ok(schema.definitions?.access_admin_audit, "Approved audit schema must be installed");
  // Both RPCs are read-only; no grant/payment/certificate RPC is ever invoked here.
  for (const name of ["is_subscription_admin", "admin_list_subscribers", "get_my_access_summary"]) {
    const anonymous = await fetch(target + "/rest/v1/rpc/" + name, {
      method: "POST",
      headers: { apikey: process.env.SUPABASE_PUBLISHABLE_KEY ?? "", "Content-Type": "application/json" },
      body: "{}", signal: AbortSignal.timeout(15_000),
    });
    assert.ok([401, 403].includes(anonymous.status), `Anonymous execution must be denied: ${name}`);
  }
});

test("durable assessment schema is installed without exposing question snapshots to anonymous callers", async () => {
  assert.equal(process.env.SUPABASE_URL, target);
  const response = await fetch(target + "/rest/v1/", {
    headers: { apikey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "", accept: "application/openapi+json" },
    signal: AbortSignal.timeout(15_000),
  });
  assert.equal(response.status, 200);
  const schema = await response.json() as { definitions: Record<string, { properties: Record<string, unknown> }> };
  assert.ok(schema.definitions.academy_assessment_sessions);
  for (const column of ["mode", "session_id", "learning_level", "course_version"]) {
    assert.ok(schema.definitions.academy_assessment_attempts.properties[column], `Missing assessment provenance: ${column}`);
  }
  const denied = await fetch(target + "/rest/v1/academy_assessment_sessions?select=id&limit=0", {
    headers: { apikey: process.env.SUPABASE_PUBLISHABLE_KEY ?? "" }, signal: AbortSignal.timeout(15_000),
  });
  assert.ok([401, 403].includes(denied.status), "Canonical question snapshots must be private");
});

test("approved OAuth server publishes compatible discovery and signing metadata", async () => {
  assert.equal(process.env.SUPABASE_URL, target, "Only the new OVU project may be inspected");
  const headers = { apikey: process.env.SUPABASE_PUBLISHABLE_KEY ?? "" };
  const response = await fetch(target + "/.well-known/oauth-authorization-server/auth/v1", { headers, signal: AbortSignal.timeout(15_000) });
  assert.equal(response.status, 200, "Approved OAuth server is not enabled");
  const metadata = await response.json() as {
    issuer: string; authorization_endpoint: string; token_endpoint: string; jwks_uri: string; code_challenge_methods_supported?: string[];
  };
  assert.equal(metadata.issuer, target + "/auth/v1");
  assert.ok(metadata.code_challenge_methods_supported?.includes("S256"), "PKCE S256 must be supported");
  for (const endpoint of [metadata.authorization_endpoint, metadata.token_endpoint, metadata.jwks_uri]) {
    assert.equal(new URL(endpoint).origin, target, "OAuth endpoints must belong to the approved project");
  }
  const jwksResponse = await fetch(metadata.jwks_uri, { headers, signal: AbortSignal.timeout(15_000) });
  assert.equal(jwksResponse.status, 200);
  const jwks = await jwksResponse.json() as { keys: { alg?: string }[] };
  assert.ok(jwks.keys.some(key => key.alg === "ES256" || key.alg === "RS256"), "MCP requires a compatible asymmetric signing key");
});
