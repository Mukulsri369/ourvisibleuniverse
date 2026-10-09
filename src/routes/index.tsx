import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Atom, Eye, Pause, Play, Telescope } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import hero from "@/assets/universe-hero.jpg";
import heroVideo from "@/assets/space-hero.mp4.asset.json";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Plans } from "@/components/site/Plans";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Our Visible Universe — Interactive 3D Space Map" },
      { name: "description", content: "Explore a cinematic 3D map of planets, stars, galaxies, nebulae, quasars, neutron stars, and black holes." },
      { property: "og:title", content: "Our Visible Universe" },
      { property: "og:description", content: "Explore planets, stars, galaxies, nebulae, quasars, neutron stars, and black holes in an interactive 3D universe." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const scales = [
  ["01", "Solar System", "Astronomical units", "Planets, moons, rings and asteroid belts on real elliptical orbits."],
  ["02", "Stellar neighbourhood", "Light years", "Alpha Centauri, Sirius, Betelgeuse and the stars around the Sun."],
  ["03", "Milky Way", "Kiloparsecs", "Spiral arms, the galactic core and the Sun's path around it."],
  ["04", "Local Group", "Megaparsecs", "Andromeda, Triangulum and dozens of companion galaxies."],
  ["05", "Cosmic web", "Billions of light years", "Distant giants, quasars and filaments toward the visible edge."],
];

const plates = [
  ["Supermassive black hole", "Sagittarius A*", "26,700 ly", "-rotate-2"],
  ["Pulsar", "Crab Pulsar", "6,500 ly", "rotate-1"],
  ["Spiral galaxy", "Andromeda (M31)", "2.5 million ly", "-rotate-1"],
  ["Quasar", "3C 273", "2.4 billion ly", "rotate-2"],
  ["Red supergiant", "Betelgeuse", "548 ly", "-rotate-1"],
  ["Exoplanet system", "PA-99-N2 b", "2.5 million ly", "rotate-1"],
];

function Beacon({ label, onHero }: { label: string; onHero?: boolean }) {
  return <div className="inline-flex items-center gap-3"><span className={`size-2.5 animate-pulse rounded-full ${onHero ? "bg-hero-foreground" : "bg-primary"}`} /><span className={`text-sm font-semibold uppercase tracking-widest ${onHero ? "text-hero-muted" : "text-primary"}`}>{label}</span><span className="size-2.5 animate-pulse rounded-full bg-accent-foreground [animation-delay:0.6s]" /></div>;
}

function Hero() {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);
  useEffect(() => { const v = ref.current; if (v) { v.muted = true; v.play().catch(() => setPlaying(false)); } }, []);
  const toggle = () => { const v = ref.current; if (!v) return; if (v.paused) { v.play(); setPlaying(true); } else { v.pause(); setPlaying(false); } };
  return <section className="relative flex h-screen min-h-[640px] items-end overflow-hidden pb-20">
    <video ref={ref} className="absolute inset-0 size-full scale-110 object-cover" src={heroVideo.url} poster={hero} autoPlay muted loop playsInline preload="auto" aria-hidden="true" />
    <div className="absolute inset-0 bg-hero-overlay" />
    <div className="relative mx-auto w-full max-w-7xl px-5 lg:px-8">
      <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
        <Beacon onHero label="Interactive astronomy education" />
        <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[1.05] text-hero-foreground sm:text-7xl lg:text-8xl">Our Visible Universe</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-hero-muted">Learn how planetary systems, stars, galaxies and extreme cosmic objects fit together through a cinematic 3D universe grounded in real astronomical data.</p>
        <div className="mt-8 flex flex-wrap gap-3"><Button asChild size="lg" className="transition hover:scale-105"><Link to="/universe">Load universe <ArrowRight /></Link></Button><Button asChild size="lg" variant="outline" className="transition hover:scale-105"><Link to="/pricing">Get access</Link></Button><Button asChild size="lg" variant="ghost" className="text-hero-foreground"><Link to="/science">Explore the science</Link></Button></div>
      </div>
    </div>
    <button onClick={toggle} aria-label={playing ? "Pause background video" : "Play background video"} className="absolute bottom-6 right-6 grid size-11 place-items-center rounded-full border border-hero-foreground/20 bg-hero-foreground/10 text-hero-foreground backdrop-blur-md transition hover:scale-110">{playing ? <Pause className="size-4" /> : <Play className="size-4" />}</button>
  </section>;
}

function ScaleJourney() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => { if (paused) return; const t = setInterval(() => setActive(a => (a + 1) % scales.length), 2600); return () => clearInterval(t); }, [paused]);
  return <section className="relative overflow-hidden py-24">
    <div className="mx-auto max-w-7xl px-5 lg:px-8">
      <div className="text-center"><Beacon label="One universe. Every scale." /><h2 className="mx-auto mt-5 max-w-3xl text-4xl font-black sm:text-6xl">Explore space as a place, not a list.</h2></div>
      <div className="mt-14 grid gap-4 md:grid-cols-5" onMouseLeave={() => setPaused(false)}>
        {scales.map(([n, title, unit, copy], i) => <button key={n} onMouseEnter={() => { setPaused(true); setActive(i); }} onClick={() => setActive(i)} className={`rounded-2xl border p-5 text-left transition-all duration-700 ${i === active ? "-translate-y-2 border-primary bg-card shadow-lg shadow-primary/20" : "border-border bg-card/40 opacity-60"}`}>
          <span className="text-xs font-semibold text-primary">{n} · {unit}</span>
          <h3 className="mt-3 text-lg font-semibold">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p>
          <div className="mt-4 h-1 overflow-hidden rounded-full bg-muted"><div className={`h-full bg-primary transition-all duration-[2600ms] ease-linear ${i === active ? "w-full" : "w-0"}`} /></div>
        </button>)}
      </div>
      <div className="mt-16 grid gap-8 md:grid-cols-3">{[[Telescope,"Real cosmic landmarks","Visit catalogued stars, galaxies, black holes, quasars and neutron stars."],[Atom,"Systems in motion","Watch planets, moons, asteroid belts and stellar systems evolve around you."],[Eye,"Built for discovery","Search the cosmic sitemap, select an object, then inspect it from every angle."]].map(([Icon,title,copy]) => <article key={String(title)} className="border-t border-border pt-6 transition hover:-translate-y-1"><Icon className="size-7 text-primary" /><h3 className="mt-5 text-xl font-semibold">{title as string}</h3><p className="mt-3 leading-7 text-muted-foreground">{copy as string}</p></article>)}</div>
    </div>
  </section>;
}

function Plates() {
  return <section className="bg-card py-24"><div className="mx-auto max-w-7xl px-5 lg:px-8">
    <div className="text-center"><Beacon label="Observation log" /><h2 className="mx-auto mt-5 max-w-3xl text-4xl font-black sm:text-5xl">Objects waiting for you inside.</h2></div>
    <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">{plates.map(([kind, name, dist, rot]) => <Link key={name} to="/universe" className={`group ${rot} rounded-2xl border border-border bg-background p-6 transition-all duration-500 hover:rotate-0 hover:scale-105 hover:border-primary hover:shadow-xl hover:shadow-primary/20`}>
      <span className="text-xs font-semibold uppercase tracking-widest text-primary">{kind}</span>
      <h3 className="mt-3 text-2xl font-semibold">{name}</h3>
      <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground"><span>Distance · {dist}</span><ArrowRight className="size-4 transition group-hover:translate-x-1 group-hover:text-primary" /></div>
    </Link>)}</div>
  </div></section>;
}

function Index() {
  return <PublicLayout><main>
    <Hero />
    <ScaleJourney />
    <Plates />
    <section className="py-24"><div className="mx-auto max-w-7xl px-5 lg:px-8"><Beacon label="Learn by exploring" /><h2 className="mt-4 max-w-3xl text-4xl font-black">See astronomy across scales that textbooks separate.</h2><div className="mt-12 grid gap-10 md:grid-cols-2"><div><h3 className="text-xl font-semibold">Solar and planetary science</h3><p className="mt-3 leading-7 text-muted-foreground">Compare planets, moons, orbital paths, asteroid belts and planetary systems while viewing their motion from any angle.</p></div><div><h3 className="text-xl font-semibold">Stars and stellar evolution</h3><p className="mt-3 leading-7 text-muted-foreground">Discover spectral classes, nearby stars, supergiants, variables, neutron stars and the physical properties that distinguish them.</p></div><div><h3 className="text-xl font-semibold">Galaxies and cosmic structure</h3><p className="mt-3 leading-7 text-muted-foreground">Travel from the Milky Way to the Local Group and beyond, comparing spiral, elliptical, dwarf and interacting galaxy forms.</p></div><div><h3 className="text-xl font-semibold">Extreme objects</h3><p className="mt-3 leading-7 text-muted-foreground">Inspect quasars, black holes, accretion structures and pulsars with explanations that connect each visualization to the underlying science.</p></div></div><div className="mt-12 rounded-2xl border border-border bg-card p-8"><h3 className="text-xl font-semibold">Visualize the mathematics behind the universe</h3><p className="mt-3 max-w-3xl leading-7 text-muted-foreground">The orbits, curves, vector fields and multivariable functions that govern everything you see here can be explored interactively in our companion tool, VisualizeMaths — a universal mathematical visualization engine built for complex astronomical mathematics.</p><Button asChild className="mt-5" variant="outline"><a href="https://visualizemaths.ai.studio" target="_blank" rel="noopener noreferrer">Open VisualizeMaths <ArrowRight /></a></Button></div><Button asChild className="mt-10"><Link to="/science">How the science is represented <ArrowRight /></Link></Button></div></section>
    <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8"><Beacon label="Fixed-term access" /><h2 className="mt-4 text-4xl font-black">Choose how long you want to explore.</h2><p className="mb-12 mt-4 max-w-2xl text-muted-foreground">Pay once through Razorpay with UPI, cards or net banking. Access begins after payment confirmation and does not renew automatically.</p><Plans /></section>
  </main></PublicLayout>;
}
