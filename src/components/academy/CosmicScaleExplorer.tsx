import React, { useState, useMemo } from "react";
import { COSMIC_SCALE_STEPS, CosmicScaleStep } from "@/lib/academy/lessons/module-03-cosmic-scale";
import type { LearningLevel } from "@/lib/academy/types";
import {
  Sliders,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Info,
  Maximize2,
  ChevronRight,
  ChevronLeft,
  Ruler,
  AlertTriangle,
  BarChart3,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CosmicScaleExplorerProps {
  currentLevel: LearningLevel;
  onExplorationComplete?: () => void;
}

export function CosmicScaleExplorer({
  currentLevel,
  onExplorationComplete,
}: CosmicScaleExplorerProps) {
  // Exponent slider value: 0 to 26 (continuous, e.g. 0.0 to 26.0)
  const [exponent, setExponent] = useState<number>(0);
  const [showLogGraph, setShowLogGraph] = useState<boolean>(false);
  const [visitedExponents, setVisitedExponents] = useState<Set<number>>(new Set([0]));

  // Find closest step for descriptive context
  const currentStep = useMemo(() => {
    let closest = COSMIC_SCALE_STEPS[0];
    let minDiff = Math.abs(exponent - closest.exponent);
    for (const step of COSMIC_SCALE_STEPS) {
      const diff = Math.abs(exponent - step.exponent);
      if (diff < minDiff) {
        minDiff = diff;
        closest = step;
      }
    }
    return closest;
  }, [exponent]);

  // Handle slider change
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setExponent(val);

    // Track exploration progress
    const rounded = Math.round(val);
    if (!visitedExponents.has(rounded)) {
      const nextVisited = new Set(visitedExponents);
      nextVisited.add(rounded);
      setVisitedExponents(nextVisited);
      if (nextVisited.size >= 6 && onExplorationComplete) {
        onExplorationComplete();
      }
    }
  };

  const jumpToStep = (step: CosmicScaleStep) => {
    setExponent(step.exponent);
    const nextVisited = new Set(visitedExponents);
    nextVisited.add(step.exponent);
    setVisitedExponents(nextVisited);
    if (nextVisited.size >= 6 && onExplorationComplete) {
      onExplorationComplete();
    }
  };

  // Calculate dynamic human-readable size for current continuous exponent
  const formattedCalculatedDistance = useMemo(() => {
    const meters = Math.pow(10, exponent);

    if (meters < 1000) {
      return `${meters.toFixed(meters < 10 ? 1 : 0)} meters`;
    }
    const km = meters / 1000;
    if (km < 149597870.7) {
      // less than 1 AU
      if (km >= 1_000_000) {
        return `${(km / 1_000_000).toFixed(1)} million km`;
      }
      return `${km.toLocaleString(undefined, { maximumFractionDigits: 0 })} km`;
    }
    const au = km / 149597870.7;
    if (au < 63241) {
      // less than 1 light-year
      return `${au.toFixed(au < 10 ? 2 : 1)} AU (~${(km / 1_000_000).toFixed(0)}M km)`;
    }
    const ly = km / 9.46073e12;
    if (ly < 1_000_000) {
      return `${ly.toLocaleString(undefined, { maximumFractionDigits: ly < 10 ? 2 : 0 })} Light-Years`;
    }
    if (ly < 1_000_000_000) {
      return `${(ly / 1_000_000).toFixed(2)} Million Light-Years (${(ly / 3.26e6).toFixed(1)} Mpc)`;
    }
    return `${(ly / 1_000_000_000).toFixed(1)} Billion Light-Years (${(ly / 3.26e9).toFixed(1)} Gpc)`;
  }, [exponent]);

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-md overflow-hidden shadow-2xl">
      {/* Top Banner & Mode Toggle */}
      <div className="p-4 sm:p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-0.5 rounded-full uppercase">
              Signature Experience
            </span>
            <span className="text-xs text-slate-400">• Continuous Logarithmic Explorer</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
            26 Powers of Ten: From Human Scale to the Observable Universe
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLogGraph(!showLogGraph)}
            className={`border-indigo-500/30 text-xs ${
              showLogGraph
                ? "bg-indigo-600 text-white border-indigo-500"
                : "text-indigo-300 hover:bg-indigo-950/60"
            }`}
          >
            <BarChart3 className="size-3.5 mr-1.5" />
            {showLogGraph ? "Hide Log Graph" : "Logarithmic Scale Graph"}
          </Button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="p-4 sm:p-8 space-y-8">
        {/* Core Warning/Pedagogical Callout: Why Linear Scale is Impossible */}
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-start gap-3 text-amber-200/90 text-xs sm:text-sm leading-relaxed">
          <AlertTriangle className="size-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-300">
              Why a single linear scale is physically impossible on a screen:
            </span>{" "}
            If planet Earth were shrunk to a microscopic 1-pixel dot on your phone screen, the
            Moon&apos;s orbit would already be 30 pixels away, the Solar System would stretch across
            350,000 pixels (the length of three football fields!), and our nearest neighbor star
            would be over 3 billion pixels away! Only a{" "}
            <strong className="text-white">continuous logarithmic scale (powers of 10)</strong>{" "}
            allows human beings to explore the entire cosmos without losing either planets or
            galaxies.
          </div>
        </div>

        {/* Dynamic Zoom Visualizer Canvas / SVG */}
        <div className="relative rounded-xl border border-white/10 bg-slate-950 p-6 sm:p-8 overflow-hidden min-h-[320px] flex flex-col justify-between">
          {/* Background Ambient Cosmic Glows */}
          <div
            className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-700"
            style={{ backgroundColor: currentStep.visualColor }}
          />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full blur-3xl opacity-10 bg-cyan-500 pointer-events-none" />

          {/* Visual Display Center */}
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 my-auto">
            {/* Visual Circular Representation with Nested Zoom Rings */}
            <div className="relative size-56 sm:size-64 shrink-0 flex items-center justify-center">
              {/* Outer boundary ring */}
              <div
                className="absolute inset-0 rounded-full border-2 border-dashed transition-all duration-500"
                style={{
                  borderColor: currentStep.visualColor,
                  transform: `scale(${0.9 + (exponent % 4) * 0.05})`,
                  opacity: 0.6,
                }}
              />

              {/* Middle Concentric Ring */}
              <div
                className="absolute inset-6 rounded-full border border-white/20 transition-all duration-700 animate-spin"
                style={{ animationDuration: "60s" }}
              />

              {/* Center Celestial Sphere / Graphic */}
              <div
                className="relative size-28 sm:size-32 rounded-full flex flex-col items-center justify-center text-center p-3 shadow-2xl transition-all duration-500"
                style={{
                  backgroundColor: `${currentStep.visualColor}25`,
                  border: `2px solid ${currentStep.visualColor}`,
                  boxShadow: `0 0 35px ${currentStep.visualColor}40`,
                }}
              >
                <span className="text-2xl sm:text-3xl mb-1">
                  {exponent < 3
                    ? "🧑‍🚀"
                    : exponent < 8
                      ? "🌍"
                      : exponent < 11
                        ? "🌕"
                        : exponent < 15
                          ? "☀️"
                          : exponent < 19
                            ? "✨"
                            : exponent < 22
                              ? "🌌"
                              : exponent < 25
                                ? "🪐"
                                : "🔭"}
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-white line-clamp-1 leading-tight">
                  {currentStep.name}
                </span>
                <span className="text-[10px] font-mono text-cyan-300">
                  10^{exponent.toFixed(1)} m
                </span>
              </div>

              {/* Previous Scale Anchor shrinking to point */}
              {exponent > 2 && (
                <div className="absolute bottom-4 right-4 text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2 py-1 rounded border border-white/10">
                  Previous scale ≈ pinpoint
                </div>
              )}
            </div>

            {/* Current Scale Metrics & Physical Deep Dive */}
            <div className="flex-1 space-y-4 text-left">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider"
                  style={{
                    backgroundColor: `${currentStep.visualColor}20`,
                    color: currentStep.visualColor,
                    border: `1px solid ${currentStep.visualColor}50`,
                  }}
                >
                  {currentStep.category} Scale
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Exact Order: 10^{exponent.toFixed(1)} meters
                </span>
              </div>

              <div>
                <h4 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {currentStep.name}
                </h4>
                <div className="flex flex-wrap items-baseline gap-2 sm:gap-4 mt-1">
                  <span className="text-lg sm:text-xl font-mono font-bold text-cyan-400">
                    {formattedCalculatedDistance}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    ({Math.pow(10, exponent).toExponential(2)} meters)
                  </span>
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
                {currentStep.description}
              </p>

              {/* Memorable Analogy Box */}
              <div className="rounded-lg border border-cyan-500/20 bg-cyan-950/20 p-3 flex items-start gap-2.5">
                <Sparkles className="size-4 text-cyan-400 shrink-0 mt-0.5" />
                <div className="text-xs text-cyan-200">
                  <span className="font-semibold text-cyan-300">Scale Analogy:</span>{" "}
                  {currentStep.analogy}
                </div>
              </div>

              {/* Astronomer Math details */}
              {currentLevel === "astronomer" && (
                <div className="rounded-lg border border-purple-500/20 bg-purple-950/20 p-3 text-xs text-purple-200 font-mono">
                  <span className="text-purple-400 font-bold">Astrometric Formulation:</span> r =
                  10^{exponent.toFixed(1)} m | Equivalent: {currentStep.astronomicalEquivalent}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Milestone Indicator Dots */}
          <div className="relative z-10 pt-6 mt-6 border-t border-white/10 flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400">
              Discovered: {visitedExponents.size} of 27 orders of magnitude
            </span>
            <div className="flex gap-1.5">
              {COSMIC_SCALE_STEPS.map((step) => {
                const isSelected = Math.abs(exponent - step.exponent) < 1.5;
                const isVisited = visitedExponents.has(step.exponent);
                return (
                  <button
                    key={step.id}
                    onClick={() => jumpToStep(step)}
                    title={`${step.name} (10^${step.exponent} m)`}
                    className={`size-2.5 sm:size-3 rounded-full transition-all ${
                      isSelected
                        ? "ring-2 ring-cyan-400 scale-125"
                        : isVisited
                          ? "bg-slate-400 hover:bg-slate-300"
                          : "bg-slate-700 hover:bg-slate-600"
                    }`}
                    style={{
                      backgroundColor: isSelected ? step.visualColor : undefined,
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Continuous Logarithmic Slider Control */}
        <div className="space-y-4 bg-slate-950/60 p-5 rounded-xl border border-white/10">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <Sliders className="size-4 text-indigo-400" />
              <span className="font-bold text-white">Logarithmic Scale Controller</span>
              <span className="text-xs text-slate-400 font-mono">
                (Continuous 10^0 m → 10^26 m)
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
              Current: 10^{exponent.toFixed(1)} m
            </span>
          </div>

          {/* Slider input */}
          <div className="relative pt-2 pb-1">
            <input
              type="range"
              min="0"
              max="26"
              step="0.1"
              value={exponent}
              onChange={handleSliderChange}
              className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 focus:outline-none"
              aria-label="Continuous logarithmic cosmic scale slider from 10^0 to 10^26 meters"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-2 px-1">
              <span>10^0 (Human)</span>
              <span>10^7 (Earth)</span>
              <span>10^8 (Moon)</span>
              <span>10^12 (Solar Sys)</span>
              <span>10^16 (Stars)</span>
              <span>10^21 (Milky Way)</span>
              <span>10^23 (Local Group)</span>
              <span>10^26 (Cosmos)</span>
            </div>
          </div>

          {/* Step Quick-Jump Buttons */}
          <div className="pt-2">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">
              Direct Scale Milestones:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {COSMIC_SCALE_STEPS.map((step) => {
                const isActive = Math.abs(exponent - step.exponent) < 0.5;
                return (
                  <button
                    key={step.id}
                    onClick={() => jumpToStep(step)}
                    className={`text-left p-2.5 rounded-lg border text-xs transition-all ${
                      isActive
                        ? "border-cyan-500 bg-cyan-500/10 text-white font-semibold shadow-md"
                        : "border-white/5 bg-slate-900/60 text-slate-400 hover:border-white/20 hover:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-cyan-400">
                        10^{step.exponent} m
                      </span>
                      <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: step.visualColor }}
                      />
                    </div>
                    <div className="font-medium truncate mt-0.5">{step.name}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Optional Logarithmic Scale Graph (Powers of 10) for Advanced Students */}
        {showLogGraph && (
          <div className="rounded-xl border border-indigo-500/30 bg-slate-950 p-6 space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <BarChart3 className="size-4 text-indigo-400" />
                <h4 className="text-base font-bold text-white">
                  Logarithmic Scale Graph: Powers of Ten Number Line
                </h4>
              </div>
              <span className="text-xs font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded">
                Axis Base: 10^x meters
              </span>
            </div>

            <p className="text-xs text-slate-400">
              On a logarithmic axis, each equal horizontal division represents an entire{" "}
              <strong className="text-slate-200">factor of 10 (order of magnitude)</strong>. Notice
              how human beings, planets, stars, and galaxies each inhabit distinct mathematical
              registers.
            </p>

            {/* Horizontal Log Axis Graphic */}
            <div className="relative pt-6 pb-8 overflow-x-auto">
              <div className="min-w-[640px] relative h-28 bg-slate-900/70 rounded-lg border border-white/10 px-4 py-2">
                {/* Horizontal Baseline */}
                <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-indigo-500/40 -translate-y-1/2" />

                {/* Milestone Ticks */}
                {COSMIC_SCALE_STEPS.map((step) => {
                  const percent = (step.exponent / 26) * 100;
                  const isCurrent = Math.abs(exponent - step.exponent) < 1.0;
                  return (
                    <div
                      key={step.id}
                      className="absolute top-0 bottom-0 flex flex-col items-center -translate-x-1/2 cursor-pointer group"
                      style={{ left: `calc(1rem + ${percent}% * 0.92)` }}
                      onClick={() => jumpToStep(step)}
                    >
                      {/* Top Label */}
                      <span
                        className={`text-[9px] font-mono whitespace-nowrap mb-1 transition-colors ${
                          isCurrent
                            ? "font-bold text-cyan-400"
                            : "text-slate-400 group-hover:text-white"
                        }`}
                      >
                        10^{step.exponent}
                      </span>

                      {/* Tick Line */}
                      <div
                        className={`w-0.5 my-auto transition-all ${
                          isCurrent
                            ? "h-12 bg-cyan-400 shadow-[0_0_8px_#38bdf8]"
                            : "h-6 bg-slate-600 group-hover:h-8 group-hover:bg-slate-400"
                        }`}
                      />

                      {/* Bottom Name */}
                      <span
                        className={`text-[9px] font-sans whitespace-nowrap mt-1 truncate max-w-[80px] text-center transition-colors ${
                          isCurrent
                            ? "font-bold text-white"
                            : "text-slate-500 group-hover:text-slate-300"
                        }`}
                      >
                        {step.name.split(" ")[0]}
                      </span>
                    </div>
                  );
                })}

                {/* Active Indicator Pin */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none transition-all duration-200"
                  style={{ left: `calc(1rem + ${(exponent / 26) * 100}% * 0.92)` }}
                >
                  <div className="size-4 rounded-full bg-cyan-400 border-2 border-white shadow-[0_0_12px_#38bdf8] animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
