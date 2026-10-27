import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GalaxyRadiance } from "./GalaxyRadiance";
import { GalaxyInteriorField } from "./GalaxyInteriorField";
import type { GalaxyModel } from "./galaxy-models";
import { galaxyDetailAlpha } from "./galaxy-detail-state";
/** Low-cost actual 3D catalogue body. Only the active galaxy allocates a density cache. */
export function GalaxyCatalogCloud({
  model,
  fadeInDistance = 0,
}: {
  model: GalaxyModel;
  fadeInDistance?: number;
}) {
  const root = useRef<THREE.Group>(null!);
  const eye = useMemo(() => new THREE.Vector3(), []);
  const alpha = useMemo(() => ({ value: 1 }), []);
  useFrame(({ camera, size }, dt) => {
    if (!root.current) return;
    root.current.getWorldPosition(eye);
    const distance = camera.position.distanceTo(eye),
      fov = (camera as THREE.PerspectiveCamera).fov;
    const worldPerPixel =
      (2 * distance * Math.tan(THREE.MathUtils.degToRad(fov * 0.5))) / Math.max(1, size.height);
    const diameter = 2 * model.diskRadius;
    root.current.scale.setScalar(Math.max(1, (worldPerPixel * 5) / diameter));
    const overview = fadeInDistance
      ? THREE.MathUtils.smoothstep(distance, fadeInDistance, fadeInDistance * 2)
      : 1;
    alpha.value = overview * (1 - (galaxyDetailAlpha.get(model.key) ?? 0));
    root.current.visible = alpha.value > 0.002;
    const volume = root.current.getObjectByName(
      "galaxy-catalog-volume:" + model.name,
    ) as THREE.Mesh;
    if (volume) {
      // Very distant sources need just their stellar population; resolve gas only above a few pixels.
      const resolved = THREE.MathUtils.smoothstep(diameter / Math.max(1, worldPerPixel), 3, 10);
      const material = volume.material as THREE.ShaderMaterial;
      material.uniforms.uOpacity.value = THREE.MathUtils.damp(
        material.uniforms.uOpacity.value,
        alpha.value * resolved,
        8,
        Math.min(dt, 0.1),
      );
      volume.visible = material.uniforms.uOpacity.value > 0.001;
    }
  });
  return (
    <group ref={root} name={"galaxy-catalog-3d:" + model.name}>
      <GalaxyRadiance model={model} preview opacity={0} />
      <group scale={model.diskRadius}>
        <GalaxyInteriorField model={model} count={4096} exterior visibility={alpha} />
      </group>
    </group>
  );
}
