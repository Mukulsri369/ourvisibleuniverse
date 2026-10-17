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
  TrendingUp,
  Layers,
  ChevronRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  GALAXY_ASSEMBLY_STAGES,
  calculateMergerPhysics,
  type GalaxyAssemblyStageId,
  type MergerSimulationParams,
} from "@/lib/astronomy/astrophysics-lab/galaxy-assembly-engine";

interface GalaxyAssemblyLabProps {
  initialGalaxyTargetName?: string;
}

export function GalaxyAssemblyLab({
  initialGalaxyTargetName = "The Antennae Galaxies (NGC 4038 / 4039)",
}: GalaxyAssemblyLabProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [activeStageId, setActiveStageId] = useState<GalaxyAssemblyStageId>(
    "galaxy_collision_tidal_tails",
  );
  const [mergerParams, setMergerParams] = useState<MergerSimulationParams>({
    massRatio: 1.0, // Equal major merger
    gasFraction: 0.35,
    impactParameterKpc: 25,
    isPrograde: true,
    feedbackStrength: 1.0,
  });

  const activeStage = GALAXY_ASSEMBLY_STAGES[activeStageId];
  const mergerPhysics = useMemo(() => calculateMergerPhysics(mergerParams), [mergerParams]);

  // Particles for galaxy collision & dark matter potential well
  const particles = useMemo(() => {
    const pts = [];
    // Primary galaxy disk (350 stars)
    for (let i = 0; i < 350; i++) {
      const radius = 10 + Math.random() * 80;
      const angle = Math.random() * Math.PI * 2;
      pts.push({
        galaxyId: 1,
        radius,
        angle,
        speed: 0.8 / Math.sqrt(radius / 25),
        size: Math.random() * 2 + 1,
        color: "#38bdf8",
      });
    }

    // Secondary interacting galaxy disk (200 stars)
    const count2 = Math.round(250 * Math.min(1.0, mergerParams.massRatio));
    for (let i = 0; i < count2; i++) {
      const radius = 8 + Math.random() * 65;
      const angle = Math.random() * Math.PI * 2;
      pts.push({
        galaxyId: 2,
        radius,
        angle,
        speed: (mergerParams.isPrograde ? 1 : -1) * (0.8 / Math.sqrt(radius / 20)),
        size: Math.random() * 2 + 0.8,
        color: "#f43f5e",
      });
    }
    return pts;
  }, [mergerParams.massRatio, mergerParams.isPrograde]);

  // Canvas rendering of galaxy collision & tidal tails
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

      // Orbital interaction centers: primary & secondary
      const separation = (mergerParams.impactParameterKpc / 50) * 120;
      const orbitProgress = (frame * 0.008) % (Math.PI * 2);

      const g1X = cx - Math.cos(orbitProgress) * (separation * 0.4);
      const g1Y = cy - Math.sin(orbitProgress) * (separation * 0.2);

      const g2X = cx + Math.cos(orbitProgress) * (separation * 0.6);
      const g2Y = cy + Math.sin(orbitProgress) * (separation * 0.3);

      // 1. Dark matter halo potential wells (faint blue/violet glow)
      const halo1Grad = ctx.createRadialGradient(g1X, g1Y, 5, g1X, g1Y, 130);
      halo1Grad.addColorStop(0, "rgba(56, 189, 248, 0.25)");
      halo1Grad.addColorStop(0.6, "rgba(30, 27, 75, 0.2)");
      halo1Grad.addColorStop(1, "rgba(3, 7, 18, 0)");
      ctx.fillStyle = halo1Grad;
      ctx.beginPath();
      ctx.arc(g1X, g1Y, 130, 0, Math.PI * 2);
      ctx.fill();

      if (activeStageId !== "quenched_elliptical_remnant") {
        const halo2Grad = ctx.createRadialGradient(
          g2X,
          g2Y,
          5,
          g2X,
          g2Y,
          100 * mergerParams.massRatio,
        );
        halo2Grad.addColorStop(0, "rgba(244, 63, 94, 0.2)");
        halo2Grad.addColorStop(0.6, "rgba(49, 46, 129, 0.15)");
        halo2Grad.addColorStop(1, "rgba(3, 7, 18, 0)");
        ctx.fillStyle = halo2Grad;
        ctx.beginPath();
        ctx.arc(g2X, g2Y, 100 * mergerParams.massRatio, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Gravitational Tidal Tail streamers (during collision phase)
      if (
        activeStageId === "galaxy_collision_tidal_tails" ||
        activeStageId === "nuclear_starburst_merger"
      ) {
        ctx.strokeStyle = "rgba(236, 72, 153, 0.4)";
        ctx.lineWidth = 2.5;

        // Sweeping Antennae-like tidal tails
        ctx.beginPath();
        ctx.moveTo(g1X, g1Y);
        ctx.bezierCurveTo(g1X - 120, g1Y - 90, g1X - 180, g1Y + 80, g1X - 220, g1Y + 30);
        ctx.stroke();

        ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
        ctx.beginPath();
        ctx.moveTo(g2X, g2Y);
        ctx.bezierCurveTo(g2X + 110, g2Y + 90, g2X + 170, g2Y - 80, g2X + 210, g2Y - 40);
        ctx.stroke();
      }

      // 3. Render Disk & Halo Stars
      particles.forEach((p) => {
        p.angle += p.speed * 0.02;

        const isG1 = p.galaxyId === 1;
        const centerGx = isG1 || activeStageId === "quenched_elliptical_remnant" ? g1X : g2X;
        const centerGy = isG1 || activeStageId === "quenched_elliptical_remnant" ? g1Y : g2Y;

        const px = centerGx + Math.cos(p.angle) * p.radius;
        let py = centerGy + Math.sin(p.angle) * p.radius * 0.45;

        // Spheroidal dispersion for quenched elliptical remnant
        if (activeStageId === "quenched_elliptical_remnant") {
          py = centerGy + Math.sin(p.angle) * p.radius * 0.85;
        }

        ctx.fillStyle = activeStageId === "quenched_elliptical_remnant" ? "#fef08a" : p.color;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // 4. Central Cores
      ctx.fillStyle = "#ffffff";
      ctx.shadowBlur = 14;
      ctx.shadowColor = "#38bdf8";
      ctx.beginPath();
      ctx.arc(g1X, g1Y, 5, 0, Math.PI * 2);
      ctx.fill();

      if (activeStageId !== "quenched_elliptical_remnant") {
        ctx.shadowColor = "#f43f5e";
        ctx.beginPath();
        ctx.arc(g2X, g2Y, 4 * mergerParams.massRatio, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [particles, mergerParams, activeStageId]);

  return (
    <div className="space-y-6">
      {/* 1. Header & Observational Object Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-white/10 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-indigo-500/20 text-indigo-400 font-mono text-[11px] font-bold uppercase tracking-wider px-2">
              Module 4: Galaxy Assembly
            </span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                activeStage.statusBadge === "OBSERVATION"
                  ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                  : "bg-blue-500/20 border-blue-500/40 text-blue-300"
              }`}
            >
              [{activeStage.statusBadge}]
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Cosmic Infall, Supernova Winds & Mergers
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            IllustrisTNG & FIRE-2 hydrodynamic models illustrating halo assembly, Kennicutt-Schmidt
            starbursts, and tidal bridge formation.
          </p>
        </div>

        {/* Observed Target Attribution Disclaimer */}
        <div className="text-right text-xs">
          <span className="text-slate-400 block font-mono text-[11px]">
            Observational Reference:
          </span>
          <span className="text-indigo-300 font-bold">{initialGalaxyTargetName}</span>
          <p className="text-[10px] text-slate-500 max-w-xs mt-0.5">
            *Demonstrates a scientifically plausible physical process based on numerical
            simulations, not an exact recording of this galaxy's past.
          </p>
        </div>
      </div>

      {/* 2. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Collision Simulation Canvas (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black">
            <canvas
              ref={canvasRef}
              width={800}
              height={450}
              className="w-full h-full object-cover block"
            />

            {/* Overlaid Live Indicators */}
            <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/15 text-white">
                {activeStage.name}
              </span>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/15 text-indigo-300">
                {activeStage.redshiftZ}
              </span>
            </div>
          </div>

          {/* 7-Stage Assembly Stepper */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300">Galaxy Assembly Epochs:</span>
              <span className="text-indigo-400 font-mono text-[11px]">
                {activeStage.cosmicEpoch}
              </span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
              {(Object.keys(GALAXY_ASSEMBLY_STAGES) as GalaxyAssemblyStageId[]).map((stKey) => {
                const st = GALAXY_ASSEMBLY_STAGES[stKey];
                const isSelected = activeStageId === stKey;
                return (
                  <button
                    key={stKey}
                    onClick={() => setActiveStageId(stKey)}
                    className={`p-2 rounded-xl text-left border transition-all ${
                      isSelected
                        ? "bg-indigo-500/25 border-indigo-400 text-indigo-200 shadow-md shadow-indigo-500/10 font-bold"
                        : "bg-slate-950/60 border-white/5 text-slate-400 hover:text-white hover:border-white/20"
                    }`}
                  >
                    <div className="text-[10px] font-mono text-slate-500">#{st.order}</div>
                    <div className="text-[11px] truncate">{st.name.split(". ")[1]}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Merger Trajectory Tuner & Physics Indicators (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Collision & Feedback Controls</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  setMergerParams({
                    massRatio: 1.0,
                    gasFraction: 0.35,
                    impactParameterKpc: 25,
                    isPrograde: true,
                    feedbackStrength: 1.0,
                  })
                }
                className="text-[11px] text-slate-400 hover:text-white h-7 px-2"
              >
                <RotateCcw className="size-3 mr-1" /> Reset
              </Button>
            </h3>

            {/* Mass Ratio Selector */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Merger Mass Ratio (q = M₂ / M₁):</span>
                <span className="font-mono text-cyan-300 font-bold">
                  {mergerParams.massRatio === 1.0
                    ? "1 : 1 (Major)"
                    : mergerParams.massRatio === 0.25
                      ? "1 : 4 (Moderate)"
                      : "1 : 10 (Minor)"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[1.0, 0.25, 0.1].map((qVal) => (
                  <button
                    key={qVal}
                    onClick={() => setMergerParams({ ...mergerParams, massRatio: qVal })}
                    className={`py-1.5 px-2 rounded-lg text-xs font-mono border transition-all ${
                      mergerParams.massRatio === qVal
                        ? "bg-cyan-500/25 border-cyan-400 text-cyan-200 font-bold"
                        : "bg-slate-800/60 border-white/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    {qVal === 1.0 ? "1:1 Major" : qVal === 0.25 ? "1:4 Moderate" : "1:10 Minor"}
                  </button>
                ))}
              </div>
            </div>

            {/* Orbit Alignment (Prograde vs Retrograde) */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Orbital Spin Alignment:</span>
                <span className="font-mono text-indigo-300 font-bold">
                  {mergerParams.isPrograde
                    ? "Prograde (Resonant Tails)"
                    : "Retrograde (Suppressed Tails)"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => setMergerParams({ ...mergerParams, isPrograde: true })}
                  className={`py-1.5 px-2 rounded-lg text-xs font-mono border transition-all ${
                    mergerParams.isPrograde
                      ? "bg-indigo-500/25 border-indigo-400 text-indigo-200 font-bold"
                      : "bg-slate-800/60 border-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  Prograde
                </button>
                <button
                  onClick={() => setMergerParams({ ...mergerParams, isPrograde: false })}
                  className={`py-1.5 px-2 rounded-lg text-xs font-mono border transition-all ${
                    !mergerParams.isPrograde
                      ? "bg-indigo-500/25 border-indigo-400 text-indigo-200 font-bold"
                      : "bg-slate-800/60 border-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  Retrograde
                </button>
              </div>
            </div>

            {/* Numerical Physics Indicators */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-black/40 border border-white/10 rounded-xl p-3">
              <div>
                <span className="text-slate-500 block text-[10px]">Kennicutt-Schmidt SFR:</span>
                <span className="text-amber-300 font-bold">
                  {mergerPhysics.totalSfrSolarPerYr.toFixed(1)} M_☉/yr
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Decay Timescale:</span>
                <span className="text-slate-200 font-bold">
                  {mergerPhysics.orbitalDecayTimeMyr.toFixed(0)} Myr
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Tidal Stream Span:</span>
                <span className="text-cyan-300 font-bold">
                  {mergerPhysics.tidalTailLengthKpc} kpc
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Final Morphology:</span>
                <span className="text-purple-300 font-bold truncate block">
                  {mergerPhysics.finalMorphology.split(" (")[0]}
                </span>
              </div>
            </div>

            {/* Stage Description & Governing Process */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="text-xs">
                <span className="font-bold text-slate-300 block mb-0.5">Physical Mechanism:</span>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  {activeStage.description}
                </p>
              </div>

              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-white/5 space-y-1 text-[11px]">
                <div className="text-slate-400">
                  <strong className="text-slate-300">Governing Physics:</strong>{" "}
                  {activeStage.governingPhysicalProcess}
                </div>
                <div className="text-slate-400">
                  <strong className="text-slate-300">Simulation Evidence:</strong>{" "}
                  {activeStage.simulationEvidence}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
