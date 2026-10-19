/**
 * COSMOS Reusable Scientific 3D Object Contract & 24-Module Visual Library Map
 * Project: Our Visible Universe Academy
 * Scope: Prompt 05 — Sections 4, 5, 20, 21, 22, 27, 29
 *
 * Defines the strict, typed contract for all scientific 3D objects rendered
 * inside the COSMOS Cinematic Learning System. Enforces parameter validation,
 * physical clamping, epistemic transparency, and deterministic animation cue evaluation.
 * Never permits unvalidated generative AI code to mutate scene graphs directly.
 */

import type {
  CinematicQualityTier,
  ScientificRepresentationCategory,
} from "../../cinematic-storyboard-types";
import type { RegisteredAnimationCue } from "../CosmosAnimationCueRegistry";

export type ScientificObjectType =
  | "planet_terrestrial"
  | "planet_cloud_covered"
  | "planet_gas_giant"
  | "planet_ice_giant"
  | "moon_airless"
  | "moon_icy"
  | "asteroid_or_dwarf"
  | "star_main_sequence"
  | "star_red_dwarf"
  | "star_blue_supergiant"
  | "star_red_giant"
  | "star_white_dwarf"
  | "protostar"
  | "neutron_star_pulsar"
  | "black_hole_schwarzschild"
  | "black_hole_kerr"
  | "nebula_emission"
  | "nebula_reflection"
  | "nebula_dark"
  | "nebula_planetary"
  | "supernova_remnant"
  | "galaxy_spiral"
  | "galaxy_barred_spiral"
  | "galaxy_elliptical"
  | "galaxy_irregular"
  | "star_cluster_globular"
  | "orbital_system"
  | "gravitational_field"
  | "spacecraft_observatory";

export type AstronomicalScaleRegime =
  | "planetary_scale" // 10^3 - 10^5 km
  | "interplanetary_scale" // 10^6 - 10^9 km (AU)
  | "stellar_scale" // R_sun to 100 AU
  | "interstellar_scale" // 1 - 1,000 ly (pc)
  | "galactic_scale" // 1 - 500 kly (kpc)
  | "cosmological_scale"; // 1 Mpc - 46.5 Gly

export interface ScientificPhysicalParameters {
  massKg?: number;
  massSolar?: number;
  radiusKm?: number;
  radiusSolar?: number;
  effectiveTemperatureK?: number;
  semiMajorAxisAu?: number;
  eccentricity?: number;
  axialTiltDeg?: number;
  rotationPeriodHours?: number;
  bondAlbedo?: number;
  atmosphereScaleHeightKm?: number;
  atmosphericOpticalDepth?: number;
  magneticTiltDeg?: number;
  spinRateHz?: number;
  schwarzschildRadiusKm?: number;
  dimensionlessSpinAStar?: number; // [0, 0.998] for Kerr black holes
  accretionDiskInclinationDeg?: number;
  redshiftZ?: number;
  spectralClass?: "O" | "B" | "A" | "F" | "G" | "K" | "M" | "WD" | "NS";
}

export interface DeterministicShaderUniformState {
  narrativeProgress: number; // Clamped [0.0, 1.0]
  simulationTime: number; // Monotonic deterministic simulation time (seconds)
  stellarTemperatureK: number; // Clamped [2000, 50000] K
  atmosphericOpticalDepth: number; // Clamped [0.0, 5.0]
  highlightStrength: number; // Clamped [0.0, 1.0]
  emissionIntensity: number; // Clamped [0.0, 4.0]
  densityScale: number; // Clamped [0.05, 3.0]
  cutawayRevealAngleRad: number; // Clamped [0.0, Math.PI]
  dopplerBeamingStrength: number; // Clamped [0.0, 1.5]
  lensingDeflectionStrength: number; // Clamped [0.0, 2.0]
  visualizationMode: "photometric" | "cross_section" | "false_color_spectroscopic" | "gravitational_potential";
}

export interface ScientificObjectResourceLifecycle {
  createdAt: number;
  lastUpdatedAt: number;
  disposed: boolean;
  geometryCount: number;
  materialCount: number;
  textureCount: number;
}

export interface ScientificCinematicObjectContract {
  objectId: string;
  sceneId: string;
  name: string;
  scientificObjectType: ScientificObjectType;
  scaleRegime: AstronomicalScaleRegime;
  scientificRepresentation: ScientificRepresentationCategory;
  epistemicDisclosure: string;
  physicalParameters: ScientificPhysicalParameters;
  displayScale: number;
  renderingQuality: CinematicQualityTier;
  supportedAnimations: string[];
  supportedHighlights: string[];
  supportedCameraTargets: string[];
  scientificSources: string[];
  shaderState: DeterministicShaderUniformState;
  resourceLifecycle: ScientificObjectResourceLifecycle;
}

export interface ScientificObjectInstanceController {
  contract: ScientificCinematicObjectContract;
  focus: () => { targetPosition: [number, number, number]; recommendedDistance: number };
  highlight: (enabled: boolean, strength?: number) => void;
  setVisualParameter: (key: keyof DeterministicShaderUniformState, value: number | string) => boolean;
  evaluateAnimationCue: (cue: RegisteredAnimationCue | null, normalizedProgress: number) => void;
  setSimulationTime: (simulationTimeSeconds: number) => void;
  pauseVisualEffects: () => void;
  restoreVisualState: () => void;
  disposeResources: () => void;
}

/**
 * Clamps and validates untrusted or cue-supplied shader parameters to safe physical
 * and rendering ranges (Prompt 05 Section 22).
 */
export function validateAndClampShaderParameters(
  partial: Partial<DeterministicShaderUniformState>,
  baseline?: DeterministicShaderUniformState,
): DeterministicShaderUniformState {
  const base: DeterministicShaderUniformState = baseline ?? {
    narrativeProgress: 0,
    simulationTime: 0,
    stellarTemperatureK: 5772,
    atmosphericOpticalDepth: 1.0,
    highlightStrength: 0,
    emissionIntensity: 1.0,
    densityScale: 1.0,
    cutawayRevealAngleRad: 0,
    dopplerBeamingStrength: 0.85,
    lensingDeflectionStrength: 1.0,
    visualizationMode: "photometric",
  };

  const clampNum = (val: unknown, fallback: number, min: number, max: number): number => {
    const n = typeof val === "number" && Number.isFinite(val) ? val : fallback;
    return Math.min(max, Math.max(min, n));
  };

  const validModes: DeterministicShaderUniformState["visualizationMode"][] = [
    "photometric",
    "cross_section",
    "false_color_spectroscopic",
    "gravitational_potential",
  ];
  const mode =
    partial.visualizationMode && validModes.includes(partial.visualizationMode)
      ? partial.visualizationMode
      : base.visualizationMode;

  return {
    narrativeProgress: clampNum(partial.narrativeProgress, base.narrativeProgress, 0.0, 1.0),
    simulationTime: clampNum(partial.simulationTime, base.simulationTime, 0.0, 1e9),
    stellarTemperatureK: clampNum(
      partial.stellarTemperatureK,
      base.stellarTemperatureK,
      1800,
      50000,
    ),
    atmosphericOpticalDepth: clampNum(
      partial.atmosphericOpticalDepth,
      base.atmosphericOpticalDepth,
      0.0,
      5.0,
    ),
    highlightStrength: clampNum(partial.highlightStrength, base.highlightStrength, 0.0, 1.0),
    emissionIntensity: clampNum(partial.emissionIntensity, base.emissionIntensity, 0.0, 4.0),
    densityScale: clampNum(partial.densityScale, base.densityScale, 0.05, 3.0),
    cutawayRevealAngleRad: clampNum(
      partial.cutawayRevealAngleRad,
      base.cutawayRevealAngleRad,
      0.0,
      Math.PI,
    ),
    dopplerBeamingStrength: clampNum(
      partial.dopplerBeamingStrength,
      base.dopplerBeamingStrength,
      0.0,
      1.5,
    ),
    lensingDeflectionStrength: clampNum(
      partial.lensingDeflectionStrength,
      base.lensingDeflectionStrength,
      0.0,
      2.0,
    ),
    visualizationMode: mode,
  };
}

/**
 * Authoritative Registry of active scientific 3D objects in the cinematic scene.
 */
export class CosmosScientificSceneLibrary {
  private static instance: CosmosScientificSceneLibrary | null = null;
  private controllers = new Map<string, ScientificObjectInstanceController>();

  public static getInstance(): CosmosScientificSceneLibrary {
    if (!this.instance) {
      this.instance = new CosmosScientificSceneLibrary();
    }
    return this.instance;
  }

  public registerObject(
    contract: ScientificCinematicObjectContract,
    worldPosition: [number, number, number] = [0, 0, 0],
    radius = 1.0,
    onCleanup?: () => void,
  ): ScientificObjectInstanceController {
    const initialShaderState = validateAndClampShaderParameters(contract.shaderState);
    let paused = false;

    const controller: ScientificObjectInstanceController = {
      contract: {
        ...contract,
        shaderState: { ...initialShaderState },
        resourceLifecycle: {
          ...contract.resourceLifecycle,
          createdAt: Date.now(),
          lastUpdatedAt: Date.now(),
          disposed: false,
        },
      },
      focus: () => ({
        targetPosition: [...worldPosition],
        recommendedDistance: Math.max(3.0, radius * 3.5),
      }),
      highlight: (enabled: boolean, strength = 0.85) => {
        controller.contract.shaderState = validateAndClampShaderParameters(
          { highlightStrength: enabled ? strength : 0.0 },
          controller.contract.shaderState,
        );
        controller.contract.resourceLifecycle.lastUpdatedAt = Date.now();
      },
      setVisualParameter: (key, value) => {
        // Allowlist validation: only keys in DeterministicShaderUniformState may be modified
        if (!(key in controller.contract.shaderState)) {
          return false;
        }
        controller.contract.shaderState = validateAndClampShaderParameters(
          { [key]: value } as Partial<DeterministicShaderUniformState>,
          controller.contract.shaderState,
        );
        controller.contract.resourceLifecycle.lastUpdatedAt = Date.now();
        return true;
      },
      evaluateAnimationCue: (cue, normalizedProgress) => {
        const clampedU = Math.min(1, Math.max(0, normalizedProgress));
        const isHighlighted =
          cue?.highlightedObjects?.some(
            (id) =>
              id === contract.objectId ||
              id.startsWith(`${contract.objectId}_`) ||
              contract.objectId.startsWith(`${id}_`),
          ) ?? false;
        const actionText = (cue?.animationAction || "").toLowerCase();
        const isCutawayCue =
          actionText.includes("cutaway") ||
          actionText.includes("core") ||
          actionText.includes("interior");

        controller.contract.shaderState = validateAndClampShaderParameters(
          {
            narrativeProgress: clampedU,
            highlightStrength: isHighlighted ? 0.85 : 0.0,
            cutawayRevealAngleRad: isCutawayCue ? Math.PI * 0.55 : 0.0,
            visualizationMode: isCutawayCue ? "cross_section" : "photometric",
          },
          controller.contract.shaderState,
        );
        controller.contract.resourceLifecycle.lastUpdatedAt = Date.now();
      },
      setSimulationTime: (simulationTimeSeconds: number) => {
        if (paused) return;
        controller.contract.shaderState = validateAndClampShaderParameters(
          { simulationTime: simulationTimeSeconds },
          controller.contract.shaderState,
        );
      },
      pauseVisualEffects: () => {
        paused = true;
      },
      restoreVisualState: () => {
        paused = false;
        controller.contract.shaderState = { ...initialShaderState };
        controller.contract.resourceLifecycle.lastUpdatedAt = Date.now();
      },
      disposeResources: () => {
        if (controller.contract.resourceLifecycle.disposed) return;
        controller.contract.resourceLifecycle.disposed = true;
        controller.contract.resourceLifecycle.lastUpdatedAt = Date.now();
        if (onCleanup) {
          onCleanup();
        }
        this.controllers.delete(contract.objectId);
      },
    };

    this.controllers.set(contract.objectId, controller);
    return controller;
  }

  public getObjectController(objectId: string): ScientificObjectInstanceController | null {
    return this.controllers.get(objectId) || null;
  }

  public getAllObjectsForScene(sceneId: string): ScientificObjectInstanceController[] {
    return Array.from(this.controllers.values()).filter((c) => c.contract.sceneId === sceneId);
  }

  public evaluateCueAcrossScene(
    sceneId: string,
    cue: RegisteredAnimationCue | null,
    normalizedProgress: number,
  ): void {
    for (const ctrl of this.getAllObjectsForScene(sceneId)) {
      ctrl.evaluateAnimationCue(cue, normalizedProgress);
    }
  }

  public disposeSceneObjects(sceneId: string): number {
    const list = this.getAllObjectsForScene(sceneId);
    for (const ctrl of list) {
      ctrl.disposeResources();
    }
    return list.length;
  }

  public clearAll(): void {
    for (const ctrl of this.controllers.values()) {
      ctrl.disposeResources();
    }
    this.controllers.clear();
  }
}

/**
 * 24-Module Visual Library Mapping (Prompt 05 Section 29)
 * Maps every module in the 6 pedagogical stages to its reusable scientific 3D primitives.
 */
export interface ModuleVisualLibraryEntry {
  moduleId: string;
  stageId: 1 | 2 | 3 | 4 | 5 | 6;
  categoryGroup: string;
  primaryArchetype:
    | "cosmic_zoom"
    | "orbital_mechanics"
    | "black_hole_relativity"
    | "stellar_physics"
    | "galactic_structure"
    | "cosmological_expansion"
    | "observatory_instrument";
  reusablePrimitives: string[];
  scaleRegime: AstronomicalScaleRegime;
  scientificRepresentation: ScientificRepresentationCategory;
}

export const MODULE_24_VISUAL_LIBRARY_MAP: Record<string, ModuleVisualLibraryEntry> = {
  "01": {
    moduleId: "01",
    stageId: 1,
    categoryGroup: "Cosmic scale, celestial motion, light propagation and observational geometry",
    primaryArchetype: "cosmic_zoom",
    reusablePrimitives: [
      "ScientificPlanetMaterial(earth)",
      "ScientificAtmosphere(rayleigh_limb)",
      "ScientificPlanetMaterial(moon)",
      "GalaxyParticleField(barred_spiral)",
      "OrbitalTrajectoryRenderer",
      "ScientificAnnotation",
    ],
    scaleRegime: "planetary_scale",
    scientificRepresentation: "SCALE_ADJUSTED_EDUCATIONAL_MODEL",
  },
  "02": {
    moduleId: "02",
    stageId: 1,
    categoryGroup: "Cosmic scale, celestial motion, light propagation and observational geometry",
    primaryArchetype: "cosmic_zoom",
    reusablePrimitives: [
      "ScientificPlanetMaterial(earth)",
      "StarClusterRenderer(constellation_depth)",
      "ScientificVectorField(celestial_poles)",
      "ScientificAnnotation",
    ],
    scaleRegime: "interstellar_scale",
    scientificRepresentation: "OBSERVATION_BASED",
  },
  "03": {
    moduleId: "03",
    stageId: 1,
    categoryGroup: "Cosmic scale, celestial motion, light propagation and observational geometry",
    primaryArchetype: "cosmic_zoom",
    reusablePrimitives: [
      "OrbitalTrajectoryRenderer(parallax_baseline_1au)",
      "ScientificStarMaterial(nearby_star)",
      "ScientificVectorField(parallax_angle)",
      "ScientificAnnotation",
    ],
    scaleRegime: "interstellar_scale",
    scientificRepresentation: "PHYSICS_BASED_SIMULATION",
  },
  "04": {
    moduleId: "04",
    stageId: 1,
    categoryGroup: "Cosmic scale, celestial motion, light propagation and observational geometry",
    primaryArchetype: "cosmic_zoom",
    reusablePrimitives: [
      "ScientificPlanetMaterial(earth)",
      "ScientificPlanetMaterial(moon)",
      "GalaxyParticleField(lookback_horizon)",
      "ScientificVectorField(photon_wavefront)",
    ],
    scaleRegime: "cosmological_scale",
    scientificRepresentation: "PHYSICS_BASED_SIMULATION",
  },
  "05": {
    moduleId: "05",
    stageId: 2,
    categoryGroup: "Planetary systems, stellar illumination, gravity and orbital dynamics",
    primaryArchetype: "orbital_mechanics",
    reusablePrimitives: [
      "ScientificStarMaterial(sun_g2v)",
      "ScientificPlanetMaterial(earth_axial_tilt_23_44)",
      "ScientificPlanetMaterial(moon_phases)",
      "OrbitalTrajectoryRenderer(lunar_nodes_5_145deg)",
      "ScientificVectorField(umbra_penumbra_cones)",
    ],
    scaleRegime: "interplanetary_scale",
    scientificRepresentation: "PHYSICS_BASED_SIMULATION",
  },
  "06": {
    moduleId: "06",
    stageId: 2,
    categoryGroup: "Planetary systems, stellar illumination, gravity and orbital dynamics",
    primaryArchetype: "orbital_mechanics",
    reusablePrimitives: [
      "ScientificPlanetMaterial(earth)",
      "ScientificPlanetMaterial(mars)",
      "ScientificPlanetMaterial(jupiter)",
      "ScientificPlanetMaterial(saturn_with_rings)",
      "ScientificPlanetMaterial(neptune)",
      "OrbitalTrajectoryRenderer",
    ],
    scaleRegime: "interplanetary_scale",
    scientificRepresentation: "SCALE_ADJUSTED_EDUCATIONAL_MODEL",
  },
  "07": {
    moduleId: "07",
    stageId: 2,
    categoryGroup: "Planetary systems, stellar illumination, gravity and orbital dynamics",
    primaryArchetype: "stellar_physics",
    reusablePrimitives: [
      "ScientificStarMaterial(sun_g2v_granulation)",
      "StellarStructureCutaway(core_radiative_convective)",
      "ScientificVectorField(coronal_magnetic_loops)",
      "ScientificAnnotation",
    ],
    scaleRegime: "stellar_scale",
    scientificRepresentation: "PHYSICS_BASED_SIMULATION",
  },
  "08": {
    moduleId: "08",
    stageId: 2,
    categoryGroup: "Planetary systems, stellar illumination, gravity and orbital dynamics",
    primaryArchetype: "orbital_mechanics",
    reusablePrimitives: [
      "ScientificStarMaterial(sun_g2v)",
      "ScientificPlanetMaterial(earth)",
      "ScientificPlanetMaterial(jupiter)",
      "OrbitalTrajectoryRenderer(kepler_equal_areas)",
      "ScientificVectorField(velocity_and_gravity_triad)",
      "ScientificVectorField(gravitational_potential_grid)",
      "ScientificAnnotation",
    ],
    scaleRegime: "interplanetary_scale",
    scientificRepresentation: "PHYSICS_BASED_SIMULATION",
  },
  "09": {
    moduleId: "09",
    stageId: 3,
    categoryGroup: "Stars, stellar evolution, nebulae, exoplanets and detection methods",
    primaryArchetype: "stellar_physics",
    reusablePrimitives: [
      "ScientificStarMaterial(obafgkm_sequence)",
      "StellarStructureCutaway",
      "StarClusterRenderer(hr_diagram_3d)",
      "ScientificAnnotation",
    ],
    scaleRegime: "stellar_scale",
    scientificRepresentation: "OBSERVATION_BASED",
  },
  "10": {
    moduleId: "10",
    stageId: 3,
    categoryGroup: "Stars, stellar evolution, nebulae, exoplanets and detection methods",
    primaryArchetype: "stellar_physics",
    reusablePrimitives: [
      "ScientificStarMaterial(red_giant_and_supergiant)",
      "StellarStructureCutaway(onion_skin_fusion_shells)",
      "NebulaVolume(supernova_remnant)",
      "PulsarBeamRenderer",
    ],
    scaleRegime: "stellar_scale",
    scientificRepresentation: "PHYSICS_BASED_SIMULATION",
  },
  "11": {
    moduleId: "11",
    stageId: 3,
    categoryGroup: "Stars, stellar evolution, nebulae, exoplanets and detection methods",
    primaryArchetype: "stellar_physics",
    reusablePrimitives: [
      "NebulaVolume(emission_h_alpha_oiii)",
      "NebulaVolume(dark_molecular_cloud)",
      "NebulaVolume(reflection_dust)",
      "ScientificStarMaterial(protostar)",
    ],
    scaleRegime: "interstellar_scale",
    scientificRepresentation: "OBSERVATION_BASED",
  },
  "12": {
    moduleId: "12",
    stageId: 3,
    categoryGroup: "Stars, stellar evolution, nebulae, exoplanets and detection methods",
    primaryArchetype: "orbital_mechanics",
    reusablePrimitives: [
      "ScientificStarMaterial(host_star)",
      "ScientificPlanetMaterial(transiting_exoplanet)",
      "ScientificAtmosphere(transmission_spectroscopy_limb)",
      "OrbitalTrajectoryRenderer(transit_chord)",
    ],
    scaleRegime: "planetary_scale",
    scientificRepresentation: "PHYSICS_BASED_SIMULATION",
  },
  "13": {
    moduleId: "13",
    stageId: 4,
    categoryGroup: "Galaxies, black holes, cosmic web, dark matter and dark energy",
    primaryArchetype: "galactic_structure",
    reusablePrimitives: [
      "GalaxyParticleField(spiral_and_barred_spiral)",
      "GalaxyParticleField(elliptical)",
      "StarClusterRenderer(globular_halo)",
      "NebulaVolume(dust_lanes)",
    ],
    scaleRegime: "galactic_scale",
    scientificRepresentation: "OBSERVATION_BASED",
  },
  "14": {
    moduleId: "14",
    stageId: 4,
    categoryGroup: "Galaxies, black holes, cosmic web, dark matter and dark energy",
    primaryArchetype: "black_hole_relativity",
    reusablePrimitives: [
      "ScientificBlackHoleEffects(event_horizon_and_photon_sphere)",
      "ScientificBlackHoleEffects(doppler_accretion_disk)",
      "ScientificBlackHoleEffects(gravitational_lensing_halo)",
      "PulsarBeamRenderer(lighthouse_dipole)",
      "ScientificVectorField(spacetime_curvature_funnel)",
      "ScientificAnnotation",
    ],
    scaleRegime: "stellar_scale",
    scientificRepresentation: "PHYSICS_BASED_SIMULATION",
  },
  "15": {
    moduleId: "15",
    stageId: 4,
    categoryGroup: "Galaxies, black holes, cosmic web, dark matter and dark energy",
    primaryArchetype: "galactic_structure",
    reusablePrimitives: [
      "GalaxyParticleField(cosmic_web_filaments)",
      "StarClusterRenderer(supercluster_nodes)",
      "ScientificVectorField(peculiar_velocity_flows)",
    ],
    scaleRegime: "cosmological_scale",
    scientificRepresentation: "OBSERVATION_BASED",
  },
  "16": {
    moduleId: "16",
    stageId: 4,
    categoryGroup: "Galaxies, black holes, cosmic web, dark matter and dark energy",
    primaryArchetype: "galactic_structure",
    reusablePrimitives: [
      "GalaxyParticleField(flat_rotation_curve_disk)",
      "NebulaVolume(nfw_dark_matter_halo)",
      "ScientificVectorField(keplerian_vs_flat_velocity_vectors)",
    ],
    scaleRegime: "galactic_scale",
    scientificRepresentation: "PHYSICS_BASED_SIMULATION",
  },
  "17": {
    moduleId: "17",
    stageId: 5,
    categoryGroup: "Cosmology, expansion, historical models and future scenarios",
    primaryArchetype: "cosmological_expansion",
    reusablePrimitives: [
      "NebulaVolume(cmb_recombination_surface)",
      "GalaxyParticleField(early_universe_density_fluctuations)",
      "ScientificAnnotation",
    ],
    scaleRegime: "cosmological_scale",
    scientificRepresentation: "OBSERVATION_BASED",
  },
  "18": {
    moduleId: "18",
    stageId: 5,
    categoryGroup: "Cosmology, expansion, historical models and future scenarios",
    primaryArchetype: "cosmological_expansion",
    reusablePrimitives: [
      "GalaxyParticleField(hubble_flow_recession)",
      "ScientificVectorField(comoving_metric_grid_expansion)",
      "ScientificAnnotation",
    ],
    scaleRegime: "cosmological_scale",
    scientificRepresentation: "PHYSICS_BASED_SIMULATION",
  },
  "19": {
    moduleId: "19",
    stageId: 5,
    categoryGroup: "Cosmology, expansion, historical models and future scenarios",
    primaryArchetype: "orbital_mechanics",
    reusablePrimitives: [
      "OrbitalTrajectoryRenderer(ptolemaic_deferent_epicycle_vs_copernican)",
      "ScientificPlanetMaterial(mars_retrograde_loop)",
      "ScientificStarMaterial(sun_g2v)",
    ],
    scaleRegime: "interplanetary_scale",
    scientificRepresentation: "PHYSICS_BASED_SIMULATION",
  },
  "20": {
    moduleId: "20",
    stageId: 5,
    categoryGroup: "Cosmology, expansion, historical models and future scenarios",
    primaryArchetype: "cosmological_expansion",
    reusablePrimitives: [
      "ScientificStarMaterial(red_dwarf_to_white_dwarf_cooling)",
      "ScientificBlackHoleEffects(hawking_evaporation_epoch)",
      "GalaxyParticleField(accelerating_de_sitter_horizon)",
    ],
    scaleRegime: "cosmological_scale",
    scientificRepresentation: "PHYSICS_BASED_SIMULATION",
  },
  "21": {
    moduleId: "21",
    stageId: 6,
    categoryGroup: "Telescopes, spacecraft, astrobiology and physics laboratories",
    primaryArchetype: "observatory_instrument",
    reusablePrimitives: [
      "ScientificVectorField(optical_ray_tracing_aperture)",
      "StarClusterRenderer(airy_diffraction_resolution)",
      "ScientificAnnotation",
    ],
    scaleRegime: "planetary_scale",
    scientificRepresentation: "PHYSICS_BASED_SIMULATION",
  },
  "22": {
    moduleId: "22",
    stageId: 6,
    categoryGroup: "Telescopes, spacecraft, astrobiology and physics laboratories",
    primaryArchetype: "orbital_mechanics",
    reusablePrimitives: [
      "ScientificPlanetMaterial(jupiter)",
      "OrbitalTrajectoryRenderer(gravity_assist_hyperbola)",
      "ScientificVectorField(heliocentric_delta_v_boost)",
    ],
    scaleRegime: "interplanetary_scale",
    scientificRepresentation: "PHYSICS_BASED_SIMULATION",
  },
  "23": {
    moduleId: "23",
    stageId: 6,
    categoryGroup: "Telescopes, spacecraft, astrobiology and physics laboratories",
    primaryArchetype: "orbital_mechanics",
    reusablePrimitives: [
      "ScientificPlanetMaterial(europa_icy_shell)",
      "StellarStructureCutaway(subsurface_ocean_hydrothermal)",
      "ScientificAtmosphere(biosignature_disequilibrium_spectrum)",
    ],
    scaleRegime: "planetary_scale",
    scientificRepresentation: "ARTISTIC_SCIENTIFIC_RECONSTRUCTION",
  },
  "24": {
    moduleId: "24",
    stageId: 6,
    categoryGroup: "Telescopes, spacecraft, astrobiology and physics laboratories",
    primaryArchetype: "orbital_mechanics",
    reusablePrimitives: [
      "ScientificStarMaterial(sun_g2v)",
      "ScientificPlanetMaterial(earth)",
      "ScientificBlackHoleEffects",
      "GalaxyParticleField",
      "OrbitalTrajectoryRenderer",
      "ScientificVectorField",
      "ScientificAnnotation",
    ],
    scaleRegime: "interplanetary_scale",
    scientificRepresentation: "PHYSICS_BASED_SIMULATION",
  },
};
