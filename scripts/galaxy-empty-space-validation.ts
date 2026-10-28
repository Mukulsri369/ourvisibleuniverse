import assert from "node:assert/strict";
// Numerical regression for the shader's padded occupancy/DDA skip rule.
const n = 64,
  ny = 128,
  cellSize = 4,
  ox = n / cellSize,
  oy = ny / cellSize;
const field = new Float32Array(n * ny * n),
  bounds = new Float32Array(ox * oy * ox);
let seed = 37;
const rand = () => {
  seed = (Math.imul(seed, 1664525) + 1013904223) | 0;
  return (seed >>> 0) / 4294967296;
};
const index = (x: number, y: number, z: number) => x + n * (y + ny * z);
for (let k = 0; k < 90; k++) {
  const cx = 8 + Math.floor(rand() * 48),
    cy = 48 + Math.floor(rand() * 32),
    cz = 8 + Math.floor(rand() * 48);
  for (let z = -1; z <= 1; z++)
    for (let y = -1; y <= 1; y++)
      for (let x = -1; x <= 1; x++) field[index(cx + x, cy + y, cz + z)] = 0.1 + rand();
}
for (let z = 0; z < ox; z++)
  for (let y = 0; y < oy; y++)
    for (let x = 0; x < ox; x++) {
      let b = 0;
      for (let dz = -1; dz < 5; dz++)
        for (let dy = -1; dy < 5; dy++)
          for (let dx = -1; dx < 5; dx++)
            b = Math.max(
              b,
              field[
                index(
                  Math.max(0, Math.min(n - 1, x * 4 + dx)),
                  Math.max(0, Math.min(ny - 1, y * 4 + dy)),
                  Math.max(0, Math.min(n - 1, z * 4 + dz)),
                )
              ],
            );
      bounds[x + ox * (y + oy * z)] = b;
    }
function sample(p: number[]) {
  const f = p.map((v, k) => (v / 2.7 + 0.5) * (k === 1 ? ny : n) - 0.5),
    base = f.map(Math.floor),
    blend = f.map((v, k) => v - base[k]);
  let value = 0;
  for (let z = 0; z < 2; z++)
    for (let y = 0; y < 2; y++)
      for (let x = 0; x < 2; x++)
        value +=
          field[
            index(
              Math.max(0, Math.min(n - 1, base[0] + x)),
              Math.max(0, Math.min(ny - 1, base[1] + y)),
              Math.max(0, Math.min(n - 1, base[2] + z)),
            )
          ] *
          (x ? blend[0] : 1 - blend[0]) *
          (y ? blend[1] : 1 - blend[1]) *
          (z ? blend[2] : 1 - blend[2]);
  return value;
}
let skipped = 0;
for (let ray = 0; ray < 400; ray++) {
  const eye = [(rand() - 0.5) * 0.8, (rand() - 0.5) * 0.3, (rand() - 0.5) * 0.8],
    direction = [rand() - 0.5, rand() - 0.5, rand() - 0.5];
  const norm = Math.hypot(...direction);
  direction.forEach((v, k) => (direction[k] = v / norm));
  const ds = 2.7 / 80,
    jitter = rand() * 0.35 - 0.175;
  for (let i = 0; i < 80; i++) {
    const p = eye.map((v, k) => v + direction[k] * (i + 0.5 + jitter) * ds);
    const cell = p.map((v, k) =>
      Math.max(
        0,
        Math.min((k === 1 ? oy : ox) - 1, Math.floor((v / 2.7 + 0.5) * (k === 1 ? oy : ox))),
      ),
    );
    if (bounds[cell[0] + ox * (cell[1] + oy * cell[2])] >= 1e-7) continue;
    const travel = p.map(
      (v, k) =>
        (((cell[k] + (direction[k] >= 0 ? 1 : 0)) / (k === 1 ? oy : ox) - 0.5) * 2.7 - v) /
        (direction[k] + 1e-12),
    );
    const advance = Math.max(0, Math.floor(Math.max(0, Math.min(...travel)) / ds) - 1);
    for (let j = i; j <= Math.min(79, i + advance); j++) {
      const point = eye.map((v, k) => v + direction[k] * (j + 0.5 + jitter) * ds);
      assert(sample(point) < 1e-7, "Empty-space skip crossed nonempty interpolated density");
      skipped++;
    }
    i += advance;
  }
}
assert(skipped > 1000);
console.log(
  "PASS: " +
    skipped +
    " skipped ray samples contain no interpolated light or dust; padded cell bounds preserve occupied samples",
);
