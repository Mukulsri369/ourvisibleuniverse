import type { NamedStar } from "./data";

/**
 * Deterministic procedural planetary systems for catalogue stars.
 * Seeded by the star name and shaped by real stellar parameters: habitable
 * zone from luminosity, snow line, Kepler's third law, equilibrium
 * temperature, and dynamically spaced (period-ratio ≥ ~1.4) orbits.
 * Everything here is a model — never presented as observed planets.
 */
export type ExoKind =
  | "Lava world"
  | "Rocky world"
  | "Super-Earth"
  | "Ocean world"
  | "Mini-Neptune"
  | "Warm Neptune"
  | "Hot Jupiter"
  | "Gas giant"
  | "Ice giant";

export type ExoPlanet = {
  name: string;
  kind: ExoKind;
  aAU: number;
  e: number;
  incl: number;
  periodYears: number;
  radiusEarth: number;
  massEarth: number;
  teqK: number;
  inHZ: boolean;
  esi: number;
  tidallyLocked: boolean;
  color: string;
  phase: number;
};

export type ExoSystemModel = {
  star: string;
  hzInner: number;
  hzOuter: number;
  snowLine: number;
  planets: ExoPlanet[];
};

function rng(seedStr: string) {
  let h = 2166136261;
  for (let i = 0; i < seedStr.length; i++) h = Math.imul(h ^ seedStr.charCodeAt(i), 16777619);
  let t = h >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const COLORS: Record<ExoKind, string[]> = {
  "Lava world": ["#ff6a2a", "#d8461c"],
  "Rocky world": ["#9a8a78", "#b39a80", "#7d7268"],
  "Super-Earth": ["#7f8f6a", "#a08a6a"],
  "Ocean world": ["#3a7bd5", "#2d6ea8"],
  "Mini-Neptune": ["#7fb5d9", "#9ccbe0"],
  "Warm Neptune": ["#6aa6c8", "#88b8d0"],
  "Hot Jupiter": ["#c86a3c", "#b0552e"],
  "Gas giant": ["#d9b98a", "#c8a77a", "#e0c9a0"],
  "Ice giant": ["#8fd3e0", "#5f8fe0"],
};

const ROMAN = "bcdefghij";
const cache = new Map<string, ExoSystemModel>();

export function exoSystemFor(star: NamedStar): ExoSystemModel {
  const hit = cache.get(star.name);
  if (hit) return hit;
  const rand = rng(star.name + ":exo");
  const L = Math.max(1e-5, star.luminosity);
  const M = Math.max(0.05, star.mass);
  const Rau = star.radius * 0.00465047;
  const hzInner = Math.sqrt(L / 1.1);
  const hzOuter = Math.sqrt(L / 0.53);
  const snowLine = 2.7 * Math.sqrt(L);
  const isWD = /^D/.test(star.spectral);
  const isGiant = star.radius > 8;
  const hot = star.temperature > 11000;

  let n = star.planets > 0 ? Math.min(9, star.planets) : 2 + Math.floor(rand() * 5);
  if (isWD) n = Math.min(n, 1 + Math.floor(rand() * 2));
  if (hot || isGiant) n = Math.min(n, 1 + Math.floor(rand() * 3));

  const minA = Math.max(0.012, Rau * 3.5, 0.03 * Math.sqrt(L) * (isGiant ? 3 : 1));
  const maxA = 80;
  const planets: ExoPlanet[] = [];
  let a = minA * (1 + rand() * 2);
  for (let i = 0; i < n && a < maxA; i++) {
    const beyondSnow = a > snowLine;
    let kind: ExoKind;
    const r = rand();
    const Teq0 = star.temperature * Math.sqrt(Rau / (2 * a));
    if (Teq0 > 1500) kind = r < 0.25 ? "Hot Jupiter" : "Lava world";
    else if (beyondSnow) kind = r < 0.55 ? "Gas giant" : "Ice giant";
    else if (a >= hzInner && a <= hzOuter) kind = r < 0.35 ? "Ocean world" : r < 0.7 ? "Super-Earth" : "Rocky world";
    else kind = r < 0.35 ? "Rocky world" : r < 0.65 ? "Super-Earth" : r < 0.85 ? "Mini-Neptune" : "Warm Neptune";

    const radiusEarth =
      kind === "Hot Jupiter" || kind === "Gas giant"
        ? 8 + rand() * 6
        : kind === "Ice giant" || kind === "Warm Neptune"
          ? 3.2 + rand() * 1.8
          : kind === "Mini-Neptune"
            ? 2 + rand() * 1.2
            : kind === "Super-Earth" || kind === "Ocean world"
              ? 1.3 + rand() * 0.6
              : 0.5 + rand() * 0.7;
    const massEarth =
      radiusEarth > 6 ? 60 + rand() * 900 : radiusEarth > 2 ? 4 + radiusEarth * radiusEarth * 1.2 : Math.pow(radiusEarth, 3.7);
    const albedo = radiusEarth > 6 ? 0.34 : kind === "Ocean world" ? 0.3 : 0.25;
    const teqK = Teq0 * Math.pow(1 - albedo, 0.25);
    const inHZ = a >= hzInner && a <= hzOuter;
    const esi = Math.max(
      0,
      Math.pow(1 - Math.abs((radiusEarth - 1) / (radiusEarth + 1)), 0.57) *
        Math.pow(1 - Math.abs((teqK - 255) / (teqK + 255)), 5.58 / 2),
    );
    const periodYears = Math.sqrt((a * a * a) / M);
    const pal = COLORS[kind];
    planets.push({
      name: `${star.name} ${ROMAN[i]}`,
      kind,
      aAU: a,
      e: Math.min(0.35, Math.pow(rand(), 3) * 0.4),
      incl: (rand() - 0.5) * 0.08,
      periodYears,
      radiusEarth,
      massEarth,
      teqK,
      inHZ,
      esi,
      tidallyLocked: a < 0.1 * Math.sqrt(M) * 2,
      color: pal[Math.floor(rand() * pal.length)],
      phase: rand() * Math.PI * 2,
    });
    // Mutual-Hill-stable spacing: period ratios ~1.5–2.6
    a *= 1.4 + rand() * 1.0;
  }
  const sys = { star: star.name, hzInner, hzOuter, snowLine, planets };
  cache.set(star.name, sys);
  return sys;
}
