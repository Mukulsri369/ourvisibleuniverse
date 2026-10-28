import type { VisitGalaxy } from "./store";
import { create } from "zustand";
export type ExploreTarget = {
  id: string;
  name: string;
  host: string | null;
  kind: "solar" | "star" | "planet" | "exo" | "object" | "host" | "region" | "galaxy" | "space";
  galaxy?: VisitGalaxy;
  starName?: string;
  position?: [number, number, number];
  local?: [number, number, number];
  distance?: number;
};
type Phase = "outside" | "entering" | "inside" | "exiting";
export const useExploration = create<{
  phase: Phase;
  galaxy: string | null;
  pending: ExploreTarget | null;
  queued: ExploreTarget | null;
  mapOpen: boolean;
  destinationName: string | null;
}>(() => ({
  phase: "outside",
  galaxy: null,
  pending: null,
  queued: null,
  mapOpen: true,
  destinationName: null,
}));
export function mayVisit(host: string | null) {
  const s = useExploration.getState();
  return host === null ? s.phase === "outside" : s.phase === "inside" && s.galaxy === host;
}
/** Returns true when a galaxy entry/exit is required; never teleports across galaxies. */
export function requireGalaxy(target: ExploreTarget) {
  const s = useExploration.getState();
  if (mayVisit(target.host)) {
    if (s.destinationName !== target.name)
      useExploration.setState({ destinationName: target.name });
    return false;
  }
  if (s.phase === "entering" || s.phase === "exiting") return true;
  if (s.pending?.id !== target.id || s.pending?.host !== target.host)
    useExploration.setState({ pending: target, mapOpen: true });
  return true;
}
export function galaxyContentsLoaded(name: string) {
  const s = useExploration.getState();
  return s.galaxy === name && (s.phase === "entering" || s.phase === "inside");
}
