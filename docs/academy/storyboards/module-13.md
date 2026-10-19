# Module 13 Cinematic Storyboard — Learn About Galaxies

- **Module ID**: `13` (`stageId: "stage-4-galaxies-extreme-objects"`, Course: `"cosmic-journey"`)
- **Total Instructional Chapters (Sublessons)**: **6**
- **Total Mapped Narration Segments**: **62** (`explorer` canonical sequence; adapted across `junior`, `explorer`, `astronomer`)
- **Primary 3D Scene & Component**: `m13_galaxy_assembly_dynamics_3d` (`src/components/academy/GalaxyAssemblyLab3D.tsx`)
- **Visual Style & Lighting Preset**: `stage4_relativistic_gravity` | `nebular_emissive` (`ACES Filmic`, `exposure: 1.05`, `bloomThreshold: 0.80`)
- **Primary Interactive Activity Gate**: `act_13_galaxy_morphology_lab` — *Galaxy Morphology & Dynamics Lab* (Classify galaxies across spiral, elliptical, and irregular morphologies.)
- **Scientific References**: NASA Astrophysics: Galaxies and the Cosmic Web (NASA - https://science.nasa.gov/astrophysics/focus-areas/what-are-galaxies/); Galaxy Morphology & Catalog (Wikipedia - https://en.wikipedia.org/wiki/Galaxy_morphological_classification)

---

## Chapter 13.1 — Galaxy Morphologies & The Hubble Tuning Fork (`13-1-morphology`)

- **Storyboard ID**: `sb-m13-13-1-morphology`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION`
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `galactocentric_kpc` | `establishing_shot` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Galaxy Morphologies & The Hubble Tuning Fork within Learn About Galaxies.
  2. Spiral galaxies (S) have flat rotating disks, spiral arms, and gas rich in new star birth
- **Mapped Narration Segments (10)**: `13-13-1-morphology-title`, `13-13-1-morphology-concept-1`, `13-13-1-morphology-concept-2`, `13-13-1-morphology-concept-3`, `13-13-1-morphology-concept-4`, `13-13-1-morphology-summary-1`, `13-13-1-morphology-explanation-1`, `13-13-1-morphology-explanation-2`, `13-13-1-morphology-deepDive`, `13-13-1-morphology-didYouKnow`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m13-13-1-morphology-beat-1`**<br>*Galaxy Morphologies & The Hubble Tuning Fork — Primary Physical Mechanism* | `13-13-1-morphology-title`<br>`13-13-1-morphology-concept-1`<br>`13-13-1-morphology-concept-2`<br>`13-13-1-morphology-concept-3`<br>`13-13-1-morphology-concept-4` | Galaxy Morphologies & The Hubble Tuning Fork Spiral galaxies (S) have flat rotating disks, spiral arms, and gas rich in new star birth Barred spirals (SB) feature a central elongated bar of stars funneled toward the nucleus Elliptical galaxies (E0–E7) contain  | `establishing_shot` in `galactocentric_kpc`<br>Transition: `smooth_orbital_travel` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m13-13-1-morphology-beat-2`**<br>*Galaxy Morphologies & The Hubble Tuning Fork — Quantitative Analysis & Interactive Synthesis* | `13-13-1-morphology-summary-1`<br>`13-13-1-morphology-explanation-1`<br>`13-13-1-morphology-explanation-2`<br>`13-13-1-morphology-deepDive`<br>`13-13-1-morphology-didYouKnow` | Edwin Hubble classified galaxies into spiral, barred spiral, elliptical, and irregular systems based on their visible structural geometry. Galaxies are the fundamental building blocks of the visible universe. In 1926, Edwin Hubble created the 'Tuning Fork Diag | `planetary_orbital_shot` in `galactocentric_kpc`<br>Transition: `smooth_orbital_travel` | Labels: `Galaxy Morphologies & The Hubble Tuning Fork Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m13-1-param` (Galaxy Morphologies & The Hubble Tuning Fork Parameter Explorer — selector `#module-13-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Galaxy Morphologies & The Hubble Tuning Fork (act_13_morphology_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 13.2 — Anatomy of the Milky Way & Spiral Arms (`13-2-milky-way-anatomy`)

- **Storyboard ID**: `sb-m13-13-2-milky-way-anatomy`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION`
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `galactocentric_kpc` | `establishing_shot` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Anatomy of the Milky Way & Spiral Arms within Learn About Galaxies.
  2. The Milky Way is an SBbc barred spiral spanning ~100,000 light-years across
- **Mapped Narration Segments (11)**: `13-13-2-milky-way-anatomy-title`, `13-13-2-milky-way-anatomy-concept-1`, `13-13-2-milky-way-anatomy-concept-2`, `13-13-2-milky-way-anatomy-concept-3`, `13-13-2-milky-way-anatomy-concept-4`, `13-13-2-milky-way-anatomy-summary-1`, `13-13-2-milky-way-anatomy-explanation-1`, `13-13-2-milky-way-anatomy-explanation-2`, `13-13-2-milky-way-anatomy-explanation-3`, `13-13-2-milky-way-anatomy-deepDive`, `13-13-2-milky-way-anatomy-didYouKnow`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m13-13-2-milky-way-anatomy-beat-1`**<br>*Anatomy of the Milky Way & Spiral Arms — Primary Physical Mechanism* | `13-13-2-milky-way-anatomy-title`<br>`13-13-2-milky-way-anatomy-concept-1`<br>`13-13-2-milky-way-anatomy-concept-2`<br>`13-13-2-milky-way-anatomy-concept-3`<br>`13-13-2-milky-way-anatomy-concept-4`<br>`13-13-2-milky-way-anatomy-summary-1` | Anatomy of the Milky Way & Spiral Arms The Milky Way is an SBbc barred spiral spanning ~100,000 light-years across Our Solar System is situated in the Orion-Cygnus Arm spur, ~26,700 light-years from the center Spiral arms are not rigid structures like fan blad | `establishing_shot` in `galactocentric_kpc`<br>Transition: `smooth_orbital_travel` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m13-13-2-milky-way-anatomy-beat-2`**<br>*Anatomy of the Milky Way & Spiral Arms — Quantitative Analysis & Interactive Synthesis* | `13-13-2-milky-way-anatomy-explanation-1`<br>`13-13-2-milky-way-anatomy-explanation-2`<br>`13-13-2-milky-way-anatomy-explanation-3`<br>`13-13-2-milky-way-anatomy-deepDive`<br>`13-13-2-milky-way-anatomy-didYouKnow` | Because we live inside the Milky Way, we see it as a luminous milky band of starlight stretching across dark night skies. Infrared observatories like Spitzer and Gaia have mapped its true shape: a central bar of stars ~27,000 light-years long feeding two major | `scientific_cross_section` in `galactocentric_kpc`<br>Transition: `smooth_orbital_travel` | Labels: `Anatomy of the Milky Way & Spiral Arms Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m13-2-param` (Anatomy of the Milky Way & Spiral Arms Parameter Explorer — selector `#module-13-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Anatomy of the Milky Way & Spiral Arms (act_13_morphology_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 13.3 — Our Local Group: Andromeda, Triangulum & Satellite Dwarfs (`13-3-local-group`)

- **Storyboard ID**: `sb-m13-13-3-local-group`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION`
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `galactocentric_kpc` | `establishing_shot` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Our Local Group: Andromeda, Triangulum & Satellite Dwarfs within Learn About Galaxies.
  2. The Local Group spans approximately 10 million light-years in diameter
- **Mapped Narration Segments (10)**: `13-13-3-local-group-title`, `13-13-3-local-group-concept-1`, `13-13-3-local-group-concept-2`, `13-13-3-local-group-concept-3`, `13-13-3-local-group-concept-4`, `13-13-3-local-group-summary-1`, `13-13-3-local-group-explanation-1`, `13-13-3-local-group-explanation-2`, `13-13-3-local-group-deepDive`, `13-13-3-local-group-didYouKnow`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m13-13-3-local-group-beat-1`**<br>*Our Local Group: Andromeda, Triangulum & Satellite Dwarfs — Primary Physical Mechanism* | `13-13-3-local-group-title`<br>`13-13-3-local-group-concept-1`<br>`13-13-3-local-group-concept-2`<br>`13-13-3-local-group-concept-3`<br>`13-13-3-local-group-concept-4` | Our Local Group: Andromeda, Triangulum & Satellite Dwarfs The Local Group spans approximately 10 million light-years in diameter Two dominant giants: Andromeda (M31) and the Milky Way; third largest is Triangulum (M33) Over 80 dwarf galaxies orbit as satellite | `establishing_shot` in `galactocentric_kpc`<br>Transition: `smooth_orbital_travel` | Labels: `Local Group`<br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m13-13-3-local-group-beat-2`**<br>*Our Local Group: Andromeda, Triangulum & Satellite Dwarfs — Quantitative Analysis & Interactive Synthesis* | `13-13-3-local-group-summary-1`<br>`13-13-3-local-group-explanation-1`<br>`13-13-3-local-group-explanation-2`<br>`13-13-3-local-group-deepDive`<br>`13-13-3-local-group-didYouKnow` | A gravitationally bound cluster of more than 80 galaxies dominated by the Milky Way and Andromeda, hurtling toward a titanic merger. The Local Group is dominated by two heavyweight spiral galaxies: Andromeda (M31), harboring ~1 trillion stars, and our Milky Wa | `planetary_orbital_shot` in `galactocentric_kpc`<br>Transition: `smooth_orbital_travel` | Labels: `Our Local Group: Andromeda, Triangulum & Satellite Dwarfs Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m13-3-param` (Our Local Group: Andromeda, Triangulum & Satellite Dwarfs Parameter Explorer — selector `#module-13-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Our Local Group: Andromeda, Triangulum & Satellite Dwarfs (act_13_morphology_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 13.4 — Supermassive Black Holes & Active Galactic Nuclei (AGN) (`13-4-galactic-cores`)

- **Storyboard ID**: `sb-m13-13-4-galactic-cores`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION`
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `galactocentric_kpc` | `establishing_shot` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Supermassive Black Holes & Active Galactic Nuclei (AGN) within Learn About Galaxies.
  2. Sagittarius A* (Sgr A*) is located at the center of the Milky Way, ~26,700 light-years away
- **Mapped Narration Segments (10)**: `13-13-4-galactic-cores-title`, `13-13-4-galactic-cores-concept-1`, `13-13-4-galactic-cores-concept-2`, `13-13-4-galactic-cores-concept-3`, `13-13-4-galactic-cores-concept-4`, `13-13-4-galactic-cores-summary-1`, `13-13-4-galactic-cores-explanation-1`, `13-13-4-galactic-cores-explanation-2`, `13-13-4-galactic-cores-deepDive`, `13-13-4-galactic-cores-didYouKnow`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m13-13-4-galactic-cores-beat-1`**<br>*Supermassive Black Holes & Active Galactic Nuclei (AGN) — Primary Physical Mechanism* | `13-13-4-galactic-cores-title`<br>`13-13-4-galactic-cores-concept-1`<br>`13-13-4-galactic-cores-concept-2`<br>`13-13-4-galactic-cores-concept-3`<br>`13-13-4-galactic-cores-concept-4` | Supermassive Black Holes & Active Galactic Nuclei (AGN) Sagittarius A* (Sgr A*) is located at the center of the Milky Way, ~26,700 light-years away Supermassive black holes (SMBHs) range from millions to tens of billions of solar masses Active Galactic Nuclei  | `establishing_shot` in `galactocentric_kpc`<br>Transition: `smooth_orbital_travel` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m13-13-4-galactic-cores-beat-2`**<br>*Supermassive Black Holes & Active Galactic Nuclei (AGN) — Quantitative Analysis & Interactive Synthesis* | `13-13-4-galactic-cores-summary-1`<br>`13-13-4-galactic-cores-explanation-1`<br>`13-13-4-galactic-cores-explanation-2`<br>`13-13-4-galactic-cores-deepDive`<br>`13-13-4-galactic-cores-didYouKnow` | Virtually every massive galaxy harbors a central supermassive black hole containing millions to billions of solar masses, dictating galaxy growth via feedback. For decades, astronomers watched stars near the center of the Milky Way whip around an invisible poi | `scientific_cross_section` in `galactocentric_kpc`<br>Transition: `smooth_orbital_travel` | Labels: `Supermassive Black Holes & Active Galactic Nuclei (AGN) Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m13-4-param` (Supermassive Black Holes & Active Galactic Nuclei (AGN) Parameter Explorer — selector `#module-13-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Supermassive Black Holes & Active Galactic Nuclei (AGN) (act_13_morphology_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 13.5 — Galactic Rotation Curves & Dark Matter Halos (`13-5-dark-matter`)

- **Storyboard ID**: `sb-m13-13-5-dark-matter`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION`
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `galactocentric_kpc` | `establishing_shot` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Galactic Rotation Curves & Dark Matter Halos within Learn About Galaxies.
  2. According to Kepler's laws, outer planets move slower because they are far from the central mass
- **Mapped Narration Segments (11)**: `13-13-5-dark-matter-title`, `13-13-5-dark-matter-concept-1`, `13-13-5-dark-matter-concept-2`, `13-13-5-dark-matter-concept-3`, `13-13-5-dark-matter-concept-4`, `13-13-5-dark-matter-summary-1`, `13-13-5-dark-matter-explanation-1`, `13-13-5-dark-matter-explanation-2`, `13-13-5-dark-matter-explanation-3`, `13-13-5-dark-matter-deepDive`, `13-13-5-dark-matter-didYouKnow`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m13-13-5-dark-matter-beat-1`**<br>*Galactic Rotation Curves & Dark Matter Halos — Primary Physical Mechanism* | `13-13-5-dark-matter-title`<br>`13-13-5-dark-matter-concept-1`<br>`13-13-5-dark-matter-concept-2`<br>`13-13-5-dark-matter-concept-3`<br>`13-13-5-dark-matter-concept-4`<br>`13-13-5-dark-matter-summary-1` | Galactic Rotation Curves & Dark Matter Halos According to Kepler's laws, outer planets move slower because they are far from the central mass In galaxies, Vera Rubin discovered that outer stars orbit just as fast as inner stars (flat rotation curve) This prove | `establishing_shot` in `galactocentric_kpc`<br>Transition: `smooth_orbital_travel` | Labels: `dark matter`<br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m13-13-5-dark-matter-beat-2`**<br>*Galactic Rotation Curves & Dark Matter Halos — Quantitative Analysis & Interactive Synthesis* | `13-13-5-dark-matter-explanation-1`<br>`13-13-5-dark-matter-explanation-2`<br>`13-13-5-dark-matter-explanation-3`<br>`13-13-5-dark-matter-deepDive`<br>`13-13-5-dark-matter-didYouKnow` | When astrophysicists measured the orbital velocities of hydrogen gas in spiral galaxies using radio telescopes (the 21-cm line), they expected the rotation speed to drop off with distance. Instead, the rotation curves stayed completely flat! If only visible st | `planetary_orbital_shot` in `galactocentric_kpc`<br>Transition: `smooth_orbital_travel` | Labels: `Galactic Rotation Curves & Dark Matter Halos Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m13-5-param` (Galactic Rotation Curves & Dark Matter Halos Parameter Explorer — selector `#module-13-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Galactic Rotation Curves & Dark Matter Halos (act_13_morphology_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 13.6 — Galaxy Collisions & Starburst Dynamics (`13-6-galaxy-collisions`)

- **Storyboard ID**: `sb-m13-13-6-galaxy-collisions`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION`
- **Interactivity Mode**: `REQUIRED_LEARNING_ACTIVITY`
- **Coordinate Frame & Camera Preset**: `galactocentric_kpc` | `establishing_shot` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Galaxy Collisions & Starburst Dynamics within Learn About Galaxies.
  2. Galactic interactions stretch out long tidal tails of stars and gas light-years long
- **Mapped Narration Segments (10)**: `13-13-6-galaxy-collisions-title`, `13-13-6-galaxy-collisions-concept-1`, `13-13-6-galaxy-collisions-concept-2`, `13-13-6-galaxy-collisions-concept-3`, `13-13-6-galaxy-collisions-concept-4`, `13-13-6-galaxy-collisions-summary-1`, `13-13-6-galaxy-collisions-explanation-1`, `13-13-6-galaxy-collisions-explanation-2`, `13-13-6-galaxy-collisions-deepDive`, `13-13-6-galaxy-collisions-didYouKnow`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m13-13-6-galaxy-collisions-beat-1`**<br>*Galaxy Collisions & Starburst Dynamics — Primary Physical Mechanism* | `13-13-6-galaxy-collisions-title`<br>`13-13-6-galaxy-collisions-concept-1`<br>`13-13-6-galaxy-collisions-concept-2`<br>`13-13-6-galaxy-collisions-concept-3`<br>`13-13-6-galaxy-collisions-concept-4` | Galaxy Collisions & Starburst Dynamics Galactic interactions stretch out long tidal tails of stars and gas light-years long The Whirlpool Galaxy (M51) is currently interacting with companion galaxy NGC 5195 Collisions compress molecular clouds, causing a 'star | `establishing_shot` in `galactocentric_kpc`<br>Transition: `smooth_orbital_travel` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m13-13-6-galaxy-collisions-beat-2`**<br>*Galaxy Collisions & Starburst Dynamics — Quantitative Analysis & Interactive Synthesis* | `13-13-6-galaxy-collisions-summary-1`<br>`13-13-6-galaxy-collisions-explanation-1`<br>`13-13-6-galaxy-collisions-explanation-2`<br>`13-13-6-galaxy-collisions-deepDive`<br>`13-13-6-galaxy-collisions-didYouKnow` | When galaxies collide, their stars pass safely by one another while interstellar gas clouds smash together, sparking frantic waves of star formation. The Whirlpool Galaxy (M51) gives us a ringside seat to a galaxy collision. Its smaller neighbor, NGC 5195, has | `data_visualization_view` in `galactocentric_kpc`<br>Transition: `observational_data_reveal` | Labels: `Galaxy Collisions & Starburst Dynamics Telemetry`<br>Gate: `REQUIRED_LEARNING_ACTIVITY` (Requires `act_13_galaxy_morphology_lab`) |

- **Interactive Controls**: `ctrl-m13-6-param` (Galaxy Collisions & Starburst Dynamics Parameter Explorer — selector `#module-13-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Galaxy Collisions & Starburst Dynamics (act_13_morphology_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---
