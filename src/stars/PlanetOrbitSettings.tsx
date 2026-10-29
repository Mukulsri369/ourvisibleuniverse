import { useStore } from "./store";
import { SOLAR_ORBIT_NAMES } from "./planet-orbit-controls";
export function PlanetOrbitSettings() {
  const speeds = useStore((s) => s.planetOrbitSpeeds);
  const set = useStore((s) => s.setPlanetOrbitSpeed);
  return (
    <details className="mb-4 border-t border-white/10 pt-4">
      <summary className="min-h-11 cursor-pointer text-xs text-white/85">
        Planet orbital speeds
      </summary>
      <p className="mb-3 text-[11px] leading-relaxed text-white/50">
        Each planet has its own speed around the Sun. Moon orbits and the Sun’s galactic travel keep
        their own time.
      </p>
      {SOLAR_ORBIT_NAMES.map((name) => {
        const rate = speeds[name] ?? 1;
        const id = "planet-orbit-speed-" + name.toLowerCase();
        return (
          <section key={name} aria-label={name + " orbital speed"} className="mb-4 space-y-2">
            <label htmlFor={id} className="flex justify-between text-xs text-white/80">
              <span>{name}</span>
              <output className="tabular-nums text-sky-200">
                {rate === 0
                  ? "Paused"
                  : rate.toLocaleString(undefined, { maximumFractionDigits: 2 }) + "×"}
              </output>
            </label>
            <input
              id={id}
              aria-label={name + " orbital speed"}
              type="range"
              min={-2}
              max={Math.log10(2000)}
              step={0.01}
              value={Math.log10(Math.max(0.01, rate))}
              onChange={(e) => set(name, 10 ** Number(e.target.value))}
              className="w-full accent-sky-300"
            />
            <div className="flex gap-2">
              {[0, 1, 10, 100].map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={rate === value}
                  onClick={() => set(name, value)}
                  className="min-h-11 rounded border border-white/15 px-3 text-[11px] text-white/75 hover:bg-white/10"
                >
                  {value === 0 ? "Pause" : value === 1 ? "1×" : value + "×"}
                </button>
              ))}
            </div>
          </section>
        );
      })}
      <button
        type="button"
        onClick={() => useStore.getState().resetPlanetOrbitSpeeds()}
        className="min-h-11 w-full rounded border border-white/20 px-3 text-xs text-white/80 hover:bg-white/10"
      >
        Reset all planet speeds
      </button>
    </details>
  );
}
