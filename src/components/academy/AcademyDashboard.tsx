import React, { useState, useRef, useEffect, lazy, Suspense } from "react";
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
import { StudentRegistrationBanner } from "./StudentRegistrationBanner";
import { StudentProfileModal } from "./StudentProfileModal";
import { ModuleStickyCompletionDrawer } from "./ModuleCompletionChecklist";
import { useStudentAuth } from "@/lib/academy/useStudentAuth";
import { LEARNING_LEVELS } from "@/lib/academy/registry";
import { Link, useNavigate } from "@tanstack/react-router";
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
  Orbit,
  User,
  GraduationCap,
  Shield,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Lazy-loaded module layouts to optimize initial bundle size and isolate module evaluation
const LessonLayout = lazy(() =>
  import("./LessonLayout").then((m) => ({ default: m.LessonLayout })),
);
const Module02Layout = lazy(() =>
  import("./Module02Layout").then((m) => ({ default: m.Module02Layout })),
);
const Module03Layout = lazy(() =>
  import("./Module03Layout").then((m) => ({ default: m.Module03Layout })),
);
const Module04Layout = lazy(() =>
  import("./Module04Layout").then((m) => ({ default: m.Module04Layout })),
);
const Module05Layout = lazy(() =>
  import("./Module05Layout").then((m) => ({ default: m.Module05Layout })),
);
const Module06Layout = lazy(() =>
  import("./Module06Layout").then((m) => ({ default: m.Module06Layout })),
);
const Module07Layout = lazy(() =>
  import("./Module07Layout").then((m) => ({ default: m.Module07Layout })),
);
const Module08Layout = lazy(() =>
  import("./Module08Layout").then((m) => ({ default: m.Module08Layout })),
);
const Module09Layout = lazy(() =>
  import("./Module09Layout").then((m) => ({ default: m.Module09Layout })),
);
const Module10Layout = lazy(() =>
  import("./Module10Layout").then((m) => ({ default: m.Module10Layout })),
);
const Module11Layout = lazy(() =>
  import("./Module11Layout").then((m) => ({ default: m.Module11Layout })),
);
const Module12Layout = lazy(() =>
  import("./Module12Layout").then((m) => ({ default: m.Module12Layout })),
);
const Module14Layout = lazy(() =>
  import("./Module14Layout").then((m) => ({ default: m.Module14Layout })),
);
const Module15Layout = lazy(() =>
  import("./Module15Layout").then((m) => ({ default: m.Module15Layout })),
);
const Module16Layout = lazy(() =>
  import("./Module16Layout").then((m) => ({ default: m.Module16Layout })),
);
const Module17Layout = lazy(() =>
  import("./Module17Layout").then((m) => ({ default: m.Module17Layout })),
);
const Module18Layout = lazy(() =>
  import("./Module18Layout").then((m) => ({ default: m.Module18Layout })),
);
const Module19Layout = lazy(() =>
  import("./Module19Layout").then((m) => ({ default: m.Module19Layout })),
);
const Module20Layout = lazy(() =>
  import("./Module20Layout").then((m) => ({ default: m.Module20Layout })),
);
const Module21Layout = lazy(() =>
  import("./Module21Layout").then((m) => ({ default: m.Module21Layout })),
);
const Module22Layout = lazy(() =>
  import("./Module22Layout").then((m) => ({ default: m.Module22Layout })),
);
const Module23Layout = lazy(() =>
  import("./Module23Layout").then((m) => ({ default: m.Module23Layout })),
);
const Module24Layout = lazy(() =>
  import("./Module24Layout").then((m) => ({ default: m.Module24Layout })),
);
const FinalExamEngine = lazy(() =>
  import("./FinalExamEngine").then((m) => ({ default: m.FinalExamEngine })),
);

const ACTIVE_MODULE_IDS = [
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
  "12",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
  "21",
  "22",
  "23",
  "24",
];

function ModuleLoadingFallback({ title }: { title: string }) {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center">
      <div className="relative mb-4">
        <div className="size-12 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
        <Orbit className="size-5 text-cyan-400 absolute inset-0 m-auto" />
      </div>
      <p className="text-sm font-bold text-white tracking-wide">{title}</p>
      <p className="text-xs text-slate-400 mt-1">
        Calibrating physical parameters and celestial coordinates...
      </p>
    </div>
  );
}

// Unified renderer for active module layouts
function renderActiveModule(
  moduleId: string,

  props: any,
) {
  switch (moduleId) {
    case "01":
      return <LessonLayout {...props} lesson={MODULE_01_LESSON} />;
    case "02":
      return <Module02Layout {...props} />;
    case "03":
      return <Module03Layout {...props} />;
    case "04":
      return <Module04Layout {...props} />;
    case "05":
      return <Module05Layout {...props} />;
    case "06":
      return <Module06Layout {...props} />;
    case "07":
      return <Module07Layout {...props} />;
    case "08":
      return <Module08Layout {...props} />;
    case "09":
      return <Module09Layout {...props} />;
    case "10":
      return <Module10Layout {...props} />;
    case "11":
      return <Module11Layout {...props} />;
    case "12":
      return <Module12Layout {...props} />;
    case "14":
      return <Module14Layout {...props} />;
    case "15":
      return <Module15Layout {...props} />;
    case "16":
      return <Module16Layout {...props} />;
    case "17":
      return <Module17Layout {...props} />;
    case "18":
      return <Module18Layout {...props} />;
    case "19":
      return <Module19Layout {...props} />;
    case "20":
      return <Module20Layout {...props} />;
    case "21":
      return <Module21Layout {...props} />;
    case "22":
      return <Module22Layout {...props} />;
    case "23":
      return <Module23Layout {...props} />;
    case "24":
      return <Module24Layout {...props} />;
    default:
      return null;
  }
}

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

  const { user, profile, isLoggedIn, updateProfile, changeLearningLevel, signOut } =
    useStudentAuth();

  const [showProfileModal, setShowProfileModal] = useState(false);

  // Synchronize authenticated student's selected level with local progress
  useEffect(() => {
    if (profile.selected_level && profile.selected_level !== selectedLevel) {
      setLearningLevel(profile.selected_level);
    }
  }, [profile.selected_level, selectedLevel, setLearningLevel]);

  const handleLevelSelect = (level: LearningLevel) => {
    setLearningLevel(level);
    void changeLearningLevel(level);
  };

  const navigate = useNavigate();

  const [showFinalExam, setShowFinalExam] = useState<boolean>(initialModuleId === "exam");

  useEffect(() => {
    if (initialModuleId === "13") {
      void navigate({ to: "/galaxies" });
    } else if (initialModuleId === "exam") {
      setShowFinalExam(true);
    }
  }, [initialModuleId, navigate]);

  const [activeLessonModule, setActiveLessonModule] = useState<ModuleContract | null>(() => {
    if (initialModuleId && ACTIVE_MODULE_IDS.includes(initialModuleId)) {
      return ACADEMY_MODULES.find((m) => m.id === initialModuleId) || null;
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
    if (typeof document !== "undefined") {
      const el = document.getElementById(`stage-${stageId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const handleSelectModule = (module: ModuleContract | string) => {
    if (module === "exam" || (typeof module === "object" && (module as any).id === "exam")) {
      setShowFinalExam(true);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      return;
    }
    const modObj =
      typeof module === "string" ? ACADEMY_MODULES.find((m) => m.id === module) : module;
    if (!modObj) return;
    if (modObj.id === "13") {
      void navigate({ to: "/galaxies" });
      return;
    }
    if (ACTIVE_MODULE_IDS.includes(modObj.id)) {
      setActiveLessonModule(modObj);
      setShowFinalExam(false);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else {
      setPreviewModule(modObj);
    }
  };

  // If viewing final exam, render the FinalExamEngine
  if (showFinalExam) {
    return (
      <div className="space-y-6">
        <Suspense fallback={<ModuleLoadingFallback title="Final Knowledge Assessment" />}>
          <FinalExamEngine
            initialLevel={selectedLevel}
            onBackToAcademy={() => setShowFinalExam(false)}
            onSelectModule={(modId) => {
              setShowFinalExam(false);
              handleSelectModule(modId);
            }}
          />
        </Suspense>
      </div>
    );
  }

  // If viewing an active module, render with isolated Suspense boundary and sleek fallback
  if (activeLessonModule) {
    const layoutProps = {
      module: activeLessonModule,
      progress,
      onSetLearningLevel: setLearningLevel,
      onUpdateModuleProgress: setModuleProgress,
      onRecordQuiz: recordQuizResult,
      onBackToMap: () => setActiveLessonModule(null),
      nextRecommended:
        primaryRecommendation && primaryRecommendation.module.id !== activeLessonModule.id
          ? {
              module: primaryRecommendation.module,
              reason: primaryRecommendation.reason,
            }
          : undefined,
      onSelectNextModule: (mod: ModuleContract) => {
        if (ACTIVE_MODULE_IDS.includes(mod.id)) {
          setActiveLessonModule(mod);
          if (typeof window !== "undefined") {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        } else {
          setActiveLessonModule(null);
          setPreviewModule(mod);
        }
      },
    };

    return (
      <div
        className={`min-h-screen bg-slate-950 text-slate-100 ${
          settings.fontSize === "large" ? "text-base" : "text-sm"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-28">
          <Suspense fallback={<ModuleLoadingFallback title={activeLessonModule.title} />}>
            {renderActiveModule(activeLessonModule.id, layoutProps)}
          </Suspense>
        </div>

        <ModuleStickyCompletionDrawer
          moduleId={activeLessonModule.id}
          onNavigateToAssessment={() => {
            if (typeof document !== "undefined") {
              const el =
                document.querySelector(
                  '[role="region"][aria-label="Module Knowledge Assessment"]',
                ) || document.getElementById(`module-${activeLessonModule.id}-quiz`);
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }
          }}
          onNavigateToActivity={() => {
            if (typeof window !== "undefined") {
              window.scrollTo({ top: 400, behavior: "smooth" });
            }
          }}
          onNavigateToSection={() => {
            if (typeof window !== "undefined") {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          onScrollToChecklist={() => {
            if (typeof document !== "undefined") {
              const el =
                document.getElementById(`module-${activeLessonModule.id}-checklist`) ||
                document.querySelector('[role="region"][aria-label="Module Completion Checklist"]');
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }
          }}
          onNextModule={
            layoutProps.nextRecommended && layoutProps.onSelectNextModule
              ? () => layoutProps.onSelectNextModule!(layoutProps.nextRecommended!.module)
              : layoutProps.onBackToMap
          }
        />
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 py-10">
        {/* Student Account Status / Registration Header */}
        {!isLoggedIn ? (
          <StudentRegistrationBanner onOpenGuestSettings={() => setShowProfileModal(true)} />
        ) : (
          <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-slate-900/90 via-cyan-950/20 to-slate-900/90 p-4 sm:p-5 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-cyan-950/20">
            <div className="flex items-center gap-3.5">
              <div className="size-11 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 flex-shrink-0">
                <GraduationCap className="size-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-white">{profile.display_name}</span>
                  <span className="text-[11px] font-mono font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                    {profile.student_public_id}
                  </span>
                  <span className="text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Shield className="size-3" />
                    Verified Student
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Curriculum depth:{" "}
                  <strong className="text-slate-200">{LEARNING_LEVELS[selectedLevel]?.name}</strong>{" "}
                  • Privacy: <span className="capitalize">{profile.profile_visibility}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowProfileModal(true)}
                className="border-white/20 text-slate-200 hover:text-white hover:bg-white/10"
              >
                <User className="size-3.5 mr-1.5 text-cyan-400" />
                <span>Student Settings & Privacy</span>
              </Button>
            </div>
          </div>
        )}

        {/* Accessibility & Learning Level Selector Section */}
        <section className="space-y-4">
          <AccessibilityControls settings={settings} onUpdateSettings={setSettings} />
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl">
            <LearningLevelSelector currentLevel={selectedLevel} onSelectLevel={handleLevelSelect} />
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
              {primaryRecommendation.module.id === "13" ? (
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
              ) : ACTIVE_MODULE_IDS.includes(primaryRecommendation.module.id) ? (
                <Button
                  size="lg"
                  onClick={() => handleSelectModule(primaryRecommendation.module)}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold shadow-md shadow-cyan-500/25 border-none"
                >
                  <span>Start Module {primaryRecommendation.module.id}</span>
                  <ArrowRight className="size-4 ml-2" />
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
            profile={profile}
            isLoggedIn={isLoggedIn}
            onOpenProfile={() => setShowProfileModal(true)}
            reducedMotion={settings.reducedMotion}
            onSelectModule={handleSelectModule}
          />
          <AchievementDisplay
            unlockedIds={progress.achievements}
            stageBadges={progress.stageBadges}
            verifiedModules={progress.verifiedModules}
            profile={profile}
            reducedMotion={settings.reducedMotion}
            onSelectModule={handleSelectModule}
          />
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

          {/* 5. Stage 6 Capstone: Cosmic Explorer Final Knowledge Assessment */}
          <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-950/20 via-slate-900 to-slate-950 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-mono font-bold">
                  CURRICULUM CAPSTONE EVALUATION
                </span>
                <span className="text-xs font-mono text-slate-400">20 Questions • 6 Stages</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                Cosmic Explorer — Final Knowledge Assessment
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Evaluates comprehensive scientific reasoning across all 24 modules and 6 celestial
                stages. Features age-adaptive tiers, server-side grading, and unlocks the official
                verifiable credential upon achieving 80% (16/20).
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-400">
                <span className="flex items-center gap-1 text-emerald-400">
                  <ShieldCheck className="size-3.5" />
                  Authoritative Verification
                </span>
                <span>•</span>
                <span>Minimum passing score: 80% (16 / 20)</span>
                <span>•</span>
                <span>Non-generative accessible narration</span>
              </div>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Button
                onClick={() => setShowFinalExam(true)}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 shadow-lg shadow-amber-500/20 w-full sm:w-auto"
              >
                <Award className="size-4 mr-2" />
                Launch Assessment
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-white/10 text-slate-300 hover:text-white w-full sm:w-auto"
              >
                <Link to="/exam">Dedicated Exam Page</Link>
              </Button>
            </div>
          </div>
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

      {/* Student Account & Profile Management Modal */}
      <StudentProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        profile={profile}
        isLoggedIn={isLoggedIn}
        onSaveProfile={updateProfile}
        onSignOut={signOut}
        onSelectLevel={handleLevelSelect}
      />
    </div>
  );
}
