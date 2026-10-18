/**
 * COSMOS VoiceConversationController
 * Project: Our Visible Universe Academy
 * Scope: Prompt 12 Voice Dialogue & Speech Interruption Orchestrator
 *
 * Handles speech recognition input, coordinates voice interruptions,
 * routes questions to server-side AI, and handles conversational turns.
 */

import type { CosmosAnswer, StudentQuestionContext } from "./cosmos-types";
import { LearningPreferenceManager } from "./LearningPreferenceManager";
import { NarrationController } from "./NarrationController";
import { StudentQuestionContextManager } from "./StudentQuestionContext";
import { VisualizationActionController } from "./VisualizationActionController";
import { askCosmosQuestion } from "./cosmos.functions";

export type ConversationState = "idle" | "listening" | "processing" | "speaking" | "error";

export class VoiceConversationController {
  private narrationController: NarrationController;
  private state: ConversationState = "idle";
  private listeners: Set<(state: ConversationState, lastAnswer?: CosmosAnswer) => void> = new Set();
  private recognition: any = null;

  constructor(narrationController: NarrationController) {
    this.narrationController = narrationController;
    this.initSpeechRecognition();
  }

  private initSpeechRecognition(): void {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = "en-US";

      // CRITICAL REQUIREMENT: VOICE INTERRUPTION
      // As soon as student starts speaking, immediately interrupt narration!
      this.recognition.onspeechstart = () => {
        this.narrationController.interrupt();
        this.setState("listening");
      };

      this.recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          void this.handleStudentQuestion(transcript);
        }
      };

      this.recognition.onerror = (e: any) => {
        if (e.error !== "no-speech") {
          console.warn("Speech recognition error:", e.error);
        }
        this.setState("idle");
      };

      this.recognition.onend = () => {
        if (this.state === "listening") {
          this.setState("idle");
        }
      };
    } catch (err) {
      console.warn("SpeechRecognition init warning:", err);
    }
  }

  /**
   * Starts listening for student voice question.
   * Interrupts any ongoing narration immediately.
   */
  public startListening(): void {
    this.narrationController.interrupt();

    if (!this.recognition) {
      this.setState("listening");
      return;
    }

    try {
      this.recognition.start();
      this.setState("listening");
    } catch {
      this.setState("idle");
    }
  }

  /**
   * Stops listening.
   */
  public stopListening(): void {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (err) {
        void err;
      }
    }
    this.setState("idle");
  }

  /**
   * Processes a student inquiry (from voice transcript or text input).
   */
  public async handleStudentQuestion(
    question: string,
    contextOverride?: StudentQuestionContext,
  ): Promise<CosmosAnswer> {
    const trimmed = (question || "").trim();
    if (!trimmed) {
      throw new Error("Student question cannot be empty.");
    }

    // 1. Immediately interrupt ongoing narration
    this.narrationController.interrupt();
    this.setState("processing");

    // 2. Resolve or assemble context
    const context =
      contextOverride ||
      StudentQuestionContextManager.buildContext({
        moduleId: "01",
        learningLevel: "explorer",
      });

    // 3. Record student turn
    StudentQuestionContextManager.recordTurn(context.moduleId, context.learningLevel, {
      role: "student",
      content: trimmed,
      timestamp: Date.now(),
    });

    // 4. Send question to secure server-side provider
    try {
      const answer = await askCosmosQuestion({
        data: {
          question: trimmed,
          context,
        },
      });

      // 5. Record COSMOS response
      StudentQuestionContextManager.recordTurn(context.moduleId, context.learningLevel, {
        role: "cosmos",
        content: answer.answerText,
        timestamp: Date.now(),
        epistemicStatus: answer.epistemicClassification,
      });

      // 6. Trigger visualization action if returned
      if (answer.visualizationAction) {
        VisualizationActionController.dispatchAction(answer.visualizationAction);
      }

      // 7. Speak answer if audio is enabled
      const prefs = LearningPreferenceManager.getPreferences();
      if (prefs.mode !== "independent" && !answer.isExamRestricted) {
        this.speakAnswer(answer.spokenText || answer.answerText);
      } else {
        this.setState("idle", answer);
      }

      return answer;
    } catch (err: any) {
      this.setState("error");
      throw err;
    }
  }

  /**
   * Speaks the generated answer.
   */
  private speakAnswer(text: string): void {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      this.setState("idle");
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = LearningPreferenceManager.getPreferences().preferredVoiceSpeed;

      utterance.onstart = () => this.setState("speaking");
      utterance.onend = () => this.setState("idle");
      utterance.onerror = () => this.setState("idle");

      window.speechSynthesis.speak(utterance);
    } catch {
      this.setState("idle");
    }
  }

  public subscribe(
    listener: (state: ConversationState, lastAnswer?: CosmosAnswer) => void,
  ): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private setState(state: ConversationState, answer?: CosmosAnswer): void {
    this.state = state;
    for (const listener of this.listeners) {
      try {
        listener(state, answer);
      } catch (err) {
        console.error("Error in conversation listener:", err);
      }
    }
  }

  public getState(): ConversationState {
    return this.state;
  }
}
