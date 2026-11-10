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

The look-dev comparison with the 9 November baseline is being re-captured on this code and will be recorded here.

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
