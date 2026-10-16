import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Radio,
  Sparkles,
  Info,
  Layers,
  Activity,
  Sliders,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CMBExplorerLabProps {
  onInteract?: () => void;
}

interface AcousticPeak {
  number: number;
  multipole: number;
  label: string;
  physicalMeaning: string;
  cosmologicalParameter: string;
  impactExplanation: string;
}

const ACOUSTIC_PEAKS: AcousticPeak[] = [
  {
    number: 1,
    multipole: 220,
    label: "1st Peak: Spatial Geometry / Curvature",
    physicalMeaning: "Fundamental acoustic mode compression",
    cosmologicalParameter: "Ω_total ≈ 1.000 (Ω_k = 0.0007 ± 0.0019)",
    impactExplanation:
      "The angular scale of this peak (θ ≈ 0.6° or multipole ℓ ≈ 220) proves the spatial geometry of our universe is flat (Euclidean triangles sum to 180° across 46 billion light-years). If space had positive curvature, the peak would shift to smaller ℓ (larger angles).",
  },
  {
    number: 2,
    multipole: 540,
    label: "2nd Peak: Baryon Mass Density (Ordinary Matter)",
    physicalMeaning: "First acoustic rarefaction mode (expansion)",
    cosmologicalParameter: "Ω_b h² = 0.02237 ± 0.00015 (~4.9% atoms)",
    impactExplanation:
      "Measures the exact density of ordinary atoms (baryons). More baryons increase gravitational drag in the plasma, reducing the rebound rarefaction peak height relative to the first compression peak. Matches Big Bang Nucleosynthesis deuterium abundances!",
  },
  {
    number: 3,
    multipole: 800,
    label: "3rd Peak: Cold Dark Matter Density",
    physicalMeaning: "Second acoustic compression mode",
    cosmologicalParameter: "Ω_c h² = 0.1200 ± 0.0012 (~26.8% dark matter)",
    impactExplanation:
      "Dark matter does not feel photon radiation pressure, maintaining gravitational potential wells while baryons oscillate. A taller third peak confirms cold, collisionless dark matter dominates over normal matter by more than 5 to 1.",
  },
];

export function CMBExplorerLab({ onInteract }: CMBExplorerLabProps) {
  const mapCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // States
  const [showDipole, setShowDipole] = useState<boolean>(false);
  const [activePeakIndex, setActivePeakIndex] = useState<number>(0);
  const [baryonDensityMod, setBaryonDensityMod] = useState<number>(1.0); // 0.6 to 1.4 multiplier
  const [darkMatterMod, setDarkMatterMod] = useState<number>(1.0); // 0.6 to 1.4 multiplier

  const activePeak = ACOUSTIC_PEAKS[activePeakIndex];

  // Procedural Mollweide CMB Map Generator
  useEffect(() => {
    const canvas = mapCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    const cx = width / 2;
    const cy = height / 2;
    const a = width * 0.46; // semi-major axis of ellipse
    const b = height * 0.44; // semi-minor axis of ellipse

    // Seeded Perlin-like multi-scale noise
    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        const dx = (px - cx) / a;
        const dy = (py - cy) / b;

        // Check if inside ellipse
        if (dx * dx + dy * dy <= 1.0) {
          const pixelIndex = (py * width + px) * 4;

          let val = 0;
          if (showDipole) {
            // Earth's kinetic Doppler dipole: warm in Leo (+dx), cool in Aquarius (-dx)
            val = dx * 1.8 + Math.sin(px * 0.05) * 0.08;
          } else {
            // Intrinsic primordial temperature fluctuations ΔT/T ~ 10^-5
            const n1 = Math.sin(px * 0.04 + py * 0.02) * Math.cos(px * 0.03 - py * 0.04);
            const n2 = Math.sin(px * 0.08 - py * 0.06) * Math.cos(py * 0.09);
            const n3 = Math.sin(px * 0.16 + py * 0.14) * 0.5;
            val = n1 * 0.6 + n2 * 0.3 + n3 * 0.1;
          }

          // Planck Colormap (Dark Blue -> Cyan -> Green -> Orange -> Crimson)
          // Normalized between -1 and 1
          const norm = Math.max(-1, Math.min(1, val));
          let r = 0,
            g = 0,
            blue = 0;

          if (norm < -0.5) {
            // Deep blue
            r = Math.floor(10 + (norm + 1) * 30);
            g = Math.floor(40 + (norm + 1) * 80);
            blue = Math.floor(160 + (norm + 1) * 90);
          } else if (norm < 0) {
            // Cyan to light blue
            r = Math.floor(20 + (norm + 0.5) * 60);
            g = Math.floor(120 + (norm + 0.5) * 120);
            blue = Math.floor(220 + (norm + 0.5) * 35);
          } else if (norm < 0.5) {
            // Yellow-orange
            r = Math.floor(200 + norm * 100);
            g = Math.floor(140 + norm * 80);
            blue = Math.floor(30 - norm * 40);
          } else {
            // Crimson red
            r = Math.floor(220 + (norm - 0.5) * 70);
            g = Math.floor(40 - (norm - 0.5) * 60);
            blue = Math.floor(30 - (norm - 0.5) * 40);
          }

          data[pixelIndex] = Math.max(0, Math.min(255, r));
          data[pixelIndex + 1] = Math.max(0, Math.min(255, g));
          data[pixelIndex + 2] = Math.max(0, Math.min(255, blue));
          data[pixelIndex + 3] = 255;
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);

    // Draw Mollweide border
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(cx, cy, a, b, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Subtle equatorial and meridian lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - a, cy);
    ctx.lineTo(cx + a, cy);
    ctx.moveTo(cx, cy - b);
    ctx.lineTo(cx, cy + b);
    ctx.stroke();
  }, [showDipole]);

  // Acoustic Power Spectrum Chart Generator (Multipole ℓ vs D_ℓ)
  useEffect(() => {
    const canvas = chartCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const padLeft = 55;
    const padRight = 25;
    const padTop = 25;
    const padBottom = 40;
    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;

    // Grid lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;
    for (let l = 500; l <= 2000; l += 500) {
      const x = padLeft + (l / 2500) * plotW;
      ctx.beginPath();
      ctx.moveTo(x, padTop);
      ctx.lineTo(x, height - padBottom);
      ctx.stroke();

      ctx.fillStyle = "rgba(148, 163, 184, 0.8)";
      ctx.font = "10px monospace";
      ctx.fillText(`ℓ=${l}`, x - 14, height - padBottom + 16);
    }

    // Y axis labels (D_ℓ in μK²)
    for (let yVal = 1000; yVal <= 5000; yVal += 1500) {
      const y = height - padBottom - (yVal / 6000) * plotH;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(width - padRight, y);
      ctx.stroke();

      ctx.fillStyle = "rgba(148, 163, 184, 0.8)";
      ctx.font = "10px monospace";
      ctx.fillText(`${yVal}`, 15, y + 3);
    }

    // Axis titles
    ctx.fillStyle = "#94a3b8";
    ctx.font = "11px sans-serif";
    ctx.fillText(
      "Multipole Moment ℓ (Smaller angular scale →)",
      padLeft + plotW * 0.28,
      height - 10,
    );

    ctx.save();
    ctx.translate(14, padTop + plotH * 0.6);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("D_ℓ = ℓ(ℓ+1)C_ℓ / 2π (μK²)", 0, 0);
    ctx.restore();

    // Theoretical curve calculation
    // Peak 1 at ℓ=220 (~5700 μK²), Peak 2 at ℓ=540 (~2500 μK²), Peak 3 at ℓ=800 (~2500 μK²), damped
    const points: { x: number; y: number; l: number }[] = [];

    const p1Height = 5700;
    const p2Height = 2500 * (2.0 - baryonDensityMod); // Baryon increase suppresses peak 2
    const p3Height = 2500 * darkMatterMod; // Dark matter increase boosts peak 3

    for (let l = 2; l <= 2400; l += 8) {
      const x = padLeft + (l / 2500) * plotW;

      // Mathematical representation of acoustic peaks + Silk damping
      const peak1 = p1Height * Math.exp(-Math.pow((l - 220) / 120, 2));
      const peak2 = p2Height * Math.exp(-Math.pow((l - 540) / 130, 2));
      const peak3 = p3Height * Math.exp(-Math.pow((l - 800) / 140, 2));
      const peak4 = 1200 * Math.exp(-Math.pow((l - 1100) / 150, 2));
      const silkDamping = Math.exp(-Math.pow(l / 1400, 1.4));
      const plateau = 900 / (1 + l / 150);

      const dL = (peak1 + peak2 + peak3 + peak4 + plateau) * silkDamping;
      const y = height - padBottom - (dL / 6000) * plotH;
      points.push({ x, y, l });
    }

    // Draw Curve
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    points.forEach((pt, i) => {
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.stroke();

    // Draw active peak marker
    const selectedPeak = ACOUSTIC_PEAKS[activePeakIndex];
    const markerPt = points.find((p) => Math.abs(p.l - selectedPeak.multipole) < 12);
    if (markerPt) {
      ctx.fillStyle = "#f43f5e";
      ctx.beginPath();
      ctx.arc(markerPt.x, markerPt.y, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Vertical guide line
      ctx.strokeStyle = "rgba(244, 63, 94, 0.4)";
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(markerPt.x, padTop);
      ctx.lineTo(markerPt.x, height - padBottom);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [activePeakIndex, baryonDensityMod, darkMatterMod]);

  const handleSelectPeak = (idx: number) => {
    setActivePeakIndex(idx);
    if (onInteract) onInteract();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-slate-900/80 p-5 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Precision Cosmology Lab
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                Planck Satellite Data (2018)
              </span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Radio className="size-5 text-cyan-400" />
              Cosmic Microwave Background (CMB) Explorer
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Decode the baby photo of the cosmos taken at 380,000 years after the Big Bang. Explore
              all-sky temperature ripples and the acoustic sound horizon power spectrum.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowDipole(!showDipole);
                if (onInteract) onInteract();
              }}
              className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border-cyan-500/40 text-xs font-semibold"
            >
              {showDipole
                ? "Subtract Doppler Dipole (Primordial)"
                : "Show Raw Doppler Dipole (+3.36 mK)"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Grid: All-Sky Map + Power Spectrum */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: All-Sky Mollweide Projection (6 cols) */}
        <div className="lg:col-span-6 rounded-2xl border border-white/10 bg-slate-900/80 p-5 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-sm flex items-center gap-1.5">
              <Sparkles className="size-4 text-cyan-400" />
              All-Sky Temperature Map (Mollweide Projection)
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {showDipole ? "Earth Motion Rest-Frame" : "ΔT/T ≈ 10⁻⁵ (18 μK ripples)"}
            </span>
          </div>

          {/* Canvas Map */}
          <div className="relative rounded-xl border border-white/10 bg-slate-950 p-2 overflow-hidden flex justify-center">
            <canvas
              ref={mapCanvasRef}
              width={520}
              height={290}
              className="w-full h-auto max-w-lg object-contain block"
            />
          </div>

          {/* Color Scale Bar */}
          <div className="space-y-1.5">
            <div className="h-3 w-full rounded-full bg-gradient-to-r from-blue-700 via-cyan-400 via-amber-300 to-rose-600 border border-white/10" />
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>-300 μK (Underdense)</span>
              <span>2.7255 K Average</span>
              <span>+300 μK (Overdense seeds)</span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {showDipole
              ? "With the dipole shown, our solar system's 369 km/s motion relative to the CMB blueshifts light in the direction of Leo (+3.36 mK) and redshifts light in Aquarius (-3.36 mK)."
              : "Subtracting the kinematic dipole reveals the pristine primordial sound waves frozen into space when atoms first formed 13.8 billion years ago."}
          </p>
        </div>

        {/* Right: Acoustic Power Spectrum Chart (6 cols) */}
        <div className="lg:col-span-6 rounded-2xl border border-white/10 bg-slate-900/80 p-5 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-sm flex items-center gap-1.5">
              <Activity className="size-4 text-rose-400" />
              Angular Power Spectrum (Acoustic Peaks)
            </span>
            <span className="text-[11px] font-mono text-cyan-400">Sound Horizon r_s ≈ 147 Mpc</span>
          </div>

          {/* Canvas Chart */}
          <div className="relative rounded-xl border border-white/10 bg-slate-950 p-2 overflow-hidden">
            <canvas
              ref={chartCanvasRef}
              width={520}
              height={290}
              className="w-full h-auto max-w-lg object-contain block"
            />
          </div>

          {/* Peak Selector Buttons */}
          <div className="grid grid-cols-3 gap-2">
            {ACOUSTIC_PEAKS.map((pk, idx) => (
              <button
                key={pk.number}
                onClick={() => handleSelectPeak(idx)}
                className={`p-2.5 rounded-xl text-left border transition-all ${
                  activePeakIndex === idx
                    ? "bg-rose-500/20 border-rose-500/50 text-white shadow-md shadow-rose-950/40"
                    : "bg-slate-950/50 border-white/5 text-slate-400 hover:text-white hover:bg-slate-950"
                }`}
              >
                <div className="text-[10px] uppercase font-bold text-rose-400">
                  Peak {pk.number} (ℓ ≈ {pk.multipole})
                </div>
                <div className="text-xs font-semibold truncate text-slate-200 mt-0.5">
                  {pk.number === 1 ? "Flat Space" : pk.number === 2 ? "Baryon Mass" : "Dark Matter"}
                </div>
              </button>
            ))}
          </div>

          {/* Active Peak Scientific Interpretation */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/10 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">{activePeak.label}</span>
              <span className="font-mono text-cyan-300 font-semibold text-[11px]">
                {activePeak.cosmologicalParameter}
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              {activePeak.impactExplanation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
