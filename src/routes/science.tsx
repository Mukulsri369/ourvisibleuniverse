import React, { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Atom,
  Compass,
  Database,
  Eye,
  Orbit,
  Radio,
  Scale,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { CosmicBackgroundCanvas } from "@/components/site/CosmicBackgroundCanvas";
import { ScrollScrubVideoCanvas } from "@/components/site/ScrollScrubVideoCanvas";

const KERR_VIDEO_1 =
  "/assets/aistudio/Rotating_Kerr_black_hole_visuali__1080p_20261024024512_4b03a008.mp4";
const KERR_MOBILE_1 = "/assets/aistudio/kerr1_mobile.mp4";
const KERR_POSTER_1 = "/assets/aistudio/kerr1_poster.jpg";

const KERR_VIDEO_2 =
  "/assets/aistudio/Rotating_Kerr_black_hole_visuali__1080p_20261024024506_51d485ff.mp4";
const KERR_MOBILE_2 = "/assets/aistudio/kerr2_mobile.mp4";
const KERR_POSTER_2 = "/assets/aistudio/kerr2_poster.jpg";

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = (x: number) => {
  const c = clamp(x, 0, 1);
  return c * c * (3 - 2 * c);
};

const SCIENTIFIC_PILLARS = [
  {
    code: "01",
    tag: "ASTROMETRY & CATALOGUES",
    title: "Measured Foundations",
    icon: Database,
    accent: "text-[#f5d08a]",
    description:
      "Positions, distances, spectral classifications, and physical properties are grounded in established astronomical catalogues including ESA Gaia DR3, Hipparcos, and NASA/IPAC mission archives.",
    metrics: "GAIA DR3 · PARSEC PRECISION",
  },
  {
    code: "02",
    tag: "KEPLERIAN DYNAMICS",
    title: "Solar & Planetary Learning",
    icon: Orbit,
    accent: "text-[#38bdf8]",
    description:
      "Planet and moon motion introduces real orbital relationships, while close-range inspection supports comparative planetology across rocky worlds, gas giants, ring systems, and confirmed exoplanets.",
    metrics: "KEPLERIAN EPHEMERIDES",
  },
  {
    code: "03",
    tag: "SPECTRAL EVOLUTION",
    title: "Stellar & Galactic Learning",
    icon: Sparkles,
    accent: "text-[#f5d08a]",
    description:
      "Blackbody spectral classes (OBAFGKM), stellar lifetimes, and remnants illustrate how stars evolve. Galaxy views connect morphology, rotation curves, and hosted star systems to large-scale cosmic structure.",
    metrics: "BLACKBODY SPECTROSCOPY",
  },
  {
    code: "04",
    tag: "GENERAL RELATIVITY",
    title: "Extreme-Object Learning",
    icon: Atom,
    accent: "text-[#38bdf8]",
    description:
      "Rotating Kerr black holes, quasars, pulsars, and relativistic accretion structures are rendered with physically inspired models of gravitational lensing, frame-dragging, and Doppler beaming.",
    metrics: "KERR METRIC RAYMARCHING",
  },
  {
    code: "05",
    tag: "LOGARITHMIC OPTICS",
    title: "Responsible Visualization",
    icon: Scale,
    accent: "text-[#f5d08a]",
    description:
      "Space spans scales and luminosity ratios that cannot be shown literally on a single display. Presentation magnification and procedural detail keep celestial bodies legible while preserving physical relationships.",
    metrics: "DYNAMIC EXPOSURE CONTROL",
  },
  {
    code: "06",
    tag: "EMPIRICAL INTEGRITY",
    title: "Modelled vs. Confirmed Systems",
    icon: ShieldCheck,
    accent: "text-[#38bdf8]",
    description:
      "When no confirmed planetary system is available for a distant star, a hosted system is explicitly marked as modelled to support exploration—never misrepresented as a confirmed observational discovery.",
    metrics: "TRANSPARENT PROVENANCE",
  },
];

const EMPIRICAL_VS_SIMULATION = [
  {
    category: "EMPIRICAL OBSERVATION",
    code: "OBS-01",
    title: "2.7255 K Cosmic Microwave Background",
    detail:
      "COBE/FIRAS, WMAP, and Planck blackbody spectrum measurements anchoring early-universe thermal equilibrium.",
  },
  {
    category: "EMPIRICAL OBSERVATION",
    code: "OBS-02",
    title: "Primordial Nucleosynthesis & JWST Spectra",
    detail:
      "Big Bang Nucleosynthesis (BBN) light-element abundances and high-redshift spectroscopic detections from JWST.",
  },
  {
    category: "NUMERICAL SIMULATION",
    code: "SIM-01",
    title: "Large-Scale Filamentary Cosmic Web",
    detail:
      "IllustrisTNG-inspired magnetohydrodynamic dark-matter and baryonic structure formation snapshots across cosmic time.",
  },
  {
    category: "RELATIVISTIC METRIC",
    code: "GR-01",
    title: "Metric Expansion of Spacetime",
    detail:
      "The Big Bang is modeled strictly as the FLRW metric expansion of space itself—never as an explosion into pre-existing space.",
  },
];

function ScienceHeroChoreography({
  registerListener,
  scrubToProgress,
  onScrollToContent,
}: {
  registerListener: (fn: (smoothedProgress: number, rawProgress: number) => void) => () => void;
  scrubToProgress: (targetProgress: number) => void;
  onScrollToContent: () => void;
}) {
  const [activeBeat, setActiveBeat] = useState<number>(0);

  const beat0Ref = useRef<HTMLDivElement | null>(null);
  const beat1Ref = useRef<HTMLDivElement | null>(null);
  const beat2Ref = useRef<HTMLDivElement | null>(null);
  const scrollBarRef = useRef<HTMLDivElement | null>(null);
  const activeBeatRef = useRef<number>(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    return registerListener((pr) => {
      const nextBeat = pr < 0.34 ? 0 : pr < 0.72 ? 1 : 2;
      if (nextBeat !== activeBeatRef.current) {
        activeBeatRef.current = nextBeat;
        setActiveBeat(nextBeat);
      }

      const cop0 = pr > 0.33 ? 0 : smooth(1 - pr / 0.3);
      const cop1 =
        pr < 0.27 || pr > 0.75
          ? 0
          : pr < 0.42
            ? smooth((pr - 0.27) / 0.15)
            : smooth(1 - (pr - 0.58) / 0.17);
      const cop2 = pr < 0.68 ? 0 : smooth((pr - 0.68) / 0.16);

      if (beat0Ref.current) {
        beat0Ref.current.style.opacity = String(cop0);
        beat0Ref.current.style.transform = reduce
          ? "none"
          : `translate3d(0, ${((0.06 - pr) * 9).toFixed(2)}vh, 0)`;
        beat0Ref.current.style.pointerEvents = cop0 > 0.45 ? "auto" : "none";
      }

      if (beat1Ref.current) {
        beat1Ref.current.style.opacity = String(cop1);
        beat1Ref.current.style.transform = reduce
          ? "none"
          : `translate3d(0, ${((0.5 - pr) * 8).toFixed(2)}vh, 0)`;
        beat1Ref.current.style.pointerEvents = cop1 > 0.45 ? "auto" : "none";
      }

      if (beat2Ref.current) {
        beat2Ref.current.style.opacity = String(cop2);
        beat2Ref.current.style.transform = reduce
          ? "none"
          : `translate3d(0, ${((0.86 - pr) * 7).toFixed(2)}vh, 0)`;
        beat2Ref.current.style.pointerEvents = cop2 > 0.45 ? "auto" : "none";
      }

      if (scrollBarRef.current) {
        scrollBarRef.current.style.width = `${Math.max(4, pr * 100).toFixed(1)}%`;
      }
    });
  }, [registerListener]);

  const chapters = [
    { idx: 0, code: "01", label: "Methodology", target: 0.04 },
    { idx: 1, code: "02", label: "Catalogues", target: 0.5 },
    { idx: 2, code: "03", label: "Relativity", target: 0.88 },
  ];

  return (
    <div className="mx-auto flex h-full w-full max-w-7xl flex-col justify-between px-6 pt-24 pb-10 lg:px-10">
      {/* Top Bar */}
      <div className="pointer-events-auto flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div className="flex items-center gap-3">
          <span className="size-1.5 rounded-full bg-[#f5d08a]" />
          <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/60">
            SCIENTIFIC FOUNDATIONS · EMPIRICAL ASTROPHYSICS
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1 rounded-full border border-white/10 bg-[#05060a]/70 p-1 backdrop-blur-xl sm:flex">
            {chapters.map((ch) => (
              <button
                key={ch.code}
                type="button"
                onClick={() => scrubToProgress(ch.target)}
                className={`rounded-full px-3.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] transition-all ${
                  activeBeat === ch.idx
                    ? "bg-[#f5d08a] font-semibold text-[#05060a]"
                    : "text-white/50 hover:text-white"
                }`}
              >
                {ch.code} · {ch.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onScrollToContent}
            className="rounded-full border border-white/15 bg-white/[0.04] px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-white/75 transition-colors hover:border-[#f5d08a]/50 hover:text-white"
          >
            Read Dossier ↓
          </button>
        </div>
      </div>

      {/* Right-Side Route Rail */}
      <aside
        aria-label="Science chapter rail"
        className="pointer-events-auto fixed right-6 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-center gap-2 rounded-full border border-white/10 bg-[#05060a]/65 px-2 py-3 backdrop-blur-xl lg:flex"
      >
        {chapters.map((ch, idx) => (
          <React.Fragment key={ch.code}>
            <button
              type="button"
              onClick={() => scrubToProgress(ch.target)}
              className={`flex size-8 items-center justify-center rounded-full font-mono text-[10px] transition-all ${
                activeBeat === ch.idx
                  ? "border border-[#f5d08a]/60 bg-[#f5d08a]/15 font-bold text-[#f5d08a]"
                  : "text-white/40 hover:text-white/80"
              }`}
              title={ch.label}
            >
              {ch.code}
            </button>
            {idx < chapters.length - 1 && <span className="h-4 w-px bg-white/10" />}
          </React.Fragment>
        ))}
      </aside>

      {/* Center Stage: 3 Scroll-Choreographed Beats */}
      <div className="relative my-auto flex min-h-[340px] items-center">
        {/* BEAT 01 */}
        <div ref={beat0Ref} className="max-w-3xl will-change-[opacity,transform]">
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.34em] text-[#f5d08a]">
            SCIENTIFIC CONTENT · OBSERVATION &amp; SIMULATION
          </p>
          <h1
            className="text-4xl font-normal uppercase leading-[0.96] tracking-[-0.02em] text-white sm:text-6xl lg:text-[5rem]"
            style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
          >
            Inspired By Observation.
            <span className="mt-1 block text-[#f5d08a]">Clear About Models.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base font-light leading-relaxed text-white/75 sm:text-lg">
            Our Visible Universe unites catalogued astronomical measurements with physically grounded
            models where direct imaging is incomplete.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={onScrollToContent}
              className="group inline-flex h-12 items-center gap-3 rounded-full bg-[#f5d08a] pl-6 pr-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#05060a] transition-all duration-300 hover:bg-white"
            >
              <span>Explore Methodology</span>
              <span className="flex size-8 items-center justify-center rounded-full bg-[#05060a] text-[#f5d08a] transition-transform duration-300 group-hover:rotate-45">
                <ArrowUpRight className="size-4" />
              </span>
            </button>

            <Link
              to="/learn"
              className="inline-flex h-12 items-center gap-2.5 rounded-full border border-white/20 bg-white/[0.04] px-6 text-xs font-medium uppercase tracking-[0.2em] text-white/90 backdrop-blur-xl transition-all duration-300 hover:border-[#f5d08a]/50 hover:bg-white/[0.08]"
            >
              <Compass className="size-3.5 text-[#f5d08a]" />
              <span>24-Module Academy</span>
            </Link>
          </div>
        </div>

        {/* BEAT 02 */}
        <div
          ref={beat1Ref}
          style={{ opacity: 0, pointerEvents: "none" }}
          className="absolute inset-x-0 mx-auto max-w-xl rounded-3xl border border-white/[0.12] bg-[#05060a]/75 p-9 backdrop-blur-2xl will-change-[opacity,transform] md:left-auto md:right-12 md:mx-0"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#38bdf8]">
            02 / 03 · MEASURED ASTROMETRY
          </p>
          <h2
            className="mt-3 text-2xl font-medium uppercase tracking-tight text-white sm:text-4xl"
            style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
          >
            Catalogued Positions &amp; Spectra
          </h2>
          <p className="mt-3 text-sm font-light leading-relaxed text-white/75">
            Star coordinates, distances, temperatures, and exoplanet orbital parameters are derived
            from ESA Gaia DR3, Hipparcos, and the NASA Exoplanet Archive.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/10 pt-5 font-mono">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-white/40">CATALOGUE</span>
              <p className="mt-1 text-sm text-[#f5d08a]">ESA Gaia DR3</p>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-white/40">SPECTRA</span>
              <p className="mt-1 text-sm text-[#38bdf8]">Planck Blackbody</p>
            </div>
          </div>
        </div>

        {/* BEAT 03 */}
        <div
          ref={beat2Ref}
          style={{ opacity: 0, pointerEvents: "none" }}
          className="absolute inset-x-0 max-w-xl rounded-3xl border border-[#f5d08a]/25 bg-[#05060a]/80 p-9 backdrop-blur-2xl will-change-[opacity,transform]"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#f5d08a]">
            03 / 03 · RELATIVISTIC OPTICS
          </p>
          <h2
            className="mt-3 text-2xl font-medium uppercase tracking-tight text-white sm:text-4xl"
            style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
          >
            Honest Visual Interpretation
          </h2>
          <p className="mt-3 text-sm font-light leading-relaxed text-white/75">
            Extreme gravitational fields, raymarched nebulae, and cosmological simulations are
            clearly distinguished from direct telescopic photographs so learners always know what is
            observed versus modeled.
          </p>
        </div>
      </div>

      {/* Bottom Progress Bar */}
      <div className="pointer-events-auto flex items-center justify-between gap-6 border-t border-white/[0.08] pt-5">
        <div className="flex items-center gap-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/50">
            SCROLL TO SCRUB SPACETIME
          </span>
          <div className="h-[2px] w-32 overflow-hidden bg-white/10 sm:w-48">
            <div ref={scrollBarRef} className="h-full bg-[#f5d08a]" style={{ width: "4%" }} />
          </div>
        </div>

        <div className="hidden items-center gap-6 font-mono text-[10px] uppercase tracking-[0.22em] text-white/50 md:flex">
          <span>GAIA DR3</span>
          <span>•</span>
          <span>JWST SPECTRA</span>
          <span>•</span>
          <span>2.7255 K CMB</span>
        </div>
      </div>
    </div>
  );
}

function ScienceSecondVideoChoreography({
  registerListener,
}: {
  registerListener: (fn: (smoothedProgress: number, rawProgress: number) => void) => () => void;
}) {
  const beat1Ref = useRef<HTMLDivElement | null>(null);
  const beat2Ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return registerListener((pr) => {
      const cop1 = pr > 0.52 ? 0 : smooth(1 - pr / 0.48);
      const cop2 = pr < 0.44 ? 0 : smooth((pr - 0.44) / 0.25);

      if (beat1Ref.current) {
        beat1Ref.current.style.opacity = String(cop1);
        beat1Ref.current.style.transform = reduce
          ? "none"
          : `translate3d(0, ${((0.2 - pr) * 7).toFixed(2)}vh, 0)`;
        beat1Ref.current.style.pointerEvents = cop1 > 0.45 ? "auto" : "none";
      }

      if (beat2Ref.current) {
        beat2Ref.current.style.opacity = String(cop2);
        beat2Ref.current.style.transform = reduce
          ? "none"
          : `translate3d(0, ${((0.78 - pr) * 7).toFixed(2)}vh, 0)`;
        beat2Ref.current.style.pointerEvents = cop2 > 0.45 ? "auto" : "none";
      }
    });
  }, [registerListener]);

  return (
    <div className="mx-auto flex h-full max-w-7xl flex-col justify-center px-6 lg:px-10">
      <div className="relative flex min-h-[300px] w-full items-center">
        <div
          ref={beat1Ref}
          className="max-w-lg rounded-3xl border border-white/[0.12] bg-[#05060a]/75 p-9 backdrop-blur-2xl will-change-[opacity,transform]"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#f5d08a]">
            01 / 02 · GENERAL RELATIVITY
          </p>
          <h2
            className="mt-3 text-3xl font-medium uppercase leading-tight text-white sm:text-4xl"
            style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
          >
            Metric Expansion Of Space.
          </h2>
          <p className="mt-3 text-sm font-light leading-relaxed text-white/75">
            Cosmic evolution is modeled strictly according to General Relativity as the expansion of
            spacetime itself, anchored by the 2.7255 K CMB blackbody spectrum.
          </p>
        </div>

        <div
          ref={beat2Ref}
          style={{ opacity: 0, pointerEvents: "none" }}
          className="absolute right-0 max-w-xl rounded-3xl border border-white/[0.14] bg-[#05060a]/80 p-9 backdrop-blur-2xl will-change-[opacity,transform] sm:p-11"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#38bdf8]">
            02 / 02 · INTERACTIVE OBSERVATORY
          </p>
          <h3
            className="mt-3 text-3xl font-medium uppercase text-white sm:text-4xl"
            style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
          >
            Test The Physics Firsthand.
          </h3>
          <p className="mt-3 text-sm font-light leading-relaxed text-white/75">
            Transition from scientific documentation directly into the 3D relativistic simulator or
            the 24-module Cosmic Learning Academy.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              to="/universe"
              className="group inline-flex h-11 items-center gap-3 rounded-full bg-[#f5d08a] pl-5 pr-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#05060a] transition-all hover:bg-white"
            >
              <span>Launch 3D Universe</span>
              <span className="flex size-8 items-center justify-center rounded-full bg-[#05060a] text-[#f5d08a] transition-transform duration-300 group-hover:rotate-45">
                <ArrowUpRight className="size-4" />
              </span>
            </Link>
            <Link
              to="/learn"
              className="inline-flex h-11 items-center rounded-full border border-white/15 bg-white/[0.04] px-5 text-xs font-medium uppercase tracking-[0.16em] text-white/85 hover:border-[#f5d08a]/50 hover:text-white"
            >
              Cosmic Academy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/science")({
  head: () => ({
    meta: [
      { title: "Scientific Content — Our Visible Universe" },
      {
        name: "description",
        content:
          "How astronomical evidence, ESA Gaia DR3 astrometry, and relativistic physics inform the interactive universe and its educational explanations.",
      },
      { property: "og:title", content: "Scientific Content — Our Visible Universe" },
      {
        property: "og:description",
        content:
          "How astronomical evidence informs the interactive universe and its educational explanations.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SciencePage,
});

function SciencePage() {
  const dossierRef = useRef<HTMLDivElement>(null);

  const handleScrollToContent = () => {
    dossierRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <PublicLayout className="bg-[#05060a] text-white">
      <CosmicBackgroundCanvas />

      <main className="relative z-10 bg-transparent text-white selection:bg-[#f5d08a]/30 selection:text-[#f5d08a]">
        {/* 01. KERR SINGULARITY SCROLL-SCRUB HERO */}
        <ScrollScrubVideoCanvas
          videoSrc={KERR_VIDEO_1}
          mobileVideoSrc={KERR_MOBILE_1}
          posterSrc={KERR_POSTER_1}
          scrollHeightVh={360}
          ariaLabel="Rotating Kerr Black Hole — Scientific Foundations Scroll Experience"
        >
          {({ registerListener, scrubToProgress }) => (
            <ScienceHeroChoreography
              registerListener={registerListener}
              scrubToProgress={scrubToProgress}
              onScrollToContent={handleScrollToContent}
            />
          )}
        </ScrollScrubVideoCanvas>

        {/* MINIMALIST METRICS HAIRLINE STRIP */}
        <section className="border-y border-white/[0.08] bg-[#05060a]/85 backdrop-blur-2xl">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="grid grid-cols-2 divide-y divide-white/[0.08] sm:grid-cols-4 sm:divide-x sm:divide-y-0">
              {[
                { value: "100K+", label: "Gaia DR3 Stars" },
                { value: "2.7255 K", label: "CMB Blackbody" },
                { value: "5,500+", label: "Exoplanet Archive" },
                { value: "60 FPS", label: "Kerr Raymarching" },
              ].map((stat, idx) => (
                <div
                  key={stat.label}
                  className={`py-8 ${idx === 0 ? "sm:pr-8" : "sm:px-8"}`}
                >
                  <p
                    className="text-3xl font-normal tracking-tight text-white sm:text-4xl"
                    style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
                  >
                    {stat.value}
                  </p>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.26em] text-white/45">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SIX SCIENTIFIC PILLARS — 1PX HAIRLINE BENTO GRID */}
        <section ref={dossierRef} className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
          <div className="mb-14 flex flex-col justify-between gap-4 border-b border-white/[0.08] pb-8 md:flex-row md:items-end">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#f5d08a]">
                OBSERVATIONAL &amp; COMPUTATIONAL METHODOLOGY
              </p>
              <h2
                className="mt-3 text-3xl font-normal uppercase tracking-tight text-white sm:text-5xl"
                style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
              >
                Six Pillars Of Scientific Integrity
              </h2>
            </div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">
              CATALOGUED MEASUREMENTS · INTERPRETIVE PHYSICS MODELS
            </p>
          </div>

          <div className="grid grid-cols-1 gap-[1px] border border-white/[0.08] bg-white/[0.08] md:grid-cols-2 lg:grid-cols-3">
            {SCIENTIFIC_PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <article
                  key={pillar.code}
                  className="group flex flex-col justify-between bg-[#05060a] p-8 transition-colors duration-300 hover:bg-[#090d16] sm:p-10"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className={`font-mono text-[10px] uppercase tracking-[0.26em] ${pillar.accent}`}>
                        {pillar.code} · {pillar.tag}
                      </span>
                      <div className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-[#f5d08a]">
                        <Icon className="size-4" />
                      </div>
                    </div>

                    <h3
                      className="mt-6 text-2xl font-normal uppercase tracking-tight text-white transition-colors group-hover:text-[#f5d08a]"
                      style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
                    >
                      {pillar.title}
                    </h3>

                    <p className="mt-3 text-sm font-light leading-relaxed text-white/65">
                      {pillar.description}
                    </p>
                  </div>

                  <div className="mt-8 border-t border-white/[0.08] pt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">
                    {pillar.metrics}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* EMPIRICAL EVIDENCE VS. NUMERICAL SIMULATION MATRIX */}
        <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-10">
          <div className="border border-white/[0.08] bg-[#05060a]">
            <div className="flex flex-col justify-between gap-4 border-b border-white/[0.08] p-8 sm:p-10 md:flex-row md:items-end">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#38bdf8]">
                  COSMIC EVOLUTION ·EPISTEMIC CLARITY
                </p>
                <h2
                  className="mt-3 text-2xl font-normal uppercase tracking-tight text-white sm:text-4xl"
                  style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
                >
                  Observed Evidence vs. Numerical Simulation
                </h2>
              </div>
              <Link
                to="/visible-universe-history"
                className="inline-flex items-center gap-2 self-start rounded-full border border-white/15 px-5 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/85 transition-colors hover:border-[#f5d08a] hover:text-[#f5d08a] md:self-auto"
              >
                <span>Open 13.8B-Year Timeline</span>
                <ArrowUpRight className="size-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-[1px] bg-white/[0.08] md:grid-cols-2">
              {EMPIRICAL_VS_SIMULATION.map((item) => (
                <div
                  key={item.code}
                  className="bg-[#05060a] p-8 transition-colors hover:bg-[#090d16] sm:p-10"
                >
                  <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.24em]">
                    <span className="text-[#f5d08a]">{item.category}</span>
                    <span className="text-white/40">{item.code}</span>
                  </div>
                  <h3
                    className="mt-4 text-xl font-normal uppercase text-white"
                    style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
                  >
                    {item.title}
                  </h3>
                  <p className="mt-2.5 text-xs font-light leading-relaxed text-white/65 sm:text-sm">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 02. SECOND KERR ACCRETION SCROLL-SCRUB VIDEO CHAPTER */}
        <section className="relative border-t border-white/[0.08]">
          <ScrollScrubVideoCanvas
            videoSrc={KERR_VIDEO_2}
            mobileVideoSrc={KERR_MOBILE_2}
            posterSrc={KERR_POSTER_2}
            scrollHeightVh={280}
            ariaLabel="Relativistic Kerr Black Hole Accretion Torus — Scientific Simulation"
          >
            {({ registerListener }) => (
              <ScienceSecondVideoChoreography registerListener={registerListener} />
            )}
          </ScrollScrubVideoCanvas>
        </section>
      </main>
    </PublicLayout>
  );
}
