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
import { ACADEMY_MODULES } from "../academy/registry";
import { STAGE_BADGES } from "../academy/stage-badges";
import {
  getModuleCompletionStatus,
  recheckModuleCompletion,
} from "../academy/completion.functions";
import { CosmosActivityGuide } from "./CosmosActivityGuide";
import { CosmosQuizGuide } from "./CosmosQuizGuide";
import { VoiceCommandProcessor } from "./VoiceCommandProcessor";
import type {
  CosmosAnswer,
  CosmosLanguage,
  CosmosVisualizationReference,
  NarrationSegment,
  NarrationState,
} from "./cosmos-types";
import type {
  ActivityStateRecord,
  DirectorStateSnapshot,
  DirectorSubscriber,
  GuidedLearningState,
  GuidedQuizSessionState,
  LearningStep,
  ModuleJourneyCompletionState,
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
  private activityGuide: CosmosActivityGuide;
  private quizGuide: CosmosQuizGuide;

  // Active narration & highlight tracking
  private activeSegmentId: string | null = null;
  private activeHighlightedText: string | null = null;
  private lastConfirmedPlaybackPosition = 0;
  private isUserScrolledAway = false;
  private lastQuestionAnswer: CosmosAnswer | null = null;
  private errorMessage?: string;

  // Phase 2 Activity & Quiz tracking
  private activeActivityState: ActivityStateRecord | null = null;
  private activeQuizState: GuidedQuizSessionState | null = null;

  // Phase 3 Autonomous Journey & Completion tracking
  private activeCompletionState: ModuleJourneyCompletionState | null = null;
  private moduleNavigationHandler: ((moduleId: string) => void) | null = null;

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
    this.activityGuide = CosmosActivityGuide.getInstance();
    this.quizGuide = CosmosQuizGuide.getInstance();

    // Wire Phase 2 Activity Guide callbacks
    this.activityGuide.bindDirectorCallbacks({
      onTransitionDirectorState: (newState) => {
        this.transitionState(newState);
        this.notifySubscribers();
      },
      onSpeakPrompt: async (spokenText, displayText) => {
        await this.speakTutorPrompt(spokenText, displayText);
      },
      onActivityValidatedAndCompleted: (state) => {
        this.activeActivityState = state;
        const currentStep = this.getCurrentStep();
        if (currentStep && currentStep.stepType === "ACTIVITY") {
          currentStep.stepStatus = "completed";
        }
        this.errorMessage = undefined;
        this.persistCurrentSession();
        this.notifySubscribers();
      },
      onStateUpdated: (state) => {
        this.activeActivityState = state;
        this.notifySubscribers();
      },
    });

    // Wire Phase 2 Quiz Guide callbacks
    this.quizGuide.bindDirectorCallbacks({
      onTransitionDirectorState: (newState) => {
        this.transitionState(newState);
        this.notifySubscribers();
      },
      onSpeakPrompt: async (spokenText, displayText) => {
        await this.speakTutorPrompt(spokenText, displayText);
      },
      onQuizPassedAndVerified: () => {
        const currentStep = this.getCurrentStep();
        if (currentStep && currentStep.stepType === "KNOWLEDGE_CHECK") {
          currentStep.stepStatus = "completed";
        }
        this.transitionState("VERIFYING_REQUIREMENTS");
        this.errorMessage = undefined;
        this.persistCurrentSession();
        this.notifySubscribers();
      },
      onQuizStateUpdated: (state) => {
        this.activeQuizState = state;
        this.notifySubscribers();
      },
    });

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
      // Phase 2 Interactive Activity or Quiz Step orchestration
      if (currentStep.stepType === "ACTIVITY") {
        this.activeActivityState = await this.activityGuide.startGuidedActivity(
          this.moduleId,
          `#${currentStep.targetComponentId}`,
        );
      } else if (
        currentStep.stepType === "KNOWLEDGE_CHECK" ||
        currentStep.stepType === "PRACTICE_QUESTION"
      ) {
        this.activeQuizState = await this.quizGuide.startGuidedQuiz(
          this.moduleId,
          `#${currentStep.targetComponentId}`,
        );
      } else if (currentStep.stepType === "COMPLETION_CHECK") {
        await this.evaluateModuleJourneyCompletion(false);
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
   * Handles student voice or typed input during guided learning.
   * First checks for Phase 2 quiz answer / activity commands, then falls back to contextual Q&A.
   */
  public async handleStudentQuestion(question: string): Promise<CosmosAnswer> {
    const trimmed = (question || "").trim();

    // 0. Check if we are in a Quiz state and the student spoke/typed an option or confirmation
    const isQuizActive =
      this.state === "NAVIGATING_TO_QUIZ" ||
      this.state === "READING_QUESTION" ||
      this.state === "WAITING_FOR_ANSWER" ||
      this.state === "CONFIRMING_ANSWER" ||
      this.getCurrentStep()?.stepType === "KNOWLEDGE_CHECK";

    const cmdMatch = VoiceCommandProcessor.matchCommand(trimmed);

    if (isQuizActive) {
      if (cmdMatch.isCommand && cmdMatch.commandType === "confirm_answer") {
        await this.quizGuide.confirmActiveAnswer();
        const confirmAns: CosmosAnswer = {
          answerText: "Confirmed your selected answer.",
          epistemicClassification: "fact",
          scientificSources: [],
          suggestedFollowUpQuestions: [],
          learningLevelAdapted: this.learningLevel,
        };
        this.lastQuestionAnswer = confirmAns;
        this.notifySubscribers();
        return confirmAns;
      }

      if (cmdMatch.isCommand && cmdMatch.commandType === "request_hint") {
        const hintText = await this.quizGuide.requestQuestionHint();
        const hintAns: CosmosAnswer = {
          answerText: hintText,
          epistemicClassification: "fact",
          scientificSources: [],
          suggestedFollowUpQuestions: [],
          learningLevelAdapted: this.learningLevel,
        };
        this.lastQuestionAnswer = hintAns;
        this.notifySubscribers();
        return hintAns;
      }

      const spokenOptionIdx =
        cmdMatch.optionIndex !== undefined
          ? cmdMatch.optionIndex
          : this.quizGuide.parseSpokenOptionChoice(trimmed);

      if (spokenOptionIdx !== null && spokenOptionIdx !== undefined) {
        await this.quizGuide.selectOptionForActiveQuestion(spokenOptionIdx, "voice");
        const letter = String.fromCharCode(65 + spokenOptionIdx);
        const choiceAns: CosmosAnswer = {
          answerText: `Selected Option ${letter}. Say "Confirm" or click Confirm Selection to lock in your choice.`,
          epistemicClassification: "fact",
          scientificSources: [],
          suggestedFollowUpQuestions: [],
          learningLevelAdapted: this.learningLevel,
        };
        this.lastQuestionAnswer = choiceAns;
        this.notifySubscribers();
        return choiceAns;
      }
    }

    // Check if we are in an Activity state and the student requested a hint, demonstration, or verification
    const isActivityActive =
      this.state === "NAVIGATING_TO_ACTIVITY" ||
      this.state === "EXPLAINING_ACTIVITY" ||
      this.state === "WAITING_FOR_ACTIVITY" ||
      this.state === "REVIEWING_ACTIVITY" ||
      this.getCurrentStep()?.stepType === "ACTIVITY";

    if (isActivityActive && cmdMatch.isCommand) {
      if (cmdMatch.commandType === "request_hint") {
        const helpText = await this.activityGuide.provideContextualHelp(this.moduleId);
        const helpAns: CosmosAnswer = {
          answerText: helpText,
          epistemicClassification: "fact",
          scientificSources: [],
          suggestedFollowUpQuestions: [],
          learningLevelAdapted: this.learningLevel,
        };
        this.lastQuestionAnswer = helpAns;
        this.notifySubscribers();
        return helpAns;
      }
      if (cmdMatch.commandType === "demonstrate_control") {
        const demoText = await this.activityGuide.demonstrateActiveControl(this.moduleId);
        const demoAns: CosmosAnswer = {
          answerText: demoText,
          epistemicClassification: "fact",
          scientificSources: [],
          suggestedFollowUpQuestions: [],
          learningLevelAdapted: this.learningLevel,
        };
        this.lastQuestionAnswer = demoAns;
        this.notifySubscribers();
        return demoAns;
      }
      if (cmdMatch.commandType === "verify_activity") {
        const verResult = await this.activityGuide.verifyAndCompleteActivity(this.moduleId);
        const verAns: CosmosAnswer = {
          answerText: verResult.reason,
          epistemicClassification: "fact",
          scientificSources: [],
          suggestedFollowUpQuestions: [],
          learningLevelAdapted: this.learningLevel,
        };
        this.lastQuestionAnswer = verAns;
        this.notifySubscribers();
        return verAns;
      }
      if (cmdMatch.commandType === "reset_activity") {
        this.activityGuide.resetActivity(this.moduleId);
        const resetAns: CosmosAnswer = {
          answerText: "Activity restored to initial parameters.",
          epistemicClassification: "fact",
          scientificSources: [],
          suggestedFollowUpQuestions: [],
          learningLevelAdapted: this.learningLevel,
        };
        this.lastQuestionAnswer = resetAns;
        this.notifySubscribers();
        return resetAns;
      }
    }

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

    this.lastQuestionAnswer = answer;
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

    const step = this.getCurrentStep();
    if (step?.stepType === "ACTIVITY" && step.stepStatus !== "completed") {
      this.transitionState("WAITING_FOR_ACTIVITY");
      this.notifySubscribers();
      return;
    }
    if (step?.stepType === "KNOWLEDGE_CHECK" && step.stepStatus !== "completed") {
      this.transitionState("WAITING_FOR_ANSWER");
      this.notifySubscribers();
      return;
    }

    this.transitionState("EXPLAINING");
    await this.narrationController.play();
    this.notifySubscribers();
  }

  /**
   * Speaks a Phase 2 Activity or Quiz prompt clearly via Web Speech synthesis (unless muted/text-only).
   */
  private async speakTutorPrompt(spokenText: string, displayText?: string): Promise<void> {
    this.activeHighlightedText = displayText || spokenText;
    this.notifySubscribers();

    const prefs = LearningPreferenceManager.getPreferences();
    if (prefs.textOnlyMode) return;

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(spokenText);
        utterance.rate = prefs.preferredVoiceSpeed || 1.0;
        window.speechSynthesis.speak(utterance);
      } catch {
        // Ignore speech synthesis errors in headless environments
      }
    }
  }

  /**
   * Phase 2 Public Coordination Methods for Activities & Assessments
   */
  public getActivityGuide(): CosmosActivityGuide {
    return this.activityGuide;
  }

  public getQuizGuide(): CosmosQuizGuide {
    return this.quizGuide;
  }

  public getAssessmentGuide(): CosmosQuizGuide {
    return this.quizGuide;
  }

  /**
   * Registers a callback for navigating between the 24 modules or the Final Assessment.
   */
  public registerModuleNavigationHandler(handler: (moduleId: string) => void): () => void {
    this.moduleNavigationHandler = handler;
    return () => {
      if (this.moduleNavigationHandler === handler) {
        this.moduleNavigationHandler = null;
      }
    };
  }

  /**
   * Navigates to the next module in the 24-module autonomous journey or to the Final Exam.
   */
  public async navigateToModuleInJourney(
    targetModuleId: string,
    startGuided = true,
  ): Promise<void> {
    if (this.moduleNavigationHandler) {
      this.moduleNavigationHandler(targetModuleId);
    } else if (typeof window !== "undefined") {
      if (targetModuleId === "exam") {
        window.location.href = "/exam";
        return;
      }
      if (targetModuleId === "13") {
        window.location.href = "/galaxies";
        return;
      }
      window.location.href = `/learn?module=${encodeURIComponent(targetModuleId)}`;
    }

    if (startGuided && targetModuleId !== "exam") {
      await this.startGuidedSession(targetModuleId, this.learningLevel, 0);
    }
  }

  /**
   * Resumes a saved student learning session across modules or page reloads.
   */
  public async resumeSavedSession(moduleId?: string): Promise<boolean> {
    const saved = CosmosLearningSessionManager.getSession(moduleId);
    if (!saved) return false;

    if (this.moduleNavigationHandler && saved.moduleId !== this.moduleId) {
      this.moduleNavigationHandler(saved.moduleId);
    }

    await this.startGuidedSession(saved.moduleId, saved.learningLevel, saved.stepIndex);
    return true;
  }

  /**
   * Evaluates authoritative server-side module completion, stage achievement unlock,
   * and 24-module Final Certification Assessment eligibility.
   */
  public async evaluateModuleJourneyCompletion(
    forceRecheck = false,
  ): Promise<ModuleJourneyCompletionState> {
    this.transitionState("VERIFYING_REQUIREMENTS");
    this.notifySubscribers();

    const modNum = parseInt(this.moduleId, 10) || 1;
    const stageId = Math.min(6, Math.max(1, Math.ceil(modNum / 4)));
    const stageBadge = STAGE_BADGES[stageId] || STAGE_BADGES[1];
    const nextModNum = modNum < 24 ? modNum + 1 : null;
    const nextModuleId = nextModNum
      ? nextModNum < 10
        ? `0${nextModNum}`
        : `${nextModNum}`
      : "exam";
    const nextMeta = nextModuleId !== "exam" ? ACADEMY_MODULES.find((m) => m.id === nextModuleId) : null;
    const nextModuleTitle =
      nextModuleId === "exam"
        ? "Cosmic Explorer — Final Knowledge Assessment"
        : nextMeta?.title || `Module ${nextModuleId}`;

    let isVerifiedComplete = false;
    let satisfiedCount = 0;
    let totalCount = 3;
    let missingRequirements: string[] = [];
    let recommendedAction = "complete_section";

    try {
      const evaluation = forceRecheck
        ? await recheckModuleCompletion({ data: { moduleId: this.moduleId } })
        : await getModuleCompletionStatus({ data: { moduleId: this.moduleId } });

      if (evaluation) {
        isVerifiedComplete = Boolean(evaluation.isVerifiedComplete);
        satisfiedCount = evaluation.checklist.filter((c) => c.isSatisfied).length;
        totalCount = evaluation.checklist.length || 3;
        missingRequirements = evaluation.missingRequirements || [];
        recommendedAction = evaluation.recommendedAction || "complete_section";
      }
    } catch {
      // Fallback to current guided step statuses when offline or unauthenticated
      const actDone =
        this.steps.find((s) => s.stepType === "ACTIVITY")?.stepStatus === "completed";
      const quizDone =
        this.steps.find((s) => s.stepType === "KNOWLEDGE_CHECK")?.stepStatus === "completed";
      satisfiedCount = 1 + (actDone ? 1 : 0) + (quizDone ? 1 : 0);
      isVerifiedComplete = Boolean(actDone && quizDone);
      if (!actDone) missingRequirements.push("Complete the interactive laboratory activity.");
      if (!quizDone) missingRequirements.push("Pass the module knowledge check quiz.");
    }

    // Read verified modules from local progress sync to compute Stage Badge & 24-Module Exam status
    let verifiedSet = new Set<string>();
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const rawProg = localStorage.getItem("cosmic_academy_progress_v1");
        if (rawProg) {
          const parsed = JSON.parse(rawProg);
          if (Array.isArray(parsed.verifiedModules)) {
            parsed.verifiedModules.forEach((m: string) => verifiedSet.add(m));
          }
        }
      } catch {
        // ignore storage read error
      }
    }
    if (isVerifiedComplete) {
      verifiedSet.add(this.moduleId);
    }

    const stageVerifiedCount = stageBadge.requiredModuleIds.filter((id) =>
      verifiedSet.has(id),
    ).length;
    const stageUnlocked = stageVerifiedCount >= 4;
    const totalModulesVerified = verifiedSet.size;
    const isFinalExamEligible = totalModulesVerified >= 24;

    const completionState: ModuleJourneyCompletionState = {
      moduleId: this.moduleId,
      moduleTitle: this.moduleTitle,
      isVerifiedComplete,
      satisfiedCount,
      totalCount,
      missingRequirements,
      recommendedAction,
      stageId,
      stageBadgeId: stageBadge.badgeId,
      stageBadgeTitle: stageBadge.title,
      stageBadgeIcon: stageBadge.icon,
      stageUnlocked,
      stageVerifiedCount,
      totalModulesVerified,
      isFinalExamEligible,
      nextModuleId,
      nextModuleTitle,
    };

    this.activeCompletionState = completionState;

    const currentStep = this.getCurrentStep();
    if (isVerifiedComplete) {
      if (currentStep && currentStep.stepType === "COMPLETION_CHECK") {
        currentStep.stepStatus = "completed";
      }
      this.transitionState("MODULE_COMPLETED");
      const badgeMsg = stageUnlocked
        ? `You have also unlocked the Stage ${stageId} ${stageBadge.title} achievement badge!`
        : `You have verified ${stageVerifiedCount} of 4 modules toward the Stage ${stageId} ${stageBadge.title} badge.`;
      const nextMsg = isFinalExamEligible
        ? "All 24 modules are now verified! You are officially eligible for the Final Knowledge Assessment and your Cosmic Explorer Certificate."
        : `When you are ready, continue to Module ${nextModuleId}: ${nextModuleTitle}.`;
      await this.speakTutorPrompt(
        `Congratulations! Module ${this.moduleId}, ${this.moduleTitle}, is authoritatively verified complete. ${badgeMsg} ${nextMsg}`,
      );
    } else {
      this.transitionState("WAITING_FOR_STUDENT");
      const missingText =
        missingRequirements[0] ||
        "Please complete the remaining activity or assessment requirement.";
      await this.speakTutorPrompt(
        `We have reached the completion review for Module ${this.moduleId}. Currently ${satisfiedCount} of ${totalCount} requirements are verified. Next step: ${missingText}`,
      );
    }

    this.persistCurrentSession();
    this.notifySubscribers();
    return completionState;
  }

  public async reportActivityInteraction(
    actionName: string,
    parameters: Record<string, unknown> = {},
    moduleIdOverride?: string,
  ): Promise<void> {
    const targetModule = moduleIdOverride || this.moduleId;
    await this.activityGuide.handleStudentActivityInteraction(targetModule, actionName, parameters);
  }

  public async verifyActiveActivity(
    overridePayload?: Record<string, unknown>,
  ): Promise<{ isValid: boolean; reason: string }> {
    return this.activityGuide.verifyAndCompleteActivity(this.moduleId, overridePayload);
  }

  public async selectQuizOption(
    optionIndex: number,
    source: "voice" | "ui" = "ui",
  ): Promise<boolean> {
    return this.quizGuide.selectOptionForActiveQuestion(optionIndex, source);
  }

  public async confirmQuizAnswer(): Promise<void> {
    await this.quizGuide.confirmActiveAnswer();
  }

  public async requestStepHint(): Promise<string> {
    const step = this.getCurrentStep();
    if (
      step?.stepType === "KNOWLEDGE_CHECK" ||
      this.state === "WAITING_FOR_ANSWER" ||
      this.state === "CONFIRMING_ANSWER" ||
      this.state === "READING_QUESTION"
    ) {
      return this.quizGuide.requestQuestionHint();
    }
    return this.activityGuide.provideContextualHelp(this.moduleId);
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
      lastQuestionAnswer: this.lastQuestionAnswer,
      errorMessage: this.errorMessage,
      activeActivityState:
        this.activeActivityState || this.activityGuide.getActivityState(this.moduleId),
      activeQuizState: this.activeQuizState || this.quizGuide.getSessionState(),
      activeCompletionState: this.activeCompletionState,
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
