import React, { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Award,
  ArrowRight,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DARK_SECTOR_MYTHS,
  DarkSectorMyth,
} from "@/lib/academy/lessons/module-16-dark-matter-energy";

interface DarkSectorMythbustersProps {
  onComplete?: () => void;
}

export function DarkSectorMythbusters({ onComplete }: DarkSectorMythbustersProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, boolean>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [score, setScore] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const currentMyth = DARK_SECTOR_MYTHS[currentIndex];
  const hasAnsweredCurrent = revealed[currentMyth.id];

  const handleVote = (voteIsFact: boolean) => {
    if (hasAnsweredCurrent) return;

    const isCorrect = voteIsFact === currentMyth.isFact;
    setUserAnswers((prev) => ({ ...prev, [currentMyth.id]: voteIsFact }));
    setRevealed((prev) => ({ ...prev, [currentMyth.id]: true }));

    if (isCorrect) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < DARK_SECTOR_MYTHS.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setIsFinished(true);
      onComplete?.();
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setUserAnswers({});
    setRevealed({});
    setScore(0);
    setIsFinished(false);
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full uppercase">
              Misconception Buster
            </span>
            <span className="text-xs text-slate-400">
              Separating Proven Science from Popular Myths
            </span>
          </div>
          <h3 className="text-2xl font-black text-white">Dark Sector Mythbuster Challenge</h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-0.5 max-w-xl">
            Evaluate common claims about dark matter and dark energy. Can you tell scientific facts
            from popular misconceptions?
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] uppercase text-slate-400 block font-mono">
              Current Score
            </span>
            <span className="text-lg font-mono font-bold text-amber-300">
              {score} / {DARK_SECTOR_MYTHS.length}
            </span>
          </div>
        </div>
      </div>

      {!isFinished ? (
        <div className="space-y-6">
          {/* Progress dots */}
          <div className="flex items-center gap-1.5 justify-center">
            {DARK_SECTOR_MYTHS.map((m, idx) => (
              <span
                key={m.id}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentIndex
                    ? "w-8 bg-amber-400"
                    : revealed[m.id]
                      ? userAnswers[m.id] === m.isFact
                        ? "w-4 bg-emerald-500"
                        : "w-4 bg-rose-500"
                      : "w-3 bg-white/10"
                }`}
              />
            ))}
          </div>

          {/* Current Question Card */}
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-white/10 space-y-6">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>
                CLAIM {currentIndex + 1} OF {DARK_SECTOR_MYTHS.length}
              </span>
              <span>Evaluate Carefully</span>
            </div>

            <blockquote className="text-lg sm:text-2xl font-bold text-white leading-snug border-l-4 border-amber-500 pl-4 py-1">
              &ldquo;{currentMyth.claim}&rdquo;
            </blockquote>

            {/* Voting Buttons */}
            {!hasAnsweredCurrent ? (
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                <Button
                  size="lg"
                  onClick={() => handleVote(true)}
                  className="w-full sm:w-1/2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20"
                >
                  <CheckCircle2 className="size-4 mr-2" />
                  <span>Scientific Fact</span>
                </Button>

                <Button
                  size="lg"
                  onClick={() => handleVote(false)}
                  className="w-full sm:w-1/2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-600/20"
                >
                  <XCircle className="size-4 mr-2" />
                  <span>Cosmic Myth</span>
                </Button>
              </div>
            ) : (
              /* Revealed Verdict & Explanation */
              <div className="space-y-4 pt-2">
                <div
                  className={`p-4 rounded-xl border flex items-center justify-between ${
                    userAnswers[currentMyth.id] === currentMyth.isFact
                      ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-300"
                      : "bg-rose-950/30 border-rose-500/40 text-rose-300"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {userAnswers[currentMyth.id] === currentMyth.isFact ? (
                      <CheckCircle2 className="size-5 text-emerald-400" />
                    ) : (
                      <XCircle className="size-5 text-rose-400" />
                    )}
                    <span className="font-bold text-sm">
                      {userAnswers[currentMyth.id] === currentMyth.isFact
                        ? "Correct! You spotted it accurately."
                        : `Not quite! This is actually a ${currentMyth.verdict}.`}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-white/10 uppercase">
                    {currentMyth.verdict}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-slate-200 leading-relaxed bg-white/[0.02] p-4 rounded-xl border border-white/5">
                  <p>{currentMyth.explanation}</p>
                  <div className="pt-2 border-t border-white/10 text-xs text-amber-300 flex items-start gap-1.5">
                    <Info className="size-3.5 shrink-0 mt-0.5 text-amber-400" />
                    <span>
                      <strong>Observational Proof: </strong>
                      {currentMyth.evidence}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    onClick={handleNext}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs"
                  >
                    <span>
                      {currentIndex < DARK_SECTOR_MYTHS.length - 1
                        ? "Next Claim →"
                        : "See Final Score"}
                    </span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Final Completion Score Card */
        <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-950/40 to-slate-900/60 border border-indigo-500/30 text-center space-y-5">
          <div className="size-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
            <Award className="size-8" />
          </div>

          <div>
            <h4 className="text-2xl font-black text-white">Challenge Completed!</h4>
            <p className="text-slate-300 text-sm mt-1">
              You scored <strong className="text-amber-400 font-mono text-base">{score}</strong> out
              of <strong className="font-mono text-base">{DARK_SECTOR_MYTHS.length}</strong> on the
              Dark Sector Mythbuster test.
            </p>
          </div>

          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {score >= 5
              ? "Astrophysicist-grade clarity! You have completely separated the proven gravitational observations of dark matter from the repulsive vacuum physics of dark energy."
              : "Great scientific effort! Review the lesson tabs to master why dark matter clumps and dark energy accelerates space."}
          </p>

          <div className="flex justify-center gap-3 pt-2">
            <Button
              onClick={handleRestart}
              variant="outline"
              className="border-white/10 text-slate-300 hover:text-white text-xs"
            >
              <RotateCcw className="size-3.5 mr-1.5" />
              <span>Retry Challenge</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
