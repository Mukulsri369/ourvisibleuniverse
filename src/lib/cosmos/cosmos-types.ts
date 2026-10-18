/**
 * COSMOS AI Teacher Foundation — Core Type Definitions
 * Project: Our Visible Universe Academy
 * Scope: Prompt 12 Orchestration Layer & Epistemic Contracts
 */

import type { LearningLevel } from "../academy/types";

export type CosmosLanguage = "en" | "hi" | "hinglish";

export type EpistemicStatus = "fact" | "model" | "hypothesis" | "uncertainty";

export type CosmosLearningMode =
  | "guided" // COSMOS reads and explains the lesson
  | "ask" // Student asks free-form questions
  | "explore" // Student interacts with 3D visualizations with contextual commentary
  | "independent" // Student studies without AI assistance
  | "exam"; // Examination mode: AI conversational help is disabled

export interface CosmosVisualizationReference {
  sceneId: string; // e.g., "cosmic_scale", "solar_system", "black_hole_lensing", "hr_diagram"
  targetObject?: string; // e.g., "Earth", "Sagittarius A*", "Betelgeuse"
  cameraAction?: "focus" | "zoom_in" | "zoom_out" | "orbit" | "fly_to" | "reset";
  scaleRegime?: "planetary" | "stellar" | "galactic" | "cosmological";
  parameters?: Record<string, any>;
  highlightElements?: string[];
  annotations?: string[];
}

/**
 * Canonical Structured Narration Segment.
 * Strictly preserves the approved instructional text while supplying
 * scientifically equivalent pronunciation for symbols, equations, and notation.
 */
export interface NarrationSegment {
  courseId: string; // "cosmic-journey"
  courseVersion: string; // e.g., "1.0.0"
  moduleId: string; // e.g., "01", "14"
  moduleVersion: string; // "1.0.0"
  lessonId: string; // e.g., "lesson-1-what-is-space"
  sectionId: string; // e.g., "summary", "deepDive", "mathOrAnalogy"
  segmentId: string; // e.g., "01-1-summary-p1"
  sequenceNumber: number; // 1-based order within lesson
  displayText: string; // Exact approved instructional text for visual rendering
  spokenText: string; // Phonetically and mathematically expanded text for speech
  language: CosmosLanguage; // "en" | "hi" | "hinglish"
  learningLevel: LearningLevel; // "junior" | "explorer" | "astronomer"
  scientificReferences: string[]; // Academic citations and verified source URLs
  visualizationReference?: CosmosVisualizationReference;
  epistemicStatus: EpistemicStatus; // fact, model, hypothesis, uncertainty
  keyTerminology: string[]; // Essential scientific terms highlighted in this segment
  estimatedDurationSeconds: number; // For UI progress and timing
}

/**
 * Epistemic Context Provided to COSMOS for Grounded Responses.
 */
export interface StudentQuestionContext {
  courseId: string;
  courseVersion: string;
  moduleId: string;
  moduleNumber: number;
  moduleTitle: string;
  lessonId: string;
  lessonTitle: string;
  sublessonId?: string;
  sublessonTitle?: string;
  scientificTopic: string;
  currentDisplayText: string;
  learningLevel: LearningLevel;
  currentVisualization?: CosmosVisualizationReference;
  approvedLearningObjectives: string[];
  scientificReferences: string[];
  relevantTerminology: string[];
  discussionHistory: CosmosDiscussionTurn[];
  activeExamAttempt?: boolean; // When true, COSMOS must refuse exam hints
}

export interface CosmosDiscussionTurn {
  role: "student" | "cosmos" | "system";
  content: string;
  timestamp: number;
  epistemicStatus?: EpistemicStatus;
}

export interface CosmosScientificSource {
  title: string;
  organization?: string;
  url?: string;
  citation?: string;
}

/**
 * COSMOS Response Contract.
 */
export interface CosmosAnswer {
  answerText: string;
  spokenText?: string;
  epistemicClassification: EpistemicStatus;
  epistemicNote?: string; // Explains whether this is verified observation vs theoretical model
  scientificSources: CosmosScientificSource[];
  suggestedFollowUpQuestions: string[];
  visualizationAction?: CosmosVisualizationReference;
  isExamRestricted?: boolean;
  learningLevelAdapted: LearningLevel;
}

export type CosmosVoiceName = "Kore" | "Puck" | "Fenrir" | "Zephyr" | "Charon";

export type CosmosNarrationStatus =
  "idle" | "loading" | "playing" | "paused" | "completed" | "error" | "interrupted";

export interface CosmosAudioSynthesisResult {
  audioBase64: string | null;
  mimeType: string;
  cached: boolean;
  voiceName: CosmosVoiceName;
  model: "gemini-3.8-flash-lite-tts" | "gemini-3.8-flash-tts";
  useWebSpeechFallback: boolean;
  error?: string;
}

/**
 * Real-time Speech & Narration State.
 */
export interface NarrationState {
  status: CosmosNarrationStatus;
  currentSegmentIndex: number;
  totalSegments: number;
  currentSegment: NarrationSegment | null;
  progressPercentage: number;
  speechSpeed: number; // 0.75x to 1.5x
  language: CosmosLanguage;
  voiceName: CosmosVoiceName;
  textOnlyMode: boolean;
  audioSource: "gemini-tts" | "web-speech" | "text-only";
  elapsedSeconds: number;
  activeSectionId?: string;
  errorMessage?: string;
}

/**
 * Persisted Narration Cursor.
 * Advance the confirmed cursor only when playback actually completes.
 */
export interface NarrationCursor {
  moduleId: string;
  lessonId: string;
  sectionId: string;
  sublessonId?: string;
  segmentId: string;
  sequenceNumber: number;
  lastConfirmedCompletedSegmentId?: string;
  currentPlaybackState: CosmosNarrationStatus;
  playbackPositionSeconds: number;
  completedSegmentIds: string[];
  updatedAt: string;
}

/**
 * Exact Interaction State Machine required by Prompt 14:
 * IDLE, NARRATING, INTERRUPTING, LISTENING, PROCESSING, ANSWERING, FOLLOW_UP_WINDOW, RESUMING, PAUSED, ERROR
 */
export type CosmosInteractionState =
  | "IDLE"
  | "NARRATING"
  | "INTERRUPTING"
  | "LISTENING"
  | "PROCESSING"
  | "ANSWERING"
  | "FOLLOW_UP_WINDOW"
  | "RESUMING"
  | "PAUSED"
  | "ERROR";

export type CosmosVoiceCommandType =
  | "pause"
  | "continue"
  | "repeat"
  | "go_back"
  | "explain_again"
  | "speak_slower"
  | "skip_next"
  | "show_example";

export interface CosmosVoiceCommandMatch {
  isCommand: boolean;
  commandType?: CosmosVoiceCommandType;
  rawTranscript: string;
  matchedPhrase?: string;
}

export interface ConversationalTurnContext extends StudentQuestionContext {
  interruptedSegment?: NarrationSegment | null;
  nearbyInstructionalContent?: string[];
  followUpCount?: number;
  lastAnswerText?: string;
}

/**
 * Student Learning & AI Preferences.
 */
export interface CosmosPreferences {
  mode: CosmosLearningMode;
  preferredVoiceSpeed: number;
  preferredVoiceName: CosmosVoiceName;
  language: CosmosLanguage;
  autoAdvanceSegments: boolean;
  autoPlayOnNavigation: boolean;
  subtitlesEnabled: boolean;
  textOnlyMode: boolean;
  autoScrollEnabled: boolean;
  voiceGender: "neutral" | "female" | "male";
  visualSyncEnabled: boolean;
  // Prompt 14 Real-Time Voice Conversation Preferences
  handsFreeBargeIn: boolean; // Opt-in hands-free voice barge-in
  autoResumeAfterDiscussion: boolean; // Auto-resume lesson when follow-up window closes
  followUpWindowSeconds: number; // Seconds to wait for student follow-up before auto-resume (default 6s)
  vadSensitivity: number; // Voice Activity Detection sensitivity (0.0 to 1.0)
  pushToTalkEnabled: boolean; // Push-to-talk mode
}

export const COSMOS_DEFAULT_PREFERENCES: CosmosPreferences = {
  mode: "guided",
  preferredVoiceSpeed: 1.0,
  preferredVoiceName: "Kore",
  language: "en",
  autoAdvanceSegments: true,
  autoPlayOnNavigation: false,
  subtitlesEnabled: true,
  textOnlyMode: false,
  autoScrollEnabled: true,
  voiceGender: "neutral",
  visualSyncEnabled: true,
  handsFreeBargeIn: false,
  autoResumeAfterDiscussion: true,
  followUpWindowSeconds: 6,
  vadSensitivity: 0.5,
  pushToTalkEnabled: true,
};

/**
 * Authority Constraints Enforced on COSMOS.
 * Any attempt by the AI or user to trigger these actions via COSMOS is strictly blocked.
 */
export const COSMOS_FORBIDDEN_ACTIONS = [
  "mark_module_complete",
  "change_quiz_score",
  "award_badge",
  "issue_certificate",
  "modify_database_permissions",
  "alter_admin_records",
  "bypass_prerequisites",
  "reveal_exam_answers",
] as const;

export type CosmosForbiddenAction = (typeof COSMOS_FORBIDDEN_ACTIONS)[number];

/**
 * Prompt 14 Live API Session Types
 */
export type LiveSessionState =
  "DISCONNECTED" | "CONNECTING" | "CONNECTED" | "RECONNECTING" | "EXPIRED" | "ERROR";

export interface CosmosLiveSessionToken {
  sessionId: string;
  token: string;
  model: "gemini-3.8-live" | "gemini-3.5-transcribe-live";
  expiresAt: number; // Unix timestamp ms (short-lived TTL e.g. 15 minutes)
  issuedAt: number;
  moduleId: string;
}
