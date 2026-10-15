import React, { useState } from "react";
import type {
  LearningLevel,
  LessonContract,
  ModuleContract,
  ModuleStatus,
  UserProgress,
} from "@/lib/academy/types";
import { LessonHero } from "./LessonHero";
import { ScientificVisualization } from "./ScientificVisualization";
import { InteractiveExperiment } from "./InteractiveExperiment";
import { KnowledgeCheck } from "./KnowledgeCheck";
import { SourceInformationPanel } from "./SourceInformationPanel";
import { ModuleNavigation } from "./ModuleNavigation";
import { LearningLevelSelector } from "./LearningLevelSelector";
import { BookOpen, Check, HelpCircle, Lightbulb, Compass, ArrowRight } from "lucide-react";

interface LessonLayoutProps {
  module: ModuleContract;
  lesson: LessonContract;
  progress: UserProgress;
  onSetLearningLevel: (level: LearningLevel) => void;
  onUpdateModuleProgress: (moduleId: string, percent: number, status?: ModuleStatus) => void;
  onRecordQuiz: (quizId: string, score: number, total: number) => void;
  onBackToMap: () => void;
  nextRecommended?: {
    module: ModuleContract;
    reason: string;
  };
  onSelectNextModule?: (module: ModuleContract) => void;
}

export function LessonLayout({
  module,
  lesson,
  progress,
  onSetLearningLevel,
  onUpdateModuleProgress,
  onRecordQuiz,
  onBackToMap,
  nextRecommended,
  onSelectNextModule,
}: LessonLayoutProps) {
  const level = progress.selectedLevel;
  const content = lesson.gradeLevelContent[level] || lesson.gradeLevelContent.explorer;
  const moduleProgress = progress.moduleProgress[module.id];
  const isCompleted = moduleProgress?.status === "completed";

  const [activeTab, setActiveTab] = useState<"lesson" | "explore" | "experiment" | "quiz">(
    "lesson",
  );

  // Track exploration completion
  const handleVisualizationInteract = () => {
    onUpdateModuleProgress(module.id, 40, "in_progress");
  };

  const handleExperimentComplete = () => {
    onUpdateModuleProgress(module.id, 70, "in_progress");
  };

  const handleQuizComplete = (score: number, total: number) => {
    onRecordQuiz(lesson.lessonId, score, total);
    const passThreshold = Math.ceil(total * 0.7);
    if (score >= passThreshold) {
      onUpdateModuleProgress(module.id, 100, "completed");
    } else {
      onUpdateModuleProgress(module.id, 85, "in_progress");
    }
  };

  const handleMarkComplete = () => {
    onUpdateModuleProgress(module.id, 100, "completed");
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Step A: Cinematic Curiosity Hook & Lesson Header */}
      <LessonHero
        title={module.title}
        subtitle={module.subtitle}
        moduleNumber={module.number}
        stageTitle={`Stage 0${module.stageId}`}
        hookText={content.introHook}
        level={level}
        estimatedMinutes={module.estimatedMinutes}
        onBackToMap={onBackToMap}
      />

      {/* Floating Level Switcher Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <span className="font-semibold text-white">Current Age Level:</span>
          <span>Switch level to adapt text & questions seamlessly</span>
        </div>
        <LearningLevelSelector currentLevel={level} onSelectLevel={onSetLearningLevel} compact />
      </div>

      {/* Step B: Simple Concept Introduction */}
      <section className="rounded-3xl border border-white/10 bg-slate-900/50 p-6 sm:p-8 backdrop-blur-xl">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-mono font-bold text-sky-400 bg-sky-500/10 border border-sky-500/30 px-2.5 py-0.5 rounded-full">
            Step B: Concept Introduction
          </span>
          <span className="text-xs text-slate-400">Core Foundations</span>
        </div>

        <h2 className="text-2xl font-bold text-white mb-4">Understanding Our Cosmic Coordinates</h2>

        {/* Core Concept Bullets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          {content.coreConcepts.map((concept, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-white/10 bg-white/[0.02] p-4 flex items-start gap-2.5"
            >
              <div className="size-5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                {idx + 1}
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">{concept}</p>
            </div>
          ))}
        </div>

        {/* Explanatory Narrative Body */}
        <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed space-y-4">
          <p>{content.explanatoryText}</p>
          {content.depthNotes && (
            <div className="rounded-xl bg-indigo-500/10 border border-indigo-500/20 p-4 text-xs text-indigo-200 leading-relaxed">
              <span className="font-bold text-indigo-300 block mb-1">
                Deeper Astrophysical Context:
              </span>
              <p>{content.depthNotes}</p>
            </div>
          )}
          {content.mathExplanation && (
            <div className="rounded-xl bg-cyan-500/10 border border-cyan-500/20 p-4 text-xs text-cyan-200 font-mono leading-relaxed">
              <span className="font-bold text-cyan-300 block mb-1">
                Mathematical Scale Insight:
              </span>
              <p>{content.mathExplanation}</p>
            </div>
          )}
        </div>
      </section>

      {/* Step C: Interactive Scientific Visualization */}
      <section>
        <ScientificVisualization onInteract={handleVisualizationInteract} />
      </section>

      {/* Step D: Guided Exploration Prompts */}
      <section className="rounded-3xl border border-white/10 bg-slate-900/40 p-6 sm:p-8 backdrop-blur-xl">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-mono font-bold text-purple-400 bg-purple-500/10 border border-purple-500/30 px-2.5 py-0.5 rounded-full">
            Step D: Guided Cosmic Exploration
          </span>
          <span className="text-xs text-slate-400">Observational Prompts</span>
        </div>
        <h3 className="text-xl font-bold text-white mb-4">Three Cosmic Questions to Investigate</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
            <span className="text-2xl mb-2 block">1️⃣</span>
            <h4 className="text-sm font-bold text-white">Compare Earth to the Solar System</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Notice how the distance from Earth to the Kuiper Belt (100 AU) is over 10 million
              times larger than Earth itself. Space between planets is almost entirely empty!
            </p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
            <span className="text-2xl mb-2 block">2️⃣</span>
            <h4 className="text-sm font-bold text-white">Locate the Orion-Cygnus Arm</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              We are not at the center of the Milky Way! We live roughly 26,000 light-years out in
              the galactic suburbs, in a quiet, stable lane perfect for life to evolve.
            </p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
            <span className="text-2xl mb-2 block">3️⃣</span>
            <h4 className="text-sm font-bold text-white">Laniakea Cosmic Watershed</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Just like raindrops flowing into rivers, our Milky Way and 100,000 other galaxies are
              gravitationally flowing toward the Great Attractor in the Laniakea Supercluster.
            </p>
          </div>
        </div>
      </section>

      {/* Step E: Hands-on Cosmic Experiment Sandbox */}
      <section>
        <InteractiveExperiment onCompleteExperiment={handleExperimentComplete} />
      </section>

      {/* Step F: Knowledge Check Quiz */}
      <section>
        <KnowledgeCheck
          quizId={lesson.lessonId}
          questions={content.quizQuestions}
          onCompleteQuiz={handleQuizComplete}
        />
      </section>

      {/* Step G: Discovery Facts & Primary Scientific Sources */}
      <section>
        <SourceInformationPanel sources={lesson.scientificSources} funFacts={content.funFacts} />
      </section>

      {/* Step H: Completion & Adaptive Recommendations */}
      <section>
        <ModuleNavigation
          currentModule={module}
          isCompleted={isCompleted}
          onMarkComplete={handleMarkComplete}
          nextRecommended={nextRecommended}
          onSelectNextModule={onSelectNextModule}
          onBackToMap={onBackToMap}
        />
      </section>
    </div>
  );
}
