import { motionTimeSeconds } from "./sim-clock";
import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { GalaxyModel } from "./galaxy-models";
import { makeGalaxyInteriorStars } from "./galaxy-interior-stars";
import { galaxyMotion } from "./galaxy-journey";
export function GalaxyInteriorField({
  model,
  count = 100000,
  exterior = false,
  visibility,
}: {
  model: GalaxyModel;
  count?: number;
  exterior?: boolean;
  visibility?: THREE.IUniform<number>;
}) {
  const geometry = useMemo(() => makeGalaxyInteriorStars(model, count), [model, count]);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uRotation: {
            value: ["elliptical", "dwarf", "irregular", "starburst"].includes(model.morphology)
              ? 0
              : Math.PI / model.rotPeriod,
          },
          uReveal: { value: 0 },
          uVisibility: { value: 1 },
          uExterior: { value: 0 },
          uViewport: { value: 800 },
        },
        vertexShader: /* glsl */ `#include <common>
#include <logdepthbuf_pars_vertex>
uniform float uTime,uReveal,uViewport,uRotation,uExterior;attribute float aLum,aPhase;varying vec3 vColor;varying float vLum,vDistance;
void main(){float radius=length(position.xz),angle=-uTime*uRotation/max(radius,.12);float c=cos(angle),s=sin(angle);vec3 p=vec3(position.x*c-position.z*s,position.y,position.x*s+position.z*c);vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;float unit=length(modelMatrix[0].xyz);vDistance=length(mv.xyz)/max(unit,.001);vColor=color;vLum=aLum*(.96+.04*sin(uTime*.7+aPhase));gl_PointSize=clamp(uViewport*.002*sqrt(aLum)/sqrt(max(.0001,vDistance)),mix(.55,1.,uExterior),mix(5.,3.,uExterior));
#include <logdepthbuf_vertex>
}`,
        fragmentShader: /* glsl */ `#include <logdepthbuf_pars_fragment>
uniform float uReveal,uVisibility,uExterior;varying vec3 vColor;varying float vLum,vDistance;
void main(){
#include <logdepthbuf_fragment>
vec2 p=gl_PointCoord*2.-1.;float r2=dot(p,p);if(r2>1.)discard;float core=exp(-r2*20.)+.006*exp(-r2*3.);float flux=clamp(vLum/sqrt(max(.05,vDistance)),.04,4.);float nearFade=smoothstep(.00002,.0004,vDistance);gl_FragColor=vec4(vColor*16.,core*flux*mix(.015,.24,uReveal)*nearFade*uVisibility*mix(1.,3.2,uExterior));
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`,
      }),
    [model.morphology, model.rotPeriod],
  );
  useFrame(({ size, gl }) => {
    material.uniforms.uTime.value = motionTimeSeconds();
    material.uniforms.uVisibility.value = visibility?.value ?? 1;
    material.uniforms.uExterior.value = exterior ? 1 : 0;
    material.uniforms.uReveal.value = exterior
      ? 0.18
      : Math.max(
          galaxyMotion.reveal,
          THREE.MathUtils.smoothstep(galaxyMotion.progress, 0.08, 0.4) * 0.5,
        );
    material.uniforms.uViewport.value = size.height * gl.getPixelRatio();
  });
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);
  return (
    <points
      name={(exterior ? "galaxy-exterior-stars:" : "galaxy-interior-stars:") + model.name}
      geometry={geometry}
      material={material}
      frustumCulled={false}
      raycast={() => {}}
    />
  );
}
