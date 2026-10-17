import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import { SafeHtml as Html } from "./SafeHtml";
import { useStore } from "./store";
import {
  COSMIC_BENCHMARKS,
  generateSurveyDistributionPoints,
  SURVEY_FOOTPRINTS,
  type SurveyId,
} from "@/lib/astronomy/cosmic-web/survey-catalogs";
import {
  TNG300_METADATA,
  TNG_BENCHMARK_HALOS,
  TNG_BENCHMARK_VOIDS,
  TNG_FILAMENTS,
  generateSimulationBoxDistribution,
} from "@/lib/astronomy/cosmic-web/illustris-tng";
import {
  COSMOLOGICAL_MODELS,
  calculateCosmologicalDistances,
  type CosmologicalParameters,
} from "@/lib/astronomy/cosmology";
import { toXYZ } from "./Universe";

function makeDotTexture(): THREE.Texture {
  const size = 64;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.35, "rgba(230,245,255,0.75)");
  g.addColorStop(0.7, "rgba(180,210,255,0.25)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// -----------------------------------------------------------------------------
// MODE A: Observational Survey Distribution Point Cloud & Footprints
// -----------------------------------------------------------------------------

function ObservationalSurveyWeb() {
  const cosmologyModelKey = useStore((s) => s.cosmologyModelKey);
  const customCosmology = useStore((s) => s.customCosmology);
  const selectedSurveys = useStore((s) => s.selectedSurveys);
  const redshiftFilter = useStore((s) => s.redshiftFilter);
  const showSurveyFootprints = useStore((s) => s.showSurveyFootprints);
  const showZoneOfAvoidance = useStore((s) => s.showZoneOfAvoidance);
  const showCosmicBenchmarks = useStore((s) => s.showCosmicBenchmarks);
  const catalogDensityLevel = useStore((s) => s.catalogDensityLevel);
  const setSelectedCosmicBenchmarkId = useStore((s) => s.setSelectedCosmicBenchmarkId);

  const activeCosmology: CosmologicalParameters = useMemo(() => {
    if (cosmologyModelKey === "custom") {
      return {
        name: "Custom User Cosmology",
        description: "User customized FLRW parameters",
        h0: customCosmology.h0,
        omegaM: customCosmology.omegaM,
        omegaLambda: customCosmology.omegaLambda,
        citation: "User customized",
        bibcode: "CUSTOM",
      };
    }
    return COSMOLOGICAL_MODELS[cosmologyModelKey] ?? COSMOLOGICAL_MODELS.planck2018;
  }, [cosmologyModelKey, customCosmology]);

  // Generate survey distribution honoring masks, redshifts & cosmological model
  const rawData = useMemo(() => {
    return generateSurveyDistributionPoints(catalogDensityLevel, activeCosmology);
  }, [catalogDensityLevel, activeCosmology]);

  // Filter positions and colors based on active survey toggles and redshift range
  const { geometry, visibleCount } = useMemo(() => {
    const minZ = redshiftFilter[0];
    const maxZ = redshiftFilter[1];

    const surveyCodes: Record<number, boolean> = {
      1: selectedSurveys.sdss_dr18 ?? true,
      2: selectedSurveys["2dfgrs"] ?? true,
      3: selectedSurveys["2mrs"] ?? true,
      4: selectedSurveys.cosmicflows ?? true,
      5: selectedSurveys.deep_fields ?? true,
    };

    const count = rawData.count;
    let passing = 0;
    for (let i = 0; i < count; i++) {
      const sCode = rawData.surveyIndices[i];
      const z = rawData.redshifts[i];
      if (surveyCodes[sCode] && z >= minZ && z <= maxZ) {
        passing++;
      }
    }

    const pos = new Float32Array(passing * 3);
    const col = new Float32Array(passing * 3);
    let outIdx = 0;

    for (let i = 0; i < count; i++) {
      const sCode = rawData.surveyIndices[i];
      const z = rawData.redshifts[i];
      if (surveyCodes[sCode] && z >= minZ && z <= maxZ) {
        pos[outIdx * 3] = rawData.positions[i * 3];
        pos[outIdx * 3 + 1] = rawData.positions[i * 3 + 1];
        pos[outIdx * 3 + 2] = rawData.positions[i * 3 + 2];

        col[outIdx * 3] = rawData.colors[i * 3];
        col[outIdx * 3 + 1] = rawData.colors[i * 3 + 1];
        col[outIdx * 3 + 2] = rawData.colors[i * 3 + 2];
        outIdx++;
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    return { geometry: geo, visibleCount: passing };
  }, [rawData, selectedSurveys, redshiftFilter]);

  const dotTex = useMemo(makeDotTexture, []);
  const pointsMaterial = useMemo(
    () =>
      new THREE.PointsMaterial({
        map: dotTex,
        size: 180,
        sizeAttenuation: true,
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        opacity: 0.88,
      }),
    [dotTex],
  );

  // Survey Footprint Cones / Wedges (SDSS Northern & Southern Galactic Caps, 2dFGRS strips)
  const footprintLines = useMemo(() => {
    if (!showSurveyFootprints) return null;
    const lines: THREE.Vector3[][] = [];
    const maxR = 2.5e9; // 2.5 Gly survey visual boundary cone

    // SDSS North Fan Wedge Boundary Rays (RA ~ 110 to 260 deg, Dec ~ 0 to 60 deg)
    const sdssRays = [
      { ra: 115, dec: 0 },
      { ra: 255, dec: 0 },
      { ra: 115, dec: 60 },
      { ra: 255, dec: 60 },
      { ra: 185, dec: 65 },
    ];
    for (const r of sdssRays) {
      const raRad = (r.ra * Math.PI) / 180;
      const decRad = (r.dec * Math.PI) / 180;
      const v = new THREE.Vector3(
        maxR * Math.cos(decRad) * Math.cos(raRad),
        maxR * Math.sin(decRad),
        maxR * Math.cos(decRad) * Math.sin(raRad),
      );
      lines.push([new THREE.Vector3(0, 0, 0), v]);
    }

    // 2dFGRS Declination Strips (North Dec ~ 0, South Dec ~ -30)
    const tdfRays = [
      { ra: 330, dec: -30 },
      { ra: 40, dec: -30 },
      { ra: 150, dec: 0 },
      { ra: 200, dec: 0 },
    ];
    for (const r of tdfRays) {
      const raRad = (r.ra * Math.PI) / 180;
      const decRad = (r.dec * Math.PI) / 180;
      const v = new THREE.Vector3(
        maxR * 0.7 * Math.cos(decRad) * Math.cos(raRad),
        maxR * 0.7 * Math.sin(decRad),
        maxR * 0.7 * Math.cos(decRad) * Math.sin(raRad),
      );
      lines.push([new THREE.Vector3(0, 0, 0), v]);
    }

    return lines;
  }, [showSurveyFootprints]);

  // Zone of Avoidance dust obscuration disc along Galactic plane (|b| < 8 deg)
  const zoaGeometry = useMemo(() => {
    if (!showZoneOfAvoidance) return null;
    // Ring geometry in XZ plane (Galactic plane)
    return new THREE.RingGeometry(5e6, 6e8, 48, 8);
  }, [showZoneOfAvoidance]);

  return (
    <group>
      {/* 3D Observed Galaxy Survey Points */}
      <points geometry={geometry} material={pointsMaterial} frustumCulled={false} />

      {/* Survey Footprint Visual Boundaries */}
      {showSurveyFootprints && footprintLines && (
        <group>
          {footprintLines.map((pts, i) => {
            const geo = new THREE.BufferGeometry().setFromPoints(pts);
            return (
              <lineSegments key={i} geometry={geo}>
                <lineBasicMaterial
                  color="#38bdf8"
                  transparent
                  opacity={0.35}
                  blending={THREE.AdditiveBlending}
                />
              </lineSegments>
            );
          })}
        </group>
      )}

      {/* Galactic Zone of Avoidance (Milky Way dust obscuration belt) */}
      {showZoneOfAvoidance && zoaGeometry && (
        <mesh geometry={zoaGeometry} rotation={[-Math.PI / 2, 0, 0]} frustumCulled={false}>
          <meshBasicMaterial
            color="#475569"
            side={THREE.DoubleSide}
            transparent
            opacity={0.16}
            wireframe
          />
        </mesh>
      )}

      {/* Confirmed Large-Scale Cosmological Structures & Clusters */}
      {showCosmicBenchmarks && (
        <group>
          {COSMIC_BENCHMARKS.map((b) => {
            const pos = toXYZ(b.l, b.b, b.distanceGlyPlanck * 1e9);
            const color =
              b.type === "cluster"
                ? "#38bdf8"
                : b.type === "supercluster"
                  ? "#c084fc"
                  : b.type === "wall"
                    ? "#fbbf24"
                    : "#64748b";
            return (
              <group key={b.id} position={pos}>
                {/* Visual marker glow sphere */}
                <mesh>
                  <sphereGeometry args={[b.diameterMly * 0.4e6, 16, 16]} />
                  <meshBasicMaterial
                    color={color}
                    wireframe
                    transparent
                    opacity={0.3}
                    blending={THREE.AdditiveBlending}
                  />
                </mesh>

                {/* Interactive billboard label */}
                <Billboard follow lockX={false} lockY={false} lockZ={false}>
                  <Html center distanceFactor={1e7} occlude={false}>
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCosmicBenchmarkId(b.id);
                      }}
                      className="cursor-pointer select-none rounded-md border border-white/20 bg-slate-950/85 px-2.5 py-1 text-xs backdrop-blur-md shadow-lg transition-transform hover:scale-110 active:scale-95"
                      style={{
                        color,
                        boxShadow: `0 0 12px ${color}40`,
                      }}
                    >
                      <div className="font-bold flex items-center gap-1">
                        <span
                          className="size-1.5 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        {b.name}
                      </div>
                      <div className="text-[10px] text-slate-300 font-mono">
                        z={b.meanRedshift.toFixed(4)} • {b.distanceGlyPlanck.toFixed(2)} Gly
                      </div>
                    </div>
                  </Html>
                </Billboard>
              </group>
            );
          })}
        </group>
      )}
    </group>
  );
}

// -----------------------------------------------------------------------------
// MODE B: IllustrisTNG Cosmological Simulation Volume (TNG300-1 Snapshot 99)
// -----------------------------------------------------------------------------

function IllustrisTNGSimulationWeb() {
  const simulationComponent = useStore((s) => s.simulationComponent);
  const showSimulationFilaments = useStore((s) => s.showSimulationFilaments);
  const showSimulationVoids = useStore((s) => s.showSimulationVoids);
  const showSimulationBoundingBox = useStore((s) => s.showSimulationBoundingBox);
  const selectedSimHaloId = useStore((s) => s.selectedSimHaloId);
  const setSelectedSimHaloId = useStore((s) => s.setSelectedSimHaloId);
  const catalogDensityLevel = useStore((s) => s.catalogDensityLevel);

  const rawSimData = useMemo(() => {
    return generateSimulationBoxDistribution(catalogDensityLevel);
  }, [catalogDensityLevel]);

  // Filter simulation particles based on component
  const { geometry, visibleCount } = useMemo(() => {
    // types: 1 = dark matter halo, 2 = gas cell, 3 = filament tracer, 4 = cluster core
    const count = rawSimData.count;
    let passing = 0;

    for (let i = 0; i < count; i++) {
      const t = rawSimData.types[i];
      if (
        simulationComponent === "all" ||
        (simulationComponent === "dark_matter" && (t === 1 || t === 4)) ||
        (simulationComponent === "gas" && t === 2) ||
        (simulationComponent === "filaments" && t === 3) ||
        (simulationComponent === "clusters" && t === 4)
      ) {
        passing++;
      }
    }

    const pos = new Float32Array(passing * 3);
    const col = new Float32Array(passing * 3);
    let outIdx = 0;

    for (let i = 0; i < count; i++) {
      const t = rawSimData.types[i];
      if (
        simulationComponent === "all" ||
        (simulationComponent === "dark_matter" && (t === 1 || t === 4)) ||
        (simulationComponent === "gas" && t === 2) ||
        (simulationComponent === "filaments" && t === 3) ||
        (simulationComponent === "clusters" && t === 4)
      ) {
        pos[outIdx * 3] = rawSimData.positions[i * 3];
        pos[outIdx * 3 + 1] = rawSimData.positions[i * 3 + 1];
        pos[outIdx * 3 + 2] = rawSimData.positions[i * 3 + 2];

        col[outIdx * 3] = rawSimData.colors[i * 3];
        col[outIdx * 3 + 1] = rawSimData.colors[i * 3 + 1];
        col[outIdx * 3 + 2] = rawSimData.colors[i * 3 + 2];
        outIdx++;
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    return { geometry: geo, visibleCount: passing };
  }, [rawSimData, simulationComponent]);

  const dotTex = useMemo(makeDotTexture, []);
  const pointsMat = useMemo(
    () =>
      new THREE.PointsMaterial({
        map: dotTex,
        size: 220,
        sizeAttenuation: true,
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        opacity: 0.9,
      }),
    [dotTex],
  );

  // Simulation Bounding Box wireframe: ~987 Mly (302.6 comoving Mpc)
  const boxSizeLy = TNG300_METADATA.boxSizeComovingMly * 1e6;
  const boxGeometry = useMemo(() => {
    return new THREE.BoxGeometry(boxSizeLy, boxSizeLy, boxSizeLy);
  }, [boxSizeLy]);

  const MPC_TO_LY = 3.26156e6;
  const HALF_BOX_MPC = TNG300_METADATA.boxSizeComovingMpc / 2;

  // Filament lines connecting halos
  const filamentLines = useMemo(() => {
    if (!showSimulationFilaments) return [];
    return TNG_FILAMENTS.map((fil) => {
      const p1 = new THREE.Vector3(
        (fil.p1[0] - HALF_BOX_MPC) * MPC_TO_LY,
        (fil.p1[1] - HALF_BOX_MPC) * MPC_TO_LY,
        (fil.p1[2] - HALF_BOX_MPC) * MPC_TO_LY,
      );
      const p2 = new THREE.Vector3(
        (fil.p2[0] - HALF_BOX_MPC) * MPC_TO_LY,
        (fil.p2[1] - HALF_BOX_MPC) * MPC_TO_LY,
        (fil.p2[2] - HALF_BOX_MPC) * MPC_TO_LY,
      );
      return { id: fil.id, p1, p2, len: fil.lengthMpc };
    });
  }, [showSimulationFilaments, HALF_BOX_MPC, MPC_TO_LY]);

  return (
    <group>
      {/* Simulation Particles */}
      <points geometry={geometry} material={pointsMat} frustumCulled={false} />

      {/* Wireframe Simulation Bounding Box with dimension indicators */}
      {showSimulationBoundingBox && (
        <group>
          <mesh geometry={boxGeometry} frustumCulled={false}>
            <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.22} />
          </mesh>

          {/* Simulation Header Billboard */}
          <Billboard position={[0, boxSizeLy * 0.52, 0]}>
            <Html center distanceFactor={1e7} occlude={false}>
              <div className="pointer-events-none select-none rounded-lg border border-cyan-500/40 bg-slate-950/90 px-3 py-1.5 text-center text-xs backdrop-blur-md shadow-xl text-cyan-300">
                <div className="font-bold tracking-wide">
                  IllustrisTNG-300 Snapshot 99 (z = 0.0)
                </div>
                <div className="text-[10px] text-slate-400">
                  Comoving Box: 205 h⁻¹ Mpc (302.6 Mpc ≈ 987 Mly) • Equal-Time Cosmological Slice
                </div>
              </div>
            </Html>
          </Billboard>
        </group>
      )}

      {/* Filament Skeleton Overlay Lines */}
      {showSimulationFilaments &&
        filamentLines.map((fil) => {
          const geo = new THREE.BufferGeometry().setFromPoints([fil.p1, fil.p2]);
          return (
            <lineSegments key={fil.id} geometry={geo}>
              <lineBasicMaterial
                color="#c084fc"
                transparent
                opacity={0.65}
                blending={THREE.AdditiveBlending}
              />
            </lineSegments>
          );
        })}

      {/* Cosmic Voids in Simulation Volume */}
      {showSimulationVoids &&
        TNG_BENCHMARK_VOIDS.map((v) => {
          const centerLy = [
            (v.centerMpc[0] - HALF_BOX_MPC) * MPC_TO_LY,
            (v.centerMpc[1] - HALF_BOX_MPC) * MPC_TO_LY,
            (v.centerMpc[2] - HALF_BOX_MPC) * MPC_TO_LY,
          ] as [number, number, number];
          const radiusLy = v.radiusMpc * MPC_TO_LY;
          return (
            <group key={v.id} position={centerLy}>
              <mesh>
                <sphereGeometry args={[radiusLy, 24, 24]} />
                <meshBasicMaterial color="#1e293b" wireframe transparent opacity={0.2} />
              </mesh>
              <Billboard>
                <Html center distanceFactor={1e7}>
                  <div className="pointer-events-none rounded border border-slate-700 bg-slate-900/80 px-2 py-0.5 text-[10px] text-slate-400 font-mono">
                    Void #{v.id} (R={v.radiusMpc} Mpc, δ={v.densityContrastDelta})
                  </div>
                </Html>
              </Billboard>
            </group>
          );
        })}

      {/* Benchmark Cluster Halos */}
      {TNG_BENCHMARK_HALOS.map((h) => {
        const xLy = (h.xMpc - HALF_BOX_MPC) * MPC_TO_LY;
        const yLy = (h.yMpc - HALF_BOX_MPC) * MPC_TO_LY;
        const zLy = (h.zMpc - HALF_BOX_MPC) * MPC_TO_LY;
        const isCluster = h.environmentType === "cluster";
        const color = isCluster ? "#fde047" : "#38bdf8";
        return (
          <group key={h.id} position={[xLy, yLy, zLy]}>
            <Billboard>
              <Html center distanceFactor={1e7}>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSimHaloId(h.id);
                  }}
                  className="cursor-pointer rounded border border-white/20 bg-slate-950/85 px-2 py-0.5 text-[11px] font-bold text-amber-300 shadow-lg hover:scale-110 transition-transform"
                >
                  {isCluster ? "Rich Cluster" : "Group"} #{h.id}
                  <div className="text-[9px] text-slate-300 font-mono font-normal">
                    M_200c = {(h.massTotalMsun / 1e14).toFixed(2)}×10¹⁴ M☉
                  </div>
                </div>
              </Html>
            </Billboard>
          </group>
        );
      })}
    </group>
  );
}

// -----------------------------------------------------------------------------
// Main LargeScaleStructure3D Component (Hybrid Switcher)
// -----------------------------------------------------------------------------

export function LargeScaleStructure3D() {
  const cosmicWebMode = useStore((s) => s.cosmicWebMode);
  const showCosmicWebDensity = useStore((s) => s.showCosmicWebDensity);

  if (!showCosmicWebDensity || cosmicWebMode === "off") {
    return null;
  }

  return (
    <group>
      {cosmicWebMode === "observational" && <ObservationalSurveyWeb />}
      {cosmicWebMode === "simulation" && <IllustrisTNGSimulationWeb />}
    </group>
  );
}
