import React, { useState } from "react";
import { Compass, ArrowRight, Eye, Box, Layers, HelpCircle, ExternalLink } from "lucide-react";
import {
  analyzeProjectionDifference,
  type ProjectedPairAnalysis,
} from "@/lib/astronomy/observation/projection-difference";

interface PredefinedPair {
  name: string;
  description: string;
  objA: { name: string; raDeg: number; decDeg: number; distanceLy: number };
  objB: { name: string; raDeg: number; decDeg: number; distanceLy: number };
}

const PREDEFINED_PAIRS: PredefinedPair[] = [
  {
    name: "Alpheratz (Foreground Star) vs Andromeda Galaxy (M31)",
    description: "Classic foreground star optical projection against an extragalactic neighbor.",
    objA: {
      name: "Alpheratz (Alpha Andromedae)",
      raDeg: 2.0969,
      decDeg: 29.0904,
      distanceLy: 97.0,
    },
    objB: {
      name: "Andromeda Galaxy (M31)",
      raDeg: 10.6847,
      decDeg: 41.2687,
      distanceLy: 2_537_000.0,
    },
  },
  {
    name: "Betelgeuse vs Bellatrix (Orion Constellation Depth)",
    description:
      "Constellation stars that appear adjacent on Earth's night sky but are separated by hundreds of light-years in depth.",
    objA: {
      name: "Betelgeuse (Alpha Orionis)",
      raDeg: 88.7929,
      decDeg: 7.4071,
      distanceLy: 548.0,
    },
    objB: {
      name: "Bellatrix (Gamma Orionis)",
      raDeg: 81.2828,
      decDeg: 6.3497,
      distanceLy: 252.0,
    },
  },
  {
    name: "Cygnus X-1 vs Background Galactic Arm",
    description: "Stellar black hole binary projected along the dense Cygnus spiral arm.",
    objA: {
      name: "Cygnus X-1 (Black Hole)",
      raDeg: 299.5903,
      decDeg: 35.2016,
      distanceLy: 7_240.0,
    },
    objB: {
      name: "Deneb (Alpha Cygni)",
      raDeg: 310.3579,
      decDeg: 45.2803,
      distanceLy: 2_615.0,
    },
  },
  {
    name: "Orion Nebula (M42) vs Rigel",
    description:
      "Orion star-forming complex depth comparison across the Orion-Eridanus superbubble.",
    objA: {
      name: "Rigel (Beta Orionis)",
      raDeg: 78.6345,
      decDeg: -8.2016,
      distanceLy: 860.0,
    },
    objB: {
      name: "Orion Nebula (M42)",
      raDeg: 83.8221,
      decDeg: -5.3911,
      distanceLy: 1_344.0,
    },
  },
];

export function ProjectionDifferenceInspector() {
  const [selectedPairIndex, setSelectedPairIndex] = useState<number>(0);
  const activePair = PREDEFINED_PAIRS[selectedPairIndex];

  const analysis: ProjectedPairAnalysis = analyzeProjectionDifference(
    activePair.objA,
    activePair.objB,
  );

  return (
    <div className="space-y-6 text-slate-100">
      {/* 1. Header & Concept Explainer */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/30 space-y-2">
        <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider font-bold">
          <Compass className="size-4" />
          <span>2D Sky Projection vs 3D Physical Distance Demarcation</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          In 2D astronomical photographs, two objects can appear directly adjacent or overlapping
          due to line-of-sight projection. A scientifically authentic 3D universe must preserve and
          demonstrate the true physical depth separating them.
        </p>
      </div>

      {/* 2. Predefined Pair Selector */}
      <div className="space-y-2">
        <label className="text-xs font-mono uppercase tracking-wider text-slate-400">
          Select Benchmark Alignment Case:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PREDEFINED_PAIRS.map((pair, idx) => (
            <button
              key={pair.name}
              onClick={() => setSelectedPairIndex(idx)}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedPairIndex === idx
                  ? "bg-cyan-950/40 border-cyan-400 text-white shadow-lg shadow-cyan-500/10"
                  : "bg-slate-900/70 border-white/10 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <div className="text-xs font-bold font-mono">{pair.name}</div>
              <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">{pair.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Dual Comparative Visualizer: 2D Projection vs 3D Depth */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: 2D Celestial Projection */}
        <div className="p-4 rounded-xl bg-slate-900 border border-white/10 space-y-3 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400">
              <Eye className="size-4" />
              <span>2D Telescope Sky Projection (Apparent Proximity)</span>
            </div>
            <p className="text-[11px] text-slate-400">
              How the pair appears projected onto the 2D celestial sphere as seen from Earth.
            </p>
          </div>

          {/* SVG Celestial Sphere Projection */}
          <div className="relative w-full h-48 bg-slate-950 rounded-lg border border-white/10 flex items-center justify-center overflow-hidden">
            <svg viewBox="0 0 300 160" className="w-full h-full">
              {/* Coordinate grid lines */}
              <circle
                cx="150"
                cy="80"
                r="70"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeDasharray="3 3"
              />
              <line x1="80" y1="80" x2="220" y2="80" stroke="rgba(255,255,255,0.15)" />
              <line x1="150" y1="10" x2="150" y2="150" stroke="rgba(255,255,255,0.15)" />

              {/* Object A */}
              <circle cx="130" cy="80" r="6" fill="#38bdf8" />
              <text
                x="130"
                y="68"
                fill="#38bdf8"
                fontSize="10"
                textAnchor="middle"
                fontFamily="monospace"
              >
                {activePair.objA.name.split(" ")[0]}
              </text>

              {/* Angular separation arc */}
              <line x1="130" y1="80" x2="170" y2="80" stroke="#f59e0b" strokeWidth="2" />
              <circle cx="170" cy="80" r="6" fill="#ec4899" />
              <text
                x="170"
                y="68"
                fill="#ec4899"
                fontSize="10"
                textAnchor="middle"
                fontFamily="monospace"
              >
                {activePair.objB.name.split(" ")[0]}
              </text>

              {/* Angular Separation Label */}
              <text
                x="150"
                y="98"
                fill="#fef08a"
                fontSize="10"
                fontWeight="bold"
                textAnchor="middle"
                fontFamily="monospace"
              >
                Δθ = {analysis.angularSeparationDeg.toFixed(2)}°
              </text>
            </svg>
          </div>

          <div className="text-[11px] font-mono text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-white/5 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Angular Separation:</span>
              <span className="font-bold text-amber-300">
                {analysis.angularSeparationDeg.toFixed(2)}° (
                {analysis.angularSeparationArcmin.toFixed(1)}′)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Projected Transverse Span:</span>
              <span>
                ≈{" "}
                {analysis.projectedTransverseSeparationLy.toLocaleString(undefined, {
                  maximumFractionDigits: 1,
                })}{" "}
                ly
              </span>
            </div>
          </div>
        </div>

        {/* Right: 3D Line-of-Sight Radial Depth */}
        <div className="p-4 rounded-xl bg-slate-900 border border-white/10 space-y-3 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400">
              <Box className="size-4" />
              <span>3D Euclidean Line-of-Sight Depth (Physical Reality)</span>
            </div>
            <p className="text-[11px] text-slate-400">
              True physical distance in 3D space, uncovering vast depths between visually aligned
              bodies.
            </p>
          </div>

          {/* SVG 3D Radial Depth Diagram */}
          <div className="relative w-full h-48 bg-slate-950 rounded-lg border border-white/10 flex items-center justify-center overflow-hidden">
            <svg viewBox="0 0 300 160" className="w-full h-full">
              {/* Observer Earth */}
              <circle cx="30" cy="80" r="5" fill="#4ade80" />
              <text
                x="30"
                y="100"
                fill="#4ade80"
                fontSize="9"
                textAnchor="middle"
                fontFamily="monospace"
              >
                Earth (Observer)
              </text>

              {/* Line of sight beam */}
              <line
                x1="30"
                y1="80"
                x2="270"
                y2="80"
                stroke="rgba(255,255,255,0.15)"
                strokeDasharray="2 2"
              />

              {/* Object A (Nearer) */}
              <circle cx="100" cy="74" r="6" fill="#38bdf8" />
              <text
                x="100"
                y="60"
                fill="#38bdf8"
                fontSize="9"
                textAnchor="middle"
                fontFamily="monospace"
              >
                {activePair.objA.distanceLy.toLocaleString()} ly
              </text>

              {/* Physical Depth Vector */}
              <line x1="100" y1="80" x2="250" y2="80" stroke="#06b6d4" strokeWidth="2.5" />
              <polygon points="250,77 256,80 250,83" fill="#06b6d4" />

              {/* Object B (Farther) */}
              <circle cx="256" cy="86" r="6" fill="#ec4899" />
              <text
                x="256"
                y="105"
                fill="#ec4899"
                fontSize="9"
                textAnchor="middle"
                fontFamily="monospace"
              >
                {activePair.objB.distanceLy.toLocaleString()} ly
              </text>

              {/* True 3D Distance Label */}
              <text
                x="175"
                y="72"
                fill="#67e8f9"
                fontSize="10"
                fontWeight="bold"
                textAnchor="middle"
                fontFamily="monospace"
              >
                Depth:{" "}
                {analysis.radialDepthSeparationLy.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}{" "}
                ly
              </text>
            </svg>
          </div>

          <div className="text-[11px] font-mono text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-white/5 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Radial Depth Separation:</span>
              <span className="font-bold text-cyan-300">
                {analysis.radialDepthSeparationLy.toLocaleString(undefined, {
                  maximumFractionDigits: 1,
                })}{" "}
                ly
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Depth-to-Transverse Ratio:</span>
              <span className="font-bold text-purple-300">
                {analysis.depthToTransverseRatio.toFixed(1)}× depth exaggeration
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Scientific Verdict & Physical Explanation */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-200">
          <Layers className="size-4 text-cyan-400" />
          <span>Astrometric Analysis:</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-mono">
          {analysis.scientificExplanation}
        </p>
      </div>
    </div>
  );
}
