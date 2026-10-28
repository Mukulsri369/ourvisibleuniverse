import { galaxyStructure } from "./galaxy-structure";
import { GalaxyInteriorField } from "./GalaxyInteriorField";
import { GalaxyDensityCache } from "./galaxy-density-cache";
import { useGalaxyJourney, galaxyMotion } from "./galaxy-journey";
import { SGR_A_DISTANCE_LY } from "@/lib/astronomy/galactic-scene";
import { GALAXY_FRAGMENT } from "./galaxy-volume-shader";
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
/** Builds one galaxy as a persistent 3D emissivity and dust volume. */
export function GalaxyRadiance({
  model,
  opacity = 1,
  preview = false,
}: {
  model: GalaxyModel;
  opacity?: number;
  preview?: boolean;
}) {
  const ref = useRef<THREE.Mesh>(null!);
  const tier = useStore((s) => s.renderingQualityTier);
  const journeyActive = useGalaxyJourney((s) => s.galaxy?.name === model.name);
  const selected = useStore((s) => s.visitGalaxy?.name === model.name);
  const entered = useGalaxyJourney(
    (s) =>
      s.galaxy?.name === model.name &&
      (s.mode === "flying" || s.mode === "paused" || s.mode === "inside"),
  );
  const eye = useMemo(() => new THREE.Vector3(), []);
  const uniforms = useMemo(() => {
    const structure = galaxyStructure(model);
    const population = structure.population;
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
      uField: { value: null as THREE.Texture | null },
      uCacheFade: { value: preview ? 1 : 0 },
      uVolumeWeight: { value: 0 },
      uSteps: { value: 32 },
      uFieldSize: { value: new THREE.Vector3(1, 1, 1) },
      uAdaptiveSampling: { value: 1 },
      uSkipEmpty: { value: 1 },
      uOccupancy: { value: null as THREE.Texture | null },
      uOccupancyReady: { value: 0 },
      uOccupancySize: { value: new THREE.Vector3(1, 1, 1) },
      uReveal: { value: 0 },
      uOld: {
        value: new THREE.Color(
          ...(population?.old ??
            ([10, 11, 15].includes(structure.feature)
              ? ([1, 0.67, 0.33] as [number, number, number])
              : model.oldColor)),
        ),
      },
      uYoung: {
        value: new THREE.Color(
          ...(population?.hot ??
            ([10, 11, 15].includes(structure.feature)
              ? ([0.23, 0.52, 1] as [number, number, number])
              : model.youngColor)),
        ),
      },
      uMode: { value: Math.max(0, mode) },
      uFeature: { value: structure.feature },
      uPopKind: { value: population?.kind ?? 0 },
      uPopAxes: { value: new THREE.Vector3(...(population?.axes ?? [1, 1, 1])) },
      uPopCore: { value: population?.core ?? 0.3 },
      uPopContinuum: { value: population?.continuum ?? 1 },
      uPopHot: { value: population?.hotFraction ?? 0.2 },
      uPopDust: { value: population?.dust ?? 0 },
      uPopHii: { value: population?.hii ?? 0 },
      uPopTail: { value: population?.tail ?? 0 },
      uPopKnotCount: { value: population?.knots.length ?? 0 },
      uPopKnots: {
        value: Array.from(
          { length: 6 },
          (_, i) => new THREE.Vector4(...(population?.knots[i] ?? [0, 0, 0, 0])),
        ),
      },
      uThickness: { value: structure.thickness },
      uFlattening: { value: structure.flattening },
      uRing: { value: structure.ringRadius },
      uAsymmetry: { value: structure.asymmetry },
      uArmContrast: { value: structure.armContrast },
      uSeed: { value: seed / 13 },
      uArms: { value: Math.max(2, model.arms) },
      uPitch: { value: THREE.MathUtils.degToRad(Math.max(8, model.pitchDeg)) },
      uBulge: { value: model.bulgeRadius / model.diskRadius },
      uBar: { value: model.barLength / model.diskRadius },
      uDust: { value: structure.dust },
      uSingleTail: { value: /tadpole/i.test(model.name) ? 1 : 0 },
      uGroup: { value: /quintet/i.test(model.name) ? 1 : 0 },
      uCenA: { value: model.key === "cena" ? 1 : 0 },
      uRotationRate: { value: structure.rotationRate },
      uTime: { value: 0 },
      uOpacity: { value: opacity },
    };
  }, [model, opacity, preview]);
  const cache = useMemo(
    () =>
      preview
        ? null
        : new GalaxyDensityCache(
            uniforms,
            tier === "performance" ? 80 : tier === "scientific_high" ? 176 : 144,
          ),
    [uniforms, tier, preview],
  );
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms,
        vertexShader: VERT,
        fragmentShader: GALAXY_FRAGMENT,
        defines: {
          ...(preview ? { GALAXY_PREVIEW: 1 } : {}),
          ...(uniforms.uPopKind.value > 0 ? { GALAXY_POPULATION: 1 } : {}),
        },
        transparent: true,
        depthWrite: false,
        side: THREE.BackSide,
      }),
    [uniforms, preview],
  );
  useEffect(() => {
    uniforms.uCacheFade.value = preview ? 1 : 0;
    return () => cache?.dispose();
  }, [cache, uniforms, preview]);
  useEffect(
    () => () => {
      material.dispose();
    },
    [material],
  );
  useFrame(({ camera, gl }, dt) => {
    if (!ref.current) return;
    ref.current.updateWorldMatrix(true, false);
    ref.current.worldToLocal(eye.copy(camera.position));
    uniforms.uEye.value.copy(eye);
    if (cache) uniforms.uFieldSize.value.set(cache.size, cache.size * 2, cache.size);
    uniforms.uTime.value = motionTimeSeconds();
    const reveal = journeyActive ? galaxyMotion.reveal : 0;
    uniforms.uReveal.value = reveal;
    if (
      cache &&
      (selected || entered || (ref.current.visible && uniforms.uOpacity.value > 0.001))
    ) {
      const ready = cache.bake(gl);
      uniforms.uField.value = cache.target.texture;
      uniforms.uOccupancy.value = cache.occupancy?.texture ?? null;
      uniforms.uOccupancySize.value.set(
        cache.occupancySize,
        cache.occupancySize * 2,
        cache.occupancySize,
      );
      uniforms.uOccupancyReady.value =
        !cache.occupancy || cache.occupancyLayer >= cache.occupancySize ? 1 : 0;
      uniforms.uCacheFade.value = THREE.MathUtils.damp(
        uniforms.uCacheFade.value,
        ready ? 1 : 0,
        5,
        Math.min(dt, 0.1),
      );
    }
    // The density field is world-anchored: rotating the view cannot swap it for a flat portrait.
    uniforms.uVolumeWeight.value = 1;
    uniforms.uSteps.value = preview
      ? eye.length() < 4
        ? 56
        : 24
      : tier === "scientific_high"
        ? 104
        : tier === "performance"
          ? 48
          : 80;
  });
  return (
    <mesh
      ref={ref}
      name={(preview ? "galaxy-catalog-volume:" : "galaxy-radiance:") + model.name}
      scale={model.diskRadius}
      frustumCulled
      material={material}
    >
      <boxGeometry args={[2.7, 2.7, 2.7]} />
      {!preview && (
        <GalaxyInteriorField
          model={model}
          count={entered ? 100000 : 36000}
          exterior={!entered}
          visibility={uniforms.uOpacity}
          field={uniforms.uField}
          cacheFade={uniforms.uCacheFade}
          eye={uniforms.uEye}
        />
      )}
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
