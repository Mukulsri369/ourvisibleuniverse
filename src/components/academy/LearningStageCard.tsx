import React from "react";
import type { ModuleContract, StageContract, UserProgress } from "@/lib/academy/types";
import { LearningModuleCard } from "./LearningModuleCard";

interface LearningStageCardProps {
  stage: StageContract;
  progress: UserProgress;
  onToggleBookmark: (id: string) => void;
  onSelectModule: (module: ModuleContract) => void;
}

export function LearningStageCard({
  stage,
  progress,
  onToggleBookmark,
  onSelectModule,
}: LearningStageCardProps) {
  const stageModules = stage.modules;
  const completedCount = stageModules.filter(
    (m) =>
      progress.moduleProgress[m.id]?.isVerified ||
      progress.moduleProgress[m.id]?.status === "completed",
  ).length;
  const stagePercent = Math.round((completedCount / stageModules.length) * 100);

  return (
    <div id={`stage-${stage.id}`} className="border border-white/[0.08] bg-[#05060a]">
      {/* Architectural Stage Header */}
      <div className="flex flex-col justify-between gap-6 border-b border-white/[0.08] p-7 sm:p-9 md:flex-row md:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#f5d08a]">
              STAGE 0{stage.id}
            </span>
            <span className="text-white/20">•</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#38bdf8]">
              SECTOR: {stage.spaceDestination}
            </span>
          </div>

          <h3
            className="mt-3 text-2xl font-normal uppercase tracking-tight text-white sm:text-3xl"
            style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
          >
            {stage.title}
          </h3>
          <p className="mt-2 max-w-2xl text-xs font-light leading-relaxed text-white/65 sm:text-sm">
            {stage.description}
          </p>
        </div>

        {/* Minimalist Completion Telemetry */}
        <div className="min-w-[180px] border-t border-white/[0.08] pt-4 md:border-t-0 md:pt-0 md:text-right">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">
            STAGE COMPLETION
          </div>
          <div className="mt-1 flex items-baseline gap-1.5 md:justify-end">
            <span
              className="text-2xl font-normal text-white"
              style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
            >
              0{completedCount}
            </span>
            <span className="font-mono text-xs text-white/40">/ 0{stageModules.length} MODULES</span>
          </div>
          <div className="mt-2 h-[2px] w-full overflow-hidden bg-white/10">
            <div
              className="h-full bg-[#f5d08a] transition-all duration-500"
              style={{ width: `${stagePercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 1px Hairline 4-Module Grid */}
      <div className="grid grid-cols-1 gap-[1px] bg-white/[0.08] sm:grid-cols-2 lg:grid-cols-4">
        {stageModules.map((module) => {
          const modProgress = progress.moduleProgress[module.id];
          const status = modProgress?.status || "not_started";
          const percent = modProgress?.percent || 0;
          const isBookmarked = progress.bookmarks.includes(module.id);

          return (
            <LearningModuleCard
              key={module.id}
              module={module}
              status={status}
              percent={percent}
              isBookmarked={isBookmarked}
              isVerified={modProgress?.isVerified}
              evidenceCount={modProgress?.evidenceCount}
              onToggleBookmark={onToggleBookmark}
              onSelectModule={onSelectModule}
            />
          );
        })}
      </div>
    </div>
  );
}
