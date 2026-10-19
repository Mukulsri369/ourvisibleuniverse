/**
 * COSMOS Animation Cue Controller & Dual-Time Policy Engine
 * Project: Our Visible Universe Academy
 * Scope: Prompt 03 — Sections 8 & 9 (Cue Events & Dual Time Systems)
 *
 * Implements the 9 deterministic cue lifecycle events:
 * START, PAUSE, RESUME, SEEK, REPLAY, COMPLETE, INTERRUPT, CANCEL, RESTORE
 *
 * Enforces the distinction between:
 * A. Narration Playback Time (segment progression & speech progress)
 * B. Scientific Simulation Time (physics integration & orbital motion)
 */

import type { LearningLevel } from "@/lib/academy/types";
import type { CosmosLanguage } from "../cosmos-types";
import { VisualizationActionController } from "../VisualizationActionController";
import { Cosmos3DAdapter } from "../Cosmos3DAdapter";
import {
  CosmosAnimationCueRegistry,
  type RegisteredAnimationCue,
} from "./CosmosAnimationCueRegistry";
import type { CinematicCameraCommand, CinematicTimePolicy } from "./CosmosCinematicPlayerState";
import { CosmosCinematicSceneRegistry } from "./CosmosCinematicSceneRegistry";

export type AnimationCueEventType =
  | "START"
  | "PAUSE"
  | "RESUME"
  | "SEEK"
  | "REPLAY"
  | "COMPLETE"
  | "INTERRUPT"
  | "CANCEL"
  | "RESTORE";

export interface AnimationCueExecutionState {
  activeCue: RegisteredAnimationCue | null;
  lastEventType: AnimationCueEventType;
  narrationPaused: boolean;
  interruptedForQuestion: boolean;
  waitingForStudentInput: boolean;
  isSimulationRunning: boolean;
  simulationTimeScale: number;
  normalizedCueProgress: number; // [0, 1]
  lastCameraCommand: CinematicCameraCommand | null;
  preservedCueBeforeInterruption: RegisteredAnimationCue | null;
}

type CueSubscriber = (state: AnimationCueExecutionState) => void;

export class CosmosAnimationCueController {
  private static instance: CosmosAnimationCueController | null = null;
  private state: AnimationCueExecutionState;
  private subscribers = new Set<CueSubscriber>();

  private constructor() {
    this.state = {
      activeCue: null,
      lastEventType: "START",
      narrationPaused: false,
      interruptedForQuestion: false,
      waitingForStudentInput: false,
      isSimulationRunning: true,
      simulationTimeScale: 1.0,
      normalizedCueProgress: 0,
      lastCameraCommand: null,
      preservedCueBeforeInterruption: null,
    };
  }

  public static getInstance(): CosmosAnimationCueController {
    if (!this.instance) {
      this.instance = new CosmosAnimationCueController();
    }
    return this.instance;
  }

  public getState(): AnimationCueExecutionState {
    return {
      ...this.state,
      activeCue: this.state.activeCue ? { ...this.state.activeCue } : null,
      lastCameraCommand: this.state.lastCameraCommand ? { ...this.state.lastCameraCommand } : null,
      preservedCueBeforeInterruption: this.state.preservedCueBeforeInterruption
        ? { ...this.state.preservedCueBeforeInterruption }
        : null,
    };
  }

  /**
   * Resolves whether the scientific simulation clock should run given the active
   * cue's timePolicy and the current narration/interruption state (Prompt 03 Section 9).
   */
  public computeSimulationExecution(
    policy: CinematicTimePolicy,
    narrationPaused: boolean,
    interrupted: boolean,
    waitingForStudent: boolean,
    baseTimeScale = 1.0,
  ): { isSimulationRunning: boolean; simulationTimeScale: number } {
    if (waitingForStudent || policy === "WAIT_FOR_STUDENT") {
      // Simulation stays alive in interactive mode so student can manipulate controls
      return { isSimulationRunning: true, simulationTimeScale: baseTimeScale };
    }

    if (policy === "MANUAL_INTERACTION") {
      return { isSimulationRunning: true, simulationTimeScale: baseTimeScale };
    }

    if (policy === "FIXED_DEMONSTRATION") {
      return { isSimulationRunning: false, simulationTimeScale: 0 };
    }

    if (policy === "SIMULATION_CONTINUOUS") {
      // Orbits, pulsars, and accretion disks continue smoothly at reduced cadence when paused/interrupted
      return {
        isSimulationRunning: true,
        simulationTimeScale: narrationPaused || interrupted ? baseTimeScale * 0.35 : baseTimeScale,
      };
    }

    if (policy === "PAUSE_ON_NARRATION_PAUSE" || policy === "FOLLOW_NARRATION") {
      if (narrationPaused || interrupted) {
        return { isSimulationRunning: false, simulationTimeScale: 0 };
      }
      return { isSimulationRunning: true, simulationTimeScale: baseTimeScale };
    }

    return { isSimulationRunning: !narrationPaused, simulationTimeScale: baseTimeScale };
  }

  /**
   * Dispatches one of the 9 lifecycle events on the cue engine.
   */
  public dispatchCueEvent(
    eventType: AnimationCueEventType,
    params: {
      moduleId?: string;
      narrationSegmentId?: string;
      sublessonId?: string;
      level?: LearningLevel;
      language?: CosmosLanguage;
      normalizedProgress?: number;
    } = {},
  ): AnimationCueExecutionState {
    const moduleId = params.moduleId || this.state.activeCue?.moduleId || "01";
    const level = params.level || "explorer";
    const language = params.language || "en";

    switch (eventType) {
      case "START":
      case "SEEK": {
        let nextCue: RegisteredAnimationCue | null = null;
        if (params.narrationSegmentId) {
          nextCue = CosmosAnimationCueRegistry.getCueBySegmentId(
            moduleId,
            params.narrationSegmentId,
            level,
            language,
          );
        } else if (params.sublessonId) {
          nextCue = CosmosAnimationCueRegistry.getFirstCueForSublesson(
            moduleId,
            params.sublessonId,
            level,
            language,
          );
        } else {
          const all = CosmosAnimationCueRegistry.getCuesForModule(moduleId, level, language);
          nextCue = all[0] || null;
        }

        if (nextCue) {
          const simExec = this.computeSimulationExecution(
            nextCue.timePolicy,
            false,
            false,
            nextCue.timePolicy === "WAIT_FOR_STUDENT",
            nextCue.simulationTimeScale,
          );

          const cameraCmd: CinematicCameraCommand = {
            action: eventType === "SEEK" ? "SEEK_CAMERA_TRANSITION" : nextCue.cameraAction,
            targetObjectId: nextCue.highlightedObjects[0],
            targetPosition: nextCue.cameraTarget,
            cameraPosition: nextCue.cameraPosition,
            cameraPresetId: nextCue.cameraPresetId,
            cameraArchetype: nextCue.cameraArchetype,
            progress: params.normalizedProgress ?? 0,
            durationMs: eventType === "SEEK" ? 450 : 1200,
            timestamp: Date.now(),
          };

          this.state = {
            ...this.state,
            activeCue: nextCue,
            lastEventType: eventType,
            narrationPaused: false,
            interruptedForQuestion: false,
            waitingForStudentInput: nextCue.timePolicy === "WAIT_FOR_STUDENT",
            isSimulationRunning: simExec.isSimulationRunning,
            simulationTimeScale: simExec.simulationTimeScale,
            normalizedCueProgress: params.normalizedProgress ?? 0,
            lastCameraCommand: cameraCmd,
          };

          this.broadcastToSceneAdapters(nextCue);
        }
        break;
      }

      case "PAUSE": {
        const cue = this.state.activeCue;
        const policy = cue?.timePolicy || "FOLLOW_NARRATION";
        const simExec = this.computeSimulationExecution(
          policy,
          true,
          this.state.interruptedForQuestion,
          this.state.waitingForStudentInput,
          cue?.simulationTimeScale ?? 1.0,
        );

        this.state = {
          ...this.state,
          lastEventType: "PAUSE",
          narrationPaused: true,
          isSimulationRunning: simExec.isSimulationRunning,
          simulationTimeScale: simExec.simulationTimeScale,
          lastCameraCommand: {
            action: "PAUSE_CAMERA_MOVEMENT",
            timestamp: Date.now(),
          },
        };

        if (!simExec.isSimulationRunning) {
          Cosmos3DAdapter.getInstance().pauseSimulation();
        }
        break;
      }

      case "RESUME": {
        const cue = this.state.activeCue;
        const policy = cue?.timePolicy || "FOLLOW_NARRATION";
        const simExec = this.computeSimulationExecution(
          policy,
          false,
          false,
          this.state.waitingForStudentInput,
          cue?.simulationTimeScale ?? 1.0,
        );

        this.state = {
          ...this.state,
          lastEventType: "RESUME",
          narrationPaused: false,
          interruptedForQuestion: false,
          isSimulationRunning: simExec.isSimulationRunning,
          simulationTimeScale: simExec.simulationTimeScale,
          lastCameraCommand: cue
            ? {
                action: cue.cameraAction,
                targetObjectId: cue.highlightedObjects[0],
                targetPosition: cue.cameraTarget,
                cameraPosition: cue.cameraPosition,
                cameraPresetId: cue.cameraPresetId,
                cameraArchetype: cue.cameraArchetype,
                durationMs: 900,
                timestamp: Date.now(),
              }
            : this.state.lastCameraCommand,
        };

        if (simExec.isSimulationRunning) {
          Cosmos3DAdapter.getInstance().resumeSimulation();
        }
        break;
      }

      case "REPLAY": {
        const cue = this.state.activeCue;
        if (cue) {
          const simExec = this.computeSimulationExecution(
            cue.timePolicy,
            false,
            false,
            false,
            cue.simulationTimeScale,
          );
          this.state = {
            ...this.state,
            lastEventType: "REPLAY",
            narrationPaused: false,
            interruptedForQuestion: false,
            normalizedCueProgress: 0,
            isSimulationRunning: simExec.isSimulationRunning,
            simulationTimeScale: simExec.simulationTimeScale,
            lastCameraCommand: {
              action: cue.cameraAction,
              targetObjectId: cue.highlightedObjects[0],
              targetPosition: cue.cameraTarget,
              cameraPosition: cue.cameraPosition,
              cameraPresetId: cue.cameraPresetId,
              cameraArchetype: cue.cameraArchetype,
              progress: 0,
              durationMs: 800,
              timestamp: Date.now(),
            },
          };
          this.broadcastToSceneAdapters(cue);
        }
        break;
      }

      case "INTERRUPT": {
        const cue = this.state.activeCue;
        const policy = cue?.timePolicy || "FOLLOW_NARRATION";
        const simExec = this.computeSimulationExecution(
          policy,
          true,
          true,
          this.state.waitingForStudentInput,
          cue?.simulationTimeScale ?? 1.0,
        );

        this.state = {
          ...this.state,
          lastEventType: "INTERRUPT",
          narrationPaused: true,
          interruptedForQuestion: true,
          preservedCueBeforeInterruption: cue ? { ...cue } : null,
          isSimulationRunning: simExec.isSimulationRunning,
          simulationTimeScale: simExec.simulationTimeScale,
          lastCameraCommand: {
            action: "PAUSE_CAMERA_MOVEMENT",
            timestamp: Date.now(),
          },
        };
        break;
      }

      case "RESTORE": {
        const restoredCue = this.state.preservedCueBeforeInterruption || this.state.activeCue;
        if (restoredCue) {
          const simExec = this.computeSimulationExecution(
            restoredCue.timePolicy,
            false,
            false,
            restoredCue.timePolicy === "WAIT_FOR_STUDENT",
            restoredCue.simulationTimeScale,
          );
          this.state = {
            ...this.state,
            activeCue: restoredCue,
            lastEventType: "RESTORE",
            narrationPaused: false,
            interruptedForQuestion: false,
            preservedCueBeforeInterruption: null,
            isSimulationRunning: simExec.isSimulationRunning,
            simulationTimeScale: simExec.simulationTimeScale,
            lastCameraCommand: {
              action: "RESTORE_CAMERA",
              targetObjectId: restoredCue.highlightedObjects[0],
              targetPosition: restoredCue.cameraTarget,
              cameraPosition: restoredCue.cameraPosition,
              cameraPresetId: restoredCue.cameraPresetId,
              cameraArchetype: restoredCue.cameraArchetype,
              durationMs: 750,
              timestamp: Date.now(),
            },
          };
          this.broadcastToSceneAdapters(restoredCue);
        }
        break;
      }

      case "COMPLETE": {
        this.state = {
          ...this.state,
          lastEventType: "COMPLETE",
          normalizedCueProgress: 1,
        };
        break;
      }

      case "CANCEL": {
        this.state = {
          ...this.state,
          lastEventType: "CANCEL",
          narrationPaused: true,
          interruptedForQuestion: false,
        };
        break;
      }
    }

    this.notify();
    return this.getState();
  }

  /**
   * Dispatches synchronized actions to VisualizationActionController and Cosmos3DAdapter
   * so existing module 3D components also respond seamlessly.
   */
  private broadcastToSceneAdapters(cue: RegisteredAnimationCue): void {
    const sceneDesc = CosmosCinematicSceneRegistry.getSceneForModule(cue.moduleId);
    const adapter = Cosmos3DAdapter.getInstance();
    adapter.setActiveScene(sceneDesc.adapterSceneId);

    if (cue.highlightedObjects.length > 0) {
      adapter.highlightScientificObject(cue.highlightedObjects[0], "ring", 4000);
    }

    VisualizationActionController.dispatchAction({
      sceneId: sceneDesc.adapterSceneId,
      targetObject: cue.highlightedObjects[0],
      cameraAction: "focus",
      parameters: {
        cameraPreset: cue.cameraPresetId,
        scaleLevel: cue.layerOrPresetIndex,
      },
    });
  }

  public subscribe(listener: CueSubscriber): () => void {
    this.subscribers.add(listener);
    listener(this.getState());
    return () => {
      this.subscribers.delete(listener);
    };
  }

  private notify(): void {
    const snap = this.getState();
    for (const sub of this.subscribers) {
      try {
        sub(snap);
      } catch (err) {
        console.warn("[CosmosAnimationCueController] subscriber error:", err);
      }
    }
  }
}
