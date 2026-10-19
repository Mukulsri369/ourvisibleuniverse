/**
 * COSMOS Synchronized Cinematic Captions & Transcript Panel
 * Project: Our Visible Universe Academy
 * Scope: Prompt 03 — Section 14 (Synchronized Captions & Terminology Highlighting)
 *
 * Renders the exact approved NarrationSegment displayText from LessonContentProvider,
 * highlights active scientific terminology in real time, supports safe-area positioning,
 * and provides an accessible full-module transcript drawer.
 */

import React, { useState } from "react";
import { FileText, Sparkles, Volume2, X } from "lucide-react";
import type { NarrationSegment } from "@/lib/cosmos/cosmos-types";

interface CosmosCinematicCaptionsProps {
  captionsEnabled: boolean;
  narrationText: string;
  keyTerminology: string[];
  activeSegmentId: string | null;
  playbackStatus: "idle" | "loading" | "playing" | "paused" | "completed" | "error";
  allSegments: NarrationSegment[];
  onSeekSegment: (segmentId: string) => void;
}

export function CosmosCinematicCaptions({
  captionsEnabled,
  narrationText,
  keyTerminology,
  activeSegmentId,
  playbackStatus,
  allSegments,
  onSeekSegment,
}: CosmosCinematicCaptionsProps) {
  const [showTranscriptDrawer, setShowTranscriptDrawer] = useState(false);

  if (!captionsEnabled && !showTranscriptDrawer) {
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
            className="bg-cyan-500/20 text-cyan-200 font-semibold px-1 border-b border-cyan-400/60"
          >
            {part}
          </mark>
        );
      }
      return <React.Fragment key={idx}>{part}</React.Fragment>;
    });
  };

  return (
    <>
      {/* Synchronized Caption Bar (Positioned cleanly above bottom dock with mobile safe-area inset) */}
      {captionsEnabled && (
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          data-testid="cosmos-cinematic-captions"
          className="w-full max-w-4xl mx-auto px-4 pointer-events-auto"
        >
          <div className="bg-[#050914]/90 backdrop-blur-md border border-white/15 px-5 py-3.5 shadow-2xl">
            <div className="flex items-center justify-between gap-3 mb-1.5">
              <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-cyan-400">
                <Volume2
                  className={`size-3.5 ${
                    playbackStatus === "playing" ? "text-cyan-400 animate-pulse" : "text-slate-400"
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
                  <span className="text-slate-500 hidden sm:inline">• {activeSegmentId}</span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowTranscriptDrawer((prev) => !prev)}
                className="text-[11px] font-mono text-slate-300 hover:text-white flex items-center gap-1 px-2 py-0.5 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                aria-label="Toggle lesson transcript"
              >
                <FileText className="size-3 text-cyan-400" />
                <span>Transcript ({allSegments.length})</span>
              </button>
            </div>

            <p className="text-sm sm:text-base md:text-lg text-slate-100 leading-relaxed font-normal">
              {renderHighlightedCaption(narrationText, keyTerminology)}
            </p>

            {keyTerminology && keyTerminology.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mt-2 pt-2 border-t border-white/10">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1 mr-1">
                  <Sparkles className="size-3 text-amber-400" />
                  <span>Key Terms:</span>
                </span>
                {keyTerminology.map((term) => (
                  <span
                    key={term}
                    className="text-[11px] font-mono text-amber-200 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5"
                  >
                    {term}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Accessible Full-Module Transcript Drawer */}
      {showTranscriptDrawer && (
        <div
          role="dialog"
          aria-label="Lesson Narration Transcript"
          className="fixed right-4 top-20 bottom-28 z-50 w-full max-w-md bg-[#050914]/95 backdrop-blur-xl border border-white/20 shadow-2xl flex flex-col pointer-events-auto"
        >
          <div className="px-4 py-3 border-b border-white/15 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 block">
                Approved Curriculum Segments
              </span>
              <h3 className="text-sm font-bold text-white">Interactive Lesson Transcript</h3>
            </div>
            <button
              type="button"
              onClick={() => setShowTranscriptDrawer(false)}
              aria-label="Close transcript"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {allSegments.map((seg, idx) => {
              const isCurrent = seg.segmentId === activeSegmentId;
              return (
                <button
                  key={seg.segmentId}
                  type="button"
                  onClick={() => onSeekSegment(seg.segmentId)}
                  className={`w-full text-left p-3 border transition-colors ${
                    isCurrent
                      ? "bg-cyan-950/60 border-cyan-400 text-white"
                      : "bg-slate-900/60 border-white/10 text-slate-300 hover:border-white/25 hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400 mb-1">
                    <span>
                      Segment {String(idx + 1).padStart(2, "0")} • {seg.sectionId}
                    </span>
                    {isCurrent && <span className="text-emerald-300 font-bold">ACTIVE CUE</span>}
                  </div>
                  <p className="text-xs leading-relaxed">{seg.displayText}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
