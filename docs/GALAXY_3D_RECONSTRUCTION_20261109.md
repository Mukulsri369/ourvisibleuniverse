# Galaxy 3D reconstruction from all viewing angles — 9 November 2026

Status: **in progress** (draft; results and checks are filled in at the end of the task).

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

| Provider | What it offers for galaxies | Terms (as published) |
| --- | --- | --- |
| [ESA/Hubble](https://esahubble.org/copyright/) | Large processed releases, most with embedded AVM sky registration | CC BY 4.0; credit unaltered; changes noted after the credit; no implied endorsement |
| [ESA/Webb](https://esawebb.org/copyright/) | NIRCam/MIRI releases (infrared, assigned colours) | CC BY 4.0, same conditions |
| NASA / STScI (hubblesite.org, webbtelescope.org, science.nasa.gov) | Hubble and Webb releases | Generally public domain when credited to NASA/ESA/CSA/STScI; third-party credit lines can differ; NASA logos restricted |
| [ESO](https://www.eso.org/public/outreach/copyright/) | VLT/VST/VISTA wide fields (M33, LMC, SMC, Cen A, M31) | CC BY 4.0 unless noted; no implied endorsement |
| [NOIRLab](https://noirlab.edu/public/) | Gemini, Kitt Peak, CTIO releases | CC BY 4.0 for current releases; older items vary |
| [AstroPix (IPAC)](https://www.astropix.org/) | Aggregator of observatory images with AVM metadata (sky registration) | Terms of each contributing observatory |
| [ESA Euclid ERO](https://www.cosmos.esa.int/web/euclid/ero-credits) | Wide, deep near-IR/optical views of nearby galaxies | CC BY-SA 3.0 IGO or ESA Standard Licence |
| [DESI Legacy Surveys](https://www.legacysurvey.org/) | Uniform optical cutouts of most catalogue galaxies (viewer/cutout service) | Acknowledgement requested; image reuse terms not stated in the pages found |
| SDSS SkyServer, Pan-STARRS | Uniform survey cutouts | Acknowledgement requested |
| DSS (STScI) | All-sky photographic plates | No commercial use without permission (paid OVU: avoid) |
| Rubin Observatory | 2025 first-look releases | Check each release page |

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

## Scientific labelling

The derived maps are reconstruction inputs computed from published images, not new
observations. Vertical structure, the far side of each disk, everything outside a
photograph's frame and the depth of companions are illustrative. Photograph-registered
disks no longer rotate their pattern, so they stay aligned with the image.

## Results and verification

(Filled in at the end of the task.)
