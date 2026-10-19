/**
 * COSMOS Synchronized Cinematic Captions & Complete Accessible Transcript Experience
 * Project: Our Visible Universe Academy
 * Scope: Prompt 03 Section 14 & Prompt 16 Sections 21, 22, 23, 24
 *
 * Implements:
 * - 5 Caption Presentation Modes: COMPACT, LARGE, HIGH_CONTRAST, OFF, and TRANSCRIPT
 * - Synchronized NarrationSegment displayText from LessonContentProvider with terminology highlighting
 * - Zero-Pill typographic key term bar
 * - Complete Accessible Transcript Drawer with live text search, active cue auto-scroll,
 *   keyboard Escape & focus restoration, mobile bottom-sheet sizing, and activity/exam seek guardrails
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { FileText, Search, Sparkles, Type, Volume2, X, Lock } from "lucide-react";
import type {
  CinematicCaptionPresentationMode,
  NarrationSegment,
} from "@/lib/cosmos/cosmos-types";
import { LearningPreferenceManager } from "@/lib/cosmos/LearningPreferenceManager";

interface CosmosCinematicCaptionsProps {
  captionsEnabled: boolean;
  narrationText: string;
  keyTerminology: string[];
  activeSegmentId: string | null;
  playbackStatus: "idle" | "loading" | "playing" | "paused" | "completed" | "error";
  allSegments: NarrationSegment[];
  onSeekSegment: (segmentId: string) => void;
  captionMode?: CinematicCaptionPresentationMode;
  onChangeCaptionMode?: (mode: CinematicCaptionPresentationMode) => void;
  isGateLocked?: boolean;
}

export function CosmosCinematicCaptions({
  captionsEnabled,
  narrationText,
  keyTerminology,
  activeSegmentId,
  playbackStatus,
  allSegments,
  onSeekSegment,
  captionMode: externalCaptionMode,
  onChangeCaptionMode,
  isGateLocked = false,
}: CosmosCinematicCaptionsProps) {
  const [showTranscriptDrawer, setShowTranscriptDrawer] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [seekBlockedNotice, setSeekBlockedNotice] = useState<string | null>(null);
  const [internalCaptionMode, setInternalCaptionMode] = useState<CinematicCaptionPresentationMode>(
    () => LearningPreferenceManager.getPreferences().captionPresentationMode || "COMPACT",
  );

  const transcriptToggleBtnRef = useRef<HTMLButtonElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const activeSegmentBtnRef = useRef<HTMLButtonElement | null>(null);

  const activeCaptionMode = externalCaptionMode || internalCaptionMode;

  useEffect(() => {
    return LearningPreferenceManager.subscribe((prefs) => {
      if (prefs.captionPresentationMode) {
        setInternalCaptionMode(prefs.captionPresentationMode);
      }
    });
  }, []);

  const handleSelectMode = (mode: CinematicCaptionPresentationMode) => {
    setInternalCaptionMode(mode);
    LearningPreferenceManager.setCaptionPresentationMode(mode);
    if (mode === "TRANSCRIPT") {
      setShowTranscriptDrawer(true);
    }
    onChangeCaptionMode?.(mode);
  };

  // Focus management and Escape handling when Transcript Drawer opens (Prompt 16 Sections 16 & 23)
  useEffect(() => {
    if (!showTranscriptDrawer) return;

    const focusTimer = window.setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus({ preventScroll: true });
      }
      if (activeSegmentBtnRef.current) {
        activeSegmentBtnRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }, 30);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        setShowTranscriptDrawer(false);
        transcriptToggleBtnRef.current?.focus({ preventScroll: true });
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [showTranscriptDrawer]);

  const activeSegmentIndex = useMemo(
    () => allSegments.findIndex((s) => s.segmentId === activeSegmentId),
    [allSegments, activeSegmentId],
  );

  const filteredSegments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allSegments;
    return allSegments.filter(
      (seg) =>
        seg.displayText.toLowerCase().includes(q) ||
        seg.sectionId.toLowerCase().includes(q) ||
        seg.keyTerminology?.some((t) => t.toLowerCase().includes(q)),
    );
  }, [allSegments, searchQuery]);

  if (!captionsEnabled && !showTranscriptDrawer && activeCaptionMode !== "TRANSCRIPT") {
    return null;
  }

  // Highlight approved key terminology inside the spoken caption text without altering punctuation
  const renderHighlightedCaption = (text: string, terms: string[]) => {
    if (!text) {
      return "COSMOS is ready. Press Play to begin synchronized narration and 3D visual demonstration.";
    }
    if (!terms || terms.length === 0) {
      return text;
    }

    const escapedTerms = terms
      .map((t) => t.trim())
      .filter((t) => t.length > 2)
      .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

    if (escapedTerms.length === 0) return text;

    const regex = new RegExp(`(${escapedTerms.join("|")})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, idx) => {
      const isMatch = terms.some((t) => t.toLowerCase() === part.toLowerCase());
      if (isMatch) {
        return (
          <mark
            key={idx}
            className={
              activeCaptionMode === "HIGH_CONTRAST"
                ? "bg-yellow-400/25 text-yellow-200 font-bold px-1 border-b-2 border-yellow-300"
                : "bg-cyan-500/20 text-cyan-200 font-semibold px-1 border-b border-cyan-400/60"
            }
          >
            {part}
          </mark>
        );
      }
      return <React.Fragment key={idx}>{part}</React.Fragment>;
    });
  };

  const handleSegmentClick = (seg: NarrationSegment, idxInAll: number) => {
    // Do not allow transcript seeking forward to bypass required activity or official exam gates (Prompt 16 Section 23)
    if (isGateLocked && activeSegmentIndex >= 0 && idxInAll > activeSegmentIndex) {
      setSeekBlockedNotice(
        "Complete the active required activity or assessment before seeking ahead in the lesson.",
      );
      return;
    }
    setSeekBlockedNotice(null);
    onSeekSegment(seg.segmentId);
  };

  // Typography & surface styling per presentation mode (Prompt 16 Section 22)
  const containerSurfaceClass =
    activeCaptionMode === "HIGH_CONTRAST"
      ? "bg-[#010206]/98 border-2 border-yellow-300/80 shadow-2xl"
      : "bg-[#050914]/90 backdrop-blur-md border border-white/15 shadow-2xl";

  const captionTextClass =
    activeCaptionMode === "LARGE"
      ? "text-base sm:text-lg md:text-xl text-white leading-relaxed font-medium max-w-[68ch]"
      : activeCaptionMode === "HIGH_CONTRAST"
        ? "text-base sm:text-lg md:text-xl text-yellow-50 leading-relaxed font-semibold max-w-[68ch]"
        : "text-sm sm:text-base md:text-[17px] text-slate-100 leading-relaxed font-normal max-w-[72ch]";

  return (
    <>
      {/* Synchronized Caption Bar (Positioned cleanly above bottom dock with safe-area padding) */}
      {captionsEnabled && activeCaptionMode !== "OFF" && (
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          data-testid="cosmos-cinematic-captions"
          data-caption-mode={activeCaptionMode}
          className="w-full max-w-4xl mx-auto px-3 sm:px-4 pointer-events-auto"
        >
          <div className={`${containerSurfaceClass} px-4 sm:px-5 py-2.5 sm:py-3.5 transition-colors`}>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-cyan-400">
                <Volume2
                  className={`size-3.5 shrink-0 ${
                    playbackStatus === "playing" ? "text-cyan-400" : "text-slate-400"
                  }`}
                />
                <span>
                  {playbackStatus === "playing"
                    ? "COSMOS Narrating"
                    : playbackStatus === "loading"
                      ? "Synthesizing Voice..."
                      : "COSMOS Caption"}
                </span>
                {activeSegmentId && (
                  <span className="text-slate-500 hidden md:inline">· {activeSegmentId}</span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {/* Quick Caption Presentation Mode Switcher (Compact / Large / High-Contrast) */}
                <div
                  role="group"
                  aria-label="Caption Display Mode"
                  className="hidden sm:flex items-center bg-slate-950/80 border border-white/15 p-0.5"
                >
                  {(
                    [
                      { id: "COMPACT", label: "Compact" },
                      { id: "LARGE", label: "Large" },
                      { id: "HIGH_CONTRAST", label: "High Contrast" },
                    ] as const
                  ).map((modeOpt) => {
                    const isActive = activeCaptionMode === modeOpt.id;
                    return (
                      <button
                        key={modeOpt.id}
                        type="button"
                        onClick={() => handleSelectMode(modeOpt.id)}
                        data-testid={`caption-mode-${modeOpt.id.toLowerCase()}`}
                        aria-pressed={isActive}
                        className={`px-2 py-0.5 text-[10px] font-mono transition-colors ${
                          isActive
                            ? "bg-cyan-500 text-slate-950 font-bold"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        {modeOpt.label}
                      </button>
                    );
                  })}
                </div>

                {/* Mobile Caption Size Cycle Button */}
                <button
                  type="button"
                  onClick={() =>
                    handleSelectMode(
                      activeCaptionMode === "COMPACT"
                        ? "LARGE"
                        : activeCaptionMode === "LARGE"
                          ? "HIGH_CONTRAST"
                          : "COMPACT",
                    )
                  }
                  aria-label={`Cycle caption mode (current: ${activeCaptionMode})`}
                  className="sm:hidden min-h-[36px] px-2.5 text-[11px] font-mono text-slate-300 hover:text-white bg-white/5 border border-white/10 flex items-center gap-1"
                >
                  <Type className="size-3 text-cyan-400" />
                  <span>{activeCaptionMode === "HIGH_CONTRAST" ? "HC" : activeCaptionMode}</span>
                </button>

                {/* Open Accessible Transcript Button */}
                <button
                  ref={transcriptToggleBtnRef}
                  type="button"
                  onClick={() => setShowTranscriptDrawer((prev) => !prev)}
                  data-testid="cinematic-btn-transcript-toggle"
                  aria-expanded={showTranscriptDrawer}
                  aria-label={`Toggle lesson transcript (${allSegments.length} segments)`}
                  className="min-h-[36px] sm:min-h-[30px] text-[11px] font-mono text-slate-200 hover:text-white flex items-center gap-1.5 px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/15 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                >
                  <FileText className="size-3.5 text-cyan-400" />
                  <span>Transcript ({allSegments.length})</span>
                </button>
              </div>
            </div>

            <p className={captionTextClass}>
              {renderHighlightedCaption(narrationText, keyTerminology)}
            </p>

            {/* Zero-Pill Typographic Scientific Terminology Row */}
            {keyTerminology && keyTerminology.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2 pt-2 border-t border-white/10 text-[11px] font-mono">
                <span className="uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Sparkles className="size-3 text-amber-400" />
                  <span>Key Terms:</span>
                </span>
                {keyTerminology.map((term, idx) => (
                  <React.Fragment key={term}>
                    {idx > 0 && (
                      <span className="text-slate-600" aria-hidden="true">
                        ·
                      </span>
                    )}
                    <span className="text-amber-300 font-medium">{term}</span>
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Accessible Full-Module Transcript Drawer (Right Drawer on Desktop, Bottom Sheet on Mobile) */}
      {showTranscriptDrawer && (
        <div
          role="dialog"
          aria-modal="false"
          aria-label="Lesson Narration Transcript"
          data-testid="cosmos-cinematic-transcript-drawer"
          data-nested-dialog="true"
          className="fixed inset-x-0 bottom-0 max-h-[82dvh] sm:inset-auto sm:right-4 sm:top-20 sm:bottom-28 sm:max-h-none z-50 w-full sm:max-w-md bg-[#050914]/98 backdrop-blur-xl border-t sm:border border-white/25 shadow-2xl flex flex-col pointer-events-auto"
        >
          <div className="px-4 py-3 border-b border-white/15 flex items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 block">
                Approved Curriculum Segments · {allSegments.length} Total
              </span>
              <h3 className="text-sm font-bold text-white">Interactive Lesson Transcript</h3>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowTranscriptDrawer(false);
                transcriptToggleBtnRef.current?.focus({ preventScroll: true });
              }}
              aria-label="Close transcript"
              data-testid="cinematic-btn-transcript-close"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Search Bar inside Transcript (Prompt 16 Section 23) */}
          <div className="px-3 py-2 border-b border-white/10 bg-slate-950/70">
            <div className="relative flex items-center">
              <Search className="size-3.5 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search scientific concepts or segments..."
                aria-label="Search lesson transcript"
                data-testid="cinematic-transcript-search-input"
                className="w-full bg-slate-900 border border-white/15 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
              />
            </div>
            {seekBlockedNotice && (
              <div
                role="alert"
                className="mt-2 p-2 bg-amber-950/90 border border-amber-500/40 text-[11px] text-amber-200 flex items-center gap-1.5"
              >
                <Lock className="size-3.5 text-amber-400 shrink-0" />
                <span>{seekBlockedNotice}</span>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            {filteredSegments.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                No curriculum segments match "{searchQuery}".
              </p>
            ) : (
              filteredSegments.map((seg) => {
                const idxInAll = allSegments.findIndex((s) => s.segmentId === seg.segmentId);
                const isCurrent = seg.segmentId === activeSegmentId;
                const isLockedAhead =
                  isGateLocked && activeSegmentIndex >= 0 && idxInAll > activeSegmentIndex;

                return (
                  <button
                    key={seg.segmentId}
                    ref={isCurrent ? activeSegmentBtnRef : undefined}
                    type="button"
                    onClick={() => handleSegmentClick(seg, idxInAll)}
                    aria-current={isCurrent ? "step" : undefined}
                    className={`w-full text-left p-3 border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                      isCurrent
                        ? "bg-cyan-950/70 border-cyan-400 text-white"
                        : isLockedAhead
                          ? "bg-slate-950/50 border-white/5 text-slate-500 cursor-not-allowed"
                          : "bg-slate-900/60 border-white/10 text-slate-200 hover:border-white/30 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono tabular-nums text-cyan-400 mb-1">
                      <span>
                        Segment {String(idxInAll + 1).padStart(2, "0")} · {seg.sectionId}
                      </span>
                      {isCurrent ? (
                        <span className="text-emerald-300 font-bold">ACTIVE CUE</span>
                      ) : isLockedAhead ? (
                        <span className="text-amber-400/80 flex items-center gap-1">
                          <Lock className="size-2.5" />
                          <span>Gate Required</span>
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs sm:text-[13px] leading-relaxed">{seg.displayText}</p>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </>
  );
}
