import React, { useState } from "react";
import type { QuizQuestion } from "@/lib/academy/types";
import { CheckCircle2, XCircle, HelpCircle, Award, RotateCcw, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface KnowledgeCheckProps {
  quizId: string;
  questions: QuizQuestion[];
  onCompleteQuiz?: (score: number, total: number) => void;
  onComplete?: (score: number, total: number) => void;
  currentLevel?: string;
}

export function KnowledgeCheck({
  quizId,
  questions,
  onCompleteQuiz,
  onComplete,
}: KnowledgeCheckProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSelectOption = (questionIndex: number, optionIndex: number) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        score++;
      }
    });
    return score;
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const score = calculateScore();
    const callback = onCompleteQuiz || onComplete;
    if (callback) {
      callback(score, questions.length);
    }
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setSubmitted(false);
  };

  const allAnswered = questions.every((_, idx) => selectedAnswers[idx] !== undefined);
  const currentScore = calculateScore();
  const perfectScore = currentScore === questions.length;

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-6 sm:p-8 backdrop-blur-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
              Step F: Science Knowledge Check
            </span>
            <span className="text-xs text-slate-400">{questions.length} Questions</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Test Your Cosmic Understanding
          </h3>
        </div>

        {submitted && (
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-full">
            <Award className="size-4 text-emerald-400" />
            <span className="text-sm font-bold text-emerald-300">
              Score: {currentScore} / {questions.length}
            </span>
          </div>
        )}
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {questions.map((q, qIdx) => {
          const userAnswer = selectedAnswers[qIdx];
          const isCorrect = userAnswer === q.correctIndex;

          return (
            <div
              key={q.id}
              className={`rounded-2xl border p-5 transition-all ${
                submitted
                  ? isCorrect
                    ? "border-emerald-500/40 bg-emerald-950/10"
                    : "border-rose-500/40 bg-rose-950/10"
                  : "border-white/10 bg-slate-950/60"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="font-mono text-xs font-bold text-cyan-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-md">
                  Q{qIdx + 1}
                </span>
                <div className="flex-1">
                  <h4 className="text-base font-bold text-white">{q.question}</h4>

                  {/* Options */}
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = userAnswer === optIdx;
                      const isCorrectOption = optIdx === q.correctIndex;

                      let optionStyle =
                        "border-white/10 bg-white/[0.02] text-slate-300 hover:bg-white/5 hover:text-white";
                      if (submitted) {
                        if (isCorrectOption) {
                          optionStyle =
                            "border-emerald-500/60 bg-emerald-950/40 text-emerald-200 font-semibold";
                        } else if (isSelected && !isCorrectOption) {
                          optionStyle =
                            "border-rose-500/60 bg-rose-950/40 text-rose-200 line-through";
                        } else {
                          optionStyle = "border-white/5 bg-transparent text-slate-500";
                        }
                      } else if (isSelected) {
                        optionStyle =
                          "border-cyan-400 bg-cyan-950/40 text-cyan-200 font-semibold ring-1 ring-cyan-400/40";
                      }

                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectOption(qIdx, optIdx)}
                          disabled={submitted}
                          className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${optionStyle}`}
                        >
                          <span>{opt}</span>
                          {submitted && isCorrectOption && (
                            <CheckCircle2 className="size-4 text-emerald-400 flex-shrink-0 ml-2" />
                          )}
                          {submitted && isSelected && !isCorrectOption && (
                            <XCircle className="size-4 text-rose-400 flex-shrink-0 ml-2" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Feedback Explanation */}
                  {submitted && (
                    <div
                      className={`mt-4 rounded-xl p-3 text-xs leading-relaxed border ${
                        isCorrect
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-200"
                          : "bg-rose-500/10 border-rose-500/20 text-rose-200"
                      }`}
                    >
                      <span className="font-bold block mb-0.5">
                        {isCorrect ? "Correct!" : "Scientific Explanation:"}
                      </span>
                      <span>{q.explanation}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quiz Submission & Retry Footer */}
      <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
        {!submitted ? (
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={!allAnswered}
            className="font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 border-none"
          >
            <CheckCircle2 className="size-4 mr-2" />
            <span>Check My Answers</span>
          </Button>
        ) : (
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="border-white/10 text-slate-300 hover:text-white"
            >
              <RotateCcw className="size-3.5 mr-1.5" />
              <span>Retry Quiz</span>
            </Button>
            {perfectScore && (
              <span className="text-xs text-amber-300 font-semibold flex items-center gap-1">
                <Award className="size-4 text-amber-400" />
                Master Cosmologist Badge Earned!
              </span>
            )}
          </div>
        )}

        <span className="text-xs text-slate-400">
          {!submitted && !allAnswered
            ? `Please answer all ${questions.length} questions to submit`
            : "Scores saved automatically to your browser profile"}
        </span>
      </div>
    </div>
  );
}
