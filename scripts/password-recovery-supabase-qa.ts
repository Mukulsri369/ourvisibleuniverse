// Uses only a marked disposable identity. No email is sent and no existing user is edited.
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
import { writeFile } from "node:fs/promises";
import { updateRecoveryPassword } from "../src/lib/password-recovery";
if (!process.argv.includes("--disposable-development-fixture"))
  throw new Error("Disposable fixture flag required");
const url = process.env.SUPABASE_URL!,
  publicKey = process.env.SUPABASE_PUBLISHABLE_KEY!,
  secret = process.env.SUPABASE_SERVICE_ROLE_KEY!;
assert.equal(url, "https://pdvwkdggyyrfkoqrpbji.supabase.co");
assert.ok(publicKey?.startsWith("sb_publishable_") && secret?.startsWith("sb_secret_"));
const marker = crypto.randomUUID(),
  email = `ovu.recovery.qa.${marker}@example.test`;
const beforePassword = crypto.randomUUID() + "aA!9",
  afterPassword = crypto.randomUUID() + "bB!8";
const report = {
  completed: false,
  fixtureRemoved: false,
  existingIdentitiesPreserved: false,
  emailSent: false,
  paymentPerformed: false,
  checks: [] as string[],
};
let id: string | undefined,
  precedingIds: string[] = [],
  stage = "preflight";
async function admin(path: string, method = "GET", body?: unknown) {
  const response = await fetch(url + "/auth/v1/admin/" + path, {
    method,
    headers: {
      apikey: secret,
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  assert.equal(response.status, 200, `Fixture operation failed during ${stage}`);
  return response.json();
}
function client() {
  return createClient(url, publicKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (headers.get("Authorization") === `Bearer ${publicKey}`) headers.delete("Authorization");
        headers.set("apikey", publicKey);
        return fetch(input, { ...init, headers, signal: AbortSignal.timeout(15000) });
      },
    },
  });
}
try {
  precedingIds = (await admin("users?page=1&per_page=1000")).users
    .map((u: { id: string }) => u.id)
    .sort();
  stage = "create-fixture";
  const created = await admin("users", "POST", {
    email,
    password: beforePassword,
    email_confirm: true,
    app_metadata: { ovu_recovery_fixture: marker },
  });
  id = created.id;
  assert.ok(id && !precedingIds.includes(id));
  stage = "recovery-link-without-email";
  const link = await admin("generate_link", "POST", { type: "recovery", email });
  const token = link.hashed_token ?? link.properties?.hashed_token;
  assert.ok(token);
  const source = client(),
    isolated = client();
  const verified = await source.auth.verifyOtp({ type: "recovery", token_hash: token });
  assert.equal(verified.error, null);
  assert.equal(verified.data.user?.id, id);
  report.checks.push("provider-recovery-token-verification");
  stage = "identity-bound-password-update";
  await updateRecoveryPassword(source.auth, isolated.auth, id!, afterPassword);
  report.checks.push("actual-application-password-update-helper");
  stage = "password-login-validation";
  const fresh = client();
  const signed = await fresh.auth.signInWithPassword({ email, password: afterPassword });
  assert.equal(signed.error, null);
  assert.equal(signed.data.user?.id, id);
  const old = await client().auth.signInWithPassword({ email, password: beforePassword });
  assert.ok(old.error);
  report.checks.push("new-password-valid-old-password-rejected");
  const replay = await client().auth.verifyOtp({ type: "recovery", token_hash: token });
  assert.ok(replay.error);
  report.checks.push("recovery-token-replay-denied");
  await assert.rejects(updateRecoveryPassword(client().auth, client().auth, id!, beforePassword));
  report.checks.push("anonymous-password-update-denied");
  report.completed = true;
} catch {
  console.error(`Password recovery QA failed at ${stage}; no credentials logged.`);
  process.exitCode = 1;
} finally {
  try {
    if (id) {
      const current = await admin(`users/${id}`);
      assert.equal(current.app_metadata?.ovu_recovery_fixture, marker);
      assert.equal(current.email, email);
      await admin(`users/${id}`, "DELETE");
      report.fixtureRemoved = true;
    }
    const remaining = (await admin("users?page=1&per_page=1000")).users
      .map((u: { id: string }) => u.id)
      .sort();
    assert.deepEqual(remaining, precedingIds);
    report.existingIdentitiesPreserved = true;
  } catch {
    console.error("Recovery fixture cleanup requires inspection; no credentials logged.");
    process.exitCode = 1;
  }
  await writeFile(
    new URL("../../../evidence/ovu-password-recovery-supabase-results.json", import.meta.url),
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report));
}
