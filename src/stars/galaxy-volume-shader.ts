import { GALAXY_MEDIUM } from "./galaxy-medium";
import { OBSERVED_DISPLAY_GLSL } from "./galaxy-observed-projection";
import { DISK_LAYER_GLSL } from "./galaxy-disk-layer";
/** Rays integrate the same 3D field for the catalogue, approach, and interior. */
export const GALAXY_FRAGMENT =
  /* glsl */ `
#include <logdepthbuf_pars_fragment>
precision highp sampler3D;
uniform vec3 uEye,uFieldSize,uOccupancySize;uniform sampler3D uField,uOccupancy;
uniform float uOccupancyReady;
uniform float uAdaptiveSampling,uSkipEmpty;
uniform float uOpacity,uReveal,uSteps,uCacheFade,uVolumeWeight;
uniform float uExteriorView;
varying vec3 vP;
` +
  GALAXY_MEDIUM +
  /* glsl */ `
void main(){
#include <logdepthbuf_fragment>
 if(uCacheFade<.001||uOpacity<.001)discard;
 vec3 rd=normalize(vP-uEye),inv=1./(rd+vec3(1.e-8));
 vec3 a=(-vec3(1.35)-uEye)*inv,b=(vec3(1.35)-uEye)*inv;
 vec3 lo=min(a,b),hi=max(a,b);
 // Tighten the integration slab for thin disks while retaining the full bulge.
 // This keeps rays from stepping over an entire dust disk in edge/reverse views.
 if(uMode>.5&&uMode<3.5&&uFeature<.5||uMode>4.5&&uMode<5.5||uMode>8.5){
  float h=max(uThickness*7.,uBulge*1.6);h=max(h,.09);
  float y0=(-h-uEye.y)*inv.y,y1=(h-uEye.y)*inv.y;lo.y=max(lo.y,min(y0,y1));hi.y=min(hi.y,max(y0,y1));
 }
 // Resolve the thin new ring/disk fields within their luminous vertical support.
 if(uFeature>9.5&&uFeature<11.5||uFeature>14.5&&uFeature<15.5){
  float h=uFeature<10.5?.45:uFeature<11.5?.7:.32;
  float y0=(-h-uEye.y)*inv.y,y1=(h-uEye.y)*inv.y;lo.y=max(lo.y,min(y0,y1));hi.y=min(hi.y,max(y0,y1));
 }
 float start=max(0.,max(lo.x,max(lo.y,lo.z))),finish=min(hi.x,min(hi.y,hi.z));if(finish<=start)discard;
 float steps=uSteps;
#ifndef GALAXY_PREVIEW
 // Three samples per cached voxel retain its resolved structure. Short sky rays
 // need fewer samples than long rays through the disk; their old 80+ samples
 // repeatedly fetched the same trilinearly interpolated cells.
 float crossedVoxels=(finish-start)*max(abs(rd.x)*uFieldSize.x,max(abs(rd.y)*uFieldSize.y,abs(rd.z)*uFieldSize.z))/2.7;
 if(uAdaptiveSampling>.5)steps=min(uSteps,max(20.,ceil(crossedVoxels*3.)));
#endif
 float ds=(finish-start)/steps,trans=1.;vec3 light=vec3(0.);
 float jitter=fract(sin(dot(floor(gl_FragCoord.xy),vec2(12.9898,78.233)))*43758.5453);
 // A registered telescope image replaces reconstructed light only inside its frame.
 for(int i=0;i<112;i++){
  if(float(i)>=steps||trans<.012)break;
  float t=start+(float(i)+.5+(jitter-.5)*.35)*ds;
  vec3 p=uEye+rd*t;
  float r=length(p.xz),angle=uTime*uRotationRate;
  float c=cos(angle),s=sin(angle);vec3 q=vec3(p.x*c-p.z*s,p.y,p.x*s+p.z*c);
  vec4 field;
#ifdef GALAXY_PREVIEW
  float d;vec3 e=populations(q,d);field=vec4(e,d);
#else
  if(uFeature>9.5&&uFeature<11.5&&uSkipEmpty>.5&&uOccupancyReady>.5){
   vec3 grid=(q/2.7+.5)*uOccupancySize;ivec3 cell=ivec3(clamp(floor(grid),vec3(0.),uOccupancySize-1.));
   float bound=texelFetch(uOccupancy,cell,0).r;
   if(bound<1.e-7){
    vec3 direction=vec3(rd.x*c-rd.z*s,rd.y,rd.x*s+rd.z*c);
    vec3 face=(vec3(cell)+step(vec3(0.),direction))/uOccupancySize;
    vec3 travel=((face-.5)*2.7-q)/(direction+vec3(1.e-12));
    float safeDistance=max(0.,min(travel.x,min(travel.y,travel.z)));
    i+=max(0,int(floor(safeDistance/ds))-1);continue;
   }
  }
  field=texture(uField,q/2.7+.5);
  // Half-float empty cells need neither a detail fetch nor extinction integration.
  if(uSkipEmpty>.5&&max(max(field.r,field.g),field.b)+field.a<1.e-6)continue;
  // Detail remains anchored in 3D rather than to screen pixels or a photo UV.
  float detail=noise(q*210.);field.a*=mix(.65,1.5,detail);field.rgb*=mix(.78,1.22,detail);
#endif
  float localClear=smoothstep(.012,mix(.045,.13,uReveal),length(p-uEye));
  float dust=field.a*localClear;
  vec3 emission=field.rgb*localClear*mix(1.,.09,uReveal);
  float extinction=dust+dot(emission,vec3(.2126,.7152,.0722))*.11;
  float alpha=1.-exp(-extinction*ds*6.);
  vec3 reddening=exp(-dust*ds*vec3(.65,1.,1.6));
  light+=trans*emission/max(extinction,.025)*alpha*reddening;
  trans*=1.-alpha;
 }
 float alpha=clamp(1.-trans,0.,.98)*uOpacity*uCacheFade;
 if(alpha<.001)discard;
 light=light/(1.+dot(light,vec3(.2126,.7152,.0722))*.075);
 vec3 radiance=light/max(1.-trans,.001);
 // Integrated exterior light can exceed display white in all three channels.
 // Compress its peak together, preserving stellar colour ratios and dust
 // contrast before renderer tone mapping. Interior travel keeps its exposure.
 float peak=max(radiance.r,max(radiance.g,radiance.b));
 radiance=mix(radiance,radiance*(1.15/(1.+peak)),uExteriorView);
 gl_FragColor=vec4(radiance,alpha);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}
`;

/**
 * Disk galaxies: face-on maps × analytic vertical profiles (galaxy-disk-layer.ts), a
 * flattened bulge and sightline-extruded image parts, integrated front to back with
 * per-channel dust extinction. Starlight is pure emission; only dust absorbs.
 */
export const GALAXY_DISK_FRAGMENT =
  /* glsl */ `
#include <logdepthbuf_pars_fragment>
precision highp sampler3D;
uniform vec3 uEye;
uniform float uOpacity,uReveal,uSteps,uCacheFade,uExteriorView,uTime,uRotationRate,uPixelAngle,uSlab,uBox;
uniform vec3 uDiskInterior; // interior gain, light kept when the interior is revealed, sky contrast (0 or 1)
uniform float uDiskReach;   // radius with no light or dust beyond it (0: the whole box)
varying vec3 vP;
` +
  OBSERVED_DISPLAY_GLSL +
  DISK_LAYER_GLSL +
  /* glsl */ `
const vec3 REDDEN=vec3(.74,1.,1.32);
const vec3 LUMA=vec3(.2126,.7152,.0722);
/** Display-referred columns (photograph units). Face-on columns keep the photograph's values;
 * edge-on columns, many times brighter, roll off logarithmically toward white so the disk keeps
 * gradations instead of clipping. */
/** Share of the light at distance t that stays unresolved glow once inside: nearby light is
 * drawn as resolved stars (GalaxyInteriorField), distant light blends into the band. The Milky
 * Way (no sky-contrast flag) draws its sky from catalogues and keeps all its glow. */
float unresolved(float t){return mix(1.,mix(.2,1.,smoothstep(.0,.45,t)),uDiskInterior.z);}
vec3 starHash3(vec3 p){p=fract(p*vec3(.1031,.103,.0973));p+=dot(p,p.yxz+33.33);return fract((p.xxy+p.yxx)*p.zyx);}
/** Share of the band's light drawn as point stars: none in the faint sky (its stars are the
 * resolved nearby ones), most in the bright band. */
float bandShare(vec3 light){return smoothstep(.008,.08,dot(light,LUMA));}
/** The band's light resolved into point stars. Each sky cell (a cube map of directions fixed in
 * the galaxy, about 1.6 pixels wide) holds at most one star, present with a probability that
 * rises with the band's light; a star carries its share of the cell's light times a heavy-tailed
 * brightness draw. The band keeps its mean light, star clouds and dark lanes, and its fine
 * texture becomes millions of stars instead of fog. Distant stars show no parallax, so a
 * direction grid holds. Returns the stars' light for a resolved share of 1. */
vec3 bandStars(vec3 dir,vec3 light){
 float L=dot(light,LUMA);
 float p=.32*bandShare(light);
 if(p<.001)return vec3(0.);
 vec3 a=abs(dir);float face;vec2 uv;
 if(a.x>=a.y&&a.x>=a.z){face=dir.x>0.?0.:1.;uv=dir.zy/a.x;}
 else if(a.y>=a.z){face=dir.y>0.?2.:3.;uv=dir.xz/a.y;}
 else{face=dir.z>0.?4.:5.;uv=dir.xy/a.z;}
 // Cells per face edge, a power of two so small view changes keep the same stars.
 float n=exp2(floor(log2(1.25/uPixelAngle)+.5));
 float k=pow(1.+dot(uv,uv),-.75); // a cell's linear size on the sky shrinks toward face corners
 float cellPx=2./(n*uPixelAngle)*k,sigma=.5;
 vec2 g=(uv*.5+.5)*n,cell=floor(g);
 vec3 sum=vec3(0.);
 for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){
  vec2 c=cell+vec2(i,j);
  vec3 h=starHash3(vec3(c,face*131.7+.5));
  if(h.z>=p)continue;
  vec3 h2=starHash3(vec3(c+.37,face*57.1+9.));
  vec2 d=(c+.2+.6*h.xy-g)*cellPx;
  // (-ln u)^2.5 / Gamma(3.5): mean 1, most stars faint, about 1 in 100 over ten times brighter.
  float r=pow(-log(max(h2.x,1e-4)),2.5)/3.32;
  // Star colours: mostly the band's own, some hotter and some redder.
  vec3 tint=h2.y<.12?vec3(.75,.85,1.15):h2.y>.8?vec3(1.12,.92,.75):vec3(1.);
  sum+=tint*r*exp(-dot(d,d)/(2.*sigma*sigma));
 }
 // Flux per star = cell light / presence; its Gaussian peak = flux / (2 pi sigma^2).
 // Integrated starlight looks whiter than the band's tinted glow.
 return mix(vec3(L),light,.5)*sum*cellPx*cellPx*.32/(p*6.2832*sigma*sigma);
}
vec3 rollOff(vec3 light,out float peak){
 peak=max(light.r,max(light.g,light.b));
 float shaped=peak<=.55?peak:peak<=1.?.55+.27*(peak-.55)/.45:.82+.16*log(peak)/log(25.);
 return light*(min(shaped,.985)/max(peak,1.e-6));
}
void main(){
#include <logdepthbuf_fragment>
 if(uCacheFade<.001||uOpacity<.001)discard;
 vec3 rd=normalize(vP-uEye),inv=1./(rd+vec3(1.e-8));
 vec3 a=(-vec3(uBox)-uEye)*inv,b=(vec3(uBox)-uEye)*inv;
 vec3 lo=min(a,b),hi=max(a,b);
 // Rays only integrate the slab that holds the disk, bulge and image parts.
 float y0=(-uSlab-uEye.y)*inv.y,y1=(uSlab-uEye.y)*inv.y;
 lo.y=max(lo.y,min(y0,y1));hi.y=min(hi.y,max(y0,y1));
 float start=max(0.,max(lo.x,max(lo.y,lo.z))),finish=min(hi.x,min(hi.y,hi.z));
 if(uDiskReach>0.){
  // Nothing lies outside this radius: rays keep to the cylinder around the disk axis.
  float ra=dot(rd.xz,rd.xz),rb=dot(uEye.xz,rd.xz),rc=dot(uEye.xz,uEye.xz)-uDiskReach*uDiskReach;
  float rh=rb*rb-ra*rc;
  if(ra>1.e-8){
   if(rh<=0.)discard;
   rh=sqrt(rh);start=max(start,(-rb-rh)/ra);finish=min(finish,(-rb+rh)/ra);
  }else if(rc>0.)discard;
 }
 if(finish<=start)discard;
 // Steps: fine inside the thin dust/young layers and the bulge, up to dsCap elsewhere.
 // uSteps bounds the step count of the longest (edge-on) rays.
 float dsCap=max(4.2*uBox/1.35/uSteps,.02);
 float ay=max(abs(rd.y),1.e-3);
 float hd=uDiskHeights.w,core=uDiskBulge.x*uDiskBulge.y;
 // A face-on map is a column: detail spread through the young and dust layers would show as
 // streaks and pillars in tilted views, where each layer projects to a strip about
 // 2h·tan(inclination) wide. H II regions, clusters and dust lanes lie close to the
 // mid-plane, so detail finer than that strip is drawn as a thin sheet where the ray crosses
 // the plane (the face-on column is unchanged). Grazing rays keep it in the layers.
 // Inside, no sheet: seen from within, flattened H II and dust read as pink pancakes, so the
 // fine structure stays in the 3D layers.
 float sheetW=smoothstep(.12,.3,ay)*(1.-uReveal*uDiskInterior.z);
 float smear=2.*max(uDiskHeights.y,hd)*sqrt(max(1.-ay*ay,0.))/ay;
 float tc=-uEye.y/(abs(rd.y)>1.e-7?rd.y:1.e-7);
 // An eye inside the slab sees the galaxy in perspective: steps lengthen with distance. Along
 // grazing rays, which have no mid-plane sheet, the maps are filtered over the ground each
 // step covers, far wider than a pixel there.
 bool inside=start<=0.;
 float sweep=inside?(1.-sheetW)*sqrt(max(1.-ay*ay,0.)):0.;
 bool sheet=sheetW>0.&&tc>start&&tc<finish;
 // Interleaved gradient noise decorrelates step positions between neighbouring pixels.
 float jitter=fract(52.9829189*fract(dot(gl_FragCoord.xy,vec2(.06711056,.00583715))));
 // A pixel's footprint on the disk plane stretches by 1/|rd.y| along the view; filtering the
 // maps for part of that stretch keeps fine structure from aliasing into moire rings in
 // close interior views. Exterior views keep the photograph-matched sharpness.
 float aniso=inside?pow(ay,-.4):1.;
 float angle=uTime*uRotationRate,c=cos(angle),s=sin(angle);
 vec3 trans=vec3(1.),light=vec3(0.);
 float t=start;
 for(int i=0;i<140;i++){
  if(t>=finish||max(trans.r,max(trans.g,trans.b))<.006)break;
  vec3 p=uEye+rd*t;
  float vertical=(.45*abs(p.y)+.85*hd)/ay;
  float central=.3*length(p)+.35*core;
  float ds=clamp(min(vertical,central),.0015,inside?max(.02,.2*t):dsCap);
  if(uPartCount>.5)ds=max(.0015,min(ds,diskPartStep(p)));
  if(uKnotLight.w>.5)ds=max(.0015,min(ds,diskKnotStep(vec3(p.x*c-p.z*s,p.y,p.x*s+p.z*c))));
  if(i==0)ds*=.15+.85*jitter;
  ds=min(ds,finish-t);
  // The step that reaches the mid-plane ends there; the sheet is composited after it.
  bool atSheet=sheet&&t+ds>=tc;
  if(atSheet)ds=max(tc-t,0.);
  if(ds>0.){
   // Inside, each step samples a different (golden-ratio) point per pixel, so the long
   // perspective steps through the thin layers make fine grain, not concentric bands.
   float tm=t+ds*(inside?fract(jitter+float(i)*.618034):.5);
   vec3 x=uEye+rd*tm;
   vec3 q=vec3(x.x*c-x.z*s,x.y,x.x*s+x.z*c);
   // Grazing interior rays filter the maps over a third of each step, not all of it: the
   // band keeps its star clouds and dark lanes instead of melting into smooth fog; the
   // per-pixel step jitter turns the remaining aliasing into fine grain.
   float lod=log2(max(max(tm*uPixelAngle*aniso,ds*sweep*.33),1.e-6));
   // The layers' own scale is only read where the mid-plane sheet is drawn.
   float lodC=sheetW>0.?max(lod,log2(max(smear*diskFlare(length(q.xz)),1.e-6))):lod;
   vec3 e;float k;
   diskLayer(q,lod,lodC,sheetW,e,k);
   e+=diskBulge(q);
   if(uKnotLight.w>.5){float kn;e+=diskKnots(q,kn);k+=kn;}
   if(uPartCount>.5)e+=diskParts(q,lod);
   if(uDiskWind.x>0.)e+=diskWind(q);
   float clear=smoothstep(.012,mix(.045,.13,uReveal),tm);
   e*=clear*mix(1.,uDiskInterior.y*unresolved(tm),uReveal);
   float kd=k*clear*ds;
   if(kd<7.5e-5){
    // Outside the dust (most steps): no channel is attenuated measurably.
    light+=trans*e*ds;
    trans*=1.-kd*REDDEN;
   }else{
    vec3 kk=kd*REDDEN;
    vec3 att=exp(-kk);
    light+=trans*e*ds*mix(vec3(1.),(1.-att)/max(kk,vec3(1.e-6)),step(vec3(1.e-4),kk));
    trans*=att;
   }
   t+=ds;
  }
  if(atSheet){
   sheet=false;
   vec3 x=uEye+rd*tc;
   vec2 xz=vec2(x.x*c-x.z*s,x.x*s+x.z*c);
   float lod=log2(max(tc*uPixelAngle*aniso,1.e-6));
   // The sheet's column, seen along the ray, is spread over 1/|rd.y| of path.
   vec4 d=diskSheet(xz,lod,max(lod,log2(max(smear*diskFlare(length(xz)),1.e-6))))*sheetW;
   float clear=smoothstep(.012,mix(.045,.13,uReveal),tc);
   vec3 kk=d.a*clear*REDDEN/ay;
   vec3 att=exp(-kk);
   vec3 seg=mix(vec3(1.),(1.-att)/max(kk,vec3(1.e-6)),step(vec3(1.e-4),kk));
   light+=trans*d.rgb*clear*mix(1.,uDiskInterior.y*unresolved(tc),uReveal)*seg/ay;
   trans*=att;
  }
 }
 float coverage=clamp(1.-dot(trans,vec3(1./3.)),0.,1.);
 float peak,peakInterior;
 vec3 display=rollOff(light,peak);
 // Inside, the faint sky between bright bands is lowered before the same roll-off, so the
 // band stands out against a dark sky (as the Milky Way does from Earth) instead of sitting
 // in a uniform glow, and the band itself is lifted.
 // An S-curve on the linear light: faint glow x0.4, the bright band x1.4.
 float contrast=mix(.4,1.4,smoothstep(.03,.7,peak));
 // Inside, most of the band's light is drawn as point stars rather than glow.
 float resolve=uReveal*uDiskInterior.z;
 vec3 stars=resolve>0.?bandStars(vec3(rd.x*c-rd.z*s,rd.y,rd.x*s+rd.z*c),light):vec3(0.);
 float share=.6*resolve*bandShare(light);
 vec3 interior=rollOff((light*(1.-share)+.6*resolve*stars)*mix(1.,contrast,resolve),peakInterior);
 // The photograph's exact display inversion lifts the faintest light as well; a soft black
 // point keeps the faint exponential wings of very bright edge-on columns from widening
 // the disk, as a photographic sky level would.
 float low=min(display.r,min(display.g,display.b));
 vec3 exact=beforeDisplay(display);
 vec3 toe=display/max(uExposure,1e-4)+(exact-display/max(uExposure,1e-4))*smoothstep(.0015,.02,low);
 // Faint orange light reads as brown fog; inside, the glow is a paler, whiter starlight.
 interior=mix(vec3(dot(interior,LUMA)),interior,1.-.35*resolve);
 vec3 radiance=mix(interior*uDiskInterior.x,toe,uExteriorView);
 float o=uOpacity*uCacheFade;
 if(max(coverage,peak)*o<.0004)discard;
 gl_FragColor=vec4(radiance*o,coverage*o);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}
`;
