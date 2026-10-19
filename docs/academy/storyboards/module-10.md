# Module 10 Cinematic Storyboard — Birth, Life & Death of Stars

- **Module ID**: `10` (`stageId: "stage-3-life-of-stars"`, Course: `"cosmic-journey"`)
- **Total Instructional Chapters (Sublessons)**: **8**
- **Total Mapped Narration Segments**: **40** (`explorer` canonical sequence; adapted across `junior`, `explorer`, `astronomer`)
- **Primary 3D Scene & Component**: `m10_stellar_evolution_lifecycle_3d` (`src/components/academy/StellarEvolutionLab3D.tsx`)
- **Visual Style & Lighting Preset**: `stage3_stellar_radiance` | `stellar_point_blackbody` (`ACES Filmic`, `exposure: 1.05`, `bloomThreshold: 0.80`)
- **Primary Interactive Activity Gate**: `act_10_stellar_evolution_timeline` — *Stellar Fate Predictor Simulation* (Simulate stellar evolution by varying initial Zero-Age Main Sequence mass.)
- **Scientific References**: NASA Astrophysics: How Do Stars Form, Live, and Die? (NASA - https://science.nasa.gov/astrophysics/focus-areas/how-do-stars-form-and-evolve/); ESA Hubble Science: Star Birth, Evolution, and Stellar Remnants (ESA - https://hubblesite.org/science/stars-and-nebulae); Chandra X-Ray Observatory: Supernovae, Pulsars & Stellar Black Holes (NASA Chandra - https://chandra.harvard.edu/xray_sources/supernovas.html); MESA: Modules for Experiments in Stellar Astrophysics (MESA Project - https://docs.mesastar.org/)

---

## Chapter 10.1 — Birth Inside a Molecular Cloud (`10-01`)

- **Storyboard ID**: `sb-m10-10-01`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION`
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `stellar_interior_ro` | `scientific_cross_section` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Birth Inside a Molecular Cloud within Birth, Life & Death of Stars.
  2. Our entire Solar System—the Sun, Earth, oceans, and living creatures—was once a cold, dark molecular cloud about 4.6 billion years ago!
- **Mapped Narration Segments (5)**: `10-10-01-title`, `10-10-01-didYouKnow-1`, `10-10-01-detail-1`, `10-10-01-detail-2`, `10-10-01-detail-3`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m10-10-01-beat-1`**<br>*Birth Inside a Molecular Cloud — Primary Physical Mechanism* | `10-10-01-title`<br>`10-10-01-didYouKnow-1`<br>`10-10-01-detail-1` | 1. Birth Inside a Molecular Cloud Our entire Solar System—the Sun, Earth, oceans, and living creatures—was once a cold, dark molecular cloud about 4.6 billion years ago! External triggers like supernova shockwaves or spiral density waves in galaxies compress t | `scientific_cross_section` in `stellar_interior_ro`<br>Transition: `chronological_transformation` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m10-10-01-beat-2`**<br>*Birth Inside a Molecular Cloud — Quantitative Analysis & Interactive Synthesis* | `10-10-01-detail-2`<br>`10-10-01-detail-3` | Dust grains radiate away gravitational heat in the infrared, keeping the cloud cool so collapse can continue. As the cloud contracts, conservation of angular momentum spins it into a flattening disk. | `planetary_orbital_shot` in `stellar_interior_ro`<br>Transition: `smooth_orbital_travel` | Labels: `Birth Inside a Molecular Cloud Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m10-1-param` (Birth Inside a Molecular Cloud Parameter Explorer — selector `#module-10-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Birth Inside a Molecular Cloud (act_10_evolution_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 10.2 — Protostars (`10-02`)

- **Storyboard ID**: `sb-m10-10-02`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION`
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `stellar_interior_ro` | `scientific_cross_section` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Protostars within Birth, Life & Death of Stars.
  2. If a collapsing clump has less than 0.08 times the mass of the Sun (about 80 Jupiter masses), its core never gets hot enough to ignite hydro
- **Mapped Narration Segments (5)**: `10-10-02-title`, `10-10-02-didYouKnow-1`, `10-10-02-detail-1`, `10-10-02-detail-2`, `10-10-02-detail-3`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m10-10-02-beat-1`**<br>*Protostars — Primary Physical Mechanism* | `10-10-02-title`<br>`10-10-02-didYouKnow-1`<br>`10-10-02-detail-1` | 2. Protostars If a collapsing clump has less than 0.08 times the mass of the Sun (about 80 Jupiter masses), its core never gets hot enough to ignite hydrogen fusion—it becomes a 'failed star' called a Brown Dwarf! Core temperature gradually rises from tens of  | `scientific_cross_section` in `stellar_interior_ro`<br>Transition: `chronological_transformation` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m10-10-02-beat-2`**<br>*Protostars — Quantitative Analysis & Interactive Synthesis* | `10-10-02-detail-2`<br>`10-10-02-detail-3` | At about 1 Million Kelvin, trace deuterium (²H) fuses with protons, but this fuel is quickly exhausted. Once the core hits roughly 10 to 15 Million Kelvin, true hydrogen fusion ignites, radiation pressure pushes away the remaining accretion envelope, and a new | `scientific_cross_section` in `stellar_interior_ro`<br>Transition: `smooth_orbital_travel` | Labels: `Protostars Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m10-2-param` (Protostars Parameter Explorer — selector `#module-10-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Protostars (act_10_evolution_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 10.3 — Main-Sequence Stars (`10-03`)

- **Storyboard ID**: `sb-m10-10-03`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION`
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `stellar_interior_ro` | `scientific_cross_section` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Main-Sequence Stars within Birth, Life & Death of Stars.
  2. While massive stars live glamorous, fast, short lives of only 10 to 30 million years, humble red dwarfs live so long that not a single red d
- **Mapped Narration Segments (5)**: `10-10-03-title`, `10-10-03-didYouKnow-1`, `10-10-03-detail-1`, `10-10-03-detail-2`, `10-10-03-detail-3`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m10-10-03-beat-1`**<br>*Main-Sequence Stars — Primary Physical Mechanism* | `10-10-03-title`<br>`10-10-03-didYouKnow-1`<br>`10-10-03-detail-1` | 3. Main-Sequence Stars While massive stars live glamorous, fast, short lives of only 10 to 30 million years, humble red dwarfs live so long that not a single red dwarf in the entire universe has died of old age yet! A star with 10 times the Sun's mass produces | `scientific_cross_section` in `stellar_interior_ro`<br>Transition: `chronological_transformation` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m10-10-03-beat-2`**<br>*Main-Sequence Stars — Quantitative Analysis & Interactive Synthesis* | `10-10-03-detail-2`<br>`10-10-03-detail-3` | Main-sequence lifespan formula: Lifespan ≈ 10 billion years × (Mass / Sun Mass)^(-2.5). Low-mass red dwarfs will still be shining when all other stars in the universe have died. | `planetary_orbital_shot` in `stellar_interior_ro`<br>Transition: `smooth_orbital_travel` | Labels: `Main-Sequence Stars Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m10-3-param` (Main-Sequence Stars Parameter Explorer — selector `#module-10-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Main-Sequence Stars (act_10_evolution_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 10.4 — Stellar Aging (`10-04`)

- **Storyboard ID**: `sb-m10-10-04`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION`
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `stellar_interior_ro` | `scientific_cross_section` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Stellar Aging within Birth, Life & Death of Stars.
  2. The Schönberg-Chandrasekhar limit says that an inert helium core can only support about 10% of the star's total weight before gravity inevit
- **Mapped Narration Segments (5)**: `10-10-04-title`, `10-10-04-didYouKnow-1`, `10-10-04-detail-1`, `10-10-04-detail-2`, `10-10-04-detail-3`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m10-10-04-beat-1`**<br>*Stellar Aging — Primary Physical Mechanism* | `10-10-04-title`<br>`10-10-04-didYouKnow-1`<br>`10-10-04-detail-1` | 4. Stellar Aging The Schönberg-Chandrasekhar limit says that an inert helium core can only support about 10% of the star's total weight before gravity inevitably crushes it! The star leaves the main sequence and moves across the 'Subgiant Branch' on the H-R di | `scientific_cross_section` in `stellar_interior_ro`<br>Transition: `chronological_transformation` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m10-10-04-beat-2`**<br>*Stellar Aging — Quantitative Analysis & Interactive Synthesis* | `10-10-04-detail-2`<br>`10-10-04-detail-3` | Because the outer envelope expands so dramatically, its surface area multiplies by thousands, but its surface temperature cools down. This is the beginning of the end of the star's life. | `scientific_cross_section` in `stellar_interior_ro`<br>Transition: `smooth_orbital_travel` | Labels: `Stellar Aging Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m10-4-param` (Stellar Aging Parameter Explorer — selector `#module-10-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Stellar Aging (act_10_evolution_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 10.5 — Red Giants and Red Supergiants (`10-05`)

- **Storyboard ID**: `sb-m10-10-05`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION`
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `stellar_interior_ro` | `scientific_cross_section` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Red Giants and Red Supergiants within Birth, Life & Death of Stars.
  2. THE SUN WILL NEVER EXPLODE AS A SUPERNOVA! The Sun only has enough gravity to reach carbon and oxygen; it can never get hot enough to fuse c
- **Mapped Narration Segments (5)**: `10-10-05-title`, `10-10-05-didYouKnow-1`, `10-10-05-detail-1`, `10-10-05-detail-2`, `10-10-05-detail-3`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m10-10-05-beat-1`**<br>*Red Giants and Red Supergiants — Primary Physical Mechanism* | `10-10-05-title`<br>`10-10-05-didYouKnow-1`<br>`10-10-05-detail-1` | 5. Red Giants and Red Supergiants THE SUN WILL NEVER EXPLODE AS A SUPERNOVA! The Sun only has enough gravity to reach carbon and oxygen; it can never get hot enough to fuse carbon, so it will gently puff off its outer layers instead. After the helium flash, th | `scientific_cross_section` in `stellar_interior_ro`<br>Transition: `chronological_transformation` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m10-10-05-beat-2`**<br>*Red Giants and Red Supergiants — Quantitative Analysis & Interactive Synthesis* | `10-10-05-detail-2`<br>`10-10-05-detail-3` | When core helium is exhausted, the star ascends the 'Asymptotic Giant Branch' (AGB), experiencing violent thermal pulses. Massive stars (>8 solar masses) fuse through silicon in just days, building an iron-56 core at 3 billion Kelvin. | `planetary_orbital_shot` in `stellar_interior_ro`<br>Transition: `smooth_orbital_travel` | Labels: `Red Giants and Red Supergiants Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m10-5-param` (Red Giants and Red Supergiants Parameter Explorer — selector `#module-10-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Red Giants and Red Supergiants (act_10_evolution_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 10.6 — White Dwarfs (`10-06`)

- **Storyboard ID**: `sb-m10-10-06`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION`
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `stellar_interior_ro` | `scientific_cross_section` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of White Dwarfs within Birth, Life & Death of Stars.
  2. Subrahmanyan Chandrasekhar calculated the 1.44-solar-mass limit in 1930 on a steamship journey from India to England when he was only 19 yea
- **Mapped Narration Segments (5)**: `10-10-06-title`, `10-10-06-didYouKnow-1`, `10-10-06-detail-1`, `10-10-06-detail-2`, `10-10-06-detail-3`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m10-10-06-beat-1`**<br>*White Dwarfs — Primary Physical Mechanism* | `10-10-06-title`<br>`10-10-06-didYouKnow-1`<br>`10-10-06-detail-1` | 6. White Dwarfs Subrahmanyan Chandrasekhar calculated the 1.44-solar-mass limit in 1930 on a steamship journey from India to England when he was only 19 years old! White dwarfs have typical masses around 0.6 M☉ packed into a volume no larger than Earth (radius | `scientific_cross_section` in `stellar_interior_ro`<br>Transition: `chronological_transformation` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m10-10-06-beat-2`**<br>*White Dwarfs — Quantitative Analysis & Interactive Synthesis* | `10-10-06-detail-2`<br>`10-10-06-detail-3` | Because electron degeneracy is independent of temperature, a white dwarf does not shrink as it cools. Over trillions of years, it will slowly radiate its residual thermal heat until it becomes a cold, dark 'Black Dwarf'. | `scientific_cross_section` in `stellar_interior_ro`<br>Transition: `smooth_orbital_travel` | Labels: `White Dwarfs Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m10-6-param` (White Dwarfs Parameter Explorer — selector `#module-10-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for White Dwarfs (act_10_evolution_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 10.7 — Supernovae (`10-07`)

- **Storyboard ID**: `sb-m10-10-07`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION`
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `stellar_interior_ro` | `scientific_cross_section` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Supernovae within Birth, Life & Death of Stars.
  2. Supernova 1054 was so intensely bright that Chinese and Native American astronomers recorded seeing it shine clearly in broad daylight for 2
- **Mapped Narration Segments (5)**: `10-10-07-title`, `10-10-07-didYouKnow-1`, `10-10-07-detail-1`, `10-10-07-detail-2`, `10-10-07-detail-3`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m10-10-07-beat-1`**<br>*Supernovae — Primary Physical Mechanism* | `10-10-07-title`<br>`10-10-07-didYouKnow-1`<br>`10-10-07-detail-1` | 7. Supernovae Supernova 1054 was so intensely bright that Chinese and Native American astronomers recorded seeing it shine clearly in broad daylight for 23 straight days! 99% of a supernova's energy is carried away by invisible neutrinos; only 1% powers the ph | `scientific_cross_section` in `stellar_interior_ro`<br>Transition: `chronological_transformation` | Labels: `supernova`<br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m10-10-07-beat-2`**<br>*Supernovae — Quantitative Analysis & Interactive Synthesis* | `10-10-07-detail-2`<br>`10-10-07-detail-3` | In 1987, Supernova 1987A in the Large Magellanic Cloud allowed scientists on Earth to detect these neutrinos 3 hours before visible light broke through! The expanding debris cloud is called a Supernova Remnant (like the Crab Nebula). | `planetary_orbital_shot` in `stellar_interior_ro`<br>Transition: `smooth_orbital_travel` | Labels: `Supernovae Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m10-7-param` (Supernovae Parameter Explorer — selector `#module-10-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Supernovae (act_10_evolution_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 10.8 — Neutron Stars and Stellar Black Holes (`10-08`)

- **Storyboard ID**: `sb-m10-10-08`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION`
- **Interactivity Mode**: `REQUIRED_LEARNING_ACTIVITY`
- **Coordinate Frame & Camera Preset**: `stellar_interior_ro` | `scientific_cross_section` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Neutron Stars and Stellar Black Holes within Birth, Life & Death of Stars.
  2. If you fell into a stellar-mass black hole feet first, gravity at your feet would be so much stronger than at your head that you would be st
- **Mapped Narration Segments (5)**: `10-10-08-title`, `10-10-08-didYouKnow-1`, `10-10-08-detail-1`, `10-10-08-detail-2`, `10-10-08-detail-3`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m10-10-08-beat-1`**<br>*Neutron Stars and Stellar Black Holes — Primary Physical Mechanism* | `10-10-08-title`<br>`10-10-08-didYouKnow-1`<br>`10-10-08-detail-1` | 8. Neutron Stars and Stellar Black Holes If you fell into a stellar-mass black hole feet first, gravity at your feet would be so much stronger than at your head that you would be stretched out like a noodle—a real scientific process astrophysicists call 'Spagh | `scientific_cross_section` in `stellar_interior_ro`<br>Transition: `chronological_transformation` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m10-10-08-beat-2`**<br>*Neutron Stars and Stellar Black Holes — Quantitative Analysis & Interactive Synthesis* | `10-10-08-detail-2`<br>`10-10-08-detail-3` | A 10-solar-mass black hole has an event horizon radius of only about 30 kilometers. Gravitational waves from colliding neutron stars (kilonovae) were directly detected by LIGO in 2017, proving where heavy elements like gold are created. | `data_visualization_view` in `stellar_interior_ro`<br>Transition: `observational_data_reveal` | Labels: `Neutron Stars and Stellar Black Holes Telemetry`<br>Gate: `REQUIRED_LEARNING_ACTIVITY` (Requires `act_10_stellar_evolution_timeline`) |

- **Interactive Controls**: `ctrl-m10-8-param` (Neutron Stars and Stellar Black Holes Parameter Explorer — selector `#module-10-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Neutron Stars and Stellar Black Holes (act_10_evolution_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---
