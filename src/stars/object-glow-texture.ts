import * as THREE from "three";
/** Dependency-free fallback also works when a browser cannot allocate a 2D canvas. */
export function fallbackGlowTexture() {
  const data = new Uint8Array(64 * 64 * 4);
  for (let y = 0; y < 64; y++)
    for (let x = 0; x < 64; x++) {
      const r = Math.hypot(x - 31.5, y - 31.5) / 32,
        i = (y * 64 + x) * 4;
      data[i] = data[i + 1] = data[i + 2] = 255;
      data[i + 3] = Math.round(255 * Math.max(0, Math.pow(1 - Math.min(r, 1), 2)));
    }
  const texture = new THREE.DataTexture(data, 64, 64, THREE.RGBAFormat);
  texture.minFilter = texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}
export function makeGlowTexture(
  createCanvas: () => HTMLCanvasElement = () => document.createElement("canvas"),
) {
  try {
    const canvas = createCanvas();
    canvas.width = canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (!ctx) return fallbackGlowTexture();
    const glow = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    glow.addColorStop(0, "rgba(255,255,255,1)");
    glow.addColorStop(0.18, "rgba(255,255,255,.82)");
    glow.addColorStop(0.55, "rgba(255,255,255,.22)");
    glow.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(canvas);
  } catch {
    return fallbackGlowTexture();
  }
}
