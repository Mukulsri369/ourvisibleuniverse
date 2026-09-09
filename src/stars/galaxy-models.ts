import * as THREE from "three";
import { EXO_BODY_SCALE, EXO_STAR_MAGNIFY, LIGHT_YEARS_PER_AU, SOLAR_RADIUS_AU } from "./scale";
import { NEARBY_GALAXIES, type NamedGalaxy } from "./galaxy-catalog";

// ---------------------------------------------------------------
// GALAXY MODELS — data-driven definitions used by <GalaxyDetail />.
//
// Every entry describes a real galaxy: its true sky position
// (galactic l, b + distance), its measured orientation (inclination
// and position angle), its physical size, and its morphology, so the
// particle builder can reproduce roughly the shape it really has.
//
// Each galaxy also carries a star system that can be visited. Only two
// planet candidates are actually known outside the Milky Way
// (PA-99-N2 b in M31 and M51-ULS-1b in the Whirlpool); the remaining
// systems are built around REAL, catalogued stars/binaries in those
// galaxies and their planets are explicitly flagged as modelled.
//
// Scale note: one scene unit is one light-year. Planetary distances and
// body radii therefore use the physical AU-to-light-year conversion.
// ---------------------------------------------------------------

export type GxMoonDef = {
  name: string;
  distance: number;
  size: number;
  color: string;
  period: number;
  inclination?: number;
};

export type GxPlanetDef = {
  name: string;
  a: number;
  e: number;
  i: number;
  omega: number;
  size: number;
  color: string;
  atmosphere?: string;
  emissive?: string;
  period: number;
  spinPeriod: number;
  tilt: number;
  ring?: { inner: number; outer: number; color: string };
  moons?: GxMoonDef[];
  confirmed: boolean;
  description: string;
};

export type GxStarDef = {
  name: string;
  radius: number;
  color: string;
  spectral: string;
  mass: string;
  description: string;
};

export type GxSystem = {
  star: GxStarDef;
  planets: GxPlanetDef[];
  au: number;
  /** Radius (scene ly) of the system's orbit around its galaxy's centre. */
  orbitRadius: number;
  /** Phase angle of that orbit. */
  orbitPhase: number;
  /** Height above the galactic mid-plane. */
  orbitHeight: number;
  beltInnerAU: number;
  beltOuterAU: number;
};

export type Morphology =
  | "spiral"
  | "barred"
  | "elliptical"
  | "irregular"
  | "lenticular"
  | "edge-on"
  | "starburst"
  | "interacting";

export type GalaxyModel = {
  key: string;
  /** Must match the name used in Universe.tsx / the site map. */
  name: string;
  type: string;
  morphology: Morphology;
  l: number;
  b: number;
  distance: number;
  inclination: number; // deg
  posAngle: number; // deg
  diskRadius: number; // ly
  bulgeRadius: number;
  haloRadius: number;
  ringRadius?: number;
  arms: number;
  pitchDeg: number;
  barLength: number; // 0 = no bar
  /** Overall particle budget multiplier (1 ≈ 220k particles). */
  density: number;
  youngColor: [number, number, number];
  oldColor: [number, number, number];
  coreColor: string;
  /** Rotation period (scene seconds) at the disk half-radius. */
  rotPeriod: number;
  dustLanes: boolean;
  /** Present only where this visualization includes a documented/modelled system. */
  system?: GxSystem;
  description: string;
};

const d2r = (d: number) => (d * Math.PI) / 180;

export function gToXYZ(l: number, b: number, d: number): THREE.Vector3 {
  const lr = d2r(l);
  const br = d2r(b);
  return new THREE.Vector3(
    -d * Math.cos(br) * Math.cos(lr),
    d * Math.sin(br),
    d * Math.cos(br) * Math.sin(lr),
  );
}

export function galaxyQuat(inclinationDeg: number, posAngleDeg: number): THREE.Quaternion {
  const RX = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);
  const ORIENT = new THREE.Quaternion().setFromEuler(
    new THREE.Euler(d2r(inclinationDeg), 0, d2r(posAngleDeg), "XYZ"),
  );
  return ORIENT.clone().multiply(RX);
}

export function galaxyCenter(m: GalaxyModel): THREE.Vector3 {
  return gToXYZ(m.l, m.b, m.distance);
}

// --- compact system builder -------------------------------------
type PlanetSpec = {
  name: string;
  aAU: number;
  sizeAU: number;
  color: string;
  period: number;
  spin?: number;
  e?: number;
  iDeg?: number;
  omegaDeg?: number;
  atmosphere?: string;
  emissive?: string;
  ring?: [number, number, string];
  moons?: Array<[string, number, number, string, number]>; // name, dAU, sizeAU, color, period
  confirmed?: boolean;
  description: string;
};

function sys(
  au: number,
  star: Omit<GxStarDef, "radius"> & { radiusSolar: number },
  specs: PlanetSpec[],
  orbit: { radius: number; phase: number; height: number },
  belt: [number, number],
): GxSystem {
  return {
    au,
    orbitRadius: orbit.radius,
    orbitPhase: orbit.phase,
    orbitHeight: orbit.height,
    beltInnerAU: belt[0],
    beltOuterAU: belt[1],
    star: {
      name: star.name,
      color: star.color,
      spectral: star.spectral,
      mass: star.mass,
      description: star.description,
      radius: star.radiusSolar * SOLAR_RADIUS_AU * EXO_STAR_MAGNIFY * au,
    },
    planets: specs.map((s, idx) => ({
      name: s.name,
      a: s.aAU * au,
      e: s.e ?? 0.04 + (idx % 3) * 0.03,
      i: d2r(s.iDeg ?? (idx % 4) * 1.3),
      omega: d2r(s.omegaDeg ?? idx * 63),
      size: s.sizeAU * EXO_BODY_SCALE * au,
      color: s.color,
      atmosphere: s.atmosphere,
      emissive: s.emissive,
      period: s.period,
      spinPeriod: s.spin ?? 4,
      tilt: d2r(6 + idx * 7),
      ring: s.ring ? {
        inner: s.ring[0] * EXO_BODY_SCALE * au,
        outer: s.ring[1] * EXO_BODY_SCALE * au,
        color: s.ring[2],
      } : undefined,
      moons: s.moons?.map(([n, dAU, szAU, c, p]) => ({
        name: n,
        distance: dAU * EXO_BODY_SCALE * au,
        size: szAU * EXO_BODY_SCALE * au,
        color: c,
        period: p,
      })),
      confirmed: s.confirmed ?? false,
      description: s.description,
    })),
  };
}

const AU_OF = (_diskRadius: number) => LIGHT_YEARS_PER_AU;

// ---------------------------------------------------------------
// The catalogue
// ---------------------------------------------------------------

const CURATED_GALAXY_MODELS: GalaxyModel[] = [
  // ---------------- Triangulum (M33) ----------------
  (() => {
    const diskRadius = 30_000;
    const au = AU_OF(diskRadius);
    return {
      key: "m33",
      name: "Triangulum (M33)",
      type: "Spiral",
      morphology: "spiral" as Morphology,
      l: 133.6, b: -31.3, distance: 2_730_000,
      inclination: 54, posAngle: 22,
      diskRadius, bulgeRadius: 1_500, haloRadius: 42_000,
      arms: 2, pitchDeg: 22, barLength: 0,
      density: 1.0,
      youngColor: [0.72, 0.84, 1.0] as [number, number, number],
      oldColor: [1.0, 0.86, 0.7] as [number, number, number],
      coreColor: "rgba(255,238,205,1)",
      rotPeriod: 620,
      dustLanes: true,
      description:
        "The third-largest Local Group galaxy: a flocculent, bulge-less spiral about 60,000 ly across, packed with giant HII regions such as NGC 604.",
      system: sys(
        au,
        {
          name: "B324 (M33)",
          radiusSolar: 400,
          color: "#ffe9b8",
          spectral: "A2–F0 yellow hypergiant",
          mass: "≈ 40 M☉",
          description:
            "B324 is one of the most luminous individual stars known in Triangulum, a yellow hypergiant catalogued in the galaxy's southern arm. No planets have been detected here — the system below is modelled.",
        },
        [
          { name: "B324 I", aAU: 12, sizeAU: 0.03, color: "#8f7a63", period: 9, spin: 30, description: "Modelled scorched inner world, evaporating under a hypergiant's radiation." },
          { name: "B324 II", aAU: 24, sizeAU: 0.05, color: "#c58a55", atmosphere: "#ffb27a", period: 22, spin: 7, description: "Modelled molten super-Earth with a silicate-vapour atmosphere." },
          { name: "B324 III", aAU: 48, sizeAU: 0.10, color: "#cfa774", emissive: "#3a2510", period: 60, spin: 1.2, ring: [0.16, 0.26, "#b0977a"], moons: [["B324 III a", 0.18, 0.012, "#e2d3b4", 3.4], ["B324 III b", 0.26, 0.009, "#a89a86", 6.1]], description: "Modelled ringed gas giant on a wide orbit." },
          { name: "B324 IV", aAU: 92, sizeAU: 0.06, color: "#7fc0d8", emissive: "#0d2a35", period: 150, spin: 2, moons: [["B324 IV a", 0.11, 0.008, "#d5e6ee", 5.0]], description: "Modelled ice giant shepherding the outer debris belt." },
        ],
        { radius: diskRadius * 0.55, phase: 1.1, height: 260 },
        [130, 190],
      ),
    };
  })(),

  // ---------------- Large Magellanic Cloud ----------------
  (() => {
    const diskRadius = 7_000;
    const au = AU_OF(diskRadius);
    return {
      key: "lmc",
      name: "Large Magellanic Cloud",
      type: "Irregular",
      morphology: "irregular" as Morphology,
      l: 280.5, b: -32.9, distance: 163_000,
      inclination: 35, posAngle: 170,
      diskRadius, bulgeRadius: 900, haloRadius: 10_000,
      arms: 1, pitchDeg: 32, barLength: 4_200,
      density: 0.85,
      youngColor: [0.7, 0.83, 1.0] as [number, number, number],
      oldColor: [1.0, 0.83, 0.63] as [number, number, number],
      coreColor: "rgba(255,232,200,1)",
      rotPeriod: 420,
      dustLanes: false,
      description:
        "A one-armed barred irregular satellite of the Milky Way, 163,000 ly away, home to the Tarantula Nebula — the most violent star-forming region in the Local Group.",
      system: sys(
        au,
        {
          name: "R136a1 (LMC)",
          radiusSolar: 39,
          color: "#bcd4ff",
          spectral: "WN5h Wolf–Rayet",
          mass: "≈ 196 M☉",
          description:
            "The most massive star known, blazing at the heart of the Tarantula Nebula in the LMC. Planets could not survive here for long; the worlds shown are a modelled illustration.",
        },
        [
          { name: "R136a1 I", aAU: 40, sizeAU: 0.035, color: "#7a6a60", period: 11, spin: 25, description: "Modelled ablating rock, its surface boiled away by extreme UV flux." },
          { name: "R136a1 II", aAU: 78, sizeAU: 0.055, color: "#b7896a", atmosphere: "#ffb090", period: 27, spin: 8, description: "Modelled lava world wrapped in a metal-rich haze." },
          { name: "R136a1 III", aAU: 160, sizeAU: 0.095, color: "#a8b4c8", emissive: "#1a2433", period: 80, spin: 1.4, ring: [0.15, 0.24, "#93a2b8"], description: "Modelled photo-evaporating gas giant with an eroded ring." },
        ],
        { radius: diskRadius * 0.45, phase: 2.4, height: 180 },
        [220, 300],
      ),
    };
  })(),

  // ---------------- Small Magellanic Cloud ----------------
  (() => {
    const diskRadius = 3_500;
    const au = AU_OF(diskRadius);
    return {
      key: "smc",
      name: "Small Magellanic Cloud",
      type: "Irregular",
      morphology: "irregular" as Morphology,
      l: 302.8, b: -44.3, distance: 200_000,
      inclination: 40, posAngle: 45,
      diskRadius, bulgeRadius: 600, haloRadius: 5_500,
      arms: 1, pitchDeg: 40, barLength: 2_600,
      density: 0.6,
      youngColor: [0.75, 0.86, 1.0] as [number, number, number],
      oldColor: [1.0, 0.85, 0.68] as [number, number, number],
      coreColor: "rgba(255,236,210,1)",
      rotPeriod: 380,
      dustLanes: false,
      description:
        "A metal-poor dwarf irregular being tidally stretched by the Milky Way, trailing the Magellanic Stream behind it.",
      system: sys(
        au,
        {
          name: "HD 5980 (SMC)",
          radiusSolar: 24,
          color: "#cfe0ff",
          spectral: "WN / LBV binary",
          mass: "≈ 61 + 66 M☉",
          description:
            "A famous luminous-blue-variable binary in NGC 346, the SMC's brightest star cluster. The planets shown are modelled circumbinary worlds.",
        },
        [
          { name: "HD 5980 I", aAU: 30, sizeAU: 0.03, color: "#8d8272", period: 10, spin: 20, description: "Modelled circumbinary rock scoured by colliding stellar winds." },
          { name: "HD 5980 II", aAU: 62, sizeAU: 0.07, color: "#c2b28f", emissive: "#2b2417", period: 26, spin: 2, description: "Modelled metal-poor gas giant, typical of low-metallicity systems." },
          { name: "HD 5980 III", aAU: 120, sizeAU: 0.045, color: "#8fc7d4", period: 70, spin: 2.6, moons: [["HD 5980 III a", 0.1, 0.007, "#d8e9ee", 4.4]], description: "Modelled outer ice giant." },
        ],
        { radius: diskRadius * 0.5, phase: 0.4, height: 120 },
        [170, 240],
      ),
    };
  })(),

  // ---------------- M51 Whirlpool ----------------
  (() => {
    const diskRadius = 38_000;
    const au = AU_OF(diskRadius);
    return {
      key: "m51",
      name: "M51 (Whirlpool)",
      type: "Spiral",
      morphology: "spiral" as Morphology,
      l: 104.9, b: 68.6, distance: 23_000_000,
      inclination: 22, posAngle: 10,
      diskRadius, bulgeRadius: 3_000, haloRadius: 50_000,
      arms: 2, pitchDeg: 18, barLength: 0,
      density: 1.15,
      youngColor: [0.68, 0.82, 1.0] as [number, number, number],
      oldColor: [1.0, 0.85, 0.66] as [number, number, number],
      coreColor: "rgba(255,240,215,1)",
      rotPeriod: 700,
      dustLanes: true,
      description:
        "The archetypal grand-design spiral, its two arms sharpened by an ongoing encounter with the companion NGC 5195.",
      system: sys(
        au,
        {
          name: "M51-ULS-1",
          radiusSolar: 20,
          color: "#cfe2ff",
          spectral: "B-type supergiant + compact object",
          mass: "≈ 20 M☉ donor",
          description:
            "An X-ray binary in the Whirlpool Galaxy whose X-ray source was briefly eclipsed in 2012 — the strongest extragalactic planet candidate ever recorded, 23 million light-years away.",
        },
        [
          { name: "M51-ULS-1b", aAU: 10, sizeAU: 0.085, color: "#c8b48c", emissive: "#33280f", period: 40, spin: 1.1, ring: [0.14, 0.22, "#b3a184"], confirmed: true, moons: [["M51-ULS-1b I", 0.16, 0.011, "#e6dcc0", 3.2]], description: "A roughly Saturn-sized planet candidate detected in 2021 through an X-ray transit of the binary — the first planet candidate proposed in another galaxy." },
          { name: "M51-ULS-1 c", aAU: 22, sizeAU: 0.05, color: "#9fb2c6", atmosphere: "#b7d3ff", period: 95, spin: 3.1, description: "Modelled outer companion consistent with the binary's disrupted disc." },
          { name: "M51-ULS-1 d", aAU: 44, sizeAU: 0.062, color: "#7ec3d6", emissive: "#0e2b34", period: 210, spin: 1.8, moons: [["M51-ULS-1 d I", 0.12, 0.008, "#d6e9ef", 5.6]], description: "Modelled ice giant on a wide, irradiated orbit." },
        ],
        { radius: diskRadius * 0.6, phase: 3.6, height: 300 },
        [60, 95],
      ),
    };
  })(),

  // ---------------- M81 ----------------
  (() => {
    const diskRadius = 45_000;
    const au = AU_OF(diskRadius);
    return {
      key: "m81",
      name: "M81 (Bode's Galaxy)",
      type: "Spiral",
      morphology: "spiral" as Morphology,
      l: 142.1, b: 40.9, distance: 12_000_000,
      inclination: 62, posAngle: 157,
      diskRadius, bulgeRadius: 6_500, haloRadius: 60_000,
      arms: 2, pitchDeg: 14, barLength: 0,
      density: 1.1,
      youngColor: [0.7, 0.83, 1.0] as [number, number, number],
      oldColor: [1.0, 0.84, 0.66] as [number, number, number],
      coreColor: "rgba(255,236,200,1)",
      rotPeriod: 820,
      dustLanes: true,
      description:
        "A grand-design spiral with a large old bulge and an active nucleus, dominating its own galaxy group 12 million ly away.",
      system: sys(
        au,
        {
          name: "M81 V1 (Cepheid)",
          radiusSolar: 60,
          color: "#ffe3ae",
          spectral: "F–G Classical Cepheid",
          mass: "≈ 7 M☉",
          description:
            "One of the Cepheid variables Hubble Space Telescope used to pin down M81's distance. Its worlds are modelled.",
        },
        [
          { name: "M81 V1 I", aAU: 8, sizeAU: 0.03, color: "#9c8a72", period: 8, spin: 22, description: "Modelled inner rock, periodically flash-heated by the Cepheid's pulsations." },
          { name: "M81 V1 II", aAU: 17, sizeAU: 0.045, color: "#b98f68", atmosphere: "#ffc79a", period: 20, spin: 6, description: "Modelled warm terrestrial world with a thick CO₂ atmosphere." },
          { name: "M81 V1 III", aAU: 36, sizeAU: 0.095, color: "#d0a878", emissive: "#3a2612", period: 62, spin: 1.1, ring: [0.15, 0.25, "#ac9376"], moons: [["M81 V1 III a", 0.17, 0.011, "#e8dcbc", 3.6], ["M81 V1 III b", 0.24, 0.008, "#b3a48d", 6.4]], description: "Modelled ringed gas giant." },
          { name: "M81 V1 IV", aAU: 70, sizeAU: 0.055, color: "#82c4d9", emissive: "#0e2b34", period: 160, spin: 2.2, description: "Modelled ice giant at the system's edge." },
        ],
        { radius: diskRadius * 0.5, phase: 5.0, height: 320 },
        [95, 140],
      ),
    };
  })(),

  // ---------------- M82 ----------------
  (() => {
    const diskRadius = 18_000;
    const au = AU_OF(diskRadius);
    return {
      key: "m82",
      name: "M82 (Cigar Galaxy)",
      type: "Starburst",
      morphology: "starburst" as Morphology,
      l: 141.4, b: 40.6, distance: 12_000_000,
      inclination: 80, posAngle: 65,
      diskRadius, bulgeRadius: 2_200, haloRadius: 26_000,
      arms: 0, pitchDeg: 0, barLength: 0,
      density: 0.9,
      youngColor: [0.78, 0.86, 1.0] as [number, number, number],
      oldColor: [1.0, 0.72, 0.5] as [number, number, number],
      coreColor: "rgba(255,214,170,1)",
      rotPeriod: 500,
      dustLanes: true,
      description:
        "A cigar-shaped starburst galaxy forming stars ten times faster than the Milky Way, driving vast bipolar plumes of glowing hydrogen out of its core.",
      system: sys(
        au,
        {
          name: "M82 X-2",
          radiusSolar: 15,
          color: "#dfe8ff",
          spectral: "B supergiant + pulsar (ULX)",
          mass: "≈ 5 M☉ donor",
          description:
            "The first ultraluminous X-ray source proven to be a neutron star, buried in M82's starburst core. The planets shown are modelled survivors of its supernova.",
        },
        [
          { name: "M82 X-2 I", aAU: 14, sizeAU: 0.04, color: "#7f7a74", period: 12, spin: 18, description: "Modelled irradiated remnant core stripped by the pulsar wind." },
          { name: "M82 X-2 II", aAU: 30, sizeAU: 0.075, color: "#a9b7c9", emissive: "#1b2532", period: 34, spin: 1.6, description: "Modelled second-generation gas giant formed from supernova fallback." },
          { name: "M82 X-2 III", aAU: 62, sizeAU: 0.05, color: "#86c3d3", period: 92, spin: 2.4, moons: [["M82 X-2 III a", 0.1, 0.008, "#d6e8ee", 4.8]], description: "Modelled distant icy world." },
        ],
        { radius: diskRadius * 0.4, phase: 0.9, height: 200 },
        [85, 120],
      ),
    };
  })(),

  // ---------------- Centaurus A ----------------
  (() => {
    const diskRadius = 30_000;
    const au = AU_OF(diskRadius);
    return {
      key: "cena",
      name: "Centaurus A (NGC 5128)",
      type: "Lenticular",
      morphology: "lenticular" as Morphology,
      l: 309.5, b: 19.4, distance: 13_000_000,
      inclination: 60, posAngle: 35,
      diskRadius, bulgeRadius: 14_000, haloRadius: 55_000,
      arms: 0, pitchDeg: 0, barLength: 0,
      density: 1.0,
      youngColor: [0.72, 0.84, 1.0] as [number, number, number],
      oldColor: [1.0, 0.8, 0.58] as [number, number, number],
      coreColor: "rgba(255,206,150,1)",
      rotPeriod: 900,
      dustLanes: true,
      description:
        "The nearest radio galaxy: a giant elliptical swallowing a spiral, wrapped in a thick warped dust lane and firing relativistic jets from a 55-million-solar-mass black hole.",
      system: sys(
        au,
        {
          name: "Cen A HST-1",
          radiusSolar: 30,
          color: "#ffd9a8",
          spectral: "Blue supergiant in the dust lane",
          mass: "≈ 25 M☉",
          description:
            "A luminous young star in the star-forming dust lane crossing Centaurus A. Its planets are modelled.",
        },
        [
          { name: "Cen A HST-1 I", aAU: 9, sizeAU: 0.032, color: "#8b7c6a", period: 9, spin: 24, description: "Modelled dust-shrouded inner world." },
          { name: "Cen A HST-1 II", aAU: 21, sizeAU: 0.05, color: "#c39468", atmosphere: "#ffbe8f", period: 24, spin: 6, description: "Modelled warm terrestrial world inside the dust lane." },
          { name: "Cen A HST-1 III", aAU: 44, sizeAU: 0.1, color: "#caa070", emissive: "#3a2410", period: 72, spin: 1.2, ring: [0.16, 0.27, "#a68e6f"], moons: [["Cen A HST-1 III a", 0.18, 0.012, "#e5d8b8", 3.8]], description: "Modelled ringed gas giant." },
        ],
        { radius: diskRadius * 0.5, phase: 2.0, height: 400 },
        [100, 150],
      ),
    };
  })(),

  // ---------------- M87 ----------------
  (() => {
    const diskRadius = 60_000;
    const au = AU_OF(diskRadius);
    return {
      key: "m87",
      name: "M87 (Virgo A)",
      type: "Elliptical",
      morphology: "elliptical" as Morphology,
      l: 283.8, b: 74.5, distance: 53_000_000,
      inclination: 25, posAngle: 20,
      diskRadius, bulgeRadius: 40_000, haloRadius: 120_000,
      arms: 0, pitchDeg: 0, barLength: 0,
      density: 1.2,
      youngColor: [0.95, 0.9, 0.82] as [number, number, number],
      oldColor: [1.0, 0.79, 0.55] as [number, number, number],
      coreColor: "rgba(255,224,170,1)",
      rotPeriod: 2200,
      dustLanes: false,
      description:
        "The supergiant elliptical at the heart of the Virgo Cluster, home to the first black hole ever imaged and a 5,000-ly relativistic jet.",
      system: sys(
        au,
        {
          name: "M87 GC-Sgr",
          radiusSolar: 1.1,
          color: "#ffe6bc",
          spectral: "G-type star in a globular cluster",
          mass: "≈ 1.0 M☉",
          description:
            "A Sun-like star inside one of M87's ~12,000 globular clusters — the densest globular system known. Its worlds are modelled.",
        },
        [
          { name: "M87 GC-Sgr I", aAU: 6, sizeAU: 0.028, color: "#948270", period: 8, spin: 26, description: "Modelled inner rock repeatedly perturbed by close stellar flybys." },
          { name: "M87 GC-Sgr II", aAU: 14, sizeAU: 0.042, color: "#9db6cf", atmosphere: "#bcd8ff", period: 20, spin: 5, description: "Modelled ocean world on a stable, low-eccentricity orbit." },
          { name: "M87 GC-Sgr III", aAU: 30, sizeAU: 0.088, color: "#c9a679", emissive: "#372410", period: 58, spin: 1.3, ring: [0.15, 0.24, "#a7906e"], moons: [["M87 GC-Sgr III a", 0.17, 0.011, "#e3d5b6", 3.5]], description: "Modelled gas giant that survived the cluster's dynamical churn." },
        ],
        { radius: diskRadius * 0.35, phase: 4.2, height: 5_000 },
        [55, 85],
      ),
    };
  })(),

  // ---------------- Sombrero ----------------
  (() => {
    const diskRadius = 25_000;
    const au = AU_OF(diskRadius);
    return {
      key: "m104",
      name: "M104 (Sombrero)",
      type: "Lenticular",
      morphology: "edge-on" as Morphology,
      l: 298.5, b: 51.1, distance: 29_000_000,
      inclination: 84, posAngle: 90,
      diskRadius, bulgeRadius: 12_000, haloRadius: 45_000,
      arms: 0, pitchDeg: 0, barLength: 0,
      density: 1.05,
      youngColor: [0.8, 0.86, 1.0] as [number, number, number],
      oldColor: [1.0, 0.85, 0.66] as [number, number, number],
      coreColor: "rgba(255,232,190,1)",
      rotPeriod: 1000,
      dustLanes: true,
      description:
        "An almost perfectly edge-on galaxy: an enormous glowing bulge belted by a sharply defined ring of dust, orbited by nearly 2,000 globular clusters.",
      system: sys(
        au,
        {
          name: "Sombrero GC-42",
          radiusSolar: 0.8,
          color: "#ffdca8",
          spectral: "K-type globular-cluster star",
          mass: "≈ 0.8 M☉",
          description:
            "A metal-rich star in one of the Sombrero's globular clusters, positioned in the dust ring. Its planets are modelled.",
        },
        [
          { name: "GC-42 I", aAU: 5, sizeAU: 0.026, color: "#8f7f6c", period: 7, spin: 24, description: "Modelled tidally-locked inner planet." },
          { name: "GC-42 II", aAU: 12, sizeAU: 0.04, color: "#b78f63", atmosphere: "#ffc292", period: 18, spin: 6, description: "Modelled temperate world lit by an old, dim star." },
          { name: "GC-42 III", aAU: 27, sizeAU: 0.08, color: "#cba97e", emissive: "#33230f", period: 52, spin: 1.4, ring: [0.14, 0.23, "#a89173"], description: "Modelled ringed giant embedded in the dust ring." },
          { name: "GC-42 IV", aAU: 55, sizeAU: 0.048, color: "#84c5d6", period: 130, spin: 2.3, moons: [["GC-42 IV a", 0.1, 0.008, "#d6e8ee", 4.6]], description: "Modelled outer ice giant." },
        ],
        { radius: diskRadius * 0.65, phase: 1.7, height: 150 },
        [70, 110],
      ),
    };
  })(),

  // ---------------- M101 Pinwheel ----------------
  (() => {
    const diskRadius = 85_000;
    const au = AU_OF(diskRadius);
    return {
      key: "m101",
      name: "M101 (Pinwheel)",
      type: "Spiral",
      morphology: "spiral" as Morphology,
      l: 102.0, b: 59.8, distance: 21_000_000,
      inclination: 18, posAngle: 40,
      diskRadius, bulgeRadius: 4_000, haloRadius: 105_000,
      arms: 5, pitchDeg: 24, barLength: 0,
      density: 1.25,
      youngColor: [0.66, 0.81, 1.0] as [number, number, number],
      oldColor: [1.0, 0.87, 0.7] as [number, number, number],
      coreColor: "rgba(255,242,220,1)",
      rotPeriod: 760,
      dustLanes: true,
      description:
        "A face-on giant spiral 170,000 ly across, lopsided by past encounters and studded with more than 3,000 HII regions.",
      system: sys(
        au,
        {
          name: "M101 ULX-1",
          radiusSolar: 12,
          color: "#dfe9ff",
          spectral: "Wolf–Rayet + black hole binary",
          mass: "≈ 19 M☉ donor",
          description:
            "A well-studied black-hole X-ray binary in one of the Pinwheel's outer arms. Its planetary companions are modelled.",
        },
        [
          { name: "M101 ULX-1 I", aAU: 16, sizeAU: 0.036, color: "#87796b", period: 11, spin: 20, description: "Modelled inner world baked by the accretion disc." },
          { name: "M101 ULX-1 II", aAU: 34, sizeAU: 0.055, color: "#a8bccd", atmosphere: "#c3dcff", period: 30, spin: 4, description: "Modelled steam world with a hydrogen-rich envelope." },
          { name: "M101 ULX-1 III", aAU: 70, sizeAU: 0.1, color: "#cda87a", emissive: "#3a2611", period: 88, spin: 1.1, ring: [0.16, 0.27, "#ab9273"], moons: [["M101 ULX-1 III a", 0.18, 0.012, "#e6d9ba", 3.7], ["M101 ULX-1 III b", 0.25, 0.009, "#b0a189", 6.6]], description: "Modelled ringed gas giant, the system's dominant body." },
          { name: "M101 ULX-1 IV", aAU: 135, sizeAU: 0.06, color: "#7fc4d8", emissive: "#0d2a34", period: 200, spin: 2.1, description: "Modelled ice giant on the rim of the debris belt." },
        ],
        { radius: diskRadius * 0.55, phase: 5.6, height: 300 },
        [175, 250],
      ),
    };
  })(),
];

const CURATED_BY_NAME = new Map(CURATED_GALAXY_MODELS.map((m) => [m.name, m]));

const MORPHOLOGY_OVERRIDES: Record<string, Partial<GalaxyModel>> = {
  "M94": { morphology: "spiral", arms: 2, pitchDeg: 10, ringRadius: 12_500, bulgeRadius: 5_500 },
  "M64 (Black Eye)": { morphology: "spiral", arms: 2, pitchDeg: 14, ringRadius: 7_000, dustLanes: true },
  "NGC 1300": { morphology: "barred", arms: 2, pitchDeg: 17, barLength: 24_000 },
  "NGC 1365": { morphology: "barred", arms: 2, pitchDeg: 18, barLength: 38_000 },
  "NGC 4038/4039 (Antennae)": { morphology: "interacting", arms: 2, pitchDeg: 24, barLength: 0 },
  "NGC 4565 (Needle)": { morphology: "edge-on", arms: 2, pitchDeg: 14, dustLanes: true },
  "NGC 3628": { morphology: "edge-on", arms: 2, pitchDeg: 14, dustLanes: true },
  "NGC 5866": { morphology: "edge-on", arms: 0, pitchDeg: 0, dustLanes: true },
  "NGC 5253": { morphology: "starburst", arms: 0, pitchDeg: 0 },
  "Perseus Cluster (NGC 1275)": { morphology: "elliptical", bulgeRadius: 65_000, haloRadius: 140_000 },
  "Coma Cluster (NGC 4889)": { morphology: "elliptical", bulgeRadius: 100_000, haloRadius: 210_000 },
  "Hercules A": { morphology: "elliptical", bulgeRadius: 165_000, haloRadius: 350_000 },
};

function morphologyFor(type: string): Morphology {
  if (/interacting/i.test(type)) return "interacting";
  if (/starburst/i.test(type)) return "starburst";
  if (/edge-on/i.test(type)) return "edge-on";
  if (/barred/i.test(type)) return "barred";
  if (/lenticular/i.test(type)) return "lenticular";
  if (/elliptical|spheroidal/i.test(type)) return "elliptical";
  if (/irregular/i.test(type)) return "irregular";
  return "spiral";
}

function colorTuple(hex: string): [number, number, number] {
  const c = new THREE.Color(hex);
  return [c.r, c.g, c.b];
}

function nameSeed(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Every galaxy in the catalogue gets a representative star system so the
 * camera always has somewhere concrete to fly to. No exoplanets are known in
 * these galaxies, so the worlds are explicitly modelled (never flagged as
 * confirmed) and the panel text says so.
 */
function fallbackSystem(g: NamedGalaxy, diskRadius: number, morphology: Morphology): GxSystem {
  const au = LIGHT_YEARS_PER_AU;
  const rand = rng(nameSeed(g.name));
  const short = g.name.replace(/\s*\(.*\)\s*/, "").trim();
  const kinds = [
    { sp: "G2 V", mass: "1.0 M☉", radiusSolar: 1.0, color: "#ffe6b8" },
    { sp: "K1 V", mass: "0.85 M☉", radiusSolar: 0.82, color: "#ffc98a" },
    { sp: "F7 V", mass: "1.2 M☉", radiusSolar: 1.25, color: "#fff4de" },
    { sp: "M2 V", mass: "0.45 M☉", radiusSolar: 0.5, color: "#ff9b6a" },
  ];
  const kind = kinds[Math.floor(rand() * kinds.length)];
  const rocky = ["#c8a583", "#9fb4c6", "#c07a58", "#8fa48b"];
  const giants = ["#d9b98a", "#a8c4d8", "#c9a0d0", "#e0c39a"];
  const n = 4 + Math.floor(rand() * 2);
  const specs: PlanetSpec[] = [];
  let aAU = 0.4 + rand() * 0.5;
  for (let i = 0; i < n; i++) {
    const isGiant = i >= 2;
    const period = 5 + Math.pow(aAU, 1.5) * 9;
    specs.push({
      name: `${short} b${i + 1}`,
      aAU,
      sizeAU: isGiant ? 0.05 + rand() * 0.06 : 0.008 + rand() * 0.012,
      color: isGiant ? giants[i % giants.length] : rocky[i % rocky.length],
      emissive: isGiant ? "#241a10" : undefined,
      atmosphere: !isGiant && rand() < 0.5 ? "#7fb6ff" : undefined,
      period,
      spin: 1.6 + rand() * 3,
      e: 0.02 + rand() * 0.08,
      iDeg: rand() * 4,
      omegaDeg: rand() * 360,
      ring: isGiant && rand() < 0.4 ? [0.15, 0.26, "#c8b28d"] : undefined,
      moons:
        isGiant
          ? [
              [`${short} b${i + 1} a`, 0.17, 0.011, "#e2d6bd", 3.4],
              [`${short} b${i + 1} b`, 0.24, 0.008, "#b0a189", 6.1],
            ]
          : undefined,
      description: `Modelled ${isGiant ? "gas giant" : "rocky world"} in a representative ${kind.sp} system inside ${g.name}. No planet has yet been detected in this galaxy; the orbit follows Keplerian dynamics for the star's mass.`,
    });
    aAU *= 1.7 + rand() * 0.6;
  }
  const orbitRadius =
    morphology === "elliptical"
      ? diskRadius * (0.28 + rand() * 0.2)
      : diskRadius * (0.45 + rand() * 0.25);
  return sys(
    au,
    {
      name: `${short} ★A`,
      radiusSolar: kind.radiusSolar,
      color: kind.color,
      spectral: kind.sp,
      mass: kind.mass,
      description: `A representative ${kind.sp} star placed in ${g.name}'s disk at a realistic galactocentric radius. It is carried around the galaxy by the same rotation curve that spins the galaxy's stars.`,
    },
    specs,
    { radius: orbitRadius, phase: rand() * Math.PI * 2, height: (rand() - 0.5) * diskRadius * 0.02 },
    [aAU * 0.55, aAU * 0.85],
  );
}

function catalogModel(g: NamedGalaxy): GalaxyModel {

  const morphology = morphologyFor(g.type);
  const radius = g.size * 0.5;
  const dwarf = /dwarf/i.test(g.type);
  const oldPopulation = morphology === "elliptical" || morphology === "lenticular";
  const oldColor = colorTuple(g.color);
  const base: GalaxyModel = {
    key: `catalog-${g.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
    name: g.name,
    type: g.type,
    morphology,
    l: g.l,
    b: g.b,
    distance: g.distance,
    inclination: g.inclination ?? (morphology === "elliptical" ? 32 : 48),
    posAngle: g.posAngle ?? ((Math.abs(g.l * 13 + g.b * 7) % 180)),
    diskRadius: radius,
    bulgeRadius: radius * (morphology === "elliptical" ? 0.68 : morphology === "lenticular" ? 0.38 : 0.1),
    haloRadius: radius * (morphology === "elliptical" ? 1.4 : 1.25),
    arms: morphology === "spiral" || morphology === "barred" ? (g.size > 100_000 ? 4 : 2) : morphology === "irregular" ? 1 : 0,
    pitchDeg: morphology === "spiral" || morphology === "barred" ? (g.size > 100_000 ? 19 : 15) : morphology === "irregular" ? 32 : 0,
    barLength: morphology === "barred" ? radius * 0.42 : 0,
    // Selected models are built one at a time; dwarfs need fewer points while
    // giant galaxies receive enough particles to retain their structure.
    density: dwarf ? 0.12 : Math.min(0.42, 0.2 + g.size / 1_000_000),
    youngColor: oldPopulation ? [0.9, 0.86, 0.76] : [0.7, 0.84, 1.0],
    oldColor,
    coreColor: oldPopulation ? "rgba(255,220,170,1)" : "rgba(255,235,205,1)",
    rotPeriod: 480 + Math.sqrt(Math.max(radius, 1)) * 2.2,
    dustLanes: /spiral|lenticular|interacting/i.test(g.type),
    description: `${g.name} is a real ${g.type.toLowerCase()} galaxy about ${g.distance.toLocaleString()} light-years away. Its particle model follows the catalogued physical diameter, sky position, viewing angle, and characteristic stellar structure of its morphological class.`,
  };
  const merged = { ...base, ...(MORPHOLOGY_OVERRIDES[g.name] ?? {}) };
  return { ...merged, system: fallbackSystem(g, merged.diskRadius, merged.morphology) };
}

/** Every named galaxy has a stable particle model; Andromeda remains bespoke. */
export const GALAXY_MODELS: GalaxyModel[] = [
  ...CURATED_GALAXY_MODELS,
  ...NEARBY_GALAXIES
    .filter((g) => g.name !== "Andromeda (M31)" && !CURATED_BY_NAME.has(g.name))
    .map(catalogModel),
];

export const GALAXY_BY_NAME = new Map(GALAXY_MODELS.map((m) => [m.name, m]));

export const GX_PLANET_INDEX = new Map<string, { planet: GxPlanetDef; model: GalaxyModel }>();
for (const m of GALAXY_MODELS) {
  for (const p of m.system?.planets ?? []) GX_PLANET_INDEX.set(p.name, { planet: p, model: m });
}

/** Angular speed (rad/scene-second) of the system's orbit around its galaxy. */
export function systemOmega(m: GalaxyModel): number {
  if (!m.system) return 0;
  const rHalf = m.diskRadius * 0.5;
  const vFlat = (2 * Math.PI * rHalf) / m.rotPeriod;
  const r = Math.max(m.system.orbitRadius, 1);
  return vFlat / r;
}

/**
 * World position of a galaxy's star system at t = 0. GalaxyBody nests the
 * system inside the galaxy's orientation (inclination/position angle) and a
 * further +90° X rotation that lays the disk flat, so the camera focus has to
 * apply the same transform instead of aiming at the galaxy's core.
 */
export function systemWorldPosition(m: GalaxyModel, t = 0): THREE.Vector3 {
  const s = m.system;
  const c = galaxyCenter(m);
  if (!s) return c;
  const ang = s.orbitPhase + systemOmega(m) * t;
  const local = new THREE.Vector3(
    Math.cos(ang) * s.orbitRadius,
    s.orbitHeight,
    Math.sin(ang) * s.orbitRadius,
  );
  local.applyQuaternion(galaxyQuat(m.inclination, m.posAngle));
  return local.add(c);
}

/** Framing distance that fits the whole star system (outermost orbit) on screen. */
export function systemViewDistance(m: GalaxyModel): number {
  const s = m.system;
  if (!s) return Math.max(m.diskRadius * 2.2, 2000);
  const outer = s.planets.reduce((mx, p) => Math.max(mx, p.a), s.star.radius * 4);
  return outer * 3.2;
}
