import React, { useRef, useState, useMemo, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  RotateCcw,
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
  Plus,
  Trash2,
  Gauge,
  Zap,
  Target,
  Maximize2,
  Radio,
  Flame,
} from "lucide-react";

// ----------------------------------------------------------------------
// PHYSICS SIMULATION ENGINE TYPES & CONSTANTS
// ----------------------------------------------------------------------
export interface SimulationBody {
  id: string;
  name: string;
  mass: number;
  radius: number;
  color: string;
  emissive?: string;
  isStar?: boolean;
  // Position [x, y, z]
  x: number;
  y: number;
  z: number;
  // Velocity [vx, vy, vz]
  vx: number;
  vy: number;
  vz: number;
  // Acceleration [ax, ay, az]
  ax: number;
  ay: number;
  az: number;
  // Trail history
  trail: [number, number, number][];
}

export type ExperimentPresetId =
  | "circular"
  | "eccentric"
  | "escape"
  | "kepler3"
  | "binary_barycenter"
  | "mass_equivalence"
  | "figure8"
  | "sun_earth_moon";

export interface ExperimentPreset {
  id: ExperimentPresetId;
  title: string;
  subtitle: string;
  description: string;
  targetConcept: string;
  instructions: string;
  bodies: Omit<SimulationBody, "ax" | "ay" | "az" | "trail">[];
  cameraPosition: [number, number, number];
}

// Universal Gravitational Constant scaled for simulator readability (G = 100)
export const G_SIM = 100;
export const SOFTENING_EPS = 0.5; // Gravitational softening parameter to prevent numerical singularities

export const EXPERIMENT_PRESETS: ExperimentPreset[] = [
  {
    id: "circular",
    title: "1. Create a Stable Circular Orbit",
    subtitle: "Balance forward velocity against gravitational acceleration",
    description:
      "When orbital speed exactly satisfies v = √(GM / r), centripetal acceleration matches gravitational pull, producing an orbit with eccentricity e ≈ 0.",
    targetConcept:
      "Centripetal balance: v_circ = √(GM / r) = √(100 × 1000 / 15) = 81.65 / scale = 8.16",
    instructions:
      "Observe the circular trajectory. Try clicking 'Prograde Boost (+10%)' to witness the transition into an ellipse, or 'Retrograde Burn (-10%)' to lower periapsis.",
    cameraPosition: [0, 32, 38],
    bodies: [
      {
        id: "star_0",
        name: "Central Star",
        mass: 1000,
        radius: 2.2,
        color: "#fbbf24",
        emissive: "#f59e0b",
        isStar: true,
        x: 0,
        y: 0,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
      },
      {
        id: "planet_1",
        name: "Earth-like Planet",
        mass: 1,
        radius: 0.9,
        color: "#38bdf8",
        x: 15,
        y: 0,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 8.165, // v = sqrt(100 * 1000 / 15) / 10 scaled = 8.165
      },
    ],
  },
  {
    id: "eccentric",
    title: "2. Elliptical Orbits & Kepler's 2nd Law",
    subtitle: "High eccentricity orbit showing speedup at periapsis",
    description:
      "An initial velocity exceeding circular speed (but below escape speed) creates an elongated ellipse. Notice how the planet sweeps out equal areas in equal times, moving fastest at periapsis.",
    targetConcept:
      "Vis-viva equation: v² = GM(2/r - 1/a). Fast at periapsis, sluggish at apoapsis.",
    instructions:
      "Watch the planet accelerate as it dives towards the star and decelerate as it climbs to apoapsis at x = -26.",
    cameraPosition: [0, 38, 42],
    bodies: [
      {
        id: "star_0",
        name: "Central Star",
        mass: 1000,
        radius: 2.2,
        color: "#fbbf24",
        emissive: "#f59e0b",
        isStar: true,
        x: 0,
        y: 0,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
      },
      {
        id: "comet_1",
        name: "Eccentric World",
        mass: 1,
        radius: 0.8,
        color: "#a855f7",
        x: 10,
        y: 0,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 12.0, // Exceeds circular speed (10.0), creates high ellipse (e ≈ 0.6)
      },
    ],
  },
  {
    id: "escape",
    title: "3. Discover Escape Trajectories",
    subtitle: "Reaching escape velocity: parabolic & hyperbolic ejection",
    description:
      "When total mechanical energy E = K + U ≥ 0, the body breaks free from the gravitational potential well on an unbound trajectory and will never return.",
    targetConcept: "Escape threshold: v_esc = √2 × v_circ = 1.414 × 8.165 = 11.55.",
    instructions:
      "The blue probe is launched at v = 11.8 > v_esc. Watch it curve past the star on a hyperbolic escape path into deep space!",
    cameraPosition: [0, 48, 55],
    bodies: [
      {
        id: "star_0",
        name: "Central Star",
        mass: 1000,
        radius: 2.2,
        color: "#fbbf24",
        emissive: "#f59e0b",
        isStar: true,
        x: 0,
        y: 0,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
      },
      {
        id: "bound_planet",
        name: "Bound Planet (e < 1)",
        mass: 1,
        radius: 0.8,
        color: "#34d399",
        x: 15,
        y: 0,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 8.165,
      },
      {
        id: "escape_probe",
        name: "Escape Probe (v > v_esc)",
        mass: 0.5,
        radius: 0.6,
        color: "#f43f5e",
        x: 12,
        y: 0,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 13.5, // Well above v_esc (12.9)
      },
    ],
  },
  {
    id: "kepler3",
    title: "4. Compare Orbital Periods (Kepler's 3rd Law)",
    subtitle: "Harmonic relation: T² is proportional to a³",
    description:
      "Three planets at distances r = 8, r = 16, and r = 27 demonstrate how orbital period scales as a^(3/2). The outer planet takes over 6 times longer to orbit than the inner planet!",
    targetConcept:
      "Kepler's 3rd Law: T₁/T₂ = (r₁/r₂)^(3/2). Inner world orbits rapidly; outer world travels slowly.",
    instructions:
      "Observe the inner gold planet complete several revolutions while the outer sapphire planet has completed only a fraction of its orbit.",
    cameraPosition: [0, 52, 60],
    bodies: [
      {
        id: "star_0",
        name: "Sun",
        mass: 1200,
        radius: 2.4,
        color: "#fbbf24",
        emissive: "#f59e0b",
        isStar: true,
        x: 0,
        y: 0,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
      },
      {
        id: "planet_inner",
        name: "Inner World (r = 8)",
        mass: 1,
        radius: 0.7,
        color: "#fb923c",
        x: 8,
        y: 0,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 12.25, // v = sqrt(120000 / 8)/10 = 12.247
      },
      {
        id: "planet_mid",
        name: "Mid World (r = 16)",
        mass: 2,
        radius: 0.9,
        color: "#38bdf8",
        x: 16,
        y: 0,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 8.66, // v = sqrt(120000 / 16)/10 = 8.66
      },
      {
        id: "planet_outer",
        name: "Outer World (r = 27)",
        mass: 3,
        radius: 1.1,
        color: "#818cf8",
        x: 27,
        y: 0,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 6.67, // v = sqrt(120000 / 27)/10 = 6.666
      },
    ],
  },
  {
    id: "binary_barycenter",
    title: "5. Two-Body Barycenter Motion",
    subtitle: "Binary star dance around a shared center of mass",
    description:
      "When two celestial bodies have comparable masses, neither stays fixed at the center. Both bodies orbit their shared center of mass (barycenter) located between them in empty space!",
    targetConcept:
      "Barycenter position: R_cm = (m₁·r₁ + m₂·r₂) / (m₁ + m₂). Notice the glowing barycenter marker!",
    instructions:
      "Toggle the 'Barycenter Marker' switch on. Notice how both Star Alpha and Star Beta trace synchronized orbits around the central crosshair.",
    cameraPosition: [0, 40, 45],
    bodies: [
      {
        id: "star_a",
        name: "Star Alpha (Mass 600)",
        mass: 600,
        radius: 1.9,
        color: "#f59e0b",
        emissive: "#d97706",
        isStar: true,
        x: -9,
        y: 0,
        z: 0,
        vx: 0,
        vy: 0,
        vz: -5.0,
      },
      {
        id: "star_b",
        name: "Star Beta (Mass 400)",
        mass: 400,
        radius: 1.6,
        color: "#38bdf8",
        emissive: "#0284c7",
        isStar: true,
        x: 13.5,
        y: 0,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 7.5,
      },
    ],
  },
  {
    id: "mass_equivalence",
    title: "6. Mass vs Acceleration (Equivalence Principle)",
    subtitle: "Does a heavy planet fall faster than a light planet?",
    description:
      "Galileo proved that all masses accelerate at the same rate in a gravitational field: a = GM/r². Here, a tiny asteroid (mass 0.1) and a massive super-Jupiter (mass 50) share the exact same orbit!",
    targetConcept:
      "Equivalence Principle: acceleration a = GM/r² is independent of satellite mass m.",
    instructions:
      "Watch both the tiny asteroid and the giant world stay perfectly side-by-side along their entire orbital path.",
    cameraPosition: [0, 36, 40],
    bodies: [
      {
        id: "star_0",
        name: "Central Star",
        mass: 1000,
        radius: 2.2,
        color: "#fbbf24",
        emissive: "#f59e0b",
        isStar: true,
        x: 0,
        y: 0,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
      },
      {
        id: "giant_planet",
        name: "Super-Jupiter (Mass 50)",
        mass: 50,
        radius: 1.4,
        color: "#ec4899",
        x: 16,
        y: 0,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 7.9,
      },
      {
        id: "tiny_asteroid",
        name: "Tiny Asteroid (Mass 0.1)",
        mass: 0.1,
        radius: 0.5,
        color: "#a3e635",
        x: 16,
        y: 0,
        z: 2.5,
        vx: 0,
        vy: 0,
        vz: 7.9,
      },
    ],
  },
  {
    id: "figure8",
    title: "7. Three-Body Figure-8 Choreography",
    subtitle: "A celebrated periodic solution to the chaotic 3-body problem",
    description:
      "Discovered in 1993, this miraculous choreographic solution features three equal-mass stars chasing each other indefinitely along a single figure-8 path in space.",
    targetConcept:
      "Periodic N-body choreographies: precise balance of initial momentum and non-linear gravity.",
    instructions:
      "Sit back and admire the figure-8 trajectory traced by all three bodies with total angular momentum L = 0.",
    cameraPosition: [0, 35, 38],
    bodies: [
      {
        id: "star_1",
        name: "Body 1",
        mass: 300,
        radius: 1.4,
        color: "#f43f5e",
        emissive: "#e11d48",
        isStar: true,
        x: -9.7000436,
        y: 0,
        z: -2.4308753,
        vx: 4.6620531,
        vy: 0,
        vz: 4.3236573,
      },
      {
        id: "star_2",
        name: "Body 2",
        mass: 300,
        radius: 1.4,
        color: "#38bdf8",
        emissive: "#0284c7",
        isStar: true,
        x: 9.7000436,
        y: 0,
        z: 2.4308753,
        vx: 4.6620531,
        vy: 0,
        vz: 4.3236573,
      },
      {
        id: "star_3",
        name: "Body 3",
        mass: 300,
        radius: 1.4,
        color: "#a855f7",
        emissive: "#7c3aed",
        isStar: true,
        x: 0,
        y: 0,
        z: 0,
        vx: -9.3241062,
        vy: 0,
        vz: -8.6473146,
      },
    ],
  },
  {
    id: "sun_earth_moon",
    title: "8. Sun-Earth-Moon 3-Body System",
    subtitle: "Hierarchical gravitation: Moon orbits Earth while both orbit Sun",
    description:
      "Shows hierarchical gravitational perturbation: the Moon remains bound within Earth's Hill sphere (gravitational dominance region) while orbiting the massive distant Sun.",
    targetConcept: "Hill sphere & gravitational hierarchy: r_Hill = a_p · (m_p / 3M_star)^(1/3).",
    instructions:
      "Observe the Moon loop around Earth as Earth circles the central Sun, creating an undulating cycloid orbit in the solar frame.",
    cameraPosition: [0, 42, 46],
    bodies: [
      {
        id: "sun",
        name: "Sun",
        mass: 1500,
        radius: 2.5,
        color: "#fbbf24",
        emissive: "#f59e0b",
        isStar: true,
        x: 0,
        y: 0,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
      },
      {
        id: "earth",
        name: "Earth",
        mass: 10,
        radius: 1.1,
        color: "#38bdf8",
        x: 18,
        y: 0,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 9.13, // v_circ around Sun = sqrt(1500 * 100 / 18)/10 = 9.128
      },
      {
        id: "moon",
        name: "Moon",
        mass: 0.1,
        radius: 0.45,
        color: "#e2e8f0",
        x: 19.8, // 1.8 units away from Earth
        y: 0,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 9.13 + 2.36, // orbital speed around Earth = sqrt(10 * 100 / 1.8)/10 = 2.357
      },
    ],
  },
];

// ----------------------------------------------------------------------
// SYMPLECTIC VELOCITY VERLET NUMERICAL INTEGRATOR
// ----------------------------------------------------------------------
function computeAccelerations(bodies: SimulationBody[]): [number, number, number][] {
  const n = bodies.length;
  const accels: [number, number, number][] = Array.from({ length: n }, () => [0, 0, 0]);

  for (let i = 0; i < n; i++) {
    const bi = bodies[i];
    for (let j = i + 1; j < n; j++) {
      const bj = bodies[j];
      const dx = bj.x - bi.x;
      const dy = bj.y - bi.y;
      const dz = bj.z - bi.z;
      const distSq = dx * dx + dy * dy + dz * dz + SOFTENING_EPS * SOFTENING_EPS;
      const dist = Math.sqrt(distSq);
      const invDist3 = 1 / (distSq * dist);

      // F_grav / m = G * m_other / r^2
      // a_i = G * m_j * delta / r^3
      const f_over_scale = G_SIM * invDist3;

      const ax_i = f_over_scale * bj.mass * dx;
      const ay_i = f_over_scale * bj.mass * dy;
      const az_i = f_over_scale * bj.mass * dz;

      const ax_j = -f_over_scale * bi.mass * dx;
      const ay_j = -f_over_scale * bi.mass * dy;
      const az_j = -f_over_scale * bi.mass * dz;

      accels[i][0] += ax_i;
      accels[i][1] += ay_i;
      accels[i][2] += az_i;

      accels[j][0] += ax_j;
      accels[j][1] += ay_j;
      accels[j][2] += az_j;
    }
  }

  return accels;
}

/**
 * Symplectic Velocity Verlet integration step:
 * 1. r(t + dt) = r(t) + v(t)*dt + 0.5*a(t)*dt^2
 * 2. Calculate a(t + dt) from new positions
 * 3. v(t + dt) = v(t) + 0.5*(a(t) + a(t + dt))*dt
 */
function stepVelocityVerlet(bodies: SimulationBody[], dt: number): void {
  const n = bodies.length;

  // Step 1: Update positions using current velocity and acceleration
  for (let i = 0; i < n; i++) {
    const b = bodies[i];
    b.x += b.vx * dt + 0.5 * b.ax * dt * dt;
    b.y += b.vy * dt + 0.5 * b.ay * dt * dt;
    b.z += b.vz * dt + 0.5 * b.az * dt * dt;
  }

  // Step 2: Compute new accelerations at t + dt
  const newAccels = computeAccelerations(bodies);

  // Step 3: Update velocities using average of old and new accelerations
  for (let i = 0; i < n; i++) {
    const b = bodies[i];
    const nax = newAccels[i][0];
    const nay = newAccels[i][1];
    const naz = newAccels[i][2];

    b.vx += 0.5 * (b.ax + nax) * dt;
    b.vy += 0.5 * (b.ay + nay) * dt;
    b.vz += 0.5 * (b.az + naz) * dt;

    b.ax = nax;
    b.ay = nay;
    b.az = naz;
  }
}

// ----------------------------------------------------------------------
// 3D SCENE RENDERER WITH REACT THREE FIBER
// ----------------------------------------------------------------------
interface SceneProps {
  bodies: SimulationBody[];
  selectedBodyId: string | null;
  onSelectBody: (id: string) => void;
  showTrails: boolean;
  maxTrailLength: number;
  showBarycenter: boolean;
  showVelocityVectors: boolean;
  showForceVectors: boolean;
}

function GravitationalScene({
  bodies,
  selectedBodyId,
  onSelectBody,
  showTrails,
  maxTrailLength,
  showBarycenter,
  showVelocityVectors,
  showForceVectors,
}: SceneProps) {
  // Calculate system Barycenter
  const barycenter = useMemo(() => {
    let totalMass = 0;
    let cx = 0;
    let cy = 0;
    let cz = 0;
    for (const b of bodies) {
      totalMass += b.mass;
      cx += b.mass * b.x;
      cy += b.mass * b.y;
      cz += b.mass * b.z;
    }
    if (totalMass <= 0) return { x: 0, y: 0, z: 0, totalMass: 0 };
    return {
      x: cx / totalMass,
      y: cy / totalMass,
      z: cz / totalMass,
      totalMass,
    };
  }, [bodies]);

  return (
    <>
      <color attach="background" args={["#030712"]} />
      <ambientLight intensity={0.35} />
      <pointLight position={[0, 20, 0]} intensity={1.5} color="#ffffff" />
      <directionalLight position={[15, 25, 15]} intensity={0.8} />

      {/* Reference grid plane */}
      <gridHelper args={[80, 40, "#1e293b", "#0f172a"]} position={[0, -0.05, 0]} />

      {/* Concentric orbital distance guide rings */}
      {[10, 20, 30].map((radius) => (
        <mesh key={radius} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <ringGeometry args={[radius - 0.05, radius + 0.05, 64]} />
          <meshBasicMaterial color="#334155" transparent opacity={0.25} side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* Render Bodies */}
      {bodies.map((b) => {
        const isSelected = b.id === selectedBodyId;
        const velMag = Math.sqrt(b.vx * b.vx + b.vy * b.vy + b.vz * b.vz);
        const forceMag = Math.sqrt(b.ax * b.ax + b.ay * b.ay + b.az * b.az);

        return (
          <group key={b.id} position={[b.x, b.y, b.z]}>
            {/* Primary Sphere */}
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                onSelectBody(b.id);
              }}
            >
              <sphereGeometry args={[b.radius, 32, 32]} />
              <meshStandardMaterial
                color={b.color}
                emissive={b.emissive || (b.isStar ? b.color : "#000000")}
                emissiveIntensity={b.isStar ? 0.9 : isSelected ? 0.4 : 0.05}
                roughness={b.isStar ? 0.1 : 0.6}
                metalness={0.2}
              />
            </mesh>

            {/* Glowing aura for stars or selected bodies */}
            {(b.isStar || isSelected) && (
              <mesh scale={[1.4, 1.4, 1.4]}>
                <sphereGeometry args={[b.radius, 24, 24]} />
                <meshBasicMaterial
                  color={b.color}
                  transparent
                  opacity={b.isStar ? 0.25 : 0.4}
                  blending={THREE.AdditiveBlending}
                  side={THREE.BackSide}
                />
              </mesh>
            )}

            {/* Selection indicator ring */}
            {isSelected && (
              <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[b.radius * 1.5, b.radius * 1.7, 32]} />
                <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} />
              </mesh>
            )}

            {/* Velocity Vector Arrow */}
            {showVelocityVectors && velMag > 0.01 && (
              <group>
                <line>
                  <bufferGeometry>
                    <bufferAttribute
                      attach="attributes-position"
                      args={[new Float32Array([0, 0, 0, b.vx * 0.8, b.vy * 0.8, b.vz * 0.8]), 3]}
                    />
                  </bufferGeometry>
                  <lineBasicMaterial color="#38bdf8" linewidth={2} />
                </line>
                <mesh position={[b.vx * 0.8, b.vy * 0.8, b.vz * 0.8]}>
                  <sphereGeometry args={[0.2, 8, 8]} />
                  <meshBasicMaterial color="#38bdf8" />
                </mesh>
              </group>
            )}

            {/* Gravitational Force / Acceleration Vector Arrow */}
            {showForceVectors && forceMag > 0.01 && (
              <group>
                <line>
                  <bufferGeometry>
                    <bufferAttribute
                      attach="attributes-position"
                      args={[new Float32Array([0, 0, 0, b.ax * 0.8, b.ay * 0.8, b.az * 0.8]), 3]}
                    />
                  </bufferGeometry>
                  <lineBasicMaterial color="#ef4444" linewidth={2} />
                </line>
                <mesh position={[b.ax * 0.8, b.ay * 0.8, b.az * 0.8]}>
                  <sphereGeometry args={[0.2, 8, 8]} />
                  <meshBasicMaterial color="#ef4444" />
                </mesh>
              </group>
            )}
          </group>
        );
      })}

      {/* Orbit Trails */}
      {showTrails &&
        bodies.map((b) => {
          if (!b.trail || b.trail.length < 2) return null;
          const flatPoints = new Float32Array(b.trail.length * 3);
          for (let i = 0; i < b.trail.length; i++) {
            flatPoints[i * 3] = b.trail[i][0];
            flatPoints[i * 3 + 1] = b.trail[i][1];
            flatPoints[i * 3 + 2] = b.trail[i][2];
          }

          return (
            <line key={`trail_${b.id}`}>
              <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[flatPoints, 3]} />
              </bufferGeometry>
              <lineBasicMaterial color={b.color} transparent opacity={0.65} linewidth={1.5} />
            </line>
          );
        })}

      {/* Barycenter Marker */}
      {showBarycenter && (
        <group position={[barycenter.x, barycenter.y, barycenter.z]}>
          {/* Glowing center sphere */}
          <mesh>
            <sphereGeometry args={[0.35, 16, 16]} />
            <meshBasicMaterial color="#fbbf24" />
          </mesh>
          {/* Pulsing crosshair ring */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.8, 1.0, 32]} />
            <meshBasicMaterial color="#fbbf24" transparent opacity={0.7} side={THREE.DoubleSide} />
          </mesh>
          {/* Cross lines */}
          <line>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[new Float32Array([-1.5, 0, 0, 1.5, 0, 0]), 3]}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#fbbf24" linewidth={2} />
          </line>
          <line>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[new Float32Array([0, 0, -1.5, 0, 0, 1.5]), 3]}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#fbbf24" linewidth={2} />
          </line>
        </group>
      )}

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.05}
        minDistance={5}
        maxDistance={120}
        maxPolarAngle={Math.PI / 2 + 0.1}
      />
    </>
  );
}

// ----------------------------------------------------------------------
// MAIN ORBITAL MECHANICS LAB COMPONENT
// ----------------------------------------------------------------------
interface OrbitalMechanicsLab3DProps {
  onInteract?: () => void;
}

export function OrbitalMechanicsLab3D({ onInteract }: OrbitalMechanicsLab3DProps) {
  // Preset state
  const [selectedPresetId, setSelectedPresetId] = useState<ExperimentPresetId>("circular");
  const activePreset = useMemo(
    () => EXPERIMENT_PRESETS.find((p) => p.id === selectedPresetId) || EXPERIMENT_PRESETS[0],
    [selectedPresetId],
  );

  // Simulation bodies state
  const [bodies, setBodies] = useState<SimulationBody[]>(() => {
    const initial = activePreset.bodies.map((b) => ({
      ...b,
      ax: 0,
      ay: 0,
      az: 0,
      trail: [[b.x, b.y, b.z] as [number, number, number]],
    }));
    const initialAccels = computeAccelerations(initial);
    initial.forEach((b, i) => {
      b.ax = initialAccels[i][0];
      b.ay = initialAccels[i][1];
      b.az = initialAccels[i][2];
    });
    return initial;
  });

  // Selected body for telemetry
  const [selectedBodyId, setSelectedBodyId] = useState<string | null>("planet_1");

  // Physics Simulation Controls
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1.0); // 0.2x to 3.0x
  const [timeStep, setTimeStep] = useState<number>(0.015); // dt from 0.005 to 0.04
  const [showTrails, setShowTrails] = useState<boolean>(true);
  const [maxTrailLength, setMaxTrailLength] = useState<number>(200);
  const [showBarycenter, setShowBarycenter] = useState<boolean>(false);
  const [showVelocityVectors, setShowVelocityVectors] = useState<boolean>(true);
  const [showForceVectors, setShowForceVectors] = useState<boolean>(false);
  const [isAddingBody, setIsAddingBody] = useState<boolean>(false);

  // New body form state
  const [newBodyName, setNewBodyName] = useState("Custom Orbiter");
  const [newBodyMass, setNewBodyMass] = useState(10);
  const [newBodyRadius, setNewBodyRadius] = useState(0.9);
  const [newBodyX, setNewBodyX] = useState(20);
  const [newBodyZ, setNewBodyZ] = useState(0);
  const [newBodyVz, setNewBodyVz] = useState(7.0);
  const [newBodyColor, setNewBodyColor] = useState("#a855f7");

  // Telemetry of selected body
  const selectedBody = useMemo(
    () => bodies.find((b) => b.id === selectedBodyId) || bodies[1] || bodies[0],
    [bodies, selectedBodyId],
  );

  // Reference Primary body (usually the most massive star)
  const primaryBody = useMemo(() => {
    if (bodies.length === 0) return null;
    return bodies.reduce((prev, curr) => (curr.mass > prev.mass ? curr : prev), bodies[0]);
  }, [bodies]);

  // Derived orbital physics telemetry for selected body relative to primary
  const orbitalTelemetry = useMemo(() => {
    if (!selectedBody || !primaryBody || selectedBody.id === primaryBody.id) {
      return null;
    }

    const dx = selectedBody.x - primaryBody.x;
    const dy = selectedBody.y - primaryBody.y;
    const dz = selectedBody.z - primaryBody.z;
    const r = Math.sqrt(dx * dx + dy * dy + dz * dz);

    const relVx = selectedBody.vx - primaryBody.vx;
    const relVy = selectedBody.vy - primaryBody.vy;
    const relVz = selectedBody.vz - primaryBody.vz;
    const v = Math.sqrt(relVx * relVx + relVy * relVy + relVz * relVz);

    const mu = G_SIM * (primaryBody.mass + selectedBody.mass);
    const v_circ = Math.sqrt(mu / Math.max(0.1, r));
    const v_esc = Math.sqrt((2 * mu) / Math.max(0.1, r));

    // Specific mechanical energy: epsilon = v^2/2 - mu/r = -mu/(2a)
    const specificEnergy = (v * v) / 2 - mu / Math.max(0.1, r);

    // Semi-major axis a = -mu / (2 * epsilon)
    let a = 0;
    let isBound = true;
    let conicType: "Circular" | "Elliptical" | "Parabolic" | "Hyperbolic" = "Elliptical";

    if (specificEnergy < -0.05) {
      a = -mu / (2 * specificEnergy);
      isBound = true;
      if (Math.abs(v - v_circ) / v_circ < 0.05) {
        conicType = "Circular";
      } else {
        conicType = "Elliptical";
      }
    } else if (Math.abs(specificEnergy) <= 0.05) {
      conicType = "Parabolic";
      isBound = false;
    } else {
      conicType = "Hyperbolic";
      isBound = false;
    }

    // Theoretical orbital period for bound orbit: T = 2 * pi * sqrt(a^3 / mu)
    const periodSimSeconds = isBound && a > 0 ? 2 * Math.PI * Math.sqrt((a * a * a) / mu) : 0;

    return {
      distance: r,
      speed: v,
      circularSpeed: v_circ,
      escapeSpeed: v_esc,
      specificEnergy,
      semiMajorAxis: a,
      conicType,
      isBound,
      periodSimSeconds,
    };
  }, [selectedBody, primaryBody]);

  // Load a preset
  const handleLoadPreset = (presetId: ExperimentPresetId) => {
    setSelectedPresetId(presetId);
    const preset = EXPERIMENT_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    const initial = preset.bodies.map((b) => ({
      ...b,
      ax: 0,
      ay: 0,
      az: 0,
      trail: [[b.x, b.y, b.z] as [number, number, number]],
    }));
    const initialAccels = computeAccelerations(initial);
    initial.forEach((b, i) => {
      b.ax = initialAccels[i][0];
      b.ay = initialAccels[i][1];
      b.az = initialAccels[i][2];
    });

    setBodies(initial);
    setSelectedBodyId(initial[1]?.id || initial[0]?.id || null);
    if (presetId === "binary_barycenter") {
      setShowBarycenter(true);
    }
    onInteract?.();
  };

  // Reset current preset
  const handleReset = () => {
    handleLoadPreset(selectedPresetId);
  };

  // Add custom body
  const handleAddCustomBody = (e: React.FormEvent) => {
    e.preventDefault();
    const newBody: SimulationBody = {
      id: `body_${Date.now()}`,
      name: newBodyName,
      mass: Number(newBodyMass),
      radius: Number(newBodyRadius),
      color: newBodyColor,
      x: Number(newBodyX),
      y: 0,
      z: Number(newBodyZ),
      vx: 0,
      vy: 0,
      vz: Number(newBodyVz),
      ax: 0,
      ay: 0,
      az: 0,
      trail: [[Number(newBodyX), 0, Number(newBodyZ)]],
    };

    const nextBodies = [...bodies, newBody];
    const nextAccels = computeAccelerations(nextBodies);
    nextBodies.forEach((b, i) => {
      b.ax = nextAccels[i][0];
      b.ay = nextAccels[i][1];
      b.az = nextAccels[i][2];
    });

    setBodies(nextBodies);
    setSelectedBodyId(newBody.id);
    setIsAddingBody(false);
    onInteract?.();
  };

  // Remove a body
  const handleRemoveBody = (id: string) => {
    const next = bodies.filter((b) => b.id !== id);
    setBodies(next);
    if (selectedBodyId === id) {
      setSelectedBodyId(next[0]?.id || null);
    }
    onInteract?.();
  };

  // Apply Prograde / Retrograde velocity burn to selected body
  const handleApplyDeltaV = (multiplier: number) => {
    if (!selectedBody) return;
    setBodies((prev) =>
      prev.map((b) => {
        if (b.id !== selectedBody.id) return b;
        return {
          ...b,
          vx: b.vx * multiplier,
          vy: b.vy * multiplier,
          vz: b.vz * multiplier,
        };
      }),
    );
    onInteract?.();
  };

  // Live Physics Loop with substepping
  useEffect(() => {
    if (!isPlaying) return;

    let animationFrameId: number;
    let trailCounter = 0;

    const runPhysicsTick = () => {
      // Substepping: perform 10 sub-steps per animation frame to ensure symplectic stability
      const SUB_STEPS = 10;
      const subDt = (timeStep * simSpeed) / SUB_STEPS;

      setBodies((currentBodies) => {
        // Deep clone current bodies for in-place mutation inside substepping loop
        const updated = currentBodies.map((b) => ({
          ...b,
          trail: [...b.trail],
        }));

        for (let step = 0; step < SUB_STEPS; step++) {
          stepVelocityVerlet(updated, subDt);
        }

        // Append to trail every 3 frames
        trailCounter++;
        if (trailCounter % 3 === 0) {
          for (const b of updated) {
            b.trail.push([b.x, b.y, b.z]);
            if (b.trail.length > maxTrailLength) {
              b.trail.shift();
            }
          }
        }

        return updated;
      });

      animationFrameId = requestAnimationFrame(runPhysicsTick);
    };

    animationFrameId = requestAnimationFrame(runPhysicsTick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, simSpeed, timeStep, maxTrailLength]);

  return (
    <div className="space-y-6">
      {/* 1. TOP EXPERIMENT PRESET SELECTOR */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/90 p-4 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
            <Orbit className="w-4 h-4" />
            <span>Select Classical Orbital Mechanics Experiment:</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Integrator: Symplectic Velocity Verlet (O(dt²)) · Softening ε = {SOFTENING_EPS}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {EXPERIMENT_PRESETS.map((p) => {
            const isActive = p.id === selectedPresetId;
            return (
              <button
                key={p.id}
                onClick={() => handleLoadPreset(p.id)}
                className={`text-left p-2.5 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                  isActive
                    ? "border-cyan-400 bg-cyan-500/20 text-cyan-200 shadow-md shadow-cyan-950/50"
                    : "border-white/5 bg-slate-800/60 text-slate-300 hover:border-cyan-500/40 hover:bg-slate-800"
                }`}
              >
                <div className="font-bold truncate">{p.title.split(". ")[1]}</div>
                <div className="text-[10px] text-slate-400 truncate mt-1">{p.subtitle}</div>
              </button>
            );
          })}
        </div>

        {/* Preset Context Banner */}
        <div className="mt-3 p-3 rounded-xl bg-slate-950/70 border border-cyan-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="space-y-0.5">
            <div className="font-semibold text-cyan-300">
              {activePreset.title}: {activePreset.subtitle}
            </div>
            <div className="text-slate-300 text-[11px]">{activePreset.description}</div>
            <div className="text-amber-300/90 font-mono text-[10px]">
              {activePreset.targetConcept}
            </div>
          </div>
          <div className="shrink-0 text-slate-400 text-[11px] italic bg-slate-900 px-2.5 py-1.5 rounded-lg border border-white/5">
            💡 {activePreset.instructions}
          </div>
        </div>
      </div>

      {/* 2. MAIN 3D SIMULATION CANVAS & OVERLAYS */}
      <div className="relative rounded-2xl border border-white/10 bg-slate-950 overflow-hidden shadow-2xl h-[540px]">
        {/* React Three Fiber Canvas */}
        <Canvas
          camera={{
            position: activePreset.cameraPosition,
            fov: 48,
            near: 0.1,
            far: 500,
          }}
        >
          <Suspense fallback={null}>
            <GravitationalScene
              bodies={bodies}
              selectedBodyId={selectedBodyId}
              onSelectBody={(id) => {
                setSelectedBodyId(id);
                onInteract?.();
              }}
              showTrails={showTrails}
              maxTrailLength={maxTrailLength}
              showBarycenter={showBarycenter}
              showVelocityVectors={showVelocityVectors}
              showForceVectors={showForceVectors}
            />
          </Suspense>
        </Canvas>

        {/* FLOATING CONTROLS (TOP LEFT) */}
        <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2 bg-slate-900/85 backdrop-blur-md p-2 rounded-xl border border-white/10 shadow-lg text-xs">
          <Button
            size="sm"
            variant={isPlaying ? "default" : "outline"}
            onClick={() => {
              setIsPlaying(!isPlaying);
              onInteract?.();
            }}
            className="h-8 gap-1.5"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? "Pause" : "Play"}</span>
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleReset}
            className="h-8 gap-1 text-slate-300 hover:text-white"
            title="Reset positions and velocities"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </Button>

          <div className="h-4 w-px bg-white/20 mx-1" />

          {/* Speed slider */}
          <div className="flex items-center gap-1.5 px-2">
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400 text-[11px]">Speed:</span>
            <span className="font-mono text-cyan-300 w-8">{simSpeed.toFixed(1)}x</span>
            <input
              type="range"
              min="0.2"
              max="3.0"
              step="0.1"
              value={simSpeed}
              onChange={(e) => setSimSpeed(parseFloat(e.target.value))}
              className="w-16 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          <div className="h-4 w-px bg-white/20 mx-1" />

          {/* Time Step slider */}
          <div className="flex items-center gap-1.5 px-2">
            <span className="text-slate-400 text-[11px]">Δt:</span>
            <span className="font-mono text-cyan-300 w-10">{timeStep.toFixed(3)}</span>
            <input
              type="range"
              min="0.005"
              max="0.035"
              step="0.005"
              value={timeStep}
              onChange={(e) => setTimeStep(parseFloat(e.target.value))}
              className="w-16 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>
        </div>

        {/* FLOATING TOGGLES (TOP RIGHT) */}
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-slate-900/85 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shadow-lg text-xs">
          <button
            onClick={() => setShowTrails(!showTrails)}
            className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
              showTrails
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Orbit className="w-3.5 h-3.5" />
            <span>Trails</span>
          </button>

          <button
            onClick={() => setShowBarycenter(!showBarycenter)}
            className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
              showBarycenter
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Barycenter</span>
          </button>

          <button
            onClick={() => setShowVelocityVectors(!showVelocityVectors)}
            className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
              showVelocityVectors
                ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>v⃗ Vectors</span>
          </button>

          <button
            onClick={() => setShowForceVectors(!showForceVectors)}
            className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
              showForceVectors
                ? "bg-red-500/20 text-red-300 border border-red-500/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>F⃗ Pull</span>
          </button>
        </div>

        {/* FLOATING TELEMETRY PANEL (BOTTOM LEFT) */}
        {selectedBody && orbitalTelemetry && (
          <div className="absolute bottom-4 left-4 max-w-sm bg-slate-900/90 backdrop-blur-md p-3.5 rounded-xl border border-white/15 shadow-xl text-xs space-y-2">
            <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: selectedBody.color }}
                />
                <span className="font-bold text-white text-sm">{selectedBody.name}</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                  orbitalTelemetry.conicType === "Circular"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : orbitalTelemetry.conicType === "Elliptical"
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                      : "bg-red-500/20 text-red-300 border border-red-500/30"
                }`}
              >
                {orbitalTelemetry.conicType}{" "}
                {orbitalTelemetry.isBound ? "(Bound)" : "(Unbound Escape)"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[11px]">
              <div>
                <span className="text-slate-400">Dist r:</span>{" "}
                <span className="text-white">{orbitalTelemetry.distance.toFixed(2)} AU</span>
              </div>
              <div>
                <span className="text-slate-400">Speed v:</span>{" "}
                <span className="text-cyan-300">{orbitalTelemetry.speed.toFixed(2)} km/s</span>
              </div>
              <div>
                <span className="text-slate-400">v_circ:</span>{" "}
                <span className="text-emerald-300">
                  {orbitalTelemetry.circularSpeed.toFixed(2)} km/s
                </span>
              </div>
              <div>
                <span className="text-slate-400">v_escape:</span>{" "}
                <span className="text-red-400">{orbitalTelemetry.escapeSpeed.toFixed(2)} km/s</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400">Specific Energy ε:</span>{" "}
                <span
                  className={orbitalTelemetry.specificEnergy < 0 ? "text-cyan-400" : "text-red-400"}
                >
                  {orbitalTelemetry.specificEnergy.toFixed(2)} J/kg (
                  {orbitalTelemetry.specificEnergy < 0
                    ? "Gravitationally Bound"
                    : "Escaping Potential Well"}
                  )
                </span>
              </div>
            </div>

            {/* Interactive delta-v burns */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
              <span className="text-[10px] text-slate-400 font-sans">Orbital Maneuvers:</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleApplyDeltaV(0.9)}
                  className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 rounded text-[10px] font-semibold"
                  title="Fire retrograde thrusters: drops periapsis and lowers orbit"
                >
                  Retrograde (-10%)
                </button>
                <button
                  onClick={() => handleApplyDeltaV(1.1)}
                  className="px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded text-[10px] font-semibold"
                  title="Fire prograde thrusters: raises apoapsis and expands orbit"
                >
                  Prograde (+10%)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3D Scene watermark / helper */}
        <div className="absolute bottom-4 right-4 text-[10px] text-slate-500 font-mono bg-slate-900/60 px-2 py-1 rounded backdrop-blur border border-white/5 pointer-events-none">
          Click & Drag to Orbit · Scroll to Zoom · Click any body to inspect
        </div>
      </div>

      {/* 3. BODIES MANAGEMENT & ADD CUSTOM BODY DRAWER */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/90 p-4 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-cyan-400" />
            <h3 className="font-semibold text-white text-sm">
              Bodies in Simulation ({bodies.length})
            </h3>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsAddingBody(!isAddingBody)}
            className="h-8 gap-1.5 text-xs border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/20"
          >
            {isAddingBody ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            <span>{isAddingBody ? "Close Form" : "Add Custom Orbiting Body"}</span>
          </Button>
        </div>

        {/* Custom Body Form */}
        {isAddingBody && (
          <form
            onSubmit={handleAddCustomBody}
            className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-4 text-xs animate-in fade-in"
          >
            <div className="font-semibold text-cyan-300 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>Configure New Gravitational Body</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Body Name</label>
                <input
                  type="text"
                  value={newBodyName}
                  onChange={(e) => setNewBodyName(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Mass (Units)</label>
                <input
                  type="number"
                  min="0.1"
                  max="5000"
                  step="0.5"
                  value={newBodyMass}
                  onChange={(e) => setNewBodyMass(parseFloat(e.target.value))}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Radius (Size)</label>
                <input
                  type="number"
                  min="0.2"
                  max="4.0"
                  step="0.1"
                  value={newBodyRadius}
                  onChange={(e) => setNewBodyRadius(parseFloat(e.target.value))}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Initial X (Dist)</label>
                <input
                  type="number"
                  min="-40"
                  max="40"
                  step="1"
                  value={newBodyX}
                  onChange={(e) => setNewBodyX(parseFloat(e.target.value))}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Tangential V_z</label>
                <input
                  type="number"
                  min="-25"
                  max="25"
                  step="0.5"
                  value={newBodyVz}
                  onChange={(e) => setNewBodyVz(parseFloat(e.target.value))}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={newBodyColor}
                    onChange={(e) => setNewBodyColor(e.target.value)}
                    className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer"
                  />
                  <span className="font-mono text-slate-300">{newBodyColor}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsAddingBody(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-cyan-600 hover:bg-cyan-500 text-white">
                Spawn Body into Simulation
              </Button>
            </div>
          </form>
        )}

        {/* Bodies list table */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {bodies.map((b) => {
            const isSelected = b.id === selectedBodyId;
            const currentSpeed = Math.sqrt(b.vx * b.vx + b.vy * b.vy + b.vz * b.vz);

            return (
              <div
                key={b.id}
                onClick={() => {
                  setSelectedBodyId(b.id);
                  onInteract?.();
                }}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                  isSelected
                    ? "border-cyan-400 bg-cyan-950/40 text-cyan-200"
                    : "border-white/5 bg-slate-950/60 text-slate-300 hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div
                    className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: b.color }}
                  />
                  <div className="truncate">
                    <div className="font-semibold text-xs truncate flex items-center gap-1">
                      <span>{b.name}</span>
                      {b.isStar && <span className="text-[10px] text-amber-400">★ Star</span>}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Mass: {b.mass} · Speed: {currentSpeed.toFixed(1)}
                    </div>
                  </div>
                </div>

                {bodies.length > 1 && !b.isStar && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveBody(b.id);
                    }}
                    className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Remove body"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
