import React, { useState, useMemo } from "react";
import {
  Compass,
  Sliders,
  Eye,
  Sparkles,
  Info,
  Maximize2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Telescope,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Distance presets
const DISTANCE_PRESETS = [
  { label: "Alpha Centauri (1.34 pc)", pc: 1.34 },
  { label: "Sirius (2.64 pc)", pc: 2.64 },
  { label: "Vega (7.68 pc)", pc: 7.68 },
  { label: "Standard Benchmark (10 pc)", pc: 10.0 },
  { label: "Arcturus (11.26 pc)", pc: 11.26 },
  { label: "Betelgeuse (168 pc)", pc: 168.0 },
  { label: "Deneb (802 pc)", pc: 802.0 },
];

// Star Luminosity presets
const STAR_PRESETS = [
  { id: "red_dwarf", label: "Proxima Centauri", lum: 0.0017, absMag: 15.53, color: "#ff8a65" },
  { id: "sun", label: "The Sun", lum: 1.0, absMag: 4.83, color: "#fff3dc" },
  { id: "sirius_a", label: "Sirius A", lum: 25.4, absMag: 1.43, color: "#d6e4ff" },
  { id: "arcturus", label: "Arcturus (Red Giant)", lum: 170, absMag: -0.31, color: "#ffb74d" },
  { id: "rigel", label: "Rigel (Supergiant)", lum: 120000, absMag: -7.84, color: "#b0c4de" },
];

export function InverseSquareBrightnessLab({ onInteracted }: { onInteracted?: () => void }) {
  // Distance in parsecs (1 parsec = 3.26 light-years = 3.086 × 10¹³ km)
  const [distancePc, setDistancePc] = useState<number>(10);
  // Intrinsic luminosity in solar units L_sun
  const [luminositySolar, setLuminositySolar] = useState<number>(1.0); // Default Sun
  const [starPreset, setStarPreset] = useState<string>("sun");

  const currentStar = useMemo(() => {
    return STAR_PRESETS.find((s) => s.id === starPreset) || STAR_PRESETS[1];
  }, [starPreset]);

  // Inverse-Square Flux: F = L / (4 * pi * d^2)
  // Relative to Sun at 10 pc:
  const relativeFluxAt10Pc = luminositySolar / ((distancePc * distancePc) / 100);

  // Absolute Magnitude M from Luminosity: M = 4.83 - 2.5 * log10(L / L_sun)
  const absoluteMagnitude = useMemo(() => {
    return 4.83 - 2.5 * Math.log10(luminositySolar);
  }, [luminositySolar]);

  // Apparent Magnitude m: m = M + 5 * log10(d) - 5
  const apparentMagnitude = useMemo(() => {
    return absoluteMagnitude + 5 * Math.log10(distancePc) - 5;
  }, [absoluteMagnitude, distancePc]);

  // Visibility category
  const visibilityStatus = useMemo(() => {
    if (apparentMagnitude <= -1.0) {
      return {
        label: "Dazzling Bright (Outshines Sirius)",
        color: "text-amber-300",
        bg: "bg-amber-500/10 border-amber-500/30",
        description: "Brilliant celestial beacon, clearly visible even from bright city lights.",
      };
    }
    if (apparentMagnitude <= 3.0) {
      return {
        label: "Prominent Naked-Eye Star",
        color: "text-emerald-400",
        bg: "bg-emerald-500/10 border-emerald-500/30",
        description: "Easily spotted with the naked eye from suburban backyards.",
      };
    }
    if (apparentMagnitude <= 6.5) {
      return {
        label: "Faint Naked-Eye Limit",
        color: "text-cyan-400",
        bg: "bg-cyan-500/10 border-cyan-500/30",
        description: "Visible only under pristine, moonless dark rural skies.",
      };
    }
    if (apparentMagnitude <= 10.0) {
      return {
        label: "Binoculars Required",
        color: "text-indigo-400",
        bg: "bg-indigo-500/10 border-indigo-500/30",
        description: "Invisible to the naked human eye; easily resolved in 7×50 binoculars.",
      };
    }
    return {
      label: "Astronomical Telescope Required",
      color: "text-rose-400",
      bg: "bg-rose-500/10 border-rose-500/30",
      description: "Extremely dim; requires an optical observatory telescope with long exposure.",
    };
  }, [apparentMagnitude]);

  // Visual simulation disc size & glow based on apparent magnitude
  const visualDiscSize = useMemo(() => {
    // Clamped radius between 2px and 60px
    const raw = 40 - apparentMagnitude * 4;
    return Math.max(3, Math.min(raw, 75));
  }, [apparentMagnitude]);

  const handleDistanceChange = (val: number) => {
    setDistancePc(val);
    onInteracted?.();
  };

  const handleStarSelect = (id: string, lum: number) => {
    setStarPreset(id);
    setLuminositySolar(lum);
    onInteracted?.();
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl space-y-8">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Compass className="size-4" />
            </span>
            <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
              Astrophysical Optics Experiment
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
            Luminosity, Distance & Apparent Brightness Lab
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Discover the Inverse-Square Law: why our Sun looks blindingly bright while colossal
            distant supergiants look like tiny specks.
          </p>
        </div>

        {/* Star Intrinsic Luminosity Preset Selector */}
        <div className="flex flex-wrap items-center gap-1.5">
          {STAR_PRESETS.map((star) => (
            <button
              key={star.id}
              onClick={() => handleStarSelect(star.id, star.lum)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                starPreset === star.id
                  ? "bg-indigo-500 text-white font-bold shadow-md shadow-indigo-500/20"
                  : "bg-slate-950 border border-white/10 text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              {star.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Controls & Spacecraft Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Distance Slider & Calculations */}
        <div className="lg:col-span-2 space-y-5">
          {/* Distance Slider Card */}
          <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sliders className="size-4 text-indigo-400" />
                Distance from Observer (d)
              </span>
              <div className="flex items-center gap-2 font-mono">
                <span className="text-2xl font-extrabold text-white">{distancePc.toFixed(1)}</span>
                <span className="text-sm text-slate-400">
                  parsecs ({(distancePc * 3.26156).toFixed(1)} light-years)
                </span>
              </div>
            </div>

            <input
              type="range"
              min={1}
              max={500}
              step={0.5}
              value={distancePc}
              onChange={(e) => handleDistanceChange(Number(e.target.value))}
              className="w-full accent-indigo-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />

            {/* Quick Benchmark Distance Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Presets:</span>
              {DISTANCE_PRESETS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleDistanceChange(item.pc)}
                  className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-slate-300 transition"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Core Numerical Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3.5">
              <span className="text-[10px] text-slate-400 uppercase block mb-1">
                Intrinsic Luminosity (L)
              </span>
              <span className="font-mono font-bold text-amber-300 text-base">
                {luminositySolar >= 1000 ? luminositySolar.toLocaleString() : luminositySolar} L☉
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Energy per second</span>
            </div>

            <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3.5">
              <span className="text-[10px] text-slate-400 uppercase block mb-1">
                Absolute Magnitude (M)
              </span>
              <span className="font-mono font-bold text-cyan-300 text-base">
                {absoluteMagnitude >= 0
                  ? `+${absoluteMagnitude.toFixed(2)}`
                  : absoluteMagnitude.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                True benchmark at 10 pc
              </span>
            </div>

            <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3.5">
              <span className="text-[10px] text-slate-400 uppercase block mb-1">
                Apparent Magnitude (m)
              </span>
              <span className="font-mono font-bold text-indigo-300 text-base">
                {apparentMagnitude >= 0
                  ? `+${apparentMagnitude.toFixed(2)}`
                  : apparentMagnitude.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Lower = Brighter</span>
            </div>

            <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3.5">
              <span className="text-[10px] text-slate-400 uppercase block mb-1">
                Relative Flux Ratio
              </span>
              <span className="font-mono font-bold text-emerald-300 text-base">
                {relativeFluxAt10Pc >= 1
                  ? `${relativeFluxAt10Pc.toFixed(1)}×`
                  : `1/${(1 / relativeFluxAt10Pc).toFixed(1)}×`}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">vs Sun at 10 pc</span>
            </div>
          </div>
        </div>

        {/* Right Col: Spacecraft Porthole Viewport */}
        <div className="rounded-2xl border border-white/10 bg-slate-950/90 p-5 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Spacecraft Viewport Simulation
            </span>
            <p className="text-[11px] text-slate-400">
              Observing {currentStar.label} from {distancePc.toFixed(1)} parsecs.
            </p>
          </div>

          {/* Porthole Window */}
          <div className="relative size-48 mx-auto rounded-full border-4 border-slate-700 bg-black shadow-2xl overflow-hidden flex items-center justify-center">
            {/* Distant background starfield */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-950 to-black opacity-80" />
            <div className="absolute top-6 left-8 size-0.5 rounded-full bg-white opacity-40" />
            <div className="absolute bottom-10 right-8 size-0.5 rounded-full bg-white opacity-50" />
            <div className="absolute top-12 right-12 size-0.5 rounded-full bg-white opacity-30" />

            {/* Central Simulated Star */}
            <div
              className="rounded-full transition-all duration-300 relative z-10"
              style={{
                width: `${visualDiscSize}px`,
                height: `${visualDiscSize}px`,
                backgroundColor: currentStar.color,
                boxShadow: `0 0 ${Math.min(visualDiscSize * 2.5, 90)}px ${currentStar.color}, 0 0 ${Math.min(visualDiscSize * 5, 120)}px ${currentStar.color}66`,
              }}
            />

            {/* Circular Grid Reticle */}
            <div className="absolute inset-2 rounded-full border border-white/10 pointer-events-none" />
            <div className="absolute inset-8 rounded-full border border-white/5 pointer-events-none" />
          </div>

          {/* Visibility Status Badge */}
          <div className={`p-3 rounded-xl border ${visibilityStatus.bg} space-y-1`}>
            <div className="flex items-center gap-1.5 font-bold text-xs">
              <Telescope className="size-3.5" />
              <span className={visibilityStatus.color}>{visibilityStatus.label}</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-tight">
              {visibilityStatus.description}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Geometric 1/d² Inverse-Square Spreading Diagram */}
      <div className="rounded-2xl border border-white/10 bg-slate-950 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Maximize2 className="size-4 text-indigo-400" />
            The Geometric Inverse-Square Spreading Law: F ∝ 1 / d²
          </h4>
          <span className="text-xs font-mono text-indigo-400">
            Area Spreads as d² → Brightness Dilutes as 1/d²
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-2">
            <span className="text-xs font-mono font-bold text-cyan-400">Distance = 1d</span>
            <div className="size-12 mx-auto rounded-lg border-2 border-cyan-400/80 bg-cyan-400/20 flex items-center justify-center font-mono font-bold text-xs text-white">
              1×
            </div>
            <p className="text-[11px] text-slate-300">
              Photons pass through <strong>1 square unit</strong>. Full brightness intensity (100%).
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-2">
            <span className="text-xs font-mono font-bold text-indigo-400">
              Distance = 2d (Doubled)
            </span>
            <div className="size-16 mx-auto rounded-lg border-2 border-indigo-400/80 bg-indigo-400/20 grid grid-cols-2 gap-0.5 p-1">
              <span className="bg-indigo-400/30 rounded-sm" />
              <span className="bg-indigo-400/30 rounded-sm" />
              <span className="bg-indigo-400/30 rounded-sm" />
              <span className="bg-indigo-400/30 rounded-sm" />
            </div>
            <p className="text-[11px] text-slate-300">
              Photons spread across <strong>4 square units</strong> (2²). Intensity drops to{" "}
              <strong>1/4 (25%)</strong>.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-2">
            <span className="text-xs font-mono font-bold text-rose-400">
              Distance = 3d (Tripled)
            </span>
            <div className="size-20 mx-auto rounded-lg border-2 border-rose-400/80 bg-rose-400/20 grid grid-cols-3 gap-0.5 p-1">
              {[...Array(9)].map((_, i) => (
                <span key={i} className="bg-rose-400/30 rounded-sm" />
              ))}
            </div>
            <p className="text-[11px] text-slate-300">
              Photons spread across <strong>9 square units</strong> (3²). Intensity drops to{" "}
              <strong>1/9 (11.1%)</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
