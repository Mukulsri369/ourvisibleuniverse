import type { GalaxyModel } from "./galaxy-models";
import { galaxyOrientation } from "./galaxy-models";
import { catalogueMorphologyMode } from "./galaxy-overview-appearance";
export { catalogueAppearance } from "./galaxy-overview-appearance";

export const CATALOGUE_VERTEX = /*glsl*/ `
#include <common>
#include <logdepthbuf_pars_vertex>
attribute vec3 aPositionLow;
attribute vec4 aShape,aOrientation,aAppearance,aFeatures;
attribute vec3 aOldColor,aYoungColor;
attribute float aMask,aSeed;
uniform vec3 uCameraHigh,uCameraLow;
// Physical drawing-buffer height, including the current device-pixel ratio.
uniform float uHeight,uPixelRatio;
varying vec4 vShape,vAppearance,vFeatures;
varying vec3 vOldColor,vYoungColor,vRight,vUp,vToward;
varying float vSeed,vAlpha,vPixels;
vec3 inverseRotate(vec4 q,vec3 p){return p+2.*cross(-q.xyz,cross(-q.xyz,p)+q.w*p);}
void main(){
  vec3 relative=(position-uCameraHigh)+(aPositionLow-uCameraLow);
  vec4 mv=vec4(mat3(viewMatrix)*relative,1.);
  gl_Position=projectionMatrix*mv;
  float physical=aShape.x*uHeight*projectionMatrix[1][1]/max(1.,-mv.z);
  gl_PointSize=clamp(physical,6.*uPixelRatio,128.*uPixelRatio);
  vPixels=gl_PointSize;vAlpha=1.-aMask;vShape=aShape;vSeed=aSeed;
  vAppearance=aAppearance;vFeatures=aFeatures;
  vOldColor=aOldColor;vYoungColor=aYoungColor;
  vRight=inverseRotate(aOrientation,vec3(viewMatrix[0][0],viewMatrix[1][0],viewMatrix[2][0]));
  vUp=inverseRotate(aOrientation,vec3(viewMatrix[0][1],viewMatrix[1][1],viewMatrix[2][1]));
  vToward=inverseRotate(aOrientation,normalize(-relative));
  if(mv.z>=0.)vAlpha=0.;
  #include <logdepthbuf_vertex>
}`;

export const CATALOGUE_FRAGMENT = /*glsl*/ `
#include <logdepthbuf_pars_fragment>
varying vec4 vShape,vAppearance,vFeatures;
varying vec3 vOldColor,vYoungColor,vRight,vUp,vToward;
varying float vSeed,vAlpha,vPixels;

// Analytic line-of-sight profile of a finite-thickness ellipsoidal population.
// The closest point is solved in the ellipsoid metric: no edge-on division by
// the disk normal, and no per-fragment raymarch for subpixel catalogue galaxies.
float column(vec3 origin,vec3 direction,vec3 axes,out vec3 closest){
  vec3 invAxes=1./axes;
  vec3 od=origin*invAxes,dd=direction*invAxes;
  float denom=max(.001,dot(dd,dd));
  closest=origin-direction*(dot(od,dd)/denom);
  return min(4.,1./(axes.y*sqrt(denom)));
}
float hash21(vec2 p){
  vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);
  return fract((q.x+q.y)*q.z);
}
float grain(vec2 p){
  vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(hash21(i),hash21(i+vec2(1.,0.)),f.x),
             mix(hash21(i+vec2(0.,1.)),hash21(i+1.),f.x),f.y);
}
void main(){
  #include <logdepthbuf_fragment>
  if(vAlpha<.001)discard;
  vec2 xy=gl_PointCoord*2.-1.;
  float r2=dot(xy,xy),pixel=2./max(1.,vPixels);
  if(r2>1.)discard;
  vec3 origin=vRight*xy.x-vUp*xy.y,direction=vToward;
  float mode=vShape.y,q=clamp(vShape.z,.06,1.);
  bool spheroid=(mode>1.5&&mode<2.5)||(mode>3.5&&mode<4.5);
  bool irregular=(mode>2.5&&mode<3.5)||(mode>5.5&&mode<6.5)||(mode>8.5&&mode<9.5);
  bool starburst=mode>9.5;
  bool compact=mode>5.5&&mode<6.5;
  bool ring=mode>6.5&&mode<7.5;
  bool flocculent=mode>7.5&&mode<8.5;
  vec3 axes=spheroid?vec3(1.,sqrt(q),q):
    (irregular?vec3(1.,.3,q):vec3(1.,.075,1.));
  vec3 p;
  float depth=column(origin,direction,axes,p);
  float ellipticalRadius=length(p/axes),r=length(p.xz);
  float disk=exp(-4.2*ellipticalRadius)*depth;
  float bulgeScale=max(.045,vAppearance.z*.7);
  float bulge=exp(-length(origin/vec3(bulgeScale))*2.7);
  float young=0.,dust=0.,association=0.,wind=0.;
  float detail=smoothstep(8.,28.,vPixels);

  if(spheroid){
    // Smooth old populations: centrally concentrated ellipticals, broader dSphs.
    float slope=mode>3.5?3.7:5.1;
    disk=exp(-pow(ellipticalRadius,mode>3.5?1.15:.8)*slope)*depth;
    bulge*=mode>3.5?.12:.6;
  }else if(detail>.001){
    float a=atan(p.z+1.e-7,p.x+1.e-7);
    float arm=0.;
    if(!irregular&&!ring&&vShape.w>.5){
      float phase=max(1.,vShape.w)*(a-log(max(.035,r))/max(.09,vAppearance.x))+vSeed*6.2831853;
      float aa=min(1.,fwidth(phase));
      arm=smoothstep(.38-aa,.94+aa,cos(phase));
      arm*=smoothstep(.04,.15,r)*(1.-smoothstep(.72,1.,r));
      // Structure narrower than a pixel fades continuously instead of shimmering.
      arm*=1.-smoothstep(1.,3.,fwidth(phase));
      if(flocculent)arm*=.35+.65*grain(p.xz*17.+vSeed*63.);
      disk*=mix(1.,.62+arm*1.65,detail);
      young=arm*.8;
      dust=arm*.65;
    }
    if(ring){
      float ringAt=vFeatures.x>.01?vFeatures.x:.7;
      float width=max(.045,pixel*1.5);
      float annulus=exp(-pow((r-ringAt)/width,2.));
      float gap=.06+annulus*2.9;
      disk*=mix(1.,gap,detail);
      young=annulus;
      dust=annulus*.25;
    }
    if(vFeatures.y>.01){
      vec3 barPoint;
      vec3 barAxes=vec3(max(.12,vFeatures.y),.07,.09);
      float barDepth=column(origin,direction,barAxes,barPoint);
      float bar=exp(-length(barPoint/barAxes)*3.)*barDepth;
      disk+=bar*.55*detail;
    }
    float texture=grain(p.xz*18.+vSeed*71.);
    if(vPixels>32.)texture=.7*texture+.3*grain(p.xz*43.+vSeed*91.);
    association=smoothstep(.58,.86,texture)*vFeatures.z*detail;
    if(irregular){
      // Broad asymmetric continuum plus non-periodic associations, never spiral arms.
      float asymmetry=.82+.22*sin(p.x*4.+p.z*3.+vSeed*6.);
      disk*=asymmetry*(.72+association*2.1);
      young=compact?.75:.3+association*.65;
      bulge*=compact?1.15:.15;
    }else if(starburst){
      young=.4+association*.55;
      disk*=.8+association*1.2;
    }else{
      association*=max(.08,young);
      disk*=1.+association*.55;
    }
    dust*=vAppearance.y*detail*(.55+texture*.65);
  }

  if(mode>4.5&&mode<5.5){young*=.12;disk*=.65;bulge*=1.5;}
  if(vFeatures.w>3.5&&vFeatures.w<4.5){
    // The LMC's observed stellar bar; its unresolved substructure is illustrative.
    vec3 barPoint;
    float barDepth=column(origin,direction,vec3(.55,.18,.15),barPoint);
    disk+=exp(-length(barPoint/vec3(.55,.18,.15))*3.)*barDepth*.45;
  }
  if(vAppearance.y>.01){
    vec3 dustPoint;
    float dustDepth=column(origin,direction,vec3(.8,.035,.8),dustPoint);
    float lane=exp(-length(dustPoint/vec3(.8,.035,.8))*3.5)*dustDepth;
    float edgeOn=1.-abs(direction.y);
    dust+=lane*vAppearance.y*edgeOn*.55;
    // The broad crossing lane in Centaurus A is an observed guide exception.
    if(vFeatures.w>2.5&&vFeatures.w<3.5)dust+=lane*1.2;
  }
  if(vFeatures.w>.5&&vFeatures.w<1.5&&detail>.001){
    vec3 plumePoint;
    float plumeDepth=column(origin-vec3(0.,.28,0.),direction,vec3(.12,.29,.12),plumePoint);
    wind=exp(-length(plumePoint/vec3(.12,.29,.12))*3.)*plumeDepth;
    plumeDepth=column(origin+vec3(0.,.28,0.),direction,vec3(.12,.29,.12),plumePoint);
    wind+=exp(-length(plumePoint/vec3(.12,.29,.12))*3.)*plumeDepth;
    wind*=detail*.28;
  }
  if(vFeatures.w>1.5&&vFeatures.w<2.5&&detail>.001){
    vec3 tailPoint;
    float tailDepth=column(origin-vec3(.43,0.,.14),direction,vec3(.43,.06,.09),tailPoint);
    float tail=exp(-length(tailPoint/vec3(.43,.06,.09))*2.8)*tailDepth;
    disk+=tail*.25*detail;young=max(young,.45*detail);
  }

  vec3 population=mix(vOldColor,vYoungColor,clamp(young*detail,0.,.92));
  vec3 emission=population*disk+vOldColor*bulge*.7;
  // Pink H II accents are population-level illustration, not named observed objects.
  emission+=vec3(1.,.23,.38)*(association*disk*.12+wind);
  float attenuation=exp(-dust*2.);
  emission*=attenuation;
  float surface=(disk+bulge*.7)*attenuation+wind;
  // Unresolved visibility floor is deliberately a display convention, not flux.
  float marker=.20*exp(-r2*7.)*(1.-smoothstep(9.,24.,vPixels));
  float edge=1.-smoothstep(1.-pixel*1.5,1.,sqrt(r2));
  float alpha=max(1.-exp(-surface*2.5),marker)*vAlpha*edge;
  if(alpha<.001)discard;
  vec3 colour=mix(vOldColor,emission/max(.002,surface),smoothstep(.002,.08,surface));
  gl_FragColor=vec4(colour*vAppearance.w*1.35,alpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

export function catalogueShape(model: GalaxyModel): [number, number, number, number] {
  return [
    model.diskRadius,
    catalogueMorphologyMode(model),
    Math.min(
      1,
      Math.max(
        0.06,
        model.projectedAxisRatio ?? Math.abs(Math.cos((model.inclination * Math.PI) / 180)),
      ),
    ),
    model.arms,
  ];
}
export function catalogueOrientation(model: GalaxyModel) {
  return galaxyOrientation(model).toArray();
}
