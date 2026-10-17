import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "./store";
import {
  Sparkles,
  X,
  Compass,
  Telescope,
  History,
  Calendar,
  ArrowRight,
  ExternalLink,
  Award,
} from "lucide-react";

export interface DiscoveryStory {
  id: string;
  year: number;
  title: string;
  discoverer: string;
  institution: string;
  summary: string;
  historicalContext: string;
  scientificImpact: string;
  nobelPrize?: string;
  citation: string;
  targetScale: string;
  flyToAction: () => void;
}

export function MajorDiscoveriesModal() {
  const open = useStore((s) => s.discoveriesModalOpen);
  const setOpen = useStore((s) => s.setDiscoveriesModalOpen);
  const flyToStar = useStore((s) => s.flyToStar);
  const setVisitPlanet = useStore((s) => s.setVisitPlanet);
  const setVisitGalaxy = useStore((s) => s.setVisitGalaxy);
  const setSelectedObject = useStore((s) => s.setSelectedObject);

  const [selectedStoryId, setSelectedStoryId] = useState<string>("hubble_expansion");

  const stories: DiscoveryStory[] = [
    {
      id: "hubble_expansion",
      year: 1929,
      title: "Discovery of Cosmic Expansion (Hubble's Law)",
      discoverer: "Edwin Hubble & Milton Humason",
      institution: "Mount Wilson Observatory (100-inch Hooker Telescope)",
      summary: "By measuring Cepheid variable stars in Andromeda (M31) and Triangulum (M33), Hubble confirmed galaxies are 'island universes' outside the Milky Way and that distant galaxies recede with velocities proportional to their distance.",
      historicalContext: "Before 1925, astronomers debated during the Great Debate whether nebulae were spiral clouds within our Milky Way or distant independent galaxies. Hubble identified Cepheid variable V1 in Andromeda, resolving the debate.",
      scientificImpact: "Overturned the static cosmological model of Einstein, leading to the formulation of the expanding universe paradigm and the theoretical foundation for the Big Bang.",
      citation: "Hubble, E. (1929). 'A relation between distance and radial velocity among extra-galactic nebulae'. PNAS 15 (3): 168–173.",
      targetScale: "Andromeda Galaxy (M31 · 2.537 Mly)",
      flyToAction: () => {
        setVisitPlanet(null);
        setSelectedObject(null);
        setVisitGalaxy({
          name: "Andromeda",
          x: -2537000,
          y: 0,
          z: 0,
          size: 220000,
          distance: 2537000,
          type: "Spiral (SA(s)b)",
          view: "overview",
        });
        setOpen(false);
      },
    },
    {
      id: "first_exoplanet",
      year: 1995,
      title: "First Exoplanet Around a Sun-like Star (51 Pegasi b)",
      discoverer: "Michel Mayor & Didier Queloz",
      institution: "Observatoire de Haute-Provence (ELODIE Spectrograph)",
      summary: "Discovered the first confirmed planet orbiting a main-sequence solar-type star: 51 Pegasi b (Dimidium), a 'Hot Jupiter' with an orbital period of only 4.23 days.",
      historicalContext: "Standard solar system formation models assumed giant gas planets could only form beyond the ice line (~3–5 AU). The discovery of a gas giant skimming its star at 0.05 AU revolutionized planetary migration theories.",
      scientificImpact: "Triggered the modern exoplanet revolution, leading to over 5,500 cataloged exoplanets discovered by Kepler, TESS, and radial velocity surveys.",
      nobelPrize: "Nobel Prize in Physics (2019)",
      citation: "Mayor, M., & Queloz, D. (1995). 'A Jupiter-mass companion to a solar-type star'. Nature 378: 355–359.",
      targetScale: "51 Pegasi b Exoplanetary System (50.5 ly)",
      flyToAction: () => {
        setVisitPlanet(null);
        setVisitGalaxy(null);
        setSelectedObject(null);
        flyToStar({
          name: "51 Pegasi",
          x: 28.5,
          y: 36.2,
          z: 19.8,
          radius: 1.24,
          temperature: 5768,
          luminosity: 1.34,
          ra: "22h 57m 28s",
          dec: "+20° 46′ 08″",
          galacticL: 90.1,
          galacticB: -30.7,
          distance: 50.45,
          spectral: "G2IV",
          planets: 1,
          description: "Host star of the first discovered hot Jupiter exoplanet (51 Pegasi b).",
        });
        setOpen(false);
      },
    },
    {
      id: "cmb_discovery",
      year: 1965,
      title: "Discovery of Cosmic Microwave Background Radiation",
      discoverer: "Arno Penzias & Robert Wilson",
      institution: "Bell Laboratories (Holmdel Horn Antenna)",
      summary: "Serendipitously detected an isotropic 2.725 K thermal microwave glow permeating all of space: the cooled relic radiation emitted 380,000 years after the Big Bang.",
      historicalContext: "Penzias and Wilson initially thought the constant residual noise was pigeon droppings on the antenna dish. Meanwhile, Dicke and Peebles at Princeton were calculating the exact predicted relic radiation from primeval nucleosynthesis.",
      scientificImpact: "Provided decisive empirical confirmation of the Big Bang over the rival Steady State cosmological theory.",
      nobelPrize: "Nobel Prize in Physics (1978)",
      citation: "Penzias, A. A., & Wilson, R. W. (1965). 'A Measurement of Excess Antenna Temperature at 4080 Mc/s'. ApJ 142: 419–421.",
      targetScale: "Observable Universe Recombination Horizon (46.5 Gly)",
      flyToAction: () => {
        setVisitPlanet(null);
        setVisitGalaxy(null);
        setSelectedObject(null);
        useStore.setState({
          flyTo: { x: 0, y: 0, z: 0, distance: 4.65e10 },
          showCosmicWebDensity: true,
        });
        setOpen(false);
      },
    },
    {
      id: "black_hole_shadow",
      year: 2019,
      title: "First Direct Image of a Black Hole Shadow (M87*)",
      discoverer: "Event Horizon Telescope (EHT) Collaboration",
      institution: "Global Very Long Baseline Interferometry (VLBI) Array",
      summary: "Synthesized an Earth-sized telescope array to image the asymmetric photon emission ring and event horizon shadow of the 6.5-billion solar mass black hole in giant elliptical M87.",
      historicalContext: "Black holes were considered purely mathematical solutions to Einstein's field equations for decades. EHT achieved an angular resolution of 20 microarcseconds to resolve the photon sphere.",
      scientificImpact: "Verified general relativity under extreme gravitational field limits and confirmed Kerr metric predictions for rotating supermassive black holes.",
      citation: "The Event Horizon Telescope Collaboration (2019). 'First M87 Event Horizon Telescope Results. I. The Shadow of the Supermassive Black Hole'. ApJL 875: L1.",
      targetScale: "Virgo Cluster / M87* Core (53.5 Mly)",
      flyToAction: () => {
        setVisitPlanet(null);
        setVisitGalaxy(null);
        setSelectedObject(null);
        useStore.setState({
          flyTo: { x: -1.2e7, y: 5.2e7, z: -5e6, distance: 100 },
        });
        setOpen(false);
      },
    },
    {
      id: "gravitational_waves",
      year: 2015,
      title: "First Direct Detection of Gravitational Waves (GW150914)",
      discoverer: "LIGO Scientific Collaboration & Virgo Collaboration",
      institution: "Laser Interferometer Gravitational-Wave Observatory (Hanford & Livingston)",
      summary: "Detected the catastrophic chirp signal of two stellar-mass black holes (36 M☉ and 29 M☉) merging 1.3 billion light-years away, releasing 3 solar masses of pure gravitational energy.",
      historicalContext: "Albert Einstein predicted gravitational ripples in spacetime in 1916 but believed they were too weak to ever be measured. LIGO measured a displacement of less than 1/10,000 the diameter of a proton.",
      scientificImpact: "Opened the era of multi-messenger gravitational-wave astronomy.",
      nobelPrize: "Nobel Prize in Physics (2017)",
      citation: "Abbott, B. P. et al. (2016). 'Observation of Gravitational Waves from a Binary Black Hole Merger'. Phys. Rev. Lett. 116: 061102.",
      targetScale: "Cosmic Deep Space (1.3 Gly)",
      flyToAction: () => {
        setVisitPlanet(null);
        setVisitGalaxy(null);
        setSelectedObject(null);
        useStore.setState({
          flyTo: { x: 5e8, y: -2e8, z: 8e8, distance: 1.3e9 },
        });
        setOpen(false);
      },
    },
    {
      id: "pale_blue_dot",
      year: 1990,
      title: "Pale Blue Dot: Earth Viewed from 6 Billion Kilometers",
      discoverer: "Voyager 1 Imaging Science Subsystem (Carl Sagan Request)",
      institution: "NASA Jet Propulsion Laboratory (JPL)",
      summary: "As Voyager 1 completed its primary mission, its camera turned back toward the Sun across 40.5 AU (6 billion km) to take the iconic family portrait showing Earth as a suspended pixel in a scattered sunbeam.",
      historicalContext: "Carl Sagan insisted that Voyager take one last photograph of Earth before turning off its cameras to conserve energy, inspiring humanity's consciousness of cosmic vulnerability.",
      scientificImpact: "Remains the foundational symbol of human space exploration, cosmic perspective, and ecological stewardship.",
      citation: "Sagan, C. (1994). 'Pale Blue Dot: A Vision of the Human Future in Space'. Random House.",
      targetScale: "Outer Solar System (40 AU Heliospheric Vantage)",
      flyToAction: () => {
        setVisitPlanet("Earth");
        setOpen(false);
      },
    },
  ];

  const activeStory = stories.find((s) => s.id === selectedStoryId) || stories[0];

  if (!open) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 backdrop-blur-md"
        style={{ background: "rgba(2, 4, 12, 0.82)" }}
        onClick={() => setOpen(false)}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.22 }}
          className="relative flex h-[88vh] w-full max-w-4xl flex-col rounded-2xl border border-white/15 bg-[#090b1c] text-white shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-white/[0.02]">
            <div className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <History className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-white tracking-wide">
                  Landmark Discoveries in Observational Astrophysics
                </h2>
                <p className="text-xs text-white/50">
                  Interactive guided narratives of milestones that transformed our understanding of the universe
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="grid h-8 w-8 place-items-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Main Grid: Story List on left, details on right */}
          <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
            {/* Story selector sidebar */}
            <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-white/10 overflow-y-auto p-3 space-y-1.5 bg-black/30">
              {stories.map((story) => {
                const active = story.id === selectedStoryId;
                return (
                  <button
                    key={story.id}
                    onClick={() => setSelectedStoryId(story.id)}
                    className={`w-full rounded-xl p-3 text-left transition flex flex-col gap-1 border ${
                      active
                        ? "border-cyan-400 bg-cyan-500/15 text-white"
                        : "border-white/5 bg-white/[0.02] text-white/70 hover:bg-white/[0.05]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-cyan-300 font-semibold">
                        {story.year}
                      </span>
                      {story.nobelPrize && (
                        <span className="flex items-center gap-1 text-[9px] text-amber-300 font-mono">
                          <Award className="h-3 w-3" />
                          Nobel
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-medium text-white line-clamp-1">
                      {story.title}
                    </div>
                    <div className="text-[10px] text-white/45 truncate">
                      {story.discoverer}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Story Detail Pane */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-cyan-500/20 text-cyan-300 font-mono text-xs px-2 py-0.5 border border-cyan-500/30">
                    {activeStory.year}
                  </span>
                  <span className="text-xs text-white/40">·</span>
                  <span className="text-xs text-white/70 font-mono">
                    {activeStory.institution}
                  </span>
                </div>
                <h3 className="text-xl font-medium text-white tracking-wide">
                  {activeStory.title}
                </h3>
                <div className="text-xs text-cyan-300">
                  Principal Investigators: {activeStory.discoverer}
                </div>
              </div>

              {/* Fly To Scene Action Banner */}
              <div className="flex items-center justify-between rounded-xl border border-cyan-500/30 bg-cyan-950/30 p-4">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-cyan-300 font-semibold">
                    Astronomical Vantage Target
                  </div>
                  <div className="text-xs text-white/80 font-mono mt-0.5">
                    {activeStory.targetScale}
                  </div>
                </div>
                <button
                  onClick={activeStory.flyToAction}
                  className="flex items-center gap-2 rounded-lg bg-cyan-400 px-3.5 py-1.5 text-xs font-semibold text-black shadow-lg hover:bg-cyan-300 transition"
                >
                  <span>Fly To Location</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {/* Narrative Content */}
              <div className="space-y-4 text-xs leading-relaxed text-white/80">
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-1.5">
                  <div className="text-[10px] uppercase tracking-wider text-cyan-300 font-semibold">
                    Discovery Summary
                  </div>
                  <p className="text-sm leading-relaxed text-white/90">
                    {activeStory.summary}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-1.5">
                  <div className="text-[10px] uppercase tracking-wider text-amber-300 font-semibold">
                    Historical Scientific Context
                  </div>
                  <p>{activeStory.historicalContext}</p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-1.5">
                  <div className="text-[10px] uppercase tracking-wider text-purple-300 font-semibold">
                    Astrophysical Paradigm Impact
                  </div>
                  <p>{activeStory.scientificImpact}</p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-[11px] font-mono text-white/50">
                  <strong className="text-white/70">Historical Citation:</strong>{" "}
                  {activeStory.citation}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
