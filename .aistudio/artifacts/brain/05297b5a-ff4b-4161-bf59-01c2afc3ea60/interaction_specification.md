# Complete Interaction Specification & Scientific Visualization UX Architecture

**Our Visible Universe — Real-Time Navigable 3D Cosmos & Celestial Education**

---

## 1. Executive Summary & Design System Foundation

This specification defines the interactive behavior, astronomical data architecture, camera kinematics, and accessibility standards for **Our Visible Universe**, built in accordance with:

- **Design Constitution**: Premium dark aesthetic, typographic hierarchy (tabular monospace metrics, light display headings), zero visual noise, Framer Motion easing (`[0.16, 1, 0.3, 1]`), and high-performance WebGL/Three.js rendering.
- **Scientific Rigor**: IAU/ICRS coordinates, NASA JPL DE440 ephemerides, ESA Gaia DR3 astrometry, Bailer-Jones (2021) geometric distances, and NED isophotal galaxy parameters. Speculative features are strictly demarcated with clear "Model Reconstruction" notices.

---

## 2. Core Experience: Seamless 9-Tier Cosmic Scale Journey

Learners and astrophysicists can smoothly traverse 20 orders of magnitude across cosmic scales with zero camera clipping or disorientation:

| Step  | Level Name              | Astronomical Regime        | Metric Distance           | Light Lookback Time           | Default FOV | Target Framing                                                             |
| ----- | ----------------------- | -------------------------- | ------------------------- | ----------------------------- | ----------- | -------------------------------------------------------------------------- |
| **1** | **Earth**               | Terrestrial Biosphere      | 12,742 km (1.58e-5 ly)    | 0.00 s (Origin)               | 34°         | Centered on live orbital Earth coordinates, Rayleigh scattering terminator |
| **2** | **Moon**                | Earth Satellite System     | 384,400 km                | 1.28 light-seconds            | 32°         | Tidally locked lunar orbit around Earth                                    |
| **3** | **Solar System**        | Heliosphere & Kuiper Belt  | 100 AU (~15 billion km)   | 8.3 min (Sun) to 14 hr        | 42°         | Ecliptic 3/4 orbital inclination framing 8 major planets + belts           |
| **4** | **Nearby Stars**        | Local Interstellar Bubble  | 40 Light-Years (12.3 pc)  | 4.24 yr (Proxima) to 38 yr    | 44°         | Alpha Centauri, Sirius, Vega, TRAPPIST-1 within 48 ly radius               |
| **5** | **Milky Way**           | Barred Spiral (SBbc)       | 100,000 Light-Years       | 26,000 yr (Galactic Center)   | 48°         | 26,000 ly offset overview showing spiral arms and Sagittarius A*           |
| **6** | **Andromeda (M31)**     | Local Group Sister Spiral  | 2.537 Million Light-Years | 2.54 Million Years            | 48°         | SA(s)b disk overview with 1 trillion star particle density                 |
| **7** | **Galaxy Clusters**     | Virgo & Coma Superclusters | 54 Million Light-Years    | 54 Million Years (z=0.0038)   | 50°         | 1,500+ galaxies embedded in hot intracluster medium and M87 core           |
| **8** | **Cosmic Web**          | Filamentary Large-Scale    | 1.2 Billion Light-Years   | 1.2 Billion Years (z ≈ 0.1)   | 52°         | IllustrisTNG / 2dFGRS dark matter filaments, nodes, and cosmic voids       |
| **9** | **Observable Universe** | Particle Horizon & CMB     | 46.5 Billion Light-Years  | 13.8 Billion Years (z ≈ 1100) | 54°         | 2.725 K Cosmic Microwave Background last-scattering sphere                 |

---

## 3. Camera Kinematics & Motion Architecture

### 3.1 Adaptive Camera Speed & Logarithmic Damping

- **Distance Range**: Spans $10^{-10}$ ly (planetary surfaces) to $5 \times 10^{10}$ ly (cosmic horizon).
- **Smooth Log Zoom Interpolation**:
  $$\text{radius}_{t} = \exp\left( \ln(\text{radius}) + (\ln(\text{desired}) - \ln(\text{radius})) \cdot (1 - e^{-4 \Delta t}) \right)$$
- **Angular Sensitivity Scaling**:
  - Close-up inspection ($r < 10^{-5}$ ly): $0.0028 \text{ rad/px}$ (high-precision planetary panning).
  - Stellar systems ($10^{-5} \le r \le 10^{6}$ ly): $0.005 \text{ rad/px}$.
  - Extragalactic scales ($r > 10^6$ ly): $0.004 \text{ rad/px}$.
- **Momentum & Friction**: Angular inertia decays at $0.92$ per frame when releasing pointer drag, eliminating abrupt stops.

### 3.2 Dynamic Near & Far Clipping Plane Adjustment

To eliminate z-fighting and prevent near-plane geometry slicing:

- $\text{near} = \max(10^{-11}, \min(0.08, r \times 10^{-4}))$
- $\text{far} = \max(10^5, \min(10^{12}, r \times 10^4))$
- The projection matrix only recalculates when relative divergence exceeds 40%, ensuring zero frame drops.

### 3.3 Target Tracking Modes

- **Follow Live Body**: Locks camera target onto the dynamic position matrix `__planetPositions.get(planetName)` with velocity feed-forward, preventing high-speed orbiting worlds from drifting out of view.
- **Free Flight Look (`S`)**: Decouples target anchoring from celestial bodies, freezing the target coordinate in universal space while allowing full spherical look-around.
- **Auto-Orbit (`O`)**: Continuous gentle azimuthal rotation ($\omega = 0.06 \text{ rad/s}$) around the target body for hands-free exhibition.
- **North Orientation Reset (`R`)**: Instant mathematical damp of $\phi \to \pi / 2.2$ and $\theta \to 0$, aligning the viewport with Galactic and Ecliptic North.

---

## 4. Universal Search System Heuristics

The universal search index synthesizes:

1. **Solar System Bodies**: 8 major planets, dwarf planets (Pluto, Ceres, Eris, Haumea, Makemake), major moons (Moon, Io, Europa, Ganymede, Callisto, Titan, Enceladus, Triton).
2. **Gaia DR3 Astrometry Catalog**: Parallaxes, RUWE single-star goodness-of-fit, Bailer-Jones geometric distances, and photometric colors.
3. **Confirmed Exoplanets**: NASA Exoplanet Archive host stars and verified orbital parameters ($a$, $e$, $P$, $T_\text{eq}$, $R_\oplus$, $M_\oplus$, Habitable Zone).
4. **Observed Deep-Space Landmarks**: Supermassive black holes (Sagittarius A*, M87*), pulsars (Crab, Vela), emission and planetary nebulae (Orion M42, Ring M57, Helix), quasars (3C 273).
5. **Observational Extragalactic Catalog**: NED/IPAC galaxies with Hubble morphology classes, host groups/clusters, and spectroscopic redshifts ($z$).

### Search Confidence & Matching Algorithm

- **100%**: Exact designation match (e.g. `Andromeda`, `M31`, `TRAPPIST-1`, `Mars`).
- **94–98%**: Catalog cross-identity or alias match (e.g. `NGC 224`, `HD 209458`, `IAU Sol-EARTH`).
- **85–92%**: Name prefix or identifier match.
- **70–82%**: Astrophysical category, host star, or morphology keyword match.
- **No Hallucination Rule**: When no verified catalog entries match, the system explicitly displays _"No verified catalog objects found matching '[query]'"_ alongside recommended search identifiers.

---

## 5. 7-Tab Universal Science Dossier Schema

Accessible from search results, info sidebars, and the upgraded celestial sitemap:

| Tab                          | Key Visual & Scientific Contents                                                                                                                                                                    |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. Overview**              | Grade-adaptive explanations (Explorer, Standard, Advanced Science), Model Reconstruction disclaimer, distance summary, spectral class, and effective temperature.                                   |
| **2. Scientific Data**       | Tabular astrophysical parameters: Primary ID, distance in pc & ly, apparent & absolute magnitudes, solar/Earth radii & masses, cosmological redshift $z$, ICRS equatorial and galactic coordinates. |
| **3. 3D Visualization**      | Interactive relative scale comparison bars against Earth diameter (12,742 km), surface light lookback time, and direct auto-orbit controls.                                                         |
| **4. Observations**          | Observational history across major missions (Hubble, JWST, Gaia, Chandra, Event Horizon Telescope, Voyager, Cassini).                                                                               |
| **5. Formation & Evolution** | Cosmological and stellar lifecycle timeline from primordial molecular cloud / Big Bang accretion to modern morphology.                                                                              |
| **6. Related Objects**       | Navigable parent-child celestial graph (e.g. Galaxy $\to$ Star System $\to$ Host Star $\to$ Exoplanet $\to$ Moon).                                                                                  |
| **7. References**            | Verified citations linked to NASA ADS, JPL Solar System Dynamics, ESA Gaia Archive, and NED/IPAC database.                                                                                          |

---

## 6. Upgraded Celestial Sitemap Architecture

Located as an accessible sliding drawer on the left:

1. **Cosmic Scale Tab ("Scale")**: Direct access to the 9 cosmic scale journey milestones with instant progress tracking.
2. **Category Filters**:
   - `Planets`: Sub-divided by inner terrestrial, gas giants, ice giants, dwarf planets, and subordinate moons.
   - `Stars`: Sorted by distance from the Sun with spectral class badges.
   - `Galaxies`: Morphology, distance, and 3D reconstruction indicators.
   - `Objects`: Deep-space landmarks grouped by physical category.
3. **Quick Action Launcher**:
   - `Search` (Cmd+K / `/`)
   - `Vistas` (Camera Bookmarks)
   - `History` (Major Discoveries Timeline)
4. **Direct Dossier Access**: Every listed entry includes a dedicated file icon button triggering the 7-Tab Science Dossier without requiring a camera fly-to.

---

## 7. Accessibility & Multi-Modal Controls

- **Keyboard Navigation**:
  - `Space`: Logarithmic zoom out
  - `Ctrl`: Logarithmic zoom in
  - `S`: Toggle Free-Flight Look
  - `O`: Toggle Auto-Orbit
  - `R`: Reset Orientation to Celestial North
  - `/` or `Cmd+K`: Universal Search Modal
  - `?`: Accessibility & Shortcut Guide
  - `Esc`: Clear focus, close modal, deselect object
- **Touch Gestures**: Single-finger drag for orbit, two-finger pinch for zoom, tap-to-focus on mobile.
- **Screen Reader Compliance**: `aria-label`, `role="dialog"`, `role="navigation"`, high-contrast text (`text-white/90`, `text-cyan-300`, `text-amber-300`), and visible keyboard focus rings.
- **Reduced Motion**: Respects `prefers-reduced-motion` with dampened camera fly-to durations and reduced particle velocity.
