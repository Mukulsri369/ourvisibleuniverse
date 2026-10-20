# OUR VISIBLE UNIVERSE — CENTRALIZED BUG INVENTORY
## PART 1 — RECONCILED DEFECT CATALOG (PROMPTS 01 – 03)

**Repository:** Mukulsri369/ourvisibleuniverse  
**Website:** https://ourvisibleuniverse.in  
**Status:** Maintained across multi-account AI Studio sessions  

---

## BUG CLASSIFICATION SYSTEM
- **P0 — Critical:** Security vulnerability, unrecoverable data corruption, production outage.
- **P1 — High:** Application-wide crashes, primary feature unusable, major simulation failure.
- **P2 — Medium:** Intermittent failures, recoverable exceptions, performance stutter.
- **P3 — Low:** Minor visual flaws, non-blocking telemetry gaps, cosmetic warnings.

---

## RECONCILED DEFECT INVENTORY

### BUG-001 | Unhandled WebGL Context Loss in Primary 3D Canvas
- **Severity:** P1 (High)
- **Category:** Three.js & WebGL Errors
- **Affected Route:** `/_authenticated/universe`
- **Affected Feature:** Main 3D Interactive Star Universe (`StarsApp.tsx`)
- **Triggering Action:** Switching browser tabs, backgrounding mobile browser, GPU memory pressure.
- **User-Visible Symptom:** Screen flashes black, then unmounts to `"This page didn't load"` (Router ErrorComponent).
- **Relevant Files:** `src/stars/StarsApp.tsx`, `src/routes/__root.tsx`
- **Root Cause:** R3F `<Canvas>` lacks `webglcontextlost` and `webglcontextrestored` event handlers. The subsequent render frame throws an unhandled WebGL exception that bubbles to the root router boundary.
- **Confidence:** CONFIRMED ROOT CAUSE.
- **Recommended Fix:** Add WebGL context lifecycle management with a graceful fallback overlay on context loss and auto-rebind on context restoration.
- **Suggested Repair Prompt:** Prompt 04.

---

### BUG-002 | Missing Local Error Boundaries Around Complex Visualizations
- **Severity:** P1 (High)
- **Category:** React Rendering Errors
- **Affected Route:** `/_authenticated/universe`, `/learn`, `/astrophysics-lab`
- **Affected Feature:** 3D Scene Viewports & Interactive Physics Labs
- **Triggering Action:** Runtime exception thrown inside any child mesh, shader, or sub-lesson component.
- **User-Visible Symptom:** The entire web page is replaced by the generic `"This page didn't load"` screen.
- **Relevant Files:** `src/stars/StarsApp.tsx`, `src/components/academy/AcademyDashboard.tsx`, `src/routes/__root.tsx`
- **Root Cause:** Error boundaries only exist at the top-level route boundary (`__root.tsx`). Isolated component exceptions are not caught locally.
- **Confidence:** CONFIRMED ROOT CAUSE.
- **Recommended Fix:** Wrap `<Canvas>` in `StarsApp.tsx` and `renderActiveModule` in `AcademyDashboard.tsx` with dedicated error boundaries that show localized retry buttons without tearing down the header, footer, or parent UI.
- **Suggested Repair Prompt:** Prompt 04.

---

### BUG-003 | Stale Module Navigation & Parameter Mismatch in Cosmic Learning Academy
- **Severity:** P2 (Medium)
- **Category:** Routing & Navigation Errors
- **Affected Route:** `/learn`
- **Affected Feature:** Academy Dashboard & Module Switcher
- **Triggering Action:** 
  1. Navigating from `/cosmic-evolution` to `/learn` via `search: { module: "module-17" }`.
  2. Navigating between different modules in browser history.
- **User-Visible Symptom:** Academy fails to load the requested module, opens an empty view, or retains the previous module.
- **Relevant Files:** `src/components/academy/AcademyDashboard.tsx`, `src/routes/cosmic-evolution.tsx`
- **Root Cause:** 
  1. Module IDs in registry are formatted as `"17"`, but external links dispatch `"module-17"`.
  2. `activeLessonModule` state does not reactively re-evaluate when `initialModuleId` changes.
- **Confidence:** CONFIRMED ROOT CAUSE.
- **Recommended Fix:** Normalize module ID parsing in `AcademyDashboard` (`module.replace(/^module-?/i, "").padStart(2, "0")`) and add reactive `useEffect([initialModuleId])`.
- **Suggested Repair Prompt:** Prompt 04.

---

### BUG-004 | Missing Dependency Array in Academy Module Navigation Listener
- **Severity:** P2 (Medium)
- **Category:** React Lifecycle & State Stability
- **Affected Route:** `/learn`
- **Affected Feature:** COSMOS Guided Director Navigation Synchronization
- **Triggering Action:** Continuous re-rendering while COSMOS narration or audio is playing.
- **User-Visible Symptom:** Intermittent sluggishness, duplicated event callbacks, or unexpected module switching.
- **Relevant Files:** `src/components/academy/AcademyDashboard.tsx` (lines 337–344)
- **Root Cause:** `useEffect` registering `registerModuleNavigationHandler` omitted its dependency array, re-binding on every single render.
- **Confidence:** CONFIRMED ROOT CAUSE.
- **Recommended Fix:** Add dependency array and stabilize callback with `useCallback`.
- **Suggested Repair Prompt:** Prompt 04.

---

### BUG-005 | Un-culled Motion Trails and Planet Orbits at Cosmological Zoom Distances
- **Severity:** P2 (Medium)
- **Category:** Performance & 3D Rendering
- **Affected Route:** `/_authenticated/universe`
- **Affected Feature:** Solar System Orbits & Motion Trails
- **Triggering Action:** Zooming out to galactic (100,000 ly) or cosmological (100M+ ly) distances.
- **User-Visible Symptom:** Frame rate drops by 15–25 FPS during Solar System zoom-out.
- **Relevant Files:** `src/stars/Planets.tsx` (lines 1570–1623)
- **Root Cause:** `Trail` renders with `frustumCulled = false` for ~40 celestial bodies. GPU buffers continue updating and lines continue rendering even when the entire Solar System is sub-pixel in size.
- **Confidence:** CONFIRMED ROOT CAUSE.
- **Recommended Fix:** Gate motion trail updates and visibility by camera distance threshold (`cameraDistance < 0.05 ly`).
- **Suggested Repair Prompt:** Prompt 04.

---

### BUG-006 | Unbounded Concurrent NASA Image Library Requests
- **Severity:** P2 (Medium)
- **Category:** Network & API Errors
- **Affected Route:** `/_authenticated/universe`
- **Affected Feature:** NASA Resources Space Telescope Inspector (`NasaResources.tsx`)
- **Triggering Action:** Rapidly clicking between different stars, planets, and deep-space objects.
- **User-Visible Symptom:** Images fail to load, showing persistent `"Loading images from NASA..."` or network timeout errors.
- **Relevant Files:** `src/stars/NasaResources.tsx` (lines 112–130, 206–232)
- **Root Cause:** Outbound fetches to `https://images-api.nasa.gov/search` do not use `AbortController` or request timeouts.
- **Confidence:** CONFIRMED ROOT CAUSE.
- **Recommended Fix:** Pass an `AbortSignal` to `fetch()` and cancel in-flight queries when target selection changes.
- **Suggested Repair Prompt:** Prompt 04.

---

### BUG-007 | Cold-Start Asynchronous Race Condition in Ingestion Search Pipeline
- **Severity:** P2 (Medium)
- **Category:** JavaScript Runtime / API Errors
- **Affected Route:** `/api/public/catalog/search`
- **Affected Feature:** Astronomical Catalog Public Search API
- **Triggering Action:** Sending a search request immediately upon cold server startup before catalog ingestion finishes.
- **User-Visible Symptom:** Initial search returns `{ total: 0, data: [] }` even for well-known benchmark objects like Sirius or Andromeda.
- **Relevant Files:** `src/lib/astronomy/ingestion/pipeline.ts` (lines 173–175, 224)
- **Root Cause:** `getPublishedCatalog()` invoked `this.execute()` (an async method) without awaiting completion, returning the empty array synchronously.
- **Confidence:** CONFIRMED ROOT CAUSE.
- **Recommended Fix:** Ensure catalog initialization promise is awaited or pre-warmed during server bootstrap.
- **Suggested Repair Prompt:** Prompt 04.

---

### BUG-008 | Fullscreen Permission Rejection Omitted Error Notice
- **Severity:** P3 (Low - RESOLVED IN PROMPT 03)
- **Category:** COSMOS Director Runtime
- **Affected Route:** `/learn`
- **Affected Feature:** Fullscreen Cinematic Player State Synchronization
- **Triggering Action:** Browser rejects `requestFullscreen()` or user cancels permission.
- **User-Visible Symptom:** Player enters viewport fallback mode, but state machine did not register error notice.
- **Relevant Files:** `src/lib/cosmos/cinematic/CosmosCinematicSessionBridge.ts`
- **Resolution:** Updated `requestBrowserFullscreen` to record `FULLSCREEN_PERMISSION_DENIED` and `FULLSCREEN_UNSUPPORTED` in the authoritative state manager. Verified with 100% pass across all 40 tests in `cosmos-cinematic-player-validation.ts`.
- **Status:** RESOLVED & VERIFIED.
