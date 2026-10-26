import { NEBULA_CACHED_MEDIUM } from "./nebula-density-cache";
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
uniform sampler3D uNoise,uEmission;uniform float uCacheFade;uniform sampler2D uReference;
uniform vec3 uEye,uPrimary,uSecondary;uniform float uShape,uSteps,uHasReference,uDark,uAspect,uSeed;
uniform float uViewGain,uBalance,uContrast,uDust,uReveal;uniform vec3 uLight;
varying vec3 vLocal;
#include <common>
#include <logdepthbuf_pars_fragment>
float n(vec3 p){return texture(uNoise,p/32.+uSeed).r;}
${NEBULA_CACHED_MEDIUM}
void main(){
 #include <logdepthbuf_fragment>
 if(uDensityReady<.5)discard;
 vec3 ray=normalize(vLocal-uEye),inv=1./(ray+vec3(1.e-8));
 vec3 a=(-vec3(1.6)-uEye)*inv,b=(vec3(1.6)-uEye)*inv;
 vec3 lo=min(a,b),hi=max(a,b);float start=max(0.,max(lo.x,max(lo.y,lo.z))),end=min(hi.x,min(hi.y,hi.z));if(end<=start)discard;
 float stepSize=(end-start)/uSteps;float interior=1.-smoothstep(1.1,1.7,length(uEye));
 float jitter=fract(sin(dot(floor(gl_FragCoord.xy),vec2(12.9898,78.233)))*43758.5453);
 vec3 sum=vec3(0.);float trans=1.;
 for(int i=0;i<112;i++){
  if(float(i)>=uSteps||trans<.008)break;
  float q=(float(i)+.38+jitter*.24)/uSteps;float t=mix(q,q*q,interior);
  float ds=stepSize*mix(1.,2.*q,interior);
  vec3 p=uEye+ray*mix(start,end,t);vec2 media=sampleNebula(p);
  // Empty cavities and gaps remain empty. Nearby grains soften within a tiny
  // personal near plane; whole clouds never dissolve as the camera enters.
  float nearFade=smoothstep(.002,.025+.06*uReveal,length(p-uEye));media*=nearFade;
  media.y*=uDust*mix(1.,.45,uReveal);
  float extinction=media.x*.8+media.y*1.8;
  // Contributions below this optical depth are subpixel; avoid colour reads in empty space.
  if(extinction<.0005)continue;
  float alpha=1.-exp(-extinction*ds);
  vec3 source=texture(uEmission,p/3.2+.5).rgb;
  float dustFactor=uDust*mix(1.,.45,uReveal);
  source*=clamp((media.x+media.y*2./max(dustFactor,.001)+.001)/(media.x+media.y*2.+.001),.3,3.);
  source*=.9+.2*n(p*93.);
  sum+=trans*alpha*source;trans*=1.-alpha;
 }
 float opacity=1.-trans;if(opacity<.001)discard;
 vec3 radiance=sum/max(opacity,.001)*mix(.28,1.,smoothstep(.4,1.6,length(uEye)));
 radiance=pow(max(radiance/8.,vec3(0.)),vec3(uContrast))*8.*uViewGain*uBalance;
 gl_FragColor=vec4(radiance,opacity*uCacheFade);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
}`;
