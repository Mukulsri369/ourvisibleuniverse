import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Orbit,
  Sparkles,
  Sliders,
  RotateCcw,
  AlertTriangle,
  Info,
  CheckCircle2,
  Atom,
  Clock,
  Compass,
  ArrowRight,
  TrendingDown,
  Layers,
  ChevronRight,
  ShieldCheck,
  Disc,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PLANET_FORMATION_PHASES,
  calculateDiskStructure,
  calculateOrbitalPhysics,
  type PlanetFormationPhaseId,
  type NumericalProtoplanetaryDiskParams,
} from "@/lib/astronomy/astrophysics-lab/planet-formation-engine";

interface PlanetFormationLabProps {
  initialHostStarName?: string;
}

export function PlanetFormationLab({
  initialHostStarName = "HL Tauri Protoplanetary System",
}: PlanetFormationLabProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Protoplanetary disk parameters (Separate Numerical System)
  const [diskParams, setDiskParams] = useState<NumericalProtoplanetaryDiskParams>({
    stellarMassSolar: 1.0,
    diskMassSolar: 0.02,
    diskRadiusAu: 100,
    stellarLuminositySolar: 1.0,
    viscosityAlpha: 0.001,
  });

  const [activePhaseId, setActivePhaseId] = useState<PlanetFormationPhaseId>("protoplanetary_disk");
  const [selectedPlanetOrbitalAu, setSelectedPlanetOrbitalAu] = useState<number>(3.5);
  const [selectedPlanetMassEarth, setSelectedPlanetMassEarth] = useState<number>(10.0);
  const [particleDensity, setParticleDensity] = useState<"balanced" | "dense">("dense");

  const diskPhysics = useMemo(() => calculateDiskStructure(diskParams), [diskParams]);
  const planetPhysics = useMemo(
    () => calculateOrbitalPhysics(selectedPlanetOrbitalAu, selectedPlanetMassEarth, diskParams.stellarMassSolar),
    [selectedPlanetOrbitalAu, selectedPlanetMassEarth, diskParams.stellarMassSolar]
  );
  const activePhase = PLANET_FORMATION_PHASES[activePhaseId];

  // GPU/Canvas particles for visual component
  const particles = useMemo(() => {
    const count = particleDensity === "balanced" ? 400 : 750;
    const pts = [];
    for (let i = 0; i < count; i++) {
      const radius = 15 + Math.random() * 210;
      const angle = Math.random() * Math.PI * 2;
      const speed = (0.5 / Math.sqrt(radius / 50)) * (0.85 + Math.random() * 0.3);
      pts.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        radius,
        angle,
        speed,
        size: Math.random() * 2.2 + 0.8,
        zOffset: (Math.random() - 0.5) * 45, // Vertical disk thickness
      });
    }
    return pts;
  }, [particleDensity]);

  // Canvas visual rendering of Protoplanetary Disk & Planetary Accretion
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let frame = 0;

    const render = () => {
      frame++;
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;

      ctx.fillStyle = "#030712";
      ctx.fillRect(0, 0, width, height);

      // 1. Central protostar glow
      const starGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 22);
      starGrad.addColorStop(0, "#ffffff");
      starGrad.addColorStop(0.3, "#fef08a");
      starGrad.addColorStop(0.8, "#f97316");
      starGrad.addColorStop(1, "rgba(249, 115, 22, 0)");
      ctx.fillStyle = starGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 22, 0, Math.PI * 2);
      ctx.fill();

      // 2. Snow line / Ice line ring
      const snowLineRadiusPx = (diskPhysics.snowLineRadiusAu / 10) * 160;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(1, 0.4); // Disk inclination view

      ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, Math.min(220, snowLineRadiusPx), 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // 3. Render Dust Particles & Pebble Streams
      particles.forEach((p, idx) => {
        p.angle += p.speed * 0.02;

        // Dust settling effect: zOffset contracts as phase advances
        const settleFactor =
          activePhaseId === "dust_settling" ||
          activePhaseId === "pebble_growth" ||
          activePhaseId === "planetesimals" ||
          activePhaseId === "embryo_growth"
            ? 0.15
            : 0.8;

        // Planet gap opening at selected orbital radius
        const planetRadiusPx = (selectedPlanetOrbitalAu / 10) * 160;
        let pRadius = p.radius;
        if (
          (activePhaseId === "embryo_growth" ||
            activePhaseId === "migration_resonance" ||
            activePhaseId === "atmosphere_formation") &&
          Math.abs(pRadius - planetRadiusPx) < 16
        ) {
          // Push particles out of gap
          pRadius += (pRadius > planetRadiusPx ? 1 : -1) * 10;
        }

        const px = Math.cos(p.angle) * pRadius;
        const py = Math.sin(p.angle) * pRadius + p.zOffset * settleFactor;

        // Color depends on snow line: warm rock (amber) inside snow line, icy pebble (cyan) outside
        const isIcy = pRadius > snowLineRadiusPx;
        ctx.fillStyle = isIcy ? "rgba(147, 197, 253, 0.75)" : "rgba(251, 191, 36, 0.8)";
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // 4. Planetary Embryo & Hill Sphere (Embryo growth & Migration stages)
      if (
        activePhaseId === "embryo_growth" ||
        activePhaseId === "migration_resonance" ||
        activePhaseId === "giant_impacts" ||
        activePhaseId === "atmosphere_formation"
      ) {
        const pRadiusPx = (selectedPlanetOrbitalAu / 10) * 160;
        const planetAngle = frame * 0.015;
        const plX = Math.cos(planetAngle) * pRadiusPx;
        const plY = Math.sin(planetAngle) * pRadiusPx;

        // Hill Sphere boundary
        const hillPx = Math.max(8, (planetPhysics.hillRadiusAu / 10) * 160);
        ctx.strokeStyle = "rgba(168, 85, 247, 0.4)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(plX, plY, hillPx, 0, Math.PI * 2);
        ctx.stroke();

        // Planet body
        ctx.fillStyle = activePhaseId === "atmosphere_formation" ? "#38bdf8" : "#f43f5e";
        ctx.beginPath();
        ctx.arc(plX, plY, 4.5, 0, Math.PI * 2);
        ctx.fill();

        // Giant impact flash (during giant impacts phase)
        if (activePhaseId === "giant_impacts" && frame % 40 < 20) {
          ctx.fillStyle = "rgba(254, 240, 138, 0.7)";
          ctx.beginPath();
          ctx.arc(plX, plY, 14, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [diskPhysics, planetPhysics, particles, activePhaseId, selectedPlanetOrbitalAu]);

  return (
    <div className="space-y-6">
      {/* 1. Header & Observational Object Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-white/10 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-cyan-500/20 text-cyan-400 font-mono text-[11px] font-bold uppercase tracking-wider px-2">
              Module 3: Planet Formation
            </span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                activePhase.statusBadge === "OBSERVATION"
                  ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                  : "bg-blue-500/20 border-blue-500/40 text-blue-300"
              }`}
            >
              [{activePhase.statusBadge}]
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Protoplanetary Disks, Pebble Accretion & Migration
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Coupled numerical physics solver driving GPU-inspired particle visualization from dust settling to atmospheric capture.
          </p>
        </div>

        {/* Observed Target Attribution Disclaimer */}
        <div className="text-right text-xs">
          <span className="text-slate-400 block font-mono text-[11px]">Observational Reference:</span>
          <span className="text-cyan-300 font-bold">{initialHostStarName}</span>
          <p className="text-[10px] text-slate-500 max-w-xs mt-0.5">
            *Demonstrates a scientifically plausible physical process based on published models, not an exact recording of this system's past.
          </p>
        </div>
      </div>

      {/* 2. Main Visual Canvas & Parameter Sliders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Particle Simulation Canvas (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black">
            <canvas ref={canvasRef} width={800} height={450} className="w-full h-full object-cover block" />

            {/* Overlaid Status Indicators */}
            <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/15 text-white">
                {activePhase.name}
              </span>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/15 text-cyan-300">
                Frost Line: {diskPhysics.snowLineRadiusAu.toFixed(1)} AU
              </span>
            </div>

            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <button
                onClick={() => setParticleDensity((prev) => (prev === "balanced" ? "dense" : "balanced"))}
                className="text-[11px] font-mono px-2.5 py-1 rounded-lg border border-white/15 bg-black/80 text-slate-300 backdrop-blur-md"
              >
                Particles: {particleDensity === "dense" ? "750 (High)" : "400 (Balanced)"}
              </button>
            </div>
          </div>

          {/* 8-Phase Formation Stepper */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300">Planetary Growth Sequence:</span>
              <span className="text-cyan-400 font-mono text-[11px]">{activePhase.timescaleYears}</span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
              {(Object.keys(PLANET_FORMATION_PHASES) as PlanetFormationPhaseId[]).map((phaseKey) => {
                const ph = PLANET_FORMATION_PHASES[phaseKey];
                const isSelected = activePhaseId === phaseKey;
                return (
                  <button
                    key={phaseKey}
                    onClick={() => setActivePhaseId(phaseKey)}
                    className={`p-2 rounded-xl text-left border transition-all ${
                      isSelected
                        ? "bg-cyan-500/25 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-500/10 font-bold"
                        : "bg-slate-950/60 border-white/5 text-slate-400 hover:text-white hover:border-white/20"
                    }`}
                  >
                    <div className="text-[10px] font-mono text-slate-500">#{ph.order}</div>
                    <div className="text-[11px] truncate">{ph.name.split(". ")[1]}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Numerical Physics Controls & Planetary Orbit Parameters (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Protoplanetary Disk Parameters</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setDiskParams({
                    stellarMassSolar: 1.0,
                    diskMassSolar: 0.02,
                    diskRadiusAu: 100,
                    stellarLuminositySolar: 1.0,
                    viscosityAlpha: 0.001,
                  });
                  setSelectedPlanetOrbitalAu(3.5);
                  setSelectedPlanetMassEarth(10.0);
                }}
                className="text-[11px] text-slate-400 hover:text-white h-7 px-2"
              >
                <RotateCcw className="size-3 mr-1" /> Reset
              </Button>
            </h3>

            {/* Slider 1: Star Luminosity (shifts snow line) */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Host Star Luminosity:</span>
                <span className="font-mono text-amber-300 font-bold">
                  {diskParams.stellarLuminositySolar.toFixed(1)} L_☉
                </span>
              </div>
              <input
                type="range"
                min={0.2}
                max={5.0}
                step={0.1}
                value={diskParams.stellarLuminositySolar}
                onChange={(e) =>
                  setDiskParams({ ...diskParams, stellarLuminositySolar: parseFloat(e.target.value) })
                }
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>

            {/* Slider 2: Planet Orbit (AU) */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Embryo Semi-Major Axis (a):</span>
                <span className="font-mono text-cyan-300 font-bold">{selectedPlanetOrbitalAu} AU</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={15.0}
                step={0.1}
                value={selectedPlanetOrbitalAu}
                onChange={(e) => setSelectedPlanetOrbitalAu(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Numerical Physics Indicators Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-black/40 border border-white/10 rounded-xl p-3">
              <div>
                <span className="text-slate-500 block text-[10px]">Frost Line (r_ice):</span>
                <span className="text-cyan-300 font-bold">{diskPhysics.snowLineRadiusAu.toFixed(2)} AU</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Orbital Period:</span>
                <span className="text-slate-200 font-bold">{planetPhysics.orbitalPeriodYears.toFixed(2)} yr</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Hill Sphere (r_H):</span>
                <span className="text-purple-300 font-bold">{planetPhysics.hillRadiusAu.toFixed(3)} AU</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Type I Migration:</span>
                <span className="text-amber-300 font-bold">
                  {(diskPhysics.typeIMigrationTimeYears / 1000).toFixed(0)} kyr
                </span>
              </div>
            </div>

            {/* Stage Description & Governing Physics */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="text-xs">
                <span className="font-bold text-slate-300 block mb-0.5">Physical Mechanism:</span>
                <p className="text-slate-400 leading-relaxed text-[11px]">{activePhase.description}</p>
              </div>

              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-white/5 space-y-1 text-[11px]">
                <div className="text-slate-400">
                  <strong className="text-slate-300">Governing Physics:</strong> {activePhase.governingPhysics}
                </div>
                <div className="text-slate-400">
                  <strong className="text-slate-300">Observational Evidence:</strong> {activePhase.observationalEvidence}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
