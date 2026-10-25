import { useMemo, useEffect } from "react";
import * as THREE from "three";
import { NEBULA_MEDIUM } from "./nebula-medium";
import { NEBULA_STELLAR_PROFILES } from "./nebula-stellar-profiles";
export function makeNebulaStars(id: string) {
  const profile = NEBULA_STELLAR_PROFILES[id];
  if (!profile) return null;
  let seed = 177;
  for (const c of id) seed = (Math.imul(seed, 31) + c.charCodeAt(0)) | 0;
  const rand = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) | 0;
    return (seed >>> 0) / 4294967296;
  };
  const points: number[] = [],
    colors: number[] = [],
    light: number[] = [];
  const push = (p: number[], power: number, young: boolean) => {
    points.push(...p);
    const warm = rand() < 0.28;
    colors.push(...(young ? [0.65, 0.8, 1] : warm ? [1, 0.73, 0.43] : [0.86, 0.91, 1]));
    light.push(power);
  };
  for (const a of profile.anchors) push(a.position, a.power, true);
  const c = profile.cluster;
  if (c)
    for (let i = 0; i < c.count; i++) {
      const p = c.center.map((v, k) => v + (rand() + rand() + rand() - 1.5) * c.spread[k]);
      push(p, 0.13 + Math.pow(rand(), 5) * 0.9, true);
    }
  for (let i = 0; i < profile.field; i++) {
    const p = [
      (rand() - 0.5) * 5,
      (rand() - 0.5) * 4,
      rand() < 0.65 ? -1.1 - rand() * 1.5 : 1.1 + rand() * 1.3,
    ];
    push(p, 0.1 + Math.pow(rand(), 6) * 0.8, false);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setAttribute("aLum", new THREE.Float32BufferAttribute(light, 1));
  geometry.computeBoundingSphere();
  return geometry;
}
const VERT = /* glsl */ `
#include <common>
#include <logdepthbuf_pars_vertex>
uniform vec3 uEye;uniform float uViewport;
attribute float aLum;varying vec3 vStar,vColor;varying float vLum;
void main(){vStar=position;vColor=color;vLum=aLum;vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;
float d=max(.003,length(position-uEye));gl_PointSize=clamp(uViewport*.003*sqrt(aLum)/sqrt(d),1.,7.);
#include <logdepthbuf_vertex>
}`;
const FRAG = /* glsl */ `
precision highp sampler3D;
#include <common>
#include <logdepthbuf_pars_fragment>
uniform sampler3D uNoise;uniform vec3 uEye;uniform float uShape,uSeed;
varying vec3 vStar,vColor;varying float vLum;
${NEBULA_MEDIUM}
void main(){
#include <logdepthbuf_fragment>
vec2 p=gl_PointCoord*2.-1.;float r2=dot(p,p);if(r2>1.)discard;
vec3 delta=vStar-uEye;float distance=length(delta);vec3 dir=delta/max(distance,.0001);
vec3 inv=1./(dir+vec3(1.e-8)),aa=(-vec3(1.6)-uEye)*inv,bb=(vec3(1.6)-uEye)*inv;
vec3 lo=min(aa,bb),hi=max(aa,bb);float start=max(0.,max(lo.x,max(lo.y,lo.z))),end=min(distance,min(hi.x,min(hi.y,hi.z)));
float tau=0.;if(end>start){float ds=(end-start)/32.;for(int i=0;i<32;i++){vec3 q=uEye+dir*(start+(float(i)+.5)*ds);vec2 m=nebulaMedium(q);tau+=(m.x*.8+m.y*1.8)*ds;}}
float transmission=exp(-min(tau,20.));float core=exp(-r2*18.)+exp(-r2*3.5)*.1;
float fade=smoothstep(.0005,.004,distance);float power=clamp(vLum/sqrt(max(.3,distance)),.08,2.);
gl_FragColor=vec4(vColor*20.,core*power*transmission*fade);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`;
export function NebulaStars({
  id,
  uniforms,
}: {
  id: string;
  uniforms: Record<string, THREE.IUniform>;
}) {
  const geometry = useMemo(() => makeNebulaStars(id), [id]);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms,
        vertexShader: VERT,
        fragmentShader: FRAG,
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [uniforms],
  );
  useEffect(
    () => () => {
      geometry?.dispose();
      material.dispose();
    },
    [geometry, material],
  );
  return geometry ? (
    <points
      name={"nebula-stars:" + id}
      geometry={geometry}
      material={material}
      renderOrder={25}
      frustumCulled={false}
      raycast={() => {}}
    />
  ) : null;
}
