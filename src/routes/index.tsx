import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Atom, Eye, Telescope } from "lucide-react";
import hero from "@/assets/universe-hero.jpg";
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

function Index() {
  return <PublicLayout><main>
    <section className="relative flex min-h-[88vh] items-end overflow-hidden pb-20 pt-32">
      <img src={hero} alt="The Milky Way above Earth in deep space" width={1600} height={1000} className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-0 bg-hero-overlay" />
      <div className="relative mx-auto w-full max-w-7xl px-5 lg:px-8"><p className="text-sm font-semibold uppercase text-primary">Interactive astronomy education</p><h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-tight text-hero-foreground sm:text-7xl">Our Visible Universe</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-hero-muted">Learn how planetary systems, stars, galaxies and extreme cosmic objects fit together through a cinematic 3D universe grounded in real astronomical data.</p><div className="mt-8 flex flex-wrap gap-3"><Button asChild size="lg"><Link to="/pricing">Get access <ArrowRight /></Link></Button><Button asChild size="lg" variant="outline"><Link to="/science">Explore the science</Link></Button></div></div>
    </section>
    <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8"><p className="text-sm font-semibold uppercase text-primary">One universe. Every scale.</p><h2 className="mt-4 max-w-3xl text-4xl font-semibold sm:text-5xl">Explore space as a place, not a list.</h2><div className="mt-12 grid gap-8 md:grid-cols-3">{[[Telescope,"Real cosmic landmarks","Visit catalogued stars, galaxies, black holes, quasars and neutron stars."],[Atom,"Systems in motion","Watch planets, moons, asteroid belts and stellar systems evolve around you."],[Eye,"Built for discovery","Search the cosmic sitemap, select an object, then inspect it from every angle."]].map(([Icon,title,copy]) => <article key={String(title)} className="border-t border-border pt-6"><Icon className="size-7 text-primary" /><h3 className="mt-5 text-xl font-semibold">{title as string}</h3><p className="mt-3 leading-7 text-muted-foreground">{copy as string}</p></article>)}</div></section>
    <section className="bg-card py-24"><div className="mx-auto max-w-7xl px-5 lg:px-8"><p className="text-sm font-semibold uppercase text-primary">Learn by exploring</p><h2 className="mt-4 max-w-3xl text-4xl font-semibold">See astronomy across scales that textbooks separate.</h2><div className="mt-12 grid gap-10 md:grid-cols-2"><div><h3 className="text-xl font-semibold">Solar and planetary science</h3><p className="mt-3 leading-7 text-muted-foreground">Compare planets, moons, orbital paths, asteroid belts and planetary systems while viewing their motion from any angle.</p></div><div><h3 className="text-xl font-semibold">Stars and stellar evolution</h3><p className="mt-3 leading-7 text-muted-foreground">Discover spectral classes, nearby stars, supergiants, variables, neutron stars and the physical properties that distinguish them.</p></div><div><h3 className="text-xl font-semibold">Galaxies and cosmic structure</h3><p className="mt-3 leading-7 text-muted-foreground">Travel from the Milky Way to the Local Group and beyond, comparing spiral, elliptical, dwarf and interacting galaxy forms.</p></div><div><h3 className="text-xl font-semibold">Extreme objects</h3><p className="mt-3 leading-7 text-muted-foreground">Inspect quasars, black holes, accretion structures and pulsars with explanations that connect each visualization to the underlying science.</p></div></div><Button asChild className="mt-10"><Link to="/science">How the science is represented <ArrowRight /></Link></Button></div></section>
    <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8"><p className="text-sm font-semibold uppercase text-primary">Fixed-term access</p><h2 className="mt-4 text-4xl font-semibold">Choose how long you want to explore.</h2><p className="mb-12 mt-4 max-w-2xl text-muted-foreground">Pay once through Razorpay with UPI, cards or net banking. Access begins after payment confirmation and does not renew automatically.</p><Plans /></section>
  </main></PublicLayout>;
}
