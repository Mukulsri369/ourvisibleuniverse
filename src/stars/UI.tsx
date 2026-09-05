import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { NAMED_STARS, type NamedStar } from "./data";
import { useStore, TOUR_STOPS } from "./store";
import { AU, PLANETS } from "./Planets";
import { NAMED_GALAXIES } from "./Universe";
import { galaxyOrder, isDetailedGalaxy } from "./GalaxyInfoPanel";
import { OBSERVED_OBJECTS, OBJECT_CATEGORIES, type ObservedObject } from "./observed-objects";


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
            <Stat label="Spectral type" value={star.spectral} />
            <Stat label="App. magnitude" value={star.magnitude.toFixed(2)} />
            <Stat label="Abs. magnitude" value={star.absMagnitude.toFixed(2)} />
            <Stat label="Mass" value={`${star.mass} M☉`} />
            <Stat label="Radius" value={`${star.radius} R☉`} />
            <Stat label="Temperature" value={`${star.temperature.toLocaleString()} K`} />
            <Stat label="Luminosity" value={`${star.luminosity} L☉`} />
            <Stat label="Right ascension" value={star.ra} />
            <Stat label="Declination" value={star.dec} />
            <Stat label="Galactic l, b" value={`${star.galacticL.toFixed(1)}°, ${star.galacticB.toFixed(1)}°`} />
            <Stat label="Known planets" value={String(star.planets)} />
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
  const spectralMode = useStore((s) => s.spectralMode);
  const toggleSpectral = useStore((s) => s.toggleSpectral);
  const cameraFree = useStore((s) => s.cameraFree);
  const toggleCameraFree = useStore((s) => s.toggleCameraFree);
  const [searchOpen, setSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  return (
    <div onClick={(e) => e.stopPropagation()} className="fixed left-6 top-5 z-30 flex items-center gap-3 text-white/80">
      <IconButton title="Toggle Spectral Colors" onClick={toggleSpectral} active={spectralMode}>
        <SpectrumIcon />
      </IconButton>
      <IconButton title="Search all celestial objects" onClick={() => setSearchOpen((v) => !v)} active={searchOpen}>
        <SearchIcon />
      </IconButton>
      <IconButton
        title={cameraFree ? "Camera stopped — click to follow the Solar System again" : "Stop the camera in space (free look)"}
        onClick={toggleCameraFree}
        active={cameraFree}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="6" y="6" width="12" height="12" rx="2" />
        </svg>
      </IconButton>
      <MaximizeButton />
      <IconButton title="Settings" onClick={() => setSettingsOpen((v) => !v)} active={settingsOpen}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1" />
        </svg>
      </IconButton>
      <IconButton title="Guide — what every button does" onClick={() => setGuideOpen((v) => !v)} active={guideOpen}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path d="M9.5 9a2.5 2.5 0 1 1 3.4 2.3c-.6.3-.9.8-.9 1.5v.4" />
          <path d="M12 17h.01" />
        </svg>
      </IconButton>
      <SearchBar open={searchOpen} onClose={() => setSearchOpen(false)} />
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <GuidePanel open={guideOpen} onClose={() => setGuideOpen(false)} />
    </div>
  );
}

// Quick reference for every control in the app.
const GUIDE_SECTIONS: { title: string; items: [string, string][] }[] = [
  {
    title: "Toolbar",
    items: [
      ["Spectrum", "Toggle true spectral star colours"],
      ["Search", "Find any star, planet, galaxy or observed object"],
      ["Square", "Stop the camera in space (free look)"],
      ["Maximize", "Full screen — press Esc to exit"],
      ["Gear", "Settings: zoom speed, system speed, trail size"],
      ["?", "This guide"],
      ["Eye (top right)", "Hide or show the whole interface"],
      ["Music", "Ambient soundtrack on / off"],
    ],
  },
  {
    title: "Keyboard",
    items: [
      ["Space", "Zoom out"],
      ["Ctrl", "Zoom in"],
      ["S", "Stop / resume the camera"],
      ["Esc", "Leave full screen"],
    ],
  },
  {
    title: "Mouse & touch",
    items: [
      ["Drag", "Orbit the view"],
      ["Wheel / pinch", "Zoom in and out"],
      ["Hover", "Reveal star and galaxy names"],
      ["Click a name", "Fly the camera to it"],
    ],
  },
  {
    title: "Site map (left)",
    items: [
      ["Stars", "Visit any catalogued star system"],
      ["Planets", "Follow a planet of the Solar System"],
      ["Galaxies", "Fly to a galaxy and its star system"],
      ["Objects", "Visit nebulae, quasars, remnants and exotic stars"],
    ],
  },
];

function GuidePanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="absolute left-0 top-12 max-h-[70vh] w-80 overflow-y-auto rounded-xl border border-white/10 bg-black/75 p-4 backdrop-blur-md"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.25em] text-white/50">Guide</span>
            <button onClick={onClose} className="text-white/50 transition hover:text-white" aria-label="Close guide">✕</button>
          </div>
          {GUIDE_SECTIONS.map((s) => (
            <div key={s.title} className="mb-4 last:mb-0">
              <div className="mb-2 text-[9px] uppercase tracking-[0.2em] text-white/35">{s.title}</div>
              <ul className="space-y-1.5">
                {s.items.map(([k, v]) => (
                  <li key={k} className="flex gap-3 text-[11px] leading-snug">
                    <span className="w-24 shrink-0 text-white/80">{k}</span>
                    <span className="text-white/50">{v}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Fullscreen toggle — the browser exits fullscreen on Esc automatically,
// so we only mirror the state here.
function MaximizeButton() {
  const [full, setFull] = useState(false);
  useEffect(() => {
    const onChange = () => setFull(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);
  const toggle = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen({ navigationUI: "hide" });
    } catch { /* fullscreen may be blocked */ }
  };
  return (
    <IconButton title={full ? "Exit full screen (Esc)" : "Maximize — full screen"} onClick={toggle} active={full}>
      {full ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 3v6H3M15 21v-6h6M21 9h-6V3M3 15h6v6" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
        </svg>
      )}
    </IconButton>
  );
}

function SettingsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const zoomSpeed = useStore((s) => s.zoomSpeed);
  const setZoomSpeed = useStore((s) => s.setZoomSpeed);
  const systemSpeed = useStore((s) => s.systemSpeed);
  const setSystemSpeed = useStore((s) => s.setSystemSpeed);
  const trailSize = useStore((s) => s.trailSize);
  const setTrailSize = useStore((s) => s.setTrailSize);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="absolute left-0 top-12 w-72 rounded-xl border border-white/10 bg-black/70 p-4 backdrop-blur-md"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.25em] text-white/50">Settings</span>
            <button onClick={onClose} className="text-white/50 transition hover:text-white" aria-label="Close settings">✕</button>
          </div>
          <Slider label="Zoom speed" hint="Space = zoom out · Ctrl = zoom in" value={zoomSpeed} onChange={setZoomSpeed} />
          <Slider label="Solar System speed" hint="Drift through space" value={systemSpeed} onChange={setSystemSpeed} />
          <Slider label="Trail size" hint="Length of planet & moon trails" value={trailSize} onChange={setTrailSize} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Slider({ label, hint, value, onChange }: { label: string; hint: string; value: number; onChange: (n: number) => void }) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-baseline justify-between text-[11px] text-white/70">
        <span>{label}</span>
        <span className="text-white/45">{Math.round(value)}</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-white"
      />
      <div className="mt-1 text-[9px] uppercase tracking-[0.15em] text-white/30">{hint}</div>
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
  | { kind: "galaxy"; name: string; sub: string; galaxy: typeof NAMED_GALAXIES[number] }
  | { kind: "object"; name: string; sub: string; object: ObservedObject };

function SearchBar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const flyTo = useStore((s) => s.flyToStar);
  const setVisitPlanet = useStore((s) => s.setVisitPlanet);
  const setVisitGalaxy = useStore((s) => s.setVisitGalaxy);
  const setSelectedObject = useStore((s) => s.setSelectedObject);
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
    const objects: SearchHit[] = OBSERVED_OBJECTS
      .filter((o) => [o.name, o.category, o.subtype, ...o.aliases].some((v) => v.toLowerCase().includes(lower)))
      .map((o) => ({ kind: "object", name: o.name, sub: `${o.category} · ${o.subtype}`, object: o }));
    return [...planets, ...stars, ...objects, ...galaxies].slice(0, 10);
  }, [q]);
  const activate = (m: SearchHit) => {
    if (m.kind === "star") flyTo(m.star);
    else if (m.kind === "planet") setVisitPlanet(m.name);
    else if (m.kind === "object") setSelectedObject(m.object.id);
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
            placeholder="Search the visible universe..."
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
      Our Visible Universe — A Cosmic Experiment
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
            className="pointer-events-auto fixed left-[17.5rem] top-1/2 z-20 hidden w-72 -translate-y-1/2 rounded-xl border border-white/10 bg-black/55 p-5 backdrop-blur-md md:block"
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
    () => NAMED_STARS.filter((s) => s.name !== "Sun").slice().sort((a, b) => a.distance - b.distance),
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
  const galaxies = useMemo(() => NAMED_GALAXIES.slice().sort(galaxyOrder), []);
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

// ---------------------------------------------------------------
// SiteMap — a collapsible left-hand index of every destination in
// the experience. Mirrors the Visit panels (planets, moons, stars,
// galaxies) plus the guided tour, so everything is reachable from
// one place.
// ---------------------------------------------------------------
export function SiteMap() {
  const [open, setOpen] = useState(true);
  const [section, setSection] = useState<"planets" | "stars" | "galaxies" | "objects">("planets");
  const [q, setQ] = useState("");

  const visitPlanet = useStore((s) => s.visitPlanet);
  const setVisitPlanet = useStore((s) => s.setVisitPlanet);
  const selected = useStore((s) => s.selectedStar);
  const flyTo = useStore((s) => s.flyToStar);
  const setSelected = useStore((s) => s.setSelected);
  const visitGalaxy = useStore((s) => s.visitGalaxy);
  const setVisitGalaxy = useStore((s) => s.setVisitGalaxy);
  const selectedObjectId = useStore((s) => s.selectedObjectId);
  const setSelectedObject = useStore((s) => s.setSelectedObject);

  const lower = q.trim().toLowerCase();
  const match = (n: string) => !lower || n.toLowerCase().includes(lower);

  const stars = useMemo(
    () => NAMED_STARS.filter((s) => s.name !== "Sun").slice().sort((a, b) => a.distance - b.distance),
    [],
  );
  const galaxies = useMemo(() => NAMED_GALAXIES.slice().sort(galaxyOrder), []);

  const goGalaxy = (g: typeof NAMED_GALAXIES[number]) =>
    setVisitGalaxy({ name: g.name, x: g.position.x, y: g.position.y, z: g.position.z, size: g.size, distance: g.distance, type: g.type });

  return (
    <div onClick={(e) => e.stopPropagation()} className="pointer-events-auto fixed left-0 top-16 z-30 hidden md:block">
      <motion.div
        animate={{ width: open ? 264 : 44 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="ml-4 overflow-hidden rounded-xl border border-white/10 bg-black/55 backdrop-blur-md"
      >
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[10px] uppercase tracking-[0.25em] text-white/60 transition hover:text-white"
          title={open ? "Collapse site map" : "Expand site map"}
        >
          <span className="text-base leading-none">{open ? "‹" : "☰"}</span>
          {open && <span>Site Map</span>}
        </button>

        {open && (
          <div className="border-t border-white/10 px-3 pb-3 pt-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filter destinations..."
              className="mb-2 h-8 w-full rounded-full border border-white/15 bg-white/5 px-3 text-[11px] text-white outline-none placeholder:text-white/35 focus:border-white/40"
            />
            <div className="mb-2 flex gap-1">
              {(["planets", "stars", "galaxies", "objects"] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => setSection(k)}
                  className={`flex-1 rounded-full px-1.5 py-1 text-[9px] uppercase tracking-[0.12em] transition ${
                    section === k ? "bg-white/15 text-white" : "text-white/45 hover:bg-white/5 hover:text-white/80"
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>

            <div className="max-h-[52vh] space-y-0.5 overflow-y-auto pr-1">
              {section === "planets" && (
                <>
                  <Row label="☉ Sun" active={!visitPlanet} onClick={() => setVisitPlanet(null)} />
                  {PLANETS.filter((p) => match(p.name)).map((p) => (
                    <div key={p.name}>
                      <Row
                        label={p.name}
                        sub={`${(p.a / AU).toFixed(2)} AU`}
                        color={p.color}
                        active={visitPlanet === p.name}
                        onClick={() => setVisitPlanet(p.name)}
                      />
                      {p.moons?.map((m) => (
                        <Row
                          key={m.name}
                          label={`↳ ${m.name}`}
                          color={m.color}
                          indent
                          onClick={() => setVisitPlanet(p.name)}
                        />
                      ))}
                    </div>
                  ))}
                </>
              )}

              {section === "stars" && (
                <>
                  <Row label="☉ Back to the Sun" active={!selected} onClick={() => setSelected(null)} />
                  {stars.filter((s) => match(s.name)).map((s) => (
                    <Row
                      key={s.name}
                      label={s.name}
                      sub={`${s.distance.toFixed(1)} ly`}
                      color="#cfe0ff"
                      active={selected?.name === s.name}
                      onClick={() => flyTo(s)}
                    />
                  ))}
                </>
              )}

              {section === "galaxies" && (
                <>
                  <Row label="✦ Milky Way" active={!visitGalaxy} onClick={() => setVisitGalaxy(null)} />
                  {galaxies.filter((g) => match(g.name)).map((g) => (
                    <Row
                      key={g.name}
                      label={isDetailedGalaxy(g.name) ? `✦ ${g.name}` : g.name}
                      sub={formatLy(g.distance)}
                      color={g.color}
                      active={visitGalaxy?.name === g.name}
                      onClick={() => goGalaxy(g)}
                    />
                  ))}
                </>
              )}

              {section === "objects" && OBJECT_CATEGORIES.map((category) => {
                const items = OBSERVED_OBJECTS.filter((o) => o.category === category && match(`${o.name} ${o.subtype} ${o.aliases.join(" ")}`));
                if (!items.length) return null;
                return <div key={category} className="pb-2">
                  <div className="px-2 pb-1 pt-2 text-[9px] uppercase tracking-[0.18em] text-white/35">{category}</div>
                  {items.map((o) => <Row key={o.id} label={o.name} sub={o.subtype.split(" /")[0]} color={o.color} active={selectedObjectId === o.id} onClick={() => setSelectedObject(o.id)} />)}
                </div>;
              })}

              </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function Row({
  label, sub, color, active, indent, onClick,
}: { label: string; sub?: string; color?: string; active?: boolean; indent?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-[11px] transition ${
        indent ? "pl-5" : ""
      } ${active ? "bg-white/15 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"}`}
    >
      {color && (
        <span className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
      )}
      <span className="truncate">{label}</span>
      {sub && <span className="ml-auto shrink-0 text-[9px] text-white/35">{sub}</span>}
    </button>
  );
}
