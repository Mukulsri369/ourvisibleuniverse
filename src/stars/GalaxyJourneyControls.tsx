import { useEffect, useRef } from "react";
import { useGalaxyJourney, galaxyMotion } from "./galaxy-journey";
export function GalaxyJourneyControls() {
  const mode = useGalaxyJourney((s) => s.mode),
    galaxy = useGalaxyJourney((s) => s.galaxy);
  const progress = useRef<HTMLProgressElement>(null);
  useEffect(() => () => useGalaxyJourney.getState().reset(), []);
  useEffect(() => {
    if (mode === "idle" || mode === "inside") return;
    let frame = 0;
    const tick = () => {
      if (progress.current) progress.current.value = galaxyMotion.progress;
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
  if (!galaxy || mode === "idle" || mode === "inside") return null;
  return (
    <aside
      aria-label="Galaxy flight controls"
      className="pointer-events-auto fixed left-1/2 top-20 z-40 w-[min(calc(100vw-32px),380px)] -translate-x-1/2 rounded-2xl bg-neutral-950 p-4 text-white"
    >
      <p className="text-xs text-neutral-400">
        {mode === "returning"
          ? "Leaving the galaxy"
          : mode === "paused"
            ? "Journey paused"
            : "Travelling into the galaxy"}
      </p>
      <p className="mt-1 text-sm font-medium">{galaxy.name}</p>
      <progress
        ref={progress}
        max={1}
        value={0}
        aria-label="Galaxy journey progress"
        className="mt-3 h-1.5 w-full accent-sky-300"
      />
      <div className="mt-3 flex gap-2">
        {(mode === "flying" || mode === "paused") && (
          <button
            onClick={() =>
              mode === "paused"
                ? useGalaxyJourney.getState().resume()
                : useGalaxyJourney.getState().pause()
            }
            className="min-h-11 flex-1 rounded-xl bg-neutral-800 text-sm"
          >
            {mode === "paused" ? "Resume" : "Pause"}
          </button>
        )}
        <button
          disabled={mode === "returning"}
          onClick={() => useGalaxyJourney.getState().exit()}
          className="min-h-11 flex-1 rounded-xl bg-white text-sm text-black disabled:opacity-40"
        >
          {mode === "returning" ? "Leaving…" : "Exit galaxy"}
        </button>
      </div>
    </aside>
  );
}
