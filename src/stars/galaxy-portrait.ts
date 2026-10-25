import * as THREE from "three";
import type { GalaxyModel } from "./galaxy-models";
/** Low-cost distant portrait of each catalogue morphology; detail uses the 3D volume. */
export function makeGalaxyPortrait(m: GalaxyModel) {
  const n = 128,
    pixels = new Uint8Array(n * n * 4);
  let seed = 0;
  for (const c of m.name) seed = (seed * 31 + c.charCodeAt(0)) % 997;
  const spiral = !["elliptical", "dwarf", "lenticular"].includes(m.morphology),
    ring = m.morphology === "ring",
    irregular = m.morphology === "irregular" || m.morphology === "starburst";
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      const px = (x + 0.5 - n / 2) / (n * 0.46),
        py = (y + 0.5 - n / 2) / (n * 0.46),
        r = Math.hypot(px, py),
        angle = Math.atan2(py, px);
      const grain =
        0.5 +
        0.5 * Math.sin(px * 157 + seed) * Math.sin(py * 191 - seed) * Math.sin((px + py) * 83);
      const phase =
        (angle -
          Math.log(Math.max(r, 0.045)) / Math.tan((Math.max(8, m.pitchDeg) * Math.PI) / 180)) *
        Math.max(2, m.arms);
      const arm = Math.exp(-Math.pow(Math.sin(phase / 2) / 0.22, 2));
      const dust = m.dustLanes ? Math.exp(-Math.pow(Math.sin((phase + 0.55) / 2) / 0.16, 2)) : 0;
      let density = Math.exp(-r * 3.5) * (spiral ? 0.25 + arm * 1.1 : 1);
      if (ring) density = Math.exp(-Math.pow((r - 0.65) / 0.08, 2)) * 0.8;
      if (irregular) density *= 0.3 + grain * 1.6;
      const bulge = Math.exp(-Math.pow(r / Math.max(0.07, m.bulgeRadius / m.diskRadius), 0.75) * 3);
      const young = spiral ? arm * Math.max(0, r - 0.1) : 0;
      const fade = 1 - THREE.MathUtils.smoothstep(r, 0.8, 1.08),
        opacity = Math.min(1, (density * 2.4 + bulge * 3) * fade);
      const light = (0.75 + grain * 0.25) * (1 - dust * 0.72);
      const i = (y * n + x) * 4;
      for (let c = 0; c < 3; c++)
        pixels[i + c] = Math.min(
          255,
          (m.oldColor[c] * (1 - young * 0.3) + m.youngColor[c] * young * 0.3) * light * 255,
        );
      pixels[i + 3] = opacity * 255;
    }
  const t = new THREE.DataTexture(pixels, n, n);
  t.colorSpace = THREE.SRGBColorSpace;
  t.magFilter = THREE.LinearFilter;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.generateMipmaps = true;
  t.needsUpdate = true;
  return t;
}
