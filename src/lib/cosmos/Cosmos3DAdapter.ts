/**
 * COSMOS 3D Visualization Adapter
 * Project: Our Visible Universe Academy
 * Scope: Prompt 15 Context-Aware 3D AI Teaching
 *
 * Implements safe, non-invasive adapters around existing Three.js / React Three Fiber
 * rendering architectures. Does NOT recreate duplicate scenes or rebuild particle systems.
 * Provides camera safety, smooth interpolation, student control respect, and view restoration.
 */

import {
  type ApprovedDemonstrationId,
  type ApprovedSceneId,
  type CameraViewSnapshot,
  type CelestialObjectInfo,
  type SimulationStateInfo,
} from "./cosmos-types";
import { VisualizationActionController } from "./VisualizationActionController";

export interface SceneCapabilityHandler {
  sceneId: ApprovedSceneId;
  getCurrentSimulationState: () => SimulationStateInfo;
  getSelectedObject: () => CelestialObjectInfo | null;
  focusObject: (targetName: string, durationMs?: number) => boolean;
  highlightObject: (targetName: string, highlightType?: string, durationMs?: number) => boolean;
  playDemonstration: (demonstrationId: ApprovedDemonstrationId, params?: Record<string, any>) => boolean;
  pauseSimulation: () => boolean;
  resumeSimulation: () => boolean;
  getCurrentCameraSnapshot?: () => CameraViewSnapshot | null;
  restoreCameraSnapshot?: (snapshot: CameraViewSnapshot) => boolean;
}

export class Cosmos3DAdapter {
  private static instance: Cosmos3DAdapter | null = null;
  private sceneHandlers = new Map<string, SceneCapabilityHandler>();
  private activeSceneId: ApprovedSceneId = "solar_system";
  private previousViewStack: CameraViewSnapshot[] = [];
  private isUserInteractingWithCamera = false;
  private currentHighlightedObject: { name: string; expiresAt: number } | null = null;
  private listeners = new Set<() => void>();

  private constructor() {
    // Listen to global visualization actions
    VisualizationActionController.registerHandler("*", (action) => {
      if (action.sceneId && this.isValidSceneId(action.sceneId)) {
        this.activeSceneId = action.sceneId as ApprovedSceneId;
        this.notifyListeners();
      }
    });
  }

  public static getInstance(): Cosmos3DAdapter {
    if (!this.instance) {
      this.instance = new Cosmos3DAdapter();
    }
    return this.instance;
  }

  public addListener(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      try {
        listener();
      } catch (err) {
        console.warn("Cosmos3DAdapter listener error:", err);
      }
    }
  }

  public registerScene(handler: SceneCapabilityHandler): () => void {
    this.sceneHandlers.set(handler.sceneId, handler);
    this.notifyListeners();
    return () => {
      if (this.sceneHandlers.get(handler.sceneId) === handler) {
        this.sceneHandlers.delete(handler.sceneId);
        this.notifyListeners();
      }
    };
  }

  public setActiveScene(sceneId: ApprovedSceneId): void {
    this.activeSceneId = sceneId;
    this.notifyListeners();
  }

  public getActiveSceneId(): ApprovedSceneId {
    return this.activeSceneId;
  }

  public isValidSceneId(sceneId: string): sceneId is ApprovedSceneId {
    const valid: ApprovedSceneId[] = [
      "solar_system",
      "black_hole_lensing",
      "orbital_mechanics",
      "cosmic_scale",
      "stellar_evolution",
      "galaxy_assembly",
      "cosmic_expansion",
      "universe",
    ];
    return valid.includes(sceneId as ApprovedSceneId);
  }

  /**
   * Tracks whether the student is manually orbiting/dragging the camera.
   * Invariant: COSMOS must NOT fight the student's manual camera movement.
   */
  public setUserControllingCamera(isControlling: boolean): void {
    this.isUserInteractingWithCamera = isControlling;
    this.notifyListeners();
  }

  public isUserControllingCamera(): boolean {
    return this.isUserInteractingWithCamera;
  }

  /**
   * Captures current camera state and pushes to previous view stack.
   */
  public pushCurrentView(targetName?: string): void {
    const handler = this.sceneHandlers.get(this.activeSceneId);
    let snapshot: CameraViewSnapshot | null = null;

    if (handler?.getCurrentCameraSnapshot) {
      snapshot = handler.getCurrentCameraSnapshot();
    } else {
      snapshot = {
        sceneId: this.activeSceneId,
        target: [0, 0, 0],
        position: [0, 5, 20],
        zoomOrDistance: 20,
        timestamp: Date.now(),
        targetName,
      };
    }

    if (snapshot) {
      this.previousViewStack.push(snapshot);
      if (this.previousViewStack.length > 10) {
        this.previousViewStack.shift();
      }
    }
  }

  /**
   * Restores the previous camera view smoothly.
   */
  public restorePreviousView(): boolean {
    if (this.previousViewStack.length === 0) {
      // Fallback default reset action via action controller
      VisualizationActionController.dispatchAction({
        sceneId: this.activeSceneId,
        cameraAction: "reset",
      });
      return false;
    }

    const previousSnapshot = this.previousViewStack.pop()!;
    const handler = this.sceneHandlers.get(previousSnapshot.sceneId);

    this.notifyListeners();
    if (handler?.restoreCameraSnapshot) {
      return handler.restoreCameraSnapshot(previousSnapshot);
    }

    VisualizationActionController.dispatchAction({
      sceneId: previousSnapshot.sceneId,
      cameraAction: "focus",
      targetObject: previousSnapshot.targetName || "default",
    });
    return true;
  }

  public hasPreviousView(): boolean {
    return this.previousViewStack.length > 0;
  }

  public getPreviousViewCount(): number {
    return this.previousViewStack.length;
  }

  /**
   * Safe Focus Action: smoothly moves camera to target without sudden jumps.
   */
  public focusScientificObject(targetName: string, durationMs = 1200): boolean {
    if (this.isUserInteractingWithCamera) {
      console.warn("Camera focus deferred: student is actively controlling the camera.");
      return false;
    }

    this.pushCurrentView(targetName);

    const handler = this.sceneHandlers.get(this.activeSceneId);
    let success = false;
    if (handler) {
      success = handler.focusObject(targetName, durationMs);
    } else {
      // Default action bus dispatch
      VisualizationActionController.dispatchAction({
        sceneId: this.activeSceneId,
        targetObject: targetName,
        cameraAction: "focus",
        parameters: { durationMs },
      });
      success = true;
    }
    this.notifyListeners();
    return success;
  }

  /**
   * Safe Highlight Action: highlights object without disturbing student camera view.
   */
  public highlightScientificObject(
    targetName: string,
    highlightType: "ring" | "glow" | "marker" | "orbit" = "ring",
    durationMs = 4000,
  ): boolean {
    this.currentHighlightedObject = {
      name: targetName,
      expiresAt: Date.now() + durationMs,
    };

    const handler = this.sceneHandlers.get(this.activeSceneId);
    let success = false;
    if (handler) {
      success = handler.highlightObject(targetName, highlightType, durationMs);
    } else {
      VisualizationActionController.dispatchAction({
        sceneId: this.activeSceneId,
        targetObject: targetName,
        highlightElements: [targetName],
        parameters: { highlightType, durationMs },
      });
      success = true;
    }
    this.notifyListeners();
    return success;
  }

  public getHighlightedObject(): string | null {
    if (!this.currentHighlightedObject) return null;
    if (Date.now() > this.currentHighlightedObject.expiresAt) {
      this.currentHighlightedObject = null;
      return null;
    }
    return this.currentHighlightedObject.name;
  }

  /**
   * Runs an approved educational demonstration.
   */
  public playApprovedDemonstration(
    demonstrationId: ApprovedDemonstrationId,
    parameters: Record<string, any> = {},
  ): boolean {
    const handler = this.sceneHandlers.get(this.activeSceneId);
    let success = false;
    if (handler) {
      success = handler.playDemonstration(demonstrationId, parameters);
    } else {
      VisualizationActionController.dispatchAction({
        sceneId: this.activeSceneId,
        parameters: { demonstrationId, ...parameters },
      });
      success = true;
    }
    this.notifyListeners();
    return success;
  }

  public pauseSimulation(): boolean {
    const handler = this.sceneHandlers.get(this.activeSceneId);
    let success = false;
    if (handler) {
      success = handler.pauseSimulation();
    } else {
      VisualizationActionController.dispatchAction({
        sceneId: this.activeSceneId,
        parameters: { command: "pause" },
      });
      success = true;
    }
    this.notifyListeners();
    return success;
  }

  public resumeSimulation(): boolean {
    const handler = this.sceneHandlers.get(this.activeSceneId);
    let success = false;
    if (handler) {
      success = handler.resumeSimulation();
    } else {
      VisualizationActionController.dispatchAction({
        sceneId: this.activeSceneId,
        parameters: { command: "resume" },
      });
      success = true;
    }
    this.notifyListeners();
    return success;
  }

  public getCurrentSimulationState(): SimulationStateInfo {
    const handler = this.sceneHandlers.get(this.activeSceneId);
    if (handler) {
      return handler.getCurrentSimulationState();
    }

    // Default grounded fallback state
    return {
      isPaused: false,
      timeScale: 1.0,
      activeSceneId: this.activeSceneId,
      epistemicMode: "educational_approximation",
      scientificNotes:
        "Standard interactive scale visualizer with proportional physical units and softened potentials.",
      cameraRegime: "planetary",
    };
  }

  public getSelectedCelestialObject(): CelestialObjectInfo | null {
    const handler = this.sceneHandlers.get(this.activeSceneId);
    if (handler) {
      return handler.getSelectedObject();
    }
    return null;
  }

  public clearHistory(): void {
    this.previousViewStack = [];
    this.currentHighlightedObject = null;
  }
}
