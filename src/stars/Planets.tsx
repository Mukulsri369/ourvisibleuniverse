import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

// Real orbital elements (relative). We scale semi-major axis (a) for visibility:
// 1 AU ≈ 3.2 scene units. Sizes are exaggerated for visibility (~1500x real ratio).
// e = eccentricity (real), i = inclination to ecliptic (rad), omega = longitude of perihelion (rad).
export type MoonDef = {
  name: string;
  distance: number;   // from planet center, scene units
  size: number;
  color: string;
  period: number;     // scene seconds per orbit
  inclination?: number;
};

export type PlanetDef = {
  name: string;
  a: number;          // semi-major axis (scene units)
  e: number;          // eccentricity
  i: number;          // orbital inclination (rad)
  omega: number;      // argument of perihelion (rad)
  size: number;
  color: string;
  emissive?: string;
  atmosphere?: string; // glow color
  period: number;      // scene-seconds per revolution
  spinPeriod: number;  // scene-seconds per rotation
  tilt: number;        // axial tilt (rad)
  ring?: { inner: number; outer: number; color: string; tilt?: number };
  moons?: MoonDef[];
  description: string;
};

const deg = (d: number) => (d * Math.PI) / 180;
const AU = 3.2;

export const PLANETS: PlanetDef[] = [
  {
    name: "Mercury",
    a: 0.39 * AU, e: 0.2056, i: deg(7.0), omega: deg(29.1),
    size: 0.05, color: "#a89078",
    period: 7.6, spinPeriod: 90, tilt: deg(0.03),
    description: "The smallest and innermost planet, scorched by the Sun and cratered like the Moon.",
  },
  {
    name: "Venus",
    a: 0.72 * AU, e: 0.0068, i: deg(3.39), omega: deg(54.9),
    size: 0.09, color: "#e8c47a", atmosphere: "#ffd58a",
    period: 19.4, spinPeriod: -120, tilt: deg(177.4),
    description: "A runaway greenhouse world wrapped in dense sulfuric‑acid clouds. Surface hot enough to melt lead.",
  },
  {
    name: "Earth",
    a: 1.0 * AU, e: 0.0167, i: 0, omega: deg(114.2),
    size: 0.10, color: "#1f5fbf", atmosphere: "#7fb6ff",
    period: 31.5, spinPeriod: 1.5, tilt: deg(23.44),
    moons: [{ name: "Moon", distance: 0.25, size: 0.027, color: "#bdbdbd", period: 6 }],
    description: "Our home — the only known world with liquid water on the surface and life.",
  },
  {
    name: "Mars",
    a: 1.52 * AU, e: 0.0934, i: deg(1.85), omega: deg(286.5),
    size: 0.07, color: "#c1440e", atmosphere: "#e08060",
    period: 59.2, spinPeriod: 1.55, tilt: deg(25.19),
    moons: [
      { name: "Phobos", distance: 0.12, size: 0.012, color: "#9a8474", period: 0.6 },
      { name: "Deimos", distance: 0.18, size: 0.009, color: "#8a7464", period: 1.4 },
    ],
    description: "The Red Planet — iron‑oxide deserts, polar ice caps, and the tallest volcano in the Solar System.",
  },
  {
    name: "Jupiter",
    a: 5.2 * AU, e: 0.0489, i: deg(1.31), omega: deg(273.9),
    size: 0.42, color: "#c8a878", emissive: "#3a2410",
    period: 372, spinPeriod: 0.6, tilt: deg(3.13),
    ring: { inner: 0.48, outer: 0.55, color: "#7a6a55" },
    moons: [
      { name: "Io",       distance: 0.65, size: 0.022, color: "#e6cf6a", period: 2.2 },
      { name: "Europa",   distance: 0.78, size: 0.020, color: "#e3d9c2", period: 3.6 },
      { name: "Ganymede", distance: 0.95, size: 0.030, color: "#b5a48b", period: 6.2 },
      { name: "Callisto", distance: 1.20, size: 0.028, color: "#7e6f5d", period: 11.7 },
    ],
    description: "The Solar System's giant — a gas world with the Great Red Spot, faint rings, and 95+ moons.",
  },
  {
    name: "Saturn",
    a: 9.58 * AU, e: 0.0565, i: deg(2.49), omega: deg(339.4),
    size: 0.36, color: "#e6c98a", emissive: "#3a2c0e",
    period: 925, spinPeriod: 0.7, tilt: deg(26.73),
    ring: { inner: 0.45, outer: 0.85, color: "#e0d2a8", tilt: deg(26.73) },
    moons: [{ name: "Titan", distance: 1.05, size: 0.033, color: "#d4a85a", period: 7.8 }],
    description: "Famed for its bright icy ring system. A gas giant with the lowest density of any planet.",
  },
  {
    name: "Uranus",
    a: 19.2 * AU, e: 0.0457, i: deg(0.77), omega: deg(96.99),
    size: 0.18, color: "#9fd8e0", emissive: "#102830",
    period: 2640, spinPeriod: -1.0, tilt: deg(97.77),
    ring: { inner: 0.24, outer: 0.30, color: "#6a8a92", tilt: deg(97.77) },
    description: "An ice giant tilted on its side, rolling around the Sun once every 84 years.",
  },
  {
    name: "Neptune",
    a: 30.05 * AU, e: 0.0113, i: deg(1.77), omega: deg(273.2),
    size: 0.17, color: "#3b6df0", emissive: "#08163a",
    period: 5180, spinPeriod: 1.1, tilt: deg(28.32),
    description: "The windiest planet — supersonic storms tear through its deep‑blue methane atmosphere.",
  },
];

// Kepler's equation solver
function keplerPosition(def: PlanetDef, phase: number, t: number): THREE.Vector3 {
  const M = phase + (t / def.period) * Math.PI * 2;
  let E = M;
  for (let k = 0; k < 6; k++) {
    E = E - (E - def.e * Math.sin(E) - M) / (1 - def.e * Math.cos(E));
  }
  const cosE = Math.cos(E), sinE = Math.sin(E);
  // perifocal plane (x toward perihelion, z perpendicular)
  const xp = def.a * (cosE - def.e);
  const zp = def.a * Math.sqrt(1 - def.e * def.e) * sinE;
  // rotate by argument of perihelion (around Y)
  const cw = Math.cos(def.omega), sw = Math.sin(def.omega);
  const x1 = xp * cw - zp * sw;
  const z1 = xp * sw + zp * cw;
  // tilt by inclination around X
  const ci = Math.cos(def.i), si = Math.sin(def.i);
  return new THREE.Vector3(x1, -z1 * si, z1 * ci);
}

// Build an elliptical orbit line (real Kepler ellipse — not a perfect circle)
function makeOrbitLine(def: PlanetDef, color: string, opacity: number) {
  const segments = 256;
  const pts: number[] = [];
  for (let k = 0; k <= segments; k++) {
    const E = (k / segments) * Math.PI * 2;
    const xp = def.a * (Math.cos(E) - def.e);
    const zp = def.a * Math.sqrt(1 - def.e * def.e) * Math.sin(E);
    const cw = Math.cos(def.omega), sw = Math.sin(def.omega);
    const x1 = xp * cw - zp * sw;
    const z1 = xp * sw + zp * cw;
    const ci = Math.cos(def.i), si = Math.sin(def.i);
    pts.push(x1, -z1 * si, z1 * ci);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  const m = new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false });
  return new THREE.Line(g, m);
}

// Global live registry of planet world positions, read by CameraRig
type PlanetRegistry = Map<string, THREE.Vector3>;
declare global {
  interface Window { __planetPositions?: PlanetRegistry }
}

function getRegistry(): PlanetRegistry {
  if (!window.__planetPositions) window.__planetPositions = new Map();
  return window.__planetPositions;
}

function Planet({ def }: { def: PlanetDef }) {
  const groupRef = useRef<THREE.Group>(null!);
  const bodyRef = useRef<THREE.Mesh>(null!);
  const phase = useMemo(() => Math.random() * Math.PI * 2, []);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;
    const p = keplerPosition(def, phase, t);
    groupRef.current.position.copy(p);
    if (bodyRef.current) {
      bodyRef.current.rotation.y = (t / def.spinPeriod) * Math.PI * 2;
    }
    groupRef.current.getWorldPosition(tmp);
    const reg = getRegistry();
    let v = reg.get(def.name);
    if (!v) { v = new THREE.Vector3(); reg.set(def.name, v); }
    v.copy(tmp);
  });

  return (
    <group ref={groupRef}>
      {/* tilt + body */}
      <group rotation={[0, 0, def.tilt]}>
        <mesh ref={bodyRef} castShadow receiveShadow>
          <sphereGeometry args={[def.size, 48, 48]} />
          <meshStandardMaterial
            color={def.color}
            roughness={0.85}
            metalness={0.05}
            emissive={def.emissive ?? def.color}
            emissiveIntensity={def.emissive ? 0.18 : 0.04}
          />
        </mesh>
        {/* atmosphere glow */}
        {def.atmosphere && (
          <mesh scale={1.08}>
            <sphereGeometry args={[def.size, 32, 32]} />
            <meshBasicMaterial color={def.atmosphere} transparent opacity={0.15} side={THREE.BackSide} depthWrite={false} />
          </mesh>
        )}
        {def.ring && (
          <mesh rotation={[Math.PI / 2 + (def.ring.tilt ?? 0) * 0.2, 0, 0]}>
            <ringGeometry args={[def.ring.inner, def.ring.outer, 96]} />
            <meshBasicMaterial color={def.ring.color} side={THREE.DoubleSide} transparent opacity={0.55} depthWrite={false} />
          </mesh>
        )}
      </group>
      {/* Moons orbit the planet (not tilt-locked, just stable around it) */}
      {def.moons?.map((m) => (
        <Moon key={m.name} moon={m} />
      ))}
    </group>
  );
}

function Moon({ moon }: { moon: MoonDef }) {
  const ref = useRef<THREE.Group>(null!);
  const phase = useMemo(() => Math.random() * Math.PI * 2, []);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    const a = phase + (t / moon.period) * Math.PI * 2;
    const inc = moon.inclination ?? 0;
    ref.current.position.set(Math.cos(a) * moon.distance, Math.sin(a) * moon.distance * Math.sin(inc), Math.sin(a) * moon.distance * Math.cos(inc));
  });
  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[moon.size, 24, 24]} />
        <meshStandardMaterial color={moon.color} roughness={0.95} emissive={moon.color} emissiveIntensity={0.04} />
      </mesh>
    </group>
  );
}

export function Planets() {
  const orbits = useMemo(
    () => PLANETS.map((p) => makeOrbitLine(p, "#6a8cff", 0.10)),
    [],
  );
  return (
    <group>
      {orbits.map((o, i) => (
        <primitive key={`orbit-${i}`} object={o} />
      ))}
      {PLANETS.map((p) => (
        <Planet key={p.name} def={p} />
      ))}
    </group>
  );
}

// ---------------------------------------------------------------
// SolarSystem — wraps Sun + Planets and drifts them along the
// Sun's galactic orbital tangent (+Z). Locally subtle, but enough
// that the world-space trails of the planets become true helices
// (Kepler ellipse + linear drift = helix), matching the real
// motion of our Solar System through the Milky Way.
// ---------------------------------------------------------------

// Scene units per second of galactic drift. Real Sun moves ~220 km/s
// through the galaxy; compressed for visualization so trails of length
// ~4 s show a clearly visible helical pitch versus planet orbits.
export const SUN_DRIFT_SPEED = 0.35;
export const SUN_DRIFT_DIR = new THREE.Vector3(0, 0, 1); // galactic tangent

export function SolarSystem({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null!);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    ref.current.position.set(0, 0, t * SUN_DRIFT_SPEED);
    // publish Sun's world position so the camera + trails can follow
    ref.current.getWorldPosition(tmp);
    const reg = getRegistry();
    let v = reg.get("Sun");
    if (!v) { v = new THREE.Vector3(); reg.set("Sun", v); }
    v.copy(tmp);
  });
  return <group ref={ref}>{children}</group>;
}

// ---------------------------------------------------------------
// MotionTrails — ring-buffer polylines that record the live
// world-space position of the Sun + each planet and fade with age,
// so the actual path (helix relative to the galaxy) is visible.
// ---------------------------------------------------------------

const TRAIL_LEN = 260;

type TrailBody = { name: string; color: THREE.Color };

function useTrail(body: TrailBody) {
  const lineRef = useRef<THREE.Line>(null!);
  const initialized = useRef(false);

  const { geometry, material } = useMemo(() => {
    const positions = new Float32Array(TRAIL_LEN * 3);
    const ages = new Float32Array(TRAIL_LEN);
    for (let i = 0; i < TRAIL_LEN; i++) ages[i] = i / (TRAIL_LEN - 1);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aAge", new THREE.BufferAttribute(ages, 1));
    const mat = new THREE.ShaderMaterial({
      uniforms: { uColor: { value: body.color } },
      vertexShader: /* glsl */ `
        attribute float aAge;
        varying float vAge;
        void main(){
          vAge = aAge;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor;
        varying float vAge;
        void main(){
          float a = pow(1.0 - vAge, 1.6);
          if (a < 0.015) discard;
          gl_FragColor = vec4(uColor, a);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return { geometry: geo, material: mat };
  }, [body.color]);

  useFrame(() => {
    const reg = (window as Window).__planetPositions;
    const p = reg?.get(body.name);
    if (!p) return;
    const attr = geometry.getAttribute("position") as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    if (!initialized.current) {
      for (let i = 0; i < TRAIL_LEN; i++) {
        arr[i * 3] = p.x; arr[i * 3 + 1] = p.y; arr[i * 3 + 2] = p.z;
      }
      initialized.current = true;
    } else {
      // shift all points one slot toward the tail
      arr.copyWithin(3, 0, (TRAIL_LEN - 1) * 3);
      arr[0] = p.x; arr[1] = p.y; arr[2] = p.z;
    }
    attr.needsUpdate = true;
  });

  return { lineRef, geometry, material };
}

function Trail({ body }: { body: TrailBody }) {
  const { geometry, material } = useTrail(body);
  const line = useMemo(() => new THREE.Line(geometry, material), [geometry, material]);
  return <primitive object={line} />;
}

export function MotionTrails() {
  const bodies = useMemo<TrailBody[]>(() => [
    { name: "Sun", color: new THREE.Color("#ffcf80") },
    ...PLANETS.map((p) => ({ name: p.name, color: new THREE.Color(p.color) })),
  ], []);
  return (
    <group>
      {bodies.map((b) => <Trail key={b.name} body={b} />)}
    </group>
  );
}

// (Removed legacy GalacticRotation wrapper — real motion now comes
//  from SolarSystem drift + MilkyWay differential rotation shader.)
