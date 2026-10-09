import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { exoSystemFor, type ExoKind, type ExoPlanet } from "./exosystems";
import { useStore } from "./store";
import { SYSTEM_AU, EARTH_RADIUS, SUN_RADIUS, simulation, eccentricAnomaly } from "./simulation";

// One local presentation conversion for both AU distances and physical radii.
const AU = SYSTEM_AU;
const EARTH_R = EARTH_RADIUS;

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
  out.applyAxisAngle(new THREE.Vector3(1, 0, 0), p.incl);
  return out;
}

// --- Procedural surface per planet class -----------------------------------
// 0 rocky, 1 habitable/ocean, 2 lava, 3 gas giant / hot jupiter, 4 ice giant
function surfaceMode(p: ExoPlanet): number {
  const k: ExoKind = p.kind;
  if (k === "Lava world" || p.teqK > 1100 && p.radiusEarth < 2.5) return 2;
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
varying vec3 vObj; varying vec3 vN; varying vec3 vView;
void main(){
  vObj = normalize(position);
  vN = normalize(mat3(modelMatrix) * normal);
  vec4 w = modelMatrix * vec4(position,1.0);
  vView = -(modelViewMatrix * vec4(position,1.0)).xyz;
  vN = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
  #include <logdepthbuf_vertex>
}`;

const SURF_FRAG = /* glsl */ `
#include <logdepthbuf_pars_fragment>
uniform vec3 uColor; uniform vec3 uStar; uniform float uMode; uniform float uSeed;
uniform float uTime; uniform float uHot; uniform float uLocked;
varying vec3 vObj; varying vec3 vN; varying vec3 vView;
float h(vec3 p){ return fract(sin(dot(p, vec3(127.1,311.7,74.7))) * 43758.5453); }
float n3(vec3 p){
  vec3 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z);
}
float fbm(vec3 p){ float a=0.5, s=0.0; for(int i=0;i<5;i++){ s+=a*n3(p); p*=2.03; a*=0.5; } return s; }
void main(){
  #include <logdepthbuf_fragment>
  vec3 P = vObj * 2.2 + uSeed;
  vec3 L = normalize(uStar);
  vec3 N = normalize(vN);
  vec3 V = normalize(vView);
  float ndl = dot(N, L);
  float day = smoothstep(-0.08, 0.25, ndl);
  vec3 col; float spec = 0.0; vec3 emit = vec3(0.0);
  float lat = vObj.y;
  if (uMode < 0.5) { // rocky / barren
    float t = fbm(P*1.6);
    float crat = smoothstep(0.62, 0.7, n3(P*6.0)) * 0.25;
    col = mix(uColor*0.55, uColor*1.25, t) - crat;
  } else if (uMode < 1.5) { // habitable: oceans, land, ice, clouds
    float t = fbm(P*1.3);
    float land = smoothstep(0.5, 0.56, t);
    vec3 ocean = vec3(0.04,0.16,0.38);
    vec3 ground = mix(vec3(0.22,0.36,0.14), vec3(0.55,0.45,0.3), fbm(P*3.0));
    col = mix(ocean, ground, land);
    float ice = smoothstep(0.72, 0.8, abs(lat) + 0.08*n3(P*4.0));
    col = mix(col, vec3(0.92), ice);
    spec = (1.0 - land) * (1.0 - ice);
    float cl = smoothstep(0.52, 0.72, fbm(P*2.1 + vec3(uTime*0.02,0.0,0.0)));
    col = mix(col, vec3(0.95), cl*0.8);
    spec *= 1.0 - cl;
  } else if (uMode < 2.5) { // lava world
    float t = fbm(P*2.0);
    float cracks = 1.0 - smoothstep(0.02, 0.09, abs(fbm(P*3.5) - 0.5));
    col = mix(vec3(0.07,0.05,0.05), vec3(0.22,0.17,0.15), t);
    emit = vec3(1.0,0.38,0.08) * (cracks*1.4 + 0.25*smoothstep(0.3,1.0,ndl));
  } else { // banded gas / ice giant
    float warp = fbm(vec3(vObj.x*3.0, lat*8.0, vObj.z*3.0) + uSeed + uTime*0.01);
    float bands = sin(lat*(uMode<3.5?22.0:10.0) + warp*3.5);
    float b = 0.5 + 0.5*bands;
    vec3 c2 = uMode<3.5 ? uColor*vec3(1.25,1.12,0.92) : uColor*vec3(0.85,1.05,1.15);
    col = mix(uColor*0.7, c2, b);
    // storm vortex
    vec3 sc = normalize(vec3(0.6, -0.25, 0.75));
    float sd = distance(vObj, sc);
    col = mix(col, uColor*vec3(1.4,0.8,0.6), smoothstep(0.22,0.0,sd)*0.6*(uMode<3.5?1.0:0.4));
    // hot jupiter: glowing dayside hot spot / thermal emission on nightside
    emit = vec3(1.0,0.35,0.1) * uHot * (0.15 + 0.5*smoothstep(0.6,1.0,ndl));
  }
  vec3 lit = col * (0.28 + day * max(ndl, 0.0) * 1.15);
  vec3 Hh = normalize(L + V);
  lit += vec3(1.0,0.95,0.85) * spec * pow(max(dot(N,Hh),0.0), 60.0) * day * 0.9;
  // Rayleigh limb for habitable / gas worlds
  float rim = pow(1.0 - max(dot(N,V),0.0), 3.0);
  vec3 atm = uMode>0.5 && uMode<1.5 ? vec3(0.35,0.6,1.0) : uMode>2.5 ? uColor : vec3(0.0);
  lit += atm * rim * smoothstep(-0.2, 0.4, ndl) * 0.6;
  // terminator sunset band
  lit += vec3(1.0,0.45,0.2) * rim * smoothstep(0.15,0.0,abs(ndl)) * (uMode>0.5&&uMode<1.5?0.4:0.0);
  gl_FragColor = vec4(lit + emit, 1.0);
}`;

function ExoBody({ p, starName, starPos, onPick }: {
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
    for (let i = 0; i <= 160; i++) pts.push(orbitPoint(p, (i / 160) * Math.PI * 2, new THREE.Vector3()));
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
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: SURF_VERT,
        fragmentShader: SURF_FRAG,
        uniforms: {
          uColor: { value: new THREE.Color(p.color) },
          uStar: { value: new THREE.Vector3(1, 0, 0) },
          uMode: { value: mode },
          uSeed: { value: seedOf(starName + p.name) },
          uTime: { value: 0 },
          uHot: { value: mode === 3 ? THREE.MathUtils.clamp((p.teqK - 700) / 900, 0, 1) : 0 },
          uLocked: { value: p.tidallyLocked ? 1 : 0 },
        },
      }),
    [p, mode, starName, starPos],
  );
  useEffect(() => {
    sizes().set(p.name, size);
    return () => {
      sizes().delete(p.name);
      registry().delete(p.name);
      material.dispose();
    };
  }, [p.name, size, material]);
  useFrame(({ clock, camera }) => {
    if (!ref.current) return;
    const mean = p.phase + simulation.days / (p.periodYears * 365.25) * Math.PI * 2;
    const ang = eccentricAnomaly(mean, p.e);
    ref.current.position.copy(orbitPoint(p, ang, tmp));
    ref.current.getWorldPosition(world);
    material.uniforms.uStar.value.copy(tmp).negate().transformDirection(camera.matrixWorldInverse);
    registry().set(p.name, world.clone());
    material.uniforms.uTime.value = clock.elapsedTime;
    // Tidally locked worlds keep one face to the star; others spin.
    if (meshRef.current) {
      if (p.tidallyLocked) meshRef.current.lookAt(starPos);
      else meshRef.current.rotation.y = simulation.days * Math.PI * 2; // modelled one-day spin
    }
  }, -2);
  const pick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onPick(p.name);
  };
  return (
    <>
      <primitive object={line} />
      <group ref={ref}>
        <mesh ref={meshRef} frustumCulled={false} material={material} onClick={pick}>
          <sphereGeometry args={[size, 48, 32]} />
        </mesh>
        {/* larger invisible hit target so small worlds are clickable */}
        <mesh onClick={pick} visible={false}>
          <sphereGeometry args={[Math.max(size * 4, 0.0015), 8, 6]} />
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
      <meshBasicMaterial color="#3ddc84" transparent opacity={0.07} side={THREE.DoubleSide} depthWrite={false} />
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
  const starPos = useMemo(() => new THREE.Vector3(star?.x ?? 0, star?.y ?? 0, star?.z ?? 0), [star]);
  if (!star || !sys) return null;
  return (
    <group position={[star.x, star.y, star.z]}>
      <mesh>
        <sphereGeometry args={[star.radius * SUN_RADIUS, 40, 28]} />
        <meshBasicMaterial color={star.temperature < 3500 ? "#ff9b65" : "#fff4e0"} />
      </mesh>
      <pointLight intensity={2} distance={0} decay={0} color="#fff4e0" />
      <HabitableZone inner={sys.hzInner} outer={sys.hzOuter} />
      {sys.planets.map((p) => (
        <ExoBody key={p.name} p={p} starName={star.name} starPos={starPos} onPick={(n) => visitExoPlanet(star, n)} />
      ))}
    </group>
  );
}
