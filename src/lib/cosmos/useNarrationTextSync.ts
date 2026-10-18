/**
 * COSMOS Text Synchronization & Gentle Auto-Scroll Hook
 * Project: Our Visible Universe Academy
 * Scope: Prompt 13 Text Synchronization & Visual Highlighting
 *
 * Synchronizes the currently narrated sentence/segment with the DOM,
 * highlights active instructional sections, and scrolls gently without
 * interrupting students who are manually browsing or navigating.
 */

import { useEffect, useRef, useState } from "react";
import { LearningPreferenceManager } from "./LearningPreferenceManager";

export interface NarrationSyncDetail {
  moduleId: string;
  lessonId: string;
  sectionId: string;
  segmentId: string;
  sequenceNumber: number;
  displayText: string;
  spokenText: string;
}

export function useNarrationTextSync(moduleId: string) {
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [activeDisplayText, setActiveDisplayText] = useState<string | null>(null);
  const [activeSpokenText, setActiveSpokenText] = useState<string | null>(null);
  const [isNarrating, setIsNarrating] = useState<boolean>(false);

  // Invariant: Never force scrolling while student is manually navigating
  const lastUserInteractionTime = useRef<number>(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Detect student manual navigation interactions
    const handleUserInteraction = () => {
      lastUserInteractionTime.current = Date.now();
    };

    window.addEventListener("wheel", handleUserInteraction, { passive: true });
    window.addEventListener("touchmove", handleUserInteraction, { passive: true });
    window.addEventListener("keydown", (e) => {
      if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(e.key)) {
        lastUserInteractionTime.current = Date.now();
      }
    });

    const handleSync = (e: CustomEvent<NarrationSyncDetail>) => {
      const detail = e.detail;
      if (!detail || detail.moduleId !== moduleId) return;

      setActiveSegmentId(detail.segmentId);
      setActiveSectionId(detail.sectionId);
      setActiveLessonId(detail.lessonId);
      setActiveDisplayText(detail.displayText);
      setActiveSpokenText(detail.spokenText);
      setIsNarrating(true);

      // Check gentle auto-scroll conditions:
      // 1. Feature enabled in user preferences
      // 2. Student has NOT manually scrolled within the last 5 seconds
      const prefs = LearningPreferenceManager.getPreferences();
      const hasRecentUserScroll = Date.now() - lastUserInteractionTime.current < 5000;

      if (prefs.autoScrollEnabled && !hasRecentUserScroll && typeof document !== "undefined") {
        const targetElement =
          document.querySelector(`[data-cosmos-segment="${detail.segmentId}"]`) ||
          document.querySelector(`[data-cosmos-section="${detail.sectionId}"]`) ||
          document.getElementById(`m${moduleId}-sec-${detail.sectionId}`) ||
          document.getElementById(`sec-${detail.sectionId}`);

        if (targetElement) {
          const rect = targetElement.getBoundingClientRect();
          const inView = rect.top >= 90 && rect.bottom <= window.innerHeight - 90;
          if (!inView) {
            targetElement.scrollIntoView({
              behavior: "smooth",
              block: "nearest",
            });
          }
        }
      }
    };

    window.addEventListener("cosmos:narration-sync" as any, handleSync);

    return () => {
      window.removeEventListener("wheel", handleUserInteraction);
      window.removeEventListener("touchmove", handleUserInteraction);
      window.removeEventListener("cosmos:narration-sync" as any, handleSync);
    };
  }, [moduleId]);

  return {
    activeSegmentId,
    activeSectionId,
    activeLessonId,
    activeDisplayText,
    activeSpokenText,
    isNarrating,
  };
}
