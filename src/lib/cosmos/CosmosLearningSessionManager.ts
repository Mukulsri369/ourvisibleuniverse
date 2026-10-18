/**
 * COSMOS Learning Session Manager
 * Project: Our Visible Universe Academy
 * Scope: Phase 1 Continuity and Lesson Resumption (Part 10)
 *
 * Persists and restores student guided learning sessions across navigation,
 * interruptions, page reloads, and network reconnection without losing position.
 */

import type { LearningLevel } from "../academy/types";
import type { CosmosLearningSessionRecord } from "./learning-director-types";

const SESSION_STORAGE_KEY = "ovu_cosmos_learning_session_v1";
const RECENT_MODULE_KEY = "ovu_cosmos_recent_guided_module";

export class CosmosLearningSessionManager {
  private static memorySession: CosmosLearningSessionRecord | null = null;

  /**
   * Saves active guided session to persistent storage.
   */
  public static saveSession(record: CosmosLearningSessionRecord): void {
    if (!record || !record.moduleId) return;

    const snapshot: CosmosLearningSessionRecord = {
      ...record,
      updatedAt: new Date().toISOString(),
    };

    this.memorySession = snapshot;

    if (typeof window !== "undefined") {
      try {
        if (window.localStorage) {
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(snapshot));
          localStorage.setItem(RECENT_MODULE_KEY, record.moduleId);
        }
        if (window.sessionStorage) {
          sessionStorage.setItem(`${SESSION_STORAGE_KEY}_${record.moduleId}`, JSON.stringify(snapshot));
        }
      } catch (err) {
        console.warn("Could not persist COSMOS learning session:", err);
      }
    }
  }

  /**
   * Retrieves active guided session for a specific module or the most recent module.
   */
  public static getSession(moduleId?: string): CosmosLearningSessionRecord | null {
    if (this.memorySession) {
      if (!moduleId || this.memorySession.moduleId === moduleId) {
        return this.memorySession;
      }
    }

    if (typeof window !== "undefined") {
      try {
        if (moduleId && window.sessionStorage) {
          const rawModule = sessionStorage.getItem(`${SESSION_STORAGE_KEY}_${moduleId}`);
          if (rawModule) {
            const parsed = JSON.parse(rawModule) as CosmosLearningSessionRecord;
            this.memorySession = parsed;
            return parsed;
          }
        }

        if (window.localStorage) {
          const raw = localStorage.getItem(SESSION_STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw) as CosmosLearningSessionRecord;
            if (!moduleId || parsed.moduleId === moduleId) {
              this.memorySession = parsed;
              return parsed;
            }
          }
        }
      } catch (err) {
        console.warn("Could not read COSMOS learning session:", err);
      }
    }

    return null;
  }

  /**
   * Checks if a restorable session exists.
   */
  public static hasRestorableSession(moduleId?: string): boolean {
    const session = this.getSession(moduleId);
    if (!session) return false;
    return session.sessionStatus !== "completed";
  }

  /**
   * Clears saved session upon course completion or explicit user reset.
   */
  public static clearSession(moduleId?: string): void {
    if (this.memorySession && (!moduleId || this.memorySession.moduleId === moduleId)) {
      this.memorySession = null;
    }

    if (typeof window !== "undefined") {
      try {
        if (moduleId && window.sessionStorage) {
          sessionStorage.removeItem(`${SESSION_STORAGE_KEY}_${moduleId}`);
        }
        if (window.localStorage) {
          if (!moduleId) {
            localStorage.removeItem(SESSION_STORAGE_KEY);
            localStorage.removeItem(RECENT_MODULE_KEY);
          } else {
            const current = this.getSession();
            if (current && current.moduleId === moduleId) {
              localStorage.removeItem(SESSION_STORAGE_KEY);
            }
          }
        }
      } catch (err) {
        console.warn("Could not clear COSMOS learning session:", err);
      }
    }
  }

  /**
   * Helper to construct a canonical session record.
   */
  public static createRecord(params: {
    studentId?: string;
    courseId?: string;
    courseVersion?: string;
    moduleId: string;
    moduleTitle: string;
    lessonId: string;
    lessonTitle: string;
    sectionId: string;
    stepId: string;
    stepIndex: number;
    totalSteps: number;
    narrationSegmentId?: string;
    learningLevel: LearningLevel;
    confirmedPlaybackPosition: number;
    sessionStatus?: "active" | "paused" | "completed" | "interrupted";
  }): CosmosLearningSessionRecord {
    return {
      studentId: params.studentId,
      courseId: params.courseId || "cosmic-journey",
      courseVersion: params.courseVersion || "1.0.0",
      moduleId: params.moduleId,
      moduleTitle: params.moduleTitle,
      lessonId: params.lessonId,
      lessonTitle: params.lessonTitle,
      sectionId: params.sectionId,
      stepId: params.stepId,
      stepIndex: params.stepIndex,
      totalSteps: params.totalSteps,
      narrationSegmentId: params.narrationSegmentId,
      learningLevel: params.learningLevel,
      confirmedPlaybackPosition: params.confirmedPlaybackPosition,
      sessionStatus: params.sessionStatus || "active",
      updatedAt: new Date().toISOString(),
    };
  }
}
