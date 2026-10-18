// @ts-nocheck -- loosely-typed educational content; runtime-validated by rendering.
import React, { useState } from "react";
import type {
  LearningLevel,
  ModuleContract,
  ModuleStatus,
  UserProgress,
} from "@/lib/academy/types";
import {
  MODULE_18_SUBLESSONS,
  MODULE_18_QUIZ,
  MODULE_18_DISCOVERY_FACTS,
  MODULE_18_SCIENTIFIC_SOURCES,
} from "@/lib/academy/lessons/module-18-expanding-universe";
import { CosmicExpansionObservatory3D } from "./CosmicExpansionObservatory3D";
import { RedshiftWavelengthLab } from "./RedshiftWavelengthLab";
import { BoundVsUnboundChamber } from "./BoundVsUnboundChamber";
import { KnowledgeCheck } from "./KnowledgeCheck";
import { SourceInformationPanel } from "./SourceInformationPanel";
import { LearningLevelSelector } from "./LearningLevelSelector";
import { ModuleCompletionChecklist } from "./ModuleCompletionChecklist";
import {
  BookOpen,
  CheckCircle2,
  Sparkles,
  Layers,
  HelpCircle,
  Compass,
  ArrowRight,
  ChevronRight,
  Clock,
  ArrowLeft,
  Award,
  Zap,
  TrendingUp,
  Maximize2,
  ShieldCheck,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitActivityOutcome } from "@/lib/academy/completion.functions";

interface Module18LayoutProps {
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

export function Module18Layout({
  module,
  progress,
  onSetLearningLevel,
  onUpdateModuleProgress,
  onRecordQuiz,
  onBackToMap,
  nextRecommended,
  onSelectNextModule,
}: Module18LayoutProps) {
  const level = progress.selectedLevel;
  const moduleProgress = progress.moduleProgress[module.id];
  const isCompleted = moduleProgress?.status === "completed";

  const [activeTab, setActiveTab] = useState<
    "observatory" | "redshift" | "bound" | "sublessons" | "quiz"
  >("observatory");
  const [activeSubLessonIndex, setActiveSubLessonIndex] = useState<number>(0);

  const activeSubLesson = MODULE_18_SUBLESSONS[activeSubLessonIndex];
  const activeSubContent = activeSubLesson.content[level];

  // Track progress milestones
  const handleObservatoryInteract = () => {
    onUpdateModuleProgress(module.id, 40, "in_progress");
  };

  const handleRedshiftInteract = () => {
    onUpdateModuleProgress(module.id, 65, "in_progress");
  };

  const handleBoundInteract = () => {
    onUpdateModuleProgress(module.id, 80, "in_progress");
  };

  const handleQuizComplete = (score: number, total: number) => {
    onRecordQuiz("module-18-quiz", score, total);
    const passThreshold = Math.ceil(total * 0.7);
    if (score >= passThreshold) {
      onUpdateModuleProgress(module.id, 90, "in_progress");
    } else {
      onUpdateModuleProgress(module.id, 80, "in_progress");
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* 1. Header Navigation Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <button
            onClick={onBackToMap}
            className="group flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
            <span>Return to Cosmic Map</span>
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-red-400 bg-red-500/10 border border-red-500/30 px-3 py-0.5 rounded-full uppercase tracking-wider">
              Stage 05 • Module 18
            </span>
            <span className="text-xs text-slate-400">Cosmic Expansion Bench</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            The Expanding Universe
          </h1>
          <p className="mt-1 text-sm sm:text-base text-slate-300 max-w-2xl">{module.subtitle}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
            <Clock className="size-3.5 text-red-400" />
            <span>Estimated: {module.estimatedMinutes} mins</span>
          </div>

          {isCompleted ? (
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl">
              <ShieldCheck className="size-4 text-emerald-400" />
              <span>Verified Complete</span>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const el = document.getElementById("module-18-checklist");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="border-red-500/30 text-red-300 hover:text-white hover:bg-red-950/40 text-xs"
            >
              <Target className="size-3.5 mr-1.5 text-red-400" />
              <span>Review Requirements</span>
            </Button>
          )}
        </div>
      </div>

      {/* 2. Age-Adaptive Learning Level Selector */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-400">
          <Sparkles className="size-3.5" />
          <span>Curriculum Age-Adaptive Level (Classes 1–12+)</span>
        </div>
        <LearningLevelSelector selectedLevel={level} onSelectLevel={onSetLearningLevel} />
      </section>

      {/* 3. Interactive Laboratory Chamber Tabs */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-900/80 border border-white/10">
          <button
            onClick={() => setActiveTab("observatory")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "observatory"
                ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <Compass className="size-4 text-red-300" />
            <span>1. Signature: Expansion Observatory</span>
          </button>

          <button
            onClick={() => setActiveTab("redshift")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "redshift"
                ? "bg-cyan-600 text-white shadow-lg shadow-cyan-600/30"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <TrendingUp className="size-4 text-cyan-300" />
            <span>2. Lab: Redshift & Wavelength Stretching</span>
          </button>

          <button
            onClick={() => setActiveTab("bound")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "bound"
                ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <ShieldCheck className="size-4 text-amber-300" />
            <span>3. Lab: Bound Systems vs Horizons</span>
          </button>

          <button
            onClick={() => setActiveTab("sublessons")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "sublessons"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <BookOpen className="size-4 text-indigo-300" />
            <span>4. 8 Sub-Lessons</span>
          </button>

          <button
            onClick={() => setActiveTab("quiz")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "quiz"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <HelpCircle className="size-4 text-purple-300" />
            <span>5. Knowledge Check</span>
          </button>
        </div>

        {/* Tab 1: 3D Cosmic Expansion Observatory */}
        {activeTab === "observatory" && (
          <CosmicExpansionObservatory3D level={level} onInteract={handleObservatoryInteract} />
        )}

        {/* Tab 2: Redshift & Wavelength Lab */}
        {activeTab === "redshift" && <RedshiftWavelengthLab onInteract={handleRedshiftInteract} />}

        {/* Tab 3: Bound Systems vs Horizons */}
        {activeTab === "bound" && <BoundVsUnboundChamber onInteract={handleBoundInteract} />}

        {/* Tab 4: 8 Sub-Lessons */}
        {activeTab === "sublessons" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sub-lessons navigation list (4 cols) */}
            <div className="lg:col-span-4 space-y-2">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/10 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Module 18 Curriculum Chapters (8)
              </div>
              <div className="space-y-1.5">
                {MODULE_18_SUBLESSONS.map((sub, idx) => (
                  <button
                    key={sub.id}
                    onClick={() => setActiveSubLessonIndex(idx)}
                    className={`w-full p-3 rounded-xl text-left border transition-all flex items-start justify-between gap-2 ${
                      activeSubLessonIndex === idx
                        ? "bg-red-500/20 border-red-500/50 text-white shadow-lg shadow-red-950/40 ring-1 ring-red-500/30"
                        : "bg-slate-900/40 border-white/5 text-slate-400 hover:bg-slate-900/80 hover:text-white"
                    }`}
                  >
                    <div>
                      <div className="text-[10px] font-mono text-red-400 font-bold uppercase">
                        Lesson 0{sub.number}
                      </div>
                      <div className="text-xs font-semibold text-slate-200 mt-0.5 line-clamp-1">
                        {sub.title}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {sub.subtitle}
                      </div>
                    </div>
                    <ChevronRight className="size-4 shrink-0 text-slate-500 mt-1" />
                  </button>
                ))}
              </div>
            </div>

            {/* Sub-lesson content card (8 cols) */}
            <div className="lg:col-span-8 rounded-2xl border border-white/10 bg-slate-900/80 p-6 backdrop-blur-xl space-y-5">
              <div className="border-b border-white/10 pb-4">
                <div className="text-xs font-mono text-red-400 uppercase font-bold tracking-wider">
                  Chapter 0{activeSubLesson.number} of {MODULE_18_SUBLESSONS.length}
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
                  {activeSubLesson.title}
                </h2>
                <p className="text-sm text-slate-400 mt-0.5">{activeSubLesson.subtitle}</p>
              </div>

              {/* Lesson Markdown Content */}
              <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed space-y-4">
                {activeSubContent.split("\n\n").map((para, i) => {
                  if (para.startsWith("### ")) {
                    return (
                      <h3 key={i} className="text-lg font-bold text-white mt-4 mb-2">
                        {para.replace("### ", "")}
                      </h3>
                    );
                  }
                  if (para.startsWith("$$")) {
                    return (
                      <div
                        key={i}
                        className="my-3 p-3 rounded-xl bg-slate-950 border border-white/10 font-mono text-xs sm:text-sm text-cyan-300 overflow-x-auto text-center"
                      >
                        {para.replaceAll("$$", "")}
                      </div>
                    );
                  }
                  return (
                    <p key={i} className="text-slate-300">
                      {para}
                    </p>
                  );
                })}
              </div>

              {/* Navigation between sub-lessons */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={activeSubLessonIndex === 0}
                  onClick={() => setActiveSubLessonIndex(activeSubLessonIndex - 1)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  <ArrowLeft className="size-3.5 mr-1" /> Previous
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={activeSubLessonIndex === MODULE_18_SUBLESSONS.length - 1}
                  onClick={() => setActiveSubLessonIndex(activeSubLessonIndex + 1)}
                  className="text-xs font-semibold bg-red-500/10 text-red-300 border-red-500/30 hover:bg-red-500/20"
                >
                  Next Chapter <ArrowRight className="size-3.5 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Quiz & Knowledge Check */}
        {activeTab === "quiz" && (
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 backdrop-blur-xl space-y-6">
            <div className="border-b border-white/10 pb-4">
              <span className="text-xs font-mono uppercase text-purple-400 font-bold">
                Knowledge Mastery Check
              </span>
              <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
                Cosmic Expansion & Hubble–Lemaître Examination
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Verify your mastery of metric expansion, cosmological redshift, lookback time, and
                bound systems.
              </p>
            </div>

            <KnowledgeCheck questions={MODULE_18_QUIZ} onComplete={handleQuizComplete} />
          </div>
        )}
      </section>

      {/* 4. Discovery Facts Grid */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Zap className="size-4 text-red-400" />
          Fascinating Cosmic Expansion Facts
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {MODULE_18_DISCOVERY_FACTS.map((fact, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl border border-white/10 bg-slate-900/50 hover:bg-slate-900/80 transition-all space-y-2"
            >
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-red-400" />
                {fact.title}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{fact.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Scientific References & Citation Panel */}
      <section>
        <SourceInformationPanel sources={MODULE_18_SCIENTIFIC_SOURCES} />
      </section>

      {/* 5b. Authoritative Verified Module Completion Checklist */}
      <section id="module-18-checklist">
        <ModuleCompletionChecklist
          moduleId="18"
          onNextModule={
            nextRecommended && onSelectNextModule
              ? () => onSelectNextModule(nextRecommended.module)
              : onBackToMap
          }
          onNavigateToAssessment={() => {
            if (typeof document !== "undefined") {
              const el = document.querySelector(
                '[role="region"][aria-label="Module Knowledge Assessment"]',
              );
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }
          }}
          onNavigateToActivity={() => {
            if (typeof document !== "undefined") {
              const el = document.querySelector('section, [role="region"]');
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }
          }}
          onNavigateToSection={() => {
            if (typeof window !== "undefined") {
              window.scrollTo({ top: 300, behavior: "smooth" });
            }
          }}
        />
      </section>

      {/* 6. Next Recommended Module Banner */}
      {nextRecommended && onSelectNextModule && (
        <section className="rounded-2xl border border-red-500/30 bg-gradient-to-r from-red-950/30 via-slate-900/60 to-purple-950/30 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-red-400 font-bold">
              Next in Curriculum
            </div>
            <div className="text-lg font-bold text-white mt-0.5">
              {nextRecommended.module.number}. {nextRecommended.module.title}
            </div>
            <div className="text-xs text-slate-300 mt-0.5">{nextRecommended.reason}</div>
          </div>
          <Button
            onClick={() => onSelectNextModule(nextRecommended.module)}
            className="bg-red-600 hover:bg-red-500 text-white font-semibold text-xs shadow-lg shadow-red-600/30"
          >
            Continue to Module {nextRecommended.module.number}
            <ArrowRight className="size-4 ml-1.5" />
          </Button>
        </section>
      )}
    </div>
  );
}
