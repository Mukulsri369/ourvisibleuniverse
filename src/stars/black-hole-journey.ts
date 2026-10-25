import { create } from "zustand";
export type DescentMode = "idle" | "falling" | "paused" | "crossed" | "returning";
/** Continuous camera values stay outside React/Zustand notifications. */
export const descentMotion = {
  elapsed: 0,
  returnElapsed: 0,
  startRadius: 0,
  returnStartRadius: 0,
  radiusRs: 26,
  progress: 0,
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
    set({ id: null, mode: "idle" });
  },
}));
/** Time-compressed radial camera path. It ends at the horizon; no invented interior. */
export function descentRadiusRs(startRs: number, progress: number) {
  const p = Math.max(0, Math.min(1, progress));
  // Smooth start, increasing inward speed in logarithmic radius.
  const eased = p * p * (3 - 2 * p);
  return Math.exp(Math.log(Math.max(startRs, 8)) * (1 - eased) + Math.log(0.985) * eased);
}
