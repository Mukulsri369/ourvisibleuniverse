import { ensurePracticeSession } from "@/lib/auth-client";
// @ts-nocheck
import React, { useState, useEffect, useRef, useCallback } from "react";
import type { LearningLevel } from "@/lib/academy/types";
import type {
  ClientAssessmentQuestion,
  AssessmentMode,
  AssessmentResult,
  FinalExamEligibilityResult,
  TopicStrength,
  TopicRequiringReview,
} from "@/lib/academy/assessment-types";
import {
  startAssessmentAttempt,
  submitAssessmentAttempt,
  getFinalExamEligibility,
  claimOfficialCertificate,
} from "@/lib/academy/assessment.functions";
import { issueOfficialCertificate } from "@/lib/academy/certificate.functions";
import type { CanonicalCertificate } from "@/lib/academy/certificate-types";
import { useStudentAuth } from "@/lib/academy/useStudentAuth";
import { CosmicCertificateModal } from "./CosmicCertificateModal";
import {
  Award,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  RotateCcw,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  Clock,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Lock,
  Unlock,
  AlertTriangle,
  GraduationCap,
  ExternalLink,
  Layers,
  HelpCircle,
  FileText,
  Compass,
  Mic,
  MicOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CosmosInputCoordinator } from "@/lib/cosmos/CosmosInputCoordinator";

export interface FinalExamEngineProps {
  initialLevel?: LearningLevel;
  initialMode?: AssessmentMode;
  onBackToAcademy?: () => void;
  onSelectModule?: (moduleId: string) => void;
}

export const FinalExamEngine: React.FC<FinalExamEngineProps> = ({
  initialLevel = "explorer",
  initialMode = "official",
  onBackToAcademy,
  onSelectModule,
}) => {
  const { isLoggedIn, user, profile } = useStudentAuth();

  // Mode and adaptive level
  const [level, setLevel] = useState<LearningLevel>(initialLevel);
  const [mode, setMode] = useState<AssessmentMode>(initialMode);

  // Eligibility state
  const [checkingEligibility, setCheckingEligibility] = useState<boolean>(true);
  const [eligibility, setEligibility] = useState<FinalExamEligibilityResult | null>(null);

  // Exam session state
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<ClientAssessmentQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  // Timer
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Authoritative graded result
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [showCertificateModal, setShowCertificateModal] = useState<boolean>(false);
  const [claimingCertificate, setClaimingCertificate] = useState<boolean>(false);
  const [issuedCert, setIssuedCert] = useState<CanonicalCertificate | null>(null);

  // Review confirmation modal before submission
  const [showSubmitConfirm, setShowSubmitConfirm] = useState<boolean>(false);

  // Non-generative narration & voice answer state
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [speechPaused, setSpeechPaused] = useState<boolean>(false);
  const [isListeningVoice, setIsListeningVoice] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  // 1. Fetch Eligibility on mount
  const checkEligibility = useCallback(async () => {
    setCheckingEligibility(true);
    try {
      const res = await getFinalExamEligibility({ data: { userId: user?.id || "" } });
      setEligibility(res);
    } catch (err: any) {
      console.warn("Could not check final exam eligibility:", err);
      // Fallback
      setEligibility({
        isEligible: false,
        totalVerified: 0,
        requiredTotal: 24,
        missingModules: [],
        verifiedModuleIds: [],
        courseId: "cosmic_journey",
        courseVersion: "1.0.0",
      });
    } finally {
      setCheckingEligibility(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void checkEligibility();
  }, [checkEligibility]);

  // 2. Start Exam Attempt
  const handleStartExam = async (selectedMode: AssessmentMode = mode) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setAnswers({});
    setCurrentIndex(0);
    setElapsedSeconds(0);
    stopSpeech();

    try {
      await ensurePracticeSession();
      const response = await startAssessmentAttempt({
        data: {
          moduleId: "exam",
          level,
          mode: selectedMode,
        },
      });

      setAttemptId(response.attemptId);
      setQuestions(response.questions);
      setMode(selectedMode);
      startTimeRef.current = Date.now();

      // Start timer
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);

      toast.success(
        selectedMode === "official"
          ? "Official Final Knowledge Assessment initialized. COSMOS assistance is disabled."
          : "Practice examination loaded.",
      );
    } catch (err: any) {
      setError(
        err?.message ||
          "Could not initialize Final Knowledge Assessment. Please verify prerequisites.",
      );
      toast.error(err?.message || "Assessment start failed");
    } finally {
      setLoading(false);
    }
  };

  // Timer cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopSpeech();
    };
  }, []);

  // 3. Accessible Non-Generative Speech Narration
  const speakCurrentQuestion = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast.info("Text-to-speech audio narration is not supported in this browser.");
      return;
    }

    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    window.speechSynthesis.cancel();

    const optionsText = currentQ.options
      .map((opt, i) => `Option ${String.fromCharCode(65 + i)}: ${opt}.`)
      .join(" ");

    const textToRead = `Question ${currentIndex + 1} of ${questions.length}. ${currentQ.stageTitle || ""}. ${currentQ.questionText}. ${optionsText}`;

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setSpeechPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeechPaused(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeechPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const pauseSpeech = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      if (speechPaused) {
        window.speechSynthesis.resume();
        setSpeechPaused(false);
      } else {
        window.speechSynthesis.pause();
        setSpeechPaused(true);
      }
    }
  };

  const stopSpeech = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setSpeechPaused(false);
  };

  // Automatically cancel speech when question changes
  useEffect(() => {
    stopSpeech();
  }, [currentIndex]);

  // Answer selection
  const handleSelectOption = useCallback(
    (optionIndex: number) => {
      const currentQ = questions[currentIndex];
      if (!currentQ) return;

      setAnswers((prev) => ({
        ...prev,
        [currentQ.id]: optionIndex,
      }));
    },
    [questions, currentIndex],
  );

  // Voice Answer Selection & Confirmation via CosmosInputCoordinator (Proctor Mode: Zero Answer Leakage)
  const handleToggleVoiceAnswer = () => {
    if (isListeningVoice && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      setIsListeningVoice(false);
      return;
    }

    if (typeof window === "undefined") return;
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRec) {
      toast.info(
        "Browser speech recognition is unavailable. Use keyboard keys 1-4 or click an option.",
      );
      return;
    }

    try {
      stopSpeech();
      const rec = new SpeechRec();
      rec.lang = "en-US";
      rec.interimResults = false;
      rec.maxAlternatives = 1;

      rec.onstart = () => setIsListeningVoice(true);
      rec.onend = () => setIsListeningVoice(false);
      rec.onerror = () => setIsListeningVoice(false);

      rec.onresult = (event: any) => {
        const transcript = event?.results?.[0]?.[0]?.transcript?.trim() || "";
        if (!transcript) return;

        const currentQ = questions[currentIndex];
        if (!currentQ) return;

        const coord = CosmosInputCoordinator.getInstance();
        const parsed = coord.parseUtterance(transcript, "WAITING_FOR_ANSWER", true);

        if (parsed.intent === "OPTION_SELECT" && parsed.optionIndex !== undefined) {
          if (parsed.optionIndex < currentQ.options.length) {
            handleSelectOption(parsed.optionIndex);
            const letter = String.fromCharCode(65 + parsed.optionIndex);
            toast.success(
              `Voice selected Option ${letter}. Say "Confirm" or click Next Question to proceed.`,
            );
          }
        } else if (parsed.intent === "CONFIRM_ANSWER") {
          if (answers[currentQ.id] !== undefined) {
            if (currentIndex < questions.length - 1) {
              setCurrentIndex((prev) => prev + 1);
              toast.success("Answer confirmed. Moved to next question.");
            } else {
              setShowSubmitConfirm(true);
            }
          } else {
            toast.info("Please select an option (A, B, C, or D) before confirming.");
          }
        } else if (parsed.intent === "HINT_REQUEST") {
          if (mode === "official") {
            toast.warning(
              "COSMOS Proctor: Hints and explanations are strictly disabled during the Official Certification Examination.",
            );
          } else {
            toast.info(
              `Focus on ${currentQ.stageTitle || "Stage"} — ${currentQ.learningObjective || "Core Principles"}.`,
            );
          }
        } else {
          // Try matching option text
          const matchedIdx = coord.matchVoiceToOptionIndex(transcript, currentQ.options);
          if (matchedIdx !== null) {
            handleSelectOption(matchedIdx);
            const letter = String.fromCharCode(65 + matchedIdx);
            toast.success(`Voice selected Option ${letter}.`);
          } else {
            toast.info(
              `Heard "${transcript}". Say "Option A", "Option B", "Option C", "Option D", or "Confirm".`,
            );
          }
        }
      };

      recognitionRef.current = rec;
      rec.start();
    } catch {
      setIsListeningVoice(false);
    }
  };

  // 4. Submit Examination
  const handleSubmitExam = async () => {
    if (!attemptId) return;

    setSubmitting(true);
    setError(null);
    setShowSubmitConfirm(false);
    stopSpeech();

    if (timerRef.current) clearInterval(timerRef.current);

    const clientDuration = Math.round((Date.now() - startTimeRef.current) / 1000);

    try {
      const res = await submitAssessmentAttempt({
        data: {
          attemptId,
          moduleId: "exam",
          level,
          mode,
          answers,
          clientDurationSeconds: clientDuration,
          idempotencyKey: `final_exam_${attemptId}_${user?.id || "anon"}`,
        },
      });

      setResult(res);

      if (res.passed) {
        toast.success(
          `Verified Pass! Score: ${res.score}/${res.totalPoints} (${res.percentage}%). Certificate unlocked!`,
        );
      } else {
        toast.error(
          `Assessment complete. Score: ${res.score}/${res.totalPoints} (${res.percentage}%). Minimum passing score is 80%.`,
        );
      }
    } catch (err: any) {
      setError(err?.message || "Submission failed. Please check network and try again.");
      toast.error(err?.message || "Grading error");
    } finally {
      setSubmitting(false);
    }
  };

  // Claim verified certificate
  const handleClaimCertificate = async () => {
    setClaimingCertificate(true);
    try {
      const res = await issueOfficialCertificate({
        data: { userId: user?.id, level },
      });
      setIssuedCert(res.certificate);
      setShowCertificateModal(true);
      toast.success(
        res.isExisting
          ? "Official certificate retrieved successfully!"
          : "Congratulations! Official certificate issued and verified!",
      );
    } catch (err: any) {
      toast.error(err?.message || "Could not issue certificate.");
    } finally {
      setClaimingCertificate(false);
    }
  };

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const isAllAnswered = questions.length > 0 && answeredCount === questions.length;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${rem.toString().padStart(2, "0")}`;
  };

  // Keyboard navigation for options (1, 2, 3, 4)
  useEffect(() => {
    if (!currentQuestion || result || showSubmitConfirm) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === "1") handleSelectOption(0);
      else if (e.key === "2") handleSelectOption(1);
      else if (e.key === "3") handleSelectOption(2);
      else if (e.key === "4") handleSelectOption(3);
      else if (e.key === "ArrowRight" && currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else if (e.key === "ArrowLeft" && currentIndex > 0) {
        setCurrentIndex((prev) => prev - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    currentQuestion,
    result,
    showSubmitConfirm,
    currentIndex,
    questions.length,
    handleSelectOption,
  ]);

  // =========================================================================
  // VIEW 1: ELIGIBILITY CHECKING OR LOCKED VIEW
  // =========================================================================
  if (checkingEligibility) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="relative mb-4">
          <div className="size-12 rounded-full border-2 border-amber-500/20 border-t-amber-400 animate-spin" />
          <Award className="size-5 text-amber-400 absolute inset-0 m-auto" />
        </div>
        <h3 className="text-base font-bold text-white">Verifying Final Examination Eligibility</h3>
        <p className="text-xs text-slate-400 mt-1">
          Validating authoritative server-side completion across all 24 modules...
        </p>
      </div>
    );
  }

  // Not eligible and not yet started an attempt
  if (eligibility && !eligibility.isEligible && !attemptId && !result) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 py-6 px-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            {onBackToAcademy && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBackToAcademy}
                className="text-slate-400 hover:text-white -ml-2"
              >
                <ArrowLeft className="size-4 mr-1.5" />
                Academy Hub
              </Button>
            )}
            <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
              PREREQUISITE GATEWAY
            </span>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {eligibility.totalVerified} / 24 Modules Certified
          </span>
        </div>

        {/* Locked Hero Banner */}
        <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-950/20 via-slate-900 to-slate-950 p-6 sm:p-10 text-center relative overflow-hidden shadow-2xl">
          <div className="size-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-4">
            <Lock className="size-8" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Cosmic Explorer — Final Knowledge Assessment
          </h1>
          <p className="text-sm text-slate-300 max-w-xl mx-auto mt-2 leading-relaxed">
            The official capstone examination evaluates learning across all 24 modules and 6
            celestial stages. To ensure legitimate academic rigor, the official assessment unlocks
            strictly after verified server completion of every module.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <div className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-amber-300">
              Verified Progress: {eligibility.totalVerified} / 24 Modules
            </div>
            <div className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-slate-400">
              Passing Standard: 80% (16 / 20 correct)
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {onBackToAcademy && (
              <Button
                onClick={onBackToAcademy}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
              >
                <BookOpen className="size-4 mr-2" />
                Return to Modules
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => handleStartExam("practice")}
              className="border-white/20 text-slate-200 hover:bg-white/5"
            >
              <Compass className="size-4 mr-2" />
              Try Practice Drill (Uncertified)
            </Button>
          </div>
        </div>

        {/* Missing Modules Breakdown */}
        {eligibility.missingModules.length > 0 && (
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="size-4 text-amber-400" />
                  Modules Remaining for Official Eligibility ({eligibility.missingModules.length})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Complete these modules and pass their authoritative checks to unlock the final
                  exam.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
              {eligibility.missingModules.map((mod) => (
                <div
                  key={mod.id}
                  className="p-3 rounded-xl border border-white/5 bg-white/[0.02] flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                      <span className="text-cyan-400 font-bold">Mod #{mod.id}</span>
                      <span>•</span>
                      <span>Stage 0{mod.stageId}</span>
                    </div>
                    <div className="text-xs font-semibold text-white truncate max-w-[170px] mt-0.5">
                      {mod.title}
                    </div>
                  </div>
                  {onSelectModule && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onSelectModule(mod.id)}
                      className="size-7 p-0 text-slate-400 hover:text-white"
                      title={`Go to Module ${mod.id}`}
                    >
                      <ChevronRight className="size-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: GRADED RESULT VERDICT & FEEDBACK
  // =========================================================================
  if (result) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 py-6 px-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            {onBackToAcademy && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBackToAcademy}
                className="text-slate-400 hover:text-white -ml-2"
              >
                <ArrowLeft className="size-4 mr-1.5" />
                Academy Hub
              </Button>
            )}
            <span className="text-xs font-mono text-slate-400 font-bold uppercase tracking-wider">
              AUTHORITATIVE GRADING VERDICT
            </span>
          </div>
          <span className="text-xs font-mono text-slate-400">Attempt ID: {result.attemptId}</span>
        </div>

        {/* Verdict Banner */}
        <div
          className={`rounded-3xl border p-6 sm:p-10 text-center relative overflow-hidden shadow-2xl ${
            result.passed
              ? "border-emerald-500/40 bg-gradient-to-br from-emerald-950/30 via-slate-900 to-slate-950"
              : "border-rose-500/30 bg-gradient-to-br from-rose-950/20 via-slate-900 to-slate-950"
          }`}
        >
          <div
            className={`size-20 rounded-2xl flex items-center justify-center mx-auto mb-4 border ${
              result.passed
                ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                : "bg-rose-500/10 border-rose-500/30 text-rose-400"
            }`}
          >
            {result.passed ? <Award className="size-10" /> : <ShieldAlert className="size-10" />}
          </div>

          <span
            className={`text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
              result.passed
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-rose-500/10 border-rose-500/30 text-rose-400"
            }`}
          >
            {result.passed ? "OFFICIAL CERTIFICATION PASS" : "NEEDS FURTHER STUDY"}
          </span>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-3">
            {result.passed
              ? "Congratulations, Cosmic Explorer!"
              : "Knowledge Assessment Incomplete"}
          </h1>

          <p className="text-sm text-slate-300 max-w-xl mx-auto mt-2 leading-relaxed">
            {result.passed
              ? "You have demonstrated rigorous scientific mastery across the entire 24-module Cosmic Learning Academy curriculum. Your achievement has been authoritatively verified on the backend."
              : "Astronomical discovery is built on iteration and inquiry. Review the specific learning objectives and lessons highlighted below, and retry the examination when you feel confident."}
          </p>

          {/* Quantitative Score Metrics */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="p-3.5 rounded-2xl border border-white/5 bg-white/[0.02]">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Score</span>
              <span className="text-xl sm:text-2xl font-bold text-white">
                {result.score} / {result.totalPoints}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl border border-white/5 bg-white/[0.02]">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">
                Percentage
              </span>
              <span
                className={`text-xl sm:text-2xl font-bold ${
                  result.passed ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {result.percentage}%
              </span>
            </div>
            <div className="p-3.5 rounded-2xl border border-white/5 bg-white/[0.02]">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">
                Passing Goal
              </span>
              <span className="text-xl sm:text-2xl font-bold text-slate-300">80.0%</span>
            </div>
            <div className="p-3.5 rounded-2xl border border-white/5 bg-white/[0.02]">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">
                Tier Level
              </span>
              <span className="text-xl sm:text-2xl font-bold text-cyan-400 capitalize">
                {result.level}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {result.passed ? (
              <Button
                onClick={handleClaimCertificate}
                disabled={claimingCertificate}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold px-6 py-2.5 shadow-lg shadow-amber-500/20"
              >
                <Award className="size-4 mr-2" />
                {claimingCertificate ? "Verifying..." : "View Official Digital Certificate"}
              </Button>
            ) : (
              <Button
                onClick={() => handleStartExam(mode)}
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-6"
              >
                <RotateCcw className="size-4 mr-2" />
                Retry Assessment (Fresh Questions)
              </Button>
            )}

            {onBackToAcademy && (
              <Button
                variant="outline"
                onClick={onBackToAcademy}
                className="border-white/20 text-slate-200 hover:bg-white/5"
              >
                Return to Academy Hub
              </Button>
            )}
          </div>
        </div>

        {/* Broad Topic Strengths Breakdown across 6 Stages */}
        {result.topicStrengths && result.topicStrengths.length > 0 && (
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="size-4 text-cyan-400" />
                Cosmic Curriculum Domain Strengths (6 Celestial Stages)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluates competency across all curriculum tiers according to the balanced
                blueprint.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {result.topicStrengths.map((topic) => (
                <div
                  key={topic.stageId}
                  className="p-4 rounded-xl border border-white/5 bg-white/[0.02] space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-cyan-400 font-bold">
                      Stage 0{topic.stageId}
                    </span>
                    <span
                      className={`font-mono text-[11px] px-2 py-0.5 rounded-full border ${
                        topic.status === "mastered"
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : topic.status === "proficient"
                            ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-300"
                            : "bg-amber-500/10 border-amber-500/30 text-amber-300"
                      }`}
                    >
                      {topic.status === "mastered"
                        ? "Mastered"
                        : topic.status === "proficient"
                          ? "Proficient"
                          : "Review Needed"}
                    </span>
                  </div>

                  <h4 className="text-xs font-semibold text-white leading-snug line-clamp-1">
                    {topic.stageTitle.split(":")[1] || topic.stageTitle}
                  </h4>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <span>
                      {topic.correctCount} / {topic.totalCount} correct
                    </span>
                    <span className="font-mono font-bold text-slate-200">{topic.percentage}%</span>
                  </div>

                  {/* Progress meter */}
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        topic.status === "mastered"
                          ? "bg-emerald-400"
                          : topic.status === "proficient"
                            ? "bg-cyan-400"
                            : "bg-amber-400"
                      }`}
                      style={{ width: `${topic.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Topics Requiring Review */}
        {result.topicsRequiringReview && result.topicsRequiringReview.length > 0 && (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-950/10 p-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpen className="size-4 text-amber-400" />
                Curriculum Concepts Requiring Review ({result.topicsRequiringReview.length})
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Targeted review recommendations based on missed assessment questions.
              </p>
            </div>

            <div className="space-y-3 pt-1">
              {result.topicsRequiringReview.map((rev, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-white/5 bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                      <span className="text-amber-400 font-bold">Module {rev.moduleId}</span>
                      <span>•</span>
                      <span>Stage 0{rev.stageId}</span>
                    </div>
                    <h5 className="text-xs font-semibold text-white">{rev.moduleTitle}</h5>
                    <p className="text-[11px] text-slate-300">{rev.learningObjective}</p>
                  </div>

                  {onSelectModule && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onSelectModule(rev.moduleId)}
                      className="border-white/10 text-xs shrink-0 text-cyan-300 hover:text-white"
                    >
                      Review Module {rev.moduleId}
                      <ArrowRight className="size-3 ml-1.5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Question Review Accordion */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="size-4 text-cyan-400" />
            Comprehensive Question Breakdown (20 Questions)
          </h3>

          <div className="space-y-3 pt-2">
            {result.feedback.map((item, idx) => {
              const isCorrect = item.isCorrect;
              return (
                <div
                  key={item.questionId}
                  className={`p-4 rounded-xl border transition-colors ${
                    isCorrect
                      ? "border-emerald-500/20 bg-emerald-950/10"
                      : "border-rose-500/20 bg-rose-950/10"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`size-6 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                          isCorrect
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-rose-500/20 text-rose-300"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-white">{item.questionText}</span>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5 text-xs font-mono">
                      {isCorrect ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="size-3.5" />
                          Correct
                        </span>
                      ) : (
                        <span className="text-rose-400 flex items-center gap-1">
                          <XCircle className="size-3.5" />
                          Incorrect
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 text-xs space-y-1.5 pl-8 text-slate-300">
                    <p className="text-[11px] leading-relaxed">
                      <strong className="text-slate-200">Scientific Explanation:</strong>{" "}
                      {item.explanation}
                    </p>
                    <p className="text-[10px] font-mono text-slate-400">
                      Primary Source: {item.sourceReference}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Certificate Modal */}
        <CosmicCertificateModal
          isOpen={showCertificateModal}
          onClose={() => setShowCertificateModal(false)}
          level={result.level}
          completedLabCount={24}
          finalChallengePassed={result.passed}
          examScore={result.percentage}
          existingCertificate={issuedCert || undefined}
        />
      </div>
    );
  }

  // =========================================================================
  // VIEW 3: ACTIVE EXAMINATION RUNNER
  // =========================================================================
  if (questions.length === 0) {
    // Initial welcome / launcher screen
    return (
      <div className="max-w-4xl mx-auto space-y-8 py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            {onBackToAcademy && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBackToAcademy}
                className="text-slate-400 hover:text-white -ml-2"
              >
                <ArrowLeft className="size-4 mr-1.5" />
                Academy Hub
              </Button>
            )}
            <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
              OFFICIAL FINAL ASSESSMENT
            </span>
          </div>
          <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="size-3.5" />
            Prerequisites Verified (24/24)
          </span>
        </div>

        {/* Exam Hero Launcher */}
        <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-950/20 via-slate-900 to-slate-950 p-6 sm:p-10 text-center relative overflow-hidden shadow-2xl">
          <div className="size-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-4">
            <Award className="size-8" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Cosmic Explorer — Final Knowledge Assessment
          </h1>
          <p className="text-sm text-slate-300 max-w-xl mx-auto mt-2 leading-relaxed">
            Welcome to the final assessment for the entire Cosmic Journey curriculum. You will be
            evaluated across 20 questions systematically drawn from all 6 celestial stages and 24
            modules.
          </p>

          {/* Key Assessment Constraints */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto mt-6 text-left">
            <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02]">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">
                Questions
              </span>
              <span className="text-sm font-bold text-white">20 Questions</span>
            </div>
            <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02]">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">
                Passing Score
              </span>
              <span className="text-sm font-bold text-amber-400">80% (16 / 20)</span>
            </div>
            <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02]">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">Coverage</span>
              <span className="text-sm font-bold text-cyan-300">All 6 Stages</span>
            </div>
            <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02]">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">
                COSMOS AI
              </span>
              <span className="text-sm font-bold text-rose-400">Disabled (Exam)</span>
            </div>
          </div>

          {/* Age-Adaptive Tier Selection */}
          <div className="mt-8 max-w-md mx-auto space-y-2">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block text-left">
              Select Age-Adaptive Evaluation Level:
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(["junior", "explorer", "astronomer"] as LearningLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setLevel(lvl)}
                  className={`p-2.5 rounded-xl text-xs font-bold transition border capitalize ${
                    level === lvl
                      ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md"
                      : "bg-slate-900 border-white/10 text-slate-400 hover:text-white"
                  }`}
                >
                  {lvl === "junior"
                    ? "Junior"
                    : lvl === "explorer"
                      ? "Space Explorer"
                      : "Astronomer"}
                </button>
              ))}
            </div>
          </div>

          {/* Launch Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button
              onClick={() => handleStartExam("official")}
              disabled={loading}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-8 py-2.5 shadow-lg shadow-amber-500/20"
            >
              {loading ? "Preparing Assessment..." : "Begin Official Examination"}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleStartExam("practice")}
              className="border-white/20 text-slate-300 hover:bg-white/5"
            >
              Practice Run (No Certificate)
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Active question in progress
  return (
    <div className="max-w-4xl mx-auto space-y-6 py-6 px-4">
      {/* 1. Exam Top Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
              {mode === "official" ? "OFFICIAL EXAMINATION" : "PRACTICE DRILL"}
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs font-mono text-cyan-400 capitalize">{level} Level</span>
          </div>
          <h2 className="text-lg font-bold text-white">
            Cosmic Explorer — Final Knowledge Assessment
          </h2>
        </div>

        <div className="flex items-center gap-4">
          {/* Elapsed Timer */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-white/10 text-xs font-mono text-slate-300">
            <Clock className="size-3.5 text-cyan-400" />
            <span>{formatTime(elapsedSeconds)}</span>
          </div>

          {/* Exam Mode Security Notice */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
            <ShieldAlert className="size-3.5" />
            <span>COSMOS Disabled</span>
          </div>
        </div>
      </div>

      {/* 2. Question Matrix Grid (1 to 20) */}
      <div className="p-3.5 rounded-2xl border border-white/5 bg-slate-900/60">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span>Question Navigation ({answeredCount} / 20 Answered)</span>
          <span className="font-mono text-cyan-400">Target: &gt;= 16 to Pass</span>
        </div>

        <div className="grid grid-cols-10 sm:grid-cols-20 gap-1.5">
          {questions.map((q, idx) => {
            const isAnswered = answers[q.id] !== undefined;
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`size-8 rounded-lg text-xs font-mono font-bold transition flex items-center justify-center border ${
                  isCurrent
                    ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md ring-2 ring-amber-400/40"
                    : isAnswered
                      ? "bg-cyan-950/60 border-cyan-500/40 text-cyan-300"
                      : "bg-slate-800/40 border-white/5 text-slate-400 hover:bg-slate-800"
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Main Question Display Card */}
      {currentQuestion && (
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 sm:p-8 space-y-6 shadow-xl">
          {/* Question Metadata & Accessible Narration Control */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[11px] font-mono font-bold">
                  {currentQuestion.stageTitle || `Stage ${currentQuestion.stageId}`}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Module #{currentQuestion.moduleId}
                </span>
              </div>
              <span className="text-xs text-slate-400 block">
                Objective: {currentQuestion.learningObjective || "Astrophysical Principles"}
              </span>
            </div>

            {/* Accessible Audio Narration & Voice Answer System */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Button
                size="sm"
                variant="outline"
                onClick={handleToggleVoiceAnswer}
                className={`text-xs border-white/10 ${
                  isListeningVoice
                    ? "bg-rose-500/20 text-rose-300 border-rose-400/40 animate-pulse"
                    : "text-slate-300 hover:text-white"
                }`}
                title='Speak "Option A", "Option B", "Option C", "Option D", or "Confirm"'
              >
                {isListeningVoice ? (
                  <MicOff className="size-3.5 mr-1.5" />
                ) : (
                  <Mic className="size-3.5 mr-1.5 text-cyan-400" />
                )}
                {isListeningVoice ? "Listening..." : "Voice Answer"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={isSpeaking ? pauseSpeech : speakCurrentQuestion}
                className={`text-xs border-white/10 ${
                  isSpeaking ? "bg-cyan-500/20 text-cyan-300" : "text-slate-300 hover:text-white"
                }`}
                title="Read question text and choices aloud"
              >
                <Volume2 className="size-3.5 mr-1.5" />
                {isSpeaking ? (speechPaused ? "Resume" : "Pause Audio") : "Read Aloud"}
              </Button>
              {isSpeaking && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={stopSpeech}
                  className="size-8 p-0 text-slate-400 hover:text-white"
                  title="Stop audio narration"
                >
                  <Square className="size-3.5" />
                </Button>
              )}
            </div>
          </div>

          {/* Question Wording */}
          <div className="space-y-2">
            <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
              QUESTION {currentIndex + 1} OF {questions.length}
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
              {currentQuestion.questionText}
            </h3>
          </div>

          {/* Options Grid */}
          <div className="space-y-3 pt-2">
            {currentQuestion.options.map((option, optIdx) => {
              const isSelected = answers[currentQuestion.id] === optIdx;
              return (
                <button
                  key={optIdx}
                  onClick={() => handleSelectOption(optIdx)}
                  className={`w-full p-4 rounded-2xl text-left transition flex items-center justify-between border ${
                    isSelected
                      ? "bg-amber-500/10 border-amber-500/60 text-white shadow-lg shadow-amber-500/10"
                      : "bg-slate-950/40 border-white/5 text-slate-300 hover:bg-slate-800/40 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`size-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                        isSelected ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span className="text-sm font-medium">{option}</span>
                  </div>

                  <div
                    className={`size-4 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected
                        ? "border-amber-400 bg-amber-400"
                        : "border-white/20 bg-transparent"
                    }`}
                  >
                    {isSelected && <div className="size-1.5 rounded-full bg-slate-950" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-white/10">
            <Button
              variant="outline"
              size="sm"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              className="border-white/10 text-slate-300"
            >
              <ChevronLeft className="size-4 mr-1" />
              Previous
            </Button>

            {currentIndex < questions.length - 1 ? (
              <Button
                size="sm"
                onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
              >
                Next Question
                <ChevronRight className="size-4 ml-1" />
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => setShowSubmitConfirm(true)}
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold px-6"
              >
                Review & Submit Final Exam
              </Button>
            )}
          </div>
        </div>
      )}

      {/* 4. Submission Confirmation Drawer */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900 p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <AlertTriangle className="size-5" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">Submit Examination?</h4>
                <p className="text-xs text-slate-400">
                  Authoritative server-side grading will compute your score across all 6 stages.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Total Answered:</span>
                <span className="font-bold text-white font-mono">{answeredCount} / 20</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Unanswered:</span>
                <span
                  className={`font-bold font-mono ${
                    questions.length - answeredCount > 0 ? "text-amber-400" : "text-emerald-400"
                  }`}
                >
                  {questions.length - answeredCount}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Minimum Passing Threshold:</span>
                <span className="font-bold text-cyan-400 font-mono">16 / 20 (80.0%)</span>
              </div>
            </div>

            {questions.length - answeredCount > 0 && (
              <p className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg">
                Notice: You have {questions.length - answeredCount} unanswered questions. Unanswered
                questions will be scored as 0 points.
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSubmitConfirm(false)}
                className="border-white/10 text-white"
              >
                Return to Review
              </Button>
              <Button
                size="sm"
                disabled={submitting}
                onClick={handleSubmitExam}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
              >
                {submitting ? "Grading on Server..." : "Confirm & Submit"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
