import React, { useRef, useState, useMemo, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { BENCHMARK_STARS, type BenchmarkStar } from "@/lib/academy/lessons/module-09-stars";
import {
  Sparkles,
  Layers,
  Zap,
  Flame,
  Scale,
  Maximize2,
  Info,
  RotateCcw,
  Eye,
  Sliders,
  Check,
  ChevronRight,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface StarMeshProps {
  star: BenchmarkStar;
  position: [number, number, number];
  displayRadius: number;
  rotationSpeed?: number;
}

function ProceduralStar({ star, position, displayRadius, rotationSpeed = 0.5 }: StarMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const outerHaloRef = useRef<THREE.Mesh>(null);

  // Generate procedural granulation texture for the star's photosphere
  const granulationTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Base background
    ctx.fillStyle = star.colorHex;
    ctx.fillRect(0, 0, 512, 512);

    // Create convective granulation pattern
    const isSupergiant = star.category === "supergiant";
    const cellCount = isSupergiant ? 35 : 120; // Supergiants have massive convective cells!

    for (let i = 0; i < cellCount; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const radius = (isSupergiant ? 30 : 12) + Math.random() * (isSupergiant ? 40 : 18);
      const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);

      grad.addColorStop(0, "rgba(255, 255, 255, 0.45)");
      grad.addColorStop(0.6, star.glowHex + "55");
      grad.addColorStop(1, "rgba(0, 0, 0, 0.25)");

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // High frequency micro-granules
    for (let i = 0; i < 400; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      ctx.fillStyle = Math.random() > 0.5 ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.15)";
      ctx.fillRect(x, y, 2 + Math.random() * 3, 2 + Math.random() * 3);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, [star.colorHex, star.glowHex, star.category]);

  // Frame animation for convection and slow axial rotation
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.15 * rotationSpeed;
    }
    if (haloRef.current) {
      haloRef.current.rotation.z -= delta * 0.08;
    }
    if (outerHaloRef.current) {
      outerHaloRef.current.rotation.z += delta * 0.04;
    }
  });

  const baseColor = useMemo(() => new THREE.Color(star.colorHex), [star.colorHex]);
  const glowColor = useMemo(() => new THREE.Color(star.glowHex), [star.glowHex]);

  return (
    <group position={position}>
      {/* 1. Core Photosphere Sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[displayRadius, 64, 64]} />
        <meshStandardMaterial
          map={granulationTexture}
          color={baseColor}
          emissive={baseColor}
          emissiveIntensity={star.category === "white_dwarf" ? 1.6 : 1.1}
          roughness={0.8}
          metalness={0.0}
        />
      </mesh>

      {/* 2. Inner Coronal Atmosphere Glow */}
      <mesh ref={haloRef}>
        <sphereGeometry args={[displayRadius * 1.08, 32, 32]} />
        <meshBasicMaterial
          color={glowColor}
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>

      {/* 3. Outer Diffuse Corona Ray Glow */}
      <mesh ref={outerHaloRef}>
        <sphereGeometry args={[displayRadius * 1.25, 32, 32]} />
        <meshBasicMaterial
          color={glowColor}
          transparent
          opacity={0.18}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>

      {/* 4. Contact shadow disk on museum floor */}
      <mesh position={[0, -displayRadius - 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[displayRadius * 0.2, displayRadius * 1.3, 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.65} />
      </mesh>
    </group>
  );
}

interface MuseumSceneProps {
  starA: BenchmarkStar;
  starB: BenchmarkStar;
  scaleMode: "normalized" | "perceptual" | "true_scale";
}

function MuseumScene({ starA, starB, scaleMode }: MuseumSceneProps) {
  // Calculate relative sizes depending on mode
  const { radiusA, radiusB, sepDistance } = useMemo(() => {
    if (scaleMode === "normalized") {
      return { radiusA: 2.2, radiusB: 2.2, sepDistance: 6.0 };
    }

    if (scaleMode === "perceptual") {
      // Power scale R^0.35 so Betelgeuse (764 R) doesn't completely crush Sirius B (0.0084 R) out of existence
      const scaledA = Math.pow(starA.radiusSolar, 0.35) * 1.8;
      const scaledB = Math.pow(starB.radiusSolar, 0.35) * 1.8;
      // Clamp to ensure visibility
      const clampedA = Math.max(0.25, Math.min(scaledA, 4.2));
      const clampedB = Math.max(0.25, Math.min(scaledB, 4.2));
      const dist = Math.max(6.0, clampedA + clampedB + 2.0);
      return { radiusA: clampedA, radiusB: clampedB, sepDistance: dist };
    }

    // True Scale mode (Linear relative to reference)
    // Scale reference: Sun = 1.0 unit.
    const maxRadius = Math.max(starA.radiusSolar, starB.radiusSolar);
    const minRadius = Math.min(starA.radiusSolar, starB.radiusSolar);
    const ratio = maxRadius / minRadius;

    // If ratio > 50, use capped linear scale so smaller star is still at least a 0.08 unit visible dot
    let rA = 1.0;
    let rB = 1.0;
    if (ratio > 50) {
      if (starA.radiusSolar >= starB.radiusSolar) {
        rA = 3.6;
        rB = Math.max(0.08, (starB.radiusSolar / starA.radiusSolar) * 3.6);
      } else {
        rB = 3.6;
        rA = Math.max(0.08, (starA.radiusSolar / starB.radiusSolar) * 3.6);
      }
    } else {
      rA = Math.max(
        0.2,
        (starA.radiusSolar / Math.max(starA.radiusSolar, starB.radiusSolar)) * 3.0,
      );
      rB = Math.max(
        0.2,
        (starB.radiusSolar / Math.max(starA.radiusSolar, starB.radiusSolar)) * 3.0,
      );
    }

    return { radiusA: rA, radiusB: rB, sepDistance: Math.max(6.5, rA + rB + 2.5) };
  }, [starA, starB, scaleMode]);

  return (
    <>
      <color attach="background" args={["#050814"]} />
      <ambientLight intensity={0.4} />

      {/* Warm key light and cool rim light for high-contrast museum presence */}
      <directionalLight position={[10, 15, 10]} intensity={1.5} />
      <directionalLight position={[-10, -10, -10]} intensity={0.5} color="#597ef7" />

      {/* Museum Pedestal Floor Grid */}
      <gridHelper
        args={[30, 30, "#1d39c4", "#0f172a"]}
        position={[0, -Math.max(radiusA, radiusB) - 0.25, 0]}
      />

      {/* Star A (Left Podium) */}
      <ProceduralStar
        star={starA}
        position={[-sepDistance / 2, 0, 0]}
        displayRadius={radiusA}
        rotationSpeed={0.6}
      />

      {/* Star B (Right Podium) */}
      <ProceduralStar
        star={starB}
        position={[sepDistance / 2, 0, 0]}
        displayRadius={radiusB}
        rotationSpeed={0.4}
      />

      <OrbitControls
        enablePan={false}
        minDistance={3.5}
        maxDistance={28}
        maxPolarAngle={Math.PI / 2 + 0.1}
      />
    </>
  );
}

export function StellarMuseum3D({ onInteracted }: { onInteracted?: () => void }) {
  // Preset stars for quick selection representing all required classes
  const MUSEUM_CLASSES = useMemo(
    () => [
      { id: "sun", label: "The Sun", sub: "G2V Yellow Dwarf", starId: "sun" },
      {
        id: "red_dwarf",
        label: "Proxima Centauri",
        sub: "M5.5V Red Dwarf",
        starId: "proxima_centauri",
      },
      { id: "blue_white", label: "Sirius A", sub: "A1V Blue-White MS", starId: "sirius_a" },
      { id: "hot_blue", label: "Spica", sub: "B1V Blue MS", starId: "spica" },
      { id: "red_giant", label: "Arcturus", sub: "K1.5III Red Giant", starId: "arcturus" },
      { id: "supergiant", label: "Betelgeuse", sub: "M1-2Ia Red Supergiant", starId: "betelgeuse" },
      { id: "white_dwarf", label: "Sirius B", sub: "DA2 White Dwarf", starId: "sirius_b" },
    ],
    [],
  );

  const [starAId, setStarAId] = useState<string>("sun");
  const [starBId, setStarBId] = useState<string>("betelgeuse");
  const [scaleMode, setScaleMode] = useState<"normalized" | "perceptual" | "true_scale">(
    "perceptual",
  );
  const [showRatiosOnly, setShowRatiosOnly] = useState(false);

  const starA = useMemo(
    () => BENCHMARK_STARS.find((s) => s.id === starAId) || BENCHMARK_STARS[0],
    [starAId],
  );
  const starB = useMemo(
    () => BENCHMARK_STARS.find((s) => s.id === starBId) || BENCHMARK_STARS[6],
    [starBId],
  );

  const handleSelectStarA = (id: string) => {
    setStarAId(id);
    onInteracted?.();
  };

  const handleSelectStarB = (id: string) => {
    setStarBId(id);
    onInteracted?.();
  };

  // Comparative calculations
  const radiusRatio = starA.radiusSolar / starB.radiusSolar;
  const tempDiff = starA.temperatureK - starB.temperatureK;
  const lumRatio = starA.luminositySolar / starB.luminositySolar;
  const massRatio = starA.massSolar / starB.massSolar;

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/90 backdrop-blur-xl overflow-hidden shadow-2xl space-y-6">
      {/* 1. Header Bar with Mode Toggles */}
      <div className="p-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30">
              <Flame className="size-4" />
            </span>
            <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider">
              Signature 3D Experience
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
            Interactive Stellar Comparison Museum
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Select any two stars to inspect 3D models, compare real physical sizes, and analyze
            fundamental astrophysical ratios.
          </p>
        </div>

        {/* View Mode Toggle Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="p-1 rounded-xl bg-slate-950 border border-white/10 flex items-center text-xs">
            <button
              onClick={() => {
                setScaleMode("perceptual");
                onInteracted?.();
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                scaleMode === "perceptual"
                  ? "bg-red-500 text-white font-bold shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Scaled Size
            </button>
            <button
              onClick={() => {
                setScaleMode("true_scale");
                onInteracted?.();
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                scaleMode === "true_scale"
                  ? "bg-red-500 text-white font-bold shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              True Contrast
            </button>
            <button
              onClick={() => {
                setScaleMode("normalized");
                onInteracted?.();
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                scaleMode === "normalized"
                  ? "bg-red-500 text-white font-bold shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Inspect Detail
            </button>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowRatiosOnly(!showRatiosOnly)}
            className="border-white/10 text-slate-300 hover:text-white text-xs"
          >
            <Scale className="size-3.5 mr-1 text-amber-400" />
            {showRatiosOnly ? "Show Full Specs" : "Ratio Callouts"}
          </Button>
        </div>
      </div>

      {/* 2. Dual Star Selectors */}
      <div className="px-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Star A Picker */}
        <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                Star A (Left Museum Podium)
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-cyan-300">{starA.spectralType}</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {MUSEUM_CLASSES.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelectStarA(item.starId)}
                className={`px-2.5 py-1.5 rounded-xl text-xs whitespace-nowrap transition flex items-center gap-1.5 ${
                  starAId === item.starId
                    ? "bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/25"
                    : "bg-slate-900 border border-white/10 text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Star B Picker */}
        <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-rose-400 animate-pulse" />
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                Star B (Right Museum Podium)
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-rose-300">{starB.spectralType}</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {MUSEUM_CLASSES.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelectStarB(item.starId)}
                className={`px-2.5 py-1.5 rounded-xl text-xs whitespace-nowrap transition flex items-center gap-1.5 ${
                  starBId === item.starId
                    ? "bg-rose-500 text-white font-bold shadow-md shadow-rose-500/25"
                    : "bg-slate-900 border border-white/10 text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. 3D WebGL Canvas Viewport */}
      <div className="relative mx-6 h-[440px] sm:h-[480px] rounded-2xl overflow-hidden border border-white/10 bg-black">
        <Suspense
          fallback={
            <div className="absolute inset-0 flex items-center justify-center text-xs font-mono text-cyan-400 bg-slate-950">
              INITIALIZING STELLAR MUSEUM SHADERS…
            </div>
          }
        >
          <Canvas
            camera={{ position: [0, 1.5, 12], fov: 42 }}
            gl={{ antialias: true, powerPreference: "high-performance" }}
          >
            <MuseumScene starA={starA} starB={starB} scaleMode={scaleMode} />
          </Canvas>
        </Suspense>

        {/* 3D Viewport HUD Labels */}
        <div className="absolute top-4 left-4 pointer-events-none">
          <div className="rounded-xl border border-cyan-500/40 bg-slate-950/85 p-3 backdrop-blur-md max-w-xs space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full" style={{ backgroundColor: starA.colorHex }} />
              <span className="text-xs font-bold text-cyan-300">{starA.name}</span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium">{starA.categoryLabel}</p>
            <div className="text-[10px] text-slate-400 font-mono">
              T: {starA.temperatureK.toLocaleString()} K • R: {starA.radiusSolar} R☉
            </div>
          </div>
        </div>

        <div className="absolute top-4 right-4 pointer-events-none">
          <div className="rounded-xl border border-rose-500/40 bg-slate-950/85 p-3 backdrop-blur-md max-w-xs text-right space-y-1">
            <div className="flex items-center justify-end gap-1.5">
              <span className="text-xs font-bold text-rose-300">{starB.name}</span>
              <span className="size-2 rounded-full" style={{ backgroundColor: starB.colorHex }} />
            </div>
            <p className="text-[11px] text-slate-300 font-medium">{starB.categoryLabel}</p>
            <div className="text-[10px] text-slate-400 font-mono">
              T: {starB.temperatureK.toLocaleString()} K • R: {starB.radiusSolar} R☉
            </div>
          </div>
        </div>

        {/* Bottom controls tip */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none">
          <span className="px-3 py-1 rounded-full bg-black/60 border border-white/10 text-[11px] text-slate-400 backdrop-blur-md">
            Click & drag to rotate • Scroll to zoom in/out • Observe convective boiling & corona
          </span>
        </div>
      </div>

      {/* 4. Comparative Quantitative Ratios Banner */}
      <div className="px-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Radius Ratio */}
        <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3.5 text-center">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
            Radius Ratio (A / B)
          </span>
          <span className="text-lg font-mono font-bold text-cyan-400">
            {radiusRatio >= 1
              ? `${radiusRatio >= 100 ? radiusRatio.toFixed(0) : radiusRatio.toFixed(2)} ×`
              : `1 / ${(1 / radiusRatio).toFixed(1)}`}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            {radiusRatio > 1
              ? `${starA.name} is ${radiusRatio.toFixed(1)}× wider`
              : `${starB.name} is ${(1 / radiusRatio).toFixed(1)}× wider`}
          </span>
        </div>

        {/* Temperature Delta */}
        <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3.5 text-center">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
            Temperature Delta
          </span>
          <span className="text-lg font-mono font-bold text-amber-400">
            {tempDiff >= 0 ? `+${tempDiff.toLocaleString()} K` : `${tempDiff.toLocaleString()} K`}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            {tempDiff > 0 ? `${starA.name} is hotter` : `${starB.name} is hotter`}
          </span>
        </div>

        {/* Luminosity Ratio */}
        <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3.5 text-center">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
            Power Luminosity (A / B)
          </span>
          <span className="text-lg font-mono font-bold text-violet-400">
            {lumRatio >= 1
              ? lumRatio > 10000
                ? `${lumRatio.toExponential(1)} ×`
                : `${lumRatio.toFixed(1)} ×`
              : `1 / ${(1 / lumRatio).toFixed(1)}`}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            {lumRatio > 1
              ? `${starA.name} radiates more power`
              : `${starB.name} radiates more power`}
          </span>
        </div>

        {/* Mass Ratio */}
        <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3.5 text-center">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
            Mass Ratio (A / B)
          </span>
          <span className="text-lg font-mono font-bold text-emerald-400">
            {massRatio >= 1 ? `${massRatio.toFixed(1)} ×` : `1 / ${(1 / massRatio).toFixed(1)}`}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            {massRatio > 1 ? `${starA.name} is heavier` : `${starB.name} is heavier`}
          </span>
        </div>
      </div>

      {/* 5. In-Depth Comparative Specs Table */}
      <div className="px-6 pb-6">
        <div className="rounded-2xl border border-white/10 bg-slate-950/80 overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Info className="size-4 text-cyan-400" />
              Side-by-Side Astrophysical Specification
            </h4>
            <span className="text-[11px] text-slate-400">
              Calibrated with ESA Gaia DR3 & IAU Standards
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 border-b border-white/10 font-mono">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Parameter</th>
                  <th className="py-2.5 px-4 font-semibold text-cyan-400">{starA.name}</th>
                  <th className="py-2.5 px-4 font-semibold text-rose-400">{starB.name}</th>
                  <th className="py-2.5 px-4 font-semibold text-slate-400">
                    Scientific Significance
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200">
                <tr>
                  <td className="py-2.5 px-4 font-medium text-slate-400">Spectral Class & Type</td>
                  <td className="py-2.5 px-4 font-mono font-bold text-cyan-300">
                    {starA.spectralType}
                  </td>
                  <td className="py-2.5 px-4 font-mono font-bold text-rose-300">
                    {starB.spectralType}
                  </td>
                  <td className="py-2.5 px-4 text-slate-400">
                    Morgan-Keenan temperature & luminosity class
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-medium text-slate-400">
                    Surface Temperature (T)
                  </td>
                  <td className="py-2.5 px-4 font-mono font-bold">
                    {starA.temperatureK.toLocaleString()} K
                  </td>
                  <td className="py-2.5 px-4 font-mono font-bold">
                    {starB.temperatureK.toLocaleString()} K
                  </td>
                  <td className="py-2.5 px-4 text-slate-400">
                    Determines color and peak emission via Wien's Law
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-medium text-slate-400">Radius (R☉)</td>
                  <td className="py-2.5 px-4 font-mono font-bold">
                    {starA.radiusSolar} R☉ ({(starA.radiusSolar * 696340).toLocaleString()} km)
                  </td>
                  <td className="py-2.5 px-4 font-mono font-bold">
                    {starB.radiusSolar} R☉ ({(starB.radiusSolar * 696340).toLocaleString()} km)
                  </td>
                  <td className="py-2.5 px-4 text-slate-400">Surface area scales as R²</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-medium text-slate-400">
                    Bolometric Luminosity (L)
                  </td>
                  <td className="py-2.5 px-4 font-mono font-bold">
                    {starA.luminositySolar.toLocaleString()} L☉
                  </td>
                  <td className="py-2.5 px-4 font-mono font-bold">
                    {starB.luminositySolar.toLocaleString()} L☉
                  </td>
                  <td className="py-2.5 px-4 text-slate-400">
                    Total radiant energy output (Stefan-Boltzmann: L ∝ R² T⁴)
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-medium text-slate-400">Mass (M☉)</td>
                  <td className="py-2.5 px-4 font-mono font-bold">{starA.massSolar} M☉</td>
                  <td className="py-2.5 px-4 font-mono font-bold">{starB.massSolar} M☉</td>
                  <td className="py-2.5 px-4 text-slate-400">
                    Governs fusion rate and lifetime (L ∝ M^3.5)
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-medium text-slate-400">HR Diagram Region</td>
                  <td className="py-2.5 px-4 font-medium text-cyan-300">{starA.hrRegion}</td>
                  <td className="py-2.5 px-4 font-medium text-rose-300">{starB.hrRegion}</td>
                  <td className="py-2.5 px-4 text-slate-400">
                    Evolutionary stage and internal energy source
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-medium text-slate-400">Astrophysical Summary</td>
                  <td className="py-2.5 px-4 text-slate-300 text-[11px] leading-relaxed">
                    {starA.description}
                  </td>
                  <td className="py-2.5 px-4 text-slate-300 text-[11px] leading-relaxed">
                    {starB.description}
                  </td>
                  <td className="py-2.5 px-4 text-slate-400 text-[11px]">
                    Observational summary & life cycle stage
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
