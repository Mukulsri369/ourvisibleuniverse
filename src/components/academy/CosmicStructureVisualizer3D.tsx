import React, { useRef, useState, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";
import {
  ZoomIn,
  ZoomOut,
  Layers,
  Eye,
  EyeOff,
  Sparkles,
  Info,
  Compass,
  Play,
  Pause,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  COSMIC_LANDMARKS,
  CosmicStructureLandmark,
} from "@/lib/academy/lessons/module-15-cosmic-web";

export type CosmicZoomStage = "milkyway" | "localgroup" | "clusters" | "laniakea" | "cosmicweb";

interface ZoomStageConfig {
  id: CosmicZoomStage;
  label: string;
  spanLabel: string;
  cameraDistance: number;
  description: string;
}

const ZOOM_STAGES: ZoomStageConfig[] = [
  {
    id: "milkyway",
    label: "1. Milky Way",
    spanLabel: "100,000 Light-Years",
    cameraDistance: 6,
    description:
      "Our home barred spiral galaxy, containing 200–400 billion stars and our Solar System.",
  },
  {
    id: "localgroup",
    label: "2. The Local Group",
    spanLabel: "10 Million Light-Years (3 Mpc)",
    cameraDistance: 14,
    description:
      "Gravitationally bound group of 80+ galaxies dominated by the Milky Way and Andromeda (M31).",
  },
  {
    id: "clusters",
    label: "3. Galaxy Clusters",
    spanLabel: "50–350 Million Light-Years",
    cameraDistance: 28,
    description:
      "Massive virialized cities of thousands of galaxies (Virgo & Coma), held by immense dark matter halos.",
  },
  {
    id: "laniakea",
    label: "4. Laniakea Supercluster",
    spanLabel: "520 Million Light-Years (160 Mpc)",
    cameraDistance: 45,
    description:
      "Kinematic basin of 100,000 galaxies streaming toward the Great Attractor; not gravitationally bound!",
  },
  {
    id: "cosmicweb",
    label: "5. The Cosmic Web & Voids",
    spanLabel: "1–2 Billion Light-Years",
    cameraDistance: 70,
    description:
      "Large-scale structure: dense filaments, cluster nodes, and colossal underdense voids (Boötes).",
  },
];

// 3D Point-Cloud Scene for Cosmic Web, Filaments, Clusters, and Voids
function CosmicWebScene({
  zoomStage,
  showDarkMatter,
  showFilaments,
  showBoundStatus,
  formationEpoch,
  selectedLandmarkId,
  onSelectLandmark,
}: {
  zoomStage: CosmicZoomStage;
  showDarkMatter: boolean;
  showFilaments: boolean;
  showBoundStatus: boolean;
  formationEpoch: number; // 0 (z=1100 smooth) to 1 (z=0 today)
  selectedLandmarkId: string;
  onSelectLandmark: (id: string) => void;
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const dmPointsRef = useRef<THREE.Points>(null);
  const webGroupRef = useRef<THREE.Group>(null);

  // Generate research-grounded filamentary distribution via anisotropic attractor curves
  const [galaxyPositions, galaxyColors, dmPositions] = useMemo(() => {
    const galaxyCount = 3800;
    const dmCount = 4200;

    const gPos = new Float32Array(galaxyCount * 3);
    const gCol = new Float32Array(galaxyCount * 3);
    const dmPos = new Float32Array(dmCount * 3);

    // Seeded filament spine nodes (representing cosmic web attractor axes)
    const spines = [
      new THREE.Vector3(0, 0, 0), // Local Group / Virgo
      new THREE.Vector3(15, 8, -6), // Toward Coma Cluster node
      new THREE.Vector3(-18, -12, 14), // Centaurus / Great Attractor
      new THREE.Vector3(10, -22, -18), // Perseus-Pisces filament
      new THREE.Vector3(-25, 18, -12), // Hercules cluster branch
      new THREE.Vector3(22, -6, 26), // Shapley supercluster spine
    ];

    // Seed galaxy particles clustered along spines
    for (let i = 0; i < galaxyCount; i++) {
      const i3 = i * 3;
      const spineIdx = Math.floor(Math.random() * (spines.length - 1));
      const s1 = spines[spineIdx];
      const s2 = spines[spineIdx + 1];

      // Interpolate along spine
      const t = Math.random();
      const pt = s1.clone().lerp(s2, t);

      // Radial scatter from filament axis (clustering tighter at nodes)
      const distFromNode = Math.min(pt.distanceTo(s1), pt.distanceTo(s2));
      const nodeClusterFactor = distFromNode < 5 ? 0.8 : 2.5;

      const spread = (Math.random() - 0.5) * nodeClusterFactor * 4.5;
      const spreadY = (Math.random() - 0.5) * nodeClusterFactor * 4.5;
      const spreadZ = (Math.random() - 0.5) * nodeClusterFactor * 4.5;

      // Formation epoch effect: early epoch (0) spreads particles out uniformly (smooth CMB); late epoch (1) collapses into sharp filaments
      const collapseFactor = 0.2 + formationEpoch * 0.8;
      const x = pt.x * collapseFactor + spread * (1.8 - formationEpoch * 0.8);
      const y = pt.y * collapseFactor + spreadY * (1.8 - formationEpoch * 0.8);
      const z = pt.z * collapseFactor + spreadZ * (1.8 - formationEpoch * 0.8);

      // Boötes Void exclusion zone (a large spherical empty bubble centered at [18, 16, 12])
      const voidCenter = new THREE.Vector3(16, 14, 12);
      const distToVoid = new THREE.Vector3(x, y, z).distanceTo(voidCenter);
      if (distToVoid < 11 && Math.random() > 0.04) {
        // Push galaxy out of void to create the void wall
        const dir = new THREE.Vector3(x, y, z).sub(voidCenter).normalize();
        gPos[i3] = voidCenter.x + dir.x * 12 + spread * 0.5;
        gPos[i3 + 1] = voidCenter.y + dir.y * 12 + spreadY * 0.5;
        gPos[i3 + 2] = voidCenter.z + dir.z * 12 + spreadZ * 0.5;
      } else {
        gPos[i3] = x;
        gPos[i3 + 1] = y;
        gPos[i3 + 2] = z;
      }

      // Color coding: dense cluster nodes are gold/amber (ellipticals), filaments are cyan/blue (spirals)
      if (distFromNode < 4.5) {
        gCol[i3] = 1.0;
        gCol[i3 + 1] = 0.82;
        gCol[i3 + 2] = 0.45; // Golden yellow cluster core
      } else {
        gCol[i3] = 0.4;
        gCol[i3 + 1] = 0.85;
        gCol[i3 + 2] = 1.0; // Cyan spiral in filament
      }
    }

    // Seed dark matter particles (more diffuse, extending wider into the halo)
    for (let i = 0; i < dmCount; i++) {
      const i3 = i * 3;
      const spineIdx = Math.floor(Math.random() * (spines.length - 1));
      const s1 = spines[spineIdx];
      const s2 = spines[spineIdx + 1];
      const t = Math.random();
      const pt = s1.clone().lerp(s2, t);

      const dmSpread = (Math.random() - 0.5) * 8.5;
      const collapseFactor = 0.2 + formationEpoch * 0.8;

      dmPos[i3] = pt.x * collapseFactor + dmSpread;
      dmPos[i3 + 1] = pt.y * collapseFactor + dmSpread;
      dmPos[i3 + 2] = pt.z * collapseFactor + dmSpread;
    }

    return [gPos, gCol, dmPos];
  }, [formationEpoch]);

  // Slow majestic rotation of the cosmic web
  useFrame((_, delta) => {
    if (webGroupRef.current) {
      webGroupRef.current.rotation.y += delta * 0.035;
    }
  });

  return (
    <group ref={webGroupRef}>
      {/* 1. Visible Galaxies Point Cloud */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[galaxyPositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[galaxyColors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={zoomStage === "milkyway" ? 0.35 : zoomStage === "localgroup" ? 0.28 : 0.22}
          vertexColors
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* 2. Cold Dark Matter Scaffolding Layer (Volumetric Purple Halo) */}
      {showDarkMatter && (
        <points ref={dmPointsRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[dmPositions, 3]} />
          </bufferGeometry>
          <pointsMaterial
            size={0.35}
            color="#a855f7"
            transparent
            opacity={0.32}
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}

      {/* 3. Cosmic Filament Connecting Bridges (When enabled) */}
      {showFilaments && (
        <group>
          {/* Filament bridge 1: Local Group to Coma Cluster */}
          <line>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[new Float32Array([0, 0, 0, 15, 8, -6]), 3]}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#38bdf8" transparent opacity={0.35} />
          </line>

          {/* Filament bridge 2: Local Group to Great Attractor */}
          <line>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[new Float32Array([0, 0, 0, -18, -12, 14]), 3]}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#38bdf8" transparent opacity={0.35} />
          </line>

          {/* Filament bridge 3: Coma to Hercules cluster */}
          <line>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[new Float32Array([15, 8, -6, -25, 18, -12]), 3]}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#38bdf8" transparent opacity={0.25} />
          </line>
        </group>
      )}

      {/* 4. Interactive Landmark Beacon Anchors */}
      {/* A. Milky Way (Center 0,0,0) */}
      <group position={[0, 0, 0]} onClick={() => onSelectLandmark("milky_way")}>
        <mesh>
          <sphereGeometry args={[0.55, 24, 24]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
        <mesh rotation={[-Math.PI / 2.5, 0, 0]}>
          <ringGeometry args={[0.6, 1.4, 32]} />
          <meshBasicMaterial color="#67e8f9" side={THREE.DoubleSide} transparent opacity={0.7} />
        </mesh>
      </group>

      {/* B. Andromeda Galaxy (M31) offset at [2.2, 0.8, -1.2] */}
      <group position={[2.2, 0.8, -1.2]} onClick={() => onSelectLandmark("local_group")}>
        <mesh>
          <sphereGeometry args={[0.5, 24, 24]} />
          <meshBasicMaterial color="#a78bfa" />
        </mesh>
        <mesh rotation={[-Math.PI / 3, 0, 0]}>
          <ringGeometry args={[0.55, 1.3, 32]} />
          <meshBasicMaterial color="#c4b5fd" side={THREE.DoubleSide} transparent opacity={0.65} />
        </mesh>
      </group>

      {/* C. Virgo Cluster Node at [6.5, 4.2, -3.5] */}
      <group position={[6.5, 4.2, -3.5]} onClick={() => onSelectLandmark("virgo_cluster")}>
        <mesh>
          <sphereGeometry args={[1.2, 24, 24]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.55} />
        </mesh>
        <mesh>
          <sphereGeometry args={[2.5, 24, 24]} />
          <meshBasicMaterial color="#f59e0b" transparent opacity={0.15} wireframe />
        </mesh>
      </group>

      {/* D. Coma Cluster Node at [15, 8, -6] */}
      <group position={[15, 8, -6]} onClick={() => onSelectLandmark("coma_cluster")}>
        <mesh>
          <sphereGeometry args={[1.5, 24, 24]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.65} />
        </mesh>
        <mesh>
          <sphereGeometry args={[3.2, 24, 24]} />
          <meshBasicMaterial color="#d97706" transparent opacity={0.18} wireframe />
        </mesh>
      </group>

      {/* E. Boötes Supervoid Bubble at [16, 14, 12] */}
      <group position={[16, 14, 12]} onClick={() => onSelectLandmark("bootes_void")}>
        <mesh>
          <sphereGeometry args={[10, 32, 32]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.06} side={THREE.BackSide} />
        </mesh>
        <mesh>
          <sphereGeometry args={[10, 16, 16]} />
          <meshBasicMaterial color="#60a5fa" transparent opacity={0.15} wireframe />
        </mesh>
      </group>

      {/* 5. Gravitational Bound Status Indicator Overlays */}
      {showBoundStatus && (
        <group>
          {/* Bound: Local Group boundary sphere (Green) */}
          <mesh position={[1.1, 0.4, -0.6]}>
            <sphereGeometry args={[3.2, 24, 24]} />
            <meshBasicMaterial color="#22c55e" transparent opacity={0.12} wireframe />
          </mesh>

          {/* Bound: Virgo Cluster boundary sphere (Green) */}
          <mesh position={[6.5, 4.2, -3.5]}>
            <sphereGeometry args={[3.8, 24, 24]} />
            <meshBasicMaterial color="#22c55e" transparent opacity={0.15} wireframe />
          </mesh>

          {/* NOT Bound: Laniakea Supercluster envelope (Red/Dashed Alert) */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[35, 24, 24]} />
            <meshBasicMaterial color="#ef4444" transparent opacity={0.08} wireframe />
          </mesh>
        </group>
      )}
    </group>
  );
}

interface CosmicStructureVisualizer3DProps {
  onInteract?: () => void;
}

export function CosmicStructureVisualizer3D({ onInteract }: CosmicStructureVisualizer3DProps) {
  const [zoomStage, setZoomStage] = useState<CosmicZoomStage>("clusters");
  const [selectedLandmarkId, setSelectedLandmarkId] = useState<string>("local_group");
  const [showDarkMatter, setShowDarkMatter] = useState<boolean>(true);
  const [showFilaments, setShowFilaments] = useState<boolean>(true);
  const [showBoundStatus, setShowBoundStatus] = useState<boolean>(true);
  const [formationEpoch, setFormationEpoch] = useState<number>(1.0); // 1.0 = z=0 today
  const [isPlayingTimeline, setIsPlayingTimeline] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Timeline playback loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlayingTimeline) {
      interval = setInterval(() => {
        setFormationEpoch((prev) => {
          if (prev >= 1) return 0;
          return Number((prev + 0.05).toFixed(2));
        });
      }, 250);
    }
    return () => clearInterval(interval);
  }, [isPlayingTimeline]);

  const currentStageConfig = ZOOM_STAGES.find((s) => s.id === zoomStage) || ZOOM_STAGES[2];
  const selectedLandmark =
    COSMIC_LANDMARKS.find((l) => l.id === selectedLandmarkId) || COSMIC_LANDMARKS[1];

  // Helper to get redshift from formation epoch
  const getEpochLabel = (val: number) => {
    if (val <= 0.05) return "z ≈ 1100 (Recombination & Cosmic Microwave Background)";
    if (val <= 0.25) return "z ≈ 20 (First Dark Matter Halos & Cosmic Dawn)";
    if (val <= 0.5) return "z ≈ 6 (First Galaxy Groups Assemble)";
    if (val <= 0.75) return "z ≈ 1.5 (Massive Galaxy Clusters Virialize)";
    if (val < 1.0) return "z ≈ 0.3 (Cosmic Web Tightens)";
    return "z = 0 (Present Day: 13.8 Billion Years)";
  };

  return (
    <div className="rounded-3xl border border-indigo-500/30 bg-slate-950 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-5">
      {/* Header bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-3 py-0.5 rounded-full uppercase tracking-wider">
              Signature 3D Experience • Cosmic Web Atlas
            </span>
            <span className="text-xs text-slate-400">Large-Scale Structure of the Universe</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            <span>{currentStageConfig.label}</span>
            <span className="text-xs font-mono font-normal text-cyan-300 bg-cyan-950/60 px-2.5 py-1 rounded-md border border-cyan-500/30">
              Span: {currentStageConfig.spanLabel}
            </span>
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">{currentStageConfig.description}</p>
        </div>

        {/* Zoom Stage Step Selector */}
        <div className="flex flex-wrap items-center gap-1.5">
          {ZOOM_STAGES.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setZoomStage(s.id);
                onInteract?.();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                zoomStage === s.id
                  ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30 border border-indigo-400/50"
                  : "bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/10"
              }`}
            >
              {s.label.split(". ")[1]}
            </button>
          ))}
        </div>
      </div>

      {/* 3D Canvas Stage */}
      <div className="relative rounded-2xl border border-white/10 bg-[#020512] h-[450px] sm:h-[520px] w-full overflow-hidden shadow-inner">
        {mounted ? (
          <Canvas
            camera={{ position: [0, 8, currentStageConfig.cameraDistance], fov: 45 }}
            dpr={[1, 1.5]}
            gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
          >
            <color attach="background" args={["#020512"]} />
            <ambientLight intensity={0.5} />
            <pointLight position={[20, 20, 20]} intensity={1.5} color="#ffffff" />
            <CosmicWebScene
              zoomStage={zoomStage}
              showDarkMatter={showDarkMatter}
              showFilaments={showFilaments}
              showBoundStatus={showBoundStatus}
              formationEpoch={formationEpoch}
              selectedLandmarkId={selectedLandmarkId}
              onSelectLandmark={(id) => {
                setSelectedLandmarkId(id);
                onInteract?.();
              }}
            />
            <OrbitControls
              enableZoom={true}
              maxDistance={120}
              minDistance={3.5}
              autoRotate={!isPlayingTimeline}
              autoRotateSpeed={0.35}
            />
          </Canvas>
        ) : (
          <div className="w-full h-full bg-[#020512] flex items-center justify-center text-xs text-indigo-400 font-mono">
            Loading Scalable 3D Cosmic Web Simulator...
          </div>
        )}

        {/* Top-Left: Selected Landmark Inspector HUD */}
        <div className="absolute top-4 left-4 z-10 bg-slate-950/85 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-xs max-w-xs space-y-2.5 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
              Selected Structure
            </span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                selectedLandmark.isGravitationallyBound
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
              }`}
            >
              {selectedLandmark.isGravitationallyBound
                ? "Gravitationally Bound"
                : "NOT Bound (Will Expand)"}
            </span>
          </div>

          <div>
            <h4 className="text-base font-extrabold text-white">{selectedLandmark.name}</h4>
            <span className="text-[11px] text-cyan-300 font-medium block">
              {selectedLandmark.categoryLabel}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
            <div>
              <span className="text-slate-400 block text-[10px]">Diameter:</span>
              <span className="font-mono text-white font-semibold">
                {selectedLandmark.diameterLy}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Galaxy Count:</span>
              <span className="font-mono text-amber-300 font-semibold">
                {selectedLandmark.galaxyCount}
              </span>
            </div>
          </div>

          <div className="pt-1.5 border-t border-white/10">
            <span className="text-[10px] text-slate-400 block">Total System Mass:</span>
            <span className="font-mono text-purple-300 font-semibold">
              {selectedLandmark.totalMassSolar}
            </span>
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed pt-1">
            {selectedLandmark.boundStatusExplanation}
          </p>
        </div>

        {/* Top-Right: Quick Landmark Jump Pills */}
        <div className="absolute top-4 right-4 z-10 bg-slate-950/85 backdrop-blur-md border border-white/10 rounded-2xl p-3 text-xs max-w-xs hidden sm:block shadow-xl space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Jump to Cosmic Anchor
          </span>
          <div className="flex flex-col gap-1">
            {COSMIC_LANDMARKS.slice(0, 5).map((l) => (
              <button
                key={l.id}
                onClick={() => {
                  setSelectedLandmarkId(l.id);
                  if (l.id === "milky_way") setZoomStage("milkyway");
                  else if (l.id === "local_group") setZoomStage("localgroup");
                  else if (l.id === "virgo_cluster" || l.id === "coma_cluster")
                    setZoomStage("clusters");
                  else if (l.id === "laniakea") setZoomStage("laniakea");
                  onInteract?.();
                }}
                className={`text-left px-2.5 py-1 rounded-lg text-[11px] transition-colors flex items-center justify-between ${
                  selectedLandmarkId === l.id
                    ? "bg-indigo-600 text-white font-bold"
                    : "text-slate-300 hover:bg-white/5"
                }`}
              >
                <span>{l.name}</span>
                <span className="text-[10px] opacity-60">→</span>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Banner: Scientific Notice & Instructions */}
        <div className="absolute bottom-3 inset-x-3 sm:inset-x-6 z-10 flex flex-wrap items-center justify-between gap-2 bg-slate-950/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 text-[11px]">
          <div className="flex items-center gap-2 text-slate-300">
            <Info className="size-3.5 text-indigo-400 shrink-0" />
            <span>
              SDSS & Millennium Simulation inspired • 3D Point-Cloud rendering with non-linear halo
              clustering
            </span>
          </div>
          <span className="text-slate-400 font-mono">
            Click landmarks • Orbit camera • Zoom freely
          </span>
        </div>
      </div>

      {/* Interactive Controls & Layer Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Toggle Dark Matter */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-white block">Dark Matter Halo</span>
            <span className="text-[10px] text-slate-400 block">Purple non-baryonic skeleton</span>
          </div>
          <Button
            size="sm"
            variant={showDarkMatter ? "default" : "outline"}
            onClick={() => setShowDarkMatter(!showDarkMatter)}
            className={`text-xs ${
              showDarkMatter
                ? "bg-purple-600 hover:bg-purple-500 text-white"
                : "border-white/10 text-slate-400"
            }`}
          >
            {showDarkMatter ? <Eye className="size-3 mr-1" /> : <EyeOff className="size-3 mr-1" />}
            {showDarkMatter ? "Shown" : "Hidden"}
          </Button>
        </div>

        {/* Toggle Filaments */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-white block">Filament Bridges</span>
            <span className="text-[10px] text-slate-400 block">Intergalactic WHIM highways</span>
          </div>
          <Button
            size="sm"
            variant={showFilaments ? "default" : "outline"}
            onClick={() => setShowFilaments(!showFilaments)}
            className={`text-xs ${
              showFilaments
                ? "bg-cyan-600 hover:bg-cyan-500 text-white"
                : "border-white/10 text-slate-400"
            }`}
          >
            <Layers className="size-3 mr-1" />
            {showFilaments ? "Active" : "Off"}
          </Button>
        </div>

        {/* Toggle Bound Status */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-white block">Bound vs Non-Bound</span>
            <span className="text-[10px] text-slate-400 block">
              Virialized clusters vs Laniakea
            </span>
          </div>
          <Button
            size="sm"
            variant={showBoundStatus ? "default" : "outline"}
            onClick={() => setShowBoundStatus(!showBoundStatus)}
            className={`text-xs ${
              showBoundStatus
                ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                : "border-white/10 text-slate-400"
            }`}
          >
            <ShieldCheck className="size-3 mr-1" />
            {showBoundStatus ? "Active" : "Off"}
          </Button>
        </div>

        {/* Reset View */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-white block">Reset Perspective</span>
            <span className="text-[10px] text-slate-400 block">Return to Cluster view</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setZoomStage("clusters");
              setSelectedLandmarkId("local_group");
              setFormationEpoch(1.0);
            }}
            className="text-xs border-white/10 hover:bg-white/5"
          >
            <RotateCcw className="size-3 mr-1" />
            <span>Reset</span>
          </Button>
        </div>
      </div>

      {/* 13.8 Billion Year Gravitational Formation Timeline */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900/80 via-indigo-950/30 to-slate-900/80 border border-indigo-500/20 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-indigo-400" />
              <h5 className="text-sm font-bold text-white">
                Gravitational Structure-Formation Timeline
              </h5>
            </div>
            <p className="text-xs text-indigo-300 font-mono mt-0.5">
              Current Epoch: {getEpochLabel(formationEpoch)}
            </p>
          </div>

          <Button
            size="sm"
            onClick={() => setIsPlayingTimeline(!isPlayingTimeline)}
            className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
          >
            {isPlayingTimeline ? (
              <Pause className="size-3 mr-1" />
            ) : (
              <Play className="size-3 mr-1" />
            )}
            <span>{isPlayingTimeline ? "Pause Evolution" : "Play Evolution"}</span>
          </Button>
        </div>

        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={formationEpoch}
          onChange={(e) => setFormationEpoch(Number(e.target.value))}
          className="w-full accent-indigo-500 cursor-pointer"
        />

        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
          <span>Big Bang (z ≈ 1100)</span>
          <span>Cosmic Dawn (z ≈ 20)</span>
          <span>First Groups (z ≈ 6)</span>
          <span>Clusters Form (z ≈ 1)</span>
          <span className="text-indigo-300 font-bold">Today (z = 0)</span>
        </div>
      </div>

      {/* Gravitational Bound Nuance Banner */}
      <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-start gap-3 text-xs leading-relaxed text-emerald-200">
        <ShieldCheck className="size-5 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-emerald-300 block mb-0.5">
            Crucial Cosmological Law: Clusters Are Bound; Superclusters Are Not!
          </span>
          <span>
            A galaxy cluster (like Virgo or Coma) is a{" "}
            <strong>gravitationally bound and virialized</strong> system: its galaxies orbit inside
            a shared potential well and will stay together forever. In contrast, named structures
            like <strong>Laniakea or the Sloan Great Wall are NOT gravitationally bound</strong>. At
            distances beyond ~50 million light-years, the accelerating expansion of space driven by
            Dark Energy will eventually pull Laniakea&apos;s member clusters apart in the distant
            future.
          </span>
        </div>
      </div>
    </div>
  );
}
