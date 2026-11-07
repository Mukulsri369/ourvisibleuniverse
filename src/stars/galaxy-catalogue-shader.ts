import * as THREE from "three";
import type { GalaxyModel } from "./galaxy-models";
import { galaxyOrientation } from "./galaxy-models";
export const CATALOGUE_VERTEX = /*glsl*/ `
#include <common>
#include <logdepthbuf_pars_vertex>
attribute vec3 aPositionLow;attribute vec4 aShape;attribute vec4 aOrientation;attribute float aMask;attribute float aSeed;
uniform vec3 uCameraHigh,uCameraLow;uniform float uHeight;
varying vec4 vShape;varying float vSeed,vAlpha;varying vec3 vRight,vUp,vToward;
vec3 inverseRotate(vec4 q,vec3 p){return p+2.*cross(-q.xyz,cross(-q.xyz,p)+q.w*p);}
void main(){
vec3 relative=(position-uCameraHigh)+(aPositionLow-uCameraLow);
vec4 mv=vec4(mat3(viewMatrix)*relative,1.);gl_Position=projectionMatrix*mv;
float physical=aShape.x*uHeight*projectionMatrix[1][1]/max(1.,-mv.z);
gl_PointSize=clamp(physical,5.,128.);vAlpha=1.-aMask;vShape=aShape;vSeed=aSeed;
vRight=inverseRotate(aOrientation,vec3(viewMatrix[0][0],viewMatrix[1][0],viewMatrix[2][0]));
vUp=inverseRotate(aOrientation,vec3(viewMatrix[0][1],viewMatrix[1][1],viewMatrix[2][1]));
vToward=inverseRotate(aOrientation,normalize(-relative));
if(mv.z>=0.)vAlpha=0.;
#include <logdepthbuf_vertex>
}`;
export const CATALOGUE_FRAGMENT = /*glsl*/ `
#include <logdepthbuf_pars_fragment>
varying vec4 vShape;varying float vSeed,vAlpha;varying vec3 vRight,vUp,vToward;
void main(){
#include <logdepthbuf_fragment>
if(vAlpha<.001)discard;
vec2 xy=gl_PointCoord*2.-1.;float r2=dot(xy,xy);if(r2>1.)discard;
float span=sqrt(1.-r2),ds=2.*span/12.,trans=1.;vec3 light=vec3(0.);
float mode=vShape.y,q=vShape.z,arms=vShape.w;
for(int j=0;j<12;j++){
vec3 p=vRight*xy.x-vUp*xy.y+vToward*(span-(float(j)+.5)*ds);
float r=length(p.xz),a=atan(p.z+1e-6,p.x+1e-6),h=abs(p.y);
float arm=exp(-pow(sin((a-log(max(r,.04))*(3.+vSeed)*.8)*max(1.,arms)*.5)/.3,2.));
float disk=exp(-r*4.5-h*22.)*(.25+arm*.9),bulge=exp(-length(p*vec3(1.,1.7,1.))*14.);
float stellar=disk+bulge,dust=exp(-r*3.-h*60.)*arm*.6;vec3 color=mix(vec3(1.,.82,.58),vec3(.48,.68,1.),arm*r);
if(mode>1.5&&mode<2.5||mode>3.5&&mode<4.5){stellar=exp(-pow(length(p/vec3(1.,sqrt(q),max(.1,q))),.8)*7.);dust=0.;color=vec3(1.,.8,.54);}
if(mode>2.5&&mode<3.5||mode>5.5){float knots=.4+.6*sin(p.x*15.+vSeed*12.)*sin(p.z*19.+vSeed*7.);stellar=exp(-length(p/vec3(1.,.35,max(.15,q)))*5.)*(.6+max(0.,knots));dust*=.25;color=mix(vec3(1.,.78,.5),vec3(.44,.69,1.),max(0.,knots));}
if(mode>.5&&mode<1.5){stellar+=exp(-length(p/vec3(.65,.06,.13))*5.);}
if(mode>4.5&&mode<5.5){stellar=exp(-r*5.-h*25.)*.35+bulge;dust=0.;color=vec3(1.,.84,.63);}
float extinction=stellar*.25+dust,alpha=1.-exp(-extinction*ds*4.);
light+=trans*color*stellar/max(.01,extinction)*alpha;trans*=1.-alpha;
}
// Visibility floor for unresolved catalogue markers, not calibrated photometry.
float alpha=max(1.-trans,.32*exp(-r2*5.))*vAlpha;if(alpha<.001)discard;
float gain=(mode>3.5&&mode<4.5)?.6:1.4;
vec3 population=(mode>1.5&&mode<2.5||mode>3.5&&mode<5.5)?vec3(1.,.8,.56):vec3(.56,.72,1.);
gl_FragColor=vec4(mix(population,light/max(.001,1.-trans),.7)*gain,alpha);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`;
export function catalogueShape(model: GalaxyModel): [number, number, number, number] {
  const kind = model.morphology,
    mode = /blue compact/i.test(model.type)
      ? 6
      : kind === "barred"
        ? 1
        : kind === "elliptical"
          ? 2
          : kind === "dwarf"
            ? 4
            : kind === "irregular" || kind === "starburst"
              ? 3
              : kind === "lenticular"
                ? 5
                : 0;
  return [
    model.diskRadius,
    mode,
    Math.max(
      0.06,
      model.projectedAxisRatio ?? Math.cos(((model.inclination ?? 0) * Math.PI) / 180),
    ),
    model.arms,
  ];
}
export function catalogueOrientation(model: GalaxyModel) {
  return galaxyOrientation(model).toArray();
}
