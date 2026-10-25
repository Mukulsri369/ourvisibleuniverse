// @ts-nocheck
import { SGR_A_DISTANCE_LY } from "@/lib/astronomy/galactic-scene";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "./store";
import { NAMED_STARS } from "./data";
import { ANDROMEDA_NAME, M31_CENTER } from "./andromeda-data";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Maximize2,
  Minimize2,
  X,
  Compass,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export interface CosmicScaleStep {
  id: string;
  name: string;
  subtitle: string;
  scaleMetric: string;
  distanceLy: number;
  lightTime: string;
  cameraDistance: number;
  fov: number;
  description: string;
  keyTarget: string;
  category: "solar_system" | "stars" | "galaxy" | "extragalactic" | "cosmology";
  action: () => void;
}

export function CosmicJourneyNavigator() {
  const isMobile = useIsMobile();
  const currentIndex = useStore((s) => s.cosmicJourneyIndex);
  const setIndex = useStore((s) => s.setCosmicJourneyIndex);
  const nextStep = useStore((s) => s.nextCosmicJourneyStep);
  const prevStep = useStore((s) => s.prevCosmicJourneyStep);
  const isOpen = useStore((s) => s.cosmicJourneyOpen);
  const setIsOpen = useStore((s) => s.setCosmicJourneyOpen);
  const setVisitPlanet = useStore((s) => s.setVisitPlanet);
  const setVisitGalaxy = useStore((s) => s.setVisitGalaxy);
  const setSelected = useStore((s) => s.setSelected);
  const setSelectedObject = useStore((s) => s.setSelectedObject);

  const [isPlaying, setIsPlaying] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const executedIndex = useRef<number | null>(null);

  const steps: CosmicScaleStep[] = [
    {
      id: "earth",
      name: "1. Earth",
      subtitle: "Home World & Biosphere",
      scaleMetric: "12,742 km (0.042 light-sec)",
      distanceLy: 1.58e-5,
      lightTime: "0.00 seconds (Origin)",
      cameraDistance: 1.8e-7,
      fov: 34,
      description:
        "Our blue marble. The only known world harboring life, enveloped in a delicate nitrogen-oxygen atmosphere.",
      keyTarget: "Earth",
      category: "solar_system",
      action: () => {
        setVisitPlanet("Earth");
      },
    },
    {
      id: "moon",
      name: "2. Moon",
      subtitle: "Earth's Natural Satellite",
      scaleMetric: "384,400 km (1.28 light-sec)",
      distanceLy: 1.58e-5,
      lightTime: "1.28 light-seconds",
      cameraDistance: 6.5e-8,
      fov: 32,
      description:
        "Tidally locked ancient companion formed by a giant impact with protoplanet Theia ~4.5 billion years ago.",
      keyTarget: "Moon",
      category: "solar_system",
      action: () => {
        setVisitPlanet("Earth:Moon");
      },
    },
    {
      id: "solar_system",
      name: "3. Solar System",
      subtitle: "Heliosphere & Planetary Orbits",
      scaleMetric: "100 AU (~15 billion km)",
      distanceLy: 0.0016,
      lightTime: "8.3 light-minutes (Sun) to 14 light-hours (Kuiper)",
      cameraDistance: 0.0035,
      fov: 42,
      description:
        "The Sun containing 99.86% of the system mass, circled by eight major planets, asteroid belts, and cometary reservoirs.",
      keyTarget: "Sun",
      category: "solar_system",
      action: () => {
        useStore.getState().flyToStar(NAMED_STARS[0]);
      },
    },
    {
      id: "nearby_stars",
      name: "4. Nearby Stars",
      subtitle: "Solar Interstellar Neighborhood",
      scaleMetric: "40 Light-Years (12.3 pc)",
      distanceLy: 40,
      lightTime: "4.24 yr (Proxima) to 38 yr",
      cameraDistance: 55,
      fov: 44,
      description:
        "Local Interstellar Cloud within the Local Bubble: Alpha Centauri, Sirius, Vega, Procyon, and TRAPPIST-1.",
      keyTarget: "Local Bubble",
      category: "stars",
      action: () => {
        useStore.setState({
          visitPlanet: null,
          visitGalaxy: null,
          selectedObjectId: null,
          selectedStar: null,
          exoVisit: null,
          tourActive: false,
          flyTo: { x: 0, y: 0, z: 0, distance: 48 },
        });
      },
    },
    {
      id: "milky_way",
      name: "5. Milky Way",
      subtitle: "Our Barred Spiral Galaxy",
      scaleMetric: "100,000 Light-Years (30 kpc)",
      distanceLy: 100_000,
      lightTime: "26,000 yr (Galactic Core)",
      cameraDistance: 160_000,
      fov: 48,
      description:
        "200 to 400 billion stars revolving around the central supermassive black hole Sagittarius A* (4.15M solar masses).",
      keyTarget: "Sagittarius A*",
      category: "galaxy",
      action: () => {
        setVisitGalaxy({
          name: "Milky Way",
          x: -SGR_A_DISTANCE_LY,
          y: 0,
          z: 0,
          size: 100000,
          distance: SGR_A_DISTANCE_LY,
          type: "Barred Spiral (SBbc)",
          view: "overview",
        });
      },
    },
    {
      id: "andromeda",
      name: "6. Andromeda (M31)",
      subtitle: "Local Group Major Neighbor",
      scaleMetric: "2.537 Million Light-Years (778 kpc)",
      distanceLy: 2_537_000,
      lightTime: "2.54 Million Years Lookback",
      cameraDistance: 3_200_000,
      fov: 48,
      description:
        "Giant sister spiral containing ~1 trillion stars. Approaching our galaxy at 110 km/s on a collision course in 4.5 Gyr.",
      keyTarget: "M31 Andromeda",
      category: "extragalactic",
      action: () => {
        setVisitGalaxy({
          name: ANDROMEDA_NAME,
          x: M31_CENTER.x,
          y: M31_CENTER.y,
          z: M31_CENTER.z,
          size: 220000,
          distance: 2537000,
          type: "Barred Spiral (SA(s)b)",
          view: "overview",
        });
      },
    },
    {
      id: "galaxy_clusters",
      name: "7. Galaxy Clusters",
      subtitle: "Virgo & Coma Superclusters",
      scaleMetric: "54 Million Light-Years (16.5 Mpc)",
      distanceLy: 54_000_000,
      lightTime: "54 Million Years Lookback (z=0.0038)",
      cameraDistance: 70_000_000,
      fov: 50,
      description:
        "Gravitationally bound swarms of 1,500+ galaxies embedded in hot X-ray plasma and massive dark matter halos.",
      keyTarget: "Virgo Cluster / M87",
      category: "extragalactic",
      action: () => {
        useStore.setState({
          visitPlanet: null,
          visitGalaxy: null,
          selectedObjectId: null,
          selectedStar: null,
          exoVisit: null,
          tourActive: false,
          flyTo: { x: -1.2e7, y: 5.2e7, z: -5e6, distance: 6.5e7 },
        });
      },
    },
    {
      id: "cosmic_web",
      name: "8. Cosmic Web",
      subtitle: "Filamentary Macrostructure & Voids",
      scaleMetric: "1.2 Billion Light-Years (~370 Mpc)",
      distanceLy: 1_200_000_000,
      lightTime: "1.2 Billion Years Lookback (z ≈ 0.1)",
      cameraDistance: 1_800_000_000,
      fov: 52,
      description:
        "Vast scaffolding of dark matter filaments, sheets, and empty voids formed by primordial acoustic density oscillations.",
      keyTarget: "Filament Nodes & Voids",
      category: "cosmology",
      action: () => {
        useStore.setState({
          visitPlanet: null,
          visitGalaxy: null,
          selectedObjectId: null,
          selectedStar: null,
          exoVisit: null,
          tourActive: false,
          flyTo: { x: 0, y: 0, z: 0, distance: 1.5e9 },
          showCosmicWebDensity: true,
        });
      },
    },
    {
      id: "observable_universe",
      name: "9. Observable Universe",
      subtitle: "Cosmic Horizon & CMB Boundary",
      scaleMetric: "46.5 Billion Light-Years (14.26 Gpc)",
      distanceLy: 46_500_000_000,
      lightTime: "13.8 Billion Years (z ≈ 1100 Recombination)",
      cameraDistance: 4.65e10,
      fov: 54,
      description:
        "The spherical boundary enclosing ~2 trillion galaxies and the 2.725 K relic radiation of the Big Bang recombination epoch.",
      keyTarget: "CMB Surface of Last Scattering",
      category: "cosmology",
      action: () => {
        useStore.setState({
          visitPlanet: null,
          visitGalaxy: null,
          selectedObjectId: null,
          selectedStar: null,
          exoVisit: null,
          tourActive: false,
          flyTo: { x: 0, y: 0, z: 0, distance: 4.65e10 },
          showCosmicWebDensity: true,
        });
      },
    },
  ];

  const currentStep = steps[currentIndex] || steps[0];

  // Auto-play cosmic journey tour
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setIndex((currentIndex + 1) % steps.length);
    }, 9000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentIndex, steps.length, setIndex]);

  // Restoring hidden UI must not restart a step or steal an existing camera target.
  useEffect(() => {
    if (executedIndex.current === currentIndex) return;
    if (executedIndex.current === null) {
      executedIndex.current = currentIndex;
      const state = useStore.getState();
      if (
        state.selectedObjectId ||
        state.visitPlanet ||
        state.visitGalaxy ||
        state.exoVisit ||
        (state.selectedStar && state.selectedStar.name !== "Sun")
      )
        return;
    } else executedIndex.current = currentIndex;
    const s = steps[currentIndex];
    if (s) {
      s.action();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  if (!isOpen) {
    return (
      <div
        onClick={(e) => e.stopPropagation()}
        className={`pointer-events-auto fixed left-1/2 z-30 -translate-x-1/2 transition-all ${
          isMobile ? "bottom-5" : "bottom-6"
        }`}
      >
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 rounded-full border border-cyan-500/40 bg-black/85 px-4 py-2 text-xs font-medium text-cyan-300 shadow-2xl backdrop-blur-xl transition hover:border-cyan-400 hover:bg-black hover:text-white"
        >
          <Compass className="h-4 w-4 text-cyan-400 animate-spin-slow" />
          <span>Cosmic Scale Journey (Earth → Observable Universe)</span>
          <span className="rounded bg-cyan-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-cyan-200">
            Step {currentIndex + 1}/9
          </span>
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`pointer-events-auto fixed left-1/2 z-30 -translate-x-1/2 w-[95vw] max-w-4xl transition-all ${
        isMobile ? "bottom-14" : "bottom-6"
      }`}
    >
      <div className="rounded-2xl border border-white/15 bg-black/85 shadow-2xl backdrop-blur-xl overflow-hidden transition-all duration-300">
        {/* Top Header / Context Row */}
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-semibold uppercase tracking-[0.2em] text-cyan-300 text-[10px]">
              Cosmic Scale Hierarchy
            </span>
            <span className="text-white/40 hidden sm:inline">·</span>
            <span className="font-mono text-white/70 text-[11px] hidden sm:inline">
              Step {currentIndex + 1} of {steps.length}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Auto Play / Pause button */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              title={isPlaying ? "Pause Automated Cosmic Tour" : "Play Automated Cosmic Tour"}
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition ${
                isPlaying
                  ? "border-amber-400/50 bg-amber-500/20 text-amber-300"
                  : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{isPlaying ? "Pause Tour" : "Auto-Tour"}</span>
            </button>

            {/* Collapse / Expand Toggle */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? "Expand Scale Details" : "Collapse to Compact Bar"}
              className="grid h-7 w-7 place-items-center rounded-lg border border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
            >
              {collapsed ? (
                <Maximize2 className="h-3.5 w-3.5" />
              ) : (
                <Minimize2 className="h-3.5 w-3.5" />
              )}
            </button>

            {/* Close Toggle */}
            <button
              onClick={() => setIsOpen(false)}
              title="Close Cosmic Journey Bar (Can reopen from Toolbar or Site Map)"
              className="grid h-7 w-7 place-items-center rounded-lg border border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Expanded Scale Info Card */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="px-4 py-2.5 border-b border-white/5 bg-gradient-to-r from-cyan-950/20 via-black/40 to-violet-950/20"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm md:text-base font-medium text-white tracking-wide">
                      {currentStep.name}
                    </h3>
                    <span className="text-xs text-cyan-300 font-mono">{currentStep.subtitle}</span>
                  </div>
                  <p className="text-xs text-white/60 line-clamp-2 max-w-xl">
                    {currentStep.description}
                  </p>
                </div>

                <div className="flex flex-wrap md:flex-col items-start md:items-end gap-1.5 font-mono text-[11px] text-white/70 bg-white/[0.03] p-2 rounded-lg border border-white/10">
                  <div className="text-cyan-200">
                    <span className="text-white/40">Scale:</span> {currentStep.scaleMetric}
                  </div>
                  <div className="text-amber-200">
                    <span className="text-white/40">Lookback:</span> {currentStep.lightTime}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stepper Buttons Row */}
        <div className="flex items-center justify-between px-2 py-1.5 gap-1 overflow-x-auto no-scrollbar">
          <button
            onClick={prevStep}
            disabled={currentIndex === 0}
            aria-label="Previous scale level"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10 text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex flex-1 items-center justify-around gap-1">
            {steps.map((step, idx) => {
              const active = idx === currentIndex;
              return (
                <button
                  key={step.id}
                  onClick={() => {
                    if (idx === currentIndex) steps[idx].action();
                    else setIndex(idx);
                  }}
                  className={`group relative flex flex-1 flex-col items-center justify-center rounded-lg px-1.5 py-1 transition ${
                    active
                      ? "bg-white/15 text-cyan-300 font-semibold shadow-inner"
                      : "text-white/50 hover:bg-white/5 hover:text-white/80"
                  }`}
                >
                  <span className="text-[10px] md:text-[11px] tracking-tight whitespace-nowrap">
                    {step.name.replace(/^\d+\.\s*/, "")}
                  </span>
                  <div
                    className={`mt-1 h-1 w-full rounded-full transition-all ${
                      active
                        ? "bg-cyan-400 shadow-[0_0_8px_#22d3ee]"
                        : "bg-white/15 group-hover:bg-white/30"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <button
            onClick={nextStep}
            disabled={currentIndex === steps.length - 1}
            aria-label="Next scale level"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10 text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
