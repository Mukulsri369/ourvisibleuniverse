# M81 near side: look-dev evidence, 10 November 2026

Before and after sheets for M81's sourced near side. Details are in [the report](../GALAXY_NEAR_SIDE_20261110.md). All renders were made in headless Chromium with SwiftShader, so they show appearance only, not performance.

| File                                            | What it shows                                                                                                                                                                                                                                                                                                                                                       |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `m81-earth-before.jpg`, `m81-earth-after.jpg`   | `scripts/galaxy-lookdev/capture.mjs --galaxies m81 --views earth --software`. The reconstruction is on the left and the registered Hubble image on the right, both north up with east to the left. "Before" is the merge commit `5d8866d` (near side by convention, ENE), served from a separate worktree; "after" is this change (near side WSW, maps re-derived). |
| `m81-earth-before.json`, `m81-earth-after.json` | The sheets' appearance indicators. They are rotation-invariant, so they do not register which side a lane is on, and they barely change.                                                                                                                                                                                                                            |
| `m81-bulge-before-after.jpg`                    | The bulge of the 900-px renders, enlarged ×1.5: before on the left, after on the right. After the change, thin reddish dust arcs cross the west (right) side of the bulge, as in the photograph, and the east side is smooth.                                                                                                                                       |

**Measured on the 900-px renders** (1.98″ per pixel at M81). The photograph's own test was applied to each render: medians across a ±25″ band along the minor axis through the nucleus, 20–140″ out.

| Minor axis, 20–140″                | Photograph (heic0710a) | Render before | Render after |
| ---------------------------------- | ---------------------- | ------------- | ------------ |
| WSW half / ENE half, light         | ×0.87                  | ×1.35         | ×0.59        |
| WSW half / ENE half, blue/red      | ×0.73                  | ×1.08         | ×0.49        |
| Major-axis halves, light (control) | ×1.04                  | ×1.03         | ×1.03        |
| Deepest reddened lane, WSW half    | ×1.19 at 122″          | ×1.05 at 65″  | ×1.14 at 68″ |
| Deepest reddened lane, ENE half    | ×1.04                  | none          | none         |

Before the change the reconstruction dimmed the wrong half of the bulge. After it, the dimmed and reddened half and the lane near 65″ agree with the photograph. The render's asymmetry is stronger than the photograph's (×0.59 against ×0.87), so the reconstruction's silhouette is darker than observed. That is a dust-amplitude limitation of the 3D reconstruction, not an orientation question, and it was not changed here.

The two reconstructions also differ in apparent size and placement. The look-dev camera sits about 3 disk radii from the galaxy, so the nearer half is magnified, and the change swaps which half is nearer. From the Earth, which is far enough away, the change moves the disk's rim on the sky by only about 0.7% of the radius (see the report).

The telescope image is a reduced copy of `public/textures/galaxies/m81.jpg`: Hubble mosaic heic0710a, credit NASA, ESA and the Hubble Heritage Team (STScI/AURA), acknowledgment A. Zezas and J. Huchra (Harvard-Smithsonian Center for Astrophysics). Full credit lines and terms are in `public/textures/galaxies/CREDITS.md`.
