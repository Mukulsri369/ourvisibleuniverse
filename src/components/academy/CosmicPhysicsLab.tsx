import React, { useState, useRef, useEffect, useMemo } from "react";
import type { LearningLevel } from "@/lib/academy/types";
import {
  LAB_DEFINITIONS,
  FINAL_CHALLENGE_STEPS,
  MODULE_24_QUIZ,
  type LabDefinition,
} from "@/lib/academy/lessons/module-24-cosmic-lab";
import { CosmicCertificateModal } from "./CosmicCertificateModal";
import {
  Orbit,
  Disc,
  Flame,
  Activity,
  Maximize2,
  Sun,
  Compass,
  Sparkles,
  Rocket,
  Award,
  Play,
  Pause,
  RotateCcw,
  StepForward,
  Share2,
  Copy,
  Check,
  Download,
  AlertTriangle,
  Info,
  Layers,
  ChevronRight,
  ShieldCheck,
  Eye,
  Settings2,
  Atom,
  HelpCircle,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CosmicPhysicsLabProps {
  level: LearningLevel;
  onInteract?: () => void;
  onCompleteModule?: () => void;
}

export const CosmicPhysicsLab: React.FC<CosmicPhysicsLabProps> = ({
  level,
  onInteract,
  onCompleteModule,
}) => {
  // Navigation State
  const [activeLabIndex, setActiveLabIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [simStep, setSimStep] = useState<number>(0);
  const [completedLabs, setCompletedLabs] = useState<Set<string>>(new Set(["lab-1-solar-system"]));
  const [isCopiedConfig, setIsCopiedConfig] = useState<boolean>(false);
  const [isCertOpen, setIsCertOpen] = useState<boolean>(false);

  // Final Challenge State
  const [challengeStepIndex, setChallengeStepIndex] = useState<number>(0);
  const [challengeInput, setChallengeInput] = useState<string>("");
  const [challengeSolvedSteps, setChallengeSolvedSteps] = useState<Set<number>>(new Set());
  const [challengeFeedback, setChallengeFeedback] = useState<{
    status: "correct" | "incorrect" | "idle";
    message: string;
  }>({ status: "idle", message: "" });

  const activeLab = LAB_DEFINITIONS[activeLabIndex];

  // =========================================================================
  // LAB 1 STATE: Solar System Sandbox
  // =========================================================================
  const [starMass, setStarMass] = useState<number>(1.0); // M_sun
  const [planets, setPlanets] = useState<
    {
      id: string;
      name: string;
      distAU: number;
      massEarth: number;
      velFactor: number;
      color: string;
    }[]
  >([
    { id: "p1", name: "Alpha", distAU: 0.7, massEarth: 1.0, velFactor: 1.0, color: "#38bdf8" },
    { id: "p2", name: "Beta", distAU: 1.4, massEarth: 5.0, velFactor: 1.0, color: "#fbbf24" },
    { id: "p3", name: "Gamma", distAU: 2.8, massEarth: 15.0, velFactor: 1.0, color: "#c084fc" },
  ]);

  // =========================================================================
  // LAB 2 STATE: Build a Galaxy
  // =========================================================================
  const [bulgeMass, setBulgeMass] = useState<number>(1.5); // 10^10 M_sun
  const [diskMass, setDiskMass] = useState<number>(5.0); // 10^10 M_sun
  const [gasFraction, setGasFraction] = useState<number>(0.15); // 15% gas
  const [hasDarkMatter, setHasDarkMatter] = useState<boolean>(true);
  const [haloMass, setHaloMass] = useState<number>(75.0); // 10^10 M_sun

  // =========================================================================
  // LAB 3 STATE: Stellar Evolution
  // =========================================================================
  const [stellarMass, setStellarMass] = useState<number>(1.0); // 0.1 to 60 M_sun
  const [stellarMetallicity, setStellarMetallicity] = useState<"low" | "solar" | "high">("solar");

  // =========================================================================
  // LAB 4 STATE: Galaxy Collision
  // =========================================================================
  const [galaxyMassRatio, setGalaxyMassRatio] = useState<number>(1.0); // 1:1 to 1:5
  const [impactParameter, setImpactParameter] = useState<number>(30); // kpc
  const [approachSpeed, setApproachSpeed] = useState<number>(250); // km/s
  const [collisionAngle, setCollisionAngle] = useState<number>(30); // degrees

  // =========================================================================
  // LAB 5 STATE: Black Hole Experiment
  // =========================================================================
  const [blackHoleMass, setBlackHoleMass] = useState<number>(10); // Solar masses (or supermassive)
  const [isSupermassive, setIsSupermassive] = useState<boolean>(false);
  const [testParticleDist, setTestParticleDist] = useState<number>(4.0); // in r_s
  const [showPhotonSphere, setShowPhotonSphere] = useState<boolean>(true);
  const [showISCO, setShowISCO] = useState<boolean>(true);

  // =========================================================================
  // LAB 6 STATE: Light & Spectra
  // =========================================================================
  const [spectralTempK, setSpectralTempK] = useState<number>(5778); // Sun = 5778 K
  const [redshiftZ, setRedshiftZ] = useState<number>(0.0); // 0.0 to 0.5
  const [selectedElement, setSelectedElement] = useState<
    "hydrogen" | "helium" | "sodium" | "calcium"
  >("hydrogen");

  // =========================================================================
  // LAB 7 STATE: Exoplanet Discovery
  // =========================================================================
  const [exoplanetRadiusEarth, setExoplanetRadiusEarth] = useState<number>(4.0); // 1 to 12 R_earth
  const [exoplanetOrbitalAU, setExoplanetOrbitalAU] = useState<number>(0.8); // AU
  const [exoplanetInclination, setExoplanetInclination] = useState<number>(89.5); // degrees
  const [exoplanetDetectionMethod, setExoplanetDetectionMethod] = useState<
    "transit" | "radial_velocity"
  >("transit");

  // =========================================================================
  // LAB 8 STATE: Cosmic Expansion
  // =========================================================================
  const [omegaMatter, setOmegaMatter] = useState<number>(0.31);
  const [omegaLambda, setOmegaLambda] = useState<number>(0.69);
  const [hubbleConstant, setHubbleConstant] = useState<number>(67.4);

  // =========================================================================
  // LAB 9 STATE: Space Mission Design
  // =========================================================================
  const [targetDestination, setTargetDestination] = useState<"Moon" | "Mars" | "Venus" | "Jupiter">(
    "Mars",
  );
  const [propellantIsp, setPropellantIsp] = useState<number>(380); // seconds (Hydrolox or Methane)
  const [payloadMassKg, setPayloadMassKg] = useState<number>(1500); // kg

  // =========================================================================
  // LAB 10 STATE: Academy Master Quiz
  // =========================================================================
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // Mark interactive engagement
  const handleLabInteraction = (labId: string) => {
    if (onInteract) onInteract();
    setCompletedLabs((prev) => new Set([...prev, labId]));
  };

  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Animation Loop for Physics Renderers
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setSimStep((prev) => prev + 1);
    }, 40);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Handle Export / Copy Configuration
  const handleExportConfig = () => {
    const config = {
      labId: activeLab.id,
      labTitle: activeLab.title,
      parameters: {
        starMass,
        planets,
        bulgeMass,
        diskMass,
        hasDarkMatter,
        haloMass,
        stellarMass,
        galaxyMassRatio,
        impactParameter,
        blackHoleMass,
        spectralTempK,
        redshiftZ,
        exoplanetRadiusEarth,
        omegaMatter,
        omegaLambda,
        targetDestination,
      },
      exportedAt: new Date().toISOString(),
    };
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    setIsCopiedConfig(true);
    setTimeout(() => setIsCopiedConfig(false), 2500);
  };

  // -------------------------------------------------------------------------
  // Final Challenge Validator
  // -------------------------------------------------------------------------
  const currentChallenge = FINAL_CHALLENGE_STEPS[challengeStepIndex];

  const handleValidateChallenge = () => {
    const val = parseFloat(challengeInput);
    if (isNaN(val)) {
      setChallengeFeedback({
        status: "incorrect",
        message: "Please enter a valid numeric value.",
      });
      return;
    }

    const { target, tolerance, unit } = currentChallenge.targetValues;
    const diff = Math.abs(val - target);
    if (diff <= tolerance) {
      setChallengeFeedback({
        status: "correct",
        message: `Outstanding! ${val} ${unit} matches within physical tolerance (expected ~${target} ${unit}).`,
      });
      setChallengeSolvedSteps((prev) => new Set([...prev, challengeStepIndex]));
      handleLabInteraction("lab-final-challenge");
    } else {
      setChallengeFeedback({
        status: "incorrect",
        message: `Not quite. Your calculation gave ${val} ${unit}, but expected ~${target} ${unit} (±${tolerance}). Review the hints and equations!`,
      });
    }
  };

  // -------------------------------------------------------------------------
  // 2D CANVAS RENDERER FOR ACTIVE LAB
  // -------------------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Dark cosmic background with grid
    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, width, height);

    // Subtle coordinate grid
    ctx.strokeStyle = "rgba(56, 189, 248, 0.08)";
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const centerX = width / 2;
    const centerY = height / 2;

    // RENDER ACCORDING TO ACTIVE LAB
    if (activeLabIndex === 0) {
      // LAB 1: Solar System N-Body Simulation
      // Central Star
      const starRadius = Math.max(10, Math.min(26, 14 * Math.sqrt(starMass)));
      const starGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        starRadius * 2,
      );
      starGrad.addColorStop(0, "#ffffff");
      starGrad.addColorStop(0.3, "#fef08a");
      starGrad.addColorStop(0.7, "#f59e0b");
      starGrad.addColorStop(1, "rgba(245, 158, 11, 0)");
      ctx.fillStyle = starGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, starRadius * 2, 0, Math.PI * 2);
      ctx.fill();

      // Planets Orbiting
      planets.forEach((p, idx) => {
        const scaleAU = 70;
        const orbitRadius = p.distAU * scaleAU;

        // Draw orbit path
        ctx.strokeStyle = `${p.color}33`;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(centerX, centerY, orbitRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Orbital speed via Kepler's 3rd: omega = sqrt(GM / r^3)
        const omega = Math.sqrt((starMass * 1000) / Math.pow(orbitRadius, 3)) * p.velFactor;
        const angle = simStep * 0.03 * omega + (idx * Math.PI * 2) / 3;

        const px = centerX + Math.cos(angle) * orbitRadius;
        const py = centerY + Math.sin(angle) * orbitRadius;

        // Draw Velocity Vector
        if (level !== "junior") {
          const vx = -Math.sin(angle) * 20 * p.velFactor;
          const vy = Math.cos(angle) * 20 * p.velFactor;
          ctx.strokeStyle = "#38bdf8";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px + vx, py + vy);
          ctx.stroke();
        }

        // Draw Planet Body
        const pSize = Math.max(4, Math.min(12, 3 + Math.log2(p.massEarth + 1)));
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(px, py, pSize, 0, Math.PI * 2);
        ctx.fill();

        // Planet Label
        ctx.fillStyle = "#ffffff";
        ctx.font = "10px sans-serif";
        ctx.fillText(p.name, px + pSize + 4, py + 3);
      });
    } else if (activeLabIndex === 1) {
      // LAB 2: Build a Galaxy (Rotation & Spiral Disk)
      const numStars = 220;
      for (let i = 0; i < numStars; i++) {
        const seedR = (i / numStars) * 160 + 15;
        // Circular speed formula: v_circ = sqrt(v_baryon^2 + v_halo^2)
        const vBaryon = Math.sqrt(
          (bulgeMass * 500) / (seedR + 10) + (diskMass * 1500) / (seedR + 25),
        );
        const vHalo = hasDarkMatter
          ? Math.sqrt((haloMass * 2200 * seedR) / (seedR * seedR + 600))
          : 0;
        const vTotal = Math.sqrt(vBaryon * vBaryon + vHalo * vHalo);

        const angularSpeed = vTotal / (seedR * 35);
        const baseAngle = i * 2.39996; // Golden angle spiral
        const currentAngle = baseAngle + simStep * 0.02 * angularSpeed;

        const sx = centerX + Math.cos(currentAngle) * seedR;
        const sy = centerY + Math.sin(currentAngle) * (seedR * 0.65); // inclined view

        ctx.fillStyle = i < 30 ? "#fef08a" : i % 3 === 0 ? "#38bdf8" : "#e2e8f0";
        ctx.beginPath();
        ctx.arc(sx, sy, i < 30 ? 2 : 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Bulge Glow in center
      const bulgeGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 30);
      bulgeGrad.addColorStop(0, "rgba(254, 240, 138, 0.8)");
      bulgeGrad.addColorStop(1, "rgba(254, 240, 138, 0)");
      ctx.fillStyle = bulgeGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
      ctx.fill();
    } else if (activeLabIndex === 3) {
      // LAB 4: Galaxy Collision
      const t = (simStep % 200) / 200; // normalized time 0 to 1
      const g1x = centerX - 120 + t * 160;
      const g1y = centerY - 40 + t * 40;
      const g2x = centerX + 120 - t * 160;
      const g2y = centerY + 40 - t * 40;

      // Draw Galaxy 1 (Primary)
      ctx.fillStyle = "rgba(56, 189, 248, 0.4)";
      ctx.beginPath();
      ctx.arc(g1x, g1y, 35, 0, Math.PI * 2);
      ctx.fill();

      // Draw Galaxy 2 (Secondary)
      const g2Radius = 35 / Math.sqrt(galaxyMassRatio);
      ctx.fillStyle = "rgba(245, 158, 11, 0.4)";
      ctx.beginPath();
      ctx.arc(g2x, g2y, g2Radius, 0, Math.PI * 2);
      ctx.fill();

      // Tidal tail streamer particles
      const tailCount = 80;
      for (let j = 0; j < tailCount; j++) {
        const frac = j / tailCount;
        const tailOffset = (frac - 0.5) * 80 * t;
        const tx = g1x - 30 * Math.sin(frac * 4 + t * 5) - tailOffset;
        const ty = g1y + 20 * Math.cos(frac * 3) + tailOffset * 0.5;
        ctx.fillStyle = "rgba(147, 197, 253, 0.6)";
        ctx.fillRect(tx, ty, 2, 2);
      }
    } else if (activeLabIndex === 4) {
      // LAB 5: Black Hole Spacetime
      const rsPixels = isSupermassive ? 35 : 18;

      // Accretion Disk Glow
      const diskGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        rsPixels,
        centerX,
        centerY,
        rsPixels * 4.5,
      );
      diskGrad.addColorStop(0, "rgba(255, 255, 255, 0.9)");
      diskGrad.addColorStop(0.2, "rgba(56, 189, 248, 0.7)");
      diskGrad.addColorStop(0.6, "rgba(245, 158, 11, 0.4)");
      diskGrad.addColorStop(1, "rgba(234, 88, 12, 0)");
      ctx.fillStyle = diskGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, rsPixels * 4.5, 0, Math.PI * 2);
      ctx.fill();

      // ISCO Ring (3 r_s)
      if (showISCO) {
        ctx.strokeStyle = "rgba(56, 189, 248, 0.5)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(centerX, centerY, rsPixels * 3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Photon Sphere (1.5 r_s)
      if (showPhotonSphere) {
        ctx.strokeStyle = "rgba(245, 158, 11, 0.7)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.arc(centerX, centerY, rsPixels * 1.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Event Horizon (Schwarzschild Radius)
      ctx.fillStyle = "#000000";
      ctx.beginPath();
      ctx.arc(centerX, centerY, rsPixels, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Test particle geodesic orbit with GR precession
      const pR = rsPixels * testParticleDist;
      const pAngle = simStep * (15 / (testParticleDist * Math.sqrt(testParticleDist)));
      const ppx = centerX + Math.cos(pAngle) * pR;
      const ppy = centerY + Math.sin(pAngle) * pR;

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(ppx, ppy, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (activeLabIndex === 6) {
      // LAB 7: Exoplanet Transit Photometry
      const starR = 50;
      const planetR = Math.max(4, Math.min(22, exoplanetRadiusEarth * 3.5));

      // Central Star with Limb Darkening
      const starGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, starR);
      starGrad.addColorStop(0, "#fffbeb");
      starGrad.addColorStop(0.7, "#fde047");
      starGrad.addColorStop(1, "#ca8a04");
      ctx.fillStyle = starGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, starR, 0, Math.PI * 2);
      ctx.fill();

      // Orbiting Planet Path
      const periodSteps = 160;
      const phase = (simStep % periodSteps) / periodSteps;
      const transitX = centerX - 120 + phase * 240;
      const isFront = phase > 0.25 && phase < 0.75;
      const isTransiting = Math.abs(transitX - centerX) < starR + planetR && isFront;

      if (isFront) {
        ctx.fillStyle = "#0f172a";
        ctx.beginPath();
        ctx.arc(transitX, centerY, planetR, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = isTransiting ? "#38bdf8" : "#64748b";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }
  }, [
    activeLabIndex,
    simStep,
    starMass,
    planets,
    bulgeMass,
    diskMass,
    hasDarkMatter,
    haloMass,
    galaxyMassRatio,
    isSupermassive,
    testParticleDist,
    showPhotonSphere,
    showISCO,
    exoplanetRadiusEarth,
    level,
  ]);

  // Derived Physics Calculations for Readouts
  const stellarLifetimeGyr = useMemo(() => {
    return (10 * Math.pow(stellarMass, -2.5)).toFixed(2);
  }, [stellarMass]);

  const stellarFate = useMemo(() => {
    if (stellarMass < 0.08) return "Brown Dwarf (Incapable of sustaining core hydrogen fusion)";
    if (stellarMass < 0.45) return "Helium White Dwarf (Trillion-year convective lifetime)";
    if (stellarMass <= 8) return "Carbon-Oxygen White Dwarf + Planetary Nebula (remnant ≤ 1.4 M☉)";
    if (stellarMass <= 25)
      return "Type II Supernova → Neutron Star / Pulsar (remnant ~1.4 - 2.1 M☉)";
    return "Type Ib/c or Pair-Instability Supernova → Stellar-Mass Black Hole";
  }, [stellarMass]);

  const transitDepthPercent = useMemo(() => {
    // Delta F / F = (R_p / R_star)^2
    // 1 R_sun = 109.2 R_earth
    const rStarEarth = 109.2;
    const depth = Math.pow(exoplanetRadiusEarth / rStarEarth, 2) * 100;
    return depth.toFixed(3);
  }, [exoplanetRadiusEarth]);

  const rvAmplitudeMs = useMemo(() => {
    // Semi-amplitude K in m/s ~ 28.4 m/s * (M_p sin i / M_jup) * (a / 1 AU)^(-1/2) * (M_star / M_sun)^(-1/2)
    const mPlanetJup =
      (exoplanetRadiusEarth > 6 ? 1.0 : 0.05) * Math.pow(exoplanetRadiusEarth / 11.2, 3);
    const k = 28.4 * mPlanetJup * (1 / Math.sqrt(Math.max(0.1, exoplanetOrbitalAU)));
    return k.toFixed(1);
  }, [exoplanetRadiusEarth, exoplanetOrbitalAU]);

  const wienPeakNm = useMemo(() => {
    // lambda_max = 2.898e6 nm*K / T
    return Math.round(2897772 / spectralTempK);
  }, [spectralTempK]);

  const hohmannDeltaV = useMemo(() => {
    // Patch conic transfer from Earth to destination
    const rEarth = 1.0;
    let rTarget = 1.524; // Mars
    if (targetDestination === "Moon") rTarget = 1.0026;
    if (targetDestination === "Venus") rTarget = 0.723;
    if (targetDestination === "Jupiter") rTarget = 5.204;

    const muSun = 132712440018; // km^3/s^2 (converted for AU scaling)
    const vEarth = 29.78; // km/s
    const aTrans = (rEarth + rTarget) / 2;
    const vPeri = vEarth * Math.sqrt((2 * rTarget) / (rEarth + rTarget));
    const dv1 = Math.abs(vPeri - vEarth);
    return dv1.toFixed(2);
  }, [targetDestination]);

  return (
    <div className="space-y-6">
      {/* Top Laboratory Selector Strip */}
      <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-3 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between gap-3 mb-2 px-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
              Capstone Research Suites
            </span>
            <span className="text-xs text-slate-400">• 10 Integrated Physics Laboratories</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-emerald-400 font-mono">
              Labs Active: {completedLabs.size}/10
            </span>
            <Button
              size="sm"
              onClick={() => setIsCertOpen(true)}
              className="h-7 text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
            >
              <Award className="size-3.5 mr-1" />
              Certificate
            </Button>
          </div>
        </div>

        {/* Lab Buttons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {LAB_DEFINITIONS.map((lab, index) => {
            const isActive = activeLabIndex === index;
            const isDone = completedLabs.has(lab.id);
            return (
              <button
                key={lab.id}
                onClick={() => {
                  setActiveLabIndex(index);
                  handleLabInteraction(lab.id);
                }}
                className={`p-2.5 rounded-xl text-left transition flex flex-col justify-between border text-xs relative ${
                  isActive
                    ? "bg-slate-800 border-amber-500/50 shadow-md shadow-amber-500/10 text-white"
                    : "bg-slate-950/60 border-white/5 hover:border-white/20 text-slate-400 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="font-mono text-[10px] text-amber-400/80 font-bold">
                    LAB {lab.number}
                  </span>
                  {isDone && <Check className="size-3 text-emerald-400" />}
                </div>
                <div className="font-semibold text-slate-200 truncate">{lab.title}</div>
                <div className="text-[10px] text-slate-500 truncate">{lab.category}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Laboratory Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visualizer & Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
            {/* Visualizer Header */}
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                  LAB {activeLab.number} • {activeLab.category.toUpperCase()}
                </span>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  {activeLab.title}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="h-8 border-slate-700 text-slate-200 hover:bg-slate-800"
                >
                  {isPlaying ? (
                    <Pause className="size-3.5 mr-1" />
                  ) : (
                    <Play className="size-3.5 mr-1" />
                  )}
                  {isPlaying ? "Pause" : "Play"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSimStep((prev) => prev + 10)}
                  className="h-8 border-slate-700 text-slate-200 hover:bg-slate-800"
                  title="Step Simulation Forward"
                >
                  <StepForward className="size-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSimStep(0)}
                  className="h-8 border-slate-700 text-slate-200 hover:bg-slate-800"
                  title="Reset Simulation"
                >
                  <RotateCcw className="size-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportConfig}
                  className="h-8 border-slate-700 text-slate-200 hover:bg-slate-800"
                  title="Export Experiment Config"
                >
                  {isCopiedConfig ? (
                    <Check className="size-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                </Button>
              </div>
            </div>

            {/* Canvas or Custom Viewport */}
            <div className="relative rounded-xl overflow-hidden border border-white/10 bg-slate-950 flex items-center justify-center min-h-[340px]">
              {activeLabIndex === 2 ? (
                // LAB 3: Stellar Evolution Interactive HR Diagram
                <div className="w-full h-full p-4 flex flex-col justify-between text-xs">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2 text-slate-300">
                    <span className="font-semibold text-amber-400">
                      Hertzsprung-Russell Evolutionary Track
                    </span>
                    <span className="font-mono">Mass: {stellarMass} M☉</span>
                  </div>
                  <div className="my-6 space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-white/5">
                        <div className="text-[10px] text-slate-400">Main-Seq Lifetime</div>
                        <div className="text-sm font-mono font-bold text-cyan-400">
                          {stellarLifetimeGyr} Gyr
                        </div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-white/5">
                        <div className="text-[10px] text-slate-400">Peak Core Burning</div>
                        <div className="text-sm font-mono font-bold text-amber-400">
                          {stellarMass > 8
                            ? "Silicon → Iron"
                            : stellarMass > 0.5
                              ? "Triple-Alpha (He)"
                              : "p-p Chain (H)"}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-white/5">
                        <div className="text-[10px] text-slate-400">Remnant Core</div>
                        <div className="text-sm font-mono font-bold text-emerald-400">
                          {stellarMass > 25
                            ? "Black Hole"
                            : stellarMass > 8
                              ? "Neutron Star"
                              : "White Dwarf"}
                        </div>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-900/80 border border-white/10 text-slate-300">
                      <div className="font-semibold text-white mb-1">Evolutionary Outcome:</div>
                      <p className="text-slate-400">{stellarFate}</p>
                    </div>
                  </div>
                </div>
              ) : activeLabIndex === 5 ? (
                // LAB 6: Light & Spectra Visualizer
                <div className="w-full h-full p-4 flex flex-col justify-between text-xs">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2 text-slate-300">
                    <span className="font-semibold text-amber-400">
                      Blackbody Continuum & Spectral Absorption Barcode
                    </span>
                    <span className="font-mono">
                      T = {spectralTempK} K • z = {redshiftZ}
                    </span>
                  </div>
                  {/* Colorful Barcode Spectrograph */}
                  <div className="my-6 space-y-4">
                    <div className="h-14 rounded-lg overflow-hidden border border-white/20 relative shadow-inner flex">
                      <div className="w-full h-full bg-gradient-to-r from-violet-600 via-blue-500 via-green-500 via-yellow-400 to-red-600 relative">
                        {/* Characteristic Absorption lines shifted by z */}
                        <div
                          className="absolute top-0 bottom-0 w-1 bg-black shadow-sm"
                          style={{ left: `${Math.min(95, 25 * (1 + redshiftZ))}%` }}
                          title="H-beta (486.1 nm)"
                        />
                        <div
                          className="absolute top-0 bottom-0 w-1.5 bg-black shadow-sm"
                          style={{ left: `${Math.min(95, 78 * (1 + redshiftZ))}%` }}
                          title="H-alpha (656.3 nm)"
                        />
                        <div
                          className="absolute top-0 bottom-0 w-1 bg-black shadow-sm"
                          style={{ left: `${Math.min(95, 58 * (1 + redshiftZ))}%` }}
                          title="Sodium D (589 nm)"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-white/5">
                        <div className="text-[10px] text-slate-400">
                          Wien Peak Wavelength (λ_max)
                        </div>
                        <div className="text-sm font-mono font-bold text-cyan-400">
                          {wienPeakNm} nm
                        </div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-white/5">
                        <div className="text-[10px] text-slate-400">
                          Observed H-alpha (rest 656.3 nm)
                        </div>
                        <div className="text-sm font-mono font-bold text-amber-400">
                          {(656.3 * (1 + redshiftZ)).toFixed(1)} nm
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeLabIndex === 7 ? (
                // LAB 8: Cosmic Expansion & Friedmann Scale Factor
                <div className="w-full h-full p-4 flex flex-col justify-between text-xs">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2 text-slate-300">
                    <span className="font-semibold text-amber-400">
                      Friedmann Scale Factor Evolution a(t)
                    </span>
                    <span className="font-mono">
                      Ω_m = {omegaMatter} • Ω_Λ = {omegaLambda}
                    </span>
                  </div>
                  <div className="my-6 space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-white/5">
                        <div className="text-[10px] text-slate-400">Total Density (Ω_tot)</div>
                        <div className="text-sm font-mono font-bold text-cyan-400">
                          {(omegaMatter + omegaLambda).toFixed(2)}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-white/5">
                        <div className="text-[10px] text-slate-400">Geometry</div>
                        <div className="text-sm font-mono font-bold text-emerald-400">
                          {Math.abs(omegaMatter + omegaLambda - 1.0) < 0.02
                            ? "Flat (k = 0)"
                            : omegaMatter + omegaLambda > 1.0
                              ? "Closed (k = +1)"
                              : "Open (k = -1)"}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-white/5">
                        <div className="text-[10px] text-slate-400">Cosmic Destiny</div>
                        <div className="text-sm font-mono font-bold text-amber-400">
                          {omegaLambda > 0.4 ? "Accelerating Big Freeze" : "Decelerating Expansion"}
                        </div>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-900/80 border border-white/10 text-slate-300">
                      <p className="text-slate-400 leading-relaxed">
                        Under benchmark ΛCDM (Planck 2018), dark energy accounts for ~69% of the
                        universe, causing cosmic expansion to accelerate indefinitely into a cold,
                        dilated Big Freeze.
                      </p>
                    </div>
                  </div>
                </div>
              ) : activeLabIndex === 8 ? (
                // LAB 9: Space Mission Hohmann Transfer
                <div className="w-full h-full p-4 flex flex-col justify-between text-xs">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2 text-slate-300">
                    <span className="font-semibold text-amber-400">
                      Hohmann Transfer Trajectory Planner
                    </span>
                    <span className="font-mono">Earth → {targetDestination}</span>
                  </div>
                  <div className="my-6 space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-white/5">
                        <div className="text-[10px] text-slate-400">Departure Injection (Δv₁)</div>
                        <div className="text-sm font-mono font-bold text-cyan-400">
                          {hohmannDeltaV} km/s
                        </div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-white/5">
                        <div className="text-[10px] text-slate-400">Flight Duration</div>
                        <div className="text-sm font-mono font-bold text-amber-400">
                          {targetDestination === "Mars"
                            ? "259 Days"
                            : targetDestination === "Venus"
                              ? "146 Days"
                              : targetDestination === "Moon"
                                ? "3.2 Days"
                                : "2.7 Years"}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-white/5">
                        <div className="text-[10px] text-slate-400">Payload Mass</div>
                        <div className="text-sm font-mono font-bold text-emerald-400">
                          {payloadMassKg} kg
                        </div>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-900/80 border border-white/10 text-slate-300">
                      <p className="text-slate-400 leading-relaxed">
                        Hohmann trajectories maximize propellant economy by burning at periapsis and
                        apoapsis collinear with the planetary velocity vectors.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <canvas
                  ref={canvasRef}
                  width={560}
                  height={340}
                  className="w-full h-auto max-h-[340px] object-contain"
                />
              )}
            </div>

            {/* Interactive Physical Parameter Sliders */}
            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <Settings2 className="size-4" />
                  Adjustable Physical Parameters
                </span>
                <span className="text-slate-400 font-mono text-[11px]">
                  Real-time Numerical Coupling
                </span>
              </div>

              {activeLabIndex === 0 && (
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>Central Star Mass (M☉)</span>
                      <span className="font-mono text-white font-bold">{starMass} M☉</span>
                    </div>
                    <input
                      type="range"
                      min={0.2}
                      max={3.0}
                      step={0.1}
                      value={starMass}
                      onChange={(e) => {
                        setStarMass(parseFloat(e.target.value));
                        handleLabInteraction(activeLab.id);
                      }}
                      className="w-full accent-amber-400"
                    />
                  </div>
                </div>
              )}

              {activeLabIndex === 1 && (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">
                      Include Dark Matter Halo (Vera Rubin Model)
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setHasDarkMatter(!hasDarkMatter);
                        handleLabInteraction(activeLab.id);
                      }}
                      className={`h-7 text-xs ${
                        hasDarkMatter
                          ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                          : "bg-slate-800 text-slate-400 border-slate-700"
                      }`}
                    >
                      {hasDarkMatter ? "Dark Matter: ACTIVE" : "Dark Matter: OFF"}
                    </Button>
                  </div>
                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>Disk Stellar Mass (10¹⁰ M☉)</span>
                      <span className="font-mono text-white font-bold">{diskMass}</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={12}
                      step={0.5}
                      value={diskMass}
                      onChange={(e) => {
                        setDiskMass(parseFloat(e.target.value));
                        handleLabInteraction(activeLab.id);
                      }}
                      className="w-full accent-cyan-400"
                    />
                  </div>
                </div>
              )}

              {activeLabIndex === 2 && (
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>Stellar Birth Mass (M☉)</span>
                      <span className="font-mono text-white font-bold">{stellarMass} M☉</span>
                    </div>
                    <input
                      type="range"
                      min={0.1}
                      max={50}
                      step={0.2}
                      value={stellarMass}
                      onChange={(e) => {
                        setStellarMass(parseFloat(e.target.value));
                        handleLabInteraction(activeLab.id);
                      }}
                      className="w-full accent-amber-400"
                    />
                  </div>
                </div>
              )}

              {activeLabIndex === 4 && (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Regime:</span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setIsSupermassive(false);
                          handleLabInteraction(activeLab.id);
                        }}
                        className={`h-7 text-xs ${
                          !isSupermassive
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        Stellar (10 M☉)
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setIsSupermassive(true);
                          handleLabInteraction(activeLab.id);
                        }}
                        className={`h-7 text-xs ${
                          isSupermassive
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        Supermassive (4.15M M☉)
                      </Button>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>Test Particle Distance (in r_s units)</span>
                      <span className="font-mono text-white font-bold">{testParticleDist} r_s</span>
                    </div>
                    <input
                      type="range"
                      min={1.2}
                      max={8.0}
                      step={0.1}
                      value={testParticleDist}
                      onChange={(e) => {
                        setTestParticleDist(parseFloat(e.target.value));
                        handleLabInteraction(activeLab.id);
                      }}
                      className="w-full accent-red-400"
                    />
                  </div>
                </div>
              )}

              {activeLabIndex === 5 && (
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>Surface Temperature (Kelvin)</span>
                      <span className="font-mono text-white font-bold">{spectralTempK} K</span>
                    </div>
                    <input
                      type="range"
                      min={2500}
                      max={35000}
                      step={250}
                      value={spectralTempK}
                      onChange={(e) => {
                        setSpectralTempK(parseInt(e.target.value));
                        handleLabInteraction(activeLab.id);
                      }}
                      className="w-full accent-yellow-400"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>Cosmological Redshift (z)</span>
                      <span className="font-mono text-white font-bold">z = {redshiftZ}</span>
                    </div>
                    <input
                      type="range"
                      min={0.0}
                      max={0.3}
                      step={0.01}
                      value={redshiftZ}
                      onChange={(e) => {
                        setRedshiftZ(parseFloat(e.target.value));
                        handleLabInteraction(activeLab.id);
                      }}
                      className="w-full accent-red-400"
                    />
                  </div>
                </div>
              )}

              {activeLabIndex === 6 && (
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>Exoplanet Radius (Earth Radii)</span>
                      <span className="font-mono text-white font-bold">
                        {exoplanetRadiusEarth} R_Earth
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.5}
                      max={14.0}
                      step={0.5}
                      value={exoplanetRadiusEarth}
                      onChange={(e) => {
                        setExoplanetRadiusEarth(parseFloat(e.target.value));
                        handleLabInteraction(activeLab.id);
                      }}
                      className="w-full accent-cyan-400"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 p-2 rounded-lg bg-slate-950 border border-white/5 font-mono">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Transit Depth:</span>
                      <span className="text-cyan-400 font-bold">{transitDepthPercent}%</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">RV Wobble Amplitude:</span>
                      <span className="text-amber-400 font-bold">±{rvAmplitudeMs} m/s</span>
                    </div>
                  </div>
                </div>
              )}

              {activeLabIndex === 8 && (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Target World:</span>
                    <select
                      value={targetDestination}
                      onChange={(e) => {
                        setTargetDestination(
                          e.target.value as "Moon" | "Mars" | "Venus" | "Jupiter",
                        );
                        handleLabInteraction(activeLab.id);
                      }}
                      className="bg-slate-800 border border-white/10 rounded px-2 py-1 text-white text-xs"
                    >
                      <option value="Moon">Moon (Luna)</option>
                      <option value="Mars">Mars</option>
                      <option value="Venus">Venus</option>
                      <option value="Jupiter">Jupiter</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Scientific Equations, Limitations & Challenge Quest (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Level Prompt Guidance Card */}
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wide">
                <Sparkles className="size-4" />
                {level === "junior"
                  ? "Junior Explorer"
                  : level === "explorer"
                    ? "Space Explorer"
                    : "Young Astronomer"}{" "}
                Mode
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                Tier: {level.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {level === "junior"
                ? activeLab.juniorPrompt
                : level === "explorer"
                  ? activeLab.explorerPrompt
                  : activeLab.astronomerPrompt}
            </p>
          </div>

          {/* Key Equations Card */}
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-5 shadow-xl space-y-3">
            <h4 className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 uppercase tracking-wide">
              <Atom className="size-4" />
              Governing Physical Equations
            </h4>
            <div className="space-y-2 text-xs">
              {activeLab.keyEquations.map((eq, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-lg bg-slate-950 border border-white/5 space-y-1"
                >
                  <div className="font-semibold text-slate-200">{eq.name}</div>
                  <div className="font-mono text-cyan-300 bg-slate-900/80 px-2 py-1 rounded border border-white/5 text-[11px]">
                    {eq.formula}
                  </div>
                  <div className="text-[11px] text-slate-400">{eq.explanation}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Scientific Limitations Accordion */}
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 shadow-xl text-xs space-y-2">
            <div className="flex items-center gap-2 text-amber-400/90 font-semibold">
              <AlertTriangle className="size-4" />
              <span>Scientific Limitations & Assumptions</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px] leading-relaxed">
              {activeLab.scientificLimitations.map((lim, i) => (
                <li key={i}>{lim}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* FINAL CHALLENGE SUITE: "Your Journey Through the Cosmos" */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border-2 border-amber-500/40 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-5 mb-6">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-widest font-bold">
              <Award className="size-4" />
              Academy Capstone Quest
            </div>
            <h3 className="text-2xl font-bold text-white mt-1">
              Final Challenge: Your Journey Through the Cosmos
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Solve five quantitative astrophysical problems spanning the entire Academy to
              demonstrate your readiness and unlock your official Cosmic Explorer Completion
              Certificate!
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">
              Progress:{" "}
              <strong className="text-amber-400">{challengeSolvedSteps.size}/5 Solved</strong>
            </span>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300">
              <ShieldCheck className="size-3.5 text-amber-400" />
              <span>Full Curriculum: 24/24 Verified Modules Required</span>
            </div>
          </div>
        </div>

        {/* Step Selector Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {FINAL_CHALLENGE_STEPS.map((step, idx) => {
            const isSelected = challengeStepIndex === idx;
            const isSolved = challengeSolvedSteps.has(idx);
            return (
              <button
                key={step.id}
                onClick={() => {
                  setChallengeStepIndex(idx);
                  setChallengeInput("");
                  setChallengeFeedback({ status: "idle", message: "" });
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition ${
                  isSelected
                    ? "bg-amber-500 text-slate-950 border-amber-400 shadow-lg"
                    : isSolved
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      : "bg-slate-900 text-slate-400 border-white/10 hover:text-white"
                }`}
              >
                <span>Step {step.stepNumber}</span>
                {isSolved && <Check className="size-3.5" />}
              </button>
            );
          })}
        </div>

        {/* Active Challenge Problem Card */}
        <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
            <div>
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-semibold">
                {currentChallenge.domain}
              </span>
              <h4 className="text-lg font-bold text-white">{currentChallenge.title}</h4>
            </div>
            {challengeSolvedSteps.has(challengeStepIndex) && (
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto">
                <Check className="size-3.5" />
                Problem Solved!
              </span>
            )}
          </div>

          {/* Scenario Text */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-white/5 text-xs text-slate-300 leading-relaxed">
            <p className="mb-2">{currentChallenge.scenario}</p>
            <p className="font-semibold text-amber-300">{currentChallenge.taskPrompt}</p>
          </div>

          {/* Interactive Calculator Input */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-xs text-slate-400 font-medium">Your Calculation:</span>
              <input
                type="number"
                step="any"
                placeholder={`Target in ${currentChallenge.targetValues.unit}`}
                value={challengeInput}
                onChange={(e) => setChallengeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleValidateChallenge();
                }}
                className="bg-slate-900 border border-white/20 rounded-lg px-3 py-2 text-white text-xs w-48 font-mono focus:outline-none focus:border-amber-400"
              />
              <span className="text-xs font-mono text-slate-400">
                {currentChallenge.targetValues.unit}
              </span>
            </div>
            <Button
              size="sm"
              onClick={handleValidateChallenge}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
            >
              Verify Calculation
            </Button>
          </div>

          {/* Feedback & Debrief Alert */}
          {challengeFeedback.status !== "idle" && (
            <div
              className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                challengeFeedback.status === "correct"
                  ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-200"
                  : "bg-red-950/60 border-red-500/40 text-red-200"
              }`}
            >
              <div className="font-semibold mb-1 flex items-center gap-1.5">
                {challengeFeedback.status === "correct" ? (
                  <Check className="size-4 text-emerald-400" />
                ) : (
                  <AlertTriangle className="size-4 text-red-400" />
                )}
                {challengeFeedback.message}
              </div>
              {challengeFeedback.status === "correct" && (
                <p className="text-slate-300 mt-2 border-t border-emerald-500/20 pt-2">
                  {currentChallenge.scientificDebrief}
                </p>
              )}
            </div>
          )}

          {/* Hints Section */}
          <div className="pt-2 text-xs text-slate-400">
            <span className="text-amber-400/90 font-semibold">Scientific Guidance:</span>
            <ul className="list-disc list-inside mt-1 space-y-1">
              {currentChallenge.hints.map((hint, hidx) => (
                <li key={hidx}>{hint}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Certificate Modal */}
      <CosmicCertificateModal
        isOpen={isCertOpen}
        onClose={() => setIsCertOpen(false)}
        level={level}
        completedLabCount={completedLabs.size}
        finalChallengePassed={challengeSolvedSteps.size >= 3}
      />
    </div>
  );
};
