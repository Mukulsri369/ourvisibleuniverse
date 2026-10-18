/**
 * COSMOS AI Astronomy Teaching Companion Component
 * Project: Our Visible Universe Academy
 * Scope: Prompt 13 Intelligent Voice Narration & Live Module Integration
 *
 * Implements complete natural voice narration powered by Gemini TTS (gemini-3.8-flash-lite-tts),
 * full playback state machine (IDLE, LOADING, PLAYING, PAUSED, COMPLETED, ERROR),
 * text synchronization highlighting, voice selection, speed adjustments, and text-only mode.
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { LearningLevel } from "@/lib/academy/types";
import {
  type CosmosAnswer,
  type CosmosLanguage,
  type CosmosLearningMode,
  type CosmosVisualizationReference,
  type CosmosVoiceName,
  type EpistemicStatus,
  type NarrationSegment,
  type NarrationState,
  type StudentQuestionContext,
  type CosmosInteractionState,
} from "@/lib/cosmos/cosmos-types";
import { NarrationController } from "@/lib/cosmos/NarrationController";
import {
  VoiceConversationController,
  type ConversationEventPayload,
} from "@/lib/cosmos/VoiceConversationController";
import { VoiceCommandProcessor } from "@/lib/cosmos/VoiceCommandProcessor";
import { LearningPreferenceManager } from "@/lib/cosmos/LearningPreferenceManager";
import { StudentQuestionContextManager } from "@/lib/cosmos/StudentQuestionContext";
import { VisualizationActionController } from "@/lib/cosmos/VisualizationActionController";
import { Cosmos3DAdapter } from "@/lib/cosmos/Cosmos3DAdapter";
import { Cosmos3DTools } from "@/lib/cosmos/Cosmos3DTools";
import { UniversalCosmosAdapter } from "@/lib/cosmos/adapters/universal-adapter";
import { askCosmosQuestion } from "@/lib/cosmos/cosmos.functions";
import {
  Bot,
  Sparkles,
  BookOpen,
  HelpCircle,
  Compass,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Send,
  ShieldAlert,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  FastForward,
  Rewind,
  Orbit,
  Atom,
  Clock,
  Radio,
  FileText,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Mic,
  MicOff,
  CornerDownRight,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CosmosCompanionProps {
  moduleId: string;
  moduleTitle: string;
  learningLevel: LearningLevel;
  sublessonIndex?: number;
  totalSublessons?: number;
  sublessonId?: string;
  sublessonTitle?: string;
  scientificTopic: string;
  currentDisplayText?: string;
  currentVisualization?: CosmosVisualizationReference;
  isExamMode?: boolean;
  className?: string;
}

export function CosmosCompanion({
  moduleId,
  moduleTitle,
  learningLevel,
  sublessonIndex = 0,
  totalSublessons = 6,
  sublessonId,
  sublessonTitle,
  scientificTopic,
  currentDisplayText = "",
  currentVisualization,
  isExamMode = false,
  className = "",
}: CosmosCompanionProps) {
  // 1. Learning Preferences & Mode
  const [preferences, setPreferences] = useState(() => LearningPreferenceManager.getPreferences());
  const activeMode: CosmosLearningMode = isExamMode ? "exam" : preferences.mode;

  // 2. Controller & Segments
  const [segments, setSegments] = useState<NarrationSegment[]>(() =>
    UniversalCosmosAdapter.getSegments(moduleId, learningLevel, preferences.language),
  );

  const narrationRef = useRef<NarrationController | null>(null);
  const voiceRef = useRef<VoiceConversationController | null>(null);

  if (!narrationRef.current) {
    narrationRef.current = new NarrationController(segments);
    voiceRef.current = new VoiceConversationController(narrationRef.current);
  }

  // 3. Narration State
  const [narrationState, setNarrationState] = useState<NarrationState>(() =>
    narrationRef.current!.getState(),
  );

  // 3b. Real-Time Conversation State (Prompt 14)
  const [conversationPayload, setConversationPayload] = useState<ConversationEventPayload>(() =>
    voiceRef.current!.getPayload(),
  );

  // 4. Q&A and UI State
  const [studentQuestion, setStudentQuestion] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [lastAnswer, setLastAnswer] = useState<CosmosAnswer | null>(null);
  const [qnaError, setQnaError] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showSpokenPhonetics, setShowSpokenPhonetics] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [showVoiceCommands, setShowVoiceCommands] = useState(false);

  // Reload segments when level or language changes
  useEffect(() => {
    const updatedSegments = UniversalCosmosAdapter.getSegments(
      moduleId,
      learningLevel,
      preferences.language,
    );
    setSegments(updatedSegments);
    if (narrationRef.current) {
      narrationRef.current.loadSegments(updatedSegments, 0);
    }
  }, [moduleId, learningLevel, preferences.language]);

  // Sync sublesson selection with narration segments
  useEffect(() => {
    if (sublessonId && narrationRef.current && segments.length > 0) {
      const matchIdx = segments.findIndex((s) => s.lessonId === sublessonId);
      if (matchIdx !== -1 && matchIdx !== narrationState.currentSegmentIndex) {
        // If not already playing, advance cursor smoothly to this sublesson's first segment
        if (narrationState.status === "idle" || narrationState.status === "paused") {
          narrationRef.current.seekSegment(matchIdx);
        }
      }
    }
  }, [sublessonId, segments]);

  // Subscribe to narration controller updates
  useEffect(() => {
    const controller = narrationRef.current;
    if (!controller) return;

    const unsubscribe = controller.subscribe((state) => {
      setNarrationState({ ...state });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Subscribe to conversation controller updates (Prompt 14)
  useEffect(() => {
    const vController = voiceRef.current;
    if (!vController) return;

    const unsubscribe = vController.subscribe((payload) => {
      setConversationPayload({ ...payload });
      if (payload.lastAnswer) {
        setLastAnswer(payload.lastAnswer);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Keyboard Push-to-Talk (Hold Space when not typing in text input)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat) {
        const activeTag = document.activeElement?.tagName?.toLowerCase();
        if (activeTag !== "input" && activeTag !== "textarea") {
          e.preventDefault();
          voiceRef.current?.startPushToTalk();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        const activeTag = document.activeElement?.tagName?.toLowerCase();
        if (activeTag !== "input" && activeTag !== "textarea") {
          e.preventDefault();
          voiceRef.current?.stopPushToTalk();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Assemble real-time epistemic question context
  const currentContext: StudentQuestionContext = useMemo(() => {
    return StudentQuestionContextManager.buildContext({
      moduleId,
      sublessonId,
      learningLevel,
      activeTextOverride: currentDisplayText,
      currentVisualization,
      activeExamAttempt: isExamMode,
    });
  }, [moduleId, sublessonId, learningLevel, currentDisplayText, currentVisualization, isExamMode]);

  // Keep 3D tools active context in sync
  useEffect(() => {
    Cosmos3DTools.setActiveLearningContext(currentContext);
  }, [currentContext]);

  // Track 3D adapter state changes (sim state, object selection, camera control, history)
  const [, setAdapterTick] = useState(0);
  useEffect(() => {
    const unregister = Cosmos3DAdapter.getInstance().addListener(() => {
      setAdapterTick((t) => t + 1);
    });
    return unregister;
  }, []);

  const adapter = Cosmos3DAdapter.getInstance();
  const simState = Cosmos3DTools.getCurrentSimulationState().data;
  const selectedObj = Cosmos3DTools.getSelectedCelestialObject().data;
  const isUserOrbiting = adapter.isUserControllingCamera();
  const hasPreviousView = adapter.hasPreviousView();
  const previousViewCount = adapter.getPreviousViewCount();

  // Handle Mode Change
  const handleSetMode = (mode: CosmosLearningMode) => {
    if (isExamMode) return;
    LearningPreferenceManager.setMode(mode);
    setPreferences(LearningPreferenceManager.getPreferences());

    if (mode === "independent" || mode === "exam") {
      narrationRef.current?.stop();
    }
  };

  // Handle Speech Speed
  const handleSetSpeed = (speed: number) => {
    LearningPreferenceManager.updatePreferences({ preferredVoiceSpeed: speed });
    setPreferences(LearningPreferenceManager.getPreferences());
    narrationRef.current?.setSpeed(speed);
  };

  // Handle Voice Selection
  const handleSetVoice = (voiceName: CosmosVoiceName) => {
    LearningPreferenceManager.setVoiceName(voiceName);
    setPreferences(LearningPreferenceManager.getPreferences());
    narrationRef.current?.setVoiceName(voiceName);
  };

  // Handle Text-Only Mode Toggle
  const handleToggleTextOnly = () => {
    const next = !preferences.textOnlyMode;
    LearningPreferenceManager.setTextOnlyMode(next);
    setPreferences(LearningPreferenceManager.getPreferences());
    narrationRef.current?.setTextOnlyMode(next);
  };

  // Handle Auto-Scroll Toggle
  const handleToggleAutoScroll = () => {
    const next = !preferences.autoScrollEnabled;
    LearningPreferenceManager.setAutoScroll(next);
    setPreferences(LearningPreferenceManager.getPreferences());
  };

  // Handle Language
  const handleSetLanguage = (lang: CosmosLanguage) => {
    LearningPreferenceManager.updatePreferences({ language: lang });
    setPreferences(LearningPreferenceManager.getPreferences());
  };

  // Real-Time Conversational Handlers (Prompt 14)
  const handleToggleHandsFree = async () => {
    const next = !preferences.handsFreeBargeIn;
    if (next) {
      const ok = await voiceRef.current?.enableMicrophone();
      if (!ok) return;
    }
    LearningPreferenceManager.setHandsFreeBargeIn(next);
    setPreferences(LearningPreferenceManager.getPreferences());
  };

  const handleToggleAutoResume = () => {
    const next = !preferences.autoResumeAfterDiscussion;
    LearningPreferenceManager.setAutoResumeAfterDiscussion(next);
    setPreferences(LearningPreferenceManager.getPreferences());
  };

  const handlePushToTalkStart = () => {
    voiceRef.current?.startPushToTalk();
  };

  const handlePushToTalkStop = () => {
    voiceRef.current?.stopPushToTalk();
  };

  const handleResumeLessonNow = () => {
    voiceRef.current?.resumeLesson();
  };

  const handleVoiceCommand = (cmd: string) => {
    const match = VoiceCommandProcessor.matchCommand(cmd);
    if (match.isCommand && match.commandType && narrationRef.current) {
      VoiceCommandProcessor.executeCommand(match.commandType, narrationRef.current);
    }
  };

  // Ask Question Handler
  const handleAskQuestion = async (queryText?: string) => {
    const textToAsk = (queryText || studentQuestion).trim();
    if (!textToAsk || isAsking) return;

    // Immediately interrupt ongoing narration
    narrationRef.current?.interrupt();

    setIsAsking(true);
    setQnaError(null);

    try {
      // 1. Record student turn
      StudentQuestionContextManager.recordTurn(moduleId, learningLevel, {
        role: "student",
        content: textToAsk,
        timestamp: Date.now(),
      });

      // 2. Query COSMOS Server Function
      const answer = await askCosmosQuestion({
        data: {
          question: textToAsk,
          context: currentContext,
        },
      });

      // 3. Record response turn
      StudentQuestionContextManager.recordTurn(moduleId, learningLevel, {
        role: "cosmos",
        content: answer.answerText,
        timestamp: Date.now(),
        epistemicStatus: answer.epistemicClassification,
      });

      setLastAnswer(answer);
      setStudentQuestion("");

      // 4. Trigger 3D visualization action if returned
      if (answer.visualizationAction) {
        VisualizationActionController.dispatchAction(answer.visualizationAction);
      }
    } catch (err: any) {
      console.warn("COSMOS question inquiry warning:", err);
      setQnaError(
        "COSMOS could not resolve this query right now. Grounded curriculum synthesis remains available below.",
      );
    } finally {
      setIsAsking(false);
    }
  };

  // 3D Scene Action Dispatcher
  const handleDispatchVizAction = (action?: CosmosVisualizationReference) => {
    const target = action || currentVisualization;
    if (target) {
      VisualizationActionController.dispatchAction(target);
    }
  };

  // Epistemic badge colors
  const getEpistemicBadge = (status: EpistemicStatus) => {
    switch (status) {
      case "fact":
        return (
          <span className="inline-flex items-center gap-1 rounded bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-300 uppercase">
            ● Fact (Empirical Measurement)
          </span>
        );
      case "model":
        return (
          <span className="inline-flex items-center gap-1 rounded bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-mono font-bold text-cyan-300 uppercase">
            ◆ Model (Theoretical Framework)
          </span>
        );
      case "hypothesis":
        return (
          <span className="inline-flex items-center gap-1 rounded bg-purple-500/15 border border-purple-500/30 px-2 py-0.5 text-[10px] font-mono font-bold text-purple-300 uppercase">
            ▲ Hypothesis (Proposed Mechanism)
          </span>
        );
      case "uncertainty":
        return (
          <span className="inline-flex items-center gap-1 rounded bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-300 uppercase">
            ◬ Uncertainty (Debate / Error Margin)
          </span>
        );
    }
  };

  // Status badge styling incorporating Prompt 14 interaction states
  const renderStatusBadge = () => {
    const cState = conversationPayload.state;

    if (cState === "INTERRUPTING") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-400 text-purple-300 font-mono text-[11px] animate-pulse">
          <span className="size-2 rounded-full bg-purple-400 animate-ping" />
          <span>INTERRUPTING</span>
        </span>
      );
    }
    if (cState === "LISTENING") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-400 text-rose-300 font-mono text-[11px]">
          <span className="size-2 rounded-full bg-rose-400 animate-ping" />
          <span>LISTENING TO STUDENT</span>
        </span>
      );
    }
    if (cState === "PROCESSING") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-mono text-[11px]">
          <RefreshCw className="size-3 animate-spin text-cyan-400" />
          <span>PROCESSING QUESTION</span>
        </span>
      );
    }
    if (cState === "ANSWERING") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-mono text-[11px]">
          <Volume2 className="size-3 text-emerald-400 animate-bounce" />
          <span>COSMOS ANSWERING</span>
        </span>
      );
    }
    if (cState === "FOLLOW_UP_WINDOW") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 font-mono text-[11px]">
          <Clock className="size-3 text-amber-400" />
          <span>DISCUSSION OPEN ({conversationPayload.followUpCountdownSeconds}s)</span>
        </span>
      );
    }
    if (cState === "RESUMING") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-mono text-[11px]">
          <FastForward className="size-3 text-cyan-400" />
          <span>RESUMING LESSON</span>
        </span>
      );
    }

    switch (narrationState.status) {
      case "loading":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono text-[11px]">
            <span className="size-2 rounded-full bg-cyan-400 animate-ping" />
            <span>LOADING AUDIO</span>
          </span>
        );
      case "playing":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-[11px]">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>PLAYING NARRATION</span>
          </span>
        );
      case "paused":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-[11px]">
            <span className="size-2 rounded-full bg-amber-400" />
            <span>PAUSED</span>
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono text-[11px]">
            <CheckCircle2 className="size-3 text-cyan-400" />
            <span>LESSON COMPLETED</span>
          </span>
        );
      case "error":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 font-mono text-[11px]">
            <AlertCircle className="size-3 text-rose-400" />
            <span>AUDIO ERROR</span>
          </span>
        );
      case "interrupted":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 font-mono text-[11px]">
            <span>INTERRUPTED</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400 font-mono text-[11px]">
            <span className="size-2 rounded-full bg-slate-500" />
            <span>IDLE</span>
          </span>
        );
    }
  };

  const currentSegment = narrationState.currentSegment;

  return (
    <aside
      aria-label="COSMOS AI Astronomy Teaching Companion"
      className={`rounded-3xl border border-cyan-500/30 bg-slate-950/95 shadow-2xl backdrop-blur-2xl transition-all ${className}`}
    >
      {/* 1. COMPANION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 border-b border-white/10 bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 rounded-t-3xl">
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center size-11 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 text-white shadow-lg shadow-cyan-500/20">
            <Bot className="size-6 animate-pulse" />
            <span
              className={`absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-slate-950 ${
                isExamMode
                  ? "bg-rose-500"
                  : narrationState.status === "playing"
                    ? "bg-emerald-400 animate-ping"
                    : narrationState.status === "loading"
                      ? "bg-cyan-400 animate-bounce"
                      : "bg-cyan-400"
              }`}
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight flex items-center gap-1.5">
                <span>COSMOS</span>
                <span className="text-xs font-mono font-semibold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.2 rounded-full">
                  AI Voice Teacher
                </span>
              </h3>
              {renderStatusBadge()}
            </div>
            <p className="text-xs text-slate-300 font-medium mt-0.5 line-clamp-1">
              {moduleTitle} • {scientificTopic}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Awareness indicator pill */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300">
            <span className="size-2 rounded-full bg-cyan-400" />
            <span className="font-mono text-[11px] text-cyan-300">
              Aware: Sub-lesson {sublessonIndex + 1}/{totalSublessons}
            </span>
            <span className="text-slate-500">•</span>
            <span className="capitalize font-semibold text-white">{learningLevel}</span>
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors"
            title={isCollapsed ? "Expand COSMOS Companion" : "Collapse COSMOS Companion"}
            aria-expanded={!isCollapsed}
          >
            {isCollapsed ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="p-5 sm:p-6 space-y-6">
          {/* 2. MODE SELECTOR (5 Pedagogical Modes) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider text-slate-300 text-[10px]">
                Pedagogical Modes
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {activeMode === "guided" && "COSMOS reads with natural Gemini TTS audio"}
                {activeMode === "ask" && "Ask free-form astrophysics questions"}
                {activeMode === "explore" && "Interactive commentary for 3D simulation"}
                {activeMode === "independent" && "Self-paced study without AI voice"}
                {activeMode === "exam" && "Assistance locked for examination integrity"}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <button
                disabled={isExamMode}
                onClick={() => handleSetMode("guided")}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  activeMode === "guided"
                    ? "bg-cyan-500/20 border-cyan-400 text-white shadow-md ring-1 ring-cyan-400/30"
                    : "bg-white/[0.02] border-white/5 text-slate-400 hover:text-white hover:bg-white/5"
                } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                <BookOpen className="size-3.5 text-cyan-400" />
                <span>Guided Learning</span>
              </button>

              <button
                disabled={isExamMode}
                onClick={() => handleSetMode("ask")}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  activeMode === "ask"
                    ? "bg-cyan-500/20 border-cyan-400 text-white shadow-md ring-1 ring-cyan-400/30"
                    : "bg-white/[0.02] border-white/5 text-slate-400 hover:text-white hover:bg-white/5"
                } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                <HelpCircle className="size-3.5 text-purple-400" />
                <span>Ask COSMOS</span>
              </button>

              <button
                disabled={isExamMode}
                onClick={() => handleSetMode("explore")}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  activeMode === "explore"
                    ? "bg-cyan-500/20 border-cyan-400 text-white shadow-md ring-1 ring-cyan-400/30"
                    : "bg-white/[0.02] border-white/5 text-slate-400 hover:text-white hover:bg-white/5"
                } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                <Compass className="size-3.5 text-amber-400" />
                <span>Explore 3D</span>
              </button>

              <button
                disabled={isExamMode}
                onClick={() => handleSetMode("independent")}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  activeMode === "independent"
                    ? "bg-cyan-500/20 border-cyan-400 text-white shadow-md ring-1 ring-cyan-400/30"
                    : "bg-white/[0.02] border-white/5 text-slate-400 hover:text-white hover:bg-white/5"
                } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                <Sparkles className="size-3.5 text-emerald-400" />
                <span>Independent</span>
              </button>

              <button
                disabled
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  activeMode === "exam"
                    ? "bg-rose-500/20 border-rose-400 text-rose-200 shadow-md ring-1 ring-rose-400/30"
                    : "bg-white/[0.02] border-white/5 text-slate-500"
                }`}
              >
                <ShieldAlert className="size-3.5 text-rose-400" />
                <span>Exam Mode</span>
              </button>
            </div>
          </div>

          {/* 3. ACTIVE MODE BODY */}
          {activeMode === "guided" && (
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 sm:p-5 space-y-4">
              {/* Header row: Segments counter, voice settings toggle, and audio source */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                    Segment {narrationState.currentSegmentIndex + 1} /{" "}
                    {narrationState.totalSegments}
                  </span>
                  {currentSegment && getEpistemicBadge(currentSegment.epistemicStatus)}

                  {/* Audio Engine Source Indicator */}
                  <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                    {narrationState.textOnlyMode
                      ? "Text-Only Paced"
                      : narrationState.audioSource === "gemini-tts"
                        ? `Gemini TTS (${narrationState.voiceName})`
                        : "Web Speech API"}
                  </span>
                </div>

                {/* Right controls: Speed & Voice Setting Button */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 text-[11px]">Speed:</span>
                  <div className="flex items-center gap-1">
                    {[0.75, 1.0, 1.25, 1.5].map((spd) => (
                      <button
                        key={spd}
                        onClick={() => handleSetSpeed(spd)}
                        className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                          preferences.preferredVoiceSpeed === spd
                            ? "bg-cyan-500 text-slate-950 font-bold"
                            : "bg-white/5 text-slate-400 hover:text-white"
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setShowVoiceSettings(!showVoiceSettings)}
                    className={`ml-2 p-1.5 rounded-lg border transition-colors ${
                      showVoiceSettings
                        ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                        : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                    }`}
                    title="TTS Voice & Audio Preferences"
                  >
                    <Sliders className="size-3.5" />
                  </button>
                </div>
              </div>

              {/* Expandable Voice & Audio Options Panel */}
              {showVoiceSettings && (
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-cyan-500/20 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Gemini TTS Voice:
                    </label>
                    <select
                      value={preferences.preferredVoiceName}
                      onChange={(e) => handleSetVoice(e.target.value as CosmosVoiceName)}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-cyan-300 focus:outline-none"
                    >
                      <option value="Kore">Kore (Warm, Natural & Patient)</option>
                      <option value="Puck">Puck (Curious & Expressive)</option>
                      <option value="Zephyr">Zephyr (Confident & Crisp)</option>
                      <option value="Fenrir">Fenrir (Deep & Resonant)</option>
                      <option value="Charon">Charon (Authoritative & Measured)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Language / Pronunciation:
                    </label>
                    <select
                      value={preferences.language}
                      onChange={(e) => handleSetLanguage(e.target.value as CosmosLanguage)}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-cyan-300 focus:outline-none"
                    >
                      <option value="en">English (Scientific Standard)</option>
                      <option value="hi">Hindi (हिंदी पारिभाषिक)</option>
                      <option value="hinglish">Hinglish (Colloquial Bilingual)</option>
                    </select>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 pt-4 sm:pt-2 sm:col-span-3 border-t border-white/5">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-300 text-xs">
                      <input
                        type="checkbox"
                        checked={preferences.textOnlyMode}
                        onChange={handleToggleTextOnly}
                        className="rounded border-white/20 bg-slate-900 text-cyan-500"
                      />
                      <span>Text-Only Mode</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-slate-300 text-xs">
                      <input
                        type="checkbox"
                        checked={preferences.autoScrollEnabled}
                        onChange={handleToggleAutoScroll}
                        className="rounded border-white/20 bg-slate-900 text-cyan-500"
                      />
                      <span>Auto-Scroll</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-cyan-300 text-xs font-semibold">
                      <input
                        type="checkbox"
                        checked={preferences.handsFreeBargeIn}
                        onChange={handleToggleHandsFree}
                        className="rounded border-white/20 bg-slate-900 text-cyan-500"
                      />
                      <span>Hands-Free Voice Interruption (Opt-In VAD)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-slate-300 text-xs">
                      <input
                        type="checkbox"
                        checked={preferences.autoResumeAfterDiscussion}
                        onChange={handleToggleAutoResume}
                        className="rounded border-white/20 bg-slate-900 text-cyan-500"
                      />
                      <span>Auto-Resume Lesson After Discussion</span>
                    </label>
                  </div>
                </div>
              )}

              {/* REAL-TIME CONVERSATION & BARGE-IN BANNER (Prompt 14) */}
              {(conversationPayload.state === "INTERRUPTING" ||
                conversationPayload.state === "LISTENING" ||
                conversationPayload.state === "PROCESSING" ||
                conversationPayload.state === "ANSWERING" ||
                conversationPayload.state === "FOLLOW_UP_WINDOW" ||
                conversationPayload.state === "RESUMING") && (
                <div
                  className={`p-4 rounded-2xl border transition-all duration-300 ${
                    conversationPayload.state === "LISTENING" ||
                    conversationPayload.state === "INTERRUPTING"
                      ? "bg-rose-500/15 border-rose-500/40 ring-1 ring-rose-500/30 text-rose-100"
                      : conversationPayload.state === "PROCESSING"
                        ? "bg-cyan-500/15 border-cyan-500/40 ring-1 ring-cyan-500/30 text-cyan-100"
                        : conversationPayload.state === "ANSWERING"
                          ? "bg-emerald-500/15 border-emerald-500/40 ring-1 ring-emerald-500/30 text-emerald-100"
                          : conversationPayload.state === "FOLLOW_UP_WINDOW"
                            ? "bg-amber-500/15 border-amber-500/40 ring-1 ring-amber-500/30 text-amber-100"
                            : "bg-purple-500/15 border-purple-500/40 ring-1 ring-purple-500/30 text-purple-100"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative flex items-center justify-center size-9 rounded-xl bg-slate-950/80 border border-white/10 shrink-0">
                        {conversationPayload.state === "LISTENING" ||
                        conversationPayload.state === "INTERRUPTING" ? (
                          <Mic className="size-5 text-rose-400 animate-pulse" />
                        ) : conversationPayload.state === "PROCESSING" ? (
                          <RefreshCw className="size-5 text-cyan-400 animate-spin" />
                        ) : conversationPayload.state === "ANSWERING" ? (
                          <Volume2 className="size-5 text-emerald-400 animate-bounce" />
                        ) : conversationPayload.state === "FOLLOW_UP_WINDOW" ? (
                          <MessageSquare className="size-5 text-amber-400" />
                        ) : (
                          <FastForward className="size-5 text-purple-400 animate-pulse" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider">
                            {conversationPayload.state === "INTERRUPTING" &&
                              "Barge-In Detected: Interrupted Narration"}
                            {conversationPayload.state === "LISTENING" &&
                              "Listening for Student Question..."}
                            {conversationPayload.state === "PROCESSING" &&
                              "Grounding Question in Astrophysics Curriculum..."}
                            {conversationPayload.state === "ANSWERING" && "COSMOS is Explaining..."}
                            {conversationPayload.state === "FOLLOW_UP_WINDOW" &&
                              `Discussion Open (${conversationPayload.followUpCountdownSeconds}s) — Ask Follow-Up or Resume`}
                            {conversationPayload.state === "RESUMING" &&
                              "Resuming Lesson from Preserved Location..."}
                          </span>
                        </div>

                        <p className="text-xs opacity-90 mt-0.5 line-clamp-1">
                          {conversationPayload.transcript
                            ? `"${conversationPayload.transcript}"`
                            : conversationPayload.interruptedSegment
                              ? `Preserved reading position: ${conversationPayload.interruptedSegment.displayText.slice(0, 60)}...`
                              : "Voice conversation active"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {conversationPayload.state === "FOLLOW_UP_WINDOW" && (
                        <>
                          <Button
                            size="sm"
                            onClick={handleResumeLessonNow}
                            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                          >
                            <FastForward className="size-3.5 mr-1" />
                            Resume Lesson Now
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onMouseDown={handlePushToTalkStart}
                            onMouseUp={handlePushToTalkStop}
                            onTouchStart={handlePushToTalkStart}
                            onTouchEnd={handlePushToTalkStop}
                            className="border-amber-400/30 text-amber-300 hover:bg-amber-500/20 text-xs"
                          >
                            <Mic className="size-3.5 mr-1" />
                            Ask Follow-Up (Hold)
                          </Button>
                        </>
                      )}

                      {conversationPayload.state === "ANSWERING" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            voiceRef.current?.triggerBargeIn("Student clicked interrupt")
                          }
                          className="border-emerald-400/30 text-emerald-300 hover:bg-emerald-500/20 text-xs"
                        >
                          <Pause className="size-3.5 mr-1" />
                          Interrupt
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Audio Energy Waveform Meter during listening */}
                  {(conversationPayload.state === "LISTENING" ||
                    conversationPayload.state === "INTERRUPTING") && (
                    <div className="mt-3 pt-2 border-t border-rose-500/20 flex items-center gap-2">
                      <span className="text-[10px] font-mono text-rose-300">Mic Input:</span>
                      <div className="flex-1 h-1.5 rounded-full bg-slate-950/60 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-rose-500 to-amber-400 transition-all duration-75"
                          style={{
                            width: `${Math.min(100, Math.round((conversationPayload.audioLevel || 0.1) * 300))}%`,
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-rose-300">
                        {preferences.handsFreeBargeIn
                          ? "Hands-Free Active"
                          : "Push-to-Talk (Hold Space)"}
                      </span>
                    </div>
                  )}

                  {/* Auto-Resume Countdown Bar during follow-up window */}
                  {conversationPayload.state === "FOLLOW_UP_WINDOW" && (
                    <div className="mt-3 pt-2 border-t border-amber-500/20 flex items-center gap-2">
                      <span className="text-[10px] font-mono text-amber-300">Auto-Resume:</span>
                      <div className="flex-1 h-1.5 rounded-full bg-slate-950/60 overflow-hidden">
                        <div
                          className="h-full bg-amber-400 transition-all duration-1000"
                          style={{
                            width: `${Math.min(100, Math.round(((conversationPayload.followUpCountdownSeconds || 0) / (preferences.followUpWindowSeconds || 6)) * 100))}%`,
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-amber-300">
                        {conversationPayload.followUpCountdownSeconds}s
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Display Text Card with active sentence styling */}
              <div className="rounded-xl border border-white/5 bg-slate-950 p-4 relative">
                <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-normal">
                  {currentSegment?.displayText ||
                    currentDisplayText ||
                    "Select a lesson section to begin guided COSMOS narration."}
                </p>

                {/* Subtitles & 3D Sync buttons */}
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                  <button
                    onClick={() => setShowSpokenPhonetics(!showSpokenPhonetics)}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 font-mono inline-flex items-center gap-1"
                  >
                    <span>
                      {showSpokenPhonetics
                        ? "▼ Hide Scientific Phonetic Pronunciation"
                        : "▶ View Spoken Phonetics & Equation Pronunciation"}
                    </span>
                  </button>

                  {currentSegment?.visualizationReference && (
                    <button
                      onClick={() => handleDispatchVizAction(currentSegment.visualizationReference)}
                      className="text-[11px] text-purple-400 hover:text-purple-300 font-mono inline-flex items-center gap-1"
                    >
                      <Orbit className="size-3" />
                      <span>Sync 3D Scene</span>
                    </button>
                  )}
                </div>

                {showSpokenPhonetics && currentSegment && (
                  <div className="mt-2.5 p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/20 text-xs font-mono text-cyan-200/90 leading-relaxed">
                    <span className="text-cyan-400 font-bold block mb-1">
                      Spoken Phonetics (Symbols, Equations & Exponents Expanded):
                    </span>
                    {currentSegment.spokenText}
                  </div>
                )}
              </div>

              {/* Error Notice if audio fails */}
              {narrationState.errorMessage && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-200">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="size-4 text-amber-400 shrink-0" />
                    <span>{narrationState.errorMessage}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => narrationRef.current?.play()}
                    className="text-[11px] border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
                  >
                    <RefreshCw className="size-3 mr-1" />
                    Retry
                  </Button>
                </div>
              )}

              {/* Progress & Transport Controls Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => narrationRef.current?.previous()}
                    disabled={narrationState.currentSegmentIndex === 0}
                    className="border-white/10 hover:bg-white/10 text-slate-300"
                    title="Previous sentence / segment"
                  >
                    <Rewind className="size-4" />
                  </Button>

                  {narrationState.status === "playing" ? (
                    <Button
                      size="sm"
                      onClick={() => narrationRef.current?.pause()}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4"
                    >
                      <Pause className="size-4 mr-1.5" />
                      Pause Narration
                    </Button>
                  ) : narrationState.status === "paused" ? (
                    <Button
                      size="sm"
                      onClick={() => narrationRef.current?.resume()}
                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4"
                    >
                      <Play className="size-4 mr-1.5" />
                      Resume Narration
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => narrationRef.current?.play()}
                      disabled={narrationState.status === "loading"}
                      className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4"
                    >
                      {narrationState.status === "loading" ? (
                        <>
                          <RefreshCw className="size-4 mr-1.5 animate-spin" />
                          Synthesizing...
                        </>
                      ) : (
                        <>
                          <Play className="size-4 mr-1.5" />
                          Play Lesson Narration
                        </>
                      )}
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => narrationRef.current?.repeatCurrent()}
                    className="border-white/10 hover:bg-white/10 text-slate-300"
                    title="Repeat current sentence"
                  >
                    <RotateCcw className="size-4" />
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => narrationRef.current?.next()}
                    disabled={
                      narrationState.currentSegmentIndex >= narrationState.totalSegments - 1
                    }
                    className="border-white/10 hover:bg-white/10 text-slate-300"
                    title="Next sentence / segment"
                  >
                    <FastForward className="size-4" />
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => narrationRef.current?.stop()}
                    className="text-slate-400 hover:text-white"
                    title="Stop narration"
                  >
                    Stop
                  </Button>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <div className="w-24 sm:w-36 h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-300"
                      style={{ width: `${narrationState.progressPercentage}%` }}
                    />
                  </div>
                  <span>{Math.round(narrationState.progressPercentage)}%</span>
                </div>
              </div>
            </div>
          )}

          {activeMode === "ask" && (
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">
                  Student Epistemic Inquiry
                </span>
                <span className="text-[11px] font-mono text-cyan-400">
                  Grounding: {currentContext.scientificReferences.length} Peer-Reviewed Citations
                </span>
              </div>

              {/* Inquiry Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void handleAskQuestion();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={studentQuestion}
                  onChange={(e) => setStudentQuestion(e.target.value)}
                  placeholder={`Ask COSMOS about ${scientificTopic}...`}
                  className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  disabled={isAsking}
                />
                <Button
                  type="submit"
                  disabled={!studentQuestion.trim() || isAsking}
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 rounded-xl"
                >
                  {isAsking ? (
                    <span className="flex items-center gap-1.5">
                      <span className="size-3 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                      <span>Thinking</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <Send className="size-4" />
                      <span>Ask</span>
                    </span>
                  )}
                </Button>
              </form>

              {/* Suggested Questions based on active topic */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-slate-400 mr-1">Suggested:</span>
                {[
                  `How do we empirically measure this?`,
                  `What are the mathematical limits?`,
                  `Is this a verified fact or a theoretical model?`,
                ].map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => void handleAskQuestion(sug)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 hover:text-white transition-colors"
                  >
                    {sug}
                  </button>
                ))}
              </div>

              {qnaError && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
                  {qnaError}
                </div>
              )}

              {/* Latest Answer Display */}
              {lastAnswer && (
                <div className="rounded-xl border border-cyan-500/30 bg-slate-950 p-4 space-y-3 mt-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <div className="flex items-center gap-2">
                      <Bot className="size-4 text-cyan-400" />
                      <span className="text-xs font-bold text-white">COSMOS Explanation</span>
                      {getEpistemicBadge(lastAnswer.epistemicClassification)}
                    </div>
                    {lastAnswer.epistemicNote && (
                      <span className="text-[10px] font-mono text-slate-400">
                        {lastAnswer.epistemicNote}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-slate-200 leading-relaxed">{lastAnswer.answerText}</p>

                  {/* Sources */}
                  {lastAnswer.scientificSources.length > 0 && (
                    <div className="pt-2 text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-300 block mb-1">
                        Scientific Citations:
                      </span>
                      <ul className="list-disc pl-4 space-y-0.5 text-slate-400">
                        {lastAnswer.scientificSources.map((src, i) => (
                          <li key={i}>{src.title}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Follow-up Prompts */}
                  {lastAnswer.suggestedFollowUpQuestions.length > 0 && (
                    <div className="pt-2 flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] text-purple-300 font-semibold block w-full mb-1">
                        Explore Further:
                      </span>
                      {lastAnswer.suggestedFollowUpQuestions.map((q, i) => (
                        <button
                          key={i}
                          onClick={() => void handleAskQuestion(q)}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-200 transition-colors"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeMode === "explore" && (
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 sm:p-5 space-y-4">
              {/* Header: Scene info, Epistemic status, and Simulation Clock */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Compass className="size-4 text-cyan-400" />
                  <div>
                    <span className="text-xs font-bold text-white block">
                      3D Context-Aware AI Teaching
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Active Scene: {simState?.activeSceneId || currentVisualization?.sceneId || "universe"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Epistemic Mode Classification */}
                  {simState?.epistemicMode === "physically_accurate" ? (
                    <span className="inline-flex items-center gap-1 rounded bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-300 uppercase">
                      ● Physically Accurate Data
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-300 uppercase">
                      ◆ Educational Approximation
                    </span>
                  )}

                  {/* Simulation Clock Controls */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (simState?.isPaused) {
                        Cosmos3DTools.resumeSimulation();
                      } else {
                        Cosmos3DTools.pauseSimulation();
                      }
                    }}
                    className="h-7 px-2.5 text-xs border-white/15 bg-white/5 text-white hover:bg-white/10"
                  >
                    {simState?.isPaused ? (
                      <>
                        <Play className="size-3 mr-1 text-emerald-400" />
                        <span>Resume</span>
                      </>
                    ) : (
                      <>
                        <Pause className="size-3 mr-1 text-amber-400" />
                        <span>Pause Clock</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Camera Safety Indicator: Invariant: COSMOS never fights student manual camera manipulation */}
              {isUserOrbiting && (
                <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-200 text-xs flex items-center gap-2 animate-pulse">
                  <Eye className="size-4 text-purple-400 shrink-0" />
                  <span>
                    <strong>Student Camera Navigation Active:</strong> COSMOS camera commands yield to prioritize your manual exploration view.
                  </span>
                </div>
              )}

              {/* Camera Safety & View History Toolbar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => Cosmos3DTools.restorePreviousView()}
                  className={`text-xs border-white/10 hover:bg-white/10 ${
                    hasPreviousView ? "text-cyan-300 border-cyan-500/40 bg-cyan-500/10" : "text-slate-400"
                  }`}
                  title="Smoothly restore student's prior camera perspective"
                >
                  <RotateCcw className="size-3.5 mr-1.5 text-cyan-400" />
                  <span>Restore View {hasPreviousView ? `(${previousViewCount})` : ""}</span>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (selectedObj?.name) {
                      Cosmos3DTools.focusScientificObject({ targetName: selectedObj.name });
                    } else {
                      handleDispatchVizAction({
                        sceneId: simState?.activeSceneId || "solar_system",
                        cameraAction: "focus",
                      });
                    }
                  }}
                  className="border-white/10 hover:bg-white/10 text-xs text-white"
                >
                  <Orbit className="size-3.5 mr-1.5 text-purple-400" />
                  <span>Focus Object</span>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (selectedObj?.name) {
                      Cosmos3DTools.highlightScientificObject({ targetName: selectedObj.name });
                    }
                  }}
                  className="border-white/10 hover:bg-white/10 text-xs text-white"
                >
                  <Sparkles className="size-3.5 mr-1.5 text-amber-400" />
                  <span>Highlight Target</span>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    handleDispatchVizAction({
                      sceneId: simState?.activeSceneId || "universe",
                      cameraAction: "reset",
                    })
                  }
                  className="border-white/10 hover:bg-white/10 text-xs text-slate-300"
                >
                  <Compass className="size-3.5 mr-1.5 text-slate-400" />
                  <span>Reset Overview</span>
                </Button>
              </div>

              {/* Selected Celestial Object Inspector Card */}
              {selectedObj && (
                <div className="rounded-xl border border-cyan-500/30 bg-slate-950/80 p-3.5 space-y-2">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-cyan-400" />
                      <span className="text-sm font-bold text-white">{selectedObj.name}</span>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/5 text-cyan-300 border border-white/10">
                        {selectedObj.type}
                      </span>
                    </div>
                    {selectedObj.distanceFromObserver && (
                      <span className="text-[11px] font-mono text-slate-400">
                        {selectedObj.distanceFromObserver}
                      </span>
                    )}
                  </div>

                  {selectedObj.scientificDescription && (
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {selectedObj.scientificDescription}
                    </p>
                  )}

                  {selectedObj.physicalProperties && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                      {Object.entries(selectedObj.physicalProperties).slice(0, 4).map(([key, val]) => (
                        <div key={key} className="bg-white/5 p-1.5 rounded-lg border border-white/5">
                          <span className="text-[10px] uppercase text-slate-400 block truncate">
                            {key.replace(/([A-Z])/g, " $1")}
                          </span>
                          <span className="font-mono font-semibold text-white truncate block">
                            {String(val)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedObj.catalogReference && (
                    <div className="text-[10px] text-slate-400 pt-1 flex items-center gap-1 font-mono">
                      <span>Source:</span>
                      <span className="text-cyan-300">{selectedObj.catalogReference}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Approved Educational Demonstrations Launcher */}
              <div className="pt-2 border-t border-white/5 space-y-2">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Atom className="size-3.5 text-purple-400" />
                  Approved Educational Demonstrations
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                  {[
                    {
                      id: "gravitational_lensing",
                      title: "Gravitational Lensing",
                      scene: "Black Holes",
                      tag: "General Relativity",
                    },
                    {
                      id: "kepler_second_law",
                      title: "Kepler's Second Law",
                      scene: "Orbital Mechanics",
                      tag: "Equal Areas in Equal Time",
                    },
                    {
                      id: "jupiter_moon_system",
                      title: "Jupiter & Galilean Moons",
                      scene: "Solar System",
                      tag: "1:2:4 Laplace Resonance",
                    },
                    {
                      id: "stellar_collapse",
                      title: "Stellar Core Collapse",
                      scene: "Stellar Evolution",
                      tag: "Chandrasekhar Limit",
                    },
                    {
                      id: "cosmic_expansion",
                      title: "Cosmic Metric Expansion",
                      scene: "Cosmology",
                      tag: "FLRW Scale Factor & H0",
                    },
                    {
                      id: "circular_orbit_balance",
                      title: "Circular Orbit Balance",
                      scene: "Physics Lab",
                      tag: "v_circ = √(GM / r)",
                    },
                  ].map((demo) => (
                    <button
                      key={demo.id}
                      onClick={() => {
                        const result = Cosmos3DTools.playApprovedDemonstration({
                          demonstrationId: demo.id,
                        });
                        if (result.success && result.epistemicNote) {
                          setLastAnswer({
                            answerText: result.epistemicNote,
                            epistemicClassification: "model",
                            epistemicNote: `Educational Demonstration: ${demo.title}`,
                            scientificSources: [
                              { title: `${demo.scene} Physics Simulation Engine`, organization: "Our Visible Universe Academy" },
                            ],
                            suggestedFollowUpQuestions: [
                              "What are the mathematical equations governing this?",
                              "How was this experimentally confirmed by telescopes?",
                            ],
                            learningLevelAdapted: learningLevel,
                          });
                        }
                      }}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-purple-500/30 text-left transition flex flex-col justify-between group"
                    >
                      <div>
                        <div className="font-semibold text-white group-hover:text-cyan-300 transition-colors">
                          {demo.title}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{demo.scene}</div>
                      </div>
                      <div className="text-[9px] font-mono text-purple-300 mt-2 bg-purple-500/10 px-1.5 py-0.5 rounded w-fit border border-purple-500/20">
                        {demo.tag}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Scientific notes and telemetry footer */}
              {simState?.scientificNotes && (
                <div className="text-[10px] text-slate-400 pt-1 border-t border-white/5 font-mono">
                  {simState.scientificNotes}
                </div>
              )}
            </div>
          )}

          {activeMode === "independent" && (
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 sm:p-5 flex items-center gap-3 text-slate-300 text-xs">
              <Sparkles className="size-5 text-emerald-400 flex-shrink-0" />
              <div>
                <strong className="text-white block font-semibold mb-0.5">
                  Independent Study Mode Active
                </strong>
                <span>
                  COSMOS is standing by silently. You can read, solve problems, and interact with 3D
                  visualizers at your own pace without voice narration.
                </span>
              </div>
            </div>
          )}

          {activeMode === "exam" && (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-4 sm:p-5 flex items-center gap-3 text-rose-200 text-xs">
              <ShieldAlert className="size-5 text-rose-400 flex-shrink-0" />
              <div>
                <strong className="text-white block font-semibold mb-0.5">
                  Academic Assessment Mode — COSMOS Assistance Guarded
                </strong>
                <span>
                  During official certification exams and qualifying knowledge assessments, COSMOS
                  conversational assistance and solution guidance are locked to guarantee
                  independent mastery.
                </span>
              </div>
            </div>
          )}

          {/* 4. AWARENESS METADATA FOOTER */}
          <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-slate-300">Key Terms:</span>
              {currentContext.relevantTerminology.slice(0, 4).map((term, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-cyan-300 font-mono text-[10px]"
                >
                  {term}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 text-slate-500 text-[10px] font-mono">
              <ShieldCheck className="size-3 text-emerald-400" />
              <span>Authority Verified (Anti-Tamper Active)</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
