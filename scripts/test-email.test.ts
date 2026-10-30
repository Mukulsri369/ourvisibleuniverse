import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import { mkdtemp, readdir, readFile, unlink, rmdir } from "node:fs/promises";
import { resolve, join } from "node:path";
import { tmpdir } from "node:os";
import { configuredEmail, smtpEmail } from "../src/backend/email.server";

test("local verification mail stays outside Git and is unavailable for public or HTTPS deployment origins", async () => {
  const names = [
    "OVU_MAIL_MODE",
    "OVU_LOCAL_DEVELOPMENT",
    "OVU_LOCAL_MAIL_DIRECTORY",
    "BETTER_AUTH_URL",
  ];
  const saved = Object.fromEntries(names.map((n) => [n, process.env[n]]));
  const directory = await mkdtemp(join(tmpdir(), "ovu-private-mail-test-"));
  const message = {
    to: randomUUID() + "@example.test",
    subject: "Synthetic mail fixture",
    url: "http://localhost:3000/api/auth/verify-email?token=synthetic-fixture-only",
  };
  try {
    process.env.OVU_MAIL_MODE = "local-outbox";
    process.env.OVU_LOCAL_DEVELOPMENT = "true";
    process.env.OVU_LOCAL_MAIL_DIRECTORY = directory;
    process.env.BETTER_AUTH_URL = "http://localhost:3000";
    await configuredEmail().send(message);
    const files = await readdir(directory);
    assert.equal(files.length, 1);
    assert.deepEqual(JSON.parse(await readFile(join(directory, files[0]), "utf8")), message);
    for (const origin of [
      "http://public.example",
      "https://public.example",
      "https://localhost:3000",
    ]) {
      process.env.BETTER_AUTH_URL = origin;
      await assert.rejects(configuredEmail().send(message), /restricted/);
    }
    process.env.BETTER_AUTH_URL = "http://localhost:3000";
    process.env.OVU_LOCAL_MAIL_DIRECTORY = resolve(".");
    await assert.rejects(configuredEmail().send(message), /outside source/);
    process.env.OVU_LOCAL_MAIL_DIRECTORY = directory;
    process.env.OVU_LOCAL_DEVELOPMENT = "false";
    await assert.rejects(configuredEmail().send(message), /restricted/);
  } finally {
    for (const name of names) {
      if (saved[name] === undefined) delete process.env[name];
      else process.env[name] = saved[name];
    }
    for (const file of await readdir(directory)) await unlink(join(directory, file));
    await rmdir(directory);
  }
});

test("SMTP cannot fall back to logging token URLs when configuration is absent", async () => {
  const saved = process.env.SMTP_HOST;
  delete process.env.SMTP_HOST;
  try {
    await assert.rejects(
      smtpEmail().send({
        to: "synthetic@example.test",
        subject: "Synthetic",
        url: "https://example.test/token",
      }),
      /not configured/,
    );
  } finally {
    if (saved === undefined) delete process.env.SMTP_HOST;
    else process.env.SMTP_HOST = saved;
  }
});
