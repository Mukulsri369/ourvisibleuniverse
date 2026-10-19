# Module 21 Cinematic Storyboard — Telescopes & How We Discover Space

- **Module ID**: `21` (`stageId: "stage-6-space-scientist"`, Course: `"cosmic-journey"`)
- **Total Instructional Chapters (Sublessons)**: **8**
- **Total Mapped Narration Segments**: **36** (`explorer` canonical sequence; adapted across `junior`, `explorer`, `astronomer`)
- **Primary 3D Scene & Component**: `m21_optical_multiwavelength_observatory_3d` (`src/components/academy/VirtualObservatoryLab.tsx (Upgrading to OpticalAndMultiWavelengthObservatory3D.tsx)`)
- **Visual Style & Lighting Preset**: `stage6_instrument_telemetry` | `instrument_studio` (`ACES Filmic`, `exposure: 1.05`, `bloomThreshold: 0.80`)
- **Primary Interactive Activity Gate**: `act_21_telescope_optics_lab` — *Telescope Optics & Aperture Lab* (Calculate Rayleigh diffraction limit theta = 1.22 * lambda / D for optical vs radio.)
- **Scientific References**: The James Webb Space Telescope Mission Overview & Optical Performance (JWST - https://webb.nasa.gov/); Hubble Space Telescope Science Instruments and Wavelength Handbooks (Hubble - https://hubblesite.org/); Chandra X-ray Observatory Science & Wolter Optics Architecture (Chandra - https://chandra.harvard.edu/); ALMA: The Atacama Large Millimeter/submillimeter Array Science Archive (ESA - https://www.almaobservatory.org/); Very Large Telescope (VLT) & Adaptive Optics Facility (ESO - https://www.eso.org/public/teles-instr/paranal-observatory/vlt/)

---

## Chapter 21.1 — Why Scientists Use Telescopes (`sub_why_telescopes`)

- **Storyboard ID**: `sb-m21-sub_why_telescopes`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION`
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `optical_instrument_bench` | `instrument_viewpoint` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Why Scientists Use Telescopes within Telescopes & How We Discover Space.
  2. Imagine catching raindrops in a tiny thimble versus a swimming pool. If only a few rare drops fall every hour, the thimble might catch one d
- **Mapped Narration Segments (4)**: `21-sub_why_telescopes-title`, `21-sub_why_telescopes-deepDive-1`, `21-sub_why_telescopes-deepDive-2`, `21-sub_why_telescopes-didYouKnow-1`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m21-sub_why_telescopes-beat-1`**<br>*Why Scientists Use Telescopes — Primary Physical Mechanism* | `21-sub_why_telescopes-title`<br>`21-sub_why_telescopes-deepDive-1` | 1. Why Scientists Use Telescopes Imagine catching raindrops in a tiny thimble versus a swimming pool. If only a few rare drops fall every hour, the thimble might catch one drop all night, but the swimming pool will catch thousands of gallons! | `instrument_viewpoint` in `optical_instrument_bench`<br>Transition: `observational_data_reveal` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m21-sub_why_telescopes-beat-2`**<br>*Why Scientists Use Telescopes — Quantitative Analysis & Interactive Synthesis* | `21-sub_why_telescopes-deepDive-2`<br>`21-sub_why_telescopes-didYouKnow-1` | In astronomy, distant stars and galaxies are like gentle showers of photons.  Giant telescopes are huge swimming pools that collect enough cosmic light to create crisp, detailed pictures. The human eye only sees wavelengths between about 380 and 700 nanometers | `planetary_orbital_shot` in `optical_instrument_bench`<br>Transition: `smooth_orbital_travel` | Labels: `Why Scientists Use Telescopes Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m21-1-param` (Why Scientists Use Telescopes Parameter Explorer — selector `#module-21-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Why Scientists Use Telescopes (act_21_optics_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 21.2 — Refracting and Reflecting Telescopes (`sub_refractor_reflector`)

- **Storyboard ID**: `sb-m21-sub_refractor_reflector`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION`
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `optical_instrument_bench` | `instrument_viewpoint` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Refracting and Reflecting Telescopes within Telescopes & How We Discover Space.
  2. Why did astronomers stop building giant refractor telescopes after 1897? The largest refractor ever built is the 40-inch (1-meter) lens at Y
- **Mapped Narration Segments (5)**: `21-sub_refractor_reflector-title`, `21-sub_refractor_reflector-deepDive-1`, `21-sub_refractor_reflector-deepDive-2`, `21-sub_refractor_reflector-deepDive-3`, `21-sub_refractor_reflector-didYouKnow-1`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m21-sub_refractor_reflector-beat-1`**<br>*Refracting and Reflecting Telescopes — Primary Physical Mechanism* | `21-sub_refractor_reflector-title`<br>`21-sub_refractor_reflector-deepDive-1`<br>`21-sub_refractor_reflector-deepDive-2` | 2. Refracting and Reflecting Telescopes Why did astronomers stop building giant refractor telescopes after 1897? The largest refractor ever built is the 40-inch (1-meter) lens at Yerkes Observatory in Wisconsin. That lens weighs over 1,000 pounds! Because ligh | `instrument_viewpoint` in `optical_instrument_bench`<br>Transition: `observational_data_reveal` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m21-sub_refractor_reflector-beat-2`**<br>*Refracting and Reflecting Telescopes — Quantitative Analysis & Interactive Synthesis* | `21-sub_refractor_reflector-deepDive-3`<br>`21-sub_refractor_reflector-didYouKnow-1` | Mirrors, on the other hand, can be supported from behind across their entire back surface by steel cradles and computer-controlled actuators! James Webb's primary mirror is made of 18 hexagonal segments made of beryllium metal coated in a microscopic layer of  | `scientific_cross_section` in `optical_instrument_bench`<br>Transition: `smooth_orbital_travel` | Labels: `Refracting and Reflecting Telescopes Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m21-2-param` (Refracting and Reflecting Telescopes Parameter Explorer — selector `#module-21-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Refracting and Reflecting Telescopes (act_21_optics_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 21.3 — Light-Gathering Power and Resolution (`sub_light_gathering_resolution`)

- **Storyboard ID**: `sb-m21-sub_light_gathering_resolution`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION`
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `optical_instrument_bench` | `instrument_viewpoint` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Light-Gathering Power and Resolution within Telescopes & How We Discover Space.
  2. Think of two car headlights miles away on a dark highway. Far away, your eyes see just one glowing yellow blob. As the car drives closer, yo
- **Mapped Narration Segments (4)**: `21-sub_light_gathering_resolution-title`, `21-sub_light_gathering_resolution-deepDive-1`, `21-sub_light_gathering_resolution-deepDive-2`, `21-sub_light_gathering_resolution-didYouKnow-1`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m21-sub_light_gathering_resolution-beat-1`**<br>*Light-Gathering Power and Resolution — Primary Physical Mechanism* | `21-sub_light_gathering_resolution-title`<br>`21-sub_light_gathering_resolution-deepDive-1` | 3. Light-Gathering Power and Resolution Think of two car headlights miles away on a dark highway. Far away, your eyes see just one glowing yellow blob. As the car drives closer, your eyes can finally tell there are two separate headlights! | `instrument_viewpoint` in `optical_instrument_bench`<br>Transition: `observational_data_reveal` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m21-sub_light_gathering_resolution-beat-2`**<br>*Light-Gathering Power and Resolution — Quantitative Analysis & Interactive Synthesis* | `21-sub_light_gathering_resolution-deepDive-2`<br>`21-sub_light_gathering_resolution-didYouKnow-1` | The Rayleigh criterion tells us the exact angle where two glowing points can be separated.  A large telescope can split two stars that look completely merged into one blob to a smaller telescope. The Hubble Space Telescope can resolve an angle of 0.05 arcsecon | `planetary_orbital_shot` in `optical_instrument_bench`<br>Transition: `smooth_orbital_travel` | Labels: `Light-Gathering Power and Resolution Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m21-3-param` (Light-Gathering Power and Resolution Parameter Explorer — selector `#module-21-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Light-Gathering Power and Resolution (act_21_optics_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 21.4 — Space Versus Ground Observatories (`sub_space_vs_ground`)

- **Storyboard ID**: `sb-m21-sub_space_vs_ground`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION`
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `optical_instrument_bench` | `instrument_viewpoint` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Space Versus Ground Observatories within Telescopes & How We Discover Space.
  2. How does Adaptive Optics work? High in the Chilean desert at the Very Large Telescope, astronomers shoot four brilliant orange lasers into t
- **Mapped Narration Segments (5)**: `21-sub_space_vs_ground-title`, `21-sub_space_vs_ground-deepDive-1`, `21-sub_space_vs_ground-deepDive-2`, `21-sub_space_vs_ground-deepDive-3`, `21-sub_space_vs_ground-didYouKnow-1`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m21-sub_space_vs_ground-beat-1`**<br>*Space Versus Ground Observatories — Primary Physical Mechanism* | `21-sub_space_vs_ground-title`<br>`21-sub_space_vs_ground-deepDive-1`<br>`21-sub_space_vs_ground-deepDive-2` | 4. Space Versus Ground Observatories How does Adaptive Optics work? High in the Chilean desert at the Very Large Telescope, astronomers shoot four brilliant orange lasers into the sky. These lasers excite sodium atoms 90 kilometers high in the mesosphere, crea | `instrument_viewpoint` in `optical_instrument_bench`<br>Transition: `observational_data_reveal` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m21-sub_space_vs_ground-beat-2`**<br>*Space Versus Ground Observatories — Quantitative Analysis & Interactive Synthesis* | `21-sub_space_vs_ground-deepDive-3`<br>`21-sub_space_vs_ground-didYouKnow-1` | The mirror bends 1,000 times every second to cancel out the atmosphere's wobble, turning fuzzy blobs back into pinpoint sharp stars! Earth's atmosphere absorbs 100% of cosmic gamma rays and X-rays, and over 98% of far-infrared light. If we had never launched s | `scientific_cross_section` in `optical_instrument_bench`<br>Transition: `smooth_orbital_travel` | Labels: `Space Versus Ground Observatories Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m21-4-param` (Space Versus Ground Observatories Parameter Explorer — selector `#module-21-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Space Versus Ground Observatories (act_21_optics_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 21.5 — Radio Astronomy and Interferometry (`sub_radio_astronomy`)

- **Storyboard ID**: `sb-m21-sub_radio_astronomy`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION`
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `optical_instrument_bench` | `instrument_viewpoint` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Radio Astronomy and Interferometry within Telescopes & How We Discover Space.
  2. In 1931, Karl Jansky was an engineer working for Bell Telephone Laboratories trying to find out what was causing static hissing on overseas 
- **Mapped Narration Segments (4)**: `21-sub_radio_astronomy-title`, `21-sub_radio_astronomy-deepDive-1`, `21-sub_radio_astronomy-deepDive-2`, `21-sub_radio_astronomy-didYouKnow-1`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m21-sub_radio_astronomy-beat-1`**<br>*Radio Astronomy and Interferometry — Primary Physical Mechanism* | `21-sub_radio_astronomy-title`<br>`21-sub_radio_astronomy-deepDive-1` | 5. Radio Astronomy and Interferometry In 1931, Karl Jansky was an engineer working for Bell Telephone Laboratories trying to find out what was causing static hissing on overseas telephone calls. | `instrument_viewpoint` in `optical_instrument_bench`<br>Transition: `observational_data_reveal` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m21-sub_radio_astronomy-beat-2`**<br>*Radio Astronomy and Interferometry — Quantitative Analysis & Interactive Synthesis* | `21-sub_radio_astronomy-deepDive-2`<br>`21-sub_radio_astronomy-didYouKnow-1` | He built a rotating radio antenna and discovered that the hissing wasn't coming from thunderstorms or car engines—it was coming from the center of our Milky Way galaxy!  He had accidentally discovered radio astronomy, proving that the universe is broadcasting  | `planetary_orbital_shot` in `optical_instrument_bench`<br>Transition: `smooth_orbital_travel` | Labels: `Radio Astronomy and Interferometry Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m21-5-param` (Radio Astronomy and Interferometry Parameter Explorer — selector `#module-21-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Radio Astronomy and Interferometry (act_21_optics_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 21.6 — Infrared and Ultraviolet Astronomy (`sub_infrared_ultraviolet`)

- **Storyboard ID**: `sb-m21-sub_infrared_ultraviolet`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION`
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `optical_instrument_bench` | `instrument_viewpoint` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Infrared and Ultraviolet Astronomy within Telescopes & How We Discover Space.
  2. Why did NASA put a giant 5-layer tennis-court-sized sunshield on the James Webb Space Telescope? Because infrared light is heat! If Webb wer
- **Mapped Narration Segments (4)**: `21-sub_infrared_ultraviolet-title`, `21-sub_infrared_ultraviolet-deepDive-1`, `21-sub_infrared_ultraviolet-deepDive-2`, `21-sub_infrared_ultraviolet-didYouKnow-1`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m21-sub_infrared_ultraviolet-beat-1`**<br>*Infrared and Ultraviolet Astronomy — Primary Physical Mechanism* | `21-sub_infrared_ultraviolet-title`<br>`21-sub_infrared_ultraviolet-deepDive-1` | 6. Infrared and Ultraviolet Astronomy Why did NASA put a giant 5-layer tennis-court-sized sunshield on the James Webb Space Telescope? Because infrared light is heat! If Webb were warm, its own mirrors and camera would glow bright in the infrared, blinding its | `instrument_viewpoint` in `optical_instrument_bench`<br>Transition: `observational_data_reveal` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m21-sub_infrared_ultraviolet-beat-2`**<br>*Infrared and Ultraviolet Astronomy — Quantitative Analysis & Interactive Synthesis* | `21-sub_infrared_ultraviolet-deepDive-2`<br>`21-sub_infrared_ultraviolet-didYouKnow-1` | The shiny silver sunshield keeps Webb in a permanent deep freeze at -388° Fahrenheit (-233° Celsius).  The mid-infrared camera (MIRI) even uses a specialized helium refrigerator to chill down to just 7 degrees above absolute zero! The ozone layer high in Earth | `scientific_cross_section` in `optical_instrument_bench`<br>Transition: `smooth_orbital_travel` | Labels: `Infrared and Ultraviolet Astronomy Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m21-6-param` (Infrared and Ultraviolet Astronomy Parameter Explorer — selector `#module-21-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Infrared and Ultraviolet Astronomy (act_21_optics_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 21.7 — X-ray Astronomy: The High-Energy Universe (`sub_xray_astronomy`)

- **Storyboard ID**: `sb-m21-sub_xray_astronomy`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION`
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `optical_instrument_bench` | `instrument_viewpoint` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of X-ray Astronomy: The High-Energy Universe within Telescopes & How We Discover Space.
  2. Imagine throwing a rock at a lake. If you throw it straight down, it splashes and sinks to the bottom.
- **Mapped Narration Segments (5)**: `21-sub_xray_astronomy-title`, `21-sub_xray_astronomy-deepDive-1`, `21-sub_xray_astronomy-deepDive-2`, `21-sub_xray_astronomy-deepDive-3`, `21-sub_xray_astronomy-didYouKnow-1`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m21-sub_xray_astronomy-beat-1`**<br>*X-ray Astronomy: The High-Energy Universe — Primary Physical Mechanism* | `21-sub_xray_astronomy-title`<br>`21-sub_xray_astronomy-deepDive-1`<br>`21-sub_xray_astronomy-deepDive-2` | 7. X-ray Astronomy: The High-Energy Universe Imagine throwing a rock at a lake. If you throw it straight down, it splashes and sinks to the bottom. But if you throw a flat stone at a very shallow, grazing angle nearly parallel to the water, the surface tension | `instrument_viewpoint` in `optical_instrument_bench`<br>Transition: `observational_data_reveal` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m21-sub_xray_astronomy-beat-2`**<br>*X-ray Astronomy: The High-Energy Universe — Quantitative Analysis & Interactive Synthesis* | `21-sub_xray_astronomy-deepDive-3`<br>`21-sub_xray_astronomy-didYouKnow-1` | Its four nested cylindrical mirrors are polished so smooth that X-ray photons strike them at an angle of less than 1 degree and bounce gently to a focus 10 meters away. Chandra's mirrors are the smoothest surfaces ever created by humanity. If Chandra's mirrors | `planetary_orbital_shot` in `optical_instrument_bench`<br>Transition: `smooth_orbital_travel` | Labels: `X-ray Astronomy: The High-Energy Universe Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m21-7-param` (X-ray Astronomy: The High-Energy Universe Parameter Explorer — selector `#module-21-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for X-ray Astronomy: The High-Energy Universe (act_21_optics_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 21.8 — Spectroscopy and Astronomical Data (`sub_spectroscopy`)

- **Storyboard ID**: `sb-m21-sub_spectroscopy`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION`
- **Interactivity Mode**: `REQUIRED_LEARNING_ACTIVITY`
- **Coordinate Frame & Camera Preset**: `optical_instrument_bench` | `instrument_viewpoint` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Spectroscopy and Astronomical Data within Telescopes & How We Discover Space.
  2. Think of a police car siren. ). As it drives away, the sound waves stretch out and sound lower-pitched. Light does the exact same thing! If 
- **Mapped Narration Segments (5)**: `21-sub_spectroscopy-title`, `21-sub_spectroscopy-deepDive-1`, `21-sub_spectroscopy-deepDive-2`, `21-sub_spectroscopy-didYouKnow-1`, `21-sub_spectroscopy-didYouKnow-2`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m21-sub_spectroscopy-beat-1`**<br>*Spectroscopy and Astronomical Data — Primary Physical Mechanism* | `21-sub_spectroscopy-title`<br>`21-sub_spectroscopy-deepDive-1`<br>`21-sub_spectroscopy-deepDive-2` | 8. Spectroscopy and Astronomical Data Think of a police car siren. ). As it drives away, the sound waves stretch out and sound lower-pitched. Light does the exact same thing! If a star is moving toward Earth, its light waves get squished toward the blue end of | `instrument_viewpoint` in `optical_instrument_bench`<br>Transition: `observational_data_reveal` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m21-sub_spectroscopy-beat-2`**<br>*Spectroscopy and Astronomical Data — Quantitative Analysis & Interactive Synthesis* | `21-sub_spectroscopy-didYouKnow-1`<br>`21-sub_spectroscopy-didYouKnow-2` | Helium was discovered on the Sun 27 years BEFORE it was ever found on Earth! In 1868, astronomer Pierre Janssen observed a total solar eclipse and noticed a bright yellow spectral line that matched no known element on Earth. He named it 'Helium' after Helios,  | `data_visualization_view` in `optical_instrument_bench`<br>Transition: `observational_data_reveal` | Labels: `Spectroscopy and Astronomical Data Telemetry`<br>Gate: `REQUIRED_LEARNING_ACTIVITY` (Requires `act_21_telescope_optics_lab`) |

- **Interactive Controls**: `ctrl-m21-8-param` (Spectroscopy and Astronomical Data Parameter Explorer — selector `#module-21-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Spectroscopy and Astronomical Data (act_21_optics_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---
