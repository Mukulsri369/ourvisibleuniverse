import React, { useState } from "react";
import type {
  LearningLevel,
  ModuleContract,
  ModuleStatus,
  UserProgress,
} from "@/lib/academy/types";
import {
  MODULE_23_SUBLESSONS,
  MODULE_23_QUIZ,
  MODULE_23_DISCOVERY_FACTS,
  MODULE_23_SOURCES,
} from "@/lib/academy/lessons/module-23-astrobiology";
import { HabitableWorldLab } from "./HabitableWorldLab";
import { KnowledgeCheck } from "./KnowledgeCheck";
import { SourceInformationPanel } from "./SourceInformationPanel";
import { LearningLevelSelector } from "./LearningLevelSelector";
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
  Globe,
  Compass,
  Radio,
  Dna,
  Droplets,
  Atom,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Module23LayoutProps {
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

export function Module23Layout({
  module,
  progress,
  onSetLearningLevel,
  onUpdateModuleProgress,
  onRecordQuiz,
  onBackToMap,
  nextRecommended,
  onSelectNextModule,
}: Module23LayoutProps) {
  const level = progress.selectedLevel;
  const moduleProgress = progress.moduleProgress[module.id];
  const isCompleted = moduleProgress?.status === "completed";

  const [activeTab, setActiveTab] = useState<"lab" | "sublessons" | "quiz">("lab");
  const [activeSubLessonIndex, setActiveSubLessonIndex] = useState<number>(0);

  const activeSubLesson = MODULE_23_SUBLESSONS[activeSubLessonIndex];
  const activeSubContent = activeSubLesson.content[level];

  // Track user progress milestones
  const handleLabInteract = () => {
    onUpdateModuleProgress(module.id, 55, "in_progress");
  };

  const handleQuizComplete = (score: number, total: number) => {
    onRecordQuiz("module-23-quiz", score, total);
    const passThreshold = Math.ceil(total * 0.7);
    if (score >= passThreshold) {
      onUpdateModuleProgress(module.id, 100, "completed");
    } else {
      onUpdateModuleProgress(module.id, 85, "in_progress");
    }
  };

  const handleMarkComplete = () => {
    onUpdateModuleProgress(module.id, 100, "completed");
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
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
              STAGE 6
            </span>
            <span>Module 23</span>
          </div>
        </div>

        {/* Learning Tier Selector */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <LearningLevelSelector currentLevel={level} onSelectLevel={onSetLearningLevel} />
        </div>
      </div>

      {/* 2. Hero Module Introduction Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950/40 via-slate-900/80 to-slate-950 border border-emerald-500/20 p-6 sm:p-8 backdrop-blur-md">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <Dna className="size-3.5" />
                Astrobiology & Habitability
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
                10 Scientific Lessons
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                <Clock className="size-3" /> ~28 min
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              Life Beyond Earth & Astrobiology
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Investigate the universal principles of life, extremophile boundaries, subsurface
              oceans on Europa and Enceladus, exoplanet habitability zones, atmospheric
              biosignatures, and the rigorous scientific threshold separating habitability from
              confirmed extraterrestrial life.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-emerald-400" />
                3D Habitable World Lab
              </span>
              <span className="flex items-center gap-1.5">
                <Droplets className="size-4 text-blue-400" />
                Europa & Enceladus Subsurface Seas
              </span>
              <span className="flex items-center gap-1.5">
                <Atom className="size-4 text-amber-400" />
                Search for Life Investigation Game
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 shrink-0 w-full sm:w-auto">
            {!isCompleted ? (
              <Button
                onClick={handleMarkComplete}
                variant="outline"
                size="sm"
                className="border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10 text-xs"
              >
                <CheckCircle2 className="size-3.5 mr-1.5" />
                Mark Module Complete
              </Button>
            ) : (
              <div className="text-center p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                <ShieldCheck className="size-6 text-emerald-400 mx-auto mb-1" />
                <span className="text-xs font-semibold text-emerald-200 block">
                  Astrobiologist Certified
                </span>
                <span className="text-[10px] text-emerald-400/80">
                  Stage 6 Life Sciences Honors
                </span>
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
              setActiveTab("lab");
              handleLabInteract();
            }}
            className={`px-4 py-2.5 rounded-t-xl font-semibold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === "lab"
                ? "border-emerald-500 text-emerald-400 bg-emerald-500/10"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <Globe className="size-4" />
            3D Habitable World Laboratory
          </button>

          <button
            onClick={() => setActiveTab("sublessons")}
            className={`px-4 py-2.5 rounded-t-xl font-semibold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === "sublessons"
                ? "border-emerald-500 text-emerald-400 bg-emerald-500/10"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <BookOpen className="size-4" />
            Astrobiology Lessons (10)
          </button>

          <button
            onClick={() => setActiveTab("quiz")}
            className={`px-4 py-2.5 rounded-t-xl font-semibold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === "quiz"
                ? "border-emerald-500 text-emerald-400 bg-emerald-500/10"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <HelpCircle className="size-4" />
            Knowledge Check Quiz
          </button>
        </div>

        {/* TAB A: Interactive Signature Laboratory */}
        {activeTab === "lab" && (
          <div className="space-y-6">
            <HabitableWorldLab currentLevel={level} onInteract={handleLabInteract} />
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
                {MODULE_23_SUBLESSONS.map((sub, idx) => (
                  <button
                    key={sub.id}
                    onClick={() => setActiveSubLessonIndex(idx)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                      activeSubLessonIndex === idx
                        ? "bg-emerald-950/40 border-emerald-500/50 text-white shadow-lg shadow-emerald-950/30"
                        : "bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
                    }`}
                  >
                    <span
                      className={`size-6 rounded-lg flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5 ${
                        activeSubLessonIndex === idx
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium line-clamp-1">{sub.title}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {sub.durationMinutes} min • {level}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Sub-Lesson Reading Pane */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 backdrop-blur-sm">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                    <span>
                      LESSON {activeSubLessonIndex + 1} OF {MODULE_23_SUBLESSONS.length}
                    </span>
                    <span>•</span>
                    <span>{level.toUpperCase()} LEVEL</span>
                  </div>
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="size-3.5 text-slate-400" />
                    {activeSubLesson.durationMinutes} min read
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {activeSubLesson.title}
                </h2>

                <div className="prose prose-invert max-w-none text-slate-300 text-sm sm:text-base leading-relaxed space-y-4">
                  {activeSubContent.split("\n\n").map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>

                {/* Sublesson Navigation */}
                <div className="flex items-center justify-between pt-6 border-t border-white/10">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={activeSubLessonIndex === 0}
                    onClick={() => setActiveSubLessonIndex((prev) => prev - 1)}
                    className="text-slate-400 hover:text-white"
                  >
                    <ArrowLeft className="size-4 mr-2" />
                    Previous Lesson
                  </Button>

                  {activeSubLessonIndex < MODULE_23_SUBLESSONS.length - 1 ? (
                    <Button
                      size="sm"
                      onClick={() => setActiveSubLessonIndex((prev) => prev + 1)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white"
                    >
                      Next Lesson
                      <ArrowRight className="size-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => setActiveTab("quiz")}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white"
                    >
                      Start Knowledge Check
                      <ChevronRight className="size-4 ml-1.5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB C: Quiz */}
        {activeTab === "quiz" && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 max-w-3xl mx-auto">
              <div className="mb-6 text-center space-y-1">
                <h3 className="text-lg font-bold text-white flex items-center justify-center gap-2">
                  <Award className="size-5 text-emerald-400" />
                  Module 23 Knowledge Check
                </h3>
                <p className="text-xs text-slate-400">
                  Test your mastery of astrobiology, extremophiles, ocean moons, biosignatures, and
                  evidence standards.
                </p>
              </div>

              <KnowledgeCheck
                quizId="module-23-quiz"
                questions={MODULE_23_QUIZ}
                onComplete={handleQuizComplete}
                onCompleteQuiz={handleQuizComplete}
                currentLevel={level}
              />
            </div>
          </div>
        )}
      </section>

      {/* 4. Astrobiology Discovery Facts */}
      <section className="space-y-4 pt-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Sparkles className="size-4 text-emerald-400" />
          Astrobiology Discovery Archive
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MODULE_23_DISCOVERY_FACTS.map((fact) => (
            <div
              key={fact.id}
              className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2 hover:border-emerald-500/30 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-300">{fact.title}</span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {fact.category}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{fact.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Scientific References & Sources */}
      <section className="pt-2">
        <SourceInformationPanel sources={MODULE_23_SOURCES} />
      </section>

      {/* 6. Next Recommended Module Card */}
      {nextRecommended && onSelectNextModule && (
        <section className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/40 via-purple-950/20 to-slate-900 border border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-blue-400 font-semibold block">
              NEXT RECOMMENDED MODULE
            </span>
            <h4 className="text-base font-bold text-white">{nextRecommended.module.title}</h4>
            <p className="text-xs text-slate-300">{nextRecommended.reason}</p>
          </div>
          <Button
            onClick={() => onSelectNextModule(nextRecommended.module)}
            className="bg-blue-600 hover:bg-blue-500 text-white shrink-0 text-xs"
          >
            Advance to Next Module
            <ArrowRight className="size-3.5 ml-1.5" />
          </Button>
        </section>
      )}
    </div>
  );
}
