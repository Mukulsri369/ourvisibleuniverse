// @ts-nocheck -- loosely-typed educational content; runtime-validated by rendering.
import React, { useState, useMemo, useEffect } from "react";
import type { LearningLevel } from "@/lib/academy/types";
import {
  FUTURE_CHRONOLOGY_MILESTONES,
  SUN_EVOLUTION_STAGES,
  GALAXY_MERGER_STAGES,
  COSMOLOGICAL_SCENARIOS,
  STELLAR_POPULATION_ERAS,
  FutureMilestone,
  SunEvolutionStage,
  GalaxyMergerStage,
  CosmologicalScenario,
} from "@/lib/academy/lessons/module-20-future-universe";
import {
  Clock,
  Sparkles,
  Sun,
  Flame,
  Disc,
  EyeOff,
  Moon,
  Radio,
  Play,
  Pause,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Compass,
  ArrowRight,
  TrendingDown,
  Layers,
  Zap,
  Info,
  Maximize2,
  Atom,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CosmicFutureTimelineLabProps {
  level: LearningLevel;
  onInteract?: () => void;
}

export function CosmicFutureTimelineLab({ level, onInteract }: CosmicFutureTimelineLabProps) {
  const [activeTab, setActiveTab] = useState<
    "timeline" | "sun" | "merger" | "scenarios" | "populations" | "entropy"
  >("timeline");

  // --- 1. TIMELINE STATE ---
  const [selectedMilestoneIndex, setSelectedMilestoneIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Auto-play timeline loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setSelectedMilestoneIndex((prev) => {
          if (prev >= FUTURE_CHRONOLOGY_MILESTONES.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 3500);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const activeMilestone = FUTURE_CHRONOLOGY_MILESTONES[selectedMilestoneIndex];

  // --- 2. SUN EVOLUTION STATE ---
  const [selectedSunStageIndex, setSelectedSunStageIndex] = useState<number>(0);
  const activeSunStage = SUN_EVOLUTION_STAGES[selectedSunStageIndex];

  // --- 3. GALAXY MERGER STATE ---
  const [selectedMergerPhase, setSelectedMergerPhase] = useState<number>(1);
  const activeMergerStage = useMemo(
    () =>
      GALAXY_MERGER_STAGES.find((s) => s.phase === selectedMergerPhase) || GALAXY_MERGER_STAGES[0],
    [selectedMergerPhase],
  );

  // --- 4. SCENARIO STATE ---
  const [selectedScenarioId, setSelectedScenarioId] = useState<
    "big_freeze" | "big_rip" | "big_crunch" | "vacuum_decay"
  >("big_freeze");
  const activeScenario = useMemo(
    () =>
      COSMOLOGICAL_SCENARIOS.find((s) => s.id === selectedScenarioId) || COSMOLOGICAL_SCENARIOS[0],
    [selectedScenarioId],
  );

  // --- 5. STELLAR POPULATIONS STATE ---
  const [selectedPopulationEraIndex, setSelectedPopulationEraIndex] = useState<number>(0);
  const activePopEra = STELLAR_POPULATION_ERAS[selectedPopulationEraIndex];

  // Notify parent of engagement
  const handleUserAction = () => {
    if (onInteract) onInteract();
  };

  return (
    <div className="space-y-6 bg-slate-950/80 border border-slate-800/80 rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-xl">
      {/* Lab Header & Sub-navigation Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 border border-purple-500/30 px-3 py-0.5 rounded-full flex items-center gap-1.5">
              <Clock className="size-3" />
              Cosmic Future Chronology Lab
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">
              • Deep Time Astrophysics
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            The Cosmic Future Simulator
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-0.5">
            Explore scientifically modeled changes across logarithmic timescales: from our Sun's
            evolution and the Milkomeda merger to the Degenerate Era and ultimate cosmological
            fates.
          </p>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-white/10 rounded-2xl overflow-x-auto max-w-full">
          <button
            onClick={() => {
              setActiveTab("timeline");
              handleUserAction();
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === "timeline"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Clock className="size-3.5" />
            <span>Future Timeline</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("sun");
              handleUserAction();
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === "sun"
                ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Sun className="size-3.5" />
            <span>Sun Evolution</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("merger");
              handleUserAction();
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === "merger"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Disc className="size-3.5" />
            <span>Milkomeda Merger</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("scenarios");
              handleUserAction();
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === "scenarios"
                ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Compass className="size-3.5" />
            <span>Cosmic Fates</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("populations");
              handleUserAction();
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === "populations"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <TrendingDown className="size-3.5" />
            <span>Star Populations</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("entropy");
              handleUserAction();
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === "entropy"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Zap className="size-3.5" />
            <span>Entropy & CMB</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: LOGARITHMIC COSMIC FUTURE TIMELINE
          ========================================================================= */}
      {activeTab === "timeline" && (
        <div className="space-y-6">
          {/* Controls Bar: Play, Pause, Reset, Slider */}
          <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    setIsPlaying(!isPlaying);
                    handleUserAction();
                  }}
                  className={`text-xs font-semibold ${
                    isPlaying
                      ? "bg-amber-600 hover:bg-amber-500 text-white"
                      : "bg-purple-600 hover:bg-purple-500 text-white"
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="size-3.5 mr-1" />
                      Pause Tour
                    </>
                  ) : (
                    <>
                      <Play className="size-3.5 mr-1" />
                      Play Future Tour
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedMilestoneIndex(0);
                    setIsPlaying(false);
                    handleUserAction();
                  }}
                  className="border-white/10 text-slate-300 hover:text-white text-xs"
                >
                  <RotateCcw className="size-3.5 mr-1" />
                  Reset to Present
                </Button>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                <span className="text-slate-500">Current Era:</span>
                <span className="font-bold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                  {activeMilestone.adamsLaughlinEra}
                </span>
                <span className="text-slate-500 hidden md:inline">|</span>
                <span className="font-bold text-amber-300 hidden md:inline">
                  {activeMilestone.yearsLabel}
                </span>
              </div>
            </div>

            {/* Slider with Logarithmic Scale (0 to 100 log years) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[11px] font-mono text-slate-400">
                <span>Present (+0 yr)</span>
                <span>+1 Gyr (10⁹ yr)</span>
                <span>+100 Gyr (10¹¹ yr)</span>
                <span>End of Stars (10¹⁴ yr)</span>
                <span>Degenerate (10²⁰ yr)</span>
                <span>Black Holes (10⁶⁵ yr)</span>
                <span>Dark Era (&gt;10¹⁰⁰ yr)</span>
              </div>
              <input
                type="range"
                min="0"
                max={FUTURE_CHRONOLOGY_MILESTONES.length - 1}
                step="1"
                value={selectedMilestoneIndex}
                onChange={(e) => {
                  setSelectedMilestoneIndex(parseInt(e.target.value, 10));
                  setIsPlaying(false);
                  handleUserAction();
                }}
                className="w-full accent-purple-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Quick-Jump Milestone Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1">
              {FUTURE_CHRONOLOGY_MILESTONES.map((m, idx) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setSelectedMilestoneIndex(idx);
                    setIsPlaying(false);
                    handleUserAction();
                  }}
                  className={`px-2.5 py-1 text-[11px] font-mono rounded-lg transition-all whitespace-nowrap border ${
                    selectedMilestoneIndex === idx
                      ? "bg-purple-600 text-white border-purple-400 font-bold shadow-md shadow-purple-600/30"
                      : "bg-slate-800/80 text-slate-400 border-white/5 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {m.yearsLabel}
                </button>
              ))}
            </div>
          </div>

          {/* Active Milestone Deep Dive Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Main Narrative & Scientific Explanation */}
            <div className="lg:col-span-2 space-y-4">
              <div
                className={`p-6 rounded-3xl border ${activeMilestone.visualTheme.borderColor} ${activeMilestone.visualTheme.bgColor} backdrop-blur-md space-y-4`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-300 bg-purple-900/60 border border-purple-500/30 px-3 py-1 rounded-full">
                      Step {selectedMilestoneIndex + 1} of {FUTURE_CHRONOLOGY_MILESTONES.length}
                    </span>
                    <span className="text-sm font-mono font-bold text-white">
                      {activeMilestone.yearsLabel}
                    </span>
                  </div>

                  {/* Certainty Badge */}
                  <div
                    className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border ${
                      activeMilestone.certaintyLevel === "well_supported"
                        ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                        : activeMilestone.certaintyLevel === "theoretically_sound"
                          ? "bg-blue-500/10 text-blue-300 border-blue-500/30"
                          : "bg-purple-500/10 text-purple-300 border-purple-500/30"
                    }`}
                  >
                    {activeMilestone.certaintyLevel === "well_supported" ? (
                      <ShieldCheck className="size-3.5" />
                    ) : (
                      <Info className="size-3.5" />
                    )}
                    <span>{activeMilestone.certaintyBadge}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {activeMilestone.title}
                  </h3>
                  <p className="text-sm sm:text-base text-slate-300 mt-1 font-medium">
                    {activeMilestone.subtitle}
                  </p>
                </div>

                {/* Level-Adaptive Content Box */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="size-3.5 text-purple-400" />
                      Perspective for {level}
                    </span>
                    <span className="text-[11px] font-mono text-purple-300">
                      log₁₀(Years) = {activeMilestone.logYears}
                    </span>
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed">
                    {level === "Junior Explorer" && activeMilestone.description.explorer}
                    {level === "Curious Scholar" && activeMilestone.description.scholar}
                    {level === "Young Astrophysicist" && activeMilestone.description.astrophysicist}
                  </p>
                </div>

                {/* Scientific Disclaimer Note */}
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs text-slate-300">
                  <ShieldAlert className="size-4 text-purple-400 shrink-0 mt-0.5" />
                  <p>
                    <strong className="text-white">Scientific Humility Note:</strong> While stellar
                    lifetimes and nuclear physics are supported by rigorous laboratory data and
                    stellar observations, extrapolations into the Black Hole and Dark eras depend on
                    theories of quantum gravity and dark energy that remain active frontiers of
                    astrophysics.
                  </p>
                </div>
              </div>
            </div>

            {/* Right 1 Col: Key Physical Metrics & States */}
            <div className="space-y-4">
              <div className="p-5 rounded-3xl bg-slate-900/80 border border-white/10 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Atom className="size-4 text-purple-400" />
                  Cosmic State Breakdown
                </h4>

                {/* Solar System Status */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 space-y-1">
                  <div className="text-[11px] font-mono uppercase text-amber-400 font-bold flex items-center gap-1">
                    <Sun className="size-3" />
                    Solar System State
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activeMilestone.solarSystemState}
                  </p>
                </div>

                {/* Galactic Structure */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 space-y-1">
                  <div className="text-[11px] font-mono uppercase text-cyan-400 font-bold flex items-center gap-1">
                    <Disc className="size-3" />
                    Galactic Environment
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activeMilestone.galacticState}
                  </p>
                </div>

                {/* Cosmological Scale & Expansion */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 space-y-1">
                  <div className="text-[11px] font-mono uppercase text-indigo-400 font-bold flex items-center gap-1">
                    <Compass className="size-3" />
                    Cosmological Horizon
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activeMilestone.cosmologicalState}
                  </p>
                </div>

                {/* Thermodynamics & Entropy */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 space-y-1">
                  <div className="text-[11px] font-mono uppercase text-rose-400 font-bold flex items-center gap-1">
                    <Zap className="size-3" />
                    Thermodynamics & Entropy
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activeMilestone.entropyAndPhysics}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: SUN EVOLUTION SIMULATOR
          ========================================================================= */}
      {activeTab === "sun" && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                Solar Fate Bench
              </div>
              <h3 className="text-lg font-bold text-white">
                The Life and Death of Our Sun Across 12+ Billion Years
              </h3>
            </div>
            <span className="text-xs text-slate-300">
              Interactive 7-Stage Evolutionary Sequence
            </span>
          </div>

          {/* Stage Selector Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {SUN_EVOLUTION_STAGES.map((stage, idx) => (
              <button
                key={stage.id}
                onClick={() => {
                  setSelectedSunStageIndex(idx);
                  handleUserAction();
                }}
                className={`p-3 rounded-2xl text-left border transition-all ${
                  selectedSunStageIndex === idx
                    ? "bg-amber-500/20 border-amber-400 shadow-lg shadow-amber-500/20 text-white"
                    : "bg-slate-900/60 border-white/5 text-slate-400 hover:border-white/20 hover:text-white"
                }`}
              >
                <div className="text-[10px] font-mono font-bold text-amber-300 truncate">
                  {stage.name.split(". ")[0]}. Stage
                </div>
                <div className="text-xs font-bold text-white truncate mt-0.5">
                  {stage.name.split(". ")[1]}
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-1">
                  +{stage.timeGyr} Gyr
                </div>
              </button>
            ))}
          </div>

          {/* Active Stage Display Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Visualizer Column */}
            <div className="lg:col-span-1 p-6 rounded-3xl bg-slate-900/90 border border-white/10 flex flex-col items-center justify-center text-center space-y-4">
              <div className="text-xs font-mono uppercase text-amber-400 font-bold">
                Photosphere Scale Diagram
              </div>

              {/* Dynamic Sun Visual Representation */}
              <div className="relative size-48 flex items-center justify-center">
                {/* Glow ring */}
                <div
                  className="rounded-full transition-all duration-700 blur-md opacity-75"
                  style={{
                    width: `${Math.min(180, Math.max(30, activeSunStage.radiusSolar * 18))}px`,
                    height: `${Math.min(180, Math.max(30, activeSunStage.radiusSolar * 18))}px`,
                    backgroundColor:
                      activeSunStage.temperatureKelvin > 50000
                        ? "#60a5fa"
                        : activeSunStage.temperatureKelvin > 5000
                          ? "#f59e0b"
                          : activeSunStage.temperatureKelvin > 4000
                            ? "#f97316"
                            : "#ef4444",
                  }}
                />
                {/* Solid core sphere */}
                <div
                  className="rounded-full transition-all duration-700 shadow-2xl relative z-10 flex items-center justify-center"
                  style={{
                    width: `${Math.min(160, Math.max(16, activeSunStage.radiusSolar * 16))}px`,
                    height: `${Math.min(160, Math.max(16, activeSunStage.radiusSolar * 16))}px`,
                    background:
                      activeSunStage.temperatureKelvin > 50000
                        ? "radial-gradient(circle, #93c5fd 0%, #3b82f6 70%, #1e3a8a 100%)"
                        : activeSunStage.temperatureKelvin > 5000
                          ? "radial-gradient(circle, #fef08a 0%, #f59e0b 60%, #b45309 100%)"
                          : activeSunStage.temperatureKelvin > 4000
                            ? "radial-gradient(circle, #fdba74 0%, #ea580c 60%, #7c2d12 100%)"
                            : "radial-gradient(circle, #fca5a5 0%, #dc2626 60%, #7f1d1d 100%)",
                  }}
                >
                  <span className="text-[11px] font-mono font-bold text-white drop-shadow-md">
                    {activeSunStage.radiusSolar} R☉
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-400 space-y-1">
                <div>
                  Surface Temp:{" "}
                  <strong className="text-white">
                    {activeSunStage.temperatureKelvin.toLocaleString()} K
                  </strong>
                </div>
                <div>
                  Luminosity:{" "}
                  <strong className="text-white">
                    {activeSunStage.luminositySolar.toLocaleString()} L☉
                  </strong>
                </div>
                <div>
                  Total Age:{" "}
                  <strong className="text-white">{activeSunStage.totalAgeGyr} Billion Years</strong>
                </div>
              </div>
            </div>

            {/* Scientific Details Column */}
            <div className="lg:col-span-2 space-y-4">
              <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-2xl font-black text-white">{activeSunStage.name}</h4>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full border ${
                      activeSunStage.earthHabitability === "Habitable"
                        ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                        : activeSunStage.earthHabitability === "Runaway Greenhouse"
                          ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                          : activeSunStage.earthHabitability === "Oceans Vaporized"
                            ? "bg-orange-500/10 text-orange-300 border-orange-500/30"
                            : "bg-red-500/10 text-red-300 border-red-500/30"
                    }`}
                  >
                    Earth Status: {activeSunStage.earthHabitability}
                  </span>
                </div>

                <p className="text-sm text-slate-200 leading-relaxed">
                  {activeSunStage.description}
                </p>

                {/* Nuclear Fuel Mechanism */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/5 space-y-1.5">
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Flame className="size-3.5" />
                    Nuclear Fuel Engine
                  </div>
                  <p className="text-xs text-slate-300">{activeSunStage.coreFuel}</p>
                </div>

                {/* Earth's Fate at this stage */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/5 space-y-1.5">
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                    <Compass className="size-3.5" />
                    Earth Condition & Orbit
                  </div>
                  <p className="text-xs text-slate-300">{activeSunStage.earthStatus}</p>
                </div>

                {/* Key Theoretical Physics */}
                <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/20 space-y-1.5">
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                    <Atom className="size-3.5" />
                    Stellar Physics Formula & Laws
                  </div>
                  <p className="text-xs font-mono text-purple-200">{activeSunStage.keyPhysics}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: HYPOTHETICAL GALAXY MERGER (MILKOMEDA)
          ========================================================================= */}
      {activeTab === "merger" && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">
                Hypothetical Galactic Collision
              </div>
              <h3 className="text-lg font-bold text-white">
                Milky Way & Andromeda (M31) Dynamic Coalescence
              </h3>
            </div>
            {/* Scientific Caveat Banner */}
            <div className="flex items-center gap-1.5 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl">
              <ShieldAlert className="size-3.5" />
              <span>Not a guaranteed prophecy: proper motion uncertainties exist (Gaia DR3)</span>
            </div>
          </div>

          {/* Phase Stepper Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {GALAXY_MERGER_STAGES.map((stage) => (
              <button
                key={stage.phase}
                onClick={() => {
                  setSelectedMergerPhase(stage.phase);
                  handleUserAction();
                }}
                className={`p-4 rounded-2xl text-left border transition-all ${
                  selectedMergerPhase === stage.phase
                    ? "bg-blue-600/20 border-blue-400 text-white shadow-lg shadow-blue-500/20"
                    : "bg-slate-900/60 border-white/5 text-slate-400 hover:border-white/20 hover:text-white"
                }`}
              >
                <div className="text-[10px] font-mono font-bold text-blue-400">
                  Phase {stage.phase} • +{stage.timeGyr} Gyr
                </div>
                <div className="text-xs font-bold text-white mt-1 leading-snug">{stage.name}</div>
              </button>
            ))}
          </div>

          {/* Active Phase Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Interactive Diagram / Metric Cards */}
            <div className="space-y-4">
              <div className="p-6 rounded-3xl bg-slate-900/90 border border-white/10 space-y-4 text-center">
                <div className="text-xs font-mono uppercase text-blue-400 font-bold">
                  Merger Kinematics
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl bg-slate-950 border border-white/5">
                    <div className="text-[10px] font-mono text-slate-400">Core Separation</div>
                    <div className="text-lg font-black text-white mt-0.5">
                      {activeMergerStage.separationKpc.toLocaleString()} kpc
                    </div>
                    <div className="text-[10px] text-slate-400">
                      (~{(activeMergerStage.separationKpc * 3.26).toFixed(0)} kly)
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950 border border-white/5">
                    <div className="text-[10px] font-mono text-slate-400">Relative Velocity</div>
                    <div className="text-lg font-black text-cyan-300 mt-0.5">
                      {activeMergerStage.relativeVelocityKms} km/s
                    </div>
                    <div className="text-[10px] text-slate-400">
                      (~{(activeMergerStage.relativeVelocityKms * 3600).toLocaleString()} km/h)
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-white/5 text-left space-y-1">
                  <div className="text-[11px] font-mono text-purple-400 font-bold uppercase">
                    Star Formation Rate
                  </div>
                  <div className="text-xs text-slate-200">
                    {activeMergerStage.starFormationRate}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-white/5 text-left space-y-1">
                  <div className="text-[11px] font-mono text-amber-400 font-bold uppercase">
                    Morphological Type
                  </div>
                  <div className="text-xs text-slate-200">{activeMergerStage.morphology}</div>
                </div>
              </div>
            </div>

            {/* Right: Narrative Description and Astrophysical Mechanisms */}
            <div className="lg:col-span-2 space-y-4">
              <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 space-y-4">
                <h4 className="text-2xl font-black text-white">{activeMergerStage.name}</h4>

                <p className="text-sm text-slate-200 leading-relaxed">
                  {activeMergerStage.description}
                </p>

                <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/5 space-y-2">
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                    <Atom className="size-3.5" />
                    Astrophysical & Dynamical Friction Physics
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activeMergerStage.astrophysicalDetails}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/20 text-xs text-slate-300 space-y-1.5">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Info className="size-3.5 text-blue-400" />
                    Why stars don&apos;t crash into each other:
                  </div>
                  <p>
                    Stars are exceedingly tiny compared to the interstellar distances between them.
                    The stellar volume filling factor in the solar neighborhood is ~10⁻²¹. Two
                    galaxies merging is like two swarms of bees flying through one another: bees
                    almost never collide, but their collective gravitational fields pull each swarm
                    into a new shared shape.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: COSMIC FATES & DARK ENERGY COMPARISON
          ========================================================================= */}
      {activeTab === "scenarios" && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider">
                Cosmological Hypotheses
              </div>
              <h3 className="text-lg font-bold text-white">
                How Dark Energy Dictates the Ultimate Fate of Spacetime
              </h3>
            </div>
            <span className="text-xs text-slate-300">Equation of State: w = P / (ρ c²)</span>
          </div>

          {/* Scenario Selector Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {COSMOLOGICAL_SCENARIOS.map((scen) => (
              <button
                key={scen.id}
                onClick={() => {
                  setSelectedScenarioId(scen.id);
                  handleUserAction();
                }}
                className={`p-4 rounded-2xl text-left border transition-all ${
                  selectedScenarioId === scen.id
                    ? "bg-rose-500/20 border-rose-400 text-white shadow-lg shadow-rose-500/20"
                    : "bg-slate-900/60 border-white/5 text-slate-400 hover:border-white/20 hover:text-white"
                }`}
              >
                <div className="text-[10px] font-mono font-bold text-rose-400">
                  {scen.equationOfState}
                </div>
                <div className="text-sm font-bold text-white mt-1">{scen.name}</div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Status: <strong className="text-slate-200">{scen.confidenceRating}</strong>
                </div>
              </button>
            ))}
          </div>

          {/* Active Scenario In-Depth Panel */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <h4 className="text-2xl font-black text-white">{activeScenario.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-mono text-rose-300 bg-rose-500/10 px-2.5 py-0.5 rounded border border-rose-500/20">
                    {activeScenario.equationOfState}
                  </span>
                  <span className="text-xs text-slate-400">
                    Also known as: {activeScenario.alternativeNames.join(", ")}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[11px] font-mono text-slate-400 uppercase">
                  Timescale to Endpoint
                </div>
                <div className="text-xs font-mono font-bold text-amber-300 mt-0.5">
                  {activeScenario.timescaleToEndpoint}
                </div>
              </div>
            </div>

            <p className="text-sm text-slate-200 leading-relaxed">{activeScenario.description}</p>

            {/* Grid of Impacts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/5 space-y-1.5">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                  <Disc className="size-3.5" />
                  Fate of Galaxies & Large Scale Structures
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeScenario.fateOfGalaxies}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/5 space-y-1.5">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Atom className="size-3.5" />
                  Fate of Atoms, Nuclei & Spacetime
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeScenario.fateOfAtomsAndSpacetime}
                </p>
              </div>
            </div>

            {/* Scientific Mechanism Box */}
            <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/20 space-y-2">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
                <Compass className="size-3.5" />
                Underlying Cosmological Mathematics & Mechanism
              </div>
              <p className="text-xs font-mono text-slate-200">
                {activeScenario.keyScientificMechanism}
              </p>
              <div className="text-xs text-slate-400 pt-1 border-t border-white/5">
                <strong className="text-slate-200">Entropy Trend:</strong>{" "}
                {activeScenario.entropyTrend}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: STELLAR POPULATIONS & EXTINCTION
          ========================================================================= */}
      {activeTab === "populations" && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
                Stellar Demographics Across Eons
              </div>
              <h3 className="text-lg font-bold text-white">
                The Die-Off of Star Types & The Rise of Degenerate Corpses
              </h3>
            </div>
            <span className="text-xs text-slate-300">Lifespan: t_ms ∝ M / L ∝ M^(-2.5)</span>
          </div>

          {/* Era Navigation Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {STELLAR_POPULATION_ERAS.map((era, idx) => (
              <button
                key={era.eraName}
                onClick={() => {
                  setSelectedPopulationEraIndex(idx);
                  handleUserAction();
                }}
                className={`p-4 rounded-2xl text-left border transition-all ${
                  selectedPopulationEraIndex === idx
                    ? "bg-indigo-600/20 border-indigo-400 text-white shadow-lg shadow-indigo-500/20"
                    : "bg-slate-900/60 border-white/5 text-slate-400 hover:border-white/20 hover:text-white"
                }`}
              >
                <div className="text-[10px] font-mono text-indigo-400">{era.timeRange}</div>
                <div className="text-sm font-bold text-white mt-1">{era.eraName}</div>
                <div className="text-[10px] font-mono text-slate-400 mt-2">
                  Luminosity: {era.cosmicLuminosityPercent}%
                </div>
              </button>
            ))}
          </div>

          {/* Active Era Breakdown */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <h4 className="text-2xl font-black text-white">{activePopEra.eraName}</h4>
                <p className="text-xs font-mono text-indigo-300 mt-1">
                  Timespan: {activePopEra.timeRange}
                </p>
              </div>

              {/* Gauges */}
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">
                    Cosmic Starlight
                  </div>
                  <div className="text-lg font-black text-amber-300">
                    {activePopEra.cosmicLuminosityPercent}%
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">
                    Star Birth Rate
                  </div>
                  <div className="text-lg font-black text-cyan-300">
                    {activePopEra.starFormationRatePercent}%
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/5 space-y-2">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="size-3.5" />
                  Still Shining (Active Stars)
                </div>
                <ul className="text-xs text-slate-200 space-y-1">
                  {activePopEra.activeStarTypes.map((t, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-emerald-400" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/5 space-y-2">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                  <Flame className="size-3.5" />
                  Currently Dying Out
                </div>
                <ul className="text-xs text-slate-200 space-y-1">
                  {activePopEra.dyingStarTypes.map((t, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-red-400" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/5 space-y-2">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                  <Moon className="size-3.5" />
                  Dominant Remnant Corpses
                </div>
                <ul className="text-xs text-slate-200 space-y-1">
                  {activePopEra.dominantRemnants.map((t, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-purple-400" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-slate-300">
              <strong className="text-white">Astronomical Environment:</strong> {activePopEra.notes}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 6: ENTROPY, FREE ENERGY & COSMIC BACKGROUND
          ========================================================================= */}
      {activeTab === "entropy" && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                Thermodynamic Foundations
              </div>
              <h3 className="text-lg font-bold text-white">
                Entropy, Free Energy, and the Cosmic Microwave Background
              </h3>
            </div>
            <span className="text-xs text-slate-300">
              Boltzmann: S = k_B ln(Ω) • Clausius: dS ≥ 0
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Box 1: Second Law & Free Energy */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 space-y-3">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Zap className="size-4" />
                The Second Law of Thermodynamics
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                In any closed system, total entropy never decreases:{" "}
                <strong className="text-white font-mono">dS ≥ 0</strong>. Energy is never destroyed,
                but it constantly degrades from organized forms (like nuclear binding energy in
                stars) into disorganized thermal heat.
              </p>
              <div className="p-3 rounded-xl bg-slate-950 border border-white/5 text-xs font-mono text-emerald-300">
                Helmholtz Free Energy:
                <br />
                <span className="text-sm font-bold text-white">F = U - T · S</span>
                <p className="text-[10px] text-slate-400 mt-1 font-sans">
                  When temperature differences vanish (T is uniform) and S is maximized, ΔF = 0. No
                  physical work, computation, or biological life is possible.
                </p>
              </div>
            </div>

            {/* Box 2: CMB Cooling Curve */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 space-y-3">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Clock className="size-4" />
                Cosmic Background Temperature Drop
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                The Cosmic Microwave Background (CMB) cools as the universe expands according to:
                <br />
                <strong className="text-white font-mono">T(t) = T₀ / a(t)</strong>
              </p>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between p-2 rounded-lg bg-slate-950">
                  <span className="text-slate-400">Today (t = 13.8 Gyr):</span>
                  <span className="text-white font-bold">2.725 Kelvin</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-slate-950">
                  <span className="text-slate-400">+10 Billion Years:</span>
                  <span className="text-white font-bold">~1.4 Kelvin</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-slate-950">
                  <span className="text-slate-400">+100 Billion Years:</span>
                  <span className="text-white font-bold">&lt; 0.05 Kelvin</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-slate-950">
                  <span className="text-slate-400">+1 Trillion Years:</span>
                  <span className="text-white font-bold">&lt; 0.0001 Kelvin</span>
                </div>
              </div>
            </div>

            {/* Box 3: The Cosmic Entropy Budget */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 space-y-3">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Disc className="size-4" />
                Where is the Universe&apos;s Entropy?
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Supermassive black holes dominate the modern entropy budget of the observable
                universe by tens of orders of magnitude!
              </p>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between p-2 rounded-lg bg-slate-950">
                  <span className="text-slate-400">Stars & Gas:</span>
                  <span className="text-slate-300 font-bold">~ 10⁷⁹ k_B</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-slate-950">
                  <span className="text-slate-400">Cosmic Photons (CMB):</span>
                  <span className="text-cyan-300 font-bold">~ 10⁸⁹ k_B</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-slate-950">
                  <span className="text-slate-400">Supermassive Black Holes:</span>
                  <span className="text-purple-300 font-bold">&gt; 10¹⁰⁴ k_B</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                Bekenstein-Hawking formula:{" "}
                <span className="font-mono text-purple-200">S_BH = k_B c³ A / (4 G ℏ)</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
