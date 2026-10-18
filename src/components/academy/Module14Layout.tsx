import React, { useState, useEffect } from "react";
import { LearningPreferenceManager } from "@/lib/cosmos/LearningPreferenceManager";
import type {
  LearningLevel,
  ModuleContract,
  ModuleStatus,
  UserProgress,
} from "@/lib/academy/types";
import {
  MODULE_14_SUBLESSONS,
  MODULE_14_QUIZ,
  MODULE_14_DISCOVERY_FACTS,
} from "@/lib/academy/lessons/module-14-black-holes";
import { BlackHoleVisualizer3D } from "./BlackHoleVisualizer3D";
import { PulsarSimulator } from "./PulsarSimulator";
import { GravitationalWaveChirpLab } from "./GravitationalWaveChirpLab";
import { CompactObjectComparisonTable } from "./CompactObjectComparisonTable";
import { KnowledgeCheck } from "./KnowledgeCheck";
import { ModuleCompletionChecklist } from "./ModuleCompletionChecklist";
import { SourceInformationPanel } from "./SourceInformationPanel";
import { LearningLevelSelector } from "./LearningLevelSelector";
import { CosmosCompanion } from "./CosmosCompanion";
import {
  BookOpen,
  CheckCircle2,
  Sparkles,
  Layers,
  HelpCircle,
  Compass,
  ArrowRight,
  ChevronRight,
  Flame,
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitActivityOutcome } from "@/lib/academy/completion.functions";

interface Module14LayoutProps {
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

export function Module14Layout({
  module,
  progress,
  onSetLearningLevel,
  onUpdateModuleProgress,
  onRecordQuiz,
  onBackToMap,
  nextRecommended,
  onSelectNextModule,
}: Module14LayoutProps) {
  const level = progress.selectedLevel;
  const moduleProgress = progress.moduleProgress[module.id];
  const isCompleted = moduleProgress?.status === "completed";

  const [activeTab, setActiveTab] = useState<"visualizer" | "comparison" | "pulsar" | "gw">(
    "visualizer",
  );
  const [activeSubLessonIndex, setActiveSubLessonIndex] = useState<number>(0);

  const activeSubLesson = MODULE_14_SUBLESSONS[activeSubLessonIndex];
  const activeSubContent = activeSubLesson.content[level];

  // Text Synchronization with COSMOS Voice Narration
  const [activeNarrationSection, setActiveNarrationSection] = useState<string | null>(null);

  useEffect(() => {
    let lastUserScroll = 0;
    const onScroll = () => {
      lastUserScroll = Date.now();
    };
    window.addEventListener("wheel", onScroll, { passive: true });
    window.addEventListener("touchmove", onScroll, { passive: true });

    const handleSync = (e: any) => {
      const detail = e.detail;
      if (detail && detail.moduleId === "14") {
        setActiveNarrationSection(detail.sectionId);

        // Sync active sublesson tab if narration advances to another sublesson
        if (detail.lessonId) {
          const matchIdx = MODULE_14_SUBLESSONS.findIndex((s) => s.id === detail.lessonId);
          if (matchIdx !== -1) {
            setActiveSubLessonIndex(matchIdx);
          }
        }

        // Auto-scroll gently when enabled and not recently scrolled by student
        const prefs = LearningPreferenceManager.getPreferences();
        const hasRecentUserScroll = Date.now() - lastUserScroll < 5000;
        if (prefs.autoScrollEnabled && !hasRecentUserScroll && typeof document !== "undefined") {
          const el = document.getElementById(`m14-sec-${detail.sectionId}`);
          if (el) {
            const rect = el.getBoundingClientRect();
            const inView = rect.top >= 80 && rect.bottom <= window.innerHeight - 80;
            if (!inView) {
              el.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }
          }
        }
      }
    };

    window.addEventListener("cosmos:narration-sync" as any, handleSync);
    return () => {
      window.removeEventListener("wheel", onScroll);
      window.removeEventListener("touchmove", onScroll);
      window.removeEventListener("cosmos:narration-sync" as any, handleSync);
    };
  }, []);

  // Track progress milestones
  const handleSimInteract = () => {
    onUpdateModuleProgress(module.id, 50, "in_progress");
    try {
      void submitActivityOutcome({
        data: {
          moduleId: "14",
          activityId: "act_14_black_hole_visualizer",
          payload: {
            massSolar: 10,
            radiusKm: 29.5,
            success: true,
          },
          isAccessibleAlternative: false,
        },
      });
    } catch (err) {
      console.warn("Could not submit Schwarzschild telemetry:", err);
    }
  };

  const handleQuizComplete = (score: number, total: number) => {
    onRecordQuiz("quiz_module_14", score, total);
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
            className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-semibold mb-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="size-3.5" />
            <span>← Back to Cosmic Learning Map</span>
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-purple-400 bg-purple-500/10 border border-purple-500/30 px-3 py-0.5 rounded-full uppercase tracking-wider">
              Stage 04 • Module 14
            </span>
            <span className="text-xs text-slate-400">Extreme Objects Laboratory</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Black Holes & Neutron Stars
          </h1>
          <p className="mt-1 text-sm sm:text-base text-slate-300 max-w-2xl">{module.subtitle}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
            <Clock className="size-3.5 text-purple-400" />
            <span>Estimated: {module.estimatedMinutes} mins</span>
          </div>

          {isCompleted ? (
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl">
              <CheckCircle2 className="size-4" />
              <span>Module Certified!</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-purple-300 bg-purple-500/10 border border-purple-500/30 px-3.5 py-1.5 rounded-xl">
              <ShieldCheck className="size-3.5 text-purple-400" />
              <span>Verified Track</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Age-Adaptive Learning Level Selector */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-400">
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
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <Orbit className="size-4 text-purple-300" />
            <span>1. 3D Black Hole & Lensing Chamber</span>
          </button>

          <button
            onClick={() => setActiveTab("comparison")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "comparison"
                ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <Atom className="size-4 text-amber-300" />
            <span>2. Remnants Comparison Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab("pulsar")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "pulsar"
                ? "bg-sky-600 text-white shadow-lg shadow-sky-600/30"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <Radio className="size-4 text-sky-300" />
            <span>3. Pulsar & Magnetar Lighthouse</span>
          </button>

          <button
            onClick={() => setActiveTab("gw")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "gw"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <Activity className="size-4 text-indigo-300" />
            <span>4. Gravitational Wave Chirp Lab</span>
          </button>
        </div>

        {/* Tab 1: 3D Black Hole Simulation */}
        {activeTab === "visualizer" && <BlackHoleVisualizer3D onMassChange={handleSimInteract} />}

        {/* Tab 2: Remnants Comparison Matrix */}
        {activeTab === "comparison" && <CompactObjectComparisonTable learningLevel={level} />}

        {/* Tab 3: Pulsar & Magnetar Simulator */}
        {activeTab === "pulsar" && <PulsarSimulator />}

        {/* Tab 4: Gravitational Wave Inspiral & Chirp */}
        {activeTab === "gw" && <GravitationalWaveChirpLab />}
      </section>

      {/* 4. Eight Comprehensive Sub-Lessons (Curriculum Stream) */}
      <section className="space-y-6 pt-4 border-t border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase font-bold tracking-wider text-purple-400 block mb-1">
              Curriculum Roadmap • 8 Lessons
            </span>
            <h3 className="text-2xl font-black text-white">The Physics of Collapsed Realities</h3>
          </div>

          <div className="text-xs text-slate-400 font-mono">
            Lesson {activeSubLesson.order} of {MODULE_14_SUBLESSONS.length}
          </div>
        </div>

        {/* Sub-lesson pill buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {MODULE_14_SUBLESSONS.map((sub, idx) => (
            <button
              key={sub.id}
              onClick={() => setActiveSubLessonIndex(idx)}
              className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                activeSubLessonIndex === idx
                  ? "bg-purple-600 text-white border-purple-400 font-bold shadow-md shadow-purple-900/30"
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
              <span className="text-xs font-mono text-purple-400 font-semibold block">
                LESSON 0{activeSubLesson.order} • {activeSubLesson.readTimeMinutes} MINUTE DISCOVERY
              </span>
              <h4 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                {activeSubLesson.title}
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">{activeSubLesson.subtitle}</p>
            </div>
          </div>

          {/* Core Concept Banner */}
          <div
            id="m14-sec-keyIdea"
            data-cosmos-section="keyIdea"
            className={`p-4 rounded-2xl bg-purple-500/10 border text-purple-200 text-sm leading-relaxed transition-all duration-300 ${
              activeNarrationSection === "keyIdea"
                ? "bg-purple-500/25 ring-2 ring-purple-400 border-purple-400 shadow-lg shadow-purple-500/10"
                : "border-purple-500/20"
            }`}
          >
            <strong className="text-purple-300 block mb-1 font-mono uppercase text-xs">
              Key Insight:
            </strong>
            {activeSubContent.keyIdea}
          </div>

          {/* Lead & Main Explanation */}
          <div className="space-y-4 text-slate-200 text-sm sm:text-base leading-relaxed">
            <p
              id="m14-sec-lead"
              data-cosmos-section="lead"
              className={`font-medium text-white text-base sm:text-lg p-2 rounded-xl transition-all duration-300 ${
                activeNarrationSection === "lead"
                  ? "bg-purple-500/20 ring-2 ring-purple-400 shadow-md"
                  : ""
              }`}
            >
              {activeSubContent.lead}
            </p>
            <p
              id="m14-sec-explanation"
              data-cosmos-section="explanation"
              className={`text-slate-300 leading-relaxed p-2 rounded-xl transition-all duration-300 ${
                activeNarrationSection === "explanation"
                  ? "bg-purple-500/20 ring-2 ring-purple-400 shadow-md"
                  : ""
              }`}
            >
              {activeSubContent.explanation}
            </p>
          </div>

          {/* Advanced Mathematics derivations (Young Astronomer level) */}
          {"mathematics" in activeSubContent && activeSubContent.mathematics && (
            <div
              id="m14-sec-mathematics"
              data-cosmos-section="mathematics"
              className={`p-4 rounded-2xl bg-slate-950 border font-mono text-xs text-cyan-200 space-y-1 transition-all duration-300 ${
                activeNarrationSection === "mathematics"
                  ? "bg-cyan-950/60 ring-2 ring-cyan-400 border-cyan-400 shadow-lg shadow-cyan-500/10"
                  : "border-cyan-500/30"
              }`}
            >
              <span className="text-slate-400 text-[10px] block uppercase tracking-wider">
                Relativistic Mathematical Framework:
              </span>
              <p className="leading-relaxed">{activeSubContent.mathematics}</p>
            </div>
          )}

          {/* Interactive Experiment Prompt */}
          <div
            id="m14-sec-activityPrompt"
            data-cosmos-section="activityPrompt"
            className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs text-slate-300 transition-all duration-300 ${
              activeNarrationSection === "activityPrompt"
                ? "bg-purple-500/25 ring-2 ring-purple-400 border-purple-400 shadow-lg shadow-purple-500/10"
                : "bg-white/[0.02] border-white/5"
            }`}
          >
            <span className="flex items-center gap-2">
              <Sparkles className="size-4 text-purple-400 shrink-0" />
              <span>{activeSubContent.activityPrompt}</span>
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (activeSubLesson.id.includes("pulsar")) setActiveTab("pulsar");
                else if (activeSubLesson.id.includes("waves")) setActiveTab("gw");
                else if (activeSubLesson.id.includes("white")) setActiveTab("comparison");
                else setActiveTab("visualizer");
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
                if (activeSubLessonIndex < MODULE_14_SUBLESSONS.length - 1) {
                  setActiveSubLessonIndex((i) => i + 1);
                }
              }}
              className="bg-purple-600 hover:bg-purple-500 text-white font-semibold"
            >
              {activeSubLessonIndex < MODULE_14_SUBLESSONS.length - 1
                ? "Next Lesson →"
                : "Proceed to Knowledge Check ↓"}
            </Button>
          </div>
        </div>
      </section>

      {/* 5. Interactive Knowledge Check (Quiz) */}
      <section className="space-y-4 pt-4 border-t border-white/10" id="module-14-quiz">
        <KnowledgeCheck
          quizId="quiz_module_14"
          currentLevel={level}
          questions={MODULE_14_QUIZ}
          onComplete={handleQuizComplete}
        />
      </section>

      {/* 6. Scientific Sources & Discovery Facts */}
      <section className="space-y-4 pt-4 border-t border-white/10">
        <SourceInformationPanel
          sources={module.scientificSources}
          discoveryFacts={MODULE_14_DISCOVERY_FACTS}
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
