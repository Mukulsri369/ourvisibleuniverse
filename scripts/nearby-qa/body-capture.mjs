// Captures body-views.html poses in headless Edge on the real GPU.
//   node scripts/nearby-qa/body-capture.mjs <out-dir> jitter <body>...        moon/planet follow test
//   node scripts/nearby-qa/body-capture.mjs <out-dir> shots "<query>"...    screenshots
//   node scripts/nearby-qa/body-capture.mjs <out-dir> perf "<query>"...     8 s of rAF frame intervals
// Needs the ovu-qa server (port 31755) and OVU_PLAYWRIGHT_MODULE (see browser-tools.mjs).
import fs from "node:fs";
import path from "node:path";
import { chromium, origin, captureErrors } from "./browser-tools.mjs";

const [outDir, mode, ...items] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({
  channel: "msedge",
  headless: true,
  args: [
    "--ignore-gpu-blocklist",
    "--enable-gpu",
    "--use-angle=d3d11",
    "--disable-renderer-backgrounding",
  ],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = captureErrors(page);
const results = {};
const wait = (ms) => page.waitForTimeout(ms);
for (const item of items) {
  const query = mode === "jitter" ? "body=" + item : item;
  await page.goto(`${origin}/scripts/nearby-qa/body-views.html?${query}`);
  await page.waitForFunction(() => window.__bodyViews, null, { timeout: 60000 });
  await wait(4000);
  if (mode === "jitter") {
    // Re-select after mount so CameraRig frames the body at its close-up radius, then zoom fully in.
    await page.evaluate(async (body) => {
      const { useStore } = await import("/src/stars/store.ts");
      useStore.setState({ visitPlanet: null });
      await new Promise((r) => setTimeout(r, 200));
      useStore.setState({ visitPlanet: body });
    }, item);
    await wait(7000);
    await page.evaluate(() => window.__setZoom(0));
    await wait(3000);
    results[item] = await page.evaluate(() => window.__bodyViews.jitter(4));
  } else if (mode === "perf") {
    results[item] = await page.evaluate(
      () =>
        new Promise((resolve) => {
          const t = [];
          let last = performance.now();
          const end = last + 8000;
          const tick = (now) => {
            t.push(now - last);
            last = now;
            if (now < end) return requestAnimationFrame(tick);
            const s = [...t].sort((a, b) => a - b);
            resolve({
              frames: t.length,
              meanMs: +(t.reduce((a, b) => a + b, 0) / t.length).toFixed(2),
              p95Ms: +s[Math.floor(s.length * 0.95)].toFixed(2),
              over33: t.filter((v) => v > 33.4).length,
            });
          };
          requestAnimationFrame(tick);
        }),
    );
  } else results[item] = await page.evaluate(() => window.__bodyViews.status());
  const file = item.replace(/[^a-z0-9]+/gi, "_").slice(0, 80) + ".png";
  await page.screenshot({ path: path.join(outDir, file) });
  console.log(item, JSON.stringify(results[item]));
}
fs.writeFileSync(path.join(outDir, mode + ".json"), JSON.stringify({ results, errors }, null, 2));
await browser.close();
