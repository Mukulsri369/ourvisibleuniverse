import { SGR_A_DISTANCE_LY } from "@/lib/astronomy/galactic-scene";
import { GALAXY_FRAGMENT } from "./galaxy-volume-shader";
import { GALAXY_REFERENCES } from "./galaxy-references";
import { useStore } from "./store";
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { GalaxyModel } from "./galaxy-models";
import { motionTimeSeconds } from "./sim-clock";
const VERT = /* glsl */ `
#include <common>
#include <logdepthbuf_pars_vertex>
varying vec3 vP;
void main(){vP=position;vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;
#include <logdepthbuf_vertex>
}`;
const FRAG = GALAXY_FRAGMENT;
export function GalaxyRadiance({ model, opacity = 1 }: { model: GalaxyModel; opacity?: number }) {
  const ref = useRef<THREE.Mesh>(null!);
  const tier = useStore((s) => s.renderingQualityTier);
  const eye = useMemo(() => new THREE.Vector3(), []);
  const stars = useMemo(() => {
    let seed = 17;
    for (const c of model.name) seed = (Math.imul(seed, 31) + c.charCodeAt(0)) | 0;
    const rand = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) | 0;
      return (seed >>> 0) / 4294967296;
    };
    const count = 28000,
      p = new Float32Array(count * 3),
      c = new Float32Array(count * 3);
    const spheroid = ["elliptical", "dwarf"].includes(model.morphology);
    for (let i = 0; i < count; i++) {
      let r = Math.min(1.08, -Math.log(1 - rand() * 0.98) / 4.5),
        angle =
          (Math.floor(rand() * Math.max(2, model.arms)) * Math.PI * 2) / Math.max(2, model.arms) +
          Math.log(Math.max(r, 0.12)) / Math.tan((Math.max(8, model.pitchDeg) * Math.PI) / 180) +
          (rand() - 0.5) * 1.2;
      if (r < 0.18) angle = rand() * Math.PI * 2;
      if (model.morphology === "ring") r = 0.68 + (rand() + rand() - 1) * 0.07;
      if (spheroid) {
        angle = rand() * Math.PI * 2;
        const mu = rand() * 2 - 1;
        p[i * 3] = Math.cos(angle) * r * Math.sqrt(1 - mu * mu);
        p[i * 3 + 1] = mu * r * 0.7;
        p[i * 3 + 2] = Math.sin(angle) * r * Math.sqrt(1 - mu * mu);
      } else {
        p[i * 3] = Math.cos(angle) * r;
        p[i * 3 + 1] = (rand() + rand() - 1) * 0.022;
        p[i * 3 + 2] = Math.sin(angle) * r;
      }
      const young = !spheroid && rand() < (model.morphology === "ring" ? 0.78 : 0.24);
      for (let k = 0; k < 3; k++)
        c[i * 3 + k] = (young ? model.youngColor[k] : model.oldColor[k]) * (0.6 + rand() * 0.4);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    g.setAttribute("color", new THREE.BufferAttribute(c, 3));
    g.computeBoundingSphere();
    return g;
  }, [model]);
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
      uInclination: { value: THREE.MathUtils.degToRad(model.inclination) },
      uAspect: { value: 1 },
      uGroup: { value: /quintet/i.test(model.name) ? 1 : 0 },
      uSteps: { value: 40 },
      uRadius: { value: model.diskRadius },
      uInterior: { value: 0 },
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
      uRotationRate: { value: Math.PI / model.rotPeriod },
      uRing: { value: (model.ringRadius ?? 0) / model.diskRadius },
      uTime: { value: 0 },
      uOpacity: { value: opacity },
    };
  }, [model, opacity]);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms,
        vertexShader: VERT,
        fragmentShader: FRAG,
        transparent: true,
        depthWrite: false,
        side: THREE.BackSide,
      }),
    [uniforms],
  );
  const starMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms,
        vertexShader: GLINT_VERT,
        fragmentShader: GLINT_FRAG,
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [uniforms],
  );
  useEffect(
    () => () => {
      stars.dispose();
      material.dispose();
      starMaterial.dispose();
    },
    [stars, material, starMaterial],
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
    const max = tier === "scientific_high" ? 4096 : tier === "performance" ? 1024 : 2048;
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
  useFrame(({ camera }) => {
    if (!ref.current) return;
    ref.current.updateWorldMatrix(true, false);
    ref.current.worldToLocal(eye.copy(camera.position));
    uniforms.uEye.value.copy(eye);
    uniforms.uTime.value = motionTimeSeconds();
    const distance = eye.length();
    uniforms.uInterior.value = 1 - THREE.MathUtils.smoothstep(distance, 0.15, 1.8);
    uniforms.uSteps.value = tier === "performance" ? 24 : distance < 1.8 ? 64 : 36;
    stars.setDrawRange(0, tier === "performance" ? 10000 : distance < 2 ? 28000 : 12000);
  });
  return (
    <mesh
      ref={ref}
      name={`galaxy-radiance:${model.name}`}
      scale={model.diskRadius}
      frustumCulled={false}
      material={material}
    >
      <points geometry={stars} material={starMaterial} frustumCulled={false} />
      <boxGeometry args={[2.7, 2.7, 2.7]} />
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

const GLINT_VERT = `
#include <common>
#include <logdepthbuf_pars_vertex>
uniform float uRadius,uInterior;varying vec3 vColor;void main(){vColor=color;vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp((.9+uInterior*1.4)*length(modelMatrix[0].xyz)/max(.0001,-mv.z)*1.2,1.,3.);
#include <logdepthbuf_vertex>
}`;
const GLINT_FRAG = `
#include <logdepthbuf_pars_fragment>
uniform float uOpacity,uInterior;varying vec3 vColor;void main(){
#include <logdepthbuf_fragment>
float r=length(gl_PointCoord*2.-1.);if(r>1.)discard;gl_FragColor=vec4(vColor*(5.+uInterior*5.),exp(-r*r*5.)*(.035+uInterior*.11)*uOpacity);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`;

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
