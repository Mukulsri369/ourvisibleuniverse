import { create } from "zustand";
import type { NamedStar } from "./data";

export type TourStop = {
  name: string;
  caption: string;
  distance: number;
  fov: number;
  duration: number;
};

export const TOUR_STOPS: TourStop[] = [
  { name: "The Sun", caption: "The Sun — Our home star, 4.6 billion years old", distance: 1.2, fov: 35, duration: 7000 },
  { name: "Our Solar System", caption: "Our Solar System — Eight planets orbit the Sun", distance: 14, fov: 45, duration: 7000 },
  { name: "The Oort Cloud", caption: "The Oort Cloud — Icy bodies marking the edge of the Sun's influence, about 1 light-year away", distance: 2.2, fov: 55, duration: 7000 },
  { name: "Nearby Stars", caption: "87 Named Stars — The closest stars to our Sun, each one a distant sun of its own", distance: 60, fov: 60, duration: 13000 },
  { name: "Our Stellar Neighborhood", caption: "100,000 Stars — An accurate map of our stellar neighborhood within the Milky Way", distance: 800, fov: 75, duration: 15000 },
  { name: "The Milky Way", caption: "The Milky Way — Our galaxy contains over 100 billion stars. You are here.", distance: 45000, fov: 85, duration: 10000 },
  { name: "The Local Group", caption: "The Local Group — Our Milky Way, Andromeda, and dozens of smaller galaxies drift together through space", distance: 3_500_000, fov: 80, duration: 10000 },
  { name: "The Cosmic Web", caption: "The Cosmic Web — Galaxies cluster along vast filaments of dark matter that thread the observable universe", distance: 2e9, fov: 75, duration: 10000 },
];

export type GalaxyTarget = {
  name: string;
  type: string;
  distance: number; // ly
  size: number;
  color: string;
  x: number; y: number; z: number;
  image?: string;
  description?: string;
};

interface State {
  selectedStar: NamedStar | null;
  selectedGalaxy: GalaxyTarget | null;
  spectralMode: boolean;
  tourActive: boolean;
  tourStop: number;
  tourCaption: string | null;
  musicOn: boolean;
  cameraDistance: number;
  flyTo: { x: number; y: number; z: number; distance: number } | null;
  visitPlanet: string | null;
  uiHidden: boolean;
  setSelected: (s: NamedStar | null) => void;
  setSelectedGalaxy: (g: GalaxyTarget | null) => void;
  toggleSpectral: () => void;
  startTour: () => void;
  stopTour: () => void;
  setTourStop: (n: number) => void;
  setTourCaption: (c: string | null) => void;
  toggleMusic: () => void;
  setCameraDistance: (d: number) => void;
  flyToStar: (s: NamedStar) => void;
  flyToGalaxy: (g: GalaxyTarget) => void;
  clearFly: () => void;
  setVisitPlanet: (name: string | null) => void;
  toggleUI: () => void;
}

export const useStore = create<State>((set) => ({
  selectedStar: null,
  selectedGalaxy: null,
  spectralMode: false,
  tourActive: false,
  tourStop: 0,
  tourCaption: null,
  musicOn: false,
  cameraDistance: 8,
  flyTo: null,
  visitPlanet: null,
  uiHidden: false,
  setSelected: (s) => set({ selectedStar: s, selectedGalaxy: null }),
  setSelectedGalaxy: (g) => set({ selectedGalaxy: g }),
  toggleSpectral: () => set((st) => ({ spectralMode: !st.spectralMode })),
  startTour: () => set({ tourActive: true, tourStop: 0, selectedStar: null, selectedGalaxy: null, visitPlanet: null }),
  stopTour: () => set({ tourActive: false, tourCaption: null }),
  setTourStop: (n) => set({ tourStop: n }),
  setTourCaption: (c) => set({ tourCaption: c }),
  toggleMusic: () => set((st) => ({ musicOn: !st.musicOn })),
  setCameraDistance: (d) => set({ cameraDistance: d }),
  flyToStar: (s) => set({ flyTo: { x: s.x, y: s.y, z: s.z, distance: 3.5 }, selectedStar: s, selectedGalaxy: null, visitPlanet: null }),
  flyToGalaxy: (g) => set({
    flyTo: { x: g.x, y: g.y, z: g.z, distance: Math.max(g.size * 2.2, 40_000) },
    selectedGalaxy: g,
    selectedStar: null,
    visitPlanet: null,
  }),
  clearFly: () => set({ flyTo: null }),
  setVisitPlanet: (name) => set({ visitPlanet: name, selectedStar: null, selectedGalaxy: null, tourActive: false }),
  toggleUI: () => set((st) => ({ uiHidden: !st.uiHidden })),
}));
