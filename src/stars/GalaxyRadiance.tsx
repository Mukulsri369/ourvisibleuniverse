import { GalaxyInteriorField } from "./GalaxyInteriorField";
import { GalaxyDensityCache } from "./galaxy-density-cache";
import { useGalaxyJourney, galaxyMotion } from "./galaxy-journey";
import { SGR_A_DISTANCE_LY } from "@/lib/astronomy/galactic-scene";
import { GALAXY_FRAGMENT } from "./galaxy-volume-shader";
import { GALAXY_REFERENCES } from "./galaxy-references";
import { useStore } from "./store";
import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { GalaxyModel } from "./galaxy-models";
import { motionTimeSeconds } from "./sim-clock";
const VERT = /* glsl */ `
#include <common>
#include <logdepthbuf_pars_vertex>
varying vec3 vP;varying vec2 vUv;
void main(){vP=position;vUv=uv;vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;
#include <logdepthbuf_vertex>
}`;
const PHOTO = /* glsl */ `
#include <logdepthbuf_pars_fragment>
uniform sampler2D uReference;uniform float uPhotoOpacity;varying vec2 vUv;
void main(){
#include <logdepthbuf_fragment>
 vec3 color=texture2D(uReference,vUv).rgb;
 float lum=max(max(color.r,color.g),color.b);
 float edge=min(min(vUv.x,1.-vUv.x),min(vUv.y,1.-vUv.y));
 vec3 broad=textureLod(uReference,vUv,6.).rgb;
 float diffuse=max(max(broad.r,broad.g),broad.b);
 float footprint=smoothstep(.012,.085,diffuse);
 float alpha=footprint*smoothstep(0.,.08,edge)*uPhotoOpacity;
 if(alpha<.002)discard;
 gl_FragColor=vec4(color*7.,alpha);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`;
/** Owns the exterior photograph and the 3D volume: exactly one coordinated presentation. */
export function GalaxyRadiance({ model, opacity = 1 }: { model: GalaxyModel; opacity?: number }) {
  const ref = useRef<THREE.Mesh>(null!);
  const photo = useRef<THREE.Mesh>(null!);
  const renderer = useThree((s) => s.gl);
  const inspecting = useRef(false);
  const selected = useStore((s) => s.visitGalaxy?.name === model.name);
  useEffect(() => {
    inspecting.current = false;
  }, [selected]);
  useEffect(() => {
    const inspect = () => {
      inspecting.current = true;
    };
    renderer.domElement.addEventListener("pointerdown", inspect);
    return () => renderer.domElement.removeEventListener("pointerdown", inspect);
  }, [renderer]);
  const tier = useStore((s) => s.renderingQualityTier);
  const entered = useGalaxyJourney((s) => s.galaxy?.name === model.name);
  const eye = useMemo(() => new THREE.Vector3(), []),
    direction = useMemo(() => new THREE.Vector3(), []);
  const observer = useRef<THREE.Vector3 | null>(null);
  const inverseRotation = useMemo(() => new THREE.Quaternion(), []);
  const uniforms = useMemo(() => {
    let seed = 0;
    for (const c of model.name) seed = (seed * 31 + c.charCodeAt(0)) % 997;
    const mode = [
      "elliptical",
      "spiral",
      "barred",
      "ring",
      "irregular",
      "edge-on",
      "starburst",
      "interacting",
      "dwarf",
      "lenticular",
    ].indexOf(
      model.morphology === "grand-design" || model.morphology === "flocculent"
        ? "spiral"
        : model.morphology,
    );
    return {
      uEye: { value: new THREE.Vector3() },
      uNoise: { value: getGalaxyNoise() },
      uReference: {
        value: new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1) as THREE.Texture,
      },
      uHasReference: { value: 0 },
      uAspect: { value: 1 },
      uField: { value: null as THREE.Texture | null },
      uCacheFade: { value: 0 },
      uVolumeWeight: { value: 0 },
      uPhotoOpacity: { value: 0 },
      uSteps: { value: 32 },
      uReveal: { value: 0 },
      uOld: { value: new THREE.Color(...model.oldColor) },
      uYoung: { value: new THREE.Color(...model.youngColor) },
      uMode: { value: Math.max(0, mode) },
      uSeed: { value: seed / 13 },
      uArms: { value: Math.max(2, model.arms) },
      uPitch: { value: THREE.MathUtils.degToRad(Math.max(8, model.pitchDeg)) },
      uBulge: { value: model.bulgeRadius / model.diskRadius },
      uBar: { value: model.barLength / model.diskRadius },
      uDust: { value: model.dustLanes ? 1 : 0 },
      uSingleTail: { value: /tadpole/i.test(model.name) ? 1 : 0 },
      uGroup: { value: /quintet/i.test(model.name) ? 1 : 0 },
      uCenA: { value: model.key === "cena" ? 1 : 0 },
      uRotationRate: {
        value: ["elliptical", "dwarf", "lenticular", "irregular"].includes(model.morphology)
          ? 0
          : Math.PI / model.rotPeriod,
      },
      uTime: { value: 0 },
      uOpacity: { value: opacity },
    };
  }, [model, opacity]);
  const cache = useMemo(
    () => new GalaxyDensityCache(uniforms, tier === "performance" ? 80 : 128),
    [uniforms, tier],
  );
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms,
        vertexShader: VERT,
        fragmentShader: GALAXY_FRAGMENT,
        transparent: true,
        depthWrite: false,
        side: THREE.BackSide,
      }),
    [uniforms],
  );
  const photoMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms,
        vertexShader: VERT,
        fragmentShader: PHOTO,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    [uniforms],
  );
  useEffect(() => {
    uniforms.uCacheFade.value = 0;
    return () => cache.dispose();
  }, [cache, uniforms]);
  useEffect(
    () => () => {
      material.dispose();
      photoMaterial.dispose();
    },
    [material, photoMaterial],
  );
  useEffect(() => {
    const placeholder = uniforms.uReference.value;
    placeholder.needsUpdate = true;
    return () => placeholder.dispose();
  }, [uniforms]);
  useEffect(() => {
    const reference = GALAXY_REFERENCES[model.key];
    if (!reference) return;
    let alive = true;
    let bitmap: ImageBitmap | undefined, texture: THREE.Texture | undefined;
    const controller = new AbortController();
    const max = tier === "performance" ? 2048 : 4096;
    const ratio = Math.min(1, max / Math.max(reference.width, reference.height));
    void fetch(reference.url, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw Error("Galaxy reference " + r.status);
        return r.blob();
      })
      .then((blob) =>
        createImageBitmap(blob, {
          imageOrientation: "flipY",
          resizeWidth: Math.round(reference.width * ratio),
          resizeHeight: Math.round(reference.height * ratio),
          resizeQuality: "high",
        }),
      )
      .then((image) => {
        bitmap = image;
        if (!alive) {
          image.close();
          return;
        }
        texture = new THREE.Texture(image);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.anisotropy = 4;
        texture.needsUpdate = true;
        uniforms.uReference.value = texture;
        uniforms.uAspect.value = image.width / image.height;
        uniforms.uHasReference.value = 1;
      })
      .catch((e) => {
        if (e.name !== "AbortError") console.warn("Galaxy reference unavailable", model.name);
      });
    const fallback = uniforms.uReference.value;
    return () => {
      alive = false;
      controller.abort();
      uniforms.uHasReference.value = 0;
      uniforms.uReference.value = fallback;
      texture?.dispose();
      bitmap?.close();
    };
  }, [model.key, model.name, tier, uniforms]);

  useFrame(({ camera, gl }, dt) => {
    if (!ref.current) return;
    ref.current.updateWorldMatrix(true, false);
    ref.current.worldToLocal(eye.copy(camera.position));
    uniforms.uEye.value.copy(eye);
    uniforms.uTime.value = motionTimeSeconds();
    const reveal = entered ? galaxyMotion.reveal : 0;
    uniforms.uReveal.value = reveal;
    if (selected || entered || (ref.current.visible && uniforms.uOpacity.value > 0.001)) {
      const ready = cache.bake(gl);
      uniforms.uField.value = cache.target.texture;
      uniforms.uCacheFade.value = THREE.MathUtils.damp(
        uniforms.uCacheFade.value,
        ready ? 1 : 0,
        5,
        Math.min(dt, 0.1),
      );
    }
    if (!observer.current && eye.length() > 1.2) observer.current = eye.clone().normalize();
    if (!inspecting.current && observer.current) observer.current.copy(eye).normalize();
    direction.copy(eye).normalize();
    const offAxis = observer.current
      ? 1 - THREE.MathUtils.smoothstep(direction.dot(observer.current), 0.72, 0.97)
      : 1;
    const passage = entered ? THREE.MathUtils.smoothstep(galaxyMotion.progress, 0.015, 0.3) : 0;
    const hasPhoto = uniforms.uHasReference.value > 0.5;
    const volumeWeight = (hasPhoto ? Math.max(passage, offAxis) : 1) * uniforms.uCacheFade.value;
    uniforms.uVolumeWeight.value = volumeWeight;
    uniforms.uPhotoOpacity.value = hasPhoto
      ? (1 - volumeWeight) * (1 - reveal) * uniforms.uOpacity.value
      : 0;
    uniforms.uSteps.value = tier === "scientific_high" ? 48 : tier === "performance" ? 24 : 32;
    if (photo.current) {
      ref.current.getWorldQuaternion(inverseRotation).invert();
      photo.current.quaternion.copy(inverseRotation).multiply(camera.quaternion);
      const diameter = model.key === "cena" ? (2 * 33.87) / 25.7 : 2.15;
      photo.current.scale.set(diameter, diameter / uniforms.uAspect.value, 1);
      photo.current.visible = uniforms.uPhotoOpacity.value > 0.001;
    }
  });
  return (
    <mesh
      ref={ref}
      name={"galaxy-radiance:" + model.name}
      scale={model.diskRadius}
      frustumCulled={false}
      material={material}
    >
      <boxGeometry args={[2.7, 2.7, 2.7]} />
      <mesh
        ref={photo}
        material={photoMaterial}
        name={"galaxy-observed-exterior:" + model.name}
        raycast={() => {}}
      >
        <planeGeometry args={[1, 1]} />
      </mesh>
      <GalaxyInteriorField
        model={model}
        count={entered ? 100000 : 18000}
        exterior={!entered}
        visibility={uniforms.uVolumeWeight}
      />
    </mesh>
  );
}

const shared = {
  key: "",
  name: "",
  type: "Barred Spiral",
  morphology: "barred" as const,
  l: 0,
  b: 0,
  distance: 0,
  inclination: 0,
  posAngle: 0,
  diskRadius: 50000,
  bulgeRadius: 5000,
  haloRadius: 100000,
  arms: 4,
  pitchDeg: 13,
  barLength: 12000,
  density: 0.2,
  youngColor: [0.54, 0.72, 1] as [number, number, number],
  oldColor: [1, 0.78, 0.51] as [number, number, number],
  coreColor: "rgba(255,230,190,1)",
  rotPeriod: 700,
  dustLanes: true,
  description: "Morphology-based stellar light and dust reconstruction.",
};
export const MILKY_WAY_APPEARANCE: GalaxyModel = {
  ...shared,
  key: "milky-way",
  name: "Milky Way",
  distance: SGR_A_DISTANCE_LY,
};
export const ANDROMEDA_APPEARANCE: GalaxyModel = {
  ...shared,
  key: "andromeda",
  l: 121.1743,
  b: -21.5732,
  inclination: 77,
  posAngle: 38,
  name: "Andromeda (M31)",
  distance: 2537000,
  diskRadius: 110000,
  bulgeRadius: 18000,
  haloRadius: 150000,
  arms: 2,
  pitchDeg: 10,
  barLength: 14000,
  ringRadius: 32000,
};

let galaxyNoise: THREE.Data3DTexture | undefined;
function getGalaxyNoise() {
  if (galaxyNoise) return galaxyNoise;
  const n = 64,
    data = new Uint8Array(n * n * n);
  let seed = 137;
  for (let i = 0; i < data.length; i++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) | 0;
    data[i] = seed >>> 24;
  }
  const t = new THREE.Data3DTexture(data, n, n, n);
  t.format = THREE.RedFormat;
  t.type = THREE.UnsignedByteType;
  t.minFilter = t.magFilter = THREE.LinearFilter;
  t.wrapS = t.wrapT = t.wrapR = THREE.RepeatWrapping;
  t.unpackAlignment = 1;
  t.needsUpdate = true;
  return (galaxyNoise = t);
}
