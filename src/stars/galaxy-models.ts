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
// Documented hosts may carry a star system that can be visited. Only two
// unconfirmed planet candidates are included here
// (PA-99-N2 b in M31 and M51-ULS-1b in the Whirlpool); the remaining
// systems use documented stars/binaries. Invented planets and moons are excluded.
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
  | "grand-design"
  | "flocculent"
  | "barred"
  | "elliptical"
  | "lenticular"
  | "irregular"
  | "dwarf"
  | "edge-on"
  | "starburst"
  | "interacting"
  | "ring";

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
  /** Present only where this visualization includes a documented source or unconfirmed planet candidate. */
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
      ring: s.ring
        ? {
            inner: s.ring[0] * EXO_BODY_SCALE * au,
            outer: s.ring[1] * EXO_BODY_SCALE * au,
            color: s.ring[2],
          }
        : undefined,
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
      l: 133.6,
      b: -31.3,
      distance: 2_730_000,
      inclination: 54,
      posAngle: 22,
      diskRadius,
      bulgeRadius: 1_500,
      haloRadius: 42_000,
      arms: 2,
      pitchDeg: 22,
      barLength: 0,
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
            "B324 is one of the most luminous individual stars known in Triangulum, a yellow hypergiant catalogued in the galaxy's southern arm. No planets have been detected here. The stellar surface and local view are reconstructed.",
        },
        [],
        { radius: diskRadius * 0.55, phase: 1.1, height: 260 },
        [0, 0],
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
      l: 280.5,
      b: -32.9,
      distance: 163_000,
      inclination: 35,
      posAngle: 170,
      diskRadius,
      bulgeRadius: 900,
      haloRadius: 10_000,
      arms: 1,
      pitchDeg: 32,
      barLength: 4_200,
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
            "An exceptionally massive star in the R136 cluster within the Tarantula Nebula. The close-up and its local placement are reconstructed; no planets are identified.",
        },
        [],
        { radius: diskRadius * 0.45, phase: 2.4, height: 180 },
        [0, 0],
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
      l: 302.8,
      b: -44.3,
      distance: 200_000,
      inclination: 40,
      posAngle: 45,
      diskRadius,
      bulgeRadius: 600,
      haloRadius: 5_500,
      arms: 1,
      pitchDeg: 40,
      barLength: 2_600,
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
            "An observed luminous stellar multiple system in the SMC near NGC 346. Its close-up and local placement are reconstructed; no planets are identified.",
        },
        [],
        { radius: diskRadius * 0.5, phase: 0.4, height: 120 },
        [0, 0],
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
      l: 104.9,
      b: 68.6,
      distance: 23_000_000,
      inclination: 22,
      posAngle: 10,
      diskRadius,
      bulgeRadius: 3_000,
      haloRadius: 50_000,
      arms: 2,
      pitchDeg: 18,
      barLength: 0,
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
          {
            name: "M51-ULS-1b",
            aAU: 10,
            sizeAU: 0.085,
            color: "#c8b48c",
            emissive: "#33280f",
            period: 40,
            spin: 1.1,
            confirmed: true,
            description:
              "A roughly Saturn-sized planet candidate detected in 2021 through an X-ray transit of the binary — the first planet candidate proposed in another galaxy.",
          },
        ],
        { radius: diskRadius * 0.6, phase: 3.6, height: 300 },
        [0, 0],
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
      l: 142.1,
      b: 40.9,
      distance: 12_000_000,
      inclination: 62,
      posAngle: 157,
      diskRadius,
      bulgeRadius: 6_500,
      haloRadius: 60_000,
      arms: 2,
      pitchDeg: 14,
      barLength: 0,
      density: 1.1,
      youngColor: [0.7, 0.83, 1.0] as [number, number, number],
      oldColor: [1.0, 0.84, 0.66] as [number, number, number],
      coreColor: "rgba(255,236,200,1)",
      rotPeriod: 820,
      dustLanes: true,
      description:
        "A grand-design spiral with a large old bulge and an active nucleus, dominating its own galaxy group 12 million ly away.",
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
      l: 141.4,
      b: 40.6,
      distance: 12_000_000,
      inclination: 80,
      posAngle: 65,
      diskRadius,
      bulgeRadius: 2_200,
      haloRadius: 26_000,
      arms: 0,
      pitchDeg: 0,
      barLength: 0,
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
            "An observed pulsating ultraluminous X-ray binary in the M82 starburst. Its stellar-scale presentation is illustrative; no planets are identified.",
        },
        [],
        { radius: diskRadius * 0.4, phase: 0.9, height: 200 },
        [0, 0],
      ),
    };
  })(),

  // ---------------- Centaurus A ----------------
  (() => {
    const diskRadius = 48_593;
    const au = AU_OF(diskRadius);
    return {
      key: "cena",
      name: "Centaurus A (NGC 5128)",
      type: "Peculiar Elliptical",
      morphology: "elliptical" as Morphology,
      l: 309.5,
      b: 19.4,
      distance: 13_000_000,
      inclination: 60,
      posAngle: 35,
      diskRadius,
      bulgeRadius: 14_000,
      haloRadius: 55_000,
      arms: 0,
      pitchDeg: 0,
      barLength: 0,
      density: 1.0,
      youngColor: [0.72, 0.84, 1.0] as [number, number, number],
      oldColor: [1.0, 0.8, 0.58] as [number, number, number],
      coreColor: "rgba(255,206,150,1)",
      rotPeriod: 900,
      dustLanes: true,
      description:
        "The nearest radio galaxy: a giant elliptical swallowing a spiral, wrapped in a thick warped dust lane and firing relativistic jets from a 55-million-solar-mass black hole.",
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
      l: 283.8,
      b: 74.5,
      distance: 53_000_000,
      inclination: 25,
      posAngle: 20,
      diskRadius,
      bulgeRadius: 40_000,
      haloRadius: 120_000,
      arms: 0,
      pitchDeg: 0,
      barLength: 0,
      density: 1.2,
      youngColor: [0.95, 0.9, 0.82] as [number, number, number],
      oldColor: [1.0, 0.79, 0.55] as [number, number, number],
      coreColor: "rgba(255,224,170,1)",
      rotPeriod: 2200,
      dustLanes: false,
      description:
        "The supergiant elliptical at the heart of the Virgo Cluster, home to the first black hole ever imaged and a 5,000-ly relativistic jet.",
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
      l: 298.5,
      b: 51.1,
      distance: 29_000_000,
      inclination: 84,
      posAngle: 90,
      diskRadius,
      bulgeRadius: 12_000,
      haloRadius: 45_000,
      arms: 0,
      pitchDeg: 0,
      barLength: 0,
      density: 1.05,
      youngColor: [0.8, 0.86, 1.0] as [number, number, number],
      oldColor: [1.0, 0.85, 0.66] as [number, number, number],
      coreColor: "rgba(255,232,190,1)",
      rotPeriod: 1000,
      dustLanes: true,
      description:
        "An almost perfectly edge-on galaxy: an enormous glowing bulge belted by a sharply defined ring of dust, orbited by nearly 2,000 globular clusters.",
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
      l: 102.0,
      b: 59.8,
      distance: 21_000_000,
      inclination: 18,
      posAngle: 40,
      diskRadius,
      bulgeRadius: 4_000,
      haloRadius: 105_000,
      arms: 5,
      pitchDeg: 24,
      barLength: 0,
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
            "An observed ultraluminous X-ray binary in M101. The stellar-scale presentation is illustrative; no planetary companions are identified.",
        },
        [],
        { radius: diskRadius * 0.55, phase: 5.6, height: 300 },
        [0, 0],
      ),
    };
  })(),

  // ---------------- Cartwheel Galaxy ----------------
  (() => {
    const diskRadius = 75_000;
    const au = AU_OF(diskRadius);
    return {
      key: "cartwheel",
      name: "Cartwheel Galaxy",
      type: "Ring Galaxy",
      morphology: "ring" as Morphology,
      l: 316.0,
      b: -70.0,
      distance: 500_000_000,
      inclination: 30,
      posAngle: 145,
      diskRadius,
      bulgeRadius: 11_000,
      haloRadius: 95_000,
      ringRadius: 68_000,
      arms: 6,
      pitchDeg: 28,
      barLength: 0,
      density: 1.25,
      youngColor: [0.55, 0.78, 1.0] as [number, number, number],
      oldColor: [1.0, 0.84, 0.62] as [number, number, number],
      coreColor: "rgba(255,228,185,1)",
      rotPeriod: 920,
      dustLanes: true,
      description:
        "A 150,000-light-year collisional ring galaxy sculpted when a smaller intruder punched straight through its core 300 million years ago, launching an expanding outer starburst ring and gossamer radial spokes.",
    };
  })(),

  // ---------------- Hoag's Object ----------------
  (() => {
    const diskRadius = 60_000;
    const au = AU_OF(diskRadius);
    return {
      key: "hoags-object",
      name: "Hoag's Object",
      type: "Ring Galaxy",
      morphology: "ring" as Morphology,
      l: 31.71,
      b: 56.25,
      distance: 612_800_000,
      inclination: 18,
      posAngle: 25,
      diskRadius,
      bulgeRadius: 12_000,
      haloRadius: 80_000,
      ringRadius: 52_000,
      arms: 0,
      pitchDeg: 0,
      barLength: 0,
      density: 1.2,
      youngColor: [0.58, 0.8, 1.0] as [number, number, number],
      oldColor: [1.0, 0.85, 0.58] as [number, number, number],
      coreColor: "rgba(255,232,175,1)",
      rotPeriod: 1100,
      dustLanes: false,
      description:
        "The most famous ring galaxy in the universe: a nearly flawless circle of young blue supergiants surrounding an ancient golden spheroidal core across an almost completely empty 30,000-ly gap.",
    };
  })(),

  // ---------------- Antennae Galaxies ----------------
  (() => {
    const diskRadius = 45_000;
    const au = AU_OF(diskRadius);
    return {
      key: "antennae",
      name: "NGC 4038/4039 (Antennae)",
      type: "Interacting",
      morphology: "interacting" as Morphology,
      l: 286.21,
      b: 42.48,
      distance: 45_000_000,
      inclination: 46,
      posAngle: 68,
      diskRadius,
      bulgeRadius: 8_500,
      haloRadius: 95_000,
      arms: 2,
      pitchDeg: 26,
      barLength: 0,
      density: 1.3,
      youngColor: [0.68, 0.84, 1.0] as [number, number, number],
      oldColor: [1.0, 0.8, 0.62] as [number, number, number],
      coreColor: "rgba(255,215,180,1)",
      rotPeriod: 780,
      dustLanes: true,
      description:
        "The nearest major spiral-spiral collision: two galaxies locked in a gravitational embrace, flinging twin 150,000-light-year tidal tails of stars and igniting thousands of super-star clusters.",
    };
  })(),

  // ---------------- Stephan's Quintet ----------------
  (() => {
    const diskRadius = 85_000;
    const au = AU_OF(diskRadius);
    return {
      key: "stephans-quintet",
      name: "Stephan's Quintet (HCG 92)",
      type: "Interacting",
      morphology: "interacting" as Morphology,
      l: 93.27,
      b: -21.01,
      distance: 290_000_000,
      inclination: 42,
      posAngle: 112,
      diskRadius,
      bulgeRadius: 15_000,
      haloRadius: 130_000,
      arms: 3,
      pitchDeg: 22,
      barLength: 18_000,
      density: 1.3,
      youngColor: [0.65, 0.83, 1.0] as [number, number, number],
      oldColor: [1.0, 0.82, 0.6] as [number, number, number],
      coreColor: "rgba(255,222,175,1)",
      rotPeriod: 960,
      dustLanes: true,
      description:
        "A compact group of colliding galaxies in Pegasus where NGC 7318B is crashing through the group core at 800 km/s, creating a Milky-Way-sized intergalactic shock wave imaged by JWST.",
    };
  })(),

  // ---------------- Tadpole Galaxy ----------------
  (() => {
    const diskRadius = 90_000;
    const au = AU_OF(diskRadius);
    return {
      key: "tadpole",
      name: "Tadpole Galaxy (UGC 10214)",
      type: "Interacting",
      morphology: "interacting" as Morphology,
      l: 85.62,
      b: 44.51,
      distance: 420_000_000,
      inclination: 58,
      posAngle: 72,
      diskRadius,
      bulgeRadius: 11_000,
      haloRadius: 150_000,
      arms: 2,
      pitchDeg: 25,
      barLength: 16_000,
      density: 1.2,
      youngColor: [0.62, 0.81, 1.0] as [number, number, number],
      oldColor: [1.0, 0.85, 0.65] as [number, number, number],
      coreColor: "rgba(255,230,190,1)",
      rotPeriod: 980,
      dustLanes: true,
      description:
        "A barred spiral galaxy in Draco whose close encounter with a compact intruder drew out a spectacular 280,000-light-year tidal tail studded with bright blue star clusters.",
    };
  })(),

  // ---------------- Mayall's Object ----------------
  (() => {
    const diskRadius = 62_000;
    const au = AU_OF(diskRadius);
    return {
      key: "mayalls-object",
      name: "Mayall's Object (Arp 148)",
      type: "Ring Galaxy",
      morphology: "ring" as Morphology,
      l: 177.26,
      b: 63.61,
      distance: 450_000_000,
      inclination: 48,
      posAngle: 95,
      diskRadius,
      bulgeRadius: 10_000,
      haloRadius: 85_000,
      ringRadius: 52_000,
      arms: 4,
      pitchDeg: 24,
      barLength: 22_000,
      density: 1.15,
      youngColor: [0.72, 0.84, 1.0] as [number, number, number],
      oldColor: [1.0, 0.78, 0.62] as [number, number, number],
      coreColor: "rgba(255,218,185,1)",
      rotPeriod: 890,
      dustLanes: true,
      description:
        "Arp 148 in Ursa Major: the aftermath of a head-on galactic collision that produced a luminous expanding shock-ring paired with an elongated, cigar-like companion core.",
    };
  })(),
];

const CURATED_BY_NAME = new Map(CURATED_GALAXY_MODELS.map((m) => [m.name, m]));

const MORPHOLOGY_OVERRIDES: Record<string, Partial<GalaxyModel>> = {
  M94: { morphology: "spiral", arms: 2, pitchDeg: 10, ringRadius: 12_500, bulgeRadius: 5_500 },
  "M64 (Black Eye)": {
    morphology: "spiral",
    arms: 2,
    pitchDeg: 14,
    ringRadius: 7_000,
    dustLanes: true,
  },
  "NGC 1300": { morphology: "barred", arms: 2, pitchDeg: 17, barLength: 24_000 },
  "NGC 1365": { morphology: "barred", arms: 2, pitchDeg: 18, barLength: 38_000 },
  "NGC 4038/4039 (Antennae)": { morphology: "interacting", arms: 2, pitchDeg: 24, barLength: 0 },
  "NGC 4565 (Needle)": { morphology: "edge-on", arms: 2, pitchDeg: 14, dustLanes: true },
  "NGC 3628": { morphology: "edge-on", arms: 2, pitchDeg: 14, dustLanes: true },
  "NGC 5866": { morphology: "edge-on", arms: 0, pitchDeg: 0, dustLanes: true },
  "NGC 5253": { morphology: "starburst", arms: 0, pitchDeg: 0 },
  "Perseus Cluster (NGC 1275)": {
    morphology: "elliptical",
    bulgeRadius: 65_000,
    haloRadius: 140_000,
  },
  "Coma Cluster (NGC 4889)": {
    morphology: "elliptical",
    bulgeRadius: 100_000,
    haloRadius: 210_000,
  },
  "Hercules A": { morphology: "elliptical", bulgeRadius: 165_000, haloRadius: 350_000 },
  "M51 (Whirlpool)": { morphology: "grand-design", arms: 2, pitchDeg: 19 },
  "M101 (Pinwheel)": { morphology: "grand-design", arms: 2, pitchDeg: 18 },
  "M63 (Sunflower)": { morphology: "flocculent", arms: 12, pitchDeg: 14 },
  "NGC 2841": { morphology: "flocculent", arms: 10, pitchDeg: 12 },
  "Sagittarius Dwarf": { morphology: "dwarf", arms: 0, pitchDeg: 0, density: 0.6 },
  "Fornax Dwarf": { morphology: "dwarf", arms: 0, pitchDeg: 0, density: 0.55 },
  "Sculptor Dwarf": { morphology: "dwarf", arms: 0, pitchDeg: 0, density: 0.5 },
};

function morphologyFor(type: string, name?: string): Morphology {
  const n = (name || "").toLowerCase();
  const t = (type || "").toLowerCase();
  if (t.includes("ring") || n.includes("cartwheel") || n.includes("hoag") || n.includes("mayall"))
    return "ring";
  if (
    n.includes("whirlpool") ||
    n.includes("pinwheel") ||
    t.includes("grand-design") ||
    t.includes("grand design")
  )
    return "grand-design";
  if (n.includes("sunflower") || n.includes("2841") || t.includes("flocculent"))
    return "flocculent";
  if (t.includes("dwarf") && t.includes("irregular")) return "irregular";
  if (/starburst/.test(t)) return "starburst";
  if (t.includes("dwarf") || t.includes("dsph") || n.includes("dwarf")) return "dwarf";
  if (
    /interacting|merging|colliding/i.test(type) ||
    n.includes("antennae") ||
    n.includes("mice") ||
    n.includes("quintet") ||
    n.includes("tadpole")
  )
    return "interacting";
  if (/starburst/i.test(type)) return "starburst";
  if (/edge-on/i.test(type)) return "edge-on";
  if (/barred/i.test(type) || /sb/i.test(type)) return "barred";
  if (/lenticular|s0/i.test(type)) return "lenticular";
  if (/elliptical|spheroidal/i.test(type)) return "elliptical";
  if (/irregular|magellanic/i.test(type)) return "irregular";
  return "spiral";
}

function colorTuple(hex: string): [number, number, number] {
  const c = new THREE.Color(hex);
  return [c.r, c.g, c.b];
}

function catalogModel(g: NamedGalaxy): GalaxyModel {
  const morphology = morphologyFor(g.type, g.name);
  const radius = g.size * 0.5;
  const dwarf = /dwarf/i.test(g.type);
  const oldPopulation = morphology === "elliptical" || morphology === "lenticular";
  const oldColor = colorTuple(g.color);
  const obs = g as Partial<import("./galaxy-catalog").ObservationalGalaxy>;
  const base: GalaxyModel = {
    key: `catalog-${g.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")}`,
    name: g.name,
    type: g.type,
    morphology,
    l: g.l,
    b: g.b,
    distance: g.distance,
    inclination: g.inclination ?? (morphology === "elliptical" ? 32 : 48),
    posAngle: g.posAngle ?? Math.abs(g.l * 13 + g.b * 7) % 180,
    diskRadius: radius,
    bulgeRadius:
      radius * (morphology === "elliptical" ? 0.68 : morphology === "lenticular" ? 0.38 : 0.1),
    haloRadius: radius * (morphology === "elliptical" ? 1.4 : 1.25),
    arms:
      morphology === "spiral" || morphology === "barred"
        ? g.size > 100_000
          ? 4
          : 2
        : morphology === "irregular"
          ? 1
          : 0,
    pitchDeg:
      morphology === "spiral" || morphology === "barred"
        ? g.size > 100_000
          ? 19
          : 15
        : morphology === "irregular"
          ? 32
          : 0,
    barLength: morphology === "barred" ? radius * 0.42 : 0,
    density: dwarf ? 0.12 : Math.min(0.42, 0.2 + g.size / 1_000_000),
    youngColor: oldPopulation ? [0.9, 0.86, 0.76] : [0.7, 0.84, 1.0],
    oldColor,
    coreColor: oldPopulation ? "rgba(255,220,170,1)" : "rgba(255,235,205,1)",
    rotPeriod: 480 + Math.sqrt(Math.max(radius, 1)) * 2.2,
    dustLanes: /spiral|lenticular|interacting/i.test(g.type),
    description: `${g.name} is a real ${g.type.toLowerCase()} galaxy about ${g.distance.toLocaleString()} light-years away${obs.hostGroup ? ` in the ${obs.hostGroup}` : ""}. Its observational model reflects catalogued physical diameter, sky position, and morphological class from NASA/IPAC NED. In accordance with strict scientific integrity, no fictional internal exoplanets or speculative star catalogs are invented for unresolved galaxies.`,
  };
  const merged = { ...base, ...(MORPHOLOGY_OVERRIDES[g.name] ?? {}) };
  // Only curated models carry visitable planetary systems; others retain purely observational reconstruction
  return merged;
}

/** Every named galaxy has a stable particle model; Andromeda remains bespoke. */
const RECONSTRUCTED_GALAXIES: GalaxyModel[] = [
  ...CURATED_GALAXY_MODELS,
  ...NEARBY_GALAXIES.filter(
    (g) => g.name !== "Andromeda (M31)" && !CURATED_BY_NAME.has(g.name),
  ).map(catalogModel),
];

export const GALAXY_MODELS: GalaxyModel[] = RECONSTRUCTED_GALAXIES.map((m) => {
  const observed = NEARBY_GALAXIES.find((g) => g.name === m.name);
  if (!observed) return m;
  const ratio = (observed.size * 0.5) / m.diskRadius;
  return {
    ...m,
    diskRadius: observed.size * 0.5,
    bulgeRadius: m.bulgeRadius * ratio,
    haloRadius: m.haloRadius * ratio,
    barLength: m.barLength * ratio,
    ringRadius: m.ringRadius === undefined ? undefined : m.ringRadius * ratio,
    inclination: observed.inclination ?? m.inclination,
    posAngle: observed.posAngle ?? m.posAngle,
    system: m.system
      ? {
          ...m.system,
          orbitRadius: m.system.orbitRadius * ratio,
          orbitHeight: m.system.orbitHeight * ratio,
        }
      : undefined,
  };
});
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
  return outer * 3.2 * systemPresentationScale(m);
}

/** Uniform navigation enlargement keeps tiny hosted worlds above Float64 world-coordinate precision. */
export function systemPresentationScale(m: GalaxyModel): number {
  const s = m.system;
  if (!s) return 1;
  const sizes = s.planets
    .flatMap((p) => [p.size, ...(p.moons ?? []).map((m) => m.size)])
    .filter((n) => n > 0);
  const smallest = Math.min(s.star.radius, ...sizes);
  return Math.max(
    1,
    ((m.distance + m.diskRadius) * Number.EPSILON * 4096) / Math.max(1e-12, smallest),
  );
}
