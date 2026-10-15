import React, { useState } from "react";
import type { UserProgress } from "@/lib/academy/types";
import { LEARNING_LEVELS } from "@/lib/academy/registry";
import {
  Award,
  Download,
  RotateCcw,
  CheckCircle2,
  BookOpen,
  Sparkles,
  Bookmark,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProgressTrackerProps {
  progress: UserProgress;
  onExport: () => void;
  onReset: () => void;
}

export function ProgressTracker({ progress, onExport, onReset }: ProgressTrackerProps) {
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const currentLevelInfo = LEARNING_LEVELS[progress.selectedLevel];

  // Calculate statistics
  const totalCompleted = Object.values(progress.moduleProgress).filter(
    (m) => m.status === "completed",
  ).length;

  const totalQuizzes = Object.keys(progress.quizScores).length;
  const averageQuizScore =
    totalQuizzes > 0
      ? Math.round(
          Object.values(progress.quizScores).reduce(
            (acc, q) => acc + (q.score / q.total) * 100,
            0,
          ) / totalQuizzes,
        )
      : 0;

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Award className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Cosmic Progress Profile</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
                {currentLevelInfo?.name}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Local-first • Private on this browser • No tracking
            </p>
          </div>
        </div>

        {/* Action buttons: Export & Reset */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="text-xs border-white/10 text-slate-300 hover:text-white hover:bg-white/5"
            title="Download your progress as JSON"
          >
            <Download className="size-3.5 mr-1 text-cyan-400" />
            <span>Export Progress</span>
          </Button>

          {showConfirmReset ? (
            <div className="flex items-center gap-1.5">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  onReset();
                  setShowConfirmReset(false);
                }}
                className="text-xs px-2.5 py-1"
              >
                Confirm Reset
              </Button>
              <button
                onClick={() => setShowConfirmReset(false)}
                className="text-xs text-slate-400 hover:text-white px-2"
              >
                Cancel
              </button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowConfirmReset(true)}
              className="text-xs text-slate-400 hover:text-rose-400"
              title="Reset progress to default"
            >
              <RotateCcw className="size-3.5 mr-1" />
              <span>Reset</span>
            </Button>
          )}
        </div>
      </div>

      {/* Stats Counter Grid */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
            <CheckCircle2 className="size-3 text-emerald-400" />
            <span>Modules Done</span>
          </div>
          <div className="text-xl font-extrabold text-white">{totalCompleted} / 24</div>
        </div>

        <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
            <Sparkles className="size-3 text-amber-400" />
            <span>Badges Won</span>
          </div>
          <div className="text-xl font-extrabold text-white">{progress.achievements.length}</div>
        </div>

        <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
            <BookOpen className="size-3 text-cyan-400" />
            <span>Quiz Mastery</span>
          </div>
          <div className="text-xl font-extrabold text-white">
            {totalQuizzes > 0 ? `${averageQuizScore}%` : "—"}
          </div>
        </div>

        <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
            <Bookmark className="size-3 text-purple-400" />
            <span>Saved Modules</span>
          </div>
          <div className="text-xl font-extrabold text-white">{progress.bookmarks.length}</div>
        </div>
      </div>
    </div>
  );
}
