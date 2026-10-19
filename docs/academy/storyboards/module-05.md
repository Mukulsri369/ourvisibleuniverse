# Module 05 Cinematic Storyboard — Earth, Moon & Eclipses

- **Module ID**: `05` (`stageId: "stage-2-cosmic-neighborhood"`, Course: `"cosmic-journey"`)
- **Total Instructional Chapters (Sublessons)**: **7**
- **Total Mapped Narration Segments**: **40** (`explorer` canonical sequence; adapted across `junior`, `explorer`, `astronomer`)
- **Primary 3D Scene & Component**: `m05_sun_earth_moon_eclipses_3d` (`src/components/academy/SunEarthMoonSimulation3D.tsx`)
- **Visual Style & Lighting Preset**: `stage2_planetary_albedo` | `solar_directional_5772K` (`ACES Filmic`, `exposure: 1.05`, `bloomThreshold: 0.80`)
- **Primary Interactive Activity Gate**: `act_05_seasons_eclipse_sim` — *Axial Tilt & Eclipse Geometry Lab* (Simulate summer solstice solar insolation and lunar orbital inclination nodes.)
- **Scientific References**: NASA Lunar Science & Eclipse Exploration (NASA - https://science.nasa.gov/eclipses/)

---

## Chapter 05.1 — Earth rotates: day and night (`lesson-1-earth-rotates-day-night`)

- **Storyboard ID**: `sb-m05-lesson-1-earth-rotates-day-night`
- **Scientific Representation**: `SCALE_ADJUSTED_EDUCATIONAL_MODEL` — *Earth and Moon radii scaled for simultaneous visibility alongside the 5.145° inclined lunar orbit; 1:1 scale toggle supported.*
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `geocentric_cis_lunar` | `planetary_orbital_shot` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Earth rotates: day and night within Earth, Moon & Eclipses.
  2. Earth's rotation eastward makes the Sun, Moon, and stars appear to rise in the east and set in the west.
- **Mapped Narration Segments (5)**: `05-lesson-1-earth-rotates-day-night-title`, `05-lesson-1-earth-rotates-day-night-takeaway-1`, `05-lesson-1-earth-rotates-day-night-deepDive-1`, `05-lesson-1-earth-rotates-day-night-didYouKnow-1`, `05-lesson-1-earth-rotates-day-night-mathOrAnalogy-1`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m05-lesson-1-earth-rotates-day-night-beat-1`**<br>*Earth rotates: day and night — Primary Physical Mechanism* | `05-lesson-1-earth-rotates-day-night-title`<br>`05-lesson-1-earth-rotates-day-night-takeaway-1`<br>`05-lesson-1-earth-rotates-day-night-deepDive-1` | Earth rotates: day and night Earth's rotation eastward makes the Sun, Moon, and stars appear to rise in the east and set in the west. The dividing line between the sunlit day side and dark night side of Earth is called the 'terminator'. As the planet rotates e | `planetary_orbital_shot` in `geocentric_cis_lunar`<br>Transition: `smooth_orbital_travel` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m05-lesson-1-earth-rotates-day-night-beat-2`**<br>*Earth rotates: day and night — Quantitative Analysis & Interactive Synthesis* | `05-lesson-1-earth-rotates-day-night-didYouKnow-1`<br>`05-lesson-1-earth-rotates-day-night-mathOrAnalogy-1` | Because Earth spins on its axis, centrifugal force causes our planet to bulge slightly at the equator! Earth is not a perfect sphere, but an 'oblate spheroid'—its equatorial radius is 21 km wider than its polar radius. Rotational speed at latitude θ: v = 1,674 | `planetary_orbital_shot` in `geocentric_cis_lunar`<br>Transition: `smooth_orbital_travel` | Labels: `Earth rotates: day and night Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m05-1-param` (Earth rotates: day and night Parameter Explorer — selector `#module-05-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Earth rotates: day and night (act_05_eclipse_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 05.2 — Earth's orbit and the seasons (`lesson-2-earths-orbit-and-seasons`)

- **Storyboard ID**: `sb-m05-lesson-2-earths-orbit-and-seasons`
- **Scientific Representation**: `SCALE_ADJUSTED_EDUCATIONAL_MODEL` — *Earth and Moon radii scaled for simultaneous visibility alongside the 5.145° inclined lunar orbit; 1:1 scale toggle supported.*
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `geocentric_cis_lunar` | `planetary_orbital_shot` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Earth's orbit and the seasons within Earth, Moon & Eclipses.
  2. Seasons result from two factors caused by tilt: (1) Sun angle (direct vs. oblique rays) and (2) Day length (longer daylight delivers more so
- **Mapped Narration Segments (5)**: `05-lesson-2-earths-orbit-and-seasons-title`, `05-lesson-2-earths-orbit-and-seasons-takeaway-1`, `05-lesson-2-earths-orbit-and-seasons-deepDive-1`, `05-lesson-2-earths-orbit-and-seasons-didYouKnow-1`, `05-lesson-2-earths-orbit-and-seasons-mathOrAnalogy-1`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m05-lesson-2-earths-orbit-and-seasons-beat-1`**<br>*Earth's orbit and the seasons — Primary Physical Mechanism* | `05-lesson-2-earths-orbit-and-seasons-title`<br>`05-lesson-2-earths-orbit-and-seasons-takeaway-1`<br>`05-lesson-2-earths-orbit-and-seasons-deepDive-1` | Earth's orbit and the seasons Seasons result from two factors caused by tilt: (1) Sun angle (direct vs. oblique rays) and (2) Day length (longer daylight delivers more solar energy). 0167. 1 million km from the Sun. 3% distance variation. 44° axial tilt. | `planetary_orbital_shot` in `geocentric_cis_lunar`<br>Transition: `smooth_orbital_travel` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m05-lesson-2-earths-orbit-and-seasons-beat-2`**<br>*Earth's orbit and the seasons — Quantitative Analysis & Interactive Synthesis* | `05-lesson-2-earths-orbit-and-seasons-didYouKnow-1`<br>`05-lesson-2-earths-orbit-and-seasons-mathOrAnalogy-1` | Above the Arctic Circle (66.5° N), the Sun does not set at all during the June solstice (the famous 'Midnight Sun')! Six months later in December, the Sun does not rise above the horizon for weeks ('Polar Night'). Solar beam spreading: Sunlight striking the gr | `scientific_cross_section` in `geocentric_cis_lunar`<br>Transition: `smooth_orbital_travel` | Labels: `Earth's orbit and the seasons Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m05-2-param` (Earth's orbit and the seasons Parameter Explorer — selector `#module-05-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Earth's orbit and the seasons (act_05_eclipse_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 05.3 — Why the Moon changes appearance (`lesson-3-why-the-moon-changes-appearance`)

- **Storyboard ID**: `sb-m05-lesson-3-why-the-moon-changes-appearance`
- **Scientific Representation**: `SCALE_ADJUSTED_EDUCATIONAL_MODEL` — *Earth and Moon radii scaled for simultaneous visibility alongside the 5.145° inclined lunar orbit; 1:1 scale toggle supported.*
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `geocentric_cis_lunar` | `planetary_orbital_shot` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Why the Moon changes appearance within Earth, Moon & Eclipses.
  2. Lunar phases are NOT caused by Earth's shadow! (Earth's shadow only touches the Moon during a lunar eclipse once or twice a year).
- **Mapped Narration Segments (6)**: `05-lesson-3-why-the-moon-changes-appearance-title`, `05-lesson-3-why-the-moon-changes-appearance-takeaway-1`, `05-lesson-3-why-the-moon-changes-appearance-deepDive-1`, `05-lesson-3-why-the-moon-changes-appearance-deepDive-2`, `05-lesson-3-why-the-moon-changes-appearance-didYouKnow-1`, `05-lesson-3-why-the-moon-changes-appearance-mathOrAnalogy-1`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m05-lesson-3-why-the-moon-changes-appearance-beat-1`**<br>*Why the Moon changes appearance — Primary Physical Mechanism* | `05-lesson-3-why-the-moon-changes-appearance-title`<br>`05-lesson-3-why-the-moon-changes-appearance-takeaway-1`<br>`05-lesson-3-why-the-moon-changes-appearance-deepDive-1` | Why the Moon changes appearance Lunar phases are NOT caused by Earth's shadow! (Earth's shadow only touches the Moon during a lunar eclipse once or twice a year). 5 days relative to the Sun, the angle between the Sun, Earth, and Moon (the phase angle α) contin | `planetary_orbital_shot` in `geocentric_cis_lunar`<br>Transition: `smooth_orbital_travel` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m05-lesson-3-why-the-moon-changes-appearance-beat-2`**<br>*Why the Moon changes appearance — Quantitative Analysis & Interactive Synthesis* | `05-lesson-3-why-the-moon-changes-appearance-deepDive-2`<br>`05-lesson-3-why-the-moon-changes-appearance-didYouKnow-1`<br>`05-lesson-3-why-the-moon-changes-appearance-mathOrAnalogy-1` | 0 (0%). The Moon is in 'tidal locking' (synchronous rotation) with Earth. 3 days). This is why Earthlings always see the same face—humanity never saw the lunar farside until Soviet spacecraft Luna 3 photographed it in 1959! Illuminated fraction equation: k = ( | `planetary_orbital_shot` in `geocentric_cis_lunar`<br>Transition: `smooth_orbital_travel` | Labels: `Why the Moon changes appearance Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m05-3-param` (Why the Moon changes appearance Parameter Explorer — selector `#module-05-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Why the Moon changes appearance (act_05_eclipse_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 05.4 — Lunar phases: from New Moon to Full Moon (`lesson-4-lunar-phases`)

- **Storyboard ID**: `sb-m05-lesson-4-lunar-phases`
- **Scientific Representation**: `SCALE_ADJUSTED_EDUCATIONAL_MODEL` — *Earth and Moon radii scaled for simultaneous visibility alongside the 5.145° inclined lunar orbit; 1:1 scale toggle supported.*
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `geocentric_cis_lunar` | `planetary_orbital_shot` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Lunar phases: from New Moon to Full Moon within Earth, Moon & Eclipses.
  2. Key phases: New Moon (0°), Waxing Crescent (45°), First Quarter (90°), Waxing Gibbous (135°), Full Moon (180°), Waning Gibbous (225°), Third
- **Mapped Narration Segments (7)**: `05-lesson-4-lunar-phases-title`, `05-lesson-4-lunar-phases-takeaway-1`, `05-lesson-4-lunar-phases-deepDive-1`, `05-lesson-4-lunar-phases-deepDive-2`, `05-lesson-4-lunar-phases-didYouKnow-1`, `05-lesson-4-lunar-phases-didYouKnow-2`, `05-lesson-4-lunar-phases-mathOrAnalogy-1`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m05-lesson-4-lunar-phases-beat-1`**<br>*Lunar phases: from New Moon to Full Moon — Primary Physical Mechanism* | `05-lesson-4-lunar-phases-title`<br>`05-lesson-4-lunar-phases-takeaway-1`<br>`05-lesson-4-lunar-phases-deepDive-1`<br>`05-lesson-4-lunar-phases-deepDive-2` | Lunar phases: from New Moon to Full Moon Key phases: New Moon (0°), Waxing Crescent (45°), First Quarter (90°), Waxing Gibbous (135°), Full Moon (180°), Waning Gibbous (225°), Third Quarter (270°), Waning Crescent (315°). Rise and set times are locked directly | `planetary_orbital_shot` in `geocentric_cis_lunar`<br>Transition: `smooth_orbital_travel` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m05-lesson-4-lunar-phases-beat-2`**<br>*Lunar phases: from New Moon to Full Moon — Quantitative Analysis & Interactive Synthesis* | `05-lesson-4-lunar-phases-didYouKnow-1`<br>`05-lesson-4-lunar-phases-didYouKnow-2`<br>`05-lesson-4-lunar-phases-mathOrAnalogy-1` | When the Moon is a thin crescent, you can often see the dark rest of the Moon glowing with an eerie ghostly gray light. Leonardo da Vinci first correctly explained this in the 1500s: it is 'earthshine'—sunlight reflecting off Earth's oceans and clouds onto the | `scientific_cross_section` in `geocentric_cis_lunar`<br>Transition: `smooth_orbital_travel` | Labels: `Lunar phases: from New Moon to Full Moon Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m05-4-param` (Lunar phases: from New Moon to Full Moon Parameter Explorer — selector `#module-05-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Lunar phases: from New Moon to Full Moon (act_05_eclipse_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 05.5 — Solar eclipses: when the Moon blocks the Sun (`lesson-5-solar-eclipses`)

- **Storyboard ID**: `sb-m05-lesson-5-solar-eclipses`
- **Scientific Representation**: `SCALE_ADJUSTED_EDUCATIONAL_MODEL` — *Earth and Moon radii scaled for simultaneous visibility alongside the 5.145° inclined lunar orbit; 1:1 scale toggle supported.*
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `geocentric_cis_lunar` | `planetary_orbital_shot` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Solar eclipses: when the Moon blocks the Sun within Earth, Moon & Eclipses.
  2. Total solar eclipse: observer is in the umbra (Sun 100% blocked, solar corona visible). Partial eclipse: observer is in the penumbra. Annula
- **Mapped Narration Segments (6)**: `05-lesson-5-solar-eclipses-title`, `05-lesson-5-solar-eclipses-takeaway-1`, `05-lesson-5-solar-eclipses-deepDive-1`, `05-lesson-5-solar-eclipses-deepDive-2`, `05-lesson-5-solar-eclipses-didYouKnow-1`, `05-lesson-5-solar-eclipses-mathOrAnalogy-1`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m05-lesson-5-solar-eclipses-beat-1`**<br>*Solar eclipses: when the Moon blocks the Sun — Primary Physical Mechanism* | `05-lesson-5-solar-eclipses-title`<br>`05-lesson-5-solar-eclipses-takeaway-1`<br>`05-lesson-5-solar-eclipses-deepDive-1` | Solar eclipses: when the Moon blocks the Sun Total solar eclipse: observer is in the umbra (Sun 100% blocked, solar corona visible). Partial eclipse: observer is in the penumbra. Annular eclipse: Moon is near apogee, leaving a 'ring of fire'. The Moon's umbra  | `planetary_orbital_shot` in `geocentric_cis_lunar`<br>Transition: `smooth_orbital_travel` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m05-lesson-5-solar-eclipses-beat-2`**<br>*Solar eclipses: when the Moon blocks the Sun — Quantitative Analysis & Interactive Synthesis* | `05-lesson-5-solar-eclipses-deepDive-2`<br>`05-lesson-5-solar-eclipses-didYouKnow-1`<br>`05-lesson-5-solar-eclipses-mathOrAnalogy-1` | 5 minutes of daytime darkness, an eerie 10°F temperature drop, strange 360° sunset colors around the horizon, and the emergence of the ethereal pearly-white solar corona. Because tidal friction is slowly boosting the Moon into a higher orbit (~3.8 cm per year) | `planetary_orbital_shot` in `geocentric_cis_lunar`<br>Transition: `smooth_orbital_travel` | Labels: `Solar eclipses: when the Moon blocks the Sun Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m05-5-param` (Solar eclipses: when the Moon blocks the Sun Parameter Explorer — selector `#module-05-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Solar eclipses: when the Moon blocks the Sun (act_05_eclipse_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 05.6 — Lunar eclipses: Earth's shadow on the Moon (`lesson-6-lunar-eclipses`)

- **Storyboard ID**: `sb-m05-lesson-6-lunar-eclipses`
- **Scientific Representation**: `SCALE_ADJUSTED_EDUCATIONAL_MODEL` — *Earth and Moon radii scaled for simultaneous visibility alongside the 5.145° inclined lunar orbit; 1:1 scale toggle supported.*
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `geocentric_cis_lunar` | `planetary_orbital_shot` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Lunar eclipses: Earth's shadow on the Moon within Earth, Moon & Eclipses.
  2. Rayleigh scattering in Earth's atmosphere filters out blue light and bends reddish light into the shadow cone, painting the eclipsed Moon a 
- **Mapped Narration Segments (6)**: `05-lesson-6-lunar-eclipses-title`, `05-lesson-6-lunar-eclipses-takeaway-1`, `05-lesson-6-lunar-eclipses-deepDive-1`, `05-lesson-6-lunar-eclipses-deepDive-2`, `05-lesson-6-lunar-eclipses-didYouKnow-1`, `05-lesson-6-lunar-eclipses-mathOrAnalogy-1`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m05-lesson-6-lunar-eclipses-beat-1`**<br>*Lunar eclipses: Earth's shadow on the Moon — Primary Physical Mechanism* | `05-lesson-6-lunar-eclipses-title`<br>`05-lesson-6-lunar-eclipses-takeaway-1`<br>`05-lesson-6-lunar-eclipses-deepDive-1` | Lunar eclipses: Earth's shadow on the Moon Rayleigh scattering in Earth's atmosphere filters out blue light and bends reddish light into the shadow cone, painting the eclipsed Moon a deep copper-red color. A total lunar eclipse can last over 1 hour and 40 minu | `planetary_orbital_shot` in `geocentric_cis_lunar`<br>Transition: `smooth_orbital_travel` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m05-lesson-6-lunar-eclipses-beat-2`**<br>*Lunar eclipses: Earth's shadow on the Moon — Quantitative Analysis & Interactive Synthesis* | `05-lesson-6-lunar-eclipses-deepDive-2`<br>`05-lesson-6-lunar-eclipses-didYouKnow-1`<br>`05-lesson-6-lunar-eclipses-mathOrAnalogy-1` | Lunar eclipses are completely safe to view with the naked eye, binoculars, or telescopes without any filters. In 1504, Christopher Columbus was stranded in Jamaica and used his German astronomical almanac to predict a total lunar eclipse, frightening the local | `scientific_cross_section` in `geocentric_cis_lunar`<br>Transition: `smooth_orbital_travel` | Labels: `Lunar eclipses: Earth's shadow on the Moon Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m05-6-param` (Lunar eclipses: Earth's shadow on the Moon Parameter Explorer — selector `#module-05-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Lunar eclipses: Earth's shadow on the Moon (act_05_eclipse_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 05.7 — Tides and gravitational interactions (`lesson-7-tides-and-gravity`)

- **Storyboard ID**: `sb-m05-lesson-7-tides-and-gravity`
- **Scientific Representation**: `SCALE_ADJUSTED_EDUCATIONAL_MODEL` — *Earth and Moon radii scaled for simultaneous visibility alongside the 5.145° inclined lunar orbit; 1:1 scale toggle supported.*
- **Interactivity Mode**: `REQUIRED_LEARNING_ACTIVITY`
- **Coordinate Frame & Camera Preset**: `geocentric_cis_lunar` | `planetary_orbital_shot` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Tides and gravitational interactions within Earth, Moon & Eclipses.
  2. Spring tides (highest high tides) occur when Sun and Moon align at New and Full Moon. Neap tides (weakest tides) occur when Moon is at 90° r
- **Mapped Narration Segments (5)**: `05-lesson-7-tides-and-gravity-title`, `05-lesson-7-tides-and-gravity-takeaway-1`, `05-lesson-7-tides-and-gravity-deepDive-1`, `05-lesson-7-tides-and-gravity-didYouKnow-1`, `05-lesson-7-tides-and-gravity-mathOrAnalogy-1`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m05-lesson-7-tides-and-gravity-beat-1`**<br>*Tides and gravitational interactions — Primary Physical Mechanism* | `05-lesson-7-tides-and-gravity-title`<br>`05-lesson-7-tides-and-gravity-takeaway-1`<br>`05-lesson-7-tides-and-gravity-deepDive-1` | Tides and gravitational interactions Spring tides (highest high tides) occur when Sun and Moon align at New and Full Moon. Neap tides (weakest tides) occur when Moon is at 90° right angles (First and Third Quarter). 2 times STRONGER than the Sun's! This is bec | `planetary_orbital_shot` in `geocentric_cis_lunar`<br>Transition: `smooth_orbital_travel` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m05-lesson-7-tides-and-gravity-beat-2`**<br>*Tides and gravitational interactions — Quantitative Analysis & Interactive Synthesis* | `05-lesson-7-tides-and-gravity-didYouKnow-1`<br>`05-lesson-7-tides-and-gravity-mathOrAnalogy-1` | Tides don't just affect water—they affect solid rock too! Earth's rocky crust actually rises and falls by up to 30 centimeters (1 foot) twice every day under the Moon's tidal pull ('Earth tides'). Tidal cycle timing: Because the Moon advances in its orbit whil | `data_visualization_view` in `geocentric_cis_lunar`<br>Transition: `observational_data_reveal` | Labels: `Tides and gravitational interactions Telemetry`<br>Gate: `REQUIRED_LEARNING_ACTIVITY` (Requires `act_05_seasons_eclipse_sim`) |

- **Interactive Controls**: `ctrl-m05-7-param` (Tides and gravitational interactions Parameter Explorer — selector `#module-05-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Tides and gravitational interactions (act_05_eclipse_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---
