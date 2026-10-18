import React, { useState } from "react";
import type {
  LearningLevel,
  ModuleContract,
  ModuleStatus,
  UserProgress,
} from "@/lib/academy/types";
import { submitActivityOutcome } from "@/lib/academy/completion.functions";
import {
  MODULE_19_SUBLESSONS,
  MODULE_19_QUIZ,
  MODULE_19_DISCOVERY_FACTS,
  MODULE_19_SCIENTIFIC_SOURCES,
} from "@/lib/academy/lessons/module-19-history-cosmology";
import { HistoricalModelComparator } from "./HistoricalModelComparator";
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
  ExternalLink,
  ShieldCheck,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

interface Module19LayoutProps {
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

export function Module19Layout({
  module,
  progress,
  onSetLearningLevel,
  onUpdateModuleProgress,
  onRecordQuiz,
  onBackToMap,
  nextRecommended,
  onSelectNextModule,
}: Module19LayoutProps) {
  const level = progress.selectedLevel;
  const moduleProgress = progress.moduleProgress[module.id];
  const isCompleted = moduleProgress?.status === "completed";

  const [activeTab, setActiveTab] = useState<"models" | "sublessons" | "quiz">("models");
  const [activeSubLessonIndex, setActiveSubLessonIndex] = useState<number>(0);

  const activeSubLesson = MODULE_19_SUBLESSONS[activeSubLessonIndex];
  const activeSubContent = activeSubLesson.content[level];

  // Track progress milestones
  const handleModelInteract = () => {
    onUpdateModuleProgress(module.id, 50, "in_progress");
    try {
      void submitActivityOutcome({
        data: {
          moduleId: "19",
          activityId: "act_19_model_comparator",
          payload: {
            modelsCompared: 2,
            retrogradeDemonstrated: true,
            success: true,
          },
          isAccessibleAlternative: false,
        },
      });
    } catch (err) {
      console.warn("Could not submit model comparison telemetry:", err);
    }
  };

  const handleQuizComplete = (score: number, total: number) => {
    onRecordQuiz("quiz_module_19", score, total);
    // Authoritative verification is evaluated server-side.
    onUpdateModuleProgress(module.id, 90, "in_progress");
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
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-0.5 rounded-full uppercase tracking-wider">
              Stage 05 • Module 19
            </span>
            <span className="text-xs text-slate-400">History of Cosmological Thought</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Visible Universe History
          </h1>
          <p className="mt-1 text-sm sm:text-base text-slate-300 max-w-2xl">{module.subtitle}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Link
            to="/visible-universe-history"
            className="flex items-center gap-1.5 text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-3.5 py-1.5 rounded-xl transition-all"
          >
            <Compass className="size-3.5" />
            <span>Open Dedicated Route</span>
            <ExternalLink className="size-3 ml-0.5" />
          </Link>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
            <Clock className="size-3.5 text-amber-400" />
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
                const el = document.getElementById("module-19-checklist");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="border-amber-500/30 text-amber-300 hover:text-white hover:bg-amber-950/40 text-xs"
            >
              <Target className="size-3.5 mr-1.5 text-amber-400" />
              <span>Review Requirements</span>
            </Button>
          )}
        </div>
      </div>

      {/* 2. Age-Adaptive Learning Level Selector */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
          <Sparkles className="size-3.5" />
          <span>Curriculum Age-Adaptive Level (Classes 1–12+)</span>
        </div>
        <LearningLevelSelector currentLevel={level} onSelectLevel={onSetLearningLevel} />
      </section>

      {/* 3. Interactive Laboratory Chamber Tabs */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-900/80 border border-white/10">
          <button
            onClick={() => setActiveTab("models")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "models"
                ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <Compass className="size-4 text-amber-300" />
            <span>1. Signature: 3D Model Inspector</span>
          </button>

          <button
            onClick={() => setActiveTab("sublessons")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "sublessons"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <BookOpen className="size-4 text-purple-300" />
            <span>2. 8 Sub-Lessons</span>
          </button>

          <button
            onClick={() => setActiveTab("quiz")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "quiz"
                ? "bg-cyan-600 text-white shadow-lg shadow-cyan-600/30"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <HelpCircle className="size-4 text-cyan-300" />
            <span>3. Knowledge Check</span>
          </button>
        </div>

        {/* Tab 1: 3D Historical Model Inspector */}
        {activeTab === "models" && <HistoricalModelComparator onInteract={handleModelInteract} />}

        {/* Tab 2: 8 Sub-Lessons */}
        {activeTab === "sublessons" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sub-lessons navigation list (4 cols) */}
            <div className="lg:col-span-4 space-y-2">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/10 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Module 19 Curriculum Chapters (8)
              </div>
              <div className="space-y-1.5">
                {MODULE_19_SUBLESSONS.map((sub, idx) => (
                  <button
                    key={sub.id}
                    onClick={() => setActiveSubLessonIndex(idx)}
                    className={`w-full p-3 rounded-xl text-left border transition-all flex items-start justify-between gap-2 ${
                      activeSubLessonIndex === idx
                        ? "bg-amber-500/20 border-amber-500/50 text-white shadow-lg shadow-amber-950/40 ring-1 ring-amber-500/30"
                        : "bg-slate-900/40 border-white/5 text-slate-400 hover:bg-slate-900/80 hover:text-white"
                    }`}
                  >
                    <div>
                      <div className="text-[10px] font-mono text-amber-400 font-bold uppercase">
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
                <div className="text-xs font-mono text-amber-400 uppercase font-bold tracking-wider">
                  Chapter 0{activeSubLesson.number} of {MODULE_19_SUBLESSONS.length}
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
                  disabled={activeSubLessonIndex === MODULE_19_SUBLESSONS.length - 1}
                  onClick={() => setActiveSubLessonIndex(activeSubLessonIndex + 1)}
                  className="text-xs font-semibold bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20"
                >
                  Next Chapter <ArrowRight className="size-3.5 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Quiz & Knowledge Check */}
        {activeTab === "quiz" && (
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 backdrop-blur-xl space-y-6">
            <div className="border-b border-white/10 pb-4">
              <span className="text-xs font-mono uppercase text-cyan-400 font-bold">
                Knowledge Mastery Check
              </span>
              <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
                History of Cosmological Worldviews Examination
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Verify your mastery of ancient astronomy, empirical proofs of Earth&apos;s
                sphericity, geocentric and heliocentric models, and modern cosmological discoveries.
              </p>
            </div>

            <KnowledgeCheck
              quizId="quiz_module_19"
              currentLevel={level}
              questions={MODULE_19_QUIZ}
              onComplete={handleQuizComplete}
            />
          </div>
        )}
      </section>

      {/* 4. Discovery Facts Grid */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Zap className="size-4 text-amber-400" />
          Fascinating History of Cosmology Facts
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {MODULE_19_DISCOVERY_FACTS.map((fact, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl border border-white/10 bg-slate-900/50 hover:bg-slate-900/80 transition-all space-y-2"
            >
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-amber-400" />
                {fact.title}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{fact.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Scientific References & Citation Panel */}
      <section>
        <SourceInformationPanel sources={MODULE_19_SCIENTIFIC_SOURCES} />
      </section>

      {/* 5b. Authoritative Verified Module Completion Checklist */}
      <section id="module-19-checklist">
        <ModuleCompletionChecklist
          moduleId="19"
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
        <section className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/30 via-slate-900/60 to-purple-950/30 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold">
              Next in Curriculum
            </div>
            <div className="text-lg font-bold text-white mt-0.5">
              {nextRecommended.module.number}. {nextRecommended.module.title}
            </div>
            <div className="text-xs text-slate-300 mt-0.5">{nextRecommended.reason}</div>
          </div>
          <Button
            onClick={() => onSelectNextModule(nextRecommended.module)}
            className="bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shadow-lg shadow-amber-600/30"
          >
            Continue to Module {nextRecommended.module.number}
            <ArrowRight className="size-4 ml-1.5" />
          </Button>
        </section>
      )}
    </div>
  );
}
