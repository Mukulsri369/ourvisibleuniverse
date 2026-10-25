import { formatTimeRate, SIM_SECONDS_PER_REAL_SECOND } from "./scene-controls";
// @ts-nocheck
import { HideablePanel, NasaResources } from "./NasaResources";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Compass,
  Telescope,
  Orbit,
  Sparkles,
  Layers,
  Sliders,
  Eye,
  Activity,
  Radio,
  Bookmark,
  Award,
  RotateCcw,
  Keyboard,
  FileText,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { NAMED_STARS, type NamedStar } from "./data";
import { useStore, TOUR_STOPS } from "./store";
import { AU, PLANETS, moonKey } from "./Planets";
import { NAMED_GALAXIES } from "./Universe";
import { galaxyOrder, isDetailedGalaxy } from "./GalaxyInfoPanel";
import { OBSERVED_OBJECTS, OBJECT_CATEGORIES, type ObservedObject } from "./observed-objects";
import { OBSERVATIONAL_GALAXY_CATALOG } from "./galaxy-catalog";
import { exoSystemFor } from "./exosystems";
import { REAL_SYSTEMS } from "./real-exoplanets";
import { scaleManager } from "@/lib/astronomy/scale-manager";
import { GaiaAtlasPanel } from "./GaiaAtlasPanel";
import { gaiaTileManager } from "@/lib/astronomy/gaia/gaia-tile-manager";
import { SolarSystemController } from "./SolarSystemController";
import { GalaxySearchModal } from "./GalaxySearchModal";
import { GalaxyCoverageDashboard } from "./GalaxyCoverageDashboard";
import { CompactObjectLabModal } from "./CompactObjectLabModal";
import { CosmicWebExplorerModal } from "./CosmicWebExplorerModal";
import {
  createTargetFromStar,
  createTargetFromPlanet,
  createTargetFromGalaxy,
  createTargetFromObservedObject,
  createTargetFromExoplanet,
} from "./universal-target-factory";
import { GuidedJourneyHUD } from "./GuidedJourneyHUD";

export function InfoPanel() {
  const star = useStore((s) => s.selectedStar);
  const setSelected = useStore((s) => s.setSelected);
  return (
    <AnimatePresence>
      {star && (
        <HideablePanel resetKey={star.name} label={star.name}>
          {(hide) => (
            <motion.aside
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed right-0 top-0 z-30 h-full w-full max-w-[380px] overflow-y-auto border-l border-white/10 p-7 text-white"
              style={{
                background: "rgba(8,10,24,0.78)",
                backdropFilter: "blur(18px)",
                WebkitBackdropFilter: "blur(18px)",
              }}
            >
              {hide}
              <button
                onClick={() => setSelected(null)}

                aria-label="Close"
                className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>
              <h2 className="pr-10 text-3xl font-light tracking-wide">{star.name}</h2>
              <div className="mt-1 text-xs uppercase tracking-[0.2em] text-white/40">
                {star.constellation}
              </div>
              <NasaResources name={star.name} query={`${star.name} star ${star.constellation}`} />
              <button
                onClick={() => useStore.getState().setObservationModalOpen(true, star.name)}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-950/40 px-3.5 py-2 text-xs font-mono font-bold text-cyan-300 transition hover:bg-cyan-900/60 hover:text-white shadow-md shadow-cyan-950/50"
              >
                <Telescope className="h-4 w-4 text-cyan-400" />
                <span>Telescope Imagery & HiPS Surveys</span>
              </button>
              <button
                onClick={() =>
                  useStore.getState().setActiveUniversalTarget(createTargetFromStar(star))
                }
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-3.5 py-2 text-xs font-mono font-medium text-white/90 transition hover:bg-white/10"
              >
                <FileText className="h-4 w-4 text-cyan-300" />
                <span>Open 7-Tab Science Dossier</span>
              </button>
              <div className="mt-6 grid grid-cols-2 gap-y-4 text-sm">
                <Stat label="Distance" value={`${(star.distance ?? 0).toFixed(2)} ly`} />
                <Stat label="Spectral type" value={star.spectral ?? "G2V"} />
                <Stat label="App. magnitude" value={(star.magnitude ?? 0).toFixed(2)} />
                <Stat label="Abs. magnitude" value={(star.absMagnitude ?? 4.83).toFixed(2)} />
                <Stat label="Mass" value={`${star.mass ?? 1} M☉`} />
                <Stat label="Radius" value={`${star.radius ?? 1} R☉`} />
                <Stat
                  label="Temperature"
                  value={`${(star.temperature ?? 5778).toLocaleString()} K`}
                />
                <Stat label="Luminosity" value={`${star.luminosity ?? 1} L☉`} />
                <Stat label="Right ascension" value={star.ra ?? "00h 00m"} />
                <Stat label="Declination" value={star.dec ?? "+00° 00'"} />
                <Stat
                  label="Galactic l, b"
                  value={`${(star.galacticL ?? 0).toFixed(1)}°, ${(star.galacticB ?? 0).toFixed(1)}°`}
                />
                <Stat label="Known planets" value={String(star.planets ?? 0)} />
              </div>
              <div className="my-6 h-px bg-white/10" />
              <p className="text-sm leading-relaxed text-white/75">{star.description}</p>

              <StarDerived star={star} />

              <ExoSystemSection star={star} />

              <GaiaScientificSection star={star} />

              {star.companions?.length ? (
                <div className="mt-6">
                  <div className="text-xs uppercase tracking-[0.2em] text-white/40">Companions</div>
                  <ul className="mt-2 space-y-1 text-sm text-white/70">
                    {star.companions.map((c) => (
                      <li key={c.name}>
                        {c.name} <span className="text-white/40">— {c.spectral}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </motion.aside>
          )}
        </HideablePanel>
      )}
    </AnimatePresence>
  );
}

function GaiaScientificSection({ star }: { star: NamedStar }) {
  const gaiaStar = (star as any).gaiaSourceId ? (star as any) : null;
  if (!gaiaStar) return null;

  return (
    <div className="mt-6 rounded-xl border border-cyan-500/30 bg-cyan-950/30 p-4 text-xs">
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
        <div className="flex items-center gap-1.5 font-semibold text-cyan-300">
          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>ESA Gaia DR3 Verified Astrometry</span>
        </div>
        <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 text-[9px] font-mono text-cyan-200">
          DR3
        </span>
      </div>

      <div className="mt-3 space-y-2 font-mono text-[11px]">
        <div className="flex justify-between items-center text-white/70">
          <span className="text-white/45">Gaia Source ID:</span>
          <a
            href={`https://vizier.cds.unistra.fr/viz-bin/VizieR-5?-ref=VIZ64e6b&-source=I/355/gaiadr3&-c=${gaiaStar.raDeg || 0},${gaiaStar.decDeg || 0}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-300 underline hover:text-cyan-100"
          >
            {gaiaStar.gaiaSourceId}
          </a>
        </div>

        <div className="flex justify-between text-white/70">
          <span className="text-white/45">Trig. Parallax:</span>
          <span>
            {gaiaStar.parallaxMas?.toFixed(2)} ± {gaiaStar.parallaxErrorMas?.toFixed(2) || "0.05"}{" "}
            mas
          </span>
        </div>

        <div className="flex justify-between text-white/70">
          <span className="text-white/45">Bailer-Jones 2021:</span>
          <span className="text-emerald-300">
            {star.distance.toFixed(2)} ly ({(star.distance / 3.26156).toFixed(2)} pc)
          </span>
        </div>

        <div className="flex justify-between text-white/70">
          <span className="text-white/45">Proper Motion (α*, δ):</span>
          <span>
            {gaiaStar.pmraMasYr?.toFixed(1) || "0.0"}, {gaiaStar.pmdecMasYr?.toFixed(1) || "0.0"}{" "}
            mas/yr
          </span>
        </div>

        {gaiaStar.radialVelocityKmS != null && (
          <div className="flex justify-between text-white/70">
            <span className="text-white/45">Radial Velocity:</span>
            <span>{gaiaStar.radialVelocityKmS.toFixed(1)} km/s</span>
          </div>
        )}

        {gaiaStar.ruwe != null && (
          <div className="flex justify-between items-center text-white/70">
            <span className="text-white/45">Astrometric RUWE:</span>
            <span className={gaiaStar.ruwe <= 1.4 ? "text-emerald-300" : "text-amber-300"}>
              {gaiaStar.ruwe.toFixed(2)}{" "}
              {gaiaStar.ruwe <= 1.4 ? "(✓ Good single star)" : "(Excess noise)"}
            </span>
          </div>
        )}

        {gaiaStar.photGMag != null && (
          <div className="flex justify-between text-white/70">
            <span className="text-white/45">Gaia Photometry:</span>
            <span>
              G={gaiaStar.photGMag.toFixed(2)} | BP-RP={gaiaStar.bpRpColor?.toFixed(2) || "—"}
            </span>
          </div>
        )}
      </div>

      {gaiaStar.isSkyDirectionLayer && (
        <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2 text-[10px] text-amber-200 leading-relaxed">
          ⚠️ Parallax is trigonometrically unconstrained (≤ 0 or high noise). Projected onto the
          celestial sky-direction layer without fake 3D depth.
        </div>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-cyan-500/20 pt-2 text-[9px] text-cyan-300/60">
        <span>Citation: Gaia Collaboration (2023)</span>
        <a
          href="https://gea.esac.esa.int/archive/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline hover:text-cyan-200"
        >
          ESA Gaia Archive ↗
        </a>
      </div>
    </div>
  );
}

/**
 * Everything below is derived from the catalogued values already shown above
 * (no new observations): standard relations for colour temperature, habitable
 * zone, main-sequence lifetime and surface gravity.
 */
function ExoSystemSection({ star }: { star: NamedStar }) {
  if (star.name === "Sun") return null;
  const sys = exoSystemFor(star);
  const observed = sys.planets.some((p) => p.observed);
  return (
    <div className="mt-6">
      <div className="text-xs uppercase tracking-[0.2em] text-white/40">
        {observed ? "Confirmed planetary system" : "Modelled planetary system"}
      </div>
      <p className="mt-2 text-xs leading-relaxed text-white/50">
        {observed
          ? "Real confirmed exoplanets with published orbits and sizes from the NASA Exoplanet Archive."
          : "Procedurally generated from this star's real mass, luminosity and temperature — an illustration of a physically plausible system, not observed planets."}{" "}
        Green orbits lie in the habitable zone ({sys.hzInner.toFixed(2)}–{sys.hzOuter.toFixed(2)}{" "}
        AU); snow line at {sys.snowLine.toFixed(2)} AU.
      </p>
      {sys.planets.length === 0 ? (
        <p className="mt-2 text-sm text-white/60">No stable orbits modelled for this star.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {sys.planets.map((p) => (
            <li
              key={p.name}
              className="rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-white/70"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-white">
                  {p.name}
                  {p.observed && (
                    <span className="ml-2 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-emerald-300">
                      confirmed
                    </span>
                  )}
                </span>
                <span className={p.inHZ ? "text-emerald-300" : "text-white/50"}>{p.kind}</span>
              </div>
              <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5">
                <span>a = {p.aAU.toFixed(3)} AU</span>
                <span>e = {p.e.toFixed(2)}</span>
                <span>
                  P ={" "}
                  {p.periodYears < 1
                    ? `${(p.periodYears * 365.25).toFixed(1)} d`
                    : `${p.periodYears.toFixed(2)} yr`}
                </span>
                <span>T_eq ≈ {Math.round(p.teqK)} K</span>
                <span>
                  R {p.radiusEstimated ? "≈" : "="} {p.radiusEarth.toFixed(2)} R⊕
                </span>
                <span>M ≈ {p.massEarth.toFixed(1)} M⊕</span>
                <span>ESI ≈ {p.esi.toFixed(2)}</span>
                <span>{p.tidallyLocked ? "Tidally locked" : "Free rotation"}</span>
              </div>
              <button
                onClick={() => useStore.getState().visitExoPlanet(star, p.name)}
                className="mt-2 w-full rounded-md border border-white/15 bg-white/5 py-1.5 text-[11px] uppercase tracking-wider text-white/80 transition hover:bg-white/15 hover:text-white"
              >
                Fly to {p.name} →
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StarDerived({ star }: { star: NamedStar }) {
  const dist = star.distance ?? 0;
  const temp = star.temperature ?? 5778;
  const lum = star.luminosity ?? 1;
  const mass = star.mass ?? 1;
  const rad = star.radius ?? 1;
  const pc = dist / 3.26156;
  const peakNm = temp > 0 ? 2.8977719e6 / temp : 0;
  const hzInner = Math.sqrt(lum / 1.1);
  const hzOuter = Math.sqrt(lum / 0.53);
  const lifeGyr = lum > 0 ? 10 * (mass / lum) : 0;
  const gravity = rad > 0 ? mass / (rad * rad) : 0;
  const colorName =
    temp > 25000
      ? "blue"
      : temp > 10000
        ? "blue-white"
        : temp > 7300
          ? "white"
          : temp > 5900
            ? "yellow-white"
            : temp > 4700
              ? "yellow"
              : temp > 3500
                ? "orange"
                : "red";
  const rows: Array<[string, string]> = [
    ["Light travel time", dist < 0.01 ? "8.3 minutes" : `${dist.toFixed(2)} years`],
    ["Distance", `${pc.toFixed(2)} parsecs · ${(dist * 63241).toExponential(2)} AU`],
    ["Peak colour", `${colorName}, peaking near ${Math.round(peakNm)} nm`],
    ["Habitable zone", `${hzInner.toFixed(2)} – ${hzOuter.toFixed(2)} AU`],
    ["Surface gravity", `${gravity.toFixed(2)} × the Sun's`],
    [
      "Main-sequence lifetime",
      lifeGyr >= 1000
        ? `${(lifeGyr / 1000).toFixed(1)} trillion yr`
        : `${lifeGyr.toFixed(1)} billion yr`,
    ],
    [
      "Brightness vs Sun",
      star.luminosity >= 1
        ? `${star.luminosity.toLocaleString()}× brighter`
        : `${(1 / star.luminosity).toFixed(0)}× fainter`,
    ],
  ];
  return (
    <div className="mt-7">
      <div className="text-xs uppercase tracking-[0.2em] text-white/40">Derived properties</div>
      <ul className="mt-3 space-y-2">
        {rows.map(([k, v]) => (
          <li key={k} className="flex items-baseline justify-between gap-3 text-xs">
            <span className="text-white/45">{k}</span>
            <span className="text-right text-white/80">{v}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[11px] leading-relaxed text-white/40">
        Values above come from published astrometry; these figures follow from them using standard
        stellar relations.
      </p>
    </div>
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
  const cameraFree = useStore((s) => s.cameraFree);
  const toggleCameraFree = useStore((s) => s.toggleCameraFree);
  const [searchOpen, setSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [gaiaAtlasOpen, setGaiaAtlasOpen] = useState(false);
  const [solarControllerOpen, setSolarControllerOpen] = useState(false);
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="fixed left-6 top-5 z-30 flex items-center gap-3 text-white/80"
    >
      <IconButton
        title="NASA JPL Horizons Solar System Time, Ephemerides & Dynamics"
        onClick={() => setSolarControllerOpen((v) => !v)}
        active={solarControllerOpen}
      >
        <Orbit className="h-4 w-4 text-emerald-400" />
      </IconButton>
      <IconButton
        title="ESA Gaia DR3 Star Atlas, Proper Motion & Benchmarks"
        onClick={() => setGaiaAtlasOpen((v) => !v)}
        active={gaiaAtlasOpen}
      >
        <Telescope className="h-4 w-4 text-cyan-400" />
      </IconButton>
      <IconButton
        title="Observational Extragalactic Atlas Search (NASA/IPAC NED)"
        onClick={() => useStore.getState().setGalaxyAtlasSearchOpen(true)}
      >
        <Sparkles className="h-4 w-4 text-sky-400" />
      </IconButton>
      <IconButton
        title="Galaxy Coverage & Cosmological Distance Dashboard"
        onClick={() => useStore.getState().setGalaxyCoverageDashboardOpen(true)}
      >
        <Compass className="h-4 w-4 text-amber-400" />
      </IconButton>
      <IconButton
        title="Astronomical Observation Evidence & Sky Survey Explorer (Aladin Lite / NASA / ESO)"
        onClick={() => useStore.getState().setObservationModalOpen(true)}
      >
        <Eye className="h-4 w-4 text-emerald-400" />
      </IconButton>
      <IconButton
        title="Large-Scale Structure & Cosmic Web Explorer (Mode A: Observational vs Mode B: IllustrisTNG Simulation & Guided Journey)"
        onClick={() => useStore.getState().setCosmicWebExplorerOpen(true)}
      >
        <Layers className="h-4 w-4 text-cyan-400" />
      </IconButton>
      <IconButton
        title="Astrophysical Optics, Shaders & Tone Mapping Settings"
        onClick={() => useStore.getState().setOpticsModalOpen(true)}
      >
        <Sliders className="h-4 w-4 text-cyan-400" />
      </IconButton>
      <IconButton
        title="Universal Indexed Celestial Search (Names, Aliases, Catalogs, Morphologies, Redshifts)"
        onClick={() => useStore.getState().setUniversalSearchOpen(true)}
      >
        <SearchIcon />
      </IconButton>
      <IconButton
        title={
          useStore((s) => s.cosmicJourneyOpen)
            ? "Cosmic Scale Journey (Earth → Observable Universe): ACTIVE (Click to hide)"
            : "Launch Cosmic Scale Journey: Smooth flight from Earth to the Observable Horizon"
        }
        onClick={() => useStore.getState().toggleCosmicJourney()}
        active={useStore((s) => s.cosmicJourneyOpen)}
      >
        <Compass className="h-4 w-4 text-cyan-400" />
      </IconButton>
      <IconButton
        title="Camera Vistas & Curated Astronomical Bookmarks"
        onClick={() => useStore.getState().setBookmarksModalOpen(true)}
      >
        <Bookmark className="h-4 w-4 text-cyan-300" />
      </IconButton>
      <IconButton
        title="Landmark Discoveries in Observational Astrophysics (Hubble, Mayor, Penzias, EHT, LIGO)"
        onClick={() => useStore.getState().setDiscoveriesModalOpen(true)}
      >
        <Award className="h-4 w-4 text-amber-400" />
      </IconButton>
      <IconButton
        title={
          useStore.getState().isAutoOrbiting
            ? "Auto-Orbit Object: ACTIVE (Click to pause)"
            : "Auto-Orbit Object: INACTIVE (Click to start smooth orbit)"
        }
        onClick={() => useStore.getState().toggleAutoOrbit()}
        active={useStore.getState().isAutoOrbiting}
      >
        <Orbit className="h-4 w-4 text-sky-400" />
      </IconButton>
      <IconButton
        title="Reset Camera Orientation to Galactic & Ecliptic North"
        onClick={() => useStore.getState().resetCameraOrientation()}
      >
        <RotateCcw className="h-4 w-4 text-white/70" />
      </IconButton>
      <IconButton
        title="Interaction, Keyboard Shortcuts & Accessibility Guide (?)"
        onClick={() => useStore.getState().setShortcutsModalOpen(true)}
      >
        <Keyboard className="h-4 w-4 text-emerald-400" />
      </IconButton>
      <IconButton
        title={
          cameraFree
            ? "Camera stopped — click to follow the Solar System again"
            : "Stop the camera in space (free look)"
        }
        onClick={toggleCameraFree}
        active={cameraFree}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="6" y="6" width="12" height="12" rx="2" />
        </svg>
      </IconButton>
      <MaximizeButton />
      <IconButton title="Settings" onClick={() => setSettingsOpen((v) => !v)} active={settingsOpen}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1" />
        </svg>
      </IconButton>
      <IconButton
        title="Guide — what every button does"
        onClick={() => setGuideOpen((v) => !v)}
        active={guideOpen}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M9.5 9a2.5 2.5 0 1 1 3.4 2.3c-.6.3-.9.8-.9 1.5v.4" />
          <path d="M12 17h.01" />
        </svg>
      </IconButton>
      <SolarSystemController
        open={solarControllerOpen}
        onClose={() => setSolarControllerOpen(false)}
      />
      <GaiaAtlasPanel open={gaiaAtlasOpen} onClose={() => setGaiaAtlasOpen(false)} />
      <GalaxySearchModal />
      <GalaxyCoverageDashboard />
      <CompactObjectLabModal />
      <CosmicWebExplorerModal />
      <GuidedJourneyHUD />
      <CosmicWebHUDOverlay />
      <SearchBar open={searchOpen} onClose={() => setSearchOpen(false)} />
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <GuidePanel open={guideOpen} onClose={() => setGuideOpen(false)} />
      {useStore((s) => s.opticsPreset) === "cinematic" && (
        <div className="pointer-events-none ml-2 hidden items-center gap-1.5 rounded-full border border-amber-500/40 bg-black/80 px-2.5 py-1 text-[9.5px] font-medium tracking-wide text-amber-300 shadow-md backdrop-blur sm:flex">
          <Sparkles className="h-3 w-3 text-amber-400" />
          <span>Cinematic Enhancement Active</span>
        </div>
      )}
    </div>
  );
}

// Quick reference for every control in the app.
const GUIDE_SECTIONS: { title: string; items: [string, string][] }[] = [
  {
    title: "Toolbar",
    items: [
      ["Sliders", "Astrophysical Optics, Shaders, Bloom & Tone Mapping controls"],
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
      ["Objects", "Visit quasars, black holes, remnants and every kind of star"],
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
            <button
              onClick={onClose}
              className="text-white/50 transition hover:text-white"
              aria-label="Close guide"
            >
              ✕
            </button>
          </div>
          {GUIDE_SECTIONS.map((s) => (
            <div key={s.title} className="mb-4 last:mb-0">
              <div className="mb-2 text-[9px] uppercase tracking-[0.2em] text-white/35">
                {s.title}
              </div>
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
    } catch {
      /* fullscreen may be blocked */
    }
  };
  return (
    <IconButton
      title={full ? "Exit full screen (Esc)" : "Maximize — full screen"}
      onClick={toggle}
      active={full}
    >
      {full ? (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M9 3v6H3M15 21v-6h6M21 9h-6V3M3 15h6v6" />
        </svg>
      ) : (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
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
          className="absolute left-0 top-12 w-80 rounded-xl border border-white/10 bg-black/85 p-4 backdrop-blur-md"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.25em] text-white/50">Settings</span>
            <button
              onClick={onClose}
              className="text-white/50 transition hover:text-white"
              aria-label="Close settings"
            >
              ✕
            </button>
          </div>
          <Slider
            label="Zoom speed"
            hint="Space = zoom out · Ctrl = zoom in"
            value={zoomSpeed}
            onChange={setZoomSpeed}
          />
          <div className="mb-4 space-y-2">
            <label htmlFor="simulation-time" className="flex justify-between text-xs text-white/80">
              <span>Time</span>
              <span className="font-mono text-sky-200">{formatTimeRate(systemSpeed)}</span>
            </label>
            <input
              id="simulation-time"
              aria-label="Simulation time rate"
              type="range"
              min={-6}
              max={2}
              step={0.01}
              value={Math.log10(Math.max(1e-6, systemSpeed))}
              onChange={(e) => setSystemSpeed(10 ** Number(e.target.value))}
              className="w-full accent-sky-300"
            />
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: "Pause", rate: 0 },
                { label: "Slow motion", rate: 1e-6 },
                { label: "Real time", rate: 1 / SIM_SECONDS_PER_REAL_SECOND },
                { label: "Slow", rate: 0.01 },
                { label: "Default", rate: 1 },
              ].map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setSystemSpeed(p.rate)}
                  className="min-h-11 rounded border border-white/15 px-2 text-[11px] text-white/75 hover:bg-white/10 focus-visible:outline focus-visible:outline-sky-300"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <Slider
            label="Trail size"
            hint="Length of planet & moon trails"
            value={trailSize}
            onChange={setTrailSize}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Slider({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  onChange: (n: number) => void;
}) {
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

function IconButton({
  children,
  title,
  onClick,
  active,
}: {
  children: React.ReactNode;
  title: string;
  onClick: () => void;
  active?: boolean;
}) {
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

function SearchIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}

type SearchHit =
  | { kind: "star"; name: string; sub: string; star: NamedStar }
  | { kind: "exoplanet"; name: string; sub: string; star: NamedStar; planetName: string }
  | { kind: "planet"; name: string; sub: string }
  | { kind: "galaxy"; name: string; sub: string; galaxy: (typeof NAMED_GALAXIES)[number] }
  | { kind: "object"; name: string; sub: string; object: ObservedObject };

function SearchBar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const flyTo = useStore((s) => s.flyToStar);
  const visitExoPlanet = useStore((s) => s.visitExoPlanet);
  const setVisitPlanet = useStore((s) => s.setVisitPlanet);
  const setVisitGalaxy = useStore((s) => s.setVisitGalaxy);
  const setSelectedObject = useStore((s) => s.setSelectedObject);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (open) inputRef.current?.focus();
    else setQ("");
  }, [open]);
  const matches = useMemo<SearchHit[]>(() => {
    if (!q) return [];
    const lower = q.toLowerCase();
    const gaiaHits: SearchHit[] = gaiaTileManager.searchStars(lower, 5).map((gs) => ({
      kind: "star",
      name: gs.name,
      sub: `Gaia DR3 · ${gs.distance.toFixed(1)} ly · ${gs.constellation}`,
      star: gs,
    }));
    const stars: SearchHit[] = NAMED_STARS.filter(
      (s) => s.name.toLowerCase().includes(lower) && !gaiaHits.some((g) => g.name === s.name),
    ).map((s) => ({
      kind: "star",
      name: s.name,
      sub: `Star · ${s.distance.toFixed(1)} ly`,
      star: s,
    }));
    const exoHits: SearchHit[] = [];
    for (const s of NAMED_STARS) {
      if (s.name === "Sun") continue;
      const real = REAL_SYSTEMS[s.name];
      if (!real) continue;
      for (const p of real) {
        if (p.name.toLowerCase().includes(lower)) {
          exoHits.push({
            kind: "exoplanet",
            name: p.name,
            sub: `Exoplanet · ${s.name} · ${p.aAU.toFixed(3)} AU`,
            star: s,
            planetName: p.name,
          });
        }
      }
    }
    const planets: SearchHit[] = PLANETS.filter((p) => p.name.toLowerCase().includes(lower)).map(
      (p) => ({ kind: "planet", name: p.name, sub: `Planet · ${(p.a / AU).toFixed(2)} AU` }),
    );
    const galaxies: SearchHit[] = NAMED_GALAXIES.filter((g) => {
      const gAny = g as any;
      const aliases: string[] = gAny.aliases ?? [];
      const pref: string = gAny.preferredName ?? "";
      return (
        g.name.toLowerCase().includes(lower) ||
        pref.toLowerCase().includes(lower) ||
        aliases.some((a) => a.toLowerCase().includes(lower))
      );
    }).map((g) => {
      const gAny = g as any;
      const zStr =
        gAny.redshift !== undefined
          ? ` · z=${gAny.redshift < 0 ? gAny.redshift.toFixed(4) : gAny.redshift.toFixed(3)}`
          : "";
      return {
        kind: "galaxy" as const,
        name: g.name,
        sub: `${g.type} · ${g.distance >= 1_000_000_000 ? (g.distance / 1_000_000_000).toFixed(2) + " Gly" : g.distance >= 1_000_000 ? (g.distance / 1_000_000).toFixed(2) + " Mly" : (g.distance / 1000).toFixed(0) + " kly"}${zStr}`,
        galaxy: g,
      };
    });
    const objects: SearchHit[] = OBSERVED_OBJECTS.filter((o) =>
      [o.name, o.category, o.subtype, ...o.aliases].some((v) => v.toLowerCase().includes(lower)),
    ).map((o) => ({
      kind: "object",
      name: o.name,
      sub: `${o.category} · ${o.subtype}`,
      object: o,
    }));
    return [...planets, ...exoHits, ...gaiaHits, ...stars, ...objects, ...galaxies].slice(0, 10);
  }, [q]);
  const activate = (m: SearchHit) => {
    if (m.kind === "star") flyTo(m.star);
    else if (m.kind === "exoplanet") visitExoPlanet(m.star, m.planetName);
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
  const minR = 1e-10,
    maxR = 5e10;
  const t = Math.min(
    1,
    Math.max(0, (Math.log(distance) - Math.log(minR)) / (Math.log(maxR) - Math.log(minR))),
  );
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
        style={{
          writingMode: "vertical-lr" as React.CSSProperties["writingMode"],
          direction: "rtl",
        }}
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
          <div
            className="mx-auto max-w-2xl px-6 text-lg font-light tracking-wide text-white/90 md:text-2xl"
            style={{ textShadow: "0 2px 30px rgba(0,0,0,0.7)" }}
          >
            {caption}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ScaleIndicator() {
  const d = useStore((s) => s.cameraDistance);
  const cosmicJourneyOpen = useStore((s) => s.cosmicJourneyOpen);
  const isMobile = useIsMobile();
  const info = scaleManager.formatIndicator(d, "enhanced");

  return (
    <div
      className={`pointer-events-auto fixed left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-1.5 select-none transition-all duration-300 ${
        cosmicJourneyOpen ? (isMobile ? "bottom-32" : "bottom-28") : "bottom-5"
      }`}
    >
      <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/75 px-3.5 py-1.5 shadow-xl backdrop-blur-md">
        <span className="text-[10px] uppercase tracking-[0.22em] text-white/85 font-medium">
          {info.regimeName}
        </span>
        <span className="text-white/25 text-[10px]">|</span>
        <span className="font-mono text-[11px] text-cyan-300 font-semibold tracking-wide">
          {info.distanceLabel}
        </span>
      </div>
      <div className="pointer-events-none text-[9px] uppercase tracking-[0.2em] text-white/45">
        {info.regimeSubtitle}
      </div>
    </div>
  );
}

export function CosmicWebHUDOverlay() {
  const showWeb = useStore((s) => s.showCosmicWebDensity);
  const mode = useStore((s) => s.cosmicWebMode);
  const setMode = useStore((s) => s.setCosmicWebMode);
  const setExplorerOpen = useStore((s) => s.setCosmicWebExplorerOpen);
  const startGuidedJourney = useStore((s) => s.startGuidedJourney);
  const guidedJourneyActive = useStore((s) => s.guidedJourneyActive);
  const d = useStore((s) => s.cameraDistance);

  if (!showWeb || mode === "off" || guidedJourneyActive || d < 300_000) {
    return null;
  }

  const isObs = mode === "observational";

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="pointer-events-auto fixed top-16 left-1/2 z-20 -translate-x-1/2 flex items-center gap-2 rounded-xl border border-white/15 bg-slate-950/85 px-3 py-1.5 shadow-2xl backdrop-blur-md text-xs text-white"
    >
      <div className="flex items-center gap-1.5">
        <span
          className={`size-2 rounded-full animate-pulse ${
            isObs
              ? "bg-cyan-400 shadow-[0_0_8px_#38bdf8]"
              : "bg-purple-400 shadow-[0_0_8px_#c084fc]"
          }`}
        />
        <span className="font-bold tracking-wide">
          {isObs ? "MODE A: OBSERVED SURVEYS" : "MODE B: SIMULATED COSMIC WEB"}
        </span>
      </div>

      <span className="text-white/20">|</span>

      <span className="text-[10px] text-slate-300 font-mono hidden md:inline">
        {isObs
          ? "SDSS / 2dFGRS / 2MRS • Past Lightcone (z > 0)"
          : "IllustrisTNG-300 Snapshot 99 • Equal-Time Box"}
      </span>

      <span className="text-white/20 hidden md:inline">|</span>

      <button
        onClick={() => setMode(isObs ? "simulation" : "observational")}
        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold transition ${
          isObs
            ? "bg-purple-500/20 text-purple-300 border border-purple-400/30 hover:bg-purple-500/30"
            : "bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 hover:bg-cyan-500/30"
        }`}
        title={
          isObs
            ? "Switch to IllustrisTNG-300 Simulation Box"
            : "Switch to Actual Observed Galaxy Surveys"
        }
      >
        Switch to {isObs ? "Mode B (Simulation)" : "Mode A (Observed)"}
      </button>

      <button
        onClick={() => startGuidedJourney()}
        className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-semibold text-cyan-200 border border-cyan-400/30 hover:bg-cyan-500/30 transition flex items-center gap-1"
        title="Start Guided Cosmic Journey (6 Scale Stages)"
      >
        <Compass className="size-3 text-cyan-400" />
        <span className="hidden sm:inline">Guided Journey</span>
      </button>

      <button
        onClick={() => setExplorerOpen(true)}
        className="p-1 text-slate-400 hover:text-white transition rounded-md hover:bg-white/10"
        title="Open Full Large-Scale Structure Explorer"
      >
        <Sliders className="size-3.5" />
      </button>
    </motion.div>
  );
}

// Ambient drone via WebAudio so we don't need an asset.
function useDrone(on: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{ gain: GainNode; oscs: OscillatorNode[] } | null>(null);
  useEffect(() => {
    if (on) {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
          setTimeout(() => {
            oscs.forEach((o) => o.stop());
            ctx.close();
          }, 700);
        } catch {
          /* noop */
        }
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
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z" />
        </svg>
      ) : (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M11 5L6 9H3v6h3l5 4V5z" />
          <line x1="22" y1="9" x2="16" y2="15" />
          <line x1="16" y1="9" x2="22" y2="15" />
        </svg>
      )}
    </button>
  );
}

export function Branding() {
  const opticsPreset = useStore((s) => s.opticsPreset);
  const observerMode = useStore((s) => s.observerMode);

  return (
    <div className="pointer-events-none fixed bottom-5 right-6 z-20 flex flex-col items-end gap-1.5 text-right">
      <div className="text-[10px] uppercase tracking-[0.3em] text-white/30">
        Our Visible Universe — A Cosmic Experiment
      </div>
      <a
        className="pointer-events-auto text-xs text-white/50 hover:text-white"
        href="/textures/solar/CREDITS.md"
        target="_blank"
        rel="noreferrer"
      >
        Solar imagery credits
      </a>
      {opticsPreset === "cinematic" ? (
        <div className="flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-950/70 px-2.5 py-0.5 text-[9px] font-mono text-amber-300 shadow-lg backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span>CINEMATIC ENHANCEMENT • Contrast Boost (Non-Photometric)</span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/50 px-2.5 py-0.5 text-[9px] font-mono text-cyan-300/80 shadow-lg backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
          <span>
            SCIENTIFIC OBSERVATION • Pogson Flux &amp; Planckian Locus (
            {observerMode === "vacuum" ? "Vacuum" : "Atmosphere"})
          </span>
        </div>
      )}
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
          <span className="px-2 text-[10px] uppercase tracking-[0.25em] text-white/40">
            Visit Planet
          </span>
          {PLANETS.map((p) => (
            <button
              key={p.name}
              onClick={() => setVisit(visit === p.name ? null : p.name)}
              title={p.name}
              className={`group flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] tracking-wide transition ${
                visit === p.name
                  ? "bg-white/15 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
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
            className="pointer-events-auto fixed left-[17.5rem] top-1/2 z-20 hidden max-h-[80vh] w-72 -translate-y-1/2 overflow-y-auto rounded-xl border border-white/10 bg-black/55 p-5 backdrop-blur-md md:block"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-white/40">
                  Now Viewing
                </div>
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
            <NasaResources name={current.name} query={`${current.name}`} />
            <p className="mt-3 text-xs leading-relaxed text-white/70">{current.description}</p>
            <div className="mt-4 grid grid-cols-2 gap-y-2 text-[11px] text-white/70">
              <span className="text-white/40">Distance</span>
              <span>{(current.a / AU).toFixed(2)} AU</span>
              <span className="text-white/40">Eccentricity</span>
              <span>{current.e.toFixed(4)}</span>
              <span className="text-white/40">Inclination</span>
              <span>{((current.i * 180) / Math.PI).toFixed(2)}°</span>
              <span className="text-white/40">Axial tilt</span>
              <span>{((current.tilt * 180) / Math.PI).toFixed(1)}°</span>
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
    () =>
      NAMED_STARS.filter((s) => s.name !== "Sun")
        .slice()
        .sort((a, b) => a.distance - b.distance),
    [],
  );
  if (tourActive) return null;
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="pointer-events-auto fixed bottom-32 left-1/2 z-20 hidden -translate-x-1/2 md:block"
    >
      <div className="flex max-w-[min(90vw,900px)] items-center gap-1 overflow-x-auto rounded-full border border-white/10 bg-black/50 px-2 py-1.5 backdrop-blur-md">
        <span className="whitespace-nowrap px-2 text-[10px] uppercase tracking-[0.25em] text-white/40">
          Visit Star
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelected(null);
          }}
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
              onClick={(e) => {
                e.stopPropagation();
                flyTo(s);
              }}
              title={`${s.name} — ${s.distance.toFixed(2)} ly`}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] transition ${
                active
                  ? "bg-white/15 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
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
          <span className="whitespace-nowrap px-2 text-[10px] uppercase tracking-[0.25em] text-white/40">
            Observational Atlas
          </span>
          <button
            onClick={() => useStore.getState().setGalaxyAtlasSearchOpen(true)}
            title="Multi-dimensional Observational Galaxy Search (Name, Redshift, Distance, Morphology, Cluster)"
            className="flex items-center gap-1 whitespace-nowrap rounded-full bg-sky-500/20 px-2.5 py-1 text-[11px] font-medium text-sky-300 transition hover:bg-sky-500/30"
          >
            <span>🔍 Search Atlas</span>
          </button>
          <button
            onClick={() => useStore.getState().setGalaxyCoverageDashboardOpen(true)}
            title="Galaxy Coverage & Cosmological Distance Dashboard"
            className="flex items-center gap-1 whitespace-nowrap rounded-full bg-amber-500/20 px-2.5 py-1 text-[11px] font-medium text-amber-300 transition hover:bg-amber-500/30"
          >
            <span>📊 Dashboard</span>
          </button>
          <div className="flex items-center gap-1 rounded-full border border-white/15 bg-slate-950/80 px-1 py-0.5 shadow-sm">
            <button
              onClick={() => {
                const mode = useStore.getState().cosmicWebMode;
                const density = useStore.getState().showCosmicWebDensity;
                if (!density || mode === "off") {
                  useStore.getState().setCosmicWebMode("observational");
                  if (!density) useStore.getState().toggleCosmicWebDensity();
                } else if (mode === "observational") {
                  useStore.getState().setCosmicWebMode("simulation");
                } else {
                  useStore.getState().setCosmicWebMode("observational");
                  useStore.getState().toggleCosmicWebDensity();
                }
              }}
              title="Toggle between Mode A (Observed Surveys), Mode B (IllustrisTNG Sim), and Off"
              className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                useStore.getState().showCosmicWebDensity &&
                useStore.getState().cosmicWebMode === "observational"
                  ? "bg-cyan-500/25 text-cyan-300 border border-cyan-500/40"
                  : useStore.getState().showCosmicWebDensity &&
                      useStore.getState().cosmicWebMode === "simulation"
                    ? "bg-purple-500/25 text-purple-300 border border-purple-500/40"
                    : "text-white/50 hover:bg-white/5 hover:text-white"
              }`}
            >
              {useStore.getState().showCosmicWebDensity &&
              useStore.getState().cosmicWebMode === "observational"
                ? "🕸 Mode A: Observed"
                : useStore.getState().showCosmicWebDensity &&
                    useStore.getState().cosmicWebMode === "simulation"
                  ? "🕸 Mode B: Simulation"
                  : "🕸 Web: OFF"}
            </button>
            <button
              onClick={() => useStore.getState().setCosmicWebExplorerOpen(true)}
              title="Open Large-Scale Structure & Cosmic Web Explorer Settings"
              className="p-1 text-slate-400 hover:text-white transition rounded-full hover:bg-white/10"
            >
              <Sliders className="size-3 text-cyan-400" />
            </button>
          </div>
          <div className="h-3 w-px bg-white/20 mx-0.5" />
          <button
            onClick={(e) => {
              e.stopPropagation();
              setVisitGalaxy(null);
            }}
            className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] transition ${
              !visitGalaxy
                ? "bg-white/15 text-white"
                : "text-white/60 hover:bg-white/5 hover:text-white"
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
                  active
                    ? "bg-white/15 text-white"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
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
                <div className="text-[10px] uppercase tracking-[0.25em] text-white/40">
                  Now Viewing
                </div>
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
              <span className="text-white/40">Type</span>
              <span>{visitGalaxy.type}</span>
              <span className="text-white/40">Distance</span>
              <span>{formatLy(visitGalaxy.distance)}</span>
              <span className="text-white/40">Diameter</span>
              <span>{formatLy(visitGalaxy.size)}</span>
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
      onClick={(e) => {
        e.stopPropagation();
        toggle();
      }}
      title={hidden ? "Show panels" : "Hide panels for clean view"}
      aria-label={hidden ? "Show panels" : "Hide panels"}
      className="fixed right-6 top-5 z-40 grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-black/40 text-white/70 backdrop-blur transition hover:border-white/50 hover:text-white"
    >
      {hidden ? (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ) : (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a19.77 19.77 0 0 1 4.22-5.28" />
          <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 7 11 7a19.77 19.77 0 0 1-2.66 3.72" />
          <path d="M1 1l22 22" />
        </svg>
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
        <div
          key={i}
          className={`h-1 w-8 rounded-full transition ${i <= stop ? "bg-white/80" : "bg-white/15"}`}
        />
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
                  left: `${(i * 37 + 13) % 100}%`,
                  top: `${(i * 59 + 29) % 100}%`,
                  opacity: 0.2 + ((i * 17) % 70) / 100,
                  animation: `twinkle ${2 + ((i * 13) % 4)}s ease-in-out ${(i * 7) % 3}s infinite`,
                }}
              />
            ))}
          </div>
          <div className="relative text-center">
            <h1 className="text-5xl font-extralight tracking-[0.3em] md:text-7xl">
              OUR VISIBLE UNIVERSE
            </h1>
            <p className="mt-4 text-xs uppercase tracking-[0.3em] text-white/50">
              An interactive map from nearby worlds to the cosmic horizon
            </p>
            <div className="mx-auto mt-10 h-px w-64 overflow-hidden bg-white/10">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                className="h-full w-1/2 bg-white/80"
              />
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
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(!isMobile);
  const [section, setSection] = useState<
    "journey" | "planets" | "stars" | "exoplanets" | "galaxies" | "objects"
  >("journey");
  const [q, setQ] = useState("");
  const [expandedStars, setExpandedStars] = useState<Record<string, boolean>>({});
  const [exoFilter, setExoFilter] = useState<"confirmed" | "all">("confirmed");

  const visitPlanet = useStore((s) => s.visitPlanet);
  const setVisitPlanet = useStore((s) => s.setVisitPlanet);
  const exoVisit = useStore((s) => s.exoVisit);
  const visitExoPlanet = useStore((s) => s.visitExoPlanet);
  const selected = useStore((s) => s.selectedStar);
  const flyTo = useStore((s) => s.flyToStar);
  const setSelected = useStore((s) => s.setSelected);
  const visitGalaxy = useStore((s) => s.visitGalaxy);
  const setVisitGalaxy = useStore((s) => s.setVisitGalaxy);
  const selectedObjectId = useStore((s) => s.selectedObjectId);
  const setSelectedObject = useStore((s) => s.setSelectedObject);
  const cosmicJourneyIndex = useStore((s) => s.cosmicJourneyIndex);
  const setCosmicJourneyIndex = useStore((s) => s.setCosmicJourneyIndex);
  const setActiveUniversalTarget = useStore((s) => s.setActiveUniversalTarget);

  const lower = q.trim().toLowerCase();
  const match = (n: string) => !lower || n.toLowerCase().includes(lower);

  const stars = useMemo(
    () =>
      NAMED_STARS.filter((s) => s.name !== "Sun")
        .slice()
        .sort((a, b) => a.distance - b.distance),
    [],
  );
  const starExoSystems = useMemo(() => {
    const map = new Map<string, ReturnType<typeof exoSystemFor>>();
    for (const s of stars) {
      map.set(s.name, exoSystemFor(s));
    }
    return map;
  }, [stars]);
  const galaxies = useMemo(() => NAMED_GALAXIES.slice().sort(galaxyOrder), []);

  const goGalaxy = (g: (typeof NAMED_GALAXIES)[number]) =>
    setVisitGalaxy({
      name: g.name,
      x: g.position.x,
      y: g.position.y,
      z: g.position.z,
      size: g.size,
      distance: g.distance,
      type: g.type,
      view: "overview",
    });

  const JOURNEY_STEPS = [
    {
      idx: 0,
      name: "1. Earth",
      badge: "0.042 lt-sec",
      desc: "Home world & biosphere",
      action: () => setVisitPlanet("Earth"),
    },
    {
      idx: 1,
      name: "2. Moon",
      badge: "1.28 lt-sec",
      desc: "Tidally locked satellite",
      action: () => setVisitPlanet("Earth:Moon"),
    },
    {
      idx: 2,
      name: "3. Solar System",
      badge: "100 AU",
      desc: "Sun & planetary orbits",
      action: () => {
        flyTo(NAMED_STARS[0]);
      },
    },
    {
      idx: 3,
      name: "4. Nearby Stars",
      badge: "40 ly",
      desc: "Solar interstellar bubble",
      action: () => {
        useStore.setState({
          visitPlanet: null,
          visitGalaxy: null,
          selectedObjectId: null,
          selectedStar: null,
          exoVisit: null,
          tourActive: false,
          flyTo: { x: 0, y: 0, z: 0, distance: 48 },
        });
      },
    },
    {
      idx: 4,
      name: "5. Milky Way",
      badge: "100k ly",
      desc: "Barred spiral galaxy",
      action: () => {
        setVisitGalaxy({
          name: "Milky Way",
          x: -26000,
          y: 0,
          z: 0,
          size: 100000,
          distance: 26000,
          type: "Barred Spiral (SBbc)",
          view: "overview",
        });
      },
    },
    {
      idx: 5,
      name: "6. Andromeda (M31)",
      badge: "2.54 Mly",
      desc: "Sister spiral galaxy",
      action: () => {
        setVisitGalaxy({
          name: "Andromeda (M31)",
          x: -1191000,
          y: -929000,
          z: 2029000,
          size: 220000,
          distance: 2537000,
          type: "Barred Spiral (SA(s)b)",
          view: "overview",
        });
      },
    },
    {
      idx: 6,
      name: "7. Galaxy Clusters",
      badge: "54 Mly",
      desc: "Virgo supercluster core",
      action: () => {
        useStore.setState({
          visitPlanet: null,
          visitGalaxy: null,
          selectedObjectId: null,
          selectedStar: null,
          exoVisit: null,
          tourActive: false,
          flyTo: { x: -1.2e7, y: 5.2e7, z: -5e6, distance: 6.5e7 },
        });
      },
    },
    {
      idx: 7,
      name: "8. Cosmic Web",
      badge: "1.2 Gly",
      desc: "Filamentary cosmic scaffolding",
      action: () => {
        useStore.setState({
          visitPlanet: null,
          visitGalaxy: null,
          selectedObjectId: null,
          selectedStar: null,
          exoVisit: null,
          tourActive: false,
          flyTo: { x: 0, y: 0, z: 0, distance: 1.5e9 },
          showCosmicWebDensity: true,
        });
      },
    },
    {
      idx: 8,
      name: "9. Observable Universe",
      badge: "46.5 Gly",
      desc: "Cosmic horizon & CMB",
      action: () => {
        useStore.setState({
          visitPlanet: null,
          visitGalaxy: null,
          selectedObjectId: null,
          selectedStar: null,
          exoVisit: null,
          tourActive: false,
          flyTo: { x: 0, y: 0, z: 0, distance: 4.65e10 },
          showCosmicWebDensity: true,
        });
      },
    },
  ];

  // Mobile collapsed state shows a compact floating button
  if (isMobile && !open) {
    return (
      <div
        onClick={(e) => e.stopPropagation()}
        className="pointer-events-auto fixed bottom-5 left-4 z-30"
      >
        <button
          onClick={() => setOpen(true)}
          aria-label="Open celestial sitemap"
          title="Site map"
          className="grid h-12 w-12 place-items-center rounded-full border border-cyan-500/30 bg-black/75 text-cyan-300 shadow-xl backdrop-blur-md transition hover:bg-black hover:text-white"
        >
          <Compass className="h-5 w-5" />
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`pointer-events-auto fixed z-30 ${
        isMobile ? "inset-x-0 bottom-0" : "left-0 top-16 w-auto"
      }`}
    >
      <motion.div
        initial={isMobile ? { y: "100%" } : false}
        animate={isMobile ? { y: 0 } : { width: open ? 312 : 44 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className={`overflow-hidden rounded-xl border border-white/10 bg-black/65 backdrop-blur-xl shadow-2xl ${
          isMobile ? "w-full max-w-full rounded-b-none border-b-0" : "ml-4"
        }`}
      >
        {/* Header Toggle */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between px-3.5 py-2.5 text-left text-[10px] uppercase tracking-[0.25em] text-white/70 transition hover:text-white"
          title={open ? "Collapse site map" : "Expand site map"}
        >
          <div className="flex items-center gap-2">
            <span className="text-base leading-none text-cyan-400">{open ? "‹" : "☰"}</span>
            {open && <span className="font-semibold text-white/90">Cosmic Sitemap</span>}
          </div>
          {open && (
            <span className="rounded bg-cyan-500/15 px-1.5 py-0.5 text-[9px] font-mono font-medium text-cyan-300">
              Atlas
            </span>
          )}
          {isMobile && open && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
              }}
              className="ml-auto grid h-6 w-6 place-items-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white"
              aria-label="Close site map"
            >
              ✕
            </span>
          )}
        </button>

        {open && (
          <div className="border-t border-white/10 px-3 pb-3 pt-2">
            {/* Search Input */}
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filter stars, exoplanets, galaxies..."
              className="mb-2 h-8 w-full rounded-full border border-white/15 bg-white/5 px-3 text-[11px] text-white outline-none placeholder:text-white/35 focus:border-cyan-400/60 transition"
            />

            {/* Quick Action Pill Row */}
            <div className="mb-2 flex gap-1 border-b border-white/10 pb-2">
              <button
                onClick={() => useStore.getState().setUniversalSearchOpen(true)}
                className="flex flex-1 items-center justify-center gap-1 rounded-md border border-white/10 bg-white/5 py-1 text-[9px] font-medium text-cyan-300 hover:bg-white/10 transition"
                title="Open Universal Search (Cmd+K)"
              >
                <SearchIcon />
                <span>Search</span>
              </button>
              <button
                onClick={() => useStore.getState().setBookmarksModalOpen(true)}
                className="flex flex-1 items-center justify-center gap-1 rounded-md border border-white/10 bg-white/5 py-1 text-[9px] font-medium text-cyan-300 hover:bg-white/10 transition"
                title="Curated Vistas & Custom Bookmarks"
              >
                <Bookmark className="h-3 w-3" />
                <span>Vistas</span>
              </button>
              <button
                onClick={() => useStore.getState().setDiscoveriesModalOpen(true)}
                className="flex flex-1 items-center justify-center gap-1 rounded-md border border-white/10 bg-white/5 py-1 text-[9px] font-medium text-amber-300 hover:bg-white/10 transition"
                title="Landmark Astrophysics Discoveries Timeline"
              >
                <Award className="h-3 w-3" />
                <span>History</span>
              </button>
            </div>

            {/* Category Navigation Tabs */}
            <div className="mb-2 flex gap-1 overflow-x-auto no-scrollbar">
              {(["journey", "planets", "stars", "exoplanets", "galaxies", "objects"] as const).map(
                (k) => (
                  <button
                    key={k}
                    onClick={() => setSection(k)}
                    className={`shrink-0 rounded-full px-2 py-1 text-[8.5px] uppercase tracking-[0.08em] font-medium whitespace-nowrap transition ${
                      section === k
                        ? "bg-cyan-500/20 text-cyan-200 border border-cyan-500/30 font-semibold"
                        : "text-white/45 hover:bg-white/5 hover:text-white/80"
                    }`}
                  >
                    {k === "journey" ? "Scale" : k === "exoplanets" ? "Exoplanets" : k}
                  </button>
                ),
              )}
            </div>

            {/* Section Item Lists */}
            <div
              className={`space-y-0.5 overflow-y-auto pr-1 ${
                isMobile ? "max-h-[45vh]" : "max-h-[50vh]"
              }`}
            >
              {/* Section 0: Cosmic Scale Journey */}
              {section === "journey" && (
                <div className="space-y-1">
                  <div className="px-2 py-1 text-[9px] uppercase tracking-[0.18em] text-cyan-300/70 font-semibold flex items-center justify-between">
                    <span>9 Cosmic Scale Levels</span>
                    <span className="font-mono text-white/40">Step {cosmicJourneyIndex + 1}/9</span>
                  </div>
                  {JOURNEY_STEPS.filter((st) => match(st.name) || match(st.desc)).map((st) => (
                    <div
                      key={st.idx}
                      onClick={() => {
                        setCosmicJourneyIndex(st.idx);
                        st.action();
                      }}
                      className={`group flex items-center justify-between rounded-lg p-2 text-left cursor-pointer transition ${
                        cosmicJourneyIndex === st.idx
                          ? "bg-cyan-950/40 border border-cyan-500/40 text-white"
                          : "border border-transparent hover:bg-white/5 text-white/70 hover:text-white"
                      }`}
                    >
                      <div>
                        <div className="text-[11px] font-medium text-white flex items-center gap-1.5">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              cosmicJourneyIndex === st.idx ? "bg-cyan-400" : "bg-white/25"
                            }`}
                          />
                          <span>{st.name}</span>
                        </div>
                        <div className="text-[9px] text-white/40 pl-3">{st.desc}</div>
                      </div>
                      <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[9px] text-cyan-300 shrink-0">
                        {st.badge}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Section 1: Planets & Moons */}
              {section === "planets" && (
                <>
                  <Row
                    label="☉ Sun"
                    sub="G2V Star · Origin"
                    active={!visitPlanet}
                    onClick={() => setVisitPlanet(null)}
                    onDossier={() => {
                      const sun = NAMED_STARS.find((s) => s.name === "Sun");
                      if (sun) setActiveUniversalTarget(createTargetFromStar(sun));
                    }}
                  />
                  {PLANETS.filter((p) => match(p.name) || p.moons?.some((m) => match(m.name))).map(
                    (p) => (
                      <div key={p.name}>
                        <Row
                          label={p.name}
                          sub={`${(p.a / AU).toFixed(2)} AU`}
                          color={p.color}
                          active={visitPlanet === p.name}
                          onClick={() => setVisitPlanet(p.name)}
                          onDossier={() => {
                            const t = createTargetFromPlanet(p.name);
                            if (t) setActiveUniversalTarget(t);
                          }}
                        />
                        {p.moons?.map((m) => (
                          <Row
                            key={m.name}
                            label={`↳ ${m.name}`}
                            color={m.color}
                            indent
                            active={visitPlanet === moonKey(p.name, m.name)}
                            onClick={() => setVisitPlanet(moonKey(p.name, m.name))}
                            onDossier={() => {
                              const t = createTargetFromPlanet(p.name, m.name);
                              if (t) setActiveUniversalTarget(t);
                            }}
                          />
                        ))}
                      </div>
                    ),
                  )}
                </>
              )}

              {/* Section 2: Stars (Hierarchical Tree with Exoplanets) */}
              {section === "stars" && (
                <>
                  <Row
                    label="☉ Back to the Sun"
                    sub="0.00 ly"
                    active={!selected}
                    onClick={() => setSelected(null)}
                  />
                  {stars
                    .filter((s) => {
                      const sys = starExoSystems.get(s.name);
                      const planetMatch = sys?.planets.some((p) => match(p.name) || match(p.kind));
                      return (
                        match(s.name) ||
                        match(s.spectral) ||
                        match(s.constellation || "") ||
                        planetMatch
                      );
                    })
                    .map((s) => {
                      const sys = starExoSystems.get(s.name);
                      const hasConfirmed = Boolean(REAL_SYSTEMS[s.name]);
                      const isExpanded =
                        expandedStars[s.name] ??
                        (selected?.name === s.name ||
                          exoVisit?.star.name === s.name ||
                          (Boolean(lower) &&
                            sys?.planets.some((p) => match(p.name) || match(p.kind))));
                      return (
                        <div key={s.name}>
                          <div className="flex items-center gap-0.5">
                            {sys && sys.planets.length > 0 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedStars((prev) => ({
                                    ...prev,
                                    [s.name]: !isExpanded,
                                  }));
                                }}
                                title={
                                  isExpanded
                                    ? `Hide ${sys.planets.length} planets`
                                    : `Show ${sys.planets.length} planets (${hasConfirmed ? "Confirmed" : "Modelled"})`
                                }
                                className="grid h-6 w-5 shrink-0 place-items-center rounded text-[10px] text-white/45 hover:bg-white/10 hover:text-white"
                              >
                                {isExpanded ? "▾" : "▸"}
                              </button>
                            )}
                            <div className="min-w-0 flex-1">
                              <Row
                                label={hasConfirmed ? `${s.name} ★` : s.name}
                                sub={`${s.distance.toFixed(1)} ly · ${sys?.planets.length ?? 0}p`}
                                color={hasConfirmed ? "#6ee7b7" : "#cfe0ff"}
                                active={selected?.name === s.name && !exoVisit}
                                onClick={() => flyTo(s)}
                                onDossier={() => setActiveUniversalTarget(createTargetFromStar(s))}
                              />
                            </div>
                          </div>
                          {isExpanded &&
                            sys?.planets.map((p) => (
                              <Row
                                key={p.name}
                                label={`↳ ${p.name}${p.inHZ ? " · HZ" : ""}`}
                                sub={`${p.aAU.toFixed(3)} AU`}
                                color={p.color}
                                indent
                                active={exoVisit?.planet === p.name}
                                onClick={() => visitExoPlanet(s, p.name)}
                                onDossier={() =>
                                  setActiveUniversalTarget(createTargetFromExoplanet(s, p))
                                }
                              />
                            ))}
                        </div>
                      );
                    })}
                </>
              )}

              {/* Section 3: Dedicated Exoplanets & Host Systems */}
              {section === "exoplanets" && (
                <>
                  <div className="mb-1.5 flex items-center justify-between px-1.5 py-1">
                    <span className="text-[9px] uppercase tracking-[0.14em] text-emerald-300/80 font-semibold">
                      {exoFilter === "confirmed" ? "Confirmed Archive Systems" : "All Star Systems"}
                    </span>
                    <button
                      onClick={() => setExoFilter((f) => (f === "confirmed" ? "all" : "confirmed"))}
                      className="rounded border border-white/15 bg-white/5 px-1.5 py-0.5 font-mono text-[8.5px] text-white/70 transition hover:bg-white/10 hover:text-white"
                    >
                      {exoFilter === "confirmed" ? "Show +Modelled" : "Confirmed Only"}
                    </button>
                  </div>
                  {stars
                    .filter((s) => exoFilter === "all" || Boolean(REAL_SYSTEMS[s.name]))
                    .filter((s) => {
                      const sys = starExoSystems.get(s.name);
                      if (!sys) return false;
                      return (
                        match(s.name) ||
                        match(s.spectral) ||
                        match(s.constellation || "") ||
                        sys.planets.some((p) => match(p.name) || match(p.kind))
                      );
                    })
                    .map((s) => {
                      const sys = starExoSystems.get(s.name)!;
                      const isConfirmed = Boolean(REAL_SYSTEMS[s.name]);
                      return (
                        <div
                          key={s.name}
                          className="mb-2 rounded-lg border border-white/5 bg-white/[0.02] p-1"
                        >
                          <Row
                            label={`★ ${s.name}`}
                            sub={`${s.spectral} · ${s.distance.toFixed(1)} ly`}
                            color={isConfirmed ? "#6ee7b7" : "#cfe0ff"}
                            active={selected?.name === s.name && !exoVisit}
                            onClick={() => flyTo(s)}
                            onDossier={() => setActiveUniversalTarget(createTargetFromStar(s))}
                          />
                          {sys.planets
                            .filter(
                              (p) => !lower || match(s.name) || match(p.name) || match(p.kind),
                            )
                            .map((p) => (
                              <Row
                                key={p.name}
                                label={`↳ ${p.name}${p.inHZ ? " · HZ" : ""}`}
                                sub={`${p.kind} · ${p.aAU.toFixed(3)} AU`}
                                color={p.color}
                                indent
                                active={exoVisit?.planet === p.name}
                                onClick={() => visitExoPlanet(s, p.name)}
                                onDossier={() =>
                                  setActiveUniversalTarget(createTargetFromExoplanet(s, p))
                                }
                              />
                            ))}
                        </div>
                      );
                    })}
                </>
              )}

              {/* Section 4: Galaxies */}
              {section === "galaxies" && (
                <>
                  <Row
                    label="✦ Milky Way"
                    sub="Barred Spiral · 0 ly"
                    active={visitGalaxy?.name === "Milky Way"}
                    onClick={() =>
                      setVisitGalaxy({
                        name: "Milky Way",
                        x: -26_000,
                        y: 0,
                        z: 0,
                        size: 100_000,
                        distance: 0,
                        type: "Barred Spiral",
                        view: "overview",
                      })
                    }
                    onDossier={() => {
                      const mw = OBSERVATIONAL_GALAXY_CATALOG.find((g) => g.name === "Milky Way");
                      if (mw) setActiveUniversalTarget(createTargetFromGalaxy(mw));
                    }}
                  />
                  {galaxies
                    .filter((g) => match(g.name) || match(g.type))
                    .map((g) => (
                      <Row
                        key={g.name}
                        label={isDetailedGalaxy(g.name) ? `✦ ${g.name}` : g.name}
                        sub={formatLy(g.distance)}
                        color={g.color}
                        active={visitGalaxy?.name === g.name}
                        onClick={() => goGalaxy(g)}
                        onDossier={() => {
                          const gx = OBSERVATIONAL_GALAXY_CATALOG.find((x) => x.name === g.name);
                          if (gx) setActiveUniversalTarget(createTargetFromGalaxy(gx));
                        }}
                      />
                    ))}
                </>
              )}

              {/* Section 5: Deep-Space Observed Objects */}
              {section === "objects" &&
                OBJECT_CATEGORIES.map((category) => {
                  const items = OBSERVED_OBJECTS.filter(
                    (o) =>
                      o.category === category &&
                      match(`${o.name} ${o.subtype} ${o.aliases.join(" ")}`),
                  );
                  if (!items.length) return null;
                  return (
                    <div key={category} className="pb-2">
                      <div className="px-2 pb-1 pt-2 text-[9px] uppercase tracking-[0.18em] text-cyan-300/60 font-semibold">
                        {category}
                      </div>
                      {items.map((o) => (
                        <Row
                          key={o.id}
                          label={o.name}
                          sub={o.subtype.split(" /")[0]}
                          color={o.color}
                          active={selectedObjectId === o.id}
                          onClick={() => setSelectedObject(o.id)}
                          onDossier={() =>
                            setActiveUniversalTarget(createTargetFromObservedObject(o))
                          }
                        />
                      ))}
                    </div>
                  );
                })}
            </div>

            {/* Bottom External Modules & Labs */}
            <div className="mt-2 space-y-1.5 border-t border-white/10 pt-2">
              <button
                onClick={() => {
                  useStore.getState().setCompactObjectModalOpen(true);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-md border border-purple-500/30 bg-purple-950/40 px-2.5 py-1.5 text-[11px] text-purple-200 transition hover:bg-purple-900/60 hover:text-white shadow-sm"
                title="Compact Objects Reference Gallery & Relativistic Ray-Tracing Lab"
              >
                <span className="flex items-center gap-1.5 font-medium">
                  <Radio className="size-3 text-purple-400" />
                  <span>Compact Objects Lab</span>
                </span>
                <span className="text-purple-400/60 text-xs">→</span>
              </button>

              <a
                href="/visible-universe-history"
                className="flex w-full items-center justify-between rounded-md border border-cyan-500/30 bg-cyan-950/40 px-2.5 py-1.5 text-[11px] text-cyan-200 transition hover:bg-cyan-900/60 hover:text-white shadow-sm"
                title="Visible Universe History — How Humanity Discovered the Cosmos"
              >
                <span className="flex items-center gap-1.5 font-medium">
                  <Compass className="size-3 text-cyan-400" />
                  <span>Universe History</span>
                </span>
                <span className="text-cyan-400/60 text-xs">→</span>
              </a>

              <a
                href="https://visualizemaths.ai.studio"
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-between rounded-md border border-white/15 bg-white/5 px-2.5 py-1.5 text-[10px] text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                <span>∑ Visualize astronomy maths</span>
                <span className="text-white/40">↗</span>
              </a>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function Row({
  label,
  sub,
  color,
  active,
  indent,
  onClick,
  onDossier,
}: {
  label: string;
  sub?: string;
  color?: string;
  active?: boolean;
  indent?: boolean;
  onClick: () => void;
  onDossier?: () => void;
}) {
  return (
    <div
      className={`group flex w-full items-center justify-between rounded-md px-2 py-1 text-left text-[11px] transition ${
        indent ? "pl-5" : ""
      } ${active ? "bg-cyan-500/20 text-white border border-cyan-500/30" : "text-white/70 hover:bg-white/5 hover:text-white"}`}
    >
      <button
        onClick={onClick}
        title={`Fly to ${label}`}
        className="flex flex-1 items-center gap-2 truncate text-left"
      >
        {color && (
          <span
            className="inline-block h-2 w-2 shrink-0 rounded-full"
            style={{ background: color, boxShadow: `0 0 6px ${color}` }}
          />
        )}
        <span className="truncate">{label}</span>
        {sub && (
          <span className="ml-auto shrink-0 pr-1 text-[9px] text-white/40 font-mono">{sub}</span>
        )}
      </button>
      {onDossier && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDossier();
          }}
          title={`Open 7-Tab Science Dossier for ${label}`}
          className="ml-1 opacity-0 group-hover:opacity-100 grid h-5 w-5 place-items-center rounded text-cyan-300 hover:bg-cyan-500/20 transition shrink-0"
        >
          <FileText className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
