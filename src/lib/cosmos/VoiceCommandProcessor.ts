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
