import React, { useState, useRef, useEffect } from "react";
import {
  Orbit,
  TrendingUp,
  Sparkles,
  Info,
  Layers,
  Activity,
  RotateCcw,
  CheckCircle2,
  Atom,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface GalaxyEvolutionCompareLabProps {
  onInteract?: () => void;
}

interface GalaxyEraComparison {
  id: string;
  eraName: string;
  lookbackTime: string;
  redshiftZ: string;
  typicalMorphology: string;
  starFormationRate: string;
  metallicityZ: string;
  telescopeProof: string;
  visualType: "clumpy_proto" | "cosmic_noon_merger" | "mature_spiral";
  description: string;
}

const COMPARISONS: GalaxyEraComparison[] = [
  {
    id: "primordial_jwst",
    eraName: "Early Cosmic Dawn (JWST Era)",
    lookbackTime: "13.4 – 13.5 Billion Years Ago",
    redshiftZ: "z ≈ 10 – 14.3",
    typicalMorphology: "Tiny, irregular, clumpy proto-galaxies (size < 1,000 light-years)",
    starFormationRate: "Fierce concentrated blue starbursts in compact cores",
    metallicityZ: "< 1% Solar (< 0.01 Z_⊙), mostly pure H and He with trace C & O",
    telescopeProof: "JWST NIRCam/NIRSpec deep fields (e.g. JADES-GS-z14-0, GN-z11)",
    visualType: "clumpy_proto",
    description:
      "Tiny unorganized fragments assembling for the first time. Gravitational turbulence drives intense starbursts with virtually no dust extinction.",
  },
  {
    id: "cosmic_noon",
    eraName: "Cosmic Noon (Peak Activity)",
    lookbackTime: "10.0 – 11.5 Billion Years Ago",
    redshiftZ: "z ≈ 1.5 – 2.5",
    typicalMorphology: "Violent mergers, tidal tails, thick turbulent gas disks",
    starFormationRate: "Cosmic Maximum (~10x higher than today's global average)",
    metallicityZ: "~20% to 50% Solar (0.2 – 0.5 Z_⊙), rapid enrichment",
    telescopeProof: "Hubble Ultra Deep Field, ALMA submillimeter dust surveys, Chandra X-ray",
    visualType: "cosmic_noon_merger",
    description:
      "The most frantic era in cosmological history. Frantic gas infall and galaxy cannibalism fuel active galactic nuclei (AGN) and giant luminous quasars.",
  },
  {
    id: "modern_universe",
    eraName: "Modern Universe (Mature Era)",
    lookbackTime: "Present Day (0 – 2 Billion Years Ago)",
    redshiftZ: "z ≈ 0 – 0.2",
    typicalMorphology: "Orderly Hubble Sequence: Thin Grand-Design Spirals & Giant Ellipticals",
    starFormationRate: "Quenched, gentle star formation (~1-2 M_⊙ / yr in Milky Way)",
    metallicityZ: "100% – 200% Solar (1.0 – 2.0 Z_⊙), rich in iron, carbon, gold",
    telescopeProof: "SDSS Redshift Survey, Gaia astrometric satellite, local observatories",
    visualType: "mature_spiral",
    description:
      "Quiet, organized disks with defined spiral arms, dark dust lanes, and peaceful planetary systems orbiting stable long-lived stars.",
  },
];

export function GalaxyEvolutionCompareLab({ onInteract }: GalaxyEvolutionCompareLabProps) {
  const chartCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const visualCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [activeEraIndex, setActiveEraIndex] = useState<number>(0);
  const activeEra = COMPARISONS[activeEraIndex];

  // Draw Madau-Dickinson Star Formation Rate vs Lookback Time Chart
  useEffect(() => {
    const canvas = chartCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const padLeft = 55;
    const padRight = 20;
    const padTop = 25;
    const padBottom = 40;
    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;

    // Grid lines for lookback time (0 to 13.8 Gyr)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;
    for (let t = 2; t <= 12; t += 2) {
      const x = padLeft + ((13.8 - t) / 13.8) * plotW;
      ctx.beginPath();
      ctx.moveTo(x, padTop);
      ctx.lineTo(x, height - padBottom);
      ctx.stroke();

      ctx.fillStyle = "rgba(148, 163, 184, 0.8)";
      ctx.font = "10px monospace";
      ctx.fillText(`${t} Gyr`, x - 14, height - padBottom + 16);
    }

    // Y Axis labels (ρ_SFR in M_sun / yr / Mpc^3)
    for (let sfr = 0.02; sfr <= 0.12; sfr += 0.03) {
      const y = height - padBottom - (sfr / 0.14) * plotH;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(width - padRight, y);
      ctx.stroke();

      ctx.fillStyle = "rgba(148, 163, 184, 0.8)";
      ctx.font = "10px monospace";
      ctx.fillText(sfr.toFixed(2), 15, y + 3);
    }

    // Axis titles
    ctx.fillStyle = "#94a3b8";
    ctx.font = "11px sans-serif";
    ctx.fillText(
      "Cosmic Lookback Time (Gyr ago) ← Present Day",
      padLeft + plotW * 0.15,
      height - 10,
    );

    ctx.save();
    ctx.translate(14, padTop + plotH * 0.7);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("Star Formation Rate Density (M_⊙/yr/Mpc³)", 0, 0);
    ctx.restore();

    // Madau & Dickinson curve
    // Peak at z ~ 1.9 (lookback ~ 10.5 Gyr)
    const points: { x: number; y: number; tGyr: number }[] = [];
    for (let t = 0; t <= 13.4; t += 0.2) {
      // Lookback time t in Gyr
      // approximate redshift z from lookback time
      const z = Math.pow(13.8 / (13.8 - t), 1.4) - 1;
      const term1 = Math.pow(1 + z, 2.7);
      const term2 = 1 + Math.pow((1 + z) / 2.9, 5.6);
      const psi = 0.015 * (term1 / term2); // M_sun / yr / Mpc^3

      const x = padLeft + (t / 13.8) * plotW;
      const y = height - padBottom - (Math.min(0.14, psi) / 0.14) * plotH;
      points.push({ x, y, tGyr: t });
    }

    // Draw curve
    ctx.strokeStyle = "#ec4899";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    points.forEach((pt, i) => {
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.stroke();

    // Shaded area under curve
    ctx.fillStyle = "rgba(236, 72, 153, 0.15)";
    ctx.lineTo(padLeft + plotW, height - padBottom);
    ctx.lineTo(padLeft, height - padBottom);
    ctx.closePath();
    ctx.fill();

    // Highlight Peak (Cosmic Noon)
    const peakPt = points.find((p) => p.tGyr >= 10.4 && p.tGyr <= 10.8);
    if (peakPt) {
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.arc(peakPt.x, peakPt.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 11px sans-serif";
      ctx.fillText("Cosmic Noon Peak", peakPt.x - 45, peakPt.y - 12);
    }
  }, []);

  // Visual Galaxy Simulation based on active era
  useEffect(() => {
    const canvas = visualCanvasRef.current;
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

      ctx.clearRect(0, 0, width, height);

      // Deep space background
      ctx.fillStyle = "#030712";
      ctx.fillRect(0, 0, width, height);

      if (activeEra.visualType === "clumpy_proto") {
        // Clumpy, irregular blue-white JWST proto-galaxy
        const clumps = [
          { dx: -25, dy: -15, r: 24, c: "#38bdf8" },
          { dx: 30, dy: 10, r: 20, c: "#818cf8" },
          { dx: 0, dy: 30, r: 18, c: "#67e8f9" },
          { dx: -45, dy: 20, r: 14, c: "#93c5fd" },
        ];

        clumps.forEach((clump) => {
          const px = cx + clump.dx + Math.sin(frame * 0.02 + clump.r) * 4;
          const py = cy + clump.dy + Math.cos(frame * 0.02 + clump.r) * 4;
          const grad = ctx.createRadialGradient(px, py, 2, px, py, clump.r * 1.8);
          grad.addColorStop(0, "rgba(255, 255, 255, 0.9)");
          grad.addColorStop(0.3, clump.c);
          grad.addColorStop(1, "rgba(2, 6, 23, 0)");
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(px, py, clump.r * 1.8, 0, Math.PI * 2);
          ctx.fill();
        });

        // Ionized gas filaments linking clumps
        ctx.strokeStyle = "rgba(56, 189, 248, 0.3)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - 25, cy - 15);
        ctx.lineTo(cx + 30, cy + 10);
        ctx.lineTo(cx, cy + 30);
        ctx.lineTo(cx - 45, cy + 20);
        ctx.closePath();
        ctx.stroke();
      } else if (activeEra.visualType === "cosmic_noon_merger") {
        // Two colliding galaxies with tidal tails and central quasar
        const angle = frame * 0.015;

        // Galaxy 1
        const g1x = cx - 40 * Math.cos(angle);
        const g1y = cy - 25 * Math.sin(angle);
        const grad1 = ctx.createRadialGradient(g1x, g1y, 4, g1x, g1y, 70);
        grad1.addColorStop(0, "rgba(254, 240, 138, 0.9)");
        grad1.addColorStop(0.4, "rgba(236, 72, 153, 0.6)");
        grad1.addColorStop(1, "rgba(2, 6, 23, 0)");
        ctx.fillStyle = grad1;
        ctx.beginPath();
        ctx.arc(g1x, g1y, 70, 0, Math.PI * 2);
        ctx.fill();

        // Galaxy 2
        const g2x = cx + 40 * Math.cos(angle);
        const g2y = cy + 25 * Math.sin(angle);
        const grad2 = ctx.createRadialGradient(g2x, g2y, 4, g2x, g2y, 60);
        grad2.addColorStop(0, "rgba(147, 197, 253, 0.9)");
        grad2.addColorStop(0.4, "rgba(168, 85, 247, 0.6)");
        grad2.addColorStop(1, "rgba(2, 6, 23, 0)");
        ctx.fillStyle = grad2;
        ctx.beginPath();
        ctx.arc(g2x, g2y, 60, 0, Math.PI * 2);
        ctx.fill();

        // Active Quasar Jet
        ctx.strokeStyle = "rgba(251, 191, 36, 0.85)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx - 100, cy - 90);
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + 100, cy + 90);
        ctx.stroke();
      } else {
        // Mature Grand-Design Spiral Galaxy
        const rot = frame * 0.008;

        // Central bulge
        const bg = ctx.createRadialGradient(cx, cy, 2, cx, cy, 35);
        bg.addColorStop(0, "rgba(254, 240, 138, 0.95)");
        bg.addColorStop(0.6, "rgba(249, 115, 22, 0.6)");
        bg.addColorStop(1, "rgba(2, 6, 23, 0)");
        ctx.fillStyle = bg;
        ctx.beginPath();
        ctx.arc(cx, cy, 35, 0, Math.PI * 2);
        ctx.fill();

        // Spiral arms
        for (let arm = 0; arm < 2; arm++) {
          const armOffset = arm * Math.PI;
          ctx.strokeStyle = arm === 0 ? "rgba(147, 197, 253, 0.7)" : "rgba(196, 181, 253, 0.7)";
          ctx.lineWidth = 3;
          ctx.beginPath();
          for (let theta = 0.5; theta < 3.8; theta += 0.1) {
            const r = 20 * Math.exp(0.35 * theta);
            const currentAngle = theta + rot + armOffset;
            const px = cx + Math.cos(currentAngle) * r;
            const py = cy + Math.sin(currentAngle) * (r * 0.55); // tilted disk
            if (theta === 0.5) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.stroke();
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [activeEra]);

  const handleSelectEra = (idx: number) => {
    setActiveEraIndex(idx);
    if (onInteract) onInteract();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900/80 p-5 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Observational Astrophysics
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-pink-500/15 text-pink-300 border border-pink-500/30">
                Madau-Dickinson History
              </span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Orbit className="size-5 text-purple-400" />
              Galaxy Population & Evolution Comparator
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Compare primordial JWST proto-galaxies, chaotic Cosmic Noon mergers, and mature modern
              spirals. Watch how star formation rates and heavy element metallicity transformed
              across cosmic time.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Galaxy Era Viewer (6 cols) */}
        <div className="lg:col-span-6 rounded-2xl border border-white/10 bg-slate-900/80 p-5 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-sm flex items-center gap-1.5">
              <Sparkles className="size-4 text-purple-400" />
              Morphology & Structure Reconstruction
            </span>
            <span className="text-[11px] font-mono text-purple-300 font-bold">
              {activeEra.redshiftZ}
            </span>
          </div>

          {/* Visual Canvas */}
          <div className="relative rounded-xl border border-white/10 bg-slate-950 p-2 overflow-hidden flex justify-center">
            <canvas
              ref={visualCanvasRef}
              width={520}
              height={280}
              className="w-full h-auto max-w-lg object-contain block"
            />
          </div>

          {/* Era Selection Tabs */}
          <div className="grid grid-cols-3 gap-2">
            {COMPARISONS.map((comp, idx) => (
              <button
                key={comp.id}
                onClick={() => handleSelectEra(idx)}
                className={`p-2.5 rounded-xl text-left border transition-all ${
                  activeEraIndex === idx
                    ? "bg-purple-500/20 border-purple-500/50 text-white shadow-md shadow-purple-950/40"
                    : "bg-slate-950/50 border-white/5 text-slate-400 hover:text-white hover:bg-slate-950"
                }`}
              >
                <div className="text-[10px] font-bold uppercase text-purple-400">
                  {idx === 0 ? "Cosmic Dawn" : idx === 1 ? "Cosmic Noon" : "Modern Era"}
                </div>
                <div className="text-xs font-semibold truncate text-slate-200 mt-0.5">
                  {comp.eraName.split(" ")[0]}
                </div>
              </button>
            ))}
          </div>

          {/* Details Card */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/10 text-xs space-y-2">
            <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
              <span className="font-bold text-white">{activeEra.eraName}</span>
              <span className="font-mono text-slate-400 text-[11px]">{activeEra.lookbackTime}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400 block">Typical Morphology:</span>
                <span className="text-slate-200 font-medium">{activeEra.typicalMorphology}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Heavy Elements (Z):</span>
                <span className="text-cyan-300 font-mono font-medium">
                  {activeEra.metallicityZ}
                </span>
              </div>
            </div>
            <div className="pt-1 text-[11px] text-slate-400">
              <span className="font-semibold text-slate-300">Empirical Proof:</span>{" "}
              {activeEra.telescopeProof}
            </div>
          </div>
        </div>

        {/* Right: Madau-Dickinson Star Formation Rate History (6 cols) */}
        <div className="lg:col-span-6 rounded-2xl border border-white/10 bg-slate-900/80 p-5 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-sm flex items-center gap-1.5">
              <TrendingUp className="size-4 text-pink-400" />
              Cosmic Star Formation History (Madau & Dickinson)
            </span>
            <span className="text-[11px] font-mono text-amber-400 font-bold">
              Peak at z ≈ 1.9 (10.5 Gyr ago)
            </span>
          </div>

          {/* Chart Canvas */}
          <div className="relative rounded-xl border border-white/10 bg-slate-950 p-2 overflow-hidden">
            <canvas
              ref={chartCanvasRef}
              width={520}
              height={280}
              className="w-full h-auto max-w-lg object-contain block"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/10 text-xs space-y-2">
            <div className="font-bold text-white flex items-center gap-1.5">
              <Activity className="size-3.5 text-pink-400" />
              Astrophysical Interpretation:
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              The universe peaked in its stellar fertility when it was only ~3 billion years old.
              Today, galaxies have largely consumed their cold molecular gas reservoirs, and star
              formation has dropped to less than 10% of its historic peak.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
