import { STRUCTURE_MASK_GLSL } from "./cosmic-structures/structure-masks";

/** Small additive points for the illustrative survey cloud and the simulation volume. */
export const COSMIC_POINT_VERTEX = /* glsl */ `
#include <common>
#include <logdepthbuf_pars_vertex>
varying vec3 vColor;varying float vSeed;
void main(){vColor=color;vSeed=fract(dot(position,vec3(.000013,.000023,.000031)));vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;gl_PointSize=3.;
#include <logdepthbuf_vertex>
}`;
export const COSMIC_POINT_FRAGMENT = /* glsl */ `
#include <logdepthbuf_pars_fragment>
varying vec3 vColor;varying float vSeed;
void main(){
#include <logdepthbuf_fragment>
vec2 p=gl_PointCoord*2.-1.;float angle=vSeed*6.283;mat2 rot=mat2(cos(angle),-sin(angle),sin(angle),cos(angle));p=rot*p;p.y*=1.+vSeed;float r=dot(p,p);if(r>1.)discard;gl_FragColor=vec4(mix(vColor,vec3(.85,.84,.82),.35)*3.,exp(-r*4.)*.65);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`;

/**
 * Illustrative survey-cloud variant: it cross-fades out inside mounted cosmic-structure fields
 * (drawn there from real survey data) and fades out entirely while a structure is in view.
 */
export const COSMIC_SURVEY_POINT_VERTEX = COSMIC_POINT_VERTEX.replace(
  "varying vec3 vColor;",
  STRUCTURE_MASK_GLSL + "uniform float uCloudFade;varying float vVisible;varying vec3 vColor;",
).replace(
  "gl_PointSize=3.;",
  "gl_PointSize=3.;vVisible=uCloudFade*structureVisibility((modelMatrix*vec4(position,1.)).xyz,-1.);if(vVisible<.002)gl_Position=vec4(2.,2.,2.,1.);",
);
export const COSMIC_SURVEY_POINT_FRAGMENT = COSMIC_POINT_FRAGMENT.replace(
  "varying vec3 vColor;",
  "varying float vVisible;varying vec3 vColor;",
).replace("exp(-r*4.)*.65)", "exp(-r*4.)*.65*vVisible)");
