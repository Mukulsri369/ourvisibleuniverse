import fs from "node:fs";
import assert from "node:assert/strict";
import { chromium, origin, browserOptions, captureErrors } from "./nearby-qa/browser-tools.mjs";
const phase = process.argv[2] || "after",
  browser = await chromium.launch(browserOptions);
try {
  const page = await browser.newPage({ viewport: { width: 696, height: 640 } }),
    errors = captureErrors(page);
  await page.goto(origin + "/scripts/nearby-qa/navigation.html?motion=1", { timeout: 90000 });
  await page.waitForFunction(() => window.__nearbyNavigation && window.__setZoom);
  await page.getByRole("button", { name: "Minimize explorer map" }).click();
  await page.getByLabel("QA view radius").selectOption("35000000");
  await page.waitForTimeout(3500);
  await page.evaluate(() => {
    let field;
    window.__nearbyNavigation.scene.traverse((o) => {
      if (o.name === "2mrs-observed-galaxy-field") field = o;
    });
    const positions = field.geometry.getAttribute("position"),
      getX = positions.getX;
    window.__surveyReads = 0;
    positions.getX = function (i) {
      window.__surveyReads++;
      return getX.call(this, i);
    };
  });
  await page.mouse.move(220, 260);
  await page.mouse.down();
  await page.mouse.move(420, 330, { steps: 24 });
  await page.mouse.up();
  const dragReads = await page.evaluate(() => window.__surveyReads);
  await page.mouse.wheel(0, 80);
  await page.waitForTimeout(300);
  const wheelReads = (await page.evaluate(() => window.__surveyReads)) - dragReads;
  const target = await page.evaluate(async () => {
    const THREE = await import("/node_modules/three/build/three.module.js"),
      { pickSurveyGalaxy } = await import("/src/stars/survey-galaxy-picking.ts");
    const { scene, camera, gl } = window.__nearbyNavigation;
    let field;
    const other = [];
    scene.traverse((o) => {
      if (o.name === "2mrs-observed-galaxy-field") field = o;
      else if (o.__r3f?.handlers?.onClick) other.push(o);
    });
    const positions = field.geometry.getAttribute("position"),
      mask = field.geometry.getAttribute("aCatalogMask"),
      rc = new THREE.Raycaster(),
      p = new THREE.Vector3();
    camera.updateMatrixWorld();
    for (let i = 0; i < positions.count; i++) {
      if (mask.getX(i)) continue;
      p.fromBufferAttribute(positions, i).project(camera);
      const x = ((p.x + 1) * gl.domElement.clientWidth) / 2,
        y = ((1 - p.y) * gl.domElement.clientHeight) / 2;
      if (p.z < -1 || p.z > 1 || x < 300 || x > 600 || y < 170 || y > 410) continue;
      rc.setFromCamera(new THREE.Vector2(p.x, p.y), camera);
      const hits = [];
      pickSurveyGalaxy(
        field,
        rc,
        { width: gl.domElement.clientWidth, height: gl.domElement.clientHeight },
        hits,
      );
      if (
        hits.length &&
        !rc.intersectObjects(other, false).some((h) => h.distance < hits[0].distance)
      )
        return { x, y, name: "2MRS field source " + (hits[0].index + 1) };
    }
    throw Error("No unobstructed survey click fixture");
  });
  await page.evaluate(() => (window.__surveyReads = 0));
  await page.mouse.click(target.x, target.y);
  await page.waitForFunction(
    (name) => window.__nearbyNavigation.useStore.getState().visitGalaxy?.name === name,
    target.name,
  );
  const clickReads = await page.evaluate(() => window.__surveyReads);
  if (phase === "after") {
    assert.equal(dragReads, 0, "Orbit gestures must not scan the survey");
    assert.equal(wheelReads, 0, "Zoom wheel must not scan the survey");
    assert(clickReads > 40000 && clickReads <= 42541, "A genuine click scans the survey once");
  }
  assert.deepEqual(errors.page, []);
  const result = { phase, dragReads, wheelReads, clickReads, selected: target.name, errors };
  console.log(JSON.stringify(result));
  fs.writeFileSync(`docs/survey-events-${phase}.json`, JSON.stringify(result, null, 2) + "\n");
} finally {
  await browser.close();
}
