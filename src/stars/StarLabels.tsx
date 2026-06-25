import { Billboard, Html } from "@react-three/drei";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";
import { NAMED_STARS, type NamedStar } from "./data";
import { useStore } from "./store";

function StarLabel({ star, hovered, setHovered }: { star: NamedStar; hovered: string | null; setHovered: (n: string | null) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const groupRef = useRef<THREE.Group>(null!);
  const setSelected = useStore((s) => s.setSelected);
  const flyTo = useStore((s) => s.flyToStar);
  const isHover = hovered === star.name;

  useFrame(() => {
    if (!ref.current) return;
    ref.current.style.opacity = isHover ? "1" : "0";
    ref.current.style.pointerEvents = "none";
  });

  // Hover pick radius scales with the star's distance so distant stars remain hoverable.
  const pickRadius = Math.max(0.25, star.distance * 0.04 + 0.3);

  const onOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(star.name);
    document.body.style.cursor = "pointer";
  };
  const onOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(null);
    document.body.style.cursor = "";
  };
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    setSelected(star);
    flyTo(star);
  };

  return (
    <group ref={groupRef} position={[star.x, star.y, star.z]}>
      {/* invisible hover/click target */}
      <mesh onPointerOver={onOver} onPointerOut={onOut} onClick={onClick}>
        <sphereGeometry args={[pickRadius, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <Billboard>
        <Html center distanceFactor={undefined} zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
          <div
            ref={ref}
            style={{
              transform: "translate(8px, -8px)",
              color: "#ffffff",
              fontSize: isHover ? 13 : 12,
              fontFamily: "Inter, system-ui, sans-serif",
              letterSpacing: 0.5,
              whiteSpace: "nowrap",
              textShadow: isHover ? "0 0 8px #fff, 0 0 16px #88f" : "0 0 4px rgba(0,0,0,0.8)",
              padding: "2px 6px",
              borderLeft: `1px solid rgba(255,255,255,${isHover ? 0.9 : 0.4})`,
              background: isHover ? "rgba(0,0,0,0.55)" : "transparent",
              opacity: 0,
              transition: "text-shadow 200ms, background 150ms, font-size 150ms",
            }}
          >
            {star.name}
            {isHover && (
              <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2, letterSpacing: 0.3 }}>
                {star.spectral} · {star.distance.toFixed(2)} ly
              </div>
            )}
          </div>
        </Html>
      </Billboard>
    </group>
  );
}

export function StarLabels() {
  const [hovered, setHovered] = useState<string | null>(null);
  return (
    <>
      {NAMED_STARS.map((s) => (
        <StarLabel key={s.name} star={s} hovered={hovered} setHovered={setHovered} />
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
