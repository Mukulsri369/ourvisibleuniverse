import { PassagePanelToggle, usePassagePanel } from "./PassagePanel";
import { galaxyAppearance } from "./galaxy-appearance";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useStore } from "./store";
import { useGalaxyJourney, galaxyMotion } from "./galaxy-journey";
import { GalaxyDestinationGrid } from "./GalaxyDestinationGrid";
import { galaxyQuat } from "./galaxy-models";
import { useNebulaJourney } from "./nebula-journey";
import { useBlackHoleJourney } from "./black-hole-journey";
export function GalaxyJourneyControls() {
  const focusedObject = useStore(
    (s) => !!s.selectedObjectId || !!s.visitPlanet || !!s.selectedStar,
  );
  const selected = useStore((s) => s.visitGalaxy),
    hidden = useStore((s) => s.uiHidden),
    mode = useGalaxyJourney((s) => s.mode),
    active = useGalaxyJourney((s) => s.galaxy);
  const panel = usePassagePanel((active ?? selected)?.name ?? "");
  const [places, setPlaces] = useState(true);
  const progress = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const j = useGalaxyJourney.getState();
    if (selected && j.galaxy && selected.name !== j.galaxy.name) j.reset();
  }, [selected]);
  useEffect(() => () => useGalaxyJourney.getState().reset(), []);
  useEffect(() => {
    if (mode === "idle") return;
    let frame = 0;
    const tick = () => {
      if (progress.current)
        progress.current.textContent = Math.round(galaxyMotion.progress * 100) + "%";
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const pause = () => {
      if (document.hidden) useGalaxyJourney.getState().pause();
    };
    document.addEventListener("visibilitychange", pause);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", pause);
    };
  }, [mode]);
  const galaxy = active ?? selected;
  if (
    !galaxy ||
    /galaxy cluster|supercluster|cosmic web/i.test(galaxy.type) ||
    (hidden && mode === "idle")
  )
    return null;
  if (panel.collapsed) return <PassagePanelToggle kind="Galaxy" collapsed onClick={panel.show} />;
  const journey = useGalaxyJourney.getState();
  const region = (local: [number, number, number]) => {
    const model = galaxyAppearance(galaxy);
    if (!model) return;
    const p = new THREE.Vector3(...local)
      .multiplyScalar(model.diskRadius)
      .applyQuaternion(galaxyQuat(model.inclination, model.posAngle))
      .add(new THREE.Vector3(galaxy.x, galaxy.y, galaxy.z));
    const distance = model.diskRadius * 0.13;
    useStore.setState({
      visitGalaxy: { ...galaxy, view: undefined, focus: { x: p.x, y: p.y, z: p.z, distance } },
      visitPlanet: null,
      exoVisit: null,
      selectedStar: null,
      selectedObjectId: null,
      cameraFree: false,
      flyTo: { x: p.x, y: p.y, z: p.z, distance },
    });
  };
  return (
    <>
      <aside
        aria-label="Galaxy journey controls"
        className={
          "pointer-events-auto fixed left-1/2 z-40 w-[min(92vw,460px)] -translate-x-1/2 rounded-2xl border border-white/15 bg-neutral-950/95 p-4 text-white " +
          (focusedObject && mode === "inside" ? "bottom-52" : "bottom-6")
        }
      >
        <PassagePanelToggle kind="Galaxy" collapsed={false} onClick={panel.hide} />
        <div className="flex items-center justify-between gap-4 pr-10">
          <div>
            <p className="text-[11px] text-white/50">
              {mode === "inside" ? "Inside the galaxy" : "Galaxy passage"}
            </p>
            <p className="mt-1 text-sm">{galaxy.name}</p>
          </div>
          {mode !== "idle" && (
            <span className="text-xs tabular-nums text-white/50" ref={progress} />
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {mode === "idle" ? (
            <button
              className="min-h-11 flex-1 rounded-lg bg-white px-4 text-sm text-black"
              onClick={() => {
                useNebulaJourney.getState().reset();
                useBlackHoleJourney.getState().reset();
                journey.enter(galaxy);
                setPlaces(true);
              }}
            >
              Enter galaxy
            </button>
          ) : (
            <>
              {(mode === "flying" || mode === "paused") && (
                <button
                  className="min-h-11 flex-1 rounded-lg bg-white/10 px-4 text-sm"
                  onClick={() => (mode === "paused" ? journey.resume() : journey.pause())}
                >
                  {mode === "paused" ? "Resume" : "Pause"}
                </button>
              )}
              {mode === "inside" && (
                <button
                  aria-expanded={places}
                  className="min-h-11 flex-1 rounded-lg bg-white/10 px-4 text-sm"
                  onClick={() => setPlaces((p) => !p)}
                >
                  Places to visit
                </button>
              )}
              <button
                disabled={mode === "returning"}
                className="min-h-11 flex-1 rounded-lg border border-white/20 px-4 text-sm disabled:opacity-40"
                onClick={journey.exit}
              >
                {mode === "returning" ? "Leaving…" : "Exit galaxy"}
              </button>
            </>
          )}
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-white/45">
          {mode === "idle"
            ? "Enter to resolve 100,000 stars through the galaxy’s dust."
            : mode === "inside"
              ? "Drag to turn. W/S travel, A/D strafe, Q/E rise and descend. Escape exits."
              : "A continuous passage through a reconstructed stellar population."}
        </p>
      </aside>
      {mode === "inside" && places && (
        <aside
          aria-label="Places to visit in galaxy"
          className="pointer-events-auto fixed right-14 top-20 z-30 max-h-[calc(100dvh-280px)] w-[min(calc(100vw-72px),340px)] overflow-y-auto rounded-xl border border-white/15 bg-neutral-950/95 p-5 text-white"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base">Places to visit</h2>
            <button
              aria-label="Close places panel"
              className="grid size-11 place-items-center"
              onClick={() => setPlaces(false)}
            >
              ×
            </button>
          </div>
          <p className="text-xs text-white/50">{galaxy.name}</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {[
              ["Stellar neighborhood", [0.55, 0.025, 0.25]],
              ["Outer halo", [0.85, 0.4, 0.1]],
            ].map(([label, point]) => (
              <button
                key={label as string}
                className="min-h-14 rounded-lg border border-white/15 px-3 text-left text-xs hover:bg-white/10"
                onClick={() => region(point as [number, number, number])}
              >
                {label as string}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-white/40">Local views in the reconstructed model.</p>
          <GalaxyDestinationGrid
            key={galaxy.name}
            name={galaxy.name}
            onVisit={() => setPlaces(false)}
          />
        </aside>
      )}
    </>
  );
}
