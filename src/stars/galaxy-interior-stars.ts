import * as THREE from "three";
import type { GalaxyModel } from "./galaxy-models";
/** Seeded representative populations, not measured individual star positions. */
export function makeGalaxyInteriorStars(model: GalaxyModel, count = 100000) {
  let seed = 2166136261;
  for (const c of model.name) seed = Math.imul(seed ^ c.charCodeAt(0), 16777619);
  const rand = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) | 0;
    return (seed >>> 0) / 4294967296;
  };
  const p = new Float32Array(count * 3),
    c = new Float32Array(count * 3),
    light = new Float32Array(count),
    phase = new Float32Array(count);
  const spheroid = model.morphology === "elliptical" || model.morphology === "dwarf",
    irregular = model.morphology === "irregular" || model.morphology === "starburst",
    ring = model.morphology === "ring";
  for (let i = 0; i < count; i++) {
    let r = Math.min(1.18, -Math.log(Math.max(0.001, 1 - rand() * 0.99)) / 4),
      a = rand() * Math.PI * 2,
      y = (rand() + rand() + rand() - 1.5) * (0.012 + 0.025 * r),
      x = 0,
      z = 0;
    const bulge = !irregular && !ring && rand() < 0.2;
    if (spheroid || bulge) {
      r *= bulge ? 0.34 : 1;
      const mu = rand() * 2 - 1;
      x = Math.cos(a) * r * Math.sqrt(1 - mu * mu);
      z = Math.sin(a) * r * Math.sqrt(1 - mu * mu);
      y = mu * r * (spheroid ? 0.7 : 0.65);
    } else if (irregular) {
      const k = Math.floor(rand() * 7),
        angle = k * 2.399;
      const spread = 0.07 + rand() * 0.13;
      x = Math.cos(angle) * 0.4 + (rand() + rand() - 1) * spread;
      z = Math.sin(angle) * 0.3 + (rand() + rand() - 1) * spread;
      y = (rand() + rand() - 1) * 0.08;
    } else {
      if (ring) r = 0.68 + (rand() + rand() + rand() - 1.5) * 0.055;
      else if (rand() < 0.7)
        a =
          (Math.floor(rand() * Math.max(2, model.arms)) * Math.PI * 2) / Math.max(2, model.arms) +
          Math.log(Math.max(r, 0.06)) / Math.tan((Math.max(8, model.pitchDeg) * Math.PI) / 180) +
          (rand() + rand() - 1) * 0.36;
      x = Math.cos(a) * r;
      z = Math.sin(a) * r;
      if (model.morphology === "barred" && r < model.barLength / model.diskRadius && rand() < 0.6) {
        x = (((rand() - 0.5) * model.barLength) / model.diskRadius) * 2;
        z = (rand() + rand() - 1) * 0.035;
      }
      if (model.morphology === "interacting") {
        const side = rand() < 0.5 ? 1 : -1;
        x = x * 0.55 + side * 0.25;
        z = z * 0.6 + side * 0.1;
        if (rand() < 0.15) {
          const t = rand() * Math.PI;
          x = Math.cos(t) * 0.8;
          z = Math.sin(t) * (0.4 + (0.3 * t) / Math.PI);
        }
      }
    }
    p[i * 3] = x;
    p[i * 3 + 1] = y;
    p[i * 3 + 2] = z;
    const young = !spheroid && !bulge && rand() < (irregular ? 0.62 : ring ? 0.7 : 0.28);
    const color = young ? model.youngColor : model.oldColor;
    const warmth = rand();
    for (let k = 0; k < 3; k++) c[i * 3 + k] = color[k] * (0.75 + warmth * 0.25);
    light[i] = 0.12 + Math.pow(rand(), 9) * 3;
    phase[i] = rand() * Math.PI * 2;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(p, 3));
  g.setAttribute("color", new THREE.BufferAttribute(c, 3));
  g.setAttribute("aLum", new THREE.BufferAttribute(light, 1));
  g.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));
  g.computeBoundingSphere();
  return g;
}
