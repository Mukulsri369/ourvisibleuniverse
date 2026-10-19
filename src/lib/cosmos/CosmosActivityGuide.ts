/**
 * COSMOS Central Activity Guide
 * Project: Our Visible Universe Academy
 * Scope: COSMOS 2.0 Phase 2 — Part 2 Central Activity Guide
 *
 * Coordinates the 10-stage interactive activity learning cycle:
 * 1. Opening an activity
 * 2. Scrolling to the activity
 * 3. Highlighting the correct instructions
 * 4. Explaining the activity objective
 * 5. Demonstrating approved controls
 * 6. Waiting for student interaction (NEVER auto-completes on narration end)
 * 7. Reading actual activity state
 * 8. Providing contextual assistance
 * 9. Detecting validated completion
 * 10. Continuing to the next educational step
 */

import { CosmosActivityAdapter } from "./CosmosActivityAdapter";
import { CosmosAttentionController } from "./CosmosAttentionController";
import { CosmosLessonNavigator } from "./CosmosLessonNavigator";
import { NarrationController } from "./NarrationController";
import type {
  ActivityInstructionStep,
  ActivityStateRecord,
  GuidedLearningState,
} from "./learning-director-types";

export interface ActivityGuideCallbacks {
  onTransitionDirectorState: (newState: GuidedLearningState) => void;
  onSpeakPrompt: (spokenText: string, displayText?: string) => Promise<void>;
  onActivityValidatedAndCompleted: (state: ActivityStateRecord, reason: string) => void;
  onStateUpdated: (state: ActivityStateRecord | null) => void;
}

export class CosmosActivityGuide {
  private static instance: CosmosActivityGuide | null = null;

  private adapter: CosmosActivityAdapter;
  private lessonNavigator: CosmosLessonNavigator;
  private attentionController: CosmosAttentionController;
  private callbacks: ActivityGuideCallbacks | null = null;
  private activeModuleId = "01";
  private unsubscribeAdapter: (() => void) | null = null;

  private constructor() {
    this.adapter = CosmosActivityAdapter.getInstance();
    this.lessonNavigator = CosmosLessonNavigator.getInstance();
    this.attentionController = CosmosAttentionController.getInstance();

    this.unsubscribeAdapter = this.adapter.subscribe((updatedState) => {
      if (this.callbacks) {
        this.callbacks.onStateUpdated(updatedState);
      }
    });

    this.attachUniversalActivityDOMObserver();
  }

  /**
   * Observes genuine student clicks and slider changes inside any `#module-XX-activities`
   * container so all 24 module laboratories report real student participation.
   */
  private attachUniversalActivityDOMObserver(): void {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    const handleInteraction = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const activityContainer = target.closest('[id^="module-"][id$="-activities"]');
      if (!activityContainer) return;

      const interactiveControl = target.closest("button, input, select, [role='slider'], canvas");
      if (!interactiveControl) return;

      const idMatch = activityContainer.id.match(/^module-(\d{2})-activities$/);
      const detectedModuleId = idMatch ? idMatch[1] : this.activeModuleId;

      // Avoid double-reporting for Module 08 presets which already report detailed orbital telemetry
      if (
        detectedModuleId === "08" &&
        interactiveControl.closest('[data-cosmos-control="eccentricity-control"]')
      ) {
        return;
      }

      const controlLabel =
        (interactiveControl as HTMLElement).innerText?.trim().slice(0, 40) ||
        interactiveControl.getAttribute("aria-label") ||
        interactiveControl.tagName.toLowerCase();

      void this.handleStudentActivityInteraction(detectedModuleId, `control_${controlLabel}`, {
        interacted: true,
        lastControlUsed: controlLabel,
      });
    };

    document.addEventListener("change", handleInteraction, { passive: true });
    document.addEventListener("click", handleInteraction, { passive: true });
  }

  public static getInstance(): CosmosActivityGuide {
    if (!this.instance) {
      this.instance = new CosmosActivityGuide();
    }
    return this.instance;
  }

  public bindDirectorCallbacks(callbacks: ActivityGuideCallbacks): void {
    this.callbacks = callbacks;
  }

  /**
   * Stage 1–6: Opens the module's interactive activity, scrolls to it, highlights instructions,
   * explains the objective, demonstrates approved controls, and enters WAITING_FOR_ACTIVITY.
   * CRITICAL INVARIANT: Stops advancing and waits for real student input.
   */
  public async startGuidedActivity(
    moduleId: string,
    targetSelector?: string,
  ): Promise<ActivityStateRecord | null> {
    this.activeModuleId = moduleId;
    const state = this.adapter.getActivityState(moduleId);
    if (!state) return null;

    // 1 & 2. Navigate & scroll to the activity container
    this.callbacks?.onTransitionDirectorState("NAVIGATING_TO_ACTIVITY");
    const scrollTarget =
      targetSelector || state.activeControlSelector || `#module-${moduleId}-activities`;
    await this.lessonNavigator.scrollToTarget(scrollTarget, {
      offsetY: 90,
      behavior: "smooth",
    });

    // 3. Highlight the active instruction and simulation container
    this.callbacks?.onTransitionDirectorState("EXPLAINING_ACTIVITY");
    const currentStep = this.getActiveInstructionStep(moduleId);

    if (currentStep) {
      this.attentionController.highlightSegment({
        segmentId: `activity_${state.activityId}_${currentStep.stepId}`,
        sectionId: "interactive-lab",
        lessonId: "module-activities",
        displayText: currentStep.instructionText,
        spokenText: currentStep.spokenPrompt,
        targetElementSelector: currentStep.targetControlSelector || scrollTarget,
      });
    }

    // 4. Explain the activity objective & current instruction step
    const promptToSpeak = currentStep
      ? currentStep.spokenPrompt
      : `Welcome to ${state.title}. ${state.objective}`;

    if (this.callbacks?.onSpeakPrompt) {
      await this.callbacks.onSpeakPrompt(
        promptToSpeak,
        currentStep?.instructionText || state.objective,
      );
    }

    // 5. Demonstrate / highlight approved controls
    this.adapter.demonstrateControl(moduleId);

    // 6. Enter WAITING_FOR_ACTIVITY — strictly wait for real student interaction
    const waitingState = this.adapter.waitForInteraction(moduleId, currentStep?.stepId);
    this.callbacks?.onTransitionDirectorState("WAITING_FOR_ACTIVITY");
    this.callbacks?.onStateUpdated(waitingState);

    return waitingState;
  }

  /**
   * Stage 7, 9, 10: Observes real student interaction from the simulation,
   * provides scientific feedback, and guides to the next instruction step or server validation.
   */
  public async handleStudentActivityInteraction(
    moduleIdOrActivityId: string,
    actionName: string,
    parameters: Record<string, unknown> = {},
  ): Promise<void> {
    const report = this.adapter.reportStudentInteraction(
      moduleIdOrActivityId,
      actionName,
      parameters,
    );

    if (!report.state) return;
    this.callbacks?.onStateUpdated(report.state);

    // Speak observation feedback for the completed instruction step (e.g. "Notice how changing eccentricity changes the orbit's shape.")
    if (report.observationFeedback && this.callbacks?.onSpeakPrompt) {
      await this.callbacks.onSpeakPrompt(report.observationFeedback, report.observationFeedback);
    }

    // If more instruction steps remain, prompt and highlight the next control
    if (!report.allStepsCompleted) {
      const nextStep = this.getActiveInstructionStep(report.state.activityId);
      if (nextStep) {
        if (nextStep.targetControlSelector) {
          this.adapter.highlightControl(
            nextStep.targetControlSelector,
            nextStep.targetControlLabel,
            8000,
            report.state.activityId,
          );
        }
        if (this.callbacks?.onSpeakPrompt) {
          await this.callbacks.onSpeakPrompt(nextStep.spokenPrompt, nextStep.instructionText);
        }
        this.callbacks?.onTransitionDirectorState("WAITING_FOR_ACTIVITY");
      }
      return;
    }

    // All instruction steps completed -> Stage 9: Request authoritative validation
    await this.verifyAndCompleteActivity(report.state.activityId, parameters);
  }

  /**
   * Stage 8: Provides contextual pedagogical help for the current activity step.
   */
  public async provideContextualHelp(moduleId?: string): Promise<string> {
    const targetId = moduleId || this.activeModuleId;
    const help = this.adapter.requestHelp(targetId);

    if (this.callbacks?.onSpeakPrompt) {
      await this.callbacks.onSpeakPrompt(help.hintText, help.hintText);
    }
    return help.hintText;
  }

  /**
   * Stage 5 (On-demand): Demonstrates & highlights the active control for the learner.
   */
  public async demonstrateActiveControl(moduleId?: string): Promise<string> {
    const targetId = moduleId || this.activeModuleId;
    const message = this.adapter.demonstrateControl(targetId);
    const state = this.adapter.getActivityState(targetId);
    if (state?.activeControlSelector) {
      await this.adapter.focusControl(state.activeControlSelector, targetId);
    }
    return message;
  }

  /**
   * Stage 9 & 10: Validates completion with the learning engine and notifies the Director
   * so it can proceed to the next step only after validation succeeds.
   */
  public async verifyAndCompleteActivity(
    moduleIdOrActivityId?: string,
    overridePayload?: Record<string, unknown>,
  ): Promise<{ isValid: boolean; reason: string }> {
    const targetId = moduleIdOrActivityId || this.activeModuleId;
    const currentState = this.adapter.getActivityState(targetId);

    // CRITICAL REQUIREMENT: Refuse automatic completion if the student hasn't interacted yet
    if (
      currentState &&
      currentState.completedActions.length === 0 &&
      !currentState.currentParameters.interacted &&
      !overridePayload
    ) {
      const msg =
        "Please interact with the laboratory controls first so we can observe the physical results together.";
      this.callbacks?.onTransitionDirectorState("WAITING_FOR_ACTIVITY");
      if (this.callbacks?.onSpeakPrompt) {
        await this.callbacks.onSpeakPrompt(msg, msg);
      }
      return { isValid: false, reason: msg };
    }

    this.callbacks?.onTransitionDirectorState("REVIEWING_ACTIVITY");
    const validation = await this.adapter.getValidationResult(targetId, overridePayload);

    if (validation.state) {
      this.callbacks?.onStateUpdated(validation.state);
    }

    if (validation.isValid && validation.state) {
      const praise = `Activity verified! ${validation.reason}`;
      if (this.callbacks?.onSpeakPrompt) {
        await this.callbacks.onSpeakPrompt(praise, praise);
      }
      this.callbacks?.onActivityValidatedAndCompleted(validation.state, validation.reason);
      return { isValid: true, reason: validation.reason };
    } else {
      const retryPrompt = `Your experiment needs one more adjustment: ${validation.reason}`;
      this.callbacks?.onTransitionDirectorState("WAITING_FOR_ACTIVITY");
      if (this.callbacks?.onSpeakPrompt) {
        await this.callbacks.onSpeakPrompt(retryPrompt, retryPrompt);
      }
      return { isValid: false, reason: validation.reason };
    }
  }

  public getActiveInstructionStep(moduleIdOrActivityId?: string): ActivityInstructionStep | null {
    const state = this.adapter.getActivityState(moduleIdOrActivityId || this.activeModuleId);
    if (!state) return null;
    return (
      state.instructionSteps.find((s) => s.stepId === state.currentStepId) ||
      state.instructionSteps.find((s) => !s.completed) ||
      state.instructionSteps[0] ||
      null
    );
  }

  public getActivityState(moduleIdOrActivityId?: string): ActivityStateRecord | null {
    return this.adapter.getActivityState(moduleIdOrActivityId || this.activeModuleId);
  }

  public resetActivity(moduleIdOrActivityId?: string): ActivityStateRecord | null {
    const reset = this.adapter.restoreOriginalState(moduleIdOrActivityId || this.activeModuleId);
    this.callbacks?.onStateUpdated(reset);
    return reset;
  }
}
