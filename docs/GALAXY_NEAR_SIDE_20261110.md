# Sourced near side for inclined galaxies: M104, 10 November 2026

## What and why

A catalogue inclination (0–90°) and position angle fix a disk's tilt only up to one choice: which half of the minor axis is nearer to us. `observedSkyQuaternion` (`src/stars/galaxy-sky-orientation.ts`) made that choice by convention, tilting the half toward PA + 90° away from the Sun. For M104 (PA 90°) that put the north half nearer. The Sombrero's dust ring therefore crossed the bulge **north** of the nucleus in the render. In the registered Hubble image it crosses **south** of the nucleus, with the far side of the disk visible above it as a bright band.

This is a per-object orientation fact, not a look change. It is now recorded with its source on M104's catalogue record and applied by the orientation code. Distances, inclinations, position angles and host membership are unchanged.

## Evidence

**1. The registered photograph (measured here).** The Hubble Heritage mosaic opo0328a (`public/textures/galaxies/m104.jpg`) was sampled along M104's minor axis through the image's own embedded AVM coordinates, starting from the catalogued nucleus. The table gives linear luminance (Rec. 709, linear sRGB), averaged across ±6″, and the blue/red ratio.

| Offset from nucleus        | 9″   | 12″      | 15″      | 18″      | 21″  | 24″  |
| -------------------------- | ---- | -------- | -------- | -------- | ---- | ---- |
| North (PA 0°): luminance   | 0.83 | 0.78     | 0.73     | 0.69     | 0.64 | 0.59 |
| South (PA 180°): luminance | 0.80 | **0.29** | **0.22** | **0.24** | 0.58 | 0.60 |
| South: blue/red            | 1.10 | **0.59** | **0.23** | **0.31** | 1.01 | 1.12 |

To the south, the light falls to about a third of its surroundings and reddens strongly 12–18″ from the nucleus, then recovers. To the north it declines smoothly. The position fits the ring's geometry. De Looze et al. (2012, Table 2) place its dust peaks at radii of 6.1–8.75 kpc for a distance of 9.2 Mpc, which is 2.3′–3.3′. Seen at 84°, those radii lie 14–21″ from the nucleus along the minor axis.

**2. Literature.**

- Emsellem & Ferruit 2000, A&A 357, 111 ([arXiv:astro-ph/0003167](https://arxiv.org/abs/astro-ph/0003167)), §4, discussing HST images rotated "north up, east to the left": a weak northern counterpart of the nuclear dust lane "could be attributed to the fact that this second dust lane would be located on the far (north) side of the galaxy". They model two symmetric filaments in the equatorial plane, using the luminosity model of Emsellem (1995). The model predicts that the apparent extinction "should rapidly decrease northward". They adopt i = 84° ± 2° (Emsellem et al. 1996, A&A 312, 777).
- De Looze et al. 2012, MNRAS 419, 895 ([doi:10.1111/j.1365-2966.2011.19759.x](https://doi.org/10.1111/j.1365-2966.2011.19759.x)) fit a radiative-transfer model at 84° to the minor-axis extinction profiles. They note that Emsellem (1995) derived his absorption map "in the southern part of M104".
- Method: Iye, Tadaki & Fukumoto 2019, ApJ ([doi:10.3847/1538-4357/ab4a18](https://doi.org/10.3847/1538-4357/ab4a18)). "It is now generally accepted that the dust-lane-dominant side of the minor axis is the near side", because dust lanes "are silhouetted against the background light of the stellar bulge". This reading is confirmed independently, by globular-cluster reddening, only for M31. Their 146 spirals are all consistent with it under trailing arms.
- The catalogue's i = 84° and PA = 90° are the commonly adopted values (Krause et al. 2006, A&A 448, 133, [doi:10.1051/0004-6361:20053789](https://doi.org/10.1051/0004-6361:20053789)). They are unchanged.

Press captions were not used. A web search found the Hubble Heritage caption saying we see the galaxy from "six degrees north of its equatorial plane", which agrees with a southern near side. An archived Spitzer caption says "south", which does not.

## Change

- `SkyNearSide` in `galaxy-sky-orientation.ts`: the PA of the nearer minor-axis half, the method (`"dust-silhouette"`), the evidence and the citation. `SkyOrientation.nearSide` is optional. Without it, the existing convention applies (the half toward PA − 90° is nearer), and the code comment says that this is a convention.
- M104's record in `src/stars/galaxy-catalog.ts` has `nearSide: { pa: 180, method: "dust-silhouette", evidence, source }`, next to its inclination and position angle. `galaxy-models.ts` copies `nearSide` into the sky orientation, for curated and imported records alike.
- A near side on the PA + 90° half reverses the tilt, so the inclination changes sign. For M104 this turns the model 168° about its major axis. This choice keeps the disk plane's projection on the sky unchanged and changes only depth, so photo-derived face-on maps are unaffected apart from perspective. The other way to move the near side, a 12° rock through the sky plane, would mirror those maps.
- M104 is procedural and has no derived maps. Its registered image is re-projected through the same orientation, and that registration is re-tested below. The model's spin direction remains illustrative: it was not set from M104's measured velocity field before, and it is not now.

## Verification

All checks ran in a cloud session on `claude/great-ramanujan-r2pi5b`, which starts from `migration/supabase-cloudflare` at `f72c3b8`.

**Look-dev, Earth view** (`docs/galaxy-lookdev-m104-near-side-20261110/`). A luminance profile through the nucleus of the north-up 900-px render was measured before and after the change:

- Before: a lane north of the nucleus, with the light recovering ×19 beyond it 40 px out, and none to the south (×1.02).
- After: none to the north (×1.02), and a lane 44 px south of the nucleus, with the light recovering ×21.5 beyond it.

The rotation-invariant sheet indicators are unchanged within 0.015.

**Cross-fade.** The multi-angle QA page's front pose at 1.1 disk radii shows the photograph at 0.42 weight over the reconstruction. The frames were compared at equal distances from each frame's core:

- Before the change, the reconstruction's lane made the bulge 80–140 px north of the core 14–23% darker than after.
- Before the change, reconstructed light also filled in the photograph's lane south of the core, which was 26–50% brighter 60–80 px south than after.

After the change, the two lanes coincide. The oblique, edge and back poses are unchanged, as expected for a symmetric model, and the pages logged no errors.

**`npm run test:galaxy-observed`** gained three checks:

1. A sourced near side lies on the minor axis, carries evidence and a citation, and is the nearer half.
2. The other 199 inclined models keep the default convention, so no other galaxy moved.
3. A dust-silhouette near side is visible in the registered photograph. For M104 the light recovers ×6.4 beyond the lane and is reddened ×0.41 on the recorded half; on the far half it recovers only ×1.02.

Two mutations were tried. Disabling the tilt reversal, and recording PA 0° with the M104 assertion removed, both fail the suite.

**Suites.**

- Passed: `test:galaxy-observed`, `test:galaxies` and `test:galaxy-disk-layer`.
- Also passed: `test`, `test:catalog`, `test:consistency`, `test:nearby-catalog`, `test:galaxy-explorer`, `test:galaxy-entry`, `test:navigation`, `test:exploration-camera`, `test:galaxy-clarity`, `test:galaxy-landmarks`, `test:galaxy-populations`, `test:galaxy-empty-space`, `test:scene-depth`, `test:rendering`, `test:visual`, `test:3d`, `test:extragalactic`, `test:nebulae`, `test:black-holes`, `test:compact`, `test:solar-controls`, and the Andromeda expansion and remaining scripts.
- `npx tsc --noEmit` exits 0. ESLint and Prettier are clean on the changed files.
- `test:nearby-expansion` and `ingest:nearby-catalog -- --check` fail exactly as they did before the change. This is the recorded `mcconnachie-2021-andromeda20` last-digit drift, and the logs are identical.

**Not run:** the full or authenticated app, `build:cloudflare`, physical devices, and real-GPU timing. No shader changed; the change is a different rotation of the same model.

## Audit of other strongly inclined galaxies with registered images

| Galaxy   | i, PA     | Near half now (convention) | Published near side                                                                                                                                                                                                                                                                                                                                                                                                     | Photograph, minor axis                                                                                | Action                                   |
| -------- | --------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| M81      | 62°, 157° | PA 67° (ENE)               | West, per the de Vaucouleurs Atlas of Galaxies entry (Buta, Corwin & Odewahn 2007; [online entry](https://kudzu.astr.ua.edu/devatlas/NGC_3031______B___________.html)). The page was read only through a web search summary, because this session's network does not reach it.                                                                                                                                          | Weak support: a 12% reddened dip about 66″ out on the WSW half inside the bulge, and none to the ENE. | **Probably reversed. Not changed here.** |
| M82      | 80°, 65°  | PA 335° (NNW)              | Northwest. Shopbell & Bland-Hawthorn 1998, ApJ 493, 129 ([doi:10.1086/305108](https://doi.org/10.1086/305108)): "the nearer edge of the galaxy is projected on the northwest side of the nucleus". Contursi et al. 2013, A&A ([doi:10.1051/0004-6361/201219214](https://doi.org/10.1051/0004-6361/201219214)): the approaching southern wind is seen along "a more direct sight-line to the southern part of the disk". | Not decisive: reddened dips on both halves of the dusty starburst core.                               | Already consistent; no change.           |
| NGC 4565 | —         | —                          | —                                                                                                                                                                                                                                                                                                                                                                                                                       | No registered image.                                                                                  | Not audited.                             |

M33 (54°), NGC 1300 (45°), the Tadpole (58°, a merger shown on a sky sheet) and the lower-inclination galaxies were not audited. On these, the photograph profile measures arm and inter-arm contrast, not a bulge silhouette.

M81 was left unchanged because its face-on maps were derived from the photograph through its current orientation. The reversal leaves the disk plane's projection on the sky the same except for perspective, which moves the rim by about 0.7% of the radius. The disk's only extruded part is its centred, symmetric bulge.

## Next steps

1. **M81.** Read the Atlas entry or another source that states M81's near side. Then add `nearSide: { pa: 247, … }` to its record and re-derive its maps (`npm run derive:galaxy-disk-maps`). Check them with `npm run test:galaxy-disk-layer` and a look-dev sheet, which should show the dust lanes silhouetted on the west side.
2. **M82, optional.** Record its near side (PA 335°) as sourced. This needs a method value for wind obscuration. It changes nothing visually but guards the current orientation.
