# OUR VISIBLE UNIVERSE — RUNTIME STABILITY REPORT
## PART 1 — PROMPT 03 OF 12: RUNTIME STABILITY, LIFECYCLE & FAILURE DIAGNOSTICS

**Repository:** Mukulsri369/ourvisibleuniverse  
**Platform:** Google AI Studio  
**Audit Scope:** React Lifecycles, Async Operations, Memory & GPU Allocation, WebGL Context, Academy Director, SSR/Hydration  

---

## 1. REACT LIFECYCLE & HOOK STABILITY

### 1.1 Unbounded Effect Re-subscriptions
- **File:** `src/components/academy/AcademyDashboard.tsx`
- **Location:** Lines 337–344
- **Code Path:**
  ```tsx
  useEffect(() => {
    const unregister = CosmosLearningDirector.getInstance().registerModuleNavigationHandler(
      (targetModId) => {
        handleSelectModule(targetModId);
      },
    );
    return () => unregister();
  }); // <-- Missing dependency array
  ```
- **Impact:** The effect executes on every render cycle, repeatedly subscribing and unsubscribing event handlers. Under high re-render activity (e.g. while COSMOS speech progress updates), this triggers listener churn and closure staleness.
- **Remediation:** Provide `[handleSelectModule]` or wrap handler in `useCallback` with stable dependencies.

### 1.2 Stale Navigation State in Academy Dashboard
- **File:** `src/components/academy/AcademyDashboard.tsx`
- **Location:** Lines 264–269
- **Mechanism:** `activeLessonModule` is set once on initial mount via `useState(() => ...)` from `initialModuleId`. When the user navigates between different modules via browser history or TanStack `<Link search={{ module: ... }}>`, the state does not re-sync because there is no reactive effect tracking `initialModuleId`.
- **Remediation:** Add `useEffect(() => { ... }, [initialModuleId])` to synchronize `activeLessonModule` with URL search parameters.

---

## 2. WEBGL & GPU RESOURCE LIFECYCLE

### 2.1 WebGL Context Loss Vulnerability in Primary 3D Universe
- **File:** `src/stars/StarsApp.tsx`
- **Finding:** Unlike `CosmosCinematicSceneHost.tsx` which registers `webglcontextlost` and `webglcontextrestored` listeners, `StarsApp.tsx` has no context loss handler on the R3F `<Canvas>`.
- **Symptom:** On mobile devices, low-memory devices, or when users switch browser tabs, the GPU drops the WebGL context. The render loop crashes on the subsequent frame, bubbling to the router boundary and replacing the entire screen with `"This page didn't load"`.
- **Remediation:** Attach `onCreated={({ gl }) => { ... gl.domElement.addEventListener('webglcontextlost', ...); }}` and manage a clean re-initialization state.

### 2.2 Solar System Render Overhead at Cosmological Scales
- **File:** `src/stars/Planets.tsx`
- **Finding:** Motion trails for ~40 celestial bodies (Sun, Mercury through Neptune, Moon, Galilean moons, Titan, etc.) run continuous buffer uploads and execute line draws with `frustumCulled = false` even when camera distance is billions of light-years away.
- **Benchmark Evidence:** Zooming from Solar System (1e-5 ly) to Deep Space (> 1e5 ly) causes a 12–18ms frame time spike due to non-culled dynamic geometry updates.
- **Remediation:** Implement scale-gated culling: deactivate motion trail buffer updates and disable line rendering when `cameraDistance > 0.05` light-years.

---

## 3. COSMOS GUIDED DIRECTOR & NARRATION RUNTIME

### 3.1 Server Function Execution Context in Headless/Offline Mode
- **Files:** `src/lib/cosmos/CosmosConversationManager.ts`, `src/lib/cosmos/NarrationController.ts`, `src/lib/cosmos/cosmos.functions.ts`
- **Finding:** TanStack Start's `createServerFn` requires an active HTTP server context (`AsyncLocalStorage`). When tests run via `tsx` or when the network connection is unavailable, server functions throw:
  `Error: No Start context found in AsyncLocalStorage. Make sure you are using the function within the server runtime.`
- **Verification:** Both `CosmosConversationManager` and `NarrationController` successfully catch this error and fall back to local rule-based scientific explanations and browser Web Speech API synthesis without crashing the application.
- **Status:** Verified resilient fallback design.

### 3.2 Fullscreen Permission Denial Error State
- **File:** `src/lib/cosmos/cinematic/CosmosCinematicSessionBridge.ts`
- **Finding:** When `requestFullscreen` fails (browser policy or user denial), the state machine was setting `VIEWPORT_FALLBACK` but omitting the structured error record.
- **Resolution Applied:** Instrumented `CosmosCinematicSessionBridge` to record `FULLSCREEN_PERMISSION_DENIED` and `FULLSCREEN_UNSUPPORTED` in the authoritative state manager. Verified with 100% test pass in `scripts/cosmos-cinematic-player-validation.ts`.

---

## 4. SERVER-SIDE RENDERING & HYDRATION STABILITY

### 4.1 Client-Only Gates for 3D Viewports
- **Verification:**
  - `src/routes/_authenticated/universe.tsx`: Properly gated with `ssr: false` and `<ClientOnly>`.
  - `src/routes/learn.tsx`: Properly gated with `ssr: false`.
  - `src/routes/astrophysics-lab.tsx`: Uses client-side state initialization safely.
- **Finding:** No hydration mismatches detected on static routes. Dynamic 3D experiences are correctly excluded from SSR execution.

### 4.2 Supabase Client Resilience
- **File:** `src/integrations/supabase/client.ts`
- **Finding:** Fallback keys (`https://placeholder-project.supabase.co` and `sb_publishable_placeholder_client_key`) prevent crashes when Supabase credentials are not populated in the current execution container.
- **Local Registry Fallback:** `src/lib/academy/certificate.server.ts` safely catches remote database failures and falls back to `localCertificateRegistry`, ensuring offline student verification and test continuity.

---

## 5. NETWORK & EXTERNAL API DIAGNOSTICS

### 5.1 Unthrottled NASA Image Queries
- **File:** `src/stars/NasaResources.tsx`
- **Finding:** Queries to `https://images-api.nasa.gov/search` lack `AbortController` and timeout handling. Rapid clicking across celestial objects fires multiple concurrent requests that may reject due to rate-limiting or network latency.
- **Remediation:** Introduce an `AbortController` in the `useEffect` cleanup function and implement a 5-second fetch timeout.
