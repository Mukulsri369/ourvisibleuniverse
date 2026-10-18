import React from "react";
import type { ModuleContract, ModuleStatus } from "@/lib/academy/types";
import { Link } from "@tanstack/react-router";
import {
  Clock,
  CheckCircle2,
  Bookmark,
  ExternalLink,
  Lock,
  Sparkles,
  ArrowRight,
  Globe,
  Orbit,
  Disc,
  Clock as ClockIcon,
  Search,
  Rocket,
  Compass,
  Zap,
  Activity,
  Maximize2,
  Hourglass,
  Dna,
  Cpu,
  Flame,
  Cloud,
  Globe2,
  Radio,
  Network,
  HelpCircle,
  Eye,
  Moon,
  Sun,
  Ruler,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const ICON_MAP: Record<string, React.ElementType> = {
  Globe,
  Orbit,
  Disc,
  Clock: ClockIcon,
  Search,
  Rocket,
  Compass,
  Zap,
  Activity,
  Maximize2,
  Hourglass,
  Dna,
  Cpu,
  Flame,
  Cloud,
  Globe2,
  Radio,
  Network,
  HelpCircle,
  Eye,
  Moon,
  Sun,
  Ruler,
  Sparkles,
};

interface LearningModuleCardProps {
  module: ModuleContract;
  status: ModuleStatus;
  percent: number;
  isBookmarked: boolean;
  isVerified?: boolean;
  evidenceCount?: number;
  onToggleBookmark: (id: string) => void;
  onSelectModule?: (module: ModuleContract) => void;
}

export function LearningModuleCard({
  module,
  status,
  percent,
  isBookmarked,
  isVerified = false,
  evidenceCount = 0,
  onToggleBookmark,
  onSelectModule,
}: LearningModuleCardProps) {
  const IconComponent = ICON_MAP[module.visualAssets.iconName] || Sparkles;

  const isCompleted = status === "completed";
  const isInProgress = status === "in_progress";
  const isReady = module.status === "ready";

  return (
    <div
      className={`group relative rounded-2xl border p-5 flex flex-col justify-between transition-all duration-300 ${
        isVerified
          ? "border-emerald-500/50 bg-gradient-to-b from-emerald-950/30 to-slate-900/80 shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500/20"
          : isCompleted
            ? "border-cyan-500/40 bg-gradient-to-b from-cyan-950/20 to-slate-900/60"
            : isReady
              ? "border-cyan-500/20 bg-gradient-to-b from-slate-900/90 to-slate-950/90 hover:border-cyan-400/50 hover:shadow-xl hover:shadow-cyan-950/20"
              : "border-white/10 bg-slate-950/60 opacity-85 hover:opacity-100 hover:border-white/20"
      }`}
    >
      <div>
        {/* Header row: Module number + Status Pill + Bookmark */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-xs font-bold text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md">
              #{module.id}
            </span>

            {/* Authoritative State C: Official Verified Completion */}
            {isVerified ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="size-3 text-emerald-400" />
                Verified Complete
              </span>
            ) : evidenceCount > 0 ? (
              /* Authoritative State B: Validated Activity Evidence */
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full">
                <Activity className="size-3 text-amber-400" />
                Evidence Logged ({evidenceCount})
              </span>
            ) : isCompleted ? (
              /* Authoritative State A: Reading Completed (Unverified) */
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                Read Complete
              </span>
            ) : isInProgress ? (
              /* Authoritative State A: Reading In Progress */
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                In Progress ({percent}%)
              </span>
            ) : isReady ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-sky-300 bg-sky-500/10 border border-sky-500/30 px-2 py-0.5 rounded-full">
                Available
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                Coming Soon
              </span>
            )}
          </div>

          <button
            onClick={() => onToggleBookmark(module.id)}
            className={`p-1.5 rounded-lg border transition-colors ${
              isBookmarked
                ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                : "border-transparent text-slate-400 hover:text-white hover:bg-white/5"
            }`}
            title={isBookmarked ? "Remove bookmark" : "Bookmark module"}
          >
            <Bookmark className="size-3.5 fill-current" />
          </button>
        </div>

        {/* Title and Icon preview */}
        <div className="mt-4 flex items-start gap-3">
          <div
            className={`p-3 rounded-xl border flex-shrink-0 transition-transform group-hover:scale-105 ${
              module.visualAssets.badgeColor
            }`}
          >
            <IconComponent className="size-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
              {module.title}
            </h4>
            <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{module.subtitle}</p>
          </div>
        </div>

        {/* Description */}
        <p className="mt-3 text-xs text-slate-300/90 leading-relaxed line-clamp-2">
          {module.description}
        </p>

        {/* Learning Outcomes snippet */}
        <div className="mt-3 bg-white/[0.02] border border-white/5 rounded-lg p-2.5">
          <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 block mb-1">
            Learning Outcomes:
          </span>
          <ul className="text-[11px] text-slate-300 space-y-1">
            {module.learningObjectives.slice(0, 2).map((obj, i) => (
              <li key={i} className="flex items-start gap-1.5 line-clamp-1">
                <span className="text-cyan-400">•</span>
                <span className="truncate">{obj}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer Details: Difficulty + Estimated Time + Progress Bar + CTA */}
      <div className="mt-5 pt-3 border-t border-white/10">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2.5">
          <span className="flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-cyan-400" />
            {module.difficultyLevels.join(" / ")}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="size-3" />
            {module.estimatedMinutes} mins
          </span>
        </div>

        {/* Progress bar */}
        {isReady && (
          <div className="w-full bg-slate-800 rounded-full h-1.5 mb-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
        )}

        {/* Action Button */}
        {isReady && module.id !== "13" && module.id !== "19" ? (
          <Button
            size="sm"
            onClick={() => onSelectModule && onSelectModule(module)}
            className="w-full font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-sm"
          >
            {isCompleted ? "Review Lesson" : isInProgress ? "Continue Lesson" : "Start Lesson"}
            <ArrowRight className="size-3.5 ml-1.5" />
          </Button>
        ) : module.id === "13" ? (
          <Button
            asChild
            size="sm"
            className="w-full font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm"
          >
            <Link to="/galaxies">
              <span>Explore Galaxies (3D)</span>
              <ExternalLink className="size-3.5 ml-1.5" />
            </Link>
          </Button>
        ) : module.id === "19" ? (
          <Button
            asChild
            size="sm"
            className="w-full font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
          >
            <Link to="/visible-universe-history">
              <span>View Timeline</span>
              <ExternalLink className="size-3.5 ml-1.5" />
            </Link>
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelectModule && onSelectModule(module)}
            className="w-full text-xs border-white/10 text-slate-300 hover:text-white hover:border-white/20 hover:bg-white/5"
          >
            <Lock className="size-3 mr-1.5 text-slate-400" />
            Preview Syllabus
          </Button>
        )}
      </div>
    </div>
  );
}
