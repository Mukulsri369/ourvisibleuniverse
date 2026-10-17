import React, { useState, useMemo, useRef, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import {
  STELLAR_EVOLUTION_GRID,
  type StellarEvolutionTrackGrid,
  type HRPoint,
  type StellarRemnantType,
} from "@/lib/astronomy/astrophysics-lab/stellar-evolution-engine";
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Info,
  Sliders,
  Flame,
  Activity,
  Layers,
  Thermometer,
  Gauge,
  Eye,
  ShieldAlert,
  Zap,
  HelpCircle,
  Atom,
  Wind,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

// ----------------------------------------------------------------------------
// Real Observed Benchmark Star Presets
// ----------------------------------------------------------------------------
interface ObservedStarPreset {
  name: string;
  initialMass: number;
  metallicityZ: number;
  currentStageIndex: number;
  catalogId: string;
  distanceLy: string;
  spectralType: string;
  description: string;
}

const OBSERVED_STAR_PRESETS: ObservedStarPreset[] = [
  {
    name: "Proxima Centauri",
    initialMass: 0.2,
    metallicityZ: 0.014,
    currentStageIndex: 1, // ZAMS
    catalogId: "Alpha Centauri C",
    distanceLy: "4.246 ly",
    spectralType: "M5.5 Ve",
    description:
      "Closest star to Earth. Fully convective red dwarf with a trillion-year main-sequence lifespan.",
  },
  {
    name: "The Sun",
    initialMass: 1.0,
    metallicityZ: 0.014,
    currentStageIndex: 1, // Main sequence mid-life (4.6 Gyr)
    catalogId: "Sol / G2V",
    distanceLy: "0.0000158 ly (1 AU)",
    spectralType: "G2 V",
    description:
      "Our 4.6-billion-year-old home star, halfway through its 10-billion-year hydrogen-burning lifetime.",
  },
  {
    name: "Arcturus",
    initialMass: 1.0,
    metallicityZ: 0.001, // Low metallicity halo star
    currentStageIndex: 2, // Red Giant Branch
    catalogId: "Alpha Boötis",
    distanceLy: "36.7 ly",
    spectralType: "K1.5 III",
    description:
      "Ancient Population II orange giant; core hydrogen exhausted, burning hydrogen in a shell around helium core.",
  },
  {
    name: "Betelgeuse",
    initialMass: 15.0,
    metallicityZ: 0.014,
    currentStageIndex: 1, // Red Supergiant
    catalogId: "Alpha Orionis",
    distanceLy: "548 ly",
    spectralType: "M1-M2 Ia-ab",
    description:
      "Semiregular pulsating red supergiant spanning over 700 solar radii, destined for Type II-P core collapse.",
  },
  {
    name: "Sirius B",
    initialMass: 3.0,
    metallicityZ: 0.014,
    currentStageIndex: 4, // Carbon-Oxygen White Dwarf
    catalogId: "Alpha CMa B",
    distanceLy: "8.60 ly",
    spectralType: "DA2",
    description:
      "Earth-sized degenerate white dwarf remnant supported by electron degeneracy pressure.",
  },
  {
    name: "Crab Pulsar",
    initialMass: 15.0,
    metallicityZ: 0.014,
    currentStageIndex: 3, // Neutron Star
    catalogId: "PSR B0531+21",
    distanceLy: "6,500 ly (Taurus)",
    spectralType: "Pulsar / Magnetar",
    description:
      "Ultra-dense neutron star spinning 30 times per second born in the historic SN 1054 supernova.",
  },
];

// ----------------------------------------------------------------------------
// 3D Star Visualizer Canvas
// ----------------------------------------------------------------------------
interface StarSceneProps {
  point: HRPoint;
  showCutaway: boolean;
  isPlaying: boolean;
  simTime: number;
  mobileQuality: boolean;
}

function StarEvolutionScene({
  point,
  showCutaway,
  isPlaying,
  simTime,
  mobileQuality,
}: StarSceneProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const shellRef = useRef<THREE.Mesh>(null);
  const windRef = useRef<THREE.Points>(null);

  // Compute color from Effective Temperature Teff
  const starColor = useMemo(() => {
    const teff = Math.pow(10, point.logTeff);
    if (teff < 3500) return new THREE.Color("#ef4444"); // Red Supergiant / Red Dwarf
    if (teff < 5000) return new THREE.Color("#f97316"); // Orange
    if (teff < 6000) return new THREE.Color("#facc15"); // Yellow (Sun)
    if (teff < 7500) return new THREE.Color("#fef08a"); // Yellow-white
    if (teff < 12000) return new THREE.Color("#e0f2fe"); // White-blue
    if (teff < 30000) return new THREE.Color("#38bdf8"); // Blue
    return new THREE.Color("#a855f7"); // Extreme hot white dwarf / neutron star
  }, [point.logTeff]);

  // Scaled visual radius (logarithmic mapping to fit viewport)
  const visualRadius = useMemo(() => {
    const r = point.radiusSolar;
    if (r < 0.02) return 0.25; // White dwarf / neutron star floor
    if (r < 1.0) return 0.4 + r * 0.4;
    return Math.min(3.2, 0.8 + Math.log10(r) * 0.8);
  }, [point.radiusSolar]);

  // Stellar Wind particles
  const particleCount = mobileQuality ? 300 : 800;
  const windParticles = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = visualRadius * (1.1 + Math.random() * 2.2);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, [visualRadius, particleCount]);

  useFrame((_, delta) => {
    if (!isPlaying) return;
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2;
    }
    if (windRef.current) {
      windRef.current.rotation.y += delta * 0.08;
    }
  });

  return (
    <group>
      {/* 1. Main Stellar Photosphere Sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry
          args={[
            visualRadius,
            36,
            36,
            0,
            showCutaway ? Math.PI * 1.5 : Math.PI * 2, // 3/4 cutaway slice
          ]}
        />
        <meshStandardMaterial
          color={starColor}
          emissive={starColor}
          emissiveIntensity={0.8}
          roughness={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 2. Concentric Internal Core Cutaway (when enabled) */}
      {showCutaway && (
        <group>
          {/* Degenerate Central Core */}
          <mesh>
            <sphereGeometry args={[visualRadius * 0.35, 24, 24]} />
            <meshStandardMaterial color="#3b82f6" emissive="#1d4ed8" emissiveIntensity={0.9} />
          </mesh>
          {/* Fusion Shell */}
          <mesh>
            <sphereGeometry args={[visualRadius * 0.65, 24, 24]} />
            <meshStandardMaterial
              color="#fbbf24"
              emissive="#d97706"
              emissiveIntensity={0.6}
              transparent
              opacity={0.7}
            />
          </mesh>
        </group>
      )}

      {/* 3. Glowing Atmospheric Halo */}
      <mesh>
        <sphereGeometry args={[visualRadius * 1.15, 24, 24]} />
        <meshBasicMaterial
          color={starColor}
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* 4. Stellar Wind & Mass-Loss Outflow */}
      {point.stellarWindLossMsunYr > 1e-10 && (
        <points ref={windRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[windParticles, 3]} />
          </bufferGeometry>
          <pointsMaterial
            size={0.04}
            color={starColor}
            transparent
            opacity={0.4}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
      )}

      {/* Lighting */}
      <pointLight color={starColor} intensity={2.5} distance={15} />
      <ambientLight intensity={0.2} />
    </group>
  );
}

// ----------------------------------------------------------------------------
// Interactive H-R Diagram SVG Component
// ----------------------------------------------------------------------------
interface HRDiagramViewProps {
  track: StellarEvolutionTrackGrid;
  currentIndex: number;
  onSelectIndex: (idx: number) => void;
}

function InteractiveHRDiagram({ track, currentIndex, onSelectIndex }: HRDiagramViewProps) {
  // Coordinate bounds:
  // X axis: log(T_eff) from 5.4 (hot left) down to 3.4 (cool right) -> INVERTED
  // Y axis: log(L/L_sun) from -4.0 (faint bottom) to +6.5 (bright top)
  const width = 440;
  const height = 280;
  const padding = { left: 45, right: 20, top: 20, bottom: 35 };

  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  const minLogT = 3.3;
  const maxLogT = 5.4;
  const minLogL = -3.5;
  const maxLogL = 6.8;

  // Convert (logT, logL) to SVG canvas coordinates
  const getX = (logT: number) => {
    // Inverted: higher logT is on the left
    const norm = (maxLogT - logT) / (maxLogT - minLogT);
    return padding.left + norm * plotW;
  };

  const getY = (logL: number) => {
    const norm = (maxLogL - logL) / (maxLogL - minLogL);
    return padding.top + norm * plotH;
  };

  // Build SVG path string for the track
  const pathD = useMemo(() => {
    return track.points
      .map((pt, i) => `${i === 0 ? "M" : "L"} ${getX(pt.logTeff)} ${getY(pt.logL)}`)
      .join(" ");
  }, [track]);

  return (
    <div className="relative rounded-xl border border-slate-800 bg-slate-950 p-3 shadow-inner">
      <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1 px-1">
        <span>HERTZSPRUNG-RUSSELL DIAGRAM (MIST TRACK)</span>
        <span className="text-amber-400 font-bold">
          {track.initialMassSolar} M☉ (Z = {track.metallicityZ})
        </span>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none">
        {/* Background Grid Lines */}
        {[3.5, 4.0, 4.5, 5.0].map((t) => (
          <line
            key={`grid-x-${t}`}
            x1={getX(t)}
            x2={getX(t)}
            y1={padding.top}
            y2={height - padding.bottom}
            stroke="#1e293b"
            strokeDasharray="3 3"
          />
        ))}
        {[-2, 0, 2, 4, 6].map((l) => (
          <line
            key={`grid-y-${l}`}
            x1={padding.left}
            x2={width - padding.right}
            y1={getY(l)}
            y2={getY(l)}
            stroke="#1e293b"
            strokeDasharray="3 3"
          />
        ))}

        {/* Qualitative Main-Sequence Reference Band */}
        <path
          d={`M ${getX(4.7)} ${getY(5.0)} L ${getX(3.5)} ${getY(-2.5)}`}
          stroke="#334155"
          strokeWidth="14"
          strokeLinecap="round"
          opacity="0.3"
        />
        <text
          x={getX(4.1)}
          y={getY(1.2)}
          fill="#475569"
          fontSize="10"
          fontStyle="italic"
          transform={`rotate(-32, ${getX(4.1)}, ${getY(1.2)})`}
        >
          Main Sequence
        </text>

        {/* Evolutionary Track Line */}
        <path d={pathD} fill="none" stroke="#f97316" strokeWidth="2.5" strokeOpacity="0.85" />

        {/* All Evolutionary Points */}
        {track.points.map((pt, i) => {
          const cx = getX(pt.logTeff);
          const cy = getY(pt.logL);
          const isSelected = i === currentIndex;
          return (
            <g
              key={i}
              onClick={() => onSelectIndex(i)}
              className="cursor-pointer hover:opacity-100 transition"
            >
              <circle
                cx={cx}
                cy={cy}
                r={isSelected ? 6 : 4}
                fill={isSelected ? "#38bdf8" : "#fb923c"}
                stroke={isSelected ? "#ffffff" : "#0f172a"}
                strokeWidth={isSelected ? 2 : 1}
              />
              {isSelected && (
                <circle
                  cx={cx}
                  cy={cy}
                  r="12"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                  className="animate-spin"
                />
              )}
            </g>
          );
        })}

        {/* Active Stage Label Marker */}
        {track.points[currentIndex] && (
          <text
            x={Math.max(
              padding.left + 5,
              Math.min(width - padding.right - 90, getX(track.points[currentIndex].logTeff) + 8),
            )}
            y={Math.max(
              padding.top + 12,
              Math.min(height - padding.bottom - 5, getY(track.points[currentIndex].logL) - 8),
            )}
            fill="#38bdf8"
            fontSize="10"
            fontWeight="bold"
            className="pointer-events-none drop-shadow"
          >
            {track.points[currentIndex].stageName.split(" ")[0]}
          </text>
        )}

        {/* Axes Labels */}
        <text
          x={width / 2}
          y={height - 8}
          fill="#94a3b8"
          fontSize="10"
          textAnchor="middle"
          fontWeight="bold"
        >
          ← Surface Temperature Teff (Hotter) · log10(Teff / K) · (Cooler) →
        </text>
        <text
          x={12}
          y={height / 2}
          fill="#94a3b8"
          fontSize="10"
          textAnchor="middle"
          fontWeight="bold"
          transform={`rotate(-90, 12, ${height / 2})`}
        >
          Luminosity log10(L / L☉) ↑
        </text>
      </svg>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Master StellarEvolutionInteractiveLab Component
// ----------------------------------------------------------------------------
export function StellarEvolutionInteractiveLab() {
  const [selectedMass, setSelectedMass] = useState<number>(1.0);
  const [selectedMetallicity, setSelectedMetallicity] = useState<number>(0.014);
  const [currentIndex, setCurrentIndex] = useState<number>(1); // Default to ZAMS / MS
  const [showCutaway, setShowCutaway] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [simTime, setSimTime] = useState<number>(0);
  const [activePreset, setActivePreset] = useState<string | null>("The Sun");
  const [mobileQuality, setMobileQuality] = useState<boolean>(false);

  // Available mass options in MIST grid
  const massOptions = [0.2, 1.0, 3.0, 5.0, 15.0, 40.0];
  const metallicityOptions = [
    { label: "Pop II Extreme Low (Z = 0.0001)", value: 0.0001 },
    { label: "Sub-Solar Halo (Z = 0.001)", value: 0.001 },
    { label: "Solar Standard (Z = 0.014)", value: 0.014 },
    { label: "Super-Metal-Rich (Z = 0.03)", value: 0.03 },
  ];

  // Find matching evolution track
  const currentTrack = useMemo(() => {
    return (
      STELLAR_EVOLUTION_GRID.find((t) => t.initialMassSolar === selectedMass) ||
      STELLAR_EVOLUTION_GRID[1] // Fallback to 1.0 M_sun
    );
  }, [selectedMass]);

  // Current stage point
  const currentPoint = currentTrack.points[currentIndex] || currentTrack.points[0];

  // Animation frame clock
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setSimTime((t) => t + 0.05);
    }, 50);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const applyPreset = (preset: ObservedStarPreset) => {
    setActivePreset(preset.name);
    setSelectedMass(preset.initialMass);
    setSelectedMetallicity(preset.metallicityZ);
    setCurrentIndex(preset.currentStageIndex);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 text-white shadow-2xl space-y-6">
      {/* 1. Header with Status & Presets */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Zap className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold tracking-tight text-white">
                  Stellar Evolution & H-R Track Laboratory
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-500/15 text-amber-400 border border-amber-500/40">
                  [MODEL]
                </span>
                <span className="text-xs text-slate-400">· MIST / PARSEC Calibrated Grids</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Investigate stellar tracks across mass and metallicity, H-R diagram motion, and core
                collapse fates
              </p>
            </div>
          </div>
        </div>

        {/* Observed Target Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mr-1 flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-cyan-400" /> Real Stars:
          </span>
          {OBSERVED_STAR_PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => applyPreset(p)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition whitespace-nowrap border ${
                activePreset === p.name
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm"
                  : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Epistemological Disclaimer Notice */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-2.5 flex items-start gap-3 text-xs text-amber-300/90 leading-relaxed">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-amber-200">
            Epistemological Transparency Notice:{" "}
          </span>
          Stellar evolution tracks are computed using 1D hydrostatic stellar structure models (MIST
          / PARSEC). When testing real benchmark stars, the track illustrates the theoretical
          evolutionary pathway appropriate for its mass and metallicity—not a direct empirical
          historical record.
        </div>
      </div>

      {/* 3. Mass & Metallicity Control Toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 items-center">
        {/* Mass Selector */}
        <div className="md:col-span-7 flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <Atom className="w-3.5 h-3.5 text-amber-400" /> Initial Mass (M_init):
          </span>
          {massOptions.map((m) => (
            <button
              key={m}
              onClick={() => {
                setSelectedMass(m);
                setCurrentIndex(1); // Reset to ZAMS
                setActivePreset(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition border ${
                selectedMass === m
                  ? "bg-amber-500/25 text-amber-300 border-amber-500/60 shadow"
                  : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
              }`}
            >
              {m} M☉
            </button>
          ))}
        </div>

        {/* Metallicity Dropdown */}
        <div className="md:col-span-5 flex items-center gap-2 justify-end">
          <span className="text-xs font-semibold text-slate-400">Metallicity (Z):</span>
          <select
            value={selectedMetallicity}
            onChange={(e) => setSelectedMetallicity(parseFloat(e.target.value))}
            className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 font-mono focus:outline-none focus:border-amber-500"
          >
            {metallicityOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. Main Lab Area: 3D Visualizer + H-R Diagram + Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 3D Star Visualizer (6 cols) */}
        <div className="lg:col-span-6 flex flex-col space-y-3">
          <div className="relative h-[420px] w-full rounded-2xl overflow-hidden border border-slate-800 bg-black shadow-inner">
            <Canvas camera={{ position: [0, 1.8, 4.5], fov: 45 }}>
              <color attach="background" args={["#030712"]} />
              <Suspense fallback={null}>
                <StarEvolutionScene
                  point={currentPoint}
                  showCutaway={showCutaway}
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

            {/* Overlaid Controls */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setShowCutaway((c) => !c)}
                className={`h-8 px-3 text-xs border backdrop-blur-md transition ${
                  showCutaway
                    ? "bg-amber-500/25 text-amber-300 border-amber-500/60"
                    : "bg-slate-900/80 text-slate-300 border-slate-700/60"
                }`}
              >
                <Layers className="w-3.5 h-3.5 mr-1" />
                {showCutaway ? "Core Exposed" : "Inspect Interior"}
              </Button>
            </div>

            {/* Stage Badge & Remnant Fate Overlay */}
            <div className="absolute top-3 right-3 text-right">
              <div className="px-3 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-white/10 text-xs font-mono text-amber-300">
                {currentPoint.stageName}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Remnant:{" "}
                <span className="text-white font-semibold">
                  {currentTrack.remnantType.replace(/_/g, " ")}
                </span>
              </div>
            </div>

            {/* Bottom Timeline Indicator */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-300 bg-slate-950/85 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-800">
              <div className="flex items-center gap-2 font-mono">
                <span className="text-slate-400 text-[11px]">Age:</span>
                <span className="text-amber-400 font-bold">
                  {currentPoint.ageGyr >= 1.0
                    ? `${currentPoint.ageGyr.toFixed(2)} Gyr`
                    : `${(currentPoint.ageGyr * 1000).toFixed(1)} Myr`}
                </span>
                <span className="text-slate-600">/</span>
                <span className="text-slate-400 text-[11px]">
                  Total: {currentTrack.lifetimeTotalGyr} Gyr
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

          {/* Core Chemistry & Internal Shells Diagnostic Card */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
            <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Atom className="w-3.5 h-3.5 text-blue-400" /> Core Composition & Nuclear Burning:
              </span>
              <span className="font-mono text-cyan-400 text-[11px]">
                T_center: {(currentPoint.centralTemperatureK / 1e6).toFixed(1)} Million K
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              {currentPoint.coreComposition} (Core mass: {currentPoint.coreMassSolar.toFixed(2)} M☉)
            </p>
            <p className="text-xs text-slate-400 leading-relaxed mt-1">
              {currentPoint.description}
            </p>
          </div>
        </div>

        {/* Right: Interactive H-R Diagram & Model Uncertainty (6 cols) */}
        <div className="lg:col-span-6 flex flex-col space-y-4">
          {/* 1. H-R Diagram View */}
          <InteractiveHRDiagram
            track={currentTrack}
            currentIndex={currentIndex}
            onSelectIndex={setCurrentIndex}
          />

          {/* 2. Step Through Stages Slider / Buttons */}
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span>Evolutionary Sequence Step:</span>
              <span className="font-mono text-amber-400">
                {currentIndex + 1} of {currentTrack.points.length}
              </span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {currentTrack.points.map((pt, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition truncate border ${
                    currentIndex === idx
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                  }`}
                >
                  {pt.stageName.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Physical Parameters Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase">Effective Temp</div>
              <div className="text-sm font-mono font-bold text-cyan-300">
                {Math.round(Math.pow(10, currentPoint.logTeff)).toLocaleString()} K
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase">Luminosity</div>
              <div className="text-sm font-mono font-bold text-amber-300">
                {Math.pow(10, currentPoint.logL) > 1e4
                  ? `${Math.pow(10, currentPoint.logL).toExponential(2)} L☉`
                  : `${Math.pow(10, currentPoint.logL).toFixed(2)} L☉`}
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase">Radius</div>
              <div className="text-sm font-mono font-bold text-emerald-300">
                {currentPoint.radiusSolar.toFixed(2)} R☉
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase">Wind Loss Rate</div>
              <div className="text-sm font-mono font-bold text-purple-300">
                {currentPoint.stellarWindLossMsunYr.toExponential(1)} M☉/yr
              </div>
            </div>
          </div>

          {/* 4. Model Uncertainty & Theoretical Limitations Panel */}
          <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>Astrophysical Model Uncertainties:</span>
            </div>
            <div className="space-y-1.5 text-[11px] text-slate-400">
              <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
                <span className="font-semibold text-slate-300">Convective Overshooting: </span>
                {currentTrack.modelUncertainties.overshootingUncertainty}
              </div>
              <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
                <span className="font-semibold text-slate-300">Mass-Loss Prescription: </span>
                {currentTrack.modelUncertainties.massLossPrescription}
              </div>
              <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
                <span className="font-semibold text-slate-300">Nuclear Reaction Rates: </span>
                {currentTrack.modelUncertainties.nuclearRateUncertainty}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
