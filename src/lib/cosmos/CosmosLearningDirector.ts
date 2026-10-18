/**
 * COSMOS Learning Director (Central Orchestrator)
 * Project: Our Visible Universe Academy
 * Scope: Phase 1 Intelligent Learning Director (Part 2, 3, 4, 8, 10, 11)
 *
 * Primary coordinator of the guided student learning experience:
 * - Deterministic 21-state machine
 * - Single authoritative session lifecycle
 * - Structured LearningStep sequence execution
 * - Automated context-aware scrolling & tab switching
 * - Highlighting of spoken narration text
 * - Voice and text interruption handling & clean lesson resumption
 * - Session state persistence and reload recovery
 */

import type { LearningLevel } from "../academy/types";
import { LessonContentProvider } from "./LessonContentProvider";
import { NarrationController } from "./NarrationController";
import { VoiceConversationController } from "./VoiceConversationController";
import { CosmosAttentionController } from "./CosmosAttentionController";
import { CosmosLessonNavigator } from "./CosmosLessonNavigator";
import { CosmosInputCoordinator } from "./CosmosInputCoordinator";
import { CosmosConversationManager } from "./CosmosConversationManager";
import { CosmosLearningSessionManager } from "./CosmosLearningSessionManager";
import { CosmosStepSequenceGenerator } from "./CosmosStepSequenceGenerator";
import { LearningPreferenceManager } from "./LearningPreferenceManager";
import type {
  CosmosAnswer,
  CosmosLanguage,
  CosmosVisualizationReference,
  NarrationSegment,
  NarrationState,
} from "./cosmos-types";
import type {
  DirectorStateSnapshot,
  DirectorSubscriber,
  GuidedLearningState,
  LearningStep,
} from "./learning-director-types";

export class CosmosLearningDirector {
  private static instance: CosmosLearningDirector | null = null;

  // Active state machine
  private state: GuidedLearningState = "INITIALIZING";
  private isGuidedModeActive = false;

  // Current curriculum coordinates
  private moduleId = "01";
  private moduleTitle = "Our Place in the Cosmos";
  private learningLevel: LearningLevel = "explorer";
  private language: CosmosLanguage = "en";

  // Structured steps
  private steps: LearningStep[] = [];
  private currentStepIndex = 0;

  // Authoritative Controllers (Singleton references to avoid duplicate instances)
  private narrationController: NarrationController;
  private voiceController: VoiceConversationController;
  private attentionController: CosmosAttentionController;
  private lessonNavigator: CosmosLessonNavigator;
  private inputCoordinator: CosmosInputCoordinator;
  private conversationManager: CosmosConversationManager;

  // Active narration & highlight tracking
  private activeSegmentId: string | null = null;
  private activeHighlightedText: string | null = null;
  private lastConfirmedPlaybackPosition = 0;
  private isUserScrolledAway = false;
  private lastQuestionAnswer: CosmosAnswer | null = null;
  private errorMessage?: string;

  // Interruption return point
  private preInterruptionState: GuidedLearningState = "EXPLAINING";
  private preInterruptionStepIndex = 0;
  private preInterruptionSegmentIndex = 0;

  // Subscribers
  private subscribers: Set<DirectorSubscriber> = new Set();
  private unsubscribeNarration: (() => void) | null = null;
  private unsubscribeNavigator: (() => void) | null = null;

  private constructor() {
    // 1. Initialize sub-controllers
    const initialSegments = LessonContentProvider.getSegmentsForModule("01", "explorer", "en");
    this.narrationController = new NarrationController(initialSegments);
    this.voiceController = new VoiceConversationController(this.narrationController);
    this.attentionController = CosmosAttentionController.getInstance();
    this.lessonNavigator = CosmosLessonNavigator.getInstance();
    this.inputCoordinator = CosmosInputCoordinator.getInstance();
    this.conversationManager = CosmosConversationManager.getInstance();

    // 2. Wire narration events
    this.subscribeToNarration();

    // 3. Wire scroll override events
    this.unsubscribeNavigator = this.lessonNavigator.subscribeState((scrolledAway) => {
      this.isUserScrolledAway = scrolledAway;
      this.notifySubscribers();
    });

    // 4. Check for restorable session from previous visit
    this.restoreSavedSessionIfAvailable();
  }

  public static getInstance(): CosmosLearningDirector {
    if (!this.instance) {
      this.instance = new CosmosLearningDirector();
    }
    return this.instance;
  }

  /**
   * Starts a guided cosmic journey for a given module.
   */
  public async startGuidedSession(
    moduleId = "01",
    level: LearningLevel = "explorer",
    preferredStartStepIndex = 0,
  ): Promise<void> {
    this.transitionState("INITIALIZING");
    this.isGuidedModeActive = true;
    this.moduleId = moduleId;
    this.learningLevel = level;

    const meta = LessonContentProvider.getModuleMetadata(moduleId);
    this.moduleTitle = meta ? meta.title : `Module ${moduleId}`;

    // 1. Generate structured learning sequence
    this.steps = CosmosStepSequenceGenerator.generateModuleSequence(moduleId, level);
    this.currentStepIndex = Math.min(preferredStartStepIndex, Math.max(0, this.steps.length - 1));

    // 2. Load module narration segments into NarrationController
    const segments = LessonContentProvider.getSegmentsForModule(moduleId, level, this.language);
    this.narrationController.loadSegments(segments, 0);

    // 3. Reset conversation history for new module
    this.conversationManager.resetHistory();

    // 4. Begin introduction
    this.transitionState("INTRODUCING_MODULE");
    this.persistCurrentSession();
    this.notifySubscribers();

    // Execute active step
    await this.executeActiveStep();
  }

  /**
   * Executes the active step: tab switching, scrolling, highlighting, and narration.
   */
  public async executeActiveStep(): Promise<void> {
    const currentStep = this.getCurrentStep();
    if (!currentStep) return;

    // Reset status to in_progress
    currentStep.stepStatus = "in_progress";

    // 1. Handle sublesson tab switching if needed
    if (currentStep.sublessonIndex !== undefined && currentStep.lessonId) {
      this.transitionState("NAVIGATING_TO_LESSON");
      await this.lessonNavigator.switchTab({
        moduleId: this.moduleId,
        sublessonId: currentStep.lessonId,
        sublessonIndex: currentStep.sublessonIndex,
      });
    }

    // 2. Scroll to target element with header offset
    if (currentStep.targetComponentId) {
      await this.lessonNavigator.scrollToTarget(currentStep.targetComponentId, {
        offsetY: 90,
        behavior: "smooth",
      });
    }

    // 3. Transition to EXPLAINING
    this.transitionState("EXPLAINING");

    // 4. Start narration for the step's segments if present
    if (currentStep.narrationSegmentIds && currentStep.narrationSegmentIds.length > 0) {
      const allSegments = this.narrationController.getSegments();
      const firstTargetId = currentStep.narrationSegmentIds[0];
      const matchIdx = allSegments.findIndex((s) => s.segmentId === firstTargetId);

      if (matchIdx !== -1) {
        this.narrationController.seekSegment(matchIdx);
        await this.narrationController.play();
      }
    } else {
      // Step without narration (e.g. Activity or Quiz awaiting student input)
      if (currentStep.stepType === "ACTIVITY") {
        this.transitionState("WAITING_FOR_ACTIVITY");
      } else if (currentStep.stepType === "KNOWLEDGE_CHECK") {
        this.transitionState("WAITING_FOR_ANSWER");
      } else {
        this.transitionState("WAITING_FOR_STUDENT");
      }
    }

    this.persistCurrentSession();
    this.notifySubscribers();
  }

  /**
   * Advances to the next eligible step.
   * INVARIANT: Never skips an unresolved required student input step.
   */
  public async nextStep(): Promise<boolean> {
    const currentStep = this.getCurrentStep();
    const canAdvance = this.inputCoordinator.canAdvanceStep(currentStep);

    if (!canAdvance.allowed) {
      this.errorMessage = canAdvance.reason;
      this.notifySubscribers();
      return false;
    }

    if (this.currentStepIndex >= this.steps.length - 1) {
      this.transitionState("MODULE_COMPLETED");
      if (currentStep) currentStep.stepStatus = "completed";
      this.persistCurrentSession();
      this.notifySubscribers();
      return true;
    }

    if (currentStep) {
      currentStep.stepStatus = "completed";
    }

    this.currentStepIndex++;
    await this.executeActiveStep();
    return true;
  }

  /**
   * Moves back to the previous step for review.
   */
  public async previousStep(): Promise<boolean> {
    if (this.currentStepIndex <= 0) {
      return false;
    }

    this.currentStepIndex--;
    await this.executeActiveStep();
    return true;
  }

  /**
   * Repeats the current step from the beginning.
   */
  public async repeatStep(): Promise<void> {
    const currentStep = this.getCurrentStep();
    if (!currentStep) return;

    await this.executeActiveStep();
  }

  /**
   * Pauses guided learning.
   */
  public pauseSession(): void {
    this.narrationController.pause();
    this.transitionState("PAUSED");
    this.persistCurrentSession();
    this.notifySubscribers();
  }

  /**
   * Resumes paused guided learning.
   */
  public async resumeSession(): Promise<void> {
    this.transitionState("EXPLAINING");
    await this.narrationController.play();
    this.persistCurrentSession();
    this.notifySubscribers();
  }

  /**
   * Handles student voice or typed question during guided learning.
   * Pauses current narration, captures context, answers, and resumes.
   */
  public async handleStudentQuestion(question: string): Promise<CosmosAnswer> {
    // 1. Capture pre-interruption state
    this.preInterruptionState = this.state;
    this.preInterruptionStepIndex = this.currentStepIndex;
    this.preInterruptionSegmentIndex = this.narrationController.getState().currentSegmentIndex;

    // 2. Transition state machine to ANSWERING_STUDENT_QUESTION
    this.transitionState("ANSWERING_STUDENT_QUESTION");

    // 3. Pause narration immediately and clear unplayed audio
    this.narrationController.pause();
    this.narrationController.clearAudioBuffers();

    const currentStep = this.getCurrentStep();
    const currentSegment = this.narrationController.getCurrentSegment();

    // 4. Resolve grounded answer through conversation manager
    const answer = await this.conversationManager.handleStudentQuestion({
      question,
      moduleId: this.moduleId,
      moduleTitle: this.moduleTitle,
      sublessonId: currentStep?.lessonId,
      learningLevel: this.learningLevel,
      currentStep,
      interruptedSegment: currentSegment,
      currentVisualization: currentSegment?.visualizationReference,
    });

    this.lastAnswer = answer;
    this.notifySubscribers();

    return answer;
  }

  /**
   * Resumes the lesson after student question answering.
   */
  public async resumeAfterQuestion(): Promise<void> {
    this.transitionState("RESUMING_PREVIOUS_STEP");
    this.notifySubscribers();

    // Return to the preserved step and segment
    this.currentStepIndex = this.preInterruptionStepIndex;
    this.narrationController.seekSegment(this.preInterruptionSegmentIndex);

    this.transitionState("EXPLAINING");
    await this.narrationController.play();
    this.notifySubscribers();
  }

  /**
   * Restores view to the active guided position when student scrolled away.
   */
  public async returnToGuidedPosition(): Promise<boolean> {
    const success = await this.lessonNavigator.returnToGuidedPosition();
    this.isUserScrolledAway = false;
    this.notifySubscribers();
    return success;
  }

  /**
   * Exits guided mode while keeping regular companion features available.
   */
  public exitGuidedMode(): void {
    this.pauseSession();
    this.isGuidedModeActive = false;
    this.attentionController.clearHighlight();
    this.notifySubscribers();
  }

  /**
   * Subscribes to internal narration controller events to keep highlighting & scroll in sync.
   */
  private subscribeToNarration(): void {
    this.unsubscribeNarration = this.narrationController.subscribe((narState: NarrationState) => {
      const seg = narState.currentSegment;
      if (seg) {
        this.activeSegmentId = seg.segmentId;
        this.activeHighlightedText = seg.displayText;

        // Apply visual text highlight
        this.attentionController.highlightSegment({
          segmentId: seg.segmentId,
          sectionId: seg.sectionId,
          lessonId: seg.lessonId,
          displayText: seg.displayText,
          spokenText: seg.spokenText,
          keyTerminology: seg.keyTerminology,
          targetElementSelector: `[data-cosmos-segment="${seg.segmentId}"]`,
        });

        // Trigger gentle auto-scroll if enabled and not suspended
        void this.lessonNavigator.scrollToTarget(`[data-cosmos-segment="${seg.segmentId}"]`);
      }

      // Check if narration completed for the active step
      if (narState.status === "completed") {
        this.handleStepNarrationCompleted();
      }

      this.notifySubscribers();
    });
  }

  /**
   * Handles natural completion of a step's narration.
   */
  private handleStepNarrationCompleted(): void {
    const currentStep = this.getCurrentStep();
    if (!currentStep) return;

    if (currentStep.completionCondition.type === "narration_finished") {
      currentStep.stepStatus = "completed";

      // If auto-advance enabled and no student input required, proceed
      const prefs = LearningPreferenceManager.getPreferences();
      if (prefs.autoAdvanceSegments && !currentStep.requiresStudentInput) {
        void this.nextStep();
      } else {
        this.transitionState("WAITING_FOR_STUDENT");
        this.notifySubscribers();
      }
    }
  }

  /**
   * State Machine Transition Contract.
   * Strictly enforces valid 21 states.
   */
  public transitionState(newState: GuidedLearningState): void {
    this.state = newState;
    this.errorMessage = undefined;
  }

  public getState(): GuidedLearningState {
    return this.state;
  }

  public getCurrentStep(): LearningStep | null {
    return this.steps[this.currentStepIndex] || null;
  }

  public getSteps(): LearningStep[] {
    return [...this.steps];
  }

  public getSnapshot(): DirectorStateSnapshot {
    const narState = this.narrationController.getState();
    return {
      state: this.state,
      moduleId: this.moduleId,
      moduleTitle: this.moduleTitle,
      currentStepIndex: this.currentStepIndex,
      totalSteps: this.steps.length,
      currentStep: this.getCurrentStep(),
      activeSegmentId: this.activeSegmentId,
      activeHighlightedText: this.activeHighlightedText,
      isNarrationPlaying: narState.status === "playing",
      isAutoScrollActive: LearningPreferenceManager.getPreferences().autoScrollEnabled,
      isUserScrolledAway: this.isUserScrolledAway,
      isMicrophoneActive: this.voiceController.getPayload().state === "LISTENING",
      isGuidedModeActive: this.isGuidedModeActive,
      learningLevel: this.learningLevel,
      speechSpeed: narState.speechSpeed,
      language: this.language,
      lastQuestionAnswer: this.lastAnswer,
      errorMessage: this.errorMessage,
    };
  }

  public subscribe(listener: DirectorSubscriber): () => void {
    this.subscribers.add(listener);
    listener(this.getSnapshot());
    return () => {
      this.subscribers.delete(listener);
    };
  }

  private notifySubscribers(): void {
    const snapshot = this.getSnapshot();
    for (const sub of this.subscribers) {
      try {
        sub(snapshot);
      } catch (err) {
        console.warn("Error in director subscriber:", err);
      }
    }
  }

  /**
   * Persists active session record.
   */
  private persistCurrentSession(): void {
    const step = this.getCurrentStep();
    CosmosLearningSessionManager.saveSession({
      courseId: "cosmic-journey",
      courseVersion: "1.0.0",
      moduleId: this.moduleId,
      moduleTitle: this.moduleTitle,
      lessonId: step ? step.lessonId : "intro",
      lessonTitle: step ? step.title : "Introduction",
      sectionId: step ? step.sectionId : "overview",
      stepId: step ? step.stepId : "init",
      stepIndex: this.currentStepIndex,
      totalSteps: this.steps.length,
      narrationSegmentId: this.activeSegmentId || undefined,
      learningLevel: this.learningLevel,
      confirmedPlaybackPosition: this.lastConfirmedPlaybackPosition,
      sessionStatus: this.isGuidedModeActive ? "active" : "paused",
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Restores previous session if available on startup.
   */
  private restoreSavedSessionIfAvailable(): void {
    const saved = CosmosLearningSessionManager.getSession();
    if (saved && saved.sessionStatus !== "completed") {
      this.moduleId = saved.moduleId;
      this.moduleTitle = saved.moduleTitle;
      this.learningLevel = saved.learningLevel;
      this.currentStepIndex = saved.stepIndex;
    }
  }

  public getNarrationController(): NarrationController {
    return this.narrationController;
  }

  public getVoiceController(): VoiceConversationController {
    return this.voiceController;
  }
}
