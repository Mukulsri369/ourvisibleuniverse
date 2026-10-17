import React, { useState, useMemo, useRef, useEffect } from "react";
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
  Compass,
  ArrowRight,
  TrendingDown,
  ChevronRight,
  ShieldCheck,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  calculateStarFormationPhysics,
  calculateCollapseProfile,
  YSO_STAGES,
  type YSOClass,
  type MolecularCloudParams,
} from "@/lib/astronomy/astrophysics-lab/star-formation-engine";

interface StarFormationLabProps {
  initialTargetName?: string;
  onLaunchObservedComparison?: (objectName: string) => void;
}

export function StarFormationLab({
  initialTargetName = "Orion Molecular Cloud (OMC-1)",
  onLaunchObservedComparison,
}: StarFormationLabProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Cloud parameter state
  const [params, setParams] = useState<MolecularCloudParams>({
    temperatureK: 12,
    densityCm3: 15000,
    cloudMassSolar: 120,
    magneticFieldMicroGauss: 25,
    turbulenceKmS: 1.2,
  });

  const [activeYsoClass, setActiveYsoClass] = useState<YSOClass>("class_0");
  const [showOutflows, setShowOutflows] = useState<boolean>(true);
  const [particleDensitySetting, setParticleDensitySetting] = useState<"low" | "medium" | "high">("medium");

  const physics = useMemo(() => calculateStarFormationPhysics(params), [params]);
  const activeYso = YSO_STAGES[activeYsoClass];

  // Particle simulation for cold cloud & protostellar collapse
  const particles = useMemo(() => {
    const count = particleDensitySetting === "low" ? 140 : particleDensitySetting === "medium" ? 280 : 420;
    const pts = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 10 + Math.random() * 220;
      pts.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        r: radius,
        angle,
        speed: 0.2 + Math.random() * 0.8,
        size: 1 + Math.random() * 2.5,
        opacity: 0.3 + Math.random() * 0.7,
      });
    }
    return pts;
  }, [particleDensitySetting]);

  // Canvas visual rendering
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

      // 1. Ambient cloud background glow
      const cloudGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, width * 0.45);
      if (activeYsoClass === "prestellar_core") {
        cloudGrad.addColorStop(0, "rgba(30, 58, 138, 0.45)");
        cloudGrad.addColorStop(0.6, "rgba(15, 23, 42, 0.6)");
        cloudGrad.addColorStop(1, "rgba(3, 7, 18, 1)");
      } else if (activeYsoClass === "class_0" || activeYsoClass === "class_I") {
        cloudGrad.addColorStop(0, "rgba(245, 158, 11, 0.35)");
        cloudGrad.addColorStop(0.4, "rgba(220, 38, 38, 0.25)");
        cloudGrad.addColorStop(0.8, "rgba(30, 27, 75, 0.5)");
        cloudGrad.addColorStop(1, "rgba(3, 7, 18, 1)");
      } else {
        cloudGrad.addColorStop(0, "rgba(254, 240, 138, 0.4)");
        cloudGrad.addColorStop(0.3, "rgba(249, 115, 22, 0.2)");
        cloudGrad.addColorStop(0.7, "rgba(15, 23, 42, 0.7)");
        cloudGrad.addColorStop(1, "rgba(3, 7, 18, 1)");
      }
      ctx.fillStyle = cloudGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Infalling Gas Particles (Inside-Out Collapse)
      particles.forEach((p, idx) => {
        // Shu inside-out collapse velocity field
        const infallSpeed = physics.willCollapse ? 0.6 : 0.05;
        p.r -= p.speed * infallSpeed;
        p.angle += 0.008 * (150 / Math.max(20, p.r)); // Conservation of angular momentum

        if (p.r < 12) {
          p.r = 200 + Math.random() * 40;
          p.angle = Math.random() * Math.PI * 2;
        }

        const px = cx + Math.cos(p.angle) * p.r;
        const py = cy + Math.sin(p.angle) * p.r * (activeYsoClass === "class_II" ? 0.35 : 0.85);

        ctx.fillStyle =
          activeYsoClass === "class_III"
            ? "rgba(254, 215, 170, 0.8)"
            : activeYsoClass === "prestellar_core"
              ? "rgba(147, 197, 253, 0.6)"
              : "rgba(251, 146, 60, 0.75)";
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Protoplanetary Accretion Disk (Class 0, I, II)
      if (activeYsoClass === "class_0" || activeYsoClass === "class_I" || activeYsoClass === "class_II") {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(1, 0.35); // Disk inclination

        const diskRadius = activeYsoClass === "class_II" ? 140 : 90;
        const diskGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, diskRadius);
        diskGrad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
        diskGrad.addColorStop(0.3, "rgba(251, 146, 60, 0.7)");
        diskGrad.addColorStop(0.8, "rgba(180, 83, 9, 0.3)");
        diskGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = diskGrad;
        ctx.beginPath();
        ctx.arc(0, 0, diskRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 4. Collimated Bipolar Outflows (Herbig-Haro Jets)
      if (
        showOutflows &&
        (activeYsoClass === "class_0" || activeYsoClass === "class_I" || activeYsoClass === "class_II")
      ) {
        const jetHeight = activeYsoClass === "class_0" ? 190 : activeYsoClass === "class_I" ? 160 : 80;
        const jetWidth = activeYsoClass === "class_0" ? 14 : 20;

        // North and South jet cones
        for (const dir of [-1, 1]) {
          const jGrad = ctx.createLinearGradient(cx, cy, cx, cy + dir * jetHeight);
          jGrad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
          jGrad.addColorStop(0.4, "rgba(56, 189, 248, 0.75)");
          jGrad.addColorStop(0.8, "rgba(14, 165, 233, 0.25)");
          jGrad.addColorStop(1, "rgba(3, 7, 18, 0)");

          ctx.fillStyle = jGrad;
          ctx.beginPath();
          ctx.moveTo(cx - 3, cy);
          ctx.lineTo(cx + 3, cy);
          ctx.lineTo(cx + jetWidth, cy + dir * jetHeight);
          ctx.lineTo(cx - jetWidth, cy + dir * jetHeight);
          ctx.closePath();
          ctx.fill();

          // Shock knots (Herbig-Haro bow shocks)
          const knotY = cy + dir * (jetHeight * 0.75 + Math.sin(frame * 0.05) * 8);
          ctx.strokeStyle = "rgba(125, 211, 252, 0.85)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(cx, knotY, 18, dir > 0 ? 0 : Math.PI, dir > 0 ? Math.PI : 0);
          ctx.stroke();
        }
      }

      // 5. Central Protostellar Core
      const coreRadius = activeYsoClass === "class_III" ? 10 : 7;
      const coreGrad = ctx.createRadialGradient(cx, cy, 1, cx, cy, coreRadius * 2.5);
      coreGrad.addColorStop(0, "#ffffff");
      coreGrad.addColorStop(0.4, activeYso.hydrogenFusionIgnited ? "#fbbf24" : "#f97316");
      coreGrad.addColorStop(1, "rgba(249, 115, 22, 0)");

      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, coreRadius * 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Fusion ignition corona flash
      if (activeYso.hydrogenFusionIgnited) {
        ctx.strokeStyle = "rgba(254, 240, 138, 0.5)";
        ctx.lineWidth = 1.5;
        const coronaR = 24 + Math.sin(frame * 0.08) * 4;
        ctx.beginPath();
        ctx.arc(cx, cy, coronaR, 0, Math.PI * 2);
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [activeYsoClass, physics, showOutflows, particles, activeYso.hydrogenFusionIgnited]);

  return (
    <div className="space-y-6">
      {/* 1. Header & Observational Object Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-white/10 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-amber-500/20 text-amber-400 font-mono text-[11px] font-bold uppercase tracking-wider px-2">
              Module 1: Star Formation
            </span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                activeYso.statusBadge === "OBSERVATION"
                  ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                  : "bg-blue-500/20 border-blue-500/40 text-blue-300"
              }`}
            >
              [{activeYso.statusBadge}]
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Gravitational Collapse & Protostellar Accretion
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Physics-informed inside-out collapse from cold molecular Bok globules to Zero-Age Main Sequence ignition.
          </p>
        </div>

        {/* Observed Target Attribution Disclaimer */}
        <div className="text-right text-xs">
          <span className="text-slate-400 block font-mono text-[11px]">Investigating Prototype:</span>
          <span className="text-cyan-300 font-bold">{initialTargetName}</span>
          <p className="text-[10px] text-slate-500 max-w-xs mt-0.5">
            *Demonstrates a scientifically plausible physical process based on published models, not an exact recording of this object's past.
          </p>
        </div>
      </div>

      {/* 2. Visual Canvas & Parameter Sliders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: 2D/3D Physical Velocity Field Simulation (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black">
            <canvas
              ref={canvasRef}
              width={800}
              height={450}
              className="w-full h-full object-cover block"
            />

            {/* Overlaid Status Indicators */}
            <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/15 text-white">
                {activeYso.astronomicalClass}
              </span>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/15 text-amber-300">
                T_c ≈ {activeYso.centralTemperatureK.toLocaleString()} K
              </span>
            </div>

            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <button
                onClick={() => setShowOutflows((prev) => !prev)}
                className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border backdrop-blur-md transition-colors ${
                  showOutflows
                    ? "bg-cyan-500/30 border-cyan-400 text-cyan-200"
                    : "bg-black/80 border-white/15 text-slate-400"
                }`}
              >
                {showOutflows ? "Jets: Visible" : "Jets: Hidden"}
              </button>
            </div>
          </div>

          {/* YSO Evolutionary Stage Stepper */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300">YSO Evolutionary Progression:</span>
              <span className="text-cyan-400 font-mono text-[11px]">{activeYso.typicalAgeYears}</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {(Object.keys(YSO_STAGES) as YSOClass[]).map((yKey) => {
                const stage = YSO_STAGES[yKey];
                const isSelected = activeYsoClass === yKey;
                return (
                  <button
                    key={yKey}
                    onClick={() => setActiveYsoClass(yKey)}
                    className={`p-2 rounded-xl text-left border transition-all ${
                      isSelected
                        ? "bg-amber-500/20 border-amber-400 text-amber-200 shadow-md shadow-amber-500/10 font-bold"
                        : "bg-slate-950/60 border-white/5 text-slate-400 hover:text-white hover:border-white/20"
                    }`}
                  >
                    <div className="text-[10px] font-mono text-slate-500">Stage {stage.order}</div>
                    <div className="text-[11px] truncate">{stage.name.split(". ")[1]}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Physics Sliders & Diagnostic Equations (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Molecular Cloud Collapse Parameters</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  setParams({
                    temperatureK: 12,
                    densityCm3: 15000,
                    cloudMassSolar: 120,
                    magneticFieldMicroGauss: 25,
                    turbulenceKmS: 1.2,
                  })
                }
                className="text-[11px] text-slate-400 hover:text-white h-7 px-2"
              >
                <RotateCcw className="size-3 mr-1" /> Reset
              </Button>
            </h3>

            {/* Slider 1: Temperature */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <Snowflake className="size-3.5 text-cyan-400" /> Temperature:
                </span>
                <span className="font-mono text-cyan-300 font-bold">{params.temperatureK} K</span>
              </div>
              <input
                type="range"
                min={5}
                max={50}
                value={params.temperatureK}
                onChange={(e) => setParams({ ...params, temperatureK: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Slider 2: Gas Density */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <Atom className="size-3.5 text-indigo-400" /> Density (n_H2):
                </span>
                <span className="font-mono text-indigo-300 font-bold">
                  {params.densityCm3.toLocaleString()} cm⁻³
                </span>
              </div>
              <input
                type="range"
                min={500}
                max={100000}
                step={500}
                value={params.densityCm3}
                onChange={(e) => setParams({ ...params, densityCm3: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
              />
            </div>

            {/* Slider 3: Cloud Mass */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <Flame className="size-3.5 text-amber-400" /> Cloud Mass:
                </span>
                <span className="font-mono text-amber-300 font-bold">{params.cloudMassSolar} M_☉</span>
              </div>
              <input
                type="range"
                min={10}
                max={1000}
                step={10}
                value={params.cloudMassSolar}
                onChange={(e) => setParams({ ...params, cloudMassSolar: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>

            {/* Numerical Physics Indicators Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-black/40 border border-white/10 rounded-xl p-3">
              <div>
                <span className="text-slate-500 block text-[10px]">Jeans Mass (M_J):</span>
                <span className="text-slate-200 font-bold">{physics.jeansMassSolar.toFixed(1)} M_☉</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Bonnor-Ebert (M_BE):</span>
                <span className="text-slate-200 font-bold">{physics.bonnorEbertMassSolar.toFixed(1)} M_☉</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Free-Fall Time (t_ff):</span>
                <span className="text-amber-300 font-bold">
                  {(physics.freeFallTimeYears / 1000).toFixed(0)} kyr
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Jeans Radius (λ_J):</span>
                <span className="text-cyan-300 font-bold">{physics.jeansLengthLy.toFixed(2)} ly</span>
              </div>
            </div>

            {/* Instability Verdict */}
            <div
              className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs ${
                physics.willCollapse
                  ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-300"
                  : "bg-rose-950/30 border-rose-500/40 text-rose-300"
              }`}
            >
              {physics.willCollapse ? (
                <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertTriangle className="size-4 shrink-0 text-rose-400" />
              )}
              <span>
                {physics.willCollapse
                  ? "Gravitationally Unstable: Cloud will collapse into stars (M_cloud > M_J & M_cloud > M_Φ)."
                  : "Gravitationally Stable: Thermal pressure & magnetic fields halt collapse."}
              </span>
            </div>

            {/* Diagnostic Observables for Active Stage */}
            <div className="pt-2 border-t border-white/10 space-y-1.5 text-xs">
              <span className="font-bold text-slate-300 block">Observational Diagnostics:</span>
              <ul className="list-disc pl-4 space-y-1 text-slate-400 text-[11px]">
                {activeYso.observationalDiagnostics.map((diag, idx) => (
                  <li key={idx}>{diag}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
