# Andromeda expansion report — 6 November 2026

## Scope and status

First scientifically validated development batch: six new canonical destinations, not a complete census of M31 or a claim that every proposed scientific category is implemented. No production deployment, DNS, hosting, payment or customer-data change is authorized or performed. Preserve the existing galaxy and speculative exhibit. Further catalogues are deferred rather than padded with unsupported entries.

## Existing implementation inventory

The baseline explorer exposes four M31 entries: PA-99-N2 (observed microlensing source), PA-99-N2 b (candidate), region:inner-disk (Inner bar and disk), and region:outer-disk (Outer stellar disk). No baseline observed-object records explicitly assigned to M31 were found. Procedural disk, bulge, halo, rings, dust, background particles, the illustrative stellar surface/planet/rings/belt are visual structures, not separately measured catalogue stars or confirmed worlds. Existing IDs and models are retained. M32/NGC 221 and M110/NGC 205 remain separate galaxy catalogue entries; neither is inserted into M31's disk.

Architecture audited: andromeda-data.ts shared geometry/system definitions; Andromeda.tsx bespoke particle layers, differential rotation, close-up system, shaders and LOD; galaxy-catalog.ts/models.ts/landmarks.ts and GalaxyDestinationGrid.tsx host structures; object-hosts.ts explicit membership; observed-objects.ts position/framing/index; ObservedObjects.tsx selected detail; observed-object-visuals.ts profiles; GalaxyExplorer.tsx/exploration-catalog.ts scoped alias search/filtering; exploration-navigation.ts/store.ts/CameraRig.tsx entry-gated fly-to; ObservedObjectInfoPanel.tsx and universal-target-factory.ts dossiers. Existing observation-image resources retain their behavior for other galaxies. The new M31 records use direct authoritative source links instead of generic NASA-image fallback searches; a source network failure does not gate their bundled details or procedural 3D assets. New records are bundled TypeScript, not database records; no database service, schema or production export is needed for this batch.

## Candidate comparison and decisions

| Canonical ID/name | Type | Existing? | Evidence and coordinate source | Position/physical confidence | Priority/decision |
|---|---|---|---|---|---|
| m31-v1 / M31-V1 | Cepheid | No | NASA Hubble image metadata, release 15 January 2025 | Published sky position; adopted host distance; surface/size illustrative | High: add |
| m31-ae-and / AE And | LBV | No | SIMBAD ICRS ep J2000, Gaia DR3 coordinate reference 2020yCat.1350....0G | Published position/classification; individual distance, radius and temperature not asserted | High: add |
| m31-af-and / AF And / BASW 19 | LBV | No | SIMBAD ICRS ep J2000, same coordinate catalogue; LBV ref 2014ApJ...790...48H | Published position; no inversion of uncertain Gaia parallax | High: add once across aliases |
| m31-ngc206 / NGC 206 / [V64] 78 | OB association | No | SIMBAD position quality D, NASA APOD star-cloud interpretation | Approximate catalogue direction; loose 3D population/extent illustrative | High: add, not a bound globular |
| m31-g1 / Mayall II / G1 | Halo globular cluster | No | Published MNRAS Table 3, Galleti-linked J2000 coordinates | Published direction; halo depth unknown; concentrated population illustrative | High: add once; no confirmed internal IMBH |
| m31-nucleus / M31* | Nuclear SMBH | No named observed-object record | Approximate M31 nuclear centre; Bender/Kormendy stellar dynamics and ESA/Hubble 140-million-solar-mass estimate | Black hole supported; mass is a published estimate; location aligned to existing coarse scene centre | High: add; no invented bright disk/jets |
| PA-99-N2 / PA-99-N2 b | Microlensing / planet candidate | Yes | POINT-AGAPE; Ingrosso et al. analysis | Interpretation uncertain; modeled orbit/rotation/belt/rings/location | Improve labels/confirmed=false; preserve IDs and exhibit |
| G1 internal IMBH | Compact candidate | Not a separate record | Published dynamical suggestion and non-detection caveats | Candidate, not confirmed | Defer separate model to prevent duplicate/overconfident source |
| Additional X-ray binaries, neutron stars, novae/SNR, H II/planetary nebulae, molecular/dust complexes, PHAT/PHAST clusters | Various | No new rows in this batch | Require individual source/coordinate/membership reconciliation | Not verified individually here | Defer, not reject existence |
| Additional confirmed M31 planets | Planet | None established by this batch's sources | No defensible confirmed entry identified | Not verified | Add none; no foreground Milky Way planets relabelled |

Source records were consulted 6 November 2026. SIMBAD is a live bibliography, not a pinned full-catalogue release downloaded here. Coordinates are transcribed to sub-arcsecond precision where available; display rounding does not create new measurements. NASA V1 equatorial coordinates are treated as J2000 for conversion; its image page does not independently establish a depth. The nuclear ICRS centre is approximate, not resolved event-horizon astrometry.

## Coordinates, scale and uncertainty

Measured equatorial directions are converted by the established IAU ICRS-to-Galactic function. Scene units remain light-years: x=-d cos(b)cos(l), y=d sin(b), z=d cos(b)sin(l). Each target adopts the existing M31 distance 2,537,000 ly; this is a common-distance sky projection, not a measured individual line-of-sight distance or disk deprojection. G1 is a halo object and is not forced onto a disk plane. The nuclear scene position is overridden to the existing M31_CENTER so its black hole is not displaced by the coarse galaxy-centre rounding; its catalogue direction remains in metadata.

Existing M31 quaternion, inclination 77 degrees, position angle 35 degrees, centre and disk morphology are unchanged. No claim that the legacy quaternion is a new astrometrically calibrated disk solution is made. New model diameters are viewing envelopes, explicitly extentBasis=illustrative; the information panel/dossier must not report these as measured radii. Unknown masses/temperatures are omitted. No arbitrary coordinates are represented as measured. The old PA-99-N2 illustrative placement is preserved and newly disclosed.

## Rendering and discovery

NGC 206 and G1 use deterministic single-draw-call point populations: flattened diffuse association versus centrally concentrated spherical distribution. Particles describe artistic population samples, not individually catalogued stars. Each selected cluster has 1,600 samples and 38,400 bytes of position/color attributes. Population generation is memoized; glow textures dispose on unmount; normal R3F geometry/material disposal is retained. Three.js point size is specified in world units. Cluster particles use a fourfold linear RGB presentation gain, enlarged point footprints and disabled material tone mapping to remain legible at the default exposure; this is a presentation choice, not calibrated photometry. The association uses the existing M31 disk quaternion while G1 remains spherical. Close exploration exposed oversized point sprites: an onBeforeCompile vertex-shader patch now caps gl_PointSize at 8 raster pixels after perspective attenuation. Its cache key is explicit and it composes with the existing object-radiance hook. The regression exercises the installed Three.js points shader and rejects an unsupported chunk layout. This cap bounds individual sprite overdraw, not measured stellar radii. Only the selected object mounts detailed geometry; the six lightweight host-scoped pick nodes remain discoverable by the existing catalogue. No high-resolution texture downloads were added.

Three variables reuse the existing stellar shader with distinct colors/profiles and brighter, low-spot illustrative surfaces; materials and corona textures dispose on unmount; visual variability is illustrative, not a calibrated light curve. Unsubstantiated generic gas envelopes are suppressed for these stars. M31* reuses the non-luminous black-hole context with published mass estimate, no disk/jet flags. New M31 dossiers use object-specific observational provenance and citations rather than generic inherited Chandra/NGC references. Search, canonical IDs, aliases, information panels, dossier, object radiance controls and queued navigation reuse existing paths. Star and cluster filters distinguish scientific class from object navigation kind. Existing generic regional visits remain available. No separate premium landing page/UI system was introduced.

## Validation and performance

Automated expansion assertions cover six unique IDs, aliases, M31 membership, finite/bounded coordinates, invalid coordinate rejection, an independent AF And Galactic-coordinate anchor, approximate host neighbourhood bounds, nuclear-centre alignment, explicit outside-entry queueing and inside fly-to for every new target, positive visit framing distance, unknown radius handling, stellar/cluster dossier classification, deterministic distinct population distributions, finite/bounded attributes, particle-budget rejection and retained unconfirmed planetary exhibit.

Executed successfully: andromeda-expansion-validation.ts, galaxy-explorer-validation.ts, galaxy-entry-validation.ts, galaxy-experience-validation.ts and galaxy-landmarks-validation.ts (after correcting its obsolete confirmed-planet assertion while adding identity/candidate/disclosure checks). Final TypeScript --noEmit, including the bounded-particle shader helper, passed. Final affected-file lint passed; the broader affected-file run retained one pre-existing Fast Refresh warning in GalaxyDestinationGrid, with no errors. Affected-file lint formatting errors were repaired; one existing react-refresh/only-export-components warning in GalaxyDestinationGrid remains. Production client/Worker builds succeeded; one early run could not write an external Wrangler log, so logging was redirected into the workspace for the clean rerun. The final source-reviewed client and Cloudflare Worker build exited 0 (client 30.30s, server 37.38s on the final bounded-particle build); existing TanStack inputValidator deprecation/build warnings remain. These build timings are not application load-time measurements.

Structural comparison: global observed catalogue 110 -> 116 objects; M31 observed catalogue 0 -> 6; M31 explorer entries 4 -> 10; six added lightweight pick/frame nodes; at most one selected detailed population. No before/after FPS, GPU memory, heap or load-time benchmark has been established, so no performance improvement or capacity certification is claimed.

## Outstanding QA and deferred work

Browser checks used the built local Worker application and the existing authorized session. Explicit M31 entry displayed all ten entries. Stars and Clusters & associations filters selected the expected populations; BASW 19 resolved to AF And. G1 details displayed the direct source link, Observed catalogue object label, unknown physical size, and adopted-distance/depth disclosures. AF And's stellar surface and M31*'s disk/jet-free shadow/lensing context rendered without captured console errors. Verified viewport dimensions: desktop 1280 x 720; mobile 390 x 844 with document width 390. Mobile source details and cluster-filter controls were exercised and screenshots recorded outside the repository. Final built-app visual review confirmed NGC 206 as a flattened blue association and G1 as a centrally concentrated warm population with cooler stars. G1 reached an approximately 360-ly framing distance, remained visible after settled panel show/hide transitions, and its seven-tab dossier showed the correct cluster classification, reconstruction notice and single object-specific reference. The capped point shader compiled and rendered with no captured console errors. Saved proof: outputs/OVU_ANDROMEDA_G1_LOCAL.png, outputs/OVU_ANDROMEDA_NGC206_LOCAL.png and outputs/OVU_ANDROMEDA_MOBILE_DETAILS.png in the surrounding development workspace (outside this repository). No production deployment was performed.

Existing generic scale-HUD captions can still refer to the Solar neighbourhood/Milky Way while visiting other galaxies; they were not redesigned in this catalogue batch. Exhaustive external telescope/image-provider failure injection and before/after GPU/FPS/memory benchmarks remain unverified.

Next scientific batches should reconcile individual H II/SNR/planetary-nebula catalogues and compact candidates with survey identifiers/coordinates before adding morphology-specific models; incorporate calibrated PHAT/PHAST population data and nuclear P1/P2 stellar structures without representing them as additional black holes. No new provider, paid asset or database dependency is required by this batch.

## References

- V1: https://science.nasa.gov/asset/hubble/m31-cepheid-variable-star-v1/
- AE And: https://simbad.cds.unistra.fr/simbad/sim-id?Ident=AE+And
- AF And: https://simbad.cds.unistra.fr/simbad/sim-id?Ident=AF+And
- NGC 206: https://simbad.cds.unistra.fr/simbad/sim-id?Ident=NGC206
- NGC 206 context: https://science.nasa.gov/image-article/apod-2012-october-24-ngc-206-and-the-star-clouds-of-andromeda/
- G1 coordinate table: https://academic.oup.com/view-large/21099397
- G1 population study: https://academic.oup.com/mnras/article/485/3/3076/5369634
- G1 IMBH caveat: https://doi.org/10.1088/2041-8205/755/1/l1
- Nuclear dynamics: https://chandra.as.utexas.edu/m31stis.html
- Nuclear mass/context: https://esahubble.org/images/heic0512a/
- Compact candidates, not individually imported: https://chandra.cfa.harvard.edu/photo/2013/m31/index.html
- Microlensing interpretations: https://arxiv.org/abs/1001.2105 and https://arxiv.org/abs/0906.1050

