import * as THREE from "three";
/** Screen-space picking runs on clicks only; pointer-move handlers are deliberately absent. */
export function pickSurveyGalaxy(
  object: THREE.Points | null,
  raycaster: THREE.Raycaster,
  size: { width: number; height: number },
  hits: THREE.Intersection[],
) {
  if (!object?.visible || !raycaster.camera) return;
  const camera = raycaster.camera,
    positions = object.geometry.getAttribute("position"),
    seeds = object.geometry.getAttribute("seed");
  if (!positions || !seeds) return;
  object.updateWorldMatrix(true, false);
  camera.updateMatrixWorld();
  const cursor = raycaster.ray.at(1, new THREE.Vector3()).project(camera),
    world = new THREE.Vector3(),
    view = new THREE.Vector3(),
    bestPoint = new THREE.Vector3();
  let best = Infinity,
    index = -1,
    distance = Infinity;
  for (let i = 0; i < positions.count; i++) {
    world.fromBufferAttribute(positions, i).applyMatrix4(object.matrixWorld);
    view.copy(world).applyMatrix4(camera.matrixWorldInverse);
    if (view.z >= 0) continue;
    const depth = -view.z;
    view.applyMatrix4(camera.projectionMatrix);
    if (view.z > 1 || view.z < -1) continue;
    const seed = seeds.getX(i),
      physical = 35000 * (0.55 + ((seed * 17.3) % 1)),
      radius = Math.max(
        5,
        Math.min(
          48,
          ((physical * size.height * camera.projectionMatrix.elements[5]) / depth) * 0.5,
        ),
      );
    const dx = (view.x - cursor.x) * size.width * 0.5,
      dy = (view.y - cursor.y) * size.height * 0.5,
      score = (dx * dx + dy * dy) / (radius * radius);
    if (score < 1 && score < best) {
      best = score;
      index = i;
      distance = world.distanceTo(raycaster.ray.origin);
      bestPoint.copy(world);
    }
  }
  if (index >= 0) hits.push({ distance, point: bestPoint, object, index });
}
