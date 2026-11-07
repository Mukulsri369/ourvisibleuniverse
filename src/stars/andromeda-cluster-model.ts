/** Deterministic artistic cluster populations, not a catalogue of individual stars. */
export function capClusterPointShader(shader: { vertexShader: string }) {
  const marker = "#include <logdepthbuf_vertex>";
  if (!shader.vertexShader.includes(marker)) throw new Error("Unsupported cluster point shader");
  // Stellar population samples stay unresolved; never fill the viewport with nearby sprites.
  shader.vertexShader = shader.vertexShader.replace(
    marker,
    "gl_PointSize = min(gl_PointSize, 8.0);\n" + marker,
  );
}
export const clusterPointProgramKey = () => "m31-cluster-point-cap-v1";

export function clusterPopulation(kind: "globular" | "association" | "nuclear", count = 1600) {
  if (!Number.isInteger(count) || count < 1 || count > 5000)
    throw new Error("Invalid cluster budget");
  let seed = kind === "globular" ? 3101 : kind === "nuclear" ? 3303 : 3206;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return (seed + 0.5) / 4294967296;
  };
  const positions = new Float32Array(count * 3),
    colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    if (kind === "nuclear") {
      // A static, schematic nested population, not fitted M31 orbital elements.
      // Uniform mean anomaly weights eccentric orbits toward apocentre (P1).
      const blue = i % 5 === 0;
      const a = blue ? 0.012 + 0.035 * Math.sqrt(random()) : 0.06 + 0.2 * Math.sqrt(random());
      const e = blue ? 0 : 0.6;
      const mean = 2 * Math.PI * random();
      let eccentric = mean;
      for (let step = 0; step < 8; step++)
        eccentric -= (eccentric - e * Math.sin(eccentric) - mean) / (1 - e * Math.cos(eccentric));
      positions.set(
        [
          a * (Math.cos(eccentric) - e),
          (random() - 0.5) * a * 0.18,
          a * Math.sqrt(1 - e * e) * Math.sin(eccentric),
        ],
        i * 3,
      );
      colors.set(blue ? [0.48, 0.7, 1] : [1, 0.6 + 0.2 * random(), 0.32], i * 3);
      continue;
    }
    const u = random(),
      phi = 2 * Math.PI * random(),
      z = 2 * random() - 1;
    const r =
      kind === "globular"
        ? Math.min(0.48, 0.045 / Math.sqrt(Math.pow(0.001 + 0.998 * u, -2 / 3) - 1))
        : 0.36 * Math.cbrt(u);
    const xy = Math.sqrt(1 - z * z);
    positions.set(
      [r * xy * Math.cos(phi), r * z * (kind === "globular" ? 1 : 0.32), r * xy * Math.sin(phi)],
      i * 3,
    );
    const warm = random() > 0.18;
    colors.set(
      kind === "globular"
        ? warm
          ? [1, 0.78, 0.5]
          : [0.7, 0.83, 1]
        : [0.55 + 0.4 * random(), 0.75 + 0.2 * random(), 1],
      i * 3,
    );
  }
  return { positions, colors };
}
