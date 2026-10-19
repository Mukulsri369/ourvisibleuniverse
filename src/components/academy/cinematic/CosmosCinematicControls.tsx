/**
 * COSMOS Cinematic Player Controls Bar & Personalization Dock
 * Project: Our Visible Universe Academy
 * Scope: Prompt 03 Section 13 & Prompt 16 Sections 18, 19, 20, 39, 40, 43, 46
 *
 * Implements:
 * - Comfortable >= 44x44 CSS pixel touch targets for essential controls
 * - Next-Generation COSMOS Teacher Status Indicator (READY, NARRATING, LISTENING,
 *   THINKING, ANSWERING, PAUSED, WAITING_FOR_STUDENT, OFFLINE, ERROR) with accurate
 *   speaking/listening waveform discipline
 * - Accessible Ask COSMOS Question Composer with mobile keyboard safe positioning
 * - Progressive disclosure Settings & Accessibility Popover (Reduced Motion, 2D Data Table,
 *   Plain-Language Quality Tier descriptions, Speed, and Caption Mode)
 */

import React, { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Mic,
  MicOff,
  MessageSquare,
  Subtitles,
  Tag,
  Camera,
  Compass,
  Sliders,
  Minimize2,
  Send,
  Gauge,
  Eye,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CinematicPlayerStateSnapshot } from "@/lib/cosmos/cinematic/CosmosCinematicPlayerState";
import type { DirectorStateSnapshot } from "@/lib/cosmos/learning-director-types";
import type { CinematicQualityTier } from "@/lib/cosmos/cinematic-storyboard-types";
import {
  CINEMATIC_QUALITY_UX_DESCRIPTORS,
  COSMOS_TEACHER_STATUS_DESCRIPTORS,
} from "@/lib/cosmos/cinematic/CinematicDesignTokens";
import { resolveCosmosTeacherUIStatus } from "@/lib/cosmos/cinematic/CinematicPanelManager";
import { LearningPreferenceManager } from "@/lib/cosmos/LearningPreferenceManager";

interface CosmosCinematicControlsProps {
  snapshot: CinematicPlayerStateSnapshot;
  directorSnapshot?: DirectorStateSnapshot;
  speechSpeed: number;
  reducedMotion?: boolean;
  onToggleReducedMotion?: (enabled: boolean) => void;
  showAccessibleDataView?: boolean;
  onToggleAccessibleDataView?: (enabled: boolean) => void;
  onPlayOrResume: () => void;
  onPause: () => void;
  onRepeat: () => void;
  onPreviousStep: () => void;
  onNextStep: () => void;
  onAskQuestion: (question: string) => Promise<void>;
  onToggleCaptions: () => void;
  onToggleLabels: () => void;
  onToggleManualCamera: (manual: boolean) => void;
  onChangeQuality: (tier: CinematicQualityTier) => void;
  onChangeSpeed: (speed: number) => void;
  onExitCinematicMode: () => void;
}

export function CosmosCinematicControls({
  snapshot,
  directorSnapshot,
  speechSpeed,
  reducedMotion = false,
  onToggleReducedMotion,
  showAccessibleDataView = false,
  onToggleAccessibleDataView,
  onPlayOrResume,
  onPause,
  onRepeat,
  onPreviousStep,
  onNextStep,
  onAskQuestion,
  onToggleCaptions,
  onToggleLabels,
  onToggleManualCamera,
  onChangeQuality,
  onChangeSpeed,
  onExitCinematicMode,
}: CosmosCinematicControlsProps) {
  const [showAskInput, setShowAskInput] = useState(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [voiceErrorNotice, setVoiceErrorNotice] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(() =>
    typeof navigator !== "undefined" ? !navigator.onLine : false,
  );

  const recognitionRef = useRef<any>(null);
  const askInputRef = useRef<HTMLInputElement | null>(null);
  const settingsBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Auto-focus question input when opened and allow Escape to close nested drawers
  useEffect(() => {
    if (showAskInput && askInputRef.current) {
      askInputRef.current.focus({ preventScroll: true });
    }
  }, [showAskInput]);

  useEffect(() => {
    if (!showSettingsDrawer && !showAskInput) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        if (showSettingsDrawer) {
          setShowSettingsDrawer(false);
          settingsBtnRef.current?.focus({ preventScroll: true });
        } else if (showAskInput) {
          setShowAskInput(false);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [showSettingsDrawer, showAskInput]);

  const isPlaying = snapshot.currentPlaybackState === "playing";
  const progressPercent = Math.min(
    100,
    Math.round(((snapshot.currentStepIndex + 1) / Math.max(1, snapshot.totalSteps)) * 100),
  );

  // Resolve authoritative COSMOS Teacher UI Status (Prompt 16 Section 19)
  const teacherStatusKey = resolveCosmosTeacherUIStatus({
    snapshot,
    directorSnapshot:
      directorSnapshot ||
      ({
        state: isPlaying ? "NARRATING_SECTION" : "PAUSED",
      } as DirectorStateSnapshot),
    isListeningVoice,
    isSubmittingQuestion,
    isOffline,
  });
  const teacherStatus = COSMOS_TEACHER_STATUS_DESCRIPTORS[teacherStatusKey];

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = questionText.trim();
    if (!trimmed || isSubmittingQuestion) return;

    setIsSubmittingQuestion(true);
    try {
      await onAskQuestion(trimmed);
      setQuestionText("");
      setShowAskInput(false);
    } finally {
      setIsSubmittingQuestion(false);
    }
  };

  const handleToggleMicrophone = () => {
    setVoiceErrorNotice(null);
    if (isListeningVoice && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore stop error
      }
      setIsListeningVoice(false);
      return;
    }

    if (typeof window === "undefined") return;
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRec) {
      setVoiceErrorNotice(
        "Voice recognition is unavailable in this browser. Use the text question input below.",
      );
      setShowAskInput(true);
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.lang = snapshot.language === "hi" ? "hi-IN" : "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      // Immediately pause narration when student activates microphone interruption
      onPause();

      recognition.onstart = () => {
        setIsListeningVoice(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event?.results?.[0]?.[0]?.transcript;
        if (transcript) {
          void onAskQuestion(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        setIsListeningVoice(false);
        setVoiceErrorNotice(
          event?.error === "not-allowed"
            ? "Microphone permission was denied. You can type your question directly below."
            : "Voice input interrupted. Type your question below.",
        );
        setShowAskInput(true);
      };

      recognition.onend = () => {
        setIsListeningVoice(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListeningVoice(false);
      setShowAskInput(true);
    }
  };

  const speeds = [0.85, 1.0, 1.15, 1.25];
  const handleCycleSpeed = () => {
    const idx = speeds.findIndex((s) => Math.abs(s - speechSpeed) < 0.05);
    const nextSpeed = speeds[(idx + 1) % speeds.length];
    onChangeSpeed(nextSpeed);
  };

  const activeQualityUX = CINEMATIC_QUALITY_UX_DESCRIPTORS[snapshot.qualityPreset];

  return (
    <div
      role="region"
      aria-label="Cinematic Player Controls"
      data-testid="cosmos-cinematic-controls"
      className="w-full max-w-6xl mx-auto px-2.5 sm:px-6 pb-[max(0.75rem,env(safe-area-inset-bottom))] pl-[max(0.625rem,env(safe-area-inset-left))] pr-[max(0.625rem,env(safe-area-inset-right))] pointer-events-auto"
    >
      {/* Voice / Microphone Fallback Notice */}
      {voiceErrorNotice && (
        <div
          role="alert"
          data-testid="cinematic-voice-fallback-notice"
          className="mb-2 px-3.5 py-2 bg-amber-950/95 border border-amber-500/50 text-amber-100 text-xs flex items-center justify-between gap-3"
        >
          <span>{voiceErrorNotice}</span>
          <button
            type="button"
            onClick={() => setVoiceErrorNotice(null)}
            className="min-h-[36px] px-2.5 text-amber-300 hover:text-white font-mono text-[11px] border border-amber-400/30"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Control Personalization & Accessibility Popover (Prompt 16 Sections 39, 43, 46) */}
      {showSettingsDrawer && (
        <div
          role="dialog"
          aria-label="Cinematic Experience & Accessibility Settings"
          data-testid="cinematic-settings-popover"
          data-nested-dialog="true"
          className="mb-2 bg-[#050914]/98 backdrop-blur-xl border border-white/25 p-4 shadow-2xl space-y-3 text-xs"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 block">
                Personalization & Accessibility
              </span>
              <h3 className="text-sm font-bold text-white">
                Planetarium Display & Motion Preferences
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowSettingsDrawer(false)}
              aria-label="Close settings"
              className="min-h-[40px] min-w-[40px] flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1. Rendering Quality Tier with Plain-Language Explanation */}
            <div className="bg-slate-900/70 border border-white/10 p-3 space-y-1.5">
              <label
                htmlFor="cinematic-quality-tier-select"
                className="font-mono text-[11px] uppercase tracking-wider text-cyan-300 block"
              >
                Visual Detail Tier
              </label>
              <select
                id="cinematic-quality-tier-select"
                value={snapshot.qualityPreset}
                onChange={(e) => onChangeQuality(e.target.value as CinematicQualityTier)}
                className="w-full h-9 bg-slate-950 border border-white/20 text-xs font-mono text-white px-2 focus:outline-none focus:border-cyan-400"
              >
                <option value="HIGH_CINEMATIC">High Detail</option>
                <option value="BALANCED">Balanced</option>
                <option value="LOW_POWER">Low Power</option>
              </select>
              <p className="text-[11px] text-slate-400 leading-snug">
                {activeQualityUX.plainDescription}
              </p>
            </div>

            {/* 2. Reduced-Motion Learning Mode */}
            <div className="bg-slate-900/70 border border-white/10 p-3 flex flex-col justify-between space-y-2">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-wider text-cyan-300 block">
                  Reduced-Motion Mode
                </span>
                <p className="text-[11px] text-slate-400 leading-snug mt-1">
                  Replaces rapid camera flythroughs with stable keyframe framing while preserving
                  all scientific physics.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={reducedMotion}
                data-testid="cinematic-toggle-reduced-motion"
                onClick={() => {
                  const next = !reducedMotion;
                  LearningPreferenceManager.setReducedMotion(next);
                  onToggleReducedMotion?.(next);
                }}
                className={`min-h-[40px] px-3 py-1.5 font-mono text-xs border text-left flex items-center justify-between transition-colors ${
                  reducedMotion
                    ? "bg-emerald-950/60 border-emerald-400 text-emerald-200 font-semibold"
                    : "bg-slate-950 border-white/20 text-slate-300 hover:text-white"
                }`}
              >
                <span>{reducedMotion ? "Reduced Motion: ON" : "Standard Motion"}</span>
                <span className="text-[10px] uppercase">{reducedMotion ? "Active" : "Off"}</span>
              </button>
            </div>

            {/* 3. Accessible 2D Scientific Data Table & Graph Alternative */}
            <div className="bg-slate-900/70 border border-white/10 p-3 flex flex-col justify-between space-y-2">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-wider text-cyan-300 block">
                  2D Scientific Data View
                </span>
                <p className="text-[11px] text-slate-400 leading-snug mt-1">
                  Displays structured numerical tables, equations, and chart readouts alongside the
                  3D scene.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={showAccessibleDataView}
                data-testid="cinematic-toggle-2d-data-view"
                onClick={() => {
                  const next = !showAccessibleDataView;
                  LearningPreferenceManager.setAccessibleDataTablePreferred(next);
                  onToggleAccessibleDataView?.(next);
                }}
                className={`min-h-[40px] px-3 py-1.5 font-mono text-xs border text-left flex items-center justify-between transition-colors ${
                  showAccessibleDataView
                    ? "bg-cyan-950/70 border-cyan-400 text-cyan-200 font-semibold"
                    : "bg-slate-950 border-white/20 text-slate-300 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Eye className="size-3.5 text-cyan-400" />
                  <span>{showAccessibleDataView ? "2D Data Table: Open" : "Show 2D Data Table"}</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ask COSMOS Question Drawer (Preserves active 3D scene while student asks a question) */}
      {showAskInput && (
        <form
          onSubmit={handleQuestionSubmit}
          data-testid="cosmos-cinematic-ask-form"
          data-nested-dialog="true"
          className="mb-2 bg-[#050914]/96 backdrop-blur-xl border border-cyan-500/45 p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shadow-2xl"
        >
          <input
            ref={askInputRef}
            type="text"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder={
              snapshot.interactionState === "QUIZ_REQUIRED"
                ? 'Type "Option A", "Confirm", or ask a concept question...'
                : `Ask COSMOS about ${snapshot.currentChapterTitle}...`
            }
            disabled={isSubmittingQuestion}
            aria-label="Ask COSMOS a question"
            className="flex-1 min-h-[44px] bg-slate-950 border border-white/25 px-3.5 py-2 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
          />
          <div className="flex items-center gap-2">
            <Button
              type="submit"
              size="sm"
              disabled={isSubmittingQuestion || !questionText.trim()}
              className="min-h-[44px] flex-1 sm:flex-initial bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-none text-xs font-bold px-4"
            >
              <Send className="size-3.5 mr-1.5" />
              <span>{isSubmittingQuestion ? "Asking COSMOS..." : "Ask COSMOS"}</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAskInput(false)}
              className="min-h-[44px] border-white/20 text-slate-300 hover:text-white rounded-none text-xs px-3"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Main Bottom Dock Container */}
      <div className="bg-[#050914]/92 backdrop-blur-xl border border-white/15 shadow-2xl">
        {/* Step Timeline Scrub Bar */}
        <div
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Chapter step progress: step ${snapshot.currentStepIndex + 1} of ${snapshot.totalSteps}`}
          className="w-full h-1.5 bg-slate-900 relative"
        >
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="px-2.5 sm:px-5 py-2 flex flex-wrap items-center justify-between gap-2 sm:gap-3">
          {/* LEFT: Transport Controls (Prev, Play/Pause/Resume, Repeat, Next) + COSMOS Status Indicator */}
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onPreviousStep}
              disabled={snapshot.currentStepIndex <= 0}
              aria-label="Previous eligible step"
              data-testid="cinematic-btn-prev"
              className="border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 rounded-none min-h-[44px] sm:min-h-[38px] min-w-[44px] sm:min-w-0 px-2.5"
            >
              <ChevronLeft className="size-4" />
              <span className="hidden md:inline ml-1 text-xs">Prev</span>
            </Button>

            {isPlaying ? (
              <Button
                type="button"
                size="sm"
                onClick={onPause}
                aria-label="Pause narration and synchronized animation"
                data-testid="cinematic-btn-pause"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-none min-h-[44px] sm:min-h-[38px] px-4"
              >
                <Pause className="size-3.5 mr-1.5 fill-current" />
                <span className="text-xs">Pause</span>
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={onPlayOrResume}
                aria-label="Play or resume narration"
                data-testid="cinematic-btn-play"
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-none min-h-[44px] sm:min-h-[38px] px-4"
              >
                <Play className="size-3.5 mr-1.5 fill-current" />
                <span className="text-xs">
                  {snapshot.currentPlaybackState === "paused" ? "Resume" : "Play"}
                </span>
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRepeat}
              aria-label="Repeat current explanation"
              data-testid="cinematic-btn-repeat"
              className="border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 rounded-none min-h-[44px] sm:min-h-[38px] min-w-[44px] sm:min-w-0 px-2.5"
            >
              <RotateCcw className="size-3.5" />
              <span className="hidden lg:inline ml-1.5 text-xs">Repeat</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onNextStep}
              disabled={snapshot.currentStepIndex >= snapshot.totalSteps - 1}
              aria-label="Next eligible step"
              data-testid="cinematic-btn-next"
              className="border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 rounded-none min-h-[44px] sm:min-h-[38px] min-w-[44px] sm:min-w-0 px-2.5"
            >
              <span className="hidden md:inline mr-1 text-xs">Next</span>
              <ChevronRight className="size-4" />
            </Button>

            {/* Next-Generation COSMOS Teacher Status Indicator (Prompt 16 Section 19) */}
            <div
              data-testid="cosmos-teacher-status-indicator"
              data-teacher-status={teacherStatus.status}
              className="hidden lg:flex items-center gap-2.5 pl-3 ml-1 border-l border-white/15 text-[11px] font-mono tabular-nums"
            >
              <span className="relative flex items-center justify-center size-2.5">
                <span className={`size-2 rounded-full ${teacherStatus.dotColorClass}`} />
                {(teacherStatus.showSpeakingWaveform || teacherStatus.showListeningWaveform) &&
                  !reducedMotion && (
                    <span
                      className={`absolute inset-0 rounded-full ${teacherStatus.dotColorClass} animate-ping opacity-75`}
                    />
                  )}
              </span>
              <div className="leading-tight">
                <div className={`font-semibold ${teacherStatus.accentColorClass}`}>
                  {teacherStatus.label}
                </div>
                <div className="text-[10px] text-slate-400">
                  Step {snapshot.currentStepIndex + 1}/{snapshot.totalSteps} ·{" "}
                  {teacherStatus.sublabel}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Voice Interruption, Captions, Labels, Camera, Personalization & Exit */}
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Ask COSMOS Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (!showAskInput) {
                  onPause();
                }
                setShowAskInput((prev) => !prev);
              }}
              aria-label="Ask COSMOS a question"
              aria-expanded={showAskInput}
              data-testid="cinematic-btn-ask"
              className={`rounded-none min-h-[44px] sm:min-h-[38px] px-3 text-xs border ${
                showAskInput
                  ? "bg-cyan-500/25 border-cyan-400 text-cyan-200 font-semibold"
                  : "border-white/15 bg-white/5 hover:bg-white/10 text-slate-200"
              }`}
            >
              <MessageSquare className="size-3.5 mr-1.5 text-cyan-400" />
              <span>Ask COSMOS</span>
            </Button>

            {/* Microphone Push/Toggle */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleToggleMicrophone}
              aria-label={isListeningVoice ? "Microphone active, click to stop" : "Speak to COSMOS"}
              aria-pressed={isListeningVoice || snapshot.isMicrophoneActive}
              data-testid="cinematic-btn-mic"
              className={`rounded-none min-h-[44px] sm:min-h-[38px] min-w-[44px] sm:min-w-0 px-2.5 text-xs border ${
                isListeningVoice || snapshot.isMicrophoneActive
                  ? "bg-rose-500/25 border-rose-400 text-rose-200 font-semibold"
                  : "border-white/15 bg-white/5 hover:bg-white/10 text-slate-200"
              }`}
            >
              {isListeningVoice || snapshot.isMicrophoneActive ? (
                <MicOff className="size-3.5 text-rose-400" />
              ) : (
                <Mic className="size-3.5 text-cyan-400" />
              )}
              <span className="hidden sm:inline ml-1">
                {isListeningVoice ? "Listening..." : "Mic"}
              </span>
            </Button>

            {/* Captions Toggle */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onToggleCaptions}
              aria-label={snapshot.captionsEnabled ? "Disable captions" : "Enable captions"}
              aria-pressed={snapshot.captionsEnabled}
              data-testid="cinematic-btn-captions"
              className={`rounded-none min-h-[44px] sm:min-h-[38px] min-w-[44px] sm:min-w-0 px-2.5 text-xs border ${
                snapshot.captionsEnabled
                  ? "bg-cyan-500/20 border-cyan-400/50 text-cyan-200"
                  : "border-white/15 bg-white/5 text-slate-400"
              }`}
            >
              <Subtitles className="size-3.5" />
              <span className="hidden lg:inline ml-1">CC</span>
            </Button>

            {/* Scientific Labels Toggle */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onToggleLabels}
              aria-label={
                snapshot.scientificLabelsEnabled
                  ? "Hide scientific labels"
                  : "Show scientific labels"
              }
              aria-pressed={snapshot.scientificLabelsEnabled}
              data-testid="cinematic-btn-labels"
              className={`rounded-none min-h-[44px] sm:min-h-[38px] min-w-[44px] sm:min-w-0 px-2.5 text-xs border ${
                snapshot.scientificLabelsEnabled
                  ? "bg-cyan-500/20 border-cyan-400/50 text-cyan-200"
                  : "border-white/15 bg-white/5 text-slate-400"
              }`}
            >
              <Tag className="size-3.5" />
              <span className="hidden lg:inline ml-1">Labels</span>
            </Button>

            {/* Guided vs Manual Camera Mode */}
            {snapshot.isManualCameraMode ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onToggleManualCamera(false)}
                aria-label="Return to guided camera choreography"
                data-testid="cinematic-btn-camera-mode"
                className="rounded-none min-h-[44px] sm:min-h-[38px] px-2.5 text-xs border border-amber-400/60 bg-amber-500/20 text-amber-200 font-semibold"
              >
                <Compass className="size-3.5 mr-1 text-amber-300" />
                <span>Guided Camera</span>
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onToggleManualCamera(true)}
                aria-label="Switch to manual orbit camera"
                data-testid="cinematic-btn-camera-mode"
                className="rounded-none min-h-[44px] sm:min-h-[38px] min-w-[44px] sm:min-w-0 px-2.5 text-xs border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200"
              >
                <Camera className="size-3.5 sm:mr-1 text-cyan-400" />
                <span className="hidden md:inline">Free Orbit</span>
              </Button>
            )}

            {/* Narration Speed Selector */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCycleSpeed}
              aria-label={`Narration speed ${speechSpeed}x`}
              data-testid="cinematic-btn-speed"
              className="rounded-none min-h-[44px] sm:min-h-[38px] px-2.5 text-xs font-mono tabular-nums border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 hidden sm:inline-flex"
            >
              <Gauge className="size-3 mr-1 text-cyan-400" />
              <span>{speechSpeed}x</span>
            </Button>

            {/* Quality Preset Selector (Plain-Language Labels) */}
            <select
              aria-label="Cinematic rendering quality preset"
              data-testid="cinematic-select-quality"
              value={snapshot.qualityPreset}
              onChange={(e) => onChangeQuality(e.target.value as CinematicQualityTier)}
              className="min-h-[38px] bg-slate-950 border border-white/20 text-xs font-mono text-slate-200 px-2 focus:outline-none focus:border-cyan-400 hidden md:block"
            >
              <option value="HIGH_CINEMATIC">Detail: High</option>
              <option value="BALANCED">Detail: Balanced</option>
              <option value="LOW_POWER">Detail: Low Power</option>
            </select>

            {/* Settings & Accessibility Popover Trigger */}
            <Button
              ref={settingsBtnRef}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowSettingsDrawer((prev) => !prev)}
              aria-label="Open personalization and accessibility settings"
              aria-expanded={showSettingsDrawer}
              data-testid="cinematic-btn-settings"
              className={`rounded-none min-h-[44px] sm:min-h-[38px] min-w-[44px] sm:min-w-0 px-2.5 text-xs border ${
                showSettingsDrawer || reducedMotion || showAccessibleDataView
                  ? "bg-cyan-500/20 border-cyan-400 text-cyan-200"
                  : "border-white/15 bg-white/5 hover:bg-white/10 text-slate-200"
              }`}
            >
              <Sliders className="size-3.5 text-cyan-400" />
              <span className="hidden xl:inline ml-1">Display</span>
            </Button>

            {/* Exit Cinematic Mode */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onExitCinematicMode}
              aria-label="Exit Cinematic Mode and return to normal lesson view"
              data-testid="cinematic-btn-exit-bottom"
              className="rounded-none min-h-[44px] sm:min-h-[38px] px-3 text-xs font-semibold border border-rose-500/40 bg-rose-950/40 hover:bg-rose-900/60 text-rose-200"
            >
              <Minimize2 className="size-3.5 mr-1.5" />
              <span>Exit</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
