import { HideablePanel, NasaResources } from "./NasaResources";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { OBJECT_BY_ID, type ObservedObject } from "./observed-objects";
import { questionsFor } from "./object-questions";
import { useStore } from "./store";
import { Telescope } from "lucide-react";

function QuestionList({ item }: { item: ObservedObject }) {
  const questions = questionsFor(item);
  const [open, setOpen] = useState<number | null>(null);
  if (questions.length === 0) return null;
  return (
    <div className="mt-7">
      <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">Common questions</div>
      <div className="mt-3 space-y-2">
        {questions.map((entry, i) => {
          const isOpen = open === i;
          return (
            <div
              key={entry.q}
              className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.03]"
            >
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-start gap-2 px-3 py-2.5 text-left text-xs leading-relaxed text-white/85 transition hover:bg-white/[0.06]"
              >
                <span className={`mt-[2px] text-white/40 transition ${isOpen ? "rotate-90" : ""}`}>
                  ›
                </span>
                <span className="flex-1">{entry.q}</span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                  >
                    <p className="border-t border-white/10 px-3 py-3 text-xs leading-relaxed text-white/65">
                      {entry.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

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
  const setObservationModalOpen = useStore((s) => s.setObservationModalOpen);
  const item = selectedId ? OBJECT_BY_ID.get(selectedId) : undefined;
  return (
    <AnimatePresence>
      {item && (
        <HideablePanel resetKey={item.id} label={item.name}>
          {(hide) => (
            <motion.aside
              onClick={(e) => e.stopPropagation()}
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="pointer-events-auto fixed right-0 top-0 z-30 h-full w-full max-w-[390px] overflow-y-auto border-l border-white/10 bg-black/80 p-7 text-white backdrop-blur-xl"
            >
              {hide}
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

              {/* Real Telescope Observation Layer Button */}
              <button
                onClick={() => setObservationModalOpen(true, item.id)}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-950/40 px-3.5 py-2.5 text-xs font-mono font-bold text-cyan-300 transition hover:bg-cyan-900/60 hover:text-white shadow-md shadow-cyan-950/50"
              >
                <Telescope className="size-4 text-cyan-400" />
                <span>Telescope Imagery & HiPS Surveys</span>
              </button>

              <NasaResources
                name={item.name}
                query={item.aliases[0]}
                alt={[...item.aliases, item.subtype]}
              />
              <div className="mt-6 grid grid-cols-2 gap-y-4">
                <Stat label="Category" value={item.category} />
                <Stat label="Distance" value={distanceLabel(item.distance)} />
                <Stat label="Physical size" value={sizeLabel(item.diameterLy)} />
                <Stat
                  label="Galactic l, b"
                  value={`${item.l.toFixed(1)}°, ${item.b.toFixed(1)}°`}
                />
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
              <div className="mt-7 text-[10px] uppercase tracking-[0.2em] text-white/40">
                Derived figures
              </div>
              <ul className="mt-3 space-y-2">
                {(
                  [
                    [
                      "Light travel time",
                      `${distanceLabel(item.distance).replace(" ly", "")} years — we see it as it was then`,
                    ],
                    ["Distance in parsecs", `${(item.distance / 3.26156).toExponential(2)} pc`],
                    [
                      "Light-crossing time",
                      item.diameterLy >= 1
                        ? `${item.diameterLy.toLocaleString()} years across`
                        : `${(item.diameterLy * 3.156e7).toFixed(2)} seconds across`,
                    ],
                    [
                      "Size vs Solar System",
                      `${(item.diameterLy / 0.0012).toFixed(item.diameterLy < 0.01 ? 3 : 0)}× Neptune's orbit`,
                    ],
                  ] as Array<[string, string]>
                ).map(([k, v]) => (
                  <li key={k} className="flex items-baseline justify-between gap-3 text-xs">
                    <span className="text-white/45">{k}</span>
                    <span className="text-right text-white/80">{v}</span>
                  </li>
                ))}
              </ul>
              {item.category === "Nebula" && (
                <div className="mt-7 rounded-lg border border-purple-500/30 bg-purple-500/10 p-3.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-purple-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                    Nebula Astrophysics & Spectroscopy
                  </div>
                  <div className="mt-2 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-white/50">Classification:</span>
                      <span className="font-medium capitalize text-white">
                        {item.nebulaClass ? item.nebulaClass.replace("_", " ") : item.subtype}
                      </span>
                    </div>
                    {item.filterPalette && (
                      <div className="flex justify-between">
                        <span className="text-white/50">Spectral Palette:</span>
                        <span className="font-medium text-cyan-300">{item.filterPalette}</span>
                      </div>
                    )}
                  </div>
                  <p className="mt-2.5 border-t border-purple-500/20 pt-2 text-[10.5px] leading-relaxed text-purple-200/80">
                    <span className="font-semibold text-purple-200">
                      Scientific Calibration Notice:
                    </span>{" "}
                    Astrophotographic and narrowband emission composites map specific ionic
                    transitions (Hα 656 nm, [O III] 501 nm, [S II] 672 nm) or synchrotron radiation
                    to distinct visual channels. They do not represent human naked-eye perception in
                    deep space.
                  </p>
                </div>
              )}
              {item.compactPhysics && (
                <div className="mt-7 rounded-xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/40 via-slate-950/60 to-purple-950/30 p-4 shadow-lg backdrop-blur">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">
                      <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                      Relativistic Compact Physics
                    </div>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/10 text-cyan-200 border border-white/10">
                      {item.compactPhysics.scientificConfidence}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    {item.compactPhysics.massSolar !== undefined && (
                      <div className="rounded-lg bg-black/40 border border-white/5 p-2">
                        <span className="text-[9px] uppercase tracking-wider text-white/40 block">
                          Mass:
                        </span>
                        <span className="font-mono text-white font-semibold">
                          {item.compactPhysics.massSolar >= 1e6
                            ? `${(item.compactPhysics.massSolar / 1e6).toFixed(2)}M M☉`
                            : `${item.compactPhysics.massSolar.toLocaleString()} M☉`}
                        </span>
                      </div>
                    )}
                    {item.compactPhysics.spinDimensionless !== undefined && (
                      <div className="rounded-lg bg-black/40 border border-white/5 p-2">
                        <span className="text-[9px] uppercase tracking-wider text-white/40 block">
                          Kerr Spin (a*):
                        </span>
                        <span className="font-mono text-amber-300 font-semibold">
                          {item.compactPhysics.spinDimensionless.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {item.compactPhysics.schwarzschildRadiusKm !== undefined && (
                      <div className="rounded-lg bg-black/40 border border-white/5 p-2">
                        <span className="text-[9px] uppercase tracking-wider text-white/40 block">
                          Event Horizon (Rs):
                        </span>
                        <span className="font-mono text-cyan-200 font-semibold">
                          {item.compactPhysics.schwarzschildRadiusKm >= 1e6
                            ? `${(item.compactPhysics.schwarzschildRadiusKm / 1e6).toFixed(2)}M km`
                            : `${item.compactPhysics.schwarzschildRadiusKm.toLocaleString()} km`}
                        </span>
                      </div>
                    )}
                    <div className="rounded-lg bg-black/40 border border-white/5 p-2">
                      <span className="text-[9px] uppercase tracking-wider text-white/40 block">
                        Accretion State:
                      </span>
                      <span
                        className={`font-mono font-semibold capitalize ${
                          item.compactPhysics.hasAccretionDisk
                            ? "text-amber-300"
                            : "text-emerald-400"
                        }`}
                      >
                        {item.compactPhysics.accretionState.replace("_", " ")}
                      </span>
                    </div>
                  </div>

                  {/* Pulsar Specific Metrics */}
                  {item.compactPhysics.pulsarSpinPeriodSec !== undefined && (
                    <div className="mt-2.5 p-2.5 rounded-lg bg-black/30 border border-cyan-500/20 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-white/50">Spin Period (P):</span>
                        <span className="font-mono text-cyan-300 font-medium">
                          {item.compactPhysics.pulsarSpinPeriodSec < 0.1
                            ? `${(item.compactPhysics.pulsarSpinPeriodSec * 1000).toFixed(2)} ms`
                            : `${item.compactPhysics.pulsarSpinPeriodSec.toFixed(4)} s`}
                        </span>
                      </div>
                      {item.compactPhysics.pulsarMagneticFieldGauss && (
                        <div className="flex justify-between">
                          <span className="text-white/50">Dipole B-Field:</span>
                          <span className="font-mono text-purple-300 font-medium">
                            {item.compactPhysics.pulsarMagneticFieldGauss.toExponential(1)} Gauss
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Gravitational Wave Specific Metrics */}
                  {item.compactPhysics.gwSkyAreaDeg2 !== undefined && (
                    <div className="mt-2.5 p-2.5 rounded-lg bg-black/30 border border-purple-500/20 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-white/50">90% Sky Localization:</span>
                        <span className="font-mono text-purple-300 font-medium">
                          {item.compactPhysics.gwSkyAreaDeg2} deg²
                        </span>
                      </div>
                      {item.compactPhysics.gwChirpMassSolar && (
                        <div className="flex justify-between">
                          <span className="text-white/50">Chirp Mass (ℳ):</span>
                          <span className="font-mono text-amber-300 font-medium">
                            {item.compactPhysics.gwChirpMassSolar} M☉
                          </span>
                        </div>
                      )}
                      {item.compactPhysics.gwRadiatedEnergySolar && (
                        <div className="flex justify-between">
                          <span className="text-white/50">Radiated Energy:</span>
                          <span className="font-mono text-cyan-300 font-medium">
                            {item.compactPhysics.gwRadiatedEnergySolar} M☉ c²
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Accretion & Lensing Distinction Note */}
                  <div className="mt-3 border-t border-white/10 pt-2 text-[10.5px] leading-relaxed text-white/70">
                    {!item.compactPhysics.hasAccretionDisk ? (
                      <p className="text-emerald-300/90">
                        <strong className="text-emerald-200">
                          Non-Accreting / Dormant System:
                        </strong>{" "}
                        This compact body does not pull matter from its surroundings. It has NO
                        glowing accretion disk and is rendered purely via strong-field gravitational
                        deflection and background star lensing.
                      </p>
                    ) : (
                      <p className="text-amber-200/90">
                        <strong className="text-amber-100">Active Accretion Engine:</strong>{" "}
                        Infalling matter experiences Keplerian orbital shear, extreme viscous
                        dissipation, gravitational redshift, and relativistic Doppler boosting.
                      </p>
                    )}
                  </div>

                  {item.compactPhysics.publishedCitation && (
                    <div
                      className="mt-2 text-[9.5px] text-white/40 border-t border-white/5 pt-1.5 truncate"
                      title={item.compactPhysics.publishedCitation}
                    >
                      <span className="text-white/60">Citation:</span>{" "}
                      {item.compactPhysics.publishedCitation}
                    </div>
                  )}
                </div>
              )}
              <div className="mt-7 rounded-lg border border-white/10 bg-white/[0.03] p-3">
                <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">
                  Visual interpretation
                </div>
                <p className="mt-2 text-xs leading-relaxed text-white/65">{item.visualNote}</p>
              </div>
              <QuestionList item={item} />
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
        </HideablePanel>
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
