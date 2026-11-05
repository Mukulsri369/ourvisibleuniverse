import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import { writeFile } from "node:fs/promises";
import { accountImportPayload } from "./customer-import.mjs";
if (!process.argv.includes("--disposable-development-fixture"))
  throw new Error("Disposable fixture flag required");
const project = "https://pdvwkdggyyrfkoqrpbji.supabase.co";
assert.equal(process.env.SUPABASE_URL, project);
assert.ok(process.env.SUPABASE_SERVICE_ROLE_KEY?.startsWith("sb_secret_"));
const marker = crypto.randomUUID(),
  ids = [],
  password = crypto.randomUUID() + "aA!9";
let preceding,
  stage = "preflight";
const report = {
  completed: false,
  fixturesRemoved: false,
  existingIdentitiesPreserved: false,
  emailSent: false,
  providerPayments: false,
  checks: [],
};
async function api(path, method = "GET", body, publicOnly = false) {
  const response = await fetch(project + path, {
    method,
    headers: {
      apikey: process.env[publicOnly ? "SUPABASE_PUBLISHABLE_KEY" : "SUPABASE_SERVICE_ROLE_KEY"],
      "Content-Type": "application/json",
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    signal: AbortSignal.timeout(20000),
  });
  return { response, data: await response.json() };
}
try {
  const before = await api("/auth/v1/admin/users?per_page=1000");
  assert.equal(before.response.status, 200);
  preceding = before.data.users.map((user) => user.id).sort();
  assert.ok(preceding.length < 1000);
  const hash = await bcrypt.hash(password, 10);
  for (const confirmed of [true, false]) {
    stage = "original-id-and-password-hash-creation";
    const id = crypto.randomUUID();
    const source = {
      id,
      email: `ovu.hash.qa.${marker}.${confirmed}@example.test`,
      encrypted_password: hash,
      email_confirmed_at: confirmed ? new Date().toISOString() : null,
      created_at: new Date().toISOString(),
      raw_user_meta_data: '{"name":"Disposable import QA","role":"admin"}',
    };
    const payload = accountImportPayload(
      source,
      {
        action: "create-original-id",
        targetId: id,
        email: source.email,
        sourceEmailConfirmed: confirmed,
      },
      { runId: marker },
    );
    payload.app_metadata.ovu_import_hash_fixture = marker;
    const created = await api("/auth/v1/admin/users", "POST", payload);
    assert.equal(created.response.status, 200);
    ids.push(id);
    assert.equal(created.data.id, id);
    assert.equal(created.data.role, "authenticated");
    assert.equal(!!created.data.email_confirmed_at, confirmed);
    assert.equal(created.data.app_metadata.role, undefined);
    assert.equal(created.data.user_metadata.role, undefined);
    stage = "password-hash-login";
    const login = await api(
      "/auth/v1/token?grant_type=password",
      "POST",
      { email: source.email, password },
      true,
    );
    if (confirmed) {
      assert.equal(login.response.status, 200);
      assert.equal(login.data.user.id, id);
      assert.ok(login.data.access_token);
      report.checks.push("original-id-and-bcrypt-hash-preserve-login");
    } else {
      assert.ok(login.response.status >= 400);
      assert.equal(login.data.error_code ?? login.data.code, "email_not_confirmed");
      report.checks.push("unconfirmed-source-remains-unconfirmed-and-cannot-password-login");
    }
  }
  report.checks.push("source-profile-admin-claims-not-imported");
  report.completed = true;
} catch {
  console.error(`Auth import provider QA failed at ${stage}; no credentials logged.`);
  process.exitCode = 1;
} finally {
  try {
    for (const id of ids) {
      const current = await api(`/auth/v1/admin/users/${id}`);
      assert.equal(current.data.app_metadata?.ovu_import_hash_fixture, marker);
      const removed = await api(`/auth/v1/admin/users/${id}`, "DELETE");
      assert.equal(removed.response.status, 200);
    }
    const after = await api("/auth/v1/admin/users?per_page=1000");
    assert.deepEqual(after.data.users.map((user) => user.id).sort(), preceding);
    report.fixturesRemoved = true;
    report.existingIdentitiesPreserved = true;
  } catch {
    console.error("Marked import fixture cleanup needs inspection; no private values logged.");
    process.exitCode = 1;
  }
  await writeFile(
    new URL("../../../evidence/ovu-auth-import-provider-results.json", import.meta.url),
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report));
}
