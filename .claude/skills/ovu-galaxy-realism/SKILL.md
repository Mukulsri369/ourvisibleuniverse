---
name: ovu-galaxy-realism
description: Use when improving how galaxies look in Our Visible Universe, for spiral arms, bulges, dust lanes, HII regions, star clusters, galaxy colour, exposure or "make galaxies realistic / look like Hubble or Webb" requests, or before editing galaxy-medium.ts, galaxy-volume-shader.ts, GalaxyRadiance.tsx, galaxy-star-data.ts, galaxy-structure.ts or galaxy-overview-appearance.ts. Covers the side-by-side look-dev loop against registered telescope images, the appearance physics to reproduce, rendering recipes mapped to OVU's volume renderer, and the science and performance limits.
---

# OVU galaxy realism

Galaxies are reconstructions: a 3D emissivity and dust volume plus representative star points. Make them read like the telescope images without pretending the unseen depth was measured.

## Non-negotiables

- **Label reconstructions.** Unseen depth, star positions, roll and far sides are reconstructions. Colours are display choices informed by composites, not photometry (`docs/galaxy-reconstruction.md`, `docs/galaxy-rendering.md`).
- **Keep it 3D.** Never add photo planes or billboards. The only photograph in the scene is the registered `GalaxyObservedLayer`, which fades off-axis.
- **Keep per-object facts in the catalogue.** Never change catalogue values, distances, orientations or host membership as part of a look change; that is `ovu-object-intake` work. Per-object morphology (arms, pitch, bar, bulge) changes need a cited source.
- **Use only licensed images.** Telescope images used for comparison stay those in `public/textures/galaxies/` with their credits. New reference images go through `ovu-asset-pipeline`.
- **Measure performance.** Any frame-time cost needs `ovu-perf-evidence`. SwiftShader captures are for appearance only, never speed.
- **Mind the shared renderer.** The Milky Way, Andromeda and all catalogue galaxies share `GALAXY_MEDIUM`. Check across morphologies (rendering-recipes §7).

## Look-dev loop (do this before and after every change)

1. Start the loopback QA server:
   - Windows: `node node_modules/vite/bin/vite.js --config scripts/nearby-qa/vite.config.mts`
   - Elsewhere: `npx vite --config scripts/nearby-qa/vite.config.mts`
   - It serves `http://127.0.0.1:31755`.
2. Open `http://127.0.0.1:31755/scripts/galaxy-lookdev/index.html?galaxy=m51`. Parameters:
   - `view=earth|faceon|edgeon`. Earth is north-up from the Solar System, matching the telescope frame.
   - `fill=` for framing, `optics=1` for the production exposure, tone map and bloom, and `tier=` for the quality tier.
   - An unknown key lists all keys.
3. Capture side-by-side sheets plus metrics:
   - `node scripts/galaxy-lookdev/capture.mjs --out <dir> --galaxies m51,m81,m104,catalog-ngc-1300,m33,m101 --views earth [--optics] [--software]`
   - Set `OVU_PLAYWRIGHT_MODULE` to a Playwright `index.mjs` if `playwright` is not resolvable.
   - It waits for the density cache to finish baking.
   - It writes `<key>-<view>.png` (render on the left, north-up registered image on the right), the raw `<key>-<view>-render.png`, and `<key>-<view>.json`.
   - In a GPU-less cloud or CI session add `--software` (SwiftShader). Each capture then takes a few minutes, so run it in the background.
   - `--recompute` rebuilds sheets and indicators from saved `-render.png` files without rendering again.
4. Look at the sheets (Read the PNGs), then compare the JSON indicators before and after. They are rotation-invariant:

| Indicator          | Meaning                                                                                    | Baseline renders / references (9 Nov) |
| ------------------ | ------------------------------------------------------------------------------------------ | ------------------------------------- |
| `saturation`       | mean colour saturation of galaxy pixels                                                    | 0.02–0.03 / 0.11–0.23                 |
| `darkLaneFraction` | pixels inside r80 darker than 0.6× **and** redder than their surroundings (dust, not gaps) | 0 / 0–0.05                            |
| `pinkFraction`     | HII-like pink/magenta pixels                                                               | 0 / 0–0.065                           |
| `colourGradient`   | blue/red of the outer disk (r50–r80) ÷ the core (< r20)                                    | about 1.0 / 0.8–1.44                  |
| `concentration`    | C = 5 log₁₀(r80/r20); crop-sensitive                                                       | mixed; compare before/after only      |
| `fineStructure`    | mid-scale (about 2–8 px) contrast relative to light; grain-sensitive                       | mixed; compare before/after only      |

Indicators depend on capture size, so compare like with like. The 9 November table was recomputed from 600-px sheet crops; a fresh 900-px capture of the same M51 render gives, for example, concentration 1.92 rather than 2.40. Crops, companions, foreground stars and the asinh stretch of the telescope images all differ from the render. Use the indicators to see direction of change and remaining distance, never as pass/fail science values.

## Baseline (9 November 2026, before any redesign)

Measured with the look-dev loop at commit `bafc5a4` plus this tooling (SwiftShader, no optics):

- **Grey.** Almost no colour separation between core and disk; saturation is far below the references.
- **Rope arms.** Arms are uniform-width, evenly bright tubes with no spurs or segments, and a cloudy inter-arm haze.
- **Weak core.** Bulges are faint and small (M81's bulge should dominate its light).
- **No dust.** No visible dust lanes face-on, and no HII knots.
- **Inverted dust in M104.** Its dust ring renders lighter than the bulge, where it should be a dark silhouette.
- **Wrong morphology class in M33.** A flocculent, HII-rich galaxy renders as a clean two-arm spiral.

Causes in the code:

- Read from the source:
  - Structure comes from a 64³ white-noise texture (`getGalaxyNoise`).
  - The arms come from a single `exp(-sin²)` term with a fixed dust-lane offset.
  - Detail smaller than a voxel has no carrier other than one per-step noise fetch.
- Still to confirm with a debug view (for example, output `emission` only, or turn tone mapping off):
  - Old-star light (`stars*19`) dominates the young term on the same arm tubes, so the colour averages out.
  - R3F's default ACES tone map, with the exterior peak compression, desaturates the result.

The per-galaxy numbers are in `docs/GALAXY_REALISM_TOOLING_20261109.md`, and the "before" sheets are in `docs/galaxy-lookdev-baseline-20261109/`.

Also check in every Earth-view sheet that the arms wind the same way as in the telescope image and that the bar and major-axis angles agree. The images are measured, so the reconstruction must not contradict them. The baseline did not verify the winding sense. Check also that a dust lane crosses the bulge on the same side as in the image. If it crosses on the other side, the near side is wrong. That is an orientation fact: record a sourced `nearSide` with `ovu-object-intake` (see `docs/GALAXY_NEAR_SIDE_20261110.md`) rather than restyling the dust.

## Where to change what

| Goal                                                      | File                                                                                              |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Density, arms, bulge, dust field (baked; cheap per frame) | `src/stars/galaxy-medium.ts` (`populations`)                                                      |
| Raymarch, extinction colours, exterior display transform  | `src/stars/galaxy-volume-shader.ts`                                                               |
| Uniforms, noise texture, cache size, step counts          | `src/stars/GalaxyRadiance.tsx`, `src/stars/galaxy-density-cache.ts`                               |
| Star points, HII and cluster classes                      | `src/stars/galaxy-star-data.ts`, `galaxy-interior-stars.ts`, `GalaxyInteriorField.tsx`            |
| Morphology parameters, feature IDs                        | `src/stars/galaxy-structure.ts`, `galaxy-models.ts`, `galaxy-populations.ts`                      |
| Display palettes (labelled)                               | `src/stars/galaxy-overview-appearance.ts`                                                         |
| Exposure, tone map, bloom                                 | `src/stars/OpticsPostProcessing.tsx`                                                              |
| Registered telescope image layer                          | `src/stars/GalaxyObservedLayer.tsx`, `galaxy-observed-images.ts`, `galaxy-observed-projection.ts` |

## Suggested order of work

Do one step per reviewable change, each with before and after sheets.

1. Structured noise in `populations()` (rendering-recipes §1).
2. Arm anatomy: a dust lane, then HII, then old stars across the arm, plus spurs and segments (§2).
3. Bulge and disk profiles with separated colours (§3).
4. Dust geometry and extinction colour (§4).
5. The asinh exterior display transform, with saturated, labelled palettes (§6).
6. HII and cluster point classes (§5).

Then re-run the morphology checklist and the suites in rendering-recipes §8, and record the results in `docs/PROJECT_HANDOFF.md`.

## References

- `references/appearance-physics.md`: what real disks, bulges, arms, dust, HII regions, ellipticals, rings and interacting systems look like, and why, with literature citations.
- `references/rendering-recipes.md`: techniques mapped to OVU's renderer, with cost notes, porting rules for the `shader-art-coding` GLSL library, and the test list.
- Related skills:
  - `shader-art-coding`: vendored GLSL noise, fBm, domain warp, volume, colour and tone-map building blocks. Use its functions, not its Shadertoy conventions.
  - `threejs-shaders` and `threejs-postprocessing`.
  - `ovu-perf-evidence`, `ovu-asset-pipeline` and `ovu-object-intake`.
