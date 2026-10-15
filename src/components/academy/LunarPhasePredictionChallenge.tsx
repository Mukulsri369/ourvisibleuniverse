import React, { useState } from "react";
import { LUNAR_PHASE_CHALLENGES } from "@/lib/academy/lessons/module-05-earth-moon";
import { Button } from "@/components/ui/button";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Trophy,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Moon,
  Sun,
  Compass,
} from "lucide-react";

export function LunarPhasePredictionChallenge({
  onCompleteChallenge,
}: {
  onCompleteChallenge?: () => void;
}) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const challenge = LUNAR_PHASE_CHALLENGES[currentQuestionIndex];

  const handleSelectOption = (optionId: string) => {
    if (isAnswerSubmitted) return;
    setSelectedOptionId(optionId);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOptionId || isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);
    if (selectedOptionId === challenge.correctOptionId) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < LUNAR_PHASE_CHALLENGES.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setIsAnswerSubmitted(false);
    } else {
      setIsFinished(true);
      onCompleteChallenge?.();
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedOptionId(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setIsFinished(false);
  };

  if (isFinished) {
    const isPerfect = score === LUNAR_PHASE_CHALLENGES.length;
    return (
      <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-cyan-950/40 via-slate-900 to-slate-950 p-8 sm:p-10 text-center space-y-6 shadow-2xl">
        <div className="size-16 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center mx-auto text-cyan-300">
          <Trophy className="size-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
            Challenge Completed!
          </span>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
            {isPerfect ? "Master of Orbital Mechanics!" : "Astrodynamics Explorer"}
          </h3>
          <p className="text-sm text-slate-300 max-w-md mx-auto">
            You scored{" "}
            <span className="font-mono font-bold text-cyan-300">
              {score} / {LUNAR_PHASE_CHALLENGES.length}
            </span>
            . You have mastered the geometry of lunar phases, axial tilt seasons, and eclipse
            syzygy.
          </p>
        </div>

        <div className="flex justify-center gap-3">
          <Button
            onClick={handleRestart}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <RotateCcw className="size-4 mr-1.5" /> Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-cyan-500/30 bg-slate-950 p-6 sm:p-8 space-y-6 shadow-2xl">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <Moon className="size-5 text-amber-400" />
          <h3 className="text-lg sm:text-xl font-bold text-white">
            Eclipse Hunter & Lunar Phase Challenge
          </h3>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
          <span>Scenario:</span>
          <span className="font-bold text-cyan-400">
            {currentQuestionIndex + 1} / {LUNAR_PHASE_CHALLENGES.length}
          </span>
          <span>•</span>
          <span className="text-emerald-400 font-bold">Score: {score}</span>
        </div>
      </div>

      {/* Scenario Presentation Card */}
      <div className="space-y-4">
        <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 space-y-1">
          <span className="text-[10px] font-mono uppercase font-bold text-cyan-400">
            Astronomical Situation:
          </span>
          <p className="text-sm sm:text-base font-semibold text-slate-100">{challenge.scenario}</p>
        </div>

        <p className="text-sm font-bold text-white pt-1">{challenge.question}</p>

        {/* Options List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {challenge.options.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            const isCorrect = opt.id === challenge.correctOptionId;

            let optionClass =
              "border-white/10 bg-white/[0.02] text-slate-200 hover:bg-white/5 hover:border-white/20";

            if (isSelected && !isAnswerSubmitted) {
              optionClass = "border-cyan-400 bg-cyan-500/10 text-white ring-1 ring-cyan-400";
            } else if (isAnswerSubmitted) {
              if (isCorrect) {
                optionClass =
                  "border-emerald-500/80 bg-emerald-950/30 text-emerald-200 ring-1 ring-emerald-500";
              } else if (isSelected && !isCorrect) {
                optionClass =
                  "border-rose-500/80 bg-rose-950/30 text-rose-200 ring-1 ring-rose-500";
              }
            }

            return (
              <button
                key={opt.id}
                onClick={() => handleSelectOption(opt.id)}
                disabled={isAnswerSubmitted}
                className={`p-4 rounded-xl border text-left transition-all flex items-start justify-between gap-3 ${optionClass}`}
              >
                <div className="space-y-1">
                  <span className="text-xs sm:text-sm font-semibold block">{opt.label}</span>
                  {isAnswerSubmitted && isSelected && (
                    <span className="text-xs text-slate-300 block">{opt.feedback}</span>
                  )}
                </div>

                {isAnswerSubmitted && isCorrect && (
                  <CheckCircle2 className="size-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                )}
                {isAnswerSubmitted && isSelected && !isCorrect && (
                  <XCircle className="size-5 text-rose-400 flex-shrink-0 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Fact Callout when answered */}
      {isAnswerSubmitted && (
        <div className="p-4 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
          <Sparkles className="size-4 text-cyan-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="text-cyan-300 font-bold block mb-0.5">
              Orbital Astrodynamics Fact:
            </span>
            <span>{challenge.astronomicalFact}</span>
          </div>
        </div>
      )}

      {/* Footer Controls */}
      <div className="flex items-center justify-between pt-2 border-t border-white/10">
        <span className="text-xs text-slate-400">
          {isAnswerSubmitted
            ? selectedOptionId === challenge.correctOptionId
              ? "✓ Correct answer recorded!"
              : "Review the explanation above"
            : "Select your prediction to verify"}
        </span>

        {!isAnswerSubmitted ? (
          <Button
            onClick={handleSubmitAnswer}
            disabled={!selectedOptionId}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold disabled:opacity-40"
          >
            Check Prediction
          </Button>
        ) : (
          <Button
            onClick={handleNextQuestion}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold"
          >
            {currentQuestionIndex < LUNAR_PHASE_CHALLENGES.length - 1 ? (
              <>
                Next Scenario <ArrowRight className="size-4 ml-1.5" />
              </>
            ) : (
              <>
                See Final Results <Trophy className="size-4 ml-1.5" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
