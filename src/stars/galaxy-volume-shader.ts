import { GALAXY_MEDIUM } from "./galaxy-medium";
/** Rays integrate the same 3D field for the catalogue, approach, and interior. */
export const GALAXY_FRAGMENT =
  /* glsl */ `
#include <logdepthbuf_pars_fragment>
precision highp sampler3D;
uniform vec3 uEye,uFieldSize;uniform sampler3D uField;
uniform float uAdaptiveSampling;
uniform float uOpacity,uReveal,uSteps,uCacheFade,uVolumeWeight;
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
 for(int i=0;i<112;i++){
  if(float(i)>=steps||trans<.012)break;
  vec3 p=uEye+rd*(start+(float(i)+.5+(jitter-.5)*.35)*ds);
  float r=length(p.xz),angle=uTime*uRotationRate/max(r,.12);
  float c=cos(angle),s=sin(angle);vec3 q=vec3(p.x*c-p.z*s,p.y,p.x*s+p.z*c);
  vec4 field;
#ifdef GALAXY_PREVIEW
  float d;vec3 e=populations(q,d);field=vec4(e,d);
#else
  field=texture(uField,q/2.7+.5);
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
 gl_FragColor=vec4(light/max(1.-trans,.001),alpha);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}
`;
