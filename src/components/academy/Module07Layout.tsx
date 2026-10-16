// @ts-nocheck -- loosely-typed educational content; runtime-validated by rendering.
import React, { useState } from "react";
import type {
  LearningLevel,
  ModuleContract,
  ModuleStatus,
  UserProgress,
} from "@/lib/academy/types";
import {
  MODULE_07_LESSON,
  MODULE_07_SUBLESSONS,
  MODULE_07_SOURCES,
  SOURCED_SOLAR_PARAMETERS,
} from "@/lib/academy/lessons/module-07-the-sun";
import { SunSimulator3D } from "./SunSimulator3D";
import { SpaceWeatherActivity } from "./SpaceWeatherActivity";
import { KnowledgeCheck } from "./KnowledgeCheck";
import { SourceInformationPanel } from "./SourceInformationPanel";
import { LearningLevelSelector } from "./LearningLevelSelector";
import {
  Sun,
  Layers,
  Zap,
  Activity,
  Flame,
  Shield,
  BookOpen,
  Clock,
  Sparkles,
  ExternalLink,
  ArrowRight,
  Info,
  Table,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Module07LayoutProps {
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

export function Module07Layout({
  module,
  progress,
  onSetLearningLevel,
  onUpdateModuleProgress,
  onRecordQuiz,
  onBackToMap,
  nextRecommended,
  onSelectNextModule,
}: Module07LayoutProps) {
  const currentLevel = progress.selectedLevel;
  const gradeContent = MODULE_07_LESSON.gradeLevelContent[currentLevel];

  const [selectedSubLessonIndex, setSelectedSubLessonIndex] = useState(0);
  const [hasTestedSimulation, setHasTestedSimulation] = useState(false);
  const [activityCompleted, setActivityCompleted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [showFullParamTable, setShowFullParamTable] = useState(false);

  const activeSubLesson = MODULE_07_SUBLESSONS[selectedSubLessonIndex];
  const subLessonContent = activeSubLesson.content[currentLevel];

  const handleFinishQuiz = (score: number, total: number) => {
    setQuizFinished(true);
    onRecordQuiz("quiz_module_07", score, total);
    // Mark module complete
    onUpdateModuleProgress("07", 100, "completed");
  };

  const handleSimulationInteracted = () => {
    if (!hasTestedSimulation) {
      setHasTestedSimulation(true);
      onUpdateModuleProgress("07", 40, "in_progress");
    }
  };

  const handleActivityCompleted = () => {
    setActivityCompleted(true);
    onUpdateModuleProgress("07", 85, "in_progress");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-20 space-y-10">
      {/* 1. MODULE HERO BANNER */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-amber-950/40 via-slate-900/90 to-red-950/30 p-6 sm:p-10 backdrop-blur-xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                Stage 2: The Solar System
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10 flex items-center gap-1">
                <Clock className="size-3" /> ~20 Minutes
              </span>
              <span className="px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-300 border border-yellow-500/30 flex items-center gap-1">
                <Sun className="size-3" /> Module 07
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
            <BookOpen className="size-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white">Curriculum Lessons (7 Topics)</h2>
          </div>
          <span className="text-xs text-slate-400">
            Topic {selectedSubLessonIndex + 1} of {MODULE_07_SUBLESSONS.length}
          </span>
        </div>

        {/* Horizontal Lesson Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {MODULE_07_SUBLESSONS.map((sub, idx) => (
            <button
              key={sub.id}
              onClick={() => setSelectedSubLessonIndex(idx)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                idx === selectedSubLessonIndex
                  ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
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
            <p className="text-xs text-amber-400 font-medium mt-0.5">{activeSubLesson.subtitle}</p>
          </div>

          <p className="text-sm text-slate-200 leading-relaxed font-medium">
            {subLessonContent.summary}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-2">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
                Key Principles & Observations
              </span>
              <ul className="space-y-2 text-xs text-slate-300">
                {subLessonContent.keyConcepts.map((c, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">•</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-2">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider block">
                Astrophysical Mechanics & Equations
              </span>
              <ul className="space-y-2 text-xs text-slate-300">
                {subLessonContent.details.map((d, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-cyan-400 mt-0.5">•</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-2.5">
            <Sparkles className="size-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-amber-300">Did You Know?</span>{" "}
              {subLessonContent.didYouKnow}
            </div>
          </div>
        </div>
      </section>

      {/* 3. SIGNATURE EXPERIENCE: 3D SUN SIMULATOR */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sun className="size-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white">Signature Experience: 3D Sun Simulator</h2>
          </div>
          <span className="text-xs text-slate-400">
            Cutaway slice • Fusion particle chamber • Magnetic field lines • Solar wind shield
          </span>
        </div>

        <div onClick={handleSimulationInteracted}>
          <SunSimulator3D />
        </div>
      </section>

      {/* 4. SATELLITE SPACE-WEATHER ACTIVITY */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="size-5 text-red-400" />
          <h2 className="text-xl font-bold text-white">Interactive Space Weather Challenge</h2>
        </div>
        <SpaceWeatherActivity onActivityCompleted={handleActivityCompleted} />
      </section>

      {/* 5. SOURCED SOLAR PARAMETERS REFERENCE TABLE */}
      <section className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Table className="size-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">
              Sourced Solar Parameters & Earth Ratios
            </h3>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowFullParamTable((prev) => !prev)}
            className="border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 text-xs"
          >
            {showFullParamTable ? "Show Key Parameters" : "Show All 10 Parameters"}
          </Button>
        </div>

        <p className="text-xs text-slate-400">
          Measurements sourced from NASA Solar Dynamics Observatory, SORCE, and Standard Solar Model
          (BS2005).
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-semibold">
                <th className="py-2.5 px-3">Parameter</th>
                <th className="py-2.5 px-3">Measured Value</th>
                <th className="py-2.5 px-3">Earth Ratio / Equivalent</th>
                <th className="py-2.5 px-3 hidden sm:table-cell">Source Authority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              {(showFullParamTable
                ? SOURCED_SOLAR_PARAMETERS
                : SOURCED_SOLAR_PARAMETERS.slice(0, 6)
              ).map((param, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition-colors">
                  <td className="py-2.5 px-3 text-white font-semibold">{param.label}</td>
                  <td className="py-2.5 px-3 font-mono text-amber-300 font-bold">{param.value}</td>
                  <td className="py-2.5 px-3 text-cyan-200">{param.earthRatio}</td>
                  <td className="py-2.5 px-3 text-slate-400 hidden sm:table-cell text-[11px]">
                    {param.source}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 6. GRADED KNOWLEDGE CHECK */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Activity className="size-5 text-purple-400" />
          <h2 className="text-xl font-bold text-white">Module 07 Knowledge Check</h2>
        </div>
        <KnowledgeCheck
          questions={gradeContent.quizQuestions}
          onFinishQuiz={handleFinishQuiz}
          level={currentLevel}
        />
      </section>

      {/* 7. SCIENTIFIC SOURCES & DATA DISCLOSURE */}
      <section className="space-y-3">
        <SourceInformationPanel sources={MODULE_07_SOURCES} funFacts={gradeContent.funFacts} />
      </section>

      {/* 8. NEXT RECOMMENDED MODULES */}
      <section className="p-6 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
            Up Next in Stage 2
          </span>
          <h3 className="text-lg font-bold text-white">Module 08: Gravity, Orbits & Motion</h3>
          <p className="text-xs text-slate-300">
            Discover Kepler's laws, Newton's gravitational mechanics, and how spacecraft use gravity
            assists.
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            asChild
            className="bg-amber-600 hover:bg-amber-500 text-white font-semibold shadow-lg shadow-amber-500/20"
          >
            <a href="/learn?module=08">
              Start Module 08 <ArrowRight className="size-4 ml-1.5" />
            </a>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-white/10 bg-white/5 text-white hover:bg-white/10"
          >
            <a href="/universe">
              Explore 3D Universe <ExternalLink className="size-3.5 ml-1.5" />
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}
