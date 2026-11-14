import * as THREE from "three";

/**
 * Volumes covered by mounted cosmic-structure fields. Layers that would draw the same
 * galaxies again (the all-sky 2MRS field, the illustrative survey cloud and larger
 * structure fields) hide their points inside these volumes. Read each frame, no React state.
 */
export type StructureMask = {
  id: string;
  /** Smaller fields win where fields overlap. */
  extentLy: number;
  kind: "cone" | "sphere";
  direction: readonly [number, number, number];
  cosAngle: number;
  distanceLy: readonly [number, number];
  czKmS: readonly [number, number];
  centreLy: readonly [number, number, number];
  sphereRadiusLy: number;
};

export const MAX_STRUCTURE_MASKS = 8;
const active = new Map<string, StructureMask>();
/** How strongly a structure field is in view (0-1); the illustrative survey cloud fades by it. */
export const structureFocus = { value: 0, frame: -1 };

export function setStructureMask(mask: StructureMask) {
  active.set(mask.id, mask);
}
export function clearStructureMask(id: string) {
  active.delete(id);
}
export function activeStructureMasks() {
  return active;
}

/** Uniforms shared by every masked material. */
export function createMaskUniforms() {
  return {
    uMaskCount: { value: 0 },
    uMaskA: { value: Array.from({ length: MAX_STRUCTURE_MASKS }, () => new THREE.Vector4()) },
    uMaskB: { value: Array.from({ length: MAX_STRUCTURE_MASKS }, () => new THREE.Vector4()) },
  };
}

/**
 * Fill mask uniforms. Cone: A = (direction, cos angle), B = (min distance, max distance,
 * min cz, max cz). Sphere: A = (centre, radius), B = (0, 0, 0, -1).
 * `except` skips a field's own mask; `largerThan` keeps only smaller (higher-priority) fields.
 */
export function updateMaskUniforms(
  uniforms: ReturnType<typeof createMaskUniforms>,
  except?: string,
  largerThan = Infinity,
) {
  let n = 0;
  for (const m of active.values()) {
    if (n >= MAX_STRUCTURE_MASKS) break;
    if (m.id === except || m.extentLy >= largerThan) continue;
    if (m.kind === "sphere") {
      uniforms.uMaskA.value[n].set(m.centreLy[0], m.centreLy[1], m.centreLy[2], m.sphereRadiusLy);
      uniforms.uMaskB.value[n].set(0, 0, 0, -1);
    } else {
      uniforms.uMaskA.value[n].set(m.direction[0], m.direction[1], m.direction[2], m.cosAngle);
      uniforms.uMaskB.value[n].set(m.distanceLy[0], m.distanceLy[1], m.czKmS[0], m.czKmS[1]);
    }
    n++;
  }
  uniforms.uMaskCount.value = n;
}

/**
 * GLSL: structureVisibility(world, cz) is 1 outside every mask and 0 well inside, with soft
 * edges so layers cross-fade. Pass cz >= 0 to test cone masks by recession velocity (layers
 * placed by cz/H0); pass cz < 0 to test them by distance (layers in scene distance).
 */
export const STRUCTURE_MASK_GLSL = /* glsl */ `
#define MAX_STRUCTURE_MASKS ${MAX_STRUCTURE_MASKS}
uniform int uMaskCount;
uniform vec4 uMaskA[MAX_STRUCTURE_MASKS];
uniform vec4 uMaskB[MAX_STRUCTURE_MASKS];
float structureVisibility(vec3 world, float cz) {
  float d = length(world);
  vec3 dir = world / max(d, 1.0);
  float visible = 1.0;
  for (int i = 0; i < MAX_STRUCTURE_MASKS; i++) {
    if (i >= uMaskCount) break;
    vec4 a = uMaskA[i], b = uMaskB[i];
    float inside;
    if (b.w < 0.0) {
      inside = smoothstep(0.0, 0.2, 1.0 - length(world - a.xyz) / a.w);
    } else {
      float angle = acos(clamp(a.w, -1.0, 1.0));
      float margin = (dot(dir, a.xyz) - a.w) / max(sin(angle), 0.05);
      vec2 range = cz >= 0.0 ? b.zw : b.xy;
      float x = cz >= 0.0 ? cz : d;
      float depth = min(x - range.x, range.y - x) / max(range.y - range.x, 1.0);
      inside = smoothstep(0.0, 0.2 * angle, margin) * smoothstep(0.0, 0.1, depth);
    }
    visible *= 1.0 - inside;
  }
  return visible;
}
`;
