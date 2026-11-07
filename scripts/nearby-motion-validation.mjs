import fs from "node:fs";
import assert from "node:assert/strict";
import { chromium, origin, browserOptions, captureErrors } from "./nearby-qa/browser-tools.mjs";
const phase = process.argv[2] || "after";
const originalSource = phase.startsWith("before");
const wideOnly = process.env.OVU_MOTION_WIDE_ONLY === "1";
const browser = await chromium.launch(browserOptions);
console.log("Motion QA browser started");
const results = [];
try {
  for (const viewport of wideOnly
    ? [{ width: 1280, height: 720 }]
    : [
        { width: 1280, height: 720 },
        { width: 390, height: 844 },
      ]) {
    const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
    const errors = captureErrors(page);
    page.setDefaultTimeout(45000);
    page.on("pageerror", (e) => console.error(e.message));
    console.log("Opening motion viewport", viewport);
    await page.goto(origin + "/scripts/nearby-qa/navigation.html", { timeout: 90000 });
    await page.waitForFunction(() => window.__setZoom && window.__nearbyNavigation);
    console.log("Camera ready");
    await page.getByRole("button", { name: "Minimize explorer map" }).click();
    for (const radius of wideOnly ? [3.26e8] : [3.6e6, 3.26e8]) {
      await page.evaluate(
        (radius) =>
          window.__setZoom(
            (Math.log(radius) - Math.log(1e-10)) / (Math.log(5e10) - Math.log(1e-10)),
          ),
        radius,
      );
      await page.waitForTimeout(5000);
      const x = viewport.width * 0.45,
        y = viewport.height * 0.48;
      await page.mouse.move(x, y);
      await page.evaluate(() => {
        const s = window.__nearbyNavigation;
        const target = s.useStore.getState().visitGalaxy;
        const angle = () =>
          Math.atan2(s.camera.position.x - target.x, s.camera.position.z - target.z);
        const m = (window.__motion = {
          frames: [],
          moves: [],
          angles: [],
          start: performance.now(),
          angle,
          initial: angle(),
          running: true,
        });
        const frame = (t) => {
          if (!m.running) return;
          m.frames.push(t);
          m.angles.push(angle());
          requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
        const canvas = s.gl.domElement;
        canvas.addEventListener("pointermove", (e) => {
          if (e.buttons) m.moves.push({ t: performance.now(), x: e.clientX, angle: angle() });
        });
      });
      await page.mouse.down();
      for (let n = 1; n <= 120; n++) {
        await page.mouse.move(
          x + Math.sin((n * Math.PI) / 60) * viewport.width * 0.24,
          y + Math.sin((n * Math.PI) / 30) * viewport.height * 0.08,
        );
        await page.waitForTimeout(8);
      }
      await page.mouse.up();
      await page.waitForTimeout(700);
      const result = await page.evaluate(
        ({ radius, viewport }) => {
          const m = window.__motion;
          m.running = false;
          const end = m.moves.at(-1)?.t || 0;
          const intervals = m.frames
            .slice(1)
            .map((t, i) => t - m.frames[i])
            .filter((v, i) => m.frames[i] <= end);
          const sorted = [...intervals].sort((a, b) => a - b);
          const { gl, scene, useStore } = window.__nearbyNavigation;
          let catalogue = 0,
            overviewKind = "missing";
          scene.traverse((o) => {
            if (o.name === "bounded-named-galaxy-overview") {
              catalogue++;
              const points = o.children.find((c) => c.isPoints);
              overviewKind = points?.material.fragmentShader.includes("float column(")
                ? "analytic"
                : "original-volume";
            }
          });
          return {
            viewport,
            radius,
            frames: intervals.length,
            fps: 1000 / (intervals.reduce((a, b) => a + b, 0) / intervals.length),
            p95FrameMs: sorted[Math.floor(sorted.length * 0.95)],
            framesOver33ms: intervals.filter((v) => v > 33.4).length,
            pointerMoves: m.moves.length,
            calls: gl.info.render.calls,
            points: gl.info.render.points,
            catalogueFields: catalogue,
            overviewKind,
            selected: useStore.getState().visitGalaxy?.name,
            angularRange: Math.max(...m.angles) - Math.min(...m.angles),
          };
        },
        { radius, viewport },
      );
      assert(result.pointerMoves >= 100);
      assert(result.angularRange > 0.1);
      assert.equal(result.overviewKind, originalSource ? "original-volume" : "analytic");
      if (!originalSource)
        assert.equal(
          result.selected,
          "Milky Way",
          "A closed-loop drag must not select a field source",
        );
      results.push(result);
      console.log(JSON.stringify(result));
      fs.mkdirSync(".taste-skill/nearby-motion", { recursive: true });
      await page.screenshot({
        path: `.taste-skill/nearby-motion/${phase}-${viewport.width}-${radius}.png`,
      });
      if (!originalSource) {
        const initial = await page.evaluate(() => window.__motion.angle());
        await page.mouse.down();
        await page.mouse.move(x + 12, y);
        await page.mouse.up();
        const final = await page.evaluate(
          () =>
            new Promise((resolve) =>
              requestAnimationFrame(() =>
                requestAnimationFrame(() => resolve(window.__motion.angle())),
              ),
            ),
        );
        const error = Math.abs(
          Math.atan2(Math.sin(final - initial + 0.048), Math.cos(final - initial + 0.048)),
        );
        assert(
          error < 0.002,
          `Manual rotation must follow a 12px move in the next rendered frames: ${error}`,
        );
        result.manualStepErrorRadians = error;
        // Restore the heading before the next scenario/control comparison.
        await page.mouse.down();
        await page.mouse.move(x, y);
        await page.mouse.up();
        await page.evaluate(
          () =>
            new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
        );
      }
    }
    assert.equal(errors.page.length, 0, JSON.stringify(errors.page));
    assert(
      !errors.console.some((e) => /shader|WebGLProgram/i.test(e)),
      JSON.stringify(errors.console),
    );
    await page.close();
  }
  fs.writeFileSync(
    `docs/nearby-motion-${phase}.json`,
    JSON.stringify(
      {
        phase,
        browser: browser.version(),
        kind: "actual Universe, DetailedGalaxies and CameraRig; mouse drag; isolated local QA, not full authenticated app",
        dpr: 1,
        results,
      },
      null,
      2,
    ) + "\n",
  );
} finally {
  await browser.close();
}
