import { AnimatePresence, motion } from "framer-motion";
import { OBJECT_BY_ID } from "./observed-objects";
import { useStore } from "./store";

function distanceLabel(v: number) {
  if (v >= 1e9) return `${(v / 1e9).toFixed(2)} billion ly`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(1)} million ly`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(1)}k ly`;
  return `${v.toLocaleString()} ly`;
}
function sizeLabel(v: number) {
  if (v >= 1) return `${v.toLocaleString()} ly`;
  const km = v * 9.4607e12;
  if (km < 1e6) return `${Math.round(km).toLocaleString()} km`;
  return `${v.toExponential(2)} ly`;
}

export function ObservedObjectInfoPanel() {
  const selectedId = useStore((s) => s.selectedObjectId);
  const select = useStore((s) => s.setSelectedObject);
  const item = selectedId ? OBJECT_BY_ID.get(selectedId) : undefined;
  return (
    <AnimatePresence>
      {item && (
        <motion.aside
          onClick={(e) => e.stopPropagation()}
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="pointer-events-auto fixed right-0 top-0 z-30 h-full w-full max-w-[390px] overflow-y-auto border-l border-white/10 bg-black/80 p-7 text-white backdrop-blur-xl"
        >
          <button
            onClick={() => select(null)}
            aria-label="Close object details"
            className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
          <div className="text-[10px] uppercase tracking-[0.25em] text-white/40">
            NASA-observed object
          </div>
          <h2 className="mt-1 pr-10 text-3xl font-light">{item.name}</h2>
          <div className="mt-1 text-xs uppercase tracking-[0.18em] text-white/45">
            {item.subtype}
          </div>
          <div className="mt-6 grid grid-cols-2 gap-y-4">
            <Stat label="Category" value={item.category} />
            <Stat label="Distance" value={distanceLabel(item.distance)} />
            <Stat label="Physical size" value={sizeLabel(item.diameterLy)} />
            <Stat label="Galactic l, b" value={`${item.l.toFixed(1)}°, ${item.b.toFixed(1)}°`} />
          </div>
          <div className="my-6 h-px bg-white/10" />
          <p className="text-sm leading-relaxed text-white/75">{item.description}</p>
          <div className="mt-7 text-[10px] uppercase tracking-[0.2em] text-white/40">
            Observed properties
          </div>
          <ul className="mt-3 space-y-2">
            {item.properties.map((p) => (
              <li
                key={p}
                className="border-l border-white/20 pl-3 text-xs leading-relaxed text-white/70"
              >
                {p}
              </li>
            ))}
          </ul>
          <div className="mt-7 rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">
              Visual interpretation
            </div>
            <p className="mt-2 text-xs leading-relaxed text-white/65">{item.visualNote}</p>
          </div>
          <div className="mt-5 text-[11px] text-white/45">
            <span className="text-white/65">Observed in:</span> {item.observed}
          </div>
          <div className="mt-2 text-[11px] text-white/45">
            <span className="text-white/65">Reference:</span> {item.source}
          </div>
          {item.aliases.length > 0 && (
            <div className="mt-2 text-[11px] text-white/45">
              <span className="text-white/65">Catalog IDs:</span> {item.aliases.join(" · ")}
            </div>
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">{label}</div>
      <div className="mt-1 text-sm font-light text-white/90">{value}</div>
    </div>
  );
}
