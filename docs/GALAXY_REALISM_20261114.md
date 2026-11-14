# Galaxy realism: spirals, interiors and dwarfs (14 November 2026)

## Request

The owner said that most spiral galaxies looked fine from outside but could look more realistic. Galaxies did not look realistic once the camera was inside them, and dwarf and small galaxies did not look realistic at all. The owner asked for an analysis of colour, texture and depth, and for a premium look like SpaceEngine's (https://spaceengine.org/).

## SpaceEngine reference

- **Site not read.** spaceengine.org serves a Cloudflare bot check to automated browsers. It was not bypassed.
- **Binary not analysed.** SpaceEngine is proprietary and not installed here, so REA had no artifact to work on legitimately.
- **What was used instead.** The approach below is SpaceEngine's publicly described one:
  - Galaxies are volumes of emission and dust driven by 2D morphology maps.
  - Inside a galaxy, a procedural field of resolved stars surrounds the observer, and the volume carries the unresolved light.
  - HDR eye adaptation keeps the band bright against a dark sky.

OVU already had the first ingredient (the disk layer). This change adds the second and approximates the third.

## Diagnosis (baseline renders, headless Edge on the AMD integrated GPU)

| Symptom                                                                | Cause in code                                                                                                                                                                                     |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Generated spirals grey: white old disk and bulge, grey arms            | The bluish integrated catalogue colour, tinted at 0.25, cancelled the warm old-disk base: [1.02, 1.00, 0.98]. Young arms came out [0.83, 1.03, 1.26], and the old disk outshone them on the arms. |
| No visible dust lanes in generated spirals                             | Dust fell off with 1.35 × the short old-disk scale (0.28 radii), so lanes were optically thin beyond the inner arms.                                                                              |
| Interiors almost black: a faint brown band, few stars                  | Non-Milky-Way galaxies kept 9 % of their light × gain 2.4, against the Milky Way's 36 % × 8, which made them about 13 times darker. Inside, there was no resolved-star field near the observer.   |
| Interior band was smooth fog                                           | Grazing rays filtered the maps over each whole perspective step. The bright band was peak-compressed before the gain, which flattened band-against-sky contrast.                                  |
| Ring-shaped streaks in close interior views                            | Isotropic texture LOD on a plane seen at grazing angles (moiré), and fixed step positions through the thin layers (banding).                                                                      |
| Dwarf spheroidals were smooth beige blobs                              | Exterior star points used the broad footprint drawn for unresolved associations, so their resolved stars were invisible under the glow.                                                           |
| Dwarf irregulars sat in a wide beige halo with pink "cotton" complexes | The old envelope was wide and warm (elliptical colours). H II filled each whole complex.                                                                                                          |

## Changes (rendering only; no catalogue value, orientation or host changed)

- **`galaxy-disk-layer.ts`**
  - Colours, with Andromeda and the Milky Way unchanged:
    - Generated spirals keep only a 6 % catalogue tint on the old disk (5 % on the bulge), so both stay warm.
    - Young light leans 65 % toward [0.42, 0.64, 1].
    - Young amplitude rises from 0.55 to 0.8, so arms are blue.
  - Procedural dust:
    - The dust scale is the larger of 1.35 × the old scale and 1.3 × the young scale (Xilouris et al. 1999; Casasola et al. 2017).
    - Arm lanes are 2.6 times stronger (was 1.15) and spurs 1.0 (was 0.55).
    - Feathered dust is sheared against the arms, using the same shear as the Milky Way's sourced arms.
    - The Milky Way's sourced-arm branch is unchanged.
  - Interior light:
    - Every galaxy shares the Milky Way's [8, 0.36], plus a sky-contrast flag.
    - The Milky Way keeps its 13 November band, because the flag is off for it.
  - Dwarfs:
    - Dwarf-spheroidal glow is halved.
    - Irregular old envelopes are 0.7 × as wide (was 0.9) and 0.8 × as bright, tinted 35 % toward their young colour (dIrr colours: Hunter & Elmegreen 2006).
    - H II in named complexes glows in compact, broken cores.
- **`galaxy-volume-shader.ts`** (disk ray marcher)
  - The interior display applies an S-curve to linear light before the roll-off: faint sky × 0.4, bright band × 1.4, phased in with the reveal.
  - Interior map LOD is biased by |rd.y|^-0.4, and each step samples a golden-ratio offset per pixel. This removes the moiré and banding.
  - Interior grazing rays filter the maps over a third of each step.
  - Exterior views keep their exact previous sampling.
- **`GalaxyInteriorField.tsx` and `galaxy-star-data.ts`**
  - **Local resolved stars:** 40,000 stars in a 1,300-light-year tile.
    - The tile is clamped to 0.02–0.3 disk radii and wraps around the eye in the vertex shader. It fades before its edge.
    - Stars are weighted by the face-on light, the disk's vertical profile and the spheroid.
    - Colours follow a representative B–M mix; these are not measured stars.
    - Only inside disk-layer galaxies, and never inside the Milky Way, whose sky comes from its catalogues.
  - **Map colours:** association points in disks take the maps' colour, blue on arms and warm between them.
  - **Crisp dwarf stars:** resolved populations (dwarfs, ellipticals, irregulars) keep a crisp core and three times the flux outside.
  - Interior association points clamp their flux at 2.5 (was 4), so bright arms no longer show flat discs.
- **`scripts/galaxy-disk-layer-validation.ts`:** the default-interior assertion now expects [8, 0.36, 1].
- **New QA tooling**
  - `scripts/nearby-qa/galaxy-control-config.mts`: a read-only pinned control renderer on port 31757, using the pattern of `structure-control-config.mts`.
  - A matching `ovu-galaxy-control` entry in `.claude/launch.json`.

## Evidence

Same-pose renders, pinned `HEAD` control (left) against the change (right), in [galaxy-lookdev-realism-20261114/](galaxy-lookdev-realism-20261114/):

- [spiral-before-after.jpg](galaxy-lookdev-realism-20261114/spiral-before-after.jpg): M74, M83, M100, Andromeda, M81 and M104. The observed M81 and M104 are visually unchanged.
- [inside-before-after.jpg](galaxy-lookdev-realism-20261114/inside-before-after.jpg): the M74 and Andromeda entry poses, M74 above the disk, the LMC and the Milky Way. The Milky Way is unchanged.
- [dwarf-before-after.jpg](galaxy-lookdev-realism-20261114/dwarf-before-after.jpg): the LMC, NGC 6822, IC 10, Fornax, Leo I, M110 and WLM.

Frame times are in [frame-times.json](galaxy-lookdev-realism-20261114/frame-times.json):

- Setup: headless Edge, AMD integrated GPU through ANGLE D3D11, 1100×700 at DPR 2, optics off, idle camera, two interleaved rounds per pose.
- Result: control and change agree within run-to-run noise (about ±10 %) for the M74 interior (72–83 ms against 72–81 ms), the M74 exterior, the LMC and Fornax.
- Limits: this is a stress mode on one GPU. It does not show 60 FPS or zero regression on other hardware.

Checks run:

- `npx tsc --noEmit`, and ESLint and Prettier on the changed files.
- Test suites: `test:galaxy-disk-layer`, `test:galaxies`, `test:galaxy-clarity`, `test:galaxy-populations`, `test:galaxy-observed`, `test:galaxy-entry`, `test:galaxy-explorer`, `test:galaxy-landmarks`, `test:rendering`, `test:visual`, `test:3d`, `test:navigation`, `test:scene-depth`, `test:galaxy-empty-space`, `test:exploration-camera` and `test:solar-controls`.

## Limits and next steps

- **Exterior change is moderate.** Face-on dust can dim at most about half the light of a layer it shares, so lanes in generated spirals stay subtle. Sharper lanes would need a thinner dust layer or forward scattering (rendering-recipes §4).
- **Not run:**
  - The look-dev telescope comparison (`scripts/galaxy-lookdev/capture.mjs`) for the six registered galaxies. Their exterior shading path is unchanged; only their star-point colours now follow the maps.
  - An authenticated full-app run, physical devices and other GPUs.
- **Untested transitions.** Entry and exit brightness continuity at the moment of entry was not measured frame by frame. The S-curve phases in with the reveal (0 at the start of the flight).
- **Irregulars may be too neutral.** They may now read slightly too white-grey; the LMC's yellowish bar could be strengthened.
