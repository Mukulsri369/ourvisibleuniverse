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
const FRAG = /* glsl */ `
#include <logdepthbuf_pars_fragment>
uniform vec3 uEye;uniform vec3 uOld;uniform vec3 uYoung;uniform float uMode;uniform float uSeed;uniform float uArms;uniform float uPitch;uniform float uBulge;uniform float uBar;uniform float uDust;uniform float uTime;uniform float uOpacity;uniform float uRing;uniform float uRotationRate;uniform float uSingleTail;
varying vec3 vP;
float hash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1)),f.x),f.y),f.z);}
void main(){
#include <logdepthbuf_fragment>
vec3 rd=normalize(vP-uEye);float b=dot(uEye,rd),c=dot(uEye,uEye)-1.8;float disc=b*b-c;if(disc<0.)discard;
float start=max(0.,-b-sqrt(disc)),finish=-b+sqrt(disc);
bool elliptical=uMode<.5;bool irregular=uMode>3.5&&uMode<4.5;bool dwarf=uMode>7.5&&uMode<8.5;
if(!elliptical&&!dwarf&&uMode!=6.&&abs(rd.y)>.001){float a=(-.18-uEye.y)/rd.y,z=(.18-uEye.y)/rd.y;start=max(start,min(a,z));finish=min(finish,max(a,z));}
if(finish<=start)discard;float stepSize=(finish-start)/24.;vec3 sum=vec3(0.);float transmission=1.;
for(int i=0;i<24;i++){
 vec3 p=uEye+rd*(start+(float(i)+.5)*stepSize);float r=length(p.xz),z=abs(p.y),a=atan(p.z,p.x)+uTime*uRotationRate/max(r,.12);
 float grain=noise(p*42.+uSeed);float turbulence=noise(p*11.+uSeed)*.7+grain*.3;
 float bulge=exp(-pow(length(p*vec3(1.,1.6,1.))/max(uBulge,.05),.75)*3.8);
 float radial=exp(-r*3.7)*(1.-smoothstep(.85,1.15,r));float disk=exp(-z/(.018+.025*r))*radial;
 float phase=(a-log(max(r,.12))/tan(uPitch))*max(uArms,1.)+(noise(p*7.+uSeed)-.5)*1.9;
 float arm=exp(-pow(sin(phase*.5)/.38,2.))*smoothstep(.08,.25,r);float dustArm=exp(-pow(sin((phase+.55)*.5)/.18,2.));
 float stellar=disk*(.85+arm*1.2)*(.45+pow(turbulence,1.5)*1.4);if(uRing>0.)stellar+=exp(-pow((r-uRing)/.055,2.))*exp(-z*40.)*.12;float young=arm*disk*smoothstep(.08,.3,r)*(.15+pow(turbulence,3.)*3.);
 if(uMode>1.5&&uMode<2.5){float bar=exp(-abs(p.z)*30.-abs(p.x)/max(uBar,.05)*2.-z*45.);stellar+=bar*.8;}
 if(uMode>2.5&&uMode<3.5){float ring=exp(-pow((r-.68-.018*sin(a*3.))/.075,2.))*exp(-z*30.);stellar=ring*(.5+turbulence)+disk*.08;young=ring*(.3+pow(turbulence,2.)*2.);bulge*=1.3;}
 if(irregular){stellar=disk*(.15+pow(turbulence,3.)*7.);young=stellar*.65;bulge*=.08;}
 if(uMode>5.5&&uMode<6.5){stellar*=1.7;young+=disk*1.1;}
 if(uMode>6.5&&uMode<7.5){if(uSingleTail<.5)bulge=.6*(exp(-length((p-vec3(.22,0.,.05))*vec3(1.,1.5,1.))*22.)+exp(-length((p+vec3(.22,0.,.05))*vec3(1.,1.5,1.))*22.));float tail=exp(-pow((r-(.65+.25*sin(a*2.)))/.09,2.))*exp(-z*14.);stellar+=tail*.24;young+=tail*grain*.12;}
 if(elliptical||dwarf){float e=length(p*vec3(1.,dwarf?1.6:1.25,1.1));stellar=exp(-pow(e,.65)*5.2);young=0.;bulge=0.;}
 if(uMode>8.5){stellar=disk*.65;young=0.;}
 float dust=uDust*dustArm*disk*(.6+turbulence)*9.*smoothstep(.13,.3,r);
 float knots=pow(smoothstep(.54,.86,grain),3.)*young;
 float fine=.65+noise(p*180.+uSeed)*.7;
 vec3 emission=uOld*(stellar*7.*fine+bulge*38.)+uYoung*young*5.*fine+vec3(1.,.28,.42)*knots*2.;
 if(uMode>5.5&&uMode<6.5)emission+=vec3(1.,.3,.2)*exp(-r/(.04+z*.25))*exp(-z*4.)*.35;
 // Dust attenuates the light behind it instead of adding red light.
 float optical=(stellar*.8+bulge*2.+dust)*stepSize*14.;float alpha=1.-exp(-optical);
 vec3 source=emission/max(stellar*.8+bulge*2.+dust,.001);
 sum+=transmission*source*alpha;transmission*=1.-alpha;
 if(transmission<.015)break;
}
float opacity=(1.-transmission)*uOpacity;if(opacity<.003)discard;
gl_FragColor=vec4(sum/max(1.-transmission,.001),opacity);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`;
export function GalaxyRadiance({ model, opacity = 1 }: { model: GalaxyModel; opacity?: number }) {
  const ref = useRef<THREE.Mesh>(null!);
  const eye = useMemo(() => new THREE.Vector3(), []);
  const stars = useMemo(() => {
    let seed = 17;
    for (const c of model.name) seed = (Math.imul(seed, 31) + c.charCodeAt(0)) | 0;
    const rand = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) | 0;
      return (seed >>> 0) / 4294967296;
    };
    const count = 7000,
      p = new Float32Array(count * 3),
      c = new Float32Array(count * 3);
    const spheroid = ["elliptical", "dwarf"].includes(model.morphology);
    for (let i = 0; i < count; i++) {
      let r = Math.min(1.08, -Math.log(1 - rand() * 0.98) / 4.5),
        angle =
          (Math.floor(rand() * Math.max(2, model.arms)) * Math.PI * 2) / Math.max(2, model.arms) +
          Math.log(Math.max(r, 0.12)) / Math.tan((Math.max(8, model.pitchDeg) * Math.PI) / 180) +
          (rand() - 0.5) * 1.2;
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
      const young = !spheroid && rand() < 0.24;
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
  useEffect(() => () => stars.dispose(), [stars]);
  useFrame(({ camera }) => {
    if (!ref.current) return;
    ref.current.worldToLocal(eye.copy(camera.position));
    uniforms.uEye.value.copy(eye);
    uniforms.uTime.value = motionTimeSeconds();
  });
  return (
    <mesh
      ref={ref}
      name={`galaxy-radiance:${model.name}`}
      scale={model.diskRadius}
      frustumCulled={false}
    >
      <points geometry={stars} frustumCulled={false}>
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={GLINT_VERT}
          fragmentShader={GLINT_FRAG}
          vertexColors
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <boxGeometry args={[2.7, 2.7, 2.7]} />
      <shaderMaterial
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.BackSide}
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
  distance: 26000,
};
export const ANDROMEDA_APPEARANCE: GalaxyModel = {
  ...shared,
  key: "andromeda",
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
varying vec3 vColor;void main(){vColor=color;vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;gl_PointSize=1.4;
#include <logdepthbuf_vertex>
}`;
const GLINT_FRAG = `
#include <logdepthbuf_pars_fragment>
uniform float uOpacity;varying vec3 vColor;void main(){
#include <logdepthbuf_fragment>
float r=length(gl_PointCoord*2.-1.);if(r>1.)discard;gl_FragColor=vec4(vColor*5.,exp(-r*r*5.)*.3*uOpacity);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`;
