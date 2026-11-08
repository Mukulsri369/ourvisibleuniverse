import fs from "node:fs";
import assert from "node:assert/strict";
import { chromium, origin, browserOptions, captureErrors } from "./nearby-qa/browser-tools.mjs";
const phase = process.argv[2] || "before",
  browser = await chromium.launch(browserOptions);
try {
  const page = await browser.newPage({
      viewport: { width: 696, height: 640 },
      deviceScaleFactor: 1,
    }),
    errors = captureErrors(page);
  await page.goto(origin + "/scripts/nearby-qa/navigation.html?motion=1", { timeout: 90000 });
  await page.waitForFunction(() => window.__setZoom && window.__nearbyNavigation);
  await page.getByRole("button", { name: "Minimize explorer map" }).click();
  await page.getByLabel("QA view radius").selectOption("35000000");
  await page.waitForTimeout(4000);
  await page.mouse.move(210, 260);
  await page.mouse.down();
  const result = await page.evaluate(
    () =>
      new Promise((resolve) => {
        const { camera, gl } = window.__nearbyNavigation,
          canvas = gl.domElement;
        const start = performance.now(),
          frames = [],
          samples = [];
        let previous = [...camera.quaternion.toArray()],
          last = start,
          n = 0;
        const sample = () => {
          const t = performance.now(),
            next = camera.quaternion.toArray();
          frames.push({
            time: t - start,
            dt: t - last,
            changed: next.some((v, i) => Math.abs(v - previous[i]) > 1e-10),
          });
          last = t;
          previous = next;
          if (t - start < 2400) requestAnimationFrame(sample);
        };
        requestAnimationFrame(sample);
        const timer = setInterval(() => {
          const t = performance.now() - start;
          if (t > 2000) {
            clearInterval(timer);
            return;
          }
          n++;
          samples.push(t);
          canvas.dispatchEvent(
            new PointerEvent("pointermove", {
              bubbles: true,
              pointerId: 1,
              pointerType: "mouse",
              isPrimary: true,
              buttons: 1,
              button: -1,
              clientX: 210 + n * 5,
              clientY: 260,
            }),
          );
        }, 50);
        setTimeout(() => {
          const moving = frames.filter((f) => f.time > 200 && f.time < 1900),
            settled = frames.filter((f) => f.time > 2250);
          resolve({
            inputHz: samples.length / 2,
            frames: moving.length,
            heldFrames: moving.filter((f) => !f.changed).length,
            heldPercent: (100 * moving.filter((f) => !f.changed).length) / moving.length,
            maxFrameMs: Math.max(...moving.map((f) => f.dt)),
            fps: 1000 / (moving.reduce((s, f) => s + f.dt, 0) / moving.length),
            settledChanged: settled.filter((f) => f.changed).length,
          });
        }, 2450);
      }),
  );
  await page.mouse.up();
  assert.deepEqual(errors.page, []);
  if (phase === "after") {
    assert(result.heldPercent < 5, JSON.stringify(result));
    assert.equal(
      result.settledChanged,
      0,
      "Camera must finish settling; no continuing orbit drift",
    );
  }
  fs.writeFileSync(
    `docs/sparse-pointer-${phase}.json`,
    JSON.stringify(
      {
        phase,
        kind: "20Hz synthetic mouse packets through actual CameraRig at display refresh; local QA",
        result,
        errors,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(JSON.stringify(result));
} finally {
  await browser.close();
}
