# Nearby galaxy expansion — master report

## Audit before implementation — 7 November 2026

Baseline: `387de79` on `migration/supabase-cloudflare`, clean checkout, three local commits ahead of origin. No deployment or production changes are authorized. Previous Andromeda and customer work is preserved.

Independently calculated inventory: 190 catalogue galaxies (64 curated + 126 previous additions), 189 generic models (M31 remains bespoke), and 46 extragalactic H II destinations. Heliocentric adopted-distance bins: below 1.5 Mpc 61, 1.5–11 Mpc 68, 11–30 Mpc 45, 30–100 Mpc 4; twelve entries lie at or beyond 100 Mpc. A distance bin is not a Local Group membership determination. Baseline observational fields and identities are pinned in `src/stars/catalog-data/nearby-v2/baseline-387de79.json` for preservation tests.

Existing data: `galaxy-catalog.ts`, sourced SINGS/KINGFISH and 2012 dwarf measurements in `nearby-galaxy-data.ts`, morphology/population/sky-orientation modules. Scene convention: heliocentric directions, one light-year per unit, x = -d cos(b) cos(l), y = d sin(b), z = d cos(b) sin(l). Milky Way centre remains at -26000 ly on X; no origin reinterpretation is planned.

Current navigation already has explicit preview/entry/exit, `requireGalaxy`, host ownership and queued internal visits. Detailed body loading is selected/entered-galaxy gated. However, Universe mounts 189 overview clouds, each allocating a 4096-point population plus material/frame work. DetailedGalaxies also mounts one subscription gate per model. These O(N) React/GPU resources must be bounded before importing many more galaxies. Existing survey field data are unnamed 2MRS velocity-derived entries and must not be counted as new independently measured named galaxies.

The current nearby validation hardcodes 190/126/46. Its meaningful coordinate, alias, source, H II and load/unload checks will be retained; dataset coverage will move to a versioned manifest, not weakened count assertions. Current global galaxy search omits galaxy aliases in explorer results; generic galaxy dossiers also use blanket telescope/citation text. Both need source-aware integration for imported rows.

## Sources under examination

- UNGC 2013, Karachentsev et al., AJ 145, 101; VizieR J/AJ/145/101 (catalogue, distance, velocity and bibliography tables), 869 rows. This is a historical edition retrieved in 2026, not a 2026 measurement update. HEASARC's 869-row export was downloaded independently for coordinate/distance comparison.
- McConnachie's author-maintained January 2021 FITS edition: downloaded from CADC, 144 rows with per-row references, errors, structural parameters and nulls. Classification/membership supplements and known candidates require individual review.
- NED-LVS current documented release 2026-04-24 and July 2026 API specification inspected. No 1-GB full-table download, paid service or new runtime API dependency is planned. Later-distance expansion depends on verified accessible subsets.

Implementation and actual results will be appended after validated batches. This audit itself does not claim imports, navigation acceptance or performance gains.

## A. Implemented inventory

Local implementation checkpoint: 7c23c53. Catalogue release: **nearby-2026-11-07-v1**. The baseline was 190 named catalogue galaxies; this batch adds **641** and the application now contains **831**. The separately represented Milky Way is excluded from this historical catalogue count. Existing Andromeda work remains at 14 expansion records, 124 global observed objects and 18 M31 explorer destinations. The 46 extragalactic H II destinations are unchanged.

| Adopted heliocentric distance | Before | Added | After |
| ----------------------------- | -----: | ----: | ----: |
| Below 1.5 Mpc                 |     61 |    33 |    94 |
| 1.5–11 Mpc                    |     68 |   535 |   603 |
| 11–30 Mpc                     |     45 |    73 |   118 |
| 30–100 Mpc                    |      4 |     0 |     4 |
| At least 100 Mpc              |     12 |     0 |    12 |

These are distance bins, not inferred memberships. The 35 additions from the author-maintained dwarf compilation comprise M31 subgroup: 15; Local Group: 1; M31 / Local Group boundary: 2; Milky Way subgroup: 13; Local Group neighbourhood: 3; Local Group / Milky Way boundary: 1. Source subgroup codes determine these associations. This is not an exhaustive 2026 satellite census. Virgo and Fornax chiefly lie in the 11–30 Mpc range; their appearance in the request's later research stage does not justify moving their distances into the 30–100 Mpc range.

Morphologies below combine case variants and closely related descriptive labels without changing the source records:

| Family                                                      | Total |
| ----------------------------------------------------------- | ----: |
| Spirals                                                     |   194 |
| Barred spirals                                              |    13 |
| Edge-on spirals                                             |     3 |
| Ellipticals, including compact/radio/peculiar               |    16 |
| Dwarf ellipticals, including one emission-line object       |    11 |
| Dwarf spheroidals                                           |   135 |
| Dwarf irregulars                                            |   320 |
| Transition dwarfs                                           |    46 |
| Blue compact dwarfs                                         |    52 |
| Dwarf starbursts                                            |     4 |
| Other irregulars, including Magellanic/starburst irregulars |     5 |
| Broad early type (E/S0 unresolved by source classification) |    13 |
| Lenticulars, including one emission-line object             |    11 |
| Emission-line dwarf lenticular                              |     1 |
| Interacting systems                                         |     3 |
| Ring galaxies                                               |     3 |
| Other starburst                                             |     1 |

Of the additions, **476 use individual distance indicators and 165 use group-adopted estimates**. An individual indicator is not a claim of uniformly high precision: 200 use Tully–Fisher and 37 use brightest stars. Other explicitly coded methods are TRGB 178, SBF 21, Cepheids 2, FP 1, PNLF 1 and SN 1; 35 are resolved-population compilation entries whose individual technique is not encoded in the FITS row. Published distance errors are available for 215 additions; **426 have no supplied error**. Radial velocity is unknown for 97 and axis ratio for 3. Missing values remain absent.

Exact inventory, source decisions, IDs, methods and chunk hashes: [coverage report](nearby-galaxy-coverage.json). Sources, editions, download URLs, raw/input checksums and rights notes: [source manifest](../src/stars/catalog-data/nearby-v2/source-manifest.json).

## B. Scientific evidence and reconciliation

- **606 additions:** Karachentsev, Makarov & Kaisina, UNGC 2013, AJ 145, 101; [VizieR J/AJ/145/101](https://cdsarc.cds.unistra.fr/viz-bin/cat/J/AJ/145/101) and [HEASARC description](https://heasarc.gsfc.nasa.gov/W3Browse/galaxy-catalog/neargalcat.html). Its 869 rows use a distance-or-corrected-velocity selection. The importer does not assert that every row is within 11 Mpc.
- **35 additions:** [McConnachie's author compilation](https://www3.cadc-ccda.hia-iha.nrc-cnrc.gc.ca/en/community/nearby/), January 2021 FITS (144 rows), with subgroup/morphology facts transcribed from the author's October 2019 Table 1 and original reference identifiers retained. The publication is [McConnachie 2012](https://arxiv.org/abs/1204.1562); later table editions are explicitly distinguished.
- Distance and velocity references/errors are joined only when the auxiliary UNGC rows identify a unique matching method/value. Ambiguous joins leave errors unreported. No zero error is substituted.
- Modulus errors propagate asymmetrically: Dminus = D × (1 − 10^(−sigmaMinus/5)); Dplus = D × (10^(sigmaPlus/5) − 1). Shared group distances may have correlated systematics; the batch does not present them as independent measurements.
- The velocity frame is heliocentric. v/c is explicitly a velocity proxy, not a distance measurement or an independently measured cosmological redshift. Negative velocities do not produce negative distances. The nearby source panels do not display a Hubble-law distance in place of their adopted distances.
- Angular major axes, axis ratios, measured PA and estimated disk inclinations remain separate properties. UNGC sizes refer to the B-band Holmberg isophote, with a profile-scale exception for extremely diffuse objects. The dwarf FITS supplies half-light radii; a four-radius display envelope is labelled and is not turned into a measured physical outer radius.
- Every new record retains source edition/row/reference, measurement basis and reconstruction disclosures. Source morphology uncertainty is retained. Broad T-code early types remain broad; emission-line labels do not assert an observed starburst.

All **1,013 input rows** receive decisions: 641 additions, 204 reconciliations with existing records, 18 cross-source reconciliations and 150 deferrals. Existing canonical IDs and adopted observational fields are preserved. Supported reconciliation includes Messier/NGC/PGC/LEDA/UGC/ESO/DDO notation, zero padding, diacritics and dwarf Roman numerals; coordinate-name signs remain distinct. The identity history retains canonical IDs and historical names across future preferred-name/edition changes. A rename regression exercises this explicitly.

The coverage file records five distance disagreements above the audit threshold and nine position disagreements above 60 arcsec, while retaining the prior adopted values. For example, the newer KKs 3 distance remains preferred over the older UNGC estimate. This is a conflict ledger, not an automatic re-measurement of the 190 earlier records.

Deferrals: 109 flow/appearance-only distances; 32 candidate, disputed identity, stellar-structure, cloud or unresolved-component cases; 3 invalid/missing distance/extent cases; 2 close angular neighbours without verified aliases (KDG052 and UGC05423); 3 unreconciled very-nearby 2013 identities; and Centaurus1, whose inspected newer FITS row lacks a classification in the older metadata supplement. Proximity alone never merges galaxies. The authoritative source files can still include candidates or HI clouds; inclusion in a source table is not sufficient for admission.

Source files total 0.64 MB and stay in an ignored local cache. No new image assets or publisher prose were imported. No blanket CC-BY, public-domain or commercial-reuse permission is asserted. Source-specific redistribution/commercial terms require confirmation before publication where the manifest records unresolved rights. This work remains local and unpublished.

A pre-existing Local Group tour caption and fallback M31 description incorrectly promised a merger in 4.5 billion years. They now reflect the uncertainty established by the [2025 Hubble/Gaia dynamics study](https://doi.org/10.1038/s41550-025-02563-1), with a linked reference. No orbital prediction or curated observational measurement was invented or overwritten.

## C. 3D implementation, discovery and pipeline

The scene retains **one unit = one light-year**, heliocentric galaxy directions and the existing axes: x = −d cos(b) cos(l), y = d sin(b), z = d cos(b) sin(l). The Milky Way centre remains at −26000 ly on X. Published FK5 J2000 positions are explicitly treated as an ICRS approximation; this is not an epoch/astrometry update.

An independent HEASARC export of the same original UNGC publication cross-checks all 869 positions, Galactic transforms, distances, methods and velocities. Maximum position difference is 0.000020 arcsec and Galactic-transform difference 0.01001 arcsec. This is an independent export/transform check, not an independent observing campaign. Eight frozen references span all RA quadrants and both declination signs; seven independently computed Cartesian separations, negative-zero parsing, Galactic-centre/pole anchors and unit tests guard sign/axis errors.

Distant named galaxies share one camera-relative, high/low-position GPU field with morphology-aware volumetric point shaders. Visibility markers have a 5–128 pixel display range; their brightness is illustrative, not calibrated photometry. Catalogue centres and travel distances are not compressed. Nearby/selected objects use the existing 3D cloud system, with at most **8 desktop / 4 mobile catalogue previews**, plus separately owned Milky Way/M31 representations. Only selected/active destinations mount detailed bodies and density caches. The old N-per-galaxy subscription gates are removed. A hierarchical index selects the preview budget and retains close objects as distinct identities.

Ellipsoidal old populations, dwarf spheroidals, irregulars, compact blue dwarfs, disks and bars have distinct structures. Published projected flattening constrains envelopes; intrinsic depth, unmeasured roll, individual stars, arms, dust and colours remain reconstructions. No named star, planet or tidal tail was added to satisfy a count. Existing bespoke M31/Milky Way and curated models, host ownership and queued interior navigation remain intact.

The existing explorer now offers nearest-first browsing, distance/type/association filters, featured destinations, normalized alias search and source-specific Science details. Lists mount a bounded initial page with Show more. Cluster labels use actual explicitly assigned catalogue member counts, identify incomplete atlas coverage and open the association's member list. They are spatial organisations, never invented single-galaxy interiors. Selecting one inside a galaxy requires the existing explicit exit step. Responsive source panels retain unknowns and errors; mobile shortcuts no longer obscure the information panel.

The build-time pipeline reads strict TSV/FITS schemas, preserves nulls, normalizes units/identity, records every rejection, emits 64-record JSON chunks, and skips unchanged outputs. Frozen inputs and a versioned identity history allow hermetic regeneration; LF Git attributes protect checksums across platforms. Current catalogue chunks are loaded with the scene; they are not individually fetched on demand. Geometry/detail loading is progressive and bounded. The 10,000-item test is synthetic index stress data confined to tests, not imported galaxies or a 10k GPU demonstration.

The optional NED tool now uses the [July 2026 OverviewOfObject API](https://ned.ipac.caltech.edu/Docs::API/) and VOTable 1.5. It handles malformed XML, nulls, zero, timeouts and provider failure. Its fallback explicitly identifies local atlas data. The live M31 browser attempt used the explicitly labelled local fallback; successful live browser retrieval remains unverified in this environment. Rendering and visits do not depend on NED being online. No paid catalogue API was added and the full NED-LVS catalogue was not downloaded.

## D. Actual performance evidence

Same machine, headless installed Chrome, DPR 1, 42° FOV, fixed cameras, 7-second settling and 10-second frame windows. Each viewport is a desktop-browser viewport, including 390×844. These isolated scenes use the actual Universe/DetailedGalaxies components plus the existing 2MRS field; the bespoke Andromeda component, full authenticated application, Academy and other scene systems are not included. Scenario names describe camera scales. None of the included samples was hidden/background-throttled.

| Viewport | Camera scale | Before FPS | After FPS | Draw calls | Submitted points |
| -------- | ------------ | ---------: | --------: | ---------: | ---------------: |
| 1280×720 | local-group  |       76.8 |     120.2 |     67 → 2 | 304,685 → 43,371 |
| 1280×720 | mw-m31       |       99.4 |     120.2 |     35 → 2 | 177,709 → 43,371 |
| 1280×720 | 11-mpc       |       50.8 |     116.6 |    110 → 2 | 484,909 → 43,371 |
| 1280×720 | 30-mpc       |       42.7 |     120.2 |    144 → 2 | 628,269 → 43,371 |
| 1280×720 | 100-mpc      |       31.9 |     117.2 |    175 → 2 | 755,245 → 43,371 |
| 1280×720 | inside-mw    |       34.9 |      40.0 |     11 → 9 |  56,480 → 49,118 |
| 390×844  | local-group  |      100.6 |     119.9 |     48 → 2 | 235,053 → 43,371 |
| 390×844  | mw-m31       |      120.2 |     120.3 |     30 → 4 | 153,133 → 47,467 |
| 390×844  | 11-mpc       |       66.5 |     120.2 |     90 → 2 | 402,989 → 43,371 |
| 390×844  | 30-mpc       |       39.0 |     120.2 |    134 → 2 | 587,309 → 43,371 |
| 390×844  | 100-mpc      |       36.6 |     120.2 |    173 → 2 | 747,053 → 43,371 |
| 390×844  | inside-mw    |       70.6 |      68.4 |      8 → 9 |  48,288 → 49,118 |

Raw [baseline](nearby-galaxy-baseline-performance.json), [expanded](nearby-galaxy-expanded-performance.json) and [geometric visibility counts](nearby-galaxy-visibility.json). Submitted points are not the number of galaxies visible to a visitor. The 42,541 pre-existing 2MRS entries have velocity-estimated depths; they are not counted as new independently measured named galaxies. Geometric visibility counts do not imply photometric detection or census completeness.

A separate startup comparison used warmed local Vite servers and three alternating fresh browser contexts, with baseline source checked out separately at 387de79. Readiness means a first rendered frame plus the 2MRS geometry being present; polling/test overhead is included. Median readiness was 4.18 s before and 3.29 s after. Scene geometry attribute/index arrays fell from 26.79 MB to 0.974 MB. Median sampled JS heap was 101.4 MB before and 88.0 MB after. These are [local component startup observations](nearby-galaxy-startup-comparison.json), not production load/LCP measurements or total VRAM.

The wide-field bottleneck improves substantially. Dense selected interiors remain a separate cost; the final mobile inside-Milky-Way sample fell from 70.6 to 68.4 FPS (about 3%). This observed decrease is retained in the report; repeated expanded samples varied, and a controlled global zero-regression claim is not established. No universal 60-FPS, physical-phone, zero-leak or zero-regression guarantee is made.

## E. Executed verification and reproduction

**21 regression suites passed**. [Commands and results](nearby-galaxy-checks.json) preserve every exact suite command. They cover catalogue completeness/checksums/preserved records, source-reader cross-checks, independent coordinates, morphology populations, LOD, landmarks, navigation/ownership, explicit entry/exit, Andromeda, H II/nebulae, compact objects and black holes. Tests were not deleted or skipped. Historical 190/126/46 assumptions in the nearby suite now use versioned coverage, while identity, measurement and host assertions remain.

TypeScript and affected-source ESLint passed at the recorded checkpoint; existing fast-refresh warnings remain. The legacy renderer's existing ts-nocheck limits still apply; TypeScript alone is not shader/scene acceptance. The final normal client/Cloudflare Worker build passed with exit code 0. Existing TanStack inputValidator deprecations, chunk-size and CSS sourcemap warnings remain and are not attributed to this catalogue expansion.

[Browser results](nearby-galaxy-browser-results.json) exercise desktop and 390×844 filters, aliases, source/null/error displays, previews, actual CameraRig entry/exit/re-entry for UGC 12894, Andromeda IX and NGC 1311, bounded mounted resources, cluster-as-organisation navigation and NED failure fallback. No captured page or WebGL/shader errors occurred. The [normal built-app smoke check](nearby-galaxy-built-smoke.json) reached the expected sign-in guard at /auth?next=%2Funiverse without page errors; it did not authenticate or validate the protected full scene. A deliberately aborted NED request produces the recorded expected network error while local browsing remains usable. Screenshots were inspected; faint markers, FITS decimal artifacts, mobile panel overlap and a harness-only canvas-height problem were corrected.

Reproduce from the repository root:

```powershell
npm ci
npm run test:nearby-expansion
npm run ingest:nearby-catalog -- --check
# Optional raw-source verification; downloads are kept outside version control.
node scripts/catalogue/fetch-nearby-inputs.mjs
node scripts/catalogue/prepare-nearby-inputs.mjs
npm run test:nearby-regressions
```

A fresh VizieR response contains changing request timestamps. Review raw-manifest and normalized-input diffs before adopting newly downloaded snapshots; identical normalized scientific inputs do not require re-importing unchanged application chunks. A different metadata-supplement PDF checksum requires explicit source-edition review.

Browser tooling is an optional development dependency, installed in a scratch prefix for this run. Set OVU_PLAYWRIGHT_MODULE to its playwright/index.mjs, or make playwright available locally; installed Chrome is used. Start only the isolated loopback harness with:

```powershell
node node_modules/vite/bin/vite.js --config scripts/nearby-qa/vite.config.mts
node scripts/nearby-browser-validation.mjs
node scripts/nearby-performance-validation.mjs expanded
node scripts/nearby-visibility-validation.mjs
```

Startup comparison additionally requires the same performance harness in a detached 387de79 checkout on port 31756. The normal build command used the existing private local helper solely with PublicBuildOnly:

```powershell
& ../../run-ovu-supabase.ps1 -Repository (Get-Location).Path -PublicBuildOnly node_modules/vite/bin/vite.js build --config vite.cloudflare.config.ts
```

Private configuration/build logs remain outside Git. The helper is not available in a fresh clone; provide the normal documented public build environment there. Isolated test pages are not production routes or an authentication bypass in the product.

## F. Remaining scope and release limits

1. This is an 831-record local release, not thousands of individually verified new galaxies, a complete Local Group/11-Mpc census, or completion of every long-term stage. Later 30–100 Mpc expansion needs suitable licensed/attributed subsets and distance/quality review. Broad NED-LVS/EDD/HyperLEDA integration remains future work; a distance-only cut is insufficient.
2. Resolve the 150 deferrals individually, including current classifications/newer Local Group additions, ambiguous close identities and trustworthy depth for velocity-selected objects. Do not bulk-reinstate flow/appearance distances or candidates to increase a count.
3. Optional stellar masses, luminosities, source-specific photometry and updated group memberships are not fully enriched. The prior 190 records and their scientific limitations are preserved, not freshly re-observed or comprehensively re-audited.
4. More featured reconstructions, photometrically calibrated brightness, deeper tier handover tuning, chunk streaming and full-app performance work can build on the bounded architecture. Only the real 831-record scene and synthetic index were tested at the reported scales.
5. Authenticated built-app acceptance of the newer M31 nuclear P1/P2/P3 destination remains pending. Component navigation QA does not close that earlier acceptance item. Physical-phone testing, total GPU memory, exhaustive outage/leak testing and full-app performance are not established.
6. Confirm unresolved source reuse rights before publication. **No push, deployment, production/customer/payment/DNS/service change is authorized or performed.** The production version recorded in the earlier handoff has not been freshly inspected.

## Final continuation checkpoint

Implementation commit: 7c23c53, local only. Final source TypeScript, affected-source ESLint, 21 regression suites, deterministic regeneration, normal client/Worker build, component browser checks and anonymous built sign-in-guard smoke passed. Live NED browser retrieval fell back locally; no claim of a successful live browser result is made. The later documentation commit records this report and the handoff. Local QA servers on 31755/31756/31757 were stopped, and the detached baseline checkout/dependency junction were removed. Scratch files were preserved outside Git; raw catalogue snapshots remain in the ignored cache. No production sign-off is implied.
