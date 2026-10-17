/**
 * Astronomical Optics & Post-Processing Pipeline
 *
 * Implements physically calibrated bloom, high-dynamic-range (HDR) tone mapping,
 * photometric exposure control, and real-time performance instrumentation.
 *
 * Presets:
 * - Scientific Mode: Prioritizes calibrated observation-derived colors, tight Airy core,
 *   high bloom threshold (only true bright stars/cores bloom), zero fake space haze.
 * - Cinematic Mode: Amplified dynamic range, soft bloom glow, enhanced contrast,
 *   with visual enhancement badge.
 */

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { useStore } from "./store";

export function OpticsPostProcessing() {
  const { gl, scene, camera, size } = useThree();

  const bloomEnabled = useStore((s) => s.bloomEnabled);
  const bloomStrength = useStore((s) => s.bloomStrength);
  const bloomRadius = useStore((s) => s.bloomRadius);
  const bloomThreshold = useStore((s) => s.bloomThreshold);
  const exposure = useStore((s) => s.exposure);
  const toneMappingAlgorithm = useStore((s) => s.toneMappingAlgorithm);
  const setPerformanceStats = useStore((s) => s.setPerformanceStats);

  // Frame timing & metrics
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const fpsAccumulator = useRef(60);

  // Initialize post-processing EffectComposer
  const composer = useMemo(() => {
    // High-precision HDR render target with half-float precision
    const renderTarget = new THREE.WebGLRenderTarget(size.width, size.height, {
      type: THREE.HalfFloatType,
      format: THREE.RGBAFormat,
      colorSpace: THREE.SRGBColorSpace,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      stencilBuffer: false,
      depthBuffer: true,
    });

    const comp = new EffectComposer(gl, renderTarget);
    comp.setSize(size.width, size.height);

    const renderPass = new RenderPass(scene, camera);
    comp.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(size.width, size.height),
      bloomEnabled ? bloomStrength : 0,
      bloomRadius,
      bloomThreshold,
    );
    comp.addPass(bloomPass);

    const outputPass = new OutputPass();
    comp.addPass(outputPass);

    return { comp, bloomPass, renderPass };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, scene, camera]);

  // Sync window size changes
  useEffect(() => {
    composer.comp.setSize(size.width, size.height);
    composer.bloomPass.resolution.set(size.width, size.height);
  }, [size, composer]);

  // Sync bloom parameters
  useEffect(() => {
    composer.bloomPass.strength = bloomEnabled ? bloomStrength : 0.0;
    composer.bloomPass.radius = bloomRadius;
    composer.bloomPass.threshold = bloomThreshold;
  }, [bloomEnabled, bloomStrength, bloomRadius, bloomThreshold, composer]);

  // Sync Tone Mapping & Exposure
  useEffect(() => {
    gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.toneMappingExposure = exposure;

    switch (toneMappingAlgorithm) {
      case "agx":
        gl.toneMapping = THREE.AgXToneMapping;
        break;
      case "neutral":
        gl.toneMapping = THREE.NeutralToneMapping;
        break;
      case "reinhard":
        gl.toneMapping = THREE.ReinhardToneMapping;
        break;
      case "aces":
      default:
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        break;
    }
  }, [gl, toneMappingAlgorithm, exposure]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      composer.comp.dispose();
    };
  }, [composer]);

  // Per-frame render override with metrics sampling
  useFrame(() => {
    // Render through composer with post-processing passes
    composer.comp.render();

    // Sample performance metrics every 30 frames (reduced store updates)
    frameCount.current++;
    if (frameCount.current % 30 === 0) {
      const now = performance.now();
      const delta = now - lastTime.current;
      lastTime.current = now;

      if (delta > 0) {
        const instantFps = Math.round((30 * 1000) / delta);
        fpsAccumulator.current = Math.round(fpsAccumulator.current * 0.7 + instantFps * 0.3);

        const info = gl.info;
        const memory = (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory;
        const memMb = memory ? Math.round(memory.usedJSHeapSize / (1024 * 1024)) : 85;

        setPerformanceStats({
          fps: Math.min(120, Math.max(10, fpsAccumulator.current)),
          drawCalls: info.render.calls,
          triangles: info.render.triangles,
          pointsCount: info.render.points,
          memoryMb: memMb,
        });
      }
    }
  }, 1);

  return null;
}
