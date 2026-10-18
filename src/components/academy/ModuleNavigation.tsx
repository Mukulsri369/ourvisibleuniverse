import React from "react";
import type { ModuleContract } from "@/lib/academy/types";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, Award, ArrowRight, Sparkles, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModuleCompletionChecklist } from "./ModuleCompletionChecklist";

interface ModuleNavigationProps {
  currentModule: ModuleContract;
  isCompleted: boolean;
  onMarkComplete?: () => void;
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
  nextRecommended,
  onSelectNextModule,
  onBackToMap,
}: ModuleNavigationProps) {
  const handleNext = () => {
    if (nextRecommended?.module && onSelectNextModule) {
      onSelectNextModule(nextRecommended.module);
    } else {
      onBackToMap();
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Authoritative Module Completion Checklist */}
      <ModuleCompletionChecklist
        moduleId={currentModule.id}
        onNextModule={handleNext}
        onNavigateToAssessment={() => {
          if (typeof document !== "undefined") {
            const el = document.querySelector('[role="region"][aria-label="Module Knowledge Assessment"]');
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }
        }}
        onNavigateToActivity={() => {
          if (typeof document !== "undefined") {
            const el = document.querySelector('section, [role="region"]');
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }
        }}
        onNavigateToSection={() => {
          if (typeof window !== "undefined") {
            window.scrollTo({ top: 300, behavior: "smooth" });
          }
        }}
      />

      {/* 2. Navigation & Next Module Card */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={onBackToMap}
            className="border-white/10 text-slate-300 hover:text-white hover:bg-white/5"
          >
            <Compass className="size-4 mr-2 text-cyan-400" />
            <span>Return to Cosmic Curriculum Map</span>
          </Button>

          {nextRecommended?.module && (
            <Button
              size="lg"
              onClick={handleNext}
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-md border-none"
            >
              <span>Next: Module {nextRecommended.module.id}</span>
              <ArrowRight className="size-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Recommended Next Step Callout */}
        {nextRecommended && (
          <div className="mt-6 pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex-shrink-0">
                <Sparkles className="size-5" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
                  Recommended Continuation
                </span>
                <h4 className="text-base font-bold text-white mt-0.5">
                  Module {nextRecommended.module.id}: {nextRecommended.module.title}
                </h4>
                <p className="text-xs text-slate-300 mt-1 max-w-xl">{nextRecommended.reason}</p>
              </div>
            </div>

            <Button
              size="sm"
              onClick={handleNext}
              className="bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold flex-shrink-0"
            >
              <span>Begin Lesson</span>
              <ArrowRight className="size-3.5 ml-1.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
