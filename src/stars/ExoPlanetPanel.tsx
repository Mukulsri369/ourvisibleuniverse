import { AnimatePresence, motion } from "framer-motion";
import { exoSystemFor } from "./exosystems";
import { useStore } from "./store";
import { HideablePanel } from "./NasaResources";

/** Flight dossier shown while the camera is visiting an exoplanet. */
export function ExoPlanetPanel() {
  const exo = useStore((s) => s.exoVisit);
  const visitExoPlanet = useStore((s) => s.visitExoPlanet);
  const flyToStar = useStore((s) => s.flyToStar);
  const sys = exo ? exoSystemFor(exo.star) : null;
  const p = sys?.planets.find((x) => x.name === exo?.planet);
  const idx = sys && p ? sys.planets.indexOf(p) : -1;
  const g = p ? p.massEarth / (p.radiusEarth * p.radiusEarth) : 0;
  return (
    <AnimatePresence>
      {exo && sys && p && (
        <HideablePanel resetKey={p.name} label={p.name}>{(hide) => <motion.aside
          key={p.name}
          onClick={(e) => e.stopPropagation()}
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed right-0 top-0 z-30 h-full w-full max-w-[380px] overflow-y-auto border-l border-white/10 p-7 text-white"
          style={{ background: "rgba(8,10,24,0.78)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)" }}
        >
          {hide}
          <button
            onClick={() => flyToStar(exo.star)}
            aria-label="Close"
            className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
          <div className="text-xs uppercase tracking-[0.25em] text-white/40">Exoplanet · {exo.star.name}</div>
          <h2 className="mt-2 text-3xl font-light">{p.name}</h2>
          <div className="mt-3 flex flex-wrap gap-2 text-[10px] uppercase tracking-wider">
            <span className={`rounded-full border px-2 py-0.5 ${p.observed ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300" : "border-white/20 bg-white/5 text-white/60"}`}>
              {p.observed ? "Confirmed (NASA Exoplanet Archive)" : "Modelled"}
            </span>
            <span className="rounded-full border border-sky-400/40 bg-sky-400/10 px-2 py-0.5 text-sky-300">ESI {p.esi.toFixed(2)}</span>
            {p.inHZ && <span className="rounded-full border border-emerald-400/40 px-2 py-0.5 text-emerald-300">Habitable zone</span>}
          </div>
          <p className="mt-4 text-sm leading-relaxed text-white/70">
            A {p.kind.toLowerCase()} orbiting {exo.star.name} ({exo.star.spectral}) {exo.star.distance.toFixed(1)} light years from
            Earth. Surface appearance, orbital phase and spin are models, not resolved observations.
            {!p.observed && " This planet is a physically plausible model, not an observed discovery."}
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <Stat label="Type" value={p.kind} />
            <Stat label="Orbit" value={`${p.aAU.toFixed(3)} AU`} />
            <Stat label="Period" value={p.periodYears < 1 ? `${(p.periodYears * 365.25).toFixed(1)} days` : `${p.periodYears.toFixed(2)} yr`} />
            <Stat label="Eccentricity" value={p.e.toFixed(2)} />
            <Stat label={p.radiusEstimated ? "Radius (est.)" : "Radius"} value={`${p.radiusEarth.toFixed(2)} R⊕`} />
            <Stat label="Mass" value={`${p.massEarth.toFixed(1)} M⊕`} />
            <Stat label="Surface gravity" value={`${g.toFixed(2)} g`} />
            <Stat label="Temperature" value={`${Math.round(p.teqK)} K / ${Math.round(p.teqK - 273.15)} °C`} />
            <Stat label="Rotation" value={p.tidallyLocked ? "Tidally locked" : "Free rotation"} />
            <Stat label="Host star" value={`${Math.round(exo.star.temperature)} K`} />
          </div>
          <div className="mt-6 flex gap-2">
            <button
              disabled={idx <= 0}
              onClick={() => visitExoPlanet(exo.star, sys.planets[idx - 1].name)}
              className="flex-1 rounded-md border border-white/15 bg-white/5 py-2 text-xs text-white/80 transition hover:bg-white/15 disabled:opacity-30"
            >
              ← Inner planet
            </button>
            <button
              disabled={idx >= sys.planets.length - 1}
              onClick={() => visitExoPlanet(exo.star, sys.planets[idx + 1].name)}
              className="flex-1 rounded-md border border-white/15 bg-white/5 py-2 text-xs text-white/80 transition hover:bg-white/15 disabled:opacity-30"
            >
              Outer planet →
            </button>
          </div>
          <button
            onClick={() => flyToStar(exo.star)}
            className="mt-2 w-full rounded-md border border-white/15 bg-white/5 py-2 text-xs text-white/80 transition hover:bg-white/15"
          >
            Return to system orbit
          </button>
          {p.observed && (
            <a
              href={`https://exoplanetarchive.ipac.caltech.edu/overview/${encodeURIComponent(p.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 block w-full rounded-md border border-sky-400/40 bg-sky-400/10 py-2 text-center text-xs text-sky-200 transition hover:bg-sky-400/20"
            >
              Study on NASA Exoplanet Archive ↗
            </a>
          )}
        </motion.aside>}</HideablePanel>
      )}
    </AnimatePresence>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-2.5">
      <div className="text-[10px] uppercase tracking-wider text-white/40">{label}</div>
      <div className="mt-0.5 text-white/90">{value}</div>
    </div>
  );
}
