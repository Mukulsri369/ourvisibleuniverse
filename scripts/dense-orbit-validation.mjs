import fs from "node:fs";
import assert from "node:assert/strict";
import { chromium, origin, browserOptions, captureErrors } from "./nearby-qa/browser-tools.mjs";
const phase = process.argv[2] || "before",
  browser = await chromium.launch(browserOptions);
const results = [];
try {
  const page = await browser.newPage({
    viewport: { width: 696, height: 640 },
    deviceScaleFactor: 1,
  });
  page.setDefaultTimeout(60000);
  const errors = captureErrors(page);
  page.on("pageerror", (e) => console.error(e.message));
  await page.goto(origin + "/scripts/nearby-qa/navigation.html?motion=1", {
    timeout: 90000,
    waitUntil: "domcontentloaded",
  });
  await page.waitForFunction(() => window.__nearbyNavigation && window.__setZoom);
  await page.getByRole("button", { name: "Minimize explorer map" }).click();
  for (const radius of [1.8e6, 3.6e6, 1.2e7, 3.5e7, 1e8, 3.26e8]) {
    await page.getByLabel("QA view radius").selectOption(String(radius));
    await page.waitForTimeout(3500);
    await page.mouse.move(360, 270);
    await page.mouse.down();
    await page.evaluate(
      () =>
        new Promise((resolve) => {
          const frames = [],
            start = performance.now(),
            duration = 4000;
          let previous = start;
          const sample = () => {
            const now = performance.now();
            frames.push(now - previous);
            previous = now;
            if (now - start < duration) requestAnimationFrame(sample);
          };
          requestAnimationFrame(sample);
          const timer = setInterval(() => {
            const elapsed = performance.now() - start,
              t = Math.min(1, elapsed / duration),
              canvas = window.__nearbyNavigation.gl.domElement;
            canvas.dispatchEvent(
              new PointerEvent("pointermove", {
                bubbles: true,
                pointerId: 1,
                pointerType: "mouse",
                isPrimary: true,
                buttons: 1,
                button: -1,
                clientX: 360 + Math.sin(t * Math.PI * 2) * 180,
                clientY: 270 + Math.sin(t * Math.PI * 4) * 65,
              }),
            );
            if (t === 1) {
              clearInterval(timer);
              window.__denseSample = frames;
              resolve();
            }
          }, 8);
        }),
    );
    const result = await page.evaluate((radius) => {
      const { gl, scene, camera } = window.__nearbyNavigation,
        frames = window.__denseSample.slice(1),
        sorted = [...frames].sort((a, b) => a - b);
      const context = gl.getContext(),
        debug = context.getExtension("WEBGL_debug_renderer_info");
      const layers = [];
      scene.traverse((o) => {
        if (
          o.name === "2mrs-observed-galaxy-field" ||
          o.name.startsWith("galaxy-catalog-3d:") ||
          o.name.startsWith("galaxy-radiance:")
        )
          layers.push({ name: o.name, visible: o.visible });
      });
      return {
        radius,
        fps: 1000 / (frames.reduce((a, b) => a + b, 0) / frames.length),
        p95: sorted[Math.floor(sorted.length * 0.95)],
        max: sorted.at(-1),
        over33: frames.filter((v) => v > 33.4).length,
        frames: frames.length,
        calls: gl.info.render.calls,
        points: gl.info.render.points,
        renderer: debug ? context.getParameter(debug.UNMASKED_RENDERER_WEBGL) : "",
        layers,
        camera: camera.position.toArray(),
      };
    }, radius);
    await page.mouse.up();
    console.log(JSON.stringify(result));
    results.push(result);
    fs.mkdirSync(".taste-skill/dense-orbit", { recursive: true });
    await page.screenshot({ path: `.taste-skill/dense-orbit/${phase}-${radius}.png` });
  }
  assert.deepEqual(errors.page, []);
  assert(!errors.console.some((e) => /shader|WebGLProgram/i.test(e)), JSON.stringify(errors));
  fs.writeFileSync(
    `docs/dense-orbit-${phase}.json`,
    JSON.stringify(
      {
        phase,
        browser: browser.version(),
        viewport: [696, 640],
        dpr: 1,
        kind: "actual scene/camera, real mouse down plus 125Hz pointer-move events, four-second drag; isolated local QA",
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
