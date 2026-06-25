import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

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

function makeOrbitLine(radius: number, inclination: number, color: string, opacity: number) {
  const segments = 256;
  const pts: number[] = [];
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    pts.push(Math.cos(a) * radius, 0, Math.sin(a) * radius);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  const m = new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false });
  const line = new THREE.Line(g, m);
  line.rotation.x = inclination;
  return line;
}

function Planet({ def }: { def: PlanetDef }) {
  const ref = useRef<THREE.Group>(null!);
  const phase = useMemo(() => Math.random() * Math.PI * 2, []);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    const a = phase + (t / def.period) * Math.PI * 2;
    ref.current.position.set(Math.cos(a) * def.distance, 0, Math.sin(a) * def.distance);
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
  const orbits = useMemo(
    () => PLANETS.map((p) => makeOrbitLine(p.distance, p.inclination, "#5a8cff", 0.2)),
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

// Slowly rotates the local stellar neighborhood around the galactic center,
// visualizing the ~225 Myr orbit. Effect is very subtle up close (only
// noticeable when zoomed out to galactic scales).
export function GalacticRotation({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null!);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    // one full revolution every ~10 minutes of wall time
    ref.current.rotation.y = clock.elapsedTime * ((Math.PI * 2) / 600);
  });
  return <group ref={ref}>{children}</group>;
}
