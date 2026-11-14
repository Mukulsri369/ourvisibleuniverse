# Exoplanet realism and moon close-up stability — 14 November 2026

The owner asked for two things. First, exoplanets should look realistic and sharp, close to their real images. Second, a selected moon should stay steady in close-up instead of shaking.

## No exoplanet has a resolved photograph

No telescope has resolved an exoplanet into a disk. Direct images (HR 8799, β Pic b, ε Indi Ab) show unresolved points of light. Published "pictures" of Proxima b or TRAPPIST-1 are artist impressions. So the surfaces stay illustrative. What can be grounded in measurements and physics: the host star's light colour, the cloud class expected at each temperature, visible thermal glow, low hot-Jupiter albedos, and self-luminous temperatures for directly imaged planets.

## Moon close-up shaking

- **Cause:** the Solar System `Moon` component (`src/stars/Planets.tsx`) published its world position in R3F's default frame slot (priority 0). `CameraRig` uses the same slot, and the app mounts it first because Milky Way contents mount later. So the camera aimed at the moon's position from the previous frame. The error was one frame of orbital and galactic-drift motion, and it varied with frame time. Planets (−1), exoplanets (−2) and galaxy-system moons (−1.5) already ran before the camera; Solar System moons were the exception.
- **Fix:** the moon frame callback now runs at −0.5, after its planet (−1) and before the camera (0).
- **Evidence** (`scripts/nearby-qa/body-views.html`, which uses the production `SolarSystem`/`Planets`/`CameraRig`; headless Edge on the AMD Radeon iGPU, 1280×800, default speeds with galactic drift on, closest zoom, 4 s). The probe measures the visited body's on-screen centre after the camera has moved each frame.

  | Moon | Before: mean / max offset from centre | Before: mean step per frame | After |
  | --- | --- | --- | --- |
  | Moon | 225 / 315 px | 2.2 px | 0 / 0 px, 0 px |
  | Io | 16,408 / 702,794 px (off-screen) | 25,990 px | 0 / 0 px, 0 px |
  | Titan | 1,447 / 2,221 px | 71 px | 0 / 0 px, 0 px |
  | Phobos | 1,518 / 2,349 px | 2,785 px | 0 / 0 px, 0 px |

  A first run at the default (non-minimum) zoom showed the Moon 1,249 px off-centre with 56 px per frame steps. Europa and Enceladus also measured 0 px after the fix. `test:object-rendering` now fails if the moon priority leaves the (−1, 0) range; this was checked by temporarily restoring 0.

## Exoplanet surfaces

- **Before:** each planet was a 512×256 texture generated on the CPU. It was blurry close up, had a seam and pinched poles, and every giant got the same cream "Jupiter" bands with a red smear. Real planets were randomly given rings. Lighting was white regardless of the host star. HD 209458 b (measured geometric albedo 0.038 ± 0.045, Rowe et al. 2008) looked bright cream, and the self-luminous HR 8799 planets looked like cold Jupiters.
- **Renderer:** `src/stars/ExoSystem.tsx` now shades each pixel from a shared, tileable 64³ noise volume (1 MB, created once in `src/stars/exoplanet-appearance.ts`), sampled in 3D on the unit sphere. There are no seams or pinched poles, and the resolution does not depend on a texture. Octaves finer than about 2 px fade out instead of aliasing, so detail keeps appearing as the camera approaches (up to 11 octaves). Lighting runs in view space, because float32 world coordinates cannot resolve a planet hundreds of light-years from the origin. `exoplanet-maps.ts` was deleted.
- **Physics** (all in `exoAppearance`):
  - **Star light:** the host star's blackbody colour (existing `blackbodyTemperatureToRGB`), so planets of M dwarfs are lit orange-red.
  - **Giant cloud classes** by temperature (Sudarsky, Burrows & Hubeny 2003): I ammonia, II water, III clear blue, IV dark blue alkali absorbers, V hot silicate. Class IV uses the measured deep blue of the similar HD 189733 b (Evans et al. 2013).
  - **Thermal glow:** Planck radiance at 600 nm relative to the reflected starlight, so glow appears only where it would. It shows on WASP-121 b's dayside, the 55 Cancri e magma ocean and the HR 8799 planets, and not on HD 209458 b (about 1,600 K).
  - **Day and night temperatures:** Cowan & Agol (2011), with heat redistribution falling from full at 1,000 K to none at 2,000 K (Schwartz & Cowan 2015). This gives WASP-121 b a dayside of about 2,900 K.
  - **Airless rock:** dark basaltic regolith with Lommel–Seeliger lighting and multi-scale impact craters.
  - **Lava worlds:** surface temperature T = T_sub·cos^¼; melt where it exceeds about 1,300–2,000 K, with convective cells.
  - **Temperate worlds:** illustrative bare-rock continents, ocean glint, ice and clouds. Tidally locked worlds get a substellar cloud deck and night-side ice (Yang, Cowan & Abbot 2013).
  - **Atmosphere:** a limb annulus from the impact parameter, with forward scattering when backlit.
  - **Size rule:** planets below 1.6 Earth radii are drawn as rock (Rogers 2015), so the pulsar planets are no longer "ice giants". Temperate planets of 1.6–6 Earth radii (K2-18 b, Gliese 687 b) are drawn as hazy sub-Neptunes rather than open oceans.
- **Catalogue:** `teffK` was added for HR 8799 b (~850 K; 800–900 K from evolutionary models, Bowler et al. 2010, arXiv:1008.4582) and c, d, e (~1100 K, Wang et al. 2022, arXiv:2208.05594; no error bar quoted; fits disagree by a few hundred K). It is used only for the glow.
- **Rings:** rings are now drawn only on modelled planets (`!observed`), and the ring bands are anti-aliased.
- **Look-dev:** [exoplanet-lookdev-20261114/](exoplanet-lookdev-20261114/) holds `before-after-same-pose.jpg` (8 planets, same pose), `close-ups-after.jpg` and `moon-follow-before-after.jpg`. Reproduce with `node scripts/nearby-qa/body-capture.mjs <dir> shots "rig=0&star=<host>&planet=<name>[&phase=deg&d=radii]"`.

## Performance (sample, not a guarantee)

Same QA page, headless Edge, AMD Radeon iGPU, 1280×800, vsync 60 Hz, 8 s per run:

- **Full-screen giant (ε Eridani b at 1.6 radii), production optics:** 16.65–17.83 ms mean in three runs. The first run had 12 frames over 33 ms; later runs had 0–2.
- **Same view, optics off:** 16.64 ms.
- **Full-screen TRAPPIST-1 e and Proxima b:** 16.66–16.76 ms.
- **Distant view:** 16.65 ms.

Not measured: other GPUs, phones, DPR 2, or the signed-in app.

## Checks run

- **Type check and build:** `npx tsc --noEmit` and `npm run build`.
- **Lint:** ESLint on the changed files (warnings only, pre-existing).
- **Suites:** `test:object-rendering` (newly wired into `package.json`; appearance assertions plus the moon-priority guard), `test:rendering`, `test:3d`, `test:visual`, `test:navigation`, `test:exploration-camera`, `test:solar-controls`, `test:solar-galactic-motion`, `test:independence`, `test:object-catalogue`, `test:galaxy-explorer`.
- **Browser:** the captures and frame-time samples above, with no page or console errors.

## Not done or not established

- **Not checked:** no signed-in full-app check and no physical devices.
- **Titan:** at the closest zoom, Titan's haze shell looked odd in one capture; this was not investigated.
- **Catalogue issues noticed, not changed:**
  - Fomalhaut b is listed as a gas giant, but follow-up work suggests it is an expanding dust cloud (Gáspár & Rieke 2020).
  - Kepler-452 b is not classified as habitable-zone by the current luminosity values.
  - `exosystems.ts` assumes a Bond albedo of 0.34 for every giant's Teq.
- **Unchanged inputs:** HR 8799's young-planet temperatures and ε Indi Ab's JWST temperature (~275 K) were not used beyond the values above.
