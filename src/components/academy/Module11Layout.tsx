// @ts-nocheck -- loosely-typed educational content; runtime-validated by rendering.
import React, { useState } from "react";
import type {
  LearningLevel,
  ModuleContract,
  ModuleStatus,
  UserProgress,
} from "@/lib/academy/types";
import {
  MODULE_11_LESSON,
  MODULE_11_SUBLESSONS,
  MODULE_11_SOURCES,
  MODULE_11_QUIZ_QUESTIONS,
  NEBULA_BENCHMARKS,
} from "@/lib/academy/lessons/module-11-nebulae";
import { Nebula3DExplorer } from "./Nebula3DExplorer";
import { StarNurseryCollapseLab } from "./StarNurseryCollapseLab";
import { ClusterComparator } from "./ClusterComparator";
import { KnowledgeCheck } from "./KnowledgeCheck";
import { SourceInformationPanel } from "./SourceInformationPanel";
import { LearningLevelSelector } from "./LearningLevelSelector";
import {
  Cloud,
  BookOpen,
  Clock,
  ExternalLink,
  ArrowRight,
  Info,
  Table,
  CheckCircle2,
  Atom,
  Flame,
  Scale,
  Sparkles,
  Layers,
  Palette,
  Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Module11LayoutProps {
  module: ModuleContract;
  progress: UserProgress;
  onSetLearningLevel: (level: LearningLevel) => void;
  onUpdateModuleProgress: (moduleId: string, percent: number, status?: ModuleStatus) => void;
  onRecordQuiz: (quizId: string, score: number, total: number) => void;
  onBackToMap: () => void;
  nextRecommended?: {
    module: ModuleContract;
    reason: string;
  };
  onSelectNextModule?: (module: ModuleContract) => void;
}

export function Module11Layout({
  module,
  progress,
  onSetLearningLevel,
  onUpdateModuleProgress,
  onRecordQuiz,
  onBackToMap,
  nextRecommended,
  onSelectNextModule,
}: Module11LayoutProps) {
  const currentLevel = progress.selectedLevel;

  const [selectedSubLessonIndex, setSelectedSubLessonIndex] = useState<number>(0);
  const [activeInteractiveTab, setActiveInteractiveTab] = useState<
    "explorer" | "collapse_lab" | "clusters" | "filters"
  >("explorer");

  const [hasInteractedExplorer, setHasInteractedExplorer] = useState<boolean>(false);
  const [hasInteractedCollapse, setHasInteractedCollapse] = useState<boolean>(false);
  const [hasInteractedClusters, setHasInteractedClusters] = useState<boolean>(false);
  const [showFullReferenceTable, setShowFullReferenceTable] = useState<boolean>(false);
  const [, setQuizFinished] = useState<boolean>(false);

  const activeSubLesson = MODULE_11_SUBLESSONS[selectedSubLessonIndex];
  const subLessonKeyConcepts = activeSubLesson.keyConcepts[currentLevel];
  const subLessonContent = activeSubLesson.content[currentLevel];

  const handleFinishQuiz = (score: number, total: number) => {
    setQuizFinished(true);
    onRecordQuiz("quiz_module_11", score, total);
    onUpdateModuleProgress("11", 100, "completed");
  };

  const handleExplorerInteracted = () => {
    if (!hasInteractedExplorer) {
      setHasInteractedExplorer(true);
      onUpdateModuleProgress("11", 40, "in_progress");
    }
  };

  const handleCollapseInteracted = () => {
    if (!hasInteractedCollapse) {
      setHasInteractedCollapse(true);
      onUpdateModuleProgress("11", 65, "in_progress");
    }
  };

  const handleClustersInteracted = () => {
    if (!hasInteractedClusters) {
      setHasInteractedClusters(true);
      onUpdateModuleProgress("11", 85, "in_progress");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-20 space-y-10">
      {/* 1. MODULE HERO BANNER */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-pink-950/40 via-slate-900/90 to-purple-950/30 p-6 sm:p-10 backdrop-blur-xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="px-2.5 py-1 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 uppercase tracking-wider">
                Stage 3: The Life of Stars
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10 flex items-center gap-1">
                <Clock className="size-3" /> ~24 Minutes
              </span>
              <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                <Cloud className="size-3" /> Module 11
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              {module.title}
            </h1>
            <p className="text-base text-slate-300 font-medium leading-relaxed">
              {module.subtitle}
            </p>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
              Journey into glowing gas clouds, opaque dust pillars, and ancient stellar swarms, and
              decode how astronomical filters illuminate invisible physical processes.
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
            <LearningLevelSelector currentLevel={currentLevel} onSelectLevel={onSetLearningLevel} />
            <Button
              onClick={onBackToMap}
              variant="outline"
              size="sm"
              className="border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10"
            >
              ← Back to Cosmic Learning Map
            </Button>
          </div>
        </div>
      </div>

      {/* 2. SUB-LESSONS CURRICULUM SELECTOR (8 TOPICS) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="size-5 text-pink-400" />
            <h2 className="text-xl font-bold text-white">Curriculum Lessons (8 Topics)</h2>
          </div>
          <span className="text-xs text-slate-400">
            Topic {selectedSubLessonIndex + 1} of {MODULE_11_SUBLESSONS.length}
          </span>
        </div>

        {/* Horizontal Lesson Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {MODULE_11_SUBLESSONS.map((sub, idx) => (
            <button
              key={sub.id}
              onClick={() => setSelectedSubLessonIndex(idx)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                idx === selectedSubLessonIndex
                  ? "bg-pink-500 text-white shadow-lg shadow-pink-500/20"
                  : "bg-slate-900 border border-white/10 text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>
                {sub.number}. {sub.shortTitle}
              </span>
            </button>
          ))}
        </div>

        {/* Active Sub-Lesson Content Card */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 sm:p-8 backdrop-blur-md space-y-6">
          <div>
            <span className="text-xs font-mono font-bold text-pink-400 uppercase tracking-wider">
              Topic #{activeSubLesson.number} of 8
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
              {activeSubLesson.title}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">{activeSubLesson.summary}</p>
          </div>

          <p className="text-sm sm:text-base text-slate-200 leading-relaxed">{subLessonContent}</p>

          {/* Key Concepts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {subLessonKeyConcepts.map((concept, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/5 bg-white/[0.02] p-4 flex items-start gap-2.5"
              >
                <CheckCircle2 className="size-4 text-pink-400 shrink-0 mt-0.5" />
                <span className="text-xs text-slate-300 leading-relaxed">{concept}</span>
              </div>
            ))}
          </div>

          {/* Signature Highlight Banner */}
          <div className="rounded-xl border border-pink-500/20 bg-pink-500/5 p-4 flex items-start gap-3">
            <Sparkles className="size-5 text-pink-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-pink-300 uppercase tracking-wider block mb-0.5">
                3D Laboratory Connection:
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeSubLesson.signatureHighlight}
              </p>
            </div>
          </div>

          {/* Did You Know? Callout */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-start gap-3">
            <Info className="size-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block mb-0.5">
                Astrophysical Note:
              </span>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                {activeSubLesson.didYouKnow}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SIGNATURE INTERACTIVE EXPERIENCES TABS */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-pink-400" />
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Signature Nebula & Cluster Laboratories
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Fly through volumetric gas, simulate gravitational collapse, and analyze filters
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
          <button
            onClick={() => {
              setActiveInteractiveTab("explorer");
              handleExplorerInteracted();
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 ${
              activeInteractiveTab === "explorer"
                ? "bg-pink-500 text-white shadow-lg shadow-pink-500/25"
                : "bg-slate-900 border border-white/10 text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <Cloud className="size-4" />
            <span>3D Volumetric Nebula & Cluster Explorer</span>
          </button>

          <button
            onClick={() => {
              setActiveInteractiveTab("collapse_lab");
              handleCollapseInteracted();
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 ${
              activeInteractiveTab === "collapse_lab"
                ? "bg-pink-500 text-white shadow-lg shadow-pink-500/25"
                : "bg-slate-900 border border-white/10 text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <Atom className="size-4" />
            <span>Star Nursery Gravitational Collapse Activity</span>
          </button>

          <button
            onClick={() => {
              setActiveInteractiveTab("clusters");
              handleClustersInteracted();
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 ${
              activeInteractiveTab === "clusters"
                ? "bg-pink-500 text-white shadow-lg shadow-pink-500/25"
                : "bg-slate-900 border border-white/10 text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <Scale className="size-4" />
            <span>Open vs Globular Cluster Comparator</span>
          </button>

          <button
            onClick={() => setActiveInteractiveTab("filters")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 ${
              activeInteractiveTab === "filters"
                ? "bg-pink-500 text-white shadow-lg shadow-pink-500/25"
                : "bg-slate-900 border border-white/10 text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <Palette className="size-4" />
            <span>Astronomical Filters & Colors Guide</span>
          </button>
        </div>

        {/* Tab 1: 3D Volumetric Explorer */}
        {activeInteractiveTab === "explorer" && (
          <div className="space-y-4">
            <Nebula3DExplorer />
          </div>
        )}

        {/* Tab 2: Star Nursery Gravitational Collapse */}
        {activeInteractiveTab === "collapse_lab" && (
          <div className="space-y-4">
            <StarNurseryCollapseLab />
          </div>
        )}

        {/* Tab 3: Open vs Globular Cluster Comparator */}
        {activeInteractiveTab === "clusters" && (
          <div className="space-y-4">
            <ClusterComparator />
          </div>
        )}

        {/* Tab 4: Astronomical Filters & Colors Guide */}
        {activeInteractiveTab === "filters" && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm shadow-xl space-y-6 animate-in fade-in">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <Camera className="w-5 h-5 text-pink-400" />
              <div>
                <h3 className="text-lg font-semibold text-white">
                  The Science of Astronomical Colors & Filters
                </h3>
                <p className="text-xs text-slate-400">
                  Why space photos are not simple color snapshots, and what the colors actually mean
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs text-slate-300">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  Human Eye Limitations in the Dark
                </h4>
                <p className="leading-relaxed">
                  The human eye uses rod cells (night vision) in low light, which cannot register
                  color. Furthermore, the eye has near-zero sensitivity to the deep crimson 656.3 nm
                  light emitted by hydrogen. Through a backyard telescope, almost all nebulae appear
                  as ghostly gray-green smudges.
                </p>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400 font-mono">
                  Human Scotopic Sensitivity Peak: ~500 nm (Greenish-teal [O III] only)
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-400" />
                  The Famous Hubble Palette (SHO)
                </h4>
                <p className="leading-relaxed">
                  Both Sulfur-II (672 nm) and Hydrogen-alpha (656 nm) emit in the deep red band. If
                  mapped naturally, they would blur together into a muddy crimson. Hubble
                  astronomers map <strong>[S II] to Red</strong>, <strong>H-alpha to Green</strong>,
                  and <strong>[O III] to Blue</strong>, transforming monochromatic emission data
                  into an extraordinary visual map of ionization boundaries.
                </p>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-pink-300 font-mono">
                  S = Red (672 nm) • H = Green (656 nm) • O = Blue (501 nm)
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20 space-y-2">
              <h4 className="text-xs font-semibold text-purple-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Infrared (JWST) & X-Ray (Chandra): Revealing Invisible Physics
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Telescopes like Webb and Chandra detect radiation that human eyes physically cannot
                see at all. Scientists assign visible RGB colors to infrared and X-ray bands using
                the principle of <strong>Chromatic Ordering</strong>: lowest energy light gets
                mapped to red, medium energy to green, and highest energy to blue. These images are
                not &apos;fake&apos;—they are precision scientific translations of authentic cosmic
                data!
              </p>
            </div>
          </div>
        )}
      </section>

      {/* 4. SOURCED BENCHMARK REFERENCE TABLE */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Table className="size-5 text-pink-400" />
            <h3 className="text-lg sm:text-xl font-bold text-white">
              Benchmark Nebulae & Clusters Reference Catalog
            </h3>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowFullReferenceTable(!showFullReferenceTable)}
            className="text-xs text-pink-300 hover:text-white hover:bg-white/5"
          >
            {showFullReferenceTable ? "Collapse Table" : "Expand Catalog Data"}
          </Button>
        </div>

        {showFullReferenceTable && (
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 sm:p-6 backdrop-blur-md overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <th className="p-2.5">Name / Catalog</th>
                  <th className="p-2.5">Category</th>
                  <th className="p-2.5">Constellation</th>
                  <th className="p-2.5">Distance</th>
                  <th className="p-2.5">Size</th>
                  <th className="p-2.5">Illuminator / Engine</th>
                  <th className="p-2.5">Key Physical Characteristic</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {NEBULA_BENCHMARKS.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30">
                    <td className="p-2.5 font-semibold text-white">
                      {item.name}
                      <span className="block text-[10px] text-slate-400 font-mono">
                        {item.catalogName}
                      </span>
                    </td>
                    <td className="p-2.5 font-medium text-pink-300">{item.typeLabel}</td>
                    <td className="p-2.5">{item.constellation}</td>
                    <td className="p-2.5 font-mono text-cyan-300">
                      {item.distanceLightYears.toLocaleString()} ly
                    </td>
                    <td className="p-2.5 font-mono text-amber-300">{item.sizeLightYears} ly</td>
                    <td className="p-2.5 text-[11px] text-slate-200">{item.primaryIlluminator}</td>
                    <td className="p-2.5 text-[11px] text-slate-400 max-w-xs">
                      {item.keyScienceFact}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 5. KNOWLEDGE CHECK QUIZ */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Atom className="size-5 text-pink-400" />
          <h2 className="text-xl sm:text-2xl font-bold text-white">Module 11 Knowledge Check</h2>
        </div>
        <p className="text-xs text-slate-400">
          Verify your understanding of interstellar gas, nebular types, cluster dynamics, and filter
          science.
        </p>

        <KnowledgeCheck
          questions={MODULE_11_QUIZ_QUESTIONS}
          onComplete={handleFinishQuiz}
          moduleId="11"
        />
      </section>

      {/* 6. SCIENTIFIC SOURCES & CITATIONS */}
      <SourceInformationPanel sources={MODULE_11_SOURCES} />

      {/* 7. NEXT MODULE RECOMMENDATION */}
      {nextRecommended && (
        <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-slate-900 via-pink-950/20 to-slate-900 p-6 sm:p-8 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1.5 text-center sm:text-left">
            <span className="text-xs font-mono uppercase tracking-wider text-pink-400 font-bold">
              Next in Academy Sequence
            </span>
            <h3 className="text-xl font-extrabold text-white">{nextRecommended.module.title}</h3>
            <p className="text-xs text-slate-400 max-w-lg">{nextRecommended.reason}</p>
          </div>

          <Button
            size="lg"
            onClick={() => onSelectNextModule?.(nextRecommended.module)}
            className="bg-pink-500 hover:bg-pink-400 text-white font-bold gap-2 shrink-0 shadow-lg shadow-pink-500/20"
          >
            Launch Module {nextRecommended.module.number}
            <ArrowRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
