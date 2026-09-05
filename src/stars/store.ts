import { create } from "zustand";
import type { NamedStar } from "./data";
import { ANDROMEDA_NAME, M31_AU, PA99N2_STAR, PA99N2_WORLD } from "./andromeda-data";
import { GALAXY_BY_NAME, galaxyCenter } from "./galaxy-models";
import { OBJECT_BY_ID, objectPosition, objectVisitDistance } from "./observed-objects";

export type TourStop = {
  name: string;
  caption: string;
  distance: number;
  fov: number;
  duration: number;
};

export const TOUR_STOPS: TourStop[] = [
  { name: "The Sun", caption: "The Sun — Our home star, 4.6 billion years old", distance: 12, fov: 35, duration: 7000 },
  { name: "Our Solar System", caption: "Our Solar System — Eight planets orbit the Sun", distance: 180, fov: 45, duration: 7000 },
  { name: "The Oort Cloud", caption: "The Oort Cloud — Icy bodies marking the edge of the Sun's influence, about 1 light-year away", distance: 900, fov: 55, duration: 7000 },
  { name: "Nearby Stars", caption: "87 Named Stars — The closest stars to our Sun, each one a distant sun of its own", distance: 60, fov: 60, duration: 13000 },
  { name: "Our Stellar Neighborhood", caption: "Our Visible Universe — An accurate map of our stellar neighborhood within the Milky Way", distance: 800, fov: 75, duration: 15000 },
  { name: "The Milky Way", caption: "The Milky Way — Our galaxy contains over 100 billion stars. You are here.", distance: 4500, fov: 85, duration: 10000 },
];

export type VisitGalaxy = {
  name: string;
  x: number;
  y: number;
  z: number;
  size: number;
  distance: number;
  type: string;
  // Optional point of interest inside the galaxy the camera should settle on
  // (e.g. Andromeda focuses the PA-99-N2 planetary system).
  focus?: { x: number; y: number; z: number; distance: number; key?: string };
};

interface State {
  selectedStar: NamedStar | null;
  spectralMode: boolean;
  tourActive: boolean;
  tourStop: number;
  tourCaption: string | null;
  musicOn: boolean;
  cameraDistance: number;
  flyTo: { x: number; y: number; z: number; distance: number } | null;
  visitPlanet: string | null;
  visitGalaxy: VisitGalaxy | null;
  selectedObjectId: string | null;
  uiHidden: boolean;
  cameraFree: boolean;
  zoomSpeed: number;
  systemSpeed: number;
  trailSize: number;
  setSelected: (s: NamedStar | null) => void;
  toggleSpectral: () => void;
  startTour: () => void;
  stopTour: () => void;
  setTourStop: (n: number) => void;
  setTourCaption: (c: string | null) => void;
  toggleMusic: () => void;
  setCameraDistance: (d: number) => void;
  flyToStar: (s: NamedStar) => void;
  clearFly: () => void;
  setVisitPlanet: (name: string | null) => void;
  setVisitGalaxy: (g: VisitGalaxy | null) => void;
  setSelectedObject: (id: string | null) => void;
  toggleUiHidden: () => void;
  toggleCameraFree: () => void;
  setZoomSpeed: (n: number) => void;
  setSystemSpeed: (n: number) => void;
  setTrailSize: (n: number) => void;
}

// Andromeda has a fully modelled star system (PA-99-N2), so visiting it
// flies the camera to that system rather than the galaxy's core.
function withFocus(g: VisitGalaxy): VisitGalaxy {
  if (g.focus) return g;
  if (g.name === ANDROMEDA_NAME) {
    return {
      ...g,
      focus: {
        x: PA99N2_WORLD.x, y: PA99N2_WORLD.y, z: PA99N2_WORLD.z,
        distance: 14 * M31_AU, key: PA99N2_STAR.name,
      },
    };
  }
  const model = GALAXY_BY_NAME.get(g.name);
  if (model?.system) {
    const c = galaxyCenter(model);
    // Aim at the galaxy centre first; the camera then locks onto the live
    // system position published under the host star's name.
    const sysPos = c;
    return {
      ...g,
      focus: {
        x: sysPos.x, y: sysPos.y, z: sysPos.z,
        distance: 16 * model.system.au,
        key: model.system.star.name,
      },
    };
  }
  return g;
}

export const useStore = create<State>((set, get) => ({
  selectedStar: null,
  spectralMode: false,
  tourActive: false,
  tourStop: 0,
  tourCaption: null,
  musicOn: false,
  cameraDistance: 8,
  flyTo: null,
  visitPlanet: null,
  visitGalaxy: null,
  selectedObjectId: null,
  uiHidden: false,
  cameraFree: false,
  zoomSpeed: 50,
  systemSpeed: 50,
  trailSize: 50,
  setSelected: (s) => set({ selectedStar: s, visitGalaxy: null, selectedObjectId: null }),
  toggleSpectral: () => set((st) => ({ spectralMode: !st.spectralMode })),
  startTour: () => set({ tourActive: true, tourStop: 0, selectedStar: null, visitPlanet: null, visitGalaxy: null }),
  stopTour: () => set({ tourActive: false, tourCaption: null }),
  setTourStop: (n) => set({ tourStop: n }),
  setTourCaption: (c) => set({ tourCaption: c }),
  toggleMusic: () => set((st) => ({ musicOn: !st.musicOn })),
  // Called every animation frame by the camera rig. Only commit to the store
  // when the value changes meaningfully (>2%), so React subscribers (HUD,
  // shaders) don't re-render 60 times per second.
  setCameraDistance: (d) => {
    const prev = get().cameraDistance;
    if (prev > 0 && Math.abs(d - prev) / prev < 0.02) return;
    set({ cameraDistance: d });
  },
  flyToStar: (s) => set({ flyTo: { x: s.x, y: s.y, z: s.z, distance: 3.5 }, selectedStar: s, visitPlanet: null, visitGalaxy: null, selectedObjectId: null }),
  clearFly: () => set({ flyTo: null }),
  setVisitPlanet: (name) => set({ visitPlanet: name, selectedStar: null, tourActive: false, visitGalaxy: null, selectedObjectId: null }),
  setVisitGalaxy: (g) => set({
    visitGalaxy: g ? withFocus(g) : null,
    selectedStar: null,
    visitPlanet: null,
    selectedObjectId: null,
    tourActive: false,
    flyTo: g
      ? (() => {
          const f = withFocus(g).focus;
          return f
            ? { x: f.x, y: f.y, z: f.z, distance: f.distance }
            : { x: g.x, y: g.y, z: g.z, distance: Math.max(g.size * 2.2, 2000) };
        })()
      : null,
  }),
  setSelectedObject: (id) => {
    const item = id ? OBJECT_BY_ID.get(id) : undefined;
    if (!item) {
      set({ selectedObjectId: null });
      return;
    }
    const [x, y, z] = objectPosition(item);
    set({
      selectedObjectId: id,
      selectedStar: null,
      visitPlanet: null,
      visitGalaxy: null,
      tourActive: false,
      flyTo: { x, y, z, distance: objectVisitDistance(item) },
    });
  },
  toggleUiHidden: () => set((st) => ({ uiHidden: !st.uiHidden })),
  toggleCameraFree: () => set((st) => ({ cameraFree: !st.cameraFree })),
  setZoomSpeed: (n) => set({ zoomSpeed: n }),
  setSystemSpeed: (n) => set({ systemSpeed: n }),
  setTrailSize: (n) => set({ trailSize: n }),
}));
