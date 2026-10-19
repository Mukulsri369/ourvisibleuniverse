# COSMOS Cinematic Art Direction & Fullscreen Experience Specification

- **Project**: Our Visible Universe Academy (`https://ourvisibleuniverse.in`)
- **System**: COSMOS Cinematic Learning System (Prompt 02 of 18)
- **Scope**: Global Visual Identity, Stage-Specific Art Direction (Stages 1–6), and Fullscreen Theatre UX Architecture

---

## 1. Executive Art Direction Philosophy: "Science Over Spectacle"

The **COSMOS Fullscreen Cinematic Learning Mode** transforms every instructional sublesson across all 24 modules (172 chapters, 960 narration segments) into an interactive, real-time scientific documentary directed by COSMOS.

Our visual north star synthesizes three disciplines:
1. **Hayden Planetarium / OpenSpace Dome Productions**: True-to-catalog stellar photometry, logarithmic scale transitions across 42 orders of magnitude ($10^{-15}\text{ m}$ to $8.8 \times 10^{26}\text{ m}$), and zero coordinate jitter.
2. **BBC / PBS *Cosmos* & NASA Goddard Scientific Visualization Studio (SVS)**: Purposeful camera choreography where every dolly, cross-section peel, and vector arrow directly illustrates the physical mechanism currently spoken by COSMOS.
3. **Interactive Observatory Telemetry**: Clean, unboxed typographic callouts (following strict Zero-Pill metadata discipline), live mathematical parameter readouts, and tactile laboratory sliders embedded inside the fullscreen viewport.

### 1.1 Ten Core Visual Pillars
1. **Deep Astronomical Darkness**: Space is not uniform `#000000` nor washed-out purple/blue; it is an obsidian photometric canvas (`#03050A` to `#070B14`) where background starlight, zodiacal dust, or extragalactic darkness reflects the actual observational regime of the chapter.
2. **Physically Grounded Illumination**: Stars radiate according to their Planckian blackbody temperature ($T_{\text{eff}} \in [2,400\text{ K}, 40,000\text{ K}]$); planets exhibit sharp collimated day/night terminators with physically motivated Rayleigh/Mie limb scattering.
3. **Surgical Cross-Sections & Cutaways**: Interior processes (solar proton-proton fusion, terrestrial iron-nickel cores, Europa's subsurface ocean, massive-star onion-skin shells) use clean $90^\circ$ or $120^\circ$ spherical octant cutaways with crisp layer boundary contours.
4. **Controlled HDR Photometry**: Bloom (`UnrealBloomPass`) is reserved strictly for high-luminance emitters (stellar photospheres, accretion disks, pulsar beams, ionized H II cores) with high threshold (`threshold >= 0.78`), preserving crisp legibility on all text and vector overlays.
5. **Meaningful Camera Choreography**: The camera moves only when revealing spatial geometry (e.g., rotating $90^\circ$ off Earth's sightline to unfold Orion's 3D depth in Chapter 02.2, or Tilting to the ecliptic plane in Chapter 05.5 to reveal the Moon's $5.145^\circ$ orbital node).
6. **Epistemic Transparency**: Every scene explicitly declares its scientific basis (`OBSERVATION_BASED`, `PHYSICS_BASED_SIMULATION`, `SCALE_ADJUSTED_EDUCATIONAL_MODEL`, or `ARTISTIC_SCIENTIFIC_RECONSTRUCTION`) and discloses any exaggerated planetary radii or compressed time scales.
7. **Zero-Slop Typography & Annotations**: No decorative neon HUD frames, spinning radar widgets, or pill-badge clutter. Scientific labels use crisp geometric sans (`Space Grotesk` / `Inter`) and tabular monospace (`JetBrains Mono`) tethered to 3D world anchors via $1\text{px}$ hairline leader lines.
8. **Deterministic Audio-Visual Lock**: Animations are parameterized by normalized narration progress $u \in [0, 1]$ within each `NarrationSegment`, ensuring that pausing, resuming, changing TTS speed ($0.75\times\text{–}1.5\times$), or interrupting COSMOS with a question freezes or adapts the scene deterministically.
9. **Seamless Interactive Handoff**: When COSMOS reaches an `ACTIVITY` or `VISUALIZATION` gate, the camera smoothly unlocks or frames the laboratory apparatus, allowing the student to manipulate real physical parameters without leaving fullscreen mode.
10. **Universal Accessibility**: Full support for `prefers-reduced-motion` (replacing camera flights with gentle cross-dissolves between static diagnostic views), keyboard-only navigation, screen-reader live regions, and high-contrast synchronized captions.

### 1.2 Explicit Visual Anti-Patterns (Strictly Prohibited)
- **No Identical Starfields**: Do not paste the same generic `<Stars />` sphere behind intergalactic cosmology scenes (Modules 15–18) where individual foreground stars would be physically absent.
- **No Uncontrolled Bloom or Lens Flares**: Never obscure planetary surface textures, Fraunhofer spectral lines, or H-R diagram axes with excessive post-processing glow.
- **No Arbitrary Particle Explosions**: Supernovae (M10.7), BBN (M17.3), and CMEs (M07.6) must follow structured radial velocity fields and shock-front shells, never random confetti emitters.
- **No Camera Shake or Perpetual Orbiting**: Never use artificial handheld camera shake; during dense mathematical or conceptual explanations, hold a steady, well-framed observation camera.
- **No Generic Rotating Spheres as Filler**: Every chapter must show the specific physical phenomenon taught in that sublesson.

---

## 2. Stage-Specific Visual Identities (Stages 1–6)

While unified under one design system, each of the Academy's six pedagogical stages possesses a distinct atmospheric and chromatic signature:

| Stage | Modules | Stage Title | Visual Identity & Lighting Signature | Primary Accent & Annotation Palette | Characteristic Visual Motifs |
| :--- | :---: | :--- | :--- | :--- | :--- |
| **Stage 1** | **01–04** | **Discovering Space** | **Wonder, Scale & Horizon Navigation**: Deep twilight-to-orbital gradients, Rayleigh blue horizon limbs (`#38BDF8`), logarithmic distance grids, and Cherenkov-cyan photon wavefronts (`#22D3EE`). | Cyan `#38BDF8` · Sky `#7DD3FC` · Warm Starlight `#F8FAFC` | Logarithmic concentric scale rings, 3D constellation depth pillars, trigonometric parallax baselines, $\vec{E}\times\vec{B}$ wave packets. |
| **Stage 2** | **05–08** | **Our Cosmic Neighborhood** | **Heliocentric Precision & Planetary Worlds**: High-contrast 5,772 K collimated sunlight (`#FFFBEB`), crisp umbral/penumbral shadow cones, tactile regolith/cloud shaders, and Keplerian gold orbital paths (`#F59E0B`). | Solar Amber `#F59E0B` · Orbital Cyan `#06B6D4` · Gravity Emerald `#10B981` | Spherical interior octant cutaways, equal-area Keplerian sector fans, velocity/gravity vector triads, magnetic reconnection arches. |
| **Stage 3** | **09–12** | **The Life of Stars** | **Planckian Radiance & Nebular Volumes**: Authentic OBAFGKM blackbody chromaticity ($40,000\text{ K}$ sapphire `#9BB0FF` to $2,600\text{ K}$ crimson `#FF6030`), volumetric Balmer $\text{H}\alpha$ (`#F43F5E`) & $[\text{O III}]$ (`#14B8A6`) emission clouds, and precision photometry curves. | Balmer Rose `#F43F5E` · Ionized Teal `#14B8A6` · Habitable Emerald `#22C55E` | 3D spatial H-R diagrams, onion-skin fusion shells, bipolar Herbig-Haro jets, transit light-curve chords, radial-velocity barycentric reflex loops. |
| **Stage 4** | **13–16** | **Galaxies & Extreme Objects** | **Relativistic Spacetime & Deep-Field Structure**: Spiral density-wave gold/azure arms, translucent indigo NFW dark-matter potential halos (`#6366F1`), relativistic Doppler-beamed accretion disks (`#FB923C` vs. `#991B1B`), and Einstein gravitational lensing arcs. | Relativistic Violet `#818CF8` · Accretion Amber `#FB923C` · Lensing Cyan `#38BDF8` | Flamm's paraboloid spacetime funnels, photon-sphere null geodesics, pulsar lighthouse cones, Laniakea velocity watersheds, Bullet Cluster X-ray/lensing separation. |
| **Stage 5** | **17–20** | **Understanding the Universe** | **Cosmological Time, Metric Geometry & History**: Expanding 3D comoving coordinate lattices, Planck CMB anisotropy thermal shells, warm museum-brass historical armillary spheres (`#D97706`) for M19, and deep-time ruby/obsidian entropy shifts for M20. | Cosmological Gold `#EAB308` · Redshift Crimson `#EF4444` · Brass `#D97706` | 13.8-Gyr FLRW expansion bell, stretching comoving photon waves, Ptolemaic deferent-epicycle clockwork, Hawking radiation horizon evaporation. |
| **Stage 6** | **21–24** | **Become a Space Scientist** | **Observatory Optics, Spacecraft Telemetry & Multi-Physics**: Beryllium-gold segmented mirrors (`#FACC15`), optical ray-tracing beams, NASA mission trajectory splines, astrobiological ocean-world cutaways, and multi-parameter laboratory HUDs. | Mirror Gold `#FACC15` · Telemetry Emerald `#10B981` · Lab Cyan `#0EA5E9` | Cassegrain/Wolter ray traces, Airy diffraction PSF surfaces, Hohmann transfer ellipses, Europa subsurface plumes, coupled multi-physics sandbox. |

---

## 3. Fullscreen Cinematic Viewport & Layout Specification (Section 12)

When the student activates **Fullscreen Cinematic Learning Mode**, the experience mounts inside a single root container (`#cosmos-cinematic-theatre-root`) using the native browser Fullscreen API (`element.requestFullscreen()`) with an automatic `position: fixed; inset: 0; z-index: 9999` full-viewport fallback for iOS Safari or restricted iframes.

### 3.1 Spatial Allocation & Non-Obstructive HUD Architecture
- **100% Viewport 3D Canvas (`z-index: 0`)**: A single persistent React Three Fiber `<Canvas>` fills `100vw x 100vh`. All peripheral page chrome is hidden.
- **Safe Central Composition Zone (Central 75% of Viewport)**: The primary celestial subject, vector arrows, and 3D world-anchored annotations are framed inside the central `[12%..82%]` vertical and `[10%..90%]` horizontal safe zone so HUD controls never overlap the scientific subject.
- **Top Telemetry Header Bar (`z-index: 20`, height `56px`, translucent gradient `from-slate-950/85 to-transparent`)**:
  - **Left**: Stage & Module Kicker + Chapter Title + Current Scientific Topic (`text-sm font-medium text-slate-100`).
  - **Center-Right**: Scientific Representation Classification text (`Observation-Based` · `Physics Simulation` · `Scale-Adjusted Model` with live scale ratio e.g. `Planet Radii 25x for Visibility`) + Epistemic Status indicator (`Fact` / `Model` / `Hypothesis`).
  - **Far Right**: Learning Level selector (`Junior` / `Explorer` / `Astronomer`), Quality Tier indicator, Annotation/Caption toggles, and **Exit Fullscreen (`Esc`)** button.
- **Synchronized Scientific Caption & Equation Band (`z-index: 20`, bottom `88px`, centered max-width `760px`)**:
  - Displays the active `NarrationSegment.displayText` with real-time spoken-word focus highlighting, accompanied by any beat-specific LaTeX equation or quantitative metric readout.
- **Bottom Director Transport & Voice Bar (`z-index: 30`, height `72px`, bottom `12px`, centered max-width `880px`)**:
  - **Transport**: Previous Eligible Step, Play / Pause / Resume toggle, Replay Current Beat, Next Eligible Step, and Chapter Beat Timeline Scrubber (showing beat markers and activity gates).
  - **Voice & Question Interrupt**: Push-to-Talk Microphone button (`Ask COSMOS`), typed question drawer toggle, and active `GuidedLearningState` status text.
- **Contextual Interactive Laboratory Dock (`z-index: 25`, Right-hand floating panel `width: 340px` on Desktop; collapsible bottom sheet on Mobile)**:
  - Appears **only** during `INTERACTIVE_EXPLORATION`, `REQUIRED_LEARNING_ACTIVITY`, or `ASSESSMENT_SUPPORT` beats. Renders the chapter's real parameter sliders, preset selectors, or quiz options inside the fullscreen portal so the student never leaves fullscreen mode.

### 3.2 Responsive Viewport Breakpoints
| Device Tier | Viewport Width | HUD & Control Layout | Touch & Input Ergonomics |
| :--- | :--- | :--- | :--- |
| **Desktop Theatre** | $\ge 1024\text{px}$ | Top bar + Bottom centered transport (`880px`) + Right-docked interactive parameter panel (`340px`) when active. | Mouse orbit/zoom on canvas; full keyboard shortcuts (`Space`, `Left/Right`, `M`, `C`, `L`, `Esc`). |
| **Tablet Landscape / Portrait** | $768\text{px}\text{–}1023\text{px}$ | Compact top bar + Bottom transport bar + Slide-over translucent right drawer (`300px`) for activity sliders. | Minimum `44px x 44px` touch targets; two-finger pinch zoom and single-finger orbit on 3D canvas. |
| **Mobile Viewport** | $< 768\text{px}$ | Minimal single-line top bar + 2-line max caption overlay + Compact bottom transport bar; interactive controls open in a bottom drawer (`max-height: 42vh`) leaving the top `58vh` unobstructed for the 3D scene. | Minimum `48px x 48px` primary transport buttons; simplified 3D label density (maximum 3 simultaneous world labels). |
