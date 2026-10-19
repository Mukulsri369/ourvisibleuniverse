/**
 * COSMOS Stage 5 — Module 17 (The Big Bang & Early Universe)
 * Complete 8-Chapter Bespoke 3D Scene Suite (45 Canonical Explorer Narration Segments)
 *
 * Chapters:
 * 17.1 (`m17-l1`) — Expansion of Space vs Explosion in Space (3D Comoving Coordinate Grid & Bound Local Group)
 * 17.2 (`m17-l2`) — Redshift & Cosmological Lookback Time (Stretching Photon Wavepacket 1 + z = a₀/a(t))
 * 17.3 (`m17-l3`) — Running the Cosmic Film Backward (Primordial Singularity Horizon, T ∝ 1/a, Quark-Gluon Plasma)
 * 17.4 (`m17-l4`) — Big Bang Nucleosynthesis (Deuterium Bottleneck at t ≈ 180 s, ~75% ¹H & ~25% ⁴He Mass Yield)
 * 17.5 (`m17-l5`) — Recombination & the Surface of Last Scattering (378,000 yr, z ≈ 1090, Thomson Fog Clearing)
 * 17.6 (`m17-l6`) — The Cosmic Microwave Background (COBE FIRAS 2.72548 K Blackbody & Planck 10⁻⁵ Anisotropy Sphere)
 * 17.7 (`m17-l7`) — Cosmic Inflation & Early Universe Puzzles (e^(60) Exponential Flattening & Quantum Seed Perturbations)
 * 17.8 (`m17-l8`) — Module 17 Synthesis: Three Observational Pillars of the Hot Big Bang (Hubble Law, CMB, BBN)
 */

import React, { useMemo, useRef, useSyncExternalStore } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Line, Ring, Sphere, Torus } from "@react-three/drei";
import * as THREE from "three";
import type { ProofOfConceptSceneComponentId } from "@/lib/cosmos/cinematic/poc/CosmosProofOfConceptManifest";
import { CosmosChapterInteractionStore } from "@/lib/cosmos/cinematic/poc/CosmosChapterInteractionStore";

export interface Module17ChapterSceneProps {
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
    return store.getChapterValues("17", chapterId);
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
// CHAPTER 17.1 — EXPANSION OF SPACE VS EXPLOSION IN SPACE
// ============================================================================
const Ch1ExpansionOfSpaceGridScene: React.FC<Module17ChapterSceneProps> = ({
  chapterId,
  timeScale,
  isPaused,
  showLabels,
  reducedMotion,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const scaleFactorA = Number(controls.cosmicScaleFactorA ?? controls.scaleFactorA ?? 1.0);
  const observerNode = String(
    controls.referenceComovingObserver ?? controls.observerGalaxyNode ?? "milky_way",
  );

  const gridRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (isPaused || reducedMotion) return;
    if (gridRef.current) {
      gridRef.current.rotation.y += delta * 0.08 * Math.max(0.1, timeScale);
    }
  });

  // Shift comoving coordinate origin to selected observer galaxy to prove isotropic Hubble flow
  const originOffset: [number, number, number] =
    observerNode === "cluster_a"
      ? [-1.6 * scaleFactorA, 0.5 * scaleFactorA, -0.8 * scaleFactorA]
      : observerNode === "cluster_b"
        ? [1.8 * scaleFactorA, -0.4 * scaleFactorA, 1.0 * scaleFactorA]
        : [0, 0, 0];

  const latticeNodes: Array<{
    id: string;
    label: string;
    comovingPos: [number, number, number];
    color: string;
  }> = [
    { id: "milky_way", label: "Local Group (Bound)", comovingPos: [0, 0, 0], color: "#38bdf8" },
    { id: "cluster_a", label: "Coma-Analogue (100 Mpc)", comovingPos: [1.6, -0.5, 0.8], color: "#f59e0b" },
    { id: "cluster_b", label: "Hydra-Analogue (220 Mpc)", comovingPos: [-1.8, 0.4, -1.0], color: "#a855f7" },
    { id: "cluster_c", label: "Perseus-Analogue (75 Mpc)", comovingPos: [1.1, 1.2, -1.1], color: "#34d399" },
    { id: "cluster_d", label: "Shapley-Analogue (200 Mpc)", comovingPos: [-1.4, -1.1, 1.2], color: "#f43f5e" },
  ];

  const gridRange = [-2, -1, 0, 1, 2];

  return (
    <group>
      <group ref={gridRef}>
        {/* 3D Expanding Comoving Coordinate Grid */}
        <group
          position={originOffset}
          onClick={() => onSelectObject?.("comoving_expansion_grid")}
        >
          {gridRange.map((gx) =>
            gridRange.map((gy) => (
              <Line
                key={`z-${gx}-${gy}`}
                points={[
                  [gx * 1.15 * scaleFactorA, gy * 1.15 * scaleFactorA, -2.3 * scaleFactorA],
                  [gx * 1.15 * scaleFactorA, gy * 1.15 * scaleFactorA, 2.3 * scaleFactorA],
                ]}
                color="#475569"
                lineWidth={0.9}
                transparent
                opacity={0.45}
              />
            )),
          )}
          {gridRange.map((gy) =>
            gridRange.map((gz) => (
              <Line
                key={`x-${gy}-${gz}`}
                points={[
                  [-2.3 * scaleFactorA, gy * 1.15 * scaleFactorA, gz * 1.15 * scaleFactorA],
                  [2.3 * scaleFactorA, gy * 1.15 * scaleFactorA, gz * 1.15 * scaleFactorA],
                ]}
                color="#475569"
                lineWidth={0.9}
                transparent
                opacity={0.45}
              />
            )),
          )}

          {/* Galaxy Cluster Comoving Nodes (Fixed Comoving Coordinates, Stretching Proper Distances) */}
          {latticeNodes.map((node) => {
            const px = node.comovingPos[0] * scaleFactorA;
            const py = node.comovingPos[1] * scaleFactorA;
            const pz = node.comovingPos[2] * scaleFactorA;
            const isObserver = node.id === observerNode;
            return (
              <group key={node.id} position={[px, py, pz]}>
                {/* Fixed-radius bound galaxy disk (proving bound structures do NOT expand with a(t)) */}
                <Torus args={[0.26, 0.045, 12, 32]} rotation={[Math.PI / 3, 0.3, 0]}>
                  <meshStandardMaterial
                    color={node.color}
                    emissive={node.color}
                    emissiveIntensity={isObserver ? 1.4 : 0.85}
                  />
                </Torus>
                <Sphere args={[0.09, 16, 16]}>
                  <meshBasicMaterial color="#ffffff" />
                </Sphere>
                {isObserver && (
                  <Ring args={[0.36, 0.42, 32]} rotation={[Math.PI / 2, 0, 0]}>
                    <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} />
                  </Ring>
                )}
                <SceneLabel
                  position={[0, 0.48, 0]}
                  title={isObserver ? `OBSERVER: ${node.label.toUpperCase()}` : node.label}
                  subtitle={
                    isObserver
                      ? "Sees all distant clusters recede isotropically (v = H₀ d)"
                      : `Proper d(t) = a(t)·χ = ${scaleFactorA.toFixed(2)}× comoving`
                  }
                  color={node.color}
                  visible={showLabels}
                />
              </group>
            );
          })}
        </group>
      </group>

      <SceneLabel
        position={[0, -3.3, 0]}
        title={`METRIC EXPANSION OF SPACE • SCALE FACTOR a(t) = ${scaleFactorA.toFixed(2)}`}
        subtitle="No spatial center • No outer edge • Bound galaxies remain fixed in size while intergalactic metric stretches"
        color="#f59e0b"
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// CHAPTER 17.2 — REDSHIFT & COSMOLOGICAL LOOKBACK TIME
// ============================================================================
const Ch2CosmologicalRedshiftWaveScene: React.FC<Module17ChapterSceneProps> = ({
  chapterId,
  timeScale,
  isPaused,
  showLabels,
  reducedMotion,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const z = Number(controls.emissionRedshiftZ ?? 3.0);
  const aEmit = 1 / (1 + z);
  const lambdaRestNm = 121.6;
  const lambdaObsNm = lambdaRestNm * (1 + z);
  const tLookbackGyr = 13.8 * (1 - Math.pow(1 + z, -1.5));

  const phaseRef = useRef(0);
  useFrame((_, delta) => {
    if (isPaused || reducedMotion) return;
    phaseRef.current += delta * 3.5 * Math.max(0.1, timeScale);
  });

  // Build stretching wavepacket from emitter (x = -3.8) to observer (x = +3.8)
  const wavePoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    const steps = 160;
    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      const x = -3.6 + u * 7.2;
      // Local wavelength stretches progressively from rest to (1+z)
      const localStretch = 1 + u * Math.min(z, 6.5) * 0.45;
      const k = 18 / localStretch;
      const y = Math.sin(u * k) * 0.65;
      const zCoord = Math.cos(u * k) * 0.22;
      pts.push([x, y, zCoord]);
    }
    return pts;
  }, [z]);

  const waveColor =
    lambdaObsNm < 450
      ? "#60a5fa"
      : lambdaObsNm < 620
        ? "#fbbf24"
        : lambdaObsNm < 1000
          ? "#ef4444"
          : "#dc2626";

  return (
    <group onClick={() => onSelectObject?.("comoving_expansion_grid")}>
      {/* High-z Emitting Galaxy at Lookback Epoch */}
      <group position={[-3.8, 0, 0]}>
        <Sphere args={[0.52, 24, 24]}>
          <meshStandardMaterial color="#38bdf8" emissive="#2563eb" emissiveIntensity={1.1} />
        </Sphere>
        <Torus args={[0.85, 0.08, 12, 40]} rotation={[1.1, 0.4, 0]}>
          <meshStandardMaterial color="#60a5fa" emissive="#3b82f6" emissiveIntensity={0.8} />
        </Torus>
        <SceneLabel
          position={[0, 1.35, 0]}
          title={`EMISSION EPOCH (z = ${z.toFixed(1)}, a = ${aEmit.toFixed(3)})`}
          subtitle={`Rest Ly-α λ_emit = ${lambdaRestNm.toFixed(1)} nm (UV) • t_lookback ≈ ${tLookbackGyr.toFixed(2)} Gyr`}
          color="#38bdf8"
          visible={showLabels}
        />
      </group>

      {/* Cosmologically Stretching Photon Wavepacket */}
      <Line points={wavePoints} color={waveColor} lineWidth={3.2} />

      {/* Observer Telescope (JWST / Earth Today at a₀ = 1.0) */}
      <group position={[3.8, 0, 0]}>
        <Torus args={[0.68, 0.09, 16, 6]} rotation={[0, Math.PI / 2, 0]}>
          <meshStandardMaterial color="#fbbf24" metalness={0.85} roughness={0.2} />
        </Torus>
        <Sphere args={[0.25, 16, 16]}>
          <meshStandardMaterial color="#fef08a" emissive="#f59e0b" emissiveIntensity={0.9} />
        </Sphere>
        <SceneLabel
          position={[0, 1.35, 0]}
          title={`OBSERVED TODAY (a₀ = 1.000)`}
          subtitle={`λ_obs = λ_emit(1+z) = ${lambdaObsNm.toFixed(1)} nm (${lambdaObsNm > 700 ? "Infrared" : "Optical/UV"})`}
          color="#fbbf24"
          visible={showLabels}
        />
      </group>

      <SceneLabel
        position={[0, -2.5, 0]}
        title="COSMOLOGICAL REDSHIFT: 1 + z = λ_obs / λ_emit = a₀ / a(t_emit)"
        subtitle="Wavelength stretches in direct proportion to the expansion of space during photon transit"
        color={waveColor}
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// CHAPTER 17.3 — RUNNING THE COSMIC FILM BACKWARD: HOT BIG BANG THERMODYNAMICS
// ============================================================================
const Ch3ReverseCosmicTimelineScene: React.FC<Module17ChapterSceneProps> = ({
  chapterId,
  timeScale,
  isPaused,
  showLabels,
  reducedMotion,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const log10TimeSec = Number(controls.log10CosmicTimeSec ?? 2.25);
  const timeSec = Math.pow(10, log10TimeSec);
  const tempK =
    timeSec < 1e13 ? 1e10 / Math.sqrt(Math.max(1e-12, timeSec)) : 2.7255;

  // Normalized radius shrinks as we rewind toward t -> 0
  const horizonRadius = Math.max(0.55, Math.min(3.4, 0.55 + ((log10TimeSec + 12) / 29.6) * 2.85));
  const plasmaColor =
    tempK > 1e12
      ? "#e0f2fe"
      : tempK > 1e8
        ? "#fef08a"
        : tempK > 3000
          ? "#f97316"
          : "#38bdf8";

  const pulseRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (isPaused || reducedMotion) return;
    if (pulseRef.current) {
      pulseRef.current.rotation.y += delta * 0.25 * Math.max(0.1, timeScale);
      pulseRef.current.rotation.x += delta * 0.12 * Math.max(0.1, timeScale);
    }
  });

  return (
    <group onClick={() => onSelectObject?.("bbn_nuclear_reactor_core")}>
      <group ref={pulseRef}>
        <Sphere args={[horizonRadius, 40, 40]}>
          <meshStandardMaterial
            color={plasmaColor}
            emissive={plasmaColor}
            emissiveIntensity={tempK > 3000 ? 1.25 : 0.45}
            transparent
            opacity={tempK > 3000 ? 0.82 : 0.28}
            wireframe={tempK <= 3000}
          />
        </Sphere>
        <Ring args={[horizonRadius * 1.15, horizonRadius * 1.22, 64]} rotation={[Math.PI / 2, 0, 0]}>
          <meshBasicMaterial color={plasmaColor} side={THREE.DoubleSide} transparent opacity={0.65} />
        </Ring>
      </group>

      <SceneLabel
        position={[0, horizonRadius + 1.1, 0]}
        title={`PRIMORDIAL THERMODYNAMICS • log₁₀(t/s) = ${log10TimeSec.toFixed(2)}`}
        subtitle={`T(a) ∝ 1/a(t) ≈ ${tempK >= 1e6 ? tempK.toExponential(2) : tempK.toFixed(1)} K • ρ_r ∝ a⁻⁴`}
        color={plasmaColor}
        visible={showLabels}
      />

      <SceneLabel
        position={[0, -3.1, 0]}
        title="EPISTEMIC BOUNDARY AT t → 0 (PLANCK SCALE t_P ≈ 5.4 × 10⁻⁴⁴ s)"
        subtitle="Classical GR predicts a singularity, signaling the need for Quantum Gravity beyond the Planck energy (10¹⁹ GeV)"
        color="#f43f5e"
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// CHAPTER 17.4 — BIG BANG NUCLEOSYNTHESIS (THE FIRST THREE MINUTES)
// ============================================================================
const Ch4BigBangNucleosynthesisReactorScene: React.FC<Module17ChapterSceneProps> = ({
  chapterId,
  timeScale,
  isPaused,
  showLabels,
  reducedMotion,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const bbnTimeSec = Number(controls.bbnTimeSec ?? 180);
  const baryonEta10 = Number(controls.baryonToPhotonEta10 ?? 6.1);

  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (isPaused || reducedMotion) return;
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.22 * Math.max(0.1, timeScale);
    }
  });

  const bottleneckBroken = bbnTimeSec >= 180;
  const heliumMassFraction = bottleneckBroken
    ? Math.min(0.26, 0.245 + (baryonEta10 - 6.1) * 0.002)
    : 0.001;

  return (
    <group onClick={() => onSelectObject?.("bbn_nuclear_reactor_core")}>
      <group ref={groupRef}>
        {/* Left: Free Protons (¹H ~ 75% by mass) */}
        {[-2.6, -2.0, -1.4, -2.3, -1.7, -2.1, -1.5].map((x, idx) => (
          <Sphere
            key={`p-${idx}`}
            position={[
              x,
              Math.sin(idx * 1.7) * 1.1,
              Math.cos(idx * 2.1) * 0.9,
            ]}
            args={[0.24, 20, 20]}
          >
            <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={0.85} />
          </Sphere>
        ))}

        {/* Center: Deuterium (²H) Bottleneck Gate (E_bind = 2.22 MeV) */}
        <group position={[0, 0, 0]}>
          <Torus args={[1.05, 0.06, 16, 48]}>
            <meshStandardMaterial
              color={bottleneckBroken ? "#10b981" : "#f59e0b"}
              emissive={bottleneckBroken ? "#059669" : "#d97706"}
              emissiveIntensity={1.0}
            />
          </Torus>
          <Sphere position={[-0.22, 0, 0]} args={[0.24, 20, 20]}>
            <meshStandardMaterial color="#ef4444" />
          </Sphere>
          <Sphere position={[0.22, 0, 0]} args={[0.24, 20, 20]}>
            <meshStandardMaterial color="#38bdf8" />
          </Sphere>
        </group>

        {/* Right: Synthesized Helium-4 Alpha Particles (⁴He ~ 25% by mass) */}
        {bottleneckBroken && (
          <group position={[2.4, 0, 0]}>
            <Sphere position={[-0.2, 0.2, 0]} args={[0.23, 20, 20]}>
              <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={0.9} />
            </Sphere>
            <Sphere position={[0.2, -0.2, 0]} args={[0.23, 20, 20]}>
              <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={0.9} />
            </Sphere>
            <Sphere position={[0.2, 0.2, 0.18]} args={[0.23, 20, 20]}>
              <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.9} />
            </Sphere>
            <Sphere position={[-0.2, -0.2, -0.18]} args={[0.23, 20, 20]}>
              <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.9} />
            </Sphere>
          </group>
        )}
      </group>

      <SceneLabel
        position={[-2.1, 1.9, 0]}
        title="PROTONS (¹H ≈ 75% MASS)"
        subtitle="n/p freezes out at ~1:6 (T ≈ 10¹⁰ K) → decays to ~1:7"
        color="#ef4444"
        visible={showLabels}
      />
      <SceneLabel
        position={[0, 1.9, 0]}
        title={
          bottleneckBroken
            ? `DEUTERIUM BOTTLENECK CLEARED (t = ${bbnTimeSec} s)`
            : `DEUTERIUM BOTTLENECK ACTIVE (t = ${bbnTimeSec} s)`
        }
        subtitle="²H binding energy 2.22 MeV • Requires T < 9 × 10⁸ K"
        color={bottleneckBroken ? "#10b981" : "#f59e0b"}
        visible={showLabels}
      />
      <SceneLabel
        position={[2.4, 1.9, 0]}
        title={`HELIUM-4 YIELD Y_p = ${(heliumMassFraction * 100).toFixed(1)}%`}
        subtitle={`Y_p = 2(n/p)/[1+(n/p)] • η₁₀ = ${baryonEta10.toFixed(2)}`}
        color="#38bdf8"
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// CHAPTER 17.5 — RECOMBINATION & SURFACE OF LAST SCATTERING
// ============================================================================
const Ch5RecombinationFogClearingScene: React.FC<Module17ChapterSceneProps> = ({
  chapterId,
  timeScale,
  isPaused,
  showLabels,
  reducedMotion,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const z = Number(controls.recombinationRedshiftZ ?? 1090);
  const tempK = 2.72548 * (1 + z);
  const xIon = 1 / (1 + Math.exp((1090 - z) / 45));

  const fogRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (isPaused || reducedMotion) return;
    if (fogRef.current) {
      fogRef.current.rotation.y += delta * 0.16 * Math.max(0.1, timeScale);
    }
  });

  return (
    <group onClick={() => onSelectObject?.("cmb_last_scattering_sphere")}>
      <group ref={fogRef}>
        {/* Thomson Scattering Electron-Baryon Fog Sphere (Opaque when x_e ~ 1, Transparent when x_e -> 0) */}
        <Sphere args={[2.8, 36, 36]}>
          <meshStandardMaterial
            color="#fb923c"
            emissive="#ea580c"
            emissiveIntensity={0.4 + xIon * 1.1}
            transparent
            opacity={0.12 + xIon * 0.72}
          />
        </Sphere>

        {/* Free-streaming CMB Photon Rays emerging as x_e drops */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const angle = (i / 8) * Math.PI * 2;
          const rStart = 1.2;
          const rEnd = 1.4 + (1 - xIon) * 3.0;
          return (
            <Line
              key={`ray-${i}`}
              points={[
                [Math.cos(angle) * rStart, Math.sin(angle * 2) * 0.5, Math.sin(angle) * rStart],
                [Math.cos(angle) * rEnd, Math.sin(angle * 2) * 0.9, Math.sin(angle) * rEnd],
              ]}
              color="#fde047"
              lineWidth={2.5}
            />
          );
        })}
      </group>

      <SceneLabel
        position={[0, 3.3, 0]}
        title={`RECOMBINATION EPOCH • z = ${z.toFixed(0)} (T ≈ ${tempK.toFixed(0)} K)`}
        subtitle={`Ionization Fraction x_e ≈ ${(xIon * 100).toFixed(1)}% • Surface of Last Scattering at t ≈ 378,000 yr`}
        color="#fb923c"
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// CHAPTER 17.6 — THE COSMIC MICROWAVE BACKGROUND (PLANCK SPHERE & POWER SPECTRUM)
// ============================================================================
const Ch6CmbPlanckSphereScene: React.FC<Module17ChapterSceneProps> = ({
  chapterId,
  timeScale,
  isPaused,
  showLabels,
  reducedMotion,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const contrastGain = Number(controls.cmbContrastAmplification ?? 100000);
  const omegaB = Number(controls.baryonDensityOmegaBh2 ?? 0.0224);

  const sphereRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (isPaused || reducedMotion) return;
    if (sphereRef.current) {
      sphereRef.current.rotation.y += delta * 0.14 * Math.max(0.1, timeScale);
    }
  });

  // Acoustic peak curve (multipole l = 2 to 1000)
  const peakCurve = useMemo(() => {
    const pts: [number, number, number][] = [];
    const peakRatio = (omegaB / 0.0224) * 2.15;
    for (let i = 0; i <= 80; i++) {
      const u = i / 80;
      const x = -2.8 + u * 5.6;
      const l = u * 1000;
      const p1 = 1.65 * Math.exp(-Math.pow((l - 220) / 85, 2));
      const p2 = (1.65 / Math.max(1.1, peakRatio)) * Math.exp(-Math.pow((l - 540) / 90, 2));
      const p3 = 0.72 * Math.exp(-Math.pow((l - 810) / 95, 2));
      const y = -2.2 + 0.25 + p1 + p2 + p3;
      pts.push([x, y, 1.2]);
    }
    return pts;
  }, [omegaB]);

  return (
    <group onClick={() => onSelectObject?.("cmb_last_scattering_sphere")}>
      <group ref={sphereRef} position={[0, 0.55, 0]}>
        <Sphere args={[2.35, 48, 48]}>
          <meshStandardMaterial
            color={contrastGain > 1000 ? "#0284c7" : "#10b981"}
            emissive={contrastGain > 1000 ? "#f59e0b" : "#059669"}
            emissiveIntensity={contrastGain > 1000 ? 0.75 : 0.35}
            roughness={0.35}
          />
        </Sphere>
        {/* Sound horizon 1° acoustic rings (l1 ≈ 220) */}
        {[-0.8, 0, 0.8].map((lat, idx) => (
          <Ring
            key={`spot-${idx}`}
            position={[Math.sin(idx * 2.1) * 1.8, lat, Math.cos(idx * 2.1) * 1.5]}
            args={[0.25, 0.38, 32]}
          >
            <meshBasicMaterial
              color={idx % 2 === 0 ? "#ef4444" : "#38bdf8"}
              side={THREE.DoubleSide}
              transparent
              opacity={contrastGain > 1000 ? 0.88 : 0.05}
            />
          </Ring>
        ))}
      </group>

      {/* Angular Power Spectrum C_l curve */}
      <Line points={peakCurve} color="#fbbf24" lineWidth={3.0} />

      <SceneLabel
        position={[0, 3.35, 0]}
        title={`PLANCK CMB ANISOTROPY SPHERE • T₀ = 2.72548 ± 0.00057 K`}
        subtitle={`Contrast ${contrastGain.toLocaleString()}× (ΔT/T ≈ 10⁻⁵) • Sound Horizon r_s ≈ 147 Mpc (ℓ₁ ≈ 220 ≈ 1°)`}
        color="#38bdf8"
        visible={showLabels}
      />
      <SceneLabel
        position={[0, -2.55, 1.2]}
        title={`ANGULAR POWER SPECTRUM C_ℓ • Ω_b h² = ${omegaB.toFixed(4)}`}
        subtitle="ℓ₁ ≈ 220 proves flat geometry (Ω_K ≈ 0) • Odd/even peak ratio measures baryon loading"
        color="#fbbf24"
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// CHAPTER 17.7 — COSMIC INFLATION & EARLY UNIVERSE PUZZLES
// ============================================================================
const Ch7CosmicInflationCurvatureScene: React.FC<Module17ChapterSceneProps> = ({
  chapterId,
  showLabels,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const nEfolds = Number(controls.inflationEfoldsN ?? 60);
  const flattenFactor = Math.min(1, nEfolds / 60);

  // Curved manifold that flattens exponentially as e-folds approach 60
  const gridLines = useMemo(() => {
    const lines: [number, number, number][][] = [];
    for (let row = -3; row <= 3; row++) {
      const pts: [number, number, number][] = [];
      for (let col = -20; col <= 20; col++) {
        const x = (col / 20) * 3.6;
        const z = (row / 3) * 2.4;
        const curvatureHeight = (1 - flattenFactor) * 1.45 * Math.cos((x / 3.6) * 1.3) * Math.cos((z / 2.4) * 1.1);
        pts.push([x, curvatureHeight - 0.4, z]);
      }
      lines.push(pts);
    }
    return lines;
  }, [flattenFactor]);

  return (
    <group onClick={() => onSelectObject?.("comoving_expansion_grid")}>
      {gridLines.map((pts, idx) => (
        <Line
          key={`infl-${idx}`}
          points={pts}
          color={nEfolds >= 55 ? "#10b981" : "#f59e0b"}
          lineWidth={2.2}
        />
      ))}

      <SceneLabel
        position={[0, 2.5, 0]}
        title={`INFLATIONARY E-FOLDS N = ${nEfolds} (STRETCH FACTOR e^N ≈ 10^${(nEfolds * 0.4343).toFixed(1)})`}
        subtitle={
          nEfolds >= 55
            ? "Horizon & Flatness Problems Solved (|Ω_K| < 0.002) • [Theoretical Extension Under Study]"
            : "Insufficient e-folds (N < 50): Residual spatial curvature and disconnected causal horizons remain"
        }
        color={nEfolds >= 55 ? "#10b981" : "#f59e0b"}
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// CHAPTER 17.8 — MODULE 17 SYNTHESIS: THREE OBSERVATIONAL PILLARS OF BIG BANG
// ============================================================================
const Ch8ThreePillarsSynthesisScene: React.FC<Module17ChapterSceneProps> = ({
  chapterId,
  showLabels,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const focus = String(controls.pillarFocusSelection ?? "all_three_pillars");

  const pillars = [
    {
      id: "hubble_expansion",
      objectId: "comoving_expansion_grid",
      pos: [-3.1, 0, 0] as [number, number, number],
      title: "PILLAR I: HUBBLE–LEMAÎTRE EXPANSION",
      sub: "v = H₀ d • 1 + z = a₀ / a(t)",
      color: "#f59e0b",
    },
    {
      id: "bbn_abundances",
      objectId: "bbn_nuclear_reactor_core",
      pos: [0, 0, 0] as [number, number, number],
      title: "PILLAR II: PRIMORDIAL BBN YIELDS",
      sub: "~75% ¹H • ~25% ⁴He • D/H Concordance",
      color: "#ef4444",
    },
    {
      id: "cmb_radiation",
      objectId: "cmb_last_scattering_sphere",
      pos: [3.1, 0, 0] as [number, number, number],
      title: "PILLAR III: PLANCK 2.7255 K CMB",
      sub: "z ≈ 1090 Blackbody & Acoustic Peaks",
      color: "#38bdf8",
    },
  ];

  return (
    <group>
      {pillars.map((p) => {
        const active = focus === "all_three_pillars" || focus === p.id;
        return (
          <group
            key={p.id}
            position={p.pos}
            onClick={() => onSelectObject?.(p.objectId)}
          >
            <Sphere args={[active ? 1.15 : 0.82, 32, 32]}>
              <meshStandardMaterial
                color={p.color}
                emissive={p.color}
                emissiveIntensity={active ? 1.1 : 0.35}
              />
            </Sphere>
            <Torus args={[1.48, 0.05, 16, 48]} rotation={[Math.PI / 2.4, 0, 0]}>
              <meshBasicMaterial color={p.color} />
            </Torus>
            <SceneLabel
              position={[0, 1.9, 0]}
              title={p.title}
              subtitle={p.sub}
              color={p.color}
              visible={showLabels}
            />
          </group>
        );
      })}

      {/* Concordance Triangle connecting all 3 independent empirical pillars */}
      <Line
        points={[
          [-3.1, 0, 0],
          [0, 0, 0],
          [3.1, 0, 0],
        ]}
        color="#34d399"
        lineWidth={2.4}
      />

      <SceneLabel
        position={[0, -2.5, 0]}
        title="CONCORDANCE ΛCDM COSMOLOGY (Ω_b h² = 0.0224 ± 0.0001)"
        subtitle="Independent kinematics, nuclear physics (t ≈ 3 min), and atomic recombination (t ≈ 378 kyr) converge on one history"
        color="#34d399"
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// MODULE 17 DIRECTOR DISPATCHER
// ============================================================================
export const Module17CinematicDirectorScene: React.FC<Module17ChapterSceneProps> = (props) => {
  switch (props.sceneComponentId) {
    case "m17_ch1_big_bang_metric_intro":
    case "m17_ch1_expansion_of_space_grid" as ProofOfConceptSceneComponentId:
      return <Ch1ExpansionOfSpaceGridScene {...props} />;
    case "m17_ch2_primordial_plasma_thermodynamics":
    case "m17_ch3_reverse_cosmic_timeline" as ProofOfConceptSceneComponentId:
      return <Ch3ReverseCosmicTimelineScene {...props} />;
    case "m17_ch3_primordial_nucleosynthesis_bbn":
    case "m17_ch4_bbn_nuclear_reactor" as ProofOfConceptSceneComponentId:
      return <Ch4BigBangNucleosynthesisReactorScene {...props} />;
    case "m17_ch4_recombination_cmb_surface":
    case "m17_ch5_recombination_fog_clearing" as ProofOfConceptSceneComponentId:
      return <Ch5RecombinationFogClearingScene {...props} />;
    case "m17_ch5_cosmic_dark_ages_21cm":
    case "m17_ch2_cosmological_redshift_wave" as ProofOfConceptSceneComponentId:
      return <Ch2CosmologicalRedshiftWaveScene {...props} />;
    case "m17_ch6_cosmic_dawn_reionization":
    case "m17_ch6_cmb_planck_sphere" as ProofOfConceptSceneComponentId:
      return <Ch6CmbPlanckSphereScene {...props} />;
    case "m17_ch7_cosmic_noon_galaxy_evolution":
    case "m17_ch7_cosmic_inflation_curvature" as ProofOfConceptSceneComponentId:
      return <Ch7CosmicInflationCurvatureScene {...props} />;
    case "m17_ch8_modern_universe_web":
    case "m17_ch8_three_pillars_synthesis" as ProofOfConceptSceneComponentId:
      return <Ch8ThreePillarsSynthesisScene {...props} />;
    default:
      return <Ch1ExpansionOfSpaceGridScene {...props} />;
  }
};
