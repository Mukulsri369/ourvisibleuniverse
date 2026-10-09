import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { exoSystemFor, type ExoPlanet } from "./exosystems";
import { useStore } from "./store";

// Same presentation scale as the Solar System (1 AU = 0.05 ly; planets
// enlarged for visibility), so systems compare 1:1 with ours.
const AU = 0.05;
const EARTH_R = 0.055 * 0.005;

function orbitPoint(p: ExoPlanet, ang: number, out: THREE.Vector3) {
  const a = p.aAU * AU;
  const b = a * Math.sqrt(1 - p.e * p.e);
  const c = a * p.e;
  out.set(Math.cos(ang) * a - c, 0, Math.sin(ang) * b);
  out.applyAxisAngle(new THREE.Vector3(1, 0, 0), p.incl);
  return out;
}

function ExoBody({ p }: { p: ExoPlanet }) {
  const ref = useRef<THREE.Group>(null);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const line = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 160; i++) pts.push(orbitPoint(p, (i / 160) * Math.PI * 2, new THREE.Vector3()));
    const g = new THREE.BufferGeometry().setFromPoints(pts);
    const m = new THREE.LineBasicMaterial({
      color: p.inHZ ? "#5cf08a" : "#8aa0c8",
      transparent: true,
      opacity: p.inHZ ? 0.55 : 0.28,
      depthWrite: false,
    });
    return new THREE.Line(g, m);
  }, [p]);
  const size = p.radiusEarth * EARTH_R;
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const ang = p.phase + (clock.elapsedTime / (8 * Math.pow(p.periodYears, 0.5))) * Math.PI * 2 * 0.25;
    ref.current.position.copy(orbitPoint(p, ang, tmp));
  });
  return (
    <>
      <primitive object={line} />
      <group ref={ref}>
        <mesh>
          <sphereGeometry args={[size, 32, 20]} />
          <meshStandardMaterial
            color={p.color}
            roughness={0.85}
            emissive={p.color}
            emissiveIntensity={p.kind === "Lava world" ? 0.6 : 0.08}
          />
        </mesh>
        {p.radiusEarth > 3 && (
          <mesh scale={1.06}>
            <sphereGeometry args={[size, 24, 16]} />
            <meshBasicMaterial color={p.color} transparent opacity={0.12} side={THREE.BackSide} depthWrite={false} />
          </mesh>
        )}
      </group>
    </>
  );
}

/** Habitable-zone annulus (green "Goldilocks" band). */
function HabitableZone({ inner, outer }: { inner: number; outer: number }) {
  return (
    <mesh rotation-x={-Math.PI / 2}>
      <ringGeometry args={[inner * AU, outer * AU, 128]} />
      <meshBasicMaterial color="#3ddc84" transparent opacity={0.07} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
}

/** Procedural planetary system rendered around the currently visited star. */
export function ExoSystem() {
  const star = useStore((s) => s.selectedStar);
  const sys = useMemo(() => (star && star.name !== "Sun" ? exoSystemFor(star) : null), [star]);
  if (!star || !sys) return null;
  return (
    <group position={[star.x, star.y, star.z]}>
      <pointLight intensity={2} distance={0} decay={0} color="#fff4e0" />
      <HabitableZone inner={sys.hzInner} outer={sys.hzOuter} />
      {sys.planets.map((p) => (
        <ExoBody key={p.name} p={p} />
      ))}
    </group>
  );
}
