// @ts-nocheck -- loosely-typed educational content; runtime-validated by rendering.
import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Zap,
  Flame,
  Atom,
  Radio,
  Moon,
  Orbit,
  Compass,
  Info,
  Layers,
  Thermometer,
  Clock,
  Activity,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Maximize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { COSMIC_EPOCHS, CosmicEpoch } from "@/lib/academy/lessons/module-17-big-bang";
import type { LearningLevel } from "@/lib/academy/types";

interface CosmicTimeMachineProps {
  level: LearningLevel;
  onInteract?: () => void;
}

export function CosmicTimeMachine3D({ level, onInteract }: CosmicTimeMachineProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Active Epoch index (0 to COSMIC_EPOCHS.length - 1)
  const [activeEpochIndex, setActiveEpochIndex] = useState<number>(3); // Default to Recombination / CMB
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playSpeed, setPlaySpeed] = useState<number>(1);
  const [showTemperatureGuide, setShowTemperatureGuide] = useState<boolean>(false);
  const [selectedSubTab, setSelectedSubTab] = useState<"visual" | "thermodynamics" | "structure">(
    "visual",
  );

  const currentEpoch = COSMIC_EPOCHS[activeEpochIndex];

  // Particle generation for cosmic visual simulation
  const particles = useMemo(() => {
    const pts = [];
    const count = 280;
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 600;
      const y = (Math.random() - 0.5) * 400;
      const z = Math.random() * 500 - 250;
      const vx = (Math.random() - 0.5) * 0.8;
      const vy = (Math.random() - 0.5) * 0.8;
      const size = Math.random() * 3 + 1;
      const phase = Math.random() * Math.PI * 2;
      pts.push({ x, y, z, vx, vy, size, phase });
    }
    return pts;
  }, []);

  // Animation playback across epochs
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveEpochIndex((prev) => {
        if (prev >= COSMIC_EPOCHS.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
      if (onInteract) onInteract();
    }, 3800 / playSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, playSpeed, onInteract]);

  // Canvas visual rendering representing the current cosmic epoch
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
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // 1. Background glow based on epoch
      const epochId = currentEpoch.id;

      if (epochId === "planck") {
        // Blinding quantum foam & metric stretching
        const grad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, width * 0.65);
        grad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
        grad.addColorStop(0.2, "rgba(192, 132, 252, 0.8)");
        grad.addColorStop(0.5, "rgba(107, 33, 168, 0.4)");
        grad.addColorStop(1, "rgba(3, 7, 18, 1)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Quantum foam grid lines vibrating
        ctx.strokeStyle = "rgba(238, 210, 255, 0.25)";
        ctx.lineWidth = 1;
        const gridStep = 32;
        for (let x = 0; x < width; x += gridStep) {
          ctx.beginPath();
          for (let y = 0; y < height; y += 10) {
            const wave = Math.sin(y * 0.05 + frame * 0.1) * 8 * Math.cos(x * 0.04 + frame * 0.08);
            if (y === 0) ctx.moveTo(x + wave, y);
            else ctx.lineTo(x + wave, y);
          }
          ctx.stroke();
        }
      } else if (epochId === "quark_gluon") {
        // Fiery colliding quark-gluon plasma
        const grad = ctx.createRadialGradient(centerX, centerY, 20, centerX, centerY, width * 0.6);
        grad.addColorStop(0, "rgba(254, 240, 138, 0.9)");
        grad.addColorStop(0.3, "rgba(239, 68, 68, 0.75)");
        grad.addColorStop(0.7, "rgba(69, 10, 10, 0.6)");
        grad.addColorStop(1, "rgba(2, 6, 23, 1)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Swarming quarks and gluons
        particles.slice(0, 160).forEach((p, idx) => {
          const px = centerX + Math.cos(p.phase + frame * 0.08) * (p.x * 0.5);
          const py = centerY + Math.sin(p.phase + frame * 0.07) * (p.y * 0.5);
          ctx.fillStyle = idx % 3 === 0 ? "#f87171" : idx % 3 === 1 ? "#38bdf8" : "#4ade80";
          ctx.beginPath();
          ctx.arc(px, py, p.size * 1.5, 0, Math.PI * 2);
          ctx.fill();

          // Gluon color flux tubes
          if (idx % 8 === 0) {
            ctx.strokeStyle = "rgba(253, 224, 71, 0.4)";
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(
              centerX + (Math.random() - 0.5) * 100,
              centerY + (Math.random() - 0.5) * 100,
            );
            ctx.stroke();
          }
        });
      } else if (epochId === "bbn") {
        // Thermonuclear furnace forging H and He nuclei
        const grad = ctx.createRadialGradient(centerX, centerY, 30, centerX, centerY, width * 0.7);
        grad.addColorStop(0, "rgba(253, 224, 71, 0.85)");
        grad.addColorStop(0.35, "rgba(249, 115, 22, 0.65)");
        grad.addColorStop(0.8, "rgba(124, 45, 18, 0.4)");
        grad.addColorStop(1, "rgba(2, 6, 23, 1)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Clustered alpha particles (He-4: 2 red protons + 2 blue neutrons)
        for (let i = 0; i < 28; i++) {
          const angle = (i / 28) * Math.PI * 2 + frame * 0.01;
          const dist = 60 + (i % 4) * 45;
          const cx = centerX + Math.cos(angle) * dist;
          const cy = centerY + Math.sin(angle) * dist;

          // Proton 1
          ctx.fillStyle = "#ef4444";
          ctx.beginPath();
          ctx.arc(cx - 5, cy - 5, 4.5, 0, Math.PI * 2);
          ctx.fill();
          // Proton 2
          ctx.beginPath();
          ctx.arc(cx + 5, cy + 5, 4.5, 0, Math.PI * 2);
          ctx.fill();
          // Neutron 1
          ctx.fillStyle = "#38bdf8";
          ctx.beginPath();
          ctx.arc(cx + 5, cy - 5, 4.5, 0, Math.PI * 2);
          ctx.fill();
          // Neutron 2
          ctx.beginPath();
          ctx.arc(cx - 5, cy + 5, 4.5, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (epochId === "recombination") {
        // Glowing orange-yellow fog clearing into transparent space, revealing CMB acoustic ripples
        const grad = ctx.createRadialGradient(centerX, centerY, 20, centerX, centerY, width * 0.65);
        grad.addColorStop(0, "rgba(254, 240, 138, 0.5)");
        grad.addColorStop(0.4, "rgba(249, 115, 22, 0.35)");
        grad.addColorStop(0.8, "rgba(6, 78, 59, 0.25)");
        grad.addColorStop(1, "rgba(2, 6, 23, 1)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Acoustic ripples (Baryon Acoustic Oscillations sound horizon)
        for (let r = 30; r < width * 0.45; r += 42) {
          const pulse = Math.sin(frame * 0.03 - r * 0.04) * 0.2 + 0.3;
          ctx.strokeStyle = `rgba(251, 146, 60, ${pulse})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Neutral hydrogen atoms forming
        particles.slice(0, 90).forEach((p) => {
          const px = centerX + p.x * 0.7;
          const py = centerY + p.y * 0.7;
          ctx.fillStyle = "#fef08a";
          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fill();

          // Captured electron orbit
          ctx.strokeStyle = "rgba(147, 197, 253, 0.35)";
          ctx.beginPath();
          ctx.arc(px, py, 8, 0, Math.PI * 2);
          ctx.stroke();
        });
      } else if (epochId === "dark_ages") {
        // Deep pitch black space; filamentary dark matter webs gathering silently
        ctx.fillStyle = "#020617";
        ctx.fillRect(0, 0, width, height);

        // Invisible filamentary dark matter web (represented as subtle blue glow)
        ctx.strokeStyle = "rgba(56, 189, 248, 0.12)";
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 20; i++) {
          const p1 = particles[i];
          const p2 = particles[(i + 7) % particles.length];
          ctx.beginPath();
          ctx.moveTo(centerX + p1.x * 0.8, centerY + p1.y * 0.8);
          ctx.lineTo(centerX + p2.x * 0.8, centerY + p2.y * 0.8);
          ctx.stroke();
        }

        // Faint 21cm hydrogen radio waves
        const pulse = (Math.sin(frame * 0.04) + 1) * 0.06;
        ctx.fillStyle = `rgba(56, 189, 248, ${pulse})`;
        ctx.font = "11px monospace";
        ctx.fillText("Neutral Hydrogen (21 cm radio ripples)", 20, height - 20);
      } else if (epochId === "cosmic_dawn") {
        // Cosmic Dawn: First Population III massive stars igniting with expanding cyan H II ionization bubbles
        ctx.fillStyle = "#030712";
        ctx.fillRect(0, 0, width, height);

        // Expanding ionization bubbles
        const bubbleCenters = [
          { x: centerX - 120, y: centerY - 60, r: 75 },
          { x: centerX + 110, y: centerY + 50, r: 90 },
          { x: centerX - 40, y: centerY + 100, r: 65 },
          { x: centerX + 130, y: centerY - 90, r: 70 },
          { x: centerX, y: centerY - 10, r: 85 },
        ];

        bubbleCenters.forEach((b) => {
          const bg = ctx.createRadialGradient(b.x, b.y, 2, b.x, b.y, b.r);
          bg.addColorStop(0, "rgba(56, 189, 248, 0.65)");
          bg.addColorStop(0.7, "rgba(6, 182, 212, 0.2)");
          bg.addColorStop(1, "rgba(2, 6, 23, 0)");
          ctx.fillStyle = bg;
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
          ctx.fill();

          // Central brilliant Pop III star
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(b.x, b.y, 3.5, 0, Math.PI * 2);
          ctx.fill();

          // Diffraction star spikes
          ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(b.x - 12, b.y);
          ctx.lineTo(b.x + 12, b.y);
          ctx.moveTo(b.x, b.y - 12);
          ctx.lineTo(b.x, b.y + 12);
          ctx.stroke();
        });
      } else if (epochId === "cosmic_noon") {
        // Cosmic Noon: High star formation rate density, clumpy colliding proto-galaxies and quasars
        const grad = ctx.createRadialGradient(centerX, centerY, 30, centerX, centerY, width * 0.7);
        grad.addColorStop(0, "rgba(236, 72, 153, 0.25)");
        grad.addColorStop(0.4, "rgba(139, 92, 246, 0.2)");
        grad.addColorStop(1, "rgba(2, 6, 23, 1)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Clumpy merging galaxies
        particles.slice(0, 220).forEach((p, idx) => {
          const clusterCenterX = idx < 110 ? centerX - 80 : centerX + 80;
          const clusterCenterY = idx < 110 ? centerY - 30 : centerY + 30;
          const px = clusterCenterX + p.x * 0.28 * Math.cos(frame * 0.01 + p.phase);
          const py = clusterCenterY + p.y * 0.28 * Math.sin(frame * 0.01 + p.phase);

          ctx.fillStyle = idx % 4 === 0 ? "#f43f5e" : idx % 4 === 1 ? "#a855f7" : "#38bdf8";
          ctx.beginPath();
          ctx.arc(px, py, p.size * 0.9, 0, Math.PI * 2);
          ctx.fill();
        });

        // Active quasar jet
        ctx.strokeStyle = "rgba(244, 63, 94, 0.75)";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(centerX - 80, centerY - 30);
        ctx.lineTo(centerX - 170, centerY - 140);
        ctx.moveTo(centerX - 80, centerY - 30);
        ctx.lineTo(centerX + 10, centerY + 80);
        ctx.stroke();
      } else {
        // Modern Universe: Vast mature cosmic web with spirals, ellipticals, voids
        ctx.fillStyle = "#020617";
        ctx.fillRect(0, 0, width, height);

        // Cosmic web filaments connecting galaxy clusters
        ctx.strokeStyle = "rgba(129, 140, 248, 0.25)";
        ctx.lineWidth = 1.2;
        for (let i = 0; i < 40; i++) {
          const p1 = particles[i];
          const p2 = particles[(i + 5) % particles.length];
          ctx.beginPath();
          ctx.moveTo(centerX + p1.x * 0.85, centerY + p1.y * 0.85);
          ctx.lineTo(centerX + p2.x * 0.85, centerY + p2.y * 0.85);
          ctx.stroke();
        }

        // Galaxy nodes (mature spirals & ellipticals)
        particles.slice(0, 140).forEach((p, idx) => {
          const px = centerX + p.x * 0.85;
          const py = centerY + p.y * 0.85;
          ctx.fillStyle = idx % 5 === 0 ? "#fef08a" : idx % 5 === 1 ? "#93c5fd" : "#c4b5fd";
          ctx.beginPath();
          ctx.arc(px, py, p.size * 0.8, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [currentEpoch, particles]);

  const handleSliderChange = (idx: number) => {
    setActiveEpochIndex(idx);
    setIsPlaying(false);
    if (onInteract) onInteract();
  };

  const getConfidenceBadge = (confidence: CosmicEpoch["scientificConfidence"]) => {
    switch (confidence) {
      case "precision_empirical":
        return {
          label: "Precision Empirical Science",
          classes: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
        };
      case "established":
        return {
          label: "Established Standard Physics",
          classes: "bg-blue-500/15 text-blue-300 border-blue-500/30",
        };
      case "theoretical":
        return {
          label: "Theoretical / High-Energy Lab Confirmed",
          classes: "bg-amber-500/15 text-amber-300 border-amber-500/30",
        };
      case "speculative":
        return {
          label: "Speculative Quantum Frontier",
          classes: "bg-purple-500/15 text-purple-300 border-purple-500/30",
        };
    }
  };

  const confBadge = getConfidenceBadge(currentEpoch.scientificConfidence);

  return (
    <div className="space-y-6">
      {/* Signature Header Banner */}
      <div className="relative rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-950/40 via-purple-950/30 to-slate-900/80 p-5 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Signature Experience
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${confBadge.classes}`}
              >
                {confBadge.label}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Clock className="size-6 text-rose-400" />
              Interactive Cosmic Time Machine
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Journey through 13.8 billion years of cosmic evolution. Scrub the timeline to watch
              temperature plummet, the cosmic fog clear, and the first stars illuminate the modern
              web.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
              className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border-rose-500/40 text-xs font-semibold"
            >
              {isPlaying ? (
                <Pause className="size-3.5 mr-1.5" />
              ) : (
                <Play className="size-3.5 mr-1.5" />
              )}
              {isPlaying ? "Pause Timeline" : "Play Epochs"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setActiveEpochIndex(0);
                setIsPlaying(false);
              }}
              className="text-slate-400 hover:text-white text-xs"
            >
              <RotateCcw className="size-3.5 mr-1" /> Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Main Interactive Stage Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Canvas & Playback (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Canvas Viewport */}
          <div className="relative rounded-2xl border border-white/10 bg-slate-950 overflow-hidden shadow-2xl">
            <canvas
              ref={canvasRef}
              width={720}
              height={440}
              className="w-full h-72 sm:h-96 object-cover block"
            />

            {/* Dynamic Overlay HUD */}
            <div className="absolute top-3 left-3 right-3 flex items-start justify-between pointer-events-none">
              <div className="bg-slate-950/80 backdrop-blur-md border border-white/10 rounded-xl px-3.5 py-2">
                <div className="text-[10px] uppercase tracking-wider font-semibold text-rose-400">
                  Active Epoch
                </div>
                <div className="text-base sm:text-lg font-bold text-white flex items-center gap-1.5">
                  {currentEpoch.name}
                </div>
                <div className="text-xs text-slate-300 font-mono">{currentEpoch.timeLabel}</div>
              </div>

              <div className="bg-slate-950/80 backdrop-blur-md border border-white/10 rounded-xl px-3 py-1.5 text-right font-mono text-xs">
                <div className="text-rose-400 font-bold">
                  T ={" "}
                  {currentEpoch.temperatureKelvin > 1000
                    ? currentEpoch.temperatureKelvin.toExponential(1)
                    : currentEpoch.temperatureKelvin.toFixed(2)}{" "}
                  K
                </div>
                <div className="text-slate-400 text-[11px]">
                  Redshift z ={" "}
                  {currentEpoch.redshift > 1000
                    ? currentEpoch.redshift.toExponential(1)
                    : currentEpoch.redshift.toFixed(1)}
                </div>
              </div>
            </div>

            {/* Visual description caption */}
            <div className="absolute bottom-3 left-3 right-3 bg-slate-950/85 backdrop-blur-md border border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-300 flex items-center justify-between">
              <span className="italic">{currentEpoch.visualTheme.description}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300 ml-2 whitespace-nowrap">
                Dominant: {currentEpoch.dominantComponent}
              </span>
            </div>
          </div>

          {/* Epoch Slider & Navigation Bar */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-md space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Clock className="size-3.5 text-rose-400" />
                Scrub Cosmic Timeline:
              </span>
              <span className="font-mono text-rose-400 font-bold">
                Epoch {activeEpochIndex + 1} of {COSMIC_EPOCHS.length}
              </span>
            </div>

            {/* Slider */}
            <div className="px-1">
              <input
                type="range"
                min={0}
                max={COSMIC_EPOCHS.length - 1}
                step={1}
                value={activeEpochIndex}
                onChange={(e) => handleSliderChange(parseInt(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Quick Epoch Buttons */}
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 pt-1">
              {COSMIC_EPOCHS.map((epoch, idx) => (
                <button
                  key={epoch.id}
                  onClick={() => handleSliderChange(idx)}
                  className={`px-2 py-1.5 rounded-lg text-[10px] font-medium transition-all text-center truncate ${
                    activeEpochIndex === idx
                      ? "bg-rose-500 text-white font-bold shadow-md shadow-rose-950/50"
                      : "bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/5"
                  }`}
                  title={`${epoch.name} (${epoch.timeLabel})`}
                >
                  {epoch.name.split(" ")[0]}
                </button>
              ))}
            </div>

            {/* Speed control */}
            <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span>Playback Speed:</span>
                {[1, 2, 4].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setPlaySpeed(spd)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                      playSpeed === spd
                        ? "bg-rose-500/30 text-rose-300 border border-rose-500/40"
                        : "hover:text-white text-slate-400"
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowTemperatureGuide(!showTemperatureGuide)}
                className="text-rose-400 hover:text-rose-300 flex items-center gap-1 text-[11px]"
              >
                <Thermometer className="size-3" />
                {showTemperatureGuide ? "Hide Temp Guide" : "Compare Temperatures"}
              </button>
            </div>
          </div>

          {/* Temperature Guide Drawer */}
          {showTemperatureGuide && (
            <div className="rounded-2xl border border-white/10 bg-slate-900/90 p-4 text-xs space-y-2 backdrop-blur-md">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <Thermometer className="size-3.5 text-rose-400" />
                Cosmic Temperature Milestones
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                <div className="p-2 rounded-lg bg-slate-950/60 border border-white/5">
                  <div className="text-slate-400">Planck Era</div>
                  <div className="text-rose-400 font-bold">&gt; 10³² K</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-950/60 border border-white/5">
                  <div className="text-slate-400">Nucleosynthesis</div>
                  <div className="text-amber-400 font-bold">10⁹ K (1B K)</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-950/60 border border-white/5">
                  <div className="text-slate-400">Recombination (CMB)</div>
                  <div className="text-orange-400 font-bold">2,970 K (~3000 K)</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-950/60 border border-white/5">
                  <div className="text-slate-400">Modern Day CMB</div>
                  <div className="text-cyan-400 font-bold">2.7255 K (-270.4°C)</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Physical Parameters & Multi-Level Explanation (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Cosmological Parameters Card */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Activity className="size-4 text-rose-400" />
                Physical Cosmic State
              </h3>
              <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-white/5 text-rose-300 border border-rose-500/20">
                {currentEpoch.timeLabel}
              </span>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5">
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Thermometer className="size-3 text-rose-400" />
                  Radiation Temp
                </div>
                <div className="text-sm font-bold font-mono text-white mt-0.5">
                  {currentEpoch.temperatureKelvin > 1000
                    ? currentEpoch.temperatureKelvin.toExponential(2)
                    : currentEpoch.temperatureKelvin.toFixed(2)}{" "}
                  K
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  Energy: {currentEpoch.energyEv}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5">
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <TrendingUp className="size-3 text-cyan-400" />
                  Redshift (z)
                </div>
                <div className="text-sm font-bold font-mono text-white mt-0.5">
                  {currentEpoch.redshift > 1000
                    ? currentEpoch.redshift.toExponential(2)
                    : currentEpoch.redshift.toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  Scale a(t) ={" "}
                  {currentEpoch.scaleFactor > 1e-4
                    ? currentEpoch.scaleFactor.toFixed(4)
                    : currentEpoch.scaleFactor.toExponential(2)}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5">
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Layers className="size-3 text-purple-400" />
                  Dominant Energy
                </div>
                <div className="text-sm font-bold text-white mt-0.5">
                  {currentEpoch.dominantComponent}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {currentEpoch.dominantComponent === "Radiation"
                    ? "ρ_r ∝ a⁻⁴"
                    : currentEpoch.dominantComponent === "Matter"
                      ? "ρ_m ∝ a⁻³"
                      : currentEpoch.dominantComponent === "Dark Energy"
                        ? "ρ_Λ = const"
                        : "Scalar field"}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5">
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="size-3 text-emerald-400" />
                  Scientific Status
                </div>
                <div className="text-xs font-semibold text-emerald-300 mt-0.5 capitalize">
                  {currentEpoch.scientificConfidence.replace("_", " ")}
                </div>
                <div
                  className="text-[10px] text-slate-400 mt-0.5 truncate"
                  title={currentEpoch.confidenceExplanation}
                >
                  Evidence-based
                </div>
              </div>
            </div>

            {/* Density Fluctuations & Structures */}
            <div className="p-3 rounded-xl bg-slate-950/50 border border-white/5 text-xs">
              <span className="font-semibold text-slate-300 block mb-1">
                Density Fluctuations & Growth:
              </span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                {currentEpoch.densityFluctuations}
              </p>
            </div>
          </div>

          {/* Scientific Explanation Tabs */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 backdrop-blur-xl space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="text-xs font-bold text-white uppercase tracking-wider">
                {level === "explorer"
                  ? "Junior Cosmologist Guide"
                  : level === "scholar"
                    ? "Academic Treatise"
                    : "Astrophysical Formulation"}
              </div>
              <span className="text-[10px] text-rose-400 font-medium">
                Level: {level.toUpperCase()}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {currentEpoch.details[level]}
            </p>

            {/* Scientific Confidence Note */}
            <div className="pt-2 border-t border-white/5 text-[11px] text-slate-400 flex items-start gap-1.5">
              <Info className="size-3.5 text-rose-400 shrink-0 mt-0.5" />
              <span>{currentEpoch.confidenceExplanation}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
