import { NEBULA_MEDIUM } from "./nebula-medium";
export const NEBULA_VOLUME_VERTEX = /* glsl */ `
varying vec3 vLocal;
#include <common>
#include <logdepthbuf_pars_vertex>
void main(){
 vLocal=position;
 gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
 #include <logdepthbuf_vertex>
}`;
export const NEBULA_VOLUME_FRAGMENT = /* glsl */ `
precision highp sampler3D;
uniform sampler3D uNoise;uniform sampler2D uReference;
uniform vec3 uEye,uPrimary,uSecondary;uniform float uShape,uSteps,uHasReference,uDark,uAspect,uSeed;
varying vec3 vLocal;
#include <common>
#include <logdepthbuf_pars_fragment>
${NEBULA_MEDIUM}
void main(){
 #include <logdepthbuf_fragment>
 vec3 ray=normalize(vLocal-uEye),inv=1./(ray+vec3(1.e-8));
 vec3 a=(-vec3(1.6)-uEye)*inv,b=(vec3(1.6)-uEye)*inv;
 vec3 lo=min(a,b),hi=max(a,b);float start=max(0.,max(lo.x,max(lo.y,lo.z))),end=min(hi.x,min(hi.y,hi.z));if(end<=start)discard;
 float stepSize=(end-start)/uSteps;bool interior=length(uEye)<1.4;
 float jitter=fract(sin(dot(floor(gl_FragCoord.xy),vec2(12.9898,78.233)))*43758.5453);
 vec3 sum=vec3(0.);float trans=1.;
 for(int i=0;i<112;i++){
  if(float(i)>=uSteps||trans<.008)break;
  float q=(float(i)+.38+jitter*.24)/uSteps;float t=interior?q*q:q;
  float ds=interior?stepSize*2.*q:stepSize;
  vec3 p=uEye+ray*mix(start,end,t);vec2 media=nebulaMedium(p);
  // Empty cavities and gaps remain empty. Nearby grains soften within a tiny
  // personal near plane; whole clouds never dissolve as the camera enters.
  float nearFade=smoothstep(.002,.025,length(p-uEye));media*=nearFade;
  float extinction=media.x*.8+media.y*1.8;
  float alpha=1.-exp(-extinction*ds);
  float f=fbm(p*7.);
  vec3 palette=mix(uPrimary,uSecondary,smoothstep(.25,.75,f+p.y*.18));
  // The observation constrains colour only. No image sheet, surface, or
  // luminous photo column participates in the geometry or star positions.
  vec2 uv=p.xy*(.39+.05*sin(p.z*2.))+vec2(.5)+vec2(sin(p.z*3.),cos(p.z*2.)-1.)*.06;
  uv.x=.5+(uv.x-.5)/max(1.,uAspect);uv.y=.5+(uv.y-.5)*min(1.,uAspect);
  vec3 observed=textureLod(uReference,clamp(uv,.002,.998),5.).rgb;
  vec3 photoColor=observed/(max(max(observed.r,observed.g),observed.b)+.004);
  float confidence=smoothstep(.004,.08,max(max(observed.r,observed.g),observed.b));
  vec3 color=mix(palette,photoColor,uHasReference*confidence*.8);
  float illumination=media.x/(media.x+media.y*2.+.0001);
  vec3 finePhoto=textureLod(uReference,clamp(uv,.002,.998),.5).rgb;
  float fineLum=dot(finePhoto,vec3(.2126,.7152,.0722)),broadLum=dot(observed,vec3(.2126,.7152,.0722));
  float rejectStar=1.-smoothstep(.10,.32,max(max(finePhoto.r,finePhoto.g),finePhoto.b)-max(max(observed.r,observed.g),observed.b));
  float detail=mix(1.,clamp((fineLum+.025)/(broadLum+.025),.6,1.7),uHasReference*confidence*rejectStar*.65);
  vec3 source=color*(54.+smoothstep(.35,.75,n(p*93.))*18.)*illumination*detail+vec3(.012,.009,.006)*(1.-illumination);
  source*=mix(1.,.38,uDark)*mix(.28,1.,smoothstep(.4,1.6,length(uEye)));
  if(uShape>19.5&&uShape<20.5)source*=.2;
  sum+=trans*alpha*source;trans*=1.-alpha;
 }
 float opacity=1.-trans;if(opacity<.001)discard;
 gl_FragColor=vec4(sum/max(opacity,.001),opacity);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
}`;
