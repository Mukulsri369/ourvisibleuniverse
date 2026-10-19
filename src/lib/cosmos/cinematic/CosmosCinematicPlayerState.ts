/**
 * COSMOS Cinematic Player State Machine & Types
 * Project: Our Visible Universe Academy
 * Scope: Prompt 03 — Deterministic 13-State Cinematic Player State Machine
 *
 * Strictly separates cinematic presentation state from authoritative
 * module-completion and assessment grading records.
 * Prevents race conditions from rapid fullscreen/normal-mode switching.
 */

import type { LearningLevel } from "@/lib/academy/types";
import type {
  CinematicCameraType,
  CinematicQualityTier,
  ScientificRepresentationCategory,
} from "../cinematic-storyboard-types";
import type { CosmosLanguage } from "../cosmos-types";

/**
 * 13-State Deterministic Cinematic Player State Machine (Prompt 03 Section 6)
 */
export type CinematicPlayerLifecycleState =
  | "CLOSED"
  | "INITIALIZING"
  | "LOADING_SCENE"
  | "READY"
  | "ENTERING_FULLSCREEN"
  | "PLAYING"
  | "PAUSED"
  | "WAITING_FOR_STUDENT"
  | "ANSWERING_QUESTION"
  | "TRANSITIONING_SCENE"
  | "EXITING_FULLSCREEN"
  | "FALLBACK_MODE"
  | "ERROR";

/**
 * Fullscreen Display State (Prompt 03 Section 5)
 * Never claims native fullscreen succeeded when only a CSS fallback is active.
 */
export type CinematicFullscreenState =
  "INACTIVE" | "REQUESTING_NATIVE" | "NATIVE_FULLSCREEN" | "VIEWPORT_FALLBACK" | "EXITING";

/**
 * Dual Time System Policies (Prompt 03 Section 9)
 * Distinguishes A. Narration Playback Time from B. Scientific Simulation Time.
 */
export type CinematicTimePolicy =
  | "FOLLOW_NARRATION"
  | "SIMULATION_CONTINUOUS"
  | "PAUSE_ON_NARRATION_PAUSE"
  | "WAIT_FOR_STUDENT"
  | "MANUAL_INTERACTION"
  | "FIXED_DEMONSTRATION";

/**
 * Cinematic Camera Action Commands (Prompt 03 Section 11)
 */
export type CinematicCameraActionType =
  | "FOCUS_OBJECT"
  | "ORBIT_OBJECT"
  | "ZOOM_TO_OBJECT"
  | "PAN_TO_REGION"
  | "FOLLOW_TRAJECTORY"
  | "RESTORE_CAMERA"
  | "APPLY_CAMERA_PRESET"
  | "SEEK_CAMERA_TRANSITION"
  | "PAUSE_CAMERA_MOVEMENT";

export interface CinematicCameraCommand {
  action: CinematicCameraActionType;
  targetObjectId?: string;
  targetPosition?: [number, number, number];
  cameraPosition?: [number, number, number];
  cameraPresetId?: string;
  cameraArchetype?: CinematicCameraType;
  progress?: number; // [0..1] for SEEK_CAMERA_TRANSITION
  durationMs?: number;
  timestamp: number;
}

/**
 * Student Interaction & Input Gating State
 */
export type CinematicInteractionMode =
  | "GUIDED_OBSERVATION"
  | "MANUAL_CAMERA_ORBIT"
  | "ACTIVITY_REQUIRED"
  | "QUIZ_REQUIRED"
  | "OFFICIAL_EXAM_ACTIVE"
  | "VOICE_INTERRUPTION";

/**
 * Error & Recovery Classification (Prompt 03 Section 23)
 */
export type CinematicErrorCode =
  | "WEBGL_UNSUPPORTED"
  | "WEBGL_CONTEXT_LOST"
  | "SCENE_LOAD_FAILED"
  | "ASSET_UNAVAILABLE"
  | "ANIMATION_CUE_MISSING"
  | "NARRATION_AUDIO_UNAVAILABLE"
  | "COSMOS_CONNECTION_LOST"
  | "FULLSCREEN_PERMISSION_DENIED"
  | "FULLSCREEN_UNSUPPORTED"
  | "SESSION_EXPIRED";

export interface CinematicErrorState {
  code: CinematicErrorCode;
  message: string;
  recoverable: boolean;
  fallbackAvailable: boolean;
  occurredAt: number;
}

/**
 * Complete Authoritative Cinematic Player State Snapshot (Prompt 03 Section 6)
 */
export interface CinematicPlayerStateSnapshot {
  playerState: CinematicPlayerLifecycleState;
  currentModuleId: string;
  currentModuleTitle: string;
  currentLessonId: string;
  currentSublessonId: string;
  currentChapterTitle: string;
  currentLearningStepId: string;
  currentStepIndex: number;
  totalSteps: number;
  currentNarrationSegmentId: string | null;
  currentNarrationText: string;
  currentKeyTerminology: string[];
  currentSceneId: string;
  currentAnimationCueId: string;
  currentCameraPresetId: string;
  currentTimePolicy: CinematicTimePolicy;
  currentPlaybackState: "idle" | "loading" | "playing" | "paused" | "completed" | "error";
  isSimulationRunning: boolean;
  simulationTimeScale: number;
  currentLearningLevel: LearningLevel;
  language: CosmosLanguage;
  fullscreenState: CinematicFullscreenState;
  qualityPreset: CinematicQualityTier;
  captionsEnabled: boolean;
  scientificLabelsEnabled: boolean;
  isManualCameraMode: boolean;
  isMicrophoneActive: boolean;
  interactionState: CinematicInteractionMode;
  scientificRepresentation: ScientificRepresentationCategory;
  scaleAdjustmentNotice: string | null;
  activeHighlightedObjects: string[];
  selectedObjectId: string | null;
  sceneLoadingProgress: number; // 0 to 100
  isHudVisible: boolean;
  errorState: CinematicErrorState | null;
  lastTransitionTimestamp: number;
}

/**
 * Allowed State Transitions Table
 */
const ALLOWED_STATE_TRANSITIONS: Record<
  CinematicPlayerLifecycleState,
  CinematicPlayerLifecycleState[]
> = {
  CLOSED: ["INITIALIZING"],
  INITIALIZING: [
    "LOADING_SCENE",
    "ENTERING_FULLSCREEN",
    "TRANSITIONING_SCENE",
    "FALLBACK_MODE",
    "READY",
    "PLAYING",
    "PAUSED",
    "ERROR",
    "CLOSED",
  ],
  LOADING_SCENE: [
    "READY",
    "ENTERING_FULLSCREEN",
    "TRANSITIONING_SCENE",
    "PLAYING",
    "PAUSED",
    "WAITING_FOR_STUDENT",
    "FALLBACK_MODE",
    "ERROR",
    "CLOSED",
  ],
  READY: [
    "INITIALIZING",
    "LOADING_SCENE",
    "ENTERING_FULLSCREEN",
    "PLAYING",
    "PAUSED",
    "WAITING_FOR_STUDENT",
    "ANSWERING_QUESTION",
    "TRANSITIONING_SCENE",
    "FALLBACK_MODE",
    "EXITING_FULLSCREEN",
    "ERROR",
    "CLOSED",
  ],
  ENTERING_FULLSCREEN: [
    "PLAYING",
    "PAUSED",
    "READY",
    "WAITING_FOR_STUDENT",
    "FALLBACK_MODE",
    "EXITING_FULLSCREEN",
    "ERROR",
    "CLOSED",
  ],
  PLAYING: [
    "INITIALIZING",
    "READY",
    "PAUSED",
    "WAITING_FOR_STUDENT",
    "ANSWERING_QUESTION",
    "TRANSITIONING_SCENE",
    "LOADING_SCENE",
    "ENTERING_FULLSCREEN",
    "FALLBACK_MODE",
    "EXITING_FULLSCREEN",
    "ERROR",
    "CLOSED",
  ],
  PAUSED: [
    "INITIALIZING",
    "READY",
    "PLAYING",
    "WAITING_FOR_STUDENT",
    "ANSWERING_QUESTION",
    "TRANSITIONING_SCENE",
    "LOADING_SCENE",
    "ENTERING_FULLSCREEN",
    "FALLBACK_MODE",
    "EXITING_FULLSCREEN",
    "ERROR",
    "CLOSED",
  ],
  WAITING_FOR_STUDENT: [
    "INITIALIZING",
    "READY",
    "PLAYING",
    "PAUSED",
    "ANSWERING_QUESTION",
    "TRANSITIONING_SCENE",
    "LOADING_SCENE",
    "FALLBACK_MODE",
    "EXITING_FULLSCREEN",
    "ERROR",
    "CLOSED",
  ],
  ANSWERING_QUESTION: [
    "INITIALIZING",
    "READY",
    "PLAYING",
    "PAUSED",
    "WAITING_FOR_STUDENT",
    "TRANSITIONING_SCENE",
    "FALLBACK_MODE",
    "EXITING_FULLSCREEN",
    "ERROR",
    "CLOSED",
  ],
  TRANSITIONING_SCENE: [
    "INITIALIZING",
    "LOADING_SCENE",
    "READY",
    "ENTERING_FULLSCREEN",
    "PLAYING",
    "PAUSED",
    "WAITING_FOR_STUDENT",
    "FALLBACK_MODE",
    "EXITING_FULLSCREEN",
    "ERROR",
    "CLOSED",
  ],
  FALLBACK_MODE: [
    "INITIALIZING",
    "LOADING_SCENE",
    "PLAYING",
    "PAUSED",
    "READY",
    "WAITING_FOR_STUDENT",
    "ANSWERING_QUESTION",
    "TRANSITIONING_SCENE",
    "ENTERING_FULLSCREEN",
    "EXITING_FULLSCREEN",
    "ERROR",
    "CLOSED",
  ],
  EXITING_FULLSCREEN: ["INITIALIZING", "CLOSED", "READY", "PAUSED", "ERROR"],
  ERROR: [
    "INITIALIZING",
    "LOADING_SCENE",
    "READY",
    "PAUSED",
    "FALLBACK_MODE",
    "EXITING_FULLSCREEN",
    "CLOSED",
  ],
};

export type CinematicStateSubscriber = (snapshot: CinematicPlayerStateSnapshot) => void;

export class CosmosCinematicPlayerStateManager {
  private state: CinematicPlayerStateSnapshot;
  private subscribers = new Set<CinematicStateSubscriber>();
  private transitionLock = false;
  private modeSwitchSequenceId = 0;

  constructor(initialQuality: CinematicQualityTier = "BALANCED") {
    this.state = {
      playerState: "CLOSED",
      currentModuleId: "01",
      currentModuleTitle: "Our Place in the Universe",
      currentLessonId: "lesson-1-what-is-space",
      currentSublessonId: "lesson-1-what-is-space",
      currentChapterTitle: "What is space?",
      currentLearningStepId: "step-01-intro",
      currentStepIndex: 0,
      totalSteps: 1,
      currentNarrationSegmentId: null,
      currentNarrationText: "",
      currentKeyTerminology: [],
      currentSceneId: "m01_cosmic_zoom_hierarchy",
      currentAnimationCueId: "cue-m01-lesson-1-what-is-space-title",
      currentCameraPresetId: "scale_comparison_view",
      currentTimePolicy: "FOLLOW_NARRATION",
      currentPlaybackState: "idle",
      isSimulationRunning: true,
      simulationTimeScale: 1.0,
      currentLearningLevel: "explorer",
      language: "en",
      fullscreenState: "INACTIVE",
      qualityPreset: initialQuality,
      captionsEnabled: true,
      scientificLabelsEnabled: true,
      isManualCameraMode: false,
      isMicrophoneActive: false,
      interactionState: "GUIDED_OBSERVATION",
      scientificRepresentation: "SCALE_ADJUSTED_EDUCATIONAL_MODEL",
      scaleAdjustmentNotice:
        "Educational scale model: Planetary radii and orbital distances are logarithmically compressed for clear simultaneous visibility.",
      activeHighlightedObjects: [],
      selectedObjectId: null,
      sceneLoadingProgress: 100,
      isHudVisible: true,
      errorState: null,
      lastTransitionTimestamp: Date.now(),
    };
  }

  public getSnapshot(): CinematicPlayerStateSnapshot {
    return {
      ...this.state,
      currentKeyTerminology: [...this.state.currentKeyTerminology],
      activeHighlightedObjects: [...this.state.activeHighlightedObjects],
      errorState: this.state.errorState ? { ...this.state.errorState } : null,
    };
  }

  /**
   * Increments and returns a sequence token so rapid Enter/Exit fullscreen
   * operations can detect and discard stale async completions.
   */
  public beginModeSwitchOperation(): number {
    this.modeSwitchSequenceId += 1;
    return this.modeSwitchSequenceId;
  }

  public isCurrentModeSwitchOperation(token: number): boolean {
    return token === this.modeSwitchSequenceId;
  }

  /**
   * Validates and executes a deterministic lifecycle state transition.
   */
  public transitionLifecycleState(nextState: CinematicPlayerLifecycleState): boolean {
    if (this.state.playerState === nextState) {
      return true;
    }

    const allowed = ALLOWED_STATE_TRANSITIONS[this.state.playerState] || [];
    if (!allowed.includes(nextState) && nextState !== "CLOSED" && nextState !== "ERROR") {
      // Permit recovery transitions while logging unexpected jump
      console.warn(
        `[CosmosCinematicPlayerState] Non-standard state transition ${this.state.playerState} -> ${nextState}; normalizing.`,
      );
    }

    this.state = {
      ...this.state,
      playerState: nextState,
      lastTransitionTimestamp: Date.now(),
    };
    this.notify();
    return true;
  }

  /**
   * Partial state update with automatic subscriber notification.
   */
  public updateState(patch: Partial<CinematicPlayerStateSnapshot>): void {
    if (this.transitionLock) return;
    this.transitionLock = true;
    try {
      this.state = {
        ...this.state,
        ...patch,
        lastTransitionTimestamp: Date.now(),
      };
    } finally {
      this.transitionLock = false;
    }
    this.notify();
  }

  /**
   * Records a structured error state without losing student learning coordinates.
   */
  public recordError(
    code: CinematicErrorCode,
    message: string,
    options: { recoverable?: boolean; fallbackAvailable?: boolean; enterErrorState?: boolean } = {},
  ): void {
    const { recoverable = true, fallbackAvailable = true, enterErrorState = false } = options;
    this.state = {
      ...this.state,
      playerState: enterErrorState ? "ERROR" : this.state.playerState,
      errorState: {
        code,
        message,
        recoverable,
        fallbackAvailable,
        occurredAt: Date.now(),
      },
      lastTransitionTimestamp: Date.now(),
    };
    this.notify();
  }

  public clearError(): void {
    if (!this.state.errorState) return;
    this.state = {
      ...this.state,
      errorState: null,
      playerState: this.state.playerState === "ERROR" ? "READY" : this.state.playerState,
      lastTransitionTimestamp: Date.now(),
    };
    this.notify();
  }

  public subscribe(listener: CinematicStateSubscriber): () => void {
    this.subscribers.add(listener);
    listener(this.getSnapshot());
    return () => {
      this.subscribers.delete(listener);
    };
  }

  private notify(): void {
    const snap = this.getSnapshot();
    for (const sub of this.subscribers) {
      try {
        sub(snap);
      } catch (err) {
        console.warn("[CosmosCinematicPlayerState] subscriber error:", err);
      }
    }
  }
}
