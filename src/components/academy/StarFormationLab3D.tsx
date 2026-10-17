import React, { useRef, useState, useMemo, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import {
  calculateStarFormationPhysics,
  calculateCollapseProfile,
  YSO_STAGES,
  type MolecularCloudParams,
  type YSOClass,
} from "@/lib/astronomy/astrophysics-lab/star-formation-engine";
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Info,
  Sliders,
  ChevronRight,
  Flame,
  Activity,
  Maximize2,
  Atom,
  HelpCircle,
  Wind,
  Compass,
  AlertTriangle,
  CheckCircle2,
  Layers,
  Thermometer,
  Gauge,
  Eye,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

// ----------------------------------------------------------------------------
// Preset Astronomical Objects
// ----------------------------------------------------------------------------
interface ObservedPreset {
  name: string;
  stage: YSOClass;
  tempK: number;
  density: number;
  mass: number;
  catalogId: string;
  distanceLy: string;
  description: string;
}

const OBSERVED_PRESETS: ObservedPreset[] = [
  {
    name: "Barnard 68",
    stage: "prestellar_core",
    tempK: 16,
    density: 2.5e5,
    mass: 2.1,
    catalogId: "LDN 57 / B68",
    distanceLy: "500 ly (Ophiuchus)",
    description:
      "Cold, dense dark absorption globule poised on the edge of gravitational collapse.",
  },
  {
    name: "IRAS 16293-2422",
    stage: "class_0",
    tempK: 25,
    density: 1.2e6,
    mass: 3.5,
    catalogId: "IRAS 16293-2422",
    distanceLy: "460 ly (Rho Ophiuchi)",
    description: "Deeply embedded Class 0 protostellar binary driving powerful molecular outflows.",
  },
  {
    name: "HH 212 / HH 34",
    stage: "class_I",
    tempK: 35,
    density: 8e5,
    mass: 4.8,
    catalogId: "Herbig-Haro 212",
    distanceLy: "1,300 ly (Orion B)",
    description: "Spectacular highly collimated symmetric supersonic Herbig-Haro bipolar jets.",
  },
  {
    name: "HL Tauri",
    stage: "class_II",
    tempK: 45,
    density: 4e5,
    mass: 2.2,
    catalogId: "HL Tau (ALMA DSHARP)",
    distanceLy: "450 ly (Taurus)",
    description: "Iconic protoplanetary disk with concentric dust rings and carved planetary gaps.",
  },
  {
    name: "Young Sun / ZAMS",
    stage: "class_III",
    tempK: 55,
    density: 1e5,
    mass: 1.0,
    catalogId: "Sol (4.6 Gyr ago)",
    distanceLy: "0 ly (Solar System)",
    description: "Zero-Age Main Sequence ignition: sustained hydrogen fusion halts contraction.",
  },
];

// ----------------------------------------------------------------------------
// 3D Visualizer Component for Star Formation Stages
// ----------------------------------------------------------------------------
interface SceneProps {
  stage: YSOClass;
  isPlaying: boolean;
  simTime: number;
  infallVelocityKmS: number;
  mobileQuality: boolean;
}

function StarFormationVisualizerScene({
  stage,
  isPlaying,
  simTime,
  infallVelocityKmS,
  mobileQuality,
}: SceneProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const diskRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const jetRef = useRef<THREE.Group>(null);

  // Particle configuration adapted dynamically to stage
  const particleCount = mobileQuality ? 500 : 1400;

  const { positions, colors, velocities, originalRadii } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);
    const vel = new Float32Array(particleCount * 3);
    const radii = new Float32Array(particleCount);

    const baseColor =
      stage === "prestellar_core"
        ? new THREE.Color("#0284c7")
        : stage === "class_0"
          ? new THREE.Color("#f97316")
          : stage === "class_I"
            ? new THREE.Color("#fbbf24")
            : stage === "class_II"
              ? new THREE.Color("#38bdf8")
              : new THREE.Color("#facc15");

    for (let i = 0; i < particleCount; i++) {
      let r = 0;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      if (stage === "prestellar_core") {
        // Turbulent cloud: random sphere distribution
        r = 1.0 + Math.random() * 4.0;
        pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        pos[i * 3 + 2] = r * Math.cos(phi);
      } else if (stage === "class_0" || stage === "class_I") {
        // Infalling envelope + flattening
        r = 0.4 + Math.pow(Math.random(), 1.8) * 3.5;
        const flattening = 0.45;
        pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * flattening;
        pos[i * 3 + 2] = r * Math.cos(phi);
      } else if (stage === "class_II") {
        // Flared Keplerian protoplanetary disk
        r = 0.5 + Math.pow(Math.random(), 1.3) * 3.2;
        const scaleHeight = 0.08 * Math.pow(r, 1.2);
        const z = (Math.random() - 0.5) * scaleHeight * 2;
        pos[i * 3] = r * Math.cos(theta);
        pos[i * 3 + 1] = z;
        pos[i * 3 + 2] = r * Math.sin(theta);
      } else {
        // Class III / ZAMS: Thin residual debris ring + clear cavity
        r = 1.2 + Math.random() * 2.5;
        const z = (Math.random() - 0.5) * 0.06;
        pos[i * 3] = r * Math.cos(theta);
        pos[i * 3 + 1] = z;
        pos[i * 3 + 2] = r * Math.sin(theta);
      }

      radii[i] = r;

      // Color variation based on depth / temperature
      const depthFactor = Math.max(0.2, 1.0 - r / 4.5);
      col[i * 3] = baseColor.r * (0.6 + 0.4 * depthFactor);
      col[i * 3 + 1] = baseColor.g * (0.6 + 0.4 * depthFactor);
      col[i * 3 + 2] = baseColor.b * (0.6 + 0.4 * depthFactor);

      // Infall velocity vectors
      vel[i * 3] = -pos[i * 3] * 0.05;
      vel[i * 3 + 1] = -pos[i * 3 + 1] * 0.05;
      vel[i * 3 + 2] = -pos[i * 3 + 2] * 0.05;
    }

    return { positions: pos, colors: col, velocities: vel, originalRadii: radii };
  }, [stage, particleCount]);

  useFrame((_, delta) => {
    if (!isPlaying) return;

    if (pointsRef.current) {
      const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;

      if (stage === "prestellar_core") {
        // Slow turbulent swirling
        pointsRef.current.rotation.y += delta * 0.04;
        pointsRef.current.rotation.x += delta * 0.02;
      } else if (stage === "class_0" || stage === "class_I") {
        // Supersonic infall toward center with angular momentum conservation
        pointsRef.current.rotation.y += delta * 0.25;

        const speedMultiplier = Math.min(infallVelocityKmS * 0.04, 0.4);
        for (let i = 0; i < particleCount; i++) {
          const idx = i * 3;
          const px = arr[idx];
          const py = arr[idx + 1];
          const pz = arr[idx + 2];
          const dist = Math.sqrt(px * px + py * py + pz * pz);

          if (dist > 0.35) {
            arr[idx] -= (px / dist) * delta * speedMultiplier;
            arr[idx + 1] -= (py / dist) * delta * speedMultiplier * 0.8;
            arr[idx + 2] -= (pz / dist) * delta * speedMultiplier;
          } else {
            // Recycle particle outward to simulate continuous inflow
            const resetR = originalRadii[i] || 3.0;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);
            arr[idx] = resetR * Math.sin(phi) * Math.cos(theta);
            arr[idx + 1] = resetR * Math.sin(phi) * Math.sin(theta) * 0.5;
            arr[idx + 2] = resetR * Math.cos(phi);
          }
        }
        posAttr.needsUpdate = true;
      } else if (stage === "class_II") {
        // Keplerian differential rotation v ~ r^-0.5
        pointsRef.current.rotation.y += delta * 0.35;
      } else {
        // ZAMS stable orbit
        pointsRef.current.rotation.y += delta * 0.15;
      }
    }

    if (diskRef.current) {
      diskRef.current.rotation.z += delta * 0.8;
    }

    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.5;
      // Core pulsing
      const pulse = 1.0 + Math.sin(simTime * 3) * 0.03;
      coreRef.current.scale.set(pulse, pulse, pulse);
    }

    if (jetRef.current) {
      jetRef.current.rotation.y += delta * 0.4;
    }
  });

  // Central Core parameters by stage
  const coreConfig = useMemo(() => {
    switch (stage) {
      case "prestellar_core":
        return { size: 0.7, color: "#1e3a8a", opacity: 0.5, glow: false };
      case "class_0":
        return { size: 0.28, color: "#ea580c", opacity: 0.95, glow: true };
      case "class_I":
        return { size: 0.34, color: "#f59e0b", opacity: 0.98, glow: true };
      case "class_II":
        return { size: 0.42, color: "#fbbf24", opacity: 1.0, glow: true };
      case "class_III":
        return { size: 0.52, color: "#fef08a", opacity: 1.0, glow: true };
    }
  }, [stage]);

  return (
    <group>
      {/* 1. Dust & Gas Particle System */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={mobileQuality ? 0.08 : 0.055}
          vertexColors
          transparent
          opacity={stage === "prestellar_core" ? 0.85 : 0.7}
          blending={stage === "prestellar_core" ? THREE.NormalBlending : THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* 2. Central Protostellar Core */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[coreConfig.size, 32, 32]} />
        <meshStandardMaterial
          color={coreConfig.color}
          emissive={coreConfig.glow ? coreConfig.color : "#000000"}
          emissiveIntensity={coreConfig.glow ? 1.8 : 0}
          roughness={0.2}
          transparent={coreConfig.opacity < 1.0}
          opacity={coreConfig.opacity}
        />
      </mesh>

      {/* 3. Core Glow Aura for Class 0, I, II, III */}
      {coreConfig.glow && (
        <mesh>
          <sphereGeometry args={[coreConfig.size * 1.5, 24, 24]} />
          <meshBasicMaterial
            color={coreConfig.color}
            transparent
            opacity={0.25}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* 4. Keplerian Accretion Disk for Class 0, I, II */}
      {(stage === "class_0" || stage === "class_I" || stage === "class_II") && (
        <mesh ref={diskRef} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[coreConfig.size * 1.15, stage === "class_II" ? 2.8 : 1.8, 64, 1]} />
          <meshStandardMaterial
            color={stage === "class_II" ? "#e0f2fe" : "#d97706"}
            emissive={stage === "class_II" ? "#38bdf8" : "#b45309"}
            emissiveIntensity={0.6}
            side={THREE.DoubleSide}
            transparent
            opacity={stage === "class_II" ? 0.75 : 0.6}
            roughness={0.4}
          />
        </mesh>
      )}

      {/* 5. Bipolar Outflow Jets & Herbig-Haro Bow Shocks (Class 0 and Class I) */}
      {(stage === "class_0" || stage === "class_I") && (
        <group ref={jetRef}>
          {/* North Jet Cylinder */}
          <mesh position={[0, 1.8, 0]}>
            <cylinderGeometry args={[0.03, 0.08, 3.2, 16]} />
            <meshBasicMaterial
              color="#38bdf8"
              transparent
              opacity={0.8}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          {/* North Bow Shock Knot */}
          <mesh position={[0, 3.4, 0]}>
            <coneGeometry args={[0.25, 0.4, 16]} />
            <meshBasicMaterial
              color="#67e8f9"
              transparent
              opacity={0.85}
              blending={THREE.AdditiveBlending}
            />
          </mesh>

          {/* South Jet Cylinder */}
          <mesh position={[0, -1.8, 0]} rotation={[Math.PI, 0, 0]}>
            <cylinderGeometry args={[0.03, 0.08, 3.2, 16]} />
            <meshBasicMaterial
              color="#38bdf8"
              transparent
              opacity={0.8}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          {/* South Bow Shock Knot */}
          <mesh position={[0, -3.4, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.25, 0.4, 16]} />
            <meshBasicMaterial
              color="#67e8f9"
              transparent
              opacity={0.85}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </group>
      )}

      {/* 6. ZAMS Radiant Corona & Solar Flares (Class III) */}
      {stage === "class_III" && (
        <group>
          <pointLight color="#fef08a" intensity={3.5} distance={20} />
          <ambientLight intensity={0.4} />
        </group>
      )}
    </group>
  );
}

// ----------------------------------------------------------------------------
// Master StarFormationLab3D Component
// ----------------------------------------------------------------------------
export function StarFormationLab3D() {
  const [stage, setStage] = useState<YSOClass>("class_0");
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [simTime, setSimTime] = useState<number>(0);
  const [selectedPreset, setSelectedPreset] = useState<string | null>("IRAS 16293-2422");
  const [mobileQuality, setMobileQuality] = useState<boolean>(false);

  // Physical Parameters State
  const [params, setParams] = useState<MolecularCloudParams>({
    temperatureK: 25,
    densityCm3: 1.2e6,
    cloudMassSolar: 3.5,
    magneticFieldMicroGauss: 30,
    turbulenceKmS: 1.2,
  });

  // Calculate live astrophysics
  const physics = useMemo(() => calculateStarFormationPhysics(params), [params]);
  const stageInfo = YSO_STAGES[stage];

  // Infall profile at r = 5 AU
  const collapseProfile = useMemo(() => {
    return calculateCollapseProfile(5.0, 100.0);
  }, []);

  // Simulation Clock Tick
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setSimTime((t) => t + 0.05);
    }, 50);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Handle Preset Selection
  const applyPreset = (preset: ObservedPreset) => {
    setSelectedPreset(preset.name);
    setStage(preset.stage);
    setParams({
      temperatureK: preset.tempK,
      densityCm3: preset.density,
      cloudMassSolar: preset.mass,
      magneticFieldMicroGauss: 25,
      turbulenceKmS: 1.0,
    });
  };

  const stagesList: YSOClass[] = ["prestellar_core", "class_0", "class_I", "class_II", "class_III"];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 text-white shadow-2xl space-y-6">
      {/* 1. Header with Scientific Status & Presets */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-orange-500/15 text-orange-400 border border-orange-500/30">
              <Flame className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold tracking-tight text-white">
                  Star Formation Laboratory
                </h2>
                {/* Epistemological Status Badge */}
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                    stageInfo.statusBadge === "OBSERVATION"
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/40"
                      : stageInfo.statusBadge === "MODEL"
                        ? "bg-amber-500/15 text-amber-400 border-amber-500/40"
                        : "bg-purple-500/15 text-purple-400 border-purple-500/40"
                  }`}
                >
                  [{stageInfo.statusBadge}]
                </span>
                <span className="text-xs text-slate-400">· YSO Evolutionary Class</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                From cold molecular cloud collapse to zero-age main sequence hydrogen ignition
              </p>
            </div>
          </div>
        </div>

        {/* Observed Target Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mr-1 flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-cyan-400" /> Presets:
          </span>
          {OBSERVED_PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => applyPreset(p)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition whitespace-nowrap border ${
                selectedPreset === p.name
                  ? "bg-orange-500/20 text-orange-300 border-orange-500/50 shadow-sm"
                  : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Observational Disclaimer Notice */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-2.5 flex items-start gap-3 text-xs text-amber-300/90 leading-relaxed">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-amber-200">
            Epistemological Transparency Notice:{" "}
          </span>
          This laboratory models scientifically plausible hydrodynamic collapse and accretion
          physics (Shu 1977, Bonnor-Ebert). When selecting real astronomical targets, the
          visualization illustrates physical processes governing their evolutionary class—not an
          exact historical recording of that specific object's past.
        </div>
      </div>

      {/* 3. Stage Stepper Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {stagesList.map((key, idx) => {
          const info = YSO_STAGES[key];
          const isSelected = stage === key;
          return (
            <button
              key={key}
              onClick={() => {
                setStage(key);
                setSelectedPreset(null);
              }}
              className={`p-3 rounded-xl border text-left transition relative flex flex-col justify-between ${
                isSelected
                  ? "bg-slate-900 border-orange-500/60 shadow-lg shadow-orange-500/10"
                  : "bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400"
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider mb-1">
                  <span className={isSelected ? "text-orange-400 font-bold" : "text-slate-500"}>
                    Stage {idx + 1}
                  </span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                      info.statusBadge === "OBSERVATION"
                        ? "text-emerald-400 bg-emerald-500/10"
                        : "text-amber-400 bg-amber-500/10"
                    }`}
                  >
                    {info.statusBadge}
                  </span>
                </div>
                <div
                  className={`text-xs font-semibold leading-snug ${
                    isSelected ? "text-white" : "text-slate-300"
                  }`}
                >
                  {info.astronomicalClass}
                </div>
              </div>
              <div className="text-[10px] text-slate-400 mt-2 truncate">{info.typicalAgeYears}</div>
            </button>
          );
        })}
      </div>

      {/* 4. Main Interactive Area: 3D Canvas + Physics Telemetry Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 3D Visualizer Canvas (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-3">
          <div className="relative h-[440px] w-full rounded-2xl overflow-hidden border border-slate-800 bg-black shadow-inner">
            <Canvas camera={{ position: [0, 2.5, 5.5], fov: 45 }}>
              <color attach="background" args={["#030712"]} />
              <ambientLight intensity={0.25} />
              <pointLight position={[10, 10, 10]} intensity={1.2} />
              <Suspense fallback={null}>
                <StarFormationVisualizerScene
                  stage={stage}
                  isPlaying={isPlaying}
                  simTime={simTime}
                  infallVelocityKmS={collapseProfile.infallVelocityKmS}
                  mobileQuality={mobileQuality}
                />
              </Suspense>
              <OrbitControls
                enablePan={true}
                enableZoom={true}
                maxDistance={12}
                minDistance={1.2}
              />
            </Canvas>

            {/* Overlaid Playback & Viewport Controls */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setIsPlaying((p) => !p)}
                className="h-8 px-3 bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700/60 backdrop-blur-md"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 mr-1 text-amber-400" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Resume
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSimTime(0)}
                className="h-8 px-2.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-700/60 backdrop-blur-md"
                title="Reset simulation time"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </Button>
            </div>

            {/* Stage Title Overlay */}
            <div className="absolute top-3 right-3 text-right">
              <div className="px-3 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-xs font-mono text-cyan-300">
                {stageInfo.name}
              </div>
            </div>

            {/* Bottom Floating Legend */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-slate-300 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Cold Dust
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Infall Gas
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400" /> Bipolar Jet
                </span>
              </div>
              <button
                onClick={() => setMobileQuality((m) => !m)}
                className="text-[10px] text-slate-400 hover:text-white transition"
              >
                Particles: {mobileQuality ? "Low (500)" : "High (1,400)"}
              </button>
            </div>
          </div>

          {/* Observational Diagnostics for Selected Stage */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
            <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-cyan-400" /> Observational Diagnostics & Telescopes:
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-slate-400">
              {stageInfo.observationalDiagnostics.map((diag, i) => (
                <li
                  key={i}
                  className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 leading-relaxed"
                >
                  {diag}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Physics Controls & Mathematical Calculations (5 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          {/* 1. Numerical Stability & Collapse Predictor Card */}
          <div
            className={`p-4 rounded-xl border ${
              physics.willCollapse
                ? "bg-emerald-950/20 border-emerald-500/40"
                : "bg-rose-950/20 border-rose-500/40"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gauge
                  className={`w-4 h-4 ${
                    physics.willCollapse ? "text-emerald-400" : "text-rose-400"
                  }`}
                />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Jeans Stability Condition
                </span>
              </div>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  physics.willCollapse
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "bg-rose-500/20 text-rose-300"
                }`}
              >
                {physics.willCollapse ? "UNSTABLE: COLLAPSE ACTIVE" : "STABLE: EXPANSION / VIRIAL"}
              </span>
            </div>

            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              {physics.willCollapse
                ? `Cloud mass (${params.cloudMassSolar.toFixed(1)} M☉) exceeds Jeans mass (${physics.jeansMassSolar.toFixed(1)} M☉). Gravity overcomes internal thermal and turbulent support.`
                : `Thermal sound speed (${physics.effectiveSoundSpeedKmS.toFixed(2)} km/s) maintains pressure balance against gravity (M < M_J).`}
            </p>
          </div>

          {/* 2. Interactive Physics Sliders */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/70 space-y-4">
            <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-orange-400" /> Physical Input Parameters:
              </span>
              <button
                onClick={() =>
                  setParams({
                    temperatureK: 15,
                    densityCm3: 1e5,
                    cloudMassSolar: 10,
                    magneticFieldMicroGauss: 30,
                    turbulenceKmS: 1.0,
                  })
                }
                className="text-[10px] text-slate-400 hover:text-slate-200"
              >
                Reset
              </button>
            </div>

            {/* Slider 1: Temperature */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <Thermometer className="w-3 h-3 text-cyan-400" /> Temperature (T)
                </span>
                <span className="font-mono text-cyan-300">{params.temperatureK} K</span>
              </div>
              <Slider
                min={5}
                max={80}
                step={1}
                value={[params.temperatureK]}
                onValueChange={([val]) => {
                  setParams((p) => ({ ...p, temperatureK: val }));
                  setSelectedPreset(null);
                }}
              />
            </div>

            {/* Slider 2: Gas Density */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <Atom className="w-3 h-3 text-emerald-400" /> Molecular Density (n_H2)
                </span>
                <span className="font-mono text-emerald-300">
                  {params.densityCm3.toExponential(1)} cm⁻³
                </span>
              </div>
              <Slider
                min={2}
                max={7}
                step={0.1}
                value={[Math.log10(params.densityCm3)]}
                onValueChange={([val]) => {
                  setParams((p) => ({ ...p, densityCm3: Math.pow(10, val) }));
                  setSelectedPreset(null);
                }}
              />
            </div>

            {/* Slider 3: Cloud Mass */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <Gauge className="w-3 h-3 text-amber-400" /> Cloud Mass (M_cloud)
                </span>
                <span className="font-mono text-amber-300">
                  {params.cloudMassSolar.toFixed(1)} M☉
                </span>
              </div>
              <Slider
                min={0.5}
                max={100}
                step={0.5}
                value={[params.cloudMassSolar]}
                onValueChange={([val]) => {
                  setParams((p) => ({ ...p, cloudMassSolar: val }));
                  setSelectedPreset(null);
                }}
              />
            </div>

            {/* Slider 4: Turbulence */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <Wind className="w-3 h-3 text-purple-400" /> Supersonic Turbulence
                </span>
                <span className="font-mono text-purple-300">
                  {params.turbulenceKmS.toFixed(1)} km/s
                </span>
              </div>
              <Slider
                min={0.2}
                max={5.0}
                step={0.1}
                value={[params.turbulenceKmS]}
                onValueChange={([val]) => {
                  setParams((p) => ({ ...p, turbulenceKmS: val }));
                  setSelectedPreset(null);
                }}
              />
            </div>
          </div>

          {/* 3. Real-Time Astrophysics Calculations Grid */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 space-y-3">
            <div className="text-xs font-semibold text-slate-300">Derived Theoretical Metrics:</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">Jeans Mass (M_J)</div>
                <div className="text-sm font-mono font-bold text-amber-300">
                  {physics.jeansMassSolar < 0.1
                    ? `${(physics.jeansMassSolar * 1047).toFixed(1)} M_Jup`
                    : `${physics.jeansMassSolar.toFixed(2)} M☉`}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">Jeans Length (λ_J)</div>
                <div className="text-sm font-mono font-bold text-cyan-300">
                  {physics.jeansLengthLy.toFixed(3)} ly
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">Free-Fall Time (t_ff)</div>
                <div className="text-sm font-mono font-bold text-emerald-300">
                  {physics.freeFallTimeYears > 1e6
                    ? `${(physics.freeFallTimeYears / 1e6).toFixed(2)} Myr`
                    : `${Math.round(physics.freeFallTimeYears).toLocaleString()} yr`}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">Bonnor-Ebert Mass</div>
                <div className="text-sm font-mono font-bold text-purple-300">
                  {physics.bonnorEbertMassSolar.toFixed(2)} M☉
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
