import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

// Planets scaled for visibility (NOT to real scale).
// distance: scene units from Sun (Sun radius = 1)
// size: visual radius
// period: seconds for one orbit (compressed time)
// inclination: small tilt in radians
export type PlanetDef = {
  name: string;
  distance: number;
  size: number;
  color: string;
  period: number;
  inclination: number;
  ring?: { inner: number; outer: number; color: string };
};

export const PLANETS: PlanetDef[] = [
  { name: "Mercury", distance: 1.8,  size: 0.05, color: "#a89078", period: 8,   inclination: 0.12 },
  { name: "Venus",   distance: 2.4,  size: 0.09, color: "#e8c080", period: 14,  inclination: 0.06 },
  { name: "Earth",   distance: 3.2,  size: 0.10, color: "#4a90e2", period: 22,  inclination: 0.0  },
  { name: "Mars",    distance: 4.0,  size: 0.07, color: "#c1440e", period: 32,  inclination: 0.03 },
  { name: "Jupiter", distance: 5.8,  size: 0.30, color: "#d4a373", period: 70,  inclination: 0.02 },
  { name: "Saturn",  distance: 7.4,  size: 0.26, color: "#e6c98a", period: 110, inclination: 0.04,
    ring: { inner: 0.34, outer: 0.55, color: "#cdb98a" } },
  { name: "Uranus",  distance: 9.0,  size: 0.16, color: "#9fd8e0", period: 170, inclination: 0.05 },
  { name: "Neptune", distance: 10.6, size: 0.15, color: "#3b6df0", period: 240, inclination: 0.03 },
];

function OrbitLine({ radius, inclination }: { radius: number; inclination: number }) {
  const geometry = useMemo(() => {
    const segments = 256;
    const pts: number[] = [];
    for (let i = 0; i <= segments; i++) {
      const a = (i / segments) * Math.PI * 2;
      pts.push(Math.cos(a) * radius, 0, Math.sin(a) * radius);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, [radius]);
  return (
    <line rotation={[inclination, 0, 0]}>
      <primitive object={geometry} attach="geometry" />
      <lineBasicMaterial color="#5a8cff" transparent opacity={0.18} depthWrite={false} />
    </line>
  );
}

function Planet({ def }: { def: PlanetDef }) {
  const ref = useRef<THREE.Group>(null!);
  const phase = useMemo(() => Math.random() * Math.PI * 2, []);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    const a = phase + (t / def.period) * Math.PI * 2;
    const x = Math.cos(a) * def.distance;
    const z = Math.sin(a) * def.distance;
    const y = Math.sin(a) * Math.sin(def.inclination) * def.distance * 0.0;
    ref.current.position.set(x, y, z);
    ref.current.rotation.y = t * 0.5;
  });
  return (
    <group rotation={[def.inclination, 0, 0]}>
      <group ref={ref}>
        <mesh>
          <sphereGeometry args={[def.size, 32, 32]} />
          <meshStandardMaterial color={def.color} roughness={0.85} metalness={0.05} emissive={def.color} emissiveIntensity={0.06} />
        </mesh>
        {def.ring && (
          <mesh rotation={[Math.PI / 2.3, 0, 0]}>
            <ringGeometry args={[def.ring.inner, def.ring.outer, 64]} />
            <meshBasicMaterial color={def.ring.color} side={THREE.DoubleSide} transparent opacity={0.55} />
          </mesh>
        )}
      </group>
    </group>
  );
}

export function Planets() {
  return (
    <group>
      {PLANETS.map((p) => (
        <group key={p.name}>
          <OrbitLine radius={p.distance} inclination={p.inclination} />
          <Planet def={p} />
        </group>
      ))}
    </group>
  );
}

// Visualizes the Sun's (and local stars') ~225-million-year orbit around the
// galactic center. We render an arc + direction arrow centered on the Sun
// pointing toward the galactic rotation direction.
export function GalacticMotionIndicator() {
  const ref = useRef<THREE.Group>(null!);
  useFrame(({ camera }) => {
    if (!ref.current) return;
    // fade based on distance: visible only when zoomed far enough out
    const d = camera.position.length();
    const o = Math.max(0, Math.min(0.6, (d - 30) / 200));
    ref.current.traverse((obj) => {
      const m = (obj as THREE.Mesh).material as THREE.Material & { opacity?: number };
      if (m && "opacity" in m) (m as { opacity: number }).opacity = o;
    });
  });
  const arcGeom = useMemo(() => {
    const pts: number[] = [];
    const r = 25;
    for (let i = 0; i <= 64; i++) {
      const a = -0.6 + (i / 64) * 1.2;
      pts.push(Math.cos(a) * r, 0, Math.sin(a) * r);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);
  return (
    <group ref={ref}>
      <line>
        <primitive object={arcGeom} attach="geometry" />
        <lineBasicMaterial color="#88bbff" transparent opacity={0} depthWrite={false} />
      </line>
    </group>
  );
}
