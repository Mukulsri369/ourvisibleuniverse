import * as THREE from "three";

// ---------------------------------------------------------------
// ANDROMEDA (M31) — shared constants & the PA-99-N2 planetary system.
//
// Kept in its own module (no store / component imports) so that both
// the renderer (Andromeda.tsx) and the navigation store can use the
// same geometry without a circular import.
// ---------------------------------------------------------------

// Real galactic coordinates of M31. Scene x-axis points AWAY from the
// galactic center (Sgr A* sits at -X), so l=0 maps to -x, matching
// the convention used in Universe.tsx.
export const M31_L = 121.2; // deg
export const M31_B = -21.6; // deg
export const M31_DISTANCE = 2_537_000; // light-years

function toXYZ(l: number, b: number, d: number): THREE.Vector3 {
  const lr = (l * Math.PI) / 180;
  const br = (b * Math.PI) / 180;
  return new THREE.Vector3(
    -d * Math.cos(br) * Math.cos(lr),
    d * Math.sin(br),
    d * Math.cos(br) * Math.sin(lr),
  );
}

export const M31_CENTER = toXYZ(M31_L, M31_B, M31_DISTANCE);

// Observed orientation on the sky: inclination 77° from face-on,
// major-axis position angle 35°.
export const M31_INCLINATION = (77 * Math.PI) / 180;
export const M31_POS_ANGLE = (35 * Math.PI) / 180;

// Structural scale (light-years). M31 is noticeably larger than the
// Milky Way: ~152,000 ly across with a dominant 10-kpc star ring.
export const M31_DISK_RADIUS = 110_000;
export const M31_RING_RADIUS = 32_000;
export const M31_BULGE_RADIUS = 9_000;
export const M31_HALO_RADIUS = 130_000;

// Particles are generated in the galaxy's own XZ plane; this converts
// a local disk point into world space.
const RX = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);
const ORIENT = new THREE.Quaternion().setFromEuler(
  new THREE.Euler(M31_INCLINATION, 0, M31_POS_ANGLE, "XYZ"),
);
export const M31_QUAT = ORIENT.clone().multiply(RX);

export function m31LocalToWorld(local: THREE.Vector3): THREE.Vector3 {
  return local.clone().applyQuaternion(M31_QUAT).add(M31_CENTER);
}

// ---------------------------------------------------------------
// PA-99-N2 — a star in M31's disk, host of the microlensing planet
// PA-99-N2 b (POINT-AGAPE survey, 1999; announced 2009). It is one of
// the only planet candidates known outside the Milky Way.
//
// Because M31 sits 2.5 million ly away, a true-to-scale planetary
// system would be far below float precision here. The system is drawn
// at an exaggerated scale (1 AU ≈ 900 ly) so it can actually be
// visited and watched in motion, exactly like the Solar System view.
// ---------------------------------------------------------------
export const M31_AU = 900; // scene ly per AU inside the PA-99-N2 system

// Position within M31's disk: in the star-forming ring, on the near side.
export const PA99N2_LOCAL = new THREE.Vector3(
  Math.cos(2.15) * M31_RING_RADIUS,
  400,
  Math.sin(2.15) * M31_RING_RADIUS,
);
export const PA99N2_WORLD = m31LocalToWorld(PA99N2_LOCAL);

export type M31MoonDef = {
  name: string;
  distance: number;
  size: number;
  color: string;
  period: number;
  inclination?: number;
};

export type M31PlanetDef = {
  name: string;
  a: number;      // scene units (ly)
  e: number;
  i: number;      // rad
  omega: number;  // rad
  size: number;   // scene units (ly)
  color: string;
  atmosphere?: string;
  emissive?: string;
  period: number;      // scene-seconds per revolution
  spinPeriod: number;  // scene-seconds per rotation
  tilt: number;
  ring?: { inner: number; outer: number; color: string };
  moons?: M31MoonDef[];
  confirmed: boolean;
  description: string;
};

const d2r = (d: number) => (d * Math.PI) / 180;

export const PA99N2_STAR = {
  name: "PA-99-N2",
  radius: 0.30 * M31_AU,
  color: "#ffd39a",
  spectral: "K-type main sequence (lens star)",
  mass: "≈ 0.5 M☉",
  distance: M31_DISTANCE,
  description:
    "The lensing star of microlensing event PA-99-N2, detected by the POINT-AGAPE survey toward M31 in 1999. Roughly half the Sun's mass, it hosts one of the few planet candidates ever found in another galaxy.",
};

export const M31_PLANETS: M31PlanetDef[] = [
  {
    name: "PA-99-N2 e",
    a: 0.34 * M31_AU, e: 0.06, i: d2r(2.1), omega: d2r(40),
    size: 0.016 * M31_AU, color: "#9c8570",
    period: 6.5, spinPeriod: 40, tilt: d2r(4),
    confirmed: false,
    description: "Hypothetical scorched inner world, modelled from the lens star's mass and typical K-dwarf system architectures.",
  },
  {
    name: "PA-99-N2 d",
    a: 0.72 * M31_AU, e: 0.03, i: d2r(1.2), omega: d2r(120),
    size: 0.024 * M31_AU, color: "#d9a06a", atmosphere: "#ffc48a",
    period: 15, spinPeriod: 6, tilt: d2r(18),
    confirmed: false,
    description: "Hypothetical warm terrestrial planet inside the habitable zone of a 0.5 M☉ star.",
  },
  {
    name: "PA-99-N2 c",
    a: 1.35 * M31_AU, e: 0.11, i: d2r(3.4), omega: d2r(210),
    size: 0.020 * M31_AU, color: "#8fa8c0", atmosphere: "#a9c8ff",
    period: 34, spinPeriod: 3.4, tilt: d2r(26),
    moons: [{ name: "PA-99-N2 c I", distance: 0.07 * M31_AU, size: 0.006 * M31_AU, color: "#c8cfd8", period: 3.2 }],
    confirmed: false,
    description: "Hypothetical cold super-Earth just beyond the snow line of the PA-99-N2 system.",
  },
  {
    name: "PA-99-N2 b",
    a: 2.5 * M31_AU, e: 0.16, i: 0, omega: d2r(295),
    size: 0.085 * M31_AU, color: "#c89a68", emissive: "#3a2410",
    period: 78, spinPeriod: 0.9, tilt: d2r(9),
    ring: { inner: 0.13 * M31_AU, outer: 0.20 * M31_AU, color: "#a08a68" },
    moons: [
      { name: "PA-99-N2 b I", distance: 0.14 * M31_AU, size: 0.010 * M31_AU, color: "#e0cfa8", period: 3.0 },
      { name: "PA-99-N2 b II", distance: 0.19 * M31_AU, size: 0.008 * M31_AU, color: "#b7a68c", period: 4.8 },
      { name: "PA-99-N2 b III", distance: 0.26 * M31_AU, size: 0.007 * M31_AU, color: "#8e8272", period: 7.5, inclination: 0.3 },
    ],
    confirmed: true,
    description: "The confirmed candidate: a gas giant of about 6.3 Jupiter masses orbiting roughly 2.5 AU from its star — the only known extragalactic planet candidate detected by gravitational microlensing.",
  },
  {
    name: "PA-99-N2 f",
    a: 6.1 * M31_AU, e: 0.07, i: d2r(1.9), omega: d2r(75),
    size: 0.045 * M31_AU, color: "#7fc6d6", emissive: "#0e2a33",
    period: 190, spinPeriod: 1.4, tilt: d2r(31),
    moons: [{ name: "PA-99-N2 f I", distance: 0.09 * M31_AU, size: 0.007 * M31_AU, color: "#cfe0e8", period: 5.4 }],
    confirmed: false,
    description: "Hypothetical outer ice giant, shepherd of the system's debris belt.",
  },
];

export const M31_PLANET_NAMES = new Set(M31_PLANETS.map((p) => p.name));
export const ANDROMEDA_NAME = "Andromeda (M31)";
