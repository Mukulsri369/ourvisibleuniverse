import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, test } from "node:test";
import { setTimeout as delay } from "node:timers/promises";
import { createIndependentAuth } from "../src/backend/auth.server";
import { createBackendHandler } from "../src/backend/http.server";
import { database, closeDatabase } from "../src/backend/db.server";

assert.equal(process.env.DB_HOST, "127.0.0.1");
assert.equal(process.env.DB_PORT, "3307");
assert.equal(process.env.DB_NAME, "ovu_main");
const messages: Array<{ to: string; url: string }> = [],
  users: string[] = [];
const base = process.env.BETTER_AUTH_URL!;
const auth = createIndependentAuth({
  send: async (message) => {
    messages.push(message);
  },
});
const handle = createBackendHandler(auth);
async function call(path: string, body?: unknown, cookie?: string, origin = base) {
  return (await handle(
    new Request(base + path, {
      method: body === undefined ? "GET" : "POST",
      headers: { origin, "content-type": "application/json", ...(cookie ? { cookie } : {}) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    }),
  ))!;
}
async function account() {
  const email = `http-test-${randomUUID()}@example.test`,
    password = `Private-local-fixture-${randomUUID()}`;
  const signup = await call("/api/auth/sign-up/email", {
    name: "HTTP Synthetic Fixture",
    email,
    password,
  });
  assert.equal(signup.status, 200);
  const { user } = await signup.json();
  users.push(user.id);
  const message = messages.find((m) => m.to === email)!;
  assert.ok(message);
  assert.ok([200, 302].includes((await auth.handler(new Request(message.url))).status));
  const login = await call("/api/auth/sign-in/email", { email, password });
  assert.equal(login.status, 200);
  return {
    id: user.id,
    cookie: login.headers
      .getSetCookie()
      .map((c) => c.split(";")[0])
      .join("; "),
  };
}
after(async () => {
  for (const id of users) {
    await database().execute("DELETE FROM admin_access_changes WHERE user_id=? OR actor_id=?", [
      id,
      id,
    ]);
    await database().execute("UPDATE access_passes SET parent_pass_id=NULL WHERE user_id=?", [id]);
    await database().execute("DELETE FROM access_passes WHERE user_id=?", [id]);
    await database().execute("DELETE FROM entitlement_locks WHERE user_id=?", [id]);
  }
  for (const id of users) await database().execute("DELETE FROM auth_user WHERE id=?", [id]);
  await closeDatabase();
});

test("mounted cookie-authenticated APIs enforce origin, roles, safe projections and audited access changes", async () => {
  // Respect the real library's login burst limiter across adjacent integration suites.
  await delay(11000);
  assert.equal((await call("/api/backend/access")).status, 401);
  const member = await account(),
    admin = await account();
  assert.equal((await call("/api/backend/me", undefined, member.cookie)).status, 200);
  assert.equal((await call("/api/backend/admin/users", undefined, member.cookie)).status, 403);
  const lessonPath = "/api/backend/academy/lessons";
  const lesson = {
    moduleId: "01",
    lessonId: "01-core",
    scrollDepthPercent: 60,
    timeSpentSeconds: 75,
  };
  assert.equal((await call(lessonPath)).status, 401);
  assert.equal(
    (await call(lessonPath, lesson, member.cookie, "https://untrusted.example")).status,
    403,
  );
  assert.equal(
    (await call(lessonPath, { ...lesson, userId: admin.id }, member.cookie)).status,
    400,
  );
  assert.equal((await call(lessonPath, { ...lesson, moduleId: "02" }, member.cookie)).status, 400);
  assert.equal((await call(lessonPath, lesson, member.cookie)).status, 200);
  const privateLessons = await call(lessonPath, undefined, member.cookie);
  assert.equal(privateLessons.headers.get("cache-control"), "no-store");
  assert.equal((await privateLessons.json()).lessons.length, 1);
  assert.deepEqual((await (await call(lessonPath, undefined, admin.cookie)).json()).lessons, []);
  const input = {
    requestId: randomUUID(),
    userId: member.id,
    environment: "sandbox",
    action: "grant",
    days: 30,
    reason: "Synthetic HTTP migration test",
  };
  assert.equal(
    (await call("/api/backend/admin/access", input, admin.cookie, "https://untrusted.example"))
      .status,
    403,
  );
  assert.equal((await call("/api/backend/admin/access", input, admin.cookie)).status, 403);
  await database().execute("INSERT INTO app_roles(user_id,role) VALUES(?,?)", [admin.id, "admin"]);
  const grant = await call("/api/backend/admin/access", input, admin.cookie);
  assert.equal(grant.status, 200);
  const result = await grant.json();
  assert.ok(result.passId);
  assert.deepEqual(
    await (await call("/api/backend/admin/access", input, admin.cookie)).json(),
    result,
  );
  const access = await call("/api/backend/access", undefined, member.cookie);
  assert.equal(access.headers.get("cache-control"), "no-store");
  assert.equal((await access.json()).access.id, result.passId);
  const history = await call(
    "/api/backend/admin/history?userId=" + member.id,
    undefined,
    admin.cookie,
  );
  assert.equal(history.status, 200);
  assert.equal((await history.json()).changes.length, 1);
  const listing = await (
    await call("/api/backend/admin/users?search=http-test-", undefined, admin.cookie)
  ).json();
  assert.equal(listing.users.length, 2);
  assert.deepEqual(Object.keys(listing.users[0]).sort(), [
    "createdAt",
    "email",
    "emailVerified",
    "id",
    "name",
  ]);
  assert.equal(
    (await call("/api/backend/admin/history?userId=invalid", undefined, admin.cookie)).status,
    400,
  );
  assert.equal(
    (await call("/api/backend/admin/access", { ...input, reason: "x".repeat(70000) }, admin.cookie))
      .status,
    413,
  );
  const changedExpiry = new Date(Date.now() + 90 * 86400000).toISOString();
  const change = {
    requestId: randomUUID(),
    userId: member.id,
    environment: "sandbox",
    action: "set_expiry",
    passId: result.passId,
    expiresAt: changedExpiry,
    reason: "Synthetic HTTP expiry review",
  };
  const changeResponse = await call("/api/backend/admin/access", change, admin.cookie);
  assert.equal(changeResponse.status, 200);
  assert.equal((await changeResponse.json()).expiresAt, changedExpiry);
  const updatedHistory = await (
    await call("/api/backend/admin/history?userId=" + member.id, undefined, admin.cookie)
  ).json();
  assert.equal(updatedHistory.changes.length, 2);
  assert.equal(updatedHistory.passes[0].expiry_is_fixed, 1);
  assert.ok(updatedHistory.passes[0].original_expires_at);
  assert.deepEqual(updatedHistory.refundAdjustments, []);
  const revoked = await call(
    "/api/backend/admin/access",
    {
      requestId: randomUUID(),
      userId: member.id,
      environment: "sandbox",
      action: "revoke",
      passId: result.passId,
      reason: "Synthetic HTTP revoke review",
    },
    admin.cookie,
  );
  assert.equal(revoked.status, 200);
  assert.equal(
    (await (await call("/api/backend/access", undefined, member.cookie)).json()).access,
    null,
  );
  await database().execute("DELETE FROM app_roles WHERE user_id=?", [admin.id]);
  assert.equal((await call("/api/backend/admin/users", undefined, admin.cookie)).status, 403);
  assert.equal(await handle(new Request(base + "/science")), null);
});
