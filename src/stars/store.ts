// @ts-nocheck
import { SGR_A_DISTANCE_LY } from "@/lib/astronomy/galactic-scene";

import { clampTimeRate } from "./scene-controls";
import { stellarDisplayRadius } from "./camera-navigation";
import { create } from "zustand";
import { NAMED_STARS, type NamedStar } from "./data";
import { ANDROMEDA_NAME, M31_AU, M31_PLANETS, PA99N2_STAR, PA99N2_WORLD } from "./andromeda-data";
import { GALAXY_BY_NAME, systemViewDistance, systemWorldPosition } from "./galaxy-models";
import {
  OBJECT_BY_ID,
  OBSERVED_OBJECTS,
  objectPosition,
  objectVisitDistance,
} from "./observed-objects";
import { COSMIC_BENCHMARKS } from "@/lib/astronomy/cosmic-web/survey-catalogs";

function normalizeStar(s: NamedStar | null): NamedStar | null {
  if (!s) return null;
  const canonical = NAMED_STARS.find((n) => n.name.toLowerCase() === s.name?.toLowerCase());
  if (canonical) {
    return {
      ...canonical,
      ...s,
      magnitude: s.magnitude ?? canonical.magnitude ?? 0,
      absMagnitude: s.absMagnitude ?? canonical.absMagnitude ?? 4.83,
      mass: s.mass ?? canonical.mass ?? 1,
      radius: s.radius ?? canonical.radius ?? 1,
      temperature: s.temperature ?? canonical.temperature ?? 5778,
      luminosity: s.luminosity ?? canonical.luminosity ?? 1,
      distance: s.distance ?? canonical.distance ?? 0,
      galacticL: s.galacticL ?? canonical.galacticL ?? 0,
      galacticB: s.galacticB ?? canonical.galacticB ?? 0,
      constellation: s.constellation ?? canonical.constellation ?? "Solar System",
      spectralType: s.spectralType ?? canonical.spectralType ?? "G",
      color: s.color ?? canonical.color ?? "#fff4ea",
      description: s.description ?? canonical.description ?? "",
    };
  }
  return {
    ...s,
    magnitude: s.magnitude ?? 0,
    absMagnitude: s.absMagnitude ?? 4.83,
    mass: s.mass ?? 1,
    radius: s.radius ?? 1,
    temperature: s.temperature ?? 5778,
    luminosity: s.luminosity ?? 1,
    distance: s.distance ?? 0,
    galacticL: s.galacticL ?? 0,
    galacticB: s.galacticB ?? 0,
    constellation: s.constellation ?? "Deep Sky",
    spectralType: s.spectralType ?? "G",
    color: s.color ?? "#fff4ea",
    description: s.description ?? "",
  };
}

const OBJECT_ID_ALIASES: Record<string, string> = {
  sgra: "sgr-a",
  "sgr a*": "sgr-a",
  "m87*": "m87star",
  "cygnus-x-1": "cygx1",
  "orion-nebula": "m42",
  "crab-nebula": "m1",
};

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
  reconstructionNote?: string;
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
  freeLookSpeed: number;
  outerOrbitSpeed: number;
  galacticTravelSpeed: number;
  navigationSettingsOpen: boolean;
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
  setFreeLookSpeed: (n: number) => void;
  setOuterOrbitSpeed: (n: number) => void;
  setGalacticTravelSpeed: (n: number) => void;
  setNavigationSettingsOpen: (open: boolean) => void;
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
  autoGalaxyExposure: boolean;
  setAutoGalaxyExposure: (enabled: boolean) => void;
  exposure: number;
  sceneBrightness: number;
  setSceneBrightness: (value: number) => void;
  toneMappingAlgorithm: "aces" | "agx" | "neutral" | "reinhard";
  diffractionSpikesEnabled: boolean;
  atmosphericScintillation: number;
  renderingQualityTier: "scientific_high" | "standard" | "performance";
  opticsModalOpen: boolean;
  benchmarkModalOpen: boolean;
  performanceProfilerOpen: boolean;
  performanceProfilerExpanded: boolean;
  performanceStats: {
    fps: number;
    rollingFps: number;
    frameTimeMs: number;
    p95FrameTimeMs: number;
    p99FrameTimeMs: number;
    cpuFrameTimeMs: number;
    gpuFrameTimeMs: number | null;
    drawCalls: number;
    triangles: number;
    pointsCount: number;
    memoryMb: number;
    geometriesCount: number;
    texturesCount: number;
    activeFloatingOrigin: string;
  };
  subsystems: {
    milkyWay: boolean;
    andromeda: boolean;
    detailedGalaxies: boolean;
    gaiaStars: boolean;
    planets: boolean;
    cosmicWeb: boolean;
    bloom: boolean;
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
  setPerformanceProfilerOpen: (open: boolean) => void;
  setPerformanceProfilerExpanded: (expanded: boolean) => void;
  toggleSubsystem: (
    subsystem:
      | "milkyWay"
      | "andromeda"
      | "detailedGalaxies"
      | "gaiaStars"
      | "planets"
      | "cosmicWeb"
      | "bloom",
  ) => void;
  compactObjectModalOpen: boolean;
  setCompactObjectModalOpen: (open: boolean) => void;
  observationModalOpen: boolean;
  observationTargetId: string | null;
  setObservationModalOpen: (open: boolean, targetId?: string | null) => void;
  setPerformanceStats: (stats: Partial<State["performanceStats"]>) => void;

  // --- Upgraded Camera Navigation & Interaction State ---
  cameraMode: "orbit" | "free" | "follow";
  setCameraMode: (mode: "orbit" | "free" | "follow") => void;
  isAutoOrbiting: boolean;
  toggleAutoOrbit: () => void;
  resetOrientationTrigger: number;
  resetCameraOrientation: () => void;
  cameraBookmarks: CameraBookmark[];
  saveCameraBookmark: (title: string, description: string) => void;
  deleteCameraBookmark: (id: string) => void;
  loadCameraBookmark: (bm: CameraBookmark) => void;
  bookmarksModalOpen: boolean;
  setBookmarksModalOpen: (open: boolean) => void;
  shortcutsModalOpen: boolean;
  setShortcutsModalOpen: (open: boolean) => void;
  universalSearchOpen: boolean;
  setUniversalSearchOpen: (open: boolean) => void;
  discoveriesModalOpen: boolean;
  setDiscoveriesModalOpen: (open: boolean) => void;
  universalObjectModalOpen: boolean;
  setUniversalObjectModalOpen: (open: boolean) => void;
  activeUniversalTarget: UniversalTarget | null;
  setActiveUniversalTarget: (t: UniversalTarget | null) => void;
  explanationLevel: "explorer" | "standard" | "advanced";
  setExplanationLevel: (lvl: "explorer" | "standard" | "advanced") => void;
  cosmicJourneyIndex: number;
  setCosmicJourneyIndex: (idx: number) => void;
  nextCosmicJourneyStep: () => void;
  prevCosmicJourneyStep: () => void;
  cosmicJourneyOpen: boolean;
  setCosmicJourneyOpen: (open: boolean) => void;
  toggleCosmicJourney: () => void;
  catalogDashboardOpen: boolean;
  setCatalogDashboardOpen: (open: boolean) => void;
}

export type UniversalTargetType =
  | "planet"
  | "moon"
  | "star"
  | "exoplanet"
  | "galaxy"
  | "nebula"
  | "black_hole"
  | "quasar"
  | "pulsar"
  | "cluster";

export interface UniversalTarget {
  id: string;
  name: string;
  type: UniversalTargetType;
  subtitle?: string;
  category?: string;
  distanceLy: number;
  apparentMagnitude?: number;
  absoluteMagnitude?: number;
  radiusKm?: number;
  radiusSolar?: number;
  radiusEarth?: number;
  massSolar?: number;
  massEarth?: number;
  temperatureK?: number;
  spectralType?: string;
  constellation?: string;
  ra?: string;
  dec?: string;
  galacticL?: number;
  galacticB?: number;
  redshift?: number;
  morphology?: string;
  parentName?: string;
  parentType?: string;
  children?: { id: string; name: string; type: UniversalTargetType; distance?: string }[];
  description: {
    explorer: string;
    standard: string;
    advanced: string;
  };
  formationAndEvolution: string;
  telescopeObservations: string;
  isSimulatedOrModelled?: boolean;
  modelledDetailsNote?: string;
  citations: string[];
  rawEntity?: any;
}

export interface CameraBookmark {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  radius: number;
  theta: number;
  phi: number;
  target: { x: number; y: number; z: number };
  fov?: number;
  category: "solar_system" | "stars" | "deep_space" | "cosmology" | "user";
  visitPlanet?: string | null;
  visitGalaxy?: VisitGalaxy | null;
  selectedObjectId?: string | null;
  selectedStar?: NamedStar | null;
}

export const DEFAULT_CAMERA_BOOKMARKS: CameraBookmark[] = [
  {
    id: "bm_earth_moon",
    title: "Earth–Moon Orbital Gateway",
    subtitle: "Inner Solar System · 1.58e-5 ly",
    description:
      "Framing the blue marble and its ancient tidal companion in low interplanetary vantage.",
    radius: 4.5e-7,
    theta: 0.8,
    phi: 1.45,
    target: { x: 0, y: 0, z: 0 },
    fov: 34,
    category: "solar_system",
    visitPlanet: "Earth",
  },
  {
    id: "bm_saturn_rings",
    title: "Saturn's Ring Plane Grazing View",
    subtitle: "Gas Giant Ring Dynamics · 9.58 AU",
    description:
      "Viewing the Cassini Division and thousand ringlets from grazing ring-plane elevation.",
    radius: 3.2e-6,
    theta: 1.25,
    phi: 1.52,
    target: { x: 0, y: 0, z: 0 },
    fov: 32,
    category: "solar_system",
    visitPlanet: "Saturn",
  },
  {
    id: "bm_trappist_1",
    title: "TRAPPIST-1 Red Dwarf System",
    subtitle: "Compact Habitable Architecture · 40.7 ly",
    description: "Seven Earth-sized worlds orbiting an ultra-cool red dwarf in resonant chain.",
    radius: 3.5,
    theta: 0.6,
    phi: 1.35,
    target: { x: -3.8, y: -24.6, z: 32.1 },
    fov: 36,
    category: "stars",
    selectedStar: NAMED_STARS.find((s) => s.name === "TRAPPIST-1") ?? null,
  },
  {
    id: "bm_orion_nebula",
    title: "Orion Nebula (M42) Gas Nursery",
    subtitle: "Stellar Creche & Trapezium · 1,344 ly",
    description:
      "Volumetric HII photo-ionized gas glowing in Balmer hydrogen and forbidden oxygen lines.",
    radius: 28,
    theta: 0.4,
    phi: 1.2,
    target: { x: -650, y: -450, z: -1080 },
    fov: 40,
    category: "deep_space",
    selectedObjectId: "m42",
  },
  {
    id: "bm_sgra",
    title: "Sagittarius A* Event Horizon",
    subtitle: "Galactic Center Singularity · 26,000 ly",
    description: "4.15 million solar masses at the kinematic center of the Milky Way galaxy.",
    radius: 0.25,
    theta: 0.9,
    phi: 1.4,
    target: { x: -SGR_A_DISTANCE_LY, y: 0, z: 0 },
    fov: 38,
    category: "deep_space",
    selectedObjectId: "sgr-a",
  },
  {
    id: "bm_local_group",
    title: "Local Group Spiral Panorama",
    subtitle: "Milky Way & Andromeda · 2.54 Mly",
    description:
      "The two giant spiral galaxies approaching each other at 110 km/s in the Local Void.",
    radius: 3.2e6,
    theta: 0.5,
    phi: 1.15,
    target: { x: -1.2e6, y: 0, z: 0 },
    fov: 48,
    category: "cosmology",
  },
  {
    id: "bm_virgo_cluster",
    title: "Virgo Cluster Heart & M87",
    subtitle: "Local Supercluster Core · 54 Mly",
    description:
      "1,500 galaxies bound in hot 10-million-Kelvin intracluster gas surrounding giant elliptical M87.",
    radius: 4.5e7,
    theta: 1.1,
    phi: 1.05,
    target: { x: -1.2e7, y: 5.2e7, z: -5e6 },
    fov: 50,
    category: "cosmology",
  },
  {
    id: "bm_cosmic_web",
    title: "Observable Horizon & Cosmic Web",
    subtitle: "Particle Horizon & CMB · 46.5 Gly",
    description:
      "The cosmic web of dark matter filaments bounded by the 380,000-year recombination sphere.",
    radius: 4.65e10,
    theta: 0.78,
    phi: 1.2,
    target: { x: 0, y: 0, z: 0 },
    fov: 52,
    category: "cosmology",
  },
];

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
    targetPos: { x: -SGR_A_DISTANCE_LY, y: 0, z: 0 },
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
  visitExoPlanet: (star, planet) => {
    const normStar = normalizeStar(star)!;
    set({
      visitPlanet: planet,
      exoVisit: { star: normStar, planet },
      selectedStar: null,
      tourActive: false,
      visitGalaxy: null,
      selectedObjectId: null,
      flyTo: null,
      cameraFree: false,
    });
  },
  visitGalaxy: null,
  selectedObjectId: null,
  uiHidden: false,
  cameraFree: false,
  zoomSpeed: 50,
  freeLookSpeed: 1,
  outerOrbitSpeed: 1,
  galacticTravelSpeed: 1,
  navigationSettingsOpen: false,
  systemSpeed: 1,
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
    set({
      exoVisit: null,
      selectedStar: normalizeStar(s),
      cameraFree: s ? false : get().cameraFree,
      visitGalaxy: null,
      selectedObjectId: null,
    }),
  toggleSpectral: () => set((st) => ({ spectralMode: !st.spectralMode })),
  startTour: () =>
    set({
      tourActive: true,
      cameraFree: false,
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
  flyToStar: (s) => {
    const normStar = normalizeStar(s);
    if (!normStar) return;
    if (
      get().selectedStar?.name === normStar.name &&
      !get().visitPlanet &&
      !get().cameraFree &&
      !get().tourActive
    )
      return;
    const destination =
      normStar.name === "Sun" && typeof window !== "undefined"
        ? (window.__planetPositions?.get("Sun") ?? normStar)
        : normStar;
    set({
      flyTo: {
        x: destination.x,
        y: destination.y,
        z: destination.z,
        distance: stellarDisplayRadius(normStar) * 9,
      },
      cameraFree: false,
      tourActive: false,
      exoVisit: null,
      selectedStar: normStar,
      visitPlanet: null,
      visitGalaxy: null,
      selectedObjectId: null,
    });
  },
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
      visitGalaxy: g ? { ...g, view: "overview", focus: undefined } : null,
      cameraFree: g ? false : get().cameraFree,
      exoVisit: null,
      selectedStar: null,
      visitPlanet: null,
      selectedObjectId: null,
      tourActive: false,
      flyTo: null,
    }),
  setSelectedObject: (id) => {
    if (!id) {
      set({ selectedObjectId: null });
      return;
    }
    const cleanId = OBJECT_ID_ALIASES[id.toLowerCase()] ?? id;
    const item =
      OBJECT_BY_ID.get(cleanId) ??
      OBSERVED_OBJECTS.find(
        (o) =>
          o.id.toLowerCase() === cleanId.toLowerCase() ||
          o.name.toLowerCase() === cleanId.toLowerCase() ||
          o.aliases.some((a) => a.toLowerCase() === cleanId.toLowerCase()),
      );
    if (!item) {
      set({ selectedObjectId: null });
      return;
    }
    const [x, y, z] = objectPosition(item);
    set({
      selectedObjectId: item.id,
      cameraFree: false,
      exoVisit: null,
      selectedStar: null,
      visitPlanet: null,
      visitGalaxy: null,
      tourActive: false,
      flyTo: { x, y, z, distance: objectVisitDistance(item) },
    });
  },
  toggleUiHidden: () => set((st) => ({ uiHidden: !st.uiHidden })),
  toggleCameraFree: () =>
    set((st) => ({
      cameraFree: !st.cameraFree,
      tourActive: false,
      tourCaption: null,
      isAutoOrbiting: false,
      flyTo: null,
    })),
  setZoomSpeed: (n) => set({ zoomSpeed: n }),
  setFreeLookSpeed: (n) => set({ freeLookSpeed: Math.max(0.05, Math.min(20, n)) }),
  setOuterOrbitSpeed: (n) => set({ outerOrbitSpeed: Math.max(1, Math.min(2000, n)) }),
  setNavigationSettingsOpen: (open) => set({ navigationSettingsOpen: open }),
  setGalacticTravelSpeed: (n) =>
    set({ galacticTravelSpeed: Number.isFinite(n) ? Math.max(1, Math.min(1e8, n)) : 1 }),
  setSystemSpeed: (n) => set({ systemSpeed: clampTimeRate(n) }),
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
  showSurveyFootprints: false,
  showZoneOfAvoidance: false,
  selectedCosmicBenchmarkId: null,
  showCosmicBenchmarks: false,
  simulationComponent: "all",
  showSimulationFilaments: false,
  showSimulationVoids: false,
  showSimulationBoundingBox: false,
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
  toggleSurveyFootprints: () => set((st) => ({ showSurveyFootprints: !st.showSurveyFootprints })),
  toggleZoneOfAvoidance: () => set((st) => ({ showZoneOfAvoidance: !st.showZoneOfAvoidance })),
  setSelectedCosmicBenchmarkId: (id) => {
    set({ selectedCosmicBenchmarkId: id });
    if (!id) return;
    const bench = COSMIC_BENCHMARKS.find((b) => b.id === id);
    if (bench) {
      const pos = toGalacticXYZ(bench.l, bench.b, bench.distanceGlyPlanck * 1e9);
      set({
        visitPlanet: null,
        visitGalaxy: null,
        selectedObjectId: null,
        selectedStar: null,
        exoVisit: null,
        cameraFree: false,
        tourActive: false,
        flyTo: {
          x: pos.x,
          y: pos.y,
          z: pos.z,
          distance: Math.max(bench.diameterMly * 1.5e6, 500000),
        },
      });
    }
  },
  toggleCosmicBenchmarks: () => set((st) => ({ showCosmicBenchmarks: !st.showCosmicBenchmarks })),
  setSimulationComponent: (comp) => set({ simulationComponent: comp }),
  toggleSimulationFilaments: () =>
    set((st) => ({ showSimulationFilaments: !st.showSimulationFilaments })),
  toggleSimulationVoids: () => set((st) => ({ showSimulationVoids: !st.showSimulationVoids })),
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
      visitPlanet: null,
      visitGalaxy: null,
      selectedObjectId: null,
      selectedStar: null,
      exoVisit: null,
      tourActive: false,
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
      visitPlanet: null,
      visitGalaxy: null,
      selectedObjectId: null,
      selectedStar: null,
      exoVisit: null,
      tourActive: false,
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
  bloomStrength: 0.1,
  bloomRadius: 0.28,
  bloomThreshold: 0.82,
  autoGalaxyExposure: true,
  setAutoGalaxyExposure: (enabled) => set({ autoGalaxyExposure: enabled }),
  exposure: 0.1,
  sceneBrightness: 1,
  toneMappingAlgorithm: "neutral",
  diffractionSpikesEnabled: true,
  atmosphericScintillation: 0.35,
  renderingQualityTier: "scientific_high",
  opticsModalOpen: false,
  benchmarkModalOpen: false,
  performanceProfilerOpen: true,
  performanceProfilerExpanded: false,
  performanceStats: {
    fps: 60,
    rollingFps: 60,
    frameTimeMs: 16.6,
    p95FrameTimeMs: 16.8,
    p99FrameTimeMs: 17.5,
    cpuFrameTimeMs: 4.2,
    gpuFrameTimeMs: null,
    drawCalls: 18,
    triangles: 120000,
    pointsCount: 750000,
    memoryMb: 85,
    geometriesCount: 42,
    texturesCount: 16,
    activeFloatingOrigin: "Solar System Barycenter",
  },
  subsystems: {
    milkyWay: true,
    andromeda: true,
    detailedGalaxies: true,
    gaiaStars: true,
    planets: true,
    cosmicWeb: true,
    bloom: true,
  },
  setObserverMode: (mode) => set({ observerMode: mode }),
  setOpticsPreset: (preset) =>
    set({
      opticsPreset: preset,
      bloomStrength: preset === "scientific" ? 0.1 : 0.88,
      bloomRadius: preset === "scientific" ? 0.28 : 0.62,
      bloomThreshold: preset === "scientific" ? 0.82 : 0.58,
      exposure: preset === "scientific" ? 0.1 : 1.38,
    }),
  toggleBloom: () => set((st) => ({ bloomEnabled: !st.bloomEnabled })),
  setBloomStrength: (v) => set({ bloomStrength: v }),
  setBloomRadius: (v) => set({ bloomRadius: v }),
  setBloomThreshold: (v) => set({ bloomThreshold: v }),
  setSceneBrightness: (v) =>
    set({ sceneBrightness: Number.isFinite(v) ? Math.min(2, Math.max(0.05, v)) : 1 }),
  setExposure: (v) =>
    set({ exposure: Number.isFinite(v) ? Math.min(2.5, Math.max(0.001, v)) : 0.1 }),
  setToneMappingAlgorithm: (algo) => set({ toneMappingAlgorithm: algo }),
  toggleDiffractionSpikes: () =>
    set((st) => ({ diffractionSpikesEnabled: !st.diffractionSpikesEnabled })),
  setAtmosphericScintillation: (v) => set({ atmosphericScintillation: v }),
  setRenderingQualityTier: (tier) => set({ renderingQualityTier: tier }),
  setOpticsModalOpen: (open) => set({ opticsModalOpen: open }),
  setBenchmarkModalOpen: (open) => set({ benchmarkModalOpen: open }),
  setPerformanceProfilerOpen: (open) => set({ performanceProfilerOpen: open }),
  setPerformanceProfilerExpanded: (expanded) => set({ performanceProfilerExpanded: expanded }),
  toggleSubsystem: (subsystem) =>
    set((st) => ({
      subsystems: {
        ...st.subsystems,
        [subsystem]: !st.subsystems[subsystem],
      },
    })),
  compactObjectModalOpen: false,
  setCompactObjectModalOpen: (open) => set({ compactObjectModalOpen: open }),
  observationModalOpen: false,
  observationTargetId: null,
  setObservationModalOpen: (open, targetId = null) =>
    set({ observationModalOpen: open, observationTargetId: targetId ?? null }),
  setPerformanceStats: (stats) =>
    set((st) => ({
      performanceStats: { ...st.performanceStats, ...stats },
    })),

  // --- Upgraded Camera Navigation & Interaction State ---
  cameraMode: "orbit",
  setCameraMode: (mode) => set({ cameraMode: mode }),
  isAutoOrbiting: false,
  toggleAutoOrbit: () => set((st) => ({ isAutoOrbiting: !st.isAutoOrbiting, cameraFree: false })),
  resetOrientationTrigger: 0,
  resetCameraOrientation: () =>
    set((st) => ({ resetOrientationTrigger: st.resetOrientationTrigger + 1 })),
  cameraBookmarks: (() => {
    try {
      const stored =
        typeof window !== "undefined" ? localStorage.getItem("ov_camera_bookmarks") : null;
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      /* ignore */
    }
    return DEFAULT_CAMERA_BOOKMARKS;
  })(),
  saveCameraBookmark: (title, description) => {
    const currentDist = get().cameraDistance;
    const newBm: CameraBookmark = {
      id: "bm_user_" + Date.now(),
      title: title || "Custom Viewpoint",
      subtitle: `User Bookmark · ${currentDist >= 1e9 ? (currentDist / 1e9).toFixed(2) + " Gly" : currentDist >= 1e6 ? (currentDist / 1e6).toFixed(2) + " Mly" : currentDist >= 1 ? currentDist.toFixed(1) + " ly" : (currentDist * 63241).toFixed(2) + " AU"}`,
      description: description || "Custom vantage point saved during exploration.",
      radius: currentDist,
      theta: 0.8,
      phi: 1.4,
      target: { x: 0, y: 0, z: 0 },
      category: "user",
      visitPlanet: get().visitPlanet,
      visitGalaxy: get().visitGalaxy,
      selectedObjectId: get().selectedObjectId,
      selectedStar: get().selectedStar,
    };
    const updated = [newBm, ...get().cameraBookmarks];
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("ov_camera_bookmarks", JSON.stringify(updated));
      }
    } catch {
      /* ignore */
    }
    set({ cameraBookmarks: updated });
  },
  deleteCameraBookmark: (id) => {
    const updated = get().cameraBookmarks.filter((b) => b.id !== id);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("ov_camera_bookmarks", JSON.stringify(updated));
      }
    } catch {
      /* ignore */
    }
    set({ cameraBookmarks: updated });
  },
  loadCameraBookmark: (bm) => {
    if (bm.visitPlanet) {
      get().setVisitPlanet(bm.visitPlanet);
    } else if (bm.visitGalaxy) {
      get().setVisitGalaxy(bm.visitGalaxy);
    } else if (bm.selectedObjectId) {
      get().setSelectedObject(bm.selectedObjectId);
    } else if (bm.selectedStar) {
      get().flyToStar(bm.selectedStar);
    } else if (bm.id === "bm_trappist_1") {
      const trappist = NAMED_STARS.find((s) => s.name === "TRAPPIST-1");
      if (trappist) {
        get().flyToStar(trappist);
      }
    } else {
      set({
        flyTo: { x: bm.target.x, y: bm.target.y, z: bm.target.z, distance: bm.radius },
        visitPlanet: null,
        visitGalaxy: null,
        selectedObjectId: null,
        selectedStar: null,
        exoVisit: null,
        tourActive: false,
      });
    }
  },
  bookmarksModalOpen: false,
  setBookmarksModalOpen: (open) => set({ bookmarksModalOpen: open }),
  shortcutsModalOpen: false,
  setShortcutsModalOpen: (open) => set({ shortcutsModalOpen: open }),
  universalSearchOpen: false,
  setUniversalSearchOpen: (open) => set({ universalSearchOpen: open }),
  discoveriesModalOpen: false,
  setDiscoveriesModalOpen: (open) => set({ discoveriesModalOpen: open }),
  universalObjectModalOpen: false,
  setUniversalObjectModalOpen: (open) => set({ universalObjectModalOpen: open }),
  activeUniversalTarget: null,
  setActiveUniversalTarget: (t) =>
    set({ activeUniversalTarget: t, universalObjectModalOpen: Boolean(t) }),
  explanationLevel: "standard",
  setExplanationLevel: (lvl) => set({ explanationLevel: lvl }),
  cosmicJourneyIndex: 0,
  cosmicJourneyOpen: true,
  setCosmicJourneyOpen: (open) => set({ cosmicJourneyOpen: open }),
  toggleCosmicJourney: () => set((st) => ({ cosmicJourneyOpen: !st.cosmicJourneyOpen })),
  setCosmicJourneyIndex: (idx) => set({ cosmicJourneyIndex: Math.max(0, Math.min(8, idx)) }),
  nextCosmicJourneyStep: () =>
    set((st) => ({ cosmicJourneyIndex: Math.min(8, st.cosmicJourneyIndex + 1) })),
  prevCosmicJourneyStep: () =>
    set((st) => ({ cosmicJourneyIndex: Math.max(0, st.cosmicJourneyIndex - 1) })),
  catalogDashboardOpen: false,
  setCatalogDashboardOpen: (open) => set({ catalogDashboardOpen: open }),
}));
