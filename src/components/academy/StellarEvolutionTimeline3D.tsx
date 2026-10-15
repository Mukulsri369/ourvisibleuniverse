import React, { useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import {
  EVOLUTIONARY_TRACKS,
  type EvolutionaryTrack,
  type EvolutionStage,
} from "@/lib/academy/lessons/module-10-evolution";
import {
  Flame,
  Zap,
  Sparkles,
  Layers,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  ChevronRight,
  ChevronLeft,
  Info,
  Scale,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Sliders,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// 3D Scene Mesh for Stellar Stage
function StageVisual3D({
  stage,
  isCutaway,
  selectedLayerIndex,
  onSelectLayer,
}: {
  stage: EvolutionStage;
  isCutaway: boolean;
  selectedLayerIndex: number | null;
  onSelectLayer: (idx: number | null) => void;
}) {
  const meshRef = useRef<THREE.Group>(null);
  const outerPuffRef = useRef<THREE.Mesh>(null);
  const beamRef = useRef<THREE.Group>(null);

  // Rotation animation
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2;
    }
    if (outerPuffRef.current) {
      outerPuffRef.current.rotation.z -= delta * 0.1;
    }
    if (beamRef.current) {
      beamRef.current.rotation.y += delta * 4.0; // Pulsar rapid spin!
    }
  });

  const baseColor = useMemo(() => new THREE.Color(stage.colorHex), [stage.colorHex]);
  const glowColor = useMemo(() => new THREE.Color(stage.glowHex), [stage.glowHex]);

  // Scaled display radius
  const visualRadius = useMemo(() => {
    if (stage.visualType === "cloud") return 2.6;
    if (stage.visualType === "protostar") return 2.2;
    if (stage.visualType === "main_sequence") return 2.0;
    if (stage.visualType === "red_giant") return 2.8;
    if (stage.visualType === "supergiant") return 3.2;
    if (stage.visualType === "nebula") return 3.4;
    if (stage.visualType === "supernova") return 3.5;
    if (stage.visualType === "white_dwarf") return 1.4;
    if (stage.visualType === "neutron_star") return 1.0;
    if (stage.visualType === "black_hole") return 1.2;
    return 2.0;
  }, [stage.visualType]);

  // If in cutaway mode, render concentric concentric shells
  if (isCutaway && stage.internalLayers.length > 0) {
    return (
      <group ref={meshRef}>
        {/* Render concentric cutaway shells */}
        {stage.internalLayers.map((layer, idx) => {
          const totalLayers = stage.internalLayers.length;
          // Calculate shell radius from innermost (core) to outermost
          const shellRadius =
            visualRadius * (0.35 + (0.65 * (totalLayers - 1 - idx)) / Math.max(1, totalLayers - 1));
          const isSelected = selectedLayerIndex === idx;

          return (
            <group key={idx}>
              {/* Quarter-cut sphere geometry to show interior */}
              <mesh
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectLayer(idx);
                }}
              >
                <sphereGeometry
                  args={[
                    Math.max(0.2, shellRadius),
                    32,
                    32,
                    0,
                    Math.PI * 1.5, // 270 degree arc leaving 90 degree slice open
                    0,
                    Math.PI,
                  ]}
                />
                <meshStandardMaterial
                  color={layer.color}
                  emissive={layer.color}
                  emissiveIntensity={isSelected ? 0.9 : 0.4}
                  roughness={0.5}
                  metalness={0.1}
                  side={THREE.DoubleSide}
                />
              </mesh>

              {/* Wireframe border on selected layer */}
              {isSelected && (
                <mesh>
                  <sphereGeometry args={[shellRadius * 1.01, 16, 16]} />
                  <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.3} />
                </mesh>
              )}
            </group>
          );
        })}
      </group>
    );
  }

  // Standard Exterior 3D Viewport
  return (
    <group ref={meshRef}>
      {/* 1. Main Stellar Sphere / Core Body */}
      <mesh>
        <sphereGeometry args={[visualRadius, 48, 48]} />
        <meshStandardMaterial
          color={baseColor}
          emissive={baseColor}
          emissiveIntensity={
            stage.visualType === "supernova"
              ? 2.0
              : stage.visualType === "white_dwarf"
                ? 1.5
                : stage.visualType === "neutron_star"
                  ? 1.8
                  : 0.8
          }
          roughness={stage.visualType === "black_hole" ? 0.0 : 0.7}
          metalness={stage.visualType === "black_hole" ? 1.0 : 0.0}
        />
      </mesh>

      {/* 2. Outer Atmospheric Corona / Nebula Gas */}
      <mesh ref={outerPuffRef}>
        <sphereGeometry args={[visualRadius * 1.25, 32, 32]} />
        <meshBasicMaterial
          color={glowColor}
          transparent
          opacity={
            stage.visualType === "nebula" ? 0.55 : stage.visualType === "supernova" ? 0.65 : 0.25
          }
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>

      {/* 3. Protostellar Accretion Disk / Black Hole Accretion Disk */}
      {(stage.visualType === "protostar" || stage.visualType === "black_hole") && (
        <mesh rotation={[-Math.PI / 2.3, 0, 0]}>
          <ringGeometry args={[visualRadius * 1.3, visualRadius * 2.8, 48]} />
          <meshBasicMaterial
            color={stage.visualType === "black_hole" ? "#a855f7" : "#f59e0b"}
            side={THREE.DoubleSide}
            transparent
            opacity={0.8}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}

      {/* 4. Pulsar Relativistic Beams */}
      {stage.visualType === "neutron_star" && (
        <group ref={beamRef}>
          {/* Top Jet Cone */}
          <mesh position={[0, visualRadius * 2.2, 0]}>
            <coneGeometry args={[0.4, visualRadius * 3.5, 32, 1, true]} />
            <meshBasicMaterial
              color="#38bdf8"
              transparent
              opacity={0.7}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Bottom Jet Cone */}
          <mesh position={[0, -visualRadius * 2.2, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.4, visualRadius * 3.5, 32, 1, true]} />
            <meshBasicMaterial
              color="#38bdf8"
              transparent
              opacity={0.7}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      )}

      {/* 5. Expanding Supernova Shockwave Particle Shell */}
      {stage.visualType === "supernova" && (
        <mesh>
          <sphereGeometry args={[visualRadius * 1.5, 24, 24]} />
          <meshBasicMaterial
            color="#ffffff"
            wireframe
            transparent
            opacity={0.4}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
    </group>
  );
}

export function StellarEvolutionTimeline3D({ onInteracted }: { onInteracted?: () => void }) {
  // Selected primary track
  const [selectedTrackId, setSelectedTrackId] = useState<string>("sun_like_10");
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(2); // Default to Main Sequence
  const [isCutaway, setIsCutaway] = useState<boolean>(false);
  const [selectedLayerIndex, setSelectedLayerIndex] = useState<number | null>(null);

  // Dual-Track Comparison mode
  const [isComparisonMode, setIsComparisonMode] = useState<boolean>(false);
  const [compareTrackId, setCompareTrackId] = useState<string>("massive_15");

  const currentTrack = useMemo(() => {
    return EVOLUTIONARY_TRACKS.find((t) => t.id === selectedTrackId) || EVOLUTIONARY_TRACKS[1];
  }, [selectedTrackId]);

  const compareTrack = useMemo(() => {
    return EVOLUTIONARY_TRACKS.find((t) => t.id === compareTrackId) || EVOLUTIONARY_TRACKS[2];
  }, [compareTrackId]);

  const currentStage = currentTrack.stages[currentStageIndex] || currentTrack.stages[0];

  const handleTrackChange = (id: string) => {
    setSelectedTrackId(id);
    setCurrentStageIndex(0); // Reset to beginning of new path
    setSelectedLayerIndex(null);
    onInteracted?.();
  };

  const handleStageSelect = (idx: number) => {
    setCurrentStageIndex(idx);
    setSelectedLayerIndex(null);
    onInteracted?.();
  };

  const handlePrevStage = () => {
    if (currentStageIndex > 0) {
      setCurrentStageIndex(currentStageIndex - 1);
      setSelectedLayerIndex(null);
      onInteracted?.();
    }
  };

  const handleNextStage = () => {
    if (currentStageIndex < currentTrack.stages.length - 1) {
      setCurrentStageIndex(currentStageIndex + 1);
      setSelectedLayerIndex(null);
      onInteracted?.();
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl space-y-6">
      {/* 1. Header with Mass Track Switcher & Comparison Mode */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <Flame className="size-4" />
            </span>
            <span className="text-xs font-mono font-bold text-orange-400 uppercase tracking-wider">
              Signature 3D Laboratory
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
            Controllable Stellar Evolution Timeline
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            A star's birth mass dictates its life story. Select an initial mass and follow nuclear
            fusion through millions to billions of years.
          </p>
        </div>

        {/* Action Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setIsCutaway(!isCutaway);
              onInteracted?.();
            }}
            className={
              isCutaway
                ? "bg-orange-500 text-white font-bold border-orange-400"
                : "border-white/10 text-slate-300 hover:text-white"
            }
          >
            <Layers className="size-3.5 mr-1 text-amber-400" />
            {isCutaway ? "Exterior View" : "Cutaway Interior"}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setIsComparisonMode(!isComparisonMode);
              onInteracted?.();
            }}
            className={
              isComparisonMode
                ? "bg-purple-600 text-white font-bold border-purple-400"
                : "border-white/10 text-slate-300 hover:text-white"
            }
          >
            <Scale className="size-3.5 mr-1 text-cyan-400" />
            {isComparisonMode ? "Single Track View" : "Compare Two Tracks"}
          </Button>
        </div>
      </div>

      {/* 2. Mass Track Selector Buttons */}
      <div className="space-y-2">
        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
          Choose Initial Stellar Mass:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {EVOLUTIONARY_TRACKS.map((track) => (
            <button
              key={track.id}
              onClick={() => handleTrackChange(track.id)}
              className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between gap-1.5 ${
                selectedTrackId === track.id
                  ? "bg-orange-950/40 border-orange-500 shadow-md shadow-orange-950/20"
                  : "bg-slate-950 border-white/10 hover:border-white/20 text-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-300">
                  {track.initialMassSolar} M☉
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {track.spectralClassZAMS}
                </span>
              </div>
              <div className="text-xs font-bold text-white line-clamp-1">{track.name}</div>
              <div className="text-[10px] text-slate-400">
                Remnant: <span className="text-cyan-300 font-semibold">{track.finalRemnant}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Crucial Scientific Callout for Sun-like Stars */}
      {selectedTrackId === "sun_like_10" && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3.5 flex items-start gap-3">
          <AlertTriangle className="size-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-200 leading-relaxed">
            <strong>Critical Scientific Fact:</strong> Our Sun will{" "}
            <strong>never explode as a supernova</strong>! The Sun lacks the ~8 M☉ gravitational
            mass required to ignite carbon fusion. Its life will end peacefully with a glowing
            planetary nebula and an Earth-sized white dwarf.
          </p>
        </div>
      )}

      {/* 3. 3D WebGL Canvas Viewport */}
      <div className="relative h-[380px] sm:h-[420px] rounded-2xl overflow-hidden border border-white/10 bg-black">
        <Canvas camera={{ position: [0, 1.2, 9], fov: 42 }}>
          <color attach="background" args={["#030712"]} />
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 15, 10]} intensity={1.5} />
          <directionalLight position={[-10, -5, -10]} intensity={0.4} color="#818cf8" />

          {/* Pedestal floor grid */}
          <gridHelper args={[24, 24, "#374151", "#111827"]} position={[0, -2.8, 0]} />

          <StageVisual3D
            stage={currentStage}
            isCutaway={isCutaway}
            selectedLayerIndex={selectedLayerIndex}
            onSelectLayer={setSelectedLayerIndex}
          />

          <OrbitControls
            enablePan={false}
            minDistance={3.0}
            maxDistance={18}
            maxPolarAngle={Math.PI / 2 + 0.1}
          />
        </Canvas>

        {/* Viewport Top Overlay HUD */}
        <div className="absolute top-4 left-4 pointer-events-none">
          <div className="rounded-xl border border-white/15 bg-slate-950/85 p-3.5 backdrop-blur-md max-w-sm space-y-1">
            <div className="flex items-center gap-2">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: currentStage.colorHex }}
              />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Phase {currentStage.phaseNumber} of {currentTrack.stages.length}
              </span>
            </div>
            <h4 className="text-sm font-extrabold text-amber-300">{currentStage.name}</h4>
            <div className="text-[11px] text-slate-300 font-mono">
              Age: {currentStage.timeRangeYears}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              T: {currentStage.temperatureK.toLocaleString()} K • R: {currentStage.radiusSolar} R☉ •
              L: {currentStage.luminositySolar.toLocaleString()} L☉
            </div>
          </div>
        </div>

        {/* Viewport Cutaway Indicator */}
        {isCutaway && (
          <div className="absolute top-4 right-4 pointer-events-none">
            <span className="px-3 py-1.5 rounded-xl border border-orange-500/40 bg-orange-950/80 text-[11px] font-mono text-orange-300 backdrop-blur-md">
              Interior Cutaway Active — Click Shells to Inspect
            </span>
          </div>
        )}

        {/* Viewport Navigation Chevron Controls */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-auto">
          <Button
            size="sm"
            onClick={handlePrevStage}
            disabled={currentStageIndex === 0}
            className="bg-black/60 hover:bg-black/90 border border-white/20 text-white text-xs disabled:opacity-30"
          >
            <ChevronLeft className="size-4 mr-1" />
            Previous Phase
          </Button>

          <span className="px-3 py-1 rounded-full bg-black/60 border border-white/10 text-[11px] text-slate-400 backdrop-blur-md">
            Drag to rotate 3D model • Scroll to zoom
          </span>

          <Button
            size="sm"
            onClick={handleNextStage}
            disabled={currentStageIndex === currentTrack.stages.length - 1}
            className="bg-black/60 hover:bg-black/90 border border-white/20 text-white text-xs disabled:opacity-30"
          >
            Next Phase
            <ChevronRight className="size-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* 4. Timeline Stage Scrubber */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Clock className="size-4 text-orange-400" />
            Evolutionary Lifeline Scrubber
          </span>
          <span className="text-xs text-slate-400 font-mono">
            Phase {currentStageIndex + 1} / {currentTrack.stages.length}
          </span>
        </div>

        {/* Horizontal Phase Timeline Track */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {currentTrack.stages.map((st, idx) => (
            <button
              key={st.id}
              onClick={() => handleStageSelect(idx)}
              className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                idx === currentStageIndex
                  ? "bg-orange-500 text-black font-bold shadow-lg shadow-orange-500/25 border-orange-400"
                  : idx < currentStageIndex
                    ? "bg-slate-950 border-emerald-500/30 text-emerald-300"
                    : "bg-slate-950 border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="text-[10px] font-mono block opacity-80">Phase {st.phaseNumber}</span>
              <span className="text-xs font-semibold line-clamp-2 mt-0.5">{st.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 5. Cutaway Nuclear Layer Inspector Card (When Cutaway Active) */}
      {isCutaway && (
        <div className="rounded-2xl border border-orange-500/30 bg-orange-950/15 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="size-4 text-orange-400" />
              Interior Concentric Burning Shells ({currentStage.name})
            </h4>
            <span className="text-xs text-slate-400">
              {currentStage.internalLayers.length} Concentric Zones
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {currentStage.internalLayers.map((layer, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedLayerIndex(idx)}
                className={`p-3.5 rounded-xl border cursor-pointer transition ${
                  selectedLayerIndex === idx
                    ? "bg-orange-500/20 border-orange-400 shadow-md"
                    : "bg-slate-950/70 border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: layer.color }}
                  />
                  <span className="text-xs font-bold text-white">{layer.name}</span>
                </div>
                <div className="text-[11px] text-amber-300 font-mono mb-1">{layer.reaction}</div>
                <div className="text-[10px] text-slate-400 font-mono">
                  T: {layer.tempK} • ρ: {layer.density}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Dual-Track Comparison (When Comparison Mode Active) */}
      {isComparisonMode && (
        <div className="rounded-2xl border border-purple-500/30 bg-purple-950/15 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Scale className="size-4 text-purple-400" />
              Side-by-Side Comparison: Sun-Like vs Massive Star
            </h4>
            <select
              value={compareTrackId}
              onChange={(e) => setCompareTrackId(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-lg text-xs text-slate-200 px-3 py-1.5"
            >
              <option value="massive_15">Compare with 15 M☉ (Massive Star)</option>
              <option value="hyper_massive_40">Compare with 40 M☉ (Hyper-Massive Star)</option>
              <option value="red_dwarf_02">Compare with 0.2 M☉ (Red Dwarf)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Track 1 Box */}
            <div className="rounded-xl border border-amber-500/30 bg-slate-950/80 p-4 space-y-2">
              <span className="text-xs font-bold text-amber-400 block">{currentTrack.name}</span>
              <ul className="space-y-1 text-slate-300">
                <li>
                  • Lifespan:{" "}
                  <strong className="text-white">{currentTrack.totalLifespanYears}</strong>
                </li>
                <li>
                  • Core Burning:{" "}
                  <strong className="text-white">
                    {currentTrack.stages[currentStageIndex]?.coreProcess || "Core fusion"}
                  </strong>
                </li>
                <li>
                  • Final Remnant:{" "}
                  <strong className="text-cyan-300">
                    {currentTrack.finalRemnant} ({currentTrack.remnantMassSolar} M☉)
                  </strong>
                </li>
                <li>
                  • Will Explode as Supernova:{" "}
                  <strong
                    className={currentTrack.willSupernova ? "text-rose-400" : "text-emerald-400"}
                  >
                    {currentTrack.willSupernova
                      ? "YES (Type II)"
                      : "NO (Planetary Nebula Shedding)"}
                  </strong>
                </li>
              </ul>
            </div>

            {/* Track 2 Box */}
            <div className="rounded-xl border border-purple-500/30 bg-slate-950/80 p-4 space-y-2">
              <span className="text-xs font-bold text-purple-400 block">{compareTrack.name}</span>
              <ul className="space-y-1 text-slate-300">
                <li>
                  • Lifespan:{" "}
                  <strong className="text-white">{compareTrack.totalLifespanYears}</strong>
                </li>
                <li>
                  • Final Remnant:{" "}
                  <strong className="text-cyan-300">
                    {compareTrack.finalRemnant} ({compareTrack.remnantMassSolar} M☉)
                  </strong>
                </li>
                <li>
                  • Will Explode as Supernova:{" "}
                  <strong
                    className={compareTrack.willSupernova ? "text-rose-400" : "text-emerald-400"}
                  >
                    {compareTrack.willSupernova ? "YES (Type II / Hypernova)" : "NO"}
                  </strong>
                </li>
                <li>
                  • Key Difference:{" "}
                  <span className="text-slate-400 leading-tight">
                    Massive stars burn fuel{" "}
                    {parseInt(currentTrack.totalLifespanYears) > 1000
                      ? "1,000× faster"
                      : "at catastrophic rates"}
                    , leaving pulsars or black holes.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 7. Current Stage Scientific Dossier */}
      <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-5 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Astrophysical Stage Summary: {currentStage.name}
        </h4>
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{currentStage.summary}</p>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-300 leading-relaxed">
          <strong className="text-orange-400">Underlying Astrophysics: </strong>
          {currentStage.scientificDetail}
        </div>
      </div>
    </div>
  );
}
