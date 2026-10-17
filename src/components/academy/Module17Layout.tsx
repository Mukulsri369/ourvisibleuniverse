// @ts-nocheck -- loosely-typed educational content; runtime-validated by rendering.
import React, { useState } from "react";
import type {
  LearningLevel,
  ModuleContract,
  ModuleStatus,
  UserProgress,
} from "@/lib/academy/types";
import { Link } from "@tanstack/react-router";
import {
  MODULE_17_SUBLESSONS,
  MODULE_17_QUIZ,
  MODULE_17_DISCOVERY_FACTS,
  MODULE_17_SCIENTIFIC_SOURCES,
} from "@/lib/academy/lessons/module-17-big-bang";
import { CosmicTimeMachine3D } from "./CosmicTimeMachine3D";
import { CMBExplorerLab } from "./CMBExplorerLab";
import { GalaxyEvolutionCompareLab } from "./GalaxyEvolutionCompareLab";
import { KnowledgeCheck } from "./KnowledgeCheck";
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
  Orbit,
  Clock,
  ArrowLeft,
  Award,
  Zap,
  Activity,
  Atom,
  ShieldCheck,
  Radio,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Module17LayoutProps {
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

export function Module17Layout({
  module,
  progress,
  onSetLearningLevel,
  onUpdateModuleProgress,
  onRecordQuiz,
  onBackToMap,
  nextRecommended,
  onSelectNextModule,
}: Module17LayoutProps) {
  const level = progress.selectedLevel;
  const moduleProgress = progress.moduleProgress[module.id];
  const isCompleted = moduleProgress?.status === "completed";

  const [activeTab, setActiveTab] = useState<
    "timemachine" | "cmb" | "evolution" | "sublessons" | "quiz"
  >("timemachine");
  const [activeSubLessonIndex, setActiveSubLessonIndex] = useState<number>(0);

  const activeSubLesson = MODULE_17_SUBLESSONS[activeSubLessonIndex];
  const activeSubContent = activeSubLesson.content[level];

  // Track progress milestones
  const handleTimeMachineInteract = () => {
    onUpdateModuleProgress(module.id, 40, "in_progress");
  };

  const handleCMBInteract = () => {
    onUpdateModuleProgress(module.id, 65, "in_progress");
  };

  const handleEvolutionInteract = () => {
    onUpdateModuleProgress(module.id, 80, "in_progress");
  };

  const handleQuizComplete = (score: number, total: number) => {
    onRecordQuiz("module-17-quiz", score, total);
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
            <span className="text-xs font-mono font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-3 py-0.5 rounded-full uppercase tracking-wider">
              Stage 05 • Module 17
            </span>
            <span className="text-xs text-slate-400">Cosmic Chronology & Origins</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Big Bang & Cosmic Evolution
          </h1>
          <p className="mt-1 text-sm sm:text-base text-slate-300 max-w-2xl">{module.subtitle}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
            <Clock className="size-3.5 text-rose-400" />
            <span>Estimated: {module.estimatedMinutes} mins</span>
          </div>

          {isCompleted ? (
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl">
              <CheckCircle2 className="size-4" />
              <span>Module Completed!</span>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={handleMarkComplete}
              className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-md shadow-rose-600/30"
            >
              <Award className="size-3.5 mr-1.5" />
              <span>Mark Complete</span>
            </Button>
          )}
        </div>
      </div>

      {/* 2. Age-Adaptive Learning Level Selector */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-400">
          <Sparkles className="size-3.5" />
          <span>Curriculum Age-Adaptive Level (Classes 1–12+)</span>
        </div>
        <LearningLevelSelector selectedLevel={level} onSelectLevel={onSetLearningLevel} />
      </section>

      {/* 2b. Cosmic Evolution Interactive Experience Cross-Link Banner */}
      <div className="bg-gradient-to-r from-cyan-950/40 via-purple-950/40 to-slate-900 border border-cyan-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-cyan-500/5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Orbit className="size-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span>Full 15-Stage Cosmic Evolution Experience</span>
              <span className="text-[10px] font-mono uppercase bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30">
                Interactive Timeline
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Explore the entire 13.8-billion-year sequence from the hot Big Bang expansion to the
              modern cosmic web with 3 viewing modes.
            </p>
          </div>
        </div>
        <Button
          asChild
          size="sm"
          className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold whitespace-nowrap"
        >
          <Link to="/cosmic-evolution">
            <span>Launch Cosmic Evolution</span>
            <ArrowRight className="size-3.5 ml-1.5" />
          </Link>
        </Button>
      </div>

      {/* 3. Interactive Laboratory Chamber Tabs */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-900/80 border border-white/10">
          <button
            onClick={() => setActiveTab("timemachine")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "timemachine"
                ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <Clock className="size-4 text-rose-300" />
            <span>1. Signature: Cosmic Time Machine</span>
          </button>

          <button
            onClick={() => setActiveTab("cmb")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "cmb"
                ? "bg-cyan-600 text-white shadow-lg shadow-cyan-600/30"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <Radio className="size-4 text-cyan-300" />
            <span>2. Lab: CMB & Sound Horizon</span>
          </button>

          <button
            onClick={() => setActiveTab("evolution")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "evolution"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <Orbit className="size-4 text-purple-300" />
            <span>3. Lab: Galaxy Population & Cosmic Noon</span>
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
                ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <HelpCircle className="size-4 text-amber-300" />
            <span>5. Knowledge Check</span>
          </button>
        </div>

        {/* Tab 1: Signature Cosmic Time Machine */}
        {activeTab === "timemachine" && (
          <CosmicTimeMachine3D level={level} onInteract={handleTimeMachineInteract} />
        )}

        {/* Tab 2: CMB Explorer Lab */}
        {activeTab === "cmb" && <CMBExplorerLab onInteract={handleCMBInteract} />}

        {/* Tab 3: Galaxy Evolution & Cosmic Noon Lab */}
        {activeTab === "evolution" && (
          <GalaxyEvolutionCompareLab onInteract={handleEvolutionInteract} />
        )}

        {/* Tab 4: 8 Sub-Lessons */}
        {activeTab === "sublessons" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sub-lessons navigation list (4 cols) */}
            <div className="lg:col-span-4 space-y-2">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/10 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Module 17 Curriculum Chapters (8)
              </div>
              <div className="space-y-1.5">
                {MODULE_17_SUBLESSONS.map((sub, idx) => (
                  <button
                    key={sub.id}
                    onClick={() => setActiveSubLessonIndex(idx)}
                    className={`w-full p-3 rounded-xl text-left border transition-all flex items-start justify-between gap-2 ${
                      activeSubLessonIndex === idx
                        ? "bg-rose-500/20 border-rose-500/50 text-white shadow-lg shadow-rose-950/40 ring-1 ring-rose-500/30"
                        : "bg-slate-900/40 border-white/5 text-slate-400 hover:bg-slate-900/80 hover:text-white"
                    }`}
                  >
                    <div>
                      <div className="text-[10px] font-mono text-rose-400 font-bold uppercase">
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
                <div className="text-xs font-mono text-rose-400 uppercase font-bold tracking-wider">
                  Chapter 0{activeSubLesson.number} of {MODULE_17_SUBLESSONS.length}
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
                  disabled={activeSubLessonIndex === MODULE_17_SUBLESSONS.length - 1}
                  onClick={() => setActiveSubLessonIndex(activeSubLessonIndex + 1)}
                  className="text-xs font-semibold bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20"
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
              <span className="text-xs font-mono uppercase text-amber-400 font-bold">
                Knowledge Mastery Check
              </span>
              <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
                Cosmic History & Big Bang Examination
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Verify your understanding of cosmic expansion, nucleosynthesis, the CMB, and galaxy
                assembly.
              </p>
            </div>

            <KnowledgeCheck questions={MODULE_17_QUIZ} onComplete={handleQuizComplete} />
          </div>
        )}
      </section>

      {/* 4. Discovery Facts Grid */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Zap className="size-4 text-rose-400" />
          Fascinating Cosmic Chronology Facts
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {MODULE_17_DISCOVERY_FACTS.map((fact, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl border border-white/10 bg-slate-900/50 hover:bg-slate-900/80 transition-all space-y-2"
            >
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-rose-400" />
                {fact.title}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{fact.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Scientific References & Citation Panel */}
      <section>
        <SourceInformationPanel sources={MODULE_17_SCIENTIFIC_SOURCES} />
      </section>

      {/* 6. Next Recommended Module Banner */}
      {nextRecommended && onSelectNextModule && (
        <section className="rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-950/30 via-slate-900/60 to-purple-950/30 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-rose-400 font-bold">
              Next in Curriculum
            </div>
            <div className="text-lg font-bold text-white mt-0.5">
              {nextRecommended.module.number}. {nextRecommended.module.title}
            </div>
            <div className="text-xs text-slate-300 mt-0.5">{nextRecommended.reason}</div>
          </div>
          <Button
            onClick={() => onSelectNextModule(nextRecommended.module)}
            className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-lg shadow-rose-600/30"
          >
            Continue to Module {nextRecommended.module.number}
            <ArrowRight className="size-4 ml-1.5" />
          </Button>
        </section>
      )}
    </div>
  );
}
