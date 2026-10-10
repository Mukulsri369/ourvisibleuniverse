import { useStore } from "./store";

/**
 * Shared simulation clock for the Solar System, in years since J2000.0.
 * It starts at today's real date, so planets and major moons sit at their
 * actual present positions, then advances at a rate set by the
 * "solar-system speed" setting (25 → one Earth year per 31.5 s).
 * All orbital and spin periods use real values, so speed ratios are exact.
 */
const J2000_MS = Date.UTC(2000, 0, 1, 12, 0, 0);
const MS_PER_YEAR = 365.25 * 86_400_000;

let simYears = (Date.now() - J2000_MS) / MS_PER_YEAR;
let focus = 1;

/** Advance once per rendered frame (called only from <Planets />). */
export function tickSim(dt: number) {
  const d = Math.min(dt, 0.1);
  const st = useStore.getState();
  simYears += d * (st.systemSpeed / 25) / 31.5;
  // Background stars/galaxy fade while visiting a planet, moon or exoplanet.
  const target = st.visitPlanet ? 0.12 : 1;
  focus += (target - focus) * (1 - Math.exp(-1.5 * d));
}

export const simTimeYears = () => simYears;
export const simTimeDays = () => simYears * 365.25;
/** 1 = full background, ~0.12 = faded for a planet close-up. */
export const backgroundFocus = () => focus;
