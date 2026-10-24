// @ts-nocheck
import React, { useState, useRef, useEffect, lazy, Suspense } from "react";
import { ACADEMY_STAGES, ACADEMY_MODULES, LEARNING_LEVELS } from "@/lib/academy/registry";
import { MODULE_01_LESSON } from "@/lib/academy/lessons/module-01-our-place";
import { useAcademyProgress } from "@/lib/academy/progress";
import { getAdaptiveRecommendations } from "@/lib/academy/recommendations";
import type { AcademySettings, LearningLevel, ModuleContract } from "@/lib/academy/types";
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
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Sparkles,
  ArrowUpRight,
  X,
  ExternalLink,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Orbit,
  User,
  Shield,
  Award,
} from "lucide-react";
import { CosmosCompanion } from "./CosmosCompanion";
import { CosmosGuidedController } from "./CosmosGuidedController";
import { CosmicCertificateModal } from "./CosmicCertificateModal";
import { CosmosLearningDirector } from "@/lib/cosmos/CosmosLearningDirector";
import { CosmosLearningSessionManager } from "@/lib/cosmos/CosmosLearningSessionManager";
import type { CosmosLearningSessionRecord } from "@/lib/cosmos/learning-director-types";
import {
  CosmosCinematicPlayer,
  EnterCinematicModeButton,
} from "./cinematic/CosmosCinematicPlayer";
import { CosmicBackgroundCanvas } from "@/components/site/CosmicBackgroundCanvas";
import { ScrollScrubVideoCanvas } from "@/components/site/ScrollScrubVideoCanvas";

const KERR_ACCRETION_VIDEO_2 =
  "/assets/aistudio/Rotating_Kerr_black_hole_visuali__1080p_20261024024506_51d485ff.mp4";
const KERR_ACCRETION_MOBILE_2 = "/assets/aistudio/kerr2_mobile.mp4";
const KERR_ACCRETION_POSTER_2 = "/assets/aistudio/kerr2_poster.jpg";

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = (x: number) => {
  const c = clamp(x, 0, 1);
  return c * c * (3 - 2 * c);
};

function AcademyAccretionChapter({
  registerListener,
  onStartStages,
  onOpenExam,
  onOpenCertificates,
}: {
  registerListener: (fn: (smoothedProgress: number, rawProgress: number) => void) => () => void;
  onStartStages: () => void;
  onOpenExam: () => void;
  onOpenCertificates: () => void;
}) {
  const beat1Ref = useRef<HTMLDivElement | null>(null);
  const beat2Ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return registerListener((pr) => {
      const cop1 = pr > 0.52 ? 0 : smooth(1 - pr / 0.48);
      const cop2 = pr < 0.44 ? 0 : smooth((pr - 0.44) / 0.25);

      if (beat1Ref.current) {
        beat1Ref.current.style.opacity = String(cop1);
        beat1Ref.current.style.transform = reduce
          ? "none"
          : `translate3d(0, ${((0.2 - pr) * 7).toFixed(2)}vh, 0)`;
        beat1Ref.current.style.pointerEvents = cop1 > 0.45 ? "auto" : "none";
      }

      if (beat2Ref.current) {
        beat2Ref.current.style.opacity = String(cop2);
        beat2Ref.current.style.transform = reduce
          ? "none"
          : `translate3d(0, ${((0.78 - pr) * 7).toFixed(2)}vh, 0)`;
        beat2Ref.current.style.pointerEvents = cop2 > 0.45 ? "auto" : "none";
      }
    });
  }, [registerListener]);

  return (
    <div className="mx-auto flex h-full max-w-7xl flex-col justify-center px-6 lg:px-10">
      <div className="relative flex min-h-[300px] w-full items-center">
        {/* Beat 1: Interactive 3D Physics Laboratories */}
        <div
          ref={beat1Ref}
          className="max-w-lg rounded-3xl border border-white/[0.12] bg-[#05060a]/75 p-9 backdrop-blur-2xl will-change-[opacity,transform]"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#f5d08a]">
            01 / 02 · RELATIVISTIC LABORATORIES
          </p>
          <h2
            className="mt-3 text-3xl font-medium uppercase leading-tight text-white sm:text-4xl"
            style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
          >
            Experiment With Spacetime.
          </h2>
          <p className="mt-3 text-sm font-light leading-relaxed text-white/75">
            Manipulate orbital mechanics, blackbody spectra, gravitational wave chirps, and
            relativistic accretion disks directly inside your browser.
          </p>
        </div>

        {/* Beat 2: Capstone Assessment & Certification */}
        <div
          ref={beat2Ref}
          style={{ opacity: 0, pointerEvents: "none" }}
          className="absolute right-0 max-w-xl rounded-3xl border border-white/[0.14] bg-[#05060a]/80 p-9 backdrop-blur-2xl will-change-[opacity,transform] sm:p-11"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#38bdf8]">
            02 / 02 · AUTHORITATIVE CREDENTIALING
          </p>
          <h3
            className="mt-3 text-3xl font-medium uppercase text-white sm:text-4xl"
            style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
          >
            Earn Your Cosmic Explorer Credential.
          </h3>
          <p className="mt-3 text-sm font-light leading-relaxed text-white/75">
            Complete all 24 modules across 6 celestial stages and pass the 20-question Capstone
            Evaluation to unlock your verifiable certificate.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onStartStages}
              className="group inline-flex h-11 items-center gap-3 rounded-full bg-[#f5d08a] pl-5 pr-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#05060a] transition-all hover:bg-white"
            >
              <span>Browse 24 Modules</span>
              <span className="flex size-8 items-center justify-center rounded-full bg-[#05060a] text-[#f5d08a] transition-transform duration-300 group-hover:rotate-45">
                <ArrowUpRight className="size-4" />
              </span>
            </button>
            <button
              type="button"
              onClick={onOpenExam}
              className="inline-flex h-11 items-center rounded-full border border-white/15 bg-white/[0.04] px-5 text-xs font-medium uppercase tracking-[0.16em] text-white/85 hover:border-[#f5d08a]/50 hover:text-white"
            >
              Capstone Exam
            </button>
            <button
              type="button"
              onClick={onOpenCertificates}
              className="inline-flex h-11 items-center rounded-full border border-white/15 bg-white/[0.04] px-5 text-xs font-medium uppercase tracking-[0.16em] text-white/80 hover:border-white/35 hover:text-white"
            >
              Certificate Portal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Lazy-loaded module layouts
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
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-8 text-center">
      <div className="relative mb-4">
        <div className="size-12 animate-spin rounded-full border-2 border-[#f5d08a]/20 border-t-[#f5d08a]" />
        <Orbit className="absolute inset-0 m-auto size-5 text-[#f5d08a]" />
      </div>
      <p
        className="text-lg font-normal uppercase tracking-wide text-white"
        style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
      >
        {title}
      </p>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">
        Calibrating physical parameters & celestial coordinates...
      </p>
    </div>
  );
}

function renderActiveModule(moduleId: string, props: any) {
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

  const { profile, isLoggedIn, updateProfile, changeLearningLevel, signOut } = useStudentAuth();

  const [showProfileModal, setShowProfileModal] = useState(false);

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
  const [showCertificateModal, setShowCertificateModal] = useState<boolean>(false);
  const [savedGuidedSession, setSavedGuidedSession] = useState<CosmosLearningSessionRecord | null>(
    null,
  );

  useEffect(() => {
    setSavedGuidedSession(CosmosLearningSessionManager.getSession());
  }, [activeLessonModule]);

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

  useEffect(() => {
    const unregister = CosmosLearningDirector.getInstance().registerModuleNavigationHandler(
      (targetModId) => {
        handleSelectModule(targetModId);
      },
    );
    return () => unregister();
  });

  // Final Exam View
  if (showFinalExam) {
    return (
      <div className="relative min-h-screen bg-[#05060a] text-white">
        <CosmicBackgroundCanvas />
        <div className="relative z-10 space-y-6">
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
      </div>
    );
  }

  // Active Module View
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
        className={`relative min-h-screen bg-[#05060a] text-white ${
          settings.fontSize === "large" ? "text-base" : "text-sm"
        }`}
      >
        <CosmicBackgroundCanvas />
        <div className="relative z-10 mx-auto max-w-6xl space-y-8 px-4 pt-24 pb-28 sm:px-6">
          {/* Dark Observatory Cinematic Learning Banner */}
          <div
            data-testid="module-cinematic-mode-banner"
            className="flex flex-col justify-between gap-4 border border-white/[0.12] bg-[#05060a]/85 p-6 backdrop-blur-2xl sm:flex-row sm:items-center sm:p-8"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-[#f5d08a]">
                <Sparkles className="size-3.5 text-[#f5d08a]" />
                <span>COSMOS CINEMATIC LEARNING SYSTEM</span>
              </div>
              <h2
                className="text-lg font-normal uppercase text-white sm:text-2xl"
                style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
              >
                Module {activeLessonModule.id}: {activeLessonModule.title}
              </h2>
              <p className="text-xs font-light text-white/65">
                Synchronized AI narration, interactive 3D scientific simulations, and live Q&amp;A.
              </p>
            </div>

            <div className="shrink-0">
              <EnterCinematicModeButton
                moduleId={activeLessonModule.id}
                moduleTitle={activeLessonModule.title}
                learningLevel={selectedLevel}
              />
            </div>
          </div>

          {/* Centralized COSMOS AI Astronomy Voice Teacher */}
          <CosmosCompanion
            key={activeLessonModule.id}
            moduleId={activeLessonModule.id}
            moduleTitle={activeLessonModule.title}
            learningLevel={selectedLevel}
            scientificTopic={activeLessonModule.subtitle}
            currentDisplayText={activeLessonModule.description}
            totalSublessons={activeLessonModule.lessons?.length || 6}
          />

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
            if (typeof document !== "undefined") {
              const el = document.querySelector('[data-cosmos-section], section, [role="region"]');
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }
          }}
          onNavigateToSection={() => {
            if (typeof document !== "undefined") {
              const el = document.querySelector("[data-cosmos-section], section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
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

        <CosmosGuidedController />
        <CosmosCinematicPlayer reducedMotion={settings.reducedMotion} />
      </div>
    );
  }

  return (
    <div
      className={`relative min-h-screen bg-[#05060a] text-white selection:bg-[#f5d08a]/30 selection:text-[#f5d08a] ${
        settings.fontSize === "large" ? "text-base" : "text-sm"
      }`}
    >
      {/* Fixed 3D Scroll-Driven WebGL Cosmos Background */}
      <CosmicBackgroundCanvas />

      <div className="relative z-10">
        {/* 01. KERR SINGULARITY SCROLL-SCRUB HERO (VIDEO 1) */}
        <AcademyHero
          onStartExploring={handleScrollToStages}
          onViewMap={handleScrollToMap}
          onOpenExam={() => setShowFinalExam(true)}
        />

        {/* MINIMALIST METRICS HAIRLINE STRIP */}
        <section className="border-y border-white/[0.08] bg-[#05060a]/85 backdrop-blur-2xl">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="grid grid-cols-2 divide-y divide-white/[0.08] sm:grid-cols-4 sm:divide-x sm:divide-y-0">
              {[
                { value: "24", label: "Interactive Modules" },
                { value: "06", label: "Celestial Stages" },
                { value: "03", label: "Cognitive Tiers" },
                { value: "100%", label: "Free Sanctuary" },
              ].map((stat, idx) => (
                <div
                  key={stat.label}
                  className={`py-8 ${idx === 0 ? "sm:pr-8" : "sm:px-8"}`}
                >
                  <p
                    className="text-3xl font-normal tracking-tight text-white sm:text-4xl"
                    style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
                  >
                    {stat.value}
                  </p>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.26em] text-white/45">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* MAIN OBSERVATORY CONSOLE */}
        <div className="mx-auto max-w-7xl space-y-16 px-6 py-20 lg:px-10">
          {/* Student Status & Telemetry Controls */}
          <section className="space-y-4">
            {!isLoggedIn ? (
              <StudentRegistrationBanner onOpenGuestSettings={() => setShowProfileModal(true)} />
            ) : (
              <div className="flex flex-col justify-between gap-4 border border-white/[0.08] bg-[#05060a] p-7 sm:flex-row sm:items-center sm:p-8">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.26em] text-[#f5d08a]">
                      SCHOLAR ACCOUNT · {profile.student_public_id}
                    </span>
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400">
                      <Shield className="size-3" />
                      VERIFIED
                    </span>
                  </div>
                  <h3
                    className="mt-2 text-xl font-normal uppercase text-white sm:text-2xl"
                    style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
                  >
                    {profile.display_name}
                  </h3>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">
                    ACTIVE TIER: {LEARNING_LEVELS[selectedLevel]?.name} · PRIVACY:{" "}
                    {profile.profile_visibility}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowProfileModal(true)}
                  className="inline-flex h-10 items-center gap-2 self-start rounded-full border border-white/15 px-5 font-mono text-[10px] uppercase tracking-[0.2em] text-white/85 transition-colors hover:border-[#f5d08a] hover:text-[#f5d08a] sm:self-auto"
                >
                  <User className="size-3.5 text-[#f5d08a]" />
                  <span>Scholar Settings</span>
                </button>
              </div>
            )}

            <AccessibilityControls settings={settings} onUpdateSettings={setSettings} />
          </section>

          {/* Cognitive Tier Selector */}
          <section>
            <LearningLevelSelector currentLevel={selectedLevel} onSelectLevel={handleLevelSelect} />
          </section>

          {/* Saved Guided Session Resumption */}
          {savedGuidedSession && savedGuidedSession.sessionStatus !== "completed" && (
            <section className="flex flex-col justify-between gap-6 border border-[#f5d08a]/30 bg-[#05060a] p-7 sm:p-9 md:flex-row md:items-center">
              <div>
                <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.26em] text-[#f5d08a]">
                  <span>SAVED SESSION READY</span>
                  <span>•</span>
                  <span className="text-[#38bdf8]">
                    STEP {savedGuidedSession.stepIndex + 1} OF {savedGuidedSession.totalSteps}
                  </span>
                </div>
                <h3
                  className="mt-2 text-2xl font-normal uppercase text-white"
                  style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
                >
                  Resume Module {savedGuidedSession.moduleId}: {savedGuidedSession.moduleTitle}
                </h3>
                <p className="mt-1 font-mono text-xs text-white/60">
                  Last active: {savedGuidedSession.lessonTitle}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  handleSelectModule(savedGuidedSession.moduleId);
                  setTimeout(() => {
                    void CosmosLearningDirector.getInstance().resumeSavedSession(
                      savedGuidedSession.moduleId,
                    );
                  }, 150);
                }}
                className="group inline-flex h-11 shrink-0 items-center gap-3 self-start rounded-full bg-[#f5d08a] pl-5 pr-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#05060a] transition-all hover:bg-white md:self-auto"
              >
                <span>Resume Journey</span>
                <span className="flex size-8 items-center justify-center rounded-full bg-[#05060a] text-[#f5d08a]">
                  <ArrowUpRight className="size-4" />
                </span>
              </button>
            </section>
          )}

          {/* Adaptive Next Recommendation */}
          {primaryRecommendation && (
            <section className="flex flex-col justify-between gap-6 border border-white/[0.08] bg-[#05060a] p-8 sm:p-10 md:flex-row md:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[0.28em]">
                  <span className="text-[#38bdf8]">RECOMMENDED TRAJECTORY</span>
                  <span className="text-white/20">•</span>
                  <span className="text-[#f5d08a]">{primaryRecommendation.badge}</span>
                </div>
                <h3
                  className="mt-3 text-2xl font-normal uppercase tracking-tight text-white sm:text-3xl"
                  style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
                >
                  Module {primaryRecommendation.module.id}: {primaryRecommendation.module.title}
                </h3>
                <p className="mt-2 max-w-2xl text-xs font-light leading-relaxed text-white/65 sm:text-sm">
                  {primaryRecommendation.reason}
                </p>
              </div>

              <div className="shrink-0">
                {primaryRecommendation.module.id === "13" ? (
                  <Link
                    to="/galaxies"
                    className="group inline-flex h-12 items-center gap-3 rounded-full bg-[#f5d08a] pl-6 pr-2 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#05060a] transition-all hover:bg-white"
                  >
                    <span>Explore Galaxies 3D</span>
                    <span className="flex size-8 items-center justify-center rounded-full bg-[#05060a] text-[#f5d08a]">
                      <ArrowUpRight className="size-4" />
                    </span>
                  </Link>
                ) : ACTIVE_MODULE_IDS.includes(primaryRecommendation.module.id) ? (
                  <button
                    type="button"
                    onClick={() => handleSelectModule(primaryRecommendation.module)}
                    className="group inline-flex h-12 items-center gap-3 rounded-full bg-[#f5d08a] pl-6 pr-2 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#05060a] transition-all hover:bg-white"
                  >
                    <span>Start Module {primaryRecommendation.module.id}</span>
                    <span className="flex size-8 items-center justify-center rounded-full bg-[#05060a] text-[#f5d08a] transition-transform duration-300 group-hover:rotate-45">
                      <ArrowUpRight className="size-4" />
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPreviewModule(primaryRecommendation.module)}
                    className="inline-flex h-12 items-center rounded-full border border-white/20 px-6 font-mono text-xs uppercase tracking-[0.2em] text-white hover:border-[#f5d08a]"
                  >
                    Preview Syllabus
                  </button>
                )}
              </div>
            </section>
          )}

          {/* Interactive Cosmic Flightpath Map */}
          <section ref={mapSectionRef}>
            <CosmicLearningMap
              stages={ACADEMY_STAGES}
              progress={progress}
              onSelectStage={handleSelectStage}
            />
          </section>

          {/* Progress Tracking & Achievements Hub */}
          <section className="grid grid-cols-1 gap-8 lg:grid-cols-2">
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
        </div>

        {/* 02. SECOND KERR ACCRETION VIDEO SCROLL CHAPTER (VIDEO 2) */}
        <section className="relative border-y border-white/[0.08]">
          <ScrollScrubVideoCanvas
            videoSrc={KERR_ACCRETION_VIDEO_2}
            mobileVideoSrc={KERR_ACCRETION_MOBILE_2}
            posterSrc={KERR_ACCRETION_POSTER_2}
            scrollHeightVh={280}
            ariaLabel="Relativistic Kerr Black Hole Accretion Torus — Academy Laboratories"
          >
            {({ registerListener }) => (
              <AcademyAccretionChapter
                registerListener={registerListener}
                onStartStages={handleScrollToStages}
                onOpenExam={() => setShowFinalExam(true)}
                onOpenCertificates={() => setShowCertificateModal(true)}
              />
            )}
          </ScrollScrubVideoCanvas>
        </section>

        {/* COMPLETE SIX PROGRESSIVE LEARNING STAGES */}
        <div className="mx-auto max-w-7xl space-y-12 px-6 py-24 lg:px-10">
          <section ref={stagesSectionRef} className="space-y-10">
            <div className="flex flex-col justify-between gap-4 border-b border-white/[0.08] pb-8 md:flex-row md:items-end">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#f5d08a]">
                  COMPLETE SYLLABUS · 24 INTERACTIVE MODULES
                </p>
                <h2
                  className="mt-3 text-3xl font-normal uppercase tracking-tight text-white sm:text-5xl"
                  style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
                >
                  Cosmic Learning Registry
                </h2>
              </div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">
                06 PROGRESSIVE CELESTIAL STAGES · 3 AGE TIERS
              </p>
            </div>

            <div className="space-y-10">
              {ACADEMY_STAGES.map((stage) => (
                <LearningStageCard
                  key={stage.id}
                  stage={stage}
                  progress={progress}
                  onToggleBookmark={toggleBookmark}
                  onSelectModule={handleSelectModule}
                />
              ))}
            </div>

            {/* Stage 6 Capstone: Final Knowledge Assessment */}
            <div className="flex flex-col justify-between gap-8 border border-[#f5d08a]/30 bg-[#05060a] p-8 sm:p-11 md:flex-row md:items-center">
              <div className="max-w-2xl space-y-3">
                <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[0.26em]">
                  <span className="text-[#f5d08a]">CURRICULUM CAPSTONE EVALUATION</span>
                  <span className="text-white/25">•</span>
                  <span className="text-[#38bdf8]">20 QUESTIONS · 80% PASS THRESHOLD</span>
                </div>

                <h3
                  className="text-2xl font-normal uppercase tracking-tight text-white sm:text-4xl"
                  style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
                >
                  Cosmic Explorer — Final Knowledge Assessment
                </h3>

                <p className="text-xs font-light leading-relaxed text-white/65 sm:text-sm">
                  Evaluates scientific reasoning across all 24 modules and 6 celestial stages.
                  Features age-adaptive tiers, server-side grading, and unlocks the official
                  cryptographically verifiable credential.
                </p>
              </div>

              <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setShowFinalExam(true)}
                  className="group inline-flex h-12 items-center justify-center gap-3 rounded-full bg-[#f5d08a] pl-6 pr-2 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#05060a] transition-all hover:bg-white"
                >
                  <Award className="size-4" />
                  <span>Launch Exam</span>
                  <span className="flex size-8 items-center justify-center rounded-full bg-[#05060a] text-[#f5d08a]">
                    <ArrowUpRight className="size-4" />
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowCertificateModal(true)}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-6 font-mono text-xs uppercase tracking-[0.18em] text-white/85 transition-colors hover:border-[#f5d08a] hover:text-[#f5d08a]"
                >
                  <ShieldCheck className="size-4 text-[#f5d08a]" />
                  <span>Certificate Portal</span>
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Official Certificate Modal */}
      <CosmicCertificateModal
        isOpen={showCertificateModal}
        onClose={() => setShowCertificateModal(false)}
        level={selectedLevel}
        completedLabCount={progress.verifiedModules?.length || 0}
      />

      {/* Syllabus Modal */}
      {previewModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xl">
          <div className="relative w-full max-w-2xl border border-white/15 bg-[#05060a] p-7 sm:p-9 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] pb-5">
              <div>
                <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.24em]">
                  <span className="text-[#f5d08a]">MODULE #{previewModule.id}</span>
                  <span className="text-white/25">•</span>
                  <span className="text-[#38bdf8]">STAGE 0{previewModule.stageId}</span>
                </div>
                <h3
                  className="mt-2 text-2xl font-normal uppercase text-white"
                  style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
                >
                  {previewModule.title}
                </h3>
                <p className="mt-1 font-mono text-xs text-white/50">{previewModule.subtitle}</p>
              </div>

              <button
                type="button"
                onClick={() => setPreviewModule(null)}
                className="p-1.5 text-white/40 transition-colors hover:text-white"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-6 max-h-[60vh] space-y-5 overflow-y-auto pr-1">
              <p className="text-sm font-light leading-relaxed text-white/75">
                {previewModule.description}
              </p>

              <div className="border border-white/[0.08] bg-[#070a12] p-5">
                <h4 className="mb-3 font-mono text-[10px] uppercase tracking-[0.24em] text-[#f5d08a]">
                  LEARNING OBJECTIVES
                </h4>
                <ul className="space-y-2 text-xs text-white/75">
                  {previewModule.learningObjectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-[#38bdf8]" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-[1px] border border-white/[0.08] bg-white/[0.08]">
                <div className="bg-[#05060a] p-4">
                  <span className="block font-mono text-[9px] uppercase tracking-[0.22em] text-white/40">
                    ESTIMATED DURATION
                  </span>
                  <span className="mt-1 flex items-center gap-1.5 font-mono text-xs text-white">
                    <Clock className="size-3.5 text-[#f5d08a]" />
                    {previewModule.estimatedMinutes} MINUTES
                  </span>
                </div>
                <div className="bg-[#05060a] p-4">
                  <span className="block font-mono text-[9px] uppercase tracking-[0.22em] text-white/40">
                    COGNITIVE TIERS
                  </span>
                  <span className="mt-1 block font-mono text-xs text-white">
                    {previewModule.difficultyLevels.join(" · ")}
                  </span>
                </div>
              </div>

              {previewModule.scientificSources.length > 0 && (
                <div>
                  <h4 className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">
                    PRIMARY GROUNDING ARCHIVES
                  </h4>
                  <div className="space-y-2">
                    {previewModule.scientificSources.map((src, i) => (
                      <a
                        key={i}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between border border-white/[0.08] bg-[#070a12] p-3 font-mono text-xs text-[#38bdf8] transition-colors hover:border-[#f5d08a] hover:text-[#f5d08a]"
                      >
                        <span className="truncate">{src.title}</span>
                        <ExternalLink className="ml-2 size-3.5 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-white/[0.08] pt-5">
              <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">
                <ShieldCheck className="size-3.5 text-emerald-400" />
                REGISTRY V{previewModule.version}
              </span>
              <button
                type="button"
                onClick={() => setPreviewModule(null)}
                className="rounded-full border border-white/15 px-5 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white hover:border-white/40"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Profile Modal */}
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
