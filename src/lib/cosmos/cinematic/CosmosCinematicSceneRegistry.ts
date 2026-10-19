/**
 * COSMOS Cinematic Scene Registry & Grounded Scientific Annotations
 * Project: Our Visible Universe Academy
 * Scope: Prompt 03 — Sections 10, 15, 24, 25, 29
 *
 * Maps all 24 Cosmic Journey modules to their authoritative 3D scene definitions,
 * camera presets, epistemic representation badges, and verified scientific annotations.
 * Never fabricates numerical data; uses IAU, NASA JPL, and Planck 2018 constants.
 */

import type {
  CinematicCameraType,
  CinematicVisualStylePreset,
  ScientificRepresentationCategory,
} from "../cinematic-storyboard-types";
import type { ApprovedSceneId } from "../cosmos-types";
import type { CinematicTimePolicy } from "./CosmosCinematicPlayerState";

/**
 * 13 Supported Scientific Annotation Types (Prompt 03 Section 15)
 */
export type ScientificAnnotationType =
  | "OBJECT_NAME"
  | "DISTANCE"
  | "RADIUS"
  | "RELATIVE_SIZE"
  | "ORBITAL_PERIOD"
  | "VELOCITY"
  | "TEMPERATURE"
  | "MASS"
  | "PHYSICAL_FORCES"
  | "SCIENTIFIC_EQUATION"
  | "OBSERVATION_REFERENCE"
  | "SCALE_INDICATOR"
  | "UNCERTAINTY_OR_ILLUSTRATION_NOTICE";

export interface CinematicScientificAnnotation {
  annotationId: string;
  objectId: string;
  objectName: string;
  type: ScientificAnnotationType;
  label: string;
  value: string;
  unit?: string;
  formulaLatex?: string;
  worldPosition: [number, number, number];
  followsObjectId?: string;
  epistemicNote?: string;
  priority: 1 | 2 | 3; // 1 = highest priority (always shown when labels enabled)
}

export interface CinematicSceneObjectDescriptor {
  objectId: string;
  name: string;
  category:
    | "planet"
    | "star"
    | "moon"
    | "compact_object"
    | "galaxy"
    | "nebula"
    | "spacecraft"
    | "cosmological_structure";
  position: [number, number, number];
  radius: number;
  color: string;
  emissiveColor?: string;
  orbitRadius?: number;
  orbitSpeed?: number;
  physicalMetrics: {
    mass?: string;
    radius?: string;
    distance?: string;
    temperature?: string;
    orbitalPeriod?: string;
    velocity?: string;
    equation?: string;
    observationSource?: string;
  };
}

export interface CinematicSceneDescriptor {
  sceneId: string;
  adapterSceneId: ApprovedSceneId;
  moduleId: string;
  title: string;
  subtitle: string;
  visualStyle: CinematicVisualStylePreset;
  scientificRepresentation: ScientificRepresentationCategory;
  defaultTimePolicy: CinematicTimePolicy;
  defaultCameraPresetId: string;
  defaultCameraArchetype: CinematicCameraType;
  defaultCameraPosition: [number, number, number];
  defaultCameraTarget: [number, number, number];
  nearClip: number;
  farClip: number;
  scaleAdjustmentNotice: string;
  uncertaintyOrIllustrationNotice: string;
  observationReference: string;
  sceneArchetype:
    | "cosmic_zoom"
    | "orbital_mechanics"
    | "black_hole_relativity"
    | "stellar_physics"
    | "galactic_structure"
    | "cosmological_expansion"
    | "observatory_instrument";
  objects: CinematicSceneObjectDescriptor[];
  annotations: CinematicScientificAnnotation[];
}

const MODULE_SCENE_MAP: Record<string, CinematicSceneDescriptor> = {
  "01": {
    sceneId: "m01_cosmic_zoom_hierarchy",
    adapterSceneId: "cosmic_scale",
    moduleId: "01",
    title: "Cosmic Scale Hierarchy: Earth to the Observable Universe",
    subtitle: "7 Logarithmic Spatial Orders of Magnitude",
    visualStyle: "stage1_cosmic_horizon",
    scientificRepresentation: "SCALE_ADJUSTED_EDUCATIONAL_MODEL",
    defaultTimePolicy: "FOLLOW_NARRATION",
    defaultCameraPresetId: "scale_comparison_view",
    defaultCameraArchetype: "scale_comparison_view",
    defaultCameraPosition: [0, 3.8, 12.5],
    defaultCameraTarget: [0, 0, 0],
    nearClip: 0.05,
    farClip: 2000,
    scaleAdjustmentNotice:
      "Scale-Adjusted Educational Model: Radii and inter-body distances are logarithmically compressed so Earth, the Moon, and solar orbits remain simultaneously visible.",
    uncertaintyOrIllustrationNotice:
      "Observable universe horizon radius (46.5 Gly) carries ±0.4 Gly cosmological parameter uncertainty (Planck 2018).",
    observationReference: "IAU 2015 Resolution B3 • NASA JPL DE440 • Planck Collaboration 2018",
    sceneArchetype: "cosmic_zoom",
    objects: [
      {
        objectId: "earth",
        name: "Earth (Terra)",
        category: "planet",
        position: [0, 0, 0],
        radius: 1.45,
        color: "#0284c7",
        emissiveColor: "#0369a1",
        physicalMetrics: {
          mass: "5.972 × 10²⁴ kg",
          radius: "6,371.0 km (Equatorial: 6,378.1 km)",
          distance: "1.000 AU (149,597,870.7 km from Sun)",
          temperature: "288 K (15 °C global mean surface)",
          orbitalPeriod: "365.256 days (1.000 sidereal yr)",
          velocity: "29.78 km/s mean orbital velocity",
          equation: "g = G M_⊕ / R_⊕² = 9.807 m/s²",
          observationSource: "IAU / NASA Goddard Earth Fact Sheet",
        },
      },
      {
        objectId: "karman_atmosphere",
        name: "Kármán Line & Atmosphere",
        category: "planet",
        position: [0, 1.62, 0],
        radius: 1.62,
        color: "#38bdf8",
        physicalMetrics: {
          radius: "h = 100 km above mean sea level",
          distance: "1.57% of Earth's mean radius",
          temperature: "190 K – 400 K (thermospheric transition)",
          observationSource: "Fédération Aéronautique Internationale (FAI)",
        },
      },
      {
        objectId: "moon",
        name: "The Moon (Luna)",
        category: "moon",
        position: [4.2, 0.35, 0],
        radius: 0.4,
        color: "#cbd5e1",
        orbitRadius: 4.2,
        orbitSpeed: 0.38,
        physicalMetrics: {
          mass: "7.342 × 10²² kg (0.0123 M_⊕)",
          radius: "1,737.4 km (0.2727 R_⊕)",
          distance: "384,400 km mean geocentric semi-major axis (≈ 30 Earth diameters)",
          orbitalPeriod: "27.32166 days (sidereal)",
          velocity: "1.022 km/s mean orbital speed",
          observationSource: "NASA Lunar Reconnaissance Orbiter (LRO)",
        },
      },
      {
        objectId: "milky_way_disk",
        name: "Milky Way Galactic Disk",
        category: "galaxy",
        position: [0, -0.4, -2.5],
        radius: 5.5,
        color: "#60a5fa",
        physicalMetrics: {
          mass: "≈ 1.15 × 10¹² M_☉ (including dark halo)",
          radius: "≈ 52,850 ly (diameter ≈ 105,700 ly)",
          distance: "Sun located at R_0 = 26,670 ± 100 ly from Sgr A*",
          velocity: "220–230 km/s Local Standard of Rest",
          orbitalPeriod: "≈ 225–250 Myr (Galactic Year)",
          observationSource: "ESA Gaia DR3 & GRAVITY Collaboration",
        },
      },
    ],
    annotations: [
      {
        annotationId: "ann-m01-earth-name",
        objectId: "earth",
        objectName: "Earth",
        type: "OBJECT_NAME",
        label: "Earth (R_⊕ = 6,371 km)",
        value: "12,742 km mean diameter • 1.00 AU",
        worldPosition: [0, 1.95, 0],
        followsObjectId: "earth",
        priority: 1,
      },
      {
        annotationId: "ann-m01-karman",
        objectId: "karman_atmosphere",
        objectName: "Kármán Line",
        type: "RADIUS",
        label: "Kármán Boundary",
        value: "100 km altitude (Space threshold)",
        worldPosition: [-2.1, 1.4, 0],
        priority: 2,
      },
      {
        annotationId: "ann-m01-moon-dist",
        objectId: "moon",
        objectName: "The Moon",
        type: "DISTANCE",
        label: "Earth–Moon Separation",
        value: "384,400 km (1.28 light-seconds)",
        worldPosition: [4.2, 0.95, 0],
        followsObjectId: "moon",
        priority: 1,
      },
      {
        annotationId: "ann-m01-scale-ind",
        objectId: "milky_way_disk",
        objectName: "Galactic Scale",
        type: "SCALE_INDICATOR",
        label: "1 AU = 149,597,870.7 km",
        value: "1 ly = 9.4607 × 10¹² km (63,241 AU)",
        worldPosition: [0, -2.5, 0],
        priority: 2,
      },
    ],
  },

  "08": {
    sceneId: "m08_orbital_mechanics_lab",
    adapterSceneId: "orbital_mechanics",
    moduleId: "08",
    title: "Newtonian Gravitation, Keplerian Orbits & Barycentric Dynamics",
    subtitle: "Symplectic Velocity-Verlet N-Body Laboratory",
    visualStyle: "stage2_solar_dynamo",
    scientificRepresentation: "PHYSICS_BASED_SIMULATION",
    defaultTimePolicy: "SIMULATION_CONTINUOUS",
    defaultCameraPresetId: "planetary_orbital_shot",
    defaultCameraArchetype: "planetary_orbital_shot",
    defaultCameraPosition: [0, 10.5, 16.0],
    defaultCameraTarget: [0, 0, 0],
    nearClip: 0.05,
    farClip: 2000,
    scaleAdjustmentNotice:
      "Physics-Based Simulation: Gravitational trajectories evolve under exact inverse-square Newtonian dynamics (F = GMm/r²); stellar and planetary radii are magnified for clear vector inspection.",
    uncertaintyOrIllustrationNotice:
      "Velocity and acceleration vectors are rendered in normalized simulation units proportional to instantaneous vis-viva orbital speed.",
    observationReference: "Newton Principia (1687) • Kepler Astronomia Nova (1609) • JPL Horizons",
    sceneArchetype: "orbital_mechanics",
    objects: [
      {
        objectId: "central_star",
        name: "Primary Star (1.0 M_☉)",
        category: "star",
        position: [0, 0, 0],
        radius: 1.35,
        color: "#fbbf24",
        emissiveColor: "#f59e0b",
        physicalMetrics: {
          mass: "1.9885 × 10³⁰ kg (1.00 M_☉)",
          radius: "695,700 km (1.00 R_☉)",
          temperature: "5,772 K effective photosphere",
          equation: "F_g = G (M m) / r²",
          observationSource: "IAU 2015 Nominal Solar Conversion Constants",
        },
      },
      {
        objectId: "orbiting_planet",
        name: "Keplerian Test Planet",
        category: "planet",
        position: [5.2, 0, 0],
        radius: 0.45,
        color: "#38bdf8",
        orbitRadius: 5.2,
        orbitSpeed: 0.65,
        physicalMetrics: {
          mass: "1.00 M_⊕ (5.972 × 10²⁴ kg)",
          distance: "a = 1.00 AU, e = 0.0167 (Circular) to 0.45 (Elliptical)",
          orbitalPeriod: "T² = (4π² / GM) a³ (Kepler's Third Law)",
          velocity: "v = √[GM (2/r − 1/a)] (Vis-Viva Equation)",
          equation: "v_esc = √(2GM / r) = √2 · v_circ",
          observationSource: "Keplerian Two-Body Analytical Solution",
        },
      },
      {
        objectId: "companion_body",
        name: "Outer Resonant Companion",
        category: "planet",
        position: [-7.8, 0, 2.0],
        radius: 0.62,
        color: "#fb923c",
        orbitRadius: 8.1,
        orbitSpeed: 0.34,
        physicalMetrics: {
          mass: "317.8 M_⊕ (1.00 M_J)",
          distance: "5.204 AU semi-major axis",
          orbitalPeriod: "11.862 yr",
          velocity: "13.07 km/s mean orbital speed",
          equation: "r_bary = a · m₂ / (m₁ + m₂)",
          observationSource: "NASA JPL Planetary Ephemeris",
        },
      },
    ],
    annotations: [
      {
        annotationId: "ann-m08-force-eq",
        objectId: "central_star",
        objectName: "Primary Star",
        type: "SCIENTIFIC_EQUATION",
        label: "Universal Gravitation",
        value: "F = G(M₁M₂)/r² • v_circ = √(GM/r)",
        formulaLatex: "F = G\\frac{M_1 M_2}{r^2},\\quad v_{\\text{circ}} = \\sqrt{\\frac{GM}{r}}",
        worldPosition: [0, 2.1, 0],
        followsObjectId: "central_star",
        priority: 1,
      },
      {
        annotationId: "ann-m08-planet-vel",
        objectId: "orbiting_planet",
        objectName: "Keplerian Test Planet",
        type: "VELOCITY",
        label: "Instantaneous Orbital Velocity",
        value: "v(r) = √[GM(2/r − 1/a)] • Equal Areas in Equal Times",
        worldPosition: [5.2, 1.1, 0],
        followsObjectId: "orbiting_planet",
        priority: 1,
      },
      {
        annotationId: "ann-m08-escape",
        objectId: "companion_body",
        objectName: "Escape Threshold",
        type: "PHYSICAL_FORCES",
        label: "Escape Condition (E ≥ 0)",
        value: "v_esc = √2 · v_circ ≈ 1.414 v_circ",
        worldPosition: [-7.8, 1.3, 2.0],
        followsObjectId: "companion_body",
        priority: 2,
      },
    ],
  },

  "14": {
    sceneId: "m14_black_hole_relativity_3d",
    adapterSceneId: "black_hole_lensing",
    moduleId: "14",
    title: "Relativistic Compact Objects: Event Horizon, Photon Sphere & ISCO",
    subtitle: "General Relativistic Spacetime Curvature & Accretion Physics",
    visualStyle: "stage4_relativistic_horizon",
    scientificRepresentation: "PHYSICS_BASED_SIMULATION",
    defaultTimePolicy: "SIMULATION_CONTINUOUS",
    defaultCameraPresetId: "relativistic_horizon_framing",
    defaultCameraArchetype: "relativistic_horizon_framing",
    defaultCameraPosition: [0, 2.8, 10.5],
    defaultCameraTarget: [0, 0, 0],
    nearClip: 0.05,
    farClip: 2000,
    scaleAdjustmentNotice:
      "General Relativistic Ray-Deflection Model: Event horizon (r_s = 2GM/c²), photon sphere (1.5 r_s), and ISCO (3.0 r_s for Schwarzschild) are rendered to exact geometric ratios.",
    uncertaintyOrIllustrationNotice:
      "Relativistic Doppler beaming (approaching side brighter/bluer) is scaled for dynamic range visibility on standard sRGB displays.",
    observationReference:
      "Event Horizon Telescope (EHT) M87* (2019) & Sgr A* (2022) • LIGO GW150914",
    sceneArchetype: "black_hole_relativity",
    objects: [
      {
        objectId: "event_horizon",
        name: "Event Horizon (r_s = 2GM/c²)",
        category: "compact_object",
        position: [0, 0, 0],
        radius: 1.35,
        color: "#000000",
        physicalMetrics: {
          mass: "10 M_☉ (Stellar) to 4.154 × 10⁶ M_☉ (Sgr A*)",
          radius: "r_s = 2GM/c² ≈ 29.5 km (for 10 M_☉) • 1.2 × 10⁷ km (Sgr A*)",
          velocity: "v_esc = c = 299,792.458 km/s at r = r_s",
          equation: "r_s = 2GM / c² • dτ = dt √(1 − r_s/r)",
          observationSource: "Schwarzschild (1916) • EHT Collaboration (2022)",
        },
      },
      {
        objectId: "photon_sphere",
        name: "Photon Sphere & Shadow Boundary",
        category: "compact_object",
        position: [0, 0, 0],
        radius: 2.025,
        color: "#38bdf8",
        physicalMetrics: {
          radius: "r_ph = 1.5 r_s = 3GM/c² (Shadow apparent radius b_crit = √27 GM/c² ≈ 2.6 r_s)",
          velocity: "Unstable circular photon orbits at v = c",
          equation: "r_ph = 3GM / c²",
          observationSource: "Event Horizon Telescope 230 GHz Interferometry",
        },
      },
      {
        objectId: "accretion_disk",
        name: "Relativistic Accretion Disk (ISCO r = 3 r_s)",
        category: "compact_object",
        position: [0, 0, 0],
        radius: 5.2,
        color: "#fb923c",
        emissiveColor: "#f97316",
        physicalMetrics: {
          radius: "r_ISCO = 3 r_s = 6GM/c² (non-spinning) down to 0.5 r_s (maximal Kerr spin)",
          temperature: "10⁷ K – 10¹⁰ K inner X-ray / synchrotron plasma",
          velocity: "v_ISCO ≈ 0.5 c orbital speed at innermost stable circular orbit",
          equation: "L_Edd = 4π G M m_p c / σ_T",
          observationSource: "Chandra X-Ray Observatory & EHT Polarimetry",
        },
      },
      {
        objectId: "relativistic_jets",
        name: "Blandford–Znajek Relativistic Polar Jets",
        category: "compact_object",
        position: [0, 3.8, 0],
        radius: 0.45,
        color: "#60a5fa",
        physicalMetrics: {
          velocity: "Lorentz factor Γ > 10 (v > 0.995 c)",
          temperature: "Non-thermal synchrotron emission (Radio to Gamma-ray)",
          observationSource: "VLBI / HST M87 Relativistic Jet Observations",
        },
      },
    ],
    annotations: [
      {
        annotationId: "ann-m14-horizon",
        objectId: "event_horizon",
        objectName: "Event Horizon",
        type: "SCIENTIFIC_EQUATION",
        label: "Schwarzschild Radius",
        value: "r_s = 2GM/c² (Escape velocity = c)",
        formulaLatex: "r_s = \\frac{2GM}{c^2}",
        worldPosition: [0, 1.85, 0],
        priority: 1,
      },
      {
        annotationId: "ann-m14-photon-sphere",
        objectId: "photon_sphere",
        objectName: "Photon Sphere",
        type: "RADIUS",
        label: "Photon Sphere & Lensed Shadow",
        value: "r_ph = 1.5 r_s • Shadow Radius ≈ 2.6 r_s",
        worldPosition: [-2.6, 1.2, 0],
        priority: 1,
      },
      {
        annotationId: "ann-m14-isco-disk",
        objectId: "accretion_disk",
        objectName: "Accretion Disk",
        type: "TEMPERATURE",
        label: "Relativistic Accretion Disk (ISCO)",
        value: "r_ISCO = 3.0 r_s • Doppler Beaming (T ~ 10⁷–10¹⁰ K)",
        worldPosition: [3.6, -0.6, 0],
        priority: 1,
      },
      {
        annotationId: "ann-m14-obs-ref",
        objectId: "relativistic_jets",
        objectName: "EHT Observation",
        type: "OBSERVATION_REFERENCE",
        label: "Empirical Verification",
        value: "EHT M87* (6.5×10⁹ M_☉) & Sgr A* (4.15×10⁶ M_☉)",
        worldPosition: [0, 4.3, 0],
        priority: 2,
      },
    ],
  },

  "13": {
    sceneId: "m13_galaxy_assembly_dynamics_3d",
    adapterSceneId: "galaxy_assembly",
    moduleId: "13",
    title: "Galactic Architecture: Hubble Sequence, Milky Way, AGN & Mergers",
    subtitle: "Sérsic Profiles, Barred Spiral Anatomy, Rubin Rotation Curves & Tidal Interactions",
    visualStyle: "stage4_relativistic_horizon",
    scientificRepresentation: "OBSERVATION_BASED",
    defaultTimePolicy: "SIMULATION_CONTINUOUS",
    defaultCameraPresetId: "galactic_overview_camera",
    defaultCameraArchetype: "galactic_overview_camera",
    defaultCameraPosition: [0, 5.8, 13.5],
    defaultCameraTarget: [0, 0, 0],
    nearClip: 0.05,
    farClip: 2500,
    scaleAdjustmentNotice:
      "Observation-Based & Physics Simulation: Combines empirical Sérsic surface-brightness profiles, Gaia DR3 / VLBI Milky Way spiral arm reconstruction (R₀ = 8.178 kpc), Rubin 21-cm H I rotation curves, and Toomre tidal merger dynamics.",
    uncertaintyOrIllustrationNotice:
      "The Hubble Tuning Fork is a structural taxonomy (angular momentum & B/T), NOT a chronological evolutionary sequence; our face-on Milky Way view is reconstructed from internal observations.",
    observationReference:
      "ESA Gaia DR3 • HST / JWST Galaxy Atlas • Rubin & Ford (1970) • EHT Sgr A* & M87*",
    sceneArchetype: "galactic_structure",
    objects: [
      {
        objectId: "barred_spiral_specimen",
        name: "Barred Spiral Galaxy (SBbc • Milky Way / NGC 1300 Analog)",
        category: "galaxy",
        position: [0, 0, 0],
        radius: 3.4,
        color: "#60a5fa",
        emissiveColor: "#93c5fd",
        physicalMetrics: {
          mass: "M_total ≈ 1.15 × 10¹² M_☉ (M_★ ≈ 6 × 10¹⁰ M_☉)",
          radius: "D_disk ≈ 30 kpc (100,000 ly) • R₀ = 8.178 kpc (26,670 ly)",
          velocity: "v_rot ≈ 220–230 km/s (Flat out to >30 kpc)",
          equation: "I(R) = I_e exp{-b_n[(R/R_e)^(1/n) - 1]} • v(r) = √(GM(<r)/r)",
          observationSource: "ESA Gaia DR3 • VLBI BeSSeL Survey • Vera Rubin (1970)",
        },
      },
      {
        objectId: "elliptical_galaxy_specimen",
        name: "Giant Elliptical Spheroid (E0–E4 • M87 Analog)",
        category: "galaxy",
        position: [-4.6, 0.4, -1.2],
        radius: 2.1,
        color: "#fbbf24",
        emissiveColor: "#f59e0b",
        physicalMetrics: {
          mass: "M_total ≈ 2–6 × 10¹² M_☉",
          radius: "R_e ≈ 7–15 kpc (Sérsic n ≈ 4 de Vaucouleurs profile)",
          velocity: "Dispersion-supported σ_v ≈ 300–400 km/s",
          equation: "I(R) = I_e exp{-7.67[(R/R_e)^(1/4) - 1]}",
          observationSource: "SDSS / HST Virgo Cluster Survey",
        },
      },
      {
        objectId: "andromeda_m31_system",
        name: "Andromeda Galaxy (M31 • Local Group Companion)",
        category: "galaxy",
        position: [4.4, 0.6, -1.0],
        radius: 2.8,
        color: "#818cf8",
        emissiveColor: "#6366f1",
        physicalMetrics: {
          mass: "M_total ≈ 1.5 × 10¹² M_☉",
          distance: "2.537 Mly (778 kpc)",
          velocity: "v_rad ≈ -110 km/s Galactocentric (-301 km/s heliocentric)",
          equation: "Milkomeda coalescence in t ≈ 4.0–4.5 Gyr",
          observationSource: "HST Proper Motion & Blueshift Spectroscopy",
        },
      },
      {
        objectId: "smbh_accretion_core",
        name: "Galactic Nucleus & SMBH Engine (Sgr A* / Active AGN)",
        category: "compact_object",
        position: [0, 0, 0],
        radius: 0.9,
        color: "#f97316",
        emissiveColor: "#fb923c",
        physicalMetrics: {
          mass: "Sgr A*: 4.154 × 10⁶ M_☉ • Quasars: 10⁸–10¹⁰ M_☉",
          equation: "L_Edd = 4π G M_BH m_p c / σ_T ≈ 1.26×10³⁸ (M/M_☉) erg/s",
          observationSource: "Keck / VLT GRAVITY S2 Orbit • Event Horizon Telescope",
        },
      },
    ],
    annotations: [
      {
        annotationId: "ann-m13-hubble",
        objectId: "barred_spiral_specimen",
        objectName: "Hubble-de Vaucouleurs Sequence",
        type: "SCIENTIFIC_EQUATION",
        label: "Sérsic Profile & Morphological Taxonomy",
        value: "I(R) = I_e exp{-b_n[(R/R_e)^(1/n) - 1]} (Not an Age Clock)",
        worldPosition: [0, 2.8, 0],
        priority: 1,
      },
      {
        annotationId: "ann-m13-rubin",
        objectId: "barred_spiral_specimen",
        objectName: "Flat Galactic Rotation Curve",
        type: "VELOCITY",
        label: "v(r) = √(G M(<r) / r) ≈ 220 km/s",
        value: "Requires Extended Dark Matter Halo M(<r) ∝ r",
        worldPosition: [-3.2, -1.8, 0],
        priority: 1,
      },
      {
        annotationId: "ann-m13-m31",
        objectId: "andromeda_m31_system",
        objectName: "Local Group Approach",
        type: "DISTANCE",
        label: "Andromeda (M31) at 2.54 Mly (778 kpc)",
        value: "Blueshifted Approach v_rad ≈ -110 km/s (Gravity > Hubble Flow)",
        worldPosition: [4.4, 2.6, -1.0],
        priority: 2,
      },
    ],
  },

  "15": {
    sceneId: "m15_cosmic_web_superclusters_3d",
    adapterSceneId: "cosmic_expansion",
    moduleId: "15",
    title: "Cosmic Hierarchy: Galaxy Groups, X-Ray Clusters, Laniakea & Cosmic Web",
    subtitle:
      "Virial Dynamics, Intracluster Medium, Peculiar Velocity Basins & Zel'dovich Collapse",
    visualStyle: "stage4_relativistic_horizon",
    scientificRepresentation: "OBSERVATION_BASED",
    defaultTimePolicy: "SIMULATION_CONTINUOUS",
    defaultCameraPresetId: "galactic_overview_camera",
    defaultCameraArchetype: "galactic_overview_camera",
    defaultCameraPosition: [0, 6.2, 13.8],
    defaultCameraTarget: [0, 0, 0],
    nearClip: 0.05,
    farClip: 2500,
    scaleAdjustmentNotice:
      "Multi-Scale Cosmological Atlas: Spans Local Group (~3 Mpc), Rich Clusters (~5–10 Mpc), Laniakea Supercluster (~160 Mpc), and the Cosmic Web (>300 Mpc) using Cosmicflows-4 peculiar velocities and SDSS/DESI redshift surveys.",
    uncertaintyOrIllustrationNotice:
      "Cluster mass budget (~85% Dark Matter, ~12% X-ray ICM gas, ~3% stars) uses false-color multiwavelength overlays; Laniakea is a kinematic watershed basin, NOT a virialized bound cluster.",
    observationReference:
      "Cosmicflows-4 (Tully et al.) • Chandra X-Ray • SDSS / 2dFGRS / DESI • IllustrisTNG",
    sceneArchetype: "galactic_structure",
    objects: [
      {
        objectId: "hot_xray_icm_plasma_halo",
        name: "Rich Galaxy Cluster & X-Ray ICM (Virgo / Coma / Bullet Cluster)",
        category: "galaxy",
        position: [0, 0, 0],
        radius: 3.2,
        color: "#ec4899",
        emissiveColor: "#f43f5e",
        physicalMetrics: {
          mass: "M_200 ≈ 10¹⁴ – 2 × 10¹⁵ M_☉ (~85% DM, ~12% X-ray ICM, ~3% Stars)",
          radius: "R_200 ≈ 2–3 Mpc",
          temperature: "T_ICM ≈ 10⁷ – 10⁸ K (k_B T ≈ 2–10 keV Thermal Bremsstrahlung)",
          velocity: "σ_v ≈ 800 – 1,200 km/s",
          equation: "M_vir ≈ 3 R_vir σ_v² / G • ε_ff ∝ n_e² T^(1/2)",
          observationSource: "Chandra / XMM-Newton X-Ray & Weak Lensing Surveys",
        },
      },
      {
        objectId: "laniakea_velocity_streamlines",
        name: "Laniakea Supercluster Kinematic Basin (~160 Mpc / 520 Mly)",
        category: "galaxy",
        position: [0, 0, 0],
        radius: 5.0,
        color: "#38bdf8",
        emissiveColor: "#0ea5e9",
        physicalMetrics: {
          mass: "M_basin ≈ 10¹⁷ M_☉ (~100,000 Galaxies)",
          radius: "D ≈ 160 Mpc (520 million ly)",
          velocity: "Local Group v_pec = 627 ± 22 km/s toward Great Attractor / Shapley",
          equation: "v_pec = v_obs - H₀ d • ∇ · v_pec < 0",
          observationSource: "Tully et al. (2014) Nature • Cosmicflows-4 Catalog",
        },
      },
      {
        objectId: "cosmic_web_filament_bridges",
        name: "Cosmic Web Filaments, Zel'dovich Walls & Underdense Voids",
        category: "galaxy",
        position: [3.2, 0.8, -1.0],
        radius: 4.5,
        color: "#a855f7",
        emissiveColor: "#9333ea",
        physicalMetrics: {
          radius: "Filaments: 30–100 Mpc • Voids: 30–150 Mpc (~80% Volume, δ ≈ -0.8)",
          temperature: "WHIM Baryons: T ≈ 10⁵ – 10⁷ K",
          equation: "ρ(x,t) = ρ̄ / |(1 - Dλ₁)(1 - Dλ₂)(1 - Dλ₃)| • r_BAO ≈ 147 Mpc",
          observationSource: "SDSS / DESI Redshift Surveys • Millennium / IllustrisTNG",
        },
      },
    ],
    annotations: [
      {
        annotationId: "ann-m15-cluster-budget",
        objectId: "hot_xray_icm_plasma_halo",
        objectName: "Galaxy Cluster Mass Partition",
        type: "MEASURED_VALUE",
        label: "~85% Dark Matter • ~12% Hot X-Ray ICM Gas • ~3% Stars",
        value: "T_ICM ~ 10⁷–10⁸ K • Bullet Cluster 1E 0657-558 Proof",
        worldPosition: [0, 3.1, 0],
        priority: 1,
      },
      {
        annotationId: "ann-m15-laniakea",
        objectId: "laniakea_velocity_streamlines",
        objectName: "Laniakea Basin of Attraction",
        type: "VELOCITY",
        label: "v_pec = v_obs - H₀ d • 160 Mpc (520 Mly) Watershed",
        value: "Kinematic Flow Toward Great Attractor (Not Virialized)",
        worldPosition: [0, -3.0, 0],
        priority: 1,
      },
    ],
  },

  "16": {
    sceneId: "m16_dark_sector_lensing_3d",
    adapterSceneId: "cosmic_expansion",
    moduleId: "16",
    title: "The Dark Sector: Dark Matter Halos, Gravitational Lensing & Dark Energy",
    subtitle: "Planck ΛCDM Inventory, NFW Profiles, Einstein Rings, SN Ia & DESI w(a) Tests",
    visualStyle: "stage4_relativistic_horizon",
    scientificRepresentation: "OBSERVATION_AND_MODEL_COMPARISON",
    defaultTimePolicy: "SIMULATION_CONTINUOUS",
    defaultCameraPresetId: "galactic_overview_camera",
    defaultCameraArchetype: "galactic_overview_camera",
    defaultCameraPosition: [0, 5.6, 13.4],
    defaultCameraTarget: [0, 0, 0],
    nearClip: 0.05,
    farClip: 2500,
    scaleAdjustmentNotice:
      "Observational & Cosmological Model Comparison: Separates direct astronomical measurements (rotation curves, Einstein rings θ_E, SN Ia distance moduli μ, BAO r_d) from inferred quantities (NFW halos, Ω_Λ = 68.3%, Ω_c = 26.8%) and open particle/field hypotheses.",
    uncertaintyOrIllustrationNotice:
      "Dark matter halos and dark energy density curves are mathematical/inferred representations (NOT visible glowing fluids); DESI 2024–2026 w(a) hints motivate continued study without disproving flat ΛCDM.",
    observationReference:
      "Planck 2018 • Rubin (1970) • Clowe et al. (2006) • Riess & Perlmutter (1998) • DESI (2024–2026)",
    sceneArchetype: "cosmological_expansion",
    objects: [
      {
        objectId: "nfw_spherical_dark_halo",
        name: "NFW Dark Matter Halo & Embedded Baryonic Disk",
        category: "galaxy",
        position: [0, 0, 0],
        radius: 4.2,
        color: "#6366f1",
        emissiveColor: "#4f46e5",
        physicalMetrics: {
          mass: "Ω_c = 26.8% Cosmic Budget • Milky Way M_200 ≈ 1.15 × 10¹² M_☉",
          radius: "R_200 ≈ 200–250 kpc (≈10–15× Larger than 15 kpc Stellar Disk)",
          velocity: "Sustains v_rot ≈ 220 km/s out to >30 kpc",
          equation: "ρ_NFW(r) = ρ₀ / [(r/r_s)(1 + r/r_s)²]",
          observationSource: "21-cm H I Rotation Curves • Weak Lensing • Planck CMB",
        },
      },
      {
        objectId: "einstein_ring_and_giant_arcs",
        name: "Gravitational Lensing Optical Bench (Einstein Ring θ_E)",
        category: "galaxy",
        position: [-3.4, 0.4, 0.8],
        radius: 2.4,
        color: "#38bdf8",
        emissiveColor: "#0284c7",
        physicalMetrics: {
          radius: "θ_E = √[(4GM/c²)(D_LS / (D_L D_S))] (~10–45 arcsec for Clusters)",
          equation: "α̂ = 4GM / (c² b) (General Relativity = 2× Newtonian)",
          observationSource: "HST / JWST Strong Lensing Clusters & Bullet Cluster (8σ)",
        },
      },
      {
        objectId: "hubble_diagram_distance_modulus_plot",
        name: "Type Ia Supernova Hubble Diagram & Accelerating FLRW Expansion",
        category: "galaxy",
        position: [3.4, 0.4, 0.8],
        radius: 2.6,
        color: "#10b981",
        emissiveColor: "#059669",
        physicalMetrics: {
          mass: "Ω_Λ = 68.3% Dark Energy • SN Ia M_Ch ≈ 1.44 M_☉ (M_B ≈ -19.3)",
          velocity: "Transition z_t ≈ 0.64 (~6 Gyr ago) • H₀ ≈ 67.4 (CMB) vs 73.0 (SH0ES)",
          equation: "ä/a = -(4πG/3)(ρ + 3P/c²) • w(a) = w₀ + w_a(1 - a)",
          observationSource: "High-Z SN Search & Supernova Cosmology Project (1998) • DESI BAO",
        },
      },
    ],
    annotations: [
      {
        annotationId: "ann-m16-budget",
        objectId: "nfw_spherical_dark_halo",
        objectName: "Planck 2018 Cosmic Energy Pie",
        type: "MEASURED_VALUE",
        label: "68.3% Dark Energy (Ω_Λ) • 26.8% Dark Matter (Ω_c) • 4.9% Baryons",
        value: "Stars ≈ 0.5% • ρ_NFW(r) ∝ (r/r_s)⁻¹(1 + r/r_s)⁻²",
        worldPosition: [0, 3.2, 0],
        priority: 1,
      },
      {
        annotationId: "ann-m16-lensing",
        objectId: "einstein_ring_and_giant_arcs",
        objectName: "General Relavitational Lensing",
        type: "SCIENTIFIC_EQUATION",
        label: "α̂ = 4GM / (c²b) • θ_E = √[(4GM/c²)(D_LS / D_L D_S)]",
        value: "Maps Total Mass Σ(R) Independent of Baryonic Gas Temperature",
        worldPosition: [-3.4, 2.6, 0.8],
        priority: 1,
      },
      {
        annotationId: "ann-m16-de",
        objectId: "hubble_diagram_distance_modulus_plot",
        objectName: "Accelerating Expansion & Epistemic Boundary",
        type: "UNCERTAINTY_OR_ILLUSTRATION_NOTICE",
        label: "ä/a ∝ -(ρ + 3P/c²) • Λ has w = -1 • DESI w(a) Under Active Study",
        value: "[Measured: z, m_B, θ_E] • [Inferred: Ω_m, Ω_Λ] • [Hypothesis: WIMPs, w(a)]",
        worldPosition: [3.4, 2.6, 0.8],
        priority: 2,
      },
    ],
  },

  "17": {
    sceneId: "scene-m17-big-bang-early-universe",
    moduleId: "17",
    title: "The Big Bang & Early Universe: Expanding Metric, BBN & Planck CMB",
    representationCategory: "OBSERVED_DATA",
    epistemicBadgeLabel: "OBSERVED DATA + ΛCDM EARLY-UNIVERSE THERMODYNAMICS",
    scaleNote:
      "Logarithmic epoch coordinate compressing t = 10⁻³⁶ s through 13.8 Gyr; CMB temperature fluctuations amplified 10⁵× for visual legibility.",
    sceneArchetype: "cosmological_expansion",
    defaultCameraPosition: [0, 6.2, 16.5],
    defaultCameraTarget: [0, 0, 0],
    fov: 45,
    nearClip: 0.1,
    farClip: 1000,
    ambientLightIntensity: 0.24,
    keyLightPosition: [14, 18, 14],
    keyLightIntensity: 1.6,
    keyLightColor: "#fff7ed",
    objects: [
      {
        objectId: "comoving_expansion_grid",
        name: "3D Comoving Coordinate Grid & Expanding Scale Factor a(t)",
        category: "galaxy",
        position: [-3.6, 0, 0],
        radius: 2.8,
        color: "#f59e0b",
        emissiveColor: "#d97706",
        physicalMetrics: {
          mass: "Flat FLRW Geometry (Ω_K ≈ 0.000 ± 0.002)",
          radius: "Scale Factor a(t) = 1 / (1 + z) • No Spatial Center or Edge",
          velocity: "v = H₀ d (H₀ ≈ 67.4 km/s/Mpc Planck • 73.0 km/s/Mpc SH0ES)",
          equation: "1 + z = λ_obs / λ_emit = a₀ / a(t)",
          observationSource: "Slipher, Lemaître (1927), Hubble (1929) & DESI BAO",
        },
      },
      {
        objectId: "bbn_nuclear_reactor_core",
        name: "Big Bang Nucleosynthesis (t ≈ 3 min) & Recombination (z ≈ 1090)",
        category: "star",
        position: [0, 0, 0],
        radius: 2.6,
        color: "#ef4444",
        emissiveColor: "#dc2626",
        physicalMetrics: {
          mass: "Primordial Mass Fractions: ~75% ¹H, ~25% ⁴He (Y_p ≈ 0.245)",
          temperature: "T_BBN ≈ 9 × 10⁸ K (k_B T ≈ 80 keV) → T_rec ≈ 3000 K (378,000 yr)",
          equation: "Y_p = 2(n/p) / [1 + (n/p)] ≈ 2(1/7)/(8/7) = 0.25",
          observationSource: "Quasar Absorption D/H & Primordial Helium Spectroscopy",
        },
      },
      {
        objectId: "cmb_last_scattering_sphere",
        name: "Surface of Last Scattering & Planck 2018 CMB Anisotropy Sphere",
        category: "nebula",
        position: [3.6, 0, 0],
        radius: 3.0,
        color: "#38bdf8",
        emissiveColor: "#0284c7",
        physicalMetrics: {
          temperature: "T₀ = 2.72548 ± 0.00057 K • ΔT/T ≈ 10⁻⁵ (±18–200 μK)",
          radius: "Comoving Sound Horizon r_s ≈ 147 Mpc (First Peak ℓ₁ ≈ 220 ≈ 1°)",
          equation: "I_ν(T) = (2hν³/c²) / [exp(hν / k_B T) - 1]",
          observationSource: "COBE FIRAS (1992), WMAP, Planck (2018)",
        },
      },
    ],
    annotations: [
      {
        annotationId: "ann-m17-expansion",
        objectId: "comoving_expansion_grid",
        objectName: "Metric Expansion vs Explosion Misconception",
        type: "SCIENTIFIC_EQUATION",
        label: "v = H₀ d • 1 + z = a₀ / a(t) • Everywhere Is the Center",
        value: "Space stretches between unbound galaxy clusters; bound galaxies do not expand",
        worldPosition: [-3.6, 2.8, 0],
        priority: 1,
      },
      {
        annotationId: "ann-m17-bbn",
        objectId: "bbn_nuclear_reactor_core",
        objectName: "Big Bang Nucleosynthesis Yield",
        type: "MEASURED_VALUE",
        label: "t ≈ 180 s: ~75% Hydrogen (¹H) • ~25% Helium-4 (⁴He) by Mass",
        value: "Deuterium Bottleneck at T ≈ 9×10⁸ K • n/p freezes at ~1:6 → ~1:7",
        worldPosition: [0, 2.8, 0],
        priority: 1,
      },
      {
        annotationId: "ann-m17-cmb",
        objectId: "cmb_last_scattering_sphere",
        objectName: "Cosmic Microwave Background",
        type: "MEASURED_VALUE",
        label: "z ≈ 1090 (t ≈ 378,000 yr): T = 3000 K → 2.7255 K Today",
        value: "Acoustic Peaks ℓ₁ ≈ 220 (Ω_K ≈ 0), ℓ₂ ≈ 540 (Ω_b), ℓ₃ ≈ 810 (Ω_c)",
        worldPosition: [3.6, 2.8, 0],
        priority: 1,
      },
    ],
  },

  "18": {
    sceneId: "scene-m18-cosmic-history",
    moduleId: "18",
    title: "13.8 Billion Years of Cosmic History: Dark Ages, First Stars & Galaxy Evolution",
    representationCategory: "NUMERICAL_SCIENTIFIC_MODEL",
    epistemicBadgeLabel: "OBSERVED DATA + COSMOLOGICAL STRUCTURE & REIONIZATION SIMULATION",
    scaleNote:
      "13.8 Gyr timeline compressed into interactive 3D epochs and Carl Sagan's 365-day Cosmic Calendar (1 day ≈ 37.8 Myr; 1 second ≈ 437.5 yr).",
    sceneArchetype: "cosmological_expansion",
    defaultCameraPosition: [0, 5.8, 16.0],
    defaultCameraTarget: [0, 0, 0],
    fov: 45,
    nearClip: 0.1,
    farClip: 1000,
    ambientLightIntensity: 0.22,
    keyLightPosition: [12, 16, 12],
    keyLightIntensity: 1.65,
    keyLightColor: "#e0f2fe",
    objects: [
      {
        objectId: "pop_iii_first_stars_halos",
        name: "Cosmic Dark Ages, 21-cm Hyperfine Line & Population III First Stars",
        category: "star",
        position: [-3.6, 0, 0],
        radius: 2.6,
        color: "#60a5fa",
        emissiveColor: "#2563eb",
        physicalMetrics: {
          mass: "Pop III Stars: 10–300 M_☉ (Zero-Metallicity Z = 0, H₂ Cooling)",
          temperature: "T_eff ≈ 50,000–100,000 K • Pair-Instability SNe (140–260 M_☉)",
          equation: "λ_21 = 21.106 cm (ν = 1420.4 MHz) • M_J ∝ T^(3/2) ρ^(-1/2)",
          observationSource: "JWST High-z Galaxies (JADES-GS-z14-0 at z ≈ 14.32) & Planck τ_e",
        },
      },
      {
        objectId: "reionization_swiss_cheese_igm",
        name: "Epoch of Reionization Bubbles (z ≈ 15 → 6) & Cosmic Noon (z ≈ 2)",
        category: "nebula",
        position: [0, 0, 0],
        radius: 2.8,
        color: "#a855f7",
        emissiveColor: "#7e22ce",
        physicalMetrics: {
          mass: "Madau–Lilly Peak SFRD at z ≈ 2 (~10 Gyr ago, ~10× Today's Rate)",
          temperature: "UV Photons (E > 13.6 eV) Clear Neutral IGM by z ≈ 6 (t ≈ 1 Gyr)",
          equation: "ψ(z) = 0.015 (1+z)^2.7 / [1 + ((1+z)/2.9)^5.6] M_☉ yr⁻¹ Mpc⁻³",
          observationSource: "Gunn–Peterson Troughs, Lyman-α Emitters & ALMA / HST / JWST",
        },
      },
      {
        objectId: "solar_system_presolar_nebula",
        name: "Solar System Birth at t ≈ 9.2 Gyr (z ≈ 0.45) & 365-Day Cosmic Calendar",
        category: "planet",
        position: [3.6, 0, 0],
        radius: 2.6,
        color: "#fbbf24",
        emissiveColor: "#d97706",
        physicalMetrics: {
          mass: "Population I Sun (Z ≈ 0.0142) • CAIs = 4,567.3 ± 0.16 Myr Ago",
          radius: "Cosmic Calendar Sept 2 (Day 245/365) • Recorded History = Last 14 s",
          equation: "Z_⊙ = 1.42% Heavy Elements Synthesized by Earlier Stars",
          observationSource: "Meteoritic Pb-Pb Isochrons, r-Process Actinides & Zircon Dating",
        },
      },
    ],
    annotations: [
      {
        annotationId: "ann-m18-pop3",
        objectId: "pop_iii_first_stars_halos",
        objectName: "Cosmic Dawn & Population III Stars",
        type: "SCIENTIFIC_EQUATION",
        label: "Z = 0 → H₂ Cooling (T ~ 200 K) → Massive Pop III Stars (10–300 M_☉)",
        value: "Pair-Instability SNe disperse first C, O, Mg, Si, Fe into the IGM",
        worldPosition: [-3.6, 2.8, 0],
        priority: 1,
      },
      {
        annotationId: "ann-m18-noon",
        objectId: "reionization_swiss_cheese_igm",
        objectName: "Reionization & Cosmic Noon",
        type: "MEASURED_VALUE",
        label: "Reionization Complete by z ≈ 6 (1 Gyr) • Cosmic Noon Peak at z ≈ 2",
        value: "Half of all stars in the universe formed between z ≈ 3 and z ≈ 1",
        worldPosition: [0, 2.8, 0],
        priority: 1,
      },
      {
        annotationId: "ann-m18-solar",
        objectId: "solar_system_presolar_nebula",
        objectName: "Solar System Arrival on the Cosmic Stage",
        type: "MEASURED_VALUE",
        label: "t ≈ 9.2 Gyr (4.567 Gyr Ago): Solar System Forms after 67% of Cosmic History",
        value: "Cosmic Calendar: Sept 2 (Sun) • Dec 31 23:52 (Humans) • Last 1 s (Modern Science)",
        worldPosition: [3.6, 2.8, 0],
        priority: 1,
      },
    ],
  },

  "19": {
    sceneId: "scene-m19-fate-of-universe",
    moduleId: "19",
    title: "The Fate of the Universe: Friedmann Destiny, Milkomeda & Deep Future",
    representationCategory: "SPECULATIVE_FUTURE",
    epistemicBadgeLabel: "EXTRAPOLATED FROM ΛCDM COSMOLOGY & STELLAR/RELATIVISTIC PHYSICS",
    scaleNote:
      "Logarithmic deep-future timeline spanning 10⁰ to 10¹⁰⁰ years; local bound dynamics contrasted against global de Sitter horizon expansion.",
    sceneArchetype: "cosmological_expansion",
    defaultCameraPosition: [0, 6.0, 16.2],
    defaultCameraTarget: [0, 0, 0],
    fov: 45,
    nearClip: 0.1,
    farClip: 1000,
    ambientLightIntensity: 0.22,
    keyLightPosition: [14, 16, 14],
    keyLightIntensity: 1.55,
    keyLightColor: "#f3e8ff",
    objects: [
      {
        objectId: "friedmann_destiny_manifold",
        name: "Friedmann Density Parameter Ω₀ & Four Cosmic Destiny Trajectories",
        category: "galaxy",
        position: [-3.6, 0, 0],
        radius: 2.8,
        color: "#10b981",
        emissiveColor: "#059669",
        physicalMetrics: {
          mass: "ρ_crit = 3H₀²/(8πG) ≈ 8.5 × 10⁻²⁷ kg/m³ (~5 H atoms/m³)",
          velocity: "Ω_m = 0.315, Ω_Λ = 0.685, Ω_K ≈ 0.000 • Transition z_t ≈ 0.64",
          equation: "H²(a) = H₀²[Ω_r a⁻⁴ + Ω_m a⁻³ + Ω_K a⁻² + Ω_Λ a⁻³⁽¹⁺ʷ⁾]",
          observationSource: "Planck 2018, Type Ia Supernovae & DESI BAO",
        },
      },
      {
        objectId: "milkomeda_merger_and_red_giant",
        name: "Local Future: Solar Red Giant (+5 Gyr) & Milkomeda Merger (+4.5 Gyr)",
        category: "star",
        position: [0, 0, 0],
        radius: 2.6,
        color: "#f97316",
        emissiveColor: "#ea580c",
        physicalMetrics: {
          mass: "MW + M31 Bound Local Group • d ≈ 770 kpc, v_rad ≈ -110 km/s",
          temperature: "Sun L(+1.1 Gyr) ≈ 1.1 L_☉ (Moist Greenhouse) • Red Giant R ≈ 1 AU (+7.6 Gyr)",
          equation: "d_H = c / H_∞ ≈ 16.5 Gly (t > 100–150 Gyr Local Group Isolation)",
          observationSource: "HST / Gaia M31 Proper Motion & Stellar Evolution Models",
        },
      },
      {
        objectId: "five_ages_hawking_evaporation",
        name: "The Five Ages of the Universe & Hawking Black Hole Evaporation",
        category: "black_hole",
        position: [3.6, 0, 0],
        radius: 2.8,
        color: "#8b5cf6",
        emissiveColor: "#6d28d9",
        physicalMetrics: {
          mass: "Stelliferous Era Ends ~10¹⁴ yr • Black Hole Era 10⁴⁰–10¹⁰⁰ yr",
          temperature: "T_H = ℏc³ / (8πGMk_B) ≈ 6.17 × 10⁻⁸ (M_☉/M) K",
          equation: "t_evap = 5120πG²M³ / (ℏc⁴) ≈ 2.1 × 10⁶⁷ (M/M_☉)³ yr",
          observationSource: "Hawking (1974) Semiclassical Quantum Field Theory in Curved Spacetime",
        },
      },
    ],
    annotations: [
      {
        annotationId: "ann-m19-destiny",
        objectId: "friedmann_destiny_manifold",
        objectName: "Geometry vs Destiny in ΛCDM",
        type: "SCIENTIFIC_EQUATION",
        label: "w = -1 → Big Freeze (Heat Death) • w < -1 → Big Rip at Finite t_rip",
        value: "With Dark Energy, a spatially flat universe (Ω_K = 0) accelerates forever",
        worldPosition: [-3.6, 2.8, 0],
        priority: 1,
      },
      {
        annotationId: "ann-m19-local",
        objectId: "milkomeda_merger_and_red_giant",
        objectName: "Local Bound Gravity Beats Global Expansion",
        type: "MEASURED_VALUE",
        label: "+1.1 Gyr Ocean Loss • +4.5 Gyr Milkomeda Merger • +7.6 Gyr Solar White Dwarf",
        value: "At t > 100 Gyr, all galaxies outside Milkomeda cross the de Sitter horizon",
        worldPosition: [0, 2.8, 0],
        priority: 1,
      },
      {
        annotationId: "ann-m19-hawking",
        objectId: "five_ages_hawking_evaporation",
        objectName: "Deep Future Epistemic Horizon",
        type: "UNCERTAINTY_OR_ILLUSTRATION_NOTICE",
        label: "t_evap ∝ M³ (~10⁶⁷ yr for 1 M_☉; ~10¹⁰⁰ yr for 10¹¹ M_☉ SMBH)",
        value: "[Extrapolated: Red Dwarfs 10¹³ yr, Hawking Radiation] • [Unconfirmed: Proton Decay]",
        worldPosition: [3.6, 2.8, 0],
        priority: 2,
      },
    ],
  },

  "20": {
    sceneId: "scene-m20-history-of-astronomy",
    moduleId: "20",
    title: "History of Astronomy: From Ancient Skies to Multi-Messenger Cosmology",
    representationCategory: "HISTORICAL_RECONSTRUCTION",
    epistemicBadgeLabel: "HISTORICAL RECONSTRUCTION + EMPIRICAL OBSERVATIONAL BREAKTHROUGHS",
    scaleNote:
      "Synthesizes historical instruments, Keplerian/Newtonian geometry, spectroscopy, the 1920 Great Debate, and modern multi-messenger observatories.",
    sceneArchetype: "observatory_instrument",
    defaultCameraPosition: [0, 5.6, 15.8],
    defaultCameraTarget: [0, 0, 0],
    fov: 45,
    nearClip: 0.1,
    farClip: 1000,
    ambientLightIntensity: 0.25,
    keyLightPosition: [14, 18, 14],
    keyLightIntensity: 1.65,
    keyLightColor: "#fef3c7",
    objects: [
      {
        objectId: "eratosthenes_and_copernican_orrery",
        name: "Ancient Geodesy (Eratosthenes 7.2°) & Copernican/Keplerian Revolution",
        category: "planet",
        position: [-3.6, 0, 0],
        radius: 2.7,
        color: "#f59e0b",
        emissiveColor: "#d97706",
        physicalMetrics: {
          radius: "Eratosthenes C ≈ (360°/7.2°) × 5000 stadia ≈ 40,000 km",
          velocity: "Tycho (±1 arcmin) → Kepler Mars Ellipse (e = 0.0934, 8 arcmin discrepancy)",
          equation: "P² = a³ • F = G m₁ m₂ / r² • Full Venus Phases Refute Ptolemy (1610)",
          observationSource: "Almagest, De revolutionibus (1543), Astronomia nova (1609), Sidereus Nuncius (1610)",
        },
      },
      {
        objectId: "spectroscopy_and_leavitt_cepheid",
        name: "Bessel Parallax (1838), Fraunhofer Spectroscopy & Leavitt/Hubble Cepheids",
        category: "star",
        position: [0, 0, 0],
        radius: 2.6,
        color: "#38bdf8",
        emissiveColor: "#0284c7",
        physicalMetrics: {
          radius: "61 Cygni p = 0.314\" (d ≈ 10.4 ly) • M31 Cepheid V1 (P = 31.4 d, d ≈ 770 kpc)",
          temperature: "1868 Helium 587.6 nm in Solar Chromosphere • Payne-Gaposchkin (1925) ~98% H+He",
          equation: "M_V = a log₁₀(P) + b • m - M = 5 log₁₀(d / 10 pc)",
          observationSource: "Bessel (1838), Kirchhoff & Bunsen (1859), Leavitt (1912), Hubble (1923)",
        },
      },
      {
        objectId: "multimessenger_observatory_nexus",
        name: "20th–21st Century Multi-Messenger Frontier (CMB, Exoplanets, LIGO, EHT, JWST)",
        category: "spacecraft",
        position: [3.6, 0, 0],
        radius: 2.8,
        color: "#10b981",
        emissiveColor: "#059669",
        physicalMetrics: {
          mass: "GW150914 (36+29 M_☉ → 62 M_☉) • GW170817 (Δt = 1.7 s) • M87* (6.5×10⁹ M_☉)",
          velocity: "6,000+ Confirmed Exoplanets (51 Peg b 1995) • JWST L2 6.5 m IR Mirror",
          equation: "h = ΔL / L ≈ 10⁻²¹ • θ = 1.22 λ / D",
          observationSource: "Penzias & Wilson (1965), Mayor & Queloz (1995), LIGO/Virgo, EHT, JWST",
        },
      },
    ],
    annotations: [
      {
        annotationId: "ann-m20-copernican",
        objectId: "eratosthenes_and_copernican_orrery",
        objectName: "Observation Drives Model Replacement",
        type: "SCIENTIFIC_EQUATION",
        label: "Tycho's 8-Arcminute Mars Discrepancy + Galileo's Full Phases of Venus",
        value: "Replaced 1,400 years of Ptolemaic epicycles with Keplerian ellipses & Newtonian gravity",
        worldPosition: [-3.6, 2.8, 0],
        priority: 1,
      },
      {
        annotationId: "ann-m20-island",
        objectId: "spectroscopy_and_leavitt_cepheid",
        objectName: "Spectroscopy & Island Universes",
        type: "MEASURED_VALUE",
        label: "Payne-Gaposchkin (1925): Stars Are ~98% H/He • Hubble (1923): M31 Cepheid V1",
        value: "Leavitt's Period-Luminosity Law expanded the known universe from 100,000 ly to billions of ly",
        worldPosition: [0, 2.8, 0],
        priority: 1,
      },
      {
        annotationId: "ann-m20-multimessenger",
        objectId: "multimessenger_observatory_nexus",
        objectName: "Multi-Messenger Synthesis",
        type: "MEASURED_VALUE",
        label: "Photons (Radio–γ) + Gravitational Waves (LIGO h ~ 10⁻²¹) + Neutrinos + Cosmic Rays",
        value: "GW170817 kilonova proved neutron star mergers forge heavy r-process elements (gold, platinum)",
        worldPosition: [3.6, 2.8, 0],
        priority: 1,
      },
    ],
  },
  "21": {
    sceneId: "m21_optical_multiwavelength_observatory_3d",
    adapterSceneId: "solar_system",
    moduleId: "21",
    title: "Telescopes & How We Discover Space: Optical, Radio, IR/UV, X-Ray & Spectroscopy",
    subtitle: "Rayleigh Diffraction (θ ≈ 1.22λ/D), Segmented Mirrors, Adaptive Optics, ALMA Interferometry & Wolter X-Ray Shells",
    visualStyle: "stage6_instrument_telemetry",
    scientificRepresentation: "PHYSICS_BASED_SIMULATION",
    defaultTimePolicy: "SIMULATION_CONTINUOUS",
    defaultCameraPresetId: "instrument_viewpoint",
    defaultCameraArchetype: "instrument_viewpoint",
    defaultCameraPosition: [0, 3.8, 11.8],
    defaultCameraTarget: [0, 0, 0],
    nearClip: 0.05,
    farClip: 2000,
    scaleAdjustmentNotice:
      "Physics-Based Optical & Multi-Wavelength Bench: Aperture collecting area A = π(D/2)², Rayleigh diffraction θ ≈ 1.22λ/D, interferometric baseline resolution θ ≈ λ/B_max, and Doppler shifts Δλ/λ₀ = v_r/c follow SI physical relationships.",
    uncertaintyOrIllustrationNotice:
      "Schematic ray paths represent paraxial geometrical optics; non-visible UV, IR, X-ray, and radio intensities use disclosed representative false-color palettes.",
    observationReference: "JWST / HST / ESO VLT Adaptive Optics / ALMA / Chandra Wolter Type-I Optics",
    sceneArchetype: "cosmic_zoom",
    objects: [
      {
        objectId: "segmented_reflector_aperture",
        name: "Segmented Reflector & Paraxial Ray Bench (D = 2.4–6.5 m)",
        category: "spacecraft",
        position: [-3.8, 0, 0],
        radius: 2.6,
        color: "#f59e0b",
        emissiveColor: "#d97706",
        physicalMetrics: {
          radius: "HST D = 2.4 m • JWST D = 6.5 m (18 Beryllium-Gold Hexagons) • VLT D = 8.2 m",
          temperature: "JWST Passive Sunshield: ~40 K • MIRI Cryocooler: ~7 K",
          equation: "A = π(D/2)² • θ_Rayleigh ≈ 1.22 λ / D (rad)",
          observationSource: "NASA JWST / STScI / ESO Paranal Observatory",
        },
      },
      {
        objectId: "alma_interferometer_and_wolter_xray",
        name: "ALMA Radio Interferometer (B_max = 16 km) & Chandra Wolter Type-I X-Ray Shells",
        category: "spacecraft",
        position: [0, 0, 0],
        radius: 2.8,
        color: "#38bdf8",
        emissiveColor: "#0284c7",
        physicalMetrics: {
          distance: "ALMA B_max = 16 km (66 Dishes) • Chandra Focal Length f = 10 m",
          temperature: "Wolter Grazing Angle θ < 1° (Iridium-Coated Paraboloid + Hyperboloid)",
          equation: "θ_synth ≈ λ / B_max • Area = N · π(D_dish/2)²",
          observationSource: "ALMA Observatory / NASA Chandra X-ray Center",
        },
      },
      {
        objectId: "high_dispersion_spectrograph",
        name: "Astronomical Diffraction Grating Spectrograph (Doppler & Chemical Fingerprints)",
        category: "spacecraft",
        position: [3.8, 0, 0],
        radius: 2.5,
        color: "#a855f7",
        emissiveColor: "#7e22ce",
        physicalMetrics: {
          velocity: "Doppler Shift Δλ / λ₀ = v_r / c (Radial Velocity & Exoplanet Wobble)",
          temperature: "Hα = 656.28 nm • He I D₃ = 587.56 nm (Janssen 1868) • Na D = 589.0/589.6 nm",
          equation: "m λ = d (sin α + sin β) • R = λ / Δλ",
          observationSource: "Fraunhofer / Kirchhoff & Bunsen / HARPS & NIRSpec",
        },
      },
    ],
    annotations: [
      {
        annotationId: "ann-m21-rayleigh",
        objectId: "segmented_reflector_aperture",
        objectName: "Light-Gathering Power & Rayleigh Criterion",
        type: "SCIENTIFIC_EQUATION",
        label: "LGP = (D / D_eye)² • θ ≈ 1.22 λ / D",
        value: "Aperture Diameter D Governs Both Photon Flux and Diffraction Limit",
        worldPosition: [-3.8, 2.8, 0],
        priority: 1,
      },
      {
        annotationId: "ann-m21-interferometry",
        objectId: "alma_interferometer_and_wolter_xray",
        objectName: "Interferometry & Grazing X-Ray Optics",
        type: "SCIENTIFIC_EQUATION",
        label: "θ_synth ≈ λ / B_max • Wolter Grazing θ < 1°",
        value: "Baseline Sets Resolution; N Dish Area Sets Sensitivity",
        worldPosition: [0, 2.9, 0],
        priority: 1,
      },
      {
        annotationId: "ann-m21-spectroscopy",
        objectId: "high_dispersion_spectrograph",
        objectName: "Doppler Spectroscopy",
        type: "SCIENTIFIC_EQUATION",
        label: "Δλ / λ₀ = v_r / c • Spectral Line Diagnostics",
        value: "Reveals Composition, Temperature, and Radial Velocity",
        worldPosition: [3.8, 2.8, 0],
        priority: 1,
      },
    ],
  },
  "22": {
    sceneId: "m22_space_missions_trajectories_3d",
    adapterSceneId: "orbital_mechanics",
    moduleId: "22",
    title: "Space Missions & Human Exploration: LEO, Lunar LOR, Mars EDL & Gravity Assists",
    subtitle: "Sputnik 1, Vostok 1, Apollo & Chandrayaan-3, ISS ECLSS, Perseverance Sky Crane, Voyager Heliopause & L2 Halo Orbits",
    visualStyle: "stage6_instrument_telemetry",
    scientificRepresentation: "SCALE_ADJUSTED_EDUCATIONAL_MODEL",
    defaultTimePolicy: "SIMULATION_CONTINUOUS",
    defaultCameraPresetId: "object_following_camera",
    defaultCameraArchetype: "object_following_camera",
    defaultCameraPosition: [0, 4.0, 12.2],
    defaultCameraTarget: [0, 0, 0],
    nearClip: 0.05,
    farClip: 2500,
    scaleAdjustmentNotice:
      "Scale-Adjusted Astrodynamics Model: Spacecraft geometries are scaled for structural inspection while orbital velocities v_c = √(GM/r), TLI Δv ≈ 3.05 km/s, and two-frame hyperbolic gravity assists follow exact orbital mechanics.",
    uncertaintyOrIllustrationNotice:
      "Orbital weightlessness at ISS/Vostok altitudes (~300–408 km, g ≈ 0.89–0.91 g₀) results from continuous free fall, never the absence of gravity; Voyager's ~121 AU heliopause crossing is distinct from the Sun's gravitational Oort Cloud.",
    observationReference: "NASA JPL Horizons / ISRO Chandrayaan-3 & Aditya-L1 / ESA / Roscosmos Archives",
    sceneArchetype: "orbital_mechanics",
    objects: [
      {
        objectId: "leo_and_cislunar_spacecraft",
        name: "LEO & Cis-Lunar Pioneers (Sputnik 1, Vostok 1, ISS, Apollo & Chandrayaan-3 Vikram)",
        category: "spacecraft",
        position: [-3.8, 0, 0],
        radius: 2.6,
        color: "#60a5fa",
        emissiveColor: "#2563eb",
        physicalMetrics: {
          velocity: "v_LEO ≈ 7.66–7.80 km/s • Δv_TLI ≈ 3.05 km/s • ISS g(408 km) ≈ 0.89 g₀",
          distance: "Chandrayaan-3 Shiv Shakti Point: 69.37° S, 32.35° E (Lunar South-Polar Region)",
          equation: "v_c = √(G M_E / r) • Δv = I_sp g₀ ln(m₀ / m_f)",
          observationSource: "NASA Apollo / ISRO Chandrayaan-3 (Aug 23, 2023) / ISS Program",
        },
      },
      {
        objectId: "mars_edl_and_voyager_flyby",
        name: "Perseverance Mars Sky Crane EDL & Voyager Jupiter Gravity Assist",
        category: "spacecraft",
        position: [0, 0, 0],
        radius: 2.9,
        color: "#f97316",
        emissiveColor: "#ea580c",
        physicalMetrics: {
          velocity: "Planet Frame: |v_∞,in| = |v_∞,out| • Sun Frame: v_helio,out = v_planet + v_∞,out",
          distance: "Voyager Heliopause Crossing ≈ 121 AU (Oort Cloud extends 10³–10⁵ AU)",
          equation: "sin(δ/2) = 1 / (1 + r_p v_∞² / μ_p) • MOXIE: 2 CO₂ → 2 CO + O₂",
          observationSource: "NASA JPL Mars 2020 Perseverance & Voyager Interstellar Mission",
        },
      },
      {
        objectId: "l2_halo_and_mission_planner",
        name: "Sun-Earth L1/L2 Halo Observatories (JWST & Aditya-L1) & Patched-Conic Planner",
        category: "spacecraft",
        position: [3.8, 0, 0],
        radius: 2.6,
        color: "#fbbf24",
        emissiveColor: "#d97706",
        physicalMetrics: {
          distance: "Sun-Earth L1/L2 Distance ≈ 1.5 × 10⁶ km (3D Halo Loop Avoids Earth Shadow)",
          orbitalPeriod: "JWST Halo Period ≈ 6 Months • Earth-Mars Hohmann Transfer ≈ 259 Days",
          equation: "a_trans = (r₁ + r₂)/2 • T_trans = π √(a_trans³ / μ_☉)",
          observationSource: "NASA JWST / ISRO Aditya-L1 / JPL Mission Design",
        },
      },
    ],
    annotations: [
      {
        annotationId: "ann-m22-freefall",
        objectId: "leo_and_cislunar_spacecraft",
        objectName: "Free-Fall Microgravity & Cis-Lunar Precision",
        type: "SCIENTIFIC_EQUATION",
        label: "v_c = √(GM_E/r) ≈ 7.7 km/s • g(408 km) ≈ 0.89 g₀",
        value: "Weightlessness Is Continuous Free Fall • Chandrayaan-3 at 69.37° S",
        worldPosition: [-3.8, 2.8, 0],
        priority: 1,
      },
      {
        annotationId: "ann-m22-gravityassist",
        objectId: "mars_edl_and_voyager_flyby",
        objectName: "Two-Frame Gravity Assist Conservation",
        type: "SCIENTIFIC_EQUATION",
        label: "|v_∞,in| = |v_∞,out| (Planet Frame) • ΔE_helio ≠ 0 (Sun Frame)",
        value: "Momentum Exchanged with Moving Planet; Heliopause (~121 AU) ≠ Oort Cloud",
        worldPosition: [0, 2.9, 0],
        priority: 1,
      },
      {
        annotationId: "ann-m22-l2halo",
        objectId: "l2_halo_and_mission_planner",
        objectName: "L2 Halo Orbit & Patched-Conic Transfers",
        type: "SCIENTIFIC_EQUATION",
        label: "JWST Orbits Around L2 (1.5×10⁶ km) • a_trans = (r₁+r₂)/2",
        value: "Halo Orbit Prevents Earth Umbra Eclipse & Maintains Sunshield Alignment",
        worldPosition: [3.8, 2.8, 0],
        priority: 1,
      },
    ],
  },
  "23": {
    sceneId: "m23_astrobiology_ocean_worlds_3d",
    adapterSceneId: "solar_system",
    moduleId: "23",
    title: "Life Beyond Earth & Astrobiology: Habitability, Ocean Worlds, Biosignatures & CoLD Scale",
    subtitle: "Thermodynamic Disequilibrium, Carbonate-Silicate Cycle, Europa & Enceladus Plumes, Kopparapu HZ & False Positives",
    visualStyle: "stage6_instrument_telemetry",
    scientificRepresentation: "OBSERVATION_AND_MODEL_COMPARISON",
    defaultTimePolicy: "SIMULATION_CONTINUOUS",
    defaultCameraPresetId: "scientific_cross_section",
    defaultCameraArchetype: "scientific_cross_section",
    defaultCameraPosition: [0, 3.8, 11.8],
    defaultCameraTarget: [0, 0, 0],
    nearClip: 0.05,
    farClip: 2000,
    scaleAdjustmentNotice:
      "Astrobiological Model & Evidence Comparison: Subsurface ocean cross-sections, Kopparapu habitable zones, and synthetic exoplanet transmission spectra explicitly separate habitable conditions from confirmed life (N_confirmed = 1, Earth).",
    uncertaintyOrIllustrationNotice:
      "O₂ + CH₄ chemical disequilibrium is a candidate biosignature that still requires ruling out abiotic UV H₂O photolysis (O₄/CO diagnostics) and serpentinization; confirmed extraterrestrial life = 0.",
    observationReference: "NASA Astrobiology Strategy / Cassini INMS / Europa Clipper / Kopparapu et al. (2013) / Green et al. (2021) CoLD Scale",
    sceneArchetype: "cosmic_zoom",
    objects: [
      {
        objectId: "earth_and_extremophile_cradle",
        name: "Earth Carbonate-Silicate Cradle, Biochemical Triad & Extremophile Envelope (≤ 122 °C)",
        category: "planet",
        position: [-3.8, 0, 0],
        radius: 2.5,
        color: "#10b981",
        emissiveColor: "#059669",
        physicalMetrics: {
          temperature: "Earth T_eq = 255 K + 33 K Greenhouse = 288 K • Extremophile Ceiling = 122 °C",
          mass: "C–C (347 kJ/mol) vs Si–O (452 kJ/mol) • Liquid H₂O (P > 6.11 mbar)",
          equation: "ΔS_env > |ΔS_cell| • CaSiO₃ + CO₂ ↔ CaCO₃ + SiO₂",
          observationSource: "NASA Astrobiology Roadmap / Deep-Sea Hydrothermal Biology",
        },
      },
      {
        objectId: "mars_europa_enceladus_worlds",
        name: "Noachian Mars Paleolakes & Ocean Worlds (Europa & Enceladus Plumes)",
        category: "moon",
        position: [0, 0, 0],
        radius: 2.8,
        color: "#38bdf8",
        emissiveColor: "#0284c7",
        physicalMetrics: {
          distance: "Europa 4:2:1 Laplace Resonance • Enceladus 2:1 Dione Resonance",
          temperature: "Cassini Plume Detections: H₂O, CO₂, CH₄, NH₃, H₂, PO₄³⁻, <10 nm SiO₂",
          equation: "Ė_tidal ∝ e² / a⁶ • d_HZ = d_☉ √(L_* / L_☉)",
          observationSource: "NASA MAVEN / Perseverance / Galileo / Cassini-Huygens",
        },
      },
      {
        objectId: "biosignature_and_cold_scale",
        name: "Exoplanet Transmission Spectroscopy (O₂ + CH₄ vs False Positives) & NASA CoLD Scale",
        category: "planet",
        position: [3.8, 0, 0],
        radius: 2.6,
        color: "#f43f5e",
        emissiveColor: "#e11d48",
        physicalMetrics: {
          velocity: "CH₄ + 2 O₂ → CO₂ + 2 H₂O (τ_CH4 ≈ 12 yr) vs Abiotic UV H₂O Photolysis",
          distance: "Water Hole: 1.420 GHz (H I) – 1.662 GHz (OH) • CoLD Levels 1–7",
          equation: "ΔF/F = (R_p(λ)/R_*)² • N = R_* f_p n_e f_l f_i f_c L",
          observationSource: "JWST Transmission Spectroscopy / Breakthrough Listen / CoLD Framework",
        },
      },
    ],
    annotations: [
      {
        annotationId: "ann-m23-habitability",
        objectId: "earth_and_extremophile_cradle",
        objectName: "Habitability vs Confirmed Life",
        type: "UNCERTAINTY_OR_ILLUSTRATION_NOTICE",
        label: "H₂O + CHNOPS + Energy = Habitability (N_confirmed = 1)",
        value: "Habitable Conditions & Extremophiles Do Not Prove Alien Life Exists",
        worldPosition: [-3.8, 2.8, 0],
        priority: 1,
      },
      {
        annotationId: "ann-m23-oceans",
        objectId: "mars_europa_enceladus_worlds",
        objectName: "Subsurface Oceans & Kopparapu HZ",
        type: "SCIENTIFIC_EQUATION",
        label: "Ė_tidal ∝ e² • 1 L_☉ HZ: 0.95–1.67 AU",
        value: "Enceladus Plume H₂ & Organics Confirm Chemical Energy, Not Organisms",
        worldPosition: [0, 2.9, 0],
        priority: 1,
      },
      {
        annotationId: "ann-m23-cold",
        objectId: "biosignature_and_cold_scale",
        objectName: "Biosignatures, False Positives & CoLD Scale",
        type: "UNCERTAINTY_OR_ILLUSTRATION_NOTICE",
        label: "O₂ + CH₄ Disequilibrium vs Abiotic O₄/CO False Positives",
        value: "Confirmed Exoplanets > 5,500 • Confirmed Extraterrestrial Life = 0",
        worldPosition: [3.8, 2.8, 0],
        priority: 1,
      },
    ],
  },
  "24": {
    sceneId: "m24_capstone_physics_sandbox_3d",
    adapterSceneId: "orbital_mechanics",
    moduleId: "24",
    title: "Cosmic Physics Laboratory & Challenges: Multi-Domain Sandbox, Numerical Integrators & Capstone",
    subtitle: "Vis-Viva Orbits, Stellar Luminosity, Relativistic Horizons, Euler vs RK4/Verlet Error & 5-Stage Capstone Synthesis",
    visualStyle: "stage6_instrument_telemetry",
    scientificRepresentation: "PHYSICS_BASED_SIMULATION",
    defaultTimePolicy: "SIMULATION_CONTINUOUS",
    defaultCameraPresetId: "data_visualization_view",
    defaultCameraArchetype: "data_visualization_view",
    defaultCameraPosition: [0, 4.4, 12.6],
    defaultCameraTarget: [0, 0, 0],
    nearClip: 0.05,
    farClip: 2500,
    scaleAdjustmentNotice:
      "Unified Multi-Domain Physics Sandbox: Combines analytical conservation laws with explicit numerical integration error analysis (Forward Euler O(Δt) vs RK4 O(Δt⁴) and symplectic Verlet).",
    uncertaintyOrIllustrationNotice:
      "Completing the 3D Capstone Laboratory validates experimental synthesis (`capstone_astrophysics_synthesis`), while official Academy Graduation Certificate eligibility remains strictly governed by the server-verified 20-question Final Exam (≥ 80%).",
    observationReference: "CODATA / IAU Astronomical Constants / ESA Gaia / NASA Exoplanet Archive / Event Horizon Telescope",
    sceneArchetype: "orbital_mechanics",
    objects: [
      {
        objectId: "unified_conservation_sandbox",
        name: "Unified 5-Domain Astrophysics Sandbox (Orbits, Stars, Exoplanets, Horizons & Cosmology)",
        category: "star",
        position: [-3.8, 0, 0],
        radius: 2.7,
        color: "#fbbf24",
        emissiveColor: "#f59e0b",
        physicalMetrics: {
          velocity: "Vis-Viva: v² = GM(2/r - 1/a) • NFW Flat Rotation: v_rot = √(GM(<r)/r)",
          temperature: "Stefan–Boltzmann: L = 4πR²σT⁴ • Mass–Luminosity: L ∝ M³·⁵",
          equation: "r_s = 2GM/c² • r_ISCO = 3 r_s • 1 + z = 1 / a(t)",
          observationSource: "Unified Modules 01–23 Physical Constants & Solvers",
        },
      },
      {
        objectId: "numerical_integrator_bench",
        name: "Numerical Integrator Bench (Forward Euler Drift vs Symplectic Verlet & RK4)",
        category: "planet",
        position: [0, 0, 0],
        radius: 2.8,
        color: "#38bdf8",
        emissiveColor: "#0284c7",
        physicalMetrics: {
          orbitalPeriod: "Euler Global Error O(Δt) vs RK4 O(Δt⁴) • Symplectic Hamiltonian Bound",
          distance: "Plummer Gravitational Softening: Φ = -Gm / √(r² + ε²)",
          equation: "ΔE / |E₀| = |(T + U) - E₀| / |E₀|",
          observationSource: "Computational Astrophysics & Symplectic N-Body Methodology",
        },
      },
      {
        objectId: "capstone_graduation_challenge_hub",
        name: "5-Stage Quantitative Capstone Challenge & Server-Verified Certificate Gate",
        category: "compact_object",
        position: [3.8, 0, 0],
        radius: 2.7,
        color: "#10b981",
        emissiveColor: "#059669",
        physicalMetrics: {
          radius: "Stage 1: R_p = R_*√(ΔF/F) ≈ 10.9 R_⊕ • Stage 4: Sgr A* r_s ≈ 1.225×10⁷ km",
          distance: "Stage 2: 2:1 Resonance a₂ ≈ 1.587 AU • Stage 5: Mars Hohmann Δv₁ ≈ 2.94 km/s",
          equation: "Stage 3: Enclosed Halo Mass M(<20 kpc) = r v² / G ≈ 2.25×10¹¹ M_☉",
          observationSource: "Server-Validated Capstone Synthesis & Official 20-Question Final Exam",
        },
      },
    ],
    annotations: [
      {
        annotationId: "ann-m24-conservation",
        objectId: "unified_conservation_sandbox",
        objectName: "Unified Conservation Laws",
        type: "SCIENTIFIC_EQUATION",
        label: "v² = GM(2/r - 1/a) • L = 4πR²σT⁴ • r_s = 2GM/c²",
        value: "Coupled Orbital, Radiative, Relativistic & Cosmological Solvers",
        worldPosition: [-3.8, 2.8, 0],
        priority: 1,
      },
      {
        annotationId: "ann-m24-integrator",
        objectId: "numerical_integrator_bench",
        objectName: "Numerical Truncation Error & Softening",
        type: "SCIENTIFIC_EQUATION",
        label: "Euler O(Δt) Energy Drift vs RK4 O(Δt⁴) & Symplectic Verlet",
        value: "Smooth Trajectories Require Energy Audit ΔE/E₀ & Softening ε Disclosure",
        worldPosition: [0, 2.9, 0],
        priority: 1,
      },
      {
        annotationId: "ann-m24-capstone",
        objectId: "capstone_graduation_challenge_hub",
        objectName: "Capstone Synthesis & Exam Integrity",
        type: "OBSERVATION_REFERENCE",
        label: "5-Stage Quantitative Capstone • Official 20-Q Exam (≥80%)",
        value: "Cinematic Playback Never Bypasses Server Certificate Verification",
        worldPosition: [3.8, 2.8, 0],
        priority: 1,
      },
    ],
  },
};


/**
 * Generates a scientifically grounded scene descriptor for any of the 24 modules,
 * using explicit rich descriptors for Modules 01, 08, 14 and stage-appropriate
 * interactive 3D descriptors for all other modules.
 */
export class CosmosCinematicSceneRegistry {
  public static getSceneForModule(
    moduleId: string,
    moduleTitle?: string,
  ): CinematicSceneDescriptor {
    const normalizedId = String(moduleId).padStart(2, "0");
    if (MODULE_SCENE_MAP[normalizedId]) {
      return MODULE_SCENE_MAP[normalizedId];
    }

    const modNum = parseInt(normalizedId, 10) || 1;
    const title = moduleTitle || `Module ${normalizedId}`;

    // Map remaining modules to their exact domain archetype and approved adapter scene
    if (modNum >= 2 && modNum <= 7) {
      return {
        sceneId: `m${normalizedId}_solar_celestial_observatory`,
        adapterSceneId: "solar_system",
        moduleId: normalizedId,
        title: `${title} — 3D Celestial Observatory`,
        subtitle: "Heliocentric & Geocentric Astrophysical Visualization",
        visualStyle: modNum <= 4 ? "stage1_cosmic_horizon" : "stage2_solar_dynamo",
        scientificRepresentation:
          modNum === 3 || modNum === 4 || modNum === 7
            ? "PHYSICS_BASED_SIMULATION"
            : "SCALE_ADJUSTED_EDUCATIONAL_MODEL",
        defaultTimePolicy: "SIMULATION_CONTINUOUS",
        defaultCameraPresetId: "planetary_orbital_shot",
        defaultCameraArchetype: "planetary_orbital_shot",
        defaultCameraPosition: [0, 4.5, 13.0],
        defaultCameraTarget: [0, 0, 0],
        nearClip: 0.05,
        farClip: 2000,
        scaleAdjustmentNotice:
          "Scale-Adjusted Educational Model: Celestial radii are scaled relative to orbital semi-major axes for simultaneous multi-body visibility.",
        uncertaintyOrIllustrationNotice:
          "Radiative flux and angular separations follow IAU & NASA JPL ephemeris constants.",
        observationReference: "IAU / NASA JPL Solar System Dynamics",
        sceneArchetype: modNum === 7 ? "stellar_physics" : "cosmic_zoom",
        objects: MODULE_SCENE_MAP["01"].objects,
        annotations: MODULE_SCENE_MAP["01"].annotations,
      };
    }

    if (modNum >= 9 && modNum <= 11) {
      return {
        sceneId: `m${normalizedId}_stellar_evolution_observatory`,
        adapterSceneId: "stellar_evolution",
        moduleId: normalizedId,
        title: `${title} — Stellar Physics & HR Diagram 3D`,
        subtitle: "Blackbody Chromaticity, Hydrostatic Equilibrium & Nucleosynthesis",
        visualStyle: "stage3_stellar_forge",
        scientificRepresentation: "PHYSICS_BASED_SIMULATION",
        defaultTimePolicy: "FOLLOW_NARRATION",
        defaultCameraPresetId: "scientific_cross_section",
        defaultCameraArchetype: "scientific_cross_section",
        defaultCameraPosition: [0, 3.2, 11.5],
        defaultCameraTarget: [0, 0, 0],
        nearClip: 0.05,
        farClip: 2000,
        scaleAdjustmentNotice:
          "Physics-Based Stellar Model: Surface color chromaticity follows Planck's blackbody law (Wien's displacement λ_max = b/T); giant radii are logarithmically compressed.",
        uncertaintyOrIllustrationNotice:
          "Internal convective and radiative zones are shown via an instructional cutaway cross-section.",
        observationReference: "ESA Gaia DR3 • MESA Stellar Evolution Tracks",
        sceneArchetype: "stellar_physics",
        objects: [
          {
            objectId: "main_sequence_star",
            name: "G2V Main-Sequence Star (T = 5,772 K)",
            category: "star",
            position: [0, 0, 0],
            radius: 1.65,
            color: "#fff4ea",
            emissiveColor: "#fbbf24",
            physicalMetrics: {
              mass: "1.00 M_☉",
              radius: "1.00 R_☉ (695,700 km)",
              temperature: "T_eff = 5,772 K • T_core ≈ 1.57 × 10⁷ K",
              equation: "L = 4π R² σ T⁴ • dP/dr = −G M(r) ρ(r) / r²",
              observationSource: "IAU / Solar & Stellar Astrophysics Reference",
            },
          },
          {
            objectId: "blue_supergiant",
            name: "O-Type Blue Supergiant (T = 32,000 K)",
            category: "star",
            position: [-4.8, 0.8, -1.5],
            radius: 2.3,
            color: "#9bb0ff",
            emissiveColor: "#60a5fa",
            physicalMetrics: {
              mass: "25 M_☉",
              radius: "15 R_☉",
              temperature: "32,000 K (UV-dominated Wien peak)",
              equation: "L ∝ M³·⁵",
              observationSource: "Hertzsprung–Russell Stellar Catalog",
            },
          },
          {
            objectId: "red_giant_branch",
            name: "M-Type Red Giant (T = 3,200 K)",
            category: "star",
            position: [4.8, -0.5, -1.2],
            radius: 2.6,
            color: "#ff6b3d",
            emissiveColor: "#ea580c",
            physicalMetrics: {
              mass: "1.2 M_☉ (Degenerate He core + expanded H envelope)",
              radius: "85 R_☉",
              temperature: "3,200 K",
              equation: "3 ⁴He → ¹²C (Triple-Alpha at T ≥ 10⁸ K)",
              observationSource: "ESA Gaia Stellar Evolution Archive",
            },
          },
        ],
        annotations: [
          {
            annotationId: `ann-m${normalizedId}-stefan`,
            objectId: "main_sequence_star",
            objectName: "Stellar Photosphere",
            type: "SCIENTIFIC_EQUATION",
            label: "Stefan–Boltzmann Law",
            value: "L = 4π R² σ T⁴ • Hydrostatic Balance",
            worldPosition: [0, 2.25, 0],
            priority: 1,
          },
          {
            annotationId: `ann-m${normalizedId}-blue`,
            objectId: "blue_supergiant",
            objectName: "O-Type Star",
            type: "TEMPERATURE",
            label: "O-Type Supergiant",
            value: "T_eff ≈ 32,000 K • Short τ ~ 10 Myr",
            worldPosition: [-4.8, 3.4, -1.5],
            priority: 2,
          },
          {
            annotationId: `ann-m${normalizedId}-red`,
            objectId: "red_giant_branch",
            objectName: "Red Giant",
            type: "RADIUS",
            label: "Expanded Convective Envelope",
            value: "T_eff ≈ 3,200 K • R ~ 85 R_☉",
            worldPosition: [4.8, 2.4, -1.2],
            priority: 2,
          },
        ],
      };
    }

    if (modNum === 12 || modNum === 13 || modNum === 15) {
      return {
        sceneId: `m${normalizedId}_galactic_dynamics_3d`,
        adapterSceneId: "galaxy_assembly",
        moduleId: normalizedId,
        title: `${title} — Galactic & Exoplanetary Dynamics`,
        subtitle: "Spiral Density Waves, Dark Matter Halo & Transit Photometry",
        visualStyle: "stage4_relativistic_horizon",
        scientificRepresentation: "OBSERVATION_BASED",
        defaultTimePolicy: "SIMULATION_CONTINUOUS",
        defaultCameraPresetId: "galactic_overview_camera",
        defaultCameraArchetype: "galactic_overview_camera",
        defaultCameraPosition: [0, 5.2, 13.5],
        defaultCameraTarget: [0, 0, 0],
        nearClip: 0.05,
        farClip: 2000,
        scaleAdjustmentNotice:
          "Observation-Based Model: Galactic disk thickness, bulge-to-disk ratio, and exoplanet transit geometry are scaled for clear structural resolution.",
        uncertaintyOrIllustrationNotice:
          "Dark matter halo mass profiles follow Navarro–Frenk–White (NFW) rotation curve fits.",
        observationReference: "ESA Gaia • Hubble Tuning Fork • NASA Exoplanet Archive",
        sceneArchetype: "galactic_structure",
        objects: MODULE_SCENE_MAP["01"].objects,
        annotations: MODULE_SCENE_MAP["01"].annotations,
      };
    }

    if (modNum >= 16 && modNum <= 20) {
      return {
        sceneId: `m${normalizedId}_cosmological_expansion_3d`,
        adapterSceneId: "cosmic_expansion",
        moduleId: normalizedId,
        title: `${title} — Relativistic Cosmology & Metric Expansion`,
        subtitle: "ΛCDM Comoving Grid, CMB Surface of Last Scattering & Cosmic Web",
        visualStyle: "stage5_primordial_horizon",
        scientificRepresentation: "PHYSICS_BASED_SIMULATION",
        defaultTimePolicy: "FOLLOW_NARRATION",
        defaultCameraPresetId: "cosmological_horizon_pullback",
        defaultCameraArchetype: "cosmological_horizon_pullback",
        defaultCameraPosition: [0, 5.5, 14.5],
        defaultCameraTarget: [0, 0, 0],
        nearClip: 0.05,
        farClip: 2500,
        scaleAdjustmentNotice:
          "Cosmological Comoving Frame: Metric expansion a(t) stretches space uniformly between galaxy clusters without a central explosion point; gravitationally bound galaxies do not expand.",
        uncertaintyOrIllustrationNotice:
          "H₀ = 67.4 ± 0.5 km/s/Mpc (Planck CMB) vs 73.0 ± 1.0 km/s/Mpc (SH0ES Cepheid/SN Ia distance ladder).",
        observationReference: "Planck 2018 Cosmological Parameters • SDSS / DESI BAO",
        sceneArchetype: "cosmological_expansion",
        objects: MODULE_SCENE_MAP["01"].objects,
        annotations: [
          {
            annotationId: `ann-m${normalizedId}-hubble`,
            objectId: "milky_way_disk",
            objectName: "Hubble–Lemaître Flow",
            type: "SCIENTIFIC_EQUATION",
            label: "Metric Expansion of Space",
            value: "v = H₀ d • 1 + z = a₀ / a(t)",
            worldPosition: [0, 2.5, 0],
            priority: 1,
          },
          {
            annotationId: `ann-m${normalizedId}-lcdm`,
            objectId: "earth",
            objectName: "ΛCDM Energy Budget",
            type: "OBSERVATION_REFERENCE",
            label: "Planck 2018 Cosmic Inventory",
            value: "68.3% Dark Energy (Λ) • 26.8% Dark Matter • 4.9% Baryons",
            worldPosition: [0, -2.2, 0],
            priority: 1,
          },
        ],
      };
    }

    // Stage 6 (Modules 21–24): Telescopes, Space Missions, Astrobiology & Capstone Physics Lab
    return {
      sceneId: `m${normalizedId}_observatory_synthesis_3d`,
      adapterSceneId: modNum === 24 ? "orbital_mechanics" : "solar_system",
      moduleId: normalizedId,
      title: `${title} — Multi-Messenger Observatory & Synthesis`,
      subtitle: "Diffraction Optics, Orbital Trajectories & Habitable Zone Physics",
      visualStyle: "stage6_cosmic_synthesis",
      scientificRepresentation: "PHYSICS_BASED_SIMULATION",
      defaultTimePolicy: "SIMULATION_CONTINUOUS",
      defaultCameraPresetId: "planetary_orbital_shot",
      defaultCameraArchetype: "planetary_orbital_shot",
      defaultCameraPosition: [0, 4.2, 12.5],
      defaultCameraTarget: [0, 0, 0],
      nearClip: 0.05,
      farClip: 2000,
      scaleAdjustmentNotice:
        "Physics-Based Observatory Synthesis: Aperture diffraction θ = 1.22 λ/D, Hohmann transfer Δv, and circumstellar habitable zone radii r_HZ ∝ √(L_*/L_☉) follow exact physical laws.",
      uncertaintyOrIllustrationNotice:
        "Exoplanet biosignature disequilibrium (O₂ + CH₄) requires high-dispersion transmission spectroscopy.",
      observationReference: "JWST / ESO ELT / NASA JPL Mission Design",
      sceneArchetype: modNum === 24 ? "orbital_mechanics" : "cosmic_zoom",
      objects: MODULE_SCENE_MAP["08"].objects,
      annotations: MODULE_SCENE_MAP["08"].annotations,
    };
  }
}
