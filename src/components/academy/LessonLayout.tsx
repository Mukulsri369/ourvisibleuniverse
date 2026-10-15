import React, { useState } from "react";
import type {
  LearningLevel,
  LessonContract,
  ModuleContract,
  ModuleStatus,
  UserProgress,
} from "@/lib/academy/types";
import { MODULE_01_SUBLESSONS } from "@/lib/academy/lessons/module-01-our-place";
import { LessonHero } from "./LessonHero";
import { CosmicZoomVisualizer3D } from "./CosmicZoomVisualizer3D";
import { HierarchySequencer } from "./HierarchySequencer";
import { TaxonomyChallenge } from "./TaxonomyChallenge";
import { InteractiveExperiment } from "./InteractiveExperiment";
import { KnowledgeCheck } from "./KnowledgeCheck";
import { SourceInformationPanel } from "./SourceInformationPanel";
import { ModuleNavigation } from "./ModuleNavigation";
import { LearningLevelSelector } from "./LearningLevelSelector";
import {
  BookOpen,
  CheckCircle2,
  Sparkles,
  Layers,
  HelpCircle,
  Compass,
  ArrowRight,
  ChevronRight,
  Flame,
  Globe,
  Orbit,
  Disc,
} from "lucide-react";
import { Button } from "@/components/ui/button";

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

  const [activeSubLessonIndex, setActiveSubLessonIndex] = useState(0);
  const activeSubLesson = MODULE_01_SUBLESSONS[activeSubLessonIndex];
  const activeSubContent = activeSubLesson.content[level];

  // Track exploration completion milestones
  const handleVisualizationInteract = () => {
    onUpdateModuleProgress(module.id, 50, "in_progress");
  };

  const handleHierarchyComplete = () => {
    onUpdateModuleProgress(module.id, 65, "in_progress");
  };

  const handleTaxonomyComplete = () => {
    onUpdateModuleProgress(module.id, 80, "in_progress");
  };

  const handleExperimentComplete = () => {
    onUpdateModuleProgress(module.id, 90, "in_progress");
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
    <div className="space-y-12 pb-20">
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

      {/* Level Selection Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <span className="font-semibold text-white">Age Adaptive Mode:</span>
          <span>Switch level to adapt text, mathematics & quiz questions</span>
        </div>
        <LearningLevelSelector currentLevel={level} onSelectLevel={onSetLearningLevel} compact />
      </div>

      {/* 6 Structured Sub-Lessons Stepper */}
      <section className="rounded-3xl border border-white/10 bg-slate-900/50 p-6 sm:p-8 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 rounded-full uppercase">
                Curriculum Syllabus • 6 Core Lessons
              </span>
              <span className="text-xs text-slate-400">Step-by-Step Cosmic Hierarchy</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Lesson 0{activeSubLesson.number}: {activeSubLesson.title}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">{activeSubLesson.subtitle}</p>
          </div>

          <span className="text-xs font-mono text-cyan-300 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
            {activeSubLessonIndex + 1} of {MODULE_01_SUBLESSONS.length} Lessons
          </span>
        </div>

        {/* 6 Sub-Lesson Tab Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-6">
          {MODULE_01_SUBLESSONS.map((sl, idx) => {
            const active = idx === activeSubLessonIndex;
            return (
              <button
                key={sl.id}
                onClick={() => setActiveSubLessonIndex(idx)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  active
                    ? "bg-cyan-500/20 border-cyan-400 text-white shadow-md ring-1 ring-cyan-400/30"
                    : "bg-white/[0.02] border-white/5 text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="text-[10px] font-mono font-bold text-cyan-400 block mb-0.5">
                  Lesson 0{sl.number}
                </span>
                <span className="text-xs font-bold block line-clamp-1 text-white">{sl.title}</span>
              </button>
            );
          })}
        </div>

        {/* Active Sub-Lesson Educational Content Card */}
        <div className="rounded-2xl border border-white/10 bg-slate-950 p-6 sm:p-8 space-y-6">
          {/* Main Summary */}
          <div className="border-b border-white/10 pb-5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 block mb-1">
              Core Concept Summary
            </span>
            <p className="text-base sm:text-lg text-slate-100 font-medium leading-relaxed">
              {activeSubContent.summary}
            </p>
          </div>

          {/* Deep Dive Narrative */}
          <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Observational Deep Dive
            </h4>
            <p>{activeSubContent.deepDive}</p>
          </div>

          {/* Side-by-Side: Did You Know & Math/Analogy */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 text-xs text-amber-200 leading-relaxed flex items-start gap-2.5">
              <Sparkles className="size-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-300 block mb-0.5">Cosmic Curiosity:</span>
                <span>{activeSubContent.didYouKnow}</span>
              </div>
            </div>

            <div className="rounded-xl bg-cyan-500/10 border border-cyan-500/20 p-4 text-xs text-cyan-200 font-mono leading-relaxed flex items-start gap-2.5">
              <Compass className="size-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-cyan-300 block mb-0.5">
                  Scale & Dimension Note:
                </span>
                <span>{activeSubContent.mathOrAnalogy}</span>
              </div>
            </div>
          </div>

          {/* Sub-lesson Stepper Navigation */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveSubLessonIndex((p) => Math.max(0, p - 1))}
              disabled={activeSubLessonIndex === 0}
              className="text-xs border-white/10 text-slate-300"
            >
              Previous Lesson
            </Button>

            <span className="text-xs text-slate-400 italic">{activeSubContent.takeaway}</span>

            <Button
              size="sm"
              onClick={() =>
                setActiveSubLessonIndex((p) => Math.min(MODULE_01_SUBLESSONS.length - 1, p + 1))
              }
              disabled={activeSubLessonIndex === MODULE_01_SUBLESSONS.length - 1}
              className="text-xs bg-cyan-600 hover:bg-cyan-500 text-white font-semibold"
            >
              Next Lesson
              <ChevronRight className="size-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* Signature 3D Experience: Cinematic Cosmic Zoom-Out */}
      <section>
        <CosmicZoomVisualizer3D
          onInteract={handleVisualizationInteract}
          onLayerChange={(layerIndex) => {
            // Synchronize sublesson if appropriate
            if (layerIndex < MODULE_01_SUBLESSONS.length) {
              setActiveSubLessonIndex(layerIndex);
            }
          }}
        />
      </section>

      {/* Interactive Hands-On Activities Suite */}
      <section className="space-y-8">
        <div className="border-b border-white/10 pb-3">
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
            Hands-On Interactive Laboratory
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Experiments & Challenges
          </h2>
        </div>

        {/* Activity 1: Rebuild the Cosmic Hierarchy */}
        <HierarchySequencer onSuccess={handleHierarchyComplete} />

        {/* Activity 2: Celestial Taxonomy Challenge */}
        <TaxonomyChallenge onSuccess={handleTaxonomyComplete} />

        {/* Activity 3: Speed of Light Travel Time Laboratory */}
        <InteractiveExperiment onCompleteExperiment={handleExperimentComplete} />
      </section>

      {/* Science Knowledge Check Quiz */}
      <section>
        <KnowledgeCheck
          quizId={lesson.lessonId}
          questions={content.quizQuestions}
          onCompleteQuiz={handleQuizComplete}
        />
      </section>

      {/* Primary Scientific Sources & Discovery Facts */}
      <section>
        <SourceInformationPanel sources={lesson.scientificSources} funFacts={content.funFacts} />
      </section>

      {/* Step H: Completion & Next Recommended Module */}
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
