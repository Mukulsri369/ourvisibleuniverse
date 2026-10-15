import React from "react";
import { Sparkles, BookOpen } from "lucide-react";
import { COSMIC_CONCEPTS, CosmicConcept } from "@/lib/cosmic-concepts";

interface CosmicConceptPillProps {
  conceptId: string;
  onSelect: (concept: CosmicConcept) => void;
  className?: string;
  variant?: "badge" | "inline";
}

export function CosmicConceptPill({
  conceptId,
  onSelect,
  className = "",
  variant = "badge",
}: CosmicConceptPillProps) {
  const concept = COSMIC_CONCEPTS[conceptId];
  if (!concept) return null;

  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={() => onSelect(concept)}
        className={`inline-flex items-center gap-1 font-semibold text-cyan-300 underline decoration-cyan-500/50 decoration-2 underline-offset-4 hover:text-cyan-200 hover:decoration-cyan-400 transition cursor-pointer px-1 py-0.5 rounded hover:bg-cyan-950/40 ${className}`}
        title={`Explore concept: ${concept.title} (NASA & Wikipedia)`}
      >
        <Sparkles className="h-3 w-3 text-amber-400 inline shrink-0" />
        <span>{concept.title}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(concept)}
      className={`group relative inline-flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-purple-950/30 px-3 py-1.5 text-xs font-medium text-slate-200 shadow-sm shadow-cyan-950/30 hover:border-cyan-400 hover:text-white hover:shadow-cyan-500/20 transition cursor-pointer ${className}`}
      title={`Read about ${concept.title} with NASA & Wikipedia guides`}
    >
      <span className="flex h-2 w-2 rounded-full bg-cyan-400 group-hover:scale-125 transition animate-pulse" />
      <span className="font-semibold text-cyan-200 group-hover:text-cyan-100">{concept.title}</span>
      <span className="text-[10px] font-mono text-slate-400 group-hover:text-slate-300 flex items-center gap-0.5">
        <BookOpen className="h-2.5 w-2.5" />
        NASA & Wiki
      </span>
    </button>
  );
}
