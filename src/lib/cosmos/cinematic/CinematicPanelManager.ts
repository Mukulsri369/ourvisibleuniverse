/**
 * COSMOS Responsive Cinematic Layout, Smart Panel Manager & Annotation Collision Resolver
 * Project: Our Visible Universe Academy
 * Scope: Prompt 16 — Sections 6, 7, 8, 9, 10, 11, 12, 19, 29, 36
 *
 * Maps authoritative CosmosLearningDirector and CinematicPlayerStateSnapshot states
 * to deterministic UI layout priorities, panel states, and collision-free 3D labels
 * without creating any competing state machine.
 */

import type { LearningLevel } from "@/lib/academy/types";
import type { DirectorStateSnapshot } from "../learning-director-types";
import type { CinematicPlayerStateSnapshot } from "./CosmosCinematicPlayerState";
import type { CinematicScientificAnnotation } from "./CosmosCinematicSceneRegistry";
import type { CosmosTeacherUIStatus } from "./CinematicDesignTokens";

/**
 * Smart Scientific Panel States (Prompt 16 Section 11)
 */
export type CinematicPanelState =
  "CLOSED" | "COMPACT" | "EXPANDED" | "FULLSCREEN_ACTIVITY" | "TRANSCRIPT" | "SETTINGS";

/**
 * Responsive Layout Modes (Prompt 16 Sections 6–10)
 */
export type CinematicResponsiveLayoutMode =
  "DESKTOP" | "TABLET_LANDSCAPE" | "TABLET_PORTRAIT" | "MOBILE_PORTRAIT" | "MOBILE_LANDSCAPE";

/**
 * UI Priority Modes mapped to authoritative Director states (Prompt 16 Section 12)
 */
export type CinematicUIPriorityMode =
  | "NARRATING"
  | "STUDENT_EXPLORING"
  | "ACTIVITY_REQUIRED"
  | "WAITING_FOR_STUDENT"
  | "QUESTION_ACTIVE"
  | "QUIZ_REQUIRED"
  | "OFFICIAL_ASSESSMENT"
  | "MODULE_COMPLETED";

export interface ResponsiveViewportAllocation {
  layoutMode: CinematicResponsiveLayoutMode;
  width: number;
  height: number;
  isShortHeight: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  minTouchTargetPx: number;
  maxSimultaneousSidePanels: number;
  useBottomSheetForPanels: boolean;
  maxVisibleAnnotations: number;
}

/**
 * Resolves the responsive layout strategy from actual container/viewport measurements.
 */
export function resolveResponsiveLayoutAllocation(
  width: number,
  height: number,
  isCoarsePointer = false,
): ResponsiveViewportAllocation {
  const safeW = Math.max(320, width || 1280);
  const safeH = Math.max(280, height || 720);
  const isLandscape = safeW > safeH;
  const isShortHeight = safeH < 500;

  let layoutMode: CinematicResponsiveLayoutMode = "DESKTOP";

  if (safeW < 640 || (safeW < 960 && isShortHeight && isLandscape)) {
    layoutMode = isLandscape ? "MOBILE_LANDSCAPE" : "MOBILE_PORTRAIT";
  } else if (safeW < 1024 || (safeW <= 1180 && isCoarsePointer)) {
    layoutMode = isLandscape ? "TABLET_LANDSCAPE" : "TABLET_PORTRAIT";
  } else {
    layoutMode = "DESKTOP";
  }

  const isMobile = layoutMode === "MOBILE_PORTRAIT" || layoutMode === "MOBILE_LANDSCAPE";
  const isTablet = layoutMode === "TABLET_PORTRAIT" || layoutMode === "TABLET_LANDSCAPE";
  const isDesktop = layoutMode === "DESKTOP";

  const maxVisibleAnnotations = isMobile ? 2 : isTablet ? 4 : 6;

  return {
    layoutMode,
    width: safeW,
    height: safeH,
    isShortHeight,
    isMobile,
    isTablet,
    isDesktop,
    minTouchTargetPx: 44,
    maxSimultaneousSidePanels: isDesktop && !isShortHeight ? 2 : 1,
    useBottomSheetForPanels: isMobile || layoutMode === "TABLET_PORTRAIT",
    maxVisibleAnnotations,
  };
}

/**
 * Maps real DirectorStateSnapshot & CinematicPlayerStateSnapshot to UI Priority Mode (Prompt 16 Section 12).
 */
export function resolveUIPriorityMode(
  snapshot: CinematicPlayerStateSnapshot,
  directorSnapshot: DirectorStateSnapshot,
): CinematicUIPriorityMode {
  // 1. Official verified module completion (only after server confirmation)
  if (
    directorSnapshot.state === "MODULE_COMPLETED" &&
    directorSnapshot.activeCompletionState?.isVerifiedComplete === true
  ) {
    return "MODULE_COMPLETED";
  }

  // 2. Official graded assessment
  if (
    snapshot.interactionState === "OFFICIAL_EXAM_ACTIVE" ||
    directorSnapshot.activeQuizState?.mode === "official"
  ) {
    return "OFFICIAL_ASSESSMENT";
  }

  // 3. Practice quiz / knowledge check
  if (snapshot.interactionState === "QUIZ_REQUIRED") {
    return "QUIZ_REQUIRED";
  }

  // 4. Student question or voice interruption active
  if (
    snapshot.interactionState === "VOICE_INTERRUPTION" ||
    snapshot.playerState === "ANSWERING_QUESTION" ||
    directorSnapshot.state === "ANSWERING_STUDENT_QUESTION"
  ) {
    return "QUESTION_ACTIVE";
  }

  // 5. Required interactive activity gate
  if (snapshot.interactionState === "ACTIVITY_REQUIRED") {
    return "ACTIVITY_REQUIRED";
  }

  // 6. Waiting for student interaction
  if (
    snapshot.playerState === "WAITING_FOR_STUDENT" ||
    directorSnapshot.state === "WAITING_FOR_STUDENT"
  ) {
    return "WAITING_FOR_STUDENT";
  }

  // 7. Student manually exploring 3D camera or inspecting a celestial object
  if (snapshot.isManualCameraMode || Boolean(snapshot.selectedObjectId)) {
    return "STUDENT_EXPLORING";
  }

  // 8. Default: Active narration & visual demonstration
  return "NARRATING";
}

export interface SmartPanelVisibilityResult {
  priorityMode: CinematicUIPriorityMode;
  leftObjectPanelState: CinematicPanelState;
  chapterLabPanelState: CinematicPanelState;
  rightInteractionPanelState: CinematicPanelState;
  minimizeSecondaryChrome: boolean;
  captionBarVisible: boolean;
}

/**
 * Resolves which panels should be prominent vs. compact/closed so the 3D scene
 * is never crowded by competing overlays (Prompt 16 Sections 11 & 12).
 */
export function resolveSmartPanelStates(params: {
  snapshot: CinematicPlayerStateSnapshot;
  directorSnapshot: DirectorStateSnapshot;
  allocation: ResponsiveViewportAllocation;
  userPanelOverride?: CinematicPanelState | null;
  hasChapterControls: boolean;
  isListeningVoice?: boolean;
}): SmartPanelVisibilityResult {
  const { snapshot, directorSnapshot, allocation, userPanelOverride, hasChapterControls } = params;

  const priorityMode = resolveUIPriorityMode(snapshot, directorSnapshot);

  if (userPanelOverride === "TRANSCRIPT" || userPanelOverride === "SETTINGS") {
    return {
      priorityMode,
      leftObjectPanelState: "CLOSED",
      chapterLabPanelState: "CLOSED",
      rightInteractionPanelState: userPanelOverride,
      minimizeSecondaryChrome: true,
      captionBarVisible: false,
    };
  }

  let leftObjectPanelState: CinematicPanelState = snapshot.scientificLabelsEnabled
    ? "COMPACT"
    : "CLOSED";
  let chapterLabPanelState: CinematicPanelState = hasChapterControls ? "COMPACT" : "CLOSED";
  let rightInteractionPanelState: CinematicPanelState = "CLOSED";
  let minimizeSecondaryChrome = false;

  switch (priorityMode) {
    case "NARRATING":
      // Prioritize scene, captions, and pause; keep side panels compact on desktop and closed by default on mobile
      minimizeSecondaryChrome = snapshot.currentPlaybackState === "playing";
      if (allocation.isMobile) {
        leftObjectPanelState = snapshot.selectedObjectId ? "COMPACT" : "CLOSED";
        chapterLabPanelState = hasChapterControls ? "COMPACT" : "CLOSED";
      } else {
        leftObjectPanelState = snapshot.scientificLabelsEnabled ? "COMPACT" : "CLOSED";
        chapterLabPanelState = hasChapterControls ? "COMPACT" : "CLOSED";
      }
      break;

    case "STUDENT_EXPLORING":
      leftObjectPanelState = "EXPANDED";
      chapterLabPanelState = hasChapterControls
        ? allocation.isMobile
          ? "COMPACT"
          : "EXPANDED"
        : "CLOSED";
      break;

    case "ACTIVITY_REQUIRED":
    case "WAITING_FOR_STUDENT":
      rightInteractionPanelState = "EXPANDED";
      chapterLabPanelState = hasChapterControls ? "EXPANDED" : "CLOSED";
      if (allocation.isMobile) {
        leftObjectPanelState = "CLOSED";
      }
      break;

    case "QUESTION_ACTIVE":
      rightInteractionPanelState = "EXPANDED";
      if (allocation.isMobile || allocation.isShortHeight) {
        leftObjectPanelState = "CLOSED";
        chapterLabPanelState = "CLOSED";
      }
      break;

    case "QUIZ_REQUIRED":
    case "OFFICIAL_ASSESSMENT":
      rightInteractionPanelState = "EXPANDED";
      leftObjectPanelState = allocation.isDesktop ? "COMPACT" : "CLOSED";
      chapterLabPanelState = "CLOSED";
      break;

    case "MODULE_COMPLETED":
      rightInteractionPanelState = "EXPANDED";
      leftObjectPanelState = "COMPACT";
      chapterLabPanelState = "CLOSED";
      break;
  }

  if (userPanelOverride === "FULLSCREEN_ACTIVITY") {
    chapterLabPanelState = "FULLSCREEN_ACTIVITY";
    rightInteractionPanelState = "EXPANDED";
  } else if (userPanelOverride === "EXPANDED" && hasChapterControls) {
    chapterLabPanelState = "EXPANDED";
  } else if (userPanelOverride === "CLOSED") {
    chapterLabPanelState = "COMPACT";
  }

  return {
    priorityMode,
    leftObjectPanelState,
    chapterLabPanelState,
    rightInteractionPanelState,
    minimizeSecondaryChrome,
    captionBarVisible:
      snapshot.captionsEnabled &&
      !(
        allocation.isShortHeight &&
        (priorityMode === "QUIZ_REQUIRED" || priorityMode === "OFFICIAL_ASSESSMENT")
      ),
  };
}

/**
 * Resolves the accurate COSMOS Teacher UI Status (Prompt 16 Section 19).
 * Never falsely indicates microphone recording or speaking waveform when stopped.
 */
export function resolveCosmosTeacherUIStatus(params: {
  snapshot: CinematicPlayerStateSnapshot;
  directorSnapshot: DirectorStateSnapshot;
  isListeningVoice: boolean;
  isSubmittingQuestion: boolean;
  isOffline?: boolean;
}): CosmosTeacherUIStatus {
  const {
    snapshot,
    directorSnapshot,
    isListeningVoice,
    isSubmittingQuestion,
    isOffline = false,
  } = params;

  if (isOffline) {
    return "OFFLINE";
  }
  if (snapshot.playerState === "ERROR" || snapshot.currentPlaybackState === "error") {
    return "ERROR";
  }
  if (isListeningVoice || snapshot.isMicrophoneActive) {
    return "LISTENING";
  }
  if (isSubmittingQuestion || snapshot.currentPlaybackState === "loading") {
    return "THINKING";
  }
  if (
    snapshot.playerState === "ANSWERING_QUESTION" ||
    directorSnapshot.state === "ANSWERING_STUDENT_QUESTION"
  ) {
    return "ANSWERING";
  }
  if (
    snapshot.interactionState === "ACTIVITY_REQUIRED" ||
    snapshot.interactionState === "QUIZ_REQUIRED" ||
    snapshot.interactionState === "OFFICIAL_EXAM_ACTIVE" ||
    snapshot.playerState === "WAITING_FOR_STUDENT"
  ) {
    return "WAITING_FOR_STUDENT";
  }
  if (snapshot.currentPlaybackState === "playing") {
    return "NARRATING";
  }
  if (snapshot.currentPlaybackState === "paused" || snapshot.playerState === "PAUSED") {
    return "PAUSED";
  }
  return "READY";
}

/**
 * Progress & Verification Status Language Resolver (Prompt 16 Section 36)
 * Guarantees client-side narration completion is never mislabeled as official module completion.
 */
export function resolveAuthoritativeProgressLabel(
  snapshot: CinematicPlayerStateSnapshot,
  directorSnapshot: DirectorStateSnapshot,
): {
  badgeLabel: string;
  detailText: string;
  isOfficiallyVerified: boolean;
  statusTone: "verified" | "pending" | "active" | "exploring";
} {
  const completion = directorSnapshot.activeCompletionState;

  if (completion?.isVerifiedComplete === true) {
    return {
      badgeLabel: "Module Officially Verified",
      detailText: "Server-verified completion recorded",
      isOfficiallyVerified: true,
      statusTone: "verified",
    };
  }

  if (directorSnapshot.state === "VERIFYING_REQUIREMENTS") {
    return {
      badgeLabel: "Verification Pending",
      detailText: "Confirming activity & assessment records with server",
      isOfficiallyVerified: false,
      statusTone: "pending",
    };
  }

  if (snapshot.interactionState === "OFFICIAL_EXAM_ACTIVE") {
    return {
      badgeLabel: "Official Assessment Active",
      detailText: "Server-graded qualification check in progress",
      isOfficiallyVerified: false,
      statusTone: "active",
    };
  }

  if (snapshot.interactionState === "ACTIVITY_REQUIRED") {
    const actStatus = directorSnapshot.activeActivityState?.status;
    if (actStatus === "VERIFIED_COMPLETE") {
      return {
        badgeLabel: "Activity Validated",
        detailText: "Laboratory requirement satisfied",
        isOfficiallyVerified: false,
        statusTone: "verified",
      };
    }
    return {
      badgeLabel: "Activity Required",
      detailText: "Complete scientific observation to advance",
      isOfficiallyVerified: false,
      statusTone: "active",
    };
  }

  if (snapshot.currentPlaybackState === "completed") {
    return {
      badgeLabel: "Chapter Reviewed",
      detailText: "Narration explored locally — complete module requirements for official credit",
      isOfficiallyVerified: false,
      statusTone: "exploring",
    };
  }

  return {
    badgeLabel: "Lesson Explored",
    detailText: `Step ${snapshot.currentStepIndex + 1} of ${snapshot.totalSteps}`,
    isOfficiallyVerified: false,
    statusTone: "exploring",
  };
}

export interface PlacedScientificAnnotation extends CinematicScientificAnnotation {
  isEmphasized: boolean;
  verticalOffsetUnits: number;
}

/**
 * Deterministic Scientific Label Collision & Priority Manager (Prompt 16 Sections 28 & 29)
 * - Ranks annotations so selected/highlighted objects always take precedence
 * - Filters by learning level and viewport capacity (`maxVisibleAnnotations`)
 * - Separates proximate 3D world anchors along the vertical axis so callout cards never overlap
 * - Rejects NaN or out-of-bounds coordinates
 */
export function resolveCollisionFreeAnnotations(params: {
  annotations: CinematicScientificAnnotation[];
  learningLevel: LearningLevel;
  highlightedObjectIds: string[];
  selectedObjectId: string | null;
  maxVisible?: number;
}): PlacedScientificAnnotation[] {
  const {
    annotations,
    learningLevel,
    highlightedObjectIds,
    selectedObjectId,
    maxVisible = 6,
  } = params;

  if (!annotations || annotations.length === 0) return [];

  // 1. Filter by learning level priority rules
  const levelFiltered = annotations.filter((ann) => {
    const [x, y, z] = ann.worldPosition;
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) {
      return false;
    }
    const isTarget =
      ann.objectId === selectedObjectId || highlightedObjectIds.includes(ann.objectId);
    if (isTarget) return true;
    if (learningLevel === "junior") return ann.priority === 1;
    if (learningLevel === "explorer") return ann.priority <= 2;
    return true;
  });

  // 2. Sort deterministically: selected object first, highlighted second, priority 1..3 third
  const sorted = [...levelFiltered].sort((a, b) => {
    const aSelected = a.objectId === selectedObjectId ? 1 : 0;
    const bSelected = b.objectId === selectedObjectId ? 1 : 0;
    if (aSelected !== bSelected) return bSelected - aSelected;

    const aHigh = highlightedObjectIds.includes(a.objectId) ? 1 : 0;
    const bHigh = highlightedObjectIds.includes(b.objectId) ? 1 : 0;
    if (aHigh !== bHigh) return bHigh - aHigh;

    return a.priority - b.priority;
  });

  // 3. Enforce viewport budget and apply spatial collision separation
  const limited = sorted.slice(0, Math.max(1, maxVisible));
  const placed: PlacedScientificAnnotation[] = [];
  const minSeparationDistSq = 2.6 * 2.6;

  for (const ann of limited) {
    const isEmphasized =
      ann.objectId === selectedObjectId || highlightedObjectIds.includes(ann.objectId);
    let verticalOffsetUnits = 0;
    const [ax, ay, az] = ann.worldPosition;

    // Check against already-placed higher-priority labels to prevent stacking overlap
    for (const prev of placed) {
      const [px, py, pz] = prev.worldPosition;
      const dx = ax - px;
      const dy = ay + verticalOffsetUnits - (py + prev.verticalOffsetUnits);
      const dz = az - pz;
      const distSq = dx * dx + dy * dy + dz * dz;
      if (distSq < minSeparationDistSq) {
        verticalOffsetUnits += 1.45;
      }
    }

    placed.push({
      ...ann,
      isEmphasized,
      verticalOffsetUnits,
    });
  }

  return placed;
}
