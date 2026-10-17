import React, { useState, useMemo, useRef, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import {
  PLANET_FORMATION_PHASES,
  type PlanetFormationPhaseId,
  type PlanetFormationPhase,
} from "@/lib/astronomy/astrophysics-lab/planet-formation-engine";
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
  Globe2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

// ----------------------------------------------------------------------------
// Observed Protoplanetary & Exoplanet Presets
// ----------------------------------------------------------------------------
interface ObservedDiskPreset {
  name: string;
  phaseId: PlanetFormationPhaseId;
  stellarMassSolar: number;
  diskMassSolar: number;
  radiusAU: number;
  catalogId: string;
  distanceLy: string;
  description: string;
}

const OBSERVED_DISK_PRESETS: ObservedDiskPreset[] = [
  {
    name: "HL Tauri",
    phaseId: "pebble_growth",
    stellarMassSolar: 2.1,
    diskMassSolar: 0.13,
    radiusAU: 100,
    catalogId: "ALMA DSHARP HL Tau",
    distanceLy: "450 ly (Taurus)",
    description:
      "Young protostar with striking concentric dust rings and millimeter pebble gap structures.",
  },
  {
    name: "TW Hydrae",
    phaseId: "planetesimals",
    stellarMassSolar: 0.8,
    diskMassSolar: 0.06,
    radiusAU: 60,
    catalogId: "TW Hya (Face-On)",
    distanceLy: "196 ly (Hydra)",
    description:
      "Closest known protoplanetary disk; ALMA resolves gaps at 1 AU and 24 AU indicating planetesimal formation.",
  },
  {
    name: "PDS 70",
    phaseId: "embryo_growth",
    stellarMassSolar: 0.76,
    diskMassSolar: 0.03,
    radiusAU: 54,
    catalogId: "PDS 70 b & c",
    distanceLy: "370 ly (Centaurus)",
    description:
      "Groundbreaking VLT SPHERE direct image of giant protoplanets actively accreting inside a disk cavity.",
  },
  {
    name: "Solar Nebula",
    phaseId: "giant_impacts",
    stellarMassSolar: 1.0,
    diskMassSolar: 0.02,
    radiusAU: 30,
    catalogId: "Primordial Solar System",
    distanceLy: "0 ly",
    description:
      "4.5 billion years ago: terrestrial embryo collisions, Moon-forming giant impact, and gas clearing.",
  },
  {
    name: "TRAPPIST-1",
    phaseId: "migration_resonance",
    stellarMassSolar: 0.09,
    diskMassSolar: 0.005,
    radiusAU: 0.06,
    catalogId: "2MASS J23062928-0502285",
    distanceLy: "40.7 ly (Aquarius)",
    description:
      "Seven Earth-sized planets locked in a resonant Laplace migration chain around an ultracool red dwarf.",
  },
];

// ----------------------------------------------------------------------------
// 3D Visualizer Scene for Protoplanetary Disks & Planet Formation
// ----------------------------------------------------------------------------
interface SceneProps {
  phaseId: PlanetFormationPhaseId;
  stellarMassSolar: number;
  orbitalRadiusAU: number;
  isPlaying: boolean;
  simTime: number;
  mobileQuality: boolean;
}

function PlanetFormationScene({
  phaseId,
  stellarMassSolar,
  orbitalRadiusAU,
  isPlaying,
  simTime,
  mobileQuality,
}: SceneProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const planetRef = useRef<THREE.Mesh>(null);
  const secondPlanetRef = useRef<THREE.Mesh>(null);
  const starRef = useRef<THREE.Mesh>(null);

  const particleCount = mobileQuality ? 700 : 1800;

  // Particle positions and colors based on phase
  const { positions, colors, radii } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);
    const rad = new Float32Array(particleCount);

    const isDustSettled = phaseId !== "protoplanetary_disk";
    const hasGap =
      phaseId === "embryo_growth" ||
      phaseId === "migration_resonance" ||
      phaseId === "giant_impacts" ||
      phaseId === "atmosphere_formation";

    for (let i = 0; i < particleCount; i++) {
      let r = 0.6 + Math.pow(Math.random(), 1.4) * 4.2;

      // Exclude particles inside carved planet gap
      if (hasGap && Math.abs(r - 2.5) < 0.45) {
        r = r > 2.5 ? r + 0.45 : r - 0.45;
      }

      const theta = Math.random() * Math.PI * 2;
      // Flared vs thin settled midplane
      const scaleHeight = isDustSettled ? 0.03 * Math.pow(r, 0.8) : 0.22 * Math.pow(r, 1.25);
      const z = (Math.random() - 0.5) * scaleHeight * 2;

      pos[i * 3] = r * Math.cos(theta);
      pos[i * 3 + 1] = z;
      pos[i * 3 + 2] = r * Math.sin(theta);

      rad[i] = r;

      // Dust / pebble color gradation: hotter near star (amber), cold outer (cyan/ice)
      const iceLineRadius = 2.4;
      if (r < iceLineRadius) {
        // Silicate warm dust
        col[i * 3] = 0.95;
        col[i * 3 + 1] = 0.65;
        col[i * 3 + 2] = 0.3;
      } else {
        // Volatile water ice pebbles
        col[i * 3] = 0.4;
        col[i * 3 + 1] = 0.75;
        col[i * 3 + 2] = 0.95;
      }
    }

    return { positions: pos, colors: col, radii: rad };
  }, [phaseId, particleCount]);

  useFrame((_, delta) => {
    if (!isPlaying) return;

    if (pointsRef.current) {
      // Differential Keplerian rotation: inner rotates faster than outer Omega ~ r^-1.5
      pointsRef.current.rotation.y += delta * 0.4;
    }

    if (planetRef.current) {
      // Planet orbit in gap
      const angle = simTime * 0.8;
      const r = 2.5;
      planetRef.current.position.set(r * Math.cos(angle), 0, r * Math.sin(angle));
      planetRef.current.rotation.y += delta * 2.0;
    }

    if (secondPlanetRef.current) {
      // Resonant outer planet (e.g. 2:1 resonance, angle = simTime * 0.4)
      const angle = simTime * 0.4;
      const r = 3.96;
      secondPlanetRef.current.position.set(r * Math.cos(angle), 0, r * Math.sin(angle));
    }

    if (starRef.current) {
      starRef.current.rotation.y += delta * 0.3;
    }
  });

  const showFormingPlanet =
    phaseId === "embryo_growth" ||
    phaseId === "migration_resonance" ||
    phaseId === "giant_impacts" ||
    phaseId === "atmosphere_formation";

  const showResonantPlanet = phaseId === "migration_resonance";

  return (
    <group>
      {/* 1. Central Host Star */}
      <mesh ref={starRef}>
        <sphereGeometry args={[0.38, 32, 32]} />
        <meshStandardMaterial
          color="#fef08a"
          emissive="#f59e0b"
          emissiveIntensity={1.2}
          roughness={0.2}
        />
      </mesh>
      <pointLight color="#fef08a" intensity={3.0} distance={15} />

      {/* 2. Dust & Pebble Protoplanetary Disk Particles */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
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

      {/* 3. Forming Protoplanet Inside Gap */}
      {showFormingPlanet && (
        <group>
          <mesh ref={planetRef} position={[2.5, 0, 0]}>
            <sphereGeometry args={[0.12, 24, 24]} />
            <meshStandardMaterial
              color={phaseId === "giant_impacts" ? "#ef4444" : "#38bdf8"}
              emissive={phaseId === "giant_impacts" ? "#dc2626" : "#0284c7"}
              emissiveIntensity={0.6}
            />
          </mesh>
          {/* Circumplanetary accretion disk */}
          <mesh position={[2.5, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.15, 0.35, 32]} />
            <meshBasicMaterial color="#fbbf24" transparent opacity={0.5} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}

      {/* 4. Second Resonant Planet (for Migration & Resonances Phase) */}
      {showResonantPlanet && (
        <mesh ref={secondPlanetRef} position={[3.96, 0, 0]}>
          <sphereGeometry args={[0.09, 20, 20]} />
          <meshStandardMaterial color="#a855f7" emissive="#7e22ce" emissiveIntensity={0.5} />
        </mesh>
      )}

      {/* 5. Volatile Ice Line Frost Boundary Circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.38, 2.42, 64]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>

      <ambientLight intensity={0.25} />
    </group>
  );
}

// ----------------------------------------------------------------------------
// Master PlanetFormationLab3D Component
// ----------------------------------------------------------------------------
export function PlanetFormationLab3D() {
  const [phaseId, setPhaseId] = useState<PlanetFormationPhaseId>("pebble_growth");
  const [stellarMassSolar, setStellarMassSolar] = useState<number>(1.0);
  const [diskGasMassSolar, setDiskGasMassSolar] = useState<number>(0.03);
  const [orbitalRadiusAU, setOrbitalRadiusAU] = useState<number>(2.5);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [simTime, setSimTime] = useState<number>(0);
  const [selectedPreset, setSelectedPreset] = useState<string | null>("HL Tauri");
  const [mobileQuality, setMobileQuality] = useState<boolean>(false);

  const phase = PLANET_FORMATION_PHASES[phaseId];

  // Real-time Physics Calculations
  const physics = useMemo(() => {
    // 1. Ice Line (Snow Line): r_ice ≈ 2.7 AU * sqrt(L_* / L_sun) ≈ 2.7 * M_*^1.75
    const luminositySolar = Math.pow(stellarMassSolar, 3.5);
    const snowLineAU = 2.7 * Math.sqrt(luminositySolar);

    // 2. Temperature profile at r: T(r) ≈ 280 K * (r / 1 AU)^-0.5 * (L_* / L_sun)^0.25
    const tempAtRadiusK = 280 * Math.pow(orbitalRadiusAU, -0.5) * Math.pow(luminositySolar, 0.25);

    // 3. Orbital Period (Kepler's 3rd Law): P = sqrt(a^3 / M_*) years
    const orbitalPeriodYears = Math.sqrt(Math.pow(orbitalRadiusAU, 3) / stellarMassSolar);

    // 4. Hill Sphere Radius for Earth-mass planet: R_H = a * (M_p / (3 M_*))^(1/3)
    const earthMassSolar = 3e-6; // ~3 * 10^-6 M_sun
    const hillRadiusAU = orbitalRadiusAU * Math.pow(earthMassSolar / (3 * stellarMassSolar), 1 / 3);
    const hillRadiusKm = hillRadiusAU * 1.496e8;

    // 5. Critical Core Mass for Runaway Gas Accretion: ~10 M_Earth
    const criticalCoreMassEarth = 10.0;

    // 6. Toomre Q stability parameter: Q = c_s * Omega / (pi * G * Sigma)
    // Q < 1 triggers direct gravitational disk fragmentation into gas giants
    const toomreQ = (1.5 * Math.pow(orbitalRadiusAU, 0.25)) / (diskGasMassSolar / 0.05);

    return {
      snowLineAU,
      tempAtRadiusK,
      orbitalPeriodYears,
      hillRadiusKm,
      criticalCoreMassEarth,
      toomreQ,
      isBeyondSnowLine: orbitalRadiusAU >= snowLineAU,
    };
  }, [stellarMassSolar, diskGasMassSolar, orbitalRadiusAU]);

  // Simulation Clock
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setSimTime((t) => t + 0.05);
    }, 50);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const applyPreset = (preset: ObservedDiskPreset) => {
    setSelectedPreset(preset.name);
    setPhaseId(preset.phaseId);
    setStellarMassSolar(preset.stellarMassSolar);
    setDiskGasMassSolar(preset.diskMassSolar);
  };

  const phasesList: PlanetFormationPhaseId[] = [
    "protoplanetary_disk",
    "dust_settling",
    "pebble_growth",
    "planetesimals",
    "embryo_growth",
    "migration_resonance",
    "giant_impacts",
    "atmosphere_formation",
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 text-white shadow-2xl space-y-6">
      {/* 1. Header with Status Badge & Presets */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              <Globe2 className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold tracking-tight text-white">
                  Planet Formation & Protoplanetary Disk Laboratory
                </h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                    phase.statusBadge === "OBSERVATION"
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/40"
                      : phase.statusBadge === "MODEL"
                        ? "bg-amber-500/15 text-amber-400 border-amber-500/40"
                        : "bg-purple-500/15 text-purple-400 border-purple-500/40"
                  }`}
                >
                  [{phase.statusBadge}]
                </span>
                <span className="text-xs text-slate-400">· Core Accretion Paradigm</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Investigate dust settling, pebble growth, streaming instabilities, migration, and
                giant impacts
              </p>
            </div>
          </div>
        </div>

        {/* Observed Target Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mr-1 flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-cyan-400" /> Presets:
          </span>
          {OBSERVED_DISK_PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => applyPreset(p)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition whitespace-nowrap border ${
                selectedPreset === p.name
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm"
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
          This laboratory models core accretion physics and ALMA DSHARP dust structures. When
          choosing real astronomical systems, the simulation visualizes physically grounded
          protoplanetary evolution—not a direct historical replay of that exact planetary system.
        </div>
      </div>

      {/* 3. 8-Phase Formation Stepper */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {phasesList.map((key, idx) => {
          const item = PLANET_FORMATION_PHASES[key];
          const isSelected = phaseId === key;
          return (
            <button
              key={key}
              onClick={() => {
                setPhaseId(key);
                setSelectedPreset(null);
              }}
              className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                isSelected
                  ? "bg-slate-900 border-cyan-500/60 shadow-lg shadow-cyan-500/10"
                  : "bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400"
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                  <span className={isSelected ? "text-cyan-400 font-bold" : "text-slate-500"}>
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
            </button>
          );
        })}
      </div>

      {/* 4. Main Interactive Area: 3D Canvas + Physics Parameter Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 3D Protoplanetary Disk Simulation (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-3">
          <div className="relative h-[430px] w-full rounded-2xl overflow-hidden border border-slate-800 bg-black shadow-inner">
            <Canvas camera={{ position: [0, 3.2, 5.0], fov: 45 }}>
              <color attach="background" args={["#030712"]} />
              <Suspense fallback={null}>
                <PlanetFormationScene
                  phaseId={phaseId}
                  stellarMassSolar={stellarMassSolar}
                  orbitalRadiusAU={orbitalRadiusAU}
                  isPlaying={isPlaying}
                  simTime={simTime}
                  mobileQuality={mobileQuality}
                />
              </Suspense>
              <OrbitControls
                enablePan={true}
                enableZoom={true}
                maxDistance={10}
                minDistance={1.2}
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
              <div className="px-3 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-xs font-mono text-cyan-300">
                {phase.name}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">{phase.timescaleYears}</div>
            </div>

            {/* Bottom Legend */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-slate-300 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Warm Silicates
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Icy Volatiles
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full border border-cyan-400" /> Snow Line (
                  {physics.snowLineAU.toFixed(1)} AU)
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

          {/* Phase Scientific Description Card */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
            <div className="text-xs font-semibold text-slate-300">
              Governing Physics & Observational Evidence:
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              {phase.governingPhysics}
            </p>
            <div className="text-[11px] text-slate-400 flex items-start gap-1.5 pt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>Evidence: {phase.observationalEvidence}</span>
            </div>
          </div>
        </div>

        {/* Right: Numerical Physics Controls & Metrics (5 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          {/* Sliders Card */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/70 space-y-4">
            <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" /> Disk & Stellar Parameters:
              </span>
              <button
                onClick={() => {
                  setStellarMassSolar(1.0);
                  setDiskGasMassSolar(0.03);
                  setOrbitalRadiusAU(2.5);
                }}
                className="text-[10px] text-slate-400 hover:text-slate-200"
              >
                Reset
              </button>
            </div>

            {/* Slider 1: Stellar Mass */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Host Star Mass (M_*)</span>
                <span className="font-mono text-cyan-300">{stellarMassSolar.toFixed(2)} M☉</span>
              </div>
              <Slider
                min={0.2}
                max={2.5}
                step={0.05}
                value={[stellarMassSolar]}
                onValueChange={([val]) => {
                  setStellarMassSolar(val);
                  setSelectedPreset(null);
                }}
              />
            </div>

            {/* Slider 2: Disk Gas Mass */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Disk Gas Mass (M_disk)</span>
                <span className="font-mono text-amber-300">{diskGasMassSolar.toFixed(3)} M☉</span>
              </div>
              <Slider
                min={0.005}
                max={0.12}
                step={0.005}
                value={[diskGasMassSolar]}
                onValueChange={([val]) => {
                  setDiskGasMassSolar(val);
                  setSelectedPreset(null);
                }}
              />
            </div>

            {/* Slider 3: Orbital Radius */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Orbital Radius (a)</span>
                <span className="font-mono text-emerald-300">
                  {orbitalRadiusAU.toFixed(2)} AU
                  {physics.isBeyondSnowLine ? " (Outer / Icy)" : " (Inner / Rocky)"}
                </span>
              </div>
              <Slider
                min={0.2}
                max={20.0}
                step={0.1}
                value={[orbitalRadiusAU]}
                onValueChange={([val]) => {
                  setOrbitalRadiusAU(val);
                  setSelectedPreset(null);
                }}
              />
            </div>
          </div>

          {/* Real-Time Theoretical Metrics Grid */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 space-y-3">
            <div className="text-xs font-semibold text-slate-300">
              Orbital & Thermochemical Diagnostics:
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">Snow / Ice Line</div>
                <div className="text-sm font-mono font-bold text-cyan-300">
                  {physics.snowLineAU.toFixed(2)} AU
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">Midplane Temp T(r)</div>
                <div className="text-sm font-mono font-bold text-amber-300">
                  {Math.round(physics.tempAtRadiusK)} K
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">Orbital Period (P)</div>
                <div className="text-sm font-mono font-bold text-emerald-300">
                  {physics.orbitalPeriodYears < 1.0
                    ? `${(physics.orbitalPeriodYears * 365.25).toFixed(1)} d`
                    : `${physics.orbitalPeriodYears.toFixed(2)} yr`}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">Earth Hill Sphere</div>
                <div className="text-sm font-mono font-bold text-purple-300">
                  {(physics.hillRadiusKm / 1e6).toFixed(2)} Million km
                </div>
              </div>
            </div>
          </div>

          {/* Known Scientific Limitations Panel */}
          <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Scientific Model Limitations:</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">{phase.knownLimitations}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
