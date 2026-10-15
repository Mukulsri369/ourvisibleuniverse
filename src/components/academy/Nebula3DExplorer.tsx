import React, { useRef, useState, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import {
  NEBULA_BENCHMARKS,
  type NebulaBenchmark,
  type WavelengthMode,
} from "@/lib/academy/lessons/module-11-nebulae";
import {
  Sparkles,
  Eye,
  Layers,
  Sliders,
  RotateCcw,
  Maximize2,
  Info,
  Radio,
  Flame,
  Zap,
  HelpCircle,
  Camera,
  Check,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// -----------------------------------------------------------------
// Procedural Volumetric Gas, Dust & Stars Shaders/Meshes
// -----------------------------------------------------------------

interface NebulaSceneProps {
  benchmark: NebulaBenchmark;
  wavelength: WavelengthMode;
  showGas: boolean;
  showDust: boolean;
  showStars: boolean;
}

// 1. Gas Mesh Layer (Emission / Synchrotron / Planetary)
function GasLayerMesh({
  benchmark,
  wavelength,
}: {
  benchmark: NebulaBenchmark;
  wavelength: WavelengthMode;
}) {
  const meshRef = useRef<THREE.Group>(null);

  // Derive palette color based on wavelength mode
  const { color1, color2, opacity } = useMemo(() => {
    switch (wavelength) {
      case "visible":
        if (benchmark.type === "reflection")
          return { color1: "#38bdf8", color2: "#60a5fa", opacity: 0.65 };
        if (benchmark.type === "planetary")
          return { color1: "#06b6d4", color2: "#ef4444", opacity: 0.7 };
        if (benchmark.type === "supernova_remnant")
          return { color1: "#f97316", color2: "#0284c7", opacity: 0.75 };
        if (benchmark.type === "dark")
          return { color1: "#f43f5e", color2: "#be123c", opacity: 0.5 };
        return { color1: "#ef4444", color2: "#06b6d4", opacity: 0.7 }; // Orion / Eagle H-alpha red + O III teal
      case "hubble_sho":
        return { color1: "#eab308", color2: "#3b82f6", opacity: 0.8 }; // Gold (S II + H-alpha) + Royal Blue (O III)
      case "infrared":
        return { color1: "#f97316", color2: "#a855f7", opacity: 0.45 }; // Warm orange & deep violet
      case "xray":
        return { color1: "#818cf8", color2: "#c084fc", opacity: 0.85 }; // High-energy purple/blue
    }
  }, [wavelength, benchmark.type]);

  // Particle distribution simulating volumetric gaseous clouds
  const gasParticles = useMemo(() => {
    const count = benchmark.type === "globular_cluster" ? 200 : 1800;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const c1 = new THREE.Color(color1);
    const c2 = new THREE.Color(color2);

    for (let i = 0; i < count; i++) {
      let x = 0,
        y = 0,
        z = 0;

      if (benchmark.type === "planetary") {
        // Torus / Ring geometry
        const angle = Math.random() * Math.PI * 2;
        const rRing = 2.0 + (Math.random() - 0.5) * 0.8;
        x = Math.cos(angle) * rRing;
        z = Math.sin(angle) * rRing;
        y = (Math.random() - 0.5) * 0.6;
      } else if (benchmark.id === "eagle") {
        // Pillar geometry (vertical columns)
        const pillarId = Math.floor(Math.random() * 3);
        const pX = (pillarId - 1) * 1.5;
        x = pX + (Math.random() - 0.5) * 0.7;
        y = (Math.random() - 0.3) * 3.5;
        z = (Math.random() - 0.5) * 0.8;
      } else if (benchmark.type === "supernova_remnant") {
        // Filamentous expansion
        const r = 1.0 + Math.random() * 2.2;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.sin(phi) * Math.sin(theta);
        z = r * Math.cos(phi);
      } else {
        // Diffuse volumetric cloud
        const r = 0.5 + Math.random() * 3.0;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.sin(phi) * Math.sin(theta) * 0.7;
        z = r * Math.cos(phi);
      }

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const mix = Math.random();
      const col = c1.clone().lerp(c2, mix);
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }
    return { positions, colors };
  }, [benchmark.id, benchmark.type, color1, color2]);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.03;
    }
  });

  return (
    <group ref={meshRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[gasParticles.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[gasParticles.colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.12}
          vertexColors
          transparent
          opacity={opacity}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

// 2. Interstellar Dust Layer (Silicates, Carbon, Cold Opaque Clumps)
function DustLayerMesh({
  benchmark,
  wavelength,
}: {
  benchmark: NebulaBenchmark;
  wavelength: WavelengthMode;
}) {
  const dustRef = useRef<THREE.Group>(null);

  // In infrared, dust becomes semi-transparent or glowing
  const isInfrared = wavelength === "infrared";
  const dustColor = isInfrared ? "#f97316" : "#0f172a";
  const opacity = isInfrared ? 0.35 : 0.85;

  const dustParticles = useMemo(() => {
    const count = benchmark.id === "horsehead" || benchmark.id === "eagle" ? 1400 : 700;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      if (benchmark.id === "horsehead") {
        // Silhouette shape in center
        const t = Math.random() * Math.PI;
        positions[i * 3] = Math.sin(t) * 0.8 + (Math.random() - 0.5) * 0.4;
        positions[i * 3 + 1] = (t - Math.PI / 2) * 1.2;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
      } else if (benchmark.id === "eagle") {
        // Core dust inside the pillars
        const pillarId = Math.floor(Math.random() * 3);
        const pX = (pillarId - 1) * 1.5;
        positions[i * 3] = pX + (Math.random() - 0.5) * 0.4;
        positions[i * 3 + 1] = (Math.random() - 0.3) * 3.2;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
      } else {
        // Interspersed dust filaments
        const r = 1.0 + Math.random() * 2.2;
        const theta = Math.random() * Math.PI * 2;
        positions[i * 3] = Math.cos(theta) * r + (Math.random() - 0.5) * 0.5;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 1.2;
        positions[i * 3 + 2] = Math.sin(theta) * r;
      }
    }
    return positions;
  }, [benchmark.id]);

  useFrame((_, delta) => {
    if (dustRef.current) {
      dustRef.current.rotation.y += delta * 0.02;
    }
  });

  return (
    <group ref={dustRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dustParticles, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={isInfrared ? 0.09 : 0.16}
          color={dustColor}
          transparent
          opacity={opacity}
          blending={isInfrared ? THREE.AdditiveBlending : THREE.NormalBlending}
        />
      </points>
    </group>
  );
}

// 3. Embedded Stars Layer (Open Cluster, Globular Cluster, Trapezium, Central Core)
function StarsLayerMesh({
  benchmark,
  wavelength,
}: {
  benchmark: NebulaBenchmark;
  wavelength: WavelengthMode;
}) {
  const groupRef = useRef<THREE.Group>(null);

  const starCount = useMemo(() => {
    if (benchmark.type === "globular_cluster") return 2500;
    if (benchmark.type === "open_cluster") return 350;
    if (benchmark.type === "planetary") return 1; // Just central white dwarf
    return 180; // Embedded cluster members in H II regions
  }, [benchmark.type]);

  const starData = useMemo(() => {
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    const isGlobular = benchmark.type === "globular_cluster";
    const isOpen = benchmark.type === "open_cluster";

    // Colors: Globulars have ancient golden/red stars; Open clusters have blue stars!
    const blueStar = new THREE.Color("#60a5fa");
    const goldStar = new THREE.Color("#fbbf24");
    const redGiant = new THREE.Color("#f87171");
    const whiteStar = new THREE.Color("#f8fafc");

    for (let i = 0; i < starCount; i++) {
      let x = 0,
        y = 0,
        z = 0;
      let starColor = whiteStar;

      if (isGlobular) {
        // King-model / Plummer-like spherical concentration
        const u = Math.random();
        const r = 1.8 * Math.pow(u, 2.5); // Core concentration
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.sin(phi) * Math.sin(theta);
        z = r * Math.cos(phi);

        // Ancient Population II: 80% gold/yellow, 15% red giants, 5% rare white
        starColor = Math.random() > 0.2 ? goldStar : redGiant;
      } else if (isOpen) {
        // Loose disk distribution
        const r = 0.5 + Math.random() * 3.0;
        const theta = Math.random() * Math.PI * 2;
        x = Math.cos(theta) * r + (Math.random() - 0.5) * 0.4;
        y = (Math.random() - 0.5) * 0.8;
        z = Math.sin(theta) * r + (Math.random() - 0.5) * 0.4;

        // Young Population I: bright blue B-type stars
        starColor = Math.random() > 0.25 ? blueStar : whiteStar;
      } else if (benchmark.type === "planetary") {
        // Single central white dwarf
        x = 0;
        y = 0;
        z = 0;
        starColor = new THREE.Color("#e0f2fe");
      } else {
        // Embedded cluster
        const r = Math.random() * 2.5;
        const theta = Math.random() * Math.PI * 2;
        x = Math.cos(theta) * r;
        y = (Math.random() - 0.5) * 1.5;
        z = Math.sin(theta) * r;
        starColor = wavelength === "infrared" ? new THREE.Color("#f97316") : blueStar;
      }

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      colors[i * 3] = starColor.r;
      colors[i * 3 + 1] = starColor.g;
      colors[i * 3 + 2] = starColor.b;
    }
    return { positions, colors };
  }, [starCount, benchmark.type, wavelength]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.015;
    }
  });

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[starData.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[starData.colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={benchmark.type === "globular_cluster" ? 0.06 : 0.09}
          vertexColors
          transparent
          opacity={0.9}
        />
      </points>

      {/* Prominent central White Dwarf sphere for planetary nebula */}
      {benchmark.type === "planetary" && (
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.15, 24, 24]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      )}

      {/* Trapezium 4-star tight grouping for Orion */}
      {benchmark.id === "orion" && (
        <group position={[0, 0, 0]}>
          {[
            [-0.1, 0.1, 0],
            [0.12, 0.08, 0],
            [-0.08, -0.12, 0],
            [0.1, -0.09, 0],
          ].map((pos, idx) => (
            <mesh key={idx} position={pos as [number, number, number]}>
              <sphereGeometry args={[0.07, 16, 16]} />
              <meshBasicMaterial color="#93c5fd" />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}

// -----------------------------------------------------------------
// Master Scene Router
// -----------------------------------------------------------------
function MasterNebulaScene({
  benchmark,
  wavelength,
  showGas,
  showDust,
  showStars,
}: NebulaSceneProps) {
  return (
    <group>
      {showGas && <GasLayerMesh benchmark={benchmark} wavelength={wavelength} />}
      {showDust && <DustLayerMesh benchmark={benchmark} wavelength={wavelength} />}
      {showStars && <StarsLayerMesh benchmark={benchmark} wavelength={wavelength} />}
    </group>
  );
}

// -----------------------------------------------------------------
// MAIN COMPONENT: Nebula3DExplorer
// -----------------------------------------------------------------
export function Nebula3DExplorer() {
  const [selectedBenchmarkId, setSelectedBenchmarkId] = useState<string>("orion");
  const [wavelength, setWavelength] = useState<WavelengthMode>("visible");
  const [showGas, setShowGas] = useState<boolean>(true);
  const [showDust, setShowDust] = useState<boolean>(true);
  const [showStars, setShowStars] = useState<boolean>(true);
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(true);

  const activeBenchmark =
    NEBULA_BENCHMARKS.find((b) => b.id === selectedBenchmarkId) || NEBULA_BENCHMARKS[0];

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/90 shadow-2xl flex flex-col">
      {/* 1. Header Toolbar */}
      <div className="px-5 py-4 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-pink-500/20 text-pink-400">
            <Sparkles className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-base font-semibold text-white tracking-wide">
              3D Volumetric Nebula & Cluster Laboratory
            </h3>
            <p className="text-xs text-slate-400">
              Explore layered cosmic gas, dust, and stars across physical wavelengths
            </p>
          </div>
        </div>

        {/* Multi-Wavelength Filter Selector */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
          <span className="text-[10px] text-slate-400 font-mono px-2 uppercase tracking-wider hidden sm:inline">
            Spectrum:
          </span>
          {(
            [
              { id: "visible", label: "Visible (True Color)" },
              { id: "hubble_sho", label: "Hubble SHO Narrowband" },
              { id: "infrared", label: "Infrared (JWST)" },
              { id: "xray", label: "X-Ray (Chandra)" },
            ] as const
          ).map((mode) => (
            <button
              key={mode.id}
              onClick={() => setWavelength(mode.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                wavelength === mode.id
                  ? "bg-pink-500 text-white shadow-md shadow-pink-500/25"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/60"
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Benchmark Preset Selector Strip */}
      <div className="px-5 py-2.5 bg-slate-900/40 border-b border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-thin">
        {NEBULA_BENCHMARKS.map((item) => {
          const isSelected = item.id === selectedBenchmarkId;
          return (
            <button
              key={item.id}
              onClick={() => setSelectedBenchmarkId(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isSelected
                  ? "bg-pink-500/20 text-pink-300 border border-pink-500/50 shadow-sm"
                  : "bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-slate-700/50"
              }`}
            >
              <span>{item.name}</span>
              <span className="text-[10px] text-slate-400 font-mono">
                ({item.typeLabel.split(" ")[0]})
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. 3D Viewport with Orbit & Layer Toggles */}
      <div className="relative w-full h-[400px] sm:h-[480px] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <Canvas
          camera={{ position: [0, 1.0, 5.5], fov: 45 }}
          className="w-full h-full cursor-grab active:cursor-grabbing"
        >
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={1.2} />
          <Suspense fallback={null}>
            <MasterNebulaScene
              benchmark={activeBenchmark}
              wavelength={wavelength}
              showGas={showGas}
              showDust={showDust}
              showStars={showStars}
            />
          </Suspense>
          <OrbitControls
            enablePan={false}
            minDistance={2.0}
            maxDistance={12.0}
            autoRotate={isAutoRotate}
            autoRotateSpeed={0.5}
          />
        </Canvas>

        {/* Top-Left Telemetry Dossier */}
        <div className="absolute top-4 left-4 pointer-events-none max-w-xs sm:max-w-sm">
          <div className="p-3.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-800 text-xs shadow-xl space-y-2 pointer-events-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div>
                <span className="text-[10px] font-mono uppercase text-pink-400 block">
                  {activeBenchmark.catalogName}
                </span>
                <h4 className="font-bold text-white text-sm">{activeBenchmark.name}</h4>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                {activeBenchmark.typeLabel}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400">Distance:</span>
                <p className="font-mono text-cyan-300 font-medium">
                  {activeBenchmark.distanceLightYears.toLocaleString()} ly
                </p>
              </div>
              <div>
                <span className="text-slate-400">Diameter:</span>
                <p className="font-mono text-amber-300 font-medium">
                  {activeBenchmark.sizeLightYears} light-years
                </p>
              </div>
              <div>
                <span className="text-slate-400">Constellation:</span>
                <p className="text-slate-200 font-medium">{activeBenchmark.constellation}</p>
              </div>
              <div>
                <span className="text-slate-400">Illuminator:</span>
                <p
                  className="text-slate-200 font-medium truncate"
                  title={activeBenchmark.primaryIlluminator}
                >
                  {activeBenchmark.primaryIlluminator}
                </p>
              </div>
            </div>

            {/* Wavelength Description Box */}
            <div className="pt-2 border-t border-slate-800 text-[11px]">
              <span className="text-slate-400 block text-[10px] uppercase font-mono text-pink-300">
                Current View ({wavelength.replace("_", " ").toUpperCase()}):
              </span>
              <p className="text-slate-200 mt-0.5 leading-relaxed font-sans">
                {activeBenchmark.wavelengthFeatures[wavelength]}
              </p>
            </div>
          </div>
        </div>

        {/* Top-Right Layer Visibility Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 pointer-events-auto">
          <div className="p-2.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-800 space-y-1.5 shadow-xl">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block pb-1 border-b border-slate-800">
              Constituent Layers:
            </span>

            <button
              onClick={() => setShowGas(!showGas)}
              className={`w-full px-2.5 py-1 rounded text-xs flex items-center justify-between gap-3 transition ${
                showGas
                  ? "bg-pink-500/20 text-pink-300 border border-pink-500/30"
                  : "bg-slate-800 text-slate-500 border border-slate-700/50"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Flame className="w-3 h-3 text-pink-400" /> Ionized Gas
              </span>
              <Check className={`w-3.5 h-3.5 ${showGas ? "opacity-100" : "opacity-0"}`} />
            </button>

            <button
              onClick={() => setShowDust(!showDust)}
              className={`w-full px-2.5 py-1 rounded text-xs flex items-center justify-between gap-3 transition ${
                showDust
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "bg-slate-800 text-slate-500 border border-slate-700/50"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Layers className="w-3 h-3 text-amber-400" /> Interstellar Dust
              </span>
              <Check className={`w-3.5 h-3.5 ${showDust ? "opacity-100" : "opacity-0"}`} />
            </button>

            <button
              onClick={() => setShowStars(!showStars)}
              className={`w-full px-2.5 py-1 rounded text-xs flex items-center justify-between gap-3 transition ${
                showStars
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  : "bg-slate-800 text-slate-500 border border-slate-700/50"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-cyan-400" /> Embedded Stars
              </span>
              <Check className={`w-3.5 h-3.5 ${showStars ? "opacity-100" : "opacity-0"}`} />
            </button>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsAutoRotate(!isAutoRotate)}
            className="bg-slate-900/90 text-slate-300 hover:text-white border-slate-700 text-xs gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {isAutoRotate ? "Pause Orbit" : "Auto Orbit"}
          </Button>
        </div>

        {/* Bottom Notice on False Color / Image Processing */}
        <div className="absolute bottom-4 left-4 right-4 max-w-2xl mx-auto pointer-events-auto">
          <div className="p-3 rounded-xl bg-slate-950/90 backdrop-blur-md border border-amber-500/30 text-xs flex items-start gap-2.5 shadow-2xl">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-slate-300 leading-relaxed">
              <strong className="text-amber-300">Astronomical Imaging Reality:</strong>{" "}
              {activeBenchmark.colorsAndProcessingNotice}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Filter & Spectroscopy Breakdown Footer */}
      <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-400 font-medium">Narrowband Filters Used:</span>
          {activeBenchmark.astronomicalFiltersUsed.map((filter, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded bg-slate-800 text-pink-300 border border-slate-700 font-mono text-[11px]"
            >
              {filter}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2 text-slate-400 text-[11px]">
          <span>Dominant Chemistry:</span>
          <span className="text-white font-medium">
            {activeBenchmark.dominantElements.slice(0, 3).join(", ")}
          </span>
        </div>
      </div>
    </div>
  );
}
