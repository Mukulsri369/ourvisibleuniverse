import { PassagePanelToggle, usePassagePanel } from "./PassagePanel";
import { useEffect, useRef, useState } from "react";
import { blackHoleAudio } from "./black-hole-audio";
import { useStore } from "./store";
import { OBJECT_BY_ID, type ObservedObject } from "./observed-objects";
import { BLACK_HOLE_SOURCES, blackHoleModel, isBlackHoleTarget } from "./black-hole-model";
import { descentMotion, useBlackHoleJourney } from "./black-hole-journey";

export function BlackHoleAnatomy({ item }: { item: ObservedObject }) {
  if (!isBlackHoleTarget(item)) return null;
  const model = blackHoleModel(item);
  return (
    <section className="mt-6 rounded-xl border border-amber-200/20 bg-amber-100/[0.03] p-4">
      <h3 className="text-[10px] uppercase tracking-[.2em] text-amber-100/70">
        Light near the horizon
      </h3>
      <dl className="mt-3 space-y-3 text-xs leading-relaxed">
        <div>
          <dt className="text-white/90">Shadow & horizon</dt>
          <dd className="mt-1 text-white/55">
            Captured rays create the dark shadow. The horizon itself emits no light.
          </dd>
        </div>
        <div>
          <dt className="text-white/90">Lensed disk images</dt>
          <dd className="mt-1 text-white/55">
            Curved light paths reveal the far side of the disk above and below the shadow.
            Near-orbiting rays form finer images.
          </dd>
        </div>
        <div>
          <dt className="text-white/90">
            {model.dormant ? "Background starlight" : "Orbiting plasma"}
          </dt>
          <dd className="mt-1 text-white/55">
            {model.dormant
              ? "This dormant object has no luminous disk or jets. Its lens distorts the surrounding star field."
              : "The approaching flow brightens and shifts toward blue; receding gas dims and reddens. The inner emitting edge depends on spin."}
          </dd>
        </div>
      </dl>
      <p className="mt-4 border-t border-white/10 pt-3 text-[10px] leading-relaxed text-white/40">
        Reconstructed views: Schwarzschild light transport with a spin-informed emission model, not
        a full Kerr or plasma simulation. EHT images are radio observations, not visible-light
        close-ups.
      </p>
      {model.enlargement > 1.05 && (
        <p className="mt-2 text-[10px] text-white/40">
          This tiny horizon is enlarged for navigation. Physical measurements remain listed above.
        </p>
      )}
      <div className="mt-3 flex flex-col gap-2">
        {BLACK_HOLE_SOURCES.map((source) => (
          <a
            key={source.url}
            href={source.url}
            target="_blank"
            rel="noreferrer"
            className="text-[10px] text-amber-100/65 underline underline-offset-4"
          >
            {source.label} ↗
          </a>
        ))}
      </div>
    </section>
  );
}
export function BlackHoleJourneyControls() {
  const selectedId = useStore((s) => s.selectedObjectId),
    hidden = useStore((s) => s.uiHidden);
  const mode = useBlackHoleJourney((s) => s.mode);
  const panel = usePassagePanel(selectedId ?? "");
  const readout = useRef<HTMLSpanElement>(null);
  const previousHidden = useRef<boolean | null>(null);
  const previousMusic = useRef<boolean | null>(null);
  const [sound, setSound] = useState(true);
  const item = selectedId ? OBJECT_BY_ID.get(selectedId) : undefined;
  useEffect(() => {
    useBlackHoleJourney.getState().reset();
  }, [selectedId]);
  useEffect(() => {
    if (mode === "idle") {
      blackHoleAudio.stop();
      if (previousMusic.current !== null) {
        useStore.setState({ musicOn: previousMusic.current });
        previousMusic.current = null;
      }
    }
    if (mode === "idle" && previousHidden.current !== null) {
      useStore.setState({ uiHidden: previousHidden.current });
      previousHidden.current = null;
    }
  }, [mode]);
  useEffect(
    () => () => {
      if (previousHidden.current !== null) useStore.setState({ uiHidden: previousHidden.current });
      blackHoleAudio.stop();
      if (previousMusic.current !== null) useStore.setState({ musicOn: previousMusic.current });
      useBlackHoleJourney.getState().reset();
    },
    [],
  );
  useEffect(() => {
    if (mode === "idle") return;
    let frame = 0;
    const update = () => {
      if (readout.current) readout.current.textContent = descentMotion.radiusRs.toFixed(2) + " Rₛ";
      blackHoleAudio.update(
        descentMotion.progress,
        descentMotion.radiusRs,
        descentMotion.orbitAngle,
        mode !== "paused" && mode !== "crossed" && !document.hidden,
        mode === "returning" ? Math.max(0, 1 - descentMotion.returnElapsed / 2) : 1,
      );
      frame = requestAnimationFrame(update);
    };
    const visibility = () => {
      if (document.hidden) blackHoleAudio.silence();
    };
    document.addEventListener("visibilitychange", visibility);
    frame = requestAnimationFrame(update);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [mode]);
  if (!isBlackHoleTarget(item) || (hidden && mode === "idle")) return null;
  if (panel.collapsed)
    return <PassagePanelToggle kind="Black hole" collapsed onClick={panel.show} />;
  const active = mode !== "idle";
  return (
    <aside
      aria-label="Black hole descent controls"
      className="pointer-events-auto fixed bottom-6 left-1/2 z-40 w-[min(92vw,460px)] -translate-x-1/2 rounded-2xl border border-amber-100/20 bg-[#08090d]/90 p-4 text-white shadow-2xl backdrop-blur-xl"
    >
      <PassagePanelToggle kind="Black hole" collapsed={false} onClick={panel.hide} />
      <div className="flex items-center justify-between gap-4 pr-10">
        <div>
          <p className="text-[9px] uppercase tracking-[.22em] text-amber-100/55">
            {mode === "crossed"
              ? "Horizon reached"
              : active
                ? "Cinematic spiral descent"
                : "Explore the strong field"}
          </p>
          <p className="mt-1 text-sm text-white/90">{item.name}</p>
        </div>
        <span ref={readout} className="font-mono text-xs tabular-nums text-white/60">
          {active ? "" : "Orbit"}
        </span>
      </div>
      {mode === "crossed" && (
        <p className="mt-3 text-xs leading-relaxed text-white/60">
          Horizon sequence complete. The tidal visualisation fades to black here.
        </p>
      )}
      <div className="mt-2 flex items-center justify-between gap-3">
        <span className="text-[10px] text-white/45">Designed spatial audio</span>
        <button
          type="button"
          aria-pressed={sound}
          aria-label="Descent sound"
          title={sound ? "Mute descent sound" : "Enable descent sound"}
          onClick={() => {
            const next = !sound;
            setSound(next);
            blackHoleAudio.setMuted(!next);
            if (next && active) void blackHoleAudio.start();
          }}
          className="min-h-11 rounded-lg border border-white/15 px-3 text-[11px] text-amber-100/80 hover:bg-white/10 focus-visible:outline focus-visible:outline-amber-100"
        >
          Sound {sound ? "on" : "off"}
        </button>
      </div>
      <div className="mt-3 flex gap-2">
        {mode === "idle" && (
          <button
            onClick={() => {
              previousHidden.current = useStore.getState().uiHidden;
              previousMusic.current = useStore.getState().musicOn;
              blackHoleAudio.setMuted(!sound);
              void blackHoleAudio.start();
              useStore.setState({
                cameraFree: false,
                musicOn: false,
                isAutoOrbiting: false,
                tourActive: false,
                uiHidden: true,
              });
              useBlackHoleJourney.getState().begin(item.id);
            }}
            className="w-full rounded-lg bg-amber-100 px-4 py-2.5 text-xs font-medium text-black transition hover:bg-white"
          >
            Begin descent
          </button>
        )}
        {mode === "falling" && (
          <button
            onClick={() => useBlackHoleJourney.getState().pause()}
            className="flex-1 rounded-lg border border-white/20 px-4 py-2 text-xs hover:bg-white/10"
          >
            Pause descent
          </button>
        )}
        {mode === "paused" && (
          <button
            onClick={() => useBlackHoleJourney.getState().resume()}
            className="flex-1 rounded-lg border border-white/20 px-4 py-2 text-xs hover:bg-white/10"
          >
            Resume descent
          </button>
        )}
        {active && (
          <button
            disabled={mode === "returning"}
            onClick={() => useBlackHoleJourney.getState().returnToOrbit()}
            className="flex-1 rounded-lg bg-amber-100 px-4 py-2 text-xs font-medium text-black hover:bg-white disabled:opacity-50"
          >
            {mode === "returning" ? "Returning…" : "Return to orbit"}
          </button>
        )}
      </div>
      {active && mode !== "crossed" && (
        <p className="mt-2 text-[10px] text-white/40">
          Approach · inspiral · plunge · tidal stretch · Esc to return
        </p>
      )}
    </aside>
  );
}
