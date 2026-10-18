// @ts-nocheck -- loosely-typed educational content; runtime-validated by rendering.
import React, { useState } from "react";
import type {
  LearningLevel,
  ModuleContract,
  ModuleStatus,
  UserProgress,
} from "@/lib/academy/types";
import {
  MODULE_16_SUBLESSONS,
  MODULE_16_QUIZ,
  MODULE_16_DISCOVERY_FACTS,
  MODULE_16_SCIENTIFIC_SOURCES,
} from "@/lib/academy/lessons/module-16-dark-matter-energy";
import { DarkMatterRotationLab } from "./DarkMatterRotationLab";
import { DarkEnergyCosmologyLab } from "./DarkEnergyCosmologyLab";
import { DarkSectorMythbusters } from "./DarkSectorMythbusters";
import { CosmicEnergyBudgetCard } from "./CosmicEnergyBudgetCard";
import { KnowledgeCheck } from "./KnowledgeCheck";
import { ModuleCompletionChecklist } from "./ModuleCompletionChecklist";
import { SourceInformationPanel } from "./SourceInformationPanel";
import { LearningLevelSelector } from "./LearningLevelSelector";
import {
  BookOpen,
  CheckCircle2,
  Sparkles,
  Layers,
  HelpCircle,
  Compass,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Orbit,
  Disc,
  Clock,
  ArrowLeft,
  Award,
  Zap,
  Activity,
  Atom,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Module16LayoutProps {
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

export function Module16Layout({
  module,
  progress,
  onSetLearningLevel,
  onUpdateModuleProgress,
  onRecordQuiz,
  onBackToMap,
  nextRecommended,
  onSelectNextModule,
}: Module16LayoutProps) {
  const level = progress.selectedLevel;
  const moduleProgress = progress.moduleProgress[module.id];
  const isCompleted = moduleProgress?.status === "completed";

  const [activeTab, setActiveTab] = useState<"darkmatter" | "darkenergy" | "inventory" | "myths">(
    "darkmatter",
  );
  const [activeSubLessonIndex, setActiveSubLessonIndex] = useState<number>(0);

  const activeSubLesson = MODULE_16_SUBLESSONS[activeSubLessonIndex];
  const activeSubContent = activeSubLesson.content[level];

  // Track progress milestones
  const handleLabAInteract = () => {
    onUpdateModuleProgress(module.id, 40, "in_progress");
  };

  const handleLabBInteract = () => {
    onUpdateModuleProgress(module.id, 65, "in_progress");
  };

  const handleMythsComplete = () => {
    onUpdateModuleProgress(module.id, 80, "in_progress");
  };

  const handleQuizComplete = (score: number, total: number) => {
    onRecordQuiz("module-16-quiz", score, total);
    const passThreshold = Math.ceil(total * 0.7);
    if (score >= passThreshold) {
      onUpdateModuleProgress(module.id, 90, "in_progress");
    } else {
      onUpdateModuleProgress(module.id, 80, "in_progress");
    }
  };

  return (
    <div className="space-y-12">
      {/* 1. Header & Navigation Back */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <button
            onClick={onBackToMap}
            className="inline-flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 font-semibold mb-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="size-3.5" />
            <span>← Back to Cosmic Learning Map</span>
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-violet-400 bg-violet-500/10 border border-violet-500/30 px-3 py-0.5 rounded-full uppercase tracking-wider">
              Stage 04 • Module 16
            </span>
            <span className="text-xs text-slate-400">Dark Sector Physics Bench</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Dark Matter & Dark Energy
          </h1>
          <p className="mt-1 text-sm sm:text-base text-slate-300 max-w-2xl">{module.subtitle}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
            <Clock className="size-3.5 text-violet-400" />
            <span>Estimated: {module.estimatedMinutes} mins</span>
          </div>

          {isCompleted ? (
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl">
              <CheckCircle2 className="size-4" />
              <span>Module Certified!</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-violet-300 bg-violet-500/10 border border-violet-500/30 px-3.5 py-1.5 rounded-xl">
              <ShieldCheck className="size-3.5 text-violet-400" />
              <span>Verified Track</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Age-Adaptive Learning Level Selector */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-violet-400">
          <Sparkles className="size-3.5" />
          <span>Curriculum Age-Adaptive Level (Classes 1–10)</span>
        </div>
        <LearningLevelSelector selectedLevel={level} onSelectLevel={onSetLearningLevel} />
      </section>

      {/* 3. Interactive Laboratory Chamber Tabs */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-900/80 border border-white/10">
          <button
            onClick={() => setActiveTab("darkmatter")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "darkmatter"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <Orbit className="size-4 text-indigo-300" />
            <span>1. Lab A: Dark Matter Rotation Bench</span>
          </button>

          <button
            onClick={() => setActiveTab("darkenergy")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "darkenergy"
                ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <TrendingUp className="size-4 text-violet-300" />
            <span>2. Lab B: Dark Energy & Expansion</span>
          </button>

          <button
            onClick={() => setActiveTab("inventory")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "inventory"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <Layers className="size-4 text-purple-300" />
            <span>3. Cosmic Inventory & Differences</span>
          </button>

          <button
            onClick={() => setActiveTab("myths")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "myths"
                ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <HelpCircle className="size-4 text-amber-300" />
            <span>4. Mythbuster Challenge</span>
          </button>
        </div>

        {/* Tab 1: Lab A - Dark Matter Rotation Curves */}
        {activeTab === "darkmatter" && <DarkMatterRotationLab onInteract={handleLabAInteract} />}

        {/* Tab 2: Lab B - Dark Energy & Cosmic Expansion */}
        {activeTab === "darkenergy" && <DarkEnergyCosmologyLab onInteract={handleLabBInteract} />}

        {/* Tab 3: Cosmic Inventory & Comparison */}
        {activeTab === "inventory" && <CosmicEnergyBudgetCard />}

        {/* Tab 4: Mythbuster Challenge */}
        {activeTab === "myths" && <DarkSectorMythbusters onComplete={handleMythsComplete} />}
      </section>

      {/* 4. Nine Comprehensive Sub-Lessons (Curriculum Stream) */}
      <section className="space-y-6 pt-4 border-t border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase font-bold tracking-wider text-violet-400 block mb-1">
              Curriculum Roadmap • 9 Lessons
            </span>
            <h3 className="text-2xl font-black text-white">
              The Physics of the Invisible Universe
            </h3>
          </div>

          <div className="text-xs text-slate-400 font-mono">
            Lesson {activeSubLesson.order} of {MODULE_16_SUBLESSONS.length}
          </div>
        </div>

        {/* Sub-lesson pill buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2">
          {MODULE_16_SUBLESSONS.map((sub, idx) => (
            <button
              key={sub.id}
              onClick={() => setActiveSubLessonIndex(idx)}
              className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                activeSubLessonIndex === idx
                  ? "bg-violet-600 text-white border-violet-400 font-bold shadow-md shadow-violet-900/30"
                  : "bg-slate-900/60 border-white/10 text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="font-mono text-[10px] block opacity-75">0{sub.order}</span>
              <span className="line-clamp-2 mt-0.5 leading-snug">{sub.title}</span>
            </button>
          ))}
        </div>

        {/* Active Lesson Reader Card */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-mono text-violet-400 font-semibold block">
                LESSON 0{activeSubLesson.order} • {activeSubLesson.readTimeMinutes} MINUTE DISCOVERY
              </span>
              <h4 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                {activeSubLesson.title}
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">{activeSubLesson.subtitle}</p>
            </div>
          </div>

          {/* Core Concept Banner */}
          <div className="p-4 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-200 text-sm leading-relaxed">
            <strong className="text-violet-300 block mb-1 font-mono uppercase text-xs">
              Key Insight:
            </strong>
            {activeSubContent.keyIdea}
          </div>

          {/* Lead & Main Explanation */}
          <div className="space-y-4 text-slate-200 text-sm sm:text-base leading-relaxed">
            <p className="font-medium text-white text-base sm:text-lg">{activeSubContent.lead}</p>
            <p className="text-slate-300 leading-relaxed">{activeSubContent.explanation}</p>
          </div>

          {/* Advanced Mathematics derivations (Young Astronomer level) */}
          {"mathematics" in activeSubContent && activeSubContent.mathematics && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/30 font-mono text-xs text-cyan-200 space-y-1">
              <span className="text-slate-400 text-[10px] block uppercase tracking-wider">
                Cosmological Mathematical Formulation:
              </span>
              <p className="leading-relaxed">{activeSubContent.mathematics}</p>
            </div>
          )}

          {/* Interactive Experiment Prompt */}
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-3 text-xs text-slate-300">
            <span className="flex items-center gap-2">
              <Sparkles className="size-4 text-violet-400 shrink-0" />
              <span>{activeSubContent.activityPrompt}</span>
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (
                  activeSubLesson.id.includes("rotation") ||
                  activeSubLesson.id.includes("visible")
                ) {
                  setActiveTab("darkmatter");
                } else if (
                  activeSubLesson.id.includes("expansion") ||
                  activeSubLesson.id.includes("accelerated")
                ) {
                  setActiveTab("darkenergy");
                } else if (
                  activeSubLesson.id.includes("what-dark-energy") ||
                  activeSubLesson.id.includes("lensing")
                ) {
                  setActiveTab("inventory");
                } else {
                  setActiveTab("myths");
                }
              }}
              className="text-xs border-white/10 shrink-0"
            >
              Open Lab
            </Button>
          </div>

          {/* Navigation Previous / Next */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs">
            <Button
              size="sm"
              variant="ghost"
              disabled={activeSubLessonIndex === 0}
              onClick={() => setActiveSubLessonIndex((i) => i - 1)}
              className="text-slate-400 hover:text-white"
            >
              ← Previous Lesson
            </Button>

            <Button
              size="sm"
              onClick={() => {
                if (activeSubLessonIndex < MODULE_16_SUBLESSONS.length - 1) {
                  setActiveSubLessonIndex((i) => i + 1);
                }
              }}
              className="bg-violet-600 hover:bg-violet-500 text-white font-semibold"
            >
              {activeSubLessonIndex < MODULE_16_SUBLESSONS.length - 1
                ? "Next Lesson →"
                : "Proceed to Knowledge Check ↓"}
            </Button>
          </div>
        </div>
      </section>

      {/* 5. Interactive Knowledge Check (Quiz) */}
      <section className="space-y-4 pt-4 border-t border-white/10">
        <KnowledgeCheck questions={MODULE_16_QUIZ} onComplete={handleQuizComplete} />
      </section>

      {/* 6. Scientific Sources & Discovery Facts */}
      <section className="space-y-4 pt-4 border-t border-white/10">
        <SourceInformationPanel
          sources={MODULE_16_SCIENTIFIC_SOURCES}
          discoveryFacts={MODULE_16_DISCOVERY_FACTS}
        />
      </section>

      {/* 7. Authoritative Verified Completion Checklist */}
      <section className="space-y-4">
        <ModuleCompletionChecklist
          moduleId={module.id}
          onNextModule={
            nextRecommended
              ? () => onSelectNextModule && onSelectNextModule(nextRecommended.module)
              : onBackToMap
          }
        />
      </section>
    </div>
  );
}
