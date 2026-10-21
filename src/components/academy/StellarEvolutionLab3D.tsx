// @ts-nocheck
import React, { useRef, useState, useMemo, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import {
  STELLAR_TRACKS,
  type StellarEvolutionTrack,
  type EvolutionaryStage,
} from "@/lib/academy/lessons/module-10-stellar-evolution";
import {
  Play,
  Pause,
  RotateCcw,
  Layers,
  Sparkles,
  Info,
  Sliders,
  ChevronRight,
  Eye,
  CheckCircle2,
  Zap,
  Flame,
  Activity,
  Maximize2,
  Atom,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Cosmos3DAdapter } from "@/lib/cosmos/Cosmos3DAdapter";
import type { ApprovedDemonstrationId } from "@/lib/cosmos/cosmos-types";

// -------------------------------------------------------------
// Procedural textures for 3D stars and stages
// -------------------------------------------------------------
function usePlasmaTexture(colorHex: string, isSupergiant: boolean = false) {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.fillStyle = colorHex;
    ctx.fillRect(0, 0, 512, 512);

    const cellCount = isSupergiant ? 30 : 100;
    for (let i = 0; i < cellCount; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const r = (isSupergiant ? 25 : 8) + Math.random() * (isSupergiant ? 35 : 15);
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, "rgba(255, 255, 255, 0.5)");
      grad.addColorStop(0.5, colorHex + "66");
      grad.addColorStop(1, "rgba(0, 0, 0, 0.3)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [colorHex, isSupergiant]);
}

// -------------------------------------------------------------
// 3D Visualizer Component for Molecular Cloud
// -------------------------------------------------------------
function MolecularCloudMesh() {
  const pointsRef = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const count = 1200;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const color = new THREE.Color("#38bdf8");

    for (let i = 0; i < count; i++) {
      const radius = 1.5 + Math.random() * 3.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.6;
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const shade = 0.4 + Math.random() * 0.6;
      colors[i * 3] = color.r * shade;
      colors[i * 3 + 1] = color.g * shade;
      colors[i * 3 + 2] = color.b * shade;
    }
    return { positions, colors };
  }, []);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.08;
      pointsRef.current.rotation.z += delta * 0.03;
    }
  });

  return (
    <group>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particles.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[particles.colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.08}
          vertexColors
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
        />
      </points>
      {/* Dense central embryonic core */}
      <mesh>
        <sphereGeometry args={[0.6, 24, 24]} />
        <meshBasicMaterial color="#1e3a8a" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

// -------------------------------------------------------------
// 3D Visualizer for Protostar with Accretion Disk & Jets
// -------------------------------------------------------------
function ProtostarMesh() {
  const diskRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const jetRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (diskRef.current) diskRef.current.rotation.z += delta * 0.6;
    if (coreRef.current) coreRef.current.rotation.y += delta * 0.4;
    if (jetRef.current) jetRef.current.rotation.y += delta * 0.2;
  });

  return (
    <group>
      {/* Baby star core */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[1.0, 32, 32]} />
        <meshStandardMaterial
          color="#ea580c"
          emissive="#f97316"
          emissiveIntensity={1.2}
          roughness={0.4}
        />
      </mesh>
      {/* Equatorial accretion disk */}
      <mesh ref={diskRef} rotation={[-Math.PI / 2.3, 0, 0]}>
        <ringGeometry args={[1.3, 3.8, 48]} />
        <meshBasicMaterial color="#c2410c" side={THREE.DoubleSide} transparent opacity={0.65} />
      </mesh>
      {/* Collimated bipolar Herbig-Haro jets */}
      <group ref={jetRef}>
        {/* Top jet */}
        <mesh position={[0, 2.5, 0]}>
          <cylinderGeometry args={[0.06, 0.25, 3.2, 16]} />
          <meshBasicMaterial
            color="#38bdf8"
            transparent
            opacity={0.8}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        {/* Bottom jet */}
        <mesh position={[0, -2.5, 0]}>
          <cylinderGeometry args={[0.25, 0.06, 3.2, 16]} />
          <meshBasicMaterial
            color="#38bdf8"
            transparent
            opacity={0.8}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>
    </group>
  );
}

// -------------------------------------------------------------
// 3D Visualizer for Main Sequence / Giant Star
// -------------------------------------------------------------
function StarSphereMesh({
  stage,
  isGiant = false,
}: {
  stage: EvolutionaryStage;
  isGiant?: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const texture = usePlasmaTexture(stage.colorHex, isGiant);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.12;
      if (isGiant) {
        // Pulsating envelope
        const time = Date.now() * 0.002;
        const scale = 1.0 + Math.sin(time) * 0.035;
        meshRef.current.scale.set(scale, scale, scale);
      }
    }
    if (haloRef.current) {
      haloRef.current.rotation.z -= delta * 0.05;
    }
  });

  const baseSize = isGiant ? 2.2 : 1.35;

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[baseSize, 48, 48]} />
        <meshStandardMaterial
          map={texture || undefined}
          color={stage.colorHex}
          emissive={stage.colorHex}
          emissiveIntensity={isGiant ? 0.75 : 0.9}
          roughness={0.6}
        />
      </mesh>
      {/* Corona / Chromosphere halo */}
      <mesh ref={haloRef}>
        <sphereGeometry args={[baseSize * 1.18, 32, 32]} />
        <meshBasicMaterial
          color={stage.colorHex}
          transparent
          opacity={0.28}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

// -------------------------------------------------------------
// 3D Visualizer for Planetary Nebula
// -------------------------------------------------------------
function PlanetaryNebulaMesh() {
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (ring1Ref.current) ring1Ref.current.rotation.z += delta * 0.1;
    if (ring2Ref.current) ring2Ref.current.rotation.y += delta * 0.08;
    if (coreRef.current) coreRef.current.rotation.y += delta * 0.3;
  });

  return (
    <group>
      {/* Bare central white dwarf core */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.25, 24, 24]} />
        <meshBasicMaterial color="#e0f2fe" />
      </mesh>
      {/* Glowing fluorescent inner envelope ([O III] Cyan) */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[1.8, 0.45, 16, 64]} />
        <meshBasicMaterial
          color="#06b6d4"
          transparent
          opacity={0.55}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* Outer gas halo (H-alpha Ruby/Violet) */}
      <mesh ref={ring2Ref} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[2.8, 0.6, 16, 64]} />
        <meshBasicMaterial
          color="#a855f7"
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* Diffuse outer bubble */}
      <mesh>
        <sphereGeometry args={[3.4, 24, 24]} />
        <meshBasicMaterial
          color="#0284c7"
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

// -------------------------------------------------------------
// 3D Visualizer for Supernova Blast Wave
// -------------------------------------------------------------
function SupernovaMesh() {
  const blastRef = useRef<THREE.Mesh>(null);
  const debrisRef = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const count = 1500;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const colorA = new THREE.Color("#facc15");
    const colorB = new THREE.Color("#ef4444");

    for (let i = 0; i < count; i++) {
      const radius = 1.0 + Math.random() * 3.0;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const mixed = Math.random() > 0.5 ? colorA : colorB;
      colors[i * 3] = mixed.r;
      colors[i * 3 + 1] = mixed.g;
      colors[i * 3 + 2] = mixed.b;
    }
    return { positions, colors };
  }, []);

  useFrame((_, delta) => {
    if (blastRef.current) {
      blastRef.current.rotation.y += delta * 0.2;
      const t = Date.now() * 0.005;
      const s = 1.0 + Math.sin(t) * 0.08;
      blastRef.current.scale.set(s, s, s);
    }
    if (debrisRef.current) {
      debrisRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group>
      {/* Blinding central flash core */}
      <mesh>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      {/* Radiant blast shell */}
      <mesh ref={blastRef}>
        <sphereGeometry args={[2.4, 32, 32]} />
        <meshBasicMaterial
          color="#f59e0b"
          transparent
          opacity={0.45}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* High-velocity expanding debris filaments */}
      <points ref={debrisRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particles.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[particles.colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.09}
          vertexColors
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

// -------------------------------------------------------------
// 3D Visualizer for White Dwarf
// -------------------------------------------------------------
function WhiteDwarfMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  const auraRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.2;
    if (auraRef.current) auraRef.current.rotation.z -= delta * 0.1;
  });

  return (
    <group>
      {/* Earth-sized diamond dense core */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshStandardMaterial
          color="#f8fafc"
          emissive="#e0f2fe"
          emissiveIntensity={1.4}
          roughness={0.2}
        />
      </mesh>
      {/* Pale blue cooling thermal aura */}
      <mesh ref={auraRef}>
        <sphereGeometry args={[0.9, 24, 24]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

// -------------------------------------------------------------
// 3D Visualizer for Neutron Star / Pulsar
// -------------------------------------------------------------
function NeutronStarMesh() {
  const starRef = useRef<THREE.Mesh>(null);
  const beamGroupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    // Rapid rotation (pulsar spin)
    if (starRef.current) starRef.current.rotation.y += delta * 4.0;
    if (beamGroupRef.current) beamGroupRef.current.rotation.y += delta * 4.0;
  });

  return (
    <group>
      {/* Ultra-dense city-sized neutron sphere */}
      <mesh ref={starRef}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={1.8} />
      </mesh>
      {/* Tilted magnetic axis with twin synchrotron beams */}
      <group ref={beamGroupRef} rotation={[0, 0, Math.PI / 6]}>
        {/* Top relativistic beam */}
        <mesh position={[0, 2.6, 0]}>
          <cylinderGeometry args={[0.08, 0.45, 5.0, 16]} />
          <meshBasicMaterial
            color="#67e8f9"
            transparent
            opacity={0.75}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        {/* Bottom beam */}
        <mesh position={[0, -2.6, 0]}>
          <cylinderGeometry args={[0.45, 0.08, 5.0, 16]} />
          <meshBasicMaterial
            color="#67e8f9"
            transparent
            opacity={0.75}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>
    </group>
  );
}

// -------------------------------------------------------------
// 3D Visualizer for Stellar Black Hole with Lensing & Accretion
// -------------------------------------------------------------
function BlackHoleMesh() {
  const diskRef = useRef<THREE.Mesh>(null);
  const photonRingRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (diskRef.current) diskRef.current.rotation.z += delta * 0.8;
    if (photonRingRef.current) photonRingRef.current.rotation.z -= delta * 0.3;
  });

  return (
    <group>
      {/* Pitch black event horizon */}
      <mesh>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      {/* Lensed Photon Sphere Ring */}
      <mesh ref={photonRingRef}>
        <ringGeometry args={[0.72, 0.84, 48]} />
        <meshBasicMaterial
          color="#c084fc"
          side={THREE.DoubleSide}
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* Relativistic Accretion Disk (Doppler boosted) */}
      <mesh ref={diskRef} rotation={[-Math.PI / 2.5, 0, 0]}>
        <ringGeometry args={[0.95, 3.2, 64]} />
        <meshBasicMaterial
          color="#a855f7"
          side={THREE.DoubleSide}
          transparent
          opacity={0.75}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

// -------------------------------------------------------------
// Cutaway Hemisphere Shells View
// -------------------------------------------------------------
function CutawayInternalMesh({
  stage,
  selectedLayerIndex,
  onSelectLayer,
}: {
  stage: EvolutionaryStage;
  selectedLayerIndex: number | null;
  onSelectLayer: (idx: number) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.08;
    }
  });

  const layers = stage.cutawayLayers;
  // Calculate radii from inside out
  const shellRadii = useMemo(() => {
    let running = 0.4;
    return layers.map((layer) => {
      const r = running;
      running += (layer.thicknessPct / 100) * 1.8;
      return r;
    });
  }, [layers]);

  return (
    <group ref={groupRef} rotation={[0, -Math.PI / 4, 0]}>
      {layers.map((layer, idx) => {
        const radius = shellRadii[idx];
        const isSelected = selectedLayerIndex === idx;

        return (
          <group key={layer.name}>
            {/* Cutaway half-sphere */}
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                onSelectLayer(idx);
              }}
            >
              <sphereGeometry
                args={[
                  radius,
                  32,
                  16,
                  0,
                  Math.PI, // Half sphere cutaway!
                  0,
                  Math.PI,
                ]}
              />
              <meshStandardMaterial
                color={isSelected ? "#ffffff" : layer.color}
                emissive={layer.color}
                emissiveIntensity={isSelected ? 0.9 : 0.4}
                side={THREE.DoubleSide}
                wireframe={false}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// -------------------------------------------------------------
// Master Scene Router for Current Stage Visual
// -------------------------------------------------------------
function StageVisual({
  stage,
  showCutaway,
  selectedLayerIndex,
  onSelectLayer,
}: {
  stage: EvolutionaryStage;
  showCutaway: boolean;
  selectedLayerIndex: number | null;
  onSelectLayer: (idx: number) => void;
}) {
  if (showCutaway && stage.cutawayLayers.length > 0) {
    return (
      <CutawayInternalMesh
        stage={stage}
        selectedLayerIndex={selectedLayerIndex}
        onSelectLayer={onSelectLayer}
      />
    );
  }

  switch (stage.visualType) {
    case "cloud":
      return <MolecularCloudMesh />;
    case "protostar":
      return <ProtostarMesh />;
    case "main_sequence":
      return <StarSphereMesh stage={stage} isGiant={false} />;
    case "giant":
      return <StarSphereMesh stage={stage} isGiant={true} />;
    case "supergiant":
      return <StarSphereMesh stage={stage} isGiant={true} />;
    case "planetary_nebula":
      return <PlanetaryNebulaMesh />;
    case "supernova":
      return <SupernovaMesh />;
    case "white_dwarf":
      return <WhiteDwarfMesh />;
    case "neutron_star":
      return <NeutronStarMesh />;
    case "black_hole":
      return <BlackHoleMesh />;
    default:
      return <StarSphereMesh stage={stage} isGiant={false} />;
  }
}

// -------------------------------------------------------------
// MAIN COMPONENT: Stellar Evolution Lab
// -------------------------------------------------------------
interface StellarEvolutionLab3DProps {
  onStageChange?: (stage: EvolutionaryStage) => void;
}

export function StellarEvolutionLab3D({ onStageChange }: StellarEvolutionLab3DProps) {
  const [selectedTrackId, setSelectedTrackId] = useState<string>("sun_like");
  const [timelineFraction, setTimelineFraction] = useState<number>(0.5); // 0 to 1
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [showCutaway, setShowCutaway] = useState<boolean>(false);
  const [selectedLayerIndex, setSelectedLayerIndex] = useState<number | null>(null);

  const activeTrack = STELLAR_TRACKS[selectedTrackId] || STELLAR_TRACKS.sun_like;

  // Derive current stage based on timelineFraction
  const currentStage = useMemo(() => {
    const stages = activeTrack.stages;
    if (timelineFraction <= stages[0].timeFraction) return stages[0];
    if (timelineFraction >= stages[stages.length - 1].timeFraction)
      return stages[stages.length - 1];

    let found = stages[0];
    for (let i = 0; i < stages.length; i++) {
      if (timelineFraction >= stages[i].timeFraction) {
        found = stages[i];
      }
    }
    return found;
  }, [activeTrack, timelineFraction]);

  // Inform parent if needed
  useEffect(() => {
    if (onStageChange) {
      onStageChange(currentStage);
    }
  }, [currentStage, onStageChange]);

  // Playback timer loop
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setTimelineFraction((prev) => {
        const step = 0.004 * playbackSpeed;
        const next = prev + step;
        if (next >= 1.0) {
          setIsPlaying(false);
          return 1.0;
        }
        return next;
      });
    }, 40);
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  useEffect(() => {
    const adapter = Cosmos3DAdapter.getInstance();
    const unregister = adapter.registerScene({
      sceneId: "stellar_evolution",
      getCurrentSimulationState: () => ({
        isPaused: !isPlaying,
        timeScale: playbackSpeed,
        activeSceneId: "stellar_evolution",
        activeExperimentId: selectedTrackId,
        selectedObjectName: currentStage.name,
        epistemicMode: "educational_approximation",
        scientificNotes:
          "Henyey-type stellar evolution tracks mapped to discrete evolutionary phases from protostar to compact remnant.",
        cameraRegime: "stellar",
      }),
      getSelectedObject: () => ({
        name: `${activeTrack.name} (${currentStage.name})`,
        type: "star",
        distanceFromObserver: "Stellar evolution theoretical track",
        catalogReference: "Henyey Stellar Evolution Code / Geneva Grids",
        isModelAvailable: true,
        physicalProperties: {
          initialMassSolar: activeTrack.initialMassSolar,
          currentRadiusSolar: currentStage.radiusSolar,
          surfaceTempK: currentStage.surfaceTempK,
          luminositySolar: currentStage.luminositySolar,
          coreProcess: currentStage.coreProcess,
          remnantType: activeTrack.remnantType,
        },
        scientificDescription: `${currentStage.name}: ${currentStage.coreProcess}. Remnant outcome: ${activeTrack.remnantType}.`,
      }),
      focusObject: (targetName: string) => {
        const foundTrack = Object.values(STELLAR_TRACKS).find(
          (t) =>
            t.name.toLowerCase().includes(targetName.toLowerCase()) ||
            t.id.toLowerCase().includes(targetName.toLowerCase()),
        );
        if (foundTrack) {
          setSelectedTrackId(foundTrack.id);
          return true;
        }
        return false;
      },
      highlightObject: () => {
        setShowCutaway(true);
        return true;
      },
      playDemonstration: (demoId: ApprovedDemonstrationId) => {
        if (demoId === "stellar_collapse") {
          setSelectedTrackId("massive");
          setTimelineFraction(0.95);
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
  }, [isPlaying, playbackSpeed, selectedTrackId, currentStage, activeTrack]);

  const activeLayer =
    selectedLayerIndex !== null && currentStage.cutawayLayers[selectedLayerIndex]
      ? currentStage.cutawayLayers[selectedLayerIndex]
      : null;

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/90 shadow-2xl flex flex-col">
      {/* Header bar with controls */}
      <div className="px-5 py-4 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400">
              <Zap className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-semibold text-white tracking-wide">
                Stellar Evolution Timeline Lab
              </h3>
              <p className="text-xs text-slate-400">
                Interactive astrophysical simulation driven by initial birth mass
              </p>
            </div>
          </div>
        </div>

        {/* Track selector presets */}
        <div className="flex flex-wrap items-center gap-2">
          {Object.values(STELLAR_TRACKS).map((track) => {
            const isSelected = track.id === selectedTrackId;
            return (
              <button
                key={track.id}
                onClick={() => {
                  setSelectedTrackId(track.id);
                  setTimelineFraction(0.5);
                  setSelectedLayerIndex(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25 border border-orange-400/40"
                    : "bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/50"
                }`}
              >
                {track.initialMassSolar} M☉ {track.name.split(" ")[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3D Viewport Area */}
      <div className="relative w-full h-[400px] sm:h-[480px] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <Canvas
          camera={{ position: [0, 1.2, 5.0], fov: 45 }}
          className="w-full h-full cursor-grab active:cursor-grabbing"
        >
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1.5} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />
          <Suspense fallback={null}>
            <StageVisual
              stage={currentStage}
              showCutaway={showCutaway}
              selectedLayerIndex={selectedLayerIndex}
              onSelectLayer={(idx) => setSelectedLayerIndex(idx)}
            />
          </Suspense>
          <OrbitControls
            enablePan={false}
            minDistance={2.0}
            maxDistance={12.0}
            autoRotate={false}
            onStart={() => Cosmos3DAdapter.getInstance().setUserControllingCamera(true)}
            onEnd={() => Cosmos3DAdapter.getInstance().setUserControllingCamera(false)}
          />
        </Canvas>

        {/* Overlay Telemetry HUD (Top-Left) */}
        <div className="absolute top-4 left-4 pointer-events-none max-w-xs sm:max-w-sm">
          <div className="p-3.5 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-800 text-xs shadow-xl space-y-2 pointer-events-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-semibold text-white text-sm flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block animate-pulse"
                  style={{ backgroundColor: currentStage.colorHex }}
                />
                {currentStage.name}
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {currentStage.phaseLabel}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400">Elapsed Age:</span>
                <p className="font-mono text-cyan-300 font-medium">{currentStage.ageDisplay}</p>
              </div>
              <div>
                <span className="text-slate-400">Surface Temp:</span>
                <p className="font-mono text-amber-300 font-medium">
                  {currentStage.surfaceTempK > 0
                    ? `${currentStage.surfaceTempK.toLocaleString()} K`
                    : "Near 0 K (Horizon)"}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Radius:</span>
                <p className="font-mono text-emerald-300 font-medium">
                  {currentStage.radiusSolar >= 1000
                    ? `${(currentStage.radiusSolar / 1000).toFixed(0)}k R☉`
                    : `${currentStage.radiusSolar} R☉`}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Luminosity:</span>
                <p className="font-mono text-purple-300 font-medium">
                  {currentStage.luminositySolar >= 1000000
                    ? `${(currentStage.luminositySolar / 1000000).toFixed(1)}M L☉`
                    : `${currentStage.luminositySolar} L☉`}
                </p>
              </div>
            </div>

            <div className="pt-1.5 border-t border-slate-800/80 text-[11px]">
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider">
                Core State / Nuclear Process:
              </span>
              <p className="text-slate-200 mt-0.5 leading-tight text-[11px] font-sans">
                {currentStage.coreProcess}
              </p>
            </div>
          </div>
        </div>

        {/* Top-Right Toggle for Cutaway & View Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <Button
            size="sm"
            onClick={() => {
              setShowCutaway(!showCutaway);
              setSelectedLayerIndex(null);
            }}
            className={`text-xs gap-1.5 backdrop-blur-md transition-all ${
              showCutaway
                ? "bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold shadow-lg shadow-amber-500/30"
                : "bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            {showCutaway ? "External View" : "Cutaway Shells"}
          </Button>

          <div className="px-2.5 py-1.5 rounded-lg bg-slate-900/80 backdrop-blur-md border border-slate-800 text-[10px] text-slate-400 text-center">
            Drag to Rotate • Scroll to Zoom
          </div>
        </div>

        {/* Active Cutaway Layer Inspector Modal Overlay */}
        {showCutaway && activeLayer && (
          <div className="absolute bottom-4 left-4 right-4 max-w-lg mx-auto p-3.5 rounded-xl bg-slate-900/95 backdrop-blur-md border border-amber-500/40 text-xs shadow-2xl z-10 animate-in fade-in">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-amber-300 flex items-center gap-1.5 text-sm">
                <Atom className="w-4 h-4 text-amber-400" />
                {activeLayer.name}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Temp: {activeLayer.temperatureK}
              </span>
            </div>
            <p className="text-slate-300 text-xs mb-1">
              <strong className="text-slate-400">Composition:</strong> {activeLayer.composition}
            </p>
            <p className="text-slate-300 text-xs">
              <strong className="text-slate-400">Reaction:</strong> {activeLayer.reaction}
            </p>
          </div>
        )}
      </div>

      {/* Scrubber & Controls Panel */}
      <div className="p-5 bg-slate-900/90 border-t border-slate-800 flex flex-col gap-4">
        {/* Timeline Slider with Quick Stage Jumps */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-orange-400" />
              Timeline Scrubber ({Math.round(timelineFraction * 100)}% of life)
            </span>
            <span className="text-slate-400 font-mono text-[11px]">
              Total Span: {activeTrack.lifetimeDisplay}
            </span>
          </div>

          {/* Slider input */}
          <input
            type="range"
            min="0"
            max="1"
            step="0.005"
            value={timelineFraction}
            onChange={(e) => {
              setTimelineFraction(parseFloat(e.target.value));
              setIsPlaying(false);
            }}
            className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500 focus:outline-none"
          />

          {/* Clickable Stage Markers */}
          <div className="flex items-center justify-between gap-1 overflow-x-auto py-1">
            {activeTrack.stages.map((stage) => {
              const isCurrent = currentStage.id === stage.id;
              return (
                <button
                  key={stage.id}
                  onClick={() => {
                    setTimelineFraction(stage.timeFraction);
                    setIsPlaying(false);
                    setSelectedLayerIndex(null);
                  }}
                  className={`px-2 py-1 rounded text-[10px] font-medium whitespace-nowrap transition-all ${
                    isCurrent
                      ? "bg-orange-500/20 text-orange-300 border border-orange-500/40"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  {stage.name.split(" ")[0]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Playback bar & Cutaway layer buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsPlaying(!isPlaying)}
              className="bg-slate-800 hover:bg-slate-700 text-white border-slate-700 gap-1.5 text-xs"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isPlaying ? "Pause" : "Play Evolution"}
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setTimelineFraction(0);
                setIsPlaying(false);
              }}
              className="text-slate-400 hover:text-white text-xs gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </Button>

            <div className="flex items-center gap-1 bg-slate-800/60 rounded-lg p-0.5 border border-slate-700 text-xs">
              {[0.5, 1.0, 3.0].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                    playbackSpeed === spd
                      ? "bg-orange-500 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          {/* Interactive layer selector if cutaway is enabled */}
          {showCutaway && currentStage.cutawayLayers.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="text-[11px] text-slate-400 whitespace-nowrap">Shell Layers:</span>
              {currentStage.cutawayLayers.map((layer, idx) => (
                <button
                  key={layer.name}
                  onClick={() => setSelectedLayerIndex(idx)}
                  className={`px-2 py-1 rounded text-[10px] font-medium border transition-all ${
                    selectedLayerIndex === idx
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                      : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
                  }`}
                >
                  {layer.name.split(" ")[0]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
