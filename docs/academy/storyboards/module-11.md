# Module 11 Cinematic Storyboard — Nebulae & Star Clusters

- **Module ID**: `11` (`stageId: "stage-3-life-of-stars"`, Course: `"cosmic-journey"`)
- **Total Instructional Chapters (Sublessons)**: **8**
- **Total Mapped Narration Segments**: **63** (`explorer` canonical sequence; adapted across `junior`, `explorer`, `astronomer`)
- **Primary 3D Scene & Component**: `m11_nebula_and_clusters_3d` (`src/components/academy/Nebula3DExplorer.tsx`)
- **Visual Style & Lighting Preset**: `stage3_stellar_radiance` | `nebular_emissive` (`ACES Filmic`, `exposure: 1.05`, `bloomThreshold: 0.80`)
- **Primary Interactive Activity Gate**: `act_11_star_nursery_collapse` — *Jeans Gravitational Collapse Lab* (Trigger gravitational collapse in molecular cloud by satisfying Jeans mass criteria.)
- **Scientific References**: NASA James Webb Space Telescope: Pillars of Creation & Star Birth (NASA / STScI - https://webbtelescope.org/contents/media/images/2022/052/01GF423GBQSK6ANC89NTFJW8VM); ESA Hubble Space Telescope: The Science of Astronomical Colors & Nebulae (ESA - https://hubblesite.org/science/stars-and-nebulae); Chandra X-Ray Observatory: Supernova Remnants & Multiwavelength Composites (NASA Chandra - https://chandra.harvard.edu/photo/category/snr.html); ALMA Observatory: Cold Gas, Dust Grains, and Protoplanetary Disks (ESO / ALMA - https://www.almaobservatory.org/en/about-alma/science-with-alma/)

---

## Chapter 11.1 — What is Interstellar Gas and Dust? (`sub-01`)

- **Storyboard ID**: `sb-m11-sub-01`
- **Scientific Representation**: `OBSERVATION_BASED`
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `galactocentric_kpc` | `deep_space_flythrough` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of What is Interstellar Gas and Dust? within Nebulae & Star Clusters.
  2. The Interstellar Medium (ISM) is 99% gas and 1% microscopic dust by mass
- **Mapped Narration Segments (8)**: `11-sub-01-title`, `11-sub-01-concept-1`, `11-sub-01-concept-2`, `11-sub-01-concept-3`, `11-sub-01-summary-1`, `11-sub-01-explanation-1`, `11-sub-01-explanation-2`, `11-sub-01-didYouKnow`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m11-sub-01-beat-1`**<br>*What is Interstellar Gas and Dust? — Primary Physical Mechanism* | `11-sub-01-title`<br>`11-sub-01-concept-1`<br>`11-sub-01-concept-2`<br>`11-sub-01-concept-3` | What is Interstellar Gas and Dust? The Interstellar Medium (ISM) is 99% gas and 1% microscopic dust by mass Dust grains are microscopic flakes of carbon, graphite, and silicates Interstellar dust causes 'extinction' (dimming) and 'reddening' of starlight | `deep_space_flythrough` in `galactocentric_kpc`<br>Transition: `observational_data_reveal` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m11-sub-01-beat-2`**<br>*What is Interstellar Gas and Dust? — Quantitative Analysis & Interactive Synthesis* | `11-sub-01-summary-1`<br>`11-sub-01-explanation-1`<br>`11-sub-01-explanation-2`<br>`11-sub-01-didYouKnow` | The thin material filling the vast gulfs between stars forms the fundamental raw material for future solar systems. Between the stars lies the Interstellar Medium (ISM). For every 100 grams of material in the ISM, about 99 grams is gas (mostly hydrogen and hel | `planetary_orbital_shot` in `galactocentric_kpc`<br>Transition: `smooth_orbital_travel` | Labels: `What is Interstellar Gas and Dust? Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m11-1-param` (What is Interstellar Gas and Dust? Parameter Explorer — selector `#module-11-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for What is Interstellar Gas and Dust? (act_11_jeans_calculator).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 11.2 — Emission Nebulae: Glowing Stellar Nurseries (`sub-02`)

- **Storyboard ID**: `sb-m11-sub-02`
- **Scientific Representation**: `OBSERVATION_BASED`
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `galactocentric_kpc` | `deep_space_flythrough` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Emission Nebulae: Glowing Stellar Nurseries within Nebulae & Star Clusters.
  2. Also known as H II regions (ionized hydrogen clouds)
- **Mapped Narration Segments (7)**: `11-sub-02-title`, `11-sub-02-concept-1`, `11-sub-02-concept-2`, `11-sub-02-concept-3`, `11-sub-02-summary-1`, `11-sub-02-explanation-1`, `11-sub-02-didYouKnow`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m11-sub-02-beat-1`**<br>*Emission Nebulae: Glowing Stellar Nurseries — Primary Physical Mechanism* | `11-sub-02-title`<br>`11-sub-02-concept-1`<br>`11-sub-02-concept-2`<br>`11-sub-02-concept-3` | Emission Nebulae: Glowing Stellar Nurseries Also known as H II regions (ionized hydrogen clouds) Ultraviolet radiation strips electrons from hydrogen atoms; when electrons recombine, they emit light The famous red color comes from the Hydrogen-alpha line at 65 | `deep_space_flythrough` in `galactocentric_kpc`<br>Transition: `observational_data_reveal` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m11-sub-02-beat-2`**<br>*Emission Nebulae: Glowing Stellar Nurseries — Quantitative Analysis & Interactive Synthesis* | `11-sub-02-summary-1`<br>`11-sub-02-explanation-1`<br>`11-sub-02-didYouKnow` | High-energy ultraviolet photons from newborn hot stars ionize hydrogen gas, causing it to glow with fluorescent light. An emission nebula is energized by blazing O- and B-type stars with surface temperatures over 25,000 Kelvin. High-energy UV photons knock ele | `scientific_cross_section` in `galactocentric_kpc`<br>Transition: `smooth_orbital_travel` | Labels: `Emission Nebulae: Glowing Stellar Nurseries Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m11-2-param` (Emission Nebulae: Glowing Stellar Nurseries Parameter Explorer — selector `#module-11-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Emission Nebulae: Glowing Stellar Nurseries (act_11_jeans_calculator).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 11.3 — Reflection Nebulae: Scattered Starlight (`sub-03`)

- **Storyboard ID**: `sb-m11-sub-03`
- **Scientific Representation**: `OBSERVATION_BASED`
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `galactocentric_kpc` | `deep_space_flythrough` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Reflection Nebulae: Scattered Starlight within Nebulae & Star Clusters.
  2. Microscopic silicate and carbon dust grains scatter blue light much better than red light
- **Mapped Narration Segments (8)**: `11-sub-03-title`, `11-sub-03-concept-1`, `11-sub-03-concept-2`, `11-sub-03-concept-3`, `11-sub-03-summary-1`, `11-sub-03-explanation-1`, `11-sub-03-explanation-2`, `11-sub-03-didYouKnow`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m11-sub-03-beat-1`**<br>*Reflection Nebulae: Scattered Starlight — Primary Physical Mechanism* | `11-sub-03-title`<br>`11-sub-03-concept-1`<br>`11-sub-03-concept-2`<br>`11-sub-03-concept-3` | Reflection Nebulae: Scattered Starlight Microscopic silicate and carbon dust grains scatter blue light much better than red light Known as Rayleigh scattering (scattering intensity is proportional to 1 / wavelength^4) Unlike emission nebulae, reflection nebula | `deep_space_flythrough` in `galactocentric_kpc`<br>Transition: `observational_data_reveal` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m11-sub-03-beat-2`**<br>*Reflection Nebulae: Scattered Starlight — Quantitative Analysis & Interactive Synthesis* | `11-sub-03-summary-1`<br>`11-sub-03-explanation-1`<br>`11-sub-03-explanation-2`<br>`11-sub-03-didYouKnow` | Interstellar dust grains scatter and reflect the light of nearby stars, producing a characteristic celestial blue haze. When a cloud of dust is near a star that isn't hot enough to ionize gas into an emission nebula (like a B-type star with T < 20,000 K), the  | `planetary_orbital_shot` in `galactocentric_kpc`<br>Transition: `smooth_orbital_travel` | Labels: `Reflection Nebulae: Scattered Starlight Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m11-3-param` (Reflection Nebulae: Scattered Starlight Parameter Explorer — selector `#module-11-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Reflection Nebulae: Scattered Starlight (act_11_jeans_calculator).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 11.4 — Dark Nebulae: The Cold Silhouettes of Creation (`sub-04`)

- **Storyboard ID**: `sb-m11-sub-04`
- **Scientific Representation**: `OBSERVATION_BASED`
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `galactocentric_kpc` | `deep_space_flythrough` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Dark Nebulae: The Cold Silhouettes of Creation within Nebulae & Star Clusters.
  2. Bok globules are dense pockets of cold molecular gas and dust (temperatures as low as 10 Kelvin)
- **Mapped Narration Segments (8)**: `11-sub-04-title`, `11-sub-04-concept-1`, `11-sub-04-concept-2`, `11-sub-04-concept-3`, `11-sub-04-summary-1`, `11-sub-04-explanation-1`, `11-sub-04-explanation-2`, `11-sub-04-didYouKnow`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m11-sub-04-beat-1`**<br>*Dark Nebulae: The Cold Silhouettes of Creation — Primary Physical Mechanism* | `11-sub-04-title`<br>`11-sub-04-concept-1`<br>`11-sub-04-concept-2`<br>`11-sub-04-concept-3` | Dark Nebulae: The Cold Silhouettes of Creation Bok globules are dense pockets of cold molecular gas and dust (temperatures as low as 10 Kelvin) They block visible light, but infrared telescopes like Webb can see right through them! Inside these dark shadows, g | `deep_space_flythrough` in `galactocentric_kpc`<br>Transition: `observational_data_reveal` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m11-sub-04-beat-2`**<br>*Dark Nebulae: The Cold Silhouettes of Creation — Quantitative Analysis & Interactive Synthesis* | `11-sub-04-summary-1`<br>`11-sub-04-explanation-1`<br>`11-sub-04-explanation-2`<br>`11-sub-04-didYouKnow` | Dense, freezing molecular clouds absorb all background visible light, appearing as silhouettes where new stars coalesce. Early astronomers thought dark nebulae were empty voids in the cosmos. E. Barnard cataloged hundreds of them and proved they were actually  | `scientific_cross_section` in `galactocentric_kpc`<br>Transition: `smooth_orbital_travel` | Labels: `Dark Nebulae: The Cold Silhouettes of Creation Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m11-4-param` (Dark Nebulae: The Cold Silhouettes of Creation Parameter Explorer — selector `#module-11-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Dark Nebulae: The Cold Silhouettes of Creation (act_11_jeans_calculator).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 11.5 — Planetary Nebulae: The Legacy of Sun-like Stars (`sub-05`)

- **Storyboard ID**: `sb-m11-sub-05`
- **Scientific Representation**: `OBSERVATION_BASED`
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `galactocentric_kpc` | `deep_space_flythrough` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Planetary Nebulae: The Legacy of Sun-like Stars within Nebulae & Star Clusters.
  2. When a Sun-like star exhausts its fuel, thermal pulses blow away its outer atmosphere
- **Mapped Narration Segments (8)**: `11-sub-05-title`, `11-sub-05-concept-1`, `11-sub-05-concept-2`, `11-sub-05-concept-3`, `11-sub-05-summary-1`, `11-sub-05-explanation-1`, `11-sub-05-explanation-2`, `11-sub-05-didYouKnow`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m11-sub-05-beat-1`**<br>*Planetary Nebulae: The Legacy of Sun-like Stars — Primary Physical Mechanism* | `11-sub-05-title`<br>`11-sub-05-concept-1`<br>`11-sub-05-concept-2`<br>`11-sub-05-concept-3` | Planetary Nebulae: The Legacy of Sun-like Stars When a Sun-like star exhausts its fuel, thermal pulses blow away its outer atmosphere The remaining hot carbon-oxygen core illuminates the expanding gas bubble for ~20,000 years The Ring Nebula and Helix Nebula a | `deep_space_flythrough` in `galactocentric_kpc`<br>Transition: `observational_data_reveal` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m11-sub-05-beat-2`**<br>*Planetary Nebulae: The Legacy of Sun-like Stars — Quantitative Analysis & Interactive Synthesis* | `11-sub-05-summary-1`<br>`11-sub-05-explanation-1`<br>`11-sub-05-explanation-2`<br>`11-sub-05-didYouKnow` | Expanding shells of glowing gas ejected by dying low-to-intermediate mass stars as they transition to white dwarfs. When a star with less than 8 times the Sun's mass reaches the end of its life, it cannot fuse carbon. Instead, violent thermal pulsations blow i | `planetary_orbital_shot` in `galactocentric_kpc`<br>Transition: `smooth_orbital_travel` | Labels: `Planetary Nebulae: The Legacy of Sun-like Stars Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m11-5-param` (Planetary Nebulae: The Legacy of Sun-like Stars Parameter Explorer — selector `#module-11-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Planetary Nebulae: The Legacy of Sun-like Stars (act_11_jeans_calculator).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 11.6 — Supernova Remnants: Relativistic Shockwaves (`sub-06`)

- **Storyboard ID**: `sb-m11-sub-06`
- **Scientific Representation**: `OBSERVATION_BASED`
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `galactocentric_kpc` | `deep_space_flythrough` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Supernova Remnants: Relativistic Shockwaves within Nebulae & Star Clusters.
  2. Created when a star with over 8 solar masses suffers iron core collapse
- **Mapped Narration Segments (8)**: `11-sub-06-title`, `11-sub-06-concept-1`, `11-sub-06-concept-2`, `11-sub-06-concept-3`, `11-sub-06-summary-1`, `11-sub-06-explanation-1`, `11-sub-06-explanation-2`, `11-sub-06-didYouKnow`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m11-sub-06-beat-1`**<br>*Supernova Remnants: Relativistic Shockwaves — Primary Physical Mechanism* | `11-sub-06-title`<br>`11-sub-06-concept-1`<br>`11-sub-06-concept-2`<br>`11-sub-06-concept-3` | Supernova Remnants: Relativistic Shockwaves Created when a star with over 8 solar masses suffers iron core collapse A high-velocity blast wave slams into surrounding gas, heating it to millions of degrees In the center often sits an ultra-dense, spinning pulsa | `deep_space_flythrough` in `galactocentric_kpc`<br>Transition: `observational_data_reveal` | Labels: `supernova`<br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m11-sub-06-beat-2`**<br>*Supernova Remnants: Relativistic Shockwaves — Quantitative Analysis & Interactive Synthesis* | `11-sub-06-summary-1`<br>`11-sub-06-explanation-1`<br>`11-sub-06-explanation-2`<br>`11-sub-06-didYouKnow` | Violent expanding debris fields created by catastrophic core-collapse explosions of massive stars. Unlike the gentle expansion of planetary nebulae, supernova remnants are violent cosmic accelerators. The explosion unleashes 10^51 ergs of energy, driving a sup | `scientific_cross_section` in `galactocentric_kpc`<br>Transition: `smooth_orbital_travel` | Labels: `Supernova Remnants: Relativistic Shockwaves Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m11-6-param` (Supernova Remnants: Relativistic Shockwaves Parameter Explorer — selector `#module-11-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Supernova Remnants: Relativistic Shockwaves (act_11_jeans_calculator).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 11.7 — Open Star Clusters: Young Galactic Families (`sub-07`)

- **Storyboard ID**: `sb-m11-sub-07`
- **Scientific Representation**: `OBSERVATION_BASED`
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `galactocentric_kpc` | `deep_space_flythrough` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Open Star Clusters: Young Galactic Families within Nebulae & Star Clusters.
  2. Contain between a few dozen and a few thousand stars bound loosely by gravity
- **Mapped Narration Segments (8)**: `11-sub-07-title`, `11-sub-07-concept-1`, `11-sub-07-concept-2`, `11-sub-07-concept-3`, `11-sub-07-summary-1`, `11-sub-07-explanation-1`, `11-sub-07-explanation-2`, `11-sub-07-didYouKnow`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m11-sub-07-beat-1`**<br>*Open Star Clusters: Young Galactic Families — Primary Physical Mechanism* | `11-sub-07-title`<br>`11-sub-07-concept-1`<br>`11-sub-07-concept-2`<br>`11-sub-07-concept-3` | Open Star Clusters: Young Galactic Families Contain between a few dozen and a few thousand stars bound loosely by gravity Located in the spiral arms of the Milky Way galaxy disk Over hundreds of millions of years, galactic gravitational tides gradually pull th | `deep_space_flythrough` in `galactocentric_kpc`<br>Transition: `observational_data_reveal` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m11-sub-07-beat-2`**<br>*Open Star Clusters: Young Galactic Families — Quantitative Analysis & Interactive Synthesis* | `11-sub-07-summary-1`<br>`11-sub-07-explanation-1`<br>`11-sub-07-explanation-2`<br>`11-sub-07-didYouKnow` | Loose, gravitationally fragile groups of up to a few thousand young stars born together in the Milky Way's spiral disk. Open star clusters typically contain several hundred to a few thousand stars that condensed from the same molecular cloud at the exact same  | `planetary_orbital_shot` in `galactocentric_kpc`<br>Transition: `smooth_orbital_travel` | Labels: `Open Star Clusters: Young Galactic Families Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m11-7-param` (Open Star Clusters: Young Galactic Families Parameter Explorer — selector `#module-11-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Open Star Clusters: Young Galactic Families (act_11_jeans_calculator).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 11.8 — Globular Star Clusters: Ancient Galactic Swarms (`sub-08`)

- **Storyboard ID**: `sb-m11-sub-08`
- **Scientific Representation**: `OBSERVATION_BASED`
- **Interactivity Mode**: `REQUIRED_LEARNING_ACTIVITY`
- **Coordinate Frame & Camera Preset**: `galactocentric_kpc` | `deep_space_flythrough` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Globular Star Clusters: Ancient Galactic Swarms within Nebulae & Star Clusters.
  2. Spherical swarms containing 100,000 to over 1,000,000 ancient stars tightly bound by gravity
- **Mapped Narration Segments (8)**: `11-sub-08-title`, `11-sub-08-concept-1`, `11-sub-08-concept-2`, `11-sub-08-concept-3`, `11-sub-08-summary-1`, `11-sub-08-explanation-1`, `11-sub-08-explanation-2`, `11-sub-08-didYouKnow`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m11-sub-08-beat-1`**<br>*Globular Star Clusters: Ancient Galactic Swarms — Primary Physical Mechanism* | `11-sub-08-title`<br>`11-sub-08-concept-1`<br>`11-sub-08-concept-2`<br>`11-sub-08-concept-3` | Globular Star Clusters: Ancient Galactic Swarms Spherical swarms containing 100,000 to over 1,000,000 ancient stars tightly bound by gravity Orbit in the spherical halo above and below the Milky Way disk All their massive blue stars died billions of years ago, | `deep_space_flythrough` in `galactocentric_kpc`<br>Transition: `observational_data_reveal` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m11-sub-08-beat-2`**<br>*Globular Star Clusters: Ancient Galactic Swarms — Quantitative Analysis & Interactive Synthesis* | `11-sub-08-summary-1`<br>`11-sub-08-explanation-1`<br>`11-sub-08-explanation-2`<br>`11-sub-08-didYouKnow` | Densely packed spherical swarms of hundreds of thousands of ancient stars orbiting in the Milky Way's outer halo. Globular clusters are cosmic fossils from the dawn of our galaxy. Formed over 11 billion years ago, they orbit outside the Milky Way's flat spiral | `data_visualization_view` in `galactocentric_kpc`<br>Transition: `observational_data_reveal` | Labels: `Globular Star Clusters: Ancient Galactic Swarms Telemetry`<br>Gate: `REQUIRED_LEARNING_ACTIVITY` (Requires `act_11_star_nursery_collapse`) |

- **Interactive Controls**: `ctrl-m11-8-param` (Globular Star Clusters: Ancient Galactic Swarms Parameter Explorer — selector `#module-11-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Globular Star Clusters: Ancient Galactic Swarms (act_11_jeans_calculator).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---
