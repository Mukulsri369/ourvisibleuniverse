// @ts-nocheck -- loosely-typed educational content; runtime-validated by rendering.
import React, { useState, useMemo } from "react";
import {
  STELLAR_TRACKS,
  STELLAR_LIFETIME_DATA,
  type StellarEvolutionTrack,
} from "@/lib/academy/lessons/module-10-stellar-evolution";
import {
  Scale,
  Sparkles,
  Info,
  Sliders,
  Flame,
  Zap,
  Clock,
  Atom,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function StellarEvolutionDualCompare() {
  const [trackAId, setTrackAId] = useState<string>("sun_like");
  const [trackBId, setTrackBId] = useState<string>("high_mass");

  // Calculator mass slider
  const [calcMass, setCalcMass] = useState<number>(1.0);
  const [showFormulaDerivation, setShowFormulaDerivation] = useState<boolean>(false);

  const trackA: StellarEvolutionTrack = STELLAR_TRACKS[trackAId] || STELLAR_TRACKS.sun_like;
  const trackB: StellarEvolutionTrack = STELLAR_TRACKS[trackBId] || STELLAR_TRACKS.high_mass;

  // Lifetime ratio comparison
  const lifetimeRatio = useMemo(() => {
    if (trackB.totalLifetimeMyr === 0) return 1;
    return (trackA.totalLifetimeMyr / trackB.totalLifetimeMyr).toFixed(0);
  }, [trackA, trackB]);

  // Simplified lifetime calculation: tau = 10 * (M)^(-2.5) Gyr = 10,000 * M^(-2.5) Myr
  const calculatedLifetimeMyr = useMemo(() => {
    if (calcMass <= 0) return 0;
    const myr = 10000 * Math.pow(calcMass, -2.5);
    return myr;
  }, [calcMass]);

  return (
    <div className="space-y-8">
      {/* 1. Side-by-Side Track Comparison Module */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400">
                <Scale className="w-5 h-5" />
              </span>
              <h3 className="text-lg font-semibold text-white">Evolutionary Pathway Comparison</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Select two stellar mass classes to compare their lifespans, fusion engines, and final
              fates side-by-side
            </p>
          </div>

          {/* Quick Selectors */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-cyan-400 font-medium">Track A:</span>
              <select
                value={trackAId}
                onChange={(e) => setTrackAId(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white rounded-lg text-xs px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
              >
                {Object.values(STELLAR_TRACKS).map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-rose-400 font-medium">Track B:</span>
              <select
                value={trackBId}
                onChange={(e) => setTrackBId(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white rounded-lg text-xs px-2.5 py-1.5 focus:outline-none focus:border-rose-500"
              >
                {Object.values(STELLAR_TRACKS).map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Highlight Banner: Notice on Sun vs Supernova */}
        {(trackAId === "sun_like" || trackBId === "sun_like") && (
          <div className="mb-6 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-200">
              <strong className="text-amber-300 font-semibold">
                Crucial Astrophysical Distinction:
              </strong>{" "}
              Our Sun will <strong>NEVER</strong> explode as a supernova. Core-collapse supernovae
              require a progenitor star of at least <strong>8 solar masses (8 M☉)</strong> to build
              an iron core. The Sun will gently eject a planetary nebula and leave an Earth-sized
              white dwarf.
            </div>
          </div>
        )}

        {/* Side-by-Side Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card A */}
          <div className="rounded-xl border border-cyan-500/30 bg-slate-950/70 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Track A: {trackA.spectralType}
                </span>
                <h4 className="text-base font-bold text-white mt-1">{trackA.name}</h4>
                <p className="text-xs text-slate-400">Example: {trackA.exampleStar}</p>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold font-mono text-cyan-400">
                  {trackA.initialMassSolar} M☉
                </span>
                <span className="block text-[10px] text-slate-400">Birth Mass</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Total Lifespan:</span>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="font-mono text-slate-200 font-medium">
                    {trackA.lifetimeDisplay}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">End State Remnant:</span>
                <div className="flex items-center gap-2">
                  <Atom className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="font-semibold text-white">{trackA.finalRemnant}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Evolutionary Trajectory:</span>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  {trackA.fateSummary.explorer}
                </p>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Elements Synthesized & Dispersed:</span>
                <div className="flex flex-wrap gap-1">
                  {trackA.nucleosynthesisYield.map((elem) => (
                    <span
                      key={elem}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700"
                    >
                      {elem}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Card B */}
          <div className="rounded-xl border border-rose-500/30 bg-slate-950/70 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Track B: {trackB.spectralType}
                </span>
                <h4 className="text-base font-bold text-white mt-1">{trackB.name}</h4>
                <p className="text-xs text-slate-400">Example: {trackB.exampleStar}</p>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold font-mono text-rose-400">
                  {trackB.initialMassSolar} M☉
                </span>
                <span className="block text-[10px] text-slate-400">Birth Mass</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Total Lifespan:</span>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="font-mono text-slate-200 font-medium">
                    {trackB.lifetimeDisplay}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">End State Remnant:</span>
                <div className="flex items-center gap-2">
                  <Atom className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="font-semibold text-white">{trackB.finalRemnant}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Evolutionary Trajectory:</span>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  {trackB.fateSummary.explorer}
                </p>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Elements Synthesized & Dispersed:</span>
                <div className="flex flex-wrap gap-1">
                  {trackB.nucleosynthesisYield.map((elem) => (
                    <span
                      key={elem}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-rose-300 border border-slate-700"
                    >
                      {elem}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Direct Ratio Contrast Banner */}
        <div className="mt-6 p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
              <TrendingDown className="w-5 h-5" />
            </span>
            <div>
              <h5 className="text-sm font-semibold text-white">Lifespan Disparity Factor</h5>
              <p className="text-xs text-slate-400">
                {trackA.name.split(" ")[0]} lives roughly{" "}
                <span className="font-bold text-amber-400 font-mono">
                  {parseFloat(lifetimeRatio) >= 1
                    ? `${parseInt(lifetimeRatio).toLocaleString()}x longer`
                    : `${(1 / parseFloat(lifetimeRatio)).toFixed(0)}x shorter`}
                </span>{" "}
                than {trackB.name.split(" ")[0]}!
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-400 font-mono">
            {trackA.totalLifetimeMyr.toLocaleString()} Myr vs{" "}
            {trackB.totalLifetimeMyr.toLocaleString()} Myr
          </div>
        </div>
      </div>

      {/* 2. Simplified Stellar Lifetime Relationship Calculator (For Advanced Learners) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                <Atom className="w-5 h-5" />
              </span>
              <h3 className="text-lg font-semibold text-white">
                Stellar Lifetime Relationship Calculator
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Explore the simplified astrophysical relation for main-sequence lifespans and its
              physical limitations
            </p>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowFormulaDerivation(!showFormulaDerivation)}
            className="border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs text-purple-300"
          >
            {showFormulaDerivation ? "Hide Derivation" : "View Derivation & Math"}
          </Button>
        </div>

        {/* Derivation Box */}
        {showFormulaDerivation && (
          <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs space-y-3 animate-in fade-in">
            <h4 className="font-semibold text-purple-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Physical Derivation of τ ∝ M^(-2.5)
            </h4>
            <p className="text-slate-300 leading-relaxed">
              A star's main-sequence lifetime is proportional to the total available nuclear fuel
              divided by the rate at which fuel is consumed (luminosity):
            </p>
            <div className="p-3 rounded-lg bg-slate-950/80 font-mono text-purple-200 text-center text-sm border border-purple-500/20">
              τ_MS ∝ (Available Fuel) / (Luminosity) ∝ M / L
            </div>
            <p className="text-slate-300 leading-relaxed">
              For intermediate-mass main-sequence stars (0.5 to 10 M☉), empirical observations and
              standard stellar models demonstrate that luminosity scales sharply with mass:
            </p>
            <div className="p-3 rounded-lg bg-slate-950/80 font-mono text-purple-200 text-center text-sm border border-purple-500/20">
              L ∝ M^3.5 &nbsp;⟹&nbsp; τ_MS ∝ M / M^3.5 = M^(-2.5)
            </div>
            <p className="text-slate-300 leading-relaxed">
              Normalizing to our Sun (M = 1 M☉, τ_Sun ≈ 10 billion years = 10 Gyr), we obtain the
              classic formula:
            </p>
            <div className="p-3 rounded-lg bg-slate-950/80 font-mono text-amber-300 text-center text-sm font-bold border border-amber-500/30">
              {STELLAR_LIFETIME_DATA.formula}
            </div>
          </div>
        )}

        {/* Interactive Mass Slider */}
        <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-400" />
              Adjust Initial Mass:{" "}
              <span className="text-purple-300 font-bold font-mono text-sm">
                {calcMass.toFixed(1)} M☉
              </span>
            </label>
            <span className="text-xs font-mono text-slate-400">
              {calcMass < 0.5
                ? "Very Low-Mass Red Dwarf"
                : calcMass < 2
                  ? "Sun-like Star"
                  : calcMass < 8
                    ? "Intermediate Star"
                    : "Massive Star"}
            </span>
          </div>

          <input
            type="range"
            min="0.2"
            max="40.0"
            step="0.1"
            value={calcMass}
            onChange={(e) => setCalcMass(parseFloat(e.target.value))}
            className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />

          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>0.2 M☉ (Proxima)</span>
            <span>1.0 M☉ (Sun)</span>
            <span>3.0 M☉</span>
            <span>10.0 M☉</span>
            <span>40.0 M☉ (Hypergiant)</span>
          </div>

          {/* Result Telemetry Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-800/80">
            <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                Calculated Lifetime (τ_MS):
              </span>
              <p className="text-lg font-bold font-mono text-amber-400 mt-0.5">
                {calculatedLifetimeMyr >= 1000
                  ? `${(calculatedLifetimeMyr / 1000).toFixed(2)} Billion Years (Gyr)`
                  : `${calculatedLifetimeMyr.toFixed(1)} Million Years (Myr)`}
              </p>
              <span className="text-[11px] text-slate-400">
                Formula output: 10 × ({calcMass.toFixed(1)})^-2.5 Gyr
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                Relative Burning Speed vs Sun:
              </span>
              <p className="text-lg font-bold font-mono text-cyan-400 mt-0.5">
                {(10000 / Math.max(0.01, calculatedLifetimeMyr)).toFixed(1)}x
              </p>
              <span className="text-[11px] text-slate-400">
                {calcMass > 1.0
                  ? "Burns fuel much faster than the Sun"
                  : "Burns fuel far more conservatively"}
              </span>
            </div>
          </div>
        </div>

        {/* Stated Scientific Limitations */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
          <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
            <Info className="w-4 h-4 text-cyan-400" />
            Physical Limitations of the Simplified Formula (Important Stated Caveats):
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-400">
            {STELLAR_LIFETIME_DATA.limitations.map((lim, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-cyan-400 font-mono text-[11px] mt-0.5">•</span>
                <span>{lim}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
