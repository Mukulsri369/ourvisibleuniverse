import { GalaxyDestinationGrid } from "./GalaxyDestinationGrid";
import { useState } from "react";
import { HideablePanel, NasaResources } from "./NasaResources";
import { AnimatePresence, motion } from "framer-motion";
import { Telescope, ExternalLink, FileText } from "lucide-react";
import { useStore } from "./store";
import { createTargetFromGalaxy } from "./universal-target-factory";
import { GALAXY_BY_NAME } from "./galaxy-models";
import { ANDROMEDA_NAME, M31_AU, M31_PLANETS, PA99N2_STAR } from "./andromeda-data";
import { NAMED_GALAXIES } from "./Universe";
import { getGalaxyByAnyName, type ObservationalGalaxy } from "./galaxy-catalog";
import {
  calculateCosmologicalDistances,
  COSMOLOGICAL_MODELS,
  type CosmologicalParameters,
} from "@/lib/astronomy/cosmology";

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
  planets: Array<{
    name: string;
    au: number;
    confirmed: boolean;
    moons: number;
    description: string;
  }>;
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
  if (name === "Milky Way")
    return "Our home galaxy spans roughly 100,000 light-years. The Sun travels around its center within a barred spiral disk of stars, gas, and dust.";
  if (name === ANDROMEDA_NAME)
    return "The Andromeda Galaxy is the largest member of the Local Group and our nearest large spiral, sweeping about 220,000 light-years across with roughly a trillion stars. It is approaching the Milky Way at some 110 km/s and will merge with it in about 4.5 billion years. Andromeda is the only galaxy beyond our own with a widely discussed planet candidate, PA-99-N2 b, found by gravitational microlensing.";
  const m = GALAXY_BY_NAME.get(name);
  if (m) return m.description;
  return `${name} is an observed ${type.toLowerCase()} galaxy about ${formatLy(distance)} away, spanning roughly ${formatLy(
    size,
  )}. Its data comes from the NASA/IPAC Extragalactic Database (NED). In accordance with observational astrophysics standards, no speculative star systems or exoplanet architectures are invented.`;
}

export function GalaxyInfoPanel() {
  const visit = useStore((s) => s.visitGalaxy);
  const setVisitGalaxy = useStore((s) => s.setVisitGalaxy);
  const cosmologyModelKey = useStore((s) => s.cosmologyModelKey);
  const customCosmology = useStore((s) => s.customCosmology);
  const setObservationModalOpen = useStore((s) => s.setObservationModalOpen);
  const [activeTab, setActiveTab] = useState<
    "overview" | "observation" | "cosmology" | "astrometry" | "system"
  >("overview");

  const g: ObservationalGalaxy | undefined = visit ? getGalaxyByAnyName(visit.name) : undefined;
  const system = visit ? systemFor(visit.name) : null;
  const detailed = visit ? visit.name === "Milky Way" || isDetailedGalaxy(visit.name) : false;

  // Active cosmology parameters
  const cosmologyParams: CosmologicalParameters =
    cosmologyModelKey === "custom"
      ? {
          name: "Custom User Cosmology",
          description: "User-defined FLRW parameter set.",
          h0: customCosmology.h0,
          omegaM: customCosmology.omegaM,
          omegaLambda: customCosmology.omegaLambda,
          citation: "User customized",
          bibcode: "CUSTOM",
        }
      : (COSMOLOGICAL_MODELS[cosmologyModelKey] ?? COSMOLOGICAL_MODELS.planck2018);

  const z =
    g?.redshift ?? (visit ? (visit.distance / 3.26156e6) * (cosmologyParams.h0 / 299792.458) : 0);
  const cosmo = calculateCosmologicalDistances(Math.max(0, z), cosmologyParams);

  return (
    <AnimatePresence>
      {visit && (
        <HideablePanel resetKey={visit.name} label={visit.name}>
          {(hide) => (
            <motion.aside
              onClick={(e) => e.stopPropagation()}
              initial={{ x: 440, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 440, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="pointer-events-auto fixed right-0 top-0 z-30 h-full w-full max-w-[420px] overflow-y-auto border-l border-white/10 p-6 text-white"
              style={{
                background: "rgba(8,10,24,0.85)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                boxShadow: "-8px 0 32px rgba(0,0,0,0.5)",
              }}
            >
              {hide}
              <button
                onClick={() => setVisitGalaxy(null)}
                aria-label="Close"
                className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>

              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.25em] text-white/40">
                  Extragalactic Atlas
                </span>
                {g?.level && (
                  <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-white/80">
                    Level {g.level}
                  </span>
                )}
              </div>

              <h2 className="mt-1 pr-8 text-2xl font-light tracking-wide text-white">
                {visit.name}
              </h2>
              {g?.preferredName && g.preferredName !== visit.name && (
                <div className="text-[11px] font-mono text-sky-300/80">NED: {g.preferredName}</div>
              )}

              <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-white/60">
                <span className="rounded bg-sky-500/15 px-2 py-0.5 font-medium text-sky-300">
                  {g?.morphologyClass ?? visit.type}
                </span>
                {g?.hostGroup && (
                  <span className="rounded bg-white/10 px-2 py-0.5 text-white/80">
                    {g.hostGroup}
                  </span>
                )}
                {detailed ? (
                  <span className="rounded border border-amber-500/30 bg-amber-500/15 px-2 py-0.5 text-amber-300">
                    ✦ Reconstructed 3D Morphology
                  </span>
                ) : (
                  <span className="rounded border border-violet-500/30 bg-violet-500/15 px-2 py-0.5 text-violet-300">
                    ⟳ Reconstructed Structure
                  </span>
                )}
              </div>

              {/* 7-Tab Science Dossier Button */}
              <button
                onClick={() => {
                  const targetGalaxy =
                    g ||
                    ({
                      name: visit.name,
                      preferredName: visit.name,
                      distance: visit.distance,
                      size: visit.size,
                      type: visit.type,
                      morphologyClass: visit.type,
                      redshift: z,
                      l: 0,
                      b: 0,
                    } as any);
                  useStore
                    .getState()
                    .setActiveUniversalTarget(createTargetFromGalaxy(targetGalaxy));
                }}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-xs font-mono font-medium text-white/90 transition hover:bg-white/10"
              >
                <FileText className="h-4 w-4 text-cyan-300" />
                <span>Open 7-Tab Science Dossier</span>
              </button>

              <GalaxyDestinationGrid key={visit.name} name={visit.name} />

              {/* Navigation Tabs */}
              <div className="mt-5 flex border-b border-white/10 text-xs">
                {(["overview", "observation", "cosmology", "astrometry", "system"] as const).map(
                  (tab) => {
                    if (tab === "system" && !system && visit.name !== ANDROMEDA_NAME) return null;
                    const label =
                      tab === "overview"
                        ? "Profile"
                        : tab === "observation"
                          ? "Observation"
                          : tab === "cosmology"
                            ? "Cosmology"
                            : tab === "astrometry"
                              ? "Data"
                              : "Stars & Planets";
                    return (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`relative pb-2.5 pt-1 px-3 uppercase tracking-wider text-[11px] transition ${
                          activeTab === tab
                            ? "font-medium text-sky-400"
                            : "text-white/50 hover:text-white/80"
                        }`}
                      >
                        {label}
                        {activeTab === tab && (
                          <motion.div
                            layoutId="activeTabUnderline"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-400"
                          />
                        )}
                      </button>
                    );
                  },
                )}
              </div>

              {/* Tab: Observation */}
              {activeTab === "observation" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 space-y-4"
                >
                  <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-200 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-cyan-300 font-mono">
                      <Telescope className="size-4" />
                      <span>Empirical Sky Surveys & HiPS Imagery</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-300">
                      Explore multi-wavelength coverage (Optical, Infrared, Ultraviolet, Radio,
                      X-ray) and full-resolution Aladin Lite sky mapping for {visit.name}.
                    </p>
                    <button
                      onClick={() => setObservationModalOpen(true, visit.name)}
                      className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-500 px-3 py-2 text-xs font-mono font-bold text-slate-950 hover:bg-cyan-400 transition shadow-md"
                    >
                      <Telescope className="size-4" />
                      <span>Open Observation & Survey Explorer</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Tab 1: Overview */}
              {activeTab === "overview" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
                  <NasaResources
                    name={visit.name}
                    alt={[`${visit.type} galaxy Hubble`, "galaxy Hubble NASA"]}
                  />

                  <div className="mt-5 grid grid-cols-2 gap-y-3 gap-x-2 text-sm">
                    <GStat label="Measured Distance" value={formatLy(visit.distance)} />
                    <GStat label="Physical Diameter" value={formatLy(visit.size)} />
                    <GStat
                      label="Lookback Time"
                      value={
                        z <= 0
                          ? `${formatLy(visit.distance).replace(" ly", " yr")}`
                          : `${cosmo.lookbackTimeGyr.toFixed(3)} Gyr`
                      }
                    />
                    <GStat
                      label="Redshift (z)"
                      value={
                        g
                          ? g.redshift < 0
                            ? `${g.redshift.toFixed(6)} (Blueshift)`
                            : g.redshift.toFixed(g.redshift > 1 ? 3 : 5)
                          : z.toFixed(4)
                      }
                    />
                  </div>

                  <div className="my-5 h-px bg-white/10" />

                  <p className="text-xs leading-relaxed text-white/75">
                    {overviewFor(visit.name, visit.type, visit.distance, visit.size)}
                  </p>

                  <div className="mt-4 rounded-lg border border-cyan-500/25 bg-cyan-950/30 p-3 text-[11px] leading-relaxed text-cyan-200/90">
                    <strong className="text-cyan-300">Astrophysical Reconstruction:</strong>{" "}
                    Internal 3D stellar density distribution and dust lanes are reconstructed from
                    measured orientation angles (inclination &amp; position angle), NED integrated
                    photometry, and empirical de Vaucouleurs / exponential disk profiles.
                  </div>

                  {g?.uncertaintyNotes && (
                    <div className="mt-3 rounded border border-white/10 bg-white/[0.02] p-3 text-[11px] leading-relaxed text-white/60">
                      <strong className="text-white/80">Scientific Notes:</strong>{" "}
                      {g.uncertaintyNotes}
                    </div>
                  )}

                  {g?.aliases && g.aliases.length > 0 && (
                    <div className="mt-5">
                      <div className="text-[10px] uppercase tracking-wider text-white/40">
                        Cross-Identifications ({g.aliases.length})
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {g.aliases.map((alias) => (
                          <span
                            key={alias}
                            className="rounded bg-white/5 px-2 py-0.5 font-mono text-[10px] text-white/70"
                          >
                            {alias}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Tab 2: Cosmology Metrics */}
              {activeTab === "cosmology" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 space-y-4"
                >
                  <div className="rounded-lg border border-sky-500/20 bg-sky-950/20 p-3">
                    <div className="flex items-center justify-between text-[11px] text-sky-300">
                      <span>Cosmological Model:</span>
                      <span className="font-semibold">{cosmologyParams.name}</span>
                    </div>
                    <div className="mt-1 text-[10px] font-mono text-white/60">
                      H₀ = {cosmologyParams.h0} km/s/Mpc · Ω_m = {cosmologyParams.omegaM} · Ω_Λ ={" "}
                      {cosmologyParams.omegaLambda}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                      Cosmological Distance Ladder Metrics
                    </div>
                    <div className="mt-2 space-y-2 text-xs">
                      <div className="flex items-baseline justify-between rounded bg-white/[0.03] p-2">
                        <span className="text-white/60">Redshift (z)</span>
                        <span className="font-mono text-white font-medium">
                          {g
                            ? g.redshift < 0
                              ? `${g.redshift.toFixed(6)}`
                              : g.redshift.toFixed(5)
                            : z.toFixed(4)}
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between rounded bg-white/[0.03] p-2">
                        <span className="text-white/60">Lookback Time (t_L)</span>
                        <span className="font-mono text-white">
                          {z <= 0
                            ? `${formatLy(visit.distance).replace(" ly", " yr")}`
                            : `${cosmo.lookbackTimeGyr.toFixed(3)} Gyr (${(cosmo.lookbackTimeYr / 1e6).toFixed(1)} Myr)`}
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between rounded bg-white/[0.03] p-2">
                        <span className="text-white/60">Comoving Distance (D_C)</span>
                        <span className="font-mono text-white">
                          {z <= 0
                            ? formatLy(visit.distance)
                            : `${cosmo.comovingDistanceGly.toFixed(3)} Gly (${cosmo.comovingDistanceMpc.toFixed(1)} Mpc)`}
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between rounded bg-white/[0.03] p-2">
                        <span className="text-white/60">Luminosity Distance (D_L)</span>
                        <span className="font-mono text-white">
                          {z <= 0
                            ? formatLy(visit.distance)
                            : `${cosmo.luminosityDistanceGly.toFixed(3)} Gly (${cosmo.luminosityDistanceMpc.toFixed(1)} Mpc)`}
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between rounded bg-white/[0.03] p-2">
                        <span className="text-white/60">Angular Diameter Dist (D_A)</span>
                        <span className="font-mono text-white">
                          {z <= 0
                            ? formatLy(visit.distance)
                            : `${cosmo.angularDiameterDistanceGly.toFixed(3)} Gly (${cosmo.angularDiameterDistanceMpc.toFixed(1)} Mpc)`}
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between rounded bg-white/[0.03] p-2">
                        <span className="text-white/60">Distance Modulus (μ)</span>
                        <span className="font-mono text-white">
                          {z <= 0
                            ? (5 * Math.log10(visit.distance / 3.26156) - 5).toFixed(2)
                            : cosmo.distanceModulus.toFixed(2)}{" "}
                          mag
                        </span>
                      </div>
                      {g?.independentDistanceMethod && (
                        <div className="flex items-baseline justify-between rounded bg-emerald-950/20 border border-emerald-500/20 p-2">
                          <span className="text-emerald-300">Independent Ladder Method</span>
                          <span className="font-medium text-emerald-200">
                            {g.independentDistanceMethod}
                            {g.distanceUncertaintyLy && ` (±${formatLy(g.distanceUncertaintyLy)})`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded border border-white/10 bg-black/40 p-3 text-[11px] leading-relaxed text-white/50">
                    <strong className="text-white/80">Why Distances Differ:</strong> Due to the
                    continuous expansion of spacetime during light transit:
                    <ul className="mt-1 list-disc pl-4 space-y-0.5">
                      <li>
                        <strong>Lookback time:</strong> Elapsed physical time since photons
                        departed.
                      </li>
                      <li>
                        <strong>Comoving distance:</strong> Instantaneous present-day coordinate
                        separation.
                      </li>
                      <li>
                        <strong>Luminosity distance (D_L):</strong> Governs flux dilution as (1+z)
                        expands the surface area.
                      </li>
                      <li>
                        <strong>Angular diameter distance (D_A):</strong> Governs observed angular
                        size on the sky.
                      </li>
                    </ul>
                  </div>
                </motion.div>
              )}

              {/* Tab 3: Astrometric & Observational Data */}
              {activeTab === "astrometry" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 space-y-4"
                >
                  <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                    Observational Astrometry (J2000 & Galactic)
                  </div>
                  <div className="space-y-2 text-xs">
                    {g?.ra !== undefined && (
                      <div className="flex justify-between rounded bg-white/[0.03] p-2 font-mono">
                        <span className="text-white/60">Right Ascension (RA)</span>
                        <span className="text-white">
                          {g.ra.toFixed(4)}° ({degToHMS(g.ra)})
                        </span>
                      </div>
                    )}
                    {g?.dec !== undefined && (
                      <div className="flex justify-between rounded bg-white/[0.03] p-2 font-mono">
                        <span className="text-white/60">Declination (Dec)</span>
                        <span className="text-white">
                          {g.dec.toFixed(4)}° ({degToDMS(g.dec)})
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between rounded bg-white/[0.03] p-2 font-mono">
                      <span className="text-white/60">Galactic Longitude (l)</span>
                      <span className="text-white">
                        {visit
                          ? visit.name === "Milky Way"
                            ? "0.00°"
                            : (g?.l?.toFixed(2) ?? "—")
                          : "—"}
                        °
                      </span>
                    </div>
                    <div className="flex justify-between rounded bg-white/[0.03] p-2 font-mono">
                      <span className="text-white/60">Galactic Latitude (b)</span>
                      <span className="text-white">
                        {visit
                          ? visit.name === "Milky Way"
                            ? "0.00°"
                            : (g?.b?.toFixed(2) ?? "—")
                          : "—"}
                        °
                      </span>
                    </div>
                    {g?.angularDiameterArcmin && (
                      <div className="flex justify-between rounded bg-white/[0.03] p-2">
                        <span className="text-white/60">Angular Extent</span>
                        <span className="text-white">
                          {g.angularDiameterArcmin.major}&apos; × {g.angularDiameterArcmin.minor}
                          &apos;
                        </span>
                      </div>
                    )}
                    {g?.apparentMagnitude && (
                      <div className="flex justify-between rounded bg-white/[0.03] p-2 font-mono">
                        <span className="text-white/60">Apparent Magnitude</span>
                        <span className="text-white">
                          {g.apparentMagnitude.band} = {g.apparentMagnitude.value.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {g?.radialVelocityKmS !== undefined && (
                      <div className="flex justify-between rounded bg-white/[0.03] p-2 font-mono">
                        <span className="text-white/60">Heliocentric Radial Vel</span>
                        <span className="text-white">
                          {g.radialVelocityKmS > 0
                            ? `+${g.radialVelocityKmS.toFixed(1)}`
                            : g.radialVelocityKmS.toFixed(1)}{" "}
                          km/s
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                      Scientific Data Provenance
                    </div>
                    <div className="mt-2 rounded border border-white/10 bg-white/[0.02] p-3 text-xs space-y-1">
                      <div>
                        <strong className="text-white/70">Source:</strong>{" "}
                        {g?.observationSource ?? "NASA/IPAC Extragalactic Database (NED)"}
                      </div>
                      {g?.bibcode && (
                        <div>
                          <strong className="text-white/70">Bibcode:</strong>{" "}
                          <span className="font-mono text-sky-300">{g.bibcode}</span>
                        </div>
                      )}
                      <div className="text-[10px] text-white/40 pt-1">
                        NASA/IPAC Extragalactic Database (NED) is operated by JPL/Caltech under
                        contract with NASA.
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tab 4: Star System & Planets */}
              {activeTab === "system" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
                  {system ? (
                    <>
                      <div className="rounded-lg border border-amber-500/20 bg-amber-950/15 p-3 text-xs">
                        <div className="text-amber-300 font-medium">Labelled 3D Reconstruction</div>
                        <p className="mt-1 text-[11px] text-white/70">
                          {system.star.name} is a real catalogued star in {visit.name}. Orbiting
                          planets shown below are plausible dynamical models for educational scale
                          comparison.
                        </p>
                      </div>

                      <div className="mt-5 text-xs uppercase tracking-[0.2em] text-white/40">
                        Host Star
                      </div>
                      <div className="mt-1 text-base font-light text-white">{system.star.name}</div>
                      <div className="text-[11px] text-white/45 font-mono">
                        {system.star.spectral} · {system.star.mass}
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-white/70">
                        {system.star.description}
                      </p>

                      <div className="mt-6 text-xs uppercase tracking-[0.2em] text-white/40">
                        Planetary Worlds ({system.planets.length})
                      </div>
                      <ul className="mt-3 space-y-2.5">
                        {system.planets.map((p) => (
                          <li
                            key={p.name}
                            className="rounded-lg border border-white/10 bg-white/[0.03] p-3"
                          >
                            <div className="flex items-baseline justify-between gap-2">
                              <span className="text-sm font-medium text-white/90">{p.name}</span>
                              <span className="shrink-0 font-mono text-[11px] text-white/50">
                                {p.au.toFixed(2)} AU
                              </span>
                            </div>
                            <div className="mt-0.5 text-[10px] uppercase tracking-[0.15em] text-white/40">
                              {p.confirmed ? "Observed candidate" : "Modelled world"}
                              {p.moons > 0 && ` · ${p.moons} moon${p.moons > 1 ? "s" : ""}`}
                            </div>
                            <p className="mt-1.5 text-[12px] leading-relaxed text-white/65">
                              {p.description}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <div className="rounded border border-white/10 bg-white/[0.02] p-4 text-xs leading-relaxed text-white/60">
                      <strong className="text-white">Scientific Integrity Notice:</strong>
                      <p className="mt-2">
                        No individual star systems or confirmed exoplanets have been resolved inside{" "}
                        {visit.name}. In accordance with astrophysical principles, we strictly avoid
                        inventing speculative internal star catalogs or fictional planetary systems
                        for unresolved galaxies.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.aside>
          )}
        </HideablePanel>
      )}
    </AnimatePresence>
  );
}

function GStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">{label}</div>
      <div className="mt-0.5 text-sm font-light text-white">{value}</div>
    </div>
  );
}

function degToHMS(deg: number): string {
  const h = Math.floor(deg / 15);
  const m = Math.floor((deg / 15 - h) * 60);
  const s = ((deg / 15 - h) * 60 - m) * 60;
  return `${h}h ${m}m ${s.toFixed(1)}s`;
}

function degToDMS(deg: number): string {
  const sign = deg < 0 ? "-" : "+";
  const abs = Math.abs(deg);
  const d = Math.floor(abs);
  const m = Math.floor((abs - d) * 60);
  const s = ((abs - d) * 60 - m) * 60;
  return `${sign}${d}° ${m}' ${s.toFixed(1)}"`;
}
