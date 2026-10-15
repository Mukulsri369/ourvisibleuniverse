import React from "react";
import type { ScientificSource } from "@/lib/academy/types";
import { ExternalLink, BookCheck, Sparkles, ShieldCheck } from "lucide-react";

interface SourceInformationPanelProps {
  sources: ScientificSource[];
  funFacts: string[];
}

export function SourceInformationPanel({ sources, funFacts }: SourceInformationPanelProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Discovery Facts */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
              Step G: Discovery Curiosities
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mb-4">Did You Know? Cosmic Facts</h3>

          <ul className="space-y-3">
            {funFacts.map((fact, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed bg-white/[0.02] border border-white/5 p-3 rounded-xl"
              >
                <Sparkles className="size-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>{fact}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-slate-400 flex items-center gap-1.5">
          <ShieldCheck className="size-3.5 text-emerald-400" />
          <span>Curated for school curriculum benchmarks & observational astronomy</span>
        </div>
      </div>

      {/* Scientific Sources & Grounding */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-0.5 rounded-full">
              Primary Scientific Citations
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mb-4">Grounding & Observatory Archives</h3>

          <div className="space-y-3">
            {sources.map((src, idx) => (
              <a
                key={idx}
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block p-3 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/5 hover:border-cyan-400/40 transition-all"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-cyan-300 group-hover:text-cyan-200">
                    {src.title}
                  </span>
                  <ExternalLink className="size-3 text-slate-400 group-hover:text-cyan-300" />
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                    {src.organization}
                  </span>
                  {src.note && (
                    <span className="text-[11px] text-slate-400 truncate">{src.note}</span>
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-slate-400 flex items-center gap-1.5">
          <BookCheck className="size-3.5 text-cyan-400" />
          <span>Cross-verified against NASA and IAU astronomical databases</span>
        </div>
      </div>
    </div>
  );
}
