# Galaxy 3D reconstruction from all viewing angles — 9 November 2026

Status: implemented and verified in the isolated QA page (software WebGL). Not deployed.

## Request

The owner reported that the twelve galaxies given telescope photographs on 8–9 November
look right from the front but unchanged from the side and back. The photograph is a 2D
overlay registered from Earth's direction (see [observed-image report](GALAXY_OBSERVED_IMAGES_20261108.md));
away from that direction the old generic procedural volume was all that remained. The
request: realistic, premium 3D galaxies from every angle, informed by real galaxy imagery,
for all galaxies.

## What was wrong (baseline, same poses before and after)

- Side views showed a featureless grey streak: no dust lane, no bulge, a blurry disk.
- Back and oblique views showed one generic two-arm noise spiral for every galaxy, unrelated
  to the photograph (M51's companion appeared as a yellow ball in the wrong place).
- M82's volume was a large beige box of fog away from Earth's direction.
- Cause: every galaxy was a single procedural formula cached into a 3D texture of about
  0.015 disk radii per voxel, which cannot hold thin dust lanes (vertical scale heights of
  about 0.01 disk radii) or photograph-level detail.

## Real-galaxy image providers reviewed

Image hosts are blocked for downloads from the cloud workspace (proxy policy denial), so
no new images were added; the sixteen photographs already in `public/textures/galaxies/`
were used. The providers below were reviewed for what they offer and how their images may
be used. This is not legal advice; check each image's own page.

| Provider                                                            | What it offers for galaxies                                                | Terms (as published)                                                                                                    |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| [ESA/Hubble](https://esahubble.org/copyright/)                      | Large processed releases, most with embedded AVM sky registration          | CC BY 4.0; credit unaltered; changes noted after the credit; no implied endorsement                                     |
| [ESA/Webb](https://esawebb.org/copyright/)                          | NIRCam/MIRI releases (infrared, assigned colours)                          | CC BY 4.0, same conditions                                                                                              |
| NASA / STScI (hubblesite.org, webbtelescope.org, science.nasa.gov)  | Hubble and Webb releases                                                   | Generally public domain when credited to NASA/ESA/CSA/STScI; third-party credit lines can differ; NASA logos restricted |
| [ESO](https://www.eso.org/public/outreach/copyright/)               | VLT/VST/VISTA wide fields (M33, LMC, SMC, Cen A, M31)                      | CC BY 4.0 unless noted; no implied endorsement                                                                          |
| [NOIRLab](https://noirlab.edu/public/)                              | Gemini, Kitt Peak, CTIO releases                                           | CC BY 4.0 for current releases; older items vary                                                                        |
| [AstroPix (IPAC)](https://www.astropix.org/)                        | Aggregator of observatory images with AVM metadata (sky registration)      | Terms of each contributing observatory                                                                                  |
| [ESA Euclid ERO](https://www.cosmos.esa.int/web/euclid/ero-credits) | Wide, deep near-IR/optical views of nearby galaxies                        | CC BY-SA 3.0 IGO or ESA Standard Licence                                                                                |
| [DESI Legacy Surveys](https://www.legacysurvey.org/)                | Uniform optical cutouts of most catalogue galaxies (viewer/cutout service) | Acknowledgement requested; image reuse terms not stated in the pages found                                              |
| SDSS SkyServer, Pan-STARRS                                          | Uniform survey cutouts                                                     | Acknowledgement requested                                                                                               |
| DSS (STScI)                                                         | All-sky photographic plates                                                | No commercial use without permission (paid OVU: avoid)                                                                  |
| Rubin Observatory                                                   | 2025 first-look releases                                                   | Check each release page                                                                                                 |

Structural references for what a disk galaxy looks like from each direction (used to set
vertical structure, not copied as images): edge-on systems such as NGC 891, NGC 4565 and the
Sombrero; face-on grand-design spirals such as M51, M74 and M101.

## Method (summary; details in code comments)

- Disk galaxies are rendered as **face-on maps × analytic vertical profiles**, the geometry
  of panchromatic radiative-transfer models of nearby spirals (De Looze et al. 2014, A&A 571,
  A69, M51; Nersesian et al. 2020): a sech² old stellar disk, a thinner young (UV) and dust
  disk at about half the old scale height (Xilouris et al. 1999, A&A 344, 868), ionised gas
  at about a quarter, a faint thick disk, flaring and a flattened bulge. Old-disk scale height
  ≈ 0.1 × scale length (de Grijs 1998; Kregel, van der Kruit & de Grijs 2002).
- **Seven galaxies with disk-registered photographs** (M51, M81, M101, M33, NGC 1300, the
  Cartwheel, Hoag's Object) take their in-plane structure from the photograph
  (`scripts/derive-galaxy-disk-maps.ts`): sky subtraction, foreground-star inpainting,
  dust measured as reddened local darkening, partial restoration of the light behind dust,
  bulges and the M51 companion moved into separate parts extruded along Earth's sightline,
  then deprojection through the same registration matrix the photograph uses. Smooth light
  and dust continue past the frame along the fitted exponential disk.
- **All other disk galaxies** bake a procedural face-on map once when selected: logarithmic
  arms with dust lanes on their inner edges, spurs, H II regions and clusters on the arms,
  bars with offset dust lanes, rings and flocculent fragments.
- Rays integrate front to back with per-channel dust extinction; starlight emits but does not
  absorb. Seen from Earth's direction the reconstruction reproduces the photograph's display
  values; edge-on columns roll off logarithmically instead of clipping.

## Photographed parts

Parts are cut from the registered image and extruded along Earth's sightline, so Earth's view
reproduces the image exactly. Spheroids (bulges, NGC 5195, NGC 7317, NGC 7318A/B) use the depth
weighting of a spherical deprojection (emissivity proportional to (r² + c²)^-1.5), so a bright
nucleus stays compact and the body looks round from the side. Sheets (disturbed disks, tidal
tails, the Quintet's shock region) use a thin biweight profile; seen edge-on they become thin
streaks, as tidal tails are. Part depths and relative depths between components are
illustrative.

## Scientific labelling

The derived maps are reconstruction inputs computed from published images, not new
observations. Vertical structure, the far side of each disk, everything outside a
photograph's frame and the depth of companions are illustrative. Photograph-registered
disks no longer rotate their pattern, so they stay aligned with the image.

## Coverage

| Group                         | Galaxies                                                                                                             | How the 3D structure is built                                                                                                    |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Photograph-derived disks      | M51 (+ NGC 5195), M81, M101, M33, NGC 1300, Cartwheel, Hoag's Object                                                 | Deprojected face-on maps from the registered image; bulges and the companion as round spheroids extruded along Earth's sightline |
| Photograph-derived components | Antennae (NGC 4038/4039), Tadpole (body + tail), Stephan's Quintet (NGC 7319, 7318A/B, 7317, shock region, old tail) | Each component cut from the registered image and extruded as a sheet or spheroid; foreground NGC 7320 excluded                   |
| Procedural with object guides | M82 (dusty starburst disk + biconical H-alpha wind), M104 (Sombrero: bulge, dust ring), M64, M94, Andromeda          | Procedural face-on map with object-specific parameters                                                                           |
| Procedural disks              | All other spiral, barred, flocculent, lenticular, ring and edge-on models                                            | Procedural face-on map from catalogued morphology, arms, pitch, bar, ring and dust class                                         |
| Unchanged cached volume       | Milky Way, ellipticals, dwarfs, irregulars, Cen A, LMC, SMC, Mayall's Object, Malin 1, sourced dwarf populations     | Existing renderer (interior-tuned or bespoke features)                                                                           |

214 of the 830 catalogue models use the new disk layer (10 photograph-derived).

## GPU memory and cost

- The 3D density cache (176 × 352 × 176 half-float RGBA, about 87 MB at the default
  quality tier) is no longer allocated for disk-layer galaxies. In its place: a procedural
  face-on map (2048² RGBA8 with mipmaps, about 22 MB, plus 1.4 MB), and for photograph-derived
  galaxies a packed young/dust map (about 22 MB), an old-light map (1.4 MB) and a parts
  atlas (up to about 4 MB). Only the selected galaxy is resident.
- Downloads: about 8 MB in `public/textures/galaxies/derived/`, fetched only when that
  galaxy is selected (0.1–2 MB per galaxy).
- Ray steps are adaptive (fine inside the thin layers, the bulge and any photographed part,
  coarse elsewhere) and bounded by the existing quality-tier step counts. Each step reads two to five 2D textures
  instead of one 3D texture plus noise. **Frame time on real GPUs has not been measured**:
  the cloud renderer is SwiftShader, valid only for appearance. Measure with
  `ovu-perf-evidence` before claiming any performance change.

## Verification

- `npm run test:galaxy-disk-layer` (new): derived maps match their metadata; each derived disk
  re-projected through the registration correlates with its photograph (r = 0.80–0.99 for the
  seven disks); vertical-structure ratios and profile normalisation (each profile integrates
  to its map value; spheroid parts integrate to the image along every sightline); galaxy
  selection; no pattern rotation for photograph-registered galaxies.
- Existing suites passed: `test:galaxies`, `test:galaxy-clarity`, `test:galaxy-observed`,
  `test:galaxy-landmarks`, `test:galaxy-populations`, `test:galaxy-entry`,
  `test:galaxy-explorer`, `test:galaxy-empty-space`, `test:scene-depth`, `test:rendering`,
  `test:visual`, `test:3d`, `test:navigation`, `test:solar-controls`,
  `test:exploration-camera`. `npx tsc --noEmit` passed; ESLint on changed files: 0 errors.
- Visual: `scripts/nearby-qa/galaxy-views.html` renders the production galaxy components and
  optics from fixed poses (front = Earth's direction, oblique, edge, back, top); `?nophoto=1`
  withholds photographs to show the 3D model alone. `scripts/galaxy-views-capture.mjs` saved
  before/after screenshots under `.taste-skill/galaxy-views/` (ignored by Git), in headless
  Chromium with SwiftShader at 640×400 or 960×600, DPR 1.

## Follow-up, 10 November 2026 (pushed, not deployed)

- **NGC 1300 registration.** The image's embedded AVM describes a mirrored frame; the
  nucleus position and the published position angle show it is an ordinary east-left
  frame ([registered-image report](GALAXY_OBSERVED_IMAGES_20261108.md#correction-10-november-2026-ngc-1300-parity-pushed-not-deployed)).
  Deprojected through the mirrored registration, the face-on disk came out as a
  2.5:1 ellipse, so the reconstruction looked squashed from every other direction.
  The maps were regenerated with the corrected registration.
- **Mid-plane detail sheet.** A face-on map is a column. Fine detail spread through the
  young and dust layers drew streaks and short pillars in tilted views, because
  each layer projects to a strip about 2h·tan(i) wide (about 0.05 disk radii for M81).
  Young light and dust above their local mean on that scale are now drawn as a thin
  sheet where each ray crosses the mid-plane. The face-on column is unchanged. Rays within 7° of the plane keep the
  layers, blending to the sheet by 17°. Concentrating H II regions, clusters
  and dust lanes into a zero-thickness sheet is a rendering approximation of their
  thin layers.
- **Spheroid cores.** Each photographed spheroid now carries its measured core radius:
  the half-width of its light, 0.17–0.63 of its outline. With the fixed small core,
  flat-topped bulges and the Quintet's ellipticals looked boxy from the side. A
  parabolic window over each sightline's chord brings the light to zero at the
  outline, renormalised in closed form so Earth's view still equals the image.
  Without it, a wide core such as M81's showed a hard spherical edge.
- **Procedural disks:**
  - Old light and bulges start from warm old-population colours (Peletier & Balcells
    1996; de Jong 1996), with a light catalogue tint. The catalogue colours of
    generated models are integrated colours, blue for late types, and had made the
    interarm disk bluer than the arms.
  - Old light follows the arms, strongly in grand-design disks (Rix & Zaritsky 1995)
    and weakly in flocculent ones (Thornley 1996).
  - Arms are narrower, with clumps elongated along them.
  - Bars are brighter and flatter and launch the arms at their ends.
  - The old disk's scale length is 0.21 of the model radius (was 0.27), closer to the
    0.15–0.2 measured from the registered photographs, so the outer disk is carried by
    the arms. Young light leans 40% toward composite blue (a display choice).
- **M82 wind.** Its filament noise was sampled far finer than the 64³ noise texture,
  which drew speckle. Filaments are now about eight times longer along the outflow
  than across it.
- **Look-dev harness.** The page clears to opaque black, as the app does (`f72c3b8`).
  Before that, readback un-premultiplied and clipped the emissive light.

### Look-dev comparison with the 9 November baseline

The `ovu-galaxy-realism` look-dev loop was re-run on this code:
`scripts/galaxy-lookdev/capture.mjs --software` (SwiftShader, 900×900, DPR 1, no optics,
Earth's view, north up). Values are baseline render → this render / registered image.
The baseline is commit `bafc5a4`, from [the tooling report](GALAXY_REALISM_TOOLING_20261109.md).

| Galaxy            | saturation            | colourGradient        | darkLaneFraction      | pinkFraction          | concentration         | fineStructure         |
| ----------------- | --------------------- | --------------------- | --------------------- | --------------------- | --------------------- | --------------------- |
| M51               | 0.034 → 0.241 / 0.212 | 1.021 → 1.349 / 1.259 | 0.000 → 0.012 / 0.019 | 0.000 → 0.070 / 0.043 | 2.403 → 2.731 / 2.991 | 0.108 → 0.087 / 0.089 |
| M81               | 0.020 → 0.297 / 0.230 | 1.032 → 0.770 / 0.808 | 0.000 → 0.000 / 0.000 | 0.000 → 0.040 / 0.015 | 2.804 → 2.465 / 2.612 | 0.067 → 0.030 / 0.034 |
| NGC 1300          | 0.034 → 0.226 / 0.226 | 1.044 → 1.453 / 1.438 | 0.000 → 0.004 / 0.010 | 0.000 → 0.007 / 0.008 | 2.591 → 2.615 / 2.656 | 0.079 → 0.061 / 0.076 |
| M33               | 0.025 → 0.220 / 0.167 | 1.016 → 1.000 / 1.119 | 0.000 → 0.000 / 0.002 | 0.000 → 0.246 / 0.065 | 2.478 → 2.471 / 2.726 | 0.093 → 0.084 / 0.129 |
| M101              | 0.028 → 0.166 / 0.165 | 1.020 → 1.086 / 1.198 | 0.000 → 0.022 / 0.049 | 0.000 → 0.002 / 0.004 | 2.182 → 2.521 / 2.733 | 0.175 → 0.129 / 0.131 |
| M104 (procedural) | 0.027 → 0.196 / 0.109 | 1.008 → 0.967 / 0.933 | 0.000 → 0.022 / 0.026 | 0.000 → 0.000 / 0.000 | 2.240 → 2.180 / 2.304 | 0.028 → 0.018 / 0.043 |

- **Grey baseline is gone.** Saturation moved from 0.02–0.03 to within about 0.07 of
  each telescope image. Core-to-disk colour now separates in the image's direction
  (M81 bluer outside and redder inside). Dust lanes and H II knots, absent from every
  baseline render, now appear.
- **Overshoots and shortfalls:**
  - M33 has about four times the image's pink (H II) fraction, because its outer
    disk is fainter than in the image.
  - M51 and M81 are slightly more saturated than their images.
  - M104's warm bulge is more saturated than the image (0.196 against 0.109). Its
    dust ring is now a dark silhouette instead of the baseline's light band, but it
    crosses north of the nucleus where the image has it south (catalogue near side).
  - Concentration stays below the references: the photographs' cores are brighter
    and their frames crop the disks.
- **Orientation and winding:** every sheet agrees with its image in arm winding, bar
  and major-axis angle. NGC 1300 agrees only since the parity correction; before it,
  render and image differed by about 50° and a mirror.
- Read these as direction of change only. The baseline table used 600-px crops and
  these use full 900-px renders, and every indicator depends on crop, companions,
  foreground stars and the images' display stretch. The sheets are in
  `.taste-skill/lookdev-final/`, which Git ignores.

## Stable map normalisation, 10 November 2026 (pushed, not deployed)

`npm run derive:galaxy-disk-maps` re-encoded whole maps after geometry changes of about
1e-11, far below anything visible. Normalising Earth's direction in the M81 near-side change
re-encoded M33's and the Cartwheel's young maps. A trial normalisation of the sky-orientation
quaternion moved NGC 1300's `detail.scale` by 2%
([near-side report](GALAXY_NEAR_SIDE_20261110.md#m81-follow-up-latest)). The normalisation
is now stable, and re-deriving every map changed only the scales of the young and old maps.

### Causes

Each cause was found by re-deriving every map with a perturbed orientation, in scratch
worktrees that were not committed.

- **A stride over a filtered list.** Each young map's peak was the 99.95th percentile of
  every third texel in the list of positive texels. When one texel crossed zero, the
  subsample shifted.
- **Round-off counted as light.** Where the light is exactly zero, round-off in the running
  sums of the envelope's blur leaves the envelope slightly negative (to −8e-19). So
  `young = light − envelope` came out positive, at most about 1e-18, or 1e-15 of the
  face-on noise.
  - These texels were from 0.05% (M101) to 30% (the Cartwheel) of the texels counted as
    positive: 82,133 in M51 and 757,728 in the Cartwheel.
  - Whether they are positive depends on the round-off, which any upstream change
    reshuffles. A 1e-11 rad rotation of the orientation flipped 3,115 of them in M51 and
    3,497 in the Cartwheel.
  - With the stride removed, the percentile's rank still moves by one for every 2,000
    texels that cross zero. Under that rotation M51's young peak moved by 0.16%.
- **Unrounded scales.** The old (smooth) map's peak is a maximum. Under a perturbation,
  Hoag's Object's peak moved by one float32 step (1 part in 9 million). The encoding used
  that exact scale, so the change reached every texel of the map; one block, where a texel
  sat at a rounding boundary, changed.

### Change

In `scripts/derive-galaxy-disk-maps.ts`, only the normalisation changed:

- The young peak is the 99.95th percentile of every texel above 1e-9 of the face-on noise,
  with no subsample.
  - In all seven maps the round-off lies at or below 1e-15 of the noise, and real young
    light starts above 1e-12, so the floor sits in an empty gap.
  - Besides the round-off, it leaves out four texels, all in the Cartwheel and far below
    what the 8-bit map can show.
- The young and old peaks are rounded to four significant digits before they set each
  map's encoding scale.
- The other percentiles and strided loops were checked and left alone:
  - The sky level and noise use a fixed subsample of the photograph's border.
  - The stride-13 percentile only scales an ignored diagnostic image.
  - Mean colours and radial profiles stride over the unfiltered texel index.
  - Part atlases take their peak from the photograph plane, which no orientation change
    touches.

### Re-derived maps

Every map was re-derived once (`npm run derive:galaxy-disk-maps`). The seven young and
seven old maps were re-encoded. The dust maps and part atlases are byte-identical. In the
metadata only `detail.scale` and `smooth.scale` changed.

| Galaxy        | `detail.scale`               | `smooth.scale` | Young light change, per texel / 8×8 means | Clipped texels  |
| ------------- | ---------------------------- | -------------- | ----------------------------------------- | --------------- |
| M51           | 0.443382 → 0.450761 (+1.66%) | −0.013%        | 2.81% / 0.35%                             | 0.054% → 0.050% |
| M81           | 0.137616 → 0.139457 (+1.34%) | +0.003%        | 2.93% / 0.53%                             | 0.016% → 0.016% |
| M101          | 0.710164 → 0.71 (−0.02%)     | +0.004%        | 1.14% / 0.14%                             | 0.002% → 0.002% |
| M33           | 0.33065 → 0.336522 (+1.78%)  | −0.001%        | 2.55% / 0.48%                             | 0.032% → 0.029% |
| NGC 1300      | 0.380427 → 0.39 (+2.52%)     | +0.002%        | 2.64% / 0.35%                             | 0.021% → 0.018% |
| Cartwheel     | 0.534602 → 0.55837 (+4.45%)  | −0.006%        | 2.38% / 0.66%                             | 0.155% → 0.118% |
| Hoag's Object | 0.479547 → 0.512935 (+6.96%) | −0.006%        | 3.36% / 1.97%                             | 0.037% → 0.030% |

- The young scales rose because the round-off texels no longer pad the percentile's
  population. M101 has almost none. Removing the stride alone would have moved the young
  scales by −0.9% to +0.9%.
- The renderer multiplies each map by its stored scale. A new scale therefore changes the
  rendered light only through 8-bit quantisation, JPEG encoding and clipping.
- Light changes are the RMS change in rendered young light, weighted by luminance. For
  comparison, one more quality-90 JPEG generation of the same maps alone changes them by
  0.8–1.3% per texel and 0.19–0.37% on 8×8 means.
- The larger changes in Hoag's Object and the Cartwheel are in their brightest knots, which
  now clip less.
  - Blocks that held a clipped texel (133 and 586) carry 96% and 82% of the squared
    change. The other blocks change by 0.48% and 0.33%.
  - Total young light rose by 0.19% and 0.09%.

### Verification

**Stability under 1e-11 changes.** Each perturbation was applied in its own scratch worktree,
and every map was re-derived. The table lists the outputs that differ from an unperturbed run
of the same script.

| Perturbation                                                      | Script before this change                                     | Stride removed only                                          | This change      |
| ----------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------ | ---------------- |
| Sky-orientation quaternion normalised (length off by 2e-13–6e-12) | 2 maps re-encoded (NGC 1300 scale +2.00%); 1 block of a third | 1 block of 1 map                                             | 1 block of 1 map |
| Earth's direction left unnormalised (changes up to 1.0e-11)       | 2 maps re-encoded (M81 change)                                | Identical                                                    | Identical        |
| Rotated by 1e-11 rad about (0.6, 0.48, 0.64)                      | Not run                                                       | 2 maps re-encoded (M51 scale −0.16%); 1 block each of 2 more | Identical        |
| Rotated by 1e-11 rad about (−0.3, 0.9, 0.2)                       | Not run                                                       | Not run                                                      | 1 block of 1 map |

- **Before this change:**
  - The quaternion normalisation re-encoded NGC 1300's and the Cartwheel's young maps
    (+2.00% and +0.08%), and changed one block of Hoag's old map.
  - Adding the Earth-direction normalisation had re-encoded M33's and the Cartwheel's young
    maps, as recorded in the M81 change.
- **With the stride removed only:**
  - The first rotation re-encoded M51's and the Cartwheel's young maps (−0.16% and
    −0.012%), and changed one block each of NGC 1300's young map and Hoag's old map.
  - The quaternion normalisation changed the same block of Hoag's old map, because its
    peak moved by one float32 step.
- **With this change:**
  - In every run, the metadata, every scale and every count of lit texels were unchanged.
  - The one remaining difference, in two runs, is the same 8×8 block of M81's young map:
    30 channel values, by at most 2 levels.
  - A single texel there sits at an 8-bit rounding boundary. When its value changes in the
    last bit, it flips by one level, and JPEG spreads that over its block.
  - Any 8-bit encoding of float32 data has such texels. They can no longer re-encode a map
    or move its scale.

**Other checks:**

- **Reproducibility.**
  - Two full re-derives with this change gave byte-identical outputs: 31 maps and the
    metadata.
  - Before the change, the unchanged script reproduced every committed output byte for
    byte in this environment (sharp 0.35.5, libvips 8.18.7).
  - `npm run derive:galaxy-disk-maps -- --check` reproduces all seven disk galaxies'
    metadata.
- **Registration** (`npm run test:galaxy-disk-layer`), measured at `958bc70` and after:
  M51 0.913 → 0.913, M81 0.840 → 0.842, M101 0.917 → 0.917, M33 0.800 → 0.800,
  NGC 1300 0.929 → 0.929, Cartwheel 0.988 → 0.988, Hoag's Object 0.826 → 0.829.
- `npm run test:galaxy-observed`, `npm run test:galaxies` and `npx tsc --noEmit` pass. No
  test was changed.
- **Look-dev:** no visible change.
  - Captured with
    `scripts/galaxy-lookdev/capture.mjs --galaxies m51,m81 --views earth --software`
    (headless Chromium with SwiftShader, 900×900), before from a worktree at `958bc70`
    and after on this change.
  - The renders differ by 0.028 (M51) and 0.012 (M81) of an 8-bit level on average, and by
    at most 3 levels. Only 10 and 2 pixels differ by more than 2 levels.
  - Every appearance indicator is equal to three decimals.
  - M81's after capture needed `--bake-timeout 600000`, because its bake outran the default
    240 s. The sheets were not committed.

## 3D models everywhere, 11 November 2026 (pushed, not deployed)

The owner asked for three changes after reviewing the live release. The 2D telescope
photographs should go, because the 3D reconstructions now reproduce them. The new
models should show before a galaxy is selected, not only after. And every other plotted
galaxy should be rebuilt the same way.

- **Photograph overlay removed.** `GalaxyObservedLayer` and its footprint state are
  gone, so no flat image appears from Earth's direction. The 3D reconstruction is no
  longer dimmed inside the old photograph frame, and bloom no longer switches off over
  it. The registered images remain the source of the derived maps (re-derivable with
  `npm run derive:galaxy-disk-maps`), and `test:galaxy-observed` keeps the AVM,
  landmark, orientation and near-side checks.
- **Same model before selection.** The up to eight resolved, unselected catalogue
  galaxies near the camera (`GalaxyCatalogCloud`) used the legacy preview volume. They
  now render the disk layer with 512² maps (256² on the performance tier). Only the
  selected galaxy loads full-resolution maps.
- **Population reconstructions for the remaining galaxies.** 612 models have sourced
  population recipes in `galaxy-populations.ts` (axis ratio, core, diffuse light, young
  fraction, dust, H II and named complexes), and NGC 5253 uses the default irregular
  recipe. All of them now use the disk layer:
  - Ellipticals and dwarf ellipticals or spheroidals are smooth triaxial Sérsic
    spheroids with their sourced axes, core and colours. The index is n = 4 for giant
    ellipticals (de Vaucouleurs), 3 for lenticulars, 1.5 for dwarf ellipticals and
    0.8 for dwarf spheroidals (Caon, Capaccioli & D'Onofrio 1993; Graham & Guzmán 2003;
    McConnachie 2012). Dwarf spheroidals keep faint diffuse light; their resolved star
    points carry their look.
  - Irregulars and starbursts, the LMC and SMC included, keep their old population as
    an exponential spheroid. Young light, H II and dust form a thick, lopsided, clumpy
    layer; dwarf irregulars are intrinsically thick (Roychowdhury et al. 2013). The
    sourced star-forming complexes, such as the LMC's 30 Doradus-like region, are drawn
    as 3D clumps of clusters, H II and dust.
  - 827 of 830 models now use the new layer. The Milky Way (interior-tuned), Centaurus A,
    Mayall's Object and Malin 1 keep their bespoke volumes.
- **Spheroid profile.** Bulges and spheroids use exp(−b m^(1/n)) on triaxial axes, with
  a closed-form column normaliser: 2 r q Γ(1+n) b^(−n). Existing disk bulges are
  unchanged by construction; the old fixed 0.55 is this normaliser for their profile.
- **M104.** The near side now comes from the catalogue's sourced `nearSide` (another
  session; Emsellem & Ferruit 2000), so the dust silhouette crosses south of the
  nucleus as in the Hubble image. The Sombrero now has a de Vaucouleurs (n = 4) bulge
  (Kormendy 1988; Hes & Peletier 1993), a dimmer stellar disk inside a sharper, darker
  dust ring, and a halo that reaches beyond the disk.
- **Distant markers.** The batched point-sprite impostors now take each galaxy's 3D
  colours: old disk, young light, and a separate warm core. Distant late-type spirals
  no longer show blue cores that turn warm on approach.

Limitations of this step:

- Lenticulars with only a default inclination (NGC 5866, M86, M84 and Fornax A use 0°
  or 48°) are shown as smooth spheroids with their measured projected shape. NGC 5866's
  edge-on dust lane needs a sourced inclination first.
- Shapes in depth, clump layouts between named complexes and dwarf colours are
  reconstructions.
- GPU cost is not measured. Each resolved preview now ray-marches the disk layer
  instead of the cheaper legacy preview. Measure with `ovu-perf-evidence` before
  release.

## Known limitations

- Vertical structure, far sides, companion depths and the views away from Earth are
  illustrative reconstructions, labelled as such.
- Photographs crop some disks (M81 to about 0.7 R, M101 to about 0.6 R); outside the frame a
  procedural continuation matched to the measured radial profile is shown.
- The Antennae's long tidal tails lie outside the Hubble frame and are not reconstructed.
  Webb images (Cartwheel, Quintet) use assigned infrared colours.
- Dust is inferred from reddened darkening in display-stretched images, not from far-infrared
  dust maps.
- Photographed bulges keep the image's display-stretched (flat-topped) profile as their
  light, so M81's large bulge reads as a bright, rounded plateau from the side rather than
  a centrally concentrated glow. A fix would un-stretch parts before extrusion.
- Generated (procedural) spirals now have warm cores and less haze, but their arms are
  still greyer and their interarm disks brighter than in the photographed galaxies.
- M104's near side appears flipped relative to the Hubble image (catalogue orientation;
  not changed here). Since sourced and corrected, with M81's: see
  [GALAXY_NEAR_SIDE_20261110.md](GALAXY_NEAR_SIDE_20261110.md).
- Not run: authenticated full app, `build:cloudflare` (needs the approved public Supabase
  configuration), physical devices, GPU frame-time measurement.
