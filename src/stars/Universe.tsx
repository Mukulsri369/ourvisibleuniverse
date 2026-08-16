import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Billboard, Html } from "@react-three/drei";
import { useStore } from "./store";

// ---------------------------------------------------------------
// UNIVERSE — everything beyond the Milky Way.
//
// The Sun sits at the scene origin, 1 scene unit = 1 light-year.
// This module plots:
//   • Local Group galaxies (Andromeda, Triangulum, LMC, SMC, …)
//   • The Virgo Supercluster region (~50–100 Mly)
//   • Cosmic-web filaments of galaxies (Laniakea → observable universe)
//   • The observable-universe boundary sphere (~46.5 Gly)
//
// Positions of named galaxies come from real galactic coordinates
// (l, b, distance) converted to XYZ. Our x-axis points AWAY from the
// galactic center (Sgr A* is at (-26000, 0, 0)), so we flip x when
// converting from standard galactic coords where l=0 points toward GC.
// ---------------------------------------------------------------

type NamedGalaxy = {
  name: string;
  type: string;
  // galactic coords
  l: number; // deg
  b: number; // deg
  distance: number; // light-years
  // Rendered disk diameter in ly (roughly true size, floored so distant
  // giants are still visible as pixels)
  size: number;
  color: string;
  inclination?: number; // deg, tilt of disk from face-on
  posAngle?: number; // deg, orientation of major axis in sky
};

const NEARBY_GALAXIES: NamedGalaxy[] = [
  { name: "Large Magellanic Cloud", type: "Irregular", l: 280.5, b: -32.9, distance: 163_000, size: 14_000, color: "#c9d6ff", inclination: 35 },
  { name: "Small Magellanic Cloud", type: "Irregular", l: 302.8, b: -44.3, distance: 200_000, size: 7_000, color: "#cfd8ff", inclination: 40 },
  { name: "Sagittarius Dwarf", type: "Dwarf Elliptical", l: 5.6, b: -14.1, distance: 65_000, size: 10_000, color: "#ffe0b0" },
  { name: "Canis Major Dwarf", type: "Dwarf Irregular", l: 240.0, b: -8.0, distance: 25_000, size: 5_000, color: "#ffd8a0" },
  { name: "Andromeda (M31)", type: "Spiral", l: 121.2, b: -21.6, distance: 2_537_000, size: 220_000, color: "#e8ecff", inclination: 77, posAngle: 35 },
  { name: "Triangulum (M33)", type: "Spiral", l: 133.6, b: -31.3, distance: 2_730_000, size: 60_000, color: "#d8e4ff", inclination: 54, posAngle: 22 },
  { name: "NGC 205 (M110)", type: "Dwarf Elliptical", l: 120.7, b: -21.1, distance: 2_690_000, size: 17_000, color: "#ffe4c8" },
  { name: "IC 10", type: "Starburst Irregular", l: 119.0, b: -3.3, distance: 2_200_000, size: 5_000, color: "#ffc0d0" },
  { name: "NGC 6822 (Barnard)", type: "Irregular", l: 25.3, b: -18.4, distance: 1_630_000, size: 7_000, color: "#ffd8b0" },
  { name: "Leo I", type: "Dwarf Spheroidal", l: 226.0, b: 49.1, distance: 820_000, size: 3_000, color: "#ffe8c8" },
  { name: "Leo II", type: "Dwarf Spheroidal", l: 220.2, b: 67.2, distance: 690_000, size: 2_000, color: "#ffe8c8" },
  { name: "Draco Dwarf", type: "Dwarf Spheroidal", l: 86.4, b: 34.7, distance: 260_000, size: 2_500, color: "#ffe8c8" },
  { name: "Sculptor Dwarf", type: "Dwarf Spheroidal", l: 287.5, b: -83.2, distance: 290_000, size: 2_800, color: "#ffe8c8" },
  { name: "Fornax Dwarf", type: "Dwarf Spheroidal", l: 237.1, b: -65.7, distance: 460_000, size: 3_000, color: "#ffe8c8" },
  { name: "NGC 300", type: "Spiral", l: 299.2, b: -79.4, distance: 6_100_000, size: 60_000, color: "#dde6ff", inclination: 42 },
  { name: "NGC 55", type: "Barred Spiral", l: 332.9, b: -75.7, distance: 6_500_000, size: 70_000, color: "#dde6ff", inclination: 78 },
  { name: "Centaurus A (NGC 5128)", type: "Lenticular", l: 309.5, b: 19.4, distance: 13_000_000, size: 60_000, color: "#ffc898", inclination: 60 },
  { name: "M81 (Bode's Galaxy)", type: "Spiral", l: 142.1, b: 40.9, distance: 12_000_000, size: 90_000, color: "#dae4ff", inclination: 62 },
  { name: "M82 (Cigar Galaxy)", type: "Starburst", l: 141.4, b: 40.6, distance: 12_000_000, size: 37_000, color: "#ffd0c0", inclination: 80, posAngle: 65 },
  { name: "NGC 253 (Sculptor Galaxy)", type: "Spiral", l: 97.4, b: -88.0, distance: 11_400_000, size: 90_000, color: "#dfe8ff", inclination: 78 },
  { name: "M83", type: "Barred Spiral", l: 314.6, b: 32.0, distance: 15_000_000, size: 55_000, color: "#e0eaff", inclination: 24 },
  { name: "M94", type: "Spiral", l: 123.4, b: 76.0, distance: 16_000_000, size: 50_000, color: "#e2ecff", inclination: 35 },
  { name: "M101 (Pinwheel)", type: "Spiral", l: 102.0, b: 59.8, distance: 21_000_000, size: 170_000, color: "#e5efff", inclination: 18 },
  { name: "M51 (Whirlpool)", type: "Spiral", l: 104.9, b: 68.6, distance: 23_000_000, size: 76_000, color: "#e0ebff", inclination: 22, posAngle: 10 },
  { name: "M104 (Sombrero)", type: "Lenticular", l: 298.5, b: 51.1, distance: 29_000_000, size: 50_000, color: "#ffd8b0", inclination: 84, posAngle: 90 },
  { name: "NGC 1300", type: "Barred Spiral", l: 209.6, b: -52.4, distance: 61_000_000, size: 110_000, color: "#dde8ff", inclination: 45 },
  { name: "M87 (Virgo A)", type: "Elliptical", l: 283.8, b: 74.5, distance: 53_000_000, size: 240_000, color: "#ffe0b0" },
  { name: "M49", type: "Elliptical", l: 286.9, b: 70.2, distance: 56_000_000, size: 160_000, color: "#ffe0b0" },
  { name: "M60", type: "Elliptical", l: 291.2, b: 74.3, distance: 55_000_000, size: 120_000, color: "#ffe0b0" },
  { name: "NGC 4038/4039 (Antennae)", type: "Interacting", l: 286.2, b: 42.5, distance: 45_000_000, size: 90_000, color: "#ffcadd" },
  { name: "Ursa Minor Dwarf", type: "Dwarf Spheroidal", l: 105.0, b: 44.8, distance: 225_000, size: 2_000, color: "#ffe8c8" },
  { name: "Carina Dwarf", type: "Dwarf Spheroidal", l: 260.1, b: -22.2, distance: 330_000, size: 1_600, color: "#ffe8c8" },
  { name: "Sextans Dwarf", type: "Dwarf Spheroidal", l: 243.5, b: 42.3, distance: 280_000, size: 2_200, color: "#ffe8c8" },
  { name: "Phoenix Dwarf", type: "Dwarf Irregular", l: 272.2, b: -68.9, distance: 1_440_000, size: 2_000, color: "#ffe0c0" },
  { name: "WLM", type: "Dwarf Irregular", l: 75.9, b: -73.6, distance: 3_040_000, size: 8_000, color: "#dfe6ff" },
  { name: "NGC 185", type: "Dwarf Elliptical", l: 120.8, b: -14.5, distance: 2_050_000, size: 8_000, color: "#ffe4c8" },
  { name: "NGC 147", type: "Dwarf Spheroidal", l: 119.8, b: -14.3, distance: 2_530_000, size: 9_000, color: "#ffe4c8" },
  { name: "M32", type: "Compact Elliptical", l: 121.2, b: -22.0, distance: 2_490_000, size: 6_500, color: "#ffe0b8" },
  { name: "IC 1613", type: "Dwarf Irregular", l: 129.7, b: -60.6, distance: 2_380_000, size: 10_000, color: "#dde8ff" },
  { name: "Maffei 1", type: "Elliptical", l: 136.0, b: -0.6, distance: 9_800_000, size: 75_000, color: "#ffd8a8" },
  { name: "NGC 2403", type: "Spiral", l: 150.6, b: 29.2, distance: 8_000_000, size: 50_000, color: "#dde6ff", inclination: 62 },
  { name: "M64 (Black Eye)", type: "Spiral", l: 315.7, b: 84.4, distance: 17_000_000, size: 54_000, color: "#e6dcff", inclination: 60 },
  { name: "M106", type: "Spiral", l: 138.3, b: 68.8, distance: 23_700_000, size: 135_000, color: "#dfeaff", inclination: 67 },
  { name: "M66", type: "Barred Spiral", l: 241.5, b: 64.4, distance: 36_000_000, size: 95_000, color: "#e0eaff", inclination: 60 },
  { name: "M65", type: "Spiral", l: 241.3, b: 64.4, distance: 35_000_000, size: 90_000, color: "#e0eaff", inclination: 74 },
  { name: "M100", type: "Spiral", l: 271.1, b: 76.9, distance: 55_000_000, size: 107_000, color: "#e3eeff", inclination: 30 },
  { name: "M61", type: "Barred Spiral", l: 292.0, b: 65.0, distance: 52_500_000, size: 100_000, color: "#e1ecff", inclination: 20 },
  { name: "NGC 5866", type: "Lenticular", l: 92.0, b: 52.5, distance: 44_000_000, size: 60_000, color: "#ffdcb0", inclination: 88 },
  { name: "NGC 1316 (Fornax A)", type: "Lenticular", l: 240.2, b: -56.7, distance: 62_000_000, size: 160_000, color: "#ffdcb0" },
  { name: "NGC 1365", type: "Barred Spiral", l: 238.0, b: -54.6, distance: 56_000_000, size: 200_000, color: "#dde8ff", inclination: 55 },
  { name: "NGC 5253", type: "Dwarf Starburst", l: 314.9, b: 30.1, distance: 10_900_000, size: 16_000, color: "#ffd0a0" },
  { name: "NGC 6946 (Fireworks)", type: "Spiral", l: 95.7, b: 11.7, distance: 25_200_000, size: 90_000, color: "#e2edff", inclination: 33 },
  { name: "NGC 7331", type: "Spiral", l: 93.7, b: -20.7, distance: 40_000_000, size: 120_000, color: "#dfe9ff", inclination: 70 },
  { name: "M77 (Cetus A)", type: "Barred Spiral", l: 172.1, b: -51.9, distance: 47_000_000, size: 170_000, color: "#ffe6d0", inclination: 40 },
  { name: "NGC 3628", type: "Spiral", l: 240.9, b: 64.8, distance: 35_000_000, size: 100_000, color: "#dde6ff", inclination: 87 },
  { name: "Coma Cluster (NGC 4889)", type: "Elliptical", l: 58.1, b: 87.9, distance: 321_000_000, size: 300_000, color: "#ffe0b0" },
  { name: "Perseus Cluster (NGC 1275)", type: "Elliptical", l: 150.6, b: -13.3, distance: 237_000_000, size: 200_000, color: "#ffd8b8" },
  { name: "Hercules A", type: "Radio Elliptical", l: 23.5, b: 27.9, distance: 2_100_000_000, size: 500_000, color: "#ffcfa0" },
  { name: "NGC 4565 (Needle)", type: "Edge-on Spiral", l: 230.8, b: 86.4, distance: 46_000_000, size: 200_000, color: "#e2ecff", inclination: 88, posAngle: 45 },
];

function toXYZ(l: number, b: number, d: number): THREE.Vector3 {
  const lr = (l * Math.PI) / 180;
  const br = (b * Math.PI) / 180;
  // Flip x so galactic-center direction (l=0) points to -x (matches GALACTIC_CENTER)
  const x = -d * Math.cos(br) * Math.cos(lr);
  const y = d * Math.sin(br);
  const z = d * Math.cos(br) * Math.sin(lr);
  return new THREE.Vector3(x, y, z);
}

// Procedural spiral-galaxy sprite (top-down) — used for face-on discs
function makeSpiralGalaxyTexture(color = "#dfe6ff"): THREE.Texture {
  const size = 256;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  ctx.clearRect(0, 0, size, size);
  const cx = size / 2, cy = size / 2;
  // core glow
  const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.5);
  core.addColorStop(0, "rgba(255,240,210,1)");
  core.addColorStop(0.15, "rgba(255,220,170,0.85)");
  core.addColorStop(0.45, color.replace(")", ",0.35)").replace("#", "rgba(").length > 4 ? "rgba(200,220,255,0.35)" : "rgba(200,220,255,0.35)");
  core.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = core;
  ctx.fillRect(0, 0, size, size);
  // spiral arms
  ctx.globalCompositeOperation = "lighter";
  const arms = 2;
  for (let a = 0; a < arms; a++) {
    for (let i = 0; i < 2600; i++) {
      const t = i / 2600;
      const r = 8 + t * (size * 0.48);
      const theta = (a * Math.PI) + t * 6.5 + (Math.random() - 0.5) * 0.35;
      const x = cx + Math.cos(theta) * r;
      const y = cy + Math.sin(theta) * r;
      const alpha = (1 - t) * 0.6;
      ctx.fillStyle = `rgba(200,220,255,${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, 1 + Math.random() * 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

function makeEllipticalGalaxyTexture(): THREE.Texture {
  const size = 256;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const cx = size / 2, cy = size / 2;
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.5);
  g.addColorStop(0, "rgba(255,240,210,1)");
  g.addColorStop(0.3, "rgba(255,210,150,0.7)");
  g.addColorStop(0.7, "rgba(200,150,90,0.15)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}

function makeIrregularTexture(): THREE.Texture {
  const size = 256;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 1400; i++) {
    const r = Math.random() * size * 0.4;
    const theta = Math.random() * Math.PI * 2;
    const x = size / 2 + Math.cos(theta) * r;
    const y = size / 2 + Math.sin(theta) * r * 0.7;
    const a = (1 - r / (size * 0.4)) * 0.6;
    ctx.fillStyle = `rgba(220,220,255,${a})`;
    ctx.beginPath();
    ctx.arc(x, y, 1.5 + Math.random() * 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
  return new THREE.CanvasTexture(c);
}

function makeDotTexture(): THREE.Texture {
  const size = 64;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.4, "rgba(255,240,210,0.5)");
  g.addColorStop(1, "rgba(255,220,180,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}

function NamedGalaxyDisc({ g, spiralTex, ellipTex, irrTex }: {
  g: NamedGalaxy;
  spiralTex: THREE.Texture;
  ellipTex: THREE.Texture;
  irrTex: THREE.Texture;
}) {
  const pos = useMemo(() => toXYZ(g.l, g.b, g.distance), [g]);
  const tex = /Spiral|Barred|Lenticular|Starburst|Interacting/i.test(g.type)
    ? spiralTex
    : /Elliptical/i.test(g.type)
      ? ellipTex
      : irrTex;
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  const setVisitGalaxy = useStore((s) => s.setVisitGalaxy);
  const rot = useMemo(() => {
    const incl = ((g.inclination ?? 0) * Math.PI) / 180;
    const pa = ((g.posAngle ?? 0) * Math.PI) / 180;
    return new THREE.Euler(incl, 0, pa);
  }, [g]);
  // Pick radius scales with distance so far galaxies remain hoverable.
  const pickRadius = Math.max(g.size * 0.6, g.distance * 0.02);
  const onOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = "pointer";
  };
  const onOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(false);
    document.body.style.cursor = "";
  };
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    setVisitGalaxy({
      name: g.name,
      x: pos.x, y: pos.y, z: pos.z,
      size: g.size, distance: g.distance, type: g.type,
    });
  };
  return (
    <group position={pos}>
      <mesh ref={meshRef} rotation={rot} frustumCulled={false}>
        <planeGeometry args={[g.size, g.size]} />
        <meshBasicMaterial
          map={tex}
          color={g.color}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* invisible hover/click target */}
      <mesh onPointerOver={onOver} onPointerOut={onOut} onClick={onClick}>
        <sphereGeometry args={[pickRadius, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <Billboard>
        <Html center zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
          <div
            style={{
              opacity: hovered ? 1 : 0,
              transform: "translate(10px, -10px)",
              color: "#ffffff",
              fontSize: 13,
              fontFamily: "Inter, system-ui, sans-serif",
              letterSpacing: 0.5,
              whiteSpace: "nowrap",
              padding: "3px 8px",
              borderLeft: "1px solid rgba(255,255,255,0.9)",
              background: "rgba(0,0,0,0.6)",
              textShadow: "0 0 10px rgba(160,200,255,0.6)",
              transition: "opacity 150ms",
            }}
          >
            {g.name}
            <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>
              {g.type} · {g.distance >= 1_000_000
                ? (g.distance / 1_000_000).toFixed(2) + " Mly"
                : (g.distance / 1000).toFixed(0) + " kly"}
            </div>
          </div>
        </Html>
      </Billboard>
    </group>
  );
}

export const NAMED_GALAXIES = NEARBY_GALAXIES.map((g) => ({
  ...g,
  position: toXYZ(g.l, g.b, g.distance),
}));

// Cosmic-web / large-scale structure: a spherical shell of galaxy points
// with filamentary clustering, out to ~1 Gly. Each point is a distant
// galaxy. We use several logarithmic-radius shells so the eye perceives
// depth over ~7 orders of magnitude in scale.
function useCosmicWeb() {
  return useMemo(() => {
    const shells = [
      { rMin: 3e6, rMax: 3e7, n: 14000, warm: 0.5, size: 60 }, // Virgo Supercluster region
      { rMin: 3e7, rMax: 3e8, n: 26000, warm: 0.4, size: 90 }, // Laniakea + neighbors
      { rMin: 3e8, rMax: 3e9, n: 38000, warm: 0.3, size: 140 }, // large-scale filaments
      { rMin: 3e9, rMax: 4.5e10, n: 46000, warm: 0.2, size: 220 }, // out to observable universe
    ];

    // Filament seeds — clumps that galaxies gravitate toward
    const seeds: THREE.Vector3[] = [];
    for (let i = 0; i < 220; i++) {
      const u = Math.random(), v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      seeds.push(new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta),
        Math.cos(phi),
        Math.sin(phi) * Math.sin(theta),
      ));
    }
    const geoms: THREE.BufferGeometry[] = [];
    const sizes: number[] = [];
    for (const s of shells) {
      const pos = new Float32Array(s.n * 3);
      const col = new Float32Array(s.n * 3);
      for (let i = 0; i < s.n; i++) {
        // logarithmic radius so density looks even at all zoom scales
        const t = Math.random();
        const r = s.rMin * Math.pow(s.rMax / s.rMin, t);
        // filament clustering: pick a random direction, but 70% of the time
        // bias toward the nearest seed direction
        let dir = new THREE.Vector3(
          Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5,
        ).normalize();
        if (Math.random() < 0.72) {
          const seed = seeds[Math.floor(Math.random() * seeds.length)];
          const jitter = new THREE.Vector3(
            (Math.random() - 0.5) * 0.35,
            (Math.random() - 0.5) * 0.35,
            (Math.random() - 0.5) * 0.35,
          );
          dir = seed.clone().add(jitter).normalize();
        }
        pos[i * 3] = dir.x * r;
        pos[i * 3 + 1] = dir.y * r;
        pos[i * 3 + 2] = dir.z * r;
        // Color: mix warm (elliptical/old) and cool (spiral) galaxies
        const warm = Math.random() < s.warm;
        if (warm) {
          col[i * 3] = 1.0; col[i * 3 + 1] = 0.82; col[i * 3 + 2] = 0.55;
        } else {
          col[i * 3] = 0.82; col[i * 3 + 1] = 0.88; col[i * 3 + 2] = 1.0;
        }
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
      geoms.push(geo);
      sizes.push(s.size);
    }
    return { geoms, sizes };
  }, []);
}

function CosmicWeb() {
  const { geoms, sizes } = useCosmicWeb();
  const tex = useMemo(makeDotTexture, []);
  const materials = useMemo(
    () => sizes.map((s) => new THREE.PointsMaterial({
      map: tex,
      size: s,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      opacity: 0.9,
    })),
    [tex, sizes],
  );
  return (
    <group>
      {geoms.map((g, i) => (
        <points key={i} geometry={g} material={materials[i]} frustumCulled={false} />
      ))}
    </group>
  );
}

// Observable-universe boundary — a very faint sphere at ~46.5 Gly.
// Rendered from the inside so you can see it when zoomed all the way out.
function ObservableUniverseShell() {
  const geo = useMemo(() => new THREE.SphereGeometry(4.65e10, 48, 32), []);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uTime: { value: 0 } },
        vertexShader: /* glsl */ `
          varying vec3 vN;
          void main(){
            vN = normalize(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uTime;
          varying vec3 vN;
          // faint CMB-like temperature fluctuations
          float hash(vec3 p){ return fract(sin(dot(p, vec3(127.1,311.7,74.7))) * 43758.5453); }
          float noise(vec3 p){
            vec3 i = floor(p), f = fract(p);
            float n = mix(mix(mix(hash(i), hash(i+vec3(1,0,0)), f.x),
                              mix(hash(i+vec3(0,1,0)), hash(i+vec3(1,1,0)), f.x), f.y),
                          mix(mix(hash(i+vec3(0,0,1)), hash(i+vec3(1,0,1)), f.x),
                              mix(hash(i+vec3(0,1,1)), hash(i+vec3(1,1,1)), f.x), f.y), f.z);
            return n;
          }
          void main(){
            float n = noise(vN * 12.0) * 0.5 + noise(vN * 40.0) * 0.5;
            vec3 warm = vec3(1.0, 0.55, 0.35);
            vec3 cool = vec3(0.35, 0.55, 1.0);
            vec3 col = mix(cool, warm, n);
            gl_FragColor = vec4(col * 0.28, 0.55);
          }
        `,
      }),
    [],
  );
  return <mesh geometry={geo} material={mat} frustumCulled={false} />;
}

// The Milky Way's own "own-galaxy" sprite seen from far away, so when you
// pull back beyond the Local Group the Milky Way itself reads as a spiral
// disc among neighbors instead of vanishing into individual stars.
function MilkyWayFarSprite() {
  const ref = useRef<THREE.Sprite>(null!);
  const tex = useMemo(() => makeSpiralGalaxyTexture(), []);
  useFrame(({ camera }) => {
    if (!ref.current) return;
    const d = camera.position.length();
    // Fade in only when the camera is beyond ~200,000 ly (outside the disk)
    const a = Math.min(1, Math.max(0, (d - 200_000) / 400_000));
    (ref.current.material as THREE.SpriteMaterial).opacity = a * 0.9;
  });
  return (
    <sprite ref={ref} position={[-26000, 0, 0]} scale={[100_000, 100_000, 1]}>
      <spriteMaterial map={tex} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0} />
    </sprite>
  );
}

export function Universe() {
  const spiralTex = useMemo(() => makeSpiralGalaxyTexture(), []);
  const ellipTex = useMemo(makeEllipticalGalaxyTexture, []);
  const irrTex = useMemo(makeIrregularTexture, []);
  return (
    <group>
      <ObservableUniverseShell />
      <CosmicWeb />
      <MilkyWayFarSprite />
      {NEARBY_GALAXIES.map((g) => (
        <NamedGalaxyDisc key={g.name} g={g} spiralTex={spiralTex} ellipTex={ellipTex} irrTex={irrTex} />
      ))}
    </group>
  );
}
