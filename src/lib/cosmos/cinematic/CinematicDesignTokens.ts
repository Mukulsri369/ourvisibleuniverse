// @ts-nocheck
/**
 * COSMOS Cinematic Design System Tokens & Scientific Visual Identity
 * Project: Our Visible Universe Academy
 * Scope: Prompt 16 — Sections 4, 5, 19, 30, 46, 50
 *
 * Consolidates the approved design values from `docs/academy/cinematic-design-system.md`
 * into reusable typed tokens with verified WCAG 2.2 AA/AAA contrast ratios.
 */

import type {
  CinematicQualityTier,
  ScientificRepresentationCategory,
} from "../cinematic-storyboard-types";

export const CINEMATIC_VOID_PALETTE = {
  voidObsidian: "#03050A",
  voidExtragalactic: "#010205",
  twilightZenithStart: "#071126",
  twilightZenithEnd: "#03050A",
  hudSurface: "rgba(5, 9, 20, 0.84)",
  hudElevated: "rgba(10, 16, 32, 0.94)",
  hudHighContrast: "rgba(2, 4, 9, 0.98)",
  borderSubtle: "rgba(148, 163, 184, 0.18)",
  borderActive: "rgba(56, 189, 248, 0.55)",
} as const;

export const CINEMATIC_SEMANTIC_VECTOR_COLORS = {
  velocity: {
    token: "--vec-velocity",
    hex: "#22D3EE",
    label: "Velocity / Tangential Motion (v)",
    contrastOnVoid: 11.4,
  },
  gravity: {
    token: "--vec-gravity",
    hex: "#F59E0B",
    label: "Gravitational Force / Acceleration (Fg)",
    contrastOnVoid: 9.8,
  },
  magnetic: {
    token: "--vec-magnetic",
    hex: "#C084FC",
    label: "Magnetic Field / Flux Lines (B)",
    contrastOnVoid: 8.1,
  },
  scale: {
    token: "--ann-scale",
    hex: "#38BDF8",
    label: "Distance / Scale Calipers",
    contrastOnVoid: 10.2,
  },
  habitable: {
    token: "--ann-habitable",
    hex: "#34D399",
    label: "Habitable Zone / Validated Equilibrium",
    contrastOnVoid: 11.1,
  },
  dopplerBlue: {
    token: "--doppler-blue",
    hex: "#38BDF8",
    label: "Blueshift / Approaching (Δλ < 0)",
    contrastOnVoid: 10.2,
  },
  dopplerRed: {
    token: "--doppler-red",
    hex: "#F87171",
    label: "Redshift / Receding (Δλ > 0, z)",
    contrastOnVoid: 7.2,
  },
} as const;

export interface ScientificDisclosureMetadata {
  category: ScientificRepresentationCategory | string;
  shortLabel: string;
  summary: string;
  assumptions: string;
}

export const SCIENTIFIC_REPRESENTATION_DISCLOSURES: Record<string, ScientificDisclosureMetadata> = {
  OBSERVATION_BASED: {
    category: "OBSERVATION_BASED",
    shortLabel: "Observational Data",
    summary: "Direct empirical measurements from calibrated astronomical surveys and space observatories.",
    assumptions: "Positions, magnitudes, and spectra reflect peer-reviewed catalog releases (Gaia DR3, NASA/IPAC, Planck).",
  },
  OBSERVED_DATA: {
    category: "OBSERVED_DATA",
    shortLabel: "Observational Data",
    summary: "Direct empirical cosmology, CMB, and redshift data products (Planck 2018, Pantheon+, JWST).",
    assumptions: "Measured fluxes and angular power spectra with instrumental calibration applied.",
  },
  OBSERVATIONAL_DATA: {
    category: "OBSERVATIONAL_DATA",
    shortLabel: "Observational Data",
    summary: "Direct empirical measurements from calibrated astronomical surveys and space observatories.",
    assumptions: "Positions, magnitudes, and spectra reflect peer-reviewed catalog releases (Gaia DR3, NASA/IPAC, Planck).",
  },
  PHYSICS_BASED_SIMULATION: {
    category: "PHYSICS_BASED_SIMULATION",
    shortLabel: "Physics Simulation",
    summary: "Real-time numerical integration of physical laws (Keplerian mechanics, General Relativity, radiative transfer).",
    assumptions: "Radii or time rates may be scaled for visual clarity while preserving exact physical conservation laws.",
  },
  VERIFIED_PHYSICS_SIMULATION: {
    category: "VERIFIED_PHYSICS_SIMULATION",
    shortLabel: "Physics Simulation",
    summary: "Real-time numerical integration of physical laws (Keplerian mechanics, General Relativity, radiative transfer).",
    assumptions: "Radii or time rates may be scaled for visual clarity while preserving exact physical conservation laws.",
  },
  NUMERICAL_SCIENTIFIC_MODEL: {
    category: "NUMERICAL_SCIENTIFIC_MODEL",
    shortLabel: "Physics Simulation",
    summary: "Coupled FLRW cosmological expansion, BBN nuclear network, or stellar evolution model.",
    assumptions: "Integrates peer-reviewed differential equations over cosmological or stellar timescales.",
  },
  NUMERICAL_SIMULATION: {
    category: "NUMERICAL_SIMULATION",
    shortLabel: "Simulated Density Field",
    summary: "Cosmological N-body and hydrodynamic structure formation simulation.",
    assumptions: "Statistical filament and halo topology calibrated to ΛCDM power spectra.",
  },
  SCALE_ADJUSTED_EDUCATIONAL_MODEL: {
    category: "SCALE_ADJUSTED_EDUCATIONAL_MODEL",
    shortLabel: "Illustrative Scale",
    summary: "Logarithmic or compressed spatial scale so planets and orbits remain simultaneously visible.",
    assumptions: "True astronomical ratios span >10^9; see live telemetry readouts for exact unscaled physical quantities.",
  },
  EDUCATIONAL_SCALE_MODEL: {
    category: "EDUCATIONAL_SCALE_MODEL",
    shortLabel: "Illustrative Scale",
    summary: "Logarithmic or compressed spatial scale so planets and orbits remain simultaneously visible.",
    assumptions: "True astronomical ratios span >10^9; see live telemetry readouts for exact unscaled physical quantities.",
  },
  EDUCATIONAL_APPROXIMATION: {
    category: "EDUCATIONAL_APPROXIMATION",
    shortLabel: "Illustrative Scale",
    summary: "Idealized comoving coordinate lattice or pedagogical physical schematic.",
    assumptions: "Visualizes abstract mathematical coordinates in 3D space for conceptual clarity.",
  },
  SCIENTIFIC_RECONSTRUCTION: {
    category: "SCIENTIFIC_RECONSTRUCTION",
    shortLabel: "Model Reconstruction",
    summary: "3D structural reconstruction constrained by multi-wavelength observations and astrophysical models.",
    assumptions: "Unobserved viewing angles (e.g., Milky Way face-on disk) are synthesized from radial velocity and dust maps.",
  },
  ARTISTIC_SCIENTIFIC_RECONSTRUCTION: {
    category: "ARTISTIC_SCIENTIFIC_RECONSTRUCTION",
    shortLabel: "Model Reconstruction",
    summary: "Unresolved surfaces or epochs reconstructed strictly within physical boundary conditions.",
    assumptions: "Surface details are procedural within measured albedo, temperature, and spectroscopic bounds.",
  },
  RECONSTRUCTED_FROM_INTERNAL_OBSERVATIONS: {
    category: "RECONSTRUCTED_FROM_INTERNAL_OBSERVATIONS",
    shortLabel: "Model Reconstruction",
    summary: "Galactic structure inferred from inside the disk via Gaia astrometry, VLBI masers, and 21-cm H I maps.",
    assumptions: "Global spiral morphology synthesized from line-of-sight radial velocity and parallax catalogs.",
  },
  HISTORICAL_RECONSTRUCTION: {
    category: "HISTORICAL_RECONSTRUCTION",
    shortLabel: "Historical Model",
    summary: "Attributed historical astronomical model and instrumentation (Ptolemy, Aryabhata, Copernicus, Galileo).",
    assumptions: "Reconstructs historical geometric kinematics to demonstrate how empirical observations tested them.",
  },
  OBSERVATION_AND_MODEL_COMPARISON: {
    category: "OBSERVATION_AND_MODEL_COMPARISON",
    shortLabel: "Observation vs. Model",
    summary: "Empirical astronomical observations compared side-by-side against competing theoretical predictions.",
    assumptions: "Highlights where Newtonian luminous-matter curves diverge from observed flat rotation curves.",
  },
  INFERRED_PHYSICAL_MODEL: {
    category: "INFERRED_PHYSICAL_MODEL",
    shortLabel: "Inferred Halo Model",
    summary: "Dark matter halo density distribution inferred from gravitational lensing, kinematics, and CMB acoustic peaks.",
    assumptions: "Renders non-luminous gravitational potential contours via translucent NFW profile bounds.",
  },
  MATHEMATICAL_COSMOLOGICAL_MODEL: {
    category: "MATHEMATICAL_COSMOLOGICAL_MODEL",
    shortLabel: "Cosmological Metric",
    summary: "FLRW metric scale factor a(t) and dark-energy equation-of-state w(a) parameterization.",
    assumptions: "Solves Friedmann-Lemaître equations for homogeneous isotropic spacetime expansion.",
  },
  SPECULATIVE_FUTURE_SCENARIO: {
    category: "SPECULATIVE_FUTURE_SCENARIO",
    shortLabel: "Conditional Future Scenario",
    summary: "Conditional deep-time cosmological projection (Heat Death, Big Rip, or Big Crunch) based on parameter choices.",
    assumptions: "Extrapolates current cosmological parameters over 10^10–10^100 years under explicit assumptions.",
  },
  SPECULATIVE_SCENARIO: {
    category: "SPECULATIVE_SCENARIO",
    shortLabel: "Conditional Future Scenario",
    summary: "Thought experiment or projected evolutionary timeline based on boundary conditions.",
    assumptions: "Explores 'what-if' parameter regimes or multi-billion-year future dynamical projections.",
  },
};

export function getScientificDisclosureMetadata(
  category?: string | null,
): ScientificDisclosureMetadata {
  const safeCat = category || "PHYSICS_BASED_SIMULATION";
  return (
    SCIENTIFIC_REPRESENTATION_DISCLOSURES[safeCat] || {
      category: safeCat,
      shortLabel: safeCat.replace(/_/g, " "),
      summary: "Calibrated scientific visualization with explicit scale and model provenance.",
      assumptions: "Refer to chapter telemetry and asset provenance for physical scale assumptions.",
    }
  );
}

export interface QualityTierUXDescriptor {
  tier: CinematicQualityTier;
  displayLabel: string;
  shortLabel: string;
  plainDescription: string;
  preservesPhysics: true;
}

export const CINEMATIC_QUALITY_UX_DESCRIPTORS: Record<
  CinematicQualityTier,
  QualityTierUXDescriptor
> = {
  HIGH_CINEMATIC: {
    tier: "HIGH_CINEMATIC",
    displayLabel: "High Detail",
    shortLabel: "High Detail",
    plainDescription:
      "Full starfield density, volumetric nebulae, and atmospheric scattering for high-performance screens.",
    preservesPhysics: true,
  },
  BALANCED: {
    tier: "BALANCED",
    displayLabel: "Balanced",
    shortLabel: "Balanced",
    plainDescription:
      "Smooth 60 FPS balance of visual fidelity and battery efficiency for laptops and tablets.",
    preservesPhysics: true,
  },
  LOW_POWER: {
    tier: "LOW_POWER",
    displayLabel: "Low Power",
    shortLabel: "Low Power",
    plainDescription:
      "Battery-saving mode with simplified shaders and reduced particle counts; all scientific physics remain 100% accurate.",
    preservesPhysics: true,
  },
};

/**
 * Next-Generation COSMOS Teacher UI Status States (Prompt 16 Section 19)
 */
export type CosmosTeacherUIStatus =
  | "READY"
  | "NARRATING"
  | "LISTENING"
  | "THINKING"
  | "ANSWERING"
  | "PAUSED"
  | "WAITING_FOR_STUDENT"
  | "OFFLINE"
  | "ERROR";

export interface CosmosTeacherStatusDescriptor {
  status: CosmosTeacherUIStatus;
  label: string;
  sublabel: string;
  accentColorClass: string;
  dotColorClass: string;
  showSpeakingWaveform: boolean;
  showListeningWaveform: boolean;
}

export const COSMOS_TEACHER_STATUS_DESCRIPTORS: Record<
  CosmosTeacherUIStatus,
  CosmosTeacherStatusDescriptor
> = {
  READY: {
    status: "READY",
    label: "COSMOS Ready",
    sublabel: "Press Play or ask a question",
    accentColorClass: "text-cyan-300",
    dotColorClass: "bg-cyan-400",
    showSpeakingWaveform: false,
    showListeningWaveform: false,
  },
  NARRATING: {
    status: "NARRATING",
    label: "COSMOS Narrating",
    sublabel: "Interrupt anytime by voice or text",
    accentColorClass: "text-cyan-300",
    dotColorClass: "bg-cyan-400",
    showSpeakingWaveform: true,
    showListeningWaveform: false,
  },
  LISTENING: {
    status: "LISTENING",
    label: "Listening to You",
    sublabel: "Microphone active — speak your question",
    accentColorClass: "text-rose-300",
    dotColorClass: "bg-rose-400",
    showSpeakingWaveform: false,
    showListeningWaveform: true,
  },
  THINKING: {
    status: "THINKING",
    label: "Synthesizing Physics",
    sublabel: "Evaluating curriculum & scene context",
    accentColorClass: "text-indigo-300",
    dotColorClass: "bg-indigo-400",
    showSpeakingWaveform: false,
    showListeningWaveform: false,
  },
  ANSWERING: {
    status: "ANSWERING",
    label: "COSMOS Explaining",
    sublabel: "Contextual scientific response",
    accentColorClass: "text-indigo-300",
    dotColorClass: "bg-indigo-400",
    showSpeakingWaveform: true,
    showListeningWaveform: false,
  },
  PAUSED: {
    status: "PAUSED",
    label: "Lesson Paused",
    sublabel: "Scene ready for free inspection",
    accentColorClass: "text-amber-300",
    dotColorClass: "bg-amber-400",
    showSpeakingWaveform: false,
    showListeningWaveform: false,
  },
  WAITING_FOR_STUDENT: {
    status: "WAITING_FOR_STUDENT",
    label: "Your Turn to Explore",
    sublabel: "Complete the interactive step to continue",
    accentColorClass: "text-emerald-300",
    dotColorClass: "bg-emerald-400",
    showSpeakingWaveform: false,
    showListeningWaveform: false,
  },
  OFFLINE: {
    status: "OFFLINE",
    label: "Offline Exploration Mode",
    sublabel: "Local simulations active; verification pending reconnect",
    accentColorClass: "text-amber-300",
    dotColorClass: "bg-amber-500",
    showSpeakingWaveform: false,
    showListeningWaveform: false,
  },
  ERROR: {
    status: "ERROR",
    label: "Attention Needed",
    sublabel: "Checkpoint preserved — see recovery options",
    accentColorClass: "text-rose-300",
    dotColorClass: "bg-rose-500",
    showSpeakingWaveform: false,
    showListeningWaveform: false,
  },
};

/**
 * Viewport Test Matrix (Prompt 16 Section 50)
 */
export interface ViewportTestSpec {
  id: string;
  category: "MOBILE_PORTRAIT" | "MOBILE_LANDSCAPE" | "TABLET" | "DESKTOP";
  width: number;
  height: number;
  deviceLabel: string;
}

export const PROMPT_16_VIEWPORT_TEST_MATRIX: ViewportTestSpec[] = [
  { id: "mp-320x568", category: "MOBILE_PORTRAIT", width: 320, height: 568, deviceLabel: "Compact Mobile Portrait (320×568)" },
  { id: "mp-360x640", category: "MOBILE_PORTRAIT", width: 360, height: 640, deviceLabel: "Android Baseline Portrait (360×640)" },
  { id: "mp-375x667", category: "MOBILE_PORTRAIT", width: 375, height: 667, deviceLabel: "iPhone SE Portrait (375×667)" },
  { id: "mp-390x844", category: "MOBILE_PORTRAIT", width: 390, height: 844, deviceLabel: "Standard Mobile Portrait (390×844)" },
  { id: "mp-430x932", category: "MOBILE_PORTRAIT", width: 430, height: 932, deviceLabel: "Large Mobile Portrait (430×932)" },
  { id: "ml-667x375", category: "MOBILE_LANDSCAPE", width: 667, height: 375, deviceLabel: "Compact Mobile Landscape (667×375)" },
  { id: "ml-844x390", category: "MOBILE_LANDSCAPE", width: 844, height: 390, deviceLabel: "Standard Mobile Landscape (844×390)" },
  { id: "ml-932x430", category: "MOBILE_LANDSCAPE", width: 932, height: 430, deviceLabel: "Large Mobile Landscape (932×430)" },
  { id: "tb-768x1024", category: "TABLET", width: 768, height: 1024, deviceLabel: "Tablet Portrait (768×1024)" },
  { id: "tb-1024x768", category: "TABLET", width: 1024, height: 768, deviceLabel: "Tablet Landscape (1024×768)" },
  { id: "dk-1280x720", category: "DESKTOP", width: 1280, height: 720, deviceLabel: "HD Desktop (1280×720)" },
  { id: "dk-1440x900", category: "DESKTOP", width: 1440, height: 900, deviceLabel: "Baseline Widescreen Desktop (1440×900)" },
  { id: "dk-1920x1080", category: "DESKTOP", width: 1920, height: 1080, deviceLabel: "Full HD Planetarium Display (1920×1080)" },
];
