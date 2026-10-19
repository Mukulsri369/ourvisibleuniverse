/**
 * COSMOS Neutron Star & Pulsar Lighthouse Beam Renderer
 * Project: Our Visible Universe Academy
 * Scope: Prompt 05 — Section 15 (Neutron Star and Pulsar Effects)
 *
 * Enforces the physical geometric distinction between:
 * 1. Rotation Axis (Omega, vertical Y axis)
 * 2. Magnetic Dipole Axis (mu, inclined by magnetic obliquity angle alpha)
 * 3. Observer Line-of-Sight Vector (LOS)
 *
 * The observed radio/X-ray pulse triggers ONLY when the magnetic emission cone
 * sweeps across the observer's line of sight.
 * Includes a non-flashing steady representation when reducedMotion is active.
 */

import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { CinematicQualityTier } from "@/lib/cosmos/cinematic-storyboard-types";

export interface PulsarBeamRendererProps {
  objectId?: string;
  position?: [number, number, number];
  neutronStarRadius?: number;
  magneticTiltDeg?: number; // Misalignment alpha between rotation axis and magnetic axis
  spinRateRadPerSec?: number;
  observerDirection?: [number, number, number];
  reducedMotion?: boolean;
  qualityTier: CinematicQualityTier;
  isSimulationRunning?: boolean;
  simulationTimeScale?: number;
  onSelectObject?: (objectId: string) => void;
}

/**
 * Pure geometric helper that computes whether either magnetic pole emission beam
 * intersects the observer's line of sight within the half-opening cone angle.
 */
export function evaluatePulsarLighthouseSweep(params: {
  rotationPhaseRad: number;
  magneticTiltDeg: number;
  observerDirection: [number, number, number];
  beamHalfConeDeg?: number;
}): {
  magneticAxisVector: [number, number, number];
  alignmentCosine: number;
  isPulseVisibleToObserver: boolean;
} {
  const alpha = (params.magneticTiltDeg * Math.PI) / 180;
  const phi = params.rotationPhaseRad;

  // Magnetic dipole axis rotating around Y-axis with obliquity alpha
  const mx = Math.sin(alpha) * Math.cos(phi);
  const my = Math.cos(alpha);
  const mz = Math.sin(alpha) * Math.sin(phi);

  const obsLen =
    Math.hypot(
      params.observerDirection[0],
      params.observerDirection[1],
      params.observerDirection[2],
    ) || 1.0;
  const ox = params.observerDirection[0] / obsLen;
  const oy = params.observerDirection[1] / obsLen;
  const oz = params.observerDirection[2] / obsLen;

  // Bipolar beams (+m and -m)
  const absDot = Math.abs(mx * ox + my * oy + mz * oz);
  const cosThreshold = Math.cos(((params.beamHalfConeDeg ?? 18) * Math.PI) / 180);

  return {
    magneticAxisVector: [mx, my, mz],
    alignmentCosine: absDot,
    isPulseVisibleToObserver: absDot >= cosThreshold,
  };
}

export function PulsarBeamRenderer({
  objectId = "pulsar_remnant",
  position = [0, 0, 0],
  neutronStarRadius = 0.48,
  magneticTiltDeg = 38,
  spinRateRadPerSec = 2.6,
  reducedMotion = false,
  qualityTier,
  isSimulationRunning = true,
  simulationTimeScale = 1.0,
  onSelectObject,
}: PulsarBeamRendererProps) {
  const rotorGroupRef = useRef<THREE.Group>(null);
  const tiltRad = (magneticTiltDeg * Math.PI) / 180;
  const segs = qualityTier === "LOW_POWER" ? 16 : 32;

  // Precompute rotation axis reference line (vertical Y)
  const rotationAxisGeom = useMemo(() => {
    const pts = [new THREE.Vector3(0, -2.4, 0), new THREE.Vector3(0, 2.4, 0)];
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, []);

  useFrame((_, delta) => {
    if (!isSimulationRunning || reducedMotion || !rotorGroupRef.current) return;
    rotorGroupRef.current.rotation.y +=
      Math.min(delta, 0.1) * simulationTimeScale * spinRateRadPerSec;
  });

  return (
    <group
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onSelectObject?.(objectId);
      }}
    >
      {/* Fixed Rotation Axis Indicator (Omega) */}
      <line geometry={rotationAxisGeom}>
        <lineBasicMaterial color="#94a3b8" transparent opacity={0.45} />
      </line>

      {/* Co-Rotating Magnetosphere & Tilted Magnetic Dipole Beams */}
      <group ref={rotorGroupRef}>
        {/* Ultra-Dense Neutron Star Crust (~10 km physical radius) */}
        <mesh>
          <sphereGeometry args={[neutronStarRadius, segs, segs]} />
          <meshStandardMaterial
            color="#e0f2fe"
            emissive="#38bdf8"
            emissiveIntensity={1.25}
            roughness={0.2}
          />
        </mesh>

        {/* Magnetic Dipole Axis tilted by alpha = magneticTiltDeg from rotation axis */}
        <group rotation={[0, 0, tiltRad]}>
          {/* North Magnetic Beam Cone */}
          <mesh position={[0, 1.65, 0]}>
            <cylinderGeometry args={[0.38, 0.04, 2.6, segs, 1, true]} />
            <meshBasicMaterial
              color="#22d3ee"
              transparent
              opacity={reducedMotion ? 0.35 : 0.52}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>

          {/* South Magnetic Beam Cone */}
          <mesh position={[0, -1.65, 0]}>
            <cylinderGeometry args={[0.04, 0.38, 2.6, segs, 1, true]} />
            <meshBasicMaterial
              color="#22d3ee"
              transparent
              opacity={reducedMotion ? 0.35 : 0.52}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>

          {/* Dipolar Closed Magnetic Field Loops */}
          <mesh rotation={[0, 0, 0]}>
            <torusGeometry args={[neutronStarRadius * 1.65, 0.018, 12, 48]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.45} />
          </mesh>
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[neutronStarRadius * 1.65, 0.018, 12, 48]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.45} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
