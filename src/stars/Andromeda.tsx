import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Billboard, Html } from "@react-three/drei";
import { useStore } from "./store";
import {
  ANDROMEDA_NAME,
  M31_AU,
  M31_BULGE_RADIUS,
  M31_CENTER,
  M31_DISK_RADIUS,
  M31_DISTANCE,
  M31_HALO_RADIUS,
  M31_INCLINATION,
  M31_PLANETS,
  M31_POS_ANGLE,
  M31_RING_RADIUS,
  PA99N2_LOCAL,
  PA99N2_STAR,
  PA99N2_WORLD,
  type M31MoonDef,
  type M31PlanetDef,
} from "./andromeda-data";

// ---------------------------------------------------------------
// ANDROMEDA — a fully modelled companion to the Milky Way build.
//
//  • ~520,000 particles: tightly-wound spiral disk, the famous
//    10-kpc star-forming ring, a large classical bulge, a short bar,
//    HII knots and a sparse stellar halo.
//  • Differential rotation done on the GPU with a flat rotation
//    curve (V ≈ 250 km/s), same technique as the Milky Way.
//  • The PA-99-N2 planetary system inside the ring — the star and
//    planets orbit live and can be visited from the site map.
// ---------------------------------------------------------------

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Rotation: the outer disk completes a turn in 900 scene-seconds at the ring.
const M31_ROT_PERIOD = 900;
const V_FLAT = (2 * Math.PI * M31_RING_RADIUS) / M31_ROT_PERIOD;
const R_CORE = 3000;

type Geos = {
  diskGeo: THREE.BufferGeometry;
  ringGeo: THREE.BufferGeometry;
  bulgeGeo: THREE.BufferGeometry;
  barGeo: THREE.BufferGeometry;
  hiiGeo: THREE.BufferGeometry;
  haloGeo: THREE.BufferGeometry;
  dustGeo: THREE.BufferGeometry;
  satGeo: THREE.BufferGeometry;
};

let CACHED_M31: Geos | null = null;

function buildAndromeda(): Geos {
  if (CACHED_M31) return CACHED_M31;
  const rand = mulberry32(0xA11D0E31);

  const pack = (pos: Float32Array, col: Float32Array, size: Float32Array) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    g.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    return g;
  };

  // ---- Spiral disk: M31's arms are tightly wound (pitch ≈ 8°) ----
  const PITCH = (8 * Math.PI) / 180;
  const K = 1 / Math.tan(PITCH);
  const ARMS = [0, Math.PI, Math.PI * 0.55, Math.PI * 1.55];
  const ARM_W = [2000, 2000, 2400, 2400];
  const ARM_STR = [1.0, 1.0, 0.6, 0.6];

  const diskCount = 430_000;
  const dPos = new Float32Array(diskCount * 3);
  const dCol = new Float32Array(diskCount * 3);
  const dSize = new Float32Array(diskCount);
  for (let i = 0; i < diskCount; i++) {
    const onArm = rand() < 0.74;
    const r = rand() < 0.62
      ? -Math.log(1 - rand() * 0.999) * 15_000 + 5_000
      : -Math.log(1 - rand() * 0.999) * 26_000 + 14_000;
    if (r > M31_DISK_RADIUS) { i--; continue; }

    let armIdx = 0;
    if (onArm) {
      const total = ARM_STR.reduce((a, b) => a + b, 0);
      let pick = rand() * total;
      for (let a = 0; a < ARMS.length; a++) { pick -= ARM_STR[a]; if (pick <= 0) { armIdx = a; break; } }
    } else {
      armIdx = Math.floor(rand() * ARMS.length);
    }
    const ridge = ARMS[armIdx] + K * Math.log(Math.max(r, 2000) / 2000);
    const flare = 1 + Math.min(2.0, r / 30_000);
    const sigma = (ARM_W[armIdx] * flare) / Math.max(r, 2000);
    const noise = onArm
      ? (rand() + rand() + rand() - 1.5) * sigma * 0.95
      : (rand() - 0.5) * Math.PI * 0.9;
    const theta = ridge + noise;

    const thick = rand() < 0.14;
    const scaleH = thick ? 1400 : 380;
    const uz = rand() - 0.5;
    const z = -Math.sign(uz) * Math.log(1 - 2 * Math.abs(uz) * 0.999) * scaleH * Math.exp(-r / 40_000);

    dPos[i * 3] = Math.cos(theta) * r;
    dPos[i * 3 + 1] = z;
    dPos[i * 3 + 2] = Math.sin(theta) * r;

    const ridgeClose = Math.exp(-(noise * noise) / (2 * sigma * sigma));
    const rNorm = Math.min(1, r / M31_DISK_RADIUS);
    // M31's disk is redder / older than the Milky Way's.
    const isYoung = rand() < (onArm ? 0.26 * ridgeClose * (1 - rNorm * 0.4) : 0.04);
    const isGiant = !isYoung && rand() < 0.08;
    if (isYoung) {
      dCol[i * 3] = 0.78; dCol[i * 3 + 1] = 0.86; dCol[i * 3 + 2] = 1.0;
      dSize[i] = 16 + rand() * 20;
    } else if (isGiant) {
      dCol[i * 3] = 1.0; dCol[i * 3 + 1] = 0.62; dCol[i * 3 + 2] = 0.42;
      dSize[i] = 16 + rand() * 18;
    } else {
      const inner = 1 - rNorm;
      const b = 0.7 + rand() * 0.3;
      dCol[i * 3] = b * (0.96 + inner * 0.04);
      dCol[i * 3 + 1] = b * (0.88 + inner * 0.06);
      dCol[i * 3 + 2] = b * (0.78 - inner * 0.08);
      dSize[i] = 6 + rand() * 10;
    }
  }
  const diskGeo = pack(dPos, dCol, dSize);

  // ---- The 10-kpc star-forming ring — M31's defining feature ----
  const ringCount = 140_000;
  const rPos = new Float32Array(ringCount * 3);
  const rCol = new Float32Array(ringCount * 3);
  const rSize = new Float32Array(ringCount);
  for (let i = 0; i < ringCount; i++) {
    // Two offset rings (the outer ~32 kly and an inner ~15 kly arc)
    const outer = rand() < 0.78;
    const rMean = outer ? M31_RING_RADIUS : 15_000;
    const spread = outer ? 3200 : 2200;
    const r = rMean + (rand() + rand() + rand() - 1.5) * spread;
    const theta = rand() * Math.PI * 2;
    const z = (rand() - 0.5) * 700;
    rPos[i * 3] = Math.cos(theta) * r;
    rPos[i * 3 + 1] = z;
    rPos[i * 3 + 2] = Math.sin(theta) * r;
    const young = rand() < 0.45;
    if (young) {
      rCol[i * 3] = 0.72; rCol[i * 3 + 1] = 0.84; rCol[i * 3 + 2] = 1.0;
      rSize[i] = 18 + rand() * 24;
    } else {
      rCol[i * 3] = 1.0; rCol[i * 3 + 1] = 0.84; rCol[i * 3 + 2] = 0.66;
      rSize[i] = 8 + rand() * 12;
    }
  }
  const ringGeo = pack(rPos, rCol, rSize);

  // ---- Large classical bulge ----
  const bulgeCount = 130_000;
  const bPos = new Float32Array(bulgeCount * 3);
  const bCol = new Float32Array(bulgeCount * 3);
  const bSize = new Float32Array(bulgeCount);
  for (let i = 0; i < bulgeCount; i++) {
    const r = Math.pow(rand(), 2.4) * M31_BULGE_RADIUS;
    const theta = rand() * Math.PI * 2;
    const phi = Math.acos(2 * rand() - 1);
    bPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    bPos[i * 3 + 1] = r * Math.cos(phi) * 0.65;
    bPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    const t = 1 - r / M31_BULGE_RADIUS;
    bCol[i * 3] = 1.0;
    bCol[i * 3 + 1] = 0.83 + t * 0.11;
    bCol[i * 3 + 2] = 0.58 + t * 0.2;
    bSize[i] = 10 + rand() * 18 + t * 26;
  }
  const bulgeGeo = pack(bPos, bCol, bSize);

  // ---- Short inner bar ----
  const barCount = 16_000;
  const barLen = 9000, barWidth = 2000, barHeight = 900;
  const barAngle = (22 * Math.PI) / 180;
  const ca = Math.cos(barAngle), sa = Math.sin(barAngle);
  const aPos = new Float32Array(barCount * 3);
  const aCol = new Float32Array(barCount * 3);
  const aSize = new Float32Array(barCount);
  for (let i = 0; i < barCount; i++) {
    const u = rand() - 0.5, v = rand() - 0.5, w = rand() - 0.5;
    if (rand() > Math.exp(-(u * u * 4 + v * v * 6 + w * w * 6))) { i--; continue; }
    const lx = u * barLen, lz = v * barWidth, ly = w * barHeight;
    aPos[i * 3] = lx * ca - lz * sa;
    aPos[i * 3 + 1] = ly;
    aPos[i * 3 + 2] = lx * sa + lz * ca;
    aCol[i * 3] = 1.0; aCol[i * 3 + 1] = 0.8; aCol[i * 3 + 2] = 0.54;
    aSize[i] = 10 + rand() * 16;
  }
  const barGeo = pack(aPos, aCol, aSize);

  // ---- HII knots clumped along the ring ----
  const clusters = 560, per = 28;
  const hn = clusters * per;
  const hPos = new Float32Array(hn * 3);
  const hCol = new Float32Array(hn * 3);
  const hSize = new Float32Array(hn);
  let hi = 0;
  for (let c = 0; c < clusters; c++) {
    const r = M31_RING_RADIUS + (rand() - 0.5) * 6000;
    const theta = rand() * Math.PI * 2;
    const cx = Math.cos(theta) * r, cz = Math.sin(theta) * r;
    for (let k = 0; k < per; k++) {
      hPos[hi * 3] = cx + (rand() - 0.5) * 700;
      hPos[hi * 3 + 1] = (rand() - 0.5) * 300;
      hPos[hi * 3 + 2] = cz + (rand() - 0.5) * 700;
      const p = rand();
      hCol[hi * 3] = 1.0;
      hCol[hi * 3 + 1] = 0.42 + p * 0.2;
      hCol[hi * 3 + 2] = 0.68 + p * 0.26;
      hSize[hi] = 26 + rand() * 32;
      hi++;
    }
  }
  const hiiGeo = pack(hPos, hCol, hSize);

  // ---- Halo / globular clusters ----
  const haloCount = 34_000;
  const loPos = new Float32Array(haloCount * 3);
  const loCol = new Float32Array(haloCount * 3);
  const loSize = new Float32Array(haloCount);
  for (let i = 0; i < haloCount; i++) {
    const r = Math.pow(rand(), 0.55) * M31_HALO_RADIUS;
    const theta = rand() * Math.PI * 2;
    const phi = Math.acos(2 * rand() - 1);
    loPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    loPos[i * 3 + 1] = r * Math.cos(phi);
    loPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    loCol[i * 3] = 0.96; loCol[i * 3 + 1] = 0.88; loCol[i * 3 + 2] = 0.72;
    loSize[i] = 4 + rand() * 9;
  }
  const haloGeo = pack(loPos, loCol, loSize);

  // ---- Dust lanes: dark, reddened absorbing arcs just inside each arm ----
  const dustCount = 110_000;
  const duPos = new Float32Array(dustCount * 3);
  const duCol = new Float32Array(dustCount * 3);
  const duSize = new Float32Array(dustCount);
  for (let i = 0; i < dustCount; i++) {
    const armIdx = Math.floor(rand() * ARMS.length);
    const r = 6_000 + rand() * (M31_DISK_RADIUS * 0.7);
    const ridge = ARMS[armIdx] + K * Math.log(Math.max(r, 2000) / 2000) - 0.13;
    const theta = ridge + (rand() - 0.5) * 0.12;
    duPos[i * 3] = Math.cos(theta) * r;
    duPos[i * 3 + 1] = (rand() - 0.5) * 500;
    duPos[i * 3 + 2] = Math.sin(theta) * r;
    const b = 0.09 + rand() * 0.17;
    duCol[i * 3] = b; duCol[i * 3 + 1] = b * 0.42; duCol[i * 3 + 2] = b * 0.3;
    duSize[i] = 18 + rand() * 26;
  }
  const dustGeo = pack(duPos, duCol, duSize);

  // ---- Satellite companions M32 and M110, plus outer stellar streams ----
  const satCount = 70_000;
  const saPos = new Float32Array(satCount * 3);
  const saCol = new Float32Array(satCount * 3);
  const saSize = new Float32Array(satCount);
  const companions = [
    { cx: 16_000, cy: 4_000, cz: -9_000, radius: 3_200 },   // M32 (compact elliptical)
    { cx: -22_000, cy: -6_000, cz: 14_000, radius: 8_500 }, // NGC 205 / M110
  ];
  for (let i = 0; i < satCount; i++) {
    if (i < satCount * 0.55) {
      const c = companions[i % 2];
      const r = Math.pow(rand(), 2.2) * c.radius;
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      saPos[i * 3] = c.cx + r * Math.sin(phi) * Math.cos(theta);
      saPos[i * 3 + 1] = c.cy + r * Math.cos(phi);
      saPos[i * 3 + 2] = c.cz + r * Math.sin(phi) * Math.sin(theta);
      saCol[i * 3] = 1.0; saCol[i * 3 + 1] = 0.86; saCol[i * 3 + 2] = 0.68;
      saSize[i] = 5 + rand() * 10;
    } else {
      // Giant Stellar Stream — a tidal arc wrapping the southern halo
      const t = rand();
      const ang = -1.1 + t * 3.4;
      const r = 45_000 + t * 60_000;
      saPos[i * 3] = Math.cos(ang) * r + (rand() - 0.5) * 6_000;
      saPos[i * 3 + 1] = (rand() - 0.5) * 8_000 - 6_000 * t;
      saPos[i * 3 + 2] = Math.sin(ang) * r + (rand() - 0.5) * 6_000;
      const b = 0.5 + rand() * 0.4;
      saCol[i * 3] = b * 0.96; saCol[i * 3 + 1] = b * 0.86; saCol[i * 3 + 2] = b * 0.7;
      saSize[i] = 3 + rand() * 7;
    }
  }
  const satGeo = pack(saPos, saCol, saSize);

  CACHED_M31 = { diskGeo, ringGeo, bulgeGeo, barGeo, hiiGeo, haloGeo, dustGeo, satGeo };
  return CACHED_M31;
}

function makeStarSprite(): THREE.Texture {
  const size = 64;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.3, "rgba(255,255,255,0.7)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}

function makeGlowTexture(inner: string, outer: string): THREE.Texture {
  const size = 256;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, inner);
  g.addColorStop(1, outer);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}

// ---------------------------------------------------------------
// PA-99-N2 planetary system
// ---------------------------------------------------------------

function keplerPosition(def: M31PlanetDef, phase: number, t: number): THREE.Vector3 {
  const M = phase + (t / def.period) * Math.PI * 2;
  let E = M;
  for (let k = 0; k < 6; k++) E = E - (E - def.e * Math.sin(E) - M) / (1 - def.e * Math.cos(E));
  const xp = def.a * (Math.cos(E) - def.e);
  const zp = def.a * Math.sqrt(1 - def.e * def.e) * Math.sin(E);
  const cw = Math.cos(def.omega), sw = Math.sin(def.omega);
  const x1 = xp * cw - zp * sw;
  const z1 = xp * sw + zp * cw;
  const ci = Math.cos(def.i), si = Math.sin(def.i);
  return new THREE.Vector3(x1, -z1 * si, z1 * ci);
}

function makeOrbitLine(def: M31PlanetDef, color: string, opacity: number) {
  const segs = 256;
  const pts: number[] = [];
  for (let k = 0; k <= segs; k++) {
    const E = (k / segs) * Math.PI * 2;
    const xp = def.a * (Math.cos(E) - def.e);
    const zp = def.a * Math.sqrt(1 - def.e * def.e) * Math.sin(E);
    const cw = Math.cos(def.omega), sw = Math.sin(def.omega);
    const x1 = xp * cw - zp * sw;
    const z1 = xp * sw + zp * cw;
    const ci = Math.cos(def.i), si = Math.sin(def.i);
    pts.push(x1, -z1 * si, z1 * ci);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  return new THREE.Line(g, new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false }));
}

function getRegistry(): Map<string, THREE.Vector3> {
  if (!window.__planetPositions) window.__planetPositions = new Map();
  return window.__planetPositions;
}

function hashSeed(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

function makeSurfaceTexture(def: M31PlanetDef): THREE.Texture {
  const W = 512, H = 256;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d")!;
  const rand = mulberry32(hashSeed(def.name));
  const base = new THREE.Color(def.color);
  const shade = (l: number) => {
    const col = base.clone();
    const hsl = { h: 0, s: 0, l: 0 };
    col.getHSL(hsl);
    col.setHSL(hsl.h, hsl.s, Math.min(0.95, Math.max(0.04, hsl.l * l)));
    return `#${col.getHexString()}`;
  };
  ctx.fillStyle = `#${base.getHexString()}`;
  ctx.fillRect(0, 0, W, H);

  const giant = def.size > 0.04 * M31_AU;
  if (giant) {
    let y = 0;
    while (y < H) {
      const h = 5 + rand() * 22;
      ctx.fillStyle = shade(0.7 + rand() * 0.7);
      ctx.globalAlpha = 0.5 + rand() * 0.4;
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= W; x += 24) ctx.lineTo(x, y + Math.sin(x * 0.02 + rand()) * 2);
      ctx.lineTo(W, y + h); ctx.lineTo(0, y + h); ctx.closePath();
      ctx.fill();
      y += h;
    }
    ctx.globalAlpha = 1;
    for (let i = 0; i < 4; i++) {
      const sx = rand() * W, sy = H * (0.25 + rand() * 0.5);
      const rx = 14 + rand() * 34, ry = rx * 0.45;
      const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, rx);
      g.addColorStop(0, i === 0 ? "#d0603a" : shade(1.3));
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.save(); ctx.translate(sx, sy); ctx.scale(1, ry / rx); ctx.translate(-sx, -sy);
      ctx.beginPath(); ctx.arc(sx, sy, rx, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
  } else {
    for (let i = 0; i < 900; i++) {
      const x = rand() * W, y = rand() * H;
      const r = 2 + rand() * 22;
      ctx.globalAlpha = 0.05 + rand() * 0.18;
      ctx.fillStyle = shade(0.6 + rand() * 0.9);
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.fillRect(0, 0, W, 10 + rand() * 12);
    ctx.fillRect(0, H - (10 + rand() * 12), W, 14);
    ctx.globalAlpha = 1;
  }
  const t = new THREE.CanvasTexture(c);
  t.needsUpdate = true;
  return t;
}

function makeRingTexture(color: string): THREE.Texture {
  const W = 256, H = 4;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d")!;
  const base = new THREE.Color(color);
  const rand = mulberry32(0x51F7);
  for (let x = 0; x < W; x++) {
    const t = x / W;
    let a = 0.25 + rand() * 0.6;
    if (t > 0.55 && t < 0.62) a *= 0.12; // gap
    ctx.fillStyle = `rgba(${(base.r * 255) | 0},${(base.g * 255) | 0},${(base.b * 255) | 0},${a})`;
    ctx.fillRect(x, 0, 1, H);
  }
  return new THREE.CanvasTexture(c);
}

function makeRingGeometry(inner: number, outer: number, segs: number) {
  const g = new THREE.RingGeometry(inner, outer, segs, 1);
  const pos = g.attributes.position as THREE.BufferAttribute;
  const uv = g.attributes.uv as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const r = v.length();
    uv.setXY(i, (r - inner) / (outer - inner), 0.5);
  }
  uv.needsUpdate = true;
  return g;
}

function M31Moon({ moon, parent }: { moon: M31MoonDef; parent: string }) {
  const ref = useRef<THREE.Mesh>(null!);
  const phase = useMemo(() => Math.random() * Math.PI * 2, []);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    const a = phase + (t / moon.period) * Math.PI * 2;
    const inc = moon.inclination ?? 0;
    ref.current.position.set(
      Math.cos(a) * moon.distance,
      Math.sin(a) * moon.distance * Math.sin(inc),
      Math.sin(a) * moon.distance * Math.cos(inc),
    );
    ref.current.getWorldPosition(tmp);
    const reg = getRegistry();
    const key = `${parent} · ${moon.name}`;
    let v = reg.get(key);
    if (!v) { v = new THREE.Vector3(); reg.set(key, v); }
    v.copy(tmp);
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[moon.size, 24, 24]} />
      <meshStandardMaterial color={moon.color} roughness={0.95} metalness={0.02} />
    </mesh>
  );
}

function M31Planet({ def }: { def: M31PlanetDef }) {
  const groupRef = useRef<THREE.Group>(null!);
  const bodyRef = useRef<THREE.Mesh>(null!);
  const phase = useMemo(() => Math.random() * Math.PI * 2, []);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const setVisit = useStore((s) => s.setVisitPlanet);
  const surface = useMemo(() => makeSurfaceTexture(def), [def]);
  const haloTex = useMemo(() => makeGlowTexture("rgba(255,255,255,0.9)", "rgba(255,255,255,0)"), []);
  const ringTex = useMemo(() => (def.ring ? makeRingTexture(def.ring.color) : null), [def]);
  const ringGeo = useMemo(() => (def.ring ? makeRingGeometry(def.ring.inner, def.ring.outer, 160) : null), [def]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;
    groupRef.current.position.copy(keplerPosition(def, phase, t));
    if (bodyRef.current) bodyRef.current.rotation.y = (t / def.spinPeriod) * Math.PI * 2;
    groupRef.current.getWorldPosition(tmp);
    const reg = getRegistry();
    let v = reg.get(def.name);
    if (!v) { v = new THREE.Vector3(); reg.set(def.name, v); }
    v.copy(tmp);
  });

  return (
    <group ref={groupRef}>
      <sprite scale={[def.size * 20, def.size * 20, 1]}>
        <spriteMaterial map={haloTex} color={def.color} transparent opacity={0.6} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <group rotation={[0, 0, def.tilt]}>
        <mesh
          ref={bodyRef}
          onPointerOver={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); document.body.style.cursor = "pointer"; }}
          onPointerOut={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); document.body.style.cursor = ""; }}
          onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); setVisit(def.name); }}
        >
          <sphereGeometry args={[def.size, 48, 48]} />
          <meshStandardMaterial
            map={surface}
            roughness={def.emissive ? 0.55 : 0.92}
            metalness={0.02}
            emissive={new THREE.Color(def.emissive ?? def.color)}
            emissiveIntensity={def.emissive ? 0.14 : 0.06}
          />
        </mesh>
        {def.atmosphere && (
          <>
            <mesh scale={1.04}>
              <sphereGeometry args={[def.size, 32, 32]} />
              <meshBasicMaterial color={def.atmosphere} transparent opacity={0.15} side={THREE.BackSide} depthWrite={false} />
            </mesh>
            <mesh scale={1.14}>
              <sphereGeometry args={[def.size, 32, 32]} />
              <meshBasicMaterial color={def.atmosphere} transparent opacity={0.07} side={THREE.BackSide} depthWrite={false} blending={THREE.AdditiveBlending} />
            </mesh>
          </>
        )}
        {def.ring && ringGeo && (
          <mesh geometry={ringGeo} rotation={[Math.PI / 2, 0, 0]}>
            <meshBasicMaterial map={ringTex ?? undefined} color={def.ring.color} side={THREE.DoubleSide} transparent opacity={0.9} depthWrite={false} />
          </mesh>
        )}
      </group>
      {def.moons?.map((m) => <M31Moon key={m.name} moon={m} parent={def.name} />)}
    </group>
  );
}

// Debris belt beyond the outer ice giant, orbiting Keplerian-differentially.
function M31Belt() {
  const { geom, radii, thetas, heights, omegas } = useMemo(() => {
    const n = 1600;
    const pos = new Float32Array(n * 3);
    const radii = new Float32Array(n);
    const thetas = new Float32Array(n);
    const heights = new Float32Array(n);
    const omegas = new Float32Array(n);
    const K = 78 / Math.pow(2.5, 1.5); // matched to PA-99-N2 b's period
    for (let i = 0; i < n; i++) {
      const rAU = 8 + Math.random() * 7;
      radii[i] = rAU * M31_AU;
      thetas[i] = Math.random() * Math.PI * 2;
      heights[i] = (Math.random() - 0.5) * 0.6 * M31_AU;
      omegas[i] = (Math.PI * 2) / (K * Math.pow(rAU, 1.5));
      pos[i * 3] = Math.cos(thetas[i]) * radii[i];
      pos[i * 3 + 1] = heights[i];
      pos[i * 3 + 2] = Math.sin(thetas[i]) * radii[i];
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return { geom: g, radii, thetas, heights, omegas };
  }, []);
  const beltTick = useRef(0);
  useFrame(({ clock }) => {
    if (beltTick.current++ % 3 !== 0) return;
    const t = clock.elapsedTime;
    const attr = geom.getAttribute("position") as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    for (let i = 0; i < radii.length; i++) {
      const a = thetas[i] + omegas[i] * t;
      arr[i * 3] = Math.cos(a) * radii[i];
      arr[i * 3 + 1] = heights[i];
      arr[i * 3 + 2] = Math.sin(a) * radii[i];
    }
    attr.needsUpdate = true;
  });
  return (
    <points geometry={geom} frustumCulled={false}>
      <pointsMaterial color="#9db6c8" size={0.012 * M31_AU} sizeAttenuation transparent opacity={0.8} depthWrite={false} />
    </points>
  );
}

function PA99N2System() {
  const starRef = useRef<THREE.Mesh>(null!);
  const glowTex = useMemo(() => makeGlowTexture("rgba(255,210,150,1)", "rgba(255,140,50,0)"), []);
  const setVisitGalaxy = useStore((s) => s.setVisitGalaxy);
  const orbits = useMemo(
    () => M31_PLANETS.map((p) => makeOrbitLine(p, p.confirmed ? "#ffd8a0" : "#5f7fb5", p.confirmed ? 0.5 : 0.22)),
    [],
  );

  // The system rides M31's rotation curve, circling the galactic centre
  // exactly like the Sun does in the Milky Way.
  const sysRef = useRef<THREE.Group>(null!);
  const sysWorld = useMemo(() => new THREE.Vector3(), []);
  const sysR = useMemo(() => Math.hypot(PA99N2_LOCAL.x, PA99N2_LOCAL.z), []);
  const sysPhase = useMemo(() => Math.atan2(PA99N2_LOCAL.z, PA99N2_LOCAL.x), []);
  const sysOmega = useMemo(() => V_FLAT / Math.max(sysR, 1), [sysR]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (starRef.current) starRef.current.rotation.y = t * 0.05;
    if (sysRef.current) {
      const ang = sysPhase + sysOmega * t;
      sysRef.current.position.set(Math.cos(ang) * sysR, PA99N2_LOCAL.y, Math.sin(ang) * sysR);
      sysRef.current.getWorldPosition(sysWorld);
    }
    const reg = getRegistry();
    let v = reg.get(PA99N2_STAR.name);
    if (!v) { v = new THREE.Vector3(); reg.set(PA99N2_STAR.name, v); }
    v.copy(sysRef.current ? sysWorld : PA99N2_WORLD);
  });

  return (
    <group ref={sysRef} position={PA99N2_LOCAL.toArray()}>
      <mesh
        ref={starRef}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); document.body.style.cursor = "pointer"; }}
        onPointerOut={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); document.body.style.cursor = ""; }}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          setVisitGalaxy({
            name: ANDROMEDA_NAME,
            x: M31_CENTER.x, y: M31_CENTER.y, z: M31_CENTER.z,
            size: M31_DISK_RADIUS * 2, distance: M31_DISTANCE, type: "Barred Spiral",
          });
        }}
      >
        <sphereGeometry args={[PA99N2_STAR.radius, 48, 48]} />
        <meshBasicMaterial color="#ffdca6" />
      </mesh>
      <pointLight color="#ffd0a0" intensity={6} distance={20 * M31_AU} decay={1.4} />
      <sprite scale={[PA99N2_STAR.radius * 9, PA99N2_STAR.radius * 9, 1]}>
        <spriteMaterial map={glowTex} transparent opacity={0.45} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      {orbits.map((o, i) => <primitive key={i} object={o} />)}
      {M31_PLANETS.map((p) => <M31Planet key={p.name} def={p} />)}
      <M31Belt />
      <Billboard>
        <Html center zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
          <div style={{
            transform: `translate(${PA99N2_STAR.radius * 0.02}px, -46px)`,
            color: "#ffe6c0", fontSize: 11, letterSpacing: 1.4,
            fontFamily: "Inter, system-ui, sans-serif", whiteSpace: "nowrap",
            textShadow: "0 0 12px rgba(255,180,90,0.8)",
          }}>
            PA-99-N2
          </div>
        </Html>
      </Billboard>
    </group>
  );
}

// Soft glow so M31 reads as a galaxy from millions of light-years away,
// fading out as the camera closes in on the particle model.
function M31FarGlow() {
  const ref = useRef<THREE.Sprite>(null!);
  const tex = useMemo(() => makeGlowTexture("rgba(240,236,255,0.95)", "rgba(120,140,255,0)"), []);
  const world = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera }) => {
    if (!ref.current) return;
    ref.current.getWorldPosition(world);
    const d = camera.position.distanceTo(world);
    const a = Math.min(1, Math.max(0, (d - 250_000) / 500_000));
    (ref.current.material as THREE.SpriteMaterial).opacity = a * 0.55;
  });
  return (
    <sprite ref={ref} scale={[260_000, 130_000, 1]}>
      <spriteMaterial map={tex} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0} />
    </sprite>
  );
}

export function Andromeda() {
  const { diskGeo, ringGeo, bulgeGeo, barGeo, hiiGeo, haloGeo, dustGeo, satGeo } = useMemo(buildAndromeda, []);
  const tex = useMemo(makeStarSprite, []);
  const coreTex = useMemo(() => makeGlowTexture("rgba(255,226,178,1)", "rgba(255,150,60,0)"), []);
  const setVisitGalaxy = useStore((s) => s.setVisitGalaxy);

  const shader = useMemo(
    () => ({
      uniforms: {
        uTex: { value: tex },
        uPixelRatio: { value: typeof window !== "undefined" ? window.devicePixelRatio : 1 },
        uTime: { value: 0 },
        uVflat: { value: V_FLAT },
        uRcore: { value: R_CORE },
      },
      vertexShader: /* glsl */ `
        attribute float aSize;
        varying vec3 vColor;
        uniform float uPixelRatio;
        uniform float uTime;
        uniform float uVflat;
        uniform float uRcore;
        void main(){
          vColor = color;
          float r = length(position.xz);
          float vrot = (r < uRcore) ? uVflat * (r / uRcore) : uVflat;
          float omega = (r > 0.5) ? (vrot / r) : 0.0;
          float ang = omega * uTime;
          float c = cos(ang), s = sin(ang);
          vec3 p = vec3(position.x * c - position.z * s, position.y, position.x * s + position.z * c);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          float size = aSize * uPixelRatio * (300.0 / max(-mv.z, 1.0));
          gl_PointSize = clamp(size, 1.0, 70.0);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform sampler2D uTex;
        varying vec3 vColor;
        void main(){
          vec4 t = texture2D(uTex, gl_PointCoord);
          if (t.a < 0.04) discard;
          gl_FragColor = vec4(vColor, t.a);
        }
      `,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
    [tex],
  );

  // Detail LOD: from the Milky Way, M31's ~1M particles project onto a few
  // pixels, so we let the far-glow sprite stand in and skip drawing them.
  // Nothing is removed — they switch back on as the camera approaches.
  const detailRef = useRef<THREE.Group>(null!);
  const camWorld = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ clock, camera }) => {
    shader.uniforms.uTime.value = clock.elapsedTime;
    if (detailRef.current) {
      detailRef.current.getWorldPosition(camWorld);
      const d = camera.position.distanceTo(camWorld);
      detailRef.current.visible = d < M31_DISK_RADIUS * 40;
    }
  });

  const pickRadius = M31_DISK_RADIUS * 0.9;
  const visit = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    setVisitGalaxy({
      name: ANDROMEDA_NAME,
      x: M31_CENTER.x, y: M31_CENTER.y, z: M31_CENTER.z,
      size: M31_DISK_RADIUS * 2, distance: M31_DISTANCE, type: "Barred Spiral",
    });
  };

  return (
    <group position={M31_CENTER.toArray()} rotation={[M31_INCLINATION, 0, M31_POS_ANGLE]}>
      {/* Galaxy body lives in its own XZ plane, tipped into the disc plane */}
      <group rotation={[Math.PI / 2, 0, 0]}>
        <group ref={detailRef}>
          {[diskGeo, ringGeo, barGeo, bulgeGeo, hiiGeo, haloGeo, dustGeo, satGeo].map((g, i) => (
            <points key={i} geometry={g} frustumCulled={false}>
              <shaderMaterial args={[shader]} />
            </points>
          ))}
        </group>
        <mesh onClick={visit}>
          <sphereGeometry args={[120, 24, 24]} />
          <meshBasicMaterial color="#ffeccc" />
        </mesh>
        <M31FarGlow />
        <sprite scale={[9000, 9000, 1]}>
          <spriteMaterial map={coreTex} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
        </sprite>
        <PA99N2System />
        {/* generous invisible pick target so M31 stays clickable from afar */}
        <mesh onClick={visit}>
          <sphereGeometry args={[pickRadius, 12, 12]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
}
