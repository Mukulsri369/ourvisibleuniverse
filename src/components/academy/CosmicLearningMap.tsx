import React, { useState } from "react";
import type { StageContract, UserProgress } from "@/lib/academy/types";
import { ArrowUpRight, CheckCircle2, Compass, List } from "lucide-react";

interface CosmicLearningMapProps {
  stages: StageContract[];
  progress: UserProgress;
  onSelectStage: (stageId: number) => void;
  activeStageId?: number;
}

const STAGE_COORDINATES = [
  {
    stageId: 1,
    code: "01",
    destination: "Earth & Orbital Space",
    scale: "1.0 AU · TERRESTRIAL",
    accent: "text-[#38bdf8]",
  },
  {
    stageId: 2,
    code: "02",
    destination: "The Solar System",
    scale: "100 AU · HELIOSPHERE",
    accent: "text-[#f5d08a]",
  },
  {
    stageId: 3,
    code: "03",
    destination: "Nebulae & Stellar Nurseries",
    scale: "1,000 LY · STELLAR EVOLUTION",
    accent: "text-[#38bdf8]",
  },
  {
    stageId: 4,
    code: "04",
    destination: "Milky Way & Relativistic Cores",
    scale: "100,000 LY · GALACTIC DYNAMICS",
    accent: "text-[#f5d08a]",
  },
  {
    stageId: 5,
    code: "05",
    destination: "Cosmic Web & Early Universe",
    scale: "93 GLY · COSMOLOGY",
    accent: "text-[#38bdf8]",
  },
  {
    stageId: 6,
    code: "06",
    destination: "Frontier Observatory & Lab",
    scale: "DEEP FIELD · INSTRUMENTATION",
    accent: "text-[#f5d08a]",
  },
];

export function CosmicLearningMap({
  stages,
  progress,
  onSelectStage,
}: CosmicLearningMapProps) {
  const [viewMode, setViewMode] = useState<"map" | "list">("map");

  return (
    <div className="w-full">
      {/* Header Bar */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#38bdf8]">
            INTERACTIVE FLIGHTPATH · 06 CELESTIAL SECTORS
          </p>
          <h2
            className="mt-2 text-3xl font-normal uppercase tracking-tight text-white sm:text-4xl"
            style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
          >
            Six Celestial Destinations
          </h2>
        </div>

        <div className="inline-flex items-center gap-1 self-start rounded-full border border-white/10 bg-[#05060a] p-1 sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode("map")}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] transition-all ${
              viewMode === "map"
                ? "bg-[#f5d08a] font-semibold text-[#05060a]"
                : "text-white/55 hover:text-white"
            }`}
          >
            <Compass className="size-3" />
            <span>Sector Grid</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] transition-all ${
              viewMode === "list"
                ? "bg-[#f5d08a] font-semibold text-[#05060a]"
                : "text-white/55 hover:text-white"
            }`}
          >
            <List className="size-3" />
            <span>Index</span>
          </button>
        </div>
      </div>

      {viewMode === "map" ? (
        <div className="grid grid-cols-1 gap-[1px] border border-white/[0.08] bg-white/[0.08] md:grid-cols-2 lg:grid-cols-3">
          {STAGE_COORDINATES.map((coord) => {
            const stage = stages.find((s) => s.id === coord.stageId);
            const stageModules = stage?.modules || [];
            const completedCount = stageModules.filter(
              (m) =>
                progress.moduleProgress[m.id]?.isVerified ||
                progress.moduleProgress[m.id]?.status === "completed",
            ).length;

            return (
              <button
                key={coord.stageId}
                type="button"
                onClick={() => onSelectStage(coord.stageId)}
                className="group flex flex-col justify-between bg-[#05060a] p-8 text-left transition-colors duration-300 hover:bg-[#090d16]"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`font-mono text-[10px] uppercase tracking-[0.25em] ${coord.accent}`}>
                      STAGE {coord.code}
                    </span>
                    {completedCount > 0 ? (
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-400">
                        <CheckCircle2 className="size-3" />
                        {completedCount}/{stageModules.length}
                      </span>
                    ) : (
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">
                        {stageModules.length} MODULES
                      </span>
                    )}
                  </div>

                  <h3
                    className="mt-4 text-xl font-medium uppercase tracking-tight text-white transition-colors group-hover:text-[#f5d08a]"
                    style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
                  >
                    {coord.destination}
                  </h3>

                  <p className="mt-2 line-clamp-2 text-xs font-light leading-relaxed text-white/60">
                    {stage?.description}
                  </p>
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-white/[0.08] pt-4">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">
                    {coord.scale}
                  </span>
                  <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/70 transition-colors group-hover:text-[#f5d08a]">
                    <span>Sector</span>
                    <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="divide-y divide-white/[0.08] border border-white/[0.08] bg-[#05060a]">
          {stages.map((stage) => {
            const completedCount = stage.modules.filter(
              (m) =>
                progress.moduleProgress[m.id]?.isVerified ||
                progress.moduleProgress[m.id]?.status === "completed",
            ).length;
            return (
              <div
                key={stage.id}
                className="flex flex-col justify-between gap-4 p-6 transition-colors hover:bg-[#090d16] sm:flex-row sm:items-center"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#f5d08a]">
                      STAGE 0{stage.id}
                    </span>
                    <span className="text-white/20">•</span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">
                      {stage.spaceDestination}
                    </span>
                  </div>
                  <h4
                    className="mt-1 text-lg font-medium uppercase text-white"
                    style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
                  >
                    {stage.title}
                  </h4>
                </div>

                <div className="flex items-center gap-5">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">
                    {completedCount}/{stage.modules.length} Completed
                  </span>
                  <button
                    type="button"
                    onClick={() => onSelectStage(stage.id)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-white/85 transition-colors hover:border-[#f5d08a] hover:text-[#f5d08a]"
                  >
                    <span>Jump</span>
                    <ArrowUpRight className="size-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
