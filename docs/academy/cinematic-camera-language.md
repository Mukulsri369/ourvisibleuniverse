# COSMOS Scientific Cinematography & Multi-Scale Camera Language

- **Project**: Our Visible Universe Academy (`https://ourvisibleuniverse.in`)
- **System**: COSMOS Cinematic Learning System (Prompt 02 of 18 — Section 8)
- **Scope**: 11 Camera Archetypes, Coordinate Frame Management, Floating-Origin Scale Transformations & Free-Look Handoff

---

## 1. The 11 Canonical Astronomy Camera Archetypes

Every animation beat across all 172 sublessons specifies one of the following 11 camera archetypes (`CinematicCameraType` in `src/lib/cosmos/cinematic-storyboard-types.ts`):

| # | Camera Archetype ID | Default FOV | Coordinate Frame | Framing & Motion Specification | Primary Pedagogical Purpose |
| :---: | :--- | :---: | :--- | :--- | :--- |
| **1** | `establishing_shot` | $45^\circ$ | Scene-dependent | Framed at $3.5\text{–}6.0\times$ system bounding radius, $25^\circ\text{–}35^\circ$ elevation above fundamental plane; slow damped azimuthal drift ($\dot{\theta} \le 0.015\text{ rad/s}$). | Introduces spatial context, orbital plane orientation, and relative neighborhood at the start of a chapter. |
| **2** | `planetary_orbital_shot` | $38^\circ$ | `geocentric` / `heliocentric` | Spherical coordinates $(r, \theta, \phi)$ locked to target planet's moving center of mass at $r = 2.2\text{–}3.5\,R_p$, framing both the sunlit hemisphere and day/night terminator. | Inspecting planetary atmospheres, axial obliquity, terminator rotation, magnetospheres, and ring systems. |
| **3** | `object_close_up` | $28^\circ$ | Local body frame | Tight framing ($r = 1.15\text{–}1.6\,R_{\text{feature}}$) with reduced angular sensitivity; telephoto compression minimizes horizon distortion. | Inspecting sunspot magnetic umbrae, Enceladus tiger-stripe plumes, Eratosthenes' Alexandria obelisk, or hydrothermal chimneys. |
| **4** | `scientific_cross_section` | $32^\circ$ | `stellar_interior` / body frame | Positioned at $(\theta = 45^\circ, \phi = 65^\circ)$ directly facing the peeled $90^\circ/120^\circ$ spherical cutaway wedge so all concentric internal shells are simultaneously legible. | Teaching internal layers of the Sun (M07.2), rocky/giant planets (M06.2–06.4), massive stars (M10.5), and neutron stars (M14.2). |
| **5** | `object_following_camera` | $42^\circ$ | Co-moving target frame | Camera position $\vec{r}_{\text{cam}}(t) = \vec{r}_{\text{target}}(t) + \vec{\Delta}_{\text{offset}}$ tracks a propagating photon wave-packet, comet near perihelion, or Hohmann transfer spacecraft. | Visualizing finite speed of light $c$ (M03.3, M04.2–04.3), cometary tail orientation (M06.6), and spacecraft trajectories (M22). |
| **6** | `fixed_observation_camera` | $55^\circ$ | `terrestrial_horizon` | Stationary observer viewpoint (e.g., ground observer at latitude $\phi$ looking at azimuth/altitude, or Earth line-of-sight watching an exoplanet transit). | Night-sky constellation recognition, star trails (M02), solar/lunar eclipses from Earth (M05), and transit photometry (M12.2). |
| **7** | `scale_comparison_view` | $20^\circ\text{–}25^\circ$ | Normalized lineup frame | Long-focal-length / near-orthographic front elevation of objects aligned on a shared baseline plane so apparent screen size equals true physical radius ratio. | Comparing rocky/giant planets (M06), dwarfs vs. supergiants (M09.6), and White Dwarfs vs. Neutron Stars (M14.2). |
| **8** | `deep_space_flythrough` | $50^\circ$ | `galactocentric` / `comoving` | Smooth Catmull-Rom 3D spline traversal through volumetric particle clouds with parallax depth cues and zero roll oscillation. | Exploring emission/reflection/dark nebulae (M11), globular cluster cores (M11.8), and Cosmic Web filaments/voids (M15). |
| **9** | `timeline_camera` | $40^\circ$ | Chronological axis | Lateral dolly tracking along a 3D temporal or evolutionary manifold ($x$-axis = $\log t$ or scale factor $a(t)$). | Stellar evolution tracks (M10), Big Bang to modern universe expansion horn (M17), and deep-time future eras (M20). |
| **10** | `instrument_viewpoint` | $35^\circ$ | `optical_instrument_bench` | Travels alongside collimated starlight rays entering refractor/reflector/Wolter optics, diffraction gratings, or interferometer baselines. | Explaining telescope light gathering, chromatic aberration, grazing-incidence X-ray reflection, and spectroscopy (M21). |
| **11** | `data_visualization_view` | $38^\circ$ | Split / coupled frame | Frames the 3D physical system in the upper/left $65\%$ of the viewport while aligning a 3D/HUD quantitative plot (H-R diagram, RV curve, Hubble diagram) in the remaining $35\%$. | Connecting physical motion to empirical graphs: Kepler's 3rd Law (M08.6), H-R Diagram (M09.7), Transit/RV curves (M12), Rotation curves (M16.2). |

---

## 2. Multi-Scale Coordinate Frames & Floating-Origin Precision

### 2.1 The IEEE-754 Float32 Precision Constraint
Standard WebGL vertex shaders operate in 32-bit floating point (`float32`, 24-bit mantissa $\approx 7$ significant decimal digits). Attempting to place Earth ($R_\oplus = 6.371 \times 10^6\text{ m}$), the Solar System ($4.5 \times 10^{12}\text{ m}$), the Milky Way ($9.5 \times 10^{20}\text{ m}$), and the Observable Universe ($8.8 \times 10^{26}\text{ m}$) inside a single naive meter-scale coordinate system causes catastrophic vertex jitter, z-fighting, and near/far frustum clipping.

### 2.2 Hierarchical Reference Frames & Continuous Scale Transitions
Our cinematic camera architecture leverages `FloatingOriginManager` (`src/lib/astronomy/floating-origin.ts`) and `LODTransitionManager` (`src/stars/lod/LODTransitionManager.ts`) across **7 canonical coordinate frames**:

1. **Local Instrument / Molecular Frame (`optical_instrument_bench`)**: $1\text{ scene unit} = 1\text{ m}$ (or $1\text{ nm}$ in subatomic/molecular views).
2. **Terrestrial & Atmospheric Frame (`terrestrial_horizon`)**: $1\text{ scene unit} = 100\text{ km}$ (Earth radius $= 63.71\text{ units}$; Kármán line $= 1.0\text{ unit}$ above surface).
3. **Cis-Lunar Geocentric Frame (`geocentric_cis_lunar`)**: $1\text{ scene unit} = 1\,R_\oplus = 6,371\text{ km}$ (Moon at $60.27\text{ units} \approx 30\,D_\oplus$).
4. **Heliocentric Planetary Frame (`heliocentric_au`)**: $1\text{ scene unit} = 1\text{ AU} = 1.496 \times 10^8\text{ km}$ (Mercury $0.39$ to Kuiper Belt $50\text{ units}$).
5. **Stellar Radius Frame (`stellar_interior_ro`)**: $1\text{ scene unit} = 1\,R_\odot = 696,340\text{ km}$ (or normalized $R_\star$ for supergiants/compact remnants).
6. **Galactocentric & Local Group Frame (`galactocentric_kpc`)**: $1\text{ scene unit} = 1\text{ kpc} = 3,261.56\text{ ly}$ (Milky Way diameter $\approx 30\text{ units}$; M31 at $778\text{ units}$).
7. **Comoving Cosmological Frame (`comoving_cosmological`)**: $1\text{ scene unit} = 10\text{ Mpc}$ (Laniakea $= 16\text{ units}$; Observable Particle Horizon radius $= 1,425\text{ units}$).

### 2.3 Logarithmic Cross-Frame Zoom Handshake
When a storyboard transitions across coordinate frames (e.g., Module 01's zoom from Earth to the Cosmic Web, or Module 03's distance ladder):
- The camera interpolates a continuous logarithmic scale exponent $k(t) = \log_{10}(\text{scaleMeters}(t))$ using a $C^2$-smooth quintic Hermite curve.
- Within overlapping boundary bands ($\Delta k = \pm 0.35$), `LODTransitionManager` cross-fades the outgoing coordinate-frame group (`alphaNear`) and incoming coordinate-frame group (`alphaFar`) while keeping the focal anchor at the origin `(0, 0, 0)` of the GPU scene.
- Camera frustum planes remain fixed at safe ratios (`near = 0.05`, `far = 5000`, with `logarithmicDepthBuffer: true`), completely eliminating near/far clipping and float32 jitter.

---

## 3. Frame-Rate-Independent Camera Motion & Student Interaction Compatibility

### 3.1 Exponential Damping & Spline Evaluation
All camera movements inside `CosmosCinematicCameraRig` execute inside R3F's `useFrame((_, delta) => ...)` using frame-rate-independent exponential decay:
$$\vec{p}(t + \Delta t) = \text{lerp}\!\left(\vec{p}(t),\, \vec{p}_{\text{target}},\, 1 - e^{-\lambda \Delta t}\right)$$
where $\lambda \in [2.5, 4.5]$ ensures buttery motion across $60\text{ Hz}$, $120\text{ Hz}$, and $144\text{ Hz}$ displays.

### 3.2 Student Free-Look Override & Re-Lock Protocol
1. **Detection**: When `allowStudentOrbitOverride === true` on the active beat, pointer-down drag or two-finger pinch sets `isUserOrbitingCamera = true` on `CosmosCinematicDirector`.
2. **Zero Camera Fighting**: While `isUserOrbitingCamera` is active, automated camera position/rotation updates from narration cues are suspended (shader uniforms, object animations, and annotations continue to update in sync with narration).
3. **One-Click or Auto Re-Lock**: A quiet button (`Recenter COSMOS View`) appears in the top HUD; clicking it—or advancing to the next major sublesson—smoothly slerps the camera back to the director's choreographed keyframe over $1.2\text{ s}$.
