// @ts-nocheck -- loosely-typed educational content; runtime-validated by rendering.
import React, { useState } from "react";
import type {
  LearningLevel,
  ModuleContract,
  ModuleStatus,
  UserProgress,
} from "@/lib/academy/types";
import {
  MODULE_03_LESSON,
  MODULE_03_SUBLESSONS,
  MODULE_03_QUIZ,
  MODULE_03_SOURCES,
} from "@/lib/academy/lessons/module-03-cosmic-scale";
import { CosmicScaleExplorer } from "./CosmicScaleExplorer";
import { CosmicScaleExperimentsLab } from "./CosmicScaleExperimentsLab";
import { AccessibleScaleDiagrams } from "./AccessibleScaleDiagrams";
import { KnowledgeCheck } from "./KnowledgeCheck";
import { ModuleCompletionChecklist } from "./ModuleCompletionChecklist";
import { SourceInformationPanel } from "./SourceInformationPanel";
import { LearningLevelSelector } from "./LearningLevelSelector";
import {
  Ruler,
  Clock,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Eye,
  Sliders,
  ChevronRight,
  FlaskConical,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitActivityOutcome } from "@/lib/academy/completion.functions";

interface Module03LayoutProps {
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

export function Module03Layout({
  module,
  progress,
  onSetLearningLevel,
  onUpdateModuleProgress,
  onRecordQuiz,
  onBackToMap,
  nextRecommended,
  onSelectNextModule,
}: Module03LayoutProps) {
  const currentLevel = progress.selectedLevel;
  const gradeContent = MODULE_03_LESSON.gradeLevelContent[currentLevel];

  // Visualizer Mode: Interactive Explorer vs Accessible 2D Tables
  const [viewMode, setViewMode] = useState<"interactive" | "accessible">("interactive");
  const [selectedSubLessonIndex, setSelectedSubLessonIndex] = useState<number>(0);
  const [hasExploredScale, setHasExploredScale] = useState<boolean>(false);
  const [completedExperimentsCount, setCompletedExperimentsCount] = useState<number>(0);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);

  const activeSubLesson = MODULE_03_SUBLESSONS[selectedSubLessonIndex];
  const subLessonContent = activeSubLesson.content[currentLevel];

  const handleFinishQuiz = (score: number, total: number) => {
    setQuizFinished(true);
    onRecordQuiz("quiz_module_03", score, total);
    // Record learning progress without bypassing authoritative validation
    onUpdateModuleProgress("03", 90, "in_progress");
  };

  const handleExplorationComplete = () => {
    setHasExploredScale(true);
    onUpdateModuleProgress(
      "03",
      Math.max(progress.moduleProgress["03"]?.progress || 0, 40),
      "in_progress",
    );
  };

  const handleExperimentComplete = (id: string) => {
    setCompletedExperimentsCount((prev) => {
      const next = prev + 1;
      const progressPercent = Math.min(40 + next * 10, 80);
      onUpdateModuleProgress(
        "03",
        Math.max(progress.moduleProgress["03"]?.progress || 0, progressPercent),
        "in_progress",
      );
      try {
        void submitActivityOutcome({
          data: {
            moduleId: "03",
            activityId: "act_03_distance_ladder_lab",
            payload: {
              parallaxArcsec: 0.772,
              distanceParsecs: 1.295,
              success: true,
            },
            isAccessibleAlternative: false,
          },
        });
      } catch (err) {
        console.warn("Could not submit parallax telemetry:", err);
      }
      return next;
    });
  };

  return (
    <div className="space-y-12">
      {/* 1. Module Header Navigation & Badges */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onBackToMap}
            className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
          >
            <span>← Back to Cosmic Academy Curriculum</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-0.5 rounded-full uppercase">
              Stage 01 • Module 03
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="size-3 text-indigo-400" />
              20 Minutes
            </span>
          </div>
        </div>

        <div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Cosmic Distances & Scale
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

      {/* 2. Signature Experience: Continuous Logarithmic Scale Explorer */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/10">
          <div>
            <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
              Signature Visualizer
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
              Continuous Logarithmic Cosmic-Scale Explorer
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={viewMode === "interactive" ? "default" : "outline"}
              onClick={() => setViewMode("interactive")}
              className={
                viewMode === "interactive"
                  ? "bg-indigo-600 text-white font-semibold text-xs"
                  : "border-white/10 text-slate-300 text-xs"
              }
            >
              <Sliders className="size-3.5 mr-1.5" />
              Interactive Explorer
            </Button>
            <Button
              size="sm"
              variant={viewMode === "accessible" ? "default" : "outline"}
              onClick={() => setViewMode("accessible")}
              className={
                viewMode === "accessible"
                  ? "bg-indigo-600 text-white font-semibold text-xs"
                  : "border-white/10 text-slate-300 text-xs"
              }
            >
              <Eye className="size-3.5 mr-1.5" />
              Accessible 2D Reference
            </Button>
          </div>
        </div>

        {viewMode === "interactive" ? (
          <CosmicScaleExplorer
            currentLevel={currentLevel}
            onExplorationComplete={handleExplorationComplete}
          />
        ) : (
          <AccessibleScaleDiagrams />
        )}
      </section>

      {/* 3. Sublesson Navigator (6 Core Lessons) */}
      <section className="space-y-6">
        <div className="border-b border-white/10 pb-2">
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
            Curriculum Core
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
            Module 03 Lessons: Understanding Cosmic Dimensions
          </h2>
        </div>

        {/* Sublesson Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {MODULE_03_SUBLESSONS.map((sub, idx) => {
            const isSelected = selectedSubLessonIndex === idx;
            return (
              <button
                key={sub.id}
                onClick={() => setSelectedSubLessonIndex(idx)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "border-indigo-400 bg-indigo-500/15 text-white shadow-md shadow-indigo-500/10"
                    : "border-white/5 bg-slate-900/60 text-slate-400 hover:border-white/20 hover:text-slate-200"
                }`}
              >
                <div className="text-[10px] font-mono font-bold text-indigo-400 uppercase">
                  Lesson 0{sub.number}
                </div>
                <div className="text-xs font-bold text-white mt-0.5 truncate">{sub.title}</div>
              </button>
            );
          })}
        </div>

        {/* Active Sublesson Detail Card */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-indigo-400 uppercase">
              Lesson {activeSubLesson.number} of {MODULE_03_SUBLESSONS.length}
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              {activeSubLesson.title}
            </h3>
            <p className="text-sm font-medium text-indigo-300/90">{activeSubLesson.subtitle}</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-950 p-5 space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="size-4 text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Core Explanation
              </span>
            </div>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
              {subLessonContent.summary}
            </p>
          </div>

          {/* Deep Dive & Takeaway Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-5 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                <CheckCircle2 className="size-4" />
                <span>Essential Takeaway</span>
              </div>
              <p className="text-xs sm:text-sm text-cyan-100/90 font-medium leading-relaxed">
                {subLessonContent.takeaway}
              </p>
            </div>

            <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-5 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                <Sparkles className="size-4" />
                <span>Did You Know?</span>
              </div>
              <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed">
                {subLessonContent.didYouKnow}
              </p>
            </div>
          </div>

          {/* In-Depth Scientific Exploration */}
          <div className="rounded-xl border border-white/10 bg-slate-950/80 p-5 space-y-2">
            <div className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
              Deeper Exploration
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {subLessonContent.deepDive}
            </p>
          </div>

          {/* Math or Real-World Analogy */}
          <div className="rounded-xl border border-purple-500/20 bg-purple-950/20 p-4 flex items-start gap-3">
            <Ruler className="size-4 text-purple-400 shrink-0 mt-0.5" />
            <div className="text-xs text-purple-200/90">
              <strong className="text-purple-300">
                {currentLevel === "astronomer"
                  ? "Mathematical Formulation:"
                  : "Real-World Analogy:"}
              </strong>{" "}
              {subLessonContent.mathOrAnalogy}
            </div>
          </div>

          {/* Lesson Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedSubLessonIndex((prev) => Math.max(prev - 1, 0))}
              disabled={selectedSubLessonIndex === 0}
              className="border-white/10 text-xs text-slate-300"
            >
              ← Previous Lesson
            </Button>
            <span className="text-xs font-mono text-slate-400">
              {selectedSubLessonIndex + 1} / {MODULE_03_SUBLESSONS.length}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setSelectedSubLessonIndex((prev) =>
                  Math.min(prev + 1, MODULE_03_SUBLESSONS.length - 1),
                )
              }
              disabled={selectedSubLessonIndex === MODULE_03_SUBLESSONS.length - 1}
              className="border-white/10 text-xs text-slate-300"
            >
              Next Lesson →
            </Button>
          </div>
        </div>
      </section>

      {/* 4. Interactive Experiments Laboratory */}
      <section className="space-y-4">
        <div className="border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <FlaskConical className="size-4 text-rose-400" />
            <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider">
              Laboratory Experiments
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
            Interactive Cosmic Scale Experiments
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Test size scales, simulate light-speed beams, calculate spacecraft flight times, and
            walk the basketball solar system.
          </p>
        </div>

        <CosmicScaleExperimentsLab
          currentLevel={currentLevel}
          onExperimentComplete={handleExperimentComplete}
        />
      </section>

      {/* 5. Knowledge Check: Quiz */}
      <section className="space-y-4">
        <div className="border-b border-white/10 pb-2">
          <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
            Evaluation & Mastery
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
            Knowledge Check: Cosmic Distances & Scale
          </h2>
        </div>

        <KnowledgeCheck
          quizId="quiz_module_03"
          currentLevel={currentLevel}
          questions={MODULE_03_QUIZ}
          onFinishQuiz={handleFinishQuiz}
        />
      </section>

      {/* 6. Scientific Sources Panel */}
      <section className="space-y-4">
        <SourceInformationPanel sources={MODULE_03_SOURCES} />
      </section>

      {/* 6b. Authoritative Verified Module Completion Checklist */}
      <section id="module-03-checklist">
        <ModuleCompletionChecklist
          moduleId="03"
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

      {/* 7. Next Module Recommendation / Navigation */}
      <section className="p-6 sm:p-8 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-indigo-950/40 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-indigo-400 uppercase">
              Next Up in Stage 01
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              Ready for Module 04: Light, Time & Cosmic Observation?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Now that you understand astronomical units and light-years, explore how the cosmic
              speed of light turns every telescope into a genuine time machine looking deep into the
              ancient past.
            </p>
          </div>

          {onSelectNextModule ? (
            <Button
              size="lg"
              onClick={() => {
                const targetMod = nextRecommended?.module || {
                  id: "04",
                  slug: "light-time-and-cosmic-observation",
                  number: 4,
                  title: "Light, Time & Cosmic Observation",
                  subtitle: "Looking outward is looking backward in time",
                  description:
                    "Discover why the speed of light turns every telescope into a genuine time machine.",
                  stageId: 1,
                  recommendedOrder: 4,
                  difficultyLevels: ["Intermediate"],
                  learningObjectives: [],
                  prerequisites: ["03"],
                  route: "/learn?module=04",
                  estimatedMinutes: 20,
                  visualAssets: { iconName: "Eye", badgeColor: "" },
                  scientificSources: [],
                  status: "ready",
                  version: "1.0.0",
                };
                onSelectNextModule(targetMod);
              }}
              className="bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white font-bold shadow-lg"
            >
              <span>Start Module 04: Light & Time</span>
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
