/**
 * COSMOS Input Coordinator
 * Project: Our Visible Universe Academy
 * Scope: Phase 1 Student Input & Navigation Coordination (Part 2 & Part 3)
 *
 * Coordinates student interactive commands (pause, resume, repeat, next/prev step),
 * and enforces strict pedagogical invariants:
 * INVARIANT: No automatic transition may skip an unresolved required student-input step.
 */

import type { GuidedLearningState, LearningStep } from "./learning-director-types";
import { VoiceCommandProcessor } from "./VoiceCommandProcessor";

export type StudentUtteranceIntent =
  | "OPTION_SELECT"
  | "CONFIRM_ANSWER"
  | "CHANGE_ANSWER"
  | "HINT_REQUEST"
  | "DEMONSTRATE_CONTROL"
  | "VERIFY_ACTIVITY"
  | "RESET_ACTIVITY"
  | "PAUSE"
  | "CONTINUE"
  | "REPEAT"
  | "GO_BACK"
  | "NEXT_STEP"
  | "QUESTION";

export interface ParsedStudentUtterance {
  intent: StudentUtteranceIntent;
  optionIndex?: number;
  rawTranscript: string;
}

export class CosmosInputCoordinator {
  private static instance: CosmosInputCoordinator | null = null;

  public static getInstance(): CosmosInputCoordinator {
    if (!this.instance) {
      this.instance = new CosmosInputCoordinator();
    }
    return this.instance;
  }

  /**
   * Parses a spoken or typed student utterance into a structured intent.
   */
  public parseUtterance(
    transcript: string,
    _currentState?: GuidedLearningState,
    _isAssessmentContext = false,
  ): ParsedStudentUtterance {
    const raw = (transcript || "").trim();
    const match = VoiceCommandProcessor.matchCommand(raw);

    if (match.isCommand && match.commandType) {
      switch (match.commandType) {
        case "select_option_a":
          return { intent: "OPTION_SELECT", optionIndex: 0, rawTranscript: raw };
        case "select_option_b":
          return { intent: "OPTION_SELECT", optionIndex: 1, rawTranscript: raw };
        case "select_option_c":
          return { intent: "OPTION_SELECT", optionIndex: 2, rawTranscript: raw };
        case "select_option_d":
          return { intent: "OPTION_SELECT", optionIndex: 3, rawTranscript: raw };
        case "confirm_answer":
          return { intent: "CONFIRM_ANSWER", rawTranscript: raw };
        case "change_answer":
          return { intent: "CHANGE_ANSWER", rawTranscript: raw };
        case "request_hint":
          return { intent: "HINT_REQUEST", rawTranscript: raw };
        case "demonstrate_control":
          return { intent: "DEMONSTRATE_CONTROL", rawTranscript: raw };
        case "verify_activity":
          return { intent: "VERIFY_ACTIVITY", rawTranscript: raw };
        case "reset_activity":
          return { intent: "RESET_ACTIVITY", rawTranscript: raw };
        case "pause":
          return { intent: "PAUSE", rawTranscript: raw };
        case "continue":
          return { intent: "CONTINUE", rawTranscript: raw };
        case "repeat":
          return { intent: "REPEAT", rawTranscript: raw };
        case "go_back":
          return { intent: "GO_BACK", rawTranscript: raw };
        case "skip_next":
          return { intent: "NEXT_STEP", rawTranscript: raw };
      }
    }

    // Flexible conversational option matching (e.g., "I choose Option B", "My answer is C")
    const lower = raw.toLowerCase();
    const optMatch = lower.match(/\b(?:option|choice|answer|select|choose)\s+([abcd])\b/);
    if (optMatch) {
      const idx = optMatch[1].charCodeAt(0) - 97;
      if (idx >= 0 && idx <= 3) {
        return { intent: "OPTION_SELECT", optionIndex: idx, rawTranscript: raw };
      }
    }

    if (/\b(?:confirm|lock\s+in|submit\s+my\s+answer|confirm\s+my\s+answer)\b/.test(lower)) {
      return { intent: "CONFIRM_ANSWER", rawTranscript: raw };
    }

    if (/\b(?:hint|help\s+me|give\s+me\s+a\s+clue)\b/.test(lower)) {
      return { intent: "HINT_REQUEST", rawTranscript: raw };
    }

    return { intent: "QUESTION", rawTranscript: raw };
  }

  /**
   * Matches a student's spoken phrase against the text of multiple-choice options.
   */
  public matchVoiceToOptionIndex(transcript: string, options: string[]): number | null {
    const clean = (transcript || "").trim().toLowerCase();
    if (!clean || !options.length) return null;

    for (let i = 0; i < options.length; i++) {
      const optClean = options[i].toLowerCase().trim();
      if (optClean && (clean.includes(optClean) || optClean.includes(clean))) {
        return i;
      }
    }
    return null;
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
