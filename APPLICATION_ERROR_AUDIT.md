# OUR VISIBLE UNIVERSE — APPLICATION ERROR ROOT-CAUSE AUDIT
## PART 1 — PROMPT 03 OF 12: APPLICATION ERROR INVESTIGATION & RUNTIME STABILITY

**Repository:** https://github.com/Mukulsri369/ourvisibleuniverse  
**Production Website:** https://ourvisibleuniverse.in  
**Audit Date:** October 2026  
**Audited By:** Coordinated Reliability Engineering Team  
**Execution Mode:** Deep Diagnostics, Reproduction, Root-Cause Verification, Safe Test Instrumentation, Documentation  

---

## 1. EXECUTIVE ERROR ARCHITECTURE OVERVIEW

### 1.1 Existing Error Capture Architecture
The application currently employs a tiered error capture strategy:
1. **Root SSR Error Trapping (`src/server.ts`):** Wraps TanStack Start Nitro/H3 server requests. Catches unhandled throws swallowed by H3 into generic 500 responses (`{"unhandled":true,"message":"HTTPError"}`) and normalizes them into a rendered HTML fallback (`src/lib/error-page.ts`).
2. **Global Event Listeners (`src/lib/error-capture.ts`):** Listens to `globalThis.addEventListener("error")` and `"unhandledrejection"`. Retains the single most recent error for 5,000ms in memory.
3. **Route Boundary Capture (`src/routes/__root.tsx`):** Root TanStack Router `ErrorComponent` captures uncaught client-side render exceptions, invokes `reportLovableError()`, and replaces the entire viewport with `"This page didn't load"`.
4. **Third-Party Telemetry Bridge (`src/lib/lovable-error-reporting.ts`):** Dispatches errors to `window.__lovableEvents?.captureException`. When running standalone without the Lovable preview script attached, this dispatch silently no-ops.

### 1.2 Critical Error Architecture Weaknesses Discovered
- **Single-Slot Error Clobbering (`src/lib/error-capture.ts`):** The global recorder stores only a single `lastCapturedError`. When a primary failure causes a cascade of secondary failures (e.g. WebGL context loss leading to consecutive shader execution exceptions), the true root-cause error is overwritten before the server handler can read it.
- **Monolithic Route-Level Blown Glass (`src/routes/__root.tsx`):** Neither `StarsApp` nor `Universe` nor the 24 Academy lesson layouts implement local React `ErrorBoundary` wrappers. Any unhandled exception in an isolated 3D component (e.g. a null star coordinate or WebGL context drop) bubbles to the root router boundary, tearing down the entire page.
- **Silent Telemetry Drop:** Outside of the active Lovable development iframe, client exceptions do not log structured diagnostic contexts or stack traces to any persistent storage.

---

## 2. ERROR TAXONOMY & CLASSIFICATION MATRIX

```
+---------------------------------------------------------------------------------------+
| ERROR TAXONOMY                                                                        |
+---------------------------------------------------------------------------------------+
| CAT A: JavaScript Runtime Errors    | Undefined/null properties, unhandled rejections |
| CAT B: React Rendering Errors       | Missing effect deps, unhandled boundary bubbles |
| CAT C: Routing & Navigation Errors  | Search param ID mismatches, stale module state  |
| CAT D: Network & API Errors         | Unbounded external fetches, cold async races    |
| CAT E: Authentication & Sessions    | Expired tokens, cold SSR localStorage voids     |
| CAT F: Three.js & WebGL Errors      | Unhandled context loss, un-culled high zoom LOD |
| CAT G: Data & Content Errors        | ID format mismatch ('module-17' vs '17')        |
| CAT H: Environment & Deployment     | Missing Start context in AsyncLocalStorage      |
+---------------------------------------------------------------------------------------+
```

---

## 3. INVESTIGATION OF USER-REPORTED SYMPTOMS

### Problem A: Some interactions produce "Application Error" screens ("This page didn't load")
- **Technical Mechanism:** Any unhandled exception thrown in a child component (e.g. during Three.js rendering in `StarsApp` or during lesson layout mount) triggers TanStack Router's `ErrorComponent` in `src/routes/__root.tsx`.
- **Root Cause:** Lack of local `<ErrorBoundary>` boundaries around interactive 3D viewports and Academy sub-lessons. A single failure destroys the entire application shell instead of displaying a contained component fallback.
- **Confidence:** CONFIRMED ROOT CAUSE.

### Problem B: Some pages intermittently fail to open
- **Technical Mechanism:** 
  1. In `src/routes/cosmic-evolution.tsx:42`, navigation dispatches `search: { module: "module-17" }`. In `AcademyDashboard.tsx`, the registry only matches ID `"17"`. The module fails to find a contract and yields a blank render.
  2. In `src/components/academy/AcademyDashboard.tsx`, `activeLessonModule` is initialized once in `useState(() => ...)` without a `useEffect` reacting to `initialModuleId` changes. Navigating between modules or back to `/learn` preserves the stale prior module.
- **Confidence:** CONFIRMED ROOT CAUSE.

### Problem C: Some interactive components appear unstable or unexpectedly disappear
- **Technical Mechanism:** In `src/components/academy/AcademyDashboard.tsx:337-344`, the `useEffect` registering the `registerModuleNavigationHandler` omitted its dependency array. It re-ran and re-subscribed on every single re-render, creating race conditions with stale navigation closures.
- **Confidence:** CONFIRMED ROOT CAUSE.

### Problem D: Certain navigation actions produce blank screens or failed rendering
- **Technical Mechanism:** Module 13 is registered as a externalized route (`/galaxies`), while Modules 01-12 and 14-24 are internal layouts. Navigating directly to `/learn?module=13` caused an unhandled state in the module layout switcher, returning `null` from `renderActiveModule`.
- **Confidence:** CONFIRMED ROOT CAUSE.

### Problem E: Complex astronomical simulations occasionally behave unpredictably & Solar System zoom-out lag
- **Technical Mechanism:** In `src/stars/Planets.tsx:1618`, `Trail` sets `frustumCulled = false` for ~40 celestial bodies (Sun, 8 planets, and 30+ moons). When zoomed out to galactic and cosmological scales (up to 50 billion light-years), all 40 bodies continue updating dynamic GPU buffer positions and drawing lines, degrading frame rates and creating stutter.
- **Confidence:** CONFIRMED ROOT CAUSE.

### Problem F: The Cosmic Learning Academy experiences loading delays and potentially unstable transitions
- **Technical Mechanism:** When entering fullscreen mode without user permission or in unsupported browser contexts (e.g. iframes or mobile browsers), `requestFullscreen()` rejects. Previously, `CosmosCinematicSessionBridge` failed to record a structured error notice in the state machine, causing state desynchronization.
- **Confidence:** CONFIRMED ROOT CAUSE (Reproduction verified and unit-test assertion established in `scripts/cosmos-cinematic-player-validation.ts`).

### Problem G: Existing error reporting does not provide enough diagnostic information
- **Technical Mechanism:** `src/lib/error-capture.ts` has a single error slot with a 5s TTL. When multiple errors fire, only the last one is preserved. `reportLovableError` in `src/lib/lovable-error-reporting.ts` drops errors if `window.__lovableEvents` is undefined.
- **Confidence:** CONFIRMED ROOT CAUSE.

---

## 4. ROOT-CAUSE SUMMARY & REMEDIATION PLAN (PROMPT 04 CANDIDATES)

1. **ERR-001 (P1):** Add localized React `<ErrorBoundary>` components around `<Canvas>` in `StarsApp.tsx` and around lesson layout rendering in `AcademyDashboard.tsx`.
2. **ERR-002 (P1):** Implement `webglcontextlost` and `webglcontextrestored` listeners with automatic graceful recovery in `StarsApp.tsx`.
3. **ERR-003 (P2):** Normalize module ID parameter parsing in `AcademyDashboard.tsx` (`id.replace(/^module-?/i, "").padStart(2, "0")`) and synchronize `activeLessonModule` via reactive `useEffect([initialModuleId])`.
4. **ERR-004 (P2):** Add distance-based LOD culling to `Planets.tsx` and `MotionTrails.tsx` when camera distance exceeds Solar System boundary (> 0.1 ly).
5. **ERR-005 (P2):** Add `AbortController` and timeout signals to NASA Image Library queries in `src/stars/NasaResources.tsx`.
6. **ERR-006 (P3):** Upgrade `error-capture.ts` to maintain a ring buffer of the last 10 errors with contextual timestamps.
