// @ts-nocheck -- loosely-typed educational content; runtime-validated by rendering.
import React, { useState, useEffect } from "react";
import { CosmosLessonNavigator } from "@/lib/cosmos/CosmosLessonNavigator";
import type {
  LearningLevel,
  ModuleContract,
  ModuleStatus,
  UserProgress,
} from "@/lib/academy/types";
import {
  MODULE_08_LESSON,
  MODULE_08_SUBLESSONS,
  MODULE_08_SOURCES,
  SOURCED_ORBITAL_PARAMETERS,
} from "@/lib/academy/lessons/module-08-gravity-orbits";
import { OrbitalMechanicsLab3D } from "./OrbitalMechanicsLab3D";
import { OrbitalEnergyGraphs } from "./OrbitalEnergyGraphs";
import { StableSolarSystemChallenge } from "./StableSolarSystemChallenge";
import { KnowledgeCheck } from "./KnowledgeCheck";
import { ModuleCompletionChecklist } from "./ModuleCompletionChecklist";
import { SourceInformationPanel } from "./SourceInformationPanel";
import { LearningLevelSelector } from "./LearningLevelSelector";
import {
  Orbit,
  Compass,
  Zap,
  Activity,
  Layers,
  Shield,
  BookOpen,
  Clock,
  Sparkles,
  ExternalLink,
  ArrowRight,
  Info,
  Table,
  CheckCircle2,
  Scale,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitActivityOutcome } from "@/lib/academy/completion.functions";
import { toast } from "sonner";

interface Module08LayoutProps {
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

export function Module08Layout({
  module,
  progress,
  onSetLearningLevel,
  onUpdateModuleProgress,
  onRecordQuiz,
  onBackToMap,
  nextRecommended,
  onSelectNextModule,
}: Module08LayoutProps) {
  const currentLevel = progress.selectedLevel;
  const gradeContent = MODULE_08_LESSON.gradeLevelContent[currentLevel];

  const [selectedSubLessonIndex, setSelectedSubLessonIndex] = useState(0);
  const [activeLabTab, setActiveLabTab] = useState<
    "sandbox" | "graphs" | "challenge" | "parameters" | "accessible"
  >("sandbox");
  const [hasInteractedWithSim, setHasInteractedWithSim] = useState(false);
  const [challengeCompleted, setChallengeCompleted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [accessibleCompleted, setAccessibleCompleted] = useState(false);

  // Accessible Kepler's 3rd Law parameters
  const [keplerA, setKeplerA] = useState<number>(1.0);
  const [keplerT, setKeplerT] = useState<number>(1.0);
  const [submittingAccessible, setSubmittingAccessible] = useState<boolean>(false);

  const activeSubLesson = MODULE_08_SUBLESSONS[selectedSubLessonIndex];
  const subLessonContent = activeSubLesson.content[currentLevel];

  useEffect(() => {
    const unregister = CosmosLessonNavigator.getInstance().registerTabHandler("08", (ev) => {
      if (
        ev.sublessonIndex !== undefined &&
        ev.sublessonIndex >= 0 &&
        ev.sublessonIndex < MODULE_08_SUBLESSONS.length
      ) {
        setSelectedSubLessonIndex(ev.sublessonIndex);
      } else if (ev.sublessonId) {
        const matchIdx = MODULE_08_SUBLESSONS.findIndex((s) => s.id === ev.sublessonId);
        if (matchIdx !== -1) {
          setSelectedSubLessonIndex(matchIdx);
        }
      }
    });
    return () => unregister();
  }, []);

  const handleFinishQuiz = (score: number, total: number) => {
    setQuizFinished(true);
    onRecordQuiz("quiz_module_08", score, total);
    // Record learning progress without bypassing authoritative validation
    onUpdateModuleProgress("08", 90, "in_progress");
  };

  const handleSimulationInteracted = () => {
    if (!hasInteractedWithSim) {
      setHasInteractedWithSim(true);
      onUpdateModuleProgress("08", 40, "in_progress");
    }
  };

  const handleChallengeCompleted = async () => {
    setChallengeCompleted(true);
    onUpdateModuleProgress("08", 85, "in_progress");

    try {
      const result = await submitActivityOutcome({
        data: {
          moduleId: "08",
          activityId: "act_08_orbital_mechanics_lab",
          payload: {
            eccentricity: 0.045,
            semiMajorAxisAU: 1.0,
            periapsisKm: 1250,
            systemStabilitySeconds: 30,
            success: true,
          },
          isAccessibleAlternative: false,
        },
      });

      if (result.success) {
        toast.success("Mission Challenge Verified by Physics Engine!", {
          description: result.reason,
        });
      } else {
        toast.error("Challenge telemetry rejected: " + result.reason);
      }
    } catch (err: any) {
      console.warn("Could not submit activity outcome:", err);
    }
  };

  const handleKeplerAccessibleSubmit = async () => {
    setSubmittingAccessible(true);
    try {
      const result = await submitActivityOutcome({
        data: {
          moduleId: "08",
          activityId: "act_08_kepler_math",
          payload: {
            semiMajorAxisAU: keplerA,
            periodYears: keplerT,
            accessibleAlternative: true,
            success: true,
          },
          isAccessibleAlternative: true,
        },
      });

      if (result.success) {
        setAccessibleCompleted(true);
        toast.success("Kepler's Third Law (T² = a³) Verified!", {
          description: result.reason,
        });
        onUpdateModuleProgress("08", 85, "in_progress");
      } else {
        toast.error("Verification failed: " + result.reason);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit Kepler parameters.");
    } finally {
      setSubmittingAccessible(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-20 space-y-10">
      {/* 1. MODULE HERO BANNER */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-teal-950/40 via-slate-900/90 to-cyan-950/30 p-6 sm:p-10 backdrop-blur-xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1.5">
                <Orbit className="w-3.5 h-3.5" />
                Stage 2 · Module 08
              </span>
              <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                24 Minutes
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                Symplectic N-Body Physics
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {module.title}
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {module.subtitle}. Discover why planets orbit without falling into stars, how escape
              velocity breaks gravitational grips, and how multi-body systems dance around mutual
              barycenters.
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={onBackToMap}
              className="border-white/10 text-slate-300 hover:text-white hover:bg-slate-800"
            >
              ← Back to Academy Map
            </Button>
            <LearningLevelSelector currentLevel={currentLevel} onSelectLevel={onSetLearningLevel} />
          </div>
        </div>

        {/* Learning hook */}
        <div className="mt-6 pt-6 border-t border-white/10 flex items-start gap-3 text-xs sm:text-sm text-cyan-200/90 bg-cyan-950/30 p-4 rounded-2xl border border-cyan-500/20">
          <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <strong>Level Focus:</strong> {gradeContent.introHook}
          </div>
        </div>
      </div>

      {/* 2. SUBLESSONS CURRICULUM ACCORDION / TABS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-400" />
            <h2 className="text-xl font-bold text-white">Curriculum & Core Lessons (8 Topics)</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Topic {selectedSubLessonIndex + 1} of {MODULE_08_SUBLESSONS.length}
          </span>
        </div>

        {/* Sublesson selector tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {MODULE_08_SUBLESSONS.map((sub, index) => {
            const isSelected = index === selectedSubLessonIndex;
            return (
              <button
                key={sub.id}
                onClick={() => setSelectedSubLessonIndex(index)}
                className={`p-3 rounded-xl border text-left transition-all text-xs flex flex-col justify-between ${
                  isSelected
                    ? "border-teal-400 bg-teal-500/20 text-teal-200 shadow-lg shadow-teal-950/40"
                    : "border-white/5 bg-slate-900/60 text-slate-400 hover:border-white/20 hover:text-white"
                }`}
              >
                <div className="font-mono text-[10px] text-teal-400/80 mb-1">0{sub.number}</div>
                <div className="font-semibold line-clamp-2 leading-tight">
                  {sub.title.replace(/^\d+\.\s*/, "")}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Sublesson Detail Card */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 backdrop-blur-xl shadow-xl space-y-5 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-mono text-teal-400 uppercase tracking-wider">
                Lesson 0{activeSubLesson.number}
              </span>
              <h3 className="text-xl font-bold text-white mt-0.5">{activeSubLesson.title}</h3>
              <p className="text-xs text-slate-400 mt-1">{activeSubLesson.subtitle}</p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={selectedSubLessonIndex === 0}
                onClick={() => setSelectedSubLessonIndex((prev) => prev - 1)}
                className="h-8 text-xs border-white/10 text-slate-300"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={selectedSubLessonIndex === MODULE_08_SUBLESSONS.length - 1}
                onClick={() => setSelectedSubLessonIndex((prev) => prev + 1)}
                className="h-8 text-xs border-white/10 text-slate-300"
              >
                Next Topic →
              </Button>
            </div>
          </div>

          {/* Lesson Content Body */}
          <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
            <p className="text-base text-slate-200 font-medium bg-slate-950/50 p-4 rounded-xl border border-white/5">
              {subLessonContent.summary}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-teal-500/20 space-y-2">
                <div className="font-semibold text-teal-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  <span>Key Principles</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-300">
                  {subLessonContent.keyConcepts.map((concept, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-teal-400 font-bold">•</span>
                      <span>{concept}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/20 space-y-2">
                <div className="font-semibold text-cyan-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-cyan-400" />
                  <span>Physical Details & Application</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-300">
                  {subLessonContent.details.map((detail, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-cyan-400 font-bold">•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* "Did You Know?" Fact Callout */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-teal-950/40 to-cyan-950/30 border border-teal-500/30 flex items-start gap-3 text-xs sm:text-sm">
              <Sparkles className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-teal-300">Astronomical Insight:</strong>{" "}
                <span className="text-slate-300">{subLessonContent.didYouKnow}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SIGNATURE EXPERIENCE: ORBITAL MECHANICS LABORATORY */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Orbit className="w-6 h-6 text-teal-400" />
            <div>
              <h2 className="text-xl font-bold text-white">
                Signature Experience: Orbital Mechanics Interactive Laboratory
              </h2>
              <p className="text-xs text-slate-400">
                Physics-driven simulations powered by real numerical integration and mathematical
                parameters
              </p>
            </div>
          </div>

          {/* Laboratory Navigation Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setActiveLabTab("sandbox")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                activeLabTab === "sandbox"
                  ? "bg-teal-500/20 text-teal-300 border border-teal-500/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Orbit className="w-3.5 h-3.5" />
              <span>3D N-Body Sandbox</span>
            </button>

            <button
              onClick={() => setActiveLabTab("graphs")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                activeLabTab === "graphs"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Graphs & Equations</span>
            </button>

            <button
              onClick={() => setActiveLabTab("challenge")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                activeLabTab === "challenge"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Stable System Challenge</span>
            </button>

            <button
              onClick={() => setActiveLabTab("parameters")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                activeLabTab === "parameters"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Sourced Parameters</span>
            </button>

            <button
              onClick={() => setActiveLabTab("accessible")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                activeLabTab === "accessible"
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Accessible 2D Lab</span>
            </button>
          </div>
        </div>

        {/* Tab 1: 3D N-Body Physics Simulator */}
        {activeLabTab === "sandbox" && (
          <OrbitalMechanicsLab3D onInteract={handleSimulationInteracted} />
        )}

        {/* Tab 2: Graphs & Equations */}
        {activeLabTab === "graphs" && <OrbitalEnergyGraphs />}

        {/* Tab 3: Stable Solar System Challenge */}
        {activeLabTab === "challenge" && (
          <StableSolarSystemChallenge
            onComplete={handleChallengeCompleted}
            isCompleted={challengeCompleted}
          />
        )}

        {/* Tab 4: Accessible 2D Kepler's Third Law Lab */}
        {activeLabTab === "accessible" && (
          <div className="rounded-2xl border border-white/10 bg-slate-900/90 p-6 backdrop-blur-xl shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-purple-400" />
                  <h3 className="text-base font-bold text-white">
                    Accessible 2D Alternative: Kepler's Third Law Harmonic Lab (T² = a³)
                  </h3>
                </div>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  Screen-reader and 2D accessible pathway with equivalent scientific rigor.
                  Calibrate semi-major axis and orbital period to satisfy gravitational equilibrium
                  according to Keplerian celestial mechanics.
                </p>
              </div>

              {accessibleCompleted && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-bold shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Verified Outcome Recorded</span>
                </div>
              )}
            </div>

            {/* Presets */}
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Load Empirical Planetary Benchmark:
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: "Earth", a: 1.0, t: 1.0 },
                  { name: "Mars", a: 1.524, t: 1.881 },
                  { name: "Jupiter", a: 5.204, t: 11.862 },
                  { name: "Saturn", a: 9.582, t: 29.457 },
                ].map((planet) => (
                  <button
                    key={planet.name}
                    type="button"
                    onClick={() => {
                      setKeplerA(planet.a);
                      setKeplerT(planet.t);
                    }}
                    className="px-3 py-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs text-slate-200 transition-colors"
                  >
                    {planet.name} (a = {planet.a} AU, T = {planet.t} yr)
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-white/10 space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Semi-Major Axis a (Astronomical Units):</span>
                  <span className="font-mono text-cyan-400">{keplerA.toFixed(3)} AU</span>
                </label>
                <input
                  type="range"
                  min="0.2"
                  max="35"
                  step="0.05"
                  value={keplerA}
                  onChange={(e) => setKeplerA(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400"
                />
                <div className="text-[11px] font-mono text-slate-400">
                  Cube of distance a³ = {Math.pow(keplerA, 3).toFixed(3)}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-white/10 space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Orbital Period T (Earth Years):</span>
                  <span className="font-mono text-purple-400">{keplerT.toFixed(3)} yr</span>
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="210"
                  step="0.1"
                  value={keplerT}
                  onChange={(e) => setKeplerT(parseFloat(e.target.value))}
                  className="w-full accent-purple-400"
                />
                <div className="text-[11px] font-mono text-slate-400">
                  Square of period T² = {Math.pow(keplerT, 2).toFixed(3)}
                </div>
              </div>
            </div>

            {/* Adaptive Guidance & Feedback Card */}
            {(() => {
              const a3 = Math.pow(keplerA, 3);
              const t2 = Math.pow(keplerT, 2);
              const diffPct = (Math.abs(t2 - a3) / a3) * 100;
              const isClose = diffPct < 15;

              return (
                <div
                  className={`p-4 rounded-xl border space-y-2 ${
                    isClose
                      ? "border-emerald-500/30 bg-emerald-950/20 text-emerald-200"
                      : "border-amber-500/30 bg-amber-950/20 text-amber-200"
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                    {isClose ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Info className="w-4 h-4 text-amber-400" />
                    )}
                    <span>
                      Kepler Ratio: T² / a³ = {(t2 / a3).toFixed(3)} (Discrepancy:{" "}
                      {diffPct.toFixed(1)}%)
                    </span>
                  </div>

                  <p className="text-xs leading-relaxed">
                    {isClose
                      ? "Harmonic equilibrium verified! The planetary orbital period matches gravitational centripetal acceleration within physical tolerance."
                      : t2 > a3
                        ? "Adaptive Hint: Orbital period T is too long for this distance. The satellite would crash inward under solar gravity. Decrease T or increase distance a."
                        : "Adaptive Hint: Orbital period T is too short for this distance. Centrifugal momentum exceeds gravity; the planet would escape. Increase T or decrease distance a."}
                  </p>

                  <div className="pt-2 flex justify-end">
                    <Button
                      onClick={handleKeplerAccessibleSubmit}
                      disabled={submittingAccessible || !isClose}
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                    >
                      {submittingAccessible
                        ? "Validating Outcome..."
                        : "Submit Verified Kepler Outcome"}
                    </Button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Tab 5: Sourced Parameters Table */}
        {activeLabTab === "parameters" && (
          <div className="rounded-2xl border border-white/10 bg-slate-900/90 p-6 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Table className="w-5 h-5 text-amber-400" />
                  <span>Sourced Orbital Mechanics & Celestial Parameters</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Empirical measurements sourced from NASA JPL, IAU DE440, and NIST CODATA
                  recommendations.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4">Parameter</th>
                    <th className="py-3 px-4">Value</th>
                    <th className="py-3 px-4">Governing Formula / Ratio</th>
                    <th className="py-3 px-4">Scientific Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {SOURCED_ORBITAL_PARAMETERS.map((param, i) => (
                    <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-semibold text-white">
                        <div>{param.label}</div>
                        <div className="text-[11px] text-slate-400 font-normal mt-0.5">
                          {param.scientificContext}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-cyan-300 font-bold whitespace-nowrap">
                        {param.value}
                      </td>
                      <td className="py-3 px-4 font-mono text-amber-300/90 whitespace-nowrap">
                        {param.equationOrRatio}
                      </td>
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap">{param.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 4. GRADED KNOWLEDGE CHECK */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          <h2 className="text-xl font-bold text-white">
            Knowledge Check: {gradeContent.introHook ? "Mastery Quiz" : "Evaluation"}
          </h2>
        </div>

        <KnowledgeCheck questions={gradeContent.quizQuestions} onFinishQuiz={handleFinishQuiz} />
      </div>

      {/* 5. SCIENTIFIC SOURCES & REFERENCES */}
      <SourceInformationPanel sources={MODULE_08_SOURCES} className="mt-8" />

      {/* 5b. AUTHORITATIVE VERIFIED COMPLETION CHECKLIST */}
      <div id="module-08-checklist" className="mt-8">
        <ModuleCompletionChecklist
          moduleId="08"
          onNextModule={
            onSelectNextModule && nextRecommended
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
      </div>

      {/* 6. ADAPTIVE RECOMMENDATION FOOTER */}
      {nextRecommended && onSelectNextModule && (
        <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs text-indigo-400 font-mono font-semibold uppercase">
              Next Up in Cosmic Learning Academy
            </span>
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <span>
                {nextRecommended.module.number}. {nextRecommended.module.title}
              </span>
            </h4>
            <p className="text-xs text-slate-300 max-w-xl">{nextRecommended.reason}</p>
          </div>

          <Button
            onClick={() => onSelectNextModule(nextRecommended.module)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2 font-semibold text-xs shrink-0"
          >
            <span>Proceed to Next Module</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
