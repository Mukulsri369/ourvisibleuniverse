// Screenshots nebula-views.html queries in headless Edge on the real GPU.
//   node scripts/nearby-qa/nebula-capture.mjs <out-dir> "<query>"...   (OVU_PERF=1 adds 8 s of rAF frame intervals)
import fs from "node:fs";
import path from "node:path";
import { chromium, origin, captureErrors } from "./browser-tools.mjs";
const [outDir, ...items] = process.argv.slice(2);
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
for (const item of items) {
  await page.goto(`${origin}/scripts/nearby-qa/nebula-views.html?${item}`);
  await page.waitForTimeout(7000); // density bake (4 slices/frame) + reference decode
  await page.screenshot({
    path: path.join(outDir, item.replace(/[^a-z0-9]+/gi, "_").slice(0, 80) + ".png"),
  });
  if (process.env.OVU_PERF)
    console.log(
      item,
      JSON.stringify(
        await page.evaluate(
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
                  meanMs: +(t.reduce((a, b) => a + b, 0) / t.length).toFixed(2),
                  p95Ms: +s[Math.floor(s.length * 0.95)].toFixed(2),
                });
              };
              requestAnimationFrame(tick);
            }),
        ),
      ),
    );
  console.log("captured", item);
}
fs.writeFileSync(path.join(outDir, "errors.json"), JSON.stringify(errors, null, 2));
await browser.close();
