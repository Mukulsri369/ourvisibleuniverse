import { useEffect } from "react";
import { useGalaxyJourney } from "./galaxy-journey";
/** Passage controls stay available without covering the flight with a progress window. */
export function GalaxyJourneyControls() {
  const mode = useGalaxyJourney((s) => s.mode);
  useEffect(() => () => useGalaxyJourney.getState().reset(), []);
  useEffect(() => {
    if (mode === "idle" || mode === "inside") return;
    const pause = () => {
      if (document.hidden) useGalaxyJourney.getState().pause();
    };
    document.addEventListener("visibilitychange", pause);
    return () => document.removeEventListener("visibilitychange", pause);
  }, [mode]);
  if (mode === "idle" || mode === "inside") return null;
  return (
    <div
      aria-label="Galaxy flight controls"
      className="pointer-events-auto fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 gap-2"
    >
      {mode !== "returning" && (
        <button
          onClick={() =>
            mode === "paused"
              ? useGalaxyJourney.getState().resume()
              : useGalaxyJourney.getState().pause()
          }
          className="min-h-11 rounded-xl bg-neutral-950 px-4 text-sm text-white"
        >
          {mode === "paused" ? "Resume" : "Pause"}
        </button>
      )}
      <button
        disabled={mode === "returning"}
        onClick={() => useGalaxyJourney.getState().exit()}
        className="min-h-11 rounded-xl bg-neutral-950 px-4 text-sm text-white disabled:opacity-40"
      >
        Exit galaxy
      </button>
    </div>
  );
}
