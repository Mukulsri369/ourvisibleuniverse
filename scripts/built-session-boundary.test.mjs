import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile, readdir } from "node:fs/promises";
import { toJSONAsync } from "seroval";

// Run against the actual locally built workerd app; no account or provider credentials.
const origin = "http://127.0.0.1:31751";
const directory = new URL("../dist/server/assets/", import.meta.url);
let manifest = "";
for (const name of await readdir(directory)) {
  if (/^server-.*\.js$/.test(name)) manifest += await readFile(new URL(name, directory), "utf8");
}
function functionId(name) {
  const id = manifest.match(new RegExp(`"([a-f0-9]{64})":\\s*\\{\\s*functionName:\\s*"${name}_createServerFn_handler"`))?.[1];
  assert.ok(id, `Missing built server function: ${name}`);
  return id;
}

test("built website rejects a forged session with HTTP 401", async () => {
  const response = await fetch(`${origin}/_serverFn/${functionId("getSubscriptionAdminStatus")}`, {
    headers: { Authorization: "Bearer forged.token.value", "x-tsr-serverFn": "true", Accept: "application/json" },
  });
  assert.equal(response.status, 401);
});

for (const adminToken of ["10442617-e1fa-4405-95b0-25d3bd450c86", "forged.token.value"]) {
  test(`built certificate admin refuses a body-only ${adminToken.includes(".") ? "token" : "identity"}`, async () => {
    const response = await fetch(`${origin}/_serverFn/${functionId("adminGetCertificateStats")}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-tsr-serverFn": "true", Accept: "application/json" },
      body: JSON.stringify(await toJSONAsync({ data: { adminToken } })),
    });
    assert.equal(response.status, 401);
    assert.match(await response.text(), /Administrator authentication required/);
  });
}
