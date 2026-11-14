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
uniform float uViewGain,uBalance,uContrast,uDust,uReveal,uViewport;uniform vec3 uLight;
varying vec3 vLocal;
#include <common>
#include <logdepthbuf_pars_fragment>
float n(vec3 p){return texture(uNoise,p/32.+uSeed).r;}
${NEBULA_CACHED_MEDIUM}
// Quintic-smoothed lattice lookup: still one fetch, without trilinear diamond artifacts.
float ns(vec3 p){vec3 x=(p/32.+uSeed)*64.+.5,i=floor(x),f=fract(x);f=f*f*f*(f*(f*6.-15.)+10.);return texture(uNoise,(i+f-.5)/64.).r;}
float ridge(float v){v=1.-abs(2.*v-1.);return v*v;}
// The baked grid holds the morphology (128-160 voxels). Close up, zero-mean ridged
// octaves add filaments and knots finer than a voxel; each octave fades out once it
// is smaller than a pixel, so distant views keep the baked shape without shimmer.
float detail(vec3 p,float foot){
 p+=(ns(p*6.+4.1)-.5)*vec3(.12,-.09,.07);
 float sum=0.,norm=0.,amp=1.,freq=14.;
 for(int o=0;o<3;o++){
  float k=1.-smoothstep(.3,1.,foot*freq*2.);
  norm+=amp;if(k<=0.)break;
  float v=ns(p*freq+float(o)*13.7);sum+=amp*k*(mix(v,ridge(v),.45)-.52);amp*=.68;freq*=2.2;
 }
 return sum/norm;
}
void main(){
 #include <logdepthbuf_fragment>
 if(uDensityReady<.5)discard;
 vec3 ray=normalize(vLocal-uEye),inv=1./(ray+vec3(1.e-8));
 vec3 a=(-vec3(1.6)-uEye)*inv,b=(vec3(1.6)-uEye)*inv;
 vec3 lo=min(a,b),hi=max(a,b);float start=max(0.,max(lo.x,max(lo.y,lo.z))),end=min(hi.x,min(hi.y,hi.z));if(end<=start)discard;
 float span=end-start,stepSize=span/uSteps;float interior=1.-smoothstep(1.1,1.7,length(uEye));
 float pixel=.83/max(uViewport,1.);
 float jitter=fract(sin(dot(floor(gl_FragCoord.xy),vec2(12.9898,78.233)))*43758.5453);
 float dustFactor=uDust*mix(1.,.45,uReveal);
 vec3 sum=vec3(0.);float trans=1.;
 float dist=start+(.25+jitter*.5)*stepSize*mix(1.,.05,interior);
 for(int i=0;i<100;i++){
  if(float(i)>=uSteps*1.25||dist>=end||trans<.008)break;
  // Inside, strides grow with distance so nearby gas is finely resolved.
  float base=mix(stepSize,stepSize*(.03+2.*sqrt((dist-start)/span)),interior);
  vec3 p=uEye+ray*dist;vec2 media=sampleNebula(p);
  // Long strides through empty space, fine strides inside cloud material: the same
  // budget resolves several times finer structure where there is something to see.
  float ds=base*mix(1.6,.45,smoothstep(.01,.25,media.x+media.y));
  dist+=ds;
  if(media.x+media.y<.0002)continue;
  // Empty cavities and gaps remain empty. Nearby grains soften within a tiny
  // personal near plane; whole clouds never dissolve as the camera enters.
  media*=smoothstep(.002,.025+.06*uReveal,dist);
  // Detail is limited by both the pixel footprint and the step length (no depth aliasing).
  float fine=detail(p,max(dist*pixel,ds*.15));
  // Erosion opens true gaps between filaments instead of only modulating a haze.
  // Thin outer gas erodes most (wisps, sharp fronts); dense cores keep their body.
  float edge=1./(1.+(media.x+media.y)*6.);
  media.x*=max(0.,1.+(1.6+3.4*edge)*fine);
  // Dust gets a noise-displaced level set: opaque bodies with hard, fractal silhouettes
  // (pillars, lanes, globules) instead of a Gaussian haze.
  media.y*=smoothstep(.1,.45,media.y*1.4+fine*1.3)*1.4*dustFactor;
  // Recombination lines scale with density squared, so dense fronts outshine diffuse gas.
  // Ionised gas is optically thin: it emits strongly but absorbs little, so layers
  // glow through one another. Dust both scatters light and carries the extinction.
  float emitDepth=(media.x*.8*clamp(media.x*3.,.3,3.)+media.y*1.8)*ds,absorb=(media.x*.2+media.y*4.5)*ds;
  // Contributions below this optical depth are subpixel; avoid colour reads in empty space.
  if(emitDepth<.0005*ds)continue;
  vec3 source=texture(uEmission,p/3.2+.5).rgb;
  source*=clamp((media.x+media.y*2./max(dustFactor,.001)+.001)/(media.x+media.y*2.+.001),.3,3.);
  // One shadow probe toward the ionising cluster: lit faces glow, far sides fall into shade.
  vec3 toLight=uLight-p;float lightDistance=length(toLight);
  vec2 occluder=sampleNebula(p+toLight/max(lightDistance,1.e-4)*min(.16,lightDistance*.5));
  float lit=exp(-(occluder.x*.6+occluder.y*2.4*dustFactor)*.4);
  // Dust is lit only by scattering, so its shadowed side goes much darker than gas.
  float dustShare=media.y*1.8/(media.x*.8+media.y*1.8+1.e-4);
  source*=mix(mix(.45,1.35,lit),mix(.06,.9,lit),dustShare)*(1.+.9*max(fine,0.));
  sum+=trans*(1.-exp(-emitDepth))*source;
  // Ionisation front: dust surfaces facing the cluster photo-evaporate into a thin bright
  // skin (the glowing rims of pillars and globules), lit like the adjacent medium.
  float front=media.y*lit*lit*.5;
  sum+=trans*(1.-exp(-front*ds))*source;
  trans*=exp(-absorb);
 }
 float opacity=1.-trans;
 vec3 radiance=sum*mix(.85,1.,smoothstep(.4,1.6,length(uEye)));
 radiance=pow(max(radiance/8.,vec3(0.)),vec3(uContrast))*8.*uViewGain*uBalance;
 // Overlapping layers average toward pastel; restore some line colour, as image processing does.
 radiance=max(mix(vec3(dot(radiance,vec3(.2126,.7152,.0722))),radiance,1.18),0.);
 if(opacity<.001&&max(radiance.r,max(radiance.g,radiance.b))<.001)discard;
 // Premultiplied: emission adds light even where the gas barely occludes.
 gl_FragColor=vec4(radiance,opacity)*uCacheFade;
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
}`;
