import * as THREE from "three";
import type { GalaxyModel } from "./galaxy-models";
import { makeGalaxyStarData } from "./galaxy-star-data";
export type GalaxyStarData = ReturnType<typeof makeGalaxyStarData>;
export function galaxyStarGeometry(data: GalaxyStarData) {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(data.positions, 3));
  g.setAttribute("color", new THREE.BufferAttribute(data.colors, 3));
  g.setAttribute("aLum", new THREE.BufferAttribute(data.luminosities, 1));
  g.setAttribute("aPhase", new THREE.BufferAttribute(data.phases, 1));
  g.computeBoundingSphere();
  return g;
}
/** Nested populations share the same deterministic prefix at every detail level. */
export function makeGalaxyInteriorStars(model: GalaxyModel, count = 100000) {
  return galaxyStarGeometry(makeGalaxyStarData(model, count));
}
