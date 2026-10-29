import { useBlackHoleJourney } from "./black-hole-journey";
import { useExploration } from "./exploration-scope";
import { useGalaxyJourney } from "./galaxy-journey";
import { useNebulaJourney } from "./nebula-journey";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  CornerUpLeft,
  CornerDownLeft,
  X,
} from "lucide-react";
import { useStore } from "./store";
import { setFreeLookInput } from "./free-look-input";

const DIRECTIONS = [
  { code: "KeyQ", label: "Move down", Icon: CornerDownLeft, key: "Q" },
  { code: "KeyW", label: "Move forward", Icon: ArrowUp, key: "W" },
  { code: "KeyE", label: "Move up", Icon: CornerUpLeft, key: "E" },
  { code: "KeyA", label: "Move left", Icon: ArrowLeft, key: "A" },
  { code: "KeyS", label: "Move backward", Icon: ArrowDown, key: "S" },
  { code: "KeyD", label: "Move right", Icon: ArrowRight, key: "D" },
] as const;

export function FreeLookControls({ onOpenSettings }: { onOpenSettings?: () => void }) {
  const mapOpen = useExploration((s) => s.mapOpen);
  const active = useStore((s) => s.cameraFree);
  const galaxyMode = useGalaxyJourney((s) => s.mode);
  const nebulaMode = useNebulaJourney((s) => s.mode);
  const blackHoleMode = useBlackHoleJourney((s) => s.mode);
  const hidden = useStore((s) => s.uiHidden);
  const galaxyPassage = galaxyMode !== "idle",
    nebulaPassage = nebulaMode !== "idle";
  const inPassage = galaxyPassage || nebulaPassage;
  const speed = useStore((s) => s.freeLookSpeed);
  const flying =
    !["idle", "inside"].includes(galaxyMode) ||
    !["idle", "inside"].includes(nebulaMode) ||
    blackHoleMode !== "idle";
  if (!active)
    return hidden && !flying ? (
      <button
        type="button"
        aria-label="Enter free look (F)"
        onClick={() => useStore.getState().toggleCameraFree()}
        className="pointer-events-auto fixed left-4 top-5 z-40 min-h-11 rounded-xl bg-neutral-950 px-4 text-sm text-white"
      >
        Free look
      </button>
    ) : null;
  return (
    <section
      aria-label="Free look navigation"
      aria-hidden={!active}
      inert={!active}
      style={{ visibility: active ? "visible" : "hidden" }}
      className={
        (inPassage
          ? "fixed bottom-6 right-4 z-30 w-[calc(100vw-2rem)] max-w-[440px] "
          : "fixed bottom-24 left-1/2 z-30 w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 sm:w-auto ") +
        (mapOpen ? "max-sm:hidden " : "") +
        "flex flex-col items-center gap-3 sm:flex-row rounded-2xl border border-sky-200/20 bg-neutral-950/95 p-3 text-white shadow-2xl"
      }
    >
      <div className="max-w-80 pr-8 sm:max-w-48 sm:pr-0">
        <div className="flex items-center gap-2 text-xs font-medium text-sky-100">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-300" />
          Free look
          <button
            type="button"
            aria-label="Free look movement settings"
            onClick={onOpenSettings}
            className="min-h-11 rounded px-2 font-mono text-sky-200/80 underline decoration-sky-200/30 underline-offset-4 focus-visible:outline focus-visible:outline-sky-300"
          >
            {speed.toFixed(speed < 1 ? 2 : 1)}×
          </button>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-white/60">
          Drag to look · WASD to travel
          <br />Q / E down / up · Shift to boost
        </p>
        <p className="mt-1 hidden text-[10px] text-white/40 sm:block">
          Wheel moves forward / back. F or Esc returns to orbit.
        </p>
      </div>
      <div className="grid shrink-0 grid-cols-3 gap-1">
        {DIRECTIONS.map(({ code, label, Icon, key }) => (
          <button
            key={code}
            type="button"
            aria-label={label}
            title={label}
            className="relative grid h-11 w-11 touch-none select-none place-items-center rounded-lg border border-white/10 bg-white/5 text-white/70 transition hover:bg-sky-300/15 active:bg-sky-300/25 focus-visible:outline focus-visible:outline-sky-300"
            onPointerDown={(e) => {
              e.preventDefault();
              e.currentTarget.setPointerCapture(e.pointerId);
              setFreeLookInput(code, true);
            }}
            onPointerUp={() => setFreeLookInput(code, false)}
            onPointerCancel={() => setFreeLookInput(code, false)}
            onLostPointerCapture={() => setFreeLookInput(code, false)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setFreeLookInput(code, true);
              }
            }}
            onKeyUp={() => setFreeLookInput(code, false)}
            onBlur={() => setFreeLookInput(code, false)}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            <span className="absolute bottom-0.5 right-1 text-[8px] text-white/40">{key}</span>
          </button>
        ))}
      </div>
      <button
        type="button"
        aria-label="Return to orbit"
        title="Return to orbit (F)"
        onClick={() => useStore.getState().toggleCameraFree()}
        className="absolute right-1 top-1 min-h-11 min-w-11 rounded-lg p-2 sm:static sm:self-start text-white/50 transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-sky-300"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </section>
  );
}
