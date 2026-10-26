import { motionTimeSeconds } from "./sim-clock";
import { makeExoplanetMaps } from "./exoplanet-maps";
import { StellarSurface } from "./StellarSurface";
import { stellarDisplayRadius } from "./camera-navigation";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { exoSystemFor, type ExoKind, type ExoPlanet } from "./exosystems";
import { useStore } from "./store";

// True proportions: orbits, planet radii and the host star all share one
// scale (1 AU = 0.05 scene units), so size-to-distance ratios are exact.
const AU = 0.05;
const ORBIT_AXIS = new THREE.Vector3(1, 0, 0);
const EARTH_RADIUS_AU = 6371 / 149_597_870.7;
const EARTH_R = EARTH_RADIUS_AU * AU;

declare global {
  interface Window {
    __exoSizes?: Map<string, number>;
  }
}

function registry() {
  if (!window.__planetPositions) window.__planetPositions = new Map();
  return window.__planetPositions;
}
function sizes() {
  if (!window.__exoSizes) window.__exoSizes = new Map();
  return window.__exoSizes;
}

function orbitPoint(p: ExoPlanet, ang: number, out: THREE.Vector3) {
  const a = p.aAU * AU;
  const b = a * Math.sqrt(1 - p.e * p.e);
  const c = a * p.e;
  out.set(Math.cos(ang) * a - c, 0, Math.sin(ang) * b);
  out.applyAxisAngle(ORBIT_AXIS, p.incl);
  return out;
}

// --- Procedural surface per planet class -----------------------------------
// 0 rocky, 1 habitable/ocean, 2 lava, 3 gas giant / hot jupiter, 4 ice giant
function surfaceMode(p: ExoPlanet): number {
  const k: ExoKind = p.kind;
  if (k === "Lava world" || (p.teqK > 1100 && p.radiusEarth < 2.5)) return 2;
  if (k === "Hot Jupiter" || k === "Gas giant") return 3;
  if (k === "Ice giant" || k === "Mini-Neptune" || k === "Warm Neptune") return 4;
  if (k === "Ocean world" || p.inHZ) return 1;
  return 0;
}

function seedOf(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 9973;
  return h / 97.3;
}

const SURF_VERT = /* glsl */ `
#include <common>
#include <logdepthbuf_pars_vertex>
varying vec2 vUv;varying vec3 vN;varying vec3 vView;varying vec3 vObj;
void main(){vUv=uv;vObj=normalize(normalMatrix*position);vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.);vView=-mv.xyz;gl_Position=projectionMatrix*mv;
#include <logdepthbuf_vertex>
}`;
const SURF_FRAG = /* glsl */ `
#include <logdepthbuf_pars_fragment>
uniform sampler2D uAlbedo;uniform sampler2D uDetail;
uniform vec3 uStar;uniform vec3 uColor;uniform float uTime;uniform float uMode;uniform float uHot;
varying vec2 vUv;varying vec3 vN;varying vec3 vView;varying vec3 vObj;
void main(){
#include <logdepthbuf_fragment>
vec4 data=texture2D(uDetail,vUv);vec3 col=texture2D(uAlbedo,vUv).rgb;
vec3 N=normalize(vN),V=normalize(vView),L=normalize(mat3(viewMatrix)*uStar);
// Screen derivatives provide fine relief with no extra geometry or texture fetches.
vec3 dx=dFdx(vObj),dy=dFdy(vObj);vec3 rx=cross(dy,N),ry=cross(N,dx);
float det=dot(dx,rx);vec3 gradient=sign(det)*(dFdx(data.r)*rx+dFdy(data.r)*ry);
vec3 relief=gradient/max(abs(det),1e-12)*(uMode<2.5?.0015:.0005);
relief*=min(1.,.15/max(length(relief),1e-8));N=normalize(N-relief);
float ndl=dot(N,L),day=smoothstep(-.035,.12,ndl),mu=max(dot(N,V),0.);
float clouds=texture2D(uDetail,vec2(fract(vUv.x+uTime*.001),vUv.y)).g;
col=mix(col,vec3(.8,.84,.88),clouds*.88);
float lambert=max(ndl,0.);vec3 c=col*(.012+day*lambert*2.5);
float spec=pow(max(dot(N,normalize(L+V)),0.),100.)*data.b*(1.-clouds);
c+=vec3(1.,.91,.76)*spec*day*1.6;
float rim=pow(1.-mu,4.);float atmospheric=step(.5,uMode);
vec3 air=uMode<1.5?vec3(.12,.38,.9):uMode<2.5?vec3(.8,.16,.025):uColor*.5;
c+=air*rim*day*.7*atmospheric;
c+=vec3(.9,.22,.045)*rim*exp(-abs(ndl)*18.)*atmospheric*.5;
if(uMode>1.5&&uMode<2.5){float fissure=1.-smoothstep(.009,.028,abs(data.r-.51));float lake=smoothstep(.25,.9,ndl)*smoothstep(.52,.7,data.r);c+=vec3(1.,.15,.012)*(fissure*.8+lake*1.2);}
c+=vec3(1.,.2,.025)*uHot*pow(max(ndl,0.),2.)*.3;
gl_FragColor=vec4(c*4.,1.);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`;
const ATMOSPHERE = /* glsl */ `
#include <logdepthbuf_pars_fragment>
uniform vec3 uStar;uniform vec3 uColor;varying vec3 vN;varying vec3 vView;
void main(){
#include <logdepthbuf_fragment>
vec3 N=normalize(vN),V=normalize(vView),L=normalize(mat3(viewMatrix)*uStar);
float rim=pow(1.-abs(dot(N,V)),4.);float day=smoothstep(-.25,.4,dot(N,L));
gl_FragColor=vec4(uColor*3.,rim*day*.28);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`;
const RING = /* glsl */ `
#include <logdepthbuf_pars_fragment>
varying vec2 vUv;varying vec3 vN;varying vec3 vView;uniform vec3 uColor;uniform vec3 uStar;
void main(){
#include <logdepthbuf_fragment>
float r=length((vUv-.5)*2.);float bands=.45+.35*sin(r*420.)+.2*sin(r*1190.);float gap=smoothstep(.015,.026,abs(r-.82));
float alpha=clamp(bands,0.,1.)*gap*smoothstep(.62,.65,r)*(1.-smoothstep(.98,1.,r))*.65;
gl_FragColor=vec4(uColor*2.,alpha);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`;

function ExoBody({
  p,
  starName,
  starPos,
  onPick,
}: {
  p: ExoPlanet;
  starName: string;
  starPos: THREE.Vector3;
  onPick: (name: string) => void;
}) {
  const ref = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const world = useMemo(() => new THREE.Vector3(), []);
  const line = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 160; i++)
      pts.push(orbitPoint(p, (i / 160) * Math.PI * 2, new THREE.Vector3()));
    const g = new THREE.BufferGeometry().setFromPoints(pts);
    const m = new THREE.LineBasicMaterial({
      color: p.inHZ ? "#5cf08a" : "#8aa0c8",
      transparent: true,
      opacity: p.inHZ ? 0.55 : 0.28,
      depthWrite: false,
    });
    return new THREE.Line(g, m);
  }, [p]);
  const size = p.radiusEarth * EARTH_R;
  const mode = surfaceMode(p);
  const hasRings =
    (mode === 3 || mode === 4) &&
    p.aAU > 0.35 &&
    Math.floor(seedOf(starName + p.name) * 10) % 3 === 0;
  const maps = useMemo(
    () => makeExoplanetMaps(p, seedOf(starName + p.name), mode),
    [p, starName, mode],
  );
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: SURF_VERT,
        fragmentShader: SURF_FRAG,
        uniforms: {
          uAlbedo: { value: maps.albedo },
          uDetail: { value: maps.detail },
          uColor: { value: new THREE.Color(p.color) },
          uStar: { value: starPos.clone() },
          uMode: { value: mode },
          uSeed: { value: seedOf(starName + p.name) },
          uTime: { value: 0 },
          uHot: { value: mode === 3 ? THREE.MathUtils.clamp((p.teqK - 700) / 900, 0, 1) : 0 },
          uLocked: { value: p.tidallyLocked ? 1 : 0 },
        },
      }),
    [p, mode, starName, starPos, maps],
  );
  useEffect(() => {
    sizes().set(p.name, size);
    return () => {
      sizes().delete(p.name);
      registry().delete(p.name);
      material.dispose();
      maps.albedo.dispose();
      maps.detail.dispose();
      line.geometry.dispose();
      line.material.dispose();
    };
  }, [p.name, size, material, maps, line]);
  useFrame(({ camera, size: viewport }) => {
    if (!ref.current) return;
    const speed = 1 / 25;
    const ang =
      p.phase +
      ((motionTimeSeconds() * speed) / (8 * Math.pow(p.periodYears, 0.5))) * Math.PI * 2 * 0.25;
    ref.current.position.copy(orbitPoint(p, ang, tmp));
    ref.current.getWorldPosition(world);
    let position = registry().get(p.name);
    if (!position) {
      position = new THREE.Vector3();
      registry().set(p.name, position);
    }
    position.copy(world);
    material.uniforms.uStar.value.copy(starPos).sub(world).normalize();
    const pixels = (size / camera.position.distanceTo(world)) * viewport.height;
    const body = meshRef.current?.parent;
    if (body) body.visible = pixels > 0.15;
    material.uniforms.uTime.value = motionTimeSeconds();
    // Tidally locked worlds keep one face to the star; others spin.
    if (meshRef.current) {
      if (p.tidallyLocked) meshRef.current.lookAt(starPos);
      else meshRef.current.rotation.y = motionTimeSeconds() * 0.3;
    }
  }, -2); // Publish live body coordinates after the clock and before CameraRig.
  const pick = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 4) return;
    e.stopPropagation();
    onPick(p.name);
  };
  return (
    <>
      <primitive object={line} />
      <group ref={ref}>
        <mesh ref={meshRef} name={`exoplanet:${p.name}`} material={material} onClick={pick}>
          <sphereGeometry args={[size, 64, 48]} />
        </mesh>
        {/* Outer Rayleigh / photochemical atmospheric scattering shell */}
        {mode >= 1 && (
          <mesh scale={1.045}>
            <sphereGeometry args={[size, 32, 24]} />
            <shaderMaterial
              vertexShader={SURF_VERT}
              fragmentShader={ATMOSPHERE}
              uniforms={material.uniforms}
              transparent
              side={THREE.BackSide}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        )}
        {/* Procedural ring system for cool gas/ice giants */}
        {hasRings && (
          <mesh rotation={[Math.PI / 2.3, 0.18, 0]}>
            <ringGeometry args={[size * 1.45, size * 2.35, 96]} />
            <shaderMaterial
              vertexShader={SURF_VERT}
              fragmentShader={RING}
              uniforms={material.uniforms}
              transparent
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        )}
        {/* larger invisible hit target so small worlds are clickable */}
        <mesh onClick={pick} visible={false}>
          <sphereGeometry
            args={[Math.max(size * 4, Math.min(0.0015, p.aAU * AU * (1 - p.e) * 0.2)), 8, 6]}
          />
        </mesh>
      </group>
    </>
  );
}

/** Habitable-zone annulus (green "Goldilocks" band). */
function HabitableZone({ inner, outer }: { inner: number; outer: number }) {
  return (
    <mesh rotation-x={-Math.PI / 2}>
      <ringGeometry args={[inner * AU, outer * AU, 128]} />
      <meshBasicMaterial
        color="#3ddc84"
        transparent
        opacity={0.07}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

/** Planetary system rendered around the visited star (or the star whose planet is being visited). */
export function ExoSystem() {
  const selected = useStore((s) => s.selectedStar);
  const exoVisit = useStore((s) => s.exoVisit);
  const visitExoPlanet = useStore((s) => s.visitExoPlanet);
  const star = selected ?? exoVisit?.star ?? null;
  const sys = useMemo(() => (star && star.name !== "Sun" ? exoSystemFor(star) : null), [star]);
  const starPos = useMemo(
    () => new THREE.Vector3(star?.x ?? 0, star?.y ?? 0, star?.z ?? 0),
    [star],
  );
  const systemRef = useRef<THREE.Group>(null!);
  const renderDistance = useMemo(
    () => (sys ? Math.max(sys.hzOuter, ...sys.planets.map((p) => p.aAU), 1) * AU * 20 : 0),
    [sys],
  );
  useFrame(({ camera }) => {
    if (!systemRef.current || !sys) return;
    systemRef.current.visible = camera.position.distanceTo(starPos) < renderDistance;
  });
  if (!star || !sys) return null;
  return (
    <group ref={systemRef} position={[star.x, star.y, star.z]}>
      <pointLight intensity={2} distance={0} decay={0} color="#fff4e0" />
      <StellarSurface star={star} radius={stellarDisplayRadius(star)} />
      <HabitableZone inner={sys.hzInner} outer={sys.hzOuter} />
      {sys.planets.map((p) => (
        <ExoBody
          key={p.name}
          p={p}
          starName={star.name}
          starPos={starPos}
          onPick={(n) => visitExoPlanet(star, n)}
        />
      ))}
    </group>
  );
}
