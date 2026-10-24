# Implementation Plan: Dark Observatory & Relativistic Cinema Landing Experience

## 1. Visual Theme & Aesthetic Direction
We will transform the website theme into **Dark Observatory & Relativistic Cinema**, inspired by award-winning interactive 3D web experiences (Awwwards Site of the Year / Cartier / NASA Eyes / Lusion / Active Theory spatial storytelling):

- **Color Palette**:
  - **Primary Canvas**: Deep Space Obsidian (`#05060A`) and Singularity Void (`#090B12`)
  - **Elevated Glass & Hairlines**: Translucent Obsidian (`rgba(11, 14, 23, 0.72)`) with specular hairline borders (`rgba(229, 169, 60, 0.16)` and `rgba(255, 255, 255, 0.08)`)
  - **Primary Accent**: Relativistic Accretion Gold (`#E5A93C` / `#F5D08A`) representing gravitational Doppler beaming and photon-ring luminance
  - **Secondary Accent**: Cerenkov Telemetry Cyan (`#38BDF8`) for precision astronomical telemetry, coordinates, and interactive reticles
  - **Text Hierarchy**: Starlight Ivory (`#F8FAFC`), Nebula Slate (`#94A3B8`), and Deep Telemetry Muted (`#64748B`)
- **Typography & Editorial Discipline**:
  - **Display Serif**: `Cinzel` / `Playfair Display` for dramatic, wide-tracked cinematic headlines
  - **UI Sans**: `Plus Jakarta Sans` / `Inter` for crisp body copy
  - **Telemetry Mono**: `JetBrains Mono` with `tabular-nums` for live right-ascension/declination coordinates, Kerr spin parameters ($a/M$), redshift ($z$), and frame-scrub telemetry
  - **Strict Anti-Slop Discipline**: Zero generic SaaS badge pills; replace rounded pill tags with sharp architectural coordinate indices (`01 // EVENT HORIZON`, `RA 17h 45m 40.04s | DEC -29° 00' 28.1"`), exposed hairline grids, and live telemetry HUD overlays.

---

## 2. Replacing the Old Landing Background with an Interactive 3D WebGL Cosmos
We will completely remove the legacy `CosmicBackgroundCanvas.tsx` (which rendered basic procedural Earth/Venus/Mars spheres) and replace it with a high-precision, cursor- and scroll-reactive Three.js WebGL scene:

- **Scroll-Driven 3D Camera Flight**:
  - As the user scrolls down or up the page, the 3D camera flies smoothly along a spline through a multi-layered relativistic starfield, volumetric accretion dust filaments, and gravitational lensing rings.
- **Cursor-Interactive Gravitational Lensing & Parallax**:
  - Moving the cursor across the viewport applies damped 3D angular parallax to the camera rig, warps nearby starlight particles via a custom GLSL gravitational deflection field around the pointer, and updates a subtle astronomical HUD reticle with live cursor sky coordinates.
- **Interactive 3D Celestial Showcase**:
  - Includes an interactive 3D relativistic singularity / exoplanet-host preview node that responds to hover, drag-orbit, and scroll velocity (`dScroll/dt` star-streak warp effect).

---

## 3. Zero-Lag Bidirectional Scroll-Scrubbed Kerr Black Hole Video Engine
To ensure the two uploaded 1080p Rotating Kerr Black Hole videos (`Rotating_Kerr_black_hole_visuali__1080p_20261024024512_4b03a008.mp4` and `Rotating_Kerr_black_hole_visuali__1080p_20261024024506_51d485ff.mp4`) scrub smoothly **both forward (scroll down) and backward (scroll up)** with zero decoder stutter:

- **Hybrid Frame-Buffer + Damped Seek Architecture (`ScrollScrubVideoCanvas.tsx`)**:
  - **Why standard `<video>.currentTime` lags on reverse scroll**: MP4 H.264/HEVC streams use inter-frame GOP compression, causing browser hardware decoders to stall when seeking backward across non-keyframes.
  - **Our Solution**:
    1. **Offscreen Frame Extraction Cache**: On load, a background worker/warmup pipeline steps through the 9-second 1080p video and caches decoded frames as GPU-ready `ImageBitmap` / offscreen canvas frames across the timeline, while providing immediate damped `currentTime` scrubbing with `fastSeek` fallback during the first second of page load.
    2. **Inertial `requestAnimationFrame` Scrubbing Loop**: Scroll position within each pinned chapter container is mapped to normalized progress $p \in [0, 1]$ and smoothed via frame-rate-independent exponential damping (`lerpFactor = 1 - Math.exp(-14 * dt)`).
    3. **High-DPI Canvas Composite + Cursor Parallax**: Each frame is drawn to a full-bleed retina `<canvas>` with subtle cursor-driven 3D perspective tilt, radial vignette, and real-time relativistic telemetry readouts (Kerr spin parameter $a^* = 0.998$, inclination angle $\theta_{\text{obs}}$, photon ring radius $r_{\text{ph}}$, and Boyer-Lindquist horizon time).
    4. **Interactive Scrub Override**: Users can either scroll naturally up/down to scrub the Kerr black hole rotation forward and backward or drag an optional precision timeline scrubber bar to inspect any millisecond of gravitational lensing.

---

## 4. Landing Page Narrative & Section Architecture
We will restructure `/src/routes/index.tsx` and `/src/components/site/SpaceEduHero.tsx` into a cohesive **Universal Astrophysics Showcase**:

1. **Chapter 01 — Pinned Hero & Kerr Singularity Scroll-Scrub (`Video 1: 4b03a008.mp4`)**:
   - Full-viewport sticky scrollytelling stage (`280vh` scroll track).
   - Scrolling down smoothly scrubs the Rotating Kerr Black Hole photon ring and gravitational lensing arc forward; scrolling up smoothly reverses time.
   - Editorial overlay transitions through 3 scroll-linked beats:
     - *Beat A (0%–35%)*: **"OUR VISIBLE UNIVERSE — THE RELATIVISTIC 3D ATLAS"** with primary CTAs to Launch the 3D Universe (`/universe`) and Explore the 24-Module Academy (`/academy`).
     - *Beat B (35%–70%)*: **"LIGHT BENT BY SPACETIME CURVATURE"** — live telemetry callouts pointing to the Doppler-boosted prograde accretion arc and Einstein photon ring.
     - *Beat C (70%–100%)*: **"FROM PLANCK SCALE TO 93 BILLION LIGHT-YEARS"** — direct jump triggers into landmark black holes (TON 618, Sagittarius A*, M87*, Gargantua-class Kerr systems).
2. **Chapter 02 — Interactive 3D Cosmic Atlas & Scale Lab Showcase**:
   - Interactive bento-grid showcase with cursor-reactive 3D cards for the **Solar System & Moons CGI**, **Exoplanet Host Systems (TRAPPIST-1, 51 Pegasi, Kepler)**, **3D Raymarched Nebulae & Galaxies**, and **Interactive Scale Comparison Lab**.
3. **Chapter 03 — Pinned Relativistic Accretion & Orbital Dynamics Scroll-Scrub (`Video 2: 51d485ff.mp4`)**:
   - Second full-viewport sticky scrollytelling stage (`260vh` scroll track) featuring the second uploaded Rotating Kerr Black Hole visualization (`/assets/aistudio/Rotating_Kerr_black_hole_visuali__1080p_20261024024506_51d485ff.mp4`).
   - Bidirectional scroll scrubbing reveals the relativistic accretion disk dynamics and orbiting structures as editorial overlays highlight the **24-Module Cosmic Learning Academy**, AI Voice Observatory Tutor, and Verified Certificates.
4. **Chapter 04 — Official Astronomical Store (`ourvisibleuniverse.store`) & `@our_visibleuniverse` Community**:
   - Restyled in the Dark Observatory & Relativistic Gold aesthetic while preserving all live product catalog fetching, category filtering, search, and direct links to `ourvisibleuniverse.store` and `@our_visibleuniverse`.
5. **Chapter 05 — Observatory Access Passes (`Plans.tsx`)**:
   - Upgraded visual framing in Obsidian & Gold while keeping the verified Razorpay checkout and pass activation flow intact.

---

## 5. Files to Create & Modify
- **Create `/src/components/site/ScrollScrubVideoCanvas.tsx`**: Reusable, zero-lag bidirectional scroll-scrubbing video engine with `ImageBitmap` frame caching, exponential scroll damping, cursor parallax, and live astrophysical HUD telemetry.
- **Replace `/src/components/site/CosmicBackgroundCanvas.tsx`**: Replace the old 3-planet background with a custom Three.js WebGL Relativistic Cosmos & Cursor-Warped Starfield (`CosmicBackgroundCanvas.tsx`) that reacts to scroll depth, scroll velocity, and pointer coordinates.
- **Rewrite `/src/components/site/SpaceEduHero.tsx`**: Transform into the Chapter 01 Pinned Kerr Black Hole Scroll-Scrub Hero using `/assets/aistudio/Rotating_Kerr_black_hole_visuali__1080p_20261024024512_4b03a008.mp4`.
- **Update `/src/routes/index.tsx`**: Integrate the Chapter 03 Pinned Kerr Accretion Scroll-Scrub Showcase (`/assets/aistudio/Rotating_Kerr_black_hole_visuali__1080p_20261024024506_51d485ff.mp4`), interactive 3D cursor-tilt observatory cards, and the Dark Observatory & Relativistic Cinema theme across the entire landing page.
- **Update `/src/components/site/SiteHeader.tsx`, `/src/components/site/SiteFooter.tsx`, & `/src/styles.css`**: Harmonize navigation, typography, and surface tokens with the Obsidian, Warm Gold, and Cerenkov Cyan palette.
