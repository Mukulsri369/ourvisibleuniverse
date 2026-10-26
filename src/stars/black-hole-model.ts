import type { ObservedObject } from "./observed-objects";
export const LY_KM = 9.4607304725808e12;
export const CRITICAL_IMPACT_RS = (3 * Math.sqrt(3)) / 2;
export const MIN_BLACK_HOLE_RS_LY = 1.4e-8;
export function isBlackHoleTarget(item: ObservedObject | undefined): item is ObservedObject {
  return (
    !!item &&
    (item.category === "Black hole" || item.category === "Quasar") &&
    !!item.compactPhysics?.massSolar
  );
}
/** Prograde equatorial Kerr ISCO, in Schwarzschild radii (2GM/c²). */
export function kerrIscoRs(spin: number) {
  const a = Math.max(-0.998, Math.min(0.998, spin));
  const z1 = 1 + Math.cbrt(1 - a * a) * (Math.cbrt(1 + a) + Math.cbrt(1 - a));
  const z2 = Math.sqrt(3 * a * a + z1 * z1);
  return (3 + z2 - Math.sign(a) * Math.sqrt((3 - z1) * (3 + z1 + 2 * z2))) / 2;
}
export function blackHoleModel(item: ObservedObject) {
  const physics = item.compactPhysics;
  const physicalRsLy =
    (physics?.schwarzschildRadiusKm ?? (physics?.massSolar ?? 10) * 2.95325008) / LY_KM;
  // Distant tiny horizons must span many Float64 coordinate increments. HLX-1
  // otherwise moves in whole horizon-sized jumps even with a fast renderer.
  // This affects the documented navigation enlargement, never physical measurements.
  const coordinateFloor = Math.max(1, item.distance) * Number.EPSILON * 4096;
  const radiusLy = Math.max(physicalRsLy, MIN_BLACK_HOLE_RS_LY, coordinateFloor);
  const spin = physics?.spinDimensionless ?? 0.3;
  const dormant = !physics?.hasAccretionDisk;
  const hotFlow = ["sgr-a", "m87star", "hlx1"].includes(item.id);
  return {
    radiusLy,
    physicalRsLy,
    enlargement: radiusLy / physicalRsLy,
    spin,
    dormant,
    hotFlow,
    // The lens uses Schwarzschild geodesics; the emitting inner edge is spin-informed.
    // A full Kerr transfer calculation is deliberately not claimed.
    innerRs: Math.max(1.25, kerrIscoRs(spin)),
    outerRs: hotFlow ? 13 : item.id === "ton618" ? 24 : 19,
    intensity: dormant ? 0 : item.id === "sgr-a" ? 0.7 : item.id === "ton618" ? 1.5 : 1,
    opacity: hotFlow ? 0.42 : 0.88,
  };
}
export const BLACK_HOLE_SOURCES = [
  {
    label: "NASA · black-hole anatomy",
    url: "https://science.nasa.gov/universe/black-holes/anatomy/",
  },
  {
    label: "NASA · orbit and descent visualisation",
    url: "https://science.nasa.gov/universe/black-holes/supermassive-black-holes/new-nasa-black-hole-visualization-takes-viewers-beyond-the-brink/",
  },
  {
    label: "EHT · M87* and Sagittarius A* observations",
    url: "https://www.eso.org/public/images/eso2208-eht-mwd/",
  },
  {
    label: "Gralla, Holz & Wald · shadows and lensing rings",
    url: "https://doi.org/10.1103/PhysRevD.100.024018",
  },
];
