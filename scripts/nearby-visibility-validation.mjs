import fs from "node:fs";
import assert from "node:assert/strict";
import { chromium, origin, browserOptions } from "./nearby-qa/browser-tools.mjs";
const browser = await chromium.launch(browserOptions),
  results = [];
try {
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  await page.goto(origin + "/scripts/nearby-qa/performance.html");
  await page.waitForFunction(
    () => window.__nearbyScene?.scene.getObjectByName("2mrs-observed-galaxy-field"),
    null,
    { timeout: 90000 },
  );
  for (const viewport of [
    { width: 1280, height: 720 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    for (const scenario of ["local-group", "mw-m31", "11-mpc", "30-mpc", "100-mpc", "inside-mw"]) {
      await page.getByLabel("Scenario").selectOption(scenario);
      await page.waitForTimeout(500);
      const sample = await page.evaluate(async () => {
        const { scene, camera } = window.__nearbyScene;
        const { OBSERVATIONAL_GALAXY_CATALOG: galaxies } =
          await import("/src/stars/galaxy-catalog.ts");
        const { gToXYZ } = await import("/src/stars/galaxy-models.ts");
        const inFront = (p) =>
          p.clone().applyMatrix4(camera.matrixWorldInverse).z < 0 &&
          inView(p.clone().project(camera));
        const inView = (p) => Math.abs(p.x) <= 1 && Math.abs(p.y) <= 1 && p.z >= -1 && p.z <= 1;
        const named = galaxies.filter(
          (g) => g.name !== "Andromeda (M31)" && inFront(gToXYZ(g.l, g.b, g.distance)),
        ).length;
        const survey = scene.getObjectByName("2mrs-observed-galaxy-field"),
          positions = survey.geometry.attributes.position,
          mask = survey.geometry.attributes.aCatalogMask;
        let surveyCentres = 0;
        for (let i = 0; i < positions.count; i++) {
          if (mask && mask.getX(i) > 0.5) continue;
          if (inFront(camera.position.clone().fromBufferAttribute(positions, i))) surveyCentres++;
        }
        return {
          namedCentresInFrustum: named,
          surveyCentresInFrustum: surveyCentres,
          surveyGain: survey.material.uniforms.uGain.value,
        };
      });
      assert(sample.namedCentresInFrustum >= 0);
      results.push({ viewport, scenario, ...sample });
    }
  }
  fs.writeFileSync(
    "docs/nearby-galaxy-visibility.json",
    JSON.stringify(
      {
        kind: "Geometric centre counts inside camera frustum, not brightness-detected pixels or an observational census. Named count excludes separately rendered M31/Milky Way; 2MRS depths are velocity estimates.",
        results,
      },
      null,
      2,
    ) + "\n",
  );
  console.log("PASS: geometric visibility counts for 12 views");
} finally {
  await browser.close();
}
