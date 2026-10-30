import { ensurePracticeSession } from "@/lib/auth-client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import type { LearningLevel } from "@/lib/academy/types";
import type {
  ClientAssessmentQuestion,
  AssessmentMode,
  AssessmentResult,
} from "@/lib/academy/assessment-types";
import {
  startAssessmentAttempt,
  submitAssessmentAttempt,
} from "@/lib/academy/assessment.functions";
import { CosmosQuizGuide } from "@/lib/cosmos/CosmosQuizGuide";
import { useStudentAuth } from "@/lib/academy/useStudentAuth";
import {
  CheckCircle2,
  XCircle,
  Award,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  BookOpen,
  ArrowRight,
  Clock,
  HelpCircle,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export interface UnifiedAssessmentEngineProps {
  moduleId: string;
  moduleTitle?: string;
  currentLevel?: LearningLevel;
  initialMode?: AssessmentMode;
  onAssessmentCompleted?: (result: AssessmentResult) => void;
  // Legacy backward-compatibility callbacks
  onCompleteQuiz?: (score: number, total: number) => void;
  onComplete?: (score: number, total: number) => void;
  onFinishQuiz?: (score: number, total: number) => void;
  // Optional client fallback questions for offline or legacy layouts
  fallbackQuestions?: any[];
  onReviewLesson?: (lessonId: string) => void;
}

export function UnifiedAssessmentEngine({
  moduleId,
  moduleTitle,
  currentLevel = "explorer",
  initialMode = "official",
  onAssessmentCompleted,
  onCompleteQuiz,
  onComplete,
  onFinishQuiz,
  fallbackQuestions,
  onReviewLesson,
}: UnifiedAssessmentEngineProps) {
  const { isLoggedIn, user, profile } = useStudentAuth();

  // Mode: official certification assessment vs practice drill
  const [mode, setMode] = useState<AssessmentMode>(
    !isLoggedIn && initialMode === "official" ? "practice" : initialMode,
  );

  // Assessment session state
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<ClientAssessmentQuestion[]>([]);
  const [passingScorePct, setPassingScorePct] = useState<number>(70);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Learner input: questionId -> selectedOptionIndex
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);

  // Attempt timing & duration
  const startTimeRef = useRef<number>(Date.now());
  const activeLevelRef = useRef<LearningLevel>(currentLevel);

  // Initialize or fetch secure assessment questions from server
  const loadAssessment = useCallback(
    async (targetMode: AssessmentMode) => {
      setLoading(true);
      setError(null);
      setAssessmentResult(null);
      setSelectedAnswers({});
      startTimeRef.current = Date.now();
      // Lock level at attempt initialization
      activeLevelRef.current = currentLevel;

      try {
        await ensurePracticeSession();
      const response = await startAssessmentAttempt({
          data: {
            moduleId,
            level: currentLevel,
            mode: targetMode,
          },
        });

        setAttemptId(response.attemptId);
        setQuestions(response.questions);
        setPassingScorePct(response.passingScorePct);
      } catch (err: any) {
        console.warn(
          "Failed to load server assessment, checking fallback questions:",
          err?.message,
        );

        // Offline or server unavailable: use sanitized fallback questions if provided
        if (fallbackQuestions && fallbackQuestions.length > 0) {
          const sanitized = fallbackQuestions.map((q: any, i: number) => ({
            id: q.id || `fb_${moduleId}_${i}`,
            moduleId,
            level: currentLevel,
            difficulty: "intermediate" as const,
            type: "single_choice" as const,
            questionText: q.question || q.questionText || "Concept Question",
            options: q.options || [],
            relevantLessonId: `${moduleId}-core`,
          }));

          setAttemptId(`local_fallback_${Date.now()}`);
          setQuestions(sanitized);
          setPassingScorePct(70);
        } else {
          setError(
            err?.message || "Could not load verified assessment. Please check your connection.",
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [moduleId, currentLevel, fallbackQuestions],
  );

  useEffect(() => {
    void loadAssessment(mode);
  }, [loadAssessment, mode]);

  // Handle option selection
  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (assessmentResult || submitting) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  // Keyboard navigation support for accessibility
  const handleKeyDown = (e: React.KeyboardEvent, questionId: string, optionIndex: number) => {
    if (assessmentResult || submitting) return;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      handleSelectOption(questionId, optionIndex);
    }
  };

  // Check if all questions are answered
  const allAnswered =
    questions.length > 0 && questions.every((q) => selectedAnswers[q.id] !== undefined);

  //Submit assessment for authoritative server evaluation
  const handleSubmit = async () => {
    if (!allAnswered || submitting) return;
    setSubmitting(true);
    setError(null);

    const elapsedSeconds = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));

    try {
      const result = await submitAssessmentAttempt({
        data: {
          attemptId: attemptId || `att_${Date.now()}`,
          moduleId,
          level: activeLevelRef.current,
          mode,
          answers: selectedAnswers,
          clientDurationSeconds: elapsedSeconds,
        },
      });

      setAssessmentResult(result);
      void CosmosQuizGuide.getInstance().handleAssessmentGraded(moduleId, result);

      // Trigger legacy callbacks for compatibility
      const legacyScore = result.score;
      const legacyTotal = result.totalPoints;
      if (onAssessmentCompleted) onAssessmentCompleted(result);
      if (onCompleteQuiz) onCompleteQuiz(legacyScore, legacyTotal);
      if (onComplete) onComplete(legacyScore, legacyTotal);
      if (onFinishQuiz) onFinishQuiz(legacyScore, legacyTotal);

      if (result.passed) {
        if (result.verifiedCompletionAwarded) {
          toast.success(`Module ${moduleId} Verified! Score: ${result.percentage}%`, {
            description:
              "Your official certified completion has been recorded to your student transcript.",
          });
        } else {
          toast.success(`Practice Knowledge Check Passed! Score: ${result.percentage}%`, {
            description: "Great work! Switch to Official Assessment mode to earn verified credit.",
          });
        }

        if (result.newStageBadgeAwarded) {
          toast.success(`Stage Achievement Unlocked!`, {
            description: `Congratulations! You have earned the ${result.newStageBadgeAwarded} badge.`,
          });
        }
      } else {
        toast.error(`Assessment Score: ${result.percentage}% (Need ${passingScorePct}%)`, {
          description: "Review the scientific explanations below and retry whenever you're ready.",
        });
      }
    } catch (err: any) {
      console.error("Submission grading error:", err);
      setError(err?.message || "Failed to grade assessment. Please retry.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    void loadAssessment(mode);
  };

  const handleSwitchMode = (newMode: AssessmentMode) => {
    if (newMode === mode) return;
    if (newMode === "official" && !isLoggedIn) {
      toast.info("Student Account Required for Certified Assessment", {
        description: "Sign in or create a free student profile to record verified credentials.",
      });
      return;
    }
    setMode(newMode);
  };

  // Register live quiz bridge with COSMOS Quiz Guide for voice answers and guided reading
  useEffect(() => {
    const unregister = CosmosQuizGuide.getInstance().registerQuizBridge({
      moduleId,
      mode,
      passingScorePct,
      getQuestions: () => questions,
      getSelectedAnswers: () => selectedAnswers,
      selectOption: (qId, optIdx) => {
        handleSelectOption(qId, optIdx);
      },
      submitAssessment: async () => {
        await handleSubmit();
      },
      retryAssessment: () => {
        handleRetry();
      },
      switchMode: (newMode) => {
        handleSwitchMode(newMode);
      },
    });
    return () => unregister();
  }, [moduleId, mode, passingScorePct, questions, selectedAnswers, allAnswered, submitting]);

  return (
    <div
      className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden"
      role="region"
      aria-label="Module Knowledge Assessment"
    >
      {/* Background celestial glow */}
      <div className="absolute top-0 right-0 -mr-24 -mt-24 w-80 h-80 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />

      {/* Header with Mode Toggle & Level Indicator */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 rounded-full uppercase">
              Authoritative Assessment
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-300 capitalize font-medium">
              Level: <strong className="text-cyan-300">{activeLevelRef.current}</strong>
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-400">Passing: {passingScorePct}%</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
            {moduleTitle
              ? `Module ${moduleId}: ${moduleTitle}`
              : `Module ${moduleId} Knowledge Check`}
          </h3>
        </div>

        {/* Mode Selector (Official Certification vs Interactive Practice) */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-white/10 self-start md:self-auto">
          <button
            type="button"
            onClick={() => handleSwitchMode("official")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              mode === "official"
                ? "bg-cyan-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <ShieldCheck className="size-3.5" />
            <span>Official Assessment</span>
          </button>
          <button
            type="button"
            onClick={() => handleSwitchMode("practice")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              mode === "practice"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <BookOpen className="size-3.5" />
            <span>Practice Mode</span>
          </button>
        </div>
      </div>

      {/* Mode notice banner */}
      <div className="my-4 text-xs">
        {mode === "official" ? (
          <div className="flex items-center gap-2 text-cyan-300 bg-cyan-950/30 border border-cyan-500/20 px-3.5 py-2 rounded-xl">
            <ShieldCheck className="size-4 text-cyan-400 flex-shrink-0" />
            <span>
              <strong>Verified Evaluation:</strong> Answers are securely graded by the backend.
              Scoring {passingScorePct}% or higher awards verified module completion.
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-amber-300 bg-amber-950/30 border border-amber-500/20 px-3.5 py-2 rounded-xl">
            <HelpCircle className="size-4 text-amber-400 flex-shrink-0" />
            <span>
              <strong>Practice Drill:</strong> Test your knowledge freely. Practice questions
              provide immediate learning feedback and do not affect official certification records.
            </span>
          </div>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <div className="size-10 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin mb-3" />
          <p className="text-sm font-semibold text-white">Loading Authorized Questions...</p>
          <p className="text-xs text-slate-400 mt-1">
            Calibrating question set for {activeLevelRef.current} level
          </p>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="my-6 rounded-2xl border border-rose-500/40 bg-rose-950/20 p-4 text-rose-300 text-xs">
          <div className="flex items-center gap-2 font-bold mb-1">
            <ShieldAlert className="size-4 text-rose-400" />
            <span>Assessment Error</span>
          </div>
          <p>{error}</p>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRetry}
            className="mt-3 border-rose-500/30 text-rose-200 hover:bg-rose-500/10"
          >
            Retry Loading
          </Button>
        </div>
      )}

      {/* Questions list */}
      {!loading && !error && questions.length > 0 && !assessmentResult && (
        <div className="space-y-6 mt-6" role="form" aria-label="Assessment questions">
          {questions.map((q, qIdx) => {
            const userAnswer = selectedAnswers[q.id];

            return (
              <div
                key={q.id}
                data-cosmos-question-id={q.id}
                data-cosmos-question-index={qIdx}
                className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 transition-all focus-within:border-cyan-500/50"
              >
                <div className="flex items-start gap-3">
                  <span
                    className="font-mono text-xs font-bold text-cyan-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-md flex-shrink-0"
                    aria-hidden="true"
                  >
                    Q{qIdx + 1}
                  </span>
                  <div className="flex-1">
                    <h4 className="text-sm sm:text-base font-bold text-white leading-snug">
                      {q.questionText}
                    </h4>

                    {/* Options list with accessible radiogroup */}
                    <div
                      className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5"
                      role="radiogroup"
                      aria-label={`Question ${qIdx + 1}: ${q.questionText}`}
                    >
                      {q.options.map((opt, optIdx) => {
                        const isSelected = userAnswer === optIdx;
                        const optionLetter = String.fromCharCode(65 + optIdx);

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            tabIndex={0}
                            onClick={() => handleSelectOption(q.id, optIdx)}
                            onKeyDown={(e) => handleKeyDown(e, q.id, optIdx)}
                            className={`p-3.5 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? "border-cyan-400 bg-cyan-950/40 text-cyan-200 font-semibold ring-1 ring-cyan-400/40"
                                : "border-white/10 bg-white/[0.02] text-slate-300 hover:bg-white/5 hover:text-white"
                            }`}
                          >
                            <span className="leading-snug flex items-center gap-2">
                              <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-cyan-300 flex-shrink-0">
                                {optionLetter}
                              </span>
                              <span>{opt}</span>
                            </span>
                            <div
                              className={`size-4 rounded-full border flex items-center justify-center ml-2 flex-shrink-0 ${
                                isSelected
                                  ? "border-cyan-400 bg-cyan-500 text-slate-950"
                                  : "border-white/20 bg-transparent"
                              }`}
                            >
                              {isSelected && <div className="size-1.5 rounded-full bg-slate-950" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Graded Results View */}
      {assessmentResult && (
        <div className="mt-6 space-y-6" aria-live="polite">
          {/* Result Summary Banner */}
          <div
            className={`rounded-2xl border p-6 backdrop-blur-xl ${
              assessmentResult.passed
                ? "border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-slate-900/80 to-slate-900/80 text-emerald-200"
                : "border-rose-500/40 bg-gradient-to-r from-rose-950/40 via-slate-900/80 to-slate-900/80 text-rose-200"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className={`size-14 rounded-2xl flex items-center justify-center flex-shrink-0 border ${
                    assessmentResult.passed
                      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                      : "bg-rose-500/20 border-rose-500/40 text-rose-400"
                  }`}
                >
                  {assessmentResult.passed ? (
                    <Award className="size-8" />
                  ) : (
                    <XCircle className="size-8" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                        assessmentResult.passed
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                          : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                      }`}
                    >
                      {assessmentResult.passed ? "Assessment Passed" : "Needs Review"}
                    </span>
                    <span className="text-xs text-slate-400">
                      Requirement: {assessmentResult.passingScorePct}%
                    </span>
                  </div>
                  <h4 className="text-2xl font-extrabold text-white mt-1">
                    Score: {assessmentResult.percentage}% ({assessmentResult.score} /{" "}
                    {assessmentResult.totalPoints})
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {assessmentResult.passed
                      ? assessmentResult.verifiedCompletionAwarded
                        ? "Official verified module completion recorded. Eligible toward Stage Achievement and Course Certificate."
                        : "Practice check passed! Try Official Assessment mode to earn certified badge credit."
                      : "You can review the scientific explanations below and retry the assessment anytime."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  className="border-white/20 text-slate-200 hover:text-white"
                >
                  <RotateCcw className="size-3.5 mr-1.5" />
                  <span>Retry Assessment</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Targeted Study Recommendations if failed */}
          {assessmentResult.recommendations &&
            assessmentResult.recommendations.length > 0 &&
            !assessmentResult.passed && (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-5 text-amber-200 text-xs">
                <div className="flex items-center gap-2 font-bold text-sm mb-2 text-amber-300">
                  <BookOpen className="size-4" />
                  <span>Recommended Review Concepts</span>
                </div>
                <ul className="space-y-2">
                  {assessmentResult.recommendations.map((rec, i) => (
                    <li
                      key={i}
                      className="flex items-start justify-between gap-2 p-2 rounded-xl bg-white/[0.03]"
                    >
                      <div>
                        <strong className="text-white block">{rec.title}</strong>
                        <span className="text-slate-300">{rec.reviewNote}</span>
                      </div>
                      {onReviewLesson && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onReviewLesson(rec.lessonId)}
                          className="text-xs text-amber-300 hover:text-white flex-shrink-0"
                        >
                          <span>Review</span>
                          <ChevronRight className="size-3 ml-1" />
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

          {/* Detailed Question Feedback with Scientific Citations */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
              Question-by-Question Scientific Feedback
            </h4>
            {assessmentResult.feedback.map((item, idx) => (
              <div
                key={item.questionId || idx}
                className={`rounded-2xl border p-5 transition-all ${
                  item.isCorrect
                    ? "border-emerald-500/40 bg-emerald-950/10"
                    : "border-rose-500/40 bg-rose-950/10"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {item.isCorrect ? (
                      <CheckCircle2 className="size-5 text-emerald-400" />
                    ) : (
                      <XCircle className="size-5 text-rose-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h5 className="text-sm font-bold text-white leading-snug">
                      {item.questionText}
                    </h5>

                    <div className="mt-3 rounded-xl p-3.5 text-xs leading-relaxed border bg-slate-950/60 border-white/10 text-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`font-bold ${
                            item.isCorrect ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {item.isCorrect
                            ? "Correct Scientific Principle:"
                            : "Correct Scientific Finding:"}
                        </span>
                        {item.sourceReference && (
                          <span className="text-[11px] font-mono text-cyan-300/80">
                            Ref: {item.sourceReference}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-300">{item.explanation}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer controls */}
      {!loading && !error && !assessmentResult && (
        <div className="mt-8 pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            {!allAnswered
              ? `Please answer all ${questions.length} questions to submit`
              : "All questions answered. Ready for authoritative evaluation."}
          </div>

          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={!allAnswered || submitting}
            className={`font-bold shadow-md transition-all ${
              mode === "official"
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/25 border-none"
                : "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/25 border-none"
            }`}
          >
            {submitting ? (
              <>
                <div className="size-4 rounded-full border-2 border-white/20 border-t-white animate-spin mr-2" />
                <span>Evaluating on Server...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="size-4 mr-2" />
                <span>
                  {mode === "official" ? "Submit Official Assessment" : "Check Practice Answers"}
                </span>
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
