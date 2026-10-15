import React, { useEffect } from "react";
import {
  ExternalLink,
  BookOpen,
  Sparkles,
  X,
  GraduationCap,
  Atom,
  Binary,
  Compass,
} from "lucide-react";
import { CosmicConcept } from "@/lib/cosmic-concepts";

interface CosmicConceptSheetProps {
  concept: CosmicConcept | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CosmicConceptSheet({ concept, isOpen, onClose }: CosmicConceptSheetProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !concept) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="concept-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-cyan-500/30 bg-slate-900/95 p-6 sm:p-8 shadow-2xl shadow-cyan-950/50 backdrop-blur-xl text-slate-100 animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
              <GraduationCap className="h-3.5 w-3.5" />
              <span>{concept.gradeLevel}</span>
            </div>
            <h2
              id="concept-title"
              className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2"
            >
              <Sparkles className="h-5 w-5 text-amber-400 shrink-0" />
              {concept.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-full p-2 text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Short Definition */}
        <div className="my-5 rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-cyan-950/40 to-slate-900/40 p-4">
          <div className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-semibold mb-1 flex items-center gap-1.5">
            <Atom className="h-3.5 w-3.5" /> Core Scientific Definition
          </div>
          <p className="text-sm sm:text-base text-cyan-100 leading-relaxed font-medium">
            {concept.shortDefinition}
          </p>
        </div>

        {/* Simple Explanation for High School Students */}
        <div className="space-y-3 mb-5">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold flex items-center gap-1.5">
            <Compass className="h-3.5 w-3.5 text-amber-400" />
            Intuitive Explanation (How to Think About It)
          </h3>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs sm:text-sm text-slate-300 leading-relaxed space-y-2 whitespace-pre-line">
            {concept.simpleExplanation}
          </div>
        </div>

        {/* Physics & Mathematical Insights */}
        <div className="space-y-3 mb-5">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold flex items-center gap-1.5">
            <Binary className="h-3.5 w-3.5 text-emerald-400" />
            Physics & Mathematical Insight
          </h3>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-4 text-xs sm:text-sm text-emerald-200 leading-relaxed font-mono">
            {concept.physicsInsight}
          </div>
        </div>

        {/* School Curriculum Connection */}
        <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-950/20 p-3.5 text-xs text-amber-200">
          <span className="font-semibold text-amber-300 block mb-0.5">
            High School Curriculum Note:
          </span>
          {concept.schoolCurriculumRelevance}
        </div>

        {/* High-Contrast Links to NASA and Wikipedia */}
        <div className="border-t border-white/10 pt-5 space-y-3">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
            Primary Authoritative References
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* NASA Link */}
            <a
              href={concept.nasaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 rounded-xl border border-blue-500/30 bg-blue-950/40 p-3.5 hover:bg-blue-900/50 hover:border-blue-400 transition group text-left"
            >
              <div className="space-y-0.5">
                <span className="inline-block font-mono text-[10px] font-bold uppercase tracking-wider text-blue-400">
                  NASA Science Research
                </span>
                <p className="text-xs font-semibold text-white group-hover:text-blue-200 line-clamp-1">
                  {concept.nasaLabel}
                </p>
              </div>
              <ExternalLink className="h-4 w-4 text-blue-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition shrink-0" />
            </a>

            {/* Wikipedia Link */}
            <a
              href={concept.wikipediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-700 bg-white/5 p-3.5 hover:bg-white/10 hover:border-slate-500 transition group text-left"
            >
              <div className="space-y-0.5">
                <span className="inline-block font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  Wikipedia Encyclopedia
                </span>
                <p className="text-xs font-semibold text-white group-hover:text-slate-200 line-clamp-1">
                  {concept.wikipediaLabel}
                </p>
              </div>
              <ExternalLink className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition shrink-0" />
            </a>
          </div>
        </div>

        {/* Footer Close */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto rounded-xl bg-white/10 px-5 py-2.5 text-xs font-semibold text-white hover:bg-white/20 transition"
          >
            Close Explorer
          </button>
        </div>
      </div>
    </div>
  );
}
