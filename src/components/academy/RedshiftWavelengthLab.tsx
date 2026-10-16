import React, { useState, useRef, useEffect } from "react";
import {
  TrendingUp,
  Activity,
  Sparkles,
  Info,
  Sliders,
  Layers,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface RedshiftWavelengthLabProps {
  onInteract?: () => void;
}

export function RedshiftWavelengthLab({ onInteract }: RedshiftWavelengthLabProps) {
  const waveCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // States
  const [redshiftZ, setRedshiftZ] = useState<number>(1.5); // 0 to 8
  const [selectedRestWavelength, setSelectedRestWavelength] = useState<number>(450); // 450nm (blue visible light)
  const [comparisonMode, setComparisonMode] = useState<
    "cosmological" | "doppler" | "gravitational"
  >("cosmological");
  const [isWavePlaying, setIsWavePlaying] = useState<boolean>(true);

  // Spectral line presets (in nanometers nm)
  const SPECTRAL_LINES = [
    { name: "Hydrogen Lyman-α (UV)", restNm: 121.6, restColor: "#c084fc" },
    { name: "Hydrogen-β (Cyan)", restNm: 486.1, restColor: "#38bdf8" },
    { name: "Hydrogen-α (Deep Red)", restNm: 656.3, restColor: "#ef4444" },
    { name: "Sodium D-lines (Yellow)", restNm: 589.0, restColor: "#fbbf24" },
  ];

  // Observed wavelength: λ_obs = λ_emit * (1 + z)
  const observedWavelengthNm = selectedRestWavelength * (1 + redshiftZ);

  // Color mapping from wavelength in nm
  const getWavelengthColor = (nm: number): { colorHex: string; regimeName: string } => {
    if (nm < 380) return { colorHex: "#c084fc", regimeName: "Ultraviolet (UV)" };
    if (nm < 450) return { colorHex: "#818cf8", regimeName: "Violet" };
    if (nm < 490) return { colorHex: "#38bdf8", regimeName: "Blue" };
    if (nm < 560) return { colorHex: "#4ade80", regimeName: "Green" };
    if (nm < 590) return { colorHex: "#facc15", regimeName: "Yellow" };
    if (nm < 630) return { colorHex: "#fb923c", regimeName: "Orange" };
    if (nm < 750) return { colorHex: "#f43f5e", regimeName: "Red" };
    if (nm < 1500) return { colorHex: "#991b1b", regimeName: "Near-Infrared (NIR)" };
    if (nm < 5000) return { colorHex: "#7f1d1d", regimeName: "Mid-Infrared (MIR)" };
    return { colorHex: "#450a0a", regimeName: "Far-Infrared / Microwave" };
  };

  const restColorInfo = getWavelengthColor(selectedRestWavelength);
  const obsColorInfo = getWavelengthColor(observedWavelengthNm);

  // Animated Wave Canvas showing wave stretching in transit
  useEffect(() => {
    const canvas = waveCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let frame = 0;

    const render = () => {
      frame++;
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Deep space backdrop
      ctx.fillStyle = "#020617";
      ctx.fillRect(0, 0, width, height);

      const emitterX = 65;
      const observerX = width - 65;
      const centerY = height / 2;

      // 1. Draw Emitter Galaxy & Observer Telescope
      // Emitter
      ctx.fillStyle = "#f59e0b";
      ctx.beginPath();
      ctx.arc(emitterX, centerY, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(emitterX, centerY, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 11px sans-serif";
      ctx.fillText("Distant Emitter", emitterX - 35, centerY + 32);

      // Observer
      ctx.fillStyle = "#38bdf8";
      ctx.beginPath();
      ctx.arc(observerX, centerY, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(observerX, centerY, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 11px sans-serif";
      ctx.fillText("Earth Observer", observerX - 35, centerY + 32);

      // 2. Draw the Light Wave Traveling & Stretching
      const totalSpan = observerX - emitterX;
      ctx.lineWidth = 2.5;

      const phaseShift = isWavePlaying ? frame * 0.08 : 0;

      // Draw wave segments with gradient stretching
      for (let x = emitterX + 10; x < observerX - 10; x += 2) {
        const progress = (x - emitterX) / totalSpan; // 0 to 1

        let localWavelength: number;
        let localColor: string;

        if (comparisonMode === "cosmological") {
          // Continuous metric expansion stretching wave in transit
          const currentZ = redshiftZ * progress;
          localWavelength = 18 * (1 + currentZ);
          localColor = getWavelengthColor(selectedRestWavelength * (1 + currentZ)).colorHex;
        } else if (comparisonMode === "doppler") {
          // Doppler shift happens at emission, wavelength remains constant during transit!
          localWavelength = 18 * (1 + redshiftZ);
          localColor = obsColorInfo.colorHex;
        } else {
          // Gravitational redshift
          localWavelength = 18 * (1 + redshiftZ * Math.pow(1 - progress, 0.5));
          localColor = getWavelengthColor(
            selectedRestWavelength * (1 + redshiftZ * progress),
          ).colorHex;
        }

        const waveY = centerY + Math.sin((x / localWavelength) * Math.PI * 2 - phaseShift) * 26;

        ctx.strokeStyle = localColor;
        ctx.beginPath();
        ctx.moveTo(
          x - 2,
          centerY + Math.sin(((x - 2) / localWavelength) * Math.PI * 2 - phaseShift) * 26,
        );
        ctx.lineTo(x, waveY);
        ctx.stroke();
      }

      // 3. Grid tick lines indicating space stretching
      if (comparisonMode === "cosmological") {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 4]);

        const numTicks = 8;
        for (let i = 1; i < numTicks; i++) {
          const tx = emitterX + (totalSpan / numTicks) * i;
          ctx.beginPath();
          ctx.moveTo(tx, centerY - 45);
          ctx.lineTo(tx, centerY + 45);
          ctx.stroke();
        }
        ctx.setLineDash([]);

        ctx.fillStyle = "rgba(148, 163, 184, 0.6)";
        ctx.font = "10px monospace";
        ctx.fillText("← Metric space expanding while photon travels →", width * 0.3, centerY - 52);
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [redshiftZ, selectedRestWavelength, comparisonMode, isWavePlaying, obsColorInfo]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-slate-900/80 p-5 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Light Physics Chamber
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                1 + z = a₀ / a(t)
              </span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <TrendingUp className="size-5 text-cyan-400" />
              Cosmological Redshift & Wave-Stretching Simulator
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Visualize how light wave crests physically stretch as space expands during the
              photon&apos;s multi-billion-year journey from distant galaxies to our telescopes.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Wave Canvas & Parameters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Wave Simulation Viewport (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative rounded-2xl border border-white/10 bg-slate-950 p-3 overflow-hidden shadow-2xl">
            <canvas
              ref={waveCanvasRef}
              width={700}
              height={320}
              className="w-full h-72 sm:h-80 object-contain block"
            />

            {/* Wavelength Color Comparison Meter */}
            <div className="mt-3 p-3 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div
                  className="size-4 rounded-full border border-white/20"
                  style={{ backgroundColor: restColorInfo.colorHex }}
                />
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">
                    Emitted (Rest)
                  </div>
                  <div className="text-xs font-mono font-bold text-white">
                    {selectedRestWavelength.toFixed(1)} nm ({restColorInfo.regimeName})
                  </div>
                </div>
              </div>

              <div className="text-slate-400 font-bold font-mono">
                1 + z = {(1 + redshiftZ).toFixed(2)}x
              </div>

              <div className="flex items-center gap-2.5 text-right">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">
                    Observed (Stretched)
                  </div>
                  <div className="text-xs font-mono font-bold text-cyan-300">
                    {observedWavelengthNm.toFixed(1)} nm ({obsColorInfo.regimeName})
                  </div>
                </div>
                <div
                  className="size-4 rounded-full border border-white/20"
                  style={{ backgroundColor: obsColorInfo.colorHex }}
                />
              </div>
            </div>
          </div>

          {/* Redshift Slider Controls */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-md space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Sliders className="size-3.5 text-cyan-400" />
                Redshift Slider (z):
              </span>
              <span className="font-mono text-cyan-300 font-bold">
                z = {redshiftZ.toFixed(2)} (Wavelength stretched by {(1 + redshiftZ).toFixed(2)}×)
              </span>
            </div>

            <input
              type="range"
              min={0.0}
              max={8.0}
              step={0.05}
              value={redshiftZ}
              onChange={(e) => {
                setRedshiftZ(parseFloat(e.target.value));
                if (onInteract) onInteract();
              }}
              className="w-full accent-cyan-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />

            {/* Quick Redshift Milestones */}
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {[
                { label: "z = 0 (Nearby)", zVal: 0.0 },
                { label: "z = 1.0 (Scale a=0.5)", zVal: 1.0 },
                { label: "z = 2.0 (Cosmic Noon)", zVal: 2.0 },
                { label: "z = 6.0 (First Stars)", zVal: 6.0 },
              ].map((m) => (
                <button
                  key={m.label}
                  onClick={() => {
                    setRedshiftZ(m.zVal);
                    if (onInteract) onInteract();
                  }}
                  className={`px-2 py-1.5 rounded-lg text-[10px] font-medium border text-center transition-all truncate ${
                    Math.abs(redshiftZ - m.zVal) < 0.08
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold"
                      : "bg-slate-950/60 text-slate-400 hover:text-white border-white/5"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Spectral Presets & 3-Way Mechanism Comparison (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Spectral Line Presets */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 backdrop-blur-xl space-y-3">
            <span className="font-bold text-white text-sm flex items-center gap-1.5 border-b border-white/10 pb-2">
              <Sparkles className="size-4 text-cyan-400" />
              Rest Emission Lines (Chemical Fingerprints)
            </span>
            <div className="grid grid-cols-1 gap-2">
              {SPECTRAL_LINES.map((line) => (
                <button
                  key={line.name}
                  onClick={() => {
                    setSelectedRestWavelength(line.restNm);
                    if (onInteract) onInteract();
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between text-xs ${
                    Math.abs(selectedRestWavelength - line.restNm) < 1
                      ? "bg-cyan-500/20 border-cyan-500/50 text-white font-semibold shadow-md shadow-cyan-950/40"
                      : "bg-slate-950/60 border-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="size-3 rounded-full"
                      style={{ backgroundColor: line.restColor }}
                    />
                    <span>{line.name}</span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-300">{line.restNm} nm</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3-Way Mechanism Comparator */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 backdrop-blur-xl space-y-3">
            <span className="font-bold text-white text-sm flex items-center gap-1.5 border-b border-white/10 pb-2">
              <Activity className="size-4 text-amber-400" />
              Three Types of Redshift Compared
            </span>

            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: "cosmological", label: "Cosmological" },
                { id: "doppler", label: "Doppler" },
                { id: "gravitational", label: "Gravitational" },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => {
                    setComparisonMode(mode.id as "cosmological" | "doppler" | "gravitational");
                    if (onInteract) onInteract();
                  }}
                  className={`py-2 px-2 text-center text-xs font-semibold rounded-xl border transition-all ${
                    comparisonMode === mode.id
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm"
                      : "bg-slate-950/60 border-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/10 text-xs leading-relaxed text-slate-300">
              {comparisonMode === "cosmological" && (
                <div>
                  <span className="font-bold text-white block mb-1 text-cyan-300">
                    Cosmological Redshift (1 + z = 1/a):
                  </span>
                  Space itself expands while the photon is in flight. The photon wave crests stretch
                  proportionally to the cosmic scale factor $a(t)$. The galaxy did not have to move
                  through space!
                </div>
              )}
              {comparisonMode === "doppler" && (
                <div>
                  <span className="font-bold text-white block mb-1 text-rose-300">
                    Kinematic Doppler Shift (v / c):
                  </span>
                  Caused by physical motion *through* static space at the moment of emission.
                  Wavelength does not stretch during transit; it was emitted at an altered
                  wavelength due to relative motion.
                </div>
              )}
              {comparisonMode === "gravitational" && (
                <div>
                  <span className="font-bold text-white block mb-1 text-purple-300">
                    Gravitational Redshift (ΔΦ / c²):
                  </span>
                  General relativistic time dilation: a photon loses energy and shifts to longer
                  wavelengths as it climbs upward out of a deep gravitational potential well (like a
                  star or black hole).
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
