import React, { useState } from "react";
import {
  Compass,
  CheckCircle2,
  HelpCircle,
  Trophy,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Flame,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ScavengerClue {
  id: string;
  title: string;
  riddle: string;
  options: string[];
  correctAnswer: string;
  hint: string;
  funFact: string;
}

const HUNT_CLUES: ScavengerClue[] = [
  {
    id: "hunt-1",
    title: "1. The Runaway Oven",
    riddle:
      "I am shrouded in thick, opaque clouds of sulfuric acid. My runaway greenhouse effect makes my surface hotter than an oven day and night, hot enough to melt lead!",
    options: ["Mercury", "Venus", "Mars", "Jupiter"],
    correctAnswer: "Venus",
    hint: "I am sometimes called Earth's 'evil twin' and spin backward (retrograde).",
    funFact:
      "At 464°C (867°F), Venus is hotter than Mercury despite being twice as far from the Sun!",
  },
  {
    id: "hunt-2",
    title: "2. The Water Float Champion",
    riddle:
      "I am crowned with thousands of glittering rings of water ice. Although I am 95 times more massive than Earth, my average density is less than 0.7 g/cm³ — I could float in a giant bathtub!",
    options: ["Saturn", "Uranus", "Neptune", "Jupiter"],
    correctAnswer: "Saturn",
    hint: "Look for the world with the famous hexagonal storm spinning at its north pole.",
    funFact: "Saturn's main rings are up to 280,000 km wide but less than 30 meters thick!",
  },
  {
    id: "hunt-3",
    title: "3. The Sideways Roller",
    riddle:
      "A titanic ancient collision tipped my rotational axis nearly 98 degrees! Instead of spinning like a top, I roll like a bowling ball along my 84-year orbit.",
    options: ["Mars", "Pluto", "Uranus", "Neptune"],
    correctAnswer: "Uranus",
    hint: "I am a pale cyan ice giant named after the Greek god of the sky.",
    funFact:
      "Each of my poles experiences 42 years of continuous sunlight, then 42 years of darkness.",
  },
  {
    id: "hunt-4",
    title: "4. The Fire & Ice Moon",
    riddle:
      "I orbit so close to giant Jupiter that gravitational tidal forces squeeze my crust by 100 meters every orbit, powering over 400 roaring sulfur volcanoes!",
    options: ["Europa", "Titan", "Io", "Ganymede"],
    correctAnswer: "Io",
    hint: "I look like a cosmic pizza covered in sulfur and volcanic calderas.",
    funFact: "Io's volcanic plumes shoot sulfur and sulfur dioxide more than 500 km into space!",
  },
  {
    id: "hunt-5",
    title: "5. The Asteroid Belt Sovereign",
    riddle:
      "I am the only dwarf planet located inside the inner Solar System, resting in the main asteroid belt between Mars and Jupiter. I contain one-third of the entire belt's mass!",
    options: ["Vesta", "Ceres", "Pluto", "Eris"],
    correctAnswer: "Ceres",
    hint: "NASA's Dawn spacecraft visited me and found bright sodium carbonate salt spots in Occator Crater.",
    funFact:
      "Ceres is believed to harbor a muddy, briny subterranean mantle with more water than Earth's fresh water!",
  },
];

interface SolarSystemScavengerHuntProps {
  onHuntCompleted?: () => void;
}

export function SolarSystemScavengerHunt({ onHuntCompleted }: SolarSystemScavengerHuntProps) {
  const [currentClueIndex, setCurrentClueIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [solvedIds, setSolvedIds] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentClue = HUNT_CLUES[currentClueIndex];
  const isCorrect = selectedAnswer === currentClue.correctAnswer;
  const isCurrentSolved = solvedIds.includes(currentClue.id);

  const handleSelectOption = (option: string) => {
    setSelectedAnswer(option);
    if (option === currentClue.correctAnswer) {
      if (!solvedIds.includes(currentClue.id)) {
        const nextSolved = [...solvedIds, currentClue.id];
        setSolvedIds(nextSolved);
        if (nextSolved.length === HUNT_CLUES.length) {
          setIsCompleted(true);
          onHuntCompleted?.();
        }
      }
    }
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setShowHint(false);
    if (currentClueIndex < HUNT_CLUES.length - 1) {
      setCurrentClueIndex((i) => i + 1);
    }
  };

  const handleReset = () => {
    setCurrentClueIndex(0);
    setSelectedAnswer(null);
    setShowHint(false);
    setSolvedIds([]);
    setIsCompleted(false);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 sm:p-6 backdrop-blur-xl shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="size-5 text-amber-400" />
            <h3 className="text-lg font-bold text-white">Solar System Scavenger Hunt</h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
              5 Cosmic Riddles
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Crack clues about bizarre worlds, volcanic moons, and planetary records.
          </p>
        </div>

        {/* Progress tracker */}
        <div className="flex items-center gap-1.5">
          {HUNT_CLUES.map((clue, idx) => (
            <div
              key={clue.id}
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                solvedIds.includes(clue.id)
                  ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/30"
                  : idx === currentClueIndex
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    : "bg-white/5 text-slate-500"
              }`}
            >
              {solvedIds.includes(clue.id) ? "✓" : idx + 1}
            </div>
          ))}
        </div>
      </div>

      {!isCompleted ? (
        <div className="space-y-4">
          <div className="bg-black/50 p-4 rounded-xl border border-white/10">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold text-amber-300 uppercase tracking-wider">
                {currentClue.title}
              </span>
              <span>
                Clue {currentClueIndex + 1} of {HUNT_CLUES.length}
              </span>
            </div>
            <p className="text-sm font-medium text-white leading-relaxed">"{currentClue.riddle}"</p>
          </div>

          {/* Option Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {currentClue.options.map((opt) => {
              const isPicked = selectedAnswer === opt;
              const isThisCorrect = opt === currentClue.correctAnswer;

              let btnStyle = "bg-white/5 hover:bg-white/10 text-slate-200 border-white/10";
              if (selectedAnswer) {
                if (isThisCorrect) {
                  btnStyle = "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold";
                } else if (isPicked) {
                  btnStyle = "bg-red-500/20 text-red-300 border-red-500/40";
                }
              }

              return (
                <button
                  key={opt}
                  onClick={() => handleSelectOption(opt)}
                  disabled={selectedAnswer !== null && isCorrect}
                  className={`p-3 rounded-xl border text-sm font-medium text-center transition flex items-center justify-center gap-2 ${btnStyle}`}
                >
                  {opt}
                  {selectedAnswer && isThisCorrect && (
                    <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback & Hint Box */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div>
              {selectedAnswer && isCorrect && (
                <div className="text-xs text-emerald-300 flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="size-4 text-emerald-400" />
                  Correct! {currentClue.funFact}
                </div>
              )}
              {selectedAnswer && !isCorrect && (
                <div className="text-xs text-red-300 flex items-center gap-1.5 font-medium">
                  Not quite! Re-read the clue carefully or reveal a hint below.
                </div>
              )}
              {showHint && (
                <div className="text-xs text-cyan-300 mt-1 italic flex items-center gap-1">
                  <HelpCircle className="size-3.5" /> Hint: {currentClue.hint}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {!showHint && !isCorrect && (
                <button
                  onClick={() => setShowHint(true)}
                  className="text-xs text-slate-400 hover:text-cyan-300 underline"
                >
                  Need a hint?
                </button>
              )}
              {isCorrect && currentClueIndex < HUNT_CLUES.length - 1 && (
                <Button
                  size="sm"
                  onClick={handleNext}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold"
                >
                  Next Clue <ArrowRight className="size-3.5 ml-1.5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Completed Celebration Screen */
        <div className="text-center py-6 px-4 bg-gradient-to-b from-amber-500/10 to-transparent rounded-2xl border border-amber-500/30">
          <div className="inline-flex p-3 rounded-2xl bg-amber-500/20 text-amber-300 mb-3">
            <Trophy className="size-8" />
          </div>
          <h4 className="text-xl font-bold text-white">Scavenger Hunt Mastered!</h4>
          <p className="text-xs text-slate-300 max-w-md mx-auto mt-1 leading-relaxed">
            Congratulations! You correctly identified all five celestial targets across the inner
            and outer Solar System.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Button
              size="sm"
              onClick={handleReset}
              variant="outline"
              className="border-white/10 text-white bg-white/5 hover:bg-white/10"
            >
              <RotateCcw className="size-3.5 mr-1.5" /> Replay Hunt
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
