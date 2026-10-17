import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Sparkles,
  Sliders,
  RotateCcw,
  AlertTriangle,
  Info,
  CheckCircle2,
  Atom,
  Flame,
  Layers,
  ChevronRight,
  TrendingUp,
  HelpCircle,
  ShieldCheck,
  Play,
  Pause,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  STELLAR_EVOLUTION_GRID,
  getStellarEvolutionInterpolation,
  type StellarEvolutionTrackGrid,
  type HRPoint,
  type StellarRemnantType,
} from "@/lib/astronomy/astrophysics-lab/stellar-evolution-engine";

interface StellarEvolutionLabProps {
  initialMassSolar?: number;
  initialTargetStarName?: string;
}

export function StellarEvolutionLab({
  initialMassSolar = 1.0,
  initialTargetStarName = "The Sun (Sol)",
}: StellarEvolutionLabProps) {
  const hrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [massSolar, setMassSolar] = useState<number>(initialMassSolar);
  const [metallicityZ, setMetallicityZ] = useState<number>(0.014); // Solar Z = 0.014
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const stellarModel = useMemo(
    () => getStellarEvolutionInterpolation(massSolar, metallicityZ),
    [massSolar, metallicityZ]
  );

  const track = stellarModel.track;
  const currentPoint: HRPoint = track.points[currentStepIndex] || track.points[0];

  // Autoplay through stellar lifetime
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev >= track.points.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 3200);

    return () => clearInterval(interval);
  }, [isPlaying, track.points.length]);

  // Keep step index valid if track changes
  useEffect(() => {
    if (currentStepIndex >= track.points.length) {
      setCurrentStepIndex(track.points.length - 1);
    }
  }, [track.points.length, currentStepIndex]);

  // Render Interactive Hertzsprung-Russell (H-R) Diagram
  useEffect(() => {
    const canvas = hrCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const padLeft = 60;
    const padRight = 30;
    const padTop = 30;
    const padBottom = 45;
    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;

    // Background gradient for H-R diagram
    ctx.fillStyle = "#030712";
    ctx.fillRect(0, 0, width, height);

    // Coordinate Mappings:
    // log(T_eff): 4.7 (left, 50,000 K) down to 3.4 (right, 2,500 K)
    const logTMax = 4.7;
    const logTMin = 3.4;
    const tToX = (logT: number) => {
      const frac = (logTMax - logT) / (logTMax - logTMin);
      return padLeft + Math.max(0, Math.min(1, frac)) * plotW;
    };

    // log(L / L_sun): -4 (bottom) to +6 (top)
    const logLMin = -4.0;
    const logLMax = 6.0;
    const lToY = (logL: number) => {
      const frac = (logLMax - logL) / (logLMax - logLMin);
      return padTop + Math.max(0, Math.min(1, frac)) * plotH;
    };

    // Grid lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;

    for (let l = -4; l <= 6; l += 2) {
      const y = lToY(l);
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(width - padRight, y);
      ctx.stroke();

      ctx.fillStyle = "rgba(148, 163, 184, 0.6)";
      ctx.font = "10px monospace";
      ctx.textAlign = "right";
      ctx.fillText(`10^${l}`, padLeft - 8, y + 3);
    }

    const tTicks = [4.6, 4.3, 4.0, 3.7, 3.4];
    const tLabels = ["40k", "20k", "10k", "5k", "2.5k"];
    tTicks.forEach((t, i) => {
      const x = tToX(t);
      ctx.beginPath();
      ctx.moveTo(x, padTop);
      ctx.lineTo(x, height - padBottom);
      ctx.stroke();

      ctx.fillStyle = "rgba(148, 163, 184, 0.6)";
      ctx.font = "10px monospace";
      ctx.textAlign = "center";
      ctx.fillText(`${tLabels[i]} K`, x, height - padBottom + 15);
    });

    // Main Sequence Band Guide (faint diagonal)
    ctx.strokeStyle = "rgba(56, 189, 248, 0.15)";
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(tToX(4.55), lToY(4.8));
    ctx.lineTo(tToX(3.5), lToY(-2.5));
    ctx.stroke();

    ctx.fillStyle = "rgba(56, 189, 248, 0.3)";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Main Sequence", tToX(3.9), lToY(0.7) + 20);

    // Draw Complete Evolutionary Track
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    track.points.forEach((pt, idx) => {
      const x = tToX(pt.logTeff);
      const y = lToY(pt.logL);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw Points on Track
    track.points.forEach((pt, idx) => {
      const x = tToX(pt.logTeff);
      const y = lToY(pt.logL);
      const isCurrent = idx === currentStepIndex;

      ctx.fillStyle = isCurrent ? "#ffffff" : idx < currentStepIndex ? "#10b981" : "#f59e0b";
      ctx.beginPath();
      ctx.arc(x, y, isCurrent ? 6.5 : 3.5, 0, Math.PI * 2);
      ctx.fill();

      if (isCurrent) {
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 11, 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    // Axis Labels
    ctx.fillStyle = "rgba(226, 232, 240, 0.85)";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Effective Surface Temperature T_eff [K] (Decreasing →)", padLeft + plotW / 2, height - 10);

    ctx.save();
    ctx.translate(16, padTop + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("Luminosity log(L / L_☉) →", 0, 0);
    ctx.restore();
  }, [track, currentStepIndex]);

  return (
    <div className="space-y-6">
      {/* 1. Header & Object Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-white/10 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-purple-500/20 text-purple-400 font-mono text-[11px] font-bold uppercase tracking-wider px-2">
              Module 2: Stellar Evolution
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border bg-blue-500/20 border-blue-500/40 text-blue-300">
              [MODEL: MIST / PARSEC Grids]
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Hertzsprung–Russell Evolutionary Tracks & Fates
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Published stellar models across masses (0.2 – 40 M_☉) tracking core nucleosynthesis and compact remnants.
          </p>
        </div>

        {/* Observed Target Disclaimer */}
        <div className="text-right text-xs">
          <span className="text-slate-400 block font-mono text-[11px]">Prototype Reference:</span>
          <span className="text-purple-300 font-bold">{initialTargetStarName}</span>
          <p className="text-[10px] text-slate-500 max-w-xs mt-0.5">
            *Simulates a published stellar evolution grid matching initial parameters, not an exact historical recording.
          </p>
        </div>
      </div>

      {/* 2. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Interactive H-R Diagram Canvas (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black">
            <canvas ref={hrCanvasRef} width={800} height={450} className="w-full h-full object-cover block" />

            {/* Overlaid Live State */}
            <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/15 text-cyan-300">
                T_eff = {Math.round(Math.pow(10, currentPoint.logTeff)).toLocaleString()} K
              </span>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/15 text-amber-300">
                L = {Math.pow(10, currentPoint.logL).toFixed(1)} L_☉
              </span>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/15 text-purple-300">
                R = {currentPoint.radiusSolar.toFixed(1)} R_☉
              </span>
            </div>
          </div>

          {/* Step Navigation Controls */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsPlaying((p) => !p)}
                className="bg-purple-500/20 border-purple-500/40 text-purple-300 hover:bg-purple-500/30 text-xs"
              >
                {isPlaying ? <Pause className="size-3.5 mr-1.5" /> : <Play className="size-3.5 mr-1.5" />}
                {isPlaying ? "Pause Evolution" : "Play Evolution"}
              </Button>

              <div className="flex items-center gap-1.5">
                {track.points.map((pt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentStepIndex(idx)}
                    className={`text-xs px-2.5 py-1 rounded-lg font-mono border transition-all ${
                      currentStepIndex === idx
                        ? "bg-purple-500 border-purple-400 text-slate-950 font-bold"
                        : "bg-slate-800 border-white/10 text-slate-400 hover:text-white"
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Stage Description Card */}
            <div className="bg-black/50 border border-white/10 rounded-xl p-3.5 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-amber-400" />
                  {currentPoint.stageName}
                </span>
                <span className="text-slate-400 font-mono text-[11px]">Age: {currentPoint.ageGyr} Gyr</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{currentPoint.description}</p>
              <div className="text-[11px] font-mono text-purple-300 pt-1">
                Core: {currentPoint.coreComposition} (T_center ≈{" "}
                {(currentPoint.centralTemperatureK / 1e6).toFixed(1)}M K)
              </div>
            </div>
          </div>
        </div>

        {/* Right: Initial Parameters & Model Uncertainties (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-white">Stellar Model Parameters</h3>

            {/* Mass Selection Buttons */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Initial Zero-Age Mass:</span>
                <span className="font-mono text-amber-300 font-bold">{massSolar} M_☉</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[0.2, 1.0, 5.0, 15.0, 40.0].map((mVal) => (
                  <button
                    key={mVal}
                    onClick={() => {
                      setMassSolar(mVal);
                      setCurrentStepIndex(1);
                    }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-mono border transition-all ${
                      massSolar === mVal
                        ? "bg-amber-500/25 border-amber-400 text-amber-200 font-bold"
                        : "bg-slate-800/60 border-white/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    {mVal} M_☉
                  </button>
                ))}
              </div>
            </div>

            {/* Metallicity Selection */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Metallicity Z:</span>
                <span className="font-mono text-cyan-300 font-bold">
                  {metallicityZ === 0.014 ? "Z_☉ (0.014 Solar)" : `${metallicityZ}`}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[0.0001, 0.001, 0.014].map((zVal) => (
                  <button
                    key={zVal}
                    onClick={() => setMetallicityZ(zVal)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-mono border transition-all ${
                      metallicityZ === zVal
                        ? "bg-cyan-500/25 border-cyan-400 text-cyan-200 font-bold"
                        : "bg-slate-800/60 border-white/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    {zVal === 0.014 ? "Solar" : zVal < 0.001 ? "Pop III/II" : "Metal-Poor"}
                  </button>
                ))}
              </div>
            </div>

            {/* Stellar Fate & Remnant Card */}
            <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-purple-200">
                <span>Predicted Ultimate Fate:</span>
                <span className="font-mono text-amber-300 uppercase">
                  {track.remnantType.replace(/_/g, " ")}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300">
                <div>
                  <span className="text-slate-500 block">Total Lifetime:</span>
                  <span>{track.lifetimeTotalGyr} Gyr</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Remnant Mass:</span>
                  <span>{track.remnantMassSolar} M_☉</span>
                </div>
              </div>
            </div>

            {/* Model Uncertainties Section */}
            <div className="pt-2 border-t border-white/10 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <AlertTriangle className="size-3.5" />
                <span>Astrophysical Model Uncertainties:</span>
              </div>
              <ul className="text-[11px] text-slate-400 space-y-1.5 pl-4 list-disc">
                <li>
                  <strong className="text-slate-300">Convective Overshoot:</strong>{" "}
                  {track.modelUncertainties.overshootingUncertainty}
                </li>
                <li>
                  <strong className="text-slate-300">Mass-Loss Prescription:</strong>{" "}
                  {track.modelUncertainties.massLossPrescription}
                </li>
                <li>
                  <strong className="text-slate-300">Nuclear Reaction Rates:</strong>{" "}
                  {track.modelUncertainties.nuclearRateUncertainty}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
