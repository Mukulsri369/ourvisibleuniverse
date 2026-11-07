import * as THREE from "three";
export type GalaxySpatialItem = { position: THREE.Vector3; radius: number };
type Node = { box: THREE.Box3; indices?: number[]; children?: Node[] };
/** Hierarchical CPU visibility index. Close pairs remain separate catalogue identities. */
export class GalaxySpatialIndex {
  readonly root: Node;
  constructor(
    readonly items: readonly GalaxySpatialItem[],
    leafSize = 24,
  ) {
    const build = (indices: number[], depth: number): Node => {
      const box = new THREE.Box3();
      for (const i of indices) {
        const p = items[i].position,
          r = items[i].radius;
        box.expandByPoint(new THREE.Vector3(p.x - r, p.y - r, p.z - r));
        box.expandByPoint(new THREE.Vector3(p.x + r, p.y + r, p.z + r));
      }
      if (indices.length <= leafSize || depth >= 20) return { box, indices };
      const center = box.getCenter(new THREE.Vector3()),
        buckets = Array.from({ length: 8 }, () => [] as number[]);
      for (const i of indices) {
        const p = items[i].position;
        buckets[
          (p.x >= center.x ? 1 : 0) | (p.y >= center.y ? 2 : 0) | (p.z >= center.z ? 4 : 0)
        ].push(i);
      }
      if (buckets.some((b) => b.length === indices.length)) return { box, indices };
      return { box, children: buckets.filter((b) => b.length).map((b) => build(b, depth + 1)) };
    };
    this.root = build(
      items.map((_, i) => i),
      0,
    );
  }
  query(frustum: THREE.Frustum): number[] {
    const result: number[] = [];
    const visit = (node: Node) => {
      if (!frustum.intersectsBox(node.box)) return;
      if (node.indices) {
        for (const i of node.indices) {
          const item = this.items[i];
          if (frustum.intersectsSphere(new THREE.Sphere(item.position, item.radius)))
            result.push(i);
        }
      } else node.children?.forEach(visit);
    };
    visit(this.root);
    return result;
  }
}
export function resolvedGalaxyIndices(
  index: GalaxySpatialIndex,
  camera: THREE.PerspectiveCamera,
  height: number,
  budget: number,
  preferred: readonly number[] = [],
): number[] {
  const frustum = new THREE.Frustum().setFromProjectionMatrix(
    new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse),
  );
  const score = (i: number) =>
    index.items[i].radius /
    Math.max(index.items[i].radius * 0.1, camera.position.distanceTo(index.items[i].position));
  const visible = index
    .query(frustum)
    .filter((i) => (score(i) * height) / Math.tan((camera.fov * Math.PI) / 360) > 12)
    .sort((a, b) => score(b) - score(a) || a - b);
  return [...new Set([...preferred.filter((i) => i >= 0), ...visible])].slice(
    0,
    Math.max(0, Math.floor(budget)),
  );
}
