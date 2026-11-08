import { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
const enabled = new URLSearchParams(location.search).has("motion");
const radii = [180000, 1800000, 3600000, 12000000, 35000000, 100000000, 326000000];
export function MotionControls() {
  const [hidden, setHidden] = useState(false);
  if (!enabled || hidden) return null;
  return (
    <aside
      style={{
        position: "fixed",
        left: 16,
        bottom: 32,
        zIndex: 70,
        background: "#111e",
        padding: 10,
        color: "white",
        font: "12px monospace",
        pointerEvents: "auto",
        maxWidth: 470,
      }}
    >
      <label>
        QA view radius{" "}
        <select
          aria-label="QA view radius"
          defaultValue={180000}
          onChange={(event) =>
            (window as any).__setZoom(
              (Math.log(Number(event.target.value)) - Math.log(1e-10)) /
                (Math.log(5e10) - Math.log(1e-10)),
            )
          }
          style={{ color: "black" }}
        >
          {radii.map((radius) => (
            <option key={radius} value={radius}>
              {radius / 1e6} Mly
            </option>
          ))}
        </select>
      </label>
      <output id="motion-live" style={{ display: "block", whiteSpace: "pre-wrap" }}>
        Measuring…
      </output>
      <output id="motion-drag" style={{ display: "block", whiteSpace: "pre-wrap" }}>
        Drag the scene to measure its frame pacing.
      </output>
      <small id="motion-adapter" style={{ display: "block" }} />
      <button aria-label="Hide motion measurements" onClick={() => setHidden(true)}>
        Hide measurements
      </button>
    </aside>
  );
}
function summary(times: number[]) {
  const sorted = times.filter((v) => v > 0).sort((a, b) => a - b);
  if (!sorted.length) return "No drag frames";
  return `${(1000 / (sorted.reduce((a, b) => a + b, 0) / sorted.length)).toFixed(1)} FPS · p95 ${sorted[Math.floor(sorted.length * 0.95)].toFixed(1)} ms · max ${sorted.at(-1)!.toFixed(1)} ms · ${sorted.filter((v) => v > 33.4).length}/${sorted.length} frames >33ms`;
}
export function MotionProbe() {
  const { gl } = useThree();
  const state = useRef({
    previous: 0,
    active: false,
    frames: new Float32Array(240),
    frameIndex: 0,
    drag: new Float32Array(4096),
    dragIndex: 0,
  });
  useEffect(() => {
    if (!enabled) return;
    const s = state.current,
      canvas = gl.domElement;
    const down = () => {
      s.active = true;
      s.dragIndex = 0;
    };
    const up = () => {
      if (!s.active) return;
      s.active = false;
      const output = document.getElementById("motion-drag");
      if (output)
        output.textContent =
          "Last drag: " +
          summary(Array.from(s.drag.subarray(0, Math.min(s.dragIndex, s.drag.length))));
    };
    canvas.addEventListener("pointerdown", down, true);
    window.addEventListener("pointerup", up, true);
    window.addEventListener("pointercancel", up, true);
    const context = gl.getContext(),
      debug = context.getExtension("WEBGL_debug_renderer_info");
    const adapter = document.getElementById("motion-adapter");
    if (adapter)
      adapter.textContent = debug
        ? String(context.getParameter(debug.UNMASKED_RENDERER_WEBGL))
        : "GPU adapter unavailable";
    const timer = setInterval(() => {
      const output = document.getElementById("motion-live");
      if (output)
        output.textContent = `Live: ${summary(Array.from(s.frames.subarray(0, Math.min(s.frameIndex, s.frames.length))))}\n${gl.info.render.calls} calls · ${gl.info.render.points.toLocaleString()} points · DPR ${gl.getPixelRatio()} · ${canvas.width}×${canvas.height}`;
    }, 1000);
    return () => {
      clearInterval(timer);
      canvas.removeEventListener("pointerdown", down, true);
      window.removeEventListener("pointerup", up, true);
      window.removeEventListener("pointercancel", up, true);
    };
  }, [gl]);
  useFrame(() => {
    if (!enabled) return;
    const s = state.current,
      now = performance.now(),
      dt = now - s.previous;
    s.previous = now;
    if (dt <= 0 || dt > 1000) return;
    s.frames[s.frameIndex++ % s.frames.length] = dt;
    if (s.active && s.dragIndex < s.drag.length) s.drag[s.dragIndex++] = dt;
  });
  return null;
}
