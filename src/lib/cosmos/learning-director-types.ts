/**
 * COSMOS 2.0 — Learning Director Type Definitions
 * Project: Our Visible Universe Academy
 * Scope: Phase 1 Intelligent Learning Director, Highlighting & Screen Navigation
 */

import type { LearningLevel } from "../academy/types";
import type {
  CosmosAnswer,
  CosmosLanguage,
  CosmosLearningMode,
  CosmosVisualizationReference,
  EpistemicStatus,
  NarrationSegment,
} from "./cosmos-types";

// ============================================================================
// PART 3: DETERMINISTIC GUIDED LEARNING STATES (EXACT 21 STATES)
// ============================================================================

export const GUIDED_LEARNING_STATES = [
  "INITIALIZING",
  "INTRODUCING_MODULE",
  "NAVIGATING_TO_LESSON",
  "EXPLAINING",
  "WAITING_FOR_STUDENT",
  "NAVIGATING_TO_ACTIVITY",
  "EXPLAINING_ACTIVITY",
  "WAITING_FOR_ACTIVITY",
  "REVIEWING_ACTIVITY",
  "NAVIGATING_TO_QUIZ",
  "READING_QUESTION",
  "WAITING_FOR_ANSWER",
  "CONFIRMING_ANSWER",
  "SUBMITTING_ANSWER",
  "REVIEWING_FEEDBACK",
  "ANSWERING_STUDENT_QUESTION",
  "RESUMING_PREVIOUS_STEP",
  "VERIFYING_REQUIREMENTS",
  "MODULE_COMPLETED",
  "PAUSED",
  "ERROR",
] as const;

export type GuidedLearningState = (typeof GUIDED_LEARNING_STATES)[number];

// ============================================================================
// PART 4: STRUCTURED LEARNING STEP TYPES
// ============================================================================

export const LEARNING_STEP_TYPES = [
  "LESSON",
  "EXPLANATION",
  "VISUALIZATION",
  "ACTIVITY",
  "PRACTICE_QUESTION",
  "KNOWLEDGE_CHECK",
  "REVIEW",
  "COMPLETION_CHECK",
  "TRANSITION",
] as const;

export type LearningStepType = (typeof LEARNING_STEP_TYPES)[number];

export type StepRecoveryBehavior =
  "resume_current" | "restart_step" | "skip_eligible" | "wait_for_input";

export type StepStatus = "pending" | "in_progress" | "completed" | "skipped" | "failed";

export interface LearningStepCompletionCondition {
  type:
    | "narration_finished"
    | "student_acknowledged"
    | "activity_outcome_submitted"
    | "quiz_passed"
    | "time_elapsed";
  requiredScorePercent?: number;
  minElapsedSeconds?: number;
}

export interface LearningStep {
  stepId: string;
  moduleId: string;
  lessonId: string;
  sectionId: string;
  sublessonIndex?: number;
  stepType: LearningStepType;
  title: string;
  learningLevel: LearningLevel;
  targetComponentId: string; // DOM id or selector target for smart scrolling
  narrationSegmentIds: string[];
  requiresStudentInput: boolean;
  completionCondition: LearningStepCompletionCondition;
  nextStepId?: string;
  recoveryBehavior: StepRecoveryBehavior;
  stepStatus: StepStatus;
  pedagogicalTransitionText?: string;
  visualizationRef?: CosmosVisualizationReference;
}

// ============================================================================
// PART 10: LEARNING SESSION PERSISTENCE RECORD
// ============================================================================

export interface CosmosLearningSessionRecord {
  studentId?: string;
  courseId: string;
  courseVersion: string;
  moduleId: string;
  moduleTitle: string;
  lessonId: string;
  lessonTitle: string;
  sectionId: string;
  stepId: string;
  stepIndex: number;
  totalSteps: number;
  narrationSegmentId?: string;
  learningLevel: LearningLevel;
  confirmedPlaybackPosition: number;
  sessionStatus: "active" | "paused" | "completed" | "interrupted";
  updatedAt: string;
}

// ============================================================================
// PART 5 & 6: ATTENTION & NAVIGATION CONTRACTS
// ============================================================================

export interface HighlightTarget {
  segmentId: string;
  sectionId: string;
  lessonId: string;
  targetElementSelector?: string;
  displayText: string;
  spokenText: string;
  keyTerminology?: string[];
}

export interface ScrollPositionTarget {
  elementSelector: string;
  targetId?: string;
  offsetY?: number;
  behavior?: ScrollBehavior;
  reason?: string;
}

export interface TabSwitchEvent {
  moduleId: string;
  sublessonId: string;
  sublessonIndex: number;
}

export type TabSwitchHandler = (event: TabSwitchEvent) => void | Promise<void>;

// ============================================================================
// PHASE 2: INTERACTIVE ACTIVITY ADAPTER & QUIZ GUIDE CONTRACTS
// ============================================================================

export const ACTIVITY_STATES = [
  "NOT_STARTED",
  "READY",
  "ACTIVE",
  "WAITING_FOR_STUDENT",
  "CHECKING_RESULT",
  "COMPLETED",
  "NEEDS_RETRY",
  "UNAVAILABLE",
] as const;

export type ActivityStatus = (typeof ACTIVITY_STATES)[number];

export type ActivityType =
  | "physics_simulation"
  | "interactive_lab"
  | "accessible_alternative"
  | "data_analysis"
  | "classification_challenge";

export type ActivityValidationMethod =
  "server_validated_result" | "parameter_threshold" | "step_sequence_completed";

export interface ActivityInstructionStep {
  stepId: string;
  stepNumber: number;
  instructionText: string;
  spokenPrompt: string;
  targetControlSelector?: string;
  targetControlLabel?: string;
  demonstrationActionId?: string;
  expectedActionName?: string;
  completed: boolean;
  observationFeedback?: string;
}

export interface ActivityStateRecord {
  activityId: string;
  moduleId: string;
  title: string;
  objective: string;
  type: ActivityType;
  status: ActivityStatus;
  requiredActions: string[];
  completedActions: string[];
  currentStepId: string;
  instructionSteps: ActivityInstructionStep[];
  currentParameters: Record<string, unknown>;
  originalParameters: Record<string, unknown>;
  availableActions: string[];
  activeControlSelector?: string;
  activeControlLabel?: string;
  validationMethod: ActivityValidationMethod;
  validationKey: string;
  lastObservationFeedback?: string;
  lastValidationResult?: {
    isValid: boolean;
    reason: string;
    timestamp: number;
  };
  accessibleAlternativeAvailable: boolean;
  isAccessibleModeActive: boolean;
}

export interface GuidedQuizQuestionState {
  questionId: string;
  questionIndex: number;
  totalQuestions: number;
  questionText: string;
  options: string[];
  selectedOptionIndex?: number;
  isConfirmed: boolean;
  relevantLessonId?: string;
}

export interface GuidedQuizSessionState {
  moduleId: string;
  mode: "official" | "practice";
  questions: GuidedQuizQuestionState[];
  activeQuestionIndex: number;
  pendingConfirmationOption?: number;
  isSubmitted: boolean;
  passed?: boolean;
  scorePercentage?: number;
  passingScorePct: number;
  feedbackSummary?: string;
  lastHintText?: string;
}

// ============================================================================
// DIRECTOR SNAPSHOT & EVENT PAYLOADS
// ============================================================================

export interface DirectorStateSnapshot {
  state: GuidedLearningState;
  moduleId: string;
  moduleTitle: string;
  currentStepIndex: number;
  totalSteps: number;
  currentStep: LearningStep | null;
  activeSegmentId: string | null;
  activeHighlightedText: string | null;
  isNarrationPlaying: boolean;
  isAutoScrollActive: boolean;
  isUserScrolledAway: boolean;
  isMicrophoneActive: boolean;
  isGuidedModeActive: boolean;
  learningLevel: LearningLevel;
  speechSpeed: number;
  language: CosmosLanguage;
  lastQuestionAnswer?: CosmosAnswer | null;
  errorMessage?: string;
  // Phase 2 extensions
  activeActivityState?: ActivityStateRecord | null;
  activeQuizState?: GuidedQuizSessionState | null;
}

export type DirectorSubscriber = (snapshot: DirectorStateSnapshot) => void;
