/**
 * COSMOS Guided Controller (Persistent Compact Teacher Panel)
 * Project: Our Visible Universe Academy
 * Scope: Phase 1 Fully Guided User Interface (Part 11)
 *
 * Provides a clean, docked, non-intrusive educational controller:
 * - Current module, lesson, and step progress
 * - Narration and microphone telemetry
 * - Student controls: Pause/Resume, Ask, Repeat, Prev, Next, Auto-scroll toggle
 * - Visible "Return to Guided Position" when student scrolls away
 * - Anti-slop typography, WCAG AA contrast, zero-pill discipline
 */

import React, { useEffect, useState } from "react";
import { CosmosLearningDirector } from "@/lib/cosmos/CosmosLearningDirector";
import { CosmosLessonNavigator } from "@/lib/cosmos/CosmosLessonNavigator";
import { LearningPreferenceManager } from "@/lib/cosmos/LearningPreferenceManager";
import type { DirectorStateSnapshot } from "@/lib/cosmos/learning-director-types";
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Sparkles,
  ArrowUpRight,
  Compass,
  X,
  Mic,
  MicOff,
  Maximize2,
  Minimize2,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CosmosGuidedControllerProps {
  onOpenAskModal?: () => void;
  className?: string;
}

export function CosmosGuidedController({ onOpenAskModal, className = "" }: CosmosGuidedControllerProps) {
  const director = CosmosLearningDirector.getInstance();
  const [snapshot, setSnapshot] = useState<DirectorStateSnapshot>(() => director.getSnapshot());
  const [isMinimized, setIsMinimized] = useState(false);
  const [questionInput, setQuestionInput] = useState("");
  const [isAnswering, setIsAnswering] = useState(false);
  const [showQuestionInput, setShowQuestionInput] = useState(false);

  useEffect(() => {
    const unsubscribe = director.subscribe((updated) => {
      setSnapshot({ ...updated });
    });
    return () => unsubscribe();
  }, [director]);

  if (!snapshot.isGuidedModeActive) {
    return null;
  }

  const currentStep = snapshot.currentStep;
  const stepNumber = snapshot.currentStepIndex + 1;
  const totalSteps = snapshot.totalSteps || 1;
  const progressPercent = Math.min(100, Math.round((stepNumber / totalSteps) * 100));

  const handleAskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionInput.trim() || isAnswering) return;

    setIsAnswering(true);
    try {
      await director.handleStudentQuestion(questionInput.trim());
      setQuestionInput("");
    } finally {
      setIsAnswering(false);
    }
  };

  const handleToggleAutoScroll = () => {
    const prefs = LearningPreferenceManager.getPreferences();
    LearningPreferenceManager.savePreferences({
      autoScrollEnabled: !prefs.autoScrollEnabled,
    });
  };

  return (
    <div
      role="region"
      aria-label="COSMOS Guided Learning Controller"
      className={`fixed bottom-4 right-4 z-50 max-w-md w-full sm:w-[420px] transition-all duration-300 ${className}`}
    >
      {/* Return to Guided Position Alert Banner */}
      {snapshot.isUserScrolledAway && (
        <div className="mb-2 p-2.5 rounded-xl bg-cyan-950/90 border border-cyan-400/40 shadow-lg shadow-cyan-950/30 backdrop-blur-md flex items-center justify-between gap-3 text-xs text-cyan-200 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2">
            <Compass className="size-4 text-cyan-400 animate-spin" style={{ animationDuration: "8s" }} />
            <span>Viewing other content</span>
          </div>
          <button
            onClick={() => void director.returnToGuidedPosition()}
            className="px-2.5 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 hover:text-white font-medium border border-cyan-400/40 transition-colors flex items-center gap-1"
          >
            <span>Return to Guided Position</span>
            <ArrowUpRight className="size-3" />
          </button>
        </div>
      )}

      {/* Main Persistent Teacher Controller Card */}
      <div className="rounded-2xl border border-white/15 bg-slate-900/95 shadow-2xl shadow-cyan-950/40 backdrop-blur-xl overflow-hidden text-slate-200">
        {/* Top Header Bar */}
        <div className="px-4 py-3 bg-gradient-to-r from-cyan-950/50 via-slate-900 to-indigo-950/50 border-b border-white/10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Pulsing Avatar */}
            <div className="relative size-8 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center flex-shrink-0">
              <Sparkles className="size-4 text-cyan-400" />
              {snapshot.isNarrationPlaying && (
                <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-cyan-400 animate-ping" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs font-semibold text-white truncate">
                <span>COSMOS Guided Director</span>
                <span className="text-[10px] text-cyan-400 font-mono">
                  {snapshot.state.replace(/_/g, " ")}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                Module {snapshot.moduleId}: {snapshot.moduleTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              aria-label={isMinimized ? "Maximize panel" : "Minimize panel"}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              {isMinimized ? <Maximize2 className="size-3.5" /> : <Minimize2 className="size-3.5" />}
            </button>
            <button
              onClick={() => director.exitGuidedMode()}
              aria-label="Exit Guided Mode"
              className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-300 transition-colors"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Step Progress Line */}
        <div className="w-full bg-slate-800/80 h-1">
          <div
            className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Body Content (Collapsible) */}
        {!isMinimized && (
          <div className="p-4 space-y-3.5">
            {/* Active Step Information */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Step {stepNumber} of {totalSteps}</span>
                <span className="capitalize">{currentStep?.stepType.toLowerCase() || "Explanation"}</span>
              </div>
              <h4 className="text-xs font-semibold text-white leading-snug line-clamp-2">
                {currentStep?.title || "Exploring astrophysical concepts..."}
              </h4>
              {currentStep?.pedagogicalTransitionText && (
                <p className="text-[11px] text-cyan-300/80 italic leading-relaxed pt-0.5">
                  "{currentStep.pedagogicalTransitionText}"
                </p>
              )}
            </div>

            {/* Error or Notice Alert */}
            {snapshot.errorMessage && (
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs">
                {snapshot.errorMessage}
              </div>
            )}

            {/* Last Answer Preview if present */}
            {snapshot.lastQuestionAnswer && (
              <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-400/30 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-indigo-300 font-medium">
                  <span>COSMOS Explanation</span>
                  <span className="uppercase text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20">
                    {snapshot.lastQuestionAnswer.epistemicClassification}
                  </span>
                </div>
                <p className="text-slate-200 line-clamp-3 text-[11px] leading-relaxed">
                  {snapshot.lastQuestionAnswer.answerText}
                </p>
                <button
                  onClick={() => void director.resumeAfterQuestion()}
                  className="text-[10px] font-medium text-cyan-300 hover:text-cyan-200 underline pt-0.5"
                >
                  Resume Lesson →
                </button>
              </div>
            )}

            {/* Quick Question Input Box */}
            {showQuestionInput && (
              <form onSubmit={handleAskSubmit} className="flex items-center gap-1.5 pt-1">
                <input
                  type="text"
                  value={questionInput}
                  onChange={(e) => setQuestionInput(e.target.value)}
                  placeholder="Ask COSMOS about this lesson..."
                  disabled={isAnswering}
                  className="flex-1 bg-slate-950/80 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={isAnswering || !questionInput.trim()}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs px-2.5 py-1.5 h-auto rounded-lg"
                >
                  {isAnswering ? "Thinking..." : "Ask"}
                </Button>
              </form>
            )}

            {/* Main Primary Interactive Controller Toolbar */}
            <div className="pt-1 flex items-center justify-between gap-1 border-t border-white/10">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void director.previousStep()}
                  disabled={snapshot.currentStepIndex <= 0}
                  className="size-7 p-0 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg"
                  aria-label="Previous step"
                >
                  <ChevronLeft className="size-4" />
                </Button>

                {snapshot.isNarrationPlaying ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => director.pauseSession()}
                    className="border-cyan-500/40 bg-cyan-950/30 text-cyan-300 hover:bg-cyan-900/40 hover:text-white text-xs px-2.5 h-7 rounded-lg flex items-center gap-1.5"
                  >
                    <Pause className="size-3.5" />
                    <span>Pause</span>
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void director.resumeSession()}
                    className="border-cyan-500/40 bg-cyan-500/20 text-cyan-200 hover:bg-cyan-500/30 hover:text-white text-xs px-2.5 h-7 rounded-lg flex items-center gap-1.5"
                  >
                    <Play className="size-3.5 fill-current" />
                    <span>Resume</span>
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void director.repeatStep()}
                  className="size-7 p-0 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg"
                  aria-label="Repeat explanation"
                >
                  <RotateCcw className="size-3.5" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void director.nextStep()}
                  disabled={snapshot.currentStepIndex >= totalSteps - 1}
                  className="size-7 p-0 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg"
                  aria-label="Next step"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>

              {/* Utility actions: Ask Question, Auto-scroll toggle */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowQuestionInput(!showQuestionInput)}
                  className={`size-7 p-0 rounded-lg ${
                    showQuestionInput ? "bg-cyan-500/20 text-cyan-300" : "text-slate-400 hover:text-white hover:bg-white/10"
                  }`}
                  aria-label="Ask COSMOS a question"
                >
                  <MessageSquare className="size-3.5" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleAutoScroll}
                  className={`size-7 p-0 rounded-lg ${
                    snapshot.isAutoScrollActive ? "text-cyan-400" : "text-slate-500"
                  } hover:bg-white/10`}
                  aria-label={snapshot.isAutoScrollActive ? "Disable smart scrolling" : "Enable smart scrolling"}
                  title={snapshot.isAutoScrollActive ? "Smart screen scrolling: ON" : "Smart screen scrolling: OFF"}
                >
                  <Compass className="size-3.5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
