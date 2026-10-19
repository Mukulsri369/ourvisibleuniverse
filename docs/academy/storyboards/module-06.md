# Module 06 Cinematic Storyboard — Explore the Solar System

- **Module ID**: `06` (`stageId: "stage-2-cosmic-neighborhood"`, Course: `"cosmic-journey"`)
- **Total Instructional Chapters (Sublessons)**: **8**
- **Total Mapped Narration Segments**: **34** (`explorer` canonical sequence; adapted across `junior`, `explorer`, `astronomer`)
- **Primary 3D Scene & Component**: `m06_solar_system_orrery_3d` (`src/components/academy/SolarSystemExplorer3D.tsx`)
- **Visual Style & Lighting Preset**: `stage2_planetary_albedo` | `solar_directional_5772K` (`ACES Filmic`, `exposure: 1.05`, `bloomThreshold: 0.80`)
- **Primary Interactive Activity Gate**: `act_06_solar_system_tour` — *Planetary Architecture Explorer* (Compare planetary densities, compositions, and orbital radii from Sun to Neptune.)
- **Scientific References**: Planetary Fact Sheets (NASA - https://nssdc.gsfc.nasa.gov/planetary/planetfact.html)

---

## Chapter 06.1 — How the Solar System Formed (`sub-01`)

- **Storyboard ID**: `sb-m06-sub-01`
- **Scientific Representation**: `SCALE_ADJUSTED_EDUCATIONAL_MODEL` — *Planetary radii exaggerated relative to AU orbital semi-major axes in overview mode; exact relative radii in comparative lineup.*
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `heliocentric_au` | `planetary_orbital_shot` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of How the Solar System Formed within Explore the Solar System.
  2. A shockwave from a nearby dying supernova star likely triggered the gravitational collapse of our ancestral solar nebula.
- **Mapped Narration Segments (4)**: `06-sub-01-title`, `06-sub-01-didYouKnow-1`, `06-sub-01-detail-1`, `06-sub-01-detail-2`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m06-sub-01-beat-1`**<br>*How the Solar System Formed — Primary Physical Mechanism* | `06-sub-01-title`<br>`06-sub-01-didYouKnow-1` | 1. How the Solar System Formed A shockwave from a nearby dying supernova star likely triggered the gravitational collapse of our ancestral solar nebula. | `planetary_orbital_shot` in `heliocentric_au`<br>Transition: `object_to_object_slew` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m06-sub-01-beat-2`**<br>*How the Solar System Formed — Quantitative Analysis & Interactive Synthesis* | `06-sub-01-detail-1`<br>`06-sub-01-detail-2` | Inside the frost line (closer than 2.7 AU), thermal radiation prevented volatile compounds (water, ammonia, methane) from condensing into ices. Only refractory metals (iron, nickel) and silicate minerals survived, limiting terrestrial planets to smaller masses | `planetary_orbital_shot` in `heliocentric_au`<br>Transition: `smooth_orbital_travel` | Labels: `How the Solar System Formed Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m06-1-param` (How the Solar System Formed Parameter Explorer — selector `#module-06-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for How the Solar System Formed (act_06_density_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 06.2 — The Four Rocky Planets (`sub-02`)

- **Storyboard ID**: `sb-m06-sub-02`
- **Scientific Representation**: `SCALE_ADJUSTED_EDUCATIONAL_MODEL` — *Planetary radii exaggerated relative to AU orbital semi-major axes in overview mode; exact relative radii in comparative lineup.*
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `heliocentric_au` | `planetary_orbital_shot` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of The Four Rocky Planets within Explore the Solar System.
  2. Valles Marineris on Mars is a canyon system over 4,000 km long and 7 km deep — four times deeper and ten times longer than the Grand Canyon!
- **Mapped Narration Segments (5)**: `06-sub-02-title`, `06-sub-02-didYouKnow-1`, `06-sub-02-detail-1`, `06-sub-02-detail-2`, `06-sub-02-detail-3`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m06-sub-02-beat-1`**<br>*The Four Rocky Planets — Primary Physical Mechanism* | `06-sub-02-title`<br>`06-sub-02-didYouKnow-1`<br>`06-sub-02-detail-1` | 2. The Four Rocky Planets Valles Marineris on Mars is a canyon system over 4,000 km long and 7 km deep — four times deeper and ten times longer than the Grand Canyon! Mercury's core occupies about 85% of its radius, indicating a violent giant impact in the ear | `planetary_orbital_shot` in `heliocentric_au`<br>Transition: `object_to_object_slew` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m06-sub-02-beat-2`**<br>*The Four Rocky Planets — Quantitative Analysis & Interactive Synthesis* | `06-sub-02-detail-2`<br>`06-sub-02-detail-3` | Earth's liquid iron-nickel outer core drives a convective geodynamo, producing a strong magnetosphere that deflects solar wind particles. Mars lost its global magnetic field as its smaller core cooled, allowing solar wind ions to strip away most of its atmosph | `scientific_cross_section` in `heliocentric_au`<br>Transition: `smooth_orbital_travel` | Labels: `The Four Rocky Planets Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m06-2-param` (The Four Rocky Planets Parameter Explorer — selector `#module-06-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for The Four Rocky Planets (act_06_density_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 06.3 — Jupiter and Saturn: The Gas Giants (`sub-03`)

- **Storyboard ID**: `sb-m06-sub-03`
- **Scientific Representation**: `SCALE_ADJUSTED_EDUCATIONAL_MODEL` — *Planetary radii exaggerated relative to AU orbital semi-major axes in overview mode; exact relative radii in comparative lineup.*
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `heliocentric_au` | `planetary_orbital_shot` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Jupiter and Saturn: The Gas Giants within Explore the Solar System.
  2. The Great Red Spot is shrinking: it was once three times the diameter of Earth in the 19th century, but is now about 1.3 Earth diameters wid
- **Mapped Narration Segments (5)**: `06-sub-03-title`, `06-sub-03-didYouKnow-1`, `06-sub-03-detail-1`, `06-sub-03-detail-2`, `06-sub-03-detail-3`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m06-sub-03-beat-1`**<br>*Jupiter and Saturn: The Gas Giants — Primary Physical Mechanism* | `06-sub-03-title`<br>`06-sub-03-didYouKnow-1`<br>`06-sub-03-detail-1` | 3. Jupiter and Saturn: The Gas Giants The Great Red Spot is shrinking: it was once three times the diameter of Earth in the 19th century, but is now about 1.3 Earth diameters wide. Jupiter's intense magnetic field is 20,000 times stronger than Earth's, generat | `planetary_orbital_shot` in `heliocentric_au`<br>Transition: `object_to_object_slew` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m06-sub-03-beat-2`**<br>*Jupiter and Saturn: The Gas Giants — Quantitative Analysis & Interactive Synthesis* | `06-sub-03-detail-2`<br>`06-sub-03-detail-3` | Saturn's north polar hexagon is a persistent six-sided jet stream storm with winds blowing at 320 km/h, large enough to fit four Earths inside. Helium rain: Within Saturn's cooler interior, helium condenses into immiscible droplets that rain downward through l | `planetary_orbital_shot` in `heliocentric_au`<br>Transition: `smooth_orbital_travel` | Labels: `Jupiter and Saturn: The Gas Giants Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m06-3-param` (Jupiter and Saturn: The Gas Giants Parameter Explorer — selector `#module-06-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Jupiter and Saturn: The Gas Giants (act_06_density_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 06.4 — Uranus and Neptune: The Ice Giants (`sub-04`)

- **Storyboard ID**: `sb-m06-sub-04`
- **Scientific Representation**: `SCALE_ADJUSTED_EDUCATIONAL_MODEL` — *Planetary radii exaggerated relative to AU orbital semi-major axes in overview mode; exact relative radii in comparative lineup.*
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `heliocentric_au` | `planetary_orbital_shot` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Uranus and Neptune: The Ice Giants within Explore the Solar System.
  2. Neptune was discovered through mathematics! Astronomers noticed Uranus was being pulled slightly off-course and calculated exactly where Nep
- **Mapped Narration Segments (4)**: `06-sub-04-title`, `06-sub-04-didYouKnow-1`, `06-sub-04-detail-1`, `06-sub-04-detail-2`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m06-sub-04-beat-1`**<br>*Uranus and Neptune: The Ice Giants — Primary Physical Mechanism* | `06-sub-04-title`<br>`06-sub-04-didYouKnow-1` | 4. Uranus and Neptune: The Ice Giants Neptune was discovered through mathematics! Astronomers noticed Uranus was being pulled slightly off-course and calculated exactly where Neptune had to be. | `planetary_orbital_shot` in `heliocentric_au`<br>Transition: `object_to_object_slew` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m06-sub-04-beat-2`**<br>*Uranus and Neptune: The Ice Giants — Quantitative Analysis & Interactive Synthesis* | `06-sub-04-detail-1`<br>`06-sub-04-detail-2` | Uranus' 97.8° axial tilt was likely caused by a massive collision with an Earth-sized protoplanet during the late accretion era. Neptune radiates 2.6 times more internal heat than it receives from sunlight, powering violent atmospheric dynamics like the Great  | `scientific_cross_section` in `heliocentric_au`<br>Transition: `smooth_orbital_travel` | Labels: `Uranus and Neptune: The Ice Giants Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m06-4-param` (Uranus and Neptune: The Ice Giants Parameter Explorer — selector `#module-06-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Uranus and Neptune: The Ice Giants (act_06_density_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 06.5 — Dwarf Planets & Beyond (`sub-05`)

- **Storyboard ID**: `sb-m06-sub-05`
- **Scientific Representation**: `SCALE_ADJUSTED_EDUCATIONAL_MODEL` — *Planetary radii exaggerated relative to AU orbital semi-major axes in overview mode; exact relative radii in comparative lineup.*
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `heliocentric_au` | `planetary_orbital_shot` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Dwarf Planets & Beyond within Explore the Solar System.
  2. Eris is 27% more massive than Pluto, which was the decisive factor that prompted the International Astronomical Union to reclassify Pluto in
- **Mapped Narration Segments (4)**: `06-sub-05-title`, `06-sub-05-didYouKnow-1`, `06-sub-05-detail-1`, `06-sub-05-detail-2`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m06-sub-05-beat-1`**<br>*Dwarf Planets & Beyond — Primary Physical Mechanism* | `06-sub-05-title`<br>`06-sub-05-didYouKnow-1` | 5. Dwarf Planets & Beyond Eris is 27% more massive than Pluto, which was the decisive factor that prompted the International Astronomical Union to reclassify Pluto in 2006. | `planetary_orbital_shot` in `heliocentric_au`<br>Transition: `object_to_object_slew` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m06-sub-05-beat-2`**<br>*Dwarf Planets & Beyond — Quantitative Analysis & Interactive Synthesis* | `06-sub-05-detail-1`<br>`06-sub-05-detail-2` | Ceres has bright spots in Occator Crater composed of sodium carbonate salts left behind by evaporated subsurface brines. Haumea spins so fast (one rotation every 3.9 hours) that centrifugal force has stretched it into an elongated triaxial ellipsoid like an Am | `planetary_orbital_shot` in `heliocentric_au`<br>Transition: `smooth_orbital_travel` | Labels: `Dwarf Planets & Beyond Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m06-5-param` (Dwarf Planets & Beyond Parameter Explorer — selector `#module-06-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Dwarf Planets & Beyond (act_06_density_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 06.6 — Asteroids, Comets and Meteoroids (`sub-06`)

- **Storyboard ID**: `sb-m06-sub-06`
- **Scientific Representation**: `SCALE_ADJUSTED_EDUCATIONAL_MODEL` — *Planetary radii exaggerated relative to AU orbital semi-major axes in overview mode; exact relative radii in comparative lineup.*
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `heliocentric_au` | `planetary_orbital_shot` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Asteroids, Comets and Meteoroids within Explore the Solar System.
  2. Asteroid 16 Psyche is believed to be the exposed metallic iron-nickel core of a shattered protoplanet, containing metals worth trillions of 
- **Mapped Narration Segments (4)**: `06-sub-06-title`, `06-sub-06-didYouKnow-1`, `06-sub-06-detail-1`, `06-sub-06-detail-2`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m06-sub-06-beat-1`**<br>*Asteroids, Comets and Meteoroids — Primary Physical Mechanism* | `06-sub-06-title`<br>`06-sub-06-didYouKnow-1` | 6. Asteroids, Comets and Meteoroids Asteroid 16 Psyche is believed to be the exposed metallic iron-nickel core of a shattered protoplanet, containing metals worth trillions of dollars. | `planetary_orbital_shot` in `heliocentric_au`<br>Transition: `object_to_object_slew` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m06-sub-06-beat-2`**<br>*Asteroids, Comets and Meteoroids — Quantitative Analysis & Interactive Synthesis* | `06-sub-06-detail-1`<br>`06-sub-06-detail-2` | NASA's DART mission in 2022 successfully altered the orbit of asteroid Dimorphos by kinetic impact, proving planetary defense capabilities. Cometary sublimating gases release volatile organic compounds and amino acid precursors, suggesting comets delivered wat | `scientific_cross_section` in `heliocentric_au`<br>Transition: `smooth_orbital_travel` | Labels: `Asteroids, Comets and Meteoroids Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m06-6-param` (Asteroids, Comets and Meteoroids Parameter Explorer — selector `#module-06-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Asteroids, Comets and Meteoroids (act_06_density_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 06.7 — Planetary Moons and Rings (`sub-07`)

- **Storyboard ID**: `sb-m06-sub-07`
- **Scientific Representation**: `SCALE_ADJUSTED_EDUCATIONAL_MODEL` — *Planetary radii exaggerated relative to AU orbital semi-major axes in overview mode; exact relative radii in comparative lineup.*
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `heliocentric_au` | `planetary_orbital_shot` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Planetary Moons and Rings within Explore the Solar System.
  2. Titan has a dense nitrogen atmosphere with 1.5 times Earth's surface pressure, and gravity so low you could strap on wings and fly like a bi
- **Mapped Narration Segments (4)**: `06-sub-07-title`, `06-sub-07-didYouKnow-1`, `06-sub-07-detail-1`, `06-sub-07-detail-2`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m06-sub-07-beat-1`**<br>*Planetary Moons and Rings — Primary Physical Mechanism* | `06-sub-07-title`<br>`06-sub-07-didYouKnow-1` | 7. Planetary Moons and Rings Titan has a dense nitrogen atmosphere with 1.5 times Earth's surface pressure, and gravity so low you could strap on wings and fly like a bird! | `planetary_orbital_shot` in `heliocentric_au`<br>Transition: `object_to_object_slew` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m06-sub-07-beat-2`**<br>*Planetary Moons and Rings — Quantitative Analysis & Interactive Synthesis* | `06-sub-07-detail-1`<br>`06-sub-07-detail-2` | Saturn's moon Enceladus feeds Saturn's diffuse E-ring with water ice ejected from its south polar 'tiger stripe' fractures. Neptune's moon Triton orbits backwards (retrograde) and is slowly spiraling inward; in ~3.6 billion years it will cross Neptune's Roche  | `planetary_orbital_shot` in `heliocentric_au`<br>Transition: `smooth_orbital_travel` | Labels: `Planetary Moons and Rings Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m06-7-param` (Planetary Moons and Rings Parameter Explorer — selector `#module-06-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Planetary Moons and Rings (act_06_density_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 06.8 — Comparing Planetary Environments (`sub-08`)

- **Storyboard ID**: `sb-m06-sub-08`
- **Scientific Representation**: `SCALE_ADJUSTED_EDUCATIONAL_MODEL` — *Planetary radii exaggerated relative to AU orbital semi-major axes in overview mode; exact relative radii in comparative lineup.*
- **Interactivity Mode**: `REQUIRED_LEARNING_ACTIVITY`
- **Coordinate Frame & Camera Preset**: `heliocentric_au` | `planetary_orbital_shot` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Comparing Planetary Environments within Explore the Solar System.
  2. Despite being 17 times more massive than Earth, Neptune's gravity at its cloud tops is only 14% higher than Earth's because its radius is fo
- **Mapped Narration Segments (4)**: `06-sub-08-title`, `06-sub-08-didYouKnow-1`, `06-sub-08-detail-1`, `06-sub-08-detail-2`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m06-sub-08-beat-1`**<br>*Comparing Planetary Environments — Primary Physical Mechanism* | `06-sub-08-title`<br>`06-sub-08-didYouKnow-1` | 8. Comparing Planetary Environments Despite being 17 times more massive than Earth, Neptune's gravity at its cloud tops is only 14% higher than Earth's because its radius is four times larger. | `planetary_orbital_shot` in `heliocentric_au`<br>Transition: `object_to_object_slew` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m06-sub-08-beat-2`**<br>*Comparing Planetary Environments — Quantitative Analysis & Interactive Synthesis* | `06-sub-08-detail-1`<br>`06-sub-08-detail-2` | Mercury's lack of atmosphere means daytime temperatures reach +430°C while nighttime plunges to -180°C — a 610°C daily swing! The Circumstellar Habitable Zone is defined by the range of distances where an Earth-mass planet with an active carbonate-silicate cyc | `data_visualization_view` in `heliocentric_au`<br>Transition: `observational_data_reveal` | Labels: `Comparing Planetary Environments Telemetry`<br>Gate: `REQUIRED_LEARNING_ACTIVITY` (Requires `act_06_solar_system_tour`) |

- **Interactive Controls**: `ctrl-m06-8-param` (Comparing Planetary Environments Parameter Explorer — selector `#module-06-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Comparing Planetary Environments (act_06_density_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Stage 2 — Implemented 3D Chapter Scenes (`Module06ChapterScenes.tsx`)

| Chapter Code | Lesson ID | 3D Scene Component ID | Primary Scientific Equations & Telemetry | Activity Adapter Bridge |
| :--- | :--- | :--- | :--- | :--- |
| **06.1** | `sub-01` | `m06_ch1_solar_system_formation` | $L = I\omega = \text{const}$, $r_{\text{frost}} \approx 2.7\text{ AU}$ ($T_{\text{cond}}(\text{H}_2\text{O}) \approx 170\text{ K}$) | — |
| **06.2** | `sub-02` | `m06_ch2_terrestrial_planets` | $\rho = 3.93\text{–}5.51\text{ g/cm}^3$, $T_s = T_{\text{eq}}(1 + \frac{3}{4}\tau_{\text{IR}})^{1/4}$ (Venus $737\text{ K}$) | `act_06_density_table` (`classify_density_architecture`) |
| **06.3** | `sub-03` | `m06_ch3_gas_giants` | $P_{\text{H-metal}} \ge 1.4\text{ Mbar}$, $\rho_{\text{Saturn}} = 0.687\text{ g/cm}^3 < \rho_{\text{H}_2\text{O}}$ | `act_06_solar_system_tour` (`inspect_planetary_regimes`) |
| **06.4** | `sub-04` | `m06_ch4_ice_giants` | $\varepsilon_{\text{Uranus}} = 97.77^\circ$, $v_{\text{wind,Neptune}} \approx 2100\text{ km/h}$, superionic $\text{H}_2\text{O–NH}_3\text{–CH}_4$ | `act_06_solar_system_tour` (`inspect_planetary_regimes`) |
| **06.5** | `sub-05` | `m06_ch5_dwarf_planets` | $\Lambda = \frac{M^2}{m_{\text{belt}}a^{3/2}} < 1$, $2:3$ Neptune–Pluto mean-motion resonance | — |
| **06.6** | `sub-06` | `m06_ch6_asteroids_comets` | Kirkwood gaps ($3:1, 5:2, 2:1$), $\hat{\mathbf{r}}_{\text{ion}} = +\hat{\mathbf{r}}_\odot$, DART $\Delta P = -33.0\text{ min}$ | — |
| **06.7** | `sub-07` | `m06_ch7_moons_and_rings` | $d_{\text{Roche}} \approx 2.44 R_p(\rho_p/\rho_m)^{1/3}$, Laplace resonance $\omega_{\text{Io}} - 3\omega_{\text{Eu}} + 2\omega_{\text{Ga}} = 0$ | — |
| **06.8** | `sub-08` | `m06_ch8_planetary_comparison` | $g = GM/R^2$, $v_{\text{esc}} = \sqrt{2GM/R}$, $r_{\text{HZ}} = \sqrt{L_\star/S_{\text{eff}}}$ | `act_06_solar_system_tour` (`complete_experiment`) |
