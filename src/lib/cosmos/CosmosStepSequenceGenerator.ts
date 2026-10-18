/**
 * COSMOS Step Sequence Generator
 * Project: Our Visible Universe Academy
 * Scope: Phase 1 Structured Learning Sequence (Part 4) & Pedagogical Flow (Part 12)
 *
 * Transforms approved curriculum content across any of the 24 modules into
 * an ordered, strictly-typed sequence of LearningSteps with pedagogical transitions.
 */

import type { LearningLevel } from "../academy/types";
import { LessonContentProvider } from "./LessonContentProvider";
import type { NarrationSegment } from "./cosmos-types";
import type {
  LearningStep,
  LearningStepType,
  StepRecoveryBehavior,
} from "./learning-director-types";

export class CosmosStepSequenceGenerator {
  /**
   * Generates the complete ordered LearningStep sequence for a module.
   */
  public static generateModuleSequence(
    moduleId: string,
    level: LearningLevel,
  ): LearningStep[] {
    const meta = LessonContentProvider.getModuleMetadata(moduleId);
    const moduleTitle = meta ? meta.title : `Module ${moduleId}`;
    const segments = LessonContentProvider.getSegmentsForModule(moduleId, level, "en");

    // Group segments by sublesson and section
    const groupedByLesson = new Map<string, NarrationSegment[]>();
    segments.forEach((seg) => {
      const list = groupedByLesson.get(seg.lessonId) || [];
      list.push(seg);
      groupedByLesson.set(seg.lessonId, list);
    });

    const steps: LearningStep[] = [];
    let stepCounter = 1;

    // 1. Initial Module Introduction Step
    const introStepId = `step_${moduleId}_intro`;
    const introSegments = segments.filter(
      (s) => s.sectionId === "title" || s.sequenceNumber <= 2,
    );

    steps.push({
      stepId: introStepId,
      moduleId,
      lessonId: "module-intro",
      sectionId: "overview",
      sublessonIndex: 0,
      stepType: "TRANSITION",
      title: `Welcome to ${moduleTitle}`,
      learningLevel: level,
      targetComponentId: `module-${moduleId}-hero`,
      narrationSegmentIds: introSegments.map((s) => s.segmentId),
      requiresStudentInput: false,
      completionCondition: { type: "narration_finished" },
      recoveryBehavior: "resume_current",
      stepStatus: "pending",
      pedagogicalTransitionText: `Welcome to ${moduleTitle}. In this journey, we will explore the fundamental physics and wonders of the universe.`,
    });

    // 2. Sublesson Steps
    let sublessonIndex = 0;
    for (const [lessonId, lessonSegments] of groupedByLesson.entries()) {
      sublessonIndex++;
      const firstSegment = lessonSegments[0];
      const lessonTitle = firstSegment ? this.formatLessonTitle(firstSegment.displayText) : `Lesson ${sublessonIndex}`;

      // Group sublesson segments into logical steps: Overview / Deep Dive / Analogies
      const sectionMap = new Map<string, NarrationSegment[]>();
      lessonSegments.forEach((seg) => {
        const list = sectionMap.get(seg.sectionId) || [];
        list.push(seg);
        sectionMap.set(seg.sectionId, list);
      });

      for (const [sectionId, secSegments] of sectionMap.entries()) {
        const stepId = `step_${moduleId}_${lessonId}_${sectionId}_${stepCounter++}`;
        const stepType: LearningStepType =
          sectionId === "title" || sectionId === "takeaway"
            ? "LESSON"
            : sectionId === "deepDive" || sectionId === "mathOrAnalogy"
              ? "EXPLANATION"
              : sectionId === "didYouKnow"
                ? "REVIEW"
                : "LESSON";

        const targetComponentId = `m${moduleId}-sec-${sectionId}`;
        const visRef = secSegments.find((s) => s.visualizationReference)?.visualizationReference;

        steps.push({
          stepId,
          moduleId,
          lessonId,
          sectionId,
          sublessonIndex: sublessonIndex - 1,
          stepType,
          title: `${lessonTitle} — ${this.formatSectionTitle(sectionId)}`,
          learningLevel: level,
          targetComponentId,
          narrationSegmentIds: secSegments.map((s) => s.segmentId),
          requiresStudentInput: false,
          completionCondition: { type: "narration_finished" },
          recoveryBehavior: "resume_current",
          stepStatus: "pending",
          pedagogicalTransitionText: this.buildPedagogicalTransition(moduleId, lessonId, sectionId),
          visualizationRef: visRef,
        });
      }

      // Add interactive visual simulation anchor step if supported
      if (moduleId === "01" || moduleId === "08" || moduleId === "14") {
        steps.push({
          stepId: `step_${moduleId}_${lessonId}_vis_${stepCounter++}`,
          moduleId,
          lessonId,
          sectionId: "simulation",
          sublessonIndex: sublessonIndex - 1,
          stepType: "VISUALIZATION",
          title: `${lessonTitle} — Interactive Simulation Observation`,
          learningLevel: level,
          targetComponentId: `module-${moduleId}-visualizer`,
          narrationSegmentIds: [],
          requiresStudentInput: false,
          completionCondition: { type: "student_acknowledged", minElapsedSeconds: 3 },
          recoveryBehavior: "resume_current",
          stepStatus: "pending",
          pedagogicalTransitionText: "Observe how physical principles govern this visual model in real time.",
        });
      }
    }

    // 3. Activity Step Contract (Prepared for Phase 2)
    steps.push({
      stepId: `step_${moduleId}_activity`,
      moduleId,
      lessonId: "module-activities",
      sectionId: "interactive-lab",
      stepType: "ACTIVITY",
      title: `${moduleTitle} — Interactive Laboratory Activity`,
      learningLevel: level,
      targetComponentId: `module-${moduleId}-activities`,
      narrationSegmentIds: [],
      requiresStudentInput: true, // Invariant: Cannot skip unresolved student input
      completionCondition: { type: "activity_outcome_submitted" },
      recoveryBehavior: "wait_for_input",
      stepStatus: "pending",
      pedagogicalTransitionText: "Now apply your understanding directly in the interactive laboratory.",
    });

    // 4. Knowledge Check Quiz Step Contract (Prepared for Phase 2)
    steps.push({
      stepId: `step_${moduleId}_quiz`,
      moduleId,
      lessonId: "module-quiz",
      sectionId: "knowledge-check",
      stepType: "KNOWLEDGE_CHECK",
      title: `${moduleTitle} — Knowledge Assessment`,
      learningLevel: level,
      targetComponentId: `module-${moduleId}-quiz`,
      narrationSegmentIds: [],
      requiresStudentInput: true, // Invariant: Cannot skip unresolved student input
      completionCondition: { type: "quiz_passed", requiredScorePercent: 70 },
      recoveryBehavior: "wait_for_input",
      stepStatus: "pending",
      pedagogicalTransitionText: "Test your cosmic mastery with the scientific knowledge assessment.",
    });

    // 5. Completion Review Step
    steps.push({
      stepId: `step_${moduleId}_completion`,
      moduleId,
      lessonId: "module-completion",
      sectionId: "completion-check",
      stepType: "COMPLETION_CHECK",
      title: `${moduleTitle} — Verification & Next Journey`,
      learningLevel: level,
      targetComponentId: `module-${moduleId}-checklist`,
      narrationSegmentIds: [],
      requiresStudentInput: false,
      completionCondition: { type: "student_acknowledged" },
      recoveryBehavior: "resume_current",
      stepStatus: "pending",
      pedagogicalTransitionText: "Congratulations on completing this cosmic milestone. Let us review what we learned and prepare for the next frontier.",
    });

    // Link nextStepId pointers
    for (let i = 0; i < steps.length; i++) {
      if (i < steps.length - 1) {
        steps[i].nextStepId = steps[i + 1].stepId;
      }
    }

    return steps;
  }

  private static formatLessonTitle(text: string): string {
    const clean = (text || "").replace(/^[0-9]+[\.\-\s]+/, "").trim();
    if (clean.length > 40) return clean.slice(0, 37) + "...";
    return clean || "Lesson";
  }

  private static formatSectionTitle(sectionId: string): string {
    switch (sectionId) {
      case "title":
        return "Core Concept";
      case "takeaway":
        return "Key Takeaway";
      case "deepDive":
        return "In-Depth Astrophysics";
      case "mathOrAnalogy":
        return "Mathematical Model & Analogy";
      case "didYouKnow":
        return "Observational Discovery";
      default:
        return sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
    }
  }

  private static buildPedagogicalTransition(moduleId: string, lessonId: string, sectionId: string): string {
    if (moduleId === "08") {
      if (sectionId === "mathOrAnalogy") {
        return "Now that we've seen how gravity shapes planetary motion, let's investigate why orbital speed changes with distance.";
      }
      return "Next, let us analyze Kepler's mathematical formulation of celestial dynamics.";
    }
    if (moduleId === "14") {
      if (sectionId === "deepDive") {
        return "Let us now probe deep into the curvature of spacetime near the event horizon.";
      }
      return "Next, we observe how extreme gravity bends and focuses cosmic light rays.";
    }
    if (moduleId === "01") {
      if (sectionId === "deepDive") {
        return "Let's zoom out to understand how Earth fits into the grand cosmic hierarchy.";
      }
    }
    return "Let us continue to the next scientific insight.";
  }
}
