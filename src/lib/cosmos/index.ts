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

export * from "./Cosmos3DAdapter";
export * from "./Cosmos3DTools";

// COSMOS 2.0 Phase 1 & Phase 2 Learning Director, Activity Guide & Quiz Guide
export * from "./learning-director-types";
export * from "./CosmosLearningDirector";
export * from "./CosmosAttentionController";
export * from "./CosmosLessonNavigator";
export * from "./CosmosInputCoordinator";
export * from "./CosmosConversationManager";
export * from "./CosmosLearningSessionManager";
export * from "./CosmosStepSequenceGenerator";
export * from "./CosmosActivityAdapter";
export * from "./CosmosActivityGuide";
export * from "./CosmosQuizGuide";

// Module adapters
export { Module01CosmosAdapter } from "./adapters/module-01-adapter";
export { Module14CosmosAdapter } from "./adapters/module-14-adapter";
export { UniversalCosmosAdapter } from "./adapters/universal-adapter";

// Prompt 16 Cinematic Design System & Responsive Panel Manager
export * from "./cinematic/CinematicDesignTokens";
export * from "./cinematic/CinematicPanelManager";
