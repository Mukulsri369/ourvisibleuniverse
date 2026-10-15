import React, { useState } from "react";
import { TAXONOMY_CHALLENGE_ITEMS, TaxonomyItem } from "@/lib/academy/lessons/module-01-our-place";
import { CheckCircle2, XCircle, Award, RotateCcw, HelpCircle, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

const CATEGORIES = ["Planet/Moon", "Star", "Star System", "Galaxy"] as const;

interface TaxonomyChallengeProps {
  onSuccess?: () => void;
}

export function TaxonomyChallenge({ onSuccess }: TaxonomyChallengeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userGuesses, setUserGuesses] = useState<Record<string, string>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  const currentItem = TAXONOMY_CHALLENGE_ITEMS[currentIndex];

  const handleSelectCategory = (category: string) => {
    if (userGuesses[currentItem.id]) return;

    const nextGuesses = {
      ...userGuesses,
      [currentItem.id]: category,
    };
    setUserGuesses(nextGuesses);

    // If all items answered, complete game
    if (Object.keys(nextGuesses).length === TAXONOMY_CHALLENGE_ITEMS.length) {
      setIsCompleted(true);
      onSuccess?.();
    }
  };

  const handleNext = () => {
    if (currentIndex < TAXONOMY_CHALLENGE_ITEMS.length - 1) {
      setCurrentIndex((c) => c + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((c) => c - 1);
    }
  };

  const handleRestart = () => {
    setUserGuesses({});
    setCurrentIndex(0);
    setIsCompleted(false);
  };

  // Calculate score
  const correctCount = TAXONOMY_CHALLENGE_ITEMS.filter(
    (item) => userGuesses[item.id] === item.category,
  ).length;

  const currentAnswer = userGuesses[currentItem.id];
  const isCurrentCorrect = currentAnswer === currentItem.category;

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
              Interactive Challenge 2
            </span>
            <span className="text-xs text-slate-400">Cosmic Taxonomy</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Planet, Star, System or Galaxy?
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Classify celestial objects into their correct astronomical category.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-cyan-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
            Item {currentIndex + 1} of {TAXONOMY_CHALLENGE_ITEMS.length}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRestart}
            className="text-xs border-white/10 text-slate-300"
          >
            <RotateCcw className="size-3.5 mr-1" />
            <span>Reset</span>
          </Button>
        </div>
      </div>

      {/* Main Challenge Chamber */}
      <div className="rounded-2xl border border-white/10 bg-slate-950 p-6 sm:p-8 text-center max-w-xl mx-auto">
        <div className="text-5xl mb-3">{currentItem.icon}</div>
        <h4 className="text-2xl font-extrabold text-white">{currentItem.name}</h4>
        <p className="text-xs text-slate-400 mt-1 italic">&ldquo;{currentItem.hint}&rdquo;</p>

        {/* 4 Category Choices */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          {CATEGORIES.map((cat) => {
            const isSelected = currentAnswer === cat;
            const isTargetCat = cat === currentItem.category;

            let btnStyle = "border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/10";
            if (currentAnswer) {
              if (isTargetCat) {
                btnStyle =
                  "border-emerald-500/60 bg-emerald-950/40 text-emerald-200 font-bold ring-1 ring-emerald-500/50";
              } else if (isSelected && !isTargetCat) {
                btnStyle = "border-rose-500/60 bg-rose-950/40 text-rose-200 line-through";
              } else {
                btnStyle = "border-white/5 opacity-40";
              }
            }

            return (
              <button
                key={cat}
                onClick={() => handleSelectCategory(cat)}
                disabled={Boolean(currentAnswer)}
                className={`py-3 px-4 rounded-xl border text-xs font-semibold transition-all ${btnStyle}`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Feedback Reveal */}
        {currentAnswer && (
          <div
            className={`mt-5 p-3.5 rounded-xl border text-xs leading-relaxed ${
              isCurrentCorrect
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
                : "bg-rose-500/10 border-rose-500/30 text-rose-200"
            }`}
          >
            <span className="font-bold block mb-0.5">
              {isCurrentCorrect ? "Correct Classification!" : "Incorrect."}
            </span>
            <span>{currentItem.explanation}</span>
          </div>
        )}

        {/* Navigation Step Buttons */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="text-xs border-white/10 text-slate-300"
          >
            Previous
          </Button>

          <span className="text-xs text-slate-400">
            Score: {correctCount} / {TAXONOMY_CHALLENGE_ITEMS.length}
          </span>

          <Button
            size="sm"
            onClick={handleNext}
            disabled={currentIndex === TAXONOMY_CHALLENGE_ITEMS.length - 1}
            className="text-xs bg-cyan-600 hover:bg-cyan-500 text-white font-semibold"
          >
            Next Object
          </Button>
        </div>
      </div>
    </div>
  );
}
