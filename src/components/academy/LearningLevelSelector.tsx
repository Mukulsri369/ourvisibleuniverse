import React from "react";
import { LEARNING_LEVELS } from "@/lib/academy/registry";
import type { LearningLevel } from "@/lib/academy/types";
import { Check } from "lucide-react";

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
      <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-[#05060a]/80 p-1 backdrop-blur-xl">
        {levels.map((lvl) => {
          const active = currentLevel === lvl.id;
          return (
            <button
              key={lvl.id}
              onClick={() => onSelectLevel(lvl.id as LearningLevel)}
              className={`rounded-full px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] transition-all flex items-center gap-1.5 ${
                active
                  ? "bg-[#f5d08a] font-semibold text-[#05060a]"
                  : "text-white/55 hover:text-white"
              }`}
            >
              <span>{lvl.name}</span>
              <span className="hidden opacity-75 sm:inline">({lvl.gradeRange})</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#f5d08a]">
            COGNITIVE CALIBRATION · 03 DEPTH TIERS
          </p>
          <h3
            className="mt-2 text-2xl font-normal uppercase tracking-tight text-white sm:text-3xl"
            style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
          >
            Select Curriculum Depth
          </h3>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">
          Switch tiers anytime · Progress preserved
        </span>
      </div>

      {/* 1px Hairline Architectural Grid */}
      <div className="grid grid-cols-1 gap-[1px] border border-white/[0.08] bg-white/[0.08] md:grid-cols-3">
        {levels.map((lvl, idx) => {
          const active = currentLevel === lvl.id;
          return (
            <button
              key={lvl.id}
              type="button"
              onClick={() => onSelectLevel(lvl.id as LearningLevel)}
              className={`group relative flex flex-col justify-between p-7 text-left transition-colors duration-300 ${
                active ? "bg-[#0b0f1a]" : "bg-[#05060a] hover:bg-[#080b12]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#f5d08a]">
                    0{idx + 1} · {lvl.gradeRange}
                  </span>
                  {active ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-[#f5d08a]/40 bg-[#f5d08a]/15 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-[#f5d08a]">
                      <Check className="size-2.5" />
                      Active
                    </span>
                  ) : (
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/35 group-hover:text-white/70">
                      Select Tier
                    </span>
                  )}
                </div>

                <h4
                  className="mt-4 text-xl font-medium uppercase tracking-tight text-white"
                  style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
                >
                  {lvl.name}
                </h4>

                <p className="mt-2 text-xs font-light leading-relaxed text-white/60">
                  {lvl.description}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-white/[0.08] pt-4 font-mono text-[10px] uppercase tracking-[0.18em]">
                <span className="text-[#38bdf8]">{lvl.targetAudience}</span>
                <span className="text-white/45">{lvl.badge}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
