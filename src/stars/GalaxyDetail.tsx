import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Billboard, Html } from "@react-three/drei";
import { useStore } from "./store";
import {
  GALAXY_MODELS,
  galaxyCenter,
  systemOmega,
  type GalaxyModel,
  type GxMoonDef,
  type GxPlanetDef,
  type GxSystem as GxSystemDef,
} from "./galaxy-models";

// ---------------------------------------------------------------
// GALAXY DETAIL — a generic, data-driven renderer that builds any
// galaxy in <galaxy-models.ts> at Milky-Way / Andromeda level of
// detail: spiral arms, bar, bulge, HII knots, dust lanes and halo,
// with GPU differential rotation, plus a live planetary system that
// itself orbits the galaxy's centre.
//
// Only galaxies the camera is actually near (or that the user has
// selected in the site map) are built, so hundreds of thousands of
// particles are never paid for more than a couple of galaxies at a time.
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

function hashSeed(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

type Geos = THREE.BufferGeometry[];
const GEO_CACHE = new Map<string, Geos>();

function pack(pos: Float32Array, col: Float32Array, size: Float32Array) {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  g.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
  return g;
}

function buildGalaxy(m: GalaxyModel): Geos {
  const cached = GEO_CACHE.get(m.key);
  if (cached) return cached;
  const rand = mulberry32(hashSeed(m.key));
  const out: Geos = [];
  const B = (n: number) => Math.round(n * m.density);

  const young = m.youngColor;
  const old = m.oldColor;

  const spheroid = (count: number, radius: number, flatten: number, power: number, bright: number) => {
    const p = new Float32Array(count * 3);
    const c = new Float32Array(count * 3);
    const s = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = Math.pow(rand(), power) * radius;
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      p[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      p[i * 3 + 1] = r * Math.cos(phi) * flatten;
      p[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      const b = (0.65 + rand() * 0.35) * bright;
      c[i * 3] = old[0] * b; c[i * 3 + 1] = old[1] * b; c[i * 3 + 2] = old[2] * b;
      s[i] = 5 + rand() * 11;
    }
    return pack(p, c, s);
  };

  // ---------- disk ----------
  if (m.morphology === "spiral" || m.morphology === "barred" || m.morphology === "irregular" || m.morphology === "interacting") {
    const count = B(m.morphology === "irregular" ? 150_000 : m.morphology === "interacting" ? 210_000 : 240_000);
    const PITCH = (m.pitchDeg * Math.PI) / 180;
    const K = 1 / Math.tan(PITCH);
    const armCount = Math.max(1, m.arms);
    const p = new Float32Array(count * 3);
    const c = new Float32Array(count * 3);
    const s = new Float32Array(count);
    const rScale = m.diskRadius * 0.22;
    for (let i = 0; i < count; i++) {
      const onArm = rand() < (m.morphology === "irregular" ? 0.45 : 0.76);
      const r = -Math.log(1 - rand() * 0.999) * rScale + m.diskRadius * 0.04;
      if (r > m.diskRadius) { i--; continue; }
      const armIdx = Math.floor(rand() * armCount);
      const base = (armIdx / armCount) * Math.PI * 2;
      const rMin = Math.max(m.diskRadius * 0.03, 1);
      const ridge = base + K * Math.log(Math.max(r, rMin) / rMin);
      const flare = 1 + Math.min(2.0, r / (m.diskRadius * 0.4));
      const sigma = (m.diskRadius * 0.06 * flare) / Math.max(r, rMin);
      const noise = onArm
        ? (rand() + rand() + rand() - 1.5) * sigma * (m.morphology === "irregular" ? 1.6 : 0.95)
        : (rand() - 0.5) * Math.PI * 0.95;
      const theta = ridge + noise;
      const scaleH = (rand() < 0.15 ? 0.045 : 0.012) * m.diskRadius;
      const uz = rand() - 0.5;
      const z = -Math.sign(uz) * Math.log(1 - 2 * Math.abs(uz) * 0.999) * scaleH * Math.exp(-r / (m.diskRadius * 0.45));
      const interactingOffset = m.morphology === "interacting" ? (i % 2 === 0 ? -0.16 : 0.16) * m.diskRadius : 0;
      const tidalStretch = m.morphology === "interacting" ? 1 + 0.7 * Math.pow(r / m.diskRadius, 3) : 1;
      p[i * 3] = Math.cos(theta) * r * tidalStretch + interactingOffset;
      p[i * 3 + 1] = z;
      p[i * 3 + 2] = Math.sin(theta) * r;

      const ridgeClose = Math.exp(-(noise * noise) / (2 * sigma * sigma));
      const rNorm = Math.min(1, r / m.diskRadius);
      const isYoung = rand() < (onArm ? 0.34 * ridgeClose * (1 - rNorm * 0.35) : 0.05);
      const isGiant = !isYoung && rand() < 0.07;
      if (isYoung) {
        c[i * 3] = young[0]; c[i * 3 + 1] = young[1]; c[i * 3 + 2] = young[2];
        s[i] = 15 + rand() * 20;
      } else if (isGiant) {
        c[i * 3] = 1.0; c[i * 3 + 1] = 0.62; c[i * 3 + 2] = 0.42;
        s[i] = 14 + rand() * 18;
      } else {
        const b = 0.66 + rand() * 0.34;
        c[i * 3] = old[0] * b; c[i * 3 + 1] = old[1] * b; c[i * 3 + 2] = old[2] * b;
        s[i] = 6 + rand() * 9;
      }
    }
    out.push(pack(p, c, s));
  }

  // ---------- edge-on / lenticular / starburst smooth disk ----------
  if (m.morphology === "lenticular" || m.morphology === "edge-on" || m.morphology === "starburst") {
    const count = B(m.morphology === "starburst" ? 150_000 : 190_000);
    const p = new Float32Array(count * 3);
    const c = new Float32Array(count * 3);
    const s = new Float32Array(count);
    const elong = m.morphology === "starburst" ? 2.6 : 1;
    for (let i = 0; i < count; i++) {
      const r = -Math.log(1 - rand() * 0.999) * m.diskRadius * 0.26;
      if (r > m.diskRadius) { i--; continue; }
      const theta = rand() * Math.PI * 2;
      const uz = rand() - 0.5;
      const z = -Math.sign(uz) * Math.log(1 - 2 * Math.abs(uz) * 0.999) * m.diskRadius * 0.02;
      p[i * 3] = Math.cos(theta) * r * elong;
      p[i * 3 + 1] = z;
      p[i * 3 + 2] = Math.sin(theta) * r;
      const rNorm = Math.min(1, r / m.diskRadius);
      const isYoung = m.morphology === "starburst" && rand() < 0.4 * (1 - rNorm);
      if (isYoung) {
        c[i * 3] = young[0]; c[i * 3 + 1] = young[1]; c[i * 3 + 2] = young[2];
        s[i] = 16 + rand() * 22;
      } else {
        const b = 0.6 + rand() * 0.4;
        c[i * 3] = old[0] * b; c[i * 3 + 1] = old[1] * b; c[i * 3 + 2] = old[2] * b;
        s[i] = 6 + rand() * 10;
      }
    }
    out.push(pack(p, c, s));
  }

  // ---------- bulge ----------
  out.push(spheroid(
    B(m.morphology === "elliptical" ? 260_000 : 70_000),
    m.bulgeRadius,
    m.morphology === "elliptical" ? 0.68 : 0.55,
    m.morphology === "elliptical" ? 1.6 : 2.3,
    1,
  ));

  // ---------- bar ----------
  if (m.barLength > 0) {
    const count = B(45_000);
    const p = new Float32Array(count * 3);
    const c = new Float32Array(count * 3);
    const s = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const t = (rand() - 0.5) * 2;
      const x = t * m.barLength;
      const w = m.barLength * 0.22 * (1 - Math.abs(t) * 0.55);
      p[i * 3] = x + (rand() - 0.5) * w * 0.4;
      p[i * 3 + 1] = (rand() - 0.5) * w * 0.35;
      p[i * 3 + 2] = (rand() - 0.5) * w;
      c[i * 3] = old[0]; c[i * 3 + 1] = old[1] * 0.96; c[i * 3 + 2] = old[2] * 0.85;
      s[i] = 9 + rand() * 14;
    }
    out.push(pack(p, c, s));
  }

  // ---------- star-forming ring ----------
  if (m.ringRadius) {
    const count = B(60_000);
    const p = new Float32Array(count * 3);
    const c = new Float32Array(count * 3);
    const s = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = m.ringRadius + (rand() + rand() + rand() - 1.5) * m.ringRadius * 0.12;
      const theta = rand() * Math.PI * 2;
      p[i * 3] = Math.cos(theta) * r;
      p[i * 3 + 1] = (rand() - 0.5) * m.diskRadius * 0.01;
      p[i * 3 + 2] = Math.sin(theta) * r;
      if (rand() < 0.45) {
        c[i * 3] = young[0]; c[i * 3 + 1] = young[1]; c[i * 3 + 2] = young[2];
        s[i] = 17 + rand() * 22;
      } else {
        c[i * 3] = old[0]; c[i * 3 + 1] = old[1]; c[i * 3 + 2] = old[2];
        s[i] = 8 + rand() * 11;
      }
    }
    out.push(pack(p, c, s));
  }

  // ---------- HII knots ----------
  if (m.morphology !== "elliptical") {
    const clusters = Math.round(300 * m.density), per = 24;
    const n = clusters * per;
    const p = new Float32Array(n * 3);
    const c = new Float32Array(n * 3);
    const s = new Float32Array(n);
    let k = 0;
    const PITCH = (Math.max(m.pitchDeg, 8) * Math.PI) / 180;
    const K = 1 / Math.tan(PITCH);
    for (let ci = 0; ci < clusters; ci++) {
      const r = m.diskRadius * (0.12 + rand() * 0.8);
      const rMin = Math.max(m.diskRadius * 0.03, 1);
      const armIdx = Math.floor(rand() * Math.max(1, m.arms));
      const base = m.arms > 0 ? (armIdx / m.arms) * Math.PI * 2 : rand() * Math.PI * 2;
      const theta = m.arms > 0
        ? base + K * Math.log(Math.max(r, rMin) / rMin) + (rand() - 0.5) * 0.12
        : rand() * Math.PI * 2;
      const cx = Math.cos(theta) * r * (m.morphology === "starburst" ? 2.6 : 1);
      const cz = Math.sin(theta) * r;
      const spread = m.diskRadius * 0.012;
      for (let j = 0; j < per; j++) {
        p[k * 3] = cx + (rand() - 0.5) * spread;
        p[k * 3 + 1] = (rand() - 0.5) * spread * 0.4;
        p[k * 3 + 2] = cz + (rand() - 0.5) * spread;
        const q = rand();
        c[k * 3] = 1.0; c[k * 3 + 1] = 0.4 + q * 0.22; c[k * 3 + 2] = 0.66 + q * 0.28;
        s[k] = 22 + rand() * 30;
        k++;
      }
    }
    out.push(pack(p, c, s));
  }

  // ---------- dust lanes (dark-red absorbing band) ----------
  if (m.dustLanes) {
    const count = B(70_000);
    const p = new Float32Array(count * 3);
    const c = new Float32Array(count * 3);
    const s = new Float32Array(count);
    const PITCH = (Math.max(m.pitchDeg, 10) * Math.PI) / 180;
    const K = 1 / Math.tan(PITCH);
    for (let i = 0; i < count; i++) {
      const r = m.morphology === "edge-on" || m.morphology === "lenticular"
        ? m.diskRadius * (0.72 + rand() * 0.2)
        : m.diskRadius * (0.08 + rand() * 0.85);
      const rMin = Math.max(m.diskRadius * 0.03, 1);
      const armIdx = Math.floor(rand() * Math.max(1, m.arms));
      const base = m.arms > 0 ? (armIdx / m.arms) * Math.PI * 2 : 0;
      const theta = m.arms > 0
        ? base + K * Math.log(Math.max(r, rMin) / rMin) - 0.14 + (rand() - 0.5) * 0.1
        : rand() * Math.PI * 2;
      p[i * 3] = Math.cos(theta) * r * (m.morphology === "starburst" ? 2.6 : 1);
      p[i * 3 + 1] = (rand() - 0.5) * m.diskRadius * 0.008;
      p[i * 3 + 2] = Math.sin(theta) * r;
      const b = 0.1 + rand() * 0.18;
      c[i * 3] = b * 1.0; c[i * 3 + 1] = b * 0.42; c[i * 3 + 2] = b * 0.28;
      s[i] = 18 + rand() * 26;
    }
    out.push(pack(p, c, s));
  }

  // ---------- halo / globular clusters ----------
  out.push(spheroid(B(20_000), m.haloRadius, 1, 0.6, 0.85));

  GEO_CACHE.set(m.key, out);
  return out;
}

// ---------------------------------------------------------------
// textures
// ---------------------------------------------------------------

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

function makeSurfaceTexture(def: GxPlanetDef, au: number): THREE.Texture {
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

  const giant = def.size > 0.045 * au;
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
  const rand = mulberry32(0x51f7);
  for (let x = 0; x < W; x++) {
    const t = x / W;
    let a = 0.25 + rand() * 0.6;
    if (t > 0.55 && t < 0.62) a *= 0.12;
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

// ---------------------------------------------------------------
// planetary system
// ---------------------------------------------------------------

function getRegistry(): Map<string, THREE.Vector3> {
  if (!window.__planetPositions) window.__planetPositions = new Map();
  return window.__planetPositions;
}

function keplerPosition(def: GxPlanetDef, phase: number, t: number, out: THREE.Vector3) {
  const M = phase + (t / def.period) * Math.PI * 2;
  let E = M;
  for (let k = 0; k < 6; k++) E = E - (E - def.e * Math.sin(E) - M) / (1 - def.e * Math.cos(E));
  const xp = def.a * (Math.cos(E) - def.e);
  const zp = def.a * Math.sqrt(1 - def.e * def.e) * Math.sin(E);
  const cw = Math.cos(def.omega), sw = Math.sin(def.omega);
  const x1 = xp * cw - zp * sw;
  const z1 = xp * sw + zp * cw;
  const ci = Math.cos(def.i), si = Math.sin(def.i);
  return out.set(x1, -z1 * si, z1 * ci);
}

function makeOrbitLine(def: GxPlanetDef, color: string, opacity: number) {
  const segs = 192;
  const pts: number[] = [];
  const v = new THREE.Vector3();
  for (let k = 0; k <= segs; k++) {
    const E = (k / segs) * Math.PI * 2;
    const xp = def.a * (Math.cos(E) - def.e);
    const zp = def.a * Math.sqrt(1 - def.e * def.e) * Math.sin(E);
    const cw = Math.cos(def.omega), sw = Math.sin(def.omega);
    const x1 = xp * cw - zp * sw;
    const z1 = xp * sw + zp * cw;
    const ci = Math.cos(def.i), si = Math.sin(def.i);
    v.set(x1, -z1 * si, z1 * ci);
    pts.push(v.x, v.y, v.z);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  return new THREE.Line(g, new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false }));
}

function GxMoon({ moon, parent }: { moon: GxMoonDef; parent: string }) {
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
      <sphereGeometry args={[moon.size, 20, 20]} />
      <meshStandardMaterial color={moon.color} roughness={0.95} metalness={0.02} />
    </mesh>
  );
}

function GxPlanet({ def, au }: { def: GxPlanetDef; au: number }) {
  const groupRef = useRef<THREE.Group>(null!);
  const bodyRef = useRef<THREE.Mesh>(null!);
  const phase = useMemo(() => Math.random() * Math.PI * 2, []);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const local = useMemo(() => new THREE.Vector3(), []);
  const setVisit = useStore((s) => s.setVisitPlanet);
  const surface = useMemo(() => makeSurfaceTexture(def, au), [def, au]);
  const haloTex = useMemo(() => makeGlowTexture("rgba(255,255,255,0.9)", "rgba(255,255,255,0)"), []);
  const ringTex = useMemo(() => (def.ring ? makeRingTexture(def.ring.color) : null), [def]);
  const ringGeo = useMemo(() => (def.ring ? makeRingGeometry(def.ring.inner, def.ring.outer, 128) : null), [def]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;
    groupRef.current.position.copy(keplerPosition(def, phase, t, local));
    if (bodyRef.current) bodyRef.current.rotation.y = (t / def.spinPeriod) * Math.PI * 2;
    groupRef.current.getWorldPosition(tmp);
    const reg = getRegistry();
    let v = reg.get(def.name);
    if (!v) { v = new THREE.Vector3(); reg.set(def.name, v); }
    v.copy(tmp);
  });

  return (
    <group ref={groupRef}>
      <sprite scale={[def.size * 18, def.size * 18, 1]}>
        <spriteMaterial map={haloTex} color={def.color} transparent opacity={0.55} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <group rotation={[0, 0, def.tilt]}>
        <mesh
          ref={bodyRef}
          onPointerOver={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); document.body.style.cursor = "pointer"; }}
          onPointerOut={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); document.body.style.cursor = ""; }}
          onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); setVisit(def.name); }}
        >
          <sphereGeometry args={[def.size, 40, 40]} />
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
              <sphereGeometry args={[def.size, 28, 28]} />
              <meshBasicMaterial color={def.atmosphere} transparent opacity={0.15} side={THREE.BackSide} depthWrite={false} />
            </mesh>
            <mesh scale={1.14}>
              <sphereGeometry args={[def.size, 28, 28]} />
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
      {def.moons?.map((mn) => <GxMoon key={mn.name} moon={mn} parent={def.name} />)}
    </group>
  );
}

function GxBelt({ system }: { system: GxSystemDef }) {
  const au = system.au;
  const { geom, radii, thetas, heights, omegas } = useMemo(() => {
    const n = 1200;
    const pos = new Float32Array(n * 3);
    const radii = new Float32Array(n);
    const thetas = new Float32Array(n);
    const heights = new Float32Array(n);
    const omegas = new Float32Array(n);
    const ref = system.planets[system.planets.length - 1];
    if (!ref) return { geom: g, radii, thetas, heights, omegas };
    const refAU = ref.a / au;
    const K = ref.period / Math.pow(refAU, 1.5);
    for (let i = 0; i < n; i++) {
      const rAU = system.beltInnerAU + Math.random() * (system.beltOuterAU - system.beltInnerAU);
      radii[i] = rAU * au;
      thetas[i] = Math.random() * Math.PI * 2;
      heights[i] = (Math.random() - 0.5) * 0.6 * au;
      omegas[i] = (Math.PI * 2) / (K * Math.pow(rAU, 1.5));
      pos[i * 3] = Math.cos(thetas[i]) * radii[i];
      pos[i * 3 + 1] = heights[i];
      pos[i * 3 + 2] = Math.sin(thetas[i]) * radii[i];
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return { geom: g, radii, thetas, heights, omegas };
  }, [system, au]);
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
      <pointsMaterial color="#9db6c8" size={0.012 * au} sizeAttenuation transparent opacity={0.8} depthWrite={false} />
    </points>
  );
}

/**
 * The star system, placed in the galaxy's disk and carried around the
 * galactic centre by the same rotation curve that spins the stars.
 */
function GxSystem({ m, system }: { m: GalaxyModel; system: GxSystemDef }) {
  const groupRef = useRef<THREE.Group>(null!);
  const s = system;
  const starRef = useRef<THREE.Mesh>(null!);
  const world = useMemo(() => new THREE.Vector3(), []);
  const glowTex = useMemo(() => makeGlowTexture("rgba(255,215,160,1)", "rgba(255,140,50,0)"), []);
  const orbits = useMemo(
    () => s.planets.map((p) => makeOrbitLine(p, p.confirmed ? "#ffd8a0" : "#5f7fb5", p.confirmed ? 0.5 : 0.22)),
    [s],
  );
  const omega = useMemo(() => systemOmega(m), [m]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const ang = s.orbitPhase + omega * t;
    if (groupRef.current) {
      groupRef.current.position.set(
        Math.cos(ang) * s.orbitRadius,
        s.orbitHeight,
        Math.sin(ang) * s.orbitRadius,
      );
      groupRef.current.getWorldPosition(world);
      const reg = getRegistry();
      let v = reg.get(s.star.name);
      if (!v) { v = new THREE.Vector3(); reg.set(s.star.name, v); }
      v.copy(world);
    }
    if (starRef.current) starRef.current.rotation.y = t * 0.05;
  });

  return (
    <group ref={groupRef}>
      <mesh
        ref={starRef}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); document.body.style.cursor = "pointer"; }}
        onPointerOut={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); document.body.style.cursor = ""; }}
      >
        <sphereGeometry args={[s.star.radius, 40, 40]} />
        <meshBasicMaterial color={s.star.color} />
      </mesh>
      <pointLight color={s.star.color} intensity={6} distance={40 * s.au} decay={1.4} />
      <sprite scale={[s.star.radius * 9, s.star.radius * 9, 1]}>
        <spriteMaterial map={glowTex} transparent opacity={0.45} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      {orbits.map((o, i) => <primitive key={i} object={o} />)}
      {s.planets.map((p) => <GxPlanet key={p.name} def={p} au={s.au} />)}
      <GxBelt system={s} />
      <Billboard>
        <Html center zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
          <div style={{
            transform: "translate(0px, -44px)",
            color: "#ffe6c0", fontSize: 11, letterSpacing: 1.3,
            fontFamily: "Inter, system-ui, sans-serif", whiteSpace: "nowrap",
            textShadow: "0 0 12px rgba(255,180,90,0.8)",
          }}>
            {s.star.name}
          </div>
        </Html>
      </Billboard>
    </group>
  );
}

// ---------------------------------------------------------------
// one detailed galaxy
// ---------------------------------------------------------------

function GalaxyBody({ m }: { m: GalaxyModel }) {
  const geoms = useMemo(() => buildGalaxy(m), [m]);
  const tex = useMemo(makeStarSprite, []);
  const coreTex = useMemo(() => makeGlowTexture(m.coreColor, "rgba(255,150,60,0)"), [m]);
  const center = useMemo(() => galaxyCenter(m), [m]);

  const vFlat = useMemo(() => (2 * Math.PI * (m.diskRadius * 0.5)) / m.rotPeriod, [m]);
  const rCore = m.diskRadius * 0.08;

  const shader = useMemo(
    () => ({
      uniforms: {
        uTex: { value: tex },
        uPixelRatio: { value: typeof window !== "undefined" ? window.devicePixelRatio : 1 },
        uTime: { value: 0 },
        uVflat: { value: vFlat },
        uRcore: { value: rCore },
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
    [tex, vFlat, rCore],
  );

  useFrame(({ clock }) => { shader.uniforms.uTime.value = clock.elapsedTime; });

  return (
    <group
      position={center.toArray()}
      rotation={[(m.inclination * Math.PI) / 180, 0, (m.posAngle * Math.PI) / 180]}
    >
      <group rotation={[Math.PI / 2, 0, 0]}>
        {geoms.map((g, i) => (
          <points key={i} geometry={g} frustumCulled={false}>
            <shaderMaterial args={[shader]} />
          </points>
        ))}
        <sprite scale={[m.bulgeRadius * 1.6, m.bulgeRadius * 1.6, 1]}>
          <spriteMaterial map={coreTex} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.8} />
        </sprite>
        {m.system && <GxSystem m={m} system={m.system} />}
      </group>
    </group>
  );
}

// ---------------------------------------------------------------
// LOD gate — build a galaxy only when it is selected or nearby
// ---------------------------------------------------------------

function GalaxyGate({ m }: { m: GalaxyModel }) {
  const visitGalaxy = useStore((s) => s.visitGalaxy);
  const selectedByUser = visitGalaxy?.name === m.name;
  const [near, setNear] = useState(false);
  const center = useMemo(() => galaxyCenter(m), [m]);
  const acc = useRef(0);

  useFrame(({ camera }, dt) => {
    acc.current += dt;
    if (acc.current < 0.4) return;
    acc.current = 0;
    const d = camera.position.distanceTo(center);
    const shouldBeNear = d < m.diskRadius * 14;
    if (shouldBeNear !== near) setNear(shouldBeNear);
  });

  // Give the camera a moment to start moving before paying for the build.
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!(selectedByUser || near)) { setArmed(false); return; }
    const id = setTimeout(() => setArmed(true), 120);
    return () => clearTimeout(id);
  }, [selectedByUser, near]);

  if (!armed) return null;
  return <GalaxyBody m={m} />;
}

export function DetailedGalaxies() {
  return (
    <group>
      {GALAXY_MODELS.map((m) => <GalaxyGate key={m.key} m={m} />)}
    </group>
  );
}
