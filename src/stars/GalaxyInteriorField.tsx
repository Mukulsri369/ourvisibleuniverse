import { galaxyStructure } from "./galaxy-structure";
import { motionTimeSeconds } from "./sim-clock";
import { useEffect, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { GalaxyModel } from "./galaxy-models";
import {
  makeGalaxyInteriorStars,
  galaxyStarGeometry,
  type GalaxyStarData,
} from "./galaxy-interior-stars";
import { galaxyMotion } from "./galaxy-journey";
export function GalaxyInteriorField({
  model,
  count = 100000,
  exterior = false,
  visibility,
  field,
  cacheFade,
  eye,
}: {
  model: GalaxyModel;
  count?: number;
  exterior?: boolean;
  visibility?: THREE.IUniform<number>;
  field?: THREE.IUniform<THREE.Texture | null>;
  cacheFade?: THREE.IUniform<number>;
  eye?: THREE.IUniform<THREE.Vector3>;
}) {
  // Keep the existing exterior while a worker prepares the nested interior population.
  const populationGain = galaxyStructure(model).population ? 2.5 : 1;
  const baseCount = Math.min(count, 36000);
  const baseGeometry = useMemo(() => makeGalaxyInteriorStars(model, baseCount), [model, baseCount]);
  const [stream, setStream] = useState<{
    name: string;
    count: number;
    geometry: THREE.BufferGeometry;
  } | null>(null);
  const geometry =
    stream?.name === model.name && stream.count === count ? stream.geometry : baseGeometry;
  useEffect(() => {
    if (count <= 36000) {
      setStream(null);
      return;
    }
    let alive = true;
    const accept = (data: GalaxyStarData) => {
      if (alive) setStream({ name: model.name, count, geometry: galaxyStarGeometry(data) });
    };
    let worker: Worker | undefined;
    const fallback = () => {
      const build = () => {
        if (alive)
          setStream({ name: model.name, count, geometry: makeGalaxyInteriorStars(model, count) });
      };
      if ("requestIdleCallback" in window) window.requestIdleCallback(build, { timeout: 1000 });
      else setTimeout(build, 0);
    };
    try {
      worker = new Worker(new URL("./galaxy-star-worker.ts", import.meta.url), { type: "module" });
      worker.onmessage = (event: MessageEvent<GalaxyStarData>) => {
        accept(event.data);
        worker?.terminate();
      };
      worker.onerror = () => {
        worker?.terminate();
        fallback();
      };
      worker.postMessage({ model, count });
    } catch {
      fallback();
    }
    return () => {
      alive = false;
      worker?.terminate();
    };
  }, [model, count]);
  useEffect(() => () => baseGeometry.dispose(), [baseGeometry]);
  useEffect(() => () => stream?.geometry.dispose(), [stream]);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uField: { value: null },
          uHasField: { value: 0 },
          uEye: { value: new THREE.Vector3() },
          uPopulation: { value: 1 },
          uRotation: {
            value: galaxyStructure(model).rotationRate,
          },
          uReveal: { value: 0 },
          uVisibility: { value: 1 },
          uExterior: { value: 0 },
          uViewport: { value: 800 },
          uAspect: { value: 1 },
          uClipStars: { value: 1 },
        },
        vertexShader: /* glsl */ `#include <common>
#include <logdepthbuf_pars_vertex>
precision highp sampler3D;
uniform sampler3D uField;uniform vec3 uEye;uniform float uHasField,uPopulation;
uniform float uTime,uReveal,uViewport,uRotation,uExterior,uAspect,uClipStars;attribute float aLum,aPhase;varying vec3 vColor;varying float vLum,vDistance;
void main(){float radius=length(position.xz),angle=-uTime*uRotation;float c=cos(angle),s=sin(angle);vec3 p=vec3(position.x*c-position.z*s,position.y,position.x*s+position.z*c);vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;
// Reject invisible points before six 3D dust lookups. Worker-sorted indices
// keep nearby stars together so neighbouring GPU lanes take the same branch.
vec2 margin=vec2(20./(uViewport*uAspect),20./uViewport);
if(uClipStars>.5&&(gl_Position.w<=0.||any(greaterThan(abs(gl_Position.xy),vec2(gl_Position.w)*(vec2(1.)+margin))))){gl_Position=vec4(2.,2.,2.,1.);gl_PointSize=1.;vColor=vec3(0.);vLum=0.;vDistance=1.;return;}
float unit=length(modelMatrix[0].xyz);vDistance=length(mv.xyz)/max(unit,.001);vColor=color;float tau=0.;if(uHasField>.5){vec3 end=mix(p,uEye,min(1.,2.7/max(.001,length(uEye-p))));float ds=length(end-p)/6.;for(int j=0;j<6;j++){vec3 q=mix(p,end,(float(j)+.5)/6.);float an=uTime*uRotation;q.xz=mat2(cos(an),sin(an),-sin(an),cos(an))*q.xz;tau+=texture(uField,q/2.7+.5).a*ds;}}vLum=aLum*(.985+.015*sin(uTime*.4+aPhase))*exp(-tau*5.)*uPopulation;gl_PointSize=clamp(uViewport*.002*sqrt(aLum)/sqrt(max(.0001,vDistance)),mix(.9,1.,uExterior),mix(9.,3.,uExterior));
#include <logdepthbuf_vertex>
}`,
        fragmentShader: /* glsl */ `#include <logdepthbuf_pars_fragment>
uniform float uReveal,uVisibility,uExterior;varying vec3 vColor;varying float vLum,vDistance;
void main(){
#include <logdepthbuf_fragment>
vec2 p=gl_PointCoord*2.-1.;float r2=dot(p,p);if(r2>1.)discard;float core=exp(-r2*20.)+.006*exp(-r2*3.);float flux=clamp(vLum/sqrt(max(.05,vDistance)),.04,4.);float nearFade=smoothstep(.00002,.0004,vDistance);gl_FragColor=vec4(vColor*7.,core*flux*mix(.11,.30,uReveal)*nearFade*uVisibility*mix(1.,1.7,uExterior));
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`,
      }),
    [model],
  );
  useFrame(({ size, gl }) => {
    const time = motionTimeSeconds();
    material.uniforms.uTime.value = time;
    material.uniforms.uField.value = field?.value ?? null;
    material.uniforms.uHasField.value = field?.value && (cacheFade?.value ?? 0) > 0.9 ? 1 : 0;
    if (eye) material.uniforms.uEye.value.copy(eye.value);
    material.uniforms.uPopulation.value =
      populationGain *
      (exterior ? Math.min(4, 100000 / geometry.getAttribute("position").count) : 1);
    material.uniforms.uVisibility.value = visibility?.value ?? 1;
    material.uniforms.uExterior.value = exterior ? 1 : 0;
    material.uniforms.uReveal.value = exterior
      ? 0.18
      : Math.max(
          galaxyMotion.reveal,
          THREE.MathUtils.smoothstep(galaxyMotion.progress, 0.08, 0.4) * 0.5,
        );
    material.uniforms.uViewport.value = size.height * gl.getPixelRatio();
    material.uniforms.uAspect.value = size.width / Math.max(1, size.height);
  });

  useEffect(() => () => material.dispose(), [material]);
  return (
    <points
      dispose={null}
      name={(exterior ? "galaxy-exterior-stars:" : "galaxy-interior-stars:") + model.name}
      geometry={geometry}
      material={material}
      frustumCulled
      raycast={() => {}}
    />
  );
}
