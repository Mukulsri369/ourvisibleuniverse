import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useStore } from "./store";
import { getSimulationJd, simTimeDays, simTimeYears, tickSim } from "./sim-clock";
import { jplEphemerisManager } from "@/lib/astronomy/jpl/ephemeris-cache";
import { computeMoonRelativeState } from "@/lib/astronomy/jpl/horizons-ephemeris";
import { JPL_PLANETS_PHYSICAL } from "@/lib/astronomy/jpl/planetary-physical-data";
import { SolarSystemOverlays } from "./SolarSystemOverlays";

// Real orbital elements (relative). We scale semi-major axis (a) so the
// entire Solar System fits realistically in the star field:
// 1 AU ≈ 0.05 light-years. Sizes are exaggerated for visibility so planets
// remain visitable and clearly visible when zoomed in.
// e = eccentricity (real), i = inclination to ecliptic (rad), omega = longitude of perihelion (rad).
export type MoonDef = {
  name: string; // from planet center, scene units
  distance: number; // from planet center, scene units
  size: number;
  color: string;
  period: number; // scene seconds per orbit
  inclination?: number;
};

import { scaleManager } from "@/lib/astronomy/scale-manager";
import { METERS_PER_LIGHT_YEAR } from "@/lib/astronomy/constants";

export type PlanetDef = {
  name: string;
  a: number; // semi-major axis (scene units)
  aAU?: number; // physical semi-major axis (AU)
  radiusKm?: number; // physical mean radius (km)
  e: number; // eccentricity
  i: number; // orbital inclination (rad)
  omega: number; // argument of perihelion (rad)
  size: number;
  color: string;
  emissive?: string;
  atmosphere?: string; // glow color
  period: number; // scene-seconds per revolution
  spinPeriod: number; // scene-seconds per rotation
  tilt: number; // axial tilt (rad)
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
    a: 0.39 * AU,
    aAU: 0.387098,
    radiusKm: 2439.7,
    e: 0.2056,
    i: deg(7.0),
    omega: deg(29.1),
    size: 0.021 * P,
    color: "#a89078",
    period: 7.6,
    spinPeriod: 90,
    tilt: deg(0.03),
    description:
      "The smallest and innermost planet, scorched by the Sun and cratered like the Moon.",
  },
  {
    name: "Venus",
    a: 0.72 * AU,
    aAU: 0.723332,
    radiusKm: 6051.8,
    e: 0.0068,
    i: deg(3.39),
    omega: deg(54.9),
    size: 0.052 * P,
    color: "#e8c47a",
    atmosphere: "#ffd58a",
    period: 19.4,
    spinPeriod: -120,
    tilt: deg(177.4),
    description:
      "A runaway greenhouse world wrapped in dense sulfuric-acid clouds. Surface hot enough to melt lead.",
  },
  {
    name: "Earth",
    a: 1.0 * AU,
    aAU: 1.00000261,
    radiusKm: 6371.0,
    e: 0.0167,
    i: 0,
    omega: deg(114.2),
    size: 0.055 * P,
    color: "#1f5fbf",
    atmosphere: "#7fb6ff",
    period: 31.5,
    spinPeriod: 1.5,
    tilt: deg(23.44),
    moons: [{ name: "Moon", distance: 0.33 * P, size: 0.015 * P, color: "#bdbdbd", period: 6 }],
    description: "Our home — the only known world with liquid water on the surface and life.",
  },
  {
    name: "Mars",
    a: 1.52 * AU,
    aAU: 1.523679,
    radiusKm: 3389.5,
    e: 0.0934,
    i: deg(1.85),
    omega: deg(286.5),
    size: 0.029 * P,
    color: "#c1440e",
    atmosphere: "#e08060",
    period: 59.2,
    spinPeriod: 1.55,
    tilt: deg(25.19),
    moons: [
      { name: "Phobos", distance: 0.1 * P, size: 0.006 * P, color: "#9a8474", period: 0.6 },
      { name: "Deimos", distance: 0.16 * P, size: 0.005 * P, color: "#8a7464", period: 1.4 },
    ],
    description:
      "The Red Planet — iron-oxide deserts, polar ice caps, and the tallest volcano in the Solar System.",
  },
  {
    name: "Jupiter",
    a: 5.2 * AU,
    aAU: 5.204267,
    radiusKm: 71492,
    e: 0.0489,
    i: deg(1.31),
    omega: deg(273.9),
    size: 0.617 * P,
    color: "#c8a878",
    emissive: "#3a2410",
    atmosphere: "#d8c3a0",
    period: 96,
    spinPeriod: 0.6,
    tilt: deg(3.13),
    ring: { inner: 0.72 * P, outer: 0.96 * P, color: "#8c7860" },
    moons: [
      { name: "Io", distance: 1.2 * P, size: 0.017 * P, color: "#e6cf6a", period: 2.2 },
      { name: "Europa", distance: 1.5 * P, size: 0.015 * P, color: "#e3d9c2", period: 3.6 },
      { name: "Ganymede", distance: 1.9 * P, size: 0.025 * P, color: "#b5a48b", period: 6.2 },
      { name: "Callisto", distance: 2.55 * P, size: 0.023 * P, color: "#7e6f5d", period: 11.7 },
      { name: "Metis", distance: 0.8 * P, size: 0.004 * P, color: "#8a7b68", period: 0.5 },
      {
        name: "Adrastea",
        distance: 0.84 * P,
        size: 0.003 * P,
        color: "#8f8070",
        period: 0.55,
        inclination: 0.02,
      },
      { name: "Amalthea", distance: 0.95 * P, size: 0.006 * P, color: "#b5644a", period: 0.8 },
      {
        name: "Thebe",
        distance: 1.05 * P,
        size: 0.005 * P,
        color: "#9c7a62",
        period: 1.1,
        inclination: 0.03,
      },
      {
        name: "Himalia",
        distance: 3.3 * P,
        size: 0.007 * P,
        color: "#7a7266",
        period: 22,
        inclination: 0.5,
      },
      {
        name: "Elara",
        distance: 3.55 * P,
        size: 0.005 * P,
        color: "#6f685c",
        period: 26,
        inclination: 0.48,
      },
      {
        name: "Pasiphae",
        distance: 4.1 * P,
        size: 0.005 * P,
        color: "#66605a",
        period: 34,
        inclination: -2.6,
      },
      {
        name: "Carme",
        distance: 4.3 * P,
        size: 0.004 * P,
        color: "#5f5a54",
        period: 37,
        inclination: -2.7,
      },
    ],
    description:
      "The Solar System's giant — a gas world with the Great Red Spot, faint rings, and 95+ moons.",
  },
  {
    name: "Saturn",
    a: 9.58 * AU,
    aAU: 9.5826,
    radiusKm: 58232,
    e: 0.0565,
    i: deg(2.49),
    omega: deg(339.4),
    size: 0.52 * P,
    color: "#e6c98a",
    emissive: "#3a2c0e",
    atmosphere: "#e6d3a3",
    period: 150,
    spinPeriod: 0.7,
    tilt: deg(26.73),
    ring: { inner: 0.66 * P, outer: 1.38 * P, color: "#e6d8b4", tilt: deg(26.73) },
    moons: [
      {
        name: "Mimas",
        distance: 1.05 * P,
        size: 0.005 * P,
        color: "#cfcabd",
        period: 1.2,
        inclination: 0.03,
      },
      { name: "Enceladus", distance: 1.2 * P, size: 0.006 * P, color: "#f2f5f7", period: 1.6 },
      { name: "Tethys", distance: 1.4 * P, size: 0.009 * P, color: "#ddd8cc", period: 2.2 },
      { name: "Dione", distance: 1.65 * P, size: 0.009 * P, color: "#d2ccbf", period: 3.0 },
      { name: "Rhea", distance: 2.0 * P, size: 0.012 * P, color: "#cbc5b8", period: 4.7 },
      { name: "Titan", distance: 2.6 * P, size: 0.023 * P, color: "#d4a85a", period: 7.8 },
      {
        name: "Hyperion",
        distance: 3.0 * P,
        size: 0.005 * P,
        color: "#b8a68c",
        period: 9.6,
        inclination: 0.1,
      },
      {
        name: "Iapetus",
        distance: 3.8 * P,
        size: 0.011 * P,
        color: "#9c8f7c",
        period: 22,
        inclination: 0.27,
      },
      {
        name: "Phoebe",
        distance: 4.6 * P,
        size: 0.005 * P,
        color: "#6b6558",
        period: 40,
        inclination: -2.7,
      },
    ],
    description:
      "Famed for its bright icy ring system. A gas giant with the lowest density of any planet.",
  },
  {
    name: "Uranus",
    a: 19.2 * AU,
    aAU: 19.2294,
    radiusKm: 25362,
    e: 0.0457,
    i: deg(0.77),
    omega: deg(96.99),
    size: 0.22 * P,
    color: "#9fd8e0",
    emissive: "#102830",
    atmosphere: "#9fe3ea",
    period: 240,
    spinPeriod: -1.0,
    tilt: deg(97.77),
    ring: { inner: 0.36 * P, outer: 0.52 * P, color: "#82a8b4", tilt: deg(97.77) },
    moons: [
      {
        name: "Puck",
        distance: 0.55 * P,
        size: 0.004 * P,
        color: "#7f7f7f",
        period: 0.8,
        inclination: 0.02,
      },
      { name: "Miranda", distance: 0.8 * P, size: 0.005 * P, color: "#b9c2c4", period: 1.4 },
      { name: "Ariel", distance: 1.0 * P, size: 0.009 * P, color: "#cdd6d8", period: 2.5 },
      { name: "Umbriel", distance: 1.25 * P, size: 0.009 * P, color: "#8d9698", period: 4.1 },
      { name: "Titania", distance: 1.7 * P, size: 0.012 * P, color: "#c2c9c9", period: 8.7 },
      { name: "Oberon", distance: 2.1 * P, size: 0.012 * P, color: "#a8b0b0", period: 13.5 },
    ],
    description: "An ice giant tilted on its side, rolling around the Sun once every 84 years.",
  },
  {
    name: "Neptune",
    a: 30.05 * AU,
    aAU: 30.0699,
    radiusKm: 24622,
    e: 0.0113,
    i: deg(1.77),
    omega: deg(273.2),
    size: 0.213 * P,
    color: "#3b6df0",
    emissive: "#08163a",
    atmosphere: "#4d7cff",
    period: 330,
    spinPeriod: 1.1,
    tilt: deg(28.32),
    ring: { inner: 0.34 * P, outer: 0.48 * P, color: "#5c7da8", tilt: deg(28.32) },
    moons: [
      {
        name: "Naiad",
        distance: 0.3 * P,
        size: 0.003 * P,
        color: "#9aa3ad",
        period: 0.4,
        inclination: 0.08,
      },
      { name: "Despina", distance: 0.36 * P, size: 0.004 * P, color: "#a2abb5", period: 0.5 },
      { name: "Galatea", distance: 0.42 * P, size: 0.004 * P, color: "#a8b1bb", period: 0.6 },
      { name: "Larissa", distance: 0.48 * P, size: 0.005 * P, color: "#9ba4ae", period: 0.7 },
      { name: "Proteus", distance: 0.55 * P, size: 0.007 * P, color: "#8f98a2", period: 0.9 },
      {
        name: "Triton",
        distance: 0.8 * P,
        size: 0.02 * P,
        color: "#cfd6e0",
        period: 5.5,
        inclination: -2.8,
      },
      {
        name: "Nereid",
        distance: 1.6 * P,
        size: 0.005 * P,
        color: "#aeb6c0",
        period: 20,
        inclination: 0.5,
      },
    ],
    description:
      "The windiest planet — supersonic storms tear through its deep-blue methane atmosphere.",
  },
  {
    name: "Pluto",
    a: 39.5 * AU,
    aAU: 39.482,
    radiusKm: 1188.3,
    e: 0.2488,
    i: deg(17.16),
    omega: deg(113.76),
    size: 0.01 * P,
    color: "#c9b39a",
    atmosphere: "#78b4eb",
    period: 420,
    spinPeriod: 2.1,
    tilt: deg(122.5),
    moons: [
      { name: "Charon", distance: 0.06 * P, size: 0.005 * P, color: "#9d8e7e", period: 1.6 },
      {
        name: "Styx",
        distance: 0.09 * P,
        size: 0.0015 * P,
        color: "#8d8272",
        period: 2.4,
        inclination: 0.03,
      },
      { name: "Nix", distance: 0.11 * P, size: 0.002 * P, color: "#a89c8b", period: 3.0 },
      {
        name: "Kerberos",
        distance: 0.13 * P,
        size: 0.0015 * P,
        color: "#8a7f70",
        period: 3.7,
        inclination: 0.04,
      },
      { name: "Hydra", distance: 0.15 * P, size: 0.002 * P, color: "#b0a493", period: 4.4 },
    ],
    description:
      "A dwarf planet in the Kuiper Belt. Its eccentric, inclined orbit sometimes brings it closer to the Sun than Neptune.",
  },
];

// Real J2000 mean elements (Standish/JPL): mean longitude L0, longitude of
// perihelion, sidereal period (years) and sidereal rotation (hours, negative =
// retrograde). Positions are evaluated for the live simulation date.
export const REAL_ORBITS: Record<
  string,
  { L0: number; peri: number; years: number; rotH: number }
> = {
  Mercury: { L0: 252.25, peri: 77.46, years: 0.2408467, rotH: 1407.6 },
  Venus: { L0: 181.98, peri: 131.6, years: 0.61519726, rotH: -5832.5 },
  Earth: { L0: 100.46, peri: 102.94, years: 1.0000174, rotH: 23.934 },
  Mars: { L0: 355.45, peri: 336.04, years: 1.8808476, rotH: 24.623 },
  Jupiter: { L0: 34.4, peri: 14.73, years: 11.862615, rotH: 9.925 },
  Saturn: { L0: 49.94, peri: 92.43, years: 29.447498, rotH: 10.656 },
  Uranus: { L0: 313.23, peri: 170.96, years: 84.016846, rotH: -17.24 },
  Neptune: { L0: 304.88, peri: 44.97, years: 164.79132, rotH: 16.11 },
  Pluto: { L0: 238.93, peri: 224.07, years: 247.92065, rotH: -153.29 },
};

// Real sidereal moon periods (days); negative = retrograde orbit.
export const MOON_DAYS: Record<string, number> = {
  Moon: 27.3217,
  Phobos: 0.3189,
  Deimos: 1.2624,
  Io: 1.7691,
  Europa: 3.5512,
  Ganymede: 7.1546,
  Callisto: 16.689,
  Metis: 0.2948,
  Adrastea: 0.2983,
  Amalthea: 0.4982,
  Thebe: 0.6745,
  Himalia: 250.56,
  Elara: 259.64,
  Pasiphae: -743.6,
  Carme: -702.3,
  Mimas: 0.9424,
  Enceladus: 1.3702,
  Tethys: 1.8878,
  Dione: 2.7369,
  Rhea: 4.5182,
  Titan: 15.945,
  Hyperion: 21.277,
  Iapetus: 79.322,
  Phoebe: -550.3,
  Puck: 0.7618,
  Miranda: 1.4135,
  Ariel: 2.5204,
  Umbriel: 4.1442,
  Titania: 8.7059,
  Oberon: 13.4632,
  Naiad: 0.2944,
  Despina: 0.3347,
  Galatea: 0.4287,
  Larissa: 0.5548,
  Proteus: 1.1223,
  Triton: -5.8769,
  Nereid: 360.13,
  Charon: 6.3872,
  Styx: 20.162,
  Nix: 24.855,
  Kerberos: 32.168,
  Hydra: 38.202,
};
// Mean longitudes at J2000 (deg) where well determined.
const MOON_L0: Record<string, number> = {
  Moon: 218.316,
  Io: 106.08,
  Europa: 175.73,
  Ganymede: 120.56,
  Callisto: 84.44,
  Titan: 15.15,
};

for (const p of PLANETS) {
  const r = REAL_ORBITS[p.name];
  if (r) p.omega = deg(r.peri);
}

function seedAngle(name: string) {
  let h = 7;
  for (let i = 0; i < name.length; i++) h = (h * 131 + name.charCodeAt(i)) % 100003;
  return (h / 100003) * Math.PI * 2;
}

/** Mean anomaly (rad) at the current simulation date. */
function meanAnomaly(def: PlanetDef): number {
  const r = REAL_ORBITS[def.name];
  if (!r) return seedAngle(def.name) + (simTimeYears() / (def.period / 31.5)) * Math.PI * 2;
  const boost = OUTER_ORBIT_BOOST[def.name] ?? 1;
  return deg(r.L0 - r.peri) + ((simTimeYears() * boost) / r.years) * Math.PI * 2;
}

// Outer worlds take decades to circle the Sun; speed up their revolution so
// it is visibly animated (positions still start from today's real longitude).
const OUTER_ORBIT_BOOST: Record<string, number> = {
  Jupiter: 4,
  Saturn: 6,
  Uranus: 10,
  Neptune: 14,
  Pluto: 18,
};

export function getPlanetEffectiveA(def: PlanetDef, scaleMode: "enhanced" | "true_scale"): number {
  if (scaleMode === "true_scale" && def.aAU != null) {
    return def.aAU * scaleManager.getRenderAU("true_scale");
  }
  return def.a;
}

export function getPlanetEffectiveSize(
  def: PlanetDef,
  scaleMode: "enhanced" | "true_scale",
): number {
  if (scaleMode === "true_scale" && def.radiusKm != null) {
    return (def.radiusKm * 1_000) / METERS_PER_LIGHT_YEAR;
  }
  return def.size;
}

// Kepler's equation solver
function keplerPosition(
  def: PlanetDef,
  _phase: number,
  _t: number,
  effectiveA = def.a,
): THREE.Vector3 {
  const M = meanAnomaly(def);
  let E = M;
  for (let k = 0; k < 6; k++) {
    E = E - (E - def.e * Math.sin(E) - M) / (1 - def.e * Math.cos(E));
  }
  const cosE = Math.cos(E),
    sinE = Math.sin(E);
  // perifocal plane (x toward perihelion, z perpendicular)
  const xp = effectiveA * (cosE - def.e);
  const zp = effectiveA * Math.sqrt(1 - def.e * def.e) * sinE;
  // rotate by argument of perihelion (around Y)
  const cw = Math.cos(def.omega),
    sw = Math.sin(def.omega);
  const x1 = xp * cw - zp * sw;
  const z1 = xp * sw + zp * cw;
  // tilt by inclination around X
  const ci = Math.cos(def.i),
    si = Math.sin(def.i);
  return new THREE.Vector3(x1, -z1 * si, z1 * ci);
}

// Build an elliptical orbit line (real Kepler ellipse — not a perfect circle)
function makeOrbitLine(def: PlanetDef, color: string, opacity: number, effectiveA = def.a) {
  const segments = 256;
  const pts: number[] = [];
  for (let k = 0; k <= segments; k++) {
    const E = (k / segments) * Math.PI * 2;
    const xp = effectiveA * (Math.cos(E) - def.e);
    const zp = effectiveA * Math.sqrt(1 - def.e * def.e) * Math.sin(E);
    const cw = Math.cos(def.omega),
      sw = Math.sin(def.omega);
    const x1 = xp * cw - zp * sw;
    const z1 = xp * sw + zp * cw;
    const ci = Math.cos(def.i),
      si = Math.sin(def.i);
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
  interface Window {
    __planetPositions?: PlanetRegistry;
  }
}

function getRegistry(): PlanetRegistry {
  if (!window.__planetPositions) window.__planetPositions = new Map();
  return window.__planetPositions;
}

// --- Atmospheric scattering -------------------------------------------------
// Rayleigh (∝ λ⁻⁴) colours the sunlit limb, the day/night terminator glows with
// long-wavelength light, and Mie scattering adds a forward-scattering halo
// when looking toward the Sun. Mars is famously inverted: dusty butterscotch
// days and blue sunsets.
const ATMO_PRESETS: Record<string, { ray: string; sunset: string; mie: number }> = {
  Mercury: { ray: "#b8a68e", sunset: "#d69e66", mie: 0.15 },
  Earth: { ray: "#4287ff", sunset: "#ff6e30", mie: 0.62 },
  Venus: { ray: "#f5d78e", sunset: "#ffa854", mie: 0.85 },
  Mars: { ray: "#de9b68", sunset: "#6fa6ff", mie: 0.92 },
  Jupiter: { ray: "#dec7a2", sunset: "#c98552", mie: 0.36 },
  Saturn: { ray: "#ebd8a8", sunset: "#cf9b5e", mie: 0.36 },
  Uranus: { ray: "#9ae6ef", sunset: "#68c2cc", mie: 0.28 },
  Neptune: { ray: "#4578ff", sunset: "#2c4fd6", mie: 0.32 },
  Pluto: { ray: "#6cb4f5", sunset: "#4284cc", mie: 0.45 },
};
const ATMO_VERT = /* glsl */ `
#include <common>
#include <logdepthbuf_pars_vertex>
varying vec3 vN; varying vec3 vW;
void main(){
  vec4 w = modelMatrix * vec4(position,1.0);
  vW = w.xyz;
  vN = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * w;
  #include <logdepthbuf_vertex>
}`;
const ATMO_FRAG = /* glsl */ `
#include <logdepthbuf_pars_fragment>
uniform vec3 uSun; uniform vec3 uRay; uniform vec3 uSunset; uniform float uMie;
varying vec3 vN; varying vec3 vW;
void main(){
  #include <logdepthbuf_fragment>
  vec3 N = normalize(vN);
  vec3 V = normalize(cameraPosition - vW);
  vec3 L = normalize(uSun - vW);
  float nv = max(dot(N,V), 0.0);
  float nl = dot(N,L);
  float cosGamma = dot(-V, L);

  // Rayleigh phase function: P_R(cosGamma) = (3/16pi) * (1 + cos^2(gamma))
  float pRay = 0.75 * (1.0 + cosGamma * cosGamma);

  // Cornette-Shanks forward Mie scattering phase function approximation
  float g = 0.76;
  float pMie = (1.5 * (1.0 - g * g) / (2.0 + g * g)) * (1.0 + cosGamma * cosGamma) / pow(1.0 + g * g - 2.0 * g * cosGamma, 1.5);

  // Optical airmass path length along grazing limb
  float rim = pow(1.0 - nv, 2.75);
  float day = smoothstep(-0.18, 0.42, nl);
  
  // Sunset terminator optical reddening (Chappuis ozone + atmospheric extinction)
  float term = exp(-pow((nl - 0.015) / 0.19, 2.0));

  vec3 rayleighCol = uRay * pRay * rim * day * 1.5;
  vec3 sunsetCol = uSunset * term * rim * 1.35;
  vec3 forwardMieCol = mix(uSunset, vec3(1.0), 0.6) * pMie * uMie * rim * max(nl + 0.35, 0.0);

  vec3 col = rayleighCol + sunsetCol + forwardMieCol;
  float a = clamp(max(col.r, max(col.g, col.b)), 0.0, 0.95);
  gl_FragColor = vec4(col, a);
}`;

// --- Planet-Specific 3D Physical Surface, Ocean Glint & Night City Lights ---
const PLANET_ID_MAP: Record<string, number> = {
  Mercury: 1,
  Venus: 2,
  Earth: 3,
  Mars: 4,
  Jupiter: 5,
  Saturn: 6,
  Uranus: 7,
  Neptune: 8,
  Pluto: 9,
};

const DETAIL_VERT = /* glsl */ `
#include <common>
#include <logdepthbuf_pars_vertex>
varying vec3 vP; varying vec3 vN; varying vec3 vW; varying vec2 vUv;
void main(){
  vP = normalize(position);
  vUv = uv;
  vec4 w = modelMatrix * vec4(position,1.0);
  vW = w.xyz;
  vN = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * w;
  #include <logdepthbuf_vertex>
}`;

const DETAIL_FRAG = /* glsl */ `
#include <logdepthbuf_pars_fragment>
uniform sampler2D uMap;
uniform vec3 uSun;
uniform float uTime;
uniform float uNear;
uniform float uGas;
uniform float uSeed;
uniform float uPlanetId;
uniform vec3 uTint;
uniform vec3 uStorm;
varying vec3 vP;
varying vec3 vN;
varying vec3 vW;
varying vec2 vUv;

float h3(vec3 p){ return fract(sin(dot(p, vec3(127.1,311.7,74.7))) * 43758.5453); }
float n3(vec3 p){
  vec3 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z);
}
float fbm(vec3 p){ float s=0.0,a=0.5; for(int i=0;i<5;i++){ s+=a*n3(p); p*=2.03; a*=0.5; } return s; }

void main(){
  #include <logdepthbuf_fragment>
  vec3 N = normalize(vN);
  vec3 V = normalize(cameraPosition - vW);
  vec3 L = normalize(uSun - vW);
  vec3 H = normalize(L + V);
  float nl = dot(N, L);
  float nv = max(dot(N, V), 0.0);
  float dayLit = smoothstep(-0.08, 0.14, nl);
  float diffuse = clamp(nl * 0.88 + 0.12, 0.0, 1.0) * dayLit + 0.025;

  vec3 texCol = texture2D(uMap, vUv).rgb;
  float lat = vP.y;
  float lon = atan(vP.z, vP.x);

  // Perturbed micro-normal for rocky/icy worlds
  float eps = 0.015;
  float h0 = fbm(vP * 18.0 + uSeed);
  float hx = fbm((vP + vec3(eps, 0.0, 0.0)) * 18.0 + uSeed);
  float hy = fbm((vP + vec3(0.0, eps, 0.0)) * 18.0 + uSeed);
  vec3 bumpN = normalize(N + (vec3(h0 - hx, h0 - hy, 0.0)) * (uGas > 0.5 ? 0.08 : 0.45) * (0.35 + 0.65 * uNear));
  float bumpLit = clamp(dot(bumpN, L) * 0.92 + 0.10, 0.0, 1.0) * dayLit + 0.025;

  vec3 col = texCol;
  vec3 additiveEmission = vec3(0.0);

  if (abs(uPlanetId - 3.0) < 0.1) {
    // EARTH: Ocean vs Land separation from texture chromaticity, ocean specular sunglint, & night city lights
    float blueDominance = texCol.b - max(texCol.r, texCol.g * 0.92);
    float polarCap = smoothstep(0.76, 0.90, abs(lat));
    float oceanMask = clamp(smoothstep(0.01, 0.14, blueDominance) * (1.0 - polarCap), 0.0, 1.0);
    float landMask = clamp((1.0 - oceanMask) * (1.0 - polarCap), 0.0, 1.0);

    // Fine continental mountain relief on land
    float relief = 0.82 + 0.36 * fbm(vP * 32.0 + uSeed);
    col = mix(texCol, texCol * relief, landMask * (0.4 + 0.6 * uNear));

    // Specular solar sunglint on oceans (warmer orange near terminator)
    float spec = pow(max(dot(N, H), 0.0), 54.0) * oceanMask * max(nl, 0.0);
    float fresnelWater = pow(1.0 - nv, 3.5) * oceanMask * dayLit * 0.25;
    vec3 glintColor = mix(vec3(1.0, 0.62, 0.32), vec3(1.0, 0.97, 0.90), smoothstep(0.0, 0.38, nl));
    col = col * mix(diffuse, bumpLit, landMask) + glintColor * spec * 0.85 + vec3(0.18, 0.42, 0.78) * fresnelWater;

    // Night-side city lights along populated mid-latitude continents & coastlines
    float nightMask = smoothstep(0.06, -0.18, nl);
    if (nightMask > 0.005 && landMask > 0.15) {
      float latBand = smoothstep(0.05, 0.22, abs(lat)) * (1.0 - smoothstep(0.55, 0.74, abs(lat)));
      float urbanCluster = fbm(vP * 24.0 + vec3(3.1, 7.4, -2.2));
      float citySparkle = smoothstep(0.58, 0.76, n3(vP * 115.0 + vec3(1.7))) * smoothstep(0.46, 0.66, urbanCluster);
      float highway = smoothstep(0.48, 0.51, abs(n3(vP * 48.0) - 0.5)) * smoothstep(0.52, 0.68, urbanCluster) * 0.35;
      vec3 cityCol = vec3(1.0, 0.76, 0.36) * (citySparkle * 1.45 + highway) * (0.35 + 0.65 * latBand);
      additiveEmission += cityCol * nightMask * landMask;
    }
    gl_FragColor = vec4(col + additiveEmission, 1.0);
    return;
  }

  if (uGas > 0.5) {
    // GAS & ICE GIANTS: Differential zonal rotation, Kelvin-Helmholtz wave festoons, & signature vortices
    float shift = uTime * 0.018 * (1.0 - 0.65 * lat * lat);
    vec3 q = vec3(cos(lon + shift), lat * 5.5, sin(lon + shift));
    float warp = fbm(q * 2.6 + uSeed + vec3(0.0, uTime * 0.008, 0.0));
    float bandFreq = (abs(uPlanetId - 5.0) < 0.1) ? 36.0 : (abs(uPlanetId - 6.0) < 0.1) ? 28.0 : 16.0;
    float bands = sin(lat * bandFreq + warp * 4.5) * 0.5 + 0.5;
    float fine = fbm(q * 11.0 + warp * 2.2);
    vec3 procGas = mix(texCol * 0.85, texCol * (0.82 + 0.36 * bands) * (0.88 + 0.24 * fine), 0.45 + 0.45 * uNear);

    if (abs(uPlanetId - 5.0) < 0.1) {
      // JUPITER: Great Red Spot anticyclonic vortex at ~22°S (lat ≈ -0.37)
      vec2 grsPos = vec2(mod(lon + shift * 0.45 + 3.14159, 6.28318) - 3.14159, (lat + 0.37) * 3.2);
      float dGrs = length(grsPos * vec2(1.0, 1.85));
      float swirlAngle = atan(grsPos.y, grsPos.x) + (1.0 - clamp(dGrs, 0.0, 1.0)) * 5.0 - uTime * 0.15;
      float swirlNoise = fbm(vec3(cos(swirlAngle) * dGrs * 4.0, sin(swirlAngle) * dGrs * 4.0, uSeed));
      float grsMask = smoothstep(0.36, 0.04, dGrs);
      float grsRing = smoothstep(0.32, 0.18, dGrs) * smoothstep(0.05, 0.18, dGrs);
      vec3 grsCol = mix(vec3(0.82, 0.28, 0.14), vec3(0.95, 0.56, 0.34), swirlNoise * 0.7 + grsRing * 0.4);
      procGas = mix(procGas, grsCol, grsMask * 0.85);
    } else if (abs(uPlanetId - 6.0) < 0.1) {
      // SATURN: North Polar Hexagonal Jet Stream at ~78°N (lat > 0.78)
      if (lat > 0.72) {
        float rPolar = sqrt(max(0.0, 1.0 - lat * lat));
        float hexRadius = 0.34 + 0.022 * cos(6.0 * (lon + uTime * 0.03));
        float hexWall = exp(-pow((rPolar - hexRadius) / 0.035, 2.0));
        float polarEye = smoothstep(0.08, 0.0, rPolar);
        procGas = mix(procGas, vec3(0.62, 0.48, 0.28), hexWall * 0.65);
        procGas = mix(procGas, vec3(0.32, 0.22, 0.12), polarEye * 0.75);
      }
    } else if (abs(uPlanetId - 8.0) < 0.1) {
      // NEPTUNE: Great Dark Spot & high-altitude bright white methane-ice cirrus streaks
      vec2 gdsPos = vec2(mod(lon + shift * 0.5 + 2.2, 6.28318) - 3.14159, (lat + 0.34) * 3.0);
      float dGds = length(gdsPos * vec2(0.9, 1.9));
      float gdsMask = smoothstep(0.32, 0.05, dGds);
      float companionCloud = smoothstep(0.36, 0.22, dGds) * smoothstep(0.14, 0.26, dGds) * smoothstep(0.45, 0.75, fbm(q * 14.0));
      procGas = mix(procGas, vec3(0.05, 0.12, 0.38), gdsMask * 0.78);
      procGas = mix(procGas, vec3(0.92, 0.97, 1.0), companionCloud * 0.85);
    }

    // Minnaert / limb darkening for deep gas atmospheres
    float limbDark = pow(max(nv, 0.05), 0.28);
    gl_FragColor = vec4(procGas * diffuse * (0.72 + 0.28 * limbDark), 1.0);
    return;
  }

  // ROCKY & ICY WORLDS (Mercury, Venus, Mars, Pluto)
  if (abs(uPlanetId - 2.0) < 0.1) {
    // VENUS: Super-rotating sulfuric acid clouds with Rossby-Kelvin Y-wave
    float vShift = -uTime * 0.035;
    float yWave = sin(lon + vShift + cos(lat * 3.2) * 1.6) * (1.0 - abs(lat));
    float streaks = fbm(vec3(cos(lon + vShift), lat * 4.5, sin(lon + vShift)) * 5.0);
    vec3 venusCol = mix(texCol, texCol * (0.86 + 0.18 * yWave + 0.16 * streaks), 0.65);
    gl_FragColor = vec4(venusCol * diffuse, 1.0);
    return;
  }

  // Cratered / tectonic relief shading for Mercury, Mars, Pluto
  float micro = fbm(vP * 58.0 + uSeed * 2.0);
  float cField = n3(vP * 38.0 + uSeed);
  float craterRim = smoothstep(0.62, 0.69, cField) - smoothstep(0.69, 0.77, cField);
  float shade = 0.84 + 0.22 * (h0 - 0.5) + 0.16 * (micro - 0.5) + craterRim * 0.28 * uNear;
  gl_FragColor = vec4(texCol * shade * bumpLit, 1.0);
}`;

// --- Earth 3D Animated Cloud & Cyclone Sphere Shader -----------------------
const EARTH_CLOUDS_VERT = /* glsl */ `
#include <common>
#include <logdepthbuf_pars_vertex>
varying vec3 vP; varying vec3 vN; varying vec3 vW;
void main(){
  vP = normalize(position);
  vec4 w = modelMatrix * vec4(position, 1.0);
  vW = w.xyz;
  vN = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * w;
  #include <logdepthbuf_vertex>
}`;

const EARTH_CLOUDS_FRAG = /* glsl */ `
#include <logdepthbuf_pars_fragment>
uniform vec3 uSun;
uniform float uTime;
varying vec3 vP;
varying vec3 vN;
varying vec3 vW;

float h3(vec3 p){ return fract(sin(dot(p, vec3(127.1,311.7,74.7))) * 43758.5453); }
float n3(vec3 p){
  vec3 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z);
}
float fbm(vec3 p){ float s=0.0,a=0.5; for(int i=0;i<5;i++){ s+=a*n3(p); p*=2.04; a*=0.5; } return s; }

void main(){
  #include <logdepthbuf_fragment>
  vec3 N = normalize(vN);
  vec3 L = normalize(uSun - vW);
  float nl = dot(N, L);

  float lat = vP.y;
  float lon = atan(vP.z, vP.x) + uTime * 0.012;
  vec3 q = vec3(cos(lon) * (1.0 - 0.25 * lat * lat), lat * 2.2, sin(lon) * (1.0 - 0.25 * lat * lat));
  vec3 warp = vec3(
    fbm(q * 3.2 + vec3(uTime * 0.015, 0.0, 0.0)),
    fbm(q * 3.2 + vec3(0.0, uTime * 0.015, 4.1)),
    fbm(q * 3.2 + vec3(2.7, -uTime * 0.015, 0.0))
  );
  float cloud = fbm(q * 5.2 + warp * 1.65);
  // Intertropical Convergence Zone (ITCZ) & mid-latitude storm tracks
  float stormTrack = 0.12 * exp(-pow(lat / 0.14, 2.0)) + 0.10 * exp(-pow((abs(lat) - 0.52) / 0.18, 2.0));
  float alpha = smoothstep(0.47 - stormTrack, 0.76, cloud) * 0.78;
  if (alpha < 0.01) discard;

  float day = smoothstep(-0.14, 0.25, nl);
  float sunsetTerm = exp(-pow((nl - 0.02) / 0.14, 2.0));
  vec3 cloudCol = mix(vec3(0.04, 0.06, 0.12), vec3(0.98, 0.99, 1.0), day);
  cloudCol = mix(cloudCol, vec3(1.0, 0.58, 0.32), sunsetTerm * 0.65);
  gl_FragColor = vec4(cloudCol, alpha);
}`;

// --- Physically Shaded 3D Planetary Rings with Live Planet Shadow Casting ---
const RING_VERT = /* glsl */ `
#include <common>
#include <logdepthbuf_pars_vertex>
varying vec2 vUv;
varying vec3 vW;
varying vec3 vN;
void main(){
  vUv = uv;
  vec4 w = modelMatrix * vec4(position, 1.0);
  vW = w.xyz;
  vN = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * w;
  #include <logdepthbuf_vertex>
}`;

const RING_FRAG = /* glsl */ `
#include <logdepthbuf_pars_fragment>
uniform sampler2D uRingTex;
uniform vec3 uColor;
uniform vec3 uSun;
uniform vec3 uPlanetCenter;
uniform float uPlanetRadius;
varying vec2 vUv;
varying vec3 vW;
varying vec3 vN;

void main(){
  #include <logdepthbuf_fragment>
  vec4 tex = texture2D(uRingTex, vUv);
  if (tex.a < 0.01) discard;

  vec3 L = normalize(uSun - vW);
  vec3 V = normalize(cameraPosition - vW);

  // Analytical ray-sphere intersection: cast shadow of planet onto its ring plane
  vec3 oc = vW - uPlanetCenter;
  float b = dot(oc, L);
  float c = dot(oc, oc) - uPlanetRadius * uPlanetRadius;
  float disc = b * b - c;
  // Soft penumbra across the planet shadow boundary
  float inShadow = (b < 0.0 && disc > 0.0)
    ? smoothstep(0.0, uPlanetRadius * uPlanetRadius * 0.08, disc)
    : 0.0;
  float shadowFactor = 1.0 - 0.88 * inShadow;

  // Phase-angle scattering: Seeliger opposition surge + forward dust diffraction
  float cosPhase = dot(-V, L);
  float backScatter = smoothstep(0.2, 1.0, -cosPhase) * 0.32;
  float forwardScatter = pow(max(0.0, cosPhase), 4.0) * 0.45;
  // Fine radial micro-ringlets
  float microRinglet = 0.88 + 0.12 * sin(vUv.x * 420.0) * cos(vUv.x * 135.0);

  vec3 col = tex.rgb * uColor * microRinglet * (0.78 + backScatter + forwardScatter) * shadowFactor;
  gl_FragColor = vec4(col, tex.a * 0.96);
}`;

function Planet({ def }: { def: PlanetDef }) {
  const groupRef = useRef<THREE.Group>(null!);
  const bodyRef = useRef<THREE.Mesh>(null!);
  const cloudRef = useRef<THREE.Mesh>(null!);
  const haloRef = useRef<THREE.Sprite>(null!);
  const phase = useMemo(() => Math.random() * Math.PI * 2, []);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const sunTmp = useMemo(() => new THREE.Vector3(), []);
  const surface = useMemo(() => makeSurfaceTexture(def), [def]);
  const ringTex = useMemo(
    () => (def.ring ? makeRingTexture(def.name, def.ring.color) : null),
    [def],
  );
  const ringGeo = useMemo(
    () => (def.ring ? makeRingGeometry(def.ring.inner, def.ring.outer, 256) : null),
    [def],
  );

  const atmoUniforms = useMemo(() => {
    const a = ATMO_PRESETS[def.name] ?? {
      ray: def.atmosphere ?? "#88aaff",
      sunset: "#ff9a5a",
      mie: 0.4,
    };
    return {
      uSun: { value: new THREE.Vector3() },
      uRay: { value: new THREE.Color(a.ray) },
      uSunset: { value: new THREE.Color(a.sunset) },
      uMie: { value: a.mie },
    };
  }, [def]);

  const detailUniforms = useMemo(
    () => ({
      uMap: { value: surface },
      uSun: { value: new THREE.Vector3() },
      uTime: { value: 0 },
      uNear: { value: 0 },
      uGas: { value: GAS_GIANTS.has(def.name) ? 1 : 0 },
      uSeed: { value: (hashSeed(def.name) % 1000) / 37 },
      uPlanetId: { value: PLANET_ID_MAP[def.name] ?? 0 },
      uTint: { value: new THREE.Color(def.color) },
      uStorm: {
        value: new THREE.Color(
          def.name === "Jupiter" ? "#c2441c" : def.name === "Neptune" ? "#0d1f5c" : def.color,
        ),
      },
    }),
    [def, surface],
  );

  const earthCloudUniforms = useMemo(
    () => ({
      uSun: { value: new THREE.Vector3() },
      uTime: { value: 0 },
    }),
    [],
  );

  const ringUniforms = useMemo(
    () =>
      def.ring && ringTex
        ? {
            uRingTex: { value: ringTex },
            uColor: { value: new THREE.Color("#ffffff") },
            uSun: { value: new THREE.Vector3() },
            uPlanetCenter: { value: new THREE.Vector3() },
            uPlanetRadius: { value: def.size },
          }
        : null,
    [def, ringTex],
  );

  const scaleMode = useStore((s) => s.scaleMode);
  const planetVisibilityMagnification = useStore((s) => s.planetVisibilityMagnification);
  const effectiveA = getPlanetEffectiveA(def, scaleMode);
  const effectiveSize = getPlanetEffectiveSize(def, scaleMode) * planetVisibilityMagnification;
  const sizeRatio = effectiveSize / def.size;

  useEffect(() => {
    if (!window.__exoSizes) window.__exoSizes = new Map();
    window.__exoSizes.set(def.name, effectiveSize);
  }, [def.name, effectiveSize]);

  useFrame(({ clock, camera }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;
    const jd = getSimulationJd();
    const auScale = scaleMode === "true_scale" ? scaleManager.getRenderAU("true_scale") : AU;

    // NASA JPL Horizons DE440 state vector
    let p: THREE.Vector3;
    try {
      const state = jplEphemerisManager.getPlanetState(def.name, jd);
      p = new THREE.Vector3(state.xAu * auScale, state.zAu * auScale, state.yAu * auScale);
    } catch {
      p = keplerPosition(def, phase, t, effectiveA);
    }
    groupRef.current.position.copy(p);

    if (bodyRef.current) {
      const rot = REAL_ORBITS[def.name];
      bodyRef.current.rotation.y = rot
        ? ((simTimeDays() * 24) / rot.rotH) * Math.PI * 2
        : (t / def.spinPeriod) * Math.PI * 2;
    }
    if (cloudRef.current) {
      cloudRef.current.rotation.y =
        (bodyRef.current?.rotation.y ?? 0) * 1.06 + t * 0.018;
    }

    groupRef.current.getWorldPosition(tmp);
    // The Sun sits at the SolarSystem group's origin.
    if (groupRef.current.parent) groupRef.current.parent.getWorldPosition(sunTmp);
    atmoUniforms.uSun.value.copy(sunTmp);
    detailUniforms.uSun.value.copy(sunTmp);
    detailUniforms.uTime.value = t;
    earthCloudUniforms.uSun.value.copy(sunTmp);
    earthCloudUniforms.uTime.value = t;
    if (ringUniforms) {
      ringUniforms.uSun.value.copy(sunTmp);
      ringUniforms.uPlanetCenter.value.copy(tmp);
      ringUniforms.uPlanetRadius.value = effectiveSize;
    }

    const camD = camera.position.distanceTo(tmp);
    // Detail fades in smoothly as the camera approaches the planet.
    detailUniforms.uNear.value = 1 - Math.min(1, Math.max(0, (camD / effectiveSize - 8) / 80));
    // The distant marker sprite must not wash the planet out up close:
    // it only fades in once the disk itself is too small to resolve.
    if (haloRef.current) {
      const d = camD;
      const k = Math.min(1, Math.max(0, d / (effectiveSize * 1200) - 1));
      const mat = haloRef.current.material as THREE.SpriteMaterial;
      mat.opacity = 0.65 * k;
      haloRef.current.visible = k > 0.01;
    }
    const reg = getRegistry();
    let v = reg.get(def.name);
    if (!v) {
      v = new THREE.Vector3();
      reg.set(def.name, v);
    }
    v.copy(tmp);
  }, -1);

  const setVisit = useStore((s) => s.setVisitPlanet);
  const haloTex = useMemo(() => makeHaloTexture(def.color), [def.color]);

  return (
    <group ref={groupRef}>
      {/* halo sprite — only a far-away locator dot; hidden once the planet is resolvable */}
      <sprite
        ref={haloRef}
        visible={false}
        scale={[Math.max(effectiveSize * 22, 0.05), Math.max(effectiveSize * 22, 0.05), 1]}
      >
        <spriteMaterial
          map={haloTex}
          color={def.color}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
      {/* tilt + body */}
      <group rotation={[0, 0, def.tilt]} scale={[sizeRatio, sizeRatio, sizeRatio]}>
        <mesh
          ref={bodyRef}
          castShadow
          receiveShadow
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            document.body.style.cursor = "";
          }}
          onClick={(e) => {
            e.stopPropagation();
            setVisit(def.name);
          }}
        >
          <sphereGeometry args={[def.size, 72, 54]} />
          <shaderMaterial
            vertexShader={DETAIL_VERT}
            fragmentShader={DETAIL_FRAG}
            uniforms={detailUniforms}
            depthWrite
            depthTest
          />
        </mesh>

        {/* Earth's independent 3D animated cloud & cyclone deck */}
        {def.name === "Earth" && (
          <mesh ref={cloudRef} scale={1.012} renderOrder={1}>
            <sphereGeometry args={[def.size, 64, 48]} />
            <shaderMaterial
              vertexShader={EARTH_CLOUDS_VERT}
              fragmentShader={EARTH_CLOUDS_FRAG}
              uniforms={earthCloudUniforms}
              transparent
              depthWrite={false}
            />
          </mesh>
        )}

        {/* Physically-motivated atmosphere: Rayleigh-blue day limb, warm
            terminator, Mie forward scattering — all driven by the live Sun direction. */}
        {def.atmosphere && (
          <mesh scale={1.042} renderOrder={2}>
            <sphereGeometry args={[def.size, 56, 40]} />
            <shaderMaterial
              vertexShader={ATMO_VERT}
              fragmentShader={ATMO_FRAG}
              uniforms={atmoUniforms}
              transparent
              depthWrite={false}
              side={THREE.FrontSide}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        )}

        {/* Physically shaded 3D ring system with real-time planet shadow casting */}
        {def.ring && ringGeo && ringUniforms && (
          <mesh geometry={ringGeo} rotation={[Math.PI / 2, 0, 0]} receiveShadow renderOrder={2}>
            <shaderMaterial
              vertexShader={RING_VERT}
              fragmentShader={RING_FRAG}
              uniforms={ringUniforms}
              side={THREE.DoubleSide}
              transparent
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
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
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
  const W = 2048,
    H = 1024;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  const rand = rng(hashSeed(def.name));
  const base = new THREE.Color(def.color);

  ctx.fillStyle = `#${base.getHexString()}`;
  ctx.fillRect(0, 0, W, H);

  const shade = (l: number) => {
    const col = base.clone();
    const hsl = { h: 0, s: 0, l: 0 };
    col.getHSL(hsl);
    col.setHSL(hsl.h, hsl.s, Math.min(0.96, Math.max(0.03, hsl.l * l)));
    return `#${col.getHexString()}`;
  };

  if (GAS_GIANTS.has(def.name)) {
    if (def.name === "Jupiter") {
      // Authentic Jovian zones (creamy ammonia ice) and belts (reddish-brown ammonium hydrosulfide)
      const bandPalette = [
        { y: 0.0, h: 0.12, col: "#9e886c" }, // North Polar Region
        { y: 0.12, h: 0.07, col: "#dfd1b8" }, // N. Temperate Zone
        { y: 0.19, h: 0.05, col: "#b5744a" }, // N. Temperate Belt
        { y: 0.24, h: 0.08, col: "#eee3ce" }, // N. Tropical Zone
        { y: 0.32, h: 0.11, col: "#9c5230" }, // North Equatorial Belt (NEB)
        { y: 0.43, h: 0.14, col: "#f2e7d3" }, // Equatorial Zone (EZ) with ochre festoons
        { y: 0.57, h: 0.12, col: "#a85834" }, // South Equatorial Belt (SEB)
        { y: 0.69, h: 0.09, col: "#efe4d0" }, // South Tropical Zone (hosts GRS)
        { y: 0.78, h: 0.07, col: "#a17858" }, // South Temperate Belt
        { y: 0.85, h: 0.15, col: "#8f7d65" }, // South Polar Region
      ];
      for (const b of bandPalette) {
        const g = ctx.createLinearGradient(0, b.y * H, 0, (b.y + b.h) * H);
        g.addColorStop(0, b.col);
        g.addColorStop(0.5, b.col);
        g.addColorStop(1, shade(0.9));
        ctx.fillStyle = g;
        ctx.fillRect(0, b.y * H, W, b.h * H + 4);
      }
    } else if (def.name === "Saturn") {
      // Butterscotch-gold zonal bands with north polar darkenings
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0.0, "#7a6e54");
      grad.addColorStop(0.12, "#b89f72");
      grad.addColorStop(0.28, "#dec28b");
      grad.addColorStop(0.45, "#f4dfb2");
      grad.addColorStop(0.55, "#f5e2b8");
      grad.addColorStop(0.72, "#d8bc84");
      grad.addColorStop(0.88, "#b59a6b");
      grad.addColorStop(1.0, "#7d6f52");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    } else if (def.name === "Uranus") {
      // Smooth cyan-aquamarine methane bands with bright polar collar
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0.0, "#b8edf2");
      grad.addColorStop(0.2, "#9de0e8");
      grad.addColorStop(0.5, "#88d0dc");
      grad.addColorStop(0.8, "#a6e6ee");
      grad.addColorStop(1.0, "#c8f4f8");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    } else if (def.name === "Neptune") {
      // Deep cobalt-azure methane bands
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0.0, "#1c3b94");
      grad.addColorStop(0.25, "#2b56c8");
      grad.addColorStop(0.5, "#3e73f6");
      grad.addColorStop(0.72, "#244bb8");
      grad.addColorStop(1.0, "#162f7a");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    }

    // Latitudinal cloud bands with turbulent Kelvin-Helmholtz wave edges
    let y = 0;
    while (y < H) {
      const h = 10 + rand() * 36;
      const l = 0.78 + rand() * 0.48;
      ctx.fillStyle = shade(l);
      ctx.globalAlpha = def.name === "Uranus" ? 0.14 : 0.35 + rand() * 0.28;
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= W; x += 32) {
        ctx.lineTo(x, y + Math.sin(x * 0.008 + rand() * 0.5) * (def.name === "Jupiter" ? 6 : 3));
      }
      ctx.lineTo(W, y + h);
      ctx.lineTo(0, y + h);
      ctx.closePath();
      ctx.fill();
      y += h;
    }
    ctx.globalAlpha = 1;

    // Fine turbulent chevron wave streaks inside bands
    ctx.globalAlpha = def.name === "Uranus" ? 0.08 : 0.24;
    for (let i = 0; i < 480; i++) {
      const sy = rand() * H;
      const w = 60 + rand() * 260;
      const sx = rand() * W;
      ctx.strokeStyle = shade(rand() > 0.5 ? 1.32 : 0.72);
      ctx.lineWidth = 1.2 + rand() * 3.0;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      for (let s = 0; s <= 10; s++) {
        ctx.lineTo(sx + (w * s) / 10, sy + Math.sin(s * 1.6 + rand()) * (3 + rand() * 6));
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    if (def.name === "Jupiter") {
      // Great Red Spot + White Ovals (Oval BA) + NEB blue-gray festoons
      const grsX = W * 0.62,
        grsY = H * 0.68;
      const g = ctx.createRadialGradient(grsX, grsY, 4, grsX, grsY, 95);
      g.addColorStop(0.0, "#d94e28");
      g.addColorStop(0.45, "#b83818");
      g.addColorStop(0.75, "#e89c72");
      g.addColorStop(1.0, "rgba(0,0,0,0)");
      ctx.save();
      ctx.translate(grsX, grsY);
      ctx.scale(1.65, 0.9);
      ctx.translate(-grsX, -grsY);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(grsX, grsY, 95, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // White anticyclonic ovals in South Temperate Belt
      for (let i = 0; i < 8; i++) {
        const ox = (i / 8) * W + rand() * 90;
        const oy = H * (0.76 + (rand() - 0.5) * 0.06);
        const rx = 18 + rand() * 24;
        const og = ctx.createRadialGradient(ox, oy, 2, ox, oy, rx);
        og.addColorStop(0, "#fbf5ea");
        og.addColorStop(0.7, "#dccbb2");
        og.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = og;
        ctx.beginPath();
        ctx.ellipse(ox, oy, rx * 1.4, rx * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (def.name === "Neptune") {
      // High-altitude white methane-ice cirrus streaks
      ctx.globalAlpha = 0.75;
      for (let i = 0; i < 28; i++) {
        const cx = rand() * W;
        const cy = H * (0.2 + rand() * 0.6);
        const cw = 50 + rand() * 160;
        ctx.strokeStyle = "rgba(235, 248, 255, 0.85)";
        ctx.lineWidth = 2 + rand() * 3.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.quadraticCurveTo(cx + cw * 0.5, cy - 6 + rand() * 12, cx + cw, cy);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
  } else if (def.name === "Earth") {
    // Deep ocean bathymetry base
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, H);
    oceanGrad.addColorStop(0.0, "#102e5e");
    oceanGrad.addColorStop(0.25, "#0d3b7a");
    oceanGrad.addColorStop(0.5, "#124c96");
    oceanGrad.addColorStop(0.75, "#0d3b7a");
    oceanGrad.addColorStop(1.0, "#102e5e");
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, W, H);

    // Continental landmasses with realistic macro-geography (Americas, Eurasia, Africa, Australia)
    const continents = [
      // North America
      { x: 0.21, y: 0.28, rx: 0.09, ry: 0.13, rot: -0.35, biome: "#2d6a36" },
      { x: 0.18, y: 0.34, rx: 0.05, ry: 0.08, rot: 0.2, biome: "#8c6d42" },
      // South America
      { x: 0.31, y: 0.64, rx: 0.055, ry: 0.15, rot: -0.18, biome: "#23632b" },
      { x: 0.29, y: 0.66, rx: 0.02, ry: 0.14, rot: -0.15, biome: "#6e5536" }, // Andes
      // Africa & Sahara
      { x: 0.54, y: 0.44, rx: 0.075, ry: 0.08, rot: 0.05, biome: "#c79e58" }, // Sahara
      { x: 0.56, y: 0.60, rx: 0.06, ry: 0.13, rot: 0.1, biome: "#326e34" }, // Central/South Africa
      // Eurasia + Arabian + Tibetan Plateau
      { x: 0.53, y: 0.25, rx: 0.07, ry: 0.07, rot: -0.1, biome: "#3b753c" }, // Europe
      { x: 0.63, y: 0.39, rx: 0.045, ry: 0.05, rot: 0.3, biome: "#c29650" }, // Arabia
      { x: 0.72, y: 0.24, rx: 0.16, ry: 0.11, rot: 0.05, biome: "#366938" }, // Siberia/Asia
      { x: 0.74, y: 0.36, rx: 0.08, ry: 0.06, rot: -0.1, biome: "#8f7246" }, // Central Asia/Tibet
      { x: 0.78, y: 0.42, rx: 0.06, ry: 0.07, rot: 0.2, biome: "#2c6b32" }, // SE Asia
      // Australia
      { x: 0.84, y: 0.71, rx: 0.055, ry: 0.05, rot: -0.1, biome: "#b56938" },
      // Greenland
      { x: 0.36, y: 0.12, rx: 0.04, ry: 0.045, rot: -0.2, biome: "#e8eff5" },
    ];

    for (const cDef of continents) {
      const cx = cDef.x * W;
      const cy = cDef.y * H;
      const rx = cDef.rx * W;
      const ry = cDef.ry * H;
      // Turquoise continental shelf
      ctx.fillStyle = "rgba(28, 126, 172, 0.38)";
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx * 1.18, ry * 1.18, cDef.rot, 0, Math.PI * 2);
      ctx.fill();

      // Irregular multi-lobe landmass
      for (let k = 0; k < 28; k++) {
        const ang = (k / 28) * Math.PI * 2;
        const jitter = 0.45 + rand() * 0.65;
        const lx = cx + Math.cos(ang) * rx * jitter * 0.7;
        const ly = cy + Math.sin(ang) * ry * jitter * 0.7;
        ctx.fillStyle = cDef.biome;
        ctx.beginPath();
        ctx.ellipse(
          lx,
          ly,
          rx * (0.28 + rand() * 0.38),
          ry * (0.28 + rand() * 0.38),
          rand() * Math.PI,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
    }

    // Polar ice caps (Arctic & Antarctica)
    ctx.fillStyle = "#f2f7fc";
    ctx.fillRect(0, 0, W, 38);
    ctx.fillRect(0, H - 56, W, 56);
    for (let x = 0; x < W; x += 28) {
      ctx.beginPath();
      ctx.arc(x, 38, 18 + rand() * 18, 0, Math.PI * 2);
      ctx.arc(x, H - 56, 22 + rand() * 24, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (def.name === "Mars") {
    // Rusty iron-oxide southern highlands + darker northern lowlands (Vastitas Borealis)
    const mGrad = ctx.createLinearGradient(0, 0, 0, H);
    mGrad.addColorStop(0.0, "#a85228");
    mGrad.addColorStop(0.32, "#b55624");
    mGrad.addColorStop(0.55, "#c9531c");
    mGrad.addColorStop(0.85, "#a33f14");
    mGrad.addColorStop(1.0, "#8c3814");
    ctx.fillStyle = mGrad;
    ctx.fillRect(0, 0, W, H);

    // Dark basaltic albedo features (Syrtis Major, Acidalia Planitia, Mare Erythraeum)
    for (let i = 0; i < 65; i++) {
      const x = rand() * W;
      const y = H * (0.2 + rand() * 0.65);
      const r = 40 + rand() * 160;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, "rgba(72, 32, 18, 0.55)");
      g.addColorStop(1, "rgba(72, 32, 18, 0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(x, y, r * 1.4, r * 0.75, rand() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }

    // Valles Marineris giant equatorial canyon system
    ctx.strokeStyle = "#4d1a08";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(W * 0.36, H * 0.53);
    ctx.bezierCurveTo(W * 0.43, H * 0.55, W * 0.51, H * 0.52, W * 0.58, H * 0.54);
    ctx.stroke();

    // Olympus Mons & Tharsis Montes volcanic shield edifices
    const volcanoes = [
      { x: 0.24, y: 0.40, r: 42 }, // Olympus Mons
      { x: 0.30, y: 0.46, r: 26 }, // Ascraeus Mons
      { x: 0.29, y: 0.51, r: 25 }, // Pavonis Mons
      { x: 0.28, y: 0.56, r: 27 }, // Arsia Mons
    ];
    for (const v of volcanoes) {
      const vx = v.x * W,
        vy = v.y * H;
      const vg = ctx.createRadialGradient(vx, vy, 2, vx, vy, v.r);
      vg.addColorStop(0, "#59220e");
      vg.addColorStop(0.25, "#e08452");
      vg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = vg;
      ctx.beginPath();
      ctx.arc(vx, vy, v.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // North & South CO2/H2O Polar Ice Caps
    ctx.fillStyle = "rgba(248, 250, 255, 0.88)";
    ctx.fillRect(0, 0, W, 24);
    ctx.fillRect(0, H - 20, W, 20);
  } else if (def.name === "Pluto") {
    // Pluto: Bright nitrogen-ice heart (Tombaugh Regio / Sputnik Planitia) + dark crimson Cthulhu Macula
    for (let i = 0; i < 160; i++) {
      const x = rand() * W,
        y = rand() * H,
        r = 25 + rand() * 120;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, shade(0.65 + rand() * 0.7));
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    // Dark crimson-brown equatorial tholin band (Cthulhu Macula)
    const cthulhu = ctx.createRadialGradient(W * 0.32, H * 0.56, 20, W * 0.32, H * 0.56, W * 0.24);
    cthulhu.addColorStop(0, "#4a1e14");
    cthulhu.addColorStop(0.6, "#663020");
    cthulhu.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = cthulhu;
    ctx.fillRect(0, 0, W, H);

    // Bright creamy-white Heart (Tombaugh Regio / Sputnik Planitia)
    const heart = ctx.createRadialGradient(W * 0.58, H * 0.48, 10, W * 0.58, H * 0.48, W * 0.16);
    heart.addColorStop(0, "#faf3e8");
    heart.addColorStop(0.65, "#eadbc6");
    heart.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = heart;
    ctx.beginPath();
    ctx.ellipse(W * 0.58, H * 0.48, W * 0.14, H * 0.22, -0.2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Mercury & Venus base
    for (let i = 0; i < 280; i++) {
      const x = rand() * W,
        y = rand() * H;
      const r = 16 + rand() * 120;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, shade(0.62 + rand() * 0.78));
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    if (def.name === "Venus") {
      // Thick sulfuric-acid cloud deck with dark UV-absorber planetary Y/V chevron waves
      ctx.globalAlpha = 0.42;
      for (let i = 0; i < 200; i++) {
        const y = rand() * H;
        ctx.strokeStyle = shade(0.78 + rand() * 0.45);
        ctx.lineWidth = 3 + rand() * 10;
        const x = rand() * W;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.bezierCurveTo(
          x + 120,
          y - 18 + rand() * 36,
          x + 260,
          y - 18 + rand() * 36,
          x + 420,
          y,
        );
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
  }

  // Impact craters for Mercury, Mars, Pluto
  if (!GAS_GIANTS.has(def.name) && def.name !== "Earth" && def.name !== "Venus") {
    ctx.globalAlpha = def.name === "Mercury" ? 0.48 : 0.28;
    const craters = def.name === "Mercury" ? 900 : 280;
    for (let i = 0; i < craters; i++) {
      const x = rand() * W,
        y = rand() * H,
        r = 2 + rand() * (def.name === "Mercury" ? 22 : 14);
      ctx.strokeStyle = shade(1.42);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = shade(0.68);
      ctx.beginPath();
      ctx.arc(x, y, r * 0.86, 0, Math.PI * 2);
      ctx.fill();
      // Bright ejecta rays on largest craters (Mercury)
      if (def.name === "Mercury" && r > 15) {
        ctx.strokeStyle = "rgba(240, 232, 218, 0.22)";
        for (let k = 0; k < 12; k++) {
          const ang = (k / 12) * Math.PI * 2 + rand() * 0.3;
          ctx.beginPath();
          ctx.moveTo(x + Math.cos(ang) * r, y + Math.sin(ang) * r);
          ctx.lineTo(x + Math.cos(ang) * r * 3.4, y + Math.sin(ang) * r * 3.4);
          ctx.stroke();
        }
      }
    }
  }

  ctx.globalAlpha = 1;
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 16;
  t.needsUpdate = true;
  return t;
}

// Ring texture: radial bands of varying brightness/opacity with real gaps
// (D, C, B, Cassini Division, A, Encke Gap, Keeler Gap, F ring for Saturn;
//  13 narrow dark rings for Uranus; Adams/Le Verrier arcs for Neptune).
function makeRingTexture(name: string, color: string): THREE.Texture {
  const W = 2048,
    H = 16;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  const rand = rng(hashSeed(name + "ring"));
  const base = new THREE.Color(color);
  ctx.clearRect(0, 0, W, H);
  for (let x = 0; x < W; x++) {
    const u = x / W;
    let a =
      0.52 +
      0.28 * Math.sin(u * 120 + rand() * 0.08) +
      0.14 * Math.cos(u * 340) +
      rand() * 0.08;
    // soft inner/outer falloff
    a *= Math.min(1, u * 12) * Math.min(1, (1 - u) * 10);
    let col = base.clone();

    if (name === "Saturn") {
      if (u < 0.08) {
        a *= 0.14; // faint D ring
      } else if (u < 0.24) {
        a *= 0.38; // translucent C (Crepe) ring
        col.multiplyScalar(0.78);
      } else if (u < 0.56) {
        a = Math.min(0.98, a * 1.38); // dense, brilliant B ring
        col.lerp(new THREE.Color("#fff3d6"), 0.35);
      } else if (u >= 0.56 && u < 0.625) {
        a *= 0.04; // Cassini Division (4,800 km gap)
      } else if (u >= 0.625 && u < 0.91) {
        a *= 0.92; // A ring
        if (u > 0.82 && u < 0.84) a *= 0.08; // Encke Gap
        if (u > 0.895 && u < 0.903) a *= 0.12; // Keeler Gap
      } else if (u >= 0.91 && u < 0.945) {
        a *= 0.02; // Roche Division
      } else if (u >= 0.945 && u < 0.965) {
        a = 0.78; // narrow braided F ring
      } else {
        a *= 0.05;
      }
    } else if (name === "Uranus") {
      // 9+ narrow, sharp rings separated by wide transparent gaps
      const ringPositions = [0.12, 0.21, 0.28, 0.36, 0.44, 0.52, 0.63, 0.74, 0.88];
      let ringSignal = 0.03;
      for (let r = 0; r < ringPositions.length; r++) {
        const width = r === 8 ? 0.028 : 0.012; // bright outer Epsilon ring is widest
        const d = Math.abs(u - ringPositions[r]);
        if (d < width) {
          ringSignal = Math.max(ringSignal, (1 - d / width) * (r === 8 ? 0.85 : 0.48));
        }
      }
      a = ringSignal;
    } else if (name === "Neptune") {
      // Galle, Le Verrier, Lassell, Arago, and Adams ring arcs
      const arcs = [0.18, 0.44, 0.62, 0.86];
      let sig = 0.04;
      for (const p of arcs) {
        const d = Math.abs(u - p);
        if (d < 0.025) sig = Math.max(sig, (1 - d / 0.025) * 0.52);
      }
      a = sig;
    } else if (name === "Jupiter") {
      // Gossamer & main dusty ring
      a *= 0.32 * Math.sin(u * Math.PI);
    }

    const l = 0.82 + 0.34 * rand();
    col.multiplyScalar(l);
    ctx.fillStyle = `rgba(${Math.round(Math.min(1, col.r) * 255)},${Math.round(Math.min(1, col.g) * 255)},${Math.round(Math.min(1, col.b) * 255)},${Math.min(1, Math.max(0, a))})`;
    ctx.fillRect(x, 0, 1, H);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 16;
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
    const ca = Math.cos(a),
      sa = Math.sin(a);
    pos.push(ca * inner, sa * inner, 0);
    uv.push(0, i / segments);
    pos.push(ca * outer, sa * outer, 0);
    uv.push(1, i / segments);
  }
  for (let i = 0; i < segments; i++) {
    const a = i * 2,
      b = a + 1,
      c2 = a + 2,
      d = a + 3;
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

// --- Photorealistic 3D Moon Textures, Irregular Asteroid Geometry & Shaders ---
const MAJOR_ROUND_MOONS = new Set([
  "Moon",
  "Io",
  "Europa",
  "Ganymede",
  "Callisto",
  "Mimas",
  "Enceladus",
  "Tethys",
  "Dione",
  "Rhea",
  "Titan",
  "Iapetus",
  "Miranda",
  "Ariel",
  "Umbriel",
  "Titania",
  "Oberon",
  "Triton",
  "Charon",
]);

const MOON_STYLE_MAP: Record<string, number> = {
  Moon: 1, // Lunar maria + ray craters
  Io: 2, // Sulfur plains + glowing volcanic calderas on night side
  Europa: 3, // Specular ice + reddish-brown linea tectonic cracks
  Ganymede: 4, // Bifurcated dark Galileo Regio + bright grooved sulci
  Callisto: 5, // Dark carbonaceous ice + bright Valhalla concentric impact rings
  Titan: 6, // Dense orange nitrogen/methane haze + dark polar lakes
  Enceladus: 7, // Brilliant white ice + South Polar blue Tiger Stripes
  Iapetus: 8, // Yin-yang dark Cassini Regio leading hemisphere + white trailing side
  Triton: 9, // Cantaloupe terrain + pinkish nitrogen cap + dark geyser streaks
  Charon: 10, // Gray water-ice + reddish-brown Mordor Macula north polar hood
  Mimas: 11, // Giant Herschel impact basin
  Miranda: 12, // Extreme tectonic coronae & Verona Rupes cliffs
};

const MOON_VERT = /* glsl */ `
#include <common>
#include <logdepthbuf_pars_vertex>
uniform float uIrregular;
uniform float uSeed;
varying vec3 vP;
varying vec3 vN;
varying vec3 vW;
varying vec2 vUv;

float h3(vec3 p){ return fract(sin(dot(p, vec3(127.1,311.7,74.7))) * 43758.5453); }
float n3(vec3 p){
  vec3 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z);
}

void main(){
  vUv = uv;
  vec3 dir = normalize(position);
  vP = dir;
  vec3 pos = position;
  vec3 norm = normal;

  // Small captured / non-hydrostatic moons (Phobos, Deimos, Amalthea, Hyperion, etc.)
  // are sculpted into realistic triaxial potato/asteroid silhouettes with giant crater cavities.
  if (uIrregular > 0.5) {
    vec3 stretch = vec3(1.26, 0.82, 0.94);
    float lobe = n3(dir * 2.2 + uSeed) * 0.24 + n3(dir * 5.4 - uSeed) * 0.10;
    // Stickney / giant impact concavity on one side
    float stickney = smoothstep(0.55, 0.92, dot(dir, normalize(vec3(0.75, 0.25, 0.6)))) * 0.22;
    float disp = 0.86 + lobe - stickney;
    pos = pos * stretch * disp;
    norm = normalize(normal / stretch + dir * (lobe - stickney));
  }

  vec4 w = modelMatrix * vec4(pos, 1.0);
  vW = w.xyz;
  vN = normalize(mat3(modelMatrix) * norm);
  gl_Position = projectionMatrix * viewMatrix * w;
  #include <logdepthbuf_vertex>
}`;

const MOON_FRAG = /* glsl */ `
#include <logdepthbuf_pars_fragment>
uniform sampler2D uMap;
uniform vec3 uSun;
uniform float uTime;
uniform float uSeed;
uniform float uStyle;
uniform float uIrregular;
varying vec3 vP;
varying vec3 vN;
varying vec3 vW;
varying vec2 vUv;

float h3(vec3 p){ return fract(sin(dot(p, vec3(127.1,311.7,74.7))) * 43758.5453); }
float n3(vec3 p){
  vec3 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z);
}
float fbm(vec3 p){ float s=0.0,a=0.5; for(int i=0;i<4;i++){ s+=a*n3(p); p*=2.05; a*=0.5; } return s; }

void main(){
  #include <logdepthbuf_fragment>
  vec3 N = normalize(vN);
  vec3 V = normalize(cameraPosition - vW);
  vec3 L = normalize(uSun - vW);
  vec3 H = normalize(L + V);
  float nl = dot(N, L);
  float day = smoothstep(-0.10, 0.14, nl);

  // Micro-relief normal perturbation
  float eps = 0.02;
  float h0 = fbm(vP * 22.0 + uSeed);
  float hx = fbm((vP + vec3(eps, 0.0, 0.0)) * 22.0 + uSeed);
  float hy = fbm((vP + vec3(0.0, eps, 0.0)) * 22.0 + uSeed);
  vec3 bumpN = normalize(N + vec3(h0 - hx, h0 - hy, 0.0) * (uStyle == 6.0 ? 0.05 : 0.55));
  float lit = clamp(dot(bumpN, L) * 0.90 + 0.12, 0.0, 1.0) * day + 0.035;

  vec3 col = texture2D(uMap, vUv).rgb;
  vec3 glow = vec3(0.0);

  if (abs(uStyle - 2.0) < 0.1) {
    // IO: Glowing incandescent molten silicate lava calderas (Loki Patera, Pele) on night side
    float caldera = smoothstep(0.73, 0.83, fbm(vP * 9.5 + uSeed));
    float nightGlow = smoothstep(0.15, -0.25, nl);
    glow = vec3(1.0, 0.32, 0.04) * caldera * (0.35 + 1.15 * nightGlow) * (0.85 + 0.15 * sin(uTime * 2.4 + uSeed));
  } else if (abs(uStyle - 3.0) < 0.1 || abs(uStyle - 7.0) < 0.1) {
    // EUROPA & ENCELADUS: Specular icy Fresnel reflection + subsurface scattering feel
    float iceSpec = pow(max(dot(bumpN, H), 0.0), 42.0) * day * 0.38;
    col += vec3(0.85, 0.95, 1.0) * iceSpec;
    if (abs(uStyle - 7.0) < 0.1 && vP.y < -0.62) {
      // Enceladus South Polar Tiger Stripes warm cryovolcanic fissures
      float stripe = smoothstep(0.46, 0.52, abs(sin((vP.x + vP.z) * 28.0)));
      col = mix(col, vec3(0.38, 0.76, 0.98), stripe * 0.65);
    }
  } else if (abs(uStyle - 8.0) < 0.1) {
    // IAPETUS: Yin-yang dark leading hemisphere (Cassini Regio) vs bright trailing ice
    float cassiniMask = smoothstep(-0.25, 0.35, vP.x + 0.18 * (h0 - 0.5));
    col = mix(vec3(0.12, 0.09, 0.07), vec3(0.90, 0.88, 0.84), cassiniMask);
  } else if (abs(uStyle - 10.0) < 0.1) {
    // CHARON: Reddish-brown tholin north polar hood (Mordor Macula)
    float mordor = smoothstep(0.58, 0.78, vP.y + 0.12 * (h0 - 0.5));
    col = mix(col, vec3(0.48, 0.22, 0.15), mordor * 0.78);
  }

  if (uIrregular > 0.5) {
    // Parallel grooves (Phobos) & sponge-like deep pits (Hyperion)
    float grooves = 0.90 + 0.10 * sin((vP.x + vP.y) * 65.0 + h0 * 6.0);
    col *= grooves;
  }

  gl_FragColor = vec4(col * lit + glow, 1.0);
}`;

const MOON_TEX_CACHE = new Map<string, THREE.Texture>();

function makeMoonSurfaceTexture(name: string, parent: string, color: string): THREE.Texture {
  const key = `${parent}:${name}`;
  const cached = MOON_TEX_CACHE.get(key);
  if (cached) return cached;

  const W = 512,
    H = 256;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  const rand = rng(hashSeed(key));
  const base = new THREE.Color(color);

  ctx.fillStyle = `#${base.getHexString()}`;
  ctx.fillRect(0, 0, W, H);

  const shade = (l: number) => {
    const col = base.clone().multiplyScalar(l);
    return `rgb(${Math.min(255, Math.round(col.r * 255))},${Math.min(255, Math.round(col.g * 255))},${Math.min(255, Math.round(col.b * 255))})`;
  };

  // Base mottled geology
  for (let i = 0; i < 95; i++) {
    const x = rand() * W,
      y = rand() * H,
      r = 12 + rand() * 55;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, shade(0.68 + rand() * 0.65));
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  if (name === "Moon") {
    // Dark basaltic lunar Maria (Imbrium, Serenitatis, Tranquillitatis, Procellarum)
    for (let i = 0; i < 16; i++) {
      const mx = W * (0.18 + rand() * 0.64);
      const my = H * (0.22 + rand() * 0.52);
      const mr = 24 + rand() * 52;
      const mg = ctx.createRadialGradient(mx, my, 4, mx, my, mr);
      mg.addColorStop(0, "rgba(72, 74, 80, 0.78)");
      mg.addColorStop(0.7, "rgba(88, 90, 96, 0.45)");
      mg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = mg;
      ctx.beginPath();
      ctx.arc(mx, my, mr, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (name === "Io") {
    // Volcanic sulfur patches (yellow, orange, red, white frost) + dark calderas
    const ioColors = ["#f5df4d", "#e87a24", "#b83214", "#faf6e8", "#2b1d14"];
    for (let i = 0; i < 70; i++) {
      const x = rand() * W,
        y = rand() * H,
        r = 6 + rand() * 36;
      const colChoice = ioColors[Math.floor(rand() * ioColors.length)];
      const g = ctx.createRadialGradient(x, y, 1, x, y, r);
      g.addColorStop(0, colChoice);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (name === "Europa") {
    // Intersecting reddish-brown tectonic linea cracks across bright water-ice
    ctx.strokeStyle = "rgba(156, 86, 52, 0.58)";
    for (let i = 0; i < 55; i++) {
      ctx.lineWidth = 0.8 + rand() * 2.2;
      ctx.beginPath();
      const x0 = rand() * W,
        y0 = rand() * H;
      ctx.moveTo(x0, y0);
      ctx.bezierCurveTo(
        x0 + (rand() - 0.5) * 180,
        y0 + (rand() - 0.5) * 90,
        x0 + (rand() - 0.5) * 260,
        y0 + (rand() - 0.5) * 120,
        x0 + (rand() - 0.5) * 340,
        y0 + (rand() - 0.5) * 140,
      );
      ctx.stroke();
    }
  } else if (name === "Ganymede") {
    // Dark ancient Galileo Regio vs bright grooved Uruk Sulcus bands
    for (let i = 0; i < 12; i++) {
      ctx.fillStyle = i % 2 === 0 ? "rgba(75, 65, 54, 0.55)" : "rgba(215, 206, 192, 0.55)";
      ctx.beginPath();
      ctx.ellipse(rand() * W, rand() * H, 45 + rand() * 75, 25 + rand() * 40, rand() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (name === "Callisto") {
    // Bright white multi-ring impact scars (Valhalla & Asgard)
    for (let i = 0; i < 120; i++) {
      ctx.fillStyle = "rgba(235, 232, 225, 0.65)";
      ctx.beginPath();
      ctx.arc(rand() * W, rand() * H, 1 + rand() * 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
    const vx = W * 0.42,
      vy = H * 0.46;
    ctx.strokeStyle = "rgba(225, 220, 210, 0.42)";
    for (let r = 8; r <= 48; r += 7) {
      ctx.beginPath();
      ctx.arc(vx, vy, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else if (name === "Titan") {
    // Golden photochemical haze bands + dark polar hydrocarbon mare (Kraken Mare)
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#9c7032");
    g.addColorStop(0.5, "#e0ac58");
    g.addColorStop(1, "#b8863c");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(42, 32, 20, 0.48)";
    ctx.fillRect(0, H * 0.45, W, H * 0.12);
  } else if (name === "Mimas") {
    // Giant Herschel Crater
    const hx = W * 0.55,
      hy = H * 0.48,
      hr = 36;
    ctx.fillStyle = shade(0.62);
    ctx.beginPath();
    ctx.arc(hx, hy, hr, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = shade(1.35);
    ctx.lineWidth = 3.5;
    ctx.stroke();
    ctx.fillStyle = shade(1.4);
    ctx.beginPath();
    ctx.arc(hx, hy, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  // Craters for airless moons
  if (name !== "Titan" && name !== "Io" && name !== "Europa") {
    ctx.globalAlpha = 0.38;
    for (let i = 0; i < 140; i++) {
      const x = rand() * W,
        y = rand() * H,
        r = 1.5 + rand() * 10;
      ctx.strokeStyle = shade(1.35);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = shade(0.68);
      ctx.beginPath();
      ctx.arc(x, y, r * 0.82, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  MOON_TEX_CACHE.set(key, tex);
  return tex;
}

const TRAIL_SAMPLES = new Map<string, number[]>();
const trailSamples = () => TRAIL_SAMPLES;
function getTrailSamples(key: string) {
  let s = TRAIL_SAMPLES.get(key);
  if (!s) {
    s = [];
    TRAIL_SAMPLES.set(key, s);
  }
  return s;
}

function Moon({ moon, parent }: { moon: MoonDef; parent: string }) {
  const ref = useRef<THREE.Group>(null!);
  const bodyRef = useRef<THREE.Mesh>(null!);
  const phase = useMemo(() => seedAngle(parent + moon.name), [parent, moon.name]);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const sunTmp = useMemo(() => new THREE.Vector3(), []);
  const mag = useStore((s) => s.planetVisibilityMagnification);
  const setVisit = useStore((s) => s.setVisitPlanet);
  const mKey = moonKey(parent, moon.name);

  const surface = useMemo(
    () => makeMoonSurfaceTexture(moon.name, parent, moon.color),
    [moon.name, parent, moon.color],
  );
  const isIrregular = !MAJOR_ROUND_MOONS.has(moon.name);

  const moonUniforms = useMemo(
    () => ({
      uMap: { value: surface },
      uSun: { value: new THREE.Vector3() },
      uTime: { value: 0 },
      uSeed: { value: (hashSeed(mKey) % 1000) / 29 },
      uStyle: { value: MOON_STYLE_MAP[moon.name] ?? 0 },
      uIrregular: { value: isIrregular ? 1.0 : 0.0 },
    }),
    [surface, mKey, moon.name, isIrregular],
  );

  const titanAtmoUniforms = useMemo(
    () =>
      moon.name === "Titan"
        ? {
            uSun: { value: new THREE.Vector3() },
            uRay: { value: new THREE.Color("#5da8ff") },
            uSunset: { value: new THREE.Color("#f0943a") },
            uMie: { value: 0.75 },
          }
        : null,
    [moon.name],
  );

  useEffect(() => {
    if (!window.__exoSizes) window.__exoSizes = new Map();
    window.__exoSizes.set(mKey, moon.size * mag);
  }, [mKey, moon.size, mag]);

  const prev = useRef<{ days: number; parent: THREE.Vector3 } | null>(null);
  const local = useMemo(() => new THREE.Vector3(), []);
  const parentPos = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    const phys = JPL_PLANETS_PHYSICAL[parent]?.moons.find((m) => m.name === moon.name);
    const inc = phys ? (phys.inclinationDeg * Math.PI) / 180 : (moon.inclination ?? 0);
    const days = phys ? phys.orbitalPeriodDays : MOON_DAYS[moon.name];

    const angleAt = (simD: number) => {
      if (phys) {
        const sign = days < 0 ? -1 : 1; // retrograde support (e.g. Triton)
        return phase + sign * (simD / Math.abs(days)) * Math.PI * 2;
      }
      return days
        ? (MOON_L0[moon.name] !== undefined ? deg(MOON_L0[moon.name]) : phase) +
            (simD / days) * Math.PI * 2
        : phase + (t / moon.period) * Math.PI * 2;
    };

    const setLocal = (out: THREE.Vector3, a: number) =>
      out.set(
        Math.cos(a) * moon.distance,
        Math.sin(a) * moon.distance * Math.sin(inc),
        Math.sin(a) * moon.distance * Math.cos(inc),
      );

    const nowD = simTimeDays();
    const angNow = angleAt(nowD);
    setLocal(ref.current.position, angNow);

    // Tidally locked synchronous rotation (faces parent planet) or chaotic spin for Hyperion
    if (bodyRef.current) {
      bodyRef.current.rotation.y =
        moon.name === "Hyperion" ? t * 0.9 : -angNow + Math.PI * 0.5;
    }

    ref.current.getWorldPosition(tmp);
    const solarSys = ref.current.parent?.parent?.parent;
    if (solarSys) solarSys.getWorldPosition(sunTmp);
    moonUniforms.uSun.value.copy(sunTmp);
    moonUniforms.uTime.value = t;
    if (titanAtmoUniforms) titanAtmoUniforms.uSun.value.copy(sunTmp);

    const reg = getRegistry();
    let v = reg.get(mKey);
    if (!v) {
      v = new THREE.Vector3();
      reg.set(mKey, v);
    }
    v.copy(tmp);

    // Fast moons sweep tens of degrees per frame; sub-sample the true orbit
    // between frames so the trail is a smooth curve instead of a zig-zag.
    const par = ref.current.parent;
    if (!par) return;
    par.getWorldPosition(parentPos);
    const p0 = prev.current;
    const samples = getTrailSamples(mKey);
    if (p0 && days) {
      const dA = Math.abs(((nowD - p0.days) / days) * Math.PI * 2);
      const n = Math.min(64, Math.max(1, Math.ceil(dA / deg(3.5))));
      for (let k = 1; k <= n; k++) {
        const f = k / n;
        setLocal(local, angleAt(p0.days + (nowD - p0.days) * f));
        local.applyMatrix4(par.matrixWorld);
        local.x += (p0.parent.x - parentPos.x) * (1 - f);
        local.y += (p0.parent.y - parentPos.y) * (1 - f);
        local.z += (p0.parent.z - parentPos.z) * (1 - f);
        samples.push(local.x, local.y, local.z);
      }
      if (samples.length > 3 * 8192) samples.splice(0, samples.length - 3 * 8192);
    } else {
      samples.push(tmp.x, tmp.y, tmp.z);
    }
    if (!prev.current) prev.current = { days: nowD, parent: parentPos.clone() };
    else {
      prev.current.days = nowD;
      prev.current.parent.copy(parentPos);
    }
  });

  return (
    <group ref={ref} scale={[mag, mag, mag]}>
      <mesh
        ref={bodyRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "";
        }}
        onClick={(e) => {
          e.stopPropagation();
          setVisit(mKey);
        }}
      >
        <sphereGeometry args={[moon.size, 48, 36]} />
        <shaderMaterial
          vertexShader={MOON_VERT}
          fragmentShader={MOON_FRAG}
          uniforms={moonUniforms}
          depthWrite
          depthTest
        />
      </mesh>
      {/* Titan's detached blue-violet UV upper atmospheric haze layer */}
      {titanAtmoUniforms && (
        <mesh scale={1.065} renderOrder={1}>
          <sphereGeometry args={[moon.size, 36, 28]} />
          <shaderMaterial
            vertexShader={ATMO_VERT}
            fragmentShader={ATMO_FRAG}
            uniforms={titanAtmoUniforms}
            transparent
            depthWrite={false}
            side={THREE.FrontSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
      {/* Enceladus South Polar Cryovolcanic Geyser Plume */}
      {moon.name === "Enceladus" && (
        <mesh position={[0, -moon.size * 1.45, 0]} rotation={[Math.PI, 0, 0]} renderOrder={1}>
          <coneGeometry args={[moon.size * 0.42, moon.size * 1.2, 24, 1, true]} />
          <meshBasicMaterial
            color="#bce6ff"
            transparent
            opacity={0.32}
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
    </group>
  );
}

export function Planets() {
  useFrame((_, dt) => tickSim(dt), -2);
  const scaleMode = useStore((s) => s.scaleMode);
  const showOrbits = useStore((s) => s.showOrbits);

  const orbits = useMemo(
    () =>
      PLANETS.map((p) => {
        const effA = getPlanetEffectiveA(p, scaleMode);
        return makeOrbitLine(p, "#6a8cff", 0.12, effA);
      }),
    [scaleMode],
  );

  // Tilt the entire planetary + belt system so its orbital-plane normal
  // aligns with the Sun's galactic drift direction.
  const quat = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), SUN_DRIFT_DIR.clone().normalize());
    return q;
  }, []);

  return (
    <group quaternion={quat}>
      {showOrbits && orbits.map((o, i) => <primitive key={`orbit-${i}`} object={o} />)}
      {PLANETS.map((p) => (
        <Planet key={p.name} def={p} />
      ))}
      <SolarSystemOverlays />
      <MinorBodies />
    </group>
  );
}

// Asteroid belt (2.2–3.3 AU) + Kuiper belt (30–50 AU) as particle rings.
// Each particle orbits the Sun on its own Keplerian period (T ∝ r^1.5),
// so the belts shear differentially like the real thing.
const BELT_K = 31.5; // Kepler: P = a^1.5 years, in sim-clock units (31.5 per year)

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
      col[i * 3] = cAst.r;
      col[i * 3 + 1] = cAst.g;
      col[i * 3 + 2] = cAst.b;
      sizes[i] = (1.4 + Math.random() * 1.6) * P;
    }
    for (let j = 0; j < KUIPER; j++) {
      const i = ASTEROIDS + j;
      setOrbit(i, 30 + Math.random() * 20, (Math.random() - 0.5) * 2.0 * AU);
      col[i * 3] = cKui.r;
      col[i * 3 + 1] = cKui.g;
      col[i * 3 + 2] = cKui.b;
      sizes[i] = (1.2 + Math.random() * 1.4) * P;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    g.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    return { geom: g, radii, thetas, heights, omegas };
  }, []);

  const pointsRef = useRef<THREE.Points>(null!);
  const beltTick = useRef(0);
  useFrame(({ clock }) => {
    const liveDist =
      (window as unknown as { __liveCameraDistance?: number }).__liveCameraDistance ??
      useStore.getState().cameraDistance;
    // Beyond 25 ly, the entire Kuiper Belt (< 2.5 ly radius) is sub-pixel;
    // skip CPU buffer rewrites and GPU uploads while zoomed out to stars/galaxies.
    if (pointsRef.current) {
      pointsRef.current.visible = liveDist <= 25;
    }
    if (liveDist > 25) return;
    // Rewriting tens of thousands of belt positions every frame is pure CPU
    // cost for motion the eye can't resolve; every 3rd frame looks identical.
    if (beltTick.current++ % 3 !== 0) return;
    void clock;
    const t = simTimeYears() * 31.5;
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
    <points ref={pointsRef} geometry={geom} frustumCulled={false}>
      <pointsMaterial
        vertexColors
        size={0.18 * P}
        sizeAttenuation
        transparent
        opacity={0.85}
        depthWrite={false}
      />
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
  const dist = useRef(0);
  const showGalacticDrift = useStore((s) => s.showGalacticDrift);

  useFrame((_, dt) => {
    if (!ref.current) return;
    if (showGalacticDrift) {
      const factor = useStore.getState().systemSpeed / 50;
      dist.current += Math.min(dt, 0.1) * SUN_DRIFT_SPEED * factor;
      const d = dist.current;
      ref.current.position.set(SUN_DRIFT_DIR.x * d, SUN_DRIFT_DIR.y * d, SUN_DRIFT_DIR.z * d);
    } else {
      ref.current.position.set(0, 0, 0);
    }
    // Commit the parent's new transform before planets publish their world
    // positions; otherwise close-up tracking follows the previous frame.
    ref.current.updateMatrixWorld(true);
    ref.current.getWorldPosition(tmp);
    const reg = getRegistry();
    let v = reg.get("Sun");
    if (!v) {
      v = new THREE.Vector3();
      reg.set("Sun", v);
    }
    v.copy(tmp);
  }, -2);
  return <group ref={ref}>{children}</group>;
}

// ---------------------------------------------------------------
// MotionTrails — ring-buffer polylines that record the live
// world-space position of the Sun + each planet and fade with age,
// so the actual path (helix relative to the galaxy) is visible.
// ---------------------------------------------------------------

const TRAIL_LEN = 3000;
// Longer moon trails so their fast orbital loops around each moving planet
// trace extended, graceful 3D helices along the planet's trajectory.
const MOON_TRAIL_LEN = 3600;

type TrailBody = { name: string; color: THREE.Color; length?: number; opacity?: number };

function useTrail(body: TrailBody) {
  const lineRef = useRef<THREE.Line>(null!);
  const initialized = useRef(false);
  const head = useRef(0);
  const len = body.length ?? TRAIL_LEN;

  const { geometry, material } = useMemo(() => {
    const positions = new Float32Array(len * 3);
    const idx = new Float32Array(len);
    for (let i = 0; i < len; i++) idx[i] = i;
    const geo = new THREE.BufferGeometry();
    const posAttr = new THREE.BufferAttribute(positions, 3);
    posAttr.setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute("position", posAttr);
    geo.setAttribute("aIndex", new THREE.BufferAttribute(idx, 1));
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: body.color },
        uOpacity: { value: body.opacity ?? 1 },
        uHead: { value: 0 },
        uLen: { value: len },
      },
      vertexShader: /* glsl */ `
        #include <common>
        #include <logdepthbuf_pars_vertex>
        attribute float aIndex;
        uniform float uHead;
        uniform float uLen;
        varying float vAge;
        void main(){
          // Ring buffer: age is distance behind the write head.
          float age = mod(uHead - aIndex + uLen, uLen) / (uLen - 1.0);
          vAge = age;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mv;
          // Collapse the oldest vertex so the wrap-around segment vanishes.
          if (age > 0.995) gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
          #include <logdepthbuf_vertex>
        }
      `,
      fragmentShader: /* glsl */ `
        #include <logdepthbuf_pars_fragment>
        uniform vec3 uColor;
        uniform float uOpacity;
        varying float vAge;
        void main(){
          #include <logdepthbuf_fragment>
          float a = pow(1.0 - vAge, 1.25) * uOpacity;
          if (a < 0.008) discard;
          gl_FragColor = vec4(uColor, a);
        }
      `,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });
    return { geometry: geo, material: mat };
  }, [body.color, len, body.opacity]);

  const tick = useRef(0);
  useFrame(() => {
    const liveDist =
      (window as unknown as { __liveCameraDistance?: number }).__liveCameraDistance ??
      useStore.getState().cameraDistance;
    // Skip GPU buffer uploads for Solar System trails when zoomed out to galactic scales (> 25 ly)
    if (liveDist > 25) {
      const queued = trailSamples().get(body.name);
      if (queued) queued.length = 0;
      return;
    }

    const attr = geometry.getAttribute("position") as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    // Moons publish sub-sampled orbit points; consume them all every frame.
    const queued = trailSamples().get(body.name);
    if (queued) {
      if (queued.length === 0) return;
      let start = 0;
      if (!initialized.current) {
        for (let i = 0; i < len; i++) {
          arr[i * 3] = queued[0];
          arr[i * 3 + 1] = queued[1];
          arr[i * 3 + 2] = queued[2];
        }
        initialized.current = true;
        start = 3;
      }
      const from = Math.max(start, queued.length - len * 3);
      for (let j = from; j < queued.length; j += 3) {
        head.current = (head.current + 1) % len;
        const h = head.current * 3;
        arr[h] = queued[j];
        arr[h + 1] = queued[j + 1];
        arr[h + 2] = queued[j + 2];
      }
      queued.length = 0;
      const anyAttr = attr as unknown as { clearUpdateRanges?: () => void };
      anyAttr.clearUpdateRanges?.();
      attr.needsUpdate = true;
      material.uniforms.uHead.value = head.current;
      return;
    }
    // Trails advance on every other frame: same visual path, half the
    // per-frame work across ~30 tracked bodies.
    if (tick.current++ % 2 !== 0) return;
    const reg = (window as Window).__planetPositions;
    const p = reg?.get(body.name);
    if (!p) return;
    if (!initialized.current) {
      for (let i = 0; i < len; i++) {
        arr[i * 3] = p.x;
        arr[i * 3 + 1] = p.y;
        arr[i * 3 + 2] = p.z;
      }
      initialized.current = true;
      attr.needsUpdate = true;
    } else {
      // Ring buffer: write one slot instead of shifting the whole array,
      // and upload only that slot to the GPU.
      head.current = (head.current + 1) % len;
      const h = head.current;
      arr[h * 3] = p.x;
      arr[h * 3 + 1] = p.y;
      arr[h * 3 + 2] = p.z;
      const anyAttr = attr as unknown as {
        addUpdateRange?: (start: number, count: number) => void;
        clearUpdateRanges?: () => void;
        updateRange?: { offset: number; count: number };
      };
      if (anyAttr.addUpdateRange && anyAttr.clearUpdateRanges) {
        anyAttr.clearUpdateRanges();
        anyAttr.addUpdateRange(h * 3, 3);
      } else if (anyAttr.updateRange) {
        anyAttr.updateRange.offset = h * 3;
        anyAttr.updateRange.count = 3;
      }
      attr.needsUpdate = true;
    }
    material.uniforms.uHead.value = head.current;
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
  // Trail length is user-adjustable (0–100 slider → 0.1×–2× the default).
  const trailSize = useStore((s) => s.trailSize);
  const scale = 0.1 + (trailSize / 100) * 1.9;
  const bodies = useMemo<TrailBody[]>(
    () => [
      {
        name: "Sun",
        color: new THREE.Color("#ffcf80"),
        length: Math.max(2, Math.round(TRAIL_LEN * scale)),
      },
      ...PLANETS.map((p) => ({
        name: p.name,
        color: new THREE.Color(p.color),
        length: Math.max(2, Math.round(TRAIL_LEN * scale)),
      })),
      // Moons: extended helical trails so their fast orbital loops around each
      // moving planet remain clearly visible for a longer span.
      ...PLANETS.flatMap((p) =>
        (p.moons ?? []).map((m) => ({
          name: moonKey(p.name, m.name),
          color: new THREE.Color(m.color),
          length: Math.max(2, Math.round(MOON_TRAIL_LEN * scale)),
          opacity: 0.72,
        })),
      ),
    ],
    [scale],
  );
  return (
    <group>
      {bodies.map((b) => (
        <Trail key={`${b.name}-${b.length}`} body={b} />
      ))}
    </group>
  );
}

// (Removed legacy GalacticRotation wrapper — real motion now comes
//  from SolarSystem drift + MilkyWay differential rotation shader.)
