import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";

type NasaImage = { id: string; title: string; thumb: string; page: string; credit: string };

const PLANET_PAGES = new Set(["mercury", "venus", "earth", "mars", "jupiter", "saturn", "uranus", "neptune"]);
const MOONS: Record<string, string> = { moon: "moon", io: "jupiter/jupiter-moons/io", europa: "jupiter/jupiter-moons/europa", ganymede: "jupiter/jupiter-moons/ganymede", callisto: "jupiter/jupiter-moons/callisto", titan: "saturn/moons/titan", enceladus: "saturn/moons/enceladus", triton: "neptune/neptune-moons/triton", phobos: "mars/moons/phobos", deimos: "mars/moons/deimos", charon: "dwarf-planets/pluto/moons/charon" };
const MESSIER: Record<string, number> = { andromeda: 31, "andromeda galaxy": 31, triangulum: 33, "triangulum galaxy": 33, whirlpool: 51, "whirlpool galaxy": 51, sombrero: 104, "sombrero galaxy": 104, "pinwheel galaxy": 101, "bode's galaxy": 81, "cigar galaxy": 82, "black eye galaxy": 64, "sunflower galaxy": 63, "crab nebula": 1, "crab pulsar": 1, "southern pinwheel": 83, "southern pinwheel galaxy": 83, m87: 87, "messier 87": 87, "virgo a": 87, "m87*": 87 };
const DIRECT: Record<string, string> = {
  sun: "https://science.nasa.gov/sun/",
  pluto: "https://science.nasa.gov/dwarf-planets/pluto/",
  "milky way": "https://science.nasa.gov/resource/the-milky-way-galaxy/",
  "sagittarius a*": "https://science.nasa.gov/resource/sagittarius-a/",
  "large magellanic cloud": "https://science.nasa.gov/missions/hubble/hubble-views-the-large-magellanic-cloud/",
  "cygnus x-1": "https://chandra.harvard.edu/photo/2011/cygx1/",
  betelgeuse: "https://science.nasa.gov/missions/hubble/hubble-finds-that-betelgeuses-mysterious-dimming-is-due-to-a-traumatic-outburst/",
  "alpha centauri": "https://science.nasa.gov/missions/hubble/hubbles-best-image-of-alpha-centauri-a-and-b/",
  "proxima centauri": "https://science.nasa.gov/resource/proxima-centauri/",
  "3c 273": "https://science.nasa.gov/missions/hubble/hubble-sees-the-brightest-quasar-in-the-early-universe/",
};
const norm = (n: string) => n.trim().toLowerCase();
/** Direct official NASA document for the object when known; otherwise the NASA library record of its best real image. */
export function nasaLink(name: string, fallback?: string): string {
  const key = norm(name);
  if (PLANET_PAGES.has(key)) return `https://science.nasa.gov/${key}/`;
  if (MOONS[key]) return `https://science.nasa.gov/${MOONS[key]}/`;
  if (DIRECT[key]) return DIRECT[key];
  const m = MESSIER[key] ?? Number(key.match(/^(?:m|messier)\s?(\d{1,3})$/)?.[1] ?? NaN);
  if (m) return `https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-${m}/`;
  if (fallback) return fallback;
  return /galax/i.test(name) ? "https://science.nasa.gov/universe/galaxies/" : "https://science.nasa.gov/universe/stars/";
}

const TELESCOPE_WORDS = /hubble|webb|jwst|chandra|spitzer|herschel|galex|wise|kepler|tess|juno|cassini|voyager|new horizons|messenger|galileo|sdo|soho|lro|mro|fermi|nustar|telescope|observatory/i;
const BAD = /artist|illustration|concept|animation|graphic|rendering|celebration|logo|poster|infographic|diagram|chart|simulat/i;
const cache = new Map<string, NasaImage[]>();

function variants(name: string, query?: string): string[] {
  const clean = name.replace(/[*()]/g, "").replace(/\s+/g, " ").trim();
  const key = norm(name);
  const v = [query, clean];
  const m = MESSIER[key];
  if (m) v.push(`Messier ${m}`, `M${m}`);
  if (/galaxy/i.test(key) === false) v.push(`${clean} Hubble`, `${clean} Chandra`);
  if (key.includes("sagittarius a")) v.push("Milky Way center Chandra", "galactic center");
  if (key.includes("cygnus x-1")) v.push("Cygnus X-1 black hole");
  return [...new Set(v.filter(Boolean) as string[])];
}

async function searchOnce(q: string, mustWords: string[]): Promise<{ score: number; img: NasaImage }[]> {
  const res = await fetch(`https://images-api.nasa.gov/search?q=${encodeURIComponent(q)}&media_type=image&page_size=50`);
  if (!res.ok) return [];
  const json = await res.json();
  const items: Array<{ data?: any[]; links?: { href: string }[] }> = json?.collection?.items ?? [];
  return items.flatMap((it) => {
    const d = it.data?.[0];
    const thumb = it.links?.find((l) => /~(medium|small|large|orig)/.test(l.href))?.href ?? it.links?.[0]?.href;
    if (!d || !thumb) return [];
    const text = `${d.title} ${d.description ?? ""} ${(d.keywords ?? []).join(" ")}`;
    if (BAD.test(`${d.title} ${(d.keywords ?? []).join(" ")}`)) return [];
    const lt = String(d.title).toLowerCase();
    const lx = text.toLowerCase();
    const titleHit = mustWords.length && mustWords.every((w) => lt.includes(w)) ? 4 : mustWords.some((w) => lt.includes(w)) ? 2 : 0;
    const textHit = mustWords.every((w) => lx.includes(w)) ? 1 : 0;
    if (!titleHit) return [];
    const score = titleHit + textHit + (TELESCOPE_WORDS.test(text) ? 2 : 0) - (/artist|illustration|concept/i.test(d.description ?? "") ? 4 : 0);
    return [{ score, img: { id: d.nasa_id, title: d.title, thumb: thumb.replace(/~(thumb|small|orig|large)\./, "~medium."), page: `https://images.nasa.gov/details/${encodeURIComponent(d.nasa_id)}`, credit: d.secondary_creator || d.photographer || (d.center ? `NASA ${d.center}` : "NASA") } }];
  });
}

/** Real images from NASA's official Image and Video Library (images.nasa.gov) only. */
async function fetchNasaImages(name: string, query?: string): Promise<NasaImage[]> {
  const ck = `${name}|${query ?? ""}`;
  const hit = cache.get(ck);
  if (hit) return hit;
  const all = new Map<string, { score: number; img: NasaImage }>();
  for (const q of variants(name, query)) {
    const words = q.toLowerCase().replace(/[*()]/g, "").split(/\s+/).filter((w) => w.length > 2 && !/^(hubble|chandra|planet|galaxy)$/.test(w));
    const res = await searchOnce(q, words.length ? words : [q.toLowerCase()]);
    for (const r of res) if (!all.has(r.img.id) || all.get(r.img.id)!.score < r.score) all.set(r.img.id, r);
    if ([...all.values()].filter((x) => x.score >= 4).length >= 3) break;
  }
  const seen = new Set<string>();
  const out = [...all.values()].sort((a, b) => b.score - a.score).map((x) => x.img).filter((i) => { const t = i.title.toLowerCase(); if (seen.has(t)) return false; seen.add(t); return true; }).slice(0, 3);
  cache.set(ck, out);
  return out;
}

export function NasaResources({ name, query, alt }: { name: string; query?: string; alt?: string[] }) {
    const [images, setImages] = useState<NasaImage[] | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let alive = true;
    setImages(null);
    setFailed(false);
    (async () => {
      let r = await fetchNasaImages(name, query);
      // Broader fallbacks: catalogue aliases, then the object's class — still real NASA telescope photos.
      for (const a of alt ?? []) {
        if (r.length >= 2) break;
        const more = await fetchNasaImages(a);
        r = [...r, ...more.filter((m) => !r.some((x) => x.id === m.id))].slice(0, 3);
      }
      if (r.length === 0) r = await fetchNasaImages(/galaxy/i.test(name) ? "spiral galaxy Hubble" : "star field Hubble");
      return r;
    })()
      .then((r) => alive && setImages(r))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [name, query, alt?.join("|")]);

  return (
    <div className="mt-5">
      <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">Space telescope images</div>
      {images === null && !failed && <p className="mt-3 text-xs text-white/45">Loading images from NASA…</p>}
      {(failed || images?.length === 0) && (
        <p className="mt-3 text-xs text-white/45">No matching NASA telescope images were found for this object.</p>
      )}
      {images && images.length > 0 && (
        <div className="mt-3 space-y-3">
          {images.map((img) => (
            <a key={img.id} href={img.page} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-lg border border-white/10 bg-white/[0.03] transition hover:border-white/30">
              <img src={img.thumb} alt={img.title} loading="lazy" className="aspect-video w-full object-cover" />
              <div className="px-3 py-2">
                <div className="text-xs text-white/85">{img.title}</div>
                <div className="mt-0.5 text-[10px] text-white/40">Credit: {img.credit}</div>
              </div>
            </a>
          ))}
          <p className="text-[10px] text-white/35">Images from NASA's official Image and Video Library.</p>
        </div>
      )}
      <a
        href={nasaLink(name, images?.[0]?.page)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/10 px-4 py-2.5 text-xs uppercase tracking-[0.18em] text-white transition hover:bg-white/20"
      >
        Study {name} on NASA ↗
      </a>
    </div>
  );
}

/** Hide-only control for right-side panels: collapses the panel to a small tab without deselecting. */
export function HideablePanel({ resetKey, label, children }: { resetKey: string; label: string; children: (hideButton: ReactNode) => ReactNode }) {
  const [hidden, setHidden] = useState(false);
  useEffect(() => setHidden(false), [resetKey]);
  const hideButton = (
    <button
      onClick={(e) => {
        e.stopPropagation();
        setHidden(true);
      }}
      aria-label="Hide panel"
      title="Hide panel"
      className="absolute right-14 top-4 z-10 grid h-9 w-9 place-items-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6" /></svg>
    </button>
  );
  return (
    <>
      {!hidden && children(hideButton)}
      <AnimatePresence>
        {hidden && (
          <motion.button
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 60, opacity: 0 }}
            onClick={(e) => {
              e.stopPropagation();
              setHidden(false);
            }}
            className="fixed right-0 top-1/2 z-30 -translate-y-1/2 rounded-l-xl border border-r-0 border-white/15 bg-black/70 px-3 py-4 text-[10px] uppercase tracking-[0.2em] text-white/80 backdrop-blur-md [writing-mode:vertical-rl] hover:text-white"
            title="Show panel"
          >
            ‹ {label}
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
