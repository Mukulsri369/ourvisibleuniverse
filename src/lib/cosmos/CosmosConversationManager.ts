/**
 * COSMOS Conversation Manager
 * Project: Our Visible Universe Academy
 * Scope: Phase 1 Intelligent Conversational Teaching (Part 8 & 9)
 *
 * Coordinates student questions, voice barge-in interruptions, epistemic contextual grounding,
 * and reliable lesson resumption during guided learning.
 */

import type { LearningLevel } from "../academy/types";
import { StudentQuestionContextManager } from "./StudentQuestionContext";
import { converseWithCosmos, askCosmosQuestion } from "./cosmos.functions";
import type {
  ConversationalTurnContext,
  CosmosAnswer,
  CosmosDiscussionTurn,
  CosmosVisualizationReference,
  NarrationSegment,
  StudentQuestionContext,
} from "./cosmos-types";
import type { LearningStep } from "./learning-director-types";

export class CosmosConversationManager {
  private static instance: CosmosConversationManager | null = null;

  private discussionHistory: CosmosDiscussionTurn[] = [];
  private lastAnswer: CosmosAnswer | null = null;
  private isProcessing = false;

  public static getInstance(): CosmosConversationManager {
    if (!this.instance) {
      this.instance = new CosmosConversationManager();
    }
    return this.instance;
  }

  /**
   * Clears discussion history when switching modules.
   */
  public resetHistory(): void {
    this.discussionHistory = [];
    this.lastAnswer = null;
    this.isProcessing = false;
  }

  public getHistory(): CosmosDiscussionTurn[] {
    return [...this.discussionHistory];
  }

  public getLastAnswer(): CosmosAnswer | null {
    return this.lastAnswer;
  }

  /**
   * Handles a student question (voice or typed) during an active guided lesson step.
   */
  public async handleStudentQuestion(params: {
    question: string;
    moduleId: string;
    moduleTitle: string;
    sublessonId?: string;
    sublessonTitle?: string;
    learningLevel: LearningLevel;
    currentStep: LearningStep | null;
    interruptedSegment?: NarrationSegment | null;
    currentVisualization?: CosmosVisualizationReference;
  }): Promise<CosmosAnswer> {
    const {
      question,
      moduleId,
      sublessonId,
      learningLevel,
      currentStep,
      interruptedSegment,
      currentVisualization,
    } = params;

    const trimmed = (question || "").trim();
    if (!trimmed) {
      throw new Error("Student question cannot be empty.");
    }

    this.isProcessing = true;

    // Record student turn
    this.discussionHistory.push({
      role: "student",
      content: trimmed,
      timestamp: Date.now(),
    });

    try {
      // Build authoritative epistemic context
      const baseContext = StudentQuestionContextManager.buildContext({
        moduleId,
        sublessonId: sublessonId || currentStep?.lessonId,
        learningLevel,
        currentVisualization,
      });

      // Augment with discussion history
      const fullContext: ConversationalTurnContext = {
        ...baseContext,
        discussionHistory: [...this.discussionHistory],
        interruptedSegment: interruptedSegment || undefined,
        currentDisplayText: interruptedSegment
          ? `[Interrupted Narration Segment]: "${interruptedSegment.displayText}"\n\n[Current Section]: ${baseContext.currentDisplayText}`
          : baseContext.currentDisplayText,
      };

      // Call server-side grounded model or fallback
      const answer: CosmosAnswer = await converseWithCosmos({
        data: {
          question: trimmed,
          context: fullContext,
        },
      });

      this.lastAnswer = answer;

      // Record COSMOS response turn
      this.discussionHistory.push({
        role: "cosmos",
        content: answer.answerText,
        timestamp: Date.now(),
        epistemicStatus: answer.epistemicClassification,
      });

      return answer;
    } catch (err: any) {
      console.warn("Could not resolve question through converseWithCosmos, using fallback:", err);

      // Safe client-side fallback
      const fallbackContext: StudentQuestionContext = StudentQuestionContextManager.buildContext({
        moduleId,
        sublessonId: sublessonId || currentStep?.lessonId,
        learningLevel,
        currentVisualization,
      });

      try {
        const answer = await askCosmosQuestion({
          data: {
            question: trimmed,
            context: fallbackContext,
          },
        });
        this.lastAnswer = answer;
        this.discussionHistory.push({
          role: "cosmos",
          content: answer.answerText,
          timestamp: Date.now(),
          epistemicStatus: answer.epistemicClassification,
        });
        return answer;
      } catch (innerErr) {
        const safeErrorAnswer: CosmosAnswer = {
          answerText:
            "I'm listening and examining our current astronomical lesson. Could you please rephrase your question, or should we resume our exploration?",
          epistemicClassification: "fact",
          learningLevelAdapted: learningLevel,
        };
        this.lastAnswer = safeErrorAnswer;
        return safeErrorAnswer;
      }
    } finally {
      this.isProcessing = false;
    }
  }
}
