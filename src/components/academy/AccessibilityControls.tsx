import React from "react";
import type { AcademySettings } from "@/lib/academy/types";
import { Eye, Volume2, VolumeX, Sliders, Type, Sparkles } from "lucide-react";

interface AccessibilityControlsProps {
  settings: AcademySettings;
  onUpdateSettings: (updater: (prev: AcademySettings) => AcademySettings) => void;
}

export function AccessibilityControls({ settings, onUpdateSettings }: AccessibilityControlsProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border border-white/[0.08] bg-[#05060a] px-6 py-4">
      <div className="flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.26em] text-white/60">
        <Sliders className="size-3.5 text-[#f5d08a]" />
        <span>OBSERVATORY TELEMETRY & ACCESSIBILITY</span>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.18em]">
        {/* Font size toggle */}
        <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-[#090d16] p-0.5">
          <Type className="ml-2 size-3 text-white/40" />
          <button
            type="button"
            onClick={() => onUpdateSettings((s) => ({ ...s, fontSize: "normal" }))}
            className={`rounded-full px-2.5 py-1 transition-colors ${
              settings.fontSize === "normal"
                ? "bg-[#f5d08a] font-semibold text-[#05060a]"
                : "text-white/50 hover:text-white"
            }`}
          >
            A
          </button>
          <button
            type="button"
            onClick={() => onUpdateSettings((s) => ({ ...s, fontSize: "large" }))}
            className={`rounded-full px-2.5 py-1 transition-colors ${
              settings.fontSize === "large"
                ? "bg-[#f5d08a] font-semibold text-[#05060a]"
                : "text-white/50 hover:text-white"
            }`}
          >
            A+
          </button>
        </div>

        {/* Reduced motion toggle */}
        <button
          type="button"
          onClick={() => onUpdateSettings((s) => ({ ...s, reducedMotion: !s.reducedMotion }))}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 transition-colors ${
            settings.reducedMotion
              ? "border-[#f5d08a]/50 bg-[#f5d08a]/15 text-[#f5d08a]"
              : "border-white/10 text-white/55 hover:border-white/30 hover:text-white"
          }`}
        >
          <Sparkles className="size-3" />
          <span>{settings.reducedMotion ? "Motion: Paused" : "Motion: Fluid"}</span>
        </button>

        {/* High contrast toggle */}
        <button
          type="button"
          onClick={() => onUpdateSettings((s) => ({ ...s, highContrast: !s.highContrast }))}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 transition-colors ${
            settings.highContrast
              ? "border-[#38bdf8]/50 bg-[#38bdf8]/15 text-[#38bdf8]"
              : "border-white/10 text-white/55 hover:border-white/30 hover:text-white"
          }`}
        >
          <Eye className="size-3" />
          <span>{settings.highContrast ? "Contrast: High" : "Contrast"}</span>
        </button>

        {/* Ambient Sound Effects */}
        <button
          type="button"
          onClick={() => onUpdateSettings((s) => ({ ...s, soundEffects: !s.soundEffects }))}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 transition-colors ${
            settings.soundEffects
              ? "border-[#f5d08a]/50 bg-[#f5d08a]/15 text-[#f5d08a]"
              : "border-white/10 text-white/55 hover:border-white/30 hover:text-white"
          }`}
        >
          {settings.soundEffects ? <Volume2 className="size-3" /> : <VolumeX className="size-3" />}
          <span>{settings.soundEffects ? "Audio: On" : "Audio: Mute"}</span>
        </button>
      </div>
    </div>
  );
}
