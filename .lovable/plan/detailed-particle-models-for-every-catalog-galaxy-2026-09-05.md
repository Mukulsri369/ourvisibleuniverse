# Detailed particle models for every catalog galaxy

## Scope
- Give every named galaxy in the sitemap a deterministic, particle-based 3D model at its measured position, orientation, and physical diameter.
- Preserve the existing detailed Milky Way, Andromeda, and exoplanet-host galaxy implementations.
- Do not add fictional exoplanets or star systems to galaxies without known/modelled systems.

## Implementation
1. Extend the galaxy model format so particle-only galaxies can omit a planetary system.
2. Generate fallback detail profiles from each catalog galaxy’s real type and dimensions:
   - spirals/barred spirals: disk, arms, bulge, bar, dust, and star-forming regions;
   - ellipticals/dwarf spheroidals: smooth flattened stellar distributions and halos;
   - irregular/starburst galaxies: asymmetric clumps and young-star regions;
   - lenticular/edge-on galaxies: thin disks, large bulges, and dust lanes;
   - interacting systems: disturbed twin concentrations and tidal structure.
3. Add all remaining named galaxies to the detailed model collection with stable seeded geometry and conservative particle budgets.
4. Keep detail behind the existing proximity/selection gate, and fade out each distant placeholder as its particle model appears.
5. Update galaxy labels and descriptions so all catalog galaxies are marked as visually modelled, while only genuine existing system entries show planetary-system details.
6. Verify the app builds, selecting multiple formerly lightweight galaxies reveals particles, and no new runtime errors appear.

## Technical notes
- Reuse the current GPU point shader and geometry cache rather than mounting every particle cloud at startup.
- Derive morphology settings deterministically from catalog metadata, with explicit overrides where a galaxy’s known structure requires it.
- Keep navigation aimed at the galaxy itself for entries without a star-system focus.
