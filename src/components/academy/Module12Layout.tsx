import React, { useState } from "react";
import type {
  LearningLevel,
  ModuleContract,
  ModuleStatus,
  UserProgress,
} from "@/lib/academy/types";
import {
  MODULE_12_SUBLESSONS,
  MODULE_12_SOURCES,
  MODULE_12_QUIZ,
  REAL_EXOPLANET_SYSTEMS,
} from "@/lib/academy/lessons/module-12-exoplanets";
import { ExoplanetDiscoveryLab } from "./ExoplanetDiscoveryLab";
import { KnowledgeCheck } from "./KnowledgeCheck";
import { ModuleCompletionChecklist } from "./ModuleCompletionChecklist";
import { SourceInformationPanel } from "./SourceInformationPanel";
import { LearningLevelSelector } from "./LearningLevelSelector";
import {
  Globe2,
  BookOpen,
  Clock,
  ExternalLink,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Orbit,
  Activity,
  Flame,
  Sparkles,
  Radio,
  Search,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitActivityOutcome } from "@/lib/academy/completion.functions";

interface Module12LayoutProps {
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

export function Module12Layout({
  module,
  progress,
  onSetLearningLevel,
  onUpdateModuleProgress,
  onRecordQuiz,
  onBackToMap,
  nextRecommended,
  onSelectNextModule,
}: Module12LayoutProps) {
  const [activeTab, setActiveTab] = useState<"lab" | "lessons" | "quiz" | "sources">("lab");
  const [activeSublessonId, setActiveSublessonId] = useState<string>("12-1");

  const currentLevel = progress.selectedLevel || "explorer";
  const modProgress = progress.moduleProgress[module.id] || {
    status: "not_started",
    percentComplete: 0,
  };

  const handleLabInteracted = () => {
    if (modProgress.percentComplete < 50) {
      onUpdateModuleProgress(module.id, 50, "in_progress");
    }
    try {
      void submitActivityOutcome({
        data: {
          moduleId: "12",
          activityId: "act_12_transit_detection_lab",
          payload: {
            transitDepthPpm: 120,
            radiusRatio: 0.011,
            success: true,
          },
          isAccessibleAlternative: false,
        },
      });
    } catch (err) {
      console.warn("Could not submit transit telemetry:", err);
    }
  };

  const handleCompleteSublesson = (sublessonId: string) => {
    const idx = MODULE_12_SUBLESSONS.findIndex((s) => s.id === sublessonId);
    const stepPercent = Math.round(((idx + 1) / MODULE_12_SUBLESSONS.length) * 40) + 50;
    const newPercent = Math.max(modProgress.percentComplete, Math.min(90, stepPercent));
    onUpdateModuleProgress(module.id, newPercent, "in_progress");
  };

  const handleQuizFinished = (score: number, total: number) => {
    onRecordQuiz("quiz_module_12", score, total);
    // Record learning progress without bypassing authoritative validation
    onUpdateModuleProgress(module.id, 90, "in_progress");
  };

  const activeSublesson =
    MODULE_12_SUBLESSONS.find((s) => s.id === activeSublessonId) || MODULE_12_SUBLESSONS[0];

  return (
    <div className="space-y-8 pb-16">
      {/* Module Navigation & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <button
          onClick={onBackToMap}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="size-4 text-cyan-400" />
          <span>Return to Academy Curriculum Map</span>
        </button>

        <div className="flex items-center gap-3">
          <LearningLevelSelector
            currentLevel={currentLevel}
            onSelectLevel={onSetLearningLevel}
            compact
          />
          <div className="text-right pl-3 border-l border-white/10">
            <span className="text-[10px] text-slate-400 block">Progress</span>
            <span className="font-mono text-xs font-bold text-cyan-300">
              {modProgress.percentComplete}%
            </span>
          </div>
        </div>
      </div>

      {/* Module Hero Banner */}
      <section className="relative rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-slate-900/80 p-6 sm:p-8 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 rounded-full uppercase">
              Stage 03 • The Life of Stars
            </span>
            <span className="text-xs font-mono text-slate-400">Module #{module.id}</span>
            {modProgress.status === "completed" && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                <CheckCircle2 className="size-3" />
                Completed
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {module.title}
          </h1>
          <p className="text-base text-cyan-200/90 font-medium mt-1">{module.subtitle}</p>
          <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed">
            {module.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-6 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <Clock className="size-4 text-cyan-400" />
              <span>{module.estimatedMinutes} Minutes</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Globe2 className="size-4 text-blue-400" />
              <span>5,500+ Confirmed Alien Worlds</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-emerald-400" />
              <span>NASA Exoplanet Archive Grounded</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Tab Controls */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("lab")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "lab"
              ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Globe2 className="size-4" />
          <span>Exoplanet Discovery Lab</span>
        </button>

        <button
          onClick={() => setActiveTab("lessons")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "lessons"
              ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <BookOpen className="size-4" />
          <span>Lessons ({MODULE_12_SUBLESSONS.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("quiz")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "quiz"
              ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Sparkles className="size-4" />
          <span>Knowledge Check</span>
        </button>

        <button
          onClick={() => setActiveTab("sources")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "sources"
              ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <ExternalLink className="size-4" />
          <span>Scientific Sources</span>
        </button>
      </div>

      {/* TAB 1: Signature Discovery Lab */}
      {activeTab === "lab" && (
        <section className="space-y-6">
          <ExoplanetDiscoveryLab learningLevel={currentLevel} onInteraction={handleLabInteracted} />
        </section>
      )}

      {/* TAB 2: Lessons Curriculum */}
      {activeTab === "lessons" && (
        <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Sublessons List Sidebar */}
          <div className="md:col-span-4 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Curriculum Lessons
            </h3>
            {MODULE_12_SUBLESSONS.map((sub, idx) => (
              <button
                key={sub.id}
                onClick={() => setActiveSublessonId(sub.id)}
                className={`w-full text-left p-3 rounded-2xl border transition-all ${
                  activeSublessonId === sub.id
                    ? "bg-cyan-500/15 border-cyan-500/40 text-white shadow-lg shadow-cyan-950/20"
                    : "border-white/5 bg-white/[0.02] text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-mono text-cyan-400 font-bold">Lesson 12.{idx + 1}</span>
                  <span className="text-[10px] text-slate-400">{sub.durationMinutes} min</span>
                </div>
                <div className="text-xs font-semibold leading-snug text-slate-200">{sub.title}</div>
              </button>
            ))}
          </div>

          {/* Sublesson Main Content */}
          <div className="md:col-span-8 rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl space-y-6">
            <div>
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/10">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase">
                  Lesson Focus
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="size-3 text-cyan-400" />
                  {activeSublesson.durationMinutes} min read
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-2">
                {activeSublesson.title}
              </h2>
            </div>

            {/* Level-adapted prose */}
            <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed space-y-4">
              <p>
                {activeSublesson.contentByLevel[currentLevel] ||
                  activeSublesson.contentByLevel.explorer}
              </p>
            </div>

            {/* Key Takeaways */}
            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-950/20 p-4 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5" />
                Key Astrophysical Takeaways
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {activeSublesson.keyTakeaways.map((takeaway, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mark complete and next */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCompleteSublesson(activeSublesson.id)}
                className="border-white/10 text-white hover:bg-white/10"
              >
                Mark Lesson Complete
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  handleCompleteSublesson(activeSublesson.id);
                  const curIdx = MODULE_12_SUBLESSONS.findIndex((s) => s.id === activeSublesson.id);
                  if (curIdx < MODULE_12_SUBLESSONS.length - 1) {
                    setActiveSublessonId(MODULE_12_SUBLESSONS[curIdx + 1].id);
                  } else {
                    setActiveTab("quiz");
                  }
                }}
                className="bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-bold"
              >
                <span>Continue Reading</span>
                <ArrowRight className="size-4 ml-1.5" />
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* TAB 3: Knowledge Check */}
      {activeTab === "quiz" && (
        <section className="max-w-3xl mx-auto space-y-6">
          <KnowledgeCheck
            quizId="quiz_module_12"
            currentLevel={currentLevel}
            questions={MODULE_12_QUIZ}
            onComplete={handleQuizFinished}
          />
        </section>
      )}

      {/* TAB 4: Scientific Sources */}
      {activeTab === "sources" && (
        <section className="max-w-4xl mx-auto">
          <SourceInformationPanel sources={MODULE_12_SOURCES} />
        </section>
      )}

      {/* Authoritative Verified Module Completion Checklist */}
      <section id="module-12-checklist" className="max-w-4xl mx-auto">
        <ModuleCompletionChecklist
          moduleId="12"
          onNextModule={
            nextRecommended && onSelectNextModule
              ? () => onSelectNextModule(nextRecommended.module)
              : onBackToMap
          }
          onNavigateToAssessment={() => setActiveTab("quiz")}
          onNavigateToActivity={() => setActiveTab("lab")}
          onNavigateToSection={() => setActiveTab("lessons")}
        />
      </section>

      {/* Footer Navigation */}
      <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={onBackToMap}
          className="border-white/10 text-white hover:bg-white/10"
        >
          <ArrowLeft className="size-4 mr-2" />
          <span>All Modules Map</span>
        </Button>

        {nextRecommended && onSelectNextModule && (
          <Button
            onClick={() => onSelectNextModule(nextRecommended.module)}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold shadow-lg shadow-cyan-500/25 border-none"
          >
            <span>
              Proceed to Module {nextRecommended.module.id}: {nextRecommended.module.title}
            </span>
            <ArrowRight className="size-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
