/**
 * COSMOS Guided Controller (Persistent Compact Teacher Panel)
 * Project: Our Visible Universe Academy
 * Scope: COSMOS 2.0 Phase 1 & Phase 2 Fully Guided Interactive Tutor UI
 *
 * Provides a clean, docked, non-intrusive educational controller:
 * - Current module, lesson, and step progress
 * - Phase 2 Interactive Activity Guide (instruction checklist, control demonstration, live verification)
 * - Phase 2 Interactive Quiz & Voice Answer Guide (Read Question Aloud, Option A/B/C/D voice/click selection, Answer Confirmation, Academic Integrity Guardrail)
 * - Student controls: Pause/Resume, Voice Mic, Ask, Repeat, Prev, Next, Auto-scroll toggle
 * - Visible "Return to Guided Position" when student scrolls away
 */

import React, { useEffect, useState, useRef } from "react";
import { CosmosLearningDirector } from "@/lib/cosmos/CosmosLearningDirector";
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
  CheckCircle2,
  Circle,
  HelpCircle,
  Target,
  ShieldCheck,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CosmosGuidedControllerProps {
  onOpenAskModal?: () => void;
  className?: string;
}

export function CosmosGuidedController({ className = "" }: CosmosGuidedControllerProps) {
  const director = CosmosLearningDirector.getInstance();
  const [snapshot, setSnapshot] = useState<DirectorStateSnapshot>(() => director.getSnapshot());
  const [isMinimized, setIsMinimized] = useState(false);
  const [questionInput, setQuestionInput] = useState("");
  const [isAnswering, setIsAnswering] = useState(false);
  const [showQuestionInput, setShowQuestionInput] = useState(false);
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const recognitionRef = useRef<any>(null);

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

  const isActivityStep =
    currentStep?.stepType === "ACTIVITY" ||
    snapshot.state === "NAVIGATING_TO_ACTIVITY" ||
    snapshot.state === "EXPLAINING_ACTIVITY" ||
    snapshot.state === "WAITING_FOR_ACTIVITY" ||
    snapshot.state === "REVIEWING_ACTIVITY";

  const isQuizStep =
    currentStep?.stepType === "KNOWLEDGE_CHECK" ||
    currentStep?.stepType === "PRACTICE_QUESTION" ||
    snapshot.state === "NAVIGATING_TO_QUIZ" ||
    snapshot.state === "READING_QUESTION" ||
    snapshot.state === "WAITING_FOR_ANSWER" ||
    snapshot.state === "CONFIRMING_ANSWER" ||
    snapshot.state === "SUBMITTING_ANSWER" ||
    snapshot.state === "REVIEWING_FEEDBACK";

  const isCompletionStep =
    currentStep?.stepType === "COMPLETION_CHECK" ||
    snapshot.state === "MODULE_COMPLETED" ||
    snapshot.state === "VERIFYING_REQUIREMENTS";

  const activityState = snapshot.activeActivityState;
  const quizState = snapshot.activeQuizState;
  const completionState = snapshot.activeCompletionState;
  const activeQuizQuestion =
    quizState && quizState.questions.length > 0
      ? quizState.questions[quizState.activeQuestionIndex]
      : null;

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

  const handleToggleVoiceInput = () => {
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
      setShowQuestionInput(true);
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListeningVoice(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event?.results?.[0]?.[0]?.transcript;
        if (transcript) {
          void director.handleStudentQuestion(transcript);
        }
      };

      recognition.onerror = () => {
        setIsListeningVoice(false);
      };

      recognition.onend = () => {
        setIsListeningVoice(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListeningVoice(false);
      setShowQuestionInput(true);
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
      className={`fixed bottom-4 right-4 z-50 max-w-md w-full sm:w-[430px] transition-all duration-300 ${className}`}
    >
      {/* Return to Guided Position Alert Banner */}
      {snapshot.isUserScrolledAway && (
        <div className="mb-2 p-2.5 rounded-xl bg-cyan-950/90 border border-cyan-400/40 shadow-lg shadow-cyan-950/30 backdrop-blur-md flex items-center justify-between gap-3 text-xs text-cyan-200 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2">
            <Compass
              className="size-4 text-cyan-400 animate-spin"
              style={{ animationDuration: "8s" }}
            />
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
              {isMinimized ? (
                <Maximize2 className="size-3.5" />
              ) : (
                <Minimize2 className="size-3.5" />
              )}
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
                <span>
                  Step {stepNumber} of {totalSteps}
                </span>
                <span className="capitalize">
                  {currentStep?.stepType.toLowerCase().replace(/_/g, " ") || "Explanation"}
                </span>
              </div>
              <h4 className="text-xs font-semibold text-white leading-snug line-clamp-2">
                {currentStep?.title || "Exploring astrophysical concepts..."}
              </h4>
              {currentStep?.pedagogicalTransitionText && !isActivityStep && !isQuizStep && (
                <p className="text-[11px] text-cyan-300/80 italic leading-relaxed pt-0.5">
                  "{currentStep.pedagogicalTransitionText}"
                </p>
              )}
            </div>

            {/* PHASE 2: INTERACTIVE ACTIVITY GUIDE PANEL */}
            {isActivityStep && activityState && (
              <div className="p-3 rounded-xl bg-slate-950/85 border border-amber-500/30 space-y-2.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-amber-300 flex items-center gap-1.5 text-[11px]">
                    <Target className="size-3.5 text-amber-400" />
                    <span>Interactive Experiment Guide</span>
                  </span>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    {activityState.status.replace(/_/g, " ")}
                  </span>
                </div>

                {/* Step-by-step Activity Instructions */}
                <div className="space-y-1.5">
                  {activityState.instructionSteps.map((inst) => (
                    <div
                      key={inst.stepId}
                      className={`flex items-start gap-2 p-1.5 rounded-lg text-[11px] transition-colors ${
                        inst.completed
                          ? "bg-emerald-950/30 text-emerald-200 border border-emerald-500/20"
                          : inst.stepId === activityState.currentStepId
                            ? "bg-amber-950/30 text-white border border-amber-400/40"
                            : "text-slate-400"
                      }`}
                    >
                      {inst.completed ? (
                        <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="size-3.5 text-amber-400 shrink-0 mt-0.5" />
                      )}
                      <span className="leading-snug">{inst.instructionText}</span>
                    </div>
                  ))}
                </div>

                {/* Live Observation Feedback */}
                {(activityState.lastObservationFeedback ||
                  activityState.lastValidationResult?.reason) && (
                  <div className="p-2 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-[11px] text-cyan-200 leading-relaxed">
                    {activityState.lastValidationResult?.reason ||
                      activityState.lastObservationFeedback}
                  </div>
                )}

                {/* Activity Guide Action Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      void director.getActivityGuide().demonstrateActiveControl(snapshot.moduleId)
                    }
                    className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-200 border border-white/15 text-[10px] font-medium transition-colors"
                  >
                    Highlight Control
                  </button>
                  <button
                    type="button"
                    onClick={() => void director.requestStepHint()}
                    className="px-2 py-1 rounded bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[10px] font-medium transition-colors flex items-center gap-1"
                  >
                    <HelpCircle className="size-3" />
                    <span>Hint</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => void director.verifyActiveActivity()}
                    className="ml-auto px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-semibold transition-colors flex items-center gap-1"
                  >
                    <CheckCircle2 className="size-3" />
                    <span>Verify Activity</span>
                  </button>
                </div>
              </div>
            )}

            {/* PHASE 2: INTERACTIVE QUIZ & VOICE ANSWER GUIDE PANEL */}
            {isQuizStep && quizState && (
              <div className="p-3 rounded-xl bg-slate-950/85 border border-cyan-500/30 space-y-2.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-cyan-300 flex items-center gap-1.5 text-[11px]">
                    <ShieldCheck className="size-3.5 text-cyan-400" />
                    <span>
                      {quizState.mode === "official"
                        ? "Official Assessment Guide"
                        : "Practice Quiz Guide"}
                    </span>
                  </span>
                  {activeQuizQuestion && (
                    <span className="font-mono text-[10px] text-slate-300">
                      Q{activeQuizQuestion.questionIndex + 1} of {activeQuizQuestion.totalQuestions}
                    </span>
                  )}
                </div>

                {activeQuizQuestion && !quizState.isSubmitted && (
                  <>
                    <p className="text-[11px] text-slate-200 line-clamp-2 leading-snug">
                      {activeQuizQuestion.questionText}
                    </p>

                    {/* Quick Option A/B/C/D Voice & Click Selector */}
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-[10px] text-slate-400">Speak or click option:</span>
                      <div className="flex items-center gap-1">
                        {activeQuizQuestion.options.map((_, optIdx) => {
                          const letter = String.fromCharCode(65 + optIdx);
                          const isSelected = activeQuizQuestion.selectedOptionIndex === optIdx;
                          return (
                            <button
                              key={letter}
                              type="button"
                              onClick={() => void director.selectQuizOption(optIdx, "ui")}
                              className={`size-6 rounded font-mono text-[11px] font-bold border transition-all ${
                                isSelected
                                  ? "bg-cyan-500 text-slate-950 border-cyan-300"
                                  : "bg-white/5 text-slate-300 border-white/15 hover:bg-white/10"
                              }`}
                            >
                              {letter}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Confirm Selection & Read Aloud Controls */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => void director.getQuizGuide().readActiveQuestionAloud()}
                        className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-200 border border-white/15 text-[10px] font-medium flex items-center gap-1"
                      >
                        <Volume2 className="size-3 text-cyan-400" />
                        <span>Read Question</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => void director.requestStepHint()}
                        className="px-2 py-1 rounded bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[10px] font-medium flex items-center gap-1"
                      >
                        <HelpCircle className="size-3" />
                        <span>{quizState.mode === "official" ? "Rules" : "Hint"}</span>
                      </button>

                      {activeQuizQuestion.selectedOptionIndex !== undefined && (
                        <button
                          type="button"
                          onClick={() => void director.confirmQuizAnswer()}
                          className="ml-auto px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-semibold flex items-center gap-1"
                        >
                          <CheckCircle2 className="size-3" />
                          <span>
                            Confirm Option{" "}
                            {String.fromCharCode(65 + activeQuizQuestion.selectedOptionIndex)}
                          </span>
                        </button>
                      )}
                    </div>
                  </>
                )}

                {quizState.lastHintText && (
                  <div className="p-2 rounded-lg bg-slate-900 border border-white/10 text-[10px] text-amber-200 leading-relaxed">
                    {quizState.lastHintText}
                  </div>
                )}

                {quizState.feedbackSummary && (
                  <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-[11px] text-emerald-200 leading-relaxed">
                    {quizState.feedbackSummary}
                  </div>
                )}
              </div>
            )}

            {/* PHASE 3: VERIFIED COMPLETION, STAGE ACHIEVEMENTS & NEXT MODULE CONTINUATION */}
            {isCompletionStep && completionState && (
              <div className="p-3 rounded-xl bg-slate-950/90 border border-emerald-500/35 space-y-2.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-emerald-300 flex items-center gap-1.5 text-[11px]">
                    <Award className="size-3.5 text-emerald-400" />
                    <span>
                      {completionState.isVerifiedComplete
                        ? "Module Verified Complete!"
                        : "Authoritative Completion Check"}
                    </span>
                  </span>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    {completionState.satisfiedCount}/{completionState.totalCount} Verified
                  </span>
                </div>

                {/* Stage Achievement Badge Progress */}
                <div className="p-2 rounded-lg bg-slate-900/90 border border-white/10 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base">{completionState.stageBadgeIcon}</span>
                    <div className="min-w-0">
                      <div className="text-[11px] font-semibold text-white truncate">
                        Stage 0{completionState.stageId}: {completionState.stageBadgeTitle}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {completionState.stageUnlocked
                          ? "Stage Achievement Badge Unlocked!"
                          : `${completionState.stageVerifiedCount} / 4 Stage Modules Verified`}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-300 shrink-0">
                    {completionState.totalModulesVerified}/24 Total
                  </span>
                </div>

                {!completionState.isVerifiedComplete &&
                  completionState.missingRequirements.length > 0 && (
                    <div className="p-2 rounded-lg bg-amber-950/30 border border-amber-500/30 text-[11px] text-amber-200 leading-snug">
                      Next Requirement: {completionState.missingRequirements[0]}
                    </div>
                  )}

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => void director.evaluateModuleJourneyCompletion(true)}
                    className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-200 border border-white/15 text-[10px] font-medium flex items-center gap-1"
                  >
                    <RotateCcw className="size-3 text-cyan-400" />
                    <span>Re-check Server Status</span>
                  </button>

                  {completionState.nextModuleId && (
                    <button
                      type="button"
                      onClick={() =>
                        void director.navigateToModuleInJourney(completionState.nextModuleId!, true)
                      }
                      className="ml-auto px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-semibold flex items-center gap-1"
                    >
                      <span>
                        {completionState.nextModuleId === "exam" ||
                        completionState.isFinalExamEligible
                          ? "Launch Final Assessment"
                          : `Continue to Module ${completionState.nextModuleId}`}
                      </span>
                      <ChevronRight className="size-3" />
                    </button>
                  )}
                </div>
              </div>
            )}

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

            {/* Quick Question / Voice Command Input Box */}
            {showQuestionInput && (
              <form onSubmit={handleAskSubmit} className="flex items-center gap-1.5 pt-1">
                <input
                  type="text"
                  value={questionInput}
                  onChange={(e) => setQuestionInput(e.target.value)}
                  placeholder={
                    isQuizStep
                      ? 'Type "Option A", "Confirm", or ask a question...'
                      : "Ask COSMOS about this lesson or activity..."
                  }
                  disabled={isAnswering}
                  className="flex-1 bg-slate-950/80 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={isAnswering || !questionInput.trim()}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs px-2.5 py-1.5 h-auto rounded-lg"
                >
                  {isAnswering ? "Thinking..." : "Send"}
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

              {/* Utility actions: Speak Answer / Voice Mic, Ask Question, Auto-scroll toggle */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleVoiceInput}
                  className={`size-7 p-0 rounded-lg ${
                    isListeningVoice
                      ? "bg-rose-500/20 text-rose-300 animate-pulse border border-rose-400/40"
                      : "text-slate-400 hover:text-white hover:bg-white/10"
                  }`}
                  aria-label={isListeningVoice ? "Stop voice input" : "Speak answer or question"}
                  title={
                    isListeningVoice
                      ? "Listening... Speak your option or question"
                      : 'Speak answer (e.g. "Option B", "Confirm") or ask a question'
                  }
                >
                  {isListeningVoice ? (
                    <MicOff className="size-3.5" />
                  ) : (
                    <Mic className="size-3.5" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowQuestionInput(!showQuestionInput)}
                  className={`size-7 p-0 rounded-lg ${
                    showQuestionInput
                      ? "bg-cyan-500/20 text-cyan-300"
                      : "text-slate-400 hover:text-white hover:bg-white/10"
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
                  aria-label={
                    snapshot.isAutoScrollActive
                      ? "Disable smart scrolling"
                      : "Enable smart scrolling"
                  }
                  title={
                    snapshot.isAutoScrollActive
                      ? "Smart screen scrolling: ON"
                      : "Smart screen scrolling: OFF"
                  }
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
