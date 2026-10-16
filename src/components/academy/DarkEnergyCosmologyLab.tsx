import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Compass,
  Clock,
  Sparkles,
  Info,
  Maximize2,
  Minimize2,
  TrendingUp,
  RotateCcw,
  Zap,
  Play,
  Pause,
  Layers,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  COSMOLOGICAL_MODELS,
  CosmologicalModel,
} from "@/lib/academy/lessons/module-16-dark-matter-energy";

interface DarkEnergyCosmologyLabProps {
  onInteract?: () => void;
}

export function DarkEnergyCosmologyLab({ onInteract }: DarkEnergyCosmologyLabProps) {
  const gridCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const plotCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // States
  const [selectedModelId, setSelectedModelId] = useState<string>("lcdm");
  const [cosmicTimeGyr, setCosmicTimeGyr] = useState<number>(13.8); // Present day
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [compareAllModels, setCompareAllModels] = useState<boolean>(true);

  const activeModel =
    COSMOLOGICAL_MODELS.find((m) => m.id === selectedModelId) || COSMOLOGICAL_MODELS[0];

  // Mathematical Scale Factor a(t) for different cosmologies
  // Given t in Gyr (0 to 30), normalized so a(13.8) = 1.0 for LCDM
  const calculateScaleFactor = (model: CosmologicalModel, tGyr: number): number => {
    if (tGyr <= 0) return 0.001;

    switch (model.id) {
      case "lcdm": {
        // Analytical solution for flat matter + Lambda universe:
        // a(t) = [sinh(3/2 * H_Lambda * t) / sinh(3/2 * H_Lambda * 13.8)]^(2/3)
        // With H_Lambda ~ 0.057 Gyr^-1
        const H_L = 0.057;
        const numerator = Math.sinh(1.5 * H_L * tGyr);
        const denominator = Math.sinh(1.5 * H_L * 13.8);
        return Math.max(0.001, Math.pow(numerator / denominator, 2 / 3));
      }
      case "matter_only": {
        // a(t) = (t / 13.8)^(2/3) (Einstein-de Sitter)
        return Math.max(0.001, Math.pow(tGyr / 13.8, 2 / 3));
      }
      case "closed_crunch": {
        // Cycloid universe: expands to a_max, then recollapses to Big Crunch around t = 22 Gyr
        const tCrunch = 22.0;
        if (tGyr >= tCrunch) return 0.001;
        const theta = (tGyr / tCrunch) * Math.PI * 2;
        // Normalized cycloid a(theta) = A * (1 - cos(theta))
        const aVal = 1.65 * (1 - Math.cos(theta)) * 0.5;
        return Math.max(0.001, aVal);
      }
      case "empty_coasting": {
        // Milne universe: a(t) = t / 13.8
        return Math.max(0.001, tGyr / 13.8);
      }
      case "phantom_rip": {
        // Big rip at t = 26 Gyr: a(t) diverges to infinity
        const tRip = 26.0;
        if (tGyr >= tRip) return 10.0;
        const ratio = (tRip - 13.8) / (tRip - tGyr);
        return Math.max(0.001, Math.pow(ratio, 1.8));
      }
      default:
        return Math.max(0.001, tGyr / 13.8);
    }
  };

  const currentScaleFactor = calculateScaleFactor(activeModel, cosmicTimeGyr);
  const currentRedshift = currentScaleFactor > 0 ? (1 / currentScaleFactor - 1).toFixed(2) : "∞";

  // Deceleration parameter q = Omega_m / (2 * a^3) - Omega_Lambda
  const calculateDeceleration = (model: CosmologicalModel, a: number) => {
    if (a <= 0.05) return 10.0;
    const q = model.omegaM / (2 * Math.pow(a, 3)) - model.omegaLambda;
    return parseFloat(q.toFixed(2));
  };

  const currentQ = calculateDeceleration(activeModel, currentScaleFactor);

  // Play animation through cosmic time
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCosmicTimeGyr((prev) => {
        if (prev >= 28.0) {
          setIsPlaying(false);
          return 28.0;
        }
        return parseFloat((prev + 0.15).toFixed(2));
      });
    }, 40);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Canvas 1: Expanding Universe Grid Simulation
  useEffect(() => {
    const canvas = gridCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;

    ctx.fillStyle = "#02040f";
    ctx.fillRect(0, 0, w, h);

    // Grid spacing scales with currentScaleFactor
    // Base spacing at a=1 is 48px
    const spacing = 48 * Math.max(0.12, Math.min(currentScaleFactor, 3.8));

    // Draw coordinate metric grid lines expanding from center
    ctx.strokeStyle = "rgba(129, 140, 248, 0.18)";
    ctx.lineWidth = 1;

    // Vertical lines
    for (let x = cx % spacing; x < w; x += spacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    // Horizontal lines
    for (let y = cy % spacing; y < h; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Fixed comoving grid galaxy nodes
    const gridSize = 7;
    for (let i = -gridSize; i <= gridSize; i++) {
      for (let j = -gridSize; j <= gridSize; j++) {
        const x = cx + i * spacing;
        const y = cy + j * spacing;
        if (x < -20 || x > w + 20 || y < -20 || y > h + 20) continue;

        const isCenter = i === 0 && j === 0;

        // Galaxy icon / disk
        if (isCenter) {
          // Milky Way Observer Node
          ctx.fillStyle = "#38bdf8";
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 9px monospace";
          ctx.fillText("MILKY WAY (OBSERVER)", x + 8, y - 6);
        } else {
          // Distant Galaxies
          const dist = Math.sqrt(i * i + j * j);
          // Receding speed vectors
          const arrowLen = Math.min(24, dist * spacing * 0.08);
          const angle = Math.atan2(j, i);

          // Galaxy dot
          ctx.fillStyle = activeModel.color;
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fill();

          // Receding velocity vector
          ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + Math.cos(angle) * arrowLen, y + Math.sin(angle) * arrowLen);
          ctx.stroke();
        }
      }
    }

    // Legend on canvas
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.font = "10px sans-serif";
    ctx.fillText(
      `Metric Grid Stretch: a(t) = ${currentScaleFactor.toFixed(3)}x • ${
        currentQ < 0 ? "Accelerating (q < 0)" : "Decelerating (q > 0)"
      }`,
      14,
      22,
    );
  }, [currentScaleFactor, currentQ, activeModel]);

  // Canvas 2: Scale Factor vs Cosmic Time Plot a(t)
  useEffect(() => {
    const canvas = plotCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const padLeft = 44;
    const padRight = 20;
    const padTop = 20;
    const padBottom = 34;

    const plotW = w - padLeft - padRight;
    const plotH = h - padTop - padBottom;

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

    // X-axis: Cosmic Time (0 to 30 Gyr)
    const maxT = 30.0;
    ctx.fillStyle = "rgba(148, 163, 184, 0.7)";
    ctx.font = "10px monospace";
    for (let t = 0; t <= maxT; t += 5) {
      const x = padLeft + (t / maxT) * plotW;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
      ctx.beginPath();
      ctx.moveTo(x, padTop);
      ctx.lineTo(x, padTop + plotH);
      ctx.stroke();
      ctx.fillText(`${t}`, x - 4, padTop + plotH + 15);
    }
    ctx.fillText("Cosmic Time t (Billion Years)", padLeft + plotW / 2 - 70, padTop + plotH + 28);

    // Y-axis: Scale Factor a(t) (0 to 3.0)
    const maxA = 2.8;
    for (let a = 0; a <= maxA; a += 0.5) {
      const y = padTop + plotH - (a / maxA) * plotH;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(padLeft + plotW, y);
      ctx.stroke();
      ctx.fillText(a.toFixed(1), 10, y + 3);
    }
    ctx.save();
    ctx.translate(14, padTop + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("Scale Factor a(t)", -45, 0);
    ctx.restore();

    // Present Day Vertical Line at t = 13.8 Gyr, a = 1.0
    const xToday = padLeft + (13.8 / maxT) * plotW;
    const yToday = padTop + plotH - (1.0 / maxA) * plotH;

    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(xToday, padTop);
    ctx.lineTo(xToday, padTop + plotH);
    ctx.moveTo(padLeft, yToday);
    ctx.lineTo(padLeft + plotW, yToday);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(xToday, yToday, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillText("TODAY (t=13.8, a=1)", xToday + 6, yToday - 8);

    // Transition epoch mark (~8.5 Gyr, inflection point for LCDM)
    const xTrans = padLeft + (8.5 / maxT) * plotW;
    ctx.strokeStyle = "rgba(129, 140, 248, 0.4)";
    ctx.beginPath();
    ctx.arc(xTrans, padTop + plotH - (0.6 / maxA) * plotH, 3, 0, Math.PI * 2);
    ctx.stroke();

    // Plot curves for all models or active model
    const modelsToPlot = compareAllModels ? COSMOLOGICAL_MODELS : [activeModel];

    modelsToPlot.forEach((m) => {
      ctx.strokeStyle = m.color;
      ctx.lineWidth = m.id === selectedModelId ? 3.2 : 1.4;
      ctx.beginPath();

      let started = false;
      for (let t = 0.1; t <= maxT; t += 0.2) {
        const x = padLeft + (t / maxT) * plotW;
        const aVal = calculateScaleFactor(m, t);
        if (aVal > maxA * 1.2) break; // Don't overflow plot
        const y = padTop + plotH - (aVal / maxA) * plotH;

        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    });

    // Scrubber position dot
    const xScrub = padLeft + (cosmicTimeGyr / maxT) * plotW;
    const yScrub = padTop + plotH - (currentScaleFactor / maxA) * plotH;

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.fillStyle = activeModel.color;
    ctx.beginPath();
    ctx.arc(xScrub, yScrub, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }, [selectedModelId, cosmicTimeGyr, compareAllModels, activeModel, currentScaleFactor]);

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950 p-5 sm:p-7 backdrop-blur-xl shadow-2xl space-y-6">
      {/* Top Header & Model Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-violet-400 bg-violet-500/10 border border-violet-500/30 px-2.5 py-0.5 rounded-full uppercase">
              Lab B • Dark Energy
            </span>
            <span className="text-xs text-slate-400">Friedmann Expansion Laboratory</span>
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight">
            The Expanding Universe & Cosmic Destiny
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-0.5">
            Compare cosmological histories with varying matter and dark-energy fractions to observe
            accelerated expansion.
          </p>
        </div>

        {/* Model Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {COSMOLOGICAL_MODELS.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                setSelectedModelId(m.id);
                onInteract?.();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                selectedModelId === m.id
                  ? "bg-violet-600 text-white font-bold shadow-md shadow-violet-600/30"
                  : "bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              {m.shortLabel}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Left Metric Expansion Grid, Right Scale Factor Plot */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Expanding Space Canvas */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Compass className="size-3.5 text-violet-400" />
              <span>Cosmic Metric Grid Stretch Simulation</span>
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsPlaying(!isPlaying)}
                className="text-xs h-7 px-2.5 border-white/10"
              >
                {isPlaying ? <Pause className="size-3 mr-1" /> : <Play className="size-3 mr-1" />}
                {isPlaying ? "Pause Timeline" : "Play Timeline"}
              </Button>
            </div>
          </div>

          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 bg-[#02040f] shadow-inner">
            <canvas ref={gridCanvasRef} width={500} height={375} className="w-full h-full block" />

            {/* Quick status overlays */}
            <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs">
              <span className="text-slate-400 block text-[10px] uppercase">Active Cosmology:</span>
              <span className="font-bold text-white flex items-center gap-1.5">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: activeModel.color }}
                />
                {activeModel.name}
              </span>
            </div>

            <div className="absolute bottom-3 inset-x-3 bg-slate-950/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
              <span className="text-slate-300">
                Time: <strong className="text-cyan-300">{cosmicTimeGyr.toFixed(1)} Gyr</strong>
              </span>
              <span className="text-slate-300">
                Scale a(t):{" "}
                <strong className="text-violet-300">{currentScaleFactor.toFixed(3)}x</strong>
              </span>
              <span className="text-slate-300">
                Deceleration q:{" "}
                <strong className={currentQ < 0 ? "text-emerald-400" : "text-amber-400"}>
                  {currentQ} ({currentQ < 0 ? "Accelerating" : "Decelerating"})
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* Right: a(t) vs Cosmic Time Graph */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <TrendingUp className="size-3.5 text-violet-400" />
              <span>Scale Factor a(t) vs Cosmic Time (Gyr)</span>
            </span>

            <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={compareAllModels}
                onChange={(e) => setCompareAllModels(e.target.checked)}
                className="rounded border-white/20 text-violet-600 focus:ring-0"
              />
              <span>Compare All 5 Models</span>
            </label>
          </div>

          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 bg-[#030712] shadow-inner">
            <canvas ref={plotCanvasRef} width={500} height={375} className="w-full h-full block" />

            {/* Model Legend */}
            <div className="absolute top-2.5 right-2.5 bg-slate-950/80 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/10 text-[9px] space-y-1">
              {COSMOLOGICAL_MODELS.map((m) => (
                <div key={m.id} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5" style={{ backgroundColor: m.color }} />
                  <span
                    className={m.id === selectedModelId ? "font-bold text-white" : "text-slate-400"}
                  >
                    {m.shortLabel}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Cosmic Time Slider Bar */}
      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-violet-400" />
            <span className="text-white font-semibold">Interactive Cosmic Time Scrubber:</span>
            <span className="font-mono text-cyan-300 font-bold">
              {cosmicTimeGyr.toFixed(1)} Billion Years
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCosmicTimeGyr(0.5)}
              className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-300 hover:bg-violet-600 hover:text-white"
            >
              Early Cosmos (0.5 Gyr)
            </button>
            <button
              onClick={() => setCosmicTimeGyr(8.5)}
              className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-300 hover:bg-violet-600 hover:text-white"
            >
              Inflection Point (8.5 Gyr)
            </button>
            <button
              onClick={() => setCosmicTimeGyr(13.8)}
              className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-300 hover:bg-violet-600 hover:text-white"
            >
              Today (13.8 Gyr)
            </button>
            <button
              onClick={() => setCosmicTimeGyr(25.0)}
              className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-300 hover:bg-violet-600 hover:text-white"
            >
              Future (25 Gyr)
            </button>
          </div>
        </div>

        <input
          type="range"
          min="0.2"
          max="28.0"
          step="0.1"
          value={cosmicTimeGyr}
          onChange={(e) => {
            setCosmicTimeGyr(parseFloat(e.target.value));
            onInteract?.();
          }}
          className="w-full accent-violet-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
        />

        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
          <span>Big Bang (0 Gyr)</span>
          <span>Matter-Dominated Deceleration</span>
          <span>Dark Energy Takes Over (~8.5 Gyr)</span>
          <span>Today (13.8 Gyr)</span>
          <span>Deep Future (28 Gyr)</span>
        </div>
      </div>

      {/* Model Specs Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-950/80 border border-white/5 text-xs">
        <div>
          <span className="text-slate-400 block text-[10px] uppercase">Matter Fraction (Ω_m)</span>
          <span className="font-mono text-amber-300 text-sm font-bold">
            {(activeModel.omegaM * 100).toFixed(1)}%
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px] uppercase">
            Dark Energy Fraction (Ω_Λ)
          </span>
          <span className="font-mono text-violet-300 text-sm font-bold">
            {(activeModel.omegaLambda * 100).toFixed(1)}%
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px] uppercase">
            Equation of State (w = p / ρc²)
          </span>
          <span className="font-mono text-sky-300 text-sm font-bold">
            {activeModel.w.toFixed(2)}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px] uppercase">Ultimate Cosmic Fate</span>
          <span className="font-mono text-white text-sm font-bold">{activeModel.fate}</span>
        </div>
      </div>

      {/* Essential Conceptual Separation Notice */}
      <div className="p-4 rounded-2xl border border-rose-500/30 bg-rose-950/20 text-xs text-rose-200 leading-relaxed flex items-start gap-3">
        <ShieldAlert className="size-5 text-rose-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-rose-300 block mb-0.5">
            CRITICAL DISTINCTION: Dark Matter vs Dark Energy Are NOT the Same Substance!
          </strong>
          <span>
            Although both share the word &quot;dark&quot; because they are invisible to optical
            telescopes, they perform opposite cosmic roles. <strong>Dark Matter</strong> is
            attractive, clumping matter (~27%) that forms gravitational wells and holds galaxies and
            clusters together. <strong>Dark Energy</strong> is a smooth, repulsive property of
            spacetime (~68%) with negative pressure (p = -ρc²) that accelerates cosmic expansion
            across gigaparsec scales.
          </span>
        </div>
      </div>
    </div>
  );
}
