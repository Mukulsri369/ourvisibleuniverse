// @ts-nocheck -- loosely-typed educational content; runtime-validated by rendering.
import React, { useState } from "react";
import type {
  LearningLevel,
  ModuleContract,
  ModuleStatus,
  UserProgress,
} from "@/lib/academy/types";
import {
  MODULE_24_SUBLESSONS,
  MODULE_24_QUIZ,
  MODULE_24_SOURCES,
} from "@/lib/academy/lessons/module-24-cosmic-lab";
import { CosmicPhysicsLab } from "./CosmicPhysicsLab";
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
  Cpu,
  Atom,
  Flame,
  Orbit,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Module24LayoutProps {
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

export function Module24Layout({
  module,
  progress,
  onSetLearningLevel,
  onUpdateModuleProgress,
  onRecordQuiz,
  onBackToMap,
}: Module24LayoutProps) {
  const level = progress.selectedLevel;
  const moduleProgress = progress.moduleProgress[module.id];
  const isCompleted = moduleProgress?.status === "completed";

  const [activeTab, setActiveTab] = useState<"lab" | "sublessons" | "quiz">("lab");
  const [activeSubLessonIndex, setActiveSubLessonIndex] = useState<number>(0);

  const activeSubLesson = MODULE_24_SUBLESSONS[activeSubLessonIndex];
  const activeSubContent = activeSubLesson.content[level];

  // Track progress
  const handleLabInteract = () => {
    onUpdateModuleProgress(module.id, 65, "in_progress");
  };

  const handleQuizComplete = (score: number, total: number) => {
    onRecordQuiz("module-24-quiz", score, total);
    const passThreshold = Math.ceil(total * 0.75);
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
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
              STAGE 6 CAPSTONE
            </span>
            <span>•</span>
            <span>MODULE 24 OF 24</span>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <LearningLevelSelector currentLevel={level} onSelectLevel={onSetLearningLevel} />
          {isCompleted ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
              <CheckCircle2 className="size-3.5" />
              <span>Academy Completed!</span>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkComplete}
              className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10 text-xs"
            >
              <CheckCircle2 className="size-3.5 mr-1 text-amber-400" />
              Mark Capstone Complete
            </Button>
          )}
        </div>
      </div>

      {/* 2. Capstone Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-amber-500/30 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="size-3" />
              Cosmic Academy Grand Finale
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-mono">
              Est. Time: 35 Minutes
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Cosmic Physics Laboratory &amp; Challenges
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            Synthesize all 23 previous modules inside an interactive astrophysical playground. Run
            numerical simulations across orbital mechanics, galactic dynamics, stellar death,
            relativistic black holes, cosmological expansion, and interplanetary mission
            architecture.
          </p>

          <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <Atom className="size-4 text-amber-400" />
              <span>10 Integrated Physics Labs</span>
            </div>
            <div className="flex items-center gap-2">
              <Compass className="size-4 text-cyan-400" />
              <span>5 Quantitative Capstone Steps</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="size-4 text-emerald-400" />
              <span>Accredited Explorer Certificate</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Section Navigation Tabs */}
      <div className="flex border-b border-white/10 gap-2 sm:gap-4 overflow-x-auto pb-1 text-sm">
        <button
          onClick={() => setActiveTab("lab")}
          className={`flex items-center gap-2 px-4 py-2.5 font-medium rounded-t-xl transition-colors border-b-2 -mb-px whitespace-nowrap ${
            activeTab === "lab"
              ? "border-amber-400 text-amber-400 bg-amber-500/10"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Cpu className="size-4" />
          <span>Physics Laboratory (10 Labs)</span>
        </button>

        <button
          onClick={() => setActiveTab("sublessons")}
          className={`flex items-center gap-2 px-4 py-2.5 font-medium rounded-t-xl transition-colors border-b-2 -mb-px whitespace-nowrap ${
            activeTab === "sublessons"
              ? "border-amber-400 text-amber-400 bg-amber-500/10"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <BookOpen className="size-4" />
          <span>Curriculum Overview</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[11px] text-slate-300">
            {MODULE_24_SUBLESSONS.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("quiz")}
          className={`flex items-center gap-2 px-4 py-2.5 font-medium rounded-t-xl transition-colors border-b-2 -mb-px whitespace-nowrap ${
            activeTab === "quiz"
              ? "border-amber-400 text-amber-400 bg-amber-500/10"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Award className="size-4" />
          <span>Capstone Master Quiz</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[11px] text-slate-300">
            {MODULE_24_QUIZ.length}
          </span>
        </button>
      </div>

      {/* 4. Tab Contents */}
      {activeTab === "lab" && (
        <CosmicPhysicsLab
          level={level}
          onInteract={handleLabInteract}
          onCompleteModule={handleMarkComplete}
        />
      )}

      {activeTab === "sublessons" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Sub-lesson Sidebar */}
          <div className="md:col-span-4 space-y-2">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 px-2 mb-3">
              Capstone Foundations
            </h3>
            {MODULE_24_SUBLESSONS.map((sub, idx) => {
              const isSelected = activeSubLessonIndex === idx;
              return (
                <button
                  key={sub.id}
                  onClick={() => setActiveSubLessonIndex(idx)}
                  className={`w-full text-left p-3.5 rounded-xl transition border flex items-start gap-3 ${
                    isSelected
                      ? "bg-slate-800 border-amber-500/50 text-white shadow-lg shadow-amber-500/10"
                      : "bg-slate-900/60 border-white/5 text-slate-400 hover:text-white hover:bg-slate-800/50"
                  }`}
                >
                  <span
                    className={`size-6 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5 ${
                      isSelected ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold leading-snug">{sub.title}</h4>
                    <span className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
                      <Clock className="size-3" />
                      {sub.durationMinutes} min
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Sub-lesson Reader */}
          <div className="md:col-span-8 bg-slate-900 border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-xs font-mono text-amber-400 uppercase tracking-wider font-semibold">
                  LESSON {activeSubLessonIndex + 1} OF {MODULE_24_SUBLESSONS.length}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                  {activeSubLesson.title}
                </h2>
              </div>
              <span className="px-2.5 py-1 rounded bg-slate-800 text-xs font-mono text-slate-300">
                {level.toUpperCase()} LEVEL
              </span>
            </div>

            <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed whitespace-pre-line">
              {activeSubContent}
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-white/10">
              <Button
                variant="outline"
                size="sm"
                disabled={activeSubLessonIndex === 0}
                onClick={() => setActiveSubLessonIndex((prev) => Math.max(0, prev - 1))}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Previous Lesson
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  if (activeSubLessonIndex < MODULE_24_SUBLESSONS.length - 1) {
                    setActiveSubLessonIndex((prev) => prev + 1);
                  } else {
                    setActiveTab("lab");
                  }
                }}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
              >
                {activeSubLessonIndex < MODULE_24_SUBLESSONS.length - 1 ? (
                  <>
                    Next Lesson
                    <ChevronRight className="size-4 ml-1" />
                  </>
                ) : (
                  <>
                    Launch Laboratory
                    <Cpu className="size-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "quiz" && (
        <div className="max-w-3xl mx-auto space-y-6">
          <KnowledgeCheck
            title="Module 24: Cosmic Physics Capstone Master Quiz"
            questions={MODULE_24_QUIZ}
            onComplete={handleQuizComplete}
            isCompleted={isCompleted}
            minPassScore={6}
          />
        </div>
      )}

      {/* 5. Sources Information Footer */}
      <SourceInformationPanel sources={MODULE_24_SOURCES} />
    </div>
  );
}
