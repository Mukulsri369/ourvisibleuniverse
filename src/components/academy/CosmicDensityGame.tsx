import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Compass,
  Target,
  Award,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Info,
  Eye,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SurveyGalaxy {
  x: number;
  y: number;
  brightness: number;
}

interface TargetRegion {
  id: string;
  name: string;
  type: "cluster" | "void";
  cx: number;
  cy: number;
  radius: number;
  expectedDensity: string;
  found: boolean;
}

export function CosmicDensityGame({ onComplete }: { onComplete?: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>(
    "Click on the survey slice to detect high-density galaxy clusters and cosmic voids!",
  );
  const [feedbackType, setFeedbackType] = useState<"info" | "success" | "warning">("info");
  const [lastMeasuredDensity, setLastMeasuredDensity] = useState<string | null>(null);

  // Targets to discover
  const [targets, setTargets] = useState<TargetRegion[]>([
    {
      id: "cluster_alpha",
      name: "Abell-3627 Core (Great Attractor)",
      type: "cluster",
      cx: 180,
      cy: 140,
      radius: 40,
      expectedDensity: "δ ≈ +15.4 (High Cluster Overdensity)",
      found: false,
    },
    {
      id: "cluster_beta",
      name: "Coma-Type Rich Cluster",
      type: "cluster",
      cx: 460,
      cy: 110,
      radius: 45,
      expectedDensity: "δ ≈ +22.1 (Supercluster Node)",
      found: false,
    },
    {
      id: "cluster_gamma",
      name: "Virgo-Scale Subcluster",
      type: "cluster",
      cx: 340,
      cy: 280,
      radius: 38,
      expectedDensity: "δ ≈ +11.8 (Virialized Core)",
      found: false,
    },
    {
      id: "void_great",
      name: "Boötes-Type Supervoid",
      type: "void",
      cx: 170,
      cy: 280,
      radius: 55,
      expectedDensity: "δ ≈ -0.85 (Deep Cosmic Void)",
      found: false,
    },
  ]);

  // Generate 1200 galaxies in a survey wedge distribution
  const galaxies = useMemo<SurveyGalaxy[]>(() => {
    const list: SurveyGalaxy[] = [];
    const W = 640;
    const H = 380;

    // Cluster nodes
    const clusters = [
      { cx: 180, cy: 140, count: 280, r: 35 },
      { cx: 460, cy: 110, count: 320, r: 40 },
      { cx: 340, cy: 280, count: 210, r: 32 },
    ];

    clusters.forEach((c) => {
      for (let i = 0; i < c.count; i++) {
        const u = Math.random();
        const r = Math.sqrt(u) * c.r;
        const theta = Math.random() * Math.PI * 2;
        list.push({
          x: c.cx + Math.cos(theta) * r,
          y: c.cy + Math.sin(theta) * r,
          brightness: 0.6 + Math.random() * 0.4,
        });
      }
    });

    // Filament bridges between clusters
    const bridges = [
      { x1: 180, y1: 140, x2: 460, y2: 110, count: 180 },
      { x1: 460, y1: 110, x2: 340, y2: 280, count: 140 },
      { x1: 180, y1: 140, x2: 340, y2: 280, count: 120 },
    ];

    bridges.forEach((b) => {
      for (let i = 0; i < b.count; i++) {
        const t = Math.random();
        const px = b.x1 + (b.x2 - b.x1) * t;
        const py = b.y1 + (b.y2 - b.y1) * t;
        const perp = (Math.random() - 0.5) * 22;
        list.push({
          x: px + perp,
          y: py + perp,
          brightness: 0.4 + Math.random() * 0.4,
        });
      }
    });

    // Background random scatter (excluding the void at [170, 280])
    for (let i = 0; i < 220; i++) {
      const rx = Math.random() * W;
      const ry = Math.random() * H;
      const distToVoid = Math.hypot(rx - 170, ry - 280);
      if (distToVoid > 55) {
        list.push({
          x: rx,
          y: ry,
          brightness: 0.3 + Math.random() * 0.3,
        });
      }
    }

    return list;
  }, []);

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    // Deep cosmic survey backdrop (SDSS indigo-black)
    ctx.fillStyle = "#030614";
    ctx.fillRect(0, 0, W, H);

    // Survey RA/Dec coordinates grid
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;
    for (let x = 60; x < W; x += 100) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 60; y < H; y += 80) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // Draw all survey galaxies
    galaxies.forEach((g) => {
      ctx.fillStyle = `rgba(147, 197, 253, ${g.brightness})`;
      ctx.beginPath();
      ctx.arc(g.x, g.y, 1.3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw discovered targets
    targets.forEach((t) => {
      if (t.found) {
        ctx.strokeStyle = t.type === "cluster" ? "#facc15" : "#60a5fa";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.arc(t.cx, t.cy, t.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Label
        ctx.fillStyle = t.type === "cluster" ? "#fef08a" : "#bfdbfe";
        ctx.font = "bold 11px sans-serif";
        ctx.fillText(t.name, t.cx - 50, t.cy - t.radius - 6);
      }
    });
  }, [galaxies, targets]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Calculate local galaxy density within radius 35
    const nearbyCount = galaxies.filter((g) => Math.hypot(g.x - clickX, g.y - clickY) < 35).length;
    const averageDensityRadius35 = 18; // baseline
    const contrastDelta = ((nearbyCount - averageDensityRadius35) / averageDensityRadius35).toFixed(
      1,
    );

    setLastMeasuredDensity(
      `Count: ${nearbyCount} galaxies in aperture • Contrast: δ = ${contrastDelta > "0" ? "+" : ""}${contrastDelta}`,
    );

    // Check hit on unfound targets
    let hitTarget: TargetRegion | null = null;
    targets.forEach((t) => {
      if (!t.found) {
        const d = Math.hypot(t.cx - clickX, t.cy - clickY);
        if (d < t.radius) {
          hitTarget = t;
        }
      }
    });

    if (hitTarget) {
      const target = hitTarget as TargetRegion;
      const updated = targets.map((t) => (t.id === target.id ? { ...t, found: true } : t));
      setTargets(updated);
      setScore((s) => s + 100);
      setFeedbackType("success");
      setFeedback(`Target Discovered: ${target.name}! Local Density: ${target.expectedDensity}`);

      // Check if all targets found
      if (updated.every((t) => t.found)) {
        onComplete?.();
        setFeedback("Cosmic Survey Complete! You mapped all key clusters and the supervoid!");
      }
    } else {
      if (nearbyCount > 35) {
        setFeedbackType("info");
        setFeedback(
          `Dense region detected (δ = +${contrastDelta}), but off-center from the virialized cluster core!`,
        );
      } else if (nearbyCount < 3) {
        setFeedbackType("info");
        setFeedback(
          `Underdense zone detected (δ = ${contrastDelta})! Look for the central Boötes Supervoid.`,
        );
      } else {
        setFeedbackType("warning");
        setFeedback(
          `Average filament density (δ ≈ ${contrastDelta}). Look for dense yellow cluster nodes!`,
        );
      }
    }
  };

  const handleReset = () => {
    setTargets(targets.map((t) => ({ ...t, found: false })));
    setScore(0);
    setFeedback("Survey reset. Click to inspect local galaxy densities and identify clusters!");
    setFeedbackType("info");
    setLastMeasuredDensity(null);
  };

  const foundCount = targets.filter((t) => t.found).length;

  return (
    <div className="rounded-3xl border border-indigo-500/30 bg-slate-950 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-3 py-0.5 rounded-full uppercase tracking-wider">
              Survey Mission Lab • SDSS Wedge Simulation
            </span>
            <span className="text-xs text-slate-400">Cosmic Density Mapping Game</span>
          </div>
          <h3 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <span>Hunt for Galaxy Clusters & Voids</span>
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 font-mono">
            Survey Score: <strong className="text-amber-400 text-sm">{score}</strong> pts
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleReset}
            className="text-xs border-white/10 text-slate-300 hover:text-white"
          >
            <RotateCcw className="size-3.5 mr-1" />
            <span>Reset Map</span>
          </Button>
        </div>
      </div>

      {/* Target Progress Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {targets.map((t) => (
          <div
            key={t.id}
            className={`p-3 rounded-xl border text-xs transition-all ${
              t.found
                ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                : "bg-slate-900/60 border-white/10 text-slate-400"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-[10px] uppercase font-bold">
                {t.type === "cluster" ? "Cluster Core" : "Cosmic Void"}
              </span>
              {t.found && <CheckCircle2 className="size-3.5 text-emerald-400" />}
            </div>
            <span className="font-semibold text-white block truncate">{t.name}</span>
          </div>
        ))}
      </div>

      {/* Canvas Survey Stage */}
      <div className="relative rounded-2xl border border-white/10 bg-[#030614] h-[340px] sm:h-[400px] w-full overflow-hidden flex items-center justify-center cursor-crosshair">
        <canvas
          ref={canvasRef}
          width={640}
          height={380}
          onClick={handleCanvasClick}
          className="w-full h-full object-contain"
        />

        {/* Live Photometric Aperture Readout */}
        {lastMeasuredDensity && (
          <div className="absolute top-4 left-4 bg-slate-900/85 backdrop-blur-md border border-cyan-500/30 rounded-xl px-3 py-1.5 text-xs text-cyan-200 font-mono shadow-xl">
            {lastMeasuredDensity}
          </div>
        )}

        {/* Discovered Counter Badge */}
        <div className="absolute bottom-4 right-4 bg-slate-900/85 backdrop-blur-md border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-300 font-mono">
          Progress: <strong className="text-white">{foundCount}</strong> of 4 Mapped
        </div>
      </div>

      {/* Real-time Feedback Banner */}
      <div
        className={`p-4 rounded-xl border text-xs leading-relaxed flex items-center justify-between gap-3 ${
          feedbackType === "success"
            ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
            : feedbackType === "warning"
              ? "bg-amber-950/40 border-amber-500/40 text-amber-200"
              : "bg-slate-900/80 border-white/10 text-slate-300"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <Target className="size-4 text-cyan-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      </div>
    </div>
  );
}
