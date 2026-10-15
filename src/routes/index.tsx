import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  Telescope,
  Atom,
  Lock,
  CheckCircle2,
  HeartHandshake,
  Compass,
  ShoppingBag,
  ArrowUpRight,
  Shuffle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Plans } from "@/components/site/Plans";
import { Button } from "@/components/ui/button";
import { STORE_CATALOG, getRandomStoreProducts, type StoreProduct } from "@/lib/store-products";

import parentKidImg from "@/assets/images/parent_kid_stargazing_1791934612266.jpg";
import saturnRingsImg from "@/assets/images/saturn_rings_cosmic_1791934612062.jpg";
import deepSpaceGalaxyImg from "@/assets/images/deep_space_galaxy_1791934612897.jpg";

import { SpaceEduHero } from "@/components/site/SpaceEduHero";
import { CosmicBackgroundCanvas } from "@/components/site/CosmicBackgroundCanvas";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SpaceEdu — Our Visible Universe for Curious Kids & Parents" },
      {
        name: "description",
        content:
          "Cinematic planet exploration and 3D universe for curious kids. Learn about Earth, Venus, Mars, and 100,000 real stars with zero ads.",
      },
      { property: "og:title", content: "SpaceEdu — Our Visible Universe" },
      {
        property: "og:description",
        content:
          "Turn screen time into lifelong curiosity. Explore planets, stars, galaxies, and black holes in a scientifically accurate, kid-safe 3D cosmos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const scaleFacts = [
  {
    order: "01",
    name: "Earth & The Moon",
    distance: "384,400 km",
    kidFact: "If Earth were a basketball, the Moon would be a tennis ball 24 feet away!",
    scienceDetail: "Light travels from the Moon to your child's eyes in just 1.3 seconds.",
  },
  {
    order: "02",
    name: "The Solar Playground",
    distance: "150 Million km (1 AU)",
    kidFact: "Sunlight takes 8 minutes to reach Earth, but over 5 hours to reach distant Pluto!",
    scienceDetail:
      "Real elliptical orbits computed from orbital eccentricity, gravity, and Keplerian mechanics.",
  },
  {
    order: "03",
    name: "Saturn & Its Icy Rings",
    distance: "1.4 Billion km",
    kidFact:
      "Saturn's rings are wider than 20 Earths placed side-by-side, but thinner than a two-story house!",
    scienceDetail:
      "Millions of water-ice particles orbiting a gas giant with 146 known natural satellites.",
  },
  {
    order: "04",
    name: "Our Stellar Neighbors",
    distance: "4.3 Light Years",
    kidFact:
      "Even traveling on the fastest rocket ever built, reaching Alpha Centauri takes over 70,000 years!",
    scienceDetail:
      "100,000 catalog stars rendered with physical spectral classes from O, B, A to red M dwarfs.",
  },
  {
    order: "05",
    name: "The Grand Milky Way",
    distance: "100,000 Light Years",
    kidFact:
      "Our solar system has orbited the galaxy only about 20 times since dinosaurs walked Earth!",
    scienceDetail:
      "A spiral galaxy containing more than 100 billion stars and at least 100 billion planets.",
  },
];

const celestialHighlights = [
  {
    type: "Gas Giant",
    name: "Saturn & Rings",
    distance: "9.5 AU",
    highlight: "Real ring shadows & orbital moons",
  },
  {
    type: "Supermassive Black Hole",
    name: "Sagittarius A*",
    distance: "26,700 ly",
    highlight: "The 4-million solar mass heart of our galaxy",
  },
  {
    type: "Spinning Neutron Star",
    name: "Crab Pulsar",
    distance: "6,500 ly",
    highlight: "Rotates 30 times every second",
  },
  {
    type: "Grand Spiral Galaxy",
    name: "Andromeda (M31)",
    distance: "2.5M ly",
    highlight: "One trillion stars traveling toward our Milky Way",
  },
  {
    type: "Red Supergiant",
    name: "Betelgeuse",
    distance: "548 ly",
    highlight: "So huge it would engulf the orbit of Mars",
  },
  {
    type: "Exoplanet System",
    name: "TRAPPIST-1 System",
    distance: "40 ly",
    highlight: "Seven Earth-sized worlds orbiting an ultra-cool dwarf",
  },
];

const testimonials = [
  {
    quote:
      "My 9-year-old daughter used to spend hours on mindless video feeds. Within two days of getting Our Visible Universe, she was explaining orbital velocity and Saturn's rings to her grandparents. It's the best educational purchase I've made.",
    author: "Priya Sharma",
    role: "Mother of two & Middle School Educator",
    location: "Bangalore",
  },
  {
    quote:
      "As a STEM teacher and dad, finding software that doesn't talk down to kids while keeping things visual and tactile is rare. The physical scaling and real catalog data turn abstract physics formulas into living wonder.",
    author: "Dr. Marcus Vance",
    role: "Astrophysics Parent & Science Department Head",
    location: "Vancouver",
  },
  {
    quote:
      "No ads, no sneaky monthly subscriptions, no toxic algorithms. Just a single transparent pass that gave my 11-year-old son a genuine passion for astronomy. He's now asking for his first telescope!",
    author: "Ananya Mehta",
    role: "Parent of 5th grader",
    location: "Mumbai",
  },
];

function Index() {
  const [activeScaleIndex, setActiveScaleIndex] = useState(0);
  const [storeProducts, setStoreProducts] = useState<StoreProduct[]>(() =>
    STORE_CATALOG.slice(0, 6),
  );

  // Randomize catalog on client after hydration to avoid SSR mismatch
  useEffect(() => {
    setStoreProducts(getRandomStoreProducts());
  }, []);

  const shuffleProducts = () => {
    setStoreProducts(getRandomStoreProducts());
  };

  return (
    <PublicLayout className="bg-[#04060d] text-slate-100">
      {/* ================= FIXED 3D COSMIC BACKGROUND (EARTH, VENUS, MARS) ================= */}
      <CosmicBackgroundCanvas />

      <main className="relative z-10 bg-transparent text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
        {/* ================= SPACEEDU FULL-VIEWPORT HERO ================= */}
        <SpaceEduHero />

        {/* ================= PARENT TRUST BAR ================= */}
        <section className="border-y border-white/10 bg-slate-950/70 backdrop-blur-md py-8">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="size-5 shrink-0 text-emerald-400" />
                <div>
                  <h4 className="text-sm font-semibold text-white">100% Ad-Free & Safe</h4>
                  <p className="text-xs text-slate-400">Zero tracking, zero pop-ups</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <GraduationCap className="size-5 shrink-0 text-cyan-400" />
                <div>
                  <h4 className="text-sm font-semibold text-white">Real NASA Catalogs</h4>
                  <p className="text-xs text-slate-400">True scientific orbits & data</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Atom className="size-5 shrink-0 text-amber-400" />
                <div>
                  <h4 className="text-sm font-semibold text-white">100,000+ Real Stars</h4>
                  <p className="text-xs text-slate-400">From our Sun to deep quasars</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Lock className="size-5 shrink-0 text-purple-400" />
                <div>
                  <h4 className="text-sm font-semibold text-white">Single One-Time Pass</h4>
                  <p className="text-xs text-slate-400">No sneaky monthly auto-billing</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= WHY PARENTS FEEL PROUD SECTION ================= */}
        <section
          id="parents"
          className="border-t border-white/10 bg-slate-950/40 backdrop-blur-md py-24"
        >
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="max-w-2xl">
              <span className="text-xs font-semibold tracking-wider uppercase text-cyan-400">
                The Parent Advantage
              </span>
              <h2 className="mt-3 text-3xl font-black text-white sm:text-5xl">
                Screen Time You Actually Feel Proud Of.
              </h2>
              <p className="mt-4 text-base text-slate-300 sm:text-lg">
                Most digital entertainment is engineered to keep children hooked on instant
                dopamine. Our Visible Universe is engineered for active inquiry — turning curiosity
                into lifelong confidence in STEM.
              </p>
            </div>

            {/* Asymmetric Bento Grid with Translucent Dark Glass */}
            <div className="mt-14 grid gap-6 md:grid-cols-12">
              {/* Feature 1: Large Visual Card */}
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-md p-8 md:col-span-7 flex flex-col justify-between hover:border-white/20 transition-all">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                    Active Scientific Discovery
                  </span>
                  <h3 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
                    From Passive Consumers to Cosmic Explorers
                  </h3>
                  <p className="mt-3 leading-relaxed text-slate-300">
                    Children don't sit back and watch scripted videos. In the 3D universe, they
                    pilot the camera, alter simulation speeds, inspect planetary ring structures,
                    and test scientific questions:{" "}
                    <em>"How fast does Mercury whip around the Sun compared to Neptune?"</em>
                  </p>
                </div>
                <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
                  <img
                    src={parentKidImg}
                    alt="Parent and child exploring astronomy together with telescope and tablet under starry sky"
                    className="h-64 w-full object-cover transition-transform duration-500 hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              {/* Feature 2: School & STEM Curriculum Advantage */}
              <div className="flex flex-col justify-between rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-md p-8 md:col-span-5 hover:border-white/20 transition-all">
                <div>
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400">
                    <GraduationCap className="size-6" />
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-white sm:text-2xl">
                    Direct School Science Advantage
                  </h3>
                  <p className="mt-3 leading-relaxed text-slate-300">
                    Astronomical scales and orbital mechanics are difficult to grasp from flat
                    textbook diagrams. By interacting with physical 3D models, gravity curves, and
                    light-year distances, middle and high-school concepts become effortless second
                    nature.
                  </p>
                </div>
                <div className="mt-6 space-y-2 border-t border-white/10 pt-6 text-sm text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-400" />
                    <span>Kepler's laws & elliptical orbital mechanics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-400" />
                    <span>Stellar temperatures & spectral classifications</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-400" />
                    <span>Galactic structure and deep-space landmark coordinates</span>
                  </div>
                </div>
              </div>

              {/* Feature 3: Safe Sanctuary */}
              <div className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-md p-8 md:col-span-6 hover:border-white/20 transition-all">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
                  <ShieldCheck className="size-6" />
                </div>
                <h3 className="mt-6 text-xl font-bold text-white sm:text-2xl">
                  A Safe, Distraction-Free Sanctuary
                </h3>
                <p className="mt-3 leading-relaxed text-slate-300">
                  No social media comments. No predatory micro-transactions or loot boxes. No
                  behavioral tracking cookies. Just an inspiring, quiet, museum-grade space
                  sanctuary where your child can immerse their mind peacefully.
                </p>
              </div>

              {/* Feature 4: Transparent Fixed-Term Access */}
              <div className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-md p-8 md:col-span-6 hover:border-white/20 transition-all">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400">
                  <HeartHandshake className="size-6" />
                </div>
                <h3 className="mt-6 text-xl font-bold text-white sm:text-2xl">
                  Transparent, Honest Family Passes
                </h3>
                <p className="mt-3 leading-relaxed text-slate-300">
                  We despise unexpected monthly charges on credit cards. You pay once for 180 or 365
                  days of uninterrupted family access via Razorpay (UPI, card, net banking). When
                  the pass concludes, it simply stops — you only renew if your family loves it.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= INTERACTIVE COSMIC SCALE LAB ================= */}
        <section
          id="scales"
          className="border-t border-white/10 bg-slate-950/30 backdrop-blur-md py-24"
        >
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="text-center">
              <span className="text-xs font-semibold tracking-wider uppercase text-cyan-400">
                Mind-Expanding Perspective
              </span>
              <h2 className="mt-3 text-3xl font-black text-white sm:text-5xl">
                The Scale Lab: Space You Can Grasp
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base text-slate-300 sm:text-lg">
                Textbooks isolate planets from galaxies. Click through each cosmic order of
                magnitude below to see how reality actually fits together.
              </p>
            </div>

            {/* Scale Selector Tabs */}
            <div className="mt-12 flex flex-wrap justify-center gap-2">
              {scaleFacts.map((s, i) => (
                <button
                  key={s.order}
                  type="button"
                  onClick={() => setActiveScaleIndex(i)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all whitespace-nowrap ${
                    activeScaleIndex === i
                      ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30 font-bold"
                      : "border border-white/10 bg-slate-900/60 text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <span className="font-mono">{s.order}.</span>
                  <span>{s.name}</span>
                </button>
              ))}
            </div>

            {/* Active Scale Showcase Card */}
            <div className="mt-8 rounded-3xl border border-white/10 bg-slate-900/70 backdrop-blur-md p-8 sm:p-10 shadow-2xl">
              <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
                <div className="lg:col-span-7 space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300">
                    <span>Order {scaleFacts[activeScaleIndex].order}</span>
                    <span>·</span>
                    <span className="font-mono">{scaleFacts[activeScaleIndex].distance}</span>
                  </div>
                  <h3 className="text-3xl font-black text-white">
                    {scaleFacts[activeScaleIndex].name}
                  </h3>
                  <div className="rounded-2xl border border-cyan-500/20 bg-cyan-950/30 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                      Fun Fact to Share With Your Child
                    </p>
                    <p className="mt-1 text-base font-medium text-slate-100">
                      "{scaleFacts[activeScaleIndex].kidFact}"
                    </p>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-300">
                    {scaleFacts[activeScaleIndex].scienceDetail}
                  </p>
                  <div className="pt-2">
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="border-white/20 bg-white/5 hover:bg-white/10 text-white"
                    >
                      <Link to="/universe">
                        Inspect in 3D Universe <ArrowRight className="ml-1 size-3.5" />
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="lg:col-span-5 overflow-hidden rounded-2xl border border-white/10">
                  <img
                    src={activeScaleIndex === 2 ? saturnRingsImg : deepSpaceGalaxyImg}
                    alt={scaleFacts[activeScaleIndex].name}
                    className="h-72 w-full object-cover transition-all duration-700 hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= CELESTIAL HIGHLIGHTS GRID ================= */}
        <section
          id="objects"
          className="border-t border-white/10 bg-slate-950/40 backdrop-blur-md py-24"
        >
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="text-xs font-semibold tracking-wider uppercase text-cyan-400">
                  Real Cosmic Landmarks
                </span>
                <h2 className="mt-3 text-3xl font-black text-white sm:text-5xl">
                  Objects Waiting Inside for Your Young Explorer.
                </h2>
              </div>
              <Button
                asChild
                variant="outline"
                className="shrink-0 border-white/20 bg-white/5 hover:bg-white/10 text-white"
              >
                <Link to="/universe">
                  Explore full catalog <ArrowRight className="ml-1 size-4" />
                </Link>
              </Button>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {celestialHighlights.map((obj) => (
                <Link
                  key={obj.name}
                  to="/universe"
                  className="group rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-md p-6 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/50 hover:bg-slate-900/80 hover:shadow-lg hover:shadow-cyan-500/10"
                >
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold uppercase tracking-wider text-cyan-400">
                      {obj.type}
                    </span>
                    <span className="font-mono">{obj.distance}</span>
                  </div>
                  <h3 className="mt-3 text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {obj.name}
                  </h3>
                  <p className="mt-2 text-sm text-slate-300">{obj.highlight}</p>
                  <div className="mt-6 flex items-center justify-between text-xs font-medium text-slate-400">
                    <span>Jump to coordinates</span>
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1 group-hover:text-cyan-400" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ================= TESTIMONIALS & PARENT PROOF ================= */}
        <section
          id="reviews"
          className="border-t border-white/10 bg-slate-950/30 backdrop-blur-md py-24"
        >
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="text-center">
              <span className="text-xs font-semibold tracking-wider uppercase text-cyan-400">
                Parent & Educator Feedback
              </span>
              <h2 className="mt-3 text-3xl font-black text-white sm:text-5xl">
                Loved by Curious Families Everywhere.
              </h2>
            </div>

            <div className="mt-14 grid gap-8 md:grid-cols-3">
              {testimonials.map((t) => (
                <div
                  key={t.author}
                  className="flex flex-col justify-between rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-md p-8 shadow-md hover:border-white/20 transition-all"
                >
                  <p className="text-sm leading-relaxed text-slate-200">"{t.quote}"</p>
                  <div className="mt-8 border-t border-white/10 pt-4">
                    <p className="font-semibold text-white">{t.author}</p>
                    <p className="text-xs text-slate-400">
                      {t.role} · {t.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= TRANSPARENT PRICING SECTION ================= */}
        <section
          id="plans"
          className="border-t border-white/10 bg-slate-950/40 backdrop-blur-md py-24"
        >
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="text-center">
              <span className="text-xs font-semibold tracking-wider uppercase text-cyan-400">
                Transparent Family Access
              </span>
              <h2 className="mt-3 text-3xl font-black text-white sm:text-5xl">
                Choose Your Child's Exploration Pass.
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base text-slate-300">
                One-time payment through Razorpay (UPI, Google Pay, Credit/Debit Cards, Net
                Banking). Full interactive universe access on your desktop, laptop, or tablet. No
                auto-renewal trap.
              </p>
            </div>

            {/* Plans Component */}
            <div className="mt-14">
              <Plans />
            </div>

            {/* Peace of mind statement */}
            <div className="mx-auto mt-12 max-w-xl text-center text-xs text-slate-400">
              <p>
                Have questions or need school group pricing? Contact our educational support team at{" "}
                <a
                  href="mailto:ourvisibleuniverse@gmail.com"
                  className="text-cyan-400 underline hover:text-cyan-300"
                >
                  ourvisibleuniverse@gmail.com
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* ================= DEDICATED STORE SECTION ================= */}
        <section
          id="store"
          className="border-t border-white/10 bg-slate-950/50 backdrop-blur-md py-24"
        >
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-300">
                  <ShoppingBag className="size-3.5" />
                  <span>The Official Stargazer's Store</span>
                </div>
                <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">
                  Bring the Wonder of the Night Sky Home.
                </h2>
                <p className="mt-4 text-base leading-relaxed text-slate-300 sm:text-lg">
                  Alongside our digital 3D cosmos, Our Visible Universe curates real physical
                  equipment for young stargazers and astronomy families. From beginner refractor
                  telescopes that reveal Saturn's rings from your terrace, to certified
                  4.5-billion-year-old iron meteorite specimens, precision planispheres, and
                  illuminated star globes. Every item is verified for optical quality and durability
                  so you receive something worth keeping under the real night sky.
                </p>
              </div>

              {/* Actions: Visit Store & Shuffle */}
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={shuffleProducts}
                  className="border-white/20 bg-white/5 hover:bg-white/10 text-white"
                >
                  <Shuffle className="mr-1.5 size-4 text-cyan-400" />
                  <span>Shuffle Showcase</span>
                </Button>
                <Button
                  asChild
                  className="bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-semibold shadow-lg shadow-cyan-500/20"
                >
                  <a
                    href="https://ourvisibleuniverse.store"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2"
                  >
                    <span>Visit ourvisibleuniverse.store</span>
                    <ArrowUpRight className="size-4" />
                  </a>
                </Button>
              </div>
            </div>

            {/* Randomized Product Grid */}
            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {storeProducts.map((p) => (
                <a
                  key={p.id}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/50 hover:bg-slate-900/80 hover:shadow-xl hover:shadow-cyan-500/10"
                >
                  <div>
                    {/* Product Image */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-950">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute top-3 left-3 rounded-full border border-white/15 bg-black/75 px-3 py-1 text-[11px] font-semibold text-cyan-300 backdrop-blur-md">
                        {p.badge}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                        {p.category}
                      </span>
                      <h3 className="mt-2 text-lg font-bold text-white transition-colors group-hover:text-cyan-300">
                        {p.name}
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-slate-300 line-clamp-2">
                        {p.description}
                      </p>
                    </div>
                  </div>

                  {/* Pricing and Action Footer */}
                  <div className="flex items-center justify-between border-t border-white/10 px-6 py-4 bg-slate-950/40">
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-lg font-bold text-white">{p.price}</span>
                      {p.originalPrice && (
                        <span className="font-mono text-xs text-slate-400 line-through">
                          {p.originalPrice}
                        </span>
                      )}
                    </div>
                    <span className="inline-flex items-center text-xs font-semibold text-cyan-400 group-hover:translate-x-0.5 transition-transform">
                      View in Store <ArrowUpRight className="ml-1 size-3.5" />
                    </span>
                  </div>
                </a>
              ))}
            </div>

            {/* Bottom Store Highlight Banner */}
            <div className="mt-12 rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-slate-900/70 to-cyan-950/40 backdrop-blur-md p-8 sm:p-10 text-center">
              <h3 className="text-2xl font-bold text-white sm:text-3xl">
                Looking for Specific Telescope Optics or Meteorite Certificates?
              </h3>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
                Browse our full catalog on our dedicated online storefront with secure checkout,
                direct customer support, and guaranteed safe delivery across India and worldwide.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-semibold shadow-lg shadow-cyan-500/20"
                >
                  <a
                    href="https://ourvisibleuniverse.store"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2"
                  >
                    <ShoppingBag className="size-4" />
                    <span>Go to ourvisibleuniverse.store</span>
                    <ArrowUpRight className="size-4" />
                  </a>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/20 bg-white/5 hover:bg-white/10 text-white"
                >
                  <a
                    href="https://visualizemaths.ai.studio"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Explore VisualizeMaths Engine <ArrowRight className="ml-1.5 size-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
