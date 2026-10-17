import { motion, AnimatePresence } from "framer-motion";
import { useStore, GUIDED_JOURNEY_STEPS } from "./store";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Compass,
  Clock,
  Radio,
  Eye,
  Layers,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function GuidedJourneyHUD() {
  const active = useStore((s) => s.guidedJourneyActive);
  const stepIdx = useStore((s) => s.guidedJourneyStep);
  const nextStep = useStore((s) => s.nextGuidedJourneyStep);
  const prevStep = useStore((s) => s.prevGuidedJourneyStep);
  const stopJourney = useStore((s) => s.stopGuidedJourney);
  const setStep = useStore((s) => s.setGuidedJourneyStep);
  const setExplorerOpen = useStore((s) => s.setCosmicWebExplorerOpen);

  if (!active) return null;

  const currentStep = GUIDED_JOURNEY_STEPS[stepIdx] ?? GUIDED_JOURNEY_STEPS[0];
  const isFirst = stepIdx === 0;
  const isLast = stepIdx === GUIDED_JOURNEY_STEPS.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 w-full max-w-2xl px-4 pointer-events-none"
      >
        <div className="pointer-events-auto rounded-2xl border border-cyan-500/40 bg-slate-950/90 p-5 shadow-2xl backdrop-blur-xl text-white">
          {/* Header Row */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <Compass className="size-4" />
              </span>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400">
                  Cosmic Scale Journey • Stage {stepIdx + 1} of {GUIDED_JOURNEY_STEPS.length}
                </div>
                <h3 className="text-base font-bold text-white">{currentStep.title}</h3>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExplorerOpen(true)}
                className="h-8 text-xs text-slate-300 hover:text-white hover:bg-white/10"
              >
                <Layers className="size-3.5 mr-1 text-cyan-400" />
                Explorer
              </Button>
              <button
                onClick={stopJourney}
                className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition"
                title="Exit Guided Journey"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* Stepper Dots */}
          <div className="flex items-center justify-between gap-1.5 py-3">
            {GUIDED_JOURNEY_STEPS.map((step, idx) => {
              const isCurrent = idx === stepIdx;
              const isPast = idx < stepIdx;
              return (
                <button
                  key={step.id}
                  onClick={() => setStep(idx)}
                  className={`flex-1 h-1.5 rounded-full transition-all ${
                    isCurrent
                      ? "bg-cyan-400 shadow-[0_0_8px_#38bdf8]"
                      : isPast
                        ? "bg-cyan-600/60"
                        : "bg-slate-800"
                  }`}
                  title={`${step.title} (${step.scaleDescription})`}
                />
              );
            })}
          </div>

          {/* Scientific Context Grid */}
          <div className="grid grid-cols-3 gap-2 py-2">
            <div className="rounded-lg bg-white/5 p-2 text-xs border border-white/5">
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <Radio className="size-3 text-cyan-400" />
                Physical Span
              </div>
              <div className="font-semibold text-slate-100 truncate mt-0.5">
                {currentStep.scaleDescription}
              </div>
            </div>

            <div className="rounded-lg bg-white/5 p-2 text-xs border border-white/5">
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <Clock className="size-3 text-amber-400" />
                Lookback Time
              </div>
              <div className="font-semibold text-slate-100 truncate mt-0.5">
                {currentStep.lookbackTimeText}
              </div>
            </div>

            <div className="rounded-lg bg-white/5 p-2 text-xs border border-white/5">
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <Sparkles className="size-3 text-purple-400" />
                Redshift (z)
              </div>
              <div className="font-semibold text-slate-100 truncate mt-0.5">
                {currentStep.redshiftText}
              </div>
            </div>
          </div>

          {/* Narrative Body */}
          <p className="text-xs text-slate-300 leading-relaxed py-2 line-clamp-3">
            {currentStep.scientificDescription}
          </p>

          {/* Action Row */}
          <div className="flex items-center justify-between border-t border-white/10 pt-3 mt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={prevStep}
              disabled={isFirst}
              className="border-white/15 bg-white/5 text-xs text-slate-200 hover:bg-white/10 disabled:opacity-40"
            >
              <ChevronLeft className="size-3.5 mr-1" />
              Previous
            </Button>

            <div className="text-[11px] text-slate-400 font-mono">{currentStep.subtitle}</div>

            <Button
              size="sm"
              onClick={isLast ? stopJourney : nextStep}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs shadow-md shadow-cyan-500/20"
            >
              {isLast ? "Finish Journey" : "Next Stage"}
              <ChevronRight className="size-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
