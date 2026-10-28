import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { once } from "node:events";
import { resolve } from "node:path";
const root = resolve(import.meta.dirname, "..");
const probe = createServer();
probe.listen(0, "127.0.0.1");
await once(probe, "listening");
const port = probe.address().port;
await new Promise((done) => probe.close(done));
const child = spawn(process.execPath, ["scripts/preview.mjs", "--port", String(port)], {
  cwd: root,
  stdio: ["ignore", "pipe", "pipe"],
});
let output = "";
child.stdout.on("data", (s) => (output += s));
child.stderr.on("data", (s) => (output += s));
const origin = "http://127.0.0.1:" + port;
try {
  let ready = false;
  for (let i = 0; i < 100; i++) {
    if (child.exitCode !== null) throw new Error("Preview exited before becoming ready: " + output);
    try {
      const response = await fetch(origin + "/auth", { signal: AbortSignal.timeout(1500) });
      if (response.status === 200) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 200));
  }
  assert(ready, "Preview must serve its built application");
  for (const route of ["/", "/auth", "/pricing", "/contact", "/verify-certificate"]) {
    const response = await fetch(origin + route);
    assert.equal(response.status, 200, route);
    assert.match(response.headers.get("content-type") || "", /text\/html/);
    assert(!(await response.text()).includes("This page didn't load"), route);
  }
  const auth = await (await fetch(origin + "/auth")).text();
  const css = auth.match(/href="([^"]+\.css)"/)?.[1];
  assert(css, "The built page should link its actual stylesheet");
  const asset = await fetch(new URL(css, origin));
  assert.equal(asset.status, 200);
  assert.match(asset.headers.get("content-type") || "", /text\/css/);
  const head = await fetch(new URL(css, origin), { method: "HEAD" });
  assert.equal(head.status, 200);
  assert.equal((await head.arrayBuffer()).byteLength, 0);
  const denied = await fetch(new URL(css, origin), { method: "POST", body: "not-an-asset-write" });
  assert.equal(denied.status, 405, "Static assets must reject writes");
  assert.equal((await fetch(origin + "/assets/missing-qa-file.js")).status, 404);
  console.log(
    "PASS: actual built routes, asset MIME types, HEAD, missing assets and rejected asset writes",
  );
} finally {
  child.kill();
  await Promise.race([once(child, "close"), new Promise((r) => setTimeout(r, 3000))]);
}
