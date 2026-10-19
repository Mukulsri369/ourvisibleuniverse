# Module 07 Cinematic Storyboard — The Sun: Our Star

- **Module ID**: `07` (`stageId: "stage-2-cosmic-neighborhood"`, Course: `"cosmic-journey"`)
- **Total Instructional Chapters (Sublessons)**: **7**
- **Total Mapped Narration Segments**: **35** (`explorer` canonical sequence; adapted across `junior`, `explorer`, `astronomer`)
- **Primary 3D Scene & Component**: `m07_solar_interior_dynamo_3d` (`src/components/academy/SunSimulator3D.tsx`)
- **Visual Style & Lighting Preset**: `stage2_planetary_albedo` | `stellar_point_blackbody` (`ACES Filmic`, `exposure: 1.05`, `bloomThreshold: 0.80`)
- **Primary Interactive Activity Gate**: `act_07_sun_simulator` — *Solar Thermonuclear & Magnetic Simulator* (Simulate solar core temperature gradient and magnetic coronal loop eruption.)
- **Scientific References**: NASA Solar Dynamics Observatory (SDO) (NASA - https://sdo.gsfc.nasa.gov/)

---

## Chapter 07.1 — The Sun is a Star (`sub-01`)

- **Storyboard ID**: `sb-m07-sub-01`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION`
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `stellar_interior_ro` | `scientific_cross_section` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of The Sun is a Star within The Sun: Our Star.
  2. The Sun loses about 4.3 million metric tons of mass every single second as pure radiation energy, yet has lost less than 0.05% of its total 
- **Mapped Narration Segments (5)**: `07-sub-01-title`, `07-sub-01-didYouKnow-1`, `07-sub-01-detail-1`, `07-sub-01-detail-2`, `07-sub-01-detail-3`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m07-sub-01-beat-1`**<br>*The Sun is a Star — Primary Physical Mechanism* | `07-sub-01-title`<br>`07-sub-01-didYouKnow-1`<br>`07-sub-01-detail-1` | 1. The Sun is a Star The Sun loses about 4.3 million metric tons of mass every single second as pure radiation energy, yet has lost less than 0.05% of its total mass over its entire 4.6 billion-year life! Because the Sun is composed entirely of ionized plasma, | `scientific_cross_section` in `stellar_interior_ro`<br>Transition: `scientific_cross_section_peel` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m07-sub-01-beat-2`**<br>*The Sun is a Star — Quantitative Analysis & Interactive Synthesis* | `07-sub-01-detail-2`<br>`07-sub-01-detail-3` | The solar constant is approximately 1,361 Watts per square meter at 1 Astronomical Unit (Earth's average distance). Helioseismology uses acoustic sound waves trapped inside the Sun to probe its internal density and temperature profiles, similar to seismic wave | `planetary_orbital_shot` in `stellar_interior_ro`<br>Transition: `smooth_orbital_travel` | Labels: `The Sun is a Star Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m07-1-param` (The Sun is a Star Parameter Explorer — selector `#module-07-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for The Sun is a Star (act_07_solar_layers).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 07.2 — Internal Structure of the Sun (`sub-02`)

- **Storyboard ID**: `sb-m07-sub-02`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION`
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `stellar_interior_ro` | `scientific_cross_section` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Internal Structure of the Sun within The Sun: Our Star.
  2. The tachocline is only a few percent of the solar radius thick, yet it acts as the primary dynamo engine that creates the Sun's magnetic cyc
- **Mapped Narration Segments (5)**: `07-sub-02-title`, `07-sub-02-didYouKnow-1`, `07-sub-02-detail-1`, `07-sub-02-detail-2`, `07-sub-02-detail-3`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m07-sub-02-beat-1`**<br>*Internal Structure of the Sun — Primary Physical Mechanism* | `07-sub-02-title`<br>`07-sub-02-didYouKnow-1`<br>`07-sub-02-detail-1` | 2. Internal Structure of the Sun The tachocline is only a few percent of the solar radius thick, yet it acts as the primary dynamo engine that creates the Sun's magnetic cycles and solar flares! Core density is roughly 150 times that of liquid water (150 g/cm³ | `scientific_cross_section` in `stellar_interior_ro`<br>Transition: `scientific_cross_section_peel` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m07-sub-02-beat-2`**<br>*Internal Structure of the Sun — Quantitative Analysis & Interactive Synthesis* | `07-sub-02-detail-2`<br>`07-sub-02-detail-3` | At the base of the convective zone, temperatures are ~2 million K; by the top of the photosphere, temperature has cooled to ~5,772 K. Granulation cells carry hot upwellings at velocities of 1 to 2 km/s, lasting about 8 to 20 minutes before dissolving. | `scientific_cross_section` in `stellar_interior_ro`<br>Transition: `smooth_orbital_travel` | Labels: `Internal Structure of the Sun Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m07-2-param` (Internal Structure of the Sun Parameter Explorer — selector `#module-07-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Internal Structure of the Sun (act_07_solar_layers).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 07.3 — Nuclear Fusion (`sub-03`)

- **Storyboard ID**: `sb-m07-sub-03`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION`
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `stellar_interior_ro` | `scientific_cross_section` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Nuclear Fusion within The Sun: Our Star.
  2. Because the first weak-force step (p + p → ²H) is extremely rare, an average individual proton in the solar core wanders for roughly 9 billi
- **Mapped Narration Segments (5)**: `07-sub-03-title`, `07-sub-03-didYouKnow-1`, `07-sub-03-detail-1`, `07-sub-03-detail-2`, `07-sub-03-detail-3`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m07-sub-03-beat-1`**<br>*Nuclear Fusion — Primary Physical Mechanism* | `07-sub-03-title`<br>`07-sub-03-didYouKnow-1`<br>`07-sub-03-detail-1` | 3. Nuclear Fusion Because the first weak-force step (p + p → ²H) is extremely rare, an average individual proton in the solar core wanders for roughly 9 billion years before successfully fusing! Total net reaction: 4 ¹H → ⁴He + 2 e⁺ + 2 ν_e + 2 γ, releasing a  | `scientific_cross_section` in `stellar_interior_ro`<br>Transition: `scientific_cross_section_peel` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m07-sub-03-beat-2`**<br>*Nuclear Fusion — Quantitative Analysis & Interactive Synthesis* | `07-sub-03-detail-2`<br>`07-sub-03-detail-3` | The mass of one ⁴He nucleus is 0.71% less than the combined rest mass of four free protons (mass defect Δm). Positrons immediately annihilate with ambient electrons (e⁺ + e⁻ → 2γ), producing two 511 keV gamma rays. | `planetary_orbital_shot` in `stellar_interior_ro`<br>Transition: `smooth_orbital_travel` | Labels: `Nuclear Fusion Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m07-3-param` (Nuclear Fusion Parameter Explorer — selector `#module-07-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Nuclear Fusion (act_07_solar_layers).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 07.4 — Photosphere, Chromosphere and Corona (`sub-04`)

- **Storyboard ID**: `sb-m07-sub-04`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION`
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `stellar_interior_ro` | `scientific_cross_section` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Photosphere, Chromosphere and Corona within The Sun: Our Star.
  2. During the 1869 total solar eclipse, astronomers discovered a green emission line (530.3 nm) in the corona and thought they found a new elem
- **Mapped Narration Segments (5)**: `07-sub-04-title`, `07-sub-04-didYouKnow-1`, `07-sub-04-detail-1`, `07-sub-04-detail-2`, `07-sub-04-detail-3`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m07-sub-04-beat-1`**<br>*Photosphere, Chromosphere and Corona — Primary Physical Mechanism* | `07-sub-04-title`<br>`07-sub-04-didYouKnow-1`<br>`07-sub-04-detail-1` | 4. Photosphere, Chromosphere and Corona During the 1869 total solar eclipse, astronomers discovered a green emission line (530.3 nm) in the corona and thought they found a new element called 'Coronium'. In 1939, it was proven to be Fe XIV—iron stripped of 13 e | `scientific_cross_section` in `stellar_interior_ro`<br>Transition: `scientific_cross_section_peel` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m07-sub-04-beat-2`**<br>*Photosphere, Chromosphere and Corona — Quantitative Analysis & Interactive Synthesis* | `07-sub-04-detail-2`<br>`07-sub-04-detail-3` | Coronal loops outline closed magnetic field lines emerging from active bipolar sunspot regions, trapping multi-million-degree plasma. Coronal holes are regions where magnetic field lines open directly into interplanetary space, allowing plasma to freely escape | `scientific_cross_section` in `stellar_interior_ro`<br>Transition: `smooth_orbital_travel` | Labels: `Photosphere, Chromosphere and Corona Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m07-4-param` (Photosphere, Chromosphere and Corona Parameter Explorer — selector `#module-07-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Photosphere, Chromosphere and Corona (act_07_solar_layers).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 07.5 — Sunspots and Magnetic Activity (`sub-05`)

- **Storyboard ID**: `sb-m07-sub-05`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION`
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `stellar_interior_ro` | `scientific_cross_section` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Sunspots and Magnetic Activity within The Sun: Our Star.
  2. Galileo Galilei's observations of sunspots in 1610 provided direct visual proof that the heavens were not immaculate, unblemished crystallin
- **Mapped Narration Segments (5)**: `07-sub-05-title`, `07-sub-05-didYouKnow-1`, `07-sub-05-detail-1`, `07-sub-05-detail-2`, `07-sub-05-detail-3`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m07-sub-05-beat-1`**<br>*Sunspots and Magnetic Activity — Primary Physical Mechanism* | `07-sub-05-title`<br>`07-sub-05-didYouKnow-1`<br>`07-sub-05-detail-1` | 5. Sunspots and Magnetic Activity Galileo Galilei's observations of sunspots in 1610 provided direct visual proof that the heavens were not immaculate, unblemished crystalline spheres, and proved that the Sun rotated on an axis! Magnetic fields inside sunspot  | `scientific_cross_section` in `stellar_interior_ro`<br>Transition: `scientific_cross_section_peel` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m07-sub-05-beat-2`**<br>*Sunspots and Magnetic Activity — Quantitative Analysis & Interactive Synthesis* | `07-sub-05-detail-2`<br>`07-sub-05-detail-3` | The strong vertical magnetic field suppresses convective upwelling of hot plasma, causing the local region to cool by ~1,500 K. The Solar Cycle is currently in Cycle 25, which began in December 2019 and is reaching its solar maximum. | `planetary_orbital_shot` in `stellar_interior_ro`<br>Transition: `smooth_orbital_travel` | Labels: `Sunspots and Magnetic Activity Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m07-5-param` (Sunspots and Magnetic Activity Parameter Explorer — selector `#module-07-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Sunspots and Magnetic Activity (act_07_solar_layers).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 07.6 — Solar Flares and Coronal Mass Ejections (`sub-06`)

- **Storyboard ID**: `sb-m07-sub-06`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION`
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `stellar_interior_ro` | `scientific_cross_section` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Solar Flares and Coronal Mass Ejections within The Sun: Our Star.
  2. In November 2003, during the 'Halloween Storms', an X-class flare was estimated at X28 to X45—so intense it completely saturated the sensors
- **Mapped Narration Segments (5)**: `07-sub-06-title`, `07-sub-06-didYouKnow-1`, `07-sub-06-detail-1`, `07-sub-06-detail-2`, `07-sub-06-detail-3`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m07-sub-06-beat-1`**<br>*Solar Flares and Coronal Mass Ejections — Primary Physical Mechanism* | `07-sub-06-title`<br>`07-sub-06-didYouKnow-1`<br>`07-sub-06-detail-1` | 6. Solar Flares and Coronal Mass Ejections In November 2003, during the 'Halloween Storms', an X-class flare was estimated at X28 to X45—so intense it completely saturated the sensors on the GOES satellite! Solar flare classification uses peak soft X-ray flux  | `scientific_cross_section` in `stellar_interior_ro`<br>Transition: `scientific_cross_section_peel` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m07-sub-06-beat-2`**<br>*Solar Flares and Coronal Mass Ejections — Quantitative Analysis & Interactive Synthesis* | `07-sub-06-detail-2`<br>`07-sub-06-detail-3` | Solar Energetic Particles (SEPs): Protons accelerated to relativistic velocities (> 0.5 c) in shock fronts arrive at Earth within 20 to 60 minutes. Halo CMEs: When a CME is directed straight at Earth, coronagraphs (like SOHO LASCO) observe an expanding 360-deg | `scientific_cross_section` in `stellar_interior_ro`<br>Transition: `smooth_orbital_travel` | Labels: `Solar Flares and Coronal Mass Ejections Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m07-6-param` (Solar Flares and Coronal Mass Ejections Parameter Explorer — selector `#module-07-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Solar Flares and Coronal Mass Ejections (act_07_solar_layers).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 07.7 — Solar Wind, Auroras and Space Weather (`sub-07`)

- **Storyboard ID**: `sb-m07-sub-07`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION`
- **Interactivity Mode**: `REQUIRED_LEARNING_ACTIVITY`
- **Coordinate Frame & Camera Preset**: `stellar_interior_ro` | `scientific_cross_section` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Solar Wind, Auroras and Space Weather within The Sun: Our Star.
  2. In February 2022, a minor geomagnetic storm expanded Earth's thermosphere by 50%, increasing atmospheric drag and destroying 38 newly launch
- **Mapped Narration Segments (5)**: `07-sub-07-title`, `07-sub-07-didYouKnow-1`, `07-sub-07-detail-1`, `07-sub-07-detail-2`, `07-sub-07-detail-3`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m07-sub-07-beat-1`**<br>*Solar Wind, Auroras and Space Weather — Primary Physical Mechanism* | `07-sub-07-title`<br>`07-sub-07-didYouKnow-1`<br>`07-sub-07-detail-1` | 7. Solar Wind, Auroras and Space Weather In February 2022, a minor geomagnetic storm expanded Earth's thermosphere by 50%, increasing atmospheric drag and destroying 38 newly launched Starlink satellites before they could reach operational orbit! Geomagnetical | `scientific_cross_section` in `stellar_interior_ro`<br>Transition: `scientific_cross_section_peel` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m07-sub-07-beat-2`**<br>*Solar Wind, Auroras and Space Weather — Quantitative Analysis & Interactive Synthesis* | `07-sub-07-detail-2`<br>`07-sub-07-detail-3` | In March 1989, a severe G5 geomagnetic storm collapsed the Hydro-Québec power grid in Canada within 90 seconds, leaving 6 million people without electricity for 9 hours. Atmospheric Drag: Geomagnetic storms heat and expand Earth's thermosphere, significantly i | `data_visualization_view` in `stellar_interior_ro`<br>Transition: `observational_data_reveal` | Labels: `Solar Wind, Auroras and Space Weather Telemetry`<br>Gate: `REQUIRED_LEARNING_ACTIVITY` (Requires `act_07_sun_simulator`) |

- **Interactive Controls**: `ctrl-m07-7-param` (Solar Wind, Auroras and Space Weather Parameter Explorer — selector `#module-07-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Solar Wind, Auroras and Space Weather (act_07_solar_layers).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Stage 2 — Implemented 3D Chapter Scenes (`Module07ChapterScenes.tsx`)

| Chapter Code | Lesson ID | 3D Scene Component ID | Primary Scientific Equations & Telemetry | Activity Adapter Bridge |
| :--- | :--- | :--- | :--- | :--- |
| **07.1** | `sub-01` | `m07_ch1_solar_core_fusion` | $4\,{}^1\text{H} \rightarrow {}^4\text{He} + 2e^+ + 2\nu_e + 2\gamma + 26.73\text{ MeV}$, $\nabla P = -\rho g$ | `act_07_sun_simulator` (`inspect_solar_core_fusion`) |
| **07.2** | `sub-02` | `m07_ch2_solar_interior_layers` | $N \approx (L/\ell)^2 \Rightarrow \tau_{\text{diff}} \approx 1.7\times 10^5\text{ yr}$, tachocline at $0.71\,R_\odot$ | `act_07_solar_layers` (`interact_parameter`) |
| **07.3** | `sub-03` | `m07_ch3_solar_atmosphere_eclipse` | $T_{\text{phot}} = 5772\text{ K}$, $T_{\text{cor}} \approx 1.5\text{–}3.0\text{ MK}$, $F_A = \rho\langle\delta v^2\rangle v_A$ | — |
| **07.4** | `sub-04` | `m07_ch4_sunspots_granulation_prominences` | $P_{\text{gas,spot}} + \frac{B^2}{2\mu_0} = P_{\text{gas,ext}}$, $\frac{F_{\text{umbra}}}{F_{\text{phot}}} = (3800/5772)^4 \approx 0.19$ | — |
| **07.5** | `sub-05` | `m07_ch5_magnetic_dynamo_cycle` | $\Omega(\theta) = \Omega_{\text{eq}} - B\sin^2\theta - C\sin^4\theta$, $P_{\text{Schwabe}} \approx 11\text{ yr}$, $P_{\text{Hale}} \approx 22\text{ yr}$ | — |
| **07.6** | `sub-06` | `m07_ch6_flares_cmes_heliosphere` | $E_{\text{mag}} = \int\frac{B^2}{2\mu_0}dV$, Parker spiral $r - r_0 = -\frac{v_{\text{sw}}}{\Omega_\odot}(\phi - \phi_0)$ | `act_07_sun_simulator` (`simulate_magnetic_cme_weather`) |
| **07.7** | `sub-07` | `m07_ch7_space_weather_magnetosphere` | $R_{\text{mp}} \propto (\rho_{\text{sw}}v_{\text{sw}}^2)^{-1/6}$, southward IMF $B_z < 0$, $\lambda_{\text{[O I]}} = 557.7\text{ nm} / 630.0\text{ nm}$ | `act_07_sun_simulator` (`complete_experiment`) |
