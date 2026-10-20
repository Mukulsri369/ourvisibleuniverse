/**
 * COSMOS Lesson Navigator & Smart Screen Scrolling
 * Project: Our Visible Universe Academy
 * Scope: Phase 1 Smart Screen Scrolling (Part 5) & Active Lesson Tab Control (Part 7)
 *
 * Implements context-aware, smooth, accessible viewport navigation.
 * Never fights the student for viewport control.
 */

import { LearningPreferenceManager } from "./LearningPreferenceManager";
import type { TabSwitchEvent, TabSwitchHandler } from "./learning-director-types";

export interface ScrollOptions {
  offsetY?: number;
  behavior?: ScrollBehavior;
  force?: boolean;
}

export class CosmosLessonNavigator {
  private static instance: CosmosLessonNavigator | null = null;

  // Registered tab switch handlers per module
  private tabHandlers: Map<string, TabSwitchHandler> = new Map();

  // Manual scrolling suspension state
  private isUserScrolledAway = false;
  private lastUserInteractionTime = 0;
  private autoScrollSuspendedUntil = 0;
  private lastScrolledTargetSelector: string | null = null;
  private activeTargetElement: HTMLElement | null = null;

  // Listeners for scroll state changes (e.g., to notify UI about "Return to Guided Position")
  private stateChangeListeners: Set<(isScrolledAway: boolean) => void> = new Set();

  private constructor() {
    this.initUserInteractionListeners();
  }

  public static getInstance(): CosmosLessonNavigator {
    if (!this.instance) {
      this.instance = new CosmosLessonNavigator();
    }
    return this.instance;
  }

  /**
   * Registers a tab switcher callback for a module's React component.
   */
  public registerTabHandler(moduleId: string, handler: TabSwitchHandler): () => void {
    this.tabHandlers.set(moduleId, handler);
    return () => {
      if (this.tabHandlers.get(moduleId) === handler) {
        this.tabHandlers.delete(moduleId);
      }
    };
  }

  /**
   * Switches to the appropriate sublesson tab for a module.
   */
  public async switchTab(event: TabSwitchEvent): Promise<boolean> {
    const handler = this.tabHandlers.get(event.moduleId);
    if (handler) {
      try {
        await handler(event);
        await this.waitForNextFrame(3);
        return true;
      } catch (err) {
        console.warn(`Could not switch tab for module ${event.moduleId}:`, err);
      }
    }

    if (typeof document !== "undefined") {
      // Do not click DOM tabs in the background while Fullscreen Cinematic Mode is active
      if (document.querySelector('[data-testid="cosmos-cinematic-viewport"]')) {
        return true;
      }

      // 1. Ensure top-level "Curriculum Overview" / "Lessons" / "Sub-Lessons" tab is open if module uses tabbed views
      await this.ensureModuleSectionVisible("sublessons");

      // 2. Check explicit data attributes first
      const tabBtn =
        document.querySelector(`[data-tab-sublesson="${event.sublessonId}"]`) ||
        document.querySelector(`[data-tab-index="${event.sublessonIndex}"]`);
      if (tabBtn && typeof (tabBtn as HTMLElement).click === "function") {
        (tabBtn as HTMLElement).click();
        await this.waitForNextFrame(2);
        return true;
      }

      // 3. Universal fallback across all 24 module layouts: find sublesson button by index or ID
      // Exclude any buttons inside dialogs, headers, or the cinematic player
      const idxOne = (event.sublessonIndex || 0) + 1;
      const paddedIdx = idxOne < 10 ? `0${idxOne}` : `${idxOne}`;
      const buttons = Array.from(document.querySelectorAll("button")).filter(
        (btn) =>
          !btn.closest('[data-testid="cosmos-cinematic-viewport"]') &&
          !btn.closest('[role="dialog"]') &&
          !btn.closest("header"),
      );
      const matchBtn = buttons.find((btn) => {
        const text = (btn.textContent || "").trim();
        if (
          event.sublessonId &&
          event.sublessonId.length > 3 &&
          btn.getAttribute("data-sublesson-id") === event.sublessonId
        ) {
          return true;
        }
        return (
          text.startsWith(`Lesson ${paddedIdx}`) ||
          text.startsWith(`Lesson ${idxOne}`) ||
          text.startsWith(`Ch ${paddedIdx}`) ||
          text.startsWith(`Chapter ${paddedIdx}`) ||
          new RegExp(`^\\s*(Lesson|Ch|Chapter|Sub-lesson)\\s*0?${idxOne}\\b`, "i").test(text)
        );
      });

      if (matchBtn) {
        matchBtn.click();
        await this.waitForNextFrame(2);
        return true;
      }
    }
    return false;
  }

  /**
   * Ensures the appropriate top-level tab (lab/visualizer, sublessons/curriculum, or quiz) is active
   * on modules that organize content into top-level tabs (e.g., Modules 12, 19–24).
   */
  public async ensureModuleSectionVisible(
    sectionType: "sublessons" | "activity" | "quiz",
  ): Promise<boolean> {
    if (typeof document === "undefined") return false;
    if (document.querySelector('[data-testid="cosmos-cinematic-viewport"]')) {
      return false;
    }

    const buttons = Array.from(document.querySelectorAll("button")).filter(
      (btn) =>
        !btn.closest('[data-testid="cosmos-cinematic-viewport"]') &&
        !btn.closest('[role="dialog"]') &&
        !btn.closest("header"),
    );
    let matcher: (text: string) => boolean;

    if (sectionType === "sublessons") {
      matcher = (t) =>
        t.includes("curriculum overview") ||
        t.includes("core lessons") ||
        t.includes("sub-lessons") ||
        t.includes("sublessons") ||
        t.includes("theory & lessons");
    } else if (sectionType === "activity") {
      matcher = (t) =>
        t.includes("physics laboratory") ||
        t.includes("interactive lab") ||
        t.includes("3d visualizer") ||
        t.includes("observatory lab") ||
        t.includes("space museum") ||
        t.includes("historical models") ||
        t.includes("timeline lab");
    } else {
      matcher = (t) =>
        t.includes("master quiz") ||
        t.includes("knowledge check") ||
        t.includes("module quiz") ||
        t.includes("take quiz");
    }

    const tabBtn = buttons.find((b) => matcher((b.textContent || "").toLowerCase()));
    if (tabBtn) {
      tabBtn.click();
      await this.waitForNextFrame(2);
      return true;
    }
    return false;
  }

  /**
   * Automatically scrolls to an instructional element.
   * Respects student priority, reduced-motion, and viewport margins.
   */
  public async scrollToTarget(selectorOrId: string, options: ScrollOptions = {}): Promise<boolean> {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return false;
    }

    // Do not scroll the background page while Fullscreen Cinematic Mode is open
    if (!options.force && document.querySelector('[data-testid="cosmos-cinematic-viewport"]')) {
      this.lastScrolledTargetSelector = selectorOrId;
      return true;
    }

    const prefs = LearningPreferenceManager.getPreferences();
    if (!prefs.autoScrollEnabled && !options.force) {
      return false;
    }

    // Check if auto-scroll is temporarily suspended due to student interaction
    if (!options.force && this.isAutoScrollSuspended()) {
      this.isUserScrolledAway = true;
      this.notifyListeners();
      return false;
    }

    // Ensure the relevant top-level tab is open before resolving the element
    const cleanTarget = (selectorOrId || "").toLowerCase();
    if (cleanTarget.includes("quiz") || cleanTarget.includes("assessment")) {
      await this.ensureModuleSectionVisible("quiz");
    } else if (
      cleanTarget.includes("activities") ||
      cleanTarget.includes("visualizer") ||
      cleanTarget.includes("lab")
    ) {
      await this.ensureModuleSectionVisible("activity");
    } else if (cleanTarget.includes("-sec-")) {
      await this.ensureModuleSectionVisible("sublessons");
    }

    // Resolve target element from selector, ID, or cosmos data attributes
    const target = this.resolveElement(selectorOrId);
    if (!target) {
      return false;
    }

    this.activeTargetElement = target;
    this.lastScrolledTargetSelector = selectorOrId;

    // Check accessibility reduced-motion preference
    const prefersReducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const behavior: ScrollBehavior = prefersReducedMotion ? "auto" : options.behavior || "smooth";

    // Header offset to avoid fixed navbar occlusion (80px header baseline)
    const headerOffset = options.offsetY !== undefined ? options.offsetY : 90;

    const rect = target.getBoundingClientRect();
    const isAlreadyInComfortableReadingZone =
      rect.top >= headerOffset && rect.bottom <= window.innerHeight - 80;

    if (isAlreadyInComfortableReadingZone && !options.force) {
      this.isUserScrolledAway = false;
      this.notifyListeners();
      return true;
    }

    // Compute target absolute scroll position
    const absoluteTop = window.scrollY + rect.top - headerOffset;
    const clampedTop = Math.max(0, absoluteTop);

    window.scrollTo({
      top: clampedTop,
      behavior,
    });

    this.isUserScrolledAway = false;
    this.notifyListeners();
    return true;
  }

  /**
   * Restores the view to the current guided lesson section.
   */
  public async returnToGuidedPosition(): Promise<boolean> {
    this.autoScrollSuspendedUntil = 0;
    this.isUserScrolledAway = false;
    this.notifyListeners();

    if (this.lastScrolledTargetSelector) {
      return this.scrollToTarget(this.lastScrolledTargetSelector, { force: true });
    }
    if (this.activeTargetElement) {
      this.activeTargetElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
      return true;
    }
    return false;
  }

  /**
   * Resolves DOM element using stable selectors and semantic fallback IDs across all 24 modules.
   */
  public resolveElement(target: string): HTMLElement | null {
    if (!target || typeof document === "undefined") return null;

    // 1. Exact selector query
    try {
      const el = document.querySelector(target);
      if (el instanceof HTMLElement) return el;
    } catch {
      // not a valid selector string
    }

    // 2. Direct ID lookup (strip leading # or extract value if an attribute selector was passed)
    const attrMatch = target.match(/\[data-[a-z-]+=["']?([^"'\]\s]+)["']?\]/i);
    const cleanId = (attrMatch ? attrMatch[1] : target.replace(/^#/, "")).replace(/["'[\]]/g, "");
    if (!cleanId) return null;

    const byId = document.getElementById(cleanId);
    if (byId) return byId;

    // 3. Cosmos data attribute lookups (including normalized base section ID)
    try {
      const bySegment = document.querySelector(`[data-cosmos-segment="${cleanId}"]`);
      if (bySegment instanceof HTMLElement) return bySegment;

      const secMatch = cleanId.match(/-sec-(.+)$/);
      const rawSec = secMatch ? secMatch[1] : cleanId;
      const baseSec = rawSec.replace(/-\d+$/, "");

      const bySection =
        document.querySelector(`[data-cosmos-section="${rawSec}"]`) ||
        document.querySelector(`[data-cosmos-section="${baseSec}"]`) ||
        document.querySelector(`[id$="-sec-${baseSec}"]`);
      if (bySection instanceof HTMLElement) return bySection;

      const byStep = document.querySelector(`[data-cosmos-step="${cleanId}"]`);
      if (byStep instanceof HTMLElement) return byStep;
    } catch {
      // ignore selector syntax errors
    }

    const secMatch = cleanId.match(/-sec-(.+)$/);

    // 4. Semantic region fallbacks across all 24 modules
    if (cleanId.endsWith("-quiz")) {
      const quizEl =
        document.querySelector('[role="region"][aria-label="Module Knowledge Assessment"]') ||
        document.querySelector('[id$="-quiz"]');
      if (quizEl instanceof HTMLElement) return quizEl;
    }

    if (cleanId.endsWith("-checklist")) {
      const checklistEl =
        document.getElementById("module-completion-checklist") ||
        document.querySelector('[role="region"][aria-label="Module Completion Checklist"]') ||
        document.querySelector('[id$="-checklist"]');
      if (checklistEl instanceof HTMLElement) return checklistEl;
    }

    if (cleanId.endsWith("-activities") || cleanId.endsWith("-visualizer")) {
      const actEl =
        document.querySelector("[data-cosmos-activity]") ||
        document.querySelector('[id$="-activities"]') ||
        document.querySelector('[id$="-visualizer"]') ||
        document.querySelector("canvas")?.parentElement ||
        document.querySelector("section");
      if (actEl instanceof HTMLElement) return actEl;
    }

    if (cleanId.endsWith("-hero") || secMatch) {
      const firstSection = document.querySelector("main h1, main section, h1");
      if (firstSection instanceof HTMLElement) return firstSection;
    }

    return null;
  }

  /**
   * Initializes listeners to detect when the student manually scrolls.
   */
  private initUserInteractionListeners(): void {
    if (typeof window === "undefined") return;

    const handleInteraction = () => {
      this.lastUserInteractionTime = Date.now();
      // Suspend automatic scrolling for 7 seconds after student manual interaction
      this.autoScrollSuspendedUntil = Date.now() + 7000;

      // Check if user has scrolled away from active reading target
      if (this.activeTargetElement) {
        const rect = this.activeTargetElement.getBoundingClientRect();
        const outOfView = rect.bottom < 50 || rect.top > window.innerHeight - 50;
        if (outOfView && !this.isUserScrolledAway) {
          this.isUserScrolledAway = true;
          this.notifyListeners();
        }
      }
    };

    window.addEventListener("wheel", handleInteraction, { passive: true });
    window.addEventListener("touchmove", handleInteraction, { passive: true });
    window.addEventListener("keydown", (e) => {
      if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(e.key)) {
        handleInteraction();
      }
    });
  }

  public isAutoScrollSuspended(): boolean {
    return Date.now() < this.autoScrollSuspendedUntil;
  }

  public getIsUserScrolledAway(): boolean {
    return this.isUserScrolledAway;
  }

  public subscribeState(listener: (isScrolledAway: boolean) => void): () => void {
    this.stateChangeListeners.add(listener);
    return () => this.stateChangeListeners.delete(listener);
  }

  private notifyListeners(): void {
    for (const listener of this.stateChangeListeners) {
      try {
        listener(this.isUserScrolledAway);
      } catch (err) {
        console.warn("Error in scroll listener:", err);
      }
    }
  }

  private waitForNextFrame(frames = 1): Promise<void> {
    return new Promise((resolve) => {
      let count = 0;
      const step = () => {
        count++;
        if (count >= frames) {
          resolve();
        } else {
          requestAnimationFrame(step);
        }
      };
      requestAnimationFrame(step);
    });
  }
}
