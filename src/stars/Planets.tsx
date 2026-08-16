import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useStore } from "./store";


// Real orbital elements (relative). We scale semi-major axis (a) so the
// entire Solar System fits realistically in the star field:
// 1 AU ≈ 0.05 light-years. Sizes are exaggerated for visibility so planets
// remain visitable and clearly visible when zoomed in.
// e = eccentricity (real), i = inclination to ecliptic (rad), omega = longitude of perihelion (rad).
export type MoonDef = {
  name: string;        // from planet center, scene units
  distance: number;    // from planet center, scene units
  size: number;
  color: string;
  period: number;      // scene seconds per orbit
  inclination?: number;
};

export type PlanetDef = {
  name: string;
  a: number;           // semi-major axis (scene units)
  e: number;           // eccentricity
  i: number;           // orbital inclination (rad)
  omega: number;       // argument of perihelion (rad)
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
// 1 AU = 0.05 ly places Neptune at ~1.5 ly, making the Solar System clearly
// smaller than the distance to nearby stars (Proxima Centauri ~4.2 ly).
export const AU = 0.05;
// Planets are still enlarged relative to their orbits so they stay visible when visited.
const P = 0.005;

export const PLANETS: PlanetDef[] = [
  {
    name: "Mercury",
    a: 0.39 * AU, e: 0.2056, i: deg(7.0), omega: deg(29.1),
    size: 0.021 * P, color: "#a89078",
    period: 7.6, spinPeriod: 90, tilt: deg(0.03),
    description: "The smallest and innermost planet, scorched by the Sun and cratered like the Moon.",
  },
  {
    name: "Venus",
    a: 0.72 * AU, e: 0.0068, i: deg(3.39), omega: deg(54.9),
    size: 0.052 * P, color: "#e8c47a", atmosphere: "#ffd58a",
    period: 19.4, spinPeriod: -120, tilt: deg(177.4),
    description: "A runaway greenhouse world wrapped in dense sulfuric-acid clouds. Surface hot enough to melt lead.",
  },
  {
    name: "Earth",
    a: 1.0 * AU, e: 0.0167, i: 0, omega: deg(114.2),
    size: 0.055 * P, color: "#1f5fbf", atmosphere: "#7fb6ff",
    period: 31.5, spinPeriod: 1.5, tilt: deg(23.44),
    moons: [{ name: "Moon", distance: 0.33 * P, size: 0.015 * P, color: "#bdbdbd", period: 6 }],
    description: "Our home — the only known world with liquid water on the surface and life.",
  },
  {
    name: "Mars",
    a: 1.52 * AU, e: 0.0934, i: deg(1.85), omega: deg(286.5),
    size: 0.029 * P, color: "#c1440e", atmosphere: "#e08060",
    period: 59.2, spinPeriod: 1.55, tilt: deg(25.19),
    moons: [
      { name: "Phobos", distance: 0.10 * P, size: 0.006 * P, color: "#9a8474", period: 0.6 },
      { name: "Deimos", distance: 0.16 * P, size: 0.005 * P, color: "#8a7464", period: 1.4 },
    ],
    description: "The Red Planet — iron-oxide deserts, polar ice caps, and the tallest volcano in the Solar System.",
  },
  {
    name: "Jupiter",
    a: 5.2 * AU, e: 0.0489, i: deg(1.31), omega: deg(273.9),
    size: 0.617 * P, color: "#c8a878", emissive: "#3a2410",
    period: 96, spinPeriod: 0.6, tilt: deg(3.13),
    ring: { inner: 1.18 * P, outer: 1.35 * P, color: "#7a6a55" },
    moons: [
      { name: "Io",       distance: 1.20 * P, size: 0.017 * P, color: "#e6cf6a", period: 2.2 },
      { name: "Europa",   distance: 1.50 * P, size: 0.015 * P, color: "#e3d9c2", period: 3.6 },
      { name: "Ganymede", distance: 1.90 * P, size: 0.025 * P, color: "#b5a48b", period: 6.2 },
      { name: "Callisto", distance: 2.55 * P, size: 0.023 * P, color: "#7e6f5d", period: 11.7 },
    ],
    description: "The Solar System's giant — a gas world with the Great Red Spot, faint rings, and 95+ moons.",
  },
  {
    name: "Saturn",
    a: 9.58 * AU, e: 0.0565, i: deg(2.49), omega: deg(339.4),
    size: 0.520 * P, color: "#e6c98a", emissive: "#3a2c0e",
    period: 150, spinPeriod: 0.7, tilt: deg(26.73),
    ring: { inner: 1.15 * P, outer: 2.20 * P, color: "#e0d2a8", tilt: deg(26.73) },
    moons: [{ name: "Titan", distance: 2.20 * P, size: 0.023 * P, color: "#d4a85a", period: 7.8 }],
    description: "Famed for its bright icy ring system. A gas giant with the lowest density of any planet.",
  },
  {
    name: "Uranus",
    a: 19.2 * AU, e: 0.0457, i: deg(0.77), omega: deg(96.99),
    size: 0.220 * P, color: "#9fd8e0", emissive: "#102830",
    period: 240, spinPeriod: -1.0, tilt: deg(97.77),
    ring: { inner: 0.60 * P, outer: 0.75 * P, color: "#6a8a92", tilt: deg(97.77) },
    description: "An ice giant tilted on its side, rolling around the Sun once every 84 years.",
  },
  {
    name: "Neptune",
    a: 30.05 * AU, e: 0.0113, i: deg(1.77), omega: deg(273.2),
    size: 0.213 * P, color: "#3b6df0", emissive: "#08163a",
    period: 330, spinPeriod: 1.1, tilt: deg(28.32),
    moons: [{ name: "Triton", distance: 0.60 * P, size: 0.020 * P, color: "#cfd6e0", period: 5.5 }],
    description: "The windiest planet — supersonic storms tear through its deep-blue methane atmosphere.",
  },
  {
    name: "Pluto",
    a: 39.5 * AU, e: 0.2488, i: deg(17.16), omega: deg(113.76),
    size: 0.010 * P, color: "#c9b39a",
    period: 420, spinPeriod: 2.1, tilt: deg(122.5),
    moons: [{ name: "Charon", distance: 0.06 * P, size: 0.005 * P, color: "#9d8e7e", period: 1.6 }],
    description: "A dwarf planet in the Kuiper Belt. Its eccentric, inclined orbit sometimes brings it closer to the Sun than Neptune.",
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

  const setVisit = useStore((s) => s.setVisitPlanet);
  const haloTex = useMemo(() => makeHaloTexture(def.color), [def.color]);
  const surface = useMemo(() => makeSurfaceTexture(def), [def]);
  const ringTex = useMemo(() => (def.ring ? makeRingTexture(def.name, def.ring.color) : null), [def]);
  const ringGeo = useMemo(
    () => (def.ring ? makeRingGeometry(def.ring.inner, def.ring.outer, 192) : null),
    [def],
  );


  return (
    <group ref={groupRef}>
      {/* halo sprite — keeps the planet visible as a colored dot from far away */}
      <sprite scale={[Math.max(def.size * 22, 0.05), Math.max(def.size * 22, 0.05), 1]}>
        <spriteMaterial map={haloTex} color={def.color} transparent opacity={0.7} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      {/* tilt + body */}
      <group rotation={[0, 0, def.tilt]}>
        <mesh
          ref={bodyRef}
          castShadow
          receiveShadow
          onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = "pointer"; }}
          onPointerOut={(e) => { e.stopPropagation(); document.body.style.cursor = ""; }}
          onClick={(e) => { e.stopPropagation(); setVisit(def.name); }}
        >
          <sphereGeometry args={[def.size, 64, 64]} />
          <meshStandardMaterial
            map={surface}
            bumpMap={def.atmosphere || def.emissive ? undefined : surface}
            bumpScale={def.size * 0.06}
            roughness={def.emissive ? 0.55 : 0.9}
            metalness={0.02}
            emissive={new THREE.Color(def.emissive ?? def.color)}
            emissiveIntensity={def.emissive ? 0.12 : 0.05}
          />
        </mesh>
        {/* atmosphere glow — two soft shells for a limb-lit look */}
        {def.atmosphere && (
          <>
            <mesh scale={1.03}>
              <sphereGeometry args={[def.size, 48, 48]} />
              <meshBasicMaterial color={def.atmosphere} transparent opacity={0.14} side={THREE.BackSide} depthWrite={false} />
            </mesh>
            <mesh scale={1.12}>
              <sphereGeometry args={[def.size, 48, 48]} />
              <meshBasicMaterial color={def.atmosphere} transparent opacity={0.07} side={THREE.BackSide} depthWrite={false} blending={THREE.AdditiveBlending} />
            </mesh>
          </>
        )}
        {def.ring && ringGeo && (
          <mesh geometry={ringGeo} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
            <meshBasicMaterial
              map={ringTex ?? undefined}
              color={def.ring.color}
              side={THREE.DoubleSide}
              transparent
              opacity={0.95}
              depthWrite={false}
            />
          </mesh>
        )}
      </group>
      {/* Moons orbit the planet (not tilt-locked, just stable around it) */}
      {def.moons?.map((m) => (
        <Moon key={m.name} moon={m} parent={def.name} />
      ))}
    </group>
  );
}

// --- Procedural surface textures -------------------------------------------
// Deterministic per-planet noise so each world keeps the same face.
function hashSeed(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function rng(seed: number) {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const GAS_GIANTS = new Set(["Jupiter", "Saturn", "Uranus", "Neptune"]);

function makeSurfaceTexture(def: PlanetDef): THREE.Texture {
  const W = 1024, H = 512;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d")!;
  const rand = rng(hashSeed(def.name));
  const base = new THREE.Color(def.color);

  ctx.fillStyle = `#${base.getHexString()}`;
  ctx.fillRect(0, 0, W, H);

  const shade = (l: number) => {
    const col = base.clone();
    const hsl = { h: 0, s: 0, l: 0 };
    col.getHSL(hsl);
    col.setHSL(hsl.h, hsl.s, Math.min(0.95, Math.max(0.03, hsl.l * l)));
    return `#${col.getHexString()}`;
  };

  if (GAS_GIANTS.has(def.name)) {
    // Latitudinal cloud bands with turbulent edges
    let y = 0;
    while (y < H) {
      const h = 8 + rand() * 38;
      const l = 0.7 + rand() * 0.7;
      ctx.fillStyle = shade(l);
      ctx.globalAlpha = 0.55 + rand() * 0.35;
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= W; x += 32) {
        ctx.lineTo(x, y + Math.sin(x * 0.012 + rand() * 0.4) * 3);
      }
      ctx.lineTo(W, y + h); ctx.lineTo(0, y + h); ctx.closePath();
      ctx.fill();
      y += h;
    }
    ctx.globalAlpha = 1;
    // Storm ovals (e.g. Jupiter's Great Red Spot)
    const storms = def.name === "Jupiter" ? 6 : 3;
    for (let i = 0; i < storms; i++) {
      const sx = rand() * W, sy = H * (0.25 + rand() * 0.5);
      const rx = 20 + rand() * 60, ry = rx * (0.35 + rand() * 0.3);
      const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, rx);
      const stormCol = def.name === "Jupiter" && i === 0 ? "#c1440e" : shade(1.25);
      g.addColorStop(0, stormCol);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.save(); ctx.translate(sx, sy); ctx.scale(1, ry / rx); ctx.translate(-sx, -sy);
      ctx.beginPath(); ctx.arc(sx, sy, rx, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  } else {
    // Rocky/icy worlds: continents, maria and craters
    for (let i = 0; i < 220; i++) {
      const x = rand() * W, y = rand() * H;
      const r = 12 + rand() * 90;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, shade(0.65 + rand() * 0.8));
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.globalAlpha = 0.5;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
    if (def.name === "Earth") {
      ctx.globalAlpha = 0.85;
      for (let i = 0; i < 40; i++) {
        const x = rand() * W, y = H * (0.15 + rand() * 0.7);
        ctx.fillStyle = rand() > 0.5 ? "#2f7d32" : "#8a6b3a";
        ctx.beginPath();
        ctx.ellipse(x, y, 20 + rand() * 70, 12 + rand() * 40, rand() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }
      // polar ice
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.fillRect(0, 0, W, 22); ctx.fillRect(0, H - 22, W, 22);
    }
    if (def.name === "Mars") {
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.beginPath(); ctx.ellipse(W * 0.5, 6, W * 0.22, 20, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(W * 0.5, H - 6, W * 0.18, 16, 0, 0, Math.PI * 2); ctx.fill();
    }
    // craters
    ctx.globalAlpha = 0.35;
    const craters = def.name === "Mercury" ? 500 : 180;
    for (let i = 0; i < craters; i++) {
      const x = rand() * W, y = rand() * H, r = 1.5 + rand() * 9;
      ctx.strokeStyle = shade(1.4); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = shade(0.7);
      ctx.beginPath(); ctx.arc(x, y, r * 0.85, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  t.needsUpdate = true;
  return t;
}

// Ring texture: radial bands of varying brightness/opacity with real gaps
// (Cassini division for Saturn). u = radial position across the ring.
function makeRingTexture(name: string, color: string): THREE.Texture {
  const W = 1024, H = 8;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d")!;
  const rand = rng(hashSeed(name + "ring"));
  const base = new THREE.Color(color);
  ctx.clearRect(0, 0, W, H);
  for (let x = 0; x < W; x++) {
    const u = x / W;
    let a = 0.55 + 0.35 * Math.sin(u * 90 + rand() * 0.1) * 0.5 + rand() * 0.12;
    // soft inner/outer falloff
    a *= Math.min(1, u * 8) * Math.min(1, (1 - u) * 6);
    if (name === "Saturn") {
      if (u > 0.46 && u < 0.53) a *= 0.08;       // Cassini division
      if (u > 0.72 && u < 0.735) a *= 0.25;      // Encke gap
      if (u < 0.18) a *= 0.45;                   // faint C ring
      if (u > 0.55 && u < 0.72) a *= 1.25;       // bright A ring
    }
    const l = 0.75 + 0.5 * rand();
    const col = base.clone().multiplyScalar(l);
    ctx.fillStyle = `rgba(${Math.round(col.r * 255)},${Math.round(col.g * 255)},${Math.round(col.b * 255)},${Math.min(1, a)})`;
    ctx.fillRect(x, 0, 1, H);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  t.needsUpdate = true;
  return t;
}

// Ring geometry with radial UVs (u across the ring width) so the band
// texture maps correctly — the default ringGeometry UVs do not.
function makeRingGeometry(inner: number, outer: number, segments: number) {
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    const ca = Math.cos(a), sa = Math.sin(a);
    pos.push(ca * inner, sa * inner, 0); uv.push(0, i / segments);
    pos.push(ca * outer, sa * outer, 0); uv.push(1, i / segments);
  }
  for (let i = 0; i < segments; i++) {
    const a = i * 2, b = a + 1, c2 = a + 2, d = a + 3;
    idx.push(a, b, c2, b, d, c2);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

function makeHaloTexture(_color: string): THREE.Texture {
  const size = 64;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.3, "rgba(255,255,255,0.5)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  t.needsUpdate = true;
  return t;
}

export const moonKey = (parent: string, moon: string) => `${parent}:${moon}`;

function Moon({ moon, parent }: { moon: MoonDef; parent: string }) {
  const ref = useRef<THREE.Group>(null!);
  const phase = useMemo(() => Math.random() * Math.PI * 2, []);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    const a = phase + (t / moon.period) * Math.PI * 2;
    const inc = moon.inclination ?? 0;
    ref.current.position.set(Math.cos(a) * moon.distance, Math.sin(a) * moon.distance * Math.sin(inc), Math.sin(a) * moon.distance * Math.cos(inc));
    // publish live world position so the moon trail can track it
    ref.current.getWorldPosition(tmp);
    const reg = getRegistry();
    const key = moonKey(parent, moon.name);
    let v = reg.get(key);
    if (!v) { v = new THREE.Vector3(); reg.set(key, v); }
    v.copy(tmp);
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
  // Tilt the entire planetary + belt system so its orbital-plane normal
  // aligns with the Sun's galactic drift direction. The Sun then travels
  // perpendicular to the ecliptic (edge-on through the galaxy), producing
  // the classic "vortex" helix of real Solar System motion.
  const quat = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), SUN_DRIFT_DIR.clone().normalize());
    return q;
  }, []);
  return (
    <group quaternion={quat}>
      {orbits.map((o, i) => (
        <primitive key={`orbit-${i}`} object={o} />
      ))}
      {PLANETS.map((p) => (
        <Planet key={p.name} def={p} />
      ))}
      <MinorBodies />
    </group>
  );
}

// Asteroid belt (2.2–3.3 AU) + Kuiper belt (30–50 AU) as particle rings.
// Each particle orbits the Sun on its own Keplerian period (T ∝ r^1.5),
// so the belts shear differentially like the real thing.
const BELT_K = 96 / Math.pow(5.2, 1.5); // matched to Jupiter's scene period

function MinorBodies() {
  const { geom, radii, thetas, heights, omegas } = useMemo(() => {
    const ASTEROIDS = 1400;
    const KUIPER = 1800;
    const total = ASTEROIDS + KUIPER;
    const pos = new Float32Array(total * 3);
    const col = new Float32Array(total * 3);
    const sizes = new Float32Array(total);
    const radii = new Float32Array(total);
    const thetas = new Float32Array(total);
    const heights = new Float32Array(total);
    const omegas = new Float32Array(total);
    const cAst = new THREE.Color("#a89274");
    const cKui = new THREE.Color("#7da6c8");
    const setOrbit = (i: number, rAU: number, z: number) => {
      radii[i] = rAU * AU;
      thetas[i] = Math.random() * Math.PI * 2;
      heights[i] = z;
      omegas[i] = (Math.PI * 2) / (BELT_K * Math.pow(rAU, 1.5));
      pos[i * 3] = Math.cos(thetas[i]) * radii[i];
      pos[i * 3 + 1] = z;
      pos[i * 3 + 2] = Math.sin(thetas[i]) * radii[i];
    };
    for (let i = 0; i < ASTEROIDS; i++) {
      setOrbit(i, 2.2 + Math.random() * 1.1, (Math.random() - 0.5) * 0.18 * AU);
      col[i*3] = cAst.r; col[i*3+1] = cAst.g; col[i*3+2] = cAst.b;
      sizes[i] = (1.4 + Math.random()*1.6) * P;
    }
    for (let j = 0; j < KUIPER; j++) {
      const i = ASTEROIDS + j;
      setOrbit(i, 30 + Math.random() * 20, (Math.random() - 0.5) * 2.0 * AU);
      col[i*3] = cKui.r; col[i*3+1] = cKui.g; col[i*3+2] = cKui.b;
      sizes[i] = (1.2 + Math.random()*1.4) * P;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    g.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    return { geom: g, radii, thetas, heights, omegas };
  }, []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const attr = geom.getAttribute("position") as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    for (let i = 0; i < radii.length; i++) {
      const a = thetas[i] + omegas[i] * t;
      arr[i * 3] = Math.cos(a) * radii[i];
      arr[i * 3 + 1] = heights[i];
      arr[i * 3 + 2] = Math.sin(a) * radii[i];
    }
    attr.needsUpdate = true;
  });

  return (
    <points geometry={geom} frustumCulled={false}>
      <pointsMaterial vertexColors size={0.18 * P} sizeAttenuation transparent opacity={0.85} depthWrite={false} />
    </points>
  );
}


// ---------------------------------------------------------------
// SolarSystem — wraps Sun + Planets and drifts them along the
// Sun's galactic orbital tangent (+Z). Locally subtle, but enough
// that the world-space trails of the planets become true helices
// (Kepler ellipse + linear drift = helix), matching the real
// motion of our Solar System through the Milky Way.
// ---------------------------------------------------------------

// The Sun moves through the galaxy roughly PERPENDICULAR to the ecliptic
// plane (the ecliptic is tilted ~60° to the galactic plane). Orbits are
// in the local XZ plane, so we drift mostly along +Y with a small +Z
// tilt — this reproduces the vortex/helix motion seen in real
// visualizations (planets spiraling around the Sun's forward path).
// Slow drift along the Sun's galactic orbital tangent (+Z in scene coords,
// since Sgr A* is on -X). A small +Y tilt (~25°) matches the tilt of the
// ecliptic to the galactic plane so the planetary trails still helix, but
// the Sun now moves with — not away from — the surrounding stars.
export const SUN_DRIFT_SPEED = 0.12;
// Flipped 180° so the Solar System travels along the galactic rotation
// direction the surrounding stars are moving in (was previously reversed).
export const SUN_DRIFT_DIR = new THREE.Vector3(0.0, -0.42, -0.91).normalize();

export function SolarSystem({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null!);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    const d = t * SUN_DRIFT_SPEED;
    ref.current.position.set(
      SUN_DRIFT_DIR.x * d,
      SUN_DRIFT_DIR.y * d,
      SUN_DRIFT_DIR.z * d,
    );
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

const TRAIL_LEN = 2400;
// Moons move fast around their planet, so their trails are much shorter —
// just enough to sketch the little helix they trace around the planet's path.
const MOON_TRAIL_LEN = 320;

type TrailBody = { name: string; color: THREE.Color; length?: number; opacity?: number };

function useTrail(body: TrailBody) {
  const lineRef = useRef<THREE.Line>(null!);
  const initialized = useRef(false);
  const len = body.length ?? TRAIL_LEN;

  const { geometry, material } = useMemo(() => {
    const positions = new Float32Array(len * 3);
    const ages = new Float32Array(len);
    for (let i = 0; i < len; i++) ages[i] = i / (len - 1);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aAge", new THREE.BufferAttribute(ages, 1));
    const mat = new THREE.ShaderMaterial({
      uniforms: { uColor: { value: body.color }, uOpacity: { value: body.opacity ?? 1 } },
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
        uniform float uOpacity;
        varying float vAge;
        void main(){
          float a = pow(1.0 - vAge, 1.6) * uOpacity;
          if (a < 0.015) discard;
          gl_FragColor = vec4(uColor, a);
        }
      `,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });
    return { geometry: geo, material: mat };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [body.color, len, body.opacity]);

  useFrame(() => {
    const reg = (window as Window).__planetPositions;
    const p = reg?.get(body.name);
    if (!p) return;
    const attr = geometry.getAttribute("position") as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    if (!initialized.current) {
      for (let i = 0; i < len; i++) {
        arr[i * 3] = p.x; arr[i * 3 + 1] = p.y; arr[i * 3 + 2] = p.z;
      }
      initialized.current = true;
    } else {
      // shift all points one slot toward the tail
      arr.copyWithin(3, 0, (len - 1) * 3);
      arr[0] = p.x; arr[1] = p.y; arr[2] = p.z;
    }
    attr.needsUpdate = true;
  });

  return { lineRef, geometry, material };
}

function Trail({ body }: { body: TrailBody }) {
  const { geometry, material } = useTrail(body);
  const line = useMemo(() => {
    const l = new THREE.Line(geometry, material);
    l.renderOrder = 999;
    l.frustumCulled = false;
    return l;
  }, [geometry, material]);
  return <primitive object={line} />;
}

export function MotionTrails() {
  const bodies = useMemo<TrailBody[]>(() => [
    { name: "Sun", color: new THREE.Color("#ffcf80") },
    ...PLANETS.map((p) => ({ name: p.name, color: new THREE.Color(p.color) })),
    // Moons: short, dimmer trails so their fast loops around each planet
    // read as fine helices without cluttering the planetary paths.
    ...PLANETS.flatMap((p) =>
      (p.moons ?? []).map((m) => ({
        name: moonKey(p.name, m.name),
        color: new THREE.Color(m.color),
        length: MOON_TRAIL_LEN,
        opacity: 0.55,
      })),
    ),
  ], []);
  return (
    <group>
      {bodies.map((b) => <Trail key={b.name} body={b} />)}
    </group>
  );
}

// (Removed legacy GalacticRotation wrapper — real motion now comes
//  from SolarSystem drift + MilkyWay differential rotation shader.)
