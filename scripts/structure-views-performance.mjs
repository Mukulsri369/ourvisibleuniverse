// Frame-time samples for the cosmic-structure fields on the isolated QA page.
//   node scripts/structure-views-performance.mjs <out.json> [ids] [query]
// Each scenario loads a fresh page (production optics, whole atlas with universe=1 by default),
// warms up, then takes two 8 s rAF samples: with the structure selected, and at the same pose
// with nothing selected. OVU_QA_ORIGIN selects the server (e.g. a pinned baseline on :31756).
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
const [
  out,
  idList = "sloan_great_wall,bootes_void,laniakea_boundary,coma_cluster",
  query = "universe=1",
] = process.argv.slice(2);
const SECONDS = Number(process.env.OVU_SAMPLE_SECONDS || 8);
const browser = await chromium.launch({
  headless: true,
  channel: process.env.OVU_BROWSER_CHANNEL ?? "msedge",
  args: [
    "--ignore-gpu-blocklist",
    "--enable-gpu",
    "--use-angle=d3d11",
    "--disable-background-timer-throttling",
    "--disable-renderer-backgrounding",
  ],
});
const results = [];
try {
  for (const id of idList.split(",")) {
    for (const mounted of [1, 0]) {
      const page = await browser.newPage({
        viewport: { width: 1280, height: 800 },
        deviceScaleFactor: 1,
      });
      await page.goto(
        `${origin}/scripts/nearby-qa/structure-views.html?s=${id}&v=earth&mounted=${mounted}&${query}`,
        {
          waitUntil: "domcontentloaded",
          timeout: 180000,
        },
      );
      await page.waitForFunction(() => window.__structureViews?.status().ready, null, {
        timeout: 300000,
        polling: 250,
      });
      await page.waitForTimeout(4000); // warm-up: shader compile, fade-in, exposure settle
      const samples = [];
      for (let k = 0; k < 2; k++)
        samples.push(await page.evaluate((s) => window.__structureViews.sample(s), SECONDS));
      const status = await page.evaluate(() => window.__structureViews.status());
      results.push({ id, mounted: Boolean(mounted), query, samples, status });
      console.log(
        id,
        mounted ? "selected  " : "unselected",
        samples.map((s) => `${s.meanMs} ms (p95 ${s.p95Ms}, >33.4: ${s.over33})`).join(" | "),
        `calls ${status.calls} points ${status.points}`,
      );
      await page.close();
    }
  }
} finally {
  await browser.close();
}
fs.writeFileSync(
  out,
  JSON.stringify(
    {
      origin,
      viewport: "1280x800",
      deviceScaleFactor: 1,
      seconds: SECONDS,
      browser: "headless msedge (ANGLE D3D11)",
      results,
    },
    null,
    2,
  ),
);
console.log("wrote", out);
