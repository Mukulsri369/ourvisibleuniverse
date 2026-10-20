# COSMOS Fullscreen Cinematic Learning Player — Implementation & Architecture Guide

- **Project**: Our Visible Universe Academy (`https://ourvisibleuniverse.in`)
- **System**: COSMOS Cinematic Learning System (Prompt 03 of 18)
- **Status**: Production-Ready Implementation Verified

---

## 1. Architecture Overview

The **COSMOS Fullscreen Cinematic Learning Player** transforms all 24 Cosmic Journey modules into an immersive fullscreen or full-viewport interactive astronomy documentary synchronized with the single authoritative `CosmosLearningDirector` and `NarrationController`.

### Core Services (`src/lib/cosmos/cinematic/`)

1. **`CosmosCinematicPlayerState.ts`**
   - Implements the deterministic 13-state lifecycle machine (`CLOSED`, `INITIALIZING`, `LOADING_SCENE`, `READY`, `ENTERING_FULLSCREEN`, `PLAYING`, `PAUSED`, `WAITING_FOR_STUDENT`, `ANSWERING_QUESTION`, `TRANSITIONING_SCENE`, `EXITING_FULLSCREEN`, `FALLBACK_MODE`, `ERROR`).
   - Enforces sequence-token locks (`beginModeSwitchOperation` / `isCurrentModeSwitchOperation`) to prevent race conditions during rapid Enter/Exit transitions.
2. **`CosmosCinematicSessionBridge.ts`**
   - Single authoritative connection to `CosmosLearningDirector.getInstance()`, `NarrationController`, `CosmosActivityGuide`, `CosmosQuizGuide`, and `Cosmos3DAdapter`.
   - Never creates a second Learning Director, a second NarrationController, or a parallel grading engine.
3. **`CosmosAnimationCueRegistry.ts` & `CosmosAnimationCueController.ts`**
   - Dynamically maps all **960 canonical `NarrationSegment`s** across all **24 modules** and **172 sublessons** to deterministic animation cues.
   - Implements all 9 cue lifecycle events (`START`, `PAUSE`, `RESUME`, `SEEK`, `REPLAY`, `COMPLETE`, `INTERRUPT`, `CANCEL`, `RESTORE`).
   - Distinguishes **Narration Playback Time** from **Scientific Simulation Time** via 6 explicit policies (`FOLLOW_NARRATION`, `SIMULATION_CONTINUOUS`, `PAUSE_ON_NARRATION_PAUSE`, `WAIT_FOR_STUDENT`, `MANUAL_INTERACTION`, `FIXED_DEMONSTRATION`).
4. **`CosmosCinematicSceneRegistry.ts`**
   - Maps all 24 modules to their 3D scene descriptors, camera presets, epistemic representation badges (`OBSERVATION_BASED`, `PHYSICS_BASED_SIMULATION`, `SCALE_ADJUSTED_EDUCATIONAL_MODEL`, `ARTISTIC_SCIENTIFIC_RECONSTRUCTION`), and grounded scientific annotations.
5. **`CosmosCinematicQualityManager.ts`**
   - Manages `HIGH_CINEMATIC` (DPR `[1, 2]`, 100% particles), `BALANCED` (DPR `[1, 1.5]`, 65% particles), and `LOW_POWER` (DPR `[1, 1]`, 30% particles) with 3-window low-FPS hysteresis and `localStorage` persistence.

### UI & 3D Components (`src/components/academy/cinematic/`)

- **`CosmosCinematicPlayer.tsx`** & **`EnterCinematicModeButton`**: Reusable player modal and launcher button integrated into `AcademyDashboard.tsx`, `CosmosCompanion.tsx`, and `CosmosGuidedController.tsx`.
- **`CosmosCinematicViewport.tsx`**: Manages native Browser Fullscreen (`requestFullscreen()`, `fullscreenchange`, `fullscreenerror`) and the `100dvw × 100dvh` safe-area CSS fallback container.
- **`CosmosCinematicSceneHost.tsx`**: Single React Three Fiber `<Canvas>` host with `CinematicCameraRig` (exponential damping, aspect sync, manual `OrbitControls` override), WebGL context-loss recovery, world-anchored `<Html>` scientific annotations, and representative 3D scenes for **Module 01**, **Module 08**, **Module 14**, and all 24 modules.
- **`CosmosCinematicOverlay.tsx`**: Translucent top bar, object focus selector, physical metrics inspector, `CosmosActivityGuide` gate drawer, `CosmosQuizGuide` overlay, and context-preserving Q&A response card.
- **`CosmosCinematicCaptions.tsx`**: Synchronized `NarrationSegment` captions with highlighted `keyTerminology` and full-module interactive transcript drawer.
- **`CosmosCinematicControls.tsx`**: Transport (`Prev`, `Play/Pause/Resume`, `Repeat`, `Next`), `Ask COSMOS`, `Mic`, `Captions`, `Labels`, `Free Orbit / Return to Guided Camera`, `Speed`, `Quality`, and `Exit`.
- **`CosmosCinematicFallback.tsx`**: Accessible 2D scientific schematic and telemetry table for WebGL-unsupported environments or context loss.
