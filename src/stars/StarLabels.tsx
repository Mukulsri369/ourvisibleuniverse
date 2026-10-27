import { useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { NAMED_STARS, type NamedStar } from "./data";
import { useStore } from "./store";
import { stellarDisplayRadius } from "./camera-navigation";

function StarTarget({ star }: { star: NamedStar }) {
  const ref = useRef<THREE.Mesh>(null!);
  const flyTo = useStore((s) => s.flyToStar);
  useFrame(({ camera, size }) => {
    if (!ref.current) return;
    if (star.name === "Sun") {
      const sun = window.__planetPositions?.get("Sun");
      if (sun) ref.current.position.copy(sun);
    }
    const distance = camera.position.distanceTo(ref.current.position);
    const pixelRadius =
      (distance *
        2 *
        Math.tan(THREE.MathUtils.degToRad((camera as THREE.PerspectiveCamera).fov / 2)) *
        6) /
      Math.max(size.height, 1);
    ref.current.scale.setScalar(Math.max(stellarDisplayRadius(star), pixelRadius));
  });
  return (
    <mesh
      ref={ref}
      name={`star-pick:${star.name}`}
      visible={false}
      position={[star.x, star.y, star.z]}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "";
      }}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        if (e.delta > 4) return;
        e.stopPropagation();
        flyTo(star);
      }}
    >
      <sphereGeometry args={[1, 8, 6]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}

/** Selection targets only: scene names are kept in the sitemap, not floating labels. */
export function StarLabels() {
  const selected = useStore((s) => s.selectedStar);
  return (
    <>
      {NAMED_STARS.map((s) => (
        <StarTarget key={s.name} star={s} />
      ))}
      {selected && !NAMED_STARS.some((s) => s.name === selected.name) && (
        <StarTarget star={selected} />
      )}
    </>
  );
}
