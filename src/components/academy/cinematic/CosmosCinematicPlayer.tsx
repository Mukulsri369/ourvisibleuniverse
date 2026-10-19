/**
 * COSMOS Fullscreen Cinematic Learning Player & Reusable Launcher
 * Project: Our Visible Universe Academy
 * Scope: Prompt 03 — Complete Production Fullscreen Cinematic Learning Player
 *
 * Connects:
 * - CosmosCinematicSessionBridge (Single authoritative connection to CosmosLearningDirector & NarrationController)
 * - CosmosCinematicViewport (Native Fullscreen API + 100dvh safe-area fallback)
 * - CosmosCinematicSceneHost (Three.js / R3F 3D scene host + camera rig + annotations)
 * - CosmosCinematicOverlay (Top bar, object inspector, activity gate, quiz overlay, Q&A response)
 * - CosmosCinematicCaptions (Synchronized NarrationSegment captions & terminology highlights)
 * - CosmosCinematicControls (Transport, Mic, Ask COSMOS, CC, Labels, Camera, Speed, Quality, Exit)
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Film, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LearningLevel } from "@/lib/academy/types";
import { CosmosLearningDirector } from "@/lib/cosmos/CosmosLearningDirector";
import { LessonContentProvider } from "@/lib/cosmos/LessonContentProvider";
import { CosmosCinematicSessionBridge } from "@/lib/cosmos/cinematic/CosmosCinematicSessionBridge";
import { CosmosAnimationCueController } from "@/lib/cosmos/cinematic/CosmosAnimationCueController";
import { CosmosCinematicQualityManager } from "@/lib/cosmos/cinematic/CosmosCinematicQualityManager";
import type {
  CinematicCameraCommand,
  CinematicPlayerStateSnapshot,
} from "@/lib/cosmos/cinematic/CosmosCinematicPlayerState";
import type { DirectorStateSnapshot } from "@/lib/cosmos/learning-director-types";
import type { CinematicQualityTier } from "@/lib/cosmos/cinematic-storyboard-types";
import { CosmosCinematicViewport } from "./CosmosCinematicViewport";
import { CosmosCinematicSceneHost } from "./CosmosCinematicSceneHost";
import { CosmosCinematicOverlay } from "./CosmosCinematicOverlay";
import { CosmosCinematicCaptions } from "./CosmosCinematicCaptions";
import { CosmosCinematicControls } from "./CosmosCinematicControls";

export interface EnterCinematicModeButtonProps {
  moduleId: string;
  moduleTitle: string;
  learningLevel: LearningLevel;
  sublessonId?: string;
  variant?: "primary" | "compact";
  className?: string;
}

/**
 * Distinct "ENTER CINEMATIC MODE" button available across all 24 Cosmic Journey modules.
 * Must be triggered by a direct student click so browser `requestFullscreen()` is authorized.
 */
export function EnterCinematicModeButton({
  moduleId,
  moduleTitle,
  learningLevel,
  sublessonId,
  variant = "primary",
  className = "",
}: EnterCinematicModeButtonProps) {
  const handleEnterCinematic = async () => {
    const bridge = CosmosCinematicSessionBridge.getInstance();
    await bridge.enterCinematicMode({
      moduleId,
      moduleTitle,
      learningLevel,
      sublessonId,
    });
  };

  if (variant === "compact") {
    return (
      <Button
        type="button"
        size="sm"
        onClick={() => void handleEnterCinematic()}
        data-testid="enter-cinematic-mode-compact-btn"
        aria-label="Enter Cinematic Mode"
        className={`bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs px-3 h-8 border border-cyan-300/40 shadow-md ${className}`}
      >
        <Film className="size-3.5 mr-1.5" />
        <span>ENTER CINEMATIC MODE</span>
      </Button>
    );
  }

  return (
    <Button
      type="button"
      size="sm"
      onClick={() => void handleEnterCinematic()}
      data-testid="enter-cinematic-mode-btn"
      aria-label={`Enter Fullscreen Cinematic Learning Mode for Module ${moduleId}: ${moduleTitle}`}
      className={`bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:via-sky-400 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm px-4 py-2 h-auto border border-cyan-300/40 shadow-lg shadow-cyan-950/50 flex items-center gap-2 ${className}`}
    >
      <Film className="size-4 text-cyan-100" />
      <span>ENTER CINEMATIC MODE</span>
      <Sparkles className="size-3.5 text-amber-300" />
    </Button>
  );
}

interface CosmosCinematicPlayerProps {
  reducedMotion?: boolean;
}

export function CosmosCinematicPlayer({ reducedMotion = false }: CosmosCinematicPlayerProps) {
  const bridge = CosmosCinematicSessionBridge.getInstance();
  const director = CosmosLearningDirector.getInstance();
  const cueController = CosmosAnimationCueController.getInstance();
  const qualityManager = CosmosCinematicQualityManager.getInstance();

  const viewportRef = useRef<HTMLDivElement | null>(null);

  const [snapshot, setSnapshot] = useState<CinematicPlayerStateSnapshot>(() =>
    bridge.getStateManager().getSnapshot(),
  );
  const [directorSnapshot, setDirectorSnapshot] = useState<DirectorStateSnapshot>(() =>
    director.getSnapshot(),
  );
  const [activeCue, setActiveCue] = useState(() => cueController.getState().activeCue);
  const [latestCameraCommand, setLatestCameraCommand] = useState<CinematicCameraCommand | null>(
    () => cueController.getState().lastCameraCommand,
  );

  // Subscribe to authoritative bridge, director, and cue updates
  useEffect(() => {
    const unsubBridge = bridge.subscribe((nextSnap) => {
      setSnapshot(nextSnap);
    });
    const unsubDirector = director.subscribe((nextDir) => {
      setDirectorSnapshot({ ...nextDir });
    });
    const unsubCue = cueController.subscribe((cueState) => {
      setActiveCue(cueState.activeCue);
      if (cueState.lastCameraCommand) {
        setLatestCameraCommand(cueState.lastCameraCommand);
      }
    });
    const unsubCam = bridge.subscribeCameraCommands((cmd) => {
      setLatestCameraCommand(cmd);
    });

    return () => {
      unsubBridge();
      unsubDirector();
      unsubCue();
      unsubCam();
    };
  }, [bridge, director, cueController]);

  // When the player transitions to ENTERING_FULLSCREEN or READY after clicking ENTER CINEMATIC MODE,
  // request native browser fullscreen on the mounted viewportRef if not already in native fullscreen
  useEffect(() => {
    if (
      snapshot.playerState !== "CLOSED" &&
      snapshot.fullscreenState === "REQUESTING_NATIVE" &&
      viewportRef.current
    ) {
      void bridge.requestBrowserFullscreen(viewportRef.current);
    }
  }, [snapshot.playerState, snapshot.fullscreenState, bridge]);

  const handleSceneError = useCallback(
    (
      code: "WEBGL_UNSUPPORTED" | "WEBGL_CONTEXT_LOST" | "SCENE_LOAD_FAILED",
      msg: string,
    ) => {
      bridge.getStateManager().recordError(code, msg, {
        recoverable: code !== "WEBGL_UNSUPPORTED",
        fallbackAvailable: true,
        enterErrorState: false,
      });
    },
    [bridge],
  );

  const handleClearError = useCallback(() => {
    bridge.getStateManager().clearError();
  }, [bridge]);

  if (snapshot.playerState === "CLOSED") {
    return null;
  }

  const scene = bridge.getActiveSceneDescriptor();
  const allSegments = LessonContentProvider.getSegmentsForModule(
    snapshot.currentModuleId,
    snapshot.currentLearningLevel,
    snapshot.language,
  );

  const handleRequestNativeFullscreen = () => {
    if (viewportRef.current) {
      void bridge.requestBrowserFullscreen(viewportRef.current);
    }
  };

  const handleSelectObject = (objectId: string | null) => {
    bridge.getStateManager().updateState({ selectedObjectId: objectId });
    if (objectId) {
      bridge.dispatchCameraCommand({
        action: "FOCUS_OBJECT",
        targetObjectId: objectId,
        durationMs: 900,
      });
    } else {
      bridge.dispatchCameraCommand({
        action: "RESTORE_CAMERA",
        durationMs: 800,
      });
    }
  };

  const handleOpenRealActivityInLesson = async () => {
    await bridge.exitCinematicMode();
    if (typeof document !== "undefined") {
      const targetId = directorSnapshot.currentStep?.targetComponentId;
      const el =
        (targetId && document.getElementById(targetId)) ||
        document.querySelector('[role="region"][aria-label="Module Knowledge Assessment"]') ||
        document.querySelector("[data-cosmos-section], section");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  return (
    <CosmosCinematicViewport
      snapshot={snapshot}
      onExitCinematicMode={() => void bridge.exitCinematicMode()}
      viewportRef={viewportRef}
    >
      {/* LAYER 1 (z-0): Full-Viewport 3D Scientific Visualization Scene Host */}
      <div className="absolute inset-0 z-0">
        <CosmosCinematicSceneHost
          snapshot={snapshot}
          scene={scene}
          activeCue={activeCue}
          latestCameraCommand={latestCameraCommand}
          reducedMotion={reducedMotion}
          onSelectObject={(id) => handleSelectObject(id)}
          onEnableManualCamera={() => bridge.setManualCameraMode(true)}
          onSceneError={handleSceneError}
          onClearError={handleClearError}
          onExitCinematicMode={() => void bridge.exitCinematicMode()}
        />
      </div>

      {/* LAYER 2 (z-10): Translucent Observatory HUD, Scientific Annotations, Activity & Quiz Overlays */}
      <div className="relative z-10 flex flex-col justify-between w-full h-full pointer-events-none">
        <CosmosCinematicOverlay
          snapshot={snapshot}
          directorSnapshot={directorSnapshot}
          scene={scene}
          onExitCinematicMode={() => void bridge.exitCinematicMode()}
          onRequestNativeFullscreen={handleRequestNativeFullscreen}
          onSelectObject={handleSelectObject}
          onResumeAfterQuestion={() => void bridge.resumeAfterQuestionInCinematicMode()}
          onDemonstrateActivityControl={() =>
            void director.getActivityGuide().demonstrateActiveControl(snapshot.currentModuleId)
          }
          onRequestHint={() => void director.requestStepHint()}
          onVerifyActivity={() => void director.verifyActiveActivity()}
          onOpenRealActivityInLesson={() => void handleOpenRealActivityInLesson()}
          onSelectQuizOption={(idx) => void director.selectQuizOption(idx, "ui")}
          onConfirmQuizAnswer={() => void director.confirmQuizAnswer()}
          onReadQuizQuestionAloud={() => void director.getQuizGuide().readActiveQuestionAloud()}
        />

        {/* Bottom Stack: Synchronized Captions + Transport & Voice Controls */}
        <div className="w-full space-y-2">
          <CosmosCinematicCaptions
            captionsEnabled={snapshot.captionsEnabled}
            narrationText={snapshot.currentNarrationText}
            keyTerminology={snapshot.currentKeyTerminology}
            activeSegmentId={snapshot.currentNarrationSegmentId}
            playbackStatus={snapshot.currentPlaybackState}
            allSegments={allSegments}
            onSeekSegment={(segId) => bridge.seekToNarrationSegment(segId)}
          />

          <CosmosCinematicControls
            snapshot={snapshot}
            speechSpeed={directorSnapshot.speechSpeed || 1.0}
            onPlayOrResume={() => void bridge.playOrResume()}
            onPause={() => bridge.pause()}
            onRepeat={() => void bridge.repeatCurrentExplanation()}
            onPreviousStep={() => void bridge.previousEligibleStep()}
            onNextStep={() => void bridge.nextEligibleStep()}
            onAskQuestion={async (q) => {
              await bridge.askCosmosQuestionInCinematicMode(q);
            }}
            onToggleCaptions={() => bridge.toggleCaptions()}
            onToggleLabels={() => bridge.toggleScientificLabels()}
            onToggleManualCamera={(manual) => bridge.setManualCameraMode(manual)}
            onChangeQuality={(tier: CinematicQualityTier) => qualityManager.setTier(tier, true)}
            onChangeSpeed={(speed) => bridge.setNarrationSpeed(speed)}
            onExitCinematicMode={() => void bridge.exitCinematicMode()}
          />
        </div>
      </div>
    </CosmosCinematicViewport>
  );
}
