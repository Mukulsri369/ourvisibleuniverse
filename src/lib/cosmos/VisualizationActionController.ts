/**
 * COSMOS VisualizationActionController
 * Project: Our Visible Universe Academy
 *
 * Provides a decoupled, safe event bus connecting COSMOS pedagogical actions
 * with 3D celestial canvas scenes, camera rigs, and scale managers.
 */

import type { CosmosVisualizationReference } from "./cosmos-types";

type ActionHandler = (action: CosmosVisualizationReference) => void;

export class VisualizationActionController {
  private static handlers = new Map<string, Set<ActionHandler>>();
  private static activeVisualization: CosmosVisualizationReference | null = null;

  /**
   * Dispatches a visualization action to registered 3D canvases.
   */
  public static dispatchAction(action: CosmosVisualizationReference): void {
    if (!action || !action.sceneId) return;

    this.activeVisualization = action;

    const specificHandlers = this.handlers.get(action.sceneId);
    if (specificHandlers) {
      for (const handler of specificHandlers) {
        try {
          handler(action);
        } catch (err) {
          console.warn(`Error executing visualization action for scene ${action.sceneId}:`, err);
        }
      }
    }

    // Global wildcard listeners (sceneId = "*")
    const globalHandlers = this.handlers.get("*");
    if (globalHandlers) {
      for (const handler of globalHandlers) {
        try {
          handler(action);
        } catch (err) {
          console.warn("Error executing global visualization handler:", err);
        }
      }
    }

    // Browser event dispatch for integration with existing Three.js canvases
    if (typeof window !== "undefined" && window.dispatchEvent) {
      try {
        const event = new CustomEvent("cosmos:visualization-action", {
          detail: action,
        });
        window.dispatchEvent(event);
      } catch (err) {
        console.warn("CustomEvent dispatch warning:", err);
      }
    }
  }

  /**
   * Registers a canvas or camera rig to receive actions.
   */
  public static registerHandler(sceneId: string, handler: ActionHandler): () => void {
    if (!this.handlers.has(sceneId)) {
      this.handlers.set(sceneId, new Set());
    }

    this.handlers.get(sceneId)!.add(handler);

    return () => {
      const set = this.handlers.get(sceneId);
      if (set) {
        set.delete(handler);
        if (set.size === 0) {
          this.handlers.delete(sceneId);
        }
      }
    };
  }

  /**
   * Returns the currently active visualization reference.
   */
  public static getActiveVisualization(): CosmosVisualizationReference | null {
    return this.activeVisualization;
  }
}
