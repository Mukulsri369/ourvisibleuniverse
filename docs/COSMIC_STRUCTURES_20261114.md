# Cosmic structures from real survey galaxies — 14 November 2026

## Request and outcome

The owner asked to analyse all the cosmic structures properly and make them look realistic and premium, with every small detail clearly visible.

The eight landmarks (`COSMIC_BENCHMARKS`) were drawn by `StructureCloud.tsx` as seeded procedural points, not real members:
- clusters were random blobs;
- superclusters and the Sloan Great Wall were eight straight spokes;
- the Boötes Void was a thin random shell.

Each is now a field of real survey galaxies at measured sky positions and redshifts:

| Structure | Galaxies plotted | From |
| --- | ---: | --- |
| Virgo Cluster | 785 | SDSS DR17 646, 2MRS 139 (plus 27 atlas galaxies, M87 and others, drawn by the atlas) |
| Coma Cluster with the Abell 1367 filament | 6,894 | SDSS DR17 and 2MRS |
| Norma Cluster / Great Attractor | 1,397 | 2MRS and 6dFGS DR3 |
| Perseus–Pisces | 1,896 | 2MRS |
| Sloan Great Wall | 41,967 | SDSS DR17 and 2MRS |
| Shapley Supercluster | 3,988 | 6dFGS DR3 and 2MRS |
| Boötes Void and its walls | 26,070 | SDSS DR17 and 2MRS |
| Laniakea (2MRS within 100 Mpc of the Great Attractor) | 11,042 | 2MRS |

Per-catalogue counts, group statistics and the labelled components are in `src/stars/cosmic-structures/structure-fields.generated.ts`.

Look-dev sheets (QA page, same poses, AMD Radeon iGPU):
- [before](cosmic-structures-lookdev-20261114/before-production-framing.png) and [after](cosmic-structures-lookdev-20261114/after-production-framing.png) at the production fly-to framing, whole atlas mounted;
- [close-ups](cosmic-structures-lookdev-20261114/after-close-ups.png) and a [Coma close-up](cosmic-structures-lookdev-20261114/coma-close-up.png).

## Data and method (what is measured, what is reconstructed)

- **Data.** Fetched by `npm run cosmic:fetch` into `.taste-skill/cosmic-cache/` (not committed):
  - 2MRS (Huchra et al. 2012, VizieR J/ApJS/199/26, through the CfA mirror);
  - SDSS DR17 spectroscopic galaxies with photometry (SkyServer SQL, in 20° RA slices);
  - 6dFGS DR3 (Jones et al. 2009, VizieR VII/259), quality 3–4;
  - SIMBAD positions and redshifts for the 43 labelled components.

  `npm run cosmic:build` writes `public/data/cosmic-structures/<id>.bin` (16 bytes per galaxy plus glow cells, 1.8 MB in all, each loaded only when its structure is shown) and the generated manifest. Acknowledgements: [public/data/cosmic-structures/CREDITS.md](../public/data/cosmic-structures/CREDITS.md).
- **Measured:**
  - sky positions and redshifts;
  - apparent magnitudes (→ luminosity relative to L*, display weighting only);
  - sizes: SDSS Petrosian R90 and the 2MRS extrapolated K-band radius;
  - axis ratios (SDSS, 2MRS);
  - position angles (SDSS only);
  - colours: SDSS g−r, 6dFGS bJ−rF, or the 2MRS morphological type.
- **Distances:**
  - Planck 2018 comoving distances, scaled so each structure's adopted redshift lands on its adopted distance.
  - Coma and Perseus are centred on the atlas distances of NGC 4889 (321 Mly) and NGC 1275 (237 Mly), so the atlas galaxies sit at their cluster's heart.
  - Virgo's main body is placed at M87's atlas distance (53.5 Mly; SBF 16.5 Mpc, Mei et al. 2007), and the W′ cloud at 23 Mpc (Mei et al. 2007).
- **Reconstructed** (labelled in the manifest and the explorer panel):
  - **Group depths.** Groups found by friends-of-friends (Huchra & Geller 1982) have their redshift-space fingers of God compressed so their line-of-sight spread equals their projected spread (as in Tegmark et al. 2004), keeping each member's velocity order. Virgo uses Mei et al.'s 0.6 Mpc rms depth.
  - **Orientation in depth.** Each disk is oriented so that, seen from Earth, it reproduces its measured axis ratio and position angle, using a thin-disk inclination with q₀ = 0.2. Spheroids are oblate bodies seen edge-on from Earth. The near side and, outside SDSS, the position angle are chosen deterministically.
  - **6dFGS sizes.** These come from a size–luminosity scaling, because 6dFGS has no size or shape.
  - **Display choices:**
    - the colour palette;
    - generic profiles, two-armed spirals and dust lanes on close-ups;
    - a size boost of up to 2.2× for galaxies only a few pixels across;
    - a glow of the plotted galaxies' light on a 64³ grid, shown only where it is at least 2.5× the mean at the same distance from us (the surveys are flux-limited);
    - soft fades at each survey selection's edges;
    - for the void, a 70 Mpc slab through its centre across the view, as in survey slice maps.
- **Real features, not artefacts:**
  - Galaxy-free bands at low Galactic latitude in Laniakea, Norma and Perseus–Pisces are the Zone of Avoidance: Milky Way dust hides galaxies there.
  - The Sloan Great Wall's outline follows the SDSS footprint.
- **Not drawn:**
  - Laniakea's watershed boundary: no machine-readable copy of the Tully et al. 2014 surface was available here.
  - X-ray intracluster gas.
  - Scene labels: they are disabled project-wide, so components are listed in the Cosmic Web explorer's details card instead.

## Record corrections (`COSMIC_BENCHMARKS`)

| Structure | Was | Now | Source |
| --- | --- | --- | --- |
| Boötes Void | RA 218°, Dec +35° (l 59°, b 65°) — the NOAO Boötes Deep Field, ~12° away; 0.72 Gly; 330 Mly; "only 60 galaxies" (unsourced) | RA 222.946°, Dec +45.796° (l 79.0°, b 59.7°); z 0.05, 0.717 Gly; 300 Mly across (radius ~46 Mpc); 171 SDSS galaxies brighter than M_r ≈ −19 within 30 Mpc of the centre, against 756 expected at its walls' density | Kirshner et al. 1987 via SIMBAD; Pandey, Saha & Pradhan 2021 (arXiv:2107.01774); OVU measurement from SDSS DR17 |
| Virgo Cluster | RA/Dec 186.75°, 12.72° disagreed with its l/b by 3.7° (the scene used l/b, i.e. M87) | RA/Dec of M87 (187.699°, 12.385°), matching l/b; 0.0538 Gly | SIMBAD; Mei et al. 2007 |
| Norma Cluster | z 0.0157, 0.22 Gly, 25 Mly, 1,200 members | z 0.01625 (4,871 ± 54 km/s), 0.2348 Gly, 13.4 Mly (twice the Abell radius), 296 members with velocities; framed at 30 Mly | Woudt et al. 2008; SIMBAD |
| Laniakea | Centre RA 180°, Dec −20° (unsourced, l/b mismatched) | Centred on the Great Attractor region (l 307°, b 9°, cz ≈ 4,350 km/s), 0.2098 Gly | Lynden-Bell et al. 1988; Tully et al. 2014 |
| Shapley Supercluster | z 0.046, 0.65 Gly, 350 Mly | z 0.0484 (main plane 14,500 km/s), 0.688 Gly, 363 Mly (75 h⁻¹ Mpc) | Proust et al. 2006 |
| Perseus–Pisces, Sloan Great Wall | l/b rounded; 0.25 and 1.02 Gly | l/b recomputed from RA/Dec; 0.26 and 1.04 Gly (Planck 2018) | — |
| Coma Cluster | — | Kept at 0.321 Gly to stay aligned with the atlas's NGC 4889 (Planck 2018 comoving for z = 0.0231 would be 0.333 Gly) | — |

Unverified and unchanged: Perseus–Pisces's 300 Mly length and 3,500 members, the Sloan Great Wall's 10,000 members, Coma's 2,000 members, Shapley's 8,000 members.

## Scene integration

- `StructureField` (`src/stars/cosmic-structures/`) replaces `StructureCloud` in `LargeScaleStructure3D`. It mounts for the selected structure, or for all when landmarks are shown, keeps the `structure:<id>` name and exposes `userData.ready`.
- **No duplicates:** inside a mounted field, the all-sky 2MRS layer (`SurveyGalaxyField`) and larger fields cross-fade out, so no galaxy is drawn twice. Survey duplicates of atlas galaxies are removed at build time.
- **Illustrative cloud:** the survey cloud (random points within survey footprints) fades out while a structure is in view.
- **Bug fixed:** choosing a structure in the site map's "beyond" list only moved the camera. It now selects the structure, so its field appears. Structures can set `viewDiameterMly` for framing (Norma 30 Mly, Boötes 600 Mly).
- **Explorer panel:** the Cosmic Web explorer shows a details card for the selected structure: description, distance and size, the survey galaxies plotted per catalogue, components, method notes and sources. Its old text calling the landmarks "not measured galaxy-member positions" was replaced.
- **Quality tiers:** the glow follows `renderingQualityTier`, drawing 60%, 40% and 25% of each field's (at most 4,000) splats, most significant first, with a size cap.

## Performance evidence

Scenario: `scripts/nearby-qa/structure-views.html`, Earth view at the production fly-to distance, whole atlas mounted (`universe=1`), production optics, 1280×800, DPR 1. Headless Edge, ANGLE D3D11, AMD Radeon integrated GPU, vsync 60 Hz. Two 8 s samples each; raw data in [cosmic-structures-performance-20261114.json](cosmic-structures-performance-20261114.json).

| Structure | Selected (final) | Nothing selected, same pose | Old renderer (pinned `69047e4`) |
| --- | --- | --- | --- |
| Sloan Great Wall | 17.34 / 17.04 ms (frames > 33.4 ms: 8 / 2) | 16.97 / 16.90 (3 / 0) | 16.92 / 16.90 |
| Coma | 16.73 / 16.73 (1 / 0) | 16.63 / 16.65 (0 / 0) | 17.01 / 16.98 |
| Boötes Void | 17.12 / 16.90 (1 / 2) | 16.64 / 16.66 (0 / 0) | — (pose moved) |
| Laniakea | 16.91 / 17.16 (2 / 4) | 17.27 / 17.20 (4 / 3) | — (pose moved) |

- **Stress test** (DPR 2, optics off): fill-limited, it adds 3.8–5.8 ms to the same pose with nothing selected (Laniakea 21.2 / 22.4 ms against 17.5 / 18.0).
- **Glow cost:** in the first version, all 6,000 glow splats cost +12 ms there. The tier shares and the cap were chosen from those runs, all of which are kept in the JSON.
- **Not established:** other GPUs, phones, the authenticated full app, and VRAM. p95 values sit on vsync steps, so they read 16.8 or 33.3 ms.

## Checks run

- `npx tsc --noEmit`; `npm run build`; ESLint on the new and changed files (warnings only, in the QA harness).
- New `test:cosmic-structures` (5 tests):
  - each record's RA/Dec agrees with its l/b;
  - fields are current with their records;
  - files match their manifests;
  - Virgo's main body has a median distance between 50 and 57 Mly;
  - the Boötes interior is below 0.4 of its surroundings' density;
  - Coma's richest group has at least 300 members and is anchored to NGC 4889.
  
  Reintroducing Virgo's old RA makes it fail.
- `test:galaxy-explorer` (site-map selection now asserted), `test:cosmic-web`, `test:lss`, `test:navigation`, `test:rendering`, `test:visual`, `test:3d`, `test:independence`, `test:nearby-expansion`, `test:nearby-catalog`, `test:galaxies`, `test:scene-depth`, `test:exploration-camera`, `test:solar-controls`, `test:galaxy-entry`, `test:evolution`, `test:object-catalogue`, and `galaxy-experience` / `galaxy-rendering` validations.
- The Excel object list was regenerated for the corrected records.

## Limitations and next steps

- **Planned review not run:** the independent multi-agent research and fact-check did not run; all 11 agents stopped at the account's usage limit. The values above were checked against SIMBAD, VizieR, SDSS and arXiv abstracts during the session.
- **Virgo:** sparse, because SDSS spectroscopy misses its brightest members and 2MRS is shallow. The atlas Messier galaxies carry the view.
- **Norma:** thin, because 2MRS and 6dFGS stop at the Zone of Avoidance.
- **Possible follow-ups:**
  - Cosmicflows-4 distances for the Local Volume;
  - an X-ray gas layer with sourced β-models;
  - Laniakea's watershed surface, if a machine-readable product becomes available.
