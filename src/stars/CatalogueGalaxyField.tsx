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
import { catalogueAppearance } from "./galaxy-overview-appearance";
const rows = NEARBY_GALAXIES.filter((g) => g.name !== "Andromeda (M31)");
const rowByName = new Map(rows.map((g, i) => [g.name, i]));
const items = rows.map((g) => ({ position: gToXYZ(g.l, g.b, g.distance), radius: g.size * 0.65 }));
const spatialIndex = new GalaxySpatialIndex(items);
/** One batched distant field; only a bounded nearby/selected subset mounts existing 3D clouds. */
export function CatalogueGalaxyField() {
  const { camera, size, gl } = useThree(),
    points = useRef<THREE.Points>(null!);
  const navigating = useRef(false);
  const skipHoverPicking = useRef(false);
  const [resolved, setResolved] = useState<number[]>([]);
  const [hovered, setHovered] = useState<number | null>(null);
  useEffect(() => {
    const canvas = gl.domElement;
    const start = () => {
      navigating.current = true;
      // R3F must record the initial hit on pointerdown for a later true click.
      skipHoverPicking.current = false;
      setHovered(null);
    };
    const end = (event: PointerEvent) => {
      navigating.current = event.buttons !== 0;
      skipHoverPicking.current = false;
    };
    const move = (event: PointerEvent) => {
      skipHoverPicking.current = event.buttons !== 0;
    };
    const reset = () => {
      navigating.current = false;
      skipHoverPicking.current = false;
    };
    canvas.addEventListener("pointerdown", start, true);
    canvas.addEventListener("pointermove", move, true);
    canvas.addEventListener("lostpointercapture", reset, true);
    window.addEventListener("pointerup", end, true);
    window.addEventListener("pointercancel", reset, true);
    window.addEventListener("blur", reset);
    return () => {
      canvas.removeEventListener("pointerdown", start, true);
      canvas.removeEventListener("pointermove", move, true);
      canvas.removeEventListener("lostpointercapture", reset, true);
      window.removeEventListener("pointerup", end, true);
      window.removeEventListener("pointercancel", reset, true);
      window.removeEventListener("blur", reset);
    };
  }, [gl]);
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
      oldColor = new Float32Array(rows.length * 3),
      youngColor = new Float32Array(rows.length * 3),
      appearance = new Float32Array(rows.length * 4),
      features = new Float32Array(rows.length * 4),
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
      const profile = catalogueAppearance(model, g);
      oldColor.set(profile.oldColor, i * 3);
      youngColor.set(profile.youngColor, i * 3);
      appearance.set(profile.parameters, i * 4);
      features.set(profile.features, i * 4);
      let hash = 2166136261;
      for (const c of g.id) hash = Math.imul(hash ^ c.charCodeAt(0), 16777619);
      seed[i] = (hash >>> 0) / 4294967296;
    });
    geometry.setAttribute("position", new THREE.BufferAttribute(high, 3));
    geometry.setAttribute("aPositionLow", new THREE.BufferAttribute(low, 3));
    geometry.setAttribute("aShape", new THREE.BufferAttribute(shape, 4));
    geometry.setAttribute("aOrientation", new THREE.BufferAttribute(orientation, 4));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    geometry.setAttribute("aOldColor", new THREE.BufferAttribute(oldColor, 3));
    geometry.setAttribute("aYoungColor", new THREE.BufferAttribute(youngColor, 3));
    geometry.setAttribute("aAppearance", new THREE.BufferAttribute(appearance, 4));
    geometry.setAttribute("aFeatures", new THREE.BufferAttribute(features, 4));
    geometry.setAttribute(
      "aMask",
      new THREE.BufferAttribute(mask, 1).setUsage(THREE.DynamicDrawUsage),
    );
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uCameraHigh: { value: new THREE.Vector3() },
        uCameraLow: { value: new THREE.Vector3() },
        uHeight: { value: 720 },
        uPixelRatio: { value: 1 },
      },
      vertexShader: CATALOGUE_VERTEX,
      fragmentShader: CATALOGUE_FRAGMENT,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return {
      geometry,
      material,
      mask,
      nextMask: new Float32Array(rows.length),
      cursor: new THREE.Vector3(),
      view: new THREE.Vector3(),
    };
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
      // Keep the existing world-anchored preview pool stable throughout a drag.
      if (navigating.current) return;
      camera.updateMatrixWorld();
      const names = [
          useStore.getState().visitGalaxy?.name,
          useGalaxyJourney.getState().galaxy?.name,
        ],
        preferred = names.map((n) => (n ? (rowByName.get(n) ?? -1) : -1));
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
    resource.material.uniforms.uHeight.value = size.height * gl.getPixelRatio();
    resource.material.uniforms.uPixelRatio.value = gl.getPixelRatio();
    resource.nextMask.fill(0);
    for (const i of resolved) resource.nextMask[i] = 1;
    for (const name of [
      useStore.getState().visitGalaxy?.name,
      useGalaxyJourney.getState().galaxy?.name,
    ]) {
      if (!name) continue;
      const i = rowByName.get(name) ?? -1,
        model = GALAXY_BY_NAME.get(name);
      if (i >= 0 && model)
        resource.nextMask[i] = Math.max(
          resource.nextMask[i],
          galaxyDetailAlpha.get(model.key) ?? 0,
        );
    }
    let changed = false;
    for (let i = 0; i < resource.mask.length; i++) {
      if (resource.mask[i] !== resource.nextMask[i]) {
        resource.mask[i] = resource.nextMask[i];
        changed = true;
      }
    }
    if (changed) resource.geometry.getAttribute("aMask").needsUpdate = true;
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
    if (skipHoverPicking.current || !points.current || !raycaster.camera) return;
    const mouse = raycaster.ray.at(1, resource.cursor).project(camera),
      view = resource.view;
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
          if (!navigating.current && event.buttons === 0 && event.index !== undefined) {
            event.stopPropagation();
            setHovered(event.index);
          }
        }}
        onPointerOut={() => setHovered(null)}
      />
      {resolved.map((i) => (
        <ObservationalGalaxyNode key={rows[i].id} g={rows[i]} navigating={navigating} />
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
