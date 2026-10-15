import React, { useState } from "react";
import { HIERARCHY_CARDS, HierarchyCard } from "@/lib/academy/lessons/module-01-our-place";
import {
  Layers,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface HierarchySequencerProps {
  onSuccess?: () => void;
}

// Deterministic initial scramble for SSR hydration safety (Order: Solar System, Milky Way, Earth, Observable Universe, Moon System, Local Stars)
const DETERMINISTIC_INITIAL_ORDER: HierarchyCard[] = [2, 4, 0, 5, 1, 3].map(
  (i) => HIERARCHY_CARDS[i],
);

export function HierarchySequencer({ onSuccess }: HierarchySequencerProps) {
  // Start with deterministic scrambled cards
  const [cards, setCards] = useState<HierarchyCard[]>(DETERMINISTIC_INITIAL_ORDER);
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const moveUp = (index: number) => {
    if (index === 0) return;
    setIsChecked(false);
    setCards((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const moveDown = (index: number) => {
    if (index === cards.length - 1) return;
    setIsChecked(false);
    setCards((prev) => {
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const handleValidate = () => {
    const correct = cards.every((c, idx) => c.correctRank === idx + 1);
    setIsChecked(true);
    setIsCorrect(correct);
    if (correct) {
      onSuccess?.();
    }
  };

  const handleShuffle = () => {
    setIsChecked(false);
    setIsCorrect(false);
    setCards([...HIERARCHY_CARDS].sort(() => 0.5 - Math.random()));
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
              Interactive Challenge 1
            </span>
            <span className="text-xs text-slate-400">Scale Sequence Puzzle</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Rebuild the Cosmic Hierarchy
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Order these cosmic structures from smallest (top) to largest (bottom).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShuffle}
            className="text-xs border-white/10 text-slate-300"
          >
            <RotateCcw className="size-3.5 mr-1" />
            <span>Shuffle</span>
          </Button>

          <Button
            size="sm"
            onClick={handleValidate}
            className="font-bold bg-cyan-600 hover:bg-cyan-500 text-white"
          >
            <CheckCircle2 className="size-3.5 mr-1" />
            <span>Check My Order</span>
          </Button>
        </div>
      </div>

      {/* Validation Result Banner */}
      {isChecked && (
        <div
          className={`mb-6 p-4 rounded-2xl border text-xs leading-relaxed flex items-center justify-between gap-3 ${
            isCorrect
              ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-200"
              : "bg-rose-500/15 border-rose-500/40 text-rose-200"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {isCorrect ? (
              <Sparkles className="size-5 text-emerald-400 flex-shrink-0" />
            ) : (
              <HelpCircle className="size-5 text-rose-400 flex-shrink-0" />
            )}
            <div>
              <span className="font-bold block text-sm">
                {isCorrect ? "Perfect Cosmic Order! 🏆" : "Not quite in order yet."}
              </span>
              <span>
                {isCorrect
                  ? "You have accurately mapped our hierarchical address from Earth all the way to the Observable Universe!"
                  : "Remember: Earth is inside the Solar System, which is inside the Milky Way, which is inside the Observable Universe."}
              </span>
            </div>
          </div>
          {isCorrect && (
            <div className="flex items-center gap-1.5 font-bold text-amber-300 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/40 text-[11px]">
              <Award className="size-4" />
              <span>Master Sequencer</span>
            </div>
          )}
        </div>
      )}

      {/* Card List */}
      <div className="space-y-2.5">
        {cards.map((card, idx) => {
          const isSlotCorrect = isChecked && card.correctRank === idx + 1;
          const isSlotWrong = isChecked && card.correctRank !== idx + 1;

          return (
            <div
              key={card.id}
              className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all ${
                isSlotCorrect
                  ? "bg-emerald-950/20 border-emerald-500/40"
                  : isSlotWrong
                    ? "bg-rose-950/20 border-rose-500/40"
                    : "bg-slate-950/70 border-white/10 hover:border-white/20"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-slate-400 bg-white/5 border border-white/10 size-7 rounded-lg flex items-center justify-center flex-shrink-0">
                  #{idx + 1}
                </span>
                <span className="text-2xl">{card.icon}</span>
                <div>
                  <h4 className="text-sm font-bold text-white">{card.title}</h4>
                  <p className="text-[11px] text-slate-400 leading-tight mt-0.5">{card.hint}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-amber-300 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5 hidden sm:inline-block">
                  {card.scaleText}
                </span>

                {/* Move buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveUp(idx)}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    title="Move up"
                  >
                    <ArrowUp className="size-3.5" />
                  </button>
                  <button
                    onClick={() => moveDown(idx)}
                    disabled={idx === cards.length - 1}
                    className="p-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    title="Move down"
                  >
                    <ArrowDown className="size-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
