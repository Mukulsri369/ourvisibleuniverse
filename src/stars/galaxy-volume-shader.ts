/** Native-resolution rays sample a cached three-dimensional stellar/dust field. */
export const GALAXY_FRAGMENT = /* glsl */ `
#include <logdepthbuf_pars_fragment>
precision highp sampler3D;
uniform vec3 uEye;uniform sampler3D uField;
uniform float uOpacity,uReveal,uSteps,uCacheFade,uVolumeWeight,uTime,uRotationRate;
varying vec3 vP;
void main(){
#include <logdepthbuf_fragment>
 if(uCacheFade<.001||uVolumeWeight<.001||uReveal>.995)discard;
 vec3 rd=normalize(vP-uEye),inv=1./(rd+vec3(1.e-8));
 vec3 a=(-vec3(1.35)-uEye)*inv,b=(vec3(1.35)-uEye)*inv;
 vec3 lo=min(a,b),hi=max(a,b);
 float start=max(0.,max(lo.x,max(lo.y,lo.z))),finish=min(hi.x,min(hi.y,hi.z));if(finish<=start)discard;
 float ds=(finish-start)/uSteps,trans=1.;vec3 light=vec3(0.);
 float jitter=fract(sin(dot(floor(gl_FragCoord.xy),vec2(12.9898,78.233)))*43758.5453);
 for(int i=0;i<48;i++){
  if(float(i)>=uSteps||trans<.01)break;
  vec3 p=uEye+rd*(start+(float(i)+.5+(jitter-.5)*.4)*ds);
  float r=length(p.xz),angle=uTime*uRotationRate/max(r,.12);
  float c=cos(angle),s=sin(angle);vec3 q=vec3(p.x*c-p.z*s,p.y,p.x*s+p.z*c);
  vec4 field=texture(uField,q/2.7+.5);
  float nearFade=smoothstep(.008,.10,length(p-uEye));
  float dust=field.a*nearFade*mix(1.,.1,uReveal);
  vec3 emission=field.rgb*nearFade;
  float extinction=dust+dot(emission,vec3(.2126,.7152,.0722))*.08;
  float alpha=1.-exp(-extinction*ds*7.);
  vec3 reddening=exp(-dust*ds*vec3(.8,1.15,1.65));
  light+=trans*emission/max(extinction,.025)*alpha*reddening;
  trans*=1.-alpha;
 }
 float clear=1.-smoothstep(.15,.85,uReveal);
 float alpha=clamp(1.-trans,0.,.95)*uOpacity*uCacheFade*uVolumeWeight*clear;
 if(alpha<.002)discard;
 light=light/(1.+dot(light,vec3(.2126,.7152,.0722))*.14);
 gl_FragColor=vec4(light/max(1.-trans,.001),alpha);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}
`;
