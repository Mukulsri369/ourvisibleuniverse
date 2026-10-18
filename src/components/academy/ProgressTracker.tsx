import React, { useState } from "react";
import type { UserProgress } from "@/lib/academy/types";
import type { StudentProfile } from "@/lib/academy/student-types";
import { LEARNING_LEVELS, ACADEMY_STAGES, ACADEMY_MODULES } from "@/lib/academy/registry";
import { STAGE_BADGES } from "@/lib/academy/stage-badges";
import { CosmicBadgeGraphic } from "./CosmicBadgeGraphics";
import {
  Award,
  Download,
  RotateCcw,
  CheckCircle2,
  BookOpen,
  Sparkles,
  Bookmark,
  ShieldCheck,
  User,
  GraduationCap,
  ArrowRight,
  Lock,
  Compass,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProgressTrackerProps {
  progress: UserProgress;
  onExport: () => void;
  onReset: () => void;
  profile?: StudentProfile;
  isLoggedIn?: boolean;
  onOpenProfile?: () => void;
  reducedMotion?: boolean;
  onSelectModule?: (moduleId: string) => void;
}

export function ProgressTracker({
  progress,
  onExport,
  onReset,
  profile,
  isLoggedIn,
  onOpenProfile,
  reducedMotion = false,
  onSelectModule,
}: ProgressTrackerProps) {
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const currentLevelInfo = LEARNING_LEVELS[progress.selectedLevel];

  // 1. Authoritative Verified Completions
  const verifiedList = progress.verifiedModules || [];
  const verifiedSet = new Set(verifiedList);
  const totalVerified = verifiedList.length;
  const completionPercentage = Math.round((totalVerified / 24) * 100);

  // 2. Stage Badges Calculation
  const stageBadgesMap = progress.stageBadges || {};
  const unlockedBadges = Object.values(STAGE_BADGES).filter((b) => {
    if (stageBadgesMap[b.stageId]) return true;
    if (progress.achievements.includes(b.badgeId)) return true;
    if (b.legacyBadgeIds?.some((id) => progress.achievements.includes(id))) return true;
    const count = b.requiredModuleIds.filter((id) => verifiedSet.has(id)).length;
    return count === 4;
  });
  const earnedBadgeCount = unlockedBadges.length;
  const lockedBadgeCount = 6 - earnedBadgeCount;

  // 3. Current Learning Stage Identification
  // Current stage is determined by the lowest stage that has incomplete modules, or Stage 6 if all complete
  let currentStageId = 1;
  for (let s = 1; s <= 6; s++) {
    const stageBadge = STAGE_BADGES[s];
    const isStageDone = stageBadge.requiredModuleIds.every((id) => verifiedSet.has(id));
    if (!isStageDone) {
      currentStageId = s;
      break;
    }
    if (s === 6 && isStageDone) {
      currentStageId = 6;
    }
  }

  const currentStage = ACADEMY_STAGES.find((s) => s.id === currentStageId) || ACADEMY_STAGES[0];
  const currentBadgeDef = STAGE_BADGES[currentStageId];

  // 4. Requirements for Next Achievement
  const nextStageBadge =
    Object.values(STAGE_BADGES).find((b) => {
      const isDone = b.requiredModuleIds.every((id) => verifiedSet.has(id));
      return !isDone;
    }) || null;

  const nextStageMissingModules = nextStageBadge
    ? nextStageBadge.requiredModuleIds.filter((id) => !verifiedSet.has(id))
    : [];

  const nextModuleToStudy = nextStageMissingModules.length > 0 ? nextStageMissingModules[0] : null;
  const nextModuleObj = nextModuleToStudy
    ? ACADEMY_MODULES.find((m) => m.id === nextModuleToStudy)
    : null;

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between">
      {/* Background Accent */}
      <div className="absolute top-0 left-0 size-48 bg-cyan-500/5 blur-3xl pointer-events-none" />

      {/* Top Header & Identity */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <GraduationCap className="size-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-extrabold text-white">
                  {profile ? profile.display_name : "Cosmic Progress Profile"}
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
                  {currentLevelInfo?.name}
                </span>
                {isLoggedIn && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono flex items-center gap-1">
                    <ShieldCheck className="size-3" />
                    Verified Student
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isLoggedIn && profile ? (
                  <span>
                    Public ID:{" "}
                    <span className="font-mono text-cyan-300 font-bold">
                      {profile.student_public_id}
                    </span>{" "}
                    • Cloud Synchronized
                  </span>
                ) : (
                  <span>Local Guest Session • Progress preserved in browser</span>
                )}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {onOpenProfile && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenProfile}
                className="text-xs border-cyan-500/30 text-cyan-300 hover:text-white hover:bg-cyan-500/10"
              >
                <User className="size-3.5 mr-1 text-cyan-400" />
                <span>{isLoggedIn ? "My Profile" : "Guest ID"}</span>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              className="text-xs border-white/10 text-slate-300 hover:text-white hover:bg-white/5"
              title="Download your progress as JSON"
            >
              <Download className="size-3.5 mr-1 text-cyan-400" />
              <span className="hidden sm:inline">Export</span>
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
                <span className="hidden sm:inline">Reset</span>
              </Button>
            )}
          </div>
        </div>

        {/* Current Learning Stage & Overall Completion */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Current Stage Card */}
          <div className="rounded-xl border border-white/10 bg-slate-950/50 p-3.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 block mb-0.5">
              Current Learning Stage
            </span>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">
                  Stage {currentStageId}: {currentStage.title}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">{currentBadgeDef.theme}</p>
              </div>
              <div className="size-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                <CosmicBadgeGraphic
                  stageId={currentStageId}
                  isUnlocked={totalVerified >= currentStageId * 4}
                  reducedMotion={reducedMotion}
                  size={32}
                />
              </div>
            </div>
          </div>

          {/* Module Completion Summary */}
          <div className="rounded-xl border border-white/10 bg-slate-950/50 p-3.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Verified Curriculum Progress
              </span>
              <span className="text-xs font-mono font-bold text-cyan-400">
                {completionPercentage}%
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-white">{totalVerified}</span>
              <span className="text-xs text-slate-400">of 24 modules certified</span>
            </div>
            <div className="mt-2 h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Badges Overview Grid */}
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
              <Trophy className="size-3 text-amber-400" />
              <span>Earned Badges</span>
            </div>
            <div className="text-lg font-extrabold text-white">{earnedBadgeCount} / 6</div>
          </div>

          <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
              <Lock className="size-3 text-slate-400" />
              <span>Locked Badges</span>
            </div>
            <div className="text-lg font-extrabold text-slate-300">{lockedBadgeCount}</div>
          </div>

          <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
              <BookOpen className="size-3 text-cyan-400" />
              <span>Completed Modules</span>
            </div>
            <div className="text-lg font-extrabold text-cyan-300">{totalVerified} / 24</div>
          </div>

          <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
              <Bookmark className="size-3 text-purple-400" />
              <span>Saved Lessons</span>
            </div>
            <div className="text-lg font-extrabold text-purple-300">
              {progress.bookmarks.length}
            </div>
          </div>
        </div>

        {/* Requirements for Next Achievement Card */}
        {nextStageBadge && (
          <div className="mt-3.5 rounded-xl border border-cyan-500/20 bg-gradient-to-r from-cyan-950/30 to-blue-950/20 p-3.5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Compass className="size-3" />
                  Next Milestone Target: {nextStageBadge.title} (Stage 0{nextStageBadge.stageId})
                </span>
                <p className="text-xs text-slate-300 mt-1">
                  Complete all 4 stage modules to earn this badge. Remaining:{" "}
                  <span className="font-mono text-cyan-300 font-bold">
                    {nextStageMissingModules.map((id) => `#${id}`).join(", ")}
                  </span>
                </p>
              </div>

              {nextModuleObj && onSelectModule && (
                <Button
                  size="sm"
                  onClick={() => onSelectModule(nextModuleObj.id)}
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex-shrink-0"
                >
                  <span>Continue #{nextModuleObj.id}</span>
                  <ArrowRight className="size-3 ml-1" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Final Cosmic Explorer Continuum & Certificates Section */}
        <div className="mt-3.5 rounded-xl border border-white/10 bg-slate-950/40 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 flex-shrink-0">
              <Award className="size-4" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white uppercase tracking-wider">
                Official Digital Certification
              </h5>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {totalVerified >= 24
                  ? "✓ All 24 modules certified! Eligible for the Capstone Final Examination."
                  : `Complete all 24 modules across 6 stages to unlock the Capstone Exam & Certificate (${24 - totalVerified} modules remaining).`}
              </p>
            </div>
          </div>

          <div className="self-end sm:self-auto flex-shrink-0">
            {totalVerified >= 24 && onSelectModule ? (
              <Button
                size="sm"
                onClick={() => onSelectModule("exam")}
                className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs"
              >
                Launch Final Exam
              </Button>
            ) : (
              <span className="text-[10px] font-mono text-slate-400 px-2.5 py-1 rounded-full border border-white/10 bg-white/5">
                Locked: {totalVerified}/24
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

