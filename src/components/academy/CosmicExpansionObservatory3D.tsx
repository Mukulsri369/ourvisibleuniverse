// @ts-nocheck
import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Compass,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Info,
  Maximize2,
  TrendingUp,
  Activity,
  Sliders,
  Layers,
  ShieldCheck,
  Eye,
  Crosshair,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  REAL_GALAXY_DATASETS,
  GalaxyDataPoint,
} from "@/lib/academy/lessons/module-18-expanding-universe";
import type { LearningLevel } from "@/lib/academy/types";
import { Cosmos3DAdapter } from "@/lib/cosmos/Cosmos3DAdapter";
import type { ApprovedDemonstrationId } from "@/lib/cosmos/cosmos-types";

interface CosmicExpansionObservatory3DProps {
  level: LearningLevel;
  onInteract?: () => void;
}

interface SimulatedGalaxy {
  id: string;
  name: string;
  comovingX: number; // initial coordinate in Mpc (-350 to +350)
  comovingY: number;
  color: string;
  size: number;
  isBound: boolean; // if true, doesn't expand (e.g. Andromeda bound to Milky Way)
  boundToId?: string;
  dataRef?: GalaxyDataPoint;
}

const BASE_GALAXIES: SimulatedGalaxy[] = [
  {
    id: "milkyway",
    name: "Milky Way (Earth)",
    comovingX: 0,
    comovingY: 0,
    color: "#38bdf8",
    size: 5,
    isBound: false,
  },
  {
    id: "andromeda",
    name: "Andromeda (M31)",
    comovingX: -6,
    comovingY: 8,
    color: "#67e8f9",
    size: 4.5,
    isBound: true,
    boundToId: "milkyway",
    dataRef: REAL_GALAXY_DATASETS[0],
  },
  {
    id: "triangulum",
    name: "Triangulum (M33)",
    comovingX: -9,
    comovingY: 12,
    color: "#a5f3fc",
    size: 3,
    isBound: true,
    boundToId: "milkyway",
    dataRef: REAL_GALAXY_DATASETS[1],
  },
  {
    id: "virgo_m87",
    name: "Virgo Cluster (M87)",
    comovingX: 35,
    comovingY: 65,
    color: "#f59e0b",
    size: 6,
    isBound: false,
    dataRef: REAL_GALAXY_DATASETS[2],
  },
  {
    id: "fornax",
    name: "Fornax Cluster",
    comovingX: -55,
    comovingY: -45,
    color: "#fbbf24",
    size: 5,
    isBound: false,
    dataRef: REAL_GALAXY_DATASETS[3],
  },
  {
    id: "centaurus",
    name: "Centaurus Cluster",
    comovingX: 85,
    comovingY: -70,
    color: "#f97316",
    size: 5.5,
    isBound: false,
  },
  {
    id: "coma",
    name: "Coma Cluster (Abell 1656)",
    comovingX: 130,
    comovingY: 110,
    color: "#ec4899",
    size: 6.5,
    isBound: false,
    dataRef: REAL_GALAXY_DATASETS[4],
  },
  {
    id: "hercules",
    name: "Hercules Supercluster",
    comovingX: -160,
    comovingY: 140,
    color: "#a855f7",
    size: 6,
    isBound: false,
    dataRef: REAL_GALAXY_DATASETS[5],
  },
  {
    id: "distant_quasar",
    name: "Quasar 3C 273",
    comovingX: 230,
    comovingY: -180,
    color: "#e11d48",
    size: 5,
    isBound: false,
    dataRef: REAL_GALAXY_DATASETS[6],
  },
  {
    id: "deep_jwst",
    name: "JADES Deep Galaxy",
    comovingX: -260,
    comovingY: -220,
    color: "#f43f5e",
    size: 4,
    isBound: false,
    dataRef: REAL_GALAXY_DATASETS[8],
  },
];

export function CosmicExpansionObservatory3D({
  level,
  onInteract,
}: CosmicExpansionObservatory3DProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hubbleChartRef = useRef<HTMLCanvasElement | null>(null);

  // States
  const [scaleFactorA, setScaleFactorA] = useState<number>(1.0); // 0.2 to 2.0
  const [hubbleConstantH0, setHubbleConstantH0] = useState<number>(70.0); // 50 to 90 km/s/Mpc
  const [observerGalaxyId, setObserverGalaxyId] = useState<string>("milkyway");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showVelocityVectors, setShowVelocityVectors] = useState<boolean>(true);
  const [showCoordinateGrid, setShowCoordinateGrid] = useState<boolean>(true);
  const [selectedPair, setSelectedPair] = useState<{ id1: string; id2: string }>({
    id1: "milkyway",
    id2: "virgo_m87",
  });

  // Animation advancing cosmic time
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setScaleFactorA((prev) => {
        if (prev >= 1.95) return 0.3; // Loop back
        return parseFloat((prev + 0.015).toFixed(3));
      });
      if (onInteract) onInteract();
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying, onInteract]);

  useEffect(() => {
    const adapter = Cosmos3DAdapter.getInstance();
    const unregister = adapter.registerScene({
      sceneId: "cosmic_expansion",
      getCurrentSimulationState: () => ({
        isPaused: !isPlaying,
        timeScale: 1.0,
        activeSceneId: "cosmic_expansion",
        selectedObjectName: observerGalaxy.name,
        epistemicMode: "physically_accurate",
        scientificNotes:
          "FLRW metric cosmological expansion. Proper distance D(t) = a(t) * r_comoving; v = H0 * d.",
        cameraRegime: "cosmological",
      }),
      getSelectedObject: () => ({
        name: observerGalaxy.name,
        type: "galaxy",
        distanceFromObserver: `${observerGalaxy.comovingX.toFixed(0)}, ${observerGalaxy.comovingY.toFixed(0)} Mpc comoving`,
        catalogReference: "Hubble-Lemaître Law Dataset",
        isModelAvailable: true,
        physicalProperties: {
          scaleFactorA,
          hubbleConstantH0,
          isBound: observerGalaxy.isBound ? "true" : "false",
        },
        scientificDescription: `Observer galaxy in cosmological Hubble flow. Scale factor a(t) = ${scaleFactorA.toFixed(2)}.`,
      }),
      focusObject: (targetName: string) => {
        const found = BASE_GALAXIES.find(
          (g) =>
            g.name.toLowerCase().includes(targetName.toLowerCase()) ||
            g.id.toLowerCase().includes(targetName.toLowerCase()),
        );
        if (found) {
          setObserverGalaxyId(found.id);
          return true;
        }
        return false;
      },
      highlightObject: () => {
        setShowVelocityVectors(true);
        return true;
      },
      playDemonstration: (demoId: ApprovedDemonstrationId) => {
        if (demoId === "cosmic_expansion") {
          setIsPlaying(true);
          setShowVelocityVectors(true);
          setShowCoordinateGrid(true);
          return true;
        }
        return false;
      },
      pauseSimulation: () => {
        setIsPlaying(false);
        return true;
      },
      resumeSimulation: () => {
        setIsPlaying(true);
        return true;
      },
    });

    return unregister;
  }, [isPlaying, observerGalaxy, scaleFactorA, hubbleConstantH0]);

  // Observer coordinates
  const observerGalaxy = BASE_GALAXIES.find((g) => g.id === observerGalaxyId) || BASE_GALAXIES[0];

  // 1. Render 2D/3D Interactive Galaxy Field Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;

    // Background deep space
    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, width, height);

    // Subtle comoving coordinate grid (stretching with scale factor a)
    if (showCoordinateGrid) {
      const gridSpacing = 40 * scaleFactorA;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 1;

      const offsetX = centerX % gridSpacing;
      for (let x = offsetX; x < width; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      const offsetY = centerY % gridSpacing;
      for (let y = offsetY; y < height; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }

    // Observer reference position
    const obsComovingX = observerGalaxy.comovingX;
    const obsComovingY = observerGalaxy.comovingY;

    // Draw galaxy positions relative to selected observer
    BASE_GALAXIES.forEach((g) => {
      let properX: number;
      let properY: number;

      if (g.isBound && g.boundToId) {
        // Bound system (e.g. Andromeda bound to Milky Way): coordinates do NOT expand!
        const parent = BASE_GALAXIES.find((p) => p.id === g.boundToId) || g;
        const parentProperX = (parent.comovingX - obsComovingX) * scaleFactorA;
        const parentProperY = (parent.comovingY - obsComovingY) * scaleFactorA;

        // Fixed relative offset
        const fixedOffsetX = g.comovingX - parent.comovingX;
        const fixedOffsetY = g.comovingY - parent.comovingY;

        properX = parentProperX + fixedOffsetX;
        properY = parentProperY + fixedOffsetY;
      } else {
        // Unbound Hubble flow: scales with a(t)
        properX = (g.comovingX - obsComovingX) * scaleFactorA;
        properY = (g.comovingY - obsComovingY) * scaleFactorA;
      }

      const screenX = centerX + properX;
      const screenY = centerY + properY;

      // Distance from observer in Mpc
      const distMpc = Math.sqrt(properX * properX + properY * properY);
      const isObserver = g.id === observerGalaxyId;

      // Draw Recession Velocity Vector
      if (showVelocityVectors && !isObserver) {
        // Recession speed v = H0 * d
        const vKmS = g.isBound ? -300 : hubbleConstantH0 * distMpc;
        const vectorLen = Math.min(65, (vKmS / 15000) * 45);

        if (distMpc > 0) {
          const dirX = properX / distMpc;
          const dirY = properY / distMpc;

          // Arrow from galaxy outward
          ctx.strokeStyle = g.isBound ? "rgba(56, 189, 248, 0.7)" : "rgba(244, 63, 94, 0.75)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(screenX, screenY);
          ctx.lineTo(screenX + dirX * vectorLen, screenY + dirY * vectorLen);
          ctx.stroke();

          // Arrowhead
          const headAngle = Math.atan2(dirY, dirX);
          ctx.fillStyle = g.isBound ? "#38bdf8" : "#f43f5e";
          ctx.beginPath();
          ctx.arc(screenX + dirX * vectorLen, screenY + dirY * vectorLen, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw Galaxy Glow
      const glow = ctx.createRadialGradient(screenX, screenY, 1, screenX, screenY, g.size * 3.5);
      glow.addColorStop(0, g.color);
      glow.addColorStop(0.4, g.color + "99");
      glow.addColorStop(1, "rgba(2, 6, 23, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(screenX, screenY, g.size * 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Galaxy core
      ctx.fillStyle = isObserver ? "#ffffff" : g.color;
      ctx.beginPath();
      ctx.arc(screenX, screenY, isObserver ? g.size * 1.3 : g.size, 0, Math.PI * 2);
      ctx.fill();

      // Observer Target Crosshair
      if (isObserver) {
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(screenX, screenY, g.size * 3.2, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = "#38bdf8";
        ctx.font = "bold 10px monospace";
        ctx.fillText("OBSERVER (0,0)", screenX + 16, screenY - 8);
      } else {
        // Label
        ctx.fillStyle = "#94a3b8";
        ctx.font = "10px sans-serif";
        ctx.fillText(g.name.split(" ")[0], screenX + 10, screenY + 3);
      }
    });

    // Draw active measurement line between selectedPair
    const g1 = BASE_GALAXIES.find((g) => g.id === selectedPair.id1);
    const g2 = BASE_GALAXIES.find((g) => g.id === selectedPair.id2);
    if (g1 && g2) {
      const p1x = centerX + (g1.comovingX - obsComovingX) * scaleFactorA;
      const p1y = centerY + (g1.comovingY - obsComovingY) * scaleFactorA;
      const p2x = centerX + (g2.comovingX - obsComovingX) * scaleFactorA;
      const p2y = centerY + (g2.comovingY - obsComovingY) * scaleFactorA;

      ctx.strokeStyle = "rgba(251, 191, 36, 0.85)";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(p1x, p1y);
      ctx.lineTo(p2x, p2y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Distance tag
      const midX = (p1x + p2x) / 2;
      const midY = (p1y + p2y) / 2;
      const dist = Math.sqrt(Math.pow(p2x - p1x, 2) + Math.pow(p2y - p1y, 2));

      ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
      ctx.fillRect(midX - 35, midY - 10, 70, 20);
      ctx.strokeStyle = "rgba(251, 191, 36, 0.5)";
      ctx.strokeRect(midX - 35, midY - 10, 70, 20);

      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 10px monospace";
      ctx.fillText(`${dist.toFixed(0)} Mpc`, midX - 25, midY + 4);
    }
  }, [
    scaleFactorA,
    hubbleConstantH0,
    observerGalaxyId,
    showVelocityVectors,
    showCoordinateGrid,
    selectedPair,
    observerGalaxy,
  ]);

  // 2. Render Live Hubble Diagram (Distance vs Recession Velocity)
  useEffect(() => {
    const canvas = hubbleChartRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const padLeft = 60;
    const padRight = 20;
    const padTop = 25;
    const padBottom = 40;
    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;

    // Max distance in Mpc and Max velocity in km/s
    const maxDistMpc = 400;
    const maxVelocityKmS = 30000;

    // Grid lines for Distance
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;
    for (let d = 100; d <= maxDistMpc; d += 100) {
      const x = padLeft + (d / maxDistMpc) * plotW;
      ctx.beginPath();
      ctx.moveTo(x, padTop);
      ctx.lineTo(x, height - padBottom);
      ctx.stroke();

      ctx.fillStyle = "rgba(148, 163, 184, 0.8)";
      ctx.font = "10px monospace";
      ctx.fillText(`${d} Mpc`, x - 18, height - padBottom + 16);
    }

    // Grid lines for Velocity
    for (let v = 5000; v <= maxVelocityKmS; v += 5000) {
      const y = height - padBottom - (v / maxVelocityKmS) * plotH;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(width - padRight, y);
      ctx.stroke();

      ctx.fillStyle = "rgba(148, 163, 184, 0.8)";
      ctx.font = "10px monospace";
      ctx.fillText(`${v / 1000}k`, 18, y + 3);
    }

    // Axis titles
    ctx.fillStyle = "#94a3b8";
    ctx.font = "11px sans-serif";
    ctx.fillText("Proper Distance (Mpc)", padLeft + plotW * 0.35, height - 10);

    ctx.save();
    ctx.translate(16, padTop + plotH * 0.7);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("Recession Velocity v (km/s)", 0, 0);
    ctx.restore();

    // Theoretical Hubble Line: v = H0 * d
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2;
    ctx.beginPath();
    const x0 = padLeft;
    const y0 = height - padBottom;
    const xEnd = padLeft + plotW;
    const vAtMax = hubbleConstantH0 * maxDistMpc;
    const yEnd = height - padBottom - (vAtMax / maxVelocityKmS) * plotH;
    ctx.moveTo(x0, y0);
    ctx.lineTo(xEnd, yEnd);
    ctx.stroke();

    // Plot simulated galaxies on the diagram relative to the observer
    BASE_GALAXIES.forEach((g) => {
      if (g.id === observerGalaxyId) return;

      const dx = (g.comovingX - observerGalaxy.comovingX) * scaleFactorA;
      const dy = (g.comovingY - observerGalaxy.comovingY) * scaleFactorA;
      const d = Math.sqrt(dx * dx + dy * dy);

      if (d > maxDistMpc) return;

      const v = g.isBound ? -300 : hubbleConstantH0 * d;

      const px = padLeft + (d / maxDistMpc) * plotW;
      const py = height - padBottom - (Math.max(0, v) / maxVelocityKmS) * plotH;

      ctx.fillStyle = g.isBound ? "#38bdf8" : "#f43f5e";
      ctx.beginPath();
      ctx.arc(px, py, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Label
      ctx.fillStyle = "#cbd5e1";
      ctx.font = "9px sans-serif";
      ctx.fillText(g.name.split(" ")[0], px + 6, py - 3);
    });

    // Legend
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 10px monospace";
    ctx.fillText(`v = ${hubbleConstantH0} km/s/Mpc × d`, padLeft + 10, padTop + 15);
  }, [hubbleConstantH0, scaleFactorA, observerGalaxyId, observerGalaxy]);

  // Measured pair separation calculation
  const measuredPairDist = useMemo(() => {
    const g1 = BASE_GALAXIES.find((g) => g.id === selectedPair.id1);
    const g2 = BASE_GALAXIES.find((g) => g.id === selectedPair.id2);
    if (!g1 || !g2) return 0;
    const dx = (g2.comovingX - g1.comovingX) * scaleFactorA;
    const dy = (g2.comovingY - g1.comovingY) * scaleFactorA;
    return Math.sqrt(dx * dx + dy * dy);
  }, [selectedPair, scaleFactorA]);

  return (
    <div className="space-y-6">
      {/* Signature Banner */}
      <div className="rounded-2xl border border-red-500/30 bg-gradient-to-r from-red-950/40 via-purple-950/30 to-slate-900/80 p-5 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/30">
                Signature Experience
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                Hubble–Lemaître Space Simulator
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Compass className="size-6 text-red-400" />
              3D Cosmic Expansion Observatory
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Advance cosmic time to watch the fabric of space stretch. Switch your observer
              position to any galaxy to see that there is no center—every observer sees all unbound
              galaxies rushing away!
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-200 border-red-500/40 text-xs font-semibold"
            >
              {isPlaying ? (
                <Pause className="size-3.5 mr-1.5" />
              ) : (
                <Play className="size-3.5 mr-1.5" />
              )}
              {isPlaying ? "Pause Cosmic Time" : "Expand Space"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setScaleFactorA(1.0);
                setIsPlaying(false);
              }}
              className="text-slate-400 hover:text-white text-xs"
            >
              <RotateCcw className="size-3.5 mr-1" /> Reset (Today)
            </Button>
          </div>
        </div>
      </div>

      {/* Main Grid: Galaxy Field Viewport (7 cols) + Hubble Diagram & Controls (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Expanding Galaxy Field Canvas (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative rounded-2xl border border-white/10 bg-slate-950 overflow-hidden shadow-2xl">
            <canvas
              ref={canvasRef}
              width={720}
              height={460}
              className="w-full h-80 sm:h-96 object-cover block cursor-crosshair"
            />

            {/* Canvas HUD */}
            <div className="absolute top-3 left-3 right-3 flex items-start justify-between pointer-events-none">
              <div className="bg-slate-950/80 backdrop-blur-md border border-white/10 rounded-xl px-3.5 py-2">
                <div className="text-[10px] uppercase font-semibold text-red-400">
                  Scale Factor a(t)
                </div>
                <div className="text-base sm:text-lg font-bold font-mono text-white">
                  a = {scaleFactorA.toFixed(2)}
                  <span className="text-xs text-slate-400 ml-1.5 font-normal">
                    {scaleFactorA === 1.0
                      ? "(Present Day)"
                      : scaleFactorA < 1.0
                        ? `(${(scaleFactorA * 100).toFixed(0)}% today's size)`
                        : `(Future ${scaleFactorA.toFixed(2)}x size)`}
                  </span>
                </div>
              </div>

              <div className="bg-slate-950/80 backdrop-blur-md border border-white/10 rounded-xl px-3 py-1.5 text-right font-mono text-xs">
                <div className="text-cyan-400 font-bold">H₀ = {hubbleConstantH0} km/s/Mpc</div>
                <div className="text-slate-400 text-[11px]">
                  Redshift z = {(1 / scaleFactorA - 1).toFixed(2)}
                </div>
              </div>
            </div>

            {/* Bottom Controls inside Canvas */}
            <div className="absolute bottom-3 left-3 right-3 bg-slate-950/85 backdrop-blur-md border border-white/10 rounded-xl p-2.5 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer text-[11px]">
                  <input
                    type="checkbox"
                    checked={showVelocityVectors}
                    onChange={(e) => setShowVelocityVectors(e.target.checked)}
                    className="accent-red-500 rounded"
                  />
                  <span>Recession Vectors (v = H₀d)</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer text-[11px]">
                  <input
                    type="checkbox"
                    checked={showCoordinateGrid}
                    onChange={(e) => setShowCoordinateGrid(e.target.checked)}
                    className="accent-red-500 rounded"
                  />
                  <span>Comoving Grid</span>
                </label>
              </div>

              <div className="text-[11px] font-mono text-amber-300">
                Selected Pair Distance: {measuredPairDist.toFixed(1)} Mpc
              </div>
            </div>
          </div>

          {/* Time & Expansion Slider */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-md space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Clock className="size-3.5 text-red-400" />
                Cosmic Scale Factor a(t) Slider:
              </span>
              <span className="font-mono text-red-400 font-bold">
                a = {scaleFactorA.toFixed(2)} (z = {(1 / scaleFactorA - 1).toFixed(2)})
              </span>
            </div>

            <input
              type="range"
              min={0.25}
              max={1.9}
              step={0.01}
              value={scaleFactorA}
              onChange={(e) => {
                setScaleFactorA(parseFloat(e.target.value));
                setIsPlaying(false);
                if (onInteract) onInteract();
              }}
              className="w-full accent-red-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />

            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>Early Universe (a=0.25, z=3.0)</span>
              <span className="text-white font-bold">Today (a=1.0, z=0.0)</span>
              <span>Future Universe (a=1.9, z=-0.47)</span>
            </div>
          </div>
        </div>

        {/* Right: Hubble Diagram & Observer Vantage Switcher (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Hubble Diagram Chart */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 backdrop-blur-xl space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <span className="font-bold text-white text-sm flex items-center gap-1.5">
                <TrendingUp className="size-4 text-cyan-400" />
                Live Hubble Diagram (v vs d)
              </span>
              <span className="text-[11px] font-mono text-cyan-300 font-semibold">
                Slope = H₀ = {hubbleConstantH0}
              </span>
            </div>

            <div className="relative rounded-xl border border-white/10 bg-slate-950 p-1.5 overflow-hidden">
              <canvas
                ref={hubbleChartRef}
                width={480}
                height={260}
                className="w-full h-auto object-contain block"
              />
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              Every galaxy’s recession velocity is strictly proportional to its distance from the
              observer. Notice that Andromeda has a negative velocity (blueshift) because it is
              gravitationally bound inside the Local Group!
            </p>
          </div>

          {/* Observer Vantage Point Switcher */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 backdrop-blur-xl space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Crosshair className="size-4 text-red-400" />
                Change Observer Reference Frame
              </div>
              <span className="text-[10px] text-slate-400">No Center to Space</span>
            </div>

            <p className="text-xs text-slate-300">
              Pick any galaxy as your home base. Watch how the coordinate system re-centers, proving
              that every observer in the universe sees all other galaxies moving away!
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {BASE_GALAXIES.slice(0, 6).map((g) => (
                <button
                  key={g.id}
                  onClick={() => {
                    setObserverGalaxyId(g.id);
                    if (onInteract) onInteract();
                  }}
                  className={`px-3 py-2 rounded-xl text-left border transition-all text-xs font-semibold flex items-center justify-between ${
                    observerGalaxyId === g.id
                      ? "bg-red-500/20 border-red-500/50 text-white shadow-md shadow-red-950/40"
                      : "bg-slate-950/60 border-white/5 text-slate-400 hover:text-white hover:bg-slate-950"
                  }`}
                >
                  <span className="truncate">{g.name}</span>
                  {observerGalaxyId === g.id && (
                    <span className="size-2 rounded-full bg-red-400 shrink-0 ml-1.5" />
                  )}
                </button>
              ))}
            </div>

            {/* Hubble Constant Adjustment Slider */}
            <div className="pt-2 border-t border-white/5 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Hubble Parameter H₀:</span>
                <span className="font-mono text-cyan-300 font-bold">
                  {hubbleConstantH0} km/s/Mpc
                </span>
              </div>
              <input
                type="range"
                min={55}
                max={85}
                step={0.5}
                value={hubbleConstantH0}
                onChange={(e) => {
                  setHubbleConstantH0(parseFloat(e.target.value));
                  if (onInteract) onInteract();
                }}
                className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>Planck: 67.4</span>
                <span>Standard: 70.0</span>
                <span>SH0ES: 73.04</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
