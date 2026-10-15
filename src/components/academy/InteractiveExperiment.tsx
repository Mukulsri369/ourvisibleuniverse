import React, { useState } from "react";
import { Play, Pause, RotateCcw, Zap, Compass, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const TARGETS = [
  {
    name: "Moon",
    distanceKm: "384,400 km",
    lightTime: "1.28 Seconds",
    seconds: 1.28,
    symbol: "🌕",
    fact: "Astronauts on the Moon had a 2.5-second radio delay chatting with Mission Control in Houston.",
  },
  {
    name: "Sun",
    distanceKm: "149,600,000 km (1 AU)",
    lightTime: "8.3 Minutes",
    seconds: 499,
    symbol: "☀️",
    fact: "If the Sun suddenly turned green, you wouldn't know for over eight minutes!",
  },
  {
    name: "Mars (Average)",
    distanceKm: "225,000,000 km (1.5 AU)",
    lightTime: "12.5 Minutes",
    seconds: 750,
    symbol: "🔴",
    fact: "NASA Mars rovers must drive autonomously because live joystick control is impossible due to light speed delay.",
  },
  {
    name: "Voyager 1 Probe",
    distanceKm: "24,500,000,000 km (164 AU)",
    lightTime: "22.7 Hours",
    seconds: 81720,
    symbol: "🛰️",
    fact: "Traveling since 1977, Voyager 1 is our most distant robotic emissary in interstellar space.",
  },
  {
    name: "Alpha Centauri",
    distanceKm: "41.3 Trillion km",
    lightTime: "4.24 Years",
    seconds: 133700000,
    symbol: "✨",
    fact: "The light you see from our closest neighbor star set out when you were a few years younger.",
  },
  {
    name: "Center of Milky Way (Sagittarius A*)",
    distanceKm: "246 Quadrillion km",
    lightTime: "26,000 Years",
    seconds: 820000000000,
    symbol: "🌀",
    fact: "The light arriving today left the core when prehistoric humans were painting caves in the Ice Age.",
  },
];

interface InteractiveExperimentProps {
  onCompleteExperiment?: () => void;
}

export function InteractiveExperiment({ onCompleteExperiment }: InteractiveExperimentProps) {
  const [selectedTargetIndex, setSelectedTargetIndex] = useState(0);
  const [simulating, setSimulating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [testedCount, setTestedCount] = useState(1);

  const target = TARGETS[selectedTargetIndex];

  const handleRunSimulation = () => {
    setSimulating(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setSimulating(false);
          setTestedCount((c) => Math.max(c, selectedTargetIndex + 1));
          onCompleteExperiment?.();
          return 100;
        }
        return prev + 10;
      });
    }, 120);
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-6 sm:p-8 backdrop-blur-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
              Step E: Hands-on Cosmic Experiment
            </span>
            <span className="text-xs text-slate-400">Physics Sandbox</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Speed of Light Travel Time Laboratory
          </h3>
        </div>

        <div className="text-xs text-slate-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
          c = 299,792 km/second
        </div>
      </div>

      {/* Target Selector Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-6">
        {TARGETS.map((t, idx) => {
          const active = idx === selectedTargetIndex;
          return (
            <button
              key={t.name}
              onClick={() => {
                setSelectedTargetIndex(idx);
                setProgress(0);
                setSimulating(false);
              }}
              className={`p-3 rounded-xl border text-left transition-all ${
                active
                  ? "bg-amber-500/20 border-amber-400 text-white shadow-md shadow-amber-500/10 ring-1 ring-amber-400/30"
                  : "bg-white/[0.02] border-white/5 text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <div className="text-xl mb-1">{t.symbol}</div>
              <div className="text-xs font-bold text-white line-clamp-1">{t.name}</div>
              <div className="text-[10px] font-mono text-amber-300 mt-0.5">{t.lightTime}</div>
            </button>
          );
        })}
      </div>

      {/* Experiment Simulation Chamber */}
      <div className="rounded-2xl border border-amber-500/30 bg-slate-950 p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-mono mb-1">
              <span>Origin: Planet Earth (1.0 AU)</span>
              <span>→</span>
              <span>Target: {target.name}</span>
            </div>
            <h4 className="text-2xl font-extrabold text-white">
              Light Travel Delay: {target.lightTime}
            </h4>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Physical Separation: {target.distanceKm}
            </p>
          </div>

          <Button
            size="lg"
            onClick={handleRunSimulation}
            disabled={simulating}
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-semibold shadow-md shadow-amber-500/20 border-none"
          >
            <Zap className="size-4 mr-2" />
            {simulating ? "Transmitting Photon Stream..." : "Fire Photon Signal"}
          </Button>
        </div>

        {/* Transmission Beam Visualizer */}
        <div className="py-6">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
            <span>🌍 Earth Transmitter</span>
            <span>Photon Wavefront: {progress}%</span>
            <span>
              {target.symbol} {target.name}
            </span>
          </div>

          <div className="relative w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-amber-300 to-amber-500 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
            {simulating && (
              <div
                className="absolute top-0 bottom-0 w-4 bg-white blur-[2px] transition-all duration-200"
                style={{ left: `calc(${progress}% - 8px)` }}
              />
            )}
          </div>
        </div>

        {/* Experiment Insight Note */}
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 text-xs text-amber-200/90 leading-relaxed flex items-start gap-2.5">
          <Sparkles className="size-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-300 block mb-0.5">Physical Reality Check:</span>
            <span>{target.fact}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
