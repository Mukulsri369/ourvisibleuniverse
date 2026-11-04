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
  console.log("Verified read-only schema access and public authentication settings; Google OAuth configured: " + Boolean(auth.external?.google));
});
