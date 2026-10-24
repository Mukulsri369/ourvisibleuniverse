import React, { useState } from "react";
import { STAGE_BADGES, type StageBadgeDefinition } from "@/lib/academy/stage-badges";
import { ACADEMY_MODULES } from "@/lib/academy/registry";
import type { StudentProfile } from "@/lib/academy/student-types";
import { CosmicBadgeGraphic } from "./CosmicBadgeGraphics";
import { BadgeShareModal } from "./BadgeShareModal";
import {
  Lock,
  CheckCircle2,
  Circle,
  Share2,
  ShieldCheck,
  ArrowUpRight,
  X,
} from "lucide-react";

interface AchievementDisplayProps {
  unlockedIds?: string[];
  stageBadges?: Record<number, { badgeId: string; awardedAt: string; version?: string }>;
  verifiedModules?: string[];
  profile?: StudentProfile;
  reducedMotion?: boolean;
  onSelectModule?: (moduleId: string) => void;
}

export function AchievementDisplay({
  unlockedIds = [],
  stageBadges = {},
  verifiedModules = [],
  profile,
  reducedMotion = false,
  onSelectModule,
}: AchievementDisplayProps) {
  const [selectedBadge, setSelectedBadge] = useState<StageBadgeDefinition | null>(null);
  const [sharingBadge, setSharingBadge] = useState<StageBadgeDefinition | null>(null);

  const verifiedSet = new Set(verifiedModules);

  const isStageUnlocked = (badge: StageBadgeDefinition): boolean => {
    if (stageBadges[badge.stageId]) return true;
    if (unlockedIds.includes(badge.badgeId)) return true;
    if (badge.legacyBadgeIds?.some((id) => unlockedIds.includes(id))) return true;
    const requiredDone = badge.requiredModuleIds.filter((id) => verifiedSet.has(id)).length;
    return requiredDone === 4;
  };

  const getAwardedDate = (badge: StageBadgeDefinition): string | null => {
    return stageBadges[badge.stageId]?.awardedAt || null;
  };

  const unlockedCount = Object.values(STAGE_BADGES).filter(isStageUnlocked).length;

  return (
    <div className="flex flex-col justify-between border border-white/[0.08] bg-[#05060a] p-7 sm:p-9">
      <div>
        {/* Gallery Header */}
        <div className="flex flex-col justify-between gap-3 border-b border-white/[0.08] pb-6 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#38bdf8]">
              VERIFIED CREDENTIALS · 06 MILESTONES
            </p>
            <h3
              className="mt-2 text-xl font-medium uppercase tracking-tight text-white sm:text-2xl"
              style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
            >
              Cosmic Achievement Gallery
            </h3>
          </div>

          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#f5d08a]">
            0{unlockedCount} / 06 UNLOCKED
          </span>
        </div>

        {/* 1px Hairline 6-Badge Grid */}
        <div className="mt-6 grid grid-cols-1 gap-[1px] border border-white/[0.08] bg-white/[0.08] sm:grid-cols-2 lg:grid-cols-3">
          {Object.values(STAGE_BADGES).map((badge) => {
            const unlocked = isStageUnlocked(badge);
            const completedCount = badge.requiredModuleIds.filter((id) =>
              verifiedSet.has(id),
            ).length;
            const progressPct = Math.round((completedCount / 4) * 100);

            return (
              <div
                key={badge.stageId}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedBadge(badge)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedBadge(badge);
                  }
                }}
                className="group relative flex cursor-pointer flex-col justify-between bg-[#05060a] p-5 text-left transition-colors duration-300 hover:bg-[#090d16]"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="relative flex size-12 items-center justify-center rounded-full border border-white/10 bg-[#070a12]">
                      <CosmicBadgeGraphic
                        stageId={badge.stageId}
                        isUnlocked={unlocked}
                        reducedMotion={reducedMotion}
                        size={38}
                      />
                      {!unlocked && (
                        <div className="absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-full border border-white/15 bg-[#05060a] text-white/50">
                          <Lock className="size-2.5" />
                        </div>
                      )}
                    </div>

                    {unlocked ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSharingBadge(badge);
                        }}
                        className="p-1 text-white/40 transition-colors hover:text-[#f5d08a]"
                        title="Share badge"
                      >
                        <Share2 className="size-3.5" />
                      </button>
                    ) : (
                      <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">
                        {completedCount}/4
                      </span>
                    )}
                  </div>

                  <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.22em] text-[#f5d08a]">
                    STAGE 0{badge.stageId}
                  </p>
                  <h4
                    className="mt-1 line-clamp-1 text-sm font-medium uppercase text-white transition-colors group-hover:text-[#f5d08a]"
                    style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
                  >
                    {badge.title}
                  </h4>
                </div>

                <div className="mt-4 border-t border-white/[0.08] pt-3">
                  <div className="h-[2px] w-full overflow-hidden bg-white/10">
                    <div
                      className="h-full bg-[#f5d08a] transition-all duration-300"
                      style={{ width: `${unlocked ? 100 : progressPct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Badge Dialog */}
      {selectedBadge && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="badge-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xl"
        >
          <div className="relative w-full max-w-lg border border-white/15 bg-[#05060a] p-7 sm:p-9 shadow-2xl">
            <div className="flex items-start justify-between border-b border-white/[0.08] pb-5">
              <div className="flex items-center gap-4">
                <div className="flex size-14 items-center justify-center rounded-full border border-white/10 bg-[#070a12]">
                  <CosmicBadgeGraphic
                    stageId={selectedBadge.stageId}
                    isUnlocked={isStageUnlocked(selectedBadge)}
                    reducedMotion={reducedMotion}
                    size={48}
                  />
                </div>
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#f5d08a]">
                    STAGE 0{selectedBadge.stageId} MILESTONE
                  </span>
                  <h3
                    id="badge-dialog-title"
                    className="mt-1 text-xl font-medium uppercase text-white"
                    style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
                  >
                    {selectedBadge.title}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedBadge(null)}
                className="p-1.5 text-white/40 transition-colors hover:text-white"
                aria-label="Close dialog"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-5 max-h-[60vh] space-y-5 overflow-y-auto pr-1">
              <p className="text-xs font-light leading-relaxed text-white/70">
                {selectedBadge.description}
              </p>

              <div className="border border-white/[0.08] bg-[#070a12] p-4">
                <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em]">
                  <span className="text-white/50">REQUIRED MODULES</span>
                  <span className="text-[#f5d08a]">
                    {selectedBadge.requiredModuleIds.filter((id) => verifiedSet.has(id)).length} / 4
                  </span>
                </div>

                <div className="divide-y divide-white/[0.06]">
                  {selectedBadge.requiredModuleIds.map((modId) => {
                    const mod = ACADEMY_MODULES.find((m) => m.id === modId);
                    const isVerified = verifiedSet.has(modId);

                    return (
                      <div
                        key={modId}
                        className="flex items-center justify-between py-2.5 text-xs"
                      >
                        <div className="flex items-center gap-2.5 truncate pr-2">
                          {isVerified ? (
                            <CheckCircle2 className="size-3.5 shrink-0 text-emerald-400" />
                          ) : (
                            <Circle className="size-3.5 shrink-0 text-white/25" />
                          )}
                          <span className="font-mono text-[10px] text-[#f5d08a]">#{modId}</span>
                          <span className="truncate text-white/80">
                            {mod?.title || `Module ${modId}`}
                          </span>
                        </div>

                        {onSelectModule && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedBadge(null);
                              onSelectModule(modId);
                            }}
                            className="inline-flex shrink-0 items-center gap-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[#38bdf8] hover:text-white"
                          >
                            <span>Open</span>
                            <ArrowUpRight className="size-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-white/[0.08] pt-5">
              {isStageUnlocked(selectedBadge) ? (
                <button
                  type="button"
                  onClick={() => {
                    const badgeToShare = selectedBadge;
                    setSelectedBadge(null);
                    setSharingBadge(badgeToShare);
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-[#f5d08a] px-5 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#05060a]"
                >
                  <Share2 className="size-3" />
                  <span>Share Credential</span>
                </button>
              ) : (
                <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
                  <ShieldCheck className="size-3.5 text-[#f5d08a]" />
                  <span>Complete all 4 modules to unlock</span>
                </span>
              )}

              <button
                type="button"
                onClick={() => setSelectedBadge(null)}
                className="rounded-full border border-white/15 px-5 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/80 hover:border-white/40 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {sharingBadge && (
        <BadgeShareModal
          isOpen={Boolean(sharingBadge)}
          onClose={() => setSharingBadge(null)}
          badge={sharingBadge}
          awardedAt={getAwardedDate(sharingBadge)}
          profile={profile}
          reducedMotion={reducedMotion}
        />
      )}
    </div>
  );
}
