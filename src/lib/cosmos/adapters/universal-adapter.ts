/**
 * COSMOS Universal Module Adapter
 * Project: Our Visible Universe Academy
 * Scope: Prompt 12 Reusable Adapters for All 24 Modules
 */

import type { LearningLevel } from "../../academy/types";
import { LessonContentProvider } from "../LessonContentProvider";
import { StudentQuestionContextManager } from "../StudentQuestionContext";
import { NarrationController } from "../NarrationController";
import { VoiceConversationController } from "../VoiceConversationController";
import type {
  CosmosLanguage,
  CosmosVisualizationReference,
  NarrationSegment,
  StudentQuestionContext,
} from "../cosmos-types";

export class UniversalCosmosAdapter {
  /**
   * Retrieves all verified narration segments for any module (01 through 24).
   */
  public static getSegments(
    moduleId: string,
    level: LearningLevel,
    language: CosmosLanguage = "en",
  ): NarrationSegment[] {
    return LessonContentProvider.getSegmentsForModule(moduleId, level, language);
  }

  /**
   * Builds an authoritative question context for any module.
   */
  public static buildContext(params: {
    moduleId: string;
    sublessonId?: string;
    learningLevel: LearningLevel;
    activeTextOverride?: string;
    currentVisualization?: CosmosVisualizationReference;
    activeExamAttempt?: boolean;
  }): StudentQuestionContext {
    return StudentQuestionContextManager.buildContext(params);
  }

  /**
   * Instantiates an active COSMOS orchestrator pre-wired for any target module.
   */
  public static createOrchestrator(
    moduleId: string,
    level: LearningLevel,
    language: CosmosLanguage = "en",
  ) {
    const segments = this.getSegments(moduleId, level, language);
    const narrationController = new NarrationController(segments);
    const voiceConversationController = new VoiceConversationController(narrationController);

    return {
      moduleId,
      level,
      language,
      narrationController,
      voiceConversationController,
      segments,
      moduleMetadata: LessonContentProvider.getModuleMetadata(moduleId),
    };
  }

  /**
   * Returns list of all 24 supported modules.
   */
  public static getSupportedModuleList(): string[] {
    return LessonContentProvider.getAllSupportedModules();
  }
}
