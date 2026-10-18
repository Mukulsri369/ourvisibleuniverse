import React, { useState } from "react";
import type {
  LearningLevel,
  ModuleContract,
  ModuleStatus,
  UserProgress,
} from "@/lib/academy/types";
import { submitActivityOutcome } from "@/lib/academy/completion.functions";
import {
  MODULE_21_SUBLESSONS,
  MODULE_21_QUIZ,
  MODULE_21_DISCOVERY_FACTS,
  MODULE_21_SOURCES,
} from "@/lib/academy/lessons/module-21-telescopes";
import { VirtualObservatoryLab } from "./VirtualObservatoryLab";
import { KnowledgeCheck } from "./KnowledgeCheck";
import { SourceInformationPanel } from "./SourceInformationPanel";
import { LearningLevelSelector } from "./LearningLevelSelector";
import { ModuleCompletionChecklist } from "./ModuleCompletionChecklist";
import {
  BookOpen,
  CheckCircle2,
  Sparkles,
  Layers,
  HelpCircle,
  Clock,
  ArrowRight,
  ChevronRight,
  ArrowLeft,
  Award,
  Zap,
  ShieldCheck,
  Search,
  Eye,
  Radio,
  Activity,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Module21LayoutProps {
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

export function Module21Layout({
  module,
  progress,
  onSetLearningLevel,
  onUpdateModuleProgress,
  onRecordQuiz,
  onBackToMap,
  nextRecommended,
  onSelectNextModule,
}: Module21LayoutProps) {
  const level = progress.selectedLevel;
  const moduleProgress = progress.moduleProgress[module.id];
  const isCompleted = moduleProgress?.status === "completed";

  const [activeTab, setActiveTab] = useState<"laboratory" | "sublessons" | "quiz">("laboratory");
  const [activeSubLessonIndex, setActiveSubLessonIndex] = useState<number>(0);

  const activeSubLesson = MODULE_21_SUBLESSONS[activeSubLessonIndex];
  const activeSubContent = activeSubLesson.content[level];

  // Track progress milestones
  const handleLabInteract = () => {
    onUpdateModuleProgress(module.id, 55, "in_progress");
    try {
      void submitActivityOutcome({
        data: {
          moduleId: "21",
          activityId: "act_21_telescope_optics_lab",
          payload: {
            apertureMeters: 6.5,
            wavelengthNm: 550,
            success: true,
          },
          isAccessibleAlternative: false,
        },
      });
    } catch (err) {
      console.warn("Could not submit telescope optics telemetry:", err);
    }
  };

  const handleQuizComplete = (score: number, total: number) => {
    onRecordQuiz("quiz_module_21", score, total);
    // Authoritative verification is evaluated server-side.
    onUpdateModuleProgress(module.id, 90, "in_progress");
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* 1. Header Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBackToMap}
            className="text-slate-400 hover:text-white hover:bg-slate-800 -ml-2"
          >
            <ArrowLeft className="size-4 mr-1.5" />
            Academy Map
          </Button>
          <span className="text-slate-600">/</span>
          <span className="text-xs font-mono text-emerald-400 font-semibold tracking-wider uppercase">
            Stage 6: Become a Space Scientist
          </span>
        </div>

        <div className="flex items-center gap-3">
          <LearningLevelSelector currentLevel={level} onSelectLevel={onSetLearningLevel} />
          {isCompleted && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-medium">
              <CheckCircle2 className="size-3.5" />
              Completed
            </div>
          )}
        </div>
      </div>

      {/* 2. Hero Title Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-emerald-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/40 p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-mono uppercase tracking-wider">
                Module {module.number} • Observatory Science
              </span>
              <span className="text-slate-500 text-xs">•</span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="size-3 text-slate-500" />
                {module.estimatedMinutes} mins
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              {module.title}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-light">
              Step inside the Virtual Astronomy Observatory. Harness multi-wavelength apertures from
              radio interferometers to James Webb's cryogenic infrared mirrors and Chandra's grazing
              X-ray shells to pierce cosmic dust and decode the language of starlight.
            </p>

            {/* Quick stats pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-white/10 text-xs text-slate-300 flex items-center gap-1.5">
                <Search className="size-3 text-emerald-400" /> 8 Comprehensive Lessons
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-white/10 text-xs text-slate-300 flex items-center gap-1.5">
                <Eye className="size-3 text-cyan-400" /> 8 Research Telescopes
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-white/10 text-xs text-slate-300 flex items-center gap-1.5">
                <Radio className="size-3 text-amber-400" /> 5 Wavelength Regimes
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-white/10 text-xs text-slate-300 flex items-center gap-1.5">
                <Award className="size-3 text-purple-400" /> "Become an Astronomer" Game
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 shrink-0 w-full sm:w-auto">
            {!isCompleted ? (
              <Button
                onClick={() => {
                  const el = document.getElementById("module-21-checklist");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                variant="outline"
                size="sm"
                className="border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10 text-xs"
              >
                <Target className="size-3.5 mr-1.5 text-emerald-400" />
                Review Requirements
              </Button>
            ) : (
              <div className="text-center p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                <ShieldCheck className="size-6 text-emerald-400 mx-auto mb-1" />
                <span className="text-xs font-semibold text-emerald-200 block">
                  Master Astronomer Certified
                </span>
                <span className="text-[10px] text-emerald-400/80">Stage 6 Observatory Honors</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Main Experience Tabs */}
      <section className="space-y-6">
        <div className="flex border-b border-white/10 gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => {
              setActiveTab("laboratory");
              handleLabInteract();
            }}
            className={`px-4 py-2.5 rounded-t-xl font-semibold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === "laboratory"
                ? "border-emerald-500 text-emerald-400 bg-emerald-500/10"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <Search className="size-4" />
            Virtual Observatory Lab
          </button>

          <button
            onClick={() => setActiveTab("sublessons")}
            className={`px-4 py-2.5 rounded-t-xl font-semibold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === "sublessons"
                ? "border-emerald-500 text-emerald-400 bg-emerald-500/10"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <BookOpen className="size-4" />
            Lessons & Optical Theory (8)
          </button>

          <button
            onClick={() => setActiveTab("quiz")}
            className={`px-4 py-2.5 rounded-t-xl font-semibold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === "quiz"
                ? "border-emerald-500 text-emerald-400 bg-emerald-500/10"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <HelpCircle className="size-4" />
            Knowledge Check Quiz
          </button>
        </div>

        {/* TAB A: Interactive Signature Laboratory */}
        {activeTab === "laboratory" && (
          <div className="space-y-6">
            <VirtualObservatoryLab
              learningLevel={level}
              onCompleteLab={() => onUpdateModuleProgress(module.id, 80, "in_progress")}
            />
          </div>
        )}

        {/* TAB B: Sub-lessons reader */}
        {activeTab === "sublessons" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Sidebar Sublesson Index */}
            <div className="lg:col-span-4 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
                Curriculum Lessons
              </span>
              <div className="space-y-1.5">
                {MODULE_21_SUBLESSONS.map((sub, idx) => (
                  <button
                    key={sub.id}
                    onClick={() => setActiveSubLessonIndex(idx)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                      activeSubLessonIndex === idx
                        ? "bg-emerald-950/40 border-emerald-500/60 text-white shadow-sm"
                        : "bg-slate-900/40 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-slate-900/70"
                    }`}
                  >
                    <div
                      className={`size-6 rounded-lg text-xs font-mono font-bold flex items-center justify-center shrink-0 ${
                        activeSubLessonIndex === idx
                          ? "bg-emerald-500 text-slate-950"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold truncate text-slate-200">
                        {sub.title.replace(/^\d+\.\s*/, "")}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">
                        {sub.subtitle}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Sublesson Detailed Viewer */}
            <div className="lg:col-span-8 space-y-6">
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-semibold mb-1">
                    <span>Lesson {activeSubLessonIndex + 1} of 8</span>
                    <span>•</span>
                    <span className="capitalize">{level} Level Depth</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    {activeSubLesson.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1">
                    {activeSubLesson.subtitle}
                  </p>
                </div>

                {/* Sublesson Objectives */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold block">
                    Key Scientific Objectives:
                  </span>
                  <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                    {activeSubLesson.objectives.map((obj, i) => (
                      <li key={i}>{obj}</li>
                    ))}
                  </ul>
                </div>

                {/* Summary */}
                <div className="text-sm text-slate-200 leading-relaxed space-y-3 font-normal">
                  <p>{activeSubContent.summary}</p>
                </div>

                {/* Key Takeaways */}
                <div className="space-y-2">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
                    Core Principles:
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeSubContent.keyTakeaways.map((takeaway, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-950/60 border border-white/5 text-xs text-slate-300 flex items-start gap-2"
                      >
                        <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{takeaway}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Deep Dive */}
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-2">
                  <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <Sparkles className="size-3.5 text-emerald-400" />
                    Astrophysical Deep Dive:
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activeSubContent.deepDive}
                  </p>
                </div>

                {/* Did You Know Fact */}
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-2.5">
                  <Zap className="size-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-amber-300 mb-0.5">Did You Know?</span>
                    {activeSubContent.didYouKnow}
                  </div>
                </div>

                {/* Sublesson Navigation */}
                <div className="flex items-center justify-between border-t border-white/10 pt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={activeSubLessonIndex === 0}
                    onClick={() => setActiveSubLessonIndex((prev) => Math.max(0, prev - 1))}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Previous Lesson
                  </Button>

                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      if (activeSubLessonIndex < MODULE_21_SUBLESSONS.length - 1) {
                        setActiveSubLessonIndex((prev) => prev + 1);
                      } else {
                        setActiveTab("laboratory");
                      }
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium"
                  >
                    {activeSubLessonIndex < MODULE_21_SUBLESSONS.length - 1 ? (
                      <>
                        Next Lesson <ChevronRight className="size-3.5 ml-1" />
                      </>
                    ) : (
                      <>
                        Launch Observatory <ArrowRight className="size-3.5 ml-1" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB C: Knowledge Check Quiz */}
        {activeTab === "quiz" && (
          <div className="max-w-3xl mx-auto space-y-6">
            <KnowledgeCheck
              quizId="quiz_module_21"
              questions={MODULE_21_QUIZ}
              currentLevel={level}
              onComplete={handleQuizComplete}
            />
          </div>
        )}
      </section>

      {/* 4. Discovery Facts Grid */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Zap className="size-4 text-emerald-400" />
          Mind-Bending Facts About Telescopes & Space Discovery
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULE_21_DISCOVERY_FACTS.map((factItem, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl border border-white/10 bg-slate-900/50 hover:bg-slate-900/80 transition-all space-y-2"
            >
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-emerald-400" />
                Astronomical Discovery
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{factItem.fact}</p>
              <div className="text-[10px] text-slate-500 font-mono pt-1">
                Source: {factItem.source}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Scientific References & Citation Panel */}
      <section>
        <SourceInformationPanel sources={MODULE_21_SOURCES} />
      </section>

      {/* 5b. Authoritative Verified Module Completion Checklist */}
      <section id="module-21-checklist">
        <ModuleCompletionChecklist
          moduleId="21"
          onNextModule={
            nextRecommended && onSelectNextModule
              ? () => onSelectNextModule(nextRecommended.module)
              : onBackToMap
          }
          onNavigateToAssessment={() => {
            if (typeof document !== "undefined") {
              const el = document.querySelector(
                '[role="region"][aria-label="Module Knowledge Assessment"]',
              );
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

      {/* 6. Next Recommended Module Banner */}
      {nextRecommended && onSelectNextModule && (
        <section className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/30 via-slate-900/60 to-slate-950/50 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
              Next in Curriculum
            </div>
            <div className="text-lg font-bold text-white mt-0.5">
              {nextRecommended.module.number}. {nextRecommended.module.title}
            </div>
            <div className="text-xs text-slate-300 mt-0.5">{nextRecommended.reason}</div>
          </div>
          <Button
            onClick={() => onSelectNextModule(nextRecommended.module)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/30"
          >
            Continue to Module {nextRecommended.module.number}
            <ArrowRight className="size-4 ml-1.5" />
          </Button>
        </section>
      )}
    </div>
  );
}
