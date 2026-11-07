import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { NEARBY_GALAXIES } from "./galaxy-catalog";
import { GALAXY_BY_NAME, gToXYZ } from "./galaxy-models";
import { ObservationalGalaxyNode } from "./ObservationalGalaxyNode";
import { GalaxySpatialIndex, resolvedGalaxyIndices } from "./galaxy-spatial-index";
import {
  CATALOGUE_VERTEX,
  CATALOGUE_FRAGMENT,
  catalogueShape,
  catalogueOrientation,
} from "./galaxy-catalogue-shader";
import { galaxyDetailAlpha } from "./galaxy-detail-state";
import { useStore } from "./store";
import { useGalaxyJourney } from "./galaxy-journey";
import { galaxyDistanceLabel } from "./galaxy-measurement-format";
const rows = NEARBY_GALAXIES.filter((g) => g.name !== "Andromeda (M31)");
const items = rows.map((g) => ({ position: gToXYZ(g.l, g.b, g.distance), radius: g.size * 0.65 }));
const spatialIndex = new GalaxySpatialIndex(items);
/** One batched distant field; only a bounded nearby/selected subset mounts existing 3D clouds. */
export function CatalogueGalaxyField() {
  const { camera, size } = useThree(),
    points = useRef<THREE.Points>(null!);
  const [resolved, setResolved] = useState<number[]>([]);
  const [hovered, setHovered] = useState<number | null>(null);
  useEffect(() => {
    if (hovered === null) return;
    document.body.style.cursor = "pointer";
    return () => {
      document.body.style.cursor = "";
    };
  }, [hovered]);
  const resource = useMemo(() => {
    const geometry = new THREE.BufferGeometry(),
      high = new Float32Array(rows.length * 3),
      low = new Float32Array(rows.length * 3),
      shape = new Float32Array(rows.length * 4),
      orientation = new Float32Array(rows.length * 4),
      seed = new Float32Array(rows.length),
      mask = new Float32Array(rows.length);
    rows.forEach((g, i) => {
      const p = items[i].position;
      for (let k = 0; k < 3; k++) {
        const v = p.getComponent(k);
        high[i * 3 + k] = Math.fround(v);
        low[i * 3 + k] = v - high[i * 3 + k];
      }
      const model = GALAXY_BY_NAME.get(g.name)!;
      shape.set(catalogueShape(model), i * 4);
      orientation.set(catalogueOrientation(model), i * 4);
      let hash = 2166136261;
      for (const c of g.id) hash = Math.imul(hash ^ c.charCodeAt(0), 16777619);
      seed[i] = (hash >>> 0) / 4294967296;
    });
    geometry.setAttribute("position", new THREE.BufferAttribute(high, 3));
    geometry.setAttribute("aPositionLow", new THREE.BufferAttribute(low, 3));
    geometry.setAttribute("aShape", new THREE.BufferAttribute(shape, 4));
    geometry.setAttribute("aOrientation", new THREE.BufferAttribute(orientation, 4));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    geometry.setAttribute(
      "aMask",
      new THREE.BufferAttribute(mask, 1).setUsage(THREE.DynamicDrawUsage),
    );
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uCameraHigh: { value: new THREE.Vector3() },
        uCameraLow: { value: new THREE.Vector3() },
        uHeight: { value: 720 },
      },
      vertexShader: CATALOGUE_VERTEX,
      fragmentShader: CATALOGUE_FRAGMENT,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return { geometry, material, mask };
  }, []);
  useEffect(
    () => () => {
      resource.geometry.dispose();
      resource.material.dispose();
    },
    [resource],
  );
  useEffect(() => {
    const update = () => {
      camera.updateMatrixWorld();
      const names = [
          useStore.getState().visitGalaxy?.name,
          useGalaxyJourney.getState().galaxy?.name,
        ],
        preferred = names.map((n) => rows.findIndex((g) => g.name === n));
      const next = resolvedGalaxyIndices(
        spatialIndex,
        camera as THREE.PerspectiveCamera,
        size.height,
        size.width < 640 ? 4 : 8,
        preferred,
      );
      setResolved((old) =>
        old.length === next.length && old.every((n, i) => n === next[i]) ? old : next,
      );
    };
    update();
    const timer = setInterval(update, 250);
    return () => clearInterval(timer);
  }, [camera, size.width, size.height]);
  useFrame(() => {
    const high = resource.material.uniforms.uCameraHigh.value as THREE.Vector3,
      low = resource.material.uniforms.uCameraLow.value as THREE.Vector3;
    high.set(
      Math.fround(camera.position.x),
      Math.fround(camera.position.y),
      Math.fround(camera.position.z),
    );
    low.copy(camera.position).sub(high);
    resource.material.uniforms.uHeight.value = size.height;
    resource.mask.fill(0);
    for (const i of resolved) resource.mask[i] = 1;
    for (const name of [
      useStore.getState().visitGalaxy?.name,
      useGalaxyJourney.getState().galaxy?.name,
    ]) {
      if (!name) continue;
      const i = rows.findIndex((g) => g.name === name),
        model = GALAXY_BY_NAME.get(name);
      if (i >= 0 && model)
        resource.mask[i] = Math.max(resource.mask[i], galaxyDetailAlpha.get(model.key) ?? 0);
    }
    resource.geometry.getAttribute("aMask").needsUpdate = true;
  });
  const select = (event: ThreeEvent<MouseEvent>) => {
    if (event.delta > 4 || event.index === undefined) return;
    const g = rows[event.index],
      p = items[event.index].position;
    if (!g) return;
    event.stopPropagation();
    useStore.getState().setVisitGalaxy({
      name: g.name,
      x: p.x,
      y: p.y,
      z: p.z,
      size: g.size,
      distance: g.distance,
      type: g.type,
      view: "overview",
    });
  };
  const raycast = (raycaster: THREE.Raycaster, hits: THREE.Intersection[]) => {
    if (!points.current || !raycaster.camera) return;
    const mouse = raycaster.ray.at(1, new THREE.Vector3()).project(camera),
      view = new THREE.Vector3();
    let best = Infinity,
      choice = -1;
    for (let i = 0; i < items.length; i++) {
      if (resource.mask[i] > 0.99) continue;
      view.copy(items[i].position).applyMatrix4(camera.matrixWorldInverse);
      if (view.z >= 0) continue;
      const pixelRadius =
        THREE.MathUtils.clamp(
          (rows[i].size *
            0.5 *
            size.height *
            (camera as THREE.PerspectiveCamera).projectionMatrix.elements[5]) /
            -view.z,
          5,
          128,
        ) / 2;
      view.applyMatrix4(camera.projectionMatrix);
      if (view.z < -1 || view.z > 1) continue;
      const dx = ((view.x - mouse.x) * size.width) / 2,
        dy = ((view.y - mouse.y) * size.height) / 2,
        score = (dx * dx + dy * dy) / (pixelRadius * pixelRadius);
      if (score < 1 && score < best) {
        best = score;
        choice = i;
      }
    }
    if (choice >= 0)
      hits.push({
        distance: camera.position.distanceTo(items[choice].position),
        point: items[choice].position.clone(),
        object: points.current,
        index: choice,
      });
  };
  return (
    <group name="bounded-named-galaxy-overview">
      <points
        ref={points}
        geometry={resource.geometry}
        material={resource.material}
        frustumCulled={false}
        raycast={raycast}
        onClick={select}
        onPointerMove={(event) => {
          if (event.index !== undefined) {
            event.stopPropagation();
            setHovered(event.index);
          }
        }}
        onPointerOut={() => setHovered(null)}
      />
      {resolved.map((i) => (
        <ObservationalGalaxyNode key={rows[i].id} g={rows[i]} />
      ))}
      {hovered !== null && (
        <Html
          position={items[hovered].position.toArray()}
          center
          zIndexRange={[15, 0]}
          style={{ pointerEvents: "none" }}
        >
          <div className="ml-4 whitespace-nowrap rounded-lg border border-white/15 bg-neutral-950 px-3 py-2 text-xs text-white">
            <span className="block font-medium">{rows[hovered].name}</span>
            <span className="mt-1 block text-neutral-300">
              {rows[hovered].type} · {galaxyDistanceLabel(rows[hovered])}
            </span>
          </div>
        </Html>
      )}
    </group>
  );
}
