/**
 * COSMOS Stage 4 — Module 15 (Galaxy Groups, Clusters & the Cosmic Web)
 * Complete 7-Chapter Bespoke 3D Scene Suite (42 Canonical Narration Segments)
 *
 * Chapters:
 * 15.1 (`sub-15-1-cosmic-hierarchy`)          — 5-Tier Cosmic Hierarchy (Galaxy → Group → Cluster → Laniakea → Cosmic Web)
 * 15.2 (`sub-15-2-galaxy-groups`)             — Loose vs Compact Galaxy Groups (Stephan's Quintet Shock Ridge & Virial σ_v)
 * 15.3 (`sub-15-3-galaxy-clusters`)           — Rich Galaxy Clusters: ~85% Dark Matter, ~12% Hot X-Ray ICM (10⁷–10⁸ K), ~3% Stars
 * 15.4 (`sub-15-4-superclusters-and-laniakea`) — Laniakea Supercluster (~160 Mpc): Peculiar Velocity Watershed Streamlines
 * 15.5 (`sub-15-5-cosmic-web-and-filaments`)  — Cosmic Web Filaments, Zel'dovich Pancake Walls, Cluster Nodes & WHIM
 * 15.6 (`sub-15-6-cosmic-voids`)              — Underdense Cosmic Voids (~80% Volume, δ ≈ -0.8, Outflow & Void Dwarfs)
 * 15.7 (`sub-15-7-cosmic-evolution`)          — Cosmological Structure Formation: CMB Seeds (z=1100) to Present Web (z=0)
 */

import React, { useMemo, useRef, useSyncExternalStore } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Line, Ring, Sphere } from "@react-three/drei";
import * as THREE from "three";
import type { ProofOfConceptSceneComponentId } from "@/lib/cosmos/cinematic/poc/CosmosProofOfConceptManifest";
import { CosmosChapterInteractionStore } from "@/lib/cosmos/cinematic/poc/CosmosChapterInteractionStore";
import { GalaxyParticleField } from "../../science/GalaxyParticleField";

export interface Module15ChapterSceneProps {
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
    return store.getChapterValues("15", chapterId);
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
          backgroundColor: "rgba(4, 9, 22, 0.86)",
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
// CHAPTER 15.1 — THE COSMIC HIERARCHY: FROM GALAXIES TO THE COSMIC WEB
// ============================================================================
const Ch1CosmicHierarchyLadderScene: React.FC<Module15ChapterSceneProps> = ({
  chapterId,
  timeScale,
  isPaused,
  showLabels,
  reducedMotion,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const activeTier = Math.round(Number(controls.hierarchyScaleTier ?? 3));

  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (isPaused || reducedMotion) return;
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.1 * Math.max(0.1, timeScale);
    }
  });

  const tiers = [
    {
      tier: 1,
      id: "hierarchy_tier_galaxy_frame",
      pos: [-4.4, 0, 0] as [number, number, number],
      r: 0.72,
      color: "#60a5fa",
      title: "1. GALAXY (~30 kpc)",
      sub: "Milky Way (~2×10¹¹ Stars)",
    },
    {
      tier: 2,
      id: "hierarchy_tier_group_frame",
      pos: [-2.2, 0, 0] as [number, number, number],
      r: 0.92,
      color: "#38bdf8",
      title: "2. LOCAL GROUP (~3 Mpc)",
      sub: ">80 Bound Galaxies",
    },
    {
      tier: 3,
      id: "hierarchy_tier_cluster_frame",
      pos: [0, 0, 0] as [number, number, number],
      r: 1.15,
      color: "#f43f5e",
      title: "3. RICH CLUSTER (~10 Mpc)",
      sub: "Virgo / Coma (1,000+ Galaxies)",
    },
    {
      tier: 4,
      id: "hierarchy_tier_supercluster_frame",
      pos: [2.3, 0, 0] as [number, number, number],
      r: 1.38,
      color: "#fbbf24",
      title: "4. LANIAKEA (~160 Mpc)",
      sub: "~100,000 Galaxies (Watershed)",
    },
    {
      tier: 5,
      id: "hierarchy_tier_cosmic_web_frame",
      pos: [4.6, 0, 0] as [number, number, number],
      r: 1.55,
      color: "#a855f7",
      title: "5. COSMIC WEB (>300 Mpc)",
      sub: "Filaments, Walls & Voids",
    },
  ];

  return (
    <group ref={groupRef}>
      <Line
        points={[
          [-4.4, 0, 0],
          [4.6, 0, 0],
        ]}
        color="#475569"
        lineWidth={1.8}
        dashed
        dashScale={4}
      />

      {tiers.map((t) => {
        const isSelected = activeTier === t.tier;
        return (
          <group
            key={t.id}
            position={t.pos}
            scale={isSelected ? 1.24 : 0.94}
            onClick={() => onSelectObject?.(t.id)}
          >
            <Sphere args={[t.r, 28, 28]}>
              <meshBasicMaterial
                color={t.color}
                transparent
                opacity={isSelected ? 0.28 : 0.1}
                wireframe
                depthWrite={false}
              />
            </Sphere>
            <Sphere args={[t.r * 0.42, 20, 20]}>
              <meshStandardMaterial
                color={t.color}
                emissive={t.color}
                emissiveIntensity={isSelected ? 1.5 : 0.75}
              />
            </Sphere>
            {isSelected && (
              <Ring args={[t.r * 1.05, t.r * 1.18, 48]} rotation={[Math.PI / 2, 0, 0]}>
                <meshBasicMaterial color="#fde047" side={THREE.DoubleSide} />
              </Ring>
            )}
            <SceneLabel
              position={[0, t.r + 0.75, 0]}
              title={t.title}
              subtitle={t.sub}
              color={t.color}
              visible={showLabels}
            />
          </group>
        );
      })}
    </group>
  );
};

// ============================================================================
// CHAPTER 15.2 — GALAXY GROUPS: LOOSE VS COMPACT (STEPHAN'S QUINTET)
// ============================================================================
const Ch2GalaxyGroupsCompactScene: React.FC<Module15ChapterSceneProps> = ({
  chapterId,
  timeScale,
  isPaused,
  showLabels,
  reducedMotion,
  qualityTier = "HIGH_QUALITY",
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const sigmaKms = Number(controls.groupVelocityDispersionKms ?? 240);
  const showShock = Boolean(controls.showIntergalacticShockRidge ?? true);

  const compactRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (isPaused || reducedMotion) return;
    if (compactRef.current) {
      compactRef.current.rotation.y += delta * 0.18 * (sigmaKms / 240) * Math.max(0.1, timeScale);
    }
  });

  const quintetGalaxies: [number, number, number, string][] = [
    [-0.55, 0.45, 0.2, "#fbbf24"],
    [0.52, 0.38, -0.15, "#f59e0b"],
    [0.48, -0.42, 0.18, "#60a5fa"],
    [-0.45, -0.5, -0.22, "#93c5fd"],
  ];

  return (
    <group>
      {/* Left: Loose Group (Local Group Analog ~1.5 Mpc) */}
      <group position={[-2.8, 0, 0]} onClick={() => onSelectObject?.("loose_group_envelope")}>
        <Sphere args={[2.1, 24, 24]}>
          <meshBasicMaterial
            color="#38bdf8"
            transparent
            opacity={0.08}
            wireframe
            depthWrite={false}
          />
        </Sphere>
        <group position={[-0.9, 0.4, 0]} scale={0.32}>
          <GalaxyParticleField
            radius={2.8}
            armCount={4}
            qualityTier={qualityTier}
            rotationSpeed={0.2}
          />
        </group>
        <group position={[0.9, -0.35, 0.2]} scale={0.36}>
          <GalaxyParticleField
            radius={2.8}
            armCount={2}
            qualityTier={qualityTier}
            rotationSpeed={0.2}
          />
        </group>
        <SceneLabel
          position={[0, 2.5, 0]}
          title="LOOSE GALAXY GROUP (~1–3 Mpc)"
          subtitle="Wide Separation • Slow Mergers over Billions of Years"
          color="#38bdf8"
          visible={showLabels}
        />
      </group>

      {/* Right: Compact Group (Stephan's Quintet / HCG 92 ~100 kpc Core) */}
      <group
        position={[2.5, 0, 0]}
        onClick={() => onSelectObject?.("stephans_quintet_compact_core")}
      >
        <group ref={compactRef}>
          {quintetGalaxies.map(([x, y, z, col], i) => (
            <group key={i} position={[x, y, z]}>
              <Sphere args={[0.28, 20, 20]} scale={[1.3, 0.65, 1.0]}>
                <meshStandardMaterial color={col} emissive={col} emissiveIntensity={1.2} />
              </Sphere>
              {/* Virial Velocity Vector Arrow */}
              <Line
                points={[
                  [0, 0, 0],
                  [(-y * sigmaKms) / 300, (x * sigmaKms) / 300, 0.2],
                ]}
                color="#fde047"
                lineWidth={2.0}
              />
            </group>
          ))}

          {/* Intergalactic X-ray & Warm H₂ Shock Ridge */}
          {showShock && (
            <mesh
              position={[0.05, 0, 0]}
              rotation={[0, 0, 0.35]}
              onClick={(e) => {
                e.stopPropagation();
                onSelectObject?.("intergalactic_shock_ridge");
              }}
            >
              <cylinderGeometry args={[0.18, 0.24, 1.85, 24]} />
              <meshBasicMaterial color="#ec4899" transparent opacity={0.68} />
            </mesh>
          )}
        </group>

        <SceneLabel
          position={[0, 2.5, 0]}
          title={`COMPACT GROUP (Stephan's Quintet • σ_v = ${sigmaKms.toFixed(0)} km/s)`}
          subtitle="Strong Dynamical Friction + Shocked Intergalactic H₂/X-Ray Ridge"
          color="#ec4899"
          visible={showLabels}
        />
      </group>
    </group>
  );
};

// ============================================================================
// CHAPTER 15.3 — GALAXY CLUSTERS: COSMIC METROPOLISES & X-RAY ICM
// ============================================================================
const Ch3GalaxyClustersIcmScene: React.FC<Module15ChapterSceneProps> = ({
  chapterId,
  timeScale,
  isPaused,
  showLabels,
  reducedMotion,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const layer = String(controls.clusterMultiwavelengthLayer ?? "composite_all");
  const mass14 = Number(controls.clusterVirialMass14Solar ?? 10.0);

  const swarmRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (isPaused || reducedMotion) return;
    if (swarmRef.current) {
      swarmRef.current.rotation.y += delta * 0.2 * Math.max(0.1, timeScale);
    }
  });

  const memberGalaxies = useMemo(() => {
    const list: [number, number, number, number][] = [];
    for (let i = 0; i < 64; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / 64);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const r = 0.8 + Math.pow((i % 16) / 16, 0.7) * 2.7;
      list.push([
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi) * 0.85,
        r * Math.sin(phi) * Math.sin(theta),
        0.06 + (i % 3) * 0.025,
      ]);
    }
    return list;
  }, []);

  const showOptical = layer === "composite_all" || layer === "optical_galaxies";
  const showXray = layer === "composite_all" || layer === "xray_icm_plasma";
  const showDarkMatter = layer === "composite_all" || layer === "lensing_dark_matter";
  const scaleFactor = Math.pow(mass14 / 10, 0.2);

  return (
    <group scale={scaleFactor}>
      {/* 1. Dark Matter Potential Envelope (~85% of Total Mass) */}
      {showDarkMatter && (
        <group onClick={() => onSelectObject?.("cluster_dark_matter_potential")}>
          <Sphere args={[3.9, 32, 32]}>
            <meshBasicMaterial
              color="#6366f1"
              transparent
              opacity={0.14}
              wireframe
              depthWrite={false}
            />
          </Sphere>
          <Ring args={[3.6, 3.85, 64]} rotation={[Math.PI / 2, 0, 0]}>
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.5} side={THREE.DoubleSide} />
          </Ring>
        </group>
      )}

      {/* 2. Hot Intracluster Medium (ICM) X-Ray Plasma (~12% of Total Mass, 10⁷–10⁸ K) */}
      {showXray && (
        <Sphere args={[2.75, 32, 32]} onClick={() => onSelectObject?.("hot_xray_icm_plasma_halo")}>
          <meshStandardMaterial
            color="#ec4899"
            emissive="#be185d"
            emissiveIntensity={1.1}
            transparent
            opacity={0.34}
            depthWrite={false}
          />
        </Sphere>
      )}

      {/* 3. Central BCG Elliptical & Member Galaxy Swarm (~3% of Total Mass) */}
      {showOptical && (
        <group>
          <Sphere
            args={[0.52, 24, 24]}
            scale={[1.3, 0.95, 1.0]}
            onClick={() => onSelectObject?.("central_bcg_elliptical")}
          >
            <meshStandardMaterial color="#fde68a" emissive="#f59e0b" emissiveIntensity={1.5} />
          </Sphere>

          <group ref={swarmRef} onClick={() => onSelectObject?.("cluster_member_swarm")}>
            {memberGalaxies.map(([x, y, z, r], idx) => (
              <Sphere key={idx} args={[r, 10, 10]} position={[x, y, z]}>
                <meshBasicMaterial color={idx % 4 === 0 ? "#93c5fd" : "#fcd34d"} />
              </Sphere>
            ))}
          </group>
        </group>
      )}

      <SceneLabel
        position={[0, 3.8, 0]}
        title={`RICH GALAXY CLUSTER (M_200 = ${(mass14 / 10).toFixed(2)} × 10¹⁵ M_☉)`}
        subtitle="~85% Dark Matter (Indigo) • ~12% Hot X-Ray ICM Plasma (Magenta) • ~3% Stars (Gold)"
        color="#f43f5e"
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// CHAPTER 15.4 — SUPERCLUSTERS & LANIAKEA WATERSHED BASIN
// ============================================================================
const Ch4LaniakeaSuperclusterScene: React.FC<Module15ChapterSceneProps> = ({
  chapterId,
  showLabels,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const streamGain = Number(controls.peculiarVelocityStreamIntensity ?? 1.0);
  const showWatershed = Boolean(controls.showWatershedDivergenceSurface ?? true);

  // Generate 18 peculiar velocity streamlines converging toward the Great Attractor [1.5, -0.2, 0]
  const streamlines = useMemo(() => {
    const lines: [number, number, number][][] = [];
    const attractor = new THREE.Vector3(1.5, -0.2, 0);
    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 2;
      const zOff = ((i % 3) - 1) * 1.1;
      const start = new THREE.Vector3(Math.cos(angle) * 4.4 - 0.6, Math.sin(angle) * 2.6, zOff);
      const mid = start
        .clone()
        .lerp(attractor, 0.5)
        .add(new THREE.Vector3(0, Math.sin(angle * 2) * 0.65 * streamGain, 0));
      const curve = new THREE.QuadraticBezierCurve3(start, mid, attractor);
      lines.push(curve.getPoints(24).map((p) => [p.x, p.y, p.z]));
    }
    return lines;
  }, [streamGain]);

  return (
    <group>
      {/* Laniakea Converging Velocity Streamlines */}
      <group onClick={() => onSelectObject?.("laniakea_velocity_streamlines")}>
        {streamlines.map((pts, idx) => (
          <Line
            key={idx}
            points={pts}
            color={idx % 3 === 0 ? "#fde047" : "#38bdf8"}
            lineWidth={1.8}
          />
        ))}
      </group>

      {/* Great Attractor & Norma Cluster Gravitational Focal Basin */}
      <group
        position={[1.5, -0.2, 0]}
        onClick={() => onSelectObject?.("great_attractor_norma_core")}
      >
        <Sphere args={[0.62, 28, 28]}>
          <meshStandardMaterial color="#f97316" emissive="#ea580c" emissiveIntensity={1.6} />
        </Sphere>
        <Sphere args={[1.1, 24, 24]}>
          <meshBasicMaterial color="#fdba74" transparent opacity={0.22} depthWrite={false} />
        </Sphere>
        <SceneLabel
          position={[0, 1.35, 0]}
          title="GREAT ATTRACTOR & NORMA CLUSTER"
          subtitle="Gravitational Focal Basin of Laniakea (~10¹⁷ M_☉)"
          color="#f97316"
          visible={showLabels}
        />
      </group>

      {/* Virgo Cluster & Local Group Outskirt Marker */}
      <group position={[-2.1, 0.55, 0.4]} onClick={() => onSelectObject?.("virgo_cluster_hub")}>
        <Sphere args={[0.32, 20, 20]}>
          <meshBasicMaterial color="#38bdf8" />
        </Sphere>
        <Sphere args={[0.16, 16, 16]} position={[-0.75, 0.25, 0.2]}>
          <meshBasicMaterial color="#34d399" />
        </Sphere>
        <SceneLabel
          position={[-0.4, 1.0, 0]}
          title="LOCAL GROUP & VIRGO CLUSTER (~16.5 Mpc)"
          subtitle="Infalling at v_pec ≈ 627 km/s relative to CMB"
          color="#34d399"
          visible={showLabels}
        />
      </group>

      {/* Kinematic Watershed Boundary to Perseus–Pisces */}
      {showWatershed && (
        <group
          position={[3.8, 0, 0]}
          onClick={() => onSelectObject?.("perseus_pisces_watershed_boundary")}
        >
          <Line
            points={[
              [0, -2.8, -1.2],
              [-0.4, 0, 0],
              [0, 2.8, 1.2],
            ]}
            color="#f43f5e"
            lineWidth={2.4}
            dashed
            dashScale={4}
          />
          <SceneLabel
            position={[0.4, -2.5, 0]}
            title="KINEMATIC WATERSHED SURFACE (∇ · v_pec = 0)"
            subtitle="Separates Laniakea from Perseus–Pisces (Not a Virialized Cluster)"
            color="#f43f5e"
            visible={showLabels}
          />
        </group>
      )}
    </group>
  );
};

// ============================================================================
// CHAPTER 15.5 — THE COSMIC WEB & FILAMENTS (ZEL'DOVICH COLLAPSE & WHIM)
// ============================================================================
const Ch5CosmicWebFilamentsScene: React.FC<Module15ChapterSceneProps> = ({
  chapterId,
  timeScale,
  isPaused,
  showLabels,
  reducedMotion,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const deltaThresh = Number(controls.overdensityThresholdDelta ?? 1.5);
  const showWhim = Boolean(controls.showWhimBaryonGas ?? true);

  const webRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (isPaused || reducedMotion) return;
    if (webRef.current) {
      webRef.current.rotation.y += delta * 0.08 * Math.max(0.1, timeScale);
    }
  });

  const nodes: [number, number, number][] = useMemo(
    () => [
      [0, 0, 0],
      [-3.2, 1.6, -1.0],
      [3.2, 1.5, 0.8],
      [-2.8, -1.7, 1.1],
      [2.9, -1.6, -1.1],
      [0.2, 2.4, 1.4],
      [-0.3, -2.3, -1.4],
    ],
    [],
  );

  const edges: [number, number][] = useMemo(
    () => [
      [0, 1],
      [0, 2],
      [0, 3],
      [0, 4],
      [0, 5],
      [0, 6],
      [1, 5],
      [2, 5],
      [3, 6],
      [4, 6],
      [1, 3],
      [2, 4],
    ],
    [],
  );

  return (
    <group ref={webRef}>
      {/* 1D Cosmic Web Filament Bridges */}
      <group onClick={() => onSelectObject?.("cosmic_web_filament_bridges")}>
        {edges.map(([a, b], idx) => (
          <Line
            key={idx}
            points={[nodes[a], nodes[b]]}
            color="#a855f7"
            lineWidth={Math.max(1.2, 3.8 - deltaThresh * 0.7)}
          />
        ))}
      </group>

      {/* Warm-Hot Intergalactic Medium (WHIM 10⁵–10⁷ K) */}
      {showWhim && (
        <group onClick={() => onSelectObject?.("whim_baryon_gas_streams")}>
          {edges.map(([a, b], idx) => (
            <Line
              key={`whim-${idx}`}
              points={[nodes[a], nodes[b]]}
              color="#38bdf8"
              lineWidth={5.2}
              transparent
              opacity={0.22}
            />
          ))}
        </group>
      )}

      {/* 0D Cluster Intersection Nodes */}
      <group onClick={() => onSelectObject?.("cluster_intersection_nodes")}>
        {nodes.map((pos, idx) => (
          <Sphere key={idx} args={[idx === 0 ? 0.48 : 0.32, 20, 20]} position={pos}>
            <meshStandardMaterial color="#fde047" emissive="#f59e0b" emissiveIntensity={1.5} />
          </Sphere>
        ))}
      </group>

      <SceneLabel
        position={[0, 3.4, 0]}
        title={`ZEL'DOVICH ANISOTROPIC COLLAPSE (1 + δ ≥ ${deltaThresh.toFixed(1)})`}
        subtitle="Sheets/Walls (1D Collapse) → Filaments (2D) → Cluster Nodes (3D) + WHIM Baryons"
        color="#a855f7"
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// CHAPTER 15.6 — COSMIC VOIDS: THE VAST UNDERDENSE BASINS
// ============================================================================
const Ch6CosmicVoidsBasinsScene: React.FC<Module15ChapterSceneProps> = ({
  chapterId,
  showLabels,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const deltaV = Number(controls.voidCentralDensityContrast ?? -0.82);
  const rVoidMpc = Number(controls.voidEffectiveRadiusMpc ?? 45);
  const rScene = 2.0 + ((rVoidMpc - 20) / 80) * 1.6;

  // Outward peculiar velocity arrows showing evacuation toward bounding filaments
  const outflowVectors = useMemo(() => {
    const arr: [[number, number, number], [number, number, number]][] = [];
    for (let i = 0; i < 12; i++) {
      const ang = (i / 12) * Math.PI * 2;
      const r1 = rScene * 0.42;
      const r2 = rScene * 0.88;
      arr.push([
        [Math.cos(ang) * r1, Math.sin(ang) * r1, 0],
        [Math.cos(ang) * r2, Math.sin(ang) * r2, 0],
      ]);
    }
    return arr;
  }, [rScene]);

  return (
    <group>
      {/* Central Underdense Cosmic Void Cavity */}
      <Sphere
        args={[rScene, 32, 32]}
        onClick={() => onSelectObject?.("central_cosmic_void_cavity")}
      >
        <meshBasicMaterial
          color="#0f172a"
          transparent
          opacity={0.45}
          wireframe
          depthWrite={false}
        />
      </Sphere>

      {/* Bounding Filament & Wall Shell */}
      <group onClick={() => onSelectObject?.("void_bounding_filament_shell")}>
        <Ring args={[rScene * 0.96, rScene * 1.18, 64]}>
          <meshBasicMaterial color="#a855f7" transparent opacity={0.42} side={THREE.DoubleSide} />
        </Ring>
      </group>

      {/* Outward Peculiar Velocity Evacuation Vectors */}
      <group onClick={() => onSelectObject?.("void_peculiar_outflow_vectors")}>
        {outflowVectors.map(([p1, p2], idx) => (
          <Line key={idx} points={[p1, p2]} color="#38bdf8" lineWidth={2.0} />
        ))}
      </group>

      {/* Isolated Void Dwarf Galaxies (Proving Voids ≠ Absolute Vacuum) */}
      <group onClick={() => onSelectObject?.("isolated_void_dwarf_galaxies")}>
        {[
          [-0.45, 0.25, 0.1],
          [0.52, -0.35, -0.15],
          [0.1, 0.55, 0.2],
        ].map(([x, y, z], idx) => (
          <Sphere key={idx} args={[0.1, 14, 14]} position={[x, y, z]}>
            <meshBasicMaterial color="#34d399" />
          </Sphere>
        ))}
      </group>

      <SceneLabel
        position={[0, rScene + 0.9, 0]}
        title={`COSMIC VOID BASIN (R = ${rVoidMpc.toFixed(0)} Mpc • δ_v = ${deltaV.toFixed(2)})`}
        subtitle={`~${((1 + deltaV) * 100).toFixed(0)}% of Mean Cosmic Density (NOT Complete Vacuum • Contains Void Dwarfs)`}
        color="#38bdf8"
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// CHAPTER 15.7 — HOW COSMIC STRUCTURE FORMED AND EVOLVES OVER TIME
// ============================================================================
const Ch7StructureFormationEvolutionScene: React.FC<Module15ChapterSceneProps> = ({
  chapterId,
  showLabels,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const z = Number(controls.cosmicRedshiftEpochZ ?? 0.0);
  const scaleA = 1 / (1 + z);
  const clusteringFactor = Math.pow(scaleA, 0.85); // 0 at high z -> 1 at z=0

  // 80 N-body tracer particles interpolating between uniform primordial distribution and clustered nodes
  const particlePositions = useMemo(() => {
    const nodes = [
      new THREE.Vector3(-2.0, 1.1, -0.6),
      new THREE.Vector3(2.1, 1.0, 0.5),
      new THREE.Vector3(-1.8, -1.2, 0.7),
      new THREE.Vector3(1.9, -1.1, -0.6),
      new THREE.Vector3(0, 0, 0),
    ];
    const list: [number, number, number][] = [];
    for (let i = 0; i < 75; i++) {
      const targetNode = nodes[i % nodes.length];
      const seedX = (((i * 37) % 100) / 50 - 1) * 3.4;
      const seedY = (((i * 61) % 100) / 50 - 1) * 2.2;
      const seedZ = (((i * 83) % 100) / 50 - 1) * 2.2;
      const start = new THREE.Vector3(seedX, seedY, seedZ);
      const pos = start.lerp(targetNode, clusteringFactor * 0.78);
      list.push([pos.x, pos.y, pos.z]);
    }
    return list;
  }, [clusteringFactor]);

  return (
    <group>
      {/* Comoving Simulation Box Wireframe */}
      <mesh onClick={() => onSelectObject?.("comoving_simulation_box_grid")}>
        <boxGeometry args={[7.2, 4.6, 4.6]} />
        <meshBasicMaterial color="#475569" wireframe transparent opacity={0.35} />
      </mesh>

      {/* Primordial CMB Seed Reference Plane at Bottom */}
      <mesh
        position={[0, -2.35, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={() => onSelectObject?.("cmb_primordial_seed_plane")}
      >
        <planeGeometry args={[7.2, 4.6]} />
        <meshBasicMaterial color="#0284c7" transparent opacity={0.18} side={THREE.DoubleSide} />
      </mesh>

      {/* Evolving Dark Matter & Baryon N-Body Particles */}
      <group onClick={() => onSelectObject?.("evolving_density_field_particles")}>
        {particlePositions.map((pos, idx) => (
          <Sphere key={idx} args={[0.095, 10, 10]} position={pos}>
            <meshBasicMaterial color={idx % 5 === 0 ? "#fde047" : "#a855f7"} />
          </Sphere>
        ))}
      </group>

      <SceneLabel
        position={[0, 2.85, 0]}
        title={`HIERARCHICAL ΛCDM STRUCTURE GROWTH (z = ${z.toFixed(1)} • a = ${scaleA.toFixed(3)})`}
        subtitle="Primordial CMB ΔT/T ~ 10⁻⁵ Seeds → Dwarf Halos → Spirals → Rich Clusters & Cosmic Web"
        color="#fde047"
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// MODULE 15 DIRECTOR DISPATCHER
// ============================================================================
export const Module15CinematicDirectorScene: React.FC<Module15ChapterSceneProps> = (props) => {
  switch (props.sceneComponentId) {
    case "m15_ch1_cosmic_hierarchy_ladder":
    case "m15_ch1_galaxies_not_isolated":
      return <Ch1CosmicHierarchyLadderScene {...props} />;
    case "m15_ch2_galaxy_groups_compact":
    case "m15_ch2_local_group_dynamics":
      return <Ch2GalaxyGroupsCompactScene {...props} />;
    case "m15_ch3_galaxy_clusters_icm":
    case "m15_ch3_cluster_intracluster_gas":
      return <Ch3GalaxyClustersIcmScene {...props} />;
    case "m15_ch4_laniakea_supercluster":
    case "m15_ch4_superclusters_laniakea":
      return <Ch4LaniakeaSuperclusterScene {...props} />;
    case "m15_ch5_cosmic_web_filaments":
    case "m15_ch5_cosmic_filaments_whim":
      return <Ch5CosmicWebFilamentsScene {...props} />;
    case "m15_ch6_cosmic_voids_basins":
    case "m15_ch6_cosmic_voids":
      return <Ch6CosmicVoidsBasinsScene {...props} />;
    case "m15_ch7_structure_formation_evolution":
    case "m15_ch7_structure_formation_gravity":
      return <Ch7StructureFormationEvolutionScene {...props} />;
    default:
      return <Ch1CosmicHierarchyLadderScene {...props} />;
  }
};
