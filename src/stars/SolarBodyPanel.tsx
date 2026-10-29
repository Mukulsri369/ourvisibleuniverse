import { AnimatePresence, motion } from "framer-motion";
import { HideablePanel, NasaResources } from "./NasaResources";
import { AU, MOON_DAYS, PLANETS, REAL_ORBITS } from "./Planets";
import { useStore } from "./store";
import { getSimulationDate, getPlanetSimulationJd } from "./sim-clock";
import { jplEphemerisManager } from "@/lib/astronomy/jpl/ephemeris-cache";
import { JPL_PLANETS_PHYSICAL } from "@/lib/astronomy/jpl/planetary-physical-data";
import { FileText } from "lucide-react";
import { createTargetFromPlanet } from "./universal-target-factory";

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

  // Authoritative physical data from JPL
  const planetPhys = JPL_PLANETS_PHYSICAL[planet.name];
  const moonPhys = planetPhys?.moons.find((m) => m.name === moonName);

  // Live ephemeris state
  const jd = getPlanetSimulationJd(planet.name);
  let state = null;
  try {
    state = jplEphemerisManager.getPlanetState(planet.name, jd);
  } catch {
    /* fallback */
  }

  // Interplanetary distance to Earth
  let earthDist = null;
  if (!moon && planet.name !== "Earth") {
    try {
      earthDist = jplEphemerisManager.computeDistance(
        "Earth",
        planet.name,
        getPlanetSimulationJd("Earth"),
        jd,
      );
    } catch {
      /* fallback */
    }
  }

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
            className="fixed right-0 top-0 z-30 h-full w-full max-w-[390px] overflow-y-auto border-l border-white/10 p-7 text-white"
            style={{
              background: "rgba(8,10,24,0.85)",
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

            {/* Provenance badge */}
            <div className="flex items-center gap-2">
              <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                NASA JPL DE440
              </span>
              <span className="text-[11px] text-white/40">
                {moon ? `Moon of ${planet.name}` : `${planetPhys?.type ?? "planet"} world`}
              </span>
            </div>

            <h2 className="mt-2 text-3xl font-light">{title}</h2>

            <NasaResources name={title} query={moon ? `${moon.name} moon` : planet.name} />

            <button
              onClick={() => {
                const t = createTargetFromPlanet(planet.name, moon?.name);
                if (t) useStore.getState().setActiveUniversalTarget(t);
              }}
              className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-xs font-mono font-medium text-white/90 transition hover:bg-white/10"
            >
              <FileText className="h-4 w-4 text-cyan-300" />
              <span>Open 7-Tab Science Dossier</span>
            </button>

            <p className="mt-3 text-sm leading-relaxed text-white/70">
              {moon
                ? (moonPhys?.description ?? "Natural satellite")
                : (planetPhys?.description ?? planet.description)}
            </p>

            {/* Dynamic Ephemeris State Vectors */}
            {state && (
              <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-[10px] uppercase tracking-wider text-emerald-400 font-medium">
                  Instantaneous Ephemeris State (JPL)
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-white/40">Sun Distance:</span>{" "}
                    <span className="font-mono text-white/90">
                      {state.distanceSunAu.toFixed(3)} AU
                    </span>
                  </div>
                  <div>
                    <span className="text-white/40">Orbital Speed:</span>{" "}
                    <span className="font-mono text-white/90">
                      {state.speedKmS.toFixed(2)} km/s
                    </span>
                  </div>
                  {earthDist && (
                    <div className="col-span-2">
                      <span className="text-white/40">Earth Distance:</span>{" "}
                      <span className="font-mono text-cyan-300">
                        {earthDist.distanceAu.toFixed(3)} AU ({earthDist.lightTravelTimeFormatted})
                      </span>
                    </div>
                  )}
                  <div className="col-span-2 text-[10px] text-white/40">
                    Barycentric: X: {state.xAu.toFixed(3)} · Y: {state.yAu.toFixed(3)} · Z:{" "}
                    {state.zAu.toFixed(3)} AU
                  </div>
                </div>
              </div>
            )}

            {/* Scientific Physical Properties */}
            <div className="mt-5 grid grid-cols-2 gap-2.5 text-sm">
              {moon ? (
                <>
                  <Stat label="Orbits" value={planet.name} />
                  <Stat
                    label="Orbital Period"
                    value={fmtDays(moonPhys?.orbitalPeriodDays ?? md ?? 0)}
                  />
                  <Stat
                    label="Direction"
                    value={
                      (moonPhys?.orbitalPeriodDays ?? md ?? 1) < 0 ? "Retrograde ↺" : "Prograde ↻"
                    }
                  />
                  <Stat
                    label="Inclination (Laplace)"
                    value={`${(moonPhys?.inclinationDeg ?? ((moon.inclination ?? 0) * 180) / Math.PI).toFixed(2)}°`}
                  />
                  <Stat
                    label="Mean Radius"
                    value={moonPhys ? `${moonPhys.radiusKm.toFixed(1)} km` : "N/A"}
                  />
                  <Stat
                    label="Orbit Semi-Major"
                    value={moonPhys ? `${(moonPhys.semiMajorAxisKm / 1e3).toFixed(1)}k km` : "N/A"}
                  />
                  <Stat
                    label="Tidal Locking"
                    value={moonPhys?.tidallyLocked ? "1:1 Synchronous" : "Asynchronous"}
                  />
                </>
              ) : (
                <>
                  <Stat
                    label="Mean Radius"
                    value={planetPhys ? `${planetPhys.radiusKm.toLocaleString()} km` : "N/A"}
                  />
                  <Stat label="Semi-Major Axis" value={`${(planet.a / AU).toFixed(3)} AU`} />
                  <Stat label="Eccentricity" value={planet.e.toFixed(4)} />
                  <Stat
                    label="Orbital Period"
                    value={orbit ? fmtDays(orbit.years * 365.25) : "N/A"}
                  />
                  <Stat
                    label="Sidereal Day"
                    value={
                      planetPhys
                        ? `${fmtDays(planetPhys.siderealRotationHours / 24)}${planetPhys.siderealRotationHours < 0 ? " (retro)" : ""}`
                        : "N/A"
                    }
                  />
                  <Stat
                    label="Axial Tilt (Obliquity)"
                    value={
                      planetPhys
                        ? `${planetPhys.axialTiltDeg.toFixed(2)}°`
                        : `${((planet.tilt * 180) / Math.PI).toFixed(1)}°`
                    }
                  />
                  <Stat
                    label="Surface Gravity"
                    value={planetPhys ? `${planetPhys.surfaceGravityMS2.toFixed(2)} m/s²` : "N/A"}
                  />
                  <Stat
                    label="Escape Velocity"
                    value={planetPhys ? `${planetPhys.escapeVelocityKmS.toFixed(1)} km/s` : "N/A"}
                  />
                  <Stat
                    label="Rings Architecture"
                    value={planetPhys?.rings ? planetPhys.rings.features[0] : "None"}
                  />
                  <Stat
                    label="Moons System"
                    value={`${planetPhys?.moons.length ?? planet.moons?.length ?? 0} shown`}
                  />
                </>
              )}
            </div>

            {/* Moon selector */}
            {!moon && planet.moons?.length ? (
              <div className="mt-5">
                <div className="text-[10px] uppercase tracking-wider text-white/40">
                  Visit Moons
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

            {/* NASA Outbound Link */}
            <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
              <a
                href={`https://ssd.jpl.nasa.gov/horizons/app.html#/`}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 text-[11px]"
              >
                View in NASA JPL Horizons Database ↗
              </a>
              <span className="text-[10px] text-white/40">DE440 Standard</span>
            </div>
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
      <div className="mt-0.5 text-white/90 font-medium text-xs truncate">{value}</div>
    </div>
  );
}
