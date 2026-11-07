import fs from "node:fs";
import assert from "node:assert/strict";
import { chromium, origin, browserOptions, captureErrors } from "./nearby-qa/browser-tools.mjs";
const browser = await chromium.launch(browserOptions);
try {
  const page = await browser.newPage({
      viewport: { width: 1280, height: 720 },
      deviceScaleFactor: 1,
    }),
    errors = captureErrors(page);
  await page.goto(origin + "/scripts/nearby-qa/performance.html");
  await page.waitForFunction(
    () => {
      try {
        return (
          JSON.parse(document.querySelector("#metrics").textContent).scenario === "local-group"
        );
      } catch {
        return false;
      }
    },
    null,
    { timeout: 90000 },
  );
  const sample = JSON.parse(await page.locator("#metrics").textContent());
  assert(!sample.hidden);
  assert.equal(errors.page.length, 0);
  fs.writeFileSync(
    "docs/nearby-galaxy-performance-control.json",
    JSON.stringify(
      {
        reason:
          "Independent repeat of the first expanded sample with no concurrent build, type check or test process; original sample retained.",
        sample,
        errors,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(JSON.stringify(sample));
} finally {
  await browser.close();
}
