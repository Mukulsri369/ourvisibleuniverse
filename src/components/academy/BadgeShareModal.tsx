// @ts-nocheck
import React, { useState } from "react";
import type { StageBadgeDefinition } from "@/lib/academy/stage-badges";
import type { StudentProfile } from "@/lib/academy/student-types";
import { CosmicBadgeGraphic } from "./CosmicBadgeGraphics";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  X,
  Share2,
  Copy,
  Check,
  Download,
  ShieldCheck,
  Lock,
  Sparkles,
  ExternalLink,
} from "lucide-react";

interface BadgeShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  badge: StageBadgeDefinition;
  awardedAt?: string | null;
  profile?: StudentProfile;
  reducedMotion?: boolean;
}

export function BadgeShareModal({
  isOpen,
  onClose,
  badge,
  awardedAt,
  profile,
  reducedMotion = false,
}: BadgeShareModalProps) {
  const [copiedText, setCopiedText] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [includeDisplayName, setIncludeDisplayName] = useState(false);

  if (!isOpen) return null;

  // Student Privacy Rules: Under 13 or private profiles NEVER reveal real names or emails
  const isMinorOrPrivate =
    !profile || profile.profile_visibility === "private" || profile.age_group === "under_13";
  const studentIdentifier =
    !isMinorOrPrivate && includeDisplayName && profile.display_name
      ? profile.display_name
      : profile?.student_public_id || "Cosmic Scholar";

  const formattedDate = awardedAt
    ? new Date(awardedAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Verified Cosmic Milestone";

  const shareText = `🌌 I just earned the "${badge.title}" stage badge in the Cosmic Learning Academy! Verified completion of Stage ${badge.stageId}: ${badge.theme}. Student ID: ${studentIdentifier}`;

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/learn?badge=${badge.badgeId}`
      : "https://ourvisibleuniverse.org/learn";

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopiedText(true);
      toast.success("Achievement text copied to clipboard!");
      setTimeout(() => setCopiedText(false), 2500);
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      toast.success("Badge share link copied!");
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      toast.error("Could not copy link");
    }
  };

  const handleDownloadSVG = () => {
    try {
      const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
  <rect width="600" height="400" rx="24" fill="#090d16" stroke="${badge.glowColor}" stroke-width="2"/>
  <rect x="20" y="20" width="560" height="360" rx="16" fill="#0f172a" fill-opacity="0.8"/>
  <text x="300" y="70" font-family="system-ui, sans-serif" font-size="14" font-weight="700" fill="${badge.glowColor}" text-anchor="middle" letter-spacing="2">OUR VISIBLE UNIVERSE ACADEMY</text>
  <text x="300" y="110" font-family="system-ui, sans-serif" font-size="28" font-weight="800" fill="#ffffff" text-anchor="middle">${badge.title}</text>
  <text x="300" y="135" font-family="system-ui, sans-serif" font-size="14" font-weight="500" fill="#94a3b8" text-anchor="middle">${badge.subtitle} • ${badge.theme}</text>
  <text x="300" y="200" font-family="system-ui, sans-serif" font-size="13" font-style="italic" fill="#cbd5e1" text-anchor="middle">"${badge.milestoneQuote}"</text>
  <line x1="80" y1="230" x2="520" y2="230" stroke="#334155" stroke-width="1"/>
  <text x="120" y="280" font-family="system-ui, sans-serif" font-size="12" fill="#64748b">Verified Student ID</text>
  <text x="120" y="305" font-family="monospace" font-size="16" font-weight="700" fill="#38bdf8">${studentIdentifier}</text>
  <text x="480" y="280" font-family="system-ui, sans-serif" font-size="12" fill="#64748b" text-anchor="end">Awarded Date</text>
  <text x="480" y="305" font-family="system-ui, sans-serif" font-size="14" font-weight="600" fill="#f8fafc" text-anchor="end">${formattedDate}</text>
  <text x="300" y="350" font-family="system-ui, sans-serif" font-size="11" fill="#10b981" text-anchor="middle">✓ Officially Issued &amp; Cryptographically Verified (Version ${badge.version})</text>
</svg>`.trim();

      const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `cosmic-badge-${badge.badgeId}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Badge card saved as SVG!");
    } catch {
      toast.error("Could not download badge card");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-badge-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
    >
      <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900 p-6 sm:p-7 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Glow backdrop accent */}
        <div
          className="absolute -top-24 -left-24 size-48 rounded-full blur-3xl pointer-events-none opacity-30"
          style={{ backgroundColor: badge.glowColor }}
        />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-2">
            <Share2 className="size-4 text-cyan-400" />
            <h3
              id="share-badge-title"
              className="text-sm font-bold text-white uppercase tracking-wider"
            >
              Share Cosmic Achievement
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Close share dialog"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Badge Card Preview */}
        <div className="my-5 rounded-2xl border border-white/10 bg-slate-950/70 p-5 text-center relative overflow-hidden">
          <div className="flex justify-center mb-3">
            <div className="relative p-2 rounded-2xl bg-white/[0.03] border border-white/10 shadow-lg shadow-black/40">
              <CosmicBadgeGraphic
                stageId={badge.stageId}
                isUnlocked={true}
                reducedMotion={reducedMotion}
                size={84}
              />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider mb-2 border border-white/10 bg-white/5 text-slate-300">
            <Sparkles className="size-3 text-amber-400" />
            Stage 0{badge.stageId} Achievement
          </div>

          <h4 className="text-xl font-extrabold text-white">{badge.title}</h4>
          <p className="text-xs text-cyan-300 font-medium mt-0.5">{badge.theme}</p>
          <p className="text-xs text-slate-400 italic max-w-sm mx-auto mt-2 leading-relaxed">
            "{badge.milestoneQuote}"
          </p>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
            <div className="text-left">
              <span className="text-[10px] text-slate-400 block uppercase font-mono">
                Issued To
              </span>
              <span className="font-mono font-bold text-cyan-300">{studentIdentifier}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase font-mono">Date</span>
              <span className="text-slate-300 font-medium">{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Student Privacy Controls */}
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3 mb-4">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="size-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-emerald-300">Student Privacy Shield Active</span>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                By default, badges only display your privacy-safe public student ID (
                <span className="font-mono text-cyan-300">
                  {profile?.student_public_id || "CE-..."}
                </span>
                ). Real names, emails, and school locations are never published.
              </p>
            </div>
          </div>

          {!isMinorOrPrivate && profile?.display_name && (
            <label className="mt-2.5 pt-2 border-t border-emerald-500/20 flex items-center gap-2 cursor-pointer text-xs text-slate-300 select-none">
              <input
                type="checkbox"
                checked={includeDisplayName}
                onChange={(e) => setIncludeDisplayName(e.target.checked)}
                className="rounded border-white/20 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
              />
              <span>Display student pseudonym on this badge ({profile.display_name})</span>
            </label>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyText}
            className="border-white/10 hover:bg-white/5 text-xs text-slate-200"
          >
            {copiedText ? (
              <>
                <Check className="size-3.5 mr-1 text-emerald-400" />
                Copied Text
              </>
            ) : (
              <>
                <Copy className="size-3.5 mr-1 text-slate-400" />
                Copy Text
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="border-white/10 hover:bg-white/5 text-xs text-slate-200"
          >
            {copiedLink ? (
              <>
                <Check className="size-3.5 mr-1 text-emerald-400" />
                Copied Link
              </>
            ) : (
              <>
                <ExternalLink className="size-3.5 mr-1 text-cyan-400" />
                Copy Link
              </>
            )}
          </Button>

          <Button
            size="sm"
            onClick={handleDownloadSVG}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold"
          >
            <Download className="size-3.5 mr-1" />
            Download SVG
          </Button>
        </div>
      </div>
    </div>
  );
}
