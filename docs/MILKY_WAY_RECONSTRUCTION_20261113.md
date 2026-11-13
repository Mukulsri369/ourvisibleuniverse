# Milky Way reconstruction from published fits — 13 November 2026

Status: implemented and verified in the isolated QA page on one desktop GPU. Committed locally on `migration/supabase-cloudflare`; not pushed, not deployed.

## Request

The owner reported that the Milky Way does not look realistic and asked for it to look as realistic and premium as possible, like a galaxy similar to Andromeda, without breaking anything.

## What was wrong

Measured in the QA page before any change ([before and after sheets](galaxy-lookdev-milky-way-20261113/README.md)):

- The Milky Way was the last large spiral on the legacy cached volume (`diskLayerSpec()` returned `null` for it). Andromeda and 827 catalogue models already used the disk layer.
- From outside it showed four thin, evenly bright rope arms, a cross-shaped core and visible voxel blocks. Edge-on it was a blurred bar with vertical banding.
- Its arms led the rotation. The pattern turns toward rising Galactocentric azimuth (the Sun's direction of motion), and the arm radius also rose with azimuth. Real arms trail.
- The bar lay along the Sun–centre line instead of at its measured angle.

## Sources

Read in this session from the papers' own text (arXiv pages fetched with `curl`; the fetch tool's summariser was unavailable). No value was taken from memory.

| Quantity                                                                            | Adopted                                                                                                                   | Source                                                    |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Spiral arms: kink azimuth and radius, pitch angle on each side, tangency longitudes | Table 2, every row (uncertainties are in the code comments)                                                               | Reid et al. 2019, ApJ 885, 131 (arXiv:1910.03357)         |
| Arm model and azimuth convention                                                    | ln(R/R_kink) = −(β − β_kink) tan ψ; β is 0 toward the Sun and increases with Galactic rotation; fits assume R0 = 8.15 kpc | Reid et al. 2019, §3                                      |
| Arm width                                                                           | w(R) = 336 + 36 (R − 8.15 kpc) pc, Gaussian 1σ                                                                            | Reid et al. 2019, §3                                      |
| Long bar                                                                            | half-length 5.0 ± 0.2 kpc, angle 28–33°                                                                                   | Wegg, Gerhard & Portail 2015, MNRAS 450, 4050 (abstract)  |
| Box/peanut bulge                                                                    | angle 27 ± 2°, axis ratio 0.5 ± 0.05 from above and 0.26 edge-on, vertical scale height 180 pc                            | Bland-Hawthorn & Gerhard 2016, ARA&A 54, 529, §4.2        |
| Thin and thick disks                                                                | scale length 2.6 ± 0.5 kpc; scale heights 300 ± 50 pc and 900 ± 180 pc; thick/thin surface density 12 ± 4%                | Bland-Hawthorn & Gerhard 2016, §5.1                       |
| Far 3-kpc arm                                                                       | counterpart of the near arm beyond the centre                                                                             | Dame & Thaddeus 2008, ApJ 683, L143 (abstract)            |
| Integrated colour                                                                   | g − r = 0.682 (+0.066, −0.056): among the reddest spirals                                                                 | Licquia, Newman & Brinchmann 2015, ApJ 809, 96 (abstract) |

One bar angle, 28°, lies inside both the bulge's and the long bar's ranges and is used for both. The scene keeps its own distance to the centre (26,673 ly); arm radii are scaled as fractions of R0, so each arm keeps its observed direction from the Sun.

## What is measured and what is reconstructed

- **Measured (fits to objects with distances):** the arm segments within the azimuth ranges of Reid et al.'s parallax sources, the arm tangency directions, the bar's length and angle, the disk scale length and heights, and the bulge's shape.
- **Reconstructed:** everything beyond those ranges, above all the far side of the Galactic centre. The Norma arm is joined to the Outer arm around the far side, as Reid et al. consider most likely. The Scutum–Centaurus arm continues past the parallax source G007.47+00.05 and ends before it would cross the Carina arm. The Sagittarius arm reaches the far end of the bar by symmetry with the Norma arm. The 3-kpc arms' extent in azimuth is assumed.
- **Display choices:** arm strengths (Perseus and Scutum–Centaurus carry the old-star light; Perseus is weak in young stars; the Local arm is a short, star-forming segment), brightness along the arms, spurs, interarm fragments, dust feathers, H II knots, colours, the young-light scale length (0.26 disk radii) and all amplitudes. No image of the whole Galaxy exists, so no photograph was used.

## Changes

- `src/stars/milky-way-structure.ts` (new): the sourced arm table as log-spiral knots, the bar and bulge constants, and helpers for arm radius and Galactic longitude.
- `src/stars/galaxy-disk-layer.ts`:
  - `diskLayerSpec()` gives the Milky Way a spec: sourced scale length, heights and bar; a bar-shaped bulge turned to the bar angle; its own interior light.
  - The map bake draws arms from an arm table when one is given: narrow young-star arms, broad old-star arms at three times the measured width, a dust lane on the inner edge, spurs on the outer edge, sheared interarm fragments and dust feathers, and a softer-edged bar. Other galaxies keep the m-fold spiral unchanged.
  - The spheroid can be turned about the disk axis (`uDiskBulgeTurn`).
- `src/stars/galaxy-volume-shader.ts` (shared ray marcher), `src/stars/GalaxyInteriorField.tsx`: see Performance and Interior below.
- `src/stars/galaxy-star-data.ts`: the Milky Way's disk points no longer trace a second, m-fold spiral (they take the map's light), and its bar points follow the bar angle.
- `src/stars/GalaxyRadiance.tsx`: the Milky Way model takes the 5.0 kpc bar and a display palette.
- QA: `scripts/nearby-qa/galaxy-views.tsx` accepts `eye`, `look`, `inside`, `reveal` and `sel=none`, so the sky from the Sun and the unselected far-field preview can be captured.

The pattern still turns with the scene's motion clock, as before; the arms now trail it.

### Interior

The view from inside is the most used one, so it was tuned and checked separately.

- The band now shows the bulge above and below a dark dust lane, instead of an even glow.
- Entry and exit keep their brightness: the interior gain (8) matches the exterior view at the default exposure, and the Milky Way keeps 0.36 of its own light when revealed (other galaxies keep 0.09). Measured at the switch: mean level 140/132/126 outside against 130/121/114 just inside.
- Star points seen from inside take the dust beside whichever end of the sight line lies deeper in the dust layer, and paths along the layer take its mid-plane density. Before, bulge stars above the plane were extinguished by the dust column at their own position. This applies to every disk-layer galaxy once entered; exterior views are unchanged.

## Performance

Evidence kind: an isolated component test in the QA page (`scripts/nearby-qa/galaxy-views.html`, production components and optics), not the authenticated app and not a physical phone. One machine: Windows desktop, AMD Radeon integrated graphics (ANGLE Direct3D 11), headless Edge, 1280×800 at device pixel ratio 1, idle camera, vsync on. Baseline: the renderer files of `ded7df6` served by a pinned control server on port 31756; updated: this working tree on 31755. Each row: 5 s warm-up, 8 s of frame intervals, baseline and updated alternating, two repeats (both shown). Raw samples, including earlier and slower ones: [milky-way-disk-layer-performance.json](milky-way-disk-layer-performance.json).

Production optics (exposure, tone map, bloom, adaptive resolution):

| View                                         | Baseline: mean ms (FPS), frames > 33.4 ms      | Updated: mean ms (FPS), frames > 33.4 ms     |
| -------------------------------------------- | ---------------------------------------------- | -------------------------------------------- |
| Milky Way, inside, Sun toward the centre     | 20.0 / 20.7 (49.9 / 48.3), 16/401 and 8/387    | 22.4 / 22.5 (44.6 / 44.5), 20/357 and 10/356 |
| Milky Way, inside, Sun toward longitude 90°  | 21.6 / 22.1 (46.3 / 45.3), 11/370 and 9/363    | 16.7 / 16.7 (60.0 / 60.0), 0/480 and 0/480   |
| Milky Way, outside, oblique at 2.7 radii     | 16.7 / 16.7 (60.0 / 60.0), 0/480 and 0/480     | 20.8 / 20.7 (48.2 / 48.4), 13/386 and 16/387 |
| Milky Way, outside, from above at 2.7 radii  | 18.7 / 17.9 (53.5 / 55.8), 5/428 and 3/446     | 18.5 / 18.4 (54.0 / 54.4), 13/433 and 7/435  |
| Milky Way, unselected far preview at 5 radii | 16.7 / 16.7 (60.0 / 60.0), 0/480 and 0/480     | 17.1 / 16.7 (58.6 / 60.0), 3/469 and 0/480   |
| Andromeda, inside                            | 47.1 / 47.0 (21.3 / 21.3), 143/170 and 145/171 | 22.0 / 22.2 (45.5 / 45.0), 7/365 and 23/360  |
| Andromeda, outside, oblique at 2.7 radii     | 25.5 / 26.1 (39.2 / 38.4), 22/313 and 30/307   | 17.2 / 17.3 (58.0 / 57.9), 2/464 and 2/463   |

Every p95 is 33.4 ms or 16.9 ms: with vsync, intervals fall on multiples of 16.7 ms, so a mean between 16.7 and 33.3 ms is a mixture of the two. Adaptive resolution stayed at 1.0 in every Milky Way row except one baseline far-preview repeat (0.75); Andromeda outside ran at 0.75 in both builds.

Fill cost alone (optics off, four times the pixels, no adaptive resolution), mean ms of two repeats:

| View                                     | Baseline      | Updated       |
| ---------------------------------------- | ------------- | ------------- |
| Milky Way, inside, Sun toward the centre | 69.9 / 69.8   | 80.5 / 79.0   |
| Milky Way, outside, oblique              | 49.6 / 47.5   | 72.7 / 73.2   |
| Milky Way, outside, from above           | 56.9 / 57.2   | 65.2 / 65.7   |
| Andromeda, outside, oblique              | 163.6 / 167.4 | 105.0 / 107.1 |

What this shows, and its limits:

- The disk layer costs more per pixel than the legacy volume it replaces. On this GPU the Milky Way is about 10% slower inside toward the centre, 24% slower outside in the oblique overview (48 against 60 FPS) and equal from above and in the far preview; it is faster inside toward longitude 90°.
- The first disk-layer version of the Milky Way was far slower inside: 68 ms against 25 ms. The shared ray marcher was then made cheaper, which is why Andromeda, whose model did not change, is about twice as fast inside and a third faster outside. The same applies to the other disk-layer galaxies, though only Andromeda was timed.
- The changes to the marcher: one exponential per sech²; texel sizes' logarithms passed as uniforms; no dust exponentials where a step holds no dust; no young-light or dust samples nine scale heights above those layers; rays clipped to the radius where a procedural disk's light ends; and, when the eye is inside the slab, steps that lengthen with distance while maps are filtered over the ground a grazing step covers.
- GPU memory by allocation size, not measured: the Milky Way no longer allocates the 144 × 288 × 144 half-float density cache (about 48 MB at the default tier); it allocates a 1536² map with mipmaps (about 12.6 MB) and a 384² old-light map.
- Not established: other GPUs, phones, the full app with its star catalogue and Solar System mounted, camera motion, total VRAM. No claim of 60 FPS or of zero regression is made.

## Verification

- `npx tsc --noEmit` exits 0. ESLint reports 0 errors on the changed files (four existing Fast Refresh warnings). Prettier is clean on the changed source files.
- `test:galaxy-disk-layer` passes with new Milky Way checks:
  - the four fourth-quadrant arm tangencies of Reid et al.'s Table 2 are reproduced within 1° (computed: 337.1°, 326.9°, 306.3°, 285.9°; published: 337.0°, 327.5°, 306.1°, 285.6°);
  - azimuth falls outward along every arm, so arms trail;
  - the Sun lies between the Sagittarius and Perseus arms, just inside the Local arm's ridge;
  - bar and bulge share the measured angle and the bar's near end is in the first quadrant;
  - the star points' bar lies at the bar angle and the disk points are even in azimuth;
  - rays are clipped only where a procedural disk has no light.
    Two mutations each fail it for the intended reason: a wrong Sagittarius kink radius, and a bar on the wrong side.
- Also passing: `test:galaxies`, `test:galaxy-clarity`, `test:galaxy-populations`, `test:galaxy-observed`, `test:galaxy-entry`, `test:galaxy-explorer`, `test:galaxy-landmarks`, `test:galaxy-empty-space`, `test:scene-depth`, `test:rendering`, `test:visual`, `test:3d`, `test:navigation`, `test:exploration-camera`, `test:solar-controls`, `test:solar-galactic-motion`, `test:nearby-expansion`.
- Other galaxies, exterior, same pose from the pinned pre-change renderer and from this change (no optics, 1000×700): the LMC, M51 (two views), M82 and Andromeda face-on are identical to within one 8-bit level. Andromeda edge-on and oblique and M104 (two views) differ only as per-pixel sampling noise in their dust lanes: 16-pixel block means agree within 2 levels and frame means within 0.01 level.
- Close views, with the camera inside the slab at 1.2–1.3 radii, take the new perspective steps and differ slightly: 16-pixel block means within 2 levels for Andromeda and M104 and within 5 for M51, frame means within 0.7%.
- With the motion clock advanced by 300 s, the bar, bulge, arms, dust and star points turn together.
- No shader compile or page errors in any capture.

## Not established

- The full authenticated app, `build:cloudflare`, physical phones, total GPU memory, other GPUs.
- The independent multi-agent review planned for this change did not run: both attempts stopped at the account's usage limit. The review was done by the author instead.

## Known limitations and next actions

- **The Sun's place among the arms holds only at motion time zero.** The pattern turns with the scene's motion clock (one turn in about 93 s at the default speed), while the Sun and the catalogue objects stay fixed, exactly as before this change. Tying the Milky Way's pattern to Galactic time instead would keep the Sun beside the Local arm; that changes existing motion behaviour and one assertion in `test:solar-controls`, so it needs the owner's decision.
- The oblique exterior overview and the inside view toward the centre cost more than the legacy volume did on the measured GPU (see Performance).
- The centre is a smooth, bright bulge and bar. The X shape of the box/peanut bulge is not modelled.
- The look-dev capture script (`scripts/galaxy-lookdev/capture.mjs`) still lists only catalogue models; the Milky Way is viewed through `galaxy-views.html`.
- `MilkyWay` (`GalaxyBackdrop`) in `src/stars/SceneObjects.tsx` is an unmounted legacy particle component. It was left in place.
