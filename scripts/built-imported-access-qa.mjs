// Disposable identities/marked synthetic rows only. No provider payment or customer change.
import assert from "node:assert/strict";
import { createServer } from "node:net";
import { once } from "node:events";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { tmpdir } from "node:os";
import { unstable_dev } from "wrangler";
import { runWithStartContext } from "@tanstack/start-storage-context";
if (!process.argv.includes("--disposable-development-fixture"))
  throw new Error("Disposable fixture flag required");
const project = "https://pdvwkdggyyrfkoqrpbji.supabase.co";
assert.equal(process.env.SUPABASE_URL, project);
const secret = process.env.SUPABASE_SERVICE_ROLE_KEY,
  publicKey = process.env.SUPABASE_PUBLISHABLE_KEY;
assert.ok(secret?.startsWith("sb_secret_") && publicKey?.startsWith("sb_publishable_"));
const marker = crypto.randomUUID(),
  users = [],
  tokens = [],
  reference = `qa-historical-read-${marker}`;
const report = {
  completed: false,
  providerPayments: false,
  customerRowsChanged: false,
  fixturesRemoved: false,
  checks: [],
};
let worker,
  stage = "preflight",
  beforeUsers,
  beforePasses;
async function api(path, method = "GET", body, token) {
  const response = await fetch(project + path, {
    method,
    headers: {
      apikey: token ? publicKey : secret,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    signal: AbortSignal.timeout(20000),
  });
  assert.ok(response.ok, `Fixture API failure at ${stage}`);
  return response.status === 204 ? undefined : response.json();
}
const root = resolve(import.meta.dirname, ".."),
  config = resolve(root, "dist/server/wrangler.json");
const built = JSON.parse(await readFile(config, "utf8"));
let manifest = "";
for (const file of await readdir(resolve(root, "dist/server/assets")))
  if (/^server-.*\.js$/.test(file))
    manifest += await readFile(resolve(root, "dist/server/assets", file), "utf8");
const functionId = manifest.match(
  /"([a-f0-9]{64})":\s*\{\s*functionName:\s*"getMyAccess_createServerFn_handler"/,
)?.[1];
assert.ok(functionId);
const { serverFnFetcher } = await import(
  new URL("./serverFnFetcher.js", import.meta.resolve("@tanstack/start-client-core/client-rpc"))
);
const probe = createServer();
probe.listen(0, "127.0.0.1");
await once(probe, "listening");
const port = probe.address().port;
await new Promise((done) => probe.close(done));
const origin = `http://127.0.0.1:${port}`;
async function start(override) {
  return unstable_dev(resolve(dirname(config), built.main), {
    config,
    local: true,
    bundle: false,
    ip: "127.0.0.1",
    port,
    vars: {
      SUPABASE_URL: project,
      SUPABASE_PUBLISHABLE_KEY: publicKey,
      RAZORPAY_MODE: "test",
      OVU_DEPLOYMENT_STAGE: "staging",
      PUBLIC_APP_ORIGIN: "https://ovu-supabase-staging.mukul-srivastava-025.workers.dev",
      ...(override ? { OVU_ACCESS_ENVIRONMENT: "live" } : {}),
    },
    persistTo: resolve(tmpdir(), "ovu-import-read-qa", marker),
    logLevel: "error",
    experimental: { disableExperimentalWarning: true, disableDevRegistry: true },
  });
}
async function readAccess(token) {
  const envelope = await runWithStartContext({ startOptions: { serializationAdapters: [] } }, () =>
    serverFnFetcher(
      `${origin}/_serverFn/${functionId}`,
      [{ method: "GET", headers: { Authorization: `Bearer ${token}` } }],
      (url, init) => fetch(url, { ...init, signal: AbortSignal.timeout(30000) }),
    ),
  );
  if (envelope?.error) throw envelope.error;
  return envelope?.result ?? envelope;
}
try {
  beforeUsers = (await api("/auth/v1/admin/users?per_page=1000")).users
    .map((user) => user.id)
    .sort();
  beforePasses = await api("/rest/v1/access_passes?select=*&order=id");
  assert.ok(
    beforeUsers.length < 1000 && beforePasses.length < 1000,
    "Expand pagination before fixture execution",
  );
  for (let index = 0; index < 2; index++) {
    stage = "create-marked-identity";
    const email = `ovu.import.qa.${marker}.${index}@example.test`;
    const user = await api("/auth/v1/admin/users", "POST", {
      email,
      email_confirm: true,
      app_metadata: { ovu_import_read_fixture: marker },
    });
    users.push(user.id);
    const link = await api("/auth/v1/admin/generate_link", "POST", { type: "magiclink", email });
    const session = await api("/auth/v1/verify", "POST", {
      type: "magiclink",
      token_hash: link.hashed_token ?? link.properties?.hashed_token,
    });
    assert.ok(session.access_token);
    tokens.push(session.access_token);
  }
  const [ownerToken, otherToken] = tokens;
  stage = "create-marked-synthetic-history";
  const starts = new Date(Date.now() - 1000).toISOString(),
    expires = new Date(Date.now() + 86400000).toISOString();
  await api("/rest/v1/access_passes", "POST", {
    user_id: users[0],
    payment_session_id: reference,
    price_id: "universe_30",
    access_days: 30,
    status: "active",
    environment: "live",
    starts_at: starts,
    expires_at: expires,
  });
  worker = await start(false);
  stage = "ordinary-test-isolation";
  const sandbox = await readAccess(ownerToken);
  assert.equal(sandbox.environment, "sandbox");
  assert.equal(sandbox.access, null);
  report.checks.push("default-test-mode-does-not-read-live-history");
  await worker.stop();
  worker = await start(true);
  stage = "approved-live-read-with-test-payments";
  const live = await readAccess(ownerToken);
  assert.equal(live.environment, "live");
  assert.equal(live.access.status, "active");
  assert.equal(Date.parse(live.access.expires_at), Date.parse(expires));
  report.checks.push("built-api-recognizes-original-live-period-without-payment-keys");
  const other = await readAccess(otherToken);
  assert.equal(other.environment, "live");
  assert.equal(other.access, null);
  report.checks.push("another-user-cannot-read-or-use-the-pass");
  report.completed = true;
} catch (error) {
  report.failure = {
    name: error?.name ?? "unknown",
    status: typeof error?.status === "number" ? error.status : undefined,
    code:
      typeof error?.code === "string" && /^[A-Z_0-9]+$/.test(error.code) ? error.code : undefined,
    classification: /origin|csrf/i.test(error?.message ?? "")
      ? "origin"
      : /auth|session|jwt/i.test(error?.message ?? "")
        ? "authentication"
        : /serial|server.?fn|context/i.test(error?.message ?? "")
          ? "wire-context"
          : "unclassified",
  };
  console.error(`Built imported-access QA failed at ${stage}; no private values logged.`);
  process.exitCode = 1;
} finally {
  await worker?.stop();
  try {
    for (const id of users) {
      const user = await api(`/auth/v1/admin/users/${id}`);
      assert.equal(user.app_metadata?.ovu_import_read_fixture, marker);
    }
    await api(`/rest/v1/access_passes?payment_session_id=eq.${reference}`, "DELETE");
    for (const id of users) await api(`/auth/v1/admin/users/${id}`, "DELETE");
    assert.deepEqual(
      (await api("/auth/v1/admin/users?per_page=1000")).users.map((user) => user.id).sort(),
      beforeUsers,
    );
    assert.deepEqual(await api("/rest/v1/access_passes?select=*&order=id"), beforePasses);
    report.fixturesRemoved = true;
  } catch {
    console.error("Marked fixture cleanup needs inspection; no private values logged.");
    process.exitCode = 1;
  }
  await writeFile(
    resolve(root, "../../evidence/ovu-built-imported-access-results.json"),
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report));
}
