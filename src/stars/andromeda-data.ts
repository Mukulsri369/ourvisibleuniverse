import * as THREE from "three";
import { EXO_BODY_SCALE, EXO_STAR_MAGNIFY, LIGHT_YEARS_PER_AU, SOLAR_RADIUS_AU } from "./scale";

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
// One scene unit is one light-year, including inside this system.
// ---------------------------------------------------------------
export const M31_AU = LIGHT_YEARS_PER_AU;

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
  a: number; // scene units (ly)
  e: number;
  i: number; // rad
  omega: number; // rad
  size: number; // scene units (ly)
  color: string;
  atmosphere?: string;
  emissive?: string;
  period: number; // scene-seconds per revolution
  spinPeriod: number; // scene-seconds per rotation
  tilt: number;
  ring?: { inner: number; outer: number; color: string };
  moons?: M31MoonDef[];
  confirmed: boolean;
  description: string;
};

const d2r = (d: number) => (d * Math.PI) / 180;

export const PA99N2_STAR = {
  name: "PA-99-N2",
  radius: 0.5 * SOLAR_RADIUS_AU * EXO_STAR_MAGNIFY * M31_AU,
  color: "#ffd39a",
  spectral: "K-type main sequence (lens star)",
  mass: "≈ 0.5 M☉",
  distance: M31_DISTANCE,
  description:
    "The lensing star of microlensing event PA-99-N2, detected by the POINT-AGAPE survey toward M31 in 1999. Roughly half the Sun's mass, it hosts one of the few planet candidates ever found in another galaxy.",
};

export const M31_PLANETS: M31PlanetDef[] = [
  {
    name: "PA-99-N2 b",
    a: 2.5 * M31_AU,
    e: 0.16,
    i: 0,
    omega: d2r(295),
    size: 0.085 * EXO_BODY_SCALE * M31_AU,
    color: "#c89a68",
    emissive: "#3a2410",
    period: 78,
    spinPeriod: 0.9,
    tilt: d2r(9),
    ring: {
      inner: 0.13 * EXO_BODY_SCALE * M31_AU,
      outer: 0.2 * EXO_BODY_SCALE * M31_AU,
      color: "#a08a68",
    },

    confirmed: true,
    description:
      "An unconfirmed microlensing candidate: a gas giant of about 6.3 Jupiter masses orbiting roughly 2.5 AU from its star. The host and orbital interpretation are uncertain.",
  },
];

export const M31_PLANET_NAMES = new Set(M31_PLANETS.map((p) => p.name));
export const ANDROMEDA_NAME = "Andromeda (M31)";
