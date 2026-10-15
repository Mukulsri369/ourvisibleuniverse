import React, { useState } from "react";
import { HOW_FAR_INTO_THE_PAST_CHALLENGES } from "@/lib/academy/lessons/module-04-light-time";
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
  Zap,
} from "lucide-react";

export function HowFarIntoThePastChallenge({
  onCompleteChallenge,
}: {
  onCompleteChallenge?: () => void;
}) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const challenge = HOW_FAR_INTO_THE_PAST_CHALLENGES[currentQuestionIndex];

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
    if (currentQuestionIndex < HOW_FAR_INTO_THE_PAST_CHALLENGES.length - 1) {
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
    const isPerfect = score === HOW_FAR_INTO_THE_PAST_CHALLENGES.length;
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
            {isPerfect ? "Master of Cosmic Time!" : "Cosmic Lookback Explorer"}
          </h3>
          <p className="text-sm text-slate-300 max-w-md mx-auto">
            You scored{" "}
            <span className="font-mono font-bold text-cyan-300">
              {score} / {HOW_FAR_INTO_THE_PAST_CHALLENGES.length}
            </span>
            . You have unlocked how light acts as the ultimate time machine connecting our eyes to
            ancient cosmic epochs.
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

  const selectedOpt = challenge.options.find((o) => o.id === selectedOptionId);
  const isCorrect = selectedOptionId === challenge.correctOptionId;

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-md p-6 sm:p-8 space-y-6 shadow-2xl">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-1">
            <Clock className="size-3.5" />
            <span>Interactive Lookback Challenge</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white">
            "How Far Into the Past?"
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold text-slate-300 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
            Question {currentQuestionIndex + 1} of {HOW_FAR_INTO_THE_PAST_CHALLENGES.length}
          </span>
          <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 rounded-full">
            Score: {score}
          </span>
        </div>
      </div>

      {/* Scenario Card */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-white/10 space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-cyan-400 font-bold uppercase">Observing Target:</span>
          <span className="text-slate-400">Distance: {challenge.distanceStr}</span>
        </div>

        <h4 className="text-lg sm:text-xl font-bold text-white leading-snug">
          {challenge.scenario}
        </h4>

        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-slate-300 font-medium">
          <span className="text-slate-400 block mb-0.5 text-[11px] uppercase font-bold">
            Historical Clue:
          </span>
          {challenge.historicalEventEarth}
        </div>
      </div>

      {/* Options List */}
      <div className="space-y-2.5">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          Select How Long Ago This Light Departed:
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {challenge.options.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            const showCorrect = isAnswerSubmitted && opt.isCorrect;
            const showIncorrect = isAnswerSubmitted && isSelected && !opt.isCorrect;

            let buttonStyle =
              "bg-white/[0.02] border-white/10 text-slate-300 hover:bg-white/5 hover:border-white/20";
            if (isSelected && !isAnswerSubmitted) {
              buttonStyle = "bg-cyan-500/20 border-cyan-400 text-white ring-1 ring-cyan-400";
            } else if (showCorrect) {
              buttonStyle = "bg-emerald-500/20 border-emerald-400 text-emerald-200 font-bold";
            } else if (showIncorrect) {
              buttonStyle = "bg-rose-500/20 border-rose-400 text-rose-200";
            }

            return (
              <button
                key={opt.id}
                disabled={isAnswerSubmitted}
                onClick={() => handleSelectOption(opt.id)}
                className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between ${buttonStyle}`}
              >
                <span className="text-sm font-medium">{opt.label}</span>
                {showCorrect && <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />}
                {showIncorrect && <XCircle className="size-4 text-rose-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Feedback & Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="text-xs">
          {isAnswerSubmitted && selectedOpt && (
            <div
              className={`p-3 rounded-xl border flex items-center gap-2 ${
                isCorrect
                  ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-300"
                  : "bg-rose-950/30 border-rose-500/30 text-rose-300"
              }`}
            >
              {isCorrect ? (
                <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
              ) : (
                <XCircle className="size-4 shrink-0 text-rose-400" />
              )}
              <span>{selectedOpt.feedback}</span>
            </div>
          )}
        </div>

        <div className="shrink-0 flex items-center gap-2">
          {!isAnswerSubmitted ? (
            <Button
              disabled={!selectedOptionId}
              onClick={handleSubmitAnswer}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6"
            >
              Verify Answer
            </Button>
          ) : (
            <Button
              onClick={handleNextQuestion}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-6"
            >
              <span>
                {currentQuestionIndex < HOW_FAR_INTO_THE_PAST_CHALLENGES.length - 1
                  ? "Next Question"
                  : "View Results"}
              </span>
              <ArrowRight className="size-4 ml-1.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
