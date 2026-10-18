/**
 * COSMOS StudentQuestionContext Assembler
 * Project: Our Visible Universe Academy
 *
 * Captures and assembles the exact epistemic state of the learning interface:
 * current module, lesson, sublesson, scientific topic, displayed text,
 * active visualization, learning level, objectives, and discussion history.
 */

import type { LearningLevel } from "../academy/types";
import { ACADEMY_MODULES } from "../academy/registry";
import { LessonContentProvider } from "./LessonContentProvider";
import type {
  CosmosDiscussionTurn,
  CosmosVisualizationReference,
  StudentQuestionContext,
} from "./cosmos-types";

export class StudentQuestionContextManager {
  private static discussionHistory = new Map<string, CosmosDiscussionTurn[]>();

  /**
   * Assembles a complete context object from current UI parameters.
   */
  public static buildContext(params: {
    moduleId: string;
    sublessonId?: string;
    learningLevel: LearningLevel;
    activeTextOverride?: string;
    currentVisualization?: CosmosVisualizationReference;
    activeExamAttempt?: boolean;
  }): StudentQuestionContext {
    const { moduleId, sublessonId, learningLevel, activeTextOverride, currentVisualization, activeExamAttempt } =
      params;

    const moduleMeta = ACADEMY_MODULES.find((m) => m.id === moduleId);
    const moduleTitle = moduleMeta?.title || `Module ${moduleId}`;
    const moduleNumber = moduleMeta?.number || parseInt(moduleId, 10) || 1;
    const learningObjectives = moduleMeta?.learningObjectives || [];
    const scientificReferences = (moduleMeta?.scientificSources || []).map(
      (s) => `${s.title} (${s.organization || "Peer-Reviewed Source"})`,
    );

    // Find sublesson details
    const segments = LessonContentProvider.getSegmentsForModule(moduleId, learningLevel);
    let sublessonSegments = segments;
    let lessonId = sublessonId || "overview";
    let lessonTitle = moduleTitle;
    let currentDisplayText = activeTextOverride || "";

    if (sublessonId) {
      const filtered = segments.filter((s) => s.lessonId === sublessonId);
      if (filtered.length > 0) {
        sublessonSegments = filtered;
        lessonId = sublessonId;
        lessonTitle = filtered[0].displayText.slice(0, 60);
      }
    }

    if (!currentDisplayText && sublessonSegments.length > 0) {
      currentDisplayText = sublessonSegments[0].displayText;
    }

    // Extract scientific terminology across these segments
    const termSet = new Set<string>();
    for (const seg of sublessonSegments) {
      for (const t of seg.keyTerminology) {
        termSet.add(t);
      }
    }

    // Resolve discussion history for this module
    const historyKey = `${moduleId}_${learningLevel}`;
    const discussionHistory = this.discussionHistory.get(historyKey) || [];

    // Derive scientific topic
    const scientificTopic =
      moduleMeta?.subtitle ||
      (sublessonSegments[0]?.keyTerminology[0]
        ? `Physics of ${sublessonSegments[0].keyTerminology[0]}`
        : moduleTitle);

    return {
      courseId: "cosmic-journey",
      courseVersion: "1.0.0",
      moduleId,
      moduleNumber,
      moduleTitle,
      lessonId,
      lessonTitle,
      sublessonId,
      sublessonTitle: lessonTitle,
      scientificTopic,
      currentDisplayText,
      learningLevel,
      currentVisualization:
        currentVisualization || sublessonSegments[0]?.visualizationReference,
      approvedLearningObjectives: learningObjectives,
      scientificReferences,
      relevantTerminology: Array.from(termSet),
      discussionHistory: [...discussionHistory],
      activeExamAttempt: Boolean(activeExamAttempt),
    };
  }

  /**
   * Appends a conversation turn to the discussion history buffer.
   * Limits history to the 10 most recent turns to maintain tight context bounds.
   */
  public static recordTurn(
    moduleId: string,
    learningLevel: LearningLevel,
    turn: CosmosDiscussionTurn,
  ): void {
    const historyKey = `${moduleId}_${learningLevel}`;
    const list = this.discussionHistory.get(historyKey) || [];
    list.push(turn);
    if (list.length > 10) {
      list.shift();
    }
    this.discussionHistory.set(historyKey, list);
  }

  /**
   * Clears discussion history for a module/session.
   */
  public static clearHistory(moduleId?: string, learningLevel?: LearningLevel): void {
    if (moduleId && learningLevel) {
      this.discussionHistory.delete(`${moduleId}_${learningLevel}`);
    } else {
      this.discussionHistory.clear();
    }
  }
}
