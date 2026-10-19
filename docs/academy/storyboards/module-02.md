# Module 02 Cinematic Storyboard — The Night Sky & Constellations

- **Module ID**: `02` (`stageId: "stage-1-discovering-space"`, Course: `"cosmic-journey"`)
- **Total Instructional Chapters (Sublessons)**: **6**
- **Total Mapped Narration Segments**: **37** (`explorer` canonical sequence; adapted across `junior`, `explorer`, `astronomer`)
- **Primary 3D Scene & Component**: `m02_virtual_planetarium_dome` (`src/components/academy/VirtualPlanetarium3D.tsx`)
- **Visual Style & Lighting Preset**: `stage1_cosmic_horizon` | `cosmological_ambient` (`ACES Filmic`, `exposure: 1.05`, `bloomThreshold: 0.80`)
- **Primary Interactive Activity Gate**: `act_02_planetarium_nav` — *Virtual Planetarium Constellation Mapping* (Locate Polaris and identify northern/southern circumpolar constellations.)
- **Scientific References**: The 88 Official Constellations (IAU - https://www.iau.org/public/themes/constellations/)

---

## Chapter 02.1 — Why do we see stars at night? (`lesson-1-why-stars-at-night`)

- **Storyboard ID**: `sb-m02-lesson-1-why-stars-at-night`
- **Scientific Representation**: `OBSERVATION_BASED`
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `terrestrial_horizon` | `fixed_observation_camera` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Why do we see stars at night? within The Night Sky & Constellations.
  2. Sunlight scatters through atmospheric gas molecules, creating an optical veil with a luminance of thousands of candelas per square meter.
- **Mapped Narration Segments (6)**: `02-lesson-1-why-stars-at-night-title`, `02-lesson-1-why-stars-at-night-takeaway-1`, `02-lesson-1-why-stars-at-night-deepDive-1`, `02-lesson-1-why-stars-at-night-deepDive-2`, `02-lesson-1-why-stars-at-night-didYouKnow-1`, `02-lesson-1-why-stars-at-night-mathOrAnalogy-1`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m02-lesson-1-why-stars-at-night-beat-1`**<br>*Why do we see stars at night? — Primary Physical Mechanism* | `02-lesson-1-why-stars-at-night-title`<br>`02-lesson-1-why-stars-at-night-takeaway-1`<br>`02-lesson-1-why-stars-at-night-deepDive-1` | Why do we see stars at night? Sunlight scatters through atmospheric gas molecules, creating an optical veil with a luminance of thousands of candelas per square meter. The Sun is approximately 400,000 times brighter in apparent magnitude than the full Moon, an | `fixed_observation_camera` in `terrestrial_horizon`<br>Transition: `smooth_orbital_travel` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m02-lesson-1-why-stars-at-night-beat-2`**<br>*Why do we see stars at night? — Quantitative Analysis & Interactive Synthesis* | `02-lesson-1-why-stars-at-night-deepDive-2`<br>`02-lesson-1-why-stars-at-night-didYouKnow-1`<br>`02-lesson-1-why-stars-at-night-mathOrAnalogy-1` | Shorter blue wavelengths scatter ten times more efficiently than red light, creating the luminous daytime sky dome.  Only when our hemisphere rotates into Earth's shadow (night) does the atmospheric glow fade, allowing faint starlight to penetrate. During a to | `planetary_orbital_shot` in `terrestrial_horizon`<br>Transition: `smooth_orbital_travel` | Labels: `Why do we see stars at night? Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m02-1-param` (Why do we see stars at night? Parameter Explorer — selector `#module-02-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Why do we see stars at night? (act_02_skychart_2d).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 02.2 — What are constellations? (`lesson-2-what-are-constellations`)

- **Storyboard ID**: `sb-m02-lesson-2-what-are-constellations`
- **Scientific Representation**: `OBSERVATION_BASED`
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `terrestrial_horizon` | `fixed_observation_camera` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of What are constellations? within The Night Sky & Constellations.
  2. Constellations are 2D line-of-sight projections. The stars that compose them rarely have any physical gravitational relationship to each oth
- **Mapped Narration Segments (5)**: `02-lesson-2-what-are-constellations-title`, `02-lesson-2-what-are-constellations-takeaway-1`, `02-lesson-2-what-are-constellations-deepDive-1`, `02-lesson-2-what-are-constellations-didYouKnow-1`, `02-lesson-2-what-are-constellations-mathOrAnalogy-1`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m02-lesson-2-what-are-constellations-beat-1`**<br>*What are constellations? — Primary Physical Mechanism* | `02-lesson-2-what-are-constellations-title`<br>`02-lesson-2-what-are-constellations-takeaway-1`<br>`02-lesson-2-what-are-constellations-deepDive-1` | What are constellations? Constellations are 2D line-of-sight projections. The stars that compose them rarely have any physical gravitational relationship to each other. Historically, Mesopotamian, Greek, Egyptian, Chinese, and Indigenous cultures developed dis | `fixed_observation_camera` in `terrestrial_horizon`<br>Transition: `smooth_orbital_travel` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m02-lesson-2-what-are-constellations-beat-2`**<br>*What are constellations? — Quantitative Analysis & Interactive Synthesis* | `02-lesson-2-what-are-constellations-didYouKnow-1`<br>`02-lesson-2-what-are-constellations-mathOrAnalogy-1` | The 'Big Dipper' is technically not a constellation! It is an 'asterism'—a recognizable pattern that forms just a part of the larger official constellation Ursa Major (The Great Bear). In the Big Dipper, Alkaid is 104 light-years away, while Dubhe is 123 light | `scientific_cross_section` in `terrestrial_horizon`<br>Transition: `smooth_orbital_travel` | Labels: `What are constellations? Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m02-2-param` (What are constellations? Parameter Explorer — selector `#module-02-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for What are constellations? (act_02_skychart_2d).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 02.3 — Earth's rotation and the moving sky (`lesson-3-earths-rotation-moving-sky`)

- **Storyboard ID**: `sb-m02-lesson-3-earths-rotation-moving-sky`
- **Scientific Representation**: `OBSERVATION_BASED`
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `terrestrial_horizon` | `fixed_observation_camera` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Earth's rotation and the moving sky within The Night Sky & Constellations.
  2. Earth rotates 360 degrees in 23 hours, 56 minutes, and 4.09 seconds (one sidereal day). This 4-minute offset against the solar day shifts th
- **Mapped Narration Segments (7)**: `02-lesson-3-earths-rotation-moving-sky-title`, `02-lesson-3-earths-rotation-moving-sky-takeaway-1`, `02-lesson-3-earths-rotation-moving-sky-deepDive-1`, `02-lesson-3-earths-rotation-moving-sky-deepDive-2`, `02-lesson-3-earths-rotation-moving-sky-deepDive-3`, `02-lesson-3-earths-rotation-moving-sky-didYouKnow-1`, `02-lesson-3-earths-rotation-moving-sky-mathOrAnalogy-1`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m02-lesson-3-earths-rotation-moving-sky-beat-1`**<br>*Earth's rotation and the moving sky — Primary Physical Mechanism* | `02-lesson-3-earths-rotation-moving-sky-title`<br>`02-lesson-3-earths-rotation-moving-sky-takeaway-1`<br>`02-lesson-3-earths-rotation-moving-sky-deepDive-1`<br>`02-lesson-3-earths-rotation-moving-sky-deepDive-2` | Earth's rotation and the moving sky Earth rotates 360 degrees in 23 hours, 56 minutes, and 4.09 seconds (one sidereal day). This 4-minute offset against the solar day shifts the constellations across seasons. Because Earth rotates once every 24 hours (1,440 mi | `fixed_observation_camera` in `terrestrial_horizon`<br>Transition: `smooth_orbital_travel` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m02-lesson-3-earths-rotation-moving-sky-beat-2`**<br>*Earth's rotation and the moving sky — Quantitative Analysis & Interactive Synthesis* | `02-lesson-3-earths-rotation-moving-sky-deepDive-3`<br>`02-lesson-3-earths-rotation-moving-sky-didYouKnow-1`<br>`02-lesson-3-earths-rotation-moving-sky-mathOrAnalogy-1` | Because Earth simultaneously orbits the Sun, our nighttime vantage point peers in a slightly different direction each night, shifting seasonal constellations over 365 days. A solar day (24h 00m) is longer than a sidereal day (23h 56m) because Earth has to spin | `planetary_orbital_shot` in `terrestrial_horizon`<br>Transition: `smooth_orbital_travel` | Labels: `Earth's rotation and the moving sky Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m02-3-param` (Earth's rotation and the moving sky Parameter Explorer — selector `#module-02-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Earth's rotation and the moving sky (act_02_skychart_2d).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 02.4 — The celestial poles and apparent star trails (`lesson-4-celestial-poles-star-trails`)

- **Storyboard ID**: `sb-m02-lesson-4-celestial-poles-star-trails`
- **Scientific Representation**: `OBSERVATION_BASED`
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `terrestrial_horizon` | `fixed_observation_camera` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of The celestial poles and apparent star trails within The Night Sky & Constellations.
  2. Polaris sits less than 0.7° from the North Celestial Pole (NCP). Its altitude above the northern horizon equals the observer's geographic la
- **Mapped Narration Segments (7)**: `02-lesson-4-celestial-poles-star-trails-title`, `02-lesson-4-celestial-poles-star-trails-takeaway-1`, `02-lesson-4-celestial-poles-star-trails-deepDive-1`, `02-lesson-4-celestial-poles-star-trails-deepDive-2`, `02-lesson-4-celestial-poles-star-trails-deepDive-3`, `02-lesson-4-celestial-poles-star-trails-didYouKnow-1`, `02-lesson-4-celestial-poles-star-trails-mathOrAnalogy-1`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m02-lesson-4-celestial-poles-star-trails-beat-1`**<br>*The celestial poles and apparent star trails — Primary Physical Mechanism* | `02-lesson-4-celestial-poles-star-trails-title`<br>`02-lesson-4-celestial-poles-star-trails-takeaway-1`<br>`02-lesson-4-celestial-poles-star-trails-deepDive-1`<br>`02-lesson-4-celestial-poles-star-trails-deepDive-2` | The celestial poles and apparent star trails Polaris sits less than 0.7° from the North Celestial Pole (NCP). Its altitude above the northern horizon equals the observer's geographic latitude! If you stand at the North Pole (Latitude 90°N), Polaris is directly | `fixed_observation_camera` in `terrestrial_horizon`<br>Transition: `smooth_orbital_travel` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m02-lesson-4-celestial-poles-star-trails-beat-2`**<br>*The celestial poles and apparent star trails — Quantitative Analysis & Interactive Synthesis* | `02-lesson-4-celestial-poles-star-trails-deepDive-3`<br>`02-lesson-4-celestial-poles-star-trails-didYouKnow-1`<br>`02-lesson-4-celestial-poles-star-trails-mathOrAnalogy-1` | In the Southern Hemisphere, Polaris is invisible beneath the horizon; instead, southern stargazers look toward the South Celestial Pole (SCP) near the Southern Cross (Crux). Due to Earth's 25,772-year axial precession (wobbling like a slowing spinning top), Po | `scientific_cross_section` in `terrestrial_horizon`<br>Transition: `smooth_orbital_travel` | Labels: `The celestial poles and apparent star trails Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m02-4-param` (The celestial poles and apparent star trails Parameter Explorer — selector `#module-02-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for The celestial poles and apparent star trails (act_02_skychart_2d).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 02.5 — Planets versus stars (`lesson-5-planets-vs-stars`)

- **Storyboard ID**: `sb-m02-lesson-5-planets-vs-stars`
- **Scientific Representation**: `OBSERVATION_BASED`
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `terrestrial_horizon` | `fixed_observation_camera` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Planets versus stars within The Night Sky & Constellations.
  2. Planets subtend measurable angular diameters (10–50 arcseconds), whereas stars are unresolved sub-milliarcsecond point sources.
- **Mapped Narration Segments (6)**: `02-lesson-5-planets-vs-stars-title`, `02-lesson-5-planets-vs-stars-takeaway-1`, `02-lesson-5-planets-vs-stars-deepDive-1`, `02-lesson-5-planets-vs-stars-deepDive-2`, `02-lesson-5-planets-vs-stars-didYouKnow-1`, `02-lesson-5-planets-vs-stars-mathOrAnalogy-1`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m02-lesson-5-planets-vs-stars-beat-1`**<br>*Planets versus stars — Primary Physical Mechanism* | `02-lesson-5-planets-vs-stars-title`<br>`02-lesson-5-planets-vs-stars-takeaway-1`<br>`02-lesson-5-planets-vs-stars-deepDive-1` | Planets versus stars Planets subtend measurable angular diameters (10–50 arcseconds), whereas stars are unresolved sub-milliarcsecond point sources. Earth's atmosphere consists of turbulent air pockets with varying temperatures and densities (refractive index  | `fixed_observation_camera` in `terrestrial_horizon`<br>Transition: `smooth_orbital_travel` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m02-lesson-5-planets-vs-stars-beat-2`**<br>*Planets versus stars — Quantitative Analysis & Interactive Synthesis* | `02-lesson-5-planets-vs-stars-deepDive-2`<br>`02-lesson-5-planets-vs-stars-didYouKnow-1`<br>`02-lesson-5-planets-vs-stars-mathOrAnalogy-1` | Conversely, planets like Jupiter subtend ~45 arcseconds; the light rays from different points of the planetary disk average out, canceling scintillation and producing a steady glow. Planets always travel inside a narrow 16-degree band across the sky called the | `planetary_orbital_shot` in `terrestrial_horizon`<br>Transition: `smooth_orbital_travel` | Labels: `Planets versus stars Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m02-5-param` (Planets versus stars Parameter Explorer — selector `#module-02-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Planets versus stars (act_02_skychart_2d).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 02.6 — Finding directions using the sky (`lesson-6-finding-directions-using-sky`)

- **Storyboard ID**: `sb-m02-lesson-6-finding-directions-using-sky`
- **Scientific Representation**: `OBSERVATION_BASED`
- **Interactivity Mode**: `REQUIRED_LEARNING_ACTIVITY`
- **Coordinate Frame & Camera Preset**: `terrestrial_horizon` | `fixed_observation_camera` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Finding directions using the sky within The Night Sky & Constellations.
  2. The 'Pointer Stars' (Merak and Dubhe) point northward to Polaris. In the southern hemisphere, the long axis of the Southern Cross points 4.5
- **Mapped Narration Segments (6)**: `02-lesson-6-finding-directions-using-sky-title`, `02-lesson-6-finding-directions-using-sky-takeaway-1`, `02-lesson-6-finding-directions-using-sky-deepDive-1`, `02-lesson-6-finding-directions-using-sky-deepDive-2`, `02-lesson-6-finding-directions-using-sky-didYouKnow-1`, `02-lesson-6-finding-directions-using-sky-mathOrAnalogy-1`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m02-lesson-6-finding-directions-using-sky-beat-1`**<br>*Finding directions using the sky — Primary Physical Mechanism* | `02-lesson-6-finding-directions-using-sky-title`<br>`02-lesson-6-finding-directions-using-sky-takeaway-1`<br>`02-lesson-6-finding-directions-using-sky-deepDive-1` | Finding directions using the sky The 'Pointer Stars' (Merak and Dubhe) point northward to Polaris. In the southern hemisphere, the long axis of the Southern Cross points 4.5 times its length toward True South. To locate True South without a pole star: Locate t | `fixed_observation_camera` in `terrestrial_horizon`<br>Transition: `smooth_orbital_travel` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m02-lesson-6-finding-directions-using-sky-beat-2`**<br>*Finding directions using the sky — Quantitative Analysis & Interactive Synthesis* | `02-lesson-6-finding-directions-using-sky-deepDive-2`<br>`02-lesson-6-finding-directions-using-sky-didYouKnow-1`<br>`02-lesson-6-finding-directions-using-sky-mathOrAnalogy-1` | The point where the Crux axis and this perpendicular bisector intersect marks the South Celestial Pole (SCP).  Dropping a line vertically downward from this point to the horizon establishes True South. Orion's Belt also serves as a celestial road sign: follow  | `data_visualization_view` in `terrestrial_horizon`<br>Transition: `observational_data_reveal` | Labels: `Finding directions using the sky Telemetry`<br>Gate: `REQUIRED_LEARNING_ACTIVITY` (Requires `act_02_planetarium_nav`) |

- **Interactive Controls**: `ctrl-m02-6-param` (Finding directions using the sky Parameter Explorer — selector `#module-02-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Finding directions using the sky (act_02_skychart_2d).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---
