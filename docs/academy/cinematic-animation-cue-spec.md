# COSMOS Narration-to-Animation Cue Specification & Prompt 03 Player Contract

- **Project**: Our Visible Universe Academy (`https://ourvisibleuniverse.in`)
- **System**: COSMOS Cinematic Learning System (Prompt 02 of 18 — Sections 7, 11, 13 & 21)
- **Scope**: Deterministic Narration-to-Animation Synchronization, State Machine Transitions, Interactive Activity Gates & Prompt 03 Fullscreen Player Specification

---

## 1. Authoritative Narration-Driven Choreography Architecture

In the COSMOS Cinematic Learning System, **COSMOS is the authoritative real-time director**. Animations never run on disconnected wall-clock timers that drift out of sync when TTS synthesis loads, when speech speed changes ($0.75\times\text{–}1.5\times$), or when a student pauses to ask a question.

### 1.1 Normalized Segment Progress Coordinate ($u_{\text{seg}}$ and $u_{\text{beat}}$)
Every `NarrationSegment` in `LessonContentProvider.ts` has a deterministic `segmentId` (e.g., `08-08-06-detail-1`). During playback:
1. `NarrationController` computes the normalized segment progress:
   $$u_{\text{seg}} = \text{clamp}\!\left(\frac{t_{\text{elapsed}}}{t_{\text{duration}}}, 0.0, 1.0\right)$$
   - When playing Gemini TTS audio (`HTMLAudioElement`), $t_{\text{elapsed}} = \text{audio.currentTime}$ and $t_{\text{duration}} = \text{audio.duration}$.
   - When using Web Speech API fallback or Text-Only reading mode, $t_{\text{elapsed}}$ tracks boundary char offsets / reading timer against `segment.estimatedDurationSeconds / speechSpeed`.
2. Each `CinematicAnimationBeat` in a chapter's storyboard binds to an ordered array of `narrationSegmentIds: string[]`. If a beat spans $N$ segments and segment $k \in [0, N-1]$ is active, the continuous beat progress is:
   $$u_{\text{beat}} = \frac{k + u_{\text{seg}}}{N} \in [0.0, 1.0]$$
3. Inside the 3D scene's `useFrame` loop, keyframe transforms, cross-section clipping angles, vector arrow lengths, and shader uniforms evaluate purely as deterministic functions of $(beatId, u_{\text{beat}})$ plus a gentle ambient physics clock $t_{\text{ambient}}$ for non-narrative background motion (e.g., solar granulation turbulence).

---

## 2. Deterministic Transport & Interruption Behaviors (Section 11)

| Student / Director Event | Narration State | 3D Animation & Camera Response | State Persistence (`NarrationCursorManager`) |
| :--- | :--- | :--- | :--- |
| **1. Start Lesson / Enter Fullscreen** | `LOADING` $\to$ `PLAYING` | Mounts chapter's `sceneId` from `CosmosSceneRegistry`, applies Beat 1 `cameraAction` and `sceneState`, and begins interpolating $u_{\text{beat}}$ as audio starts. | Saves `{ moduleId, sublessonId, segmentId, beatId, uBeat: 0 }`. |
| **2. Pause (`Space` or Pause Button)** | `PAUSED` | **Narrative animation freezes immediately** ($du_{\text{beat}}/dt = 0$). Camera spline travel stops in place; student may freely orbit/inspect the paused 3D structure. Subtle ambient shaders (e.g., star glow) remain alive at $0.15\times$ rate unless `freeze_all_simulation_time` is set. | Saves exact `playbackPositionSeconds` and `uBeat`. |
| **3. Resume** | `PLAYING` | If student orbited camera during pause, smoothly slerps camera back to the active beat's choreographed trajectory over $0.8\text{ s}$ and resumes $u_{\text{beat}}$ progression from the exact paused frame. | Restores active `PLAYING` status. |
| **4. Replay Current Beat / Sublesson** | `PLAYING` | Resets `NarrationController` to the first `segmentId` of the current beat (or sublesson), resets scene parameters to `beat.sceneState`, and smoothly transitions camera to `beat.cameraAction.initialPosition`. | Preserves previously completed segment IDs while re-running active cursor. |
| **5. Seek Backward / Seek Forward** | `PLAYING` / `PAUSED` | Looks up the target `segmentId` in `storyboard.narrationCueMap`, immediately resolves the corresponding `beatId` and `simulationParameters`, updates the 3D scene state deterministically, and slews the camera to the target beat's framing. | Note: Forward skipping is gated if an unresolved required `ACTIVITY` or `QUIZ` step blocks progression. |
| **6. Voice / Text Question Interruption (`Ask COSMOS`)** | `INTERRUPTED` $\to$ `ANSWERING` | Immediately pauses lesson narration and freezes $u_{\text{beat}}$. Camera transitions to a gentle inspection orbit around the current focal object. If `CosmosAnswer.visualizationAction` specifies a demonstration (e.g., zooming into a specific planet or layer to answer the student's question), pushes current camera state onto `Cosmos3DAdapter.previousViewStack` and executes the visual demonstration. | Records `interruptedSegment`, `playbackPositionSeconds`, `beatId`, and `previousViewStack`. |
| **7. Resume After Question Answered** | `RESUMING` $\to$ `PLAYING` | Pops `previousViewStack` on `Cosmos3DAdapter`, restores exact pre-interruption `sceneState` and camera framing over $1.0\text{ s}$, speaks a brief transition confirmation, and resumes narration from the interrupted segment. | Clears temporary interruption context and resumes confirmed cursor tracking. |
| **8. Interactive Activity Gate Reached** | `WAITING_FOR_ACTIVITY` | Transitions `playbackPhase` to `INTERACTIVE_ACTIVITY_GATE`. Narration explains the objective (`EXPLAINING_ACTIVITY`) and then **stops advancing**. The right-hand/bottom Interactive Lab Dock opens inside fullscreen, highlighting the target control (`CosmosAttentionController`). **COSMOS never auto-completes student actions.** | Advances only after `CosmosActivityAdapter` receives verified student interaction and server validation (`COMPLETED`). |
| **9. Chapter / Sublesson Transition** | `TRANSITIONING_CHAPTER` | Executes the outgoing beat's `transitionType` (`scale_aware_cosmic_zoom` or `object_to_object_slew`), preloads the next sublesson's storyboard assets, and updates the top HUD chapter title without exiting fullscreen mode. | Marks completed sublesson segments in `NarrationCursorManager`. |

---

## 3. Interactive Scene Modes & Academic Integrity Guardrails (Section 13)

Every storyboard beat declares one of five interactivity modes (`SceneInteractivityMode`):
1. **`PASSIVE_EXPLANATION`**: Camera and scene parameters are choreographed by COSMOS; student can use Free-Look orbit/zoom at any time.
2. **`GUIDED_DEMONSTRATION`**: COSMOS visibly animates a parameter sweep (e.g., sweeping eccentricity $e: 0 \to 0.7$ in Chapter 08.3) while explaining the causal physics, then unlocks the slider for optional student experimentation.
3. **`INTERACTIVE_EXPLORATION`**: Optional sandbox exploration step (`VISUALIZATION` step in `CosmosStepSequenceGenerator`) where the student is encouraged to test parameters for at least `minElapsedSeconds: 3` or acknowledge before continuing.
4. **`REQUIRED_LEARNING_ACTIVITY`**: Mandatory laboratory gate (`ACTIVITY` step managed by `CosmosActivityGuide` and `CosmosActivityAdapter`). Requires genuine student parameter manipulation and server-side validation (`submitActivityOutcome`) before unlocking the next step.
5. **`ASSESSMENT_SUPPORT`**: Linked to `CosmosQuizGuide`.
   - In **Practice Mode**, the 3D scene displays the relevant astronomical system so the student can visually reason through the question, and COSMOS can highlight relevant structures on hint request.
   - In **Official Assessment Mode (`mode === "official"`)**, COSMOS reads questions/options aloud and accepts voice/click selections, but **strictly disables answer-revealing visual hints, parameter spoilers, or AI coaching** (`isExamRestricted = true`).

---

## 4. Preparation for Prompt 03: Fullscreen Cinematic Player Specification (Section 21)

Prompt 03 will implement `CosmosCinematicPlayer.tsx` and its supporting runtime services. Below is the complete engineering specification for Prompt 03:

### 4.1 Component & Service Integration Map
`CosmosCinematicPlayer` must integrate directly with existing repository singletons **without duplicating state**:
- **`CosmosLearningDirector.getInstance()`** (`src/lib/cosmos/CosmosLearningDirector.ts`): Source of truth for `GuidedLearningState`, active `LearningStep`, `activeModuleId`, `activeSublessonIndex`, and transport actions (`play()`, `pause()`, `nextStep()`, `previousStep()`).
- **`NarrationController`** (`src/lib/cosmos/NarrationController.ts`): Extended to emit continuous `onProgressTick(segmentId, elapsed, duration, normalizedProgress)` at animation-frame or `timeupdate` intervals, and shared as a single instance between `CosmosLearningDirector`, `CosmosCompanion`, and `CosmosCinematicPlayer`.
- **`VisualizationActionController`** (`src/lib/cosmos/VisualizationActionController.ts`) & **`Cosmos3DAdapter`** (`src/lib/cosmos/Cosmos3DAdapter.ts`): Dispatches `CosmosVisualizationReference` and `CinematicAnimationBeat` cues to the mounted 3D scene inside the player.
- **`CosmosActivityGuide`** & **`CosmosActivityAdapter`**: Renders active `instructionSteps` and binds real control selectors inside the fullscreen activity dock during `WAITING_FOR_ACTIVITY`.
- **`CosmosQuizGuide`**: Renders practice/official quiz cards inside the fullscreen overlay during `NAVIGATING_TO_QUIZ` .. `REVIEWING_FEEDBACK`.
- **Entry Point Triggers**:
  - `CosmosGuidedController.tsx`: Add **"Maximize Cinematic Mode"** button to the floating guided learning bar.
  - `LessonLayout.tsx` & `Module02Layout.tsx` .. `Module24Layout.tsx`: Add **"Launch Fullscreen Cinematic Lesson"** primary CTA in the module hero and sublesson headers.

### 4.2 Error, WebGL Context Loss & Low-Bandwidth Fallback Behavior
1. **WebGL Context Loss (`webglcontextlost`)**:
   - Listener attached to `gl.domElement` intercepts `webglcontextlost`, calls `event.preventDefault()`, transitions player state to `WEBGL_RECOVERY_FALLBACK`, displays a high-resolution annotated 2D scientific diagram + live captions while attempting `WEBGL_lose_context.restoreContext()`, and seamlessly remounts the 3D scene at the current `beatId` once restored.
2. **Reduced-Motion Mode (`prefers-reduced-motion: reduce` or user toggle)**:
   - Disables continuous camera spline flights and rapid particle motion; jumps cleanly between static diagnostic camera presets (`dampingLambda = 1000` instant snap with $300\text{ ms}$ opacity cross-fade) while keeping all 3D scientific diagrams, cutaways, and interactive sliders fully functional.
3. **Audio Synthesis / Network Fallback**:
   - If Gemini TTS (`cosmos.functions.ts`) experiences network latency or quota limits, `NarrationController` automatically falls back to browser Web Speech API (`speechSynthesis`) or synchronized Text-Caption timer mode so the cinematic animation timeline **never stalls**.
