import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { spawn, type ChildProcess } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:net";
import { mkdir, mkdtemp, readdir, readFile, unlink, rmdir } from "node:fs/promises";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { test } from "node:test";
import { database, closeDatabase } from "../src/backend/db.server";

assert.equal(process.env.DB_HOST, "127.0.0.1");
assert.equal(process.env.DB_PORT, "3307");
assert.equal(process.env.DB_NAME, "ovu_main");
assert.equal(process.env.OVU_LOCAL_DEVELOPMENT, "true");
assert.ok(process.env.OVU_LOCAL_MAIL_DIRECTORY);

test("built Node app verifies email, persists cookie sessions and student data across a full process restart", async () => {
  const socket = createServer();
  socket.listen(0, "127.0.0.1");
  await once(socket, "listening");
  const address = socket.address();
  assert.ok(address && typeof address !== "string");
  const port = address.port;
  await new Promise<void>((resolve, reject) =>
    socket.close((error) => (error ? reject(error) : resolve())),
  );
  const base = "http://127.0.0.1:" + port;
  await mkdir(process.env.OVU_LOCAL_MAIL_DIRECTORY!, { recursive: true, mode: 0o700 });
  const mailbox = await mkdtemp(join(process.env.OVU_LOCAL_MAIL_DIRECTORY!, "built-fixture-"));
  let child: ChildProcess | undefined,
    userId = "";
  async function stop() {
    if (child && child.exitCode === null) {
      const exited = once(child, "exit");
      child.kill();
      await exited;
    }
    child = undefined;
  }
  async function start() {
    child = spawn(process.execPath, [".output/server/index.mjs"], {
      cwd: process.cwd(),
      windowsHide: true,
      stdio: "ignore",
      env: {
        ...process.env,
        PORT: String(port),
        NITRO_HOST: "127.0.0.1",
        BETTER_AUTH_URL: base,
        OVU_BACKEND: "mariadb",
        OVU_MAIL_MODE: "local-outbox",
        OVU_LOCAL_MAIL_DIRECTORY: mailbox,
      },
    });
    for (let attempt = 0; attempt < 100; attempt++) {
      if (child.exitCode !== null)
        throw new Error("Built local server exited before becoming ready");
      try {
        const r = await fetch(base + "/api/auth/get-session");
        if (r.status === 200) return;
      } catch {}
      await delay(200);
    }
    throw new Error("Built local authentication endpoint did not become ready");
  }
  async function call(path: string, body?: unknown, cookie?: string, origin = base) {
    return fetch(base + path, {
      method: body === undefined ? "GET" : "POST",
      headers: { origin, "content-type": "application/json", ...(cookie ? { cookie } : {}) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      redirect: "manual",
    });
  }
  try {
    await start();
    const email = randomUUID() + "@example.test",
      password = "Synthetic-private-built-test-" + randomUUID();
    const signup = await call("/api/auth/sign-up/email", {
      name: "Synthetic Built Fixture",
      email,
      password,
    });
    assert.equal(signup.status, 200);
    const registered = await signup.json();
    userId = registered.user.id;
    assert.equal(registered.token, null);
    const files = await readdir(mailbox);
    assert.equal(files.length, 1);
    const mail = JSON.parse(await readFile(join(mailbox, files[0]), "utf8"));
    assert.equal(mail.to, email);
    const verificationUrl = new URL(mail.url);
    assert.equal(verificationUrl.origin, base);
    const verified = await fetch(verificationUrl, { redirect: "manual" });
    assert.ok([200, 302].includes(verified.status));
    const login = await call("/api/auth/sign-in/email", { email, password });
    assert.equal(login.status, 200);
    assert.ok(login.headers.getSetCookie().some((c) => /HttpOnly/i.test(c)));
    const cookie = login.headers
      .getSetCookie()
      .map((c) => c.split(";")[0])
      .join("; ");
    assert.ok(cookie);
    assert.equal((await call("/api/backend/me", undefined, cookie)).status, 200);
    const initialized = await call("/api/backend/student/profile", undefined, cookie);
    assert.equal(initialized.status, 200);
    const firstProfile = (await initialized.json()).profile;
    assert.equal(
      (
        await call(
          "/api/backend/student/profile",
          { display_name: "Persisted Built Fixture" },
          cookie,
          "https://untrusted.example",
        )
      ).status,
      403,
    );
    assert.equal(
      (
        await call(
          "/api/backend/student/profile",
          {
            display_name: "Persisted Built Fixture",
            accessibility_settings: { highContrast: true },
          },
          cookie,
        )
      ).status,
      200,
    );
    assert.equal(
      (
        await call(
          "/api/backend/student/progress",
          {
            moduleProgress: { "01": { status: "in_progress", percent: 40, timeSpentSeconds: 20 } },
          },
          cookie,
        )
      ).status,
      200,
    );
    await stop();
    await start();
    const me = await call("/api/backend/me", undefined, cookie);
    assert.equal(me.status, 200);
    assert.equal((await me.json()).user.id, userId);
    const restored = (await (await call("/api/backend/student/profile", undefined, cookie)).json())
      .profile;
    assert.equal(restored.student_public_id, firstProfile.student_public_id);
    assert.equal(restored.display_name, "Persisted Built Fixture");
    assert.equal(restored.accessibility_settings.highContrast, true);
    const progress = await call("/api/backend/student/progress", { moduleProgress: {} }, cookie);
    assert.equal((await progress.json()).progress[0].percent, 40);
    assert.equal(
      (await (await call("/api/backend/access", undefined, cookie)).json()).access,
      null,
    );
    assert.equal((await call("/api/backend/admin/users", undefined, cookie)).status, 403);
    const resetRequest = await call("/api/auth/request-password-reset", {
      email,
      redirectTo: base + "/reset-password",
    });
    assert.equal(resetRequest.status, 200);
    const mailFiles = await readdir(mailbox);
    const delivered = await Promise.all(
      mailFiles.map(async (file) => JSON.parse(await readFile(join(mailbox, file), "utf8"))),
    );
    const resetMail = delivered.find((message) => message.subject === "Reset your OVU password");
    assert.ok(resetMail);
    const resetRedirect = await fetch(resetMail.url, { redirect: "manual" });
    assert.equal(resetRedirect.status, 302);
    const resetPage = new URL(resetRedirect.headers.get("location")!);
    assert.equal(resetPage.origin, base);
    const resetToken = resetPage.searchParams.get("token");
    assert.ok(resetToken);
    const newPassword = "Synthetic-replacement-private-" + randomUUID();
    assert.equal(
      (await call("/api/auth/reset-password", { token: resetToken, newPassword })).status,
      200,
    );
    assert.equal((await call("/api/backend/me", undefined, cookie)).status, 401);
    assert.ok(
      [400, 401].includes(
        (await call("/api/auth/reset-password", { token: resetToken, newPassword })).status,
      ),
    );
    const newLogin = await call("/api/auth/sign-in/email", { email, password: newPassword });
    assert.equal(newLogin.status, 200);
    const newCookie = newLogin.headers
      .getSetCookie()
      .map((c) => c.split(";")[0])
      .join("; ");
    assert.equal((await call("/api/auth/sign-out", {}, newCookie)).status, 200);
    assert.equal((await call("/api/backend/me", undefined, newCookie)).status, 401);
  } finally {
    await stop();
    if (userId) await database().execute("DELETE FROM auth_user WHERE id=?", [userId]);
    await closeDatabase();
    for (const file of await readdir(mailbox)) await unlink(join(mailbox, file));
    await rmdir(mailbox);
  }
});
