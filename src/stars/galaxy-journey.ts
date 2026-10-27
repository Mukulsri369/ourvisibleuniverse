import { create } from "zustand";
import { useStore, type VisitGalaxy } from "./store";
export const galaxyMotion = { progress: 0, reveal: 0 };
let previousHidden = false;
export const useGalaxyJourney = create<{
  galaxy: VisitGalaxy | null;
  mode: "idle" | "flying" | "paused" | "inside" | "returning";
  duration: number;
  enter: (g: VisitGalaxy) => void;
  pause: () => void;
  resume: () => void;
  exit: () => void;
  reset: () => void;
}>((set, get) => ({
  galaxy: null,
  mode: "idle",
  duration: 44,
  enter: (g) => {
    if (get().mode !== "idle") return;
    previousHidden = useStore.getState().uiHidden;
    galaxyMotion.progress = galaxyMotion.reveal = 0;
    const subsystems = useStore.getState().subsystems;
    useStore.setState({
      subsystems: {
        ...subsystems,
        detailedGalaxies: true,
        milkyWay: g.name === "Milky Way" ? true : subsystems.milkyWay,
        andromeda: g.name === "Andromeda (M31)" ? true : subsystems.andromeda,
      },
      cameraFree: false,
      uiHidden: true,
      navigationSettingsOpen: false,
      flyTo: null,
      tourActive: false,
      isAutoOrbiting: false,
    });
    set({
      galaxy: { ...g, view: "overview", focus: undefined },
      mode: "flying",
      duration:
        typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches
          ? 60
          : 44,
    });
  },
  pause: () => {
    if (get().mode === "flying") set({ mode: "paused" });
  },
  resume: () => {
    if (get().mode === "paused") set({ mode: "flying" });
  },
  exit: () => {
    const g = get().galaxy;
    if (!g) return;
    useStore.setState({
      visitGalaxy: g,
      selectedStar: null,
      selectedObjectId: null,
      visitPlanet: null,
      exoVisit: null,
      cameraFree: false,
      flyTo: null,
      uiHidden: true,
    });
    set({ mode: "returning" });
  },
  reset: () => {
    if (get().mode !== "idle") useStore.setState({ uiHidden: previousHidden });
    galaxyMotion.progress = galaxyMotion.reveal = 0;
    set({ galaxy: null, mode: "idle" });
  },
}));
export function galaxyOverviewFloor(g: { size: number }) {
  return Math.max(g.size * 0.72, 2000);
}
