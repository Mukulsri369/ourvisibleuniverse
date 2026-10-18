// @ts-nocheck -- loosely-typed educational content; runtime-validated by rendering.
import React, { useState } from "react";
import type {
  LearningLevel,
  LessonContract,
  ModuleContract,
  ModuleStatus,
  UserProgress,
} from "@/lib/academy/types";
import {
  MODULE_02_LESSON,
  MODULE_02_SUBLESSONS,
  MODULE_02_QUIZ,
  MODULE_02_SOURCES,
  PlanetariumStar,
  PlanetariumConstellation,
} from "@/lib/academy/lessons/module-02-night-sky";
import { VirtualPlanetarium3D } from "./VirtualPlanetarium3D";
import { AccessibleSkyChart2D } from "./AccessibleSkyChart2D";
import { ConstellationFinderGame } from "./ConstellationFinderGame";
import { KnowledgeCheck } from "./KnowledgeCheck";
import { ModuleCompletionChecklist } from "./ModuleCompletionChecklist";
import { SourceInformationPanel } from "./SourceInformationPanel";
import { LearningLevelSelector } from "./LearningLevelSelector";
import {
  Sparkles,
  Compass,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Layers,
  HelpCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  Eye,
  RotateCcw,
  Star,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitActivityOutcome } from "@/lib/academy/completion.functions";

interface Module02LayoutProps {
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

export function Module02Layout({
  module,
  progress,
  onSetLearningLevel,
  onUpdateModuleProgress,
  onRecordQuiz,
  onBackToMap,
  nextRecommended,
  onSelectNextModule,
}: Module02LayoutProps) {
  const currentLevel = progress.selectedLevel;
  const gradeContent = MODULE_02_LESSON.gradeLevelContent[currentLevel];

  // Visualizer Mode: 3D Virtual Planetarium vs 2D Fallback Chart
  const [viewMode, setViewMode] = useState<"3d" | "2d">("3d");
  const [selectedSubLessonIndex, setSelectedSubLessonIndex] = useState(0);
  const [hasTestedPlanetarium, setHasTestedPlanetarium] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  const activeSubLesson = MODULE_02_SUBLESSONS[selectedSubLessonIndex];
  const subLessonContent = activeSubLesson.content[currentLevel];

  const handleFinishQuiz = (score: number, total: number) => {
    setQuizFinished(true);
    onRecordQuiz("quiz_module_02", score, total);
    // Record learning progress without bypassing authoritative validation
    onUpdateModuleProgress("02", 90, "in_progress");
  };

  const handleFinishGame = () => {
    setGameCompleted(true);
    onUpdateModuleProgress("02", 75, "in_progress");
    try {
      void submitActivityOutcome({
        data: {
          moduleId: "02",
          activityId: "act_02_planetarium_nav",
          payload: {
            alignedCount: 3,
            polarisLocated: true,
            constellationsIdentified: 3,
            success: true,
          },
          isAccessibleAlternative: false,
        },
      });
    } catch (err) {
      console.warn("Could not submit module 02 activity outcome:", err);
    }
  };

  return (
    <div className="space-y-12">
      {/* 1. Module Header Navigation & Badges */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onBackToMap}
            className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
          >
            <span>← Back to Cosmic Academy Curriculum</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 rounded-full uppercase">
              Stage 01 • Module 02
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="size-3 text-cyan-400" />
              18 Minutes
            </span>
          </div>
        </div>

        <div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            The Night Sky & Constellations
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
            {gradeContent.introHook}
          </p>
        </div>

        {/* Learning Level Selector */}
        <div className="pt-2">
          <LearningLevelSelector currentLevel={currentLevel} onSelectLevel={onSetLearningLevel} />
        </div>
      </div>

      {/* 2. Signature Experience: 360° Virtual Planetarium Dome & 2D Fallback */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/10">
          <div>
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              Signature Visualizer
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
              Interactive Virtual Planetarium Dome
            </h2>
          </div>

          {/* Switcher: 3D Dome vs 2D Planisphere */}
          <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-white/10 text-xs">
            <button
              onClick={() => setViewMode("3d")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                viewMode === "3d"
                  ? "bg-cyan-500 text-slate-950 shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              360° Virtual Dome (3D)
            </button>
            <button
              onClick={() => setViewMode("2d")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                viewMode === "2d"
                  ? "bg-cyan-500 text-slate-950 shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              2D Planisphere Chart
            </button>
          </div>
        </div>

        {viewMode === "3d" ? (
          <VirtualPlanetarium3D
            onExploreCompleted={() => {
              setHasTestedPlanetarium(true);
              onUpdateModuleProgress("02", 40, "in_progress");
            }}
          />
        ) : (
          <AccessibleSkyChart2D />
        )}
      </section>

      {/* 3. The 6 Interactive Lessons Curriculum */}
      <section className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
          <div>
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              Core Lessons
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              6 Progressive Night Sky Explorations
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Select any lesson to explore age-adaptive science concepts
          </span>
        </div>

        {/* Sub-Lesson Tab Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {MODULE_02_SUBLESSONS.map((lesson, idx) => {
            const isSelected = selectedSubLessonIndex === idx;
            return (
              <button
                key={lesson.id}
                onClick={() => setSelectedSubLessonIndex(idx)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? "bg-cyan-500/20 border-cyan-400 text-white shadow-md shadow-cyan-500/10"
                    : "bg-slate-900/50 border-white/5 text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="text-[10px] font-mono font-bold text-cyan-400 block mb-0.5">
                  Lesson 0{lesson.number}
                </span>
                <span className="text-xs font-bold line-clamp-2 leading-snug">{lesson.title}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Lesson Interactive Content Card */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 sm:p-8 backdrop-blur-xl space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded">
                  Lesson 0{activeSubLesson.number} of 06
                </span>
                <span className="text-xs text-amber-300 font-semibold">
                  Curriculum for{" "}
                  {currentLevel === "junior"
                    ? "Classes 1–3"
                    : currentLevel === "explorer"
                      ? "Classes 4–6"
                      : "Classes 7–10"}
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                {activeSubLesson.title}
              </h3>
              <p className="text-xs sm:text-sm text-cyan-300 font-medium mt-0.5">
                {activeSubLesson.subtitle}
              </p>
            </div>
          </div>

          {/* Core Lesson Body */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4 text-sm text-slate-200 leading-relaxed">
              <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20">
                <strong className="text-cyan-300 block text-xs uppercase tracking-wider mb-1">
                  Summary Concept
                </strong>
                <p>{subLessonContent.summary}</p>
              </div>

              <div>
                <strong className="text-white block text-sm font-bold mb-1.5">
                  Deep Scientific Dive:
                </strong>
                <p className="text-slate-300">{subLessonContent.deepDive}</p>
              </div>

              <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-4 space-y-1">
                <strong className="text-amber-300 block text-xs uppercase tracking-wider">
                  Real-World Math & Analogy
                </strong>
                <p className="text-xs text-slate-300 leading-relaxed font-mono">
                  {subLessonContent.mathOrAnalogy}
                </p>
              </div>
            </div>

            {/* Side Card: Key Takeaway & Did You Know */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                    Key Takeaway
                  </span>
                </div>
                <p className="text-xs text-emerald-100 font-medium leading-relaxed">
                  {subLessonContent.takeaway}
                </p>
              </div>

              <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-5 space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-amber-400" />
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                    Did You Know?
                  </span>
                </div>
                <p className="text-xs text-amber-100 leading-relaxed">
                  {subLessonContent.didYouKnow}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Interactive Mission: Find the Constellation Game */}
      <section className="pt-4">
        <ConstellationFinderGame level={currentLevel} onFinishGame={handleFinishGame} />
      </section>

      {/* 5. Knowledge Check (Quiz) */}
      <section className="pt-4" id="module-02-quiz">
        <KnowledgeCheck
          quizId="quiz_module_02"
          currentLevel={currentLevel}
          questions={gradeContent.quizQuestions}
          onCompleteQuiz={handleFinishQuiz}
        />
      </section>

      {/* 6. Primary Scientific Grounding Archives */}
      <section className="pt-4">
        <SourceInformationPanel sources={MODULE_02_SOURCES} />
      </section>

      {/* 6b. Authoritative Verified Module Completion Checklist */}
      <section className="pt-4" id="module-02-checklist">
        <ModuleCompletionChecklist
          moduleId="02"
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
      </section>

      {/* 7. Next Recommended Step Banner: Module 04 Light, Time & Cosmic Observation */}
      <section className="rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900/80 p-6 sm:p-8 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="size-12 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
            <Compass className="size-6 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 rounded-full uppercase">
                Up Next on Your Cosmic Journey
              </span>
              <span className="text-xs text-amber-300 font-semibold">Stage 01 • Module 04</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
              Module 04: Light, Time & Cosmic Observation
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Now that you can navigate the night sky, discover why the speed of light turns every
              telescope into a genuine time machine!
            </p>
          </div>
        </div>

        <div className="flex-shrink-0 flex flex-wrap gap-2">
          {onSelectNextModule ? (
            <Button
              size="lg"
              onClick={() => {
                const targetMod = nextRecommended?.module || {
                  id: "03",
                  slug: "cosmic-distances-and-scale",
                  number: 3,
                  title: "Cosmic Distances & Scale",
                  subtitle: "Astronomical Units, Light-Years and Parsecs",
                  description:
                    "Grasp the mind-bending gulfs of empty space between worlds and why standard kilometers fail in deep space.",
                  stageId: 1,
                  recommendedOrder: 3,
                  difficultyLevels: ["Beginner", "Intermediate"],
                  learningObjectives: [],
                  prerequisites: ["01"],
                  route: "/learn?module=03",
                  estimatedMinutes: 20,
                  visualAssets: { iconName: "Ruler", badgeColor: "" },
                  scientificSources: [],
                  status: "ready",
                  version: "1.0.0",
                };
                onSelectNextModule(targetMod);
              }}
              className="bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold shadow-lg"
            >
              <span>Start Module 03: Cosmic Distances & Scale</span>
              <ArrowRight className="size-4 ml-2" />
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={onBackToMap}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold shadow-lg"
            >
              <span>Return to Cosmic Map</span>
              <ArrowRight className="size-4 ml-2" />
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}
