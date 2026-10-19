# Module 09 Cinematic Storyboard — Stars: Colors, Sizes & Temperatures

- **Module ID**: `09` (`stageId: "stage-3-life-of-stars"`, Course: `"cosmic-journey"`)
- **Total Instructional Chapters (Sublessons)**: **7**
- **Total Mapped Narration Segments**: **35** (`explorer` canonical sequence; adapted across `junior`, `explorer`, `astronomer`)
- **Primary 3D Scene & Component**: `m09_stellar_museum_hr_3d` (`src/components/academy/StellarMuseum3D.tsx`)
- **Visual Style & Lighting Preset**: `stage3_stellar_radiance` | `stellar_point_blackbody` (`ACES Filmic`, `exposure: 1.05`, `bloomThreshold: 0.80`)
- **Primary Interactive Activity Gate**: `act_09_hr_diagram_lab` — *Hertzsprung-Russell Diagram Explorer* (Place stars onto the H-R diagram by temperature (K) and luminosity (L_sun).)
- **Scientific References**: ESA Gaia Mission: Star Mapping & The Hertzsprung-Russell Diagram (ESA - https://www.cosmos.esa.int/web/gaia/dr3); NASA Astrophysics: Stars, Classification & Stellar Lifecycles (NASA - https://science.nasa.gov/astrophysics/focus-areas/how-do-stars-form-and-evolve/); IAU Commission G1: Binary and Multiple Star Systems & Fundamental Stellar Parameters (IAU - https://www.iau.org/science/scientific_bodies/commissions/G1/)

---

## Chapter 09.1 — What Makes a Star Shine? (`09-01`)

- **Storyboard ID**: `sb-m09-09-01`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION` — *Stellar radii span 0.008 R_sun (White Dwarf) to >700 R_sun (Betelgeuse); colors calibrated via Planckian locus.*
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `stellar_interior_ro` | `scale_comparison_view` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of What Makes a Star Shine? within Stars: Colors, Sizes & Temperatures.
  2. The sunlight hitting your face right now was generated inside the Sun's core during the last ice age on Earth, tens of thousands of years ag
- **Mapped Narration Segments (5)**: `09-09-01-title`, `09-09-01-didYouKnow-1`, `09-09-01-detail-1`, `09-09-01-detail-2`, `09-09-01-detail-3`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m09-09-01-beat-1`**<br>*What Makes a Star Shine? — Primary Physical Mechanism* | `09-09-01-title`<br>`09-09-01-didYouKnow-1`<br>`09-09-01-detail-1` | 1. What Makes a Star Shine? The sunlight hitting your face right now was generated inside the Sun's core during the last ice age on Earth, tens of thousands of years ago! Low and medium mass stars like the Sun rely predominantly on the proton-proton (p-p) chai | `scale_comparison_view` in `stellar_interior_ro`<br>Transition: `comparison_split_transition` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m09-09-01-beat-2`**<br>*What Makes a Star Shine? — Quantitative Analysis & Interactive Synthesis* | `09-09-01-detail-2`<br>`09-09-01-detail-3` | Hotter, more massive stars (>1.3 solar masses) fuse hydrogen via the catalytic CNO (Carbon-Nitrogen-Oxygen) cycle. Photons take 10,000 to 170,000 years to slowly diffuse through the dense radiative zone via countless Thomson scatterings. | `planetary_orbital_shot` in `stellar_interior_ro`<br>Transition: `smooth_orbital_travel` | Labels: `What Makes a Star Shine? Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m09-1-param` (What Makes a Star Shine? Parameter Explorer — selector `#module-09-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for What Makes a Star Shine? (act_09_hr_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 09.2 — Why Stars Have Different Colors (`09-02`)

- **Storyboard ID**: `sb-m09-09-02`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION` — *Stellar radii span 0.008 R_sun (White Dwarf) to >700 R_sun (Betelgeuse); colors calibrated via Planckian locus.*
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `stellar_interior_ro` | `scale_comparison_view` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Why Stars Have Different Colors within Stars: Colors, Sizes & Temperatures.
  2. Do not confuse real star colors with astrophotography images! Space telescope images often use false-color narrowband filters (like hydrogen
- **Mapped Narration Segments (5)**: `09-09-02-title`, `09-09-02-didYouKnow-1`, `09-09-02-detail-1`, `09-09-02-detail-2`, `09-09-02-detail-3`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m09-09-02-beat-1`**<br>*Why Stars Have Different Colors — Primary Physical Mechanism* | `09-09-02-title`<br>`09-09-02-didYouKnow-1`<br>`09-09-02-detail-1` | 2. Why Stars Have Different Colors Do not confuse real star colors with astrophotography images! Space telescope images often use false-color narrowband filters (like hydrogen-alpha and oxygen-III) that tint clouds green and purple for scientific analysis, but | `scale_comparison_view` in `stellar_interior_ro`<br>Transition: `comparison_split_transition` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m09-09-02-beat-2`**<br>*Why Stars Have Different Colors — Quantitative Analysis & Interactive Synthesis* | `09-09-02-detail-2`<br>`09-09-02-detail-3` | Sun-like stars peak near 500 nm (green-blue light), but because they also emit abundant red, yellow, and blue light simultaneously, human trichromatic vision perceives them as white. Hot O and B stars peak in the far ultraviolet, but their visible light tail i | `scientific_cross_section` in `stellar_interior_ro`<br>Transition: `smooth_orbital_travel` | Labels: `Why Stars Have Different Colors Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m09-2-param` (Why Stars Have Different Colors Parameter Explorer — selector `#module-09-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Why Stars Have Different Colors (act_09_hr_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 09.3 — Stellar Temperature and Spectral Class (`09-03`)

- **Storyboard ID**: `sb-m09-09-03`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION` — *Stellar radii span 0.008 R_sun (White Dwarf) to >700 R_sun (Betelgeuse); colors calibrated via Planckian locus.*
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `stellar_interior_ro` | `scale_comparison_view` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Stellar Temperature and Spectral Class within Stars: Colors, Sizes & Temperatures.
  2. Astronomers have recently added three new spectral classes for ultra-cool failed stars and brown dwarfs: L, T, and Y, where temperatures dro
- **Mapped Narration Segments (5)**: `09-09-03-title`, `09-09-03-didYouKnow-1`, `09-09-03-detail-1`, `09-09-03-detail-2`, `09-09-03-detail-3`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m09-09-03-beat-1`**<br>*Stellar Temperature and Spectral Class — Primary Physical Mechanism* | `09-09-03-title`<br>`09-09-03-didYouKnow-1`<br>`09-09-03-detail-1` | 3. Stellar Temperature and Spectral Class Astronomers have recently added three new spectral classes for ultra-cool failed stars and brown dwarfs: L, T, and Y, where temperatures drop down to just 300 Kelvin (room temperature)! In hot O stars, hydrogen atoms a | `scale_comparison_view` in `stellar_interior_ro`<br>Transition: `comparison_split_transition` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m09-09-03-beat-2`**<br>*Stellar Temperature and Spectral Class — Quantitative Analysis & Interactive Synthesis* | `09-09-03-detail-2`<br>`09-09-03-detail-3` | In cool M stars, temperatures are low enough for complex molecules like Titanium Oxide (TiO) to survive, creating broad absorption bands that carve valleys into the spectrum. Our Sun is classified as G2V: 'G2' means surface temperature 5,772 K, and 'V' denotes | `planetary_orbital_shot` in `stellar_interior_ro`<br>Transition: `smooth_orbital_travel` | Labels: `Stellar Temperature and Spectral Class Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m09-3-param` (Stellar Temperature and Spectral Class Parameter Explorer — selector `#module-09-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Stellar Temperature and Spectral Class (act_09_hr_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 09.4 — Luminosity versus Apparent Brightness (`09-04`)

- **Storyboard ID**: `sb-m09-09-04`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION` — *Stellar radii span 0.008 R_sun (White Dwarf) to >700 R_sun (Betelgeuse); colors calibrated via Planckian locus.*
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `stellar_interior_ro` | `scale_comparison_view` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Luminosity versus Apparent Brightness within Stars: Colors, Sizes & Temperatures.
  2. Ancient astronomer Hipparchus invented the magnitude scale in 150 BCE by calling the brightest stars '1st class' and the faintest visible st
- **Mapped Narration Segments (5)**: `09-09-04-title`, `09-09-04-didYouKnow-1`, `09-09-04-detail-1`, `09-09-04-detail-2`, `09-09-04-detail-3`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m09-09-04-beat-1`**<br>*Luminosity versus Apparent Brightness — Primary Physical Mechanism* | `09-09-04-title`<br>`09-09-04-didYouKnow-1`<br>`09-09-04-detail-1` | 4. Luminosity versus Apparent Brightness Ancient astronomer Hipparchus invented the magnitude scale in 150 BCE by calling the brightest stars '1st class' and the faintest visible stars '6th class'. That is why brighter objects have smaller (and even negative)  | `scale_comparison_view` in `stellar_interior_ro`<br>Transition: `comparison_split_transition` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m09-09-04-beat-2`**<br>*Luminosity versus Apparent Brightness — Quantitative Analysis & Interactive Synthesis* | `09-09-04-detail-2`<br>`09-09-04-detail-3` | Rigel has an absolute magnitude of M = -7.84. Even though it is 860 light-years away, it outshines almost every star in our night sky because its true luminosity is 120,000 Suns! The magnitude scale is logarithmic: a difference of 5 magnitudes corresponds to e | `scientific_cross_section` in `stellar_interior_ro`<br>Transition: `smooth_orbital_travel` | Labels: `Luminosity versus Apparent Brightness Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m09-4-param` (Luminosity versus Apparent Brightness Parameter Explorer — selector `#module-09-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Luminosity versus Apparent Brightness (act_09_hr_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 09.5 — Stellar Size and Mass (`09-05`)

- **Storyboard ID**: `sb-m09-09-05`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION` — *Stellar radii span 0.008 R_sun (White Dwarf) to >700 R_sun (Betelgeuse); colors calibrated via Planckian locus.*
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `stellar_interior_ro` | `scale_comparison_view` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Stellar Size and Mass within Stars: Colors, Sizes & Temperatures.
  2. Because a star's lifespan scales as Mass / Luminosity ≈ M / M^(3.5) = M^(-2.5), low-mass red dwarfs will still be shining when the universe 
- **Mapped Narration Segments (5)**: `09-09-05-title`, `09-09-05-didYouKnow-1`, `09-09-05-detail-1`, `09-09-05-detail-2`, `09-09-05-detail-3`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m09-09-05-beat-1`**<br>*Stellar Size and Mass — Primary Physical Mechanism* | `09-09-05-title`<br>`09-09-05-didYouKnow-1`<br>`09-09-05-detail-1` | 5. Stellar Size and Mass Because a star's lifespan scales as Mass / Luminosity ≈ M / M^(3.5) = M^(-2.5), low-mass red dwarfs will still be shining when the universe is 1,000 times older than it is today! A star with twice the mass of the Sun produces roughly 2 | `scale_comparison_view` in `stellar_interior_ro`<br>Transition: `comparison_split_transition` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m09-09-05-beat-2`**<br>*Stellar Size and Mass — Quantitative Analysis & Interactive Synthesis* | `09-09-05-detail-2`<br>`09-09-05-detail-3` | A star with 10 times the Sun's mass shines about 3,160 times brighter, living only ~30 million years compared to the Sun's 10 billion years. White dwarfs have high surface temperatures (>25,000 K) but tiny luminosities (L ≈ 0.001 L_☉) because their radius is o | `planetary_orbital_shot` in `stellar_interior_ro`<br>Transition: `smooth_orbital_travel` | Labels: `Stellar Size and Mass Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m09-5-param` (Stellar Size and Mass Parameter Explorer — selector `#module-09-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Stellar Size and Mass (act_09_hr_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 09.6 — Dwarfs, Giants and Supergiants (`09-06`)

- **Storyboard ID**: `sb-m09-09-06`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION` — *Stellar radii span 0.008 R_sun (White Dwarf) to >700 R_sun (Betelgeuse); colors calibrated via Planckian locus.*
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `stellar_interior_ro` | `scale_comparison_view` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Dwarfs, Giants and Supergiants within Stars: Colors, Sizes & Temperatures.
  2. Our Sun is called a 'yellow dwarf', but it is actually more luminous and massive than 85% of all the stars in the Milky Way galaxy!
- **Mapped Narration Segments (5)**: `09-09-06-title`, `09-09-06-didYouKnow-1`, `09-09-06-detail-1`, `09-09-06-detail-2`, `09-09-06-detail-3`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m09-09-06-beat-1`**<br>*Dwarfs, Giants and Supergiants — Primary Physical Mechanism* | `09-09-06-title`<br>`09-09-06-didYouKnow-1`<br>`09-09-06-detail-1` | 6. Dwarfs, Giants and Supergiants Our Sun is called a 'yellow dwarf', but it is actually more luminous and massive than 85% of all the stars in the Milky Way galaxy! Red dwarf stars are fully convective from core to surface. They circulate their entire hydroge | `scale_comparison_view` in `stellar_interior_ro`<br>Transition: `comparison_split_transition` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m09-09-06-beat-2`**<br>*Dwarfs, Giants and Supergiants — Quantitative Analysis & Interactive Synthesis* | `09-09-06-detail-2`<br>`09-09-06-detail-3` | Red giants experience a 'helium flash' when core temperature reaches 100 million Kelvin, igniting helium fusion into carbon via the triple-alpha process. Supergiants fuse elements rapidly: hydrogen lasts millions of years, helium lasts hundreds of thousands of | `scientific_cross_section` in `stellar_interior_ro`<br>Transition: `smooth_orbital_travel` | Labels: `Dwarfs, Giants and Supergiants Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m09-6-param` (Dwarfs, Giants and Supergiants Parameter Explorer — selector `#module-09-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Dwarfs, Giants and Supergiants (act_09_hr_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 09.7 — Introduction to the Hertzsprung–Russell Diagram (`09-07`)

- **Storyboard ID**: `sb-m09-09-07`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION` — *Stellar radii span 0.008 R_sun (White Dwarf) to >700 R_sun (Betelgeuse); colors calibrated via Planckian locus.*
- **Interactivity Mode**: `REQUIRED_LEARNING_ACTIVITY`
- **Coordinate Frame & Camera Preset**: `stellar_interior_ro` | `scale_comparison_view` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Introduction to the Hertzsprung–Russell Diagram within Stars: Colors, Sizes & Temperatures.
  2. The H-R diagram is so fundamental that astronomers call it the 'Rosetta Stone of Stellar Astrophysics'—from just a star's position on this g
- **Mapped Narration Segments (5)**: `09-09-07-title`, `09-09-07-didYouKnow-1`, `09-09-07-detail-1`, `09-09-07-detail-2`, `09-09-07-detail-3`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m09-09-07-beat-1`**<br>*Introduction to the Hertzsprung–Russell Diagram — Primary Physical Mechanism* | `09-09-07-title`<br>`09-09-07-didYouKnow-1`<br>`09-09-07-detail-1` | 7. Introduction to the Hertzsprung–Russell Diagram The H-R diagram is so fundamental that astronomers call it the 'Rosetta Stone of Stellar Astrophysics'—from just a star's position on this graph, you can estimate its mass, radius, temperature, age, and future | `scale_comparison_view` in `stellar_interior_ro`<br>Transition: `comparison_split_transition` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m09-09-07-beat-2`**<br>*Introduction to the Hertzsprung–Russell Diagram — Quantitative Analysis & Interactive Synthesis* | `09-09-07-detail-2`<br>`09-09-07-detail-3` | Lines of constant stellar radius slope downward from upper-left to lower-right (R = constant). As stars evolve, they migrate across the H-R diagram along evolutionary tracks: when the Sun exhausts core hydrogen, it will move up and to the right into the red gi | `data_visualization_view` in `stellar_interior_ro`<br>Transition: `observational_data_reveal` | Labels: `Introduction to the Hertzsprung–Russell Diagram Telemetry`<br>Gate: `REQUIRED_LEARNING_ACTIVITY` (Requires `act_09_hr_diagram_lab`) |

- **Interactive Controls**: `ctrl-m09-7-param` (Introduction to the Hertzsprung–Russell Diagram Parameter Explorer — selector `#module-09-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Introduction to the Hertzsprung–Russell Diagram (act_09_hr_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---
