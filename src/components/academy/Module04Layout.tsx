// @ts-nocheck -- loosely-typed educational content; runtime-validated by rendering.
import React, { useState } from "react";
import type {
  LearningLevel,
  ModuleContract,
  ModuleStatus,
  UserProgress,
} from "@/lib/academy/types";
import {
  MODULE_04_LESSON,
  MODULE_04_SUBLESSONS,
  MODULE_04_QUIZ,
  MODULE_04_SOURCES,
} from "@/lib/academy/lessons/module-04-light-time";
import { LightTravelSimulation3D } from "./LightTravelSimulation3D";
import { LightExperimentsLab } from "./LightExperimentsLab";
import { HowFarIntoThePastChallenge } from "./HowFarIntoThePastChallenge";
import { KnowledgeCheck } from "./KnowledgeCheck";
import { SourceInformationPanel } from "./SourceInformationPanel";
import { LearningLevelSelector } from "./LearningLevelSelector";
import { ModuleNavigation } from "./ModuleNavigation";
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
  Zap,
  Trophy,
  Activity,
  Sliders,
  Atom,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Module04LayoutProps {
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

export function Module04Layout({
  module,
  progress,
  onSetLearningLevel,
  onUpdateModuleProgress,
  onRecordQuiz,
  onBackToMap,
  nextRecommended,
  onSelectNextModule,
}: Module04LayoutProps) {
  const currentLevel = progress.selectedLevel;
  const gradeContent = MODULE_04_LESSON.gradeLevelContent[currentLevel];

  const [selectedSubLessonIndex, setSelectedSubLessonIndex] = useState(0);
  const [hasTestedSimulation, setHasTestedSimulation] = useState(false);
  const [testedExperiments, setTestedExperiments] = useState<string[]>([]);
  const [challengeCompleted, setChallengeCompleted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  const activeSubLesson = MODULE_04_SUBLESSONS[selectedSubLessonIndex];
  const subLessonContent = activeSubLesson.content[currentLevel];

  const handleFinishQuiz = (score: number, total: number) => {
    setQuizFinished(true);
    onRecordQuiz("quiz_module_04", score, total);
    // Record learning progress without bypassing authoritative validation
    onUpdateModuleProgress("04", 90, "in_progress");
  };

  const handleExperimentCompleted = (expId: string) => {
    if (!testedExperiments.includes(expId)) {
      const updated = [...testedExperiments, expId];
      setTestedExperiments(updated);
      onUpdateModuleProgress("04", Math.min(85, 30 + updated.length * 10), "in_progress");
    }
  };

  const handleChallengeCompleted = () => {
    setChallengeCompleted(true);
    onUpdateModuleProgress("04", 85, "in_progress");
  };

  const handleSimulationTested = () => {
    setHasTestedSimulation(true);
    onUpdateModuleProgress("04", 40, "in_progress");
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
            <span className="text-xs font-mono font-bold text-violet-400 bg-violet-500/10 border border-violet-500/30 px-2.5 py-0.5 rounded-full uppercase">
              Stage 01 • Module 04
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="size-3 text-cyan-400" />
              20 Minutes
            </span>
          </div>
        </div>

        <div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Light, Time & Cosmic Observation
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

      {/* 2. Signature 3D Experience: Interactive Light-Travel Simulation */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/10">
          <div>
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              Signature 3D Experience
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
              Interactive 3D Light-Travel Engine
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {hasTestedSimulation && (
              <span className="inline-flex items-center gap-1 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                <CheckCircle2 className="size-3.5" />
                <span>Simulation Active</span>
              </span>
            )}
          </div>
        </div>

        <LightTravelSimulation3D onTestedSimulation={handleSimulationTested} />
      </section>

      {/* 3. The 6 Progressive Lessons */}
      <section className="space-y-6">
        <div className="border-b border-white/10 pb-3">
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
            Curriculum Core
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
            6 Lessons on Light & Spacetime
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Click through each lesson to build deep physical understanding from the wave equation to
            astronomical spectroscopy.
          </p>
        </div>

        {/* Lesson Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {MODULE_04_SUBLESSONS.map((sub, idx) => {
            const isSelected = idx === selectedSubLessonIndex;
            return (
              <button
                key={sub.id}
                onClick={() => setSelectedSubLessonIndex(idx)}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 ${
                  isSelected
                    ? "bg-cyan-500/20 border-cyan-400 text-white shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-400/50"
                    : "bg-white/[0.02] border-white/5 text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-cyan-400">
                    Lesson {sub.number}
                  </span>
                  {isSelected && <Zap className="size-3 text-cyan-400" />}
                </div>
                <span className="text-xs font-bold text-white line-clamp-2">{sub.title}</span>
              </button>
            );
          })}
        </div>

        {/* Active Lesson Content Showcase Card */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-md p-6 sm:p-8 space-y-6">
          <div className="border-b border-white/10 pb-4">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              Lesson {activeSubLesson.number} of 6
            </span>
            <h3 className="text-2xl font-extrabold text-white mt-1">{activeSubLesson.title}</h3>
            <p className="text-xs sm:text-sm text-cyan-300 font-mono mt-0.5">
              {activeSubLesson.subtitle}
            </p>
          </div>

          {/* Core Lesson Summary */}
          <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30">
            <span className="text-[10px] font-mono uppercase font-bold text-cyan-400 block mb-1">
              Core Insight:
            </span>
            <p className="text-sm sm:text-base text-slate-100 font-medium leading-relaxed">
              {subLessonContent.summary}
            </p>
          </div>

          {/* Deep Dive & Scientific Explanation */}
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase font-bold text-slate-400 block">
              Scientific Deep Dive:
            </span>
            <p className="text-sm text-slate-300 leading-relaxed">{subLessonContent.deepDive}</p>
          </div>

          {/* Key Takeaway & Math / Analogy Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 block">
                Key Takeaway:
              </span>
              <p className="text-xs sm:text-sm text-slate-200">{subLessonContent.takeaway}</p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-amber-400 block">
                {currentLevel === "astronomer"
                  ? "Physics Formula / Quantitative Law:"
                  : "Intuitive Analogy:"}
              </span>
              <p className="text-xs sm:text-sm text-slate-200 font-mono">
                {subLessonContent.mathOrAnalogy}
              </p>
            </div>
          </div>

          {/* Did You Know? Callout */}
          <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20 flex items-start gap-3">
            <Sparkles className="size-5 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-purple-300 block mb-0.5">Did You Know?</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {subLessonContent.didYouKnow}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Interactive Optics & Astrophysics Experiments Lab */}
      <section className="space-y-4">
        <LightExperimentsLab onCompletedExperiment={handleExperimentCompleted} />
      </section>

      {/* 5. "How Far Into the Past?" Interactive Challenge */}
      <section className="space-y-4">
        <HowFarIntoThePastChallenge onCompleteChallenge={handleChallengeCompleted} />
      </section>

      {/* 6. Step F: Science Knowledge Check */}
      <section className="space-y-4">
        <KnowledgeCheck
          quizId="quiz_module_04"
          questions={gradeContent.quizQuestions}
          onCompleteQuiz={handleFinishQuiz}
        />
      </section>

      {/* 7. Step G: Discovery Facts & Scientific Citations */}
      <section className="space-y-4">
        <SourceInformationPanel sources={MODULE_04_SOURCES} funFacts={gradeContent.funFacts} />
      </section>

      {/* 8. Step H: Lesson Mastery & Next Horizon */}
      <section>
        <ModuleNavigation
          currentModule={module}
          isCompleted={progress.moduleProgress[module.id]?.status === "completed"}
          nextRecommended={
            nextRecommended || {
              module: {
                id: "05",
                slug: "earth-moon-and-eclipses",
                number: 5,
                title: "Earth, Moon & Eclipses",
                subtitle: "Orbital choreography of our home world and satellite",
                description:
                  "Explore lunar phases, tidal locking, and the rare geometry that produces solar and lunar eclipses.",
                stageId: 2,
                recommendedOrder: 5,
                difficultyLevels: ["Beginner"],
                learningObjectives: [],
                prerequisites: ["01"],
                route: "/learn?module=05",
                estimatedMinutes: 18,
                status: "ready",
                version: "1.0.0",
              },
              reason:
                "Now that you understand light and observation, explore the orbital choreography of Earth and the Moon, lunar phases, and eclipses.",
            }
          }
          onSelectNextModule={onSelectNextModule}
          onBackToMap={onBackToMap}
        />
      </section>

      {/* 9. Next Recommended Stage Banner: Earth, Moon & Eclipses */}
      <section className="rounded-3xl border border-cyan-500/40 bg-gradient-to-r from-cyan-950/50 via-slate-900/80 to-blue-950/50 p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              <span>Next Recommended Learning Stage</span>
              <span>•</span>
              <span>Stage 2: Our Cosmic Neighborhood</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Stage 2, Module 05: Earth, Moon & Eclipses
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Now that you understand the speed of light and astronomical observation, explore the
              orbital choreography of our home world, lunar phases, and the geometry of solar and
              lunar eclipses!
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-3">
            <Button
              onClick={onBackToMap}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              Curriculum Map
            </Button>
            <Button
              onClick={() => {
                if (onSelectNextModule) {
                  // Direct to module 05
                  onSelectNextModule({
                    id: "05",
                    slug: "earth-moon-and-eclipses",
                    number: 5,
                    title: "Earth, Moon & Eclipses",
                    subtitle: "Orbital choreography of our home world and satellite",
                    description:
                      "Explore lunar phases, tidal locking, and the rare geometry that produces solar and lunar eclipses.",
                    stageId: 2,
                    recommendedOrder: 5,
                    difficultyLevels: ["Beginner"],
                    learningObjectives: [],
                    prerequisites: ["01"],
                    route: "/learn?module=05",
                    status: "ready",
                    version: "1.0.0",
                  });
                } else {
                  onBackToMap();
                }
              }}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-6 shadow-lg shadow-cyan-500/25"
            >
              <span>Explore Earth, Moon & Eclipses</span>
              <ArrowRight className="size-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
