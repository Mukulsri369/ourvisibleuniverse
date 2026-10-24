import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Shuffle } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { LandingPlans } from "@/components/site/LandingPlans";
import {
  AUTHENTIC_STORE_SEED,
  fetchLiveStoreProducts,
  type StoreProduct,
} from "@/lib/store-products";
import galaxy from "@/assets/images/deep_space_galaxy_1791934612897.jpg";
import saturn from "@/assets/images/saturn_rings_cosmic_1791934612062.jpg";

import "@/landing.css";
import { ImmersiveHero } from "@/components/site/immersive/ImmersiveHero";
import { AcademyScene } from "@/components/site/immersive/AcademyScene";
import { PointerExperience } from "@/components/site/immersive/PointerExperience";
import { SmoothScroll } from "@/components/site/immersive/SmoothScroll";
import { ProductMedia } from "@/components/site/immersive/ProductMedia";
import "@/landing-premium.css";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Our Visible Universe — 3D Observatory & Academy" },
      {
        name: "description",
        content:
          "Explore 100,000+ Gaia stars, planets and black holes in an interactive 3D universe. Learn astronomy in 24 modules and discover our official space store.",
      },
      { property: "og:title", content: "Our Visible Universe — 3D Observatory & Academy" },
      {
        property: "og:description",
        content:
          "An interactive 3D cosmos spanning planets, exoplanets, galaxies and relativistic Kerr black holes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Albert+Sans:wght@400;500;600&display=swap",
      },
    ],
  }),
  component: Index,
});
const destinations = [
  {
    name: "Black holes",
    image: "/assets/aistudio/kerr2_poster.jpg",
    title: "At the edge of light",
    copy: "Explore rotating Kerr black holes, accretion disks and the bending of light around extreme gravity.",
    alt: "Visualization of a black hole and its bright accretion disk",
  },
  {
    name: "Galaxies",
    image: galaxy,
    title: "A wider perspective",
    copy: "Travel beyond our stellar neighborhood to discover galaxies and the structure of the observable universe.",
    alt: "A spiral galaxy surrounded by distant stars",
  },
  {
    name: "Solar system",
    image: saturn,
    title: "Begin closer to home",
    copy: "Visit the planets, follow their orbits and discover the worlds that share our corner of space.",
    alt: "Saturn and its expansive rings",
  },
];
const categories = [
  ["all", "All objects"],
  ["projectors", "Projectors"],
  ["aurora", "Aurora lamps"],
  ["decor", "Décor & clocks"],
] as const;
function matchesCategory(p: StoreProduct, category: string) {
  const text = `${p.category} ${p.name}`.toLowerCase();
  return (
    category === "all" ||
    (category === "projectors"
      ? /projector/.test(text)
      : category === "aurora"
        ? /aurora|lamp|light/.test(text)
        : /decor|décor|clock|art|poster|book/.test(text))
  );
}
function Index() {
  const root = useRef<HTMLElement>(null);
  const [destination, setDestination] = useState(0);

  const [products, setProducts] = useState<StoreProduct[]>(AUTHENTIC_STORE_SEED);
  const [category, setCategory] = useState("all");
  const [offset, setOffset] = useState(0);

  const filtered = useMemo(
    () => products.filter((p) => matchesCategory(p, category)),
    [products, category],
  );
  const shown = useMemo(
    () => [...filtered.slice(offset), ...filtered.slice(0, offset)].slice(0, 6),
    [filtered, offset],
  );
  const place = destinations[destination];
  useEffect(() => {
    root.current?.setAttribute("data-hydrated", "true");

    let active = true;
    fetchLiveStoreProducts()
      .then((items) => {
        if (active && items.length) setProducts(items);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    let disposed = false;
    let cleanup: (() => void) | undefined;
    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")])
      .then(([{ gsap }, { ScrollTrigger }]) => {
        if (disposed || !root.current) return;
        gsap.registerPlugin(ScrollTrigger);
        const media = gsap.matchMedia();
        media.add("(prefers-reduced-motion: no-preference)", () => {
          const context = gsap.context(() => {
            if (!CSS.supports("animation-timeline", "view()")) {
              gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
                gsap.from(element, {
                  y: 26,
                  duration: 0.75,
                  clearProps: "transform",
                  scrollTrigger: { trigger: element, start: "top 94%", once: true },
                });
              });
            }
          }, root);
          return () => context.revert();
        });
        cleanup = () => media.revert();
        void document.fonts.ready.then(() => {
          if (!disposed) ScrollTrigger.refresh();
        });
      })
      .catch(() => {});
    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);
  return (
    <PublicLayout className="ovu-landing">
      <a className="ovu-skip" href="#landing-content">
        Skip to content
      </a>
      <PointerExperience />
      <SmoothScroll />
      <main ref={root} id="landing-content">
        <ImmersiveHero />
        <section
          id="observatory"
          className="ovu-observatory ovu-frame"
          aria-labelledby="observatory-title"
        >
          <div className="ovu-section-heading">
            <h2 id="observatory-title" data-reveal>
              Wonder, with coordinates.
            </h2>
            <p data-reveal>
              100,000+ Gaia stars. Real planetary systems. A cosmos you can navigate at your own
              pace.
            </p>
          </div>
          <div
            className="ovu-destination-controls"
            role="group"
            aria-label="Choose a preview destination"
          >
            {destinations.map((item, index) => (
              <button
                key={item.name}
                aria-pressed={destination === index}
                onClick={() => setDestination(index)}
              >
                <img src={item.image} alt="" width="240" height="135" loading="lazy" />
                <span>{item.name}</span>
              </button>
            ))}
          </div>
          <div className="ovu-destination" data-reveal>
            <img
              key={place.image}
              src={place.image}
              alt={place.alt}
              loading="lazy"
              width="1400"
              height="900"
            />
            <div className="ovu-destination-copy" aria-live="polite" aria-atomic="true">
              <h3>{place.title}</h3>
              <p>{place.copy}</p>
              <Link to="/universe" className="ovu-text-link">
                Explore in 3D <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
            </div>
          </div>
          <div className="ovu-atlas-pictures">
            <figure data-reveal>
              <img
                src={galaxy}
                alt="Spiral galaxy with a bright stellar core and sweeping arms"
                width="1000"
                height="700"
                loading="lazy"
              />
              <figcaption>Beyond our stellar neighborhood</figcaption>
            </figure>
            <figure data-reveal>
              <img
                src={saturn}
                alt="Saturn seen close up with its rings crossing the foreground"
                width="1000"
                height="700"
                loading="lazy"
              />
              <figcaption>The worlds closer to home</figcaption>
            </figure>
          </div>
          <div className="ovu-observatory-links">
            <Link to="/galaxies">Browse the galaxy atlas</Link>
            <Link to="/science">The science behind the scene</Link>
            <Link to="/visible-universe-history">A history of discovery</Link>
          </div>
        </section>
        <AcademyScene />
        <section id="plans" className="ovu-passes ovu-frame" aria-labelledby="passes-title">
          <div className="ovu-section-heading">
            <h2 id="passes-title" data-reveal>
              Make time for space.
            </h2>
            <p data-reveal>
              Choose your exploration pass. Full observatory and academy access, one payment, no
              automatic renewal.
            </p>
          </div>
          <div className="ovu-access-plans" data-reveal>
            <LandingPlans />
          </div>
        </section>
        <section id="store" className="ovu-store ovu-frame" aria-labelledby="store-title">
          <div className="ovu-section-heading">
            <h2 id="store-title" data-reveal>
              A little space
              <br />
              to call your own.
            </h2>
            <div data-reveal>
              <p>
                Bring the fascination home. Discover projectors, ambient lights and objects inspired
                by the night sky.
              </p>
              <a
                className="ovu-text-link"
                href="https://ourvisibleuniverse.store"
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit the official store <ArrowUpRight size={18} aria-hidden="true" />
              </a>
            </div>
          </div>
          <div className="ovu-store-toolbar">
            <div className="ovu-store-filters" role="group" aria-label="Product categories">
              {categories.map(([key, label]) => (
                <button
                  key={key}
                  aria-pressed={category === key}
                  onClick={() => {
                    setCategory(key);
                    setOffset(0);
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              className="ovu-shuffle"
              onClick={() =>
                setOffset((current) =>
                  filtered.length > 1
                    ? (current + Math.max(1, Math.floor(filtered.length / 2))) % filtered.length
                    : 0,
                )
              }
              disabled={filtered.length < 2}
            >
              <Shuffle size={16} aria-hidden="true" /> Shuffle
            </button>
          </div>
          <p className="ovu-product-count sr-only" role="status">
            {filtered.length} {filtered.length === 1 ? "object" : "objects"} in this collection
          </p>
          <div className="ovu-product-grid">
            {shown.map((product, index) => (
              <article
                key={product.id}
                className={`ovu-product ${index === 0 || index === 5 ? "ovu-product-featured" : ""}`}
              >
                <ProductMedia key={product.image} product={product} />
                <div className="ovu-product-details">
                  <div>
                    <p>{product.category}</p>
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ovu-product-name"
                    >
                      {product.name}
                    </a>
                  </div>
                  <div className="ovu-product-purchase">
                    <p>{product.price}</p>
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`View ${product.name}`}
                    >
                      View object <ArrowUpRight size={17} aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
          {shown.length === 0 && (
            <p className="ovu-empty">
              No objects in this collection right now.{" "}
              <button onClick={() => setCategory("all")}>See all objects</button>
            </p>
          )}
        </section>
        <section className="ovu-community ovu-frame" aria-labelledby="community-title">
          <div data-reveal>
            <h2 id="community-title">Curiosity keeps us looking up.</h2>
            <p>More discoveries, closer to your everyday.</p>
          </div>
          <a
            href="https://www.instagram.com/our_visibleuniverse"
            target="_blank"
            rel="noopener noreferrer"
            className="ovu-button"
            data-reveal
          >
            Follow our universe <ArrowUpRight size={18} aria-hidden="true" />
          </a>
        </section>
      </main>
    </PublicLayout>
  );
}
