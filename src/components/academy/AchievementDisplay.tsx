import React from "react";
import { INITIAL_ACHIEVEMENTS } from "@/lib/academy/progress";
import { Award, Lock, Sparkles } from "lucide-react";

interface AchievementDisplayProps {
  unlockedIds: string[];
}

export function AchievementDisplay({ unlockedIds }: AchievementDisplayProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Award className="size-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            Cosmic Achievements & Badges
          </h3>
        </div>
        <span className="text-xs text-slate-400">
          {unlockedIds.length} of {INITIAL_ACHIEVEMENTS.length} Unlocked
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {INITIAL_ACHIEVEMENTS.map((ach) => {
          const unlocked = unlockedIds.includes(ach.id);
          return (
            <div
              key={ach.id}
              className={`rounded-xl border p-3 text-center flex flex-col items-center justify-between transition-all ${
                unlocked
                  ? "border-amber-500/40 bg-gradient-to-b from-amber-950/20 to-slate-900/60 shadow-sm shadow-amber-500/10"
                  : "border-white/5 bg-white/[0.01] opacity-50"
              }`}
            >
              <div className="text-2xl mb-1.5">{unlocked ? ach.icon : "🔒"}</div>
              <h4 className="text-xs font-bold text-white line-clamp-1">{ach.title}</h4>
              <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-tight">
                {ach.description}
              </p>
              {unlocked ? (
                <span className="mt-2 text-[9px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                  Unlocked
                </span>
              ) : (
                <span className="mt-2 text-[9px] font-mono text-slate-400">Locked</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
