import React, { useState, useEffect, useRef } from "react";
import {
  Award,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Sparkles,
  Shield,
  HelpCircle,
  Info,
  ChevronRight,
  Orbit,
  Flame,
  Globe,
  Gauge,
  Sliders,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface PlanetConfig {
  name: string;
  color: string;
  mass: number;
  r: number;
  v: number;
  status: "stable" | "warning" | "crashed" | "ejected";
  history: [number, number][]; // [x, z]
}

interface StableSolarSystemChallengeProps {
  onComplete: () => void;
  isCompleted?: boolean;
}

export function StableSolarSystemChallenge({
  onComplete,
  isCompleted = false,
}: StableSolarSystemChallengeProps) {
  // Goal: 30 seconds of stability
  const TARGET_TIME = 30;
  const STAR_MASS = 1000;
  const G = 100;

  // Challenge State
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [hasWon, setHasWon] = useState<boolean>(isCompleted);
  const [failureReason, setFailureReason] = useState<string | null>(null);

  // Planet configurations
  const [p1Dist, setP1Dist] = useState<number>(8);
  const [p1Mass, setP1Mass] = useState<number>(1);
  const [p1Vel, setP1Vel] = useState<number>(11.18); // sqrt(100*1000/8)/10 = 11.18

  const [p2Dist, setP2Dist] = useState<number>(16);
  const [p2Mass, setP2Mass] = useState<number>(3);
  const [p2Vel, setP2Vel] = useState<number>(7.9); // sqrt(100*1000/16)/10 = 7.90

  const [p3Dist, setP3Dist] = useState<number>(26);
  const [p3Mass, setP3Mass] = useState<number>(15);
  const [p3Vel, setP3Vel] = useState<number>(6.2); // sqrt(100*1000/26)/10 = 6.20

  // Live simulation positions & velocities
  const simState = useRef<{
    p1: { x: number; z: number; vx: number; vz: number; status: PlanetConfig["status"] };
    p2: { x: number; z: number; vx: number; vz: number; status: PlanetConfig["status"] };
    p3: { x: number; z: number; vx: number; vz: number; status: PlanetConfig["status"] };
    star: { x: number; z: number; vx: number; vz: number };
  }>({
    p1: { x: 8, z: 0, vx: 0, vz: 11.18, status: "stable" },
    p2: { x: 16, z: 0, vx: 0, vz: 7.9, status: "stable" },
    p3: { x: 26, z: 0, vx: 0, vz: 6.2, status: "stable" },
    star: { x: 0, z: 0, vx: 0, vz: 0 },
  });

  const [p1Status, setP1Status] = useState<PlanetConfig["status"]>("stable");
  const [p2Status, setP2Status] = useState<PlanetConfig["status"]>("stable");
  const [p3Status, setP3Status] = useState<PlanetConfig["status"]>("stable");

  // Auto-circularize helper
  const handleAutoCircularize = () => {
    const v1 = Math.sqrt((G * STAR_MASS) / p1Dist);
    const v2 = Math.sqrt((G * STAR_MASS) / p2Dist);
    const v3 = Math.sqrt((G * STAR_MASS) / p3Dist);
    setP1Vel(parseFloat(v1.toFixed(2)));
    setP2Vel(parseFloat(v2.toFixed(2)));
    setP3Vel(parseFloat(v3.toFixed(2)));
  };

  // Preset Configurations
  const handleLoadTemplate = (type: "stable" | "chaotic" | "resonance") => {
    setIsRunning(false);
    setTimeElapsed(0);
    setFailureReason(null);

    if (type === "stable") {
      setP1Dist(8);
      setP1Mass(1);
      setP1Vel(11.18);

      setP2Dist(16);
      setP2Mass(2);
      setP2Vel(7.9);

      setP3Dist(26);
      setP3Mass(10);
      setP3Vel(6.2);
    } else if (type === "chaotic") {
      // Overlapping orbits and massive bodies
      setP1Dist(10);
      setP1Mass(20);
      setP1Vel(12.5);

      setP2Dist(11.5);
      setP2Mass(35);
      setP2Vel(6.0);

      setP3Dist(14);
      setP3Mass(50);
      setP3Vel(10.0);
    } else if (type === "resonance") {
      // Laplace 1:2:4 orbital periods -> r ratio (1 : 1.587 : 2.52)
      setP1Dist(9);
      setP1Mass(1);
      setP1Vel(10.54);

      setP2Dist(14.3);
      setP2Mass(2);
      setP2Vel(8.36);

      setP3Dist(22.7);
      setP3Mass(4);
      setP3Vel(6.64);
    }
  };

  // Reset Challenge
  const handleResetChallenge = () => {
    setIsRunning(false);
    setTimeElapsed(0);
    setFailureReason(null);
    setP1Status("stable");
    setP2Status("stable");
    setP3Status("stable");

    simState.current = {
      p1: { x: p1Dist, z: 0, vx: 0, vz: p1Vel, status: "stable" },
      p2: { x: p2Dist, z: 0, vx: 0, vz: p2Vel, status: "stable" },
      p3: { x: p3Dist, z: 0, vx: 0, vz: p3Vel, status: "stable" },
      star: { x: 0, z: 0, vx: 0, vz: 0 },
    };
  };

  // Start Simulation
  const handleStartSimulation = () => {
    handleResetChallenge();
    setIsRunning(true);
  };

  // Physics loop
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeElapsed((prev) => {
        const nextTime = prev + 0.1;
        if (nextTime >= TARGET_TIME) {
          setIsRunning(false);
          setHasWon(true);
          onComplete();
          return TARGET_TIME;
        }
        return nextTime;
      });

      // Physics Integration Sub-steps (Velocity Verlet)
      const dt = 0.02;
      const s = simState.current;

      // Bodies array: [star, p1, p2, p3]
      const bList = [
        { x: s.star.x, z: s.star.z, vx: s.star.vx, vz: s.star.vz, mass: STAR_MASS, id: "star" },
        { x: s.p1.x, z: s.p1.z, vx: s.p1.vx, vz: s.p1.vz, mass: p1Mass, id: "p1" },
        { x: s.p2.x, z: s.p2.z, vx: s.p2.vx, vz: s.p2.vz, mass: p2Mass, id: "p2" },
        { x: s.p3.x, z: s.p3.z, vx: s.p3.vx, vz: s.p3.vz, mass: p3Mass, id: "p3" },
      ];

      for (let sub = 0; sub < 5; sub++) {
        // Accelerations
        const ax = [0, 0, 0, 0];
        const az = [0, 0, 0, 0];

        for (let i = 0; i < 4; i++) {
          for (let j = i + 1; j < 4; j++) {
            const dx = bList[j].x - bList[i].x;
            const dz = bList[j].z - bList[i].z;
            const distSq = dx * dx + dz * dz + 0.25;
            const dist = Math.sqrt(distSq);
            const force = (G * bList[i].mass * bList[j].mass) / (distSq * dist);

            ax[i] += (force / bList[i].mass) * dx;
            az[i] += (force / bList[i].mass) * dz;

            ax[j] -= (force / bList[j].mass) * dx;
            az[j] -= (force / bList[j].mass) * dz;
          }
        }

        // Positions update
        for (let i = 0; i < 4; i++) {
          bList[i].x += bList[i].vx * dt + 0.5 * ax[i] * dt * dt;
          bList[i].z += bList[i].vz * dt + 0.5 * az[i] * dt * dt;
          bList[i].vx += ax[i] * dt;
          bList[i].vz += az[i] * dt;
        }
      }

      // Update ref
      s.star.x = bList[0].x;
      s.star.z = bList[0].z;
      s.star.vx = bList[0].vx;
      s.star.vz = bList[0].vz;

      s.p1.x = bList[1].x;
      s.p1.z = bList[1].z;
      s.p1.vx = bList[1].vx;
      s.p1.vz = bList[1].vz;

      s.p2.x = bList[2].x;
      s.p2.z = bList[2].z;
      s.p2.vx = bList[2].vx;
      s.p2.vz = bList[2].vz;

      s.p3.x = bList[3].x;
      s.p3.z = bList[3].z;
      s.p3.vx = bList[3].vx;
      s.p3.vz = bList[3].vz;

      // Check failure conditions:
      // 1. Crash into Star (r < 2.5)
      const r1 = Math.hypot(s.p1.x, s.p1.z);
      const r2 = Math.hypot(s.p2.x, s.p2.z);
      const r3 = Math.hypot(s.p3.x, s.p3.z);

      if (r1 < 2.5) {
        setIsRunning(false);
        setP1Status("crashed");
        setFailureReason("Rocky Planet plunged into the central star! (Speed was too low)");
        return;
      }
      if (r2 < 2.5) {
        setIsRunning(false);
        setP2Status("crashed");
        setFailureReason("Habitable Planet plunged into the central star!");
        return;
      }
      if (r3 < 2.5) {
        setIsRunning(false);
        setP3Status("crashed");
        setFailureReason("Gas Giant plunged into the central star!");
        return;
      }

      // 2. Ejection into Deep Space (r > 42)
      if (r1 > 42) {
        setIsRunning(false);
        setP1Status("ejected");
        setFailureReason("Rocky Planet exceeded escape velocity and was flung into deep space!");
        return;
      }
      if (r2 > 42) {
        setIsRunning(false);
        setP2Status("ejected");
        setFailureReason("Habitable Planet was ejected from the Solar System!");
        return;
      }
      if (r3 > 42) {
        setIsRunning(false);
        setP3Status("ejected");
        setFailureReason("Gas Giant escaped into deep space!");
        return;
      }

      // 3. Close planet-planet collision (< 1.5 units)
      const d12 = Math.hypot(s.p1.x - s.p2.x, s.p1.z - s.p2.z);
      const d23 = Math.hypot(s.p2.x - s.p3.x, s.p2.z - s.p3.z);
      const d13 = Math.hypot(s.p1.x - s.p3.x, s.p1.z - s.p3.z);

      if (d12 < 1.5) {
        setIsRunning(false);
        setP1Status("crashed");
        setP2Status("crashed");
        setFailureReason(
          "Planetary collision between Rocky Planet and Habitable World! (Hill spheres overlapped)",
        );
        return;
      }
      if (d23 < 1.8) {
        setIsRunning(false);
        setP2Status("crashed");
        setP3Status("crashed");
        setFailureReason("Catastrophic collision with Gas Giant!");
        return;
      }
      if (d13 < 1.8) {
        setIsRunning(false);
        setP1Status("crashed");
        setP3Status("crashed");
        setFailureReason("Collision between Inner and Outer Worlds!");
        return;
      }

      // Proximity warning (< 3.5 units)
      setP1Status(d12 < 3.5 ? "warning" : "stable");
      setP2Status(d12 < 3.5 || d23 < 3.5 ? "warning" : "stable");
      setP3Status(d23 < 3.5 ? "warning" : "stable");
    }, 100);

    return () => clearInterval(interval);
  }, [isRunning, p1Mass, p2Mass, p3Mass, onComplete]);

  const progressPercent = Math.min(100, Math.round((timeElapsed / TARGET_TIME) * 100));

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/90 p-6 backdrop-blur-xl shadow-xl space-y-6">
      {/* Title & Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">
              Interactive Mission Challenge: Build a Stable Solar System
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Design a stable 3-planet multi-body system. Balance masses, orbital radii, and circular
            velocities so all 3 worlds survive for 30 seconds without collisions or ejections!
          </p>
        </div>

        {hasWon && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-bold animate-in fade-in">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>Master System Architect Verified!</span>
          </div>
        )}
      </div>

      {/* Progress & Live Status Bar */}
      <div className="p-4 rounded-xl bg-slate-950 border border-white/10 space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">
            System Stability Progress:{" "}
            <span className="text-emerald-400 font-bold">
              {timeElapsed.toFixed(1)}s / {TARGET_TIME}s
            </span>
          </span>
          <span
            className={`font-semibold ${
              failureReason
                ? "text-red-400"
                : isRunning
                  ? "text-cyan-300"
                  : hasWon
                    ? "text-emerald-400"
                    : "text-slate-400"
            }`}
          >
            {failureReason
              ? "System Disrupted"
              : isRunning
                ? "Simulation Running..."
                : hasWon
                  ? "Target Reached (Stable Orbit Achieved)"
                  : "Ready to Test"}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-white/5 relative">
          <div
            className={`h-full transition-all duration-100 ${
              failureReason
                ? "bg-red-500"
                : hasWon
                  ? "bg-emerald-500"
                  : "bg-gradient-to-r from-cyan-500 to-emerald-400"
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {failureReason && (
          <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-500/30 text-red-200 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{failureReason}</span>
          </div>
        )}
      </div>

      {/* Templates & Quick Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Load Template:</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleLoadTemplate("stable")}
            className="h-7 text-xs border-white/10 text-slate-300 hover:text-white"
          >
            Stable Hierarchy
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleLoadTemplate("resonance")}
            className="h-7 text-xs border-white/10 text-slate-300 hover:text-white"
          >
            Laplace 1:2:4
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleLoadTemplate("chaotic")}
            className="h-7 text-xs border-red-500/30 text-red-300 hover:bg-red-500/10"
          >
            Chaos Collision
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleAutoCircularize}
            className="h-8 text-xs text-cyan-300 hover:bg-cyan-500/10"
            title="Automatically compute v = sqrt(GM/r) for current planet distances"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            Auto-Circularize (v = √[GM/r])
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleResetChallenge}
            className="h-8 text-xs text-slate-300"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Reset
          </Button>

          <Button
            size="sm"
            onClick={handleStartSimulation}
            disabled={isRunning}
            className="h-8 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
          >
            <Play className="w-3.5 h-3.5 mr-1" />
            {isRunning ? "Simulating..." : "Test System Stability"}
          </Button>
        </div>
      </div>

      {/* 3 PLANET CONFIGURATION CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        {/* PLANET 1: ROCKY INNER WORLD */}
        <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-cyan-400" />
              <span className="font-bold text-white">1. Rocky Inner World</span>
            </div>
            <span
              className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase ${
                p1Status === "stable"
                  ? "bg-emerald-500/20 text-emerald-300"
                  : p1Status === "warning"
                    ? "bg-amber-500/20 text-amber-300"
                    : "bg-red-500/20 text-red-300"
              }`}
            >
              {p1Status}
            </span>
          </div>

          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Distance r₁:</span>
                <span className="font-mono text-cyan-300">{p1Dist} AU</span>
              </div>
              <input
                type="range"
                min="5"
                max="12"
                step="1"
                disabled={isRunning}
                value={p1Dist}
                onChange={(e) => setP1Dist(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded appearance-none accent-cyan-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Mass m₁:</span>
                <span className="font-mono text-cyan-300">{p1Mass} Earths</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5"
                step="0.5"
                disabled={isRunning}
                value={p1Mass}
                onChange={(e) => setP1Mass(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded appearance-none accent-cyan-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Tangential Velocity v₁:</span>
                <span className="font-mono text-cyan-300">{p1Vel} km/s</span>
              </div>
              <input
                type="range"
                min="6"
                max="16"
                step="0.1"
                disabled={isRunning}
                value={p1Vel}
                onChange={(e) => setP1Vel(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded appearance-none accent-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* PLANET 2: HABITABLE ZONE WORLD */}
        <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="font-bold text-white">2. Habitable Zone World</span>
            </div>
            <span
              className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase ${
                p2Status === "stable"
                  ? "bg-emerald-500/20 text-emerald-300"
                  : p2Status === "warning"
                    ? "bg-amber-500/20 text-amber-300"
                    : "bg-red-500/20 text-red-300"
              }`}
            >
              {p2Status}
            </span>
          </div>

          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Distance r₂:</span>
                <span className="font-mono text-emerald-300">{p2Dist} AU</span>
              </div>
              <input
                type="range"
                min="13"
                max="20"
                step="1"
                disabled={isRunning}
                value={p2Dist}
                onChange={(e) => setP2Dist(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded appearance-none accent-emerald-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Mass m₂:</span>
                <span className="font-mono text-emerald-300">{p2Mass} Earths</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                disabled={isRunning}
                value={p2Mass}
                onChange={(e) => setP2Mass(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded appearance-none accent-emerald-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Tangential Velocity v₂:</span>
                <span className="font-mono text-emerald-300">{p2Vel} km/s</span>
              </div>
              <input
                type="range"
                min="5"
                max="12"
                step="0.1"
                disabled={isRunning}
                value={p2Vel}
                onChange={(e) => setP2Vel(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded appearance-none accent-emerald-400"
              />
            </div>
          </div>
        </div>

        {/* PLANET 3: GAS GIANT OUTER WORLD */}
        <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="font-bold text-white">3. Gas Giant Outer World</span>
            </div>
            <span
              className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase ${
                p3Status === "stable"
                  ? "bg-emerald-500/20 text-emerald-300"
                  : p3Status === "warning"
                    ? "bg-amber-500/20 text-amber-300"
                    : "bg-red-500/20 text-red-300"
              }`}
            >
              {p3Status}
            </span>
          </div>

          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Distance r₃:</span>
                <span className="font-mono text-amber-300">{p3Dist} AU</span>
              </div>
              <input
                type="range"
                min="22"
                max="34"
                step="1"
                disabled={isRunning}
                value={p3Dist}
                onChange={(e) => setP3Dist(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded appearance-none accent-amber-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Mass m₃:</span>
                <span className="font-mono text-amber-300">{p3Mass} Earths</span>
              </div>
              <input
                type="range"
                min="5"
                max="40"
                step="5"
                disabled={isRunning}
                value={p3Mass}
                onChange={(e) => setP3Mass(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded appearance-none accent-amber-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Tangential Velocity v₃:</span>
                <span className="font-mono text-amber-300">{p3Vel} km/s</span>
              </div>
              <input
                type="range"
                min="4"
                max="10"
                step="0.1"
                disabled={isRunning}
                value={p3Vel}
                onChange={(e) => setP3Vel(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded appearance-none accent-amber-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Physics Guidance note */}
      <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 text-[11px] text-slate-400 flex items-start gap-2">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <strong>Astronomical Rule:</strong> If two planets are too close together, their mutual
          gravitational pull (Hill sphere overlap) will perturb their orbits into unstable ellipses,
          causing one planet to crash into the central star or be flung violently into interstellar
          space!
        </div>
      </div>
    </div>
  );
}
