import * as THREE from "three";
import type { ExoPlanet } from "./exosystems";

// Seeded illustrative surfaces: catalogue radii, temperatures and orbits remain
// unchanged. These maps do not claim resolved observations of distant worlds.
export function makeExoplanetMaps(p: ExoPlanet, seed: number, mode: number) {
  const width = 512,
    height = 256,
    albedo = new Uint8Array(width * height * 4),
    detail = new Uint8Array(width * height * 4);
  const hash = (x: number, y: number) => {
    let n = Math.imul(x + Math.floor(seed * 997), 374761393) ^ Math.imul(y, 668265263);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return (n >>> 0) / 4294967295;
  };
  const noise = (x: number, y: number, period: number) => {
    const ix = Math.floor(x),
      iy = Math.floor(y),
      fx = x - ix,
      fy = y - iy;
    const u = fx * fx * (3 - 2 * fx),
      v = fy * fy * (3 - 2 * fy);
    const h = (a: number, b: number) => hash(((a % period) + period) % period, b);
    return THREE.MathUtils.lerp(
      THREE.MathUtils.lerp(h(ix, iy), h(ix + 1, iy), u),
      THREE.MathUtils.lerp(h(ix, iy + 1), h(ix + 1, iy + 1), u),
      v,
    );
  };
  const fbm = (u: number, v: number) =>
    noise(u * 8, v * 8, 8) * 0.55 +
    noise(u * 16, v * 16, 16) * 0.27 +
    noise(u * 32, v * 32, 32) * 0.13 +
    noise(u * 64, v * 64, 64) * 0.05;
  const base = new THREE.Color(p.color).convertLinearToSRGB();
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const u = x / width,
        v = y / height,
        lat = (v - 0.5) * Math.PI,
        n = fbm(u, v),
        fine = noise(u * 128, v * 128, 128);
      let r = 0,
        g = 0,
        b = 0,
        h = n,
        cloud = 0,
        ocean = 0;
      if (mode === 3 || mode === 4) {
        const warp = fbm(u + 0.07 * Math.sin(v * 23), v) * 0.22;
        const band = 0.5 + 0.5 * Math.sin((v + warp * 0.15) * (mode === 3 ? 110 : 58));
        const grain = 0.75 + 0.25 * fine;
        const light = (0.5 + 0.5 * band) * grain;
        r = base.r * light;
        g = base.g * light;
        b = base.b * light;
        const su = ((u - (0.22 + (seed % 1) * 0.4) + 1.5) % 1) - 0.5,
          sv = v - 0.59;
        const d = Math.hypot(su * 10, sv * 27),
          vortex = Math.sin(Math.atan2(sv * 27, su * 10) * 3 + d * 17 + n * 6);
        const storm = Math.max(0, 1 - d);
        r = THREE.MathUtils.lerp(r, base.r * 0.9, storm);
        g *= 1 - storm * 0.32;
        b *= 1 - storm * 0.45;
        r += storm * vortex * 0.035;
        h = band * 0.4 + fine * 0.1;
      } else if (mode === 1) {
        const land = THREE.MathUtils.smoothstep(n, 0.5, 0.545),
          ice = THREE.MathUtils.smoothstep(Math.abs(Math.sin(lat)) + n * 0.12, 0.94, 1.03);
        ocean = (1 - land) * (1 - ice);
        const dry = THREE.MathUtils.smoothstep(n, 0.58, 0.74);
        r = THREE.MathUtils.lerp(0.018, 0.18 + dry * 0.28, land);
        g = THREE.MathUtils.lerp(0.075, 0.23 + dry * 0.1, land);
        b = THREE.MathUtils.lerp(0.15, 0.1 + dry * 0.15, land);
        r = THREE.MathUtils.lerp(r, 0.85, ice);
        g = THREE.MathUtils.lerp(g, 0.88, ice);
        b = THREE.MathUtils.lerp(b, 0.9, ice);
        cloud =
          THREE.MathUtils.smoothstep(
            fbm(u * 2 + 0.09 * Math.sin(v * 23), v * 2 + 0.13),
            0.48,
            0.66,
          ) *
          (0.48 + 0.52 * noise(u * 256 + n * 12, v * 256, 256));
        h = land * n;
      } else {
        const strata = 0.82 + 0.18 * Math.sin(n * 38 + fine * 2);
        const light = (0.38 + n * 0.85) * strata;
        r = base.r * light;
        g = base.g * light;
        b = base.b * light;
        if (mode === 2) {
          r = 0.12 + n * 0.16;
          g = 0.075 + n * 0.1;
          b = 0.06 + n * 0.09;
        }
      }
      const i = (y * width + x) * 4;
      albedo[i] = Math.min(255, Math.max(0, r * 255));
      albedo[i + 1] = Math.min(255, Math.max(0, g * 255));
      albedo[i + 2] = Math.min(255, Math.max(0, b * 255));
      albedo[i + 3] = 255;
      detail[i] = h * 255;
      detail[i + 1] = cloud * 255;
      detail[i + 2] = ocean * 255;
      detail[i + 3] = 255;
    }
  if (mode === 0) {
    for (let k = 0; k < 75; k++) {
      const cx = Math.floor(hash(k, 71) * width),
        cy = Math.floor((0.12 + hash(k, 19) * 0.76) * height),
        radius = 2 + hash(k, 37) * 13;
      const stretch = 1 / Math.max(0.35, Math.sin((cy / height) * Math.PI));
      for (let dy = -Math.ceil(radius * 1.18); dy <= radius * 1.18; dy++)
        for (let dx = -Math.ceil(radius * stretch * 1.18); dx <= radius * stretch * 1.18; dx++) {
          const yy = cy + dy;
          if (yy < 0 || yy >= height) continue;
          const d = Math.hypot(dx / stretch, dy) / radius;
          if (d > 1.16) continue;
          const i = (yy * width + ((cx + dx + width) % width)) * 4;
          const bowl = Math.max(0, 1 - d * d) * 0.1,
            rim = Math.exp(-Math.pow((d - 0.92) / 0.1, 2)) * 0.07;
          detail[i] = Math.max(0, Math.min(255, detail[i] + (rim - bowl) * 255));
          const shade = 1 - bowl * 0.8 + rim * 0.65;
          albedo[i] *= shade;
          albedo[i + 1] *= shade;
          albedo[i + 2] *= shade;
        }
    }
  }
  const texture = (data: Uint8Array, srgb: boolean) => {
    const t = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
    t.wrapS = THREE.RepeatWrapping;
    t.magFilter = THREE.LinearFilter;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.generateMipmaps = true;
    t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    t.needsUpdate = true;
    return t;
  };
  return { albedo: texture(albedo, true), detail: texture(detail, false) };
}
