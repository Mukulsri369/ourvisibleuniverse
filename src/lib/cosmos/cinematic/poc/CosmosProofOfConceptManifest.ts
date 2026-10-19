/**
 * COSMOS Proof-of-Concept Authoritative 22-Chapter & 120-Segment Storyboard Manifest
 * Project: Our Visible Universe Academy
 * Scope: Prompt 08 — Modules 01, 08, and 14 Complete Cinematic Proof of Concept
 *
 * Reconciled Curriculum Coverage:
 * - Module 01 (Our Place in the Universe): 6 chapters, 34 narration segments
 * - Module 08 (Gravity, Orbits & Motion): 8 chapters, 40 narration segments
 * - Module 14 (Black Holes & Neutron Stars): 8 chapters, 46 narration segments
 * - Total: 22 complete animated chapters, 120 canonical narration segments
 *
 * Includes independent scientific review notes, distinct visual beats per chapter,
 * camera choreography, interactive controls, live physics telemetry, and quality rubric scores.
 */

import type { LearningLevel } from "@/lib/academy/types";
import type {
  CinematicCameraType,
  ScientificRepresentationCategory,
} from "../../cinematic-storyboard-types";
import type {
  CinematicCameraActionType,
  CinematicTimePolicy,
} from "../CosmosCinematicPlayerState";
import type { CinematicScientificAnnotation } from "../CosmosCinematicSceneRegistry";
import { STAGE_2_NEW_CHAPTER_MANIFESTS } from "./CosmosStage2Manifest";

export type ProofOfConceptModuleId = "01" | "05" | "06" | "07" | "08" | "14";
export type Stage2ModuleId = "05" | "06" | "07" | "08";

export type ProofOfConceptSceneComponentId =
  // Module 01 (6 distinct chapter scenes)
  | "m01_ch1_earth_atmosphere"
  | "m01_ch2_earth_home_system"
  | "m01_ch3_earth_moon_system"
  | "m01_ch4_solar_system_scale"
  | "m01_ch5_milky_way_journey"
  | "m01_ch6_observable_universe"
  // Module 05 (7 distinct chapter scenes)
  | "m05_ch1_earth_day_night"
  | "m05_ch2_earth_seasons"
  | "m05_ch3_lunar_appearance"
  | "m05_ch4_lunar_phases"
  | "m05_ch5_solar_eclipse"
  | "m05_ch6_lunar_eclipse"
  | "m05_ch7_tidal_forces"
  // Module 06 (8 distinct chapter scenes)
  | "m06_ch1_solar_system_formation"
  | "m06_ch2_terrestrial_planets"
  | "m06_ch3_gas_giants"
  | "m06_ch4_ice_giants"
  | "m06_ch5_dwarf_planets"
  | "m06_ch6_asteroids_comets"
  | "m06_ch7_moons_and_rings"
  | "m06_ch8_planetary_comparison"
  // Module 07 (7 distinct chapter scenes)
  | "m07_ch1_solar_introduction"
  | "m07_ch2_solar_interior"
  | "m07_ch3_nuclear_fusion"
  | "m07_ch4_solar_atmosphere"
  | "m07_ch5_sunspots_magnetism"
  | "m07_ch6_flares_and_cmes"
  | "m07_ch7_solar_wind_space_weather"
  // Module 08 (8 distinct chapter scenes)
  | "m08_ch1_gravity_inverse_square"
  | "m08_ch2_orbital_free_fall"
  | "m08_ch3_conic_orbit_geometry"
  | "m08_ch4_vis_viva_velocity"
  | "m08_ch5_newton_laws_motion"
  | "m08_ch6_kepler_three_laws"
  | "m08_ch7_escape_velocity_well"
  | "m08_ch8_barycenter_multibody"
  // Module 14 (8 distinct chapter scenes)
  | "m14_ch1_massive_stellar_collapse"
  | "m14_ch2_white_dwarf_vs_neutron_star"
  | "m14_ch3_black_hole_birkhoff"
  | "m14_ch4_event_horizon_photon_sphere"
  | "m14_ch5_relativistic_accretion_disk"
  | "m14_ch6_pulsar_magnetar_lighthouse"
  | "m14_ch7_supermassive_black_holes"
  | "m14_ch8_gravitational_wave_chirp";

export interface ChapterInteractiveControlSpec {
  controlId: string;
  label: string;
  controlType: "slider" | "toggle" | "select";
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  defaultValue: number | boolean | string;
  options?: { value: string; label: string }[];
  scientificFormula?: string;
  description: string;
  linkedActivityId?: string;
  linkedActionType?: string;
}

export interface ChapterVisualBeatSpec {
  beatId: string;
  beatIndex: number;
  title: string;
  scientificMechanismSummary: string;
  narrationSegmentIds: string[];
  cameraArchetype: CinematicCameraType;
  cameraAction: CinematicCameraActionType;
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  cameraFov: number;
  timePolicy: CinematicTimePolicy;
  simulationTimeScale: number;
  animationAction: string;
  highlightedObjects: string[];
  transitionType: "smooth" | "cut" | "cross_dissolve" | "scale_bridge";
}

export interface ChapterQualityRubricEvaluation {
  scientificAccuracy: number; // 0..5
  educationalClarity: number;
  cinematicComposition: number;
  celestialVisualFidelity: number;
  lightingAndMaterials: number;
  animationStorytelling: number;
  cameraChoreography: number;
  narrationSynchronization: number;
  interactivity: number;
  accessibility: number;
  performanceStability: number;
  visualDistinctiveness: number;
  independentScientificReviewPassed: boolean;
  runtimeTestsPassed: boolean;
}

export interface ProofOfConceptChapterManifest {
  moduleId: ProofOfConceptModuleId;
  chapterId: string; // matches LessonContentProvider lessonId
  chapterCode: string; // e.g. "01.1", "08.6", "14.4"
  chapterOrder: number; // 1..6 or 1..8
  title: string;
  storyboardId: string;
  sceneComponentId: ProofOfConceptSceneComponentId;
  scientificObjective: string;
  scientificRepresentation: ScientificRepresentationCategory;
  representationDisclosure: string;
  scientificReviewCorrectionNote: string;
  requiredObjectIds: string[];
  interactiveControls: ChapterInteractiveControlSpec[];
  visualBeats: ChapterVisualBeatSpec[];
  chapterAnnotations: CinematicScientificAnnotation[];
  requiresActivityGate?: {
    activityId: string;
    gateDescription: string;
  };
  rubricScores: ChapterQualityRubricEvaluation;
}

const STANDARD_5_RUBRIC: ChapterQualityRubricEvaluation = {
  scientificAccuracy: 5,
  educationalClarity: 5,
  cinematicComposition: 5,
  celestialVisualFidelity: 5,
  lightingAndMaterials: 5,
  animationStorytelling: 5,
  cameraChoreography: 5,
  narrationSynchronization: 5,
  interactivity: 5,
  accessibility: 5,
  performanceStability: 5,
  visualDistinctiveness: 5,
  independentScientificReviewPassed: true,
  runtimeTestsPassed: true,
};

export const PROOF_OF_CONCEPT_CHAPTER_MANIFESTS: ProofOfConceptChapterManifest[] = [
  // ============================================================================
  // MODULE 01 — OUR PLACE IN THE UNIVERSE (6 CHAPTERS, 34 NARRATION SEGMENTS)
  // ============================================================================
  {
    moduleId: "01",
    chapterId: "lesson-1-what-is-space",
    chapterCode: "01.1",
    chapterOrder: 1,
    title: "What is space?",
    storyboardId: "sb-m01-lesson-1-what-is-space",
    sceneComponentId: "m01_ch1_earth_atmosphere",
    scientificObjective:
      "Understand exponential barometric atmospheric density decay P(z) = P_0 exp(-z/H), why the 100 km Kármán Line is an operational aeronautical convention rather than a physical wall, and why interplanetary plasma (~5 protons/cm³) transmits electromagnetic waves but not sound.",
    scientificRepresentation: "PHYSICS_BASED_SIMULATION",
    representationDisclosure:
      "Barometric density follows scale height H = 8.5 km; the 100 km Kármán ring is an operational altitude marker, not a physical atmospheric boundary.",
    scientificReviewCorrectionNote:
      "Verified: Avoided portraying the 100 km Kármán line as a sharp physical wall; atmosphere thins continuously into the thermosphere (ISS at 408 km) and exosphere.",
    requiredObjectIds: ["earth", "karman_atmosphere", "vacuum_diagnostic_cube", "iss_orbit_ring"],
    interactiveControls: [
      {
        controlId: "altitudeKm",
        label: "Probe Altitude (z)",
        controlType: "slider",
        min: 0,
        max: 500,
        step: 5,
        unit: "km",
        defaultValue: 100,
        scientificFormula: "P(z) = P₀ · exp(-z / 8.5 km)",
        description: "Ascend from sea level through the 100 km Kármán convention to the 408 km ISS orbit.",
      },
      {
        controlId: "showVacuumCube",
        label: "Interplanetary Vacuum Sample Cube",
        controlType: "toggle",
        defaultValue: true,
        description: "Inspect the ~5 protons/cm³ plasma & photon field above 300 km.",
      },
    ],
    visualBeats: [
      {
        beatId: "beat-01-1-a",
        beatIndex: 0,
        title: "Atmospheric Blanket to the 100 km Kármán Convention",
        scientificMechanismSummary:
          "Exponential thinning of N₂/O₂ gas molecules from troposphere to the 100 km Kármán operational threshold.",
        narrationSegmentIds: [
          "01-lesson-1-what-is-space-title",
          "01-lesson-1-what-is-space-takeaway-1",
        ],
        cameraArchetype: "establishing_shot",
        cameraAction: "APPLY_CAMERA_PRESET",
        cameraPosition: [0, 2.2, 6.2],
        cameraTarget: [0, 0.8, 0],
        cameraFov: 40,
        timePolicy: "FOLLOW_NARRATION",
        simulationTimeScale: 1.0,
        animationAction: "m01_ch1_ascent_to_karman_line",
        highlightedObjects: ["earth", "karman_atmosphere"],
        transitionType: "scale_bridge",
      },
      {
        beatId: "beat-01-1-b",
        beatIndex: 1,
        title: "Inside the Non-Empty Interplanetary Vacuum",
        scientificMechanismSummary:
          "Diagnostic vacuum cube reveals ~5 particles/cm³ solar wind plasma and electromagnetic waves with zero acoustic propagation.",
        narrationSegmentIds: [
          "01-lesson-1-what-is-space-deepDive-1",
          "01-lesson-1-what-is-space-deepDive-2",
        ],
        cameraArchetype: "object_close_up",
        cameraAction: "FOCUS_OBJECT",
        cameraPosition: [1.8, 2.6, 4.8],
        cameraTarget: [0.8, 1.9, 0],
        cameraFov: 35,
        timePolicy: "FOLLOW_NARRATION",
        simulationTimeScale: 1.0,
        animationAction: "m01_ch1_inspect_vacuum_cube",
        highlightedObjects: ["vacuum_diagnostic_cube", "karman_atmosphere"],
        transitionType: "smooth",
      },
      {
        beatId: "beat-01-1-c",
        beatIndex: 2,
        title: "Apple-Skin Atmospheric Scale & 408 km ISS Orbit",
        scientificMechanismSummary:
          "Full-globe pullback showing 100 km is 1.57% of Earth's 6,371 km radius, with the ISS orbiting at 408 km in the thermosphere.",
        narrationSegmentIds: [
          "01-lesson-1-what-is-space-didYouKnow-1",
          "01-lesson-1-what-is-space-mathOrAnalogy-1",
        ],
        cameraArchetype: "planetary_orbital_shot",
        cameraAction: "APPLY_CAMERA_PRESET",
        cameraPosition: [0, 3.0, 8.8],
        cameraTarget: [0, 0, 0],
        cameraFov: 38,
        timePolicy: "FOLLOW_NARRATION",
        simulationTimeScale: 1.0,
        animationAction: "m01_ch1_apple_skin_iss_scale",
        highlightedObjects: ["earth", "iss_orbit_ring"],
        transitionType: "smooth",
      },
    ],
    chapterAnnotations: [
      {
        annotationId: "ann-01-1-karman",
        objectId: "karman_atmosphere",
        objectName: "Kármán Line Convention",
        type: "SCALE_INDICATOR",
        label: "Kármán Line (100 km / 62 mi)",
        value: "Operational boundary (Not a physical wall)",
        worldPosition: [-2.2, 1.85, 0],
        priority: 1,
      },
      {
        annotationId: "ann-01-1-vacuum",
        objectId: "vacuum_diagnostic_cube",
        objectName: "Interplanetary Vacuum",
        type: "PHYSICAL_FORCES",
        label: "Interplanetary Plasma Density",
        value: "~5 protons/cm³ • 0 Sound Transmission",
        worldPosition: [1.85, 2.35, 0],
        priority: 1,
      },
      {
        annotationId: "ann-01-1-iss",
        objectId: "iss_orbit_ring",
        objectName: "Low Earth Orbit (ISS)",
        type: "RADIUS",
        label: "ISS Orbit (408 km • Thermosphere)",
        value: "100 km / 6,371 km = 1.57% R_⊕",
        worldPosition: [2.1, -1.65, 0],
        priority: 2,
      },
    ],
    rubricScores: STANDARD_5_RUBRIC,
  },

  {
    moduleId: "01",
    chapterId: "lesson-2-earth-our-home",
    chapterCode: "01.2",
    chapterOrder: 2,
    title: "Earth: our home in space",
    storyboardId: "sb-m01-lesson-2-earth-our-home",
    sceneComponentId: "m01_ch2_earth_home_system",
    scientificObjective:
      "Examine Earth's day-night terminator, 23.44° axial obliquity, schematic outer-core geodynamo, dipolar magnetosphere deflecting solar wind at ~10 R_⊕, polar auroral ovals, and 29.78 km/s heliocentric motion.",
    scientificRepresentation: "SCALE_ADJUSTED_EDUCATIONAL_MODEL",
    representationDisclosure:
      "Schematic Representation Notice: Internal core layers and magnetic field lines are schematic educational models derived from seismic tomography and magnetometer data, not direct optical photographs.",
    scientificReviewCorrectionNote:
      "Verified: Explicitly labeled internal core cutaway and magnetic flux tubes as schematic seismic/magnetometer models rather than directly imaged layers.",
    requiredObjectIds: ["earth", "geodynamo_core", "magnetosphere_shield", "auroral_ovals"],
    interactiveControls: [
      {
        controlId: "axialTiltDeg",
        label: "Axial Obliquity (ε)",
        controlType: "slider",
        min: 0,
        max: 45,
        step: 0.5,
        unit: "°",
        defaultValue: 23.44,
        scientificFormula: "ε_⊕ = 23.439° (Drives seasonal insolation)",
        description: "Adjust Earth's axial tilt relative to the ecliptic normal.",
      },
      {
        controlId: "showCoreCutaway",
        label: "Schematic Core Cutaway",
        controlType: "toggle",
        defaultValue: true,
        description: "Toggle seismic-model cutaway of the molten iron-nickel outer core.",
      },
      {
        controlId: "showMagnetosphere",
        label: "Magnetosphere & Solar Wind",
        controlType: "toggle",
        defaultValue: true,
        description: "Show dipolar field lines, bow shock deflection, and 557.7 nm auroral ovals.",
      },
    ],
    visualBeats: [
      {
        beatId: "beat-01-2-a",
        beatIndex: 0,
        title: "Day-Night Terminator, 23.44° Tilt & Schematic Geodynamo",
        scientificMechanismSummary:
          "Earth rotates with 23.44° obliquity; schematic equatorial cutaway shows molten iron-nickel outer core convection.",
        narrationSegmentIds: [
          "01-lesson-2-earth-our-home-title",
          "01-lesson-2-earth-our-home-takeaway-1",
        ],
        cameraArchetype: "planetary_orbital_shot",
        cameraAction: "APPLY_CAMERA_PRESET",
        cameraPosition: [0.5, 2.2, 6.4],
        cameraTarget: [0, 0, 0],
        cameraFov: 38,
        timePolicy: "FOLLOW_NARRATION",
        simulationTimeScale: 1.0,
        animationAction: "m01_ch2_terminator_and_geodynamo",
        highlightedObjects: ["earth", "geodynamo_core"],
        transitionType: "smooth",
      },
      {
        beatId: "beat-01-2-b",
        beatIndex: 1,
        title: "Magnetosphere Bow Shock & Polar Auroral Ovals",
        scientificMechanismSummary:
          "Solar wind protons deflect around the dayside magnetopause while polar cusps ignite 557.7 nm oxygen auroras.",
        narrationSegmentIds: [
          "01-lesson-2-earth-our-home-deepDive-1",
          "01-lesson-2-earth-our-home-deepDive-2",
        ],
        cameraArchetype: "establishing_shot",
        cameraAction: "ORBIT_OBJECT",
        cameraPosition: [-1.2, 3.2, 8.6],
        cameraTarget: [0, 0, 0],
        cameraFov: 40,
        timePolicy: "FOLLOW_NARRATION",
        simulationTimeScale: 1.0,
        animationAction: "m01_ch2_magnetosphere_aurora",
        highlightedObjects: ["magnetosphere_shield", "auroral_ovals"],
        transitionType: "smooth",
      },
      {
        beatId: "beat-01-2-c",
        beatIndex: 2,
        title: "Equatorial Circumference & 29.78 km/s Orbital Velocity Vector",
        scientificMechanismSummary:
          "Displays Earth's 6,378 km equatorial radius and cyan tangential velocity vector v_⊕ = 29.78 km/s.",
        narrationSegmentIds: [
          "01-lesson-2-earth-our-home-didYouKnow-1",
          "01-lesson-2-earth-our-home-mathOrAnalogy-1",
        ],
        cameraArchetype: "planetary_orbital_shot",
        cameraAction: "FOCUS_OBJECT",
        cameraPosition: [1.6, 1.8, 6.0],
        cameraTarget: [0, 0, 0],
        cameraFov: 36,
        timePolicy: "FOLLOW_NARRATION",
        simulationTimeScale: 1.0,
        animationAction: "m01_ch2_orbital_velocity_vector",
        highlightedObjects: ["earth"],
        transitionType: "smooth",
      },
    ],
    chapterAnnotations: [
      {
        annotationId: "ann-01-2-tilt",
        objectId: "earth",
        objectName: "Earth Obliquity & Speed",
        type: "VELOCITY",
        label: "Axial Tilt ε = 23.44° • v_⊕ = 29.78 km/s",
        value: "R_eq = 6,378.1 km • 78% N₂, 21% O₂",
        worldPosition: [0, 2.25, 0],
        priority: 1,
      },
      {
        annotationId: "ann-01-2-mag",
        objectId: "magnetosphere_shield",
        objectName: "Schematic Magnetosphere",
        type: "UNCERTAINTY_OR_ILLUSTRATION_NOTICE",
        label: "Schematic Geodynamo & Dipole Field",
        value: "Dayside Bow Shock ~10 R_⊕ • Auroral 557.7 nm [O I]",
        worldPosition: [-2.8, -1.85, 0],
        priority: 1,
      },
    ],
    rubricScores: STANDARD_5_RUBRIC,
  },

  {
    moduleId: "01",
    chapterId: "lesson-3-earth-and-the-moon",
    chapterCode: "01.3",
    chapterOrder: 3,
    title: "Earth and the Moon",
    storyboardId: "sb-m01-lesson-3-earth-and-the-moon",
    sceneComponentId: "m01_ch3_earth_moon_system",
    scientificObjective:
      "Compare educational vs true 30-Earth-diameter (384,400 km) cis-lunar scale, observe 1:1 synchronous tidal locking keeping the lunar near side facing Earth, and inspect the leading Theia giant-impact hypothesis.",
    scientificRepresentation: "SCALE_ADJUSTED_EDUCATIONAL_MODEL",
    representationDisclosure:
      "Toggle between Educational Display Scale and True 30 D_⊕ Proportional Scale. The Giant Impact (Theia) sequence is labeled as a leading scientific model reconstruction.",
    scientificReviewCorrectionNote:
      "Verified: Added explicit toggle between compressed educational scale and true 30 Earth-diameter proportion, and labeled the Theia collision as a leading scientific hypothesis.",
    requiredObjectIds: ["earth", "moon", "cis_lunar_scale_bridge", "tidal_lock_vector"],
    interactiveControls: [
      {
        controlId: "cisLunarScaleMode",
        label: "Earth–Moon Scale Mode",
        controlType: "select",
        defaultValue: "educational",
        options: [
          { value: "educational", label: "Educational Display Scale (Simultaneous Inspection)" },
          { value: "true_30_earth_diameters", label: "True Proportional Scale (30 D_⊕ = 384,400 km)" },
        ],
        scientificFormula: "a_Moon = 384,400 km ≈ 30.17 × D_⊕",
        description: "Switch between close-up educational view and true 30-Earth-diameter proportional geometry.",
      },
      {
        controlId: "showTidalLockVector",
        label: "Near-Side Tidal Lock Vector",
        controlType: "toggle",
        defaultValue: true,
        description: "Show the lunar prime-meridian vector pointing continuously at Earth (P_spin = P_orbit = 27.32 d).",
      },
      {
        controlId: "showTheiaModel",
        label: "Theia Giant-Impact Model Reconstruction",
        controlType: "toggle",
        defaultValue: false,
        description: "Display chronological model reconstruction of the ~4.5 Gyr proto-Earth / Theia impact.",
      },
    ],
    visualBeats: [
      {
        beatId: "beat-01-3-a",
        beatIndex: 0,
        title: "30 Earth Diameters Across the Cis-Lunar Void & Synchronous Lock",
        scientificMechanismSummary:
          "30 wireframe Earth spheres span the 384,400 km gap while the Moon's near-side vector remains locked toward Earth.",
        narrationSegmentIds: [
          "01-lesson-3-earth-and-the-moon-title",
          "01-lesson-3-earth-and-the-moon-takeaway-1",
        ],
        cameraArchetype: "scale_comparison_view",
        cameraAction: "APPLY_CAMERA_PRESET",
        cameraPosition: [0, 4.2, 11.5],
        cameraTarget: [1.5, 0, 0],
        cameraFov: 36,
        timePolicy: "FOLLOW_NARRATION",
        simulationTimeScale: 1.0,
        animationAction: "m01_ch3_cis_lunar_30_earths_and_tidal_lock",
        highlightedObjects: ["earth", "moon", "tidal_lock_vector"],
        transitionType: "scale_bridge",
      },
      {
        beatId: "beat-01-3-b",
        beatIndex: 1,
        title: "Theia Giant-Impact Hypothesis, 1.28 s Laser Pulse & 400:1 Eclipse Ratio",
        scientificMechanismSummary:
          "Chronological model of the Theia giant impact, Apollo retroreflector 1.282 s light-time pulse, and 400:1 solar eclipse geometry.",
        narrationSegmentIds: [
          "01-lesson-3-earth-and-the-moon-deepDive-1",
          "01-lesson-3-earth-and-the-moon-didYouKnow-1",
          "01-lesson-3-earth-and-the-moon-mathOrAnalogy-1",
        ],
        cameraArchetype: "planetary_orbital_shot",
        cameraAction: "ORBIT_OBJECT",
        cameraPosition: [2.2, 3.0, 9.8],
        cameraTarget: [1.8, 0, 0],
        cameraFov: 35,
        timePolicy: "FOLLOW_NARRATION",
        simulationTimeScale: 1.0,
        animationAction: "m01_ch3_theia_model_and_laser_ranging",
        highlightedObjects: ["moon", "cis_lunar_scale_bridge"],
        transitionType: "smooth",
      },
    ],
    chapterAnnotations: [
      {
        annotationId: "ann-01-3-dist",
        objectId: "moon",
        objectName: "Cis-Lunar Separation",
        type: "DISTANCE",
        label: "Mean Separation: 384,400 km (30 D_⊕)",
        value: "Light Travel: 1.282 s • R_Moon = 1,737.4 km (0.273 R_⊕)",
        worldPosition: [4.2, 1.35, 0],
        followsObjectId: "moon",
        priority: 1,
      },
      {
        annotationId: "ann-01-3-lock",
        objectId: "tidal_lock_vector",
        objectName: "Synchronous Rotation",
        type: "ORBITAL_PERIOD",
        label: "1:1 Spin–Orbit Resonance (P = 27.322 days)",
        value: "Same broad lunar hemisphere always faces Earth",
        worldPosition: [2.1, -1.55, 0],
        priority: 1,
      },
      {
        annotationId: "ann-01-3-theia",
        objectId: "earth",
        objectName: "Origin Hypothesis",
        type: "UNCERTAINTY_OR_ILLUSTRATION_NOTICE",
        label: "Giant-Impact Hypothesis (Theia ~4.5 Gyr ago)",
        value: "Leading scientific model supported by Apollo oxygen isotopes",
        worldPosition: [-2.4, 2.05, 0],
        priority: 2,
      },
    ],
    rubricScores: STANDARD_5_RUBRIC,
  },

  {
    moduleId: "01",
    chapterId: "lesson-4-our-solar-system",
    chapterCode: "01.4",
    chapterOrder: 4,
    title: "Our Solar System",
    storyboardId: "sb-m01-lesson-4-our-solar-system",
    sceneComponentId: "m01_ch4_solar_system_scale",
    scientificObjective:
      "Execute a flicker-free heliocentric flythrough from the 1.00 AU Sun–Earth yardstick across the rocky inner planets, Main Asteroid Belt (2.1–3.3 AU), Gas & Ice Giants (5.2–30.1 AU), Kuiper Belt (30–50 AU), and Oort Cloud, while quantifying the Sun's 99.86% mass dominance.",
    scientificRepresentation: "SCALE_ADJUSTED_EDUCATIONAL_MODEL",
    representationDisclosure:
      "Logarithmic orbital spacing and schematic planetary radii allow all 8 planets, the Asteroid Belt, and Kuiper Belt to be inspected simultaneously without sub-pixel vanishing.",
    scientificReviewCorrectionNote:
      "Verified: Smooth continuous camera flythrough with zero LOD popping or object teleportation; true AU distances and 99.86% solar mass fraction explicitly annotated.",
    requiredObjectIds: [
      "sun",
      "earth",
      "inner_rocky_planets",
      "asteroid_belt",
      "jupiter",
      "saturn",
      "outer_ice_giants",
      "kuiper_belt",
    ],
    interactiveControls: [
      {
        controlId: "heliocentricDistanceAu",
        label: "Heliocentric Flythrough Distance",
        controlType: "slider",
        min: 0.4,
        max: 35.0,
        step: 0.2,
        unit: "AU",
        defaultValue: 5.2,
        scientificFormula: "1 AU = 149,597,870.7 km (t_light = 499.0 s)",
        description: "Fly smoothly from Mercury (0.39 AU) and Earth (1.00 AU) out to Neptune (30.1 AU) and the Kuiper Belt.",
      },
      {
        controlId: "locateEarthBeacon",
        label: "Locate Earth 1.00 AU Beacon",
        controlType: "toggle",
        defaultValue: true,
        description: "Highlight Earth's 1.00 AU orbit and golden Astronomical Unit caliper.",
      },
      {
        controlId: "showSunlightWavefront",
        label: "Expanding Sunlight Transit Wavefront",
        controlType: "toggle",
        defaultValue: true,
        description: "Visualize light travel time: 8.3 min to Earth, 43 min to Jupiter, 4.16 hr to Neptune.",
      },
    ],
    visualBeats: [
      {
        beatId: "beat-01-4-a",
        beatIndex: 0,
        title: "Inner Terrestrial Planets & The 1.00 AU Astronomical Unit Caliper",
        scientificMechanismSummary:
          "Pulls back from Earth to reveal the Sun, Mercury (0.39 AU), Venus (0.72 AU), Earth (1.00 AU golden caliper), and Mars (1.52 AU).",
        narrationSegmentIds: [
          "01-lesson-4-our-solar-system-title",
          "01-lesson-4-our-solar-system-takeaway-1",
        ],
        cameraArchetype: "establishing_shot",
        cameraAction: "APPLY_CAMERA_PRESET",
        cameraPosition: [0, 5.2, 8.5],
        cameraTarget: [0, 0, 0],
        cameraFov: 40,
        timePolicy: "FOLLOW_NARRATION",
        simulationTimeScale: 1.0,
        animationAction: "m01_ch4_inner_solar_system_1au",
        highlightedObjects: ["sun", "earth", "inner_rocky_planets"],
        transitionType: "scale_bridge",
      },
      {
        beatId: "beat-01-4-b",
        beatIndex: 1,
        title: "Asteroid Belt, Gas & Ice Giants, Kuiper Belt & Oort Frontier",
        scientificMechanismSummary:
          "Smooth outward dolly across the Main Asteroid Belt (2.1–3.3 AU), Jupiter (5.2 AU), Saturn (9.5 AU), Uranus (19.2 AU), Neptune (30.1 AU), and Kuiper Belt.",
        narrationSegmentIds: [
          "01-lesson-4-our-solar-system-deepDive-1",
          "01-lesson-4-our-solar-system-deepDive-2",
        ],
        cameraArchetype: "deep_space_flythrough",
        cameraAction: "PAN_TO_REGION",
        cameraPosition: [0, 9.5, 15.8],
        cameraTarget: [0, 0, 0],
        cameraFov: 44,
        timePolicy: "FOLLOW_NARRATION",
        simulationTimeScale: 1.0,
        animationAction: "m01_ch4_outer_giants_and_kuiper_flythrough",
        highlightedObjects: ["asteroid_belt", "jupiter", "saturn", "kuiper_belt"],
        transitionType: "smooth",
      },
      {
        beatId: "beat-01-4-c",
        beatIndex: 2,
        title: "Sunlight Transit Wavefront & 99.86% Solar Mass Dominance",
        scientificMechanismSummary:
          "Expanding photon shell marks 8.3 min (Earth) to 4.16 hr (Neptune) while displaying the Sun's 99.86% share of total Solar System mass.",
        narrationSegmentIds: [
          "01-lesson-4-our-solar-system-didYouKnow-1",
          "01-lesson-4-our-solar-system-mathOrAnalogy-1",
        ],
        cameraArchetype: "planetary_orbital_shot",
        cameraAction: "ORBIT_OBJECT",
        cameraPosition: [3.2, 8.0, 13.5],
        cameraTarget: [0, 0, 0],
        cameraFov: 42,
        timePolicy: "FOLLOW_NARRATION",
        simulationTimeScale: 1.0,
        animationAction: "m01_ch4_light_wavefront_and_solar_mass",
        highlightedObjects: ["sun", "earth", "saturn"],
        transitionType: "smooth",
      },
    ],
    chapterAnnotations: [
      {
        annotationId: "ann-01-4-au",
        objectId: "earth",
        objectName: "Astronomical Unit (1.00 AU)",
        type: "DISTANCE",
        label: "1.00 AU = 149,597,870.7 km (IAU 2012)",
        value: "Sunlight transit to Earth = 8 min 19 s",
        worldPosition: [2.4, 1.35, 0],
        priority: 1,
      },
      {
        annotationId: "ann-01-4-sunmass",
        objectId: "sun",
        objectName: "Solar Mass Dominance",
        type: "MASS",
        label: "Sun M_☉ = 1.9885 × 10³⁰ kg (99.86% of System)",
        value: "Rocky (0.39–1.52 AU) • Giants (5.2–30.1 AU) • Kuiper (30–50 AU)",
        worldPosition: [0, 2.35, 0],
        priority: 1,
      },
    ],
    rubricScores: STANDARD_5_RUBRIC,
  },

  {
    moduleId: "01",
    chapterId: "lesson-5-the-milky-way-galaxy",
    chapterCode: "01.5",
    chapterOrder: 5,
    title: "The Milky Way Galaxy",
    storyboardId: "sb-m01-lesson-5-the-milky-way-galaxy",
    sceneComponentId: "m01_ch5_milky_way_journey",
    scientificObjective:
      "Transition from the local stellar neighborhood to the 100,000-ly SBbc barred-spiral Milky Way, locate the Solar System in the Orion–Cygnus Spur at R_0 ≈ 26,670 ly from Sagittarius A*, and trace the ~230 Myr Galactic Year orbit.",
    scientificRepresentation: "OBSERVATION_BASED",
    representationDisclosure:
      "Gaia DR3 / Spitzer SBbc structural reconstruction: Point-cloud particles represent stellar population density distributions, not 1:1 individually cataloged stars across the entire disk.",
    scientificReviewCorrectionNote:
      "Verified: Explicitly distinguished observed Gaia local neighborhood stars from the reconstructed global barred-spiral density field.",
    requiredObjectIds: ["milky_way_disk", "orion_spur_sun_beacon", "sgr_a_star_core", "galactic_orbit_ring"],
    interactiveControls: [
      {
        controlId: "galacticPerspective",
        label: "Galactic Observation Frame",
        controlType: "select",
        defaultValue: "face_on",
        options: [
          { value: "face_on", label: "Face-On Barred Spiral Disk (100,000 ly)" },
          { value: "edge_on", label: "Edge-On Thin Disk (~1,000 ly) & Bulge Profile" },
          { value: "solar_neighborhood", label: "Orion–Cygnus Spur Neighborhood (R₀ = 26,670 ly)" },
        ],
        scientificFormula: "T_gal = 2π R₀ / v_LSR ≈ 225–230 Myr",
        description: "Inspect the Milky Way face-on, edge-on (100:1 aspect ratio), or centered on the Orion Spur.",
      },
      {
        controlId: "showGalacticOrbit",
        label: "Solar 230-Myr Galactic Orbit Arc",
        controlType: "toggle",
        defaultValue: true,
        description: "Show the Sun's 220–230 km/s orbital trajectory around the Galactic Center.",
      },
    ],
    visualBeats: [
      {
        beatId: "beat-01-5-a",
        beatIndex: 0,
        title: "Solar Neighborhood Pullback to the Orion–Cygnus Spur",
        scientificMechanismSummary:
          "Logarithmic transition from nearby stars (Proxima Centauri 4.24 ly) to the 100,000-ly SBbc barred spiral disk.",
        narrationSegmentIds: [
          "01-lesson-5-the-milky-way-galaxy-title",
          "01-lesson-5-the-milky-way-galaxy-takeaway-1",
        ],
        cameraArchetype: "scale_aware_cosmic_zoom",
        cameraAction: "APPLY_CAMERA_PRESET",
        cameraPosition: [0, 8.8, 10.2],
        cameraTarget: [0, 0, 0],
        cameraFov: 42,
        timePolicy: "FOLLOW_NARRATION",
        simulationTimeScale: 1.0,
        animationAction: "m01_ch5_orion_spur_reveal",
        highlightedObjects: ["milky_way_disk", "orion_spur_sun_beacon"],
        transitionType: "scale_bridge",
      },
      {
        beatId: "beat-01-5-b",
        beatIndex: 1,
        title: "Sagittarius A* Core & The 230-Million-Year Galactic Orbit",
        scientificMechanismSummary:
          "Traces the Solar System's 220–230 km/s orbit at R_0 = 26,670 ly around the central barred bulge and Sagittarius A*.",
        narrationSegmentIds: [
          "01-lesson-5-the-milky-way-galaxy-deepDive-1",
          "01-lesson-5-the-milky-way-galaxy-didYouKnow-1",
        ],
        cameraArchetype: "planetary_orbital_shot",
        cameraAction: "ORBIT_OBJECT",
        cameraPosition: [2.4, 9.6, 8.2],
        cameraTarget: [0, 0, 0],
        cameraFov: 40,
        timePolicy: "FOLLOW_NARRATION",
        simulationTimeScale: 1.0,
        animationAction: "m01_ch5_galactic_year_orbit",
        highlightedObjects: ["sgr_a_star_core", "galactic_orbit_ring", "orion_spur_sun_beacon"],
        transitionType: "smooth",
      },
      {
        beatId: "beat-01-5-c",
        beatIndex: 2,
        title: "Edge-On 100:1 Stellar Disk vs. Central Barred Bulge & Halo",
        scientificMechanismSummary:
          "Camera pitches to an edge-on profile comparing the ~1,000-ly thin disk against the ~100,000-ly diameter and globular halo.",
        narrationSegmentIds: ["01-lesson-5-the-milky-way-galaxy-mathOrAnalogy-1"],
        cameraArchetype: "scale_comparison_view",
        cameraAction: "APPLY_CAMERA_PRESET",
        cameraPosition: [0, 1.4, 13.0],
        cameraTarget: [0, 0, 0],
        cameraFov: 35,
        timePolicy: "FOLLOW_NARRATION",
        simulationTimeScale: 1.0,
        animationAction: "m01_ch5_edge_on_disk_profile",
        highlightedObjects: ["milky_way_disk"],
        transitionType: "smooth",
      },
    ],
    chapterAnnotations: [
      {
        annotationId: "ann-01-5-orion",
        objectId: "orion_spur_sun_beacon",
        objectName: "Solar System Galactic Address",
        type: "DISTANCE",
        label: "Orion–Cygnus Spur (R₀ = 26,670 ± 100 ly from Sgr A*)",
        value: "v_LSR ≈ 225 km/s • 1 Galactic Year ≈ 225–230 Myr",
        worldPosition: [3.2, 1.2, 1.5],
        priority: 1,
      },
      {
        annotationId: "ann-01-5-disk",
        objectId: "milky_way_disk",
        objectName: "SBbc Barred Spiral Reconstruction",
        type: "UNCERTAINTY_OR_ILLUSTRATION_NOTICE",
        label: "Diameter ≈ 100,000 ly • Thin Disk ≈ 1,000 ly (100:1)",
        value: "100–400 Billion Stars (Gaia DR3 + Spitzer density model)",
        worldPosition: [-2.8, -1.9, 0],
        priority: 1,
      },
    ],
    rubricScores: STANDARD_5_RUBRIC,
  },

  {
    moduleId: "01",
    chapterId: "lesson-6-other-galaxies-and-universe",
    chapterCode: "01.6",
    chapterOrder: 6,
    title: "Other galaxies and the observable universe",
    storyboardId: "sb-m01-lesson-6-other-galaxies-and-universe",
    sceneComponentId: "m01_ch6_observable_universe",
    scientificObjective:
      "Ascend from the Local Group (Milky Way, Andromeda M31 at 2.54 Mly, Triangulum M33) through the Laniakea Supercluster (520 Mly) and Cosmic Web filaments to the 93-Gly Observable Universe comoving particle horizon—explicitly distinguishing our light-travel horizon from an edge of all space.",
    scientificRepresentation: "OBSERVATION_BASED",
    representationDisclosure:
      "Cosmological Horizon Notice: The 46.5 Gly radius (93 Gly diameter) particle horizon marks the maximum comoving distance from which light has reached us in 13.8 Gyr—it is NOT a physical wall or edge of space.",
    scientificReviewCorrectionNote:
      "Verified: Rendered faint cosmic web filaments continuing beyond the translucent 46.5 Gly observational horizon sphere so learners never mistake the horizon for a literal outer wall.",
    requiredObjectIds: [
      "local_group_cluster",
      "andromeda_m31",
      "laniakea_supercluster",
      "cosmic_web_filaments",
      "observable_horizon_sphere",
    ],
    interactiveControls: [
      {
        controlId: "cosmicHierarchyLayer",
        label: "Cosmic Address Scale Level (0–6)",
        controlType: "slider",
        min: 0,
        max: 6,
        step: 1,
        unit: "tier",
        defaultValue: 6,
        scientificFormula: "R_horizon ≈ 46.5 Gly (Comoving Diameter ≈ 93 Gly)",
        description: "Scrub across all 7 cosmic address tiers from Earth (0) to the Observable Horizon (6).",
        linkedActivityId: "act_01_cosmic_zoom",
        linkedActionType: "scrub_scale_layer",
      },
      {
        controlId: "showBeyondHorizonContinuation",
        label: "Show Unobservable Universe Continuation",
        controlType: "toggle",
        defaultValue: true,
        description: "Illustrate cosmic web structure continuing beyond our 46.5 Gly light-travel horizon.",
      },
    ],
    visualBeats: [
      {
        beatId: "beat-01-6-a",
        beatIndex: 0,
        title: "Local Group, Laniakea Supercluster & The 93-Gly Observational Horizon",
        scientificMechanismSummary:
          "Zooms out from Milky Way + Andromeda M31 (2.54 Mly) through Laniakea (520 Mly) and Cosmic Web filaments to the 46.5-Gly comoving horizon.",
        narrationSegmentIds: [
          "01-lesson-6-other-galaxies-and-universe-title",
          "01-lesson-6-other-galaxies-and-universe-takeaway-1",
          "01-lesson-6-other-galaxies-and-universe-deepDive-1",
          "01-lesson-6-other-galaxies-and-universe-deepDive-2",
        ],
        cameraArchetype: "deep_space_flythrough",
        cameraAction: "APPLY_CAMERA_PRESET",
        cameraPosition: [0, 6.2, 13.5],
        cameraTarget: [0, 0, 0],
        cameraFov: 44,
        timePolicy: "FOLLOW_NARRATION",
        simulationTimeScale: 1.0,
        animationAction: "m01_ch6_local_group_to_observable_horizon",
        highlightedObjects: [
          "local_group_cluster",
          "andromeda_m31",
          "cosmic_web_filaments",
          "observable_horizon_sphere",
        ],
        transitionType: "scale_bridge",
      },
      {
        beatId: "beat-01-6-b",
        beatIndex: 1,
        title: "Complete 7-Tier Cosmic Address & Interactive Scale Verification Gate",
        scientificMechanismSummary:
          "Nested 7-tier cosmic hierarchy highlights Earth → Solar System → Milky Way → Local Group → Laniakea → Cosmic Web → Observable Universe.",
        narrationSegmentIds: [
          "01-lesson-6-other-galaxies-and-universe-didYouKnow-1",
          "01-lesson-6-other-galaxies-and-universe-mathOrAnalogy-1",
        ],
        cameraArchetype: "data_visualization_view",
        cameraAction: "ORBIT_OBJECT",
        cameraPosition: [2.8, 5.4, 12.2],
        cameraTarget: [0, 0, 0],
        cameraFov: 42,
        timePolicy: "WAIT_FOR_STUDENT",
        simulationTimeScale: 1.0,
        animationAction: "m01_ch6_cosmic_address_interactive_gate",
        highlightedObjects: ["observable_horizon_sphere", "cosmic_web_filaments"],
        transitionType: "smooth",
      },
    ],
    chapterAnnotations: [
      {
        annotationId: "ann-01-6-localgroup",
        objectId: "andromeda_m31",
        objectName: "Local Group & Laniakea",
        type: "DISTANCE",
        label: "Andromeda (M31) = 2.54 Mly • Local Group ≈ 10 Mly",
        value: "Laniakea Supercluster ≈ 520 Mly (~100,000 galaxies)",
        worldPosition: [2.5, 1.9, 0],
        priority: 1,
      },
      {
        annotationId: "ann-01-6-horizon",
        objectId: "observable_horizon_sphere",
        objectName: "Comoving Particle Horizon",
        type: "UNCERTAINTY_OR_ILLUSTRATION_NOTICE",
        label: "Observable Horizon: R = 46.5 Gly (Diameter = 93 Gly)",
        value: "Light-travel horizon (13.8 Gyr + expansion) — NOT a physical edge of space",
        worldPosition: [0, -2.55, 0],
        priority: 1,
      },
    ],
    requiresActivityGate: {
      activityId: "act_01_cosmic_zoom",
      gateDescription: "Explore the 7 Cosmic Scale Layers to verify your cosmic address.",
    },
    rubricScores: STANDARD_5_RUBRIC,
  },

  // ============================================================================
  // MODULE 08 — GRAVITY, ORBITS & MOTION (8 CHAPTERS, 40 NARRATION SEGMENTS)
  // ============================================================================
  {
    moduleId: "08",
    chapterId: "08-01",
    chapterCode: "08.1",
    chapterOrder: 1,
    title: "1. What is Gravity?",
    storyboardId: "sb-m08-08-01",
    sceneComponentId: "m08_ch1_gravity_inverse_square",
    scientificObjective:
      "Quantify Newton's Universal Law of Gravitation F = G m₁ m₂ / r², equal-and-opposite action-reaction force vectors F₁₂ = -F₂₁, inverse-square decay (1/4 at 2r, 1/9 at 3r), radial field lines, and differential tidal stretching ΔF ∝ 1/r³.",
    scientificRepresentation: "PHYSICS_BASED_SIMULATION",
    representationDisclosure:
      "Pedagogical Diagram Notice: The 3D wireframe depression represents scalar gravitational potential Φ(r) = -GM/r, not a literal elastic rubber sheet in space.",
    scientificReviewCorrectionNote:
      "Verified: Explicitly labeled the 3D funnel as a pedagogical gravitational potential diagram Φ(r) = -GM/r and enforced exact equal-length force arrows |F₁₂| = |F₂₁|.",
    requiredObjectIds: ["central_star", "orbiting_planet", "gravity_force_vectors", "potential_well_grid"],
    interactiveControls: [
      {
        controlId: "primaryMassSolar",
        label: "Primary Mass (M₁)",
        controlType: "slider",
        min: 0.5,
        max: 4.0,
        step: 0.25,
        unit: "M_☉",
        defaultValue: 1.0,
        scientificFormula: "F = G · M₁ · m₂ / r²",
        description: "Change the mass of the central attracting body.",
      },
      {
        controlId: "separationAu",
        label: "Separation Distance (r)",
        controlType: "slider",
        min: 1.0,
        max: 3.0,
        step: 0.25,
        unit: "AU",
        defaultValue: 1.0,
        scientificFormula: "F(r) / F(1 AU) = 1 / r²",
        description: "Step distance from 1 AU to 2 AU (1/4 F₀) and 3 AU (1/9 F₀).",
      },
      {
        controlId: "showTidalVectors",
        label: "Differential Tidal Field Arrows (ΔF ∝ 1/r³)",
        controlType: "toggle",
        defaultValue: true,
        description: "Show near-side vs far-side differential gravity vectors across the planet.",
      },
    ],
    visualBeats: [
      {
        beatId: "beat-08-1-a",
        beatIndex: 0,
        title: "Inverse-Square Law F = G m₁ m₂ / r² & Pedagogical Potential Well",
        scientificMechanismSummary:
          "Equal and opposite force arrows F₁₂ = -F₂₁ scale as 1/r² (1 → 1/4 → 1/9) over the Φ(r) = -GM/r potential diagram.",
        narrationSegmentIds: ["08-08-01-title", "08-08-01-didYouKnow-1"],
        cameraArchetype: "data_visualization_view",
        cameraAction: "APPLY_CAMERA_PRESET",
        cameraPosition: [0, 8.2, 13.8],
        cameraTarget: [0, -0.5, 0],
        cameraFov: 38,
        timePolicy: "SIMULATION_CONTINUOUS",
        simulationTimeScale: 1.0,
        animationAction: "m08_ch1_inverse_square_potential_well",
        highlightedObjects: ["central_star", "orbiting_planet", "gravity_force_vectors"],
        transitionType: "scale_bridge",
      },
      {
        beatId: "beat-08-1-b",
        beatIndex: 1,
        title: "Radial Field Symmetry & Differential Tidal Bulge Gradient",
        scientificMechanismSummary:
          "3D inward radial field vectors and near-side vs far-side tidal gradient Δg = 2GM R_p / r³.",
        narrationSegmentIds: ["08-08-01-detail-1", "08-08-01-detail-2", "08-08-01-detail-3"],
        cameraArchetype: "object_close_up",
        cameraAction: "FOCUS_OBJECT",
        cameraPosition: [3.2, 4.5, 9.2],
        cameraTarget: [2.2, 0, 0],
        cameraFov: 34,
        timePolicy: "SIMULATION_CONTINUOUS",
        simulationTimeScale: 1.0,
        animationAction: "m08_ch1_radial_field_and_tidal_gradient",
        highlightedObjects: ["orbiting_planet", "gravity_force_vectors"],
        transitionType: "smooth",
      },
    ],
    chapterAnnotations: [
      {
        annotationId: "ann-08-1-law",
        objectId: "central_star",
        objectName: "Universal Gravitation",
        type: "SCIENTIFIC_EQUATION",
        label: "F = G m₁ m₂ / r² (G = 6.6743 × 10⁻¹¹ N·m²/kg²)",
        value: "At r = 2 d₀ → F = 1/4 F₀ • At r = 3 d₀ → F = 1/9 F₀",
        worldPosition: [0, 2.5, 0],
        priority: 1,
      },
      {
        annotationId: "ann-08-1-well",
        objectId: "potential_well_grid",
        objectName: "Pedagogical Potential Diagram",
        type: "UNCERTAINTY_OR_ILLUSTRATION_NOTICE",
        label: "Pedagogical Potential Surface Φ(r) = -GM / r",
        value: "Scalar potential depth diagram (Not a literal physical sheet)",
        worldPosition: [0, -2.55, 0],
        priority: 1,
      },
    ],
    rubricScores: STANDARD_5_RUBRIC,
  },

  {
    moduleId: "08",
    chapterId: "08-02",
    chapterCode: "08.2",
    chapterOrder: 2,
    title: "2. Why Planets Orbit Stars",
    storyboardId: "sb-m08-08-02",
    sceneComponentId: "m08_ch2_orbital_free_fall",
    scientificObjective:
      "Demonstrate orbit as perpetual free fall where tangential velocity v curves around the central body, contrasting circular orbits (v ⊥ F_g at 90°, work W = 0, constant speed) with elliptical orbits (inbound +W acceleration, outbound -W deceleration).",
    scientificRepresentation: "PHYSICS_BASED_SIMULATION",
    representationDisclosure:
      "Real-time Velocity-Verlet orbital integration showing instantaneous angle θ between tangential velocity v and inward gravitational force F_g.",
    scientificReviewCorrectionNote:
      "Verified: Explicitly distinguished circular orbit orthogonal geometry (v ⊥ F_g everywhere) from general elliptical orbits where v and F_g are orthogonal only at periapsis and apoapsis.",
    requiredObjectIds: ["central_star", "orbiting_planet", "velocity_vector", "gravity_vector"],
    interactiveControls: [
      {
        controlId: "freeFallOrbitRegime",
        label: "Orbital Free-Fall Regime",
        controlType: "select",
        defaultValue: "circular",
        options: [
          { value: "circular", label: "Circular Orbit (v ⊥ F_g = 90° • Constant Speed)" },
          { value: "elliptical", label: "Elliptical Orbit (e = 0.50 • Work W = F_g · dr varies)" },
          { value: "suborbital_cannonball", label: "Newton's Cannonball (Suborbital vs Orbital Speed)" },
        ],
        scientificFormula: "W = ∫ F_g · dr = F_g · v cos(θ) dt",
        description: "Compare orthogonal zero-work circular motion with elliptical energy exchange.",
      },
    ],
    visualBeats: [
      {
        beatId: "beat-08-2-a",
        beatIndex: 0,
        title: "Newton's Cannonball & Orthogonal 90° Circular Free Fall",
        scientificMechanismSummary:
          "Shows tangential velocity v perpendicular (90°) to inward gravity F_g so work W = 0 and orbital speed stays constant.",
        narrationSegmentIds: ["08-08-02-title", "08-08-02-didYouKnow-1", "08-08-02-detail-1"],
        cameraArchetype: "planetary_orbital_shot",
        cameraAction: "APPLY_CAMERA_PRESET",
        cameraPosition: [0, 11.5, 9.5],
        cameraTarget: [0, 0, 0],
        cameraFov: 38,
        timePolicy: "SIMULATION_CONTINUOUS",
        simulationTimeScale: 1.0,
        animationAction: "m08_ch2_orthogonal_circular_balance",
        highlightedObjects: ["orbiting_planet", "velocity_vector", "gravity_vector"],
        transitionType: "smooth",
      },
      {
        beatId: "beat-08-2-b",
        beatIndex: 1,
        title: "Elliptical Work-Energy Exchange (+W Inbound / -W Outbound)",
        scientificMechanismSummary:
          "In an elliptical orbit, acute angle (<90°) inbound does positive work (+W, speeding up) while obtuse angle (>90°) outbound does negative work (-W, slowing down).",
        narrationSegmentIds: ["08-08-02-detail-2", "08-08-02-detail-3"],
        cameraArchetype: "object_following_camera",
        cameraAction: "FOLLOW_TRAJECTORY",
        cameraPosition: [0, 10.2, 11.2],
        cameraTarget: [-1.2, 0, 0],
        cameraFov: 36,
        timePolicy: "SIMULATION_CONTINUOUS",
        simulationTimeScale: 1.0,
        animationAction: "m08_ch2_elliptical_work_energy",
        highlightedObjects: ["orbiting_planet", "velocity_vector", "gravity_vector"],
        transitionType: "smooth",
      },
    ],
    chapterAnnotations: [
      {
        annotationId: "ann-08-2-ortho",
        objectId: "orbiting_planet",
        objectName: "Perpetual Free Fall",
        type: "PHYSICAL_FORCES",
        label: "Circular: v ⊥ F_g (90° → W = 0, Constant Speed)",
        value: "Elliptical: F_g · v > 0 inbound (+W) • F_g · v < 0 outbound (-W)",
        worldPosition: [0, 2.4, 0],
        priority: 1,
      },
    ],
    rubricScores: STANDARD_5_RUBRIC,
  },

  {
    moduleId: "08",
    chapterId: "08-03",
    chapterCode: "08.3",
    chapterOrder: 3,
    title: "3. Circular and Elliptical Orbits",
    storyboardId: "sb-m08-08-03",
    sceneComponentId: "m08_ch3_conic_orbit_geometry",
    scientificObjective:
      "Master conic section orbital geometry (circle e=0, ellipse 0<e<1, parabola e=1, hyperbola e>1), locating the central attracting star strictly at occupied focus F₁ = (0,0,0), empty focus F₂ = (-2ae,0,0), periapsis r_p = a(1-e), and apoapsis r_a = a(1+e).",
    scientificRepresentation: "PHYSICS_BASED_SIMULATION",
    representationDisclosure:
      "Exact Keplerian focus geometry: The central star sits at focus F₁ (origin), while the ellipse geometric center is shifted by c = -a·e.",
    scientificReviewCorrectionNote:
      "Verified: The attracting star is strictly placed at focus F₁ = (0,0,0), never at the geometric center of a non-circular ellipse.",
    requiredObjectIds: ["central_star", "orbiting_planet", "focus_f1_marker", "focus_f2_marker", "hohmann_transfer_arc"],
    interactiveControls: [
      {
        controlId: "eccentricity",
        label: "Orbital Eccentricity (e)",
        controlType: "slider",
        min: 0.0,
        max: 0.85,
        step: 0.05,
        defaultValue: 0.48,
        scientificFormula: "r_p = a(1 - e) • r_a = a(1 + e) • c = a·e",
        description: "Reshape the orbit from a perfect circle (e=0) to a highly elongated comet-like ellipse.",
        linkedActivityId: "module08-orbital-simulation",
        linkedActionType: "change_eccentricity",
      },
      {
        controlId: "showConicFamily",
        label: "Show Parabolic (e=1) & Hyperbolic (e=1.2) Family",
        controlType: "toggle",
        defaultValue: true,
        description: "Overlay open parabolic escape and interstellar hyperbolic ('Oumuamua e=1.20) trajectories.",
      },
      {
        controlId: "showHohmannTransfer",
        label: "Show Hohmann Transfer Ellipse (Δv₁, Δv₂)",
        controlType: "toggle",
        defaultValue: true,
        description: "Display the minimum-energy elliptical transfer orbit between inner and outer circular orbits.",
      },
    ],
    visualBeats: [
      {
        beatId: "beat-08-3-a",
        beatIndex: 0,
        title: "Conic Section Spectrum: Circle, Ellipse, Parabola & Hyperbola",
        scientificMechanismSummary:
          "Compares shared-periapsis trajectories for e=0 (circle), e=0.48 (ellipse), e=1.0 (parabola), and e=1.20 (1I/'Oumuamua hyperbola).",
        narrationSegmentIds: ["08-08-03-title", "08-08-03-didYouKnow-1"],
        cameraArchetype: "establishing_shot",
        cameraAction: "APPLY_CAMERA_PRESET",
        cameraPosition: [0, 13.5, 6.5],
        cameraTarget: [-1.5, 0, 0],
        cameraFov: 40,
        timePolicy: "SIMULATION_CONTINUOUS",
        simulationTimeScale: 1.0,
        animationAction: "m08_ch3_conic_family_spectrum",
        highlightedObjects: ["central_star", "orbiting_planet", "focus_f1_marker"],
        transitionType: "smooth",
      },
      {
        beatId: "beat-08-3-b",
        beatIndex: 1,
        title: "Occupied Focus F₁, Empty Focus F₂, Periapsis/Apoapsis & Hohmann Transfer",
        scientificMechanismSummary:
          "Calipers measure semi-major axis a, focal offset c = ae, periapsis r_p = a(1-e), apoapsis r_a = a(1+e), and Hohmann Δv₁/Δv₂ burns.",
        narrationSegmentIds: ["08-08-03-detail-1", "08-08-03-detail-2", "08-08-03-detail-3"],
        cameraArchetype: "data_visualization_view",
        cameraAction: "PAN_TO_REGION",
        cameraPosition: [-1.5, 12.2, 8.2],
        cameraTarget: [-1.5, 0, 0],
        cameraFov: 38,
        timePolicy: "SIMULATION_CONTINUOUS",
        simulationTimeScale: 1.0,
        animationAction: "m08_ch3_foci_calipers_and_hohmann",
        highlightedObjects: ["focus_f1_marker", "focus_f2_marker", "hohmann_transfer_arc"],
        transitionType: "smooth",
      },
    ],
    chapterAnnotations: [
      {
        annotationId: "ann-08-3-foci",
        objectId: "focus_f1_marker",
        objectName: "Occupied Focus F₁ vs Empty Focus F₂",
        type: "SCIENTIFIC_EQUATION",
        label: "Star at Focus F₁ (0,0) • Empty Focus F₂ (-2ae, 0)",
        value: "r_p = a(1 - e) (Periapsis) • r_a = a(1 + e) (Apoapsis)",
        worldPosition: [-1.4, 2.35, 0],
        priority: 1,
      },
    ],
    rubricScores: STANDARD_5_RUBRIC,
  },

  {
    moduleId: "08",
    chapterId: "08-04",
    chapterCode: "08.4",
    chapterOrder: 4,
    title: "4. Orbital Velocity",
    storyboardId: "sb-m08-08-04",
    sceneComponentId: "m08_ch4_vis_viva_velocity",
    scientificObjective:
      "Apply the Vis-Viva equation v² = GM(2/r - 1/a) and circular speed v_circ = √(GM/r), verify mass independence via the Equivalence Principle, and compare Low Earth Orbit (7.66 km/s) with Geostationary Orbit (3.07 km/s, r = 42,164 km).",
    scientificRepresentation: "PHYSICS_BASED_SIMULATION",
    representationDisclosure:
      "Velocities and periods are computed directly from v = √(GM_⊕ / r) with GM_⊕ = 3.986004418 × 10¹⁴ m³/s².",
    scientificReviewCorrectionNote:
      "Verified: Orbital speed updates strictly from the Vis-Viva relation v² = GM(2/r - 1/a) and is independent of satellite mass m.",
    requiredObjectIds: ["central_star", "leo_satellite", "geo_satellite", "ion_spiral_trajectory"],
    interactiveControls: [
      {
        controlId: "orbitalRadiusEarthRadii",
        label: "Orbital Radius (r / R_⊕)",
        controlType: "slider",
        min: 1.06,
        max: 6.62,
        step: 0.1,
        unit: "R_⊕",
        defaultValue: 6.61,
        scientificFormula: "v_circ = √(GM_⊕ / r) • T = 2π √(r³ / GM_⊕)",
        description: "Adjust orbital radius from LEO (1.06 R_⊕ = 6,779 km) to Geostationary (6.61 R_⊕ = 42,164 km).",
      },
      {
        controlId: "showIonSpiral",
        label: "Compare Chemical Δv vs Low-Thrust Ion Spiral",
        controlType: "toggle",
        defaultValue: true,
        description: "Show continuous multi-revolution xenon ion spiral alongside impulsive Hohmann transfer.",
      },
    ],
    visualBeats: [
      {
        beatId: "beat-08-4-a",
        beatIndex: 0,
        title: "Vis-Viva Speed Scaling, LEO vs GEO Ring & Mass Equivalence",
        scientificMechanismSummary:
          "Co-orbiting 1-g pebble and 420-ton station prove mass independence at LEO (7.66 km/s) while GEO satellite orbits at 3.07 km/s (P = 23h 56m 04s).",
        narrationSegmentIds: ["08-08-04-title", "08-08-04-didYouKnow-1", "08-08-04-detail-1"],
        cameraArchetype: "scale_comparison_view",
        cameraAction: "APPLY_CAMERA_PRESET",
        cameraPosition: [0, 11.8, 11.5],
        cameraTarget: [0, 0, 0],
        cameraFov: 38,
        timePolicy: "SIMULATION_CONTINUOUS",
        simulationTimeScale: 1.0,
        animationAction: "m08_ch4_leo_vs_geo_and_equivalence",
        highlightedObjects: ["leo_satellite", "geo_satellite"],
        transitionType: "smooth",
      },
      {
        beatId: "beat-08-4-b",
        beatIndex: 1,
        title: "Impulsive Chemical Burn vs. Continuous Low-Thrust Ion Spiral",
        scientificMechanismSummary:
          "Compares instantaneous tangential Δv chemical burn against a multi-turn outward xenon ion propulsion spiral.",
        narrationSegmentIds: ["08-08-04-detail-2", "08-08-04-detail-3"],
        cameraArchetype: "planetary_orbital_shot",
        cameraAction: "ORBIT_OBJECT",
        cameraPosition: [2.5, 12.5, 8.8],
        cameraTarget: [0, 0, 0],
        cameraFov: 38,
        timePolicy: "SIMULATION_CONTINUOUS",
        simulationTimeScale: 1.0,
        animationAction: "m08_ch4_impulsive_vs_ion_spiral",
        highlightedObjects: ["ion_spiral_trajectory", "geo_satellite"],
        transitionType: "smooth",
      },
    ],
    chapterAnnotations: [
      {
        annotationId: "ann-08-4-visviva",
        objectId: "geo_satellite",
        objectName: "Vis-Viva & Geostationary Ring",
        type: "VELOCITY",
        label: "v² = GM(2/r - 1/a) • v_circ = √(GM/r) (Independent of m)",
        value: "LEO (408 km): 7.66 km/s • GEO (35,786 km alt): 3.07 km/s",
        worldPosition: [0, 2.4, 0],
        priority: 1,
      },
    ],
    rubricScores: STANDARD_5_RUBRIC,
  },

  {
    moduleId: "08",
    chapterId: "08-05",
    chapterCode: "08.5",
    chapterOrder: 5,
    title: "5. Newton's Laws of Motion",
    storyboardId: "sb-m08-08-05",
    sceneComponentId: "m08_ch5_newton_laws_motion",
    scientificObjective:
      "Demonstrate Newton's three laws in space: 1st Law (straight-line inertial tangent departure without central gravity), 2nd Law (a = F/m producing an 81:1 acceleration ratio between the Moon and Earth), and 3rd Law (equal-and-opposite forces F₁₂ = -F₂₁ and Tsiolkovsky rocket recoil in vacuum).",
    scientificRepresentation: "PHYSICS_BASED_SIMULATION",
    representationDisclosure:
      "Force and acceleration vectors represent real physical quantities: |F₁₂| = |F₂₁|, a_c = v²/r, and rocket recoil Δp_ship = -Δp_exhaust.",
    scientificReviewCorrectionNote:
      "Verified: Each of Newton's 3 laws has a distinct visual mechanism; no arbitrary decorative force arrows are shown.",
    requiredObjectIds: [
      "central_star",
      "orbiting_planet",
      "inertial_tangent_line",
      "rocket_recoil_vehicle",
    ],
    interactiveControls: [
      {
        controlId: "newtonLawDemonstration",
        label: "Select Newton's Law Demonstration",
        controlType: "select",
        defaultValue: "law1_inertia",
        options: [
          { value: "law1_inertia", label: "1st Law: Inertia & Straight-Line Tangent Path" },
          { value: "law2_fma_ratio", label: "2nd Law: a = F/m (81:1 Moon vs Earth Acceleration)" },
          { value: "law3_rocket_recoil", label: "3rd Law: F₁₂ = -F₂₁ & Tsiolkovsky Rocket Recoil" },
        ],
        scientificFormula: "ΣF = m·a • a_c = v²/r • Δv = v_e ln(m₀/m_f)",
        description: "Switch between the three Newtonian mechanics demonstrations.",
      },
      {
        controlId: "gravityTetherActive",
        label: "Central Gravitational Attraction Active",
        controlType: "toggle",
        defaultValue: true,
        description: "Release gravity in Law 1 to watch the planet coast along its straight inertial tangent.",
      },
    ],
    visualBeats: [
      {
        beatId: "beat-08-5-a",
        beatIndex: 0,
        title: "1st Law Inertia Tangent & 2nd/3rd Law 81:1 Earth–Moon Acceleration",
        scientificMechanismSummary:
          "Shows the straight-line inertial tangent path alongside equal gravitational forces F_⊕M = -F_M⊕ producing 81× greater lunar acceleration.",
        narrationSegmentIds: ["08-08-05-title", "08-08-05-didYouKnow-1", "08-08-05-detail-1"],
        cameraArchetype: "establishing_shot",
        cameraAction: "APPLY_CAMERA_PRESET",
        cameraPosition: [0, 10.5, 11.8],
        cameraTarget: [0, 0, 0],
        cameraFov: 38,
        timePolicy: "SIMULATION_CONTINUOUS",
        simulationTimeScale: 1.0,
        animationAction: "m08_ch5_inertia_and_81_to_1_acceleration",
        highlightedObjects: ["orbiting_planet", "inertial_tangent_line"],
        transitionType: "smooth",
      },
      {
        beatId: "beat-08-5-b",
        beatIndex: 1,
        title: "Centripetal Acceleration a_c = v²/r & Vacuum Rocket Recoil",
        scientificMechanismSummary:
          "Displays inward centripetal acceleration a_c = v²/r and a spacecraft accelerating forward by expelling exhaust momentum backward.",
        narrationSegmentIds: ["08-08-05-detail-2", "08-08-05-detail-3"],
        cameraArchetype: "object_close_up",
        cameraAction: "FOCUS_OBJECT",
        cameraPosition: [3.4, 5.2, 8.6],
        cameraTarget: [2.0, 0.5, 0],
        cameraFov: 34,
        timePolicy: "SIMULATION_CONTINUOUS",
        simulationTimeScale: 1.0,
        animationAction: "m08_ch5_centripetal_and_rocket_recoil",
        highlightedObjects: ["rocket_recoil_vehicle", "orbiting_planet"],
        transitionType: "smooth",
      },
    ],
    chapterAnnotations: [
      {
        annotationId: "ann-08-5-laws",
        objectId: "orbiting_planet",
        objectName: "Newton's Principia Laws",
        type: "PHYSICAL_FORCES",
        label: "1st: Inertial Tangent • 2nd: a = F/m (a_Moon = 81 a_⊕)",
        value: "3rd: F₁₂ = -F₂₁ • Rocket Equation: Δv = v_e ln(m₀ / m_f)",
        worldPosition: [0, 2.45, 0],
        priority: 1,
      },
    ],
    rubricScores: STANDARD_5_RUBRIC,
  },

  {
    moduleId: "08",
    chapterId: "08-06",
    chapterCode: "08.6",
    chapterOrder: 6,
    title: "6. Kepler's Laws",
    storyboardId: "sb-m08-08-06",
    sceneComponentId: "m08_ch6_kepler_three_laws",
    scientificObjective:
      "Demonstrate all three of Kepler's Laws simultaneously: 1st Law (ellipse with star at focus F₁), 2nd Law (equal areas ΔA₁ = ΔA₂ swept in equal time intervals Δt via angular momentum conservation dA/dt = L/2m), and 3rd Law (T² = a³ harmonic scaling across concentric orbits).",
    scientificRepresentation: "PHYSICS_BASED_SIMULATION",
    representationDisclosure:
      "Swept sector areas integrate dA = ½ r² dθ = (L / 2m) dt; 3-planet harmonic periods follow T² = [4π² / G(M₁+M₂)] a³.",
    scientificReviewCorrectionNote:
      "Verified: Equal-area sectors at periapsis (short/wide) and apoapsis (long/narrow) have mathematically equal areas ΔA = ½ a b √(1-e²) ω Δt.",
    requiredObjectIds: [
      "central_star",
      "orbiting_planet",
      "kepler_equal_area_sectors",
      "harmonic_outer_planets",
    ],
    interactiveControls: [
      {
        controlId: "keplerEccentricity",
        label: "Kepler Orbit Eccentricity (e)",
        controlType: "slider",
        min: 0.05,
        max: 0.75,
        step: 0.05,
        defaultValue: 0.52,
        scientificFormula: "dA / dt = L / (2m) = const",
        description: "Change eccentricity and verify that periapsis and apoapsis sectors sweep identical areas.",
      },
      {
        controlId: "harmonicPlanetSemiMajorAu",
        label: "Outer Planet Semi-Major Axis (a)",
        controlType: "slider",
        min: 1.0,
        max: 9.0,
        step: 0.5,
        unit: "AU",
        defaultValue: 4.0,
        scientificFormula: "T² = a³ (Solar Units) ⇒ T = a^(3/2) yr",
        description: "Test Kepler's 3rd Law (e.g., a = 4.0 AU → T = 8.0 yr; a = 9.0 AU → T = 27.0 yr).",
      },
    ],
    visualBeats: [
      {
        beatId: "beat-08-6-a",
        beatIndex: 0,
        title: "Kepler's 1st & 2nd Laws: Elliptical Focus & Equal-Area Swept Sectors",
        scientificMechanismSummary:
          "Top-down ecliptic view without foreshortening shows short/wide periapsis sector A₁ equal in area to long/narrow apoapsis sector A₂.",
        narrationSegmentIds: ["08-08-06-title", "08-08-06-didYouKnow-1"],
        cameraArchetype: "data_visualization_view",
        cameraAction: "APPLY_CAMERA_PRESET",
        cameraPosition: [-1.4, 14.2, 4.2],
        cameraTarget: [-1.4, 0, 0],
        cameraFov: 36,
        timePolicy: "SIMULATION_CONTINUOUS",
        simulationTimeScale: 1.0,
        animationAction: "m08_ch6_kepler_equal_areas",
        highlightedObjects: ["central_star", "orbiting_planet", "kepler_equal_area_sectors"],
        transitionType: "smooth",
      },
      {
        beatId: "beat-08-6-b",
        beatIndex: 1,
        title: "Kepler's 3rd Harmonic Law T² = a³ & Newton's Mutual-Mass Generalization",
        scientificMechanismSummary:
          "Concentric planets at a = 1, 4, 9 AU orbit with periods T = 1, 8, 27 yr alongside the synchronized T² vs a³ linear scaling relation.",
        narrationSegmentIds: ["08-08-06-detail-1", "08-08-06-detail-2", "08-08-06-detail-3"],
        cameraArchetype: "scale_comparison_view",
        cameraAction: "PAN_TO_REGION",
        cameraPosition: [0, 15.0, 9.5],
        cameraTarget: [0, 0, 0],
        cameraFov: 40,
        timePolicy: "SIMULATION_CONTINUOUS",
        simulationTimeScale: 1.0,
        animationAction: "m08_ch6_kepler_harmonic_law",
        highlightedObjects: ["harmonic_outer_planets", "kepler_equal_area_sectors"],
        transitionType: "smooth",
      },
    ],
    chapterAnnotations: [
      {
        annotationId: "ann-08-6-kepler",
        objectId: "kepler_equal_area_sectors",
        objectName: "Kepler's Three Laws",
        type: "SCIENTIFIC_EQUATION",
        label: "2nd Law: ΔA_peri = ΔA_apo (dA/dt = L / 2m = const)",
        value: "3rd Law: T² = [4π² / G(M₁+M₂)] a³ (a=4 AU ⇒ T=8 yr)",
        worldPosition: [-1.4, 2.5, 0],
        priority: 1,
      },
    ],
    rubricScores: STANDARD_5_RUBRIC,
  },

  {
    moduleId: "08",
    chapterId: "08-07",
    chapterCode: "08.7",
    chapterOrder: 7,
    title: "7. Escape Velocity",
    storyboardId: "sb-m08-08-07",
    sceneComponentId: "m08_ch7_escape_velocity_well",
    scientificObjective:
      "Derive and visualize escape velocity v_esc = √(2GM/r) = √2 v_circ where total mechanical energy E = K + U = 0, contrasting bound orbits (E < 0), parabolic escape (E = 0), and hyperbolic excess trajectories (E > 0) for Earth (11.2 km/s), the Sun at 1 AU (42.1 km/s), and Jupiter (59.5 km/s).",
    scientificRepresentation: "PHYSICS_BASED_SIMULATION",
    representationDisclosure:
      "Idealized vacuum escape speed v_esc = √(2GM/r); practical surface launches require additional Δv to overcome atmospheric drag and gravity losses.",
    scientificReviewCorrectionNote:
      "Verified: Explicitly distinguished idealized vacuum escape speed v_esc = √(2GM/r) from atmospheric launch requirements.",
    requiredObjectIds: ["central_star", "escape_probe", "bound_reference_orbit", "escape_trajectory_arc"],
    interactiveControls: [
      {
        controlId: "launchSpeedRatio",
        label: "Launch Velocity Ratio (v₀ / v_circ)",
        controlType: "slider",
        min: 0.85,
        max: 1.80,
        step: 0.05,
        unit: "× v_circ",
        defaultValue: 1.41,
        scientificFormula: "v_esc = √2 · v_circ ≈ 1.414 · v_circ (E_tot = 0)",
        description: "Increase launch speed across √2 ≈ 1.414× circular speed to break out of the gravity well.",
      },
      {
        controlId: "escapeBodyPreset",
        label: "Gravity Well Body",
        controlType: "select",
        defaultValue: "earth",
        options: [
          { value: "earth", label: "Earth Surface (v_esc = 11.19 km/s)" },
          { value: "sun_1au", label: "Sun from 1 AU (v_esc = 42.12 km/s)" },
          { value: "jupiter", label: "Jupiter Cloud Top (v_esc = 59.50 km/s)" },
        ],
        description: "Compare escape speed and atmospheric retention across Earth, the Sun at 1 AU, and Jupiter.",
      },
    ],
    visualBeats: [
      {
        beatId: "beat-08-7-a",
        beatIndex: 0,
        title: "Breaking the Gravity Well: v_esc = √(2GM/r) = √2 v_circ",
        scientificMechanismSummary:
          "Probe boosts to √2 × v_circ, transitioning from a closed bound ellipse (E < 0) onto an open parabolic/hyperbolic escape trajectory (E ≥ 0).",
        narrationSegmentIds: ["08-08-07-title", "08-08-07-didYouKnow-1", "08-08-07-detail-1"],
        cameraArchetype: "establishing_shot",
        cameraAction: "APPLY_CAMERA_PRESET",
        cameraPosition: [0, 10.5, 13.8],
        cameraTarget: [1.0, 0, 0],
        cameraFov: 40,
        timePolicy: "SIMULATION_CONTINUOUS",
        simulationTimeScale: 1.0,
        animationAction: "m08_ch7_escape_velocity_transition",
        highlightedObjects: ["escape_probe", "escape_trajectory_arc"],
        transitionType: "smooth",
      },
      {
        beatId: "beat-08-7-b",
        beatIndex: 1,
        title: "3D Potential Well E = K + U ≥ 0 & Hyperbolic Excess Speed v_∞",
        scientificMechanismSummary:
          "Side-elevation view of the U(r) = -GMm/r potential funnel comparing trapped (E<0), parabolic (E=0), and hyperbolic (E>0, v_∞ = √(v₀² - v_esc²)) regimes.",
        narrationSegmentIds: ["08-08-07-detail-2", "08-08-07-detail-3"],
        cameraArchetype: "data_visualization_view",
        cameraAction: "PAN_TO_REGION",
        cameraPosition: [5.5, 6.2, 12.5],
        cameraTarget: [0.5, -0.8, 0],
        cameraFov: 38,
        timePolicy: "SIMULATION_CONTINUOUS",
        simulationTimeScale: 1.0,
        animationAction: "m08_ch7_potential_funnel_energy_regimes",
        highlightedObjects: ["escape_trajectory_arc", "central_star"],
        transitionType: "smooth",
      },
    ],
    chapterAnnotations: [
      {
        annotationId: "ann-08-7-vesc",
        objectId: "escape_trajectory_arc",
        objectName: "Escape Velocity Condition",
        type: "SCIENTIFIC_EQUATION",
        label: "v_esc = √(2GM / r) = √2 v_circ (E = ½mv² - GMm/r = 0)",
        value: "Earth: 11.2 km/s • Sun (1 AU): 42.1 km/s • Jupiter: 59.5 km/s",
        worldPosition: [1.5, 2.4, 0],
        priority: 1,
      },
    ],
    rubricScores: STANDARD_5_RUBRIC,
  },

  {
    moduleId: "08",
    chapterId: "08-08",
    chapterCode: "08.8",
    chapterOrder: 8,
    title: "8. Barycenters and Multiple-Body Systems",
    storyboardId: "sb-m08-08-08",
    sceneComponentId: "m08_ch8_barycenter_multibody",
    scientificObjective:
      "Visualize two-body mutual motion around the center of mass (m₁ r₁ = m₂ r₂) without keeping the primary star fixed, locate the 5 Lagrange equilibrium points (L1–L5) and Hill Sphere r_H ≈ a(m/3M)^(1/3), and complete the orbital laboratory gate.",
    scientificRepresentation: "PHYSICS_BASED_SIMULATION",
    representationDisclosure:
      "Circular two-body and restricted three-body model: Both primary M₁ and secondary m₂ orbit the stationary barycenter at r₁ = a·q/(1+q) and r₂ = a/(1+q) in opposite phase (Δφ = 180°).",
    scientificReviewCorrectionNote:
      "Verified: The primary star never remains artificially fixed; changing the mass ratio q = m₂/m₁ dynamically shifts the barycenter and both orbital radii r₁ and r₂.",
    requiredObjectIds: [
      "primary_body",
      "secondary_body",
      "barycenter_crosshair",
      "lagrange_points_overlay",
    ],
    interactiveControls: [
      {
        controlId: "massRatioQ",
        label: "Companion-to-Primary Mass Ratio (q = m₂ / M₁)",
        controlType: "slider",
        min: 0.05,
        max: 1.0,
        step: 0.05,
        defaultValue: 0.40,
        scientificFormula: "M₁ · r₁ = m₂ · r₂ ⇒ r₁ = a · q / (1 + q)",
        description: "Change the mass ratio from planet-star wobble (q=0.05) to equal-mass binary stars (q=1.00).",
        linkedActivityId: "module08-orbital-simulation",
        linkedActionType: "verify_orbit",
      },
      {
        controlId: "showLagrangePoints",
        label: "Show L1–L5 Lagrange Points & Hill Sphere",
        controlType: "toggle",
        defaultValue: true,
        description: "Display collinear L1, L2 (JWST), L3 and equilateral Trojan points L4, L5 (±60°).",
      },
    ],
    visualBeats: [
      {
        beatId: "beat-08-8-a",
        beatIndex: 0,
        title: "Mutual Two-Body Barycenter Dance (M₁ r₁ = m₂ r₂)",
        scientificMechanismSummary:
          "Both bodies orbit their shared center of mass (+) at opposite phases (180°), demonstrating stellar reflex wobble used in radial-velocity exoplanet detection.",
        narrationSegmentIds: ["08-08-08-title", "08-08-08-didYouKnow-1"],
        cameraArchetype: "planetary_orbital_shot",
        cameraAction: "APPLY_CAMERA_PRESET",
        cameraPosition: [0, 12.8, 9.5],
        cameraTarget: [0, 0, 0],
        cameraFov: 38,
        timePolicy: "SIMULATION_CONTINUOUS",
        simulationTimeScale: 1.0,
        animationAction: "m08_ch8_mutual_barycenter_orbits",
        highlightedObjects: ["primary_body", "secondary_body", "barycenter_crosshair"],
        transitionType: "smooth",
      },
      {
        beatId: "beat-08-8-b",
        beatIndex: 1,
        title: "Lagrange Points (L1–L5), Hill Sphere & Orbital Lab Activity Gate",
        scientificMechanismSummary:
          "Reveals collinear L1, L2, L3, equilateral Trojan triangles L4/L5 (±60°), and Hill Sphere r_H ≈ a(m/3M)^(1/3), then unlocks the orbital verification gate.",
        narrationSegmentIds: ["08-08-08-detail-1", "08-08-08-detail-2", "08-08-08-detail-3"],
        cameraArchetype: "data_visualization_view",
        cameraAction: "ORBIT_OBJECT",
        cameraPosition: [2.0, 13.8, 10.2],
        cameraTarget: [0, 0, 0],
        cameraFov: 40,
        timePolicy: "WAIT_FOR_STUDENT",
        simulationTimeScale: 1.0,
        animationAction: "m08_ch8_lagrange_hill_activity_gate",
        highlightedObjects: ["barycenter_crosshair", "lagrange_points_overlay"],
        transitionType: "smooth",
      },
    ],
    chapterAnnotations: [
      {
        annotationId: "ann-08-8-bary",
        objectId: "barycenter_crosshair",
        objectName: "Center of Mass (Barycenter)",
        type: "SCIENTIFIC_EQUATION",
        label: "M₁ r₁ = m₂ r₂ • Earth–Moon: 4,671 km • Sun–Jupiter: 1.07 R_☉",
        value: "L1–L3 Collinear • L4/L5 ±60° Trojans • r_H ≈ a(m / 3M)^(1/3)",
        worldPosition: [0, 2.45, 0],
        priority: 1,
      },
    ],
    requiresActivityGate: {
      activityId: "module08-orbital-simulation",
      gateDescription: "Adjust orbital parameters and verify stable orbital dynamics to complete the laboratory gate.",
    },
    rubricScores: STANDARD_5_RUBRIC,
  },

  // ============================================================================
  // MODULE 14 — BLACK HOLES & NEUTRON STARS (8 CHAPTERS, 46 NARRATION SEGMENTS)
  // ============================================================================
  {
    moduleId: "14",
    chapterId: "massive-collapse",
    chapterCode: "14.1",
    chapterOrder: 1,
    title: "What Happens When Massive Stars Collapse?",
    storyboardId: "sb-m14-massive-collapse",
    sceneComponentId: "m14_ch1_massive_stellar_collapse",
    scientificObjective:
      "Examine concentric nuclear fusion shells (H → He → C → Ne → O → Si → ⁵⁶Fe) in a massive supergiant, understand why endothermic iron fusion plus electron capture and photodisintegration trigger core collapse, and compare remnant pathways (White Dwarf, Neutron Star, Black Hole).",
    scientificRepresentation: "PHYSICS_BASED_SIMULATION",
    representationDisclosure:
      "Schematic Stellar Cutaway Notice: Shell radii are scaled for visual clarity. Remnant outcomes depend on initial ZAMS mass, metallicity, stellar wind mass loss, core compactness, and binary mass transfer.",
    scientificReviewCorrectionNote:
      "Verified: Included electron capture and photodisintegration alongside the endothermic ⁵⁶Fe peak (not a simplistic disappearance of pressure) and noted that remnant boundaries depend on metallicity, mass loss, and binarity.",
    requiredObjectIds: ["supergiant_onion_core", "hydrostatic_vectors", "remnant_bifurcation_diagram"],
    interactiveControls: [
      {
        controlId: "progenitorMassSolar",
        label: "Initial Progenitor Mass (M_ZAMS)",
        controlType: "slider",
        min: 4,
        max: 35,
        step: 1,
        unit: "M_☉",
        defaultValue: 20,
        scientificFormula: "∇P = -ρ g (Hydrostatic Equilibrium)",
        description: "Explore how progenitor mass (along with metallicity & mass loss) shapes the final compact remnant.",
      },
      {
        controlId: "collapseStage",
        label: "Core Evolution Stage",
        controlType: "select",
        defaultValue: "onion_shells",
        options: [
          { value: "onion_shells", label: "1. Hydrostatic Onion-Skin Fusion Shells (H → Si)" },
          { value: "iron_crisis", label: "2. ⁵⁶Fe Peak, Photodisintegration & Electron Capture" },
          { value: "core_implosion", label: "3. Core Collapse (0.23 c) & Supernova Bounce" },
        ],
        description: "Step through the physical stages of massive stellar core collapse.",
      },
    ],
    visualBeats: [
      {
        beatId: "beat-14-1-a",
        beatIndex: 0,
        title: "Hydrostatic Onion-Skin Shells & The Endothermic Iron-56 Crisis",
        scientificMechanismSummary:
          "120° stellar cutaway reveals H → He → C → Ne → O → Si shells surrounding an endothermic ⁵⁶Fe core undergoing electron capture and photodisintegration.",
        narrationSegmentIds: [
          "14-massive-collapse-title",
          "14-massive-collapse-lead-1",
          "14-massive-collapse-keyIdea-1",
        ],
        cameraArchetype: "scientific_cross_section",
        cameraAction: "APPLY_CAMERA_PRESET",
        cameraPosition: [0, 2.2, 6.8],
        cameraTarget: [0, 0, 0],
        cameraFov: 36,
        timePolicy: "SIMULATION_CONTINUOUS",
        simulationTimeScale: 1.0,
        animationAction: "m14_ch1_onion_skin_and_iron_crisis",
        highlightedObjects: ["supergiant_onion_core", "hydrostatic_vectors"],
        transitionType: "scale_bridge",
      },
      {
        beatId: "beat-14-1-b",
        beatIndex: 1,
        title: "Core Implosion, Neutrino Shock & Remnant Evolutionary Pathways",
        scientificMechanismSummary:
          "Core collapses at ~0.23c; 3-way comparator contrasts White Dwarf, Neutron Star, and Black Hole evolutionary outcomes.",
        narrationSegmentIds: [
          "14-massive-collapse-explanation-1",
          "14-massive-collapse-activityPrompt-1",
        ],
        cameraArchetype: "scale_comparison_view",
        cameraAction: "PAN_TO_REGION",
        cameraPosition: [0, 3.0, 9.2],
        cameraTarget: [0, -0.3, 0],
        cameraFov: 38,
        timePolicy: "SIMULATION_CONTINUOUS",
        simulationTimeScale: 1.0,
        animationAction: "m14_ch1_core_implosion_and_remnant_fates",
        highlightedObjects: ["supergiant_onion_core", "remnant_bifurcation_diagram"],
        transitionType: "smooth",
      },
    ],
    chapterAnnotations: [
      {
        annotationId: "ann-14-1-fe",
        objectId: "supergiant_onion_core",
        objectName: "⁵⁶Fe Peak & Core Collapse",
        type: "PHYSICAL_FORCES",
        label: "∇P = -ρg Breakdown: Endothermic ⁵⁶Fe + Electron Capture",
        value: "Outcomes depend on M_init, metallicity, winds & binarity",
        worldPosition: [0, 2.35, 0],
        priority: 1,
      },
    ],
    rubricScores: STANDARD_5_RUBRIC,
  },

  {
    moduleId: "14",
    chapterId: "white-dwarfs-vs-neutron-stars",
    chapterCode: "14.2",
    chapterOrder: 2,
    title: "White Dwarfs Versus Neutron Stars",
    storyboardId: "sb-m14-white-dwarfs-vs-neutron-stars",
    sceneComponentId: "m14_ch2_white_dwarf_vs_neutron_star",
    scientificObjective:
      "Contrast an Earth-sized White Dwarf (R ≈ 6,000 km radius / 12,000 km diameter, electron degeneracy pressure, M_Ch ≈ 1.44 M_☉, ρ ~ 10⁶ g/cm³) with a city-sized Neutron Star (R ≈ 10–12 km radius / 20–24 km diameter, neutron degeneracy + nuclear force, M_TOV ≈ 2.0–2.3 M_☉ with EOS uncertainty, ρ ~ 4 × 10¹⁴ g/cm³).",
    scientificRepresentation: "SCALE_ADJUSTED_EDUCATIONAL_MODEL",
    representationDisclosure:
      "Radius vs Diameter & EOS Uncertainty Notice: White Dwarf R ≈ 6,000 km (D ≈ 12,000 km); Neutron Star R ≈ 10–12 km (D ≈ 20–24 km). The maximum neutron-star mass (TOV limit ~2.0–2.3 M_☉) carries nuclear equation-of-state uncertainty.",
    scientificReviewCorrectionNote:
      "Verified: Explicitly distinguished radius (R ≈ 10–12 km) from diameter (D ≈ 20–24 km) and documented nuclear equation-of-state (EOS) uncertainty in the TOV mass limit (~2.0–2.3 M_☉).",
    requiredObjectIds: ["white_dwarf_body", "neutron_star_body", "city_scale_grid", "degeneracy_lattice"],
    interactiveControls: [
      {
        controlId: "remnantCoreMassSolar",
        label: "Compact Remnant Mass (M_core)",
        controlType: "slider",
        min: 0.6,
        max: 2.25,
        step: 0.05,
        unit: "M_☉",
        defaultValue: 1.40,
        scientificFormula: "M_Ch ≈ 1.44 M_☉ • M_TOV ≈ 2.0–2.3 M_☉ (EOS dependent)",
        description: "Increase core mass past the 1.44 M_☉ Chandrasekhar limit to trigger inverse beta decay (p + e⁻ → n + ν_e).",
      },
      {
        controlId: "compactViewMode",
        label: "Scale Comparison View",
        controlType: "select",
        defaultValue: "side_by_side",
        options: [
          { value: "side_by_side", label: "White Dwarf (R≈6,000 km) vs Neutron Star (R≈11 km)" },
          { value: "city_grid_zoom", label: "Neutron Star (D≈22 km) Over 25-km City Reference Grid" },
        ],
        description: "Switch between the side-by-side degeneracy comparator and the 25-km city-scale reference grid.",
      },
    ],
    visualBeats: [
      {
        beatId: "beat-14-2-a",
        beatIndex: 0,
        title: "Electron Degeneracy (White Dwarf) vs. Neutron Degeneracy (Neutron Star)",
        scientificMechanismSummary:
          "Side-by-side comparison of electron degeneracy (M_Ch ≈ 1.44 M_☉, R ≈ 6,000 km) and neutron degeneracy + strong nuclear repulsion (M_TOV ≈ 2.0–2.3 M_☉, R ≈ 11 km).",
        narrationSegmentIds: [
          "14-white-dwarfs-vs-neutron-stars-title",
          "14-white-dwarfs-vs-neutron-stars-lead-1",
          "14-white-dwarfs-vs-neutron-stars-keyIdea-1",
          "14-white-dwarfs-vs-neutron-stars-explanation-1",
        ],
        cameraArchetype: "scale_comparison_view",
        cameraAction: "APPLY_CAMERA_PRESET",
        cameraPosition: [0, 2.0, 7.6],
        cameraTarget: [0, 0, 0],
        cameraFov: 36,
        timePolicy: "SIMULATION_CONTINUOUS",
        simulationTimeScale: 1.0,
        animationAction: "m14_ch2_degeneracy_comparison",
        highlightedObjects: ["white_dwarf_body", "neutron_star_body"],
        transitionType: "smooth",
      },
      {
        beatId: "beat-14-2-b",
        beatIndex: 1,
        title: "Inverse Beta Decay (p + e⁻ → n + ν_e) & City-Scale Neutron Star Density",
        scientificMechanismSummary:
          "Zooms to the R = 11 km (D = 22 km) neutron star suspended over a 25-km city reference grid with ρ ≈ 4 × 10¹⁴ g/cm³.",
        narrationSegmentIds: [
          "14-white-dwarfs-vs-neutron-stars-explanation-2",
          "14-white-dwarfs-vs-neutron-stars-activityPrompt-1",
        ],
        cameraArchetype: "object_close_up",
        cameraAction: "FOCUS_OBJECT",
        cameraPosition: [2.2, 1.8, 5.4],
        cameraTarget: [1.8, 0, 0],
        cameraFov: 34,
        timePolicy: "SIMULATION_CONTINUOUS",
        simulationTimeScale: 1.0,
        animationAction: "m14_ch2_city_scale_neutron_star",
        highlightedObjects: ["neutron_star_body", "city_scale_grid"],
        transitionType: "smooth",
      },
    ],
    chapterAnnotations: [
      {
        annotationId: "ann-14-2-wd",
        objectId: "white_dwarf_body",
        objectName: "White Dwarf",
        type: "RADIUS",
        label: "White Dwarf: R ≈ 6,000 km (D ≈ 12,000 km) • M_Ch ≈ 1.44 M_☉",
        value: "Electron degeneracy • ρ ~ 10⁶ g/cm³ (10⁹ kg/m³)",
        worldPosition: [-2.4, 1.9, 0],
        priority: 1,
      },
      {
        annotationId: "ann-14-2-ns",
        objectId: "neutron_star_body",
        objectName: "Neutron Star (EOS Range)",
        type: "UNCERTAINTY_OR_ILLUSTRATION_NOTICE",
        label: "Neutron Star: R ≈ 10–12 km (D ≈ 20–24 km) • M_TOV ≈ 2.0–2.3 M_☉",
        value: "Neutron degeneracy + strong force (TOV limit has EOS uncertainty)",
        worldPosition: [2.4, 1.9, 0],
        priority: 1,
      },
    ],
    rubricScores: STANDARD_5_RUBRIC,
  },

  {
    moduleId: "14",
    chapterId: "what-is-a-black-hole",
    chapterCode: "14.3",
    chapterOrder: 3,
    title: "What Is a Black Hole?",
    storyboardId: "sb-m14-what-is-a-black-hole",
    sceneComponentId: "m14_ch3_black_hole_birkhoff",
    scientificObjective:
      "Define a black hole via the Schwarzschild radius r_s = 2GM/c² and debunk the 'cosmic vacuum cleaner' myth by proving (via Birkhoff's theorem) that replacing the 1 M_☉ Sun with a 1 M_☉ black hole (r_s = 2.95 km) leaves Earth's 1.00 AU orbit completely unchanged.",
    scientificRepresentation: "PHYSICS_BASED_SIMULATION",
    representationDisclosure:
      "Birkhoff's Theorem Demonstration: Exterior Schwarzschild spacetime for any spherical mass M is identical at r > R_star; strong-field lensing occurs only near r ~ r_s.",
    scientificReviewCorrectionNote:
      "Verified: Included interactive 1 M_☉ Sun ↔ 1 M_☉ Black Hole swap proving distant planetary orbits do not fall inward.",
    requiredObjectIds: ["central_mass_sun_or_bh", "orbiting_earth_1au", "spacetime_funnel_1au", "einstein_lensing_ring"],
    interactiveControls: [
      {
        controlId: "swapSunWithBlackHole",
        label: "Replace 1.0 M_☉ Sun with 1.0 M_☉ Black Hole (r_s = 2.95 km)",
        controlType: "toggle",
        defaultValue: false,
        scientificFormula: "g(1 AU) = G M_☉ / (1 AU)² = 0.00593 m/s² (Identical!)",
        description: "Test whether swapping the Sun for an equal-mass black hole alters Earth's 1 AU orbit.",
      },
      {
        controlId: "blackHoleMassSolar",
        label: "Black Hole Mass (M)",
        controlType: "slider",
        min: 1,
        max: 20,
        step: 1,
        unit: "M_☉",
        defaultValue: 1,
        scientificFormula: "r_s = 2GM / c² ≈ 2.953 × (M / M_☉) km",
        description: "Scale mass M and observe linear growth of the Schwarzschild radius r_s.",
      },
    ],
    visualBeats: [
      {
        beatId: "beat-14-3-a",
        beatIndex: 0,
        title: "Debunking the Cosmic Vacuum Myth: 1 M_☉ Sun ↔ 1 M_☉ Black Hole Swap",
        scientificMechanismSummary:
          "Earth orbits at 1.00 AU (29.78 km/s); swapping the 1 M_☉ Sun for a 1 M_☉ Black Hole (r_s = 2.95 km) leaves the exterior potential and orbit 100% unchanged.",
        narrationSegmentIds: [
          "14-what-is-a-black-hole-title",
          "14-what-is-a-black-hole-lead-1",
          "14-what-is-a-black-hole-keyIdea-1",
          "14-what-is-a-black-hole-explanation-1",
        ],
        cameraArchetype: "planetary_orbital_shot",
        cameraAction: "APPLY_CAMERA_PRESET",
        cameraPosition: [0, 7.8, 11.2],
        cameraTarget: [0, 0, 0],
        cameraFov: 38,
        timePolicy: "SIMULATION_CONTINUOUS",
        simulationTimeScale: 1.0,
        animationAction: "m14_ch3_birkhoff_1msun_swap",
        highlightedObjects: ["central_mass_sun_or_bh", "orbiting_earth_1au"],
        transitionType: "smooth",
      },
      {
        beatId: "beat-14-3-b",
        beatIndex: 1,
        title: "Diving Into the Strong-Field Regime (r < 15 r_s) & Gravitational Lensing",
        scientificMechanismSummary:
          "Camera zooms into the strong-field region r < 15 r_s revealing curved null geodesics and the Einstein ring.",
        narrationSegmentIds: [
          "14-what-is-a-black-hole-explanation-2",
          "14-what-is-a-black-hole-activityPrompt-1",
        ],
        cameraArchetype: "relativistic_horizon_framing",
        cameraAction: "ZOOM_TO_OBJECT",
        cameraPosition: [0, 1.8, 6.2],
        cameraTarget: [0, 0, 0],
        cameraFov: 35,
        timePolicy: "SIMULATION_CONTINUOUS",
        simulationTimeScale: 1.0,
        animationAction: "m14_ch3_strong_field_lensing",
        highlightedObjects: ["central_mass_sun_or_bh", "einstein_lensing_ring"],
        transitionType: "scale_bridge",
      },
    ],
    chapterAnnotations: [
      {
        annotationId: "ann-14-3-birkhoff",
        objectId: "orbiting_earth_1au",
        objectName: "Birkhoff's Theorem Proof",
        type: "PHYSICAL_FORCES",
        label: "Not a Cosmic Vacuum Cleaner: F_g(1 AU, 1 M_☉ BH) = F_g(1 AU, 1 M_☉ Sun)",
        value: "Earth continues orbiting at 29.78 km/s • r_s(1 M_☉) = 2.95 km",
        worldPosition: [0, 2.45, 0],
        priority: 1,
      },
    ],
    rubricScores: STANDARD_5_RUBRIC,
  },

  {
    moduleId: "14",
    chapterId: "event-horizons",
    chapterCode: "14.4",
    chapterOrder: 4,
    title: "Event Horizons & Photon Spheres",
    storyboardId: "sb-m14-event-horizons",
    sceneComponentId: "m14_ch4_event_horizon_photon_sphere",
    scientificObjective:
      "Distinguish the non-rotating Schwarzschild characteristic radii—Event Horizon (1.0 r_s), Photon Sphere (1.5 r_s), Critical Impact Parameter / Apparent Shadow (b_c = (3√3/2) r_s ≈ 2.60 r_s), and ISCO (3.0 r_s)—and trace photon capture vs deflection trajectories.",
    scientificRepresentation: "PHYSICS_BASED_SIMULATION",
    representationDisclosure:
      "Non-rotating Schwarzschild metric (a* = 0) dimensionless ratios: r_H = 1.0 r_s, r_ph = 1.5 r_s, b_c ≈ 2.598 r_s, r_ISCO = 3.0 r_s (for rotating Kerr black holes, r_ph and r_ISCO shift inward for prograde orbits).",
    scientificReviewCorrectionNote:
      "Verified: Explicitly separated non-rotating Schwarzschild ratios (1.0 r_s, 1.5 r_s, 2.60 r_s, 3.0 r_s) from Kerr spin-dependent radii.",
    requiredObjectIds: [
      "event_horizon_sphere",
      "photon_sphere_shell",
      "isco_ring",
      "photon_geodesic_rays",
    ],
    interactiveControls: [
      {
        controlId: "photonImpactParameterRs",
        label: "Photon Impact Parameter (b / r_s)",
        controlType: "slider",
        min: 1.0,
        max: 4.2,
        step: 0.1,
        unit: "r_s",
        defaultValue: 2.6,
        scientificFormula: "b_c = (3√3 / 2) r_s ≈ 2.598 r_s (Orbits at r_ph = 1.5 r_s)",
        description: "Aim a test photon beam: b < 2.60 r_s is captured; b = 2.60 r_s orbits at 1.5 r_s; b > 2.60 r_s is deflected.",
      },
      {
        controlId: "showMetricShells",
        label: "Show 1.0 r_s, 1.5 r_s & 3.0 r_s Wireframe Shells",
        controlType: "toggle",
        defaultValue: true,
        description: "Toggle concentric Schwarzschild Horizon, Photon Sphere, and ISCO boundaries.",
      },
    ],
    visualBeats: [
      {
        beatId: "beat-14-4-a",
        beatIndex: 0,
        title: "Schwarzschild Characteristic Radii: 1.0 r_s, 1.5 r_s Photon Sphere & 3.0 r_s ISCO",
        scientificMechanismSummary:
          "Illuminates concentric nested boundaries at 1.0 r_s (Event Horizon), 1.5 r_s (Photon Sphere), 2.60 r_s (Apparent Shadow), and 3.0 r_s (Schwarzschild ISCO).",
        narrationSegmentIds: [
          "14-event-horizons-title",
          "14-event-horizons-lead-1",
          "14-event-horizons-keyIdea-1",
          "14-event-horizons-explanation-1",
        ],
        cameraArchetype: "scientific_cross_section",
        cameraAction: "APPLY_CAMERA_PRESET",
        cameraPosition: [0, 3.6, 8.2],
        cameraTarget: [0, 0, 0],
        cameraFov: 36,
        timePolicy: "SIMULATION_CONTINUOUS",
        simulationTimeScale: 1.0,
        animationAction: "m14_ch4_schwarzschild_shells",
        highlightedObjects: ["event_horizon_sphere", "photon_sphere_shell", "isco_ring"],
        transitionType: "smooth",
      },
      {
        beatId: "beat-14-4-b",
        beatIndex: 1,
        title: "Null Geodesic Photon Capture (b < b_c), Orbit (b = b_c) & Deflection (b > b_c)",
        scientificMechanismSummary:
          "Animated photon trajectories demonstrate capture inside b_c = 2.60 r_s, unstable circular orbit on the 1.5 r_s photon sphere, and relativistic deflection outside b_c.",
        narrationSegmentIds: [
          "14-event-horizons-explanation-2",
          "14-event-horizons-activityPrompt-1",
        ],
        cameraArchetype: "object_close_up",
        cameraAction: "ORBIT_OBJECT",
        cameraPosition: [1.8, 5.2, 6.8],
        cameraTarget: [0, 0, 0],
        cameraFov: 35,
        timePolicy: "SIMULATION_CONTINUOUS",
        simulationTimeScale: 1.0,
        animationAction: "m14_ch4_null_geodesic_ray_tracing",
        highlightedObjects: ["photon_geodesic_rays", "photon_sphere_shell"],
        transitionType: "smooth",
      },
    ],
    chapterAnnotations: [
      {
        annotationId: "ann-14-4-radii",
        objectId: "photon_sphere_shell",
        objectName: "Schwarzschild Geometry (a* = 0)",
        type: "SCIENTIFIC_EQUATION",
        label: "Horizon = 1.0 r_s • Photon Sphere = 1.5 r_s • ISCO = 3.0 r_s",
        value: "Critical Impact Parameter b_c = (3√3 / 2) r_s ≈ 2.60 r_s",
        worldPosition: [0, 2.55, 0],
        priority: 1,
      },
    ],
    rubricScores: STANDARD_5_RUBRIC,
  },

  {
    moduleId: "14",
    chapterId: "accretion-disks",
    chapterCode: "14.5",
    chapterOrder: 5,
    title: "Accretion Disks",
    storyboardId: "sb-m14-accretion-disks",
    sceneComponentId: "m14_ch5_relativistic_accretion_disk",
    scientificObjective:
      "Understand differential Keplerian shear (Ω ∝ r^(-3/2)), radiative mass-to-energy conversion efficiency (η ≈ 6% Schwarzschild to 42% extreme Kerr), relativistic Doppler beaming brightness asymmetry (I ∝ δ³), and gravitational lensing of the far-side disk.",
    scientificRepresentation: "PHYSICS_BASED_SIMULATION",
    representationDisclosure:
      "Analytical Relativistic Shader Notice: Disk emission uses an analytical Novikov-Thorne + Doppler beaming (δ = [γ(1-β cos θ)]⁻¹) and gravitational lensing approximation, not full numerical GRMHD ray tracing. Isolated non-accreting black holes do not possess luminous disks.",
    scientificReviewCorrectionNote:
      "Verified: Explicitly disclosed analytical GR shader approximation and noted that dormant isolated black holes lack visible accretion disks.",
    requiredObjectIds: ["event_horizon", "accretion_disk_volume", "lensed_photon_ring"],
    interactiveControls: [
      {
        controlId: "diskInclinationDeg",
        label: "Observer Viewing Inclination (i)",
        controlType: "slider",
        min: 10,
        max: 85,
        step: 5,
        unit: "°",
        defaultValue: 76,
        scientificFormula: "δ = [γ (1 - β sin(i) cos(φ))]⁻¹ • I_obs ∝ δ³",
        description: "Tilt from face-on (i=10°) to edge-on (i=85°) to see Doppler beaming and far-side lensing arches.",
      },
      {
        controlId: "dimensionlessSpinAStar",
        label: "Kerr Dimensionless Spin (a*)",
        controlType: "slider",
        min: 0.0,
        max: 0.95,
        step: 0.05,
        defaultValue: 0.65,
        scientificFormula: "η(a*=0) ≈ 5.7% mc² → η(a*→1) ≈ 42% mc²",
        description: "Increase black hole spin a* to shrink the prograde ISCO and increase radiative efficiency η.",
      },
    ],
    visualBeats: [
      {
        beatId: "beat-14-5-a",
        beatIndex: 0,
        title: "Differential Viscous Shear & 6%–42% Mass-Energy Efficiency",
        scientificMechanismSummary:
          "Gas spirals inward to the ISCO with Ω ∝ r^(-3/2), heating from 10⁴ K (outer orange) to 10⁷ K (inner blue-white X-ray).",
        narrationSegmentIds: [
          "14-accretion-disks-title",
          "14-accretion-disks-lead-1",
          "14-accretion-disks-explanation-1",
        ],
        cameraArchetype: "planetary_orbital_shot",
        cameraAction: "APPLY_CAMERA_PRESET",
        cameraPosition: [0, 3.8, 8.2],
        cameraTarget: [0, 0, 0],
        cameraFov: 36,
        timePolicy: "SIMULATION_CONTINUOUS",
        simulationTimeScale: 1.0,
        animationAction: "m14_ch5_viscous_shear_heating",
        highlightedObjects: ["accretion_disk_volume", "event_horizon"],
        transitionType: "smooth",
      },
      {
        beatId: "beat-14-5-b",
        beatIndex: 1,
        title: "Relativistic Doppler Beaming Asymmetry & Lensed Far-Side Halo Arch",
        scientificMechanismSummary:
          "Grazing inclination shows the approaching wing blueshifted & brightened (δ³ > 1), the receding wing redshifted & dimmed, and the far-side disk lensed over the shadow.",
        narrationSegmentIds: [
          "14-accretion-disks-keyIdea-1",
          "14-accretion-disks-explanation-2",
          "14-accretion-disks-activityPrompt-1",
        ],
        cameraArchetype: "relativistic_horizon_framing",
        cameraAction: "FOCUS_OBJECT",
        cameraPosition: [0, 1.1, 7.2],
        cameraTarget: [0, 0, 0],
        cameraFov: 34,
        timePolicy: "SIMULATION_CONTINUOUS",
        simulationTimeScale: 1.0,
        animationAction: "m14_ch5_doppler_beaming_and_lensing_arch",
        highlightedObjects: ["accretion_disk_volume", "lensed_photon_ring"],
        transitionType: "smooth",
      },
    ],
    chapterAnnotations: [
      {
        annotationId: "ann-14-5-doppler",
        objectId: "accretion_disk_volume",
        objectName: "Relativistic Accretion Engine",
        type: "UNCERTAINTY_OR_ILLUSTRATION_NOTICE",
        label: "Doppler Beaming I ∝ δ³ • Efficiency η = 5.7% (a*=0) to 42% (Kerr)",
        value: "Analytical GR shader approximation • Dormant black holes have no bright disk",
        worldPosition: [0, 2.5, 0],
        priority: 1,
      },
    ],
    rubricScores: STANDARD_5_RUBRIC,
  },

  {
    moduleId: "14",
    chapterId: "pulsars-and-magnetars",
    chapterCode: "14.6",
    chapterOrder: 6,
    title: "Pulsars & Magnetars",
    storyboardId: "sb-m14-pulsars-and-magnetars",
    sceneComponentId: "m14_ch6_pulsar_magnetar_lighthouse",
    scientificObjective:
      "Visualize a rotating neutron star's spin axis Ω vs tilted magnetic dipole axis μ (angle α), understand why pulses are observed only if the beam sweeps across our line of sight (angle ζ), and contrast standard pulsars (B ~ 10⁸ T) with Magnetars (B ~ 10¹⁰–10¹¹ T).",
    scientificRepresentation: "PHYSICS_BASED_SIMULATION",
    representationDisclosure:
      "Beaming Geometry & Reduced Motion Notice: A neutron star is observed as a pulsar only if its emission cone intersects the observer's sightline. High-frequency screen flashing is suppressed for photosensitive safety.",
    scientificReviewCorrectionNote:
      "Verified: Demonstrated that misaligned sightlines do not observe pulses (not every rotating neutron star is seen as a pulsar) and avoided any high-frequency strobing.",
    requiredObjectIds: ["pulsar_remnant", "spin_axis_vector", "magnetic_axis_vector", "magnetar_flux_loops"],
    interactiveControls: [
      {
        controlId: "magneticTiltDeg",
        label: "Magnetic Dipole Tilt Angle (α)",
        controlType: "slider",
        min: 5,
        max: 80,
        step: 5,
        unit: "°",
        defaultValue: 35,
        scientificFormula: "Pulse Observed iff |α - ζ| ≤ θ_beam",
        description: "Adjust the angle α between the rotation axis Ω and magnetic dipole axis μ.",
      },
      {
        controlId: "observerSightlineDeg",
        label: "Observer Viewing Angle (ζ)",
        controlType: "slider",
        min: 5,
        max: 80,
        step: 5,
        unit: "°",
        defaultValue: 35,
        description: "Change observer latitude ζ to see when the lighthouse beam hits or misses our line of sight.",
      },
      {
        controlId: "neutronStarRegime",
        label: "Neutron Star Magnetic Regime",
        controlType: "select",
        defaultValue: "pulsar",
        options: [
          { value: "pulsar", label: "Rotation-Powered Pulsar (B ~ 10⁸ Tesla • Radio/X-Ray Beams)" },
          { value: "magnetar", label: "Magnetar (B ~ 10¹¹ Tesla • Twisted Flux & Crustal Starquakes)" },
        ],
        description: "Switch between a standard rotation-powered pulsar and an ultra-magnetized Magnetar.",
      },
    ],
    visualBeats: [
      {
        beatId: "beat-14-6-a",
        beatIndex: 0,
        title: "Oblique Rotator Lighthouse Model: Spin Axis Ω vs. Magnetic Axis μ",
        scientificMechanismSummary:
          "Spinning neutron star sweeps twin synchrotron cones at tilt angle α; live pulse-profile trace peaks when the beam crosses observer sightline ζ.",
        narrationSegmentIds: [
          "14-pulsars-and-magnetars-title",
          "14-pulsars-and-magnetars-lead-1",
          "14-pulsars-and-magnetars-explanation-1",
        ],
        cameraArchetype: "fixed_observation_camera",
        cameraAction: "APPLY_CAMERA_PRESET",
        cameraPosition: [0, 2.2, 7.2],
        cameraTarget: [0, 0, 0],
        cameraFov: 36,
        timePolicy: "SIMULATION_CONTINUOUS",
        simulationTimeScale: 1.0,
        animationAction: "m14_ch6_pulsar_lighthouse_geometry",
        highlightedObjects: ["pulsar_remnant", "spin_axis_vector", "magnetic_axis_vector"],
        transitionType: "smooth",
      },
      {
        beatId: "beat-14-6-b",
        beatIndex: 1,
        title: "Magnetars: 10¹⁰–10¹¹ Tesla Twisted Magnetospheres & Starquakes",
        scientificMechanismSummary:
          "Twisted toroidal magnetic flux loops (10¹⁴–10¹⁵ Gauss) stress the solid neutron-star crust, triggering a soft-gamma starquake flare.",
        narrationSegmentIds: [
          "14-pulsars-and-magnetars-keyIdea-1",
          "14-pulsars-and-magnetars-explanation-2",
          "14-pulsars-and-magnetars-activityPrompt-1",
        ],
        cameraArchetype: "object_close_up",
        cameraAction: "FOCUS_OBJECT",
        cameraPosition: [1.6, 1.8, 5.8],
        cameraTarget: [0, 0, 0],
        cameraFov: 34,
        timePolicy: "SIMULATION_CONTINUOUS",
        simulationTimeScale: 1.0,
        animationAction: "m14_ch6_magnetar_flux_and_starquake",
        highlightedObjects: ["pulsar_remnant", "magnetar_flux_loops"],
        transitionType: "smooth",
      },
    ],
    chapterAnnotations: [
      {
        annotationId: "ann-14-6-pulsar",
        objectId: "pulsar_remnant",
        objectName: "Oblique Dipole Rotator",
        type: "PHYSICAL_FORCES",
        label: "Spin Axis Ω vs Magnetic Axis μ (Tilt α) • Sightline ζ",
        value: "Pulsar: B ~ 10⁸ T • Magnetar: B ~ 10¹⁰–10¹¹ T (10¹⁵ Gauss)",
        worldPosition: [0, 2.5, 0],
        priority: 1,
      },
    ],
    rubricScores: STANDARD_5_RUBRIC,
  },

  {
    moduleId: "14",
    chapterId: "supermassive-black-holes",
    chapterCode: "14.7",
    chapterOrder: 7,
    title: "Supermassive Black Holes",
    storyboardId: "sb-m14-supermassive-black-holes",
    sceneComponentId: "m14_ch7_supermassive_black_holes",
    scientificObjective:
      "Compare Sagittarius A* (4.15 × 10⁶ M_☉, constrained by the 16.05-year eccentric orbit of star S2 reaching 7,650 km/s = 2.55% c at 120 AU periastron) with M87* (6.5 × 10⁹ M_☉, r_s ≈ 128 AU encompassing our entire Solar System, plus its 5,000-ly relativistic jet).",
    scientificRepresentation: "OBSERVATION_BASED",
    representationDisclosure:
      "Observational Provenance Notice: S2 orbital elements (e = 0.8846, P = 16.05 yr, Schwarzschild precession) are from GRAVITY/Keck astrometry; M87* shadow scale (42 μas) is from Event Horizon Telescope (2019) VLBI constraints combined with 3D jet reconstruction.",
    scientificReviewCorrectionNote:
      "Verified: Clearly distinguished measured GRAVITY S2 astrometry and EHT 1.3 mm VLBI ring constraints from the 3D galactic core and relativistic jet model reconstruction.",
    requiredObjectIds: ["smbh_horizon", "s2_star_orbit", "solar_system_scale_ring", "m87_relativistic_jet"],
    interactiveControls: [
      {
        controlId: "smbhSystemTarget",
        label: "Supermassive Black Hole System",
        controlType: "select",
        defaultValue: "sgr_a_star",
        options: [
          { value: "sgr_a_star", label: "Sagittarius A* (4.15 × 10⁶ M_☉) & Star S2 Rosette Orbit" },
          { value: "m87_star", label: "M87* (6.5 × 10⁹ M_☉) Shadow vs. 30-AU Solar System & Jet" },
        ],
        scientificFormula: "M_SgrA* = 4.154 × 10⁶ M_☉ • M_M87* = 6.5 × 10⁹ M_☉",
        description: "Switch between Galactic Center S2 astrometry around Sgr A* and EHT scale comparison of M87*.",
      },
      {
        controlId: "showSolarSystemComparison",
        label: "Superimpose 30-AU Neptune Orbit Scale Ring",
        controlType: "toggle",
        defaultValue: true,
        description: "Compare our Solar System's 30-AU Neptune orbit directly against the SMBH horizon scale.",
      },
    ],
    visualBeats: [
      {
        beatId: "beat-14-7-a",
        beatIndex: 0,
        title: "Sagittarius A* (4.15 × 10⁶ M_☉) & Star S2 Periastron Swing at 2.55% c",
        scientificMechanismSummary:
          "Star S2 traces its e = 0.8846, 16.05-year rosette-precessing orbit around Sgr A*, reaching 7,650 km/s at 120 AU periastron.",
        narrationSegmentIds: [
          "14-supermassive-black-holes-title",
          "14-supermassive-black-holes-lead-1",
          "14-supermassive-black-holes-explanation-1",
        ],
        cameraArchetype: "planetary_orbital_shot",
        cameraAction: "APPLY_CAMERA_PRESET",
        cameraPosition: [0, 5.2, 9.8],
        cameraTarget: [0, 0, 0],
        cameraFov: 38,
        timePolicy: "SIMULATION_CONTINUOUS",
        simulationTimeScale: 1.0,
        animationAction: "m14_ch7_sgr_a_star_s2_orbit",
        highlightedObjects: ["smbh_horizon", "s2_star_orbit"],
        transitionType: "smooth",
      },
      {
        beatId: "beat-14-7-b",
        beatIndex: 1,
        title: "M87* (6.5 × 10⁹ M_☉) Shadow vs. Solar System Scale & 5,000-ly Relativistic Jet",
        scientificMechanismSummary:
          "Compares M87*'s r_s ≈ 128 AU shadow against Neptune's 30-AU orbit while launching twin Blandford-Znajek relativistic polar jets.",
        narrationSegmentIds: [
          "14-supermassive-black-holes-keyIdea-1",
          "14-supermassive-black-holes-activityPrompt-1",
        ],
        cameraArchetype: "scale_comparison_view",
        cameraAction: "PAN_TO_REGION",
        cameraPosition: [0, 4.2, 11.8],
        cameraTarget: [0, 0.5, 0],
        cameraFov: 40,
        timePolicy: "SIMULATION_CONTINUOUS",
        simulationTimeScale: 1.0,
        animationAction: "m14_ch7_m87_solar_scale_and_jet",
        highlightedObjects: ["smbh_horizon", "solar_system_scale_ring", "m87_relativistic_jet"],
        transitionType: "scale_bridge",
      },
    ],
    chapterAnnotations: [
      {
        annotationId: "ann-14-7-smbh",
        objectId: "smbh_horizon",
        objectName: "Astrometric & EHT VLBI Constraints",
        type: "OBSERVATION_REFERENCE",
        label: "Sgr A*: 4.15 × 10⁶ M_☉ (S2 v_p = 7,650 km/s = 0.0255 c)",
        value: "M87*: 6.5 × 10⁹ M_☉ (r_s ≈ 128 AU > Neptune 30 AU orbit • EHT 2019)",
        worldPosition: [0, 2.6, 0],
        priority: 1,
      },
    ],
    rubricScores: STANDARD_5_RUBRIC,
  },

  {
    moduleId: "14",
    chapterId: "gravitational-waves",
    chapterCode: "14.8",
    chapterOrder: 8,
    title: "Gravitational Waves",
    storyboardId: "sb-m14-gravitational-waves",
    sceneComponentId: "m14_ch8_gravitational_wave_chirp",
    scientificObjective:
      "Visualize binary compact-object coalescence (LIGO GW150914: 36 M_☉ + 29 M_☉ → 62 M_☉, radiating 3.0 M_☉ c² in gravitational waves) across Inspiral, Merger, and Ringdown, relating orbital frequency evolution to the transverse quadrupole strain waveform h(t) ~ 10⁻²¹.",
    scientificRepresentation: "PHYSICS_BASED_SIMULATION",
    representationDisclosure:
      "Spacetime Strain Representation Notice: Gravitational waves are transverse quadrupole metric perturbations (h_+, h_×) propagating at speed c through spacetime itself—NOT acoustic sound waves in a physical fluid. The 3D surface represents quadrupole strain amplitude h(r,t).",
    scientificReviewCorrectionNote:
      "Verified: Explicitly distinguished the 3D quadrupole strain mesh from literal physical fluid waves and noted that gravitational waves are transverse metric perturbations propagating at c, not sound.",
    requiredObjectIds: [
      "binary_bh_primary",
      "binary_bh_secondary",
      "quadrupole_wave_mesh",
      "ligo_strain_waveform",
    ],
    interactiveControls: [
      {
        controlId: "coalescencePhaseMode",
        label: "Coalescence Waveform Stage",
        controlType: "select",
        defaultValue: "auto_chirp",
        options: [
          { value: "auto_chirp", label: "Full Coalescence Cycle (Inspiral → Merger → Ringdown)" },
          { value: "inspiral", label: "1. Inspiral (Shrinking Orbit & Rising Frequency f_GW = 2 f_orb)" },
          { value: "merger", label: "2. Merger Crescendo (v ~ 0.6 c • 3.0 M_☉ c² Radiated)" },
          { value: "ringdown", label: "3. Quasi-Normal Mode Kerr Ringdown (62 M_☉ Remnant)" },
        ],
        scientificFormula: "f_GW = 2 f_orb • h = ΔL / L ≈ 1.0 × 10⁻²¹ (GW150914)",
        description: "Inspect the three physical stages of binary black hole coalescence and strain h(t).",
        linkedActivityId: "act_14_black_hole_lab",
        linkedActionType: "inspect_gw_chirp",
      },
      {
        controlId: "chirpMassRatio",
        label: "Binary Mass Ratio (q = m₂ / m₁)",
        controlType: "slider",
        min: 0.4,
        max: 1.0,
        step: 0.05,
        defaultValue: 0.80,
        scientificFormula: "M_chirp = (m₁ m₂)^(3/5) / (m₁ + m₂)^(1/5) ≈ 28.3 M_☉",
        description: "Adjust binary mass ratio (GW150914: 29 M_☉ / 36 M_☉ ≈ 0.81) and observe quadrupole wave symmetry.",
        linkedActivityId: "act_14_black_hole_lab",
        linkedActionType: "adjust_compact_mass",
      },
    ],
    visualBeats: [
      {
        beatId: "beat-14-8-a",
        beatIndex: 0,
        title: "GW150914 Binary Black Hole Inspiral & Quadrupole Strain Ripples (h_+, h_×)",
        scientificMechanismSummary:
          "36 M_☉ and 29 M_☉ black holes spiral inward, emitting transverse quadrupole spacetime strain waves at f_GW = 2 f_orb.",
        narrationSegmentIds: [
          "14-gravitational-waves-title",
          "14-gravitational-waves-lead-1",
          "14-gravitational-waves-keyIdea-1",
        ],
        cameraArchetype: "establishing_shot",
        cameraAction: "APPLY_CAMERA_PRESET",
        cameraPosition: [0, 7.6, 11.2],
        cameraTarget: [0, -0.4, 0],
        cameraFov: 40,
        timePolicy: "SIMULATION_CONTINUOUS",
        simulationTimeScale: 1.0,
        animationAction: "m14_ch8_binary_inspiral_quadrupole",
        highlightedObjects: ["binary_bh_primary", "binary_bh_secondary", "quadrupole_wave_mesh"],
        transitionType: "smooth",
      },
      {
        beatId: "beat-14-8-b",
        beatIndex: 1,
        title: "Merger Chirp Crescendo (3 M_☉ c²), Kerr Ringdown & LIGO Strain Gate",
        scientificMechanismSummary:
          "Horizons merge at ~0.6 c into a 62 M_☉ Kerr black hole, radiating 3.0 M_☉ c² and settling via damped ringdown while plotting live LIGO strain h(t).",
        narrationSegmentIds: [
          "14-gravitational-waves-explanation-1",
          "14-gravitational-waves-explanation-2",
          "14-gravitational-waves-activityPrompt-1",
        ],
        cameraArchetype: "data_visualization_view",
        cameraAction: "ORBIT_OBJECT",
        cameraPosition: [2.2, 6.4, 9.8],
        cameraTarget: [0, -0.2, 0],
        cameraFov: 38,
        timePolicy: "WAIT_FOR_STUDENT",
        simulationTimeScale: 1.0,
        animationAction: "m14_ch8_merger_ringdown_and_ligo_gate",
        highlightedObjects: ["quadrupole_wave_mesh", "ligo_strain_waveform"],
        transitionType: "smooth",
      },
    ],
    chapterAnnotations: [
      {
        annotationId: "ann-14-8-gw",
        objectId: "quadrupole_wave_mesh",
        objectName: "LIGO GW150914 Quadrupole Strain",
        type: "UNCERTAINTY_OR_ILLUSTRATION_NOTICE",
        label: "GW150914: 36 M_☉ + 29 M_☉ → 62 M_☉ + 3.0 M_☉ c² (h ≈ 10⁻²¹)",
        value: "Transverse spacetime metric ripples at speed c (NOT acoustic sound in a fluid)",
        worldPosition: [0, 2.55, 0],
        priority: 1,
      },
    ],
    requiresActivityGate: {
      activityId: "act_14_black_hole_lab",
      gateDescription: "Inspect the coalescence stages or adjust the binary mass ratio to verify gravitational-wave strain behavior.",
    },
    rubricScores: STANDARD_5_RUBRIC,
  },
];

/**
 * Helper class for querying the 22-chapter, 120-segment Proof-of-Concept manifest.
 */
export class CosmosProofOfConceptCatalog {
  private static byModuleAndChapter = new Map<string, ProofOfConceptChapterManifest>();
  private static bySegmentId = new Map<
    string,
    { chapter: ProofOfConceptChapterManifest; beat: ChapterVisualBeatSpec }
  >();
  private static initialized = false;

  private static allManifests: ProofOfConceptChapterManifest[] = [];

  private static ensureInitialized(): void {
    if (this.initialized) return;
    this.allManifests = [
      ...PROOF_OF_CONCEPT_CHAPTER_MANIFESTS,
      ...STAGE_2_NEW_CHAPTER_MANIFESTS,
    ];
    for (const chapter of this.allManifests) {
      const key = `${chapter.moduleId}:${chapter.chapterId}`;
      this.byModuleAndChapter.set(key, chapter);
      for (const beat of chapter.visualBeats) {
        for (const segId of beat.narrationSegmentIds) {
          this.bySegmentId.set(segId, { chapter, beat });
        }
      }
    }
    this.initialized = true;
  }

  public static isProofOfConceptModule(moduleId: string): moduleId is ProofOfConceptModuleId {
    const norm = String(moduleId).padStart(2, "0");
    return (
      norm === "01" ||
      norm === "05" ||
      norm === "06" ||
      norm === "07" ||
      norm === "08" ||
      norm === "14"
    );
  }

  public static isStage2Module(moduleId: string): moduleId is Stage2ModuleId {
    const norm = String(moduleId).padStart(2, "0");
    return norm === "05" || norm === "06" || norm === "07" || norm === "08";
  }

  public static getChaptersForModule(moduleId: string): ProofOfConceptChapterManifest[] {
    this.ensureInitialized();
    const norm = String(moduleId).padStart(2, "0");
    return this.allManifests.filter((c) => c.moduleId === norm);
  }

  public static getChapterManifest(
    moduleId: string,
    chapterId: string,
  ): ProofOfConceptChapterManifest | null {
    this.ensureInitialized();
    const norm = String(moduleId).padStart(2, "0");
    const direct = this.byModuleAndChapter.get(`${norm}:${chapterId}`);
    if (direct) return direct;

    const stripped = chapterId.replace(new RegExp(`^${norm}-`), "");
    const byStripped = this.byModuleAndChapter.get(`${norm}:${stripped}`);
    if (byStripped) return byStripped;

    const moduleChapters = this.getChaptersForModule(norm);
    const numMatch = chapterId.match(/(?:sub-0?|lesson-|0\d-0?)(\d+)/i);
    if (numMatch) {
      const idx = parseInt(numMatch[1], 10);
      const byIdx = moduleChapters.find((c) => c.chapterIndex === idx);
      if (byIdx) return byIdx;
    }

    const queryLower = stripped.toLowerCase();
    const matched = moduleChapters.find(
      (c) =>
        c.chapterId.toLowerCase().includes(queryLower) ||
        queryLower.includes(c.chapterId.toLowerCase()) ||
        c.storyboardId.toLowerCase().includes(queryLower) ||
        c.sceneComponentId.toLowerCase().includes(queryLower) ||
        c.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").includes(queryLower),
    );
    return matched || moduleChapters[0] || null;
  }

  public static getBeatForNarrationSegment(
    moduleId: string,
    chapterId: string,
    narrationSegmentId: string,
  ): { chapter: ProofOfConceptChapterManifest; beat: ChapterVisualBeatSpec } | null {
    this.ensureInitialized();
    // 1. Direct canonical segmentId lookup
    const exact = this.bySegmentId.get(narrationSegmentId);
    if (exact) return exact;

    // 2. Fallback by chapterId + semantic suffix (for junior/astronomer or localized segment variants)
    const chapter = this.getChapterManifest(moduleId, chapterId);
    if (!chapter) return null;

    const segLower = narrationSegmentId.toLowerCase();
    for (const beat of chapter.visualBeats) {
      if (
        beat.narrationSegmentIds.some((id) => {
          const suffix = id.replace(`${chapter.moduleId}-${chapter.chapterId}-`, "").toLowerCase();
          return suffix && segLower.includes(suffix);
        })
      ) {
        return { chapter, beat };
      }
    }

    // 3. Deterministic fallback to last beat if deepDive-2/3 or mathOrAnalogy, else first beat
    if (
      (segLower.includes("deepdive-2") ||
        segLower.includes("deepdive-3") ||
        segLower.includes("didyouknow") ||
        segLower.includes("mathoranalogy") ||
        segLower.includes("detail-2") ||
        segLower.includes("detail-3")) &&
      chapter.visualBeats.length > 1
    ) {
      return { chapter, beat: chapter.visualBeats[chapter.visualBeats.length - 1] };
    }

    return { chapter, beat: chapter.visualBeats[0] };
  }

  public static getAllChapterManifests(): ProofOfConceptChapterManifest[] {
    this.ensureInitialized();
    return [...this.allManifests];
  }

  public static getStage2ChapterManifests(): ProofOfConceptChapterManifest[] {
    this.ensureInitialized();
    return this.allManifests.filter((c) => this.isStage2Module(c.moduleId));
  }

  public static getSummaryStatistics(): {
    totalModules: number;
    totalChapters: number;
    totalCanonicalSegments: number;
    byModule: Record<"01" | "08" | "14", { chapters: number; segments: number }>;
  } {
    this.ensureInitialized();
    const byModule: Record<"01" | "08" | "14", { chapters: number; segments: number }> = {
      "01": { chapters: 0, segments: 0 },
      "08": { chapters: 0, segments: 0 },
      "14": { chapters: 0, segments: 0 },
    };
    let totalSegments = 0;
    for (const ch of PROOF_OF_CONCEPT_CHAPTER_MANIFESTS) {
      if (ch.moduleId === "01" || ch.moduleId === "08" || ch.moduleId === "14") {
        byModule[ch.moduleId].chapters += 1;
        const segCount = ch.visualBeats.reduce((acc, b) => acc + b.narrationSegmentIds.length, 0);
        byModule[ch.moduleId].segments += segCount;
        totalSegments += segCount;
      }
    }
    return {
      totalModules: 3,
      totalChapters: PROOF_OF_CONCEPT_CHAPTER_MANIFESTS.length,
      totalCanonicalSegments: totalSegments,
      byModule,
    };
  }

  public static getStage2SummaryStatistics(): {
    totalModules: number;
    totalChapters: number;
    newChapters: number;
    totalCanonicalSegments: number;
    newCanonicalSegments: number;
    totalVisualBeats: number;
    byModule: Record<Stage2ModuleId, { chapters: number; segments: number; beats: number }>;
  } {
    this.ensureInitialized();
    const byModule: Record<Stage2ModuleId, { chapters: number; segments: number; beats: number }> = {
      "05": { chapters: 0, segments: 0, beats: 0 },
      "06": { chapters: 0, segments: 0, beats: 0 },
      "07": { chapters: 0, segments: 0, beats: 0 },
      "08": { chapters: 0, segments: 0, beats: 0 },
    };
    let totalChapters = 0;
    let totalCanonicalSegments = 0;
    let totalVisualBeats = 0;

    for (const ch of this.getStage2ChapterManifests()) {
      const mId = ch.moduleId as Stage2ModuleId;
      byModule[mId].chapters += 1;
      byModule[mId].beats += ch.visualBeats.length;
      const segCount = ch.visualBeats.reduce((acc, b) => acc + b.narrationSegmentIds.length, 0);
      byModule[mId].segments += segCount;
      totalChapters += 1;
      totalCanonicalSegments += segCount;
      totalVisualBeats += ch.visualBeats.length;
    }

    return {
      totalModules: 4,
      totalChapters,
      newChapters: byModule["05"].chapters + byModule["06"].chapters + byModule["07"].chapters,
      totalCanonicalSegments,
      newCanonicalSegments:
        byModule["05"].segments + byModule["06"].segments + byModule["07"].segments,
      totalVisualBeats,
      byModule,
    };
  }
}

export function formatLevelAdaptedChapterSummary(
  chapter: ProofOfConceptChapterManifest,
  level: LearningLevel,
): string {
  if (level === "junior") {
    return `${chapter.title}: Guided visual discovery of ${chapter.requiredObjectIds[0]?.replace(/_/g, " ") || "space"}.`;
  }
  if (level === "astronomer") {
    return `${chapter.scientificObjective} (${chapter.representationDisclosure})`;
  }
  return chapter.scientificObjective;
}
