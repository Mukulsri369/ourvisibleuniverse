import React, { useState, useEffect, useRef, useMemo } from "react";
import type { LearningLevel } from "@/lib/academy/types";
import {
  REAL_EXOPLANET_SYSTEMS,
  type ConfirmedExoplanetSystem,
} from "@/lib/academy/lessons/module-12-exoplanets";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Globe2,
  Orbit,
  Activity,
  Play,
  Pause,
  RotateCcw,
  StepForward,
  Download,
  Info,
  Sparkles,
  Search,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Compass,
  ArrowRight,
  Flame,
  Radio,
  Sliders,
} from "lucide-react";

interface ExoplanetDiscoveryLabProps {
  learningLevel?: LearningLevel;
  onInteraction?: () => void;
}

type LabMode = "transit" | "radial_velocity" | "habitable_zone" | "catalog";

export function ExoplanetDiscoveryLab({
  learningLevel = "explorer",
  onInteraction,
}: ExoplanetDiscoveryLabProps) {
  const [activeMode, setActiveMode] = useState<LabMode>("transit");
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [phase, setPhase] = useState<number>(0); // 0 to 1

  // Transit Parameters
  const [planetRadiusEarth, setPlanetRadiusEarth] = useState<number>(1.2); // Earth radii
  const [starRadiusSolar, setStarRadiusSolar] = useState<number>(1.0); // Solar radii
  const [orbitalPeriodDays, setOrbitalPeriodDays] = useState<number>(10);
  const [impactParameter, setImpactParameter] = useState<number>(0.2); // 0 (center) to 1 (grazing)

  // Radial Velocity Parameters
  const [planetMassEarth, setPlanetMassEarth] = useState<number>(5.0); // Earth masses
  const [starMassSolar, setStarMassSolar] = useState<number>(1.0); // Solar masses
  const [inclinationDeg, setInclinationDeg] = useState<number>(90); // 90 = edge on

  // Habitable Zone Parameters
  const [selectedStarType, setSelectedStarType] = useState<"M" | "K" | "G" | "F">("G");
  const [orbitalDistanceAU, setOrbitalDistanceAU] = useState<number>(1.0);
  const [greenhouseStrength, setGreenhouseStrength] = useState<number>(1.0); // 1 = Earth like

  // Selected Catalog System
  const [selectedSystem, setSelectedSystem] = useState<ConfirmedExoplanetSystem>(
    REAL_EXOPLANET_SYSTEMS[0],
  );

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Notify parent on user interaction
  const triggerInteraction = () => {
    if (onInteraction) onInteraction();
  };

  // Calculations for Transit Photometry
  const transitDepthFraction = useMemo(() => {
    // R_earth / R_sun ≈ 0.00916
    const rpInSolar = (planetRadiusEarth * 0.009167) / starRadiusSolar;
    const depth = Math.pow(rpInSolar, 2);
    return Math.min(depth, 0.25); // cap for safety
  }, [planetRadiusEarth, starRadiusSolar]);

  const transitDepthPpm = useMemo(() => {
    return Math.round(transitDepthFraction * 1_000_000);
  }, [transitDepthFraction]);

  // Radial Velocity Semi-amplitude (m/s)
  // K ≈ 28.4 m/s * (M_p sin i / M_jup) * (M_sun / M_*)^(1/2) * (1 AU / a)^(1/2)
  // 1 M_jup = 317.8 M_earth
  const rvSemiAmplitude = useMemo(() => {
    const sinI = Math.sin((inclinationDeg * Math.PI) / 180);
    const mPInJup = (planetMassEarth * sinI) / 317.8;
    // rough approximation for a from Kepler's third law: a^3 = M_* * (P/365.25)^2
    const pYears = orbitalPeriodDays / 365.25;
    const aAU = Math.max(0.01, Math.cbrt(starMassSolar * Math.pow(pYears, 2)));
    const k = 28.4 * mPInJup * (1 / Math.sqrt(starMassSolar)) * (1 / Math.sqrt(aAU));
    return Math.max(0.05, Math.abs(k));
  }, [planetMassEarth, inclinationDeg, orbitalPeriodDays, starMassSolar]);

  // Star Luminosities by spectral type relative to Sun (L_sun = 1)
  const starLuminosity = useMemo(() => {
    switch (selectedStarType) {
      case "M":
        return 0.005;
      case "K":
        return 0.2;
      case "G":
        return 1.0;
      case "F":
        return 3.0;
    }
  }, [selectedStarType]);

  // Habitable Zone bounds in AU: r_in = sqrt(L / 1.1), r_out = sqrt(L / 0.53)
  const [hzInnerAU, hzOuterAU] = useMemo(() => {
    const rIn = Math.sqrt(starLuminosity / 1.1);
    const rOut = Math.sqrt(starLuminosity / 0.53);
    return [parseFloat(rIn.toFixed(3)), parseFloat(rOut.toFixed(3))];
  }, [starLuminosity]);

  // Planetary Insolation & Surface Temp estimate
  const insolationRelative = useMemo(() => {
    return starLuminosity / Math.pow(orbitalDistanceAU, 2);
  }, [starLuminosity, orbitalDistanceAU]);

  const estimatedTempK = useMemo(() => {
    // Earth T_eq ≈ 255 K without greenhouse; 288 K with greenhouse (dT ≈ +33K * greenhouseStrength)
    const teq = 255 * Math.pow(insolationRelative, 0.25);
    const surfaceT = teq + 33 * greenhouseStrength;
    return Math.round(surfaceT);
  }, [insolationRelative, greenhouseStrength]);

  const habitabilityStatus = useMemo(() => {
    if (orbitalDistanceAU < hzInnerAU) {
      return {
        label: "Too Hot (Runaway Greenhouse)",
        color: "text-rose-400 bg-rose-500/10 border-rose-500/30",
        description:
          "Intense stellar radiation boils surface oceans away into steam, producing a runaway greenhouse inferno like Venus.",
      };
    }
    if (orbitalDistanceAU > hzOuterAU) {
      return {
        label: "Too Cold (Global Glaciation)",
        color: "text-blue-400 bg-blue-500/10 border-blue-500/30",
        description:
          "Weak stellar flux causes all surface water to freeze into an icy snowball crust, unless protected by thick internal geothermal heating.",
      };
    }
    return {
      label: "Habitable Zone (Liquid Water Possible)",
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
      description:
        "Surface temperatures permit stable oceans of liquid water under an Earth-like atmospheric blanket.",
    };
  }, [orbitalDistanceAU, hzInnerAU, hzOuterAU]);

  // Animation Loop
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      if (isPlaying) {
        setPhase((prev) => {
          const increment = (dt * simSpeed * 0.1) / (orbitalPeriodDays / 10);
          return (prev + increment) % 1;
        });
      }

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, simSpeed, orbitalPeriodDays]);

  // Canvas Rendering for Transit / RV / HZ
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = "#030712"; // dark space
    ctx.fillRect(0, 0, width, height);

    // Draw faint stars
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    for (let i = 0; i < 40; i++) {
      const sx = (i * 137) % width;
      const sy = (i * 241) % height;
      ctx.fillRect(sx, sy, 1, 1);
    }

    if (activeMode === "transit") {
      // Split canvas: Top half = Star & Planet Transit View, Bottom half = Light Curve Graph
      const viewHeight = height * 0.55;
      const graphHeight = height * 0.45;
      const centerX = width / 2;
      const centerY = viewHeight / 2;

      // 1. Draw Star
      const starRadiusPx = 55 * starRadiusSolar;
      const starGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        starRadiusPx * 0.1,
        centerX,
        centerY,
        starRadiusPx,
      );
      starGradient.addColorStop(0, "#fffbeb");
      starGradient.addColorStop(0.6, "#f59e0b");
      starGradient.addColorStop(1, "#b45309");

      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, starRadiusPx, 0, Math.PI * 2);
      ctx.fillStyle = starGradient;
      ctx.shadowColor = "#f59e0b";
      ctx.shadowBlur = 30;
      ctx.fill();
      ctx.restore();

      // 2. Planet Position: phase 0 to 1
      // Transit occurs near phase 0.5 (from phase 0.4 to 0.6)
      const orbitX = centerX + Math.cos(phase * Math.PI * 2) * (width * 0.42);
      const orbitY = centerY + (impactParameter - 0.5) * (starRadiusPx * 1.6);
      const isBehindStar = Math.sin(phase * Math.PI * 2) < 0;

      const planetRadiusPx = Math.max(3, planetRadiusEarth * 3.8);

      if (!isBehindStar) {
        // Planet in front of star
        ctx.save();
        ctx.beginPath();
        ctx.arc(orbitX, orbitY, planetRadiusPx, 0, Math.PI * 2);
        ctx.fillStyle = "#0f172a";
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 1.5;
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      // 3. Light Curve Graph in Bottom Half
      const graphTop = viewHeight + 10;
      const graphLeft = 50;
      const graphRight = width - 30;
      const graphBottom = height - 30;
      const graphWidth = graphRight - graphLeft;
      const graphH = graphBottom - graphTop;

      // Draw Graph Box
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 1;
      ctx.strokeRect(graphLeft, graphTop, graphWidth, graphH);

      // Graph Labels
      ctx.fillStyle = "#94a3b8";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText("1.000", graphLeft - 6, graphTop + 10);
      ctx.fillText((1 - transitDepthFraction).toFixed(4), graphLeft - 6, graphBottom - 8);

      ctx.textAlign = "center";
      ctx.fillText("Orbital Phase (0.0 → 1.0)", graphLeft + graphWidth / 2, height - 10);

      // Baseline reference line
      ctx.strokeStyle = "rgba(148, 163, 184, 0.3)";
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(graphLeft, graphTop + 15);
      ctx.lineTo(graphRight, graphTop + 15);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw theoretical light curve line
      ctx.beginPath();
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2.5;

      for (let x = 0; x <= graphWidth; x++) {
        const p = x / graphWidth;
        // Transit centered at phase 0.5
        const distFromCenter = Math.abs(p - 0.5);
        const transitHalfWidth = 0.08;
        let brightness = 1.0;

        if (distFromCenter < transitHalfWidth) {
          // U-shaped dip with limb darkening softening
          const normalizedDist = distFromCenter / transitHalfWidth;
          const factor = Math.cos((normalizedDist * Math.PI) / 2);
          brightness = 1.0 - transitDepthFraction * factor;
        }

        const plotY =
          graphTop +
          15 +
          ((1.0 - brightness) / Math.max(0.001, transitDepthFraction)) * (graphH - 30);
        if (x === 0) ctx.moveTo(graphLeft + x, plotY);
        else ctx.lineTo(graphLeft + x, plotY);
      }
      ctx.stroke();

      // Current Phase Marker on Graph
      const currentX = graphLeft + phase * graphWidth;
      ctx.strokeStyle = "#f43f5e";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(currentX, graphTop);
      ctx.lineTo(currentX, graphBottom);
      ctx.stroke();

      // Marker Dot
      ctx.fillStyle = "#f43f5e";
      ctx.beginPath();
      ctx.arc(currentX, graphTop + 15, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (activeMode === "radial_velocity") {
      // Radial Velocity Simulator: Top half Orbit about barycenter, Bottom half RV Doppler Wave
      const viewHeight = height * 0.52;
      const centerX = width / 2;
      const centerY = viewHeight / 2;

      // Barycenter Orbit
      const starWobbleRadius = Math.max(4, (planetMassEarth / 30) * 12);
      const starX = centerX + Math.cos(phase * Math.PI * 2 + Math.PI) * starWobbleRadius;
      const starY =
        centerY +
        Math.sin(phase * Math.PI * 2 + Math.PI) * starWobbleRadius * (inclinationDeg / 90);

      const planetOrbitRadius = 110;
      const planetX = centerX + Math.cos(phase * Math.PI * 2) * planetOrbitRadius;
      const planetY =
        centerY + Math.sin(phase * Math.PI * 2) * planetOrbitRadius * (inclinationDeg / 90);

      // Barycenter crosshair
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(centerX - 8, centerY);
      ctx.lineTo(centerX + 8, centerY);
      ctx.moveTo(centerX, centerY - 8);
      ctx.lineTo(centerX, centerY + 8);
      ctx.stroke();

      // Orbit paths
      ctx.strokeStyle = "rgba(56, 189, 248, 0.2)";
      ctx.setLineDash([2, 4]);
      ctx.beginPath();
      ctx.ellipse(
        centerX,
        centerY,
        planetOrbitRadius,
        planetOrbitRadius * (inclinationDeg / 90),
        0,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Star with Doppler color tint
      const vRadial = Math.sin(phase * Math.PI * 2); // > 0 = redshift, < 0 = blueshift
      const starColor = vRadial > 0 ? "#f97316" : "#06b6d4"; // red vs blue tint

      ctx.save();
      ctx.beginPath();
      ctx.arc(starX, starY, 26, 0, Math.PI * 2);
      ctx.fillStyle = starColor;
      ctx.shadowColor = starColor;
      ctx.shadowBlur = 20;
      ctx.fill();
      ctx.restore();

      // Draw Planet
      ctx.save();
      ctx.beginPath();
      ctx.arc(planetX, planetY, 7, 0, Math.PI * 2);
      ctx.fillStyle = "#cbd5e1";
      ctx.fill();
      ctx.restore();

      // Radial Velocity Curve in Bottom Half
      const graphTop = viewHeight + 15;
      const graphLeft = 55;
      const graphRight = width - 30;
      const graphBottom = height - 25;
      const graphWidth = graphRight - graphLeft;
      const graphH = graphBottom - graphTop;
      const midY = graphTop + graphH / 2;

      // Axis
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.strokeRect(graphLeft, graphTop, graphWidth, graphH);

      ctx.strokeStyle = "rgba(148, 163, 184, 0.3)";
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(graphLeft, midY);
      ctx.lineTo(graphRight, midY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Y-axis labels
      ctx.fillStyle = "#94a3b8";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(`+${rvSemiAmplitude.toFixed(1)} m/s`, graphLeft - 6, graphTop + 10);
      ctx.fillText("0 m/s", graphLeft - 6, midY + 3);
      ctx.fillText(`-${rvSemiAmplitude.toFixed(1)} m/s`, graphLeft - 6, graphBottom - 5);

      // Draw Sine wave
      ctx.beginPath();
      ctx.strokeStyle = "#a855f7";
      ctx.lineWidth = 2.5;

      for (let x = 0; x <= graphWidth; x++) {
        const p = x / graphWidth;
        const wave = Math.sin(p * Math.PI * 2);
        const y = midY - wave * ((graphH / 2) * 0.85);
        if (x === 0) ctx.moveTo(graphLeft + x, y);
        else ctx.lineTo(graphLeft + x, y);
      }
      ctx.stroke();

      // Current RV Marker
      const currentX = graphLeft + phase * graphWidth;
      const currentWave = Math.sin(phase * Math.PI * 2);
      const currentY = midY - currentWave * ((graphH / 2) * 0.85);

      ctx.strokeStyle = "#f43f5e";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(currentX, graphTop);
      ctx.lineTo(currentX, graphBottom);
      ctx.stroke();

      ctx.fillStyle = "#f43f5e";
      ctx.beginPath();
      ctx.arc(currentX, currentY, 5, 0, Math.PI * 2);
      ctx.fill();
    } else if (activeMode === "habitable_zone") {
      // Circumstellar Habitable Zone Diagram: Star at center, green habitable ring
      const centerX = width / 2;
      const centerY = height / 2;

      // Scale: 1 AU = 120 pixels * (1 / sqrt(starLuminosity)) dynamically adjusted
      const scaleAU = Math.min(220, 160 / Math.max(0.3, Math.sqrt(starLuminosity)));

      const rInnerPx = hzInnerAU * scaleAU;
      const rOuterPx = hzOuterAU * scaleAU;

      // Too Hot Zone (Red inner glow)
      const innerGrad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, rInnerPx);
      innerGrad.addColorStop(0, "rgba(239, 68, 68, 0.45)");
      innerGrad.addColorStop(1, "rgba(239, 68, 68, 0.1)");
      ctx.fillStyle = innerGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, rInnerPx, 0, Math.PI * 2);
      ctx.fill();

      // Habitable Zone (Green Ring)
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, rOuterPx, 0, Math.PI * 2);
      ctx.arc(centerX, centerY, rInnerPx, 0, Math.PI * 2, true);
      ctx.fillStyle = "rgba(16, 185, 129, 0.25)";
      ctx.strokeStyle = "rgba(16, 185, 129, 0.8)";
      ctx.lineWidth = 1.5;
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Frozen Outer Ring
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, Math.max(rOuterPx + 60, width / 2), 0, Math.PI * 2);
      ctx.arc(centerX, centerY, rOuterPx, 0, Math.PI * 2, true);
      ctx.fillStyle = "rgba(59, 130, 246, 0.08)";
      ctx.fill();
      ctx.restore();

      // Host Star at Center
      const starColor =
        selectedStarType === "M"
          ? "#ef4444"
          : selectedStarType === "K"
            ? "#f97316"
            : selectedStarType === "G"
              ? "#eab308"
              : "#38bdf8";

      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, 24, 0, Math.PI * 2);
      ctx.fillStyle = starColor;
      ctx.shadowColor = starColor;
      ctx.shadowBlur = 25;
      ctx.fill();
      ctx.restore();

      // Star Label
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`${selectedStarType}-Type Star`, centerX, centerY + 38);

      // Planet Orbit Path & Position
      const planetOrbitPx = orbitalDistanceAU * scaleAU;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(centerX, centerY, planetOrbitPx, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      const planetX = centerX + Math.cos(phase * Math.PI * 2) * planetOrbitPx;
      const planetY = centerY + Math.sin(phase * Math.PI * 2) * planetOrbitPx;

      ctx.save();
      ctx.beginPath();
      ctx.arc(planetX, planetY, 7, 0, Math.PI * 2);
      ctx.fillStyle = "#38bdf8";
      ctx.shadowColor = "#38bdf8";
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.restore();

      // HZ Labels on Canvas
      ctx.fillStyle = "#34d399";
      ctx.font = "10px sans-serif";
      ctx.fillText(`HZ Inner: ${hzInnerAU} AU`, centerX, centerY - rInnerPx - 6);
      ctx.fillText(`HZ Outer: ${hzOuterAU} AU`, centerX, centerY - rOuterPx - 6);
    }
  }, [
    activeMode,
    phase,
    planetRadiusEarth,
    starRadiusSolar,
    impactParameter,
    transitDepthFraction,
    planetMassEarth,
    starMassSolar,
    inclinationDeg,
    rvSemiAmplitude,
    selectedStarType,
    starLuminosity,
    orbitalDistanceAU,
    hzInnerAU,
    hzOuterAU,
  ]);

  // Export experiment configuration as JSON
  const handleExportConfig = () => {
    const config = {
      experiment: "Exoplanet Discovery & Habitable Worlds Lab",
      mode: activeMode,
      timestamp: new Date().toISOString(),
      transitParameters: {
        planetRadiusEarth,
        starRadiusSolar,
        orbitalPeriodDays,
        impactParameter,
        transitDepthPpm,
      },
      radialVelocityParameters: {
        planetMassEarth,
        starMassSolar,
        inclinationDeg,
        rvSemiAmplitudeMs: rvSemiAmplitude,
      },
      habitableZoneParameters: {
        selectedStarType,
        orbitalDistanceAU,
        greenhouseStrength,
        estimatedTempK,
        habitabilityStatus: habitabilityStatus.label,
      },
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `exoplanet-lab-${activeMode}-config.json`;
    a.click();
    URL.revokeObjectURL(url);
    triggerInteraction();
  };

  return (
    <div className="space-y-6">
      {/* Workbench Header & Mode Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Globe2 className="size-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Exoplanet Discovery Laboratory
              <span className="text-[10px] font-mono uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                Interactive Workbench
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Measure planetary transit dips, track stellar Doppler wobbles, and chart habitable
              zones
            </p>
          </div>
        </div>

        {/* Mode Navigation Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-white/5">
          <button
            onClick={() => {
              setActiveMode("transit");
              triggerInteraction();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeMode === "transit"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Transit Photometry
          </button>
          <button
            onClick={() => {
              setActiveMode("radial_velocity");
              triggerInteraction();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeMode === "radial_velocity"
                ? "bg-purple-500 text-white shadow-md shadow-purple-500/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Radial Velocity
          </button>
          <button
            onClick={() => {
              setActiveMode("habitable_zone");
              triggerInteraction();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeMode === "habitable_zone"
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Habitable Zone
          </button>
          <button
            onClick={() => {
              setActiveMode("catalog");
              triggerInteraction();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeMode === "catalog"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Confirmed Systems
          </button>
        </div>
      </div>

      {/* Main Simulation Viewport and Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Canvas Screen */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          <div className="relative rounded-2xl border border-white/10 bg-slate-950 overflow-hidden shadow-2xl">
            <canvas
              ref={canvasRef}
              width={700}
              height={420}
              className="w-full h-auto block aspect-[700/420]"
            />

            {/* Playback Overlay Controls */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/85 backdrop-blur-md border border-white/10">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
                className="h-7 px-2 text-white hover:bg-white/10"
              >
                {isPlaying ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPhase(0)}
                className="h-7 px-2 text-white hover:bg-white/10"
              >
                <RotateCcw className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPhase((prev) => (prev + 0.05) % 1)}
                className="h-7 px-2 text-white hover:bg-white/10"
              >
                <StepForward className="size-3.5" />
              </Button>
              <div className="h-4 w-px bg-white/20 mx-1" />
              <button
                onClick={() => setSimSpeed(simSpeed === 1 ? 2 : simSpeed === 2 ? 5 : 1)}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-cyan-300 hover:bg-white/20"
              >
                {simSpeed}x
              </button>
            </div>

            {/* Mode-specific Overlay Badge */}
            <div className="absolute bottom-3 left-3 pointer-events-none">
              {activeMode === "transit" && (
                <div className="px-3 py-1.5 rounded-lg bg-slate-900/85 backdrop-blur-md border border-cyan-500/30 text-xs text-slate-200">
                  <span className="text-cyan-400 font-bold">Transit Depth: </span>
                  <span className="font-mono">{transitDepthPpm.toLocaleString()} ppm</span> (
                  {(transitDepthFraction * 100).toFixed(3)}%)
                </div>
              )}
              {activeMode === "radial_velocity" && (
                <div className="px-3 py-1.5 rounded-lg bg-slate-900/85 backdrop-blur-md border border-purple-500/30 text-xs text-slate-200">
                  <span className="text-purple-400 font-bold">Doppler Wobble Amplitude (K): </span>
                  <span className="font-mono">{rvSemiAmplitude.toFixed(2)} m/s</span>
                </div>
              )}
              {activeMode === "habitable_zone" && (
                <div className="px-3 py-1.5 rounded-lg bg-slate-900/85 backdrop-blur-md border border-emerald-500/30 text-xs text-slate-200">
                  <span className="text-emerald-400 font-bold">Surface Equilibrium: </span>
                  <span className="font-mono">~{estimatedTempK} K</span> ({estimatedTempK - 273}°C)
                </div>
              )}
            </div>
          </div>

          {/* Interactive Scientific Explanation Banner */}
          <div className="rounded-xl border border-white/5 bg-slate-900/40 p-4 flex items-start gap-3 text-xs text-slate-300">
            <Info className="size-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              {activeMode === "transit" && (
                <p>
                  <strong className="text-white">Transit Photometry Principle:</strong> The fraction
                  of starlight blocked by a planet is directly proportional to its cross-sectional
                  area:{" "}
                  <span className="font-mono text-cyan-300">ΔF / F = (R_planet / R_star)²</span>. An
                  Earth-sized planet passing in front of a Sun-like star creates an 84 ppm drop in
                  brightness.
                </p>
              )}
              {activeMode === "radial_velocity" && (
                <p>
                  <strong className="text-white">Doppler Spectroscopy Principle:</strong> As star
                  and planet orbit their joint center of mass, the star’s spectral lines periodic
                  shift toward red (receding) and blue (approaching). The velocity wave reveals the
                  planet’s minimum mass:{" "}
                  <span className="font-mono text-purple-300">M_p · sin(i)</span>.
                </p>
              )}
              {activeMode === "habitable_zone" && (
                <p>
                  <strong className="text-white">Circumstellar Habitable Zone:</strong> Boundaries
                  scale with stellar luminosity:{" "}
                  <span className="font-mono text-emerald-300">r_HZ ∝ √L_star</span>. Because red
                  dwarf M-stars emit far less light, their habitable zones are compressed into
                  compact orbits under 0.1 AU.
                </p>
              )}
              {activeMode === "catalog" && (
                <p>
                  <strong className="text-white">Observed Exoplanetary Systems:</strong> Real
                  confirmed data from the NASA Exoplanet Archive, ESO HARPS, and the Kepler/TESS
                  space missions.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right: Parameter Workbench Controls */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Sliders className="size-3.5 text-cyan-400" />
                Physical Parameters
              </h4>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportConfig}
                className="h-7 text-[11px] border-white/10 text-slate-300 hover:text-white"
              >
                <Download className="size-3 mr-1" />
                Export
              </Button>
            </div>

            {/* Mode 1: Transit Parameters */}
            {activeMode === "transit" && (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Planet Radius (R_Earth):</span>
                    <span className="font-mono text-cyan-300 font-bold">
                      {planetRadiusEarth} R⊕
                    </span>
                  </div>
                  <Slider
                    value={[planetRadiusEarth]}
                    min={0.5}
                    max={12}
                    step={0.1}
                    onValueChange={([val]) => {
                      setPlanetRadiusEarth(val);
                      triggerInteraction();
                    }}
                  />
                  <span className="text-[10px] text-slate-500">
                    {planetRadiusEarth < 1.5
                      ? "Rocky Terrestrial"
                      : planetRadiusEarth < 4
                        ? "Super-Earth / Sub-Neptune"
                        : "Gas Giant"}
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Host Star Radius (R_Sun):</span>
                    <span className="font-mono text-amber-300 font-bold">{starRadiusSolar} R☉</span>
                  </div>
                  <Slider
                    value={[starRadiusSolar]}
                    min={0.2}
                    max={2.5}
                    step={0.1}
                    onValueChange={([val]) => {
                      setStarRadiusSolar(val);
                      triggerInteraction();
                    }}
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Orbital Period (Days):</span>
                    <span className="font-mono text-slate-200 font-bold">
                      {orbitalPeriodDays} d
                    </span>
                  </div>
                  <Slider
                    value={[orbitalPeriodDays]}
                    min={1}
                    max={60}
                    step={1}
                    onValueChange={([val]) => {
                      setOrbitalPeriodDays(val);
                      triggerInteraction();
                    }}
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Transit Impact Parameter (b):</span>
                    <span className="font-mono text-slate-200 font-bold">
                      {impactParameter.toFixed(2)}
                    </span>
                  </div>
                  <Slider
                    value={[impactParameter]}
                    min={0}
                    max={0.9}
                    step={0.05}
                    onValueChange={([val]) => {
                      setImpactParameter(val);
                      triggerInteraction();
                    }}
                  />
                  <span className="text-[10px] text-slate-500">
                    {impactParameter < 0.3 ? "Central chord transit" : "Grazing chord transit"}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-xs space-y-1">
                  <div className="text-cyan-400 font-bold">Observable Transit Signal</div>
                  <div className="text-slate-300 flex justify-between">
                    <span>Flux Reduction:</span>
                    <span className="font-mono font-bold text-white">
                      {(transitDepthFraction * 100).toFixed(4)}%
                    </span>
                  </div>
                  <div className="text-slate-300 flex justify-between">
                    <span>Depth in Parts Per Million:</span>
                    <span className="font-mono font-bold text-white">{transitDepthPpm} ppm</span>
                  </div>
                </div>
              </div>
            )}

            {/* Mode 2: Radial Velocity Parameters */}
            {activeMode === "radial_velocity" && (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Planet Mass (M_Earth):</span>
                    <span className="font-mono text-purple-300 font-bold">
                      {planetMassEarth} M⊕
                    </span>
                  </div>
                  <Slider
                    value={[planetMassEarth]}
                    min={0.5}
                    max={350}
                    step={0.5}
                    onValueChange={([val]) => {
                      setPlanetMassEarth(val);
                      triggerInteraction();
                    }}
                  />
                  <span className="text-[10px] text-slate-500">
                    {planetMassEarth < 2
                      ? "Earth-mass world"
                      : planetMassEarth < 15
                        ? "Super-Earth / Neptune"
                        : "Jupiter-mass giant"}
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Host Star Mass (M_Sun):</span>
                    <span className="font-mono text-amber-300 font-bold">{starMassSolar} M☉</span>
                  </div>
                  <Slider
                    value={[starMassSolar]}
                    min={0.1}
                    max={2.5}
                    step={0.1}
                    onValueChange={([val]) => {
                      setStarMassSolar(val);
                      triggerInteraction();
                    }}
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Orbital Inclination Angle:</span>
                    <span className="font-mono text-slate-200 font-bold">{inclinationDeg}°</span>
                  </div>
                  <Slider
                    value={[inclinationDeg]}
                    min={10}
                    max={90}
                    step={1}
                    onValueChange={([val]) => {
                      setInclinationDeg(val);
                      triggerInteraction();
                    }}
                  />
                  <span className="text-[10px] text-slate-500">
                    {inclinationDeg === 90 ? "Edge-on (maximum wobble)" : "Tilted to line of sight"}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs space-y-1">
                  <div className="text-purple-400 font-bold">Stellar Wobble Velocity</div>
                  <div className="text-slate-300 flex justify-between">
                    <span>Semi-Amplitude K:</span>
                    <span className="font-mono font-bold text-white">
                      {rvSemiAmplitude.toFixed(2)} m/s
                    </span>
                  </div>
                  <div className="text-slate-300 flex justify-between">
                    <span>Minimum Mass (M_p sin i):</span>
                    <span className="font-mono font-bold text-white">
                      {(planetMassEarth * Math.sin((inclinationDeg * Math.PI) / 180)).toFixed(1)} M⊕
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Mode 3: Habitable Zone Parameters */}
            {activeMode === "habitable_zone" && (
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-slate-400 block mb-1.5">
                    Host Star Spectral Type:
                  </span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(["M", "K", "G", "F"] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          setSelectedStarType(type);
                          triggerInteraction();
                        }}
                        className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          selectedStarType === type
                            ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                            : "border-white/10 text-slate-400 hover:text-white"
                        }`}
                      >
                        {type}-Star
                      </button>
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Luminosity: {starLuminosity} L☉
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Orbital Distance (AU):</span>
                    <span className="font-mono text-emerald-300 font-bold">
                      {orbitalDistanceAU.toFixed(2)} AU
                    </span>
                  </div>
                  <Slider
                    value={[orbitalDistanceAU]}
                    min={0.02}
                    max={2.5}
                    step={0.01}
                    onValueChange={([val]) => {
                      setOrbitalDistanceAU(val);
                      triggerInteraction();
                    }}
                  />
                  <span className="text-[10px] text-slate-500">
                    Habitable Zone: {hzInnerAU} – {hzOuterAU} AU
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Atmosphere Greenhouse Factor:</span>
                    <span className="font-mono text-slate-200 font-bold">
                      {greenhouseStrength.toFixed(1)}x
                    </span>
                  </div>
                  <Slider
                    value={[greenhouseStrength]}
                    min={0}
                    max={3}
                    step={0.1}
                    onValueChange={([val]) => {
                      setGreenhouseStrength(val);
                      triggerInteraction();
                    }}
                  />
                  <span className="text-[10px] text-slate-500">
                    {greenhouseStrength === 0
                      ? "Airless vacuum (Moon-like)"
                      : greenhouseStrength === 1
                        ? "1.0x (Earth nitrogen-oxygen)"
                        : "Thick CO2 greenhouse (Venus-like)"}
                  </span>
                </div>

                <div
                  className={`p-3 rounded-xl border text-xs space-y-1.5 ${habitabilityStatus.color}`}
                >
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5" />
                    {habitabilityStatus.label}
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-300">
                    {habitabilityStatus.description}
                  </p>
                </div>
              </div>
            )}

            {/* Mode 4: Confirmed Exoplanet Catalog */}
            {activeMode === "catalog" && (
              <div className="space-y-3">
                <span className="text-xs text-slate-400 block mb-1">
                  Select a Benchmark Real Exoplanet System:
                </span>
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {REAL_EXOPLANET_SYSTEMS.map((system) => (
                    <button
                      key={system.id}
                      onClick={() => {
                        setSelectedSystem(system);
                        triggerInteraction();
                        // Load primary planet into parameters
                        const p0 = system.planets[0];
                        if (p0) {
                          setPlanetRadiusEarth(p0.radiusEarth);
                          setPlanetMassEarth(p0.massEarth);
                          setOrbitalPeriodDays(Math.max(1, Math.round(p0.periodDays)));
                          setOrbitalDistanceAU(p0.semiMajorAxisAU);
                          setSelectedStarType(system.spectralType);
                        }
                      }}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all ${
                        selectedSystem.id === system.id
                          ? "bg-amber-500/15 border-amber-500/40 text-white"
                          : "border-white/5 bg-white/[0.02] text-slate-300 hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span>{system.name}</span>
                        <span className="text-[10px] font-mono text-amber-300">
                          {system.discoveryMethod}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {system.planets.length} planet{system.planets.length > 1 ? "s" : ""} •{" "}
                        {system.distanceLy} ly away
                      </div>
                    </button>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 text-xs space-y-1.5">
                  <div className="text-amber-400 font-bold">{selectedSystem.hostStar}</div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {selectedSystem.description}
                  </p>
                  <div className="text-[10px] text-slate-400 pt-1 border-t border-white/5">
                    Discovered: {selectedSystem.discoveryYear} via {selectedSystem.observatory}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
