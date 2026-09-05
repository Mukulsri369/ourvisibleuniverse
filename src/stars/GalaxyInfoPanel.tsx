import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "./store";
import { GALAXY_BY_NAME } from "./galaxy-models";
import { ANDROMEDA_NAME, M31_AU, M31_PLANETS, PA99N2_STAR } from "./andromeda-data";
import { NAMED_GALAXIES } from "./Universe";

export function formatLy(v: number): string {
  if (v >= 1e9) return `${(v / 1e9).toFixed(2)} Gly`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(2)} Mly`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(1)}k ly`;
  return `${Math.round(v)} ly`;
}

/** Galaxies that are built out as full particle models with a visitable star system. */
export function isDetailedGalaxy(name: string): boolean {
  return name === ANDROMEDA_NAME || GALAXY_BY_NAME.has(name);
}

/** Detailed galaxies first (particle models + star systems), then by distance. */
export function galaxyOrder<T extends { name: string; distance: number }>(a: T, b: T): number {
  const da = isDetailedGalaxy(a.name) ? 0 : 1;
  const db = isDetailedGalaxy(b.name) ? 0 : 1;
  if (da !== db) return da - db;
  return a.distance - b.distance;
}

type SystemView = {
  star: { name: string; spectral: string; mass: string; description: string };
  planets: Array<{ name: string; au: number; confirmed: boolean; moons: number; description: string }>;
};

function systemFor(name: string): SystemView | null {
  if (name === ANDROMEDA_NAME) {
    return {
      star: PA99N2_STAR,
      planets: M31_PLANETS.map((p) => ({
        name: p.name,
        au: p.a / M31_AU,
        confirmed: p.confirmed,
        moons: p.moons?.length ?? 0,
        description: p.description,
      })),
    };
  }
  const m = GALAXY_BY_NAME.get(name);
  const galaxySystem = m?.system;
  if (!galaxySystem) return null;
  return {
    star: galaxySystem.star,
    planets: galaxySystem.planets.map((p) => ({
      name: p.name,
      au: p.a / galaxySystem.au,
      confirmed: p.confirmed,
      moons: p.moons?.length ?? 0,
      description: p.description,
    })),
  };
}

function overviewFor(name: string, type: string, distance: number, size: number): string {
  if (name === ANDROMEDA_NAME)
    return "The Andromeda Galaxy is the largest member of the Local Group and our nearest large spiral, sweeping about 220,000 light-years across with roughly a trillion stars. It is approaching the Milky Way at some 110 km/s and will merge with it in about 4.5 billion years. Andromeda is the only galaxy beyond our own with a widely discussed planet candidate, PA-99-N2 b, found by gravitational microlensing.";
  const m = GALAXY_BY_NAME.get(name);
  if (m) return m.description;
    return `${name} is a ${type.toLowerCase()} galaxy about ${formatLy(distance)} away, spanning roughly ${formatLy(
    size,
  )}. Its stars are shown as a detailed particle model at the galaxy's measured position and physical scale. No individual exoplanet system has been resolved there, so none is invented.`;
}

export function GalaxyInfoPanel() {
  const visit = useStore((s) => s.visitGalaxy);
  const setVisitGalaxy = useStore((s) => s.setVisitGalaxy);

  const g = visit ? NAMED_GALAXIES.find((n) => n.name === visit.name) : null;
  const system = visit ? systemFor(visit.name) : null;
  const detailed = visit ? isDetailedGalaxy(visit.name) : false;

  return (
    <AnimatePresence>
      {visit && (
        <motion.aside
          onClick={(e) => e.stopPropagation()}
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="pointer-events-auto fixed right-0 top-0 z-30 h-full w-full max-w-[380px] overflow-y-auto border-l border-white/10 p-7 text-white"
          style={{ background: "rgba(8,10,24,0.78)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)" }}
        >
          <button
            onClick={() => setVisitGalaxy(null)}
            aria-label="Close"
            className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
          <div className="text-[10px] uppercase tracking-[0.25em] text-white/40">Now Viewing</div>
          <h2 className="mt-1 pr-10 text-3xl font-light tracking-wide">{visit.name}</h2>
          <div className="mt-1 text-xs uppercase tracking-[0.2em] text-white/40">
            {visit.type}
            {detailed && <span className="ml-2 text-white/60">✦ Fully modelled</span>}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-y-4 text-sm">
            <GStat label="Distance" value={formatLy(visit.distance)} />
            <GStat label="Diameter" value={formatLy(visit.size)} />
            {g && <GStat label="Galactic l, b" value={`${g.l.toFixed(1)}°, ${g.b.toFixed(1)}°`} />}
            {g?.inclination !== undefined && <GStat label="Inclination" value={`${g.inclination}°`} />}
            <GStat label="Light travel time" value={`${formatLy(visit.distance).replace(" ly", " yr").replace("ly", "yr")}`} />
            <GStat label="Star system" value={system ? system.star.name : "Not modelled"} />
          </div>

          <div className="my-6 h-px bg-white/10" />
          <p className="text-sm leading-relaxed text-white/75">
            {overviewFor(visit.name, visit.type, visit.distance, visit.size)}
          </p>

          {system ? (
            <>
              <div className="mt-7 text-xs uppercase tracking-[0.2em] text-white/40">Host star</div>
              <div className="mt-2 text-base font-light">{system.star.name}</div>
              <div className="text-[11px] text-white/45">
                {system.star.spectral} · {system.star.mass}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-white/70">{system.star.description}</p>

              <div className="mt-7 text-xs uppercase tracking-[0.2em] text-white/40">
                Planets ({system.planets.length})
              </div>
              <ul className="mt-3 space-y-3">
                {system.planets.map((p) => (
                  <li key={p.name} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-sm text-white/90">{p.name}</span>
                      <span className="shrink-0 text-[10px] text-white/40">{p.au.toFixed(2)} AU</span>
                    </div>
                    <div className="mt-0.5 text-[10px] uppercase tracking-[0.15em] text-white/40">
                      {p.confirmed ? "Observed candidate" : "Modelled world"}
                      {p.moons > 0 && ` · ${p.moons} moon${p.moons > 1 ? "s" : ""}`}
                    </div>
                    <p className="mt-1.5 text-[12px] leading-relaxed text-white/65">{p.description}</p>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-[11px] leading-relaxed text-white/40">
                Only a couple of extragalactic planet candidates are known (PA-99-N2 b in Andromeda and M51-ULS-1b in
                the Whirlpool). Systems marked "modelled" are built around real catalogued stars in each galaxy, with
                plausible planetary architectures for scale.
              </p>
            </>
          ) : (
            <p className="mt-6 text-[12px] leading-relaxed text-white/45">
              No exoplanets or individual star systems have been resolved in this galaxy yet. The visible stellar
              population is a morphology-based particle reconstruction; no fictional planetary system has been added.
            </p>
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function GStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">{label}</div>
      <div className="mt-1 text-base font-light">{value}</div>
    </div>
  );
}
