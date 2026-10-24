import React, { useState } from "react";
import type { UserProgress } from "@/lib/academy/types";
import type { StudentProfile } from "@/lib/academy/student-types";
import { LEARNING_LEVELS, ACADEMY_STAGES, ACADEMY_MODULES } from "@/lib/academy/registry";
import { STAGE_BADGES } from "@/lib/academy/stage-badges";
import { CosmicBadgeGraphic } from "./CosmicBadgeGraphics";
import {
  ArrowUpRight,
  Download,
  RotateCcw,
  ShieldCheck,
  User,
} from "lucide-react";

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

  const verifiedList = progress.verifiedModules || [];
  const verifiedSet = new Set(verifiedList);
  const totalVerified = verifiedList.length;
  const completionPercentage = Math.round((totalVerified / 24) * 100);

  const stageBadgesMap = progress.stageBadges || {};
  const unlockedBadges = Object.values(STAGE_BADGES).filter((b) => {
    if (stageBadgesMap[b.stageId]) return true;
    if (progress.achievements.includes(b.badgeId)) return true;
    if (b.legacyBadgeIds?.some((id) => progress.achievements.includes(id))) return true;
    const count = b.requiredModuleIds.filter((id) => verifiedSet.has(id)).length;
    return count === 4;
  });
  const earnedBadgeCount = unlockedBadges.length;

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
    <div className="flex flex-col justify-between border border-white/[0.08] bg-[#05060a] p-7 sm:p-9">
      <div>
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-white/[0.08] pb-6 sm:flex-row sm:items-start">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#f5d08a]">
              OBSERVATORY DOSSIER · {currentLevelInfo?.name}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2.5">
              <h3
                className="text-xl font-medium uppercase tracking-tight text-white sm:text-2xl"
                style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
              >
                {profile ? profile.display_name : "Scholar Telemetry"}
              </h3>
              {isLoggedIn && (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-emerald-300">
                  <ShieldCheck className="size-3" />
                  Verified
                </span>
              )}
            </div>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">
              {isLoggedIn && profile
                ? `ID: ${profile.student_public_id} · CLOUD SYNC`
                : "LOCAL GUEST SESSION"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenProfile && (
              <button
                type="button"
                onClick={onOpenProfile}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/80 transition-colors hover:border-[#f5d08a] hover:text-[#f5d08a]"
              >
                <User className="size-3" />
                <span>{isLoggedIn ? "Profile" : "Guest ID"}</span>
              </button>
            )}
            <button
              type="button"
              onClick={onExport}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/70 transition-colors hover:border-white/40 hover:text-white"
              title="Export progress JSON"
            >
              <Download className="size-3" />
              <span>Export</span>
            </button>
            {showConfirmReset ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onReset();
                    setShowConfirmReset(false);
                  }}
                  className="rounded-full bg-rose-500 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmReset(false)}
                  className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/50 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowConfirmReset(true)}
                className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40 transition-colors hover:border-rose-500/40 hover:text-rose-400"
                title="Reset progress"
              >
                <RotateCcw className="size-3" />
              </button>
            )}
          </div>
        </div>

        {/* 1px Hairline Telemetry Strip */}
        <div className="mt-6 grid grid-cols-3 gap-[1px] border border-white/[0.08] bg-white/[0.08]">
          <div className="bg-[#05060a] p-4">
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/40">
              CERTIFIED
            </span>
            <p
              className="mt-1 text-2xl font-normal text-white"
              style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
            >
              {totalVerified} <span className="font-mono text-xs text-white/40">/ 24</span>
            </p>
          </div>
          <div className="bg-[#05060a] p-4">
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/40">
              BADGES
            </span>
            <p
              className="mt-1 text-2xl font-normal text-[#f5d08a]"
              style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
            >
              0{earnedBadgeCount} <span className="font-mono text-xs text-white/40">/ 06</span>
            </p>
          </div>
          <div className="bg-[#05060a] p-4">
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/40">
              BOOKMARKS
            </span>
            <p
              className="mt-1 text-2xl font-normal text-[#38bdf8]"
              style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
            >
              {progress.bookmarks.length}
            </p>
          </div>
        </div>

        {/* Active Stage & Overall Progress Bar */}
        <div className="mt-6 border border-white/[0.08] bg-[#070a12] p-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#38bdf8]">
                ACTIVE SECTOR · STAGE 0{currentStageId}
              </span>
              <h4
                className="mt-1 text-lg font-medium uppercase text-white"
                style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
              >
                {currentStage.title}
              </h4>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">
                {currentBadgeDef.theme}
              </p>
            </div>
            <div className="flex size-11 items-center justify-center rounded-full border border-white/10 bg-[#05060a]">
              <CosmicBadgeGraphic
                stageId={currentStageId}
                isUnlocked={totalVerified >= currentStageId * 4}
                reducedMotion={reducedMotion}
                size={32}
              />
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em]">
              <span className="text-white/45">CURRICULUM COMPLETION</span>
              <span className="text-[#f5d08a]">{completionPercentage}%</span>
            </div>
            <div className="h-[2px] w-full overflow-hidden bg-white/10">
              <div
                className="h-full bg-[#f5d08a] transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Next Milestone CTA */}
      <div className="mt-6 flex flex-col justify-between gap-4 border-t border-white/[0.08] pt-5 sm:flex-row sm:items-center">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">
            {nextStageBadge
              ? `NEXT MILESTONE · ${nextStageBadge.title}`
              : "CAPSTONE READY · ALL 24 MODULES COMPLETE"}
          </span>
          <p className="mt-1 font-mono text-xs text-white/75">
            {nextStageBadge
              ? `Remaining modules: ${nextStageMissingModules.map((id) => `#${id}`).join(", ")}`
              : "Eligible for official Cosmic Explorer Certification"}
          </p>
        </div>

        {nextModuleObj && onSelectModule ? (
          <button
            type="button"
            onClick={() => onSelectModule(nextModuleObj.id)}
            className="group inline-flex h-10 shrink-0 items-center gap-2.5 self-start rounded-full bg-[#f5d08a] pl-5 pr-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#05060a] transition-all hover:bg-white sm:self-auto"
          >
            <span>Continue #{nextModuleObj.id}</span>
            <span className="flex size-7 items-center justify-center rounded-full bg-[#05060a] text-[#f5d08a]">
              <ArrowUpRight className="size-3.5" />
            </span>
          </button>
        ) : totalVerified >= 24 && onSelectModule ? (
          <button
            type="button"
            onClick={() => onSelectModule("exam")}
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-[#f5d08a] px-5 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#05060a]"
          >
            <span>Launch Final Exam</span>
            <ArrowUpRight className="size-3.5" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
