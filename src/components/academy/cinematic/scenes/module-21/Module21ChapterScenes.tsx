// @ts-nocheck
/**
 * COSMOS Stage 6 — Module 21 (Optical & Multi-Wavelength Telescopes)
 * Complete 8-Chapter Bespoke 3D Scene Suite (38 Canonical Explorer Narration Segments)
 *
 * Chapters:
 * 21.1 (`sub_why_telescopes`) — Why We Need Telescopes (7 mm Human Pupil vs Giant Primary Mirror Photon Bucket A ∝ D²)
 * 21.2 (`sub_refractors_reflectors`) — Refractors vs Reflectors (Yerkes 1.02m Lens Chromatic Aberration vs Cassegrain/Segmented Mirror)
 * 21.3 (`sub_resolution_rayleigh`) — Angular Resolution & Rayleigh Criterion (θ = 1.22 λ / D & Airy Disk Binary Star Separation)
 * 21.4 (`sub_em_spectrum_windows`) — The Electromagnetic Spectrum & Atmospheric Opacity Windows (Optical & Radio vs Blocked Gamma/X-Ray/UV/FIR)
 * 21.5 (`sub_space_vs_ground_ao`) — Space Observatories vs Ground Adaptive Optics (589 nm Sodium Laser Guide Star + Deformable Mirror vs L2 Space)
 * 21.6 (`sub_radio_interferometry`) — Radio Astronomy & Very Long Baseline Interferometry (10,700 km Earth-Scale EHT Virtual Aperture)
 * 21.7 (`sub_spectroscopy_ccds`) — Astronomical Spectroscopy & Modern CCD/CMOS Detectors (R = λ/Δλ Diffraction Grating & >90% Quantum Efficiency)
 * 21.8 (`sub_virtual_observatory`) — The Virtual Observatory Target Selector (Multi-Wavelength Observatory Assignment Lab)
 */

import React, { useMemo, useRef, useSyncExternalStore } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Line, Ring, Sphere, Torus } from "@react-three/drei";
import * as THREE from "three";
import type { ProofOfConceptSceneComponentId } from "@/lib/cosmos/cinematic/poc/CosmosProofOfConceptManifest";
import { CosmosChapterInteractionStore } from "@/lib/cosmos/cinematic/poc/CosmosChapterInteractionStore";

export interface Module21ChapterSceneProps {
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
    return store.getChapterValues("21", chapterId);
  }, [store, chapterId, version]);
}

function SceneLabel({
  position,
  title,
  subtitle,
  color = "#38bdf8",
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
// CHAPTER 21.1 — WHY WE NEED TELESCOPES: PHOTON BUCKET (A ∝ D²)
// ============================================================================
const Ch1PhotonBucketLightPowerScene: React.FC<Module21ChapterSceneProps> = ({
  chapterId,
  showLabels,
  isPaused,
  reducedMotion,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const apertureMeters = Math.max(0.05, Number(controls.apertureMeters ?? 6.5));
  const mirrorRadius = Math.min(2.6, 0.35 + Math.sqrt(apertureMeters) * 0.48);
  const lightGain = (apertureMeters / 0.007) ** 2;
  const photonGroupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (isPaused || reducedMotion || !photonGroupRef.current) return;
    photonGroupRef.current.position.y = ((photonGroupRef.current.position.y - delta * 2.4 + 2.5) % 4.2) - 1.7;
  });

  return (
    <group onClick={() => onSelectObject?.("cassegrain_optical_bench")}>
      {/* Left Reference: 7 mm Dark-Adapted Human Pupil */}
      <group position={[-2.9, 0, 0]}>
        <Ring args={[0.04, 0.16, 32]} rotation={[Math.PI / 2, 0, 0]}>
          <meshBasicMaterial color="#94a3b8" side={THREE.DoubleSide} />
        </Ring>
        <Sphere args={[0.04, 16, 16]}>
          <meshBasicMaterial color="#020617" />
        </Sphere>
        <SceneLabel
          position={[0, -0.75, 0]}
          title="HUMAN PUPIL (D = 7 mm)"
          subtitle="Collecting Area ≈ 38.5 mm² (Baseline 1×)"
          color="#94a3b8"
          visible={showLabels}
        />
      </group>

      {/* Right Primary Mirror Photon Bucket (A = π(D/2)²) */}
      <group position={[0.9, -0.5, 0]}>
        <Ring args={[0.18, mirrorRadius, 6]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial
            color="#fbbf24"
            metalness={0.88}
            roughness={0.18}
            side={THREE.DoubleSide}
          />
        </Ring>
        {/* Collimated Starlight Photon Stream */}
        <group ref={photonGroupRef} position={[0, 1.5, 0]}>
          {[-0.65, -0.32, 0, 0.32, 0.65].map((offset, idx) => (
            <Line
              key={`photon-ray-${idx}`}
              points={[
                [offset * mirrorRadius, 1.6, 0],
                [offset * mirrorRadius, -1.2, 0],
                [0, 0.85, 0],
              ]}
              color="#38bdf8"
              lineWidth={1.6}
            />
          ))}
        </group>
        {/* Secondary Mirror at Prime/Cassegrain Focus */}
        <Sphere args={[0.14, 20, 20]} position={[0, 1.35, 0]}>
          <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.1} />
        </Sphere>
        <SceneLabel
          position={[0, -1.15, 0]}
          title={`TELESCOPE BUCKET (D = ${apertureMeters.toFixed(2)} m)`}
          subtitle={`Light Gain = ${lightGain.toExponential(2)}× Human Eye`}
          color="#fbbf24"
          visible={showLabels}
        />
      </group>

      <SceneLabel
        position={[0, 2.55, 0]}
        title="LIGHT-GATHERING POWER SCALES AS A = π(D/2)²"
        subtitle="Primary Purpose of Astronomical Telescopes: Collect Faint Photons, Not Just Magnify"
        color="#38bdf8"
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// CHAPTER 21.2 — REFRACTORS VS REFLECTORS & SEGMENTED MIRRORS
// ============================================================================
const Ch2RefractorsVsReflectorsScene: React.FC<Module21ChapterSceneProps> = ({
  chapterId,
  showLabels,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const design = String(controls.opticalDesign ?? "segmented_reflector");

  return (
    <group onClick={() => onSelectObject?.("cassegrain_optical_bench")}>
      {/* Left: Refracting Objective Lens with RGB Chromatic Dispersion */}
      <group position={[-2.4, 0, 0]}>
        <Sphere args={[0.85, 32, 16]} scale={[0.18, 1, 1]}>
          <meshStandardMaterial
            color="#bae6fd"
            transparent
            opacity={design === "refractor_lens" ? 0.85 : 0.35}
          />
        </Sphere>
        {/* Red, Green, Blue Dispersed Focal Points (Chromatic Aberration) */}
        <Line points={[[-1.2, 0.65, 0], [0, 0.65, 0], [1.35, 0, 0]]} color="#3b82f6" lineWidth={1.8} />
        <Line points={[[-1.2, 0.65, 0], [0, 0.65, 0], [1.65, 0, 0]]} color="#22c55e" lineWidth={1.8} />
        <Line points={[[-1.2, 0.65, 0], [0, 0.65, 0], [1.95, 0, 0]]} color="#ef4444" lineWidth={1.8} />
        <SceneLabel
          position={[0.3, -1.3, 0]}
          title="REFRACTOR LENS (MAX D = 1.02 m YERKES)"
          subtitle="Chromatic Aberration (Δf_RGB) + Glass Sag Under Gravity"
          color="#f87171"
          visible={showLabels}
        />
      </group>

      {/* Right: Segmented / Cassegrain Reflector Mirror (Zero Chromatic Aberration) */}
      <group position={[2.2, 0, 0]}>
        <Ring args={[0.22, 1.15, 6]} rotation={[0, -Math.PI / 2, 0]}>
          <meshStandardMaterial
            color="#fbbf24"
            metalness={0.92}
            roughness={0.14}
            side={THREE.DoubleSide}
          />
        </Ring>
        <Line
          points={[
            [-1.5, 0.8, 0],
            [0, 0.8, 0],
            [-0.95, 0.18, 0],
            [0.35, 0, 0],
          ]}
          color="#fef08a"
          lineWidth={2.2}
        />
        <Line
          points={[
            [-1.5, -0.8, 0],
            [0, -0.8, 0],
            [-0.95, -0.18, 0],
            [0.35, 0, 0],
          ]}
          color="#fef08a"
          lineWidth={2.2}
        />
        <SceneLabel
          position={[-0.3, -1.3, 0]}
          title="CASSEGRAIN / SEGMENTED REFLECTOR (6.5m–39m)"
          subtitle="Front-Surface Reflection: All Wavelengths Share Exact Focus"
          color="#fbbf24"
          visible={showLabels}
        />
      </group>

      <SceneLabel
        position={[0, 2.5, 0]}
        title="REFRACTING LENSES VS REFLECTING & SEGMENTED MIRRORS"
        subtitle={`Active Bench Mode: ${design.replace(/_/g, " ").toUpperCase()}`}
        color="#38bdf8"
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// CHAPTER 21.3 — ANGULAR RESOLUTION & RAYLEIGH CRITERION (θ = 1.22 λ / D)
// ============================================================================
const Ch3RayleighAiryDiskScene: React.FC<Module21ChapterSceneProps> = ({
  chapterId,
  showLabels,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const apertureMeters = Math.max(0.1, Number(controls.apertureMeters ?? 2.4));
  const wavelengthNm = Math.max(100, Number(controls.wavelengthNm ?? 550));
  const thetaArcsec = 206265 * ((1.22 * (wavelengthNm * 1e-9)) / apertureMeters);
  const airyRadius = Math.min(1.35, Math.max(0.16, thetaArcsec * 2.2));
  const binarySep = 0.65;
  const isResolved = binarySep >= airyRadius * 1.1;

  return (
    <group onClick={() => onSelectObject?.("cassegrain_optical_bench")}>
      {/* Star A Airy Diffraction Pattern (Central Peak + First Bright Ring) */}
      <group position={[-binarySep / 2, 0, 0]}>
        <Sphere args={[airyRadius * 0.45, 24, 24]}>
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.85} />
        </Sphere>
        <Ring args={[airyRadius * 0.85, airyRadius * 1.05, 48]}>
          <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} transparent opacity={0.45} />
        </Ring>
      </group>

      {/* Star B Airy Diffraction Pattern */}
      <group position={[binarySep / 2, 0, 0]}>
        <Sphere args={[airyRadius * 0.45, 24, 24]}>
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.85} />
        </Sphere>
        <Ring args={[airyRadius * 0.85, airyRadius * 1.05, 48]}>
          <meshBasicMaterial color="#fbbf24" side={THREE.DoubleSide} transparent opacity={0.45} />
        </Ring>
      </group>

      <SceneLabel
        position={[0, 2.45, 0]}
        title={`RAYLEIGH CRITERION: θ = 1.22 λ / D = ${thetaArcsec.toFixed(3)} arcsec`}
        subtitle={`D = ${apertureMeters.toFixed(2)} m • λ = ${wavelengthNm} nm • Binary Pair: ${
          isResolved ? "CLEANLY RESOLVED" : "BLURRED OVERLAP (DIFFRACTION LIMITED)"
        }`}
        color={isResolved ? "#10b981" : "#f59e0b"}
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// CHAPTER 21.4 — EM SPECTRUM & ATMOSPHERIC OPACITY WINDOWS
// ============================================================================
const Ch4AtmosphericOpacityWindowsScene: React.FC<Module21ChapterSceneProps> = ({
  chapterId,
  showLabels,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const activeBand = String(controls.spectralBand ?? "infrared_jwst");

  const bands = [
    { id: "gamma_xray", label: "γ / X-Ray", x: -3.0, stopY: 1.35, color: "#a855f7", note: "Blocked at ~80 km (O₂/N₂)" },
    { id: "ultraviolet", label: "UV", x: -1.5, stopY: 0.85, color: "#6366f1", note: "Blocked by O₃ Ozone" },
    { id: "optical_visible", label: "Optical", x: 0.0, stopY: -1.4, color: "#22c55e", note: "Reaches Ground (400–700 nm)" },
    { id: "infrared_jwst", label: "Infrared", x: 1.5, stopY: 0.45, color: "#f59e0b", note: "Absorbed by H₂O / CO₂" },
    { id: "radio_cm_m", label: "Radio", x: 3.0, stopY: -1.4, color: "#38bdf8", note: "Reaches Ground (cm to ~10 m)" },
  ];

  return (
    <group onClick={() => onSelectObject?.("atmospheric_opacity_and_ao_tower")}>
      {/* Ground Surface & Atmospheric Layers */}
      <mesh position={[0, -1.5, 0]}>
        <boxGeometry args={[7.6, 0.2, 1.8]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[7.6, 1.4, 1.5]} />
        <meshBasicMaterial color="#0ea5e9" transparent opacity={0.14} />
      </mesh>

      {bands.map((b) => {
        const isSelected = b.id === activeBand;
        return (
          <group key={b.id} position={[b.x, 0, 0]}>
            <Line
              points={[
                [0, 2.2, 0],
                [0, b.stopY, 0],
              ]}
              color={b.color}
              lineWidth={isSelected ? 3.4 : 1.8}
            />
            <Sphere args={[isSelected ? 0.16 : 0.1, 16, 16]} position={[0, b.stopY, 0]}>
              <meshBasicMaterial color={b.color} />
            </Sphere>
            <SceneLabel
              position={[0, -2.05, 0]}
              title={b.label}
              subtitle={b.note}
              color={b.color}
              visible={showLabels}
            />
          </group>
        );
      })}

      <SceneLabel
        position={[0, 2.65, 0]}
        title="ATMOSPHERIC TRANSMISSION WINDOWS (O₃, H₂O, CO₂ & IONOSPHERE)"
        subtitle="Only Optical (400–700 nm) and Centimeter–Meter Radio Reach Sea Level Unimpeded"
        color="#38bdf8"
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// CHAPTER 21.5 — SPACE OBSERVATORIES VS GROUND ADAPTIVE OPTICS (AO)
// ============================================================================
const Ch5AdaptiveOpticsVsSpaceScene: React.FC<Module21ChapterSceneProps> = ({
  chapterId,
  showLabels,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const aoEnabled = Boolean(controls.adaptiveOpticsEnabled ?? true);
  const strehlRatio = aoEnabled ? 0.78 : 0.08;

  return (
    <group onClick={() => onSelectObject?.("atmospheric_opacity_and_ao_tower")}>
      {/* Ground Observatory Dome + 589 nm Sodium Laser Guide Star Beam */}
      <group position={[-1.8, -1.2, 0]}>
        <Sphere args={[0.75, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]}>
          <meshStandardMaterial color="#cbd5e1" metalness={0.5} roughness={0.3} />
        </Sphere>
        {aoEnabled && (
          <Line
            points={[
              [0, 0.65, 0],
              [0, 3.1, 0],
            ]}
            color="#f59e0b"
            lineWidth={2.8}
          />
        )}
        <SceneLabel
          position={[0, -0.55, 0]}
          title={aoEnabled ? "589 nm SODIUM LASER GUIDE STAR + 1 kHz DM" : "UNCORRECTED ATMOSPHERIC SEEING (~1.0″)"}
          subtitle={`Strehl Ratio S ≈ ${strehlRatio.toFixed(2)} • PSF FWHM ≈ ${aoEnabled ? "0.04″" : "0.95″"}`}
          color={aoEnabled ? "#f59e0b" : "#94a3b8"}
          visible={showLabels}
        />
      </group>

      {/* Space Observatory at Sun-Earth L2 (JWST) */}
      <group position={[2.1, 0.85, 0]} onClick={(e) => { e.stopPropagation(); onSelectObject?.("jwst_space_observatory"); }}>
        <Ring args={[0.2, 0.95, 6]}>
          <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.15} side={THREE.DoubleSide} />
        </Ring>
        <mesh position={[0, -0.55, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.9, 1.1]} />
          <meshStandardMaterial color="#e2e8f0" side={THREE.DoubleSide} />
        </mesh>
        <SceneLabel
          position={[0, -1.25, 0]}
          title="JWST AT SUN-EARTH L2 (1.5M km, ~40 K)"
          subtitle="Zero Atmospheric Turbulence & Zero Sky Thermal Glow"
          color="#fbbf24"
          visible={showLabels}
        />
      </group>

      <SceneLabel
        position={[0, 2.55, 0]}
        title="GROUND ADAPTIVE OPTICS (AO) VS SPACE OBSERVATORIES"
        subtitle="Real-Time Wavefront Sensing Flattens Atmospheric Seeing; Space Unlocks Blocked IR/UV/X-Ray"
        color="#38bdf8"
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// CHAPTER 21.6 — RADIO INTERFEROMETRY & EARTH-SCALE VLBI (EHT)
// ============================================================================
const Ch6RadioVlbiInterferometryScene: React.FC<Module21ChapterSceneProps> = ({
  chapterId,
  showLabels,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const baselineKm = Math.max(1, Number(controls.baselineKm ?? 10700));
  const baselineFrac = Math.min(1, baselineKm / 10700);
  const thetaMicroArcsec = 206265e6 * (0.0013 / (baselineKm * 1000));

  const stations: [number, number, number][] = [
    [-0.95 * baselineFrac, 0.55 * baselineFrac, 0.95],
    [0.85 * baselineFrac, -0.65 * baselineFrac, 0.92],
    [-0.35 * baselineFrac, -1.05 * baselineFrac, 0.65],
    [0.65 * baselineFrac, 0.78 * baselineFrac, 0.85],
  ];

  return (
    <group onClick={() => onSelectObject?.("vlbi_earth_baseline_globe")}>
      {/* Earth Globe with Synchronized VLBI Radio Stations */}
      <Sphere args={[1.35, 36, 36]}>
        <meshStandardMaterial color="#0f172a" roughness={0.65} metalness={0.2} />
      </Sphere>
      <Sphere args={[1.37, 24, 24]}>
        <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.18} />
      </Sphere>

      {/* Atomic-Clock Synchronized VLBI Baseline Chords */}
      {stations.map((pos, i) =>
        stations.slice(i + 1).map((pos2, j) => (
          <Line
            key={`baseline-${i}-${j}`}
            points={[pos, pos2]}
            color="#fbbf24"
            lineWidth={2.0}
          />
        )),
      )}

      {/* Reconstructed EHT M87* / Sgr A* Ring Preview */}
      <group position={[2.8, 0.4, 0]}>
        <Torus args={[0.58, 0.14, 16, 48]}>
          <meshStandardMaterial color="#f97316" emissive="#ea580c" emissiveIntensity={1.1} />
        </Torus>
        <SceneLabel
          position={[0, -1.05, 0]}
          title="EHT RECONSTRUCTED SHADOW"
          subtitle={`θ ≈ ${thetaMicroArcsec.toFixed(1)} μas at λ = 1.3 mm`}
          color="#f97316"
          visible={showLabels}
        />
      </group>

      <SceneLabel
        position={[0, 2.55, 0]}
        title={`VERY LONG BASELINE INTERFEROMETRY (B = ${baselineKm.toLocaleString()} km)`}
        subtitle="θ ≈ λ / B: Atomic-Clock Phase Correlation Synthesizes an Earth-Sized Virtual Dish"
        color="#fbbf24"
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// CHAPTER 21.7 — ASTRONOMICAL SPECTROSCOPY & MODERN CCD/CMOS DETECTORS
// ============================================================================
const Ch7SpectroscopyCcdDetectorScene: React.FC<Module21ChapterSceneProps> = ({
  chapterId,
  showLabels,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const resolvingPowerR = Math.max(100, Number(controls.resolvingPowerR ?? 50000));
  const deltaLambdaNm = 550 / resolvingPowerR;

  return (
    <group onClick={() => onSelectObject?.("cassegrain_optical_bench")}>
      {/* Incident Starlight Beam -> Diffraction Grating -> Dispersed Spectrum */}
      <Line points={[[-3.2, 0, 0], [-1.0, 0, 0]]} color="#f8fafc" lineWidth={2.6} />
      <mesh position={[-1.0, 0, 0]} rotation={[0, 0, 0.35]}>
        <boxGeometry args={[0.14, 1.4, 0.9]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.85} roughness={0.2} />
      </mesh>

      {/* Dispersed Spectral Rainbow Fan onto Silicon CCD Sensor Array */}
      {[
        { y: 0.75, color: "#ef4444" },
        { y: 0.38, color: "#eab308" },
        { y: 0.0, color: "#22c55e" },
        { y: -0.38, color: "#3b82f6" },
        { y: -0.75, color: "#8b5cf6" },
      ].map((ray, idx) => (
        <Line
          key={`spec-ray-${idx}`}
          points={[
            [-1.0, 0, 0],
            [2.1, ray.y, 0],
          ]}
          color={ray.color}
          lineWidth={2.2}
        />
      ))}

      {/* Back-Illuminated CCD/CMOS Silicon Pixel Grid (>90% QE) */}
      <mesh position={[2.2, 0, 0]}>
        <boxGeometry args={[0.18, 2.1, 1.4]} />
        <meshStandardMaterial color="#0ea5e9" metalness={0.7} roughness={0.25} />
      </mesh>

      <SceneLabel
        position={[0, 2.5, 0]}
        title={`SPECTROSCOPY (R = λ/Δλ = ${resolvingPowerR.toLocaleString()}) & CCD QE > 90%`}
        subtitle={`Spectral Resolution Δλ = ${deltaLambdaNm.toFixed(4)} nm at 550 nm • Photoelectric Silicon Array`}
        color="#38bdf8"
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// CHAPTER 21.8 — VIRTUAL OBSERVATORY TARGET SELECTOR LAB
// ============================================================================
const Ch8VirtualObservatoryLabScene: React.FC<Module21ChapterSceneProps> = ({
  chapterId,
  showLabels,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const target = String(controls.scienceTarget ?? "high_z_first_galaxies");

  const targetMeta: Record<string, { obs: string; band: string; reason: string; color: string }> = {
    high_z_first_galaxies: {
      obs: "JWST (6.5 m Cryogenic Space IR)",
      band: "Near/Mid-Infrared (0.6–28.5 μm)",
      reason: "Cosmological redshift (1+z) shifts rest-frame UV/optical starlight into IR",
      color: "#fbbf24",
    },
    protoplanetary_dust_disks: {
      obs: "ALMA (66-Dish Atacama Array, 5,000 m)",
      band: "Millimeter / Sub-mm (0.32–3.6 mm)",
      reason: "Cold (~20 K) dust thermal continuum & CO rotational lines penetrate dark clouds",
      color: "#38bdf8",
    },
    accreting_xray_binaries: {
      obs: "Chandra X-Ray Observatory",
      band: "Soft/Hard X-Rays (0.1–10 keV)",
      reason: "10⁷ K inner accretion disk photons are completely blocked by Earth's atmosphere",
      color: "#a855f7",
    },
    event_horizon_shadow: {
      obs: "Event Horizon Telescope (Global VLBI)",
      band: "1.3 mm (230 GHz) Earth-Baseline VLBI",
      reason: "Achieves ~20 μas angular resolution needed to resolve M87* and Sgr A* shadows",
      color: "#f97316",
    },
  };

  const active = targetMeta[target] ?? targetMeta.high_z_first_galaxies;

  return (
    <group onClick={() => onSelectObject?.("jwst_space_observatory")}>
      {/* Central Observatory Assignment Nexus */}
      <Torus args={[1.65, 0.06, 16, 64]} rotation={[Math.PI / 3, 0, 0]}>
        <meshStandardMaterial color={active.color} emissive={active.color} emissiveIntensity={0.8} />
      </Torus>
      <Sphere args={[0.75, 32, 32]}>
        <meshStandardMaterial color={active.color} roughness={0.3} metalness={0.6} />
      </Sphere>

      <SceneLabel
        position={[0, 2.45, 0]}
        title={`ASSIGNED FACILITY: ${active.obs.toUpperCase()}`}
        subtitle={`${active.band} — ${active.reason}`}
        color={active.color}
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// MODULE 21 DIRECTOR DISPATCHER
// ============================================================================
export const Module21CinematicDirectorScene: React.FC<Module21ChapterSceneProps> = (props) => {
  switch (props.sceneComponentId) {
    case "m21_ch1_photon_bucket_light_power":
      return <Ch1PhotonBucketLightPowerScene {...props} />;
    case "m21_ch2_refractors_vs_reflectors":
      return <Ch2RefractorsVsReflectorsScene {...props} />;
    case "m21_ch3_rayleigh_airy_disk_resolution":
      return <Ch3RayleighAiryDiskScene {...props} />;
    case "m21_ch4_atmospheric_opacity_windows":
      return <Ch4AtmosphericOpacityWindowsScene {...props} />;
    case "m21_ch5_adaptive_optics_vs_space":
      return <Ch5AdaptiveOpticsVsSpaceScene {...props} />;
    case "m21_ch6_radio_vlbi_interferometry":
      return <Ch6RadioVlbiInterferometryScene {...props} />;
    case "m21_ch7_spectroscopy_ccd_detectors":
      return <Ch7SpectroscopyCcdDetectorScene {...props} />;
    case "m21_ch8_virtual_observatory_selector":
      return <Ch8VirtualObservatoryLabScene {...props} />;
    default:
      return <Ch1PhotonBucketLightPowerScene {...props} />;
  }
};
