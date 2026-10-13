import { AnimatePresence, motion } from "framer-motion";
import { HideablePanel, NasaResources } from "./NasaResources";
import { AU, MOON_DAYS, PLANETS, REAL_ORBITS } from "./Planets";
import { useStore } from "./store";

const fmtDays = (d: number) =>
  Math.abs(d) < 2
    ? `${(Math.abs(d) * 24).toFixed(1)} h`
    : Math.abs(d) < 800
      ? `${Math.abs(d).toFixed(2)} days`
      : `${(Math.abs(d) / 365.25).toFixed(2)} yr`;

/** Details for the Solar System planet or moon being visited. */
export function SolarBodyPanel() {
  const visit = useStore((s) => s.visitPlanet);
  const exo = useStore((s) => s.exoVisit);
  const setVisit = useStore((s) => s.setVisitPlanet);
  if (!visit || exo) return null;
  const [parentName, moonName] = visit.split(":");
  const planet = PLANETS.find((p) => p.name === parentName);
  if (!planet) return null;
  const moon = moonName ? planet.moons?.find((m) => m.name === moonName) : undefined;
  const orbit = REAL_ORBITS[planet.name];
  const title = moon ? moon.name : planet.name;
  const md = moon ? MOON_DAYS[moon.name] : undefined;
  return (
    <AnimatePresence>
      <HideablePanel resetKey={visit} label={title}>
        {(hide) => (
          <motion.aside
            key={visit}
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed right-0 top-0 z-30 h-full w-full max-w-[380px] overflow-y-auto border-l border-white/10 p-7 text-white"
            style={{
              background: "rgba(8,10,24,0.78)",
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
            }}
          >
            {hide}
            <button
              onClick={() => setVisit(moon ? planet.name : null)}
              aria-label="Close"
              className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              ✕
            </button>
            <div className="text-xs uppercase tracking-[0.25em] text-white/40">
              {moon ? `Moon of ${planet.name}` : "Solar System planet"}
            </div>
            <h2 className="mt-2 text-3xl font-light">{title}</h2>
            <NasaResources name={title} query={moon ? `${moon.name} moon` : planet.name} />
            {!moon && (
              <p className="mt-3 text-sm leading-relaxed text-white/70">{planet.description}</p>
            )}
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              {moon ? (
                <>
                  <Stat label="Orbits" value={planet.name} />
                  {md !== undefined && <Stat label="Orbital period" value={fmtDays(md)} />}
                  {md !== undefined && (
                    <Stat label="Direction" value={md < 0 ? "Retrograde" : "Prograde"} />
                  )}
                </>
              ) : (
                <>
                  <Stat label="Distance" value={`${(planet.a / AU).toFixed(2)} AU`} />
                  <Stat label="Eccentricity" value={planet.e.toFixed(4)} />
                  {orbit && <Stat label="Year" value={fmtDays(orbit.years * 365.25)} />}
                  {orbit && (
                    <Stat
                      label="Day (sidereal)"
                      value={`${fmtDays(orbit.rotH / 24)}${orbit.rotH < 0 ? " retro." : ""}`}
                    />
                  )}
                  <Stat
                    label="Axial tilt"
                    value={`${((planet.tilt * 180) / Math.PI).toFixed(1)}°`}
                  />
                  <Stat label="Moons shown" value={`${planet.moons?.length ?? 0}`} />
                </>
              )}
            </div>
            {!moon && planet.moons?.length ? (
              <div className="mt-5">
                <div className="text-[10px] uppercase tracking-wider text-white/40">
                  Visit a moon
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {planet.moons.map((m) => (
                    <button
                      key={m.name}
                      onClick={() => setVisit(`${planet.name}:${m.name}`)}
                      className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] text-white/80 hover:bg-white/15"
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            <p className="mt-5 text-[11px] leading-relaxed text-white/40">
              Positions are computed for today's date from real orbital elements; speeds use real
              orbital and rotation periods.
            </p>
          </motion.aside>
        )}
      </HideablePanel>
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
