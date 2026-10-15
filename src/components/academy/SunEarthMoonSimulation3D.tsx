import React, { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import { LUNAR_PHASES, type LunarPhaseInfo } from "@/lib/academy/lessons/module-05-earth-moon";
import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  RotateCcw,
  Clock,
  Compass,
  Eye,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowRight,
  Sun,
  Moon,
  Globe,
  Maximize2,
  SkipForward,
  FastForward,
  Info,
} from "lucide-react";

type CameraViewMode = "free" | "above" | "earth" | "moon" | "sun";

interface SimulationControls {
  isPlaying: boolean;
  isReversed: boolean;
  speedMultiplier: number;
  showOrbits: boolean;
  showLabels: boolean;
  showShadows: boolean;
  showAxialTilt: boolean;
  viewMode: CameraViewMode;
}

// Helper to determine lunar phase from angle (0 to 2pi radians)
function getLunarPhaseFromAngle(angleRad: number): LunarPhaseInfo {
  // Normalize angle to [0, 360) degrees
  let deg = (angleRad * (180 / Math.PI)) % 360;
  if (deg < 0) deg += 360;

  // Find closest phase in LUNAR_PHASES
  let closest = LUNAR_PHASES[0];
  let minDiff = 360;

  for (const phase of LUNAR_PHASES) {
    let diff = Math.abs(deg - phase.phaseAngleDeg);
    if (diff > 180) diff = 360 - diff;
    if (diff < minDiff) {
      minDiff = diff;
      closest = phase;
    }
  }

  return closest;
}

// Camera Director Component that positions camera based on selected view mode
function CameraDirector({
  viewMode,
  earthPos,
  moonPos,
}: {
  viewMode: CameraViewMode;
  earthPos: THREE.Vector3;
  moonPos: THREE.Vector3;
}) {
  const { camera } = useThree();

  useFrame(() => {
    if (viewMode === "above") {
      // Top down bird's eye view
      camera.position.set(earthPos.x, 22, earthPos.z);
      camera.lookAt(earthPos.x, 0, earthPos.z);
    } else if (viewMode === "earth") {
      // Looking from Earth towards the Moon
      const dir = moonPos.clone().sub(earthPos).normalize();
      camera.position.set(earthPos.x + dir.x * 1.5, earthPos.y + 0.3, earthPos.z + dir.z * 1.5);
      camera.lookAt(moonPos.x, moonPos.y, moonPos.z);
    } else if (viewMode === "moon") {
      // Looking from Moon towards Earth
      const dir = earthPos.clone().sub(moonPos).normalize();
      camera.position.set(moonPos.x + dir.x * 0.8, moonPos.y + 0.2, moonPos.z + dir.z * 0.8);
      camera.lookAt(earthPos.x, earthPos.y, earthPos.z);
    } else if (viewMode === "sun") {
      // Looking from Sun towards Earth-Moon
      camera.position.set(0, 4, 0);
      camera.lookAt(earthPos.x, earthPos.y, earthPos.z);
    }
  });

  return (
    <OrbitControls
      enableZoom={viewMode === "free"}
      enableRotate={viewMode === "free"}
      enablePan={viewMode === "free"}
      maxDistance={35}
      minDistance={3}
    />
  );
}

// 3D Sun, Earth, Moon System Renderer
function CelestialOrbitsScene({
  simTimeDays,
  controls,
  onUpdateCoordinates,
}: {
  simTimeDays: number;
  controls: SimulationControls;
  onUpdateCoordinates: (earth: THREE.Vector3, moon: THREE.Vector3, phaseAngle: number) => void;
}) {
  const earthMeshRef = useRef<THREE.Mesh>(null);
  const moonMeshRef = useRef<THREE.Mesh>(null);

  // Constants for orbital dimensions
  const earthOrbitRadius = 11.0;
  const moonOrbitRadius = 2.8;
  const earthTiltRad = 23.44 * (Math.PI / 180); // 23.44 degrees
  const moonInclinationRad = 5.145 * (Math.PI / 180); // 5.145 degrees

  // Orbital Periods
  // Earth year = 365.25 days
  // Moon synodic month ≈ 29.53 days
  const earthOrbitAngle = (simTimeDays / 365.25) * 2 * Math.PI;
  const moonOrbitAngle = (simTimeDays / 29.53059) * 2 * Math.PI;
  const earthDailyRotationAngle = simTimeDays * 2 * Math.PI; // 1 rotation per day

  // Earth Position (heliocentric)
  const earthX = Math.cos(earthOrbitAngle) * earthOrbitRadius;
  const earthZ = Math.sin(earthOrbitAngle) * earthOrbitRadius;
  const earthPos = useMemo(() => new THREE.Vector3(earthX, 0, earthZ), [earthX, earthZ]);

  // Moon Position relative to Earth, inclined by 5.145°
  const moonLocalX = Math.cos(moonOrbitAngle) * moonOrbitRadius;
  const moonLocalZ = Math.sin(moonOrbitAngle) * moonOrbitRadius * Math.cos(moonInclinationRad);
  const moonLocalY = Math.sin(moonOrbitAngle) * moonOrbitRadius * Math.sin(moonInclinationRad);

  const moonPos = useMemo(
    () => new THREE.Vector3(earthX + moonLocalX, moonLocalY, earthZ + moonLocalZ),
    [earthX, earthZ, moonLocalX, moonLocalY, moonLocalZ],
  );

  // Calculate phase angle: angle between Earth->Sun vector and Earth->Moon vector
  // Earth->Sun vector points to (0,0,0) - (earthX, 0, earthZ) = (-earthX, 0, -earthZ)
  const phaseAngle = useMemo(() => {
    const sunDir = new THREE.Vector2(-earthX, -earthZ).normalize();
    const moonDir = new THREE.Vector2(moonLocalX, moonLocalZ).normalize();
    // Dot product gives cos(theta), perp-dot gives sine
    const dot = sunDir.dot(moonDir);
    const det = sunDir.x * moonDir.y - sunDir.y * moonDir.x;
    let angle = Math.atan2(det, dot);
    if (angle < 0) angle += 2 * Math.PI;
    return angle;
  }, [earthX, earthZ, moonLocalX, moonLocalZ]);

  // Report live coordinates back to parent
  useEffect(() => {
    onUpdateCoordinates(earthPos, moonPos, phaseAngle);
  }, [earthPos, moonPos, phaseAngle, onUpdateCoordinates]);

  // Rotate Earth on its tilted axis
  useFrame(() => {
    if (earthMeshRef.current) {
      earthMeshRef.current.rotation.y = earthDailyRotationAngle;
    }
    if (moonMeshRef.current) {
      // Synchronous rotation (tidal locking): rotates once per lunar orbit
      moonMeshRef.current.rotation.y = moonOrbitAngle;
    }
  });

  // Earth's shadow vector (points away from the Sun)
  const earthShadowDir = earthPos.clone().normalize();
  const moonShadowDir = moonPos
    .clone()
    .sub(new THREE.Vector3(0, 0, 0))
    .normalize();

  // Generate Earth Orbit Ring path
  const earthOrbitPoints = useMemo(() => {
    const pts = [];
    const segments = 120;
    for (let i = 0; i <= segments; i++) {
      const a = (i / segments) * 2 * Math.PI;
      pts.push(
        new THREE.Vector3(Math.cos(a) * earthOrbitRadius, 0, Math.sin(a) * earthOrbitRadius),
      );
    }
    return pts;
  }, [earthOrbitRadius]);

  // Generate Moon Orbit Ring around Earth (tilted at 5.145°)
  const moonOrbitPoints = useMemo(() => {
    const pts = [];
    const segments = 80;
    for (let i = 0; i <= segments; i++) {
      const a = (i / segments) * 2 * Math.PI;
      const lx = Math.cos(a) * moonOrbitRadius;
      const lz = Math.sin(a) * moonOrbitRadius * Math.cos(moonInclinationRad);
      const ly = Math.sin(a) * moonOrbitRadius * Math.sin(moonInclinationRad);
      pts.push(new THREE.Vector3(lx, ly, lz));
    }
    return pts;
  }, [moonOrbitRadius, moonInclinationRad]);

  return (
    <group>
      {/* 1. Central Sun */}
      <group position={[0, 0, 0]}>
        <mesh>
          <sphereGeometry args={[2.0, 32, 32]} />
          <meshBasicMaterial color="#fef08a" />
        </mesh>
        {/* Sun Glowing Corona */}
        <mesh>
          <sphereGeometry args={[2.4, 24, 24]} />
          <meshBasicMaterial color="#f59e0b" transparent opacity={0.35} />
        </mesh>
        <pointLight
          position={[0, 0, 0]}
          intensity={3.0}
          distance={50}
          decay={0.8}
          color="#ffffff"
        />
      </group>

      {/* Earth Orbit Trail */}
      {controls.showOrbits && (
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array(earthOrbitPoints.flatMap((p) => [p.x, p.y, p.z])), 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#38bdf8" transparent opacity={0.25} />
        </line>
      )}

      {/* 2. Earth Group (Positioned along its heliocentric orbit) */}
      <group position={[earthPos.x, earthPos.y, earthPos.z]}>
        {/* Axial Tilt Wrapper: Tilts by 23.44° fixed relative to Z/polar axis */}
        <group rotation={[0, 0, earthTiltRad]}>
          {/* Earth Body */}
          <mesh ref={earthMeshRef}>
            <sphereGeometry args={[1.0, 32, 32]} />
            <meshStandardMaterial color="#0284c7" roughness={0.4} metalness={0.1} />
          </mesh>

          {/* Continents wireframe / texture representation */}
          <mesh rotation={[0, 0, 0]}>
            <sphereGeometry args={[1.01, 20, 20]} />
            <meshStandardMaterial color="#16a34a" wireframe transparent opacity={0.35} />
          </mesh>

          {/* Atmosphere Glow Shell */}
          <mesh>
            <sphereGeometry args={[1.15, 24, 24]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.2} />
          </mesh>

          {/* Axial Tilt Indicator Line passing through North & South Poles */}
          {controls.showAxialTilt && (
            <group>
              <line>
                <bufferGeometry>
                  <bufferAttribute
                    attach="attributes-position"
                    args={[new Float32Array([0, -2.2, 0, 0, 2.2, 0]), 3]}
                  />
                </bufferGeometry>
                <lineBasicMaterial color="#f43f5e" linewidth={2} />
              </line>
              {/* North Pole Marker */}
              <mesh position={[0, 2.3, 0]}>
                <sphereGeometry args={[0.08, 12, 12]} />
                <meshBasicMaterial color="#f43f5e" />
              </mesh>
            </group>
          )}
        </group>

        {/* Moon Orbit Path around Earth (Inclined at 5.145°) */}
        {controls.showOrbits && (
          <line>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[new Float32Array(moonOrbitPoints.flatMap((p) => [p.x, p.y, p.z])), 3]}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#e2e8f0" transparent opacity={0.45} />
          </line>
        )}

        {/* Earth Umbra Shadow Cone (stretches away from the Sun) */}
        {controls.showShadows && (
          <group
            position={[earthShadowDir.x * 2.5, 0, earthShadowDir.z * 2.5]}
            rotation={[
              0,
              -Math.atan2(earthShadowDir.z, earthShadowDir.x) + Math.PI / 2,
              Math.PI / 2,
            ]}
          >
            <mesh>
              <coneGeometry args={[1.2, 5.0, 32, 1, true]} />
              <meshBasicMaterial
                color="#0f172a"
                transparent
                opacity={0.35}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        )}
      </group>

      {/* 3. Moon Group */}
      <group position={[moonPos.x, moonPos.y, moonPos.z]}>
        <mesh ref={moonMeshRef}>
          <sphereGeometry args={[0.4, 24, 24]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.85} metalness={0.05} />
        </mesh>

        {/* Moon Umbra Shadow Cone (stretches away from Sun towards Earth) */}
        {controls.showShadows && (
          <group
            position={[moonShadowDir.x * 1.5, moonShadowDir.y * 1.5, moonShadowDir.z * 1.5]}
            rotation={[0, -Math.atan2(moonShadowDir.z, moonShadowDir.x) + Math.PI / 2, Math.PI / 2]}
          >
            <mesh>
              <coneGeometry args={[0.45, 3.0, 24, 1, true]} />
              <meshBasicMaterial
                color="#020617"
                transparent
                opacity={0.4}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        )}
      </group>

      <CameraDirector viewMode={controls.viewMode} earthPos={earthPos} moonPos={moonPos} />
    </group>
  );
}

export function SunEarthMoonSimulation3D({
  onTestedSimulation,
}: {
  onTestedSimulation?: () => void;
}) {
  const [simTimeDays, setSimTimeDays] = useState<number>(0);
  const [controls, setControls] = useState<SimulationControls>({
    isPlaying: true,
    isReversed: false,
    speedMultiplier: 1.0,
    showOrbits: true,
    showLabels: true,
    showShadows: true,
    showAxialTilt: true,
    viewMode: "free",
  });

  const [earthCoords, setEarthCoords] = useState<THREE.Vector3>(new THREE.Vector3(11, 0, 0));
  const [moonCoords, setMoonCoords] = useState<THREE.Vector3>(new THREE.Vector3(13.8, 0, 0));
  const [phaseAngleRad, setPhaseAngleRad] = useState<number>(0);

  // Active lunar phase determined by real geometric angle
  const activeLunarPhase = useMemo(() => getLunarPhaseFromAngle(phaseAngleRad), [phaseAngleRad]);

  // Illuminated percentage formula: k = (1 + cos(alpha)) / 2 * 100
  // Note: alpha = phase angle (0 rad at New Moon, pi at Full Moon)
  const illuminatedPercent = useMemo(() => {
    // When phaseAngleRad = 0 (aligned with Sun), Moon is New Moon -> illuminated portion from Earth is ~0%
    // When phaseAngleRad = Math.PI (opposite Sun), Full Moon -> 100%
    const cosAngle = Math.cos(phaseAngleRad);
    // Note: in astronomical convention, elongation theta: k = (1 - cos theta)/2
    // Here phaseAngle is 0 at New Moon, so:
    const k = (1 - cosAngle) / 2;
    return Math.round(k * 100);
  }, [phaseAngleRad]);

  // Main Simulation Animation Loop
  useEffect(() => {
    let animationId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const deltaSec = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (controls.isPlaying) {
        // 1 second real-time = 1 simulated day at 1.0x speed
        const direction = controls.isReversed ? -1 : 1;
        const daysDelta = deltaSec * controls.speedMultiplier * 2.0 * direction;
        setSimTimeDays((prev) => prev + daysDelta);
        onTestedSimulation?.();
      }

      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationId);
  }, [controls.isPlaying, controls.isReversed, controls.speedMultiplier, onTestedSimulation]);

  const handleAdvanceDay = () => {
    setSimTimeDays((prev) => prev + 1.0);
    onTestedSimulation?.();
  };

  const handleAdvanceLunarCycle = () => {
    setSimTimeDays((prev) => prev + 29.53059);
    onTestedSimulation?.();
  };

  const handleReset = () => {
    setSimTimeDays(0);
    setControls((prev) => ({ ...prev, viewMode: "free", isPlaying: true, isReversed: false }));
  };

  // Current day of the simulated year (0 to 365)
  const dayOfYear = useMemo(() => {
    let d = Math.floor(simTimeDays % 365.25);
    if (d < 0) d += 365;
    return d + 1;
  }, [simTimeDays]);

  return (
    <div className="rounded-3xl border border-cyan-500/30 bg-slate-950 p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
      {/* Header Info & Real-Time Celestial Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-1">
            <Sparkles className="size-3.5 text-cyan-400" />
            <span>Signature 3D Orbit & Illumination Engine</span>
            <span>•</span>
            <span>Physics-Driven Three-Body Simulation</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Sun–Earth–Moon Interactive Visualizer
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
            Observe Earth&apos;s 23.44° axial tilt, true day/night rotation, the Moon&apos;s 5.145°
            orbital inclination, and geometric lunar phases in real-time.
          </p>
        </div>

        {/* Live Status Cards: Lunar Phase & Day of Year */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Phase Badge */}
          <div className="px-4 py-2.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-white flex items-center gap-3 shadow-md">
            <span className="text-2xl">{activeLunarPhase.symbol}</span>
            <div>
              <span className="text-[10px] font-mono text-cyan-400 block uppercase font-bold">
                Current Phase ({illuminatedPercent}% Lit)
              </span>
              <span className="text-sm font-bold text-white">{activeLunarPhase.name}</span>
            </div>
          </div>

          {/* Calendar Day Counter */}
          <div className="px-3.5 py-2.5 rounded-2xl bg-slate-900 border border-white/15 text-slate-300 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
              Simulated Year Progress:
            </span>
            <span className="font-mono font-bold text-amber-300 text-sm">
              Day {dayOfYear} / 365
            </span>
          </div>
        </div>
      </div>

      {/* 3D Simulation Canvas Container */}
      <div className="relative h-[440px] sm:h-[500px] w-full rounded-2xl bg-slate-950 border border-white/10 overflow-hidden shadow-inner">
        <Canvas
          camera={{ position: [0, 14, 22], fov: 45 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        >
          <color attach="background" args={["#020617"]} />
          <Stars radius={90} depth={50} count={1500} factor={4} fade />
          <ambientLight intensity={0.25} />
          <directionalLight position={[0, 0, 0]} intensity={1.8} />

          <CelestialOrbitsScene
            simTimeDays={simTimeDays}
            controls={controls}
            onUpdateCoordinates={(e, m, angle) => {
              setEarthCoords(e);
              setMoonCoords(m);
              setPhaseAngleRad(angle);
            }}
          />
        </Canvas>

        {/* 3D Overlays: Real-Time Perspective Badges */}
        <div className="absolute top-4 left-4 pointer-events-none flex flex-col gap-2">
          <div className="bg-slate-900/85 backdrop-blur-md border border-white/10 px-3.5 py-2 rounded-xl text-left">
            <span className="text-[10px] font-mono text-cyan-400 block uppercase font-bold">
              Active Camera Angle:
            </span>
            <span className="text-xs font-bold text-white capitalize">
              {controls.viewMode === "free" && "Free 3D Orbit (Drag to rotate)"}
              {controls.viewMode === "above" && "Top-Down Ecliptic Plane (Bird's Eye)"}
              {controls.viewMode === "earth" && "View from Earth (Looking at Moon)"}
              {controls.viewMode === "moon" && "View from Moon (Looking at Earth)"}
              {controls.viewMode === "sun" && "View from Sun (Solar Perspective)"}
            </span>
          </div>
        </div>

        {/* 2D Mini-HUD: Lunar Phase Disc Preview */}
        <div className="absolute top-4 right-4 pointer-events-none">
          <div className="bg-slate-900/90 backdrop-blur-md border border-cyan-500/30 p-3 rounded-2xl text-center shadow-xl">
            <span className="text-[10px] font-mono text-cyan-400 block uppercase font-bold mb-1">
              Earth Sky View:
            </span>
            <div className="size-16 mx-auto rounded-full bg-slate-950 border-2 border-slate-700 relative overflow-hidden flex items-center justify-center">
              {/* Dynamic 2D Phase SVG */}
              <svg className="size-full" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="46" fill="#1e293b" />
                {/* Illuminated white crescent / gibbous path */}
                {illuminatedPercent > 0 && (
                  <path
                    d={
                      phaseAngleRad <= Math.PI
                        ? `M 50 4 A 46 46 0 0 1 50 96 A ${Math.abs(46 * (1 - 2 * (illuminatedPercent / 100)))} 46 0 0 ${
                            illuminatedPercent >= 50 ? 1 : 0
                          } 50 4 Z`
                        : `M 50 4 A 46 46 0 0 0 50 96 A ${Math.abs(46 * (1 - 2 * (illuminatedPercent / 100)))} 46 0 0 ${
                            illuminatedPercent >= 50 ? 0 : 1
                          } 50 4 Z`
                    }
                    fill="#f8fafc"
                  />
                )}
              </svg>
            </div>
            <span className="text-xs font-mono font-bold text-white block mt-1.5">
              {illuminatedPercent}% Lit
            </span>
            <span className="text-[10px] text-slate-400 block leading-tight">
              {activeLunarPhase.name}
            </span>
          </div>
        </div>

        {/* Bottom HUD: Physical Geometry Parameters */}
        <div className="absolute bottom-4 inset-x-4 flex flex-col sm:flex-row items-center justify-between gap-3 pointer-events-none">
          <div className="bg-slate-900/90 backdrop-blur-md border border-white/15 px-4 py-2 rounded-xl text-xs flex items-center gap-3">
            <Globe className="size-4 text-cyan-400 shrink-0" />
            <div>
              <span className="text-white font-bold">Earth Axial Tilt:</span>
              <span className="font-mono text-cyan-300 font-bold ml-1.5">23.44° Obliquity</span>
              <span className="text-[11px] text-slate-400 ml-2 font-mono">
                (Fixed direction toward Polaris)
              </span>
            </div>
          </div>

          <div className="bg-slate-900/90 backdrop-blur-md border border-white/15 px-4 py-2 rounded-xl text-xs flex items-center gap-3">
            <Moon className="size-4 text-amber-400 shrink-0" />
            <div>
              <span className="text-white font-bold">Moon Orbit Incline:</span>
              <span className="font-mono text-amber-300 font-bold ml-1.5">5.145° to Ecliptic</span>
              <span className="text-[11px] text-slate-400 ml-2 font-mono">
                (Prevents monthly eclipses)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Deck 1: Camera Perspectives */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
          <span>Choose Viewpoint:</span>
          <span className="text-[11px] font-mono text-cyan-400 lowercase">
            explore from multiple reference frames
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {[
            { id: "free", label: "Free 3D Orbit", icon: Compass },
            { id: "above", label: "Above Orbital Plane", icon: Layers },
            { id: "earth", label: "View from Earth", icon: Globe },
            { id: "moon", label: "View from Moon", icon: Moon },
            { id: "sun", label: "View from Sun", icon: Sun },
          ].map((v) => {
            const Icon = v.icon;
            const isSelected = controls.viewMode === v.id;
            return (
              <button
                key={v.id}
                onClick={() => setControls((p) => ({ ...p, viewMode: v.id as CameraViewMode }))}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  isSelected
                    ? "bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-md shadow-cyan-500/20"
                    : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="size-4" />
                <span>{v.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Control Deck 2: Playback, Speed, Step Buttons, and Layer Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
        {/* Play / Pause / Reverse / Advance Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => setControls((p) => ({ ...p, isPlaying: !p.isPlaying }))}
            size="sm"
            className={`${
              controls.isPlaying
                ? "bg-amber-600 hover:bg-amber-500 text-white"
                : "bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
            }`}
          >
            {controls.isPlaying ? (
              <>
                <Pause className="size-4 mr-1.5" /> Pause Orbit
              </>
            ) : (
              <>
                <Play className="size-4 mr-1.5" /> Run Orbit
              </>
            )}
          </Button>

          <Button
            onClick={() => setControls((p) => ({ ...p, isReversed: !p.isReversed }))}
            size="sm"
            variant="outline"
            className={`border-white/10 ${
              controls.isReversed
                ? "bg-purple-500/20 text-purple-300 border-purple-400"
                : "text-white"
            }`}
          >
            <RotateCcw className="size-3.5 mr-1.5" />
            {controls.isReversed ? "Direction: Reverse" : "Reverse"}
          </Button>

          <Button
            onClick={handleAdvanceDay}
            size="sm"
            variant="outline"
            className="border-white/10 text-white hover:bg-white/5"
            title="Advance Earth by 1 day (24 hours)"
          >
            <SkipForward className="size-3.5 mr-1.5 text-cyan-400" /> +1 Day
          </Button>

          <Button
            onClick={handleAdvanceLunarCycle}
            size="sm"
            variant="outline"
            className="border-white/10 text-white hover:bg-white/5"
            title="Advance Moon by 1 synodic lunar cycle (+29.5 days)"
          >
            <Moon className="size-3.5 mr-1.5 text-amber-400" /> +1 Lunar Cycle
          </Button>

          <Button
            onClick={handleReset}
            size="sm"
            variant="outline"
            className="border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
          >
            <RotateCcw className="size-3 mr-1" /> Reset
          </Button>
        </div>

        {/* Speed Multipliers */}
        <div className="flex items-center gap-1 text-xs">
          <span className="text-slate-400 font-semibold mr-1">Speed:</span>
          {[0.25, 0.5, 1, 2, 5, 15].map((multiplier) => (
            <button
              key={multiplier}
              onClick={() => setControls((p) => ({ ...p, speedMultiplier: multiplier }))}
              className={`px-2 py-1 rounded-lg font-mono font-semibold transition-all ${
                controls.speedMultiplier === multiplier
                  ? "bg-cyan-500 text-slate-950 font-bold"
                  : "bg-white/5 text-slate-400 hover:text-white"
              }`}
            >
              {multiplier}x
            </button>
          ))}
        </div>
      </div>

      {/* Control Deck 3: Display Layer Toggles */}
      <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-slate-900/40 border border-white/5 text-xs">
        <span className="text-slate-400 font-mono font-bold uppercase mr-2">Visual Toggles:</span>
        {[
          { key: "showOrbits", label: "Orbit Paths" },
          { key: "showShadows", label: "Umbra/Penumbra Shadows" },
          { key: "showAxialTilt", label: "23.44° Axial Tilt Vector" },
        ].map((toggle) => {
          const isEnabled = controls[toggle.key as keyof SimulationControls] as boolean;
          return (
            <button
              key={toggle.key}
              onClick={() =>
                setControls((p) => ({
                  ...p,
                  [toggle.key]: !p[toggle.key as keyof SimulationControls],
                }))
              }
              className={`px-3 py-1.5 rounded-lg border font-medium transition-all ${
                isEnabled
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-sm"
                  : "bg-white/[0.02] border-white/10 text-slate-400 hover:text-slate-200"
              }`}
            >
              {isEnabled ? "✓ " : "○ "}
              {toggle.label}
            </button>
          );
        })}
      </div>

      {/* Real-Time Geometry & Astrodynamics Insight Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/30 via-slate-900/60 to-purple-950/30 border border-cyan-500/30 space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400">
          <Info className="size-4" />
          <span>Real-Time Geometric Alignment Insight</span>
        </div>
        <p className="text-sm text-slate-200 leading-relaxed font-medium">
          {activeLunarPhase.description}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-mono text-slate-300">
          <div className="p-2.5 rounded-lg bg-white/5">
            <span className="text-slate-400 block text-[10px] uppercase">
              Moon Rise & Set Times:
            </span>
            <span>
              Rises: {activeLunarPhase.riseTime} • Sets: {activeLunarPhase.setTime}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-white/5">
            <span className="text-slate-400 block text-[10px] uppercase">
              Illuminated Fraction Formula:
            </span>
            <span>k = (1 - cos θ) / 2 = {illuminatedPercent}% illuminated</span>
          </div>
        </div>
      </div>
    </div>
  );
}
