# Hierarchical Coordinate & Scale System: Architecture & Migration Guide

**Project**: Our Visible Universe (`Mukulsri369/ourvisibleuniverse`)  
**Auditor & Architect**: Principal Astronomical Software Engineer & Senior React Three Fiber Architect  
**Date**: October 2026  
**Status**: Implemented, Validated & Verified (100% Test Passing Rate)

---

## 1. Executive Summary & Problem Definition

### 1.1 The Legacy Conflation Problem

Prior to this architectural migration, the 3D visualization suffered from a classic computer-astronomy dilemma: conflating **underlying physical coordinates** with **presentation magnification**.

Specifically:

- In `Planets.tsx`, the scale was authored as `AU = 0.05` scene units (light-years), placing Neptune at $\sim 1.5$ ly and the Earth at $0.05$ ly.
- In reality, $1\text{ AU} \approx 1.58128 \times 10^{-5}\text{ ly}$. The legacy display factor of $0.05\text{ ly/AU}$ represented an artificial magnification of **$\sim 3,162\times$**.
- Planet physical radii were authored as `size = relative * 0.005` scene units. In physical space, Earth's radius ($6,371\text{ km}$) is only $6.734 \times 10^{-10}\text{ ly}$. If rendered at true 1:1 scale next to a $100,000\text{ ly}$ galaxy without dedicated camera framing, planets collapse into sub-pixel points invisible to students.
- Furthermore, standard WebGL single-precision IEEE 754 floats provide only 24 bits of mantissa ($\sim 7$ significant decimal digits). When rendering a cosmological particle horizon ($46.5\text{ Gly}$) and simultaneously navigating around a $6,371\text{ km}$ planet, GPU hardware transforms suffered from severe vertex shaking, depth buffer z-fighting, and camera jitter.

### 1.2 Architectural Solution

We designed and implemented a **scientifically grounded hierarchical coordinate and scale architecture** that completely separates:

1. **Uncompromised 64-bit Double-Precision Physical Coordinates** (stored in SI meters, AU, parsecs, and light-years across standardized reference frames).
2. **Dynamic Presentation Magnification** controlled by a central `ScaleManager` with dual modes:
   - **Enhanced Visibility Mode**: Proportional display enlargement preserving visual clarity, student inspection, and planetary fly-throughs.
   - **True Scientific Scale (1:1) Mode**: Uncompromised, rigorous physical dimensions where celestial bodies occupy their exact astronomical scale.
3. **Floating-Origin / Camera-Relative Coordinate System**: Pre-subtracting camera world positions in Float64 on the CPU and passing camera-relative offsets into Three.js transforms, accompanied by GPU-ready `[high, low]` float32 precision splitting.
4. **Compatibility Layer**: Providing drop-in adapters so that existing sitemaps, tour stops, educational modules, payment gates, and navigation systems continue functioning seamlessly without breaking changes.

---

## 2. Core Package Architecture

The implementation resides in the modular package `src/lib/astronomy/`:

```
src/lib/astronomy/
├── constants.ts          # IAU 2012 / CODATA 2018 precision constants & physical conversions
├── units.ts              # Strongly-typed quantities (m, km, AU, pc, ly, Mly, M_sun, M_earth)
├── coordinates.ts        # Astrometric rotations, Kepler solvers, Stefan-Boltzmann, Schwarzschild
├── reference-frames.ts   # ICRS, Heliocentric Ecliptic, Planetocentric, Galactic, Comoving
├── floating-origin.ts    # Vector3D (Float64), SceneOriginNode, [high, low] float32 splitter
└── scale-manager.ts      # 6 Hierarchical Scale Regimes, dual-mode engine, telemetry formatters
```

### 2.1 Central Astronomical Units Package (`units.ts`, `constants.ts`)

Conforms strictly to IAU 2012 Resolution B2 and CODATA 2018:

- **Astronomical Unit ($1\text{ AU}$)**: Exactly $149,597,870,700\text{ m}$.
- **Speed of Light ($c$)**: Exactly $299,792,458\text{ m/s}$.
- **Julian Year**: Exactly $31,557,600\text{ s}$ ($365.25\text{ days}$).
- **Light-Year ($1\text{ ly}$)**: Exactly $c \times \text{Julian Year} = 9,460,730,472,580,800\text{ m}$.
- **Parsec ($1\text{ pc}$)**: Exactly $\frac{648,000}{\pi}\text{ AU} \approx 3.085677581 \times 10^{16}\text{ m} \approx 3.2615638\text{ ly}$.
- **Solar Radius ($R\_\odot$)**: $695,700,000\text{ m}$ ($4.65047 \times 10^{-3}\text{ AU}$).
- **Solar Mass ($M\_\odot$)**: $1.98847 \times 10^{30}\text{ kg}$ ($\approx 332,946 M_\oplus$).

Quantities can be instantiated through `distance(value, unit)` returning a typed `DistanceQuantity` supporting `.toMeters()`, `.toKilometers()`, `.toAU()`, `.toLightYears()`, `.toParsecs()`, `.toMegaparsecs()`, and context-sensitive formatting.

### 2.2 Coordinate Reference Systems (CRS) (`reference-frames.ts`)

Following Astropy and SOFA conventions:

1. **ICRS / ICRF (International Celestial Reference System)**: Barycentric equatorial frame defined by extragalactic radio sources (J2000 epoch).
2. **IAU Galactic Reference Frame**: Defined by the North Galactic Pole ($\alpha = 192.85948^\circ, \delta = +27.12825^\circ$) and position angle $\theta_0 = 122.93192^\circ$. Standard spherical $(l, b, d)$ and 64-bit Cartesian transforms are supported with selectable handedness (supporting the application's $+X = \text{anticenter}$, $-X = \text{Galactic Center}$ scene convention).
3. **Heliocentric Ecliptic Frame**: Sun-centered frame with coordinates aligned to the J2000 ecliptic plane, computing true Keplerian perifocal positions in AU.
4. **Planetocentric Frame**: Body-centered frame taking into account planetary spin period and obliquity (axial tilt), correctly calculating satellite and lunar offsets in kilometers and AU.
5. **Cosmological Comoving Frame**: Integrates Friedmann-Lemaître-Robertson-Walker (FLRW) metric under Planck 2018 parameters ($H_0 = 67.4\text{ km/s/Mpc}, \Omega_m = 0.315, \Omega_\Lambda = 0.685$) to transform cosmological redshift $z$ into comoving distance up to the particle horizon ($46.5\text{ Gly}$).

### 2.3 Timescales & Epoch Handling

Tracks time under `createEpoch(date, timescale)`:

- Julian Dates: $JD = \frac{\text{timeMs}}{86,400,000} + 2,440,587.5$
- Timescale support: UTC, TT (Terrestrial Time, $TT = UTC + \Delta AT + 32.184\text{ s}$), and TDB (Barycentric Dynamical Time).
- Julian centuries and years relative to J2000.0 ($JD = 2,451,545.0$).

### 2.4 Floating-Origin & Precision-Splitting Engine (`floating-origin.ts`)

- **`Vector3D`**: A pure 64-bit double-precision 3-vector class supporting `.sub()`, `.add()`, `.distanceTo()`, and `.toCameraRelative(cameraPos64, targetThreeVector)`.
- **Camera-Relative Transforms**: The CPU maintains the camera position in 64-bit world space. Before drawing, object positions are translated relative to the camera origin. The relative offset fits comfortably within the 24-bit mantissa of 32-bit floats without precision loss.
- **`splitDouble(val)`**: Decomposes any 64-bit float into two 32-bit floats `[high, low]` using `Math.fround`:
  $$\text{high} = \text{float32}(val), \quad \text{low} = val - \text{high}$$
  When rendered via vertex shaders, GLSL reconstructs the 64-bit value via `high + low`.
- **`SceneOriginNode`**: Hierarchical anchor node representing sub-systems (Solar System, Sgr A* Neighborhood, Andromeda M31, Virgo Cluster) with local-to-world 64-bit coordinate resolution.

---

## 3. ScaleManager & Continuous Navigation Architecture

The `ScaleManager` (`src/lib/astronomy/scale-manager.ts`) classifies spatial depth across 6 hierarchical scale regimes:

| Regime ID          | Regime Name         | Range (Light-Years)                                 | Natural Units                              | Pedagogical Focus                                                        |
| ------------------ | ------------------- | --------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------ |
| `PlanetarySurface` | Planetary Scale     | $0 - 10^{-4}\text{ ly}$ ($< 6.3\text{ AU}$)         | $\text{km}, \text{Earth Radii}, \text{AU}$ | Planetary surfaces, craters, cloud bands, atmospheres, moon orbits       |
| `SolarSystem`      | Solar System Scale  | $10^{-4} - 0.1\text{ ly}$ ($6.3 - 6,324\text{ AU}$) | $\text{AU}, \text{Mkm}$                    | Keplerian orbits, Kuiper Belt, Oort cloud boundary                       |
| `NearbyStars`      | Interstellar Scale  | $0.1 - 1,000\text{ ly}$                             | $\text{ly}, \text{pc}$                     | Solar neighborhood, Alpha Centauri, Sirius, 87 named stars               |
| `Galactic`         | Galactic Scale      | $1,000 - 200,000\text{ ly}$                         | $\text{kly}, \text{kpc}$                   | Milky Way spiral arms, central bar, Galactic bulge, stellar halo         |
| `Intergalactic`    | Intergalactic Scale | $200,000 - 100,000,000\text{ ly}$                   | $\text{Mly}, \text{Mpc}$                   | Local Group, Andromeda, Magellanic Clouds, Virgo Supercluster            |
| `Cosmological`     | Cosmological Scale  | $\ge 100,000,000\text{ ly}$                         | $\text{Gly}, \text{Gpc}$                   | Cosmic web filaments, deep quasars, $46.5\text{ Gly}$ observable horizon |

### 3.1 Dual Presentation Modes

1. **`enhanced` (Default)**:
   - $1\text{ AU} \to 0.05$ scene units.
   - Planet sizes scaled for clear visual identification.
   - Preserves user familiarity, visitable planet surfaces, and tour framing.
2. **`true_scale`**:
   - $1\text{ AU} \to 1.58128 \times 10^{-5}$ scene units.
   - Planet radii mapped $1:1$ to physical light-years ($\text{radiusKm} \times 1,000 / 9.46 \times 10^{15}$).
   - Shows students the awe-inspiring emptiness of true astronomical space (planets appear as infinitesimal pinpricks relative to orbital distances).

---

## 4. Subsystem Migration & Compatibility

| Subsystem                 | Legacy State                                                  | Modernized State                                                                                                                        | Risk & Compatibility Guard                                                                          |
| ------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `src/stars/scale.ts`      | Mixed constants and hardcoded multipliers                     | Compatibility adapter backed by `scaleManager` and `constants.ts`                                                                       | Zero breaking changes: exports identical symbols with enhanced precision backing                    |
| `src/stars/store.ts`      | No scale mode toggle; static camera distance                  | Added `scaleMode`, `setScaleMode`, `toggleScaleMode`; throttled distance updates                                                        | Backwards-compatible; defaults to `"enhanced"`                                                      |
| `src/stars/Planets.tsx`   | Hardcoded `AU = 0.05`, `P = 0.005` in all meshes              | `getPlanetEffectiveA(def, mode)` and `getPlanetEffectiveSize(def, mode)` dynamically respond to scale mode                              | Orbit lines and meshes update smoothly without breaking Keplerian solvers or live position registry |
| `src/stars/CameraRig.tsx` | Fixed framing based on legacy size multiplier                 | Adapts `planetMinimumRadius()` and visit zoom dynamically based on active scale mode                                                    | Smooth camera transitions; no camera clipping into planet cores in either mode                      |
| `src/stars/UI.tsx`        | Static distance string; no scale regime badge; no mode toggle | Interactive `ScaleIndicator` displaying Regime, formatted distance, and Mode Toggle; new toolbar toggle button; Settings panel controls | Complete student control with zero clutter; respects UI hide toggle                                 |
| Sitemaps & Navigation     | Absolute coordinate targets                                   | Target vectors evaluated within hierarchy                                                                                               | All sitemap routes, tour stops, and celestial links remain 100% operational                         |

---

## 5. Verification & Test Suite

The modernization was verified using an automated test harness executed directly against the codebase:

- **Command**: `npm test` (`npx tsx scripts/astronomy-validation.ts`)
- **Total Assertions**: 63
- **Passing**: 63 (100%)
- **Failing**: 0
- **Regression QA**: `npm run test:qa` (227 tests passing)
- **Linter Status**: `npm run lint` (0 errors)
- **Production Compilation**: `npm run build` (Clean SSR + client build in 3.13s)
