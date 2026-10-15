import React, { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import {
  LIGHT_TRAVEL_TARGETS,
  type LightTravelTarget,
} from "@/lib/academy/lessons/module-04-light-time";
import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Clock,
  Sparkles,
  Info,
  ChevronRight,
  Eye,
  CheckCircle2,
  Compass,
  ArrowRight,
  Zap,
  Activity,
  Layers,
} from "lucide-react";

// 3D Celestial Body Mesh Renderer
function CelestialBodyObject({
  target,
  isSource,
}: {
  target: LightTravelTarget;
  isSource: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * (isSource ? 0.3 : 0.2);
    }
    if (glowRef.current) {
      glowRef.current.rotation.y -= delta * 0.15;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.1;
    }
  });

  if (isSource) {
    if (target.id === "sun") {
      return (
        <group position={[-6, 0, 0]}>
          {/* Sun Core */}
          <mesh ref={meshRef}>
            <sphereGeometry args={[1.5, 32, 32]} />
            <meshBasicMaterial color="#fbbf24" />
          </mesh>
          {/* Coronal Glow */}
          <mesh ref={glowRef}>
            <sphereGeometry args={[1.85, 24, 24]} />
            <meshBasicMaterial color="#f59e0b" transparent opacity={0.35} />
          </mesh>
          {/* Outer Flare Shell */}
          <mesh>
            <sphereGeometry args={[2.2, 16, 16]} />
            <meshBasicMaterial color="#ef4444" transparent opacity={0.15} />
          </mesh>
        </group>
      );
    }

    if (target.id === "moon") {
      return (
        <group position={[-6, 0, 0]}>
          <mesh ref={meshRef}>
            <sphereGeometry args={[0.7, 32, 32]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.9} metalness={0.1} />
          </mesh>
        </group>
      );
    }

    if (target.id === "mars") {
      return (
        <group position={[-6, 0, 0]}>
          <mesh ref={meshRef}>
            <sphereGeometry args={[0.85, 32, 32]} />
            <meshStandardMaterial color="#e0533c" roughness={0.8} />
          </mesh>
          <mesh ref={glowRef}>
            <sphereGeometry args={[0.95, 24, 24]} />
            <meshBasicMaterial color="#f87171" transparent opacity={0.2} />
          </mesh>
        </group>
      );
    }

    if (target.id === "jupiter") {
      return (
        <group position={[-6, 0, 0]}>
          <mesh ref={meshRef}>
            <sphereGeometry args={[1.6, 32, 32]} />
            <meshStandardMaterial color="#d97706" roughness={0.6} />
          </mesh>
          {/* Subtle Ring */}
          <mesh ref={ringRef} rotation={[Math.PI / 3, 0, 0]}>
            <ringGeometry args={[1.9, 2.4, 32]} />
            <meshBasicMaterial color="#b45309" transparent opacity={0.35} side={THREE.DoubleSide} />
          </mesh>
        </group>
      );
    }

    if (target.category === "distant_galaxy") {
      // Spiral Galaxy Particle Disk
      return (
        <group position={[-6, 0, 0]} rotation={[Math.PI / 4, 0, 0]}>
          <mesh ref={meshRef}>
            <sphereGeometry args={[0.5, 24, 24]} />
            <meshBasicMaterial color="#fef08a" />
          </mesh>
          {/* Spiral Particle Dust Disk */}
          <points>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[
                  (() => {
                    const count = 1200;
                    const pos = new Float32Array(count * 3);
                    for (let i = 0; i < count; i++) {
                      const r = Math.random() * 2.5;
                      const angle = r * 4.0 + (i % 2 === 0 ? 0 : Math.PI);
                      pos[i * 3] = Math.cos(angle) * r + (Math.random() - 0.5) * 0.2;
                      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.15;
                      pos[i * 3 + 2] = Math.sin(angle) * r + (Math.random() - 0.5) * 0.2;
                    }
                    return pos;
                  })(),
                  3,
                ]}
              />
            </bufferGeometry>
            <pointsMaterial
              size={0.04}
              color={target.colorHex}
              transparent
              opacity={0.8}
              blending={THREE.AdditiveBlending}
            />
          </points>
        </group>
      );
    }

    // Default Star (Proxima, Sirius, Betelgeuse, Sgr A*)
    return (
      <group position={[-6, 0, 0]}>
        <mesh ref={meshRef}>
          <sphereGeometry args={[target.radiusScale, 32, 32]} />
          <meshBasicMaterial color={target.colorHex} />
        </mesh>
        <mesh ref={glowRef}>
          <sphereGeometry args={[target.radiusScale * 1.35, 24, 24]} />
          <meshBasicMaterial color={target.colorHex} transparent opacity={0.3} />
        </mesh>
      </group>
    );
  }

  // Target: Earth (Observer at +6, 0, 0)
  return (
    <group position={[6, 0, 0]}>
      {/* Earth Solid Globe */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.0, 32, 32]} />
        <meshStandardMaterial color="#0284c7" roughness={0.4} metalness={0.1} />
      </mesh>
      {/* Continental Green Patches Representation */}
      <mesh>
        <sphereGeometry args={[1.01, 16, 16]} />
        <meshStandardMaterial color="#16a34a" transparent opacity={0.4} wireframe />
      </mesh>
      {/* Atmosphere Glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.2, 24, 24]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.25} />
      </mesh>
    </group>
  );
}

// Animated Traveling Light Pulse (Photon Packet with Waveform & Trail)
function TravelingLightPulse({
  progressRatio,
  isWaveMode,
  pulseColor,
}: {
  progressRatio: number;
  isWaveMode: boolean;
  pulseColor: string;
}) {
  const pulseGroupRef = useRef<THREE.Group>(null);
  const wavePointsRef = useRef<THREE.LineSegments>(null);

  // Path spans from -6 (Source) to +6 (Earth)
  const currentX = -6 + progressRatio * 12;

  useFrame((state) => {
    if (pulseGroupRef.current) {
      pulseGroupRef.current.position.set(currentX, 0, 0);
    }
  });

  // Oscillating Sine Wave geometry representing transverse electromagnetic wave
  const wavePositions = useMemo(() => {
    const segments = 40;
    const pos = new Float32Array(segments * 6);
    const length = 2.0;
    const waveK = 12.0;

    for (let i = 0; i < segments; i++) {
      const x1 = -length + (i / segments) * length;
      const x2 = -length + ((i + 1) / segments) * length;
      const y1 = Math.sin(x1 * waveK) * 0.4;
      const y2 = Math.sin(x2 * waveK) * 0.4;
      const z1 = Math.cos(x1 * waveK) * 0.4;
      const z2 = Math.cos(x2 * waveK) * 0.4;

      const idx = i * 6;
      pos[idx] = x1;
      pos[idx + 1] = y1;
      pos[idx + 2] = 0;

      pos[idx + 3] = x2;
      pos[idx + 4] = y2;
      pos[idx + 5] = 0;
    }
    return pos;
  }, []);

  return (
    <group>
      {/* Laser / Transit Beam Guide */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array([-6, 0, 0, 6, 0, 0]), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#ffffff" transparent opacity={0.15} />
      </line>

      {/* Trailing Completed Path (Golden Beam) */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array([-6, 0, 0, currentX, 0, 0]), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color={pulseColor} transparent opacity={0.6} />
      </line>

      {/* Leading Photon Head Group */}
      <group ref={pulseGroupRef}>
        {/* Core Photon Sphere */}
        <mesh>
          <sphereGeometry args={[0.22, 24, 24]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>

        {/* Glowing Photon Aura */}
        <mesh>
          <sphereGeometry args={[0.45, 16, 16]} />
          <meshBasicMaterial color={pulseColor} transparent opacity={0.65} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.8, 16, 16]} />
          <meshBasicMaterial color={pulseColor} transparent opacity={0.25} />
        </mesh>

        {/* Electromagnetic Waveform Overlay */}
        {isWaveMode && (
          <lineSegments>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[wavePositions, 3]} />
            </bufferGeometry>
            <lineBasicMaterial color={pulseColor} linewidth={2} />
          </lineSegments>
        )}
      </group>
    </group>
  );
}

export function LightTravelSimulation3D({
  onTestedSimulation,
}: {
  onTestedSimulation?: () => void;
}) {
  const [selectedTarget, setSelectedTarget] = useState<LightTravelTarget>(LIGHT_TRAVEL_TARGETS[1]); // Default Sun
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [isWaveMode, setIsWaveMode] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0); // 0 to 1

  // Handle animation tick
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const deltaSec = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (isPlaying) {
        setProgress((prev) => {
          const step = (deltaSec / selectedTarget.simulationDurationSec) * speedMultiplier;
          const next = prev + step;
          if (next >= 1) {
            onTestedSimulation?.();
            return 0; // Loop seamlessly
          }
          return next;
        });
      }
      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, selectedTarget, speedMultiplier, onTestedSimulation]);

  const handleSelectTarget = (target: LightTravelTarget) => {
    setSelectedTarget(target);
    setProgress(0);
    setIsPlaying(true);
    onTestedSimulation?.();
  };

  const handleReset = () => {
    setProgress(0);
  };

  // Human-readable compression scale calculation
  const compressionLabel = useMemo(() => {
    if (selectedTarget.id === "moon") {
      return "Compressed ~2x: 1 real second ≈ 0.5s in simulation";
    }
    if (selectedTarget.id === "sun") {
      return "Compressed ~110x: 499 real seconds (8.3 mins) packed into 4.5 seconds";
    }
    if (selectedTarget.id === "mars") {
      return "Compressed ~135x: 12.5 real minutes packed into 5.5 seconds";
    }
    if (selectedTarget.id === "jupiter") {
      return "Compressed ~400x: 43 real minutes packed into 6.5 seconds";
    }
    if (selectedTarget.id === "proxima_centauri") {
      return "Compressed ~18 Million times: 4.25 real years packed into 7.5 seconds";
    }
    if (selectedTarget.id === "sirius") {
      return "Compressed ~34 Million times: 8.6 real years packed into 8.0 seconds";
    }
    if (selectedTarget.id === "betelgeuse") {
      return "Compressed ~2.2 Billion times: 642 real years packed into 9.0 seconds";
    }
    if (selectedTarget.id === "sagittarius_a") {
      return "Compressed ~84 Billion times: 26,700 real years packed into 10.0 seconds";
    }
    if (selectedTarget.id === "andromeda") {
      return "Compressed ~7 Trillion times: 2.537 Million years packed into 11.0 seconds";
    }
    if (selectedTarget.id === "sombrero") {
      return "Compressed ~77 Trillion times: 29.3 Million years packed into 12.0 seconds";
    }
    return "Compressed ~31 Quadrillion times: 13.4 Billion years packed into 13.5 seconds";
  }, [selectedTarget]);

  return (
    <div className="rounded-3xl border border-cyan-500/30 bg-slate-950 p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
      {/* Header Info Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-1">
            <Zap className="size-3.5 text-cyan-400" />
            <span>3D Interactive Light-Travel Engine</span>
            <span>•</span>
            <span>Speed: c = 299,792 km/s</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Photon Journey: {selectedTarget.name} → Earth
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
            Watch a traveling photon packet cross space at the speed of light. Compare actual cosmic
            travel time with the time-compressed visualization.
          </p>
        </div>

        {/* Time Comparison Badges */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 shrink-0">
          <div className="px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
            <span className="block text-[10px] uppercase font-bold text-amber-400">
              Actual Travel Time:
            </span>
            <span className="font-mono font-extrabold text-sm">
              {selectedTarget.lightTravelTimeDisplay}
            </span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs">
            <span className="block text-[10px] uppercase font-bold text-cyan-400">
              Cosmic Distance:
            </span>
            <span className="font-mono font-bold text-xs">{selectedTarget.distanceDisplay}</span>
          </div>
        </div>
      </div>

      {/* Target Selector Tabs (Grouped by Scales) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
          <span>Choose Celestial Source:</span>
          <span className="text-[11px] font-mono text-cyan-400 lowercase">
            {LIGHT_TRAVEL_TARGETS.length} real cosmic benchmarks
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {LIGHT_TRAVEL_TARGETS.map((t) => {
            const isSelected = t.id === selectedTarget.id;
            return (
              <button
                key={t.id}
                onClick={() => handleSelectTarget(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30 ring-1 ring-cyan-300"
                    : "bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span
                  className="size-2 rounded-full inline-block"
                  style={{ backgroundColor: t.colorHex }}
                />
                <span>{t.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3D Canvas Viewport */}
      <div className="relative h-[420px] sm:h-[480px] w-full rounded-2xl bg-slate-950 border border-white/10 overflow-hidden shadow-inner">
        <Canvas
          camera={{ position: [0, 4.5, 11], fov: 45 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        >
          <color attach="background" args={["#020617"]} />
          <Stars radius={80} depth={40} count={1200} factor={3} fade />
          <ambientLight intensity={0.4} />
          <pointLight position={[-6, 0, 0]} intensity={2.5} color={selectedTarget.colorHex} />
          <directionalLight position={[5, 10, 5]} intensity={1.2} />

          {/* Left Celestial Source */}
          <CelestialBodyObject target={selectedTarget} isSource={true} />

          {/* Right Celestial Observer: Earth */}
          <CelestialBodyObject target={selectedTarget} isSource={false} />

          {/* Animated Light Pulse traveling across space */}
          <TravelingLightPulse
            progressRatio={progress}
            isWaveMode={isWaveMode}
            pulseColor={selectedTarget.colorHex}
          />

          <OrbitControls
            enableZoom={true}
            maxDistance={18}
            minDistance={4}
            maxPolarAngle={Math.PI / 1.8}
            minPolarAngle={Math.PI / 4}
          />
        </Canvas>

        {/* 3D HUD: Celestial Labels on Left and Right */}
        <div className="absolute top-4 left-4 pointer-events-none">
          <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl text-left">
            <span className="text-[10px] font-mono text-cyan-400 block uppercase font-bold">
              [Source Emitter]
            </span>
            <span className="text-sm font-bold text-white">{selectedTarget.name}</span>
          </div>
        </div>

        <div className="absolute top-4 right-4 pointer-events-none">
          <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl text-right">
            <span className="text-[10px] font-mono text-emerald-400 block uppercase font-bold">
              [Observer Destination]
            </span>
            <span className="text-sm font-bold text-white">Planet Earth (Humanity)</span>
          </div>
        </div>

        {/* Live Traveling Photon Readout Badge */}
        <div className="absolute bottom-4 inset-x-4 flex flex-col sm:flex-row items-center justify-between gap-3 pointer-events-none">
          <div className="bg-slate-900/90 backdrop-blur-md border border-white/15 px-4 py-2 rounded-xl text-xs flex items-center gap-3">
            <Activity className="size-4 text-cyan-400 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-bold">Photon In Flight:</span>
                <span className="font-mono text-cyan-300 font-bold">
                  {(progress * 100).toFixed(1)}% Completed
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">{compressionLabel}</p>
            </div>
          </div>

          <div className="bg-slate-900/90 backdrop-blur-md border border-cyan-500/30 px-3 py-1.5 rounded-xl text-xs text-slate-300 text-center sm:text-right">
            <span className="text-[10px] uppercase font-bold text-cyan-400 block">
              Constant Speed in Vacuum:
            </span>
            <span className="font-mono font-bold text-white">299,792,458 m/s</span>
          </div>
        </div>
      </div>

      {/* Progress Track Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-mono text-slate-400">
          <span>Source: {selectedTarget.name} (Emitted in the Past)</span>
          <span className="text-cyan-400 font-bold">
            Travel Progress: {(progress * 100).toFixed(0)}%
          </span>
          <span>Destination: Earth (Today)</span>
        </div>
        <div className="w-full h-3 rounded-full bg-slate-900 border border-white/10 overflow-hidden relative">
          <div
            className="h-full rounded-full transition-all duration-75"
            style={{
              width: `${Math.min(100, Math.max(0, progress * 100))}%`,
              background: `linear-gradient(90deg, ${selectedTarget.colorHex}, #ffffff)`,
            }}
          />
        </div>
      </div>

      {/* Control Deck (Playback, Speed, Wave vs Photon, Reset) */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => setIsPlaying(!isPlaying)}
            size="sm"
            className={`${
              isPlaying
                ? "bg-amber-600 hover:bg-amber-500 text-white"
                : "bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="size-4 mr-1.5" /> Pause Journey
              </>
            ) : (
              <>
                <Play className="size-4 mr-1.5" /> Resume Pulse
              </>
            )}
          </Button>

          <Button
            onClick={handleReset}
            size="sm"
            variant="outline"
            className="border-white/10 text-white hover:bg-white/5"
          >
            <RotateCcw className="size-3.5 mr-1.5" /> Restart Wave
          </Button>

          {/* Wave Mode Toggle */}
          <Button
            onClick={() => setIsWaveMode(!isWaveMode)}
            size="sm"
            variant="outline"
            className={`border-white/10 ${
              isWaveMode ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/50" : "text-slate-300"
            }`}
          >
            <Layers className="size-3.5 mr-1.5" />
            {isWaveMode ? "Mode: Wave & Photon" : "Mode: Particle Only"}
          </Button>
        </div>

        {/* Speed Multipliers */}
        <div className="flex items-center gap-1 text-xs">
          <span className="text-slate-400 font-semibold mr-1.5">Sim Speed:</span>
          {[0.5, 1, 2, 5].map((multiplier) => (
            <button
              key={multiplier}
              onClick={() => setSpeedMultiplier(multiplier)}
              className={`px-2.5 py-1 rounded-lg font-mono font-semibold transition-all ${
                speedMultiplier === multiplier
                  ? "bg-cyan-500 text-slate-950 font-bold"
                  : "bg-white/5 text-slate-400 hover:text-white"
              }`}
            >
              {multiplier}x
            </button>
          ))}
        </div>
      </div>

      {/* Historical Era & Lookback Insight Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/30 via-slate-900/60 to-purple-950/30 border border-cyan-500/30 space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400">
          <Clock className="size-4" />
          <span>What Was Happening on Earth When This Light Began Its Trip?</span>
        </div>
        <p className="text-sm text-slate-200 leading-relaxed font-medium">
          {selectedTarget.lookbackEraEarth}
        </p>
        <p className="text-xs text-slate-400 pt-1 leading-relaxed">{selectedTarget.description}</p>
      </div>
    </div>
  );
}
