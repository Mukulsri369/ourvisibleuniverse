import * as THREE from "three";
import type { GalaxyModel } from "./galaxy-models";
import { galaxyStructure } from "./galaxy-structure";
import { catalogueAppearance } from "./galaxy-overview-appearance";
import { OBSERVED_IMAGE_BY_KEY } from "./galaxy-observed-images";
import { earthDirectionLocal, observedImageMatrix } from "./galaxy-observed-projection";
import diskMapData from "./catalog-data/galaxy-disk-maps.json";

/**
 * GALAXY DISK LAYER
 *
 * Disk galaxies are rendered as face-on 2D maps (in-plane structure) multiplied by
 * analytic vertical profiles, the geometry used by panchromatic radiative-transfer
 * models of nearby spirals (De Looze et al. 2014, A&A 571, A69; Nersesian et al. 2020):
 *
 *  - an old stellar disk (sech², exponential scale height ≈ 0.1 × scale length, de Grijs
 *    1998; Kregel et al. 2002) plus a fainter thick disk;
 *  - a thinner young (UV) disk and dust disk at about half the old scale height
 *    (Xilouris et al. 1999), and ionised gas at about a quarter;
 *  - a flattened spheroidal bulge.
 *
 * Seven galaxies with registered telescope images take their in-plane maps from the
 * image itself (scripts/derive-galaxy-disk-maps.ts); the rest bake a procedural map
 * from their catalogued morphology. Vertical structure, the far side of each disk and
 * everything outside a photograph's frame are reconstructions, not measurements.
 */

type RGB = [number, number, number];

export type ObservedDiskPart = {
  id: string;
  label: string;
  source: string;
  uvRect: [number, number, number, number];
  atlasRect: [number, number, number, number];
  centreUv: [number, number];
  axisA: [number, number];
  axisB: [number, number];
  depthCentre: number;
  depthExtent: number;
  centre: [number, number, number];
  radius: number;
  /** Local units (disk radii) per atlas texel. */
  texel: number;
  /** "spheroid": spherically deprojected; "sheet": flattened slab (disturbed disks, tails, gas). */
  kind?: "spheroid" | "sheet";
};
export type ObservedDiskMap = {
  key: string;
  image: string;
  /** "disk": deprojected face-on maps plus parts; "sky": sightline-extruded parts only. */
  mode: "disk" | "sky";
  extent: number;
  detail: { url: string; size: number; scale: number } | null;
  smooth: { url: string; size: number; scale: number } | null;
  dust: { url: string; size: number; tauMax: number; encoding: "sqrt" } | null;
  parts: {
    url: string;
    width: number;
    height: number;
    scale: number;
    items: ObservedDiskPart[];
  } | null;
  profile: { old: [number, number]; young: [number, number]; dust: [number, number] };
  colours: { old: RGB; young: RGB };
  stars: number;
  note: string;
};

export const OBSERVED_DISK_MAPS: Readonly<Record<string, ObservedDiskMap>> = (
  diskMapData as unknown as { maps: Record<string, ObservedDiskMap> }
).maps;

/** Maximum sightline-extruded parts (bulges, companions) per galaxy. */
export const MAX_DISK_PARTS = 6;

export type ProceduralDiskParameters = {
  arms: number;
  /** Pitch angle (radians). */
  pitch: number;
  /** Bar half-length (disk radii) and position angle in the disk plane (radians). */
  bar: number;
  barAngle: number;
  ring: number;
  ringWidth: number;
  seed: number;
  flocculent: number;
  grand: number;
  lenticular: number;
  clumps: number;
  asymmetry: number;
  lanes: number;
  /** Exponential scale lengths (disk radii) of the old and young light. */
  oldScale: number;
  youngScale: number;
  /** Central amplitudes (display-referred photo units). */
  oldAmp: number;
  youngAmp: number;
  hiiAmp: number;
  dustAmp: number;
  /** Outer truncation radius (disk radii). */
  outer: number;
  oldColour: RGB;
  youngColour: RGB;
  /** Optional dust patch: centre x, z, radius, optical depth (M64's "black eye"). */
  patch: [number, number, number, number];
};

export type DiskLayerSpec = {
  key: string;
  observed: ObservedDiskMap | null;
  /** sech² z0 of the old thin disk; exponential heights of young, ionised and dust layers. */
  heights: { old: number; young: number; ionised: number; dust: number };
  thick: { z0: number; fraction: number };
  flare: number;
  /** Half-height of the integration slab (disk radii). */
  slab: number;
  /** Half-size of the volume box (disk radii); 1.35 unless a ring reaches further. */
  box: number;
  bulge: { radius: number; flattening: number; amplitude: number; exponent: number; colour: RGB };
  halo: number;
  /** Diffuse face-on dust: central optical depth, scale length, outer radius. */
  dust: [number, number, number];
  /** Bipolar starburst wind: amplitude, tan(half-opening), base radius, height scale. */
  wind: [number, number, number, number];
  procedural: ProceduralDiskParameters;
  /** 1 when star points follow the disk maps' light; 0 for part-only systems. */
  starHost: number;
  /** Extent (± disk radii) of the procedural map. */
  proceduralExtent: number;
};

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const luma = (c: RGB) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
const normalise = (c: RGB): RGB => {
  const l = Math.max(1e-4, luma(c));
  return c.map((v) => v / l) as RGB;
};

/** Galaxies whose bespoke legacy volume features are kept (Cen A, M82, Magellanic Clouds, mergers…). */
const LEGACY_FEATURES = new Set([1, 4, 5, 7, 8, 9, 10, 11, 12, 15]);
const DISK_MORPHOLOGIES = new Set([
  "spiral",
  "grand-design",
  "flocculent",
  "barred",
  "lenticular",
  "edge-on",
  "ring",
  "starburst",
]);

/** Disk-layer parameters, or null when the galaxy keeps the cached 3D volume. */
export function diskLayerSpec(model: GalaxyModel): DiskLayerSpec | null {
  const observed = OBSERVED_DISK_MAPS[model.key] ?? null;
  const structure = galaxyStructure(model);
  if (!observed) {
    if (model.name === "Milky Way") return null;
    // M82 (feature 3) is an edge-on starburst disk; other irregulars keep the cached volume.
    if (
      structure.population ||
      structure.spheroid ||
      (structure.irregular && structure.feature !== 3)
    )
      return null;
    if (!DISK_MORPHOLOGIES.has(model.morphology)) return null;
    if (LEGACY_FEATURES.has(structure.feature)) return null;
  }
  const appearance = catalogueAppearance(model);
  let seed = 0;
  for (const c of model.name) seed = (seed * 31 + c.charCodeAt(0)) % 997;
  const lenticular = model.morphology === "lenticular" ? 1 : 0;
  const sombrero = structure.feature === 2;
  const blackEye = structure.feature === 13;
  const m94 = structure.feature === 14;
  const andromeda = model.key === "andromeda";
  const cigar = structure.feature === 3;
  const barred = model.barLength > 0 ? 1 : 0;
  const bulgeRatio = clamp(model.bulgeRadius / Math.max(1, model.diskRadius), 0.025, 0.6);
  const oldColour = normalise(observed?.colours.old ?? appearance.oldColor);
  const youngColour = normalise(observed?.colours.young ?? appearance.youngColor);
  const procedural: ProceduralDiskParameters = {
    arms: lenticular || sombrero ? 0 : Math.max(2, Math.min(6, model.arms || 2)),
    pitch: THREE.MathUtils.degToRad(clamp(model.pitchDeg || 16, 6, 40)),
    bar: barred ? clamp(model.barLength / model.diskRadius, 0.05, 0.6) : 0,
    barAngle: (seed % 31) * 0.21,
    ring: sombrero ? 0.66 : clamp(structure.ringRadius || 0, 0, 0.9),
    ringWidth: sombrero ? 0.075 : 0.05,
    seed: seed / 13,
    flocculent: model.morphology === "flocculent" ? 1 : 0,
    grand: model.morphology === "grand-design" || model.morphology === "barred" ? 1 : 0,
    lenticular: lenticular || sombrero ? 1 : 0,
    clumps: clamp(appearance.features[2] || 0.5, 0.2, 1),
    asymmetry: structure.asymmetry,
    lanes: model.dustLanes ? 1 : lenticular ? 0.15 : 0.35,
    oldScale: andromeda ? 0.2 : sombrero ? 0.3 : 0.27,
    youngScale: andromeda ? 0.32 : 0.34,
    oldAmp: sombrero ? 0.35 : lenticular ? 0.85 : 0.62,
    youngAmp: lenticular || sombrero ? 0 : 0.55,
    hiiAmp: lenticular || sombrero ? 0 : 0.85,
    dustAmp: sombrero ? 2.6 : andromeda ? 2 : model.dustLanes ? 1.5 : 0.4,
    outer: m94 ? 1.15 : 1.05,
    oldColour,
    youngColour,
    patch: blackEye ? [0.07, 0.035, 0.2, 2.2] : [0, 0, 0, 0],
  };
  if (cigar) {
    // M82: an edge-on, dusty, clumpy starburst disk with a short bar (ESA/Hubble heic0604a).
    Object.assign(procedural, {
      arms: 2,
      pitch: THREE.MathUtils.degToRad(20),
      bar: 0.18,
      flocculent: 1,
      grand: 0,
      lenticular: 0,
      clumps: 1,
      lanes: 1,
      oldScale: 0.2,
      youngScale: 0.16,
      oldAmp: 0.75,
      youngAmp: 0.95,
      hiiAmp: 1.5,
      dustAmp: 3.2,
      outer: 1,
    });
  }
  if (observed) {
    // Continue the observed disk outside the frame with its own measured profile and colours.
    // A zero profile means the photograph already covers the disk: no continuation.
    procedural.oldScale = clamp(observed.profile.old[1], 0.12, 0.6);
    procedural.youngScale = clamp(observed.profile.young[1], 0.12, 0.7);
    procedural.oldAmp = clamp(observed.profile.old[0], 0, 6);
    procedural.youngAmp = clamp(observed.profile.young[0] * 1.6, 0, 4);
    procedural.hiiAmp = procedural.youngAmp * 0.9;
    procedural.dustAmp = clamp(observed.profile.dust[0] * 0.6, 0, 6);
  }
  const heights = {
    old: cigar ? 0.06 : lenticular || sombrero ? 0.06 : 0.046,
    young: cigar ? 0.02 : 0.014,
    ionised: cigar ? 0.012 : 0.0075,
    dust: cigar ? 0.019 : sombrero ? 0.011 : 0.012,
  };
  const thick = { z0: 0.13, fraction: lenticular || sombrero ? 0.2 : 0.1 };
  const flare = 0.6;
  const bulge = {
    radius: sombrero ? 0.3 : andromeda ? 0.16 : cigar ? 0.07 : clamp(bulgeRatio, 0.04, 0.3),
    flattening: sombrero ? 0.82 : lenticular ? 0.62 : 0.72,
    amplitude: observed
      ? 0
      : sombrero
        ? 1.15
        : andromeda
          ? 1.6
          : cigar
            ? 0.9
            : lenticular
              ? 1.3
              : 1.05,
    exponent: sombrero ? 0.7 : 0.75,
    colour: normalise(appearance.oldColor),
  };
  const parts = observed?.parts?.items ?? [];
  const sky = observed?.mode === "sky";
  if (sky) {
    // Mergers and groups are carried by their photographed components alone.
    Object.assign(procedural, { oldAmp: 0, youngAmp: 0, hiiAmp: 0, dustAmp: 0 });
    bulge.amplitude = 0;
  }
  // H-alpha superwind of M82: biconical, about 30° half-opening, filaments to ~0.9 disk radii
  // (Shopbell & Bland-Hawthorn 1998; ESA/Hubble heic0604a). Filament positions are illustrative.
  const wind: [number, number, number, number] = cigar ? [3.2, 0.55, 0.07, 0.34] : [0, 0, 0, 1];
  const slab = Math.max(
    wind[0] > 0 ? 1.0 : 0,
    thick.z0 * (1 + flare) * 3.6,
    bulge.amplitude > 0 ? bulge.radius * bulge.flattening * 3.2 : 0,
    ...parts.map((p) => Math.abs(p.centre[1]) + p.radius),
    0.12,
  );
  const box = Math.min(
    2.6,
    Math.max(
      1.35,
      (observed?.extent ?? 0) + 0.05,
      ...parts.map((p) => Math.max(...p.centre.map(Math.abs)) + p.radius + p.depthExtent),
    ),
  );
  return {
    key: model.key,
    observed,
    box,
    heights,
    thick,
    flare,
    slab: sky ? box : Math.min(box, slab),
    bulge,
    halo: observed ? 0 : sombrero ? 0.02 : lenticular ? 0.04 : 0.025,
    starHost: sky ? 0 : 1,
    dust: [
      sky ? 0 : sombrero ? 0.15 : cigar ? 0.9 : model.dustLanes ? 0.7 : 0.2,
      cigar ? 0.3 : 0.36,
      1.12,
    ],
    wind,
    procedural,
    proceduralExtent: 1.3,
  };
}

/** Observed disks keep their registration with the photograph: no rigid pattern rotation. */
export function hasObservedDiskMap(model: Pick<GalaxyModel, "key">) {
  return Boolean(OBSERVED_DISK_MAPS[model.key]);
}

// -------------------------------------------------------------------------------------------
// GLSL shared by the ray marcher and the star points
// -------------------------------------------------------------------------------------------

export const DISK_LAYER_GLSL = /* glsl */ `
uniform sampler2D uDiskYoung,uDiskOld,uProcYoung,uProcOld,uDiskParts;
uniform float uDiskObserved;
uniform vec4 uDiskExtent;   // observed half-extent, procedural half-extent, observed texel, procedural texel
uniform vec4 uDiskHeights;  // old sech² z0, young h, ionised h, dust h
uniform vec4 uDiskShape;    // thick z0, thick fraction, flare, halo
uniform vec4 uDiskScale;    // observed young, old, tau max, procedural tau max
uniform vec3 uDiskDiffuse;  // diffuse dust: central tau, scale length, outer radius
uniform mat4 uDiskMat;      // local -> photograph [u w, v w, w]
uniform vec4 uDiskBulge;    // radius, flattening, amplitude, exponent
uniform vec3 uDiskBulgeColor;
uniform vec3 uEarth;
uniform float uPartCount,uPartScale,uDiskStarHost;
uniform float uPartTexel[${MAX_DISK_PARTS}],uPartKind[${MAX_DISK_PARTS}];
uniform vec4 uPartRect[${MAX_DISK_PARTS}],uPartAtlas[${MAX_DISK_PARTS}],uPartAxes[${MAX_DISK_PARTS}],uPartBound[${MAX_DISK_PARTS}];
uniform vec4 uPartDepth[${MAX_DISK_PARTS}]; // centre uv (xy), depth centre, depth extent
uniform vec4 uDiskWind;     // amplitude, tan(half opening), base radius, height scale
uniform sampler3D uNoise;
uniform float uSeed;
float diskSech2(float x){float c=cosh(min(abs(x),30.));return 1./(c*c);}
float diskFlare(float r){return 1.+uDiskShape.z*r*r;}
/** Feathered photograph frame of a disk-plane point (where the young-light map is valid). */
float diskPhotoFrame(vec2 xz){
 vec4 h=uDiskMat*vec4(xz.x,0.,xz.y,1.);
 if(h.z<=0.)return 0.;
 vec2 uv=h.xy/h.z,e=min(uv,1.-uv);
 return smoothstep(0.,.05,e.x)*smoothstep(0.,.05,e.y);
}
/** Face-on maps at a disk-plane point: young light, old light, face-on optical depth.
 * Inside a photograph's frame the observed maps carry the disk; outside it (and for
 * galaxies without one) the procedural map continues it with the measured profile. */
void diskMaps(vec2 xz,float lod,out vec3 young,out vec3 old,out float tau){
 young=vec3(0.);old=vec3(0.);tau=0.;
 float photo=0.;
 if(uDiskObserved>.5){
  vec2 uv=xz/(2.*uDiskExtent.x)+.5,em=min(uv,1.-uv);
  photo=smoothstep(0.,.035,em.x)*smoothstep(0.,.035,em.y);
  if(photo>0.)photo*=diskPhotoFrame(xz);
  if(photo>0.){
   float l=max(0.,lod-log2(uDiskExtent.z));
   // Young light (rgb) and sqrt-encoded dust (alpha) share one texture.
   vec4 yd=textureLod(uDiskYoung,uv,l);
   young=yd.rgb*uDiskScale.x*photo;
   old=textureLod(uDiskOld,uv,max(0.,l-2.)).rgb*uDiskScale.y*photo;
   tau=yd.a*yd.a*uDiskScale.z*photo;
  }
 }
 if(photo<.999){
  vec2 uv=xz/(2.*uDiskExtent.y)+.5;
  if(all(greaterThan(uv,vec2(0.)))&&all(lessThan(uv,vec2(1.)))){
   float l=max(0.,lod-log2(uDiskExtent.w)),w=1.-photo;
   vec4 y=textureLod(uProcYoung,uv,l);
   young+=y.rgb*w;
   old+=textureLod(uProcOld,uv,max(0.,l-2.)).rgb*w;
   tau+=y.a*y.a*uDiskScale.w*w;
  }
 }
}
float diskDiffuseTau(float r){return uDiskDiffuse.x*exp(-r/uDiskDiffuse.y)*(1.-smoothstep(uDiskDiffuse.z*.82,uDiskDiffuse.z,r));}
/** Emission (per unit length) and extinction of the disk layers at q. */
void diskLayer(vec3 q,float lod,out vec3 emission,out float kappa){
 emission=vec3(0.);kappa=0.;
 float r=length(q.xz),y=abs(q.y),f=diskFlare(r);
 float zt=uDiskShape.x*f;
 if(y>zt*3.6)return;
 vec3 young,old;float tau;
 diskMaps(q.xz,lod,young,old,tau);
 float zo=uDiskHeights.x*f;
 float oldProfile=mix(diskSech2(y/zo)/(2.*zo),diskSech2(y/zt)/(2.*zt),uDiskShape.y);
 // H-alpha light (magenta) sits in a thinner layer than blue young stars.
 float s=young.r+young.g+young.b;
 float magenta=clamp((young.r+young.b-2.*young.g)/max(1e-5,s)*2.5,0.,1.);
 float h=mix(uDiskHeights.y,uDiskHeights.z,magenta)*f;
 float hd=uDiskHeights.w*f;
 emission=old*oldProfile+young*exp(-y/h)/(2.*h);
 kappa=(tau+diskDiffuseTau(r))*exp(-y/hd)/(2.*hd);
}
/** Flattened, centrally concentrated bulge and faint halo (procedural galaxies). */
vec3 diskBulge(vec3 q){
 vec3 light=vec3(0.);
 float rq=length(q);
 if(uDiskBulge.z>0.&&rq<uDiskBulge.x*5.){
  float m=length(q*vec3(1.,1./uDiskBulge.y,1.))/uDiskBulge.x;
  // Normalised so uDiskBulge.z is the central surface brightness of the face-on column.
  light+=uDiskBulgeColor*uDiskBulge.z*exp(-3.*pow(m+.002,uDiskBulge.w))/(.55*uDiskBulge.x*uDiskBulge.y);
 }
 if(uDiskShape.w>0.){
  float hm=length(q*vec3(1.,1.6,1.));
  light+=uDiskBulgeColor*uDiskShape.w*exp(-hm/.26)*(1.-smoothstep(1.,1.3,hm));
 }
 return light;
}
/** Biconical starburst wind: edge-brightened cones of filamentary H-alpha emission. */
vec3 diskWind(vec3 q){
 if(uDiskWind.x<=0.)return vec3(0.);
 float y=abs(q.y);
 float cone=uDiskWind.z+y*uDiskWind.y;
 float rr=length(q.xz);
 float inside=(1.-smoothstep(cone*.55,cone*1.05,rr))*smoothstep(.012,.06,y);
 if(inside<=0.)return vec3(0.);
 // Filaments run along the outflow: noise stretched along the axis.
 vec3 n=vec3(q.x/(cone+.03)*1.5,y*1.1+(q.y<0.?.5:0.),q.z/(cone+.03)*1.5);
 float f1=texture(uNoise,n*.85+vec3(.13,uSeed*.017,.71)).r;
 float f2=texture(uNoise,n*2.2+vec3(.57,.21,uSeed*.023)).r;
 float filament=pow(smoothstep(.4,.88,.65*f1+.35*f2),1.5);
 float shell=.35+.65*smoothstep(.25,.95,rr/max(cone,1e-3));
 return vec3(1.,.26,.32)*uDiskWind.x*inside*filament*shell*exp(-y/uDiskWind.w);
}
/** Compact image parts (bulges, companions) extruded along Earth's sightline. */
vec3 diskParts(vec3 q,float lod){
 vec3 light=vec3(0.);
 for(int k=0;k<${MAX_DISK_PARTS};k++){
  if(float(k)>=uPartCount)break;
  vec4 b=uPartBound[k];
  if(length(q-b.xyz)>b.w)continue;
  vec4 h=uDiskMat*vec4(q,1.);
  if(h.z<=0.)continue;
  vec2 uv=h.xy/h.z,d=uv-uPartDepth[k].xy;
  vec4 ax=uPartAxes[k];
  float rho=length(vec2(dot(ax.xy,d),dot(ax.zw,d)));
  if(rho>1.)continue;
  // Compact (biweight) depth profile: a rounded spheroid with no faint tails along the
  // sightline. Its integral along the sightline is 1, so Earth's view equals the image.
  float dn=(dot(q,uEarth)-uPartDepth[k].z)/uPartDepth[k].w;
  float profile;
  if(uPartKind[k]>.5){
   // Spherical deprojection: for an emissivity j(r) proportional to (r^2+c^2)^-1.5 the light at
   // projected radius rho comes from depths d with weight s^2/(2(s^2+d^2)^1.5), s^2=rho^2+c^2.
   // Weighting the image by it keeps Earth's view exact and gives a round, centrally
   // concentrated spheroid from the side. Truncated at the outline and renormalised
   // (the column inside |dn|<sqrt(1-rho^2) is sqrt(1-rho^2)/sqrt(1+c^2)).
   if(rho*rho+dn*dn>=1.)continue;
   float s2=rho*rho+.0036;
   profile=s2/(2.*pow(s2+dn*dn,1.5))*1.0018/sqrt(max(1.-rho*rho,.02))/uPartDepth[k].w;
  }else{
   // Flattened slab (disturbed disk, tidal tail, gas): biweight depth profile, thinning
   // toward the outline. Its column is 1, so Earth's view equals the image.
   float e=1.6*sqrt(max(.03,1.-rho*rho));
   float z=dn/e;
   if(abs(z)>=1.)continue;
   float w=1.-z*z;
   profile=.9375*w*w/(e*uPartDepth[k].w);
  }
  vec4 rect=uPartRect[k],atlas=uPartAtlas[k];
  vec2 c=(uv-rect.xy)/(rect.zw-rect.xy);
  if(any(lessThan(c,vec2(0.)))||any(greaterThan(c,vec2(1.))))continue;
  float l=max(0.,lod-log2(uPartTexel[k]));
  light+=textureLod(uDiskParts,atlas.xy+c*(atlas.zw-atlas.xy),l).rgb*profile;
 }
 return light*uPartScale;
}
`;

// -------------------------------------------------------------------------------------------
// Procedural face-on maps (baked once per selected galaxy)
// -------------------------------------------------------------------------------------------

const PROCEDURAL_FRAGMENT = /* glsl */ `
precision highp float;
uniform float uPass,uExtent,uTauMax;
uniform vec2 uSize;
uniform float uArms,uPitch,uBar,uBarAngle,uRing,uRingWidth,uSeed,uFlocculent,uGrand,uLenticular,uClumps,uAsymmetry,uLanes;
uniform vec4 uScales;   // old scale, young scale, outer radius, unused
uniform vec4 uAmps;     // old, young, H II, dust
uniform vec3 uOldColor,uYoungColor;
uniform vec4 uPatch;
layout(location=0)out vec4 outColor;
float hash12(vec2 p){vec3 p3=fract(vec3(p.xyx)*.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}
vec2 hash22(vec2 p){vec3 p3=fract(vec3(p.xyx)*vec3(.1031,.1030,.0973));p3+=dot(p3,p3.yzx+33.33);return fract((p3.xx+p3.yz)*p3.zy);}
float vnoise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
 return mix(mix(hash12(i),hash12(i+vec2(1,0)),u.x),mix(hash12(i+vec2(0,1)),hash12(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<6;i++){s+=a*vnoise(p);p=mat2(1.6,1.2,-1.2,1.6)*p+17.17;a*=.5;}return s/.984;}
// F1 distance and cell identity of a jittered grid.
vec2 worley(vec2 p){vec2 i=floor(p),f=fract(p);float d1=9.,id=0.;
 for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){vec2 g=vec2(x,y),o=hash22(i+g);vec2 r=g+o-f;float d=dot(r,r);
  if(d<d1){d1=d;id=hash12(i+g+uSeed*7.13);}}
 return vec2(sqrt(d1),id);}
const float TAU=6.2831853;
void main(){
 vec2 p=(gl_FragCoord.xy/uSize-.5)*2.*uExtent;
 float r=length(p),th=atan(p.y,p.x);
 float outer=uScales.z;
 float edge=1.-smoothstep(outer*.8,outer*1.12,r);
 // Large-scale lopsidedness and arm irregularity.
 vec2 warpP=p*1.6+uSeed*3.1;
 float warp=(fbm(warpP)-.5)*(.7+uAsymmetry*4.);
 float m=max(1.,uArms);
 float launch=max(.05,uBar*.95);
 float tanP=tan(uPitch);
 float lr=log(max(r,launch*.55)/launch);
 float phi=th-uBarAngle-lr/tanP+warp*(.55+.45*smoothstep(.2,.9,r));
 float wave=.5+.5*cos(m*phi);
 float armIdx=mod(floor(m*phi/TAU+.5),m);
 float armGain=.72+.56*hash12(vec2(armIdx,uSeed));
 // Arms break into segments along their length (lr runs along a logarithmic spiral).
 float along=vnoise(vec2(lr*mix(2.6,5.5,uFlocculent),armIdx*7.31+uSeed));
 float segment=mix(.55+.45*along,smoothstep(.3,.7,along),uFlocculent);
 float sharp=mix(2.2,6.5,uGrand)*mix(1.,.5,uFlocculent);
 float region=smoothstep(launch*.75,launch*1.5,r)*edge;
 float arm=pow(wave,sharp)*region*segment*armGain*(1.-uLenticular);
 // Real arms are ragged: their light breaks into sheared clumps along and across them.
 float rag=fbm(p*21.+vec2(warp*2.3,uSeed*4.1));
 arm*=.35+1.05*smoothstep(.28,.78,rag);
 // Flocculent disks: many short, sheared fragments.
 float flocks=smoothstep(.52,.78,fbm(vec2(p.x*cos(.6)-p.y*sin(.6),p.x*sin(.6)+p.y*cos(.6))*9.+uSeed))*uFlocculent*region;
 arm=max(arm,flocks*.85*(1.-uLenticular));
 // Dust lanes trace the inner (upstream) edge of the arms, with spurs crossing the interarm.
 float lane=pow(.5+.5*cos(m*phi-.55),sharp*3.2+4.)*region*mix(.7+.3*along,segment,.5)*armGain*(1.-uLenticular);
 lane*=.55+.9*smoothstep(.3,.7,fbm(p*16.+uSeed*2.9));
 float rel=fract(m*phi/TAU);
 float spurPhase=th-lr/tan(1.05)+warp*.4;
 float spurs=pow(.5+.5*cos(floor(m*5.+1.)*spurPhase+fbm(p*7.+uSeed)*3.),14.)*smoothstep(.58,.82,rel)*(1.-smoothstep(.9,.99,rel))*region*(1.-uLenticular);
 float patchy=smoothstep(.55,.8,fbm(p*14.+uSeed*1.7))*region*(1.-uLenticular);
 // Bar (Ferrers-like) with offset dust lanes along its leading edges, and the inner ring at its ends.
 float ca=cos(uBarAngle),sa=sin(uBarAngle);
 vec2 b=vec2(ca*p.x+sa*p.y,-sa*p.x+ca*p.y);
 float bar=0.,barLane=0.;
 if(uBar>0.){
  float q=1.-pow(b.x/uBar,2.)-pow(b.y/(uBar*.24),2.);
  bar=pow(max(q,0.),1.6);
  float offset=uBar*.13*tanh(b.x/(uBar*.28));
  barLane=exp(-pow((b.y-offset)/(uBar*.035),2.))*smoothstep(uBar*.12,uBar*.3,abs(b.x))*(1.-smoothstep(uBar*.82,uBar*1.05,abs(b.x)));
 }
 float ring=uRing>0.?exp(-pow((r-uRing)/uRingWidth,2.)):0.;
 if(uBar>0.)ring=max(ring,.7*exp(-pow((r-uBar*1.02)/(uBar*.12),2.))*(1.-uLenticular));
 // Star-forming knots: H II regions and young clusters on the arms and ring.
 float host=max(arm,ring*(1.-uLenticular*.8));
 vec2 cellA=worley(p*58.+uSeed);
 float hiiOn=step(cellA.y,(.22+.75*uClumps)*smoothstep(.15,.8,host));
 float hiiSize=.18+.32*fract(cellA.y*13.7);
 float hii=hiiOn*exp(-pow(cellA.x/hiiSize,2.))*(.25+pow(fract(cellA.y*91.3),3.)*2.2);
 vec2 cellB=worley(p*150.+uSeed*2.3);
 float cluster=step(cellB.y,.55*smoothstep(.1,.7,host))*exp(-pow(cellB.x/.2,2.))*(.3+fract(cellB.y*57.1));
 float grain=fbm(p*38.+uSeed*5.);
 if(uPass<.5){
  float youngDisk=uAmps.y*exp(-r/uScales.y)*region;
  float knots=smoothstep(.4,.85,grain);
  vec3 young=uYoungColor*youngDisk*(arm*(.3+1.15*knots)+ring*(.35+.7*knots)+.04*region);
  young+=uYoungColor*uAmps.y*exp(-r/uScales.y)*cluster*.9*region;
  young+=vec3(1.,.3,.52)*uAmps.z*exp(-r/uScales.y)*hii*region;
  float dust=uAmps.w*exp(-r/(uScales.x*1.35))*edge*(uLanes*(lane*1.15+spurs*.55+barLane*1.4)+patchy*.25*(.4+.6*uLanes)+ring*.35*uLanes);
  if(uPatch.w>0.)dust+=uPatch.w*exp(-pow(length(p-uPatch.xy)/uPatch.z,2.))*(.6+.6*fbm(p*20.));
  if(uRing>0.&&uLenticular>.5)dust+=uAmps.w*exp(-pow((r-uRing)/(uRingWidth*.65),2.))*(.75+.5*fbm(p*18.));
  outColor=vec4(max(young,vec3(0.)),sqrt(clamp(dust/uTauMax,0.,1.)));
 }else{
  float disk=uAmps.x*exp(-r/uScales.x)*edge;
  float lens=uLenticular*.35*uAmps.x*exp(-pow(r/(uScales.x*.9),2.));
  vec3 old=uOldColor*(disk*(1.+.35*arm-.25*lane*uLanes)+lens+uAmps.x*bar*.9+uAmps.x*ring*.12*uLenticular);
  outColor=vec4(max(old,vec3(0.)),1.);
 }
}`;

/** Owns the selected galaxy's face-on maps: observed textures and/or procedural bakes. */
export class GalaxyDiskMaps {
  readonly procYoung: THREE.WebGLRenderTarget;
  readonly procOld: THREE.WebGLRenderTarget;
  /** Observed young light (rgb) and dust (alpha), packed on the GPU after loading. */
  observedPacked: THREE.WebGLRenderTarget | null = null;
  observedOld: THREE.Texture | null = null;
  parts: THREE.Texture | null = null;
  private pending: { young: THREE.Texture; dust: THREE.Texture } | null = null;
  private baked = false;
  private observedState: "none" | "loading" | "ready" | "failed";
  private readonly material: THREE.ShaderMaterial;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.Camera();
  private readonly geometry = new THREE.PlaneGeometry(2, 2);
  private readonly controller = new AbortController();
  private bitmaps: ImageBitmap[] = [];
  constructor(
    readonly spec: DiskLayerSpec,
    readonly size: number,
  ) {
    const target = (s: number) =>
      new THREE.WebGLRenderTarget(s, s, {
        type: THREE.UnsignedByteType,
        format: THREE.RGBAFormat,
        colorSpace: THREE.SRGBColorSpace,
        minFilter: THREE.LinearMipmapLinearFilter,
        magFilter: THREE.LinearFilter,
        generateMipmaps: true,
        depthBuffer: false,
        stencilBuffer: false,
      });
    this.procYoung = target(size);
    this.procOld = target(Math.max(128, size / 4));
    this.procYoung.texture.name = "Galaxy procedural young-light and dust map";
    this.procOld.texture.name = "Galaxy procedural old-light map";
    const p = spec.procedural;
    this.material = new THREE.ShaderMaterial({
      glslVersion: THREE.GLSL3,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
      vertexShader: "void main(){gl_Position=vec4(position.xy,0.,1.);}",
      fragmentShader: PROCEDURAL_FRAGMENT,
      uniforms: {
        uPass: { value: 0 },
        uExtent: { value: spec.proceduralExtent },
        uTauMax: { value: PROCEDURAL_TAU_MAX },
        uSize: { value: new THREE.Vector2(size, size) },
        uArms: { value: p.arms },
        uPitch: { value: p.pitch },
        uBar: { value: p.bar },
        uBarAngle: { value: p.barAngle },
        uRing: { value: p.ring },
        uRingWidth: { value: p.ringWidth },
        uSeed: { value: p.seed },
        uFlocculent: { value: p.flocculent },
        uGrand: { value: p.grand },
        uLenticular: { value: p.lenticular },
        uClumps: { value: p.clumps },
        uAsymmetry: { value: p.asymmetry },
        uLanes: { value: p.lanes },
        uScales: { value: new THREE.Vector4(p.oldScale, p.youngScale, p.outer, 0) },
        uAmps: { value: new THREE.Vector4(p.oldAmp, p.youngAmp, p.hiiAmp, p.dustAmp) },
        uOldColor: { value: new THREE.Vector3(...p.oldColour) },
        uYoungColor: { value: new THREE.Vector3(...p.youngColour) },
        uPatch: { value: new THREE.Vector4(...p.patch) },
      },
    });
    this.scene.add(new THREE.Mesh(this.geometry, this.material));
    this.observedState = spec.observed ? "loading" : "none";
    if (spec.observed) void this.loadObserved(spec.observed);
  }
  get ready() {
    return this.baked && this.observedState !== "loading";
  }
  /** Packs the observed young and dust maps into one mipmapped sRGB texture. */
  private pack(gl: THREE.WebGLRenderer) {
    const pending = this.pending;
    if (!pending) return;
    const size = (pending.young.image as ImageBitmap).width;
    const target = new THREE.WebGLRenderTarget(size, size, {
      type: THREE.UnsignedByteType,
      format: THREE.RGBAFormat,
      colorSpace: THREE.SRGBColorSpace,
      minFilter: THREE.LinearMipmapLinearFilter,
      magFilter: THREE.LinearFilter,
      generateMipmaps: true,
      depthBuffer: false,
      stencilBuffer: false,
    });
    target.texture.name = "Galaxy observed young-light and dust map";
    const material = new THREE.ShaderMaterial({
      glslVersion: THREE.GLSL3,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
      uniforms: {
        uYoung: { value: pending.young },
        uDust: { value: pending.dust },
        uSize: { value: size },
      },
      vertexShader: "void main(){gl_Position=vec4(position.xy,0.,1.);}",
      fragmentShader:
        "precision highp float;uniform sampler2D uYoung,uDust;uniform float uSize;layout(location=0)out vec4 outColor;" +
        "void main(){vec2 uv=gl_FragCoord.xy/uSize;outColor=vec4(texture(uYoung,uv).rgb,texture(uDust,uv).r);}",
    });
    const mesh = new THREE.Mesh(this.geometry, material);
    const scene = new THREE.Scene().add(mesh);
    const previous = gl.getRenderTarget(),
      face = gl.getActiveCubeFace(),
      mip = gl.getActiveMipmapLevel();
    try {
      gl.setRenderTarget(target);
      gl.render(scene, this.camera);
    } finally {
      gl.setRenderTarget(previous, face, mip);
      material.dispose();
    }
    pending.young.dispose();
    pending.dust.dispose();
    this.pending = null;
    this.observedPacked = target;
    this.observedState = "ready";
  }
  get observedReady() {
    return this.observedState === "ready";
  }
  get observedMaps() {
    return this.observedState === "ready" && this.observedPacked !== null;
  }
  /** One-time bake of the procedural maps (two full-screen draws). */
  bake(gl: THREE.WebGLRenderer) {
    if (this.pending) this.pack(gl);
    if (this.baked) return;
    const previous = gl.getRenderTarget(),
      face = gl.getActiveCubeFace(),
      mip = gl.getActiveMipmapLevel();
    try {
      for (const [pass, target] of [
        [0, this.procYoung],
        [1, this.procOld],
      ] as const) {
        this.material.uniforms.uPass.value = pass;
        this.material.uniforms.uSize.value.set(target.width, target.height);
        gl.setRenderTarget(target);
        gl.render(this.scene, this.camera);
      }
    } finally {
      gl.setRenderTarget(previous, face, mip);
    }
    this.baked = true;
  }
  private async loadObserved(map: ObservedDiskMap) {
    const load = async (url: string, colour: boolean, resize?: number) => {
      const response = await fetch(url, { signal: this.controller.signal });
      if (!response.ok) throw Error("Galaxy disk map " + response.status + " " + url);
      const blob = await response.blob();
      const bitmap = await createImageBitmap(blob, {
        imageOrientation: "flipY",
        premultiplyAlpha: "none",
        colorSpaceConversion: "none",
        ...(resize
          ? { resizeWidth: resize, resizeHeight: resize, resizeQuality: "high" as const }
          : {}),
      });
      this.bitmaps.push(bitmap);
      const texture = new THREE.Texture(bitmap);
      texture.colorSpace = colour ? THREE.SRGBColorSpace : THREE.NoColorSpace;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = true;
      texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.needsUpdate = true;
      return texture;
    };
    if (!map.detail || !map.smooth || !map.dust) {
      try {
        const parts = map.parts ? await load(map.parts.url, true) : null;
        if (this.controller.signal.aborted) return parts?.dispose();
        this.parts = parts;
        this.observedState = "ready";
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        console.warn("Observed galaxy parts unavailable", map.key, error);
        this.observedState = "failed";
      }
      return;
    }
    const resize = this.size < map.detail.size ? this.size : undefined;
    try {
      const [young, old, dust, parts] = await Promise.all([
        load(map.detail.url, true, resize),
        load(map.smooth.url, true),
        load(map.dust.url, false, resize),
        map.parts ? load(map.parts.url, true) : Promise.resolve(null),
      ]);
      if (this.controller.signal.aborted) {
        for (const t of [young, old, dust, parts]) t?.dispose();
        return;
      }
      this.observedOld = old;
      this.parts = parts;
      // Packed (and marked ready) on the next frame, where the renderer is available.
      this.pending = { young, dust };
    } catch (error) {
      if ((error as Error).name === "AbortError") return;
      console.warn(
        "Observed galaxy disk maps unavailable; using the procedural disk",
        map.key,
        error,
      );
      this.observedState = "failed";
    }
  }
  dispose() {
    this.controller.abort();
    this.procYoung.dispose();
    this.procOld.dispose();
    this.material.dispose();
    this.geometry.dispose();
    for (const t of [this.observedOld, this.parts, this.pending?.young, this.pending?.dust])
      t?.dispose();
    this.observedPacked?.dispose();
    for (const b of this.bitmaps) b.close();
    this.bitmaps = [];
  }
}

/** Encoded procedural dust: alpha = sqrt(tau / PROCEDURAL_TAU_MAX). */
export const PROCEDURAL_TAU_MAX = 4;

/** Uniforms read by DISK_LAYER_GLSL. */
export function diskLayerUniforms(model: GalaxyModel, spec: DiskLayerSpec) {
  const o = spec.observed;
  const image = o ? OBSERVED_IMAGE_BY_KEY.get(model.key) : undefined;
  const parts = o?.parts?.items ?? [];
  const blank = Array.from({ length: MAX_DISK_PARTS }, () => new THREE.Vector4());
  const partTexel = Array.from({ length: MAX_DISK_PARTS }, (_, i) => parts[i]?.texel ?? 1);
  const partKind = Array.from({ length: MAX_DISK_PARTS }, (_, i) =>
    parts[i]?.kind === "sheet" ? 0 : 1,
  );
  return {
    uDiskYoung: { value: null as THREE.Texture | null },
    uDiskOld: { value: null as THREE.Texture | null },
    uProcYoung: { value: null as THREE.Texture | null },
    uProcOld: { value: null as THREE.Texture | null },
    uDiskParts: { value: null as THREE.Texture | null },
    uDiskObserved: { value: 0 },
    uDiskExtent: {
      value: new THREE.Vector4(
        o?.extent ?? 1,
        spec.proceduralExtent,
        o?.detail ? (2 * o.extent) / o.detail.size : 1,
        (2 * spec.proceduralExtent) / 2048,
      ),
    },
    uDiskHeights: {
      value: new THREE.Vector4(
        spec.heights.old,
        spec.heights.young,
        spec.heights.ionised,
        spec.heights.dust,
      ),
    },
    uDiskShape: {
      value: new THREE.Vector4(spec.thick.z0, spec.thick.fraction, spec.flare, spec.halo),
    },
    uDiskScale: {
      value: new THREE.Vector4(
        o?.detail?.scale ?? 0,
        o?.smooth?.scale ?? 0,
        o?.dust?.tauMax ?? 0,
        PROCEDURAL_TAU_MAX,
      ),
    },
    uDiskDiffuse: { value: new THREE.Vector3(...spec.dust) },
    uDiskWind: { value: new THREE.Vector4(...spec.wind) },
    uDiskMat: { value: image ? observedImageMatrix(model, image) : new THREE.Matrix4() },
    uDiskBulge: {
      value: new THREE.Vector4(
        spec.bulge.radius,
        spec.bulge.flattening,
        spec.bulge.amplitude,
        spec.bulge.exponent,
      ),
    },
    uDiskBulgeColor: { value: new THREE.Vector3(...spec.bulge.colour) },
    uEarth: { value: earthDirectionLocal(model) },
    uPartCount: { value: 0 },
    uPartScale: { value: o?.parts?.scale ?? 0 },
    uPartTexel: { value: partTexel },
    uPartKind: { value: partKind },
    uDiskStarHost: { value: spec.starHost },
    uPartRect: {
      value: parts.length
        ? parts
            .map((p) => new THREE.Vector4(...p.uvRect))
            .concat(blank)
            .slice(0, MAX_DISK_PARTS)
        : blank,
    },
    uPartAtlas: {
      value: parts.length
        ? parts
            .map((p) => new THREE.Vector4(...p.atlasRect))
            .concat(blank)
            .slice(0, MAX_DISK_PARTS)
        : blank,
    },
    uPartAxes: {
      value: parts.length
        ? parts
            .map((p) => new THREE.Vector4(p.axisA[0], p.axisA[1], p.axisB[0], p.axisB[1]))
            .concat(blank)
            .slice(0, MAX_DISK_PARTS)
        : blank,
    },
    uPartBound: {
      value: parts.length
        ? parts
            .map(
              (p) =>
                new THREE.Vector4(p.centre[0], p.centre[1], p.centre[2], p.radius + p.depthExtent),
            )
            .concat(blank)
            .slice(0, MAX_DISK_PARTS)
        : blank,
    },
    uPartDepth: {
      value: parts.length
        ? parts
            .map(
              (p) => new THREE.Vector4(p.centreUv[0], p.centreUv[1], p.depthCentre, p.depthExtent),
            )
            .concat(blank)
            .slice(0, MAX_DISK_PARTS)
        : blank,
    },
  };
}
export type DiskLayerUniforms = ReturnType<typeof diskLayerUniforms>;

/** Binds the current textures of a map owner into disk-layer uniforms. */
export function bindDiskMaps(uniforms: DiskLayerUniforms, maps: GalaxyDiskMaps) {
  uniforms.uProcYoung.value = maps.procYoung.texture;
  uniforms.uProcOld.value = maps.procOld.texture;
  const observed = maps.observedMaps;
  uniforms.uDiskObserved.value = observed ? 1 : 0;
  uniforms.uDiskYoung.value = observed ? maps.observedPacked!.texture : maps.procYoung.texture;
  uniforms.uDiskOld.value = observed ? maps.observedOld : maps.procOld.texture;
  uniforms.uDiskParts.value = maps.parts ?? maps.procOld.texture;
  uniforms.uPartCount.value =
    maps.observedReady && maps.parts
      ? Math.min(MAX_DISK_PARTS, maps.spec.observed?.parts?.items.length ?? 0)
      : 0;
  uniforms.uDiskExtent.value.w = (2 * maps.spec.proceduralExtent) / maps.size;
  const observedSize = maps.observedPacked?.width;
  if (observed && observedSize && maps.spec.observed)
    uniforms.uDiskExtent.value.z = (2 * maps.spec.observed.extent) / observedSize;
}
