// @ts-nocheck
import { GalaxyExplorer } from "./GalaxyExplorer";
import { useGalaxyJourney } from "./galaxy-journey";
import { SGR_A_DISTANCE_LY } from "@/lib/astronomy/galactic-scene";
import { formatTimeRate, SIM_SECONDS_PER_REAL_SECOND } from "./scene-controls";

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
  const settingsOpen = useStore((s) => s.navigationSettingsOpen);
  const setSettingsOpen = useStore((s) => s.setNavigationSettingsOpen);
  const [guideOpen, setGuideOpen] = useState(false);
  const [gaiaAtlasOpen, setGaiaAtlasOpen] = useState(false);
  const [solarControllerOpen, setSolarControllerOpen] = useState(false);
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="fixed left-6 top-5 z-[35] flex max-w-[calc(100vw-3rem)] items-center gap-3 text-white/80"
    >
      <button
        type="button"
        onClick={toggleCameraFree}
        aria-pressed={cameraFree}
        aria-label={cameraFree ? "Return to orbit (F)" : "Enter free look (F)"}
        title="Free look · drag to look, WASD to move (F)"
        className={`flex h-11 shrink-0 items-center gap-2 rounded-full border px-3 text-xs transition focus-visible:outline focus-visible:outline-sky-300 ${cameraFree ? "border-sky-200/50 bg-sky-300/15 text-sky-100" : "border-white/15 bg-black/30 text-white/70 hover:border-white/40 hover:text-white"}`}
      >
        <Compass className="h-4 w-4" aria-hidden="true" />
        <span>Free look</span>
      </button>
      <IconButton
        title="Settings"
        onClick={() => setSettingsOpen(!settingsOpen)}
        active={settingsOpen}
      >
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
      <div className="flex min-w-0 items-center gap-3 overflow-x-auto py-1 [&>button]:shrink-0">
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
        <MaximizeButton />
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
      </div>
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
      ["Free look", "Fly freely: drag to look, WASD to move, Q/E to rise or descend"],
      ["Maximize", "Full screen — press Esc to exit"],
      ["Gear", "Settings: zoom, free look, outer planet orbits, time and trails"],
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
      ["F", "Free look / return to orbit"],
      ["WASD · Q/E", "Travel in free look · descend / rise"],
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
          className="absolute left-0 top-12 max-h-[70vh] w-80 max-w-[calc(100vw-3rem)] overflow-y-auto rounded-xl border border-white/10 bg-black/75 p-4 backdrop-blur-md"
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
  const freeSpeed = useStore((s) => s.freeLookSpeed);
  const setFreeSpeed = useStore((s) => s.setFreeLookSpeed);
  const galacticSpeed = useStore((s) => s.galacticTravelSpeed);
  const setGalacticSpeed = useStore((s) => s.setGalacticTravelSpeed);
  const galacticDrift = useStore((s) => s.showGalacticDrift);
  const toggleDrift = useStore((s) => s.toggleGalacticDrift);
  const outerSpeed = useStore((s) => s.outerOrbitSpeed);
  const setOuterSpeed = useStore((s) => s.setOuterOrbitSpeed);
  const trailSize = useStore((s) => s.trailSize);
  const setTrailSize = useStore((s) => s.setTrailSize);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="absolute left-0 top-12 z-40 max-h-[calc(100dvh-6rem)] w-80 max-w-[calc(100vw-3rem)] overflow-y-auto rounded-xl border border-white/10 bg-black/85 p-4 backdrop-blur-md"
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
          <div className="mb-4 space-y-2 border-t border-white/10 pt-4">
            <label htmlFor="free-look-speed" className="flex justify-between text-xs text-white/80">
              <span>Free look movement</span>
              <span className="font-mono text-sky-200">{freeSpeed.toFixed(2)}×</span>
            </label>
            <input
              id="free-look-speed"
              type="range"
              min={Math.log10(0.05)}
              max={Math.log10(20)}
              step={0.01}
              value={Math.log10(freeSpeed)}
              onChange={(e) => setFreeSpeed(10 ** Number(e.target.value))}
              className="w-full accent-sky-300"
            />
            <p className="text-[11px] leading-relaxed text-white/50">
              Adapts to your current scale. At 1×, movement matches the zoom speed where you enter
              free look.
            </p>
            <button
              type="button"
              onClick={() => setFreeSpeed(1)}
              className="min-h-11 rounded border border-white/15 px-2 text-[11px] text-white/75 hover:bg-white/10"
            >
              Default · 1×
            </button>
          </div>
          <section
            className="mb-4 space-y-2 border-t border-white/10 pt-4"
            aria-label="Solar system galactic travel"
          >
            <label
              htmlFor="galactic-travel-speed"
              className="flex justify-between text-xs text-white/80"
            >
              <span>Solar system galactic travel</span>
              <span className="tabular-nums text-sky-200">
                {galacticSpeed.toLocaleString(undefined, { maximumFractionDigits: 0 })}×
              </span>
            </label>
            <input
              id="galactic-travel-speed"
              aria-label="Solar system galactic travel speed"
              type="range"
              min={0}
              max={8}
              step={0.01}
              value={Math.log10(galacticSpeed)}
              onChange={(e) => setGalacticSpeed(10 ** Number(e.target.value))}
              className="w-full accent-sky-300"
            />
            <p className="text-[11px] leading-relaxed text-white/50">
              Accelerates the Sun and the whole solar system around the Milky Way. Planet and moon
              orbits keep their own time.
            </p>
            <div className="flex flex-wrap gap-2">
              {[1, 100, 10000, 1000000].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => setGalacticSpeed(rate)}
                  className="min-h-11 rounded border border-white/15 px-2 text-[11px] text-white/75 hover:bg-white/10"
                >
                  {rate === 1 ? "Default · 1×" : rate.toLocaleString() + "×"}
                </button>
              ))}
            </div>
            {!galacticDrift && (
              <button type="button" onClick={toggleDrift} className="min-h-11 text-xs text-sky-200">
                Enable galactic motion
              </button>
            )}
          </section>
          <div className="mb-4 space-y-2 border-t border-white/10 pt-4">
            <label
              htmlFor="outer-orbit-speed"
              className="flex justify-between text-xs text-white/80"
            >
              <span>Outer planet orbits</span>
              <span className="font-mono text-sky-200">{outerSpeed.toFixed(0)}×</span>
            </label>
            <input
              id="outer-orbit-speed"
              type="range"
              min={0}
              max={Math.log10(2000)}
              step={0.01}
              value={Math.log10(outerSpeed)}
              onChange={(e) => setOuterSpeed(10 ** Number(e.target.value))}
              className="w-full accent-sky-300"
            />
            <p className="text-[11px] leading-relaxed text-white/50">
              Jupiter through Pluto. Faster revolutions make their helical trails easier to see. The
              current motion stays the default.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: "Default", rate: 1 },
                { label: "10×", rate: 10 },
                { label: "100×", rate: 100 },
                { label: "Helical view", rate: 1000 },
              ].map((p) => (
                <button
                  key={p.label}
                  type="button"
                  aria-pressed={Math.abs(outerSpeed - p.rate) < 0.01}
                  onClick={() => setOuterSpeed(p.rate)}
                  className="min-h-11 rounded border border-white/15 px-2 text-[11px] text-white/75 hover:bg-white/10 focus-visible:outline focus-visible:outline-sky-300"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
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
      className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border transition ${active ? "border-white/60 bg-white/10 text-white" : "border-white/15 text-white/60 hover:border-white/40 hover:text-white"}`}
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
  useEffect(() => {
    if (open) {
      useStore.getState().setUniversalSearchOpen(true);
      onClose();
    }
  }, [open, onClose]);
  return null;
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
  return <GalaxyExplorer />;
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
