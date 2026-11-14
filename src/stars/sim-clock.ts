/**
 * High-Precision Astronomical Simulation Clock
 *
 * Implements:
 * 1. Exact Julian Date (JD, TDB/UTC) relative to J2000.0 (JD 2451545.0).
 * 2. User-selected astronomical dates (historical & future exploration).
 * 3. Pause / Play / Step controls and variable simulation speeds.
 * 4. Backward-compatible simTimeYears(), simTimeDays(), and backgroundFocus().
 */

import { SOLAR_ORBIT_NAMES } from "./planet-orbit-controls";
import { useStore } from "./store";
import { useExploration } from "./exploration-scope";
import { useGalaxyJourney } from "./galaxy-journey";
import { SIM_SECONDS_PER_REAL_SECOND } from "./scene-controls";

/** The Solar System runs on its own clock (store.systemSpeed); every other object runs at real
 * time unless its own rate is set in store.objectTimeRates. */
export const SOLAR_TIME_KEY = "Solar System";
export const NORMAL_TIME_RATE = 1 / SIM_SECONDS_PER_REAL_SECOND;

const J2000_JD = 2451545.0;
const J2000_MS = Date.UTC(2000, 0, 1, 12, 0, 0);
const MS_PER_DAY = 86_400_000;
const DAYS_PER_JULIAN_YEAR = 365.25;

// Initial state: today's real date
let currentJd = J2000_JD + (Date.now() - J2000_MS) / MS_PER_DAY;
let isPaused = false;
let timeMultiplier = 1.0; // 1.0 = nominal standard speed
let focus = 1.0;
let motionSeconds = 0;
let motionStep = 0;
let frameStep = 0;
let normalSeconds = 0;
// Accumulated difference from real time of each object with its own rate, so a rate change never
// jumps the object's phase.
const objectOffsets = new Map<string, number>();
const planetOrbitalJd: Record<string, number> = Object.fromEntries(
  SOLAR_ORBIT_NAMES.map((name) => [name, currentJd]),
);
let galacticYears = (currentJd - J2000_JD) / DAYS_PER_JULIAN_YEAR;
export const getGalacticTimeYears = () => galacticYears;
export const getGalacticTimeScale = () => useStore.getState().galacticTravelSpeed;
/** Optional Galactic-only time compression; changing rate never jumps position. */
export function setGalacticTimeScale(value: number) {
  useStore.getState().setGalacticTravelSpeed(value);
}

/** Independent elapsed orbital time, integrated continuously so changing speed never jumps phase. */
export const getPlanetSimulationJd = (name: string) => planetOrbitalJd[name] ?? currentJd;
const objectRate = (key: string) => useStore.getState().objectTimeRates[key] ?? NORMAL_TIME_RATE;
/** Motion time of an object (its key: catalogue id, star, galaxy name); Solar System by default. */
export const motionTimeSeconds = (key = SOLAR_TIME_KEY) =>
  key === SOLAR_TIME_KEY ? motionSeconds : normalSeconds + (objectOffsets.get(key) ?? 0);
export const motionDeltaSeconds = (key = SOLAR_TIME_KEY) =>
  key === SOLAR_TIME_KEY ? motionStep : frameStep * objectRate(key);

/** Whose time the Time control sets: the most specific current selection, else the Solar System. */
export function timeTargetKey(): string {
  const st = useStore.getState();
  const galaxy = useExploration.getState().galaxy;
  if (st.exoVisit) return st.exoVisit.star.name;
  // Planets of systems hosted by other galaxies share their galaxy's time.
  if (st.visitPlanet) return galaxy && galaxy !== "Milky Way" ? galaxy : SOLAR_TIME_KEY;
  if (st.selectedObjectId) return st.selectedObjectId;
  if (st.selectedStar)
    return st.selectedStar.name === "Sun" ? SOLAR_TIME_KEY : st.selectedStar.name;
  const visited = useGalaxyJourney.getState().galaxy?.name ?? st.visitGalaxy?.name;
  if (visited) return visited;
  return galaxy && galaxy !== "Milky Way" ? galaxy : SOLAR_TIME_KEY;
}

/**
 * Sets the simulation date directly from a JavaScript Date or ISO string or JD.
 */
export function setSimulationDate(target: Date | string | number) {
  if (typeof target === "number") {
    // If > 2400000 assume Julian Date, else treat as timestamp ms
    if (target > 2_000_000) {
      currentJd = target;
    } else {
      currentJd = J2000_JD + (target - J2000_MS) / MS_PER_DAY;
    }
  } else {
    const d = typeof target === "string" ? new Date(target) : target;
    currentJd = J2000_JD + (d.getTime() - J2000_MS) / MS_PER_DAY;
  }
  galacticYears = (currentJd - J2000_JD) / DAYS_PER_JULIAN_YEAR;
  for (const name of SOLAR_ORBIT_NAMES) planetOrbitalJd[name] = currentJd;
}

/**
 * Steps the simulation by a fixed number of solar days (positive or negative).
 */
export function stepSimulationDays(days: number) {
  currentJd += days;
  for (const name of SOLAR_ORBIT_NAMES) planetOrbitalJd[name] += days;
  galacticYears = Math.min(5e8, Math.max(-5e8, galacticYears + days / DAYS_PER_JULIAN_YEAR));
}

export function setSimPaused(paused: boolean) {
  isPaused = paused;
}

export function toggleSimPaused(): boolean {
  isPaused = !isPaused;
  return isPaused;
}

export function getSimPaused(): boolean {
  return isPaused;
}

export function setTimeMultiplier(mult: number) {
  timeMultiplier = mult;
}

export function getTimeMultiplier(): number {
  return timeMultiplier;
}

/**
 * Returns current Julian Date (JD).
 */
export function getSimulationJd(): number {
  return currentJd;
}

/**
 * Returns current simulation date as UTC Date object.
 */
export function getSimulationDate(): Date {
  const ms = J2000_MS + (currentJd - J2000_JD) * MS_PER_DAY;
  return new Date(ms);
}

/** Advance once per rendered frame (called from <Planets />). */
export function tickSim(dt: number) {
  const d = Math.min(dt, 0.1);
  const st = useStore.getState();

  motionStep = isPaused ? 0 : d * st.systemSpeed * timeMultiplier;
  frameStep = isPaused ? 0 : d;
  if (!isPaused) {
    normalSeconds += d * NORMAL_TIME_RATE;
    for (const key in st.objectTimeRates)
      objectOffsets.set(
        key,
        (objectOffsets.get(key) ?? 0) + d * (st.objectTimeRates[key] - NORMAL_TIME_RATE),
      );
    // Base speed: systemSpeed=25 -> 1 Earth year per 31.5 s
    // (i.e. ~11.59 days of sim time per real second)
    motionSeconds += motionStep;
    const yearsPerSec = st.systemSpeed / 25.0 / 31.5;
    const simYearsStep = d * yearsPerSec * timeMultiplier;
    const daysStep = simYearsStep * DAYS_PER_JULIAN_YEAR;
    currentJd += daysStep;
    galacticYears = Math.min(
      5e8,
      Math.max(-5e8, galacticYears + simYearsStep * st.galacticTravelSpeed),
    );
    for (const name of SOLAR_ORBIT_NAMES)
      planetOrbitalJd[name] += daysStep * (st.planetOrbitSpeeds[name] ?? 1);
  }

  // Background stars/galaxy fade while visiting a planet, moon or exoplanet.
  const target = st.visitPlanet && !st.cameraFree ? 0.12 : 1;
  focus += (target - focus) * (1 - Math.exp(-1.5 * d));
}

export const simTimeYears = () => (currentJd - J2000_JD) / DAYS_PER_JULIAN_YEAR;
export const simTimeDays = () => currentJd - J2000_JD;
/** 1 = full background, ~0.12 = faded for a planet close-up. */
export const backgroundFocus = () => focus;
