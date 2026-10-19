# Module 03 Cinematic Storyboard — Cosmic Distances & Scale

- **Module ID**: `03` (`stageId: "stage-1-discovering-space"`, Course: `"cosmic-journey"`)
- **Total Instructional Chapters (Sublessons)**: **6**
- **Total Mapped Narration Segments**: **36** (`explorer` canonical sequence; adapted across `junior`, `explorer`, `astronomer`)
- **Primary 3D Scene & Component**: `m03_cosmic_distance_ladder_3d` (`src/components/academy/CosmicScaleExplorer.tsx (Upgrading to CosmicDistanceLadder3D.tsx)`)
- **Visual Style & Lighting Preset**: `stage1_cosmic_horizon` | `solar_directional_5772K` (`ACES Filmic`, `exposure: 1.05`, `bloomThreshold: 0.80`)
- **Primary Interactive Activity Gate**: `act_03_distance_ladder_lab` — *Distance Ladder Calibration Lab* (Calculate stellar parallax and convert angular shift in milliarcseconds to parsecs.)
- **Scientific References**: Measuring Cosmic Distances (NASA - https://science.nasa.gov/universe/exoplanets/how-do-we-measure-distances-in-space/)

---

## Chapter 03.1 — Kilometers in space (`lesson-1-kilometers-in-space`)

- **Storyboard ID**: `sb-m03-lesson-1-kilometers-in-space`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION` — *Ruler transitions across km, AU (1.496×10^8 km), light-years (9.46×10^12 km), and megaparsecs.*
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `heliocentric_au` | `scale_comparison_view` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Kilometers in space within Cosmic Distances & Scale.
  2. Astronomers require specialized units (AU, light-year, parsec) because ordinary human metric units result in cumbersome numbers prone to not
- **Mapped Narration Segments (6)**: `03-lesson-1-kilometers-in-space-title`, `03-lesson-1-kilometers-in-space-takeaway-1`, `03-lesson-1-kilometers-in-space-deepDive-1`, `03-lesson-1-kilometers-in-space-deepDive-2`, `03-lesson-1-kilometers-in-space-didYouKnow-1`, `03-lesson-1-kilometers-in-space-mathOrAnalogy-1`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m03-lesson-1-kilometers-in-space-beat-1`**<br>*Kilometers in space — Primary Physical Mechanism* | `03-lesson-1-kilometers-in-space-title`<br>`03-lesson-1-kilometers-in-space-takeaway-1`<br>`03-lesson-1-kilometers-in-space-deepDive-1` | Kilometers in space Astronomers require specialized units (AU, light-year, parsec) because ordinary human metric units result in cumbersome numbers prone to notation errors. Originally, the meter was defined in 1791 as one ten-millionth of the distance from th | `scale_comparison_view` in `heliocentric_au`<br>Transition: `scale_aware_cosmic_zoom` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m03-lesson-1-kilometers-in-space-beat-2`**<br>*Kilometers in space — Quantitative Analysis & Interactive Synthesis* | `03-lesson-1-kilometers-in-space-deepDive-2`<br>`03-lesson-1-kilometers-in-space-didYouKnow-1`<br>`03-lesson-1-kilometers-in-space-mathOrAnalogy-1` | To manage these scales, science uses scientific notation (powers of ten) and natural physical constants. A highway billboard listing the distance to the nearest star in kilometers would read: 'Next Star: 40,140,000,000,000 km. Keep Right!' 1 kilometer = 10^3 m | `planetary_orbital_shot` in `heliocentric_au`<br>Transition: `smooth_orbital_travel` | Labels: `Kilometers in space Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m03-1-param` (Kilometers in space Parameter Explorer — selector `#module-03-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Kilometers in space (act_03_parallax_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 03.2 — Astronomical units (AU) (`lesson-2-astronomical-units`)

- **Storyboard ID**: `sb-m03-lesson-2-astronomical-units`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION` — *Ruler transitions across km, AU (1.496×10^8 km), light-years (9.46×10^12 km), and megaparsecs.*
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `heliocentric_au` | `scale_comparison_view` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Astronomical units (AU) within Cosmic Distances & Scale.
  2. In 2012, the International Astronomical Union (IAU) re-anchored the AU as an exact fixed physical constant in SI meters rather than an orbit
- **Mapped Narration Segments (6)**: `03-lesson-2-astronomical-units-title`, `03-lesson-2-astronomical-units-takeaway-1`, `03-lesson-2-astronomical-units-deepDive-1`, `03-lesson-2-astronomical-units-deepDive-2`, `03-lesson-2-astronomical-units-didYouKnow-1`, `03-lesson-2-astronomical-units-mathOrAnalogy-1`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m03-lesson-2-astronomical-units-beat-1`**<br>*Astronomical units (AU) — Primary Physical Mechanism* | `03-lesson-2-astronomical-units-title`<br>`03-lesson-2-astronomical-units-takeaway-1`<br>`03-lesson-2-astronomical-units-deepDive-1` | Astronomical units (AU) In 2012, the International Astronomical Union (IAU) re-anchored the AU as an exact fixed physical constant in SI meters rather than an orbital calculation. Historically, determining the absolute kilometer value of the AU was astronomy's | `scale_comparison_view` in `heliocentric_au`<br>Transition: `scale_aware_cosmic_zoom` | Labels: `astronomical unit`<br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m03-lesson-2-astronomical-units-beat-2`**<br>*Astronomical units (AU) — Quantitative Analysis & Interactive Synthesis* | `03-lesson-2-astronomical-units-deepDive-2`<br>`03-lesson-2-astronomical-units-didYouKnow-1`<br>`03-lesson-2-astronomical-units-mathOrAnalogy-1` | In the 18th and 19th centuries, global expeditions measured the Transit of Venus across the Sun using triangulation parallax to compute the first accurate value.  Today, NASA's Deep Space Network uses interplanetary radar ranging to measure planetary distances | `scientific_cross_section` in `heliocentric_au`<br>Transition: `smooth_orbital_travel` | Labels: `Astronomical units (AU) Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m03-2-param` (Astronomical units (AU) Parameter Explorer — selector `#module-03-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Astronomical units (AU) (act_03_parallax_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 03.3 — Light-seconds and light-minutes (`lesson-3-light-seconds-and-light-minutes`)

- **Storyboard ID**: `sb-m03-lesson-3-light-seconds-and-light-minutes`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION` — *Ruler transitions across km, AU (1.496×10^8 km), light-years (9.46×10^12 km), and megaparsecs.*
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `heliocentric_au` | `scale_comparison_view` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Light-seconds and light-minutes within Cosmic Distances & Scale.
  2. 1 light-second ≈ 3.0 x 10^5 km; 1 light-minute ≈ 1.8 x 10^7 km; 1 light-hour ≈ 1.08 x 10^9 km.
- **Mapped Narration Segments (6)**: `03-lesson-3-light-seconds-and-light-minutes-title`, `03-lesson-3-light-seconds-and-light-minutes-takeaway-1`, `03-lesson-3-light-seconds-and-light-minutes-deepDive-1`, `03-lesson-3-light-seconds-and-light-minutes-deepDive-2`, `03-lesson-3-light-seconds-and-light-minutes-didYouKnow-1`, `03-lesson-3-light-seconds-and-light-minutes-mathOrAnalogy-1`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m03-lesson-3-light-seconds-and-light-minutes-beat-1`**<br>*Light-seconds and light-minutes — Primary Physical Mechanism* | `03-lesson-3-light-seconds-and-light-minutes-title`<br>`03-lesson-3-light-seconds-and-light-minutes-takeaway-1`<br>`03-lesson-3-light-seconds-and-light-minutes-deepDive-1` | Light-seconds and light-minutes 1 light-second ≈ 3.0 x 10^5 km; 1 light-minute ≈ 1.8 x 10^7 km; 1 light-hour ≈ 1.08 x 10^9 km. NASA mission engineers cannot drive Mars rovers (Curiosity, Perseverance) with a real-time joystick. Depending on Earth and Mars's or | `scale_comparison_view` in `heliocentric_au`<br>Transition: `scale_aware_cosmic_zoom` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m03-lesson-3-light-seconds-and-light-minutes-beat-2`**<br>*Light-seconds and light-minutes — Quantitative Analysis & Interactive Synthesis* | `03-lesson-3-light-seconds-and-light-minutes-deepDive-2`<br>`03-lesson-3-light-seconds-and-light-minutes-didYouKnow-1`<br>`03-lesson-3-light-seconds-and-light-minutes-mathOrAnalogy-1` | Consequently, rovers must use onboard computer vision and hazard avoidance algorithms to navigate Martian terrain autonomously. When the New Horizons spacecraft flew past Pluto in 2015, its celebratory radio ping took 4.5 hours to travel across the solar syste | `planetary_orbital_shot` in `heliocentric_au`<br>Transition: `smooth_orbital_travel` | Labels: `Light-seconds and light-minutes Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m03-3-param` (Light-seconds and light-minutes Parameter Explorer — selector `#module-03-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Light-seconds and light-minutes (act_03_parallax_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 03.4 — Light-years (`lesson-4-light-years`)

- **Storyboard ID**: `sb-m03-lesson-4-light-years`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION` — *Ruler transitions across km, AU (1.496×10^8 km), light-years (9.46×10^12 km), and megaparsecs.*
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `heliocentric_au` | `scale_comparison_view` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Light-years within Cosmic Distances & Scale.
  2. 1 light-year = c x (365.25 x 86,400s) = 9,460,730,472,580,800 meters ≈ 9.46 trillion km ≈ 63,241 AU.
- **Mapped Narration Segments (6)**: `03-lesson-4-light-years-title`, `03-lesson-4-light-years-takeaway-1`, `03-lesson-4-light-years-deepDive-1`, `03-lesson-4-light-years-deepDive-2`, `03-lesson-4-light-years-didYouKnow-1`, `03-lesson-4-light-years-mathOrAnalogy-1`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m03-lesson-4-light-years-beat-1`**<br>*Light-years — Primary Physical Mechanism* | `03-lesson-4-light-years-title`<br>`03-lesson-4-light-years-takeaway-1`<br>`03-lesson-4-light-years-deepDive-1` | Light-years 1 light-year = c x (365.25 x 86,400s) = 9,460,730,472,580,800 meters ≈ 9.46 trillion km ≈ 63,241 AU. The light-year is widely used in popular science and education because of its intuitive connection to cosmic lookback time. | `scale_comparison_view` in `heliocentric_au`<br>Transition: `scale_aware_cosmic_zoom` | Labels: `light-year`<br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m03-lesson-4-light-years-beat-2`**<br>*Light-years — Quantitative Analysis & Interactive Synthesis* | `03-lesson-4-light-years-deepDive-2`<br>`03-lesson-4-light-years-didYouKnow-1`<br>`03-lesson-4-light-years-mathOrAnalogy-1` | When we photograph the Orion Nebula at 1,344 light-years, we are witnessing starlight emitted during the twilight of the Roman Empire and the rise of early medieval civilizations.  5 million ly) left before modern Homo sapiens evolved on Earth. Professional as | `scientific_cross_section` in `heliocentric_au`<br>Transition: `smooth_orbital_travel` | Labels: `Light-years Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m03-4-param` (Light-years Parameter Explorer — selector `#module-03-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Light-years (act_03_parallax_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 03.5 — Distances between stars (`lesson-5-distances-between-stars`)

- **Storyboard ID**: `sb-m03-lesson-5-distances-between-stars`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION` — *Ruler transitions across km, AU (1.496×10^8 km), light-years (9.46×10^12 km), and megaparsecs.*
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `heliocentric_au` | `scale_comparison_view` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Distances between stars within Cosmic Distances & Scale.
  2. The mean free path of stars in the galactic disk is so vast (~10^20 km) that direct physical collisions during galaxy mergers have a probabi
- **Mapped Narration Segments (6)**: `03-lesson-5-distances-between-stars-title`, `03-lesson-5-distances-between-stars-takeaway-1`, `03-lesson-5-distances-between-stars-deepDive-1`, `03-lesson-5-distances-between-stars-deepDive-2`, `03-lesson-5-distances-between-stars-didYouKnow-1`, `03-lesson-5-distances-between-stars-mathOrAnalogy-1`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m03-lesson-5-distances-between-stars-beat-1`**<br>*Distances between stars — Primary Physical Mechanism* | `03-lesson-5-distances-between-stars-title`<br>`03-lesson-5-distances-between-stars-takeaway-1`<br>`03-lesson-5-distances-between-stars-deepDive-1` | Distances between stars The mean free path of stars in the galactic disk is so vast (~10^20 km) that direct physical collisions during galaxy mergers have a probability approaching zero. 6 light-seconds). 33 x 10^8 light-seconds). Thus, the distance between st | `scale_comparison_view` in `heliocentric_au`<br>Transition: `scale_aware_cosmic_zoom` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m03-lesson-5-distances-between-stars-beat-2`**<br>*Distances between stars — Quantitative Analysis & Interactive Synthesis* | `03-lesson-5-distances-between-stars-deepDive-2`<br>`03-lesson-5-distances-between-stars-didYouKnow-1`<br>`03-lesson-5-distances-between-stars-mathOrAnalogy-1` | Interstellar space is billions of times emptier than the highest laboratory vacuums created on Earth. Voyager 1 travels at ~17 km/s (61,200 km/h). Even at this blazing speed, it will take roughly 73,000 years to travel the distance equivalent to our nearest ne | `planetary_orbital_shot` in `heliocentric_au`<br>Transition: `smooth_orbital_travel` | Labels: `Distances between stars Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m03-5-param` (Distances between stars Parameter Explorer — selector `#module-03-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Distances between stars (act_03_parallax_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 03.6 — Galactic and intergalactic distances (`lesson-6-galactic-and-intergalactic-distances`)

- **Storyboard ID**: `sb-m03-lesson-6-galactic-and-intergalactic-distances`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION` — *Ruler transitions across km, AU (1.496×10^8 km), light-years (9.46×10^12 km), and megaparsecs.*
- **Interactivity Mode**: `REQUIRED_LEARNING_ACTIVITY`
- **Coordinate Frame & Camera Preset**: `heliocentric_au` | `scale_comparison_view` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Galactic and intergalactic distances within Cosmic Distances & Scale.
  2. The Milky Way stellar disk diameter is ~30 kpc (100,000 ly). The Local Group spans ~3 Mpc (10 million ly). The observable universe radius is
- **Mapped Narration Segments (6)**: `03-lesson-6-galactic-and-intergalactic-distances-title`, `03-lesson-6-galactic-and-intergalactic-distances-takeaway-1`, `03-lesson-6-galactic-and-intergalactic-distances-deepDive-1`, `03-lesson-6-galactic-and-intergalactic-distances-deepDive-2`, `03-lesson-6-galactic-and-intergalactic-distances-didYouKnow-1`, `03-lesson-6-galactic-and-intergalactic-distances-mathOrAnalogy-1`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m03-lesson-6-galactic-and-intergalactic-distances-beat-1`**<br>*Galactic and intergalactic distances — Primary Physical Mechanism* | `03-lesson-6-galactic-and-intergalactic-distances-title`<br>`03-lesson-6-galactic-and-intergalactic-distances-takeaway-1`<br>`03-lesson-6-galactic-and-intergalactic-distances-deepDive-1` | Galactic and intergalactic distances The Milky Way stellar disk diameter is ~30 kpc (100,000 ly). The Local Group spans ~3 Mpc (10 million ly). The observable universe radius is ~14.2 Gpc (~46.5 billion ly). 8 billion years old? Because space itself has been e | `scale_comparison_view` in `heliocentric_au`<br>Transition: `scale_aware_cosmic_zoom` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m03-lesson-6-galactic-and-intergalactic-distances-beat-2`**<br>*Galactic and intergalactic distances — Quantitative Analysis & Interactive Synthesis* | `03-lesson-6-galactic-and-intergalactic-distances-deepDive-2`<br>`03-lesson-6-galactic-and-intergalactic-distances-didYouKnow-1`<br>`03-lesson-6-galactic-and-intergalactic-distances-mathOrAnalogy-1` | 5 billion light-years in every direction. The Andromeda Galaxy (M31) is approaching the Milky Way at 110 kilometers per second. In approximately 4.5 billion years, our two galaxies will merge into a single giant elliptical galaxy nicknamed 'Milkomeda'. Scales: | `data_visualization_view` in `heliocentric_au`<br>Transition: `observational_data_reveal` | Labels: `Galactic and intergalactic distances Telemetry`<br>Gate: `REQUIRED_LEARNING_ACTIVITY` (Requires `act_03_distance_ladder_lab`) |

- **Interactive Controls**: `ctrl-m03-6-param` (Galactic and intergalactic distances Parameter Explorer — selector `#module-03-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Galactic and intergalactic distances (act_03_parallax_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---
