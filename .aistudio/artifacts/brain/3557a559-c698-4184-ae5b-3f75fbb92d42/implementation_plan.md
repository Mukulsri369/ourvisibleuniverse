# Dark Space Theme & 3D Celestial Parallax Background (Earth, Venus, Mars)

Transform the landing page into an immersive deep cosmic dark space experience featuring a dedicated Three.js / WebGL background scene where high-fidelity 3D rotating spheres for **Earth**, **Venus**, and **Mars** smoothly pop out and orbit with scroll-driven parallax as the user navigates from the top hero down to the footer.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following design choices were confirmed during Phase 1 clarification:
>
> - **Celestial Spheres**: High-resolution 3D celestial spheres with physical rotation, procedural atmospheric glow, cloud layers, and surface detail (oceans/continents for Earth, sulfur cloud layers for Venus, red iron rust & polar cap for Mars).
> - **Motion & Trajectory**: Parallax drift emerging along viewport edges, orbiting gently with physics-based inertia and scroll position tracking that persists down through every content section.
> - **Cosmic Atmosphere**: Deep cosmic obsidian background (`#05070d`) layered with an animated twinkling multi-depth starfield and subtle nebula gradient dust.

- **Confirmed Decision 1**: Three.js WebGL canvas pinned in a fixed background layer behind the landing page with zero pointer-events blocking, running an optimized requestAnimationFrame loop with smooth damping (`THREE.MathUtils.damp`).
- **Confirmed Decision 2**: Dark space overhaul for all landing page cards, sections, and header/footer using semi-transparent glassmorphism (`bg-slate-900/50 backdrop-blur-md border border-white/10`) allowing celestial motion to shine through between content blocks without sacrificing readability.
- **Confirmed Decision 3**: Responsive scaling and performance guards (`prefers-reduced-motion` detection, DPR clamping at 2, automatic disposal on unmount).

---

## 1. Overview & Core Concept

- **What It Does**: Replaces the default mixed-brightness theme on the homepage with a unified, cinematic dark space theme. Mounts a fixed background 3D canvas that renders an animated starfield along with three distinct celestial bodies—Earth, Venus, and Mars. As the visitor scrolls down through the sections (Hero, Parent Trust, Why Parents Feel Proud, Store Showcase, Interactive Scales, Pricing & Passes, FAQs, Footer), the planets dynamically emerge, rotate on their natural axial tilts, and gently drift along parallax orbits flanking the content.
- **Target Audience & Persona**: Parents and curious kids exploring the value proposition of _Our Visible Universe_. The cosmic immersion sparks wonder while conveying scientific rigor and premium quality.
- **Key Value**: Delivers immediate emotional impact and visual proof of the platform's 3D universe capabilities right on the landing page, dramatically increasing parent engagement and pass conversion.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Initial Load (Hero Viewport)**:
   - Deep obsidian space background with multi-tier twinkling stars.
   - SpaceEdu hero headline and interactive video/3D preview remain the primary focal anchor.
   - In the peripheral background, Earth is positioned gracefully with its atmospheric glow and rotating cloud decks.
2. **Scroll Descent (Parent Trust & Benefits Sections)**:
   - As the user scrolls past the trust markers into "Why Parents Feel Proud", **Venus** smoothly pops out from the right flank, glowing in warm golden sulfuric tones with rapid atmospheric rotation.
   - **Earth** glides with parallax depth, appearing to orbit behind the bento grid cards.
3. **Mid-Scroll (Store & Scale Exploration Sections)**:
   - Passing into the Official Store Showcase and Scale Explorer, **Mars** emerges from the lower left with its distinctive rusty-orange hue, polar ice cap, and subtle cratered surface.
   - All three planets maintain continuous gentle orbital rotation and independent parallax vertical velocities.
4. **Footer & Access Passes**:
   - Near the bottom pricing cards and footer, the planets reach a harmonized cosmic configuration, providing a celestial backdrop for the final call to action.

### Visual Identity & Theme Tokens

- **Background Canvas**: `#04060b` to `#080d1a` deep void gradient.
- **Surface Elevation**: Dark frosted glass cards (`bg-slate-950/60 backdrop-blur-lg border border-white/10`).
- **Typography & Contrast**: Crisp white headings (`text-white`), muted blue-gray metadata (`text-slate-400`), and laser-cyan / amber accents (`text-cyan-400`, `text-amber-400`) adhering to WCAG AA contrast.
- **Motion Rhythm**: Compositor-friendly transforms and damp-interpolated scroll offsets ensuring constant 60 FPS performance.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Fixed Background Three.js Layer vs Inline Canvas per Section**
  - _Chosen Approach_: A single, persistent fixed-position background Three.js canvas (`fixed inset-0 pointer-events-none z-0`) covering the entire viewport.
  - _Why_: A single WebGL context is significantly more performant than multiple canvas instances, ensures zero context-switching overhead, and creates seamless continuous orbital motion across scroll boundaries.
  - _Alternatives Considered_: CSS 3D transforms or multiple canvases (discarded due to lack of true lighting/rotation and memory overhead).

- **Decision 2: Procedural PBR Textures vs External Image Textures**
  - _Chosen Approach_: Procedural HTML5 2D canvas generation utilizing the project's tested texture generation algorithms from `src/stars/Planets.tsx`.
  - _Why_: Guarantees zero 404 errors, zero network latency, instant initial paint, and crisp grazing-angle sharpness with anisotropic filtering.
  - _Alternatives Considered_: External JPG/PNG planet textures from unverified CDNs (banned by skills and fragile in offline/preview environments).

- **Decision 3: Scroll Synchronization Architecture**
  - _Chosen Approach_: Passive window scroll listener updating normalized progress `[0, 1]` with lerped smoothing (`requestAnimationFrame` + `MathUtils.damp`).
  - _Why_: Eliminates jitter and scroll-jacking. Natural browser scrolling is completely preserved, and planets respond fluidly even with touch trackpads or wheel flicks.

---

## 4. Technical Architecture & Data Strategy

### Component Architecture & Visual Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Landing Page (Index Route)                      │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ CosmicBackgroundCanvas (Fixed, z-0, WebGL Three.js)              │  │
│  │  ├─ Multi-depth Twinkling Starfield Points (3,000 particles)     │  │
│  │  ├─ Dynamic Nebula Dust Particle Clouds                          │  │
│  │  ├─ Earth Mesh (Axial tilt 23.4°, ocean/continents, cloud deck)  │  │
│  │  ├─ Venus Mesh (Axial tilt 177°, sulfuric cloud bands, glow)     │  │
│  │  └─ Mars Mesh (Axial tilt 25.2°, rust red surface, polar cap)   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ DOM Content Layers (Relative, z-10, Pointer-Events-Auto)         │  │
│  │  ├─ SiteHeader (Glassmorphic dark bar + Store button)            │  │
│  │  ├─ SpaceEduHero (Hero banner & 3D preview)                      │  │
│  │  ├─ Parent Trust Bar (100% Ad-free, NASA data, one-time pass)   │  │
│  │  ├─ Why Parents Feel Proud (Bento grid on translucent cards)     │  │
│  │  ├─ Official Store Showcase (Curated mix of verified products)   │  │
│  │  ├─ Scale Explorer & Celestial Highlights                        │  │
│  │  ├─ Parent Testimonials & Transparent Pricing Passes             │  │
│  │  ├─ FAQ Accordion & Closing Stargazer CTA                        │  │
│  │  └─ SiteFooter (Dark cosmic footer with links & store button)    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### Component Details

1. **`src/components/site/CosmicBackgroundCanvas.tsx`**:
   - Manages Three.js scene, perspective camera, and WebGLRenderer.
   - Builds procedural textures for Earth (blue oceans, green/brown continents, cloud layer with opacity, atmosphere rim glow), Venus (warm amber cloud swirl), and Mars (red-orange cratered terrain and polar ice).
   - Generates 3,000 instanced starfield points with variable twinkle frequencies.
   - Listens to scroll events using a smoothed progress variable, mapping scroll depth to target orbital coordinates $(x, y, z)$ for each planet.
   - Continuous subtle self-rotation on each planet's axis.
   - Cleanup hook disposing of geometries, materials, and textures on unmount.

2. **`src/routes/index.tsx` & Layout Styling**:
   - Enforce dark theme tokens on the landing page container: `bg-[#04060b] text-slate-100`.
   - Update cards, headers, and sections to use dark glassmorphism (`bg-slate-900/40 border-white/10 text-white`).
   - Retain full functionality of store showcase, shuffle button, pricing tabs, and links.

---

## 5. Implementation Steps & Verification Plan

1. **Step 1: Create `CosmicBackgroundCanvas.tsx`**
   - Implement Three.js setup with procedural planet generation (Earth, Venus, Mars) and starfield.
   - Integrate scroll position tracking with spring/damp kinematics.
2. **Step 2: Update Landing Page Theme in `src/routes/index.tsx` & `PublicLayout.tsx`**
   - Mount `CosmicBackgroundCanvas` behind page content.
   - Adjust section backgrounds to transparent/dark glassmorphic layers so background planets remain visible during scroll.
3. **Step 3: Verification & Polish**
   - Run `lint_applet` and `compile_applet`.
   - Test smooth rendering, scroll responsiveness, mobile breakpoints, and absence of hydration/SSR mismatches.
