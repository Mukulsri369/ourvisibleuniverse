import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useStore } from "../store";
import {
  STRUCTURE_FIELD_BUILD,
  STRUCTURE_FIELDS,
  type StructureFieldId,
} from "./structure-fields.generated";
import {
  STRUCTURE_GALAXY_FRAGMENT,
  STRUCTURE_GALAXY_VERTEX,
  STRUCTURE_GLOW_FRAGMENT,
  STRUCTURE_GLOW_VERTEX,
} from "./structure-shaders";
import {
  clearStructureMask,
  createMaskUniforms,
  setStructureMask,
  structureFocus,
  updateMaskUniforms,
} from "./structure-masks";

type Loaded = { galaxies: THREE.BufferGeometry; glow: THREE.BufferGeometry };
const cache = new Map<string, Promise<Loaded>>();

/** Fetch and decode a structure's survey galaxies once; geometries are shared by all mounts. */
function loadField(id: StructureFieldId): Promise<Loaded> {
  const field = STRUCTURE_FIELDS[id];
  let request = cache.get(id);
  if (!request) {
    request = fetch(field.file)
      .then((r) => {
        if (!r.ok) throw Error(`${field.file}: ${r.status}`);
        return r.arrayBuffer();
      })
      .then((buffer) => {
        if (buffer.byteLength !== field.bytes) throw Error(`${field.file}: unexpected size`);
        const { offsets: o, galaxies: n, splats: s } = field;
        const galaxies = new THREE.BufferGeometry();
        galaxies.setAttribute(
          "position",
          new THREE.BufferAttribute(new Int16Array(buffer, o.position, n * 3), 3, true),
        );
        galaxies.setAttribute(
          "aNormal",
          new THREE.BufferAttribute(new Int8Array(buffer, o.normal, n * 3), 3, true),
        );
        galaxies.setAttribute(
          "aProps",
          new THREE.BufferAttribute(new Uint8Array(buffer, o.props, n * 4), 4, true),
        );
        galaxies.setAttribute(
          "aShape",
          new THREE.BufferAttribute(new Uint8Array(buffer, o.shape, n * 4), 4, true),
        );
        const glow = new THREE.BufferGeometry();
        glow.setAttribute(
          "position",
          new THREE.BufferAttribute(new Int16Array(buffer, o.splatPosition, s * 3), 3, true),
        );
        glow.setAttribute(
          "aSplat",
          new THREE.BufferAttribute(new Uint8Array(buffer, o.splatProps, s * 2), 2, true),
        );
        // Positions are normalised to the field extent in the vertex shader.
        const sphere = new THREE.Sphere(new THREE.Vector3(), Math.sqrt(3) * field.extentLy);
        galaxies.boundingSphere = sphere;
        glow.boundingSphere = sphere.clone();
        return { galaxies, glow };
      });
    request.catch(() => cache.delete(id));
    cache.set(id, request);
  }
  return request;
}

/**
 * Real survey galaxies around one cosmic structure (2MRS, SDSS DR17, 6dFGS), with a soft
 * glow of their smoothed light. Depths inside groups, orientations in depth and the palette
 * are labelled reconstructions; see structure-fields.generated.ts for sources and methods.
 */
export function StructureField({ id }: { id: StructureFieldId }) {
  const field = STRUCTURE_FIELDS[id];
  const [data, setData] = useState<Loaded | null>(null);
  const group = useRef<THREE.Group>(null);
  const centre = useMemo(() => new THREE.Vector3(...field.centreLy), [field]);

  const materials = useMemo(() => {
    const masks = createMaskUniforms();
    const shared = {
      uExtent: { value: field.extentLy },
      uPixelScale: { value: 1 },
      uFade: { value: 0 },
      uSlab: { value: field.slabLy },
    };
    const galaxies = new THREE.ShaderMaterial({
      uniforms: {
        ...shared,
        ...masks,
        uExposure: { value: 12 },
        uFloor: { value: 4 },
        uMaxPx: { value: 384 },
        uLogLum: { value: new THREE.Vector2(...STRUCTURE_FIELD_BUILD.logLumRange) },
        uLogRadius: { value: new THREE.Vector2(...STRUCTURE_FIELD_BUILD.logRadiusKpcRange) },
      },
      vertexShader: STRUCTURE_GALAXY_VERTEX,
      fragmentShader: STRUCTURE_GALAXY_FRAGMENT,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const glow = new THREE.ShaderMaterial({
      uniforms: {
        ...shared,
        ...masks,
        uSplatRadius: { value: field.splatRadiusLy },
        uGlow: { value: 0.1 },
        uMaxSplatPx: { value: 160 },
      },
      vertexShader: STRUCTURE_GLOW_VERTEX,
      fragmentShader: STRUCTURE_GLOW_FRAGMENT,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return { galaxies, glow, masks };
  }, [field]);

  useEffect(() => {
    let alive = true;
    loadField(id)
      .then((loaded) => alive && setData(loaded))
      .catch((error) => console.warn("Cosmic structure field unavailable", id, error));
    return () => {
      alive = false;
    };
  }, [id]);

  useEffect(() => {
    if (!data) return;
    setStructureMask({
      id,
      extentLy: field.extentLy,
      kind: field.mask.kind,
      direction: field.mask.direction,
      cosAngle: field.mask.cosAngle,
      distanceLy: field.mask.distanceLy,
      czKmS: field.mask.czKmS,
      centreLy: field.centreLy,
      sphereRadiusLy: field.mask.sphereRadiusLy,
    });
    return () => {
      clearStructureMask(id);
      structureFocus.value = 0;
    };
  }, [data, id, field]);

  useEffect(
    () => () => {
      materials.galaxies.dispose();
      materials.glow.dispose();
    },
    [materials],
  );

  useFrame(({ camera, gl, size }, delta) => {
    if (!group.current) return;
    const perspective = camera as THREE.PerspectiveCamera;
    const pixelScale =
      (size.height * gl.getPixelRatio()) /
      (2 * Math.tan(THREE.MathUtils.degToRad(perspective.fov ?? 40) / 2));
    // Fade in once loaded; hide when the whole field would be under ~6 px.
    const apparent =
      (field.extentLy / Math.max(1, camera.position.distanceTo(centre))) * pixelScale;
    const target = data && apparent > 6 ? 1 : 0;
    const fade = materials.galaxies.uniforms.uFade;
    fade.value = THREE.MathUtils.damp(fade.value, target, 3, Math.min(delta, 0.1));
    materials.galaxies.uniforms.uPixelScale.value = pixelScale;
    // Glow cost is fill rate: splats are stored most significant first, so lower tiers draw fewer.
    const tier = useStore.getState().renderingQualityTier;
    // Measured (DPR 2, Radeon iGPU): all 4,000 Laniakea splats cost ~8 ms, 60% ~3.6 ms.
    const share = tier === "performance" ? 0.25 : tier === "standard" ? 0.4 : 0.6;
    data?.glow.setDrawRange(0, Math.ceil(field.splats * share));
    materials.glow.uniforms.uMaxSplatPx.value =
      (tier === "performance" ? 56 : 80) * gl.getPixelRatio();
    // The glow shows the web from outside; inside a field it would only smear the view.
    const outside = camera.position.distanceTo(centre) / field.extentLy;
    materials.glow.uniforms.uGlow.value = 0.11 * THREE.MathUtils.smoothstep(outside, 0.35, 1.1);
    group.current.visible = fade.value > 0.002;
    // Strongest field in view this frame; the survey cloud reads it on its next frame.
    const frame = gl.info.render.frame;
    if (structureFocus.frame !== frame) {
      structureFocus.frame = frame;
      structureFocus.value = 0;
    }
    structureFocus.value = Math.max(structureFocus.value, fade.value);
    updateMaskUniforms(materials.masks, id, field.extentLy);
  });

  return (
    <group
      ref={group}
      position={centre}
      name={`structure:${id}`}
      userData={{ ready: Boolean(data) }}
    >
      {data && (
        <>
          <points geometry={data.glow} material={materials.glow} frustumCulled={false} />
          <points geometry={data.galaxies} material={materials.galaxies} frustumCulled={false} />
        </>
      )}
    </group>
  );
}
