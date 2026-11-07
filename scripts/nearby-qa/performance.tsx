import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Universe } from "../../src/stars/Universe";
import { DetailedGalaxies } from "../../src/stars/GalaxyDetail";
import { useStore } from "../../src/stars/store";
import { useExploration } from "../../src/stars/exploration-scope";
import { useGalaxyJourney } from "../../src/stars/galaxy-journey";
import { OBSERVATIONAL_GALAXY_CATALOG as galaxies } from "../../src/stars/galaxy-catalog";
import { gToXYZ } from "../../src/stars/galaxy-models";
const scenarios = [
  ["inside-mw", 80000],
  ["mw-m31", 3500000],
  ["local-group", 8000000],
  ["11-mpc", 11 * 3261563.777],
  ["30-mpc", 30 * 3261563.777],
  ["100-mpc", 100 * 3261563.777],
] as const;
function Scene({ scenario, onSample }: { scenario: string; onSample: (s: any) => void }) {
  const { camera, gl, scene } = useThree();
  (window as any).__nearbyScene = { camera, gl, scene };
  const sample = useRef<any>(null);
  const settle = useRef(performance.now());
  useEffect(() => {
    const radius = scenarios.find((s) => s[0] === scenario)?.[1] ?? 8000000;
    camera.position.set(0, radius * 0.2, radius);
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld();
    sample.current = null;
    settle.current = performance.now();
    const inside = scenario === "inside-mw";
    useExploration.setState({
      phase: inside ? "inside" : "outside",
      galaxy: inside ? "Milky Way" : null,
    });
    useStore.setState({
      visitGalaxy: inside
        ? {
            name: "Milky Way",
            x: -26000,
            y: 0,
            z: 0,
            size: 100000,
            distance: 26000,
            type: "Barred spiral",
            view: "overview",
          }
        : null,
    });
    useGalaxyJourney.setState({ galaxy: null });
  }, [scenario, camera]);
  useFrame(() => {
    const now = performance.now();
    if (now - settle.current < 7000) return;
    const s = (sample.current ??= {
      start: now,
      last: now,
      frames: [],
      peakCalls: 0,
      peakPoints: 0,
      peakGeometries: 0,
      peakTextures: 0,
      hidden: false,
    });
    s.hidden ||= document.hidden;
    document.getElementById("metrics")?.setAttribute("data-progress", String(now - s.start));
    if (s.last !== now) s.frames.push(now - s.last);
    s.last = now;
    s.peakCalls = Math.max(s.peakCalls, gl.info.render.calls);
    s.peakPoints = Math.max(s.peakPoints, gl.info.render.points);
    s.peakGeometries = Math.max(s.peakGeometries, gl.info.memory.geometries);
    s.peakTextures = Math.max(s.peakTextures, gl.info.memory.textures);
    if (s.frames.length && now - s.start >= 10000 && !s.done) {
      s.done = true;
      const sorted = [...s.frames].sort((a, b) => a - b);
      onSample({
        scenario,
        frames: s.frames.length,
        elapsedMs: now - s.start,
        fps: (1000 * s.frames.length) / (now - s.start),
        p95Ms: sorted[Math.floor(sorted.length * 0.95)],
        hidden: s.hidden,
        calls: s.peakCalls,
        points: s.peakPoints,
        geometries: s.peakGeometries,
        textures: s.peakTextures,
        heap: (performance as any).memory?.usedJSHeapSize,
        viewport: [innerWidth, innerHeight],
        galaxies: galaxies.length,
      });
    }
  });
  return (
    <>
      <Universe />
      <DetailedGalaxies />
    </>
  );
}
function App() {
  const [scenario, setScenario] = useState("local-group"),
    [result, setResult] = useState<any>(null);
  useEffect(() => {
    const s = useStore.getState().subsystems;
    useStore.setState({
      showObservedGalaxies: true,
      subsystems: { ...s, cosmicWeb: false, milkyWay: false, detailedGalaxies: true },
    });
  }, []);
  return (
    <>
      <Canvas
        camera={{ position: [0, 1600000, 8000000], fov: 42, near: 0.001, far: 1e12 }}
        gl={{ antialias: false, logarithmicDepthBuffer: true }}
        dpr={1}
      >
        <Scene scenario={scenario} onSample={setResult} />
      </Canvas>
      <aside>
        <strong>OVU component QA</strong>
        <p>
          Actual Universe/Detail components. Isolated local scene; no account or production
          operations.
        </p>
        <label>
          Scenario{" "}
          <select
            aria-label="Scenario"
            value={scenario}
            onChange={(e) => {
              setResult(null);
              setScenario(e.target.value);
            }}
          >
            {scenarios.map(([name]) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </label>
        <p>{galaxies.length} named catalogue records</p>
        <pre id="metrics">
          {result ? JSON.stringify(result, null, 2) : "Sampling after warm-up…"}
        </pre>
      </aside>
    </>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
