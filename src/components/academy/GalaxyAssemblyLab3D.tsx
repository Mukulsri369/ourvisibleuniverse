// @ts-nocheck
import React, { useState, useMemo, useRef, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import {
  GALAXY_ASSEMBLY_STAGES,
  calculateMergerPhysics,
  type GalaxyAssemblyStageId,
  type GalaxyAssemblyStage,
} from "@/lib/astronomy/astrophysics-lab/galaxy-assembly-engine";
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
  Orbit,
  Disc,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Cosmos3DAdapter } from "@/lib/cosmos/Cosmos3DAdapter";
import type { ApprovedDemonstrationId } from "@/lib/cosmos/cosmos-types";

// ----------------------------------------------------------------------------
// Observed Galaxy Presets
// ----------------------------------------------------------------------------
interface ObservedGalaxyPreset {
  name: string;
  stageId: GalaxyAssemblyStageId;
  massRatio: number;
  gasFraction: number;
  catalogId: string;
  distanceMly: string;
  morphology: string;
  description: string;
}

const OBSERVED_GALAXY_PRESETS: ObservedGalaxyPreset[] = [
  {
    name: "Cosmic Dawn Protogalaxy",
    stageId: "dm_halo_collapse",
    massRatio: 1.0,
    gasFraction: 0.95,
    catalogId: "GN-z11 / JADES-GS-z14-0",
    distanceMly: "32,000 Mly (z = 10.6)",
    morphology: "Mini-halo with nascent compact starburst",
    description:
      "Earliest known cosmic structure imaged by JWST, emerging in a virializing dark matter mini-halo.",
  },
  {
    name: "Cosmic Noon Clumpy Disk",
    stageId: "turbulent_clumpy_disk",
    massRatio: 1.0,
    gasFraction: 0.65,
    catalogId: "CANDELS-UDS z=2.1 Disk",
    distanceLy: "10,500 Mly (z = 2.1)",
    morphology: "Thick, highly turbulent gas-rich clumpy disk",
    description:
      "Peak cosmic star-formation epoch: gravitationally unstable Toomre clumps forming massive star clusters.",
  },
  {
    name: "The Antennae Galaxies",
    stageId: "galaxy_collision_tidal_tails",
    massRatio: 1.0,
    gasFraction: 0.45,
    catalogId: "NGC 4038 / NGC 4039",
    distanceMly: "65 Mly (Corvus)",
    morphology: "Major prograde collision with sweeping tidal tails",
    description:
      "Iconic pair of colliding spirals with 300,000-light-year sweeping tidal bridges and violent starbursts.",
  },
  {
    name: "The Mice Galaxies",
    stageId: "nuclear_starburst_merger",
    massRatio: 1.0,
    gasFraction: 0.35,
    catalogId: "NGC 4676 A & B",
    distanceMly: "290 Mly (Coma Berenices)",
    morphology: "Interpenetrating galactic nuclei approaching coalescence",
    description:
      "Dramatic tidal tails produced by prograde parabolic encounter, heading toward single elliptical merger.",
  },
  {
    name: "Messier 87 (Virgo Core)",
    stageId: "quenched_elliptical_remnant",
    massRatio: 1.0,
    gasFraction: 0.05,
    catalogId: "M87 / NGC 4486",
    distanceMly: "53.5 Mly (Virgo Cluster)",
    morphology: "Giant cD Elliptical with SMBH relativistic jet",
    description:
      "Ancient relic of dozens of past major mergers, harboring a 6.5-billion-solar-mass central black hole.",
  },
];

// ----------------------------------------------------------------------------
// 3D Visualizer Scene for Galaxy Assembly & Collisions
// ----------------------------------------------------------------------------
interface SceneProps {
  stageId: GalaxyAssemblyStageId;
  massRatio: number;
  gasFraction: number;
  isPlaying: boolean;
  simTime: number;
  mobileQuality: boolean;
}

function GalaxyAssemblyScene({
  stageId,
  massRatio,
  gasFraction,
  isPlaying,
  simTime,
  mobileQuality,
}: SceneProps) {
  const pointsRefA = useRef<THREE.Points>(null);
  const pointsRefB = useRef<THREE.Points>(null);
  const haloRef = useRef<THREE.Mesh>(null);

  const particleCount = mobileQuality ? 800 : 1800;

  // Particle positions for Galaxy A and Galaxy B
  const { positionsA, colorsA, positionsB, colorsB } = useMemo(() => {
    const posA = new Float32Array(particleCount * 3);
    const colA = new Float32Array(particleCount * 3);
    const posB = new Float32Array(particleCount * 3);
    const colB = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      // Spiral disk distribution
      const rA = 0.3 + Math.pow(Math.random(), 1.5) * 3.2;
      const thetaA = Math.random() * Math.PI * 2;
      const armOffsetA = 2.5 * Math.log(rA + 0.1);
      const angleA = thetaA + (i % 2 === 0 ? armOffsetA : armOffsetA + Math.PI);
      const zA = (Math.random() - 0.5) * 0.15;

      posA[i * 3] = rA * Math.cos(angleA);
      posA[i * 3 + 1] = zA;
      posA[i * 3 + 2] = rA * Math.sin(angleA);

      // Gas fraction color: higher gas fraction -> bluer/hotter starburst
      colA[i * 3] = 0.3 + gasFraction * 0.4;
      colA[i * 3 + 1] = 0.6 + gasFraction * 0.3;
      colA[i * 3 + 2] = 0.95;

      // Galaxy B (secondary merger companion)
      const rB = (0.2 + Math.pow(Math.random(), 1.5) * 2.5) * Math.sqrt(massRatio);
      const thetaB = Math.random() * Math.PI * 2;
      const angleB = thetaB + 2.0 * Math.log(rB + 0.1);
      const zB = (Math.random() - 0.5) * 0.15;

      posB[i * 3] = rB * Math.cos(angleB);
      posB[i * 3 + 1] = zB;
      posB[i * 3 + 2] = rB * Math.sin(angleB);

      colB[i * 3] = 0.95;
      colB[i * 3 + 1] = 0.65;
      colB[i * 3 + 2] = 0.35;
    }

    return { positionsA: posA, colorsA: colA, positionsB: posB, colorsB: colB };
  }, [massRatio, gasFraction, particleCount]);

  useFrame((_, delta) => {
    if (!isPlaying) return;

    if (stageId === "dm_halo_collapse" || stageId === "cold_filamentary_accretion") {
      // Infalling filamentary rotation
      if (pointsRefA.current) pointsRefA.current.rotation.y += delta * 0.1;
    } else if (stageId === "turbulent_clumpy_disk" || stageId === "supernova_feedback_winds") {
      // Rotating starburst disk
      if (pointsRefA.current) pointsRefA.current.rotation.y += delta * 0.3;
    } else if (stageId === "galaxy_collision_tidal_tails") {
      // Intersecting collision trajectory: Galaxy A and B approaching
      const t = simTime * 0.5;
      const sep = 2.2 * Math.sin(t);
      if (pointsRefA.current) {
        pointsRefA.current.position.set(-sep * 0.6, 0, 0);
        pointsRefA.current.rotation.y += delta * 0.35;
      }
      if (pointsRefB.current) {
        pointsRefB.current.position.set(sep * 0.6, 0.4 * Math.cos(t), 0);
        pointsRefB.current.rotation.z += delta * 0.25;
      }
    } else if (stageId === "nuclear_starburst_merger") {
      // Coalescing violently
      if (pointsRefA.current) pointsRefA.current.rotation.y += delta * 0.6;
      if (pointsRefB.current) pointsRefB.current.rotation.y += delta * 0.5;
    } else {
      // Quenched elliptical relaxed spheroid
      if (pointsRefA.current) pointsRefA.current.rotation.y += delta * 0.08;
    }
  });

  const showSecondGalaxy =
    stageId === "galaxy_collision_tidal_tails" || stageId === "nuclear_starburst_merger";

  return (
    <group>
      {/* 1. Dark Matter Halo Enveloping Spheroid (Transparent) */}
      <mesh ref={haloRef}>
        <sphereGeometry args={[4.2, 24, 24]} />
        <meshBasicMaterial
          color="#1e1b4b"
          transparent
          opacity={stageId === "dm_halo_collapse" ? 0.35 : 0.12}
          wireframe={true}
        />
      </mesh>

      {/* 2. Galaxy A Stars & Gas Particles */}
      <points ref={pointsRefA}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positionsA, 3]} />
          <bufferAttribute attach="attributes-color" args={[colorsA, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={mobileQuality ? 0.06 : 0.045}
          vertexColors
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Central Supermassive Black Hole & Luminous Core */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.2, 24, 24]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* 3. Galaxy B Companion (During Mergers) */}
      {showSecondGalaxy && (
        <points ref={pointsRefB} position={[1.8, 0, 0]}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[positionsB, 3]} />
            <bufferAttribute attach="attributes-color" args={[colorsB, 3]} />
          </bufferGeometry>
          <pointsMaterial
            size={mobileQuality ? 0.06 : 0.045}
            vertexColors
            transparent
            opacity={0.8}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
      )}

      {/* Ambient Lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 0, 0]} color="#ffffff" intensity={2.0} distance={12} />
    </group>
  );
}

// ----------------------------------------------------------------------------
// Master GalaxyAssemblyLab3D Component
// ----------------------------------------------------------------------------
export function GalaxyAssemblyLab3D() {
  const [stageId, setStageId] = useState<GalaxyAssemblyStageId>("galaxy_collision_tidal_tails");
  const [massRatio, setMassRatio] = useState<number>(1.0); // 1:1 equal merger to 0.1 minor
  const [gasFraction, setGasFraction] = useState<number>(0.45);
  const [impactVelocityKmS, setImpactVelocityKmS] = useState<number>(250);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [simTime, setSimTime] = useState<number>(0);
  const [selectedPreset, setSelectedPreset] = useState<string | null>("The Antennae Galaxies");
  const [mobileQuality, setMobileQuality] = useState<boolean>(false);

  const stage = GALAXY_ASSEMBLY_STAGES[stageId];

  // Live merger physics calculations
  const physics = useMemo(() => {
    return calculateMergerPhysics(massRatio, gasFraction, impactVelocityKmS);
  }, [massRatio, gasFraction, impactVelocityKmS]);

  // Simulation Clock
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setSimTime((t) => t + 0.05);
    }, 50);
    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    const adapter = Cosmos3DAdapter.getInstance();
    const unregister = adapter.registerScene({
      sceneId: "galaxy_assembly",
      getCurrentSimulationState: () => ({
        isPaused: !isPlaying,
        timeScale: 1.0,
        activeSceneId: "galaxy_assembly",
        activeExperimentId: stageId,
        selectedObjectName: selectedPreset || stage.name,
        epistemicMode: "educational_approximation",
        scientificNotes:
          "Cosmological hydrodynamic collision simulation based on FIRE-2 and IllustrisTNG galaxy formation models.",
        cameraRegime: "galactic",
      }),
      getSelectedObject: () => ({
        name: selectedPreset || stage.name,
        type: "galaxy",
        distanceFromObserver: selectedPreset
          ? "Observational cosmological dataset"
          : "Simulated assembly stage",
        catalogReference: "IllustrisTNG / FIRE-2 Cosmology",
        isModelAvailable: true,
        physicalProperties: {
          stage: stage.name,
          redshiftZ: stage.redshiftZ,
          massRatio,
          gasFraction,
          starburstRateMsunYr: physics.starburstRateMsunYr,
        },
        scientificDescription: `${stage.name} (${stage.redshiftZ}): ${stage.description}`,
      }),
      focusObject: (targetName: string) => {
        const found = OBSERVED_GALAXY_PRESETS.find((p) =>
          p.name.toLowerCase().includes(targetName.toLowerCase()),
        );
        if (found) {
          applyPreset(found);
          return true;
        }
        return false;
      },
      highlightObject: () => true,
      playDemonstration: (demoId: ApprovedDemonstrationId) => {
        if (demoId === "stellar_collapse" || demoId === "cosmic_expansion") {
          setStageId("galaxy_collision_tidal_tails");
          setIsPlaying(true);
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
  }, [isPlaying, stageId, selectedPreset, stage, massRatio, gasFraction, physics]);

  const applyPreset = (preset: ObservedGalaxyPreset) => {
    setSelectedPreset(preset.name);
    setStageId(preset.stageId);
    setMassRatio(preset.massRatio);
    setGasFraction(preset.gasFraction);
  };

  const stagesList: GalaxyAssemblyStageId[] = [
    "dm_halo_collapse",
    "cold_filamentary_accretion",
    "turbulent_clumpy_disk",
    "supernova_feedback_winds",
    "galaxy_collision_tidal_tails",
    "nuclear_starburst_merger",
    "quenched_elliptical_remnant",
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 text-white shadow-2xl space-y-6">
      {/* 1. Header with Scientific Status & Presets */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30">
              <Disc className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold tracking-tight text-white">
                  Galaxy Assembly & Numerical Mergers Laboratory
                </h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                    stage.statusBadge === "OBSERVATION"
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/40"
                      : stage.statusBadge === "MODEL"
                        ? "bg-amber-500/15 text-amber-400 border-amber-500/40"
                        : "bg-purple-500/15 text-purple-400 border-purple-500/40"
                  }`}
                >
                  [{stage.statusBadge}]
                </span>
                <span className="text-xs text-slate-400">· IllustrisTNG / FIRE-2 Calibrated</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Investigate dark matter halo collapse, cold streams, tidal bridges, starbursts, and
                morphological transformation
              </p>
            </div>
          </div>
        </div>

        {/* Observed Target Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mr-1 flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-cyan-400" /> Real Systems:
          </span>
          {OBSERVED_GALAXY_PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => applyPreset(p)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition whitespace-nowrap border ${
                selectedPreset === p.name
                  ? "bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-sm"
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
          This laboratory models cosmological hydrodynamic simulations (IllustrisTNG, FIRE-2). When
          selecting observed systems like the Antennae or M87, the simulation visualizes the
          physically plausible evolutionary phase and tidal dynamics—not an exact historical
          recording of that individual galaxy.
        </div>
      </div>

      {/* 3. 7-Stage Assembly Stepper */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {stagesList.map((key, idx) => {
          const item = GALAXY_ASSEMBLY_STAGES[key];
          const isSelected = stageId === key;
          return (
            <button
              key={key}
              onClick={() => {
                setStageId(key);
                setSelectedPreset(null);
              }}
              className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                isSelected
                  ? "bg-slate-900 border-purple-500/60 shadow-lg shadow-purple-500/10"
                  : "bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400"
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                  <span className={isSelected ? "text-purple-400 font-bold" : "text-slate-500"}>
                    {idx + 1}
                  </span>
                  <span
                    className={`text-[8px] font-bold px-1 py-0.2 rounded ${
                      item.statusBadge === "OBSERVATION"
                        ? "text-emerald-400 bg-emerald-500/10"
                        : "text-amber-400 bg-amber-500/10"
                    }`}
                  >
                    {item.statusBadge}
                  </span>
                </div>
                <div
                  className={`text-[11px] font-semibold leading-tight line-clamp-2 ${
                    isSelected ? "text-white" : "text-slate-300"
                  }`}
                >
                  {item.name.replace(/^\d+\.\s*/, "")}
                </div>
              </div>
              <div className="text-[10px] text-slate-400 mt-2 font-mono">{item.redshiftZ}</div>
            </button>
          );
        })}
      </div>

      {/* 4. Main Interactive Area: 3D Canvas + Physics Parameter Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 3D Galaxy Collision Canvas (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-3">
          <div className="relative h-[430px] w-full rounded-2xl overflow-hidden border border-slate-800 bg-black shadow-inner">
            <Canvas camera={{ position: [0, 4.0, 6.0], fov: 45 }}>
              <color attach="background" args={["#030712"]} />
              <Suspense fallback={null}>
                <GalaxyAssemblyScene
                  stageId={stageId}
                  massRatio={massRatio}
                  gasFraction={gasFraction}
                  isPlaying={isPlaying}
                  simTime={simTime}
                  mobileQuality={mobileQuality}
                />
              </Suspense>
              <OrbitControls
                enablePan={true}
                enableZoom={true}
                maxDistance={14}
                minDistance={1.5}
                onStart={() => Cosmos3DAdapter.getInstance().setUserControllingCamera(true)}
                onEnd={() => Cosmos3DAdapter.getInstance().setUserControllingCamera(false)}
              />
            </Canvas>

            {/* Play/Pause Overlay */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setIsPlaying((p) => !p)}
                className="h-8 px-3 bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700/60 backdrop-blur-md"
              >
                {isPlaying ? (
                  <Pause className="w-3.5 h-3.5 mr-1 text-amber-400" />
                ) : (
                  <Play className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                )}
                {isPlaying ? "Pause" : "Play"}
              </Button>
            </div>

            {/* Stage Title Overlay */}
            <div className="absolute top-3 right-3 text-right">
              <div className="px-3 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-xs font-mono text-purple-300">
                {stage.name}
              </div>
              <div className="text-[10px] text-slate-400 mt-1 font-mono">{stage.cosmicEpoch}</div>
            </div>

            {/* Bottom Legend */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-slate-300 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Galaxy A Disk
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Companion B
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full border border-indigo-400" /> Dark Matter
                  Halo
                </span>
              </div>
              <button
                onClick={() => setMobileQuality((m) => !m)}
                className="text-[10px] text-slate-400 hover:text-white transition"
              >
                Particles: {mobileQuality ? "Low" : "High"}
              </button>
            </div>
          </div>

          {/* Physical Mechanism & Simulation Citation Card */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
            <div className="text-xs font-semibold text-slate-300">
              Governing Physical Process & Simulation Evidence:
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              {stage.governingPhysicalProcess}
            </p>
            <div className="text-[11px] text-slate-400 flex items-start gap-1.5 pt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
              <span>Simulation Research: {stage.simulationEvidence}</span>
            </div>
          </div>
        </div>

        {/* Right: Merger Parameters & Calculations (5 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          {/* Sliders Card */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/70 space-y-4">
            <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-purple-400" /> Collision & Merger Parameters:
              </span>
              <button
                onClick={() => {
                  setMassRatio(1.0);
                  setGasFraction(0.45);
                  setImpactVelocityKmS(250);
                }}
                className="text-[10px] text-slate-400 hover:text-slate-200"
              >
                Reset
              </button>
            </div>

            {/* Slider 1: Merger Mass Ratio */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Merger Mass Ratio (M_B / M_A)</span>
                <span className="font-mono text-purple-300">
                  {massRatio === 1
                    ? "1:1 (Equal Major)"
                    : massRatio >= 0.33
                      ? "1:3 (Major)"
                      : "1:10 (Minor)"}
                </span>
              </div>
              <Slider
                min={0.1}
                max={1.0}
                step={0.05}
                value={[massRatio]}
                onValueChange={([val]) => {
                  setMassRatio(val);
                  setSelectedPreset(null);
                }}
              />
            </div>

            {/* Slider 2: Gas Fraction */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Gas Fraction (f_gas)</span>
                <span className="font-mono text-cyan-300">{(gasFraction * 100).toFixed(0)}%</span>
              </div>
              <Slider
                min={0.05}
                max={0.9}
                step={0.05}
                value={[gasFraction]}
                onValueChange={([val]) => {
                  setGasFraction(val);
                  setSelectedPreset(null);
                }}
              />
            </div>

            {/* Slider 3: Impact Velocity */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Relative Collision Velocity</span>
                <span className="font-mono text-amber-300">{impactVelocityKmS} km/s</span>
              </div>
              <Slider
                min={100}
                max={600}
                step={25}
                value={[impactVelocityKmS]}
                onValueChange={([val]) => {
                  setImpactVelocityKmS(val);
                  setSelectedPreset(null);
                }}
              />
            </div>
          </div>

          {/* Real-Time Theoretical Metrics Grid */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 space-y-3">
            <div className="text-xs font-semibold text-slate-300">
              Merger Dynamics & Starburst Outcome:
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">Starburst SFR Boost</div>
                <div className="text-sm font-mono font-bold text-amber-300">
                  {physics.peakStarburstMultiplier.toFixed(1)}× baseline
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">Tidal Tail Extent</div>
                <div className="text-sm font-mono font-bold text-cyan-300">
                  {physics.tidalTailExtentKpc.toFixed(0)} kpc (
                  {(physics.tidalTailExtentKpc * 3.26).toFixed(0)} kly)
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">Coalescence Time</div>
                <div className="text-sm font-mono font-bold text-emerald-300">
                  {physics.mergerCoalescenceGyr.toFixed(2)} Gyr
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">Remnant Morphology</div>
                <div className="text-sm font-mono font-bold text-purple-300 truncate">
                  {physics.morphologicalOutcome}
                </div>
              </div>
            </div>
          </div>

          {/* Morphological Transformation Summary Card */}
          <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
              <span>Cosmological Galaxy Transformation:</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Major gas-rich mergers violently disrupt fragile spiral disks through gravitational
              torques, funneling gas into the nucleus to fuel powerful starbursts and active
              galactic nuclei (AGN), ultimately transforming rotation-supported spirals into
              dispersion-supported, quenched elliptical galaxies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
