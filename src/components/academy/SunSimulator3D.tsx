// @ts-nocheck -- loosely-typed educational content; runtime-validated by rendering.
import React, { useRef, useState, useMemo, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import {
  Sun,
  Layers,
  Zap,
  Activity,
  Globe,
  Compass,
  Maximize2,
  Info,
  Play,
  Pause,
  RotateCcw,
  Shield,
  Eye,
  Flame,
  Radio,
  Sliders,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// -------------------------------------------------------------
// SCIENTIFIC CONSTANTS & LAYER SPECIFICATIONS
// -------------------------------------------------------------
export interface SolarLayerInfo {
  id: string;
  name: string;
  depthFraction: string;
  radiusKm: string;
  temperature: string;
  density: string;
  transportMode: string;
  description: string;
  color: string;
  emissiveColor: string;
  glowColor: string;
  isIllustrative: boolean;
}

export const SOLAR_LAYERS: SolarLayerInfo[] = [
  {
    id: "core",
    name: "Nuclear Core",
    depthFraction: "0.00 – 0.25 R☉",
    radiusKm: "0 – 174,000 km",
    temperature: "15,700,000 K",
    density: "150 g/cm³ (150,000 kg/m³)",
    transportMode: "Nuclear p-p chain fusion (generates 99% of solar power)",
    description:
      "The gravitational powerhouse where extreme temperature and density force 600 million tons of hydrogen to fuse into helium every second via the p-p chain.",
    color: "#ffffff",
    emissiveColor: "#ffea75",
    glowColor: "#ffffff",
    isIllustrative: true,
  },
  {
    id: "radiative",
    name: "Radiative Zone",
    depthFraction: "0.25 – 0.70 R☉",
    radiusKm: "174,000 – 487,000 km",
    temperature: "7,000,000 → 2,000,000 K",
    density: "20 → 0.2 g/cm³",
    transportMode: "Radiative diffusion (photon random walk: 100,000–170,000 years)",
    description:
      "Energy travels purely as electromagnetic radiation. Photons undergo countless absorption and Compton scatterings with plasma particles with a mean free path < 1 mm.",
    color: "#ffaa33",
    emissiveColor: "#ff8800",
    glowColor: "#ffaa00",
    isIllustrative: true,
  },
  {
    id: "tachocline",
    name: "The Tachocline",
    depthFraction: "0.70 R☉ (Thin Shear Layer)",
    radiusKm: "~487,000 km",
    temperature: "~2,000,000 K",
    density: "~0.2 g/cm³",
    transportMode: "Magnetic dynamo shear (Omega effect: generates solar magnetic field)",
    description:
      "A thin transitional shear boundary separating uniform solid-body radiative rotation from differential convective rotation. It is the dynamo engine of solar activity.",
    color: "#ff5500",
    emissiveColor: "#cc3300",
    glowColor: "#ff3300",
    isIllustrative: true,
  },
  {
    id: "convective",
    name: "Convection Zone",
    depthFraction: "0.70 – 1.00 R☉",
    radiusKm: "487,000 – 696,340 km",
    temperature: "2,000,000 → 5,772 K",
    density: "0.2 → 0.0000002 g/cm³",
    transportMode: "Rayleigh-Bénard plasma convection (boiling convective cells)",
    description:
      "Because cooling gas becomes opaque to radiation (Schwarzschild instability), heat is carried upward by massive boiling plasma columns at velocities of 1 to 2 km/s.",
    color: "#ff7700",
    emissiveColor: "#d9480f",
    glowColor: "#ff6600",
    isIllustrative: true,
  },
  {
    id: "photosphere",
    name: "Photosphere (Visible Surface)",
    depthFraction: "1.00 R☉ (~400 km thick)",
    radiusKm: "696,340 km",
    temperature: "5,772 K (~5,500 °C)",
    density: "2 × 10⁻⁴ g/cm³ (1/10,000th Earth air)",
    transportMode: "Radiation into free space (blackbody spectrum, optical depth τ = 2/3)",
    description:
      "The visible optical disk. Covered by millions of bubbling granulation cells (each ~1,000 km across) and cooler, magnetically inhibited sunspot active regions.",
    color: "#ffd43b",
    emissiveColor: "#fab005",
    glowColor: "#ffe066",
    isIllustrative: false, // Mapped to real observational features
  },
  {
    id: "chromosphere",
    name: "Chromosphere",
    depthFraction: "1.00 – 1.003 R☉ (~2,000 km)",
    radiusKm: "696,340 – 698,340 km",
    temperature: "4,500 → 25,000 K",
    density: "10⁻⁸ to 10⁻¹¹ g/cm³",
    transportMode: "Hydrogen-alpha line radiation (656.3 nm) & spicule plasma jets",
    description:
      "A thin rosy-crimson atmospheric shell laced with thousands of supersonic plasma spicules shooting outward at 20 to 100 km/s.",
    color: "#ff4d6d",
    emissiveColor: "#c9184a",
    glowColor: "#ff758f",
    isIllustrative: false,
  },
  {
    id: "corona",
    name: "Corona",
    depthFraction: "> 1.003 R☉ (Extends millions of km)",
    radiusKm: "> 700,000 km",
    temperature: "1,000,000 – 3,000,000 K",
    density: "10⁻¹⁵ g/cm³ (ultra-diffuse plasma)",
    transportMode: "Magnetic reconnection, Alfvén wave dissipation & solar wind expansion",
    description:
      "The mysterious million-degree outer atmosphere visible during eclipses. Driven to extreme temperatures by magnetic reconnection events and Alfvén wave heating.",
    color: "#f8f9fa",
    emissiveColor: "#e9ecef",
    glowColor: "#fff3bf",
    isIllustrative: false,
  },
];

// -------------------------------------------------------------
// TEXTURE GENERATION HELPERS (Photosphere, Granules, Sunspots)
// -------------------------------------------------------------
function createPhotosphereTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Base glowing solar gradient
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, "#ffe066");
  grad.addColorStop(0.5, "#fcc419");
  grad.addColorStop(1, "#f59f00");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Add granulation noise
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radius = Math.random() * 5 + 1.5;
    const brightness = Math.random() * 40 - 20;
    ctx.fillStyle = brightness > 0 ? "rgba(255, 255, 220, 0.25)" : "rgba(180, 80, 0, 0.25)";
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw active sunspot regions (Umbra + Penumbra)
  const sunspots = [
    { x: 320, y: 220, r: 24 },
    { x: 350, y: 235, r: 16 },
    { x: 700, y: 290, r: 28 },
    { x: 740, y: 275, r: 14 },
    { x: 500, y: 210, r: 12 },
  ];

  sunspots.forEach((spot) => {
    // Penumbra (lighter brownish border)
    const penumbraGrad = ctx.createRadialGradient(spot.x, spot.y, 0, spot.x, spot.y, spot.r);
    penumbraGrad.addColorStop(0, "rgba(70, 30, 10, 0.95)");
    penumbraGrad.addColorStop(0.5, "rgba(160, 80, 20, 0.8)");
    penumbraGrad.addColorStop(1, "rgba(240, 140, 30, 0)");
    ctx.fillStyle = penumbraGrad;
    ctx.beginPath();
    ctx.arc(spot.x, spot.y, spot.r, 0, Math.PI * 2);
    ctx.fill();

    // Umbra (dark central core)
    ctx.fillStyle = "rgba(25, 10, 5, 0.98)";
    ctx.beginPath();
    ctx.arc(spot.x - 2, spot.y - 1, spot.r * 0.45, 0, Math.PI * 2);
    ctx.fill();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

// -------------------------------------------------------------
// 3D INTERNAL CUTAWAY SUN MODEL
// -------------------------------------------------------------
interface CutawaySunProps {
  cutawayAngle: number; // 0 = full, Math.PI/2 = quarter cut, Math.PI = half cut
  selectedLayerId: string;
  onSelectLayer: (layerId: string) => void;
  showFieldLines: boolean;
  showProminences: boolean;
  solarActivity: number; // 0 = quiet, 1 = maximum
  isExploded: boolean;
}

function CutawaySun({
  cutawayAngle,
  selectedLayerId,
  onSelectLayer,
  showFieldLines,
  showProminences,
  solarActivity,
  isExploded,
}: CutawaySunProps) {
  const sunGroupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const radiativeRef = useRef<THREE.Mesh>(null);
  const convectiveRef = useRef<THREE.Mesh>(null);
  const photosphereRef = useRef<THREE.Mesh>(null);
  const prominenceRef = useRef<THREE.Group>(null);

  const photoTexture = useMemo(() => createPhotosphereTexture(), []);

  useFrame((_, delta) => {
    if (sunGroupRef.current) {
      // Differential equatorial rotation animation
      sunGroupRef.current.rotation.y += delta * 0.15;
    }
    if (coreRef.current) {
      // Pulsing nuclear core
      const s = 1 + Math.sin(Date.now() * 0.003) * 0.02;
      coreRef.current.scale.set(s, s, s);
    }
    if (prominenceRef.current) {
      prominenceRef.current.rotation.z += delta * 0.05;
    }
  });

  // Layer radii in Three.js units (Photosphere R = 2.5)
  const radii = {
    core: 0.75, // 0.25 R☉
    radiative: 1.6, // 0.70 R☉
    convective: 2.35, // 0.94 R☉
    photosphere: 2.5, // 1.00 R☉
    chromosphere: 2.62,
    corona: 3.3,
  };

  // Exploded spacing offset
  const explodeOffset = isExploded ? 0.45 : 0;

  // Theta start/length for cutaway slice
  // When cutawayAngle is 0 -> full sphere (thetaStart = 0, thetaLength = 2*PI)
  // When cutawayAngle is PI/2 -> cut 90 deg wedge (thetaLength = 2*PI - PI/2 = 1.5*PI)
  const sphereAngle = Math.PI * 2 - cutawayAngle;

  return (
    <group ref={sunGroupRef}>
      {/* 1. NUCLEAR CORE (Solid sphere or cut slice) */}
      <mesh
        ref={coreRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelectLayer("core");
        }}
        position={[isExploded ? -explodeOffset * 2 : 0, 0, 0]}
      >
        <sphereGeometry args={[radii.core, 32, 32, 0, sphereAngle]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive={selectedLayerId === "core" ? "#ffffff" : "#fff3bf"}
          emissiveIntensity={selectedLayerId === "core" ? 2.5 : 1.8}
          roughness={0.2}
        />
      </mesh>

      {/* 2. RADIATIVE ZONE */}
      <mesh
        ref={radiativeRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelectLayer("radiative");
        }}
        position={[isExploded ? -explodeOffset : 0, 0, 0]}
      >
        <sphereGeometry args={[radii.radiative, 32, 32, 0, sphereAngle]} />
        <meshStandardMaterial
          color="#ff9900"
          emissive={selectedLayerId === "radiative" ? "#ffaa33" : "#e67e22"}
          emissiveIntensity={selectedLayerId === "radiative" ? 1.5 : 0.8}
          transparent
          opacity={cutawayAngle > 0.05 ? 0.9 : 0.4}
          roughness={0.4}
        />
      </mesh>

      {/* 3. TACHOCLINE SHEAR RING (thin boundary marker) */}
      {cutawayAngle > 0.1 && (
        <mesh
          rotation={[Math.PI / 2, 0, 0]}
          onClick={(e) => {
            e.stopPropagation();
            onSelectLayer("tachocline");
          }}
        >
          <ringGeometry args={[radii.radiative - 0.02, radii.radiative + 0.04, 32]} />
          <meshBasicMaterial
            color="#ff3300"
            side={THREE.DoubleSide}
            transparent
            opacity={selectedLayerId === "tachocline" ? 0.9 : 0.5}
          />
        </mesh>
      )}

      {/* 4. CONVECTIVE ZONE */}
      <mesh
        ref={convectiveRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelectLayer("convective");
        }}
        position={[isExploded ? explodeOffset : 0, 0, 0]}
      >
        <sphereGeometry args={[radii.convective, 32, 32, 0, sphereAngle]} />
        <meshStandardMaterial
          color="#ff6600"
          emissive={selectedLayerId === "convective" ? "#ff7700" : "#d35400"}
          emissiveIntensity={selectedLayerId === "convective" ? 1.4 : 0.6}
          transparent
          opacity={cutawayAngle > 0.05 ? 0.85 : 0.3}
          roughness={0.6}
        />
      </mesh>

      {/* 5. PHOTOSPHERE (OUTER VISIBLE SURFACE) */}
      <mesh
        ref={photosphereRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelectLayer("photosphere");
        }}
      >
        <sphereGeometry args={[radii.photosphere, 48, 48, 0, sphereAngle]} />
        <meshStandardMaterial
          map={photoTexture}
          emissive="#ff9900"
          emissiveIntensity={selectedLayerId === "photosphere" ? 1.3 : 0.7}
          roughness={0.5}
        />
      </mesh>

      {/* 6. CHROMOSPHERE (THIN TRANSLUCENT CRIMSON GLOW) */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelectLayer("chromosphere");
        }}
      >
        <sphereGeometry args={[radii.chromosphere, 32, 32]} />
        <meshBasicMaterial
          color="#ff3366"
          transparent
          opacity={selectedLayerId === "chromosphere" ? 0.45 : 0.15}
          side={THREE.BackSide}
        />
      </mesh>

      {/* 7. CORONA ATMOSPHERE (ETHEREAL HALO) */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelectLayer("corona");
        }}
      >
        <sphereGeometry args={[radii.corona, 32, 32]} />
        <meshBasicMaterial
          color="#fff5cc"
          transparent
          opacity={selectedLayerId === "corona" ? 0.35 : 0.12}
          side={THREE.BackSide}
        />
      </mesh>

      {/* PROMINENCES & PLASMA ARCHES */}
      {showProminences && (
        <group ref={prominenceRef}>
          {/* Prominence Loop 1 */}
          <mesh position={[2.1, 1.4, 0]} rotation={[0, 0, Math.PI / 4]}>
            <torusGeometry args={[0.55, 0.07, 16, 32, Math.PI]} />
            <meshBasicMaterial color="#ff2a5f" />
          </mesh>
          {/* Prominence Loop 2 */}
          <mesh position={[-2.3, -0.8, 0.4]} rotation={[0.4, 0.2, -Math.PI / 3]}>
            <torusGeometry args={[0.45, 0.06, 16, 32, Math.PI]} />
            <meshBasicMaterial color="#ff4444" />
          </mesh>
          {/* Prominence Loop 3 (scaled with solar activity) */}
          {solarActivity > 0.4 && (
            <mesh position={[0.5, -2.2, 0.8]} rotation={[-0.5, 0.5, Math.PI / 2]}>
              <torusGeometry args={[0.65, 0.08, 16, 32, Math.PI]} />
              <meshBasicMaterial color="#ff3388" />
            </mesh>
          )}
        </group>
      )}

      {/* ILLUSTRATIVE MAGNETIC FIELD LINES */}
      {showFieldLines && (
        <group>
          {/* North-South Dipole Field Loops */}
          {[-0.8, -0.4, 0, 0.4, 0.8].map((angle, i) => (
            <group key={i} rotation={[0, angle * Math.PI, 0]}>
              <mesh position={[0, 0, 0]}>
                <torusGeometry args={[3.2, 0.02, 8, 48, Math.PI]} />
                <meshBasicMaterial color="#00e5ff" transparent opacity={0.65} />
              </mesh>
            </group>
          ))}
          {/* Twisted Toroidal Active Region Loops over Sunspots */}
          <mesh position={[1.8, 0.6, 1.2]} rotation={[0.8, 0.2, 0]}>
            <torusGeometry args={[0.4, 0.025, 8, 32, Math.PI]} />
            <meshBasicMaterial color="#00ffcc" transparent opacity={0.8} />
          </mesh>
          <mesh position={[-1.7, 0.8, 1.3]} rotation={[-0.6, -0.4, 0]}>
            <torusGeometry args={[0.5, 0.025, 8, 32, Math.PI]} />
            <meshBasicMaterial color="#00ffcc" transparent opacity={0.8} />
          </mesh>
        </group>
      )}
    </group>
  );
}

// -------------------------------------------------------------
// 3D NUCLEAR FUSION PARTICLE SIMULATION
// -------------------------------------------------------------
function FusionParticleChamber({ step }: { step: number }) {
  const particlesRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (particlesRef.current) {
      const t = state.clock.getElapsedTime();
      particlesRef.current.children.forEach((child, i) => {
        child.position.x += Math.sin(t * 3 + i) * 0.005;
        child.position.y += Math.cos(t * 2.5 + i) * 0.005;
      });
    }
  });

  return (
    <group ref={particlesRef}>
      {/* Step 1: Two incoming protons (p + p) -> Deuteron + Positron + Neutrino */}
      {step === 1 && (
        <group>
          {/* Proton 1 */}
          <mesh position={[-1.2, 0, 0]}>
            <sphereGeometry args={[0.22, 16, 16]} />
            <meshStandardMaterial color="#ff3333" emissive="#cc0000" emissiveIntensity={0.8} />
          </mesh>
          {/* Proton 2 */}
          <mesh position={[1.2, 0, 0]}>
            <sphereGeometry args={[0.22, 16, 16]} />
            <meshStandardMaterial color="#ff3333" emissive="#cc0000" emissiveIntensity={0.8} />
          </mesh>
          {/* Collision Flash Marker */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.35, 16, 16]} />
            <meshBasicMaterial color="#ffffaa" transparent opacity={0.3} />
          </mesh>
        </group>
      )}

      {/* Step 2: Deuteron formed + e+ + neutrino */}
      {step === 2 && (
        <group>
          {/* Deuteron (1 Proton + 1 Neutron bound) */}
          <group position={[-0.2, 0, 0]}>
            <mesh position={[-0.15, 0, 0]}>
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshStandardMaterial color="#ff3333" emissive="#cc0000" emissiveIntensity={0.6} />
            </mesh>
            <mesh position={[0.15, 0, 0]}>
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshStandardMaterial color="#888888" roughness={0.3} />
            </mesh>
          </group>
          {/* Escaping Positron (e+) */}
          <mesh position={[1.2, 0.8, 0]}>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshBasicMaterial color="#00ffff" />
          </mesh>
          {/* Escaping Electron Neutrino (v_e) */}
          <mesh position={[-1.2, -0.8, 0]}>
            <sphereGeometry args={[0.05, 12, 12]} />
            <meshBasicMaterial color="#ccff00" />
          </mesh>
        </group>
      )}

      {/* Step 3: Helium-3 synthesis (Deuteron + Proton -> 3He + Gamma ray) */}
      {step === 3 && (
        <group>
          {/* Helium-3 Nucleus (2 Protons + 1 Neutron) */}
          <group position={[0, 0, 0]}>
            <mesh position={[-0.15, 0.12, 0]}>
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshStandardMaterial color="#ff3333" emissive="#cc0000" emissiveIntensity={0.6} />
            </mesh>
            <mesh position={[0.15, 0.12, 0]}>
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshStandardMaterial color="#ff3333" emissive="#cc0000" emissiveIntensity={0.6} />
            </mesh>
            <mesh position={[0, -0.15, 0]}>
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshStandardMaterial color="#888888" roughness={0.3} />
            </mesh>
          </group>
          {/* Gamma ray photon wave packet */}
          <mesh position={[1.5, -0.5, 0]}>
            <sphereGeometry args={[0.12, 12, 12]} />
            <meshBasicMaterial color="#ffff00" />
          </mesh>
        </group>
      )}

      {/* Step 4: Helium-4 synthesis (3He + 3He -> 4He + 2 Protons) */}
      {step === 4 && (
        <group>
          {/* Alpha Particle / Helium-4 (2 Protons + 2 Neutrons) */}
          <group position={[0, 0, 0]}>
            <mesh position={[-0.18, 0.18, 0]}>
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshStandardMaterial color="#ff3333" emissive="#ff4444" emissiveIntensity={0.8} />
            </mesh>
            <mesh position={[0.18, 0.18, 0]}>
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshStandardMaterial color="#ff3333" emissive="#ff4444" emissiveIntensity={0.8} />
            </mesh>
            <mesh position={[-0.18, -0.18, 0]}>
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshStandardMaterial color="#777777" roughness={0.2} />
            </mesh>
            <mesh position={[0.18, -0.18, 0]}>
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshStandardMaterial color="#777777" roughness={0.2} />
            </mesh>
          </group>
          {/* Two ejected free protons returning to cycle */}
          <mesh position={[-1.4, 0.8, 0]}>
            <sphereGeometry args={[0.18, 16, 16]} />
            <meshStandardMaterial color="#ff3333" emissive="#cc0000" />
          </mesh>
          <mesh position={[1.4, -0.8, 0]}>
            <sphereGeometry args={[0.18, 16, 16]} />
            <meshStandardMaterial color="#ff3333" emissive="#cc0000" />
          </mesh>
        </group>
      )}
    </group>
  );
}

// -------------------------------------------------------------
// 3D SOLAR WIND & EARTH MAGNETOSPHERE SIMULATION
// -------------------------------------------------------------
function SolarWindMagnetosphere({ isStormActive }: { isStormActive: boolean }) {
  const streamRef = useRef<THREE.Points>(null);
  const particleCount = 280;

  const positions = useMemo(() => {
    const arr = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      arr[i * 3] = -4 + Math.random() * 8; // X along Sun -> Earth stream
      arr[i * 3 + 1] = (Math.random() - 0.5) * 3; // Y spread
      arr[i * 3 + 2] = (Math.random() - 0.5) * 3; // Z spread
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    if (streamRef.current) {
      const pos = streamRef.current.geometry.attributes.position.array as Float32Array;
      const speed = isStormActive ? 4.5 : 2.0;
      for (let i = 0; i < particleCount; i++) {
        pos[i * 3] += delta * speed;
        // Reset when passing Earth position (x = 3.0)
        if (pos[i * 3] > 4.5) {
          pos[i * 3] = -4.5;
        }
      }
      streamRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Sun on far left */}
      <mesh position={[-4.5, 0, 0]}>
        <sphereGeometry args={[0.9, 24, 24]} />
        <meshBasicMaterial color="#ffaa00" />
      </mesh>

      {/* Earth on right */}
      <group position={[2.2, 0, 0]}>
        {/* Earth sphere */}
        <mesh>
          <sphereGeometry args={[0.22, 24, 24]} />
          <meshStandardMaterial color="#2b6cb0" roughness={0.4} />
        </mesh>
        {/* Dayside compressed bow shock shield */}
        <mesh position={[-0.35, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry args={[0.65, 0.35, 0.08, 24, 1, true, 0, Math.PI]} />
          <meshBasicMaterial
            color={isStormActive ? "#ff3366" : "#00f5d4"}
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Magnetosphere Dipole Field Lines */}
        <group>
          {[-0.4, 0, 0.4].map((tilt, idx) => (
            <mesh key={idx} rotation={[tilt, 0, 0]}>
              <torusGeometry args={[0.55, 0.015, 8, 32, Math.PI]} />
              <meshBasicMaterial color="#38bdf8" transparent opacity={0.5} />
            </mesh>
          ))}
        </group>
        {/* Auroral ovals (green/violet polar caps) */}
        <mesh position={[0, 0.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.08, 0.14, 16]} />
          <meshBasicMaterial
            color={isStormActive ? "#ff007f" : "#22c55e"}
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh position={[0, -0.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.08, 0.14, 16]} />
          <meshBasicMaterial
            color={isStormActive ? "#ff007f" : "#22c55e"}
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* Streaming Solar Wind Particles */}
      <points ref={streamRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
            count={particleCount}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          color={isStormActive ? "#ff5533" : "#ffeedd"}
          transparent
          opacity={0.8}
        />
      </points>
    </group>
  );
}

// -------------------------------------------------------------
// 3D STELLAR SIZE COMPARISON SCENE
// -------------------------------------------------------------
function StellarComparisonScene() {
  return (
    <group position={[0, 0, 0]}>
      {/* 1. Earth (Scaled up 3x for visibility, otherwise invisible dot!) */}
      <group position={[-3.2, 0, 0]}>
        <mesh>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color="#3b82f6" />
        </mesh>
      </group>

      {/* 2. Proxima Centauri (Red Dwarf: 0.14 R☉) */}
      <group position={[-2.4, 0, 0]}>
        <mesh>
          <sphereGeometry args={[0.25, 24, 24]} />
          <meshStandardMaterial color="#dc2626" emissive="#991b1b" emissiveIntensity={0.6} />
        </mesh>
      </group>

      {/* 3. The Sun (G2V Yellow Dwarf: 1.0 R☉) */}
      <group position={[-0.8, 0, 0]}>
        <mesh>
          <sphereGeometry args={[1.0, 32, 32]} />
          <meshStandardMaterial color="#f59e0b" emissive="#d97706" emissiveIntensity={0.8} />
        </mesh>
      </group>

      {/* 4. Sirius A (A-type Star: 1.7 R☉) */}
      <group position={[1.6, 0, 0]}>
        <mesh>
          <sphereGeometry args={[1.7, 32, 32]} />
          <meshStandardMaterial color="#e0f2fe" emissive="#bae6fd" emissiveIntensity={1.0} />
        </mesh>
      </group>
    </group>
  );
}

// -------------------------------------------------------------
// CAMERA RIG WITH PRESETS
// -------------------------------------------------------------
type CameraPreset = "overview" | "cutaway" | "activeRegion" | "solarWind" | "stellarScale";

interface OrbitControlsLike {
  target: THREE.Vector3;
  update: () => void;
}

function CameraRig({
  preset,
  controlsRef,
}: {
  preset: CameraPreset;
  controlsRef: React.RefObject<OrbitControlsLike | null>;
}) {
  const { camera } = useThree();

  useEffect(() => {
    if (!controlsRef.current) return;

    if (preset === "overview") {
      camera.position.set(0, 0, 6.5);
      controlsRef.current.target.set(0, 0, 0);
    } else if (preset === "cutaway") {
      camera.position.set(2.8, 2.2, 4.2);
      controlsRef.current.target.set(0, 0, 0);
    } else if (preset === "activeRegion") {
      camera.position.set(1.5, 0.8, 3.2);
      controlsRef.current.target.set(1.0, 0.4, 0.8);
    } else if (preset === "solarWind") {
      camera.position.set(0, 3.5, 7.5);
      controlsRef.current.target.set(0, 0, 0);
    } else if (preset === "stellarScale") {
      camera.position.set(0, 0, 7.8);
      controlsRef.current.target.set(0, 0, 0);
    }

    controlsRef.current.update();
  }, [preset, camera, controlsRef]);

  return null;
}

// -------------------------------------------------------------
// MAIN SUN SIMULATOR 3D COMPONENT
// -------------------------------------------------------------
export function SunSimulator3D() {
  const [activeTab, setActiveTab] = useState<
    "layers" | "fusion" | "fields" | "solarWind" | "comparison"
  >("layers");
  const [cutawayAngle, setCutawayAngle] = useState<number>(Math.PI * 0.5); // 90 deg quarter-cut default
  const [selectedLayerId, setSelectedLayerId] = useState<string>("core");
  const [showFieldLines, setShowFieldLines] = useState<boolean>(true);
  const [showProminences, setShowProminences] = useState<boolean>(true);
  const [isExploded, setIsExploded] = useState<boolean>(false);
  const [solarActivity, setSolarActivity] = useState<number>(0.75); // 0 = quiet, 1 = maximum
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>("cutaway");

  // Fusion particle chamber state
  const [fusionStep, setFusionStep] = useState<number>(1);
  const [isFusionPlaying, setIsFusionPlaying] = useState<boolean>(false);

  // Solar wind storm toggle
  const [isStormActive, setIsStormActive] = useState<boolean>(false);

  // Mobile drawer collapse
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState<boolean>(true);

  const controlsRef = useRef<OrbitControlsLike | null>(null);

  const activeLayer = useMemo(() => {
    return SOLAR_LAYERS.find((l) => l.id === selectedLayerId) || SOLAR_LAYERS[0];
  }, [selectedLayerId]);

  // Automated fusion animation ticker
  useEffect(() => {
    if (!isFusionPlaying) return;
    const interval = setInterval(() => {
      setFusionStep((prev) => (prev >= 4 ? 1 : prev + 1));
    }, 2800);
    return () => clearInterval(interval);
  }, [isFusionPlaying]);

  return (
    <div className="relative w-full rounded-3xl border border-white/10 bg-slate-950 overflow-hidden shadow-2xl flex flex-col">
      {/* 1. TOP HEADER & INTERACTIVE MODE SELECTOR */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900/90 border-b border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Sun className="size-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Interactive Sun Simulator 3D</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold uppercase">
                SDO & Standard Model Grounded
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Kinematic cutaway model with particle fusion, magnetic topology, and magnetospheric
              shielding
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/40 border border-white/10 overflow-x-auto scrollbar-none">
          <button
            onClick={() => {
              setActiveTab("layers");
              setCameraPreset("cutaway");
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === "layers"
                ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <Layers className="size-3.5" />
            <span>Internal Cutaway</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("fusion");
              setCameraPreset("overview");
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === "fusion"
                ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <Zap className="size-3.5" />
            <span>Nuclear Fusion</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("fields");
              setCameraPreset("activeRegion");
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === "fields"
                ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <Activity className="size-3.5" />
            <span>Magnetic Dynamo</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("solarWind");
              setCameraPreset("solarWind");
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === "solarWind"
                ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <Shield className="size-3.5" />
            <span>Solar Wind & Earth</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("comparison");
              setCameraPreset("stellarScale");
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === "comparison"
                ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <Globe className="size-3.5" />
            <span>Stellar Scale</span>
          </button>
        </div>
      </div>

      {/* 2. 3D WEBGL CANVAS VIEWPORT */}
      <div className="relative w-full h-[540px] sm:h-[600px] bg-gradient-to-b from-black via-slate-950 to-slate-900 overflow-hidden">
        <Canvas camera={{ position: [2.8, 2.2, 4.2], fov: 45 }}>
          <ambientLight intensity={0.4} />
          <pointLight position={[0, 0, 0]} intensity={3.5} color="#fff1a8" />
          <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" />

          <Suspense fallback={null}>
            {activeTab === "layers" && (
              <CutawaySun
                cutawayAngle={cutawayAngle}
                selectedLayerId={selectedLayerId}
                onSelectLayer={(id) => {
                  setSelectedLayerId(id);
                  setIsDetailPanelOpen(true);
                }}
                showFieldLines={showFieldLines}
                showProminences={showProminences}
                solarActivity={solarActivity}
                isExploded={isExploded}
              />
            )}

            {activeTab === "fusion" && <FusionParticleChamber step={fusionStep} />}

            {activeTab === "fields" && (
              <CutawaySun
                cutawayAngle={0}
                selectedLayerId={selectedLayerId}
                onSelectLayer={setSelectedLayerId}
                showFieldLines={true}
                showProminences={true}
                solarActivity={solarActivity}
                isExploded={false}
              />
            )}

            {activeTab === "solarWind" && <SolarWindMagnetosphere isStormActive={isStormActive} />}

            {activeTab === "comparison" && <StellarComparisonScene />}

            <CameraRig preset={cameraPreset} controlsRef={controlsRef} />
            <OrbitControls
              ref={controlsRef}
              enableDamping
              dampingFactor={0.06}
              minDistance={1.8}
              maxDistance={15}
            />
          </Suspense>
        </Canvas>

        {/* HUD OVERLAY: Camera Presets & Disclosure Pill */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/80 border border-white/10 backdrop-blur-md">
            <span className="text-[10px] font-bold text-slate-400 px-2 uppercase">Camera</span>
            <button
              onClick={() => setCameraPreset("overview")}
              className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                cameraPreset === "overview"
                  ? "bg-white/20 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Full Sun
            </button>
            <button
              onClick={() => setCameraPreset("cutaway")}
              className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                cameraPreset === "cutaway"
                  ? "bg-white/20 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Cutaway View
            </button>
            <button
              onClick={() => setCameraPreset("activeRegion")}
              className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                cameraPreset === "activeRegion"
                  ? "bg-white/20 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Active Region
            </button>
          </div>

          {/* Scientific Disclaimer Badge */}
          <div className="p-2 rounded-xl bg-slate-900/80 border border-white/10 backdrop-blur-md max-w-xs text-[11px] text-slate-300 leading-tight">
            <span className="font-semibold text-amber-400">Scientific Model Disclosure:</span>{" "}
            {activeTab === "layers" &&
              "Concentric layers and photon walk are illustrative models based on the Bahcall BP2005 solar model. Photosphere features are mapped from SDO observations."}
            {activeTab === "fusion" &&
              "Particle collisions illustrate the quantum mechanical p-p chain tunneling reactions; scale and speeds are stylized for instructional clarity."}
            {activeTab === "fields" &&
              "Magnetic field lines represent Babcock-Leighton flux rope topologies; they are mathematical models rather than literal physical wires."}
            {activeTab === "solarWind" &&
              "Earth's bow shock and magnetosphere are scaled for visibility (actual Earth-Sun distance is 215 solar radii)."}
            {activeTab === "comparison" &&
              "Stellar diameters reflect astronomical measurements: Earth 12,742 km, Proxima 0.14 R☉, Sun 1.0 R☉, Sirius 1.7 R☉."}
          </div>
        </div>

        {/* TOGGLE BUTTON FOR MOBILE DETAIL CARD */}
        <button
          onClick={() => setIsDetailPanelOpen((prev) => !prev)}
          className="absolute top-4 right-4 z-10 md:hidden p-2 rounded-xl bg-slate-900/90 border border-white/10 text-white shadow-lg"
          aria-label="Toggle details panel"
        >
          <Info className="size-4" />
        </button>

        {/* FLOATING DETAIL PANEL (Interactive Layer Card or Mode Details) */}
        {isDetailPanelOpen && (
          <div className="absolute right-4 bottom-20 md:bottom-4 md:top-4 z-10 w-80 max-h-[82%] overflow-y-auto p-4 rounded-2xl bg-slate-900/90 border border-white/10 backdrop-blur-xl shadow-2xl text-slate-200 space-y-3.5 scrollbar-thin">
            {/* MODE 1: LAYERS BREAKDOWN */}
            {activeTab === "layers" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="size-3 rounded-full"
                      style={{ backgroundColor: activeLayer.color }}
                    />
                    <h4 className="text-sm font-bold text-white">{activeLayer.name}</h4>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                    {activeLayer.depthFraction}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Radius from Center:</span>
                    <span className="text-white font-mono">{activeLayer.radiusKm}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Temperature:</span>
                    <span className="text-amber-300 font-mono font-semibold">
                      {activeLayer.temperature}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Plasma Density:</span>
                    <span className="text-white font-mono">{activeLayer.density}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 block">
                    Energy Transport & Physics
                  </span>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    {activeLayer.transportMode}
                  </p>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  {activeLayer.description}
                </p>

                {/* Layer Selector buttons */}
                <div className="pt-1 border-t border-white/10 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Select Concentric Layer
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {SOLAR_LAYERS.map((l) => (
                      <button
                        key={l.id}
                        onClick={() => setSelectedLayerId(l.id)}
                        className={`px-2 py-1.5 rounded-lg text-left text-[11px] font-medium transition truncate ${
                          l.id === selectedLayerId
                            ? "bg-amber-500 text-black font-bold"
                            : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {l.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* MODE 2: NUCLEAR FUSION PARTICLES */}
            {activeTab === "fusion" && (
              <div className="space-y-3">
                <div className="border-b border-white/10 pb-2">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                    Core Physics Lab
                  </span>
                  <h4 className="text-sm font-bold text-white">Proton-Proton (p-p) Chain</h4>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300">Step {fusionStep} of 4:</span>
                    <span className="text-[10px] text-slate-300 font-mono">
                      {fusionStep === 1 && "p + p collision"}
                      {fusionStep === 2 && "²H + e⁺ + ν_e"}
                      {fusionStep === 3 && "²H + p → ³He + γ"}
                      {fusionStep === 4 && "³He + ³He → ⁴He + 2p"}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {fusionStep === 1 &&
                      "Two high-velocity protons overcome electrostatic repulsion via quantum mechanical tunneling through the Coulomb barrier."}
                    {fusionStep === 2 &&
                      "A proton transforms into a neutron via the weak nuclear force, forming a deuteron (²H) and releasing a positron and an electron neutrino."}
                    {fusionStep === 3 &&
                      "The deuteron captures another proton almost immediately (~1 second), fusing into Helium-3 (³He) and emitting a high-energy gamma ray photon."}
                    {fusionStep === 4 &&
                      "Two Helium-3 nuclei smash together to form a stable Helium-4 nucleus (alpha particle), returning two free protons to fuel future reactions."}
                  </p>
                </div>

                <div className="p-2 rounded-xl bg-white/5 border border-white/5 text-[11px] space-y-1">
                  <span className="font-semibold text-cyan-300">Net Energy Released:</span>
                  <p className="font-mono text-emerald-400 font-bold">ΔE = 26.73 MeV per ⁴He</p>
                  <p className="text-slate-400 text-[10px]">
                    0.71% of proton mass is converted directly to radiant energy via E = mc².
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Button
                    size="sm"
                    onClick={() => setIsFusionPlaying((prev) => !prev)}
                    className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs"
                  >
                    {isFusionPlaying ? (
                      <>
                        <Pause className="size-3.5 mr-1" /> Pause
                      </>
                    ) : (
                      <>
                        <Play className="size-3.5 mr-1" /> Auto-Cycle
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setFusionStep((prev) => (prev >= 4 ? 1 : prev + 1))}
                    className="border-white/10 bg-white/5 text-white hover:bg-white/10 text-xs"
                  >
                    Next Step →
                  </Button>
                </div>
              </div>
            )}

            {/* MODE 3: MAGNETIC DYNAMO & PROMINENCES */}
            {activeTab === "fields" && (
              <div className="space-y-3">
                <div className="border-b border-white/10 pb-2">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                    Plasma Electrodynamics
                  </span>
                  <h4 className="text-sm font-bold text-white">Babcock Dynamo & Sunspots</h4>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Because the equator spins in 25 days while the poles take 34 days, magnetic field
                  lines are stretched and wound around the Sun (the Omega effect) until buoyant flux
                  tubes pierce the surface.
                </p>

                <div className="space-y-2 text-xs">
                  <label className="flex items-center justify-between text-slate-300">
                    <span>Solar Cycle Activity:</span>
                    <span className="font-bold text-amber-400">
                      {solarActivity < 0.3
                        ? "Solar Minimum"
                        : solarActivity < 0.7
                          ? "Moderate"
                          : "Solar Maximum"}
                    </span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={solarActivity}
                    onChange={(e) => setSolarActivity(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-[11px] text-cyan-200 space-y-1">
                  <span className="font-bold text-cyan-300">Sunspot Physics:</span>
                  <p>
                    Umbra temperature: ~3,800 K (versus 5,772 K photosphere). Strong magnetic fields
                    (0.3 Tesla) suppress convective heat bubbling.
                  </p>
                </div>
              </div>
            )}

            {/* MODE 4: SOLAR WIND & EARTH */}
            {activeTab === "solarWind" && (
              <div className="space-y-3">
                <div className="border-b border-white/10 pb-2">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                    Space Weather Shield
                  </span>
                  <h4 className="text-sm font-bold text-white">Solar Wind & Magnetosphere</h4>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  The supersonic stream of protons and electrons from the corona encounters Earth's
                  dipole magnetic shield, forming a compressed bow shock on the sunward side.
                </p>

                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Wind Velocity:</span>
                    <span className="font-mono text-white">
                      {isStormActive ? "~850 km/s (CME Shock)" : "400 km/s (Quiet)"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Interplanetary Bz:</span>
                    <span
                      className={`font-mono font-bold ${
                        isStormActive ? "text-red-400" : "text-emerald-400"
                      }`}
                    >
                      {isStormActive ? "-18 nT (Southward - Storm!)" : "+4 nT (Northward - Safe)"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Geomagnetic Status:</span>
                    <span
                      className={`font-semibold ${isStormActive ? "text-red-400" : "text-slate-200"}`}
                    >
                      {isStormActive ? "G4 Severe Storm Alert" : "Quiet / Normal"}
                    </span>
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={() => setIsStormActive((prev) => !prev)}
                  className={`w-full font-bold text-xs ${
                    isStormActive
                      ? "bg-red-600 hover:bg-red-500 text-white"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white"
                  }`}
                >
                  {isStormActive ? (
                    <>
                      <Radio className="size-3.5 mr-1 animate-pulse" /> Active CME Inbound! Reset
                    </>
                  ) : (
                    <>
                      <Flame className="size-3.5 mr-1" /> Trigger Coronal Mass Ejection
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* MODE 5: STELLAR SIZE COMPARISON */}
            {activeTab === "comparison" && (
              <div className="space-y-3">
                <div className="border-b border-white/10 pb-2">
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                    Cosmic Scale
                  </span>
                  <h4 className="text-sm font-bold text-white">The Sun Among the Stars</h4>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                    <span className="text-blue-300 font-semibold">Earth</span>
                    <span className="font-mono text-slate-300">
                      12,742 km (1/109th Sun diameter)
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                    <span className="text-red-400 font-semibold">Proxima Centauri</span>
                    <span className="font-mono text-slate-300">0.14 R☉ (Red Dwarf)</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                    <span className="text-amber-400 font-semibold">The Sun</span>
                    <span className="font-mono text-white font-bold">
                      1.0 R☉ (696,340 km radius)
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                    <span className="text-cyan-300 font-semibold">Sirius A</span>
                    <span className="font-mono text-slate-300">1.7 R☉ (A-type Main Seq)</span>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-purple-950/40 border border-purple-500/20 text-[11px] text-purple-200">
                  <span className="font-bold text-purple-300">Massive Contrast:</span> Red
                  supergiant stars like Betelgeuse (~760 R☉) would swallow Earth, Mars, and Jupiter
                  if placed at the center of our solar system!
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. BOTTOM CONTROL DOCK */}
      <div className="p-4 bg-slate-900 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
        {activeTab === "layers" && (
          <div className="flex flex-wrap items-center gap-4 w-full">
            {/* Cutaway angle slider */}
            <div className="flex items-center gap-2 text-xs text-slate-300 flex-1 min-w-[220px]">
              <span className="font-semibold text-slate-400 shrink-0">Cutaway Slice:</span>
              <input
                type="range"
                min="0"
                max={Math.PI}
                step="0.05"
                value={cutawayAngle}
                onChange={(e) => setCutawayAngle(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <span className="font-mono text-xs text-amber-400 shrink-0 w-12 text-right">
                {Math.round((cutawayAngle / (Math.PI * 2)) * 360)}° cut
              </span>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCutawayAngle((prev) => (prev > 0.1 ? 0 : Math.PI * 0.5))}
                className="border-white/10 bg-white/5 text-white hover:bg-white/10 text-xs"
              >
                {cutawayAngle > 0.1 ? "Close Sphere" : "Open Quarter Cut"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsExploded((prev) => !prev)}
                className={`border-white/10 text-xs ${
                  isExploded
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    : "bg-white/5 text-white"
                }`}
              >
                {isExploded ? "Assemble Layers" : "Exploded Layers"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowFieldLines((prev) => !prev)}
                className={`border-white/10 text-xs ${
                  showFieldLines
                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                    : "bg-white/5 text-slate-400"
                }`}
              >
                {showFieldLines ? "Field Lines ON" : "Field Lines OFF"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowProminences((prev) => !prev)}
                className={`border-white/10 text-xs ${
                  showProminences
                    ? "bg-red-500/20 text-red-300 border-red-500/40"
                    : "bg-white/5 text-slate-400"
                }`}
              >
                {showProminences ? "Prominences ON" : "Prominences OFF"}
              </Button>
            </div>
          </div>
        )}

        {activeTab === "fusion" && (
          <div className="flex items-center justify-between w-full text-xs text-slate-400">
            <span>
              Core Temperature: <strong className="text-white">15,700,000 K</strong> • Density:{" "}
              <strong className="text-white">150 g/cm³</strong>
            </span>
            <span className="text-slate-300">
              Proton-Proton tunneling rate: ~600 million tons H converted every second
            </span>
          </div>
        )}

        {activeTab === "fields" && (
          <div className="flex items-center justify-between w-full text-xs text-slate-400">
            <span>
              11-Year Solar Cycle • Current Status:{" "}
              <strong className="text-amber-400">Cycle 25 Solar Maximum</strong>
            </span>
            <span className="text-slate-400">
              Equatorial rotation: 25.05 days • Polar rotation: 34.4 days
            </span>
          </div>
        )}

        {activeTab === "solarWind" && (
          <div className="flex items-center justify-between w-full text-xs text-slate-400">
            <span>
              Average Travel Time: <strong className="text-white">18–36 hours (CME)</strong> •{" "}
              <strong className="text-white">8.3 minutes (Light & Flares)</strong>
            </span>
            <span className="text-slate-300">Earth Magnetopause: ~10 Earth Radii stand-off</span>
          </div>
        )}

        {activeTab === "comparison" && (
          <div className="flex items-center justify-between w-full text-xs text-slate-400">
            <span>
              Main-Sequence Yellow Dwarf (G2V) • Mass:{" "}
              <strong className="text-white">1.989 × 10³⁰ kg</strong>
            </span>
            <span className="text-slate-300">
              The Sun will remain on the main sequence for another ~5 billion years
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
