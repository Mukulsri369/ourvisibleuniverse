import React, { useState, useEffect, useRef } from "react";
import {
  Orbit,
  Flame,
  Waves,
  Sparkles,
  Layers,
  Scale,
  Compass,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sliders,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SolarSystemExperimentsLabProps {
  onExperimentTested?: (expId: string) => void;
}

export function SolarSystemExperimentsLab({ onExperimentTested }: SolarSystemExperimentsLabProps) {
  const [activeTab, setActiveTab] = useState<"roche" | "resonance" | "density">("roche");

  // -------------------------------------------------------------
  // EXPERIMENT 1: SATURN'S RINGS & ROCHE LIMIT
  // -------------------------------------------------------------
  const [moonDistanceKm, setMoonDistanceKm] = useState(135000); // Saturn radius ~60,268 km
  const [moonDensity, setMoonDensity] = useState(1000); // 1000 kg/m^3 (pure ice)
  const saturnRadiusKm = 60268;
  const saturnDensity = 687; // kg/m^3

  // Fluid Roche limit: d = 2.44 * R * (rho_M / rho_m)^(1/3)
  const rocheLimitKm = Math.round(
    2.44 * saturnRadiusKm * Math.pow(saturnDensity / moonDensity, 1 / 3),
  );
  const isInsideRoche = moonDistanceKm < rocheLimitKm;

  // Track completion
  useEffect(() => {
    if (activeTab === "roche" && isInsideRoche) {
      onExperimentTested?.("exp_roche_limit");
    }
  }, [isInsideRoche, activeTab, onExperimentTested]);

  // -------------------------------------------------------------
  // EXPERIMENT 2: JUPITER'S LAPLACE ORBITAL RESONANCE
  // -------------------------------------------------------------
  const [isPlayingResonance, setIsPlayingResonance] = useState(true);
  const [resonanceTime, setResonanceTime] = useState(0);

  useEffect(() => {
    if (!isPlayingResonance) return;
    const interval = setInterval(() => {
      setResonanceTime((t) => t + 0.05);
    }, 50);
    return () => clearInterval(interval);
  }, [isPlayingResonance]);

  const ioPeriod = 1.77;
  const europaPeriod = 3.55;
  const ganymedePeriod = 7.15;

  // Angles (4:2:1 ratio)
  const ioAngle = ((resonanceTime / ioPeriod) * Math.PI * 2) % (Math.PI * 2);
  const europaAngle = ((resonanceTime / europaPeriod) * Math.PI * 2) % (Math.PI * 2);
  const ganymedeAngle = ((resonanceTime / ganymedePeriod) * Math.PI * 2) % (Math.PI * 2);

  // Tidal flex intensity on Io peaks when aligned with Europa
  const ioAlignmentDiff = Math.abs(ioAngle - europaAngle);
  const isAligned = ioAlignmentDiff < 0.25 || ioAlignmentDiff > Math.PI * 2 - 0.25;

  useEffect(() => {
    if (activeTab === "resonance" && isAligned) {
      onExperimentTested?.("exp_laplace_resonance");
    }
  }, [isAligned, activeTab, onExperimentTested]);

  // -------------------------------------------------------------
  // EXPERIMENT 3: TERRESTRIAL VS GIANT PLANET DENSITY
  // -------------------------------------------------------------
  const [selectedPlanetForDensity, setSelectedPlanetForDensity] = useState<
    "Earth" | "Saturn" | "Jupiter" | "Mercury" | "Neptune"
  >("Saturn");

  const densityData = {
    Mercury: {
      name: "Mercury",
      category: "Terrestrial (Heavy Iron Core)",
      density: 5.43,
      floats: false,
      corePercent: 85,
      atmosphereP: "10⁻¹⁴ bar",
      desc: "Massive metallic iron core occupying 85% of its radius with a thin rock shell.",
    },
    Earth: {
      name: "Earth",
      category: "Terrestrial (Silicate + Iron)",
      density: 5.51,
      floats: false,
      corePercent: 55,
      atmosphereP: "1.0 bar",
      desc: "Dense iron-nickel core, convective mantle, and thin breathable atmosphere.",
    },
    Jupiter: {
      name: "Jupiter",
      category: "Gas Giant",
      density: 1.33,
      floats: false,
      corePercent: 15,
      atmosphereP: "> 2,000,000 bar",
      desc: "Enormous hydrogen-helium envelope transitioning into liquid metallic hydrogen.",
    },
    Saturn: {
      name: "Saturn",
      category: "Gas Giant (Fluffy)",
      density: 0.69,
      floats: true,
      corePercent: 12,
      atmosphereP: "> 1,000,000 bar",
      desc: "Mean density is less than water (1.0 g/cm³)! In a giant bathtub, Saturn would float.",
    },
    Neptune: {
      name: "Neptune",
      category: "Ice Giant",
      density: 1.64,
      floats: false,
      corePercent: 20,
      atmosphereP: "> 1,000,000 bar",
      desc: "Slushy mantle of superionic water, ammonia, and methane over a rocky core.",
    },
  };

  const currentDensityItem = densityData[selectedPlanetForDensity];

  useEffect(() => {
    if (activeTab === "density") {
      onExperimentTested?.("exp_planet_density");
    }
  }, [activeTab, onExperimentTested]);

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 sm:p-6 backdrop-blur-xl shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="size-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">Interactive Planetology Labs</h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              Module 06 Hands-on
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Conduct virtual experiments in tidal gravitational physics, orbital resonances, and
            planetary composition.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveTab("roche")}
            className={`px-3 py-1.5 text-xs rounded-lg font-medium transition ${
              activeTab === "roche"
                ? "bg-cyan-500 text-black font-semibold shadow-md shadow-cyan-500/20"
                : "text-slate-300 hover:text-white"
            }`}
          >
            1. Saturn's Roche Limit
          </button>
          <button
            onClick={() => setActiveTab("resonance")}
            className={`px-3 py-1.5 text-xs rounded-lg font-medium transition ${
              activeTab === "resonance"
                ? "bg-cyan-500 text-black font-semibold shadow-md shadow-cyan-500/20"
                : "text-slate-300 hover:text-white"
            }`}
          >
            2. Jupiter's Moons
          </button>
          <button
            onClick={() => setActiveTab("density")}
            className={`px-3 py-1.5 text-xs rounded-lg font-medium transition ${
              activeTab === "density"
                ? "bg-cyan-500 text-black font-semibold shadow-md shadow-cyan-500/20"
                : "text-slate-300 hover:text-white"
            }`}
          >
            3. Density & Water Test
          </button>
        </div>
      </div>

      {/* TAB 1: ROCHE LIMIT EXPERIMENT */}
      {activeTab === "roche" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 flex flex-col items-center justify-center bg-black/60 rounded-2xl p-6 border border-white/10 relative min-h-[340px] overflow-hidden">
            {/* 2D Canvas Visualizer */}
            <div className="relative w-full max-w-md h-64 flex items-center justify-center">
              {/* Saturn */}
              <div
                className="rounded-full bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 z-10"
                style={{ width: "90px", height: "90px" }}
              >
                <span className="text-[10px] font-bold text-amber-950">Saturn</span>
              </div>

              {/* Roche Limit Dashed Line */}
              <div
                className="absolute rounded-full border-2 border-dashed border-red-500/60 pointer-events-none"
                style={{
                  width: `${(rocheLimitKm / saturnRadiusKm) * 90}px`,
                  height: `${(rocheLimitKm / saturnRadiusKm) * 90}px`,
                }}
              >
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-semibold text-red-400 bg-black/80 px-1.5 rounded">
                  Roche Limit ({rocheLimitKm.toLocaleString()} km)
                </span>
              </div>

              {/* Test Moon / Particle Ring */}
              <div
                className="absolute flex items-center justify-center transition-all duration-300"
                style={{
                  transform: `translateX(${(moonDistanceKm / saturnRadiusKm) * 45}px)`,
                }}
              >
                {isInsideRoche ? (
                  // Shattered ring particles
                  <div className="relative flex items-center justify-center animate-pulse">
                    <div className="w-10 h-10 rounded-full border border-cyan-400/80 bg-cyan-500/20 flex items-center justify-center">
                      <span className="text-[9px] text-cyan-200 text-center leading-tight">
                        Torn into Ring!
                      </span>
                    </div>
                    {/* Ring debris dots */}
                    <div className="absolute w-20 h-1 bg-gradient-to-r from-transparent via-cyan-300 to-transparent rotate-45" />
                  </div>
                ) : (
                  // Intact spherical moon
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-slate-300 border-2 border-white shadow-md shadow-white/30" />
                    <span className="text-[10px] text-slate-200 font-semibold mt-1">
                      Intact Moon
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 text-center">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  isInsideRoche
                    ? "bg-red-500/20 text-red-300 border border-red-500/40"
                    : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                }`}
              >
                {isInsideRoche ? (
                  <>
                    <AlertTriangle className="size-3.5 text-red-400" />
                    Inside Roche Limit: Tidal tensile forces exceed moon's self-gravity! (Shattered
                    into rings)
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-3.5 text-emerald-400" />
                    Outside Roche Limit: Moon remains gravitationally stable and intact.
                  </>
                )}
              </span>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-between gap-4">
            <div>
              <h4 className="text-sm font-semibold text-white mb-1">
                The Physics of Saturn's Rings
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                When a moon gets too close to a massive planet, the gravitational pull on the near
                side is significantly stronger than on the far side. Inside the{" "}
                <strong className="text-cyan-400">Roche Limit</strong>, this difference (tidal
                stress) overpowers the moon's own gravity, shredding it into billions of ring
                particles.
              </p>

              {/* Slider 1: Distance */}
              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-300">Orbital Distance from Saturn:</span>
                  <span className="text-cyan-400 font-bold">
                    {moonDistanceKm.toLocaleString()} km
                  </span>
                </div>
                <input
                  type="range"
                  min="70000"
                  max="220000"
                  step="2000"
                  value={moonDistanceKm}
                  onChange={(e) => setMoonDistanceKm(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Inside Ring Plane (70,000 km)</span>
                  <span>Outer Orbit (220,000 km)</span>
                </div>
              </div>

              {/* Slider 2: Moon Density */}
              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-300">Satellite Density:</span>
                  <span className="text-cyan-400 font-bold">{moonDensity} kg/m³</span>
                </div>
                <input
                  type="range"
                  min="800"
                  max="3500"
                  step="100"
                  value={moonDensity}
                  onChange={(e) => setMoonDensity(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Pure Ice (~920 kg/m³)</span>
                  <span>Stony Rock (~3,000 kg/m³)</span>
                </div>
              </div>

              <div className="mt-4 bg-white/5 p-3 rounded-xl border border-white/5 text-xs text-slate-300">
                <div className="font-semibold text-white mb-0.5">Calculated Fluid Roche Limit:</div>
                <div className="text-cyan-300 font-mono text-sm">
                  {rocheLimitKm.toLocaleString()} km
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Formula: $d = 2.44 \cdot R_M \cdot (\rho_M / \rho_m)^{1 / 3}$
                </div>
              </div>
            </div>

            <Button
              size="sm"
              onClick={() => setMoonDistanceKm(100000)}
              variant="outline"
              className="border-white/10 text-white bg-white/5 hover:bg-white/10"
            >
              Test Tidal Disruption (Set to 100,000 km)
            </Button>
          </div>
        </div>
      )}

      {/* TAB 2: JUPITER'S LAPLACE RESONANCE & TIDAL VOLCANOES */}
      {activeTab === "resonance" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 flex flex-col items-center justify-center bg-black/60 rounded-2xl p-6 border border-white/10 relative min-h-[340px]">
            {/* Orbital visualizer */}
            <div className="relative w-72 h-72 flex items-center justify-center">
              {/* Jupiter */}
              <div className="rounded-full bg-gradient-to-r from-amber-400 to-amber-700 w-16 h-16 flex items-center justify-center z-10 shadow-lg shadow-amber-600/30">
                <span className="text-[10px] font-bold text-black">Jupiter</span>
              </div>

              {/* Io Orbit (Inner) */}
              <div className="absolute w-28 h-28 rounded-full border border-amber-500/30" />
              <div
                className="absolute w-28 h-28 flex items-center justify-center pointer-events-none"
                style={{ transform: `rotate(${ioAngle}rad)` }}
              >
                <div className="w-3.5 h-3.5 rounded-full bg-amber-300 -translate-x-14 shadow-sm shadow-amber-300 flex items-center justify-center">
                  <Flame className="size-2 text-red-600 animate-pulse" />
                </div>
              </div>

              {/* Europa Orbit (Middle) */}
              <div className="absolute w-44 h-44 rounded-full border border-cyan-500/30" />
              <div
                className="absolute w-44 h-44 flex items-center justify-center pointer-events-none"
                style={{ transform: `rotate(${europaAngle}rad)` }}
              >
                <div className="w-3 h-3 rounded-full bg-cyan-200 -translate-x-22 shadow-sm shadow-cyan-300 flex items-center justify-center">
                  <Waves className="size-2 text-blue-700" />
                </div>
              </div>

              {/* Ganymede Orbit (Outer) */}
              <div className="absolute w-64 h-64 rounded-full border border-purple-500/30" />
              <div
                className="absolute w-64 h-64 flex items-center justify-center pointer-events-none"
                style={{ transform: `rotate(${ganymedeAngle}rad)` }}
              >
                <div className="w-4 h-4 rounded-full bg-slate-400 -translate-x-32 shadow-sm shadow-slate-300" />
              </div>
            </div>

            <div className="mt-3 flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-amber-300">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-300 inline-block" />
                Io (4 laps)
              </span>
              <span className="flex items-center gap-1.5 text-cyan-300">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-200 inline-block" />
                Europa (2 laps)
              </span>
              <span className="flex items-center gap-1.5 text-purple-300">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" />
                Ganymede (1 lap)
              </span>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-between gap-4">
            <div>
              <h4 className="text-sm font-semibold text-white mb-1">
                The 4:2:1 Laplace Resonance Engine
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                For every <strong className="text-amber-400">4 orbits of Io</strong>, Europa
                completes <strong className="text-cyan-400">2 orbits</strong>, and Ganymede
                completes exactly <strong className="text-purple-400">1 orbit</strong>.
              </p>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                This exact integer ratio causes the moons to line up periodically, giving repetitive
                gravitational tugs that prevent their orbits from becoming circular. Because Io's
                distance from Jupiter constantly changes along its eccentric orbit, Jupiter's
                titanic tidal gravity flexes its rocky crust by up to 100 meters every 42 hours —
                generating enough friction to power over 400 active volcanoes!
              </p>

              <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                  <Flame className="size-4 text-amber-400" /> Current Io Tidal Heat Generation:
                </div>
                <div className="text-slate-300 mt-1">
                  ~100 Terawatts (~2.5 W/m² surface flux) — making Io the most volcanically active
                  body in the entire Solar System.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => setIsPlayingResonance(!isPlayingResonance)}
                className="bg-cyan-600 hover:bg-cyan-500 text-white"
              >
                {isPlayingResonance ? (
                  <Pause className="size-3.5 mr-1.5" />
                ) : (
                  <Play className="size-3.5 mr-1.5" />
                )}
                {isPlayingResonance ? "Pause Resonance" : "Play Resonance"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setResonanceTime(0)}
                className="border-white/10 text-white hover:bg-white/10"
              >
                <RotateCcw className="size-3.5 mr-1.5" />
                Reset Alignment
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DENSITY & WATER FLOAT TEST */}
      {activeTab === "density" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 flex flex-col items-center justify-center bg-black/60 rounded-2xl p-6 border border-white/10 relative min-h-[340px]">
            {/* Giant Bathtub Tank Visual */}
            <div className="relative w-full max-w-sm h-64 border-2 border-cyan-500/40 rounded-b-2xl bg-gradient-to-b from-transparent via-cyan-950/20 to-cyan-900/40 p-4 flex flex-col justify-end overflow-hidden">
              {/* Water surface line */}
              <div className="absolute top-16 inset-x-0 border-b-2 border-dashed border-cyan-400/70 flex items-center justify-end px-3">
                <span className="text-[10px] text-cyan-300 font-semibold bg-black/60 px-1 rounded">
                  Water Surface (Density = 1.0 g/cm³)
                </span>
              </div>

              {/* Planet in bathtub */}
              <div
                className={`flex flex-col items-center transition-all duration-700 ease-out z-10 ${
                  currentDensityItem.floats ? "mb-28" : "mb-2"
                }`}
              >
                <div
                  className="rounded-full flex items-center justify-center shadow-2xl border-2 border-white/20"
                  style={{
                    width: currentDensityItem.name === "Saturn" ? "90px" : "60px",
                    height: currentDensityItem.name === "Saturn" ? "90px" : "60px",
                    backgroundColor:
                      currentDensityItem.name === "Saturn"
                        ? "#dfc78f"
                        : currentDensityItem.name === "Earth"
                          ? "#287ab8"
                          : currentDensityItem.name === "Mercury"
                            ? "#a69584"
                            : currentDensityItem.name === "Jupiter"
                              ? "#c49a6c"
                              : "#376ec4",
                  }}
                >
                  <span className="text-[10px] font-bold text-black bg-white/80 px-1 rounded">
                    {currentDensityItem.name}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-white mt-1">
                  {currentDensityItem.density} g/cm³
                </span>
              </div>

              {/* Result banner */}
              <div className="absolute bottom-3 inset-x-3 text-center">
                <span
                  className={`text-xs px-3 py-1 rounded-full font-semibold border ${
                    currentDensityItem.floats
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  }`}
                >
                  {currentDensityItem.floats
                    ? "🎉 FLOATS! Less dense than water!"
                    : "⚓ SINKS! Denser than water!"}
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-between gap-4">
            <div>
              <h4 className="text-sm font-semibold text-white mb-1">
                Comparative Planetary Densities
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Select different worlds to test their bulk densities against liquid water
                ($1.00\text{g / cm}^3$). Terrestrial planets are made of heavy iron and rock, while
                giant planets are puffed up by deep hydrogen atmospheres.
              </p>

              {/* Selector */}
              <div className="grid grid-cols-3 gap-1.5 mt-3">
                {(["Earth", "Saturn", "Jupiter", "Mercury", "Neptune"] as const).map((pName) => (
                  <button
                    key={pName}
                    onClick={() => setSelectedPlanetForDensity(pName)}
                    className={`py-1.5 text-xs rounded-lg font-medium transition ${
                      selectedPlanetForDensity === pName
                        ? "bg-cyan-500 text-black font-semibold shadow-md shadow-cyan-500/20"
                        : "bg-white/5 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    {pName}
                  </button>
                ))}
              </div>

              {/* Breakdown Card */}
              <div className="mt-4 bg-white/5 p-3.5 rounded-xl border border-white/5 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Class:</span>
                  <span className="text-white font-semibold">{currentDensityItem.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Bulk Density:</span>
                  <span className="text-cyan-300 font-bold">
                    {currentDensityItem.density} g/cm³
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Atmospheric Base Pressure:</span>
                  <span className="text-white font-mono">{currentDensityItem.atmosphereP}</span>
                </div>
                <p className="text-[11px] text-slate-300 pt-2 border-t border-white/10 leading-relaxed italic">
                  {currentDensityItem.desc}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
