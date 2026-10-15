import React from "react";
import type { ModuleContract, StageContract, UserProgress } from "@/lib/academy/types";
import { LearningModuleCard } from "./LearningModuleCard";
import { MapPin, Sparkles, CheckCircle2 } from "lucide-react";

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
  // Compute stage progress percentage
  const stageModules = stage.modules;
  const completedCount = stageModules.filter(
    (m) => progress.moduleProgress[m.id]?.status === "completed",
  ).length;
  const stagePercent = Math.round((completedCount / stageModules.length) * 100);

  return (
    <div
      id={`stage-${stage.id}`}
      className="rounded-3xl border border-white/10 bg-slate-900/40 backdrop-blur-xl p-6 sm:p-8 transition-all hover:border-white/20"
    >
      {/* Stage Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 rounded-full uppercase tracking-wider">
              Stage 0{stage.id}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
              <MapPin className="size-3 text-cyan-400" />
              <span>Destination: {stage.spaceDestination}</span>
            </div>
          </div>

          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {stage.title}
          </h3>
          <p className="mt-1 text-sm text-slate-400 max-w-2xl leading-relaxed">
            {stage.description}
          </p>
        </div>

        {/* Stage Progress Gauge */}
        <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center p-3 rounded-2xl bg-white/[0.03] border border-white/5 min-w-[160px]">
          <div className="text-xs text-slate-400 font-medium">Stage Completion</div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-extrabold text-white">{completedCount}</span>
            <span className="text-xs text-slate-400">/ {stageModules.length} Modules</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden hidden md:block">
            <div
              className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full transition-all duration-500"
              style={{ width: `${stagePercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
              onToggleBookmark={onToggleBookmark}
              onSelectModule={onSelectModule}
            />
          );
        })}
      </div>
    </div>
  );
}
