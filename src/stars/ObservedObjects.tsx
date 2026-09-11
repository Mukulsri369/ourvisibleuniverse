import { Billboard, Html } from "@react-three/drei";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OBSERVED_OBJECTS, objectPosition, type ObservedObject } from "./observed-objects";
import { OBSERVED_VISUAL_PROFILES, type ObservedVisualProfile } from "./observed-object-visuals";
import { useStore } from "./store";

function seeded(seed: number) {
  let s = seed | 0;
  return () => {
    s = Math.imul(s ^ (s >>> 15), 1 | s);
    s ^= s + Math.imul(s ^ (s >>> 7), 61 | s);
    return ((s ^ (s >>> 14)) >>> 0) / 4294967296;
  };
}
function makeGlowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Texture();
  const glow = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  glow.addColorStop(0, "rgba(255,255,255,1)");
  glow.addColorStop(0.18, "rgba(255,255,255,.82)");
  glow.addColorStop(0.55, "rgba(255,255,255,.22)");
  glow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(canvas);
}

function hashSeed(id: string) {
  return id.split("").reduce((a, c) => Math.imul(a ^ c.charCodeAt(0), 16777619), 2166136261);
}

function buildNebulaGeometry(item: ObservedObject, profile: ObservedVisualProfile) {
  const count = profile.particleCount ?? 4000;
  const rand = seeded(profile.seed || hashSeed(item.id));
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const primary = new THREE.Color(item.color);
  const secondary = new THREE.Color(item.accent);
  const morphology = profile.morphology;

  for (let i = 0; i < count; i++) {
    const theta = rand() * Math.PI * 2;
    const phi = Math.acos(2 * rand() - 1);
    const radial = Math.pow(rand(), 0.58);
    let x = Math.sin(phi) * Math.cos(theta) * radial;
    let y = Math.cos(phi) * radial;
    let z = Math.sin(phi) * Math.sin(theta) * radial;
    let mix = rand();

    if (morphology === "filament-remnant") {
      const shell = 0.72 + 0.24 * rand();
      const wrinkle = 1 + 0.11 * Math.sin(theta * 7 + phi * 11);
      x *= shell * wrinkle;
      y *= shell * 0.72;
      z *= shell * 0.82;
      if (rand() < 0.24) {
        x *= 0.48;
        y *= 0.48;
        z *= 0.48;
        mix = 1;
      }
    } else if (morphology === "orion-cloud") {
      const wing = rand() < 0.55 ? -1 : 1;
      x = wing * (0.12 + Math.pow(rand(), 0.45) * 0.9);
      y = (rand() - 0.5) * (0.28 + Math.abs(x) * 0.62);
      z = (rand() - 0.5) * 0.55;
      if (rand() < 0.18) {
        x *= 0.18;
        y *= 0.18;
        z *= 0.18;
        mix = 1;
      }
    } else if (morphology === "pillars") {
      const pillar = Math.floor(rand() * 3);
      const heights = [1, 0.78, 0.62];
      const bases = [-0.36, 0.02, 0.34];
      y = -0.52 + rand() * heights[pillar];
      const taper = 0.08 + (y + 0.52) * 0.055;
      x = bases[pillar] + (rand() - 0.5) * taper + Math.sin(y * 9 + pillar) * 0.035;
      z = (rand() - 0.5) * taper * 1.3;
      mix = Math.max(0, (y + 0.25) * 1.1);
    } else if (["helix-ring", "barrel-ring", "nested-shells"].includes(morphology)) {
      const ring = morphology === "nested-shells" ? 0.35 + Math.floor(rand() * 3) * 0.22 : 0.66;
      const tube = morphology === "helix-ring" ? 0.2 : 0.16;
      const rr = ring + (rand() - 0.5) * tube;
      x = Math.cos(theta) * rr;
      z = Math.sin(theta) * rr;
      y = (rand() - 0.5) * (morphology === "barrel-ring" ? 0.72 : 0.28);
      if (morphology === "helix-ring" && rand() < 0.22) {
        x *= 1.25;
        z *= 1.25;
      }
      mix = 0.35 + Math.abs(y) * 1.6;
    } else if (morphology === "veil-arcs") {
      const arc = Math.floor(rand() * 5);
      const a = -1.1 + rand() * 2.2;
      const radius = 0.54 + arc * 0.09;
      x = Math.cos(a + arc * 0.52) * radius + (rand() - 0.5) * 0.025;
      y = Math.sin(a + arc * 0.52) * radius + (rand() - 0.5) * 0.025;
      z = (rand() - 0.5) * 0.16;
      mix = arc % 2;
    } else if (morphology === "cosmic-cliffs") {
      x = (rand() - 0.5) * 1.8;
      const ridge = -0.2 + 0.18 * Math.sin(x * 5) + 0.1 * Math.sin(x * 13);
      y = ridge - Math.pow(rand(), 1.8) * 0.65;
      z = (rand() - 0.5) * 0.55;
      if (rand() < 0.14) {
        y = ridge + rand() * 0.65;
        mix = 1;
      }
    } else if (["hourglass", "butterfly", "homunculus"].includes(morphology)) {
      const sign = rand() < 0.5 ? -1 : 1;
      y = sign * (0.08 + rand() * 0.85);
      const width = Math.pow(Math.abs(y), morphology === "butterfly" ? 0.55 : 0.75) * 0.65;
      x = (rand() - 0.5) * width * 2;
      z = (rand() - 0.5) * width * (morphology === "butterfly" ? 0.7 : 1.15);
      if (morphology === "homunculus") {
        x *= 0.68;
        z *= 0.75;
      }
      mix = Math.abs(y);
    } else if (morphology === "triple-ring") {
      const ring = Math.floor(rand() * 3);
      const rr = ring === 0 ? 0.48 : 0.7;
      x = Math.cos(theta) * rr;
      z = Math.sin(theta) * rr * (ring === 0 ? 1 : 0.72);
      y =
        ring === 0 ? (rand() - 0.5) * 0.035 : (ring === 1 ? -0.45 : 0.45) + Math.sin(theta) * 0.25;
      x += (rand() - 0.5) * 0.025;
      z += (rand() - 0.5) * 0.025;
      mix = ring === 0 ? 0 : 1;
    } else if (morphology === "pinwheel") {
      const t = rand() * Math.PI * 7;
      const rr = 0.03 + t * 0.038;
      x = Math.cos(t) * rr + (rand() - 0.5) * 0.035;
      y = (rand() - 0.5) * 0.045;
      z = Math.sin(t) * rr + (rand() - 0.5) * 0.035;
      mix = t / (Math.PI * 7);
    } else if (morphology === "disturbed-quasar") {
      const arm = rand() < 0.5 ? 0 : Math.PI;
      const rr = Math.pow(rand(), 0.55);
      const a = arm + rr * 5.5 + (rand() - 0.5) * 0.65;
      x = Math.cos(a) * rr;
      z = Math.sin(a) * rr;
      y = (rand() - 0.5) * 0.16;
    } else if (morphology === "dusty-supergiant") {
      const shell = 0.5 + rand() * 0.5;
      x *= shell;
      y *= shell;
      z *= shell;
      mix = shell;
    }

    const stretch = profile.stretch ?? [1, 1, 1];
    positions[i * 3] = x * stretch[0];
    positions[i * 3 + 1] = y * stretch[1];
    positions[i * 3 + 2] = z * stretch[2];
    const color = primary.clone().lerp(secondary, Math.min(1, Math.max(0, mix)));
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geometry;
}

function buildFilaments(profile: ObservedVisualProfile) {
  const rand = seeded(profile.seed + 77);
  const vertices: number[] = [];
  const count = profile.filamentCount ?? 0;
  for (let f = 0; f < count; f++) {
    const theta = rand() * Math.PI * 2;
    const phi = Math.acos(2 * rand() - 1);
    const axis = new THREE.Vector3(
      Math.sin(phi) * Math.cos(theta),
      Math.cos(phi),
      Math.sin(phi) * Math.sin(theta),
    );
    let previous = axis.clone().multiplyScalar(0.68 + rand() * 0.12);
    for (let j = 1; j <= 9; j++) {
      const next = axis.clone().multiplyScalar(0.7 + j * 0.025 + rand() * 0.035);
      next.x += Math.sin(j * 1.7 + f) * 0.025;
      next.y += Math.cos(j * 1.3 + f) * 0.025;
      vertices.push(previous.x, previous.y, previous.z, next.x, next.y, next.z);
      previous = next;
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  return geometry;
}

function NebulaDetail({
  item,
  profile,
  scale,
  sizeScale,
}: {
  item: ObservedObject;
  profile: ObservedVisualProfile;
  scale: number;
  /** World-space scale used for point sizing (defaults to `scale`). */
  sizeScale?: number;
}) {
  const geometry = useMemo(() => buildNebulaGeometry(item, profile), [item, profile]);
  const filaments = useMemo(() => buildFilaments(profile), [profile]);
  const texture = useMemo(makeGlowTexture, []);
  const ws = sizeScale ?? scale;
  const slowlyTurning = profile.morphology === "pinwheel";
  const group = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!group.current) return;
    const step = Math.min(dt, 0.05);
    // Every cloud drifts a little: expanding remnants and outflows are never
    // perfectly static in time-lapse imagery.
    group.current.rotation.y += step * (slowlyTurning ? (profile.spin ?? 0.1) : 0.012);
  });
  return (
    <group ref={group} rotation={profile.tilt} scale={scale}>
      {/* fine, bright knots */}
      <points geometry={geometry}>
        <pointsMaterial
          map={texture}
          vertexColors
          size={0.03 * ws}
          sizeAttenuation
          transparent
          opacity={0.85}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      {/* broad, faint haze — gives the soft nebular glow of long exposures */}
      <points geometry={geometry}>
        <pointsMaterial
          map={texture}
          vertexColors
          size={0.11 * ws}
          sizeAttenuation
          transparent
          opacity={0.16}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      {(profile.filamentCount ?? 0) > 0 && (
        <lineSegments geometry={filaments}>
          <lineBasicMaterial
            color={item.color}
            transparent
            opacity={0.5}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </lineSegments>
      )}
      {profile.morphology === "pillars" &&
        [0, 1, 2].map((n) => (
          <mesh key={n} position={[-0.36 + n * 0.34, -0.05 - n * 0.08, 0]}>
            <coneGeometry args={[0.13 - n * 0.018, 0.9 - n * 0.14, 9, 3, true]} />
            <meshBasicMaterial
              color={item.color}
              transparent
              opacity={0.16}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        ))}
      {["hourglass", "butterfly", "homunculus"].includes(profile.morphology) && (
        <mesh rotation-x={Math.PI / 2} scale={[0.34, 0.34, 0.09]}>
          <torusGeometry args={[0.42, 0.11, 10, 64]} />
          <meshBasicMaterial
            color={new THREE.Color(item.color).multiplyScalar(0.28)}
            transparent
            opacity={0.82}
            depthWrite={false}
          />
        </mesh>
      )}
      {profile.morphology === "triple-ring" &&
        Array.from({ length: 15 }, (_, n) => {
          const a = (n / 15) * Math.PI * 2;
          return (
            <mesh key={n} position={[Math.cos(a) * 0.48, 0, Math.sin(a) * 0.48]}>
              <sphereGeometry args={[0.035, 8, 6]} />
              <meshBasicMaterial color={item.accent} />
            </mesh>
          );
        })}
    </group>
  );
}


function PulsarDetail({
  item,
  profile,
  scale,
}: {
  item: ObservedObject;
  profile: ObservedVisualProfile;
  scale: number;
}) {
  const rotor = useRef<THREE.Group>(null);
  const glow = useRef<THREE.Mesh>(null);
  const companion = useRef<THREE.Group>(null);
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    if (rotor.current) rotor.current.rotation.y += Math.min(dt, 0.05) * (profile.spin ?? 1);
    if (glow.current) {
      const material = glow.current.material as THREE.MeshBasicMaterial;
      material.opacity =
        0.42 +
        Math.pow(
          Math.max(0, Math.cos((t * (Math.PI * 2)) / Math.max(profile.pulsePeriod ?? 1, 0.18))),
          10,
        ) *
          0.58;
    }
    if (companion.current) companion.current.rotation.y = t * 0.9;
  });
  const torus = profile.morphology === "pulsar-torus";
  const magnetar = profile.morphology === "magnetar";
  const binary = profile.morphology === "neutron-binary";
  return (
    <group scale={scale} rotation={profile.tilt}>
      <mesh ref={glow}>
        <sphereGeometry args={[0.1, 24, 16]} />
        <meshBasicMaterial color={item.color} transparent opacity={0.8} />
      </mesh>
      <group ref={rotor} rotation-z={profile.beamTilt ?? 0.45}>
        {[-1, 1].map((sign) => (
          <mesh key={sign} position={[0, sign * 0.65, 0]} rotation-z={sign > 0 ? 0 : Math.PI}>
            <coneGeometry args={[0.13, 1.2, 20, 1, true]} />
            <meshBasicMaterial
              color={item.accent}
              transparent
              opacity={0.22}
              side={THREE.DoubleSide}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        ))}
      </group>
      {torus && (
        <>
          <mesh rotation-x={Math.PI / 2}>
            <torusGeometry args={[0.34, 0.025, 8, 64]} />
            <meshBasicMaterial color={item.accent} transparent opacity={0.55} depthWrite={false} />
          </mesh>
          <mesh rotation-x={Math.PI / 2} scale={1.42}>
            <torusGeometry args={[0.34, 0.015, 8, 64]} />
            <meshBasicMaterial color={item.accent} transparent opacity={0.24} depthWrite={false} />
          </mesh>
        </>
      )}
      {magnetar &&
        [0, 1, 2, 3].map((n) => (
          <mesh key={n} rotation={[n * 0.48, n * 0.72, n * 0.31]}>
            <torusGeometry args={[0.36 + n * 0.055, 0.008, 6, 48]} />
            <meshBasicMaterial
              color={item.accent}
              transparent
              opacity={0.38}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        ))}
      {binary && (
        <group ref={companion}>
          <mesh position={[0.52, 0, 0]}>
            <sphereGeometry args={[0.075, 18, 12]} />
            <meshBasicMaterial color={item.accent} />
          </mesh>
        </group>
      )}
    </group>
  );
}

/**
 * Relativistic jet rendered as a stream of plasma knots that travel outward
 * along the spin axis, twisting slightly — the behaviour seen in the M87 and
 * 3C 273 time-lapse sequences rather than a static cone.
 */
function JetPlume({
  color,
  length,
  sizeScale,
}: {
  color: string;
  length: number;
  sizeScale: number;
}) {
  const N = 260;
  const { geometry, offsets, sides, radii } = useMemo(() => {
    const rand = seeded(9137);
    const positions = new Float32Array(N * 3);
    const colors = new Float32Array(N * 3);
    const offsets = new Float32Array(N);
    const sides = new Float32Array(N);
    const radii = new Float32Array(N);
    const base = new THREE.Color(color);
    for (let i = 0; i < N; i++) {
      offsets[i] = rand();
      sides[i] = rand() < 0.5 ? -1 : 1;
      radii[i] = rand();
      colors[i * 3] = base.r;
      colors[i * 3 + 1] = base.g;
      colors[i * 3 + 2] = base.b;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return { geometry: g, offsets, sides, radii };
  }, [color]);
  const texture = useMemo(makeGlowTexture, []);
  const base = useMemo(() => new THREE.Color(color), [color]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const pos = geometry.getAttribute("position") as THREE.BufferAttribute;
    const col = geometry.getAttribute("color") as THREE.BufferAttribute;
    const p = pos.array as Float32Array;
    const c = col.array as Float32Array;
    for (let i = 0; i < N; i++) {
      const f = (offsets[i] + t * 0.16) % 1;
      const y = sides[i] * (0.2 + f * length);
      // Jets stay collimated near the core and flare downstream.
      const spread = (0.012 + f * 0.09) * (0.35 + radii[i]);
      const a = radii[i] * Math.PI * 2 + f * 6.5 * sides[i];
      p[i * 3] = Math.cos(a) * spread;
      p[i * 3 + 1] = y;
      p[i * 3 + 2] = Math.sin(a) * spread;
      const fade = (1 - f) * (0.35 + 0.65 * Math.pow(1 - f, 0.5));
      c[i * 3] = base.r * fade;
      c[i * 3 + 1] = base.g * fade;
      c[i * 3 + 2] = base.b * fade;
    }
    pos.needsUpdate = true;
    col.needsUpdate = true;
  });
  return (
    <points geometry={geometry}>
      <pointsMaterial
        map={texture}
        vertexColors
        size={0.055 * sizeScale}
        sizeAttenuation
        transparent
        opacity={0.9}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function AccretionDisk({
  item,
  profile,
  scale,
  sizeScale,
  jet = false,
}: {
  item: ObservedObject;
  profile: ObservedVisualProfile;
  scale: number;
  sizeScale?: number;
  jet?: boolean;
}) {
  const ws = sizeScale ?? scale;
  const N = 3200;
  const inner = 0.235;
  const outer = 0.72;
  const { geometry, radii, phases, temps } = useMemo(() => {
    const rand = seeded(profile.seed + 517);
    const positions = new Float32Array(N * 3);
    const colors = new Float32Array(N * 3);
    const radii = new Float32Array(N);
    const phases = new Float32Array(N);
    const temps = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      // Surface density rises steeply toward the innermost stable orbit.
      const u = Math.pow(rand(), 1.7);
      radii[i] = inner + u * (outer - inner);
      phases[i] = rand() * Math.PI * 2;
      temps[i] = 1 - (radii[i] - inner) / (outer - inner);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return { geometry: g, radii, phases, temps };
  }, [profile.seed]);
  const texture = useMemo(makeGlowTexture, []);
  const hot = useMemo(() => new THREE.Color(item.accent), [item.accent]);
  const cool = useMemo(() => new THREE.Color(item.color), [item.color]);
  const tmp = useMemo(() => new THREE.Color(), []);
  const spin = profile.spin ?? 0.2;

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const pos = geometry.getAttribute("position") as THREE.BufferAttribute;
    const col = geometry.getAttribute("color") as THREE.BufferAttribute;
    const p = pos.array as Float32Array;
    const c = col.array as Float32Array;
    for (let i = 0; i < N; i++) {
      const r = radii[i];
      // Keplerian shear: inner gas laps the outer disk, producing the
      // stretched spiral texture seen in simulated black-hole imagery.
      const a = phases[i] + (t * spin * 0.22) / Math.pow(r, 1.5);
      const wobble = 1 + 0.02 * Math.sin(a * 3 + r * 30);
      p[i * 3] = Math.cos(a) * r * wobble;
      p[i * 3 + 1] = Math.sin(a) * r * wobble;
      p[i * 3 + 2] = (temps[i] - 0.5) * 0.012;
      // Relativistic Doppler beaming: the side rotating toward us is far
      // brighter than the receding side.
      const beam = 0.28 + 1.55 * Math.pow(0.5 + 0.5 * Math.sin(a), 2.6);
      const bright = beam * (0.45 + 0.9 * temps[i]);
      tmp.copy(cool).lerp(hot, Math.min(1, temps[i] * 1.15));
      c[i * 3] = Math.min(2.2, tmp.r * bright);
      c[i * 3 + 1] = Math.min(2.2, tmp.g * bright);
      c[i * 3 + 2] = Math.min(2.2, tmp.b * bright);
    }
    pos.needsUpdate = true;
    col.needsUpdate = true;
  });

  return (
    <group scale={scale} rotation={profile.tilt}>
      <group rotation-x={Math.PI / 2}>
        <points geometry={geometry}>
          <pointsMaterial
            map={texture}
            vertexColors
            size={0.028 * ws}
            sizeAttenuation
            transparent
            opacity={0.95}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      </group>
      {/* event-horizon shadow */}
      <mesh>
        <sphereGeometry args={[0.185, 32, 20]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      {/* photon ring — light bent right around the hole */}
      <mesh>
        <sphereGeometry args={[0.205, 40, 26]} />
        <meshBasicMaterial
          color={item.accent}
          transparent
          opacity={0.5}
          side={THREE.BackSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh rotation-x={Math.PI / 2}>
        <torusGeometry args={[0.222, 0.012, 12, 128]} />
        <meshBasicMaterial
          color={item.accent}
          transparent
          opacity={0.95}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {jet && (
        <>
          <JetPlume
            color={item.accent}
            length={profile.jetLength ?? 1.6}
            sizeScale={ws}
          />
          {[-1, 1].map((s) => (
            <mesh key={s} position={[0, (s * (profile.jetLength ?? 1.6)) / 2, 0]}>
              <coneGeometry args={[0.07, profile.jetLength ?? 1.6, 18, 1, true]} />
              <meshBasicMaterial
                color={item.accent}
                transparent
                opacity={s > 0 ? 0.16 : 0.06}
                side={THREE.DoubleSide}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
}


function BlackHoleDetail({
  item,
  profile,
  scale,
}: {
  item: ObservedObject;
  profile: ObservedVisualProfile;
  scale: number;
}) {
  const merger = useRef<THREE.Group>(null);
  const companion = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (merger.current) {
      const decay = 0.38 + 0.2 * (0.5 + 0.5 * Math.sin(t * 0.45));
      merger.current.rotation.y = t * 1.5;
      merger.current.scale.setScalar(decay);
    }
    if (companion.current) companion.current.rotation.y = t * 0.5;
  });
  if (profile.morphology === "merger")
    return (
      <group scale={scale} rotation={profile.tilt}>
        <group ref={merger}>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.55, 0, 0]}>
              <sphereGeometry args={[s > 0 ? 0.2 : 0.17, 24, 18]} />
              <meshBasicMaterial color="#000000" />
            </mesh>
          ))}
        </group>
        <mesh rotation-x={Math.PI / 2}>
          <ringGeometry args={[0.55, 0.58, 96]} />
          <meshBasicMaterial
            color={item.accent}
            transparent
            opacity={0.18}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      </group>
    );
  if (profile.morphology === "xray-binary")
    return (
      <group scale={scale} rotation={profile.tilt}>
        <AccretionDisk
          item={item}
          profile={{ ...profile, tilt: [0, 0, 0] }}
          scale={0.65}
          sizeScale={scale * 0.65}
          jet
        />
        <group ref={companion}>
          <mesh position={[0.78, 0, 0]}>
            <sphereGeometry args={[0.25, 28, 20]} />
            <meshBasicMaterial color="#9ec5ff" />
          </mesh>
        </group>
        <mesh rotation-z={Math.PI / 2} position={[0.46, 0, 0]}>
          <coneGeometry args={[0.12, 0.55, 14, 1, true]} />
          <meshBasicMaterial
            color={item.accent}
            transparent
            opacity={0.25}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      </group>
    );
  return (
    <AccretionDisk
      item={item}
      profile={profile}
      scale={scale}
      jet={profile.morphology === "eht-jet"}
    />
  );
}

function QuasarDetail({
  item,
  profile,
  scale,
}: {
  item: ObservedObject;
  profile: ObservedVisualProfile;
  scale: number;
}) {
  if (profile.morphology === "disturbed-quasar")
    return (
      <group>
        <NebulaDetail item={item} profile={profile} scale={scale} />
        <AccretionDisk
          item={item}
          profile={{ ...profile, tilt: profile.tilt }}
          scale={scale * 0.18}
          sizeScale={scale * 0.18}
          jet
        />
      </group>
    );
  return (
    <AccretionDisk
      item={item}
      profile={profile}
      scale={scale}
      jet={profile.morphology !== "unresolved-quasar"}
    />
  );
}

/**
 * Convecting stellar photosphere: value-noise granulation cells that boil over
 * time, limb darkening toward the edge of the disk, and cooler spots — the
 * look of resolved surface imagery (ALMA/VLTI Betelgeuse, SDO for the Sun)
 * rather than a flat coloured ball.
 */
const STAR_VERT = `
varying vec3 vN; varying vec3 vP; varying vec3 vView;
void main(){
  vN = normalize(normalMatrix * normal);
  vP = position;
  vec4 mv = modelViewMatrix * vec4(position,1.0);
  vView = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`;
const STAR_FRAG = `
uniform float uTime; uniform vec3 uCool; uniform vec3 uHot;
uniform float uGran; uniform float uSpots; uniform float uActivity;
varying vec3 vN; varying vec3 vP; varying vec3 vView;
float hash(vec3 p){ return fract(sin(dot(p, vec3(127.1,311.7,74.7)))*43758.5453); }
float vnoise(vec3 p){
  vec3 i = floor(p), f = fract(p);
  f = f*f*(3.0-2.0*f);
  float n000=hash(i), n100=hash(i+vec3(1,0,0)), n010=hash(i+vec3(0,1,0)), n110=hash(i+vec3(1,1,0));
  float n001=hash(i+vec3(0,0,1)), n101=hash(i+vec3(1,0,1)), n011=hash(i+vec3(0,1,1)), n111=hash(i+vec3(1,1,1));
  return mix(mix(mix(n000,n100,f.x),mix(n010,n110,f.x),f.y),
             mix(mix(n001,n101,f.x),mix(n011,n111,f.x),f.y),f.z);
}
float fbm(vec3 p){
  float a=0.5, s=0.0;
  for(int i=0;i<4;i++){ s += a*vnoise(p); p*=2.03; a*=0.5; }
  return s;
}
void main(){
  vec3 q = normalize(vP);
  float cells = fbm(q*uGran + vec3(0.0, uTime*0.05, 0.0));
  float fine = fbm(q*uGran*2.7 + vec3(uTime*0.09, 0.0, uTime*0.04));
  float t = clamp(cells*0.72 + fine*0.38, 0.0, 1.0);
  // cool starspots / dust patches
  float spot = smoothstep(0.62, 0.86, fbm(q*2.1 + vec3(11.0, uTime*0.02, 3.0)));
  float limb = pow(max(dot(normalize(vN), normalize(vView)), 0.0), 0.55);
  vec3 col = mix(uCool, uHot, t);
  col = mix(col, uCool*0.42, spot*uSpots);
  col *= 0.42 + 0.72*limb;
  // faint chromospheric shimmer at the limb
  col += uHot * pow(1.0 - limb, 3.0) * uActivity * 0.5;
  gl_FragColor = vec4(col, 1.0);
}`;

function StarDetail({
  item,
  profile,
  scale,
}: {
  item: ObservedObject;
  profile: ObservedVisualProfile;
  scale: number;
}) {
  const star = useRef<THREE.Mesh>(null);
  const dwarf = profile.morphology === "white-dwarf";
  const dustProfile =
    profile.morphology === "dusty-supergiant"
      ? profile
      : { ...profile, morphology: "dusty-supergiant" as const, particleCount: 900 };
  const material = useMemo(() => {
    const cool = new THREE.Color(item.color).multiplyScalar(dwarf ? 0.9 : 0.72);
    const hot = new THREE.Color(item.color).lerp(new THREE.Color(item.accent), 0.35);
    return new THREE.ShaderMaterial({
      vertexShader: STAR_VERT,
      fragmentShader: STAR_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uCool: { value: cool },
        uHot: { value: hot.multiplyScalar(dwarf ? 1.35 : 1.15) },
        uGran: { value: dwarf ? 16 : 6.5 },
        uSpots: { value: dwarf ? 0.15 : 0.75 },
        uActivity: { value: dwarf ? 0.25 : 0.6 },
      },
    });
  }, [item.color, item.accent, dwarf]);
  const corona = useMemo(makeGlowTexture, []);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    material.uniforms.uTime.value = t;
    if (!star.current) return;
    star.current.rotation.y = t * (profile.spin ?? 0.02);
    // Giants and variables breathe; degenerate dwarfs do not.
    const pulse = dwarf ? 1 : 1 + Math.sin(t * 0.55) * 0.035 + Math.sin(t * 0.21) * 0.02;
    star.current.scale.set(pulse, pulse * 0.985, pulse * 1.01);
  });
  return (
    <group scale={scale} rotation={profile.tilt}>
      <mesh ref={star} material={material}>
        <icosahedronGeometry args={[0.34, 5]} />
      </mesh>
      {/* tenuous outer atmosphere / extended envelope */}
      {!dwarf && (
        <mesh>
          <sphereGeometry args={[0.4, 32, 22]} />
          <meshBasicMaterial
            color={item.color}
            transparent
            opacity={0.13}
            side={THREE.BackSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
      {/* soft corona sprite so the star reads as luminous, not solid */}
      <sprite scale={dwarf ? 1.5 : 2.3}>
        <spriteMaterial
          map={corona}
          color={item.accent}
          transparent
          opacity={dwarf ? 0.5 : 0.38}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
      {!dwarf && (
        <NebulaDetail item={item} profile={dustProfile} scale={0.72} sizeScale={scale * 0.72} />
      )}
    </group>
  );
}

function Detail({ item, scale }: { item: ObservedObject; scale: number }) {
  const profile = OBSERVED_VISUAL_PROFILES[item.id];
  if (!profile) return null;
  if (["pulsar-torus", "radio-pulsar", "magnetar", "neutron-binary"].includes(profile.morphology))
    return <PulsarDetail item={item} profile={profile} scale={scale} />;
  if (["eht-ring", "eht-jet", "xray-binary", "merger"].includes(profile.morphology))
    return <BlackHoleDetail item={item} profile={profile} scale={scale} />;
  if (
    ["quasar-jet", "blazar", "disturbed-quasar", "unresolved-quasar"].includes(profile.morphology)
  )
    return <QuasarDetail item={item} profile={profile} scale={scale} />;
  if (["white-dwarf", "red-supergiant", "dusty-supergiant"].includes(profile.morphology))
    return <StarDetail item={item} profile={profile} scale={scale} />;
  return <NebulaDetail item={item} profile={profile} scale={scale} />;
}
function ObjectNode({ item }: { item: ObservedObject }) {
  const selected = useStore((s) => s.selectedObjectId === item.id),
    select = useStore((s) => s.setSelectedObject);
  const [hover, setHover] = useState(false);
  const position = objectPosition(item);
  const physical = Math.max(item.diameterLy, 0.000000001);
  const closeScale = Math.max(
    physical,
    item.category === "Quasar" ? physical : 2e-7,
  );
  const pick = Math.max(physical, item.distance * 2e-5, 0.000001);
  const click = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    select(item.id);
  };
  return (
    <group position={position}>
      <mesh
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
        }}
        onPointerOut={() => setHover(false)}
        onClick={click}
      >
        <sphereGeometry args={[pick, 8, 6]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {selected && <Detail item={item} scale={closeScale} />}{" "}
      {hover && (
        <Billboard>
          <Html
            center
            distanceFactor={Math.max(pick * 15, 0.00001)}
            style={{ pointerEvents: "auto" }}
          >
            <button
              onClick={() => select(item.id)}
              className="whitespace-nowrap rounded-md border border-white/15 bg-black/80 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-white backdrop-blur"
            >
              {item.name}
              <span className="ml-2 text-white/45">{item.category}</span>
            </button>
          </Html>
        </Billboard>
      )}
    </group>
  );
}
export function ObservedObjects() {
  return (
    <>
      {OBSERVED_OBJECTS.map((item) => (
        <ObjectNode key={item.id} item={item} />
      ))}
    </>
  );
}
