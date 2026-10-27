import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import { Headphones, Pause, Play, Settings2, X, Volume2, VolumeX } from "lucide-react";
import { useStore } from "./store";
import { OBJECT_BY_ID, objectPosition, objectVisitDistance } from "./observed-objects";
import { PLANETS } from "./Planets";
import { exoSystemFor } from "./exosystems";
import { useBlackHoleJourney } from "./black-hole-journey";
import { objectAudio, useObjectAudio } from "./object-audio";
import { observedSoundProfile, soundProfile, worldSoundProfile } from "./object-sound-profiles";

export function ObjectAudioRuntime() {
  const objectId = useStore((s) => s.selectedObjectId);
  const planet = useStore((s) => s.visitPlanet);
  const star = useStore((s) => s.selectedStar);
  const galaxy = useStore((s) => s.visitGalaxy);
  const exo = useStore((s) => s.exoVisit);
  const on = useStore((s) => s.musicOn);
  const target = useMemo(() => {
    if (objectId) {
      const item = OBJECT_BY_ID.get(objectId);
      if (item)
        return {
          profile: observedSoundProfile(item),
          position: objectPosition(item),
          scale: objectVisitDistance(item),
          live: "",
        };
    }
    if (planet || exo) {
      const name = planet || exo!.planet;
      const model = exo ? exoSystemFor(exo.star).planets.find((p) => p.name === exo.planet) : null;
      const parent = PLANETS.find(
        (p) => p.name === name || p.moons?.some((m) => name === p.name + ":" + m.name),
      );
      const moon = parent?.moons?.find((m) => name === parent.name + ":" + m.name);
      return {
        profile:
          name === "Sun"
            ? soundProfile("sun", "Sun", "star")
            : worldSoundProfile(name.replace(":", " · "), model?.kind),
        position: [0, 0, 0],
        scale: (moon?.size ?? parent?.size ?? 0.0002) * 8,
        live: name,
      };
    }
    if (star)
      return {
        profile: soundProfile("star:" + star.name, star.name, "star"),
        position: [star.x, star.y, star.z],
        scale: Math.max(star.radius * 7.353e-8 * 12, 1e-6),
        live: star.name,
      };
    if (galaxy)
      return {
        profile: soundProfile("galaxy:" + galaxy.name, galaxy.name, "galaxy"),
        position: [galaxy.x, galaxy.y, galaxy.z],
        scale: galaxy.size,
        live: "",
      };
    return {
      profile: soundProfile("solar-neighborhood", "Solar neighborhood", "star"),
      position: [0, 0, 0],
      scale: 2,
      live: "Sun",
    };
  }, [objectId, planet, star, galaxy, exo]);
  useEffect(() => {
    objectAudio.setProfile(target.profile);
  }, [target]);
  useEffect(() => {
    let current = true;
    if (on)
      void objectAudio.start().then((ok) => {
        if (current && !ok && useStore.getState().musicOn) useStore.setState({ musicOn: false });
      });
    else objectAudio.stop();
    return () => {
      current = false;
    };
  }, [on]);
  useEffect(() => {
    const visibility = () => {
      void objectAudio.visibility();
    };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      document.removeEventListener("visibilitychange", visibility);
      objectAudio.dispose();
      useStore.setState({ musicOn: false });
    };
  }, []);
  const vectors = useMemo(
    () => ({
      point: new Vector3(),
      right: new Vector3(),
      delta: new Vector3(),
      previous: new Vector3(),
    }),
    [],
  );
  const elapsed = useRef(0),
    initialized = useRef(false),
    previousTarget = useRef(target);
  useFrame(({ camera }, dt) => {
    if (!on) {
      initialized.current = false;
      return;
    }
    elapsed.current += dt;
    if (elapsed.current < 0.05) return;
    const step = elapsed.current;
    elapsed.current = 0;
    if (previousTarget.current !== target) {
      initialized.current = false;
      previousTarget.current = target;
    }
    const live = target.live ? window.__planetPositions?.get(target.live) : null;
    if (live) vectors.point.copy(live);
    else vectors.point.fromArray(target.position);
    const size = ((target.live && window.__exoSizes?.get(target.live)) || 0) * 8 || target.scale;
    vectors.delta.subVectors(vectors.point, camera.position);
    const distance = Math.max(vectors.delta.length(), 1e-12),
      scale = Math.max(size, 1e-12);
    vectors.right.setFromMatrixColumn(camera.matrixWorld, 0);
    const pan = vectors.right.dot(vectors.delta) / distance;
    const movement = initialized.current
      ? vectors.previous.distanceTo(camera.position) /
        Math.max(distance, scale) /
        Math.max(step, 0.01)
      : 0;
    vectors.previous.copy(camera.position);
    initialized.current = true;
    objectAudio.update(
      1 / (1 + Math.log1p(distance / scale)),
      pan * 0.7,
      Math.min(1, movement * 0.13),
    );
  });
  return null;
}

function AudioSpectrum({ active }: { active: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current,
      ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    let frame = 0,
      last = 0;
    const bins = new Uint8Array(128);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const draw = (now: number) => {
      if (now - last > (reduced ? 500 : 80)) {
        last = now;
        ctx.clearRect(0, 0, 280, 40);
        const analyser = active ? objectAudio.analyser : null;
        bins.fill(0);
        analyser?.getByteFrequencyData(bins);
        for (let i = 0; i < 56; i++) {
          const value = bins[Math.floor(Math.pow(i / 55, 1.6) * 100)] / 255;
          const h = Math.max(1, value * 34);
          ctx.fillStyle = active ? "rgba(235,238,245,.8)" : "rgba(235,238,245,.2)";
          ctx.fillRect(i * 5, (40 - h) / 2, 2, h);
        }
      }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [active]);
  return <canvas ref={ref} width={280} height={40} className="h-10 w-full" aria-hidden="true" />;
}

export function ObjectAudioControl() {
  const [open, setOpen] = useState(false);
  const on = useStore((s) => s.musicOn),
    hidden = useStore((s) => s.uiHidden);
  const audio = useObjectAudio();
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (!panel.current?.contains(e.target as Node)) setOpen(false);
    };
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        panel.current?.querySelector<HTMLButtonElement>("[data-audio-settings]")?.focus();
      }
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);
  const descent = useBlackHoleJourney((s) => s.mode);
  const retry = on && (audio.status === "paused" || audio.status === "blocked");
  const toggle = () => {
    if (on && !retry) {
      useStore.setState({ musicOn: false });
      objectAudio.stop();
    } else {
      // Start in the trusted click, before any asynchronous work or React effect.
      void objectAudio.start().then((ok) => {
        if (ok) useStore.setState({ musicOn: true });
      });
    }
  };
  const playing = on && audio.status === "playing";
  const control =
    "grid min-h-11 min-w-11 place-items-center rounded-md text-white/70 transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white";
  if (descent !== "idle") return null;
  return (
    <div
      ref={panel}
      className="pointer-events-auto fixed bottom-5 left-4 z-40 text-white sm:left-6"
      onPointerDown={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
    >
      {open && !hidden && (
        <section
          id="universe-audio-panel"
          aria-label="Universe audio settings"
          className="mb-2 max-h-[min(600px,78dvh)] w-[min(330px,calc(100vw-32px))] overflow-y-auto rounded-xl border border-white/15 bg-[#101113] p-5 shadow-2xl"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[.2em] text-white/50">
              <Headphones size={14} /> Listening room
            </div>
            <button
              className={control}
              aria-label="Close audio settings"
              onClick={() => setOpen(false)}
            >
              <X size={16} />
            </button>
          </div>
          <h2 className="mt-2 text-xl font-light leading-tight">
            {audio.profile?.name ?? "Open space"}
          </h2>
          <div role="status" className="mt-2 text-xs text-white/50">
            {audio.status === "blocked"
              ? "Playback unavailable. Tap play to retry."
              : audio.status === "paused"
                ? "Paused while this tab is hidden"
                : playing
                  ? "Playing · follows your selection"
                  : "Sound is off · tap play to listen"}
          </div>
          <AudioSpectrum active={playing} />
          <button
            onClick={toggle}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-medium text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            {on && !retry ? <Pause size={16} /> : <Play size={16} />}
            {retry ? "Resume soundscape" : on ? "Pause soundscape" : "Play soundscape"}
          </button>
          <label
            className="mt-5 flex justify-between text-xs text-white/70"
            htmlFor="universe-audio-volume"
          >
            <span>Volume</span>
            <span>{Math.round(audio.volume * 100)}%</span>
          </label>
          <input
            id="universe-audio-volume"
            type="range"
            min={0}
            max={100}
            value={Math.round(audio.volume * 100)}
            onChange={(e) => audio.set({ volume: Number(e.target.value) / 100 })}
            className="my-1 h-11 w-full accent-white"
          />
          <fieldset>
            <legend className="mb-2 text-xs text-white/70">Listening style</legend>
            <div className="grid grid-cols-2 gap-1 rounded-md border border-white/15 p-1">
              {(["cinematic", "focus"] as const).map((mode) => (
                <label
                  key={mode}
                  className={
                    "flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded text-xs " +
                    (audio.mode === mode ? "bg-white/10 text-white" : "text-white/50")
                  }
                >
                  <input
                    type="radio"
                    name="universe-listening-style"
                    value={mode}
                    checked={audio.mode === mode}
                    onChange={() => audio.set({ mode })}
                    className="accent-white"
                  />
                  {mode === "focus" ? "Signal focus" : "Cinematic"}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="my-3 flex min-h-11 cursor-pointer items-center justify-between gap-3 text-xs text-white/75">
            Spatial listening
            <input
              type="checkbox"
              checked={audio.spatial}
              onChange={(e) => audio.set({ spatial: e.target.checked })}
              className="h-4 w-4 accent-white"
            />
          </label>
          <p className="text-[11px] leading-relaxed text-white/50">
            Direction, distance and movement gently shape the mix. Headphones reveal the stereo
            space. Signal focus reduces the cinematic bed; it does not turn synthesis into recorded
            data.
          </p>
          <details className="mt-4 border-t border-white/10 pt-3 text-[11px] leading-relaxed text-white/55">
            <summary className="min-h-11 cursor-pointer text-white/80">What am I hearing?</summary>
            <p>{audio.profile?.explanation}</p>
            <p className="mt-2">
              Original synthesized audio. Sound does not travel through interplanetary vacuum.
            </p>
            {audio.profile && (
              <a
                href={audio.profile.source}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex min-h-11 items-center underline underline-offset-4"
              >
                {audio.profile.sourceTitle} ↗
              </a>
            )}
          </details>
        </section>
      )}
      <div className="inline-flex items-center rounded-lg border border-white/15 bg-[#101113] p-1 shadow-lg">
        <button
          className={control}
          onClick={toggle}
          aria-label={
            retry ? "Resume universe sound" : on ? "Mute universe sound" : "Play universe sound"
          }
          aria-pressed={on}
          title={on ? "Mute sound" : "Listen to the universe"}
        >
          {on ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
        {!hidden && (
          <button
            data-audio-settings
            className={control + " gap-2 px-3 sm:flex"}
            aria-label="Open universe audio settings"
            aria-expanded={open}
            aria-controls="universe-audio-panel"
            onClick={() => setOpen(!open)}
          >
            <span className="hidden text-xs sm:inline">Listen</span>
            <Settings2 size={15} />
          </button>
        )}
      </div>
    </div>
  );
}
