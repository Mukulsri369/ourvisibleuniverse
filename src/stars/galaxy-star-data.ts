import type { GalaxyModel } from "./galaxy-models";
import { galaxyStructure } from "./galaxy-structure";
/** Stable, nested representative populations; no measured star positions are implied. */
export function makeGalaxyStarData(model: GalaxyModel, count = 100000) {
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
    const population = shape.population;
    let hotPopulation = false;
    if (population) {
      hotPopulation = rand() < population.hotFraction;
      for (let attempt = 0; attempt < 32; attempt++) {
        r = population.core / Math.sqrt(Math.pow(Math.max(0.00001, rand()), -2 / 3) - 1);
        if (r < 1.18) break;
      }
      r = Math.min(r, 1.18);
      const mu = rand() * 2 - 1,
        sin = Math.sqrt(1 - mu * mu);
      x = Math.cos(a) * r * sin * population.axes[0];
      y = mu * r * population.axes[1];
      z = Math.sin(a) * r * sin * population.axes[2];
      if (
        population.knots.length &&
        rand() < (population.kind === 1 ? 0.065 : population.hotFraction * 0.75)
      ) {
        const knot = population.knots[Math.floor(rand() * population.knots.length)];
        x = knot[0] + gaussian() * knot[3] * 0.5;
        y = knot[1] + gaussian() * knot[3] * 0.5;
        z = knot[2] + gaussian() * knot[3] * 0.5;
        if (population.kind !== 1) hotPopulation = true;
      }
      if (population.tail > 0 && rand() < population.tail * 0.28) {
        x = (rand() * 2 - 1) * 1.23;
        y = gaussian() * 0.025;
        z = 0.12 * Math.sin(x * 3) + gaussian() * population.axes[2] * 0.07;
      }
    } else if (shape.spheroid || bulge) {
      r *= shape.spheroid
        ? 1
        : f === 10
          ? 0.2
          : f === 11
            ? 0.32
            : f === 15
              ? 0.14
              : Math.max(0.16, model.bulgeRadius / model.diskRadius);
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
      if (ring) {
        const cart = f === 10;
        // Associations break the band into stellar clouds, with finite vertical depth.
        if (rand() < 0.62) {
          const k = Math.floor(rand() * (cart ? 17 : 12));
          a = k * 2.399963 + Math.sin(k * 1.7) * 0.28 + gaussian() * 0.045;
        }
        r =
          shape.ringRadius +
          (cart ? 0.032 * Math.sin(a * 3 + 0.4) : 0.013 * Math.sin(a * 2)) +
          gaussian() * (cart ? 0.033 : 0.04);
        if (cart && rand() < 0.25) {
          r = rand() < 0.45 ? 0.21 + gaussian() * 0.025 : 0.26 + rand() * 0.43;
        }
      } else if (
        model.arms > 0 &&
        model.morphology !== "lenticular" &&
        rand() < shape.armContrast
      ) {
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
      if (f === 15) {
        if (rand() < 0.68) {
          r = 0.22 + Math.pow(rand(), 0.65) * 0.86;
          a =
            (rand() < 0.5 ? 0 : Math.PI) +
            Math.log(r / 0.09) / Math.tan(0.34) +
            Math.sin(r * 4) * 0.2 +
            gaussian() * 0.18;
        } else {
          r *= 0.24;
        }
        x = Math.cos(a) * r;
        z = Math.sin(a) * r;
        y = gaussian() * (0.012 + 0.018 * r);
      }
      if (ring) {
        x += f === 10 ? 0.035 : 0;
        z += f === 10 ? -0.025 : 0;
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
    const young = population
        ? hotPopulation
        : !shape.spheroid && !bulge && rand() < (shape.irregular ? 0.55 : ring ? 0.7 : 0.27),
      color = population
        ? young
          ? population.hot
          : rand() < 0.1
            ? [1, 0.4, 0.16]
            : population.old
        : young
          ? [10, 11, 15].includes(f)
            ? [0.3, 0.62, 1]
            : model.youngColor
          : [10, 11, 15].includes(f)
            ? [1, 0.74, 0.45]
            : model.oldColor;
    const warmth = rand();
    for (let k = 0; k < 3; k++) c[i * 3 + k] = color[k] * (0.85 + warmth * 0.15);
    light[i] = (0.08 + Math.pow(rand(), 12) * 4.5) * (f === 15 && r > 0.22 ? 0.48 : 1);
    phase[i] = rand() * Math.PI * 2;
  }
  let indices: Uint32Array<ArrayBuffer> | undefined;
  if (count > 36000) {
    const buckets = Array.from({ length: 256 }, () => [] as number[]);
    for (let i = 0; i < count; i++) {
      const ix = Math.max(0, Math.min(7, Math.floor(((p[i * 3] + 1.35) / 2.7) * 8)));
      const iy = Math.max(0, Math.min(3, Math.floor(((p[i * 3 + 1] + 1.35) / 2.7) * 4)));
      const iz = Math.max(0, Math.min(7, Math.floor(((p[i * 3 + 2] + 1.35) / 2.7) * 8)));
      buckets[ix + iz * 8 + iy * 64].push(i);
    }
    indices = new Uint32Array(count);
    let offset = 0;
    for (const bucket of buckets) {
      indices.set(bucket, offset);
      offset += bucket.length;
    }
  }
  return {
    positions: p,
    colors: c,
    luminosities: light,
    phases: phase,
    ...(indices ? { indices } : {}),
  };
}
