# Rendering recipes for OVU galaxies

Each technique below names where it lives in OVU's renderer and what it costs. Read `appearance-physics.md` first for the target. These are recipes, not approvals: every change still goes through the look-dev loop, the validation suites and `ovu-perf-evidence`.

## 0. Where the cost goes

- `GALAXY_MEDIUM` (`src/stars/galaxy-medium.ts`) defines `populations(p, out dust)`, the 3D emissivity and dust field. For selected galaxies it is evaluated **once per voxel** while `GalaxyDensityCache` bakes a half-float RGBA 3D texture, one layer at a time.
  - Richer structure here costs bake time, not frame time, so it is the cheapest place for realism.
- Cache memory is size × 2·size × size × 8 bytes:
  - 80 (performance tier): about 8 MB.
  - 144 (default): about 48 MB.
  - 176 (scientific_high): about 87 MB.
  - Do not raise the size for detail. One voxel is 2.7/size disk radii, about 1.9 % of the radius at 144, so features thinner than about 2 voxels cannot live in the cache.
- `GALAXY_FRAGMENT` (`src/stars/galaxy-volume-shader.ts`) is the per-pixel raymarch: up to 112 steps, adaptively about 3 samples per crossed voxel. Every texture fetch or noise call inside its loop is multiplied by steps × pixels. It currently adds `noise(q*210.)` per step as sub-voxel detail.
- Under `GALAXY_PREVIEW` (the catalogue warm-up path in `GalaxyCatalogCloud.tsx`), `populations()` runs **per ray step**. Keep anything expensive inside `#ifndef GALAXY_PREVIEW`, or behind a cheap branch.
- `GalaxyInteriorField` draws 36,000 exterior or 100,000 interior star points from `galaxy-interior-stars` / `galaxy-star-data.ts`. Point sprites are the right carrier for detail smaller than a voxel: HII knots, OB clusters, supergiants.
- The same medium also renders the Milky Way (`MILKY_WAY_APPEARANCE`) and Andromeda (`ANDROMEDA_APPEARANCE`). Every change to `populations()` affects all 65 appearances, so check a spread of morphologies, not only the hero galaxy.

## 1. Replace the white-noise texture with structured noise

- **Current state.** `getGalaxyNoise()` in `GalaxyRadiance.tsx` fills a 64³ texture with independent random bytes and samples it trilinearly. Octave sums of it (`cloud()`) look like soft blotches, not the filaments and clumps of a real disk.
- **Recipe.** Build the structure in `populations()`, which is baked and so cheap, from the vendored `shader-art-coding` library (`glsl/noise.glsl`):
  - `gradientNoise(vec3)` and `fbm(vec3, octaves, …)` for smooth multi-scale density.
  - `billowFbm` / `turbulence` for clumpy star-forming complexes.
  - A ridged transform, `1 - abs(gradientNoise)` raised to a power, for thin dust filaments. The library's `ridgedFbm` is 2D only, so build the 3D ridge from `gradientNoise(vec3)`.
  - Domain warping, `p + k * vec3(fbm(p+a), fbm(p+b), fbm(p+c))`, to break the perfect spiral into kinked, branching segments.
  - `curlNoise(vec3)` as a divergence-free flow if particles are advected.
- **Porting rules.** Copy the needed functions, with their `@see` credit comments, into a new module such as `src/stars/galaxy-noise-glsl.ts`. Prefix names (for example `gxGradientNoise`), because `galaxy-medium.ts` already defines `noise()`, `cloud()` and `ball()`.
  - The library's Shadertoy rules (`mainImage`, no custom uniforms) do not apply to OVU's three.js `ShaderMaterial`. Take only the functions.
  - The PCG hashes need `uint`, which WebGL2/GLSL ES 3.00 provides. Both OVU materials run on WebGL2.
  - Never paste Shadertoy shader code: it defaults to CC BY-NC-SA 3.0.
- **Option.** Bake a smooth gradient-noise 3D texture once at start-up and keep `noise()` as a lookup, if the per-step detail fetch in `GALAXY_FRAGMENT` needs to stay one texture read.

## 2. Spiral arms that look physical

- **Current state.** One term, `exp(-sin²(phase/2)/w²)`, with a single width, plus `lane` at a fixed phase offset. This gives uniform ropes of equal brightness.
- **Recipe, in `populations()`:**
  1. Compute the arm phase from the log spiral as now, then warp it with low-frequency fBm. Vary the width and amplitude along the arm, `along = log(r)` plus the arm index, using 1D fBm, to get segments, gaps and brightness changes.
  2. Split the arm into components at signed offsets across the arm, in the rotation direction:
     - The dust lane at the inner/upstream edge: narrow and sharp-edged, modulated by ridged noise.
     - HII and young emission downstream: clumpy, from billow noise and thresholds.
     - Old-star enhancement: broad and modest, far below the young-light contrast. Tune it against the reference sheet.
  3. Add spurs: thin ridged-noise dust filaments angled about 60–90° to the arm, starting at the dust lane and fading into the inter-arm region.
  4. For flocculent morphology, drop the global phase and use warped fBm thresholded into short arm fragments that follow a mean pitch angle.
- **Particle alternative.** In the elliptical-orbit density-wave model, each star moves on an ellipse whose orientation angle grows with radius. Crowding where the orbits nearly touch produces arms, a bar-like centre and natural arm thickness. Ingo Berg's Galaxy-Renderer articles on beltoforion.de describe it. Reimplement from the description: the TypeScript repository declares MIT in `package.json` but ships no licence file. Good for `galaxy-star-data.ts`, so stars and volume share one arm geometry.

## 3. Bulge and disk profiles

- Disk emissivity is exp(−R/h) × exp(−|z|/z₀), with h set from `diskRadius` so most light falls within about 3–4 h. Keep the edge taper (`1 - smoothstep`) beyond that.
- Bulge: a Sérsic-like ρ ∝ exp(−b (r/rₑ)^(1/n)), with n about 2–4 for classical bulges and about 1–2 for pseudobulges. Normalise so the centre is much brighter than the disk: the dynamic range must reach the display transform (§6), not be clipped in the field.
- Keep the bulge emission spatially separate from the young emission. The volume integral then keeps a yellow core and a blue disk. Mixing them at every point averages to grey.

## 4. Dust that reads as dust

- Use separate parameters:
  - Dust scale height about 0.5× the stellar one for massive disks, and about 1× for low-mass ones.
  - Dust scale length about 1.4–1.8× the stellar one.
  - Sharp lane edges from the ridged noise of §1.
- Extinction per channel in `GALAXY_FRAGMENT`: `reddening = exp(-dust*ds*vec3(.65,1.,1.6))` is steeper in blue than Cardelli et al. 1989 (A_B : A_V : A_R ≈ 1.3 : 1 : 0.75). Moving towards about `vec3(.75,1.,1.3)` turns lanes brown instead of saturated orange-black. Judge it in look-dev.
- Optional forward scattering, Henyey–Greenstein with g ≈ 0.6, brightens lane edges near the bulge. Only add it if look-dev shows a gain, because it costs per step.
- The cache stores dust in alpha, so dust detail needs no extra fetch.

## 5. HII regions, clusters and resolved stars

- HII knots and OB clusters are smaller than a voxel. Add them as a dedicated star-point class in `galaxy-star-data.ts`:
  - Placed downstream of the dust lane, in strings along the arm.
  - Pink-magenta emission for HII, roughly linear RGB [1.0, 0.3, 0.55] as a labelled display colour.
  - Blue-white for OB clusters.
  - Sizes for 50–300 pc.
  - A few thousand points at most.
- Keep their counts deterministic (seeded, like the existing generator) so positions persist across LOD changes.
- Supergiants in nearby galaxies (M33, LMC, SMC, M31) are point sprites with blackbody colours. The library's `color.glsl` and the Planck locus fit cover the colour.

## 6. Display transform: from physical light to a "telescope-image" look

- **Current state.** `GALAXY_FRAGMENT` does a soft peak compression, then `#include <tonemapping_fragment>`, whose default is R3F's ACES Filmic. ACES desaturates bright regions towards white. It is a suspected cause of the grey baseline, still to be confirmed with a tone-mapping-off debug view. `OpticsPostProcessing.tsx` adds selectable AgX, Neutral, Reinhard or ACES, adaptive exposure and Unreal bloom.
- **Recipe.** Apply a colour-preserving asinh stretch to the integrated radiance (Lupton et al. 2004): `I = luminance(c); c *= asinh(Q*I/β) / max(Q*I, ε)`, with a softening Q (astropy's default is 8) and scale β. Then apply a modest `saturation()` from `color.glsl`, then the renderer tone map, preferring AgX or Neutral to ACES for hue stability.
  - Do it only for the exterior view (`uExteriorView`), so interior travel keeps physical exposure.
  - Label it as enhanced photographic exposure.
- Saturate the guide palettes in `galaxy-overview-appearance.ts`, where they are documented display choices, rather than adding saturation in post. Keep `docs/galaxy-rendering.md` truthful about it.

## 7. Morphology checklist when changing the medium

Check at least one of each, from `GALAXY_MODELS` keys:

- grand-design `m51` and `m81`
- multi-arm or flocculent `m101` and `m33`
- barred `catalog-ngc-1300`
- edge-on or dust-dominated `m104` and `cena`
- ring `cartwheel` and `hoags-object`
- irregular `lmc` and `smc`
- interacting `antennae`
- the Milky Way from outside, and Andromeda

Feature-specific branches (`uFeature` 1–15 in `galaxy-structure.ts`) must keep their identity.

## 8. Tests that guard the renderer

At minimum, run `npm run test:galaxies`, `test:galaxy-clarity`, `test:galaxy-populations`, `test:galaxy-observed`, `test:galaxy-entry`, `test:galaxy-explorer`, `test:rendering` and `test:visual`, plus `npx tsc --noEmit`. Some of them pin shader text, uniforms or feature IDs, so read a failing test before "fixing" it, and never weaken a scientific assertion to get green.
