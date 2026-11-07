import assert from "node:assert/strict";
import fs from "node:fs";
import { chromium, browserOptions } from "./nearby-qa/browser-tools.mjs";
const urls = [
    ["baseline", "http://127.0.0.1:31756"],
    ["expanded", "http://127.0.0.1:31755"],
  ],
  results = [],
  browser = await chromium.launch(browserOptions);
try {
  // Warm each development server's transforms, then alternate fresh contexts.
  for (const [, base] of urls) {
    const page = await browser.newPage();
    await page.goto(base + "/scripts/nearby-qa/performance.html");
    await page.waitForFunction(
      () => window.__nearbyScene?.scene.getObjectByName("2mrs-observed-galaxy-field"),
      null,
      { timeout: 90000 },
    );
    await page.close();
  }
  for (let trial = 0; trial < 3; trial++)
    for (const [phase, base] of urls) {
      const context = await browser.newContext({
          viewport: { width: 1280, height: 720 },
          deviceScaleFactor: 1,
        }),
        page = await context.newPage();
      await page.goto(base + "/scripts/nearby-qa/performance.html");
      await page.waitForFunction(
        () => {
          const state = window.__nearbyScene;
          return (
            state?.gl.info.render.frame > 0 &&
            state.scene.getObjectByName("2mrs-observed-galaxy-field")?.geometry?.attributes.position
              .count > 40000
          );
        },
        null,
        { timeout: 90000 },
      );
      const sample = await page.evaluate(() => {
        const { scene, gl } = window.__nearbyScene;
        let attributeBytes = 0,
          geometryCount = 0;
        const seen = new Set();
        scene.traverse((o) => {
          if (!o.geometry || seen.has(o.geometry)) return;
          seen.add(o.geometry);
          geometryCount++;
          for (const a of Object.values(o.geometry.attributes))
            attributeBytes += a.array.byteLength;
          if (o.geometry.index) attributeBytes += o.geometry.index.array.byteLength;
        });
        return {
          readyMs: performance.now(),
          domInteractive: performance.getEntriesByType("navigation")[0].domInteractive,
          geometryCount,
          geometryAttributeBytes: attributeBytes,
          renderedFrames: gl.info.render.frame,
          heap: performance.memory?.usedJSHeapSize,
          hidden: document.hidden,
        };
      });
      assert(!sample.hidden);
      results.push({ phase, trial, ...sample });
      console.log(JSON.stringify(results.at(-1)));
      await context.close();
    }
  fs.writeFileSync(
    "docs/nearby-galaxy-startup-comparison.json",
    JSON.stringify(
      {
        kind: "Isolated scene on warmed local Vite dev servers; fresh contexts; first rendered frame plus 2MRS geometry present. Polling includes test overhead. Not production load/LCP or total VRAM.",
        browser: browser.version(),
        results,
      },
      null,
      2,
    ) + "\n",
  );
} finally {
  await browser.close();
}
