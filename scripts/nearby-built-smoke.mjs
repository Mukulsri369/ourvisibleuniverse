import fs from "node:fs";
import assert from "node:assert/strict";
import { chromium, origin, browserOptions, captureErrors } from "./nearby-qa/browser-tools.mjs";
const browser = await chromium.launch(browserOptions),
  result = {};
try {
  const page = await browser.newPage(),
    errors = captureErrors(page);
  const response = await page.goto(
    (process.env.OVU_BUILT_QA_ORIGIN || "http://127.0.0.1:31757") + "/universe",
    { timeout: 60000 },
  );
  await page
    .getByRole("button", { name: /sign in/i })
    .first()
    .waitFor({ timeout: 30000 });
  assert.equal(errors.page.length, 0);
  result.builtGuard = {
    url: page.url(),
    status: response.status(),
    signInVisible: true,
    pageErrors: errors.page,
  };
  const qa = await browser.newPage();
  await qa.goto(origin + "/scripts/nearby-qa/performance.html");
  await qa.waitForFunction(() => window.__nearbyScene);
  result.ned = await qa.evaluate(async () => {
    const { queryNedOverview } = await import("/src/stars/galaxy-catalog.ts");
    const answer = await queryNedOverview("M31", 12000);
    return {
      success: answer.success,
      source: answer.source,
      tableCount: answer.data?.tables?.length ?? 0,
    };
  });
  fs.writeFileSync("docs/nearby-galaxy-built-smoke.json", JSON.stringify(result, null, 2) + "\n");
  console.log(JSON.stringify(result));
} finally {
  await browser.close();
}
