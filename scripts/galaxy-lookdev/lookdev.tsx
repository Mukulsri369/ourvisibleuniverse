/**
 * Isolated galaxy look-dev page: one production GalaxyRadiance volume (density
 * cache + exterior star field) at a fixed, repeatable camera pose, so a render
 * can be compared side by side with the galaxy's registered telescope image.
 *
 * Query parameters:
 *   galaxy=<model key>   e.g. m51, m81, m101, m104, m33, catalog-ngc-1300
 *   view=earth|faceon|edgeon   earth = the Solar System's sightline (default)
 *   fill=<number>        disk diameters across the frame height (default 1.15)
 *   optics=1             add the production exposure/tone-map/bloom pipeline
 *   tier=performance|balanced|scientific_high
 *
 * Visual reconstruction only: nothing here is measured data. Loopback QA only.
 */
import React, { useLayoutEffect, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { Canvas, useThree } from "@react-three/fiber";
import * as THREE from "three";
import "../../src/styles.css";
import { GalaxyRadiance } from "../../src/stars/GalaxyRadiance";
import {
  GALAXY_MODELS,
  galaxyCenter,
  galaxyOrientation,
  gToXYZ,
  type GalaxyModel,
} from "../../src/stars/galaxy-models";
import { OBSERVED_IMAGE_BY_KEY } from "../../src/stars/galaxy-observed-images";
import { OpticsPostProcessing } from "../../src/stars/OpticsPostProcessing";
import { useStore } from "../../src/stars/store";

const params = new URLSearchParams(location.search);
const KEY = params.get("galaxy") ?? "m51";
const VIEW = params.get("view") ?? "earth";
const FILL = Number(params.get("fill")) || 1.15;
const OPTICS = params.has("optics");
const TIER = params.get("tier");
if (TIER) useStore.setState({ renderingQualityTier: TIER as never });

const model: GalaxyModel | undefined = GALAXY_MODELS.find((m) => m.key === KEY);

function Pose({ m }: { m: GalaxyModel }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const scene = useThree((s) => s.scene);
  const orientation = useMemo(() => galaxyOrientation(m), [m]);
  useLayoutEffect(() => {
    // The galaxy sits at the origin with its sky orientation; the camera sits on
    // the chosen sightline. "earth" reproduces the Solar System's direction.
    const toEarth = galaxyCenter(m).normalize().negate();
    const normal = new THREE.Vector3(0, 1, 0).applyQuaternion(orientation);
    const inPlane = new THREE.Vector3(1, 0, 0).applyQuaternion(orientation);
    const dir = VIEW === "faceon" ? normal : VIEW === "edgeon" ? inPlane : toEarth;
    const halfFov = THREE.MathUtils.degToRad(camera.fov / 2);
    const distance = (m.diskRadius * FILL) / Math.tan(halfFov);
    camera.position.copy(dir.multiplyScalar(distance));
    // Earth view: celestial north up (north celestial pole at l = 122.932°,
    // b = 27.128°), so the frame matches a north-up telescope image with east left.
    const up =
      VIEW === "faceon"
        ? inPlane.clone()
        : VIEW === "edgeon"
          ? normal.clone()
          : gToXYZ(122.932, 27.128, 1).normalize();
    camera.up.copy(up);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    // `cacheFade` reaches 1 once the baked density field is resident.
    const observed = OBSERVED_IMAGE_BY_KEY.get(m.key);
    (window as any).__galaxyLookdev = {
      ready: true,
      key: m.key,
      view: VIEW,
      // Registered image and its sky rotation, for a north-up side-by-side sheet.
      reference: observed && {
        url: observed.url,
        rotation: observed.avm.rotation,
        mirrored: observed.avm.scale[0] > 0,
        light: observed.light,
      },
      cacheFade: () =>
        (
          scene.getObjectByName("galaxy-radiance:" + m.name) as THREE.Mesh<
            THREE.BufferGeometry,
            THREE.ShaderMaterial
          >
        )?.material.uniforms.uCacheFade.value ?? 0,
    };
  }, [camera, scene, m, orientation]);
  return (
    <group quaternion={orientation}>
      <GalaxyRadiance model={m} />
    </group>
  );
}

const container = document.getElementById("root")!;
createRoot(container).render(
  <main style={{ height: "100dvh", width: "100vw", overflow: "hidden", background: "#000" }}>
    {model ? (
      <Canvas
        dpr={Math.max(1, Math.min(2, Number(params.get("dpr")) || 1))}
        gl={{ antialias: false, logarithmicDepthBuffer: true, preserveDrawingBuffer: true }}
        camera={{ fov: 42, near: 1, far: 1e12 }}
      >
        <Pose m={model} />
        {OPTICS && <OpticsPostProcessing />}
      </Canvas>
    ) : (
      <pre style={{ color: "#ccc", padding: 16 }}>
        Unknown galaxy key "{KEY}". Known keys:{"\n"}
        {GALAXY_MODELS.map((m) => m.key).join("\n")}
      </pre>
    )}
    <p className="pointer-events-none fixed bottom-2 left-4 text-xs text-neutral-400">
      Look-dev · {model?.name ?? KEY} · {VIEW} view · visual reconstruction
    </p>
  </main>,
);
