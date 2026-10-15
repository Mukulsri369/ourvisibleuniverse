import React, { useState } from "react";
import {
  OUTCOME_CHALLENGES,
  type OutcomeChallenge,
} from "@/lib/academy/lessons/module-10-stellar-evolution";
import {
  Trophy,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Flame,
  Atom,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function StellarOutcomePredictor() {
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [history, setHistory] = useState<boolean[]>([]);

  const challenge: OutcomeChallenge = OUTCOME_CHALLENGES[currentChallengeIndex];
  const isFinished = currentChallengeIndex >= OUTCOME_CHALLENGES.length;

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    const isCorrect = idx === challenge.correctIndex;
    if (isCorrect) {
      setScore((s) => s + 1);
    }
    setHistory((h) => [...h, isCorrect]);
  };

  const handleNext = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    setCurrentChallengeIndex((prev) => prev + 1);
  };

  const handleRestart = () => {
    setCurrentChallengeIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setHistory([]);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Trophy className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-semibold text-white">Stellar Fate Predictor Challenge</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Analyze the initial stellar parameters and predict the star's evolutionary fate and
            remnant
          </p>
        </div>

        {/* Score indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {OUTCOME_CHALLENGES.map((_, i) => (
              <span
                key={i}
                className={`w-2.5 h-2.5 rounded-full ${
                  i < history.length
                    ? history[i]
                      ? "bg-emerald-500"
                      : "bg-rose-500"
                    : i === currentChallengeIndex
                      ? "bg-amber-400 animate-pulse"
                      : "bg-slate-700"
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-mono text-slate-300">
            Score: <strong className="text-emerald-400">{score}</strong> /{" "}
            {OUTCOME_CHALLENGES.length}
          </span>
        </div>
      </div>

      {/* Challenge Card */}
      {!isFinished ? (
        <div className="space-y-6">
          {/* Target Star Dossier */}
          <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Target Progenitor #{currentChallengeIndex + 1}
                </span>
                <h4 className="text-lg font-bold text-white mt-1">{challenge.starName}</h4>
                <p className="text-xs text-slate-400">{challenge.spectralType}</p>
              </div>

              <div className="text-right">
                <span className="text-2xl font-bold font-mono text-amber-400">
                  {challenge.initialMass} M☉
                </span>
                <span className="block text-[10px] text-slate-400">Birth Mass</span>
              </div>
            </div>

            {/* Astrophysical Clues */}
            <div>
              <span className="text-xs text-slate-400 font-medium block mb-2">
                Astrophysical Observations & Clues:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {challenge.clues.map((clue, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 flex items-start gap-2"
                  >
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{clue}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Options to Choose */}
          <div className="space-y-3">
            <span className="text-xs font-medium text-slate-300 block">
              Predict the Ultimate Destiny & End Remnant:
            </span>

            <div className="grid grid-cols-1 gap-3">
              {challenge.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === challenge.correctIndex;

                let btnStyle = "border-slate-800 bg-slate-950/60 hover:bg-slate-900 text-slate-200";

                if (isAnswered) {
                  if (isCorrect) {
                    btnStyle = "border-emerald-500/60 bg-emerald-950/40 text-emerald-200";
                  } else if (isSelected) {
                    btnStyle = "border-rose-500/60 bg-rose-950/40 text-rose-200";
                  } else {
                    btnStyle = "border-slate-800/40 bg-slate-950/30 text-slate-500 opacity-60";
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between gap-4 ${btnStyle}`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{opt.remnant}</span>
                        {opt.supernova ? (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            Supernova Explosion
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                            Non-Supernova / Gentle Ejection
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">Mechanism: {opt.deathMechanism}</p>
                    </div>

                    {isAnswered && (
                      <div>
                        {isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        ) : isSelected ? (
                          <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                        ) : null}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Explanation Reveal */}
          {isAnswered && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 text-slate-200 font-semibold">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Astrophysical Explanation:
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                {challenge.scientificExplanation}
              </p>
              <div className="pt-2 flex justify-end">
                <Button
                  size="sm"
                  onClick={handleNext}
                  className="bg-orange-500 hover:bg-orange-600 text-white text-xs gap-1"
                >
                  Next Star Dossier <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Summary Screen when finished */
        <div className="p-8 text-center space-y-4 bg-slate-950/80 rounded-xl border border-slate-800">
          <div className="inline-flex p-3 rounded-full bg-emerald-500/20 text-emerald-400">
            <Trophy className="w-8 h-8" />
          </div>
          <h4 className="text-xl font-bold text-white">Challenge Completed!</h4>
          <p className="text-sm text-slate-300 max-w-md mx-auto">
            You predicted the fate of {OUTCOME_CHALLENGES.length} stars with a final score of{" "}
            <span className="font-bold text-emerald-400 font-mono text-base">
              {score} / {OUTCOME_CHALLENGES.length}
            </span>
            !
          </p>
          <div className="pt-3">
            <Button
              onClick={handleRestart}
              className="bg-slate-800 hover:bg-slate-700 text-white gap-2 text-xs"
            >
              <RotateCcw className="w-4 h-4" /> Try Again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
