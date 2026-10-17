import React, { useState } from "react";
import {
  EXOPLANET_MYSTERY_CHALLENGES,
  type ExoplanetMysteryChallenge,
} from "@/lib/academy/lessons/module-12-exoplanets";
import {
  Trophy,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Search,
  Activity,
  Layers,
  Thermometer,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExoplanetDetectiveGameProps {
  onComplete?: (score: number, total: number) => void;
}

export function ExoplanetDetectiveGame({ onComplete }: ExoplanetDetectiveGameProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedPlanetType, setSelectedPlanetType] = useState<string | null>(null);
  const [selectedHabitableStatus, setSelectedHabitableStatus] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [completed, setCompleted] = useState<boolean>(false);

  const currentChallenge = EXOPLANET_MYSTERY_CHALLENGES[currentIndex];

  const handleSubmit = () => {
    if (!selectedPlanetType || !selectedHabitableStatus) return;

    const isTypeCorrect = selectedPlanetType === currentChallenge.correctPlanetType;
    const isHabCorrect = selectedHabitableStatus === currentChallenge.correctHabitableStatus;

    if (isTypeCorrect && isHabCorrect) {
      setScore((prev) => prev + 1);
    }

    setIsAnswerSubmitted(true);
  };

  const handleNext = () => {
    if (currentIndex + 1 < EXOPLANET_MYSTERY_CHALLENGES.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedPlanetType(null);
      setSelectedHabitableStatus(null);
      setIsAnswerSubmitted(false);
    } else {
      setCompleted(true);
      if (onComplete) {
        onComplete(score, EXOPLANET_MYSTERY_CHALLENGES.length);
      }
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setSelectedPlanetType(null);
    setSelectedHabitableStatus(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setCompleted(false);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold mb-2">
            <Search className="w-3.5 h-3.5" />
            Interactive Challenge
          </div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            Exoplanet Detective: Mystery Signal Analysis
          </h3>
          <p className="text-xs sm:text-sm text-slate-300">
            Analyze photometric light curves, Doppler wobbles, and stellar temperatures to classify
            unknown alien worlds.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Mission Progress
            </div>
            <div className="text-sm font-bold text-white font-mono">
              Target {currentIndex + 1} of {EXOPLANET_MYSTERY_CHALLENGES.length}
            </div>
          </div>
          <div className="h-8 w-[1px] bg-slate-800" />
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Score
            </div>
            <div className="text-sm font-bold text-cyan-400 font-mono">
              {score} / {EXOPLANET_MYSTERY_CHALLENGES.length}
            </div>
          </div>
        </div>
      </div>

      {completed ? (
        /* Completion Card */
        <div className="text-center py-10 space-y-6">
          <div className="w-16 h-16 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center mx-auto">
            <Trophy className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h4 className="text-2xl font-bold text-white">Observatory Missions Completed!</h4>
            <p className="text-sm text-slate-300 max-w-md mx-auto">
              You correctly classified {score} out of {EXOPLANET_MYSTERY_CHALLENGES.length} mystery
              exoplanet targets using real telescope telemetry.
            </p>
          </div>
          <Button
            onClick={handleReset}
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-6"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Play Detective Again
          </Button>
        </div>
      ) : (
        /* Active Target Challenge */
        <div className="space-y-6">
          {/* Signal Evidence Dossier */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div>
                <span className="text-xs font-mono text-cyan-400 block font-semibold">
                  CLASSIFIED SIGNAL DATA
                </span>
                <h4 className="text-lg font-bold text-white">{currentChallenge.codename}</h4>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-amber-300 font-mono">
                Host: {currentChallenge.stellarType}
              </span>
            </div>

            {/* Evidence Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-mono uppercase block flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  Transit Photometry Dip
                </span>
                <div className="text-sm font-bold text-emerald-400 font-mono">
                  {currentChallenge.measuredTransitDepthPercent > 0
                    ? `${currentChallenge.measuredTransitDepthPercent}% (Depth)`
                    : "No Transit Detected"}
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  {currentChallenge.lightCurveDescription}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-mono uppercase block flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Doppler Radial Velocity Wobble
                </span>
                <div className="text-sm font-bold text-amber-400 font-mono">
                  K = {currentChallenge.measuredRadialVelocitySemiAmpMs} m/s
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  {currentChallenge.radialVelocityCurveDescription}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-mono uppercase block flex items-center gap-1.5">
                  <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
                  Orbital Period & Equilibrium Temp
                </span>
                <div className="text-sm font-bold text-cyan-400 font-mono">
                  P = {currentChallenge.measuredOrbitalPeriodDays} days | T_eq ={" "}
                  {currentChallenge.calculatedEquilibriumTempK} K
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  Period implies semi-major axis; equilibrium temperature accounts for host star
                  luminosity.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Classification Questions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Question 1: Planet Type */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <label className="text-xs font-bold text-white block">
                1. Based on transit depth and radial velocity, what planet category is this?
              </label>
              <div className="space-y-2">
                {currentChallenge.optionsPlanetType.map((opt) => (
                  <button
                    key={opt.id}
                    disabled={isAnswerSubmitted}
                    onClick={() => setSelectedPlanetType(opt.id)}
                    className={`w-full p-2.5 rounded-lg border text-left text-xs transition-all ${
                      selectedPlanetType === opt.id
                        ? "bg-cyan-500/15 border-cyan-500 text-cyan-200 font-semibold"
                        : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850"
                    } ${isAnswerSubmitted && opt.id === currentChallenge.correctPlanetType ? "ring-2 ring-emerald-500" : ""}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Question 2: Habitable Zone Status */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <label className="text-xs font-bold text-white block">
                2. What is this target's Habitable Zone status?
              </label>
              <div className="space-y-2">
                {currentChallenge.optionsHabitableStatus.map((opt) => (
                  <button
                    key={opt.id}
                    disabled={isAnswerSubmitted}
                    onClick={() => setSelectedHabitableStatus(opt.id)}
                    className={`w-full p-2.5 rounded-lg border text-left text-xs transition-all ${
                      selectedHabitableStatus === opt.id
                        ? "bg-cyan-500/15 border-cyan-500 text-cyan-200 font-semibold"
                        : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850"
                    } ${isAnswerSubmitted && opt.id === currentChallenge.correctHabitableStatus ? "ring-2 ring-emerald-500" : ""}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submit or Next Button & Explanation Reveal */}
          <div className="pt-2">
            {!isAnswerSubmitted ? (
              <Button
                disabled={!selectedPlanetType || !selectedHabitableStatus}
                onClick={handleSubmit}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-2.5"
              >
                Submit Detective Analysis
              </Button>
            ) : (
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-xl border text-xs leading-relaxed space-y-2 ${
                    selectedPlanetType === currentChallenge.correctPlanetType &&
                    selectedHabitableStatus === currentChallenge.correctHabitableStatus
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
                      : "bg-amber-500/10 border-amber-500/30 text-amber-200"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {selectedPlanetType === currentChallenge.correctPlanetType &&
                    selectedHabitableStatus === currentChallenge.correctHabitableStatus ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        Accurate Classification! Real Target: {currentChallenge.actualExoplanetName}
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-amber-400" />
                        Partially Incorrect — Revealed Target:{" "}
                        {currentChallenge.actualExoplanetName}
                      </>
                    )}
                  </div>
                  <p>{currentChallenge.explanation}</p>
                </div>

                <Button
                  onClick={handleNext}
                  className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-2.5 flex items-center justify-center gap-2"
                >
                  Proceed to Next Target
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
