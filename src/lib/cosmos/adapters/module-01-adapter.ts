/**
 * COSMOS Module 01 Adapter: Our Place in the Universe
 * Project: Our Visible Universe Academy
 * Scope: Prompt 12 Module 01 Specific Epistemic Binding
 */

import type { LearningLevel } from "../../academy/types";
import { LessonContentProvider } from "../LessonContentProvider";
import { StudentQuestionContextManager } from "../StudentQuestionContext";
import { NarrationController } from "../NarrationController";
import { VoiceConversationController } from "../VoiceConversationController";
import type { CosmosLanguage, NarrationSegment, StudentQuestionContext } from "../cosmos-types";

export class Module01CosmosAdapter {
  public static readonly MODULE_ID = "01";

  /**
   * Retrieves all verified narration segments for Module 01.
   */
  public static getSegments(level: LearningLevel, language: CosmosLanguage = "en"): NarrationSegment[] {
    return LessonContentProvider.getSegmentsForModule(this.MODULE_ID, level, language);
  }

  /**
   * Builds the full epistemic question context for Module 01.
   */
  public static buildContext(params: {
    sublessonId?: string;
    learningLevel: LearningLevel;
    activeTextOverride?: string;
  }): StudentQuestionContext {
    return StudentQuestionContextManager.buildContext({
      moduleId: this.MODULE_ID,
      sublessonId: params.sublessonId,
      learningLevel: params.learningLevel,
      activeTextOverride: params.activeTextOverride,
    });
  }

  /**
   * Creates an active orchestration pair (NarrationController + VoiceConversationController)
   * preloaded with Module 01 content.
   */
  public static createOrchestrator(level: LearningLevel, language: CosmosLanguage = "en") {
    const segments = this.getSegments(level, language);
    const narrationController = new NarrationController(segments);
    const voiceConversationController = new VoiceConversationController(narrationController);

    return {
      narrationController,
      voiceConversationController,
      segments,
    };
  }
}
