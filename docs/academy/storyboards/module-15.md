# Module 15 Cinematic Storyboard — Galaxy Groups, Clusters & Cosmic Web

- **Module ID**: `15` (`stageId: "stage-4-galaxies-extreme-objects"`, Course: `"cosmic-journey"`)
- **Total Instructional Chapters (Sublessons)**: **7**
- **Total Mapped Narration Segments**: **42** (`explorer` canonical sequence; adapted across `junior`, `explorer`, `astronomer`)
- **Primary 3D Scene & Component**: `m15_cosmic_web_superclusters_3d` (`src/components/academy/CosmicStructureVisualizer3D.tsx`)
- **Visual Style & Lighting Preset**: `stage4_relativistic_gravity` | `cosmological_ambient` (`ACES Filmic`, `exposure: 1.05`, `bloomThreshold: 0.80`)
- **Primary Interactive Activity Gate**: `act_15_cosmic_web_explorer` — *Large-Scale Filamentary Web Explorer* (Inspect cosmic web density fields and navigate galaxy clusters and voids.)
- **Scientific References**: Tully et al. (Nature, 2014) The Laniakea Supercluster of Galaxies (Nature / Cosmicflows Project - https://www.nature.com/articles/nature13674); Sloan Digital Sky Survey (SDSS) 3D Large-Scale Structure Maps (SDSS Collaboration / Astrophysical Journal - https://www.sdss.org/); The IllustrisTNG Project: Cosmological Magnetohydrodynamical Simulations (Max Planck Institute for Astrophysics / Harvard CFA - https://www.tng-project.org/); Kirshner et al. (1981) A Million Cubic Megaparsec Void in Boötes (Astrophysical Journal Letters - https://ui.adsabs.harvard.edu/abs/1981ApJ...248L..57K)

---

## Chapter 15.1 — Galaxies Do Not Exist in Isolation (`galaxies-not-isolated`)

- **Storyboard ID**: `sb-m15-galaxies-not-isolated`
- **Scientific Representation**: `OBSERVATION_BASED`
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `comoving_cosmological` | `deep_space_flythrough` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Galaxies Do Not Exist in Isolation within Galaxy Groups, Clusters & Cosmic Web.
  2. The distribution of galaxies in space is non-random, organized into a hierarchical gravitational structure.
- **Mapped Narration Segments (6)**: `15-galaxies-not-isolated-title`, `15-galaxies-not-isolated-lead-1`, `15-galaxies-not-isolated-keyIdea-1`, `15-galaxies-not-isolated-explanation-1`, `15-galaxies-not-isolated-explanation-2`, `15-galaxies-not-isolated-activityPrompt-1`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m15-galaxies-not-isolated-beat-1`**<br>*Galaxies Do Not Exist in Isolation — Primary Physical Mechanism* | `15-galaxies-not-isolated-title`<br>`15-galaxies-not-isolated-lead-1`<br>`15-galaxies-not-isolated-keyIdea-1` | Galaxies Do Not Exist in Isolation The distribution of galaxies in space is non-random, organized into a hierarchical gravitational structure. Galaxies cluster together under mutual gravitational attraction, forming groups, rich clusters, and vast filaments. | `deep_space_flythrough` in `comoving_cosmological`<br>Transition: `scale_aware_cosmic_zoom` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m15-galaxies-not-isolated-beat-2`**<br>*Galaxies Do Not Exist in Isolation — Quantitative Analysis & Interactive Synthesis* | `15-galaxies-not-isolated-explanation-1`<br>`15-galaxies-not-isolated-explanation-2`<br>`15-galaxies-not-isolated-activityPrompt-1` | In the early 20th century, Edwin Hubble discovered that galaxies were distinct 'island universes'. But as sky surveys mapped tens of thousands of galaxies, astronomers realized galaxies are social: over 80% reside in groups or rich clusters. Gravity continuall | `planetary_orbital_shot` in `comoving_cosmological`<br>Transition: `smooth_orbital_travel` | Labels: `Galaxies Do Not Exist in Isolation Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m15-1-param` (Galaxies Do Not Exist in Isolation Parameter Explorer — selector `#module-15-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Galaxies Do Not Exist in Isolation (act_15_density_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 15.2 — Galaxy Groups & The Local Group (`galaxy-groups`)

- **Storyboard ID**: `sb-m15-galaxy-groups`
- **Scientific Representation**: `OBSERVATION_BASED`
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `comoving_cosmological` | `deep_space_flythrough` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Galaxy Groups & The Local Group within Galaxy Groups, Clusters & Cosmic Web.
  2. Galaxy groups contain between a few and roughly 50 galaxies spanning 3 to 10 million light-years.
- **Mapped Narration Segments (6)**: `15-galaxy-groups-title`, `15-galaxy-groups-lead-1`, `15-galaxy-groups-keyIdea-1`, `15-galaxy-groups-explanation-1`, `15-galaxy-groups-explanation-2`, `15-galaxy-groups-activityPrompt-1`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m15-galaxy-groups-beat-1`**<br>*Galaxy Groups & The Local Group — Primary Physical Mechanism* | `15-galaxy-groups-title`<br>`15-galaxy-groups-lead-1`<br>`15-galaxy-groups-keyIdea-1` | Galaxy Groups & The Local Group Galaxy groups contain between a few and roughly 50 galaxies spanning 3 to 10 million light-years. The Local Group is gravitationally bound, overcoming the Hubble expansion of space locally. | `deep_space_flythrough` in `comoving_cosmological`<br>Transition: `scale_aware_cosmic_zoom` | Labels: `Local Group`<br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m15-galaxy-groups-beat-2`**<br>*Galaxy Groups & The Local Group — Quantitative Analysis & Interactive Synthesis* | `15-galaxy-groups-explanation-1`<br>`15-galaxy-groups-explanation-2`<br>`15-galaxy-groups-activityPrompt-1` | While the universe as a whole expands and distant galaxies fly apart, the gravity inside the Local Group is strong enough to halt expansion locally! Andromeda is not moving away from us; it is rushing toward the Milky Way at 110 kilometers per second. 5 billio | `scientific_cross_section` in `comoving_cosmological`<br>Transition: `smooth_orbital_travel` | Labels: `Galaxy Groups & The Local Group Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m15-2-param` (Galaxy Groups & The Local Group Parameter Explorer — selector `#module-15-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Galaxy Groups & The Local Group (act_15_density_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 15.3 — Galaxy Clusters & Hot Intracluster Gas (`galaxy-clusters`)

- **Storyboard ID**: `sb-m15-galaxy-clusters`
- **Scientific Representation**: `OBSERVATION_BASED`
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `comoving_cosmological` | `deep_space_flythrough` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Galaxy Clusters & Hot Intracluster Gas within Galaxy Groups, Clusters & Cosmic Web.
  2. Galaxy clusters contain hundreds to thousands of galaxies, spanning 10 to 30 million light-years across.
- **Mapped Narration Segments (6)**: `15-galaxy-clusters-title`, `15-galaxy-clusters-lead-1`, `15-galaxy-clusters-keyIdea-1`, `15-galaxy-clusters-explanation-1`, `15-galaxy-clusters-explanation-2`, `15-galaxy-clusters-activityPrompt-1`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m15-galaxy-clusters-beat-1`**<br>*Galaxy Clusters & Hot Intracluster Gas — Primary Physical Mechanism* | `15-galaxy-clusters-title`<br>`15-galaxy-clusters-lead-1`<br>`15-galaxy-clusters-keyIdea-1` | Galaxy Clusters & Hot Intracluster Gas Galaxy clusters contain hundreds to thousands of galaxies, spanning 10 to 30 million light-years across. Cluster Mass Breakdown: ~85% Dark Matter, ~13% Hot Intracluster Gas, and only ~2% Stars & Galaxies! | `deep_space_flythrough` in `comoving_cosmological`<br>Transition: `scale_aware_cosmic_zoom` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m15-galaxy-clusters-beat-2`**<br>*Galaxy Clusters & Hot Intracluster Gas — Quantitative Analysis & Interactive Synthesis* | `15-galaxy-clusters-explanation-1`<br>`15-galaxy-clusters-explanation-2`<br>`15-galaxy-clusters-activityPrompt-1` | When astronomers add up everything in a cluster, stars and galaxies make up a tiny fraction of the total mass. The vast majority of normal matter exists as a diffuse, 10–100 million Kelvin plasma called the Intracluster Medium (ICM). Above all of that sits an  | `planetary_orbital_shot` in `comoving_cosmological`<br>Transition: `smooth_orbital_travel` | Labels: `Galaxy Clusters & Hot Intracluster Gas Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m15-3-param` (Galaxy Clusters & Hot Intracluster Gas Parameter Explorer — selector `#module-15-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Galaxy Clusters & Hot Intracluster Gas (act_15_density_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 15.4 — Superclusters: Laniakea & Gravitational Limits (`superclusters`)

- **Storyboard ID**: `sb-m15-superclusters`
- **Scientific Representation**: `OBSERVATION_BASED`
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `comoving_cosmological` | `deep_space_flythrough` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Superclusters: Laniakea & Gravitational Limits within Galaxy Groups, Clusters & Cosmic Web.
  2. Superclusters span hundreds of millions of light-years, linking dozens of rich clusters and groups.
- **Mapped Narration Segments (6)**: `15-superclusters-title`, `15-superclusters-lead-1`, `15-superclusters-keyIdea-1`, `15-superclusters-explanation-1`, `15-superclusters-explanation-2`, `15-superclusters-activityPrompt-1`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m15-superclusters-beat-1`**<br>*Superclusters: Laniakea & Gravitational Limits — Primary Physical Mechanism* | `15-superclusters-title`<br>`15-superclusters-lead-1`<br>`15-superclusters-keyIdea-1` | Superclusters: Laniakea & Gravitational Limits Superclusters span hundreds of millions of light-years, linking dozens of rich clusters and groups. Distinction: Clusters are gravitationally bound (virialized); Superclusters are NOT bound and will be torn apart  | `deep_space_flythrough` in `comoving_cosmological`<br>Transition: `scale_aware_cosmic_zoom` | Labels: `Laniakea`<br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m15-superclusters-beat-2`**<br>*Superclusters: Laniakea & Gravitational Limits — Quantitative Analysis & Interactive Synthesis* | `15-superclusters-explanation-1`<br>`15-superclusters-explanation-2`<br>`15-superclusters-activityPrompt-1` | A galaxy cluster is like a locked solar system where gravity has permanently won. But superclusters like Laniakea (520 million light-years wide) or the Shapley Supercluster are too vast. The Hubble expansion and accelerating dark energy (Lambda) exceed the esc | `scientific_cross_section` in `comoving_cosmological`<br>Transition: `smooth_orbital_travel` | Labels: `Superclusters: Laniakea & Gravitational Limits Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m15-4-param` (Superclusters: Laniakea & Gravitational Limits Parameter Explorer — selector `#module-15-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Superclusters: Laniakea & Gravitational Limits (act_15_density_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 15.5 — Cosmic Filaments & The Missing Baryons (`cosmic-filaments`)

- **Storyboard ID**: `sb-m15-cosmic-filaments`
- **Scientific Representation**: `OBSERVATION_BASED`
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `comoving_cosmological` | `deep_space_flythrough` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Cosmic Filaments & The Missing Baryons within Galaxy Groups, Clusters & Cosmic Web.
  2. Filaments contain over 50% of all normal matter in the universe, hidden as warm-hot intergalactic gas.
- **Mapped Narration Segments (6)**: `15-cosmic-filaments-title`, `15-cosmic-filaments-lead-1`, `15-cosmic-filaments-keyIdea-1`, `15-cosmic-filaments-explanation-1`, `15-cosmic-filaments-explanation-2`, `15-cosmic-filaments-activityPrompt-1`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m15-cosmic-filaments-beat-1`**<br>*Cosmic Filaments & The Missing Baryons — Primary Physical Mechanism* | `15-cosmic-filaments-title`<br>`15-cosmic-filaments-lead-1`<br>`15-cosmic-filaments-keyIdea-1` | Cosmic Filaments & The Missing Baryons Filaments contain over 50% of all normal matter in the universe, hidden as warm-hot intergalactic gas. Astronomers solved the 'Missing Baryon Problem' by detecting the Warm-Hot Intergalactic Medium (WHIM) along filaments. | `deep_space_flythrough` in `comoving_cosmological`<br>Transition: `scale_aware_cosmic_zoom` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m15-cosmic-filaments-beat-2`**<br>*Cosmic Filaments & The Missing Baryons — Quantitative Analysis & Interactive Synthesis* | `15-cosmic-filaments-explanation-1`<br>`15-cosmic-filaments-explanation-2`<br>`15-cosmic-filaments-activityPrompt-1` | For decades, counting all stars, gas, and dust in galaxies found less than half the normal matter predicted by the Big Bang. Where was the rest? Cosmological simulations predicted it was hiding inside cosmic filaments as the Warm-Hot Intergalactic Medium (WHIM | `planetary_orbital_shot` in `comoving_cosmological`<br>Transition: `smooth_orbital_travel` | Labels: `Cosmic Filaments & The Missing Baryons Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m15-5-param` (Cosmic Filaments & The Missing Baryons Parameter Explorer — selector `#module-15-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Cosmic Filaments & The Missing Baryons (act_15_density_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 15.6 — Cosmic Voids: The Great Empty Bubbles (`cosmic-voids`)

- **Storyboard ID**: `sb-m15-cosmic-voids`
- **Scientific Representation**: `OBSERVATION_BASED`
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `comoving_cosmological` | `deep_space_flythrough` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Cosmic Voids: The Great Empty Bubbles within Galaxy Groups, Clusters & Cosmic Web.
  2. Cosmic voids are underdense regions spanning 50 to 500 million light-years, occupying ~80% of cosmic volume.
- **Mapped Narration Segments (6)**: `15-cosmic-voids-title`, `15-cosmic-voids-lead-1`, `15-cosmic-voids-keyIdea-1`, `15-cosmic-voids-explanation-1`, `15-cosmic-voids-explanation-2`, `15-cosmic-voids-activityPrompt-1`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m15-cosmic-voids-beat-1`**<br>*Cosmic Voids: The Great Empty Bubbles — Primary Physical Mechanism* | `15-cosmic-voids-title`<br>`15-cosmic-voids-lead-1`<br>`15-cosmic-voids-keyIdea-1` | Cosmic Voids: The Great Empty Bubbles Cosmic voids are underdense regions spanning 50 to 500 million light-years, occupying ~80% of cosmic volume. Voids act like gravitational lenses in reverse: their low density pushes matter outward and speeds up cosmic expa | `deep_space_flythrough` in `comoving_cosmological`<br>Transition: `scale_aware_cosmic_zoom` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m15-cosmic-voids-beat-2`**<br>*Cosmic Voids: The Great Empty Bubbles — Quantitative Analysis & Interactive Synthesis* | `15-cosmic-voids-explanation-1`<br>`15-cosmic-voids-explanation-2`<br>`15-cosmic-voids-activityPrompt-1` | Because voids have far less matter than average, their gravity is too weak to resist dark energy. In fact, matter actively drains out of voids into the surrounding filaments. This makes voids expand faster than average space, acting like giant diverging lenses | `scientific_cross_section` in `comoving_cosmological`<br>Transition: `smooth_orbital_travel` | Labels: `Cosmic Voids: The Great Empty Bubbles Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m15-6-param` (Cosmic Voids: The Great Empty Bubbles Parameter Explorer — selector `#module-15-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Cosmic Voids: The Great Empty Bubbles (act_15_density_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 15.7 — Structure Formation Through Gravity (`structure-formation-gravity`)

- **Storyboard ID**: `sb-m15-structure-formation-gravity`
- **Scientific Representation**: `OBSERVATION_BASED`
- **Interactivity Mode**: `REQUIRED_LEARNING_ACTIVITY`
- **Coordinate Frame & Camera Preset**: `comoving_cosmological` | `deep_space_flythrough` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Structure Formation Through Gravity within Galaxy Groups, Clusters & Cosmic Web.
  2. The cosmic web grew through hierarchical 'bottom-up' assembly: small structures merged to create larger ones.
- **Mapped Narration Segments (6)**: `15-structure-formation-gravity-title`, `15-structure-formation-gravity-lead-1`, `15-structure-formation-gravity-keyIdea-1`, `15-structure-formation-gravity-explanation-1`, `15-structure-formation-gravity-explanation-2`, `15-structure-formation-gravity-activityPrompt-1`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m15-structure-formation-gravity-beat-1`**<br>*Structure Formation Through Gravity — Primary Physical Mechanism* | `15-structure-formation-gravity-title`<br>`15-structure-formation-gravity-lead-1`<br>`15-structure-formation-gravity-keyIdea-1` | Structure Formation Through Gravity The cosmic web grew through hierarchical 'bottom-up' assembly: small structures merged to create larger ones. Cold Dark Matter (CDM) formed the invisible skeleton first, into which normal hydrogen and helium gas fell. | `deep_space_flythrough` in `comoving_cosmological`<br>Transition: `scale_aware_cosmic_zoom` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m15-structure-formation-gravity-beat-2`**<br>*Structure Formation Through Gravity — Quantitative Analysis & Interactive Synthesis* | `15-structure-formation-gravity-explanation-1`<br>`15-structure-formation-gravity-explanation-2`<br>`15-structure-formation-gravity-activityPrompt-1` | Because dark matter does not interact with light, it began collapsing under gravity long before normal baryonic matter could. Dark matter formed invisible clumps (halos) and long filaments. When the universe cooled, normal gas fell into these gravitational val | `data_visualization_view` in `comoving_cosmological`<br>Transition: `observational_data_reveal` | Labels: `Structure Formation Through Gravity Telemetry`<br>Gate: `REQUIRED_LEARNING_ACTIVITY` (Requires `act_15_cosmic_web_explorer`) |

- **Interactive Controls**: `ctrl-m15-7-param` (Structure Formation Through Gravity Parameter Explorer — selector `#module-15-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Structure Formation Through Gravity (act_15_density_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---
