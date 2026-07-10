import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { GALACTIC_CENTER } from "./SceneObjects";

// ---------------------------------------------------------------
// NEBULAE + QUASARS inside / near the Milky Way.
//
// Positions are real: (galactic longitude l, latitude b, distance in ly)
// converted to XYZ in the same frame the Milky Way disc uses.
// Sun sits at origin; galactic center is at (-26000, 0, 0), so l=0
// points to -X. We include emission nebulae, planetary nebulae,
// supernova remnants, plus a handful of famous quasars (technically
// extragalactic but often called out as bright pointlike beacons on
// the sky).
// ---------------------------------------------------------------

type Nebula = {
  name: string;
  kind: "emission" | "planetary" | "remnant" | "reflection" | "quasar";
  l: number; b: number; distance: number; // ly
  size: number; // rendered radius, ly
  color: string;
};

const NEBULAE: Nebula[] = [
  // Emission / star-forming regions
  { name: "Orion Nebula (M42)", kind: "emission", l: 209.0, b: -19.4, distance: 1344, size: 12, color: "#ff6ea8" },
  { name: "Eagle Nebula (M16)", kind: "emission", l: 17.0, b: 0.8, distance: 7000, size: 30, color: "#ff88b0" },
  { name: "Lagoon Nebula (M8)", kind: "emission", l: 6.0, b: -1.2, distance: 4100, size: 55, color: "#ff5c9a" },
  { name: "Trifid Nebula (M20)", kind: "emission", l: 7.0, b: -0.3, distance: 5200, size: 22, color: "#e070ff" },
  { name: "Carina Nebula (NGC 3372)", kind: "emission", l: 287.5, b: -0.6, distance: 8500, size: 120, color: "#ff90c8" },
  { name: "Rosette Nebula", kind: "emission", l: 206.3, b: -2.1, distance: 5200, size: 65, color: "#ff5a8e" },
  { name: "Tarantula Nebula (30 Dor)", kind: "emission", l: 279.5, b: -31.7, distance: 160_000, size: 650, color: "#ff70b8" },
  { name: "Omega Nebula (M17)", kind: "emission", l: 15.1, b: -0.7, distance: 5500, size: 20, color: "#ff78b0" },
  { name: "North America Nebula (NGC 7000)", kind: "emission", l: 84.6, b: -0.8, distance: 2600, size: 45, color: "#ff6aa0" },
  { name: "California Nebula (NGC 1499)", kind: "emission", l: 160.5, b: -12.1, distance: 1000, size: 40, color: "#ff789c" },
  // Reflection
  { name: "Pleiades Nebulosity (M45)", kind: "reflection", l: 166.6, b: -23.5, distance: 444, size: 8, color: "#8fb8ff" },
  { name: "Horsehead Nebula (B33)", kind: "reflection", l: 206.9, b: -16.6, distance: 1500, size: 5, color: "#4a5f88" },
  // Planetary nebulae
  { name: "Ring Nebula (M57)", kind: "planetary", l: 63.2, b: 13.9, distance: 2570, size: 3, color: "#7affe0" },
  { name: "Cat's Eye Nebula (NGC 6543)", kind: "planetary", l: 96.5, b: 30.0, distance: 3300, size: 2.5, color: "#8affe6" },
  { name: "Helix Nebula (NGC 7293)", kind: "planetary", l: 36.2, b: -57.1, distance: 655, size: 5, color: "#7affce" },
  { name: "Dumbbell Nebula (M27)", kind: "planetary", l: 60.8, b: -3.7, distance: 1360, size: 4, color: "#78ffd0" },
  { name: "Butterfly Nebula (NGC 6302)", kind: "planetary", l: 349.5, b: 1.1, distance: 3400, size: 3, color: "#b078ff" },
  // Supernova remnants
  { name: "Crab Nebula (M1)", kind: "remnant", l: 184.6, b: -5.8, distance: 6500, size: 8, color: "#c896ff" },
  { name: "Veil Nebula (Cygnus Loop)", kind: "remnant", l: 74.0, b: -8.5, distance: 2400, size: 60, color: "#a0e0ff" },
  { name: "Cassiopeia A", kind: "remnant", l: 111.7, b: -2.1, distance: 11_000, size: 15, color: "#c8b0ff" },
  { name: "Vela Supernova Remnant", kind: "remnant", l: 263.9, b: -3.3, distance: 815, size: 70, color: "#b0d8ff" },
  // Famous quasars (extragalactic — we place them at true distance so
  // they read as pinpricks far beyond the Milky Way disc, matching how
  // they'd look from a galactic viewpoint)
  { name: "3C 273", kind: "quasar", l: 289.9, b: 64.4, distance: 2.44e9, size: 8000, color: "#a0d8ff" },
  { name: "3C 279", kind: "quasar", l: 305.1, b: 57.1, distance: 5.2e9, size: 12000, color: "#b0e0ff" },
  { name: "TON 618", kind: "quasar", l: 233.1, b: 74.5, distance: 10.4e9, size: 20000, color: "#c0e8ff" },
];

function toXYZ(l: number, b: number, d: number): [number, number, number] {
  const lr = (l * Math.PI) / 180;
  const br = (b * Math.PI) / 180;
  const x = -d * Math.cos(br) * Math.cos(lr);
  const y = d * Math.sin(br);
  const z = d * Math.cos(br) * Math.sin(lr);
  // Nebulae in the Milky Way frame are positioned relative to the Sun (origin);
  // no offset needed since the disc geometry itself is drawn from GALACTIC_CENTER.
  void GALACTIC_CENTER;
  return [x, y, z];
}

function makeNebulaTexture(kind: Nebula["kind"]): THREE.Texture {
  const size = 256;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  ctx.clearRect(0, 0, size, size);
  const cx = size / 2, cy = size / 2;

  if (kind === "planetary" || kind === "quasar") {
    // bright compact core with faint outer halo
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, size / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.12, "rgba(255,255,255,0.85)");
    g.addColorStop(0.4, "rgba(255,255,255,0.18)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    if (kind === "planetary") {
      // subtle ring
      ctx.strokeStyle = "rgba(255,255,255,0.4)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx, cy, size * 0.22, 0, Math.PI * 2);
      ctx.stroke();
    }
    return new THREE.CanvasTexture(c);
  }

  // Diffuse cloudy nebula: layered blobs
  ctx.globalCompositeOperation = "lighter";
  const blobs = kind === "remnant" ? 40 : 90;
  for (let i = 0; i < blobs; i++) {
    const r = (Math.random() * 0.35 + 0.05) * size;
    const x = cx + (Math.random() - 0.5) * size * 0.55;
    const y = cy + (Math.random() - 0.5) * size * 0.55;
    const a = 0.06 + Math.random() * 0.18;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(255,255,255,${a})`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }
  // sprinkle stars
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    ctx.fillStyle = `rgba(255,255,255,${0.4 + Math.random() * 0.5})`;
    ctx.beginPath();
    ctx.arc(x, y, 0.6 + Math.random() * 1.4, 0, Math.PI * 2);
    ctx.fill();
  }
  return new THREE.CanvasTexture(c);
}

function NebulaSprite({ n, tex }: { n: Nebula; tex: THREE.Texture }) {
  const ref = useRef<THREE.Sprite>(null!);
  const pos = useMemo(() => toXYZ(n.l, n.b, n.distance), [n]);
  const twinkle = useRef(Math.random() * Math.PI * 2);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    if (n.kind === "quasar") {
      const t = clock.elapsedTime * 2 + twinkle.current;
      const s = n.size * (0.85 + Math.sin(t) * 0.15);
      ref.current.scale.set(s, s, 1);
    }
  });
  return (
    <sprite ref={ref} position={pos} scale={[n.size, n.size, 1]}>
      <spriteMaterial
        map={tex}
        color={n.color}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={n.kind === "quasar" ? 1 : 0.9}
      />
    </sprite>
  );
}

export function Nebulae() {
  const texEmission = useMemo(() => makeNebulaTexture("emission"), []);
  const texReflection = useMemo(() => makeNebulaTexture("reflection"), []);
  const texPlanetary = useMemo(() => makeNebulaTexture("planetary"), []);
  const texRemnant = useMemo(() => makeNebulaTexture("remnant"), []);
  const texQuasar = useMemo(() => makeNebulaTexture("quasar"), []);
  const pick = (k: Nebula["kind"]) =>
    k === "emission" ? texEmission
    : k === "reflection" ? texReflection
    : k === "planetary" ? texPlanetary
    : k === "remnant" ? texRemnant
    : texQuasar;
  return (
    <group>
      {NEBULAE.map((n) => (
        <NebulaSprite key={n.name} n={n} tex={pick(n.kind)} />
      ))}
    </group>
  );
}
