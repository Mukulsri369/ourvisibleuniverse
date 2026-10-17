import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore, type UniversalTarget, type UniversalTargetType } from "./store";
import { PLANETS, AU } from "./Planets";
import { NAMED_STARS } from "./data";
import { OBSERVED_OBJECTS } from "./observed-objects";
import { OBSERVATIONAL_GALAXY_CATALOG } from "./galaxy-catalog";
import { toXYZ } from "./Universe";
import {
  X,
  Compass,
  Telescope,
  Globe,
  Radio,
  Sparkles,
  ShieldAlert,
  Orbit,
  ArrowRight,
  ExternalLink,
  Layers,
  BookOpen,
  Calendar,
  Activity,
  Maximize2,
} from "lucide-react";

export function UniversalObjectModal() {
  const open = useStore((s) => s.universalObjectModalOpen);
  const setOpen = useStore((s) => s.setUniversalObjectModalOpen);
  const target = useStore((s) => s.activeUniversalTarget);
  const explanationLevel = useStore((s) => s.explanationLevel);
  const setExplanationLevel = useStore((s) => s.setExplanationLevel);
  const opticsPreset = useStore((s) => s.opticsPreset);

  const setVisitPlanet = useStore((s) => s.setVisitPlanet);
  const flyToStar = useStore((s) => s.flyToStar);
  const setVisitGalaxy = useStore((s) => s.setVisitGalaxy);
  const setSelectedObject = useStore((s) => s.setSelectedObject);
  const toggleAutoOrbit = useStore((s) => s.toggleAutoOrbit);
  const isAutoOrbiting = useStore((s) => s.isAutoOrbiting);

  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "scientific"
    | "visualization"
    | "observations"
    | "evolution"
    | "related"
    | "references"
  >("overview");

  if (!open || !target) return null;

  // Format distances helper
  const formatLy = (v: number) => {
    if (v < 0.0001) return `${(v * 63241).toFixed(2)} AU`;
    if (v >= 1e9) return `${(v / 1e9).toFixed(2)} billion light-years`;
    if (v >= 1e6) return `${(v / 1e6).toFixed(2)} million light-years`;
    if (v >= 1e3) return `${(v / 1e3).toFixed(1)} thousand light-years`;
    return `${v.toFixed(1)} light-years`;
  };

  const handleNavigateChild = (child: { id: string; name: string; type: UniversalTargetType }) => {
    if (child.type === "planet") {
      setVisitPlanet(child.name);
    } else if (child.type === "moon") {
      setVisitPlanet(`${target.name}:${child.name}`);
    } else if (child.type === "star") {
      const s = NAMED_STARS.find((st) => st.name === child.name);
      if (s) flyToStar(s);
    } else if (child.type === "galaxy") {
      const g = OBSERVATIONAL_GALAXY_CATALOG.find((gx) => gx.name === child.name);
      if (g) {
        const p = toXYZ(g.l, g.b, g.distance);
        setVisitGalaxy({
          name: g.name,
          x: p.x,
          y: p.y,
          z: p.z,
          size: g.size,
          distance: g.distance,
          type: g.type,
          view: "overview",
        });
      }
    } else {
      setSelectedObject(child.id);
    }
  };

  const handleNavigateParent = () => {
    if (!target.parentName) return;
    if (target.type === "moon") {
      setVisitPlanet(target.parentName);
    } else if (target.type === "planet") {
      setVisitPlanet(null);
    } else if (target.type === "star" || target.type === "exoplanet") {
      setVisitGalaxy({
        name: "Milky Way",
        x: -26000,
        y: 0,
        z: 0,
        size: 100000,
        distance: 26000,
        type: "Barred Spiral",
        view: "overview",
      });
    }
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 backdrop-blur-md"
        style={{ background: "rgba(2, 4, 12, 0.84)" }}
        onClick={() => setOpen(false)}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="relative flex h-[88vh] w-full max-w-4xl flex-col rounded-2xl border border-white/15 bg-[#090b1c] text-white shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-white/[0.02]">
            <div className="space-y-1">
              {/* Parent-Child Navigable Breadcrumb */}
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-white/50">
                <span>Universe</span>
                {target.parentName && (
                  <>
                    <span>›</span>
                    <button
                      onClick={handleNavigateParent}
                      className="text-cyan-300 hover:text-cyan-100 hover:underline"
                    >
                      {target.parentName}
                    </button>
                  </>
                )}
                <span>›</span>
                <span className="text-white/90 font-medium">{target.name}</span>
              </div>

              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-light text-white tracking-wide">{target.name}</h2>
                <span className="rounded bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 text-xs text-cyan-300 font-medium">
                  {target.category || target.type.toUpperCase()}
                </span>
                {target.isSimulatedOrModelled && (
                  <span className="flex items-center gap-1 rounded bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] text-amber-300 font-mono">
                    <ShieldAlert className="h-3 w-3" />
                    Model Reconstruction
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="grid h-8 w-8 place-items-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-white/10 bg-black/40 px-6 text-xs overflow-x-auto no-scrollbar">
            {(
              [
                ["overview", "Overview"],
                ["scientific", "Scientific Data"],
                ["visualization", "3D Visualization"],
                ["observations", "Observations"],
                ["evolution", "Formation & Evolution"],
                ["related", "Related Objects"],
                ["references", "References"],
              ] as const
            ).map(([tabKey, tabLabel]) => {
              const active = activeTab === tabKey;
              return (
                <button
                  key={tabKey}
                  onClick={() => setActiveTab(tabKey)}
                  className={`relative py-3 px-3 uppercase tracking-wider text-[11px] whitespace-nowrap transition ${
                    active ? "font-semibold text-cyan-300" : "text-white/50 hover:text-white/80"
                  }`}
                >
                  {tabLabel}
                  {active && (
                    <motion.div
                      layoutId="activeTabUnderlineModal"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Tab 1: Overview */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Age-appropriate explanation level selector */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-cyan-400" />
                    <span className="text-xs font-medium text-white/80">
                      Scientific Explanation Depth:
                    </span>
                  </div>
                  <div className="flex rounded-lg border border-white/10 bg-black/50 p-0.5 text-xs">
                    {(
                      [
                        ["explorer", "Explorer"],
                        ["standard", "Standard"],
                        ["advanced", "Advanced Science"],
                      ] as const
                    ).map(([lvlKey, lvlLabel]) => (
                      <button
                        key={lvlKey}
                        onClick={() => setExplanationLevel(lvlKey)}
                        className={`rounded-md px-3 py-1 text-[11px] transition ${
                          explanationLevel === lvlKey
                            ? "bg-cyan-500/20 text-cyan-300 font-semibold"
                            : "text-white/50 hover:text-white"
                        }`}
                      >
                        {lvlLabel}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Narrative description according to level */}
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 leading-relaxed text-sm text-white/80">
                  <p>
                    {explanationLevel === "explorer"
                      ? target.description.explorer
                      : explanationLevel === "advanced"
                        ? target.description.advanced
                        : target.description.standard}
                  </p>
                </div>

                {/* Simulated detail disclaimer notice */}
                {target.isSimulatedOrModelled && (
                  <div className="rounded-xl border border-amber-500/25 bg-amber-950/20 p-4 text-xs text-amber-200/90 leading-relaxed">
                    <strong className="text-amber-300">
                      Astrophysical Model Reconstruction Notice:
                    </strong>{" "}
                    {target.modelledDetailsNote ||
                      "Certain internal morphological features, planetary atmospheres, or density distributions are simulated using empirical photometric models and observational orientation parameters."}
                  </div>
                )}

                {/* Quick Physical Summary Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-1">
                    <div className="text-[10px] uppercase text-white/40">Distance from Earth</div>
                    <div className="font-mono text-sm font-semibold text-white">
                      {formatLy(target.distanceLy)}
                    </div>
                  </div>
                  {target.spectralType && (
                    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-1">
                      <div className="text-[10px] uppercase text-white/40">Spectral Class</div>
                      <div className="font-mono text-sm font-semibold text-cyan-300">
                        {target.spectralType}
                      </div>
                    </div>
                  )}
                  {target.temperatureK && (
                    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-1">
                      <div className="text-[10px] uppercase text-white/40">Effective Temp</div>
                      <div className="font-mono text-sm font-semibold text-amber-300">
                        {target.temperatureK.toLocaleString()} K
                      </div>
                    </div>
                  )}
                  {target.morphology && (
                    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-1">
                      <div className="text-[10px] uppercase text-white/40">Morphology</div>
                      <div className="font-mono text-sm font-semibold text-purple-300">
                        {target.morphology}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: Scientific Data */}
            {activeTab === "scientific" && (
              <div className="space-y-4">
                <div className="text-xs uppercase tracking-wider text-cyan-300 font-semibold">
                  Astrophysical Parameters &amp; Invariants
                </div>
                <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
                  <table className="w-full text-left text-xs font-mono">
                    <tbody className="divide-y divide-white/5">
                      <tr className="p-3">
                        <td className="p-3 text-white/50">Primary Identifier</td>
                        <td className="p-3 text-white font-semibold">{target.name}</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-white/50">Astronomical Classification</td>
                        <td className="p-3 text-cyan-300">{target.category || target.type}</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-white/50">
                          Physical Distance (Bailer-Jones / NED)
                        </td>
                        <td className="p-3 text-white">
                          {formatLy(target.distanceLy)} ({(target.distanceLy / 3.26156).toFixed(2)}{" "}
                          pc)
                        </td>
                      </tr>
                      {target.apparentMagnitude !== undefined && (
                        <tr>
                          <td className="p-3 text-white/50">Apparent Magnitude (m)</td>
                          <td className="p-3 text-white">{target.apparentMagnitude.toFixed(2)}</td>
                        </tr>
                      )}
                      {target.absoluteMagnitude !== undefined && (
                        <tr>
                          <td className="p-3 text-white/50">Absolute Magnitude (M)</td>
                          <td className="p-3 text-white">{target.absoluteMagnitude.toFixed(2)}</td>
                        </tr>
                      )}
                      {target.radiusSolar !== undefined && (
                        <tr>
                          <td className="p-3 text-white/50">Radius (Solar Radii)</td>
                          <td className="p-3 text-white">{target.radiusSolar.toFixed(3)} R☉</td>
                        </tr>
                      )}
                      {target.radiusEarth !== undefined && (
                        <tr>
                          <td className="p-3 text-white/50">Radius (Earth Radii)</td>
                          <td className="p-3 text-white">{target.radiusEarth.toFixed(3)} R⊕</td>
                        </tr>
                      )}
                      {target.massSolar !== undefined && (
                        <tr>
                          <td className="p-3 text-white/50">Mass (Solar Masses)</td>
                          <td className="p-3 text-white">{target.massSolar.toFixed(3)} M☉</td>
                        </tr>
                      )}
                      {target.massEarth !== undefined && (
                        <tr>
                          <td className="p-3 text-white/50">Mass (Earth Masses)</td>
                          <td className="p-3 text-white">{target.massEarth.toFixed(3)} M⊕</td>
                        </tr>
                      )}
                      {target.redshift !== undefined && (
                        <tr>
                          <td className="p-3 text-white/50">Cosmological Redshift (z)</td>
                          <td className="p-3 text-amber-300">
                            {target.redshift < 0
                              ? `${target.redshift.toFixed(6)} (Infall Blueshift)`
                              : target.redshift.toFixed(5)}
                          </td>
                        </tr>
                      )}
                      {target.ra && target.dec && (
                        <tr>
                          <td className="p-3 text-white/50">ICRS Equatorial Coordinates</td>
                          <td className="p-3 text-white">
                            RA {target.ra} · Dec {target.dec}
                          </td>
                        </tr>
                      )}
                      {target.galacticL !== undefined && target.galacticB !== undefined && (
                        <tr>
                          <td className="p-3 text-white/50">Galactic Coordinates (l, b)</td>
                          <td className="p-3 text-white">
                            l = {target.galacticL.toFixed(2)}°, b = {target.galacticB.toFixed(2)}°
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab 3: 3D Visualization & Scale Comparison */}
            {activeTab === "visualization" && (
              <div className="space-y-6">
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs uppercase tracking-wider text-cyan-300 font-semibold">
                      Hierarchical Scale Comparisons
                    </h3>
                    <span className="text-[10px] font-mono text-white/40">
                      Physical Proportions
                    </span>
                  </div>

                  {/* Visual scale comparison bars */}
                  <div className="space-y-3 font-mono text-xs">
                    <div>
                      <div className="flex justify-between text-white/70 mb-1">
                        <span>Relative to Earth Diameter (12,742 km)</span>
                        <span className="text-cyan-300">
                          {target.radiusEarth
                            ? `${target.radiusEarth.toFixed(1)}x`
                            : target.radiusSolar
                              ? `${(target.radiusSolar * 109).toFixed(0)}x`
                              : "N/A"}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-cyan-400 rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(
                                4,
                                (target.radiusEarth ?? (target.radiusSolar ?? 1) * 109) * 2,
                              ),
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-white/70 mb-1">
                        <span>Light Travel Time from Surface</span>
                        <span className="text-amber-300">
                          {target.distanceLy < 0.0001
                            ? `${((target.distanceLy * 63241 * 149597870.7) / 299792.458).toFixed(1)} sec`
                            : `${formatLy(target.distanceLy).replace("light-years", "yr")}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3D Action Shortcuts */}
                  <div className="pt-4 border-t border-white/10 flex flex-wrap gap-2">
                    <button
                      onClick={toggleAutoOrbit}
                      className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                        isAutoOrbiting
                          ? "border-cyan-400 bg-cyan-500/20 text-cyan-200"
                          : "border-white/15 bg-white/5 text-white/80 hover:bg-white/10"
                      }`}
                    >
                      <Orbit className="h-4 w-4" />
                      <span>{isAutoOrbiting ? "Pause Auto-Orbit" : "Orbit Object in 3D"}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Observations */}
            {activeTab === "observations" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-cyan-300 font-semibold">
                  <Telescope className="h-4 w-4" />
                  <span>Historical &amp; Space Telescope Observations</span>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 leading-relaxed text-sm text-white/80">
                  <p>{target.telescopeObservations}</p>
                </div>
              </div>
            )}

            {/* Tab 5: Formation and Evolution */}
            {activeTab === "evolution" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-amber-300 font-semibold">
                  <Activity className="h-4 w-4" />
                  <span>Astrophysical Lifecycle &amp; Evolution</span>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 leading-relaxed text-sm text-white/80">
                  <p>{target.formationAndEvolution}</p>
                </div>
              </div>
            )}

            {/* Tab 6: Related Objects */}
            {activeTab === "related" && (
              <div className="space-y-4">
                <div className="text-xs uppercase tracking-wider text-cyan-300 font-semibold">
                  Gravitationally &amp; Morphologically Related Celestial Bodies
                </div>
                {target.children && target.children.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {target.children.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => handleNavigateChild(child)}
                        className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-3 text-left transition hover:border-cyan-400/50 hover:bg-white/[0.06]"
                      >
                        <div>
                          <div className="text-sm font-medium text-white group-hover:text-cyan-200">
                            {child.name}
                          </div>
                          <div className="text-xs text-white/50">{child.type.toUpperCase()}</div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-white/40 group-hover:text-cyan-400 group-hover:translate-x-1 transition" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-white/50">
                    No satellite companions or subordinate bodies are cataloged for this entity.
                  </p>
                )}
              </div>
            )}

            {/* Tab 7: References */}
            {activeTab === "references" && (
              <div className="space-y-4">
                <div className="text-xs uppercase tracking-wider text-cyan-300 font-semibold">
                  Authoritative Scientific Citations &amp; Catalog Archives
                </div>
                <ul className="space-y-2">
                  {target.citations.map((cite, i) => (
                    <li
                      key={i}
                      className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs text-white/70 font-mono flex items-start justify-between gap-3"
                    >
                      <span>{cite}</span>
                      <ExternalLink className="h-4 w-4 text-cyan-400 shrink-0" />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
