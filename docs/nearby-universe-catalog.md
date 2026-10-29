# Nearby-universe catalogue expansion

This adds **126 galaxies** to the 64 existing records (190 total), plus **46 documented extragalactic H II / star-forming destinations**. It covers the 75 SINGS galaxy identities, a curated set of 59 additional Local Group / Local Volume galaxies, and three additional KINGFISH hosts. Existing curated records win identity conflicts. This is a sourced educational selection, **not a complete census** of Local Group discoveries or the thousands of Virgo members.

## Data provenance

- [McConnachie 2012, AJ 144, 4](https://arxiv.org/abs/1204.1562), Tables 1–3: J2000 centres, resolved-population distances with errors, velocities, major-axis half-light radii, ellipticities and position angles. The raw measured subset is in `catalog-data/local-dwarfs.ts`; full-precision source coordinates are in `local-dwarf-positions.json`. The [author's catalogue page](https://www3.cadc.hia.nrc-cnrc.gc.ca/en/community/nearby/) offers a later 2021 FITS edition, but that download was unavailable during research. **These rows are explicitly the 2012 paper edition**, not a claimed 2021/2026 update.
- [Kennicutt et al. 2003, SINGS](https://arxiv.org/abs/astro-ph/0305437), Table 2: all 75 galaxy identities, J2000 centres, RC3 morphological types, heliocentric velocities and D25 major/minor diameters. Table 3: 43 optically selected H II targets with J2000 positions. Its “Radius” is a galactocentric distance, **not a nebula size**.
- [Kennicutt et al. 2011, KINGFISH](https://arxiv.org/abs/1111.4438), Table 1: updated adopted redshift-independent distances and methods where available (Cepheids, TRGB, SBF, SN II, TF, bright stars). Three additional hosts: IC 342, NGC 2146 and NGC 3077; their centres are from [CDS/SIMBAD](https://simbad.cds.unistra.fr/simbad/).
- NASA's later summaries supply adopted distances for [M74](https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-74/), [M58](https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-58/) and [M90](https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-90/), replacing discrepant early survey estimates. Other values remain the stated survey edition, not a live database sync.
- [NGC 604 / NASA Webb](https://science.nasa.gov/asset/webb/ngc-604-nircam-image/): cavities and approximate 1,500 ly extent; [CDS centre](https://simbad.cds.unistra.fr/simbad/sim-id?Ident=NGC604).
- [NGC 346 / ESO](https://www.eso.org/public/news/eso1008/): approximately 200 ly star-forming complex with curved gas ridges; [CDS centre](https://simbad.u-strasbg.fr/simbad/sim-basic?Ident=NGC+346).
- [NGC 602 / NASA Hubble](https://science.nasa.gov/asset/hubble/star-cluster-ngc-602/): wind-eroded ridges and a stellar clearing in the SMC Wing; observing-field centre from [Carlson et al. 2011](https://cdsarc.cds.unistra.fr/viz-bin/ReadMe/J/ApJ/730/78?format=html).

## Measurement boundaries

One scene unit remains one light-year. RA/Dec are J2000 degrees, distances use the project parsec conversion, angular sizes are arcminutes, velocities are km/s. Galactic coordinates are recomputed from source J2000 centres. The inverse ICRS transform had a sign error; independent M31, Leo A and Galactic-centre anchors now catch it.

D25 is an optical isophote, not a hard edge. Dwarfs without D25 use a **display envelope spanning four major-axis half-light radii**. Their dossiers omit a physical outer radius. The larger side of the asymmetric distance error is retained as a conservative bound for Andromeda XI and XIII. Missing structural PA/ellipticity values are not new measurements; rounded/approximate source fits remain reconstruction constraints. No unreported uncertainty is treated as zero. The M81 DwB group distance is a historical adoption with uncertain membership, not a precision independent measurement.

New disk inclinations are thin-disk axis-ratio estimates, not measured kinematic inclinations. Measured PA is applied in the object's local celestial sky plane, consistently in overview, detailed rendering and navigation. The near side and intrinsic depth are unknown. Spheroid/irregular projected flattening constrains their volume; individual stars, dust depth, population colours and flight paths are reconstructed. A glowing particle is not an identified star or exoplanet.

H II positions retain published RA/Dec, explicit host ownership and the adopted host distance; their line-of-sight offset is unknown. The 43 SINGS regions and NGC 602 have an illustrative 200 ly viewing envelope. Their panels and dossiers say **physical size not catalogued** and omit derived physical-size comparisons. NGC 602 lies in the SMC Wing and need not fit inside the older catalogue's compact main-body envelope. No invented donor stars, planets, moons or named clusters are added.

## Runtime and navigation

All entries use the existing three-dimensional volume / particle renderer, with no new image planes. Only the selected galaxy receives a detailed density cache and entering/inside stellar population. Named H II contents use the same explicit galaxy ownership gating and unload on exit; only a selected nebula mounts its detailed gas volume. No catalogue fetch is needed at runtime, including on Lovable. Global search queues a host visit instead of teleporting into another galaxy.

Run `npm run test:nearby-catalog` for source coverage, independent coordinate anchors, units, identity deduplication, projected orientation, host-scoped search, queued entry, unload flags and unknown-size handling. Existing galaxy, nebula, navigation and production-build checks remain applicable.

## Verification

TypeScript and the production build pass. Fifteen relevant astronomy, galaxy, nebula, camera/navigation, audio and catalogue suites pass. Seven real WebGL browser smoke checks cover preview, entry, hosted-object selection, exit/unload and a queued cross-galaxy visit, with no console or WebGL errors. On this machine, the sampled selected-nebula scene ran at about 30 fps at 1280×800; this is a local observation, not a guarantee for every device.
