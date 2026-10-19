# Module 18 Cinematic Storyboard — The Expanding Universe

- **Module ID**: `18` (`stageId: "stage-5-understanding-universe"`, Course: `"cosmic-journey"`)
- **Total Instructional Chapters (Sublessons)**: **8**
- **Total Mapped Narration Segments**: **46** (`explorer` canonical sequence; adapted across `junior`, `explorer`, `astronomer`)
- **Primary 3D Scene & Component**: `m18_metric_expansion_horizons_3d` (`src/components/academy/CosmicExpansionObservatory3D.tsx (Upgrading to MetricExpansionVisualizer3D.tsx)`)
- **Visual Style & Lighting Preset**: `stage5_cosmological_metric` | `cosmological_ambient` (`ACES Filmic`, `exposure: 1.05`, `bloomThreshold: 0.80`)
- **Primary Interactive Activity Gate**: `act_18_redshift_expansion_lab` — *Cosmological Redshift & Expansion Lab* (Measure spectral line shifting (z = delta_lambda / lambda_0) across redshift z = 0 to 6.)
- **Scientific References**: A Relation between Distance and Radial Velocity among Extra-Galactic Nebulae (Hubble (1929) / PNAS - https://www.pnas.org/doi/10.1073/pnas.15.3.168); Un Univers homogène de masse constante et de rayon croissant (Lemaître (1927) / Annales de la Société Scientifique de Bruxelles - https://ui.adsabs.harvard.edu/abs/1927ASSB...47...49L); Final Results from the HST Key Project to Measure the Hubble Constant (Freedman et al. (2001) / Astrophysical Journal - https://ui.adsabs.harvard.edu/abs/2001ApJ...553...47F); The Pantheon+ Analysis: Cosmological Constraints (Brout et al. (2022) / Astrophysical Journal - https://ui.adsabs.harvard.edu/abs/2022ApJ...938..110B)

---

## Chapter 18.1 — What Does Cosmic Expansion Mean? (`m18-l1`)

- **Storyboard ID**: `sb-m18-m18-l1`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION`
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `comoving_cosmological` | `data_visualization_view` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of What Does Cosmic Expansion Mean? within The Expanding Universe.
  2. What Is Expanding?
- **Mapped Narration Segments (7)**: `18-m18-l1-title`, `18-m18-l1-explanation-1`, `18-m18-l1-explanation-2`, `18-m18-l1-explanation-3`, `18-m18-l1-explanation-4`, `18-m18-l1-explanation-5`, `18-m18-l1-explanation-6`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m18-m18-l1-beat-1`**<br>*What Does Cosmic Expansion Mean? — Primary Physical Mechanism* | `18-m18-l1-title`<br>`18-m18-l1-explanation-1`<br>`18-m18-l1-explanation-2`<br>`18-m18-l1-explanation-3` | What Does Cosmic Expansion Mean? What Is Expanding? When astronomers say the universe is expanding, it is natural to imagine galaxies zooming like rocket ships through empty space. **That is completely wrong!** | `data_visualization_view` in `comoving_cosmological`<br>Transition: `scale_aware_cosmic_zoom` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m18-m18-l1-beat-2`**<br>*What Does Cosmic Expansion Mean? — Quantitative Analysis & Interactive Synthesis* | `18-m18-l1-explanation-4`<br>`18-m18-l1-explanation-5`<br>`18-m18-l1-explanation-6` | **
* Imagine baking a loaf of raisin bread. As the dough rises in the oven, the raisins move further apart from each other. * The raisins aren't walking through the dough. The dough itself is growing everywhere! * In our universe, space is the dough, and dista | `planetary_orbital_shot` in `comoving_cosmological`<br>Transition: `smooth_orbital_travel` | Labels: `What Does Cosmic Expansion Mean? Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m18-1-param` (What Does Cosmic Expansion Mean? Parameter Explorer — selector `#module-18-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for What Does Cosmic Expansion Mean? (act_18_redshift_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 18.2 — How Galaxy Distances Change (`m18-l2`)

- **Storyboard ID**: `sb-m18-m18-l2`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION`
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `comoving_cosmological` | `data_visualization_view` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of How Galaxy Distances Change within The Expanding Universe.
  2. The Cosmic Grid: Stretching Without Walking
- **Mapped Narration Segments (6)**: `18-m18-l2-title`, `18-m18-l2-explanation-1`, `18-m18-l2-explanation-2`, `18-m18-l2-explanation-3`, `18-m18-l2-explanation-4`, `18-m18-l2-explanation-5`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m18-m18-l2-beat-1`**<br>*How Galaxy Distances Change — Primary Physical Mechanism* | `18-m18-l2-title`<br>`18-m18-l2-explanation-1`<br>`18-m18-l2-explanation-2` | How Galaxy Distances Change The Cosmic Grid: Stretching Without Walking Imagine drawing dots on a rubber balloon with a pen. You label dot A, dot B, and dot C.
* The distance between dot A and dot B is 2 inches.
* The distance between dot A and dot C is 4 inch | `data_visualization_view` in `comoving_cosmological`<br>Transition: `scale_aware_cosmic_zoom` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m18-m18-l2-beat-2`**<br>*How Galaxy Distances Change — Quantitative Analysis & Interactive Synthesis* | `18-m18-l2-explanation-3`<br>`18-m18-l2-explanation-4`<br>`18-m18-l2-explanation-5` | Now, blow air into the balloon until its surface doubles in size:
* The distance between A and B becomes 4 inches (it grew by 2 inches).
* The distance between A and C becomes 8 inches (it grew by 4 inches!). Notice something amazing: **Dot C moved away twice  | `scientific_cross_section` in `comoving_cosmological`<br>Transition: `smooth_orbital_travel` | Labels: `How Galaxy Distances Change Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m18-2-param` (How Galaxy Distances Change Parameter Explorer — selector `#module-18-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for How Galaxy Distances Change (act_18_redshift_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 18.3 — The Hubble–Lemaître Relationship (`m18-l3`)

- **Storyboard ID**: `sb-m18-m18-l3`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION`
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `comoving_cosmological` | `data_visualization_view` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of The Hubble–Lemaître Relationship within The Expanding Universe.
  2. The Law of Cosmic Motion
- **Mapped Narration Segments (6)**: `18-m18-l3-title`, `18-m18-l3-explanation-1`, `18-m18-l3-explanation-2`, `18-m18-l3-explanation-3`, `18-m18-l3-explanation-4`, `18-m18-l3-explanation-5`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m18-m18-l3-beat-1`**<br>*The Hubble–Lemaître Relationship — Primary Physical Mechanism* | `18-m18-l3-title`<br>`18-m18-l3-explanation-1`<br>`18-m18-l3-explanation-2` | The Hubble–Lemaître Relationship The Law of Cosmic Motion In the late 1920s, Belgian astronomer-priest Georges Lemaître and American astronomer Edwin Hubble made one of the greatest discoveries in human history: | `data_visualization_view` in `comoving_cosmological`<br>Transition: `scale_aware_cosmic_zoom` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m18-m18-l3-beat-2`**<br>*The Hubble–Lemaître Relationship — Quantitative Analysis & Interactive Synthesis* | `18-m18-l3-explanation-3`<br>`18-m18-l3-explanation-4`<br>`18-m18-l3-explanation-5` | **Distant galaxies are moving away from us with speeds proportional to their distance!** This is known as the **Hubble–Lemaître Law**:
$$\text{Speed} = H_0 \times \text{Distance}$$ * $H_0$ is called the **Hubble Constant**. * It tells us the current expansion  | `planetary_orbital_shot` in `comoving_cosmological`<br>Transition: `smooth_orbital_travel` | Labels: `The Hubble–Lemaître Relationship Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m18-3-param` (The Hubble–Lemaître Relationship Parameter Explorer — selector `#module-18-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for The Hubble–Lemaître Relationship (act_18_redshift_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 18.4 — Cosmological Redshift (`m18-l4`)

- **Storyboard ID**: `sb-m18-m18-l4`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION`
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `comoving_cosmological` | `data_visualization_view` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Cosmological Redshift within The Expanding Universe.
  2. Why Distant Light Turns Red
- **Mapped Narration Segments (6)**: `18-m18-l4-title`, `18-m18-l4-explanation-1`, `18-m18-l4-explanation-2`, `18-m18-l4-explanation-3`, `18-m18-l4-explanation-4`, `18-m18-l4-explanation-5`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m18-m18-l4-beat-1`**<br>*Cosmological Redshift — Primary Physical Mechanism* | `18-m18-l4-title`<br>`18-m18-l4-explanation-1`<br>`18-m18-l4-explanation-2` | Cosmological Redshift Why Distant Light Turns Red When we look at light from distant galaxies, their spectral absorption lines are shifted toward the red end of the spectrum. | `data_visualization_view` in `comoving_cosmological`<br>Transition: `scale_aware_cosmic_zoom` | Labels: `cosmological redshift`<br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m18-m18-l4-beat-2`**<br>*Cosmological Redshift — Quantitative Analysis & Interactive Synthesis* | `18-m18-l4-explanation-3`<br>`18-m18-l4-explanation-4`<br>`18-m18-l4-explanation-5` | Why does this happen? * Imagine drawing a small wiggly wave on an unstretched rubber band. ** The distance between each wave crest gets longer. * In physics, longer light waves mean **redder light**! This is called **Cosmological Redshift ($z$)**. * It is **no | `scientific_cross_section` in `comoving_cosmological`<br>Transition: `smooth_orbital_travel` | Labels: `Cosmological Redshift Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m18-4-param` (Cosmological Redshift Parameter Explorer — selector `#module-18-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Cosmological Redshift (act_18_redshift_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 18.5 — The Scale Factor a(t) (`m18-l5`)

- **Storyboard ID**: `sb-m18-m18-l5`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION`
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `comoving_cosmological` | `data_visualization_view` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of The Scale Factor a(t) within The Expanding Universe.
  2. The Cosmic Ruler: Scale Factor a(t)
- **Mapped Narration Segments (5)**: `18-m18-l5-title`, `18-m18-l5-explanation-1`, `18-m18-l5-explanation-2`, `18-m18-l5-explanation-3`, `18-m18-l5-explanation-4`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m18-m18-l5-beat-1`**<br>*The Scale Factor a(t) — Primary Physical Mechanism* | `18-m18-l5-title`<br>`18-m18-l5-explanation-1`<br>`18-m18-l5-explanation-2` | The Scale Factor a(t) The Cosmic Ruler: Scale Factor a(t) To describe how big the universe is at any point in history, cosmologists use a single number called the **Scale Factor**, written as **$a(t)$**. | `data_visualization_view` in `comoving_cosmological`<br>Transition: `scale_aware_cosmic_zoom` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m18-m18-l5-beat-2`**<br>*The Scale Factor a(t) — Quantitative Analysis & Interactive Synthesis* | `18-m18-l5-explanation-3`<br>`18-m18-l5-explanation-4` | 0$**. 5$**. 1$**. 0$**. Whenever you see a galaxy at redshift $z = 1$, you know instantly that its light was emitted when space was:
$$a = \frac{1}{1 + z} = \frac{1}{1 + 1} = 0.5$$
Space was exactly half as big as it is today! | `planetary_orbital_shot` in `comoving_cosmological`<br>Transition: `smooth_orbital_travel` | Labels: `The Scale Factor a(t) Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m18-5-param` (The Scale Factor a(t) Parameter Explorer — selector `#module-18-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for The Scale Factor a(t) (act_18_redshift_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 18.6 — Lookback Time & Cosmic Horizon (`m18-l6`)

- **Storyboard ID**: `sb-m18-m18-l6`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION`
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `comoving_cosmological` | `data_visualization_view` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Lookback Time & Cosmic Horizon within The Expanding Universe.
  2. Telescopes Are Real-Life Time Machines
- **Mapped Narration Segments (5)**: `18-m18-l6-title`, `18-m18-l6-explanation-1`, `18-m18-l6-explanation-2`, `18-m18-l6-explanation-3`, `18-m18-l6-explanation-4`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m18-m18-l6-beat-1`**<br>*Lookback Time & Cosmic Horizon — Primary Physical Mechanism* | `18-m18-l6-title`<br>`18-m18-l6-explanation-1`<br>`18-m18-l6-explanation-2` | Lookback Time & Cosmic Horizon Telescopes Are Real-Life Time Machines Because light travels at a finite speed ($300,000$ kilometers per second), looking out into deep space is literally looking backward in time! | `data_visualization_view` in `comoving_cosmological`<br>Transition: `scale_aware_cosmic_zoom` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m18-m18-l6-beat-2`**<br>*Lookback Time & Cosmic Horizon — Quantitative Analysis & Interactive Synthesis* | `18-m18-l6-explanation-3`<br>`18-m18-l6-explanation-4` | 3 seconds ago**. 3 minutes ago**. 5 million years ago**. 5 billion years ago**! The time light took to travel from the galaxy to our telescope is called **Lookback Time**. When we observe the earliest galaxies, we are seeing cosmic baby pictures from when the  | `scientific_cross_section` in `comoving_cosmological`<br>Transition: `smooth_orbital_travel` | Labels: `Lookback Time & Cosmic Horizon Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m18-6-param` (Lookback Time & Cosmic Horizon Parameter Explorer — selector `#module-18-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Lookback Time & Cosmic Horizon (act_18_redshift_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 18.7 — Observable-Universe Horizons (`m18-l7`)

- **Storyboard ID**: `sb-m18-m18-l7`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION`
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `comoving_cosmological` | `data_visualization_view` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Observable-Universe Horizons within The Expanding Universe.
  2. Is There an Edge to the Universe?
- **Mapped Narration Segments (6)**: `18-m18-l7-title`, `18-m18-l7-explanation-1`, `18-m18-l7-explanation-2`, `18-m18-l7-explanation-3`, `18-m18-l7-explanation-4`, `18-m18-l7-explanation-5`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m18-m18-l7-beat-1`**<br>*Observable-Universe Horizons — Primary Physical Mechanism* | `18-m18-l7-title`<br>`18-m18-l7-explanation-1`<br>`18-m18-l7-explanation-2` | Observable-Universe Horizons Is There an Edge to the Universe? Many people hear that the observable universe is **93 billion light-years across** and imagine there is a giant brick wall or an empty black cliff at the edge. | `data_visualization_view` in `comoving_cosmological`<br>Transition: `scale_aware_cosmic_zoom` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m18-m18-l7-beat-2`**<br>*Observable-Universe Horizons — Quantitative Analysis & Interactive Synthesis* | `18-m18-l7-explanation-3`<br>`18-m18-l7-explanation-4`<br>`18-m18-l7-explanation-5` | **There is no physical edge!** 8 billion years ago. * Think of being in a ship in the middle of a foggy ocean. You can only see 1 mile in every direction because of the fog. * Does the ocean end 1 mile away? Of course not! If you sail 1 mile, you just see anot | `planetary_orbital_shot` in `comoving_cosmological`<br>Transition: `smooth_orbital_travel` | Labels: `Observable-Universe Horizons Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m18-7-param` (Observable-Universe Horizons Parameter Explorer — selector `#module-18-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Observable-Universe Horizons (act_18_redshift_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 18.8 — Expansion vs Gravitationally Bound Systems (`m18-l8`)

- **Storyboard ID**: `sb-m18-m18-l8`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION`
- **Interactivity Mode**: `REQUIRED_LEARNING_ACTIVITY`
- **Coordinate Frame & Camera Preset**: `comoving_cosmological` | `data_visualization_view` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Expansion vs Gravitationally Bound Systems within The Expanding Universe.
  2. Why Aren't You Expanding?
- **Mapped Narration Segments (5)**: `18-m18-l8-title`, `18-m18-l8-explanation-1`, `18-m18-l8-explanation-2`, `18-m18-l8-explanation-3`, `18-m18-l8-explanation-4`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m18-m18-l8-beat-1`**<br>*Expansion vs Gravitationally Bound Systems — Primary Physical Mechanism* | `18-m18-l8-title`<br>`18-m18-l8-explanation-1`<br>`18-m18-l8-explanation-2` | Expansion vs Gravitationally Bound Systems Why Aren't You Expanding? If space is expanding everywhere, why aren't you getting taller? Why doesn't the Earth grow bigger, and why doesn't the Moon drift away from Earth? | `data_visualization_view` in `comoving_cosmological`<br>Transition: `scale_aware_cosmic_zoom` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m18-m18-l8-beat-2`**<br>*Expansion vs Gravitationally Bound Systems — Quantitative Analysis & Interactive Synthesis* | `18-m18-l8-explanation-3`<br>`18-m18-l8-explanation-4` | **
* Imagine walking backward on a treadmill. Space is the treadmill trying to pull things apart. * But inside an atom, electrical forces holding electrons to protons are **trillions of times stronger** than the tiny tug of cosmic expansion! * Inside the Solar | `data_visualization_view` in `comoving_cosmological`<br>Transition: `observational_data_reveal` | Labels: `Expansion vs Gravitationally Bound Systems Telemetry`<br>Gate: `REQUIRED_LEARNING_ACTIVITY` (Requires `act_18_redshift_expansion_lab`) |

- **Interactive Controls**: `ctrl-m18-8-param` (Expansion vs Gravitationally Bound Systems Parameter Explorer — selector `#module-18-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Expansion vs Gravitationally Bound Systems (act_18_redshift_table).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---
