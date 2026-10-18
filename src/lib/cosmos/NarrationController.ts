/**
 * COSMOS NarrationController
 * Project: Our Visible Universe Academy
 * Scope: Prompt 12 Speech Narration State Machine & Interruption Controls
 *
 * Coordinates speech synthesis, segment tracking, audio buffer management,
 * and immediate voice interruption upon student interaction.
 */

import type { NarrationSegment, NarrationState } from "./cosmos-types";
import { NarrationCursorManager } from "./NarrationCursorManager";
import { VisualizationActionController } from "./VisualizationActionController";

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
    elapsedSeconds: 0,
  };

  private listeners: Set<(state: NarrationState) => void> = new Set();
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSynthesizing = false;

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
      progressPercentage:
        segments.length > 0 ? (this.currentIndex / segments.length) * 100 : 0,
      language: current?.language || "en",
      elapsedSeconds: 0,
    });
  }

  /**
   * Starts playing narration from the current segment.
   */
  public play(): void {
    if (this.segments.length === 0) return;

    const segment = this.segments[this.currentIndex];
    if (!segment) return;

    this.updateState({ status: "playing" });

    // Sync 3D visualization if specified
    if (segment.visualizationReference) {
      VisualizationActionController.dispatchAction(segment.visualizationReference);
    }

    // Update cursor
    NarrationCursorManager.markSegmentCompleted(segment.moduleId, segment.segmentId);

    this.speakCurrentSegment();
  }

  /**
   * Pauses the active narration speech.
   */
  public pause(): void {
    if (this.state.status !== "playing") return;

    if (typeof window !== "undefined" && window.speechSynthesis) {
      try {
        window.speechSynthesis.pause();
      } catch (err) {
        console.warn("speechSynthesis.pause warning:", err);
      }
    }

    this.updateState({ status: "paused" });
  }

  /**
   * Resumes paused narration speech.
   */
  public resume(): void {
    if (this.state.status !== "paused") return;

    if (typeof window !== "undefined" && window.speechSynthesis) {
      try {
        window.speechSynthesis.resume();
      } catch (err) {
        console.warn("speechSynthesis.resume warning:", err);
      }
    }

    this.updateState({ status: "playing" });
  }

  /**
   * CRITICAL REQUIREMENT: VOICE INTERRUPTION
   * Immediately stops audio playback, cancels pending synthesis buffers,
   * preserves the active reading position, and sets status to 'interrupted'.
   */
  public interrupt(): void {
    this.clearAudioBuffers();
    this.updateState({ status: "interrupted" });
  }

  /**
   * Stops narration and resets state.
   */
  public stop(): void {
    this.clearAudioBuffers();
    this.updateState({ status: "idle" });
  }

  /**
   * Clears all hardware and browser audio buffers.
   */
  private clearAudioBuffers(): void {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch (err) {
        console.warn("speechSynthesis.cancel warning:", err);
      }
    }
    this.currentUtterance = null;
    this.isSynthesizing = false;
  }

  /**
   * Advances to the next segment.
   */
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
  public prevSegment(): void {
    if (this.currentIndex > 0) {
      this.seekSegment(this.currentIndex - 1);
    }
  }

  /**
   * Seeks to a specific segment index.
   */
  public seekSegment(index: number): void {
    const wasPlaying = this.state.status === "playing";
    this.clearAudioBuffers();

    this.currentIndex = Math.max(0, Math.min(index, this.segments.length - 1));
    const current = this.segments[this.currentIndex] || null;

    this.updateState({
      currentSegmentIndex: this.currentIndex,
      currentSegment: current,
      progressPercentage:
        this.segments.length > 0 ? (this.currentIndex / this.segments.length) * 100 : 0,
    });

    if (current?.visualizationReference) {
      VisualizationActionController.dispatchAction(current.visualizationReference);
    }

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
    if (this.currentUtterance) {
      this.currentUtterance.rate = clamped;
    }
  }

  /**
   * Synthesizes spokenText using SpeechSynthesis.
   */
  private speakCurrentSegment(): void {
    const segment = this.segments[this.currentIndex];
    if (!segment) return;

    if (typeof window === "undefined" || !window.speechSynthesis) {
      // In headless / test environments, transition cleanly
      return;
    }

    try {
      this.clearAudioBuffers();

      const utterance = new SpeechSynthesisUtterance(segment.spokenText);
      utterance.rate = this.state.speechSpeed;
      utterance.lang = segment.language === "hi" ? "hi-IN" : "en-US";

      utterance.onend = () => {
        this.isSynthesizing = false;
        if (this.state.status === "playing") {
          this.nextSegment();
        }
      };

      utterance.onerror = (e) => {
        // Canceled is expected on interrupt
        if (e.error !== "canceled" && e.error !== "interrupted") {
          console.warn("Speech synthesis error:", e.error);
        }
        this.isSynthesizing = false;
      };

      this.currentUtterance = utterance;
      this.isSynthesizing = true;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("Could not initiate speech synthesis:", err);
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
