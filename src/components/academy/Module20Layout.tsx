import React, { useState } from "react";
import type {
  LearningLevel,
  ModuleContract,
  ModuleStatus,
  UserProgress,
} from "@/lib/academy/types";
import { submitActivityOutcome } from "@/lib/academy/completion.functions";
import {
  MODULE_20_SUBLESSONS,
  MODULE_20_QUIZ,
  MODULE_20_DISCOVERY_FACTS,
  MODULE_20_SCIENTIFIC_SOURCES,
} from "@/lib/academy/lessons/module-20-future-universe";
import { CosmicFutureTimelineLab } from "./CosmicFutureTimelineLab";
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
  Clock,
  ArrowRight,
  ChevronRight,
  ArrowLeft,
  Award,
  Zap,
  ShieldCheck,
  Compass,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Module20LayoutProps {
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

export function Module20Layout({
  module,
  progress,
  onSetLearningLevel,
  onUpdateModuleProgress,
  onRecordQuiz,
  onBackToMap,
  nextRecommended,
  onSelectNextModule,
}: Module20LayoutProps) {
  const level = progress.selectedLevel;
  const moduleProgress = progress.moduleProgress[module.id];
  const isCompleted = moduleProgress?.status === "completed";

  const [activeTab, setActiveTab] = useState<"laboratory" | "sublessons" | "quiz">("laboratory");
  const [activeSubLessonIndex, setActiveSubLessonIndex] = useState<number>(0);

  const activeSubLesson = MODULE_20_SUBLESSONS[activeSubLessonIndex];
  const activeSubContent = activeSubLesson.content[level];

  // Track progress milestones
  const handleLabInteract = () => {
    onUpdateModuleProgress(module.id, 55, "in_progress");
    try {
      void submitActivityOutcome({
        data: {
          moduleId: "20",
          activityId: "act_20_future_timeline_lab",
          payload: {
            erasOrderedCount: 4,
            erasMapped: 4,
            success: true,
          },
          isAccessibleAlternative: false,
        },
      });
    } catch (err) {
      console.warn("Could not submit future timeline telemetry:", err);
    }
  };

  const handleQuizComplete = (score: number, total: number) => {
    onRecordQuiz("quiz_module_20", score, total);
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
            <span className="text-xs font-mono font-bold text-purple-400 bg-purple-500/10 border border-purple-500/30 px-3 py-0.5 rounded-full uppercase tracking-wider">
              Stage 05 • Module 20
            </span>
            <span className="text-xs text-slate-400">Deep Time & Cosmology</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            The Future of the Universe
          </h1>
          <p className="mt-1 text-sm sm:text-base text-slate-300 max-w-2xl">{module.subtitle}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <LearningLevelSelector currentLevel={level} onSelectLevel={onSetLearningLevel} />

          {isCompleted ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="size-4" />
              <span>Verified Complete</span>
            </div>
          ) : (
            <Button
              onClick={() => {
                const el = document.getElementById("module-20-checklist");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              variant="outline"
              size="sm"
              className="border-purple-500/30 text-purple-300 hover:text-white hover:bg-purple-950/40 text-xs"
            >
              <Target className="size-3.5 mr-1 text-purple-400" />
              <span>Review Requirements</span>
            </Button>
          )}
        </div>
      </div>

      {/* 2. Top-Level Tab Switcher */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab("laboratory")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "laboratory"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Clock className="size-4" />
            <span>Interactive Future Lab</span>
          </button>
          <button
            onClick={() => setActiveTab("sublessons")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "sublessons"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <BookOpen className="size-4" />
            <span>Deep Time Sublessons ({MODULE_20_SUBLESSONS.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("quiz")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "quiz"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <HelpCircle className="size-4" />
            <span>Cosmic Knowledge Check</span>
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-slate-400">
          <span>Overall Progress:</span>
          <span className="font-bold text-purple-400">{moduleProgress?.percent || 0}%</span>
        </div>
      </div>

      {/* 3. Tab Contents */}
      <section>
        {activeTab === "laboratory" && (
          <CosmicFutureTimelineLab level={level} onInteract={handleLabInteract} />
        )}

        {activeTab === "sublessons" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Sublesson Navigation List */}
            <div className="lg:col-span-4 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1 mb-2 flex items-center justify-between">
                <span>Course Syllabus</span>
                <span className="text-[11px] font-mono text-purple-400">8 Lessons</span>
              </div>
              <div className="space-y-1.5">
                {MODULE_20_SUBLESSONS.map((sub, idx) => {
                  const isActive = idx === activeSubLessonIndex;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => setActiveSubLessonIndex(idx)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                        isActive
                          ? "bg-purple-600/20 border-purple-500/50 text-white shadow-lg shadow-purple-600/10"
                          : "bg-slate-900/60 border-white/5 text-slate-400 hover:bg-slate-900/90 hover:text-white hover:border-white/10"
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold leading-snug">{sub.title}</div>
                        <div className="text-[11px] text-slate-400 line-clamp-1">
                          {sub.subtitle}
                        </div>
                      </div>
                      <ChevronRight
                        className={`size-4 mt-0.5 shrink-0 transition-transform ${
                          isActive ? "translate-x-0.5 text-purple-400" : "text-slate-600"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Active Sublesson Reader */}
            <div className="lg:col-span-8 space-y-6">
              <div className="p-6 sm:p-8 rounded-3xl border border-white/10 bg-slate-900/70 backdrop-blur-xl space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-purple-400 uppercase tracking-wider mb-1">
                    <span>Lesson 0{activeSubLessonIndex + 1} of 08</span>
                    <span>•</span>
                    <span>~{activeSubLesson.durationMinutes} min read</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {activeSubLesson.title}
                  </h2>
                  <p className="text-sm text-slate-300 mt-1">{activeSubLesson.subtitle}</p>
                </div>

                {/* Objectives */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/5 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                    <ShieldCheck className="size-3.5 text-purple-400" />
                    Key Scientific Objectives
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                    {activeSubLesson.objectives.map((obj, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-purple-400 font-bold shrink-0">✓</span>
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Summary */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Overview ({level})
                  </h4>
                  <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
                    {activeSubContent.summary}
                  </p>
                </div>

                {/* Key Takeaways */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Core Concepts
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {activeSubContent.keyTakeaways.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-200 flex items-start gap-2"
                      >
                        <Sparkles className="size-3.5 text-purple-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Deep Dive */}
                <div className="p-5 rounded-2xl bg-purple-950/20 border border-purple-500/20 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                    <BookOpen className="size-3.5 text-purple-400" />
                    Theoretical Deep Dive
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {activeSubContent.deepDive}
                  </p>
                </div>

                {/* Did You Know? */}
                <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20 flex items-start gap-3">
                  <Zap className="size-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-amber-300">Astronomical Fact:</span>
                    <p className="text-xs text-slate-300">{activeSubContent.didYouKnow}</p>
                  </div>
                </div>

                {/* Prev / Next Lesson Navigation */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={activeSubLessonIndex === 0}
                    onClick={() => setActiveSubLessonIndex((prev) => Math.max(0, prev - 1))}
                    className="border-white/10 text-slate-300 hover:text-white text-xs disabled:opacity-40"
                  >
                    <ArrowLeft className="size-3.5 mr-1.5" />
                    Previous Lesson
                  </Button>
                  <Button
                    size="sm"
                    disabled={activeSubLessonIndex === MODULE_20_SUBLESSONS.length - 1}
                    onClick={() =>
                      setActiveSubLessonIndex((prev) =>
                        Math.min(MODULE_20_SUBLESSONS.length - 1, prev + 1),
                      )
                    }
                    className="bg-purple-600 hover:bg-purple-500 text-white text-xs disabled:opacity-40"
                  >
                    Next Lesson
                    <ArrowRight className="size-3.5 ml-1.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "quiz" && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="text-center space-y-2 mb-6">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 border border-purple-500/30 px-3 py-1 rounded-full">
                Knowledge Mastery
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Deep Time & Cosmology Quiz
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
                Test your understanding of stellar evolution, the Milkomeda merger, the 5 physical
                eras, and the thermodynamics of cosmic fate.
              </p>
            </div>

            <KnowledgeCheck
              quizId="quiz_module_20"
              questions={MODULE_20_QUIZ}
              currentLevel={level}
              onComplete={handleQuizComplete}
            />
          </div>
        )}
      </section>

      {/* 4. Discovery Facts Grid */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Zap className="size-4 text-purple-400" />
          Mind-Bending Facts About Cosmic Deep Time
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {MODULE_20_DISCOVERY_FACTS.map((fact, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl border border-white/10 bg-slate-900/50 hover:bg-slate-900/80 transition-all space-y-2"
            >
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-purple-400" />
                {fact.title}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{fact.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Scientific References & Citation Panel */}
      <section>
        <SourceInformationPanel sources={MODULE_20_SCIENTIFIC_SOURCES} />
      </section>

      {/* 5b. Authoritative Verified Module Completion Checklist */}
      <section id="module-20-checklist">
        <ModuleCompletionChecklist
          moduleId="20"
          onNextModule={
            nextRecommended && onSelectNextModule
              ? () => onSelectNextModule(nextRecommended.module)
              : onBackToMap
          }
          onNavigateToAssessment={() => setActiveTab("quiz")}
          onNavigateToActivity={() => setActiveTab("laboratory")}
          onNavigateToSection={() => setActiveTab("sublessons")}
        />
      </section>

      {/* 6. Next Recommended Module Banner */}
      {nextRecommended && onSelectNextModule && (
        <section className="rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-950/30 via-slate-900/60 to-slate-950/50 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-purple-400 font-bold">
              Next in Curriculum
            </div>
            <div className="text-lg font-bold text-white mt-0.5">
              {nextRecommended.module.number}. {nextRecommended.module.title}
            </div>
            <div className="text-xs text-slate-300 mt-0.5">{nextRecommended.reason}</div>
          </div>
          <Button
            onClick={() => onSelectNextModule(nextRecommended.module)}
            className="bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/30"
          >
            Continue to Module {nextRecommended.module.number}
            <ArrowRight className="size-4 ml-1.5" />
          </Button>
        </section>
      )}
    </div>
  );
}
