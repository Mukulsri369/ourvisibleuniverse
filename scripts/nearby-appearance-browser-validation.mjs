import fs from "node:fs";
import assert from "node:assert/strict";
import { chromium, origin, browserOptions, captureErrors } from "./nearby-qa/browser-tools.mjs";
const browser = await chromium.launch(browserOptions);
fs.mkdirSync(".taste-skill/nearby-appearance", { recursive: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1.5,
  });
  const errors = captureErrors(page);
  page.setDefaultTimeout(60000);
  page.on("pageerror", (error) => console.error(error.message));
  console.log("Opening final high-DPI appearance check");
  await page.goto(origin + "/scripts/nearby-qa/navigation.html?dpr=1.5", {
    timeout: 90000,
    waitUntil: "domcontentloaded",
  });
  await page.waitForFunction(() => window.__setZoom && window.__nearbyNavigation);
  await page.getByRole("button", { name: "Minimize explorer map" }).click();
  await page.evaluate(() =>
    window.__setZoom((Math.log(2e7) - Math.log(1e-10)) / (Math.log(5e10) - Math.log(1e-10))),
  );
  await page.waitForTimeout(5000);
  const target = await page.evaluate(async () => {
    const THREE = await import("/node_modules/three/build/three.module.js");
    const { NEARBY_GALAXIES } = await import("/src/stars/galaxy-catalog.ts");
    const { gToXYZ } = await import("/src/stars/galaxy-models.ts");
    const { scene, camera, gl } = window.__nearbyNavigation;
    const rows = NEARBY_GALAXIES.filter((g) => g.name !== "Andromeda (M31)");
    let field;
    const interactive = [];
    scene.traverse((o) => {
      if (o.name === "bounded-named-galaxy-overview") field = o.children.find((c) => c.isPoints);
      if (o.__r3f?.handlers?.onClick) interactive.push(o);
    });
    const rc = new THREE.Raycaster();
    for (let i = 0; i < rows.length; i++) {
      if (field.geometry.getAttribute("aMask").getX(i) > 0.01) continue;
      const p = gToXYZ(rows[i].l, rows[i].b, rows[i].distance).project(camera);
      const x = ((p.x + 1) * gl.domElement.clientWidth) / 2,
        y = ((1 - p.y) * gl.domElement.clientHeight) / 2;
      if (p.z < -1 || p.z > 1 || x < 320 || x > 1300 || y < 170 || y > 800) continue;
      rc.setFromCamera(new THREE.Vector2(p.x, p.y), camera);
      const hit = rc.intersectObjects(interactive, false)[0];
      if (hit?.object === field) return { x, y, name: rows[hit.index].name };
    }
    throw Error("No unobstructed batched marker for real-click integration check");
  });
  await page.mouse.click(target.x, target.y);
  await page.waitForFunction(
    (name) => window.__nearbyNavigation.useStore.getState().visitGalaxy?.name === name,
    target.name,
  );
  console.log("Real batched-marker click passed: " + target.name);
  const results = [];
  for (const name of [
    "M51 (Whirlpool)",
    "M104 (Sombrero)",
    "M82 (Cigar Galaxy)",
    "Hoag's Object",
    "Sculptor Dwarf",
    "Triangulum (M33)",
  ]) {
    const actual = await page.evaluate(async (name) => {
      const { NEARBY_GALAXIES } = await import("/src/stars/galaxy-catalog.ts");
      const { gToXYZ } = await import("/src/stars/galaxy-models.ts");
      const g = NEARBY_GALAXIES.find(
        (g) => g.name === name || g.name.startsWith(name.split(" (")[0]),
      );
      if (!g) throw Error("Missing visual fixture " + name);
      const p = gToXYZ(g.l, g.b, g.distance);
      window.__nearbyNavigation.useStore
        .getState()
        .setVisitGalaxy({ ...g, x: p.x, y: p.y, z: p.z, view: "overview" });
      return g.name;
    }, name);
    await page.waitForTimeout(6500);
    await page.screenshot({
      path: ".taste-skill/nearby-appearance/" + actual.replace(/\W/g, "-") + ".png",
    });
    const result = await page.evaluate(() => {
      const { gl, scene, useStore } = window.__nearbyNavigation;
      let field;
      scene.traverse((o) => {
        if (o.name === "bounded-named-galaxy-overview") field = o.children.find((c) => c.isPoints);
      });
      return {
        name: useStore.getState().visitGalaxy.name,
        dpr: gl.getPixelRatio(),
        buffer: { width: gl.domElement.width, height: gl.domElement.height },
        profiles: field?.geometry.getAttribute("aAppearance").count,
        programs: gl.info.programs.map((p) => ({
          name: p.name,
          linked: p.diagnostics?.runnable !== false,
        })),
      };
    });
    assert.equal(result.dpr, 1.5);
    assert.equal(result.profiles, 830);
    assert(result.programs.every((p) => p.linked));
    results.push(result);
    console.log(actual + " visual shader check passed");
  }
  assert.deepEqual(errors.page, []);
  assert(
    !errors.console.some((e) => /shader|WebGLProgram/i.test(e)),
    JSON.stringify(errors.console),
  );
  fs.writeFileSync(
    "docs/nearby-appearance-browser-checks.json",
    JSON.stringify(
      {
        results,
        errors,
        batchedMarkerClick: target.name,
        kind: "isolated actual components, not authenticated full app; desktop DPR1.5",
      },
      null,
      2,
    ) + "\n",
  );
} finally {
  await browser.close();
}
