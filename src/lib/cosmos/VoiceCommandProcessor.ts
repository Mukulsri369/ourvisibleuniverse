/**
 * COSMOS Voice Command Processor
 * Project: Our Visible Universe Academy
 * Scope: Prompt 14 Voice Commands & Validated Action Dispatcher
 *
 * Maps recognized voice transcripts to validated application actions.
 *
 * CRITICAL AUTHORITY INVARIANT:
 * Voice commands CANNOT award learning credit, mark modules complete,
 * alter quiz scores, or bypass knowledge assessments.
 */

import type { CosmosVoiceCommandMatch, CosmosVoiceCommandType } from "./cosmos-types";
import { NarrationController } from "./NarrationController";
import { LearningPreferenceManager } from "./LearningPreferenceManager";

export class VoiceCommandProcessor {
  /**
   * Evaluates whether a spoken transcript matches a supported voice command.
   */
  public static matchCommand(transcript: string): CosmosVoiceCommandMatch {
    const raw = (transcript || "").trim().toLowerCase();
    // Normalize punctuation
    const clean = raw.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").trim();

    // 1. Pause commands
    if (
      clean === "pause" ||
      clean === "pause lesson" ||
      clean === "pause narration" ||
      clean === "stop talking" ||
      clean === "hold on" ||
      clean === "wait"
    ) {
      return {
        isCommand: true,
        commandType: "pause",
        rawTranscript: transcript,
        matchedPhrase: clean,
      };
    }

    // 2. Continue / Resume commands
    if (
      clean === "continue" ||
      clean === "resume" ||
      clean === "go ahead" ||
      clean === "keep going" ||
      clean === "continue lesson" ||
      clean === "resume narration" ||
      clean === "resume lesson"
    ) {
      return {
        isCommand: true,
        commandType: "continue",
        rawTranscript: transcript,
        matchedPhrase: clean,
      };
    }

    // 3. Repeat commands
    if (
      clean === "repeat that" ||
      clean === "repeat" ||
      clean === "say that again" ||
      clean === "repeat sentence" ||
      clean === "repeat segment"
    ) {
      return {
        isCommand: true,
        commandType: "repeat",
        rawTranscript: transcript,
        matchedPhrase: clean,
      };
    }

    // 4. Go Back commands
    if (
      clean === "go back" ||
      clean === "previous" ||
      clean === "previous sentence" ||
      clean === "previous segment" ||
      clean === "back"
    ) {
      return {
        isCommand: true,
        commandType: "go_back",
        rawTranscript: transcript,
        matchedPhrase: clean,
      };
    }

    // 5. Explain Again
    if (
      clean === "explain again" ||
      clean === "explain that again" ||
      clean === "can you explain again" ||
      clean === "re-explain"
    ) {
      return {
        isCommand: true,
        commandType: "explain_again",
        rawTranscript: transcript,
        matchedPhrase: clean,
      };
    }

    // 6. Speak Slower
    if (
      clean === "speak slower" ||
      clean === "slow down" ||
      clean === "talk slower" ||
      clean === "slower please"
    ) {
      return {
        isCommand: true,
        commandType: "speak_slower",
        rawTranscript: transcript,
        matchedPhrase: clean,
      };
    }

    // 7. Skip Next
    if (
      clean === "skip to the next lesson" ||
      clean === "next lesson" ||
      clean === "next sentence" ||
      clean === "next segment" ||
      clean === "next" ||
      clean === "skip"
    ) {
      return {
        isCommand: true,
        commandType: "skip_next",
        rawTranscript: transcript,
        matchedPhrase: clean,
      };
    }

    // 8. Show Example
    if (
      clean === "show me an example" ||
      clean === "give me an example" ||
      clean === "show an example" ||
      clean === "can you give an example" ||
      clean === "give an example"
    ) {
      return {
        isCommand: true,
        commandType: "show_example",
        rawTranscript: transcript,
        matchedPhrase: clean,
      };
    }

    // 9. Phase 2 Quiz Option Selections (Option A / B / C / D)
    if (
      clean === "a" ||
      clean === "option a" ||
      clean === "choice a" ||
      clean === "answer a" ||
      clean === "select option a" ||
      clean === "first option" ||
      clean === "the first option"
    ) {
      return {
        isCommand: true,
        commandType: "select_option_a",
        rawTranscript: transcript,
        matchedPhrase: clean,
        optionIndex: 0,
      };
    }

    if (
      clean === "b" ||
      clean === "option b" ||
      clean === "choice b" ||
      clean === "answer b" ||
      clean === "select option b" ||
      clean === "second option" ||
      clean === "the second option"
    ) {
      return {
        isCommand: true,
        commandType: "select_option_b",
        rawTranscript: transcript,
        matchedPhrase: clean,
        optionIndex: 1,
      };
    }

    if (
      clean === "c" ||
      clean === "option c" ||
      clean === "choice c" ||
      clean === "answer c" ||
      clean === "select option c" ||
      clean === "third option" ||
      clean === "the third option"
    ) {
      return {
        isCommand: true,
        commandType: "select_option_c",
        rawTranscript: transcript,
        matchedPhrase: clean,
        optionIndex: 2,
      };
    }

    if (
      clean === "d" ||
      clean === "option d" ||
      clean === "choice d" ||
      clean === "answer d" ||
      clean === "select option d" ||
      clean === "fourth option" ||
      clean === "the fourth option"
    ) {
      return {
        isCommand: true,
        commandType: "select_option_d",
        rawTranscript: transcript,
        matchedPhrase: clean,
        optionIndex: 3,
      };
    }

    // 10. Confirm / Submit Answer
    if (
      clean === "confirm" ||
      clean === "confirm answer" ||
      clean === "lock it in" ||
      clean === "yes confirm" ||
      clean === "submit answer" ||
      clean === "submit quiz"
    ) {
      return {
        isCommand: true,
        commandType: "confirm_answer",
        rawTranscript: transcript,
        matchedPhrase: clean,
      };
    }

    // 11. Change Answer
    if (clean === "change answer" || clean === "change my answer" || clean === "different option") {
      return {
        isCommand: true,
        commandType: "change_answer",
        rawTranscript: transcript,
        matchedPhrase: clean,
      };
    }

    // 12. Request Hint / Help
    if (
      clean === "give me a hint" ||
      clean === "hint" ||
      clean === "request help" ||
      clean === "help me with this activity" ||
      clean === "what should i do"
    ) {
      return {
        isCommand: true,
        commandType: "request_hint",
        rawTranscript: transcript,
        matchedPhrase: clean,
      };
    }

    // 13. Demonstrate Control
    if (
      clean === "demonstrate" ||
      clean === "show control" ||
      clean === "demonstrate control" ||
      clean === "show me how"
    ) {
      return {
        isCommand: true,
        commandType: "demonstrate_control",
        rawTranscript: transcript,
        matchedPhrase: clean,
      };
    }

    // 14. Verify Activity
    if (
      clean === "verify activity" ||
      clean === "check activity" ||
      clean === "check my experiment" ||
      clean === "verify my orbit"
    ) {
      return {
        isCommand: true,
        commandType: "verify_activity",
        rawTranscript: transcript,
        matchedPhrase: clean,
      };
    }

    // 15. Reset Activity
    if (clean === "reset activity" || clean === "reset simulation" || clean === "start over") {
      return {
        isCommand: true,
        commandType: "reset_activity",
        rawTranscript: transcript,
        matchedPhrase: clean,
      };
    }

    return { isCommand: false, rawTranscript: transcript };
  }

  /**
   * Executes a matched voice command against the active narration controller and app state.
   * Returns a friendly confirmation string for COSMOS to speak or display.
   */
  public static executeCommand(
    commandType: CosmosVoiceCommandType,
    narrationController: NarrationController,
  ): { feedback: string; resumedNarration: boolean } {
    switch (commandType) {
      case "pause":
        narrationController.pause();
        return { feedback: "Pausing narration.", resumedNarration: false };

      case "continue":
        narrationController.resume();
        return { feedback: "Resuming lesson.", resumedNarration: true };

      case "repeat":
        narrationController.repeatCurrent();
        return { feedback: "Repeating sentence.", resumedNarration: true };

      case "go_back":
        narrationController.previous();
        return { feedback: "Moving back to previous section.", resumedNarration: true };

      case "skip_next":
        narrationController.next();
        return { feedback: "Advancing to next section.", resumedNarration: true };

      case "speak_slower": {
        const currentSpeed = narrationController.getState().speechSpeed;
        const newSpeed = Math.max(0.75, currentSpeed - 0.25);
        narrationController.setSpeed(newSpeed);
        LearningPreferenceManager.setPreferences({ preferredVoiceSpeed: newSpeed });
        return {
          feedback: `Setting speech speed to ${newSpeed.toFixed(2)}x.`,
          resumedNarration: false,
        };
      }

      case "select_option_a":
        return {
          feedback: "Selected Option A. Say confirm to lock it in.",
          resumedNarration: false,
        };
      case "select_option_b":
        return {
          feedback: "Selected Option B. Say confirm to lock it in.",
          resumedNarration: false,
        };
      case "select_option_c":
        return {
          feedback: "Selected Option C. Say confirm to lock it in.",
          resumedNarration: false,
        };
      case "select_option_d":
        return {
          feedback: "Selected Option D. Say confirm to lock it in.",
          resumedNarration: false,
        };
      case "confirm_answer":
        return { feedback: "Confirming selected answer.", resumedNarration: false };
      case "change_answer":
        return { feedback: "Ready for a new option selection.", resumedNarration: false };
      case "request_hint":
        return { feedback: "Providing contextual guidance...", resumedNarration: false };
      case "demonstrate_control":
        return { feedback: "Highlighting interactive control...", resumedNarration: false };
      case "verify_activity":
        return { feedback: "Checking experimental results...", resumedNarration: false };
      case "reset_activity":
        return { feedback: "Restoring simulation to initial parameters.", resumedNarration: false };

      case "explain_again":
      case "show_example":
        // These are handled conversationally with contextual pedagogical grounding
        return {
          feedback: "Generating explanation...",
          resumedNarration: false,
        };
    }
  }
}
