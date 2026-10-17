// @ts-nocheck
import React, { useRef, useState, useMemo, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import {
  HOST_STAR_PRESETS,
  CONFIRMED_SYSTEMS,
  type HostStarPreset,
} from "@/lib/academy/lessons/module-12-exoplanets";
import {
  Sliders,
  Play,
  Pause,
  RotateCcw,
  Eye,
  Globe2,
  Sparkles,
  Info,
  Activity,
  Compass,
  Layers,
  Thermometer,
  Orbit,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// -------------------------------------------------------------
// 3D Scene Components
// -------------------------------------------------------------

interface StarMeshProps {
  colorHex: string;
  radiusRsol: number;
}

function StarMesh({ colorHex, radiusRsol }: StarMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  // Scaled radius for 3D view (clamped so tiny M-dwarfs or giant stars don't break scene)
  const visualRadius = Math.max(0.6, Math.min(2.5, radiusRsol * 1.2));

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2;
    }
    if (glowRef.current) {
      glowRef.current.rotation.z -= delta * 0.1;
    }
  });

  return (
    <group>
      {/* Photosphere core */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[visualRadius, 32, 32]} />
        <meshBasicMaterial color={colorHex} />
      </mesh>

      {/* Corona / Glow halo */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[visualRadius * 1.25, 24, 24]} />
        <meshBasicMaterial
          color={colorHex}
          transparent
          opacity={0.25}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Outer faint shimmer */}
      <mesh>
        <sphereGeometry args={[visualRadius * 1.6, 20, 20]} />
        <meshBasicMaterial
          color={colorHex}
          transparent
          opacity={0.08}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <pointLight color={colorHex} intensity={2.5} distance={50} decay={1.5} />
    </group>
  );
}

// Habitable Zone Disc (translucent green annulus)
function HabitableZoneRing({
  innerAU,
  outerAU,
  auScale,
}: {
  innerAU: number;
  outerAU: number;
  auScale: number;
}) {
  const innerR = Math.max(0.8, innerAU * auScale);
  const outerR = Math.max(innerR + 0.5, outerAU * auScale);

  const ringGeo = useMemo(() => {
    return new THREE.RingGeometry(innerR, outerR, 48);
  }, [innerR, outerR]);

  return (
    <mesh geometry={ringGeo} rotation={[-Math.PI / 2, 0, 0]}>
      <meshBasicMaterial
        color="#22c55e"
        transparent
        opacity={0.12}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// Orbit Line
function OrbitLine({ radius, inclinationRad }: { radius: number; inclinationRad: number }) {
  const linePoints = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const segments = 96;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius * Math.sin(inclinationRad);
      const y = Math.sin(theta) * radius * Math.cos(inclinationRad);
      pts.push(new THREE.Vector3(x, y, z));
    }
    return pts;
  }, [radius, inclinationRad]);

  const geometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(linePoints);
  }, [linePoints]);

  return (
    <primitive
      object={
        new THREE.Line(
          geometry,
          new THREE.LineBasicMaterial({ color: "#64748b", transparent: true, opacity: 0.4 }),
        )
      }
    />
  );
}

// Orbiting Planet Mesh
function OrbitingPlanetMesh({
  radiusRearth,
  semiMajorAxisAU,
  inclinationDeg,
  orbitalPeriodDays,
  isPlaying,
  simSpeed,
  auScale,
  onPhaseUpdate,
}: {
  radiusRearth: number;
  semiMajorAxisAU: number;
  inclinationDeg: number;
  orbitalPeriodDays: number;
  isPlaying: boolean;
  simSpeed: number;
  auScale: number;
  onPhaseUpdate: (phase: number) => void;
}) {
  const planetRef = useRef<THREE.Mesh>(null);
  const phaseRef = useRef<number>(0);

  // Scaled planet radius (Earth = 0.12 units, Jupiter ~ 1.3 units)
  const visualRadius = Math.max(0.08, Math.min(0.65, 0.08 * Math.sqrt(radiusRearth)));
  const orbitRadius3D = Math.max(1.8, semiMajorAxisAU * auScale);
  const incRad = (inclinationDeg * Math.PI) / 180;

  useFrame((_, delta) => {
    if (isPlaying) {
      // Period scaling for smooth animation: full lap every ~6 seconds at 1x
      const angularSpeed = ((2 * Math.PI) / Math.max(1, orbitalPeriodDays * 0.1)) * simSpeed;
      phaseRef.current = (phaseRef.current + delta * angularSpeed) % (Math.PI * 2);
      onPhaseUpdate(phaseRef.current);
    }

    if (planetRef.current) {
      const theta = phaseRef.current;
      const x = Math.cos(theta) * orbitRadius3D;
      const z = Math.sin(theta) * orbitRadius3D * Math.sin(incRad);
      const y = Math.sin(theta) * orbitRadius3D * Math.cos(incRad);

      planetRef.current.position.set(x, y, z);
      planetRef.current.rotation.y += delta * 1.5;
    }
  });

  // Choose planet material color based on radius category
  const planetColor = useMemo(() => {
    if (radiusRearth < 1.6) return "#38bdf8"; // Rocky cyan/blue
    if (radiusRearth < 3.5) return "#06b6d4"; // Sub-Neptune aqua
    if (radiusRearth < 8.0) return "#818cf8"; // Neptune indigo
    return "#fb923c"; // Jupiter warm amber
  }, [radiusRearth]);

  return (
    <group>
      <OrbitLine radius={orbitRadius3D} inclinationRad={incRad} />
      <mesh ref={planetRef}>
        <sphereGeometry args={[visualRadius, 24, 24]} />
        <meshStandardMaterial color={planetColor} roughness={0.7} metalness={0.1} />
      </mesh>
    </group>
  );
}

// Observer View Scene (Looking directly down line of sight: Camera at [0, 0, 14])
function ObserverViewScene({
  starColorHex,
  starRadiusRsol,
  planetRadiusRearth,
  semiMajorAxisAU,
  inclinationDeg,
  currentPhase,
}: {
  starColorHex: string;
  starRadiusRsol: number;
  planetRadiusRearth: number;
  semiMajorAxisAU: number;
  inclinationDeg: number;
  currentPhase: number;
}) {
  const planetRef = useRef<THREE.Mesh>(null);

  // Scaled visual parameters
  const starVisRadius = 2.4;
  // Planet size relative to star: (Rp / R*)
  const trueRadiusRatio = (planetRadiusRearth * 0.0091) / Math.max(0.1, starRadiusRsol);
  const planetVisRadius = Math.max(0.08, Math.min(1.8, starVisRadius * trueRadiusRatio));

  // Compute position across line of sight (z is distance to observer, x is horizontal across star disk)
  const incRad = (inclinationDeg * Math.PI) / 180;
  // Orbit radius in observer plane
  const obsOrbitR = 8.0;

  const theta = currentPhase;
  const x = Math.cos(theta) * obsOrbitR;
  const y = Math.sin(theta) * obsOrbitR * Math.cos(incRad);
  const z = Math.sin(theta) * obsOrbitR * Math.sin(incRad);

  // Is planet between star and observer? z > 0
  const isFront = z > 0;

  return (
    <group>
      {/* Host Star Disk (with subtle limb darkening gradient effect) */}
      <mesh position={[0, 0, 0]}>
        <circleGeometry args={[starVisRadius, 64]} />
        <meshBasicMaterial color={starColorHex} />
      </mesh>

      {/* Corona rim */}
      <mesh position={[0, 0, -0.05]}>
        <ringGeometry args={[starVisRadius, starVisRadius * 1.3, 64]} />
        <meshBasicMaterial
          color={starColorHex}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Planet Silhouette (Black transit disc when in front of star) */}
      <mesh ref={planetRef} position={[x, y, isFront ? 0.2 : -0.5]} visible={isFront}>
        <circleGeometry args={[planetVisRadius, 32]} />
        <meshBasicMaterial color="#020617" />
      </mesh>
    </group>
  );
}

// -------------------------------------------------------------
// Main Component
// -------------------------------------------------------------

interface ExoplanetObservatory3DProps {
  onInteraction?: () => void;
}

export function ExoplanetObservatory3D({ onInteraction }: ExoplanetObservatory3DProps) {
  // Preset or custom star
  const [selectedStarPreset, setSelectedStarPreset] = useState<HostStarPreset>(
    HOST_STAR_PRESETS[0],
  );
  const [starMassMsol, setStarMassMsol] = useState<number>(1.0);
  const [starRadiusRsol, setStarRadiusRsol] = useState<number>(1.0);
  const [starTeffK, setStarTeffK] = useState<number>(5778);

  // Planet parameters
  const [planetRadiusEarth, setPlanetRadiusEarth] = useState<number>(1.0);
  const [semiMajorAxisAU, setSemiMajorAxisAU] = useState<number>(1.0);
  const [inclinationDeg, setInclinationDeg] = useState<number>(89.8);

  // View mode
  const [viewMode, setViewMode] = useState<"orrery" | "observer">("orrery");

  // Playback
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1.0);
  const [currentPhase, setCurrentPhase] = useState<number>(0);

  // Quick preset loader
  const handleSelectConfirmedSystem = (systemId: string) => {
    const sys = CONFIRMED_SYSTEMS.find((s) => s.id === systemId);
    if (!sys) return;
    const p = sys.planets[0];
    const host = sys.hostStar;

    setStarMassMsol(host.massMsol);
    setStarRadiusRsol(host.radiusRsol);
    setStarTeffK(host.teffK);

    setPlanetRadiusEarth(p.radiusEarth);
    setSemiMajorAxisAU(p.semiMajorAxisAU);
    setInclinationDeg(p.inclinationDeg);

    // Pick closest star preset color
    const matchedPreset =
      HOST_STAR_PRESETS.find((st) =>
        host.spectralType.startsWith(st.spectralType.substring(0, 1)),
      ) || HOST_STAR_PRESETS[0];
    setSelectedStarPreset(matchedPreset);

    if (onInteraction) onInteraction();
  };

  const handleApplyPresetStar = (preset: HostStarPreset) => {
    setSelectedStarPreset(preset);
    setStarMassMsol(preset.massMsol);
    setStarRadiusRsol(preset.radiusRsol);
    setStarTeffK(preset.teffK);
    if (onInteraction) onInteraction();
  };

  // -------------------------------------------------------------
  // Astrophysical Calculations
  // -------------------------------------------------------------
  const {
    orbitalPeriodDays,
    transitDepthPercent,
    transitDepthPpm,
    impactParameterB,
    willTransit,
    equilibriumTempK,
    equilibriumTempC,
    habitableZoneStatus,
    hzInnerAU,
    hzOuterAU,
    luminosityLsol,
  } = useMemo(() => {
    // Luminosity L approx R^2 * (T/5778)^4
    const Lsol = Math.pow(starRadiusRsol, 2) * Math.pow(starTeffK / 5778, 4);

    // Habitable zone Kopparapu simplified
    const hzIn = 0.95 * Math.sqrt(Lsol);
    const hzOut = 1.67 * Math.sqrt(Lsol);

    // Kepler's Third Law: P^2 = a^3 / M_* (in years)
    const periodYears = Math.sqrt(Math.pow(semiMajorAxisAU, 3) / Math.max(0.01, starMassMsol));
    const periodDays = periodYears * 365.25;

    // Radius ratio Rp / R* (Earth radius = 0.00915 R_sun)
    const rStarInEarthRadii = starRadiusRsol * 109.2;
    const radiusRatio = planetRadiusEarth / Math.max(1, rStarInEarthRadii);
    const transitDepthFrac = Math.pow(radiusRatio, 2);
    const depthPercent = transitDepthFrac * 100;
    const depthPpm = Math.round(depthPercent * 10000);

    // Impact parameter b = (a / R_*) * cos(i)
    // a in solar radii: 1 AU = 215 R_sun
    const aInRsol = (semiMajorAxisAU * 215) / Math.max(0.05, starRadiusRsol);
    const incRad = (inclinationDeg * Math.PI) / 180;
    const b = aInRsol * Math.abs(Math.cos(incRad));
    const transits = b <= 1 + radiusRatio;

    // Equilibrium temperature with Bond albedo A = 0.3
    // Teq = T_* * sqrt(R_* / (2a)) * (1 - A)^0.25
    // a in R_sun: 1 AU = 215 R_sun
    const aInSolarR = semiMajorAxisAU * 215;
    const teqK = Math.round(
      starTeffK * Math.sqrt(starRadiusRsol / (2 * aInSolarR)) * Math.pow(1 - 0.3, 0.25),
    );
    const teqC = Math.round(teqK - 273.15);

    let hzStatus: "too_hot" | "habitable" | "too_cold" = "habitable";
    if (semiMajorAxisAU < hzIn) hzStatus = "too_hot";
    else if (semiMajorAxisAU > hzOut) hzStatus = "too_cold";

    return {
      orbitalPeriodDays: periodDays,
      transitDepthPercent: depthPercent,
      transitDepthPpm: depthPpm,
      impactParameterB: b,
      willTransit: transits,
      equilibriumTempK: teqK,
      equilibriumTempC: teqC,
      habitableZoneStatus: hzStatus,
      hzInnerAU: hzIn,
      hzOuterAU: hzOut,
      luminosityLsol: Lsol,
    };
  }, [starMassMsol, starRadiusRsol, starTeffK, planetRadiusEarth, semiMajorAxisAU, inclinationDeg]);

  // Dynamic AU scale for 3D orrery to ensure visible orbital ring
  const auScale = useMemo(() => {
    if (semiMajorAxisAU < 0.05) return 80;
    if (semiMajorAxisAU < 0.2) return 20;
    if (semiMajorAxisAU < 0.8) return 7;
    return 3.5;
  }, [semiMajorAxisAU]);

  // Current transit normalized flux (0 to 1.0)
  const currentTransitFlux = useMemo(() => {
    if (!willTransit) return 1.0;
    // Transit happens near phase = PI / 2 (when planet passes in front, z > 0)
    // Normalized phase difference from transit center
    let phaseDiff = Math.abs(currentPhase - Math.PI / 2);
    if (phaseDiff > Math.PI) phaseDiff = Math.PI * 2 - phaseDiff;

    // Transit width in radians (approx (R* / a))
    const aInRsol = (semiMajorAxisAU * 215) / Math.max(0.05, starRadiusRsol);
    const transitHalfWidthRad = Math.asin(Math.min(0.9, 1.2 / Math.max(1, aInRsol)));

    if (phaseDiff < transitHalfWidthRad) {
      // Within transit: compute limb darkening dip
      const progress = phaseDiff / transitHalfWidthRad; // 0 at center, 1 at edge
      const dip = (transitDepthPercent / 100) * (1 - 0.2 * Math.pow(progress, 2));
      return Math.max(0.5, 1.0 - dip);
    }
    return 1.0;
  }, [willTransit, currentPhase, semiMajorAxisAU, starRadiusRsol, transitDepthPercent]);

  return (
    <div className="space-y-6">
      {/* Header & Confirmed System Quick-Select Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold mb-2">
              <Globe2 className="w-3.5 h-3.5" />
              Signature Experience
            </div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              3D Exoplanet Discovery Observatory
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Manipulate orbital geometry, host-star energetics, and observer line-of-sight to
              capture real-time transit light curves.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/60">
            <Button
              size="sm"
              variant={viewMode === "orrery" ? "default" : "ghost"}
              onClick={() => setViewMode("orrery")}
              className={`text-xs h-8 ${viewMode === "orrery" ? "bg-cyan-600 hover:bg-cyan-500 text-white" : "text-slate-300"}`}
            >
              <Orbit className="w-3.5 h-3.5 mr-1.5" />
              3D Orrery
            </Button>
            <Button
              size="sm"
              variant={viewMode === "observer" ? "default" : "ghost"}
              onClick={() => setViewMode("observer")}
              className={`text-xs h-8 ${viewMode === "observer" ? "bg-cyan-600 hover:bg-cyan-500 text-white" : "text-slate-300"}`}
            >
              <Eye className="w-3.5 h-3.5 mr-1.5" />
              Observer Sightline
            </Button>
          </div>
        </div>

        {/* Confirmed Real Exoplanet Quick Jump Pills */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Load Confirmed Exoplanet Benchmark:
          </span>
          {CONFIRMED_SYSTEMS.map((sys) => (
            <button
              key={sys.id}
              onClick={() => handleSelectConfirmedSystem(sys.id)}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-cyan-500/50 text-slate-200 transition-all"
            >
              {sys.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Observatory Layout: 3D Canvas + Light Curve & Telemetry Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 3D Canvas Viewport (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="relative aspect-[16/10] sm:aspect-[16/11] w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl">
            {/* View Mode Indicator Badge */}
            <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-700 text-xs font-mono text-cyan-300 flex items-center gap-1.5 backdrop-blur-md">
                {viewMode === "orrery" ? (
                  <>
                    <Orbit className="w-3 h-3 text-cyan-400" />
                    Interactive 3D Orrery (Orbit View)
                  </>
                ) : (
                  <>
                    <Eye className="w-3 h-3 text-emerald-400" />
                    Observer Sightline (Telescope View from Earth)
                  </>
                )}
              </span>

              {willTransit ? (
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-[11px] font-mono text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Transiting Geometry
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-[11px] font-mono text-amber-300 flex items-center gap-1">
                  <XCircle className="w-3 h-3 text-amber-400" />
                  No Transit (Tilted out of Line of Sight)
                </span>
              )}
            </div>

            {/* Playback Controls Overlay (bottom left) */}
            <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-1.5 backdrop-blur-md">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                title={isPlaying ? "Pause Orbit" : "Play Orbit"}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => {
                  setCurrentPhase(0);
                  setIsPlaying(true);
                }}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                title="Reset Orbit Phase"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <div className="h-4 w-[1px] bg-slate-700 mx-1" />
              <span className="text-[11px] text-slate-400 font-mono">Speed:</span>
              {[0.5, 1.0, 2.5].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setSimSpeed(spd)}
                  className={`text-[10px] px-2 py-0.5 rounded ${
                    simSpeed === spd
                      ? "bg-cyan-600 text-white font-bold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            {/* Artistic Impression Disclaimer (bottom right) */}
            <div className="absolute bottom-3 right-3 z-10 max-w-[220px] text-right pointer-events-none">
              <span className="px-2 py-1 rounded bg-slate-950/80 border border-slate-800/80 text-[10px] text-amber-300/80 font-mono block">
                ⚠️ Artistic Scientific Visualization
              </span>
            </div>

            {/* 3D Canvas */}
            <Suspense
              fallback={
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  Loading Observatory...
                </div>
              }
            >
              <Canvas
                camera={{
                  position: viewMode === "orrery" ? [0, 8, 14] : [0, 0, 14],
                  fov: 45,
                }}
              >
                <ambientLight intensity={0.4} />
                <pointLight position={[10, 15, 10]} intensity={1.2} />

                {viewMode === "orrery" ? (
                  <>
                    <StarMesh colorHex={selectedStarPreset.colorHex} radiusRsol={starRadiusRsol} />
                    <HabitableZoneRing innerAU={hzInnerAU} outerAU={hzOuterAU} auScale={auScale} />
                    <OrbitingPlanetMesh
                      radiusRearth={planetRadiusEarth}
                      semiMajorAxisAU={semiMajorAxisAU}
                      inclinationDeg={inclinationDeg}
                      orbitalPeriodDays={orbitalPeriodDays}
                      isPlaying={isPlaying}
                      simSpeed={simSpeed}
                      auScale={auScale}
                      onPhaseUpdate={setCurrentPhase}
                    />
                    <OrbitControls
                      enablePan={true}
                      enableZoom={true}
                      minDistance={4}
                      maxDistance={40}
                    />
                  </>
                ) : (
                  <>
                    <ObserverViewScene
                      starColorHex={selectedStarPreset.colorHex}
                      starRadiusRsol={starRadiusRsol}
                      planetRadiusRearth={planetRadiusEarth}
                      semiMajorAxisAU={semiMajorAxisAU}
                      inclinationDeg={inclinationDeg}
                      currentPhase={currentPhase}
                    />
                    {/* Locked camera for direct line of sight */}
                  </>
                )}
              </Canvas>
            </Suspense>
          </div>

          {/* Real-time Photometric Light Curve Sensor Display */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-semibold text-white">
                  Live Photometric Sensor (Kepler/TESS Detector)
                </h4>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-slate-400">
                  Flux:{" "}
                  <strong className="text-emerald-400">{currentTransitFlux.toFixed(6)}</strong>
                </span>
                <span className="text-slate-400">
                  Depth:{" "}
                  <strong className="text-cyan-300">{transitDepthPercent.toFixed(3)}%</strong> (
                  {transitDepthPpm} ppm)
                </span>
              </div>
            </div>

            {/* SVG Transit Light Curve Plot */}
            <div className="relative h-28 w-full bg-slate-950 rounded-xl border border-slate-800/80 p-2 overflow-hidden flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 500 100" preserveAspectRatio="none">
                {/* Grid lines */}
                <line
                  x1="0"
                  y1="20"
                  x2="500"
                  y2="20"
                  stroke="#334155"
                  strokeDasharray="3 3"
                  strokeWidth="0.8"
                />
                <line
                  x1="0"
                  y1="50"
                  x2="500"
                  y2="50"
                  stroke="#1e293b"
                  strokeDasharray="2 2"
                  strokeWidth="0.5"
                />
                <line
                  x1="0"
                  y1="80"
                  x2="500"
                  y2="80"
                  stroke="#334155"
                  strokeDasharray="3 3"
                  strokeWidth="0.8"
                />
                <line x1="250" y1="0" x2="250" y2="100" stroke="#1e293b" strokeWidth="1" />

                {/* Y-axis labels */}
                <text x="8" y="16" fill="#64748b" fontSize="8" fontFamily="monospace">
                  1.0000 (Baseline)
                </text>
                <text x="8" y="85" fill="#64748b" fontSize="8" fontFamily="monospace">
                  {willTransit ? (1 - transitDepthPercent / 100).toFixed(4) : "No Transit"}
                </text>

                {/* Simulated Transit Light Curve Path */}
                {willTransit ? (
                  <path
                    d={`M 0,20 L 200,20 Q 220,20 225,${20 + Math.min(60, transitDepthPercent * 35)} L 275,${
                      20 + Math.min(60, transitDepthPercent * 35)
                    } Q 280,20 300,20 L 500,20`}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                ) : (
                  <line
                    x1="0"
                    y1="20"
                    x2="500"
                    y2="20"
                    stroke="#64748b"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />
                )}

                {/* Live Tracking Marker */}
                <circle
                  cx={((currentPhase / (Math.PI * 2)) * 500) % 500}
                  cy={20 + (1.0 - currentTransitFlux) * 3500}
                  r="4.5"
                  fill="#38bdf8"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
              </svg>
            </div>

            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
              <span>Ingress</span>
              <span className="font-mono text-cyan-400">Transit Midpoint</span>
              <span>Egress</span>
            </div>
          </div>
        </div>

        {/* Right: Interactive Control Station (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* 1. Host Star Controls */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                1. Host Star Parameters
              </h4>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">
                {selectedStarPreset.spectralType}
              </span>
            </div>

            {/* Quick Star Type Presets */}
            <div className="grid grid-cols-3 gap-2">
              {HOST_STAR_PRESETS.slice(0, 3).map((st) => (
                <button
                  key={st.id}
                  onClick={() => handleApplyPresetStar(st)}
                  className={`text-xs p-2 rounded-xl border text-left transition-all ${
                    selectedStarPreset.id === st.id
                      ? "bg-amber-500/10 border-amber-500/50 text-amber-300"
                      : "bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <div className="font-semibold truncate">{st.name.split(" ")[0]}</div>
                  <div className="text-[10px] text-slate-400">{st.spectralType}</div>
                </button>
              ))}
            </div>

            {/* Sliders for Star Radius & Temperature */}
            <div className="space-y-3 pt-2">
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Stellar Radius (R☉):</span>
                  <span className="font-mono text-amber-300">{starRadiusRsol.toFixed(2)} R☉</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="2.0"
                  step="0.05"
                  value={starRadiusRsol}
                  onChange={(e) => {
                    setStarRadiusRsol(parseFloat(e.target.value));
                    if (onInteraction) onInteraction();
                  }}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Surface Temperature (K):</span>
                  <span className="font-mono text-amber-300">{starTeffK.toLocaleString()} K</span>
                </div>
                <input
                  type="range"
                  min="2500"
                  max="7000"
                  step="100"
                  value={starTeffK}
                  onChange={(e) => {
                    setStarTeffK(parseInt(e.target.value, 10));
                    if (onInteraction) onInteraction();
                  }}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              </div>
            </div>
          </div>

          {/* 2. Exoplanet Orbit & Size Controls */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              2. Planetary Orbit & Physical Dimensions
            </h4>

            {/* Planet Radius Slider */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Planet Radius (R⊕):</span>
                <span className="font-mono text-cyan-300">
                  {planetRadiusEarth.toFixed(2)} R⊕ ({(planetRadiusEarth / 11.2).toFixed(2)} R_Jup)
                </span>
              </div>
              <input
                type="range"
                min="0.4"
                max="16.0"
                step="0.1"
                value={planetRadiusEarth}
                onChange={(e) => {
                  setPlanetRadiusEarth(parseFloat(e.target.value));
                  if (onInteraction) onInteraction();
                }}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>Sub-Earth (0.5x)</span>
                <span>Super-Earth (1.6x)</span>
                <span>Neptune (4.0x)</span>
                <span>Jupiter (11.2x)</span>
              </div>
            </div>

            {/* Semi-Major Axis Slider */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Orbital Distance (Semi-Major Axis a):</span>
                <span className="font-mono text-cyan-300">{semiMajorAxisAU.toFixed(3)} AU</span>
              </div>
              <input
                type="range"
                min="0.02"
                max="2.5"
                step="0.01"
                value={semiMajorAxisAU}
                onChange={(e) => {
                  setSemiMajorAxisAU(parseFloat(e.target.value));
                  if (onInteraction) onInteraction();
                }}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Orbital Inclination Slider (Crucial for transit geometry) */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Orbital Inclination (i):</span>
                <span className="font-mono text-cyan-300">{inclinationDeg.toFixed(1)}°</span>
              </div>
              <input
                type="range"
                min="70"
                max="90"
                step="0.1"
                value={inclinationDeg}
                onChange={(e) => {
                  setInclinationDeg(parseFloat(e.target.value));
                  if (onInteraction) onInteraction();
                }}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>70° (Face-on tilt)</span>
                <span>85° (Grazing)</span>
                <span>90.0° (Direct Edge-on Transit)</span>
              </div>
            </div>
          </div>

          {/* 3. Live Astrophysical Telemetry Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-emerald-400" />
              Calculated Telemetry & Habitability
            </h4>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                <span className="text-slate-400 block text-[10px]">Orbital Period (Year):</span>
                <span className="text-sm font-bold text-white font-mono">
                  {orbitalPeriodDays >= 365
                    ? `${(orbitalPeriodDays / 365.25).toFixed(2)} years`
                    : `${orbitalPeriodDays.toFixed(1)} days`}
                </span>
              </div>

              <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                <span className="text-slate-400 block text-[10px]">Equilibrium Temp:</span>
                <span className="text-sm font-bold text-white font-mono">
                  {equilibriumTempK} K ({equilibriumTempC}°C)
                </span>
              </div>

              <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                <span className="text-slate-400 block text-[10px]">Impact Parameter (b):</span>
                <span className="text-sm font-bold text-white font-mono">
                  {impactParameterB.toFixed(2)}
                  <span className="text-[10px] text-slate-400 ml-1">
                    ({willTransit ? "b ≤ 1" : "b > 1"})
                  </span>
                </span>
              </div>

              <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                <span className="text-slate-400 block text-[10px]">Habitable Zone Status:</span>
                <span
                  className={`text-xs font-bold font-mono ${
                    habitableZoneStatus === "habitable"
                      ? "text-emerald-400"
                      : habitableZoneStatus === "too_hot"
                        ? "text-rose-400"
                        : "text-blue-400"
                  }`}
                >
                  {habitableZoneStatus === "habitable"
                    ? "In Habitable Zone"
                    : habitableZoneStatus === "too_hot"
                      ? "Too Hot (Interior)"
                      : "Too Cold (Frozen)"}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 space-y-1">
              <div className="flex justify-between font-mono">
                <span>HZ Inner (Runaway Greenhouse):</span>
                <span className="text-emerald-400">{hzInnerAU.toFixed(2)} AU</span>
              </div>
              <div className="flex justify-between font-mono">
                <span>HZ Outer (Maximum Greenhouse):</span>
                <span className="text-emerald-400">{hzOuterAU.toFixed(2)} AU</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
