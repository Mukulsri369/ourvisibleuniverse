import { NebulaDensityCache } from "./nebula-density-cache";
import { objectView, viewGain } from "./object-view-settings";
import { NEBULA_BALANCE } from "./nebula-appearance";
import { NEBULA_STELLAR_PROFILES } from "./nebula-stellar-profiles";
import { useNebulaJourney, nebulaMotion } from "./nebula-journey";
import { NebulaStars } from "./NebulaStars";
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { ObservedObject } from "./observed-objects";
import type { ObservedVisualProfile } from "./observed-object-visuals";
import { useStore } from "./store";
import { NEBULA_REFERENCES } from "./nebula-references";
import { NEBULA_VOLUME_VERTEX, NEBULA_VOLUME_FRAGMENT } from "./nebula-volume-shader";

// Explicit IDs prevent emission clouds (Trifid, Rosette) being mistaken for planetary shells.
import { NEBULA_SHAPES } from "./nebula-structure";
function makeNoise() {
  // A small shared lattice replaces hundreds of analytic noise operations per ray sample.
  const size = 64,
    data = new Uint8Array(size ** 3);
  let seed = 2166136261;
  for (let i = 0; i < data.length; i++) {
    seed = Math.imul(seed ^ (seed >>> 13), 1597334677);
    data[i] = (seed >>> 16) & 255;
  }
  const texture = new THREE.Data3DTexture(data, size, size, size);
  texture.format = THREE.RedFormat;
  texture.type = THREE.UnsignedByteType;
  texture.minFilter = texture.magFilter = THREE.LinearFilter;
  texture.wrapS = texture.wrapT = texture.wrapR = THREE.RepeatWrapping;
  texture.unpackAlignment = 1;
  texture.needsUpdate = true;
  return texture;
}
let sharedNoise: THREE.Data3DTexture | undefined;
function getNoise() {
  return (sharedNoise ??= makeNoise());
}

export function NebulaVolume({
  item,
  profile,
  scale,
}: {
  item: ObservedObject;
  profile: ObservedVisualProfile;
  scale: number;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const referenceReady = useRef(false);
  const frameBudget = useRef({ average: 1 / 60, steps: 56 });
  const tier = useStore((s) => s.renderingQualityTier);
  const uniforms = useMemo(() => {
    const empty = new THREE.DataTexture(new Uint8Array([110, 110, 110, 255]), 1, 1);
    empty.needsUpdate = true;
    return {
      uViewGain: { value: 1 },
      uBalance: { value: NEBULA_BALANCE[item.id] ?? 1 },
      uContrast: { value: 1 },
      uDust: { value: 1 },
      uStars: { value: 1 },
      uReveal: { value: 0 },
      uLight: {
        value: new THREE.Vector3(
          ...(NEBULA_STELLAR_PROFILES[item.id]?.cluster?.center ?? [0, 0, 0]),
        ),
      },
      uEye: { value: new THREE.Vector3() },
      uNoise: { value: getNoise() },
      uDensity: { value: getNoise() },
      uDensityReady: { value: 0 },
      uEmission: { value: getNoise() },
      uCacheFade: { value: 0 },
      uReference: { value: empty as THREE.Texture },
      uHasReference: { value: 0 },
      uAspect: { value: 1 },
      uShape: { value: NEBULA_SHAPES[item.id] ?? 20 },
      uPrimary: { value: new THREE.Color(item.color) },
      uSecondary: { value: new THREE.Color(item.accent) },
      uDark: { value: item.nebulaClass === "dark" ? 1 : 0 },
      uSteps: { value: 80 },
      uViewport: { value: 800 },
      uSeed: { value: (profile.seed % 997) / 997 },
    };
  }, [item, profile.seed]);
  const density = useMemo(
    () => new NebulaDensityCache(uniforms, tier === "scientific_high" ? 160 : 128),
    [uniforms, tier],
  );
  useEffect(() => () => density.dispose(), [density]);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: NEBULA_VOLUME_VERTEX,
        fragmentShader: NEBULA_VOLUME_FRAGMENT,
        uniforms,
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false,
        blending: THREE.NormalBlending,
      }),
    [uniforms],
  );
  useEffect(() => () => material.dispose(), [material]);
  useEffect(() => {
    const reference = NEBULA_REFERENCES[item.id],
      fallback = uniforms.uReference.value;
    const controller = new AbortController();
    let loaded: THREE.Texture | undefined;
    let bitmap: ImageBitmap | undefined;
    let alive = true;
    if (reference) {
      const max = tier === "scientific_high" ? 2048 : tier === "performance" ? 768 : 1280;
      const ratio = Math.min(1, max / Math.max(reference.width, reference.height));
      // Resize while decoding, off the main thread. Never allocate a 9K GPU map
      // or paint a multi-megapixel canvas during an orbit/zoom gesture.
      void fetch(reference.url, { signal: controller.signal })
        .then((r) => {
          if (!r.ok) throw Error("Nebula image " + r.status);
          return r.blob();
        })
        .then((blob) =>
          createImageBitmap(blob, {
            imageOrientation: "flipY",
            resizeWidth: Math.max(1, Math.round(reference.width * ratio)),
            resizeHeight: Math.max(1, Math.round(reference.height * ratio)),
            resizeQuality: "high",
          }),
        )
        .then((decoded) => {
          bitmap = decoded;
          if (!alive) {
            decoded.close();
            return;
          }
          loaded = new THREE.Texture(decoded);
          loaded.colorSpace = THREE.SRGBColorSpace;
          loaded.minFilter = THREE.LinearMipmapLinearFilter;
          loaded.magFilter = THREE.LinearFilter;
          loaded.anisotropy = 4;
          loaded.needsUpdate = true;
          uniforms.uReference.value = loaded;
          uniforms.uAspect.value = decoded.width / decoded.height;
          referenceReady.current = true;
        })
        .catch((error) => {
          if (error.name !== "AbortError")
            console.warn("Nebula image unavailable; using reconstructed volume", item.id, error);
        });
    }
    return () => {
      alive = false;
      controller.abort();
      referenceReady.current = false;
      uniforms.uHasReference.value = 0;
      uniforms.uReference.value = fallback;
      loaded?.dispose();
      bitmap?.close();
    };
  }, [item.id, tier, uniforms]);
  useEffect(() => {
    const placeholder = uniforms.uReference.value;
    return () => placeholder.dispose();
  }, [uniforms]);
  useFrame(({ camera, size, gl }, delta) => {
    if (density.bake(gl, uniforms)) {
      uniforms.uDensity.value = density.target.textures[0];
      uniforms.uEmission.value = density.target.textures[1];
      uniforms.uDensityReady.value = 1;
    }
    uniforms.uCacheFade.value = THREE.MathUtils.damp(
      uniforms.uCacheFade.value,
      uniforms.uDensityReady.value,
      4,
      Math.min(delta, 0.1),
    );
    const object = mesh.current;
    if (!object) return;
    // Subtract astronomical world coordinates in JS double precision, not GLSL floats.
    object.updateWorldMatrix(true, false);
    uniforms.uEye.value.copy(camera.position);
    object.worldToLocal(uniforms.uEye.value);
    const distance = uniforms.uEye.value.length();
    const view = objectView(item.id),
      journey = useNebulaJourney.getState();
    const damp = (
      key: "uViewGain" | "uBalance" | "uContrast" | "uDust" | "uStars" | "uReveal",
      value: number,
    ) => {
      uniforms[key].value = THREE.MathUtils.damp(
        uniforms[key].value,
        value,
        5,
        Math.min(delta, 0.1),
      );
    };
    damp("uViewGain", viewGain(view));
    damp("uBalance", view.auto ? (NEBULA_BALANCE[item.id] ?? 1) : 1);
    damp("uContrast", view.contrast);
    damp("uDust", view.dust);
    damp("uStars", view.stars);
    damp("uReveal", journey.id === item.id ? nebulaMotion.reveal : 0);
    uniforms.uHasReference.value = THREE.MathUtils.damp(
      uniforms.uHasReference.value,
      referenceReady.current ? 1 : 0,
      4,
      Math.min(delta, 0.1),
    );
    uniforms.uViewport.value = size.height * gl.getPixelRatio();
    const budget = frameBudget.current;
    budget.average += (Math.min(delta, 0.1) - budget.average) * 0.025;
    const desired = tier === "performance" ? 32 : tier === "standard" ? 40 : 64;
    budget.steps +=
      ((budget.average > 0.038 ? Math.min(desired, 48) : desired) - budget.steps) * 0.025;
    uniforms.uSteps.value = Math.round(budget.steps);
    object.visible = distance < 2500;
  });
  return (
    <mesh
      ref={mesh}
      name={"nebula-volume:" + item.id}
      rotation={profile.tilt}
      scale={scale * 0.8}
      frustumCulled={false}
      material={material}
      renderOrder={10}
    >
      <boxGeometry args={[3.2, 3.2, 3.2]} />
      <NebulaStars id={item.id} uniforms={uniforms} />
    </mesh>
  );
}
