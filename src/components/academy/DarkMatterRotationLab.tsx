import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Orbit,
  Eye,
  EyeOff,
  RotateCcw,
  Sparkles,
  Info,
  Sliders,
  Layers,
  LineChart,
  ShieldCheck,
  Disc,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  GALAXY_ROTATION_DATA,
  RotationDataPoint,
} from "@/lib/academy/lessons/module-16-dark-matter-energy";

interface DarkMatterRotationLabProps {
  onInteract?: () => void;
}

interface GalaxyPreset {
  id: string;
  name: string;
  diskMass: number; // in 10^10 M_sun
  haloMass: number; // in 10^10 M_sun
  haloRadius: number; // in kpc
  description: string;
}

const PRESETS: GalaxyPreset[] = [
  {
    id: "milkyway",
    name: "Milky Way Analog",
    diskMass: 6.0,
    haloMass: 85.0,
    haloRadius: 5.5,
    description:
      "Our home galaxy: ~60 billion M☉ in stars/gas, surrounded by ~850 billion M☉ dark halo.",
  },
  {
    id: "ngc3198",
    name: "NGC 3198 (Rubin Classic)",
    diskMass: 4.0,
    haloMass: 65.0,
    haloRadius: 4.8,
    description:
      "The quintessential textbook galaxy studied by Vera Rubin & Kent Ford with exceptionally flat curve.",
  },
  {
    id: "dwarf_dm",
    name: "Dwarf Spheroidal (DM Dominated)",
    diskMass: 0.8,
    haloMass: 45.0,
    haloRadius: 3.2,
    description: "Faint tiny galaxy where dark matter outweighs stars by more than 50 to 1!",
  },
];

export function DarkMatterRotationLab({ onInteract }: DarkMatterRotationLabProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const plotCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // States
  const [hasDarkMatter, setHasDarkMatter] = useState<boolean>(true);
  const [diskMass, setDiskMass] = useState<number>(6.0); // 10^10 M_sun
  const [haloMass, setHaloMass] = useState<number>(85.0); // 10^10 M_sun
  const [haloRadius, setHaloRadius] = useState<number>(5.5); // core radius in kpc
  const [showObservedPoints, setShowObservedPoints] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"velocity" | "mass">("velocity");
  const [selectedPresetId, setSelectedPresetId] = useState<string>("milkyway");
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Particle positions for visual galaxy
  const particles = useMemo(() => {
    const pts = [];
    const count = 380;
    for (let i = 0; i < count; i++) {
      // Exponential disk distribution
      const rFraction = Math.pow(Math.random(), 0.65);
      const rKpc = 0.5 + rFraction * 28.0; // 0.5 to 28.5 kpc
      const initialTheta = Math.random() * Math.PI * 2;
      // Color based on distance (yellowish/white core, cyan/blue spiral arms, faint outer)
      let color = "#fef08a"; // yellow core
      if (rKpc > 3.0 && rKpc < 14.0)
        color = "#93c5fd"; // blue-white disk
      else if (rKpc >= 14.0) color = "#c4b5fd"; // outer faint stars
      pts.push({
        rKpc,
        theta: initialTheta,
        size: Math.random() * 2.2 + 1.2,
        color,
      });
    }
    return pts;
  }, []);

  // Compute rotation curve function: v(r) in km/s
  const calculateVelocities = (rKpc: number) => {
    const G = 4.3009e-6; // kpc * (km/s)^2 / M_sun -> adjusted scaling for 10^10 M_sun: G_scaled ~ 43000
    // Visible component (Freeman exponential disk approximation + central bulge)
    // For small r, v rises; for r > R_disk, v falls as 1/sqrt(r)
    const rDiskScale = 3.2; // kpc
    const y = rKpc / (2 * rDiskScale);
    // Approximate Freeman disk velocity profile:
    const vVisPeak = Math.sqrt(diskMass * 1400); // peak around 2-3 scale lengths
    const vVis = vVisPeak * (Math.sqrt(rKpc) / (rKpc + 2.5)) * 2.8;

    // Dark matter halo component (Pseudo-isothermal sphere with core radius rc)
    // M_halo(r) = 4*pi*rho_0*rc^3 * [r/rc - arctan(r/rc)]
    // v_halo(r) = v_inf * sqrt(1 - (rc/r)*arctan(r/rc))
    let vHalo = 0;
    if (hasDarkMatter && haloMass > 0) {
      const vHaloInf = Math.sqrt(haloMass * 620);
      const x = rKpc / Math.max(0.5, haloRadius);
      const factor = Math.max(0, 1 - (1 / x) * Math.atan(x));
      vHalo = vHaloInf * Math.sqrt(factor);
    }

    const vTotal = Math.sqrt(vVis * vVis + vHalo * vHalo);
    return {
      vVis: Math.round(vVis),
      vHalo: Math.round(vHalo),
      vTotal: Math.round(vTotal),
    };
  };

  // Enclosed mass calculation in 10^10 M_sun
  const calculateEnclosedMass = (rKpc: number) => {
    // Visible mass approaches diskMass exponentially
    const mVis = diskMass * (1 - Math.exp(-rKpc / 3.0) * (1 + rKpc / 3.0));
    // Halo mass grows approximately linearly with r outside core
    let mHalo = 0;
    if (hasDarkMatter && haloMass > 0) {
      const x = rKpc / haloRadius;
      const coreVolumeFactor = (x - Math.atan(x)) / (30 / haloRadius - Math.atan(30 / haloRadius));
      mHalo = haloMass * coreVolumeFactor;
    }
    return {
      mVis: parseFloat(mVis.toFixed(1)),
      mHalo: parseFloat(mHalo.toFixed(1)),
      mTotal: parseFloat((mVis + mHalo).toFixed(1)),
    };
  };

  // Preset selector
  const handleSelectPreset = (preset: GalaxyPreset) => {
    setSelectedPresetId(preset.id);
    setDiskMass(preset.diskMass);
    setHaloMass(preset.haloMass);
    setHaloRadius(preset.haloRadius);
    onInteract?.();
  };

  // Animation frame for rotating galaxy canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const scale = ((Math.min(w, h) / 2) * 0.88) / 30.0; // 30 kpc fits in view

      ctx.fillStyle = "#02040f";
      ctx.fillRect(0, 0, w, h);

      // Draw Dark Matter Halo glow if enabled
      if (hasDarkMatter && haloMass > 0) {
        const haloGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, 28 * scale);
        haloGrad.addColorStop(0, "rgba(99, 102, 241, 0.22)"); // Soft indigo core
        haloGrad.addColorStop(0.4, "rgba(79, 70, 229, 0.12)");
        haloGrad.addColorStop(0.85, "rgba(67, 56, 202, 0.04)");
        haloGrad.addColorStop(1, "rgba(30, 27, 75, 0)");
        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 28 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Label for halo
        ctx.fillStyle = "rgba(165, 180, 252, 0.5)";
        ctx.font = "10px monospace";
        ctx.fillText("DARK MATTER HALO (COSMIC COCOON)", cx - 110, cy - 25 * scale);
      }

      // Draw faint galactic coordinate rings at 10, 20, 30 kpc
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 1;
      [10, 20, 30].forEach((rKpc) => {
        ctx.beginPath();
        ctx.arc(cx, cy, rKpc * scale, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "rgba(148, 163, 184, 0.4)";
        ctx.font = "9px monospace";
        ctx.fillText(`${rKpc} kpc`, cx + rKpc * scale + 4, cy - 4);
      });

      // Galactic Central Bulge Glow
      const bulgeGrad = ctx.createRadialGradient(cx, cy, 1, cx, cy, 4 * scale);
      bulgeGrad.addColorStop(0, "rgba(254, 240, 138, 0.95)");
      bulgeGrad.addColorStop(0.3, "rgba(253, 224, 71, 0.5)");
      bulgeGrad.addColorStop(0.7, "rgba(249, 115, 22, 0.2)");
      bulgeGrad.addColorStop(1, "rgba(249, 115, 22, 0)");
      ctx.fillStyle = bulgeGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 4 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Render and update orbiting stars
      particles.forEach((p) => {
        const vel = calculateVelocities(p.rKpc);
        const v = hasDarkMatter ? vel.vTotal : vel.vVis;
        // Angular velocity omega = v / r (in rad/s, scaled for animation)
        const omega = (v / (p.rKpc * 35)) * (isPaused ? 0 : dt);
        p.theta += omega;

        // Position on 2D projection with slight inclination for 3D perspective
        const x = cx + p.rKpc * scale * Math.cos(p.theta);
        const y = cy + p.rKpc * scale * Math.sin(p.theta) * 0.65; // inclined view

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Outer label indicator
      ctx.fillStyle = "#ffffff";
      ctx.font = "11px sans-serif";
      ctx.fillText(
        hasDarkMatter
          ? "✓ Visible + Dark Matter Halo Active"
          : "⚠ Visible Matter Only (Keplerian Slowdown)",
        14,
        24,
      );

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [hasDarkMatter, diskMass, haloMass, haloRadius, isPaused, particles]);

  // Render static 2D Plot for Velocity or Enclosed Mass
  useEffect(() => {
    const canvas = plotCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const padLeft = 46;
    const padRight = 20;
    const padTop = 24;
    const padBottom = 34;

    const plotW = w - padLeft - padRight;
    const plotH = h - padTop - padBottom;

    // Background grid
    ctx.fillStyle = "#030712";
    ctx.fillRect(0, 0, w, h);

    // Axes
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padLeft, padTop);
    ctx.lineTo(padLeft, padTop + plotH);
    ctx.lineTo(padLeft + plotW, padTop + plotH);
    ctx.stroke();

    // Radial axis grid lines (0 to 30 kpc)
    ctx.fillStyle = "rgba(148, 163, 184, 0.7)";
    ctx.font = "10px monospace";
    for (let r = 0; r <= 30; r += 5) {
      const x = padLeft + (r / 30) * plotW;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
      ctx.beginPath();
      ctx.moveTo(x, padTop);
      ctx.lineTo(x, padTop + plotH);
      ctx.stroke();
      ctx.fillText(`${r}`, x - 4, padTop + plotH + 15);
    }
    ctx.fillText("Radius r (kpc)", padLeft + plotW / 2 - 35, padTop + plotH + 28);

    if (activeTab === "velocity") {
      // Y-axis: 0 to 300 km/s
      const maxV = 280;
      for (let v = 0; v <= maxV; v += 50) {
        const y = padTop + plotH - (v / maxV) * plotH;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
        ctx.beginPath();
        ctx.moveTo(padLeft, y);
        ctx.lineTo(padLeft + plotW, y);
        ctx.stroke();
        ctx.fillText(`${v}`, 10, y + 3);
      }
      ctx.save();
      ctx.translate(14, padTop + plotH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText("v (km/s)", -20, 0);
      ctx.restore();

      // 1. Draw Visible Matter Curve (Orange/Amber)
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let r = 0.5; r <= 30; r += 0.5) {
        const x = padLeft + (r / 30) * plotW;
        const vel = calculateVelocities(r);
        const y = padTop + plotH - (vel.vVis / maxV) * plotH;
        if (r === 0.5) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // 2. Draw Dark Matter Halo Curve (Cyan/Blue dashed)
      if (hasDarkMatter && haloMass > 0) {
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        for (let r = 0.5; r <= 30; r += 0.5) {
          const x = padLeft + (r / 30) * plotW;
          const vel = calculateVelocities(r);
          const y = padTop + plotH - (vel.vHalo / maxV) * plotH;
          if (r === 0.5) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 3. Draw Total Combined Velocity Curve (White/Purple Solid)
      ctx.strokeStyle = hasDarkMatter ? "#c084fc" : "#f59e0b";
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let r = 0.5; r <= 30; r += 0.5) {
        const x = padLeft + (r / 30) * plotW;
        const vel = calculateVelocities(r);
        const v = hasDarkMatter ? vel.vTotal : vel.vVis;
        const y = padTop + plotH - (v / maxV) * plotH;
        if (r === 0.5) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // 4. Draw Vera Rubin Observation Points
      if (showObservedPoints) {
        GALAXY_ROTATION_DATA.forEach((pt) => {
          const x = padLeft + (pt.radiusKpc / 30) * plotW;
          const y = padTop + plotH - (pt.vObs / maxV) * plotH;
          const yErrTop = padTop + plotH - ((pt.vObs + pt.vError) / maxV) * plotH;
          const yErrBot = padTop + plotH - ((pt.vObs - pt.vError) / maxV) * plotH;

          // Error bar
          ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(x, yErrTop);
          ctx.lineTo(x, yErrBot);
          ctx.moveTo(x - 3, yErrTop);
          ctx.lineTo(x + 3, yErrTop);
          ctx.moveTo(x - 3, yErrBot);
          ctx.lineTo(x + 3, yErrBot);
          ctx.stroke();

          // Data point circle
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(x, y, 3.2, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    } else {
      // Y-axis: Enclosed Mass (0 to 100 * 10^10 M_sun)
      const maxM = 100;
      for (let m = 0; m <= maxM; m += 20) {
        const y = padTop + plotH - (m / maxM) * plotH;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
        ctx.beginPath();
        ctx.moveTo(padLeft, y);
        ctx.lineTo(padLeft + plotW, y);
        ctx.stroke();
        ctx.fillText(`${m}`, 10, y + 3);
      }
      ctx.save();
      ctx.translate(14, padTop + plotH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText("M(r) [10¹⁰ M☉]", -35, 0);
      ctx.restore();

      // Visible Enclosed Mass (Amber)
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let r = 0.5; r <= 30; r += 0.5) {
        const x = padLeft + (r / 30) * plotW;
        const mass = calculateEnclosedMass(r);
        const y = padTop + plotH - (mass.mVis / maxM) * plotH;
        if (r === 0.5) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Total Enclosed Mass (Purple)
      ctx.strokeStyle = "#c084fc";
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let r = 0.5; r <= 30; r += 0.5) {
        const x = padLeft + (r / 30) * plotW;
        const mass = calculateEnclosedMass(r);
        const y = padTop + plotH - (mass.mTotal / maxM) * plotH;
        if (r === 0.5) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }, [hasDarkMatter, diskMass, haloMass, haloRadius, activeTab, showObservedPoints]);

  const currentValues = calculateVelocities(8.5); // At Sun's radius ~8.5 kpc
  const currentMasses = calculateEnclosedMass(25.0); // At 25 kpc

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950 p-5 sm:p-7 backdrop-blur-xl shadow-2xl space-y-6">
      {/* Top Header & Presets */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-0.5 rounded-full uppercase">
              Lab A • Dark Matter
            </span>
            <span className="text-xs text-slate-400">Vera Rubin Rotation Curve Bench</span>
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight">
            Galaxy Dynamics & The Invisible Halo
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-0.5">
            Test how unseen matter keeps outer stars in rapid orbit instead of suffering Keplerian
            decline.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelectPreset(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                selectedPresetId === p.id
                  ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30"
                  : "bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Two-Column View: Left Canvas Galaxy, Right Real-time Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: 2D Interactive Rotating Galaxy Canvas */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Disc className="size-3.5 text-indigo-400" />
              <span>Orbits & Dark Matter Halo</span>
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsPaused(!isPaused)}
                className="text-xs h-7 px-2.5 border-white/10"
              >
                {isPaused ? "Play Orbit" : "Pause"}
              </Button>
            </div>
          </div>

          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 bg-[#02040f] shadow-inner">
            <canvas ref={canvasRef} width={500} height={375} className="w-full h-full block" />

            {/* Quick Toggle On Canvas */}
            <div className="absolute top-3 right-3 z-10">
              <Button
                size="sm"
                onClick={() => {
                  setHasDarkMatter(!hasDarkMatter);
                  onInteract?.();
                }}
                className={`text-xs font-bold shadow-lg transition-all ${
                  hasDarkMatter
                    ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                    : "bg-amber-600 hover:bg-amber-500 text-white"
                }`}
              >
                {hasDarkMatter ? (
                  <Eye className="size-3.5 mr-1.5" />
                ) : (
                  <EyeOff className="size-3.5 mr-1.5" />
                )}
                {hasDarkMatter ? "Dark Halo Active" : "Visible Only (No Halo)"}
              </Button>
            </div>

            {/* Speed readout banner */}
            <div className="absolute bottom-3 inset-x-3 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-300">
                At Solar Orbit (8.5 kpc):{" "}
                <strong className="text-purple-300">
                  {hasDarkMatter ? currentValues.vTotal : currentValues.vVis} km/s
                </strong>
              </span>
              <span className="text-amber-300">Visible only: {currentValues.vVis} km/s</span>
            </div>
          </div>
        </div>

        {/* Right: Dynamic Rotation Curve / Mass Profile Graph */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            {/* Tab switch between Velocity Curve and Enclosed Mass */}
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-900 border border-white/10">
              <button
                onClick={() => setActiveTab("velocity")}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                  activeTab === "velocity"
                    ? "bg-indigo-600 text-white font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Velocity Curve v(r)
              </button>
              <button
                onClick={() => setActiveTab("mass")}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                  activeTab === "mass"
                    ? "bg-indigo-600 text-white font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Enclosed Mass M(r)
              </button>
            </div>

            {activeTab === "velocity" && (
              <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showObservedPoints}
                  onChange={(e) => setShowObservedPoints(e.target.checked)}
                  className="rounded border-white/20 text-indigo-600 focus:ring-0"
                />
                <span>Rubin Observed Data</span>
              </label>
            )}
          </div>

          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 bg-[#030712] shadow-inner">
            <canvas ref={plotCanvasRef} width={500} height={375} className="w-full h-full block" />

            {/* Legend Overlay */}
            <div className="absolute top-2.5 right-2.5 bg-slate-950/80 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/10 text-[10px] space-y-1">
              {activeTab === "velocity" ? (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-[#c084fc]" />
                    <span className="text-purple-300">
                      {hasDarkMatter ? "Total Predicted Curve" : "Visible Prediction"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-[#f59e0b]" />
                    <span className="text-amber-400">Keplerian Disk Component</span>
                  </div>
                  {hasDarkMatter && (
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-0.5 border-b border-dashed border-[#38bdf8]" />
                      <span className="text-sky-300">Dark Halo Component</span>
                    </div>
                  )}
                  {showObservedPoints && (
                    <div className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-white" />
                      <span className="text-slate-200">Rubin Observational Points (±1σ)</span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-[#c084fc]" />
                    <span className="text-purple-300">Total Enclosed Mass M(r)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-[#f59e0b]" />
                    <span className="text-amber-400">Visible Stellar Disk M_vis(r)</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Physics Sliders: Modifying Mass Model Consistently Updates Predictions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
        {/* Slider 1: Stellar Disk Mass */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-medium">Visible Stellar Disk Mass:</span>
            <span className="font-mono text-amber-300 font-bold">
              {diskMass.toFixed(1)} × 10¹⁰ M☉
            </span>
          </div>
          <input
            type="range"
            min="0.5"
            max="12.0"
            step="0.5"
            value={diskMass}
            onChange={(e) => {
              setDiskMass(parseFloat(e.target.value));
              onInteract?.();
            }}
            className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg"
          />
          <span className="text-[10px] text-slate-400 block">
            Controls the inner gravitational peak (v ∝ √(M_disk))
          </span>
        </div>

        {/* Slider 2: Dark Halo Mass */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-medium">Dark Matter Halo Mass:</span>
            <span className="font-mono text-purple-300 font-bold">
              {haloMass.toFixed(0)} × 10¹⁰ M☉
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="150"
            step="5"
            disabled={!hasDarkMatter}
            value={hasDarkMatter ? haloMass : 0}
            onChange={(e) => {
              setHaloMass(parseFloat(e.target.value));
              onInteract?.();
            }}
            className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded-lg disabled:opacity-30"
          />
          <span className="text-[10px] text-slate-400 block">
            {hasDarkMatter
              ? "Sets outer asymptotic flat rotation velocity (v_inf)"
              : "Disabled while Dark Matter Halo is off"}
          </span>
        </div>

        {/* Slider 3: Halo Core Scale Radius */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-medium">Halo Core Radius (r_c):</span>
            <span className="font-mono text-sky-300 font-bold">{haloRadius.toFixed(1)} kpc</span>
          </div>
          <input
            type="range"
            min="2.0"
            max="12.0"
            step="0.5"
            disabled={!hasDarkMatter}
            value={haloRadius}
            onChange={(e) => {
              setHaloRadius(parseFloat(e.target.value));
              onInteract?.();
            }}
            className="w-full accent-sky-500 h-1.5 bg-slate-800 rounded-lg disabled:opacity-30"
          />
          <span className="text-[10px] text-slate-400 block">
            Transition radius where dark matter begins to dominate over disk
          </span>
        </div>
      </div>

      {/* Numerical Ratio Comparison Card */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
          <span className="text-[10px] uppercase text-slate-400 block">
            Outer Velocity (25 kpc)
          </span>
          <span className="font-mono text-base font-bold text-white">
            {calculateVelocities(25).vTotal} km/s
          </span>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
          <span className="text-[10px] uppercase text-slate-400 block">
            Keplerian Drop without DM
          </span>
          <span className="font-mono text-base font-bold text-amber-400">
            -
            {Math.round(
              ((calculateVelocities(25).vTotal - calculateVelocities(25).vVis) /
                calculateVelocities(25).vTotal) *
                100,
            )}
            %
          </span>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
          <span className="text-[10px] uppercase text-slate-400 block">
            Visible Mass (r ≤ 25 kpc)
          </span>
          <span className="font-mono text-base font-bold text-amber-300">
            {currentMasses.mVis} × 10¹⁰ M☉
          </span>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
          <span className="text-[10px] uppercase text-slate-400 block">Dark Halo Mass Ratio</span>
          <span className="font-mono text-base font-bold text-purple-300">
            {hasDarkMatter
              ? (currentMasses.mHalo / Math.max(0.1, currentMasses.mVis)).toFixed(1)
              : "0.0"}{" "}
            : 1
          </span>
        </div>
      </div>

      {/* Vera Rubin Memorial Scientific Note */}
      <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 text-xs text-indigo-200 leading-relaxed flex items-start gap-3">
        <Info className="size-4 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-indigo-300 block mb-0.5">
            Key Insight: Why Newton&apos;s Laws Demand Dark Matter
          </strong>
          <span>
            By Newton&apos;s law v = √(G · M(r) / r), if the visible stars and gas were all that
            existed, orbital velocities past 10 kpc would drop like a stone (v ∝ 1/√r). The fact
            that observed velocities remain completely flat out to 30 kpc means M(r) keeps growing
            linearly (M ∝ r). To supply this mass, every galaxy is embedded in a spherical dark
            matter halo 10 times larger and 10 times more massive than the visible disk!
          </span>
        </div>
      </div>
    </div>
  );
}
