# Module 16 Cinematic Storyboard — Dark Matter & Dark Energy

- **Module ID**: `16` (`stageId: "stage-4-galaxies-extreme-objects"`, Course: `"cosmic-journey"`)
- **Total Instructional Chapters (Sublessons)**: **9**
- **Total Mapped Narration Segments**: **53** (`explorer` canonical sequence; adapted across `junior`, `explorer`, `astronomer`)
- **Primary 3D Scene & Component**: `m16_dark_sector_lensing_3d` (`src/components/academy/DarkMatterRotationLab.tsx (Upgrading to DarkSectorVisualizer3D.tsx)`)
- **Visual Style & Lighting Preset**: `stage4_relativistic_gravity` | `cosmological_ambient` (`ACES Filmic`, `exposure: 1.05`, `bloomThreshold: 0.80`)
- **Primary Interactive Activity Gate**: `act_16_dark_matter_rotation_lab` — *Galaxy Rotation Curve Decomposition Lab* (Deconstruct observed vs Keplerian rotation curves by tuning dark matter halo mass.)
- **Scientific References**: Rubin & Ford (1970) Rotation of the Andromeda Nebula from a Spectroscopic Survey (Astrophysical Journal (ApJ 159, 379) - https://ui.adsabs.harvard.edu/abs/1970ApJ...159..379R); Perlmutter et al. (1999) Measurements of Omega and Lambda from 42 High-Redshift Supernovae (The Supernova Cosmology Project / Astrophysical Journal - https://ui.adsabs.harvard.edu/abs/1999ApJ...517..565P); Riess et al. (1998) Observational Evidence from Supernovae for an Accelerating Universe (High-Z Supernova Search Team / Astronomical Journal - https://ui.adsabs.harvard.edu/abs/1998AJ....116.1009R); Clowe et al. (2006) A Direct Empirical Proof of the Existence of Dark Matter (The Bullet Cluster) (Astrophysical Journal Letters (ApJL 648, L109) - https://ui.adsabs.harvard.edu/abs/2006ApJ...648L.109C); Planck Collaboration (2018) Planck 2018 Results. VI. Cosmological Parameters (Astronomy & Astrophysics (A&A 641, A6) - https://www.aanda.org/articles/aa/full_html/2020/09/aa33880-18/aa33880-18.html)

---

## Chapter 16.1 — Visible Matter & Invisible Mass (`sub-16-1-visible-invisible`)

- **Storyboard ID**: `sb-m16-sub-16-1-visible-invisible`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION` — *Dark matter halos rendered as translucent indigo gravitational potential contours inferred from rotation curves and lensing—not visible light.*
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `comoving_cosmological` | `data_visualization_view` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Visible Matter & Invisible Mass within Dark Matter & Dark Energy.
  2. When we look at the night sky, we see billions of shining stars, glowing gas clouds, and bright galaxies. But astronomers discovered a shock
- **Mapped Narration Segments (6)**: `16-sub-16-1-visible-invisible-title`, `16-sub-16-1-visible-invisible-lead-1`, `16-sub-16-1-visible-invisible-keyIdea-1`, `16-sub-16-1-visible-invisible-explanation-1`, `16-sub-16-1-visible-invisible-explanation-2`, `16-sub-16-1-visible-invisible-activityPrompt-1`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m16-sub-16-1-visible-invisible-beat-1`**<br>*Visible Matter & Invisible Mass — Primary Physical Mechanism* | `16-sub-16-1-visible-invisible-title`<br>`16-sub-16-1-visible-invisible-lead-1`<br>`16-sub-16-1-visible-invisible-keyIdea-1` | Visible Matter & Invisible Mass When we look at the night sky, we see billions of shining stars, glowing gas clouds, and bright galaxies. But astronomers discovered a shocking secret: everything we can see with our eyes and telescopes is only a tiny fraction o | `data_visualization_view` in `comoving_cosmological`<br>Transition: `observational_data_reveal` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m16-sub-16-1-visible-invisible-beat-2`**<br>*Visible Matter & Invisible Mass — Quantitative Analysis & Interactive Synthesis* | `16-sub-16-1-visible-invisible-explanation-1`<br>`16-sub-16-1-visible-invisible-explanation-2`<br>`16-sub-16-1-visible-invisible-activityPrompt-1` | Imagine walking into a library where only 1 out of every 20 books is visible on the shelves, while 19 out of 20 books are completely invisible yet heavy enough to make the floor bend. That is what our universe is like! Stars and planets exert gravitational pul | `planetary_orbital_shot` in `comoving_cosmological`<br>Transition: `smooth_orbital_travel` | Labels: `Visible Matter & Invisible Mass Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m16-1-param` (Visible Matter & Invisible Mass Parameter Explorer — selector `#module-16-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Visible Matter & Invisible Mass (act_16_rotation_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 16.2 — Evidence from Galaxy Rotation Curves (`sub-16-2-rotation-curves`)

- **Storyboard ID**: `sb-m16-sub-16-2-rotation-curves`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION` — *Dark matter halos rendered as translucent indigo gravitational potential contours inferred from rotation curves and lensing—not visible light.*
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `comoving_cosmological` | `data_visualization_view` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Evidence from Galaxy Rotation Curves within Dark Matter & Dark Energy.
  2. In our Solar System, planets far from the Sun travel much slower than inner planets: Mercury zips around in 88 days, while distant Neptune t
- **Mapped Narration Segments (6)**: `16-sub-16-2-rotation-curves-title`, `16-sub-16-2-rotation-curves-lead-1`, `16-sub-16-2-rotation-curves-keyIdea-1`, `16-sub-16-2-rotation-curves-explanation-1`, `16-sub-16-2-rotation-curves-explanation-2`, `16-sub-16-2-rotation-curves-activityPrompt-1`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m16-sub-16-2-rotation-curves-beat-1`**<br>*Evidence from Galaxy Rotation Curves — Primary Physical Mechanism* | `16-sub-16-2-rotation-curves-title`<br>`16-sub-16-2-rotation-curves-lead-1`<br>`16-sub-16-2-rotation-curves-keyIdea-1` | Evidence from Galaxy Rotation Curves In our Solar System, planets far from the Sun travel much slower than inner planets: Mercury zips around in 88 days, while distant Neptune takes 165 years. Astronomers expected stars at the edge of galaxies to slow down too | `data_visualization_view` in `comoving_cosmological`<br>Transition: `observational_data_reveal` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m16-sub-16-2-rotation-curves-beat-2`**<br>*Evidence from Galaxy Rotation Curves — Quantitative Analysis & Interactive Synthesis* | `16-sub-16-2-rotation-curves-explanation-1`<br>`16-sub-16-2-rotation-curves-explanation-2`<br>`16-sub-16-2-rotation-curves-activityPrompt-1` | In the 1970s, pioneering astronomer Vera Rubin and Kent Ford measured the speeds of hydrogen gas clouds and stars orbiting far out in spiral galaxies like Andromeda. Instead of dropping off, the speed stayed flat! The only way those distant stars could stay bo | `scientific_cross_section` in `comoving_cosmological`<br>Transition: `smooth_orbital_travel` | Labels: `Evidence from Galaxy Rotation Curves Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m16-2-param` (Evidence from Galaxy Rotation Curves Parameter Explorer — selector `#module-16-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Evidence from Galaxy Rotation Curves (act_16_rotation_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 16.3 — Gravitational Lensing & The Bullet Cluster (`sub-16-3-gravitational-lensing`)

- **Storyboard ID**: `sb-m16-sub-16-3-gravitational-lensing`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION` — *Dark matter halos rendered as translucent indigo gravitational potential contours inferred from rotation curves and lensing—not visible light.*
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `comoving_cosmological` | `data_visualization_view` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Gravitational Lensing & The Bullet Cluster within Dark Matter & Dark Energy.
  2. Even though dark matter doesn't emit or reflect any light, Albert Einstein showed that all mass bends space! Light passing near a heavy invi
- **Mapped Narration Segments (6)**: `16-sub-16-3-gravitational-lensing-title`, `16-sub-16-3-gravitational-lensing-lead-1`, `16-sub-16-3-gravitational-lensing-keyIdea-1`, `16-sub-16-3-gravitational-lensing-explanation-1`, `16-sub-16-3-gravitational-lensing-explanation-2`, `16-sub-16-3-gravitational-lensing-activityPrompt-1`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m16-sub-16-3-gravitational-lensing-beat-1`**<br>*Gravitational Lensing & The Bullet Cluster — Primary Physical Mechanism* | `16-sub-16-3-gravitational-lensing-title`<br>`16-sub-16-3-gravitational-lensing-lead-1`<br>`16-sub-16-3-gravitational-lensing-keyIdea-1` | Gravitational Lensing & The Bullet Cluster Even though dark matter doesn't emit or reflect any light, Albert Einstein showed that all mass bends space! Light passing near a heavy invisible clump follows curved spacetime like a cosmic magnifying lens. Gravitati | `data_visualization_view` in `comoving_cosmological`<br>Transition: `observational_data_reveal` | Labels: `gravitational lensing`<br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m16-sub-16-3-gravitational-lensing-beat-2`**<br>*Gravitational Lensing & The Bullet Cluster — Quantitative Analysis & Interactive Synthesis* | `16-sub-16-3-gravitational-lensing-explanation-1`<br>`16-sub-16-3-gravitational-lensing-explanation-2`<br>`16-sub-16-3-gravitational-lensing-activityPrompt-1` | When astronomers look at giant galaxy clusters with the Hubble and James Webb Space Telescopes, they see background galaxies stretched into arcs and rings. By measuring these warped light shapes, computers can reconstruct an exact 3D map of the mass that cause | `planetary_orbital_shot` in `comoving_cosmological`<br>Transition: `smooth_orbital_travel` | Labels: `Gravitational Lensing & The Bullet Cluster Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m16-3-param` (Gravitational Lensing & The Bullet Cluster Parameter Explorer — selector `#module-16-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Gravitational Lensing & The Bullet Cluster (act_16_rotation_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 16.4 — Galaxy Clusters & Fritz Zwicky (`sub-16-4-galaxy-clusters-mass`)

- **Storyboard ID**: `sb-m16-sub-16-4-galaxy-clusters-mass`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION` — *Dark matter halos rendered as translucent indigo gravitational potential contours inferred from rotation curves and lensing—not visible light.*
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `comoving_cosmological` | `data_visualization_view` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Galaxy Clusters & Fritz Zwicky within Dark Matter & Dark Energy.
  2. Long before Vera Rubin studied spiral galaxies, a brilliant and eccentric Swiss astronomer named Fritz Zwicky was looking at the giant Coma 
- **Mapped Narration Segments (6)**: `16-sub-16-4-galaxy-clusters-mass-title`, `16-sub-16-4-galaxy-clusters-mass-lead-1`, `16-sub-16-4-galaxy-clusters-mass-keyIdea-1`, `16-sub-16-4-galaxy-clusters-mass-explanation-1`, `16-sub-16-4-galaxy-clusters-mass-explanation-2`, `16-sub-16-4-galaxy-clusters-mass-activityPrompt-1`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m16-sub-16-4-galaxy-clusters-mass-beat-1`**<br>*Galaxy Clusters & Fritz Zwicky — Primary Physical Mechanism* | `16-sub-16-4-galaxy-clusters-mass-title`<br>`16-sub-16-4-galaxy-clusters-mass-lead-1`<br>`16-sub-16-4-galaxy-clusters-mass-keyIdea-1` | Galaxy Clusters & Fritz Zwicky Long before Vera Rubin studied spiral galaxies, a brilliant and eccentric Swiss astronomer named Fritz Zwicky was looking at the giant Coma Cluster of galaxies in 1933. He noticed something that made no sense! The galaxies in the | `data_visualization_view` in `comoving_cosmological`<br>Transition: `observational_data_reveal` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m16-sub-16-4-galaxy-clusters-mass-beat-2`**<br>*Galaxy Clusters & Fritz Zwicky — Quantitative Analysis & Interactive Synthesis* | `16-sub-16-4-galaxy-clusters-mass-explanation-1`<br>`16-sub-16-4-galaxy-clusters-mass-explanation-2`<br>`16-sub-16-4-galaxy-clusters-mass-activityPrompt-1` | Zwicky measured the velocities of individual galaxies orbiting inside the Coma Cluster. Using physics principles, he calculated how much mass was needed to keep them bound by gravity. The answer was astonishing: the cluster needed over 100 times more mass than | `scientific_cross_section` in `comoving_cosmological`<br>Transition: `smooth_orbital_travel` | Labels: `Galaxy Clusters & Fritz Zwicky Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m16-4-param` (Galaxy Clusters & Fritz Zwicky Parameter Explorer — selector `#module-16-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Galaxy Clusters & Fritz Zwicky (act_16_rotation_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 16.5 — What Scientists Mean by 'Dark Matter' (`sub-16-5-what-dark-matter-means`)

- **Storyboard ID**: `sb-m16-sub-16-5-what-dark-matter-means`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION` — *Dark matter halos rendered as translucent indigo gravitational potential contours inferred from rotation curves and lensing—not visible light.*
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `comoving_cosmological` | `data_visualization_view` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of What Scientists Mean by 'Dark Matter' within Dark Matter & Dark Energy.
  2. The word 'dark' sounds scary or mysterious, but to a physicist it just means 'transparent'! Dark matter does not glow, absorb, reflect, or b
- **Mapped Narration Segments (6)**: `16-sub-16-5-what-dark-matter-means-title`, `16-sub-16-5-what-dark-matter-means-lead-1`, `16-sub-16-5-what-dark-matter-means-keyIdea-1`, `16-sub-16-5-what-dark-matter-means-explanation-1`, `16-sub-16-5-what-dark-matter-means-explanation-2`, `16-sub-16-5-what-dark-matter-means-activityPrompt-1`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m16-sub-16-5-what-dark-matter-means-beat-1`**<br>*What Scientists Mean by 'Dark Matter' — Primary Physical Mechanism* | `16-sub-16-5-what-dark-matter-means-title`<br>`16-sub-16-5-what-dark-matter-means-lead-1`<br>`16-sub-16-5-what-dark-matter-means-keyIdea-1` | What Scientists Mean by 'Dark Matter' The word 'dark' sounds scary or mysterious, but to a physicist it just means 'transparent'! Dark matter does not glow, absorb, reflect, or block light at any wavelength. Dark matter is not black holes or dark clouds—it is  | `data_visualization_view` in `comoving_cosmological`<br>Transition: `observational_data_reveal` | Labels: `dark matter`<br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m16-sub-16-5-what-dark-matter-means-beat-2`**<br>*What Scientists Mean by 'Dark Matter' — Quantitative Analysis & Interactive Synthesis* | `16-sub-16-5-what-dark-matter-means-explanation-1`<br>`16-sub-16-5-what-dark-matter-means-explanation-2`<br>`16-sub-16-5-what-dark-matter-means-activityPrompt-1` | If a beam of light hits ordinary matter, the light reflects or gets absorbed. But light passes straight through dark matter without touching it. In fact, trillions of dark matter particles might be drifting through your room every second, completely harmless b | `planetary_orbital_shot` in `comoving_cosmological`<br>Transition: `smooth_orbital_travel` | Labels: `What Scientists Mean by 'Dark Matter' Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m16-5-param` (What Scientists Mean by 'Dark Matter' Parameter Explorer — selector `#module-16-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for What Scientists Mean by 'Dark Matter' (act_16_rotation_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 16.6 — How Cosmic Expansion is Measured (`sub-16-6-measuring-expansion`)

- **Storyboard ID**: `sb-m16-sub-16-6-measuring-expansion`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION` — *Dark matter halos rendered as translucent indigo gravitational potential contours inferred from rotation curves and lensing—not visible light.*
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `comoving_cosmological` | `data_visualization_view` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of How Cosmic Expansion is Measured within Dark Matter & Dark Energy.
  2. In 1929, Edwin Hubble discovered that almost all distant galaxies are moving away from us. Even more surprising: galaxies twice as far away 
- **Mapped Narration Segments (5)**: `16-sub-16-6-measuring-expansion-title`, `16-sub-16-6-measuring-expansion-lead-1`, `16-sub-16-6-measuring-expansion-keyIdea-1`, `16-sub-16-6-measuring-expansion-explanation-1`, `16-sub-16-6-measuring-expansion-activityPrompt-1`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m16-sub-16-6-measuring-expansion-beat-1`**<br>*How Cosmic Expansion is Measured — Primary Physical Mechanism* | `16-sub-16-6-measuring-expansion-title`<br>`16-sub-16-6-measuring-expansion-lead-1`<br>`16-sub-16-6-measuring-expansion-keyIdea-1` | How Cosmic Expansion is Measured In 1929, Edwin Hubble discovered that almost all distant galaxies are moving away from us. Even more surprising: galaxies twice as far away are receding twice as fast! The universe is not expanding into empty space; space itsel | `data_visualization_view` in `comoving_cosmological`<br>Transition: `observational_data_reveal` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m16-sub-16-6-measuring-expansion-beat-2`**<br>*How Cosmic Expansion is Measured — Quantitative Analysis & Interactive Synthesis* | `16-sub-16-6-measuring-expansion-explanation-1`<br>`16-sub-16-6-measuring-expansion-activityPrompt-1` | As light travels through expanding space over billions of years, its waves get stretched into longer, redder wavelengths. Astronomers call this 'cosmological redshift.' By measuring how much the light is stretched, we can tell how much space has expanded since | `scientific_cross_section` in `comoving_cosmological`<br>Transition: `smooth_orbital_travel` | Labels: `How Cosmic Expansion is Measured Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m16-6-param` (How Cosmic Expansion is Measured Parameter Explorer — selector `#module-16-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for How Cosmic Expansion is Measured (act_16_rotation_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 16.7 — Evidence for Accelerated Expansion (`sub-16-7-accelerated-expansion`)

- **Storyboard ID**: `sb-m16-sub-16-7-accelerated-expansion`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION` — *Dark matter halos rendered as translucent indigo gravitational potential contours inferred from rotation curves and lensing—not visible light.*
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `comoving_cosmological` | `data_visualization_view` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Evidence for Accelerated Expansion within Dark Matter & Dark Energy.
  2. For decades, every scientist on Earth assumed that gravity would gradually slow down the expansion of the universe, just like a ball thrown 
- **Mapped Narration Segments (6)**: `16-sub-16-7-accelerated-expansion-title`, `16-sub-16-7-accelerated-expansion-lead-1`, `16-sub-16-7-accelerated-expansion-keyIdea-1`, `16-sub-16-7-accelerated-expansion-explanation-1`, `16-sub-16-7-accelerated-expansion-explanation-2`, `16-sub-16-7-accelerated-expansion-activityPrompt-1`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m16-sub-16-7-accelerated-expansion-beat-1`**<br>*Evidence for Accelerated Expansion — Primary Physical Mechanism* | `16-sub-16-7-accelerated-expansion-title`<br>`16-sub-16-7-accelerated-expansion-lead-1`<br>`16-sub-16-7-accelerated-expansion-keyIdea-1` | Evidence for Accelerated Expansion For decades, every scientist on Earth assumed that gravity would gradually slow down the expansion of the universe, just like a ball thrown upward slows down. But in 1998, two teams discovered the exact opposite! Instead of s | `data_visualization_view` in `comoving_cosmological`<br>Transition: `observational_data_reveal` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m16-sub-16-7-accelerated-expansion-beat-2`**<br>*Evidence for Accelerated Expansion — Quantitative Analysis & Interactive Synthesis* | `16-sub-16-7-accelerated-expansion-explanation-1`<br>`16-sub-16-7-accelerated-expansion-explanation-2`<br>`16-sub-16-7-accelerated-expansion-activityPrompt-1` | Two competing teams of astronomers—the High-Z Supernova Search Team (led by Brian Schmidt and Adam Riess) and the Supernova Cosmology Project (led by Saul Perlmutter)—looked at distant exploding stars. To their astonishment, the supernovae were about 25% dimme | `planetary_orbital_shot` in `comoving_cosmological`<br>Transition: `smooth_orbital_travel` | Labels: `Evidence for Accelerated Expansion Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m16-7-param` (Evidence for Accelerated Expansion Parameter Explorer — selector `#module-16-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Evidence for Accelerated Expansion (act_16_rotation_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 16.8 — What Dark Energy Means in Modern Cosmology (`sub-16-8-what-dark-energy-means`)

- **Storyboard ID**: `sb-m16-sub-16-8-what-dark-energy-means`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION` — *Dark matter halos rendered as translucent indigo gravitational potential contours inferred from rotation curves and lensing—not visible light.*
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `comoving_cosmological` | `data_visualization_view` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of What Dark Energy Means in Modern Cosmology within Dark Matter & Dark Energy.
  2. Dark matter and dark energy sound similar, but they are complete opposites! Dark matter pulls things together with gravity, while dark energ
- **Mapped Narration Segments (6)**: `16-sub-16-8-what-dark-energy-means-title`, `16-sub-16-8-what-dark-energy-means-lead-1`, `16-sub-16-8-what-dark-energy-means-keyIdea-1`, `16-sub-16-8-what-dark-energy-means-explanation-1`, `16-sub-16-8-what-dark-energy-means-explanation-2`, `16-sub-16-8-what-dark-energy-means-activityPrompt-1`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m16-sub-16-8-what-dark-energy-means-beat-1`**<br>*What Dark Energy Means in Modern Cosmology — Primary Physical Mechanism* | `16-sub-16-8-what-dark-energy-means-title`<br>`16-sub-16-8-what-dark-energy-means-lead-1`<br>`16-sub-16-8-what-dark-energy-means-keyIdea-1` | What Dark Energy Means in Modern Cosmology Dark matter and dark energy sound similar, but they are complete opposites! Dark matter pulls things together with gravity, while dark energy stretches empty space apart. Dark energy is not a particle or a cloud—it is | `data_visualization_view` in `comoving_cosmological`<br>Transition: `observational_data_reveal` | Labels: `dark energy`<br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m16-sub-16-8-what-dark-energy-means-beat-2`**<br>*What Dark Energy Means in Modern Cosmology — Quantitative Analysis & Interactive Synthesis* | `16-sub-16-8-what-dark-energy-means-explanation-1`<br>`16-sub-16-8-what-dark-energy-means-explanation-2`<br>`16-sub-16-8-what-dark-energy-means-activityPrompt-1` | As the universe expands, matter gets diluted and spreads out thinner and thinner. But dark energy does not dilute! As space expands, more space is created, meaning the total amount of dark energy keeps growing. That is why dark energy now rules the universe, p | `scientific_cross_section` in `comoving_cosmological`<br>Transition: `smooth_orbital_travel` | Labels: `What Dark Energy Means in Modern Cosmology Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m16-8-param` (What Dark Energy Means in Modern Cosmology Parameter Explorer — selector `#module-16-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for What Dark Energy Means in Modern Cosmology (act_16_rotation_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 16.9 — Open Questions & Competing Models (`sub-16-9-open-questions`)

- **Storyboard ID**: `sb-m16-sub-16-9-open-questions`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION` — *Dark matter halos rendered as translucent indigo gravitational potential contours inferred from rotation curves and lensing—not visible light.*
- **Interactivity Mode**: `REQUIRED_LEARNING_ACTIVITY`
- **Coordinate Frame & Camera Preset**: `comoving_cosmological` | `data_visualization_view` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Open Questions & Competing Models within Dark Matter & Dark Energy.
  2. Scientists are totally honest: we know dark matter and dark energy exist because of what they do, but we still don't know what they are made
- **Mapped Narration Segments (6)**: `16-sub-16-9-open-questions-title`, `16-sub-16-9-open-questions-lead-1`, `16-sub-16-9-open-questions-keyIdea-1`, `16-sub-16-9-open-questions-explanation-1`, `16-sub-16-9-open-questions-explanation-2`, `16-sub-16-9-open-questions-activityPrompt-1`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m16-sub-16-9-open-questions-beat-1`**<br>*Open Questions & Competing Models — Primary Physical Mechanism* | `16-sub-16-9-open-questions-title`<br>`16-sub-16-9-open-questions-lead-1`<br>`16-sub-16-9-open-questions-keyIdea-1` | Open Questions & Competing Models Scientists are totally honest: we know dark matter and dark energy exist because of what they do, but we still don't know what they are made of! That makes them the most exciting mysteries in all of science. Whoever solves the | `data_visualization_view` in `comoving_cosmological`<br>Transition: `observational_data_reveal` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m16-sub-16-9-open-questions-beat-2`**<br>*Open Questions & Competing Models — Quantitative Analysis & Interactive Synthesis* | `16-sub-16-9-open-questions-explanation-1`<br>`16-sub-16-9-open-questions-explanation-2`<br>`16-sub-16-9-open-questions-activityPrompt-1` | Could dark matter be a brand new family of particles? Could dark energy be a dynamic changing field called 'quintessence'? Or could our understanding of gravity need an upgrade at cosmic scales? Space telescopes like Euclid, the Roman Space Telescope, and the  | `data_visualization_view` in `comoving_cosmological`<br>Transition: `observational_data_reveal` | Labels: `Open Questions & Competing Models Telemetry`<br>Gate: `REQUIRED_LEARNING_ACTIVITY` (Requires `act_16_dark_matter_rotation_lab`) |

- **Interactive Controls**: `ctrl-m16-9-param` (Open Questions & Competing Models Parameter Explorer — selector `#module-16-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Open Questions & Competing Models (act_16_rotation_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---
