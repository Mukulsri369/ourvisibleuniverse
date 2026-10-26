import { PassagePanelToggle, usePassagePanel } from "./PassagePanel";
import { useEffect, useRef } from "react";
import { useStore } from "./store";
import { useNebulaJourney, nebulaMotion } from "./nebula-journey";
import { NEBULA_ROUTES } from "./nebula-journey-profiles";
import { NEBULA_STELLAR_PROFILES } from "./nebula-stellar-profiles";
export function NebulaJourneyControls() {
  const id = useStore((s) => s.selectedObjectId),
    hidden = useStore((s) => s.uiHidden);
  const mode = useNebulaJourney((s) => s.mode);
  const panel = usePassagePanel(id ?? "");
  const progress = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    useNebulaJourney.getState().reset();
  }, [id]);
  useEffect(() => () => useNebulaJourney.getState().reset(), []);
  useEffect(() => {
    if (mode === "idle") return;
    let frame = 0;
    const tick = () => {
      if (progress.current)
        progress.current.textContent = Math.round(nebulaMotion.progress * 100) + "%";
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const pause = () => {
      if (document.hidden) useNebulaJourney.getState().pause();
    };
    document.addEventListener("visibilitychange", pause);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", pause);
    };
  }, [mode]);
  if (!id || !NEBULA_ROUTES[id] || (hidden && mode === "idle")) return null;
  if (panel.collapsed) return <PassagePanelToggle kind="Nebula" collapsed onClick={panel.show} />;
  const route = NEBULA_ROUTES[id],
    journey = useNebulaJourney.getState(),
    active = mode !== "idle";
  const anchors = NEBULA_STELLAR_PROFILES[id]?.anchors ?? [];
  return (
    <aside
      aria-label="Nebula journey controls"
      className="pointer-events-auto fixed bottom-6 left-1/2 z-40 w-[min(92vw,460px)] -translate-x-1/2 rounded-2xl border border-cyan-100/20 bg-[#080b10]/95 p-4 text-white shadow-2xl backdrop-blur-xl"
    >
      <PassagePanelToggle kind="Nebula" collapsed={false} onClick={panel.hide} />
      <div className="flex items-start justify-between gap-3 pr-10">
        <div>
          <p className="text-[9px] uppercase tracking-[.24em] text-cyan-100/55">
            {mode === "inside" ? "Inside the nebula" : "Nebula passage"}
          </p>
          <p className="mt-1 text-xs text-white/85">{route.title}</p>
        </div>
        {active && <span ref={progress} className="text-xs tabular-nums text-white/50" />}
      </div>
      <div className="mt-3 flex gap-2">
        {!active ? (
          <button
            onClick={() => journey.start(id)}
            className="min-h-11 flex-1 rounded-lg bg-cyan-100 px-4 py-2 text-xs font-medium text-slate-950 hover:bg-white"
          >
            Enter in nebula
          </button>
        ) : (
          <>
            {(mode === "flying" || mode === "paused") && (
              <button
                className="min-h-11 flex-1 rounded-lg border border-white/20 px-3 text-xs hover:bg-white/10"
                onClick={() => (mode === "paused" ? journey.resume() : journey.pause())}
              >
                {mode === "paused" ? "Resume passage" : "Pause"}
              </button>
            )}
            <button
              disabled={mode === "returning"}
              className="min-h-11 flex-1 rounded-lg border border-white/20 px-3 text-xs hover:bg-white/10 disabled:opacity-40"
              onClick={journey.back}
            >
              {mode === "returning" ? "Returning…" : "Return to viewpoint"}
            </button>
          </>
        )}
      </div>
      {mode === "inside" && (
        <p className="mt-2 text-[10px] leading-relaxed text-white/55">
          Free look is active. Drag to turn; W/S move forward/back, A/D sideways, Q/E up/down.{" "}
          {anchors.length > 0
            ? "Visible anchors: " + anchors.map((a) => a.name).join(", ") + "."
            : "Foreground and background stars remain distinct from the cloud."}
        </p>
      )}
      {!active && (
        <p className="mt-2 text-[10px] leading-relaxed text-white/40">
          A reconstructed 3D journey through gas, dust and starlight.
        </p>
      )}
    </aside>
  );
}
