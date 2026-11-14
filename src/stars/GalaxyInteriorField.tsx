import { galaxyStructure } from "./galaxy-structure";
import { motionTimeSeconds } from "./sim-clock";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { GalaxyModel } from "./galaxy-models";
import {
  makeGalaxyInteriorStars,
  galaxyStarGeometry,
  type GalaxyStarData,
} from "./galaxy-interior-stars";
import { makeLocalStarData } from "./galaxy-star-data";

/** Resolved stars drawn around an observer inside a galaxy, and their tile's size in light-years. */
const LOCAL_STARS = 40000;
const LOCAL_TILE_LY = 1300;
import { galaxyMotion } from "./galaxy-journey";
import { DISK_LAYER_GLSL, type DiskLayerUniforms } from "./galaxy-disk-layer";
export function GalaxyInteriorField({
  model,
  count = 100000,
  exterior = false,
  visibility,
  field,
  cacheFade,
  eye,
  disk,
}: {
  disk?: Partial<DiskLayerUniforms>;
  model: GalaxyModel;
  count?: number;
  exterior?: boolean;
  visibility?: THREE.IUniform<number>;
  field?: THREE.IUniform<THREE.Texture | null>;
  cacheFade?: THREE.IUniform<number>;
  eye?: THREE.IUniform<THREE.Vector3>;
}) {
  // Keep the existing exterior while a worker prepares the nested interior population.
  const populationGain = galaxyStructure(model).population ? 2.5 : 1;
  const baseCount = Math.min(count, 36000);
  const baseGeometry = useMemo(() => makeGalaxyInteriorStars(model, baseCount), [model, baseCount]);
  const [stream, setStream] = useState<{
    name: string;
    count: number;
    geometry: THREE.BufferGeometry;
  } | null>(null);
  const geometry =
    stream?.name === model.name && stream.count === count ? stream.geometry : baseGeometry;
  useEffect(() => {
    if (count <= 36000) {
      setStream(null);
      return;
    }
    let alive = true;
    const accept = (data: GalaxyStarData) => {
      if (alive) setStream({ name: model.name, count, geometry: galaxyStarGeometry(data) });
    };
    let worker: Worker | undefined;
    const fallback = () => {
      const build = () => {
        if (alive)
          setStream({ name: model.name, count, geometry: makeGalaxyInteriorStars(model, count) });
      };
      if ("requestIdleCallback" in window) window.requestIdleCallback(build, { timeout: 1000 });
      else setTimeout(build, 0);
    };
    try {
      worker = new Worker(new URL("./galaxy-star-worker.ts", import.meta.url), { type: "module" });
      worker.onmessage = (event: MessageEvent<GalaxyStarData>) => {
        accept(event.data);
        worker?.terminate();
      };
      worker.onerror = () => {
        worker?.terminate();
        fallback();
      };
      worker.postMessage({ model, count });
    } catch {
      fallback();
    }
    return () => {
      alive = false;
      worker?.terminate();
    };
  }, [model, count]);
  useEffect(() => () => baseGeometry.dispose(), [baseGeometry]);
  useEffect(() => () => stream?.geometry.dispose(), [stream]);
  // Inside a disk-layer galaxy, a tile of resolved stars wraps around the eye, so nearby stars
  // show parallax and fill the sky as in SpaceEngine, while the volume carries the unresolved
  // band. The Milky Way's own sky comes from its star catalogues instead.
  const localTile =
    !exterior && disk && model.name !== "Milky Way"
      ? THREE.MathUtils.clamp(LOCAL_TILE_LY / model.diskRadius, 0.02, 0.3)
      : 0;
  const localGeometry = useMemo(
    () => (localTile > 0 ? galaxyStarGeometry(makeLocalStarData(LOCAL_STARS, model.name)) : null),
    [localTile, model.name],
  );
  useEffect(() => () => localGeometry?.dispose(), [localGeometry]);
  const makeMaterial = (tile: number) =>
    new THREE.ShaderMaterial({
      defines: disk ? { GALAXY_DISK_LAYER: 1 } : {},
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uField: { value: null },
        uHasField: { value: 0 },
        uEye: { value: new THREE.Vector3() },
        uPopulation: { value: 1 },
        uRotation: {
          value: galaxyStructure(model).rotationRate,
        },
        uReveal: { value: 0 },
        uVisibility: { value: 1 },
        uExterior: { value: 0 },
        uViewport: { value: 800 },
        uAspect: { value: 1 },
        uClipStars: { value: 1 },
        uLocalTile: { value: tile },
        // Shared by reference with the volume, so map bindings stay in step.
        ...(disk ?? {}),
      },
      vertexShader: /* glsl */ `#include <common>
#include <logdepthbuf_pars_vertex>
precision highp sampler3D;
#ifdef GALAXY_DISK_LAYER
${DISK_LAYER_GLSL}
#endif
uniform sampler3D uField;uniform vec3 uEye;uniform float uHasField,uPopulation;
uniform float uTime,uReveal,uViewport,uRotation,uExterior,uAspect,uClipStars,uLocalTile;attribute float aLum,aPhase;varying vec3 vColor;varying float vLum,vDistance,vCrisp;
void main(){vec3 pos=position;float localFade=1.;vCrisp=0.;
// Local stars: unit-cube positions wrapped into a tile centred on the eye (fixed in the galaxy,
// faded before the tile's edge so the wrap is never seen), given in the pattern's frame.
if(uLocalTile>0.){vec3 o=mod(position*uLocalTile-uEye+.5*uLocalTile,uLocalTile)-.5*uLocalTile;vec3 P=uEye+o;localFade=1.-smoothstep(.3*uLocalTile,.5*uLocalTile,length(o));float T=uTime*uRotation;pos=vec3(P.x*cos(T)-P.z*sin(T),P.y,P.x*sin(T)+P.z*cos(T));}
float radius=length(pos.xz),angle=-uTime*uRotation;float c=cos(angle),s=sin(angle);vec3 p=vec3(pos.x*c-pos.z*s,pos.y,pos.x*s+pos.z*c);vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;
// Reject invisible points before six 3D dust lookups. Worker-sorted indices
// keep nearby stars together so neighbouring GPU lanes take the same branch.
vec2 margin=vec2(20./(uViewport*uAspect),20./uViewport);
if(uClipStars>.5&&(gl_Position.w<=0.||any(greaterThan(abs(gl_Position.xy),vec2(gl_Position.w)*(vec2(1.)+margin))))){gl_Position=vec4(2.,2.,2.,1.);gl_PointSize=1.;vColor=vec3(0.);vLum=0.;vDistance=1.;return;}
float unit=length(modelMatrix[0].xyz);vDistance=length(mv.xyz)/max(unit,.001);vColor=color;float tau=0.;if(uHasField>.5){vec3 end=mix(p,uEye,min(1.,2.7/max(.001,length(uEye-p))));float ds=length(end-p)/6.;for(int j=0;j<6;j++){vec3 q=mix(p,end,(float(j)+.5)/6.);float an=uTime*uRotation;q.xz=mat2(cos(an),sin(an),-sin(an),cos(an))*q.xz;tau+=texture(uField,q/2.7+.5).a*ds;}}vLum=aLum*(.985+.015*sin(uTime*.4+aPhase))*exp(-tau*5.)*uPopulation;
#ifdef GALAXY_DISK_LAYER
{vec3 young,old;float faceTau;diskMaps(pos.xz,-8.4,young,old,faceTau);
// Points stand for unresolved associations: bright on arms and knots, faint between them.
float host=dot(young,vec3(.2126,.7152,.0722))*4.+dot(old,vec3(.2126,.7152,.0722))*.9;
// Dust column between the star and the eye through the thin dust layer.
float rr=length(pos.xz),hd=uDiskHeights.w*diskFlare(rr);
float span=length(uEye-p),cosv=abs(uEye.y-p.y)/max(span,1e-6);
float fs=pos.y<0.?.5*exp(pos.y/hd):1.-.5*exp(-pos.y/hd);
float fe=uEye.y<0.?.5*exp(uEye.y/hd):1.-.5*exp(-uEye.y/hd);
float layerTau=faceTau+diskDiffuseTau(rr);
float column=layerTau*abs(fe-fs)/max(cosv,.04);
if(uExterior<.5){
// From inside, the sight line runs through the layer beside whichever end lies deeper in it.
// The medium near the eye is cleared, so only its smooth dust counts there. A path along the
// layer takes its mid-plane density times the path, the limit of the plane-parallel column.
layerTau=mix(layerTau,diskDiffuseTau(length(uEye.xz)),smoothstep(-hd,hd,abs(pos.y)-abs(uEye.y)));
float along=span*exp(-abs(.5*(pos.y+uEye.y))/hd)/(2.*hd);
column=layerTau*mix(along,abs(fe-fs)/max(cosv,.04),smoothstep(0.,.04,cosv));
}
// Part-only systems (mergers, groups) show their photographed components from outside;
// their generic star points appear only once inside. Resolved populations (dwarfs,
// ellipticals, irregulars) keep their own star distribution.
float gain=uDiskStarHost>1.5?1.:uDiskStarHost>.5?clamp(host,0.,2.6):1.-uExterior;
// Resolved populations are drawn as crisp stars from outside too.
vCrisp=step(1.5,uDiskStarHost);
// Points standing for associations in a disk take the maps' colour where they sit (blue on the
// arms, warm between them), so they match the volume's display palette.
vec3 mapColour=young*4.+old*.9;float mapLuma=dot(mapColour,vec3(.2126,.7152,.0722));
if(uDiskStarHost>.5&&uDiskStarHost<1.5&&uLocalTile<=0.&&mapLuma>1e-5)vColor=mapColour/mapLuma*dot(color,vec3(.2126,.7152,.0722));
if(uLocalTile>0.){
// Local stars follow where the galaxy has stars: its face-on light (display units, comparable
// between galaxies), the disk's vertical profile, and the spheroid normalised to its centre.
float col=dot(young+old,vec3(.2126,.7152,.0722));
float zo=uDiskHeights.x*diskFlare(rr),zt=uDiskShape.x*diskFlare(rr);
float vert=mix(diskSech2(pos.y/zo),diskSech2(pos.y/zt),uDiskShape.y);
float diskStars=uDiskStarHost>1.5?0.:smoothstep(.002,.05,col)*(.55+.45*smoothstep(.03,.25,col))*vert;
vec3 b=vec3(uDiskBulgeTurn.x*pos.x+uDiskBulgeTurn.y*pos.z,pos.y,uDiskBulgeTurn.x*pos.z-uDiskBulgeTurn.y*pos.x);
float m=length(b/uDiskBulgeAxes.xyz)/uDiskBulge.x;
float sph=uDiskBulge.z>0.?exp(-uDiskBulgeAxes.w*pow(m+.002,uDiskBulge.w))*(1.-smoothstep(3.,5.5,m)):0.;
gain=localFade*clamp(1.5*max(diskStars,sqrt(sph)),0.,1.5);
}
vLum*=gain*exp(-column*1.1);}
#endif
gl_PointSize=clamp(uViewport*(uLocalTile>0.?.0015:.002)*sqrt(aLum)/sqrt(max(.0001,vDistance)),mix(.9,1.,uExterior),mix(uLocalTile>0.?6.:9.,3.,uExterior));
#include <logdepthbuf_vertex>
}`,
      fragmentShader: /* glsl */ `#include <logdepthbuf_pars_fragment>
uniform float uReveal,uVisibility,uExterior;varying vec3 vColor;varying float vLum,vDistance,vCrisp;
void main(){
#include <logdepthbuf_fragment>
vec2 p=gl_PointCoord*2.-1.;float r2=dot(p,p);if(r2>1.)discard;
// Exterior points represent unresolved associations. A broader, lower-exposure
// footprint lets their warm/cool colours and the continuous dust volume survive
// overlap, rather than tracing the arms as clipped white beads. Interior stars
// retain their close-range core, exposure and travel/reveal behaviour.
float interiorCore=exp(-r2*20.)+.006*exp(-r2*3.);
float exteriorCore=.65*exp(-r2*8.)+.04*exp(-r2*2.5);
// Resolved populations (dwarfs, ellipticals, irregulars) keep most of the interior's crisp core
// from outside, so they read as swarms of stars rather than a smooth glow.
float ext=uExterior*(1.-.7*vCrisp);
float core=mix(interiorCore,exteriorCore,ext);
float flux=clamp(vLum/sqrt(max(.05,vDistance)),.04,mix(2.5,4.,uExterior))*(1.+2.*vCrisp*uExterior);
float nearFade=smoothstep(.00002,.0004,vDistance);
vec3 radiance=vColor*mix(7.,1.9,ext);
gl_FragColor=vec4(radiance,core*flux*mix(.11,.30,uReveal)*nearFade*uVisibility*mix(1.,1.2,uExterior));
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const material = useMemo(() => makeMaterial(0), [model, disk]);
  const localMaterial = useMemo(
    () => (localTile > 0 ? makeMaterial(localTile) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [model, disk, localTile],
  );
  useEffect(() => () => localMaterial?.dispose(), [localMaterial]);
  const points = useRef<THREE.Points>(null);
  const update = (
    material: THREE.ShaderMaterial,
    size: { width: number; height: number },
    gl: THREE.WebGLRenderer,
  ) => {
    const time = motionTimeSeconds();
    material.uniforms.uTime.value = time;
    material.uniforms.uField.value = field?.value ?? null;
    material.uniforms.uHasField.value = field?.value && (cacheFade?.value ?? 0) > 0.9 ? 1 : 0;
    if (eye) material.uniforms.uEye.value.copy(eye.value);
    material.uniforms.uPopulation.value =
      populationGain *
      (exterior ? Math.min(4, 100000 / geometry.getAttribute("position").count) : 1);
    material.uniforms.uVisibility.value = visibility?.value ?? 1;
    material.uniforms.uExterior.value = exterior ? 1 : 0;
    material.uniforms.uReveal.value = exterior
      ? 0.18
      : Math.max(
          galaxyMotion.reveal,
          THREE.MathUtils.smoothstep(galaxyMotion.progress, 0.08, 0.4) * 0.5,
        );
    material.uniforms.uViewport.value = size.height * gl.getPixelRatio();
    material.uniforms.uAspect.value = size.width / Math.max(1, size.height);
  };
  useFrame(({ size, gl }) => {
    update(material, size, gl);
    if (localMaterial) {
      update(localMaterial, size, gl);
      localMaterial.uniforms.uPopulation.value = 4;
    }
  });

  useEffect(() => () => material.dispose(), [material]);
  return (
    <>
      <points
        ref={points}
        dispose={null}
        name={(exterior ? "galaxy-exterior-stars:" : "galaxy-interior-stars:") + model.name}
        geometry={geometry}
        material={material}
        frustumCulled
        raycast={() => {}}
      />
      {localGeometry && localMaterial && (
        <points
          dispose={null}
          name={"galaxy-local-stars:" + model.name}
          geometry={localGeometry}
          material={localMaterial}
          frustumCulled={false}
          raycast={() => {}}
        />
      )}
    </>
  );
}
