import { create } from "zustand";
import { useStore } from "./store";
import { NEBULA_ROUTES } from "./nebula-journey-profiles";
export const nebulaMotion = { progress: 0, reveal: 0 };
type Mode = "idle" | "flying" | "paused" | "inside" | "returning";
let previousHidden = false;
export const useNebulaJourney = create<{
  id: string | null;
  mode: Mode;
  duration: number;
  start: (id: string) => void;
  pause: () => void;
  resume: () => void;
  back: () => void;
  reset: () => void;
}>((set, get) => ({
  id: null,
  mode: "idle",
  duration: 48,
  start: (id) => {
    if (!NEBULA_ROUTES[id] || get().mode !== "idle") return;
    previousHidden = useStore.getState().uiHidden;
    nebulaMotion.progress = nebulaMotion.reveal = 0;
    useStore.setState({
      cameraFree: false,
      uiHidden: true,
      flyTo: null,
      tourActive: false,
      isAutoOrbiting: false,
    });
    set({
      id,
      mode: "flying",
      duration:
        typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches
          ? 64
          : 48,
    });
  },
  pause: () => {
    if (get().mode === "flying") set({ mode: "paused" });
  },
  resume: () => {
    if (get().mode === "paused") set({ mode: "flying" });
  },
  back: () => {
    if (get().mode !== "idle") {
      useStore.setState({ cameraFree: false, uiHidden: true });
      set({ mode: "returning" });
    }
  },
  reset: () => {
    if (get().mode !== "idle") useStore.setState({ uiHidden: previousHidden });
    nebulaMotion.progress = nebulaMotion.reveal = 0;
    set({ id: null, mode: "idle" });
  },
}));
