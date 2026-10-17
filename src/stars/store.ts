import { create } from "zustand";
import type { NamedStar } from "./data";
import { ANDROMEDA_NAME, M31_AU, M31_PLANETS, PA99N2_STAR, PA99N2_WORLD } from "./andromeda-data";
import { GALAXY_BY_NAME, systemViewDistance, systemWorldPosition } from "./galaxy-models";
import { OBJECT_BY_ID, objectPosition, objectVisitDistance } from "./observed-objects";
import { COSMIC_BENCHMARKS } from "@/lib/astronomy/cosmic-web/survey-catalogs";

export type TourStop = {
  name: string;
  caption: string;
  distance: number;
  fov: number;
  duration: number;
};

export const TOUR_STOPS: TourStop[] = [
  {
    name: "The Sun",
    caption: "The Sun — Our home star, 4.6 billion years old",
    distance: 12,
    fov: 35,
    duration: 7000,
  },
  {
    name: "Our Solar System",
    caption: "Our Solar System — Eight planets orbit the Sun",
    distance: 180,
    fov: 45,
    duration: 7000,
  },
  {
    name: "The Oort Cloud",
    caption:
      "The Oort Cloud — Icy bodies marking the edge of the Sun's influence, about 1 light-year away",
    distance: 900,
    fov: 55,
    duration: 7000,
  },
  {
    name: "Nearby Stars",
    caption: "87 Named Stars — The closest stars to our Sun, each one a distant sun of its own",
    distance: 60,
    fov: 60,
    duration: 13000,
  },
  {
    name: "Our Stellar Neighborhood",
    caption:
      "Our Visible Universe — An accurate map of our stellar neighborhood within the Milky Way",
    distance: 800,
    fov: 75,
    duration: 15000,
  },
  {
    name: "The Milky Way",
    caption: "The Milky Way — Our galaxy contains over 100 billion stars. You are here.",
    distance: 4500,
    fov: 85,
    duration: 10000,
  },
];

export type VisitGalaxy = {
  name: string;
  x: number;
  y: number;
  z: number;
  size: number;
  distance: number;
  type: string;
  /** Site map selections frame the galaxy; other selections can visit its star system. */
  view?: "overview";
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
  exoVisit: { star: NamedStar; planet: string } | null;
  visitExoPlanet: (star: NamedStar, planet: string) => void;
  visitGalaxy: VisitGalaxy | null;
  selectedObjectId: string | null;
  uiHidden: boolean;
  cameraFree: boolean;
  zoomSpeed: number;
  systemSpeed: number;
  trailSize: number;
  scaleMode: "enhanced" | "true_scale";
  properMotionYears: number;
  starLODTier: "mobile" | "standard" | "high" | "benchmark";
  showSkyDirectionLayer: boolean;
  showProceduralStars: boolean;
  setScaleMode: (mode: "enhanced" | "true_scale") => void;
  toggleScaleMode: () => void;
  setProperMotionYears: (years: number) => void;
  setStarLODTier: (tier: "mobile" | "standard" | "high" | "benchmark") => void;
  toggleSkyDirectionLayer: () => void;
  toggleProceduralStars: () => void;
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
  // NASA JPL Horizons Solar System enhancements
  showOrbits: boolean;
  showVelocityVectors: boolean;
  showLagrangePoints: boolean;
  showBarycenterMarkers: boolean;
  showInterplanetaryDistances: boolean;
  distanceTargetPlanet: string;
  showResonanceOverlay: boolean;
  planetVisibilityMagnification: number;
  showGalacticDrift: boolean;
  ephemerisModel: "horizons_de440" | "analytical_osculating";
  toggleOrbits: () => void;
  toggleVelocityVectors: () => void;
  toggleLagrangePoints: () => void;
  toggleBarycenterMarkers: () => void;
  toggleInterplanetaryDistances: () => void;
  setDistanceTargetPlanet: (name: string) => void;
  toggleResonanceOverlay: () => void;
  setPlanetVisibilityMagnification: (n: number) => void;
  toggleGalacticDrift: () => void;
  setEphemerisModel: (model: "horizons_de440" | "analytical_osculating") => void;
  // Observational Galaxy Atlas & Cosmology enhancements
  showCosmicWebDensity: boolean;
  showObservedGalaxies: boolean;
  galaxyAtlasSearchOpen: boolean;
  galaxyCoverageDashboardOpen: boolean;
  cosmologyModelKey: "planck2018" | "shoes2022" | "wmap9" | "custom";
  customCosmology: { h0: number; omegaM: number; omegaLambda: number };
  toggleCosmicWebDensity: () => void;
  toggleObservedGalaxies: () => void;
  setGalaxyAtlasSearchOpen: (open: boolean) => void;
  setGalaxyCoverageDashboardOpen: (open: boolean) => void;
  setCosmologyModelKey: (key: "planck2018" | "shoes2022" | "wmap9" | "custom") => void;
  setCustomCosmology: (params: { h0: number; omegaM: number; omegaLambda: number }) => void;
  // Large-Scale Structure & Hybrid Cosmic Web Explorer State
  cosmicWebMode: "observational" | "simulation" | "off";
  selectedSurveys: Record<string, boolean>;
  redshiftFilter: [number, number];
  showSurveyFootprints: boolean;
  showZoneOfAvoidance: boolean;
  selectedCosmicBenchmarkId: string | null;
  showCosmicBenchmarks: boolean;
  simulationComponent: "all" | "dark_matter" | "gas" | "filaments" | "clusters";
  showSimulationFilaments: boolean;
  showSimulationVoids: boolean;
  showSimulationBoundingBox: boolean;
  selectedSimHaloId: number | null;
  selectedSimVoidId: number | null;
  catalogDensityLevel: number;
  cosmicWebExplorerOpen: boolean;
  guidedJourneyActive: boolean;
  guidedJourneyStep: number;
  setCosmicWebMode: (mode: "observational" | "simulation" | "off") => void;
  toggleSurvey: (survey: string) => void;
  setRedshiftFilter: (range: [number, number]) => void;
  toggleSurveyFootprints: () => void;
  toggleZoneOfAvoidance: () => void;
  setSelectedCosmicBenchmarkId: (id: string | null) => void;
  toggleCosmicBenchmarks: () => void;
  setSimulationComponent: (comp: "all" | "dark_matter" | "gas" | "filaments" | "clusters") => void;
  toggleSimulationFilaments: () => void;
  toggleSimulationVoids: () => void;
  toggleSimulationBoundingBox: () => void;
  setSelectedSimHaloId: (id: number | null) => void;
  setSelectedSimVoidId: (id: number | null) => void;
  setCatalogDensityLevel: (level: number) => void;
  setCosmicWebExplorerOpen: (open: boolean) => void;
  startGuidedJourney: () => void;
  setGuidedJourneyStep: (step: number) => void;
  nextGuidedJourneyStep: () => void;
  prevGuidedJourneyStep: () => void;
  stopGuidedJourney: () => void;
  // Optics & Advanced Rendering State
  observerMode: "vacuum" | "atmosphere";
  opticsPreset: "scientific" | "cinematic";
  bloomEnabled: boolean;
  bloomStrength: number;
  bloomRadius: number;
  bloomThreshold: number;
  exposure: number;
  toneMappingAlgorithm: "aces" | "agx" | "neutral" | "reinhard";
  diffractionSpikesEnabled: boolean;
  atmosphericScintillation: number;
  renderingQualityTier: "scientific_high" | "standard" | "performance";
  opticsModalOpen: boolean;
  benchmarkModalOpen: boolean;
  performanceStats: {
    fps: number;
    drawCalls: number;
    triangles: number;
    pointsCount: number;
    memoryMb: number;
  };
  setObserverMode: (mode: "vacuum" | "atmosphere") => void;
  setOpticsPreset: (preset: "scientific" | "cinematic") => void;
  toggleBloom: () => void;
  setBloomStrength: (v: number) => void;
  setBloomRadius: (v: number) => void;
  setBloomThreshold: (v: number) => void;
  setExposure: (v: number) => void;
  setToneMappingAlgorithm: (algo: "aces" | "agx" | "neutral" | "reinhard") => void;
  toggleDiffractionSpikes: () => void;
  setAtmosphericScintillation: (v: number) => void;
  setRenderingQualityTier: (tier: "scientific_high" | "standard" | "performance") => void;
  setOpticsModalOpen: (open: boolean) => void;
  setBenchmarkModalOpen: (open: boolean) => void;
  compactObjectModalOpen: boolean;
  setCompactObjectModalOpen: (open: boolean) => void;
  setPerformanceStats: (stats: {
    fps: number;
    drawCalls: number;
    triangles: number;
    pointsCount: number;
    memoryMb: number;
  }) => void;
}

// Andromeda has a fully modelled star system (PA-99-N2), so visiting it
// flies the camera to that system rather than the galaxy's core.
function withFocus(g: VisitGalaxy): VisitGalaxy {
  if (g.view === "overview") return g;
  if (g.focus) return g;
  if (g.name === ANDROMEDA_NAME) {
    const outer = M31_PLANETS.reduce((mx, p) => Math.max(mx, p.a), 6 * M31_AU);
    return {
      ...g,
      focus: {
        x: PA99N2_WORLD.x,
        y: PA99N2_WORLD.y,
        z: PA99N2_WORLD.z,
        distance: outer * 3.2,
        key: PA99N2_STAR.name,
      },
    };
  }
  const model = GALAXY_BY_NAME.get(g.name);
  if (model?.system) {
    // Aim straight at where the star system sits inside its galaxy (not the
    // core); the camera then locks onto the live position published under the
    // host star's name as the system orbits.
    const sysPos = systemWorldPosition(model);
    return {
      ...g,
      focus: {
        x: sysPos.x,
        y: sysPos.y,
        z: sysPos.z,
        distance: systemViewDistance(model),
        key: model.system.star.name,
      },
    };
  }
  return g;
}

function toGalacticXYZ(l: number, b: number, d: number) {
  const lr = (l * Math.PI) / 180;
  const br = (b * Math.PI) / 180;
  const x = -d * Math.cos(br) * Math.cos(lr);
  const y = d * Math.sin(br);
  const z = d * Math.cos(br) * Math.sin(lr);
  return { x, y, z };
}

export interface GuidedJourneyStep {
  id: string;
  title: string;
  subtitle: string;
  scaleDescription: string;
  distanceLy: number;
  cameraDistance: number;
  targetPos: { x: number; y: number; z: number };
  lookbackTimeText: string;
  redshiftText: string;
  cosmicEpoch: string;
  scientificDescription: string;
  keyPhenomena: string[];
}

export const GUIDED_JOURNEY_STEPS: GuidedJourneyStep[] = [
  {
    id: "milky_way",
    title: "1. The Milky Way Galaxy",
    subtitle: "Our Home Stellar Island",
    scaleDescription: "100,000 Light-Years (30 kpc)",
    distanceLy: 100_000,
    cameraDistance: 160_000,
    targetPos: { x: -26000, y: 0, z: 0 },
    lookbackTimeText: "0 to 100,000 Years",
    redshiftText: "z ≈ 0.000",
    cosmicEpoch: "Present Day (t = 13.8 Gyr)",
    scientificDescription:
      "A barred spiral galaxy (SBbc) containing 200–400 billion stars and 100+ billion planets. The Sun orbits 26,000 light-years from the supermassive black hole Sagittarius A* (4.15 million solar masses) at 220 km/s.",
    keyPhenomena: [
      "Stellar thin & thick disks",
      "Spiral density waves (Scutum-Centaurus, Perseus arms)",
      "Central supermassive black hole (Sgr A*)",
      "Dark matter halo (~10^12 M_sun)",
    ],
  },
  {
    id: "local_group",
    title: "2. The Local Group",
    subtitle: "Gravitationally Bound Family",
    scaleDescription: "10 Million Light-Years (3 Mpc)",
    distanceLy: 10_000_000,
    cameraDistance: 8_000_000,
    targetPos: { x: 0, y: 0, z: 0 },
    lookbackTimeText: "0 to 10 Million Years",
    redshiftText: "z ≈ -0.001 to +0.001",
    cosmicEpoch: "Present Epoch Bound Structure",
    scientificDescription:
      "A gravitationally bound cluster of 80+ galaxies dominated by two behemoths: the Milky Way and Andromeda (M31, 2.537 Mly). M31 is approaching us at ~300 km/s (negative redshift) and will merge with the Milky Way in ~4.5 billion years.",
    keyPhenomena: [
      "Milky Way – Andromeda gravitational infall",
      "Triangulum (M33) and dwarf spheroidal satellites",
      "Intragroup hot plasma & Magellanic Stream",
      "Gravitational decoupling from Hubble cosmic expansion",
    ],
  },
  {
    id: "virgo_cluster",
    title: "3. The Virgo Cluster & Supercluster",
    subtitle: "The Local Cosmic Metropolis",
    scaleDescription: "54 Million Light-Years (16.5 Mpc)",
    distanceLy: 54_000_000,
    cameraDistance: 35_000_000,
    targetPos: toGalacticXYZ(283.8, 74.5, 54_000_000),
    lookbackTimeText: "54 Million Years",
    redshiftText: "z = 0.0038 (v_rec ≈ 1,150 km/s)",
    cosmicEpoch: "Local Supercluster Virialized Core",
    scientificDescription:
      "The massive physical heart of our local extragalactic environment. Contains over 1,500 member galaxies dominated by giant elliptical M87 (hosting a 6.5-billion solar mass black hole). Its gravitational pull produces a ~200 km/s 'Virgocentric infall' of the Local Group.",
    keyPhenomena: [
      "Giant elliptical core (M87 with relativistic jet)",
      "High velocity dispersion (sigma ~ 700 km/s)",
      "X-ray emitting intracluster medium (10^7 K)",
      "Tidal stripping and ram-pressure galaxy quenching",
    ],
  },
  {
    id: "laniakea",
    title: "4. Laniakea Supercluster Watershed",
    subtitle: "Our Immense Cosmic Flow Basin",
    scaleDescription: "520 Million Light-Years (160 Mpc)",
    distanceLy: 520_000_000,
    cameraDistance: 320_000_000,
    targetPos: toGalacticXYZ(290.0, 40.0, 250_000_000),
    lookbackTimeText: "250–520 Million Years",
    redshiftText: "z ≈ 0.012 - 0.040",
    cosmicEpoch: "Peculiar Velocity Watershed",
    scientificDescription:
      "Identified by Tully et al. (2014) through Cosmicflows peculiar velocity streamlines. Encompasses 100,000 galaxies across 520 Mly streaming toward the Great Attractor (Norma Cluster) and Centaurus basin. Unlike clusters, Laniakea is not gravitationally bound and will be torn apart by dark energy.",
    keyPhenomena: [
      "Peculiar velocity divergence boundary (watershed)",
      "Great Attractor gravitational anomaly",
      "Shapley Supercluster pull in background",
      "Dark energy expansion overcoming gravitational binding",
    ],
  },
  {
    id: "cosmic_web",
    title: "5. The Cosmic Web & Sloan Great Wall",
    subtitle: "Filaments, Cluster Nodes & Vast Voids",
    scaleDescription: "1.4 Billion Light-Years (430 Mpc)",
    distanceLy: 1_400_000_000,
    cameraDistance: 1_200_000_000,
    targetPos: toGalacticXYZ(295.0, 67.0, 1_020_000_000),
    lookbackTimeText: "1.0–1.4 Billion Years",
    redshiftText: "z ≈ 0.073 - 0.100",
    cosmicEpoch: "Large-Scale Structure Web",
    scientificDescription:
      "The fundamental architecture of matter in the cosmos. Massive dark matter filaments act as gravitational highways channeling gas and galaxies into rich nodes (Coma, Perseus), while gigantic underdense voids (such as the 330 Mly Boötes Void) occupy over 60% of cosmic volume. Mapped by SDSS DR18 and 2dFGRS surveys.",
    keyPhenomena: [
      "Sloan Great Wall (1.37 Gly sheet of galaxies)",
      "Boötes Void (330 Mly near-empty sphere)",
      "Anisotropic gravitational collapse along Zel'dovich pancakes",
      "Two-point galaxy correlation xi(r) = (r_0/r)^1.8",
    ],
  },
  {
    id: "observable_universe",
    title: "6. The Observable Universe Horizon",
    subtitle: "Comoving Particle Horizon & Cosmic Dawn",
    scaleDescription: "93 Billion Light-Years Diameter (46.5 Gly Radius)",
    distanceLy: 46_500_000_000,
    cameraDistance: 42_000_000_000,
    targetPos: { x: 0, y: 0, z: 0 },
    lookbackTimeText: "13.8 Billion Years (Cosmic Dawn)",
    redshiftText: "z = 1,100 (CMB Recombination)",
    cosmicEpoch: "Cosmic Recombination (t = 380,000 yr)",
    scientificDescription:
      "The boundary of everything we can causally observe. Because space has expanded during light's 13.8 billion-year journey, the comoving radius is now 46.5 billion light-years (4.4e26 m). At this outer shell lies the Cosmic Microwave Background (z=1100), the afterglow of the Big Bang when electrons and protons first formed neutral hydrogen atoms.",
    keyPhenomena: [
      "Comoving particle horizon (46.5 Gly from FLRW metric)",
      "Expanding space distinction: D_L > D_C > c*t_L > D_A",
      "Cosmic Microwave Background (CMB, T = 2.7255 K)",
      "Cosmic Dawn (JWST record galaxies at z > 14)",
    ],
  },
];

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
  exoVisit: null,
  visitExoPlanet: (star, planet) =>
    set({
      visitPlanet: planet,
      exoVisit: { star, planet },
      selectedStar: null,
      tourActive: false,
      visitGalaxy: null,
      selectedObjectId: null,
      flyTo: null,
      cameraFree: false,
    }),
  visitGalaxy: null,
  selectedObjectId: null,
  uiHidden: false,
  cameraFree: false,
  zoomSpeed: 50,
  systemSpeed: 25,
  trailSize: 50,
  scaleMode: "enhanced",
  properMotionYears: 0,
  starLODTier: "standard",
  showSkyDirectionLayer: true,
  showProceduralStars: true,
  showOrbits: true,
  showVelocityVectors: false,
  showLagrangePoints: false,
  showBarycenterMarkers: false,
  showInterplanetaryDistances: false,
  distanceTargetPlanet: "Mars",
  showResonanceOverlay: false,
  planetVisibilityMagnification: 1.0,
  showGalacticDrift: true,
  ephemerisModel: "horizons_de440",
  setScaleMode: (mode) => set({ scaleMode: mode }),
  toggleScaleMode: () =>
    set((st) => ({ scaleMode: st.scaleMode === "enhanced" ? "true_scale" : "enhanced" })),
  setProperMotionYears: (years) => set({ properMotionYears: years }),
  setStarLODTier: (tier) => set({ starLODTier: tier }),
  toggleSkyDirectionLayer: () =>
    set((st) => ({ showSkyDirectionLayer: !st.showSkyDirectionLayer })),
  toggleProceduralStars: () => set((st) => ({ showProceduralStars: !st.showProceduralStars })),
  setSelected: (s) =>
    set({ exoVisit: null, selectedStar: s, visitGalaxy: null, selectedObjectId: null }),
  toggleSpectral: () => set((st) => ({ spectralMode: !st.spectralMode })),
  startTour: () =>
    set({
      tourActive: true,
      tourStop: 0,
      selectedStar: null,
      visitPlanet: null,
      visitGalaxy: null,
    }),
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
  flyToStar: (s) =>
    set({
      flyTo: { x: s.x, y: s.y, z: s.z, distance: 3.5 },
      exoVisit: null,
      selectedStar: s,
      visitPlanet: null,
      visitGalaxy: null,
      selectedObjectId: null,
    }),
  clearFly: () => set({ flyTo: null }),
  setVisitPlanet: (name) =>
    set({
      visitPlanet: name,
      exoVisit: null,
      selectedStar: null,
      tourActive: false,
      visitGalaxy: null,
      selectedObjectId: null,
      flyTo: null,
      cameraFree: name ? false : get().cameraFree,
    }),
  setVisitGalaxy: (g) =>
    set({
      visitGalaxy: g ? withFocus(g) : null,
      exoVisit: null,
      selectedStar: null,
      visitPlanet: null,
      selectedObjectId: null,
      tourActive: false,
      flyTo:
        g && g.view !== "overview"
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
      exoVisit: null,
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
  toggleOrbits: () => set((st) => ({ showOrbits: !st.showOrbits })),
  toggleVelocityVectors: () => set((st) => ({ showVelocityVectors: !st.showVelocityVectors })),
  toggleLagrangePoints: () => set((st) => ({ showLagrangePoints: !st.showLagrangePoints })),
  toggleBarycenterMarkers: () =>
    set((st) => ({ showBarycenterMarkers: !st.showBarycenterMarkers })),
  toggleInterplanetaryDistances: () =>
    set((st) => ({ showInterplanetaryDistances: !st.showInterplanetaryDistances })),
  setDistanceTargetPlanet: (name) => set({ distanceTargetPlanet: name }),
  toggleResonanceOverlay: () => set((st) => ({ showResonanceOverlay: !st.showResonanceOverlay })),
  setPlanetVisibilityMagnification: (n) => set({ planetVisibilityMagnification: n }),
  toggleGalacticDrift: () => set((st) => ({ showGalacticDrift: !st.showGalacticDrift })),
  setEphemerisModel: (model) => set({ ephemerisModel: model }),
  showCosmicWebDensity: true,
  showObservedGalaxies: true,
  galaxyAtlasSearchOpen: false,
  galaxyCoverageDashboardOpen: false,
  cosmologyModelKey: "planck2018",
  customCosmology: { h0: 70.0, omegaM: 0.3, omegaLambda: 0.7 },
  toggleCosmicWebDensity: () => set((st) => ({ showCosmicWebDensity: !st.showCosmicWebDensity })),
  toggleObservedGalaxies: () => set((st) => ({ showObservedGalaxies: !st.showObservedGalaxies })),
  setGalaxyAtlasSearchOpen: (open) => set({ galaxyAtlasSearchOpen: open }),
  setGalaxyCoverageDashboardOpen: (open) => set({ galaxyCoverageDashboardOpen: open }),
  setCosmologyModelKey: (key) => set({ cosmologyModelKey: key }),
  setCustomCosmology: (params) => set({ customCosmology: params }),
  // Large-Scale Structure & Hybrid Cosmic Web Explorer
  cosmicWebMode: "observational",
  selectedSurveys: {
    sdss_dr18: true,
    "2dfgrs": true,
    "2mrs": true,
    cosmicflows: true,
    deep_fields: true,
  },
  redshiftFilter: [0, 1.0],
  showSurveyFootprints: true,
  showZoneOfAvoidance: true,
  selectedCosmicBenchmarkId: null,
  showCosmicBenchmarks: true,
  simulationComponent: "all",
  showSimulationFilaments: true,
  showSimulationVoids: true,
  showSimulationBoundingBox: true,
  selectedSimHaloId: null,
  selectedSimVoidId: null,
  catalogDensityLevel: 15000,
  cosmicWebExplorerOpen: false,
  guidedJourneyActive: false,
  guidedJourneyStep: 0,
  setCosmicWebMode: (mode) => set({ cosmicWebMode: mode }),
  toggleSurvey: (survey) =>
    set((st) => ({
      selectedSurveys: {
        ...st.selectedSurveys,
        [survey]: !st.selectedSurveys[survey],
      },
    })),
  setRedshiftFilter: (range) => set({ redshiftFilter: range }),
  toggleSurveyFootprints: () =>
    set((st) => ({ showSurveyFootprints: !st.showSurveyFootprints })),
  toggleZoneOfAvoidance: () =>
    set((st) => ({ showZoneOfAvoidance: !st.showZoneOfAvoidance })),
  setSelectedCosmicBenchmarkId: (id) => {
    set({ selectedCosmicBenchmarkId: id });
    if (!id) return;
    const bench = COSMIC_BENCHMARKS.find((b) => b.id === id);
    if (bench) {
      const pos = toGalacticXYZ(bench.l, bench.b, bench.distanceGlyPlanck * 1e9);
      set({
        flyTo: {
          x: pos.x,
          y: pos.y,
          z: pos.z,
          distance: Math.max(bench.diameterMly * 1.5e6, 500000),
        },
      });
    }
  },
  toggleCosmicBenchmarks: () =>
    set((st) => ({ showCosmicBenchmarks: !st.showCosmicBenchmarks })),
  setSimulationComponent: (comp) => set({ simulationComponent: comp }),
  toggleSimulationFilaments: () =>
    set((st) => ({ showSimulationFilaments: !st.showSimulationFilaments })),
  toggleSimulationVoids: () =>
    set((st) => ({ showSimulationVoids: !st.showSimulationVoids })),
  toggleSimulationBoundingBox: () =>
    set((st) => ({ showSimulationBoundingBox: !st.showSimulationBoundingBox })),
  setSelectedSimHaloId: (id) => set({ selectedSimHaloId: id }),
  setSelectedSimVoidId: (id) => set({ selectedSimVoidId: id }),
  setCatalogDensityLevel: (level) => set({ catalogDensityLevel: level }),
  setCosmicWebExplorerOpen: (open) => set({ cosmicWebExplorerOpen: open }),
  startGuidedJourney: () => {
    const step = GUIDED_JOURNEY_STEPS[0];
    set({
      guidedJourneyActive: true,
      guidedJourneyStep: 0,
      cosmicWebMode: "observational",
      flyTo: {
        x: step.targetPos.x,
        y: step.targetPos.y,
        z: step.targetPos.z,
        distance: step.cameraDistance,
      },
    });
  },
  setGuidedJourneyStep: (stepIdx) => {
    const idx = Math.max(0, Math.min(GUIDED_JOURNEY_STEPS.length - 1, stepIdx));
    const step = GUIDED_JOURNEY_STEPS[idx];
    set({
      guidedJourneyStep: idx,
      guidedJourneyActive: true,
      flyTo: {
        x: step.targetPos.x,
        y: step.targetPos.y,
        z: step.targetPos.z,
        distance: step.cameraDistance,
      },
    });
  },
  nextGuidedJourneyStep: () => {
    const nextIdx = Math.min(GUIDED_JOURNEY_STEPS.length - 1, get().guidedJourneyStep + 1);
    get().setGuidedJourneyStep(nextIdx);
  },
  prevGuidedJourneyStep: () => {
    const prevIdx = Math.max(0, get().guidedJourneyStep - 1);
    get().setGuidedJourneyStep(prevIdx);
  },
  stopGuidedJourney: () => set({ guidedJourneyActive: false }),
  // Optics & Advanced Rendering initial state & actions
  observerMode: "vacuum",
  opticsPreset: "scientific",
  bloomEnabled: true,
  bloomStrength: 0.38,
  bloomRadius: 0.28,
  bloomThreshold: 0.82,
  exposure: 1.1,
  toneMappingAlgorithm: "aces",
  diffractionSpikesEnabled: true,
  atmosphericScintillation: 0.35,
  renderingQualityTier: "scientific_high",
  opticsModalOpen: false,
  benchmarkModalOpen: false,
  performanceStats: {
    fps: 60,
    drawCalls: 18,
    triangles: 120000,
    pointsCount: 750000,
    memoryMb: 85,
  },
  setObserverMode: (mode) => set({ observerMode: mode }),
  setOpticsPreset: (preset) =>
    set({
      opticsPreset: preset,
      bloomStrength: preset === "scientific" ? 0.38 : 0.88,
      bloomRadius: preset === "scientific" ? 0.28 : 0.62,
      bloomThreshold: preset === "scientific" ? 0.82 : 0.58,
      exposure: preset === "scientific" ? 1.05 : 1.38,
    }),
  toggleBloom: () => set((st) => ({ bloomEnabled: !st.bloomEnabled })),
  setBloomStrength: (v) => set({ bloomStrength: v }),
  setBloomRadius: (v) => set({ bloomRadius: v }),
  setBloomThreshold: (v) => set({ bloomThreshold: v }),
  setExposure: (v) => set({ exposure: v }),
  setToneMappingAlgorithm: (algo) => set({ toneMappingAlgorithm: algo }),
  toggleDiffractionSpikes: () =>
    set((st) => ({ diffractionSpikesEnabled: !st.diffractionSpikesEnabled })),
  setAtmosphericScintillation: (v) => set({ atmosphericScintillation: v }),
  setRenderingQualityTier: (tier) => set({ renderingQualityTier: tier }),
  setOpticsModalOpen: (open) => set({ opticsModalOpen: open }),
  setBenchmarkModalOpen: (open) => set({ benchmarkModalOpen: open }),
  compactObjectModalOpen: false,
  setCompactObjectModalOpen: (open) => set({ compactObjectModalOpen: open }),
  setPerformanceStats: (stats) => set({ performanceStats: stats }),
}));
