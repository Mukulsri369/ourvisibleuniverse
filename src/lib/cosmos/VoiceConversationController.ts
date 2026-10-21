// @ts-nocheck
/**
 * COSMOS Real-Time Conversational AI Voice Controller
 * Project: Our Visible Universe Academy
 * Scope: Prompt 14 Natural Real-Time Voice Conversation & Lesson Resumption
 *
 * Implements the 10-state interaction state machine:
 * IDLE, NARRATING, INTERRUPTING, LISTENING, PROCESSING, ANSWERING,
 * FOLLOW_UP_WINDOW, RESUMING, PAUSED, ERROR.
 *
 * Coordinates Voice Activity Detection (barge-in), Voice Command Execution,
 * Pedagogical Grounding, Follow-up Question Discussion Loop, and Preserved Lesson Resumption.
 */

import type {
  ConversationalTurnContext,
  CosmosAnswer,
  CosmosInteractionState,
  CosmosVoiceCommandMatch,
  NarrationSegment,
  StudentQuestionContext,
} from "./cosmos-types";
import { LearningPreferenceManager } from "./LearningPreferenceManager";
import { NarrationController } from "./NarrationController";
import { StudentQuestionContextManager } from "./StudentQuestionContext";
import { VisualizationActionController } from "./VisualizationActionController";
import { VoiceActivityDetector } from "./VoiceActivityDetector";
import { VoiceCommandProcessor } from "./VoiceCommandProcessor";
import { LiveSessionManager } from "./LiveSessionManager";
import { converseWithCosmos } from "./cosmos.functions";

export interface ConversationEventPayload {
  state: CosmosInteractionState;
  transcript?: string;
  lastAnswer?: CosmosAnswer | null;
  commandMatch?: CosmosVoiceCommandMatch | null;
  interruptedSegment?: NarrationSegment | null;
  followUpCountdownSeconds?: number;
  audioLevel?: number;
  errorMessage?: string;
}

export class VoiceConversationController {
  private narrationController: NarrationController;
  private state: CosmosInteractionState = "IDLE";
  private listeners: Set<(payload: ConversationEventPayload) => void> = new Set();
  private liveSessionManager: LiveSessionManager;

  private vad: VoiceActivityDetector | null = null;
  private speechRecognition: any = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentAudioElement: HTMLAudioElement | null = null;

  // Interruption and Resumption Tracking
  private preservedInterruptedSegment: NarrationSegment | null = null;
  private preservedInterruptedIndex = 0;
  private followUpTimer: any = null;
  private countdownInterval: any = null;
  private currentCountdownSeconds = 0;
  private followUpTurnCount = 0;
  private lastAnswer: CosmosAnswer | null = null;
  private lastErrorMessage: string | null = null;
  private lastTranscript = "";
  private currentAudioLevel = 0;

  // Push-to-Talk vs Hands-Free
  private isPushToTalkActive = false;
  private isMicPermissionGranted = false;

  constructor(narrationController: NarrationController) {
    this.narrationController = narrationController;
    this.liveSessionManager = LiveSessionManager.getInstance();

    // Listen to narration controller state to keep NARRATING in sync
    this.narrationController.subscribe((nState) => {
      if (nState.status === "playing" || nState.status === "loading") {
        if (this.state === "IDLE" || this.state === "RESUMING") {
          this.setState("NARRATING");
        }
      } else if (nState.status === "paused" && this.state === "NARRATING") {
        this.setState("PAUSED");
      } else if (nState.status === "completed" && this.state === "NARRATING") {
        this.setState("IDLE");
      }
    });

    // Monitor LiveSession resilience: Retain cursor independently of session interruptions
    this.liveSessionManager.subscribe((payload) => {
      if (payload.state === "ERROR" || payload.state === "RECONNECTING") {
        if (this.state === "PROCESSING" || this.state === "ANSWERING") {
          this.setState("ERROR", {
            errorMessage:
              payload.errorMessage || "Live connection interrupted. Lesson cursor preserved.",
          });
        }
      }
    });

    this.initVoiceActivityDetector();
    this.initSpeechRecognition();
  }

  /**
   * Initializes Voice Activity Detector (VAD) for barge-in detection.
   */
  private initVoiceActivityDetector(): void {
    if (typeof window === "undefined") return;

    this.vad = new VoiceActivityDetector({
      sensitivity: LearningPreferenceManager.getPreferences().vadSensitivity,
      minSpeechDurationMs: 150,
      silenceTimeoutMs: 1100,
      onSpeechStart: () => {
        // Opt-in Hands-Free Barge-In check
        const prefs = LearningPreferenceManager.getPreferences();
        if (prefs.handsFreeBargeIn && (this.state === "NARRATING" || this.state === "ANSWERING")) {
          this.triggerBargeIn("Student voice detected via VAD");
        }
      },
      onSpeechEnd: (audioLevel) => {
        // Speech ended event
        this.currentAudioLevel = audioLevel;
      },
      onAudioLevelChange: (level) => {
        this.currentAudioLevel = level;
        this.notifyListeners();
      },
      onError: (err) => {
        console.warn("VAD monitoring notice:", err.message);
      },
    });
  }

  /**
   * Initializes browser SpeechRecognition for speech-to-text.
   */
  private initSpeechRecognition(): void {
    if (typeof window === "undefined") return;

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) return;

    try {
      this.speechRecognition = new SpeechRecognitionClass();
      this.speechRecognition.continuous = false;
      this.speechRecognition.interimResults = true;
      this.speechRecognition.maxAlternatives = 1;
      this.speechRecognition.lang = "en-US";

      this.speechRecognition.onspeechstart = () => {
        if (this.state === "NARRATING" || this.state === "ANSWERING") {
          this.triggerBargeIn("SpeechRecognition onspeechstart");
        }
      };

      this.speechRecognition.onresult = (event: any) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            this.lastTranscript = event.results[i][0].transcript;
            this.notifyListeners();
          }
        }

        if (finalTranscript.trim()) {
          this.lastTranscript = finalTranscript.trim();
          void this.handleStudentTranscript(this.lastTranscript);
        }
      };

      this.speechRecognition.onerror = (e: any) => {
        if (e.error !== "no-speech" && e.error !== "aborted") {
          console.warn("Speech recognition notice:", e.error);
          if (e.error === "not-allowed") {
            this.isMicPermissionGranted = false;
            this.setState("ERROR", { errorMessage: "Microphone permission denied by browser." });
            return;
          }
        }

        if (this.state === "LISTENING") {
          // If in follow-up window, return to follow-up countdown
          if (this.followUpTurnCount > 0) {
            this.startFollowUpWindow();
          } else {
            this.setState("IDLE");
          }
        }
      };

      this.speechRecognition.onend = () => {
        if (this.state === "LISTENING" && !this.isPushToTalkActive) {
          // If no transcript was captured and we were in a follow-up discussion, continue waiting
          if (this.followUpTurnCount > 0 && this.state !== "PROCESSING") {
            this.startFollowUpWindow();
          }
        }
      };
    } catch (err) {
      console.warn("SpeechRecognition init notice:", err);
    }
  }

  /**
   * BARGE-IN: Stops current narration/answer immediately, clears unplayed audio buffers,
   * preserves exact reading cursor, and transitions to LISTENING.
   */
  public triggerBargeIn(reason = "barge-in", immediateListening = false): void {
    this.clearAudioBuffers();

    // 1. Preserve current narration location
    const nState = this.narrationController.getState();
    this.preservedInterruptedSegment = nState.currentSegment;
    this.preservedInterruptedIndex = nState.currentSegmentIndex;

    // 2. Halt narration controller immediately
    this.narrationController.interrupt();

    // 3. Set state to INTERRUPTING then transition to LISTENING
    this.setState("INTERRUPTING");

    if (this.vad) {
      this.vad.setCosmosOutputtingAudio(false);
    }

    if (immediateListening) {
      this.setState("LISTENING");
      this.startSpeechCapture();
    } else {
      setTimeout(() => {
        if (this.state === "INTERRUPTING") {
          this.setState("LISTENING");
          this.startSpeechCapture();
        }
      }, 50);
    }
  }

  /**
   * Starts speech capture (hands-free or push-to-talk).
   */
  private startSpeechCapture(): void {
    if (!this.speechRecognition) return;

    try {
      this.speechRecognition.abort();
      this.speechRecognition.start();
    } catch {
      // recognition may already be running
    }
  }

  /**
   * PUSH-TO-TALK: Called when student presses push-to-talk button or spacebar.
   */
  public startPushToTalk(): void {
    this.isPushToTalkActive = true;
    this.clearFollowUpTimers();

    if (this.state === "NARRATING" || this.state === "ANSWERING") {
      this.triggerBargeIn("Push-to-talk initiated");
    } else {
      this.clearAudioBuffers();
      this.setState("LISTENING");
      this.startSpeechCapture();
    }
  }

  /**
   * PUSH-TO-TALK: Called when student releases push-to-talk button or spacebar.
   */
  public stopPushToTalk(): void {
    this.isPushToTalkActive = false;

    if (this.speechRecognition) {
      try {
        this.speechRecognition.stop();
      } catch {
        // ignore
      }
    }
  }

  /**
   * Enables microphone access explicitly upon student action.
   */
  public async enableMicrophone(): Promise<boolean> {
    if (!this.vad) return false;

    const granted = await this.vad.start();
    this.isMicPermissionGranted = granted;

    if (!granted) {
      this.setState("ERROR", {
        errorMessage:
          "Microphone access was denied. You can still use Push-to-Talk or text inquiry.",
      });
      return false;
    }

    return true;
  }

  /**
   * Processes a recognized student transcript:
   * 1. Evaluates Voice Commands ("pause", "continue", "repeat", "speak slower", etc.)
   * 2. Evaluates Educational Questions & Follow-ups
   */
  public async handleStudentTranscript(
    transcript: string,
    contextOverride?: StudentQuestionContext,
  ): Promise<CosmosAnswer | null> {
    const trimmed = (transcript || "").trim();
    if (!trimmed) {
      if (this.followUpTurnCount > 0) {
        this.startFollowUpWindow();
      } else {
        this.setState("IDLE");
      }
      return null;
    }

    this.clearFollowUpTimers();

    // 1. Check Voice Commands
    const commandMatch = VoiceCommandProcessor.matchCommand(trimmed);
    if (commandMatch.isCommand && commandMatch.commandType) {
      const outcome = VoiceCommandProcessor.executeCommand(
        commandMatch.commandType,
        this.narrationController,
      );

      // Handle non-conversational commands directly
      if (
        commandMatch.commandType === "pause" ||
        commandMatch.commandType === "continue" ||
        commandMatch.commandType === "repeat" ||
        commandMatch.commandType === "go_back" ||
        commandMatch.commandType === "skip_next" ||
        commandMatch.commandType === "speak_slower"
      ) {
        if (outcome.resumedNarration) {
          this.setState("RESUMING");
          setTimeout(() => this.setState("NARRATING"), 200);
        } else {
          this.setState(commandMatch.commandType === "pause" ? "PAUSED" : "IDLE");
        }
        return null;
      }
    }

    // 2. Student Question / Pedagogical Inquiry
    this.setState("PROCESSING", { transcript: trimmed });

    const nState = this.narrationController.getState();
    const currentSegment = this.preservedInterruptedSegment || nState.currentSegment;

    // Build rich ConversationalTurnContext
    const context: ConversationalTurnContext = {
      ...(contextOverride ||
        StudentQuestionContextManager.buildContext({
          moduleId: currentSegment?.moduleId || "01",
          learningLevel: currentSegment?.learningLevel || "explorer",
        })),
      interruptedSegment: currentSegment,
      nearbyInstructionalContent: currentSegment ? [currentSegment.displayText] : [],
      followUpCount: this.followUpTurnCount,
      lastAnswerText: this.lastAnswer?.answerText,
    };

    try {
      let answer: CosmosAnswer;
      try {
        answer = await converseWithCosmos({
          data: {
            question: trimmed,
            context,
          },
        });
      } catch (fnErr: any) {
        // Fallback for Node.js test environments or non-browser contexts where TanStack Start serverFn lacks AsyncLocalStorage
        if (typeof window === "undefined" || fnErr?.message?.includes("No Start context")) {
          const { AIServiceProviderServer } = await import("./AIServiceProvider.server");
          answer = await AIServiceProviderServer.answerConversationalTurn(trimmed, context);
        } else {
          throw fnErr;
        }
      }

      this.lastAnswer = answer;
      this.followUpTurnCount++;

      // Trigger 3D visualization if attached
      if (answer.visualizationAction) {
        VisualizationActionController.dispatchAction(answer.visualizationAction);
      }

      this.setState("ANSWERING", { lastAnswer: answer });

      // Speak the answer aloud
      await this.speakAnswer(answer.spokenText || answer.answerText);

      // Enter follow-up window after speech finishes
      this.startFollowUpWindow();
      return answer;
    } catch (err: any) {
      console.warn("Conversational error:", err);
      this.setState("ERROR", {
        errorMessage: "Could not process conversation. Click resume to return to lesson.",
      });
      return null;
    }
  }

  /**
   * Speaks the generated answer aloud, updating VAD self-playback gating.
   */
  private speakAnswer(text: string): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === "undefined" || !window.speechSynthesis) {
        resolve();
        return;
      }

      this.clearAudioBuffers();

      try {
        if (this.vad) {
          this.vad.setCosmosOutputtingAudio(true);
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = LearningPreferenceManager.getPreferences().preferredVoiceSpeed;
        utterance.lang = "en-US";

        utterance.onend = () => {
          if (this.vad) {
            this.vad.setCosmosOutputtingAudio(false);
          }
          this.currentUtterance = null;
          resolve();
        };

        utterance.onerror = () => {
          if (this.vad) {
            this.vad.setCosmosOutputtingAudio(false);
          }
          this.currentUtterance = null;
          resolve();
        };

        this.currentUtterance = utterance;
        window.speechSynthesis.speak(utterance);
      } catch {
        if (this.vad) {
          this.vad.setCosmosOutputtingAudio(false);
        }
        resolve();
      }
    });
  }

  /**
   * FOLLOW-UP WINDOW:
   * Holds discussion open for student follow-up questions ("why?", "explain more", etc.).
   * If countdown expires and no follow-up occurs, automatically resumes lesson if configured.
   */
  private startFollowUpWindow(): void {
    this.clearFollowUpTimers();
    this.setState("FOLLOW_UP_WINDOW");

    const prefs = LearningPreferenceManager.getPreferences();
    this.currentCountdownSeconds = prefs.followUpWindowSeconds || 6;
    this.notifyListeners();

    // Start listening for follow-up questions
    this.startSpeechCapture();

    this.countdownInterval = setInterval(() => {
      this.currentCountdownSeconds--;
      this.notifyListeners();

      if (this.currentCountdownSeconds <= 0) {
        this.clearFollowUpTimers();

        // Check auto-resumption preference
        if (prefs.autoResumeAfterDiscussion) {
          this.resumeLesson();
        } else {
          this.setState("PAUSED");
        }
      }
    }, 1000);

    if (this.countdownInterval && typeof (this.countdownInterval as any).unref === "function") {
      (this.countdownInterval as any).unref();
    }
  }

  /**
   * RESUMPTION:
   * Resumes narration from the preserved cursor position (or beginning of interrupted segment).
   */
  public resumeLesson(immediate = false): void {
    this.clearFollowUpTimers();
    this.clearAudioBuffers();

    this.setState("RESUMING");
    this.followUpTurnCount = 0;

    const performResumption = () => {
      if (this.preservedInterruptedSegment) {
        this.narrationController.seekSegment(this.preservedInterruptedIndex);
      }
      this.narrationController.play();
      this.setState("NARRATING");
      this.preservedInterruptedSegment = null;
    };

    if (immediate) {
      performResumption();
    } else {
      setTimeout(performResumption, 150);
    }
  }

  /**
   * Pauses active conversation and narration.
   */
  public pause(): void {
    this.clearFollowUpTimers();
    this.clearAudioBuffers();
    this.narrationController.pause();
    this.setState("PAUSED");
  }

  /**
   * Resets conversation controller state to IDLE.
   */
  public stop(): void {
    this.clearFollowUpTimers();
    this.clearAudioBuffers();
    this.narrationController.stop();
    this.followUpTurnCount = 0;
    this.preservedInterruptedSegment = null;
    this.setState("IDLE");
  }

  /**
   * Resilience Handler: Network drop or session loss during answer generation (Test Scenario H).
   * Invariant: Preserves narration cursor intact without corrupting reading state!
   */
  public handleConnectionLostDuringAnswer(
    errorMessage = "Connection lost during response. Preserved lesson cursor.",
  ): void {
    this.clearAudioBuffers();
    this.clearFollowUpTimers();
    this.setState("ERROR", { errorMessage });
  }

  /**
   * Resilience Handler: Reconnection recovery (Test Scenario I).
   */
  public handleReconnected(): void {
    if (this.state === "ERROR") {
      this.setState("PAUSED");
    }
  }

  /**
   * Resilience Handler: Microphone permission denied (Test Scenario G).
   */
  public handleMicPermissionDenied(): void {
    this.isMicPermissionGranted = false;
    this.setState("ERROR", {
      errorMessage: "Microphone permission denied. Switched to Push-to-Talk / manual control.",
    });
  }

  /**
   * Resilience Handler: Audio device changed (Test Scenario K, e.g. Bluetooth headphones).
   */
  public handleAudioDeviceChange(deviceLabel: string): void {
    // Re-verify VAD / speech synthesis routing
    if (this.vad) {
      this.vad.setCosmosOutputtingAudio(this.state === "ANSWERING");
    }
    this.notifyListeners({ audioLevel: this.currentAudioLevel });
  }

  /**
   * Simulation Helper: Manually advances follow-up window countdown by 1s (used for testing).
   */
  public simulateFollowUpCountdownTick(): number {
    if (this.state === "FOLLOW_UP_WINDOW") {
      this.currentCountdownSeconds = Math.max(0, this.currentCountdownSeconds - 1);
      this.notifyListeners();
      if (this.currentCountdownSeconds === 0) {
        this.clearFollowUpTimers();
        const prefs = LearningPreferenceManager.getPreferences();
        if (prefs.autoResumeAfterDiscussion) {
          this.resumeLesson(true);
        } else {
          this.setState("PAUSED");
        }
      }
    }
    return this.currentCountdownSeconds;
  }

  public getLiveSessionManager(): LiveSessionManager {
    return this.liveSessionManager;
  }

  public getVoiceActivityDetector(): VoiceActivityDetector | null {
    return this.vad;
  }

  public getNarrationController(): NarrationController {
    return this.narrationController;
  }

  private clearAudioBuffers(): void {
    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
        this.currentAudioElement.src = "";
      } catch {
        // ignore
      }
      this.currentAudioElement = null;
    }

    if (typeof window !== "undefined" && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
    this.currentUtterance = null;
  }

  private clearFollowUpTimers(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
    if (this.followUpTimer) {
      clearTimeout(this.followUpTimer);
      this.followUpTimer = null;
    }
  }

  public subscribe(listener: (payload: ConversationEventPayload) => void): () => void {
    this.listeners.add(listener);
    listener(this.getPayload());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private setState(
    state: CosmosInteractionState,
    extra: Partial<ConversationEventPayload> = {},
  ): void {
    this.state = state;
    if (extra.errorMessage !== undefined) {
      this.lastErrorMessage = extra.errorMessage;
    } else if (state !== "ERROR") {
      this.lastErrorMessage = null;
    }
    this.notifyListeners(extra);
  }

  private notifyListeners(extra: Partial<ConversationEventPayload> = {}): void {
    const payload = this.getPayload(extra);
    for (const listener of this.listeners) {
      try {
        listener(payload);
      } catch (err) {
        console.error("Error in conversation listener:", err);
      }
    }
  }

  public getPayload(extra: Partial<ConversationEventPayload> = {}): ConversationEventPayload {
    return {
      state: this.state,
      transcript: this.lastTranscript,
      lastAnswer: this.lastAnswer,
      interruptedSegment: this.preservedInterruptedSegment,
      followUpCountdownSeconds: this.currentCountdownSeconds,
      audioLevel: this.currentAudioLevel,
      errorMessage:
        extra.errorMessage !== undefined
          ? extra.errorMessage
          : (this.lastErrorMessage ?? undefined),
      ...extra,
    };
  }

  public getState(): CosmosInteractionState {
    return this.state;
  }

  public getFollowUpTurnCount(): number {
    return this.followUpTurnCount;
  }

  public getPreservedInterruptedSegment(): NarrationSegment | null {
    return this.preservedInterruptedSegment;
  }
}
