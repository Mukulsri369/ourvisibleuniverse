import { create } from "zustand";
export const BLACK_HOLE_DESCENT_SECONDS = 52;
export type DescentMode = "idle" | "falling" | "paused" | "crossed" | "returning";
/** Continuous camera values stay outside React/Zustand notifications. */
export const descentMotion = {
  elapsed: 0,
  returnElapsed: 0,
  startRadius: 0,
  returnStartRadius: 0,
  radiusRs: 26,
  progress: 0,
  orbitAngle: 0,
  angularSpeed: 0,
  tidalStretch: 0,
};
export const useBlackHoleJourney = create<{
  id: string | null;
  mode: DescentMode;
  begin: (id: string) => void;
  pause: () => void;
  resume: () => void;
  returnToOrbit: () => void;
  reset: () => void;
}>((set) => ({
  id: null,
  mode: "idle",
  begin: (id) => {
    descentMotion.elapsed = 0;
    descentMotion.startRadius = 0;
    descentMotion.progress = 0;
    descentMotion.orbitAngle = descentMotion.angularSpeed = descentMotion.tidalStretch = 0;
    set({ id, mode: "falling" });
  },
  pause: () => set({ mode: "paused" }),
  resume: () => set({ mode: "falling" }),
  returnToOrbit: () => {
    descentMotion.returnElapsed = 0;
    descentMotion.returnStartRadius = 0;
    set({ mode: "returning" });
  },
  reset: () => {
    descentMotion.elapsed = 0;
    descentMotion.startRadius = 0;
    descentMotion.progress = 0;
    descentMotion.orbitAngle = descentMotion.angularSpeed = descentMotion.tidalStretch = 0;
    set({ id: null, mode: "idle" });
  },
}));
const smooth = (x: number) => {
  const p = Math.max(0, Math.min(1, x));
  return p * p * (3 - 2 * p);
};
const logMix = (a: number, b: number, t: number) => a * Math.exp(Math.log(b / a) * t);
/** Cinematic approach -> disk inspiral -> plunge -> horizon fade. */
export function descentRadiusRs(startRs: number, progress: number, outerRs = 19, innerRs = 3) {
  const p = Math.max(0, Math.min(1, progress)),
    start = Math.max(startRs, 1.08);
  const entry = Math.min(start, Math.max(4, outerRs * 0.85));
  const plunge = Math.min(entry, Math.max(1.12, innerRs * 0.98));
  if (p < 0.3) return logMix(start, entry, smooth(p / 0.3));
  if (p < 0.78) return logMix(entry, plunge, smooth((p - 0.3) / 0.48));
  if (p < 0.94) return logMix(plunge, 1.005, smooth((p - 0.78) / 0.16));
  return logMix(1.005, 0.985, smooth((p - 0.94) / 0.06));
}
/** Analytic phase freezes exactly when paused and never depends on frame rate. */
export function descentFlightState(
  startRs: number,
  progress: number,
  elevation: number,
  outerRs = 19,
  innerRs = 3,
) {
  const p = Math.max(0, Math.min(1, progress));
  const radiusRs = descentRadiusRs(startRs, p, outerRs, innerRs);
  const turns = 0.18 * p + 0.82 * p * p + 1.8 * Math.pow(p, 5);
  const angularSpeed =
    (Math.PI * 2 * (0.18 + 1.64 * p + 9 * Math.pow(p, 4))) / BLACK_HOLE_DESCENT_SECONDS;
  const plane = Math.sign(elevation || 1) * 0.085;
  const tidalStretch = smooth((3.5 - radiusRs) / 2.5) * smooth((p - 0.7) / 0.22);
  return {
    radiusRs,
    angle: turns * Math.PI * 2,
    angularSpeed,
    elevation: elevation + (plane - elevation) * smooth(p / 0.48),
    tidalStretch,
    bank: Math.sin(p * Math.PI) * Math.min(0.07, angularSpeed * 0.065),
  };
}
