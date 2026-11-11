# Sourced near sides for inclined galaxies: M104 and M81, 10 November 2026

M104's near side was sourced first (sections "M104" below). M81's followed the same day; its section comes first because it is the latest change.

## M81 follow-up (latest)

**Result.** M81's near side is the west-southwest half of its minor axis (PA 247°). Three refereed papers state it, using two independent methods. It is now recorded on M81's catalogue record, and its face-on maps are re-derived. The validation checks the photograph's weaker silhouette with its own documented test. Distance, inclination (62°), position angle (157°) and host membership are unchanged. Before this change, the convention made the ENE half (PA 67°) the near one. The reconstruction therefore silhouetted its dust against the wrong side of the bulge.

### Sources

All three were read in full from arXiv in this session. Journal volumes and pages come from their ADS and repository records. Their DOIs could not be checked here, so none is recorded.

1. **Dust silhouette.** Li, Li, García-Benito & Feng 2022, ApJ 928, 111 ([arXiv:2111.06683](https://arxiv.org/abs/2111.06683)), §3.2.2: "From the optical image of M81 in Figure 1, which exhibits more prominent extinction features on the southwestern side of the disk, we can conclude that this side is the near side. Accordingly, it can be inferred that the disk rotates counterclockwise, which is consistent with a trailing spiral arm pattern."
2. **Kinematics, independent of dust.** Schnorr Müller et al. 2011, MNRAS 413, 149 ([arXiv:1012.3015](https://arxiv.org/abs/1012.3015)), §4.1. The quote keeps the paper's spelling: "The stellar centroid velocity (V∗) field … displays a rotation pattern in which the SE side of the galaxy is aproaching and the NW side is receeding. Under the assumption that the spiral arms are trailing, it can be concluded that the near side of the galaxy is the SW, and the far side is the NE."
3. **The Atlas, through a refereed citation.** Rao et al. 2026, ApJ, accepted ([arXiv:2610.37661](https://arxiv.org/abs/2610.37661)), §III.1: "The M81 disk is inclined such that the western half is closer to us compared to the eastern half". The citation is Buta, Corwin & Odewahn 2007, _The de Vaucouleurs Atlas of Galaxies_. The earlier audit saw the Atlas's west near side only in a web-search summary.

SW (PA 225°) and W (PA 270°) both name the half of the disk west of the NNW–SSE major axis (PA 157°). That half's minor-axis direction is PA 247°.

The Atlas entry itself was still not read:

- With the owner's approval, the environment now allows `kudzu.astr.ua.edu`.
- The host's certificate chains through InCommon to eMudhra's emSign roots. None of the trust stores available here has them: the system and proxy bundle, Node's, and certifi 2026.10.18.
- The proxy's intercepting path fails the same upstream verification (HTTP 502), and WebFetch could not resolve the host.
- Certificate verification was not disabled.

### The photograph's silhouette is weak

The registered image is the Hubble mosaic heic0710a. It was sampled along the minor axis through its embedded AVM, as for M104.

- **M104's test does not fit M81.** It looks for the strongest dip and recovery out to half the semi-minor axis, which for M81 is 212″. That runs past the bulge into the spiral arms; along the minor axis the bulge ends at about 142″ (215″ × 0.66, as `derive:galaxy-disk-maps` outlines it). The arm and inter-arm contrast then reads as a lane on both halves: ×1.30 on the WSW half and ×1.22 on the ENE half. Inside the bulge, the same measure swings between ×1.05 and ×1.23 when the axis is turned by ±5°. A lowered threshold on it would pass or fail by chance.
- **Inside the bulge (20–140″), the tilt shows.** The dust in front of the near half dims and reddens the bulge light behind it, the classical tilt criterion:
  - The WSW half is dimmer than the ENE half (median light ratio ×0.87) and redder (blue/red ×0.73).
  - Control: the two halves of the major axis lie at equal depth, and their light differs by 3.5%. The minor-axis dimming is 4.2 times larger. Colour alone is not a clean signal, because the major-axis halves differ by 11% in colour.
  - Reddened lanes cross the WSW half 58–67″ out and near 120″. In the first, the light falls from 0.62 to 0.41 and blue/red from 0.80 to 0.39, then both recover. The deepest lane dims the light ×1.19 against its neighbours 6″ either side. On the ENE half the deepest is ×1.04, and the light falls off smoothly.
- The silhouette is 10–30%, against ×6 for M104. The photograph corroborates the published near side; it does not establish it.

### Change

- **`src/stars/galaxy-catalog.ts`.** M81's record has `nearSide: { pa: 247, method: "dust-silhouette", evidence, source }`. The evidence summarises the sources and the measurement above. The source quotes Li et al. and Schnorr Müller et al. and cites the Atlas through Rao et al.
- **`scripts/galaxy-observed-layer-validation.ts`.**
  - M104 keeps the strong test, unchanged.
  - `WEAK_SILHOUETTES` lists photographs whose silhouette is too weak for that test, each with its reason and its bulge window. Only M81 is listed, with 20–140″. Its test requires all of:
    1. the near half dimmer than the far half (light ratio below 0.9);
    2. the near half redder (blue/red ratio below 0.85);
    3. a dimming at least three times the light difference between the two major-axis halves;
    4. the deepest reddened lane on the near half, at least ×1.1.
  - A listed photograph that passes the strong test fails the suite. The list therefore cannot move a strong case onto the weaker thresholds.
  - M81's near side is asserted at PA 247°, as M104's is at 180°.
- **`src/stars/galaxy-observed-projection.ts`.** `earthDirectionLocal` normalises its result, as its comment promises. The reversed orientation exposed a numerical defect:
  - Sky orientations are built from a 10-digit ICRS-to-Galactic matrix, so their quaternions are unit only to about 1e-11. The worst of the 796 sky-oriented models is 1.3e-11.
  - M81's Earth direction came out 1 − 8.3e-12 long and failed the existing 1e-12 unit-vector check. The check was not relaxed.
- **Maps.** `npm run derive:galaxy-disk-maps` regenerated M81's young, old and dust maps. Its bulge atlas is byte-identical. The metadata moved slightly:
  - map scales by −0.34% and +0.06%;
  - vertical-profile parameters by at most 1.5%;
  - colours in the fourth decimal.

  The bulge's measured core radius (0.458) is unchanged.

- **Side effect on M33 and Cartwheel.** The normalisation also re-encoded their young maps.
  - `derive:galaxy-disk-maps` takes each young map's peak as the 99.95th percentile of a stride-3 subsample of its positive pixels. When one pixel crosses zero, the subsample shifts.
  - Their `detail.scale` moved by −0.25% and −0.11%, and their rendered young light by 2.6% and 2.1% RMS. For comparison, one more quality-90 JPEG generation of the same maps alone differs by 1.4% and 1.1%.
  - Their registration is unchanged (0.800 and 0.988).
  - Normalising the quaternion itself would have re-encoded four galaxies, including a 2% change to NGC 1300's scale. That option was not taken.

### Why the maps needed re-deriving

- Reversing the tilt keeps the disk plane's projection on the sky except for perspective. Perspective moves a map point by Δz = 2z²(R/D) sin i along the minor axis, in the same direction on both halves. For M81 (R/D = 3.75 × 10⁻³) that is 0.66% of the radius at the rim.
- Measured between the old and new maps, the shift is 0.2 px at the centre and up to 3.3 px (0.37% of R) at 0.72 R. The prediction there is 3.0 px.
- The new maps correlate with the old ones at r = 0.94 (young detail), 0.96 (dust) and 0.9999 (smooth light), but with mirrored copies only at 0.28–0.59. They are warped, not mirrored.
- Fine registration with the photograph, on a 360 × 360 disk-plane grid (a scratch measurement):

| Orientation    | Maps                | r     | Gradient r |
| -------------- | ------------------- | ----- | ---------- |
| near WSW (new) | re-derived          | 0.863 | 0.634      |
| near WSW (new) | old, not re-derived | 0.837 | 0.470      |
| near ENE (old) | old                 | 0.844 | 0.598      |

Without re-deriving, the new orientation would have shown the photograph's structure misregistered by up to 3 px. `test:galaxy-disk-layer` samples a 72 × 72 grid, which is too coarse to see this. It reports 0.840, against 0.835 before.

### Verification

All checks ran in a cloud session on `claude/vibrant-shannon-o27jcc`, after the merge described under "Integration".

- `npx tsc --noEmit` exits 0.
- `npm run test:galaxy-observed` passes:
  - M81, weak test: near half ×0.87 light and ×0.73 blue/red; major-axis halves ×1.04; reddened lane ×1.19 at 122″, against ×1.04 on the far half. The strong test reads ×1.30 near and ×1.22 far.
  - M104, strong test, unchanged: ×6.4, reddened ×0.41; far half ×1.02.
  - Near side: 2 sourced, 198 on the default convention.
- `npm run test:galaxy-disk-layer` and `npm run test:galaxies` pass.
- `derive-galaxy-disk-maps --check` reproduces the metadata of all seven disk galaxies. Re-deriving M81, M33 and Cartwheel reproduces their maps byte for byte.
- Mutations, each failing the suite for the intended reason:

| Mutation                                                     | Fails with                                         |
| ------------------------------------------------------------ | -------------------------------------------------- |
| M81 recorded on the ENE half (PA 67°), its assertion removed | weak test: light ×1.16, blue/red ×1.37, lane ×1.04 |
| M104 added to the weak list                                  | "passes the strong silhouette test; remove it"     |
| M81 removed from the weak list                               | strong test: ×1.30 near, ×1.22 far                 |
| Tilt reversal disabled                                       | M81's sourced near side is 180° off                |
| Earth-direction normalisation removed                        | the unit-vector check (length 1 − 8.3e-12)         |

- **Robustness of the weak test** (a scratch run):
  - M81 passes every variant with the axes turned up to ±5°, the band at ±12–35″, the window at 20–120″, 30–140″, 20–160″ or 10–140″, and steps of 1–2″.
  - With the near side on the ENE half, it fails every variant (light ×1.11–1.20, blue/red ×1.31–1.48).
  - Turned ±10°, single criteria fail: the major-axis tie falls to 2.6×, or a lane reads ×1.09 with a ±35″ band.
  - This margin matters, because M81's kinematic major axis (about 150–153°) differs from the photometric 157° by about 5°.
- **Look-dev, Earth view** ([`galaxy-lookdev-m81-near-side-20261110/`](galaxy-lookdev-m81-near-side-20261110/)). Headless Chromium with SwiftShader, before (merge commit `5d8866d`, served from a separate worktree) and after. The photograph's test was applied to the 900-px renders:

| Minor axis, 20–140″             | Photograph    | Render before | Render after |
| ------------------------------- | ------------- | ------------- | ------------ |
| WSW half / ENE half, light      | ×0.87         | ×1.35         | ×0.59        |
| WSW half / ENE half, blue/red   | ×0.73         | ×1.08         | ×0.49        |
| Major-axis halves, light        | ×1.04         | ×1.03         | ×1.03        |
| Deepest reddened lane, WSW half | ×1.19 at 122″ | ×1.05 at 65″  | ×1.14 at 68″ |
| Deepest reddened lane, ENE half | ×1.04         | none          | none         |

Before the change, the render dimmed the wrong half of the bulge. After it, the dust arcs cross the west side of the bulge as in the photograph, with a lane near 65″. The render's asymmetry is stronger than the photograph's (×0.59 against ×0.87). That is a dust-amplitude limit of the reconstruction, not an orientation question, and it was not changed.

- **Other suites passed:** `test`, `test:catalog`, `test:consistency`, `test:nearby-catalog`, `test:nearby-expansion`, `ingest:nearby-catalog -- --check`, `test:galaxy-explorer`, `test:galaxy-entry`, `test:navigation`, `test:exploration-camera`, `test:galaxy-clarity`, `test:galaxy-landmarks`, `test:galaxy-populations`, `test:galaxy-empty-space`, `test:scene-depth`, `test:rendering`, `test:visual`, `test:3d`, `test:extragalactic`, `test:nebulae`, `test:black-holes`, `test:compact`, `test:solar-controls`, and the two Andromeda scripts.
- **Could not run here:** `test:nearby-regressions`. Its catalogue checks pass, but its `nearby-source-crosscheck` step needs a local download under `.cache/nearby-catalogue-sources/`. That folder is gitignored and absent in a fresh cloud checkout. That run rewrote `docs/nearby-galaxy-checks.json`, which was restored to the committed version rather than committed.
- **Not run:** the full or authenticated app, `build:cloudflare`, physical devices, real-GPU timing, and the multi-angle cross-fade page. No shader changed.

### Integration

`336caaf`, the M104 commit, had not been merged into `migration/supabase-cloudflare`, which had moved on by six commits after `f72c3b8`: the NGC 1300 registration fix, crisp tilted disks, measured spheroid cores, procedural tuning and look-dev changes. This branch fast-forwards to `336caaf` and then merges `migration/supabase-cloudflare`. M81's maps were therefore derived with the current script, which records each bulge's measured core radius. A core from the old orientation could otherwise have survived a later merge.

- Only `docs/PROJECT_HANDOFF.md` conflicted, and both new sections were kept.
- On the merged tree, before any M81 change, `tsc`, `test:galaxy-observed`, `test:galaxy-disk-layer` and `test:galaxies` passed, and `derive-galaxy-disk-maps --check m81` reproduced M81's metadata.

## M104: what and why

A catalogue inclination (0–90°) and position angle fix a disk's tilt only up to one choice: which half of the minor axis is nearer to us. `observedSkyQuaternion` (`src/stars/galaxy-sky-orientation.ts`) made that choice by convention, tilting the half toward PA + 90° away from the Sun. For M104 (PA 90°) that put the north half nearer. The Sombrero's dust ring therefore crossed the bulge **north** of the nucleus in the render. In the registered Hubble image it crosses **south** of the nucleus, with the far side of the disk visible above it as a bright band.

This is a per-object orientation fact, not a look change. It is now recorded with its source on M104's catalogue record and applied by the orientation code. Distances, inclinations, position angles and host membership are unchanged.

## M104: evidence

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

## M104: change

- `SkyNearSide` in `galaxy-sky-orientation.ts`: the PA of the nearer minor-axis half, the method (`"dust-silhouette"`), the evidence and the citation. `SkyOrientation.nearSide` is optional. Without it, the existing convention applies (the half toward PA − 90° is nearer), and the code comment says that this is a convention.
- M104's record in `src/stars/galaxy-catalog.ts` has `nearSide: { pa: 180, method: "dust-silhouette", evidence, source }`, next to its inclination and position angle. `galaxy-models.ts` copies `nearSide` into the sky orientation, for curated and imported records alike.
- A near side on the PA + 90° half reverses the tilt, so the inclination changes sign. For M104 this turns the model 168° about its major axis. This choice keeps the disk plane's projection on the sky unchanged and changes only depth, so photo-derived face-on maps are unaffected apart from perspective. The other way to move the near side, a 12° rock through the sky plane, would mirror those maps.
- M104 is procedural and has no derived maps. Its registered image is re-projected through the same orientation, and that registration is re-tested below. The model's spin direction remains illustrative: it was not set from M104's measured velocity field before, and it is not now.

## M104: verification

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

| Galaxy   | i, PA     | Near half now                                              | Published near side                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Photograph, minor axis                                                                                                                                                     | Action                                                          |
| -------- | --------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| M81      | 62°, 157° | PA 247° (WSW), sourced. It was PA 67° (ENE) by convention. | SW: Li et al. 2022, ApJ 928, 111, §3.2.2 ([arXiv:2111.06683](https://arxiv.org/abs/2111.06683)), from dust extinction; Schnorr Müller et al. 2011, MNRAS 413, 149, §4.1 ([arXiv:1012.3015](https://arxiv.org/abs/1012.3015)), from the stellar velocity field under trailing arms. W: the de Vaucouleurs Atlas (Buta, Corwin & Odewahn 2007), as cited by Rao et al. 2026, ApJ ([arXiv:2610.37661](https://arxiv.org/abs/2610.37661)). The [online Atlas entry](https://kudzu.astr.ua.edu/devatlas/NGC_3031______B___________.html) itself could not be read from the cloud environment. | Weak but consistent: inside the bulge the WSW half is ×0.87 in light and ×0.73 in blue/red, with reddened lanes at 58–67″ and about 120″. The ENE half falls off smoothly. | **Recorded (PA 247°); maps re-derived. See the M81 follow-up.** |
| M82      | 80°, 65°  | PA 335° (NNW), by convention                               | Northwest. Shopbell & Bland-Hawthorn 1998, ApJ 493, 129 ([doi:10.1086/305108](https://doi.org/10.1086/305108)): "the nearer edge of the galaxy is projected on the northwest side of the nucleus". Contursi et al. 2013, A&A ([doi:10.1051/0004-6361/201219214](https://doi.org/10.1051/0004-6361/201219214)): the approaching southern wind is seen along "a more direct sight-line to the southern part of the disk".                                                                                                                                                                  | Not decisive: reddened dips on both halves of the dusty starburst core.                                                                                                    | Already consistent; no change.                                  |
| NGC 4565 | —         | —                                                          | —                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | No registered image.                                                                                                                                                       | Not audited.                                                    |

M33 (54°), NGC 1300 (45°), the Tadpole (58°, a merger shown on a sky sheet) and the lower-inclination galaxies were not audited. On these, the photograph profile measures arm and inter-arm contrast, not a bulge silhouette.

At the time of the M104 change, M81 was left unchanged because its face-on maps had been derived from the photograph through its convention orientation. The M81 follow-up above records the near side and re-derives the maps. The reversal keeps the disk plane's projection on the sky except for perspective, which moves the rim by 0.66% of the radius, and the disk's only extruded part is its centred, symmetric bulge.

## Next steps

1. **M81: done** (the follow-up above). Optionally, read the Atlas entry on a machine whose trust store has eMudhra's emSign roots, and quote it in M81's `source`.
2. **Make `derive:galaxy-disk-maps` stable under tiny geometry changes: done** ([stable map normalisation](GALAXY_3D_RECONSTRUCTION_20261109.md#stable-map-normalisation-10-november-2026-pushed-not-deployed)). Removing the stride was not enough on its own: envelope round-off also changed the count of positive texels, and the old map's unrounded peak could move. Every map was re-derived once, and registration and look-dev were re-checked. Originally: each young map's peak was the 99.95th percentile of a stride-3 subsample of its positive pixels. A 1e-11 change in orientation could shift that subsample, which re-encoded the map (as happened to M33 and Cartwheel here) and moved NGC 1300's scale by 2% in a trial.
3. **M81's silhouette in the reconstruction is darker than in the photograph.** Inside the bulge, the render dims the near half to ×0.59 of the far half, against ×0.87 in the photograph. Any fix belongs to the dust amplitude of the disk layer (`ovu-galaxy-realism`), with before and after sheets.
4. **M82, optional.** Record its near side (PA 335°) as sourced. This needs a method value for wind obscuration. It changes nothing visually but guards the current orientation.
