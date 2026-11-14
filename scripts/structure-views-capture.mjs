// Cosmic-structure screenshots from the isolated QA page (scripts/nearby-qa/structure-views.html).
// Start the loopback server first (desktop app: launch config "ovu-qa"), or:
//   node node_modules/vite/bin/vite.js --config scripts/nearby-qa/vite.config.mts
// Then:
//   node scripts/structure-views-capture.mjs <label> [ids=all] [views=earth,side,top] [query]
// Screenshots go to .taste-skill/structure-views/<label>/<id>-<view>.png (ignored by Git).
// OVU_BROWSER_CHANNEL=msedge (default) uses the real GPU; set it to "" for bundled Chromium.
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
const [label = "capture", idList = "all", viewList, query = ""] = process.argv.slice(2);
const views = (viewList || "earth,side,top").split(",");
const width = Number(process.env.OVU_VIEW_WIDTH || 1280),
  height = Number(process.env.OVU_VIEW_HEIGHT || 800);
const out = path.join(".taste-skill/structure-views", label);
fs.mkdirSync(out, { recursive: true });
const channel = process.env.OVU_BROWSER_CHANNEL ?? "msedge";

const browser = await chromium.launch({
  headless: true,
  ...(channel ? { channel } : {}),
  args: [
    "--ignore-gpu-blocklist",
    "--enable-gpu",
    "--use-angle=d3d11",
    "--enable-unsafe-swiftshader",
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
  await page.goto(
    `${origin}/scripts/nearby-qa/structure-views.html?v=${views[0]}${query ? "&" + query : ""}`,
    { waitUntil: "domcontentloaded", timeout: 180000 },
  );
  await page.waitForFunction(() => window.__structureViews, null, { timeout: 180000 });
  const ids =
    idList === "all" ? await page.evaluate(() => window.__structureViews.ids) : idList.split(",");
  for (const id of ids) {
    await page.evaluate((id) => window.__structureViews.select(id), id);
    for (const view of views) {
      const distance = Number(process.env.OVU_VIEW_DISTANCE || 0) || undefined;
      await page.evaluate(([v, d]) => window.__structureViews.setView(v, d), [view, distance]);
      const started = Date.now();
      await page.waitForFunction(() => window.__structureViews?.status().ready, null, {
        timeout: 300000,
        polling: 250,
      });
      await page.waitForTimeout(Number(process.env.OVU_SETTLE_MS || 2500));
      const status = await page.evaluate(() => window.__structureViews.status());
      const file = path.join(out, `${id}-${view}.png`);
      await page.screenshot({ path: file });
      log.push({ ...status, file, seconds: (Date.now() - started) / 1000 });
      console.log(`${id} ${view}: -> ${file} (${status.renderer})`);
    }
  }
  fs.writeFileSync(path.join(out, "capture.json"), JSON.stringify({ log, errors }, null, 2));
  if (errors.length) console.log("Errors:", errors.slice(0, 10));
} finally {
  await browser.close();
}
