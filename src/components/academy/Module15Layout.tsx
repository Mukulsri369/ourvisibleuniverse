import React, { useState } from "react";
import type {
  LearningLevel,
  ModuleContract,
  ModuleStatus,
  UserProgress,
} from "@/lib/academy/types";
import {
  MODULE_15_SUBLESSONS,
  MODULE_15_QUIZ,
  MODULE_15_DISCOVERY_FACTS,
  COSMIC_LANDMARKS,
} from "@/lib/academy/lessons/module-15-cosmic-web";
import { CosmicStructureVisualizer3D } from "./CosmicStructureVisualizer3D";
import { CosmicDensityGame } from "./CosmicDensityGame";
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
  Radio,
  Orbit,
  Disc,
  Clock,
  ArrowLeft,
  Award,
  Zap,
  Activity,
  Atom,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitActivityOutcome } from "@/lib/academy/completion.functions";

interface Module15LayoutProps {
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

export function Module15Layout({
  module,
  progress,
  onSetLearningLevel,
  onUpdateModuleProgress,
  onRecordQuiz,
  onBackToMap,
  nextRecommended,
  onSelectNextModule,
}: Module15LayoutProps) {
  const level = progress.selectedLevel;
  const moduleProgress = progress.moduleProgress[module.id];
  const isCompleted = moduleProgress?.status === "completed";

  const [activeTab, setActiveTab] = useState<"visualizer" | "game" | "landmarks">("visualizer");
  const [activeSubLessonIndex, setActiveSubLessonIndex] = useState<number>(0);
  const [selectedLandmarkId, setSelectedLandmarkId] = useState<string>("virgo_cluster");

  const activeSubLesson = MODULE_15_SUBLESSONS[activeSubLessonIndex];
  const activeSubContent = activeSubLesson.content[level];
  const activeLandmark =
    COSMIC_LANDMARKS.find((l) => l.id === selectedLandmarkId) || COSMIC_LANDMARKS[2];

  // Track progress milestones
  const handleSimInteract = () => {
    onUpdateModuleProgress(module.id, 50, "in_progress");
    try {
      void submitActivityOutcome({
        data: {
          moduleId: "15",
          activityId: "act_15_cosmic_web_explorer",
          payload: {
            inspectedNodes: 4,
            structuresVisited: 4,
            success: true,
          },
          isAccessibleAlternative: false,
        },
      });
    } catch (err) {
      console.warn("Could not submit cosmic web telemetry:", err);
    }
  };

  const handleGameComplete = () => {
    onUpdateModuleProgress(module.id, 75, "in_progress");
    try {
      void submitActivityOutcome({
        data: {
          moduleId: "15",
          activityId: "act_15_cosmic_web_explorer",
          payload: {
            inspectedNodes: 4,
            structuresVisited: 4,
            success: true,
          },
          isAccessibleAlternative: false,
        },
      });
    } catch (err) {
      console.warn("Could not submit cosmic web telemetry:", err);
    }
  };

  const handleQuizComplete = (score: number, total: number) => {
    onRecordQuiz("quiz_module_15", score, total);
    // Verified completion is authoritative on the backend.
    onUpdateModuleProgress(module.id, 90, "in_progress");
  };

  return (
    <div className="space-y-12">
      {/* 1. Header & Navigation Back */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <button
            onClick={onBackToMap}
            className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold mb-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="size-3.5" />
            <span>← Back to Cosmic Learning Map</span>
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-3 py-0.5 rounded-full uppercase tracking-wider">
              Stage 04 • Module 15
            </span>
            <span className="text-xs text-slate-400">Cosmic Web Laboratory</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Galaxy Groups, Clusters & Cosmic Web
          </h1>
          <p className="mt-1 text-sm sm:text-base text-slate-300 max-w-2xl">{module.subtitle}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
            <Clock className="size-3.5 text-indigo-400" />
            <span>Estimated: {module.estimatedMinutes} mins</span>
          </div>

          {isCompleted ? (
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl">
              <CheckCircle2 className="size-4" />
              <span>Module Certified!</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-indigo-300 bg-indigo-500/10 border border-indigo-500/30 px-3.5 py-1.5 rounded-xl">
              <ShieldCheck className="size-3.5 text-indigo-400" />
              <span>Verified Track</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Age-Adaptive Learning Level Selector */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
          <Sparkles className="size-3.5" />
          <span>Curriculum Age-Adaptive Level (Classes 1–10)</span>
        </div>
        <LearningLevelSelector currentLevel={level} onSelectLevel={onSetLearningLevel} />
      </section>

      {/* 3. Interactive Laboratory Chamber Selector Tabs */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-900/80 border border-white/10">
          <button
            onClick={() => setActiveTab("visualizer")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "visualizer"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <Orbit className="size-4 text-indigo-300" />
            <span>1. 3D Cosmic Web & Zoom Atlas</span>
          </button>

          <button
            onClick={() => setActiveTab("game")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "game"
                ? "bg-cyan-600 text-white shadow-lg shadow-cyan-600/30"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <Target className="size-4 text-cyan-300" />
            <span>2. Density Mapping Survey Game</span>
          </button>

          <button
            onClick={() => setActiveTab("landmarks")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "landmarks"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <Layers className="size-4 text-purple-300" />
            <span>3. Landmarks & Virial Masses</span>
          </button>
        </div>

        {/* Tab 1: 3D Cosmic Web Simulation */}
        {activeTab === "visualizer" && (
          <CosmicStructureVisualizer3D onInteract={handleSimInteract} />
        )}

        {/* Tab 2: Density Mapping Game */}
        {activeTab === "game" && <CosmicDensityGame onComplete={handleGameComplete} />}

        {/* Tab 3: Landmarks & Virial Masses Matrix */}
        {activeTab === "landmarks" && (
          <div className="rounded-3xl border border-white/10 bg-slate-950 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <h4 className="text-xl font-bold text-white">Large-Scale Cosmological Landmarks</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click any anchor to inspect physical diameters, galaxy counts, and virial
                  equilibrium status
                </p>
              </div>

              {/* Landmark buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                {COSMIC_LANDMARKS.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setSelectedLandmarkId(l.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      selectedLandmarkId === l.id
                        ? "bg-purple-600 text-white font-bold"
                        : "bg-white/5 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    {l.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Landmark detailed view card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-purple-500/20">
              <div className="md:col-span-2 space-y-3">
                <div className="flex items-center gap-2">
                  <h5 className="text-2xl font-extrabold text-white">{activeLandmark.name}</h5>
                  <span
                    className={`text-xs font-mono px-2.5 py-0.5 rounded-full font-bold ${
                      activeLandmark.isGravitationallyBound
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                    }`}
                  >
                    {activeLandmark.isGravitationallyBound
                      ? "Gravitationally Bound"
                      : "NOT Bound (Will Dissolve)"}
                  </span>
                </div>

                <p className="text-sm text-slate-200 leading-relaxed">
                  {activeLandmark.description[level]}
                </p>

                <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 text-purple-200 text-xs">
                  <strong className="text-purple-300 block mb-0.5 font-mono uppercase text-[10px]">
                    Key Science Discovery:
                  </strong>
                  <span>{activeLandmark.keyFact}</span>
                </div>
              </div>

              {/* Landmark Specs Table */}
              <div className="space-y-2 text-xs bg-white/[0.02] border border-white/5 p-4 rounded-xl">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Diameter:</span>
                  <span className="font-mono text-cyan-300 font-bold">
                    {activeLandmark.diameterLy}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Distance:</span>
                  <span className="font-mono text-white">{activeLandmark.distanceLy}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Galaxy Count:</span>
                  <span className="font-mono text-amber-300">{activeLandmark.galaxyCount}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Total Mass:</span>
                  <span className="font-mono text-purple-300">{activeLandmark.totalMassSolar}</span>
                </div>
                <div className="pt-1 border-t border-white/10">
                  <span className="text-slate-400 block text-[10px] uppercase">Survey Source:</span>
                  <span className="font-mono text-[11px] text-slate-300">
                    {activeLandmark.observationalSource}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 4. Seven Comprehensive Sub-Lessons (Curriculum Stream) */}
      <section className="space-y-6 pt-4 border-t border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase font-bold tracking-wider text-indigo-400 block mb-1">
              Curriculum Roadmap • 7 Lessons
            </span>
            <h3 className="text-2xl font-black text-white">The Architecture of the Cosmic Web</h3>
          </div>

          <div className="text-xs text-slate-400 font-mono">
            Lesson {activeSubLesson.order} of {MODULE_15_SUBLESSONS.length}
          </div>
        </div>

        {/* Sub-lesson pill buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {MODULE_15_SUBLESSONS.map((sub, idx) => (
            <button
              key={sub.id}
              onClick={() => setActiveSubLessonIndex(idx)}
              className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                activeSubLessonIndex === idx
                  ? "bg-indigo-600 text-white border-indigo-400 font-bold shadow-md shadow-indigo-900/30"
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
              <span className="text-xs font-mono text-indigo-400 font-semibold block">
                LESSON 0{activeSubLesson.order} • {activeSubLesson.readTimeMinutes} MINUTE DISCOVERY
              </span>
              <h4 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                {activeSubLesson.title}
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">{activeSubLesson.subtitle}</p>
            </div>
          </div>

          {/* Core Concept Banner */}
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 text-sm leading-relaxed">
            <strong className="text-indigo-300 block mb-1 font-mono uppercase text-xs">
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
              <Sparkles className="size-4 text-indigo-400 shrink-0" />
              <span>{activeSubContent.activityPrompt}</span>
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (activeSubLesson.id.includes("void")) setActiveTab("visualizer");
                else if (activeSubLesson.id.includes("formation")) setActiveTab("visualizer");
                else if (activeSubLesson.id.includes("supercluster")) setActiveTab("landmarks");
                else setActiveTab("game");
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
                if (activeSubLessonIndex < MODULE_15_SUBLESSONS.length - 1) {
                  setActiveSubLessonIndex((i) => i + 1);
                }
              }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
            >
              {activeSubLessonIndex < MODULE_15_SUBLESSONS.length - 1
                ? "Next Lesson →"
                : "Proceed to Knowledge Check ↓"}
            </Button>
          </div>
        </div>
      </section>

      {/* 5. Interactive Knowledge Check (Quiz) */}
      <section className="space-y-4 pt-4 border-t border-white/10" id="module-15-quiz">
        <KnowledgeCheck
          quizId="quiz_module_15"
          currentLevel={level}
          questions={MODULE_15_QUIZ}
          onComplete={handleQuizComplete}
        />
      </section>

      {/* 6. Scientific Sources & Discovery Facts */}
      <section className="space-y-4 pt-4 border-t border-white/10">
        <SourceInformationPanel
          sources={module.scientificSources}
          discoveryFacts={MODULE_15_DISCOVERY_FACTS}
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
