# Solar navigation and orbital controls — 29 October 2026

## Changes

- Solar System visits and Sun visits follow the live Sun registry instead of a fixed fly-to coordinate. The camera retains the moving reference frame during orbit/zoom; Galactic travel continues.
- The reconstructed Milky Way disk used the opposite shader rotation sign from the Sun's Galactic model. Its stars and dust now use the same prograde scene convention. The Sun's physical orbit, ecliptic orientation and radial/vertical motion were preserved. Reconstructed galaxy pattern speeds remain illustrative.
- Free look starts only through the manual control or keyboard shortcut. Startup, galaxy arrival and nebula arrival keep it off. Completed passages retain their endpoint viewpoint. A manual button remains available with the clean interface; enabling it minimizes the map.
- Passage percentage/progress windows were removed. Compact pause/resume and exit/return buttons remain available.
- Settings now expose Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune and Pluto separately. Rates default to 1×, can be slowed or paused, and integrate independently without jumping orbital phase. Reset restores rates without teleporting bodies. Global time, Galactic travel and moon-relative orbital time remain independent.
- Position/velocity and Earth distance tools read the displayed per-planet orbital phases. The existing shared-date distance API remains backward compatible.
- Planet trails now record intermediate ephemeris samples. Moon trails sample both their orbit and the curved parent path, including retrograde/fallback moon periods. Sampling is bounded at 128 substeps for extreme time compression.
- Trail GPU positions use high/low components with camera-relative subtraction, preserving small moon paths at large Galactic coordinates. Existing ring buffers, incremental uploads, projected-size culling and history restoration remain active.

These per-planet rates are educational time controls, not a claim that real planets can change their physical orbital periods independently.

## Verification

- `npm run test:solar-controls`: nine independent clocks, continuous rate changes, exact individual pause, default/reset behavior, unchanged moon/Galactic clocks, matching rotation sense, split-coordinate precision and two-phase distance measurements.
- Existing Galactic-motion, navigation, galaxy-entry, nebula-entry, galaxy-explorer and JPL validation suites.
- Actual browser scenarios: opt-in free look at startup/arrival, fixed galaxy/nebula endpoints, all nine control presets and reset, moving-Sun tracking at 100,000,000× Galactic travel, trail shader/attribute checks, manual mode switch and progress-window removal.
- Phone pointer check verifies that the clean-interface Free look button can be reached and that activation closes the map.
- Build, TypeScript and changed-code lint results are recorded with the local QA logs under `.taste-skill/solar-*`.

Astronomy reference: [NASA's Sun/Milky Way orbit overview](https://starchild.gsfc.nasa.gov/docs/StarChild/questions/question18.html). The rotation correction concerns this application's scene/shader convention; it does not replace the existing Galactic potential model with an observational ephemeris.

Changes are local until a separate publish request.

Final verification: all seven targeted suites passed, all eight desktop browser scenarios passed, the phone pointer check passed, TypeScript and the Lovable-target build passed, and changed-code lint finished with zero errors (existing Planets.tsx fast-refresh warnings remain).
