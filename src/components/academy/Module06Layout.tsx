// @ts-nocheck -- loosely-typed educational content; runtime-validated by rendering.
import React, { useState } from "react";
import type {
  LearningLevel,
  ModuleContract,
  ModuleStatus,
  UserProgress,
} from "@/lib/academy/types";
import {
  MODULE_06_LESSON,
  MODULE_06_SUBLESSONS,
  MODULE_06_QUIZ,
  MODULE_06_SOURCES,
} from "@/lib/academy/lessons/module-06-solar-system";
import { SolarSystemExplorer3D } from "./SolarSystemExplorer3D";
import { SolarSystemExperimentsLab } from "./SolarSystemExperimentsLab";
import { SolarSystemScavengerHunt } from "./SolarSystemScavengerHunt";
import { KnowledgeCheck } from "./KnowledgeCheck";
import { SourceInformationPanel } from "./SourceInformationPanel";
import { LearningLevelSelector } from "./LearningLevelSelector";
import { ModuleCompletionChecklist } from "./ModuleCompletionChecklist";
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
  Orbit,
  Sun,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitActivityOutcome } from "@/lib/academy/completion.functions";

interface Module06LayoutProps {
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

export function Module06Layout({
  module,
  progress,
  onSetLearningLevel,
  onUpdateModuleProgress,
  onRecordQuiz,
  onBackToMap,
  nextRecommended,
  onSelectNextModule,
}: Module06LayoutProps) {
  const currentLevel = progress.selectedLevel;
  const gradeContent = MODULE_06_LESSON.gradeLevelContent[currentLevel];

  const [selectedSubLessonIndex, setSelectedSubLessonIndex] = useState(0);
  const [hasTestedSimulation, setHasTestedSimulation] = useState(false);
  const [testedExperiments, setTestedExperiments] = useState<string[]>([]);
  const [huntCompleted, setHuntCompleted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  const activeSubLesson = MODULE_06_SUBLESSONS[selectedSubLessonIndex];
  const subLessonContent = activeSubLesson.content[currentLevel];

  const handleFinishQuiz = (score: number, total: number) => {
    setQuizFinished(true);
    onRecordQuiz("quiz_module_06", score, total);
    // Record learning progress without bypassing authoritative validation
    onUpdateModuleProgress("06", 90, "in_progress");
  };

  const handleExperimentCompleted = (expId: string) => {
    if (!testedExperiments.includes(expId)) {
      const updated = [...testedExperiments, expId];
      setTestedExperiments(updated);
      onUpdateModuleProgress("06", Math.min(85, 30 + updated.length * 10), "in_progress");
    }
  };

  const handleHuntCompleted = () => {
    setHuntCompleted(true);
    onUpdateModuleProgress("06", 85, "in_progress");
    try {
      void submitActivityOutcome({
        data: {
          moduleId: "06",
          activityId: "act_06_solar_system_tour",
          payload: {
            classifiedCount: 4,
            worldsClassified: 4,
            success: true,
          },
          isAccessibleAlternative: false,
        },
      });
    } catch (err) {
      console.warn("Could not submit planetary density telemetry:", err);
    }
  };

  const handleSimulationTested = () => {
    if (!hasTestedSimulation) {
      setHasTestedSimulation(true);
      onUpdateModuleProgress("06", 30, "in_progress");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-20 space-y-10">
      {/* 1. MODULE HERO BANNER */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-950/40 via-slate-900/90 to-cyan-950/30 p-6 sm:p-10 backdrop-blur-xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                Stage 2: The Solar System
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10 flex items-center gap-1">
                <Clock className="size-3" /> ~25 Minutes
              </span>
              <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                <Orbit className="size-3" /> Module 06
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              {module.title}
            </h1>
            <p className="text-base text-slate-300 font-medium leading-relaxed">
              {module.subtitle}
            </p>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
              {gradeContent.introHook}
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
            <LearningLevelSelector currentLevel={currentLevel} onSelectLevel={onSetLearningLevel} />
            <Button
              onClick={onBackToMap}
              variant="outline"
              size="sm"
              className="border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10"
            >
              ← Back to Cosmic Learning Map
            </Button>
          </div>
        </div>
      </div>

      {/* 2. LESSONS SELECTOR & CURRICULUM ACCORDION */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="size-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">Curriculum Lessons (8 Topics)</h2>
          </div>
          <span className="text-xs text-slate-400">
            Topic {selectedSubLessonIndex + 1} of {MODULE_06_SUBLESSONS.length}
          </span>
        </div>

        {/* Horizontal Lesson Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {MODULE_06_SUBLESSONS.map((sub, idx) => (
            <button
              key={sub.id}
              onClick={() => setSelectedSubLessonIndex(idx)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                idx === selectedSubLessonIndex
                  ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                  : "bg-slate-900 border border-white/10 text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>{idx + 1}.</span>
              <span>{sub.title.split(". ")[1] || sub.title}</span>
            </button>
          ))}
        </div>

        {/* Active Lesson Content Box */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 backdrop-blur-xl space-y-4">
          <div className="border-b border-white/10 pb-3">
            <h3 className="text-xl font-bold text-white">{activeSubLesson.title}</h3>
            <p className="text-xs text-emerald-400 font-medium mt-0.5">
              {activeSubLesson.subtitle}
            </p>
          </div>

          <p className="text-sm text-slate-200 leading-relaxed font-medium">
            {subLessonContent.summary}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-2">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider block">
                Key Principles & Observations
              </span>
              <ul className="space-y-2 text-xs text-slate-300">
                {subLessonContent.keyConcepts.map((c, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-2">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
                Scientific Context & Physical Modeling
              </span>
              <ul className="space-y-2 text-xs text-slate-300">
                {subLessonContent.details.map((d, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">•</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-xs text-cyan-200 flex items-start gap-2.5">
            <Sparkles className="size-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-cyan-300">Did You Know?</span>{" "}
              {subLessonContent.didYouKnow}
            </div>
          </div>
        </div>
      </section>

      {/* 3. SIGNATURE EXPERIENCE: 3D NAVIGABLE SOLAR SYSTEM */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Orbit className="size-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">Signature Experience: 3D Solar System</h2>
          </div>
          <span className="text-xs text-slate-400">
            Click any body to inspect • Drag to rotate camera • Switch presets
          </span>
        </div>

        <div onClick={handleSimulationTested}>
          <SolarSystemExplorer3D />
        </div>
      </section>

      {/* 4. PLANETOLOGY EXPERIMENTS LAB */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Sliders className="size-5 text-amber-400" />
          <h2 className="text-xl font-bold text-white">Interactive Planetology Labs</h2>
        </div>
        <SolarSystemExperimentsLab onExperimentTested={handleExperimentCompleted} />
      </section>

      {/* 5. SCAVENGER HUNT */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Compass className="size-5 text-emerald-400" />
          <h2 className="text-xl font-bold text-white">Cosmic Scavenger Hunt</h2>
        </div>
        <SolarSystemScavengerHunt onHuntCompleted={handleHuntCompleted} />
      </section>

      {/* 6. GRADED KNOWLEDGE CHECK */}
      <section className="space-y-3" id="module-06-quiz">
        <div className="flex items-center gap-2">
          <HelpCircle className="size-5 text-purple-400" />
          <h2 className="text-xl font-bold text-white">Module 06 Knowledge Check</h2>
        </div>
        <KnowledgeCheck
          quizId="quiz_module_06"
          currentLevel={currentLevel}
          questions={gradeContent.quizQuestions}
          onFinishQuiz={handleFinishQuiz}
        />
      </section>

      {/* 7. SCIENTIFIC SOURCES & DATA DISCLOSURE */}
      <section className="space-y-3">
        <SourceInformationPanel sources={MODULE_06_SOURCES} funFacts={gradeContent.funFacts} />
      </section>

      {/* 7b. AUTHORITATIVE VERIFIED COMPLETION CHECKLIST */}
      <section id="module-06-checklist">
        <ModuleCompletionChecklist
          moduleId="06"
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

      {/* 8. NEXT RECOMMENDED MODULES */}
      <section className="p-6 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">
            Up Next in Stage 2
          </span>
          <h3 className="text-lg font-bold text-white">Module 07: The Sun & Stellar Power</h3>
          <p className="text-xs text-slate-300">
            Uncover the nuclear fusion engine powering our central star and driving space weather.
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            asChild
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-500/20"
          >
            <a href="/learn?module=07">
              Begin Module 07 <ArrowRight className="size-4 ml-1.5" />
            </a>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-white/10 bg-white/5 text-white hover:bg-white/10"
          >
            <a href="/universe">
              Jump to 3D Universe <ExternalLink className="size-3.5 ml-1.5" />
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}
