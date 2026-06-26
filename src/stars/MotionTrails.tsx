import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { PLANETS } from "./Planets";
import { GALACTIC_CENTER, SUN_ORBIT_PERIOD_SEC } from "./SceneObjects";

// ---------------------------------------------------------------------------
// MOTION TRAILS — visualize the true helical motion of the Sun and every
// planet through the galaxy. The Sun is fixed at the scene origin while the
// MilkyWay shader rotates the galactic disc by (omega(r) - omega_sun) * t.
// To draw the inertial galactic frame, we use a group anchored at the
// galactic center and counter-rotating at -omega_sun, so the Sun's path is
// a circle in that frame's local coordinates and each planet superposes its
// heliocentric ellipse on top — producing a helix.
//
// Each trail keeps a ring buffer of samples. Older samples fade out over
// TRAIL_LIFE seconds via a per-vertex alpha attribute, so the line tail
// disappears a few seconds after it is drawn.
// ---------------------------------------------------------------------------

const TRAIL_LIFE = 6;          // seconds visible
const SAMPLES_PER_SEC = 30;    // sampling rate
const MAX_SAMPLES = TRAIL_LIFE * SAMPLES_PER_SEC;
const OMEGA_SUN = (Math.PI * 2) / SUN_ORBIT_PERIOD_SEC;

type Trail = {
  positions: Float32Array;
  alphas: Float32Array;
  birth: Float32Array;
  head: number;
  count: number;
  geom: THREE.BufferGeometry;
  color: THREE.Color;
};

function makeTrail(colorHex: string): Trail {
  const positions = new Float32Array(MAX_SAMPLES * 3);
  const alphas = new Float32Array(MAX_SAMPLES);
  const birth = new Float32Array(MAX_SAMPLES);
  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geom.setAttribute("aAlpha", new THREE.BufferAttribute(alphas, 1));
  geom.setDrawRange(0, 0);
  return { positions, alphas, birth, head: 0, count: 0, geom, color: new THREE.Color(colorHex) };
}

const trailShader = {
  uniforms: { uColor: { value: new THREE.Color("#ffffff") } },
  vertexShader: /* glsl */ `
    attribute float aAlpha;
    varying float vAlpha;
    void main(){
      vAlpha = aAlpha;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform vec3 uColor;
    varying float vAlpha;
    void main(){
      if (vAlpha <= 0.001) discard;
      gl_FragColor = vec4(uColor, vAlpha);
    }
  `,
};

export function MotionTrails() {
  const groupRef = useRef<THREE.Group>(null!);
  const lastSampleRef = useRef(0);
  const tmpLocal = useMemo(() => new THREE.Vector3(), []);
  const tmpScene = useMemo(() => new THREE.Vector3(), []);

  const trails = useMemo(() => {
    const map = new Map<string, Trail>();
    map.set("__sun__", makeTrail("#ffd28a"));
    for (const p of PLANETS) map.set(p.name, makeTrail(p.color));
    return map;
  }, []);

  const lineObjects = useMemo(() => {
    const arr: { name: string; line: THREE.Line }[] = [];
    trails.forEach((t, name) => {
      const mat = new THREE.ShaderMaterial({
        uniforms: { uColor: { value: t.color.clone() } },
        vertexShader: trailShader.vertexShader,
        fragmentShader: trailShader.fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      arr.push({ name, line: new THREE.Line(t.geom, mat) });
    });
    return arr;
  }, [trails]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    // Counter-rotate against galaxy shader's omega_sun subtraction, so this
    // frame becomes the inertial galactic frame.
    if (groupRef.current) groupRef.current.rotation.y = -OMEGA_SUN * t;

    // Sample at a fixed rate to keep buffer life predictable.
    const dt = 1 / SAMPLES_PER_SEC;
    if (t - lastSampleRef.current < dt) {
      // still update alphas every frame for smooth fade
      updateAlphas(trails, t);
      return;
    }
    lastSampleRef.current = t;

    // Map a scene-space point P into this group's local frame:
    //   local = R_y(+OMEGA_SUN * t) * (P - GC)
    const cos = Math.cos(OMEGA_SUN * t);
    const sin = Math.sin(OMEGA_SUN * t);
    const toLocal = (P: THREE.Vector3, out: THREE.Vector3) => {
      const x = P.x - GALACTIC_CENTER.x;
      const y = P.y - GALACTIC_CENTER.y;
      const z = P.z - GALACTIC_CENTER.z;
      out.set(x * cos + z * sin, y, -x * sin + z * cos);
    };

    // Sun at scene origin
    tmpScene.set(0, 0, 0);
    toLocal(tmpScene, tmpLocal);
    pushSample(trails.get("__sun__")!, tmpLocal, t);

    // Planets from the live registry
    const reg = window.__planetPositions;
    if (reg) {
      for (const p of PLANETS) {
        const wp = reg.get(p.name);
        if (!wp) continue;
        toLocal(wp, tmpLocal);
        pushSample(trails.get(p.name)!, tmpLocal, t);
      }
    }

    updateAlphas(trails, t);
  });

  return (
    <group ref={groupRef} position={GALACTIC_CENTER.toArray()}>
      {lineObjects.map(({ name, line }) => (
        <primitive key={name} object={line} />
      ))}
    </group>
  );
}

function pushSample(tr: Trail, p: THREE.Vector3, time: number) {
  const i = tr.head;
  tr.positions[i * 3] = p.x;
  tr.positions[i * 3 + 1] = p.y;
  tr.positions[i * 3 + 2] = p.z;
  tr.birth[i] = time;
  tr.head = (tr.head + 1) % MAX_SAMPLES;
  if (tr.count < MAX_SAMPLES) tr.count++;
}

function updateAlphas(trails: Map<string, Trail>, time: number) {
  trails.forEach((tr) => {
    if (tr.count < 2) {
      tr.geom.setDrawRange(0, 0);
      return;
    }
    // Build a contiguous line strip ordered oldest -> newest.
    const posAttr = tr.geom.getAttribute("position") as THREE.BufferAttribute;
    const aAttr = tr.geom.getAttribute("aAlpha") as THREE.BufferAttribute;
    const ordered = new Float32Array(tr.count * 3);
    const orderedA = new Float32Array(tr.count);
    const start = (tr.head - tr.count + MAX_SAMPLES) % MAX_SAMPLES;
    for (let k = 0; k < tr.count; k++) {
      const src = (start + k) % MAX_SAMPLES;
      ordered[k * 3] = tr.positions[src * 3];
      ordered[k * 3 + 1] = tr.positions[src * 3 + 1];
      ordered[k * 3 + 2] = tr.positions[src * 3 + 2];
      const age = time - tr.birth[src];
      const life = Math.max(0, 1 - age / TRAIL_LIFE);
      orderedA[k] = life * life;
    }
    (posAttr.array as Float32Array).set(ordered);
    (aAttr.array as Float32Array).set(orderedA);
    posAttr.needsUpdate = true;
    aAttr.needsUpdate = true;
    tr.geom.setDrawRange(0, tr.count);
    tr.geom.computeBoundingSphere();
  });
}
