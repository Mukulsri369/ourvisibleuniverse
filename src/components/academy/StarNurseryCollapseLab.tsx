import React, { useState, useMemo } from "react";
import {
  calculateStarNurseryPhysics,
  type StarNurseryParams,
} from "@/lib/academy/lessons/module-11-nebulae";
import {
  Flame,
  Snowflake,
  Sliders,
  RotateCcw,
  AlertTriangle,
  Sparkles,
  Zap,
  Info,
  CheckCircle2,
  Atom,
  Clock,
  TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function StarNurseryCollapseLab() {
  const [params, setParams] = useState<StarNurseryParams>({
    gasDensityCm3: 10000,
    temperatureKelvin: 15,
    cloudMassSolar: 100,
    cloudRadiusLightYears: 2.0,
  });

  const physics = useMemo(() => calculateStarNurseryPhysics(params), [params]);

  const handlePreset = (density: number, temp: number, mass: number) => {
    setParams((prev) => ({
      ...prev,
      gasDensityCm3: density,
      temperatureKelvin: temp,
      cloudMassSolar: mass,
    }));
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm shadow-xl space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Atom className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-semibold text-white">
              Star Nursery: Gravitational Collapse Activity
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Adjust temperature, gas density, and total cloud mass to observe Jeans instability and
            star formation
          </p>
        </div>

        {/* Preset scenario buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handlePreset(50000, 10, 80)}
            className="text-[11px] bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
          >
            Cold Bok Globule
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handlePreset(200, 80, 50)}
            className="text-[11px] bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
          >
            Warm Diffuse Gas
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handlePreset(15000, 15, 600)}
            className="text-[11px] bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
          >
            Orion GMC Core
          </Button>
        </div>
      </div>

      {/* 2. Educational Approximation Notice Banner */}
      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-200 leading-relaxed">
          <strong className="text-amber-300 font-semibold">
            Educational Approximation Notice:
          </strong>{" "}
          This experiment models an idealized spherical cloud using the classical{" "}
          <strong>Jeans Instability Criterion</strong> and <strong>Virial Theorem</strong>. Real
          interstellar star birth is governed by complex 3D{" "}
          <strong>magnetohydrodynamics (MHD)</strong>, supersonic turbulence, magnetic field
          braking, and radiative stellar feedback.
        </div>
      </div>

      {/* 3. Interactive Controls & Live Physics Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Sliders (7 cols) */}
        <div className="lg:col-span-7 space-y-5 p-5 rounded-xl bg-slate-950/70 border border-slate-800">
          {/* Slider 1: Temperature */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Snowflake className="w-4 h-4 text-cyan-400" />
                Cloud Temperature (Thermal Pressure)
              </span>
              <span className="font-mono text-cyan-300 font-bold">
                {params.temperatureKelvin} Kelvin
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              step="1"
              value={params.temperatureKelvin}
              onChange={(e) =>
                setParams({ ...params, temperatureKelvin: parseInt(e.target.value) })
              }
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>5 K (Freezing dense core)</span>
              <span>20 K (Normal GMC)</span>
              <span>100 K (Warm ISM)</span>
            </div>
          </div>

          {/* Slider 2: Gas Density */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Atom className="w-4 h-4 text-emerald-400" />
                Gas Density (n_H2 particles / cm³)
              </span>
              <span className="font-mono text-emerald-300 font-bold">
                {params.gasDensityCm3.toLocaleString()} cm⁻³
              </span>
            </div>
            <input
              type="range"
              min="100"
              max="100000"
              step="500"
              value={params.gasDensityCm3}
              onChange={(e) => setParams({ ...params, gasDensityCm3: parseInt(e.target.value) })}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>100 cm⁻³ (Diffuse)</span>
              <span>10,000 cm⁻³ (Clump)</span>
              <span>100,000 cm⁻³ (Protostellar core)</span>
            </div>
          </div>

          {/* Slider 3: Cloud Mass */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400" />
                Total Cloud Mass (Self-Gravity)
              </span>
              <span className="font-mono text-amber-300 font-bold">
                {params.cloudMassSolar} Solar Masses (M☉)
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="1000"
              step="10"
              value={params.cloudMassSolar}
              onChange={(e) => setParams({ ...params, cloudMassSolar: parseInt(e.target.value) })}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>10 M☉ (Isolated clump)</span>
              <span>200 M☉ (Cluster nursery)</span>
              <span>1,000 M☉ (Giant OB nursery)</span>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handlePreset(10000, 15, 100)}
              className="text-xs text-slate-400 hover:text-white gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Standard
            </Button>
          </div>
        </div>

        {/* Right: Real-time Telemetry & Outcome Box (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4 p-5 rounded-xl bg-slate-950/80 border border-slate-800">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-semibold text-slate-300">Collapse Fate:</span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  physics.willCollapse
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                }`}
              >
                {physics.willCollapse ? "GRAVITATIONAL COLLAPSE" : "STABLE / EXPANDING"}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {physics.willCollapse ? (
                <>
                  Gravity overcomes thermal kinetic pressure! The cloud exceeds its Jeans threshold
                  and collapses into an estimated{" "}
                  <strong className="text-emerald-300 font-mono">
                    ~{physics.expectedStars} protostars
                  </strong>
                  .
                </>
              ) : (
                <>
                  Thermal gas pressure resists gravity. The gas is too warm or too diffuse to
                  condense, preventing star formation.
                </>
              )}
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block mb-0.5">Jeans Mass (M_J):</span>
                <p className="text-sm font-bold font-mono text-cyan-300">
                  {physics.jeansMassSolar} M☉
                </p>
                <span className="text-[10px] text-slate-500">Threshold required</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block mb-0.5">
                  Virial Ratio (2K/|Ω|):
                </span>
                <p className="text-sm font-bold font-mono text-amber-300">{physics.virialRatio}</p>
                <span className="text-[10px] text-slate-500">
                  {physics.virialRatio < 1.0 ? "< 1.0 (Collapses)" : ">= 1.0 (Stable)"}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-0.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-pink-400" />
                Free-Fall Timescale (τ_ff):
              </span>
              <p className="text-sm font-bold font-mono text-pink-300">
                {physics.freeFallTimeYears.toLocaleString()} Years
              </p>
              <span className="text-[10px] text-slate-500">Estimated dynamical collapse time</span>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-slate-400 italic">
            Astrophysical law: Lower temperature reduces thermal bouncing; higher density pulls
            matter inward.
          </div>
        </div>
      </div>
    </div>
  );
}
