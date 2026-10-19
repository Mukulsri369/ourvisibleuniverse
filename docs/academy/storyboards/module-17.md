# Module 17 Cinematic Storyboard — Big Bang & Cosmic Evolution

- **Module ID**: `17` (`stageId: "stage-5-understanding-universe"`, Course: `"cosmic-journey"`)
- **Total Instructional Chapters (Sublessons)**: **8**
- **Total Mapped Narration Segments**: **45** (`explorer` canonical sequence; adapted across `junior`, `explorer`, `astronomer`)
- **Primary 3D Scene & Component**: `m17_big_bang_chronicle_3d` (`src/components/academy/CosmicTimeMachine3D.tsx (Upgrading to CosmicEvolutionChronicle3D.tsx)`)
- **Visual Style & Lighting Preset**: `stage5_cosmological_metric` | `cosmological_ambient` (`ACES Filmic`, `exposure: 1.05`, `bloomThreshold: 0.80`)
- **Primary Interactive Activity Gate**: `act_17_cmb_explorer` — *Cosmic Microwave Background Power Spectrum Lab* (Analyze acoustic peaks in the Planck CMB angular power spectrum.)
- **Scientific References**: Planck 2018 Results. VI. Cosmological Parameters (Planck Collaboration / Astronomy & Astrophysics - https://www.aanda.org/articles/aa/full_html/2020/09/aa33880-18/aa33880-18.html); A Measurement of Excess Antenna Temperature at 4080 Mc/s (Penzias & Wilson (1965) / Astrophysical Journal - https://ui.adsabs.harvard.edu/abs/1965ApJ...142..419P); The Cosmic History of Star Formation (Madau & Dickinson (2014) / Annual Review of Astronomy & Astrophysics - https://ui.adsabs.harvard.edu/abs/2014ARA%26A..52..415M); A Candidate z = 14.32 Galaxy Confirmed by JWST NIRSpec (JADES-GS-z14-0) (Carniani et al. (2024) / Nature / arXiv:2405.18485 - https://arxiv.org/abs/2405.18485)

---

## Chapter 17.1 — What the Big Bang Model Describes (`m17-l1`)

- **Storyboard ID**: `sb-m17-m17-l1`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION` — *Metric expansion of space shown via comoving 3D lattice and FLRW expansion horn (never an explosion into empty space).*
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `comoving_cosmological` | `timeline_camera` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of What the Big Bang Model Describes within Big Bang & Cosmic Evolution.
  2. What Was the Big Bang?
- **Mapped Narration Segments (6)**: `17-m17-l1-title`, `17-m17-l1-explanation-1`, `17-m17-l1-explanation-2`, `17-m17-l1-explanation-3`, `17-m17-l1-explanation-4`, `17-m17-l1-explanation-5`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m17-m17-l1-beat-1`**<br>*What the Big Bang Model Describes — Primary Physical Mechanism* | `17-m17-l1-title`<br>`17-m17-l1-explanation-1`<br>`17-m17-l1-explanation-2` | What the Big Bang Model Describes What Was the Big Bang? The biggest misconception in all of science is imagining the Big Bang as a giant bomb exploding into empty black space. | `timeline_camera` in `comoving_cosmological`<br>Transition: `chronological_transformation` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m17-m17-l1-beat-2`**<br>*What the Big Bang Model Describes — Quantitative Analysis & Interactive Synthesis* | `17-m17-l1-explanation-3`<br>`17-m17-l1-explanation-4`<br>`17-m17-l1-explanation-5` | **There was no pre-existing empty space, and there was no explosion!** **
* Think of space as the rubber of an uninflated balloon covered in painted dots (galaxies). As you blow into the balloon, every dot moves away from every other dot. * The dots aren't tra | `planetary_orbital_shot` in `comoving_cosmological`<br>Transition: `smooth_orbital_travel` | Labels: `What the Big Bang Model Describes Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m17-1-param` (What the Big Bang Model Describes Parameter Explorer — selector `#module-17-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for What the Big Bang Model Describes (act_17_cmb_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 17.2 — The Early Hot, Dense Universe (`m17-l2`)

- **Storyboard ID**: `sb-m17-m17-l2`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION` — *Metric expansion of space shown via comoving 3D lattice and FLRW expansion horn (never an explosion into empty space).*
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `comoving_cosmological` | `timeline_camera` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of The Early Hot, Dense Universe within Big Bang & Cosmic Evolution.
  2. The Sizzling Cosmic Nursery
- **Mapped Narration Segments (5)**: `17-m17-l2-title`, `17-m17-l2-explanation-1`, `17-m17-l2-explanation-2`, `17-m17-l2-explanation-3`, `17-m17-l2-explanation-4`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m17-m17-l2-beat-1`**<br>*The Early Hot, Dense Universe — Primary Physical Mechanism* | `17-m17-l2-title`<br>`17-m17-l2-explanation-1`<br>`17-m17-l2-explanation-2` | The Early Hot, Dense Universe The Sizzling Cosmic Nursery Imagine squeezing all the matter of two trillion galaxies into a space smaller than the head of a pin! | `timeline_camera` in `comoving_cosmological`<br>Transition: `chronological_transformation` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m17-m17-l2-beat-2`**<br>*The Early Hot, Dense Universe — Quantitative Analysis & Interactive Synthesis* | `17-m17-l2-explanation-3`<br>`17-m17-l2-explanation-4` | During the first seconds of the universe:
* **Unbelievable Heat**: The temperature exceeded trillions of degrees. * **Pure Energy**: Light was so powerful that pairs of matter and antimatter particles popped into existence from pure energy ($E = mc^2$) and ann | `scientific_cross_section` in `comoving_cosmological`<br>Transition: `smooth_orbital_travel` | Labels: `The Early Hot, Dense Universe Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m17-2-param` (The Early Hot, Dense Universe Parameter Explorer — selector `#module-17-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for The Early Hot, Dense Universe (act_17_cmb_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 17.3 — Formation of Light Atomic Nuclei (`m17-l3`)

- **Storyboard ID**: `sb-m17-m17-l3`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION` — *Metric expansion of space shown via comoving 3D lattice and FLRW expansion horn (never an explosion into empty space).*
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `comoving_cosmological` | `timeline_camera` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Formation of Light Atomic Nuclei within Big Bang & Cosmic Evolution.
  2. The First 20 Minutes: Cooking the Elements
- **Mapped Narration Segments (6)**: `17-m17-l3-title`, `17-m17-l3-explanation-1`, `17-m17-l3-explanation-2`, `17-m17-l3-explanation-3`, `17-m17-l3-explanation-4`, `17-m17-l3-explanation-5`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m17-m17-l3-beat-1`**<br>*Formation of Light Atomic Nuclei — Primary Physical Mechanism* | `17-m17-l3-title`<br>`17-m17-l3-explanation-1`<br>`17-m17-l3-explanation-2` | Formation of Light Atomic Nuclei The First 20 Minutes: Cooking the Elements Where did the atoms inside our bodies come from? * Heavy atoms like gold, iron, and carbon were made inside dying stars billions of years later. | `timeline_camera` in `comoving_cosmological`<br>Transition: `chronological_transformation` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m17-m17-l3-beat-2`**<br>*Formation of Light Atomic Nuclei — Quantitative Analysis & Interactive Synthesis* | `17-m17-l3-explanation-3`<br>`17-m17-l3-explanation-4`<br>`17-m17-l3-explanation-5` | Between 3 and 20 minutes after the Big Bang, the universe was like the core of an enormous star. Protons and neutrons crashed together, building:
1. **Hydrogen** (~75% of all cosmic mass)
2. **Helium** (~25% of cosmic mass)
3. Tiny pinches of **Deuterium** (he | `planetary_orbital_shot` in `comoving_cosmological`<br>Transition: `smooth_orbital_travel` | Labels: `Formation of Light Atomic Nuclei Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m17-3-param` (Formation of Light Atomic Nuclei Parameter Explorer — selector `#module-17-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Formation of Light Atomic Nuclei (act_17_cmb_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 17.4 — Formation of Atoms & The Cosmic Microwave Background (`m17-l4`)

- **Storyboard ID**: `sb-m17-m17-l4`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION` — *Metric expansion of space shown via comoving 3D lattice and FLRW expansion horn (never an explosion into empty space).*
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `comoving_cosmological` | `timeline_camera` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Formation of Atoms & The Cosmic Microwave Background within Big Bang & Cosmic Evolution.
  2. The Day the Cosmic Fog Cleared
- **Mapped Narration Segments (6)**: `17-m17-l4-title`, `17-m17-l4-explanation-1`, `17-m17-l4-explanation-2`, `17-m17-l4-explanation-3`, `17-m17-l4-explanation-4`, `17-m17-l4-explanation-5`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m17-m17-l4-beat-1`**<br>*Formation of Atoms & The Cosmic Microwave Background — Primary Physical Mechanism* | `17-m17-l4-title`<br>`17-m17-l4-explanation-1`<br>`17-m17-l4-explanation-2` | Formation of Atoms & The Cosmic Microwave Background The Day the Cosmic Fog Cleared For 380,000 years after the Big Bang, space was a glowing, blinding orange-white fog. | `timeline_camera` in `comoving_cosmological`<br>Transition: `chronological_transformation` | Labels: `cosmic microwave background`<br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m17-m17-l4-beat-2`**<br>*Formation of Atoms & The Cosmic Microwave Background — Quantitative Analysis & Interactive Synthesis* | `17-m17-l4-explanation-3`<br>`17-m17-l4-explanation-4`<br>`17-m17-l4-explanation-5` | Why couldn't light travel? * Free electrons acted like tiny pinballs, bouncing light in every direction so it couldn't travel in a straight line. * But when the universe cooled down to **3,000 Kelvin**, something magical happened: atomic nuclei captured the fl | `scientific_cross_section` in `comoving_cosmological`<br>Transition: `smooth_orbital_travel` | Labels: `Formation of Atoms & The Cosmic Microwave Background Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m17-4-param` (Formation of Atoms & The Cosmic Microwave Background Parameter Explorer — selector `#module-17-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Formation of Atoms & The Cosmic Microwave Background (act_17_cmb_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 17.5 — The Cosmic Dark Ages (`m17-l5`)

- **Storyboard ID**: `sb-m17-m17-l5`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION` — *Metric expansion of space shown via comoving 3D lattice and FLRW expansion horn (never an explosion into empty space).*
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `comoving_cosmological` | `timeline_camera` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of The Cosmic Dark Ages within Big Bang & Cosmic Evolution.
  2. The Long Cosmic Night
- **Mapped Narration Segments (5)**: `17-m17-l5-title`, `17-m17-l5-explanation-1`, `17-m17-l5-explanation-2`, `17-m17-l5-explanation-3`, `17-m17-l5-explanation-4`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m17-m17-l5-beat-1`**<br>*The Cosmic Dark Ages — Primary Physical Mechanism* | `17-m17-l5-title`<br>`17-m17-l5-explanation-1`<br>`17-m17-l5-explanation-2` | The Cosmic Dark Ages The Long Cosmic Night After the bright glow of the CMB faded into invisible infrared, total darkness blanketed the universe for over 100 million years. | `timeline_camera` in `comoving_cosmological`<br>Transition: `chronological_transformation` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m17-m17-l5-beat-2`**<br>*The Cosmic Dark Ages — Quantitative Analysis & Interactive Synthesis* | `17-m17-l5-explanation-3`<br>`17-m17-l5-explanation-4` | * **No stars existed.**
* **No galaxies shone.**
* There were no planets, no black holes, and no fires. Just silent clouds of hydrogen and helium gas drifting in blackness. Yet, this was when the seeds of the universe were growing! Invisible dark matter was pu | `planetary_orbital_shot` in `comoving_cosmological`<br>Transition: `smooth_orbital_travel` | Labels: `The Cosmic Dark Ages Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m17-5-param` (The Cosmic Dark Ages Parameter Explorer — selector `#module-17-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for The Cosmic Dark Ages (act_17_cmb_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 17.6 — The First Stars & Galaxies (`m17-l6`)

- **Storyboard ID**: `sb-m17-m17-l6`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION` — *Metric expansion of space shown via comoving 3D lattice and FLRW expansion horn (never an explosion into empty space).*
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `comoving_cosmological` | `timeline_camera` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of The First Stars & Galaxies within Big Bang & Cosmic Evolution.
  2. The First Dawn of Starlight
- **Mapped Narration Segments (6)**: `17-m17-l6-title`, `17-m17-l6-explanation-1`, `17-m17-l6-explanation-2`, `17-m17-l6-explanation-3`, `17-m17-l6-explanation-4`, `17-m17-l6-explanation-5`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m17-m17-l6-beat-1`**<br>*The First Stars & Galaxies — Primary Physical Mechanism* | `17-m17-l6-title`<br>`17-m17-l6-explanation-1`<br>`17-m17-l6-explanation-2` | The First Stars & Galaxies The First Dawn of Starlight Roughly 150 million years after the Big Bang, the first stars ignited—and they were unlike anything in the modern sky! | `timeline_camera` in `comoving_cosmological`<br>Transition: `chronological_transformation` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m17-m17-l6-beat-2`**<br>*The First Stars & Galaxies — Quantitative Analysis & Interactive Synthesis* | `17-m17-l6-explanation-3`<br>`17-m17-l6-explanation-4`<br>`17-m17-l6-explanation-5` | * **Monster Stars (Population III)**:
  Made of pure hydrogen and helium with zero metal impurities, these stars were **100 to 300 times more massive than our Sun** and millions of times brighter! * **Short, Spectacular Lives**:
  Because they burned their fue | `scientific_cross_section` in `comoving_cosmological`<br>Transition: `smooth_orbital_travel` | Labels: `The First Stars & Galaxies Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m17-6-param` (The First Stars & Galaxies Parameter Explorer — selector `#module-17-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for The First Stars & Galaxies (act_17_cmb_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 17.7 — Galaxy Evolution Over Billions of Years (`m17-l7`)

- **Storyboard ID**: `sb-m17-m17-l7`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION` — *Metric expansion of space shown via comoving 3D lattice and FLRW expansion horn (never an explosion into empty space).*
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `comoving_cosmological` | `timeline_camera` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Galaxy Evolution Over Billions of Years within Big Bang & Cosmic Evolution.
  2. The Wild Youth of Galaxies
- **Mapped Narration Segments (5)**: `17-m17-l7-title`, `17-m17-l7-explanation-1`, `17-m17-l7-explanation-2`, `17-m17-l7-explanation-3`, `17-m17-l7-explanation-4`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m17-m17-l7-beat-1`**<br>*Galaxy Evolution Over Billions of Years — Primary Physical Mechanism* | `17-m17-l7-title`<br>`17-m17-l7-explanation-1`<br>`17-m17-l7-explanation-2` | Galaxy Evolution Over Billions of Years The Wild Youth of Galaxies Galaxies were not born in neat spiral shapes like the Milky Way today. | `timeline_camera` in `comoving_cosmological`<br>Transition: `chronological_transformation` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m17-m17-l7-beat-2`**<br>*Galaxy Evolution Over Billions of Years — Quantitative Analysis & Interactive Synthesis* | `17-m17-l7-explanation-3`<br>`17-m17-l7-explanation-4` | **
* They collided constantly, cannibalizing smaller galaxies and fueling giant starbursts. * **Cosmic Noon** (about 10 billion years ago): The universe was making stars 10 times faster than it does today! * Over billions of years, collisions settled down. Gra | `planetary_orbital_shot` in `comoving_cosmological`<br>Transition: `smooth_orbital_travel` | Labels: `Galaxy Evolution Over Billions of Years Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m17-7-param` (Galaxy Evolution Over Billions of Years Parameter Explorer — selector `#module-17-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Galaxy Evolution Over Billions of Years (act_17_cmb_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 17.8 — The Modern Universe & Beyond (`m17-l8`)

- **Storyboard ID**: `sb-m17-m17-l8`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION` — *Metric expansion of space shown via comoving 3D lattice and FLRW expansion horn (never an explosion into empty space).*
- **Interactivity Mode**: `REQUIRED_LEARNING_ACTIVITY`
- **Coordinate Frame & Camera Preset**: `comoving_cosmological` | `timeline_camera` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of The Modern Universe & Beyond within Big Bang & Cosmic Evolution.
  2. Our Modern Cosmic Home
- **Mapped Narration Segments (6)**: `17-m17-l8-title`, `17-m17-l8-explanation-1`, `17-m17-l8-explanation-2`, `17-m17-l8-explanation-3`, `17-m17-l8-explanation-4`, `17-m17-l8-explanation-5`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m17-m17-l8-beat-1`**<br>*The Modern Universe & Beyond — Primary Physical Mechanism* | `17-m17-l8-title`<br>`17-m17-l8-explanation-1`<br>`17-m17-l8-explanation-2` | The Modern Universe & Beyond Our Modern Cosmic Home Today, the universe is **13.8 billion years old.** | `timeline_camera` in `comoving_cosmological`<br>Transition: `chronological_transformation` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m17-m17-l8-beat-2`**<br>*The Modern Universe & Beyond — Quantitative Analysis & Interactive Synthesis* | `17-m17-l8-explanation-3`<br>`17-m17-l8-explanation-4`<br>`17-m17-l8-explanation-5` | What does our modern universe look like? * **A Mature Web**: Billions of galaxies are laced across cosmic filaments separated by vast, nearly empty voids. 7 degrees above absolute zero. 6 billion years ago in a quiet corner of the Milky Way, rich in the metals | `data_visualization_view` in `comoving_cosmological`<br>Transition: `observational_data_reveal` | Labels: `The Modern Universe & Beyond Telemetry`<br>Gate: `REQUIRED_LEARNING_ACTIVITY` (Requires `act_17_cmb_explorer`) |

- **Interactive Controls**: `ctrl-m17-8-param` (The Modern Universe & Beyond Parameter Explorer — selector `#module-17-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for The Modern Universe & Beyond (act_17_cmb_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Stage 5 Prompt 13 — Authoritative 3D Scene & Epistemic Audit (`CosmosStage5Manifest.ts`)

| Chapter ID | 3D Scene Component ID | Representation Category | Epistemic Classification & Physical Equations |
| :--- | :--- | :--- | :--- |
| **`m17-l1`** | `m17_ch1_expansion_of_space_grid` | `NUMERICAL_SCIENTIFIC_MODEL` | **Metric Expansion vs Explosion**: $v = H_0 d$, $d(t) = a(t)\chi$. Bound Local Group remains fixed in radius while intergalactic comoving grid stretches isotropically from every observer node. |
| **`m17-l2`** | `m17_ch2_cosmological_redshift_wave` | `OBSERVED_DATA` | **Cosmological Redshift**: $1 + z = \lambda_{\text{obs}} / \lambda_{\text{emit}} = a_0 / a(t_{\text{emit}})$. Stretching photon wavepacket along FLRW geodesic. |
| **`m17-l3`** | `m17_ch3_reverse_cosmic_timeline` | `NUMERICAL_SCIENTIFIC_MODEL` | **Reverse Cosmic Film & Epistemic Boundary**: $T(a) \propto 1/a(t)$, $\rho_r \propto a^{-4}$. Explicitly marks $t \to 0$ Planck epoch ($t_P \approx 5.4 \times 10^{-44}\text{ s}$) as the boundary of classical General Relativity. |
| **`m17-l4`** | `m17_ch4_bbn_nuclear_reactor` | `NUMERICAL_SCIENTIFIC_MODEL` | **Big Bang Nucleosynthesis ($t \approx 180\text{ s}$)**: Deuterium bottleneck ($E_B = 2.22\text{ MeV}$) clears at $T \approx 9 \times 10^8\text{ K}$, locking in $Y_p = 2(n/p)/[1+(n/p)] \approx 25\%$ $^4\text{He}$ and $\sim 75\%$ $^1\text{H}$ by mass. |
| **`m17-l5`** | `m17_ch5_recombination_fog_clearing` | `NUMERICAL_SCIENTIFIC_MODEL` | **Recombination & Surface of Last Scattering**: $z \approx 1090$, $t \approx 378,000\text{ yr}$, $T \approx 3000\text{ K}$. Free electron fraction $x_e$ drops from $1 \to 10^{-4}$, decoupling Thomson-scattered photons. |
| **`m17-l6`** | `m17_ch6_cmb_planck_sphere` | `OBSERVED_DATA` | **Planck 2018 CMB & Acoustic Peaks**: $T_0 = 2.72548 \pm 0.00057\text{ K}$, $\Delta T / T \approx 10^{-5}$ (amplified $10^5\times$), first acoustic peak $\ell_1 \approx 220$ ($r_s \approx 147\text{ Mpc}$, $\Omega_K \approx 0$). |
| **`m17-l7`** | `m17_ch7_cosmic_inflation_curvature` | `EDUCATIONAL_APPROXIMATION` | **Cosmic Inflation ($N \ge 60$ e-folds)**: Exponential stretch $e^{60} \approx 10^{26}$ flattens curvature and seeds quantum perturbations; explicitly badged as a theoretical extension under active polarization testing. |
| **`m17-l8`** | `m17_ch8_three_pillars_synthesis` | `OBSERVED_DATA` | **Three Observational Pillars Synthesis**: Independent concordance of Hubble expansion, BBN light-element yields, and Planck CMB acoustic spectrum at $\Omega_b h^2 = 0.0224 \pm 0.0001$. |
