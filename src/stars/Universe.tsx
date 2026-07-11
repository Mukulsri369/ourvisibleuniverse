import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

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

export type NamedGalaxy = {
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
  image?: string; // real photograph URL (Wikimedia)
  description?: string;
};

// Wikimedia stable file-path redirect
const wm = (file: string) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${file}?width=640`;

const NEARBY_GALAXIES: NamedGalaxy[] = [
  { name: "Large Magellanic Cloud", type: "Irregular", l: 280.5, b: -32.9, distance: 163_000, size: 14_000, color: "#c9d6ff", inclination: 35,
    image: wm("Large_Magellanic_Cloud.jpg"),
    description: "A satellite galaxy of the Milky Way, visible to the naked eye in the southern sky. Home to the Tarantula Nebula, the most active star-forming region in the Local Group." },
  { name: "Small Magellanic Cloud", type: "Irregular", l: 302.8, b: -44.3, distance: 200_000, size: 7_000, color: "#cfd8ff", inclination: 40,
    image: wm("Small_Magellanic_Cloud_(Digitized_Sky_Survey_2).jpg"),
    description: "A dwarf irregular companion of the Milky Way, gravitationally distorted by the LMC and our galaxy." },
  { name: "Sagittarius Dwarf", type: "Dwarf Elliptical", l: 5.6, b: -14.1, distance: 65_000, size: 10_000, color: "#ffe0b0",
    description: "A small satellite galaxy currently being tidally shredded and consumed by the Milky Way." },
  { name: "Canis Major Dwarf", type: "Dwarf Irregular", l: 240.0, b: -8.0, distance: 25_000, size: 5_000, color: "#ffd8a0",
    description: "The closest known galaxy to the Sun — a tidal remnant merging with the Milky Way's disk." },
  { name: "Andromeda (M31)", type: "Spiral", l: 121.2, b: -21.6, distance: 2_537_000, size: 220_000, color: "#e8ecff", inclination: 77, posAngle: 35,
    image: wm("Andromeda_Galaxy_(with_h-alpha).jpg"),
    description: "The nearest large spiral galaxy and the most massive in the Local Group. Contains a trillion stars and is on a collision course with the Milky Way in ~4.5 billion years." },
  { name: "Triangulum (M33)", type: "Spiral", l: 133.6, b: -31.3, distance: 2_730_000, size: 60_000, color: "#d8e4ff", inclination: 54, posAngle: 22,
    image: wm("VST_snaps_a_very_detailed_view_of_the_Triangulum_Galaxy.jpg"),
    description: "The third-largest galaxy in the Local Group, a face-on spiral with vigorous star formation." },
  { name: "NGC 205 (M110)", type: "Dwarf Elliptical", l: 120.7, b: -21.1, distance: 2_690_000, size: 17_000, color: "#ffe4c8",
    image: wm("Messier_110.jpg"),
    description: "A dwarf elliptical satellite of Andromeda." },
  { name: "IC 10", type: "Starburst Irregular", l: 119.0, b: -3.3, distance: 2_200_000, size: 5_000, color: "#ffc0d0",
    description: "The only known starburst galaxy in the Local Group." },
  { name: "NGC 6822 (Barnard's Galaxy)", type: "Irregular", l: 25.3, b: -18.4, distance: 1_630_000, size: 7_000, color: "#ffd8b0",
    image: wm("NGC_6822_HST.jpg"),
    description: "A dwarf irregular galaxy discovered by E. E. Barnard in 1884." },
  { name: "Leo I", type: "Dwarf Spheroidal", l: 226.0, b: 49.1, distance: 820_000, size: 3_000, color: "#ffe8c8",
    description: "A dwarf spheroidal companion of the Milky Way in the constellation Leo." },
  { name: "Leo II", type: "Dwarf Spheroidal", l: 220.2, b: 67.2, distance: 690_000, size: 2_000, color: "#ffe8c8",
    description: "A small, faint satellite galaxy of the Milky Way." },
  { name: "Draco Dwarf", type: "Dwarf Spheroidal", l: 86.4, b: 34.7, distance: 260_000, size: 2_500, color: "#ffe8c8" },
  { name: "Sculptor Dwarf", type: "Dwarf Spheroidal", l: 287.5, b: -83.2, distance: 290_000, size: 2_800, color: "#ffe8c8" },
  { name: "Fornax Dwarf", type: "Dwarf Spheroidal", l: 237.1, b: -65.7, distance: 460_000, size: 3_000, color: "#ffe8c8" },
  { name: "Ursa Minor Dwarf", type: "Dwarf Spheroidal", l: 105.0, b: 44.8, distance: 220_000, size: 2_000, color: "#ffe8c8" },
  { name: "Carina Dwarf", type: "Dwarf Spheroidal", l: 260.1, b: -22.2, distance: 330_000, size: 1_600, color: "#ffe8c8" },
  { name: "Sextans Dwarf", type: "Dwarf Spheroidal", l: 243.5, b: 42.3, distance: 280_000, size: 3_000, color: "#ffe8c8" },
  { name: "NGC 300", type: "Spiral", l: 299.2, b: -79.4, distance: 6_100_000, size: 60_000, color: "#dde6ff", inclination: 42,
    image: wm("NGC_300.jpg") },
  { name: "NGC 55", type: "Barred Spiral", l: 332.9, b: -75.7, distance: 6_500_000, size: 70_000, color: "#dde6ff", inclination: 78 },
  { name: "Centaurus A (NGC 5128)", type: "Lenticular", l: 309.5, b: 19.4, distance: 13_000_000, size: 60_000, color: "#ffc898", inclination: 60,
    image: wm("Centaurus_A_(NGC_5128).jpg"),
    description: "A peculiar elliptical galaxy with a prominent dark dust lane, the result of a past merger. Hosts a supermassive black hole and powerful radio jets." },
  { name: "M81 (Bode's Galaxy)", type: "Spiral", l: 142.1, b: 40.9, distance: 12_000_000, size: 90_000, color: "#dae4ff", inclination: 62,
    image: wm("Messier_81_HST.jpg"),
    description: "A grand-design spiral galaxy in Ursa Major with an active galactic nucleus and a supermassive black hole 70× the mass of Sagittarius A*." },
  { name: "M82 (Cigar Galaxy)", type: "Starburst", l: 141.4, b: 40.6, distance: 12_000_000, size: 37_000, color: "#ffd0c0", inclination: 80, posAngle: 65,
    image: wm("M82_HST_ACS_2006-14-a-large_web.jpg"),
    description: "A starburst galaxy 5× more luminous than the Milky Way, driven by a gravitational encounter with M81." },
  { name: "NGC 253 (Sculptor Galaxy)", type: "Spiral", l: 97.4, b: -88.0, distance: 11_400_000, size: 90_000, color: "#dfe8ff", inclination: 78,
    image: wm("NGC_253_Galaxy.jpg") },
  { name: "M83 (Southern Pinwheel)", type: "Barred Spiral", l: 314.6, b: 32.0, distance: 15_000_000, size: 55_000, color: "#e0eaff", inclination: 24,
    image: wm("Messier_83_-_Heic1403a.jpg"),
    description: "A face-on barred spiral known for prolific star formation and numerous supernovae." },
  { name: "M94", type: "Spiral", l: 123.4, b: 76.0, distance: 16_000_000, size: 50_000, color: "#e2ecff", inclination: 35 },
  { name: "M101 (Pinwheel Galaxy)", type: "Spiral", l: 102.0, b: 59.8, distance: 21_000_000, size: 170_000, color: "#e5efff", inclination: 18,
    image: wm("M101_hires_STScI-PRC2006-10a.jpg"),
    description: "A giant face-on spiral 70% larger than the Milky Way, showing prominent asymmetric star-forming arms." },
  { name: "M51 (Whirlpool Galaxy)", type: "Spiral", l: 104.9, b: 68.6, distance: 23_000_000, size: 76_000, color: "#e0ebff", inclination: 22, posAngle: 10,
    image: wm("Messier51_sRGB.jpg"),
    description: "A grand-design spiral interacting with the dwarf galaxy NGC 5195. The first galaxy in which spiral structure was recognized." },
  { name: "M104 (Sombrero Galaxy)", type: "Lenticular", l: 298.5, b: 51.1, distance: 29_000_000, size: 50_000, color: "#ffd8b0", inclination: 84, posAngle: 90,
    image: wm("M104_ngc4594_sombrero_galaxy_hi-res.jpg"),
    description: "An edge-on lenticular galaxy defined by a bright bulge and a striking dark dust lane." },
  { name: "NGC 1300", type: "Barred Spiral", l: 209.6, b: -52.4, distance: 61_000_000, size: 110_000, color: "#dde8ff", inclination: 45,
    image: wm("Barred_Spiral_Galaxy_NGC_1300.jpg"),
    description: "One of the most striking examples of a barred spiral galaxy." },
  { name: "M87 (Virgo A)", type: "Elliptical", l: 283.8, b: 74.5, distance: 53_000_000, size: 240_000, color: "#ffe0b0",
    image: wm("Black_hole_-_Messier_87_crop_max_res.jpg"),
    description: "The dominant elliptical galaxy of the Virgo Cluster, whose supermassive black hole was the first ever imaged (EHT, 2019)." },
  { name: "M49", type: "Elliptical", l: 286.9, b: 70.2, distance: 56_000_000, size: 160_000, color: "#ffe0b0" },
  { name: "M60", type: "Elliptical", l: 291.2, b: 74.3, distance: 55_000_000, size: 120_000, color: "#ffe0b0" },
  { name: "NGC 4038/4039 (Antennae)", type: "Interacting", l: 286.2, b: 42.5, distance: 45_000_000, size: 90_000, color: "#ffcadd",
    image: wm("Antennae_galaxies_xl.jpg"),
    description: "A pair of colliding spiral galaxies whose tidal streams form long, antenna-like tails." },
  { name: "M64 (Black Eye Galaxy)", type: "Spiral", l: 315.7, b: 84.4, distance: 17_000_000, size: 54_000, color: "#e2e8ff", inclination: 58,
    image: wm("Messier_64_-_Hubble_Space_Telescope.jpg"),
    description: "Famous for a spectacular dark band of dust in front of its bright nucleus." },
  { name: "NGC 4565 (Needle Galaxy)", type: "Spiral", l: 230.8, b: 86.4, distance: 40_000_000, size: 100_000, color: "#e0e6ff", inclination: 88 },
  { name: "M77 (Cetus A)", type: "Barred Spiral", l: 172.1, b: -51.9, distance: 47_000_000, size: 170_000, color: "#e6efff",
    description: "A Seyfert galaxy with a very active galactic nucleus." },
  { name: "M74", type: "Spiral", l: 138.0, b: -45.7, distance: 32_000_000, size: 95_000, color: "#e4edff", inclination: 20,
    image: wm("Messier_74_by_HST.jpg") },
  { name: "NGC 2903", type: "Barred Spiral", l: 208.7, b: 44.5, distance: 30_000_000, size: 80_000, color: "#e0e8ff", inclination: 60 },
  { name: "NGC 891", type: "Spiral", l: 140.4, b: -17.4, distance: 30_000_000, size: 100_000, color: "#dae2ff", inclination: 90 },
  { name: "NGC 6946 (Fireworks)", type: "Spiral", l: 95.7, b: 11.7, distance: 25_200_000, size: 40_000, color: "#ffd8c8", inclination: 33,
    description: "Nicknamed the Fireworks Galaxy for hosting 10 supernovae in the last century." },
  { name: "Sombrero Group", type: "Elliptical", l: 285.0, b: 60.0, distance: 60_000_000, size: 100_000, color: "#ffe0b0" },
  { name: "NGC 1365", type: "Barred Spiral", l: 237.9, b: -54.6, distance: 56_000_000, size: 200_000, color: "#dde8ff", inclination: 55,
    image: wm("A_Fornax_of_Beauty.jpg"),
    description: "The Great Barred Spiral in the Fornax Cluster." },
  { name: "NGC 4676 (Mice)", type: "Interacting", l: 285.5, b: 76.0, distance: 290_000_000, size: 60_000, color: "#ffc8d8",
    image: wm("The_Mice_Galaxies.jpg"),
    description: "A pair of colliding spirals with long tidal tails." },
  { name: "NGC 1275 (Perseus A)", type: "Elliptical", l: 150.6, b: -13.3, distance: 237_000_000, size: 180_000, color: "#ffe4c0",
    description: "Central galaxy of the Perseus Cluster, hosting a huge active nucleus." },
  { name: "NGC 4889", type: "Elliptical", l: 58.1, b: 87.9, distance: 308_000_000, size: 300_000, color: "#ffe0b0",
    description: "One of the two brightest galaxies of the Coma Cluster, with one of the most massive known black holes." },
];
export { NEARBY_GALAXIES };

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
    for (let i = 0; i < 900; i++) {
      const t = i / 900;
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
  for (let i = 0; i < 400; i++) {
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

import { useStore } from "./store";

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
  const rot = useMemo(() => {
    const incl = ((g.inclination ?? 0) * Math.PI) / 180;
    const pa = ((g.posAngle ?? 0) * Math.PI) / 180;
    return new THREE.Euler(incl, 0, pa);
  }, [g]);
  const onClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    useStore.getState().flyToGalaxy({
      name: g.name, type: g.type, distance: g.distance, size: g.size, color: g.color,
      x: pos.x, y: pos.y, z: pos.z, image: g.image, description: g.description,
    });
  };
  return (
    <mesh ref={meshRef} position={pos} rotation={rot} frustumCulled={false} onClick={onClick}>
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
  );
}

export const NAMED_GALAXIES = NEARBY_GALAXIES.map((g) => ({
  ...g,
  position: toXYZ(g.l, g.b, g.distance),
}));

// Cosmic-web / large-scale structure: purple filaments of galaxy points
// out to the observable universe. Denser and more strongly clustered
// than a random sphere so the eye reads it as the dark-matter web
// filaments visible in cosmological simulations (Millennium, IllustrisTNG).
function useCosmicWeb() {
  return useMemo(() => {
    const shells = [
      { rMin: 3e6, rMax: 3e7, n: 12000, size: 80 },    // Virgo Supercluster
      { rMin: 3e7, rMax: 3e8, n: 22000, size: 130 },   // Laniakea + neighbors
      { rMin: 3e8, rMax: 3e9, n: 32000, size: 200 },   // large-scale filaments
      { rMin: 3e9, rMax: 4.5e10, n: 40000, size: 320 },// out to observable universe
    ];
    // Filament seeds — galaxies cluster along these ridge lines
    const seeds: THREE.Vector3[] = [];
    for (let i = 0; i < 340; i++) {
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
        // logarithmic radius so density looks even across zoom scales
        const t = Math.random();
        const r = s.rMin * Math.pow(s.rMax / s.rMin, t);
        // Strong filament clustering: 88% of galaxies snap toward the
        // nearest seed direction with a tight jitter, 12% fill voids.
        let dir = new THREE.Vector3(
          Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5,
        ).normalize();
        if (Math.random() < 0.88) {
          const seed = seeds[Math.floor(Math.random() * seeds.length)];
          const jitter = new THREE.Vector3(
            (Math.random() - 0.5) * 0.22,
            (Math.random() - 0.5) * 0.22,
            (Math.random() - 0.5) * 0.22,
          );
          dir = seed.clone().add(jitter).normalize();
        }
        pos[i * 3] = dir.x * r;
        pos[i * 3 + 1] = dir.y * r;
        pos[i * 3 + 2] = dir.z * r;
        // Purple/violet palette — bright pinks on ridge nodes, deep
        // indigo elsewhere. Matches the Millennium-simulation look
        // (deep purple void, pink node highlights).
        const bright = Math.random() < 0.18;
        if (bright) {
          // Hot node — magenta / pink
          col[i * 3] = 1.0;
          col[i * 3 + 1] = 0.55 + Math.random() * 0.25;
          col[i * 3 + 2] = 1.0;
        } else {
          // Filament — violet / indigo
          const v = 0.55 + Math.random() * 0.35;
          col[i * 3] = 0.55 * v;
          col[i * 3 + 1] = 0.25 * v;
          col[i * 3 + 2] = 0.95 * v;
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
            float n = noise(vN * 10.0) * 0.55 + noise(vN * 36.0) * 0.45;
            // Deep violet void with magenta clumps — matches the
            // Millennium / IllustrisTNG cosmic-web imagery the user
            // referenced (image 1).
            vec3 deep = vec3(0.28, 0.10, 0.55);
            vec3 hot  = vec3(0.95, 0.35, 1.00);
            vec3 col  = mix(deep, hot, smoothstep(0.35, 0.85, n));
            gl_FragColor = vec4(col * 0.55, 0.85);
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

// ------ Galaxy labels ------
// Floating text sprites that fade in when the camera pulls back into the
// Local Group / cosmic-web range, so the view matches images 2 & 3 the
// user referenced (Andromeda, Milky Way, Ursa Major group visible).
function makeLabelTexture(text: string): THREE.Texture {
  const w = 512, h = 128;
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.clearRect(0, 0, w, h);
  ctx.font = "300 44px -apple-system, 'SF Pro Display', Helvetica, Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(0,0,0,0.85)";
  ctx.shadowBlur = 12;
  ctx.fillStyle = "rgba(240,230,255,0.95)";
  ctx.fillText(text, w / 2, h / 2);
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

type LabelDef = { text: string; pos: [number, number, number]; scale: number; showFrom: number; showTo: number };

function GalaxyLabel({ def }: { def: LabelDef }) {
  const ref = useRef<THREE.Sprite>(null!);
  const tex = useMemo(() => makeLabelTexture(def.text), [def.text]);
  useFrame(({ camera }) => {
    if (!ref.current) return;
    const d = camera.position.length();
    const fadeIn = Math.min(1, Math.max(0, (d - def.showFrom) / (def.showFrom * 0.5)));
    const fadeOut = Math.min(1, Math.max(0, (def.showTo - d) / (def.showTo * 0.5)));
    const a = fadeIn * fadeOut;
    (ref.current.material as THREE.SpriteMaterial).opacity = a * 0.9;
  });
  return (
    <sprite ref={ref} position={def.pos} scale={[def.scale, def.scale / 4, 1]}>
      <spriteMaterial map={tex} transparent depthWrite={false} opacity={0} />
    </sprite>
  );
}

function GalaxyLabels() {
  const labels = useMemo<LabelDef[]>(() => {
    const arr: LabelDef[] = [
      { text: "Milky Way", pos: [-26000, 0, 0], scale: 60_000, showFrom: 300_000, showTo: 5e8 },
      { text: "Andromeda Galaxy", pos: toXYZ(121.2, -21.6, 2_537_000).toArray() as [number, number, number], scale: 180_000, showFrom: 400_000, showTo: 5e7 },
      { text: "Triangulum (M33)", pos: toXYZ(133.6, -31.3, 2_730_000).toArray() as [number, number, number], scale: 130_000, showFrom: 500_000, showTo: 3e7 },
      { text: "Large Magellanic Cloud", pos: toXYZ(280.5, -32.9, 163_000).toArray() as [number, number, number], scale: 40_000, showFrom: 200_000, showTo: 5_000_000 },
      { text: "Small Magellanic Cloud", pos: toXYZ(302.8, -44.3, 200_000).toArray() as [number, number, number], scale: 32_000, showFrom: 200_000, showTo: 5_000_000 },
      { text: "M81 / M82 Group", pos: toXYZ(141.7, 40.7, 12_000_000).toArray() as [number, number, number], scale: 700_000, showFrom: 4_000_000, showTo: 2e8 },
      { text: "Centaurus A", pos: toXYZ(309.5, 19.4, 13_000_000).toArray() as [number, number, number], scale: 700_000, showFrom: 4_000_000, showTo: 2e8 },
      { text: "Sculptor Group", pos: toXYZ(97.4, -88.0, 11_400_000).toArray() as [number, number, number], scale: 700_000, showFrom: 4_000_000, showTo: 2e8 },
      { text: "Ursa Major Group", pos: toXYZ(140, 55, 18_000_000).toArray() as [number, number, number], scale: 900_000, showFrom: 5_000_000, showTo: 3e8 },
      { text: "Virgo Cluster", pos: toXYZ(283.8, 74.5, 53_000_000).toArray() as [number, number, number], scale: 3_000_000, showFrom: 2e7, showTo: 3e9 },
      { text: "Laniakea Supercluster", pos: [1.5e8, 0, 0], scale: 2e7, showFrom: 3e8, showTo: 2e10 },
    ];
    return arr;
  }, []);
  return (
    <group>
      {labels.map((l) => <GalaxyLabel key={l.text} def={l} />)}
    </group>
  );
}

export function Universe() {
  const spiralTex = useMemo(() => makeSpiralGalaxyTexture(), []);
  const ellipTex = useMemo(makeEllipticalGalaxyTexture, []);
  const irrTex = useMemo(makeIrregularTexture, []);
  return (
    <group>
      {/* ObservableUniverseShell removed — background is pure black */}
      <CosmicWeb />
      <MilkyWayFarSprite />
      {NEARBY_GALAXIES.map((g) => (
        <NamedGalaxyDisc key={g.name} g={g} spiralTex={spiralTex} ellipTex={ellipTex} irrTex={irrTex} />
      ))}
      <GalaxyLabels />
    </group>
  );
}
