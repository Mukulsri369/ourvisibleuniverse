/**
 * COSMOS LearningPreferenceManager
 * Project: Our Visible Universe Academy
 *
 * Manages student learning modes, narration preferences, and enforces
 * strict Examination Mode lockouts where AI help is disabled.
 */

import {
  COSMOS_DEFAULT_PREFERENCES,
  type CosmosLearningMode,
  type CosmosPreferences,
  type CosmosVoiceName,
} from "./cosmos-types";

const PREFS_STORAGE_KEY = "ovu_cosmos_student_preferences";

export class LearningPreferenceManager {
  private static currentPreferences: CosmosPreferences = { ...COSMOS_DEFAULT_PREFERENCES };
  private static listeners: Set<(prefs: CosmosPreferences) => void> = new Set();
  private static isInitialized = false;

  private static init(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;

    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const raw = localStorage.getItem(PREFS_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          this.currentPreferences = {
            ...COSMOS_DEFAULT_PREFERENCES,
            ...parsed,
          };
        }
      } catch (err) {
        console.warn("Could not read COSMOS preferences from localStorage:", err);
      }
    }
  }

  /**
   * Retrieves current preferences with examination mode override checks.
   */
  public static getPreferences(): CosmosPreferences {
    this.init();
    return { ...this.currentPreferences };
  }

  /**
   * Updates student preferences and notifies active listeners.
   */
  public static setPreferences(updates: Partial<CosmosPreferences>): CosmosPreferences {
    this.init();

    this.currentPreferences = {
      ...this.currentPreferences,
      ...updates,
    };

    if (typeof window !== "undefined" && window.localStorage) {
      try {
        localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(this.currentPreferences));
      } catch (err) {
        console.warn("Could not write COSMOS preferences to localStorage:", err);
      }
    }

    this.notifyListeners();
    return { ...this.currentPreferences };
  }

  /**
   * Switches the active learning mode.
   */
  public static setMode(mode: CosmosLearningMode): void {
    this.setPreferences({ mode });
  }

  public static updatePreferences(updates: Partial<CosmosPreferences>): CosmosPreferences {
    return this.setPreferences(updates);
  }

  public static setVoiceName(voiceName: CosmosVoiceName): void {
    this.setPreferences({ preferredVoiceName: voiceName });
  }

  public static setTextOnlyMode(enabled: boolean): void {
    this.setPreferences({ textOnlyMode: enabled });
  }

  public static setAutoScroll(enabled: boolean): void {
    this.setPreferences({ autoScrollEnabled: enabled });
  }

  public static setHandsFreeBargeIn(enabled: boolean): void {
    this.setPreferences({ handsFreeBargeIn: enabled });
  }

  public static setAutoResumeAfterDiscussion(enabled: boolean): void {
    this.setPreferences({ autoResumeAfterDiscussion: enabled });
  }

  public static setFollowUpWindowSeconds(seconds: number): void {
    this.setPreferences({ followUpWindowSeconds: Math.max(3, Math.min(seconds, 30)) });
  }

  public static setVadSensitivity(val: number): void {
    this.setPreferences({ vadSensitivity: Math.max(0.1, Math.min(val, 1.0)) });
  }

  public static setPushToTalk(enabled: boolean): void {
    this.setPreferences({ pushToTalkEnabled: enabled });
  }

  /**
   * Examination Mode Guard:
   * Returns false when in examination mode or when taking official qualification assessments.
   */
  public static isConversationalHelpPermitted(activeExamAttempt = false): boolean {
    const prefs = this.getPreferences();
    if (activeExamAttempt || prefs.mode === "exam") {
      return false;
    }
    return true;
  }

  /**
   * Subscribes to preference changes.
   */
  public static subscribe(listener: (prefs: CosmosPreferences) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private static notifyListeners(): void {
    const copy = { ...this.currentPreferences };
    for (const listener of this.listeners) {
      try {
        listener(copy);
      } catch (err) {
        console.error("Error in cosmos preference listener:", err);
      }
    }
  }
}
