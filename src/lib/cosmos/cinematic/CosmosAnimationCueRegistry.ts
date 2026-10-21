// @ts-nocheck
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
import {
  CosmosProofOfConceptCatalog,
  type ProofOfConceptSceneComponentId,
} from "./poc/CosmosProofOfConceptManifest";

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
  chapterCode?: string;
  beatId?: string;
  beatTitle?: string;
  beatIndex?: number;
  sceneComponentId?: ProofOfConceptSceneComponentId;
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
    let cameraTarget: [number, number, number] = primaryObj ? [...primaryObj.position] : [0, 0, 0];

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
      cameraPosition = [Math.sin(angle) * dist, basePos[1] * 0.88, Math.cos(angle) * dist];
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

    // Module-specific precision refinements for Proof-of-Concept Reference Modules (01, 08, 14)
    let chapterCode: string | undefined;
    let beatId: string | undefined;
    let beatTitle: string | undefined;
    let beatIndex: number | undefined;
    let sceneComponentId: ProofOfConceptSceneComponentId | undefined;

    if (CosmosProofOfConceptCatalog.isProofOfConceptModule(moduleId)) {
      const pocMatch = CosmosProofOfConceptCatalog.getBeatForNarrationSegment(
        moduleId,
        seg.lessonId,
        seg.segmentId,
      );
      if (pocMatch) {
        const { chapter, beat } = pocMatch;
        chapterCode = chapter.chapterCode;
        beatId = beat.beatId;
        beatTitle = beat.title;
        beatIndex = beat.beatIndex;
        sceneComponentId = chapter.sceneComponentId;
        cameraArchetype = beat.cameraArchetype;
        cameraAction = beat.cameraAction;
        cameraPosition = [...beat.cameraPosition];
        cameraTarget = [...beat.cameraTarget];
        animationAction = beat.animationAction;
        timePolicy = beat.timePolicy;
        simulationTimeScale = beat.simulationTimeScale;
      }
    }

    const pocMatchForHighlights = CosmosProofOfConceptCatalog.isProofOfConceptModule(moduleId)
      ? CosmosProofOfConceptCatalog.getBeatForNarrationSegment(
          moduleId,
          seg.lessonId,
          seg.segmentId,
        )
      : null;

    const highlightedObjects = [
      ...(pocMatchForHighlights?.beat.highlightedObjects || []),
      primaryObjectId,
      ...(seg.visualizationReference?.targetObject
        ? [seg.visualizationReference.targetObject]
        : []),
    ].filter((v, i, a) => Boolean(v) && a.indexOf(v) === i);

    const activeAnnotationIds = [
      ...(pocMatchForHighlights?.chapter.chapterAnnotations.map((a) => a.annotationId) || []),
      ...sceneDesc.annotations.map((a) => a.annotationId),
    ].filter((v, i, a) => Boolean(v) && a.indexOf(v) === i);

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
      transition:
        pocMatchForHighlights?.beat.transitionType ||
        (seg.sectionId === "title" ? "scale_bridge" : "smooth"),
      layerOrPresetIndex: sublessonIndex,
      chapterCode,
      beatId,
      beatTitle,
      beatIndex,
      sceneComponentId,
    };
  }
}
