import { motionTimeSeconds } from "./sim-clock";
import { exoAppearance, exoNoiseVolume } from "./exoplanet-appearance";
import { StellarSurface } from "./StellarSurface";
import { stellarDisplayRadius } from "./camera-navigation";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { NamedStar } from "./data";
import { exoSystemFor, type ExoPlanet } from "./exosystems";
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

function seedOf(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 9973;
  return h / 97.3;
}

// Surfaces are evaluated per pixel from a 3D noise volume on the unit sphere, so
// they stay sharp at any distance and have no seams or pinched poles. Octaves
// finer than ~2 px fade out instead of aliasing. Lighting runs in view space
// (matrices are built in double precision on the CPU), never in world space,
// where float32 cannot resolve a planet hundreds of light-years from the origin.
const SURF_VERT = /* glsl */ `
#include <common>
#include <logdepthbuf_pars_vertex>
varying vec3 vObj;varying vec3 vN;varying vec3 vView;varying vec3 vCenter;
void main(){vObj=position;vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.);vView=mv.xyz;
vCenter=(modelViewMatrix*vec4(0.,0.,0.,1.)).xyz;gl_Position=projectionMatrix*mv;
#include <logdepthbuf_vertex>
}`;
const COMMON = /* glsl */ `
uniform highp sampler3D uNoise;
uniform vec3 uStar;uniform vec3 uLight;uniform vec3 uZone;uniform vec3 uBelt;uniform vec3 uHaze;uniform vec3 uSeedV;
uniform float uMode;uniform float uBands;uniform float uContrast;uniform float uAtmo;uniform float uSea;uniform float uLocked;
uniform float uTSub;uniform float uTDay;uniform float uTNight;uniform float uTInt;uniform float uEmission;uniform float uTime;uniform float uRadius;
varying vec3 vObj;varying vec3 vN;varying vec3 vView;varying vec3 vCenter;
const mat3 ROT=mat3(0.,.8,.6,-.8,.36,-.48,-.6,-.48,.64);
vec4 nz(vec3 p){return texture(uNoise,p*.0625);}
// fBm of three independent noises (std ~0.3); fw = pixel footprint in p units.
vec3 fbm(vec3 p,float fw,int octaves,float gain){vec3 s=vec3(0.);float a=.5;
for(int i=0;i<11;i++){if(i>=octaves)break;s+=a*(1.-smoothstep(.25,.5,fw))*(nz(p).rgb-.5);p=ROT*p*2.03;fw*=2.03;a*=gain;}
return s*3.;}
// Multi-scale crater relief from the volume's alpha channel.
float craters(vec3 p,float fw){float s=0.,a=1.;
for(int i=0;i<6;i++){s+=a*(1.-smoothstep(.12,.3,fw))*(nz(p).a-.5);p=ROT*p*2.7;fw*=2.7;a*=.5;}
return s;}
// Krystek (1985) Planckian locus -> linear sRGB, max channel 1 (shader-skills library, MIT).
vec3 blackbody(float kelvin){float T=clamp(kelvin,1000.,15000.);
float u=(.860117757+1.54118254e-4*T+1.28641212e-7*T*T)/(1.+8.42420235e-4*T+7.08145163e-7*T*T);
float v=(.317398726+4.22806245e-5*T+4.20481691e-8*T*T)/(1.-2.89741816e-5*T+1.61456053e-7*T*T);
float x=3.*u/(2.*u-8.*v+4.),y=2.*v/(2.*u-8.*v+4.);vec3 rgb=max(vec3(x/y,1.,(1.-x-y)/y)*mat3(3.2406,-1.5372,-.4986,-.9689,1.8758,.0415,.0557,-.2040,1.0570),0.);
return rgb/max(max(rgb.r,rgb.g),max(rgb.b,1e-6));}
// Visible (600 nm) thermal glow in the same units as albedo x cos(incidence).
vec3 glow(float T){return blackbody(T)*uEmission/(exp(23980./max(T,300.))-1.);}
`;
const SURF_FRAG = /* glsl */ `
#include <logdepthbuf_pars_fragment>
${COMMON}
void main(){
#include <logdepthbuf_fragment>
vec3 P=normalize(vObj);float px=length(fwidth(P));
vec3 N=normalize(vN),V=normalize(-vView),L=normalize(mat3(viewMatrix)*uStar);
float muG=dot(N,L),mu=max(dot(N,V),1e-3);
vec3 albedo;float h=0.,relief=1.,ocean=0.,cloud=0.,T=0.;
if(uMode>2.5){
  // Giants: warped zonal bands, longitude-stretched streaks and one long-lived oval.
  vec3 t=fbm(P*3.+uSeedV,px*3.,5,.5);
  float y=P.y+t.x*.05+t.y*.025;
  vec3 sp=vec3(P.x,y*7.,P.z)*2.5;float fs=length(fwidth(sp));
  vec3 eddy=fbm(sp*3.+uSeedV.zxy,fs*3.,6,.55);
  vec3 st=fbm(sp+uSeedV+t*.6+eddy*.22,fs,11,.58);
  float band=sin(y*uBands*3.1416+uSeedV.x)+.45*sin(y*uBands*6.7+uSeedV.y);
  band=smoothstep(-.7,.7,band+st.x*1.2);
  albedo=mix(uBelt,uZone,mix(.55,band,uContrast))*(1.+(st.y*.5+st.z*.25)*(.3+uContrast));
  vec3 S=normalize(vec3(cos(uSeedV.z),-.35-.25*fract(uSeedV.x),sin(uSeedV.z)));
  vec3 E=normalize(cross(vec3(0.,1.,0.),S)),Nn=cross(S,E),d3=P-S;
  float oval=1.-smoothstep(.75,1.05,length(vec2(dot(d3,E)/.15,dot(d3,Nn)/.075))+st.z*.35);
  // Cold giants carry bright ovals, ice giants dark spots; hot classes show neither.
  albedo=mix(albedo,uMode>3.5?uBelt*.55:mix(uZone,vec3(1.),.35),oval*.75*step(.5,uContrast+step(3.5,uMode)));
  if(uMode>3.5)albedo+=uHaze*smoothstep(.55,.9,st.y)*smoothstep(.2,.55,abs(P.y))*.6;
  h=st.x*.25;relief=0.;
}else if(uMode>.5&&uMode<1.5){
  // Temperate world: illustrative continents, bare-rock land, ice and weather.
  vec3 tf=fbm(P*1.6+uSeedV,px*1.6,11,.5);
  float hgt=tf.x+.25*tf.y*tf.y,land=smoothstep(uSea,uSea+.02,hgt),elev=hgt-uSea;
  vec3 landCol=mix(vec3(.24,.18,.12),vec3(.38,.34,.30),smoothstep(.03,.35,elev))*(.85+.25*tf.z);
  vec3 sea=mix(uZone,uBelt,smoothstep(0.,.12,uSea-hgt));
  float ice=uLocked>.5?1.-smoothstep(-.45,-.15,P.z+tf.y*.2):smoothstep(.74,.84,abs(P.y)+tf.y*.12);
  albedo=mix(mix(sea,landCol,land),vec3(.82,.86,.9),ice);
  ocean=(1.-land)*(1.-ice);h=land*elev*.5;
  float c=cos(uTime*.015),s=sin(uTime*.015);vec3 cp=vec3(c*P.x-s*P.z,P.y,s*P.x+c*P.z)*2.2+uSeedV.zxy;
  vec3 cw=fbm(cp*.7,px*1.5,3,.5),cf=fbm(cp*1.4+cw*.8,px*3.1,9,.55);
  // Tidally locked: a thick substellar cloud deck (Yang, Cowan & Abbot 2013, ApJL 771, L45).
  float cover=uLocked>.5?mix(.25,.6,smoothstep(.2,.9,P.z)):.35+.15*cos(P.y*9.4);
  cloud=smoothstep(0.,.3,cf.x*.9+cover-.55)*(.7+.3*cf.y);
}else{
  // Airless rock or magma world: maria, highlands and impact craters.
  vec3 tf=fbm(P*2.+uSeedV,px*2.,11,.52);
  float cr=craters(P*4.+uSeedV,px*4.);
  albedo=mix(uBelt,uZone,smoothstep(-.2,.15,tf.x))*(.9+.2*tf.z)*(1.+cr*.6);
  h=cr*.35+tf.y*.12;
  float Ts=uTSub*pow(max(muG,0.),.25);
  float magma=0.;
  if(uMode>1.5){float crack=1.-smoothstep(0.,.07,abs(tf.y));
    magma=max(smoothstep(0.,.35,smoothstep(1300.,2000.,Ts)*1.5-(tf.x*.5+.5)),crack*smoothstep(900.,1500.,Ts));
    albedo=mix(albedo,vec3(.03),magma);}
  float gran=fbm(P*14.+uSeedV.yzx,px*14.,5,.5).x;
  T=Ts*mix(.8,1.+.1*gran,magma); // convective cells in the melt
}
// Relief from screen-space height derivatives (Mikkelsen 2010).
vec3 dpx=dFdx(vView),dpy=dFdy(vView),r1=cross(dpy,N),r2=cross(N,dpx);float det=dot(dpx,r1);
float H=h*relief*uRadius*.06;vec3 Nb=normalize(abs(det)*N-sign(det)*(dFdx(H)*r1+dFdy(H)*r2));
if(dot(Nb,V)<0.)Nb=N;
float muL=max(dot(Nb,L),0.),lit=smoothstep(-.03,.06,muG);
vec3 col;
if(uMode<.5||(uMode>1.5&&uMode<2.5))col=albedo*2.*muL/(muL+mu)*lit;       // Lommel-Seeliger regolith
else if(uMode>2.5)col=albedo*pow(muL,.85)*pow(mu,-.15)*lit;                  // Minnaert limb darkening
else{col=albedo*muL*lit;
  vec3 Hv=normalize(L+V);float f=.02+.98*pow(1.-max(dot(Hv,V),0.),5.);
  col+=vec3(1.)*pow(max(dot(Nb,Hv),0.),260.)*ocean*f*lit*30.;
  col=mix(col,vec3(.92,.93,.95)*max(muG,0.)*lit,cloud);}
col*=uLight;
// Limb haze over the disk, reddened toward the terminator.
float limb=pow(1.-mu,3.)*min(1.,uAtmo*12.);
vec3 air=uMode>.5&&uMode<1.5?mix(vec3(1.,.42,.12),uHaze,smoothstep(0.,.3,muG)):uHaze;
col+=air*uLight*limb*smoothstep(-.12,.35,muG)*.35;
if(uMode>2.5)T=mix(uTNight,uTDay,smoothstep(-.3,.6,muG));
if(uTInt>0.)T=max(T,uTInt*(.94+.12*(cloud+h)));
col+=glow(T);
gl_FragColor=vec4(col*9.,1.);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`;
// Atmosphere annulus outside the disk: density falls with impact parameter,
// lit by the star, with a forward-scattering ring when the planet is backlit.
const ATMOSPHERE = /* glsl */ `
#include <logdepthbuf_pars_fragment>
${COMMON}
void main(){
#include <logdepthbuf_fragment>
vec3 d=normalize(vView),L=normalize(mat3(viewMatrix)*uStar);
vec3 closest=d*dot(vCenter,d)-vCenter;float b=length(closest)/uRadius;
float dens=exp(-max(b-1.,0.)/max(uAtmo,1e-4))*(1.-smoothstep(1.+3.*uAtmo,1.+4.*uAtmo,b));
float day=smoothstep(-.2,.35,dot(closest/max(length(closest),1e-12),L));
float fwd=pow(max(dot(d,L),0.),12.);
gl_FragColor=vec4(uHaze*uLight*dens*(day*.5+fwd*1.5),1.);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`;
const RING = /* glsl */ `
#include <logdepthbuf_pars_fragment>
varying vec2 vUv;uniform vec3 uZone;
void main(){
#include <logdepthbuf_fragment>
float r=length((vUv-.5)*2.),aa=fwidth(r);
float bands=.45+.35*sin(r*420.)*(1.-smoothstep(.002,.006,aa))+.2*sin(r*1190.)*(1.-smoothstep(.0007,.002,aa));
float gap=smoothstep(.015,.026,abs(r-.82));
float alpha=clamp(bands,0.,1.)*gap*smoothstep(.62,.65,r)*(1.-smoothstep(.98,1.,r))*.65;
gl_FragColor=vec4(uZone*2.,alpha);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`;
const RING_VERT = /* glsl */ `
#include <common>
#include <logdepthbuf_pars_vertex>
varying vec2 vUv;
void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
#include <logdepthbuf_vertex>
}`;

function ExoBody({
  p,
  star,
  starPos,
  onPick,
}: {
  p: ExoPlanet;
  star: NamedStar;
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
  const seed = seedOf(star.name + p.name);
  const look = useMemo(() => exoAppearance(p, star, seed), [p, star, seed]);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: SURF_VERT,
        fragmentShader: SURF_FRAG,
        uniforms: {
          uNoise: { value: exoNoiseVolume() },
          uStar: { value: new THREE.Vector3(1, 0, 0) },
          uLight: { value: look.light },
          uZone: { value: look.zone },
          uBelt: { value: look.belt },
          uHaze: { value: look.haze },
          uSeedV: { value: new THREE.Vector3(seed * 1.31, seed * 2.17, seed * 0.73) },
          uMode: { value: look.mode },
          uBands: { value: look.bands },
          uContrast: { value: look.contrast },
          uAtmo: { value: look.atmosphere },
          uSea: { value: p.kind === "Ocean world" ? 0.45 : 0.1 },
          uLocked: { value: p.tidallyLocked ? 1 : 0 },
          uTSub: { value: look.tSub },
          uTDay: { value: look.tDay },
          uTNight: { value: look.tNight },
          uTInt: { value: look.tInt },
          uEmission: { value: look.emissionScale },
          uTime: { value: 0 },
          uRadius: { value: size },
        },
      }),
    [p, look, seed, size],
  );
  useEffect(() => {
    sizes().set(p.name, size);
    return () => {
      sizes().delete(p.name);
      registry().delete(p.name);
      material.dispose();
      line.geometry.dispose();
      line.material.dispose();
    };
  }, [p.name, size, material, line]);
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
    // Tidally locked worlds keep one face (+Z) to the star; others spin.
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
          <sphereGeometry args={[size, 128, 96]} />
        </mesh>
        {look.atmosphere > 0 && (
          <mesh scale={1 + 4 * look.atmosphere}>
            <sphereGeometry args={[size, 64, 48]} />
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
        {/* Illustrative ring system for modelled cool giants */}
        {look.rings && (
          <mesh rotation={[Math.PI / 2.3, 0.18, 0]}>
            <ringGeometry args={[size * 1.45, size * 2.35, 96]} />
            <shaderMaterial
              vertexShader={RING_VERT}
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
          star={star}
          starPos={starPos}
          onPick={(n) => visitExoPlanet(star, n)}
        />
      ))}
    </group>
  );
}
