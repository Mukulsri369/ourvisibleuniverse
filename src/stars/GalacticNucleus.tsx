import { useMemo, useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useStore } from "./store";
/** Representative nuclear cluster, not individually measured S-star orbits. */
export function GalacticNucleus() {
  const root = useRef<THREE.Points>(null);
  const geometry = useMemo(() => {
    let seed = 173;
    const rand = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) | 0;
      return (seed >>> 0) / 4294967296;
    };
    const p = [],
      c = [],
      lum = [];
    for (let i = 0; i < 2200; i++) {
      const r = 0.001 + Math.pow(rand(), 0.72) * 14,
        mu = rand() * 2 - 1,
        a = rand() * Math.PI * 2,
        s = Math.sqrt(1 - mu * mu);
      p.push(r * s * Math.cos(a), r * mu * 0.8, r * s * Math.sin(a));
      const warm = rand() < 0.65;
      c.push(...(warm ? [1, 0.72, 0.43] : [0.63, 0.8, 1]));
      lum.push(0.15 + Math.pow(rand(), 5) * 1.5);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(c, 3));
    g.setAttribute("aLum", new THREE.Float32BufferAttribute(lum, 1));
    return g;
  }, []);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uAlpha: { value: 0 } },
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: `
#include <common>
#include <logdepthbuf_pars_vertex>
attribute float aLum;varying vec3 vColor;varying float vLum;
void main(){vColor=color;vLum=aLum;vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(2.*sqrt(aLum)/sqrt(max(.2,-mv.z)),1.,4.);
#include <logdepthbuf_vertex>
}`,
        fragmentShader: `
#include <logdepthbuf_pars_fragment>
uniform float uAlpha;varying vec3 vColor;varying float vLum;
void main(){
#include <logdepthbuf_fragment>
vec2 p=gl_PointCoord*2.-1.;float r2=dot(p,p);if(r2>1.)discard;gl_FragColor=vec4(vColor*9.,exp(-r2*10.)*vLum*uAlpha);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`,
      }),
    [],
  );
  const eye = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera }) => {
    if (!root.current) return;
    root.current.getWorldPosition(eye);
    const d = camera.position.distanceTo(eye);
    root.current.visible = useStore.getState().subsystems.milkyWay && d < 60;
    material.uniforms.uAlpha.value = 1 - THREE.MathUtils.smoothstep(d, 18, 60);
  });
  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );
  return (
    <points
      name="milky-way-nuclear-cluster"
      ref={root}
      geometry={geometry}
      material={material}
      frustumCulled={false}
      raycast={() => {}}
    />
  );
}
