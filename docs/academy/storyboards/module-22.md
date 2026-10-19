# Module 22 Cinematic Storyboard — Space Missions & Human Exploration

- **Module ID**: `22` (`stageId: "stage-6-space-scientist"`, Course: `"cosmic-journey"`)
- **Total Instructional Chapters (Sublessons)**: **8**
- **Total Mapped Narration Segments**: **48** (`explorer` canonical sequence; adapted across `junior`, `explorer`, `astronomer`)
- **Primary 3D Scene & Component**: `m22_space_missions_trajectories_3d` (`src/components/academy/SpaceMuseumLab.tsx (Upgrading to R3F SpaceMissionExplorer3D.tsx)`)
- **Visual Style & Lighting Preset**: `stage6_instrument_telemetry` | `solar_directional_5772K` (`ACES Filmic`, `exposure: 1.05`, `bloomThreshold: 0.80`)
- **Primary Interactive Activity Gate**: `act_22_gravity_assist_trajectory` — *Interplanetary Gravity Assist Simulator* (Plan planetary gravity assist slingshot trajectory to reach outer solar system.)
- **Scientific References**: NASA Planetary Missions Directory & Deep Space Network Operations (NASA - https://science.nasa.gov/missions/); Chandrayaan-3 Lunar South Pole Landing & Science Instrumentation Archive (ISRO - https://www.isro.gov.in/Chandrayaan3.html); Aditya-L1 Solar Observatory Halo Orbit Science Documentation (ISRO - https://www.isro.gov.in/Aditya_L1.html); The James Webb Space Telescope Mission & Cryogenic Mirror Architecture (JWST - https://webb.nasa.gov/); International Space Station Science Research & ECLSS Operations (NASA / ESA / JAXA - https://www.nasa.gov/international-space-station/); Voyager Interstellar Mission & Heliopause In-Situ Measurements (NASA - https://voyager.jpl.nasa.gov/)

---

## Chapter 22.1 — The First Artificial Satellites (`sublesson-1-satellites`)

- **Storyboard ID**: `sb-m22-sublesson-1-satellites`
- **Scientific Representation**: `SCALE_ADJUSTED_EDUCATIONAL_MODEL`
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `heliocentric_au` | `object_following_camera` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of The First Artificial Satellites within Space Missions & Human Exploration.
  2. Sputnik 1's radio frequency (20.005 MHz) was chosen intentionally because it was close to standard frequencies monitored by amateur ham radi
- **Mapped Narration Segments (6)**: `22-sublesson-1-satellites-title`, `22-sublesson-1-satellites-didYouKnow-1`, `22-sublesson-1-satellites-interactivePrompt-1`, `22-sublesson-1-satellites-paragraph-1`, `22-sublesson-1-satellites-paragraph-2`, `22-sublesson-1-satellites-paragraph-3`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m22-sublesson-1-satellites-beat-1`**<br>*The First Artificial Satellites — Primary Physical Mechanism* | `22-sublesson-1-satellites-title`<br>`22-sublesson-1-satellites-didYouKnow-1`<br>`22-sublesson-1-satellites-interactivePrompt-1` | The First Artificial Satellites Sputnik 1's radio frequency (20.005 MHz) was chosen intentionally because it was close to standard frequencies monitored by amateur ham radio operators across the world, making the satellite impossible to deny. Explore the Compa | `object_following_camera` in `heliocentric_au`<br>Transition: `smooth_orbital_travel` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m22-sublesson-1-satellites-beat-2`**<br>*The First Artificial Satellites — Quantitative Analysis & Interactive Synthesis* | `22-sublesson-1-satellites-paragraph-1`<br>`22-sublesson-1-satellites-paragraph-2`<br>`22-sublesson-1-satellites-paragraph-3` | Placing an object into Low Earth Orbit requires reaching circular orbital velocity: v = sqrt(G * M_Earth / r), approximately 7.8 km/s (Mach 25) at 300 km altitude. Sergei Korolev's team modified the Soviet R-7 ICBM to launch Sputnik 1 (PS-1). The satellite car | `planetary_orbital_shot` in `heliocentric_au`<br>Transition: `smooth_orbital_travel` | Labels: `The First Artificial Satellites Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m22-1-param` (The First Artificial Satellites Parameter Explorer — selector `#module-22-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for The First Artificial Satellites (act_22_trajectory_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 22.2 — First Human Spaceflight (`sublesson-2-human-spaceflight`)

- **Storyboard ID**: `sb-m22-sublesson-2-human-spaceflight`
- **Scientific Representation**: `SCALE_ADJUSTED_EDUCATIONAL_MODEL`
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `heliocentric_au` | `object_following_camera` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of First Human Spaceflight within Space Missions & Human Exploration.
  2. During Vostok 1's re-entry, the instrument module failed to detach cleanly, tethered by electrical cables that caused the capsule to gyrate 
- **Mapped Narration Segments (6)**: `22-sublesson-2-human-spaceflight-title`, `22-sublesson-2-human-spaceflight-didYouKnow-1`, `22-sublesson-2-human-spaceflight-interactivePrompt-1`, `22-sublesson-2-human-spaceflight-paragraph-1`, `22-sublesson-2-human-spaceflight-paragraph-2`, `22-sublesson-2-human-spaceflight-paragraph-3`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m22-sublesson-2-human-spaceflight-beat-1`**<br>*First Human Spaceflight — Primary Physical Mechanism* | `22-sublesson-2-human-spaceflight-title`<br>`22-sublesson-2-human-spaceflight-didYouKnow-1`<br>`22-sublesson-2-human-spaceflight-interactivePrompt-1` | First Human Spaceflight During Vostok 1's re-entry, the instrument module failed to detach cleanly, tethered by electrical cables that caused the capsule to gyrate violently until atmospheric heating burned through the cables! Review the trajectory of Vostok 1 | `object_following_camera` in `heliocentric_au`<br>Transition: `smooth_orbital_travel` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m22-sublesson-2-human-spaceflight-beat-2`**<br>*First Human Spaceflight — Quantitative Analysis & Interactive Synthesis* | `22-sublesson-2-human-spaceflight-paragraph-1`<br>`22-sublesson-2-human-spaceflight-paragraph-2`<br>`22-sublesson-2-human-spaceflight-paragraph-3` | Early human space capsules like Vostok, Mercury, and Gemini faced extreme engineering challenges. During re-entry, atmospheric compression generates temperatures exceeding 2,500°C. Vostok used a thick ablative coating of asbestos-impregnated resin, while NASA' | `scientific_cross_section` in `heliocentric_au`<br>Transition: `smooth_orbital_travel` | Labels: `First Human Spaceflight Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m22-2-param` (First Human Spaceflight Parameter Explorer — selector `#module-22-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for First Human Spaceflight (act_22_trajectory_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 22.3 — Moon Exploration: Apollo to Artemis (`sublesson-3-moon-exploration`)

- **Storyboard ID**: `sb-m22-sublesson-3-moon-exploration`
- **Scientific Representation**: `SCALE_ADJUSTED_EDUCATIONAL_MODEL`
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `heliocentric_au` | `object_following_camera` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Moon Exploration: Apollo to Artemis within Space Missions & Human Exploration.
  2. Apollo 17 astronaut Harrison Schmitt—the first professional geologist to walk on the Moon—discovered strange orange soil in 1972. It turned 
- **Mapped Narration Segments (6)**: `22-sublesson-3-moon-exploration-title`, `22-sublesson-3-moon-exploration-didYouKnow-1`, `22-sublesson-3-moon-exploration-interactivePrompt-1`, `22-sublesson-3-moon-exploration-paragraph-1`, `22-sublesson-3-moon-exploration-paragraph-2`, `22-sublesson-3-moon-exploration-paragraph-3`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m22-sublesson-3-moon-exploration-beat-1`**<br>*Moon Exploration: Apollo to Artemis — Primary Physical Mechanism* | `22-sublesson-3-moon-exploration-title`<br>`22-sublesson-3-moon-exploration-didYouKnow-1`<br>`22-sublesson-3-moon-exploration-interactivePrompt-1` | Moon Exploration: Apollo to Artemis Apollo 17 astronaut Harrison Schmitt—the first professional geologist to walk on the Moon—discovered strange orange soil in 1972. It turned out to be microscopic glass beads from an ancient explosive volcanic fire fountain 3 | `object_following_camera` in `heliocentric_au`<br>Transition: `smooth_orbital_travel` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m22-sublesson-3-moon-exploration-beat-2`**<br>*Moon Exploration: Apollo to Artemis — Quantitative Analysis & Interactive Synthesis* | `22-sublesson-3-moon-exploration-paragraph-1`<br>`22-sublesson-3-moon-exploration-paragraph-2`<br>`22-sublesson-3-moon-exploration-paragraph-3` | Reaching the Moon requires Trans-Lunar Injection (TLI): an acceleration of ~3,050 m/s from Low Earth Orbit that stretches an elliptical orbit out to 384,400 km. NASA chose Lunar Orbit Rendezvous (LOR) architecture, championed by engineer John Houbolt. Instead  | `planetary_orbital_shot` in `heliocentric_au`<br>Transition: `smooth_orbital_travel` | Labels: `Moon Exploration: Apollo to Artemis Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m22-3-param` (Moon Exploration: Apollo to Artemis Parameter Explorer — selector `#module-22-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Moon Exploration: Apollo to Artemis (act_22_trajectory_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 22.4 — Space Stations & Living in Orbit (`sublesson-4-space-stations`)

- **Storyboard ID**: `sb-m22-sublesson-4-space-stations`
- **Scientific Representation**: `SCALE_ADJUSTED_EDUCATIONAL_MODEL`
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `heliocentric_au` | `object_following_camera` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Space Stations & Living in Orbit within Space Missions & Human Exploration.
  2. The Alpha Magnetic Spectrometer (AMS-02) mounted on the ISS truss has measured over 220 billion cosmic ray events, searching for pristine an
- **Mapped Narration Segments (6)**: `22-sublesson-4-space-stations-title`, `22-sublesson-4-space-stations-didYouKnow-1`, `22-sublesson-4-space-stations-interactivePrompt-1`, `22-sublesson-4-space-stations-paragraph-1`, `22-sublesson-4-space-stations-paragraph-2`, `22-sublesson-4-space-stations-paragraph-3`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m22-sublesson-4-space-stations-beat-1`**<br>*Space Stations & Living in Orbit — Primary Physical Mechanism* | `22-sublesson-4-space-stations-title`<br>`22-sublesson-4-space-stations-didYouKnow-1`<br>`22-sublesson-4-space-stations-interactivePrompt-1` | Space Stations & Living in Orbit The Alpha Magnetic Spectrometer (AMS-02) mounted on the ISS truss has measured over 220 billion cosmic ray events, searching for pristine antimatter (anti-helium) from the early universe! Check the ISS specs in the 3D Spacecraf | `object_following_camera` in `heliocentric_au`<br>Transition: `smooth_orbital_travel` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m22-sublesson-4-space-stations-beat-2`**<br>*Space Stations & Living in Orbit — Quantitative Analysis & Interactive Synthesis* | `22-sublesson-4-space-stations-paragraph-1`<br>`22-sublesson-4-space-stations-paragraph-2`<br>`22-sublesson-4-space-stations-paragraph-3` | The first space stations were single-launch modules: the Soviet Salyut program (1971) and NASA's Skylab (1973), which converted a spent Saturn V upper stage into a three-story orbiting workshop. In 1986, the Soviet Union launched Mir, the first modular space s | `scientific_cross_section` in `heliocentric_au`<br>Transition: `smooth_orbital_travel` | Labels: `Space Stations & Living in Orbit Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m22-4-param` (Space Stations & Living in Orbit Parameter Explorer — selector `#module-22-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Space Stations & Living in Orbit (act_22_trajectory_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 22.5 — Robotic Exploration of Mars (`sublesson-5-mars-rovers`)

- **Storyboard ID**: `sb-m22-sublesson-5-mars-rovers`
- **Scientific Representation**: `SCALE_ADJUSTED_EDUCATIONAL_MODEL`
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `heliocentric_au` | `object_following_camera` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Robotic Exploration of Mars within Space Missions & Human Exploration.
  2. Perseverance carries an experiment named MOXIE that successfully inhaled Martian carbon dioxide and split it into carbon monoxide and breath
- **Mapped Narration Segments (6)**: `22-sublesson-5-mars-rovers-title`, `22-sublesson-5-mars-rovers-didYouKnow-1`, `22-sublesson-5-mars-rovers-interactivePrompt-1`, `22-sublesson-5-mars-rovers-paragraph-1`, `22-sublesson-5-mars-rovers-paragraph-2`, `22-sublesson-5-mars-rovers-paragraph-3`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m22-sublesson-5-mars-rovers-beat-1`**<br>*Robotic Exploration of Mars — Primary Physical Mechanism* | `22-sublesson-5-mars-rovers-title`<br>`22-sublesson-5-mars-rovers-didYouKnow-1`<br>`22-sublesson-5-mars-rovers-interactivePrompt-1` | Robotic Exploration of Mars Perseverance carries an experiment named MOXIE that successfully inhaled Martian carbon dioxide and split it into carbon monoxide and breathable oxygen—a crucial technology for future human astronauts! Try the 'Plan a Journey to Mar | `object_following_camera` in `heliocentric_au`<br>Transition: `smooth_orbital_travel` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m22-sublesson-5-mars-rovers-beat-2`**<br>*Robotic Exploration of Mars — Quantitative Analysis & Interactive Synthesis* | `22-sublesson-5-mars-rovers-paragraph-1`<br>`22-sublesson-5-mars-rovers-paragraph-2`<br>`22-sublesson-5-mars-rovers-paragraph-3` | Landing a heavy rover on Mars is known as the 'Seven Minutes of Terror'. Because a radio signal takes up to 20 minutes to reach Earth, the landing sequence must be 100% autonomous. The spacecraft hits the upper atmosphere at 20,000 km/h, uses a supersonic para | `planetary_orbital_shot` in `heliocentric_au`<br>Transition: `smooth_orbital_travel` | Labels: `Robotic Exploration of Mars Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m22-5-param` (Robotic Exploration of Mars Parameter Explorer — selector `#module-22-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Robotic Exploration of Mars (act_22_trajectory_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 22.6 — Outer Solar System Probes & Interstellar Voyagers (`sublesson-6-outer-probes`)

- **Storyboard ID**: `sb-m22-sublesson-6-outer-probes`
- **Scientific Representation**: `SCALE_ADJUSTED_EDUCATIONAL_MODEL`
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `heliocentric_au` | `object_following_camera` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Outer Solar System Probes & Interstellar Voyagers within Space Missions & Human Exploration.
  2. In 2015, NASA's New Horizons probe flew past Pluto after a 9.5-year journey, revealing a giant heart-shaped glacier of nitrogen ice named To
- **Mapped Narration Segments (6)**: `22-sublesson-6-outer-probes-title`, `22-sublesson-6-outer-probes-didYouKnow-1`, `22-sublesson-6-outer-probes-interactivePrompt-1`, `22-sublesson-6-outer-probes-paragraph-1`, `22-sublesson-6-outer-probes-paragraph-2`, `22-sublesson-6-outer-probes-paragraph-3`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m22-sublesson-6-outer-probes-beat-1`**<br>*Outer Solar System Probes & Interstellar Voyagers — Primary Physical Mechanism* | `22-sublesson-6-outer-probes-title`<br>`22-sublesson-6-outer-probes-didYouKnow-1`<br>`22-sublesson-6-outer-probes-interactivePrompt-1` | Outer Solar System Probes & Interstellar Voyagers In 2015, NASA's New Horizons probe flew past Pluto after a 9.5-year journey, revealing a giant heart-shaped glacier of nitrogen ice named Tombaugh Regio and 3,000-meter-tall mountains of solid water ice! Use th | `object_following_camera` in `heliocentric_au`<br>Transition: `smooth_orbital_travel` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m22-sublesson-6-outer-probes-beat-2`**<br>*Outer Solar System Probes & Interstellar Voyagers — Quantitative Analysis & Interactive Synthesis* | `22-sublesson-6-outer-probes-paragraph-1`<br>`22-sublesson-6-outer-probes-paragraph-2`<br>`22-sublesson-6-outer-probes-paragraph-3` | The outer solar system probes revolutionized planetary science by revealing that cold, distant moons can be geologically alive. When Voyager 1 flew past Jupiter's moon Io in 1979, Linda Morabito noticed a giant umbrella-shaped plume erupting 300 km into space: | `scientific_cross_section` in `heliocentric_au`<br>Transition: `smooth_orbital_travel` | Labels: `Outer Solar System Probes & Interstellar Voyagers Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m22-6-param` (Outer Solar System Probes & Interstellar Voyagers Parameter Explorer — selector `#module-22-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Outer Solar System Probes & Interstellar Voyagers (act_22_trajectory_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 22.7 — Space Telescopes: Eyes Beyond the Atmosphere (`sublesson-7-space-telescopes`)

- **Storyboard ID**: `sb-m22-sublesson-7-space-telescopes`
- **Scientific Representation**: `SCALE_ADJUSTED_EDUCATIONAL_MODEL`
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `heliocentric_au` | `object_following_camera` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Space Telescopes: Eyes Beyond the Atmosphere within Space Missions & Human Exploration.
  2. NASA's Kepler space telescope stared at a single patch of 150,000 stars for over four years, watching for tiny dips in brightness as exoplan
- **Mapped Narration Segments (6)**: `22-sublesson-7-space-telescopes-title`, `22-sublesson-7-space-telescopes-didYouKnow-1`, `22-sublesson-7-space-telescopes-interactivePrompt-1`, `22-sublesson-7-space-telescopes-paragraph-1`, `22-sublesson-7-space-telescopes-paragraph-2`, `22-sublesson-7-space-telescopes-paragraph-3`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m22-sublesson-7-space-telescopes-beat-1`**<br>*Space Telescopes: Eyes Beyond the Atmosphere — Primary Physical Mechanism* | `22-sublesson-7-space-telescopes-title`<br>`22-sublesson-7-space-telescopes-didYouKnow-1`<br>`22-sublesson-7-space-telescopes-interactivePrompt-1` | Space Telescopes: Eyes Beyond the Atmosphere NASA's Kepler space telescope stared at a single patch of 150,000 stars for over four years, watching for tiny dips in brightness as exoplanets transited in front of their stars, discovering over 2,700 confirmed ali | `object_following_camera` in `heliocentric_au`<br>Transition: `smooth_orbital_travel` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m22-sublesson-7-space-telescopes-beat-2`**<br>*Space Telescopes: Eyes Beyond the Atmosphere — Quantitative Analysis & Interactive Synthesis* | `22-sublesson-7-space-telescopes-paragraph-1`<br>`22-sublesson-7-space-telescopes-paragraph-2`<br>`22-sublesson-7-space-telescopes-paragraph-3` | Earth's atmosphere acts as a protective shield, but for astronomers it acts like frosted glass. Visible light and radio waves pass through easily, but water vapor absorbs infrared, ozone blocks ultraviolet, and nitrogen absorbs X-rays and gamma rays. Space tel | `planetary_orbital_shot` in `heliocentric_au`<br>Transition: `smooth_orbital_travel` | Labels: `Space Telescopes: Eyes Beyond the Atmosphere Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m22-7-param` (Space Telescopes: Eyes Beyond the Atmosphere Parameter Explorer — selector `#module-22-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Space Telescopes: Eyes Beyond the Atmosphere (act_22_trajectory_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 22.8 — Modern & Future Mission Planning (`sublesson-8-future-planning`)

- **Storyboard ID**: `sb-m22-sublesson-8-future-planning`
- **Scientific Representation**: `SCALE_ADJUSTED_EDUCATIONAL_MODEL`
- **Interactivity Mode**: `REQUIRED_LEARNING_ACTIVITY`
- **Coordinate Frame & Camera Preset**: `heliocentric_au` | `object_following_camera` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Modern & Future Mission Planning within Space Missions & Human Exploration.
  2. Chandrayaan-3's ChaSTE thermal probe discovered that while the top layer of lunar dust was warmed by the Sun to ~50°C, just 8 centimeters be
- **Mapped Narration Segments (6)**: `22-sublesson-8-future-planning-title`, `22-sublesson-8-future-planning-didYouKnow-1`, `22-sublesson-8-future-planning-interactivePrompt-1`, `22-sublesson-8-future-planning-paragraph-1`, `22-sublesson-8-future-planning-paragraph-2`, `22-sublesson-8-future-planning-paragraph-3`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m22-sublesson-8-future-planning-beat-1`**<br>*Modern & Future Mission Planning — Primary Physical Mechanism* | `22-sublesson-8-future-planning-title`<br>`22-sublesson-8-future-planning-didYouKnow-1`<br>`22-sublesson-8-future-planning-interactivePrompt-1` | Modern & Future Mission Planning Chandrayaan-3's ChaSTE thermal probe discovered that while the top layer of lunar dust was warmed by the Sun to ~50°C, just 8 centimeters below the surface the temperature plunged to -10°C, proving lunar regolith is one of the  | `object_following_camera` in `heliocentric_au`<br>Transition: `smooth_orbital_travel` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m22-sublesson-8-future-planning-beat-2`**<br>*Modern & Future Mission Planning — Quantitative Analysis & Interactive Synthesis* | `22-sublesson-8-future-planning-paragraph-1`<br>`22-sublesson-8-future-planning-paragraph-2`<br>`22-sublesson-8-future-planning-paragraph-3` | The Moon's South Pole is the world's most sought-after destination because of its unique topography. Impact craters like Shackleton and South Pole-Aitken basin have rims high enough to receive sunlight for up to 90% of the lunar year, while their deep crater f | `data_visualization_view` in `heliocentric_au`<br>Transition: `observational_data_reveal` | Labels: `Modern & Future Mission Planning Telemetry`<br>Gate: `REQUIRED_LEARNING_ACTIVITY` (Requires `act_22_gravity_assist_trajectory`) |

- **Interactive Controls**: `ctrl-m22-8-param` (Modern & Future Mission Planning Parameter Explorer — selector `#module-22-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Modern & Future Mission Planning (act_22_trajectory_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---
