# Module 04 Cinematic Storyboard — Light, Time & Cosmic Observation

- **Module ID**: `04` (`stageId: "stage-1-discovering-space"`, Course: `"cosmic-journey"`)
- **Total Instructional Chapters (Sublessons)**: **6**
- **Total Mapped Narration Segments**: **34** (`explorer` canonical sequence; adapted across `junior`, `explorer`, `astronomer`)
- **Primary 3D Scene & Component**: `m04_light_time_propagation_3d` (`src/components/academy/LightTravelSimulation3D.tsx`)
- **Visual Style & Lighting Preset**: `stage1_cosmic_horizon` | `stellar_point_blackbody` (`ACES Filmic`, `exposure: 1.05`, `bloomThreshold: 0.80`)
- **Primary Interactive Activity Gate**: `act_04_lookback_time_machine` — *Cosmic Time Machine Simulation* (Trace photon lookback time from the Moon (1.3s) to GN-z11 (13.4 Gyr).)
- **Scientific References**: The Electromagnetic Spectrum (NASA - https://science.nasa.gov/ems/)

---

## Chapter 04.1 — What is light? (`lesson-1-what-is-light`)

- **Storyboard ID**: `sb-m04-lesson-1-what-is-light`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION`
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `heliocentric_au` | `object_following_camera` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of What is light? within Light, Time & Cosmic Observation.
  2. Light requires no medium (unlike sound waves, which need air, water, or rock). It travels freely through the vacuum of space.
- **Mapped Narration Segments (6)**: `04-lesson-1-what-is-light-title`, `04-lesson-1-what-is-light-takeaway-1`, `04-lesson-1-what-is-light-deepDive-1`, `04-lesson-1-what-is-light-deepDive-2`, `04-lesson-1-what-is-light-didYouKnow-1`, `04-lesson-1-what-is-light-mathOrAnalogy-1`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m04-lesson-1-what-is-light-beat-1`**<br>*What is light? — Primary Physical Mechanism* | `04-lesson-1-what-is-light-title`<br>`04-lesson-1-what-is-light-takeaway-1`<br>`04-lesson-1-what-is-light-deepDive-1` | What is light? Light requires no medium (unlike sound waves, which need air, water, or rock). It travels freely through the vacuum of space. In the 1860s, Scottish physicist James Clerk Maxwell proved that light consists of intertwined oscillating electric and | `object_following_camera` in `heliocentric_au`<br>Transition: `observational_data_reveal` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m04-lesson-1-what-is-light-beat-2`**<br>*What is light? — Quantitative Analysis & Interactive Synthesis* | `04-lesson-1-what-is-light-deepDive-2`<br>`04-lesson-1-what-is-light-didYouKnow-1`<br>`04-lesson-1-what-is-light-mathOrAnalogy-1` | An electric field creates a magnetic field, and a changing magnetic field creates an electric field, allowing the wave to propel itself forward through empty vacuum indefinitely until it strikes an atom. Because light carries momentum even though it has no mas | `planetary_orbital_shot` in `heliocentric_au`<br>Transition: `smooth_orbital_travel` | Labels: `What is light? Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m04-1-param` (What is light? Parameter Explorer — selector `#module-04-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for What is light? (act_04_lookback_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 04.2 — How fast does light travel? (`lesson-2-speed-of-light`)

- **Storyboard ID**: `sb-m04-lesson-2-speed-of-light`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION`
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `heliocentric_au` | `object_following_camera` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of How fast does light travel? within Light, Time & Cosmic Observation.
  2. c = 299,792 km/s (roughly 300,000 km/s). Even at this staggering velocity, cosmic distances are so vast that light takes noticeable minutes,
- **Mapped Narration Segments (6)**: `04-lesson-2-speed-of-light-title`, `04-lesson-2-speed-of-light-takeaway-1`, `04-lesson-2-speed-of-light-deepDive-1`, `04-lesson-2-speed-of-light-deepDive-2`, `04-lesson-2-speed-of-light-didYouKnow-1`, `04-lesson-2-speed-of-light-mathOrAnalogy-1`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m04-lesson-2-speed-of-light-beat-1`**<br>*How fast does light travel? — Primary Physical Mechanism* | `04-lesson-2-speed-of-light-title`<br>`04-lesson-2-speed-of-light-takeaway-1`<br>`04-lesson-2-speed-of-light-deepDive-1` | How fast does light travel? c = 299,792 km/s (roughly 300,000 km/s). Even at this staggering velocity, cosmic distances are so vast that light takes noticeable minutes, years, and millennia to travel between worlds. For thousands of years, philosophers believe | `object_following_camera` in `heliocentric_au`<br>Transition: `observational_data_reveal` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m04-lesson-2-speed-of-light-beat-2`**<br>*How fast does light travel? — Quantitative Analysis & Interactive Synthesis* | `04-lesson-2-speed-of-light-deepDive-2`<br>`04-lesson-2-speed-of-light-didYouKnow-1`<br>`04-lesson-2-speed-of-light-mathOrAnalogy-1` | Rømer realized light was not instantaneous—it took extra time to traverse the extra distance across Earth's orbit! Light only travels at 300,000 km/s in a vacuum. Inside glass or water, it slows down significantly (to ~200,000 km/s in glass), which is what cau | `scientific_cross_section` in `heliocentric_au`<br>Transition: `smooth_orbital_travel` | Labels: `How fast does light travel? Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m04-2-param` (How fast does light travel? Parameter Explorer — selector `#module-04-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for How fast does light travel? (act_04_lookback_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 04.3 — Why sunlight takes time to reach Earth (`lesson-3-sunlight-travel-time`)

- **Storyboard ID**: `sb-m04-lesson-3-sunlight-travel-time`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION`
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `heliocentric_au` | `object_following_camera` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Why sunlight takes time to reach Earth within Light, Time & Cosmic Observation.
  2. We never observe our star in real-time. All solar phenomena—coronal mass ejections, sunspots, and flares—are observed with an 8.3-minute lag
- **Mapped Narration Segments (5)**: `04-lesson-3-sunlight-travel-time-title`, `04-lesson-3-sunlight-travel-time-takeaway-1`, `04-lesson-3-sunlight-travel-time-deepDive-1`, `04-lesson-3-sunlight-travel-time-didYouKnow-1`, `04-lesson-3-sunlight-travel-time-mathOrAnalogy-1`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m04-lesson-3-sunlight-travel-time-beat-1`**<br>*Why sunlight takes time to reach Earth — Primary Physical Mechanism* | `04-lesson-3-sunlight-travel-time-title`<br>`04-lesson-3-sunlight-travel-time-takeaway-1`<br>`04-lesson-3-sunlight-travel-time-deepDive-1` | Why sunlight takes time to reach Earth We never observe our star in real-time. All solar phenomena—coronal mass ejections, sunspots, and flares—are observed with an 8.3-minute lag. The delay grows even more dramatic for the outer planets. 5 hours to reach dist | `object_following_camera` in `heliocentric_au`<br>Transition: `observational_data_reveal` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m04-lesson-3-sunlight-travel-time-beat-2`**<br>*Why sunlight takes time to reach Earth — Quantitative Analysis & Interactive Synthesis* | `04-lesson-3-sunlight-travel-time-didYouKnow-1`<br>`04-lesson-3-sunlight-travel-time-mathOrAnalogy-1` | While photons take 8.3 minutes to travel from the Sun's surface to Earth, those same photons took between 10,000 and 100,000 years to slowly bounce and diffuse from the dense fusion core up to the surface! Time = Distance ÷ Speed. For the Moon: 384,400 km ÷ 30 | `planetary_orbital_shot` in `heliocentric_au`<br>Transition: `smooth_orbital_travel` | Labels: `Why sunlight takes time to reach Earth Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m04-3-param` (Why sunlight takes time to reach Earth Parameter Explorer — selector `#module-04-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Why sunlight takes time to reach Earth (act_04_lookback_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 04.4 — Why distant stars show us the past (`lesson-4-distant-stars-show-the-past`)

- **Storyboard ID**: `sb-m04-lesson-4-distant-stars-show-the-past`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION`
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `heliocentric_au` | `object_following_camera` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Why distant stars show us the past within Light, Time & Cosmic Observation.
  2. Astronomy is unique among all scientific disciplines: geologists must dig for fossils in rocks, but astronomers can watch cosmic history hap
- **Mapped Narration Segments (5)**: `04-lesson-4-distant-stars-show-the-past-title`, `04-lesson-4-distant-stars-show-the-past-takeaway-1`, `04-lesson-4-distant-stars-show-the-past-deepDive-1`, `04-lesson-4-distant-stars-show-the-past-didYouKnow-1`, `04-lesson-4-distant-stars-show-the-past-mathOrAnalogy-1`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m04-lesson-4-distant-stars-show-the-past-beat-1`**<br>*Why distant stars show us the past — Primary Physical Mechanism* | `04-lesson-4-distant-stars-show-the-past-title`<br>`04-lesson-4-distant-stars-show-the-past-takeaway-1`<br>`04-lesson-4-distant-stars-show-the-past-deepDive-1` | Why distant stars show us the past Astronomy is unique among all scientific disciplines: geologists must dig for fossils in rocks, but astronomers can watch cosmic history happen live simply by looking farther away. 6 years in the past. Betelgeuse in Orion is  | `object_following_camera` in `heliocentric_au`<br>Transition: `observational_data_reveal` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m04-lesson-4-distant-stars-show-the-past-beat-2`**<br>*Why distant stars show us the past — Quantitative Analysis & Interactive Synthesis* | `04-lesson-4-distant-stars-show-the-past-didYouKnow-1`<br>`04-lesson-4-distant-stars-show-the-past-mathOrAnalogy-1` | Some of the distant stars you see tonight might have already exploded into supernovae and died, but their ghost light is still traveling through space toward us! Lookback Time Table: Moon = 1.3 seconds ago; Sun = 8.3 minutes ago; Proxima Centauri = 4.25 years  | `scientific_cross_section` in `heliocentric_au`<br>Transition: `smooth_orbital_travel` | Labels: `Why distant stars show us the past Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m04-4-param` (Why distant stars show us the past Parameter Explorer — selector `#module-04-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Why distant stars show us the past (act_04_lookback_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 04.5 — Colors, wavelengths and spectra (`lesson-5-colors-wavelengths-spectra`)

- **Storyboard ID**: `sb-m04-lesson-5-colors-wavelengths-spectra`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION`
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `heliocentric_au` | `object_following_camera` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Colors, wavelengths and spectra within Light, Time & Cosmic Observation.
  2. The fundamental wave equation connects light speed to wavelength and frequency: c = λ × f. As wavelength gets shorter, frequency and photon 
- **Mapped Narration Segments (6)**: `04-lesson-5-colors-wavelengths-spectra-title`, `04-lesson-5-colors-wavelengths-spectra-takeaway-1`, `04-lesson-5-colors-wavelengths-spectra-deepDive-1`, `04-lesson-5-colors-wavelengths-spectra-deepDive-2`, `04-lesson-5-colors-wavelengths-spectra-didYouKnow-1`, `04-lesson-5-colors-wavelengths-spectra-mathOrAnalogy-1`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m04-lesson-5-colors-wavelengths-spectra-beat-1`**<br>*Colors, wavelengths and spectra — Primary Physical Mechanism* | `04-lesson-5-colors-wavelengths-spectra-title`<br>`04-lesson-5-colors-wavelengths-spectra-takeaway-1`<br>`04-lesson-5-colors-wavelengths-spectra-deepDive-1` | Colors, wavelengths and spectra The fundamental wave equation connects light speed to wavelength and frequency: c = λ × f. As wavelength gets shorter, frequency and photon energy increase. In 1666, Sir Isaac Newton darkened his room, punched a pinhole in the s | `object_following_camera` in `heliocentric_au`<br>Transition: `observational_data_reveal` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m04-lesson-5-colors-wavelengths-spectra-beat-2`**<br>*Colors, wavelengths and spectra — Quantitative Analysis & Interactive Synthesis* | `04-lesson-5-colors-wavelengths-spectra-deepDive-2`<br>`04-lesson-5-colors-wavelengths-spectra-didYouKnow-1`<br>`04-lesson-5-colors-wavelengths-spectra-mathOrAnalogy-1` | Because glass slows down violet light more than red light, violet refracts (bends) more sharply than red.  This separation of colors by wavelength is called optical dispersion. A nanometer (nm) is one billionth of a meter. A single human hair is roughly 80,000 | `planetary_orbital_shot` in `heliocentric_au`<br>Transition: `smooth_orbital_travel` | Labels: `Colors, wavelengths and spectra Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m04-5-param` (Colors, wavelengths and spectra Parameter Explorer — selector `#module-04-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Colors, wavelengths and spectra (act_04_lookback_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 04.6 — How scientists learn about stars from light (`lesson-6-how-scientists-study-stars`)

- **Storyboard ID**: `sb-m04-lesson-6-how-scientists-study-stars`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION`
- **Interactivity Mode**: `REQUIRED_LEARNING_ACTIVITY`
- **Coordinate Frame & Camera Preset**: `heliocentric_au` | `object_following_camera` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of How scientists learn about stars from light within Light, Time & Cosmic Observation.
  2. Spectroscopy reveals four vital stellar secrets: (1) chemical composition, (2) surface temperature, (3) radial velocity via Doppler shift, a
- **Mapped Narration Segments (6)**: `04-lesson-6-how-scientists-study-stars-title`, `04-lesson-6-how-scientists-study-stars-takeaway-1`, `04-lesson-6-how-scientists-study-stars-deepDive-1`, `04-lesson-6-how-scientists-study-stars-deepDive-2`, `04-lesson-6-how-scientists-study-stars-didYouKnow-1`, `04-lesson-6-how-scientists-study-stars-mathOrAnalogy-1`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m04-lesson-6-how-scientists-study-stars-beat-1`**<br>*How scientists learn about stars from light — Primary Physical Mechanism* | `04-lesson-6-how-scientists-study-stars-title`<br>`04-lesson-6-how-scientists-study-stars-takeaway-1`<br>`04-lesson-6-how-scientists-study-stars-deepDive-1` | How scientists learn about stars from light Spectroscopy reveals four vital stellar secrets: (1) chemical composition, (2) surface temperature, (3) radial velocity via Doppler shift, and (4) magnetic field strength. In 1814, Joseph von Fraunhofer cataloged 574 | `object_following_camera` in `heliocentric_au`<br>Transition: `observational_data_reveal` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m04-lesson-6-how-scientists-study-stars-beat-2`**<br>*How scientists learn about stars from light — Quantitative Analysis & Interactive Synthesis* | `04-lesson-6-how-scientists-study-stars-deepDive-2`<br>`04-lesson-6-how-scientists-study-stars-didYouKnow-1`<br>`04-lesson-6-how-scientists-study-stars-mathOrAnalogy-1` | Furthermore, if a star is moving toward Earth, its spectral lines shift toward the blue end of the spectrum (blueshift); if it is moving away, its lines shift toward the red (redshift).  This Doppler shift allows astronomers to detect wobbling stars orbited by | `data_visualization_view` in `heliocentric_au`<br>Transition: `observational_data_reveal` | Labels: `How scientists learn about stars from light Telemetry`<br>Gate: `REQUIRED_LEARNING_ACTIVITY` (Requires `act_04_lookback_time_machine`) |

- **Interactive Controls**: `ctrl-m04-6-param` (How scientists learn about stars from light Parameter Explorer — selector `#module-04-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for How scientists learn about stars from light (act_04_lookback_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---
