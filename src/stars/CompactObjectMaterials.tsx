import { motionTimeSeconds } from "./sim-clock";
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import * as THREE from "three";

const VERT = /* glsl */ `
#include <common>
#include <logdepthbuf_pars_vertex>
varying vec2 vUv; varying vec3 vN; varying vec3 vView;
void main(){vUv=uv;vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.);vView=-mv.xyz;gl_Position=projectionMatrix*mv;
#include <logdepthbuf_vertex>
}`;
const NOISE = /* glsl */ `
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1)),f.x),f.y);}
float turbulence(vec2 p){return noise(p)*.57+noise(p*2.03)*.28+noise(p*4.1)*.15;}
`;
const DISK = /* glsl */ `
#include <logdepthbuf_pars_fragment>
uniform float uTime;uniform float uSpin;uniform vec3 uColor;uniform vec3 uEye;
varying vec2 vUv;varying vec3 vN;varying vec3 vView;
${NOISE}
void main(){
#include <logdepthbuf_fragment>
vec2 p=(vUv-.5)*2.;float r=length(p);float a=atan(p.y,p.x);
float flow=a-uTime*uSpin*.16/pow(max(r,.22),1.5);
// Polar turbulence is periodic at the longitude seam.
vec2 q=vec2(cos(flow),sin(flow))*(12.+r*8.);
float strands=turbulence(q+vec2(r*120.,r*35.));
float lanes=.55+.45*sin(r*390.+strands*9.);
float inner=smoothstep(.325,.355,r);float outer=1.-smoothstep(.78,1.,r);
float temp=pow(clamp((1.-r)/.67,0.,1.),.75);
vec3 hot=mix(vec3(1.,.22,.035),vec3(1.,.88,.64),temp);
hot=mix(hot,uColor,.12);
vec3 tangent=vec3(-sin(a),0.,cos(a));
float dop=pow(1.+.42*dot(normalize(uEye),tangent),3.);
float emission=(.55+strands*.8+lanes*.26)*(.25+temp*2.4)*dop;
float alpha=inner*outer*(.65+.35*strands);
gl_FragColor=vec4(hot*emission*5.,alpha);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`;
const LENS = /* glsl */ `
#include <logdepthbuf_pars_fragment>
uniform float uTime;uniform float uInclination;uniform vec3 uColor;
varying vec2 vUv;
${NOISE}
void main(){
#include <logdepthbuf_fragment>
vec2 p=(vUv-.5)*2.;float r=length(p);float a=atan(p.y,p.x);
float photon=exp(-pow((r-.205)/.0035,2.));
// Higher-order disk image: compressed along the disk normal as the view tilts.
float thickness=mix(.013,.072,uInclination);
float arch=exp(-pow((r-.237)/thickness,2.));
float direction=.6+.4*abs(sin(a));
float flow=turbulence(vec2(cos(a),sin(a))*18.+vec2(uTime*.07,r*120.));
float dop=pow(1.-.4*cos(a),3.);
float light=(photon*2.4+arch*flow*direction*uInclination*.7)*dop;
vec3 c=mix(vec3(1.,.45,.12),vec3(1.,.92,.75),photon);
gl_FragColor=vec4(c*light*5.,clamp(light,0.,.95));
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`;

/** Analytic thin-disk interpretation; no per-frame particle uploads or geodesic claim. */
export function AccretionFlow({ color, spin = 0.2 }: { color: string; spin?: number }) {
  const ref = useRef<THREE.Group>(null!);
  const eye = useMemo(() => new THREE.Vector3(), []);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSpin: { value: spin },
      uColor: { value: new THREE.Color(color) },
      uEye: { value: new THREE.Vector3() },
      uInclination: { value: 0 },
    }),
    [color, spin],
  );
  useFrame(({ camera }) => {
    if (!ref.current) return;
    ref.current.worldToLocal(eye.copy(camera.position));
    uniforms.uEye.value.copy(eye);
    uniforms.uInclination.value = 1 - Math.abs(eye.y) / Math.max(eye.length(), 1e-12);
    uniforms.uTime.value = motionTimeSeconds();
  });
  return (
    <group ref={ref} name="accretion-flow">
      <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={[1.44, 1.44]} />
        <shaderMaterial
          vertexShader={VERT}
          fragmentShader={DISK}
          uniforms={uniforms}
          side={THREE.DoubleSide}
          transparent
          depthWrite={false}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.185, 48, 32]} />
        <meshBasicMaterial color="black" />
      </mesh>
      <Billboard>
        <mesh renderOrder={2}>
          <planeGeometry args={[2, 2]} />
          <shaderMaterial
            vertexShader={VERT}
            fragmentShader={LENS}
            uniforms={uniforms}
            transparent
            depthWrite={false}
          />
        </mesh>
      </Billboard>
    </group>
  );
}

const THERMAL = /* glsl */ `
#include <logdepthbuf_pars_fragment>
uniform float uTime;uniform vec3 uColor;varying vec2 vUv;varying vec3 vN;varying vec3 vView;
${NOISE}
void main(){
#include <logdepthbuf_fragment>
float mu=max(dot(normalize(vN),normalize(vView)),0.);
float latitude=cos(vUv.y*3.14159265);float cap=pow(abs(latitude),24.);
float grain=turbulence(vec2(vUv.x*180.,vUv.y*90.));
float temperature=.62+.24*grain+cap*(.65+.08*sin(uTime*.7));
vec3 c=mix(uColor,vec3(1.),.55+cap*.4)*temperature*(.52+.48*pow(mu,.38));
gl_FragColor=vec4(c*7.,1.);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`;
export function NeutronSurface({
  color,
  radius = 0.07,
  spin = 0.2,
}: {
  color: string;
  radius?: number;
  spin?: number;
}) {
  const ref = useRef<THREE.Mesh>(null!);
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uColor: { value: new THREE.Color(color) } }),
    [color],
  );
  useFrame(() => {
    uniforms.uTime.value = motionTimeSeconds();
    if (ref.current) ref.current.rotation.y = motionTimeSeconds() * spin;
  });
  return (
    <mesh ref={ref} name="neutron-surface">
      <sphereGeometry args={[radius, 64, 40]} />
      <shaderMaterial vertexShader={VERT} fragmentShader={THERMAL} uniforms={uniforms} />
    </mesh>
  );
}
const BEAM = /* glsl */ `
#include <logdepthbuf_pars_fragment>
uniform float uTime;uniform vec3 uColor;varying vec2 vUv;
void main(){
#include <logdepthbuf_fragment>
float along=vUv.y;float edge=pow(max(sin(vUv.x*3.14159265),0.),4.);
float fade=smoothstep(0.,.08,along)*(1.-smoothstep(.25,1.,along));
float knots=.65+.35*pow(.5+.5*sin(along*55.-uTime*3.),6.);
gl_FragColor=vec4(uColor*5.,edge*fade*knots*.28);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`;
/** Crossed tapered ribbons give a soft, collimated jet at a fixed four draw calls. */
export function PlasmaJets({
  color,
  length = 1.6,
  width = 0.08,
}: {
  color: string;
  length?: number;
  width?: number;
}) {
  const u = useMemo(
    () => ({ uTime: { value: 0 }, uColor: { value: new THREE.Color(color) } }),
    [color],
  );
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(
        [-width * 0.18, 0.08, 0, width * 0.18, 0.08, 0, -width, length, 0, width, length, 0],
        3,
      ),
    );
    g.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, 1, 0, 0, 1, 1, 1], 2));
    g.setIndex([0, 1, 2, 2, 1, 3]);
    g.computeBoundingSphere();
    return g;
  }, [length, width]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame(() => {
    u.uTime.value = motionTimeSeconds();
  });
  return (
    <group name="plasma-jets">
      {[-1, 1].map((sign) => (
        <group key={sign} rotation-z={sign < 0 ? Math.PI : 0}>
          {[0, Math.PI / 2].map((turn) => (
            <mesh key={turn} geometry={geometry} rotation-y={turn}>
              <shaderMaterial
                uniforms={u}
                vertexShader={VERT}
                fragmentShader={BEAM}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                side={THREE.DoubleSide}
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}
