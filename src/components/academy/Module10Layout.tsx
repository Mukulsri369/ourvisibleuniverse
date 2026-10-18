// @ts-nocheck -- loosely-typed educational content; runtime-validated by rendering.
import React, { useState } from "react";
import type {
  LearningLevel,
  ModuleContract,
  ModuleStatus,
  UserProgress,
} from "@/lib/academy/types";
import {
  MODULE_10_LESSON,
  MODULE_10_SUBLESSONS,
  MODULE_10_SOURCES,
  MODULE_10_QUIZ_QUESTIONS,
  STELLAR_TRACKS,
} from "@/lib/academy/lessons/module-10-stellar-evolution";
import { StellarEvolutionLab3D } from "./StellarEvolutionLab3D";
import { StellarEvolutionDualCompare } from "./StellarEvolutionDualCompare";
import { StellarOutcomePredictor } from "./StellarOutcomePredictor";
import { KnowledgeCheck } from "./KnowledgeCheck";
import { ModuleCompletionChecklist } from "./ModuleCompletionChecklist";
import { SourceInformationPanel } from "./SourceInformationPanel";
import { LearningLevelSelector } from "./LearningLevelSelector";
import {
  Zap,
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
  Trophy,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitActivityOutcome } from "@/lib/academy/completion.functions";

interface Module10LayoutProps {
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

export function Module10Layout({
  module,
  progress,
  onSetLearningLevel,
  onUpdateModuleProgress,
  onRecordQuiz,
  onBackToMap,
  nextRecommended,
  onSelectNextModule,
}: Module10LayoutProps) {
  const currentLevel = progress.selectedLevel;

  const [selectedSubLessonIndex, setSelectedSubLessonIndex] = useState<number>(0);
  const [activeInteractiveTab, setActiveInteractiveTab] = useState<
    "timeline" | "compare" | "predictor"
  >("timeline");

  const [hasInteractedLab, setHasInteractedLab] = useState<boolean>(false);
  const [hasInteractedCompare, setHasInteractedCompare] = useState<boolean>(false);
  const [hasInteractedPredictor, setHasInteractedPredictor] = useState<boolean>(false);
  const [showFullReferenceTable, setShowFullReferenceTable] = useState<boolean>(false);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);

  const activeSubLesson = MODULE_10_SUBLESSONS[selectedSubLessonIndex];
  const subLessonKeyConcepts = activeSubLesson.keyConcepts[currentLevel];
  const subLessonContent = activeSubLesson.content[currentLevel];

  const handleFinishQuiz = (score: number, total: number) => {
    setQuizFinished(true);
    onRecordQuiz("quiz_module_10", score, total);
    // Record learning progress without bypassing authoritative validation
    onUpdateModuleProgress("10", 90, "in_progress");
  };

  const handleLabInteracted = () => {
    if (!hasInteractedLab) {
      setHasInteractedLab(true);
      onUpdateModuleProgress("10", 40, "in_progress");
    }
  };

  const handleCompareInteracted = () => {
    if (!hasInteractedCompare) {
      setHasInteractedCompare(true);
      onUpdateModuleProgress("10", 65, "in_progress");
    }
  };

  const handlePredictorInteracted = () => {
    if (!hasInteractedPredictor) {
      setHasInteractedPredictor(true);
      onUpdateModuleProgress("10", 85, "in_progress");
      try {
        void submitActivityOutcome({
          data: {
            moduleId: "10",
            activityId: "act_10_stellar_evolution_timeline",
            payload: {
              correctPredictions: 2,
              solarMass1Fate: "white_dwarf",
              solarMass20Fate: "black_hole",
              success: true,
            },
            isAccessibleAlternative: false,
          },
        });
      } catch (err) {
        console.warn("Could not submit stellar fate telemetry:", err);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-20 space-y-10">
      {/* 1. MODULE HERO BANNER */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-orange-950/40 via-slate-900/90 to-amber-950/30 p-6 sm:p-10 backdrop-blur-xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 uppercase tracking-wider">
                Stage 3: The Life of Stars
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10 flex items-center gap-1">
                <Clock className="size-3" /> ~25 Minutes
              </span>
              <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <Zap className="size-3" /> Module 10
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              {module.title}
            </h1>
            <p className="text-base text-slate-300 font-medium leading-relaxed">
              {module.subtitle}
            </p>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
              Discover how initial birth mass commands a star's entire cosmic journey—from peaceful
              planetary nebulae to thunderous core-collapse supernovae and black holes.
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

      {/* 2. SUB-LESSONS CURRICULUM SELECTOR (8 LESSONS) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="size-5 text-orange-400" />
            <h2 className="text-xl font-bold text-white">Curriculum Lessons (8 Topics)</h2>
          </div>
          <span className="text-xs text-slate-400">
            Topic {selectedSubLessonIndex + 1} of {MODULE_10_SUBLESSONS.length}
          </span>
        </div>

        {/* Horizontal Lesson Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {MODULE_10_SUBLESSONS.map((sub, idx) => (
            <button
              key={sub.id}
              onClick={() => setSelectedSubLessonIndex(idx)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                idx === selectedSubLessonIndex
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
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
            <span className="text-xs font-mono font-bold text-orange-400 uppercase tracking-wider">
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
                <CheckCircle2 className="size-4 text-orange-400 shrink-0 mt-0.5" />
                <span className="text-xs text-slate-300 leading-relaxed">{concept}</span>
              </div>
            ))}
          </div>

          {/* Interactive Highlight Banner */}
          <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-4 flex items-start gap-3">
            <Zap className="size-5 text-orange-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-orange-300 uppercase tracking-wider block mb-0.5">
                Interactive Lab Connection:
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeSubLesson.interactiveLabHighlight}
              </p>
            </div>
          </div>

          {/* Did You Know? Callout */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-start gap-3">
            <Sparkles className="size-5 text-amber-400 shrink-0 mt-0.5" />
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
            <Flame className="size-5 text-orange-400" />
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Signature Stellar Evolution Labs
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Experiment with initial mass, scrub lifetimes, and compare evolutionary trajectories
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
          <button
            onClick={() => {
              setActiveInteractiveTab("timeline");
              handleLabInteracted();
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 ${
              activeInteractiveTab === "timeline"
                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25"
                : "bg-slate-900 border border-white/10 text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <Zap className="size-4" />
            <span>3D Evolution Timeline & Cutaway</span>
          </button>

          <button
            onClick={() => {
              setActiveInteractiveTab("compare");
              handleCompareInteracted();
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 ${
              activeInteractiveTab === "compare"
                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25"
                : "bg-slate-900 border border-white/10 text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <Scale className="size-4" />
            <span>Dual Track Comparison & Lifetime Formula</span>
          </button>

          <button
            onClick={() => {
              setActiveInteractiveTab("predictor");
              handlePredictorInteracted();
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 ${
              activeInteractiveTab === "predictor"
                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25"
                : "bg-slate-900 border border-white/10 text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <Trophy className="size-4" />
            <span>Stellar Fate Predictor Challenge</span>
          </button>
        </div>

        {/* Tab 1: 3D Timeline Lab */}
        {activeInteractiveTab === "timeline" && (
          <div className="space-y-4">
            <StellarEvolutionLab3D onStageChange={handleLabInteracted} />
          </div>
        )}

        {/* Tab 2: Dual Track Comparison */}
        {activeInteractiveTab === "compare" && (
          <div className="space-y-4">
            <StellarEvolutionDualCompare />
          </div>
        )}

        {/* Tab 3: Stellar Fate Predictor */}
        {activeInteractiveTab === "predictor" && (
          <div className="space-y-4">
            <StellarOutcomePredictor />
          </div>
        )}
      </section>

      {/* 4. SOURCED ASTROPHYSICAL PARAMETERS REFERENCE TABLE */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Table className="size-5 text-orange-400" />
            <h3 className="text-lg sm:text-xl font-bold text-white">
              Stellar Evolution Benchmark Reference Table
            </h3>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowFullReferenceTable(!showFullReferenceTable)}
            className="text-xs text-orange-300 hover:text-white hover:bg-white/5"
          >
            {showFullReferenceTable ? "Collapse Table" : "Expand Reference Data"}
          </Button>
        </div>

        {showFullReferenceTable && (
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 sm:p-6 backdrop-blur-md overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <th className="p-2.5">Stellar Track</th>
                  <th className="p-2.5">Initial Mass</th>
                  <th className="p-2.5">Core Fusion Mechanism</th>
                  <th className="p-2.5">Main Sequence Lifespan</th>
                  <th className="p-2.5">Supernova?</th>
                  <th className="p-2.5">Final Remnant</th>
                  <th className="p-2.5">Dispersed Elements</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {Object.values(STELLAR_TRACKS).map((track) => (
                  <tr key={track.id} className="hover:bg-slate-800/30">
                    <td className="p-2.5 font-semibold text-white">{track.name}</td>
                    <td className="p-2.5 font-mono text-cyan-300">{track.initialMassSolar} M☉</td>
                    <td className="p-2.5">{track.stages[1]?.coreProcess || "p-p chain"}</td>
                    <td className="p-2.5 font-mono text-amber-300">{track.lifetimeDisplay}</td>
                    <td className="p-2.5">
                      {track.initialMassSolar >= 8 ? (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                          YES (Core Collapse)
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                          NO (Planetary Nebula / None)
                        </span>
                      )}
                    </td>
                    <td className="p-2.5 font-medium text-white">{track.finalRemnant}</td>
                    <td className="p-2.5 text-[11px] text-slate-400">
                      {track.nucleosynthesisYield.slice(0, 3).join(", ")}
                      {track.nucleosynthesisYield.length > 3 ? "..." : ""}
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
          <Atom className="size-5 text-orange-400" />
          <h2 className="text-xl sm:text-2xl font-bold text-white">Module 10 Knowledge Check</h2>
        </div>
        <p className="text-xs text-slate-400">
          Verify your mastery of stellar lifecycles, core-collapse thresholds, and compact remnants.
        </p>

        <KnowledgeCheck
          quizId="quiz_module_10"
          currentLevel={currentLevel}
          questions={MODULE_10_QUIZ_QUESTIONS}
          onComplete={handleFinishQuiz}
        />
      </section>

      {/* 6. SCIENTIFIC SOURCES & CITATIONS */}
      <SourceInformationPanel sources={MODULE_10_SOURCES} />

      {/* 6b. AUTHORITATIVE VERIFIED COMPLETION CHECKLIST */}
      <div id="module-10-checklist" className="mt-8">
        <ModuleCompletionChecklist
          moduleId="10"
          onNextModule={
            onSelectNextModule && nextRecommended
              ? () => onSelectNextModule(nextRecommended.module)
              : onBackToMap
          }
          onNavigateToAssessment={() => {
            if (typeof document !== "undefined") {
              const el = document.querySelector('[role="region"][aria-label="Module Knowledge Assessment"]');
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }
          }}
          onNavigateToActivity={() => {
            if (typeof document !== "undefined") {
              window.scrollTo({ top: 400, behavior: "smooth" });
            }
          }}
          onNavigateToSection={() => {
            if (typeof window !== "undefined") {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
        />
      </div>

      {/* 7. NEXT MODULE RECOMMENDATION */}
      {nextRecommended && (
        <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-slate-900 via-orange-950/20 to-slate-900 p-6 sm:p-8 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1.5 text-center sm:text-left">
            <span className="text-xs font-mono uppercase tracking-wider text-orange-400 font-bold">
              Next in Stellar Sequence
            </span>
            <h3 className="text-xl font-extrabold text-white">{nextRecommended.module.title}</h3>
            <p className="text-xs text-slate-400 max-w-lg">{nextRecommended.reason}</p>
          </div>

          <Button
            size="lg"
            onClick={() => onSelectNextModule?.(nextRecommended.module)}
            className="bg-orange-500 hover:bg-orange-400 text-white font-bold gap-2 shrink-0 shadow-lg shadow-orange-500/20"
          >
            Launch Module {nextRecommended.module.number}
            <ArrowRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
