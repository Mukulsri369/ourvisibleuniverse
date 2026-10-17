import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Zap,
  Flame,
  Atom,
  Radio,
  Moon,
  Orbit,
  Compass,
  Info,
  Layers,
  Thermometer,
  Clock,
  Activity,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  Maximize2,
  ExternalLink,
  BookOpen,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  COSMIC_EVOLUTION_STAGES,
  VISUAL_STAGES_CONFIG,
  TNG_EVOLUTION_SNAPSHOTS,
  getCosmicTimelineInterpolation,
  type CosmicEvolutionStage,
  type VisualStageId,
  type ViewingExperienceMode,
} from "@/lib/astronomy/cosmic-evolution/evolution-stages";
import { CosmicEvolutionCanvas } from "./CosmicEvolutionCanvas";

interface CosmicEvolutionExplorerProps {
  initialStageId?: string;
  onExploreModule17?: () => void;
  onExploreHistory?: () => void;
}

export function CosmicEvolutionExplorer({
  initialStageId,
  onExploreModule17,
  onExploreHistory,
}: CosmicEvolutionExplorerProps) {
  // Active stage index (0 to 14)
  const initialIndex = initialStageId
    ? Math.max(
        0,
        COSMIC_EVOLUTION_STAGES.findIndex((s) => s.id === initialStageId),
      )
    : 0;

  const [activeStageIndex, setActiveStageIndex] = useState<number>(
    initialIndex !== -1 ? initialIndex : 0,
  );
  const [viewingMode, setViewingMode] = useState<ViewingExperienceMode>("guided_cinematic");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [scrubbedTimeGyr, setScrubbedTimeGyr] = useState<number>(0);
  const [showAdvancedEquations, setShowAdvancedEquations] = useState<boolean>(true);
  const [showDisclaimers, setShowDisclaimers] = useState<boolean>(false);

  const activeStage = COSMIC_EVOLUTION_STAGES[activeStageIndex];
  const visualStageConfig = VISUAL_STAGES_CONFIG[activeStage.visualStageId];

  // Keep scrubbed time aligned with active stage when switching
  useEffect(() => {
    setScrubbedTimeGyr(activeStage.timeGyr);
  }, [activeStageIndex, activeStage.timeGyr]);

  // Autoplay loop for Guided Cinematic Learning
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setActiveStageIndex((prev) => {
        if (prev >= COSMIC_EVOLUTION_STAGES.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 5500 / playbackSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  const handleNextStage = () => {
    if (activeStageIndex < COSMIC_EVOLUTION_STAGES.length - 1) {
      setActiveStageIndex((prev) => prev + 1);
    }
  };

  const handlePrevStage = () => {
    if (activeStageIndex > 0) {
      setActiveStageIndex((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setActiveStageIndex(0);
    setScrubbedTimeGyr(0);
  };

  const handleTimelineScrub = (timeValue: number) => {
    setScrubbedTimeGyr(timeValue);
    const interp = getCosmicTimelineInterpolation(timeValue);
    const idx = COSMIC_EVOLUTION_STAGES.findIndex((s) => s.id === interp.activeStage.id);
    if (idx !== -1) {
      setActiveStageIndex(idx);
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col pt-4 pb-20 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* 1. Header Navigation & Mode Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-3 py-0.5 rounded-full uppercase tracking-wider">
              Cosmic Timeline • 13.8 Billion Years
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <ShieldCheck className="size-3.5 text-emerald-400" />
              Peer-Reviewed Scientific Chronology
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <span>Cosmic Evolution</span>
            <span className="text-sm font-normal text-slate-400 border-l border-white/20 pl-3 hidden sm:inline">
              From Primordial Plasma to Large-Scale Structure
            </span>
          </h1>
        </div>

        {/* 3 Viewing Experience Modes */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-white/10">
          <button
            onClick={() => {
              setViewingMode("guided_cinematic");
              setIsPlaying(true);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewingMode === "guided_cinematic"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Sparkles className="size-3.5" />
            <span>1. Guided Cinematic</span>
          </button>

          <button
            onClick={() => {
              setViewingMode("interactive_exploration");
              setIsPlaying(false);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewingMode === "interactive_exploration"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Sliders className="size-3.5" />
            <span>2. Interactive Explorer</span>
          </button>

          <button
            onClick={() => {
              setViewingMode("advanced_physics");
              setIsPlaying(false);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewingMode === "advanced_physics"
                ? "bg-purple-500 text-white shadow-md shadow-purple-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Atom className="size-3.5" />
            <span>3. Advanced Physics / Data</span>
          </button>
        </div>
      </div>

      {/* 2. Main Visual Canvas + Playback HUD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Visual Canvas & Interactive Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black">
            <CosmicEvolutionCanvas
              visualStageId={activeStage.visualStageId}
              activeStage={activeStage}
              currentInterpolatedTimeGyr={scrubbedTimeGyr}
              viewingMode={viewingMode}
              onCanvasClick={() => setIsPlaying((p) => !p)}
            />

            {/* Overlaid Data Watermark */}
            <div className="absolute top-3 right-3 flex items-center gap-2 pointer-events-none">
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-white/15 text-slate-300">
                z ={" "}
                {typeof activeStage.redshiftZ === "number"
                  ? activeStage.redshiftZ.toFixed(2)
                  : activeStage.redshiftZ}
              </span>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-white/15 text-amber-300">
                {activeStage.temperatureKelvin}
              </span>
            </div>

            {/* Stage Counter */}
            <div className="absolute bottom-3 left-3 pointer-events-none">
              <span className="text-[11px] font-mono px-3 py-1 rounded-lg bg-slate-950/85 border border-white/10 text-cyan-300">
                Epoch {activeStage.order} of {COSMIC_EVOLUTION_STAGES.length}
              </span>
            </div>
          </div>

          {/* Playback Controls & Timeline Slider */}
          <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsPlaying((p) => !p)}
                  className="bg-cyan-500/20 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30"
                >
                  {isPlaying ? <Pause className="size-4 mr-1" /> : <Play className="size-4 mr-1" />}
                  <span>{isPlaying ? "Pause" : "Play Timeline"}</span>
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handlePrevStage}
                  disabled={activeStageIndex === 0}
                  className="text-slate-400 hover:text-white"
                  title="Previous Stage"
                >
                  <ChevronLeft className="size-4" />
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleNextStage}
                  disabled={activeStageIndex === COSMIC_EVOLUTION_STAGES.length - 1}
                  className="text-slate-400 hover:text-white"
                  title="Next Stage"
                >
                  <ChevronRight className="size-4" />
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleReset}
                  className="text-slate-400 hover:text-white"
                  title="Restart from Big Bang"
                >
                  <RotateCcw className="size-3.5" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">Speed:</span>
                {[0.5, 1, 2].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setPlaybackSpeed(spd)}
                    className={`text-[11px] font-mono px-2 py-0.5 rounded-md border ${
                      playbackSpeed === spd
                        ? "bg-cyan-500/30 border-cyan-400 text-cyan-200"
                        : "border-white/10 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slider */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>0 Gyr (Big Bang)</span>
                <span className="text-cyan-300 font-bold">
                  t ={" "}
                  {activeStage.timeGyr < 0.001
                    ? activeStage.epochRange
                    : `${activeStage.timeGyr} Gyr`}
                </span>
                <span>13.8 Gyr (Today)</span>
              </div>
              <input
                type="range"
                min={0}
                max={13.8}
                step={0.1}
                value={scrubbedTimeGyr}
                onChange={(e) => handleTimelineScrub(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Quick-Jump Stage Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-[11px] font-mono">
              {COSMIC_EVOLUTION_STAGES.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setActiveStageIndex(idx)}
                  className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-all border ${
                    activeStageIndex === idx
                      ? "bg-cyan-500/25 border-cyan-400 text-cyan-200 font-bold"
                      : "bg-slate-800/60 border-white/5 text-slate-400 hover:text-slate-200 hover:border-white/20"
                  }`}
                >
                  {s.order}. {s.name.split(". ")[1]?.split(" (")[0] || s.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Educational Narrative & Physical Details (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStage.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl"
            >
              {/* Stage Header & Status Badge */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                    {activeStage.epochRange}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                      activeStage.dataStatus === "empirical_observation"
                        ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                        : activeStage.dataStatus === "simulation_reconstruction"
                          ? "bg-blue-500/15 border-blue-500/40 text-blue-300"
                          : activeStage.dataStatus === "theoretical_standard_model"
                            ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                            : "bg-purple-500/15 border-purple-500/40 text-purple-300"
                    }`}
                  >
                    {activeStage.observedVsSimulatedLabel.split(" (")[0]}
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-white tracking-tight">{activeStage.name}</h2>
                <p className="text-xs text-slate-400">{activeStage.subtitle}</p>
              </div>

              {/* Physical Parameters Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-black/40 border border-white/10 rounded-xl p-3">
                <div>
                  <span className="text-slate-500 block">Temperature:</span>
                  <span className="text-amber-300 font-bold">{activeStage.temperatureKelvin}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Redshift z:</span>
                  <span className="text-cyan-300 font-bold">
                    {typeof activeStage.redshiftZ === "number"
                      ? activeStage.redshiftZ.toFixed(2)
                      : activeStage.redshiftZ}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Energy Scale:</span>
                  <span className="text-slate-300">{activeStage.energyScale}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Dominant Energy:</span>
                  <span className="text-purple-300">{activeStage.dominantEnergyComponent}</span>
                </div>
              </div>

              {/* Content depending on Viewing Mode */}
              {viewingMode === "guided_cinematic" && (
                <div className="space-y-3">
                  <div className="bg-cyan-950/30 border border-cyan-500/20 rounded-xl p-3.5 space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                      <Sparkles className="size-3.5" />
                      Guided Story
                    </span>
                    <p className="text-sm text-slate-200 leading-relaxed">
                      {activeStage.guidedNarration.studentSummary}
                    </p>
                  </div>

                  <div className="bg-slate-800/40 border border-white/5 rounded-xl p-3 space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Key Takeaway
                    </span>
                    <p className="text-xs text-slate-300">
                      {activeStage.guidedNarration.keyTakeaway}
                    </p>
                  </div>
                </div>
              )}

              {viewingMode === "interactive_exploration" && (
                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <span className="font-bold text-slate-300 block">Scientific Process:</span>
                    <p className="text-slate-300 leading-relaxed">
                      {activeStage.scientificProcess}
                    </p>
                  </div>

                  <div className="space-y-1 bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-3">
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="size-3.5" />
                      Observational Evidence:
                    </span>
                    <p className="text-slate-300 leading-relaxed">
                      {activeStage.observationalEvidence}
                    </p>
                  </div>

                  <div className="space-y-1 bg-amber-950/20 border border-amber-500/20 rounded-xl p-3">
                    <span className="font-bold text-amber-400 flex items-center gap-1.5">
                      <AlertTriangle className="size-3.5" />
                      Known Scientific Uncertainties:
                    </span>
                    <p className="text-slate-300 leading-relaxed">
                      {activeStage.knownUncertainties}
                    </p>
                  </div>
                </div>
              )}

              {viewingMode === "advanced_physics" && (
                <div className="space-y-3">
                  <div className="bg-purple-950/30 border border-purple-500/30 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                        <Atom className="size-3.5" />
                        {activeStage.advancedPhysics.keyEquationName}
                      </span>
                    </div>

                    <div className="bg-black/60 rounded-lg p-2.5 font-mono text-center text-sm text-cyan-300 border border-white/10">
                      {activeStage.advancedPhysics.latexEquation}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {activeStage.advancedPhysics.equationDescription}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-mono bg-black/40 border border-white/10 rounded-xl p-2.5">
                    <div>
                      <span className="text-slate-500 block">Ω_m</span>
                      <span className="text-slate-200 font-bold">
                        {activeStage.advancedPhysics.cosmicDensityParameters.omegaM}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Ω_Λ</span>
                      <span className="text-slate-200 font-bold">
                        {activeStage.advancedPhysics.cosmicDensityParameters.omegaLambda}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Ω_r</span>
                      <span className="text-slate-200 font-bold">
                        {activeStage.advancedPhysics.cosmicDensityParameters.omegaRad}
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] font-mono text-slate-400 bg-slate-800/30 p-2.5 rounded-xl border border-white/5">
                    {activeStage.advancedPhysics.physicalScaleNote}
                  </div>
                </div>
              )}

              {/* Citations & Peer-Reviewed References */}
              <div className="pt-2 border-t border-white/10 space-y-1.5">
                <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                  <BookOpen className="size-3" />
                  Primary Scientific References:
                </span>
                <div className="space-y-1">
                  {activeStage.scientificCitations.map((cite, idx) => (
                    <div key={idx} className="text-[10px] text-slate-400 font-mono">
                      <span className="text-slate-300">{cite.authors}</span> ({cite.year}) —{" "}
                      <span className="italic text-slate-400">{cite.title}</span>, {cite.journal}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* 3. Deep-Dive Section: Simulation Snapshots & Lightcone Physics */}
      <div className="border border-white/10 rounded-2xl bg-slate-900/50 p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Layers className="size-5 text-indigo-400" />
              <span>Multi-Epoch Cosmological Simulations & Lightcone Horizon</span>
            </h3>
            <p className="text-xs text-slate-400">
              Distinguishing simultaneous simulation time-slices from past lightcone observational
              surveys.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onExploreModule17 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExploreModule17}
                className="text-xs border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10"
              >
                Module 17 Academy
              </Button>
            )}
            {onExploreHistory && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExploreHistory}
                className="text-xs border-purple-500/40 text-purple-300 hover:bg-purple-500/10"
              >
                Cosmic History Timeline
              </Button>
            )}
          </div>
        </div>

        {/* 4 Multi-Epoch TNG Simulation Snapshots */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TNG_EVOLUTION_SNAPSHOTS.map((snap) => (
            <div
              key={snap.snapshotNumber}
              className="bg-black/50 border border-white/10 rounded-xl p-4 space-y-2.5 relative overflow-hidden group hover:border-indigo-500/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-indigo-400">
                  Snapshot {snap.snapshotNumber}
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-200">
                  z = {snap.redshift}
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="text-slate-300 font-semibold">
                  {snap.description.split(": ")[0]}
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  {snap.description.split(": ")[1]}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-white/10 text-[10px] font-mono text-slate-400">
                <div>
                  <span className="text-slate-500 block">Lookback:</span>
                  <span>{snap.lookbackTimeGyr} Gyr</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Void Fraction:</span>
                  <span>{(snap.voidFraction * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Scientific Safeguards Notice */}
        <div className="bg-slate-950/80 border border-white/10 rounded-xl p-4 text-xs space-y-2 text-slate-300">
          <div className="flex items-center gap-2 font-bold text-cyan-300">
            <Info className="size-4 text-cyan-400" />
            <span>Core Epistemological Principles in Cosmological Visualization:</span>
          </div>
          <ul className="list-disc pl-5 space-y-1 text-slate-400 leading-relaxed">
            <li>
              <strong className="text-slate-200">
                Expanding Space, Not an Explosion in Space:
              </strong>{" "}
              Metric expansion means space itself expands according to General Relativity,
              stretching distances between unbound clusters without a physical center or outside
              boundary.
            </li>
            <li>
              <strong className="text-slate-200">Limits of Physical Knowledge:</strong> We do not
              assert physical certitude prior to t ≈ 10⁻⁴³ s (Planck time), where classical
              spacetime breaks down and quantum gravity is required.
            </li>
            <li>
              <strong className="text-slate-200">Simulation Disclaimers:</strong> Cosmological
              simulations (IllustrisTNG) depict statistical realizations of standard Lambda-CDM
              physics. They illustrate halo clustering, gas heating, and cosmic web emergence, but
              do NOT reproduce the actual observed coordinates of real distant galaxies.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
