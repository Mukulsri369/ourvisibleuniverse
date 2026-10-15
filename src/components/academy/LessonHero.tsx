import React from "react";
import type { LearningLevel } from "@/lib/academy/types";
import { LEARNING_LEVELS } from "@/lib/academy/registry";
import { Sparkles, Clock, Compass, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LessonHeroProps {
  title: string;
  subtitle: string;
  moduleNumber: number;
  stageTitle: string;
  hookText: string;
  level: LearningLevel;
  estimatedMinutes: number;
  onBackToMap: () => void;
}

export function LessonHero({
  title,
  subtitle,
  moduleNumber,
  stageTitle,
  hookText,
  level,
  estimatedMinutes,
  onBackToMap,
}: LessonHeroProps) {
  const levelInfo = LEARNING_LEVELS[level];

  return (
    <div className="relative rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/40 via-slate-900/90 to-slate-950 p-6 sm:p-10 overflow-hidden backdrop-blur-xl">
      {/* Background celestial glow */}
      <div className="absolute -top-20 -right-20 size-80 rounded-full blur-3xl opacity-20 bg-cyan-400 pointer-events-none" />

      {/* Top back navigation & badges */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 relative z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={onBackToMap}
          className="text-xs border-white/10 text-slate-300 hover:text-white hover:bg-white/5"
        >
          <ArrowLeft className="size-3.5 mr-1.5" />
          <span>Back to Learning Map</span>
        </Button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-3 py-0.5 rounded-full">
            Module 0{moduleNumber} • {stageTitle}
          </span>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-amber-300">
            {levelInfo.name} ({levelInfo.gradeRange})
          </span>
        </div>
      </div>

      {/* Main Lesson Titles */}
      <div className="relative z-10 max-w-3xl">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
          {title}
        </h1>
        <p className="mt-2 text-base sm:text-lg text-cyan-200/90 font-medium">{subtitle}</p>

        {/* Step A: Cinematic Curiosity Hook Callout */}
        <div className="mt-6 rounded-2xl border border-cyan-500/40 bg-cyan-950/40 p-4 sm:p-5 flex items-start gap-3.5 shadow-md shadow-cyan-950/20">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex-shrink-0">
            <Sparkles className="size-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 block mb-1">
              Step A: Cosmic Curiosity Hook
            </span>
            <p className="text-sm sm:text-base text-slate-100 italic leading-relaxed">
              &ldquo;{hookText}&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* Estimated time */}
      <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <Clock className="size-3.5 text-cyan-400" />
          <span>Estimated Completion: {estimatedMinutes} minutes</span>
        </span>
        <span className="text-slate-500">•</span>
        <span className="flex items-center gap-1.5">
          <Compass className="size-3.5 text-cyan-400" />
          <span>Universal 8-Step Lesson Framework (A–H)</span>
        </span>
      </div>
    </div>
  );
}
