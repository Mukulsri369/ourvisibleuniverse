import React, { useState } from "react";
import { COSMIC_ADDRESS_STEPS } from "@/lib/academy/lessons/module-01-our-place";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
  Info,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ScientificVisualizationProps {
  onInteract?: () => void;
}

export function ScientificVisualization({ onInteract }: ScientificVisualizationProps) {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const currentStep = COSMIC_ADDRESS_STEPS[activeStepIndex];

  const handleNext = () => {
    if (activeStepIndex < COSMIC_ADDRESS_STEPS.length - 1) {
      setActiveStepIndex((prev) => prev + 1);
      onInteract?.();
    }
  };

  const handlePrev = () => {
    if (activeStepIndex > 0) {
      setActiveStepIndex((prev) => prev - 1);
      onInteract?.();
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-6 sm:p-8 backdrop-blur-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
              Step C: Interactive Scientific Visualization
            </span>
            <span className="text-xs text-slate-400">Logarithmic Scale Zoom</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Cosmic Scale Navigator: 10<sup>7</sup> m to 10<sup>26</sup> m
          </h3>
        </div>

        {/* Step Counter Indicator */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrev}
            disabled={activeStepIndex === 0}
            className="border-white/10 text-slate-300 hover:text-white"
          >
            <ChevronLeft className="size-4 mr-1" />
            <span>Zoom In</span>
          </Button>
          <span className="text-xs font-mono text-cyan-400 px-2">
            {activeStepIndex + 1} / {COSMIC_ADDRESS_STEPS.length}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={activeStepIndex === COSMIC_ADDRESS_STEPS.length - 1}
            className="border-white/10 text-slate-300 hover:text-white"
          >
            <span>Zoom Out</span>
            <ChevronRight className="size-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Main Interactive Canvas Stage */}
      <div className="relative rounded-2xl border border-cyan-500/30 bg-slate-950 p-6 sm:p-10 min-h-[360px] flex flex-col justify-between overflow-hidden shadow-inner">
        {/* Visual Simulated Background based on scale level */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div
            className="w-full h-full transition-all duration-700"
            style={{
              backgroundImage:
                activeStepIndex < 2
                  ? "radial-gradient(circle at center, #0284c7 0%, transparent 60%)"
                  : activeStepIndex < 4
                    ? "radial-gradient(circle at center, #818cf8 0%, transparent 65%)"
                    : activeStepIndex < 6
                      ? "radial-gradient(circle at center, #c084fc 0%, transparent 70%)"
                      : "radial-gradient(circle at center, #f43f5e 0%, transparent 75%)",
            }}
          />
        </div>

        {/* Top Scale Gauge */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{currentStep.icon}</span>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 block">
                {currentStep.tag}
              </span>
              <h4 className="text-2xl font-extrabold text-white">{currentStep.name}</h4>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-slate-400 block">Spatial Dimension</span>
            <span className="text-base font-mono font-bold text-amber-300">
              {currentStep.scale}
            </span>
            <span className="text-[10px] text-slate-500 block font-mono">
              Order ~10<sup>{currentStep.scaleExponent}</sup> meters
            </span>
          </div>
        </div>

        {/* Central Visualization Graphical Representation */}
        <div className="relative z-10 py-8 flex flex-col items-center justify-center text-center">
          <div className="relative flex items-center justify-center">
            {/* Concentric orbital rings */}
            <div className="absolute size-48 sm:size-64 rounded-full border border-dashed border-cyan-400/20 animate-spin [animation-duration:60s]" />
            <div className="absolute size-36 sm:size-48 rounded-full border border-cyan-500/30 animate-spin [animation-duration:35s]" />

            {/* Central glowing celestial entity */}
            <div className="size-24 sm:size-32 rounded-full bg-gradient-to-tr from-cyan-600 via-sky-400 to-indigo-500 flex items-center justify-center text-5xl sm:text-6xl shadow-2xl shadow-cyan-500/40 transform transition-transform duration-500 hover:scale-110">
              {currentStep.icon}
            </div>
          </div>

          <p className="mt-6 text-sm sm:text-base text-slate-200 max-w-lg leading-relaxed">
            {currentStep.description}
          </p>
        </div>

        {/* Bottom Interactive Scale Steps Track */}
        <div className="relative z-10 pt-4 border-t border-white/10">
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
            {COSMIC_ADDRESS_STEPS.map((step, idx) => {
              const active = idx === activeStepIndex;
              return (
                <button
                  key={step.step}
                  onClick={() => {
                    setActiveStepIndex(idx);
                    onInteract?.();
                  }}
                  className={`p-2 rounded-xl text-center border transition-all ${
                    active
                      ? "bg-cyan-500/20 border-cyan-400 text-white shadow-md shadow-cyan-500/20"
                      : "bg-white/[0.02] border-white/5 text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className="text-base block">{step.icon}</span>
                  <span className="text-[10px] font-mono block mt-1 truncate">{step.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
