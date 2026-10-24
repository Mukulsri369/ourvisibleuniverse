import React from "react";
import type { ModuleContract, ModuleStatus } from "@/lib/academy/types";
import { Link } from "@tanstack/react-router";
import {
  Clock,
  CheckCircle2,
  Bookmark,
  ArrowUpRight,
  Lock,
  Sparkles,
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
    <div className="group relative flex flex-col justify-between bg-[#05060a] p-6 transition-colors duration-300 hover:bg-[#090d16]">
      <div>
        {/* Top Row: Module ID + Status + Bookmark */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#f5d08a]">
              MOD {module.id}
            </span>

            {isVerified ? (
              <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.18em] text-emerald-400">
                <CheckCircle2 className="size-3" />
                Verified
              </span>
            ) : evidenceCount > 0 ? (
              <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#f5d08a]">
                {evidenceCount} Lab Evidence
              </span>
            ) : isCompleted ? (
              <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#38bdf8]">
                Completed
              </span>
            ) : isInProgress ? (
              <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#38bdf8]">
                {percent}% Active
              </span>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => onToggleBookmark(module.id)}
            className={`p-1 transition-colors ${
              isBookmarked ? "text-[#f5d08a]" : "text-white/30 hover:text-white"
            }`}
            title={isBookmarked ? "Remove bookmark" : "Bookmark module"}
          >
            <Bookmark className="size-3.5 fill-current" />
          </button>
        </div>

        {/* Icon & Title */}
        <div className="mt-5">
          <div className="mb-3 inline-flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-[#f5d08a] transition-colors group-hover:border-[#f5d08a]/40">
            <IconComponent className="size-4" />
          </div>

          <h4
            className="line-clamp-1 text-lg font-medium uppercase tracking-tight text-white transition-colors group-hover:text-[#f5d08a]"
            style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
          >
            {module.title}
          </h4>
          <p className="mt-1 line-clamp-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">
            {module.subtitle}
          </p>
        </div>

        {/* Concise Description */}
        <p className="mt-3 line-clamp-2 text-xs font-light leading-relaxed text-white/60">
          {module.description}
        </p>
      </div>

      {/* Footer: Telemetry + Minimalist Action */}
      <div className="mt-6 border-t border-white/[0.08] pt-4">
        <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
          <span>3 TIERS</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3" />
            {module.estimatedMinutes} MIN
          </span>
        </div>

        {isReady && percent > 0 && (
          <div className="mb-3 h-[2px] w-full overflow-hidden bg-white/10">
            <div
              className="h-full bg-[#f5d08a] transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
        )}

        {isReady && module.id !== "13" && module.id !== "19" ? (
          <button
            type="button"
            onClick={() => onSelectModule && onSelectModule(module)}
            className="group/btn flex w-full items-center justify-between rounded-full border border-white/15 bg-white/[0.03] py-2 pl-4 pr-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white transition-all hover:border-[#f5d08a] hover:bg-[#f5d08a] hover:text-[#05060a]"
          >
            <span>
              {isCompleted ? "Review Module" : isInProgress ? "Continue Module" : "Launch Module"}
            </span>
            <span className="flex size-6 items-center justify-center rounded-full bg-white/10 transition-colors group-hover/btn:bg-[#05060a] group-hover/btn:text-[#f5d08a]">
              <ArrowUpRight className="size-3" />
            </span>
          </button>
        ) : module.id === "13" ? (
          <Link
            to="/galaxies"
            className="group/btn flex w-full items-center justify-between rounded-full border border-[#38bdf8]/30 bg-[#38bdf8]/10 py-2 pl-4 pr-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#38bdf8] transition-all hover:bg-[#38bdf8] hover:text-[#05060a]"
          >
            <span>Explore Galaxies 3D</span>
            <span className="flex size-6 items-center justify-center rounded-full bg-[#05060a]/40">
              <ArrowUpRight className="size-3" />
            </span>
          </Link>
        ) : module.id === "19" ? (
          <Link
            to="/visible-universe-history"
            className="group/btn flex w-full items-center justify-between rounded-full border border-white/15 bg-white/[0.03] py-2 pl-4 pr-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white transition-all hover:border-[#f5d08a] hover:text-[#f5d08a]"
          >
            <span>Universe Timeline</span>
            <span className="flex size-6 items-center justify-center rounded-full bg-white/10">
              <ArrowUpRight className="size-3" />
            </span>
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => onSelectModule && onSelectModule(module)}
            className="flex w-full items-center justify-between rounded-full border border-white/10 py-2 px-4 font-mono text-[10px] uppercase tracking-[0.2em] text-white/50 transition-colors hover:border-white/25 hover:text-white"
          >
            <span>Preview Syllabus</span>
            <Lock className="size-3" />
          </button>
        )}
      </div>
    </div>
  );
}
