import React, { useState, useEffect, useCallback } from "react";
import type { ModuleCompletionEvaluation } from "@/lib/academy/completion.server";
import { getModuleCompletionStatus, recheckModuleCompletion } from "@/lib/academy/completion.functions";
import { useStudentAuth } from "@/lib/academy/useStudentAuth";
import {
  CheckCircle2,
  Circle,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  BookOpen,
  FlaskConical,
  Award,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export interface ModuleCompletionChecklistProps {
  moduleId: string;
  onNavigateToSection?: () => void;
  onNavigateToActivity?: () => void;
  onNavigateToAssessment?: () => void;
  onNextModule?: () => void;
  className?: string;
}

export function ModuleCompletionChecklist({
  moduleId,
  onNavigateToSection,
  onNavigateToActivity,
  onNavigateToAssessment,
  onNextModule,
  className = "",
}: ModuleCompletionChecklistProps) {
  const { isLoggedIn } = useStudentAuth();
  const [evaluation, setEvaluation] = useState<ModuleCompletionEvaluation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchStatus = useCallback(async () => {
    try {
      const data = await getModuleCompletionStatus({
        data: { moduleId },
      });
      setEvaluation(data);
    } catch (err) {
      console.warn("Could not fetch module completion checklist:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [moduleId]);

  useEffect(() => {
    void fetchStatus();
  }, [fetchStatus]);

  const handleManualRecheck = async () => {
    if (!isLoggedIn) {
      toast.info("Student Account Required for Certified Completion", {
        description: "Sign in or create a student profile to save verified achievements across sessions.",
      });
      return;
    }

    setRefreshing(true);
    try {
      const updated = await recheckModuleCompletion({
        data: { moduleId },
      });
      setEvaluation(updated);

      if (updated.isVerifiedComplete) {
        toast.success(`Module ${moduleId} Verified Complete!`, {
          description: "All learning requirements have been authoritatively validated.",
        });
      } else {
        toast.info("Requirements Incomplete", {
          description: updated.missingRequirements[0] || "Please fulfill the remaining checklist items.",
        });
      }
    } catch (err: any) {
      toast.error(err?.message || "Re-evaluation failed. Please retry.");
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className={`rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-xl ${className}`}>
        <div className="flex items-center gap-3">
          <div className="size-5 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
          <span className="text-xs text-slate-400">Verifying completion criteria...</span>
        </div>
      </div>
    );
  }

  if (!evaluation) return null;

  const satisfiedCount = evaluation.checklist.filter((item) => item.isSatisfied).length;
  const totalCount = evaluation.checklist.length;
  const isCertified = evaluation.isVerifiedComplete;

  return (
    <div
      className={`rounded-3xl border border-white/10 bg-slate-900/70 p-6 sm:p-7 backdrop-blur-xl shadow-xl shadow-black/20 ${className}`}
      role="region"
      aria-label="Module Completion Checklist"
    >
      {/* Header status bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            {isCertified ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full uppercase">
                <ShieldCheck className="size-3.5" />
                Verified Module Mastery
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 rounded-full uppercase">
                <ShieldAlert className="size-3.5" />
                Learning Requirements ({satisfiedCount}/{totalCount})
              </span>
            )}
            {evaluation.verifiedAt && (
              <span className="text-xs text-slate-400 hidden sm:inline">
                • Certified {new Date(evaluation.verifiedAt).toLocaleDateString()}
              </span>
            )}
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
            {isCertified ? "Module Certified & Recorded" : "Verified Completion Checklist"}
          </h3>
          <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
            {isCertified
              ? "All instructional concepts, laboratory evidence, and knowledge assessments are authoritatively verified."
              : "Cosmic Learning Academy enforces measurable learning criteria. Complete each requirement below to certify this module."}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRecheck}
            disabled={refreshing}
            className="text-xs border-white/10 text-slate-300 hover:text-white"
            title="Re-check completion eligibility on server"
          >
            <RotateCcw className={`size-3.5 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>{refreshing ? "Checking..." : "Re-check Status"}</span>
          </Button>
        </div>
      </div>

      {/* Checklist items */}
      <div className="mt-5 space-y-3">
        {evaluation.checklist.map((item) => (
          <div
            key={item.id}
            className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              item.isSatisfied
                ? "border-emerald-500/30 bg-emerald-950/10"
                : "border-white/10 bg-slate-950/40"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex-shrink-0">
                {item.isSatisfied ? (
                  <CheckCircle2 className="size-5 text-emerald-400" />
                ) : (
                  <Circle className="size-5 text-slate-500" />
                )}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-sm font-bold text-white">{item.title}</h4>
                  <span
                    className={`text-[11px] font-mono px-2 py-0.5 rounded-md ${
                      item.isSatisfied
                        ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                        : "bg-white/5 text-slate-400 border border-white/10"
                    }`}
                  >
                    {item.currentValue}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{item.description}</p>
                {item.accessibleAlternativeAvailable && !item.isSatisfied && (
                  <span className="text-[11px] text-cyan-300 block mt-1">
                    Equally rigorous 2D accessible alternative available in lab.
                  </span>
                )}
              </div>
            </div>

            {/* Incomplete Item CTA button */}
            {!item.isSatisfied && (
              <div className="self-end sm:self-auto flex-shrink-0">
                {item.category === "instructional" && onNavigateToSection && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onNavigateToSection}
                    className="text-xs text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                  >
                    <BookOpen className="size-3.5 mr-1.5" />
                    <span>Continue Learning</span>
                  </Button>
                )}
                {item.category === "activity" && onNavigateToActivity && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onNavigateToActivity}
                    className="text-xs text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                  >
                    <FlaskConical className="size-3.5 mr-1.5" />
                    <span>Open Activity</span>
                  </Button>
                )}
                {item.category === "assessment" && onNavigateToAssessment && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onNavigateToAssessment}
                    className="text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                  >
                    <Award className="size-3.5 mr-1.5" />
                    <span>Take Quiz</span>
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom Action Footer */}
      <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-xs text-slate-400">
          {isCertified
            ? "Your progress is permanently linked to your student transcript and certificate eligibility."
            : evaluation.missingRequirements[0]
              ? `Next Step: ${evaluation.missingRequirements[0]}`
              : "Fulfill all requirements to achieve official verified completion."}
        </div>

        <div className="flex items-center gap-3">
          {isCertified && onNextModule ? (
            <Button
              size="lg"
              onClick={onNextModule}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold shadow-lg shadow-emerald-500/20 border-none"
            >
              <span>Continue to Next Module</span>
              <ArrowRight className="size-4 ml-2" />
            </Button>
          ) : evaluation.recommendedAction === "take_assessment" && onNavigateToAssessment ? (
            <Button
              size="lg"
              onClick={onNavigateToAssessment}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold shadow-lg shadow-cyan-500/20 border-none"
            >
              <Award className="size-4 mr-2" />
              <span>Take Knowledge Check</span>
            </Button>
          ) : evaluation.recommendedAction === "complete_activity" && onNavigateToActivity ? (
            <Button
              size="lg"
              onClick={onNavigateToActivity}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold shadow-lg shadow-cyan-500/20 border-none"
            >
              <FlaskConical className="size-4 mr-2" />
              <span>Complete Required Activity</span>
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={onNavigateToSection}
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-md border-none"
            >
              <BookOpen className="size-4 mr-2" />
              <span>Continue Learning</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export interface ModuleStickyCompletionDrawerProps {
  moduleId: string;
  onNavigateToSection?: () => void;
  onNavigateToActivity?: () => void;
  onNavigateToAssessment?: () => void;
  onScrollToChecklist?: () => void;
  onNextModule?: () => void;
  className?: string;
}

export function ModuleStickyCompletionDrawer({
  moduleId,
  onNavigateToSection,
  onNavigateToActivity,
  onNavigateToAssessment,
  onScrollToChecklist,
  onNextModule,
  className = "",
}: ModuleStickyCompletionDrawerProps) {
  const [evaluation, setEvaluation] = useState<ModuleCompletionEvaluation | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const fetchStatus = useCallback(async () => {
    try {
      const data = await getModuleCompletionStatus({
        data: { moduleId },
      });
      setEvaluation(data);
    } catch {
      // quiet fallback
    }
  }, [moduleId]);

  useEffect(() => {
    void fetchStatus();
    const interval = setInterval(fetchStatus, 15000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  if (!evaluation) return null;

  const satisfiedCount = evaluation.checklist.filter((item) => item.isSatisfied).length;
  const totalCount = evaluation.checklist.length;
  const isCertified = evaluation.isVerifiedComplete;

  return (
    <aside
      aria-label="Module Completion Status Drawer"
      className={`fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-white/10 shadow-2xl transition-all duration-300 ${className}`}
    >
      {/* Expanded Peek Panel */}
      {isExpanded && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-3 pb-2 border-b border-white/5 animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              {evaluation.moduleTitle} — Verified Criteria
            </span>
            {onScrollToChecklist && (
              <button
                onClick={onScrollToChecklist}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
              >
                <span>Jump to Full Checklist</span>
                <ArrowRight className="size-3" />
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-1">
            {evaluation.checklist.map((item) => (
              <div
                key={item.id}
                className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                  item.isSatisfied
                    ? "border-emerald-500/30 bg-emerald-950/20 text-emerald-200"
                    : "border-white/10 bg-slate-900/60 text-slate-300"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {item.isSatisfied ? (
                    <CheckCircle2 className="size-4 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <Circle className="size-4 text-slate-500 flex-shrink-0" />
                  )}
                  <span className="truncate font-medium">{item.title}</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 flex-shrink-0">
                  {item.isSatisfied ? "Verified" : "Pending"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Single-Line Bar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Left Status Anchor */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            className="flex items-center gap-2 p-1 -ml-1 rounded-lg hover:bg-white/5 transition-colors text-left"
            aria-expanded={isExpanded}
            title={isExpanded ? "Collapse requirements tray" : "Expand requirements tray"}
          >
            {isCertified ? (
              <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full shrink-0">
                <ShieldCheck className="size-3.5" />
                <span>Certified</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-full shrink-0">
                <ShieldAlert className="size-3.5" />
                <span>{satisfiedCount}/{totalCount} Met</span>
              </span>
            )}
            <div className="hidden sm:block truncate text-xs text-slate-300">
              {isCertified
                ? "Official verified completion recorded."
                : evaluation.missingRequirements[0] || "Fulfill all criteria to certify."}
            </div>
            {isExpanded ? (
              <ChevronDown className="size-3.5 text-slate-400 ml-1 shrink-0" />
            ) : (
              <ChevronUp className="size-3.5 text-slate-400 ml-1 shrink-0" />
            )}
          </button>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {onScrollToChecklist && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onScrollToChecklist}
              className="text-xs text-slate-300 hover:text-white hover:bg-white/5 hidden md:inline-flex h-8"
            >
              Checklist
            </Button>
          )}

          {isCertified ? (
            onNextModule && (
              <Button
                size="sm"
                onClick={onNextModule}
                className="h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
              >
                <span>Next Module</span>
                <ArrowRight className="size-3.5 ml-1" />
              </Button>
            )
          ) : evaluation.recommendedAction === "take_assessment" && onNavigateToAssessment ? (
            <Button
              size="sm"
              onClick={onNavigateToAssessment}
              className="h-8 text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-sm"
            >
              <Award className="size-3.5 mr-1" />
              <span>Take Quiz</span>
            </Button>
          ) : evaluation.recommendedAction === "complete_activity" && onNavigateToActivity ? (
            <Button
              size="sm"
              onClick={onNavigateToActivity}
              className="h-8 text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-sm"
            >
              <FlaskConical className="size-3.5 mr-1" />
              <span>Open Lab</span>
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={onNavigateToSection}
              className="h-8 text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm"
            >
              <BookOpen className="size-3.5 mr-1" />
              <span>Review Lesson</span>
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
}

