import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { ObservedObject } from "./observed-objects";
import { OBSERVED_VISUAL_PROFILES } from "./observed-object-visuals";
import { blackHoleModel } from "./black-hole-model";
import { PlasmaJets } from "./CompactObjectMaterials";
import { StellarSurface } from "./StellarSurface";
import { motionTimeSeconds } from "./sim-clock";
const AU_LY = 1.58125074e-5,
  RSUN_LY = 7.35355e-8;
const BINARIES: Record<
  string,
  { name: string; temperature: number; radius: number; separation: number; periodYears: number }
> = {
  gaiabh1: {
    name: "Gaia BH1 companion",
    temperature: 5800,
    radius: 1,
    separation: 1.4,
    periodYears: 0.51,
  },
  gaiabh3: {
    name: "Gaia BH3 companion",
    temperature: 5200,
    radius: 5,
    separation: 16,
    periodYears: 11.6,
  },
  cygx1: {
    name: "HDE 226868",
    temperature: 31000,
    radius: 20,
    separation: 0.2,
    periodYears: 0.0153,
  },
  "v404-cyg": {
    name: "V404 Cygni companion",
    temperature: 4600,
    radius: 6,
    separation: 0.14,
    periodYears: 0.0177,
  },
};
/** Actual companion stars and jets remain scene geometry. The core is rendered
 * by the optical pass, so there is no painted black sphere or billboard ring. */
export function BlackHoleContext({ item }: { item: ObservedObject }) {
  const model = useMemo(() => blackHoleModel(item), [item]);
  const profile = OBSERVED_VISUAL_PROFILES[item.id];
  const binary = BINARIES[item.id];
  const orbit = useRef<THREE.Group>(null);
  useFrame(() => {
    if (orbit.current && binary)
      orbit.current.rotation.y =
        (motionTimeSeconds() * Math.PI * 2) / (binary.periodYears * 31557600);
  });
  return (
    <group rotation={profile?.tilt} name={"black-hole-context:" + item.id}>
      {item.compactPhysics?.hasRelativisticJet && (
        <group scale={model.radiusLy}>
          <PlasmaJets color={item.accent} length={70} width={0.4} />
        </group>
      )}
      {binary && (
        <group ref={orbit}>
          <group position={[binary.separation * AU_LY, 0, 0]}>
            <StellarSurface star={binary} radius={binary.radius * RSUN_LY} />
          </group>
        </group>
      )}
    </group>
  );
}
