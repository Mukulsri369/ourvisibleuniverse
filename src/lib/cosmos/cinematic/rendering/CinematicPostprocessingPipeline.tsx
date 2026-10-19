/**
 * COSMOS Centralized Quality-Aware Postprocessing Pipeline
 * Project: Our Visible Universe Academy
 * Scope: Prompt 05 — Sections 7, 18, 23, 25
 *
 * Implements:
 * - Controlled high-threshold HDR Bloom (threshold >= 0.82) so only legitimately
 *   bright astrophysical emitters (stellar photospheres, accretion disks, pulsar beams)
 *   bloom — never obscuring planetary textures or scientific annotations.
 * - Single EffectComposer guarantee (never stacks a second composer).
 * - Single tone-mapping stage (ACES Filmic via OutputPass / WebGLRenderer without double gamma).
 * - Automatic disable in LOW_POWER mode to conserve battery and GPU fill-rate.
 * - Clean resource disposal through ScientificResourceManager.
 */

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import type { CinematicQualityTier } from "../../cinematic-storyboard-types";
import { configureScientificColorPipeline } from "./ScientificLightingController";
import { ScientificRenderingQualityAdapter } from "./ScientificRenderingQualityAdapter";
import { ScientificResourceManager } from "./ScientificResourceManager";

export interface CinematicPostprocessingPipelineProps {
  qualityTier: CinematicQualityTier;
  exposure?: number;
  toneMapping?: "aces" | "agx" | "neutral";
  reducedMotion?: boolean;
}

export function CinematicPostprocessingPipeline({
  qualityTier,
  exposure = 1.08,
  toneMapping = "aces",
  reducedMotion = false,
}: CinematicPostprocessingPipelineProps) {
  const { gl, scene, camera, size } = useThree();

  const adapted = useMemo(
    () => ScientificRenderingQualityAdapter.resolveAdaptedParameters(qualityTier, reducedMotion),
    [qualityTier, reducedMotion],
  );

  // Configure consistent linear-light HDR color management & tone mapping
  useEffect(() => {
    configureScientificColorPipeline(gl, {
      qualityTier,
      toneMapping,
      exposure,
      usingPostprocessingOutputPass: adapted.enablePostprocessingBloom,
    });
  }, [gl, qualityTier, toneMapping, exposure, adapted.enablePostprocessingBloom]);

  // Create single EffectComposer only when bloom postprocessing is enabled (HIGH_CINEMATIC / BALANCED)
  const composerBundle = useMemo(() => {
    if (!adapted.enablePostprocessingBloom) {
      return null;
    }

    const width = Math.max(1, size.width);
    const height = Math.max(1, size.height);

    const renderTarget = new THREE.WebGLRenderTarget(width, height, {
      type: THREE.HalfFloatType,
      format: THREE.RGBAFormat,
      colorSpace: THREE.SRGBColorSpace,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      stencilBuffer: false,
      depthBuffer: true,
    });

    const composer = new EffectComposer(gl, renderTarget);
    composer.setSize(width, height);

    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      adapted.bloomStrength,
      adapted.bloomRadius,
      adapted.bloomThreshold,
    );
    composer.addPass(bloomPass);

    const outputPass = new OutputPass();
    composer.addPass(outputPass);

    const resKey = `postprocessing:cinematic_composer`;
    ScientificResourceManager.getInstance().registerResource({
      resourceKey: resKey,
      category: "render_target",
      isSharedCache: false,
      estimatedBytes: width * height * 8,
      disposeFn: () => {
        renderTarget.dispose();
        composer.dispose();
      },
    });

    return { composer, bloomPass, renderTarget, resKey };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, scene, camera, adapted.enablePostprocessingBloom]);

  // Synchronize viewport resize and adapted bloom thresholds
  useEffect(() => {
    if (!composerBundle) return;
    const w = Math.max(1, size.width);
    const h = Math.max(1, size.height);
    composerBundle.composer.setSize(w, h);
    composerBundle.bloomPass.resolution.set(w, h);
    composerBundle.bloomPass.strength = adapted.bloomStrength;
    composerBundle.bloomPass.radius = adapted.bloomRadius;
    composerBundle.bloomPass.threshold = adapted.bloomThreshold;
  }, [
    composerBundle,
    size.width,
    size.height,
    adapted.bloomStrength,
    adapted.bloomRadius,
    adapted.bloomThreshold,
  ]);

  // Release GPU resources when component unmounts or switches to LOW_POWER
  useEffect(() => {
    return () => {
      if (composerBundle) {
        ScientificResourceManager.getInstance().releaseResource(composerBundle.resKey, true);
      }
    };
  }, [composerBundle]);

  // Render via composer when enabled; otherwise explicitly render scene/camera
  // because R3F disables its internal render loop whenever a positive-priority useFrame is mounted.
  useFrame(() => {
    if (composerBundle && adapted.enablePostprocessingBloom) {
      composerBundle.composer.render();
    } else {
      gl.render(scene, camera);
    }
  }, 1);

  return null;
}
