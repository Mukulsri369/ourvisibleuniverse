import { STRUCTURE_MASK_GLSL } from "./structure-masks";

/**
 * Survey galaxies as resolved, view-dependent ellipses. Each disk is oriented in 3D so that,
 * from Earth, it reproduces the measured axis ratio and (where known) position angle; from other
 * viewpoints the projected shape follows from that orientation. Surface brightness is distance
 * independent; below a pixel, flux is conserved and a labelled visibility floor keeps every
 * galaxy faintly visible. Profiles, arms and dust lanes are display reconstructions.
 */
export const STRUCTURE_GALAXY_VERTEX = /* glsl */ `
#include <common>
#include <logdepthbuf_pars_vertex>
${STRUCTURE_MASK_GLSL}
attribute vec3 aNormal;
attribute vec4 aProps;
attribute vec4 aShape; // intrinsic flattening, flags, survey-edge fade
uniform float uExtent, uPixelScale, uExposure, uFloor, uMaxPx, uFade, uSlab;
uniform vec2 uLogLum, uLogRadius;
varying vec2 vMajor;
varying float vQ, vBulge, vRed, vGain, vPx, vSeed, vClose;
void main() {
  vec4 world = modelMatrix * vec4(position * uExtent, 1.0);
  vec4 mv = viewMatrix * world;
  gl_Position = projectionMatrix * mv;
  #include <logdepthbuf_vertex>
  float visibility = uFade < 0.002 ? 0.0 : structureVisibility(world.xyz, -1.0);
  if (visibility < 0.002) {
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    gl_PointSize = 1.0;
    vGain = 0.0;
    return;
  }
  float dist = max(-mv.z, 1.0);
  // Void display: keep a slab through the centre, across the line of sight (survey-slice style).
  float slab = uSlab > 0.0 ? 1.0 - smoothstep(0.35, 0.5, abs(mv.z - (viewMatrix * vec4(modelMatrix[3].xyz, 1.0)).z) / uSlab) : 1.0;
  float L = pow(10.0, mix(uLogLum.x, uLogLum.y, aProps.x));
  float R90 = pow(10.0, mix(uLogRadius.x, uLogRadius.y, aProps.y)) * 3261.56;
  vec3 n = normalize(mat3(viewMatrix) * normalize(aNormal));
  vec3 toCam = normalize(-mv.xyz);
  float c = dot(n, toCam);
  float qInt = max(aShape.x, 0.05);
  float q = sqrt(c * c + qInt * qInt * (1.0 - c * c));
  vec3 sky = n - c * toCam;
  vec2 minor = dot(sky.xy, sky.xy) > 1e-10 ? normalize(sky.xy) : vec2(0.0, 1.0);
  vMajor = vec2(-minor.y, minor.x);
  // Sprite edge at 1.3 R90. Galaxies only a few pixels across are drawn up to 2.2x their
  // measured size so their shapes stay visible (display choice); close up they are true size.
  float physical = 2.6 * R90 / dist * uPixelScale;
  float diameter = physical * mix(2.2, 1.0, smoothstep(4.0, 48.0, physical));
  float size = clamp(diameter, 2.0, uMaxPx);
  vQ = max(q, min(1.0, 1.6 / size));
  float coverage = min(1.0, (diameter * diameter * q) / (size * size * vQ));
  // Surface brightness relative to an L* galaxy with R90 = 12 kpc (39,000 ly).
  float sb = L * 1.52e9 / (R90 * R90);
  vGain = uFade * visibility * slab * aShape.z * (uExposure * sb * coverage + uFloor * sqrt(L) * (1.0 - smoothstep(0.2, 1.0, coverage)));
  gl_PointSize = size;
  vPx = size;
  vClose = smoothstep(18.0, 60.0, size);
  vBulge = aProps.w;
  vRed = aProps.z;
  vSeed = fract(dot(position, vec3(12.9898, 78.233, 37.719)) * 43.7585);
}`;

export const STRUCTURE_GALAXY_FRAGMENT = /* glsl */ `
#include <logdepthbuf_pars_fragment>
varying vec2 vMajor;
varying float vQ, vBulge, vRed, vGain, vPx, vSeed, vClose;
void main() {
  #include <logdepthbuf_fragment>
  if (vGain < 1e-5) discard;
  vec2 p = gl_PointCoord * 2.0 - 1.0;
  p.y = -p.y;
  vec2 e = vec2(dot(p, vMajor), dot(p, vec2(-vMajor.y, vMajor.x)) / vQ);
  float r = length(e);
  if (r >= 1.0) discard;
  float rr = r * 1.3; // radius in units of R90
  float core = exp(-rr * rr / 0.0049);
  float halo = exp(-rr * 5.5);
  float disk = exp(-rr * 3.89);
  if (vClose > 0.0) {
    // Close up: two-armed logarithmic spiral with a random phase, and a mid-plane dust
    // lane on inclined disks. Generic appearance, not each galaxy's measured structure.
    float theta = atan(e.y, e.x);
    float arms = 0.55 + 0.45 * cos(2.0 * theta - 5.5 * log(rr + 0.06) + vSeed * 6.2832);
    disk *= mix(1.0, arms, vClose * smoothstep(0.08, 0.3, rr) * (1.0 - vBulge));
    float lane = exp(-pow(e.y * vQ / 0.05, 2.0)) * smoothstep(0.55, 0.15, vQ) * smoothstep(0.04, 0.25, rr);
    disk *= 1.0 - 0.6 * lane * vClose * (1.0 - vBulge);
  }
  vec3 warm = vec3(1.0, 0.74, 0.47);
  vec3 diskColour = mix(vec3(0.5, 0.66, 1.0), vec3(1.0, 0.84, 0.64), vRed);
  float spheroid = smoothstep(0.55, 0.85, vBulge);
  vec3 light = warm * (core * (0.35 + 0.65 * vBulge) + halo * 0.6 * spheroid)
    + diskColour * disk * (1.0 - spheroid) * (1.0 - 0.5 * vBulge);
  // Tiny sprites: a smooth footprint avoids shimmering single-pixel profiles.
  float soft = exp(-r * r * 3.5);
  light = mix(mix(warm, diskColour, 1.0 - vBulge) * soft, light, smoothstep(2.5, 6.0, vPx));
  gl_FragColor = vec4(light * vGain, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

/** Smoothed light of the plotted galaxies: soft additive splats on a lattice. */
export const STRUCTURE_GLOW_VERTEX = /* glsl */ `
#include <common>
#include <logdepthbuf_pars_vertex>
${STRUCTURE_MASK_GLSL}
attribute vec2 aSplat;
uniform float uExtent, uPixelScale, uSplatRadius, uGlow, uFade, uMaxSplatPx, uSlab;
varying vec3 vColour;
varying float vI;
void main() {
  vec4 world = modelMatrix * vec4(position * uExtent, 1.0);
  vec4 mv = viewMatrix * world;
  gl_Position = projectionMatrix * mv;
  #include <logdepthbuf_vertex>
  float size = 2.0 * uSplatRadius / max(-mv.z, 1.0) * uPixelScale;
  float visibility = uFade < 0.002 || -mv.z < uSplatRadius * 0.5 ? 0.0 : structureVisibility(world.xyz, -1.0);
  if (visibility < 0.002) {
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    gl_PointSize = 1.0;
    vI = 0.0;
    return;
  }
  // Splats larger than the cap (near the camera) fade out instead of smearing the view.
  float slab = uSlab > 0.0 ? 1.0 - smoothstep(0.35, 0.5, abs(mv.z - (viewMatrix * vec4(modelMatrix[3].xyz, 1.0)).z) / uSlab) : 1.0;
  vI = pow(aSplat.x, 1.6) * uGlow * uFade * visibility * slab * (1.0 - smoothstep(0.45, 1.0, size / uMaxSplatPx));
  gl_PointSize = clamp(size, 1.5, uMaxSplatPx);
  vColour = mix(vec3(0.6, 0.72, 1.0), vec3(1.0, 0.83, 0.64), aSplat.y);
}`;

export const STRUCTURE_GLOW_FRAGMENT = /* glsl */ `
#include <logdepthbuf_pars_fragment>
varying vec3 vColour;
varying float vI;
void main() {
  #include <logdepthbuf_fragment>
  vec2 p = gl_PointCoord * 2.0 - 1.0;
  float r2 = dot(p, p);
  if (r2 >= 1.0 || vI < 1e-5) discard;
  float w = (1.0 - r2) * (1.0 - r2);
  gl_FragColor = vec4(vColour * (vI * w), 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;
