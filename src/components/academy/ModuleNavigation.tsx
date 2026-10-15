import React from "react";
import type { ModuleContract } from "@/lib/academy/types";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, Award, ArrowRight, Sparkles, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ModuleNavigationProps {
  currentModule: ModuleContract;
  isCompleted: boolean;
  onMarkComplete: () => void;
  nextRecommended?: {
    module: ModuleContract;
    reason: string;
  };
  onSelectNextModule?: (module: ModuleContract) => void;
  onBackToMap: () => void;
}

export function ModuleNavigation({
  currentModule,
  isCompleted,
  onMarkComplete,
  nextRecommended,
  onSelectNextModule,
  onBackToMap,
}: ModuleNavigationProps) {
  return (
    <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/30 via-slate-900/90 to-slate-950 p-6 sm:p-8 backdrop-blur-xl">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
              Step H: Lesson Mastery & Next Horizon
            </span>
          </div>
          <h3 className="text-2xl font-extrabold text-white">
            {isCompleted ? "Module Completed! 🌟" : "Finish Your Cosmic Exploration"}
          </h3>
          <p className="mt-1 text-sm text-slate-300 max-w-xl leading-relaxed">
            {isCompleted
              ? "You have completed all observational activities and knowledge checks for this module. Your progress and achievement badges have been recorded."
              : "Ready to wrap up? Mark this module complete to unlock your Cosmic Citizen badge and progress toward the next celestial destination."}
          </p>
        </div>

        {/* Action Button */}
        <div className="flex flex-wrap items-center gap-3">
          {!isCompleted ? (
            <Button
              size="lg"
              onClick={onMarkComplete}
              className="font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-white shadow-lg shadow-cyan-500/20 border-none"
            >
              <CheckCircle2 className="size-5 mr-2" />
              <span>Mark Module Complete</span>
            </Button>
          ) : (
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 bg-emerald-500/20 border border-emerald-500/40 px-4 py-2.5 rounded-xl">
              <Award className="size-5 text-emerald-400" />
              <span>Module 0{currentModule.number} Mastered!</span>
            </div>
          )}

          <Button
            variant="outline"
            size="lg"
            onClick={onBackToMap}
            className="border-white/10 text-slate-300 hover:text-white hover:bg-white/5"
          >
            <Compass className="size-4 mr-2 text-cyan-400" />
            <span>Learning Map</span>
          </Button>
        </div>
      </div>

      {/* Recommended Next Step Callout */}
      {nextRecommended && (
        <div className="mt-6 pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex-shrink-0">
              <Sparkles className="size-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block">
                Adaptive Next Recommendation
              </span>
              <h4 className="text-sm font-bold text-white">
                Module {nextRecommended.module.id}: {nextRecommended.module.title}
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">{nextRecommended.reason}</p>
            </div>
          </div>

          <div>
            {nextRecommended.module.route.startsWith("/learn") ? (
              <Button
                size="sm"
                onClick={() => onSelectNextModule?.(nextRecommended.module)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
              >
                <span>Continue Journey</span>
                <ArrowRight className="size-3.5 ml-1.5" />
              </Button>
            ) : (
              <Button
                asChild
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
              >
                <Link to={nextRecommended.module.route}>
                  <span>Explore Destination</span>
                  <ArrowRight className="size-3.5 ml-1.5" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
