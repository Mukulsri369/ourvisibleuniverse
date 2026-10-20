# COSMOS Cinematic Performance Budget & Accessibility Specification

- **Project**: Our Visible Universe Academy (`https://ourvisibleuniverse.in`)
- **System**: COSMOS Cinematic Learning System (Prompt 02 of 18 — Sections 14, 15, 16 & 20)
- **Scope**: Single-Canvas WebGL Context Governance, 3-Tier Adaptive Quality Matrix, Frame-Time Budgets & Universal Accessibility

---

## 1. Single-Canvas WebGL Governance (Solving Context Loss)

Prompt 01 identified that mounting multiple independent `<Canvas>` instances on the same page (`AcademyHero`, inline module visualizers, and activity labs) risks browser WebGL context exhaustion on mobile devices and integrated GPUs.

### 1.1 Mandatory WebGL Context Rules

1. **Single Active Fullscreen Context**: When `CosmosCinematicPlayer` opens, it mounts **one persistent `<Canvas>`** inside the fullscreen portal and automatically pauses (`frameloop="never"`) or unmounts any background inline `<Canvas>` components on the underlying page.
2. **Viewport Intersection Pausing for Inline Canvases**: When viewing lessons inline (outside fullscreen mode), `IntersectionObserver` sets `frameloop="demand"` or `"never"` on any `<Canvas>` whose bounding rect is outside the viewport.
3. **Zero Per-Frame Object Allocation**: Inside all `useFrame` callbacks, scratch vectors (`_v1`, `_v2`, `_q1`, `_m4`) must be pre-allocated at module scope. Calling `new THREE.Vector3()` or `setState()` inside `useFrame` is strictly forbidden.

---

## 2. Three-Tier Adaptive Rendering Quality Matrix (Section 14)

`CosmosPerformanceGovernor` monitors rolling 60-frame p95 frame duration (`src/stars/OpticsPostProcessing.tsx` pattern) and classifies the device into one of three quality tiers (with manual override available in the fullscreen header):

| Rendering Parameter                  | `HIGH_QUALITY` (Desktop / Discrete GPU)                                    | `BALANCED_QUALITY` (Laptop / Tablet / Integrated GPU) | `LOW_POWER_QUALITY` (Mobile / Battery Saver)                     |
| :----------------------------------- | :------------------------------------------------------------------------- | :---------------------------------------------------- | :--------------------------------------------------------------- |
| **Target Frame Rate**                | $60\text{–}120\text{ FPS}$ ($\le 16.6\text{ ms}$)                          | $60\text{ FPS}$ ($\le 16.6\text{ ms}$)                | $30\text{–}60\text{ FPS}$ ($\le 33.3\text{ ms}$)                 |
| **Device Pixel Ratio (`dpr`)**       | `[1.0, 2.0]`                                                               | `[1.0, 1.5]`                                          | `[0.75, 1.0]`                                                    |
| **Antialiasing**                     | Hardware MSAA `4x` + half-float target                                     | Hardware MSAA `2x`                                    | Disabled (`antialias: false`)                                    |
| **HDR Bloom (`UnrealBloomPass`)**    | Enabled (`Full Resolution`, `threshold: 0.8`)                              | Enabled (`Half Resolution`)                           | Disabled (Replaced by zero-cost additive sprite glow billboards) |
| **Volumetric Raymarching Steps**     | $48\text{–}64$ steps (Nebulae / Accretion Disk)                            | $24\text{–}32$ steps                                  | $12$ steps or layered 2.5D billboards                            |
| **Particle Budget (`THREE.Points`)** | $100\%$ ($8,000\text{–}15,000$ pts)                                        | $50\%$ ($4,000\text{–}7,500$ pts)                     | $25\%$ ($1,500\text{–}3,000$ pts)                                |
| **Shadow Mapping**                   | `PCFSoftShadowMap` ($1024^2$) for Eclipses (M05)                           | Analytic umbral/penumbral cone shader                 | Analytic cone shader (zero shadow map pass)                      |
| **Max Simultaneous Draw Calls**      | $\le 65$ draw calls                                                        | $\le 45$ draw calls                                   | $\le 25$ draw calls                                              |
| **Idle / Paused Frameloop**          | Drops to $15\text{ FPS}$ after $3\text{ s}$ of pause with no pointer input | Drops to `frameloop="demand"` when paused             | `frameloop="demand"` whenever narration is paused                |

---

## 3. Accessibility & Learning-Level Adaptation Specification (Section 16)

Students must achieve 100% of the learning objectives and module completion requirements even if WebGL is unavailable, motion is disabled, or screen readers are used.

### 3.1 Universal Accessibility Guarantees

1. **Synchronized Closed Captions & Transcript Drawer**:
   - Every spoken sentence in `NarrationSegment.displayText` is rendered in the high-contrast bottom caption band (`>= 14:1` contrast ratio) with word-by-word or clause-by-clause visual focus.
   - Students can open the full **Chapter Text Transcript** panel inside fullscreen mode to read ahead or jump directly to any segment.
2. **Reduced-Motion Compliance (`prefers-reduced-motion: reduce`)**:
   - Automatically detected via `window.matchMedia('(prefers-reduced-motion: reduce)')` plus an explicit HUD toggle (`Reduced Motion`).
   - Replaces continuous orbital camera sweeps, rapid cosmic zooms, and high-frequency pulsar/supernova flashes with **steady diagnostic camera keyframes** connected by $300\text{ ms}$ opacity cross-dissolves.
3. **Non-3D Explanatory Alternative & Low-Bandwidth Mode**:
   - Every storyboard specifies a `non3DExplanatoryAlternative` (structured SVG/Canvas scientific diagram + quantitative telemetry table + full interactive parameter controls) that renders automatically if WebGL is unsupported or if the student selects **"2D Schematic Diagram Mode"**.
   - All 24 modules in `CosmosActivityAdapter` already support `accessibleAlternativeAvailable` (`isAccessibleModeActive`) so students in 2D mode can complete every required laboratory activity.
4. **Keyboard Navigation & Screen-Reader (`aria-live`) Support**:
   - Full keyboard map inside `CosmosCinematicPlayer`:
     - `Space` / `K`: Play / Pause COSMOS narration and animation.
     - `ArrowLeft` / `ArrowRight`: Previous / Next animation beat or narration segment.
     - `M`: Toggle Push-to-Talk microphone (`Ask COSMOS`).
     - `C`: Toggle Closed Captions.
     - `L`: Toggle 3D Scientific Labels & Annotations.
     - `A`: Focus Interactive Activity Controls when an activity gate is active.
     - `Escape`: Exit Fullscreen Cinematic Mode (returns cleanly to inline lesson view).
   - An `aria-live="polite"` region announces each new animation beat's `screenReaderAriaSummary` (e.g., _"Scene updated: Solar interior cutaway showing the core at 15 million Kelvin, radiative zone, and convective zone"_).

### 3.2 Three-Tier Learning Level Visual Adaptation (`LearningLevel`)

The 3D scene and annotation layer dynamically adapt to the student's selected `LearningLevel` (`junior`, `explorer`, `astronomer`):

| Learning Level                        | Target Audience                 | Visual & Annotation Adaptation in Fullscreen Mode                                                                                                                                                                                                                                                  |
| :------------------------------------ | :------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`junior`** (_Junior Explorer_)      | Ages 6–10 / Beginners           | **Clear Visual Storytelling**: Maximum 3 bold structural labels on screen (`Sun`, `Earth`, `Moon's Shadow`); everyday scale analogies highlighted (`30 Earths fit between Earth and Moon`); complex differential equations hidden; simplified 1-slider guided interactions.                        |
| **`explorer`** (_Space Explorer_)     | Ages 11–15 / General Learners   | **Quantitative Discovery**: Full structural + measurement annotations (`384,400 km`, `1.28 light-seconds`, `23.44° Axial Tilt`); primary algebraic laws displayed ($v = H_0 d$, $P^2 = a^3$); multi-parameter interactive exploration and comparative toggles.                                     |
| **`astronomer`** (_Young Astronomer_) | Ages 16+ / Advanced & Undergrad | **Complete Astrophysical Telemetry**: Full vector triads ($\vec{v}, \vec{F}_g, \vec{L}, \vec{B}$), exact LaTeX governing equations ($v^2 = GM(2/r - 1/a)$, $\Delta F/F = (R_p/R_\star)^2$, $R_s = 2GM/c^2$), live phase-space / spectral plots, error/uncertainty notes, and literature citations. |
