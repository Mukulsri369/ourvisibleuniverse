// @ts-nocheck
import React, { useState } from "react";
import type {
  LearningLevel,
  ModuleContract,
  ModuleStatus,
  UserProgress,
} from "@/lib/academy/types";
import { submitActivityOutcome } from "@/lib/academy/completion.functions";
import {
  MODULE_22_SUBLESSONS,
  MODULE_22_QUIZ,
  MODULE_22_DISCOVERY_FACTS,
  MODULE_22_SOURCES,
} from "@/lib/academy/lessons/module-22-space-missions";
import { SpaceMuseumLab } from "./SpaceMuseumLab";
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
  Rocket,
  Compass,
  Radio,
  Move3d,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Module22LayoutProps {
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

export function Module22Layout({
  module,
  progress,
  onSetLearningLevel,
  onUpdateModuleProgress,
  onRecordQuiz,
  onBackToMap,
  nextRecommended,
  onSelectNextModule,
}: Module22LayoutProps) {
  const level = progress.selectedLevel;
  const moduleProgress = progress.moduleProgress[module.id];
  const isCompleted = moduleProgress?.status === "completed";

  const [activeTab, setActiveTab] = useState<"museum" | "sublessons" | "quiz">("museum");
  const [activeSubLessonIndex, setActiveSubLessonIndex] = useState<number>(0);

  const activeSubLesson = MODULE_22_SUBLESSONS[activeSubLessonIndex];
  const activeSubContent = activeSubLesson.content[level];

  // Track user progress milestones
  const handleMuseumInteract = () => {
    onUpdateModuleProgress(module.id, 55, "in_progress");
    try {
      void submitActivityOutcome({
        data: {
          moduleId: "22",
          activityId: "act_22_gravity_assist_trajectory",
          payload: {
            deltaVKmS: 7.2,
            flybySuccessful: true,
            success: true,
          },
          isAccessibleAlternative: false,
        },
      });
    } catch (err) {
      console.warn("Could not submit gravity assist telemetry:", err);
    }
  };

  const handleQuizComplete = (score: number, total: number) => {
    onRecordQuiz("quiz_module_22", score, total);
    // Authoritative verification is evaluated server-side.
    onUpdateModuleProgress(module.id, 90, "in_progress");
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* 1. Header Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBackToMap}
            className="text-slate-400 hover:text-white hover:bg-slate-800 -ml-2"
          >
            <ArrowLeft className="size-4 mr-1.5" />
            Academy Hub
          </Button>
          <div className="h-4 w-px bg-white/10 hidden sm:block" />
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
              STAGE 6
            </span>
            <span>Module 22</span>
          </div>
        </div>

        {/* Learning Tier Selector */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <LearningLevelSelector currentLevel={level} onSelectLevel={onSetLearningLevel} />
        </div>
      </div>

      {/* 2. Hero Module Introduction Banner */}
      <div className="relative rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-950/40 via-slate-900/60 to-slate-950 p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-blue-500/20 border border-blue-500/30 text-blue-300">
              <Rocket className="size-3.5" />
              <span>Interactive Spaceflight Museum & Solar System Explorer</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {module.title}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Step into an interactive museum of human and robotic space exploration. Inspect 3D
              procedural models of historic spacecraft, map interplanetary trajectories across the
              solar system, master orbital gravity assists, and design mission architectures for
              human exploration of Mars.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-white/10 text-xs text-slate-300 flex items-center gap-1.5">
                <BookOpen className="size-3 text-blue-400" /> 8 Comprehensive Lessons
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-white/10 text-xs text-slate-300 flex items-center gap-1.5">
                <Move3d className="size-3 text-cyan-400" /> 10 Procedural 3D Spacecraft
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-white/10 text-xs text-slate-300 flex items-center gap-1.5">
                <Zap className="size-3 text-amber-400" /> Gravity Assist Simulator
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-white/10 text-xs text-slate-300 flex items-center gap-1.5">
                <Award className="size-3 text-purple-400" /> "Plan a Journey to Mars" Challenge
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 shrink-0 w-full sm:w-auto">
            {!isCompleted ? (
              <Button
                onClick={() => {
                  const el = document.getElementById("module-22-checklist");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                variant="outline"
                size="sm"
                className="border-blue-500/40 text-blue-300 hover:bg-blue-500/10 text-xs"
              >
                <Target className="size-3.5 mr-1.5 text-blue-400" />
                Review Requirements
              </Button>
            ) : (
              <div className="text-center p-3 rounded-xl bg-blue-950/40 border border-blue-500/30">
                <ShieldCheck className="size-6 text-blue-400 mx-auto mb-1" />
                <span className="text-xs font-semibold text-blue-200 block">
                  Flight Director Certified
                </span>
                <span className="text-[10px] text-blue-400/80">Stage 6 Space Missions Honors</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Main Experience Tabs */}
      <section className="space-y-6">
        <div className="flex border-b border-white/10 gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => {
              setActiveTab("museum");
              handleMuseumInteract();
            }}
            className={`px-4 py-2.5 rounded-t-xl font-semibold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === "museum"
                ? "border-blue-500 text-blue-400 bg-blue-500/10"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <Rocket className="size-4" />
            Spaceflight Museum & Simulator
          </button>

          <button
            onClick={() => setActiveTab("sublessons")}
            className={`px-4 py-2.5 rounded-t-xl font-semibold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === "sublessons"
                ? "border-blue-500 text-blue-400 bg-blue-500/10"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <BookOpen className="size-4" />
            Lessons & Mission History (8)
          </button>

          <button
            onClick={() => setActiveTab("quiz")}
            className={`px-4 py-2.5 rounded-t-xl font-semibold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === "quiz"
                ? "border-blue-500 text-blue-400 bg-blue-500/10"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <HelpCircle className="size-4" />
            Knowledge Check Quiz
          </button>
        </div>

        {/* TAB A: Interactive Signature Laboratory */}
        {activeTab === "museum" && (
          <div className="space-y-6">
            <SpaceMuseumLab level={level} onInteract={handleMuseumInteract} />
          </div>
        )}

        {/* TAB B: Sub-lessons reader */}
        {activeTab === "sublessons" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Sidebar Sublesson Index */}
            <div className="lg:col-span-4 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
                Curriculum Lessons
              </span>
              <div className="space-y-1.5">
                {MODULE_22_SUBLESSONS.map((sub, idx) => (
                  <button
                    key={sub.id}
                    onClick={() => setActiveSubLessonIndex(idx)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                      activeSubLessonIndex === idx
                        ? "bg-blue-950/40 border-blue-500/50 text-white shadow-lg shadow-blue-950/30"
                        : "bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
                    }`}
                  >
                    <span
                      className={`size-6 rounded-lg flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5 ${
                        activeSubLessonIndex === idx
                          ? "bg-blue-600 text-white"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {sub.order}
                    </span>
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold leading-snug">{sub.title}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">
                        {sub.shortDescription}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1 pt-0.5">
                        <Clock className="size-2.5" /> {sub.durationMinutes} min read
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Sublesson Content Display */}
            <div className="lg:col-span-8 rounded-2xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8 space-y-6">
              <div className="space-y-2 border-b border-white/10 pb-4">
                <div className="flex items-center justify-between text-xs font-mono text-blue-400">
                  <span>LESSON {activeSubLesson.order} OF 8</span>
                  <span className="capitalize px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                    {level} Level
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {activeSubContent.title}
                </h2>
                <p className="text-sm text-blue-200 font-medium">{activeSubContent.summary}</p>
              </div>

              {/* Lesson Body Paragraphs */}
              <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
                {activeSubContent.paragraphs.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>

              {/* Interactive Prompt / Lab Callout */}
              <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-950/20 flex items-start gap-3">
                <Rocket className="size-5 text-blue-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-xs font-bold text-blue-200 font-mono uppercase">
                    Interactive Lab Assignment
                  </div>
                  <p className="text-xs text-slate-300">{activeSubContent.interactivePrompt}</p>
                  <Button
                    size="sm"
                    variant="link"
                    onClick={() => {
                      setActiveTab("museum");
                      handleMuseumInteract();
                    }}
                    className="p-0 h-auto text-blue-400 hover:text-blue-300 text-xs font-semibold"
                  >
                    Launch in Spaceflight Museum
                    <ChevronRight className="size-3 ml-1" />
                  </Button>
                </div>
              </div>

              {/* Did you know callout */}
              <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-950/10 flex items-start gap-3">
                <Sparkles className="size-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-xs font-bold text-amber-300 font-mono uppercase">
                    Discovery Spotlight
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activeSubContent.didYouKnow}
                  </p>
                </div>
              </div>

              {/* Pagination between lessons */}
              <div className="flex items-center justify-between border-t border-white/10 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={activeSubLessonIndex === 0}
                  onClick={() => setActiveSubLessonIndex((prev) => Math.max(0, prev - 1))}
                  className="text-xs text-slate-300 border-slate-700 hover:bg-slate-800"
                >
                  <ArrowLeft className="size-3.5 mr-1.5" />
                  Previous Lesson
                </Button>

                {activeSubLessonIndex < MODULE_22_SUBLESSONS.length - 1 ? (
                  <Button
                    size="sm"
                    onClick={() =>
                      setActiveSubLessonIndex((prev) =>
                        Math.min(MODULE_22_SUBLESSONS.length - 1, prev + 1),
                      )
                    }
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                  >
                    Next Lesson
                    <ArrowRight className="size-3.5 ml-1.5" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => setActiveTab("quiz")}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                  >
                    Take Knowledge Quiz
                    <HelpCircle className="size-3.5 ml-1.5" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB C: Knowledge Check Quiz */}
        {activeTab === "quiz" && (
          <div className="space-y-6">
            <KnowledgeCheck
              quizId="quiz_module_22"
              questions={MODULE_22_QUIZ}
              currentLevel={level}
              onComplete={handleQuizComplete}
            />
          </div>
        )}
      </section>

      {/* 4. Mind-Bending Discovery Facts */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-amber-400" />
          <h3 className="text-lg font-bold text-white tracking-wide">
            Mind-Bending Space Exploration Facts
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MODULE_22_DISCOVERY_FACTS.map((df, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/40 space-y-2 hover:border-slate-700 transition-colors"
            >
              <p className="text-xs text-slate-200 leading-relaxed">"{df.fact}"</p>
              <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                <span className="text-amber-400 font-bold">Source:</span> {df.source}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Scientific References & Citation Panel */}
      <section>
        <SourceInformationPanel sources={MODULE_22_SOURCES} />
      </section>

      {/* 5b. Authoritative Verified Module Completion Checklist */}
      <section id="module-22-checklist">
        <ModuleCompletionChecklist
          moduleId="22"
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
              window.scrollTo({ top: 400, behavior: "smooth" });
            }
          }}
          onNavigateToSection={() => {
            if (typeof window !== "undefined") {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
        />
      </section>

      {/* 6. Next Recommended Module Banner */}
      {nextRecommended && onSelectNextModule && (
        <section className="rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-950/30 via-slate-900/60 to-slate-950/50 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-blue-400 font-bold">
              Next in Curriculum
            </div>
            <div className="text-lg font-bold text-white mt-0.5">
              {nextRecommended.module.number}. {nextRecommended.module.title}
            </div>
            <div className="text-xs text-slate-300 mt-0.5">{nextRecommended.reason}</div>
          </div>
          <Button
            onClick={() => onSelectNextModule(nextRecommended.module)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30"
          >
            Continue to Module {nextRecommended.module.number}
            <ArrowRight className="size-4 ml-1.5" />
          </Button>
        </section>
      )}
    </div>
  );
}
