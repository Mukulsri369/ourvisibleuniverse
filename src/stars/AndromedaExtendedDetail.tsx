import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { M31Model } from "./andromeda-target-types";
import { fallbackGlowTexture } from "./object-glow-texture";

export const M31_GAS_KINDS = {
  hii: 0,
  planetary: 1,
  "absorption-remnant": 2,
  "molecular-cloud": 3,
  "nova-shell": 4,
} as const;
export const M31_GAS_VERTEX = `
varying vec3 vLocal;
#include <common>
#include <logdepthbuf_pars_vertex>
void main(){
 vLocal=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
 #include <logdepthbuf_vertex>
}`;
export const M31_GAS_FRAGMENT = `
precision highp float;
uniform vec3 uEye; uniform float uKind; varying vec3 vLocal;
#include <common>
#include <logdepthbuf_pars_fragment>
float lump(vec3 p,vec3 c,vec3 radii){return exp(-dot((p-c)/radii,(p-c)/radii)*2.);}
float density(vec3 p){
 float r=length(p);
 if(uKind<.5){
   float gas=lump(p,vec3(-.28,.1,0.),vec3(.55,.55,.65))+lump(p,vec3(.3,-.12,.02),vec3(.5,.38,.5));
   float cavity=1.-.85*lump(p,vec3(-.05,.02,.1),vec3(.25,.24,.3));
   return gas*cavity*(.65+.35*sin(p.x*18.+sin(p.y*15.))*sin(p.z*16.));
 }
 if(uKind<1.5){float q=length(p/vec3(.85,.62,.7));return exp(-pow((q-.68)/.095,2.))+.12*exp(-pow((q-.95)/.13,2.));}
 if(uKind<2.5){float shell=exp(-pow((r-.65)/.13,2.));return shell*(.65+.35*sin(p.x*19.)*sin(p.y*21.))+ .12*lump(p,vec3(.1,0.,0.),vec3(.2,.55,.18));}
 if(uKind<3.5){return .65*lump(p,vec3(-.25,0.,0.),vec3(.65,.38,.6))+.5*lump(p,vec3(.35,.05,0.),vec3(.45,.42,.55));}
 float q=length(p/vec3(.85,.55,.63));return exp(-pow((q-.75)/.085,2.))*(.7+.3*sin(p.x*23.)*sin(p.y*17.));
}
void main(){
 #include <logdepthbuf_fragment>
 vec3 dir=normalize(vLocal-uEye), inv=1./(dir+vec3(.0000001));
 vec3 a=(-vec3(1.)-uEye)*inv,b=(vec3(1.)-uEye)*inv;
 vec3 lo=min(a,b),hi=max(a,b);float start=max(0.,max(lo.x,max(lo.y,lo.z))),end=min(hi.x,min(hi.y,hi.z));
 if(end<=start)discard;float stepSize=(end-start)/40.;vec4 result=vec4(0.);
 for(int i=0;i<40;i++){
   vec3 p=uEye+dir*(start+(float(i)+.5)*stepSize);float field=density(p);
   float opacity=1.-exp(-field*stepSize*3.5);
   vec3 col=vec3(1.,.25,.38);
   if(uKind<.5)col=mix(col,vec3(.3,1.,.82),exp(-dot(p,p)*6.)*.6);
   else if(uKind<1.5)col=mix(vec3(.2,1.,.8),vec3(1.,.27,.25),smoothstep(.4,.9,length(p)));
   else if(uKind<3.5)col=vec3(.018,.015,.012);
   else col=mix(vec3(1.,.22,.12),vec3(.35,.7,1.),.15);
   float gain=(uKind>1.5&&uKind<3.5)?1.:3.;
   result.rgb+=(1.-result.a)*opacity*col*gain;result.a+=(1.-result.a)*opacity;
   if(result.a>.97)break;
 }
 if(result.a<.005)discard;
 gl_FragColor=vec4(result.rgb/max(result.a,.001),result.a);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
}`;

function Gas({ model, scale }: { model: keyof typeof M31_GAS_KINDS; scale: number }) {
  const mesh = useRef<THREE.Mesh>(null);
  const uniforms = useMemo(
    () => ({ uEye: { value: new THREE.Vector3() }, uKind: { value: M31_GAS_KINDS[model] } }),
    [model],
  );
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: M31_GAS_VERTEX,
        fragmentShader: M31_GAS_FRAGMENT,
        uniforms,
        transparent: true,
        depthWrite: false,
        side: THREE.BackSide,
      }),
    [uniforms],
  );
  useEffect(() => () => material.dispose(), [material]);
  useFrame(({ camera }) => {
    if (!mesh.current) return;
    mesh.current.updateWorldMatrix(true, false);
    uniforms.uEye.value.copy(camera.position);
    mesh.current.worldToLocal(uniforms.uEye.value);
  });
  return (
    <mesh
      ref={mesh}
      renderOrder={10}
      scale={scale * 0.5}
      material={material}
      frustumCulled={false}
      name={"m31-gas:" + model}
    >
      <boxGeometry args={[2, 2, 2]} />
    </mesh>
  );
}
export const M31_DISK_VERTEX = `
varying vec2 vDisk;
#include <common>
#include <logdepthbuf_pars_vertex>
void main(){vDisk=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
#include <logdepthbuf_vertex>
}`;
export const M31_DISK_FRAGMENT = `
uniform float uPulsar; varying vec2 vDisk;
#include <common>
#include <logdepthbuf_pars_fragment>
void main(){
#include <logdepthbuf_fragment>
 float r=length(vDisk), a=atan(vDisk.y,vDisk.x);
 float inner=smoothstep(.22,.27,r), outer=1.-smoothstep(.45,.62,r);
 float wisps=.72+.18*sin(a*5.+r*48.)+.1*sin(a*13.-r*83.);
 float heat=pow(clamp((.62-r)/.4,0.,1.),.65);
 vec3 cold=mix(vec3(.72,.22,.055),vec3(.12,.36,.8),uPulsar);
 vec3 hot=mix(vec3(1.,.86,.64),vec3(.75,.9,1.),uPulsar);
 gl_FragColor=vec4(mix(cold,hot,heat)*(1.4+heat*2.5)*wisps,inner*outer*.88);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
}`;

function Xray({ pulsar, scale }: { pulsar: boolean; scale: number }) {
  const texture = useMemo(fallbackGlowTexture, []),
    surface = useRef<THREE.Group>(null),
    pulse = useRef<THREE.SpriteMaterial>(null);
  const disk = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: M31_DISK_VERTEX,
        fragmentShader: M31_DISK_FRAGMENT,
        uniforms: { uPulsar: { value: pulsar ? 1 : 0 } },
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        toneMapped: false,
      }),
    [pulsar],
  );
  const phase = useRef(0);
  useEffect(() => () => texture.dispose(), [texture]);
  useEffect(() => () => disk.dispose(), [disk]);
  useFrame((_, dt) => {
    phase.current = (phase.current + Math.max(0, dt)) % 1.2;
    if (surface.current) surface.current.rotation.y = (phase.current * 2 * Math.PI) / 1.2;
    if (pulse.current)
      pulse.current.opacity = pulsar
        ? 0.28 + 0.14 * Math.sin((phase.current * 2 * Math.PI) / 1.2)
        : 0.24;
  });
  return (
    <group
      scale={scale}
      name={pulsar ? "m31-accreting-pulsar" : "m31-ulx-candidate"}
      rotation={[0.5, 0.15, 0.25]}
    >
      <group ref={surface}>
        <mesh>
          <sphereGeometry args={[pulsar ? 0.14 : 0.17, 64, 32]} />
          <meshBasicMaterial color={pulsar ? "#bddcff" : "#020203"} toneMapped={false} />
        </mesh>
        {pulsar && (
          <mesh position={[0, 0.13, 0.01]}>
            <sphereGeometry args={[0.035, 16, 10]} />
            <meshBasicMaterial color="#ffffff" toneMapped={false} />
          </mesh>
        )}
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={disk}>
        <ringGeometry args={[0.22, 0.62, 96]} />
      </mesh>

      <sprite scale={1.6}>
        <spriteMaterial
          ref={pulse}
          map={texture}
          color={pulsar ? "#8dcfff" : "#f5b780"}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
    </group>
  );
}
export function AndromedaExtendedDetail({ model, scale }: { model: M31Model; scale: number }) {
  if (model === "xray-pulsar" || model === "ulx-candidate")
    return <Xray pulsar={model === "xray-pulsar"} scale={scale} />;
  return <Gas model={model} scale={scale} />;
}
