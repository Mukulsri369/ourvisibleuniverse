import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "./store";
import { Keyboard, X, Mouse, Smartphone, Eye, Sparkles } from "lucide-react";

export function KeyboardShortcutsModal() {
  const open = useStore((s) => s.shortcutsModalOpen);
  const setOpen = useStore((s) => s.setShortcutsModalOpen);

  if (!open) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 backdrop-blur-md"
        style={{ background: "rgba(2, 4, 12, 0.82)" }}
        onClick={() => setOpen(false)}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative flex h-[82vh] w-full max-w-2xl flex-col rounded-2xl border border-white/15 bg-[#090b1c] text-white shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-white/[0.02]">
            <div className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Keyboard className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base md:text-lg font-medium text-white tracking-wide">
                  Interaction &amp; Accessibility Guide
                </h2>
                <p className="text-xs text-white/50">
                  Comprehensive controls for keyboard, mouse, trackpad &amp; multi-touch gestures
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="grid h-8 w-8 place-items-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Controls Sections */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
            {/* 1. Keyboard Navigation */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-cyan-300 font-semibold uppercase tracking-wider text-[11px]">
                <Keyboard className="h-4 w-4" />
                <span>Keyboard Shortcuts</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono">
                <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] p-2.5">
                  <span className="text-white/70">Zoom Out Logarithmically</span>
                  <kbd className="rounded bg-white/10 px-2 py-0.5 text-cyan-300 font-bold border border-white/20">
                    SPACE
                  </kbd>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] p-2.5">
                  <span className="text-white/70">Zoom In Logarithmically</span>
                  <kbd className="rounded bg-white/10 px-2 py-0.5 text-cyan-300 font-bold border border-white/20">
                    CTRL
                  </kbd>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] p-2.5">
                  <span className="text-white/70">Free Look / Resume Lock</span>
                  <kbd className="rounded bg-white/10 px-2 py-0.5 text-cyan-300 font-bold border border-white/20">
                    S
                  </kbd>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] p-2.5">
                  <span className="text-white/70">Toggle Auto-Orbit</span>
                  <kbd className="rounded bg-white/10 px-2 py-0.5 text-cyan-300 font-bold border border-white/20">
                    O
                  </kbd>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] p-2.5">
                  <span className="text-white/70">Reset Orientation to North</span>
                  <kbd className="rounded bg-white/10 px-2 py-0.5 text-cyan-300 font-bold border border-white/20">
                    R
                  </kbd>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] p-2.5">
                  <span className="text-white/70">Universal Catalog Search</span>
                  <kbd className="rounded bg-white/10 px-2 py-0.5 text-cyan-300 font-bold border border-white/20">
                    / or CMD+K
                  </kbd>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] p-2.5">
                  <span className="text-white/70">Deselect / Clear Focus</span>
                  <kbd className="rounded bg-white/10 px-2 py-0.5 text-cyan-300 font-bold border border-white/20">
                    ESC
                  </kbd>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] p-2.5">
                  <span className="text-white/70">Open Controls Helper</span>
                  <kbd className="rounded bg-white/10 px-2 py-0.5 text-cyan-300 font-bold border border-white/20">
                    ?
                  </kbd>
                </div>
              </div>
            </div>

            {/* 2. Mouse & Trackpad */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-cyan-300 font-semibold uppercase tracking-wider text-[11px]">
                <Mouse className="h-4 w-4" />
                <span>Mouse &amp; Trackpad</span>
              </div>
              <div className="space-y-2 text-white/80">
                <div className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-3">
                  <span className="font-semibold text-white">Left Click + Drag:</span>
                  <span className="text-white/60">
                    Spherical orbit around target with momentum inertia and smooth damping.
                  </span>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-3">
                  <span className="font-semibold text-white">Scroll Wheel / Trackpad Pinch:</span>
                  <span className="text-white/60">
                    Continuous smooth logarithmic zoom spanning 20 orders of magnitude from planetary surfaces to cosmic horizon.
                  </span>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-3">
                  <span className="font-semibold text-white">Direct Object Click:</span>
                  <span className="text-white/60">
                    Click any star, planet, or deep space marker to initiate a cinematic fly-to inspection.
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Multi-Touch Gestures */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-cyan-300 font-semibold uppercase tracking-wider text-[11px]">
                <Smartphone className="h-4 w-4" />
                <span>Multi-Touch Gestures (Mobile &amp; Tablets)</span>
              </div>
              <div className="space-y-2 text-white/80">
                <div className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-3">
                  <span className="font-semibold text-white">Single Finger Drag:</span>
                  <span className="text-white/60">Rotate perspective smoothly around celestial anchor.</span>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-3">
                  <span className="font-semibold text-white">Two Finger Pinch:</span>
                  <span className="text-white/60">Natural pinch-to-zoom with adaptive rate scaling.</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
