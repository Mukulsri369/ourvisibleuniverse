import type { LearningLevel } from "./types";

export type QuestionType = "single_choice" | "multi_choice" | "true_false" | "order_sequence";

export type QuestionDifficulty = "introductory" | "intermediate" | "advanced";

export type AssessmentMode = "official" | "practice";

/**
 * Public, sanitized question representation sent to the student.
 * CRITICAL SECURITY GUARANTEE: Never contains correct answers or grading keys.
 */
export interface ClientAssessmentQuestion {
  id: string;
  moduleId: string;
  level: LearningLevel;
  difficulty: QuestionDifficulty;
  type: QuestionType;
  questionText: string;
  options: string[];
  relevantLessonId?: string;
  sourceReference?: string;
}

/**
 * Canonical authoritative question definition stored SERVER-SIDE ONLY.
 * Never bundled into public frontend code.
 */
export interface CanonicalAssessmentQuestion extends ClientAssessmentQuestion {
  correctAnswer: number | number[]; // index of correct option, or array of indices
  explanation: string;
  sourceReference: string;
  version: string;
  isActive: boolean;
}

/**
 * Server-issued assessment session given to learner when starting an attempt.
 */
export interface StartAssessmentResponse {
  attemptId: string;
  moduleId: string;
  level: LearningLevel;
  mode: AssessmentMode;
  passingScorePct: number;
  totalQuestions: number;
  questions: ClientAssessmentQuestion[];
  startedAt: string;
}

/**
 * Feedback for an individual question returned ONLY after authoritative grading.
 */
export interface AssessmentFeedbackItem {
  questionId: string;
  questionText: string;
  userAnswer: number | number[] | null;
  isCorrect: boolean;
  correctAnswer: number | number[];
  explanation: string;
  sourceReference: string;
  reviewLesson?: {
    id: string;
    title: string;
  };
}

/**
 * Comprehensive server-graded assessment verdict.
 */
export interface AssessmentResult {
  attemptId: string;
  moduleId: string;
  level: LearningLevel;
  mode: AssessmentMode;
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  passingScorePct: number;
  verifiedCompletionAwarded: boolean;
  newStageBadgeAwarded: string | null;
  certificateEligible: boolean;
  feedback: AssessmentFeedbackItem[];
  recommendations?: {
    lessonId: string;
    title: string;
    reviewNote: string;
  }[];
}

/**
 * Module assessment policy configuration.
 */
export interface AssessmentPolicyConfig {
  defaultModulePassingPct: number; // 70%
  finalCertificationPassingPct: number; // 80%
  minDurationSeconds: number; // Anti-spam / rate-limiting guard
  maxRetriesPerDay?: number;
}

export const DEFAULT_ASSESSMENT_POLICY: AssessmentPolicyConfig = {
  defaultModulePassingPct: 70.0,
  finalCertificationPassingPct: 80.0,
  minDurationSeconds: 5,
};
