/**
 * COSMOS AI Astronomy Teaching Companion — Public Barrel
 * Project: Our Visible Universe Academy
 * Scope: Prompt 12 Architecture Layer
 */

export * from "./cosmos-types";
export * from "./phonetics";
export * from "./LessonContentProvider";
export * from "./NarrationCursorManager";
export * from "./LearningPreferenceManager";
export * from "./StudentQuestionContext";
export * from "./VisualizationActionController";
export * from "./AudioCacheManager";
export * from "./NarrationController";
export * from "./VoiceConversationController";
export * from "./VoiceActivityDetector";
export * from "./VoiceCommandProcessor";
export * from "./LiveSessionManager";
export * from "./cosmos.functions";

// Module adapters
export { Module01CosmosAdapter } from "./adapters/module-01-adapter";
export { Module14CosmosAdapter } from "./adapters/module-14-adapter";
export { UniversalCosmosAdapter } from "./adapters/universal-adapter";
