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
const DEFAULT_OUTER_ORBIT_SPEEDS: Readonly<Record<string, number>> = Object.freeze({
  Jupiter: 3.63,
  Saturn: 4.9,
  Uranus: 10.96,
  Neptune: 12.88,
  Pluto: 15.49,
});
export const defaultPlanetOrbitSpeeds = () =>
  Object.fromEntries(
    SOLAR_ORBIT_NAMES.map((name) => [name, DEFAULT_OUTER_ORBIT_SPEEDS[name] ?? 1]),
  );
export function clampPlanetOrbitSpeed(value: number) {
  return Number.isFinite(value) ? Math.max(0, Math.min(2000, value)) : 1;
}
