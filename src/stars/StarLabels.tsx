import { Billboard, Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";
import { NAMED_STARS, type NamedStar } from "./data";
import { useStore } from "./store";

function StarLabel({ star }: { star: NamedStar }) {
  const ref = useRef<HTMLDivElement>(null);
  const groupRef = useRef<THREE.Group>(null!);
  const setSelected = useStore((s) => s.setSelected);
  const flyTo = useStore((s) => s.flyToStar);
  const [hover, setHover] = useState(false);

  useFrame(({ camera }) => {
    if (!groupRef.current || !ref.current) return;
    const dist = camera.position.distanceTo(groupRef.current.position);
    // visibility window scales with star's own distance: more prominent stars visible further
    const importance = Math.max(1, 30 - star.magnitude * 2);
    const near = Math.max(2, star.distance * 0.15);
    const far = Math.max(50, star.distance * 4 + importance * 2);
    let opacity = 0;
    if (dist > near && dist < far) {
      opacity = Math.min(1, (dist - near) / (near + 0.01)) * Math.min(1, (far - dist) / (far * 0.4));
    }
    ref.current.style.opacity = String(opacity);
    ref.current.style.pointerEvents = opacity > 0.2 ? "auto" : "none";
  });

  return (
    <group ref={groupRef} position={[star.x, star.y, star.z]}>
      <Billboard>
        <Html center distanceFactor={undefined} zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
          <div
            ref={ref}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onClick={(e) => {
              e.stopPropagation();
              setSelected(star);
              flyTo(star);
            }}
            style={{
              transform: "translate(8px, -8px)",
              color: "#ffffff",
              fontSize: 12,
              fontFamily: "Inter, system-ui, sans-serif",
              letterSpacing: 0.5,
              whiteSpace: "nowrap",
              textShadow: hover ? "0 0 8px #fff, 0 0 16px #88f" : "0 0 4px rgba(0,0,0,0.8)",
              cursor: "pointer",
              padding: "2px 6px",
              borderLeft: "1px solid rgba(255,255,255,0.4)",
              opacity: 0,
              transition: "text-shadow 200ms",
            }}
          >
            {star.name}
          </div>
        </Html>
      </Billboard>
    </group>
  );
}

export function StarLabels() {
  return (
    <>
      {NAMED_STARS.map((s) => (
        <StarLabel key={s.name} star={s} />
      ))}
    </>
  );
}

function BinaryOrbit({ center, color }: { center: [number, number, number]; color: string }) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime * 0.6;
    const r = 0.5;
    ref.current.position.set(center[0] + Math.cos(t) * r, center[1] + Math.sin(t) * r * 0.4, center[2]);
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.06, 8, 8]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

// Render small companion dots near binaries (orbit visual)
export function BinaryMarkers() {
  const binaries: { center: [number, number, number]; color: string }[] = [];
  NAMED_STARS.forEach((s) => {
    if (s.companions?.length) {
      binaries.push({ center: [s.x, s.y, s.z], color: "#aac8ff" });
    }
  });
  return (
    <>
      {binaries.map((b, i) => (
        <BinaryOrbit key={i} center={b.center} color={b.color} />
      ))}
    </>
  );
}
