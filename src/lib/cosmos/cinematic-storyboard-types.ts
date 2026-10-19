/**
 * COSMOS Cinematic Learning System — Storyboard & Fullscreen Player Contracts
 * Project: Our Visible Universe Academy
 * Scope: Prompt 02 — Cinematic Art Direction, Storyboard Data Contract & Prompt 03 Player Interface
 *
 * Defines:
 * 1. Reusable structured Storyboard & AnimationBeat contracts (Section 7)
 * 2. Scientific Visualization Epistemic & Representation Standards (Section 9)
 * 3. Quality Review Rubric 10-Dimension Gate Contract (Section 17)
 * 4. Prompt 03 Fullscreen Cinematic Player State, Camera, Sync & Overlay Interfaces (Section 21)
 * 5. Runtime validation functions for machine-readable storyboard manifests
 */

import type { LearningLevel } from "../academy/types";
import type {
  CosmosLanguage,
  CosmosVisualizationReference,
  EpistemicStatus,
  NarrationSegment,
} from "./cosmos-types";
import type { GuidedLearningState } from "./learning-director-types";

// ============================================================================
// 1. STAGE & VISUAL STYLE IDENTITIES (SECTIONS 4 & 5)
// ============================================================================

export type AcademyStageId =
  | "stage-1-discovering-space"
  | "stage-2-cosmic-neighborhood"
  | "stage-3-life-of-stars"
  | "stage-4-galaxies-extreme-objects"
  | "stage-5-understanding-universe"
  | "stage-6-space-scientist";

export type CinematicVisualStylePreset =
  | "stage1_cosmic_horizon" // Deep obsidian void, Cherenkov cyan scale grids, horizon atmospheric scatter
  | "stage2_planetary_albedo" // Collimated 5772K solar key light, sharp terminators, Keplerian orbital gold
  | "stage3_stellar_radiance" // Planckian blackbody emission (2400K–40000K), Balmer H-alpha / O-III nebular volumes
  | "stage4_relativistic_gravity" // Accretion disk Doppler boost, gravitational lensing distortion, NFW halo indigo
  | "stage5_cosmological_metric" // Comoving coordinate lattices, CMB 2.725K anisotropy shell, brass historical armillary
  | "stage6_instrument_telemetry"; // Cryogenic gold mirrors, Wolter grazing X-ray optics, trajectory telemetry vectors

export type CinematicCameraType =
  | "establishing_shot"
  | "planetary_orbital_shot"
  | "object_close_up"
  | "scientific_cross_section"
  | "object_following_camera"
  | "fixed_observation_camera"
  | "scale_comparison_view"
  | "deep_space_flythrough"
  | "timeline_camera"
  | "instrument_viewpoint"
  | "data_visualization_view";

export type CinematicTransitionType =
  | "smooth_orbital_travel"
  | "scale_aware_cosmic_zoom"
  | "object_to_object_slew"
  | "scientific_cross_section_peel"
  | "chronological_transformation"
  | "comparison_split_transition"
  | "observational_data_reveal";

export type CoordinateFrameType =
  | "terrestrial_horizon" // Local observer alt-az / atmospheric altitude (km)
  | "geocentric_cis_lunar" // Earth-Moon barycentric frame (10^3 - 10^6 km)
  | "heliocentric_au" // Solar System ecliptic frame (0.1 - 10^5 AU)
  | "stellar_interior_ro" // Normalized stellar radius frame (0.01 - 1000 R_sun)
  | "galactocentric_kpc" // Milky Way / Local Group frame (pc - Mpc)
  | "comoving_cosmological" // FLRW comoving grid & scale factor a(t) (Mpc - Gpc)
  | "optical_instrument_bench"; // Local meter/millimeter ray-tracing bench

export type RelativeScaleTreatment =
  | "true_physical_scale"
  | "logarithmic_compressed_scale"
  | "exaggerated_radii_for_visibility"
  | "dual_inset_true_vs_schematic"
  | "dimensionless_normalized_units";

// ============================================================================
// 2. SCIENTIFIC VISUALIZATION STANDARDS (SECTION 9)
// ============================================================================

export type ScientificRepresentationCategory =
  | "OBSERVATION_BASED" // Direct empirical catalog/mission data (Gaia, Hipparcos, Planck, EHT, JPL DE440)
  | "OBSERVED_DATA" // Direct empirical cosmology/CMB/redshift data products (Planck 2018, Pantheon+, JWST)
  | "PHYSICS_BASED_SIMULATION" // Numerical/analytical physical laws (Vis-viva, Planck blackbody, Virial, Friedmann)
  | "NUMERICAL_SCIENTIFIC_MODEL" // Coupled FLRW expansion, BBN nuclear network, or MESA stellar evolution track
  | "SCALE_ADJUSTED_EDUCATIONAL_MODEL" // Radii or time rates explicitly exaggerated for human comprehension with disclosure
  | "EDUCATIONAL_APPROXIMATION" // Idealized comoving coordinate grid or pedagogical physical schematic
  | "ARTISTIC_SCIENTIFIC_RECONSTRUCTION" // Unresolved surfaces/epochs reconstructed within physical bounds
  | "HISTORICAL_RECONSTRUCTION" // Attributed historical astronomical models and instruments (Ptolemy, Aryabhata, Copernicus, Galileo)
  | "SPECULATIVE_FUTURE_SCENARIO" // Conditional deep-time projections (Heat Death, Big Rip w < -1, Big Crunch, Proton Decay hypothesis)
  | "RECONSTRUCTED_FROM_INTERNAL_OBSERVATIONS" // Milky Way structure inferred from inside the disk via Gaia/VLBI/HI/CO
  | "FALSE_COLOR_MULTIWAVELENGTH_OVERLAY" // Composite X-ray + optical + weak-lensing overlays (e.g., Bullet Cluster)
  | "NUMERICAL_SIMULATION" // Cosmological N-body & hydrodynamic structure formation simulations (IllustrisTNG/Millennium)
  | "INFERRED_PHYSICAL_MODEL" // Dark matter halo models inferred from kinematics, lensing, and CMB
  | "OBSERVATION_AND_MODEL_COMPARISON" // Empirical observations compared against competing theoretical models
  | "MATHEMATICAL_COSMOLOGICAL_MODEL"; // FLRW metric / equation-of-state w(a) parameterization without fluid reification


export type SceneInteractivityMode =
  | "PASSIVE_EXPLANATION"
  | "GUIDED_DEMONSTRATION"
  | "INTERACTIVE_EXPLORATION"
  | "REQUIRED_LEARNING_ACTIVITY"
  | "ASSESSMENT_SUPPORT";

export type PerformanceQualityTier = "HIGH_QUALITY" | "BALANCED_QUALITY" | "LOW_POWER_QUALITY";

// ============================================================================
// 3. CAMERA, LIGHTING, ANNOTATION & ANIMATION BEAT CONTRACTS (SECTIONS 7, 8, 11)
// ============================================================================

export interface CinematicCameraActionSpec {
  cameraType: CinematicCameraType;
  coordinateFrame: CoordinateFrameType;
  targetObject: string;
  initialPosition: [number, number, number];
  targetLookAt: [number, number, number];
  fovDegrees: number;
  motionCurve: "damped_spherical" | "catmull_rom_spline" | "logarithmic_dolly" | "locked_tracking";
  dampingLambda: number; // e.g., 2.5 to 4.5 for smooth frame-rate-independent damping
  relativeScaleTreatment: RelativeScaleTreatment;
  scaleDisclosureNote?: string;
  allowStudentOrbitOverride: boolean;
}

export interface ScientificAnnotationSpec {
  annotationId: string;
  label: string;
  sublabelOrUnit?: string;
  equationLatex?: string;
  worldAnchorObject: string;
  offsetVector?: [number, number, number];
  category: "structure" | "measurement" | "vector" | "equation" | "epistemic_note";
  visibleAtLevels: LearningLevel[];
}

export interface CinematicBeatInteractionGate {
  interactivityMode: SceneInteractivityMode;
  requiresStudentActionToAdvance: boolean;
  linkedActivityId?: string;
  linkedControlSelector?: string;
  allowedStudentActions: string[];
  expectedPhysicalResponse: string;
  requiredEducationalEvidence?: string;
}

export interface CinematicAnimationBeat {
  beatId: string;
  beatNumber: number;
  title: string;
  description: string;
  narrationSegmentIds: string[]; // Exact verified segmentIds from LessonContentProvider
  normalizedStartProgress: number; // 0.0 to 1.0 within beat's narration span
  normalizedEndProgress: number;
  sceneState: Record<string, string | number | boolean>;
  targetObjects: string[];
  cameraAction: CinematicCameraActionSpec;
  objectAnimation: {
    animatedNodes: string[];
    physicsOrShaderDriver: string;
    uniformUpdates: Record<string, number | string | boolean>;
  };
  scientificAnnotations: ScientificAnnotationSpec[];
  transitionType: CinematicTransitionType;
  interactionGate: CinematicBeatInteractionGate;
  pauseBehavior: "freeze_narrative_maintain_idle_shader" | "freeze_all_simulation_time";
  resumeBehavior: "restore_cursor_and_slerp_camera" | "continue_from_current_frame";
  visualAcceptanceCriteria: string[];
}

export interface StoryboardInteractiveElementSpec {
  controlId: string;
  label: string;
  controlType: "slider" | "toggle" | "preset_selector" | "vector_scrub" | "action_trigger";
  domSelector?: string;
  parameterKey: string;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  defaultValue: number | string | boolean;
  scientificEffectDescription: string;
  cosmosHighlightable: boolean;
}

export interface StoryboardAssetRequirement {
  assetId: string;
  assetType:
    | "procedural_geometry"
    | "glsl_shader"
    | "particle_buffer"
    | "canvas_texture"
    | "gltf_model"
    | "ephemeris_catalog";
  sourceOrReusableComponent: string;
  targetMaxTriangles: number;
  targetTextureResolution: string;
  estimatedGpuMemoryMB: number;
  mobileFallbackStrategy: string;
  licenseAndAttribution: string;
}

export interface StoryboardAccessibilityFallback {
  reducedMotionBehavior: string;
  non3DExplanatoryAlternative: string;
  screenReaderAriaSummary: string;
  keyboardNavigationShortcuts: string[];
  closedCaptionAndTranscriptSync: boolean;
  levelAdaptationNotes: Record<LearningLevel, string>;
}

export interface StoryboardQualityRubricScore {
  scientificAccuracy: number; // 0..5 (Mandatory >= 4)
  educationalClarity: number; // 0..5 (Mandatory >= 4)
  visualDistinctiveness: number; // 0..5 (Mandatory >= 4)
  cinematicComposition: number; // 0..5 (Mandatory >= 4)
  cameraQuality: number; // 0..5 (Mandatory >= 4)
  animationStorytelling: number; // 0..5 (Mandatory >= 4)
  narrationSynchronization: number; // 0..5 (Mandatory >= 4)
  interactionDesign: number; // 0..5 (Mandatory >= 4)
  accessibility: number; // 0..5 (Mandatory >= 4)
  performanceFeasibility: number; // 0..5 (Mandatory >= 4)
  overallApproved: boolean;
  expertReviewRiskLevel: "low" | "moderate" | "high_requires_physics_audit";
  expertReviewNotes?: string;
}

// ============================================================================
// 4. MASTER CHAPTER STORYBOARD DATA CONTRACT (SECTION 7)
// ============================================================================

export interface ChapterStoryboard {
  storyboardId: string; // e.g., "sb-m01-lesson-1-what-is-space"
  courseId: string; // "cosmic-journey"
  courseVersion: string; // "1.0.0"
  stageId: AcademyStageId;
  moduleId: string; // "01" .. "24"
  moduleTitle: string;
  lessonId: string; // Matches sublessonId in LessonContentProvider
  sublessonId: string;
  sublessonNumber: number; // 1-based index within module
  chapterTitle: string;
  learningLevelsSupported: LearningLevel[];
  scientificRepresentation: ScientificRepresentationCategory;
  interactivityMode: SceneInteractivityMode;
  scientificObjectives: string[];
  coreScientificConcepts: string[];
  sceneId: string; // Registered scene in CosmosSceneRegistry
  existingComponentPath: string;
  visualStyle: CinematicVisualStylePreset;
  cameraPreset: CinematicCameraType;
  lightingPreset: {
    keyLightType:
      | "solar_directional_5772K"
      | "stellar_point_blackbody"
      | "nebular_emissive"
      | "cosmological_ambient"
      | "instrument_studio";
    exposure: number;
    toneMapping: "aces_filmic" | "agx" | "neutral";
    bloomThreshold: number;
    bloomStrength: number;
  };
  animationBeats: CinematicAnimationBeat[];
  narrationCueMap: Record<
    string,
    {
      segmentId: string;
      beatId: string;
      cameraType: CinematicCameraType;
      focusTarget: string;
      activeAnnotations: string[];
      simulationParameters: Record<string, string | number | boolean>;
    }
  >;
  interactiveElements: StoryboardInteractiveElementSpec[];
  requiredAssets: StoryboardAssetRequirement[];
  scientificReferences: string[];
  scientificAccuracyNotes: string[];
  performanceTier: {
    targetFpsDesktop: number;
    targetFpsMobile: number;
    maxDrawCalls: number;
    maxParticlesHigh: number;
    maxParticlesLowPower: number;
  };
  accessibilityFallback: StoryboardAccessibilityFallback;
  qualityRubric: StoryboardQualityRubricScore;
}

// ============================================================================
// 5. PROMPT 03 PREPARATION: FULLSCREEN CINEMATIC PLAYER INTERFACES (SECTION 21)
// ============================================================================

export type FullscreenViewportMode =
  "inline_embedded" | "native_browser_fullscreen" | "css_fixed_viewport_fallback";

export type CinematicPlaybackPhase =
  | "IDLE"
  | "LOADING_SCENE"
  | "NARRATING_CINEMATIC"
  | "PAUSED_BY_STUDENT"
  | "STUDENT_CAMERA_FREE_LOOK"
  | "INTERRUPTED_FOR_QUESTION"
  | "ANSWERING_QUESTION_OVERLAY"
  | "INTERACTIVE_ACTIVITY_GATE"
  | "ASSESSMENT_GATE"
  | "TRANSITIONING_CHAPTER"
  | "REDUCED_MOTION_FALLBACK"
  | "WEBGL_RECOVERY_FALLBACK";

export interface CosmosCinematicPlayerState {
  isOpen: boolean;
  viewportMode: FullscreenViewportMode;
  playbackPhase: CinematicPlaybackPhase;
  directorState: GuidedLearningState;
  activeModuleId: string;
  activeSublessonId: string;
  activeStoryboardId: string;
  activeBeatId: string;
  activeSegment: NarrationSegment | null;
  segmentNormalizedProgress: number; // 0.0 to 1.0 continuous interpolation factor
  learningLevel: LearningLevel;
  language: CosmosLanguage;
  qualityTier: PerformanceQualityTier;
  isUserOrbitingCamera: boolean;
  captionsVisible: boolean;
  scientificAnnotationsVisible: boolean;
  epistemicBadgeVisible: boolean;
  questionDrawerOpen: boolean;
  activityOverlayExpanded: boolean;
  currentFps: number;
}

export interface CosmosCinematicSceneLoaderInterface {
  preloadChapterScene: (moduleId: string, sublessonId: string) => Promise<void>;
  mountChapterScene: (storyboard: ChapterStoryboard) => void;
  applyAnimationBeat: (
    beat: CinematicAnimationBeat,
    normalizedProgress: number,
    qualityTier: PerformanceQualityTier,
  ) => void;
  disposeInactiveResources: () => void;
}

export interface CosmosNarrationSyncInterface {
  onSegmentStarted: (segment: NarrationSegment, beat: CinematicAnimationBeat) => void;
  onSegmentProgressTick: (
    segmentId: string,
    elapsedSeconds: number,
    estimatedDurationSeconds: number,
    normalizedProgress: number,
  ) => void;
  onNarrationPaused: (cursorSegmentId: string, elapsedSeconds: number) => void;
  onNarrationResumed: (cursorSegmentId: string, elapsedSeconds: number) => void;
  onSeekToSegment: (targetSegmentId: string) => void;
  onStudentQuestionInterrupted: (interruptedSegment: NarrationSegment | null) => void;
  onCosmosAnswerReceived: (
    answerText: string,
    visualizationAction?: CosmosVisualizationReference,
  ) => void;
}

// ============================================================================
// 6. RUNTIME VALIDATION FOR STORYBOARD MANIFESTS (SECTIONS 7 & 19)
// ============================================================================

export interface StoryboardValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  totalBeats: number;
  mappedSegmentCount: number;
}

export function validateChapterStoryboard(
  storyboard: ChapterStoryboard,
  validModuleSegmentIds?: Set<string>,
): StoryboardValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!storyboard.storyboardId || !storyboard.moduleId || !storyboard.sublessonId) {
    errors.push("Missing required storyboardId, moduleId, or sublessonId.");
  }

  if (storyboard.animationBeats.length === 0) {
    errors.push(`Storyboard ${storyboard.storyboardId} has zero animationBeats.`);
  }

  const mappedSegments = new Set<string>();
  for (const beat of storyboard.animationBeats) {
    if (!beat.beatId) {
      errors.push(`Storyboard ${storyboard.storyboardId} contains a beat without beatId.`);
    }
    if (beat.narrationSegmentIds.length === 0) {
      warnings.push(
        `Beat ${beat.beatId} in ${storyboard.storyboardId} has no narrationSegmentIds.`,
      );
    }
    for (const segId of beat.narrationSegmentIds) {
      mappedSegments.add(segId);
      if (validModuleSegmentIds && !validModuleSegmentIds.has(segId)) {
        errors.push(
          `Beat ${beat.beatId} in ${storyboard.storyboardId} references unknown narration segmentId "${segId}".`,
        );
      }
    }
  }

  for (const cueKey of Object.keys(storyboard.narrationCueMap)) {
    const cue = storyboard.narrationCueMap[cueKey];
    if (validModuleSegmentIds && !validModuleSegmentIds.has(cue.segmentId)) {
      errors.push(
        `narrationCueMap in ${storyboard.storyboardId} references unknown segmentId "${cue.segmentId}".`,
      );
    }
  }

  const r = storyboard.qualityRubric;
  const mandatoryScores = [
    r.scientificAccuracy,
    r.educationalClarity,
    r.visualDistinctiveness,
    r.cinematicComposition,
    r.cameraQuality,
    r.animationStorytelling,
    r.narrationSynchronization,
    r.interactionDesign,
    r.accessibility,
    r.performanceFeasibility,
  ];
  if (mandatoryScores.some((score) => score < 4)) {
    errors.push(
      `Storyboard ${storyboard.storyboardId} failed mandatory >= 4/5 quality gate in one or more rubric dimensions.`,
    );
  }

  if (storyboard.scientificReferences.length === 0) {
    errors.push(`Storyboard ${storyboard.storyboardId} has no documented scientificReferences.`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    totalBeats: storyboard.animationBeats.length,
    mappedSegmentCount: mappedSegments.size,
  };
}
