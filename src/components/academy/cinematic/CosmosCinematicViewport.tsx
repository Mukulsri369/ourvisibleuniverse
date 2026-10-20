/**
 * COSMOS Cinematic Viewport Container (Browser Fullscreen API + Modal Accessibility + Safe-Area Fallback)
 * Project: Our Visible Universe Academy
 * Scope: Prompt 03 Sections 5, 19, 20 & Prompt 16 Sections 13, 14, 15, 16, 17, 37
 *
 * Ensures that:
 * - The 3D scene host, scientific annotations, captions, activity/quiz overlays, and transport controls
 *   are ALL rendered inside the single fullscreen root element.
 * - Focus moves into the modal dialog on entry, is contained during Tab navigation, and returns
 *   cleanly to the launching trigger button on exit while restoring page scroll position.
 * - Pressing Escape closes nested drawers first, protects active official assessments from
 *   accidental destruction, and preserves all learning progress on exit.
 * - Safe-area insets and mobile on-screen keyboard (`visualViewport`) resize events are respected.
 */

import React, { useEffect, useRef, useState } from "react";
import { CosmosCinematicSessionBridge } from "@/lib/cosmos/cinematic/CosmosCinematicSessionBridge";
import type { CinematicPlayerStateSnapshot } from "@/lib/cosmos/cinematic/CosmosCinematicPlayerState";

interface CosmosCinematicViewportProps {
  snapshot: CinematicPlayerStateSnapshot;
  onExitCinematicMode: () => void;
  viewportRef: React.RefObject<HTMLDivElement | null>;
  children: React.ReactNode;
}

export function CosmosCinematicViewport({
  snapshot,
  onExitCinematicMode,
  viewportRef,
  children,
}: CosmosCinematicViewportProps) {
  const bridge = CosmosCinematicSessionBridge.getInstance();
  const isOpen = snapshot.playerState !== "CLOSED";
  const previousFocusedElementRef = useRef<HTMLElement | null>(null);
  const previousScrollYRef = useRef<number>(0);
  const [keyboardInsetBottom, setKeyboardInsetBottom] = useState(0);

  // Listen to native browser fullscreenchange and fullscreenerror events (Standard + WebKit)
  useEffect(() => {
    if (typeof document === "undefined" || !isOpen) return;

    const handleFullscreenChange = () => {
      bridge.handleBrowserFullscreenChange();
    };

    const handleFullscreenError = () => {
      bridge.getStateManager().updateState({
        fullscreenState: "VIEWPORT_FALLBACK",
      });
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("fullscreenerror", handleFullscreenError);
    document.addEventListener("webkitfullscreenerror", handleFullscreenError);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("fullscreenerror", handleFullscreenError);
      document.removeEventListener("webkitfullscreenerror", handleFullscreenError);
    };
  }, [bridge, isOpen]);

  // Track mobile on-screen keyboard via visualViewport so question inputs stay visible (Prompt 16 Section 17)
  useEffect(() => {
    if (typeof window === "undefined" || !isOpen || !window.visualViewport) return;

    const vv = window.visualViewport;
    const handleViewportResize = () => {
      const offset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      setKeyboardInsetBottom(offset > 40 ? Math.round(offset) : 0);
    };

    vv.addEventListener("resize", handleViewportResize);
    vv.addEventListener("scroll", handleViewportResize);
    return () => {
      vv.removeEventListener("resize", handleViewportResize);
      vv.removeEventListener("scroll", handleViewportResize);
      setKeyboardInsetBottom(0);
    };
  }, [isOpen]);

  // Modal focus entry, Tab focus containment, Escape key protection, and focus/scroll restoration on exit
  useEffect(() => {
    if (typeof document === "undefined" || typeof window === "undefined" || !isOpen) return;

    previousFocusedElementRef.current = document.activeElement as HTMLElement | null;
    previousScrollYRef.current = window.scrollY;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Move initial keyboard focus into the primary play/pause control or viewport container
    const focusTimer = window.setTimeout(() => {
      const container = viewportRef.current;
      if (!container) return;
      const primaryBtn = container.querySelector<HTMLElement>(
        '[data-testid="cinematic-btn-pause"], [data-testid="cinematic-btn-play"], [data-testid="cinematic-btn-exit-top"]',
      );
      if (primaryBtn) {
        primaryBtn.focus({ preventScroll: true });
      } else {
        container.focus({ preventScroll: true });
      }
    }, 40);

    const handleKeyDown = (e: KeyboardEvent) => {
      const container = viewportRef.current;
      if (!container) return;

      if (e.key === "Escape") {
        // 1. If a nested dialog/drawer (Transcript or Settings) is open, let its own Escape handler close it first
        const nestedDialog = container.querySelector<HTMLElement>(
          '[data-nested-dialog="true"]',
        );
        if (nestedDialog) {
          return;
        }

        // 2. Do not allow Escape to accidentally destroy an active official assessment (Prompt 16 Section 37)
        if (snapshot.interactionState === "OFFICIAL_EXAM_ACTIVE") {
          e.preventDefault();
          return;
        }

        const fsEl = document.fullscreenElement || (document as any).webkitFullscreenElement;
        if (!fsEl) {
          e.preventDefault();
          onExitCinematicMode();
        }
        return;
      }

      // 3. Contain Tab / Shift+Tab focus strictly inside the modal fullscreen player (Prompt 16 Section 16)
      if (e.key === "Tab") {
        const focusable = Array.from(
          container.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ),
        ).filter((el) => el.offsetParent !== null);

        if (focusable.length === 0) return;

        const firstEl = focusable[0];
        const lastEl = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);

      // Restore page scroll position and return focus to launching button (Prompt 16 Sections 15 & 16)
      window.scrollTo({ top: previousScrollYRef.current, behavior: "instant" as ScrollBehavior });
      if (
        previousFocusedElementRef.current &&
        typeof previousFocusedElementRef.current.focus === "function"
      ) {
        try {
          previousFocusedElementRef.current.focus({ preventScroll: true });
        } catch {
          // Ignore if detached
        }
      }
    };
  }, [isOpen, onExitCinematicMode, snapshot.interactionState, viewportRef]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      ref={viewportRef}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      aria-label={`COSMOS Fullscreen Cinematic Learning Player — Module ${snapshot.currentModuleId}: ${snapshot.currentModuleTitle}`}
      data-testid="cosmos-cinematic-viewport"
      data-fullscreen-state={snapshot.fullscreenState}
      data-player-state={snapshot.playerState}
      style={
        keyboardInsetBottom > 0
          ? ({ paddingBottom: `${keyboardInsetBottom}px` } as React.CSSProperties)
          : undefined
      }
      className="fixed inset-0 z-[100] w-screen h-[100dvh] bg-[#03050A] text-slate-100 overflow-hidden select-none flex flex-col justify-between focus:outline-none"
    >
      {children}
    </div>
  );
}
