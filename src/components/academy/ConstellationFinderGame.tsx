import React, { useState, useMemo } from "react";
import {
  PLANETARIUM_CONSTELLATIONS,
  PLANETARIUM_STARS,
  PlanetariumConstellation,
} from "@/lib/academy/lessons/module-02-night-sky";
import type { LearningLevel } from "@/lib/academy/types";
import {
  Trophy,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  Compass,
  ArrowRight,
  Star,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConstellationFinderGameProps {
  level: LearningLevel;
  onFinishGame?: (score: number) => void;
}

interface GameTarget {
  constellation: PlanetariumConstellation;
  clue: string;
  mythHint: string;
  pointerHint: string;
}

export function ConstellationFinderGame({ level, onFinishGame }: ConstellationFinderGameProps) {
  const [hemisphere, setHemisphere] = useState<"northern" | "southern">("northern");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [hasGuessed, setHasGuessed] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Targets based on hemisphere
  const targets: GameTarget[] = useMemo(() => {
    const list = PLANETARIUM_CONSTELLATIONS.filter((c) => {
      if (hemisphere === "northern")
        return c.hemisphere === "northern" || c.hemisphere === "equatorial";
      return c.hemisphere === "southern" || c.hemisphere === "equatorial";
    });

    return list.map((c) => {
      let clue = "";
      if (c.id === "ursa-major")
        clue =
          "Look for the famous 7-star giant ladle or spoon whose two outer bowl stars point to the North Star!";
      else if (c.id === "orion")
        clue =
          "Find the legendary winter hunter with three bright stars in a neat row making his belt!";
      else if (c.id === "cassiopeia")
        clue =
          "Look for the majestic queen's throne shaped like a bright letter 'W' or 'M' in the northern sky!";
      else if (c.id === "crux")
        clue =
          "Locate the famous 4-star kite/cross pattern whose long axis points straight toward True South!";
      else if (c.id === "centaurus")
        clue = "Find the wise centaur guarding the southern cross with Alpha and Beta Centauri!";
      else if (c.id === "scorpius")
        clue =
          "Spot the dangerous curved scorpion tail with ruby-red Antares beating at its heart!";
      else clue = c.description;

      return {
        constellation: c,
        clue,
        mythHint: c.lore,
        pointerHint: `Season: ${c.season} • Stars: ${c.starIds.length}`,
      };
    });
  }, [hemisphere]);

  const currentTarget = targets[currentIndex];

  const handleSelectOption = (constellationId: string) => {
    if (hasGuessed || !currentTarget) return;
    setSelectedId(constellationId);
    setHasGuessed(true);
    const correct = constellationId === currentTarget.constellation.id;
    setIsCorrect(correct);
    if (correct) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < targets.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedId(null);
      setHasGuessed(false);
      setIsCorrect(false);
      setShowHint(false);
    } else {
      setGameFinished(true);
      onFinishGame?.(score + (isCorrect ? 1 : 0));
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedId(null);
    setScore(0);
    setHasGuessed(false);
    setIsCorrect(false);
    setGameFinished(false);
    setShowHint(false);
  };

  return (
    <div className="rounded-3xl border border-cyan-500/30 bg-slate-900/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
      {/* Game Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 rounded-full uppercase">
              Interactive Mission
            </span>
            <span className="text-xs text-amber-300 font-semibold flex items-center gap-1">
              <Trophy className="size-3.5" />
              Score: {score}/{targets.length}
            </span>
          </div>
          <h3 className="text-2xl font-extrabold text-white">Find the Constellation</h3>
        </div>

        {/* Hemisphere Selector */}
        <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-white/10 text-xs">
          <button
            onClick={() => {
              setHemisphere("northern");
              handleRestart();
            }}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              hemisphere === "northern"
                ? "bg-cyan-500 text-slate-950 shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Northern Sky Mission
          </button>
          <button
            onClick={() => {
              setHemisphere("southern");
              handleRestart();
            }}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              hemisphere === "southern"
                ? "bg-cyan-500 text-slate-950 shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Southern Sky Mission
          </button>
        </div>
      </div>

      {!gameFinished && currentTarget ? (
        <div className="space-y-6">
          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-400">
              <span>
                Constellation {currentIndex + 1} of {targets.length}
              </span>
              <span>
                Level:{" "}
                {level === "junior"
                  ? "Space Cadet"
                  : level === "explorer"
                    ? "Space Explorer"
                    : "Astronomer"}
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / targets.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Mission Challenge Card */}
          <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-5 sm:p-6 space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="size-10 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                <Compass className="size-5" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                  Observational Clue
                </span>
                <p className="text-sm sm:text-base text-white font-medium leading-relaxed">
                  {currentTarget.clue}
                </p>
              </div>
            </div>

            {/* Hint toggle for younger learners */}
            {level !== "astronomer" && (
              <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors"
                >
                  <HelpCircle className="size-3.5" />
                  <span>{showHint ? "Hide Ancient Legend" : "Need a mythological hint?"}</span>
                </button>
                <span className="text-[11px] text-slate-400">{currentTarget.pointerHint}</span>
              </div>
            )}

            {showHint && (
              <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-xs text-indigo-200">
                <strong className="block text-indigo-300 font-bold mb-0.5">Ancient Legend:</strong>
                {currentTarget.mythHint}
              </div>
            )}
          </div>

          {/* Constellation Choice Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {targets.map((t) => {
              const c = t.constellation;
              const isSelected = selectedId === c.id;
              const isActualTarget = c.id === currentTarget.constellation.id;

              let btnStyle =
                "bg-white/[0.02] border-white/10 text-slate-200 hover:bg-white/5 hover:border-cyan-500/40";
              if (hasGuessed) {
                if (isActualTarget) {
                  btnStyle =
                    "bg-emerald-500/20 border-emerald-400 text-emerald-200 ring-1 ring-emerald-400 font-bold";
                } else if (isSelected) {
                  btnStyle = "bg-rose-500/20 border-rose-400 text-rose-200";
                } else {
                  btnStyle = "opacity-40 border-white/5 text-slate-500";
                }
              }

              return (
                <button
                  key={c.id}
                  disabled={hasGuessed}
                  onClick={() => handleSelectOption(c.id)}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${btnStyle}`}
                >
                  <div>
                    <h4 className="text-base font-bold">{c.name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{c.latinName}</p>
                  </div>
                  {hasGuessed && isActualTarget && (
                    <CheckCircle2 className="size-5 text-emerald-400 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Result Feedback Banner */}
          {hasGuessed && (
            <div
              className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in ${
                isCorrect
                  ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-100"
                  : "bg-rose-950/40 border-rose-500/40 text-rose-100"
              }`}
            >
              <div>
                <span className="font-bold text-sm block">
                  {isCorrect
                    ? "✨ Spot on, Celestial Navigator!"
                    : "Almost! Check the pattern again."}
                </span>
                <p className="text-xs text-slate-300 mt-1 max-w-xl">
                  {currentTarget.constellation.description}
                </p>
              </div>

              <Button
                onClick={handleNext}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex-shrink-0"
              >
                <span>{currentIndex + 1 < targets.length ? "Next Target" : "View Results"}</span>
                <ArrowRight className="size-4 ml-1.5" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        /* Victory / Finish Screen */
        <div className="py-10 text-center space-y-5">
          <div className="size-16 rounded-3xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center mx-auto">
            <Trophy className="size-8" />
          </div>

          <div>
            <h4 className="text-3xl font-extrabold text-white">Mission Accomplished!</h4>
            <p className="text-sm text-slate-300 mt-1">
              You scored <span className="font-mono font-bold text-amber-300">{score}</span> out of{" "}
              <span className="font-mono font-bold">{targets.length}</span> constellations
              correctly!
            </p>
          </div>

          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            You now know how to locate the pointer stars, identify major northern and southern
            landmarks, and recognize line-of-sight asterisms across the night sky.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              onClick={handleRestart}
              variant="outline"
              className="border-white/10 text-white"
            >
              <RotateCcw className="size-4 mr-2" />
              <span>Play Again</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
