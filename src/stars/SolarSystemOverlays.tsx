// @ts-nocheck
/**
 * NASA JPL Horizons Solar System Educational Overlays
 *
 * Implements:
 * 1. 3D Instantaneous Velocity Vectors (v in km/s) with directional cones.
 * 2. Three-Body Lagrange Points (L1 - L5) for Sun-Earth and Sun-Jupiter with mission annotations.
 * 3. Solar System Barycenter (SSB) and Sun-Jupiter Barycenter markers with Sun wobble trajectory.
 * 4. Interplanetary Distance Ruler with live AU, km, and light-travel time (d / c).
 * 5. Orbital Resonance Visualizer (Laplace 4:2:1 and Neptune:Pluto 3:2).
 */

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import { useStore } from "./store";
import { getSimulationJd, getPlanetSimulationJd, simTimeDays } from "./sim-clock";
import { jplEphemerisManager } from "@/lib/astronomy/jpl/ephemeris-cache";
import { computeLagrangePoints, type LagrangePointDef } from "@/lib/astronomy/jpl/lagrange-points";
import { computeSunBarycentricOffsetAu } from "@/lib/astronomy/jpl/horizons-ephemeris";
import { SOLAR_SYSTEM_RESONANCES } from "@/lib/astronomy/jpl/orbital-resonances";
import { scaleManager } from "@/lib/astronomy/scale-manager";

// Scale factor: convert AU to scene units (enhanced mode: 0.05 ly, true_scale mode)
function getSceneAu(scaleMode: "enhanced" | "true_scale"): number {
  return scaleMode === "true_scale" ? scaleManager.getRenderAU("true_scale") : 0.05;
}

// ----------------------------------------------------------------------------
// 1. Velocity Vectors (v in km/s)
// ----------------------------------------------------------------------------
const VECTOR_PLANETS = [
  "Mercury",
  "Venus",
  "Earth",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune",
];

export function VelocityVectorsOverlay() {
  const show = useStore((s) => s.showVelocityVectors);
  const scaleMode = useStore((s) => s.scaleMode);
  const linesRef = useRef<THREE.LineSegments>(null!);
  const au = getSceneAu(scaleMode);

  const [geo, colors] = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(VECTOR_PLANETS.length * 6);
    const col = new Float32Array(VECTOR_PLANETS.length * 6);
    // Green-cyan velocity vector color
    for (let i = 0; i < VECTOR_PLANETS.length * 2; i++) {
      col[i * 3] = 0.2;
      col[i * 3 + 1] = 0.95;
      col[i * 3 + 2] = 0.75;
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    return [g, col];
  }, []);

  useFrame(() => {
    if (!show || !linesRef.current) return;
    const jd = getSimulationJd();
    const posAttr = geo.getAttribute("position") as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;

    for (let i = 0; i < VECTOR_PLANETS.length; i++) {
      const pName = VECTOR_PLANETS[i];
      const state = jplEphemerisManager.getPlanetState(pName, getPlanetSimulationJd(pName));

      // Planet position in scene: (x, z_elev, y)
      const px = state.xAu * au;
      const py = state.zAu * au;
      const pz = state.yAu * au;

      // Velocity vector scaled for visibility (e.g. 30 km/s -> ~0.08 AU visual length)
      const vScale = (0.003 * au) / 1.0;
      const vx = state.vxKmS * vScale;
      const vy = state.vzKmS * vScale;
      const vz = state.vyKmS * vScale;

      const base = i * 6;
      arr[base] = px;
      arr[base + 1] = py;
      arr[base + 2] = pz;

      arr[base + 3] = px + vx;
      arr[base + 4] = py + vy;
      arr[base + 5] = pz + vz;
    }
    posAttr.needsUpdate = true;
  });

  if (!show) return null;

  return (
    <group>
      <lineSegments ref={linesRef} geometry={geo}>
        <lineBasicMaterial
          vertexColors
          linewidth={2}
          transparent
          opacity={0.85}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
}

// ----------------------------------------------------------------------------
// 2. Lagrange Points (L1 - L5) for Sun-Earth and Sun-Jupiter
// ----------------------------------------------------------------------------
export function LagrangePointsOverlay() {
  const show = useStore((s) => s.showLagrangePoints);
  const scaleMode = useStore((s) => s.scaleMode);
  const au = getSceneAu(scaleMode);

  const groupRef = useRef<THREE.Group>(null!);
  const [points, setPoints] = useState<LagrangePointDef[]>([]);

  useFrame(() => {
    if (!show) return;
    const earthState = jplEphemerisManager.getPlanetState("Earth", getPlanetSimulationJd("Earth"));
    const jupiterState = jplEphemerisManager.getPlanetState(
      "Jupiter",
      getPlanetSimulationJd("Jupiter"),
    );

    const sePts = computeLagrangePoints("Sun-Earth", earthState);
    const sjPts = computeLagrangePoints("Sun-Jupiter", jupiterState);
    setPoints([...sePts, ...sjPts]);
  });

  if (!show) return null;

  return (
    <group ref={groupRef}>
      {points.map((pt) => {
        const x = pt.xAu * au;
        const y = pt.zAu * au;
        const z = pt.yAu * au;
        const isStable = pt.stability === "stable_triangular";
        const color = isStable ? "#4ade80" : "#fbbf24";

        return (
          <group key={pt.id} position={[x, y, z]}>
            {/* Small diamond/cross marker */}
            <mesh>
              <octahedronGeometry args={[0.003 * au, 0]} />
              <meshBasicMaterial color={color} wireframe />
            </mesh>
            <Billboard follow lockX={false} lockY={false} lockZ={false}></Billboard>
          </group>
        );
      })}
    </group>
  );
}

// ----------------------------------------------------------------------------
// 3. Solar System Barycenter (SSB) & Sun Wobble
// ----------------------------------------------------------------------------
export function BarycenterOverlay() {
  const show = useStore((s) => s.showBarycenterMarkers);
  const scaleMode = useStore((s) => s.scaleMode);
  const au = getSceneAu(scaleMode);

  const sunLineRef = useRef<THREE.Line>(null!);
  const wobblePathRef = useRef<THREE.Line>(null!);

  const { lineGeo, wobbleGeo } = useMemo(() => {
    // Line connecting SSB to Sun center
    const lg = new THREE.BufferGeometry();
    lg.setAttribute("position", new THREE.BufferAttribute(new Float32Array(6), 3));

    // Historical wobble loop of Sun over past 12 years (Jupiter orbital period)
    const wg = new THREE.BufferGeometry();
    const WOBBLE_SEGS = 120;
    wg.setAttribute("position", new THREE.BufferAttribute(new Float32Array(WOBBLE_SEGS * 3), 3));

    return { lineGeo: lg, wobbleGeo: wg };
  }, []);

  useFrame(() => {
    if (!show) return;
    const jd = getSimulationJd();
    const ssb = computeSunBarycentricOffsetAu(jd);

    // Sun position in scene relative to SSB (which sits at origin):
    // In barycentric coordinates, Sun is at (-xSum, -zSum, -ySum)
    const sx = ssb.xAu * au;
    const sy = ssb.zAu * au;
    const sz = ssb.yAu * au;

    // Update connection line
    const lPos = lineGeo.getAttribute("position") as THREE.BufferAttribute;
    const lArr = lPos.array as Float32Array;
    lArr[0] = 0;
    lArr[1] = 0;
    lArr[2] = 0; // SSB
    lArr[3] = sx;
    lArr[4] = sy;
    lArr[5] = sz; // Sun
    lPos.needsUpdate = true;

    // Update wobble trajectory loop over 1 Jupiter orbit (~4332 days)
    const wPos = wobbleGeo.getAttribute("position") as THREE.BufferAttribute;
    const wArr = wPos.array as Float32Array;
    const count = wArr.length / 3;
    const spanDays = 4332;
    for (let k = 0; k < count; k++) {
      const pastJd = jd - spanDays + (k / (count - 1)) * spanDays;
      const pastSsb = computeSunBarycentricOffsetAu(pastJd);
      wArr[k * 3] = pastSsb.xAu * au;
      wArr[k * 3 + 1] = pastSsb.zAu * au;
      wArr[k * 3 + 2] = pastSsb.yAu * au;
    }
    wPos.needsUpdate = true;
  });

  if (!show) return null;

  return (
    <group>
      {/* Golden reticle at Solar System Barycenter (0,0,0) */}
      <mesh position={[0, 0, 0]}>
        <ringGeometry args={[0.002 * au, 0.004 * au, 32]} />
        <meshBasicMaterial color="#f59e0b" side={THREE.DoubleSide} transparent opacity={0.8} />
      </mesh>
      <Billboard position={[0, 0.006 * au, 0]}></Billboard>

      {/* Line connecting SSB to Sun center */}
      <line ref={sunLineRef} geometry={lineGeo}>
        <lineBasicMaterial
          color="#f59e0b"
          dashed
          dashSize={0.002 * au}
          gapSize={0.001 * au}
          transparent
          opacity={0.7}
        />
      </line>

      {/* Sun wobble orbit path */}
      <line ref={wobblePathRef} geometry={wobbleGeo}>
        <lineBasicMaterial color="#f59e0b" transparent opacity={0.35} depthWrite={false} />
      </line>
    </group>
  );
}

// ----------------------------------------------------------------------------
// 4. Interplanetary Distance Ruler
// ----------------------------------------------------------------------------
export function InterplanetaryDistanceRuler() {
  const show = useStore((s) => s.showInterplanetaryDistances);
  const targetPlanet = useStore((s) => s.distanceTargetPlanet);
  const scaleMode = useStore((s) => s.scaleMode);
  const au = getSceneAu(scaleMode);

  const lineRef = useRef<THREE.Line>(null!);
  const [distInfo, setDistInfo] = useState<{
    text: string;
    midX: number;
    midY: number;
    midZ: number;
  } | null>(null);

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(6), 3));
    return g;
  }, []);

  useFrame(() => {
    if (!show || !targetPlanet) return;
    const earth = jplEphemerisManager.getPlanetState("Earth", getPlanetSimulationJd("Earth"));
    const target = jplEphemerisManager.getPlanetState(
      targetPlanet,
      getPlanetSimulationJd(targetPlanet),
    );

    const x1 = earth.xAu * au;
    const y1 = earth.zAu * au;
    const z1 = earth.yAu * au;

    const x2 = target.xAu * au;
    const y2 = target.zAu * au;
    const z2 = target.yAu * au;

    const pos = geo.getAttribute("position") as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    arr[0] = x1;
    arr[1] = y1;
    arr[2] = z1;
    arr[3] = x2;
    arr[4] = y2;
    arr[5] = z2;
    pos.needsUpdate = true;

    const distanceAu = Math.hypot(
      target.xAu - earth.xAu,
      target.yAu - earth.yAu,
      target.zAu - earth.zAu,
    );
    const lightSeconds = distanceAu * 499.004784;
    const distanceData = {
      distanceAu,
      distanceKm: distanceAu * 149597870.7,
      lightTravelTimeFormatted:
        lightSeconds >= 3600
          ? (lightSeconds / 3600).toFixed(2) + " h"
          : Math.floor(lightSeconds / 60) + " m " + Math.round(lightSeconds % 60) + " s",
    };
    setDistInfo({
      text: `Earth ↔ ${targetPlanet}: ${distanceData.distanceAu.toFixed(3)} AU (${(distanceData.distanceKm / 1e6).toFixed(1)}M km) · ${distanceData.lightTravelTimeFormatted}`,
      midX: (x1 + x2) * 0.5,
      midY: (y1 + y2) * 0.5,
      midZ: (z1 + z2) * 0.5,
    });
  });

  if (!show || !distInfo) return null;

  return (
    <group>
      <line ref={lineRef} geometry={geo}>
        <lineBasicMaterial color="#38bdf8" linewidth={2} transparent opacity={0.7} />
      </line>
      <Billboard position={[distInfo.midX, distInfo.midY + 0.005 * au, distInfo.midZ]}></Billboard>
    </group>
  );
}

// ----------------------------------------------------------------------------
// Master Overlays Host Component
// ----------------------------------------------------------------------------
import { useState } from "react";

export function SolarSystemOverlays() {
  return (
    <group>
      <VelocityVectorsOverlay />
      <LagrangePointsOverlay />
      <BarycenterOverlay />
      <InterplanetaryDistanceRuler />
    </group>
  );
}
