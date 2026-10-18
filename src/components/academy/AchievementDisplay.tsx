import React, { useState } from "react";
import { STAGE_BADGES, type StageBadgeDefinition } from "@/lib/academy/stage-badges";
import { ACADEMY_MODULES } from "@/lib/academy/registry";
import type { StudentProfile } from "@/lib/academy/student-types";
import { CosmicBadgeGraphic } from "./CosmicBadgeGraphics";
import { BadgeShareModal } from "./BadgeShareModal";
import { Button } from "@/components/ui/button";
import {
  Award,
  Lock,
  Sparkles,
  CheckCircle2,
  Circle,
  Share2,
  Info,
  Calendar,
  ShieldCheck,
  ChevronRight,
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

  // Check which stage badges are unlocked:
  // 1. Authoritative stageBadges record from server
  // 2. Or matching badge ID in unlockedIds
  // 3. Or all 4 required modules are verified
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
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-xl relative overflow-hidden">
      {/* Subtle Cosmic Ambient Glow */}
      <div className="absolute top-0 right-0 size-64 bg-cyan-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 size-64 bg-purple-500/5 blur-3xl pointer-events-none" />

      {/* Gallery Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Award className="size-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                Cosmic Achievement Gallery
              </h3>
              <p className="text-xs text-slate-400">
                Six prestigious milestone certifications spanning your 24-module journey
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-white/10 text-xs font-mono">
            <Sparkles className="size-3.5 text-amber-400" />
            <span className="text-white font-bold">{unlockedCount}</span>
            <span className="text-slate-400">/ 6 Badges Unlocked</span>
          </div>
        </div>
      </div>

      {/* Badges Grid (1 col on mobile, 2 on tablet, 3 on desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.values(STAGE_BADGES).map((badge) => {
          const unlocked = isStageUnlocked(badge);
          const awardedAt = getAwardedDate(badge);
          const completedCount = badge.requiredModuleIds.filter((id) => verifiedSet.has(id)).length;
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
              className={`group relative rounded-2xl border p-4 sm:p-5 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                unlocked
                  ? `border-white/15 bg-gradient-to-b ${badge.bgGradient} hover:border-white/30 hover:scale-[1.01] shadow-lg shadow-black/20`
                  : "border-white/5 bg-slate-950/40 hover:border-white/15 opacity-80 hover:opacity-100"
              }`}
            >
              {/* Badge Emblem & Top Controls */}
              <div className="flex items-start justify-between gap-3">
                <div
                  className={`relative p-2.5 rounded-2xl border transition-transform duration-300 ${
                    unlocked
                      ? `border-white/20 bg-slate-900/80 shadow-md ${!reducedMotion ? "group-hover:scale-105" : ""}`
                      : "border-white/5 bg-slate-900/40 grayscale"
                  }`}
                  style={{
                    boxShadow: unlocked ? `0 0 20px -5px ${badge.glowColor}40` : "none",
                  }}
                >
                  <CosmicBadgeGraphic
                    stageId={badge.stageId}
                    isUnlocked={unlocked}
                    reducedMotion={reducedMotion}
                    size={56}
                  />
                  {!unlocked && (
                    <div className="absolute inset-0 m-auto size-6 rounded-full bg-slate-950/80 border border-white/10 flex items-center justify-center text-slate-400">
                      <Lock className="size-3" />
                    </div>
                  )}
                </div>

                {/* Status Pill */}
                {unlocked ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                      Unlocked
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSharingBadge(badge);
                      }}
                      className="p-1 rounded-lg border border-white/10 text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition-colors"
                      title="Share this achievement"
                      aria-label={`Share ${badge.title} badge`}
                    >
                      <Share2 className="size-3.5" />
                    </button>
                  </div>
                ) : (
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-slate-400">
                    {completedCount}/4 Modules
                  </span>
                )}
              </div>

              {/* Title & Theme */}
              <div className="mt-3">
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
                  <span>STAGE 0{badge.stageId}</span>
                  <span>•</span>
                  <span className={unlocked ? badge.accentColor : "text-slate-400"}>
                    {badge.theme}
                  </span>
                </div>
                <h4 className="text-base font-bold text-white mt-0.5 group-hover:text-cyan-200 transition-colors">
                  {badge.title}
                </h4>
                <p className="text-xs text-slate-300 line-clamp-2 mt-1 leading-relaxed">
                  {badge.description}
                </p>
              </div>

              {/* Bottom Progress / Metadata */}
              <div className="mt-4 pt-3 border-t border-white/10">
                {unlocked ? (
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 text-emerald-400 font-medium">
                      <ShieldCheck className="size-3.5" />
                      Verified
                    </span>
                    {awardedAt && (
                      <span className="font-mono text-[10px]">
                        {new Date(awardedAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                      <span>Verification Progress</span>
                      <span>{progressPct}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-400 transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Badge Dialog */}
      {selectedBadge && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="badge-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900 p-6 sm:p-7 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Background color flare */}
            <div
              className="absolute -top-24 -right-24 size-48 rounded-full blur-3xl pointer-events-none opacity-30"
              style={{ backgroundColor: selectedBadge.glowColor }}
            />

            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-white/10 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-2xl bg-white/5 border border-white/10">
                  <CosmicBadgeGraphic
                    stageId={selectedBadge.stageId}
                    isUnlocked={isStageUnlocked(selectedBadge)}
                    reducedMotion={reducedMotion}
                    size={64}
                  />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">
                    Stage 0{selectedBadge.stageId} Milestone
                  </span>
                  <h3 id="badge-dialog-title" className="text-xl font-extrabold text-white">
                    {selectedBadge.title}
                  </h3>
                  <p className="text-xs text-slate-400">{selectedBadge.subtitle}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedBadge(null)}
                className="p-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                aria-label="Close dialog"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <span className="text-[11px] uppercase font-mono font-bold text-slate-400 block mb-1">
                  Cosmic Theme & Significance
                </span>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {selectedBadge.description}
                </p>
                <blockquote className="mt-2.5 p-3 rounded-xl border border-white/10 bg-white/[0.02] text-xs text-cyan-300 italic">
                  "{selectedBadge.milestoneQuote}"
                </blockquote>
              </div>

              {/* Required Modules Checklist */}
              <div className="rounded-2xl border border-white/5 bg-slate-950/60 p-4">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Required Verified Modules (4 of 4)
                  </span>
                  <span className="text-xs font-mono text-cyan-400">
                    {selectedBadge.requiredModuleIds.filter((id) => verifiedSet.has(id)).length} / 4
                    Verified
                  </span>
                </div>

                <div className="space-y-2">
                  {selectedBadge.requiredModuleIds.map((modId) => {
                    const mod = ACADEMY_MODULES.find((m) => m.id === modId);
                    const isVerified = verifiedSet.has(modId);

                    return (
                      <div
                        key={modId}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-colors ${
                          isVerified
                            ? "border-emerald-500/20 bg-emerald-950/20 text-emerald-300"
                            : "border-white/5 bg-white/[0.02] text-slate-400"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          {isVerified ? (
                            <CheckCircle2 className="size-4 text-emerald-400 flex-shrink-0" />
                          ) : (
                            <Circle className="size-4 text-slate-500 flex-shrink-0" />
                          )}
                          <span className="font-mono text-[11px] text-slate-400">#{modId}</span>
                          <span
                            className={`truncate ${isVerified ? "font-medium text-slate-200" : ""}`}
                          >
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
                            className="text-[11px] font-medium text-cyan-400 hover:text-cyan-300 hover:underline flex-shrink-0 flex items-center gap-0.5"
                          >
                            <span>Open</span>
                            <ChevronRight className="size-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Official Credential Metadata */}
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-cyan-400" />
                  <span>Rule Version {selectedBadge.version}</span>
                </span>
                <span>Server-Issued & Idempotent</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
              {isStageUnlocked(selectedBadge) ? (
                <Button
                  size="sm"
                  onClick={() => {
                    const badgeToShare = selectedBadge;
                    setSelectedBadge(null);
                    setSharingBadge(badgeToShare);
                  }}
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                >
                  <Share2 className="size-3.5 mr-1.5" />
                  Share Achievement
                </Button>
              ) : (
                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Lock className="size-3.5" />
                  Complete all 4 modules to earn this badge
                </span>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedBadge(null)}
                className="border-white/10 text-white text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Share Dialog */}
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
