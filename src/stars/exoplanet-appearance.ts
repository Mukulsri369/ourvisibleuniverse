import * as THREE from "three";
import { blackbodyTemperatureToRGB } from "./color-science";
import type { NamedStar } from "./data";
import type { ExoPlanet } from "./exosystems";

/**
 * Physically motivated appearance for exoplanet surfaces. No exoplanet has been
 * resolved into a disk, so every surface pattern is illustrative. What the
 * renderer takes from physics: the host star's light colour, the class of
 * cloud deck expected at the planet's temperature, blackbody glow where a
 * planet is hot enough to emit visible light, and the published dark albedo
 * of hot Jupiters.
 *
 * Giant-planet classes follow Sudarsky, Burrows & Hubeny (2003, ApJ 588, 1121):
 * I ammonia clouds (< 150 K), II water clouds (< 350 K), III cloud-free and
 * blue (< 800 K), IV dark alkali absorbers (< 1400 K), V silicate clouds.
 * Classes IV–V are drawn dark because measured hot-Jupiter geometric albedos
 * are mostly below 0.1 (Esteves et al. 2015, ApJ 804, 150; HD 209458 b:
 * Ag = 0.038 ± 0.045, Rowe et al. 2008, ApJ 689, 1345).
 */

// 0 airless rock, 1 temperate world, 2 lava world, 3 gas giant, 4 ice giant / sub-Neptune
export function surfaceMode(p: ExoPlanet): number {
  const k = p.kind;
  if (k === "Lava world" || (p.teqK > 1100 && p.radiusEarth < 2.5)) return 2;
  if (k === "Hot Jupiter" || k === "Gas giant") return 3;
  // Below ~1.6 Earth radii planets are mostly rocky (Rogers 2015, ApJ 801, 41),
  // so a small cold world is drawn as rock, not as an ice giant.
  if (k === "Ice giant" || k === "Mini-Neptune" || k === "Warm Neptune")
    return p.radiusEarth < 1.6 ? 0 : 4;
  // Above that size a temperate world most likely keeps a thick envelope (K2-18 b).
  if (k === "Ocean world" || p.inHZ) return p.radiusEarth < 1.6 ? 1 : p.radiusEarth < 6 ? 4 : 3;
  return 0;
}

/** Planck radiance at 600 nm in relative units, so emitted and reflected light share one scale. */
export const planck600 = (kelvin: number) => 1 / Math.expm1(23_980 / Math.max(kelvin, 1));

type Palette = [zone: string, belt: string, haze: string, label: string];
function giantPalette(teq: number, icy: boolean): Palette {
  if (icy) {
    if (teq < 100) return ["#a5d4dc", "#8bbccb", "#bfe6ee", "Methane-blue ice giant"];
    if (teq < 400) return ["#c3d6e4", "#a3bccf", "#d6e6f2", "Temperate sub-Neptune"];
    if (teq < 900) return ["#c9bea9", "#ab9f8a", "#d9cdb5", "Hazy warm sub-Neptune"];
    return ["#5d5148", "#463c35", "#8a6a55", "Hot hazy sub-Neptune"];
  }
  if (teq < 150) return ["#e4d4b6", "#a9784f", "#efe2c8", "Sudarsky I: ammonia clouds"];
  if (teq < 350) return ["#eef0f3", "#c6cbd2", "#f6f7f9", "Sudarsky II: water clouds"];
  if (teq < 800) return ["#4b76c8", "#365a9f", "#7ea4ea", "Sudarsky III: cloud-free, blue"];
  // Dark blue: the measured colour of the similar HD 189733 b (Evans et al. 2013, ApJL 772, L16).
  if (teq < 1400) return ["#2c3a52", "#1b2333", "#4a6aa8", "Sudarsky IV: dark alkali absorbers"];
  return ["#3d3430", "#241d1a", "#6e4a38", "Sudarsky V: hot silicate clouds"];
}

const linear = (hex: string) => new THREE.Color(hex);

export type ExoAppearance = {
  mode: number;
  label: string;
  zone: THREE.Color;
  belt: THREE.Color;
  haze: THREE.Color;
  /** Linear star colour, brightest channel 1 (a red dwarf's light is dimmer and red). */
  light: THREE.Color;
  /** Number of zonal bands across the disk (giants). */
  bands: number;
  /** Band contrast 0–1. */
  contrast: number;
  /** Atmospheric limb thickness in planet radii (0 = airless). */
  atmosphere: number;
  /** Substellar temperature of a bare surface with no heat redistribution. */
  tSub: number;
  tDay: number;
  tNight: number;
  /** Internal (self-luminous) effective temperature, 0 when unknown. */
  tInt: number;
  /** 1 / (stellar 600 nm radiance × dilution): converts planck600(T) into reflectance units. */
  emissionScale: number;
  rings: boolean;
};

export function exoAppearance(p: ExoPlanet, star: NamedStar, seed: number): ExoAppearance {
  const mode = surfaceMode(p);
  const rStarAU = star.radius * 0.00465047;
  const dilution = (rStarAU / p.aAU) ** 2;
  const bb = blackbodyTemperatureToRGB(star.temperature);
  const light = new THREE.Color().setRGB(bb.r, bb.g, bb.b, THREE.SRGBColorSpace);
  light.multiplyScalar(1 / Math.max(light.r, light.g, light.b));
  const giant = mode === 3 || mode === 4;
  // Day/night temperatures (Cowan & Agol 2011, ApJ 729, 54) with Bond albedo 0.1 and a
  // heat-redistribution efficiency that falls from 1 at 1000 K to 0 at 2000 K, as
  // observed for hot Jupiters (Schwartz & Cowan 2015, MNRAS 449, 4192).
  const tSub = star.temperature * Math.sqrt(rStarAU / p.aAU);
  const t0 = tSub * 0.9 ** 0.25;
  const eps = THREE.MathUtils.clamp(2 - p.teqK / 1000, 0, 1);
  // A self-luminous giant's cloud deck is set by its own temperature, not by starlight.
  const cloudT = Math.max(p.teqK, p.teffK ?? 0);
  const [zone, belt, haze, label] = giant
    ? giantPalette(cloudT, mode === 4)
    : mode === 2
      ? ["#2a2321", "#1a1615", "#ff7a3a", "Lava world: molten dayside"]
      : mode === 1
        ? ["#1d4f74", "#0a2240", "#5f8fe8", "Temperate world (illustrative oceans and land)"]
        : ["#6c6660", "#46423e", "#000000", "Airless rock (basaltic, dark)"];
  return {
    mode,
    label,
    zone: linear(zone),
    belt: linear(belt),
    haze: linear(haze),
    light,
    bands: mode === 3 ? 7 + Math.floor((seed % 1) * 6) : 3 + Math.floor((seed % 1) * 3),
    contrast: mode === 3 ? (cloudT < 350 ? 0.9 : 0.45) : 0.25,
    atmosphere: mode === 0 ? 0 : giant ? 0.035 : mode === 2 ? 0.012 : 0.02,
    tSub,
    tDay: t0 * (2 / 3 - (5 * eps) / 12) ** 0.25,
    tNight: Math.max(t0 * (eps / 4) ** 0.25, 0.4 * p.teqK),
    tInt: p.teffK ?? 0,
    emissionScale: 1 / Math.max(1e-30, planck600(star.temperature) * dilution),
    // Rings are only drawn on modelled planets: none are known around these real worlds.
    rings: !p.observed && giant && p.aAU > 0.35 && Math.floor(seed * 10) % 3 === 0,
  };
}

let noise: THREE.Data3DTexture | null = null;
/**
 * One shared 64³ tileable noise volume (1 MB): RGB are independent smooth
 * lattice noises, A is a crater height field. Sampling it in 3D on the unit
 * sphere gives seamless surfaces with no polar pinching at any zoom.
 */
export function exoNoiseVolume() {
  if (noise) return noise;
  const N = 64,
    CELLS = 16,
    data = new Uint8Array(N * N * N * 4);
  const hash = (x: number, y: number, z: number, c: number) => {
    let h = Math.imul(x & 15, 73856093) ^ Math.imul(y & 15, 19349663) ^ Math.imul(z & 15, 83492791);
    h = Math.imul(h ^ (h >>> 15) ^ Math.imul(c + 1, 2654435761), 2246822519);
    return ((h ^ (h >>> 13)) >>> 0) / 4294967295;
  };
  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
  for (let z = 0; z < N; z++)
    for (let y = 0; y < N; y++)
      for (let x = 0; x < N; x++) {
        const px = (x * CELLS) / N,
          py = (y * CELLS) / N,
          pz = (z * CELLS) / N;
        const ix = Math.floor(px),
          iy = Math.floor(py),
          iz = Math.floor(pz);
        const u = fade(px - ix),
          v = fade(py - iy),
          w = fade(pz - iz);
        const i = ((z * N + y) * N + x) * 4;
        for (let c = 0; c < 3; c++) {
          const l = (a: number, b: number, t: number) => a + (b - a) * t;
          const h = (dx: number, dy: number, dz: number) => hash(ix + dx, iy + dy, iz + dz, c);
          const value = l(
            l(l(h(0, 0, 0), h(1, 0, 0), u), l(h(0, 1, 0), h(1, 1, 0), u), v),
            l(l(h(0, 0, 1), h(1, 0, 1), u), l(h(0, 1, 1), h(1, 1, 1), u), v),
            w,
          );
          data[i + c] = value * 255;
        }
        data[i + 3] = 128;
      }
  // Crater field: bowl, raised rim and ejecta, many small and few large (power law).
  const field = new Float32Array(N * N * N);
  let state = 0x9e3779b9;
  const rand = () => {
    state = Math.imul(state ^ (state >>> 15), 0x2c1b3c6d) + 0x6d2b79f5;
    return ((state ^ (state >>> 13)) >>> 0) / 4294967296;
  };
  for (let k = 0; k < 260; k++) {
    const cx = rand() * N,
      cy = rand() * N,
      cz = rand() * N;
    const r = 1.4 * Math.pow(1 - rand() * 0.97, -0.55);
    const reach = Math.ceil(r * 1.8);
    for (let dz = -reach; dz <= reach; dz++)
      for (let dy = -reach; dy <= reach; dy++)
        for (let dx = -reach; dx <= reach; dx++) {
          const x = Math.floor(cx) + dx,
            y = Math.floor(cy) + dy,
            z = Math.floor(cz) + dz;
          const d = Math.hypot(x - cx, y - cy, z - cz) / r;
          if (d > 1.8) continue;
          const bowl = d < 1 ? (d * d - 1) * 0.55 : 0;
          const rim = 0.22 * Math.exp(-(((d - 1) / 0.22) ** 2));
          const ejecta = d > 1 ? 0.05 * Math.exp(-(d - 1) * 3) : 0;
          field[(((z + N) % N) * N + ((y + N) % N)) * N + ((x + N) % N)] += bowl + rim + ejecta;
        }
  }
  for (let i = 0; i < field.length; i++)
    data[i * 4 + 3] = Math.max(0, Math.min(255, 128 + field[i] * 110));
  noise = new THREE.Data3DTexture(data, N, N, N);
  noise.format = THREE.RGBAFormat;
  noise.wrapS = noise.wrapT = noise.wrapR = THREE.RepeatWrapping;
  noise.magFilter = noise.minFilter = THREE.LinearFilter;
  noise.unpackAlignment = 1;
  noise.needsUpdate = true;
  return noise;
}
