import { motionTimeSeconds } from "./sim-clock";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { blackbodyTemperatureToRGB } from "./color-science";
import { useSolarMap } from "./solar-textures";
import type { NamedStar } from "./data";

const VERTEX = /* glsl */ `
#include <common>
#include <logdepthbuf_pars_vertex>
varying vec2 vUv; varying vec3 vNormal; varying vec3 vView;
void main(){
vUv=uv;vNormal=normalize(normalMatrix*normal);
vec4 p=modelViewMatrix*vec4(position,1.0);vView=-p.xyz;
gl_Position=projectionMatrix*p;
#include <logdepthbuf_vertex>
}`;
const FRAGMENT = /* glsl */ `
#include <logdepthbuf_pars_fragment>
uniform sampler2D uMap;uniform vec3 uColor;uniform float uTime;uniform float uSeed;
uniform float uActivity;
varying vec2 vUv;varying vec3 vNormal;varying vec3 vView;
void main(){
#include <logdepthbuf_fragment>
// Observed solar detail supplies a restrained surface template, not invented
// resolved observations of distant stars. Temperature controls the emitted hue.
vec2 uv=vec2(fract(vUv.x+uTime*0.002+uSeed),vUv.y);
vec3 tex=texture2D(uMap,uv).rgb;
float detail=dot(tex,vec3(0.2126,0.7152,0.0722));
float mu=max(dot(normalize(vNormal),normalize(vView)),0.0);
float cells=sin(uv.x*980.0+sin(uv.y*137.0))*sin(uv.y*730.0+uTime*0.2);
float surface=0.50+0.82*detail+cells*0.012*uActivity;
float limb=0.30+0.70*pow(mu,0.48);
gl_FragColor=vec4(uColor*surface*limb*7.0,1.0);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`;

/** One surface program serves every catalogue star. Only a resolvable visited
 * star is drawn; the atlas keeps its batched points at wider viewing scales. */
export function StellarSurface({
  star,
  radius,
}: {
  star: Pick<NamedStar, "name" | "temperature">;
  radius: number;
}) {
  const mesh = useRef<THREE.Mesh>(null!);
  const map = useSolarMap("Sun", () => new THREE.Texture());
  const uniforms = useMemo(() => {
    const rgb = blackbodyTemperatureToRGB(star.temperature || 5772);
    let seed = 0;
    for (const c of star.name) seed = (seed * 31 + c.charCodeAt(0)) % 997;
    return {
      uMap: { value: map },
      uColor: { value: new THREE.Color(rgb.r, rgb.g, rgb.b).convertSRGBToLinear() },
      uTime: { value: 0 },
      uSeed: { value: seed / 997 },
      uActivity: { value: star.temperature < 4000 ? 1 : 0.5 },
    };
  }, [map, star.name, star.temperature]);
  useFrame(({ camera }) => {
    if (!mesh.current) return;
    mesh.current.getWorldPosition((mesh.current.userData.world ??= new THREE.Vector3()));
    const distance = camera.position.distanceTo(mesh.current.userData.world);
    mesh.current.visible = distance < radius * 1800;
    uniforms.uTime.value = motionTimeSeconds();
    mesh.current.rotation.y = motionTimeSeconds() * 0.018;
  });
  return (
    <mesh
      ref={mesh}
      name={`stellar-surface:${star.name}`}
      onClick={(event) => event.stopPropagation()}
    >
      <sphereGeometry args={[radius, 64, 48]} />
      <shaderMaterial vertexShader={VERTEX} fragmentShader={FRAGMENT} uniforms={uniforms} />
    </mesh>
  );
}
