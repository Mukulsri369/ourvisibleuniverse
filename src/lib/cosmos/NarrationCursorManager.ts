/**
 * COSMOS NarrationCursorManager
 * Project: Our Visible Universe Academy
 *
 * Tracks, synchronizes, and persists the student's narration cursor position
 * across lessons, modules, and sessions without losing their active reading spot.
 */

import type { NarrationCursor } from "./cosmos-types";

const CURSOR_STORAGE_PREFIX = "ovu_cosmos_cursor_";

export class NarrationCursorManager {
  private static inMemoryStore = new Map<string, NarrationCursor>();

  /**
   * Saves the narration cursor position for a given module.
   */
  public static saveCursor(cursor: NarrationCursor): void {
    if (!cursor || !cursor.moduleId) return;

    const payload: NarrationCursor = {
      ...cursor,
      updatedAt: new Date().toISOString(),
    };

    this.inMemoryStore.set(cursor.moduleId, payload);

    if (typeof window !== "undefined" && window.sessionStorage) {
      try {
        sessionStorage.setItem(
          `${CURSOR_STORAGE_PREFIX}${cursor.moduleId}`,
          JSON.stringify(payload),
        );
      } catch (err) {
        console.warn("Could not write cosmos cursor to sessionStorage:", err);
      }
    }
  }

  /**
   * Retrieves the current narration cursor for a module.
   */
  public static getCursor(moduleId: string): NarrationCursor | null {
    if (!moduleId) return null;

    if (this.inMemoryStore.has(moduleId)) {
      return this.inMemoryStore.get(moduleId)!;
    }

    if (typeof window !== "undefined" && window.sessionStorage) {
      try {
        const raw = sessionStorage.getItem(`${CURSOR_STORAGE_PREFIX}${moduleId}`);
        if (raw) {
          const parsed = JSON.parse(raw) as NarrationCursor;
          this.inMemoryStore.set(moduleId, parsed);
          return parsed;
        }
      } catch (err) {
        console.warn("Could not read cosmos cursor from sessionStorage:", err);
      }
    }

    return null;
  }

  /**
   * Records a segment as confirmed completed ONLY when playback actually completes.
   * Invariant: Never advances confirmed cursor merely on audio generation or estimation.
   */
  public static markSegmentConfirmedCompleted(params: {
    moduleId: string;
    lessonId: string;
    sectionId: string;
    sublessonId?: string;
    segmentId: string;
    sequenceNumber: number;
  }): void {
    const { moduleId, lessonId, sectionId, sublessonId, segmentId, sequenceNumber } = params;

    const existing = this.getCursor(moduleId) || {
      moduleId,
      lessonId,
      sectionId,
      sublessonId,
      segmentId,
      sequenceNumber,
      lastConfirmedCompletedSegmentId: segmentId,
      currentPlaybackState: "completed" as const,
      playbackPositionSeconds: 0,
      completedSegmentIds: [],
      updatedAt: new Date().toISOString(),
    };

    if (!existing.completedSegmentIds.includes(segmentId)) {
      existing.completedSegmentIds.push(segmentId);
    }
    existing.lessonId = lessonId || existing.lessonId;
    existing.sectionId = sectionId || existing.sectionId;
    existing.sublessonId = sublessonId || existing.sublessonId;
    existing.segmentId = segmentId;
    existing.sequenceNumber = sequenceNumber;
    existing.lastConfirmedCompletedSegmentId = segmentId;
    existing.currentPlaybackState = "completed";

    this.saveCursor(existing);
  }

  /**
   * Clears cursor for a module upon completion or reset.
   */
  public static clearCursor(moduleId: string): void {
    this.inMemoryStore.delete(moduleId);
    if (typeof window !== "undefined" && window.sessionStorage) {
      try {
        sessionStorage.removeItem(`${CURSOR_STORAGE_PREFIX}${moduleId}`);
      } catch (err) {
        void err;
      }
    }
  }
}
