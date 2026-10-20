# COSMOS Cinematic Design System Specification

- **Project**: Our Visible Universe Academy (`https://ourvisibleuniverse.in`)
- **System**: COSMOS Cinematic Learning System (Prompt 02 of 18 — Section 4)
- **Scope**: Color System, Lighting System, Material System, Typography System, Camera Language & Transition System

---

## A. Color System

### A.1 Deep-Space Background & Canvas Palette

Astronomical backgrounds are selected per scene regime rather than applying a single flat background color:

| Token Name                    | Hex / Linear RGB          | Scene Regime & Pedagogical Role                                                                                                    |
| :---------------------------- | :------------------------ | :--------------------------------------------------------------------------------------------------------------------------------- |
| `--cosmos-void-obsidian`      | `#03050A`                 | Default interplanetary & interstellar deep-space vacuum background.                                                                |
| `--cosmos-void-extragalactic` | `#010205`                 | Deep cosmological & intergalactic void scenes (Modules 15–18, 20) where foreground Milky Way stars are absent.                     |
| `--cosmos-twilight-zenith`    | `#071126` $\to$ `#03050A` | Terrestrial horizon & Kármán-line ascent scenes (Modules 01.1, 02, 19, 21).                                                        |
| `--cosmos-hud-surface`        | `rgba(7, 11, 20, 0.78)`   | Translucent `backdrop-filter: blur(16px)` HUD surface for transport and activity overlays (`1px solid rgba(148, 163, 184, 0.16)`). |
| `--cosmos-hud-elevated`       | `rgba(15, 23, 42, 0.88)`  | Active question drawer, quiz card, and parameter inspector surface.                                                                |

### A.2 Scientifically Calibrated Stellar & Emissive Palette

Celestial bodies **never** use arbitrary decorative colors. Stellar and thermal emitters are driven by Planckian blackbody locus math (`src/stars/color-science.ts`):

| Physical Emitter / Spectral Class                              |  Effective Temp ($T_{\text{eff}}$)  |        Calibrated Hex Chromaticity         | Usage Across Modules                                                                   |
| :------------------------------------------------------------- | :---------------------------------: | :----------------------------------------: | :------------------------------------------------------------------------------------- |
| **Class O (Blue Supergiant / Pop III)**                        |   $30,000\text{–}45,000\text{ K}$   |                 `#9BB0FF`                  | M09, M10, M11 (Trapezium ionizing stars), M17.6 (Pop III First Stars).                 |
| **Class B (Blue-White Main Sequence)**                         |   $10,000\text{–}30,000\text{ K}$   |                 `#AABFFF`                  | M02 (Rigel, Spica), M09, M11.3 (Pleiades reflection nebula stars).                     |
| **Class A (White Hydrogen-Peak Star)**                         |   $7,500\text{–}10,000\text{ K}$    |                 `#CAD7FF`                  | M02, M03 (Sirius A, Vega), M09.                                                        |
| **Class F (Yellow-White Star)**                                |    $6,000\text{–}7,500\text{ K}$    |                 `#F8F7FF`                  | M09 (Procyon, Polaris), M19.7 (Cepheid variables).                                     |
| **Class G (Solar-Type Yellow Dwarf)**                          |    $5,200\text{–}6,000\text{ K}$    | `#FFF4EA` (Core `#FFFFFF`, Limb `#FDE047`) | M01, M05, M06, M07 (The Sun at $5,772\text{ K}$), M09, M20.1.                          |
| **Class K (Orange Dwarf / Subgiant)**                          |    $3,700\text{–}5,200\text{ K}$    |                 `#FFD2A1`                  | M09 (Arcturus, Aldebaran), M10.4 (Subgiant branch).                                    |
| **Class M (Red Dwarf / Red Supergiant)**                       |    $2,400\text{–}3,700\text{ K}$    |         `#FFCC6F` $\to$ `#FF6030`          | M03 (Proxima Centauri), M09, M10.5 (Betelgeuse), M12 (TRAPPIST-1), M20.4.              |
| **Balmer $\text{H}\alpha$ Recombination ($656.28\text{ nm}$)** | $\sim 10,000\text{ K}$ photoionized |           `#F43F5E` / `#E11D48`            | M07.4 (Chromosphere), M11.2 (Orion/Eagle H II emission), M13.2 (Spiral arm knots).     |
| **Forbidden $[\text{O III}]$ Emission ($500.7\text{ nm}$)**    |  $\sim 10^4\text{–}10^5\text{ K}$   |           `#14B8A6` / `#2DD4BF`            | M10.6 & M11.5 (Planetary nebulae M57/Helix), M11.2.                                    |
| **Chandra X-Ray Bremsstrahlung / Synchrotron**                 |     $10^7\text{–}10^8\text{ K}$     |           `#A855F7` / `#38BDF8`            | M11.6 (Crab Pulsar Wind), M14.5 (Corona), M15.3 (Cluster ICM), M16.3 (Bullet Cluster). |

### A.3 Semantic Scientific Annotation & Vector Colors

To build instant visual literacy across all 24 modules, physical vectors and measurement overlays use consistent semantic color coding:

| Semantic Role                                                  | Color Token       |           Hex           | Contrast on `#03050A` | Strict Usage Rule                                                                                        |
| :------------------------------------------------------------- | :---------------- | :---------------------: | :-------------------: | :------------------------------------------------------------------------------------------------------- |
| **Velocity / Tangential Motion ($\vec{v}$)**                   | `--vec-velocity`  |  `#22D3EE` (Cyan 400)   |   `11.4 : 1` (AAA)    | Orbital velocity arrows, proper motion vectors, solar wind streamlines.                                  |
| **Gravitational Force / Acceleration ($\vec{F}\_g, \vec{a}$)** | `--vec-gravity`   |  `#F59E0B` (Amber 500)  |    `9.8 : 1` (AAA)    | Centripetal gravity vectors, tidal force arrows, barycenter crosshairs.                                  |
| **Magnetic Field / Flux Lines ($\vec{B}$)**                    | `--vec-magnetic`  | `#C084FC` (Purple 400)  |    `8.1 : 1` (AAA)    | Planetary magnetospheres, solar coronal loops, pulsar dipole axes.                                       |
| **Distance / Scale Calipers & Rulers**                         | `--ann-scale`     |   `#38BDF8` (Sky 400)   |   `10.2 : 1` (AAA)    | $\text{km}$, $\text{AU}$, $\text{ly}$, $\text{pc}$, $\text{Mpc}$ dimension lines and parallax baselines. |
| **Habitable Zone / Validated Equilibrium**                     | `--ann-habitable` | `#34D399` (Emerald 400) |   `11.1 : 1` (AAA)    | Circumstellar habitable zone annulus, stable orbit confirmation, verified facts.                         |
| **Blueshift / Approaching ($\Delta\lambda < 0$)**              | `--doppler-blue`  |   `#38BDF8` (Sky 400)   |   `10.2 : 1` (AAA)    | Approaching radial-velocity star wobble, approaching accretion disk wing.                                |
| **Redshift / Receding ($\Delta\lambda > 0, z$)**               | `--doppler-red`   |   `#F87171` (Red 400)   |    `7.2 : 1` (AAA)    | Cosmological redshift $z$, receding star wobble, receding disk wing.                                     |

---

## B. Lighting System

1. **Heliocentric & Planetary Directional Illumination (`solar_directional_5772K`)**:
   - Primary `THREE.DirectionalLight` (or point light at solar origin) with color `#FFF9F0` and intensity `3.2` (physically scaled with ACES Filmic tone mapping).
   - Night-side planetary surfaces receive near-zero ambient fill (`ambientLight intensity = 0.03`, `#0F172A`) so day/night terminators and lunar phases (Module 05) are astronomically sharp and accurate.
   - Earth's night hemisphere uses a dedicated dot-product city-light emissive map active only where $\vec{N} \cdot \vec{L} < -0.05$.
2. **Atmospheric Scattering Limb Approximation**:
   - Planetary atmospheres (Earth, Venus, Mars, Titan, exoplanet limbs in M12/M23) use a custom Fresnel + sun-angle Rayleigh/Mie rim shader:
     $$I_{\text{rim}} = I_0 \cdot (1 - \max(0, \vec{N}\cdot\vec{V}))^p \cdot \text{smoothstep}(-0.25, 0.35, \vec{N}\cdot\vec{L})$$
   - During lunar eclipses (Chapter 05.6), Earth's atmospheric limb refracts a copper-red (`#C2410C`) umbral illumination cone onto the Moon.
3. **Stellar & Nebular Emissive Illumination**:
   - Stars, protostars, and accretion disks use self-luminous `THREE.ShaderMaterial` with Planckian core-to-limb darkening:
     $$I(\mu) = I(1)\,[1 - u(1 - \mu)], \quad \mu = \cos\theta = \vec{N}\cdot\vec{V}$$
4. **Exposure, Tone Mapping & Controlled Bloom**:
   - Renderer configuration: `gl.outputColorSpace = THREE.SRGBColorSpace`, `gl.toneMapping = THREE.ACESFilmicToneMapping` (or `AgXToneMapping` for high-dynamic-range nebulae), `gl.toneMappingExposure = 1.05`.
   - `UnrealBloomPass` parameters (reusing `src/stars/OpticsPostProcessing.tsx`): `threshold = 0.80`, `strength = 0.45`, `radius = 0.35`. UI text and 3D `<SafeHtml>` annotations render in the DOM overlay above the post-processed WebGL canvas so text is **never** blurred by bloom.

---

## C. Material System

Every astronomical object class uses a standardized, GPU-efficient material archetype:

1. **Terrestrial & Rocky Surfaces (Mercury, Moon, Mars, Asteroids)**:
   - Procedural multi-octave simplex/Worley crater normal & roughness maps (`roughness = 0.88`, `metalness = 0.04`), Lommel-Seeliger / Oren-Nayar diffuse retroreflection approximation for airless regolith.
2. **Oceanic & Cloud-Bearing Worlds (Earth, Ancient Mars, Eyeball Exoplanets)**:
   - Dual-layer material: base sphere with land/ocean specular mask (`roughness = 0.18` on liquid water, `0.82` on continents) + slightly elevated cloud shell (`radius = 1.012 R`) with alpha-blended cyclone/zonal cloud noise and shadow casting onto the surface below.
3. **Gas & Ice Giant Atmospheres (Jupiter, Saturn, Uranus, Neptune, Hot Jupiters)**:
   - Latitudinal zonal jet-band shader with Coriolis shear turbulence, storm oval vortices (Great Red Spot), and limb haze.
4. **Icy Ocean Moons (Europa, Enceladus)**:
   - High-albedo (`A = 0.67–0.81`) icy crust shader with reddish-brown hydrated salt lineae fractures, subsurface aqueous refraction layer in cutaway view, and anisotropic forward-scattering ice-plume particle shaders.
5. **Stellar Photospheres & Interiors**:
   - Time-evolving 3D simplex convection-granule shader (`uTime`, `uTemperatureK`, `uGranuleScale`), plus concentric spherical cutaway caps showing radiative diffusion zones and nuclear fusion shells.
6. **Nebular Gas & Interstellar Dust**:
   - Multi-layered volumetric billboarding / raymarched FBM clouds (`src/stars/nebula-shaders.ts`) supporting both additive emission ($\text{H}\alpha$, $[\text{O III}]$) and multiplicative Beer-Lambert dark-nebula dust extinction ($I = I_0 e^{-\tau_\lambda}$).
7. **Galactic Stellar Populations & Dark Matter Halos**:
   - Custom `THREE.Points` vertex/fragment shaders with size-attenuated Airy-core point sprites colored by stellar population age (Population I blue disk arms vs. Population II golden-red bulge/globulars) and fresnel-contoured translucent indigo NFW halo volumes.
8. **Relativistic Accretion Disks & Spacetime Grids**:
   - Logarithmic spiral Keplerian shear shader modulated by relativistic Doppler factor $\delta^3 = [\gamma(1 - \beta\cos\theta)]^{-3}$ and gravitational redshift $\sqrt{1 - R_s/r}$.
9. **Scientific Instruments & Spacecraft (JWST, HST, Chandra, ISS, Voyager, Perseverance)**:
   - Physically based metallic-roughness materials: vapor-deposited beryllium-gold mirrors (`#FACC15`, `metalness = 0.96`, `roughness = 0.08`), multi-layer Kapton sunshield foil, matte carbon-fiber optical metering trusses (`#1E293B`), and photovoltaic solar wing cells (`#1D4ED8`).

---

## D. Typography System

All typography in Fullscreen Cinematic Mode adheres to strict legibility and Zero-Pill rules:

| Element Role                          | Font Family                           | Size & Weight (Desktop / Mobile)        | Tracking & Line Height | Visual Treatment                                                                                                             |
| :------------------------------------ | :------------------------------------ | :-------------------------------------- | :--------------------- | :--------------------------------------------------------------------------------------------------------------------------- |
| **Stage & Module Kicker**             | `JetBrains Mono`, monospace           | `11px` / `10px`, `500` uppercase        | `0.12em`, `1.2`        | Unboxed muted text (`#94A3B8`) separated by `·` bullets.                                                                     |
| **Chapter Title (Top HUD)**           | `Space Grotesk` / `Inter`, sans-serif | `18px` / `15px`, `600`                  | `-0.01em`, `1.25`      | Crisp `#F8FAFC` with subtle drop shadow `0 1px 4px rgba(0,0,0,0.8)`.                                                         |
| **3D Object Callout Label**           | `Inter`, sans-serif                   | `13px` / `12px`, `600`                  | `0.01em`, `1.2`        | Anchored via `1px` leader line (`rgba(248,250,252,0.45)`) to 3D node; dark backdrop `rgba(3,5,10,0.75)`.                     |
| **Scale, Distance & Telemetry Value** | `JetBrains Mono`, monospace           | `13px` / `11px`, `500` (`tabular-nums`) | `0.02em`, `1.3`        | `font-variant-numeric: tabular-nums` so live counters never jitter horizontally.                                             |
| **Mathematical Equations**            | KaTeX / Math Serif + `JetBrains Mono` | `15px` / `13px`, `400`                  | `0.02em`, `1.4`        | Rendered cleanly inside the scientific callout or caption band with variable color-coding matching 3D vectors.               |
| **COSMOS Live Narration Captions**    | `Inter`, sans-serif                   | `17px` / `14px`, `500`                  | `0.005em`, `1.55`      | High-contrast `#F8FAFC` on `rgba(3, 5, 10, 0.82)` panel (`contrast >= 14:1`), active spoken clause highlighted in `#38BDF8`. |
| **Activity Instructions & Prompts**   | `Inter`, sans-serif                   | `14px` / `13px`, `500`                  | `0em`, `1.45`          | Clear action-oriented instruction step with live validation status text.                                                     |

---

## E. Camera Language Summary

11 standardized camera behaviors (detailed mathematically in `docs/academy/cinematic-camera-language.md`) govern all 172 storyboards:

1. `establishing_shot` — Wide contextual framing establishing coordinate axes and neighborhood.
2. `planetary_orbital_shot` — Damped spherical orbit tracking a rotating/orbiting world.
3. `object_close_up` — Macro surface/feature inspection (sunspot umbra, hydrothermal chimney, obelisk shadow).
4. `scientific_cross_section` — Orthogonal or $35^\circ$ isometric framing of a peeled interior cutaway.
5. `object_following_camera` — Co-moving chase camera locked to a moving photon, comet, or planet.
6. `fixed_observation_camera` — Horizon-locked or observer-locked viewpoint (planetarium dome, transit chord).
7. `scale_comparison_view` — Orthographic or long-focal-length ($25^\circ\text{ FOV}$) lineup eliminating perspective distortion during size comparisons.
8. `deep_space_flythrough` — Volumetric traversal through nebulae, star clusters, or cosmic web filaments.
9. `timeline_camera` — Lateral tracking shot along a chronological or evolutionary axis (BBN $\to$ CMB $\to$ Cosmic Dawn).
10. `instrument_viewpoint` — Ray-traced optical bench or simulated telescope detector/eyepiece view.
11. `data_visualization_view` — Synchronized 3D physical system paired with live H-R, light-curve, or rotation-curve graph.

---

## F. Transition Language

All transitions between animation beats and chapters use one of **7 deterministic, scientifically meaningful transitions** (flashy wipes, star-wars iris cuts, or disorienting whip-pans are banned):

| Transition ID                   |         Duration          | Mathematical / Visual Mechanism                                                                                | Primary Pedagogical Use Case                                                                                 |
| :------------------------------ | :-----------------------: | :------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------- |
| `smooth_orbital_travel`         | $1.2\text{–}2.5\text{ s}$ | Spherical coordinate damping ($\lambda = 3.2$) around common focus target.                                     | Repositioning from dayside to terminator, or face-on to edge-on galaxy disk.                                 |
| `scale_aware_cosmic_zoom`       | $2.0\text{–}3.5\text{ s}$ | Logarithmic distance interpolation $r(t) = r_0 (r_1/r_0)^{s(t)}$ with `LODTransitionManager` alpha cross-fade. | Zooming from Earth ($10^7\text{ m}$) to Solar System ($10^{13}\text{ m}$) to Milky Way ($10^{21}\text{ m}$). |
| `object_to_object_slew`         | $1.5\text{–}2.2\text{ s}$ | Catmull-Rom spline translation with quaternion `slerp` look-at transfer.                                       | Moving from Mercury to Venus to Earth, or from White Dwarf to Neutron Star.                                  |
| `scientific_cross_section_peel` | $1.0\text{–}1.8\text{ s}$ | Shader clipping plane / octant angle $\theta_{\text{clip}} \in [0, 2\pi/3]$ animated smoothly.                 | Revealing the Sun's radiative zone, Earth's iron core, or Europa's subsurface ocean.                         |
| `chronological_transformation`  | $1.5\text{–}3.0\text{ s}$ | Continuous parameter morphing along cosmic/stellar age $t$ (radius, $T_{\text{eff}}$, scale factor $a(t)$).    | Main-sequence star swelling into a Red Giant, or Wet Noachian Mars drying into modern Mars.                  |
| `comparison_split_transition`   | $0.8\text{–}1.4\text{ s}$ | Side-by-side dual model staging within a shared reference grid.                                                | Ptolemaic vs. Copernican Venus phases; Keplerian vs. Dark-Matter galaxy rotation.                            |
| `observational_data_reveal`     | $0.8\text{–}1.5\text{ s}$ | Spectral filter cross-fade (Optical $\leftrightarrow$ JWST Infrared $\leftrightarrow$ Chandra X-ray).          | Piercing dark nebulae in IR (M11.4, M21.6) or revealing cluster X-ray ICM gas (M15.3).                       |
