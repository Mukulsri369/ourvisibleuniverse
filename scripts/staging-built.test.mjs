import assert from "node:assert/strict";
import { before, after, test } from "node:test";
import { createServer } from "node:net";
import { once } from "node:events";
import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { tmpdir } from "node:os";
import { unstable_dev } from "wrangler";
const root = resolve(import.meta.dirname, ".."), config = resolve(root, "dist/server/wrangler.json");
let worker, origin;
before(async () => {
  const built = JSON.parse(await readFile(config, "utf8"));
  const probe = createServer(); probe.listen(0, "127.0.0.1"); await once(probe, "listening");
  const port = probe.address().port; await new Promise(done => probe.close(done));
  origin = `http://127.0.0.1:${port}`;
  worker = await unstable_dev(resolve(dirname(config), built.main), { config, local: true, bundle: false, ip: "127.0.0.1", port,
    vars: { OVU_DEPLOYMENT_STAGE: "staging", PUBLIC_APP_ORIGIN: origin, RAZORPAY_MODE: "test" },
    persistTo: resolve(tmpdir(), "ovu-staging-smoke", crypto.randomUUID()), logLevel: "error",
    experimental: { disableExperimentalWarning: true, disableDevRegistry: true } });
});
after(async () => { await worker?.stop(); });
test("actual built staging SSR pages deny indexing without credentials or deployment", async () => {
  for (const path of ["/auth", "/auth-reset", "/learn", "/pricing", "/verify-certificate"]) {
    const response = await fetch(origin + path, { signal: AbortSignal.timeout(30000) });
    assert.equal(response.status, 200, path);
    assert.equal(response.headers.get("X-Robots-Tag"), "noindex, nofollow, noarchive", path);
    assert.match(response.headers.get("Content-Type"), /text\/html/);
    assert.ok((await response.text()).length > 1000);
  }
});
test("actual built staging keeps missing pages at 404 and includes the no-index boundary", async () => {
  const response = await fetch(origin + "/ovu-staging-nonexistent-qa-page", { signal: AbortSignal.timeout(30000) });
  assert.equal(response.status, 404);
  assert.equal(response.headers.get("X-Robots-Tag"), "noindex, nofollow, noarchive");
  await response.body.cancel();
});
