import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
const target = "https://pdvwkdggyyrfkoqrpbji.supabase.co",
  origin = "https://ovu-supabase-staging.mukul-srivastava-025.workers.dev";
assert.equal(process.env.SUPABASE_URL, target);
const results = [];
for (const [table, column] of [
  ["access_passes", "id"],
  ["student_profiles", "user_id"],
]) {
  const response = await fetch(`${target}/rest/v1/${table}?select=${column}&limit=1`, {
    headers: { apikey: process.env.SUPABASE_PUBLISHABLE_KEY },
    signal: AbortSignal.timeout(20000),
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), []);
  results.push({ check: `anonymous-${table}-empty`, passed: true });
}
const authAdmin = await fetch(target + "/auth/v1/admin/users?per_page=1", {
  headers: { apikey: process.env.SUPABASE_PUBLISHABLE_KEY },
  signal: AbortSignal.timeout(20000),
});
assert.ok([401, 403].includes(authAdmin.status));
await authAdmin.body.cancel();
results.push({ check: "anonymous-auth-administration-denied", passed: true });
for (const path of [
  "/",
  "/auth",
  "/learn",
  "/admin/subscribers",
  "/verify-certificate",
  "/universe",
]) {
  const response = await fetch(origin + path, { signal: AbortSignal.timeout(30000) });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("X-Robots-Tag"), "noindex, nofollow, noarchive");
  const html = await response.text();
  assert.ok(!/Error code: 110[12]/.test(html));
  results.push({ check: `hosted-${path}-shell-and-noindex`, passed: true });
}
await writeFile(
  new URL("../../../evidence/ovu-customer-postflight-results.json", import.meta.url),
  JSON.stringify(
    {
      passed: true,
      results,
      note: "HTML shells are not proof of authenticated paid-scene rendering",
    },
    null,
    2,
  ),
);
console.log(JSON.stringify({ passed: true, checks: results.length }));
