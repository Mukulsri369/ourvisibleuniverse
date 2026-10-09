import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";

type NasaImage = { id: string; title: string; thumb: string; page: string; credit: string };

const PLANET_PAGES = new Set(["mercury", "venus", "earth", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"]);

/** Official NASA page for the object (planet pages are direct; everything else uses NASA's own search). */
export function nasaLink(name: string): string {
  const key = name.trim().toLowerCase();
  if (PLANET_PAGES.has(key)) return `https://science.nasa.gov/${key === "pluto" ? "dwarf-planets/pluto" : key}/`;
  if (key === "sun") return "https://science.nasa.gov/sun/";
  if (key === "moon") return "https://science.nasa.gov/moon/";
  if (key === "milky way") return "https://science.nasa.gov/universe/galaxies/";
  return `https://www.nasa.gov/?search=${encodeURIComponent(name)}`;
}

const TELESCOPE_WORDS = /hubble|webb|jwst|chandra|spitzer|herschel|galex|wise|kepler|tess|juno|cassini|voyager|new horizons|messenger|magellan|galileo|sdo|soho|lro|mro|fermi|nustar|observatory|telescope/i;
const cache = new Map<string, NasaImage[]>();

/** Real images from NASA's official Image and Video Library (images.nasa.gov) only. */
async function fetchNasaImages(query: string): Promise<NasaImage[]> {
  const hit = cache.get(query);
  if (hit) return hit;
  const res = await fetch(`https://images-api.nasa.gov/search?q=${encodeURIComponent(query)}&media_type=image&page_size=40`);
  if (!res.ok) throw new Error("NASA library unavailable");
  const json = await res.json();
  const words = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
  const items: Array<{ data?: any[]; links?: { href: string }[] }> = json?.collection?.items ?? [];
  const scored = items
    .map((it) => {
      const d = it.data?.[0];
      const thumb = it.links?.[0]?.href;
      if (!d || !thumb) return null;
      const text = `${d.title} ${d.description ?? ""} ${(d.keywords ?? []).join(" ")}`;
      const lower = String(d.title).toLowerCase();
      const nameScore = words.every((w) => lower.includes(w)) ? 3 : words.some((w) => lower.includes(w)) ? 1 : 0;
      if (nameScore === 0) return null;
      const score = nameScore + (TELESCOPE_WORDS.test(text) ? 2 : 0) - (/artist|illustration|concept|animation|graphic/i.test(text) ? 10 : 0);
      return {
        score,
        img: {
          id: d.nasa_id,
          title: d.title,
          thumb: thumb.replace("~thumb", "~medium"),
          page: `https://images.nasa.gov/details/${encodeURIComponent(d.nasa_id)}`,
          credit: d.secondary_creator || (d.center ? `NASA ${d.center}` : "NASA"),
        } as NasaImage,
      };
    })
    .filter((x): x is { score: number; img: NasaImage } => !!x && x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => x.img);
  cache.set(query, scored);
  return scored;
}

export function NasaResources({ name, query }: { name: string; query?: string }) {
  const q = query ?? name;
  const [images, setImages] = useState<NasaImage[] | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let alive = true;
    setImages(null);
    setFailed(false);
    fetchNasaImages(q)
      .then((r) => alive && setImages(r))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [q]);

  return (
    <div className="mt-7">
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
        href={nasaLink(name)}
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
