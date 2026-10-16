# Architecture & Codebase Inventory: Our Visible Universe (3D Atlas Modernization Audit)

**Date**: October 2026  
**Auditor**: Principal Astronomical Software Engineer & Senior React Three Fiber Architect  
**Repository**: `https://github.com/Mukulsri369/ourvisibleuniverse`  
**System Target**: World-class, scientifically grounded, highly realistic 3D atlas of the observable universe

---

## Executive Summary

"Our Visible Universe" is a full-stack astronomical visualization and educational platform built on React 19, Three.js, React Three Fiber, TanStack Start/Router, and Supabase. It features an interactive 3D universe viewport (`/_authenticated/universe`), a comprehensive Cosmic Learning Academy with 24 tiered educational modules (`/learn`), public SEO-indexed knowledge routes (`/galaxies`, `/science`, `/history`), an MCP (Model Context Protocol) server (`/mcp`), and secure Razorpay payment integration with server-side HMAC-SHA256 signature verification.

The application successfully manages a massive spatial scope—ranging from planetary atmospheres to the observable universe boundary at $46.5 \times 10^9$ light-years—using custom WebGL shaders, particle systems containing over 1.4 million rendered points, and an orbit-style camera rig with logarithmic easing.

However, several foundational scale compromises, procedural shortcuts, and numeric precision bottlenecks currently prevent it from serving as a precision astronomical atlas. This audit documents the complete baseline architecture, catalogs every component and file, identifies hard-coded compromises, evaluates GPU/memory constraints, and establishes the technical blueprint for progressive modernization without disrupting existing access, payments, or educational systems.

---

## 1. Current Capabilities & Component Architecture

### 1.1 Technical Stack & Framework Baseline

- **UI & Runtime**: React 19.2.0, React DOM 19.2.0, TypeScript 5.8.3, Vite 8.0.16.
- **3D Graphics Engine**: Three.js 0.184.0, React Three Fiber (`@react-three/fiber` 9.6.1), Drei (`@react-three/drei` 10.7.7).
- **Application Routing & SSR**: TanStack Start 1.168.60, TanStack React Router 1.170.41, Nitro 3.0.260603-beta.
- **State Management**: Zustand 5.0.14 for high-frequency 3D viewport state; TanStack React Query 5.83.0 for asynchronous server state.
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite` 4.2.1, `@import "tailwindcss"` in `src/styles.css`), Radix UI primitives.
- **Authentication & Backend**: Supabase client (`@supabase/supabase-js` 2.117.2) with cookie-based SSR session middleware (`src/integrations/supabase/auth-middleware.ts`), row-level security (RLS), and database functions.
- **Payments & Access Control**: Razorpay API integration with server-only secret (`RAZORPAY_MODE`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`), idempotent `apply_access_purchase` SQL function, and client-side checkout modal.
- **MCP Server**: Model Context Protocol endpoint mounted at `/mcp` using `@lovable.dev/mcp-js` 3.0.5, exposing catalog search, object inspection, and access plan verification.
- **Cosmic Learning Academy**: 24 modular courses spanning observational astronomy, stellar physics, general relativity, cosmology, and astrobiology (`src/lib/academy/`).

### 1.2 Core 3D Scene Graph (`src/stars/StarsApp.tsx`)

The primary 3D viewport mounts inside a single R3F `<Canvas>` element with the following layer hierarchy:

```
<Canvas camera={{ fov: 40, near: 1e-11, far: 1e11, position: [4, 2, 6] }}>
  ├── <MilkyWay />               // ~750,000 particle Galactic model (bulge, bar, thin/thick disk, HII, halo)
  ├── <Universe />               // Deep-space structures: Cosmic Web, Local Group discs, Observable Universe Shell
  ├── <Andromeda />              // ~520,000 particle M31 model with PA-99-N2 planetary system
  ├── <DetailedGalaxies />       // On-demand procedural galaxy particle models (M33, M51, M81, Centaurus A, etc.)
  ├── <ObservedObjects />        // Extreme astrophysical objects (quasars, pulsars, black holes, nebulae)
  ├── <ExoSystem />              // Dynamic Keplerian exoplanet orbits around selected catalogue stars
  ├── <SolarSystem>              // Solar System anchor group with drifting velocity
  │     ├── <Sun />              // Procedural animated corona & limb-darkened photosphere shader
  │     └── <Planets />          // 8 major planets, Pluto, 30+ moons, rings, Rayleigh/Mie atmospheric shaders
  ├── <MotionTrails />           // Real-time orbital trace buffers for Solar System bodies
  ├── <OrientationDisc />        // Ecliptic plane orientation ring
  ├── <StarField />              // 87 named stars + 18,000 thin-disk background stars with dual spectral shaders
  ├── <BinaryMarkers />          // Visual indicator rings for binary and multiple star systems
  ├── <StarLabels />             // Screen-space projected HTML labels (SafeHtml) for nearby stars
  └── <CameraRig />              // Damped spherical controller with logarithmic zoom across 21 orders of magnitude
```

---

## 2. Catalogued vs. Procedural Object Inventory

| Domain                                                        | Catalogued / Observed Real Data                                                                                                                                                                                           | Procedural / Synthesized Components                                                                                                                                                               | Scientific Fidelity Status                                                                |
| :------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :---------------------------------------------------------------------------------------- |
| **Solar System** (`Planets.tsx`)                              | Real J2000 orbital elements ($a, e, i, \omega$), sidereal orbital periods, rotational periods, axial tilts, radii, and moon periods from Standish/JPL ephemerides.                                                        | Orbital scale enlarged by **3,162×** ($1\text{ AU} = 0.05\text{ ly}$). Outer planet orbital speeds accelerated by **4×–18×** (`OUTER_ORBIT_BOOST`). Procedural surface noise and FBM cloud bands. | Visually compelling; kinematics distorted for user impatience.                            |
| **Named Stars** (`data.ts`)                                   | 87 real stars with J2000 Right Ascension, Declination, parallax-derived distance, spectral type, apparent/absolute magnitude, and physical parameters ($M, R, T_{\text{eff}}, L$).                                        | Coordinate transformation uses inverted X-axis. Companion orbital separation is fixed offset rather than true astrometric orbit.                                                                  | High astrometric fidelity; coordinates need standard IAU frame verification.              |
| **Background Stars** (`StarField.tsx`)                        | Stellar population distribution percentages ($76\%\text{ M}, 12\%\text{ K}, 7.5\%\text{ G}, 3\%\text{ F}, 1\%\text{ A}, 0.5\%\text{ B}$).                                                                                 | 18,000 points generated via pseudo-random exponential thin-disk slice ($h_z = 700\text{ ly}$, $R_{\max} = 14,000\text{ ly}$). Not tied to Gaia DR3 or Hipparcos source IDs.                       | Statistically representative, but individual stars are synthetic.                         |
| **Exoplanets** (`real-exoplanets.ts`, `exosystems.ts`)        | Confirmed exoplanet parameters for ~35 catalogue stars (Proxima Centauri, Barnard's Star, TRAPPIST-1, Kepler-186, etc.) sourced from NASA Exoplanet Archive.                                                              | Synthetic exoplanetary systems generated for stars without confirmed planets using seeded PRNG, equilibrium temperature, and nominal Keplerian spacing.                                           | Real systems are accurately flagged; synthetic systems are labeled as models.             |
| **Milky Way Galaxy** (`SceneObjects.tsx`)                     | IAU Sun-to-Galactic Center distance ($R_0 \approx 26,000\text{ ly}$), 4-arm logarithmic spiral morphology, pitch angle ($12.5^\circ$), bar length ($8,000\text{ ly}$), flat rotation curve ($V \approx 220\text{ km/s}$). | 750,000 individual particles generated via deterministic seeded PRNG (`mulberry32`). Dust lanes and HII clusters are stochastically positioned.                                                   | Morphologically accurate synthesis matching modern 3D Milky Way models.                   |
| **Nearby Galaxies** (`galaxy-catalog.ts`, `galaxy-models.ts`) | Real sky positions ($l, b$), distances, inclinations, position angles, and Hubble morphological types for 80+ galaxies.                                                                                                   | Particle geometries synthesized on-demand with density scaled by camera proximity. Star systems inside distant galaxies are illustrative models around real catalogued stars.                     | Macro properties observed; micro structure procedural.                                    |
| **Observed Objects** (`observed-objects.ts`)                  | Real coordinates ($l, b, d$), spectral classifications, and discovery notes for 50+ extreme objects (TON 618, M87*, Sgr A*, Crab Pulsar, Cygnus X-1, 3C 273).                                                             | Volumetric accretion disks, relativistic jets, pulsar beams, and planetary nebulae rendered with illustrative GLSL shaders and billboard sprites.                                                 | Astrometrically positioned; visuals are stylized approximations of multi-wavelength data. |
| **Large-Scale Structure** (`Universe.tsx`)                    | Approximate radial boundaries of Virgo Supercluster, Laniakea, and Observable Universe horizon ($46.5\text{ Gly}$).                                                                                                       | 124,000 cosmic web points generated via spherical shells with random clustering toward 220 directional seeds. Not direct SDSS/2dFGRS galaxy survey coordinates.                                   | Illustrative of cosmic filament topology; not point-for-point SDSS mapping.               |

---

## 3. Critical Coordinate System, Epoch & Scale Inconsistencies

### 3.1 The Enlarged Solar System AU Constant

In `src/stars/Planets.tsx` (line 42) and `src/stars/ExoSystem.tsx` (line 9):

```typescript
export const AU = 0.05;
```

- **Physical Reality**: $1\text{ AU} \equiv 149,597,870,700\text{ m}$. In light-years:
  $$\frac{1\text{ AU}}{1\text{ ly}} = \frac{149,597,870,700\text{ m}}{9,460,730,472,580,800\text{ m}} = \frac{1}{63,241.077} \approx 1.58128456 \times 10^{-5}\text{ ly}$$
- **Current Scene Implementation**: $1\text{ AU} = 0.05\text{ units}$. Since $1\text{ unit} = 1\text{ ly}$, the Solar System is scaled as if $1\text{ AU} = 0.05\text{ ly}$.
- **Distortion Ratio**:
  $$\frac{0.05}{1.58128456 \times 10^{-5}} \approx 3,162.0 \times$$
- **Consequences**:
  1. Neptune ($a \approx 30.07\text{ AU}$) is located at $30.07 \times 0.05 = 1.5035\text{ units}$ ($1.5035\text{ ly}$ from the Sun).
  2. The Oort cloud shell in `SceneObjects.tsx` is placed at $r \approx 0.95 - 1.10\text{ units}$ ($1\text{ ly}$). This places the Oort cloud _inside_ the orbit of Neptune in scene units!
  3. Proxima Centauri is located at $4.246\text{ ly}$. In the current scene, Neptune's orbit extends to more than $35\%$ of the distance to the nearest star.

### 3.2 Planetary Radius vs. Orbital Distance Disconnect

In `Planets.tsx`:

```typescript
const P = 0.005;
// Earth size = 0.055 * P = 0.000275 units (ly)
```

- **Physical Reality**: Earth's mean radius is $R_\oplus \approx 6,371\text{ km} \approx 4.25875 \times 10^{-5}\text{ AU} \approx 6.734 \times 10^{-10}\text{ ly}$.
- **Current Scene Implementation**: Earth radius is $2.75 \times 10^{-4}\text{ units}$.
- **Distortion Ratio**: The Earth's physical radius is enlarged by $\approx 408,375\times$ relative to light-years, while orbits are enlarged by $3,162\times$.
- **Architectural Rationale**: In a 1:1 true physical scale, planetary disks are sub-pixel specs when viewing their orbits. However, hardcoding two disconnected arbitrary constants (`AU = 0.05`, `P = 0.005`) breaks physical measurement tools, raycasting, shadow casting, and eclipse calculations.

### 3.3 Artificial Orbital Period Boosting

In `Planets.tsx` (lines 443–449):

```typescript
const OUTER_ORBIT_BOOST: Record<string, number> = {
  Jupiter: 4,
  Saturn: 6,
  Uranus: 10,
  Neptune: 14,
  Pluto: 18,
};
```

- **Consequences**: Kepler's Third Law ($T^2 \propto a^3$) is intentionally violated in the rendering loop. While inner planets orbit with realistic relative periods, Jupiter moves $4\times$ faster than physics dictates, and Pluto moves $18\times$ faster. Orbital resonance demonstrations and planetary conjunctions are rendered physically invalid.

### 3.4 Galactic Coordinate Frame & Handedness Inversion

In `src/stars/Universe.tsx`, `src/stars/andromeda-data.ts`, and `src/stars/data.ts`:

```typescript
function toXYZ(l: number, b: number, d: number): THREE.Vector3 {
  const lr = (l * Math.PI) / 180;
  const br = (b * Math.PI) / 180;
  // Flip x so galactic-center direction (l=0) points to -x (matches GALACTIC_CENTER)
  const x = -d * Math.cos(br) * Math.cos(lr);
  const y = d * Math.sin(br);
  const z = d * Math.cos(br) * Math.sin(lr);
  return new THREE.Vector3(x, y, z);
}
```

- Standard IAU Galactic Coordinates $(l, b)$ define:
  - $l = 0^\circ, b = 0^\circ \implies$ Galactic Center direction.
  - $l = 90^\circ, b = 0^\circ \implies$ Direction of Galactic rotation.
  - $b = +90^\circ \implies$ North Galactic Pole.
- In Three.js (right-handed Cartesian system: $+X$ right, $+Y$ up, $+Z$ toward viewer):
  - Flipping $x \to -x$ changes the parity (chirality) of the coordinate system from right-handed to left-handed unless accompanied by a compensating axis permutation. This risks mirroring spatial structures and planetary orbital inclinations across the galactic disk.

---

## 4. Shaders & Particle Rendering Architecture

### 4.1 Particle Budget & Distribution

The application renders over **1,400,000 active particles** across multiple independent `THREE.Points` meshes:

1. **Milky Way Disk**: 620,000 points (`Float32Array` positions, colors, sizes).
2. **Milky Way Bulge**: 80,000 points.
3. **Milky Way Bar**: 22,000 points.
4. **Milky Way Halo**: 18,000 points.
5. **Milky Way HII Regions**: 11,760 points.
6. **Andromeda (M31)**: ~520,000 points (disk, 10-kpc ring, bulge, bar, halo).
7. **Cosmic Web**: 124,000 points across 4 radial shells ($3\times 10^6$ to $4.5\times 10^{10}\text{ ly}$).
8. **StarField Background**: 18,000 points.
9. **Solar System Oort Cloud**: 3,000 points.
10. **Detailed Galaxies**: 50,000–150,000 dynamic points per rendered galaxy.

### 4.2 GPU Memory & Fill-Rate Analysis

- **Vertex Buffer Memory**:
  - Each particle attribute set ($x, y, z$ position = 12 bytes; $r, g, b$ color = 12 bytes; size = 4 bytes) consumes 28 bytes per vertex.
  - For $1.4\times 10^6$ vertices:
    $$\text{VRAM} \approx 1,400,000 \times 28\text{ bytes} \approx 39.2\text{ MB}$$
  - Raw vertex buffer memory is modest and well within mobile/integrated GPU limits.
- **Fill-Rate & Overdraw Bottleneck**:
  - All particle systems use additive blending (`blending: THREE.AdditiveBlending`), `depthWrite: false`, and camera-attenuated point sprites.
  - When the camera is positioned inside the Milky Way disk or viewing Andromeda obliquely, hundreds of transparent sprites overlap the same screen pixels.
  - On high-DPI displays (Retina/4K), rendering at $2\times\text{ DPR}$ caused severe GPU thermal throttling and frame drops below 25 FPS.
  - _Current Mitigation_: `StarsApp.tsx` enforces `dpr={[1, 1.5]}` and `powerPreference: "high-performance"`.

### 4.3 Shader Inventory & GLSL Analysis

1. **`StarField` Shader (`src/stars/StarField.tsx`)**:
   - Computes procedural twinkling: `sin(uTime * 1.4 + aPhase)`.
   - Real-time spectral blending: blends between natural true-color RGB and Morgan-Keenan spectral classification index colors via uniform `uSpectral`.
   - Background fade: smoothly steps out background stars when zoomed into the Solar System (`smoothstep(120.0, 900.0, uCamDist)`).
2. **`Sun` Granulation & Limb Darkening (`src/stars/SceneObjects.tsx`)**:
   - 3D simplex noise with 3 FBM octaves evaluated in fragment shader for photospheric convection cells.
   - Physical limb darkening modeled via cosine law: `col *= 0.55 + 0.45 * mu`.
3. **Planetary Atmosphere Shader (`src/stars/Planets.tsx`)**:
   - Single-pass approximation of Rayleigh limb glow ($\propto \lambda^{-4}$ blue rim) and Mie forward-scattering halo oriented toward the live Sun position (`uSun`).
   - Includes custom preset parameters for Earth, Venus, Mars (inverted butterscotch/blue sunset), Jupiter, Saturn, Uranus, and Neptune.
4. **Observable Universe Boundary Shader (`src/stars/Universe.tsx`)**:
   - Inverted sphere ($r = 4.65 \times 10^{10}\text{ ly}$) with procedural 3D noise simulating Cosmic Microwave Background (CMB) dipole/temperature fluctuations.

---

## 5. Camera Controls & Dynamic Range Precision

### 5.1 The 22 Orders of Magnitude Challenge

In `StarsApp.tsx`:

```typescript
camera={{ fov: 40, near: 1e-11, far: 1e11, position: [4, 2, 6] }}
```

- Ratio of far to near clipping planes:
  $$\frac{\text{far}}{\text{near}} = \frac{10^{11}}{10^{-11}} = 10^{22}$$
- **Standard Floating Point Limitations**:
  - IEEE 754 single-precision `float32` (standard in WebGL vertex transformations and depth buffers) has 24 bits of significand, providing approximately $7.22$ decimal digits of precision.
  - A depth buffer spanning $10^{22}$ with linear depth mapping would fail completely.
- **Logarithmic Depth Buffer**:
  - The application enables `gl={{ logarithmicDepthBuffer: true }}`.
  - Three.js injects `<logdepthbuf_pars_vertex>` and `<logdepthbuf_vertex>` into custom shaders, calculating:
    $$z_{\text{log}} = \frac{\log(C \cdot z + 1)}{\log(C \cdot \text{far} + 1)}$$
  - While this resolves primary Z-fighting, vertex jitter (jittering of geometry when the camera is millions of units away from the origin) still occurs when viewing Solar System bodies inside extragalactic systems because `modelViewMatrix * vec4(position, 1.0)` is computed in `float32`.

### 5.2 Camera Rig Kinematics (`src/stars/CameraRig.tsx`)

- Orbit-style spherical camera controller with logarithmic radius interpolation:
  $$r_{t+1} = \exp\left(\ln(r_t) + (\ln(r_{\text{target}}) - \ln(r_t)) \cdot (1 - e^{-4 \Delta t})\right)$$
- Tracks live targets via moving vector offsets:
  - Solar System bodies: reads live positions from `window.__planetPositions`.
  - Focused star systems in external galaxies: tracks orbital motion around galaxy centers.
  - Site map overview vs. close-up system framing.
- Free-look mode (`S` key) disconnects camera target anchoring to permit observer drift.

---

## 6. Server-Side Infrastructure, Authentication & MCP

### 6.1 Server Architecture

- **Runtime**: Node.js with Nitro full-stack server engine, serving both Vite client SSR/hydration and API endpoints.
- **Entry Points**:
  - `src/server.ts`: Express wrapper mounting Nitro and Vite middlewares.
  - `src/start.ts`: Nitro production server runtime.
- **API Endpoints**:
  - `/api/public/payments/razorpay`: Payment order creation and webhook receiver.
  - `/mcp`: Model Context Protocol SSE / JSON-RPC server.

### 6.2 Authentication & Pass Protection Workflow

- User sessions are managed via Supabase Auth (`@supabase/supabase-js`).
- Session cookies are validated on the server via `auth-middleware.ts`.
- The 3D Universe route (`/_authenticated/universe`) is guarded at two levels:
  1. Route layout guard (`src/routes/_authenticated/route.tsx`): verifies active Supabase user session; redirects unauthenticated visitors to `/auth`.
  2. Universe gate (`src/routes/_authenticated/universe.tsx`): queries `getMyAccess()` from `src/lib/razorpay.functions.ts` to ensure the user owns an unexpired access pass (`status === 'active' && expires_at > now`).
- **Critical Invariant**: All public informational pages (`/`, `/about`, `/features`, `/galaxies`, `/science`, `/history`, `/learn`) remain completely crawlable, indexable, and free of 3D scene memory overhead.

### 6.3 Model Context Protocol (MCP) Integration (`src/lib/mcp/`)

- Implements tools for AI agents:
  - `get_catalog_entry`: Retrieves astrometric data for stars, planets, and galaxies.
  - `search_catalog`: Search across objects by name, constellation, or category.
  - `get_my_access`: Token-authenticated check for user pass validity.
  - `list_access_plans`: Lists pricing tiers and features.
- Adheres to security rule: Requires caller OAuth token to access private user pass records.

---

## 7. Testing, Build & Quality Assurance Baseline

### 7.1 Existing Automated Test Suite (`scripts/qa-audit-test.ts`)

The project includes a master automated test suite verifying all 24 Cosmic Learning Academy modules, physics calculations, and adaptive recommendations.

- **Execution Command**: `npx tsx scripts/qa-audit-test.ts`
- **Verified Execution Results**:
  ```
  === COSMIC LEARNING ACADEMY: MASTER TEST HARNESS ===
  [1] Testing Registry & Stages...
  [2] Testing Lessons & Knowledge Check Quizzes...
  [3] Testing Scientific Physics Engine Formulas...
  [4] Testing Recommendation Engine & Student Progression...
  ================ TEST SUMMARY ================
  Total Assertions Run: 227
  Passed: 227
  Failed: 0
  ALL AUTOMATED TESTS PASSED WITH 100% SUCCESS!
  ```

### 7.2 Linter & Typecheck Verification

- **Linter**: `npm run lint` (`eslint .`) executes cleanly with **0 errors** (23 informational Fast Refresh / Hook dependency warnings).
- **Compilation**: `compile_applet` reports `Build succeeded - the applet is compiled`.
- **Production Build**: `npm run build` generates SSR server chunks and client bundles via Vite and Nitro in **3.13 seconds** with **0 build errors**.

---

## 8. File-by-File Audit Matrix

| File Path                       | Primary Responsibility                         | Key Findings & Observations                                                                                                                                     | Recommended Action                                                                                   |
| :------------------------------ | :--------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------- |
| `src/stars/scale.ts`            | Global astronomical scale conversion constants | Contains `LIGHT_YEARS_PER_AU = 1 / 63_241.077`, `SOLAR_RADIUS_AU`, `EXO_BODY_MAGNIFY = 2200`, `EXO_STAR_MAGNIFY = 400`. Disconnected from `Planets.tsx`.        | Centralize all unit conversions into a unified, tested astronomy module.                             |
| `src/stars/Planets.tsx`         | Solar System planets, moons, orbits & shaders  | Hardcodes `AU = 0.05` ($3,162\times$ enlargement), `P = 0.005`, and `OUTER_ORBIT_BOOST` (4×–18×). Implements Kepler solver and Rayleigh/Mie atmosphere shaders. | Introduce true physical coordinate calculation with a decoupled visual magnification layer.          |
| `src/stars/StarField.tsx`       | Named star points and 18,000 background stars  | Uses GPU vertex shader for twinkling, distance fade, and real-time spectral index color interpolation. Background stars are synthetic.                          | Maintain dual spectral visualization; prepare ingestion hooks for Gaia DR3 high-proper-motion stars. |
| `src/stars/SceneObjects.tsx`    | Sun, Milky Way (750k particles), Oort cloud    | Multi-component Milky Way (disk, bar, bulge, halo, HII knots) using seeded `mulberry32` PRNG. Sun shader uses 3-octave FBM.                                     | Optimize particle overdraw; calibrate Sun physical luminosity and limb darkening parameters.         |
| `src/stars/Universe.tsx`        | Extragalactic structure & cosmic web           | Renders nearby galaxies as billboards/discs, 124k cosmic web points, and faint CMB observable universe boundary at $46.5\text{ Gly}$.                           | Connect cosmic web filament density to SDSS/2dF survey redshift slices.                              |
| `src/stars/galaxy-catalog.ts`   | Real nearby galaxy astrometric catalog         | 80+ galaxies with real galactic $(l, b)$, distances, sizes, and orientations.                                                                                   | Sourced accurately; verify orientation angles against NED/HyperLEDA.                                 |
| `src/stars/galaxy-models.ts`    | Procedural particle galaxy parameters          | Defines morphology parameters, dust lanes, arms, and hosted star systems for interactive exploration.                                                           | Excellent modular architecture; ensure planet labels clearly specify modeled status.                 |
| `src/stars/real-exoplanets.ts`  | Confirmed exoplanet data catalog               | NASA Exoplanet Archive observations for ~35 stars ($a, e, P, M, R$).                                                                                            | High scientific accuracy; maintain provenance tags and mass-radius estimations.                      |
| `src/stars/observed-objects.ts` | Extreme astrophysical objects catalog          | 50+ quasars, black holes, neutron stars, pulsars with multi-wavelength notes and descriptions.                                                                  | High educational value; verify event horizon Schwarzschild radii.                                    |
| `src/stars/CameraRig.tsx`       | 3D Camera controller & navigation driver       | Logarithmic zoom across 21 orders of magnitude, tour sequencer, target tracking, planet-following logic.                                                        | Well-engineered; ensure floating origin support for extreme zoom depths.                             |
| `src/stars/StarsApp.tsx`        | Root 3D Canvas & scene assembler               | Sets canvas parameters (`near: 1e-11`, `far: 1e11`, `logarithmicDepthBuffer`), DPR clamping, and UI layout.                                                     | Add performance monitor hooks and fallback rendering tiers for lower-end devices.                    |
| `src/stars/sim-clock.ts`        | Simulation time progression clock              | Tracks years since J2000.0, advances clock per frame, provides background focus fade.                                                                           | Solid foundation; wrap in structured state to prevent module-level race conditions.                  |
| `src/stars/spectral.ts`         | Stellar spectral classification colors         | Maps OBAFGKM spectral types to RGB colors and Morgan-Keenan spectral indices.                                                                                   | Scientifically grounded; verify against Blackbody Planckian locus chromaticity.                      |
| `src/stars/store.ts`            | Global Zustand 3D viewport state store         | Coordinates star selection, tours, spectral mode, planet visits, and camera distance.                                                                           | Maintain strict decoupling from UI DOM state.                                                        |
