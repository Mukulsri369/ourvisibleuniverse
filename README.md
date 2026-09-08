# Stellar Journeys

Build a complete interactive 3D star visualization web application called 
"100,000 Stars" — a cinematic, immersive space exploration experience. 
This should be a single-page React application.

═══════════════════════════════════════════════════
DESIGN PHILOSOPHY
═══════════════════════════════════════════════════
- Pure black (#000000) background — the ENTIRE page is the 3D experience
- Minimal, restrained UI with almost no visible chrome
- Cinematic and atmospheric — like a museum installation meets a video game
- Zero friction: no login, no signup, no nav bar. Open and explore immediately
- White/light-gray text, clean sans-serif typography (Inter or Space Grotesk)
- The feeling should evoke: awe, silence, cosmic scale, wonder
- UI elements should be translucent/frosted glass where possible

═══════════════════════════════════════════════════
TECHNOLOGY STACK
═══════════════════════════════════════════════════
- React with TypeScript
- @react-three/fiber (React Three Fiber) for WebGL 3D rendering
- @react-three/drei for helpers (OrbitControls, Sprite, Billboard, Html, Stars, etc.)
- Three.js for custom shaders and materials
- Tailwind CSS for overlay UI styling
- Use framer-motion for smooth panel/overlay animations
- Zustand or React context for state management (camera position, selected star, tour progress, music state)

═══════════════════════════════════════════════════
STAR DATA
═══════════════════════════════════════════════════
- Create a JSON data file with at least 87 named stars including:
  - name, x/y/z coordinates (relative to Sun), distance in light-years,
    spectral type/class, magnitude, constellation, and a 2-3 sentence 
    Wikipedia-style description
- Include these stars at minimum: Sun, Sirius, Alpha Centauri A, 
  Alpha Centauri B, Proxima Centauri, Barnard's Star, Wolf 359, 
  Lalande 21185, Sirius B, Luyten 726-8, Ross 154, Ross 248, 
  Epsilon Eridani, Lacaille 9352, Ross 128, EZ Aquarii, 61 Cygni A, 
  Procyon, Struve 2398 A, Groombridge 34 A, Epsilon Indi, 
  40 Eridani, 70 Ophiuchi, Altair, Vega, Fomalhaut, Pollux, 
  Castor, Denebola, Arcturus, Capella, Aldebaran, Betelgeuse, 
  Rigel, Antares, Spica, Regulus, Polaris, and others
- Generate ~10,000-50,000 additional unnamed background star positions 
  randomly distributed in 3D space for visual density

═══════════════════════════════════════════════════
3D SCENE — STAR FIELD RENDERING
═══════════════════════════════════════════════════
1. STAR PARTICLES:
   - Render all stars as a THREE.Points particle system for performance
   - Each star point should vary in SIZE based on its visual magnitude 
     (brighter stars = larger dots, dimmer = smaller/pinpoints)
   - Each star should be COLORED based on spectral type:
     * O/B type (hot): blue-white (#9bb0ff to #aabfff)
     * A type: white (#cad7ff)
     * F type: yellow-white (#f8f7ff)
     * G type (like Sun): yellow (#fff4ea)
     * K type: orange (#ffd2a1)
     * M type (cool): red (#ffcc6f to #ff8a3d)
   - Use a circular soft-glow texture for star particles (not square)
   - Add a subtle twinkling/brightness oscillation animation using 
     custom shader attribute (slight random size variation over time)
   - Stars closer to camera should appear brighter; distant ones dimmer

2. SUN MODEL (Center of the scene):
   - Create a prominent glowing sphere at position (0,0,0)
   - Animated pulsating surface: use a custom shader with FBM noise 
     to create a lava/plasma-like animated surface (orange-yellow)
   - Corona glow: add a larger semi-transparent sprite behind the Sun 
     with radial gradient (bright center → transparent edges), 
     using additive blending
   - Lens flare: add horizontal streak of light using a wide, thin, 
     bright sprite (hexagonal anamorphic flare style)
   - Solar flare: add a small torus or ring shape near the Sun surface
     that animates outward slightly

3. ORIENTATION PLANE:
   - Add a flat circular ring or disc around the Sun for spatial reference
   - Very subtle, semi-transparent, with a scrolling wave texture
   - This helps the user perceive the "flat plane" of the galactic disc

4. OORT CLOUD:
   - At approximately 1 light-year distance from the Sun, render a 
     faint, hazy sphere of particles representing the Oort Cloud
   - Should appear as a diffuse cloud of dim dots
   - Fades in/out based on camera distance

5. GALAXY BACKDROP (Maximum zoom out):
   - When zoomed very far out, display a large spiral galaxy image 
     as a background plane behind the star field
   - Use a Milky Way / spiral galaxy photo or procedurally generate 
     spiral arm patterns with particle systems
   - The galaxy image should slowly rotate to give a sense of scale
   - The 100,000 stars should appear as a small cluster within this galaxy

═══════════════════════════════════════════════════
NAMED STAR LABELS (CSS3D BILLBOARDS)
═══════════════════════════════════════════════════
- Place labels for all 87 named stars in 3D space at their positions
- Labels MUST always face the camera (billboard effect using drei's 
  Billboard or Html component)
- White text, small font size (~12-14px), semi-transparent
- Labels should only appear when zoomed to a range where they're 
  readable (fade in when nearby, fade out when too far)
- On hover: label glows slightly (text-shadow or brightness increase)
- On click: opens the star info panel (see below)
- Some named stars should have a tiny colored glow dot larger than 
  background stars to make them discoverable

═══════════════════════════════════════════════════
STAR INFO PANEL (Right Side Slide-in)
═══════════════════════════════════════════════════
When a user clicks on any named star:
- A panel slides in from the RIGHT side of the screen
- Panel design: semi-transparent dark frosted glass 
  (background: rgba(10,10,30,0.85), backdrop-blur)
- Panel width: ~350px on desktop, full-width on mobile
- Contents:
  * Star name — large heading (24px, bold, white)
  * Close/X button — top-right corner
  * Key stats in a clean 2-column grid:
    - Distance: [X] light-years
    - Spectral Class: [e.g., G2V]
    - Constellation: [name]
    - Visual Magnitude: [number]
  * Separator line
  * Description: 2-4 sentences of text about the star 
    (Wikipedia-style content from your data)
- Smooth slide-in animation (300ms ease-out)
- Clicking "X" or clicking outside closes the panel
- When panel opens, camera should smoothly animate to frame the 
  selected star nicely

═══════════════════════════════════════════════════
CAMERA & NAVIGATION
═══════════════════════════════════════════════════
- Initial position: zoomed IN close to the Sun (distance ~5-10 units)
- Mouse/touchpad SCROLL WHEEL: zoom in/out smoothly
  * Use smooth damped zooming (not jumpy)
  * Zoom range: from very close to Sun (~2 units) to full galaxy view 
    (~5000 units)
- Click + DRAG: rotate the scene (turntable/orbit style)
  * Smooth inertia/momentum after release
  * Constrain rotation so user can't flip upside down completely
- DYNAMIC FIELD OF VIEW:
  * When zoomed IN close: narrow FOV (~30-45°) — telephoto/magnified feel
  * When zoomed OUT to galaxy: wide FOV (~80-90°) — wide-angle cinematic feel
  * FOV should transition smoothly during zoom
- All camera transitions should use smooth easing (cubic ease-in-out)

═══════════════════════════════════════════════════
ZOOM SLIDER (Right Side of Screen)
═══════════════════════════════════════════════════
- Place a VERTICAL zoom slider on the RIGHT edge of the screen
- Thin, minimalist design — semi-transparent white track with a small 
  circular thumb
- Dragging the slider zooms in/out (synced with scroll wheel)
- Position of thumb represents current zoom level
- Very subtle — doesn't dominate the view
- On mobile, this can be hidden or replaced by pinch-to-zoom

═══════════════════════════════════════════════════
TAKE THE TOUR BUTTON (Upper Left Corner)
═══════════════════════════════════════════════════
- "Take the Tour" text button in the UPPER-LEFT corner of the screen
- Small, subtle, white text, slightly translucent
- When clicked, launches an AUTOMATED GUIDED TOUR with these stops:

  STOP 1 — "The Sun" (0-8 seconds):
  * Camera is very close to the Sun
  * Text overlay fades in: "The Sun — Our home star, 4.6 billion years old"
  * Sun is fully visible with glow, corona, flares

  STOP 2 — "Our Solar System" (8-15 seconds):
  * Camera zooms out slowly
  * Text overlay: "Our Solar System — Eight planets orbit the Sun"
  * Planet orbits become faintly visible (thin rings)

  STOP 3 — "The Oort Cloud" (15-22 seconds):
  * Camera continues zooming out to ~1 light-year
  * Text overlay: "The Oort Cloud — A shell of icy bodies marking the 
    edge of the Sun's influence, about 1 light-year away"
  * The Oort Cloud particle cluster fades into view

  STOP 4 — "Nearby Stars" (22-35 seconds):
  * Camera zooms out further
  * Named star labels begin appearing (Sirius, Alpha Centauri, etc.)
  * Text overlay: "87 Named Stars — The closest stars to our Sun, 
    each one a distant sun of its own"
  * Camera slowly rotates while zooming

  STOP 5 — "Our Stellar Neighborhood" (35-50 seconds):
  * Camera zooms out to show the full 100,000 star field
  * Text overlay: "100,000 Stars — An accurate map of our stellar 
    neighborhood within the Milky Way"
  * Dense star field visible in all directions

  STOP 6 — "The Milky Way" (50-60 seconds):
  * Camera reaches maximum zoom-out
  * Galaxy backdrop image becomes fully visible
  * Text overlay: "The Milky Way — Our galaxy contains over 
    100 billion stars. You are here."
  * A small indicator/dot shows where our 100,000 stars sit 
    within the galaxy

- Between each stop: smooth cinematic camera animation (ease-in-out)
- Text overlays: white text, centered, fade in → stay 3-5 sec → fade out
- Show a "Skip Tour" / "✕" button during the tour
- At the end of the tour, transition to free explore mode

═══════════════════════════════════════════════════
TOGGLE SPECTRAL INDEX BUTTON (Upper Left, near Tour button)
═══════════════════════════════════════════════════
- A small icon button (spectrum/graph icon) next to the Tour button
- "Toggle spectral index" functionality:
  * Default state: stars show natural colors (white-ish dots)
  * Toggled state: ALL stars recolor based on their spectral temperature
    — ranging from deep red (M-type, coolest) through orange, yellow, 
    white, to blue (O-type, hottest)
  * This creates a beautiful rainbow-like color gradient across the star field
  * Smooth transition animation when toggling (colors interpolate over 1 second)
- Button should have a tooltip or small label "Toggle Spectral Colors"

═══════════════════════════════════════════════════
SEARCH FUNCTIONALITY
═══════════════════════════════════════════════════
- Add a search icon button in the upper-left area (near Tour/Spectral buttons)
- When clicked, opens a small search input field
- User types a star name (e.g., "Sirius", "Betelgeuse", "Vega")
- As user types, show autocomplete dropdown matching star names from data
- When a star is selected from dropdown:
  * Camera smoothly animates to that star's position
  * Zooms to an appropriate viewing distance
  * The star's info panel opens automatically
  * Star label highlights/glows

═══════════════════════════════════════════════════
AMBIENT MUSIC
═══════════════════════════════════════════════════
- Add a music toggle button — small speaker/sound icon, bottom-left
- Include a royalty-free ambient space soundtrack 
  (atmospheric, slow, ethereal — think Mass Effect galaxy map music)
- Music should loop seamlessly
- Auto-play is OFF by default (respect browser policies)
- User clicks the music icon to start/stop
- Music button should show play/pause state clearly
- Volume should be subtle — not overpowering

═══════════════════════════════════════════════════
DISTANCE/SCALE INDICATOR
═══════════════════════════════════════════════════
- Show a small text indicator showing the current scale
- Example: "5 light-years" when close, "100 light-years" when mid, 
  "1,000 light-years" when far out
- Update dynamically as user zooms
- Position: bottom-center or bottom-left
- Small, translucent, non-intrusive

═══════════════════════════════════════════════════
LOADING SCREEN
═══════════════════════════════════════════════════
- While the 3D scene and star data load, show a loading screen:
  * "100,000 Stars" — title in elegant, large white typography, centered
  * "An interactive visualization of the stellar neighborhood" — subtitle
  * Subtle twinkling star particles animated in the background
  * A thin loading progress bar at the bottom
  * Loading should feel fast and cinematic, not boring
- Once loaded, fade out the loading screen and fade in the 3D scene

═══════════════════════════════════════════════════
BINARY STAR SYSTEMS
═══════════════════════════════════════════════════
- At least 3-5 named stars should be binary/multiple star systems:
  * Example: Alpha Centauri A & B (and Proxima Centauri nearby)
  * Example: Sirius A & B
  * Example: 61 Cygni A & B
- Binary stars should have a visible orbital animation 
  (small dots orbiting each other)
- This adds visual interest and scientific accuracy

═══════════════════════════════════════════════════
CHROME EXPERIMENT BRANDING
═══════════════════════════════════════════════════
- Small, subtle branding text in a bottom corner:
  * "A Chrome Experiment" or your project name
  * Very low opacity, doesn't distract from the experience

═══════════════════════════════════════════════════
MOBILE RESPONSIVE
═══════════════════════════════════════════════════
- Touch: single finger drag = rotate, pinch = zoom
- Star labels scale down and reduce count on mobile
- Info panel becomes full-screen overlay
- Tour works on mobile (auto-animates camera)
- Zoom slider hidden on mobile (rely on pinch-to-zoom)
- Search accessible via icon tap
- All UI elements sized for touch targets (min 44px)

═══════════════════════════════════════════════════
PERFORMANCE
═══════════════════════════════════════════════════
- Use BufferGeometry for star particles (not Geometry)
- Use custom shaders for star rendering (point sprites with size attenuation)
- Only render visible stars (frustum culling or distance-based LOD)
- Animate at 60fps minimum on modern devices
- Lazy-load star data in chunks if needed
- Use requestAnimationFrame properly

═══════════════════════════════════════════════════
ANIMATION DETAILS
═══════════════════════════════════════════════════
- Star twinkling: subtle sinusoidal brightness oscillation (different 
  phase per star, random period 2-6 seconds)
- Sun surface: continuous noise-based displacement animation
- Camera transitions: smooth cubic-bezier easing, duration 1-3 seconds
- Text overlays: fade in (opacity 0→1, 500ms), stay, fade out (500ms)
- Info panel: slide from right (translateX 100%→0, 300ms ease-out)
- Tour transitions: camera position + FOV interpolated smoothly
- Galaxy backdrop: very slow rotation (one full rotation = ~5 minutes)
- All animations should feel slow, deliberate, and cinematic — never jarring

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://ourvisibleuniverse.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6f478791-cfcb-4931-ba58-b9ed1948e8d4).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
