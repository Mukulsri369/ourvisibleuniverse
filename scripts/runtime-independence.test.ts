import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { loadStoreRecommendations, AUTHENTIC_STORE_SEED } from "../src/lib/store-products";
import { authenticateCronRequest } from "../src/integrations/supabase/cron-auth";
import { requireCertificateSigningSecret } from "../src/lib/academy/certificate-signing.server";
import { isConfiguredCertificateAdmin } from "../src/lib/academy/admin-authorization";
import { supabaseAdmin } from "../src/integrations/supabase/client.server";

test("all package paths and runtime source are independent of the former vendor", async () => {
  const lock = JSON.parse(await readFile("package-lock.json", "utf8"));
  assert.ok(!Object.keys(lock.packages).some(path => path.includes("@lovable.dev/")));
  async function scan(directory: string) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) await scan(path);
      else if (/\.[cm]?[jt]sx?$/.test(entry.name)) {
        const source = await readFile(path, "utf8");
        assert.doesNotMatch(source, /@lovable\.dev\/|https?:\/\/[^\s"']*lovable\.(?:cloud|dev|app)|__lovableEvents|LOVABLE_CRON_SECRET/, path);
      }
    }
  }
  await scan("src");
  assert.doesNotMatch(await readFile("vite.config.ts", "utf8"), /nitro|@lovable/);
});

test("OVU recommendations use the existing catalogue without Store database requests", async () => {
  const previousFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error("OVU recommendations must not call the Store database"); };
  try {
    const products = await loadStoreRecommendations();
    assert.deepEqual(products, AUTHENTIC_STORE_SEED);
    assert.notEqual(products, AUTHENTIC_STORE_SEED);
    for (const product of products) assert.ok(product.price.startsWith("\u20b9"), "Preserve UTF-8 rupee labels");
    assert.doesNotMatch(await readFile("src/routes/index.tsx", "utf8"), /\u00e2\u20ac|\u00c3\u00a9|\u00c2\u00b0/, "Preserve UTF-8 landing-page text");
    for (const product of products) assert.equal(new URL(product.url).origin, "https://ourvisibleuniverse.store");
  } finally { globalThis.fetch = previousFetch; }
});

test("independent cron authorization rejects missing/wrong secrets and supports rotation", async () => {
  const before = [process.env.OVU_CRON_SECRET, process.env.OVU_CRON_SECRET_PREVIOUS];
  const request = (secret?: string) => new Request("https://ourvisibleuniverse.in/internal/job", { headers: secret ? { Authorization: `Bearer ${secret}` } : {} });
  try {
    delete process.env.OVU_CRON_SECRET;
    assert.equal((await authenticateCronRequest(request()))?.status, 500);
    process.env.OVU_CRON_SECRET = "synthetic-current-test-secret";
    process.env.OVU_CRON_SECRET_PREVIOUS = "synthetic-previous-test-secret";
    assert.equal((await authenticateCronRequest(request()))?.status, 401);
    assert.equal((await authenticateCronRequest(request("wrong")))?.status, 401);
    assert.equal(await authenticateCronRequest(request("synthetic-current-test-secret")), null);
    assert.equal(await authenticateCronRequest(request("synthetic-previous-test-secret")), null);
  } finally {
    for (const [i, key] of ["OVU_CRON_SECRET", "OVU_CRON_SECRET_PREVIOUS"].entries()) {
      if (before[i] === undefined) delete process.env[key]; else process.env[key] = before[i];
    }
  }
});

test("certificate signing fails closed without a private strong key", () => {
  const previous = process.env.CERTIFICATE_SIGNING_SECRET;
  try {
    delete process.env.CERTIFICATE_SIGNING_SECRET;
    assert.throws(requireCertificateSigningSecret);
    process.env.CERTIFICATE_SIGNING_SECRET = "weak";
    assert.throws(requireCertificateSigningSecret);
    process.env.CERTIFICATE_SIGNING_SECRET = "synthetic-private-test-key-over-32-characters";
    assert.equal(requireCertificateSigningSecret(), process.env.CERTIFICATE_SIGNING_SECRET);
  } finally {
    if (previous === undefined) delete process.env.CERTIFICATE_SIGNING_SECRET; else process.env.CERTIFICATE_SIGNING_SECRET = previous;
  }
});

test("production never silently substitutes the in-memory database", () => {
  const names = ["NODE_ENV", "SUPABASE_URL", "VITE_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
  const previous = names.map(name => process.env[name]);
  try {
    for (const name of names) delete process.env[name];
    process.env.NODE_ENV = "production";
    assert.throws(() => supabaseAdmin.from("student_profiles"), /Private Supabase server configuration is required/);
  } finally {
    names.forEach((name, index) => { if (previous[index] === undefined) delete process.env[name]; else process.env[name] = previous[index]; });
  }
});

test("certificate admin authority excludes editable profile roles and unconfigured emails", () => {
  const user = { id: "user-alice", email: "admin@ourvisibleuniverse.in", user_metadata: { role: "admin" } };
  assert.equal(isConfiguredCertificateAdmin(user, {}), false);
  assert.equal(isConfiguredCertificateAdmin(user, { emails: user.email }), false);
  assert.equal(isConfiguredCertificateAdmin({ ...user, email_confirmed_at: "2026-11-04T00:00:00Z" }, { emails: user.email }), true);
  assert.equal(isConfiguredCertificateAdmin({ ...user, app_metadata: { role: "admin" } }, {}), true);
  assert.equal(isConfiguredCertificateAdmin(user, { userIds: "user-bob" }), false);
  assert.equal(isConfiguredCertificateAdmin(user, { userIds: "user-alice" }), true);
});
