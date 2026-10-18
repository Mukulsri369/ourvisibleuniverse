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
  stageId?: number;
  stageTitle?: string;
  level: LearningLevel;
  difficulty: QuestionDifficulty;
  type: QuestionType;
  questionText: string;
  options: string[];
  learningObjective?: string;
  relevantLessonId?: string;
  sourceReference?: string;
  questionVersion?: string;
}

/**
 * Canonical authoritative question definition stored SERVER-SIDE ONLY.
 * Never bundled into public frontend code.
 */
export interface CanonicalAssessmentQuestion extends ClientAssessmentQuestion {
  correctAnswer: number | number[]; // index of correct option, or array of indices
  explanation: string;
  sourceReference: string;
  learningObjective: string;
  stageId: number;
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
  blueprint?: FinalExamBlueprint;
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
  stageId?: number;
  moduleId?: string;
  learningObjective?: string;
  reviewLesson?: {
    id: string;
    title: string;
  };
}

/**
 * Domain & Stage level performance breakdown for feedback.
 */
export interface TopicStrength {
  stageId: number;
  stageTitle: string;
  correctCount: number;
  totalCount: number;
  percentage: number;
  status: "mastered" | "proficient" | "review_needed";
}

export interface TopicRequiringReview {
  stageId: number;
  moduleId: string;
  moduleTitle: string;
  topicName: string;
  learningObjective: string;
  reviewRecommendation: string;
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
  topicStrengths?: TopicStrength[];
  topicsRequiringReview?: TopicRequiringReview[];
  recommendations?: {
    lessonId: string;
    title: string;
    reviewNote: string;
  }[];
}

/**
 * Configurable Final Examination Blueprint
 */
export interface FinalExamBlueprint {
  title: string;
  totalQuestions: number;
  passingScorePct: number;
  minCorrectAnswers: number;
  stageDistribution: Record<number, number>; // stageId -> question count
}

export const FINAL_EXAM_BLUEPRINT: FinalExamBlueprint = {
  title: "Cosmic Explorer — Final Knowledge Assessment",
  totalQuestions: 20,
  passingScorePct: 80.0,
  minCorrectAnswers: 16,
  stageDistribution: {
    1: 3, // Stage 1 (Modules 01-04): 3 questions
    2: 4, // Stage 2 (Modules 05-08): 4 questions
    3: 3, // Stage 3 (Modules 09-12): 3 questions
    4: 4, // Stage 4 (Modules 13-16): 4 questions
    5: 3, // Stage 5 (Modules 17-20): 3 questions
    6: 3, // Stage 6 (Modules 21-24): 3 questions
  },
};

export interface FinalExamEligibilityResult {
  isEligible: boolean;
  totalVerified: number;
  requiredTotal: number;
  missingModules: { id: string; title: string; stageId: number }[];
  verifiedModuleIds: string[];
  courseId: string;
  courseVersion: string;
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

