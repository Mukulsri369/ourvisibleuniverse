/**
 * COSMOS Cinematic Viewport Container (Browser Fullscreen API + Full-Viewport Fallback)
 * Project: Our Visible Universe Academy
 * Scope: Prompt 03 — Sections 5, 19, 20
 *
 * Ensures that the 3D scene host, scientific annotations, captions, activity/quiz overlays,
 * and transport controls are ALL rendered inside the single fullscreen root element so
 * overlays never disappear behind the browser fullscreen layer.
 */

import React, { useEffect, useRef } from "react";
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

  // Listen to native browser fullscreenchange and fullscreenerror events
  useEffect(() => {
    if (typeof document === "undefined" || !isOpen) return;

    const handleFullscreenChange = () => {
      bridge.handleBrowserFullscreenChange();
    };

    const handleFullscreenError = () => {
      bridge.getStateManager().recordError(
        "FULLSCREEN_PERMISSION_DENIED",
        "Native browser fullscreen encountered an error; continuing in Full-Viewport Cinematic Mode.",
        { recoverable: true, fallbackAvailable: true, enterErrorState: false },
      );
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

  // Support keyboard Escape exit when in Full-Viewport Fallback mode and lock background body scroll
  useEffect(() => {
    if (typeof document === "undefined" || !isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        const fsEl =
          document.fullscreenElement || (document as any).webkitFullscreenElement;
        if (!fsEl) {
          e.preventDefault();
          onExitCinematicMode();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onExitCinematicMode]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      ref={viewportRef}
      role="dialog"
      aria-modal="true"
      aria-label={`COSMOS Fullscreen Cinematic Learning Player — Module ${snapshot.currentModuleId}: ${snapshot.currentModuleTitle}`}
      data-testid="cosmos-cinematic-viewport"
      data-fullscreen-state={snapshot.fullscreenState}
      data-player-state={snapshot.playerState}
      className="fixed inset-0 z-[100] w-screen h-[100dvh] bg-[#03050A] text-slate-100 overflow-hidden select-none flex flex-col justify-between"
    >
      {children}
    </div>
  );
}
