/**
 * COSMOS Cinematic Overlay Interface
 * Project: Our Visible Universe Academy
 * Scope: Prompt 03 — Sections 12, 15, 16, 17, 18
 *
 * Implements the translucent observatory overlay architecture:
 * - TOP LEFT: Our Visible Universe Academy identity, current module & chapter title, epistemic representation badge
 * - TOP RIGHT: Fullscreen/Fallback status indicator, Captions toggle, Quality indicator, Exit Cinematic Mode
 * - CENTER / SIDE: Non-intrusive scientific annotations, selected object telemetry inspector,
 *   Activity Guided Interaction Drawer (CosmosActivityGuide), Quiz & Official Exam Overlay (CosmosQuizGuide),
 *   and Context-Preserving Student Question & Answer Card.
 */

import React, { useEffect, useMemo, useState } from "react";
import {
  Sparkles,
  Minimize2,
  Maximize2,
  ShieldCheck,
  Target,
  CheckCircle2,
  Circle,
  HelpCircle,
  Volume2,
  CornerDownRight,
  Crosshair,
  ExternalLink,
  AlertCircle,
  FileCheck2,
  Sliders,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CinematicPlayerStateSnapshot } from "@/lib/cosmos/cinematic/CosmosCinematicPlayerState";
import type { CinematicSceneDescriptor } from "@/lib/cosmos/cinematic/CosmosCinematicSceneRegistry";
import { CosmosCinematicAssetManager } from "@/lib/cosmos/cinematic/assets";
import {
  CosmosChapterInteractionStore,
  CosmosProofOfConceptCatalog,
} from "@/lib/cosmos/cinematic/poc";
import type { DirectorStateSnapshot } from "@/lib/cosmos/learning-director-types";

interface CosmosCinematicOverlayProps {
  snapshot: CinematicPlayerStateSnapshot;
  directorSnapshot: DirectorStateSnapshot;
  scene: CinematicSceneDescriptor;
  onExitCinematicMode: () => void;
  onRequestNativeFullscreen: () => void;
  onSelectObject: (objectId: string | null) => void;
  onResumeAfterQuestion: () => void;
  onDemonstrateActivityControl: () => void;
  onRequestHint: () => void;
  onVerifyActivity: () => void;
  onOpenRealActivityInLesson: () => void;
  onSelectQuizOption: (idx: number) => void;
  onConfirmQuizAnswer: () => void;
  onReadQuizQuestionAloud: () => void;
}

export function CosmosCinematicOverlay({
  snapshot,
  directorSnapshot,
  scene,
  onExitCinematicMode,
  onRequestNativeFullscreen,
  onSelectObject,
  onResumeAfterQuestion,
  onDemonstrateActivityControl,
  onRequestHint,
  onVerifyActivity,
  onOpenRealActivityInLesson,
  onSelectQuizOption,
  onConfirmQuizAnswer,
  onReadQuizQuestionAloud,
}: CosmosCinematicOverlayProps) {
  const selectedObj = scene.objects.find((o) => o.objectId === snapshot.selectedObjectId) || null;
  const activityState = directorSnapshot.activeActivityState;
  const quizState = directorSnapshot.activeQuizState;
  const activeQuizQuestion =
    quizState && quizState.questions.length > 0
      ? quizState.questions[quizState.activeQuestionIndex]
      : null;

  const [showAssetCredits, setShowAssetCredits] = useState(false);
  const [showChapterLab, setShowChapterLab] = useState(true);
  const moduleAssetCredits = useMemo(
    () => CosmosCinematicAssetManager.getInstance().getModuleAttributions(snapshot.currentModuleId),
    [snapshot.currentModuleId],
  );

  // Proof-of-Concept 22-Chapter Manifest & Live Interactive Store (Modules 01, 08, 14)
  const pocChapter = useMemo(() => {
    if (!CosmosProofOfConceptCatalog.isProofOfConceptModule(snapshot.currentModuleId)) {
      return null;
    }
    const cleanChapterId = snapshot.currentLessonId.replace(
      new RegExp(`^${snapshot.currentModuleId}-`),
      "",
    );
    return CosmosProofOfConceptCatalog.getChapterManifest(snapshot.currentModuleId, cleanChapterId);
  }, [snapshot.currentLessonId, snapshot.currentModuleId]);

  const pocBeatResolution = useMemo(() => {
    if (!pocChapter || !snapshot.currentSegmentId) return null;
    return CosmosProofOfConceptCatalog.getBeatForNarrationSegment(
      pocChapter.moduleId,
      pocChapter.chapterId,
      snapshot.currentSegmentId,
    );
  }, [pocChapter, snapshot.currentSegmentId]);

  const [chapterControlValues, setChapterControlValues] = useState<
    Record<string, number | boolean | string>
  >(() =>
    pocChapter
      ? CosmosChapterInteractionStore.getInstance().getChapterValues(
          pocChapter.moduleId,
          pocChapter.chapterId,
        )
      : {},
  );

  useEffect(() => {
    if (!pocChapter) return;
    const store = CosmosChapterInteractionStore.getInstance();
    setChapterControlValues(store.getChapterValues(pocChapter.moduleId, pocChapter.chapterId));
    return store.subscribe(() => {
      setChapterControlValues(store.getChapterValues(pocChapter.moduleId, pocChapter.chapterId));
    });
  }, [pocChapter]);

  const liveChapterTelemetry = useMemo(() => {
    if (!pocChapter) return [];
    return CosmosChapterInteractionStore.getInstance().computeChapterLiveTelemetry(
      pocChapter.moduleId,
      pocChapter.chapterId,
      snapshot.learningLevel,
    );
  }, [pocChapter, chapterControlValues, snapshot.learningLevel]);

  const isActivityActive = snapshot.interactionState === "ACTIVITY_REQUIRED";
  const isQuizActive =
    snapshot.interactionState === "QUIZ_REQUIRED" ||
    snapshot.interactionState === "OFFICIAL_EXAM_ACTIVE";

  return (
    <div className="pointer-events-none flex-1 flex flex-col justify-between w-full max-w-7xl mx-auto px-3 sm:px-6 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2">
      {/* =====================================================================
          TOP BAR: Academy Identity + Module/Chapter Context (Left) & Status/Exit (Right)
         ===================================================================== */}
      <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pointer-events-auto">
        {/* TOP LEFT: Identity & Active Curriculum Coordinates */}
        <div className="bg-[#050914]/85 backdrop-blur-md border border-white/15 px-4 py-2.5 max-w-xl">
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-cyan-400">
            <span className="flex items-center gap-1 font-bold">
              <Sparkles className="size-3 text-cyan-400" />
              <span>Our Visible Universe Academy</span>
            </span>
            <span>•</span>
            <span className="text-slate-300">Module {snapshot.currentModuleId}</span>
            <span>•</span>
            <span className="text-amber-300 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.2">
              {snapshot.scientificRepresentation.replace(/_/g, " ")}
            </span>
          </div>

          <h1
            data-testid="cinematic-module-title"
            className="text-sm sm:text-base font-bold text-white tracking-tight mt-0.5 truncate"
          >
            {snapshot.currentModuleTitle}
          </h1>
          <p
            data-testid="cinematic-chapter-title"
            className="text-xs text-cyan-200/90 font-medium truncate"
          >
            {pocChapter ? `Chapter ${pocChapter.chapterCode}: ` : "Chapter: "}
            {snapshot.currentChapterTitle}
            {pocBeatResolution
              ? ` • Beat ${pocBeatResolution.beat.beatIndex + 1}/${pocChapter?.visualBeats.length || 2} (${pocBeatResolution.beat.title})`
              : ""}
          </p>
          {pocChapter && (
            <p
              data-testid="cinematic-scientific-review-disclosure"
              className="text-[10px] font-mono text-slate-400 truncate mt-0.5"
            >
              {pocChapter.scientificRepresentation.replace(/_/g, " ")} •{" "}
              {pocChapter.representationDisclosure}
            </p>
          )}
        </div>

        {/* TOP RIGHT: Fullscreen/Fallback Indicator, Cue Telemetry & Exit Action */}
        <div className="flex flex-wrap items-center gap-2 self-end sm:self-start">
          {/* Explicit Fullscreen vs Viewport Fallback Status Badge (Never claims native FS when in fallback) */}
          <div
            data-testid="cinematic-fullscreen-status"
            className="bg-[#050914]/85 backdrop-blur-md border border-white/15 px-3 py-2 text-[11px] font-mono flex items-center gap-2 text-slate-200"
          >
            <span
              className={`size-2 rounded-full ${
                snapshot.fullscreenState === "NATIVE_FULLSCREEN" ? "bg-emerald-400" : "bg-cyan-400"
              }`}
            />
            <span>
              {snapshot.fullscreenState === "NATIVE_FULLSCREEN"
                ? "Native Fullscreen"
                : "Full-Viewport Mode"}
            </span>
            {snapshot.fullscreenState !== "NATIVE_FULLSCREEN" && (
              <button
                type="button"
                onClick={onRequestNativeFullscreen}
                className="ml-1 text-cyan-300 hover:text-white underline flex items-center gap-1"
                title="Request Browser Native Fullscreen"
              >
                <Maximize2 className="size-3" />
                <span className="hidden md:inline">Fullscreen</span>
              </button>
            )}
          </div>

          {/* Primary Top-Right Exit Cinematic Mode Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onExitCinematicMode}
            aria-label="Exit Cinematic Mode"
            data-testid="cinematic-btn-exit-top"
            className="bg-[#050914]/90 hover:bg-rose-950/80 border-white/25 hover:border-rose-400 text-white rounded-none h-9 px-3.5 text-xs font-semibold"
          >
            <Minimize2 className="size-3.5 mr-1.5 text-cyan-400" />
            <span>Exit Cinematic Mode</span>
          </Button>
        </div>
      </header>

      {/* =====================================================================
          MIDDLE VIEWPORT AREA: Object Selector Pills, Scientific Telemetry Card,
          Activity Gate Overlay, Quiz Overlay, and Q&A Interruption Card
         ===================================================================== */}
      <div className="my-auto py-4 flex flex-col lg:flex-row items-start justify-between gap-4">
        {/* LEFT COLUMN: Quick Scene Object Focus Selector & Scale Disclosure */}
        <div className="space-y-2.5 max-w-xs pointer-events-auto">
          {snapshot.scientificLabelsEnabled && (
            <div
              role="region"
              aria-label="Scene Celestial Objects"
              className="bg-[#050914]/80 backdrop-blur-md border border-white/15 p-3 space-y-2"
            >
              <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-cyan-400">
                <span className="flex items-center gap-1">
                  <Crosshair className="size-3" />
                  <span>Focus Scientific Object</span>
                </span>
                <span>{scene.objects.length} Bodies</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {scene.objects.map((obj) => {
                  const isHighlighted = snapshot.activeHighlightedObjects.includes(obj.objectId);
                  const isSelected = snapshot.selectedObjectId === obj.objectId;
                  return (
                    <button
                      key={obj.objectId}
                      type="button"
                      onClick={() => onSelectObject(isSelected ? null : obj.objectId)}
                      className={`px-2.5 py-1 text-xs font-mono border transition-colors ${
                        isSelected
                          ? "bg-cyan-500 text-slate-950 border-cyan-300 font-bold"
                          : isHighlighted
                            ? "bg-cyan-950/70 text-cyan-200 border-cyan-400/60"
                            : "bg-white/5 text-slate-300 border-white/10 hover:border-white/30 hover:text-white"
                      }`}
                    >
                      {obj.name}
                    </button>
                  );
                })}
              </div>

              {snapshot.scaleAdjustmentNotice && (
                <div className="pt-2 border-t border-white/10 text-[11px] text-slate-400 leading-snug flex items-start gap-1.5">
                  <AlertCircle className="size-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>{snapshot.scaleAdjustmentNotice}</span>
                </div>
              )}

              {/* Public Scientific Asset Credits & License Provenance Toggle (Prompt 06 Section 7) */}
              <div className="pt-2 border-t border-white/10">
                <button
                  type="button"
                  data-testid="cinematic-asset-credits-toggle"
                  onClick={() => setShowAssetCredits((prev) => !prev)}
                  className="w-full flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-cyan-300 hover:text-white"
                >
                  <span className="flex items-center gap-1">
                    <FileCheck2 className="size-3 text-emerald-400" />
                    <span>3D Asset Credits & Provenance ({moduleAssetCredits.length})</span>
                  </span>
                  <span>{showAssetCredits ? "Hide" : "Inspect"}</span>
                </button>

                {showAssetCredits && (
                  <div
                    data-testid="cinematic-asset-credits-panel"
                    className="mt-2 space-y-2 max-h-48 overflow-y-auto pr-1 text-[10px] text-slate-300 border-t border-white/10 pt-2"
                  >
                    {moduleAssetCredits.map((credit) => (
                      <div
                        key={credit.assetId}
                        className="space-y-0.5 bg-white/[0.03] p-2 border border-white/10"
                      >
                        <div className="font-semibold text-white">{credit.displayName}</div>
                        <div className="text-slate-400">{credit.sourceOrganization}</div>
                        <div className="text-slate-300 leading-snug">
                          {credit.formattedCreditLine}
                        </div>
                        <div className="text-amber-300/90 font-mono text-[9px]">
                          License: {credit.licenseIdentifier} • {credit.noEndorsementNotice}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Selected Object Verified Physical Metrics Card */}
          {selectedObj && (
            <div
              data-testid="cinematic-object-inspector"
              className="bg-[#050914]/90 backdrop-blur-xl border border-cyan-400/50 p-3.5 space-y-2 text-xs shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">{selectedObj.name}</span>
                <button
                  type="button"
                  onClick={() => onSelectObject(null)}
                  className="text-[10px] font-mono text-slate-400 hover:text-white"
                >
                  Close
                </button>
              </div>
              <div className="space-y-1 font-mono text-[11px]">
                {selectedObj.physicalMetrics.mass && (
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-400">Mass:</span>
                    <span className="text-slate-100 text-right">
                      {selectedObj.physicalMetrics.mass}
                    </span>
                  </div>
                )}
                {selectedObj.physicalMetrics.radius && (
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-400">Radius:</span>
                    <span className="text-slate-100 text-right">
                      {selectedObj.physicalMetrics.radius}
                    </span>
                  </div>
                )}
                {selectedObj.physicalMetrics.distance && (
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-400">Orbit/Dist:</span>
                    <span className="text-cyan-300 text-right">
                      {selectedObj.physicalMetrics.distance}
                    </span>
                  </div>
                )}
                {selectedObj.physicalMetrics.temperature && (
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-400">Temp:</span>
                    <span className="text-amber-300 text-right">
                      {selectedObj.physicalMetrics.temperature}
                    </span>
                  </div>
                )}
                {selectedObj.physicalMetrics.equation && (
                  <div className="pt-1 border-t border-white/10 text-emerald-300">
                    {selectedObj.physicalMetrics.equation}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Proof-of-Concept Interactive Chapter Controls & Real-Time Physics Telemetry (Modules 01, 08, 14) */}
          {pocChapter && (
            <div
              role="region"
              aria-label="Interactive Chapter Laboratory Controls"
              data-testid="cinematic-chapter-interactive-panel"
              className="bg-[#050914]/88 backdrop-blur-md border border-cyan-500/35 p-3 space-y-2.5 text-xs shadow-xl"
            >
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setShowChapterLab((prev) => !prev)}
                  className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-300 hover:text-white"
                >
                  <Sliders className="size-3 text-cyan-400" />
                  <span>Chapter {pocChapter.chapterCode} Interactive Parameters</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    data-testid="cinematic-btn-reset-chapter-controls"
                    onClick={() =>
                      CosmosChapterInteractionStore.getInstance().resetChapterDefaults(
                        pocChapter.moduleId,
                        pocChapter.chapterId,
                      )
                    }
                    className="text-[10px] font-mono text-slate-400 hover:text-cyan-300 flex items-center gap-0.5"
                    title="Reset chapter controls to scientific defaults"
                  >
                    <RotateCcw className="size-2.5" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              {showChapterLab && (
                <>
                  {/* Interactive Sliders, Toggles & Selectors */}
                  <div className="space-y-2 pt-1 border-t border-white/10">
                    {pocChapter.interactiveControls.map((ctrl) => {
                      const val =
                        chapterControlValues[ctrl.controlId] !== undefined
                          ? chapterControlValues[ctrl.controlId]
                          : ctrl.defaultValue;

                      if (ctrl.controlType === "toggle") {
                        const checked = Boolean(val);
                        return (
                          <label
                            key={ctrl.controlId}
                            className="flex items-center justify-between gap-2 text-[11px] text-slate-200 cursor-pointer"
                          >
                            <span>{ctrl.label}</span>
                            <input
                              type="checkbox"
                              data-testid={`cinematic-control-${ctrl.controlId}`}
                              checked={checked}
                              onChange={(e) =>
                                CosmosChapterInteractionStore.getInstance().setControlValue(
                                  pocChapter.moduleId,
                                  pocChapter.chapterId,
                                  ctrl.controlId,
                                  e.target.checked,
                                )
                              }
                              className="accent-cyan-400 h-3.5 w-3.5"
                            />
                          </label>
                        );
                      }

                      if (ctrl.controlType === "select" && ctrl.options) {
                        const strVal = String(val);
                        return (
                          <div key={ctrl.controlId} className="space-y-1">
                            <span className="text-[11px] text-slate-300 block">{ctrl.label}</span>
                            <select
                              data-testid={`cinematic-control-${ctrl.controlId}`}
                              value={strVal}
                              onChange={(e) =>
                                CosmosChapterInteractionStore.getInstance().setControlValue(
                                  pocChapter.moduleId,
                                  pocChapter.chapterId,
                                  ctrl.controlId,
                                  e.target.value,
                                )
                              }
                              className="w-full bg-slate-900 border border-white/20 text-cyan-200 text-[11px] px-2 py-1 font-mono"
                            >
                              {ctrl.options.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        );
                      }

                      const numVal = Number(val);
                      return (
                        <div key={ctrl.controlId} className="space-y-0.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-300">{ctrl.label}</span>
                            <span className="font-mono text-cyan-300">
                              {numVal}
                              {ctrl.unit ? ` ${ctrl.unit}` : ""}
                            </span>
                          </div>
                          <input
                            type="range"
                            data-testid={`cinematic-control-${ctrl.controlId}`}
                            min={ctrl.min}
                            max={ctrl.max}
                            step={ctrl.step}
                            value={numVal}
                            onChange={(e) =>
                              CosmosChapterInteractionStore.getInstance().setControlValue(
                                pocChapter.moduleId,
                                pocChapter.chapterId,
                                ctrl.controlId,
                                parseFloat(e.target.value),
                              )
                            }
                            className="w-full accent-cyan-400 h-1.5 bg-slate-800 cursor-pointer"
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Live Validated Physics Telemetry Readouts */}
                  {liveChapterTelemetry.length > 0 && (
                    <div
                      data-testid="cinematic-chapter-live-telemetry"
                      className="pt-2 border-t border-white/10 space-y-1 font-mono text-[10px]"
                    >
                      {liveChapterTelemetry.map((metric) => (
                        <div key={metric.metricId} className="flex flex-col">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-slate-400">{metric.label}:</span>
                            <span className="text-emerald-300 font-semibold text-right">
                              {metric.value}
                              {metric.unit ? ` ${metric.unit}` : ""}
                            </span>
                          </div>
                          {metric.formula && (
                            <span className="text-[9px] text-cyan-300/80">{metric.formula}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Activity Gate, Quiz Overlay, or Student Question Response */}
        <div className="w-full max-w-md space-y-3 pointer-events-auto self-end lg:self-center">
          {/* 1. CONTEXT-PRESERVING COSMOS Q&A ANSWER CARD (Prompt 03 Section 18) */}
          {directorSnapshot.lastQuestionAnswer && (
            <div
              role="region"
              aria-label="COSMOS Question Response"
              data-testid="cinematic-qna-response"
              className="bg-[#050914]/95 backdrop-blur-xl border border-indigo-400/50 p-4 space-y-2.5 shadow-2xl"
            >
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-indigo-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-indigo-400" />
                  <span>COSMOS Scientific Answer</span>
                </span>
                <span className="px-2 py-0.5 bg-indigo-500/20 border border-indigo-400/40 text-indigo-200 uppercase text-[10px]">
                  {directorSnapshot.lastQuestionAnswer.epistemicClassification}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-100 leading-relaxed">
                {directorSnapshot.lastQuestionAnswer.answerText}
              </p>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400">
                  Scene & lesson position preserved
                </span>
                <Button
                  type="button"
                  size="sm"
                  onClick={onResumeAfterQuestion}
                  data-testid="cinematic-btn-resume-after-question"
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-none h-7 px-3 text-xs"
                >
                  <CornerDownRight className="size-3.5 mr-1.5" />
                  <span>Resume Lesson</span>
                </Button>
              </div>
            </div>
          )}

          {/* 2. FULLSCREEN ACTIVITY INTEGRATION PANEL (Prompt 03 Section 16) */}
          {isActivityActive && (
            <div
              role="region"
              aria-label="Guided Learning Activity"
              data-testid="cinematic-activity-gate"
              className="bg-[#050914]/95 backdrop-blur-xl border border-amber-500/50 p-4 space-y-3 shadow-2xl"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <Target className="size-4 text-amber-400" />
                  <span>Interactive Activity Gate</span>
                </span>
                <span className="font-mono text-[10px] px-2 py-0.5 bg-amber-500/15 border border-amber-500/40 text-amber-200">
                  {activityState?.status.replace(/_/g, " ") || "WAITING FOR STUDENT INPUT"}
                </span>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed">
                {activityState?.title ||
                  "Complete the required scientific observation or laboratory interaction to continue."}
              </p>

              {activityState?.instructionSteps && activityState.instructionSteps.length > 0 && (
                <div className="space-y-1.5">
                  {activityState.instructionSteps.map((inst) => (
                    <div
                      key={inst.stepId}
                      className={`flex items-start gap-2 p-2 border text-xs ${
                        inst.completed
                          ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                          : "bg-slate-900/80 border-white/10 text-slate-200"
                      }`}
                    >
                      {inst.completed ? (
                        <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="size-3.5 text-amber-400 shrink-0 mt-0.5" />
                      )}
                      <span>{inst.instructionText}</span>
                    </div>
                  ))}
                </div>
              )}

              {(activityState?.lastObservationFeedback ||
                activityState?.lastValidationResult?.reason) && (
                <div className="p-2.5 bg-cyan-950/50 border border-cyan-500/40 text-xs text-cyan-200">
                  {activityState.lastValidationResult?.reason ||
                    activityState.lastObservationFeedback}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onDemonstrateActivityControl}
                  className="rounded-none border-white/20 text-slate-200 text-xs h-7 px-2.5"
                >
                  Highlight Control
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onRequestHint}
                  className="rounded-none border-amber-500/40 text-amber-200 text-xs h-7 px-2.5"
                >
                  <HelpCircle className="size-3 mr-1" />
                  <span>Hint</span>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={onVerifyActivity}
                  data-testid="cinematic-btn-verify-activity"
                  className="rounded-none bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold h-7 px-3"
                >
                  <CheckCircle2 className="size-3 mr-1" />
                  <span>Verify Activity</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onOpenRealActivityInLesson}
                  data-testid="cinematic-btn-open-real-activity"
                  className="rounded-none border-cyan-400/50 text-cyan-200 text-xs h-7 px-2.5 ml-auto"
                >
                  <ExternalLink className="size-3 mr-1" />
                  <span>Open Full Lab Panel</span>
                </Button>
              </div>
            </div>
          )}

          {/* 3. QUIZZES & OFFICIAL ASSESSMENT IN CINEMATIC MODE (Prompt 03 Section 17) */}
          {isQuizActive && quizState && (
            <div
              role="region"
              aria-label="Cinematic Module Knowledge Assessment"
              data-testid="cinematic-quiz-overlay"
              className="bg-[#050914]/95 backdrop-blur-xl border border-cyan-500/50 p-4 space-y-3 shadow-2xl"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-cyan-400" />
                  <span>
                    {quizState.mode === "official"
                      ? "Official Graded Assessment (No Hints)"
                      : "Interactive Knowledge Check"}
                  </span>
                </span>
                {activeQuizQuestion && (
                  <span className="font-mono text-xs text-slate-300">
                    Q{activeQuizQuestion.questionIndex + 1}/{activeQuizQuestion.totalQuestions}
                  </span>
                )}
              </div>

              {activeQuizQuestion && !quizState.isSubmitted ? (
                <>
                  <p className="text-xs sm:text-sm font-medium text-white leading-snug">
                    {activeQuizQuestion.questionText}
                  </p>

                  <div className="space-y-1.5">
                    {activeQuizQuestion.options.map((optText, optIdx) => {
                      const letter = String.fromCharCode(65 + optIdx);
                      const isSelected = activeQuizQuestion.selectedOptionIndex === optIdx;
                      return (
                        <button
                          key={letter}
                          type="button"
                          onClick={() => onSelectQuizOption(optIdx)}
                          className={`w-full text-left p-2.5 border text-xs flex items-start gap-2.5 transition-colors ${
                            isSelected
                              ? "bg-cyan-500/25 border-cyan-400 text-white font-semibold"
                              : "bg-slate-900/80 border-white/15 text-slate-200 hover:border-white/35"
                          }`}
                        >
                          <span className="font-mono font-bold text-cyan-300 shrink-0">
                            [{letter}]
                          </span>
                          <span>{optText}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={onReadQuizQuestionAloud}
                      className="rounded-none border-white/20 text-slate-200 text-xs h-7 px-2.5"
                    >
                      <Volume2 className="size-3 mr-1 text-cyan-400" />
                      <span>Read Aloud</span>
                    </Button>

                    {quizState.mode !== "official" && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onRequestHint}
                        className="rounded-none border-amber-500/40 text-amber-200 text-xs h-7 px-2.5"
                      >
                        <HelpCircle className="size-3 mr-1" />
                        <span>Concept Hint</span>
                      </Button>
                    )}

                    {activeQuizQuestion.selectedOptionIndex !== undefined && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={onConfirmQuizAnswer}
                        data-testid="cinematic-btn-confirm-quiz"
                        className="ml-auto rounded-none bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs h-7 px-3"
                      >
                        <CheckCircle2 className="size-3 mr-1" />
                        <span>
                          Confirm Option{" "}
                          {String.fromCharCode(65 + activeQuizQuestion.selectedOptionIndex)}
                        </span>
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-2 text-xs text-slate-200">
                  <p>
                    {quizState.feedbackSummary ||
                      "Open the full assessment panel to complete or review your official module evaluation."}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onOpenRealActivityInLesson}
                    className="rounded-none border-cyan-400/50 text-cyan-200 text-xs h-7 px-3"
                  >
                    <ExternalLink className="size-3 mr-1.5" />
                    <span>Open Full Assessment View</span>
                  </Button>
                </div>
              )}

              {quizState.lastHintText && (
                <div className="p-2 bg-slate-900 border border-white/15 text-[11px] text-amber-200">
                  {quizState.lastHintText}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
