import assert from "node:assert/strict";
import fs from "node:fs";
import { chromium, origin, browserOptions, captureErrors } from "./nearby-qa/browser-tools.mjs";
const phase = process.argv[2] || "expanded";
assert(["baseline", "expanded"].includes(phase));
const coverage = JSON.parse(fs.readFileSync("docs/nearby-galaxy-coverage.json")),
  browser = await chromium.launch(browserOptions);
try {
  const page = await browser.newPage({
      viewport: { width: 1280, height: 720 },
      deviceScaleFactor: 1,
    }),
    errors = captureErrors(page),
    results = [];
  await page.goto(origin + "/scripts/nearby-qa/performance.html", { timeout: 90000 });
  await page.getByLabel("Scenario").waitFor({ timeout: 90000 });
  for (const viewport of [
    { width: 1280, height: 720 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    for (const scenario of ["local-group", "mw-m31", "11-mpc", "30-mpc", "100-mpc", "inside-mw"]) {
      await page.getByLabel("Scenario").selectOption(scenario);
      await page.waitForFunction(
        (s) => {
          try {
            return JSON.parse(document.querySelector("#metrics").textContent).scenario === s;
          } catch {
            return false;
          }
        },
        scenario,
        { timeout: 90000 },
      );
      const result = JSON.parse(await page.locator("#metrics").textContent());
      assert(!result.hidden);
      assert.equal(
        result.galaxies,
        phase === "baseline" ? coverage.baselineCount : coverage.totalCount,
      );
      results.push(result);
      console.log(JSON.stringify(result));
      await page.screenshot({
        path: `.taste-skill/nearby-qa/${phase}-${viewport.width}-${scenario}.png`,
      });
    }
  }
  assert.equal(errors.page.length, 0);
  assert(!errors.console.some((e) => /shader|WebGLProgram/i.test(e)));
  fs.writeFileSync(
    `docs/nearby-galaxy-${phase}-performance.json`,
    JSON.stringify(
      {
        phase,
        kind: "isolated actual Universe/DetailedGalaxies component scene; not full authenticated app",
        browser: browser.version(),
        dpr: 1,
        results,
        errors,
      },
      null,
      2,
    ) + "\n",
  );
} finally {
  await browser.close();
}
