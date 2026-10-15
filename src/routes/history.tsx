import type React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { PublicLayout } from "@/components/site/PublicLayout";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Universe History — From Flat Earth to the Big Bang" },
      {
        name: "description",
        content:
          "An animated timeline of how humans pictured the universe: flat Earth, geocentric spheres, heliocentrism, galaxies, the Big Bang and dark energy.",
      },
      { property: "og:title", content: "Universe History — From Flat Earth to the Big Bang" },
      {
        property: "og:description",
        content:
          "Step through every major model of the cosmos and the discoveries that replaced each one, with dates and animations.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HistoryPage,
});

type Visual =
  | "flat"
  | "spherical"
  | "aristarchus"
  | "ptolemy"
  | "copernicus"
  | "galileo"
  | "kepler"
  | "newton"
  | "milkyway"
  | "relativity"
  | "galaxies"
  | "bigbang"
  | "cmb"
  | "inflation"
  | "darkenergy"
  | "modern";

interface Step {
  date: string;
  era: string;
  title: string;
  who: string;
  idea: string;
  evidence: string;
  replacedBy: string;
  visual: Visual;
  major?: boolean;
}

const STEPS: Step[] = [
  {
    date: "c. 3000–600 BCE",
    era: "Ancient myths",
    title: "Flat Earth under a dome",
    who: "Mesopotamian, Egyptian and early Greek cultures",
    idea: "The Earth was a flat disc surrounded by ocean, covered by a solid sky-dome (the firmament). Sun, Moon and stars moved across this dome each day.",
    evidence: "It matched everyday experience: the ground looks flat and the sky seems to turn overhead.",
    replacedBy: "Greek thinkers noticed ships vanish hull-first over the horizon and Earth's round shadow on the Moon during eclipses.",
    visual: "flat",
  },
  {
    date: "c. 500–350 BCE",
    era: "Classical Greece",
    title: "Spherical Earth at the centre",
    who: "Pythagoras (c. 500 BCE), Aristotle (c. 350 BCE)",
    idea: "Earth is a sphere fixed at the centre. The Moon, Sun, planets and stars ride on nested crystal spheres around it.",
    evidence: "Aristotle used the curved shadow in lunar eclipses and the change of visible stars when travelling north or south.",
    replacedBy: "The spherical Earth stayed — but the Earth-centred spheres could not explain planets that seem to move backwards.",
    visual: "spherical",
  },
  {
    date: "c. 240 BCE",
    era: "Hellenistic science",
    title: "Earth measured; first Sun-centred idea",
    who: "Aristarchus of Samos (c. 270 BCE), Eratosthenes (c. 240 BCE)",
    idea: "Aristarchus proposed the Sun at the centre with Earth orbiting it. Eratosthenes measured Earth's circumference using shadows in Syene and Alexandria.",
    evidence: "Eratosthenes got about 40,000 km — remarkably close to the true 40,075 km.",
    replacedBy: "Aristarchus' idea was ignored for ~1,800 years because no star parallax could be seen.",
    visual: "aristarchus",
    major: true,
  },
  {
    date: "c. 150 CE",
    era: "Roman Egypt",
    title: "Ptolemy's epicycles",
    who: "Claudius Ptolemy — the Almagest",
    idea: "Planets move on small circles (epicycles) whose centres travel on larger circles around Earth. This explained backward (retrograde) motion.",
    evidence: "It predicted planet positions well enough to be used for about 1,400 years.",
    replacedBy: "Predictions slowly drifted and the model needed ever more circles to stay accurate.",
    visual: "ptolemy",
  },
  {
    date: "1543",
    era: "Renaissance",
    title: "Copernicus: the Sun at the centre",
    who: "Nicolaus Copernicus — De revolutionibus",
    idea: "The Sun is at the centre; Earth is a planet that spins daily and orbits the Sun yearly. Retrograde motion is just Earth overtaking outer planets.",
    evidence: "It explained the order and speeds of the planets naturally.",
    replacedBy: "It still used perfect circles, so needed proof and correction — supplied by Galileo and Kepler.",
    visual: "copernicus",
    major: true,
  },
  {
    date: "1609",
    era: "Scientific revolution",
    title: "Kepler's elliptical orbits",
    who: "Johannes Kepler — Astronomia Nova (1609), laws completed 1619",
    idea: "Planets orbit the Sun in ellipses, move faster when closer, and their period relates to distance (T² ∝ a³).",
    evidence: "Based on Tycho Brahe's precise Mars observations.",
    replacedBy: "Kepler described how planets move; Newton later explained why.",
    visual: "kepler",
    major: true,
  },
  {
    date: "1610",
    era: "First telescopes",
    title: "Galileo's telescope proof",
    who: "Galileo Galilei — Sidereus Nuncius",
    idea: "Not everything orbits Earth: Jupiter has four moons, and Venus shows full phases like the Moon — only possible if Venus orbits the Sun.",
    evidence: "Direct telescopic observation; the Milky Way was also revealed as countless stars.",
    replacedBy: "Heliocentrism became the leading view; the Church condemned it in 1633, but evidence kept growing.",
    visual: "galileo",
    major: true,
  },
  {
    date: "1687",
    era: "Classical physics",
    title: "Newton's gravitational universe",
    who: "Isaac Newton — Principia",
    idea: "One law of gravity rules apples and planets. Space is infinite, fixed and filled with stars that obey the same physics.",
    evidence: "Explained Kepler's laws, tides and comets; predicted Halley's comet return (1758) and led to Neptune's discovery (1846).",
    replacedBy: "Mercury's orbit drifted slightly in a way Newton could not explain.",
    visual: "newton",
  },
  {
    date: "1785–1838",
    era: "Stellar astronomy",
    title: "Milky Way mapped; first star distance",
    who: "William Herschel (1785), Friedrich Bessel (1838)",
    idea: "The Sun is one star in a flat disc of stars — the Milky Way. Bessel measured star 61 Cygni's parallax: about 10 light-years away.",
    evidence: "Parallax finally proved Earth moves around the Sun, answering Aristarchus' old problem.",
    replacedBy: "Herschel put the Sun near the centre; Shapley (1918) showed we are far out in the disc.",
    visual: "milkyway",
    major: true,
  },
  {
    date: "1915",
    era: "Modern physics",
    title: "Einstein's curved spacetime",
    who: "Albert Einstein — General Relativity",
    idea: "Gravity is the curving of space and time by mass. Einstein first assumed the universe was static and unchanging.",
    evidence: "Explained Mercury's orbit; starlight bending confirmed in the 1919 eclipse by Eddington.",
    replacedBy: "Its equations actually wanted a universe that expands or contracts.",
    visual: "relativity",
  },
  {
    date: "1924–1929",
    era: "Galaxies & expansion",
    title: "Hubble: galaxies and expansion",
    who: "Edwin Hubble (with Henrietta Leavitt's Cepheid law, Vesto Slipher's redshifts)",
    idea: "Andromeda is a separate galaxy far beyond the Milky Way (1924). Galaxies are moving apart — the farther, the faster (1929).",
    evidence: "Cepheid variable stars gave distances; redshifted light showed recession.",
    replacedBy: "If everything is spreading out, it must once have been together.",
    visual: "galaxies",
    major: true,
  },
  {
    date: "1927–1931",
    era: "Origin of the cosmos",
    title: "Lemaître's 'primeval atom' — the Big Bang",
    who: "Georges Lemaître (also Alexander Friedmann, 1922)",
    idea: "The universe began hot and dense and has been expanding ever since. Fred Hoyle later nicknamed it the 'Big Bang' (1949).",
    evidence: "Predicted Hubble's law and, later, the abundance of hydrogen and helium (Alpher & Gamow, 1948).",
    replacedBy: "Competed with Hoyle's Steady State model (1948) until 1965.",
    visual: "bigbang",
    major: true,
  },
  {
    date: "1965",
    era: "Big Bang confirmed",
    title: "Cosmic Microwave Background",
    who: "Arno Penzias & Robert Wilson",
    idea: "A faint microwave glow fills the whole sky — the cooled afterglow of the Big Bang, about 2.7 K.",
    evidence: "Found by accident with a radio antenna; mapped in detail by COBE (1992), WMAP (2003) and Planck (2013).",
    replacedBy: "Steady State was abandoned. New puzzles: why is the universe so smooth and flat?",
    visual: "cmb",
    major: true,
  },
  {
    date: "1980",
    era: "Very early universe",
    title: "Cosmic inflation",
    who: "Alan Guth, Andrei Linde",
    idea: "In the first tiny fraction of a second, space expanded enormously fast, smoothing and flattening the universe.",
    evidence: "Its predicted pattern of tiny ripples matches CMB measurements.",
    replacedBy: "Still the leading idea, though details are being tested.",
    visual: "inflation",
  },
  {
    date: "1998",
    era: "Accelerating universe",
    title: "Dark energy discovered",
    who: "Saul Perlmutter, Brian Schmidt, Adam Riess (Nobel Prize 2011)",
    idea: "Distant Type Ia supernovae are fainter than expected: the expansion is speeding up, driven by unknown 'dark energy'.",
    evidence: "Confirmed by CMB and galaxy surveys. Dark matter (Zwicky 1933, Vera Rubin 1970s) also needed.",
    replacedBy: "Led to today's standard model.",
    visual: "darkenergy",
    major: true,
  },
  {
    date: "Today",
    era: "Standard cosmology",
    title: "ΛCDM: our current model",
    who: "Planck, Hubble, JWST, LIGO (gravitational waves 2015), Event Horizon Telescope (black hole image 2019)",
    idea: "The universe is 13.8 billion years old: ~5% normal matter, ~27% dark matter, ~68% dark energy, with ~2 trillion galaxies in the observable universe.",
    evidence: "Matches CMB, galaxy distribution and element abundances with high precision.",
    replacedBy: "Open questions: what are dark matter and dark energy? Why do expansion measurements disagree (the 'Hubble tension')?",
    visual: "modern",
  },
];

function HistoryPage() {
  const [i, setI] = useState(0);
  const step = STEPS[i];
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") setI((v) => Math.min(STEPS.length - 1, v + 1));
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") setI((v) => Math.max(0, v - 1));
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);

  return (
    <PublicLayout>
      <main className="mx-auto max-w-7xl px-4 pb-20 pt-24 lg:px-8">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">Universe history</p>
        <h1 className="mt-2 text-3xl font-semibold md:text-5xl">How humans pictured the cosmos</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          From a flat Earth under a dome to a 13.8-billion-year-old expanding universe. Click a step on the
          timeline or use the arrow keys.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[300px_1fr]">
          {/* Timeline */}
          <nav className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
            <ol className="relative flex gap-2 overflow-x-auto pb-2 lg:block lg:space-y-1 lg:border-l lg:border-border lg:pl-4">
              {STEPS.map((s, idx) => (
                <li key={s.title} className="relative shrink-0">
                  <span
                    className={`absolute -left-[21px] top-3 hidden h-2.5 w-2.5 rounded-full lg:block ${
                      idx === i ? "bg-primary ring-4 ring-primary/30" : idx < i ? "bg-primary/60" : "bg-muted-foreground/40"
                    }`}
                  />
                  <button
                    onClick={() => setI(idx)}
                    className={`w-44 rounded-lg px-3 py-2 text-left transition lg:w-full ${
                      idx === i ? "bg-primary/15 text-foreground" : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                    }`}
                  >
                    <div className="text-[11px] font-mono text-primary">{s.date}</div>
                    <div className="text-sm leading-snug">
                      {s.major && "★ "}
                      {s.title}
                    </div>
                  </button>
                </li>
              ))}
            </ol>
          </nav>

          {/* Detail */}
          <section className="min-w-0">
            <AnimatePresence mode="wait">
              <motion.article
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35 }}
                className="overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur"
              >
                <div className="aspect-[16/9] w-full bg-background">
                  <ModelVisual v={step.visual} />
                </div>
                <div className="p-6 md:p-8">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full bg-primary/15 px-3 py-1 font-mono text-primary">{step.date}</span>
                    <span className="rounded-full border border-border px-3 py-1 text-muted-foreground">{step.era}</span>
                    {step.major && (
                      <span className="rounded-full bg-accent/20 px-3 py-1 text-accent-foreground">Major discovery</span>
                    )}
                  </div>
                  <h2 className="mt-3 text-2xl font-semibold md:text-3xl">{step.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{step.who}</p>
                  <div className="mt-6 grid gap-4 md:grid-cols-3">
                    <Card label="The idea" text={step.idea} />
                    <Card label="Evidence" text={step.evidence} />
                    <Card label={i === STEPS.length - 1 ? "Still open" : "What came next"} text={step.replacedBy} />
                  </div>
                  <div className="mt-6 flex items-center justify-between gap-3">
                    <button
                      disabled={i === 0}
                      onClick={() => setI(i - 1)}
                      className="rounded-full border border-border px-4 py-2 text-sm disabled:opacity-30"
                    >
                      ← {i > 0 ? STEPS[i - 1].date : "Start"}
                    </button>
                    <span className="text-xs text-muted-foreground">
                      {i + 1} / {STEPS.length}
                    </span>
                    {i < STEPS.length - 1 ? (
                      <button
                        onClick={() => setI(i + 1)}
                        className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground"
                      >
                        {STEPS[i + 1].date} →
                      </button>
                    ) : (
                      <Link to="/universe" className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground">
                        Explore the universe →
                      </Link>
                    )}
                  </div>
                </div>
              </motion.article>
            </AnimatePresence>
          </section>
        </div>
      </main>
    </PublicLayout>
  );
}

function Card({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-xl border border-border bg-background/50 p-4">
      <div className="text-[11px] uppercase tracking-[0.2em] text-primary">{label}</div>
      <p className="mt-2 text-sm leading-relaxed text-foreground/85">{text}</p>
    </div>
  );
}

/* ---------- Animated SVG diagrams ---------- */

const SUN = "#ffcc55";
const EARTH = "#4aa3ff";

function Orbit({ r, dur, color, size = 6, rx, start = 0, reverse }: { r: number; dur: number; color: string; size?: number; rx?: number; start?: number; reverse?: boolean }) {
  const ry = r;
  const x = rx ?? r;
  return (
    <g>
      <ellipse cx={0} cy={0} rx={x} ry={ry} fill="none" stroke="currentColor" strokeOpacity={0.18} />
      <g style={{ transformOrigin: "0 0", animation: `spin ${dur}s linear infinite ${reverse ? "reverse" : ""}`, transform: `rotate(${start}deg)` }}>
        <circle cx={x} cy={0} r={size} fill={color} />
      </g>
    </g>
  );
}

function Stars() {
  const pts = Array.from({ length: 70 }, (_, k) => [((k * 137) % 800) - 400, ((k * 89) % 450) - 225, (k % 3) * 0.4 + 0.5]);
  return (
    <g>
      {pts.map(([x, y, r], k) => (
        <circle key={k} cx={x} cy={y} r={r} fill="#fff" opacity={0.5} style={{ animation: `twinkle ${2 + (k % 4)}s ease-in-out ${k % 3}s infinite` }} />
      ))}
    </g>
  );
}

function Label({ x, y, t }: { x: number; y: number; t: string }) {
  return (
    <text x={x} y={y} fill="#cbd5e1" fontSize={12} textAnchor="middle">
      {t}
    </text>
  );
}

function ModelVisual({ v }: { v: Visual }) {
  return (
    <svg viewBox="-400 -225 800 450" className="h-full w-full text-slate-300">
      <defs>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes twinkle { 50% { opacity: .1 } }
          @keyframes pulse { 50% { transform: scale(1.15); opacity:.7 } }
          @keyframes grow { from { transform: scale(.05) } to { transform: scale(1) } }
          @keyframes drift { from { transform: translateX(0) } to { transform: translateX(var(--dx)) } }
        `}</style>
        <radialGradient id="sunG"><stop offset="0" stopColor="#fff7d6" /><stop offset="1" stopColor={SUN} /></radialGradient>
        <radialGradient id="bbG"><stop offset="0" stopColor="#fff" /><stop offset=".3" stopColor="#ffd27a" /><stop offset=".7" stopColor="#ff5a3c" stopOpacity=".5" /><stop offset="1" stopColor="#3b0a5a" stopOpacity="0" /></radialGradient>
        <radialGradient id="galG"><stop offset="0" stopColor="#fff2cc" /><stop offset="1" stopColor="#7aa2ff" stopOpacity="0" /></radialGradient>
      </defs>
      <rect x={-400} y={-225} width={800} height={450} fill="#050816" />
      <Stars />
      <Scene v={v} />
    </svg>
  );
}

function Scene({ v }: { v: Visual }) {
  switch (v) {
    case "flat":
      return (
        <g>
          <path d="M-260 80 A260 230 0 0 1 260 80" fill="#1e3a8a" fillOpacity={0.25} stroke="#93c5fd" strokeOpacity={0.5} />
          <ellipse cx={0} cy={80} rx={280} ry={34} fill="#0e4c7a" />
          <ellipse cx={0} cy={80} rx={210} ry={24} fill="#3f6b2a" />
          <g style={{ transformOrigin: "0 80px", animation: "spin 12s linear infinite" }}>
            <circle cx={-230} cy={80} r={14} fill="url(#sunG)" />
          </g>
          <Label x={0} y={140} t="Flat disc, ocean, solid sky-dome" />
        </g>
      );
    case "spherical":
      return (
        <g>
          {[60, 95, 130, 165, 200].map((r, k) => (
            <circle key={r} r={r} fill="none" stroke="#a5b4fc" strokeOpacity={0.15 + k * 0.05} />
          ))}
          <Orbit r={60} dur={4} color="#ddd" size={5} />
          <Orbit r={95} dur={7} color="#f0b0ff" size={5} />
          <Orbit r={130} dur={10} color={SUN} size={10} />
          <Orbit r={165} dur={16} color="#ff7a5a" size={5} />
          <circle r={18} fill={EARTH} />
          <Label x={0} y={215} t="Earth at the centre of crystal spheres" />
        </g>
      );
    case "aristarchus":
      return (
        <g>
          <g transform="translate(-160 0)">
            <circle r={40} fill="url(#sunG)" />
            <Orbit r={120} dur={8} color={EARTH} size={9} />
            <Label x={0} y={150} t="Aristarchus: Sun at centre" />
          </g>
          <g transform="translate(190 -20)">
            <circle r={90} fill={EARTH} fillOpacity={0.5} stroke="#93c5fd" />
            <line x1={-120} y1={-110} x2={0} y2={-90} stroke={SUN} />
            <line x1={-120} y1={-90} x2={30} y2={-85} stroke={SUN} />
            <circle cx={0} cy={-90} r={3} fill="#fff" />
            <circle cx={30} cy={-85} r={3} fill="#fff" />
            <Label x={0} y={130} t="Eratosthenes: shadows → 40,000 km" />
          </g>
        </g>
      );
    case "ptolemy":
      return (
        <g>
          <circle r={18} fill={EARTH} />
          <Orbit r={110} dur={14} color={SUN} size={11} />
          <g style={{ transformOrigin: "0 0", animation: "spin 20s linear infinite" }}>
            <circle r={180} fill="none" stroke="currentColor" strokeOpacity={0.2} />
            <g transform="translate(180 0)">
              <circle r={40} fill="none" stroke="#ff7a5a" strokeOpacity={0.5} strokeDasharray="4 4" />
              <g style={{ transformOrigin: "0 0", animation: "spin 3s linear infinite" }}>
                <circle cx={40} r={7} fill="#ff7a5a" />
              </g>
            </g>
          </g>
          <Label x={0} y={215} t="Mars on an epicycle loops backwards as seen from Earth" />
        </g>
      );
    case "copernicus":
    case "kepler":
      return (
        <g>
          <circle cx={v === "kepler" ? -40 : 0} r={24} fill="url(#sunG)" />
          {[
            [55, 2, "#bbb", 4],
            [85, 4, "#f0d090", 6],
            [115, 6, EARTH, 7],
            [150, 10, "#ff7a5a", 6],
            [200, 22, "#e0b080", 12],
          ].map(([r, d, c, s]) => (
            <Orbit key={r as number} r={(r as number) * (v === "kepler" ? 0.8 : 1)} rx={r as number} dur={d as number} color={c as string} size={s as number} />
          ))}
          <Label x={0} y={215} t={v === "kepler" ? "Ellipses with the Sun at one focus; closer = faster" : "Sun at centre — Earth is just the third planet"} />
        </g>
      );
    case "galileo":
      return (
        <g>
          <g transform="translate(-170 0)">
            <circle r={26} fill="#e0b080" />
            {[45, 65, 90, 120].map((r, k) => (
              <Orbit key={r} r={r} rx={r} dur={1.5 + k * 1.5} color="#fff" size={3} />
            ))}
            <Label x={0} y={160} t="Jupiter's 4 moons (1610)" />
          </g>
          <g transform="translate(170 0)">
            <circle r={16} fill="url(#sunG)" />
            <Orbit r={110} dur={8} color="#f0d090" size={9} />
            <Label x={0} y={160} t="Venus shows full phases → orbits the Sun" />
          </g>
        </g>
      );
    case "newton":
      return (
        <g>
          <circle r={28} fill="url(#sunG)" />
          <Orbit r={140} rx={180} dur={9} color={EARTH} size={8} />
          {Array.from({ length: 8 }, (_, k) => {
            const a = (k / 8) * Math.PI * 2;
            return <line key={k} x1={Math.cos(a) * 160} y1={Math.sin(a) * 125} x2={Math.cos(a) * 45} y2={Math.sin(a) * 35} stroke="#7dd3fc" strokeOpacity={0.4} markerEnd="" />;
          })}
          <Label x={0} y={210} t="F = G·m₁·m₂ / r² — one law for apples and planets" />
        </g>
      );
    case "milkyway":
      return (
        <g>
          <g style={{ transformOrigin: "0 0", animation: "spin 40s linear infinite" }}>
            {Array.from({ length: 300 }, (_, k) => {
              const arm = k % 2;
              const t = (k / 300) * 4;
              const a = t * 1.5 + arm * Math.PI;
              const r = 15 + t * 45;
              return <circle key={k} cx={Math.cos(a) * r + ((k * 7) % 11) - 5} cy={(Math.sin(a) * r) * 0.45} r={1.2} fill="#cfe0ff" opacity={0.8} />;
            })}
          </g>
          <circle r={30} fill="url(#galG)" />
          <circle cx={120} cy={10} r={4} fill={SUN} />
          <Label x={120} y={30} t="Sun" />
          <Label x={0} y={210} t="We live in a disc of ~100–400 billion stars" />
        </g>
      );
    case "relativity":
      return (
        <g>
          {Array.from({ length: 11 }, (_, k) => {
            const y = -150 + k * 30;
            const d = `M-300 ${y} ` + Array.from({ length: 31 }, (_, j) => {
              const x = -300 + j * 20;
              const dip = 60 * Math.exp(-(x * x + y * y) / 12000);
              return `L${x} ${y + dip}`;
            }).join(" ");
            return <path key={k} d={d} fill="none" stroke="#7dd3fc" strokeOpacity={0.35} />;
          })}
          <circle cy={50} r={24} fill="url(#sunG)" />
          <g style={{ transformOrigin: "0 50px", animation: "spin 6s linear infinite" }}>
            <circle cx={110} cy={50} r={7} fill={EARTH} />
          </g>
          <Label x={0} y={210} t="Mass curves spacetime; planets follow the curve" />
        </g>
      );
    case "galaxies":
    case "darkenergy":
      return (
        <g>
          {Array.from({ length: 22 }, (_, k) => {
            const a = (k * 2.4) % (Math.PI * 2);
            const r = 40 + ((k * 37) % 150);
            const dx = Math.cos(a) * r * (v === "darkenergy" ? 0.9 : 0.5);
            const dy = Math.sin(a) * r * (v === "darkenergy" ? 0.5 : 0.3);
            return (
              <g key={k} transform={`translate(${Math.cos(a) * r * 0.6} ${Math.sin(a) * r * 0.4})`}>
                <g>
                  <animateTransform attributeName="transform" type="translate" from="0 0" to={`${dx} ${dy}`} dur={v === "darkenergy" ? "4s" : "7s"} repeatCount="indefinite" calcMode={v === "darkenergy" ? "spline" : "linear"} keySplines="0.8 0 1 1" keyTimes="0;1" />
                  <ellipse rx={8} ry={4} fill="url(#galG)" transform={`rotate(${k * 30})`} />
                  <circle r={1.5} fill={r > 120 ? "#ff8a7a" : "#fff"} />
                </g>
              </g>
            );
          })}
          <Label x={0} y={210} t={v === "darkenergy" ? "Expansion is accelerating — dark energy" : "Farther galaxies recede faster (redder light)"} />
        </g>
      );
    case "bigbang":
    case "inflation":
      return (
        <g>
          <g style={{ transformOrigin: "0 0", animation: `grow ${v === "inflation" ? 1.2 : 5}s ease-out infinite` }}>
            <circle r={200} fill="url(#bbG)" />
            {Array.from({ length: 60 }, (_, k) => (
              <circle key={k} cx={Math.cos(k * 2.4) * (k * 3)} cy={Math.sin(k * 2.4) * (k * 2)} r={1.5} fill="#fff" />
            ))}
          </g>
          <Label x={0} y={215} t={v === "inflation" ? "Space inflates enormously in ~10⁻³² s" : "Hot dense beginning, expanding ever since"} />
        </g>
      );
    case "cmb":
      return (
        <g>
          <ellipse rx={300} ry={150} fill="#1e1b4b" stroke="#a5b4fc" strokeOpacity={0.4} />
          <clipPath id="cmbClip"><ellipse rx={300} ry={150} /></clipPath>
          <g clipPath="url(#cmbClip)">
            {Array.from({ length: 400 }, (_, k) => {
              const x = ((k * 53) % 600) - 300;
              const y = ((k * 29) % 300) - 150;
              const hot = (k * 7919) % 3;
              return <circle key={k} cx={x} cy={y} r={14} fill={hot === 0 ? "#ef4444" : hot === 1 ? "#f59e0b" : "#3b82f6"} opacity={0.35} style={{ animation: `twinkle ${3 + (k % 3)}s ${k % 5}s infinite` }} />;
            })}
          </g>
          <Label x={0} y={200} t="Baby picture of the universe: 380,000 years old, 2.725 K" />
        </g>
      );
    case "modern":
      return (
        <g>
          {[
            [68, "#a855f7", "Dark energy 68%"],
            [27, "#3b82f6", "Dark matter 27%"],
            [5, "#facc15", "Normal matter 5%"],
          ].reduce<{ el: React.ReactElement[]; acc: number }>(
            (o, [p, c, l], k) => {
              const a0 = (o.acc / 100) * Math.PI * 2;
              const a1 = ((o.acc + (p as number)) / 100) * Math.PI * 2;
              const R = 130;
              const large = (p as number) > 50 ? 1 : 0;
              o.el.push(
                <g key={k} transform="translate(-130 0)">
                  <path d={`M0 0 L${Math.cos(a0) * R} ${Math.sin(a0) * R} A${R} ${R} 0 ${large} 1 ${Math.cos(a1) * R} ${Math.sin(a1) * R} Z`} fill={c as string} opacity={0.8} />
                  <rect x={190} y={-50 + k * 40} width={14} height={14} fill={c as string} />
                  <text x={212} y={-38 + k * 40} fill="#e2e8f0" fontSize={14}>{l}</text>
                </g>,
              );
              o.acc += p as number;
              return o;
            },
            { el: [], acc: 0 },
          ).el}
          <g style={{ transformOrigin: "-130px 0", animation: "spin 30s linear infinite" }}>
            <circle cx={-130} cy={-140} r={3} fill="#fff" />
          </g>
          <Label x={0} y={200} t="13.8 billion years old · ~2 trillion galaxies" />
        </g>
      );
  }
}
