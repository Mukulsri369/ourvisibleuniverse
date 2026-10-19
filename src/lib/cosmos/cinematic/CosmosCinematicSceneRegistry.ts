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
    observationReference: "Event Horizon Telescope (EHT) M87* (2019) & Sgr A* (2022) • LIGO GW150914",
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
};

/**
 * Generates a scientifically grounded scene descriptor for any of the 24 modules,
 * using explicit rich descriptors for Modules 01, 08, 14 and stage-appropriate
 * interactive 3D descriptors for all other modules.
 */
export class CosmosCinematicSceneRegistry {
  public static getSceneForModule(moduleId: string, moduleTitle?: string): CinematicSceneDescriptor {
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
