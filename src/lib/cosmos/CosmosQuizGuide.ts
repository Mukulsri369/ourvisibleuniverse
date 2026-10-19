/**
 * COSMOS Interactive Quiz & Assessment Guide
 * Project: Our Visible Universe Academy
 * Scope: COSMOS 2.0 Phase 2 — Voice-Based Answers, Quizzes & Assessments
 *
 * Coordinates:
 * - NAVIGATING_TO_QUIZ: Scrolling to the module assessment region
 * - READING_QUESTION: Reading questions and options (A, B, C, D) aloud and highlighting the question card
 * - WAITING_FOR_ANSWER: Waiting for real student input (click or spoken choice) — NEVER auto-completes
 * - CONFIRMING_ANSWER: Confirming the student's selected option before locking/submitting
 * - SUBMITTING_ANSWER: Triggering authoritative server evaluation
 * - REVIEWING_FEEDBACK: Explaining graded scientific feedback and guiding remediation or module completion
 *
 * ACADEMIC INTEGRITY INVARIANT:
 * In "official" assessment mode, COSMOS reads questions and accepts voice/click answers,
 * but strictly refuses to give hints or reveal answers before submission.
 */

import type { AssessmentResult, ClientAssessmentQuestion } from "../academy/assessment-types";
import { CosmosAttentionController } from "./CosmosAttentionController";
import { CosmosLessonNavigator } from "./CosmosLessonNavigator";
import type {
  GuidedLearningState,
  GuidedQuizQuestionState,
  GuidedQuizSessionState,
} from "./learning-director-types";

export interface QuizRuntimeBridge {
  moduleId: string;
  mode: "official" | "practice";
  passingScorePct: number;
  getQuestions: () => ClientAssessmentQuestion[];
  getSelectedAnswers: () => Record<string, number>;
  selectOption: (questionId: string, optionIndex: number) => void;
  submitAssessment: () => Promise<void>;
  retryAssessment: () => void;
  switchMode?: (mode: "official" | "practice") => void;
}

export interface QuizGuideCallbacks {
  onTransitionDirectorState: (newState: GuidedLearningState) => void;
  onSpeakPrompt: (spokenText: string, displayText?: string) => Promise<void>;
  onQuizPassedAndVerified: (result: AssessmentResult) => void;
  onQuizStateUpdated: (state: GuidedQuizSessionState | null) => void;
}

export class CosmosQuizGuide {
  private static instance: CosmosQuizGuide | null = null;

  private bridges = new Map<string, QuizRuntimeBridge>();
  private activeModuleId = "01";
  private sessionState: GuidedQuizSessionState | null = null;
  private callbacks: QuizGuideCallbacks | null = null;
  private lessonNavigator = CosmosLessonNavigator.getInstance();
  private attentionController = CosmosAttentionController.getInstance();

  public static getInstance(): CosmosQuizGuide {
    if (!this.instance) {
      this.instance = new CosmosQuizGuide();
    }
    return this.instance;
  }

  public bindDirectorCallbacks(callbacks: QuizGuideCallbacks): void {
    this.callbacks = callbacks;
  }

  /**
   * Registers a mounted UnifiedAssessmentEngine component so COSMOS can read its questions,
   * highlight questions, select options on voice command, and submit when confirmed.
   */
  public registerQuizBridge(bridge: QuizRuntimeBridge): () => void {
    this.bridges.set(bridge.moduleId, bridge);
    this.syncSessionFromBridge(bridge.moduleId);
    return () => {
      if (this.bridges.get(bridge.moduleId) === bridge) {
        this.bridges.delete(bridge.moduleId);
      }
    };
  }

  public syncSessionFromBridge(moduleId: string): GuidedQuizSessionState | null {
    const bridge = this.bridges.get(moduleId);
    if (!bridge) return this.sessionState;

    const rawQuestions = bridge.getQuestions();
    const selectedAnswers = bridge.getSelectedAnswers();

    const mappedQuestions: GuidedQuizQuestionState[] = rawQuestions.map((q, idx) => {
      const prevQuestion = this.sessionState?.questions.find((pq) => pq.questionId === q.id);
      return {
        questionId: q.id,
        questionIndex: idx,
        totalQuestions: rawQuestions.length,
        questionText: q.questionText,
        options: q.options,
        selectedOptionIndex: selectedAnswers[q.id],
        isConfirmed:
          prevQuestion?.isConfirmed && prevQuestion.selectedOptionIndex === selectedAnswers[q.id]
            ? true
            : false,
        relevantLessonId: q.relevantLessonId,
      };
    });

    const currentActiveIdx =
      this.sessionState &&
      this.sessionState.moduleId === moduleId &&
      this.sessionState.activeQuestionIndex < mappedQuestions.length
        ? this.sessionState.activeQuestionIndex
        : 0;

    this.sessionState = {
      moduleId,
      mode: bridge.mode,
      questions: mappedQuestions,
      activeQuestionIndex: currentActiveIdx,
      pendingConfirmationOption: mappedQuestions[currentActiveIdx]?.selectedOptionIndex,
      isSubmitted: this.sessionState?.moduleId === moduleId ? this.sessionState.isSubmitted : false,
      passed: this.sessionState?.moduleId === moduleId ? this.sessionState.passed : undefined,
      scorePercentage:
        this.sessionState?.moduleId === moduleId ? this.sessionState.scorePercentage : undefined,
      passingScorePct: bridge.passingScorePct,
      feedbackSummary:
        this.sessionState?.moduleId === moduleId ? this.sessionState.feedbackSummary : undefined,
      lastHintText:
        this.sessionState?.moduleId === moduleId ? this.sessionState.lastHintText : undefined,
    };

    this.callbacks?.onQuizStateUpdated(this.getSessionState());
    return this.getSessionState();
  }

  /**
   * Starts guided quiz navigation, scrolls to the assessment, reads Question 1,
   * and transitions to WAITING_FOR_ANSWER.
   */
  public async startGuidedQuiz(
    moduleId: string,
    targetSelector?: string,
  ): Promise<GuidedQuizSessionState | null> {
    this.activeModuleId = moduleId;
    this.callbacks?.onTransitionDirectorState("NAVIGATING_TO_QUIZ");

    const selector =
      targetSelector ||
      `#module-${moduleId}-quiz, [role="region"][aria-label="Module Knowledge Assessment"]`;
    await this.lessonNavigator.scrollToTarget(selector, {
      offsetY: 90,
      behavior: "smooth",
    });

    this.syncSessionFromBridge(moduleId);

    if (this.sessionState && this.sessionState.questions.length > 0) {
      this.sessionState.activeQuestionIndex = 0;
      await this.readActiveQuestionAloud();
    } else {
      this.callbacks?.onTransitionDirectorState("WAITING_FOR_ANSWER");
      if (this.callbacks?.onSpeakPrompt) {
        await this.callbacks.onSpeakPrompt(
          "We have arrived at the Module Knowledge Assessment. Select or speak your answers for each question, and I will guide you through verification.",
          "Module Knowledge Assessment Ready",
        );
      }
    }

    return this.getSessionState();
  }

  /**
   * Reads the currently active question and its options (Option A, B, C, D) aloud,
   * highlights the question card in the DOM, and enters WAITING_FOR_ANSWER.
   */
  public async readActiveQuestionAloud(questionIndex?: number): Promise<void> {
    this.syncSessionFromBridge(this.activeModuleId);
    if (!this.sessionState || this.sessionState.questions.length === 0) return;

    if (
      questionIndex !== undefined &&
      questionIndex >= 0 &&
      questionIndex < this.sessionState.questions.length
    ) {
      this.sessionState.activeQuestionIndex = questionIndex;
    }

    const q = this.sessionState.questions[this.sessionState.activeQuestionIndex];
    if (!q) return;

    this.callbacks?.onTransitionDirectorState("READING_QUESTION");

    const questionSelector = `[data-cosmos-question-id="${q.questionId}"], [data-cosmos-question-index="${q.questionIndex}"]`;
    await this.lessonNavigator.scrollToTarget(questionSelector, {
      offsetY: 110,
      behavior: "smooth",
    });

    const optionsFormatted = q.options
      .map((opt, idx) => `Option ${String.fromCharCode(65 + idx)}: ${opt}.`)
      .join(" ");

    const spokenPrompt = `Question ${q.questionIndex + 1} of ${q.totalQuestions}: ${q.questionText} ${optionsFormatted} You can click your answer or say Option A, B, C, or D.`;

    this.attentionController.highlightSegment({
      segmentId: `quiz_q_${q.questionId}`,
      sectionId: "knowledge-check",
      lessonId: "module-quiz",
      displayText: `Q${q.questionIndex + 1}: ${q.questionText}`,
      spokenText: spokenPrompt,
      targetElementSelector: questionSelector,
    });

    if (this.callbacks?.onSpeakPrompt) {
      await this.callbacks.onSpeakPrompt(
        spokenPrompt,
        `Q${q.questionIndex + 1}: ${q.questionText}`,
      );
    }

    // Enter WAITING_FOR_ANSWER — never advance without student participation
    this.callbacks?.onTransitionDirectorState("WAITING_FOR_ANSWER");
    this.callbacks?.onQuizStateUpdated(this.getSessionState());
  }

  /**
   * Handles when a student selects an option (via voice or UI click).
   * Transitions to CONFIRMING_ANSWER and prompts for confirmation.
   */
  public async selectOptionForActiveQuestion(
    optionIndex: number,
    source: "voice" | "ui" = "ui",
  ): Promise<boolean> {
    this.syncSessionFromBridge(this.activeModuleId);
    if (!this.sessionState || this.sessionState.questions.length === 0) return false;

    const q = this.sessionState.questions[this.sessionState.activeQuestionIndex];
    if (!q || optionIndex < 0 || optionIndex >= q.options.length) return false;

    const bridge = this.bridges.get(this.activeModuleId);
    if (bridge) {
      bridge.selectOption(q.questionId, optionIndex);
    }

    q.selectedOptionIndex = optionIndex;
    q.isConfirmed = source === "ui"; // UI clicks can still be confirmed or immediately advanced
    this.sessionState.pendingConfirmationOption = optionIndex;

    const letter = String.fromCharCode(65 + optionIndex);
    const optionText = q.options[optionIndex];

    this.callbacks?.onTransitionDirectorState("CONFIRMING_ANSWER");
    this.callbacks?.onQuizStateUpdated(this.getSessionState());

    if (source === "voice" && this.callbacks?.onSpeakPrompt) {
      const confirmPrompt = `You selected Option ${letter}: "${optionText}". Say "confirm" to lock in this answer, or choose a different option.`;
      await this.callbacks.onSpeakPrompt(confirmPrompt, confirmPrompt);
    }

    return true;
  }

  /**
   * Matches a spoken transcript against Option A/B/C/D or option text.
   */
  public parseSpokenOptionChoice(transcript: string): number | null {
    this.syncSessionFromBridge(this.activeModuleId);
    const raw = (transcript || "").trim().toLowerCase();
    const clean = raw.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").trim();

    if (
      clean === "a" ||
      clean === "option a" ||
      clean === "choice a" ||
      clean === "answer a" ||
      clean === "letter a" ||
      clean === "first option" ||
      clean === "the first one" ||
      clean === "option 1" ||
      clean === "number 1"
    ) {
      return 0;
    }

    if (
      clean === "b" ||
      clean === "option b" ||
      clean === "choice b" ||
      clean === "answer b" ||
      clean === "letter b" ||
      clean === "second option" ||
      clean === "the second one" ||
      clean === "option 2" ||
      clean === "number 2"
    ) {
      return 1;
    }

    if (
      clean === "c" ||
      clean === "option c" ||
      clean === "choice c" ||
      clean === "answer c" ||
      clean === "letter c" ||
      clean === "third option" ||
      clean === "the third one" ||
      clean === "option 3" ||
      clean === "number 3"
    ) {
      return 2;
    }

    if (
      clean === "d" ||
      clean === "option d" ||
      clean === "choice d" ||
      clean === "answer d" ||
      clean === "letter d" ||
      clean === "fourth option" ||
      clean === "the fourth one" ||
      clean === "option 4" ||
      clean === "number 4"
    ) {
      return 3;
    }

    // Match spoken words against the active question's option text
    if (this.sessionState) {
      const q = this.sessionState.questions[this.sessionState.activeQuestionIndex];
      if (q && clean.length >= 4) {
        const idx = q.options.findIndex(
          (opt) =>
            opt.toLowerCase().includes(clean) || clean.includes(opt.toLowerCase().slice(0, 18)),
        );
        if (idx !== -1) return idx;
      }
    }

    return null;
  }

  /**
   * Confirms the currently selected option for the active question.
   * Moves to the next unanswered question, or submits if all questions are answered.
   */
  public async confirmActiveAnswer(): Promise<void> {
    this.syncSessionFromBridge(this.activeModuleId);
    if (!this.sessionState || this.sessionState.questions.length === 0) return;

    const q = this.sessionState.questions[this.sessionState.activeQuestionIndex];
    if (!q || q.selectedOptionIndex === undefined) {
      if (this.callbacks?.onSpeakPrompt) {
        await this.callbacks.onSpeakPrompt(
          "Please select Option A, B, C, or D first before confirming.",
          "Select an option first.",
        );
      }
      return;
    }

    q.isConfirmed = true;
    this.sessionState.pendingConfirmationOption = undefined;

    // Check if there is a next unanswered question
    const nextIdx = this.sessionState.questions.findIndex(
      (item, idx) =>
        idx > this.sessionState!.activeQuestionIndex && item.selectedOptionIndex === undefined,
    );
    const anyUnansweredIdx = this.sessionState.questions.findIndex(
      (item) => item.selectedOptionIndex === undefined,
    );

    const targetNextIdx = nextIdx !== -1 ? nextIdx : anyUnansweredIdx;

    if (targetNextIdx !== -1) {
      this.sessionState.activeQuestionIndex = targetNextIdx;
      this.callbacks?.onQuizStateUpdated(this.getSessionState());
      await this.readActiveQuestionAloud(targetNextIdx);
    } else {
      // All questions answered! Submit assessment
      await this.submitGuidedQuiz();
    }
  }

  /**
   * Submits the completed quiz to the authoritative server evaluation.
   */
  public async submitGuidedQuiz(): Promise<void> {
    this.syncSessionFromBridge(this.activeModuleId);
    const bridge = this.bridges.get(this.activeModuleId);
    if (!bridge || !this.sessionState) return;

    const allAnswered = this.sessionState.questions.every(
      (q) => q.selectedOptionIndex !== undefined,
    );
    if (!allAnswered) {
      const firstMissing = this.sessionState.questions.findIndex(
        (q) => q.selectedOptionIndex === undefined,
      );
      if (firstMissing !== -1) {
        await this.readActiveQuestionAloud(firstMissing);
      }
      return;
    }

    this.callbacks?.onTransitionDirectorState("SUBMITTING_ANSWER");
    this.callbacks?.onQuizStateUpdated(this.getSessionState());

    await bridge.submitAssessment();
  }

  /**
   * Called by UnifiedAssessmentEngine when server grading completes.
   * Transitions to REVIEWING_FEEDBACK and explains the outcome.
   */
  public async handleAssessmentGraded(moduleId: string, result: AssessmentResult): Promise<void> {
    this.syncSessionFromBridge(moduleId);
    if (this.sessionState) {
      this.sessionState.isSubmitted = true;
      this.sessionState.passed = result.passed;
      this.sessionState.scorePercentage = result.percentage;
      this.sessionState.feedbackSummary = result.passed
        ? `Congratulations! You scored ${result.percentage}% (${result.score}/${result.totalPoints}), passing the ${result.passingScorePct}% requirement.`
        : `You scored ${result.percentage}% (${result.score}/${result.totalPoints}). A score of ${result.passingScorePct}% is required for verification. Let's review the scientific explanations and try again.`;
    }

    this.callbacks?.onTransitionDirectorState("REVIEWING_FEEDBACK");
    this.callbacks?.onQuizStateUpdated(this.getSessionState());

    const firstFeedback = result.feedback[0];
    const explanationSnippet = firstFeedback ? ` For Question 1: ${firstFeedback.explanation}` : "";

    const spokenFeedback = result.passed
      ? `Assessment passed with a score of ${result.percentage} percent!${explanationSnippet}`
      : `You scored ${result.percentage} percent. You need ${result.passingScorePct} percent to pass.${explanationSnippet} Review the explanations below and click Retry Assessment when you are ready.`;

    if (this.callbacks?.onSpeakPrompt) {
      await this.callbacks.onSpeakPrompt(spokenFeedback, this.sessionState?.feedbackSummary);
    }

    if (result.passed) {
      this.callbacks?.onQuizPassedAndVerified(result);
    }
  }

  /**
   * Provides a conceptual hint in Practice Mode, or enforces Academic Integrity in Official Mode.
   */
  public async requestQuestionHint(): Promise<string> {
    this.syncSessionFromBridge(this.activeModuleId);
    if (!this.sessionState || this.sessionState.questions.length === 0) {
      return "Navigate to a question to request conceptual guidance.";
    }

    // ACADEMIC INTEGRITY GUARDRAIL
    if (this.sessionState.mode === "official") {
      const integrityMsg =
        "This is an Official Certification Assessment. To uphold academic integrity, I can read the question and options aloud or record your chosen answer, but I cannot provide hints or reveal answers before submission. You can switch to Practice Mode anytime for guided conceptual hints.";
      this.sessionState.lastHintText = integrityMsg;
      this.callbacks?.onQuizStateUpdated(this.getSessionState());
      if (this.callbacks?.onSpeakPrompt) {
        await this.callbacks.onSpeakPrompt(integrityMsg, integrityMsg);
      }
      return integrityMsg;
    }

    const q = this.sessionState.questions[this.sessionState.activeQuestionIndex];
    const hint = `Practice Hint for Question ${q.questionIndex + 1}: Recall the core physical principle in section "${q.relevantLessonId || "Core Lesson"}". Consider how the physical quantities in "${q.questionText.slice(0, 60)}..." relate to conservation laws and observational evidence.`;
    this.sessionState.lastHintText = hint;
    this.callbacks?.onQuizStateUpdated(this.getSessionState());

    if (this.callbacks?.onSpeakPrompt) {
      await this.callbacks.onSpeakPrompt(hint, hint);
    }
    return hint;
  }

  public getSessionState(): GuidedQuizSessionState | null {
    if (!this.sessionState) return null;
    return {
      ...this.sessionState,
      questions: this.sessionState.questions.map((q) => ({ ...q })),
    };
  }
}

export { CosmosQuizGuide as CosmosAssessmentGuide };
