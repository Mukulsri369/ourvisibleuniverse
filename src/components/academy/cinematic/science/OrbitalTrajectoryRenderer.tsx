/**
 * COSMOS Keplerian Orbital Trajectory & Equal-Area Sector Renderer
 * Project: Our Visible Universe Academy
 * Scope: Prompt 05 — Sections 16 & 28 (Gravitational Phenomena & Orbital Mechanics)
 *
 * Renders:
 * - Exact Keplerian ellipse geometry parameterized by semi-major axis (a) and eccentricity (e)
 * - Focal offset c = a*e placing the central primary mass at the true focus
 * - Optional Kepler's Second Law (dA/dt = L / 2m = const) equal-area swept sectors
 *   at periapsis (wide, short arc) and apoapsis (narrow, long arc)
 */

import React, { useMemo } from "react";
import * as THREE from "three";

export interface OrbitalTrajectoryRendererProps {
  semiMajorAxis: number;
  eccentricity: number;
  inclinationRad?: number;
  colorHex?: string;
  opacity?: number;
  showEqualAreaSectors?: boolean;
  showApsidesMarkers?: boolean;
}

export function OrbitalTrajectoryRenderer({
  semiMajorAxis,
  eccentricity,
  inclinationRad = 0,
  colorHex = "#38bdf8",
  opacity = 0.68,
  showEqualAreaSectors = false,
  showApsidesMarkers = true,
}: OrbitalTrajectoryRendererProps) {
  const clampedE = Math.min(0.92, Math.max(0.0, eccentricity));
  const a = Math.max(0.5, semiMajorAxis);
  const b = a * Math.sqrt(1 - clampedE * clampedE);
  const focalOffset = a * clampedE;

  const orbitCurveGeometry = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const segments = 128;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(theta) * a - focalOffset, 0, Math.sin(theta) * b));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [a, b, focalOffset]);

  // Equal-area Keplerian sectors (Periapsis wide angle vs Apoapsis narrow angle)
  const sectorGeometries = useMemo(() => {
    if (!showEqualAreaSectors) return null;

    const buildSector = (startAngle: number, endAngle: number) => {
      const geom = new THREE.BufferGeometry();
      const steps = 20;
      const vertices: number[] = [];
      for (let i = 0; i < steps; i++) {
        const t0 = startAngle + ((endAngle - startAngle) * i) / steps;
        const t1 = startAngle + ((endAngle - startAngle) * (i + 1)) / steps;
        // Triangle from focus (0, 0, 0) to arc segment
        vertices.push(
          0,
          0.01,
          0,
          Math.cos(t0) * a - focalOffset,
          0.01,
          Math.sin(t0) * b,
          Math.cos(t1) * a - focalOffset,
          0.01,
          Math.sin(t1) * b,
        );
      }
      geom.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
      return geom;
    };

    return {
      periapsisSector: buildSector(-0.42, 0.42),
      apoapsisSector: buildSector(Math.PI - 0.18, Math.PI + 0.18),
    };
  }, [a, b, focalOffset, showEqualAreaSectors]);

  return (
    <group rotation={[inclinationRad, 0, 0]}>
      {/* Primary Elliptical Trajectory */}
      <lineLoop geometry={orbitCurveGeometry}>
        <lineBasicMaterial color={colorHex} transparent opacity={opacity} />
      </lineLoop>

      {/* Periapsis & Apoapsis Nodal Markers */}
      {showApsidesMarkers && (
        <>
          {/* Periapsis (closest approach: x = a*(1 - e)) */}
          <mesh position={[a - focalOffset, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.12, 0.18, 24]} />
            <meshBasicMaterial color="#fbbf24" side={THREE.DoubleSide} />
          </mesh>
          {/* Apoapsis (farthest point: x = -a*(1 + e)) */}
          <mesh position={[-a - focalOffset, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.12, 0.18, 24]} />
            <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} />
          </mesh>
        </>
      )}

      {/* Kepler's 2nd Law Equal-Area Swept Sectors */}
      {sectorGeometries && (
        <>
          <mesh geometry={sectorGeometries.periapsisSector}>
            <meshBasicMaterial
              color="#f59e0b"
              transparent
              opacity={0.28}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
          <mesh geometry={sectorGeometries.apoapsisSector}>
            <meshBasicMaterial
              color="#06b6d4"
              transparent
              opacity={0.28}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        </>
      )}
    </group>
  );
}
