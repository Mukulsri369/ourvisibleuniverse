// Multi-angle galaxy screenshots from the isolated QA page (scripts/nearby-qa/galaxy-views.html).
// Start the loopback server first:
//   node node_modules/vite/bin/vite.js --config scripts/nearby-qa/vite.config.mts
// Then:
//   node scripts/galaxy-views-capture.mjs <label> [keys=m51,m81] [views=front,edge,back] [query]
// Screenshots go to .taste-skill/galaxy-views/<label>/<key>-<view>.png (ignored by Git).
// Software WebGL (SwiftShader) is valid for appearance checks only, never for performance.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const playwright = await import(
  process.env.OVU_PLAYWRIGHT_MODULE
    ? pathToFileURL(path.resolve(process.env.OVU_PLAYWRIGHT_MODULE)).href
    : "playwright"
);
const chromium = playwright.chromium ?? playwright.default.chromium;
const origin = process.env.OVU_QA_ORIGIN || "http://127.0.0.1:31755";
const [label = "capture", keyList, viewList, query = ""] = process.argv.slice(2);
const keys = (
  keyList ||
  "m51,m81,m101,m33,catalog-ngc-1300,cartwheel,hoags-object,m104,m82,antennae,tadpole,stephans-quintet"
).split(",");
const views = (viewList || "front,oblique,edge,back").split(",");
const width = Number(process.env.OVU_VIEW_WIDTH || 960),
  height = Number(process.env.OVU_VIEW_HEIGHT || 600);
const out = path.join(".taste-skill/galaxy-views", label);
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  args: [
    "--enable-unsafe-swiftshader",
    "--ignore-gpu-blocklist",
    "--disable-background-timer-throttling",
    "--disable-renderer-backgrounding",
  ],
});
const log = [];
try {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  const errors = [];
  page.on("pageerror", (e) => errors.push("page: " + e.message));
  page.on("console", (m) => {
    if (m.type() === "error" || /shader|WebGLProgram/i.test(m.text())) errors.push(m.text());
  });
  page.setDefaultTimeout(600000);
  const first = keys[0];
  await page.goto(
    `${origin}/scripts/nearby-qa/galaxy-views.html?g=${first}&v=${views[0]}${query ? "&" + query : ""}`,
    { waitUntil: "domcontentloaded", timeout: 180000 },
  );
  await page.waitForFunction(() => window.__galaxyViews, null, { timeout: 180000 });
  for (const key of keys) {
    await page.evaluate((key) => window.__galaxyViews.select(key), key);
    for (const view of views) {
      const distance = Number(process.env.OVU_VIEW_DISTANCE || 0) || undefined;
      await page.evaluate(([v, d]) => window.__galaxyViews.setView(v, d), [view, distance]);
      const started = Date.now();
      // Wait for the map bake and detail blend, then let exposure settle.
      await page.waitForFunction(
        () => {
          const s = window.__galaxyViews?.status();
          return Boolean(s?.mounted && s.cacheFade > 0.97 && s.detailAlpha > 0.97);
        },
        null,
        { timeout: 900000, polling: 500 },
      );
      await page.waitForTimeout(Number(process.env.OVU_SETTLE_MS || 2500));
      const status = await page.evaluate(() => window.__galaxyViews.status());
      const file = path.join(out, `${key}-${view}.png`);
      await page.screenshot({ path: file });
      log.push({ ...status, file, seconds: (Date.now() - started) / 1000 });
      console.log(`${key} ${view}: -> ${file}`);
    }
  }
  fs.writeFileSync(path.join(out, "capture.json"), JSON.stringify({ log, errors }, null, 2));
  if (errors.length) console.log("Errors:", errors.slice(0, 10));
} finally {
  await browser.close();
}
