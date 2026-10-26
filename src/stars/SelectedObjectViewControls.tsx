import { DEFAULT_OBJECT_VIEW, useObjectView, type ObjectView } from "./object-view-settings";
import { NEBULA_ROUTES } from "./nebula-journey-profiles";
export function SelectedObjectViewControls({ id }: { id: string }) {
  const view = useObjectView((s) => s.views[id] ?? DEFAULT_OBJECT_VIEW);
  const set = (patch: Partial<ObjectView>) => useObjectView.getState().set(id, patch);
  const nebula = !!NEBULA_ROUTES[id];
  const sliders: [keyof Omit<ObjectView, "auto">, string, number, number, number][] = [
    ["exposure", "Exposure (EV)", -3, 3, 0.05],
    ["brightness", "Brightness", 0.2, 2, 0.05],
    ["contrast", "Contrast", 0.65, 1.5, 0.05],
    ...(nebula
      ? ([
          ["dust", "Dust opacity", 0.15, 2, 0.05],
          ["stars", "Starlight", 0.2, 3, 0.05],
        ] as [keyof Omit<ObjectView, "auto">, string, number, number, number][])
      : []),
  ];
  return (
    <details className="mt-4 rounded-xl border border-white/15 bg-white/[.03] p-3 text-xs">
      <summary className="cursor-pointer py-1 text-white/85">Adjust this object’s view</summary>
      <p className="mt-2 text-[10px] leading-relaxed text-white/45">
        Saved for this object. Global display settings stay unchanged.
      </p>
      {nebula && (
        <label className="mt-3 flex items-center justify-between gap-3 text-white/75">
          Balanced nebula lighting
          <input
            type="checkbox"
            checked={view.auto}
            onChange={(e) => set({ auto: e.target.checked })}
          />
        </label>
      )}
      {sliders.map(([key, label, min, max, step]) => (
        <label key={key} className="mt-3 block text-white/70">
          <span className="flex justify-between">
            <span>{label}</span>
            <output>
              {view[key].toFixed(2)}
              {key === "exposure" ? " EV" : "×"}
            </output>
          </span>
          <input
            className="mt-2 w-full accent-cyan-200"
            aria-label={label + " for selected object"}
            type="range"
            min={min}
            max={max}
            step={step}
            value={view[key]}
            onChange={(e) => set({ [key]: Number(e.target.value) })}
          />
        </label>
      ))}
      <div className="mt-3 flex flex-wrap gap-2">
        {nebula && (
          <button
            className="rounded border border-white/20 px-3 py-2 hover:bg-white/10"
            onClick={() =>
              set({ dust: 0.4, stars: 1.6, exposure: 0, brightness: 1, contrast: 1, auto: true })
            }
          >
            Interior clarity
          </button>
        )}
        <button
          className="rounded border border-white/20 px-3 py-2 hover:bg-white/10"
          onClick={() => useObjectView.getState().reset(id)}
        >
          Reset this object
        </button>
      </div>
    </details>
  );
}
