/**
 * COSMOS Cinematic Player Controls Bar
 * Project: Our Visible Universe Academy
 * Scope: Prompt 03 — Section 13 (Functional Player Controls)
 *
 * Implements all required and optional player controls connected directly to
 * CosmosCinematicSessionBridge and CosmosLearningDirector:
 * - PLAY / PAUSE / RESUME
 * - REPEAT CURRENT EXPLANATION
 * - PREVIOUS ELIGIBLE STEP
 * - NEXT ELIGIBLE STEP (respecting required activity & official exam guardrails)
 * - ASK COSMOS (text & voice interruption)
 * - MICROPHONE ON/OFF
 * - CAPTIONS ON/OFF
 * - SCIENTIFIC LABELS ON/OFF
 * - MANUAL CAMERA / RETURN TO GUIDED CAMERA
 * - NARRATION SPEED (0.85x, 1.0x, 1.15x, 1.25x)
 * - QUALITY PRESET (HIGH_CINEMATIC, BALANCED, LOW_POWER)
 * - EXIT CINEMATIC MODE
 */

import React, { useState, useRef } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CinematicPlayerStateSnapshot } from "@/lib/cosmos/cinematic/CosmosCinematicPlayerState";
import type { CinematicQualityTier } from "@/lib/cosmos/cinematic-storyboard-types";

interface CosmosCinematicControlsProps {
  snapshot: CinematicPlayerStateSnapshot;
  speechSpeed: number;
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
  speechSpeed,
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
  const [questionText, setQuestionText] = useState("");
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [voiceErrorNotice, setVoiceErrorNotice] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const isPlaying = snapshot.currentPlaybackState === "playing";
  const progressPercent = Math.min(
    100,
    Math.round(((snapshot.currentStepIndex + 1) / Math.max(1, snapshot.totalSteps)) * 100),
  );

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
    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

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
            ? "Microphone permission was denied. You can type your question directly."
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

  return (
    <div
      role="region"
      aria-label="Cinematic Player Controls"
      data-testid="cosmos-cinematic-controls"
      className="w-full max-w-6xl mx-auto px-3 sm:px-6 pb-[max(0.75rem,env(safe-area-inset-bottom))] pointer-events-auto"
    >
      {/* Voice / Microphone Fallback Notice */}
      {voiceErrorNotice && (
        <div className="mb-2 px-3 py-1.5 bg-amber-950/90 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between">
          <span>{voiceErrorNotice}</span>
          <button
            type="button"
            onClick={() => setVoiceErrorNotice(null)}
            className="text-amber-300 hover:text-white font-mono text-[11px] ml-3"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Ask COSMOS Question Drawer (Preserves active 3D scene while student asks a question) */}
      {showAskInput && (
        <form
          onSubmit={handleQuestionSubmit}
          data-testid="cosmos-cinematic-ask-form"
          className="mb-2 bg-[#050914]/95 backdrop-blur-xl border border-cyan-500/40 p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shadow-2xl"
        >
          <input
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
            className="flex-1 bg-slate-950 border border-white/20 px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
          />
          <div className="flex items-center gap-2">
            <Button
              type="submit"
              size="sm"
              disabled={isSubmittingQuestion || !questionText.trim()}
              className="bg-cyan-600 hover:bg-cyan-500 text-white rounded-none text-xs font-semibold px-4"
            >
              <Send className="size-3.5 mr-1.5" />
              <span>{isSubmittingQuestion ? "Asking COSMOS..." : "Ask COSMOS"}</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAskInput(false)}
              className="border-white/20 text-slate-300 hover:text-white rounded-none text-xs"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Main Bottom Dock Container */}
      <div className="bg-[#050914]/90 backdrop-blur-xl border border-white/15 shadow-2xl">
        {/* Step Timeline Scrub Bar */}
        <div className="w-full h-1.5 bg-slate-900 relative">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="px-3 sm:px-5 py-2.5 flex flex-wrap items-center justify-between gap-2 sm:gap-4">
          {/* LEFT: Transport Controls (Prev, Play/Pause/Resume, Repeat, Next) */}
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onPreviousStep}
              disabled={snapshot.currentStepIndex <= 0}
              aria-label="Previous eligible step"
              data-testid="cinematic-btn-prev"
              className="border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 rounded-none h-8 px-2.5"
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
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-none h-8 px-3.5"
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
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-none h-8 px-3.5"
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
              className="border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 rounded-none h-8 px-2.5"
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
              className="border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 rounded-none h-8 px-2.5"
            >
              <span className="hidden md:inline mr-1 text-xs">Next</span>
              <ChevronRight className="size-4" />
            </Button>

            {/* Step Counter & Time Policy Telemetry */}
            <div className="hidden xl:flex items-center gap-2 pl-2 border-l border-white/10 text-[11px] font-mono text-slate-400">
              <span className="text-slate-200 font-semibold">
                Step {snapshot.currentStepIndex + 1}/{snapshot.totalSteps}
              </span>
              <span>•</span>
              <span className="text-cyan-400">{snapshot.currentTimePolicy}</span>
            </div>
          </div>

          {/* CENTER/RIGHT: Voice Interruption, Captions, Labels, Camera & Quality */}
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
              data-testid="cinematic-btn-ask"
              className={`rounded-none h-8 px-2.5 text-xs border ${
                showAskInput
                  ? "bg-cyan-500/25 border-cyan-400 text-cyan-200"
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
              data-testid="cinematic-btn-mic"
              className={`rounded-none h-8 px-2.5 text-xs border ${
                isListeningVoice || snapshot.isMicrophoneActive
                  ? "bg-rose-500/25 border-rose-400 text-rose-200 animate-pulse"
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
              className={`rounded-none h-8 px-2.5 text-xs border ${
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
              className={`rounded-none h-8 px-2.5 text-xs border ${
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
                className="rounded-none h-8 px-2.5 text-xs border border-amber-400/60 bg-amber-500/20 text-amber-200"
              >
                <Compass className="size-3.5 mr-1 text-amber-300" />
                <span>Return to Guided Camera</span>
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onToggleManualCamera(true)}
                aria-label="Switch to manual orbit camera"
                data-testid="cinematic-btn-camera-mode"
                className="rounded-none h-8 px-2.5 text-xs border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200"
              >
                <Camera className="size-3.5 mr-1 text-cyan-400" />
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
              className="rounded-none h-8 px-2 text-xs font-mono border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 hidden sm:inline-flex"
            >
              <Gauge className="size-3 mr-1 text-cyan-400" />
              <span>{speechSpeed}x</span>
            </Button>

            {/* Quality Preset Selector */}
            <select
              aria-label="Cinematic rendering quality preset"
              data-testid="cinematic-select-quality"
              value={snapshot.qualityPreset}
              onChange={(e) => onChangeQuality(e.target.value as CinematicQualityTier)}
              className="h-8 bg-slate-950 border border-white/20 text-xs font-mono text-slate-200 px-2 focus:outline-none focus:border-cyan-400 hidden sm:block"
            >
              <option value="HIGH_CINEMATIC">Quality: High</option>
              <option value="BALANCED">Quality: Balanced</option>
              <option value="LOW_POWER">Quality: Low Power</option>
            </select>

            {/* Exit Cinematic Mode */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onExitCinematicMode}
              aria-label="Exit Cinematic Mode and return to normal lesson view"
              data-testid="cinematic-btn-exit-bottom"
              className="rounded-none h-8 px-3 text-xs font-semibold border border-rose-500/40 bg-rose-950/40 hover:bg-rose-900/60 text-rose-200"
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
