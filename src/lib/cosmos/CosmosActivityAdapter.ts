// @ts-nocheck
/**
 * COSMOS Universal Activity Adapter Framework
 * Project: Our Visible Universe Academy
 * Scope: COSMOS 2.0 Phase 2 — Part 3 Universal Activity Adapter API
 *
 * Wraps existing scientific simulations, 3D laboratories, and accessible 2D alternatives
 * across all 24 modules without inventing nonexistent controls or duplicating scenes.
 * Enforces real student interaction before activity completion.
 */

import { MODULE_COMPLETION_RULES } from "../academy/completion-rules";
import { submitActivityOutcome } from "../academy/completion.functions";
import { Cosmos3DAdapter } from "./Cosmos3DAdapter";
import { CosmosAttentionController } from "./CosmosAttentionController";
import { CosmosLessonNavigator } from "./CosmosLessonNavigator";
import type {
  ActivityInstructionStep,
  ActivityStateRecord,
  ActivityStatus,
} from "./learning-director-types";

export interface ActivityRuntimeHandlers {
  onFocusControl?: (controlSelector: string) => void;
  onHighlightControl?: (controlSelector: string) => void;
  onRestoreOriginalState?: () => void;
  onDemonstrateControl?: (actionId: string) => void;
  getLiveParameters?: () => Record<string, unknown>;
}

type ActivityStateListener = (state: ActivityStateRecord) => void;

export class CosmosActivityAdapter {
  private static instance: CosmosActivityAdapter | null = null;

  private activities = new Map<string, ActivityStateRecord>();
  private moduleToActivityId = new Map<string, string>();
  private runtimeHandlers = new Map<string, ActivityRuntimeHandlers>();
  private activeActivityId: string | null = null;
  private listeners = new Set<ActivityStateListener>();
  private highlightTimeout: ReturnType<typeof setTimeout> | null = null;

  private constructor() {
    this.initializeDefaultModuleAdapters();
  }

  public static getInstance(): CosmosActivityAdapter {
    if (!this.instance) {
      this.instance = new CosmosActivityAdapter();
    }
    return this.instance;
  }

  /**
   * Pre-registers structured activity definitions for all 24 modules from MODULE_COMPLETION_RULES.
   */
  private initializeDefaultModuleAdapters(): void {
    for (const [moduleId, rule] of Object.entries(MODULE_COMPLETION_RULES)) {
      const req = rule.requiredActivities[0];
      if (!req) continue;

      const canonicalId = moduleId === "08" ? "module08-orbital-simulation" : req.id;

      const steps = this.buildInstructionStepsForModule(moduleId, req.title, req.description);
      const defaultParams = this.buildDefaultParametersForModule(moduleId);

      const record: ActivityStateRecord = {
        activityId: canonicalId,
        moduleId,
        title: req.title,
        objective: req.description,
        type: req.type === "simulation_3d" ? "physics_simulation" : "interactive_lab",
        status: "READY",
        requiredActions: steps.map((s) => s.expectedActionName || s.stepId),
        completedActions: [],
        currentStepId: steps[0]?.stepId || "step-1",
        instructionSteps: steps,
        currentParameters: { ...defaultParams },
        originalParameters: { ...defaultParams },
        availableActions: this.buildAvailableActionsForModule(moduleId),
        activeControlSelector: steps[0]?.targetControlSelector,
        activeControlLabel: steps[0]?.targetControlLabel,
        validationMethod: "server_validated_result",
        validationKey: req.validationKey,
        accessibleAlternativeAvailable: Boolean(req.accessibleAlternativeId),
        isAccessibleModeActive: false,
      };

      this.activities.set(canonicalId, record);
      // Also index by rule's activityId so both "module08-orbital-simulation" and "act_08_orbital_mechanics_lab" resolve cleanly
      this.activities.set(req.id, record);
      this.moduleToActivityId.set(moduleId, canonicalId);
    }
  }

  private buildInstructionStepsForModule(
    moduleId: string,
    title: string,
    description: string,
  ): ActivityInstructionStep[] {
    if (moduleId === "08") {
      return [
        {
          stepId: "orbit-observation",
          stepNumber: 1,
          instructionText:
            "First, observe the planet moving around the Central Star in a balanced orbit.",
          spokenPrompt:
            "We're now going to investigate how gravity changes an orbit. First, observe the planet moving around the Sun.",
          targetControlSelector: "#module-08-activities",
          targetControlLabel: "Orbital Mechanics 3D Canvas",
          demonstrationActionId: "circular_orbit_balance",
          expectedActionName: "observe_orbit",
          completed: false,
          observationFeedback:
            "Notice how forward tangential velocity balances inward gravitational pull to keep the orbit circular.",
        },
        {
          stepId: "eccentricity-observation",
          stepNumber: 2,
          instructionText:
            "Now change the eccentricity or select the Elliptical Orbit preset / velocity boost and observe what happens to the orbit.",
          spokenPrompt:
            "Now change the eccentricity or orbital velocity and observe what happens to the orbit.",
          targetControlSelector:
            '[data-cosmos-control="eccentricity-control"], #module-08-activities button',
          targetControlLabel: "Eccentricity & Orbital Preset Controls",
          demonstrationActionId: "kepler_second_law",
          expectedActionName: "change_eccentricity",
          completed: false,
          observationFeedback:
            "Notice how changing eccentricity changes the orbit's shape, causing the planet to move faster at periapsis and slower at apoapsis.",
        },
        {
          stepId: "stability-verification",
          stepNumber: 3,
          instructionText:
            "Maintain a closed elliptical orbit (e < 1.0) or complete the Kepler verification to validate your orbital mechanics lab.",
          spokenPrompt:
            "Great observation! Verify your closed orbit parameters to record your experimental completion.",
          targetControlSelector: "#module-08-activities",
          targetControlLabel: "Verify Orbital Stability",
          expectedActionName: "verify_orbit",
          completed: false,
          observationFeedback:
            "Stable closed Keplerian orbit confirmed! Your experimental telemetry satisfies Kepler's laws of planetary motion.",
        },
      ];
    }

    if (moduleId === "01") {
      return [
        {
          stepId: "scale-origin",
          stepNumber: 1,
          instructionText: "Inspect the human and planetary scale benchmark (10⁰ m to 10⁷ m).",
          spokenPrompt:
            "Let's begin our Cosmic Scale experiment at Earth's familiar planetary scale.",
          targetControlSelector: "#module-01-visualizer, #module-01-activities",
          targetControlLabel: "Cosmic Scale Slider",
          expectedActionName: "inspect_planetary_scale",
          completed: false,
          observationFeedback: "At 10⁷ meters, Earth's diameter fills our field of view.",
        },
        {
          stepId: "scale-traversal",
          stepNumber: 2,
          instructionText:
            "Fire a photon signal or traverse at least 10 orders of magnitude toward interstellar and galactic scales.",
          spokenPrompt:
            "Now select a distant cosmic target or zoom out across powers of ten to witness how light-travel time expands.",
          targetControlSelector: "#module-01-activities button",
          targetControlLabel: "Target Selector & Fire Photon Signal",
          expectedActionName: "traverse_scale",
          completed: false,
          observationFeedback:
            "Notice how even light at 299,792 km/s takes years to cross interstellar space and millennia to cross the Milky Way.",
        },
      ];
    }

    if (moduleId === "14") {
      return [
        {
          stepId: "schwarzschild-inspection",
          stepNumber: 1,
          instructionText:
            "Observe the photon sphere and gravitational lensing ring around the black hole.",
          spokenPrompt:
            "Observe how extreme spacetime curvature bends light rays around the Schwarzschild event horizon.",
          targetControlSelector: "#module-14-visualizer, #module-14-activities",
          targetControlLabel: "Black Hole Relativistic Lensing Viewport",
          demonstrationActionId: "gravitational_lensing",
          expectedActionName: "observe_lensing",
          completed: false,
          observationFeedback:
            "Light passing near 1.5 Schwarzschild radii orbits in the unstable photon sphere.",
        },
        {
          stepId: "mass-spin-adjustment",
          stepNumber: 2,
          instructionText:
            "Adjust the black hole mass or inclination angle and observe how the Einstein ring and accretion disk Doppler beaming respond.",
          spokenPrompt:
            "Now adjust the black hole mass, spin, or viewing inclination to see how the event horizon shadow changes.",
          targetControlSelector: "#module-14-activities input, #module-14-activities button",
          targetControlLabel: "Mass & Inclination Controls",
          expectedActionName: "adjust_black_hole_params",
          completed: false,
          observationFeedback:
            "Notice how the Schwarzschild radius scales linearly with mass (R_s = 2GM/c²).",
        },
      ];
    }

    // Universal 2-step guided scientific protocol for all other modules
    return [
      {
        stepId: `m${moduleId}-explore-controls`,
        stepNumber: 1,
        instructionText: `Explore the interactive controls in ${title}: ${description}`,
        spokenPrompt: `We are now entering the ${title}. First, examine the scientific parameters and interactive controls before you.`,
        targetControlSelector: `#module-${moduleId}-activities`,
        targetControlLabel: `${title} Controls`,
        expectedActionName: "interact_parameter",
        completed: false,
        observationFeedback: `Good! You have adjusted the active experimental parameters in ${title}.`,
      },
      {
        stepId: `m${moduleId}-verify-experiment`,
        stepNumber: 2,
        instructionText: `Run or verify the experiment in ${title} to observe the resulting physical state.`,
        spokenPrompt: `Now run the simulation or test a new parameter configuration to verify the astrophysical principle in action.`,
        targetControlSelector: `#module-${moduleId}-activities button`,
        targetControlLabel: "Run / Verify Experiment",
        expectedActionName: "complete_experiment",
        completed: false,
        observationFeedback: `Excellent work! Your experimental observations in ${title} have been validated.`,
      },
    ];
  }

  private buildDefaultParametersForModule(moduleId: string): Record<string, unknown> {
    if (moduleId === "08") {
      return {
        preset: "circular",
        eccentricity: 0.0,
        semiMajorAxisAU: 1.0,
        periapsisKm: 1500,
        isBound: true,
      };
    }
    if (moduleId === "01") {
      return {
        stepCount: 1,
        minScaleMeters: 1,
        maxScaleMeters: 1e7,
        selectedTarget: "Moon",
      };
    }
    if (moduleId === "05") {
      return {
        axialTiltDeg: 23.44,
        orbitalMonth: 6,
        lunarInclinationDeg: 5.145,
        tidalSyzygyAligned: true,
        interacted: false,
        interactionCount: 0,
      };
    }
    if (moduleId === "06") {
      return {
        formationEpochMyr: 3.5,
        frostLineAU: 2.7,
        comparisonPlanetA: "Earth",
        comparisonPlanetB: "Saturn",
        interacted: false,
        interactionCount: 0,
      };
    }
    if (moduleId === "07") {
      return {
        coreTemperatureMK: 15.7,
        coreDensityGcm3: 150,
        solarCyclePhaseYear: 4.5,
        cmeVelocityKms: 1200,
        imfBzNt: -12,
        interacted: false,
        interactionCount: 0,
      };
    }
    if (moduleId === "14") {
      return {
        massSolar: 10,
        inclinationDeg: 75,
        lensingVerified: false,
      };
    }
    return {
      interacted: false,
      interactionCount: 0,
    };
  }

  private buildAvailableActionsForModule(moduleId: string): string[] {
    if (moduleId === "08") {
      return [
        "select_preset_circular",
        "select_preset_eccentric",
        "select_preset_escape",
        "prograde_boost",
        "retrograde_burn",
        "adjust_eccentricity",
        "verify_kepler_third_law",
      ];
    }
    if (moduleId === "05") {
      return [
        "adjust_solar_insolation_tilt",
        "align_eclipse_node",
        "inspect_tidal_quadrupole",
        "interact_parameter",
        "complete_experiment",
      ];
    }
    if (moduleId === "06") {
      return [
        "inspect_planetary_regimes",
        "classify_density_architecture",
        "compare_planetary_gravity",
        "interact_parameter",
        "complete_experiment",
      ];
    }
    if (moduleId === "07") {
      return [
        "inspect_solar_core_fusion",
        "simulate_magnetic_cme_weather",
        "toggle_coronal_eclipse_occulter",
        "interact_parameter",
        "complete_experiment",
      ];
    }
    if (moduleId === "01") {
      return ["select_cosmic_target", "fire_photon_signal", "zoom_scale_slider"];
    }
    return ["adjust_parameter", "run_simulation", "reset_simulation", "verify_outcome"];
  }

  // ============================================================================
  // PART 3 REQUIRED UNIVERSAL ACTIVITY ADAPTER API
  // ============================================================================

  /**
   * 1. registerActivity()
   */
  public registerActivity(
    record: Partial<ActivityStateRecord> & { activityId: string; moduleId: string },
    handlers?: ActivityRuntimeHandlers,
  ): ActivityStateRecord {
    const existing =
      this.activities.get(record.activityId) || this.getActivityForModule(record.moduleId);

    const merged: ActivityStateRecord = {
      activityId: record.activityId,
      moduleId: record.moduleId,
      title: record.title || existing?.title || `Module ${record.moduleId} Laboratory`,
      objective:
        record.objective ||
        existing?.objective ||
        "Investigate astrophysical principles through interactive experimentation.",
      type: record.type || existing?.type || "physics_simulation",
      status: record.status || existing?.status || "READY",
      requiredActions: record.requiredActions || existing?.requiredActions || [],
      completedActions: record.completedActions || existing?.completedActions || [],
      currentStepId:
        record.currentStepId ||
        existing?.currentStepId ||
        existing?.instructionSteps[0]?.stepId ||
        "step-1",
      instructionSteps: record.instructionSteps || existing?.instructionSteps || [],
      currentParameters: {
        ...(existing?.currentParameters || {}),
        ...(record.currentParameters || {}),
      },
      originalParameters: {
        ...(existing?.originalParameters || {}),
        ...(record.originalParameters || record.currentParameters || {}),
      },
      availableActions: record.availableActions || existing?.availableActions || [],
      activeControlSelector: record.activeControlSelector || existing?.activeControlSelector,
      activeControlLabel: record.activeControlLabel || existing?.activeControlLabel,
      validationMethod:
        record.validationMethod || existing?.validationMethod || "server_validated_result",
      validationKey: record.validationKey || existing?.validationKey || "generic_activity",
      accessibleAlternativeAvailable:
        record.accessibleAlternativeAvailable ?? existing?.accessibleAlternativeAvailable ?? true,
      isAccessibleModeActive:
        record.isAccessibleModeActive ?? existing?.isAccessibleModeActive ?? false,
    };

    this.activities.set(merged.activityId, merged);
    this.moduleToActivityId.set(merged.moduleId, merged.activityId);

    if (handlers) {
      this.runtimeHandlers.set(merged.activityId, handlers);
    }

    this.notifyListeners(merged);
    return merged;
  }

  /**
   * 2. unregisterActivity()
   */
  public unregisterActivity(activityId: string): void {
    this.runtimeHandlers.delete(activityId);
    if (this.activeActivityId === activityId) {
      this.activeActivityId = null;
    }
  }

  /**
   * 3. getActivityState()
   */
  public getActivityState(activityIdOrModuleId?: string): ActivityStateRecord | null {
    const resolved = this.resolveActivity(activityIdOrModuleId);
    if (!resolved) return null;

    const handlers = this.runtimeHandlers.get(resolved.activityId);
    if (handlers?.getLiveParameters) {
      resolved.currentParameters = {
        ...resolved.currentParameters,
        ...handlers.getLiveParameters(),
      };
    }
    return { ...resolved, instructionSteps: resolved.instructionSteps.map((s) => ({ ...s })) };
  }

  /**
   * 4. getAvailableActions()
   */
  public getAvailableActions(activityIdOrModuleId?: string): string[] {
    const resolved = this.resolveActivity(activityIdOrModuleId);
    return resolved ? [...resolved.availableActions] : [];
  }

  /**
   * 5. getCurrentParameters()
   */
  public getCurrentParameters(activityIdOrModuleId?: string): Record<string, unknown> {
    const state = this.getActivityState(activityIdOrModuleId);
    return state ? { ...state.currentParameters } : {};
  }

  /**
   * 6. getInstructionSteps()
   */
  public getInstructionSteps(activityIdOrModuleId?: string): ActivityInstructionStep[] {
    const resolved = this.resolveActivity(activityIdOrModuleId);
    return resolved ? resolved.instructionSteps.map((s) => ({ ...s })) : [];
  }

  /**
   * 7. getActiveControl()
   */
  public getActiveControl(activityIdOrModuleId?: string): {
    selector?: string;
    label?: string;
    stepId?: string;
  } | null {
    const resolved = this.resolveActivity(activityIdOrModuleId);
    if (!resolved) return null;
    return {
      selector: resolved.activeControlSelector,
      label: resolved.activeControlLabel,
      stepId: resolved.currentStepId,
    };
  }

  /**
   * 8. focusControl()
   */
  public async focusControl(
    controlSelector: string,
    activityIdOrModuleId?: string,
  ): Promise<boolean> {
    const resolved = this.resolveActivity(activityIdOrModuleId);
    if (resolved) {
      resolved.activeControlSelector = controlSelector;
      const handlers = this.runtimeHandlers.get(resolved.activityId);
      if (handlers?.onFocusControl) {
        handlers.onFocusControl(controlSelector);
      }
      this.notifyListeners(resolved);
    }

    const scrolled = await CosmosLessonNavigator.getInstance().scrollToTarget(controlSelector, {
      offsetY: 110,
      behavior: "smooth",
    });

    if (typeof document !== "undefined") {
      try {
        const el = document.querySelector(controlSelector) as HTMLElement | null;
        if (el && typeof el.focus === "function") {
          el.focus({ preventScroll: true });
        }
      } catch {
        // Ignore selector errors
      }
    }
    return scrolled;
  }

  /**
   * 9. highlightControl()
   */
  public highlightControl(
    controlSelector: string,
    label?: string,
    durationMs = 6000,
    activityIdOrModuleId?: string,
  ): boolean {
    const resolved = this.resolveActivity(activityIdOrModuleId);
    if (resolved) {
      resolved.activeControlSelector = controlSelector;
      if (label) resolved.activeControlLabel = label;
      const handlers = this.runtimeHandlers.get(resolved.activityId);
      if (handlers?.onHighlightControl) {
        handlers.onHighlightControl(controlSelector);
      }
      this.notifyListeners(resolved);
    }

    if (typeof document === "undefined") return false;

    try {
      // Clear previous control highlights
      document.querySelectorAll(".cosmos-active-control-highlight").forEach((node) => {
        node.classList.remove(
          "cosmos-active-control-highlight",
          "ring-2",
          "ring-amber-400",
          "shadow-lg",
          "shadow-amber-500/20",
        );
      });

      const el =
        document.querySelector(controlSelector) ||
        document.getElementById(controlSelector.replace(/^#/, ""));

      if (!el) return false;

      el.classList.add(
        "cosmos-active-control-highlight",
        "ring-2",
        "ring-amber-400",
        "shadow-lg",
        "shadow-amber-500/20",
      );

      if (this.highlightTimeout) {
        clearTimeout(this.highlightTimeout);
      }
      this.highlightTimeout = setTimeout(() => {
        el.classList.remove(
          "cosmos-active-control-highlight",
          "ring-2",
          "ring-amber-400",
          "shadow-lg",
          "shadow-amber-500/20",
        );
      }, durationMs);

      return true;
    } catch {
      return false;
    }
  }

  /**
   * 10. waitForInteraction()
   * Places the activity into WAITING_FOR_STUDENT state and returns the updated state.
   */
  public waitForInteraction(
    activityIdOrModuleId?: string,
    stepId?: string,
  ): ActivityStateRecord | null {
    const resolved = this.resolveActivity(activityIdOrModuleId);
    if (!resolved) return null;

    this.activeActivityId = resolved.activityId;
    resolved.status = "WAITING_FOR_STUDENT";

    if (stepId) {
      const targetStep = resolved.instructionSteps.find((s) => s.stepId === stepId);
      if (targetStep) {
        resolved.currentStepId = targetStep.stepId;
        resolved.activeControlSelector = targetStep.targetControlSelector;
        resolved.activeControlLabel = targetStep.targetControlLabel;
      }
    } else {
      const nextIncomplete = resolved.instructionSteps.find((s) => !s.completed);
      if (nextIncomplete) {
        resolved.currentStepId = nextIncomplete.stepId;
        resolved.activeControlSelector = nextIncomplete.targetControlSelector;
        resolved.activeControlLabel = nextIncomplete.targetControlLabel;
      }
    }

    if (resolved.activeControlSelector) {
      this.highlightControl(
        resolved.activeControlSelector,
        resolved.activeControlLabel,
        8000,
        resolved.activityId,
      );
    }

    this.notifyListeners(resolved);
    return this.getActivityState(resolved.activityId);
  }

  /**
   * Records a real student interaction from any scientific simulation or lab component.
   */
  public reportStudentInteraction(
    activityIdOrModuleId: string,
    actionName: string,
    updatedParameters: Record<string, unknown> = {},
  ): {
    state: ActivityStateRecord | null;
    completedStep?: ActivityInstructionStep;
    observationFeedback?: string;
    allStepsCompleted: boolean;
  } {
    const resolved = this.resolveActivity(activityIdOrModuleId);
    if (!resolved) {
      return { state: null, allStepsCompleted: false };
    }

    this.activeActivityId = resolved.activityId;
    resolved.status = "ACTIVE";
    resolved.currentParameters = {
      ...resolved.currentParameters,
      ...updatedParameters,
      interacted: true,
      lastAction: actionName,
      interactionCount: Number(resolved.currentParameters.interactionCount || 0) + 1,
    };

    if (!resolved.completedActions.includes(actionName)) {
      resolved.completedActions.push(actionName);
    }

    // Advance the current instruction step when the student performs the requested action or meaningful parameter update
    let completedStep: ActivityInstructionStep | undefined;
    const currentStepIdx = resolved.instructionSteps.findIndex(
      (s) => s.stepId === resolved.currentStepId && !s.completed,
    );
    const fallbackIdx = resolved.instructionSteps.findIndex((s) => !s.completed);
    const targetIdx = currentStepIdx !== -1 ? currentStepIdx : fallbackIdx;

    if (targetIdx !== -1) {
      const candidateStep = resolved.instructionSteps[targetIdx];
      const isFinalVerifyStep =
        targetIdx === resolved.instructionSteps.length - 1 && resolved.instructionSteps.length > 1;
      const hasExplicitVerificationData =
        actionName === candidateStep.expectedActionName ||
        actionName.includes("verify") ||
        actionName.includes("complete") ||
        actionName.includes("submit") ||
        Object.keys(updatedParameters).some((k) => !["interacted", "lastControlUsed"].includes(k));

      // Do not mark the final verification step complete on a generic button click unless verified telemetry is supplied
      if (!isFinalVerifyStep || hasExplicitVerificationData) {
        resolved.instructionSteps[targetIdx].completed = true;
        completedStep = resolved.instructionSteps[targetIdx];
        resolved.lastObservationFeedback = completedStep.observationFeedback;
      }
    }

    // Move cursor to next incomplete step if any
    const nextIncomplete = resolved.instructionSteps.find((s) => !s.completed);
    if (nextIncomplete) {
      resolved.currentStepId = nextIncomplete.stepId;
      resolved.activeControlSelector = nextIncomplete.targetControlSelector;
      resolved.activeControlLabel = nextIncomplete.targetControlLabel;
      resolved.status = "WAITING_FOR_STUDENT";
    } else {
      resolved.status = "CHECKING_RESULT";
    }

    const allStepsCompleted = resolved.instructionSteps.every((s) => s.completed);
    this.notifyListeners(resolved);

    return {
      state: this.getActivityState(resolved.activityId),
      completedStep,
      observationFeedback: completedStep?.observationFeedback,
      allStepsCompleted,
    };
  }

  /**
   * 11. getValidationResult()
   * Validates the activity state against authoritative server rules (`submitActivityOutcome`).
   * Never marks an activity COMPLETED unless server validation succeeds.
   */
  public async getValidationResult(
    activityIdOrModuleId?: string,
    overridePayload?: Record<string, unknown>,
  ): Promise<{ isValid: boolean; reason: string; state: ActivityStateRecord | null }> {
    const resolved = this.resolveActivity(activityIdOrModuleId);
    if (!resolved) {
      return {
        isValid: false,
        reason: "Activity not found in registry.",
        state: null,
      };
    }

    resolved.status = "CHECKING_RESULT";
    this.notifyListeners(resolved);

    const rule = MODULE_COMPLETION_RULES[resolved.moduleId];
    const officialActivityId = rule?.requiredActivities[0]?.id || resolved.activityId;

    const payloadToSubmit: Record<string, unknown> = {
      ...this.buildValidatedPayloadForModule(resolved.moduleId, resolved.currentParameters),
      ...(overridePayload || {}),
    };

    try {
      const serverResult = await submitActivityOutcome({
        data: {
          moduleId: resolved.moduleId,
          activityId: officialActivityId,
          payload: payloadToSubmit,
          isAccessibleAlternative: resolved.isAccessibleModeActive,
        },
      });

      resolved.lastValidationResult = {
        isValid: serverResult.success,
        reason: serverResult.reason,
        timestamp: Date.now(),
      };

      if (serverResult.success) {
        resolved.status = "COMPLETED";
        resolved.instructionSteps.forEach((s) => {
          s.completed = true;
        });
      } else {
        resolved.status = "NEEDS_RETRY";
      }

      this.notifyListeners(resolved);
      return {
        isValid: serverResult.success,
        reason: serverResult.reason,
        state: this.getActivityState(resolved.activityId),
      };
    } catch (err: any) {
      const failReason =
        err?.message ||
        "Server verification could not be completed. Please complete the simulation experiment and try again.";
      resolved.status = "NEEDS_RETRY";
      resolved.lastValidationResult = {
        isValid: false,
        reason: failReason,
        timestamp: Date.now(),
      };
      this.notifyListeners(resolved);
      return {
        isValid: false,
        reason: failReason,
        state: this.getActivityState(resolved.activityId),
      };
    }
  }

  private buildValidatedPayloadForModule(
    _moduleId: string,
    currentParams: Record<string, unknown>,
  ): Record<string, unknown> {
    // Forward only the actual observed parameters from the simulation without injecting hardcoded passing values
    return {
      ...currentParams,
    };
  }

  /**
   * 12. requestHelp()
   * Returns a contextual pedagogical hint for the current instruction step without completing it.
   */
  public requestHelp(activityIdOrModuleId?: string): {
    hintText: string;
    targetControlSelector?: string;
    targetControlLabel?: string;
  } {
    const resolved = this.resolveActivity(activityIdOrModuleId);
    if (!resolved) {
      return {
        hintText:
          "Scroll to the interactive laboratory section and adjust the primary simulation controls to observe how the physical system responds.",
      };
    }

    const activeStep =
      resolved.instructionSteps.find((s) => s.stepId === resolved.currentStepId) ||
      resolved.instructionSteps.find((s) => !s.completed) ||
      resolved.instructionSteps[0];

    if (activeStep?.targetControlSelector) {
      this.highlightControl(
        activeStep.targetControlSelector,
        activeStep.targetControlLabel,
        8000,
        resolved.activityId,
      );
    }

    if (resolved.moduleId === "08") {
      if (activeStep?.stepId === "eccentricity-observation") {
        return {
          hintText:
            "Try clicking '2. Elliptical Orbits & Kepler's 2nd Law' or clicking 'Prograde Boost (+10%)' in the Orbital Mechanics Lab. Watch how increasing velocity stretches the circular orbit into an ellipse!",
          targetControlSelector: activeStep.targetControlSelector,
          targetControlLabel: activeStep.targetControlLabel,
        };
      }
      return {
        hintText:
          "In the Orbital Mechanics Lab, a planet stays in a closed orbit when its total mechanical energy E = K + U is negative (eccentricity e < 1). Try adjusting the orbital velocity or preset and observe the trajectory trail.",
        targetControlSelector: activeStep?.targetControlSelector,
        targetControlLabel: activeStep?.targetControlLabel,
      };
    }

    return {
      hintText: activeStep
        ? `Current Objective: ${activeStep.instructionText} Look for the highlighted "${activeStep.targetControlLabel || "Interactive Control"}" on screen.`
        : `Objective: ${resolved.objective}`,
      targetControlSelector: activeStep?.targetControlSelector,
      targetControlLabel: activeStep?.targetControlLabel,
    };
  }

  /**
   * 13. restoreOriginalState()
   */
  public restoreOriginalState(activityIdOrModuleId?: string): ActivityStateRecord | null {
    const resolved = this.resolveActivity(activityIdOrModuleId);
    if (!resolved) return null;

    resolved.currentParameters = { ...resolved.originalParameters };
    resolved.completedActions = [];
    resolved.status = "READY";
    resolved.lastValidationResult = undefined;
    resolved.lastObservationFeedback = undefined;
    resolved.instructionSteps.forEach((s) => {
      s.completed = false;
    });
    if (resolved.instructionSteps[0]) {
      resolved.currentStepId = resolved.instructionSteps[0].stepId;
      resolved.activeControlSelector = resolved.instructionSteps[0].targetControlSelector;
      resolved.activeControlLabel = resolved.instructionSteps[0].targetControlLabel;
    }

    const handlers = this.runtimeHandlers.get(resolved.activityId);
    if (handlers?.onRestoreOriginalState) {
      handlers.onRestoreOriginalState();
    }

    CosmosAttentionController.getInstance().clearHighlight();
    this.notifyListeners(resolved);
    return this.getActivityState(resolved.activityId);
  }

  /**
   * Demonstrates an approved simulation control or preset via Cosmos3DAdapter.
   */
  public demonstrateControl(activityIdOrModuleId?: string): string {
    const resolved = this.resolveActivity(activityIdOrModuleId);
    if (!resolved) return "Demonstrating simulation controls.";

    const activeStep =
      resolved.instructionSteps.find((s) => s.stepId === resolved.currentStepId) ||
      resolved.instructionSteps[0];

    if (activeStep?.demonstrationActionId) {
      Cosmos3DAdapter.getInstance().playApprovedDemonstration(
        activeStep.demonstrationActionId as any,
      );
    }

    if (activeStep?.targetControlSelector) {
      this.highlightControl(
        activeStep.targetControlSelector,
        activeStep.targetControlLabel,
        6000,
        resolved.activityId,
      );
    }

    return activeStep
      ? `Highlighting "${activeStep.targetControlLabel || "Simulation Control"}": ${activeStep.instructionText}`
      : `Highlighting controls for ${resolved.title}.`;
  }

  public getActivityForModule(moduleId: string): ActivityStateRecord | null {
    const id = this.moduleToActivityId.get(moduleId);
    if (!id) return null;
    return this.activities.get(id) || null;
  }

  private resolveActivity(activityIdOrModuleId?: string): ActivityStateRecord | null {
    if (!activityIdOrModuleId) {
      if (this.activeActivityId) {
        return this.activities.get(this.activeActivityId) || null;
      }
      return this.activities.get("module08-orbital-simulation") || null;
    }

    if (this.activities.has(activityIdOrModuleId)) {
      return this.activities.get(activityIdOrModuleId)!;
    }

    const paddedModule = activityIdOrModuleId.padStart(2, "0");
    const mappedId = this.moduleToActivityId.get(paddedModule);
    if (mappedId && this.activities.has(mappedId)) {
      return this.activities.get(mappedId)!;
    }

    return null;
  }

  public subscribe(listener: ActivityStateListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(state: ActivityStateRecord): void {
    const snapshot = this.getActivityState(state.activityId);
    if (!snapshot) return;
    for (const listener of this.listeners) {
      try {
        listener(snapshot);
      } catch (err) {
        console.warn("CosmosActivityAdapter listener error:", err);
      }
    }
  }
}
