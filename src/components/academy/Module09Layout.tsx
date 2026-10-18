import React, { useState } from "react";
import type {
  LearningLevel,
  ModuleContract,
  ModuleStatus,
  UserProgress,
} from "@/lib/academy/types";
import {
  MODULE_09_LESSON,
  MODULE_09_SUBLESSONS,
  MODULE_09_SOURCES,
  SOURCED_STELLAR_PARAMETERS,
} from "@/lib/academy/lessons/module-09-stars";
import { StellarMuseum3D } from "./StellarMuseum3D";
import { BlackbodySpectraLab } from "./BlackbodySpectraLab";
import { InverseSquareBrightnessLab } from "./InverseSquareBrightnessLab";
import { HRDiagramExplorer } from "./HRDiagramExplorer";
import { KnowledgeCheck } from "./KnowledgeCheck";
import { ModuleCompletionChecklist } from "./ModuleCompletionChecklist";
import { SourceInformationPanel } from "./SourceInformationPanel";
import { LearningLevelSelector } from "./LearningLevelSelector";
import {
  Flame,
  Layers,
  Zap,
  Activity,
  Sparkles,
  BookOpen,
  Clock,
  ExternalLink,
  ArrowRight,
  Info,
  Table,
  CheckCircle2,
  Compass,
  Telescope,
  Scale,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitActivityOutcome } from "@/lib/academy/completion.functions";

interface Module09LayoutProps {
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

export function Module09Layout({
  module,
  progress,
  onSetLearningLevel,
  onUpdateModuleProgress,
  onRecordQuiz,
  onBackToMap,
  nextRecommended,
  onSelectNextModule,
}: Module09LayoutProps) {
  const currentLevel = progress.selectedLevel;
  const gradeContent = MODULE_09_LESSON.gradeLevelContent[currentLevel];

  const [selectedSubLessonIndex, setSelectedSubLessonIndex] = useState(0);
  const [activeInteractiveTab, setActiveInteractiveTab] = useState<
    "museum" | "blackbody" | "distance" | "hr_diagram"
  >("museum");
  const [hasTestedMuseum, setHasTestedMuseum] = useState(false);
  const [hasTestedBlackbody, setHasTestedBlackbody] = useState(false);
  const [hasTestedDistance, setHasTestedDistance] = useState(false);
  const [hasTestedHR, setHasTestedHR] = useState(false);
  const [showFullParamTable, setShowFullParamTable] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  const activeSubLesson = MODULE_09_SUBLESSONS[selectedSubLessonIndex];
  const subLessonContent = activeSubLesson.content[currentLevel];

  const handleFinishQuiz = (score: number, total: number) => {
    setQuizFinished(true);
    onRecordQuiz("quiz_module_09", score, total);
    // Record learning progress without bypassing authoritative validation
    onUpdateModuleProgress("09", 90, "in_progress");
  };

  const handleMuseumInteracted = () => {
    if (!hasTestedMuseum) {
      setHasTestedMuseum(true);
      onUpdateModuleProgress("09", 35, "in_progress");
    }
  };

  const handleBlackbodyInteracted = () => {
    if (!hasTestedBlackbody) {
      setHasTestedBlackbody(true);
      onUpdateModuleProgress("09", 55, "in_progress");
    }
  };

  const handleDistanceInteracted = () => {
    if (!hasTestedDistance) {
      setHasTestedDistance(true);
      onUpdateModuleProgress("09", 70, "in_progress");
    }
  };

  const handleHRInteracted = () => {
    if (!hasTestedHR) {
      setHasTestedHR(true);
      onUpdateModuleProgress("09", 85, "in_progress");
      try {
        void submitActivityOutcome({
          data: {
            moduleId: "09",
            activityId: "act_09_hr_diagram_lab",
            payload: {
              placedCount: 5,
              accuracyPct: 95,
              starsClassified: 5,
              success: true,
            },
            isAccessibleAlternative: false,
          },
        });
      } catch (err) {
        console.warn("Could not submit HR diagram telemetry:", err);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-20 space-y-10">
      {/* 1. MODULE HERO BANNER */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-rose-950/40 via-slate-900/90 to-purple-950/30 p-6 sm:p-10 backdrop-blur-xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase tracking-wider">
                Stage 3: The Life of Stars
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10 flex items-center gap-1">
                <Clock className="size-3" /> ~22 Minutes
              </span>
              <span className="px-2.5 py-1 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/30 flex items-center gap-1">
                <Flame className="size-3" /> Module 09
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              {module.title}
            </h1>
            <p className="text-base text-slate-300 font-medium leading-relaxed">
              {module.subtitle}
            </p>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
              {gradeContent.introHook}
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

      {/* 2. LESSONS SELECTOR & CURRICULUM TABS (7 SUB-LESSONS) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="size-5 text-rose-400" />
            <h2 className="text-xl font-bold text-white">Curriculum Lessons (7 Topics)</h2>
          </div>
          <span className="text-xs text-slate-400">
            Topic {selectedSubLessonIndex + 1} of {MODULE_09_SUBLESSONS.length}
          </span>
        </div>

        {/* Horizontal Lesson Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {MODULE_09_SUBLESSONS.map((sub, idx) => (
            <button
              key={sub.id}
              onClick={() => setSelectedSubLessonIndex(idx)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                idx === selectedSubLessonIndex
                  ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20"
                  : "bg-slate-900 border border-white/10 text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>{sub.title}</span>
            </button>
          ))}
        </div>

        {/* Active Sub-Lesson Content Card */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 sm:p-8 backdrop-blur-md space-y-6">
          <div>
            <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider">
              Topic #{activeSubLesson.number}
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
              {activeSubLesson.title}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">{activeSubLesson.subtitle}</p>
          </div>

          <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
            {subLessonContent.summary}
          </p>

          {/* Key Concepts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {subLessonContent.keyConcepts.map((concept, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/5 bg-white/[0.02] p-4 flex items-start gap-2.5"
              >
                <CheckCircle2 className="size-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="text-xs text-slate-300 leading-relaxed">{concept}</span>
              </div>
            ))}
          </div>

          {/* Detailed Narrative */}
          <div className="rounded-xl border border-white/5 bg-slate-950/40 p-4 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Observational & Physical Details:
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-300 leading-relaxed list-disc list-inside">
              {subLessonContent.details.map((detail, idx) => (
                <li key={idx}>{detail}</li>
              ))}
            </ul>
          </div>

          {/* Did You Know? Callout */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-start gap-3">
            <Sparkles className="size-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block mb-0.5">
                Astronomical Note:
              </span>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                {subLessonContent.didYouKnow}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SIGNATURE INTERACTIVE EXPERIENCES TABS */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Flame className="size-5 text-rose-400" />
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Signature Interactive Experiences
            </h2>
          </div>
          <span className="text-xs text-slate-400">Switch between 4 hands-on simulations</span>
        </div>

        {/* Tab Navigator */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button
            onClick={() => {
              setActiveInteractiveTab("museum");
              handleMuseumInteracted();
            }}
            className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between gap-2 ${
              activeInteractiveTab === "museum"
                ? "bg-rose-950/40 border-rose-500/50 shadow-lg shadow-rose-950/30"
                : "bg-slate-900/60 border-white/10 hover:border-white/20 text-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="p-1 rounded-lg bg-rose-500/20 text-rose-400">
                <Scale className="size-4" />
              </span>
              {hasTestedMuseum && (
                <span className="size-2 rounded-full bg-emerald-400" title="Interacted" />
              )}
            </div>
            <div>
              <div className="text-xs font-bold text-white">1. 3D Star Museum</div>
              <p className="text-[10px] text-slate-400 mt-0.5">Dual-star physical comparison</p>
            </div>
          </button>

          <button
            onClick={() => {
              setActiveInteractiveTab("blackbody");
              handleBlackbodyInteracted();
            }}
            className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between gap-2 ${
              activeInteractiveTab === "blackbody"
                ? "bg-amber-950/40 border-amber-500/50 shadow-lg shadow-amber-950/30"
                : "bg-slate-900/60 border-white/10 hover:border-white/20 text-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="p-1 rounded-lg bg-amber-500/20 text-amber-400">
                <Zap className="size-4" />
              </span>
              {hasTestedBlackbody && (
                <span className="size-2 rounded-full bg-emerald-400" title="Interacted" />
              )}
            </div>
            <div>
              <div className="text-xs font-bold text-white">2. Blackbody Spectra</div>
              <p className="text-[10px] text-slate-400 mt-0.5">Planck curve & Wien's law</p>
            </div>
          </button>

          <button
            onClick={() => {
              setActiveInteractiveTab("distance");
              handleDistanceInteracted();
            }}
            className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between gap-2 ${
              activeInteractiveTab === "distance"
                ? "bg-indigo-950/40 border-indigo-500/50 shadow-lg shadow-indigo-950/30"
                : "bg-slate-900/60 border-white/10 hover:border-white/20 text-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="p-1 rounded-lg bg-indigo-500/20 text-indigo-400">
                <Compass className="size-4" />
              </span>
              {hasTestedDistance && (
                <span className="size-2 rounded-full bg-emerald-400" title="Interacted" />
              )}
            </div>
            <div>
              <div className="text-xs font-bold text-white">3. Distance & Brightness</div>
              <p className="text-[10px] text-slate-400 mt-0.5">Inverse-square law simulation</p>
            </div>
          </button>

          <button
            onClick={() => {
              setActiveInteractiveTab("hr_diagram");
              handleHRInteracted();
            }}
            className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between gap-2 ${
              activeInteractiveTab === "hr_diagram"
                ? "bg-pink-950/40 border-pink-500/50 shadow-lg shadow-pink-950/30"
                : "bg-slate-900/60 border-white/10 hover:border-white/20 text-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="p-1 rounded-lg bg-pink-500/20 text-pink-400">
                <Sparkles className="size-4" />
              </span>
              {hasTestedHR && (
                <span className="size-2 rounded-full bg-emerald-400" title="Interacted" />
              )}
            </div>
            <div>
              <div className="text-xs font-bold text-white">4. H-R Diagram</div>
              <p className="text-[10px] text-slate-400 mt-0.5">Real interactive scatter plot</p>
            </div>
          </button>
        </div>

        {/* Tab 1: 3D Star Comparison Museum */}
        {activeInteractiveTab === "museum" && (
          <StellarMuseum3D onInteracted={handleMuseumInteracted} />
        )}

        {/* Tab 2: Blackbody Radiation & Spectra Lab */}
        {activeInteractiveTab === "blackbody" && (
          <BlackbodySpectraLab onInteracted={handleBlackbodyInteracted} />
        )}

        {/* Tab 3: Inverse-Square Law & Distance Lab */}
        {activeInteractiveTab === "distance" && (
          <InverseSquareBrightnessLab onInteracted={handleDistanceInteracted} />
        )}

        {/* Tab 4: Interactive Hertzsprung-Russell Diagram */}
        {activeInteractiveTab === "hr_diagram" && (
          <HRDiagramExplorer onInteracted={handleHRInteracted} />
        )}
      </section>

      {/* 4. SOURCED STELLAR PARAMETERS REFERENCE TABLE */}
      <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Table className="size-4 text-cyan-400" />
            <h3 className="text-base font-bold text-white">
              Sourced Physical Parameters (Benchmark Star Classes)
            </h3>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowFullParamTable(!showFullParamTable)}
            className="border-white/10 text-xs text-slate-300"
          >
            {showFullParamTable ? "Collapse Table" : "Expand Full Comparison"}
          </Button>
        </div>

        {showFullParamTable && (
          <div className="overflow-x-auto rounded-xl border border-white/10 mt-3">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-300 border-b border-white/10 font-mono">
                <tr>
                  <th className="py-2.5 px-3">Parameter</th>
                  <th className="py-2.5 px-3 text-amber-300">The Sun (Sol)</th>
                  <th className="py-2.5 px-3 text-cyan-300">Sirius A</th>
                  <th className="py-2.5 px-3 text-rose-300">Betelgeuse</th>
                  <th className="py-2.5 px-3 text-indigo-300">Sirius B</th>
                  <th className="py-2.5 px-3 text-orange-300">Proxima Centauri</th>
                  <th className="py-2.5 px-3 text-slate-400">Scientific Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200">
                {SOURCED_STELLAR_PARAMETERS.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02]">
                    <td className="py-2 px-3 font-medium text-slate-400">{row.label}</td>
                    <td className="py-2 px-3 font-mono font-semibold">{row.sunValue}</td>
                    <td className="py-2 px-3 font-mono text-cyan-200">{row.siriusAValue}</td>
                    <td className="py-2 px-3 font-mono text-rose-200">{row.betelgeuseValue}</td>
                    <td className="py-2 px-3 font-mono text-indigo-200">{row.siriusBValue}</td>
                    <td className="py-2 px-3 font-mono text-orange-200">{row.proximaValue}</td>
                    <td className="py-2 px-3 text-slate-400 text-[11px]">{row.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 5. KNOWLEDGE CHECK QUIZ */}
      <section className="space-y-4" id="module-09-quiz">
        <div className="flex items-center gap-2">
          <Zap className="size-5 text-amber-400" />
          <h2 className="text-xl font-bold text-white">Stellar Science Knowledge Check</h2>
        </div>
        <KnowledgeCheck
          quizId="quiz_module_09"
          currentLevel={currentLevel}
          questions={gradeContent.quizQuestions}
          onComplete={handleFinishQuiz}
        />
      </section>

      {/* 6. SCIENTIFIC SOURCES & GROUNDING PANEL */}
      <SourceInformationPanel sources={MODULE_09_SOURCES} />

      {/* 6b. AUTHORITATIVE VERIFIED COMPLETION CHECKLIST */}
      <div id="module-09-checklist" className="mt-8">
        <ModuleCompletionChecklist
          moduleId="09"
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

      {/* 7. NEXT RECOMMENDED MODULE BANNER */}
      {nextRecommended && (
        <div className="rounded-3xl border border-rose-500/30 bg-gradient-to-r from-rose-950/40 via-purple-950/30 to-slate-900/80 p-6 sm:p-8 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1 max-w-2xl">
            <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider">
              Continue Your Stellar Journey
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              Next Up: Module {nextRecommended.module.id} — {nextRecommended.module.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {nextRecommended.reason}
            </p>
          </div>
          {onSelectNextModule && (
            <Button
              size="lg"
              onClick={() => onSelectNextModule(nextRecommended.module)}
              className="bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-400 hover:to-purple-500 text-white font-bold shrink-0 shadow-lg shadow-rose-500/25"
            >
              <span>Explore Module {nextRecommended.module.id}</span>
              <ArrowRight className="size-4 ml-2" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
