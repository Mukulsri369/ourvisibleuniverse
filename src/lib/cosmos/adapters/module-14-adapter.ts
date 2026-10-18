/**
 * COSMOS Module 14 Adapter: Extreme Gravity (Black Holes & Compact Objects)
 * Project: Our Visible Universe Academy
 * Scope: Prompt 12 Module 14 Specific Epistemic Binding
 */

import type { LearningLevel } from "../../academy/types";
import { LessonContentProvider } from "../LessonContentProvider";
import { StudentQuestionContextManager } from "../StudentQuestionContext";
import { NarrationController } from "../NarrationController";
import { VoiceConversationController } from "../VoiceConversationController";
import type { CosmosLanguage, NarrationSegment, StudentQuestionContext } from "../cosmos-types";

export class Module14CosmosAdapter {
  public static readonly MODULE_ID = "14";

  /**
   * Retrieves all verified narration segments for Module 14.
   */
  public static getSegments(
    level: LearningLevel,
    language: CosmosLanguage = "en",
  ): NarrationSegment[] {
    return LessonContentProvider.getSegmentsForModule(this.MODULE_ID, level, language);
  }

  /**
   * Builds the full epistemic question context for Module 14.
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
   * preloaded with Module 14 content.
   */
  public static createOrchestrator(level: LearningLevel, language: CosmosLanguage = "en") {
    const segments = this.getSegments(level, language);
    const narrationController = new NarrationController(segments);
    const voiceConversationController = new VoiceConversationController(narrationController);

    return {
      narrationController,
      voiceConversationController,
      segments,
      blackHolePresets: LessonContentProvider.getModule14BlackHolePresets(),
    };
  }
}
