import { Billboard, Html } from "@react-three/drei";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OBSERVED_OBJECTS, objectPosition, type ObservedObject } from "./observed-objects";
import { useStore } from "./store";

function seeded(seed: number) {
  let s = seed | 0;
  return () => {
    s = Math.imul(s ^ (s >>> 15), 1 | s);
    s ^= s + Math.imul(s ^ (s >>> 7), 61 | s);
    return ((s ^ (s >>> 14)) >>> 0) / 4294967296;
  };
}
function cloudGeometry(item: ObservedObject) {
  const count = item.visual === "cloud" ? 850 : 500,
    r = seeded(item.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0));
  const a = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const u = r(),
      v = r(),
      w = r();
    const rad = Math.pow(u, 0.48);
    const th = v * Math.PI * 2,
      ph = Math.acos(2 * w - 1);
    let x = Math.sin(ph) * Math.cos(th) * rad,
      y = Math.cos(ph) * rad,
      z = Math.sin(ph) * Math.sin(th) * rad;
    if (item.visual === "bipolar") {
      y *= 1.8;
      x *= 0.48;
      z *= 0.48;
    } else if (item.visual === "remnant") {
      const shell = 0.78 + 0.22 * r();
      x *= shell;
      y *= shell;
      z *= shell;
    } else if (item.visual === "shell") {
      const shell = 0.74 + 0.26 * r();
      x *= shell;
      y *= shell * 0.55;
      z *= shell;
    }
    a[i * 3] = x;
    a[i * 3 + 1] = y;
    a[i * 3 + 2] = z;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(a, 3));
  return g;
}
function Detail({ item, scale }: { item: ObservedObject; scale: number }) {
  const spin = useRef<THREE.Group>(null);
  const geometry = useMemo(() => cloudGeometry(item), [item]);
  useFrame((_, raw) => {
    const dt = Math.min(raw, 0.05);
    if (spin.current) spin.current.rotation.y += dt * (item.visual === "pulsar" ? 2.4 : 0.05);
  });
  if (["cloud", "shell", "bipolar", "remnant"].includes(item.visual))
    return (
      <group ref={spin}>
        <points scale={scale}>
          <primitive object={geometry} attach="geometry" />
          <pointsMaterial
            color={item.color}
            size={Math.max(scale * 0.025, 1e-10)}
            sizeAttenuation
            transparent
            opacity={0.62}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
        {item.visual === "shell" && (
          <mesh scale={[scale, scale * 0.55, scale]} rotation-x={Math.PI / 2}>
            <torusGeometry args={[0.72, 0.1, 8, 72]} />
            <meshBasicMaterial
              color={item.accent}
              transparent
              opacity={0.35}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        )}
      </group>
    );
  if (item.visual === "pulsar")
    return (
      <group ref={spin}>
        <mesh>
          <sphereGeometry args={[scale * 0.08, 16, 12]} />
          <meshBasicMaterial color={item.color} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[0, s * scale * 0.55, 0]} rotation-z={s > 0 ? 0 : Math.PI}>
            <coneGeometry args={[scale * 0.12, scale, 16, 1, true]} />
            <meshBasicMaterial
              color={item.accent}
              transparent
              opacity={0.22}
              side={THREE.DoubleSide}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        ))}
      </group>
    );
  if (item.visual === "blackhole")
    return (
      <group ref={spin}>
        <mesh>
          <sphereGeometry args={[scale * 0.18, 20, 16]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        <mesh rotation-x={Math.PI / 2}>
          <torusGeometry args={[scale * 0.34, scale * 0.11, 12, 64]} />
          <meshBasicMaterial
            color={item.color}
            transparent
            opacity={0.86}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        <mesh rotation-x={Math.PI / 2}>
          <ringGeometry args={[scale * 0.2, scale * 0.65, 64]} />
          <meshBasicMaterial
            color={item.accent}
            transparent
            opacity={0.18}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      </group>
    );
  if (item.visual === "jet")
    return (
      <group ref={spin}>
        <mesh>
          <sphereGeometry args={[scale * 0.07, 16, 12]} />
          <meshBasicMaterial color={item.color} />
        </mesh>
        <mesh rotation-z={-Math.PI / 2} position={[scale * 0.65, 0, 0]}>
          <coneGeometry args={[scale * 0.08, scale * 1.2, 12, 1, true]} />
          <meshBasicMaterial
            color={item.accent}
            transparent
            opacity={0.35}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        <mesh rotation-z={Math.PI / 2} position={[-scale * 0.65, 0, 0]}>
          <coneGeometry args={[scale * 0.08, scale * 1.2, 12, 1, true]} />
          <meshBasicMaterial
            color={item.accent}
            transparent
            opacity={0.18}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>
    );
  return (
    <group ref={spin}>
      <mesh>
        <sphereGeometry args={[scale * 0.22, 20, 14]} />
        <meshBasicMaterial color={item.color} />
      </mesh>
      <mesh>
        <sphereGeometry args={[scale * 0.45, 16, 12]} />
        <meshBasicMaterial
          color={item.accent}
          transparent
          opacity={0.12}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
function ObjectNode({ item }: { item: ObservedObject }) {
  const selected = useStore((s) => s.selectedObjectId === item.id),
    select = useStore((s) => s.setSelectedObject);
  const [hover, setHover] = useState(false);
  const position = objectPosition(item);
  const physical = Math.max(item.diameterLy, 0.000000001);
  const closeScale = Math.max(
    physical,
    item.category === "Nebula" || item.category === "Quasar" ? physical : 2e-7,
  );
  const pick = Math.max(physical, item.distance * 2e-5, 0.000001);
  const click = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    select(item.id);
  };
  return (
    <group position={position}>
      <mesh
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
        }}
        onPointerOut={() => setHover(false)}
        onClick={click}
      >
        <sphereGeometry args={[pick, 8, 6]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {selected && <Detail item={item} scale={closeScale} />}{" "}
      {(hover || selected) && (
        <Billboard>
          <Html
            center
            distanceFactor={Math.max(pick * 15, 0.00001)}
            style={{ pointerEvents: "auto" }}
          >
            <button
              onClick={() => select(item.id)}
              className="whitespace-nowrap rounded-md border border-white/15 bg-black/80 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-white backdrop-blur"
            >
              {item.name}
              <span className="ml-2 text-white/45">{item.category}</span>
            </button>
          </Html>
        </Billboard>
      )}
    </group>
  );
}
export function ObservedObjects() {
  return (
    <>
      {OBSERVED_OBJECTS.map((item) => (
        <ObjectNode key={item.id} item={item} />
      ))}
    </>
  );
}
