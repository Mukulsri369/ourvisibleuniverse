import { BlackHoleLensPass } from "./BlackHoleLensPass";
import { OBJECT_BY_ID } from "./observed-objects";
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
  const { gl, scene, camera, size, setDpr } = useThree();
  const dpr = useThree((state) => state.viewport.dpr);
  const quality = useRef({ seconds: 0, frames: 0, elapsed: 0, cooldown: 5 });

  const bloomEnabled = useStore((s) => s.bloomEnabled);
  const bloomStrength = useStore((s) => s.bloomStrength);
  const bloomRadius = useStore((s) => s.bloomRadius);
  const bloomThreshold = useStore((s) => s.bloomThreshold);
  const exposure = useStore((s) => s.exposure);
  const sceneBrightness = useStore((s) => s.sceneBrightness);
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
      colorSpace: THREE.LinearSRGBColorSpace,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      stencilBuffer: false,
      depthBuffer: true,
    });

    const comp = new EffectComposer(gl, renderTarget);
    comp.setSize(size.width, size.height);

    const renderPass = new RenderPass(scene, camera);
    comp.addPass(renderPass);
    const blackHolePass = new BlackHoleLensPass(scene);
    comp.addPass(blackHolePass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(size.width, size.height),
      bloomEnabled ? bloomStrength : 0,
      bloomRadius,
      bloomThreshold,
    );
    comp.addPass(bloomPass);

    const outputPass = new OutputPass();
    outputPass.uniforms.sceneBrightness = { value: 1 };
    outputPass.material.fragmentShader = outputPass.material.fragmentShader
      .replace("varying vec2 vUv;", "uniform float sceneBrightness;\nvarying vec2 vUv;")
      .replace("// color space", "gl_FragColor.rgb *= sceneBrightness;\n// color space");
    comp.addPass(outputPass);

    return { comp, bloomPass, renderPass, renderTarget, outputPass, blackHolePass };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, scene, camera]);

  // Sync window size changes
  useEffect(() => {
    composer.comp.setPixelRatio(dpr);
    composer.comp.setSize(size.width, size.height);
    composer.bloomPass.resolution.set(size.width, size.height);
  }, [size, dpr, composer]);

  // Sync bloom parameters
  useEffect(() => {
    composer.bloomPass.strength = bloomEnabled ? bloomStrength : 0.0;
    composer.bloomPass.radius = bloomRadius;
    composer.bloomPass.threshold = bloomThreshold;
  }, [bloomEnabled, bloomStrength, bloomRadius, bloomThreshold, composer]);

  useEffect(() => {
    composer.outputPass.uniforms.sceneBrightness.value = sceneBrightness;
  }, [composer, sceneBrightness]);

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
      composer.blackHolePass.dispose();
      composer.bloomPass.dispose();
      composer.outputPass.dispose();
      composer.comp.dispose();
    };
  }, [composer]);

  const subsystems = useStore((s) => s.subsystems);

  // Rolling latency history buffer for percentiles
  const frameDurations = useRef<number[]>([]);
  const lastFrameTimestamp = useRef(performance.now());
  const rollingFpsRef = useRef(60);

  // Per-frame render override with metrics sampling
  useFrame((_, dt) => {
    const t0 = performance.now();
    const frameDelta = t0 - lastFrameTimestamp.current;
    lastFrameTimestamp.current = t0;

    if (frameDelta > 0 && frameDelta < 250) {
      frameDurations.current.push(frameDelta);
      if (frameDurations.current.length > 60) {
        frameDurations.current.shift();
      }
    }

    // Respect subsystem toggle for bloom
    if (composer.bloomPass) {
      composer.bloomPass.enabled = bloomEnabled && subsystems.bloom && bloomStrength > 0;
      composer.bloomPass.strength = bloomStrength;
    }

    // Adapt buffer resolution in slow, discrete steps; never change simulation speed.
    const q = quality.current;
    if (dt > 0 && dt < 0.25) {
      q.elapsed += dt;
      q.frames++;
    }
    q.seconds += dt;
    if (q.seconds >= q.cooldown && q.frames >= 30) {
      const average = q.elapsed / q.frames;
      const maxDpr = Math.min(window.devicePixelRatio || 1, 1.5);
      if (average > 0.024 && dpr > 0.75) setDpr(Math.max(0.75, dpr - 0.25));
      else if (average < 0.014 && dpr < maxDpr) setDpr(Math.min(maxDpr, dpr + 0.25));
      q.seconds = 0;
      q.frames = 0;
      q.elapsed = 0;
      q.cooldown = 3;
    }
    const state = useStore.getState();
    composer.blackHolePass.update(
      camera as THREE.PerspectiveCamera,
      state.selectedObjectId ? OBJECT_BY_ID.get(state.selectedObjectId) : undefined,
      state.renderingQualityTier,
      dt,
    );
    // Render through composer with post-processing passes
    const autoReset = gl.info.autoReset;
    gl.info.autoReset = false;
    gl.info.reset();
    composer.comp.render();
    gl.info.autoReset = autoReset;

    const tCpu = performance.now() - t0;

    // Sample performance metrics every 15 frames for snappy feedback
    frameCount.current++;
    if (frameCount.current % 15 === 0 && frameDurations.current.length >= 10) {
      const sorted = [...frameDurations.current].sort((a, b) => a - b);
      const p95Idx = Math.floor(sorted.length * 0.95);
      const p99Idx = Math.floor(sorted.length * 0.99);
      const avgDuration = sorted.reduce((sum, val) => sum + val, 0) / sorted.length;

      const p95 = sorted[p95Idx] ?? avgDuration;
      const p99 = sorted[p99Idx] ?? p95;
      const currentFps = Math.round(1000 / Math.max(1, frameDelta));
      const rollingFps = Math.round(1000 / Math.max(1, avgDuration));

      const info = gl.info;
      const memory = (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory;
      const memMb = memory ? Math.round(memory.usedJSHeapSize / (1024 * 1024)) : 85;

      const originName =
        (window as unknown as { __activeOriginName?: string }).__activeOriginName ??
        "Solar System Barycenter";

      setPerformanceStats({
        fps: Math.min(120, Math.max(5, currentFps)),
        rollingFps: Math.min(120, Math.max(5, rollingFps)),
        frameTimeMs: avgDuration,
        p95FrameTimeMs: p95,
        p99FrameTimeMs: p99,
        cpuFrameTimeMs: tCpu,
        drawCalls: info.render.calls,
        triangles: info.render.triangles,
        pointsCount: info.render.points,
        memoryMb: memMb,
        geometriesCount: info.memory.geometries,
        texturesCount: info.memory.textures,
        activeFloatingOrigin: originName,
      });
    }
  }, 1);

  return null;
}
