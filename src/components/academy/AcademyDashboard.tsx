import React, { useState, useRef, useEffect } from "react";
import { ACADEMY_STAGES, ACADEMY_MODULES } from "@/lib/academy/registry";
import { MODULE_01_LESSON } from "@/lib/academy/lessons/module-01-our-place";
import { useAcademyProgress } from "@/lib/academy/progress";
import { getAdaptiveRecommendations } from "@/lib/academy/recommendations";
import type { AcademySettings, ModuleContract } from "@/lib/academy/types";
import { AcademyHero } from "./AcademyHero";
import { LearningLevelSelector } from "./LearningLevelSelector";
import { CosmicLearningMap } from "./CosmicLearningMap";
import { LearningStageCard } from "./LearningStageCard";
import { ProgressTracker } from "./ProgressTracker";
import { AchievementDisplay } from "./AchievementDisplay";
import { AccessibilityControls } from "./AccessibilityControls";
import { LessonLayout } from "./LessonLayout";
import { Module02Layout } from "./Module02Layout";
import { Link } from "@tanstack/react-router";
import {
  Sparkles,
  Compass,
  ArrowRight,
  X,
  ExternalLink,
  BookOpen,
  Clock,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AcademyDashboardProps {
  initialModuleId?: string | null;
}

export function AcademyDashboard({ initialModuleId }: AcademyDashboardProps) {
  const {
    progress,
    selectedLevel,
    setLearningLevel,
    setModuleProgress,
    recordQuizResult,
    toggleBookmark,
    exportProgressJSON,
    resetProgress,
  } = useAcademyProgress();

  const [activeLessonModule, setActiveLessonModule] = useState<ModuleContract | null>(() => {
    if (initialModuleId === "01") {
      return ACADEMY_MODULES.find((m) => m.id === "01") || null;
    }
    if (initialModuleId === "02") {
      return ACADEMY_MODULES.find((m) => m.id === "02") || null;
    }
    return null;
  });

  const [previewModule, setPreviewModule] = useState<ModuleContract | null>(null);

  const [settings, setSettings] = useState<AcademySettings>({
    reducedMotion: false,
    highContrast: false,
    soundEffects: false,
    fontSize: "normal",
  });

  const mapSectionRef = useRef<HTMLDivElement>(null);
  const stagesSectionRef = useRef<HTMLDivElement>(null);

  const recommendations = getAdaptiveRecommendations(progress);
  const primaryRecommendation = recommendations[0];

  const handleScrollToMap = () => {
    mapSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleScrollToStages = () => {
    stagesSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSelectStage = (stageId: number) => {
    const el = document.getElementById(`stage-${stageId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleSelectModule = (module: ModuleContract) => {
    if (module.id === "01" || module.id === "02") {
      setActiveLessonModule(module);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setPreviewModule(module);
    }
  };

  // If viewing an active lesson (e.g. Module 01)
  if (activeLessonModule && activeLessonModule.id === "01") {
    return (
      <div
        className={`min-h-screen bg-slate-950 text-slate-100 ${settings.fontSize === "large" ? "text-base" : "text-sm"}`}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-20">
          <LessonLayout
            module={activeLessonModule}
            lesson={MODULE_01_LESSON}
            progress={progress}
            onSetLearningLevel={setLearningLevel}
            onUpdateModuleProgress={setModuleProgress}
            onRecordQuiz={recordQuizResult}
            onBackToMap={() => setActiveLessonModule(null)}
            nextRecommended={
              primaryRecommendation && primaryRecommendation.module.id !== "01"
                ? {
                    module: primaryRecommendation.module,
                    reason: primaryRecommendation.reason,
                  }
                : undefined
            }
            onSelectNextModule={(mod) => {
              if (mod.id === "01" || mod.id === "02") {
                setActiveLessonModule(mod);
              } else {
                setActiveLessonModule(null);
                setPreviewModule(mod);
              }
            }}
          />
        </div>
      </div>
    );
  }

  // If viewing Module 02: The Night Sky & Constellations
  if (activeLessonModule && activeLessonModule.id === "02") {
    return (
      <div
        className={`min-h-screen bg-slate-950 text-slate-100 ${settings.fontSize === "large" ? "text-base" : "text-sm"}`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-20">
          <Module02Layout
            module={activeLessonModule}
            progress={progress}
            onSetLearningLevel={setLearningLevel}
            onUpdateModuleProgress={setModuleProgress}
            onRecordQuiz={recordQuizResult}
            onBackToMap={() => setActiveLessonModule(null)}
            nextRecommended={
              primaryRecommendation && primaryRecommendation.module.id !== "02"
                ? {
                    module: primaryRecommendation.module,
                    reason: primaryRecommendation.reason,
                  }
                : undefined
            }
            onSelectNextModule={(mod) => {
              if (mod.id === "01" || mod.id === "02") {
                setActiveLessonModule(mod);
              } else {
                setActiveLessonModule(null);
                setPreviewModule(mod);
              }
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200 ${
        settings.fontSize === "large" ? "text-base" : "text-sm"
      }`}
    >
      {/* 1. Cinematic Opening 3D Hero */}
      <AcademyHero onStartExploring={handleScrollToStages} onViewMap={handleScrollToMap} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 py-12">
        {/* Accessibility & Learning Level Selector Section */}
        <section className="space-y-4">
          <AccessibilityControls settings={settings} onUpdateSettings={setSettings} />
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl">
            <LearningLevelSelector currentLevel={selectedLevel} onSelectLevel={setLearningLevel} />
          </div>
        </section>

        {/* Adaptive Next Recommendation Banner */}
        {primaryRecommendation && (
          <section className="rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-indigo-950/30 to-slate-900/80 p-6 sm:p-8 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-lg shadow-cyan-950/20">
            <div className="flex items-start gap-4">
              <div className="size-12 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                <Compass className="size-6 text-cyan-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 rounded-full uppercase">
                    Up Next on Your Cosmic Journey
                  </span>
                  <span className="text-xs text-amber-300 font-semibold">
                    {primaryRecommendation.badge}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                  Module {primaryRecommendation.module.id}: {primaryRecommendation.module.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  {primaryRecommendation.reason}
                </p>
              </div>
            </div>

            <div className="flex-shrink-0">
              {primaryRecommendation.module.id === "01" ||
              primaryRecommendation.module.id === "02" ? (
                <Button
                  size="lg"
                  onClick={() => handleSelectModule(primaryRecommendation.module)}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold shadow-md shadow-cyan-500/25 border-none"
                >
                  <span>Start Module {primaryRecommendation.module.id}</span>
                  <ArrowRight className="size-4 ml-2" />
                </Button>
              ) : primaryRecommendation.module.id === "13" ? (
                <Button
                  asChild
                  size="lg"
                  className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-md"
                >
                  <Link to="/galaxies">
                    <span>Explore Galaxies 3D</span>
                    <ExternalLink className="size-4 ml-2" />
                  </Link>
                </Button>
              ) : primaryRecommendation.module.id === "19" ? (
                <Button
                  asChild
                  size="lg"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md"
                >
                  <Link to="/visible-universe-history">
                    <span>View Cosmic History</span>
                    <ExternalLink className="size-4 ml-2" />
                  </Link>
                </Button>
              ) : (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setPreviewModule(primaryRecommendation.module)}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <span>Preview Syllabus</span>
                </Button>
              )}
            </div>
          </section>
        )}

        {/* 2. Interactive Cosmic Flightpath Map */}
        <section ref={mapSectionRef} className="pt-4">
          <CosmicLearningMap
            stages={ACADEMY_STAGES}
            progress={progress}
            onSelectStage={handleSelectStage}
          />
        </section>

        {/* 3. Progress Tracking & Achievements Hub */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProgressTracker
            progress={progress}
            onExport={exportProgressJSON}
            onReset={resetProgress}
          />
          <AchievementDisplay unlockedIds={progress.achievements} />
        </section>

        {/* 4. Complete Six Progressive Learning Stages */}
        <section ref={stagesSectionRef} className="space-y-10 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/10">
            <div>
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                Full 24-Module Astronomy Curriculum
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Cosmic Learning Journey
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Arranged progressively across 6 distinct celestial stages
            </p>
          </div>

          {ACADEMY_STAGES.map((stage) => (
            <LearningStageCard
              key={stage.id}
              stage={stage}
              progress={progress}
              onToggleBookmark={toggleBookmark}
              onSelectModule={handleSelectModule}
            />
          ))}
        </section>
      </div>

      {/* Syllabus Modal for Coming Soon & Preview Modules */}
      {previewModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-900 p-6 sm:p-8 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-mono text-xs font-bold text-cyan-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                    Module #{previewModule.id}
                  </span>
                  <span className="text-xs text-amber-300 font-semibold bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                    Stage 0{previewModule.stageId}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">{previewModule.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{previewModule.subtitle}</p>
              </div>

              <button
                onClick={() => setPreviewModule(null)}
                className="p-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="mt-5 space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Module Summary
                </h4>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {previewModule.description}
                </p>
              </div>

              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">
                  Learning Objectives:
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {previewModule.learningObjectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="size-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-slate-300">
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  <span className="text-[10px] text-slate-400 block mb-0.5">
                    Estimated Duration
                  </span>
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Clock className="size-3.5 text-cyan-400" />
                    {previewModule.estimatedMinutes} Minutes
                  </span>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Difficulty Levels</span>
                  <span className="font-bold text-white">
                    {previewModule.difficultyLevels.join(" • ")}
                  </span>
                </div>
              </div>

              {previewModule.scientificSources.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Primary Grounding Archives
                  </h4>
                  <div className="space-y-2">
                    {previewModule.scientificSources.map((src, i) => (
                      <a
                        key={i}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 text-xs text-cyan-300 hover:text-cyan-200 transition-colors"
                      >
                        <span className="truncate">{src.title}</span>
                        <ExternalLink className="size-3 text-slate-400 ml-2 flex-shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-emerald-400" />
                Registered in Cosmic Academy Module Registry v{previewModule.version}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewModule(null)}
                className="border-white/10 text-white"
              >
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
