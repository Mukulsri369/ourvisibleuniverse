import React, { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Compass, Eye, ShieldCheck } from "lucide-react";
import { ScrollScrubVideoCanvas } from "@/components/site/ScrollScrubVideoCanvas";

const KERR_VIDEO_1 =
  "/assets/aistudio/Rotating_Kerr_black_hole_visuali__1080p_20261024024512_4b03a008.mp4";
const KERR_MOBILE_1 = "/assets/aistudio/kerr1_mobile.mp4";
const KERR_POSTER_1 = "/assets/aistudio/kerr1_poster.jpg";

interface AcademyHeroProps {
  onStartExploring: () => void;
  onViewMap: () => void;
  onOpenExam?: () => void;
}

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = (x: number) => {
  const c = clamp(x, 0, 1);
  return c * c * (3 - 2 * c);
};

function AcademyHeroChoreography({
  registerListener,
  scrubToProgress,
  onStartExploring,
  onViewMap,
  onOpenExam,
}: {
  registerListener: (fn: (smoothedProgress: number, rawProgress: number) => void) => () => void;
  scrubToProgress: (targetProgress: number) => void;
  onStartExploring: () => void;
  onViewMap: () => void;
  onOpenExam?: () => void;
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
    { idx: 0, code: "01", label: "Academy", target: 0.04 },
    { idx: 1, code: "02", label: "6 Stages", target: 0.5 },
    { idx: 2, code: "03", label: "Credentials", target: 0.88 },
  ];

  return (
    <div className="mx-auto flex h-full w-full max-w-7xl flex-col justify-between px-6 pt-24 pb-10 lg:px-10">
      {/* Top Minimalist Telemetry & Chapter Switcher */}
      <div className="pointer-events-auto flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div className="flex items-center gap-3">
          <span className="size-1.5 rounded-full bg-[#f5d08a]" />
          <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/60">
            COSMIC ACADEMY · 24 INTERACTIVE MODULES
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
            onClick={onStartExploring}
            className="rounded-full border border-white/15 bg-white/[0.04] px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-white/75 transition-colors hover:border-[#f5d08a]/50 hover:text-white"
          >
            Skip to Modules ↓
          </button>
        </div>
      </div>

      {/* Right-Side Route Rail */}
      <aside
        aria-label="Scroll chapter rail"
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
        {/* BEAT 01: Opening Academy Statement */}
        <div ref={beat0Ref} className="max-w-3xl will-change-[opacity,transform]">
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.34em] text-[#f5d08a]">
            OBSERVATORY CURRICULUM · STAGE 01 TO 06
          </p>
          <h1
            className="text-4xl font-normal uppercase leading-[0.96] tracking-[-0.02em] text-white sm:text-6xl lg:text-[5.25rem]"
            style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
          >
            Cosmic Learning
            <span className="mt-1 block text-[#f5d08a]">Academy.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base font-light leading-relaxed text-white/75 sm:text-lg">
            From Earth&apos;s orbital neighborhood to relativistic Kerr singularities and the cosmic
            web. Scroll smoothly to scrub through spacetime.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={onStartExploring}
              className="group inline-flex h-12 items-center gap-3 rounded-full bg-[#f5d08a] pl-6 pr-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#05060a] transition-all duration-300 hover:bg-white"
            >
              <span>Start Curriculum</span>
              <span className="flex size-8 items-center justify-center rounded-full bg-[#05060a] text-[#f5d08a] transition-transform duration-300 group-hover:rotate-45">
                <ArrowUpRight className="size-4" />
              </span>
            </button>

            <button
              type="button"
              onClick={onViewMap}
              className="inline-flex h-12 items-center gap-2.5 rounded-full border border-white/20 bg-white/[0.04] px-6 text-xs font-medium uppercase tracking-[0.2em] text-white/90 backdrop-blur-xl transition-all duration-300 hover:border-[#f5d08a]/50 hover:bg-white/[0.08]"
            >
              <Eye className="size-3.5 text-[#f5d08a]" />
              <span>Flightpath Map</span>
            </button>
          </div>
        </div>

        {/* BEAT 02: Six Celestial Stages & Age-Adaptive Depth */}
        <div
          ref={beat1Ref}
          style={{ opacity: 0, pointerEvents: "none" }}
          className="absolute inset-x-0 mx-auto max-w-xl rounded-3xl border border-white/[0.12] bg-[#05060a]/75 p-9 backdrop-blur-2xl will-change-[opacity,transform] md:left-auto md:right-12 md:mx-0"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#38bdf8]">
            02 / 03 · ADAPTIVE ASTROPHYSICS
          </p>
          <h2
            className="mt-3 text-2xl font-medium uppercase tracking-tight text-white sm:text-4xl"
            style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
          >
            Six Progressive Celestial Stages
          </h2>
          <p className="mt-3 text-sm font-light leading-relaxed text-white/75">
            Every module dynamically adapts across three cognitive depth tiers (Ages 6–9, 10–13, and
            14–16+) with interactive 3D physics labs and voice narration.
          </p>
          <div className="mt-6 grid grid-cols-3 gap-3 border-t border-white/10 pt-5 font-mono">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-white/40">TIER 01</span>
              <p className="mt-1 text-sm text-[#f5d08a]">Ages 6–9</p>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-white/40">TIER 02</span>
              <p className="mt-1 text-sm text-[#38bdf8]">Ages 10–13</p>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-white/40">TIER 03</span>
              <p className="mt-1 text-sm text-white">Ages 14–16+</p>
            </div>
          </div>
        </div>

        {/* BEAT 03: Capstone & Verifiable Credentials */}
        <div
          ref={beat2Ref}
          style={{ opacity: 0, pointerEvents: "none" }}
          className="absolute inset-x-0 max-w-xl rounded-3xl border border-[#f5d08a]/25 bg-[#05060a]/80 p-9 backdrop-blur-2xl will-change-[opacity,transform]"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#f5d08a]">
            03 / 03 · VERIFIABLE CREDENTIALS
          </p>
          <h2
            className="mt-3 text-2xl font-medium uppercase tracking-tight text-white sm:text-4xl"
            style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
          >
            Official Cosmic Explorer Certification
          </h2>
          <p className="mt-3 text-sm font-light leading-relaxed text-white/75">
            Complete interactive laboratory evidence across all 6 stages and pass the 20-question
            Capstone Assessment to claim your cryptographically verifiable certificate.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {onOpenExam && (
              <button
                type="button"
                onClick={onOpenExam}
                className="group inline-flex h-11 items-center gap-2.5 rounded-full bg-[#f5d08a] pl-5 pr-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#05060a] transition-all hover:bg-white"
              >
                <span>Capstone Exam</span>
                <span className="flex size-8 items-center justify-center rounded-full bg-[#05060a] text-[#f5d08a]">
                  <ArrowUpRight className="size-3.5" />
                </span>
              </button>
            )}
            <Link
              to="/verify-certificate"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-5 text-xs font-medium uppercase tracking-[0.16em] text-white/85 transition-colors hover:border-[#f5d08a]/40 hover:text-white"
            >
              <ShieldCheck className="size-3.5 text-[#f5d08a]" />
              <span>Verify Credential</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Scroll Progress Bar */}
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
          <button
            type="button"
            onClick={onStartExploring}
            className="inline-flex items-center gap-1.5 transition-colors hover:text-[#f5d08a]"
          >
            <Compass className="size-3 text-[#f5d08a]" />
            <span>24 Modules</span>
          </button>
          <span>•</span>
          <span>100% Free Sanctuary</span>
        </div>
      </div>
    </div>
  );
}

export function AcademyHero({ onStartExploring, onViewMap, onOpenExam }: AcademyHeroProps) {
  return (
    <ScrollScrubVideoCanvas
      videoSrc={KERR_VIDEO_1}
      mobileVideoSrc={KERR_MOBILE_1}
      posterSrc={KERR_POSTER_1}
      scrollHeightVh={380}
      ariaLabel="Rotating Kerr Black Hole — Cosmic Learning Academy Scroll Experience"
    >
      {({ registerListener, scrubToProgress }) => (
        <AcademyHeroChoreography
          registerListener={registerListener}
          scrubToProgress={scrubToProgress}
          onStartExploring={onStartExploring}
          onViewMap={onViewMap}
          onOpenExam={onOpenExam}
        />
      )}
    </ScrollScrubVideoCanvas>
  );
}
