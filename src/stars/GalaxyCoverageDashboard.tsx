import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "./store";
import {
  OBSERVATIONAL_GALAXY_CATALOG,
  queryLiveNedTap,
  type ObservationalGalaxy,
} from "./galaxy-catalog";
import {
  calculateCosmologicalDistances,
  COSMOLOGICAL_MODELS,
  type CosmologicalParameters,
} from "@/lib/astronomy/cosmology";
import { formatLy } from "./GalaxyInfoPanel";
import { toXYZ } from "./Universe";

export function GalaxyCoverageDashboard() {
  const open = useStore((s) => s.galaxyCoverageDashboardOpen);
  const setOpen = useStore((s) => s.setGalaxyCoverageDashboardOpen);
  const cosmologyModelKey = useStore((s) => s.cosmologyModelKey);
  const setCosmologyModelKey = useStore((s) => s.setCosmologyModelKey);
  const customCosmology = useStore((s) => s.customCosmology);
  const setCustomCosmology = useStore((s) => s.setCustomCosmology);
  const setVisitGalaxy = useStore((s) => s.setVisitGalaxy);

  const [activeTab, setActiveTab] = useState<"coverage" | "calculator" | "benchmarks" | "ned_tap">(
    "coverage",
  );
  const [calcZ, setCalcZ] = useState<number>(1.0);
  const [tapQueryObj, setTapQueryObj] = useState<string>("MESSIER 031");
  const [tapLoading, setTapLoading] = useState<boolean>(false);
  const [tapResult, setTapResult] = useState<{
    success: boolean;
    data?: Record<string, unknown>;
    source: string;
  } | null>(null);

  if (!open) return null;

  // Active cosmology parameters
  const currentCosmology: CosmologicalParameters =
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

  const cosmoResult = calculateCosmologicalDistances(Math.max(0, calcZ), currentCosmology);

  // Ingested Catalog Statistics
  const totalCount = OBSERVATIONAL_GALAXY_CATALOG.length;
  const localGroupCount = OBSERVATIONAL_GALAXY_CATALOG.filter(
    (g) => g.distanceTier === "local_group",
  ).length;
  const nearbyGroupsCount = OBSERVATIONAL_GALAXY_CATALOG.filter(
    (g) => g.distanceTier === "nearby_groups",
  ).length;
  const virgoClusterCount = OBSERVATIONAL_GALAXY_CATALOG.filter(
    (g) => g.distanceTier === "virgo_cluster",
  ).length;
  const distantClustersCount = OBSERVATIONAL_GALAXY_CATALOG.filter(
    (g) => g.distanceTier === "distant_clusters",
  ).length;
  const highZCount = OBSERVATIONAL_GALAXY_CATALOG.filter(
    (g) => g.distanceTier === "high_redshift",
  ).length;

  const handleRunTap = async () => {
    setTapLoading(true);
    setTapResult(null);
    try {
      const res = await queryLiveNedTap(tapQueryObj);
      setTapResult(res);
    } catch {
      setTapResult({ success: false, source: "Query Error" });
    } finally {
      setTapLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md"
        style={{ background: "rgba(3, 6, 18, 0.75)" }}
        onClick={() => setOpen(false)}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.2 }}
          className="relative flex h-[85vh] w-full max-w-4xl flex-col rounded-2xl border border-white/15 bg-[#0a0d20] shadow-2xl overflow-hidden text-white"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-sky-400">
                Observational Extragalactic Atlas
              </div>
              <h1 className="text-xl font-light tracking-wide text-white">
                Galaxy Coverage, Astrometry & Cosmological Dashboard
              </h1>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="grid h-8 w-8 place-items-center rounded-full text-white/60 hover:bg-white/10 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-white/10 px-6 text-xs bg-white/[0.02]">
            {(
              [
                { id: "coverage", label: "Catalog Coverage & Bias" },
                { id: "calculator", label: "Cosmological Calculator" },
                { id: "benchmarks", label: "Benchmark Verifications" },
                { id: "ned_tap", label: "NASA/IPAC NED TAP Tool" },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`relative py-3 px-4 font-medium uppercase tracking-wider text-[11px] transition ${
                  activeTab === t.id ? "text-sky-400" : "text-white/50 hover:text-white/80"
                }`}
              >
                {t.label}
                {activeTab === t.id && (
                  <motion.div
                    layoutId="dashTabActive"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-400"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Tab 1: Coverage & Survey Limitations */}
            {activeTab === "coverage" && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6 text-center">
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <div className="text-[10px] uppercase tracking-wider text-white/40">
                      Total Objects
                    </div>
                    <div className="mt-1 text-2xl font-light text-white">{totalCount}</div>
                    <div className="text-[9px] text-sky-400/80">Normalized NED</div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <div className="text-[10px] uppercase tracking-wider text-white/40">
                      Local Group
                    </div>
                    <div className="mt-1 text-2xl font-light text-white">{localGroupCount}</div>
                    <div className="text-[9px] text-white/50">&lt; 5 Mly</div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <div className="text-[10px] uppercase tracking-wider text-white/40">
                      Nearby Groups
                    </div>
                    <div className="mt-1 text-2xl font-light text-white">{nearbyGroupsCount}</div>
                    <div className="text-[9px] text-white/50">5 – 40 Mly</div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <div className="text-[10px] uppercase tracking-wider text-white/40">
                      Virgo Cluster
                    </div>
                    <div className="mt-1 text-2xl font-light text-white">{virgoClusterCount}</div>
                    <div className="text-[9px] text-white/50">40 – 75 Mly</div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <div className="text-[10px] uppercase tracking-wider text-white/40">
                      Distant Clusters
                    </div>
                    <div className="mt-1 text-2xl font-light text-white">
                      {distantClustersCount}
                    </div>
                    <div className="text-[9px] text-white/50">100 Mly – 3 Gly</div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <div className="text-[10px] uppercase tracking-wider text-white/40">
                      High-z Record
                    </div>
                    <div className="mt-1 text-2xl font-light text-rose-400">z = 14.32</div>
                    <div className="text-[9px] text-white/50">JADES-GS-z14-0</div>
                  </div>
                </div>

                {/* Authority & Versions */}
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
                  <h3 className="text-sm font-medium uppercase tracking-wider text-sky-300">
                    Authority Sources & Data Releases
                  </h3>
                  <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 text-xs">
                    <div className="rounded-lg border border-white/5 bg-black/30 p-3 space-y-1">
                      <div className="font-semibold text-white">
                        NASA/IPAC Extragalactic Database (NED)
                      </div>
                      <div className="text-[11px] text-white/60">
                        Version: NED v3.0 (2026 Release) / TAP 1.1 Endpoint
                      </div>
                      <div className="text-[10px] text-white/40">
                        Primary astrometric cross-matching, multiwavelength photometry, and
                        redshifts.
                      </div>
                    </div>
                    <div className="rounded-lg border border-white/5 bg-black/30 p-3 space-y-1">
                      <div className="font-semibold text-white">
                        NED-D (Redshift-Independent Distances)
                      </div>
                      <div className="text-[11px] text-white/60">
                        Version: Master Compilation 2025
                      </div>
                      <div className="text-[10px] text-white/40">
                        Direct distance ladder measurements: Cepheid P-L, TRGB, SN Ia, SBF,
                        Tully-Fisher.
                      </div>
                    </div>
                    <div className="rounded-lg border border-white/5 bg-black/30 p-3 space-y-1">
                      <div className="font-semibold text-white">
                        JWST Advanced Deep Extragalactic Survey (JADES)
                      </div>
                      <div className="text-[11px] text-white/60">
                        NIRSpec &amp; NIRCam High-z Benchmark Releases (2023–2024)
                      </div>
                      <div className="text-[10px] text-white/40">
                        Spectroscopic confirmation of Cosmic Dawn galaxies (GN-z11, JADES-GS-z14-0).
                      </div>
                    </div>
                    <div className="rounded-lg border border-white/5 bg-black/30 p-3 space-y-1">
                      <div className="font-semibold text-white">
                        ESA Gaia DR3 &amp; Sloan Digital Sky Survey (SDSS DR18)
                      </div>
                      <div className="text-[11px] text-white/60">
                        ICRS Celestial Reference Frame &amp; BOSS Extragalactic Spectroscopy
                      </div>
                      <div className="text-[10px] text-white/40">
                        Infall velocity corrections, CMB frame conversions, and spectroscopic
                        redshifts.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scientific Completeness & Malmquist Bias Statement */}
                <div className="rounded-xl border border-amber-500/30 bg-amber-950/15 p-5">
                  <div className="flex items-center gap-2 text-amber-300 font-medium text-sm">
                    <span>⚠</span>
                    <span>Catalog Completeness &amp; Observational Selection Limits</span>
                  </div>
                  <div className="mt-2 text-xs leading-relaxed text-white/75 space-y-2">
                    <p>
                      <strong>Never Claim Full Universal Catalog Completeness:</strong> The
                      observable universe contains an estimated 2 trillion galaxies. No physical
                      catalog possesses universal completeness. This atlas renders verified
                      empirical records from NASA/IPAC NED and space observatories, subject to the
                      following fundamental astrophysical constraints:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-white/70">
                      <li>
                        <strong>Zone of Avoidance (ZoA):</strong> Interstellar gas and dust within
                        the Milky Way&apos;s plane (|b| &lt; 10°) heavily obscures optical
                        extragalactic observations, causing an apparent gap in sky coverage.
                      </li>
                      <li>
                        <strong>Malmquist Bias:</strong> In flux-limited surveys, intrinsically
                        brighter galaxies (e.g. giant ellipticals, radio galaxies, quasars) are
                        detected across vastly greater volumes than faint dwarf galaxies, skewing
                        the apparent population at high distance.
                      </li>
                      <li>
                        <strong>Survey Depths:</strong> High-redshift objects (z &gt; 6) are
                        observed only along narrow, deep pencil-beam fields (e.g., GOODS-South,
                        HUDF) surveyed by HST and JWST, not in all-sky shallow surveys.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Interactive Cosmological Distance Calculator */}
            {activeTab === "calculator" && (
              <div className="space-y-6">
                {/* Model Selector & Inputs */}
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-sm font-medium uppercase tracking-wider text-sky-300">
                      Active Cosmological Metric:
                    </h3>
                    <div className="flex gap-1.5">
                      {(["planck2018", "shoes2022", "wmap9", "custom"] as const).map((key) => (
                        <button
                          key={key}
                          onClick={() => setCosmologyModelKey(key)}
                          className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                            cosmologyModelKey === key
                              ? "bg-sky-500 text-white"
                              : "bg-white/10 text-white/60 hover:bg-white/15 hover:text-white"
                          }`}
                        >
                          {key === "planck2018"
                            ? "Planck 2018"
                            : key === "shoes2022"
                              ? "SH0ES (Riess 2022)"
                              : key === "wmap9"
                                ? "WMAP 9"
                                : "Custom"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="text-xs text-white/60">
                    {currentCosmology.description} (Citation: {currentCosmology.citation})
                  </div>

                  {cosmologyModelKey === "custom" && (
                    <div className="grid grid-cols-3 gap-3 rounded-lg border border-white/10 bg-black/40 p-3">
                      <div>
                        <label className="text-[10px] text-white/50">H₀ (km/s/Mpc)</label>
                        <input
                          type="number"
                          value={customCosmology.h0}
                          onChange={(e) =>
                            setCustomCosmology({
                              ...customCosmology,
                              h0: parseFloat(e.target.value) || 70,
                            })
                          }
                          className="mt-1 w-full rounded border border-white/10 bg-white/5 px-2 py-1 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-white/50">Ω_m (Matter)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={customCosmology.omegaM}
                          onChange={(e) =>
                            setCustomCosmology({
                              ...customCosmology,
                              omegaM: parseFloat(e.target.value) || 0.3,
                            })
                          }
                          className="mt-1 w-full rounded border border-white/10 bg-white/5 px-2 py-1 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-white/50">Ω_Λ (Dark Energy)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={customCosmology.omegaLambda}
                          onChange={(e) =>
                            setCustomCosmology({
                              ...customCosmology,
                              omegaLambda: parseFloat(e.target.value) || 0.7,
                            })
                          }
                          className="mt-1 w-full rounded border border-white/10 bg-white/5 px-2 py-1 text-xs font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {/* Redshift Slider & Input */}
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/70">Test Redshift (z):</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="20"
                          value={calcZ}
                          onChange={(e) => setCalcZ(Math.max(0, parseFloat(e.target.value) || 0))}
                          className="w-24 rounded border border-white/20 bg-black/50 px-2 py-1 text-center font-mono text-sm text-sky-400"
                        />
                        <div className="flex gap-1">
                          {[0.1, 1.0, 3.0, 10.6, 14.32].map((pz) => (
                            <button
                              key={pz}
                              onClick={() => setCalcZ(pz)}
                              className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] hover:bg-white/20"
                            >
                              z={pz}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="15"
                      step="0.05"
                      value={calcZ}
                      onChange={(e) => setCalcZ(parseFloat(e.target.value))}
                      className="w-full accent-sky-400 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Calculated Distances Results */}
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-sky-500/20 bg-sky-950/20 p-4 space-y-2 text-xs">
                    <div className="text-[11px] font-semibold text-sky-300 uppercase tracking-wider">
                      Distances at z = {calcZ.toFixed(3)}
                    </div>
                    <div className="flex justify-between border-b border-white/5 py-1">
                      <span className="text-white/60">Comoving Distance (D_C):</span>
                      <span className="font-mono text-white font-medium">
                        {cosmoResult.comovingDistanceGly.toFixed(3)} Gly (
                        {cosmoResult.comovingDistanceMpc.toFixed(1)} Mpc)
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 py-1">
                      <span className="text-white/60">Luminosity Distance (D_L):</span>
                      <span className="font-mono text-white font-medium">
                        {cosmoResult.luminosityDistanceGly.toFixed(3)} Gly (
                        {cosmoResult.luminosityDistanceMpc.toFixed(1)} Mpc)
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 py-1">
                      <span className="text-white/60">Angular Diameter Dist (D_A):</span>
                      <span className="font-mono text-white font-medium">
                        {cosmoResult.angularDiameterDistanceGly.toFixed(3)} Gly (
                        {cosmoResult.angularDiameterDistanceMpc.toFixed(1)} Mpc)
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-white/60">Distance Modulus (μ):</span>
                      <span className="font-mono text-sky-300 font-medium">
                        {cosmoResult.distanceModulus.toFixed(2)} mag
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-4 space-y-2 text-xs">
                    <div className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider">
                      Timescales &amp; Physical Scales
                    </div>
                    <div className="flex justify-between border-b border-white/5 py-1">
                      <span className="text-white/60">Lookback Time (t_L):</span>
                      <span className="font-mono text-white font-medium">
                        {cosmoResult.lookbackTimeGyr.toFixed(3)} Gyr
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 py-1">
                      <span className="text-white/60">Cosmic Age at Emission:</span>
                      <span className="font-mono text-white font-medium">
                        {(cosmoResult.cosmicAgeAtRedshiftGyr * 1000).toFixed(1)} Myr (
                        {cosmoResult.cosmicAgeAtRedshiftGyr.toFixed(3)} Gyr)
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 py-1">
                      <span className="text-white/60">Present Universe Age (t₀):</span>
                      <span className="font-mono text-white font-medium">
                        {cosmoResult.currentUniverseAgeGyr.toFixed(3)} Gyr
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-white/60">Spatial Scale (kpc/arcsec):</span>
                      <span className="font-mono text-emerald-300 font-medium">
                        {cosmoResult.kpcPerArcsec.toFixed(3)} kpc / &quot;
                      </span>
                    </div>
                  </div>
                </div>

                {/* Educational Insight Note */}
                <div className="rounded-xl border border-white/10 bg-black/40 p-4 text-xs leading-relaxed text-white/60">
                  <strong className="text-white">Relativistic Insight:</strong> Note that for high
                  redshift, $D_L &gt; D_C &gt; c \cdot t_L &gt; D_A$. In fact, $D_A$ reaches a
                  turnaround maximum near $z \approx 1.6$ and then <em>decreases</em> at higher
                  redshifts! This means distant early galaxies appear <strong>larger</strong> in
                  angular size on the sky because they emitted their light when the universe was
                  much smaller and physically closer to us.
                </div>
              </div>
            )}

            {/* Tab 3: Authoritative Benchmarks Matrix */}
            {activeTab === "benchmarks" && (
              <div className="space-y-4">
                <div className="text-xs text-white/60">
                  Authoritative benchmark positions and measured independent distances across the
                  extragalactic distance ladder. Click any galaxy to visit in the 3D Universe.
                </div>
                <div className="overflow-x-auto rounded-xl border border-white/10">
                  <table className="w-full text-left text-xs text-white/80">
                    <thead className="border-b border-white/10 bg-white/[0.04] text-[10px] uppercase tracking-wider text-white/50">
                      <tr>
                        <th className="py-2.5 px-3">Galaxy</th>
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">RA / Dec</th>
                        <th className="py-2.5 px-3">Redshift (z)</th>
                        <th className="py-2.5 px-3">Distance</th>
                        <th className="py-2.5 px-3">Ladder Method</th>
                        <th className="py-2.5 px-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {OBSERVATIONAL_GALAXY_CATALOG.filter((g) =>
                        [
                          "Andromeda (M31)",
                          "Triangulum (M33)",
                          "Large Magellanic Cloud",
                          "Small Magellanic Cloud",
                          "Sagittarius Dwarf",
                          "Centaurus A (NGC 5128)",
                          "M87 (Virgo A)",
                          "M81 (Bode's Galaxy)",
                          "Whirlpool Galaxy (M51)",
                          "Sombrero Galaxy (M104)",
                          "NGC 1300",
                          "Coma Cluster (NGC 4889)",
                          "Perseus A (NGC 1275)",
                          "GN-z11",
                          "JADES-GS-z14-0",
                        ].includes(g.name),
                      ).map((g) => (
                        <tr key={g.id} className="hover:bg-white/[0.03] transition">
                          <td className="py-2.5 px-3 font-medium text-white">{g.name}</td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-white/60">
                            {g.morphologyClass}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-white/60">
                            {g.ra.toFixed(2)}°, {g.dec.toFixed(2)}°
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px]">
                            {g.redshift < 0 ? `${g.redshift.toFixed(5)}` : g.redshift.toFixed(4)}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-sky-300">
                            {formatLy(g.distance)}
                          </td>
                          <td className="py-2.5 px-3 text-white/70">
                            {g.independentDistanceMethod ?? "Cosmological"}
                          </td>
                          <td className="py-2.5 px-3">
                            <button
                              onClick={() => {
                                setOpen(false);
                                const pos = toXYZ(g.l, g.b, g.distance);
                                setVisitGalaxy({
                                  name: g.name,
                                  x: pos.x,
                                  y: pos.y,
                                  z: pos.z,
                                  size: g.size,
                                  distance: g.distance,
                                  type: g.type,
                                });
                              }}
                              className="rounded bg-sky-500/20 px-2 py-0.5 text-[10px] text-sky-300 hover:bg-sky-500/30"
                            >
                              Visit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab 4: Live NED TAP Query Tool */}
            {activeTab === "ned_tap" && (
              <div className="space-y-4">
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
                  <div>
                    <h3 className="text-sm font-medium uppercase tracking-wider text-sky-300">
                      IVOA Table Access Protocol (TAP 1.1) Query Client
                    </h3>
                    <p className="mt-1 text-xs text-white/60">
                      Query the official NASA/IPAC Extragalactic Database (NED) synchronous TAP
                      service endpoint at{" "}
                      <code className="text-sky-300 font-mono">
                        https://ned.ipac.caltech.edu/tap/sync
                      </code>
                      .
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tapQueryObj}
                      onChange={(e) => setTapQueryObj(e.target.value)}
                      placeholder="e.g. MESSIER 031, NGC 5194, M87, 3C 273..."
                      className="flex-1 rounded-lg border border-white/20 bg-black/50 px-3 py-2 text-xs font-mono text-white placeholder-white/30"
                    />
                    <button
                      onClick={handleRunTap}
                      disabled={tapLoading || !tapQueryObj}
                      className="rounded-lg bg-sky-500 px-4 py-2 text-xs font-medium text-white transition hover:bg-sky-600 disabled:opacity-50"
                    >
                      {tapLoading ? "Querying NED..." : "Query NED TAP"}
                    </button>
                  </div>

                  {tapResult && (
                    <div className="rounded-lg border border-white/10 bg-black/40 p-4 space-y-2 text-xs font-mono">
                      <div className="flex items-center justify-between text-[11px] text-white/50">
                        <span>Source: {tapResult.source}</span>
                        <span className={tapResult.success ? "text-emerald-400" : "text-rose-400"}>
                          {tapResult.success ? "STATUS: 200 OK" : "ERROR / FALLBACK"}
                        </span>
                      </div>
                      <pre className="overflow-x-auto text-[11px] text-sky-200">
                        {JSON.stringify(tapResult.data ?? tapResult, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
