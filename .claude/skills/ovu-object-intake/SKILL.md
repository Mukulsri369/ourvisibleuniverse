---
name: ovu-object-intake
description: Use before adding or changing any astronomical object, catalogue record, alias, host galaxy, measured value or reference image in Our Visible Universe (stars, planets, moons, nebulae, galaxies, quasars, black holes, compact objects). Enforces sourced values with uncertainty, measured-versus-reconstruction labels, explicit host membership, image licences and the validation suites.
---

# OVU object intake

Scientific accuracy outranks coverage. A smaller, sourced catalogue is correct; a padded one is not. Read `AGENTS.md`, the latest sections of `docs/PROJECT_HANDOFF.md`, and the report for the area you touch (for example `docs/ANDROMEDA_EXPANSION_REPORT.md`, `docs/NEARBY_GALAXY_EXPANSION_MASTER_REPORT.md`, `docs/scientific-accuracy-inventory.md`, `docs/catalog-provenance.md`) before editing.

## Where things live

| What                                                                                        | Where                                                                                                                                         |
| ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Curated destinations (example: `M31_TARGETS`)                                               | `src/stars/*-catalog.ts`, e.g. `src/stars/andromeda-catalog.ts`                                                                               |
| Explicit host membership                                                                    | `src/stars/object-hosts.ts` (`MILKY_WAY`, `ANDROMEDA`, `EXTRA_HOSTS` with a `source` per host)                                                |
| Nearby-galaxy catalogue (64-record chunks, aliases, coordinate references, source manifest) | `src/stars/catalog-data/nearby-v2/`                                                                                                           |
| Coordinates, frames, units, Gaia, JPL, NED, ingestion                                       | `src/lib/astronomy/`                                                                                                                          |
| Reference images and credits                                                                | `public/textures/{solar,nebulae,galaxies}/`, `sources.json`, `CREDITS.md`; `src/stars/nebula-references.ts`, `src/stars/galaxy-references.ts` |

## Checklist for every object or value

1. **Identity.** Use the canonical identifier and record its aliases. Search the existing aliases first (`aliases.json`, the `aliases` fields) so nothing is duplicated. Never change an existing `id`; history and links depend on it.
2. **Position.** Give RA/Dec with its frame and epoch (the curated catalogues use J2000 through the `h()`/`d()` helpers). If component astrometry is unknown, reuse a documented centre and say so in `positionNote`. Never invent offsets.
3. **Distance and measurements.** Store the adopted value, its uncertainty, the method and a citation (DOI, NED, SIMBAD, ADS or the mission page). If an error bar is missing, record it as missing. Never use zero error, a guessed velocity or a "typical" value.
4. **Measured or reconstruction.** Shapes, depth, colours, orientation and sample counts that were not measured must be labelled illustrative or reconstructed in `facts`/`description`. Unconfirmed objects stay labelled unconfirmed (for example PA-99-N2 is an educational exhibit, not a planet).
5. **Host membership.** Assign it explicitly in `object-hosts.ts` with a source. Never infer membership from distance. Respect `requireGalaxy`; mount a galaxy's named contents only during its entering/inside phases; queued visits run only after entry completes.
6. **Live sources.** For counts that change (exoplanets, gravitational-wave events, survey releases), store the retrieval date and the release or edition. Never hard-code a "current total".
7. **New survey editions** (Gaia DR4 is due 2 December 2026): crossmatch, because IDs can change between releases. Never silently replace adopted values; keep identity history.
8. **Images.** Record source page, credit line, licence and any changes in `sources.json` or `CREDITS.md` (CC BY requires noting changes). Typical terms:
   - ESA/Hubble and ESA/Webb: CC BY 4.0, with no implied endorsement and no logos.
   - NASA/STScI: public domain with credit.
   - ESO and Solar System Scope: CC BY 4.0.
   - **Digitized Sky Survey (DSS): commercial use is prohibited without permission.** OVU is a paid product, so check before using it.
   - If the terms are unclear, leave the image out and note it.
9. **No padding.** Add candidates individually, with membership, measured properties and uncertainty verified. Defer anything unverified and list it as deferred.

## Validation

Run the suites that cover your change. The common set:

```
npm run test                      # astronomy-validation
npm run test:catalog
npm run test:consistency
npm run test:nearby-expansion
npm run ingest:nearby-catalog -- --check   # deterministic regeneration of frozen inputs
npm run test:galaxy-explorer
npm run test:galaxy-entry
npm run test:nebulae
npm run test:black-holes
npm run test:compact
npx tsx scripts/andromeda-expansion-validation.ts
npx tsx scripts/andromeda-remaining-validation.ts
npx tsc --noEmit
```

Many renderer modules use `@ts-nocheck`, so a clean TypeScript run does not prove those files work at runtime. Do not skip, delete or weaken a test to make a change pass.

## Hand-off

Update the relevant report and `docs/PROJECT_HANDOFF.md` with what was added, its sources, the checks actually run, what was deferred and the commit and push state. Never describe an unexecuted check as passed. Deployment always needs the owner's explicit approval.
