import { galaxyOrientation } from "./galaxy-models";
import { lodManager } from "./lod/LODTransitionManager";
import { galaxyAppearance } from "./galaxy-appearance";
import { useGalaxyJourney } from "./galaxy-journey";
import { galaxyDetailAlpha, galaxyPresentationAlpha } from "./galaxy-detail-state";
import { GalaxyRadiance, ANDROMEDA_APPEARANCE, MILKY_WAY_APPEARANCE } from "./GalaxyRadiance";
import { motionTimeSeconds, backgroundFocus } from "./sim-clock";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import { SafeHtml as Html } from "./SafeHtml";
import { useStore } from "./store";
import {
  GALAXY_MODELS,
  galaxyCenter,
  systemOmega,
  systemPresentationScale,
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
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

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
  const W = 512,
    H = 256;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
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
      ctx.lineTo(W, y + h);
      ctx.lineTo(0, y + h);
      ctx.closePath();
      ctx.fill();
      y += h;
    }
    ctx.globalAlpha = 1;
    for (let i = 0; i < 4; i++) {
      const sx = rand() * W,
        sy = H * (0.25 + rand() * 0.5);
      const rx = 14 + rand() * 34,
        ry = rx * 0.45;
      const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, rx);
      g.addColorStop(0, i === 0 ? "#d0603a" : shade(1.3));
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.save();
      ctx.translate(sx, sy);
      ctx.scale(1, ry / rx);
      ctx.translate(-sx, -sy);
      ctx.beginPath();
      ctx.arc(sx, sy, rx, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  } else {
    for (let i = 0; i < 900; i++) {
      const x = rand() * W,
        y = rand() * H;
      const r = 2 + rand() * 22;
      ctx.globalAlpha = 0.05 + rand() * 0.18;
      ctx.fillStyle = shade(0.6 + rand() * 0.9);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
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
  const W = 256,
    H = 4;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
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
  const cw = Math.cos(def.omega),
    sw = Math.sin(def.omega);
  const x1 = xp * cw - zp * sw;
  const z1 = xp * sw + zp * cw;
  const ci = Math.cos(def.i),
    si = Math.sin(def.i);
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
    const cw = Math.cos(def.omega),
      sw = Math.sin(def.omega);
    const x1 = xp * cw - zp * sw;
    const z1 = xp * sw + zp * cw;
    const ci = Math.cos(def.i),
      si = Math.sin(def.i);
    v.set(x1, -z1 * si, z1 * ci);
    pts.push(v.x, v.y, v.z);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  return new THREE.Line(
    g,
    new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false }),
  );
}

function GxMoon({
  moon,
  parent,
  displayScale,
}: {
  moon: GxMoonDef;
  parent: string;
  displayScale: number;
}) {
  const ref = useRef<THREE.Mesh>(null!);
  useEffect(
    () => () => {
      window.__exoSizes?.delete(parent + " · " + moon.name);
      getRegistry().delete(parent + " · " + moon.name);
    },
    [parent, moon.name],
  );
  const phase = useMemo(() => Math.random() * Math.PI * 2, []);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => {
    if (!ref.current) return;
    const t = motionTimeSeconds();
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
    if (!window.__exoSizes) window.__exoSizes = new Map();
    window.__exoSizes.set(key, moon.size * displayScale);
    let v = reg.get(key);
    if (!v) {
      v = new THREE.Vector3();
      reg.set(key, v);
    }
    v.copy(tmp);
  }, -1.5);
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[moon.size, 20, 20]} />
      <meshStandardMaterial color={moon.color} roughness={0.95} metalness={0.02} />
    </mesh>
  );
}

function GxPlanet({
  def,
  au,
  displayScale,
}: {
  def: GxPlanetDef;
  au: number;
  displayScale: number;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const bodyRef = useRef<THREE.Mesh>(null!);
  const phase = useMemo(() => Math.random() * Math.PI * 2, []);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const local = useMemo(() => new THREE.Vector3(), []);
  const setVisit = useStore((s) => s.setVisitPlanet);
  useEffect(() => {
    window.__exoSizes ??= new Map();
    window.__exoSizes.set(def.name, def.size * displayScale);
    return () => {
      window.__exoSizes?.delete(def.name);
      getRegistry().delete(def.name);
    };
  }, [def.name, def.size, displayScale]);
  const surface = useMemo(() => makeSurfaceTexture(def, au), [def, au]);
  const haloTex = useMemo(
    () => makeGlowTexture("rgba(255,255,255,0.9)", "rgba(255,255,255,0)"),
    [],
  );
  const ringTex = useMemo(() => (def.ring ? makeRingTexture(def.ring.color) : null), [def]);
  const ringGeo = useMemo(
    () => (def.ring ? makeRingGeometry(def.ring.inner, def.ring.outer, 128) : null),
    [def],
  );

  useEffect(
    () => () => {
      surface.dispose();
      haloTex.dispose();
      ringTex?.dispose();
      ringGeo?.dispose();
    },
    [surface, haloTex, ringTex, ringGeo],
  );
  useFrame(() => {
    if (!groupRef.current) return;
    const t = motionTimeSeconds();
    groupRef.current.position.copy(keplerPosition(def, phase, t, local));
    if (bodyRef.current) bodyRef.current.rotation.y = (t / def.spinPeriod) * Math.PI * 2;
    groupRef.current.getWorldPosition(tmp);
    const reg = getRegistry();
    let v = reg.get(def.name);
    if (!v) {
      v = new THREE.Vector3();
      reg.set(def.name, v);
    }
    v.copy(tmp);
  }, -2);

  return (
    <group ref={groupRef}>
      <sprite scale={[def.size * 18, def.size * 18, 1]}>
        <spriteMaterial
          map={haloTex}
          color={def.color}
          transparent
          opacity={0.55}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
      <group rotation={[0, 0, def.tilt]}>
        <mesh
          ref={bodyRef}
          onPointerOver={(e: ThreeEvent<PointerEvent>) => {
            e.stopPropagation();
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={(e: ThreeEvent<PointerEvent>) => {
            e.stopPropagation();
            document.body.style.cursor = "";
          }}
          onClick={(e: ThreeEvent<MouseEvent>) => {
            if (e.delta > 4) return;
            e.stopPropagation();
            setVisit(def.name);
          }}
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
              <meshBasicMaterial
                color={def.atmosphere}
                transparent
                opacity={0.15}
                side={THREE.BackSide}
                depthWrite={false}
              />
            </mesh>
            <mesh scale={1.14}>
              <sphereGeometry args={[def.size, 28, 28]} />
              <meshBasicMaterial
                color={def.atmosphere}
                transparent
                opacity={0.07}
                side={THREE.BackSide}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          </>
        )}
        {def.ring && ringGeo && (
          <mesh geometry={ringGeo} rotation={[Math.PI / 2, 0, 0]}>
            <meshBasicMaterial
              map={ringTex ?? undefined}
              color={def.ring.color}
              side={THREE.DoubleSide}
              transparent
              opacity={0.9}
              depthWrite={false}
            />
          </mesh>
        )}
      </group>
      {def.moons?.map((mn) => (
        <GxMoon key={mn.name} moon={mn} parent={def.name} displayScale={displayScale} />
      ))}
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
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
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
    return { geom: g, radii, thetas, heights, omegas };
  }, [system, au]);
  const beltTick = useRef(0);
  useFrame(() => {
    if (beltTick.current++ % 3 !== 0) return;
    const t = motionTimeSeconds();
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
      <pointsMaterial
        color="#9db6c8"
        size={0.012 * au}
        sizeAttenuation
        transparent
        opacity={0.8}
        depthWrite={false}
      />
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
  const displayScale = systemPresentationScale(m);
  const starRef = useRef<THREE.Mesh>(null!);
  const world = useMemo(() => new THREE.Vector3(), []);
  const glowTex = useMemo(() => makeGlowTexture("rgba(255,215,160,1)", "rgba(255,140,50,0)"), []);
  const orbits = useMemo(
    () =>
      s.planets.map((p) =>
        makeOrbitLine(p, p.confirmed ? "#ffd8a0" : "#5f7fb5", p.confirmed ? 0.5 : 0.22),
      ),
    [s],
  );
  const omega = useMemo(() => systemOmega(m), [m]);
  useEffect(
    () => () => {
      glowTex.dispose();
      for (const line of orbits) {
        line.geometry.dispose();
        line.material.dispose();
      }
      getRegistry().delete(s.star.name);
    },
    [glowTex, orbits, s.star.name],
  );

  useFrame(() => {
    const t = motionTimeSeconds();
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
      if (!v) {
        v = new THREE.Vector3();
        reg.set(s.star.name, v);
      }
      v.copy(world);
    }
    if (starRef.current) starRef.current.rotation.y = t * 0.05;
  }, -2.5);

  return (
    <group ref={groupRef} name={"galaxy-content:" + m.name}>
      <group scale={displayScale}>
        <mesh
          ref={starRef}
          onPointerOver={(e: ThreeEvent<PointerEvent>) => {
            e.stopPropagation();
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={(e: ThreeEvent<PointerEvent>) => {
            e.stopPropagation();
            document.body.style.cursor = "";
          }}
        >
          <sphereGeometry args={[s.star.radius, 40, 40]} />
          <meshBasicMaterial color={s.star.color} />
        </mesh>
        <pointLight
          color={s.star.color}
          intensity={6}
          distance={40 * s.au * displayScale}
          decay={1.4}
        />
        <sprite scale={[s.star.radius * 9, s.star.radius * 9, 1]}>
          <spriteMaterial
            map={glowTex}
            transparent
            opacity={0.45}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>
        {orbits.map((o, i) => (
          <primitive key={i} object={o} />
        ))}
        {s.planets.map((p) => (
          <GxPlanet key={p.name} def={p} au={s.au} displayScale={displayScale} />
        ))}
        {s.beltOuterAU > s.beltInnerAU && <GxBelt system={s} />}
        <Billboard>
          <Html center zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
            <div
              style={{
                transform: "translate(0px, -44px)",
                color: "#ffe6c0",
                fontSize: 11,
                letterSpacing: 1.3,
                fontFamily: "Inter, system-ui, sans-serif",
                whiteSpace: "nowrap",
                textShadow: "0 0 12px rgba(255,180,90,0.8)",
              }}
            >
              {s.star.name}
            </div>
          </Html>
        </Billboard>
      </group>
    </group>
  );
}

// ---------------------------------------------------------------
// one detailed galaxy
// ---------------------------------------------------------------

function GalaxyBody({ m }: { m: GalaxyModel }) {
  const entered = useGalaxyJourney(
    (s) =>
      s.galaxy?.name === m.name &&
      (s.mode === "flying" || s.mode === "paused" || s.mode === "inside"),
  );
  const selected = useStore((s) => s.visitGalaxy?.name === m.name);
  const blend = useRef(0);
  useEffect(
    () => () => {
      galaxyDetailAlpha.delete(m.key);
      galaxyPresentationAlpha.delete(m.name);
    },
    [m.key, m.name],
  );
  const center = useMemo(() => galaxyCenter(m), [m]);
  const orientation = useMemo(() => galaxyOrientation(m), [m]);
  const ref = useRef<THREE.Group>(null!);
  const viewportHeight = useThree((s) => s.size.height);
  useFrame(({ camera }, dt) => {
    const lod = lodManager.evaluate(
      m.key,
      camera,
      center,
      { objectRadiusLy: m.diskRadius, enterHighDetailPixels: 45, exitHighDetailPixels: 22 },
      viewportHeight,
    );
    if (ref.current) {
      const volume = ref.current.getObjectByName("galaxy-radiance:" + m.name) as THREE.Mesh;
      const mat = volume?.material as THREE.ShaderMaterial;
      const ready = mat && mat.uniforms.uCacheFade.value > 0.9;
      blend.current = THREE.MathUtils.damp(
        blend.current,
        ready ? (entered || selected ? 1 : lod.alphaNear) : 0,
        10,
        Math.min(dt, 0.1),
      );
      galaxyDetailAlpha.set(m.key, blend.current);
      galaxyPresentationAlpha.set(m.name, blend.current);
      ref.current.visible = blend.current > 0.001;

      if (mat)
        mat.uniforms.uOpacity.value =
          blend.current * (m.name === "Milky Way" ? backgroundFocus() : 1);
    }
  });
  return (
    <group position={center.toArray()} quaternion={orientation}>
      <group ref={ref}>
        <GalaxyRadiance model={m} />
        {entered && m.system && <GxSystem m={m} system={m.system} />}
      </group>
    </group>
  );
}

// ---------------------------------------------------------------
// LOD gate — continuous hysteresis switch with smooth mount
// ---------------------------------------------------------------

function GalaxyGate({ m }: { m: GalaxyModel }) {
  const selected = useStore((s) => s.visitGalaxy?.name === m.name);
  const entered = useGalaxyJourney((s) => s.galaxy?.name === m.name);
  return selected || entered ? <GalaxyBody m={m} /> : null;
}

function SelectedSurveyDetail() {
  const selected = useStore((s) => s.visitGalaxy),
    active = useGalaxyJourney((s) => s.galaxy),
    g = active ?? selected;
  // A camera-focus change must not rebuild an entered 100k-star population.
  const signature = g
    ? JSON.stringify({
        name: g.name,
        x: g.x,
        y: g.y,
        z: g.z,
        size: g.size,
        distance: g.distance,
        type: g.type,
      })
    : "";
  const model = useMemo(() => {
    if (!signature) return null;
    const descriptor = JSON.parse(signature) as import("./store").VisitGalaxy;
    return !GALAXY_MODELS.some((m) => m.name === descriptor.name) &&
      descriptor.name !== "Milky Way" &&
      descriptor.name !== "Andromeda (M31)" &&
      !/galaxy cluster|supercluster|cosmic web/i.test(descriptor.type)
      ? galaxyAppearance(descriptor)
      : null;
  }, [signature]);
  return model ? <GalaxyBody m={model} /> : null;
}

export function DetailedGalaxies() {
  const subsystems = useStore((s) => s.subsystems);
  if (!subsystems.detailedGalaxies) return null;

  return (
    <group>
      <SelectedSurveyDetail />
      <GalaxyGate m={MILKY_WAY_APPEARANCE} />
      <GalaxyGate m={ANDROMEDA_APPEARANCE} />
      {GALAXY_MODELS.map((m) => (
        <GalaxyGate key={m.key} m={m} />
      ))}
    </group>
  );
}
