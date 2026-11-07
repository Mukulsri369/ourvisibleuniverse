# Galaxy mouse movement and appearance — 8 November 2026

Local implementation **`f29fe43`**, continuing after `e9477de` on `migration/supabase-cloudflare`. No push, deployment, production configuration, account, payment, DNS or service changes. The earlier catalogue import and Andromeda additions were preserved, not repeated.

## What changed

- Mouse and touch angles follow the latest input at the next rendered frame. Automated travel, keyboard control and zoom retain their existing easing. The old orbit filter introduced about 145 ms of following delay during a constant drag at 60 Hz; this is controller-response mathematics, not a measured hardware input-to-display latency.
- A drag remains a drag even if it ends where it started. Cumulative pointer travel suppresses the resulting canvas click. The original browser control reproduced accidental 2MRS selection; the updated real browser checks retain the selected galaxy. True batched-marker clicks were tested separately and still work.
- Catalogue hover picking pauses during pressed-pointer moves. Initial pointerdown hits remain available for R3F click handling. Hover tooltips clear, and the existing bounded 3D preview pool stays stable while dragging. The mask buffer uploads only when its contents change.
- Selection no longer forces a full detailed stellar field at every zoom level. Screen-size crossfading restores the existing catalogue body at distance; explicit entry still retains full detail. Unfinished density caches pause below eight CSS pixels and resume on approach.
- Tiny unresolved 2MRS sources use a smooth projected continuum instead of sixteen volume samples. Their positions and velocity-based distances remain unchanged; their shapes, sizes and colours remain explicitly illustrative.
- The named overview uses an analytic finite-thickness profile, distinct morphological families, antialiased small-scale detail, and per-model appearance attributes. The full catalogue remains represented; no record was dropped to improve performance.
- Point sizes use drawing-buffer resolution with a CSS-size visibility floor. Exterior stellar associations have softer, lower-exposure footprints. Exterior volume radiance compresses channel peaks together before tone mapping to preserve colour ratios; entered-galaxy exposure is retained.

## Scientific scope

All **830 batched models**, including the **641 imported records**, receive deterministic profiles. Andromeda retains its bespoke representation; the Milky Way remains separate. The catalogue total remains **831**, and the M31 expansion/global observed/destination counts remain **14/124/18**.

Seventeen named models have individual NASA/ESA/ESO image-guide cues. Others use the existing adopted morphology, size and supplied orientation. This is not an individual telescope-image reconstruction of every galaxy. Missing resolved colours, arm phases, association positions and depth are not invented measurements. Linear-light palette values, visibility floors and display gain are presentation choices. Optical/infrared composites are not literal naked-eye RGB measurements.

See [the reference table and appearance limits](GALAXY_OVERVIEW_APPEARANCE_20261107.md). Photometry, identifiers, source snapshots, orientation metadata and adopted distances were not changed. Raw source SB/SAB/S0 subclass enrichment beyond the adopted model families remains future work.

## Actual mouse-drag measurements

Chrome **156.0.8078.80**, DPR 1; actual `Universe`, `DetailedGalaxies` and `CameraRig` components in an isolated local QA page. Each scenario uses 120 real mouse moves through a closed-loop path. The mobile rows are a desktop-browser viewport, not a physical phone. Scenarios are orbit radii around the Milky Way, not galaxy-distance measurements.

The contemporaneous control serves the original modules from `e9477de` without altering the working tree. The script verifies whether the overview shader is the original or analytic implementation. Builds were not run during frame sampling.

**Final wide-view check after closing the duplicate previews:** desktop 1280×720 at 326 Mly improved from **67.3 to 103.6 FPS**; p95 frame time improved from **33.2 to 16.7 ms**. Frames above 33.4 ms were **17/614** versus **11/1318**. The updated selection stayed on the Milky Way and its manual-step angular error was `4.16e-17` radians. [Pinned original](nearby-motion-before-clean.json), [final updated code](nearby-motion-after-clean.json). This is one sequential local comparison, not a hardware-wide guarantee.

Earlier samples, retained to show load and exposure-stage variation:

| Viewport / orbit radius | Original FPS | Updated FPS, final exposure | Original / updated p95 frame ms |
| --- | ---: | ---: | ---: |
| 1280×720 / 3.6 Mly | 57.8 | 63.1 | 33.0 / 33.3 |
| 1280×720 / 326 Mly | 43.4 | 71.6 | 33.6 / 33.0 |
| 390×844 / 3.6 Mly | 68.1 | 70.0 | 25.3 / 33.2 |
| 390×844 / 326 Mly | 64.6 | 84.0 | 25.4 / 25.1 |

Wide desktop frames above 33.4 ms fell from **63/537** to **30/702** in these samples. A preceding updated sample reached **94.7 FPS** in that view, with 2/505 frames above 33.4 ms. The initial original-code sample reached 109.3 FPS before the later host-load change. Retaining these results matters: performance varies with local load, and this is not a universal 60/120-FPS or zero-jank guarantee. The near-view tail worsened in the final sample despite a higher average; further full-app frame-pacing work remains.

The updated browser also checks a 12-pixel manual step against the expected 0.048-radian rotation within the next rendered frames. Maximum observed angular error was below `1e-12` radians. This verifies removal of the artificial angular filter; it does not measure hardware latency. Automated motion is separately checked at 30/60/120 Hz.

Raw evidence: [original first sample](nearby-motion-before.json), [contemporaneous original control](nearby-motion-before-control.json), [updated pre-exposure sample](nearby-motion-optimized.json), [updated final-exposure sample](nearby-motion-final-color.json). The `calls` and `points` fields are collected after release; the original's accidental click changes selection then, so those fields must not be used as a matched draw-call comparison.

## Verification

- PASS: new camera orbit/click tests; camera navigation, navigation flight and exploration camera ownership suites.
- PASS: appearance profile checks for 830 models, 641 source profiles and 17 individual guide profiles; finite deterministic parameters, missing photometry, input immutability and morphology exceptions.
- PASS: galaxy rendering, experience, clarity and population suites. The rendering suite checks approaches at four viewport heights, all sixteen existing reference/preview image pairs and 42,541 survey records.
- PASS: frozen catalogue regeneration `--check`; no scientific catalogue files changed.
- PASS: desktop/mobile real-component navigation, filters, aliases, sources, explicit entry/exit/re-entry, host gating, bounded resources and NED null/outage handling. See [navigation evidence](nearby-galaxy-browser-results.json).
- PASS: final high-DPI visual/compiler check. Six cases cover M51, M104, M82, Hoag's Object, Sculptor Dwarf and M33 at a 2160×1350 drawing buffer (DPR 1.5); all 830 appearance attributes remained present and no page/shader error was captured. See [appearance evidence](nearby-appearance-browser-checks.json). This is not a literal 3840×2160/4K acceptance test.
- PASS: TypeScript and normal client/Cloudflare Worker build. Affected-source ESLint passed with two existing component-export warnings in `GalaxyRadiance.tsx`; the build retains existing deprecation/bundle warnings.

Three duplicate agent-created preview tabs were closed, and the remaining preview was refreshed and left open on Hoag's Object. The local QA entry now reuses its React root during hot refresh. Final cleanup measurements are above; earlier timings are retained rather than silently replaced. Only the loopback QA preview on 31755 is intentionally kept running; the source-control server on 31756 is stopped after testing.

## Reproduction and remaining acceptance

Use the installed Playwright module path through `OVU_PLAYWRIGHT_MODULE`; the optional test dependency is outside this repository. Start `node node_modules/vite/bin/vite.js --config scripts/nearby-qa/vite.config.mts`, then run `node scripts/nearby-motion-validation.mjs after` and `node scripts/nearby-appearance-browser-validation.mjs`. The high-DPI page is `http://127.0.0.1:31755/scripts/nearby-qa/navigation.html?dpr=1.5`.

For the pinned source control, start Vite with `scripts/nearby-qa/motion-control-config.mts`, set `OVU_QA_ORIGIN=http://127.0.0.1:31756`, and run the motion script with `before-control`. The default control revision is `e9477de`; an explicit `OVU_MOTION_CONTROL_REVISION` can select another existing local revision. Set `OVU_MOTION_WIDE_ONLY=1` for the final single desktop-wide scenario; phases `before-clean` and `after-clean` retain the two results separately.

This work does not close the earlier authenticated full-app M31 nuclear-destination acceptance, physical-phone testing, total-VRAM measurement or general full-app performance work. No new auth bypass or production route was added. Source-specific reuse review remains required before publication of catalogue material where the earlier manifest left rights unresolved. Production deployment still requires the owner's approval.
