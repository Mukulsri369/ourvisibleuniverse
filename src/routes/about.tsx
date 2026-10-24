import React, { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Compass,
  Globe,
  Mail,
  Orbit,
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

const OBSERVATORY_PILLARS = [
  {
    code: "01",
    tag: "OUR PURPOSE",
    title: "Experience Scale, Motion & Variety",
    icon: Orbit,
    accent: "text-[#f5d08a]",
    description:
      "We want curious minds to experience the scale, orbital motion, and relativistic beauty of the cosmos—not only read static textbook paragraphs about it. Our Visible Universe brings together observed objects, measured positions, and physically inspired visual models.",
    footer: "INTERACTIVE ASTROPHYSICS",
  },
  {
    code: "02",
    tag: "3D ATLAS & ACADEMY",
    title: "Unified Learning & Exploration",
    icon: Compass,
    accent: "text-[#38bdf8]",
    description:
      "Combining a real-time 3D WebGL universe with a 24-module, 6-stage Cosmic Learning Academy that adapts across three cognitive age tiers (6–9, 10–13, and 14–16+) with verifiable completion credentials.",
    footer: "24 MODULES · 6 STAGES",
  },
  {
    code: "03",
    tag: "SANCTUARY PRINCIPLES",
    title: "100% Ad-Free & Privacy Safe",
    icon: ShieldCheck,
    accent: "text-[#f5d08a]",
    description:
      "Built as a distraction-free scientific sanctuary. Zero third-party advertising, zero behavioral surveillance, and strict COPPA-safe privacy controls for students and families worldwide.",
    footer: "ZERO ADS · ZERO TRACKING",
  },
  {
    code: "04",
    tag: "INDEPENDENT PROJECT",
    title: "Crafted In Chandigarh, India",
    icon: Globe,
    accent: "text-[#38bdf8]",
    description:
      "Independently created, engineered, and operated by Mukul Srivastava in Chandigarh, India. Inquiries, academic collaborations, and feedback can be sent directly to ourvisibleuniverse@gmail.com.",
    footer: "CHANDIGARH · INDIA",
  },
];

function AboutHeroChoreography({
  registerListener,
  scrubToProgress,
  onScrollToManifesto,
}: {
  registerListener: (fn: (smoothedProgress: number, rawProgress: number) => void) => () => void;
  scrubToProgress: (targetProgress: number) => void;
  onScrollToManifesto: () => void;
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
    { idx: 0, code: "01", label: "Manifesto", target: 0.04 },
    { idx: 1, code: "02", label: "Purpose", target: 0.5 },
    { idx: 2, code: "03", label: "Stewardship", target: 0.88 },
  ];

  return (
    <div className="mx-auto flex h-full w-full max-w-7xl flex-col justify-between px-6 pt-24 pb-10 lg:px-10">
      {/* Top Bar */}
      <div className="pointer-events-auto flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div className="flex items-center gap-3">
          <span className="size-1.5 rounded-full bg-[#f5d08a]" />
          <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/60">
            ABOUT THE OBSERVATORY · INDEPENDENT SANCTUARY
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
            onClick={onScrollToManifesto}
            className="rounded-full border border-white/15 bg-white/[0.04] px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-white/75 transition-colors hover:border-[#f5d08a]/50 hover:text-white"
          >
            Read Manifesto ↓
          </button>
        </div>
      </div>

      {/* Right-Side Route Rail */}
      <aside
        aria-label="About chapter rail"
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
            OUR VISIBLE UNIVERSE · MANIFESTO
          </p>
          <h1
            className="text-4xl font-normal uppercase leading-[0.96] tracking-[-0.02em] text-white sm:text-6xl lg:text-[5.25rem]"
            style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
          >
            A Universe Made
            <span className="mt-1 block text-[#f5d08a]">Navigable.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base font-light leading-relaxed text-white/75 sm:text-lg">
            Our Visible Universe turns astronomical knowledge into an explorable place—uniting
            catalogued observations with real-time 3D relativistic physics.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={onScrollToManifesto}
              className="group inline-flex h-12 items-center gap-3 rounded-full bg-[#f5d08a] pl-6 pr-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#05060a] transition-all duration-300 hover:bg-white"
            >
              <span>Our Purpose</span>
              <span className="flex size-8 items-center justify-center rounded-full bg-[#05060a] text-[#f5d08a] transition-transform duration-300 group-hover:rotate-45">
                <ArrowUpRight className="size-4" />
              </span>
            </button>

            <Link
              to="/science"
              className="inline-flex h-12 items-center gap-2.5 rounded-full border border-white/20 bg-white/[0.04] px-6 text-xs font-medium uppercase tracking-[0.2em] text-white/90 backdrop-blur-xl transition-all duration-300 hover:border-[#f5d08a]/50 hover:bg-white/[0.08]"
            >
              <Sparkles className="size-3.5 text-[#f5d08a]" />
              <span>Scientific Basis</span>
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
            02 / 03 · BUILT FOR CURIOSITY
          </p>
          <h2
            className="mt-3 text-2xl font-medium uppercase tracking-tight text-white sm:text-4xl"
            style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
          >
            Beyond Static Textbooks
          </h2>
          <p className="mt-3 text-sm font-light leading-relaxed text-white/75">
            We want curious people to experience the scale, motion, and variety of the cosmos—not
            only read about it. Every star system, nebula, and black hole is an interactive
            destination.
          </p>
        </div>

        {/* BEAT 03 */}
        <div
          ref={beat2Ref}
          style={{ opacity: 0, pointerEvents: "none" }}
          className="absolute inset-x-0 max-w-xl rounded-3xl border border-[#f5d08a]/25 bg-[#05060a]/80 p-9 backdrop-blur-2xl will-change-[opacity,transform]"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#f5d08a]">
            03 / 03 · INDEPENDENT STEWARDSHIP
          </p>
          <h2
            className="mt-3 text-2xl font-medium uppercase tracking-tight text-white sm:text-4xl"
            style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
          >
            Created By Mukul Srivastava
          </h2>
          <p className="mt-3 text-sm font-light leading-relaxed text-white/75">
            Independently designed and operated in Chandigarh, India, with a commitment to zero
            advertising and lifelong scientific wonder.
          </p>
          <div className="mt-6">
            <a
              href="mailto:ourvisibleuniverse@gmail.com"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-5 font-mono text-xs uppercase tracking-[0.16em] text-[#f5d08a] transition-colors hover:border-[#f5d08a] hover:text-white"
            >
              <Mail className="size-3.5" />
              <span>ourvisibleuniverse@gmail.com</span>
            </a>
          </div>
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
          <span>CHANDIGARH, INDIA</span>
          <span>•</span>
          <span>INDEPENDENT OBSERVATORY</span>
        </div>
      </div>
    </div>
  );
}

function AboutSecondVideoChoreography({
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
            01 / 02 · LIVING OBSERVATORY
          </p>
          <h2
            className="mt-3 text-3xl font-medium uppercase leading-tight text-white sm:text-4xl"
            style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
          >
            Built For Learners Of All Ages.
          </h2>
          <p className="mt-3 text-sm font-light leading-relaxed text-white/75">
            Whether you are stargazing with family or studying relativistic astrophysics, the
            observatory scales to meet your curiosity.
          </p>
        </div>

        <div
          ref={beat2Ref}
          style={{ opacity: 0, pointerEvents: "none" }}
          className="absolute right-0 max-w-xl rounded-3xl border border-white/[0.14] bg-[#05060a]/80 p-9 backdrop-blur-2xl will-change-[opacity,transform] sm:p-11"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#38bdf8]">
            02 / 02 · STEP INSIDE
          </p>
          <h3
            className="mt-3 text-3xl font-medium uppercase text-white sm:text-4xl"
            style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
          >
            Begin Your Exploration.
          </h3>
          <p className="mt-3 text-sm font-light leading-relaxed text-white/75">
            Enter the 3D Interactive Universe or start the free 24-module Cosmic Learning Academy.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              to="/universe"
              className="group inline-flex h-11 items-center gap-3 rounded-full bg-[#f5d08a] pl-5 pr-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#05060a] transition-all hover:bg-white"
            >
              <span>Enter 3D Universe</span>
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

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Our Visible Universe" },
      {
        name: "description",
        content:
          "Learn why Our Visible Universe was created by Mukul Srivastava in Chandigarh, India — turning astronomical knowledge into an explorable 3D place.",
      },
      { property: "og:title", content: "About — Our Visible Universe" },
      {
        property: "og:description",
        content: "Learn why Our Visible Universe was created.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const manifestoRef = useRef<HTMLDivElement>(null);

  const handleScrollToManifesto = () => {
    manifestoRef.current?.scrollIntoView({ behavior: "smooth" });
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
          ariaLabel="Rotating Kerr Black Hole — About Our Visible Universe Scroll Experience"
        >
          {({ registerListener, scrubToProgress }) => (
            <AboutHeroChoreography
              registerListener={registerListener}
              scrubToProgress={scrubToProgress}
              onScrollToManifesto={handleScrollToManifesto}
            />
          )}
        </ScrollScrubVideoCanvas>

        {/* MINIMALIST METRICS HAIRLINE STRIP */}
        <section className="border-y border-white/[0.08] bg-[#05060a]/85 backdrop-blur-2xl">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="grid grid-cols-2 divide-y divide-white/[0.08] sm:grid-cols-4 sm:divide-x sm:divide-y-0">
              {[
                { value: "3D", label: "Interactive Cosmos" },
                { value: "24", label: "Academy Modules" },
                { value: "100%", label: "Ad-Free Sanctuary" },
                { value: "IN", label: "Chandigarh, India" },
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

        {/* OBSERVATORY MANIFESTO — 1PX HAIRLINE BENTO GRID */}
        <section ref={manifestoRef} className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
          <div className="mb-14 flex flex-col justify-between gap-4 border-b border-white/[0.08] pb-8 md:flex-row md:items-end">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#f5d08a]">
                FOUNDATION &amp; STEWARDSHIP
              </p>
              <h2
                className="mt-3 text-3xl font-normal uppercase tracking-tight text-white sm:text-5xl"
                style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
              >
                An Explorable Place In The Cosmos
              </h2>
            </div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">
              OBSERVED OBJECTS · MEASURED POSITIONS · PHYSICAL MODELS
            </p>
          </div>

          <div className="grid grid-cols-1 gap-[1px] border border-white/[0.08] bg-white/[0.08] md:grid-cols-2">
            {OBSERVATORY_PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <article
                  key={pillar.code}
                  className="group flex flex-col justify-between bg-[#05060a] p-8 transition-colors duration-300 hover:bg-[#090d16] sm:p-11"
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
                      className="mt-6 text-2xl font-normal uppercase tracking-tight text-white transition-colors group-hover:text-[#f5d08a] sm:text-3xl"
                      style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
                    >
                      {pillar.title}
                    </h3>

                    <p className="mt-3 text-sm font-light leading-relaxed text-white/65">
                      {pillar.description}
                    </p>
                  </div>

                  <div className="mt-8 border-t border-white/[0.08] pt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">
                    {pillar.footer}
                  </div>
                </article>
              );
            })}
          </div>

          {/* Direct Contact & Stewardship Strip */}
          <div className="mt-12 flex flex-col justify-between gap-6 border border-white/[0.08] bg-[#05060a] p-8 sm:p-11 md:flex-row md:items-center">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#38bdf8]">
                DIRECT OBSERVATORY CORRESPONDENCE
              </p>
              <h3
                className="mt-2 text-2xl font-normal uppercase text-white sm:text-3xl"
                style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
              >
                Mukul Srivastava · Chandigarh, India
              </h3>
              <p className="mt-1.5 text-xs font-light text-white/60 sm:text-sm">
                Questions, educational partnerships, or scientific inquiries are welcomed directly.
              </p>
            </div>

            <a
              href="mailto:ourvisibleuniverse@gmail.com"
              className="group inline-flex h-12 shrink-0 items-center gap-3 self-start rounded-full bg-[#f5d08a] pl-6 pr-2 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#05060a] transition-all hover:bg-white md:self-auto"
            >
              <Mail className="size-4" />
              <span>ourvisibleuniverse@gmail.com</span>
              <span className="flex size-8 items-center justify-center rounded-full bg-[#05060a] text-[#f5d08a] transition-transform duration-300 group-hover:rotate-45">
                <ArrowUpRight className="size-4" />
              </span>
            </a>
          </div>
        </section>

        {/* 02. SECOND KERR ACCRETION SCROLL-SCRUB VIDEO CHAPTER */}
        <section className="relative border-t border-white/[0.08]">
          <ScrollScrubVideoCanvas
            videoSrc={KERR_VIDEO_2}
            mobileVideoSrc={KERR_MOBILE_2}
            posterSrc={KERR_POSTER_2}
            scrollHeightVh={280}
            ariaLabel="Relativistic Kerr Black Hole Accretion Torus — Explore Our Visible Universe"
          >
            {({ registerListener }) => (
              <AboutSecondVideoChoreography registerListener={registerListener} />
            )}
          </ScrollScrubVideoCanvas>
        </section>
      </main>
    </PublicLayout>
  );
}
