/**
 * COSMOS Stage 5 — Module 20 (History of Astronomy)
 * Complete 8-Chapter Bespoke 3D Scene Suite (32 Canonical Explorer Narration Segments)
 *
 * Chapters:
 * 20.1 (`m20-l1`) — Ancient Skies & Calendar Monuments (Stonehenge Solstice Axis, Babylonian Saros & Chinese 1054 AD Crab)
 * 20.2 (`m20-l2`) — Greek Geometry & Geocentric Models (Eratosthenes 7.2° Earth Radius, Hipparchus Precession & Ptolemy Epicycles)
 * 20.3 (`m20-l3`) — Islamic Golden Age & Global Astronomy (Al-Sufi Andromeda 964 AD, Ulugh Beg 40m Sextant, Aryabhata & Maya Venus)
 * 20.4 (`m20-l4`) — The Copernican Revolution (Copernicus Heliocentric Retrograde vs Tycho Brahe's ±1 Arcmin Mural Quadrant)
 * 20.5 (`m20-l5`) — Galileo, Kepler & Newton (Venus Full Phases, Kepler's 3 Elliptical Laws & Newton's Universal Gravitation)
 * 20.6 (`m20-l6`) — Spectroscopy & Astrophysics Born (Bessel 1838 Parallax 61 Cygni, Fraunhofer Lines & 1868 Solar Helium)
 * 20.7 (`m20-l7`) — Island Universes & Expanding Space (Payne-Gaposchkin 98% H/He, Leavitt P-L Law, 1920 Debate & Hubble M31 V1)
 * 20.8 (`m20-l8`) — 20th–21st Century Multi-Messenger Frontier (CMB, 6,000+ Exoplanets, LIGO GW150914/GW170817, EHT & JWST)
 */

import React, { useMemo, useRef, useSyncExternalStore } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Line, Ring, Sphere, Torus } from "@react-three/drei";
import * as THREE from "three";
import type { ProofOfConceptSceneComponentId } from "@/lib/cosmos/cinematic/poc/CosmosProofOfConceptManifest";
import { CosmosChapterInteractionStore } from "@/lib/cosmos/cinematic/poc/CosmosChapterInteractionStore";

export interface Module20ChapterSceneProps {
  sceneComponentId: ProofOfConceptSceneComponentId;
  chapterId: string;
  activeBeatIndex: number;
  highlightedObjectIds: string[];
  timeScale: number;
  isPaused: boolean;
  showLabels: boolean;
  reducedMotion: boolean;
  qualityTier?: "HIGH_QUALITY" | "BALANCED_QUALITY" | "LOW_POWER_QUALITY";
  onSelectObject?: (objectId: string) => void;
}

function useChapterControls(chapterId: string) {
  const store = CosmosChapterInteractionStore.getInstance();
  const version = useSyncExternalStore(
    (cb) => store.subscribe(cb),
    () => store.getSnapshotVersion(),
  );
  return useMemo(() => {
    void version;
    return store.getChapterValues("20", chapterId);
  }, [store, chapterId, version]);
}

function SceneLabel({
  position,
  title,
  subtitle,
  color = "#f59e0b",
  visible = true,
}: {
  position: [number, number, number];
  title: string;
  subtitle?: string;
  color?: string;
  visible?: boolean;
}) {
  if (!visible) return null;
  return (
    <Html position={position} center distanceFactor={14} zIndexRange={[10, 0]}>
      <div
        className="pointer-events-none select-none whitespace-nowrap rounded-lg border px-2.5 py-1 text-[10px] shadow-xl backdrop-blur-md"
        style={{
          borderColor: `${color}66`,
          backgroundColor: "rgba(4, 9, 22, 0.88)",
          color: "#f8fafc",
        }}
      >
        <div className="font-mono font-bold tracking-wider" style={{ color }}>
          {title}
        </div>
        {subtitle && <div className="text-[9px] text-slate-300">{subtitle}</div>}
      </div>
    </Html>
  );
}

// ============================================================================
// CHAPTER 20.1 — ANCIENT SKIES & SOLAR/LUNAR HORIZON CALENDAR MONUMENTS
// ============================================================================
const Ch1AncientHorizonMonumentsScene: React.FC<Module20ChapterSceneProps> = ({
  chapterId,
  showLabels,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const decDeg = Number(controls.solarDeclinationDeg ?? 23.44);
  const azRad = (decDeg / 23.44) * 0.65;

  const megalithCount = 12;

  return (
    <group onClick={() => onSelectObject?.("eratosthenes_and_copernican_orrery")}>
      {/* Circular Horizon Ring & Megalithic Stones */}
      <Ring args={[2.7, 2.85, 64]} rotation={[Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color="#64748b" side={THREE.DoubleSide} />
      </Ring>
      {Array.from({ length: megalithCount }).map((_, idx) => {
        const a = (idx / megalithCount) * Math.PI * 2;
        return (
          <mesh
            key={`stone-${idx}`}
            position={[Math.cos(a) * 2.5, 0.35, Math.sin(a) * 2.5]}
          >
            <boxGeometry args={[0.25, 0.7, 0.18]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.85} />
          </mesh>
        );
      })}

      {/* Sunrise Sightline Ray along Solar Declination */}
      <Line
        points={[
          [0, 0.2, 0],
          [Math.cos(azRad) * 3.4, 0.55, -Math.sin(azRad) * 3.4],
        ]}
        color="#fbbf24"
        lineWidth={3.2}
      />
      <Sphere
        position={[Math.cos(azRad) * 3.4, 0.55, -Math.sin(azRad) * 3.4]}
        args={[0.32, 24, 24]}
      >
        <meshStandardMaterial color="#fde047" emissive="#f59e0b" emissiveIntensity={1.5} />
      </Sphere>

      <SceneLabel
        position={[0, 2.3, 0]}
        title={`HORIZON ARCHEOASTRONOMY • SOLAR DECLINATION δ = ${decDeg >= 0 ? "+" : ""}${decDeg.toFixed(2)}°`}
        subtitle="Stonehenge Solstice Axis • Babylonian 18 yr 11 d Saros Cycle • Chinese 1054 AD Crab Supernova Record"
        color="#fbbf24"
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// CHAPTER 20.2 — GREEK GEOMETRY: ERATOSTHENES 7.2° & PTOLEMAIC EPICYCLES
// ============================================================================
const Ch2GreekEratosthenesPtolemyScene: React.FC<Module20ChapterSceneProps> = ({
  chapterId,
  timeScale,
  isPaused,
  showLabels,
  reducedMotion,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const shadowDeg = Number(controls.alexandriaShadowAngleDeg ?? 7.2);
  const circumferenceKm = (360 / Math.max(1, shadowDeg)) * 800;

  const epicycleRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (isPaused || reducedMotion) return;
    if (epicycleRef.current) {
      epicycleRef.current.rotation.z += delta * 0.5 * Math.max(0.1, timeScale);
    }
  });

  return (
    <group onClick={() => onSelectObject?.("eratosthenes_and_copernican_orrery")}>
      {/* Left: Eratosthenes Earth Sphere (Syene Zenith vs Alexandria 7.2° Shadow) */}
      <group position={[-2.1, 0, 0]}>
        <Sphere args={[1.35, 32, 32]}>
          <meshStandardMaterial color="#2563eb" roughness={0.6} />
        </Sphere>
        {/* Parallel Solar Rays */}
        <Line
          points={[
            [-1.35, 0.4, 0],
            [-3.2, 0.4, 0],
          ]}
          color="#fde047"
          lineWidth={2.5}
        />
        <Line
          points={[
            [-1.35, 0.95, 0],
            [-3.2, 0.95, 0],
          ]}
          color="#fde047"
          lineWidth={2.5}
        />
        <SceneLabel
          position={[0, 1.95, 0]}
          title={`ERATOSTHENES (c. 240 BCE) • θ = ${shadowDeg.toFixed(1)}°`}
          subtitle={`C = (360°/θ) × d ≈ ${circumferenceKm.toFixed(0)} km (R_⊕ ≈ ${(circumferenceKm / (2 * Math.PI)).toFixed(0)} km)`}
          color="#38bdf8"
          visible={showLabels}
        />
      </group>

      {/* Right: Ptolemaic Deferent + Epicycle Mechanism */}
      <group position={[2.1, 0, 0]}>
        <Torus args={[1.45, 0.025, 12, 64]}>
          <meshBasicMaterial color="#94a3b8" />
        </Torus>
        <group ref={epicycleRef}>
          <group position={[1.45, 0, 0]}>
            <Torus args={[0.48, 0.025, 12, 48]}>
              <meshBasicMaterial color="#f59e0b" />
            </Torus>
            <Sphere position={[0.48, 0, 0]} args={[0.16, 16, 16]}>
              <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={1.1} />
            </Sphere>
          </group>
        </group>
        <SceneLabel
          position={[0, 1.95, 0]}
          title="PTOLEMAIC DEFERENT & EPICYCLE"
          subtitle="Hipparchus 25,772-yr Precession & Almagest Geocentric Synthesis"
          color="#f59e0b"
          visible={showLabels}
        />
      </group>
    </group>
  );
};

// ============================================================================
// CHAPTER 20.3 — ISLAMIC GOLDEN AGE & GLOBAL OBSERVATORIES (40M SEXTANT)
// ============================================================================
const Ch3IslamicGlobalObservatoriesScene: React.FC<Module20ChapterSceneProps> = ({
  chapterId,
  showLabels,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const R = Number(controls.instrumentRadiusMeters ?? 40);
  const arcsecRes = (0.5 / R) * 206265 * 0.001;

  // Giant Meridian Sextant Arc (0 to 90 deg)
  const arcPoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    const scaleR = 1.2 + (R / 45) * 1.6;
    for (let i = 0; i <= 40; i++) {
      const a = (i / 40) * (Math.PI / 2);
      pts.push([-1.2 + Math.cos(a) * scaleR, -1.2 + Math.sin(a) * scaleR, 0]);
    }
    return pts;
  }, [R]);

  return (
    <group onClick={() => onSelectObject?.("eratosthenes_and_copernican_orrery")}>
      <Line points={arcPoints} color="#f59e0b" lineWidth={4.0} />

      {/* Al-Sufi's 964 AD Andromeda "Little Cloud" & Global Astronomical Centers */}
      <group position={[1.8, 0.7, 0]}>
        <Torus args={[0.85, 0.12, 16, 48]} rotation={[0.8, 0.4, 0]}>
          <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.95} />
        </Torus>
      </group>

      <SceneLabel
        position={[0, 2.3, 0]}
        title={`SAMARKAND Fakhri Sextant (R = ${R.toFixed(0)} m) • Δθ ≈ ${arcsecRes.toFixed(1)}"`}
        subtitle="Al-Sufi M31 Catalog (964 CE) • Al-Tusi Couple • Aryabhata Earth Rotation • Maya 584-Day Venus Tables"
        color="#f59e0b"
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// CHAPTER 20.4 — THE COPERNICAN REVOLUTION & TYCHO'S 8-ARCMINUTE PRECISION
// ============================================================================
const Ch4CopernicanRetrogradeOrreryScene: React.FC<Module20ChapterSceneProps> = ({
  chapterId,
  showLabels,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const phaseDeg = Number(controls.orbitalPhaseDeg ?? 180);
  const rad = (phaseDeg * Math.PI) / 180;

  // Earth (r = 1.5) overtaking Mars (r = 2.3, slower angular speed)
  const earthPos: [number, number, number] = [Math.cos(rad) * 1.5, 0, Math.sin(rad) * 1.5];
  const marsAngle = rad * 0.531;
  const marsPos: [number, number, number] = [Math.cos(marsAngle) * 2.35, 0, Math.sin(marsAngle) * 2.35];

  return (
    <group onClick={() => onSelectObject?.("eratosthenes_and_copernican_orrery")}>
      {/* Central Sun */}
      <Sphere args={[0.45, 24, 24]}>
        <meshStandardMaterial color="#fde047" emissive="#f59e0b" emissiveIntensity={1.4} />
      </Sphere>

      {/* Earth & Mars Heliocentric Orbits */}
      <Torus args={[1.5, 0.02, 12, 64]} rotation={[Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color="#38bdf8" />
      </Torus>
      <Torus args={[2.35, 0.02, 12, 64]} rotation={[Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color="#ef4444" />
      </Torus>

      <Sphere position={earthPos} args={[0.18, 20, 20]}>
        <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.9} />
      </Sphere>
      <Sphere position={marsPos} args={[0.16, 20, 20]}>
        <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={0.9} />
      </Sphere>

      {/* Line-of-sight vector from Earth through Mars projecting apparent retrograde loop */}
      <Line points={[earthPos, marsPos]} color="#fde047" lineWidth={2.5} />

      <SceneLabel
        position={[0, 2.4, 0]}
        title={`COPERNICAN HELIOCENTRIC RETROGRADE (PHASE = ${phaseDeg.toFixed(0)}°)`}
        subtitle="Faster inner Earth (29.8 km/s) overtakes Mars (24.1 km/s) • Tycho's ±1' data revealed 8' circular error"
        color="#f59e0b"
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// CHAPTER 20.5 — GALILEO'S VENUS PHASES, KEPLER'S ELLIPSES & NEWTON'S GRAVITY
// ============================================================================
const Ch5GalileoKeplerNewtonScene: React.FC<Module20ChapterSceneProps> = ({
  chapterId,
  timeScale,
  isPaused,
  showLabels,
  reducedMotion,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const a = Number(controls.semiMajorAxisAU ?? 1.524);
  const e = Number(controls.orbitalEccentricityE ?? 0.0934);
  const pYears = Math.pow(a, 1.5);

  const thetaRef = useRef(0);
  useFrame((_, delta) => {
    if (isPaused || reducedMotion) return;
    thetaRef.current += delta * 0.75 * Math.max(0.1, timeScale);
  });

  // Keplerian Ellipse r(theta) = a(1-e^2)/(1 + e cos theta)
  const ellipsePts = useMemo(() => {
    const pts: [number, number, number][] = [];
    const scale = 1.25;
    for (let i = 0; i <= 96; i++) {
      const th = (i / 96) * Math.PI * 2;
      const r = (scale * a * (1 - e * e)) / (1 + e * Math.cos(th));
      pts.push([r * Math.cos(th), 0, r * Math.sin(th)]);
    }
    return pts;
  }, [a, e]);

  return (
    <group onClick={() => onSelectObject?.("eratosthenes_and_copernican_orrery")}>
      {/* Sun at Focus (0,0,0) */}
      <Sphere args={[0.42, 24, 24]}>
        <meshStandardMaterial color="#fde047" emissive="#f59e0b" emissiveIntensity={1.5} />
      </Sphere>

      {/* Keplerian Elliptical Orbit */}
      <Line points={ellipsePts} color="#38bdf8" lineWidth={3.0} />

      {/* Galileo Full Venus Phase Indicator */}
      <Sphere position={[-1.05, 0.35, 0]} args={[0.24, 24, 24]}>
        <meshStandardMaterial color="#fef08a" emissive="#eab308" emissiveIntensity={1.1} />
      </Sphere>

      <SceneLabel
        position={[0, 2.4, 0]}
        title={`KEPLER & NEWTON SYNTHESIS • a = ${a.toFixed(3)} AU, e = ${e.toFixed(4)}`}
        subtitle={`P = a^(3/2) = ${pYears.toFixed(3)} yr • Galileo (1610): Full phases of Venus & 4 Jovian moons`}
        color="#38bdf8"
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// CHAPTER 20.6 — SPECTROSCOPY & STELLAR PARALLAX (1838 BESSEL & 1859 KIRCHHOFF)
// ============================================================================
const Ch6SpectroscopyParallaxLabScene: React.FC<Module20ChapterSceneProps> = ({
  chapterId,
  showLabels,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const pArcsec = Number(controls.parallaxAngleArcsec ?? 0.314);
  const dPc = 1 / Math.max(0.01, pArcsec);
  const dLy = dPc * 3.26156;

  // Spectral lines (H-alpha 656.3 nm, He D3 587.6 nm, H-beta 486.1 nm)
  const lines = [
    { x: -2.2, color: "#38bdf8", label: "Hβ 486.1 nm" },
    { x: 0.1, color: "#fde047", label: "He I 587.6 nm (1868 Solar)" },
    { x: 2.1, color: "#ef4444", label: "Hα 656.3 nm" },
  ];

  return (
    <group onClick={() => onSelectObject?.("spectroscopy_and_leavitt_cepheid")}>
      {/* Top: 1 AU Baseline Parallax Geometry */}
      <group position={[0, 0.85, 0]}>
        <Line
          points={[
            [-2.4, -0.8, 0],
            [0, 1.1, 0],
            [2.4, -0.8, 0],
          ]}
          color="#38bdf8"
          lineWidth={2.5}
        />
        <Sphere position={[0, 1.1, 0]} args={[0.25, 20, 20]}>
          <meshStandardMaterial color="#fde047" emissive="#f59e0b" emissiveIntensity={1.3} />
        </Sphere>
      </group>

      {/* Bottom: Fraunhofer / Kirchhoff Absorption & Helium Spectral Barcode */}
      <group position={[0, -1.25, 0]}>
        <mesh>
          <boxGeometry args={[5.8, 0.55, 0.12]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        {lines.map((l) => (
          <mesh key={l.label} position={[l.x, 0, 0.08]}>
            <boxGeometry args={[0.12, 0.58, 0.05]} />
            <meshBasicMaterial color={l.color} />
          </mesh>
        ))}
      </group>

      <SceneLabel
        position={[0, 2.55, 0]}
        title={`BESSEL PARALLAX (1838) • p = ${pArcsec.toFixed(3)}" → d = ${dPc.toFixed(2)} pc (${dLy.toFixed(1)} ly)`}
        subtitle="Kirchhoff & Bunsen (1859) Spectroscopy • Helium 587.6 nm discovered in Sun (1868) 27 yr before Earth"
        color="#38bdf8"
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// CHAPTER 20.7 — ISLAND UNIVERSES: LEAVITT CEPHEIDS, PAYNE-GAPOSCHKIN & HUBBLE
// ============================================================================
const Ch7LeavittHubbleCepheidScene: React.FC<Module20ChapterSceneProps> = ({
  chapterId,
  timeScale,
  isPaused,
  showLabels,
  reducedMotion,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const periodDays = Number(controls.cepheidPeriodDays ?? 31.4);
  const mApp = Number(controls.apparentMagnitudeM ?? 18.8);
  const Mv = -2.43 * (Math.log10(periodDays) - 1.0) - 4.05;
  const mu = mApp - Mv;
  const distKpc = Math.pow(10, (mu + 5) / 5) / 1000;

  const pulseRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (isPaused || reducedMotion || !pulseRef.current) return;
    const s = 1 + 0.18 * Math.sin(state.clock.elapsedTime * (12 / Math.sqrt(periodDays)) * Math.max(0.1, timeScale));
    pulseRef.current.scale.setScalar(s);
  });

  return (
    <group onClick={() => onSelectObject?.("spectroscopy_and_leavitt_cepheid")}>
      {/* Andromeda Spiral Disk with Pulsating Cepheid Variable V1 */}
      <Torus args={[2.3, 0.25, 20, 64]} rotation={[1.05, 0.25, 0]}>
        <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.85} />
      </Torus>

      <mesh ref={pulseRef} position={[1.45, 0.35, 0.4]}>
        <sphereGeometry args={[0.28, 24, 24]} />
        <meshStandardMaterial color="#fde047" emissive="#f59e0b" emissiveIntensity={1.6} />
      </mesh>

      <SceneLabel
        position={[0, 2.5, 0]}
        title={`LEAVITT LAW (1912) & HUBBLE M31 V1 (1923) • P = ${periodDays.toFixed(1)} d`}
        subtitle={`M_V = ${Mv.toFixed(2)} • μ = ${mu.toFixed(2)} mag → d ≈ ${distKpc.toFixed(0)} kpc • Payne-Gaposchkin (1925): 98% H/He`}
        color="#fde047"
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// CHAPTER 20.8 — 20TH–21ST CENTURY MULTI-MESSENGER FRONTIER
// ============================================================================
const Ch8MultimessengerObservatoryScene: React.FC<Module20ChapterSceneProps> = ({
  chapterId,
  timeScale,
  isPaused,
  showLabels,
  reducedMotion,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const channel = String(controls.messengerChannelSelect ?? "all_messengers");

  const waveRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (isPaused || reducedMotion) return;
    if (waveRef.current) {
      waveRef.current.rotation.z += delta * 0.45 * Math.max(0.1, timeScale);
    }
  });

  return (
    <group onClick={() => onSelectObject?.("multimessenger_observatory_nexus")}>
      {/* Left: EHT Black Hole Shadow (M87* / Sgr A*) */}
      <group position={[-2.6, 0, 0]}>
        <Sphere args={[0.55, 24, 24]}>
          <meshBasicMaterial color="#020617" />
        </Sphere>
        <Ring args={[0.62, 0.95, 48]}>
          <meshBasicMaterial
            color="#f97316"
            side={THREE.DoubleSide}
            transparent
            opacity={channel === "all_messengers" || channel === "eht_vlbi_horizon" ? 0.95 : 0.35}
          />
        </Ring>
      </group>

      {/* Center: LIGO/Virgo/KAGRA Binary Merger Gravitational-Wave Strain Ripples (h ~ 10^-21) */}
      <group ref={waveRef} position={[0, 0, 0]}>
        {[0.8, 1.35, 1.9].map((r, i) => (
          <Torus key={`gw-${i}`} args={[r, 0.03, 12, 64]}>
            <meshStandardMaterial
              color="#10b981"
              emissive="#059669"
              emissiveIntensity={
                channel === "all_messengers" || channel === "gravitational_waves_ligo" ? 1.2 : 0.35
              }
            />
          </Torus>
        ))}
      </group>

      {/* Right: JWST 6.5m Segmented Gold Primary Mirror */}
      <group position={[2.6, 0, 0]}>
        <Ring args={[0.25, 1.05, 6]}>
          <meshStandardMaterial
            color="#fbbf24"
            metalness={0.9}
            roughness={0.15}
            side={THREE.DoubleSide}
          />
        </Ring>
      </group>

      <SceneLabel
        position={[0, 2.55, 0]}
        title="MULTI-MESSENGER ASTRONOMY SYNTHESIS (PHOTONS + GWs + NEUTRINOS)"
        subtitle="1965 CMB • 1995 51 Peg b (6,000+ Exoplanets) • 2015 GW150914 • 2017 GW170817 Kilonova • 2019 EHT • 2022 JWST"
        color="#10b981"
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// MODULE 20 DIRECTOR DISPATCHER
// ============================================================================
export const Module20CinematicDirectorScene: React.FC<Module20ChapterSceneProps> = (props) => {
  switch (props.sceneComponentId) {
    case "m20_ch1_solar_red_giant_track":
    case "m20_ch1_ancient_horizon_monuments" as ProofOfConceptSceneComponentId:
      return <Ch1AncientHorizonMonumentsScene {...props} />;
    case "m20_ch2_earth_insolation_orbital_fate":
    case "m20_ch2_greek_eratosthenes_ptolemy" as ProofOfConceptSceneComponentId:
      return <Ch2GreekEratosthenesPtolemyScene {...props} />;
    case "m20_ch3_local_group_conditional_merger":
    case "m20_ch3_islamic_global_observatories" as ProofOfConceptSceneComponentId:
      return <Ch3IslamicGlobalObservatoriesScene {...props} />;
    case "m20_ch4_stellar_population_lifetimes":
    case "m20_ch4_copernican_retrograde_orrery" as ProofOfConceptSceneComponentId:
      return <Ch4CopernicanRetrogradeOrreryScene {...props} />;
    case "m20_ch5_cosmic_star_formation_decline":
    case "m20_ch5_galileo_kepler_newton" as ProofOfConceptSceneComponentId:
      return <Ch5GalileoKeplerNewtonScene {...props} />;
    case "m20_ch6_deep_time_cosmic_structures":
    case "m20_ch6_spectroscopy_parallax_lab" as ProofOfConceptSceneComponentId:
      return <Ch6SpectroscopyParallaxLabScene {...props} />;
    case "m20_ch7_hawking_evaporation_heat_death":
    case "m20_ch7_leavitt_hubble_cepheid" as ProofOfConceptSceneComponentId:
      return <Ch7LeavittHubbleCepheidScene {...props} />;
    case "m20_ch8_alternative_cosmic_fates":
    case "m20_ch8_multimessenger_observatory" as ProofOfConceptSceneComponentId:
      return <Ch8MultimessengerObservatoryScene {...props} />;
    default:
      return <Ch1AncientHorizonMonumentsScene {...props} />;
  }
};
