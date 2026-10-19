/**
 * COSMOS Attention Controller & Precise Text Highlighting
 * Project: Our Visible Universe Academy
 * Scope: Phase 1 Precise Text Highlighting (Part 6)
 *
 * Visually directs student attention to precisely what is being taught and spoken.
 * Maintains high WCAG AA contrast, smooth transitions, and accessibility attributes.
 */

import type { HighlightTarget } from "./learning-director-types";

export class CosmosAttentionController {
  private static instance: CosmosAttentionController | null = null;

  private currentTarget: HighlightTarget | null = null;
  private currentHighlightedElements: HTMLElement[] = [];
  private listeners: Set<(target: HighlightTarget | null) => void> = new Set();

  public static readonly HIGHLIGHT_CLASS = "cosmos-highlight-active";

  public static getInstance(): CosmosAttentionController {
    if (!this.instance) {
      this.instance = new CosmosAttentionController();
    }
    return this.instance;
  }

  /**
   * Applies highlight to the active instructional element matching the segment.
   */
  public highlightSegment(target: HighlightTarget): void {
    this.clearHighlight();

    this.currentTarget = target;

    if (typeof document === "undefined") {
      this.notifyListeners();
      return;
    }

    const matchedElements: HTMLElement[] = [];

    // 1. Check exact segment ID attribute
    const bySegment = document.querySelectorAll(`[data-cosmos-segment="${target.segmentId}"]`);
    bySegment.forEach((el) => {
      if (el instanceof HTMLElement) matchedElements.push(el);
    });

    // 2. If no exact segment attribute, check section attribute or element selector
    if (matchedElements.length === 0 && target.targetElementSelector) {
      try {
        const bySelector = document.querySelectorAll(target.targetElementSelector);
        bySelector.forEach((el) => {
          if (el instanceof HTMLElement) matchedElements.push(el);
        });
      } catch {
        // invalid selector ignored
      }
    }

    // 3. Check normalized section ID and synonyms across all 24 module layouts
    if (matchedElements.length === 0 && target.sectionId) {
      const baseSection = target.sectionId.replace(/-\d+$/, "");
      const sectionCandidates = this.getSectionCandidates(target.sectionId, baseSection);
      for (const candidate of sectionCandidates) {
        const bySection = document.querySelectorAll(
          `[data-cosmos-section="${candidate}"], [id$="-sec-${candidate}"]`,
        );
        bySection.forEach((el) => {
          if (el instanceof HTMLElement && !matchedElements.includes(el)) {
            matchedElements.push(el);
          }
        });
        if (matchedElements.length > 0) break;
      }
    }

    // 4. Universal text-snippet fallback across all 24 module layouts
    if (matchedElements.length === 0 && target.displayText && target.displayText.trim().length > 8) {
      const snippet = target.displayText.trim().slice(0, 36).toLowerCase();
      const textNodes = document.querySelectorAll(
        "main p, main li, main h2, main h3, main h4, main blockquote, section p, section li, section h2, section h3, section h4",
      );
      for (let i = 0; i < textNodes.length; i++) {
        const node = textNodes[i];
        if (
          node instanceof HTMLElement &&
          (node.textContent || "").toLowerCase().includes(snippet)
        ) {
          matchedElements.push(node);
          break;
        }
      }
    }

    // Apply visual highlight class and accessibility attribute
    matchedElements.forEach((el) => {
      el.classList.add(CosmosAttentionController.HIGHLIGHT_CLASS);
      el.setAttribute("aria-current", "true");
    });

    this.currentHighlightedElements = matchedElements;
    this.notifyListeners();
  }

  private getSectionCandidates(rawSectionId: string, baseSection: string): string[] {
    const set = new Set<string>([rawSectionId, baseSection]);
    if (["title", "summary", "lead", "keyIdea", "takeaway"].includes(baseSection)) {
      set.add("summary");
      set.add("lead");
      set.add("keyIdea");
      set.add("title");
    }
    if (["deepDive", "explanation", "paragraph", "detail"].includes(baseSection)) {
      set.add("deepDive");
      set.add("explanation");
    }
    if (["mathOrAnalogy", "mathematics"].includes(baseSection)) {
      set.add("mathOrAnalogy");
      set.add("mathematics");
    }
    if (["activityPrompt", "interactivePrompt", "experimentInstructions"].includes(baseSection)) {
      set.add("activityPrompt");
    }
    return Array.from(set);
  }

  /**
   * Clears current active visual highlight.
   */
  public clearHighlight(): void {
    if (this.currentHighlightedElements.length > 0) {
      this.currentHighlightedElements.forEach((el) => {
        el.classList.remove(CosmosAttentionController.HIGHLIGHT_CLASS);
        el.removeAttribute("aria-current");
      });
      this.currentHighlightedElements = [];
    }
    this.currentTarget = null;
    this.notifyListeners();
  }

  public getCurrentTarget(): HighlightTarget | null {
    return this.currentTarget;
  }

  public subscribe(listener: (target: HighlightTarget | null) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      try {
        listener(this.currentTarget);
      } catch (err) {
        console.warn("Error in attention listener:", err);
      }
    }
  }
}
