export const SOLAR_ORBIT_NAMES = [
  "Mercury",
  "Venus",
  "Earth",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune",
  "Pluto",
] as const;
export const OUTER_ORBIT_NAMES = SOLAR_ORBIT_NAMES.slice(4);
export const defaultPlanetOrbitSpeeds = () =>
  Object.fromEntries(SOLAR_ORBIT_NAMES.map((name) => [name, 1]));
export function clampPlanetOrbitSpeed(value: number) {
  return Number.isFinite(value) ? Math.max(0, Math.min(2000, value)) : 1;
}
