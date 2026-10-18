/**
 * COSMOS NarrationController
 * Project: Our Visible Universe Academy
 * Scope: Prompt 13 Intelligent Voice Narration Engine
 *
 * Full-featured narration state machine coordinating Gemini TTS synthesis
 * (gemini-3.8-flash-lite-tts), browser audio playback, Web Speech API fallback,
 * confirmed cursor progression, and text synchronization highlighting.
 */

import type {
  CosmosNarrationStatus,
  CosmosVoiceName,
  NarrationSegment,
  NarrationState,
} from "./cosmos-types";
import { NarrationCursorManager } from "./NarrationCursorManager";
import { VisualizationActionController } from "./VisualizationActionController";
import { AudioCacheManager } from "./AudioCacheManager";
import { synthesizeSegmentAudio } from "./cosmos.functions";

export class NarrationController {
  private segments: NarrationSegment[] = [];
  private currentIndex = 0;
  private state: NarrationState = {
    status: "idle",
    currentSegmentIndex: 0,
    totalSegments: 0,
    currentSegment: null,
    progressPercentage: 0,
    speechSpeed: 1.0,
    language: "en",
    voiceName: "Kore",
    textOnlyMode: false,
    audioSource: "gemini-tts",
    elapsedSeconds: 0,
  };

  private listeners: Set<(state: NarrationState) => void> = new Set();
  private currentAudioElement: HTMLAudioElement | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private textOnlyTimer: any = null;
  private activeSynthesisAbortController: AbortController | null = null;

  constructor(segments: NarrationSegment[] = [], initialIndex = 0) {
    if (segments.length > 0) {
      this.loadSegments(segments, initialIndex);
    }
  }

  /**
   * Loads a new series of narration segments into the controller.
   */
  public loadSegments(segments: NarrationSegment[], initialIndex = 0): void {
    this.stop();
    this.segments = segments;
    this.currentIndex = Math.max(0, Math.min(initialIndex, segments.length - 1));

    const current = this.segments[this.currentIndex] || null;
    this.updateState({
      status: "idle",
      currentSegmentIndex: this.currentIndex,
      totalSegments: segments.length,
      currentSegment: current,
      activeSectionId: current?.sectionId,
      progressPercentage: segments.length > 0 ? (this.currentIndex / segments.length) * 100 : 0,
      language: current?.language || "en",
      elapsedSeconds: 0,
      errorMessage: undefined,
    });
  }

  /**
   * Starts playing narration from the current segment.
   */
  public play(): void {
    if (this.segments.length === 0) return;

    const segment = this.segments[this.currentIndex];
    if (!segment) return;

    // 1. Sync 3D visualization if attached
    if (segment.visualizationReference) {
      VisualizationActionController.dispatchAction(segment.visualizationReference);
    }

    // 2. Dispatch text synchronization event
    this.dispatchTextSyncEvent(segment);

    // 3. If in text-only mode, simulate natural reading progression
    if (this.state.textOnlyMode) {
      this.playTextOnlySegment(segment);
      return;
    }

    // 4. Synthesize or retrieve audio clip
    void this.playAudioSegment(segment);
  }

  /**
   * Replays the current segment from the start.
   */
  public repeatCurrent(): void {
    this.clearAudioBuffers();
    this.play();
  }

  /**
   * Pauses active narration playback.
   */
  public pause(): void {
    if (this.state.status !== "playing" && this.state.status !== "loading") return;

    if (this.currentAudioElement && !this.currentAudioElement.paused) {
      this.currentAudioElement.pause();
    }

    if (typeof window !== "undefined" && window.speechSynthesis) {
      try {
        window.speechSynthesis.pause();
      } catch (err) {
        console.warn("speechSynthesis.pause warning:", err);
      }
    }

    if (this.textOnlyTimer) {
      clearTimeout(this.textOnlyTimer);
      this.textOnlyTimer = null;
    }

    this.updateState({ status: "paused" });
  }

  /**
   * Resumes paused narration playback.
   */
  public resume(): void {
    if (this.state.status !== "paused") return;

    if (this.currentAudioElement && this.currentAudioElement.paused) {
      this.currentAudioElement
        .play()
        .then(() => {
          this.updateState({ status: "playing" });
        })
        .catch((err) => {
          console.warn("Audio resume error:", err);
          this.updateState({
            status: "error",
            errorMessage: "Click play to enable audio playback in your browser",
          });
        });
      return;
    }

    if (typeof window !== "undefined" && window.speechSynthesis && window.speechSynthesis.paused) {
      try {
        window.speechSynthesis.resume();
        this.updateState({ status: "playing" });
        return;
      } catch (err) {
        console.warn("speechSynthesis.resume warning:", err);
      }
    }

    // Otherwise re-trigger play
    this.play();
  }

  /**
   * CRITICAL INVARIANT: VOICE INTERRUPTION
   * Immediately stops audio playback, cancels pending synthesis buffers,
   * preserves the active reading position, and sets status to 'interrupted'.
   */
  public interrupt(): void {
    this.clearAudioBuffers();
    this.updateState({ status: "interrupted" });
  }

  /**
   * Stops narration and resets state to idle.
   */
  public stop(): void {
    this.clearAudioBuffers();
    this.updateState({ status: "idle", errorMessage: undefined });
  }

  /**
   * Clears all hardware and browser audio buffers.
   */
  private clearAudioBuffers(): void {
    if (this.activeSynthesisAbortController) {
      this.activeSynthesisAbortController.abort();
      this.activeSynthesisAbortController = null;
    }

    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
        this.currentAudioElement.src = "";
        this.currentAudioElement.onended = null;
        this.currentAudioElement.onerror = null;
      } catch (err) {
        void err;
      }
      this.currentAudioElement = null;
    }

    if (typeof window !== "undefined" && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch (err) {
        void err;
      }
    }
    this.currentUtterance = null;

    if (this.textOnlyTimer) {
      clearTimeout(this.textOnlyTimer);
      this.textOnlyTimer = null;
    }
  }

  /**
   * Advances to the next segment.
   */
  public next(): void {
    this.nextSegment();
  }

  public nextSegment(): void {
    if (this.currentIndex < this.segments.length - 1) {
      this.seekSegment(this.currentIndex + 1);
    } else {
      this.clearAudioBuffers();
      this.updateState({ status: "completed", progressPercentage: 100 });
    }
  }

  /**
   * Moves to the previous segment.
   */
  public previous(): void {
    this.prevSegment();
  }

  public prevSegment(): void {
    if (this.currentIndex > 0) {
      this.seekSegment(this.currentIndex - 1);
    }
  }

  /**
   * Seeks to a specific segment index.
   */
  public seekSegment(index: number): void {
    const wasPlaying = this.state.status === "playing" || this.state.status === "loading";
    this.clearAudioBuffers();

    this.currentIndex = Math.max(0, Math.min(index, this.segments.length - 1));
    const current = this.segments[this.currentIndex] || null;

    this.updateState({
      status: wasPlaying ? "loading" : "idle",
      currentSegmentIndex: this.currentIndex,
      currentSegment: current,
      activeSectionId: current?.sectionId,
      progressPercentage:
        this.segments.length > 0 ? (this.currentIndex / this.segments.length) * 100 : 0,
      errorMessage: undefined,
    });

    if (current?.visualizationReference) {
      VisualizationActionController.dispatchAction(current.visualizationReference);
    }

    this.dispatchTextSyncEvent(current);

    if (wasPlaying) {
      this.play();
    }
  }

  /**
   * Sets narration speed factor (0.75x to 1.5x).
   */
  public setSpeed(speed: number): void {
    const clamped = Math.max(0.75, Math.min(speed, 1.5));
    this.updateState({ speechSpeed: clamped });

    if (this.currentAudioElement) {
      this.currentAudioElement.playbackRate = clamped;
    }
    if (this.currentUtterance) {
      this.currentUtterance.rate = clamped;
    }
  }

  /**
   * Sets preferred TTS voice name ('Kore', 'Puck', 'Fenrir', 'Zephyr', 'Charon').
   */
  public setVoiceName(voiceName: CosmosVoiceName): void {
    this.updateState({ voiceName });
  }

  /**
   * Toggles Text-Only mode.
   */
  public setTextOnlyMode(enabled: boolean): void {
    this.updateState({
      textOnlyMode: enabled,
      audioSource: enabled ? "text-only" : "gemini-tts",
    });

    if (enabled && (this.state.status === "playing" || this.state.status === "loading")) {
      this.clearAudioBuffers();
      this.play();
    }
  }

  /**
   * Plays segment in Text-Only Mode (visual pacing without audio hardware).
   */
  private playTextOnlySegment(segment: NarrationSegment): void {
    if (this.state.status !== "loading" && this.state.status !== "playing") return;
    this.clearAudioBuffers();
    this.updateState({
      status: "playing",
      audioSource: "text-only",
      currentSegment: segment,
      activeSectionId: segment.sectionId,
    });

    // Estimate reading duration: ~180 words per minute / speed factor
    const wordCount = (segment.displayText || "").split(/\s+/).length || 15;
    const durationMs = Math.max(2500, (wordCount / 3) * (1000 / this.state.speechSpeed));

    this.textOnlyTimer = setTimeout(() => {
      if (this.state.status === "playing") {
        this.onSegmentPlaybackActuallyCompleted(segment);
      }
    }, durationMs);
  }

  /**
   * Synthesizes and plays audio for a segment.
   * Advances cursor strictly on actual completion!
   */
  private async playAudioSegment(segment: NarrationSegment): Promise<void> {
    this.clearAudioBuffers();
    this.updateState({
      status: "loading",
      currentSegment: segment,
      activeSectionId: segment.sectionId,
      errorMessage: undefined,
    });

    const cacheKey = AudioCacheManager.createCacheKey({
      courseVersion: segment.courseVersion,
      moduleId: segment.moduleId,
      segmentId: segment.segmentId,
      language: segment.language,
      voiceName: this.state.voiceName,
      model: "gemini-3.8-flash-lite-tts",
    });

    // 1. Check local audio cache first
    let base64Audio = AudioCacheManager.get(cacheKey);

    if (!base64Audio) {
      try {
        const result = await synthesizeSegmentAudio({
          data: {
            courseVersion: segment.courseVersion,
            moduleId: segment.moduleId,
            segmentId: segment.segmentId,
            spokenText: segment.spokenText,
            language: segment.language,
            voiceName: this.state.voiceName,
            model: "gemini-3.8-flash-lite-tts",
          },
        });

        if (this.state.status !== "loading" && this.state.status !== "playing") return;

        if (result.audioBase64) {
          base64Audio = result.audioBase64;
          AudioCacheManager.set(cacheKey, base64Audio);
        } else if (result.useWebSpeechFallback) {
          // Fall back gracefully to browser Web Speech API
          this.playWebSpeechFallback(segment);
          return;
        }
      } catch (err: any) {
        if (this.state.status !== "loading" && this.state.status !== "playing") return;
        const msg = err?.message || String(err);
        console.warn(
          "[COSMOS Narration] Server audio synthesis unavailable, using Web Speech fallback:",
          msg.slice(0, 100),
        );
        this.playWebSpeechFallback(segment);
        return;
      }
    }

    if (this.state.status !== "loading" && this.state.status !== "playing") return;

    if (!base64Audio) {
      this.playWebSpeechFallback(segment);
      return;
    }

    // 2. Play synthesized WAV audio via HTML5 Audio element
    try {
      const audioUrl = `data:audio/wav;base64,${base64Audio}`;
      const audio = new Audio(audioUrl);
      audio.playbackRate = this.state.speechSpeed;
      this.currentAudioElement = audio;

      audio.onended = () => {
        // CONFIRMED COMPLETION INVARIANT:
        // Advance confirmed cursor ONLY when playback actually completes!
        this.onSegmentPlaybackActuallyCompleted(segment);
      };

      audio.onerror = () => {
        if (this.state.status !== "loading" && this.state.status !== "playing") return;
        console.warn("Audio playback error, falling back to Web Speech:", audio.error);
        this.playWebSpeechFallback(segment);
      };

      await audio.play();
      if (this.state.status === "loading" || this.state.status === "playing") {
        this.updateState({
          status: "playing",
          audioSource: "gemini-tts",
        });
      }
    } catch (err: any) {
      if (this.state.status !== "loading" && this.state.status !== "playing") return;
      if (err.name === "NotAllowedError") {
        // Browser autoplay restriction
        this.updateState({
          status: "paused",
          errorMessage: "Autoplay blocked by browser. Click Play to start narration.",
        });
      } else {
        console.warn("HTML5 audio playback error, falling back:", err);
        this.playWebSpeechFallback(segment);
      }
    }
  }

  /**
   * Fallback to Web Speech API when offline or when server synthesis is unavailable.
   */
  private playWebSpeechFallback(segment: NarrationSegment): void {
    if (this.state.status !== "loading" && this.state.status !== "playing") return;
    if (typeof window === "undefined" || !window.speechSynthesis) {
      // If no speech synthesis in environment, use text-only pacing
      this.playTextOnlySegment(segment);
      return;
    }

    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(segment.spokenText);
      utterance.rate = this.state.speechSpeed;
      utterance.lang = segment.language === "hi" ? "hi-IN" : "en-US";

      utterance.onstart = () => {
        this.updateState({
          status: "playing",
          audioSource: "web-speech",
        });
      };

      utterance.onend = () => {
        // CONFIRMED COMPLETION INVARIANT:
        this.onSegmentPlaybackActuallyCompleted(segment);
      };

      utterance.onerror = (e) => {
        if (e.error !== "canceled" && e.error !== "interrupted") {
          console.warn("Speech synthesis error:", e.error);
          this.updateState({
            status: "error",
            errorMessage: `Speech synthesis error: ${e.error}`,
          });
        }
      };

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("Web Speech API failed, falling back to text-only mode:", err);
      this.playTextOnlySegment(segment);
    }
  }

  /**
   * Invoked ONLY when playback actually completes.
   * Advances the confirmed cursor in NarrationCursorManager.
   */
  private onSegmentPlaybackActuallyCompleted(segment: NarrationSegment): void {
    NarrationCursorManager.markSegmentConfirmedCompleted({
      moduleId: segment.moduleId,
      lessonId: segment.lessonId,
      sectionId: segment.sectionId,
      segmentId: segment.segmentId,
      sequenceNumber: segment.sequenceNumber,
    });

    if (this.currentIndex < this.segments.length - 1) {
      this.nextSegment();
    } else {
      this.updateState({
        status: "completed",
        progressPercentage: 100,
      });
    }
  }

  /**
   * Dispatches text synchronization event for UI highlight & auto-scroll.
   */
  private dispatchTextSyncEvent(segment: NarrationSegment | null): void {
    if (!segment || typeof window === "undefined" || !window.dispatchEvent) return;

    try {
      const event = new CustomEvent("cosmos:narration-sync", {
        detail: {
          moduleId: segment.moduleId,
          lessonId: segment.lessonId,
          sectionId: segment.sectionId,
          segmentId: segment.segmentId,
          sequenceNumber: segment.sequenceNumber,
          displayText: segment.displayText,
          spokenText: segment.spokenText,
        },
      });
      window.dispatchEvent(event);
    } catch (err) {
      void err;
    }
  }

  /**
   * Subscribes to narration state changes.
   */
  public subscribe(listener: (state: NarrationState) => void): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getState(): NarrationState {
    return { ...this.state };
  }

  private updateState(updates: Partial<NarrationState>): void {
    this.state = {
      ...this.state,
      ...updates,
    };
    const copy = { ...this.state };
    for (const listener of this.listeners) {
      try {
        listener(copy);
      } catch (err) {
        console.error("Error in narration listener:", err);
      }
    }
  }
}
