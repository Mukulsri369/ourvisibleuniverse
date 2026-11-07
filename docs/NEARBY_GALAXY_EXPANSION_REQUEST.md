# OUR VISIBLE UNIVERSE — MASSIVE NEARBY GALAXY EXPANSION

## Scientific Catalogue Expansion, Precision 3D Mapping, Premium Galaxy Rendering, and Performance Optimization

### ROLE AND MISSION

Act as a senior astrophysicist, extragalactic astronomer, astronomical catalogue engineer, scientific visualization architect, and expert React Three Fiber / Three.js developer.

Project: **Our Visible Universe**

Repository: https://github.com/Mukulsri369/ourvisibleuniverse

**PRIMARY OBJECTIVE**

Dramatically expand the number of scientifically documented galaxies available in Our Visible Universe while preserving and improving the scientific accuracy, premium 3D visuals, realistic spatial distribution, and smooth exploration experience.

I want visitors to experience a richly populated nearby universe, rather than a small collection of famous galaxies.

The project must eventually support thousands of scientifically verified galaxies without requiring thousands of expensive high-detail 3D models in memory simultaneously.

Do not introduce fabricated galaxies or positions to satisfy a numerical target.

Work autonomously through auditing, research, ingestion, implementation, integration, optimization, and verification.

Do not stop after writing a plan.

---

# PHASE 1 — AUDIT THE EXISTING UNIVERSE IMPLEMENTATION

Thoroughly inspect the current repository and understand its architecture before modifying anything.

Pay particular attention to:

- `docs/nearby-universe-catalog.md`
- `src/stars/galaxy-catalog.ts`
- `src/stars/nearby-galaxy-data.ts`
- `src/stars/galaxy-models.ts`
- `src/stars/galaxy-populations.ts`
- `src/stars/galaxy-sky-orientation.ts`
- `src/stars/exploration-catalog.ts`
- `src/stars/exploration-scope.ts`
- `src/stars/object-hosts.ts`
- `src/stars/universal-target-factory.ts`
- `src/lib/astronomy/coordinates.ts`
- `scripts/nearby-catalog-validation.ts`
- Related shaders, rendering components, UI, navigation, and tests.

The October 2026 implementation documented 190 galaxies, including 126 additions, and 46 extragalactic H II destinations.

Treat those as historical baseline counts, not assumptions about the current branch.

Inspect current HEAD and independently calculate the present inventory.

Identify existing galaxies, aliases, canonical IDs, survey records, distances, 3D models, visual profiles, and rendering strategies.

Determine which nearby galaxies are missing.

Inspect `AGENTS.md` and preserve established project constraints.

**Do not duplicate, replace, or degrade existing curated galaxy implementations.**

Deliver an internal audit before implementation, then proceed automatically.

# PHASE 2 — EXPAND USING AUTHORITATIVE ASTRONOMICAL CATALOGUES

Research and import scientifically documented galaxies from authoritative astronomical databases.

Prioritize:

1. NASA/IPAC Extragalactic Database (NED): https://ned.ipac.caltech.edu/
2. Updated Nearby Galaxy Catalog / HEASARC: https://heasarc.gsfc.nasa.gov/W3Browse/galaxy-catalog/neargalcat.html
3. CDS SIMBAD.
4. CDS VizieR.
5. HYPERLEDA.
6. Extragalactic Distance Database / Cosmicflows: https://edd.ifa.hawaii.edu/
7. NED Local Volume Sample (NED-LVS).
8. Peer-reviewed Local Group and nearby dwarf-galaxy catalogues.
9. Relevant Hubble, JWST, GALEX, Spitzer, WISE, and resolved-stellar-population surveys.

Use current, accessible catalogue editions where available.

The 2013 Updated Nearby Galaxy Catalog includes 869 entries meeting its published distance-or-velocity selection criteria. Use it as a starting point, not as a guarantee that all entries have individually measured distances within 11 Mpc.

NED-LVS provides a much broader dataset for later expansion stages.

Inspect the actual downloadable source data, column definitions, uncertainty fields, quality flags, and licensing before importing.

NED's legacy API is deprecated. Use its currently documented API for new integrations.

Do not claim an older catalogue edition is a current 2026 measurement update.

## Expansion priority

### Stage A — Local Group

Audit and expand coverage of the actual Local Group galaxy population.

Include verified Milky Way satellites, Andromeda satellites, M33, and other documented Local Group members.

Use updated membership and distance measurements where available.

Avoid relying on outdated satellite censuses.

Do not confuse a galaxy with a globular cluster, tidal stream, or candidate of uncertain status.

Preserve existing detailed representations of the Milky Way, M31, and M33.

### Stage B — Local Volume: approximately 0–11 Mpc

Systematically process the Updated Nearby Galaxy Catalog.

Aim for high completeness among verified objects with sufficiently reliable positions and classifications.

Include:

- Spiral galaxies.
- Barred spirals.
- Elliptical galaxies.
- Lenticular galaxies.
- Irregular galaxies.
- Dwarf spheroidals.
- Dwarf ellipticals.
- Dwarf irregulars.
- Blue compact dwarf galaxies.
- Low-surface-brightness galaxies.
- Starburst galaxies.
- Galaxies in interacting systems.

Identify galaxies already present and add only genuinely missing objects.

Do not force a doubtful catalogue object into the 11 Mpc volume solely because its velocity satisfies a catalogue selection criterion.

### Stage C — Nearby Universe: 11–30 Mpc

Expand into additional scientifically documented galaxy systems.

Investigate prominent nearby groups and associations, including:

- M81 Group.
- Sculptor Group.
- Centaurus A / M83 region.
- M101 Group.
- M51 Group.
- Leo-region galaxy groups.
- Other documented nearby associations.

These are research targets, not guaranteed missing objects.

Verify membership, distances, and proper group identity rather than assigning galaxies to groups based solely on apparent sky proximity.

Prioritize well-measured galaxies first.

### Stage D — Extended Nearby Universe: 30–100 Mpc

Expand towards:

- Virgo Cluster.
- Fornax Cluster.
- Other relatively nearby galaxy groups and clusters.
- Significant interacting systems.
- Large, prominent, and scientifically interesting galaxies.

Use a hierarchical spatial representation suitable for larger distances and much higher object counts.

Galaxy groups and clusters are organizational structures, not substitutes for individual galaxy objects.

Retain the actual observational identity of individual galaxies.

Avoid creating the illusion of a complete census where the source data is incomplete.

### Stage E — Long-term scalability

Prepare the architecture for additional galaxies beyond 100 Mpc without importing millions of records unnecessarily.

Use the current scientific catalogue scope and performance budget to determine how far this release should extend.

**Desired outcome: Grow from the existing small curated collection into a substantially larger catalogue—potentially thousands of reliable galaxies—without compromising source quality or performance.**

# PHASE 3 — SCIENTIFIC IDENTITY AND DEDUPLICATION

Build a strong cross-catalogue identity reconciliation system.

Galaxies may have multiple names across:

- Messier.
- NGC.
- IC.
- PGC / LEDA.
- UGC.
- ESO.
- DDO.
- Other survey identifiers.

Different names must not create duplicate 3D objects.

Preserve a single stable canonical object identity and store all supported aliases.

Reuse existing canonical identities and stable navigation IDs where possible.

Where source catalogues disagree on object classification or membership, record the conflict and decide using evidence.

Explicitly filter out non-galaxy entries, including stars, foreground objects, nebulae, clusters, and duplicate components incorrectly matched as separate galaxies.

Create automated duplicate detection using catalogue identifiers, verified aliases, angular matching, and appropriate separation checks.

**Never deduplicate solely by nearby coordinates:** distinct interacting galaxies may lie very close together on the sky.

Preserve uncertainty about disputed memberships and galaxy candidates.

# PHASE 4 — PRECISE GALACTIC AND EXTRAGALACTIC POSITIONS

Scientific precision is non-negotiable.

For each imported galaxy, collect and normalize:

- Canonical astronomical name.
- Alternate catalogue identifiers.
- ICRS right ascension and declination.
- Coordinate epoch/reference convention.
- Galactic longitude and latitude.
- Adopted distance and units.
- Distance measurement method.
- Published distance uncertainty.
- Heliocentric radial velocity and reference frame.
- Redshift where available.
- Morphological classification.
- Apparent major/minor axes.
- Diameter measurement definition and passband.
- Position angle.
- Disk inclination where measured or defensibly inferred.
- Physical size estimates, with clearly stated definitions.
- Stellar mass, luminosity, and other optional measured properties.
- Group membership and confidence.
- Source publication, catalogue edition, and row identifiers.

Preserve existing conventions unless a verified bug necessitates a documented correction.

The current project documents one scene unit as one light-year.

Inspect the existing astronomical coordinate transforms and maintain consistent units across all scales.

Use independently validated coordinate conversion tests, not only round-trip calculations.

## Distance accuracy

Prioritize well-established redshift-independent distance methods where suitable:

1. Geometric distances where available.
2. Cepheid variables.
3. Tip of the Red Giant Branch.
4. Surface brightness fluctuations.
5. Supernova-based distances.
6. Other calibrated distance indicators.

Treat the methodological ranking as context-dependent rather than a universal accuracy ordering.

If using redshift-based distance estimates, record the assumed cosmological model, velocity frame, and uncertainty.

**Never assume Hubble's law gives precise distances for very nearby galaxies.**

Local peculiar velocities can dominate the redshift-distance relationship.

Do not turn negative radial velocities into negative distances.

Do not treat redshift as equivalent to distance.

Do not report approximate distances as exact.

Do not silently overwrite reliable existing curated measurements with less precise survey estimates.

## True 3D placement

Calculate positions from properly interpreted sky direction and adopted distance.

For a spherical position in the appropriate frame:

x = d cos(b) cos(l)

y = d cos(b) sin(l)

z = d sin(b)

Here `l` and `b` are Galactic coordinates in radians and `d` is distance in the chosen linear unit.

However, inspect and follow the existing application's axis conventions, handedness, origin, and coordinate transformations.

Do not directly substitute this example if the existing renderer uses a different axis orientation.

Ensure the Sun-centered versus Galactic-center-centered reference frame is handled correctly.

Maintain scientifically consistent relative distances and positions of the Milky Way, Andromeda, nearby groups, and distant galaxies.

Do not visually compress or stretch the actual 3D spatial layout without explicitly identifying the visualization transformation.

Unknown depth or orientation must remain an uncertainty, not a fabricated measurement.

# PHASE 5 — PREMIUM 3D GALAXY RENDERING

Every galaxy should look scientifically plausible and visually compelling.

Preserve existing premium galaxy visual quality.

Do not create thousands of identical generic glowing objects.

Develop or extend reusable morphology-aware rendering systems.

## Spiral galaxies

Provide appropriate representations of:

- Central bulge.
- Stellar disk.
- Spiral-arm structure.
- Dust distribution.
- Star-forming regions.
- Population color differences.
- Appropriate orientation and inclination.

Use observed structural characteristics where available.

Do not assume every spiral has two symmetrical arms.

## Barred spiral galaxies

Model:

- Central stellar bar.
- Spiral arms connected to the bar when appropriate.
- Correct overall orientation.
- Morphology-dependent stellar and dust distributions.

## Elliptical galaxies

Model:

- Smooth spheroidal stellar distributions.
- Appropriate projected ellipticity.
- Central concentration.
- Generally older-looking stellar populations.
- Minimal or absent spiral structure.

Avoid introducing unsupported star-forming arms.

## Irregular galaxies

Use asymmetric distributions and fragmented structures appropriate to the observed morphology.

Avoid applying spiral templates to irregular systems.

## Dwarf galaxies

Distinguish:

- Dwarf spheroidals.
- Dwarf irregulars.
- Dwarf ellipticals.
- Compact star-forming dwarfs.

Respect their relative luminosities, sizes, and stellar populations.

Do not inflate dwarf galaxies to the same apparent physical diameter as massive spirals.

## Interacting galaxies

Where scientifically supported, represent tidal distortions, asymmetries, and interacting structures.

Do not fabricate tidal tails or collisions simply because galaxies appear close together.

## Visual reconstruction rules

Use real observational structure whenever available and technically practical.

When individual internal star locations or 3D structures are unmeasured, use deterministic, scientifically informed procedural visualization.

A procedural star particle must never be presented as an individually observed star.

Avoid generic stock imagery pasted onto flat planes as substitutes for genuine 3D structures.

Use photographs only as verified reference data, texture inputs where appropriate, or clearly labeled informational imagery.

Check image licenses before using assets.

Separate measured features from illustrative reconstructions.

### Rendering quality hierarchy

**Tier 1: Featured galaxies**

Create distinctive, premium, explorable representations of the most important galaxies.

Use morphology-specific details, advanced shaders, density structures, and appropriate observational references.

**Tier 2: General catalogue galaxies**

Use scientifically informed procedural 3D models with appropriate shapes, orientation, scale, colors, and structural diversity.

These must remain real, correctly identified catalogue objects.

**Tier 3: Distant galaxy overview**

Use efficient representations at extreme distances, with accurate catalogue positions and appropriate visual scaling.

Load detailed 3D geometry only when the user approaches or selects a destination.

These tiers describe rendering complexity, not the scientific reliability of the galaxy record.

# PHASE 6 — REALISTIC UNIVERSE-SCALE EXPLORATION

The universe must feel naturally populated at every scale.

When viewing the Local Group, visitors should see its verified nearby galaxies in their correct relative positions.

When zooming farther out, progressively reveal neighboring groups, clusters, and the larger distribution of galaxies.

Implement or extend:

- Spatial level-of-detail transitions.
- Hierarchical galaxy grouping.
- Distance-aware galaxy discovery.
- Adaptive labels.
- Searchable catalogues.
- Galaxy-type filters.
- Smooth intergalactic camera travel.
- Progressive loading.
- Near/far clipping management.
- Floating-origin or camera-relative rendering where needed for numerical precision.

Preserve the existing entrance and exit logic for galaxy visits.

Follow `requireGalaxy`, explicit host membership, and existing queued navigation behavior.

Do not break visits to stars, nebulae, planets, or other objects hosted inside existing galaxies.

Ensure nearby galaxy overview, galaxy entry, interior exploration, and exit transitions all work correctly.

Do not invent intermediate stops along a space journey and describe them as real observed galaxies.

# PHASE 7 — PREMIUM GALAXY DISCOVERY INTERFACE

Integrate the new catalogue into the existing UI.

Prefer extending the current galaxy explorer rather than creating a disconnected interface.

Provide:

**Nearby Galaxies**

Browse documented galaxies sorted by distance, with uncertainty handling.

**Galaxy Groups**

Explore verified galaxy associations and their members.

**Galaxy Types**

Filter spiral, barred spiral, elliptical, irregular, dwarf, and other classifications.

**Featured Destinations**

Highlight visually and scientifically interesting galaxies.

**Explore Galaxy**

Smoothly navigate from the Universe overview into the selected galaxy's established exploration experience.

**Scientific Details**

Display available information including distance, uncertainty, morphological type, diameter, membership, notable features, and observational sources.

Add a clear distinction between measured, estimated, and artistically reconstructed properties.

Make the interface easy to use on both desktop and mobile.

Avoid excessive text labels when many galaxies occupy the same region of the screen.

# PHASE 8 — SCALABLE CATALOGUE INGESTION

Do not manually hardcode thousands of records into a single enormous TypeScript file.

Create or extend a maintainable catalogue pipeline that:

1. Downloads or reads properly licensed authoritative source catalogues.
2. Preserves original raw-source references and versions.
3. Normalizes astronomical identifiers and units.
4. Reconciles duplicate identities.
5. Validates classifications and measurements.
6. Records uncertainty and source provenance.
7. Produces deterministic, version-controlled application data.
8. Splits data into appropriate chunks where necessary.
9. Supports incremental future catalogue updates.
10. Produces coverage and rejection reports.

Avoid repeatedly importing unchanged data.

Ensure the pipeline is reproducible and testable.

Prefer build-time catalogue preparation over expensive runtime calls.

Do not add a paid catalogue API dependency.

Do not commit enormous raw survey files when smaller validated and attributed derived datasets are sufficient.

Do not download the entire NED-LVS catalogue solely to render a few thousand nearby galaxies if a more efficient documented subset can be obtained.

Use stable IDs so future catalogue updates do not break saved object links.

# PHASE 9 — PERFORMANCE OPTIMIZATION

The expanded universe must remain responsive.

Do not mount expensive detailed 3D galaxy models for every catalogue object simultaneously.

Use:

- GPU instancing.
- Typed arrays and compact data layouts.
- Hierarchical spatial indexing.
- Frustum culling.
- LOD transitions.
- Chunked loading.
- Geometry and material reuse.
- GPU-friendly procedural rendering.
- Camera-relative coordinates where appropriate.
- Adaptive label density.
- Memory cleanup.
- Mobile-specific quality scaling.

Preserve the current architecture in which detailed contents load for the selected galaxy.

Ensure galaxy models and their interior content unload appropriately when users leave.

Do not add heavy permanent render loops for off-screen galaxies.

Measure frame rate, load time, memory consumption, and object counts before and after the expansion.

Test representative zoom levels:

- Inside the Milky Way.
- Milky Way and Andromeda overview.
- Local Group.
- 11 Mpc Local Volume.
- 30 Mpc galaxy environment.
- Extended nearby universe.

Use measured results instead of invented performance figures.

Aim for smooth interaction on common desktop and mobile devices, adjusting visible complexity to hardware capability.

Performance must not be sacrificed merely to increase catalogue count.

# PHASE 10 — AUTOMATED SCIENTIFIC VALIDATION

Extend `scripts/nearby-catalog-validation.ts` and related suites.

Important: the previous test implementation hardcoded the 190-galaxy, 126-addition, and 46-H-II counts.

Replace obsolete fixed galaxy-count assumptions with a versioned coverage manifest and meaningful verification of intended imported datasets.

Do not simply remove assertions to make tests pass.

Test:

1. Unique canonical galaxy IDs.
2. Correct alias resolution.
3. Cross-source duplicate prevention.
4. Correct galaxy classification.
5. Valid coordinate ranges.
6. ICRS-to-Galactic transformation.
7. Independent coordinate reference anchors.
8. Parsec, megaparsec, and light-year conversions.
9. Distance and uncertainty propagation.
10. Distinction between redshift, radial velocity, and distance.
11. Correct 3D positions.
12. Correct angular and physical size definitions.
13. Galaxy orientation and position angles.
14. Correct grouping and membership provenance.
15. Existing galaxy-record preservation.
16. Catalogue source completeness and validation coverage.
17. Search by any supported catalogue name.
18. Galaxy selection.
19. Camera navigation.
20. Galaxy entry and exit.
21. Proper loading and unloading of hosted objects.
22. Absence of WebGL errors and resource leaks.

Add scientific regression tests for representative known galaxies across multiple sky quadrants and distance ranges.

Compare computed Cartesian separations against independently calculated reference examples.

Check nearby systems for mirrored axes, swapped coordinates, incorrect signs, and unit-scaling mistakes.

Do not assume two internally consistent functions prove astronomical correctness.

# PHASE 11 — IMPLEMENTATION IN SAFE BATCHES

Implement the expansion as a series of independently validated batches.

Suggested order:

**Batch 1 — Inventory and source normalization**

Audit existing data, establish catalogue precedence, and create the ingestion and deduplication pipeline.

**Batch 2 — Local Group completion**

Add validated missing Local Group members and improve uncertain identifications.

**Batch 3 — Local Volume expansion**

Systematically ingest the 11 Mpc catalogue's qualifying and independently verified galaxy records.

**Batch 4 — Additional nearby groups**

Expand to approximately 30 Mpc using reliable documented distances.

**Batch 5 — Extended nearby structures**

Add selected galaxies and clusters out to approximately 100 Mpc where suitable.

**Batch 6 — Premium visuals**

Improve morphological diversity and create distinctive detailed featured destinations.

**Batch 7 — Performance and navigation**

Optimize large-scale rendering, camera controls, exploration, and search.

**Batch 8 — Final scientific and technical QA**

Complete validation, regression testing, browser checks, and reporting.

Complete useful implementation work in each batch rather than only writing plans.

Do not continue importing new data if a previous batch has unresolved identity, coordinate, or integration failures.

Preserve reproducible checkpoints.

Do not modify production systems, payment behavior, live user databases, deployment settings, or DNS.

Do not force-push or rewrite published Git history.

# PHASE 12 — FINAL DELIVERABLES

Implement the work in the existing repository.

Create:

`docs/NEARBY_GALAXY_EXPANSION_MASTER_REPORT.md`

Include:

### A. Catalogue inventory

- Current galaxy count before expansion.
- New galaxy count.
- Total after expansion.
- Breakdown by distance range.
- Breakdown by morphology.
- Count of verified distance measurements versus estimates.

### B. Scientific evidence

- Source catalogues and editions.
- Distance methods.
- Uncertainty handling.
- Catalogue identity reconciliations.
- Disputed or excluded records.
- Incomplete survey coverage.

### C. 3D implementation

- Coordinate transformations.
- Galaxy scale conversions.
- Morphology models.
- Rendering tiers.
- Procedural reconstruction assumptions.

### D. Performance

- Initial frame-rate measurements.
- Final frame-rate measurements.
- Load and memory comparisons.
- Total visible objects.
- Mobile performance limitations.

### E. Verification

- Tests executed.
- Exact commands.
- Results and failures.
- Browser verification.
- Regressions addressed.

### F. Future expansion

- Remaining missing galaxies.
- New catalogues worth incorporating.
- Recommended coverage milestones.
- Outstanding scientific and rendering limitations.

Include a machine-readable catalogue coverage report and source manifest.

Do not claim a galaxy was imported unless the actual application catalogue contains its validated record.

Do not claim an object is navigable without verifying integration.

Do not report fictional performance metrics.

# NON-NEGOTIABLE RULES

1. **Scientific accuracy over arbitrary galaxy counts.**
2. **No duplicate galaxies under different catalogue names.**
3. **No fabricated distances, physical properties, or measured 3D positions.**
4. **No invented individual stars or planets presented as observed objects.**
5. **No overwriting established high-quality curated data without documented justification.**
6. **Preserve the existing galaxy exploration functionality.**
7. **Maintain premium, morphology-appropriate 3D visuals.**
8. **Do not make thousands of detailed galaxies simultaneously active.**
9. **Preserve coordinate units, spatial relationships, and uncertainty.**
10. **Every imported scientific object must have traceable catalogue provenance.**
11. **No unsupported claims of catalogue completeness or physical precision.**
12. **Test the application after every implementation batch.**
13. **Do not modify production infrastructure or live customer data.**
14. **Do not stop at analysis: implement everything safely achievable in the development environment.**

# SUCCESS CRITERIA

Our Visible Universe should evolve into a scientifically grounded, richly populated 3D map of the nearby universe.

A visitor should be able to zoom outward from the Milky Way, discover the Local Group, explore nearby galaxy groups, continue towards the Virgo region, and observe the actual large-scale distribution of galaxies.

Every searchable galaxy must represent a real, scientifically supported astronomical object with defensible identity, position, distance information, and appropriate visual treatment.

The experience should look and feel like a premium interactive universe simulator rather than a collection of random 3D galaxy models.

**Begin by inspecting the existing code and scientific catalogue. Then implement the expansion in validated batches until the scientifically defensible and performance-safe scope is complete. Report the actual result and any remaining gaps.**
