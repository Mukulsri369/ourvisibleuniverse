/**
 * COSMOS Cinematic Session Bridge (Single Authoritative Connection)
 * Project: Our Visible Universe Academy
 * Scope: Prompt 03 — Sections 5, 6, 7, 13, 16, 17, 18, 23
 *
 * Strict Architectural Invariants:
 * 1. CosmosLearningDirector remains the single authority for the current teaching step.
 * 2. NarrationController remains the single authority for narration playback.
 * 3. Never creates a second Learning Director, a second NarrationController, or a parallel grading system.
 * 4. Preserves exact student progress and narration position when switching between
 *    normal lesson mode and Fullscreen Cinematic Mode.
 */

import type { LearningLevel } from "@/lib/academy/types";
import { CosmosLearningDirector } from "../CosmosLearningDirector";
import { LearningPreferenceManager } from "../LearningPreferenceManager";
import type { CosmosAnswer, NarrationState } from "../cosmos-types";
import type { DirectorStateSnapshot } from "../learning-director-types";
import { Cosmos3DAdapter } from "../Cosmos3DAdapter";
import {
  CosmosAnimationCueController,
  type AnimationCueExecutionState,
} from "./CosmosAnimationCueController";
import { CosmosAnimationCueRegistry } from "./CosmosAnimationCueRegistry";
import {
  CosmosCinematicPlayerStateManager,
  type CinematicCameraCommand,
  type CinematicInteractionMode,
  type CinematicPlayerStateSnapshot,
} from "./CosmosCinematicPlayerState";
import { CosmosCinematicQualityManager } from "./CosmosCinematicQualityManager";
import {
  CosmosCinematicSceneRegistry,
  type CinematicSceneDescriptor,
} from "./CosmosCinematicSceneRegistry";

export class CosmosCinematicSessionBridge {
  private static instance: CosmosCinematicSessionBridge | null = null;

  private director: CosmosLearningDirector;
  private stateManager: CosmosCinematicPlayerStateManager;
  private cueController: CosmosAnimationCueController;
  private qualityManager: CosmosCinematicQualityManager;

  private unsubscribeDirector: (() => void) | null = null;
  private unsubscribeNarration: (() => void) | null = null;
  private unsubscribeCue: (() => void) | null = null;
  private unsubscribeQuality: (() => void) | null = null;

  private lastSyncedSegmentId: string | null = null;
  private lastSyncedModuleId: string | null = null;
  private cameraCommandListeners = new Set<(cmd: CinematicCameraCommand) => void>();

  private constructor() {
    this.director = CosmosLearningDirector.getInstance();
    this.qualityManager = CosmosCinematicQualityManager.getInstance();
    this.stateManager = new CosmosCinematicPlayerStateManager(this.qualityManager.getTier());
    this.cueController = CosmosAnimationCueController.getInstance();

    this.connectToAuthoritativeDirector();
  }

  public static getInstance(): CosmosCinematicSessionBridge {
    if (!this.instance) {
      this.instance = new CosmosCinematicSessionBridge();
    }
    return this.instance;
  }

  /**
   * Connects once to the singleton CosmosLearningDirector and its NarrationController.
   */
  private connectToAuthoritativeDirector(): void {
    this.unsubscribeDirector = this.director.subscribe((dirSnap: DirectorStateSnapshot) => {
      this.handleDirectorUpdate(dirSnap);
    });

    const narController = this.director.getNarrationController();
    this.unsubscribeNarration = narController.subscribe((narState: NarrationState) => {
      this.handleNarrationUpdate(narState);
    });

    this.unsubscribeCue = this.cueController.subscribe((cueState: AnimationCueExecutionState) => {
      if (cueState.lastCameraCommand) {
        for (const listener of this.cameraCommandListeners) {
          try {
            listener(cueState.lastCameraCommand);
          } catch (err) {
            console.warn("[CosmosCinematicSessionBridge] camera listener error:", err);
          }
        }
      }
    });

    this.unsubscribeQuality = this.qualityManager.subscribe((profile) => {
      this.stateManager.updateState({
        qualityPreset: profile.tier,
      });
    });
  }

  /**
   * Synchronizes cinematic player state whenever CosmosLearningDirector emits a change.
   */
  private handleDirectorUpdate(dirSnap: DirectorStateSnapshot): void {
    const currentSnap = this.stateManager.getSnapshot();
    const isPlayerOpen = currentSnap.playerState !== "CLOSED";

    const moduleId = String(dirSnap.moduleId || "01").padStart(2, "0");
    const sceneDesc = CosmosCinematicSceneRegistry.getSceneForModule(
      moduleId,
      dirSnap.moduleTitle,
    );

    const step = dirSnap.currentStep;
    const sublessonId = step?.lessonId || currentSnap.currentSublessonId || "lesson-1";
    const chapterTitle = step?.title || dirSnap.moduleTitle;

    // Determine interaction gating state from authoritative Director state
    let interactionState: CinematicInteractionMode = currentSnap.isManualCameraMode
      ? "MANUAL_CAMERA_ORBIT"
      : "GUIDED_OBSERVATION";

    if (
      step?.stepType === "ACTIVITY" ||
      dirSnap.state === "NAVIGATING_TO_ACTIVITY" ||
      dirSnap.state === "EXPLAINING_ACTIVITY" ||
      dirSnap.state === "WAITING_FOR_ACTIVITY" ||
      dirSnap.state === "REVIEWING_ACTIVITY"
    ) {
      interactionState = "ACTIVITY_REQUIRED";
    } else if (
      step?.stepType === "KNOWLEDGE_CHECK" ||
      step?.stepType === "PRACTICE_QUESTION" ||
      dirSnap.state === "NAVIGATING_TO_QUIZ" ||
      dirSnap.state === "READING_QUESTION" ||
      dirSnap.state === "WAITING_FOR_ANSWER" ||
      dirSnap.state === "CONFIRMING_ANSWER" ||
      dirSnap.state === "SUBMITTING_ANSWER" ||
      dirSnap.state === "REVIEWING_FEEDBACK"
    ) {
      interactionState =
        dirSnap.activeQuizState?.mode === "official"
          ? "OFFICIAL_EXAM_ACTIVE"
          : "QUIZ_REQUIRED";
    } else if (dirSnap.state === "ANSWERING_STUDENT_QUESTION" || dirSnap.isMicrophoneActive) {
      interactionState = "VOICE_INTERRUPTION";
    }

    // Map Director state to Cinematic Player lifecycle state if open
    let nextLifecycleState = currentSnap.playerState;
    if (isPlayerOpen && currentSnap.playerState !== "ERROR") {
      if (dirSnap.state === "ANSWERING_STUDENT_QUESTION") {
        nextLifecycleState = "ANSWERING_QUESTION";
      } else if (
        dirSnap.state === "WAITING_FOR_STUDENT" ||
        dirSnap.state === "WAITING_FOR_ACTIVITY" ||
        dirSnap.state === "WAITING_FOR_ANSWER" ||
        dirSnap.state === "CONFIRMING_ANSWER"
      ) {
        nextLifecycleState = "WAITING_FOR_STUDENT";
      } else if (dirSnap.isNarrationPlaying) {
        nextLifecycleState = "PLAYING";
      } else if (dirSnap.state === "PAUSED") {
        nextLifecycleState = "PAUSED";
      } else if (currentSnap.fullscreenState === "VIEWPORT_FALLBACK") {
        nextLifecycleState = dirSnap.isNarrationPlaying ? "PLAYING" : "FALLBACK_MODE";
      }
    }

    // If module changed while open, trigger scene transition & initial cue
    if (moduleId !== this.lastSyncedModuleId) {
      this.lastSyncedModuleId = moduleId;
      if (isPlayerOpen) {
        this.stateManager.transitionLifecycleState("TRANSITIONING_SCENE");
      }
      this.cueController.dispatchCueEvent("START", {
        moduleId,
        narrationSegmentId: dirSnap.activeSegmentId || undefined,
        sublessonId,
        level: dirSnap.learningLevel,
        language: dirSnap.language,
      });
    }

    const activeCue = this.cueController.getState().activeCue;

    this.stateManager.updateState({
      playerState: nextLifecycleState,
      currentModuleId: moduleId,
      currentModuleTitle: dirSnap.moduleTitle,
      currentLessonId: sublessonId,
      currentSublessonId: sublessonId,
      currentChapterTitle: chapterTitle,
      currentLearningStepId: step?.stepId || "step-0",
      currentStepIndex: dirSnap.currentStepIndex,
      totalSteps: Math.max(1, dirSnap.totalSteps),
      currentLearningLevel: dirSnap.learningLevel,
      language: dirSnap.language,
      currentSceneId: sceneDesc.sceneId,
      scientificRepresentation: sceneDesc.scientificRepresentation,
      scaleAdjustmentNotice: sceneDesc.scaleAdjustmentNotice,
      isMicrophoneActive: dirSnap.isMicrophoneActive,
      interactionState,
      currentAnimationCueId: activeCue?.cueId || currentSnap.currentAnimationCueId,
      currentCameraPresetId: activeCue?.cameraPresetId || sceneDesc.defaultCameraPresetId,
      currentTimePolicy: activeCue?.timePolicy || sceneDesc.defaultTimePolicy,
      activeHighlightedObjects: activeCue?.highlightedObjects || [],
    });
  }

  /**
   * Synchronizes captions, active narration segment, and animation cues whenever NarrationController updates.
   */
  private handleNarrationUpdate(narState: NarrationState): void {
    const currentSnap = this.stateManager.getSnapshot();
    const seg = narState.currentSegment;
    const moduleId = currentSnap.currentModuleId || "01";

    if (seg && seg.segmentId !== this.lastSyncedSegmentId) {
      this.lastSyncedSegmentId = seg.segmentId;
      this.cueController.dispatchCueEvent("START", {
        moduleId,
        narrationSegmentId: seg.segmentId,
        sublessonId: seg.lessonId,
        level: currentSnap.currentLearningLevel,
        language: currentSnap.language,
      });
    }

    if (narState.status === "paused" && !this.cueController.getState().narrationPaused) {
      this.cueController.dispatchCueEvent("PAUSE", { moduleId });
    } else if (narState.status === "playing" && this.cueController.getState().narrationPaused) {
      this.cueController.dispatchCueEvent("RESUME", { moduleId });
    } else if (narState.status === "completed") {
      this.cueController.dispatchCueEvent("COMPLETE", { moduleId });
    }

    const cueExec = this.cueController.getState();

    this.stateManager.updateState({
      currentNarrationSegmentId: seg?.segmentId || currentSnap.currentNarrationSegmentId,
      currentNarrationText: seg?.displayText || currentSnap.currentNarrationText,
      currentKeyTerminology: seg?.keyTerminology || [],
      currentPlaybackState: narState.status,
      isSimulationRunning: cueExec.isSimulationRunning,
      simulationTimeScale: cueExec.simulationTimeScale,
      currentAnimationCueId: cueExec.activeCue?.cueId || currentSnap.currentAnimationCueId,
      currentCameraPresetId:
        cueExec.activeCue?.cameraPresetId || currentSnap.currentCameraPresetId,
      currentTimePolicy: cueExec.activeCue?.timePolicy || currentSnap.currentTimePolicy,
      activeHighlightedObjects:
        cueExec.activeCue?.highlightedObjects || currentSnap.activeHighlightedObjects,
    });
  }

  /**
   * Opens the Fullscreen Cinematic Player for the specified module, preserving
   * the current narration segment and guided learning step if already in that module,
   * or initializing the guided session cleanly if not yet active.
   */
  public async enterCinematicMode(options: {
    moduleId: string;
    moduleTitle?: string;
    learningLevel?: LearningLevel;
    sublessonId?: string;
    containerElement?: HTMLElement | null;
    forceViewportFallback?: boolean;
  }): Promise<{
    opened: boolean;
    fullscreenMode: "NATIVE_FULLSCREEN" | "VIEWPORT_FALLBACK";
  }> {
    const opToken = this.stateManager.beginModeSwitchOperation();
    const normalizedModuleId = String(options.moduleId || "01").padStart(2, "0");
    const level = options.learningLevel || this.director.getSnapshot().learningLevel || "explorer";

    this.stateManager.transitionLifecycleState("INITIALIZING");
    this.stateManager.clearError();

    const sceneDesc = CosmosCinematicSceneRegistry.getSceneForModule(
      normalizedModuleId,
      options.moduleTitle,
    );

    this.stateManager.transitionLifecycleState("LOADING_SCENE");
    this.stateManager.updateState({
      currentModuleId: normalizedModuleId,
      currentModuleTitle: options.moduleTitle || sceneDesc.title,
      currentSceneId: sceneDesc.sceneId,
      scientificRepresentation: sceneDesc.scientificRepresentation,
      scaleAdjustmentNotice: sceneDesc.scaleAdjustmentNotice,
      currentLearningLevel: level,
      sceneLoadingProgress: 100,
      isHudVisible: true,
    });

    // Ensure CosmosLearningDirector is synchronized to this module without resetting if already active on it
    const dirSnap = this.director.getSnapshot();
    const isSameModuleActive =
      dirSnap.isGuidedModeActive &&
      String(dirSnap.moduleId).padStart(2, "0") === normalizedModuleId;

    if (!isSameModuleActive) {
      // Check if NarrationController already has a position in this module
      const currentSeg = this.director.getNarrationController().getCurrentSegment();
      const existingSegments = LessonContentProviderSafeSegments(
        normalizedModuleId,
        level,
        dirSnap.language,
      );

      // Start guided session at the matching step if sublessonId was provided
      let preferredStepIdx = 0;
      if (options.sublessonId) {
        const steps = this.director.getSteps();
        const foundStepIdx = steps.findIndex((s) => s.lessonId === options.sublessonId);
        if (foundStepIdx >= 0) preferredStepIdx = foundStepIdx;
      }

      await this.director.startGuidedSession(normalizedModuleId, level, preferredStepIdx);

      // If currentSeg belonged to this module, restore that exact segment
      if (currentSeg && currentSeg.segmentId.startsWith(`${normalizedModuleId}-`)) {
        const idx = existingSegments.findIndex((s) => s.segmentId === currentSeg.segmentId);
        if (idx >= 0) {
          this.director.getNarrationController().seekSegment(idx);
        }
      }
    }

    if (!this.stateManager.isCurrentModeSwitchOperation(opToken)) {
      return { opened: false, fullscreenMode: "VIEWPORT_FALLBACK" };
    }

    this.stateManager.transitionLifecycleState("READY");

    // Attempt Native Browser Fullscreen if supported and not forced to fallback
    this.stateManager.transitionLifecycleState("ENTERING_FULLSCREEN");
    this.stateManager.updateState({ fullscreenState: "REQUESTING_NATIVE" });

    let fullscreenMode: "NATIVE_FULLSCREEN" | "VIEWPORT_FALLBACK" = "VIEWPORT_FALLBACK";

    if (!options.forceViewportFallback && options.containerElement) {
      const nativeSuccess = await this.requestBrowserFullscreen(options.containerElement);
      if (nativeSuccess) {
        fullscreenMode = "NATIVE_FULLSCREEN";
      }
    } else if (!options.forceViewportFallback && typeof document !== "undefined") {
      // Check if browser supports fullscreen at all
      const docEl = document.documentElement as any;
      const canRequest = Boolean(
        docEl?.requestFullscreen || docEl?.webkitRequestFullscreen || docEl?.msRequestFullscreen,
      );
      if (!canRequest) {
        this.stateManager.recordError(
          "FULLSCREEN_UNSUPPORTED",
          "Native browser fullscreen is unavailable on this device; using full-viewport immersive mode.",
          { recoverable: true, fallbackAvailable: true, enterErrorState: false },
        );
      }
    }

    // Activate initial animation cue for current segment
    const updatedDirSnap = this.director.getSnapshot();
    const activeSeg =
      this.director.getNarrationController().getCurrentSegment() ||
      LessonContentProviderSafeSegments(normalizedModuleId, level, updatedDirSnap.language)[0];

    if (activeSeg) {
      this.cueController.dispatchCueEvent("START", {
        moduleId: normalizedModuleId,
        narrationSegmentId: activeSeg.segmentId,
        sublessonId: activeSeg.lessonId,
        level,
        language: updatedDirSnap.language,
      });
    }

    const finalLifecycle =
      fullscreenMode === "NATIVE_FULLSCREEN"
        ? updatedDirSnap.isNarrationPlaying
          ? "PLAYING"
          : "PAUSED"
        : updatedDirSnap.isNarrationPlaying
          ? "PLAYING"
          : "FALLBACK_MODE";

    this.stateManager.updateState({
      fullscreenState: fullscreenMode,
      playerState: finalLifecycle,
      currentNarrationSegmentId: activeSeg?.segmentId || null,
      currentNarrationText: activeSeg?.displayText || updatedDirSnap.activeHighlightedText || "",
      currentKeyTerminology: activeSeg?.keyTerminology || [],
    });

    return { opened: true, fullscreenMode };
  }

  /**
   * Requests standard or vendor-prefixed Browser Fullscreen on the player container.
   * Handles rejection and permission errors gracefully without trapping the user.
   */
  public async requestBrowserFullscreen(element: HTMLElement): Promise<boolean> {
    if (!element) return false;

    const anyEl = element as any;
    const requestFn =
      anyEl.requestFullscreen || anyEl.webkitRequestFullscreen || anyEl.msRequestFullscreen;

    if (typeof requestFn !== "function") {
      this.stateManager.recordError(
        "FULLSCREEN_UNSUPPORTED",
        "Native Fullscreen API is not supported by this browser; switched to Full-Viewport Cinematic Fallback.",
        { recoverable: true, fallbackAvailable: true, enterErrorState: false },
      );
      this.stateManager.updateState({ fullscreenState: "VIEWPORT_FALLBACK" });
      return false;
    }

    try {
      const result = requestFn.call(element);
      if (result && typeof result.then === "function") {
        await result;
      }
      this.stateManager.updateState({ fullscreenState: "NATIVE_FULLSCREEN" });
      return true;
    } catch (err: any) {
      this.stateManager.recordError(
        "FULLSCREEN_PERMISSION_DENIED",
        err?.message ||
          "Browser fullscreen request was declined; using accessible Full-Viewport Cinematic Mode.",
        { recoverable: true, fallbackAvailable: true, enterErrorState: false },
      );
      this.stateManager.updateState({ fullscreenState: "VIEWPORT_FALLBACK" });
      return false;
    }
  }

  /**
   * Synchronizes state when the user presses Escape or browser fires `fullscreenchange`.
   * Does NOT lose learning progress or abruptly close the lesson.
   */
  public handleBrowserFullscreenChange(hasFullscreenElementOverride?: boolean): void {
    const snap = this.stateManager.getSnapshot();
    if (snap.playerState === "CLOSED" || snap.playerState === "EXITING_FULLSCREEN") {
      return;
    }

    const fsElement =
      typeof hasFullscreenElementOverride === "boolean"
        ? hasFullscreenElementOverride
        : typeof document !== "undefined"
          ? Boolean(
              document.fullscreenElement ||
                (document as any).webkitFullscreenElement ||
                (document as any).msFullscreenElement,
            )
          : false;

    if (fsElement) {
      this.stateManager.updateState({ fullscreenState: "NATIVE_FULLSCREEN" });
    } else if (snap.fullscreenState === "NATIVE_FULLSCREEN") {
      // User exited native fullscreen via Escape key -> transition smoothly to Full-Viewport Fallback or normal view
      this.stateManager.updateState({
        fullscreenState: "VIEWPORT_FALLBACK",
        playerState: snap.currentPlaybackState === "playing" ? "PLAYING" : "FALLBACK_MODE",
      });
    }
  }

  /**
   * Exits Cinematic Mode cleanly, exiting native fullscreen if active and restoring
   * the normal lesson view at the exact current learning step and segment.
   */
  public async exitCinematicMode(): Promise<void> {
    const opToken = this.stateManager.beginModeSwitchOperation();
    this.stateManager.transitionLifecycleState("EXITING_FULLSCREEN");
    this.stateManager.updateState({ fullscreenState: "EXITING" });

    if (typeof document !== "undefined") {
      const fsElement =
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).msFullscreenElement;

      if (fsElement) {
        const exitFn =
          document.exitFullscreen ||
          (document as any).webkitExitFullscreen ||
          (document as any).msExitFullscreen;
        if (typeof exitFn === "function") {
          try {
            const res = exitFn.call(document);
            if (res && typeof res.then === "function") {
              await res;
            }
          } catch {
            // Ignore exitFullscreen error if already exited
          }
        }
      }
    }

    if (!this.stateManager.isCurrentModeSwitchOperation(opToken)) {
      return;
    }

    this.stateManager.updateState({
      fullscreenState: "INACTIVE",
      playerState: "CLOSED",
      isManualCameraMode: false,
    });
  }

  // ============================================================================
  // AUTHORITATIVE PLAYER CONTROLS (Prompt 03 Section 13)
  // ============================================================================

  public async playOrResume(): Promise<void> {
    await this.director.resumeSession();
    this.cueController.dispatchCueEvent("RESUME", {
      moduleId: this.stateManager.getSnapshot().currentModuleId,
    });
    this.stateManager.transitionLifecycleState("PLAYING");
  }

  public pause(): void {
    this.director.pauseSession();
    this.cueController.dispatchCueEvent("PAUSE", {
      moduleId: this.stateManager.getSnapshot().currentModuleId,
    });
    this.stateManager.transitionLifecycleState("PAUSED");
  }

  public async repeatCurrentExplanation(): Promise<void> {
    this.cueController.dispatchCueEvent("REPLAY", {
      moduleId: this.stateManager.getSnapshot().currentModuleId,
    });
    await this.director.repeatStep();
  }

  /**
   * Advances to the next eligible step.
   * Strictly enforces CosmosInputCoordinator guardrails: never skips unresolved required
   * activities, never skips official examination rules, never grants verified completion.
   */
  public async nextEligibleStep(): Promise<boolean> {
    const allowed = await this.director.nextStep();
    if (!allowed) {
      this.stateManager.transitionLifecycleState("WAITING_FOR_STUDENT");
    }
    return allowed;
  }

  /**
   * Moves backward to the previous step and restores the corresponding visual cue.
   */
  public async previousEligibleStep(): Promise<boolean> {
    const moved = await this.director.previousStep();
    if (moved) {
      const dirSnap = this.director.getSnapshot();
      this.cueController.dispatchCueEvent("SEEK", {
        moduleId: String(dirSnap.moduleId).padStart(2, "0"),
        narrationSegmentId: dirSnap.activeSegmentId || undefined,
        sublessonId: dirSnap.currentStep?.lessonId,
        level: dirSnap.learningLevel,
        language: dirSnap.language,
      });
    }
    return moved;
  }

  /**
   * Seeks directly to a specific narration segment within the active module.
   */
  public seekToNarrationSegment(segmentId: string): boolean {
    const narController = this.director.getNarrationController();
    const segments = narController.getSegments();
    const idx = segments.findIndex((s) => s.segmentId === segmentId);
    if (idx === -1) return false;

    narController.seekSegment(idx);
    const snap = this.stateManager.getSnapshot();
    const seg = segments[idx];

    this.cueController.dispatchCueEvent("SEEK", {
      moduleId: snap.currentModuleId,
      narrationSegmentId: seg.segmentId,
      sublessonId: seg.lessonId,
      level: snap.currentLearningLevel,
      language: snap.language,
    });

    this.stateManager.updateState({
      currentNarrationSegmentId: seg.segmentId,
      currentNarrationText: seg.displayText,
      currentKeyTerminology: seg.keyTerminology || [],
    });
    return true;
  }

  /**
   * Interrupts COSMOS with a student question while preserving the active 3D scene,
   * camera orientation, and narration return point (Prompt 03 Section 18).
   */
  public async askCosmosQuestionInCinematicMode(question: string): Promise<CosmosAnswer> {
    const snap = this.stateManager.getSnapshot();
    this.cueController.dispatchCueEvent("INTERRUPT", {
      moduleId: snap.currentModuleId,
    });
    this.stateManager.transitionLifecycleState("ANSWERING_QUESTION");

    const answer = await this.director.handleStudentQuestion(question);
    return answer;
  }

  /**
   * Resumes the original lesson and restores the interrupted animation cue after a Q&A exchange.
   */
  public async resumeAfterQuestionInCinematicMode(): Promise<void> {
    const snap = this.stateManager.getSnapshot();
    this.cueController.dispatchCueEvent("RESTORE", {
      moduleId: snap.currentModuleId,
    });
    await this.director.resumeAfterQuestion();
    this.stateManager.transitionLifecycleState("PLAYING");
  }

  // ============================================================================
  // CAMERA, CAPTIONS, LABELS & QUALITY CONTROLS
  // ============================================================================

  public toggleCaptions(): boolean {
    const next = !this.stateManager.getSnapshot().captionsEnabled;
    this.stateManager.updateState({ captionsEnabled: next });
    return next;
  }

  public toggleScientificLabels(): boolean {
    const next = !this.stateManager.getSnapshot().scientificLabelsEnabled;
    this.stateManager.updateState({ scientificLabelsEnabled: next });
    return next;
  }

  public setManualCameraMode(isManual: boolean): void {
    Cosmos3DAdapter.getInstance().setUserControllingCamera(isManual);
    this.stateManager.updateState({
      isManualCameraMode: isManual,
      interactionState: isManual ? "MANUAL_CAMERA_ORBIT" : "GUIDED_OBSERVATION",
    });

    if (!isManual) {
      // Return smoothly to guided camera preset
      const activeCue = this.cueController.getState().activeCue;
      if (activeCue) {
        const cmd: CinematicCameraCommand = {
          action: "RESTORE_CAMERA",
          targetObjectId: activeCue.highlightedObjects[0],
          targetPosition: activeCue.cameraTarget,
          cameraPosition: activeCue.cameraPosition,
          cameraPresetId: activeCue.cameraPresetId,
          cameraArchetype: activeCue.cameraArchetype,
          durationMs: 700,
          timestamp: Date.now(),
        };
        for (const listener of this.cameraCommandListeners) {
          listener(cmd);
        }
      }
    }
  }

  public dispatchCameraCommand(command: Omit<CinematicCameraCommand, "timestamp">): void {
    const fullCmd: CinematicCameraCommand = {
      ...command,
      timestamp: Date.now(),
    };
    if (command.targetObjectId) {
      this.stateManager.updateState({
        selectedObjectId: command.targetObjectId,
      });
    }
    for (const listener of this.cameraCommandListeners) {
      listener(fullCmd);
    }
  }

  public setNarrationSpeed(speed: number): void {
    LearningPreferenceManager.updatePreferences({ preferredVoiceSpeed: speed });
    this.director.getNarrationController().setSpeed(speed);
  }

  public getActiveSceneDescriptor(): CinematicSceneDescriptor {
    const snap = this.stateManager.getSnapshot();
    return CosmosCinematicSceneRegistry.getSceneForModule(
      snap.currentModuleId,
      snap.currentModuleTitle,
    );
  }

  public getStateManager(): CosmosCinematicPlayerStateManager {
    return this.stateManager;
  }

  public getCueController(): CosmosAnimationCueController {
    return this.cueController;
  }

  public getQualityManager(): CosmosCinematicQualityManager {
    return this.qualityManager;
  }

  public getDirector(): CosmosLearningDirector {
    return this.director;
  }

  public subscribe(listener: (snapshot: CinematicPlayerStateSnapshot) => void): () => void {
    return this.stateManager.subscribe(listener);
  }

  public subscribeCameraCommands(listener: (cmd: CinematicCameraCommand) => void): () => void {
    this.cameraCommandListeners.add(listener);
    return () => {
      this.cameraCommandListeners.delete(listener);
    };
  }
}

function LessonContentProviderSafeSegments(
  moduleId: string,
  level: LearningLevel,
  language: "en" | "hi",
) {
  try {
    return CosmosAnimationCueRegistry.getCuesForModule(moduleId, level, language).map((c) => ({
      segmentId: c.narrationSegmentId,
      lessonId: c.lessonId,
      sectionId: c.segmentSectionType,
      displayText: "",
      spokenText: "",
      keyTerminology: [] as string[],
    }));
  } catch {
    return [];
  }
}
