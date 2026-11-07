/** Local-only built-app measurements. Never bypasses authentication or paid access. */
import { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { create } from "zustand";
import * as THREE from "three";
import { useExploration } from "./exploration-scope";
import { useStore } from "./store";
import { frameSummary } from "./scene-qa-metrics";
import { LOCAL_SCENE_QA, localSceneQAAllowed as allowed } from "./local-scene-qa-flags";

export { LOCAL_SCENE_QA };
const qa = create<{ requested: number; running: boolean; result: string }>(() => ({
  requested: 0,
  running: false,
  result: "",
}));
const scenario = () => ({
  galaxy: useExploration.getState().galaxy,
  phase: useExploration.getState().phase,
  target: useStore.getState().selectedObjectId,
  radius: useStore.getState().cameraDistance,
});
const heap = () =>
  (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize ??
  null;

export function LocalSceneQASampler() {
  const { gl, scene } = useThree();
  const data = useRef<{
    start: number;
    last: number;
    frames: number[];
    hidden: boolean;
    scenario: ReturnType<typeof scenario>;
    heapStart: number | null;
    heapPeak: number | null;
    calls: number;
    points: number;
    geometries: number;
    textures: number;
  } | null>(null);
  const first = useRef<number | null>(null);
  useEffect(() => {
    if (!allowed()) return;
    const previous = gl.info.autoReset;
    gl.info.autoReset = false;
    const unsubscribe = qa.subscribe((value, old) => {
      if (value.requested === old.requested) return;
      const now = performance.now();
      data.current = {
        start: now,
        last: now,
        frames: [],
        hidden: document.visibilityState !== "visible",
        scenario: scenario(),
        heapStart: heap(),
        heapPeak: heap(),
        calls: 0,
        points: 0,
        geometries: 0,
        textures: 0,
      };
      qa.setState({ running: true, result: "" });
    });
    const timer = setInterval(() => {
      const sample = data.current;
      if (!sample) return;
      sample.hidden ||= document.visibilityState !== "visible";
      const used = heap();
      if (used !== null) sample.heapPeak = Math.max(sample.heapPeak ?? 0, used);
      if (performance.now() - sample.start < 30000) return;
      const buffers = new Set<ArrayBufferLike>();
      scene.traverse((o) => {
        const geometry = (o as THREE.Mesh).geometry;
        if (!geometry) return;
        for (const a of [...Object.values(geometry.attributes), geometry.index]) {
          if (!a) continue;
          const array =
            "isInterleavedBufferAttribute" in a
              ? (a as THREE.InterleavedBufferAttribute).data.array
              : a.array;
          buffers.add(array.buffer);
        }
      });
      const navigation = performance.getEntriesByType("navigation")[0] as
        PerformanceNavigationTiming | undefined;
      const end = scenario();
      const result = {
        version: 1,
        ...(sample.frames.length
          ? frameSummary(sample.frames, performance.now() - sample.start)
          : { frames: 0, fps: 0 }),
        scenario: sample.scenario,
        scenarioEnd: end,
        stableScenario:
          sample.scenario.galaxy === end.galaxy &&
          sample.scenario.phase === end.phase &&
          sample.scenario.target === end.target &&
          Math.abs(sample.scenario.radius - end.radius) <=
            Math.max(0.001, Math.abs(sample.scenario.radius) * 0.001),
        width: innerWidth,
        height: innerHeight,
        dpr: devicePixelRatio,
        renderDpr: gl.getPixelRatio(),
        rasterWidth: gl.domElement.width,
        rasterHeight: gl.domElement.height,
        hiddenDuringSample: sample.hidden,
        peakDrawCalls: sample.calls,
        peakPoints: sample.points,
        peakGeometries: sample.geometries,
        peakTextures: sample.textures,
        geometryAttributeBytes: [...buffers].reduce((n, b) => n + b.byteLength, 0),
        jsHeapStartBytes: sample.heapStart,
        jsHeapEndBytes: heap(),
        jsHeapPeakBytes: sample.heapPeak,
        gpuMemoryBytes: null,
        gpuMemoryNote:
          "WebGL exposes no portable total VRAM measurement; attribute bytes exclude textures and driver overhead.",
        navigationToFirstFrameMs: first.current,
        responseEndMs: navigation?.responseEnd ?? null,
        domContentLoadedMs: navigation?.domContentLoadedEventEnd ?? null,
      };
      data.current = null;
      qa.setState({ running: false, result: JSON.stringify(result, null, 2) });
    }, 500);
    return () => {
      clearInterval(timer);
      unsubscribe();
      gl.info.autoReset = previous;
    };
  }, [gl, scene]);
  useFrame(() => {
    if (allowed()) gl.info.reset();
  }, -100);
  useFrame(() => {
    if (!allowed()) return;
    first.current ??= performance.now();
    const sample = data.current;
    if (!sample) return;
    const now = performance.now(),
      dt = now - sample.last;
    sample.last = now;
    if (dt > 0 && sample.frames.length < 30000) sample.frames.push(dt);
    sample.hidden ||= document.visibilityState !== "visible";
    sample.calls = Math.max(sample.calls, gl.info.render.calls);
    sample.points = Math.max(sample.points, gl.info.render.points);
    sample.geometries = Math.max(sample.geometries, gl.info.memory.geometries);
    sample.textures = Math.max(sample.textures, gl.info.memory.textures);
  }, 2);
  return null;
}
export function LocalSceneQAPanel() {
  const state = qa();
  const [open, setOpen] = useState(false);
  const [failures, setFailures] = useState<string[]>([]);
  useEffect(() => {
    if (!allowed()) return;
    const listener = (event: Event) =>
      setFailures((old) => [...old, (event as CustomEvent<string>).detail]);
    window.addEventListener("ovu-local-reference-fallback", listener);
    return () => window.removeEventListener("ovu-local-reference-fallback", listener);
  }, []);
  if (!allowed()) return null;
  return (
    <aside
      aria-label="Local scene QA"
      className="fixed bottom-20 left-3 z-[100] max-w-[min(450px,95vw)] rounded bg-black/95 p-3 text-xs text-white"
    >
      <button onClick={() => setOpen(!open)}>Local scene QA</button>
      {open && (
        <div>
          <button
            disabled={state.running}
            onClick={() => qa.setState((s) => ({ requested: s.requested + 1 }))}
          >
            Capture 30-second scene sample
          </button>
          <p>{state.running ? "Sampling real frames…" : "Ready"}</p>
          <p data-testid="scene-qa-assets">Reference fallback: {failures.join(", ") || "none"}</p>
          <pre data-testid="scene-qa-result" className="max-h-64 overflow-auto whitespace-pre-wrap">
            {state.result}
          </pre>
        </div>
      )}
    </aside>
  );
}
