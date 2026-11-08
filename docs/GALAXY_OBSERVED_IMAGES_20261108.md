# Registered telescope images for selected galaxies (2026-11-08)

Status: local commit on `migration/supabase-cloudflare`, not pushed, not deployed.

## What a visitor sees

When a galaxy with a registered telescope image is selected and viewed from the
Solar System's side, the published Hubble, Webb or VST image is shown in
place, at its measured sky position, orientation and scale. As the camera orbits
away from Earth's line of sight, or flies close, the image fades and the 3D
reconstruction carries the view. Entering a galaxy always shows the 3D star field.

The image is a measured 2D view from Earth. It is not a 3D measurement: from any
other direction the 3D model is a reconstruction, as before.

## Galaxies covered (12)

| Key              | Image                | Light                | Surface | Registration                   |
| ---------------- | -------------------- | -------------------- | ------- | ------------------------------ |
| m81              | ESA/Hubble heic0710a | optical–near-IR      | disk    | embedded AVM                   |
| m51              | ESA/Hubble heic0506a | optical              | disk    | embedded AVM                   |
| m101             | ESA/Hubble heic0602a | optical              | disk    | embedded AVM                   |
| m104             | Hubble opo0328a      | optical              | sky     | embedded AVM                   |
| m82              | ESA/Hubble heic0604a | optical              | sky     | embedded AVM                   |
| antennae         | ESA/Hubble heic0615a | optical              | sky     | embedded AVM                   |
| tadpole          | ESA/Hubble heic0206a | optical              | sky     | embedded AVM                   |
| cartwheel        | ESA/Webb weic2211a   | IR, assigned colours | disk    | embedded AVM                   |
| hoags-object     | Hubble opo0221a      | optical              | disk    | embedded AVM                   |
| catalog-ngc-1300 | Hubble opo0501a      | optical              | disk    | embedded AVM                   |
| stephans-quintet | ESA/Webb weic2208a   | IR, assigned colours | sky     | embedded AVM                   |
| m33              | ESO eso1424a (VST)   | optical              | disk    | published record + 3 landmarks |

All files were already in `public/textures/galaxies/` with credits in
`public/textures/galaxies/CREDITS.md`; no new image files were added.

"Disk" projects the image onto the measured disk plane (inclination and position
angle). "Sky" uses a sheet perpendicular to the sightline, for edge-on, irregular
and interacting systems with no single plane.

## Method

- Registration: Astronomy Visualization Metadata (ICRS, TAN) read from each file's
  XMP (`scripts/galaxy-observed-avm.mjs`). M33's file carries no spatial AVM, so
  the published record is used (ESO eso1424a; full AVM via the AstroPix mirror),
  checked against light centroids measured in the local file: the M33 nucleus
  (within 0.0006 in uv), NGC 595 and NGC 604.
- Projection: each fragment samples the image along its sightline from the Sun, so
  the image is exact from Earth's direction. A small rotation maps the model centre
  onto the catalogued nucleus.
- Fade: by angle from Earth's sightline (wider for face-on disks), by distance
  (inside about one disk radius), by on-screen size (no image on unresolved
  markers), and on galaxy entry. It does not wait for the volume's density-cache bake.
- Hand-off with the reconstruction: inside the image frame the volume and its star
  points keep 10% of their light; outside it they are unchanged, so tails and halos
  beyond the frame stay. Both cross-fade over the same 10% edge band.
- Display: images are display-referred. The light is pre-divided by the current
  exposure and the default neutral tone curve's toe and shoulder are undone, so
  the image shows as published under the production optics pipeline. Synthetic bloom
  is switched off while an image is shown, because the image already carries its
  telescope's optical response.
- Memory: only the selected galaxy's image is resident, decoded off the main thread
  at 4096, 2560 or 1536 px by quality tier.

## Scientific corrections made alongside

- Orientation: curated galaxies were oriented without their sky position. Seen from
  Earth, M51 appeared 88.7° inclined instead of 22°, M101 78.4° instead of 18°, M104
  33.7° instead of 84°. The 78 models with catalogued RA, Dec, inclination and
  position angle now use the measured on-sky orientation.
- Positions: ten hand-built reconstructions carried rounded l/b (and M87 53.0 vs
  53.5 Mly), which put the detailed body up to 4 disk radii from the catalogue body
  and the explorer's hosted-object frame (M104 1.1, M51 0.47 radii). Models now take
  the catalogue position.
- Catalogue: positions corrected against published coordinates for the Cartwheel
  (RA/Dec and l/b; about 70″ off), Hoag's Object (RA/Dec and l/b), NGC 1300, the
  Antennae, the Tadpole and Mayall's Object (l/b). `scripts/nearby-expansion-validation.ts`
  lists these as documented corrections. Nine entries whose l/b disagrees with their
  RA/Dec by 0.13–6.7° remain flagged for source verification in the new validation:
  Malin 1, GLASS-z12, M60, Hercules A, Canis Major Dwarf, M65, M66, NGC 3628, M86.
- Overview framing now looks at a visited galaxy beyond 1 Mly from the Solar
  System's side. Milky Way satellites keep the previous oblique framing.

## Verification actually run (2026-11-08/09, this workspace)

- `npm run test:galaxy-observed` (new): AVM equals each file's XMP, WCS round trip,
  nucleus inside its image, model centre lands on the nucleus, sightline invariance,
  surface corners, published-record landmarks, footprint composition in world space,
  edge cross-fade, neutral tone-curve round trip, catalogue l/b vs RA/Dec, measured
  orientation for 78 models. Passed.
- Other suites and `npx tsc --noEmit`: see the handoff entry for the exact list and
  results.
- Visual: loopback QA harness (`scripts/nearby-qa`, `?optics=1` adds the production
  exposure, tone mapping and bloom) in headless Chrome with SwiftShader. Screenshots
  of M81, M51, M101, M104, NGC 1300, the Antennae and M33 show the images
  registered and oriented. With Earth-side framing the LMC view broke (the camera sat
  near the Milky Way's halo and the LMC left the frame), so satellites keep the old
  framing and the LMC image was not added. SwiftShader gives no performance evidence; no frame-rate
  claim is made.

## Known limitations

- Foreground Milky Way stars in an image are projected onto the galaxy's surface.
- Sky sheets for edge-on systems are flat; off-axis they fade to the model.
- Where a published frame crops a bright halo (M104), the soft frame fade can read
  as a rounded box.
- The Webb images are infrared with assigned colours, not visual colour.
- The production app was not run with these changes; only the QA harness was.

## Next steps

- LMC (eso1914a, VISTA infrared): published record checked against NGC 1850
  (0.003 in uv) and 30 Doradus — centre 5 25 10.58 −70 04 22.75, 461.90′ × 515.88′,
  north 2.4° right of vertical, full size 28638 × 31985. Needs a satellite framing that
  shows the image from Earth's side without the camera entering the Milky Way's halo.
- SMC (eso1714a): registration checked (NGC 346 and NGC 362 within 0.002 in uv,
  47 Tucanae's saturated core within 0.008), but the frame includes 47 Tucanae and NGC 362, foreground Milky Way
  clusters a sheet at 200 kly would misplace. Needs a frame window before adding.
- Centaurus A (eso1221a): published record is available (centre 13 25 27.70
  −43 01 09.55, 33.87′ × 33.12′, north up) but no compact landmark has been measured.
- Andromeda: the local image is 1574 px with no spatial AVM. A high-resolution
  registered image must be supplied (the image CDNs are blocked from this workspace),
  as must any new Webb or Hubble image such as M64.
- Milky Way exterior: no photograph from outside exists; a measured-structure
  reconstruction (bar, Reid et al. arm loci) is the planned route, labelled as such.
- M87* is placed at 55 Mly while the M87 galaxy record is 53.5 Mly; reconcile.
