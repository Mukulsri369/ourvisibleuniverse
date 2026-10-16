import React, { useState } from "react";
import {
  Compass,
  Clock,
  Sparkles,
  Info,
  Maximize2,
  Minimize2,
  TrendingUp,
  Layers,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { HISTORY_CHAPTERS, HistoryChapter } from "@/lib/visible-universe-history-data";
import { CosmicHistoryVisualizer } from "@/components/history/CosmicHistoryVisualizer";
import { Link } from "@tanstack/react-router";

interface HistoricalModelComparatorProps {
  onInteract?: () => void;
}

const ERAS = [
  "All",
  "Ancient & Prehistoric",
  "Classical Antiquity",
  "Medieval & Global Astronomy",
  "Scientific Revolution",
  "Stellar & Early Modern",
  "Relativity & Galaxies",
  "Cosmology & Big Bang",
  "Contemporary Frontier",
] as const;

export function HistoricalModelComparator({ onInteract }: HistoricalModelComparatorProps) {
  const [activeEra, setActiveEra] = useState<string>("All");
  const [selectedChapterId, setSelectedChapterId] = useState<number>(7); // Default to Ptolemy's Epicycles
  const [isCompareMode, setIsCompareMode] = useState<boolean>(false);
  const [compareChapterId, setCompareChapterId] = useState<number>(9); // Default to Copernican

  const activeChapter =
    HISTORY_CHAPTERS.find((c) => c.id === selectedChapterId) || HISTORY_CHAPTERS[6];
  const compareChapter =
    HISTORY_CHAPTERS.find((c) => c.id === compareChapterId) || HISTORY_CHAPTERS[8];

  const filteredChapters =
    activeEra === "All" ? HISTORY_CHAPTERS : HISTORY_CHAPTERS.filter((c) => c.era === activeEra);

  const handleSelectChapter = (id: number) => {
    setSelectedChapterId(id);
    if (onInteract) onInteract();
  };

  const handleSelectCompare = (id: number) => {
    setCompareChapterId(id);
    if (onInteract) onInteract();
  };

  return (
    <div className="space-y-6">
      {/* Signature Banner */}
      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-slate-900/80 p-5 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Signature Experience
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                3D Cosmological Model Inspector
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Compass className="size-6 text-amber-400" />
              History of Cosmological Worldviews
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Inspect 3D mathematical models of the cosmos across 30,000 years of human inquiry.
              Compare Ptolemaic epicycles with Copernican heliocentrism, investigate non-Western
              global traditions, and trace the rise of modern physical cosmology.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsCompareMode(!isCompareMode);
                if (onInteract) onInteract();
              }}
              className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border-amber-500/40 text-xs font-semibold"
            >
              <Layers className="size-3.5 mr-1.5" />
              {isCompareMode ? "Single Model View" : "Compare Two Models"}
            </Button>

            <Link
              to="/visible-universe-history"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/20 transition-all flex items-center gap-1.5"
            >
              <span>Full-Screen Immersive</span>
              <ExternalLink className="size-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Era Navigation Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {ERAS.map((era) => (
          <button
            key={era}
            onClick={() => setActiveEra(era)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              activeEra === era
                ? "bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-md shadow-amber-950/40"
                : "bg-slate-900/60 border-white/5 text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            {era}
          </button>
        ))}
      </div>

      {/* Main Grid: Visualizer & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 3D Visualizer & Quick Jump (7 cols or 12 cols if dual) */}
        <div className={isCompareMode ? "lg:col-span-12 space-y-6" : "lg:col-span-7 space-y-4"}>
          {isCompareMode ? (
            /* Dual Model Side-by-Side Comparison */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Model A */}
              <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 space-y-3 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Model A: {activeChapter.title}
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {activeChapter.yearDisplay}
                  </span>
                </div>
                <div className="h-72 rounded-xl overflow-hidden border border-white/10 bg-slate-950">
                  <CosmicHistoryVisualizer chapter={activeChapter} compact />
                </div>
                <div className="text-xs text-slate-300">
                  <span className="font-semibold text-white">Main Idea:</span>{" "}
                  {activeChapter.theModel}
                </div>
                <div className="text-xs text-slate-400 pt-1 border-t border-white/5">
                  <span className="font-semibold text-rose-300">Limitation:</span>{" "}
                  {activeChapter.limitations}
                </div>
              </div>

              {/* Model B */}
              <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 space-y-3 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                    Model B: {compareChapter.title}
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {compareChapter.yearDisplay}
                  </span>
                </div>
                <div className="h-72 rounded-xl overflow-hidden border border-white/10 bg-slate-950">
                  <CosmicHistoryVisualizer chapter={compareChapter} compact />
                </div>
                <div className="text-xs text-slate-300">
                  <span className="font-semibold text-white">Main Idea:</span>{" "}
                  {compareChapter.theModel}
                </div>
                <div className="text-xs text-slate-400 pt-1 border-t border-white/5">
                  <span className="font-semibold text-emerald-300">Advancement:</span>{" "}
                  {compareChapter.supportingEvidence}
                </div>
              </div>
            </div>
          ) : (
            /* Single Model 3D Visualizer */
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-slate-950 overflow-hidden shadow-2xl">
                <div className="p-3 bg-slate-900/80 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold font-mono">
                      Chapter {activeChapter.id} of {HISTORY_CHAPTERS.length}
                    </span>
                    <span className="text-sm font-bold text-white truncate">
                      {activeChapter.title}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    {activeChapter.yearDisplay}
                  </span>
                </div>

                <div className="h-80 sm:h-96">
                  <CosmicHistoryVisualizer chapter={activeChapter} />
                </div>
              </div>

              {/* Quick Model Carousel */}
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-md space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <Clock className="size-3.5 text-amber-400" />
                    Select Historical Model:
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {filteredChapters.length} models in &quot;{activeEra}&quot;
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 max-h-48 overflow-y-auto pr-1">
                  {filteredChapters.map((ch) => (
                    <button
                      key={ch.id}
                      onClick={() => handleSelectChapter(ch.id)}
                      className={`p-2 rounded-xl text-left border transition-all text-xs truncate ${
                        selectedChapterId === ch.id
                          ? "bg-amber-500/20 border-amber-500/50 text-white font-bold shadow-md shadow-amber-950/40"
                          : "bg-slate-950/60 border-white/5 text-slate-400 hover:text-white hover:bg-slate-950"
                      }`}
                    >
                      <div className="text-[10px] font-mono text-amber-400 truncate">
                        {ch.yearDisplay}
                      </div>
                      <div className="truncate mt-0.5 text-slate-200">{ch.title}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: In-Depth Historical Breakdown (5 cols or bottom row if dual) */}
        <div className={isCompareMode ? "lg:col-span-12 space-y-4" : "lg:col-span-5 space-y-4"}>
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 backdrop-blur-xl space-y-4">
            <div className="border-b border-white/10 pb-3">
              <div className="text-[10px] font-mono uppercase text-amber-400 font-bold tracking-wider">
                Historical Context & Discovery Record
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight mt-1">
                {activeChapter.title}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">{activeChapter.subtitle}</p>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-white/5">
                <span className="text-[10px] text-slate-400 block">Period / Era:</span>
                <span className="font-semibold text-slate-200 mt-0.5 block truncate">
                  {activeChapter.period}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-white/5">
                <span className="text-[10px] text-slate-400 block">Civilizations:</span>
                <span className="font-semibold text-amber-300 mt-0.5 block truncate">
                  {activeChapter.civilizations.join(", ")}
                </span>
              </div>
            </div>

            {/* Key Figures */}
            <div className="text-xs">
              <span className="text-slate-400 block text-[11px] mb-1">Key Historical Figures:</span>
              <div className="flex flex-wrap gap-1.5">
                {activeChapter.keyFigures.map((fig) => (
                  <span
                    key={fig}
                    className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white font-medium text-[11px]"
                  >
                    {fig}
                  </span>
                ))}
              </div>
            </div>

            {/* Core Model Explanation */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 text-xs space-y-1.5">
              <span className="font-bold text-white text-xs block text-amber-300">
                Core Cosmological Idea:
              </span>
              <p className="text-slate-300 leading-relaxed text-[11px]">{activeChapter.theModel}</p>
            </div>

            {/* Evidence vs Limitations */}
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-[11px] space-y-1">
                <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5" />
                  Available Observational Evidence:
                </div>
                <p className="text-slate-300 leading-relaxed">{activeChapter.supportingEvidence}</p>
              </div>

              <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/20 text-[11px] space-y-1">
                <div className="font-bold text-rose-300 flex items-center gap-1.5">
                  <AlertTriangle className="size-3.5" />
                  Scientific Strengths & Limitations:
                </div>
                <p className="text-slate-300 leading-relaxed">{activeChapter.limitations}</p>
              </div>
            </div>

            {/* What Changed Next */}
            <div className="pt-2 border-t border-white/5 text-[11px] text-slate-300 flex items-start gap-1.5">
              <ArrowRight className="size-3.5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">
                  How Later Observations Improved Understanding:{" "}
                </span>
                {activeChapter.whatChangedNext}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
