import React from "react";
import type { AcademySettings } from "@/lib/academy/types";
import { Eye, Volume2, VolumeX, Sliders, Type, Sparkles } from "lucide-react";

interface AccessibilityControlsProps {
  settings: AcademySettings;
  onUpdateSettings: (updater: (prev: AcademySettings) => AcademySettings) => void;
}

export function AccessibilityControls({ settings, onUpdateSettings }: AccessibilityControlsProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/60 p-3.5 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
      <div className="flex items-center gap-2 text-cyan-400 font-semibold">
        <Sliders className="size-3.5" />
        <span>Accessibility & Learning Comfort</span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Font size toggle */}
        <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-0.5">
          <Type className="size-3 ml-1.5 text-slate-400" />
          <button
            onClick={() => onUpdateSettings((s) => ({ ...s, fontSize: "normal" }))}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              settings.fontSize === "normal"
                ? "bg-cyan-500/20 text-cyan-300"
                : "text-slate-400 hover:text-white"
            }`}
          >
            A
          </button>
          <button
            onClick={() => onUpdateSettings((s) => ({ ...s, fontSize: "large" }))}
            className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
              settings.fontSize === "large"
                ? "bg-cyan-500/20 text-cyan-300"
                : "text-slate-400 hover:text-white"
            }`}
          >
            A+
          </button>
        </div>

        {/* Reduced motion toggle */}
        <button
          onClick={() => onUpdateSettings((s) => ({ ...s, reducedMotion: !s.reducedMotion }))}
          className={`px-2.5 py-1 rounded-lg border text-[11px] transition-colors flex items-center gap-1.5 ${
            settings.reducedMotion
              ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
              : "border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
          }`}
          title="Toggle smooth animation motion"
        >
          <Sparkles className="size-3" />
          <span>{settings.reducedMotion ? "Motion: Paused" : "Motion: Fluid"}</span>
        </button>

        {/* High contrast toggle */}
        <button
          onClick={() => onUpdateSettings((s) => ({ ...s, highContrast: !s.highContrast }))}
          className={`px-2.5 py-1 rounded-lg border text-[11px] transition-colors flex items-center gap-1.5 ${
            settings.highContrast
              ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300"
              : "border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
          }`}
          title="Toggle high contrast reading mode"
        >
          <Eye className="size-3" />
          <span>{settings.highContrast ? "High Contrast: On" : "High Contrast"}</span>
        </button>

        {/* Ambient Sound Effects */}
        <button
          onClick={() => onUpdateSettings((s) => ({ ...s, soundEffects: !s.soundEffects }))}
          className={`px-2.5 py-1 rounded-lg border text-[11px] transition-colors flex items-center gap-1.5 ${
            settings.soundEffects
              ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300"
              : "border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
          }`}
          title="Toggle cosmic sound effects"
        >
          {settings.soundEffects ? <Volume2 className="size-3" /> : <VolumeX className="size-3" />}
          <span>{settings.soundEffects ? "Audio: On" : "Audio: Mute"}</span>
        </button>
      </div>
    </div>
  );
}
