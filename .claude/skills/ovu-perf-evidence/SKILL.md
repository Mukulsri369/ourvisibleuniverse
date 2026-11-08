---
name: ovu-perf-evidence
description: Use when measuring, comparing or claiming performance, smoothness, FPS, frame time, input lag, memory or load time in Our Visible Universe, before and after any rendering, interaction or asset change. Defines the comparable local QA workflow, the instruments to use, and what may and may not be claimed from a sample.
---

# OVU performance evidence

Measure before changing, and report exactly what was measured.

## What may be claimed

- Always state which kind of evidence you have: an isolated component test, the full authenticated app, desktop-browser viewport emulation, or a physical device. They are not interchangeable.
- Never promise universal 60/120 FPS, "zero regression", or telescope-resolution imagery from limited samples.
- The JS heap and geometry byte counts are not total VRAM. Inactive-tab samples (around 1 Hz) are invalid.
- Cloud or CI sessions without a GPU render WebGL in software. On 8 November 2026 the cloud workspace reported `ANGLE (… SwiftShader …)`; a dense-scene screenshot needed a 640×360 viewport and a long timeout there. Use such sessions for functional and screenshot checks only, never for performance claims. Check `WEBGL_debug_renderer_info` before measuring.
- Average FPS alone hides stepping and stutter. Report frame-time distribution and input-response behaviour as well.

## Local QA tooling that already exists

- Loopback QA server: `node node_modules/vite/bin/vite.js --config scripts/nearby-qa/vite.config.mts` (serves `http://127.0.0.1:31755`). The pinned-baseline control is `scripts/nearby-qa/motion-control-config.mts` on port 31756, selected with `OVU_MOTION_CONTROL_REVISION`.
- Pages:
  - `scripts/nearby-qa/navigation.html`, with `?motion=1` for the frame-interval panel and `?dpr=1.5` for high-DPI.
  - `scripts/nearby-qa/performance.html`.
- Browser scripts (set `OVU_PLAYWRIGHT_MODULE` to a locally installed Playwright module first; it is an optional dependency outside the repository):
  - `scripts/nearby-motion-validation.mjs`
  - `scripts/dense-orbit-validation.mjs`
  - `scripts/sparse-pointer-orbit-validation.mjs`
  - `scripts/survey-event-validation.mjs`
  - `scripts/nearby-browser-validation.mjs`
  - `scripts/nearby-appearance-browser-validation.mjs`
- Andromeda QA instrumentation needs the explicit build flag `VITE_ANDROMEDA_QA=true` and a loopback host (`src/stars/local-scene-qa-flags.ts`). `?qa-fail-assets=1` simulates a reference-image failure. The normal build keeps this disabled. Never add an auth or paid-access bypass for testing.
- In-app instrumentation: `RenderingBenchmarkModal` and `renderer.info` (calls, triangles, points, geometries, textures).
- With the `chrome-devtools-mcp` plugin: record a performance trace (start, interact, stop), then analyse the insights for long tasks, layout and GC. With the `playwright` plugin: reproducible screenshots and scripted interaction.

## Protocol

1. Define the scenario: route, camera pose or zoom preset, viewport, DPR, and the interaction (idle, drag, wheel, flight). Fix all of them.
2. Use a fresh build or dev server and verify which build is being served. Keep the tab selected and visible; do not build or run other heavy jobs during sampling. Warm up first.
3. Capture a contemporaneous baseline at the same pose, using the pinned control revision if code changed.
4. Record:
   - mean FPS, p95 and p99 frame time, and the count of frames over 33.4 ms
   - for drags, held (unchanged-heading) frames
   - `renderer.info` counters and texture memory where available
   - load-time or network bytes for asset work
5. Repeat at least twice. Keep every sample, including worse ones; never silently replace earlier timings.
6. Save raw results as JSON in `docs/` (existing pattern: `docs/*-performance*.json`, `docs/andromeda-performance-results.json`) and link them from the report.

## Reporting template

> Scenario … · build/commit … · served by … · viewport/DPR … · device/GPU … (or "desktop emulation") · baseline vs updated: mean FPS, p95, frames >33.4 ms, renderer.info deltas · limits: … · not established: physical phone / VRAM / full authenticated app (as applicable)

Update `docs/PROJECT_HANDOFF.md` with the evidence links and limits. Stop any loopback servers you started, or say which ones you left running. No deployment without the owner's explicit approval.
