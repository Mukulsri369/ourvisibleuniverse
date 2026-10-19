# Module 12 Cinematic Storyboard — Exoplanets & Alien Worlds

- **Module ID**: `12` (`stageId: "stage-3-life-of-stars"`, Course: `"cosmic-journey"`)
- **Total Instructional Chapters (Sublessons)**: **4**
- **Total Mapped Narration Segments**: **13** (`explorer` canonical sequence; adapted across `junior`, `explorer`, `astronomer`)
- **Primary 3D Scene & Component**: `m12_exoplanet_observatory_3d` (`src/components/academy/ExoplanetObservatory3D.tsx`)
- **Visual Style & Lighting Preset**: `stage3_stellar_radiance` | `stellar_point_blackbody` (`ACES Filmic`, `exposure: 1.05`, `bloomThreshold: 0.80`)
- **Primary Interactive Activity Gate**: `act_12_transit_detection_lab` — *Exoplanet Transit Photometry Lab* (Detect planetary transit from stellar flux light curve dip.)
- **Scientific References**: NASA Exoplanet Archive: Confirmed Planets Data Table (NASA / Caltech IPAC - https://exoplanetarchive.ipac.caltech.edu/); Mayor & Queloz (1995) A Jupiter-Mass Companion to a Solar-Type Star (Nature (Vol 378, pp 355–359) - https://www.nature.com/articles/378355a0); Gillon et al. (2017) Seven temperate terrestrial planets around TRAPPIST-1 (Nature (Vol 542, pp 456–460) - https://www.nature.com/articles/nature21360); Kopparapu et al. (2013) Habitable Zones around Main-Sequence Stars: New Estimates (The Astrophysical Journal (ApJ 765, 131) - https://iopscience.iop.org/article/10.1088/0004-637X/765/2/131)

---

## Chapter 12.1 — The Exoplanet Revolution: Beyond Our Solar System (`12-1`)

- **Storyboard ID**: `sb-m12-12-1`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION` — *Transit chord and stellar reflex wobble amplitude exaggerated for geometric clarity; light curve dip ΔF/F = (R_p/R_*)^2 is exact.*
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `heliocentric_au` | `data_visualization_view` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of The Exoplanet Revolution: Beyond Our Solar System within Exoplanets & Alien Worlds.
  2. An exoplanet (extrasolar planet) is any planet that orbits a star outside our solar system.
- **Mapped Narration Segments (4)**: `12-12-1-title`, `12-12-1-explanation-1`, `12-12-1-explanation-2`, `12-12-1-explanation-3`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m12-12-1-beat-1`**<br>*The Exoplanet Revolution: Beyond Our Solar System — Primary Physical Mechanism* | `12-12-1-title`<br>`12-12-1-explanation-1` | The Exoplanet Revolution: Beyond Our Solar System An exoplanet (extrasolar planet) is any planet that orbits a star outside our solar system. | `data_visualization_view` in `heliocentric_au`<br>Transition: `observational_data_reveal` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m12-12-1-beat-2`**<br>*The Exoplanet Revolution: Beyond Our Solar System — Quantitative Analysis & Interactive Synthesis* | `12-12-1-explanation-2`<br>`12-12-1-explanation-3` | Because exoplanets are trillions of kilometers away and drowned out by the blinding glare of their host stars, direct photography is exceptionally difficult—comparable to spotting a firefly buzzing next to a giant searchlight thousands of kilometers away. Inst | `planetary_orbital_shot` in `heliocentric_au`<br>Transition: `smooth_orbital_travel` | Labels: `The Exoplanet Revolution: Beyond Our Solar System Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m12-1-param` (The Exoplanet Revolution: Beyond Our Solar System Parameter Explorer — selector `#module-12-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for The Exoplanet Revolution: Beyond Our Solar System (act_12_lightcurve_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 12.2 — Transit Photometry: Measuring Light Dips and Planet Sizes (`12-2`)

- **Storyboard ID**: `sb-m12-12-2`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION` — *Transit chord and stellar reflex wobble amplitude exaggerated for geometric clarity; light curve dip ΔF/F = (R_p/R_*)^2 is exact.*
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `heliocentric_au` | `data_visualization_view` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Transit Photometry: Measuring Light Dips and Planet Sizes within Exoplanets & Alien Worlds.
  2. Transit photometry measures the periodic dip in a star's apparent brightness as an exoplanet transits across the stellar disk. The fractiona
- **Mapped Narration Segments (3)**: `12-12-2-title`, `12-12-2-explanation-1`, `12-12-2-explanation-2`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m12-12-2-beat-1`**<br>*Transit Photometry: Measuring Light Dips and Planet Sizes — Primary Physical Mechanism* | `12-12-2-title`<br>`12-12-2-explanation-1` | Transit Photometry: Measuring Light Dips and Planet Sizes Transit photometry measures the periodic dip in a star's apparent brightness as an exoplanet transits across the stellar disk. The fractional dip depth (ΔF / F) is equal to the ratio of planetary cross- | `data_visualization_view` in `heliocentric_au`<br>Transition: `observational_data_reveal` | Labels: `transit photometry`<br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m12-12-2-beat-2`**<br>*Transit Photometry: Measuring Light Dips and Planet Sizes — Quantitative Analysis & Interactive Synthesis* | `12-12-2-explanation-2` | 0084% (84 parts per million), requiring ultra-precise space observatories like Kepler and TESS. | `scientific_cross_section` in `heliocentric_au`<br>Transition: `smooth_orbital_travel` | Labels: `Transit Photometry: Measuring Light Dips and Planet Sizes Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m12-2-param` (Transit Photometry: Measuring Light Dips and Planet Sizes Parameter Explorer — selector `#module-12-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Transit Photometry: Measuring Light Dips and Planet Sizes (act_12_lightcurve_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 12.3 — Radial Velocity: The Gravitational Stellar Wobble (`12-3`)

- **Storyboard ID**: `sb-m12-12-3`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION` — *Transit chord and stellar reflex wobble amplitude exaggerated for geometric clarity; light curve dip ΔF/F = (R_p/R_*)^2 is exact.*
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `heliocentric_au` | `data_visualization_view` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Radial Velocity: The Gravitational Stellar Wobble within Exoplanets & Alien Worlds.
  2. The radial velocity (Doppler wobble) method tracks periodic Doppler shifts in a star's spectral absorption lines. As the star moves toward E
- **Mapped Narration Segments (3)**: `12-12-3-title`, `12-12-3-explanation-1`, `12-12-3-explanation-2`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m12-12-3-beat-1`**<br>*Radial Velocity: The Gravitational Stellar Wobble — Primary Physical Mechanism* | `12-12-3-title`<br>`12-12-3-explanation-1` | Radial Velocity: The Gravitational Stellar Wobble The radial velocity (Doppler wobble) method tracks periodic Doppler shifts in a star's spectral absorption lines. As the star moves toward Earth in its orbit about the mutual barycenter, spectral lines blueshif | `data_visualization_view` in `heliocentric_au`<br>Transition: `observational_data_reveal` | Labels: `radial velocity`<br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m12-12-3-beat-2`**<br>*Radial Velocity: The Gravitational Stellar Wobble — Quantitative Analysis & Interactive Synthesis* | `12-12-3-explanation-2` | The amplitude of this velocity wave (K) depends on the planet's mass and orbital inclination.  Because the inclination angle i is usually unknown without a transit, radial velocity yields the minimum mass: M_p * sin(i). | `planetary_orbital_shot` in `heliocentric_au`<br>Transition: `smooth_orbital_travel` | Labels: `Radial Velocity: The Gravitational Stellar Wobble Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m12-3-param` (Radial Velocity: The Gravitational Stellar Wobble Parameter Explorer — selector `#module-12-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Radial Velocity: The Gravitational Stellar Wobble (act_12_lightcurve_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 12.4 — Habitable Zones & Atmospheric Spectroscopy (`12-4`)

- **Storyboard ID**: `sb-m12-12-4`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION` — *Transit chord and stellar reflex wobble amplitude exaggerated for geometric clarity; light curve dip ΔF/F = (R_p/R_*)^2 is exact.*
- **Interactivity Mode**: `REQUIRED_LEARNING_ACTIVITY`
- **Coordinate Frame & Camera Preset**: `heliocentric_au` | `data_visualization_view` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Habitable Zones & Atmospheric Spectroscopy within Exoplanets & Alien Worlds.
  2. The circumstellar habitable zone (HZ) is the orbital shell where liquid water can stably exist on a planet's surface under suitable atmosphe
- **Mapped Narration Segments (3)**: `12-12-4-title`, `12-12-4-explanation-1`, `12-12-4-explanation-2`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m12-12-4-beat-1`**<br>*Habitable Zones & Atmospheric Spectroscopy — Primary Physical Mechanism* | `12-12-4-title`<br>`12-12-4-explanation-1` | Habitable Zones & Atmospheric Spectroscopy The circumstellar habitable zone (HZ) is the orbital shell where liquid water can stably exist on a planet's surface under suitable atmospheric pressure. The boundaries depend primarily on stellar luminosity: inner ed | `data_visualization_view` in `heliocentric_au`<br>Transition: `observational_data_reveal` | Labels: `habitable zone`<br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m12-12-4-beat-2`**<br>*Habitable Zones & Atmospheric Spectroscopy — Quantitative Analysis & Interactive Synthesis* | `12-12-4-explanation-2` | Atmospheric transmission spectroscopy, conducted during transit as starlight filters through the planetary atmosphere's thin ring, reveals chemical signatures such as H2O, CO2, CH4, and aerosol hazes. | `data_visualization_view` in `heliocentric_au`<br>Transition: `observational_data_reveal` | Labels: `Habitable Zones & Atmospheric Spectroscopy Telemetry`<br>Gate: `REQUIRED_LEARNING_ACTIVITY` (Requires `act_12_transit_detection_lab`) |

- **Interactive Controls**: `ctrl-m12-4-param` (Habitable Zones & Atmospheric Spectroscopy Parameter Explorer — selector `#module-12-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Habitable Zones & Atmospheric Spectroscopy (act_12_lightcurve_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---
