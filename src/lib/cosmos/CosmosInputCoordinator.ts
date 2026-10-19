/**
 * COSMOS Input Coordinator
 * Project: Our Visible Universe Academy
 * Scope: Phase 1 Student Input & Navigation Coordination (Part 2 & Part 3)
 *
 * Coordinates student interactive commands (pause, resume, repeat, next/prev step),
 * and enforces strict pedagogical invariants:
 * INVARIANT: No automatic transition may skip an unresolved required student-input step.
 */

import type { LearningStep } from "./learning-director-types";

export class CosmosInputCoordinator {
  private static instance: CosmosInputCoordinator | null = null;

  public static getInstance(): CosmosInputCoordinator {
    if (!this.instance) {
      this.instance = new CosmosInputCoordinator();
    }
    return this.instance;
  }

  /**
   * Determines if the active step allows advancing to the next step.
   * If the step requires student input and hasn't been completed, it strictly blocks advance.
   */
  public canAdvanceStep(step: LearningStep | null): { allowed: boolean; reason?: string } {
    if (!step) {
      return { allowed: false, reason: "No active step" };
    }

    if (step.requiresStudentInput && step.stepStatus !== "completed") {
      return {
        allowed: false,
        reason: `Step "${step.title}" requires student participation before advancing.`,
      };
    }

    return { allowed: true };
  }

  /**
   * Validates if a user can manually skip to a target step.
   */
  public canJumpToStep(
    targetStep: LearningStep,
    currentStep: LearningStep | null,
    allSteps: LearningStep[],
  ): { allowed: boolean; reason?: string } {
    if (!targetStep) return { allowed: false, reason: "Target step not found" };

    const targetIdx = allSteps.findIndex((s) => s.stepId === targetStep.stepId);
    const currentIdx = currentStep
      ? allSteps.findIndex((s) => s.stepId === currentStep.stepId)
      : -1;

    // Moving backward is always allowed for review
    if (targetIdx <= currentIdx) {
      return { allowed: true };
    }

    // Check if any intermediate step requires unresolved student input
    for (let i = currentIdx; i < targetIdx; i++) {
      if (i >= 0 && allSteps[i].requiresStudentInput && allSteps[i].stepStatus !== "completed") {
        return {
          allowed: false,
          reason: `Cannot skip required step "${allSteps[i].title}".`,
        };
      }
    }

    return { allowed: true };
  }
}
