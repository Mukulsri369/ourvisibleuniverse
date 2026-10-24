import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  ShoppingBag,
  Shuffle,
  Instagram,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Plans } from "@/components/site/Plans";
import {
  AUTHENTIC_STORE_SEED,
  fetchLiveStoreProducts,
  type StoreProduct,
} from "@/lib/store-products";

import parentKidImg from "@/assets/images/parent_kid_stargazing_1791934612266.jpg";

import { SpaceEduHero } from "@/components/site/SpaceEduHero";
import { CosmicBackgroundCanvas } from "@/components/site/CosmicBackgroundCanvas";
import { ScrollScrubVideoCanvas } from "@/components/site/ScrollScrubVideoCanvas";

const KERR_ACCRETION_VIDEO_2 =
  "/assets/aistudio/Rotating_Kerr_black_hole_visuali__1080p_20261024024506_51d485ff.mp4";
const KERR_ACCRETION_MOBILE_2 = "/assets/aistudio/kerr2_mobile.mp4";
const KERR_ACCRETION_POSTER_2 = "/assets/aistudio/kerr2_poster.jpg";

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = (x: number) => {
  const c = clamp(x, 0, 1);
  return c * c * (3 - 2 * c);
};

function AccretionChapterChoreography({
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
        {/* Beat 1: Accretion Physics */}
        <div
          ref={beat1Ref}
          className="max-w-lg rounded-3xl border border-white/[0.12] bg-[#05060a]/75 p-9 backdrop-blur-2xl will-change-[opacity,transform]"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#f5d08a]">
            01 / 02 · RELATIVISTIC TORUS
          </p>
          <h2
            className="mt-3 text-3xl font-medium uppercase leading-tight text-white sm:text-4xl"
            style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
          >
            Matter Spiraling At Light Speed.
          </h2>
          <p className="mt-3 text-sm font-light leading-relaxed text-white/75">
            Scroll smoothly to scrub orbital shear across the event horizon.
          </p>
        </div>

        {/* Beat 2: 24-Module Academy CTA */}
        <div
          ref={beat2Ref}
          style={{ opacity: 0, pointerEvents: "none" }}
          className="absolute right-0 max-w-xl rounded-3xl border border-white/[0.14] bg-[#05060a]/80 p-9 backdrop-blur-2xl will-change-[opacity,transform] sm:p-11"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#38bdf8]">
            02 / 02 · 24 INTERACTIVE MODULES
          </p>
          <h3
            className="mt-3 text-3xl font-medium uppercase text-white sm:text-4xl"
            style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
          >
            Cosmic Learning Academy.
          </h3>
          <p className="mt-3 text-sm font-light leading-relaxed text-white/75">
            Six progressive stages, age-adaptive physics, AI Observatory Tutor, and verifiable
            completion certificates.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              to="/learn"
              className="group inline-flex h-11 items-center gap-3 rounded-full bg-[#f5d08a] pl-5 pr-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#05060a] transition-all hover:bg-white"
            >
              <span>Enter Academy</span>
              <span className="flex size-8 items-center justify-center rounded-full bg-[#05060a] text-[#f5d08a] transition-transform duration-300 group-hover:rotate-45">
                <ArrowUpRight className="size-4" />
              </span>
            </Link>
            <Link
              to="/verify-certificate"
              className="inline-flex h-11 items-center rounded-full border border-white/15 bg-white/[0.04] px-5 text-xs font-medium uppercase tracking-[0.16em] text-white/80 hover:border-white/35 hover:text-white"
            >
              Verify Certificate
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "Our Visible Universe — 3D Relativistic Space Observatory",
      },
      {
        name: "description",
        content:
          "Interactive 3D relativistic universe simulator and 24-module astronomy academy. Explore rotating Kerr black holes, 100,000+ Gaia DR3 stars, and exoplanets.",
      },
      {
        property: "og:title",
        content: "Our Visible Universe — 3D Relativistic Observatory",
      },
      {
        property: "og:description",
        content:
          "Command a scientifically accurate 3D cosmos spanning planets, exoplanets, raymarched nebulae, galaxies, and relativistic Kerr black holes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

/**
 * Minimalist Static Architectural Cell (Zero Cursor-Move Tilt or Parallax)
 */
function SpotlightCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden transition-colors duration-300 hover:bg-[#090d16] ${className}`}>
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}

function Index() {
  const [storeProducts, setStoreProducts] = useState<StoreProduct[]>(() =>
    AUTHENTIC_STORE_SEED.slice(0, 6),
  );
  const [allProducts, setAllProducts] = useState<StoreProduct[]>(AUTHENTIC_STORE_SEED);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  useEffect(() => {
    let isMounted = true;
    fetchLiveStoreProducts()
      .then((products) => {
        if (!isMounted) return;
        if (products && products.length > 0) {
          setAllProducts(products);
          setStoreProducts(products.slice(0, 6));
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCategoryFilter = (catKey: string) => {
    setActiveCategory(catKey);
    if (catKey === "all") {
      setStoreProducts(allProducts.slice(0, 6));
    } else if (catKey === "projectors") {
      const filtered = allProducts.filter(
        (p) =>
          p.category.toLowerCase().includes("projector") ||
          p.name.toLowerCase().includes("projector"),
      );
      setStoreProducts((filtered.length ? filtered : allProducts).slice(0, 6));
    } else if (catKey === "aurora") {
      const filtered = allProducts.filter(
        (p) =>
          p.category.toLowerCase().includes("aurora") ||
          p.category.toLowerCase().includes("light") ||
          p.name.toLowerCase().includes("aurora") ||
          p.name.toLowerCase().includes("lamp"),
      );
      setStoreProducts((filtered.length ? filtered : allProducts).slice(0, 6));
    } else if (catKey === "decor") {
      const filtered = allProducts.filter(
        (p) =>
          p.category.toLowerCase().includes("decor") ||
          p.category.toLowerCase().includes("clock") ||
          p.category.toLowerCase().includes("art") ||
          p.category.toLowerCase().includes("poster") ||
          p.category.toLowerCase().includes("book"),
      );
      setStoreProducts((filtered.length ? filtered : allProducts).slice(0, 6));
    }
  };

  const shuffleProducts = () => {
    const pool = activeCategory === "all" ? allProducts : storeProducts;
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    setStoreProducts(shuffled.slice(0, 6));
  };

  return (
    <PublicLayout className="bg-[#05060a] text-white">
      {/* ================= 3D SCROLL-DRIVEN WEBGL COSMOS BACKGROUND ================= */}
      <CosmicBackgroundCanvas />

      <main className="relative z-10 bg-transparent text-white selection:bg-[#f5d08a]/30 selection:text-[#f5d08a]">
        {/* ================= 01. KERR SINGULARITY SCROLL-SCRUB HERO (VIDEO 1) ================= */}
        <SpaceEduHero />

        {/* ================= MINIMALIST METRICS HAIRLINE STRIP ================= */}
        <section className="border-y border-white/[0.08] bg-[#05060a]/85 backdrop-blur-2xl">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="grid grid-cols-2 divide-y divide-white/[0.08] sm:grid-cols-4 sm:divide-x sm:divide-y-0">
              {[
                { value: "100K+", label: "Gaia DR3 Stars" },
                { value: "60 FPS", label: "GLSL Raymarching" },
                { value: "24", label: "Academy Modules" },
                { value: "100%", label: "Ad-Free Sanctuary" },
              ].map((stat, idx) => (
                <div
                  key={stat.label}
                  className={`py-8 ${idx === 0 ? "sm:pr-8" : "sm:px-8"}`}
                >
                  <p
                    className="text-3xl font-medium tracking-tight text-white sm:text-4xl"
                    style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
                  >
                    {stat.value}
                  </p>
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.22em] text-white/45">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= 02. ARCHITECTURAL BENTO GRID ================= */}
        <section className="py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#f5d08a]">
                  02 // ARCHITECTURE
                </p>
                <h2
                  className="mt-3 text-4xl font-medium uppercase tracking-tight text-white sm:text-5xl"
                  style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
                >
                  Built For Discovery.
                </h2>
              </div>

              <Link
                to="/universe"
                className="group inline-flex h-11 items-center gap-3 self-start rounded-full border border-white/15 bg-white/[0.04] pl-5 pr-1.5 text-xs font-medium uppercase tracking-[0.18em] text-white backdrop-blur-xl transition-all hover:border-[#f5d08a]/50 hover:bg-white/[0.08]"
              >
                <span>Open 3D Atlas</span>
                <span className="flex size-8 items-center justify-center rounded-full bg-[#f5d08a] text-[#05060a] transition-transform duration-300 group-hover:rotate-45">
                  <ArrowUpRight className="size-4" />
                </span>
              </Link>
            </div>

            {/* 1px Hairline Bento Grid */}
            <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-white/[0.12] bg-white/[0.12] md:grid-cols-12">
              <SpotlightCard className="bg-[#06080e]/95 p-9 sm:p-12 md:col-span-7 flex flex-col justify-between">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#f5d08a]">
                    REAL-TIME FLIGHT
                  </span>
                  <h3
                    className="mt-3 text-2xl font-medium uppercase text-white sm:text-3xl"
                    style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
                  >
                    True-Scale Planetary & Lunar Orbits
                  </h3>
                  <p className="mt-3 max-w-md text-sm font-light leading-relaxed text-white/65">
                    Pilot freely from solar granulation and Saturn's rings to distant exoplanet
                    chains with live orbital trails.
                  </p>
                </div>

                <div className="mt-8 overflow-hidden rounded-2xl border border-white/[0.08]">
                  <img
                    src={parentKidImg}
                    alt="Exploring the 3D universe"
                    className="h-60 w-full object-cover opacity-90 transition-transform duration-700 hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </SpotlightCard>

              <SpotlightCard className="bg-[#06080e]/95 p-9 sm:p-12 md:col-span-5 flex flex-col justify-between">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#38bdf8]">
                    PHYSICAL SHADERS
                  </span>
                  <h3
                    className="mt-3 text-2xl font-medium uppercase text-white sm:text-3xl"
                    style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
                  >
                    Relativistic CGI Precision
                  </h3>
                  <p className="mt-3 text-sm font-light leading-relaxed text-white/65">
                    Custom GLSL gravitational lensing, volumetric raymarched nebulae, and pulsar
                    magnetospheres grounded in real astronomical catalogs.
                  </p>
                </div>

                <div className="mt-8 space-y-3 border-t border-white/[0.08] pt-6 font-mono text-xs text-white/75">
                  <div className="flex items-center justify-between">
                    <span>Kerr Black Hole Lensing</span>
                    <span className="text-[#f5d08a]">GLSL</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Exoplanet Host Systems</span>
                    <span className="text-[#38bdf8]">NASA Archive</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>3D Volumetric Nebulae</span>
                    <span className="text-emerald-400">Raymarched</span>
                  </div>
                </div>
              </SpotlightCard>

              <SpotlightCard className="bg-[#06080e]/95 p-9 sm:p-11 md:col-span-6">
                <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-emerald-400">
                  PURE FOCUS
                </span>
                <h3
                  className="mt-3 text-xl font-medium uppercase text-white sm:text-2xl"
                  style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
                >
                  Zero Ads. Zero Algorithms.
                </h3>
                <p className="mt-2 text-sm font-light leading-relaxed text-white/60">
                  A calm, museum-grade sanctuary designed for uninterrupted scientific curiosity.
                </p>
              </SpotlightCard>

              <SpotlightCard className="bg-[#06080e]/95 p-9 sm:p-11 md:col-span-6">
                <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#f5d08a]">
                  TRANSPARENT ACCESS
                </span>
                <h3
                  className="mt-3 text-xl font-medium uppercase text-white sm:text-2xl"
                  style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
                >
                  One-Time Exploration Passes.
                </h3>
                <p className="mt-2 text-sm font-light leading-relaxed text-white/60">
                  Fixed-term access via Razorpay with zero recurring monthly charges.
                </p>
              </SpotlightCard>
            </div>
          </div>
        </section>

        {/* ================= 03. SECOND PINNED KERR BLACK HOLE SCROLL-SCRUB (VIDEO 2) ================= */}
        <ScrollScrubVideoCanvas
          videoSrc={KERR_ACCRETION_VIDEO_2}
          mobileVideoSrc={KERR_ACCRETION_MOBILE_2}
          posterSrc={KERR_ACCRETION_POSTER_2}
          scrollHeightVh={300}
          linger={0.22}
          chapterCode="03 // ACCRETION DYNAMICS"
          chapterTitle="COSMIC LEARNING ACADEMY"
        >
          {({ registerListener }) => (
            <AccretionChapterChoreography registerListener={registerListener} />
          )}
        </ScrollScrubVideoCanvas>

        {/* ================= 04. EXPLORATION PASSES ================= */}
        <section id="plans" className="border-t border-white/[0.08] py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="max-w-xl">
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#f5d08a]">
                04 // ACCESS PASSES
              </p>
              <h2
                className="mt-3 text-4xl font-medium uppercase tracking-tight text-white sm:text-5xl"
                style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
              >
                Unlock The Universe.
              </h2>
              <p className="mt-3 text-sm font-light leading-relaxed text-white/65">
                Single one-time payment via Razorpay. Full access to the 3D simulator and 24-module
                Academy with zero recurring subscriptions.
              </p>
            </div>

            <div className="mt-12">
              <Plans />
            </div>
          </div>
        </section>

        {/* ================= 05. OFFICIAL STORE ARCHIVE ================= */}
        <section id="store" className="border-t border-white/[0.08] py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[#f5d08a]">
                  05 // OFFICIAL STORE
                </p>
                <h2
                  className="mt-3 text-4xl font-medium uppercase tracking-tight text-white sm:text-5xl"
                  style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
                >
                  Space Gear & Optics.
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={shuffleProducts}
                  className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 text-xs font-medium text-white/80 transition-all hover:border-white/35 hover:text-white"
                >
                  <Shuffle className="size-3.5 text-[#f5d08a]" />
                  <span>Shuffle</span>
                </button>

                <a
                  href="https://ourvisibleuniverse.store"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex h-10 items-center gap-2.5 rounded-full bg-[#f5d08a] pl-5 pr-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#05060a] transition-all hover:bg-white"
                >
                  <span>ourvisibleuniverse.store</span>
                  <span className="flex size-7 items-center justify-center rounded-full bg-[#05060a] text-[#f5d08a] transition-transform duration-300 group-hover:rotate-45">
                    <ArrowUpRight className="size-3.5" />
                  </span>
                </a>
              </div>
            </div>

            {/* Minimalist Filter Pills */}
            <div className="mt-8 flex flex-wrap gap-1.5">
              {[
                { key: "all", label: "All" },
                { key: "projectors", label: "Projectors" },
                { key: "aurora", label: "Aurora Lamps" },
                { key: "decor", label: "Décor & Clocks" },
              ].map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => handleCategoryFilter(cat.key)}
                  className={`cursor-pointer rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                    activeCategory === cat.key
                      ? "bg-white text-[#05060a]"
                      : "border border-white/10 bg-white/[0.03] text-white/60 hover:border-white/25 hover:text-white"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* 1px Hairline Store Grid */}
            <div className="mt-10 grid gap-px overflow-hidden rounded-3xl border border-white/[0.12] bg-white/[0.12] sm:grid-cols-2 lg:grid-cols-3">
              {storeProducts.map((p) => (
                <div
                  key={p.id}
                  className="group flex flex-col justify-between bg-[#06080e]/95 transition-colors hover:bg-[#0a0e18]"
                >
                  <div>
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative block aspect-[4/3] w-full overflow-hidden bg-[#05060a]"
                    >
                      <img
                        src={p.image}
                        alt={p.name}
                        className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                    </a>

                    <div className="p-7">
                      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#f5d08a]">
                        {p.category}
                      </span>
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 block"
                      >
                        <h3 className="text-base font-medium text-white transition-colors group-hover:text-[#f5d08a] line-clamp-1">
                          {p.name}
                        </h3>
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/[0.06] px-7 py-5">
                    <div className="flex items-baseline gap-2 tabular-nums">
                      <span className="font-mono text-base font-semibold text-white">
                        {p.price}
                      </span>
                      {p.originalPrice && (
                        <span className="font-mono text-xs text-white/35 line-through">
                          {p.originalPrice}
                        </span>
                      )}
                    </div>

                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-4 text-xs font-medium text-white transition-all hover:border-[#f5d08a] hover:bg-[#f5d08a] hover:text-[#05060a]"
                    >
                      <ShoppingBag className="size-3.5" />
                      <span>View</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Minimalist Community Banner */}
            <div className="mt-16 flex flex-col items-center justify-between gap-6 rounded-3xl border border-white/[0.12] bg-[#06080e]/90 p-9 sm:flex-row sm:p-12">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#f5d08a]">
                  COMMUNITY DISPATCH
                </p>
                <h3
                  className="mt-2 text-2xl font-medium uppercase text-white sm:text-3xl"
                  style={{ fontFamily: "'Cinzel', 'Prata', Georgia, serif" }}
                >
                  Follow @our_visibleuniverse
                </h3>
              </div>

              <a
                href="https://www.instagram.com/our_visibleuniverse"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex h-11 shrink-0 items-center gap-3 rounded-full bg-[#f5d08a] pl-5 pr-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#05060a] transition-all hover:bg-white"
              >
                <Instagram className="size-4" />
                <span>Instagram</span>
                <span className="flex size-8 items-center justify-center rounded-full bg-[#05060a] text-[#f5d08a] transition-transform duration-300 group-hover:rotate-45">
                  <ArrowUpRight className="size-4" />
                </span>
              </a>
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
