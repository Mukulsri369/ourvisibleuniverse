import type { Matrix4 } from "three";

/** Actual mounted-detail opacity, so a lazy mount never leaves a black LOD gap. */
export const galaxyDetailAlpha = new Map<string, number>();

/** Name-keyed ownership for unresolved survey sources. */
export const galaxyPresentationAlpha = new Map<string, number>();

/**
 * Registered telescope-image footprint of the selected galaxy: a world → image
 * [u·w, v·w, w] matrix and the layer's current weight. Reconstructed light is
 * reduced only inside this footprint, so tails and halos beyond the photograph's
 * field of view keep their 3D reconstruction.
 */
export const galaxyObservedFootprint = new Map<string, { worldToImage: Matrix4; weight: number }>();
