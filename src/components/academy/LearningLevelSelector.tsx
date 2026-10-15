import React from "react";
import { LEARNING_LEVELS } from "@/lib/academy/registry";
import type { LearningLevel } from "@/lib/academy/types";
import { Sparkles, Check, GraduationCap } from "lucide-react";

interface LearningLevelSelectorProps {
  currentLevel: LearningLevel;
  onSelectLevel: (level: LearningLevel) => void;
  compact?: boolean;
}

export function LearningLevelSelector({
  currentLevel,
  onSelectLevel,
  compact = false,
}: LearningLevelSelectorProps) {
  const levels = Object.values(LEARNING_LEVELS);

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 border border-white/10 rounded-xl backdrop-blur-md">
        {levels.map((lvl) => {
          const active = currentLevel === lvl.id;
          return (
            <button
              key={lvl.id}
              onClick={() => onSelectLevel(lvl.id as LearningLevel)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                active
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>{lvl.name}</span>
              <span className="text-[10px] text-slate-400 hidden sm:inline">
                ({lvl.gradeRange})
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <GraduationCap className="size-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            Choose Your Learning Level
          </h3>
        </div>
        <span className="text-xs text-slate-400">Switch anytime without losing progress</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {levels.map((lvl) => {
          const active = currentLevel === lvl.id;
          return (
            <button
              key={lvl.id}
              onClick={() => onSelectLevel(lvl.id as LearningLevel)}
              className={`relative text-left p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                active
                  ? "border-cyan-500/60 bg-gradient-to-b from-cyan-950/40 to-slate-900/90 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500/30"
                  : "border-white/10 bg-slate-900/40 hover:bg-slate-900/70 hover:border-white/20"
              }`}
            >
              {active && (
                <div className="absolute top-3 right-3 size-5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center">
                  <Check className="size-3" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-cyan-300">
                    {lvl.gradeRange}
                  </span>
                  <span className="text-xs text-slate-400">{lvl.targetAudience}</span>
                </div>
                <h4 className="mt-2 text-base font-bold text-white flex items-center gap-1.5">
                  {lvl.name}
                </h4>
                <p className="mt-1 text-xs text-slate-300 leading-relaxed">{lvl.description}</p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-mono text-cyan-400/90">{lvl.badge}</span>
                <span className={active ? "text-cyan-300 font-medium" : "text-slate-500"}>
                  {active ? "Active Level" : "Click to Select"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
