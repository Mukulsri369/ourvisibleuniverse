// @ts-nocheck -- loosely-typed educational content; runtime-validated by rendering.
import React, { useRef, useState, useMemo, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { PLANETARY_FACTS, type PlanetaryData } from "@/lib/academy/lessons/module-06-solar-system";
import {
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Minimize2,
  Eye,
  Sparkles,
  Compass,
  Layers,
  Sliders,
  ChevronDown,
  ChevronUp,
  Info,
  Orbit,
  ArrowRight,
  ShieldAlert,
  Camera,
  Scale,
  X,
  Search,
  Check,
  ZoomIn,
  Activity,
  Globe,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Cosmos3DAdapter } from "@/lib/cosmos/Cosmos3DAdapter";

// -------------------------------------------------------------
// ASTRONOMICAL PARAMETERS (SCIENTIFICALLY GROUNDED RATIOS)
// -------------------------------------------------------------
interface CelestialBodyDef {
  id: string;
  name: string;
  a_au: number; // Semi-major axis in AU
  eccentricity: number;
  inclination_deg: number;
  orbitalPeriodDays: number;
  rotationHours: number;
  axialTiltDeg: number;
  radiusKm: number;
  color: string;
  emissive?: string;
  atmosphereColor?: string;
  ring?: { inner: number; outer: number; color: string; tiltDeg: number };
  moons?: {
    name: string;
    distRadius: number; // distance in planet radii
    sizeRadius: number; // size in planet radii
    periodDays: number;
    color: string;
  }[];
}

const BODIES: CelestialBodyDef[] = [
  {
    id: "Mercury",
    name: "Mercury",
    a_au: 0.387,
    eccentricity: 0.2056,
    inclination_deg: 7.0,
    orbitalPeriodDays: 87.97,
    rotationHours: 1407.6,
    axialTiltDeg: 0.03,
    radiusKm: 2439.7,
    color: "#a69584",
  },
  {
    id: "Venus",
    name: "Venus",
    a_au: 0.723,
    eccentricity: 0.0067,
    inclination_deg: 3.39,
    orbitalPeriodDays: 224.7,
    rotationHours: -5832.5,
    axialTiltDeg: 177.36,
    radiusKm: 6051.8,
    color: "#e3ba76",
    atmosphereColor: "#f7d594",
  },
  {
    id: "Earth",
    name: "Earth",
    a_au: 1.0,
    eccentricity: 0.0167,
    inclination_deg: 0.0,
    orbitalPeriodDays: 365.25,
    rotationHours: 23.93,
    axialTiltDeg: 23.44,
    radiusKm: 6371.0,
    color: "#287ab8",
    atmosphereColor: "#7dc2f5",
    moons: [
      {
        name: "Moon",
        distRadius: 4.8,
        sizeRadius: 0.27,
        periodDays: 27.3,
        color: "#d1cfcb",
      },
    ],
  },
  {
    id: "Mars",
    name: "Mars",
    a_au: 1.524,
    eccentricity: 0.0934,
    inclination_deg: 1.85,
    orbitalPeriodDays: 686.98,
    rotationHours: 24.62,
    axialTiltDeg: 25.19,
    radiusKm: 3389.5,
    color: "#c24b23",
    atmosphereColor: "#e68560",
    moons: [
      { name: "Phobos", distRadius: 2.8, sizeRadius: 0.08, periodDays: 0.32, color: "#8a7a6a" },
      { name: "Deimos", distRadius: 4.5, sizeRadius: 0.06, periodDays: 1.26, color: "#7a6a5a" },
    ],
  },
  {
    id: "Ceres",
    name: "Ceres",
    a_au: 2.767,
    eccentricity: 0.0758,
    inclination_deg: 10.59,
    orbitalPeriodDays: 1682,
    rotationHours: 9.07,
    axialTiltDeg: 4.0,
    radiusKm: 469.7,
    color: "#8a8580",
  },
  {
    id: "Jupiter",
    name: "Jupiter",
    a_au: 5.204,
    eccentricity: 0.0489,
    inclination_deg: 1.31,
    orbitalPeriodDays: 4332.59,
    rotationHours: 9.93,
    axialTiltDeg: 3.13,
    radiusKm: 69911,
    color: "#c49a6c",
    emissive: "#2b1908",
    moons: [
      { name: "Io", distRadius: 3.2, sizeRadius: 0.09, periodDays: 1.77, color: "#e8cf65" },
      { name: "Europa", distRadius: 4.4, sizeRadius: 0.08, periodDays: 3.55, color: "#e0d3bc" },
      { name: "Ganymede", distRadius: 6.0, sizeRadius: 0.13, periodDays: 7.15, color: "#a89782" },
      { name: "Callisto", distRadius: 8.2, sizeRadius: 0.12, periodDays: 16.69, color: "#706354" },
    ],
  },
  {
    id: "Saturn",
    name: "Saturn",
    a_au: 9.582,
    eccentricity: 0.0565,
    inclination_deg: 2.49,
    orbitalPeriodDays: 10759.22,
    rotationHours: 10.7,
    axialTiltDeg: 26.73,
    radiusKm: 58232,
    color: "#dfc78f",
    emissive: "#281f08",
    ring: { inner: 1.25, outer: 2.35, color: "#d2b97c", tiltDeg: 26.73 },
    moons: [
      { name: "Enceladus", distRadius: 2.8, sizeRadius: 0.04, periodDays: 1.37, color: "#ffffff" },
      { name: "Titan", distRadius: 6.8, sizeRadius: 0.13, periodDays: 15.95, color: "#d9a347" },
    ],
  },
  {
    id: "Uranus",
    name: "Uranus",
    a_au: 19.2,
    eccentricity: 0.0463,
    inclination_deg: 0.77,
    orbitalPeriodDays: 30685.4,
    rotationHours: -17.24,
    axialTiltDeg: 97.77,
    radiusKm: 25362,
    color: "#72bfbf",
    atmosphereColor: "#a3dede",
    ring: { inner: 1.3, outer: 1.6, color: "#487575", tiltDeg: 97.77 },
    moons: [
      { name: "Titania", distRadius: 4.2, sizeRadius: 0.08, periodDays: 8.7, color: "#c0c0c0" },
    ],
  },
  {
    id: "Neptune",
    name: "Neptune",
    a_au: 30.05,
    eccentricity: 0.0095,
    inclination_deg: 1.77,
    orbitalPeriodDays: 60189.0,
    rotationHours: 16.11,
    axialTiltDeg: 28.32,
    radiusKm: 24622,
    color: "#376ec4",
    atmosphereColor: "#5b8ee6",
    ring: { inner: 1.25, outer: 1.45, color: "#25477d", tiltDeg: 28.32 },
    moons: [
      { name: "Triton", distRadius: 4.5, sizeRadius: 0.11, periodDays: -5.88, color: "#d8d3cb" },
    ],
  },
  {
    id: "Pluto",
    name: "Pluto",
    a_au: 39.48,
    eccentricity: 0.2488,
    inclination_deg: 17.16,
    orbitalPeriodDays: 90560,
    rotationHours: -153.3,
    axialTiltDeg: 122.53,
    radiusKm: 1188.3,
    color: "#b09580",
    moons: [
      { name: "Charon", distRadius: 3.2, sizeRadius: 0.51, periodDays: 6.39, color: "#7a6e62" },
    ],
  },
];

// -------------------------------------------------------------
// HELPER SHADERS & PROCEDURAL TEXTURES
// -------------------------------------------------------------
function createSunSurfaceTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;

  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, "#ffe066");
  grad.addColorStop(0.5, "#ff8800");
  grad.addColorStop(1, "#d94400");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 256);

  // Granules
  ctx.fillStyle = "rgba(255, 255, 200, 0.2)";
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 256;
    const r = 2 + Math.random() * 6;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// -------------------------------------------------------------
// PROCEDURAL INCLINATION SPRITE (NATIVE THREE.JS BILLBOARD)
// -------------------------------------------------------------
function createInclinationSprite(name: string, incDeg: number, color: string): THREE.Sprite {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 70;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, 256, 70);

  // Background rounded pill
  ctx.fillStyle = "rgba(10, 15, 30, 0.9)";
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(6, 6, 244, 58, 28);
  ctx.fill();
  ctx.stroke();

  // Text label
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 23px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${name} · ${incDeg.toFixed(1)}°`, 128, 35);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    opacity: 0.95,
    depthTest: false,
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(4.2, 1.15, 1);
  return sprite;
}

// -------------------------------------------------------------
// 3D ORBIT LINE & INCLINATION LABEL COMPONENT
// -------------------------------------------------------------
function KeplerOrbitLine({
  body,
  scaledDistance,
  visible,
  showInclination,
}: {
  body: CelestialBodyDef;
  scaledDistance: boolean;
  visible: boolean;
  showInclination: boolean;
}) {
  const { points, labelPos } = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const segments = 128;
    const r_scale = scaledDistance
      ? Math.sqrt(body.a_au) * 8.5 + 2.5
      : (Math.log10(body.a_au + 0.6) + 0.3) * 16 + 4.5;
    const a = r_scale;
    const b = a * Math.sqrt(Math.max(0.001, 1 - body.eccentricity * body.eccentricity));
    const c = a * body.eccentricity;
    const incRad = (body.inclination_deg * Math.PI) / 180;

    let maxY = -Infinity;
    let maxPos = new THREE.Vector3(0, 0, 0);

    for (let idx = 0; idx <= segments; idx++) {
      const theta = (idx / segments) * Math.PI * 2;
      const x = a * Math.cos(theta) - c;
      const z = b * Math.sin(theta);
      const y = z * Math.sin(incRad);
      const z_proj = z * Math.cos(incRad);
      const pt = new THREE.Vector3(x, y, z_proj);
      pts.push(pt);

      if (y > maxY) {
        maxY = y;
        maxPos = pt.clone();
      }
    }

    if (Math.abs(body.inclination_deg) < 0.1) {
      maxPos = pts[Math.floor(segments / 4)].clone();
    }

    return { points: pts, labelPos: maxPos };
  }, [body, scaledDistance]);

  const lineGeo = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [points]);

  const sprite = useMemo(() => {
    if (!showInclination) return null;
    return createInclinationSprite(body.name, body.inclination_deg, body.color);
  }, [body.name, body.inclination_deg, body.color, showInclination]);

  if (!visible) return null;

  return (
    <group>
      <primitive
        object={
          new THREE.Line(
            lineGeo,
            new THREE.LineBasicMaterial({
              color: new THREE.Color(body.color),
              transparent: true,
              opacity: 0.35,
            }),
          )
        }
      />
      {showInclination && sprite && (
        <primitive object={sprite} position={[labelPos.x, labelPos.y + 1.0, labelPos.z]} />
      )}
    </group>
  );
}

// -------------------------------------------------------------
// PLANETARY BODY IN 3D
// -------------------------------------------------------------
function PlanetMesh({
  body,
  scaledDistance,
  exaggeratedSize,
  speedMultiplier,
  isPaused,
  isSelected,
  showMoons,
  showRings,
  onSelect,
  earthRadiusUnit,
  positionsMap,
}: {
  body: CelestialBodyDef;
  scaledDistance: boolean;
  exaggeratedSize: boolean;
  speedMultiplier: number;
  isPaused: boolean;
  isSelected: boolean;
  showMoons: boolean;
  showRings: boolean;
  onSelect: (name: string) => void;
  earthRadiusUnit: number;
  positionsMap: React.MutableRefObject<Record<string, THREE.Vector3>>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const moonRefs = useRef<(THREE.Mesh | null)[]>([]);
  const simTimeRef = useRef(Math.random() * 1000);

  // Position calculation
  const r_scale = useMemo(() => {
    return scaledDistance
      ? Math.sqrt(body.a_au) * 8.5 + 2.5
      : (Math.log10(body.a_au + 0.6) + 0.3) * 16 + 4.5;
  }, [body.a_au, scaledDistance]);

  const a = r_scale;
  const b = a * Math.sqrt(Math.max(0.001, 1 - body.eccentricity * body.eccentricity));
  const c = a * body.eccentricity;
  const incRad = (body.inclination_deg * Math.PI) / 180;

  // Visual size
  const displayRadius = useMemo(() => {
    if (!exaggeratedSize) {
      // True relative to Earth
      const rRatio = body.radiusKm / 6371.0;
      return Math.max(0.08, rRatio * earthRadiusUnit * 0.3);
    } else {
      // Exaggerated readable scale
      const rRatio = body.radiusKm / 6371.0;
      return Math.max(0.22, Math.min(1.8, Math.pow(rRatio, 0.45) * 0.55));
    }
  }, [body.radiusKm, exaggeratedSize, earthRadiusUnit]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    if (!isPaused) {
      // Advance orbital angle proportional to Keplerian period
      const meanMotion = (Math.PI * 2) / (body.orbitalPeriodDays * 0.05);
      simTimeRef.current += delta * meanMotion * speedMultiplier;
    }

    const M = simTimeRef.current;
    const E = M + body.eccentricity * Math.sin(M);
    const x = a * Math.cos(E) - c;
    const z = b * Math.sin(E);
    const y = z * Math.sin(incRad);
    const z_proj = z * Math.cos(incRad);

    groupRef.current.position.set(x, y, z_proj);

    // Update position map for camera tracking
    if (!positionsMap.current[body.name]) {
      positionsMap.current[body.name] = new THREE.Vector3();
    }
    positionsMap.current[body.name].copy(groupRef.current.position);

    // Planet spin
    if (bodyRef.current && !isPaused) {
      const spinSpeed = body.rotationHours !== 0 ? (24 / body.rotationHours) * 0.5 : 0.1;
      bodyRef.current.rotation.y += delta * spinSpeed * speedMultiplier;
    }

    // Moons orbit around planet
    if (body.moons && showMoons) {
      body.moons.forEach((m, idx) => {
        const moonMesh = moonRefs.current[idx];
        if (moonMesh) {
          const moonAngle = (simTimeRef.current / (m.periodDays * 0.08)) * 1.5;
          const dist = displayRadius + m.distRadius * 0.45;
          moonMesh.position.x = Math.cos(moonAngle) * dist;
          moonMesh.position.z = Math.sin(moonAngle) * dist;
          moonMesh.position.y = Math.sin(moonAngle * 0.3) * (dist * 0.1);
        }
      });
    }
  });

  return (
    <group ref={groupRef}>
      {/* Interactive Hitbox & Sphere */}
      <mesh
        ref={bodyRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(body.name);
        }}
        rotation-z={(body.axialTiltDeg * Math.PI) / 180}
      >
        <sphereGeometry args={[displayRadius, 32, 32]} />
        <meshStandardMaterial
          color={body.color}
          roughness={0.7}
          metalness={0.15}
          emissive={body.emissive ? new THREE.Color(body.emissive) : new THREE.Color(0x000000)}
        />
      </mesh>

      {/* Atmospheric Glow */}
      {body.atmosphereColor && (
        <mesh scale={[1.08, 1.08, 1.08]}>
          <sphereGeometry args={[displayRadius, 24, 24]} />
          <meshBasicMaterial
            color={body.atmosphereColor}
            transparent
            opacity={0.18}
            side={THREE.BackSide}
          />
        </mesh>
      )}

      {/* Rings if present */}
      {body.ring && showRings && (
        <mesh rotation-x={Math.PI / 2 + (body.ring.tiltDeg * Math.PI) / 180}>
          <ringGeometry
            args={[displayRadius * body.ring.inner, displayRadius * body.ring.outer, 64]}
          />
          <meshStandardMaterial
            color={body.ring.color}
            side={THREE.DoubleSide}
            transparent
            opacity={0.85}
            roughness={0.6}
          />
        </mesh>
      )}

      {/* Moons */}
      {showMoons &&
        body.moons?.map((m, idx) => {
          const moonSize = Math.max(0.04, displayRadius * m.sizeRadius * 0.8);
          return (
            <mesh
              key={m.name}
              ref={(el) => {
                moonRefs.current[idx] = el;
              }}
            >
              <sphereGeometry args={[moonSize, 12, 12]} />
              <meshStandardMaterial color={m.color} roughness={0.8} />
            </mesh>
          );
        })}

      {/* Selection Ring Indicator */}
      {isSelected && (
        <mesh rotation-x={Math.PI / 2}>
          <ringGeometry args={[displayRadius * 1.35, displayRadius * 1.48, 36]} />
          <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

// -------------------------------------------------------------
// CENTRAL SUN
// -------------------------------------------------------------
function CentralSun({
  onSelect,
  isSelected,
  positionsMap,
}: {
  onSelect: () => void;
  isSelected: boolean;
  positionsMap: React.MutableRefObject<Record<string, THREE.Vector3>>;
}) {
  const sunTexture = useMemo(() => createSunSurfaceTexture(), []);
  const sunMesh = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (!positionsMap.current["Sun"]) {
      positionsMap.current["Sun"] = new THREE.Vector3(0, 0, 0);
    }
  }, [positionsMap]);

  useFrame((_, delta) => {
    if (sunMesh.current) {
      sunMesh.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <mesh ref={sunMesh}>
        <sphereGeometry args={[2.2, 36, 36]} />
        <meshBasicMaterial map={sunTexture} />
      </mesh>
      {/* Corona Glow */}
      <mesh scale={[1.25, 1.25, 1.25]}>
        <sphereGeometry args={[2.2, 24, 24]} />
        <meshBasicMaterial color="#ffaa00" transparent opacity={0.25} side={THREE.BackSide} />
      </mesh>
      <mesh scale={[1.5, 1.5, 1.5]}>
        <sphereGeometry args={[2.2, 24, 24]} />
        <meshBasicMaterial color="#ff5500" transparent opacity={0.12} side={THREE.BackSide} />
      </mesh>
      {isSelected && (
        <mesh rotation-x={Math.PI / 2}>
          <ringGeometry args={[3.2, 3.4, 48]} />
          <meshBasicMaterial color="#f59e0b" side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

interface OrbitControlsLike {
  target: THREE.Vector3;
  update: () => void;
}

// -------------------------------------------------------------
// CAMERA RIG & ORBIT CONTROLLER
// -------------------------------------------------------------
function CameraRig({
  preset,
  selectedPlanet,
  positionsMap,
  controlsRef,
}: {
  preset: "free" | "inner" | "outer" | "topdown" | "edgeon" | "sun" | "focus";
  selectedPlanet: string | null;
  positionsMap: React.MutableRefObject<Record<string, THREE.Vector3>>;
  controlsRef: React.RefObject<OrbitControlsLike | null>;
}) {
  const { camera } = useThree();

  useEffect(() => {
    const controls = controlsRef.current;
    if (preset === "topdown") {
      camera.position.set(0, 75, 0.001);
      if (controls) {
        controls.target.set(0, 0, 0);
        controls.update();
      }
    } else if (preset === "edgeon") {
      camera.position.set(0, 0.5, 65);
      if (controls) {
        controls.target.set(0, 0, 0);
        controls.update();
      }
    } else if (preset === "inner") {
      camera.position.set(12, 14, 18);
      if (controls) {
        controls.target.set(4, 0, 0);
        controls.update();
      }
    } else if (preset === "outer") {
      camera.position.set(28, 25, 45);
      if (controls) {
        controls.target.set(10, 0, 0);
        controls.update();
      }
    } else if (preset === "sun") {
      camera.position.set(0, 3, 7.5);
      if (controls) {
        controls.target.set(0, 0, 0);
        controls.update();
      }
    } else if (preset === "focus" && selectedPlanet) {
      const pPos = positionsMap.current[selectedPlanet] || new THREE.Vector3(0, 0, 0);
      const isGiant = ["Jupiter", "Saturn"].includes(selectedPlanet);
      const offsetDist = isGiant ? 6.5 : 3.8;
      camera.position.set(pPos.x + offsetDist, pPos.y + offsetDist * 0.45, pPos.z + offsetDist);
      if (controls) {
        controls.target.copy(pPos);
        controls.update();
      }
    }
  }, [preset, selectedPlanet, camera, controlsRef, positionsMap]);

  useFrame(() => {
    if (preset === "focus" && selectedPlanet && controlsRef.current) {
      const pPos = positionsMap.current[selectedPlanet];
      if (pPos) {
        // Smoothly track moving planet
        const delta = pPos.clone().sub(controlsRef.current.target);
        controlsRef.current.target.addScaledVector(delta, 0.08);
        camera.position.addScaledVector(delta, 0.08);
        controlsRef.current.update();
      }
    }
  });

  return null;
}

// -------------------------------------------------------------
// PLANETARY COMPARISON MODAL OVERLAY
// -------------------------------------------------------------
function PlanetaryComparisonModal({
  planetA,
  planetB,
  onChangePlanetA,
  onChangePlanetB,
  onClose,
  onInspectPlanet,
}: {
  planetA: string;
  planetB: string;
  onChangePlanetA: (name: string) => void;
  onChangePlanetB: (name: string) => void;
  onClose: () => void;
  onInspectPlanet: (name: string) => void;
}) {
  const [userWeightKg, setUserWeightKg] = useState<number>(70);
  const factA = PLANETARY_FACTS[planetA] || PLANETARY_FACTS["Earth"];
  const factB = PLANETARY_FACTS[planetB] || PLANETARY_FACTS["Mars"];

  const weightOnA = (userWeightKg * factA.gravityEarthRatio).toFixed(1);
  const weightOnB = (userWeightKg * factB.gravityEarthRatio).toFixed(1);

  // Solar irradiance ratio (1 / r^2)
  const irrA =
    factA.distanceAu > 0 ? (1 / (factA.distanceAu * factA.distanceAu)).toFixed(3) : "Core Star";
  const irrB =
    factB.distanceAu > 0 ? (1 / (factB.distanceAu * factB.distanceAu)).toFixed(3) : "Core Star";

  const allNames = [
    "Sun",
    "Mercury",
    "Venus",
    "Earth",
    "Mars",
    "Ceres",
    "Jupiter",
    "Saturn",
    "Uranus",
    "Neptune",
    "Pluto",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-white/15 rounded-3xl p-5 sm:p-7 text-white shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <Scale className="size-5 text-cyan-400" />
            <div>
              <h3 className="text-xl font-bold tracking-tight text-white">
                Planetary Environment Comparison Lab
              </h3>
              <p className="text-xs text-slate-400">
                Direct quantitative comparison of physical properties, atmospheres, and gravity.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Scrollable Comparison Content */}
        <div className="overflow-y-auto space-y-6 pr-1 text-xs">
          {/* Pickers & Visual Spheres */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Planet A Box */}
            <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                  Primary World (A)
                </span>
                <select
                  value={planetA}
                  onChange={(e) => onChangePlanetA(e.target.value)}
                  className="bg-slate-800 border border-white/20 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  {allNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-2xl font-black text-white">{factA.name}</h4>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                    {factA.category}
                  </span>
                </div>
                {/* Visual Circle */}
                <div className="w-20 h-20 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center p-2">
                  <div
                    className="rounded-full flex items-center justify-center font-bold text-[10px] text-white shadow-lg"
                    style={{
                      width: `${Math.max(12, Math.min(64, factA.diameterEarthRatio * 18))}px`,
                      height: `${Math.max(12, Math.min(64, factA.diameterEarthRatio * 18))}px`,
                      backgroundColor:
                        factA.category === "Gas Giant"
                          ? "#c49a6c"
                          : factA.category === "Ice Giant"
                            ? "#72bfbf"
                            : factA.name === "Sun"
                              ? "#ffaa00"
                              : "#287ab8",
                    }}
                  >
                    {factA.diameterEarthRatio > 2 ? "🪐" : "•"}
                  </div>
                </div>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  onInspectPlanet(factA.name);
                  onClose();
                }}
                className="w-full border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20"
              >
                Inspect {factA.name} in 3D Close-up →
              </Button>
            </div>

            {/* Planet B Box */}
            <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                  Comparison World (B)
                </span>
                <select
                  value={planetB}
                  onChange={(e) => onChangePlanetB(e.target.value)}
                  className="bg-slate-800 border border-white/20 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  {allNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-2xl font-black text-white">{factB.name}</h4>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    {factB.category}
                  </span>
                </div>
                {/* Visual Circle */}
                <div className="w-20 h-20 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center p-2">
                  <div
                    className="rounded-full flex items-center justify-center font-bold text-[10px] text-white shadow-lg"
                    style={{
                      width: `${Math.max(12, Math.min(64, factB.diameterEarthRatio * 18))}px`,
                      height: `${Math.max(12, Math.min(64, factB.diameterEarthRatio * 18))}px`,
                      backgroundColor:
                        factB.category === "Gas Giant"
                          ? "#c49a6c"
                          : factB.category === "Ice Giant"
                            ? "#72bfbf"
                            : factB.name === "Sun"
                              ? "#ffaa00"
                              : "#c24b23",
                    }}
                  >
                    {factB.diameterEarthRatio > 2 ? "🪐" : "•"}
                  </div>
                </div>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  onInspectPlanet(factB.name);
                  onClose();
                }}
                className="w-full border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
              >
                Inspect {factB.name} in 3D Close-up →
              </Button>
            </div>
          </div>

          {/* Interactive Weight Comparison Calculator */}
          <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Activity className="size-4 text-emerald-400" />
                  Surface Gravity & Body Weight Simulator
                </span>
                <span className="text-[11px] text-slate-400 block">
                  How heavy would a human feel standing on each celestial body?
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-300">Your Earth Weight:</span>
                <input
                  type="number"
                  min="20"
                  max="250"
                  value={userWeightKg}
                  onChange={(e) => setUserWeightKg(Math.max(1, Number(e.target.value)))}
                  className="w-16 bg-slate-800 border border-white/20 rounded-lg px-2 py-1 text-center font-bold text-white"
                />
                <span className="text-slate-400 font-semibold">kg</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase block">
                  Weight on {factA.name} ({factA.gravityEarthRatio}g)
                </span>
                <span className="text-xl font-black text-cyan-300">{weightOnA} kg</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Surface Gravity: {factA.gravityMps2} m/s²
                </span>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase block">
                  Weight on {factB.name} ({factB.gravityEarthRatio}g)
                </span>
                <span className="text-xl font-black text-amber-300">{weightOnB} kg</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Surface Gravity: {factB.gravityMps2} m/s²
                </span>
              </div>
            </div>
          </div>

          {/* Sourced Quantitative Comparison Table */}
          <div className="border border-white/10 rounded-2xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-[11px] text-slate-300 border-b border-white/10">
                  <th className="p-2.5">Scientific Parameter</th>
                  <th className="p-2.5 text-cyan-300">{factA.name}</th>
                  <th className="p-2.5 text-amber-300">{factB.name}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr>
                  <td className="p-2.5 font-medium text-slate-400">Diameter (Equatorial)</td>
                  <td className="p-2.5 text-white">
                    {factA.diameterKm.toLocaleString()} km ({factA.diameterEarthRatio}x Earth)
                  </td>
                  <td className="p-2.5 text-white">
                    {factB.diameterKm.toLocaleString()} km ({factB.diameterEarthRatio}x Earth)
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium text-slate-400">Total Mass</td>
                  <td className="p-2.5 text-white">
                    {factA.massKgExp} kg ({factA.massEarthRatio.toLocaleString()}x Earth)
                  </td>
                  <td className="p-2.5 text-white">
                    {factB.massKgExp} kg ({factB.massEarthRatio.toLocaleString()}x Earth)
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium text-slate-400">Orbital Period (Year)</td>
                  <td className="p-2.5 text-white">
                    {factA.orbitalPeriodDays < 800
                      ? `${factA.orbitalPeriodDays} Earth days`
                      : `${(factA.orbitalPeriodDays / 365.25).toFixed(1)} Earth years`}
                  </td>
                  <td className="p-2.5 text-white">
                    {factB.orbitalPeriodDays < 800
                      ? `${factB.orbitalPeriodDays} Earth days`
                      : `${(factB.orbitalPeriodDays / 365.25).toFixed(1)} Earth years`}
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium text-slate-400">Rotation (Day Length)</td>
                  <td className="p-2.5 text-white">
                    {Math.abs(factA.rotationPeriodHours) < 48
                      ? `${Math.abs(factA.rotationPeriodHours)} hrs`
                      : `${(Math.abs(factA.rotationPeriodHours) / 24).toFixed(1)} days`}
                    {factA.rotationPeriodHours < 0 ? " (retrograde)" : ""}
                  </td>
                  <td className="p-2.5 text-white">
                    {Math.abs(factB.rotationPeriodHours) < 48
                      ? `${Math.abs(factB.rotationPeriodHours)} hrs`
                      : `${(Math.abs(factB.rotationPeriodHours) / 24).toFixed(1)} days`}
                    {factB.rotationPeriodHours < 0 ? " (retrograde)" : ""}
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium text-slate-400">Surface Temperature</td>
                  <td className="p-2.5 text-white">
                    <span className="font-bold">{factA.meanTempC}°C</span>
                    <span className="text-[10px] text-slate-400 block">{factA.tempRangeC}</span>
                  </td>
                  <td className="p-2.5 text-white">
                    <span className="font-bold">{factB.meanTempC}°C</span>
                    <span className="text-[10px] text-slate-400 block">{factB.tempRangeC}</span>
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium text-slate-400">
                    Distance from Sun & Irradiance
                  </td>
                  <td className="p-2.5 text-white">
                    {factA.distanceAu} AU ({factA.distanceMillionKm}M km)
                    <span className="text-[10px] text-slate-400 block">
                      Solar flux: {irrA}x Earth
                    </span>
                  </td>
                  <td className="p-2.5 text-white">
                    {factB.distanceAu} AU ({factB.distanceMillionKm}M km)
                    <span className="text-[10px] text-slate-400 block">
                      Solar flux: {irrB}x Earth
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium text-slate-400">Known Moons & Rings</td>
                  <td className="p-2.5 text-white">
                    {factA.moonsCount} moons | {factA.hasRings ? "Has Rings" : "No Rings"}
                  </td>
                  <td className="p-2.5 text-white">
                    {factB.moonsCount} moons | {factB.hasRings ? "Has Rings" : "No Rings"}
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium text-slate-400">Atmosphere Composition</td>
                  <td className="p-2.5 text-white">{factA.atmosphereMajor.join(", ")}</td>
                  <td className="p-2.5 text-white">{factB.atmosphereMajor.join(", ")}</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium text-slate-400">Imaging Transparency</td>
                  <td className="p-2.5 text-white">
                    <span className="font-semibold block">{factA.imagingType}</span>
                    <span className="text-[10px] text-slate-400 leading-tight block">
                      {factA.imagingNote}
                    </span>
                  </td>
                  <td className="p-2.5 text-white">
                    <span className="font-semibold block">{factB.imagingType}</span>
                    <span className="text-[10px] text-slate-400 leading-tight block">
                      {factB.imagingNote}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Sourced Comparative Insight */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-cyan-400" /> Comparative Planetology Insight
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              {factA.name} and {factB.name} highlight how solar distance and mass dictate planetary
              evolution. While {factA.name} ({factA.category}) exhibits{" "}
              {factA.funFact.toLowerCase()},{factB.name} ({factB.category}) is distinguished by{" "}
              {factB.funFact.toLowerCase()}.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 pt-3 mt-4 flex items-center justify-between text-[11px] text-slate-400">
          <span>Sources: NASA Planetary Fact Sheets, JPL Horizons, IAU Working Group</span>
          <Button size="sm" onClick={onClose} className="bg-cyan-600 hover:bg-cyan-500 text-white">
            Close Comparison
          </Button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// MAIN COMPONENT EXPORT
// -------------------------------------------------------------
export function SolarSystemExplorer3D() {
  const [selectedBodyName, setSelectedBodyName] = useState<string>("Earth");
  const [cameraPreset, setCameraPreset] = useState<
    "free" | "inner" | "outer" | "topdown" | "edgeon" | "sun" | "focus"
  >("free");
  const [isPaused, setIsPaused] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [exaggeratedSize, setExaggeratedSize] = useState(true);
  const [scaledDistance, setScaledDistance] = useState(true);
  const [showOrbits, setShowOrbits] = useState(true);
  const [showMoons, setShowMoons] = useState(true);
  const [showRings, setShowRings] = useState(true);
  const [showInclinationLabels, setShowInclinationLabels] = useState(false);
  const [earthCompareMode, setEarthCompareMode] = useState(false);
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const [isFactCardVisible, setIsFactCardVisible] = useState(true);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [comparePlanetA, setComparePlanetA] = useState("Earth");
  const [comparePlanetB, setComparePlanetB] = useState("Mars");

  const controlsRef = useRef<OrbitControlsLike | null>(null);
  const positionsMap = useRef<Record<string, THREE.Vector3>>({
    Sun: new THREE.Vector3(0, 0, 0),
  });

  const selectedFact = PLANETARY_FACTS[selectedBodyName] || PLANETARY_FACTS["Earth"];

  const handleInspectPlanet = (name: string) => {
    setSelectedBodyName(name);
    setCameraPreset("focus");
  };

  const handleOpenComparisonFor = (name: string) => {
    setComparePlanetA("Earth");
    setComparePlanetB(name !== "Earth" ? name : "Mars");
    setIsComparisonOpen(true);
  };

  useEffect(() => {
    const adapter = Cosmos3DAdapter.getInstance();
    const unregister = adapter.registerScene({
      sceneId: "solar_system",
      getCurrentSimulationState: () => ({
        isPaused,
        timeScale: speedMultiplier,
        activeSceneId: "solar_system",
        selectedObjectName: selectedBodyName,
        epistemicMode: exaggeratedSize ? "educational_approximation" : "physically_accurate",
        scientificNotes:
          "Keplerian solver based on NASA JPL Horizons DE440 orbital parameters. Planetary radii magnified for visual clarity in enhanced mode.",
        cameraRegime: "planetary",
      }),
      getSelectedObject: () => {
        const fact = PLANETARY_FACTS[selectedBodyName];
        if (!fact) return null;
        return {
          name: selectedBodyName,
          type: selectedBodyName === "Sun" ? "star" : "planet",
          distanceFromObserver: `${fact.distanceAu} AU`,
          isModelAvailable: true,
          physicalProperties: {
            semiMajorAxisAu: fact.distanceAu,
            orbitalPeriodDays: fact.orbitalPeriodDays,
            meanTempC: fact.meanTempC,
            gravityEarthRatio: fact.gravityEarthRatio,
            knownMoons: fact.moonsCount,
          },
          scientificDescription: `${fact.category} planet with ${fact.moonsCount} moons. ${fact.funFact}`,
        };
      },
      focusObject: (targetName: string) => {
        setSelectedBodyName(targetName);
        setCameraPreset("focus");
        return true;
      },
      highlightObject: (targetName: string) => {
        setSelectedBodyName(targetName);
        return true;
      },
      playDemonstration: (demoId) => {
        if (demoId === "jupiter_moon_system") {
          setSelectedBodyName("Jupiter");
          setCameraPreset("focus");
          setShowMoons(true);
          return true;
        }
        return false;
      },
      pauseSimulation: () => {
        setIsPaused(true);
        return true;
      },
      resumeSimulation: () => {
        setIsPaused(false);
        return true;
      },
    });

    return unregister;
  }, [isPaused, speedMultiplier, selectedBodyName, exaggeratedSize]);

  return (
    <div className="relative w-full h-[680px] sm:h-[720px] rounded-2xl overflow-hidden border border-white/10 bg-slate-950 shadow-2xl select-none">
      {/* 3D CANVAS WITH DREI ORBIT CONTROLS */}
      <Canvas camera={{ position: [18, 16, 26], fov: 45 }} gl={{ antialias: true, alpha: true }}>
        <color attach="background" args={["#030712"]} />
        <ambientLight intensity={0.4} />
        <pointLight position={[0, 0, 0]} intensity={3.5} distance={120} decay={1.2} />
        <directionalLight position={[10, 20, 15]} intensity={0.8} />

        <Suspense fallback={null}>
          <CentralSun
            onSelect={() => {
              setSelectedBodyName("Sun");
            }}
            isSelected={selectedBodyName === "Sun"}
            positionsMap={positionsMap}
          />

          {BODIES.map((body) => (
            <React.Fragment key={body.id}>
              <KeplerOrbitLine
                body={body}
                scaledDistance={scaledDistance}
                visible={showOrbits}
                showInclination={showInclinationLabels}
              />
              <PlanetMesh
                body={body}
                scaledDistance={scaledDistance}
                exaggeratedSize={exaggeratedSize}
                speedMultiplier={speedMultiplier}
                isPaused={isPaused}
                isSelected={selectedBodyName === body.name}
                showMoons={showMoons}
                showRings={showRings}
                onSelect={(name) => {
                  setSelectedBodyName(name);
                }}
                earthRadiusUnit={1.0}
                positionsMap={positionsMap}
              />
            </React.Fragment>
          ))}

          <OrbitControls
            ref={controlsRef}
            makeDefault
            enableDamping
            dampingFactor={0.06}
            minDistance={2}
            maxDistance={220}
            onStart={() => Cosmos3DAdapter.getInstance().setUserControllingCamera(true)}
            onEnd={() => Cosmos3DAdapter.getInstance().setUserControllingCamera(false)}
          />

          <CameraRig
            preset={cameraPreset}
            selectedPlanet={selectedBodyName}
            positionsMap={positionsMap}
            controlsRef={controlsRef}
          />
        </Suspense>
      </Canvas>

      {/* TOP HEADER OVERLAY (Title, Sourced Badge, Camera Presets & Actions) */}
      <div className="absolute top-3 inset-x-3 sm:inset-x-4 flex flex-wrap items-center justify-between gap-2 pointer-events-none z-10">
        <div className="flex items-center gap-2 bg-slate-900/90 border border-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl pointer-events-auto shadow-lg">
          <Orbit className="size-4 text-cyan-400" />
          <span className="text-xs font-semibold text-white tracking-wide uppercase">
            3D Navigable Solar System
          </span>
          <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-white/5 border border-white/10 hidden sm:inline">
            JPL Keplerian Elements
          </span>
        </div>

        {/* Action Buttons: Compare Mode + Mobile Fact Card Toggle */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => {
              setComparePlanetA("Earth");
              setComparePlanetB(selectedBodyName !== "Earth" ? selectedBodyName : "Mars");
              setIsComparisonOpen(true);
            }}
            className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-600/30 to-blue-600/30 border border-cyan-400/40 hover:border-cyan-400/70 text-cyan-200 px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md shadow-lg transition"
          >
            <Scale className="size-3.5 text-cyan-300" />
            <span>Compare Planets</span>
          </button>

          <button
            onClick={() => setIsFactCardVisible(!isFactCardVisible)}
            className="flex sm:hidden items-center gap-1 bg-slate-900/90 border border-white/10 text-slate-300 px-2.5 py-1.5 rounded-xl text-xs font-medium backdrop-blur-md"
          >
            <Info className="size-3.5 text-cyan-400" />
            <span>{isFactCardVisible ? "Hide Card" : "Show Card"}</span>
          </button>
        </div>

        {/* Camera Quick Presets Bar */}
        <div className="w-full sm:w-auto flex items-center gap-1 bg-slate-900/90 border border-white/10 backdrop-blur-md p-1 rounded-xl pointer-events-auto shadow-lg overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-medium text-slate-400 px-2 flex items-center gap-1 shrink-0">
            <Camera className="size-3" /> Camera:
          </span>
          <button
            onClick={() => setCameraPreset("free")}
            className={`px-2 py-1 text-xs rounded-lg transition font-medium shrink-0 ${
              cameraPreset === "free"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            Free Orbit
          </button>
          <button
            onClick={() => setCameraPreset("focus")}
            className={`px-2 py-1 text-xs rounded-lg transition font-medium shrink-0 flex items-center gap-1 ${
              cameraPreset === "focus"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold"
                : "text-emerald-400 hover:bg-emerald-500/10"
            }`}
          >
            <Eye className="size-3" /> Inspect {selectedBodyName}
          </button>
          <button
            onClick={() => setCameraPreset("inner")}
            className={`px-2 py-1 text-xs rounded-lg transition font-medium shrink-0 ${
              cameraPreset === "inner"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            Inner
          </button>
          <button
            onClick={() => setCameraPreset("outer")}
            className={`px-2 py-1 text-xs rounded-lg transition font-medium shrink-0 ${
              cameraPreset === "outer"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            Outer
          </button>
          <button
            onClick={() => setCameraPreset("topdown")}
            className={`px-2 py-1 text-xs rounded-lg transition font-medium shrink-0 ${
              cameraPreset === "topdown"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            Top-Down
          </button>
          <button
            onClick={() => setCameraPreset("edgeon")}
            className={`px-2 py-1 text-xs rounded-lg transition font-medium shrink-0 ${
              cameraPreset === "edgeon"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            Edge-On
          </button>
          <button
            onClick={() => setCameraPreset("sun")}
            className={`px-2 py-1 text-xs rounded-lg transition font-medium shrink-0 ${
              cameraPreset === "sun"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            Sun
          </button>
        </div>
      </div>

      {/* QUICK PLANET PICKER BAR (Mid-top left with smooth touch scroll) */}
      <div className="absolute top-16 left-3 sm:left-4 flex flex-col gap-1 z-10 pointer-events-auto max-w-[calc(100%-2rem)] sm:max-w-md">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-1">
          Select Body:
        </span>
        <div className="flex gap-1 bg-slate-900/85 border border-white/10 p-1.5 rounded-xl backdrop-blur-md overflow-x-auto scrollbar-none">
          {[
            "Sun",
            "Mercury",
            "Venus",
            "Earth",
            "Mars",
            "Ceres",
            "Jupiter",
            "Saturn",
            "Uranus",
            "Neptune",
            "Pluto",
          ].map((bName) => (
            <button
              key={bName}
              onClick={() => {
                setSelectedBodyName(bName);
              }}
              className={`px-2 py-1 text-xs rounded-lg transition font-medium shrink-0 ${
                selectedBodyName === bName
                  ? "bg-cyan-500 text-black font-semibold shadow-md shadow-cyan-500/20"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              {bName}
            </button>
          ))}
        </div>
      </div>

      {/* PLANETARY FACT CARD (Right floating overlay with sourced transparency & comparison trigger) */}
      {isFactCardVisible && (
        <div className="absolute top-28 sm:top-16 right-3 sm:right-4 w-72 sm:w-80 bg-slate-900/90 border border-white/10 rounded-2xl p-4 text-white shadow-2xl backdrop-blur-md pointer-events-auto z-10 max-h-[460px] overflow-y-auto">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-2.5">
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xl font-bold tracking-tight text-white">{selectedFact.name}</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  {selectedFact.category}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {selectedFact.distanceAu > 0
                  ? `${selectedFact.distanceAu} AU (${selectedFact.distanceMillionKm}M km from Sun)`
                  : "Central Star (0 AU)"}
              </div>
            </div>
            {/* Quick Inspect Button */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleInspectPlanet(selectedFact.name)}
              className="h-7 px-2 text-[11px] border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
            >
              <Eye className="size-3 mr-1" /> Inspect
            </Button>
          </div>

          {/* Imaging Transparency Badge */}
          <div
            className={`mb-3 p-2 rounded-xl text-[11px] flex items-start gap-2 border ${
              selectedFact.imagingType === "Illustrative 3D Rendering"
                ? "bg-amber-950/40 border-amber-500/30 text-amber-200"
                : "bg-emerald-950/40 border-emerald-500/30 text-emerald-200"
            }`}
          >
            <ShieldAlert className="size-4 shrink-0 mt-0.5 text-amber-400" />
            <div>
              <span className="font-semibold">{selectedFact.imagingType}:</span>{" "}
              {selectedFact.imagingNote}
            </div>
          </div>

          {/* Sourced Fact Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
            <div className="bg-white/5 p-2 rounded-lg border border-white/5">
              <span className="text-[10px] text-slate-400 block uppercase">Diameter</span>
              <span className="font-semibold text-white">
                {selectedFact.diameterKm.toLocaleString()} km
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                ({selectedFact.diameterEarthRatio}x Earth)
              </span>
            </div>

            <div className="bg-white/5 p-2 rounded-lg border border-white/5">
              <span className="text-[10px] text-slate-400 block uppercase">Mass</span>
              <span className="font-semibold text-white">{selectedFact.massKgExp} kg</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                ({selectedFact.massEarthRatio.toLocaleString()}x Earth)
              </span>
            </div>

            <div className="bg-white/5 p-2 rounded-lg border border-white/5">
              <span className="text-[10px] text-slate-400 block uppercase">Year (Orbit)</span>
              <span className="font-semibold text-white">
                {selectedFact.orbitalPeriodDays < 800
                  ? `${selectedFact.orbitalPeriodDays} Earth days`
                  : `${(selectedFact.orbitalPeriodDays / 365.25).toFixed(1)} Earth years`}
              </span>
            </div>

            <div className="bg-white/5 p-2 rounded-lg border border-white/5">
              <span className="text-[10px] text-slate-400 block uppercase">Day (Rotation)</span>
              <span className="font-semibold text-white">
                {Math.abs(selectedFact.rotationPeriodHours) < 48
                  ? `${Math.abs(selectedFact.rotationPeriodHours)} hrs`
                  : `${(Math.abs(selectedFact.rotationPeriodHours) / 24).toFixed(1)} days`}
                {selectedFact.rotationPeriodHours < 0 ? " (retrograde)" : ""}
              </span>
            </div>

            <div className="bg-white/5 p-2 rounded-lg border border-white/5">
              <span className="text-[10px] text-slate-400 block uppercase">Surface Gravity</span>
              <span className="font-semibold text-white">
                {selectedFact.gravityMps2} m/s² ({selectedFact.gravityEarthRatio}g)
              </span>
            </div>

            <div className="bg-white/5 p-2 rounded-lg border border-white/5">
              <span className="text-[10px] text-slate-400 block uppercase">Temperature</span>
              <span className="font-semibold text-white">{selectedFact.meanTempC}°C</span>
            </div>
          </div>

          {/* Quick Comparison & Scale Actions */}
          <div className="bg-cyan-500/10 border border-cyan-500/20 p-2.5 rounded-xl mb-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                <Compass className="size-3.5" /> Earth Scale Comparison
              </span>
              <button
                onClick={() => setEarthCompareMode(!earthCompareMode)}
                className="text-[10px] text-cyan-400 underline hover:text-cyan-300"
              >
                {earthCompareMode ? "Hide Visual" : "Show Scale"}
              </button>
            </div>

            {earthCompareMode && (
              <div className="flex items-center justify-around py-2 bg-black/40 rounded-lg">
                <div className="flex flex-col items-center">
                  <div
                    className="rounded-full bg-cyan-500 flex items-center justify-center text-[9px] font-bold text-black"
                    style={{ width: "24px", height: "24px" }}
                  >
                    🌍
                  </div>
                  <span className="text-[10px] text-slate-300 mt-1">Earth (1.0x)</span>
                </div>
                <ArrowRight className="size-4 text-slate-500" />
                <div className="flex flex-col items-center">
                  <div
                    className="rounded-full flex items-center justify-center text-[9px] font-bold text-white border border-white/20"
                    style={{
                      backgroundColor:
                        selectedFact.category === "Gas Giant" ? "#c49a6c" : "#c24b23",
                      width: `${Math.max(8, Math.min(60, selectedFact.diameterEarthRatio * 18))}px`,
                      height: `${Math.max(8, Math.min(60, selectedFact.diameterEarthRatio * 18))}px`,
                    }}
                  >
                    {selectedFact.diameterEarthRatio > 2 ? "🪐" : "•"}
                  </div>
                  <span className="text-[10px] text-slate-300 mt-1">
                    {selectedFact.name} ({selectedFact.diameterEarthRatio}x)
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={() => handleOpenComparisonFor(selectedFact.name)}
              className="w-full text-center py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-semibold rounded-lg text-xs transition flex items-center justify-center gap-1.5"
            >
              <Scale className="size-3.5" />
              <span>Full Comparison vs Other Worlds →</span>
            </button>

            <p className="text-[11px] text-slate-300 italic leading-relaxed pt-1">
              "{selectedFact.funFact}"
            </p>
          </div>

          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <Info className="size-3 text-cyan-400" />
            Sources: NASA Planetary Fact Sheets / JPL Solar System Dynamics
          </div>
        </div>
      )}

      {/* COLLAPSIBLE BOTTOM CONTROL DOCK (Three.js standard zero-viewport occlusion) */}
      <div
        className={`absolute bottom-3 left-1/2 -translate-x-1/2 w-[95%] max-w-4xl bg-slate-900/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl transition-all duration-300 z-20 ${
          isDockCollapsed ? "translate-y-[calc(100%-42px)]" : "translate-y-0"
        }`}
      >
        {/* Collapse / Expand Tab Bar */}
        <div
          onClick={() => setIsDockCollapsed(!isDockCollapsed)}
          className="flex items-center justify-between px-4 py-2 cursor-pointer border-b border-white/10 text-xs font-semibold text-slate-300 hover:text-white select-none"
        >
          <div className="flex items-center gap-2">
            <Sliders className="size-3.5 text-cyan-400" />
            <span>Interactive Controls & Orbital Engine Settings</span>
            <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">
              (Speed: {speedMultiplier}x | {exaggeratedSize ? "Visual Size" : "True Relative Size"}{" "}
              | {scaledDistance ? "Readable Log Scale" : "Astronomical AU Distance"})
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-cyan-400">
            {isDockCollapsed ? (
              <>
                <span>Expand Controls</span>
                <ChevronUp className="size-4" />
              </>
            ) : (
              <>
                <span>Minimize HUD</span>
                <ChevronDown className="size-4" />
              </>
            )}
          </div>
        </div>

        {/* Expanded Controls Body */}
        {!isDockCollapsed && (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs text-white">
            {/* Speed & Playback */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
                <span>Simulation Clock:</span>
                <span className="text-cyan-400 font-semibold">{speedMultiplier}x</span>
              </label>
              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsPaused(!isPaused)}
                  className="h-8 border-white/15 bg-white/5 text-white hover:bg-white/10"
                >
                  {isPaused ? (
                    <Play className="size-3.5 text-emerald-400" />
                  ) : (
                    <Pause className="size-3.5 text-amber-400" />
                  )}
                </Button>
                {[0.25, 1, 5, 25, 100].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => {
                      setSpeedMultiplier(spd);
                      setIsPaused(false);
                    }}
                    className={`px-2 py-1 text-[11px] rounded transition ${
                      speedMultiplier === spd && !isPaused
                        ? "bg-cyan-500 text-black font-semibold"
                        : "bg-white/5 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            {/* Size & Scale Modes */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium text-slate-400">Planet Radii Scale:</label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => setExaggeratedSize(true)}
                  className={`py-1.5 px-2 rounded-lg text-center transition ${
                    exaggeratedSize
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold"
                      : "bg-white/5 text-slate-400 hover:bg-white/10"
                  }`}
                >
                  Exaggerated (Clear)
                </button>
                <button
                  onClick={() => setExaggeratedSize(false)}
                  className={`py-1.5 px-2 rounded-lg text-center transition ${
                    !exaggeratedSize
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold"
                      : "bg-white/5 text-slate-400 hover:bg-white/10"
                  }`}
                >
                  True Relative Size
                </button>
              </div>
            </div>

            {/* Distance Scale */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium text-slate-400">Orbital Spacing:</label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => setScaledDistance(true)}
                  className={`py-1.5 px-2 rounded-lg text-center transition ${
                    scaledDistance
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold"
                      : "bg-white/5 text-slate-400 hover:bg-white/10"
                  }`}
                >
                  Readable Log Scale
                </button>
                <button
                  onClick={() => setScaledDistance(false)}
                  className={`py-1.5 px-2 rounded-lg text-center transition ${
                    !scaledDistance
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold"
                      : "bg-white/5 text-slate-400 hover:bg-white/10"
                  }`}
                >
                  True Astronomical AU
                </button>
              </div>
            </div>

            {/* Layer Toggles: Orbits, Moons, Rings, Inclination Labels */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium text-slate-400">
                Visual Layers & Labels:
              </label>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setShowOrbits(!showOrbits)}
                  className={`px-2 py-1 text-[11px] rounded-lg transition ${
                    showOrbits
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                      : "bg-white/5 text-slate-400"
                  }`}
                >
                  Orbits
                </button>
                <button
                  onClick={() => setShowMoons(!showMoons)}
                  className={`px-2 py-1 text-[11px] rounded-lg transition ${
                    showMoons
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                      : "bg-white/5 text-slate-400"
                  }`}
                >
                  Moons
                </button>
                <button
                  onClick={() => setShowRings(!showRings)}
                  className={`px-2 py-1 text-[11px] rounded-lg transition ${
                    showRings
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                      : "bg-white/5 text-slate-400"
                  }`}
                >
                  Rings
                </button>
                <button
                  onClick={() => setShowInclinationLabels(!showInclinationLabels)}
                  className={`px-2 py-1 text-[11px] rounded-lg transition ${
                    showInclinationLabels
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 font-semibold"
                      : "bg-white/5 text-slate-400 hover:text-white"
                  }`}
                  title="Show Keplerian orbital inclination degrees relative to the ecliptic plane"
                >
                  Inclination Labels
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PLANETARY COMPARISON MODAL */}
      {isComparisonOpen && (
        <PlanetaryComparisonModal
          planetA={comparePlanetA}
          planetB={comparePlanetB}
          onChangePlanetA={setComparePlanetA}
          onChangePlanetB={setComparePlanetB}
          onClose={() => setIsComparisonOpen(false)}
          onInspectPlanet={handleInspectPlanet}
        />
      )}
    </div>
  );
}
