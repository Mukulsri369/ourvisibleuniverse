import React from "react";
import type { QuizQuestion, LearningLevel } from "@/lib/academy/types";
import { UnifiedAssessmentEngine } from "./UnifiedAssessmentEngine";

export interface KnowledgeCheckProps {
  quizId?: string;
  questions?: QuizQuestion[];
  onCompleteQuiz?: (score: number, total: number) => void;
  onComplete?: (score: number, total: number) => void;
  onFinishQuiz?: (score: number, total: number) => void;
  currentLevel?: string;
}

export function KnowledgeCheck({
  quizId,
  questions,
  onCompleteQuiz,
  onComplete,
  onFinishQuiz,
  currentLevel = "explorer",
}: KnowledgeCheckProps) {
  // Infer moduleId from quizId (e.g. "quiz_module_02" -> "02") or questions
  let moduleId = "01";
  if (quizId) {
    const match = quizId.match(/\d+/);
    if (match) {
      moduleId = match[0].padStart(2, "0");
    }
  } else if (questions && questions[0]?.id) {
    const match = questions[0].id.match(/\d+/);
    if (match) {
      moduleId = match[0].padStart(2, "0");
    }
  }

  const validLevel: LearningLevel =
    currentLevel === "junior" || currentLevel === "astronomer" ? currentLevel : "explorer";

  return (
    <UnifiedAssessmentEngine
      moduleId={moduleId}
      currentLevel={validLevel}
      initialMode="official"
      fallbackQuestions={questions}
      onCompleteQuiz={onCompleteQuiz}
      onComplete={onComplete}
      onFinishQuiz={onFinishQuiz}
    />
  );
}
