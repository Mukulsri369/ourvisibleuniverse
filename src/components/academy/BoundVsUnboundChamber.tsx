import React, { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Compass,
  Orbit,
  Atom,
  Globe,
  Radio,
  Layers,
  Sparkles,
  Info,
  Maximize2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface BoundVsUnboundChamberProps {
  onInteract?: () => void;
}

interface CosmicScaleSystem {
  id: string;
  name: string;
  scaleLabel: string;
  bindingForce: string;
  bindingAcceleration: string;
  expansionAcceleration: string;
  forceRatio: string;
  isBound: boolean;
  behaviorExplanation: string;
  icon: React.ComponentType<{ className?: string }>;
}

const COSMIC_SCALES: CosmicScaleSystem[] = [
  {
    id: "atom",
    name: "Subatomic / Atoms",
    scaleLabel: "~10⁻¹⁰ meters (0.1 nanometer)",
    bindingForce: "Electromagnetism (Coulomb force)",
    bindingAcceleration: "~10²² m/s²",
    expansionAcceleration: "~10⁻⁴⁵ m/s²",
    forceRatio: "10⁶⁷ : 1 (Overwhelmingly Bound)",
    isBound: true,
    behaviorExplanation:
      "Electromagnetic forces holding electrons to the nucleus exceed cosmic expansion acceleration by 67 orders of magnitude. Atoms, DNA, and human bodies NEVER expand with space.",
    icon: Atom,
  },
  {
    id: "solar_system",
    name: "Solar System (Earth–Sun)",
    scaleLabel: "1 AU (~1.5 × 10¹¹ meters)",
    bindingForce: "Solar Gravity",
    bindingAcceleration: "~6 × 10⁻³ m/s²",
    expansionAcceleration: "~10⁻²⁴ m/s²",
    forceRatio: "10²¹ : 1 (Completely Bound)",
    isBound: true,
    behaviorExplanation:
      "The Sun's gravitational grip holds planets in stable Keplerian orbits. Planetary orbits do not expand. Earth remains 1 AU from the Sun.",
    icon: Globe,
  },
  {
    id: "milky_way",
    name: "Milky Way Galaxy",
    scaleLabel: "~100,000 light-years (~30 kpc)",
    bindingForce: "Galactic Dark Matter & Stellar Gravity",
    bindingAcceleration: "~2 × 10⁻¹⁰ m/s²",
    expansionAcceleration: "~10⁻¹⁸ m/s²",
    forceRatio: "10⁸ : 1 (Virialized & Bound)",
    isBound: true,
    behaviorExplanation:
      "Stars and gas clouds orbit the galactic center in virial equilibrium. Galaxies themselves DO NOT grow or expand because of the metric expansion of space!",
    icon: Orbit,
  },
  {
    id: "local_group",
    name: "The Local Group (Milky Way & Andromeda)",
    scaleLabel: "~3.3 million light-years (~1 Mpc)",
    bindingForce: "Mutual Cluster Gravity",
    bindingAcceleration: "~10⁻¹² m/s²",
    expansionAcceleration: "~10⁻¹² m/s²",
    forceRatio: "Gravity Overcomes Expansion",
    isBound: true,
    behaviorExplanation:
      "The mutual gravity of the Milky Way and Andromeda completely halted expansion between them billions of years ago. Andromeda is blueshifted and falling toward us at 300 km/s!",
    icon: Layers,
  },
  {
    id: "intercluster_void",
    name: "Intercluster Voids (Cosmic Web)",
    scaleLabel: "> 30 million light-years (> 10 Mpc)",
    bindingForce: "None (Too distant for gravitational binding)",
    bindingAcceleration: "< 10⁻¹⁵ m/s²",
    expansionAcceleration: "Dominates across gigaparsecs",
    forceRatio: "Expansion Dominates (Unbound)",
    isBound: false,
    behaviorExplanation:
      "On scales larger than virialized galaxy clusters, gravity is too weak to resist the Hubble flow. This is where metric cosmic expansion takes place!",
    icon: Maximize2,
  },
];

export function BoundVsUnboundChamber({ onInteract }: BoundVsUnboundChamberProps) {
  const [selectedScaleId, setSelectedScaleId] = useState<string>("milky_way");
  const [activeHorizonTab, setActiveHorizonTab] = useState<"particle" | "hubble" | "event">(
    "particle",
  );

  const activeScale = COSMIC_SCALES.find((s) => s.id === selectedScaleId) || COSMIC_SCALES[2];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-orange-950/30 to-slate-900/80 p-5 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Bound Physics & Cosmic Horizons
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                Birkhoff&apos;s Theorem
              </span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <ShieldCheck className="size-5 text-amber-400" />
              Bound Systems vs Cosmic Horizons
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Understand why atoms, planets, and galaxies DO NOT expand, and learn why the
              observable universe horizon is NOT a physical edge to all existence.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Scale Hierarchy & Bound Comparator (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 backdrop-blur-xl space-y-4">
            <span className="font-bold text-white text-sm flex items-center gap-1.5 border-b border-white/10 pb-2">
              <Layers className="size-4 text-amber-400" />
              Physical Scale Selector: Does It Expand?
            </span>

            {/* System Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {COSMIC_SCALES.map((scale) => {
                const Icon = scale.icon;
                const isSelected = selectedScaleId === scale.id;
                return (
                  <button
                    key={scale.id}
                    onClick={() => {
                      setSelectedScaleId(scale.id);
                      if (onInteract) onInteract();
                    }}
                    className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
                      isSelected
                        ? "bg-amber-500/20 border-amber-500/50 text-white shadow-md shadow-amber-950/40"
                        : "bg-slate-950/60 border-white/5 text-slate-400 hover:text-white hover:bg-slate-950"
                    }`}
                  >
                    <Icon
                      className={`size-5 mt-0.5 shrink-0 ${
                        scale.isBound ? "text-emerald-400" : "text-rose-400"
                      }`}
                    />
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        {scale.name}
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                            scale.isBound
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          }`}
                        >
                          {scale.isBound ? "NO EXPANSION" : "EXPANDS"}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{scale.scaleLabel}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Scale Analysis Card */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-white/10 space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="font-bold text-white text-sm">{activeScale.name}</span>
                <span className="text-xs font-mono text-amber-400 font-semibold">
                  {activeScale.forceRatio}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Binding Force:</span>
                  <span className="text-slate-200 font-semibold">{activeScale.bindingForce}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Inward Acceleration:</span>
                  <span className="text-cyan-300 font-mono">{activeScale.bindingAcceleration}</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed pt-1">
                {activeScale.behaviorExplanation}
              </p>
            </div>
          </div>
        </div>

        {/* Right: The Observable Universe Horizons & Mythbuster (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 backdrop-blur-xl space-y-4">
            <span className="font-bold text-white text-sm flex items-center gap-1.5 border-b border-white/10 pb-2">
              <Radio className="size-4 text-purple-400" />
              Three Crucial Cosmological Horizons
            </span>

            {/* Horizon Selector */}
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: "particle", label: "Particle" },
                { id: "hubble", label: "Hubble R" },
                { id: "event", label: "Event" },
              ].map((h) => (
                <button
                  key={h.id}
                  onClick={() => {
                    setActiveHorizonTab(h.id as "particle" | "hubble" | "event");
                    if (onInteract) onInteract();
                  }}
                  className={`py-2 px-1 text-center text-xs font-semibold rounded-xl border transition-all ${
                    activeHorizonTab === h.id
                      ? "bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm"
                      : "bg-slate-950/60 border-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  {h.label}
                </button>
              ))}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-white/10 text-xs space-y-2 leading-relaxed">
              {activeHorizonTab === "particle" && (
                <div>
                  <div className="font-bold text-purple-300 mb-1">
                    Particle Horizon (~46.5 Billion Light-Years Radius):
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    The farthest distance from which light could have traveled to reach us since the
                    Big Bang 13.8 billion years ago. Even though the universe is 13.8 Gyr old, the
                    expansion of space carried those emission points to 46.5 Gly away today (93 Gly
                    diameter).
                  </p>
                </div>
              )}

              {activeHorizonTab === "hubble" && (
                <div>
                  <div className="font-bold text-cyan-300 mb-1">
                    Hubble Radius (c / H₀ ≈ 14.4 Billion Light-Years):
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    The distance where the recession velocity $v = H_0 \\cdot d$ equals the speed of
                    light $c$. Photons emitted beyond this radius can still reach us if the Hubble
                    sphere expands or expansion decelerated.
                  </p>
                </div>
              )}

              {activeHorizonTab === "event" && (
                <div>
                  <div className="font-bold text-rose-300 mb-1">
                    Cosmological Event Horizon (~17.4 Billion Light-Years):
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    Because Dark Energy is accelerating cosmic expansion, light emitted *today* from
                    galaxies beyond this boundary can NEVER reach us in the infinite future!
                  </p>
                </div>
              )}
            </div>

            {/* Critical Mythbuster Warning Box */}
            <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-500/30 space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 text-red-300 font-bold">
                <ShieldAlert className="size-4 shrink-0 text-red-400" />
                Cosmological Fact Check
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                The Observable Universe is <strong>NOT the physical edge of all existence</strong>!
                There is no wall or empty cliff. An observer 40 billion light-years away sees their
                own 46.5 Gly sphere centered on them, with galaxies continuing smoothly through
                infinite space.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
