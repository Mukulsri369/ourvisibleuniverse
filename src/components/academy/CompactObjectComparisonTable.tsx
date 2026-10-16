import React, { useState } from "react";
import {
  COMPACT_OBJECTS,
  CompactObjectComparison,
} from "@/lib/academy/lessons/module-14-black-holes";
import { Scale, Sparkles, ShieldCheck, Zap, Info, Layers } from "lucide-react";
import type { LearningLevel } from "@/lib/academy/types";

interface CompactObjectComparisonTableProps {
  learningLevel: LearningLevel;
}

export function CompactObjectComparisonTable({ learningLevel }: CompactObjectComparisonTableProps) {
  const [selectedId, setSelectedId] = useState<string>("neutron_star");
  const [teaspoons, setTeaspoons] = useState<number>(1);

  const selectedObj = COMPACT_OBJECTS.find((o) => o.id === selectedId) || COMPACT_OBJECTS[1];

  // Teaspoon weight analogies
  const teaspoonAnalogy = (id: string, count: number) => {
    switch (id) {
      case "white_dwarf":
        return `${(count * 5.5).toFixed(1)} Metric Tons (About the weight of an adult African elephant!)`;
      case "neutron_star":
        return `${(count * 1.1).toFixed(1)} Billion Metric Tons (Equivalent to the entire mass of Mount Everest!)`;
      case "stellar_black_hole":
        return "Cannot be measured in teaspoons: all mass collapsed to a zero-volume gravitational singularity!";
      case "supermassive_black_hole":
        return "Because the Schwarzschild radius scales linearly with mass (r_s ∝ M), average density inside the event horizon can be lower than ordinary water (~1.0 g/cm³)!";
      default:
        return "";
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-0.5 rounded-full uppercase tracking-wider">
              Astrophysics Comparison Lab
            </span>
            <span className="text-xs text-slate-400">
              White Dwarfs vs Neutron Stars vs Black Holes
            </span>
          </div>
          <h3 className="text-2xl font-extrabold text-white">
            Comparing Nature&apos;s Ultimate Remnants
          </h3>
        </div>

        {/* Object Selector Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {COMPACT_OBJECTS.map((obj) => (
            <button
              key={obj.id}
              onClick={() => setSelectedId(obj.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                selectedId === obj.id
                  ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/30 border border-amber-400"
                  : "bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/10"
              }`}
            >
              {obj.name}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Object Detail Hero Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-amber-500/20">
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center gap-2">
            <h4 className="text-2xl font-extrabold text-white">{selectedObj.name}</h4>
            <span className="text-xs font-mono text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded">
              {selectedObj.type}
            </span>
          </div>

          <p className="text-sm text-slate-200 leading-relaxed">
            {selectedObj.analogy[learningLevel]}
          </p>

          <div className="pt-2 text-xs text-slate-400">
            <strong className="text-slate-300">Astronomical Benchmark: </strong>
            <span>{selectedObj.realWorldExample}</span>
          </div>
        </div>

        {/* Quick Specs Column */}
        <div className="space-y-2.5 text-xs bg-white/[0.02] border border-white/5 p-4 rounded-xl">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Radius Scale:</span>
            <span className="font-mono text-amber-300 font-bold text-sm">
              {selectedObj.typicalRadius}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Physical Density:</span>
            <span className="font-mono text-white text-xs">{selectedObj.densityKgM3}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Support Mechanism:</span>
            <span className="font-mono text-cyan-300 text-xs">{selectedObj.supportMechanism}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Escape Velocity:</span>
            <span className="font-mono text-emerald-300 text-xs">
              {selectedObj.surfaceEscapeVelocity}
            </span>
          </div>
        </div>
      </div>

      {/* Teaspoon Density Calculator */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Scale className="size-4 text-amber-400" />
            <h5 className="text-sm font-bold text-white">How Heavy is a Teaspoon of This Star?</h5>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Teaspoons:</span>
            {[1, 2, 5].map((amt) => (
              <button
                key={amt}
                onClick={() => setTeaspoons(amt)}
                className={`px-2.5 py-0.5 rounded border text-xs font-mono ${
                  teaspoons === amt
                    ? "bg-amber-500 text-slate-950 font-bold border-amber-400"
                    : "bg-white/5 text-slate-300 border-white/10"
                }`}
              >
                {amt} tsp
              </button>
            ))}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-200 text-xs font-mono">
          {teaspoonAnalogy(selectedObj.id, teaspoons)}
        </div>
      </div>

      {/* Side-by-Side Comparison Matrix */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
              <th className="py-3 px-3">Remnant</th>
              <th className="py-3 px-3">Mass Range</th>
              <th className="py-3 px-3">Typical Size</th>
              <th className="py-3 px-3">Quantum Barrier</th>
              <th className="py-3 px-3">Magnetic Field</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-300">
            {COMPACT_OBJECTS.map((obj) => (
              <tr
                key={obj.id}
                onClick={() => setSelectedId(obj.id)}
                className={`cursor-pointer transition-colors ${
                  selectedId === obj.id
                    ? "bg-amber-500/10 text-white font-semibold"
                    : "hover:bg-white/[0.02]"
                }`}
              >
                <td className="py-3 px-3 text-white font-bold flex items-center gap-2">
                  <span className="size-2 rounded-full bg-amber-400" />
                  <span>{obj.name}</span>
                </td>
                <td className="py-3 px-3 font-mono">{obj.typicalMass}</td>
                <td className="py-3 px-3 font-mono text-cyan-300">{obj.typicalRadius}</td>
                <td className="py-3 px-3">{obj.supportMechanism.split("(")[0]}</td>
                <td className="py-3 px-3 font-mono text-purple-300">{obj.magneticFieldTesla}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
