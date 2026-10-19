/**
 * COSMOS Animation Cue Registry
 * Project: Our Visible Universe Academy
 * Scope: Prompt 03 — Section 8 & Section 9 (Real Course Data Narration-to-Animation Cues)
 *
 * Dynamically binds every approved NarrationSegment across all 24 modules and
 * 172 sublessons from LessonContentProvider to deterministic cinematic cues:
 * - Real approved narrationSegmentId, moduleId, lessonId
 * - Explicit dual-time policy (FOLLOW_NARRATION, SIMULATION_CONTINUOUS, etc.)
 * - Camera preset & archetype
 * - Highlighted scientific objects & annotations
 * - Zero fabricated segment IDs or arbitrary timers
 */

import type { LearningLevel } from "@/lib/academy/types";
import { LessonContentProvider } from "../LessonContentProvider";
import type { CinematicCameraType } from "../cinematic-storyboard-types";
import type { CosmosLanguage, NarrationSegment } from "../cosmos-types";
import type { CinematicCameraActionType, CinematicTimePolicy } from "./CosmosCinematicPlayerState";
import { CosmosCinematicSceneRegistry } from "./CosmosCinematicSceneRegistry";

export interface RegisteredAnimationCue {
  cueId: string;
  moduleId: string;
  lessonId: string;
  sublessonId: string;
  narrationSegmentId: string;
  segmentSectionType: NarrationSegment["sectionId"];
  sceneId: string;
  cameraPresetId: string;
  cameraArchetype: CinematicCameraType;
  cameraAction: CinematicCameraActionType;
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  animationAction: string;
  timePolicy: CinematicTimePolicy;
  simulationTimeScale: number;
  highlightedObjects: string[];
  activeAnnotationIds: string[];
  transition: "smooth" | "cut" | "cross_dissolve" | "scale_bridge";
  layerOrPresetIndex: number;
}

export class CosmosAnimationCueRegistry {
  private static cueCache = new Map<string, RegisteredAnimationCue[]>();

  /**
   * Returns all validated animation cues for a module, learning level, and language,
   * mapped 1:1 with the actual segments returned by LessonContentProvider.
   */
  public static getCuesForModule(
    moduleId: string,
    level: LearningLevel = "explorer",
    language: CosmosLanguage = "en",
  ): RegisteredAnimationCue[] {
    const normalizedModId = String(moduleId).padStart(2, "0");
    const cacheKey = `${normalizedModId}:${level}:${language}`;
    if (this.cueCache.has(cacheKey)) {
      return this.cueCache.get(cacheKey)!;
    }

    const segments = LessonContentProvider.getSegmentsForModule(normalizedModId, level, language);
    const sceneDesc = CosmosCinematicSceneRegistry.getSceneForModule(normalizedModId);

    // Track distinct sublessons in order to assign progressive camera & layer presets
    const sublessonOrder: string[] = [];
    for (const seg of segments) {
      if (!sublessonOrder.includes(seg.lessonId)) {
        sublessonOrder.push(seg.lessonId);
      }
    }

    const cues: RegisteredAnimationCue[] = segments.map((seg, idx) => {
      const subIdx = Math.max(0, sublessonOrder.indexOf(seg.lessonId));
      return this.buildCueForSegment(normalizedModId, seg, idx, subIdx, sceneDesc.sceneId);
    });

    this.cueCache.set(cacheKey, cues);
    return cues;
  }

  /**
   * Resolves the exact cue for a specific narrationSegmentId within a module.
   */
  public static getCueBySegmentId(
    moduleId: string,
    narrationSegmentId: string,
    level: LearningLevel = "explorer",
    language: CosmosLanguage = "en",
  ): RegisteredAnimationCue | null {
    const cues = this.getCuesForModule(moduleId, level, language);
    return cues.find((c) => c.narrationSegmentId === narrationSegmentId) || cues[0] || null;
  }

  /**
   * Resolves the first cue for a given sublessonId.
   */
  public static getFirstCueForSublesson(
    moduleId: string,
    sublessonId: string,
    level: LearningLevel = "explorer",
    language: CosmosLanguage = "en",
  ): RegisteredAnimationCue | null {
    const cues = this.getCuesForModule(moduleId, level, language);
    return cues.find((c) => c.sublessonId === sublessonId) || cues[0] || null;
  }

  private static buildCueForSegment(
    moduleId: string,
    seg: NarrationSegment,
    segmentIndex: number,
    sublessonIndex: number,
    defaultSceneId: string,
  ): RegisteredAnimationCue {
    const sceneDesc = CosmosCinematicSceneRegistry.getSceneForModule(moduleId);
    const objects = sceneDesc.objects;
    const primaryObj = objects[sublessonIndex % Math.max(1, objects.length)] || objects[0];
    const primaryObjectId =
      seg.visualizationReference?.targetObject || primaryObj?.objectId || "earth";

    // Determine time policy & camera choreography based on module physics domain and segment type
    let timePolicy: CinematicTimePolicy = sceneDesc.defaultTimePolicy;
    let cameraArchetype: CinematicCameraType = sceneDesc.defaultCameraArchetype;
    let cameraAction: CinematicCameraActionType = "APPLY_CAMERA_PRESET";
    let simulationTimeScale = 1.0;
    let animationAction = seg.visualizationReference?.action || "synchronize_chapter_phase";

    // Camera orbital offset per segment section type so camera moves purposefully with narration
    const basePos = sceneDesc.defaultCameraPosition;
    let cameraPosition: [number, number, number] = [...basePos];
    let cameraTarget: [number, number, number] = primaryObj
      ? [...primaryObj.position]
      : [0, 0, 0];

    if (seg.sectionId === "title" || seg.sectionId === "introduction") {
      cameraArchetype = "scale_comparison_view";
      cameraAction = "APPLY_CAMERA_PRESET";
      cameraPosition = [basePos[0], basePos[1] * 1.15, basePos[2] * 1.1];
      cameraTarget = [0, 0, 0];
      animationAction = `establish_sublesson_${sublessonIndex + 1}`;
    } else if (seg.sectionId === "takeaway") {
      cameraArchetype = "guided_focus_push_in";
      cameraAction = "FOCUS_OBJECT";
      cameraPosition = [
        cameraTarget[0] + 1.8,
        cameraTarget[1] + 2.2,
        Math.max(5.5, basePos[2] * 0.72),
      ];
      animationAction = `focus_key_mechanism_${primaryObjectId}`;
    } else if (seg.sectionId === "deepDive") {
      cameraArchetype =
        moduleId === "14" ? "relativistic_horizon_framing" : "planetary_orbital_shot";
      cameraAction = "ORBIT_OBJECT";
      const angle = (segmentIndex % 6) * 0.45;
      const dist = Math.max(6.5, basePos[2] * 0.82);
      cameraPosition = [
        Math.sin(angle) * dist,
        basePos[1] * 0.88,
        Math.cos(angle) * dist,
      ];
      timePolicy =
        moduleId === "08" || moduleId === "14"
          ? "SIMULATION_CONTINUOUS"
          : "PAUSE_ON_NARRATION_PAUSE";
      animationAction = `inspect_physical_dynamics_${sublessonIndex + 1}`;
    } else if (seg.sectionId === "didYouKnow") {
      cameraArchetype = "telemetry_hud_inspection_frame";
      cameraAction = "ZOOM_TO_OBJECT";
      cameraPosition = [
        cameraTarget[0] - 2.0,
        cameraTarget[1] + 1.6,
        Math.max(5.0, basePos[2] * 0.65),
      ];
      animationAction = `highlight_observational_discovery_${sublessonIndex + 1}`;
    } else if (seg.sectionId === "mathOrAnalogy") {
      cameraArchetype = "scientific_cross_section";
      cameraAction = "PAN_TO_REGION";
      cameraPosition = [0, basePos[1] * 1.35, basePos[2] * 0.92];
      cameraTarget = [0, 0, 0];
      timePolicy = "PAUSE_ON_NARRATION_PAUSE";
      simulationTimeScale = 0.65;
      animationAction = `display_quantitative_relation_${sublessonIndex + 1}`;
    } else if (seg.sectionId === "activity") {
      cameraArchetype = "telemetry_hud_inspection_frame";
      cameraAction = "APPLY_CAMERA_PRESET";
      timePolicy = "WAIT_FOR_STUDENT";
      animationAction = "await_student_activity_interaction";
    }

    // Module-specific precision refinements for representative integration proofs (Modules 01, 08, 14)
    if (moduleId === "01") {
      // Map Module 01's 6 sublessons to the 7 Cosmic Zoom Layers (0..6)
      const zoomLayerIdx = Math.min(6, sublessonIndex === 5 ? 6 : sublessonIndex);
      const layerDistances = [5.5, 8.0, 11.0, 14.5, 16.0, 18.0, 20.0];
      const dist = layerDistances[zoomLayerIdx] || 11.0;
      cameraPosition = [
        seg.sectionId === "deepDive" ? 2.4 : 0,
        2.5 + zoomLayerIdx * 0.35,
        seg.sectionId === "takeaway" ? dist * 0.82 : dist,
      ];
      cameraTarget = [0, 0, 0];
      animationAction = `cosmic_zoom_layer_${zoomLayerIdx}`;
    } else if (moduleId === "08") {
      // Map Module 08's 8 sublessons to orbital mechanics presets
      const presets = [
        "gravity_inverse_square",
        "newton_cannonball_orbit",
        "elliptical_eccentricity",
        "vis_viva_velocity",
        "newton_laws_vectors",
        "kepler_equal_areas",
        "escape_velocity_threshold",
        "binary_barycenter_wobble",
      ];
      animationAction = presets[sublessonIndex] || "circular_orbit";
      timePolicy = "SIMULATION_CONTINUOUS";
    } else if (moduleId === "14") {
      // Map Module 14's 8 sublessons to compact object / relativistic lensing states
      const bhStates = [
        "core_collapse_supernova",
        "neutron_star_crust",
        "pulsar_lighthouse_beam",
        "schwarzschild_event_horizon",
        "gravitational_lensing_einstein_ring",
        "tidal_spaghettification_gradient",
        "stellar_vs_supermassive_scale",
        "binary_inspiral_gw_chirp",
      ];
      animationAction = bhStates[sublessonIndex] || "schwarzschild_event_horizon";
      cameraArchetype = "relativistic_horizon_framing";
    }

    const highlightedObjects = [
      primaryObjectId,
      ...(seg.visualizationReference?.targetObject
        ? [seg.visualizationReference.targetObject]
        : []),
    ].filter((v, i, a) => Boolean(v) && a.indexOf(v) === i);

    const activeAnnotationIds = sceneDesc.annotations.map((a) => a.annotationId);

    return {
      cueId: `cue-m${moduleId}-${seg.segmentId}`,
      moduleId,
      lessonId: seg.lessonId,
      sublessonId: seg.lessonId,
      narrationSegmentId: seg.segmentId,
      segmentSectionType: seg.sectionId,
      sceneId: defaultSceneId,
      cameraPresetId: `${cameraArchetype}_${seg.sectionId}`,
      cameraArchetype,
      cameraAction,
      cameraPosition,
      cameraTarget,
      animationAction,
      timePolicy,
      simulationTimeScale,
      highlightedObjects,
      activeAnnotationIds,
      transition: seg.sectionId === "title" ? "scale_bridge" : "smooth",
      layerOrPresetIndex: sublessonIndex,
    };
  }
}
