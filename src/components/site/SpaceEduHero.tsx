import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Compass } from "lucide-react";
import { ScrollScrubVideoCanvas } from "./ScrollScrubVideoCanvas";

const KERR_HERO_VIDEO_1 =
  "/assets/aistudio/Rotating_Kerr_black_hole_visuali__1080p_20261024024512_4b03a008.mp4";
const KERR_HERO_MOBILE_1 = "/assets/aistudio/kerr1_mobile.mp4";
const KERR_HERO_POSTER_1 = "/assets/aistudio/kerr1_poster.jpg";

const BEATS = [
  { index: "01", label: "Singularity", target: 0.06, range: [0, 0.36] },
  { index: "02", label: "Spacetime", target: 0.5, range: [0.36, 0.7] },
  { index: "03", label: "Atlas", target: 0.88, range: [0.7, 1.0] },
] as const;

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = (x: number) => {
  const c = clamp(x, 0, 1);
  return c * c * (3 - 2 * c);
};

function HeroChoreography({
  registerListener,
  scrubToProgress,
}: {
  registerListener: (fn: (smoothedProgress: number, rawProgress: number) => void) => () => void;
  scrubToProgress: (targetProgress: number) => void;
}) {
  const beat1Ref = useRef<HTMLDivElement | null>(null);
  const beat2Ref = useRef<HTMLDivElement | null>(null);
  const beat3Ref = useRef<HTMLDivElement | null>(null);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const routeDotRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const lastActiveBeatRef = useRef<number>(-1);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    return registerListener((pr) => {
      // Exact scroll-world scrub-engine.js copy curve formulas:
      // Section 0 greets on landing: smooth(1 - pr / 0.36)
      // Section 1 peaks mid-flight: smooth(1 - Math.abs(pr - 0.50) / 0.22)
      // Section 2 holds CTA at the end: smooth((pr - 0.64) / 0.22)
      const cop1 = pr > 0.38 ? 0 : smooth(1 - pr / 0.36);
      const cop2 = pr < 0.28 || pr > 0.72 ? 0 : smooth(1 - Math.abs(pr - 0.5) / 0.22);
      const cop3 = pr < 0.62 ? 0 : smooth((pr - 0.62) / 0.22);

      if (beat1Ref.current) {
        beat1Ref.current.style.opacity = String(cop1);
        beat1Ref.current.style.transform = reduce
          ? "none"
          : `translate3d(0, ${((0.12 - pr) * 7).toFixed(2)}vh, 0)`;
        beat1Ref.current.style.pointerEvents = cop1 > 0.45 ? "auto" : "none";
      }

      if (beat2Ref.current) {
        beat2Ref.current.style.opacity = String(cop2);
        beat2Ref.current.style.transform = reduce
          ? "none"
          : `translate3d(0, ${((0.5 - pr) * 8).toFixed(2)}vh, 0)`;
        beat2Ref.current.style.pointerEvents = cop2 > 0.45 ? "auto" : "none";
      }

      if (beat3Ref.current) {
        beat3Ref.current.style.opacity = String(cop3);
        beat3Ref.current.style.transform = reduce
          ? "none"
          : `translate3d(0, ${((0.86 - pr) * 7).toFixed(2)}vh, 0)`;
        beat3Ref.current.style.pointerEvents = cop3 > 0.45 ? "auto" : "none";
      }

      const activeIdx = pr < 0.36 ? 0 : pr < 0.7 ? 1 : 2;
      if (activeIdx !== lastActiveBeatRef.current) {
        lastActiveBeatRef.current = activeIdx;
        btnRefs.current.forEach((btn, idx) => {
          if (!btn) return;
          if (idx === activeIdx) {
            btn.className =
              "cursor-pointer rounded-full px-3.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors duration-300 bg-[#f5d08a] text-[#05060a] font-semibold";
          } else {
            btn.className =
              "cursor-pointer rounded-full px-3.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors duration-300 text-white/50 hover:text-white";
          }
        });
        routeDotRefs.current.forEach((dot, idx) => {
          if (!dot) return;
          const inner = dot.querySelector("i");
          if (!inner) return;
          if (idx === activeIdx) {
            inner.className =
              "block size-2.5 rounded-full bg-[#f5d08a] scale-125 shadow-[0_0_0_5px_rgba(245,208,138,0.22)] transition-all duration-300";
          } else {
            inner.className =
              "block size-2 rounded-full bg-white/30 group-hover:bg-[#f5d08a] group-hover:scale-125 transition-all duration-300";
          }
        });
      }
    });
  }, [registerListener]);

  return (
    <div className="mx-auto flex h-full max-w-7xl flex-col justify-between px-6 pt-24 pb-16 lg:px-10">
      {/* Minimalist Chapter Index Switcher */}
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-1 rounded-full border border-white/[0.1] bg-[#05060a]/60 p-1 backdrop-blur-xl">
          {BEATS.map((b, idx) => (
            <button
              key={b.index}
              ref={(el) => {
                btnRefs.current[idx] = el;
              }}
              type="button"
              onClick={() => scrubToProgress(b.target)}
              className={`cursor-pointer rounded-full px-3.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors duration-300 ${
                idx === 0
                  ? "bg-[#f5d08a] text-[#05060a] font-semibold"
                  : "text-white/50 hover:text-white"
              }`}
            >
              {b.index} · {b.label}
            </button>
          ))}
        </div>

        <span className="hidden sm:inline font-mono text-[10px] uppercase tracking-[0.28em] text-white/40">
          100,000+ GAIA DR3 STARS
        </span>
      </div>

      {/* scroll-world Right-Side Route Rail */}
      <div className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-5 py-4 lg:flex">
        <div className="pointer-events-none absolute bottom-4 top-4 left-1/2 w-[1.5px] -translate-x-1/2 bg-[#f5d08a]/25" />
        {BEATS.map((b, idx) => (
          <button
            key={b.index}
            ref={(el) => {
              routeDotRefs.current[idx] = el;
            }}
            type="button"
            onClick={() => scrubToProgress(b.target)}
            className="group relative z-10 grid size-5 cursor-pointer place-items-center"
            aria-label={`Jump to ${b.label}`}
          >
            <span className="pointer-events-none absolute right-7 top-1/2 -translate-y-1/2 translate-x-1.5 whitespace-nowrap rounded-full border border-[#f5d08a]/20 bg-[#05060a]/90 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white opacity-0 backdrop-blur-md transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100">
              {b.index} · {b.label}
            </span>
            <i
              className={
                idx === 0
                  ? "block size-2.5 rounded-full bg-[#f5d08a] scale-125 shadow-[0_0_0_5px_rgba(245,208,138,0.22)] transition-all duration-300"
                  : "block size-2 rounded-full bg-white/30 group-hover:bg-[#f5d08a] group-hover:scale-125 transition-all duration-300"
              }
            />
          </button>
        ))}
      </div>

      {/* Center Stage — Direct DOM Scroll-Choreographed Editorial Beats */}
      <div className="relative my-auto flex min-h-[340px] w-full items-center">
        {/* BEAT 01 */}
        <div ref={beat1Ref} className="w-full will-change-[opacity,transform]">
          <div className="max-w-2xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[#f5d08a]">
              01 / 03 · THE RELATIVISTIC 3D OBSERVATORY
            </p>

            <h1
              className="mt-4 text-5xl font-medium uppercase leading-[1.02] tracking-[-0.02em] text-white sm:text-7xl lg:text-[5.25rem]"
              style={{
                fontFamily: "'Cinzel', 'Prata', Georgia, serif",
                textShadow: "0 20px 60px rgba(0,0,0,0.85)",
              }}
            >
              Our Visible{" "}
              <span className="bg-gradient-to-r from-[#fff8e7] via-[#f5d08a] to-[#e5a93c] bg-clip-text text-transparent">
                Universe.
              </span>
            </h1>

            <p className="mt-5 max-w-lg text-base font-light leading-relaxed text-white/80 sm:text-lg">
              Scroll to bend spacetime. Pilot a real-time 3D cosmos of 100,000 stars, exoplanet
              systems, and relativistic black holes.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3.5">
              <Link
                to="/universe"
                className="group inline-flex h-12 items-center gap-3 rounded-full bg-[#f5d08a] pl-6 pr-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#05060a] shadow-[0_0_40px_rgba(245,208,138,0.3)] transition-all duration-300 hover:bg-white hover:shadow-[0_0_50px_rgba(255,255,255,0.4)]"
              >
                <span>Enter 3D Universe</span>
                <span className="flex size-8 items-center justify-center rounded-full bg-[#05060a] text-[#f5d08a] transition-transform duration-300 group-hover:rotate-45 group-hover:text-white">
                  <ArrowUpRight className="size-4" />
                </span>
              </Link>

              <Link
                to="/learn"
                className="inline-flex h-12 items-center gap-2.5 rounded-full border border-white/[0.16] bg-white/[0.05] px-6 text-xs font-medium uppercase tracking-[0.18em] text-white backdrop-blur-xl transition-all duration-300 hover:border-white/35 hover:bg-white/[0.12]"
              >
                <Compass className="size-4 text-[#38bdf8]" />
                <span>Cosmic Academy</span>
              </Link>
            </div>
          </div>
        </div>

        {/* BEAT 02 */}
        <div
          ref={beat2Ref}
          style={{ opacity: 0, pointerEvents: "none" }}
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 will-change-[opacity,transform]"
        >
          <div className="max-w-lg rounded-2xl border border-white/[0.1] bg-[#05060a]/75 p-8 backdrop-blur-2xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#e5a93c]">
              02 / 03 · SPACETIME CURVATURE
            </p>
            <h2
              className="mt-3 text-3xl font-medium uppercase leading-tight text-white sm:text-4xl"
              style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
            >
              Light Bent By Gravity.
            </h2>
            <p className="mt-3 text-sm font-light leading-relaxed text-white/75">
              Extreme frame-dragging twists superheated plasma into a luminous Einstein photon
              ring — rendered in real time with multi-layer GLSL shaders.
            </p>
          </div>
        </div>

        {/* BEAT 03 */}
        <div
          ref={beat3Ref}
          style={{ opacity: 0, pointerEvents: "none" }}
          className="absolute inset-x-0 bottom-0 will-change-[opacity,transform]"
        >
          <div className="mb-6 max-w-xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#38bdf8]">
              03 / 03 · DIRECT COORDINATES
            </p>
            <h2
              className="mt-2 text-3xl font-medium uppercase text-white sm:text-5xl"
              style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
            >
              Select A Destination.
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.12] bg-white/[0.12] lg:grid-cols-4">
            {[
              { code: "SGR A*", name: "Sagittarius A*", dist: "26,700 ly" },
              { code: "TON 618", name: "TON 618 Quasar", dist: "10.4B ly" },
              { code: "TRAPPIST-1", name: "TRAPPIST-1", dist: "40.7 ly" },
              { code: "SOL", name: "Solar System", dist: "0.000015 ly" },
            ].map((item) => (
              <Link
                key={item.code}
                to="/universe"
                className="group flex flex-col justify-between bg-[#05060a]/85 p-5 backdrop-blur-xl transition-colors duration-300 hover:bg-[#0c101b]"
              >
                <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.2em] text-white/45">
                  <span>{item.code}</span>
                  <ArrowUpRight className="size-3.5 text-[#f5d08a] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                <div className="mt-5">
                  <p className="text-base font-medium text-white group-hover:text-[#f5d08a] transition-colors">
                    {item.name}
                  </p>
                  <p className="mt-0.5 font-mono text-[11px] text-white/45 tabular-nums">
                    {item.dist}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="h-2" />
    </div>
  );
}

export function SpaceEduHero() {
  return (
    <ScrollScrubVideoCanvas
      videoSrc={KERR_HERO_VIDEO_1}
      mobileVideoSrc={KERR_HERO_MOBILE_1}
      posterSrc={KERR_HERO_POSTER_1}
      scrollHeightVh={330}
      linger={0.22}
      chapterCode="01 // KERR SINGULARITY"
      chapterTitle="SCROLL TO SCRUB SPACETIME"
      showScrollHint={true}
    >
      {({ registerListener, scrubToProgress }) => (
        <HeroChoreography
          registerListener={registerListener}
          scrubToProgress={scrubToProgress}
        />
      )}
    </ScrollScrubVideoCanvas>
  );
}
