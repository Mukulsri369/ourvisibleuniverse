import * as THREE from "three";
import type { GalaxyModel } from "./galaxy-models";
import { galaxyStructure } from "./galaxy-structure";
/** Stable, nested representative populations; no measured star positions are implied. */
export function makeGalaxyInteriorStars(model: GalaxyModel, count = 100000) {
  let seed = 2166136261;
  for (const c of model.name) seed = Math.imul(seed ^ c.charCodeAt(0), 16777619);
  const rand = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) | 0;
    return (seed >>> 0) / 4294967296;
  };
  const gaussian = () =>
    Math.sqrt(-2 * Math.log(Math.max(1e-8, rand()))) * Math.cos(rand() * Math.PI * 2);
  const p = new Float32Array(count * 3),
    c = new Float32Array(count * 3),
    light = new Float32Array(count),
    phase = new Float32Array(count);
  const shape = galaxyStructure(model),
    f = shape.feature;
  const ring = model.morphology === "ring",
    interacting = model.morphology === "interacting";
  for (let i = 0; i < count; i++) {
    let r = Math.min(1.2, -Math.log(Math.max(0.001, (1 - rand()) * (1 - rand()))) / 5.6),
      a = rand() * Math.PI * 2;
    let x = 0,
      y = 0,
      z = 0;
    const bulge = rand() < shape.bulgeFraction;
    if (shape.spheroid || bulge) {
      r *= shape.spheroid ? 1 : Math.max(0.16, model.bulgeRadius / model.diskRadius);
      const mu = rand() * 2 - 1,
        s = Math.sqrt(1 - mu * mu);
      x = Math.cos(a) * r * s;
      z = Math.sin(a) * r * s * 0.9;
      y = mu * r * (shape.spheroid ? shape.flattening : 0.65);
    } else if (shape.irregular && f !== 3) {
      const k = Math.floor(rand() * 8),
        ang = k * 2.399;
      x = Math.cos(ang) * (0.15 + 0.035 * k) + gaussian() * 0.075;
      z = Math.sin(ang) * (0.13 + 0.025 * k) + gaussian() * 0.065;
      y = gaussian() * 0.045;
      if (f === 4 && rand() < 0.45) {
        x = gaussian() * 0.24;
        z = gaussian() * 0.055;
        y = gaussian() * 0.035;
      }
      if (f === 5) {
        x *= 1.15;
        z *= 0.7;
        y *= 1.7;
      }
    } else {
      if (ring) r = shape.ringRadius + gaussian() * 0.028;
      else if (model.arms > 0 && model.morphology !== "lenticular" && rand() < shape.armContrast) {
        const launch = Math.max(0.045, model.barLength / model.diskRadius);
        a =
          (Math.floor(rand() * model.arms) * Math.PI * 2) / model.arms +
          Math.log(Math.max(r, launch) / launch) /
            Math.tan((Math.max(8, model.pitchDeg) * Math.PI) / 180) +
          gaussian() * 0.15;
      }
      x = Math.cos(a) * r;
      z = Math.sin(a) * r;
      y = gaussian() * (shape.thickness + 0.018 * r) + Math.sin(a * 2 + r * 7) * 0.018 * r * r;
      if (
        model.morphology === "barred" &&
        r < model.barLength / model.diskRadius &&
        rand() < 0.65
      ) {
        x = ((rand() * 2 - 1) * model.barLength) / model.diskRadius;
        z = gaussian() * 0.025;
      }
      if (f === 3) {
        x *= 0.8;
        z *= 0.35;
        y = gaussian() * 0.04;
      }
      if (interacting && f !== 9) {
        const side = rand() < 0.5 ? 1 : -1;
        x = x * 0.55 + side * 0.24;
        z = z * 0.6 + side * 0.1;
        y += side * 0.025;
        if (rand() < 0.18) {
          const t = rand() * Math.PI;
          x = Math.cos(t) * 0.9;
          z = Math.sin(t) * (0.4 + (0.3 * t) / Math.PI);
        }
      }
      if (f === 8 && rand() < 0.4) {
        const k = Math.floor(rand() * 3) * 2.4;
        x = Math.sin(k) * 0.65 + gaussian() * 0.065;
        z = Math.cos(k) * 0.55 + gaussian() * 0.065;
        y = Math.sin(k * 2) * 0.13 + gaussian() * 0.04;
      }
      if (f === 9 && rand() < 0.35) {
        x = 0.1 + rand() * 1.15;
        z = 0.22 * Math.sin(x * 3) - 0.12 + gaussian() * 0.025;
        y = gaussian() * 0.018;
      }
      if (f === 6 && rand() < 0.08) {
        x = 0.65 + gaussian() * 0.055;
        z = 0.45 + gaussian() * 0.055;
        y = 0.04 + gaussian() * 0.04;
      }
      if (f === 12 && rand() < 0.2) {
        x = 0.8 + gaussian() * 0.12;
        z = 0.1 + gaussian() * 0.025;
        y = 0.06 + gaussian() * 0.03;
      }
    }
    p[i * 3] = x;
    p[i * 3 + 1] = y;
    p[i * 3 + 2] = z;
    const young =
        !shape.spheroid && !bulge && rand() < (shape.irregular ? 0.55 : ring ? 0.7 : 0.27),
      color = young ? model.youngColor : model.oldColor;
    const warmth = rand();
    for (let k = 0; k < 3; k++) c[i * 3 + k] = color[k] * (0.85 + warmth * 0.15);
    light[i] = 0.08 + Math.pow(rand(), 12) * 4.5;
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
