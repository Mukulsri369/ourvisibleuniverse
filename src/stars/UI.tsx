import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { NAMED_STARS, type NamedStar } from "./data";
import { useStore, TOUR_STOPS } from "./store";
import { AU, PLANETS } from "./Planets";
import { NAMED_GALAXIES } from "./Universe";


export function InfoPanel() {
  const star = useStore((s) => s.selectedStar);
  const setSelected = useStore((s) => s.setSelected);
  return (
    <AnimatePresence>
      {star && (
        <motion.aside
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed right-0 top-0 z-30 h-full w-full max-w-[380px] border-l border-white/10 p-7 text-white"
          style={{ background: "rgba(8,10,24,0.78)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)" }}
        >
          <button
            onClick={() => setSelected(null)}
            aria-label="Close"
            className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
          <h2 className="pr-10 text-3xl font-light tracking-wide">{star.name}</h2>
          <div className="mt-1 text-xs uppercase tracking-[0.2em] text-white/40">{star.constellation}</div>
          <div className="mt-6 grid grid-cols-2 gap-y-4 text-sm">
            <Stat label="Distance" value={`${star.distance.toFixed(2)} ly`} />
            <Stat label="Spectral" value={star.spectral} />
            <Stat label="Magnitude" value={star.magnitude.toFixed(2)} />
            <Stat label="Constellation" value={star.constellation} />
          </div>
          <div className="my-6 h-px bg-white/10" />
          <p className="text-sm leading-relaxed text-white/75">{star.description}</p>
          {star.companions?.length ? (
            <div className="mt-6">
              <div className="text-xs uppercase tracking-[0.2em] text-white/40">Companions</div>
              <ul className="mt-2 space-y-1 text-sm text-white/70">
                {star.companions.map((c) => (
                  <li key={c.name}>{c.name} <span className="text-white/40">— {c.spectral}</span></li>
                ))}
              </ul>
            </div>
          ) : null}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">{label}</div>
      <div className="mt-1 text-base font-light">{value}</div>
    </div>
  );
}

export function TopLeftControls() {
  const startTour = useStore((s) => s.startTour);
  const tourActive = useStore((s) => s.tourActive);
  const stopTour = useStore((s) => s.stopTour);
  const spectralMode = useStore((s) => s.spectralMode);
  const toggleSpectral = useStore((s) => s.toggleSpectral);
  const [searchOpen, setSearchOpen] = useState(false);
  return (
    <div className="fixed left-6 top-5 z-20 flex items-center gap-3 text-white/80">
      {!tourActive ? (
        <button onClick={startTour} className="text-xs uppercase tracking-[0.25em] text-white/70 transition hover:text-white">
          ◯ Take the Tour
        </button>
      ) : (
        <button onClick={stopTour} className="text-xs uppercase tracking-[0.25em] text-white/70 transition hover:text-white">
          ✕ Skip Tour
        </button>
      )}
      <div className="mx-2 h-4 w-px bg-white/15" />
      <IconButton title="Toggle Spectral Colors" onClick={toggleSpectral} active={spectralMode}>
        <SpectrumIcon />
      </IconButton>
      <IconButton title="Search stars" onClick={() => setSearchOpen((v) => !v)} active={searchOpen}>
        <SearchIcon />
      </IconButton>
      <SearchBar open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}

function IconButton({ children, title, onClick, active }: { children: React.ReactNode; title: string; onClick: () => void; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`grid h-9 w-9 place-items-center rounded-full border transition ${active ? "border-white/60 bg-white/10 text-white" : "border-white/15 text-white/60 hover:border-white/40 hover:text-white"}`}
    >
      {children}
    </button>
  );
}

function SpectrumIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16">
      <defs>
        <linearGradient id="sg" x1="0" x2="1">
          <stop offset="0" stopColor="#ff4422" />
          <stop offset="0.5" stopColor="#fff4ea" />
          <stop offset="1" stopColor="#6688ff" />
        </linearGradient>
      </defs>
      <rect x="1" y="6" width="14" height="4" rx="1" fill="url(#sg)" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
    </svg>
  );
}

type SearchHit =
  | { kind: "star"; name: string; sub: string; star: NamedStar }
  | { kind: "planet"; name: string; sub: string }
  | { kind: "galaxy"; name: string; sub: string; galaxy: typeof NAMED_GALAXIES[number] };

function SearchBar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const flyTo = useStore((s) => s.flyToStar);
  const setVisitPlanet = useStore((s) => s.setVisitPlanet);
  const setVisitGalaxy = useStore((s) => s.setVisitGalaxy);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (open) inputRef.current?.focus(); else setQ(""); }, [open]);
  const matches = useMemo<SearchHit[]>(() => {
    if (!q) return [];
    const lower = q.toLowerCase();
    const stars: SearchHit[] = NAMED_STARS
      .filter((s) => s.name.toLowerCase().includes(lower))
      .map((s) => ({ kind: "star", name: s.name, sub: `Star · ${s.distance.toFixed(1)} ly`, star: s }));
    const planets: SearchHit[] = PLANETS
      .filter((p) => p.name.toLowerCase().includes(lower))
      .map((p) => ({ kind: "planet", name: p.name, sub: `Planet · ${(p.a / AU).toFixed(2)} AU` }));
    const galaxies: SearchHit[] = NAMED_GALAXIES
      .filter((g) => g.name.toLowerCase().includes(lower))
      .map((g) => ({
        kind: "galaxy",
        name: g.name,
        sub: `Galaxy · ${g.distance >= 1_000_000 ? (g.distance / 1_000_000).toFixed(2) + " Mly" : (g.distance / 1000).toFixed(0) + " kly"}`,
        galaxy: g,
      }));
    return [...planets, ...stars, ...galaxies].slice(0, 8);
  }, [q]);
  const activate = (m: SearchHit) => {
    if (m.kind === "star") flyTo(m.star);
    else if (m.kind === "planet") setVisitPlanet(m.name);
    else {
      const g = m.galaxy;
      setVisitGalaxy({
        name: g.name,
        x: g.position.x,
        y: g.position.y,
        z: g.position.z,
        size: g.size,
        distance: g.distance,
        type: g.type,
      });
    }
    onClose();
  };
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 260, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          className="relative ml-2 overflow-visible"
        >
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search stars, planets, galaxies..."
            className="h-9 w-full rounded-full border border-white/20 bg-white/5 px-4 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/50"
          />
          {matches.length > 0 && (
            <ul className="absolute left-0 right-0 top-11 overflow-hidden rounded-lg border border-white/10 bg-black/70 backdrop-blur">
              {matches.map((m) => (
                <li key={`${m.kind}:${m.name}`}>
                  <button
                    className="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-white/80 hover:bg-white/10"
                    onClick={() => activate(m)}
                  >
                    <span>{m.name}</span>
                    <span className="ml-2 text-xs text-white/40">{m.sub}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ZoomSlider() {
  const distance = useStore((s) => s.cameraDistance);
  const minR = 0.005, maxR = 5000;
  const t = Math.min(1, Math.max(0, (Math.log(distance) - Math.log(minR)) / (Math.log(maxR) - Math.log(minR))));
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const n = parseFloat(e.target.value);
    (window as unknown as { __setZoom?: (n: number) => void }).__setZoom?.(n);
  };
  return (
    <div className="pointer-events-auto fixed right-6 top-1/2 z-20 hidden h-[40vh] w-6 -translate-y-1/2 flex-col items-center md:flex">
      <input
        type="range"
        min={0}
        max={1}
        step={0.001}
        value={t}
        onChange={onChange}
        className="zoom-range h-full"
        style={{ writingMode: "vertical-lr" as React.CSSProperties["writingMode"], direction: "rtl" }}
      />
    </div>
  );
}

export function TourCaption() {
  const caption = useStore((s) => s.tourCaption);
  return (
    <AnimatePresence>
      {caption && (
        <motion.div
          key={caption}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.6 }}
          className="pointer-events-none fixed bottom-24 left-0 right-0 z-20 text-center"
        >
          <div className="mx-auto max-w-2xl px-6 text-lg font-light tracking-wide text-white/90 md:text-2xl" style={{ textShadow: "0 2px 30px rgba(0,0,0,0.7)" }}>
            {caption}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ScaleIndicator() {
  const d = useStore((s) => s.cameraDistance);
  const label =
    d < 5 ? `${d.toFixed(1)} light-years`
    : d < 50 ? `${Math.round(d)} light-years`
    : d < 500 ? `${Math.round(d / 10) * 10} light-years`
    : d < 5000 ? `${Math.round(d / 100) * 100} light-years`
    : `${(d / 1000).toFixed(1)}k light-years`;
  return (
    <div className="pointer-events-none fixed bottom-5 left-1/2 z-20 -translate-x-1/2 text-[11px] uppercase tracking-[0.3em] text-white/50">
      {label}
    </div>
  );
}

// Ambient drone via WebAudio so we don't need an asset.
function useDrone(on: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{ gain: GainNode; oscs: OscillatorNode[] } | null>(null);
  useEffect(() => {
    if (on) {
      const Ctx = (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
      const ctx = new Ctx();
      ctxRef.current = ctx;
      const gain = ctx.createGain();
      gain.gain.value = 0;
      gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 2);
      gain.connect(ctx.destination);
      const freqs = [55, 82.5, 110, 164.81];
      const oscs = freqs.map((f, i) => {
        const o = ctx.createOscillator();
        o.type = i === 0 ? "sine" : i === 3 ? "triangle" : "sine";
        o.frequency.value = f;
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.value = 0.05 + i * 0.03;
        lfoGain.gain.value = f * 0.005;
        lfo.connect(lfoGain).connect(o.frequency);
        const sub = ctx.createGain();
        sub.gain.value = 1 / freqs.length;
        o.connect(sub).connect(gain);
        o.start();
        lfo.start();
        return o;
      });
      nodesRef.current = { gain, oscs };
      return () => {
        try {
          gain.gain.cancelScheduledValues(ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
          setTimeout(() => { oscs.forEach((o) => o.stop()); ctx.close(); }, 700);
        } catch { /* noop */ }
      };
    }
  }, [on]);
}

export function MusicToggle() {
  const on = useStore((s) => s.musicOn);
  const toggle = useStore((s) => s.toggleMusic);
  useDrone(on);
  return (
    <button
      onClick={toggle}
      className="fixed bottom-5 left-6 z-20 grid h-10 w-10 place-items-center rounded-full border border-white/15 text-white/60 transition hover:border-white/40 hover:text-white"
      aria-label="Toggle ambient music"
      title="Toggle ambient music"
    >
      {on ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z" /></svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5L6 9H3v6h3l5 4V5z" /><line x1="22" y1="9" x2="16" y2="15" /><line x1="16" y1="9" x2="22" y2="15" /></svg>
      )}
    </button>
  );
}

export function Branding() {
  return (
    <div className="pointer-events-none fixed bottom-5 right-6 z-20 text-[10px] uppercase tracking-[0.3em] text-white/30">
      100,000 Stars — A Cosmic Experiment
    </div>
  );
}

export function PlanetNavigator() {
  const visit = useStore((s) => s.visitPlanet);
  const setVisit = useStore((s) => s.setVisitPlanet);
  const tourActive = useStore((s) => s.tourActive);
  if (tourActive) return null;
  const current = visit ? PLANETS.find((p) => p.name === visit) : null;
  return (
    <>
      <div className="pointer-events-auto fixed bottom-20 left-1/2 z-20 -translate-x-1/2">
        <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/50 px-2 py-1.5 backdrop-blur-md">
          <span className="px-2 text-[10px] uppercase tracking-[0.25em] text-white/40">Visit Planet</span>
          {PLANETS.map((p) => (
            <button
              key={p.name}
              onClick={() => setVisit(visit === p.name ? null : p.name)}
              title={p.name}
              className={`group flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] tracking-wide transition ${
                visit === p.name ? "bg-white/15 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ background: p.color, boxShadow: `0 0 6px ${p.color}` }}
              />
              <span className="hidden sm:inline">{p.name}</span>
            </button>
          ))}
        </div>
      </div>
      <AnimatePresence>
        {current && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="pointer-events-auto fixed left-6 top-1/2 z-20 hidden w-72 -translate-y-1/2 rounded-xl border border-white/10 bg-black/55 p-5 backdrop-blur-md md:block"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-white/40">Now Viewing</div>
                <h3 className="mt-1 text-2xl font-light tracking-wide">{current.name}</h3>
              </div>
              <button
                onClick={() => setVisit(null)}
                aria-label="Exit"
                className="grid h-8 w-8 place-items-center rounded-full text-white/60 hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-white/70">{current.description}</p>
            <div className="mt-4 grid grid-cols-2 gap-y-2 text-[11px] text-white/70">
              <span className="text-white/40">Distance</span><span>{(current.a / AU).toFixed(2)} AU</span>
              <span className="text-white/40">Eccentricity</span><span>{current.e.toFixed(4)}</span>
              <span className="text-white/40">Inclination</span><span>{(current.i * 180 / Math.PI).toFixed(2)}°</span>
              <span className="text-white/40">Axial tilt</span><span>{(current.tilt * 180 / Math.PI).toFixed(1)}°</span>
              {current.moons?.length ? (
                <>
                  <span className="text-white/40">Moons</span>
                  <span>{current.moons.map((m) => m.name).join(", ")}</span>
                </>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Compact horizontally-scrollable star picker — same interaction pattern as
// PlanetNavigator but for the named star catalog. Click a star to fly to it;
// the InfoPanel on the right shows its details.
export function StarNavigator() {
  const tourActive = useStore((s) => s.tourActive);
  const selected = useStore((s) => s.selectedStar);
  const flyTo = useStore((s) => s.flyToStar);
  const setSelected = useStore((s) => s.setSelected);
  // Stop at Sun click clears selection (return to Solar System)
  const stars = useMemo(
    () => NAMED_STARS.filter((s) => s.name !== "Sun").slice(0, 40),
    [],
  );
  if (tourActive) return null;
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="pointer-events-auto fixed bottom-32 left-1/2 z-20 hidden -translate-x-1/2 md:block"
    >
      <div className="flex max-w-[min(90vw,900px)] items-center gap-1 overflow-x-auto rounded-full border border-white/10 bg-black/50 px-2 py-1.5 backdrop-blur-md">
        <span className="whitespace-nowrap px-2 text-[10px] uppercase tracking-[0.25em] text-white/40">Visit Star</span>
        <button
          onClick={(e) => { e.stopPropagation(); setSelected(null); }}
          className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] transition ${
            !selected ? "bg-white/15 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
          }`}
        >
          ☉ Sun
        </button>
        {stars.map((s) => {
          const active = selected?.name === s.name;
          return (
            <button
              key={s.name}
              onClick={(e) => { e.stopPropagation(); flyTo(s); }}
              title={`${s.name} — ${s.distance.toFixed(2)} ly`}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] transition ${
                active ? "bg-white/15 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: "#cfe0ff", boxShadow: "0 0 6px #88aaff" }}
              />
              {s.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}


// Galaxy visit panel — mirrors StarNavigator but for extragalactic targets.
// Clicking a galaxy tells the camera to fly out to that galaxy's world-space
// position and orbit it at a framing distance proportional to its size.
export function GalaxyNavigator() {
  const tourActive = useStore((s) => s.tourActive);
  const visitGalaxy = useStore((s) => s.visitGalaxy);
  const setVisitGalaxy = useStore((s) => s.setVisitGalaxy);
  const galaxies = useMemo(
    () => NAMED_GALAXIES.slice().sort((a, b) => a.distance - b.distance),
    [],
  );
  if (tourActive) return null;
  return (
    <>
      <div
        onClick={(e) => e.stopPropagation()}
        className="pointer-events-auto fixed bottom-44 left-1/2 z-20 hidden -translate-x-1/2 md:block"
      >
        <div className="flex max-w-[min(92vw,940px)] items-center gap-1 overflow-x-auto rounded-full border border-white/10 bg-black/50 px-2 py-1.5 backdrop-blur-md">
          <span className="whitespace-nowrap px-2 text-[10px] uppercase tracking-[0.25em] text-white/40">Visit Galaxy</span>
          <button
            onClick={(e) => { e.stopPropagation(); setVisitGalaxy(null); }}
            className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] transition ${
              !visitGalaxy ? "bg-white/15 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            ✦ Milky Way
          </button>
          {galaxies.map((g) => {
            const active = visitGalaxy?.name === g.name;
            return (
              <button
                key={g.name}
                onClick={(e) => {
                  e.stopPropagation();
                  setVisitGalaxy({
                    name: g.name,
                    x: g.position.x,
                    y: g.position.y,
                    z: g.position.z,
                    size: g.size,
                    distance: g.distance,
                    type: g.type,
                  });
                }}
                title={`${g.name} — ${g.distance.toLocaleString()} ly`}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] transition ${
                  active ? "bg-white/15 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ background: g.color, boxShadow: `0 0 6px ${g.color}` }}
                />
                {g.name}
              </button>
            );
          })}
        </div>
      </div>
      <AnimatePresence>
        {visitGalaxy && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="pointer-events-auto fixed right-6 top-1/2 z-20 hidden w-72 -translate-y-1/2 rounded-xl border border-white/10 bg-black/55 p-5 backdrop-blur-md md:block"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-white/40">Now Viewing</div>
                <h3 className="mt-1 text-2xl font-light tracking-wide">{visitGalaxy.name}</h3>
              </div>
              <button
                onClick={() => setVisitGalaxy(null)}
                aria-label="Exit"
                className="grid h-8 w-8 place-items-center rounded-full text-white/60 hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-y-2 text-[11px] text-white/70">
              <span className="text-white/40">Type</span><span>{visitGalaxy.type}</span>
              <span className="text-white/40">Distance</span><span>{formatLy(visitGalaxy.distance)}</span>
              <span className="text-white/40">Diameter</span><span>{formatLy(visitGalaxy.size)}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function formatLy(v: number): string {
  if (v >= 1e9) return `${(v / 1e9).toFixed(2)} Gly`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(2)} Mly`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(1)}k ly`;
  return `${Math.round(v)} ly`;
}

// Small floating toggle to hide/show all overlay panels for a clean view.
export function UIHideToggle() {
  const hidden = useStore((s) => s.uiHidden);
  const toggle = useStore((s) => s.toggleUiHidden);
  return (
    <button
      onClick={(e) => { e.stopPropagation(); toggle(); }}
      title={hidden ? "Show panels" : "Hide panels for clean view"}
      aria-label={hidden ? "Show panels" : "Hide panels"}
      className="fixed right-6 top-5 z-40 grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-black/40 text-white/70 backdrop-blur transition hover:border-white/50 hover:text-white"
    >
      {hidden ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a19.77 19.77 0 0 1 4.22-5.28"/><path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 7 11 7a19.77 19.77 0 0 1-2.66 3.72"/><path d="M1 1l22 22"/></svg>
      )}
    </button>
  );
}





export function TourStopIndicator() {
  const active = useStore((s) => s.tourActive);
  const stop = useStore((s) => s.tourStop);
  if (!active) return null;
  return (
    <div className="pointer-events-none fixed top-5 left-1/2 z-20 -translate-x-1/2 flex gap-2">
      {TOUR_STOPS.map((_, i) => (
        <div key={i} className={`h-1 w-8 rounded-full transition ${i <= stop ? "bg-white/80" : "bg-white/15"}`} />
      ))}
    </div>
  );
}

export function LoadingScreen({ done }: { done: boolean }) {
  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="fixed inset-0 z-50 grid place-items-center bg-black text-white"
        >
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 80 }).map((_, i) => (
              <span
                key={i}
                className="absolute h-[2px] w-[2px] rounded-full bg-white"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  opacity: 0.2 + Math.random() * 0.7,
                  animation: `twinkle ${2 + Math.random() * 4}s ease-in-out ${Math.random() * 3}s infinite`,
                }}
              />
            ))}
          </div>
          <div className="relative text-center">
            <h1 className="text-5xl font-extralight tracking-[0.4em] md:text-7xl">100,000 STARS</h1>
            <p className="mt-4 text-xs uppercase tracking-[0.3em] text-white/50">An interactive visualization of the stellar neighborhood</p>
            <div className="mx-auto mt-10 h-px w-64 overflow-hidden bg-white/10">
              <motion.div initial={{ x: "-100%" }} animate={{ x: "100%" }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }} className="h-full w-1/2 bg-white/80" />
            </div>
          </div>
          <style>{`@keyframes twinkle { 0%, 100% { opacity: 0.1 } 50% { opacity: 0.9 } }`}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
