/**
 * COSMOS Scientific Force Vector & Gravitational Potential Field Renderer
 * Project: Our Visible Universe Academy
 * Scope: Prompt 05 — Sections 16 & 19 (Gravitational Phenomena & Force Vectors)
 *
 * Implements:
 * - Real-time 3D velocity vector (v, tangent to orbit) and centripetal gravitational
 *   force vector (F_g, directed toward focal barycenter)
 * - Pedagogical Flamm's Paraboloid / Gravitational Potential Well wireframe grid
 *   Phi(r) = -GM / r (explicitly separated from literal physical space fabric)
 */

import React, { useEffect, useMemo } from "react";
import * as THREE from "three";

export interface VectorArrowDescriptor {
  origin: [number, number, number];
  direction: [number, number, number];
  length: number;
  colorHex: string;
}

export interface ScientificVectorFieldProps {
  vectors?: VectorArrowDescriptor[];
  showPotentialWellGrid?: boolean;
  potentialWellDepth?: number;
  potentialWellRadius?: number;
  gridColorHex?: string;
}

export function ScientificVectorField({
  vectors = [],
  showPotentialWellGrid = false,
  potentialWellDepth = 2.2,
  potentialWellRadius = 9.0,
  gridColorHex = "#38bdf8",
}: ScientificVectorFieldProps) {
  // Precompute concentric rings & radial spokes for gravitational potential embedding diagram
  const potentialWellGeometry = useMemo(() => {
    if (!showPotentialWellGrid) return null;
    const pts: THREE.Vector3[] = [];
    const rings = 8;
    const segments = 64;

    // Concentric equipotential circles depressed by z_well(r) = -depth / (r + 0.85)
    for (let rIdx = 1; rIdx <= rings; rIdx++) {
      const r = (rIdx / rings) * potentialWellRadius;
      const yDep = -potentialWellDepth / (r * 0.45 + 0.65) - 0.85;
      for (let s = 0; s < segments; s++) {
        const a0 = (s / segments) * Math.PI * 2;
        const a1 = ((s + 1) / segments) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a0) * r, yDep, Math.sin(a0) * r));
        pts.push(new THREE.Vector3(Math.cos(a1) * r, yDep, Math.sin(a1) * r));
      }
    }

    // 12 Radial geodesic gradient lines
    const spokes = 12;
    for (let k = 0; k < spokes; k++) {
      const angle = (k / spokes) * Math.PI * 2;
      for (let rIdx = 1; rIdx < rings; rIdx++) {
        const r0 = (rIdx / rings) * potentialWellRadius;
        const r1 = ((rIdx + 1) / rings) * potentialWellRadius;
        const y0 = -potentialWellDepth / (r0 * 0.45 + 0.65) - 0.85;
        const y1 = -potentialWellDepth / (r1 * 0.45 + 0.65) - 0.85;
        pts.push(new THREE.Vector3(Math.cos(angle) * r0, y0, Math.sin(angle) * r0));
        pts.push(new THREE.Vector3(Math.cos(angle) * r1, y1, Math.sin(angle) * r1));
      }
    }

    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [showPotentialWellGrid, potentialWellDepth, potentialWellRadius]);

  useEffect(() => {
    return () => {
      potentialWellGeometry?.dispose();
    };
  }, [potentialWellGeometry]);

  const preparedVectors = useMemo(() => {
    return vectors
      .map((vec) => {
        const dir = new THREE.Vector3(...vec.direction);
        if (dir.lengthSq() < 1e-6 || vec.length <= 1e-4) return null;
        dir.normalize();
        const origin = new THREE.Vector3(...vec.origin);
        const end = origin.clone().addScaledVector(dir, vec.length);
        const mid = origin.clone().addScaledVector(dir, vec.length * 0.5);
        const quat = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          dir,
        );
        return {
          colorHex: vec.colorHex,
          length: vec.length,
          mid: [mid.x, mid.y, mid.z] as [number, number, number],
          end: [end.x, end.y, end.z] as [number, number, number],
          quaternion: quat,
        };
      })
      .filter((v): v is NonNullable<typeof v> => v !== null);
  }, [vectors]);

  return (
    <group>
      {/* Gravitational Potential Embedding Grid (Pedagogical Analogy) */}
      {potentialWellGeometry && (
        <lineSegments geometry={potentialWellGeometry}>
          <lineBasicMaterial color={gridColorHex} transparent opacity={0.22} />
        </lineSegments>
      )}

      {/* Physical Force & Velocity Vector Arrows (Zero per-frame BufferGeometry leaks) */}
      {preparedVectors.map((vec, idx) => (
        <group key={idx}>
          <mesh position={vec.mid} quaternion={vec.quaternion}>
            <cylinderGeometry args={[0.018, 0.018, vec.length, 8]} />
            <meshBasicMaterial color={vec.colorHex} />
          </mesh>
          <mesh position={vec.end} quaternion={vec.quaternion}>
            <coneGeometry args={[0.075, 0.2, 12]} />
            <meshBasicMaterial color={vec.colorHex} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export interface FieldLineDescriptor {
  points: Array<[number, number, number]>;
  colorHex: string;
  opacity?: number;
}

export interface EquipotentialRingDescriptor {
  radius: number;
  colorHex: string;
  opacity?: number;
}

export interface ScientificFieldRendererProps {
  vectors?: VectorArrowDescriptor[];
  fieldLines?: FieldLineDescriptor[];
  equipotentialRings?: EquipotentialRingDescriptor[];
}

export function ScientificFieldRenderer({
  vectors = [],
  fieldLines = [],
  equipotentialRings = [],
}: ScientificFieldRendererProps) {
  const preparedFieldLines = useMemo(() => {
    return fieldLines
      .map((line) => {
        if (line.points.length < 2) return null;
        const pts = line.points.map((p) => new THREE.Vector3(p[0], p[1], p[2]));
        const geom = new THREE.BufferGeometry().setFromPoints(pts);
        return {
          geom,
          colorHex: line.colorHex,
          opacity: line.opacity ?? 0.85,
        };
      })
      .filter((l): l is NonNullable<typeof l> => l !== null);
  }, [fieldLines]);

  useEffect(() => {
    return () => {
      for (const item of preparedFieldLines) {
        item.geom.dispose();
      }
    };
  }, [preparedFieldLines]);

  return (
    <group>
      {vectors.length > 0 && <ScientificVectorField vectors={vectors} />}
      {preparedFieldLines.map((line, idx) => (
        <lineSegments key={`fl-${idx}`} geometry={line.geom}>
          <lineBasicMaterial
            color={line.colorHex}
            transparent={line.opacity < 1}
            opacity={line.opacity}
          />
        </lineSegments>
      ))}
      {equipotentialRings.map((ring, idx) => (
        <mesh key={`eq-${idx}`} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[ring.radius - 0.02, ring.radius + 0.02, 64]} />
          <meshBasicMaterial
            color={ring.colorHex}
            transparent
            opacity={ring.opacity ?? 0.45}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}
