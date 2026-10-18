import React, { useState } from "react";
import type {
  LearningLevel,
  ModuleContract,
  ModuleStatus,
  UserProgress,
} from "@/lib/academy/types";
import {
  MODULE_05_LESSON,
  MODULE_05_SUBLESSONS,
  MODULE_05_QUIZ,
  MODULE_05_SOURCES,
} from "@/lib/academy/lessons/module-05-earth-moon";
import { SunEarthMoonSimulation3D } from "./SunEarthMoonSimulation3D";
import { EarthMoonExperimentsLab } from "./EarthMoonExperimentsLab";
import { LunarPhasePredictionChallenge } from "./LunarPhasePredictionChallenge";
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
  Moon,
  Sun,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Module05LayoutProps {
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

export function Module05Layout({
  module,
  progress,
  onSetLearningLevel,
  onUpdateModuleProgress,
  onRecordQuiz,
  onBackToMap,
  nextRecommended,
  onSelectNextModule,
}: Module05LayoutProps) {
  const currentLevel = progress.selectedLevel;
  const gradeContent = MODULE_05_LESSON.gradeLevelContent[currentLevel];

  const [selectedSubLessonIndex, setSelectedSubLessonIndex] = useState(0);
  const [hasTestedSimulation, setHasTestedSimulation] = useState(false);
  const [testedExperiments, setTestedExperiments] = useState<string[]>([]);
  const [challengeCompleted, setChallengeCompleted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  const activeSubLesson = MODULE_05_SUBLESSONS[selectedSubLessonIndex];
  const subLessonContent = activeSubLesson.content[currentLevel];

  const handleFinishQuiz = (score: number, total: number) => {
    setQuizFinished(true);
    onRecordQuiz("quiz_module_05", score, total);
    // Record learning progress without bypassing authoritative validation
    onUpdateModuleProgress("05", 90, "in_progress");
  };

  const handleExperimentCompleted = (expId: string) => {
    if (!testedExperiments.includes(expId)) {
      const updated = [...testedExperiments, expId];
      setTestedExperiments(updated);
      onUpdateModuleProgress("05", Math.min(85, 30 + updated.length * 10), "in_progress");
    }
  };

  const handleChallengeCompleted = () => {
    setChallengeCompleted(true);
    onUpdateModuleProgress("05", 85, "in_progress");
  };

  const handleSimulationTested = () => {
    setHasTestedSimulation(true);
    onUpdateModuleProgress("05", 40, "in_progress");
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
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full uppercase">
              Stage 02 • Module 05
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
            Earth, Moon & Eclipses
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

      {/* 2. Signature 3D Experience: Interactive Sun-Earth-Moon Simulation */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/10">
          <div>
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              Signature 3D Experience
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
              Sun–Earth–Moon Three-Body Orbital Engine
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

        <SunEarthMoonSimulation3D onTestedSimulation={handleSimulationTested} />
      </section>

      {/* 3. The 7 Progressive Lessons */}
      <section className="space-y-6">
        <div className="border-b border-white/10 pb-3">
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
            Curriculum Core
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
            7 Lessons on Earth, Moon & Gravitational Choreography
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Click through each lesson to master Earth&apos;s axial tilt, seasonal solstices, lunar
            phase geometry, and eclipses.
          </p>
        </div>

        {/* Lesson Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {MODULE_05_SUBLESSONS.map((sub, idx) => {
            const isSelected = idx === selectedSubLessonIndex;
            return (
              <button
                key={sub.id}
                onClick={() => setSelectedSubLessonIndex(idx)}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 ${
                  isSelected
                    ? "bg-amber-500/20 border-amber-400 text-white shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/50"
                    : "bg-white/[0.02] border-white/5 text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-amber-400">
                    Lesson {sub.number}
                  </span>
                  {isSelected && <Zap className="size-3 text-amber-400" />}
                </div>
                <span className="text-xs font-bold text-white line-clamp-2">{sub.title}</span>
              </button>
            );
          })}
        </div>

        {/* Active Lesson Content Showcase Card */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-md p-6 sm:p-8 space-y-6">
          <div className="border-b border-white/10 pb-4">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
              Lesson {activeSubLesson.number} of 7
            </span>
            <h3 className="text-2xl font-extrabold text-white mt-1">{activeSubLesson.title}</h3>
            <p className="text-xs sm:text-sm text-amber-300 font-mono mt-0.5">
              {activeSubLesson.subtitle}
            </p>
          </div>

          {/* Core Lesson Summary */}
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30">
            <span className="text-[10px] font-mono uppercase font-bold text-amber-400 block mb-1">
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
              <span className="text-[10px] font-mono uppercase font-bold text-cyan-400 block">
                {currentLevel === "astronomer" ? "Quantitative Physics Law:" : "Everyday Analogy:"}
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

      {/* 4. Interactive Astrodynamics Experiments Lab */}
      <section className="space-y-4">
        <EarthMoonExperimentsLab onCompletedExperiment={handleExperimentCompleted} />
      </section>

      {/* 5. Guided Challenge: Eclipse Hunter & Lunar Phase Challenge */}
      <section className="space-y-4">
        <LunarPhasePredictionChallenge onCompleteChallenge={handleChallengeCompleted} />
      </section>

      {/* 6. Science Knowledge Check Quiz */}
      <section className="space-y-4">
        <KnowledgeCheck
          quizId="quiz_module_05"
          questions={gradeContent.quizQuestions}
          onCompleteQuiz={handleFinishQuiz}
        />
      </section>

      {/* 7. Primary Scientific Sources & Discovery Facts */}
      <section className="space-y-4">
        <SourceInformationPanel sources={MODULE_05_SOURCES} funFacts={gradeContent.funFacts} />
      </section>

      {/* 8. Lesson Mastery & Progress Recording */}
      <section>
        <ModuleNavigation
          currentModule={module}
          isCompleted={progress.moduleProgress[module.id]?.status === "completed"}
          nextRecommended={{
            module: {
              id: "06",
              slug: "explore-the-solar-system",
              number: 6,
              title: "Explore the Solar System",
              subtitle: "From rocky infernos to gas giants and icy dwarf planets",
              description:
                "Tour the 8 major planets, asteroid belt, Kuiper belt, and distant icy comets orbiting our central star.",
              stageId: 2,
              recommendedOrder: 6,
              difficultyLevels: ["Beginner", "Intermediate"],
              learningObjectives: [],
              prerequisites: ["05"],
              route: "/learn?module=06",
              estimatedMinutes: 25,
              visualAssets: { iconName: "Orbit", badgeColor: "" },
              scientificSources: [],
              status: "coming_soon",
              version: "0.9.0",
            },
            reason:
              "Now that you understand our home world and Moon, venture outward to explore the 8 major planets, gas giants, asteroid belt, and Kuiper belt!",
          }}
          onSelectNextModule={onSelectNextModule}
          onBackToMap={onBackToMap}
        />
      </section>

      {/* 9. Next Recommended Stage Banner: Module 06 Explore the Solar System */}
      <section className="rounded-3xl border border-amber-500/40 bg-gradient-to-r from-amber-950/50 via-slate-900/80 to-orange-950/50 p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
              <span>Next Recommended Milestone</span>
              <span>•</span>
              <span>Stage 2: Our Cosmic Neighborhood</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Stage 2, Module 06: Explore the Solar System
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Venture beyond Earth and the Moon into the wider solar system! Tour the rocky
              terrestrial worlds, the gas giants Jupiter and Saturn, icy ice giants Uranus and
              Neptune, and the frozen frontiers of the Kuiper Belt.
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
                  onSelectNextModule({
                    id: "06",
                    slug: "explore-the-solar-system",
                    number: 6,
                    title: "Explore the Solar System",
                    subtitle: "From rocky infernos to gas giants and icy dwarf planets",
                    description:
                      "Tour the 8 major planets, asteroid belt, Kuiper belt, and distant icy comets orbiting our central star.",
                    stageId: 2,
                    recommendedOrder: 6,
                    difficultyLevels: ["Beginner", "Intermediate"],
                    learningObjectives: [],
                    prerequisites: ["05"],
                    route: "/learn?module=06",
                    estimatedMinutes: 25,
                    visualAssets: { iconName: "Orbit", badgeColor: "" },
                    scientificSources: [],
                    status: "coming_soon",
                    version: "0.9.0",
                  });
                } else {
                  onBackToMap();
                }
              }}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold px-6 shadow-lg shadow-amber-500/25"
            >
              <span>Explore the Solar System</span>
              <ArrowRight className="size-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
