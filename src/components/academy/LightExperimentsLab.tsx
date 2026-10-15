import React, { useState, useMemo } from "react";
import {
  SPECTRUM_BANDS,
  SPECTRAL_ELEMENTS,
  LIGHT_TRAVEL_TARGETS,
  type SpectrumBand,
  type SpectralElement,
} from "@/lib/academy/lessons/module-04-light-time";
import { Button } from "@/components/ui/button";
import {
  Sliders,
  Sparkles,
  Zap,
  Layers,
  Eye,
  Activity,
  CheckCircle2,
  HelpCircle,
  Clock,
  Compass,
  ArrowRight,
  Info,
  Maximize2,
  Atom,
} from "lucide-react";

export function LightExperimentsLab({
  onCompletedExperiment,
}: {
  onCompletedExperiment?: (expId: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<
    "spectrum" | "prism" | "wavelength_compare" | "lookback_slider" | "stellar_spectrum"
  >("spectrum");

  // State for Experiment 1: Spectrum Slider
  const [activeBandIndex, setActiveBandIndex] = useState(3); // Default visible
  const activeBand = SPECTRUM_BANDS[activeBandIndex];

  // State for Experiment 2: Prism
  const [prismAngle, setPrismAngle] = useState(48); // angle of incidence in degrees
  const [prismMaterial, setPrismMaterial] = useState<"crown" | "flint" | "diamond">("flint");

  // State for Experiment 3: Multi-wavelength
  const [wavelengthView, setWavelengthView] = useState<"visible" | "infrared" | "ultraviolet">(
    "infrared",
  );

  // State for Experiment 4: Lookback time slider
  const [lookbackTargetIndex, setLookbackTargetIndex] = useState(1); // Default Sun

  // State for Experiment 5: Stellar Spectrum
  const [selectedStellarSample, setSelectedStellarSample] = useState<"sun" | "vega" | "betelgeuse">(
    "sun",
  );
  const [activeElementOverlay, setActiveElementOverlay] = useState<string>("all");
  const [analyzedElements, setAnalyzedElements] = useState<string[]>([]);

  // Track progress when experimenting
  const handleInteract = (expId: string) => {
    onCompletedExperiment?.(expId);
  };

  // Prism Material indices
  const prismProperties = useMemo(() => {
    switch (prismMaterial) {
      case "crown":
        return { name: "Crown Glass", baseN: 1.52, dispersion: 0.016 };
      case "flint":
        return { name: "Dense Flint Glass", baseN: 1.66, dispersion: 0.035 };
      case "diamond":
        return { name: "Diamond", baseN: 2.42, dispersion: 0.044 };
    }
  }, [prismMaterial]);

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950 p-6 sm:p-8 space-y-8 shadow-2xl">
      {/* Header and Sub-Tab Navigation */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-1">
              <Sliders className="size-3.5" />
              <span>Interactive Optics & Astrophysics Laboratory</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              5 Hands-On Light Experiments
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Interactive Scientific Simulations
          </span>
        </div>

        {/* Experiment Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {[
            { id: "spectrum", label: "1. EM Spectrum Slider", icon: Sliders },
            { id: "prism", label: "2. Optical Prism Lab", icon: Zap },
            { id: "wavelength_compare", label: "3. Visible vs IR vs UV", icon: Eye },
            { id: "lookback_slider", label: "4. Lookback Explorer", icon: Clock },
            { id: "stellar_spectrum", label: "5. Stellar Spectrum", icon: Atom },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as typeof activeTab);
                  handleInteract(tab.id);
                }}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 ${
                  isActive
                    ? "bg-cyan-500/20 border-cyan-400 text-white shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-400/50"
                    : "bg-white/[0.02] border-white/5 text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className={`size-4 ${isActive ? "text-cyan-400" : "text-slate-500"}`} />
                <span className="text-xs font-bold leading-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= EXPERIMENT 1: ELECTROMAGNETIC SPECTRUM SLIDER ================= */}
      {activeTab === "spectrum" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>The Electromagnetic Spectrum & The Wave Formula</span>
              <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded">
                c = λ × f
              </span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Drag the wavelength slider across the spectrum from kilometer-long radio waves down to
              subatomic gamma rays. Notice how frequency and energy skyrocket as wavelength shrinks!
            </p>
          </div>

          {/* Interactive Range Slider */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-white/10 space-y-4">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-red-400 font-bold">← Radio Waves (Long λ, Low f)</span>
              <span className="text-cyan-400 font-bold">
                Active Band: {activeBand.name} ({activeBandIndex + 1}/7)
              </span>
              <span className="text-purple-400 font-bold">Gamma Rays (Short λ, High f) →</span>
            </div>

            <input
              type="range"
              min={0}
              max={SPECTRUM_BANDS.length - 1}
              step={1}
              value={activeBandIndex}
              onChange={(e) => {
                setActiveBandIndex(Number(e.target.value));
                handleInteract("spectrum");
              }}
              className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />

            {/* Spectrum Band Visual Strip */}
            <div className="grid grid-cols-7 gap-1 text-[11px] font-mono text-center font-bold">
              {SPECTRUM_BANDS.map((b, i) => (
                <button
                  key={b.id}
                  onClick={() => setActiveBandIndex(i)}
                  className={`py-2 px-1 rounded-xl transition-all border ${
                    i === activeBandIndex
                      ? "ring-2 ring-cyan-400 bg-white/10 text-white border-white/30"
                      : "bg-white/[0.02] border-white/5 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span className="block truncate">{b.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quantitative Physics Readout Card for Classes 7-10 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20">
              <span className="text-[10px] font-mono uppercase text-cyan-400 block font-bold">
                Wavelength (λ)
              </span>
              <div className="text-lg font-mono font-bold text-white mt-1">
                {activeBand.wavelengthRange}
              </div>
              <span className="text-[11px] text-slate-400 block mt-1">
                Distance from crest to crest
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20">
              <span className="text-[10px] font-mono uppercase text-indigo-400 block font-bold">
                Frequency (f = c / λ)
              </span>
              <div className="text-lg font-mono font-bold text-white mt-1">
                ≈ {activeBand.frequencyHz.toExponential(2)} Hz
              </div>
              <span className="text-[11px] text-slate-400 block mt-1">
                Wave oscillations per second
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20">
              <span className="text-[10px] font-mono uppercase text-amber-400 block font-bold">
                Photon Energy (E = h·f)
              </span>
              <div className="text-lg font-mono font-bold text-white mt-1">
                ≈ {activeBand.energyEv} eV
              </div>
              <span className="text-[11px] text-slate-400 block mt-1">h = 6.626 × 10⁻³⁴ J·s</span>
            </div>
          </div>

          {/* Observational Context Details */}
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-bold text-cyan-400 uppercase">
                Astrophysical Role of {activeBand.name}
              </span>
              <span className="text-slate-400 font-mono">
                Source Temperature: {activeBand.temperatureKelvinRange}
              </span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">{activeBand.whatWeLearn}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
              <div>
                <span className="text-slate-400 font-bold block mb-1">
                  Typical Cosmic Emitters:
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                  {activeBand.cosmicSources.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="text-slate-400 font-bold block mb-1">
                  Major Space & Ground Observatories:
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                  {activeBand.telescopesUsed.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= EXPERIMENT 2: INTERACTIVE OPTICAL PRISM ================= */}
      {activeTab === "prism" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Interactive Triangular Prism & Light Dispersion</span>
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                Snell's Law: n₁ sin θ₁ = n₂ sin θ₂
              </span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Shine white sunlight through a triangular glass prism. Observe how glass bends violet
              light more sharply than red light because refractive index n(λ) increases at shorter
              wavelengths!
            </p>
          </div>

          {/* Prism Canvas Simulation Graphic */}
          <div className="relative h-64 sm:h-80 w-full rounded-2xl bg-slate-950 border border-white/10 overflow-hidden flex items-center justify-center p-4">
            <svg
              className="w-full h-full max-w-2xl"
              viewBox="0 0 700 360"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Background Glow */}
              <defs>
                <linearGradient id="rainbowFan" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="20%" stopColor="#f97316" />
                  <stop offset="40%" stopColor="#eab308" />
                  <stop offset="60%" stopColor="#22c55e" />
                  <stop offset="80%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>

              {/* Incoming White Light Beam */}
              <line
                x1="40"
                y1={180 - (prismAngle - 45) * 2}
                x2="300"
                y2="190"
                stroke="#ffffff"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <text x="50" y="150" fill="#ffffff" fontSize="12" fontFamily="monospace">
                Incoming White Sunlight
              </text>

              {/* Triangular Prism Glass Body */}
              <polygon
                points="350,70 260,270 440,270"
                fill="rgba(56, 189, 248, 0.12)"
                stroke="#38bdf8"
                strokeWidth="2.5"
              />
              <text
                x="320"
                y="245"
                fill="#94a3b8"
                fontSize="11"
                fontFamily="monospace"
                textAnchor="middle"
              >
                {prismProperties.name} (n ≈ {prismProperties.baseN})
              </text>

              {/* Internal Refraction Beams */}
              <line
                x1="300"
                y1="190"
                x2="385"
                y2={195 + prismProperties.dispersion * 300}
                stroke="#ef4444"
                strokeWidth="2.5"
                opacity="0.8"
              />
              <line
                x1="300"
                y1="190"
                x2="385"
                y2={195 + prismProperties.dispersion * 650}
                stroke="#a855f7"
                strokeWidth="2.5"
                opacity="0.8"
              />

              {/* Emerging Dispersed Rainbow Rays */}
              {/* Red Ray (Longest wavelength, least bent) */}
              <line
                x1="385"
                y1={195 + prismProperties.dispersion * 300}
                x2="640"
                y2={160 - (prismAngle - 45) * 1.5}
                stroke="#ef4444"
                strokeWidth="3.5"
              />
              <text
                x="645"
                y={165 - (prismAngle - 45) * 1.5}
                fill="#ef4444"
                fontSize="11"
                fontFamily="monospace font-bold"
              >
                Red (700 nm) — least bent
              </text>

              {/* Orange */}
              <line
                x1="385"
                y1={198 + prismProperties.dispersion * 350}
                x2="640"
                y2={185 - (prismAngle - 45) * 1.5}
                stroke="#f97316"
                strokeWidth="3"
              />
              {/* Yellow */}
              <line
                x1="385"
                y1={202 + prismProperties.dispersion * 420}
                x2="640"
                y2={210 - (prismAngle - 45) * 1.5}
                stroke="#eab308"
                strokeWidth="3"
              />
              {/* Green */}
              <line
                x1="385"
                y1={206 + prismProperties.dispersion * 480}
                x2="640"
                y2={235 - (prismAngle - 45) * 1.5}
                stroke="#22c55e"
                strokeWidth="3"
              />
              {/* Blue */}
              <line
                x1="385"
                y1={210 + prismProperties.dispersion * 550}
                x2="640"
                y2={260 - (prismAngle - 45) * 1.5}
                stroke="#3b82f6"
                strokeWidth="3"
              />
              {/* Violet Ray (Shortest wavelength, most bent) */}
              <line
                x1="385"
                y1={214 + prismProperties.dispersion * 650}
                x2="640"
                y2={285 - (prismAngle - 45) * 1.5}
                stroke="#a855f7"
                strokeWidth="3.5"
              />
              <text
                x="645"
                y={290 - (prismAngle - 45) * 1.5}
                fill="#a855f7"
                fontSize="11"
                fontFamily="monospace font-bold"
              >
                Violet (400 nm) — most bent
              </text>
            </svg>
          </div>

          {/* Prism Interactive Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 rounded-2xl bg-slate-900/60 border border-white/10">
            {/* Angle of incidence slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300 font-bold">Angle of Incidence (θ₁):</span>
                <span className="text-cyan-400 font-bold">{prismAngle}°</span>
              </div>
              <input
                type="range"
                min={30}
                max={60}
                value={prismAngle}
                onChange={(e) => {
                  setPrismAngle(Number(e.target.value));
                  handleInteract("prism");
                }}
                className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
              <span className="text-[11px] text-slate-400 block">
                Adjusts the trajectory of white light entering the optical medium.
              </span>
            </div>

            {/* Prism Material Selector */}
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-slate-300 block">
                Prism Material Medium:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "crown", label: "Crown Glass", n: "n=1.52" },
                  { id: "flint", label: "Flint Glass", n: "n=1.66" },
                  { id: "diamond", label: "Diamond", n: "n=2.42" },
                ].map((mat) => (
                  <button
                    key={mat.id}
                    onClick={() => {
                      setPrismMaterial(mat.id as typeof prismMaterial);
                      handleInteract("prism");
                    }}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      prismMaterial === mat.id
                        ? "bg-cyan-500 text-slate-950 font-bold border-cyan-400"
                        : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    <span className="block text-xs font-bold">{mat.label}</span>
                    <span className="block text-[10px] font-mono opacity-80">{mat.n}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= EXPERIMENT 3: MULTI-WAVELENGTH OBSERVATION ================= */}
      {activeTab === "wavelength_compare" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Comparing Cosmic Views: Visible vs. Infrared vs. Ultraviolet</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Astronomers use different telescopes to observe celestial scenes in different light.
              Toggle between wavebands to see how infrared cuts through thick cosmic dust while
              ultraviolet illuminates newborn massive stars!
            </p>
          </div>

          {/* Waveband Selector Pills */}
          <div className="flex flex-wrap gap-2">
            {[
              {
                id: "visible",
                name: "Visible Light (Hubble)",
                tag: "Cold Dust is Opaque",
                color: "border-emerald-500 bg-emerald-500/20 text-emerald-300",
              },
              {
                id: "infrared",
                name: "Infrared (JWST)",
                tag: "Dust Becomes Transparent!",
                color: "border-amber-500 bg-amber-500/20 text-amber-300",
              },
              {
                id: "ultraviolet",
                name: "Ultraviolet (GALEX)",
                tag: "Hot Newborn Stars",
                color: "border-cyan-500 bg-cyan-500/20 text-cyan-300",
              },
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => {
                  setWavelengthView(mode.id as typeof wavelengthView);
                  handleInteract("wavelength_compare");
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  wavelengthView === mode.id
                    ? mode.color + " font-bold shadow-md"
                    : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                <span>{mode.name}</span>
                <span className="ml-2 font-mono text-[10px] opacity-80">[{mode.tag}]</span>
              </button>
            ))}
          </div>

          {/* Interactive Simulation Graphic of Pillars / Stellar Nursery */}
          <div className="relative h-72 sm:h-96 w-full rounded-2xl border border-white/10 overflow-hidden flex flex-col justify-end p-6">
            {/* Visual Backdrops based on waveband */}
            {wavelengthView === "visible" && (
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900 to-amber-950/40">
                {/* Silhouette of thick opaque dust pillars */}
                <svg
                  className="w-full h-full opacity-90"
                  viewBox="0 0 800 400"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M 100 400 Q 140 180 200 220 Q 250 140 320 200 Q 380 90 460 220 Q 520 250 600 400 Z"
                    fill="#18181b"
                  />
                  <path
                    d="M 300 400 Q 350 170 420 240 Q 480 120 540 280 Q 600 320 700 400 Z"
                    fill="#09090b"
                  />
                  {/* Faint distant stars partially obscured */}
                  <circle cx="200" cy="80" r="2" fill="#ffffff" opacity="0.4" />
                  <circle cx="650" cy="90" r="3" fill="#ffffff" opacity="0.6" />
                </svg>
              </div>
            )}

            {wavelengthView === "infrared" && (
              <div className="absolute inset-0 bg-gradient-to-t from-purple-950 via-slate-950 to-orange-950/60">
                {/* Dust pillars become translucent & glowing with internal protostars */}
                <svg className="w-full h-full" viewBox="0 0 800 400" preserveAspectRatio="none">
                  <path
                    d="M 100 400 Q 140 180 200 220 Q 250 140 320 200 Q 380 90 460 220 Q 520 250 600 400 Z"
                    fill="rgba(217, 119, 6, 0.25)"
                    stroke="rgba(245, 158, 11, 0.4)"
                  />
                  <path
                    d="M 300 400 Q 350 170 420 240 Q 480 120 540 280 Q 600 320 700 400 Z"
                    fill="rgba(244, 63, 94, 0.2)"
                    stroke="rgba(251, 113, 133, 0.4)"
                  />
                  {/* Glowing newborn protostars INSIDE the pillars! */}
                  <circle cx="240" cy="230" r="6" fill="#facc15" />
                  <circle cx="340" cy="180" r="5" fill="#facc15" />
                  <circle cx="430" cy="190" r="8" fill="#fbbf24" />
                  <circle cx="480" cy="210" r="4" fill="#fde047" />
                  {/* Hundreds of background stars piercing through */}
                  {Array.from({ length: 45 }).map((_, i) => (
                    <circle
                      key={i}
                      cx={((i * 37) % 780) + 10}
                      cy={((i * 23) % 360) + 20}
                      r={Math.random() * 2.5 + 1}
                      fill="#38bdf8"
                      opacity={0.7}
                    />
                  ))}
                </svg>
              </div>
            )}

            {wavelengthView === "ultraviolet" && (
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-indigo-950 to-cyan-950/60">
                {/* Super-hot O and B stars blazing brilliantly */}
                <svg className="w-full h-full" viewBox="0 0 800 400" preserveAspectRatio="none">
                  <circle cx="150" cy="90" r="14" fill="#38bdf8" opacity="0.9" />
                  <circle cx="150" cy="90" r="28" fill="#38bdf8" opacity="0.25" />
                  <circle cx="580" cy="110" r="18" fill="#818cf8" opacity="0.9" />
                  <circle cx="580" cy="110" r="36" fill="#818cf8" opacity="0.25" />
                  <circle cx="360" cy="70" r="10" fill="#c084fc" opacity="0.8" />
                </svg>
              </div>
            )}

            {/* Explanatory Overlay Banner */}
            <div className="relative z-10 p-4 rounded-xl bg-slate-950/85 backdrop-blur-md border border-white/10 max-w-xl space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-cyan-400">
                Observational Insight ({wavelengthView.toUpperCase()} MODE)
              </span>
              <p className="text-xs sm:text-sm text-slate-100 font-medium">
                {wavelengthView === "visible" &&
                  "In optical light, interstellar dust grains (soot and silicates) are the same size as optical waves, scattering and blocking starlight into dark silhouette clouds."}
                {wavelengthView === "infrared" &&
                  "Infrared waves (700nm–1mm) are much larger than cosmic dust grains. The dust becomes completely transparent, revealing thousands of baby stars forming inside the gas pillars!"}
                {wavelengthView === "ultraviolet" &&
                  "Ultraviolet photons pinpoint extreme stellar furnaces (>20,000 K). Only massive young stars burn hot enough to blaze in UV light before exhausting their fuel in supernovae."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================= EXPERIMENT 4: LOOKBACK TIME CHRONOLOGY EXPLORER ================= */}
      {activeTab === "lookback_slider" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Distant Galaxy Lookback Time & Earth History</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Select any cosmic beacon below to see how far back into the past you are looking,
              paired with what was taking place on planet Earth when those photons set sail.
            </p>
          </div>

          {/* Target Benchmarks Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {LIGHT_TRAVEL_TARGETS.map((t, idx) => (
              <button
                key={t.id}
                onClick={() => {
                  setLookbackTargetIndex(idx);
                  handleInteract("lookback_slider");
                }}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  idx === lookbackTargetIndex
                    ? "bg-cyan-500/20 border-cyan-400 text-white shadow-md shadow-cyan-500/15 ring-1 ring-cyan-400/50"
                    : "bg-white/[0.02] border-white/5 text-slate-400 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="size-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: t.colorHex }}
                  />
                  <span className="text-xs font-bold truncate text-white">{t.name}</span>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 block mt-1">
                  {t.lightTravelTimeDisplay}
                </span>
              </button>
            ))}
          </div>

          {/* Active Target Historical Profile Card */}
          {(() => {
            const target = LIGHT_TRAVEL_TARGETS[lookbackTargetIndex];
            return (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-950/30 via-slate-900 to-purple-950/30 border border-cyan-500/30 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase">
                      Target Landmark
                    </span>
                    <h4 className="text-xl font-bold text-white">{target.name}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">
                      Lookback Time
                    </span>
                    <span className="text-sm font-mono font-bold text-amber-300">
                      {target.lightTravelTimeDisplay}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 block">
                      🌍 Historical State on Planet Earth When Light Departed:
                    </span>
                    <p className="text-sm font-medium text-slate-100 leading-relaxed">
                      {target.lookbackEraEarth}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">
                      Astronomical Distance & Physical Coordinates:
                    </span>
                    <p className="text-xs text-slate-300 font-mono">{target.distanceDisplay}</p>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {target.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ================= EXPERIMENT 5: STELLAR SPECTRUM & ABSORPTION BARCODES ================= */}
      {activeTab === "stellar_spectrum" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Stellar Absorption Spectroscopy: The Atomic Fingerprint Lab</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              When continuous starlight passes through cooler gases in a star's outer atmosphere,
              elements absorb specific wavelengths, leaving dark Fraunhofer lines. Click an element
              to highlight its lines!
            </p>
          </div>

          {/* Star Sample Selector */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: "sun", name: "The Sun (G2V Star, ~5,778 K)", desc: "Strong Ca, Na, and H" },
              {
                id: "vega",
                name: "Vega (A0V Hot Star, ~9,600 K)",
                desc: "Intense Hydrogen Balmer",
              },
              {
                id: "betelgeuse",
                name: "Betelgeuse (M2I Cool Supergiant, ~3,500 K)",
                desc: "Heavy Fe, Ca & molecular TiO",
              },
            ].map((star) => (
              <button
                key={star.id}
                onClick={() => {
                  setSelectedStellarSample(star.id as typeof selectedStellarSample);
                  handleInteract("stellar_spectrum");
                }}
                className={`px-4 py-2.5 rounded-xl border text-left transition-all ${
                  selectedStellarSample === star.id
                    ? "bg-cyan-500/20 border-cyan-400 text-white font-bold"
                    : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                }`}
              >
                <div className="text-xs font-bold">{star.name}</div>
                <div className="text-[10px] font-mono text-slate-400">{star.desc}</div>
              </button>
            ))}
          </div>

          {/* High-Contrast Interactive Spectrogram */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-white/15 space-y-4">
            <div className="flex justify-between items-center text-xs font-mono text-slate-400">
              <span>Violet (390 nm)</span>
              <span className="text-cyan-400 font-bold uppercase">
                Continuous Stellar Photosphere Continuum with Fraunhofer Absorption Lines
              </span>
              <span>Red (700 nm)</span>
            </div>

            {/* Continuous Rainbow Strip with Dark Vertical Absorption Lines */}
            <div className="relative h-20 w-full rounded-xl overflow-hidden border border-white/20 shadow-lg">
              {/* Rainbow Gradient Background */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(90deg, #7c3aed 0%, #3b82f6 20%, #06b6d4 40%, #22c55e 60%, #eab308 80%, #ef4444 100%)",
                }}
              />

              {/* Render Dark Absorption Lines */}
              {SPECTRAL_ELEMENTS.map((elem) => {
                const isHighlighted =
                  activeElementOverlay === "all" || activeElementOverlay === elem.symbol;
                if (!isHighlighted) return null;

                return elem.linesNm.map((lineNm) => {
                  // Normalize 390 nm to 700 nm
                  const pct = ((lineNm - 390) / (700 - 390)) * 100;
                  if (pct < 0 || pct > 100) return null;

                  return (
                    <div
                      key={`${elem.symbol}-${lineNm}`}
                      className="absolute top-0 bottom-0 w-1 bg-black/95 transition-all group cursor-pointer hover:w-1.5 hover:bg-white"
                      style={{ left: `${pct}%` }}
                      title={`${elem.name} absorption line at ${lineNm} nm`}
                    >
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-950 text-white font-mono text-[9px] px-1.5 py-0.5 rounded border border-white/30 hidden group-hover:block whitespace-nowrap z-20">
                        {elem.symbol} ({lineNm} nm)
                      </div>
                    </div>
                  );
                });
              })}
            </div>

            {/* Element Filter Buttons */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-mono text-slate-400 block font-semibold">
                Filter Chemical Absorption Barcode Lines:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveElementOverlay("all")}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    activeElementOverlay === "all"
                      ? "bg-cyan-500 text-slate-950"
                      : "bg-white/5 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  All Elements
                </button>
                {SPECTRAL_ELEMENTS.map((el) => {
                  const isSelected = activeElementOverlay === el.symbol;
                  return (
                    <button
                      key={el.symbol}
                      onClick={() => {
                        setActiveElementOverlay(el.symbol);
                        if (!analyzedElements.includes(el.symbol)) {
                          setAnalyzedElements([...analyzedElements, el.symbol]);
                        }
                        handleInteract("stellar_spectrum");
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-cyan-500 text-slate-950 shadow-sm"
                          : "bg-white/5 text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      <span
                        className="size-2 rounded-full inline-block"
                        style={{ backgroundColor: el.color }}
                      />
                      <span>
                        {el.symbol} - {el.name.split(" ")[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Explanatory Element Card */}
            {(() => {
              const activeElem =
                SPECTRAL_ELEMENTS.find((el) => el.symbol === activeElementOverlay) ||
                SPECTRAL_ELEMENTS[0];
              return (
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-1 text-xs text-slate-300">
                  <div className="flex items-center justify-between font-bold text-white">
                    <span>
                      {activeElem.name} ({activeElem.symbol})
                    </span>
                    <span className="text-cyan-400 font-mono">
                      Wavelengths: {activeElem.linesNm.join(" nm, ")} nm
                    </span>
                  </div>
                  <p className="leading-relaxed text-slate-300">{activeElem.description}</p>
                  <p className="text-[11px] text-slate-400 font-mono pt-1">
                    Cosmic Presence: {activeElem.stellarPresence}
                  </p>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
