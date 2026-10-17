# Implementation Plan: Seamless Multi-Scale Astronomical Graphics & Precision Engine

## Problem Statement & Mission Objective

Our Visible Universe exhibits frame stutters, camera micro-jitter, and abrupt popping when navigating from planetary surfaces ($10^{-10}$ ly) out to cosmological scales ($5 \times 10^{10}$ ly).
The core bottlenecks identified across the codebase are:

1. **Camera Floating-Point Jitter**: World coordinates in Three.js standard float32 precision suffer catastrophic cancellation at distances beyond $10^4$ ly. Near/far clipping planes scale to extreme ratios ($10^{23}$), causing depth fighting.
2. **Abrupt Visibility Pops & Synchronous Allocation**: Galaxies (Andromeda, Milky Way, and catalog galaxies) toggle visibility abruptly using hard distance boundaries without hysteresis or cross-fading, synchronously generating hundreds of thousands of particles upon threshold crossings.
3. **Gaia Geometry Rebuilding**: Every LOD tile update in `StarField` instantiates brand-new `THREE.BufferGeometry` and typed arrays, triggering heavy GC sweeps and main-thread stalls.
4. **Unculled Particle Overdraw**: Milky Way and Andromeda render over 500,000 particles with `frustumCulled={false}`, saturating GPU vertex and rasterization pipelines even when off-screen or sub-pixel.

**Strict Constraint**: Do not touch or modify the authentication architecture, Supabase auth guards, paid access verification, Razorpay integration, or MCP server tokens established for Lovable.

---

## User Preferences & Architectural Alignment

- **Floating-Origin**: Hybrid floating-origin with hierarchical reference frames.
- **LOD Strategy**: Continuous screen-space projected LOD with opacity/dither crossfading and hysteresis.
- **Performance Profiler**: Collapsible developer overlay in the top-right viewport with real-time rolling FPS, P95/P99 frame time, memory metrics, draw calls, and subsystem toggles.

---

## Implementation Phases

### Phase 1: Real-Time Precision Performance Profiler HUD (Phase A)

- **Engine Metrics Collector**:
  - Implement rolling frame time analysis tracking instantaneous FPS, 60-frame moving average, P95, and P99 frame times.
  - Profile CPU frame time vs. GPU time (using WebGL Timer Queries when supported, falling back to CPU timestamps).
  - Extract live renderer diagnostics from `gl.info` (draw calls, triangles, points, textures, geometries).
  - Monitor memory: `performance.memory` (JS Heap) and estimated GPU buffer allocations.
  - Subsystem isolation switches: Live toggles to enable/disable Milky Way, Andromeda, Gaia Stars, Post-Processing Bloom, and Cosmic Web to isolate frame drops.
- **Collapsible Top-Right Viewport HUD**:
  - Sleek, semi-transparent obsidian card (`bg-neutral-950/85 backdrop-blur-md`) positioned at `top-4 right-4` with fold/unfold affordance.
  - Tabular typography (`font-mono tabular-nums`) with color-coded health indicators (green $\ge 55$ FPS, amber $\ge 35$ FPS, red $< 35$ FPS).
  - Does not interfere with existing TopLeftControls or SiteMap modals.

### Phase 2: Camera-Relative Floating-Origin Architecture (Phase B)

- **High-Precision CPU Reference Frame (`src/lib/astronomy/floating-origin.ts`)**:
  - Enhance `Vector3D` and `SceneOriginNode` to support a tree of hierarchical coordinate frames:
    - `GalacticReferenceFrame`: Centered at Milky Way galactic nucleus ($[-26000, 0, 0]$ ly).
    - `SolarReferenceFrame`: Anchored to the Sun's live barycentric position.
    - `ExtragalacticReferenceFrame`: Local origins for Andromeda (M31), Large Magellanic Cloud, and deep survey clusters.
  - Ensure all coordinates are computed relative to the camera origin before submission to Three.js matrices:
    $$\vec{p}_{\text{local}} = \vec{p}_{\text{world64}} - \vec{c}_{\text{camera64}}$$
- **CameraRig Integration (`src/stars/CameraRig.tsx`)**:
  - Separate high-precision 64-bit camera target and position from the 32-bit GPU scene camera.
  - Prevent precision degradation when panning around planetary surfaces while maintaining smooth transitions during warp flights to distant galaxies.
  - Dynamic near/far clip adjustment with bounded depth ratio ($\le 10^7$) to guarantee depth buffer stability without z-fighting.

### Phase 3: Continuous Screen-Space LOD & Cross-Fading (Phase C)

- **LOD Transition Manager (`src/stars/lod/LODTransitionManager.ts`)**:
  - Replace hard distance cutoffs (`d < threshold`) with screen-space angular diameter metrics:
    $$\theta_{\text{screen}} = 2 \cdot \arctan\left(\frac{R_{\text{object}}}{d}\right) \cdot \frac{h_{\text{viewport}}}{2}$$
  - Introduce symmetric hysteresis: Enter high-detail at $\theta_{\text{enter}}$, exit back to low-detail/impostor at $\theta_{\text{exit}} = 0.75 \cdot \theta_{\text{enter}}$ to eliminate edge oscillation.
- **Smooth Opacity & Dither Crossfades (`GalaxyDetail.tsx`, `Andromeda.tsx`, `Universe.tsx`)**:
  - Implement bidirectional alpha cross-fading: As distance decreases, far-field glow/impostor smoothly fades out ($1 \to 0$) while particle geometry fades in ($0 \to 1$) over a normalized transition zone $[\tau_{\min}, \tau_{\max}]$.
  - Asynchronous background geometry generation: Pre-allocate and memoize particle geometries off-critical-path so mounting high detail never drops a frame.

### Phase 4: Particle Optimization & Frustum Culling (Phase D)

- **Milky Way & Andromeda Optimization (`SceneObjects.tsx`, `Andromeda.tsx`)**:
  - Remove indiscriminate `frustumCulled={false}` on 500,000+ particle clouds.
  - Compute accurate bounding spheres for galactic disks, bulges, bars, and halo structures so off-screen clouds are culled immediately.
  - Implement hierarchical particle lod: Core stars remain visible, outer faint stars dynamically scale point size and alpha based on pixel footprint.
  - Synchronize the far-field billboard with the heavy particle cloud so distant galaxies never double-render both particles and sprites.

### Phase 5: Zero-Stutter Gaia Streaming & Bounded Buffer Engine (Phase E)

- **Pre-Allocated GPU Vertex Buffers (`src/stars/StarField.tsx`)**:
  - Stop disposing and reconstructing `BufferGeometry` on every tile update.
  - Pre-allocate a bounded GPU vertex buffer sized to the device tier (e.g. 50k points for standard, 150k for high).
  - Update dynamic slice ranges in-place with `BufferAttribute.copyArray()` and `addUpdateRange()` without GC thrashing.
- **Velocity-Aware Tile Streaming (`src/lib/astronomy/gaia/gaia-tile-manager.ts`)**:
  - Throttle tile updates when camera angular velocity is high ($|\omega| > 0.05$ rad/s); stream high-resolution tiles only as camera stabilizes.
  - Retain permanent indices for anchor bright stars and pinned targets so they never flicker or shift slot indices.

---

## Verification Plan

### Automated Tests

- Run existing verification suites:
  - `npm run test:all`
  - `npm run test:gaia`
  - `npm run test:catalog`
  - `npm run test:jpl`
- Add targeted precision and LOD unit tests:
  - Floating origin cancellation test: Verify relative distance accuracy $< 10^{-6}$ ly at $10^9$ ly distance.
  - LOD hysteresis test: Verify representation stability across boundary oscillations.

### Browser & Runtime Verification

- Open `/_authenticated/universe` in the browser dev preview.
- Verify the collapsible performance profiler HUD in the top-right corner.
- Test continuous zoom from Earth orbit to Pluto, Alpha Centauri, Galactic Center, Andromeda, and the Observable Universe boundary (46.5 Gly).
- Verify zero camera jitter near planetary bodies.
- Verify smooth fade transitions between far-field sprites and detailed galaxy particle models without popping or blank frames.
- Verify framerate stability ($\ge 55$ FPS on desktop) and absence of GC spikes during camera flight.
