# Module 24 Cinematic Storyboard — Cosmic Physics Laboratory & Challenges

- **Module ID**: `24` (`stageId: "stage-6-space-scientist"`, Course: `"cosmic-journey"`)
- **Total Instructional Chapters (Sublessons)**: **3**
- **Total Mapped Narration Segments**: **9** (`explorer` canonical sequence; adapted across `junior`, `explorer`, `astronomer`)
- **Primary 3D Scene & Component**: `m24_capstone_physics_sandbox_3d` (`src/components/academy/CosmicPhysicsLab.tsx (Upgrading to CapstoneUniverseSandbox3D.tsx)`)
- **Visual Style & Lighting Preset**: `stage6_instrument_telemetry` | `stellar_point_blackbody` (`ACES Filmic`, `exposure: 1.05`, `bloomThreshold: 0.80`)
- **Primary Interactive Activity Gate**: `act_24_cosmic_lab_capstone` — *Unified Cosmic Physics Laboratory* (Synthesize multi-wavelength data, stellar evolution, and cosmological redshift.)
- **Scientific References**: Astrophysics Data System (ADS) Digital Library (NASA - https://ui.adsabs.harvard.edu/); NASA Exoplanet Archive & Transit Ephemerides (NASA - https://exoplanetarchive.ipac.caltech.edu/); European Space Agency (ESA) Gaia Science Archive (ESA - https://www.cosmos.esa.int/web/gaia/data-release-3); Hubble & James Webb Space Telescope Science Releases (JWST - https://webbtelescope.org/resource-gallery); International Astronomical Union (IAU) Astronomical Standards (IAU - https://www.iau.org/science/scientific_bodies/commissions/)

---

## Chapter 24.1 — The Universal Physics Sandbox: Synthesizing 23 Modules (`24-1`)

- **Storyboard ID**: `sb-m24-24-1`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION`
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `heliocentric_au` | `data_visualization_view` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of The Universal Physics Sandbox: Synthesizing 23 Modules within Cosmic Physics Laboratory & Challenges.
  2. Astrophysics is unique among sciences because astronomers cannot touch or manipulate stars in a physical laboratory. Instead, astrophysicist
- **Mapped Narration Segments (3)**: `24-24-1-title`, `24-24-1-explanation-1`, `24-24-1-explanation-2`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m24-24-1-beat-1`**<br>*The Universal Physics Sandbox: Synthesizing 23 Modules — Primary Physical Mechanism* | `24-24-1-title`<br>`24-24-1-explanation-1` | The Universal Physics Sandbox: Synthesizing 23 Modules Astrophysics is unique among sciences because astronomers cannot touch or manipulate stars in a physical laboratory. Instead, astrophysicists build mathematical simulations grounded in conservation laws: c | `data_visualization_view` in `heliocentric_au`<br>Transition: `smooth_orbital_travel` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m24-24-1-beat-2`**<br>*The Universal Physics Sandbox: Synthesizing 23 Modules — Quantitative Analysis & Interactive Synthesis* | `24-24-1-explanation-2` | In Module 24, you have direct access to 10 integrated research laboratories. Each lab solves authentic physical relationships—from the vis-viva equation and NFW dark matter profiles to relativistic ISCO horizons and Hohmann trajectory transfers. | `planetary_orbital_shot` in `heliocentric_au`<br>Transition: `smooth_orbital_travel` | Labels: `The Universal Physics Sandbox: Synthesizing 23 Modules Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m24-1-param` (The Universal Physics Sandbox: Synthesizing 23 Modules Parameter Explorer — selector `#module-24-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for The Universal Physics Sandbox: Synthesizing 23 Modules (act_24_capstone_matrix).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 24.2 — Numerical Simulation, Models, and Scientific Limitations (`24-2`)

- **Storyboard ID**: `sb-m24-24-2`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION`
- **Interactivity Mode**: `INTERACTIVE_EXPLORATION`
- **Coordinate Frame & Camera Preset**: `heliocentric_au` | `data_visualization_view` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of Numerical Simulation, Models, and Scientific Limitations within Cosmic Physics Laboratory & Challenges.
  2. Every computational model involves trade-offs between physical fidelity, numerical stability, and real-time interactive performance. For ins
- **Mapped Narration Segments (3)**: `24-24-2-title`, `24-24-2-explanation-1`, `24-24-2-explanation-2`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m24-24-2-beat-1`**<br>*Numerical Simulation, Models, and Scientific Limitations — Primary Physical Mechanism* | `24-24-2-title`<br>`24-24-2-explanation-1` | Numerical Simulation, Models, and Scientific Limitations Every computational model involves trade-offs between physical fidelity, numerical stability, and real-time interactive performance. For instance:
- In our Solar System lab, we use 4th-order Runge-Kutta  | `data_visualization_view` in `heliocentric_au`<br>Transition: `smooth_orbital_travel` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m24-24-2-beat-2`**<br>*Numerical Simulation, Models, and Scientific Limitations — Quantitative Analysis & Interactive Synthesis* | `24-24-2-explanation-2` | - In our Galaxy Collision lab, we use restricted N-body test particles, capturing tidal tails without the massive computational expense of mutual O(N²) particle-particle forces.
 - In our Exoplanet lab, we model spherical bodies with limb darkening, treating s | `scientific_cross_section` in `heliocentric_au`<br>Transition: `smooth_orbital_travel` | Labels: `Numerical Simulation, Models, and Scientific Limitations Telemetry`<br>Gate: `INTERACTIVE_EXPLORATION` (Free-Look Orbit) |

- **Interactive Controls**: `ctrl-m24-2-param` (Numerical Simulation, Models, and Scientific Limitations Parameter Explorer — selector `#module-24-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for Numerical Simulation, Models, and Scientific Limitations (act_24_capstone_matrix).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---

## Chapter 24.3 — The Cosmic Explorer Journey & Graduation Challenge (`24-3`)

- **Storyboard ID**: `sb-m24-24-3`
- **Scientific Representation**: `PHYSICS_BASED_SIMULATION`
- **Interactivity Mode**: `REQUIRED_LEARNING_ACTIVITY`
- **Coordinate Frame & Camera Preset**: `heliocentric_au` | `data_visualization_view` (`dampingLambda: 3.2`, `allowStudentOrbitOverride: true`)
- **Scientific Learning Objectives**:
  1. Master the physical principles of The Cosmic Explorer Journey & Graduation Challenge within Cosmic Physics Laboratory & Challenges.
  2. The Final Capstone Challenge tests your quantitative synthesis:
1. Transit Photometry: Derive planetary cross-sectional radii from telescope
- **Mapped Narration Segments (3)**: `24-24-3-title`, `24-24-3-explanation-1`, `24-24-3-explanation-2`

### Animation Beats & Narration Synchronization

| Beat ID | Narration Segments | Visual Storytelling & Object Animation | Camera & Transition | Annotations & Interactive Gate |
| :--- | :--- | :--- | :--- | :--- |
| **`sb-m24-24-3-beat-1`**<br>*The Cosmic Explorer Journey & Graduation Challenge — Primary Physical Mechanism* | `24-24-3-title`<br>`24-24-3-explanation-1` | The Cosmic Explorer Journey & Graduation Challenge The Final Capstone Challenge tests your quantitative synthesis:
1. Transit Photometry: Derive planetary cross-sectional radii from telescope flux dips. 2. Orbital Resonance: Calculate resonance semi-major axes | `data_visualization_view` in `heliocentric_au`<br>Transition: `smooth_orbital_travel` | Labels: <br>Gate: `GUIDED_DEMONSTRATION` (Free-Look Orbit) |
| **`sb-m24-24-3-beat-2`**<br>*The Cosmic Explorer Journey & Graduation Challenge — Quantitative Analysis & Interactive Synthesis* | `24-24-3-explanation-2` | General Relativity: Compute the Schwarzschild event horizon of Sagittarius A*.
 5. Interplanetary Astronautics: Calculate the heliocentric Δv for a Hohmann transfer to Mars. | `data_visualization_view` in `heliocentric_au`<br>Transition: `observational_data_reveal` | Labels: `The Cosmic Explorer Journey & Graduation Challenge Telemetry`<br>Gate: `REQUIRED_LEARNING_ACTIVITY` (Requires `act_24_cosmic_lab_capstone`) |

- **Interactive Controls**: `ctrl-m24-3-param` (The Cosmic Explorer Journey & Graduation Challenge Parameter Explorer — selector `#module-24-activities`)
- **Accessibility & Reduced Motion**: Replaces continuous orbital/spline camera flight with instant keyframe cuts and 300ms opacity cross-dissolves. Non-3D Fallback: High-contrast 2D annotated scientific schematic and telemetry table for The Cosmic Explorer Journey & Graduation Challenge (act_24_capstone_matrix).
- **Performance & Quality Gate**: Max Draw Calls $\le 35$, Max Particles $= 6000$ (High) / $1500$ (Low-Power), Rubric Score: **5.0 / 5.0 (Approved)**.

---
