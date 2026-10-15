import React, { useState } from "react";
import type { StageContract, UserProgress } from "@/lib/academy/types";
import {
  Compass,
  List,
  Sparkles,
  MapPin,
  CheckCircle2,
  ChevronRight,
  Globe,
  Orbit,
  Disc,
  Activity,
  Cpu,
  Layers,
} from "lucide-react";

interface CosmicLearningMapProps {
  stages: StageContract[];
  progress: UserProgress;
  onSelectStage: (stageId: number) => void;
  activeStageId?: number;
}

const DESTINATION_VISUALS = [
  {
    stageId: 1,
    title: "Stage 1: Earth & Nearby Space",
    destination: "Earth & Nearby Space",
    icon: Globe,
    badgeColor: "from-cyan-500/30 to-blue-600/30 border-cyan-400/40 text-cyan-300",
    gradient: "from-cyan-900/40 via-blue-950/40 to-slate-900/80",
    orbitRadius: "1 AU",
    symbol: "🌍",
  },
  {
    stageId: 2,
    title: "Stage 2: Solar System",
    destination: "The Solar System",
    icon: Orbit,
    badgeColor: "from-amber-500/30 to-orange-600/30 border-amber-400/40 text-amber-300",
    gradient: "from-amber-900/40 via-orange-950/40 to-slate-900/80",
    orbitRadius: "100 AU",
    symbol: "🪐",
  },
  {
    stageId: 3,
    title: "Stage 3: Nebulae & Stars",
    destination: "Nebulae & Stellar Nurseries",
    icon: Sparkles,
    badgeColor: "from-pink-500/30 to-purple-600/30 border-pink-400/40 text-pink-300",
    gradient: "from-pink-900/40 via-purple-950/40 to-slate-900/80",
    orbitRadius: "1,000 Light-Years",
    symbol: "✨",
  },
  {
    stageId: 4,
    title: "Stage 4: Milky Way & Galaxies",
    destination: "Milky Way & Galaxy Clusters",
    icon: Disc,
    badgeColor: "from-purple-500/30 to-indigo-600/30 border-purple-400/40 text-purple-300",
    gradient: "from-purple-900/40 via-indigo-950/40 to-slate-900/80",
    orbitRadius: "100,000 Light-Years",
    symbol: "🌀",
  },
  {
    stageId: 5,
    title: "Stage 5: Cosmic Web & Early Universe",
    destination: "Cosmic Web & Early Universe",
    icon: Activity,
    badgeColor: "from-rose-500/30 to-red-600/30 border-rose-400/40 text-rose-300",
    gradient: "from-rose-900/40 via-red-950/40 to-slate-900/80",
    orbitRadius: "93 Billion Light-Years",
    symbol: "🕸️",
  },
  {
    stageId: 6,
    title: "Stage 6: Futuristic Observatory & Lab",
    destination: "Futuristic Observatory & Lab",
    icon: Cpu,
    badgeColor: "from-emerald-500/30 to-teal-600/30 border-emerald-400/40 text-emerald-300",
    gradient: "from-emerald-900/40 via-teal-950/40 to-slate-900/80",
    orbitRadius: "Frontier Science",
    symbol: "🔬",
  },
];

export function CosmicLearningMap({
  stages,
  progress,
  onSelectStage,
  activeStageId = 1,
}: CosmicLearningMapProps) {
  const [viewMode, setViewMode] = useState<"map" | "list">("map");

  return (
    <div className="w-full">
      {/* Map Control Bar & View Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="size-4 text-cyan-400" />
            <span className="text-xs font-semibold tracking-wider uppercase text-cyan-300">
              Interactive Cosmic Flightpath
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            Six Celestial Destinations
          </h2>
        </div>

        {/* Accessible Toggle */}
        <div className="inline-flex items-center p-1 rounded-xl bg-slate-900/80 border border-white/10 backdrop-blur-md">
          <button
            onClick={() => setViewMode("map")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              viewMode === "map"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Compass className="size-3.5" />
            <span>Cosmic Map View</span>
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              viewMode === "list"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <List className="size-3.5" />
            <span>Curriculum List</span>
          </button>
        </div>
      </div>

      {viewMode === "map" ? (
        /* Visual Interactive Cosmic Map Trail */
        <div className="relative rounded-3xl border border-white/10 bg-slate-950/70 p-6 sm:p-8 overflow-hidden backdrop-blur-xl">
          {/* Subtle cosmic star background dots */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-950/20 via-slate-950 to-slate-950 pointer-events-none" />

          {/* Connected Waypoint Trail (Horizontal desktop, Vertical mobile) */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {DESTINATION_VISUALS.map((dest, idx) => {
              const stage = stages.find((s) => s.id === dest.stageId);
              const stageModules = stage?.modules || [];
              const completedCount = stageModules.filter(
                (m) => progress.moduleProgress[m.id]?.status === "completed",
              ).length;
              const isSelected = activeStageId === dest.stageId;

              return (
                <button
                  key={dest.stageId}
                  onClick={() => onSelectStage(dest.stageId)}
                  className={`group relative text-left rounded-2xl border p-5 transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                    isSelected
                      ? "border-cyan-400 bg-gradient-to-br from-cyan-950/60 to-slate-900/90 shadow-xl shadow-cyan-950/40 ring-1 ring-cyan-400/40"
                      : "border-white/10 bg-slate-900/40 hover:bg-slate-900/70 hover:border-white/20"
                  }`}
                >
                  {/* Waypoint glowing accent */}
                  <div
                    className={`absolute -top-12 -right-12 size-28 rounded-full blur-2xl opacity-25 bg-gradient-to-br ${dest.badgeColor}`}
                  />

                  <div>
                    {/* Header: Stage Number + Scale tag */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-slate-400 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
                          Stage 0{dest.stageId}
                        </span>
                        {completedCount > 0 && (
                          <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="size-2.5" />
                            {completedCount}/{stageModules.length} Done
                          </span>
                        )}
                      </div>
                      <span className="text-2xl">{dest.symbol}</span>
                    </div>

                    {/* Destination name */}
                    <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {dest.destination}
                    </h3>
                    <p className="mt-1 text-xs text-slate-300/80 line-clamp-2">
                      {stage?.description}
                    </p>
                  </div>

                  {/* Footer details: Scale radius + Nav cue */}
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 font-mono text-[11px] text-cyan-400">
                      <MapPin className="size-3" />
                      {dest.orbitRadius}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-slate-300 group-hover:text-cyan-300 group-hover:translate-x-0.5 transition-all">
                      <span>Explore Stage</span>
                      <ChevronRight className="size-3" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Accessible List Alternative */
        <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-xl">
          <div className="divide-y divide-white/5">
            {stages.map((stage) => {
              const completedCount = stage.modules.filter(
                (m) => progress.moduleProgress[m.id]?.status === "completed",
              ).length;
              return (
                <div key={stage.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-cyan-400">
                          Stage {stage.id}:
                        </span>
                        <h4 className="text-base font-bold text-white">{stage.title}</h4>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Destination: {stage.spaceDestination} • {stage.modules.length} Modules
                      </p>
                    </div>
                    <button
                      onClick={() => onSelectStage(stage.id)}
                      className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                    >
                      <span>Jump to Stage</span>
                      <ChevronRight className="size-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
