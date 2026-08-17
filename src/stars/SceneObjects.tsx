import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

export function Sun() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const coronaRef = useRef<THREE.Sprite>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);

  const coronaTex = useMemo(() => makeRadialTexture("rgba(255,180,80,1)", "rgba(255,100,30,0)"), []);

  const shader = useMemo(
    () => ({
      uniforms: { uTime: { value: 0 } },
      vertexShader: /* glsl */ `
        varying vec3 vPos;
        varying vec3 vNormal;
        void main() {
          vPos = position;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        varying vec3 vPos;
        varying vec3 vNormal;
        // hash + simplex-ish noise
        float hash(vec3 p){ return fract(sin(dot(p, vec3(127.1,311.7,74.7))) * 43758.5453); }
        float noise(vec3 p){
          vec3 i = floor(p), f = fract(p);
          float n = mix(mix(mix(hash(i), hash(i+vec3(1,0,0)), f.x),
                            mix(hash(i+vec3(0,1,0)), hash(i+vec3(1,1,0)), f.x), f.y),
                        mix(mix(hash(i+vec3(0,0,1)), hash(i+vec3(1,0,1)), f.x),
                            mix(hash(i+vec3(0,1,1)), hash(i+vec3(1,1,1)), f.x), f.y), f.z);
          return n;
        }
        float fbm(vec3 p){
          float v=0., a=0.5;
          for(int i=0;i<5;i++){ v += a*noise(p); p*=2.03; a*=0.5; }
          return v;
        }
        void main(){
          vec3 p = normalize(vPos) * 2.0;
          float n = fbm(p + vec3(uTime*0.15));
          float hot = fbm(p*2.0 - vec3(uTime*0.25));
          vec3 deep = vec3(0.7, 0.15, 0.0);
          vec3 mid  = vec3(1.0, 0.45, 0.1);
          vec3 hi   = vec3(1.0, 0.95, 0.6);
          vec3 col = mix(deep, mid, smoothstep(0.2, 0.6, n));
          col = mix(col, hi, smoothstep(0.55, 0.95, hot));
          float fres = pow(1.0 - max(dot(vNormal, vec3(0,0,1)), 0.0), 2.0);
          col += vec3(1.0,0.5,0.2) * fres * 0.6;
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    }),
    [],
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (meshRef.current) {
      (meshRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = t;
      meshRef.current.rotation.y = t * 0.05;
    }
    if (coronaRef.current) {
      // corona stays a visible fraction of the now much smaller Solar System
      const s = 0.16 + Math.sin(t * 0.8) * 0.006;
      coronaRef.current.scale.set(s, s, 1);
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.3;
      const s = 1 + Math.sin(t * 1.2) * 0.05;
      ringRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.015, 64, 64]} />
        <shaderMaterial args={[shader]} />
      </mesh>
      <pointLight color="#ffb060" intensity={4} distance={5} decay={1.2} />
      <sprite ref={coronaRef}>
        <spriteMaterial map={coronaTex} blending={THREE.AdditiveBlending} depthWrite={false} transparent opacity={0.35} />
      </sprite>
    </group>
  );
}

function makeRadialTexture(inner: string, outer: string): THREE.Texture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, inner);
  g.addColorStop(1, outer);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

function makeFlareTexture(): THREE.Texture {
  const w = 512, h = 32;
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, w, 0);
  g.addColorStop(0, "rgba(255,200,120,0)");
  g.addColorStop(0.5, "rgba(255,230,180,1)");
  g.addColorStop(1, "rgba(255,200,120,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  return new THREE.CanvasTexture(canvas);
}

export function OrientationDisc() {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.2, 2.5, 64]} />
      <meshBasicMaterial color="#3344aa" transparent opacity={0.05} side={THREE.DoubleSide} />
    </mesh>
  );
}

export function OortCloud() {
  const ref = useRef<THREE.Points>(null!);
  const geometry = useMemo(() => {
    const count = 3000;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 0.95 + Math.random() * 0.15; // ~1 ly shell
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi);
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);
  useFrame(({ camera }) => {
    if (!ref.current) return;
    const d = camera.position.length();
    const opacity = Math.max(0, Math.min(0.6, (d - 0.3) / 5)) * Math.max(0, Math.min(1, (60 - d) / 60));
    (ref.current.material as THREE.PointsMaterial).opacity = opacity;
  });
  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial color="#88aaff" size={0.05} sizeAttenuation transparent opacity={0} depthWrite={false} />
    </points>
  );
}

// ---------------------------------------------------------------
// MILKY WAY — real 3D particle galaxy with bulge, spiral disk,
// halo, and Sgr A* at the galactic center. The Sun sits at
// scene origin; the galactic center is offset by R0 ≈ 26,000 ly
// along -X (matching the IAU-recommended Sun-to-Sgr A* distance).
// The whole galaxy rotates slowly around its own center, which
// from the Sun's frame appears as the Sun orbiting the galaxy.
// ---------------------------------------------------------------

export const GALACTIC_CENTER = new THREE.Vector3(-26000, 0, 0);
const DISK_RADIUS = 50000;
const DISK_SCALE_HEIGHT = 300;
const BULGE_RADIUS = 4000;
const HALO_RADIUS = 60000;
// Sun's apparent orbital period in scene-seconds. Real value: ~230 Myr.
// We compress to 600 s for visualization. From this we derive V_flat so the
// Sun (at R0 = 26,000 ly) has the correct angular velocity, and all other
// stars rotate per a flat rotation curve V(r) ≈ V_flat (≈220 km/s in reality)
// with solid-body behavior inside the bulge (r < R_CORE).
const SUN_ORBIT_PERIOD_SEC = 600;
const R0_LY = 26000;
const R_CORE_LY = 2000;
// V_flat in scene units (ly per scene-second): chosen so omega(R0) = 2π/T_sun
const V_FLAT = (2 * Math.PI * R0_LY) / SUN_ORBIT_PERIOD_SEC;

// Deterministic seeded PRNG so the Milky Way shape is generated ONCE and is
// bit-for-bit identical across remounts, StrictMode double-invocations, hot
// reloads, and full app reloads. No more "the galaxy looks different every
// time I open the page".
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

// Module-level cache: geometries survive component remounts.
let CACHED_MW: {
  diskGeo: THREE.BufferGeometry;
  bulgeGeo: THREE.BufferGeometry;
  haloGeo: THREE.BufferGeometry;
  hiiGeo: THREE.BufferGeometry;
  barGeo: THREE.BufferGeometry;
} | null = null;

export function MilkyWay() {
  const groupRef = useRef<THREE.Group>(null!);
  const tex = useMemo(makeStarSprite, []);
  const coreTex = useMemo(() => makeRadialTexture("rgba(255,220,160,1)", "rgba(255,140,40,0)"), []);

  const { diskGeo, bulgeGeo, haloGeo, hiiGeo, barGeo } = useMemo(() => {
    if (CACHED_MW) return CACHED_MW;
    const rand = mulberry32(0xC0FFEE43);

    // ---- Log-spiral disk with 2 major + 2 minor arms ----
    // theta = k * ln(r / r0), pitch angle p ≈ 12.5° → k = 1/tan(p) ≈ 4.51.
    // Real Milky Way: Scutum-Centaurus & Perseus (major), Sagittarius & Norma (minor).
    const PITCH = (12.5 * Math.PI) / 180;
    const K = 1 / Math.tan(PITCH);
    const ARM_OFFSETS = [0, Math.PI, Math.PI * 0.5, Math.PI * 1.5];
    const ARM_STRENGTH = [1.0, 1.0, 0.7, 0.7];
    // Wider arms, especially in the outer disk, so branches look filled.
    const ARM_WIDTH = [1400, 1400, 1700, 1700]; // ly, gaussian σ across arm ridge

    const diskCount = 620000;
    const dPos = new Float32Array(diskCount * 3);
    const dCol = new Float32Array(diskCount * 3);
    const dSize = new Float32Array(diskCount);

    // 78% concentrated on arm ridges, 22% smooth inter-arm disk
    for (let i = 0; i < diskCount; i++) {
      const onArm = rand() < 0.78;
      // Exponential radial profile with real disk scale length ≈ 8500 ly,
      // biased outward so the outer branches are noticeably fuller.
      const u = rand();
      // Mix two exponentials: dominant long scale + a heavier outer tail.
      const r = (u < 0.7)
        ? -Math.log(1 - rand() * 0.999) * 8500 + 1500
        : -Math.log(1 - rand() * 0.999) * 14000 + 6000;
      if (r > DISK_RADIUS) { i--; continue; }

      // Arm selection weighted by strength
      let armIdx = 0;
      if (onArm) {
        const totalW = ARM_STRENGTH.reduce((a, b) => a + b, 0);
        let pick = rand() * totalW;
        for (let a = 0; a < ARM_OFFSETS.length; a++) {
          pick -= ARM_STRENGTH[a];
          if (pick <= 0) { armIdx = a; break; }
        }
      } else {
        armIdx = Math.floor(rand() * ARM_OFFSETS.length);
      }

      const ridgeTheta = ARM_OFFSETS[armIdx] + K * Math.log(Math.max(r, 800) / 800);
      // Arms flare with radius — outer arms are broader than inner ones.
      const flare = 1 + Math.min(2.2, r / 18000);
      const sigmaTheta = (ARM_WIDTH[armIdx] * flare) / Math.max(r, 800);
      const noise = onArm
        ? (rand() + rand() + rand() - 1.5) * sigmaTheta * 0.9
        : (rand() - 0.5) * Math.PI * 0.9; // broad inter-arm scatter
      const theta = ridgeTheta + noise;

      // Vertical: thin disk (300 ly) + occasional thick-disk stars (1000 ly)
      const isThick = rand() < 0.12;
      const scaleH = isThick ? 1000 : DISK_SCALE_HEIGHT;
      const uz = rand() - 0.5;
      const z = -Math.sign(uz) * Math.log(1 - 2 * Math.abs(uz) * 0.999) * scaleH * Math.exp(-r / 20000);

      dPos[i * 3] = Math.cos(theta) * r;
      dPos[i * 3 + 1] = z;
      dPos[i * 3 + 2] = Math.sin(theta) * r;

      // Color: young blue-white OB stars on arm ridges (near ridge & inner-mid disk),
      // yellow-white older stars in inter-arm, warmer toward bulge.
      const ridgeCloseness = Math.exp(-(noise * noise) / (2 * sigmaTheta * sigmaTheta));
      const rNorm = Math.min(1, r / DISK_RADIUS);
      const youngProb = onArm ? 0.38 * ridgeCloseness * (1 - rNorm * 0.35) : 0.06;
      const isYoung = rand() < youngProb;
      const isRedGiant = !isYoung && rand() < 0.06;
      if (isYoung) {
        dCol[i * 3] = 0.75; dCol[i * 3 + 1] = 0.85; dCol[i * 3 + 2] = 1.0;
        dSize[i] = 18 + rand() * 22;
      } else if (isRedGiant) {
        dCol[i * 3] = 1.0; dCol[i * 3 + 1] = 0.65; dCol[i * 3 + 2] = 0.45;
        dSize[i] = 16 + rand() * 18;
      } else {
        const inner = 1 - rNorm;
        const b = 0.72 + rand() * 0.28;
        dCol[i * 3] = b * (0.9 + inner * 0.1);
        dCol[i * 3 + 1] = b * (0.9 + inner * 0.02);
        dCol[i * 3 + 2] = b * (1.0 - inner * 0.22);
        dSize[i] = 6 + rand() * 10;
      }
    }
    const diskGeo = new THREE.BufferGeometry();
    diskGeo.setAttribute("position", new THREE.BufferAttribute(dPos, 3));
    diskGeo.setAttribute("color", new THREE.BufferAttribute(dCol, 3));
    diskGeo.setAttribute("aSize", new THREE.BufferAttribute(dSize, 1));

    // ---- Bulge (spheroidal, older population, warm colors) ----
    const bulgeCount = 80000;
    const bPos = new Float32Array(bulgeCount * 3);
    const bCol = new Float32Array(bulgeCount * 3);
    const bSize = new Float32Array(bulgeCount);
    for (let i = 0; i < bulgeCount; i++) {
      const r = Math.pow(rand(), 2.2) * BULGE_RADIUS;
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      // Flattened oblate spheroid (b/a ≈ 0.6)
      bPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      bPos[i * 3 + 1] = r * Math.cos(phi) * 0.6;
      bPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      const t = 1 - r / BULGE_RADIUS;
      bCol[i * 3] = 1.0;
      bCol[i * 3 + 1] = 0.82 + t * 0.12;
      bCol[i * 3 + 2] = 0.55 + t * 0.2;
      bSize[i] = 10 + rand() * 18 + t * 24;
    }
    const bulgeGeo = new THREE.BufferGeometry();
    bulgeGeo.setAttribute("position", new THREE.BufferAttribute(bPos, 3));
    bulgeGeo.setAttribute("color", new THREE.BufferAttribute(bCol, 3));
    bulgeGeo.setAttribute("aSize", new THREE.BufferAttribute(bSize, 1));

    // ---- Central Bar (~8000 ly long, oriented ~27° from Sun-GC line) ----
    const barCount = 22000;
    const barLen = 8000, barWidth = 1500, barHeight = 700;
    const barAngle = (27 * Math.PI) / 180;
    const cosA = Math.cos(barAngle), sinA = Math.sin(barAngle);
    const barPos = new Float32Array(barCount * 3);
    const barCol = new Float32Array(barCount * 3);
    const barSize = new Float32Array(barCount);
    for (let i = 0; i < barCount; i++) {
      // Prolate ellipsoid distribution
      const u = rand() - 0.5;
      const v = (rand() - 0.5);
      const w = (rand() - 0.5);
      const density = Math.exp(-(u * u * 4 + v * v * 6 + w * w * 6));
      if (rand() > density) { i--; continue; }
      const lx = u * barLen;
      const lz = v * barWidth;
      const ly = w * barHeight;
      barPos[i * 3] = lx * cosA - lz * sinA;
      barPos[i * 3 + 1] = ly;
      barPos[i * 3 + 2] = lx * sinA + lz * cosA;
      barCol[i * 3] = 1.0;
      barCol[i * 3 + 1] = 0.78;
      barCol[i * 3 + 2] = 0.5;
      barSize[i] = 10 + rand() * 16;
    }
    const barGeo = new THREE.BufferGeometry();
    barGeo.setAttribute("position", new THREE.BufferAttribute(barPos, 3));
    barGeo.setAttribute("color", new THREE.BufferAttribute(barCol, 3));
    barGeo.setAttribute("aSize", new THREE.BufferAttribute(barSize, 1));

    // ---- HII regions: bright pink/magenta knots clumped along arm ridges ----
    const hiiClusterCount = 420;
    const perCluster = 28;
    const hiiTotal = hiiClusterCount * perCluster;
    const hPos2 = new Float32Array(hiiTotal * 3);
    const hCol2 = new Float32Array(hiiTotal * 3);
    const hSize2 = new Float32Array(hiiTotal);
    let hi = 0;
    for (let c = 0; c < hiiClusterCount; c++) {
      const armIdx = Math.floor(rand() * ARM_OFFSETS.length);
      const r = 3000 + rand() * (DISK_RADIUS * 0.7 - 3000);
      const ridgeTheta = ARM_OFFSETS[armIdx] + K * Math.log(Math.max(r, 800) / 800);
      const cx = Math.cos(ridgeTheta) * r;
      const cz = Math.sin(ridgeTheta) * r;
      for (let k = 0; k < perCluster; k++) {
        const dx = (rand() - 0.5) * 400;
        const dy = (rand() - 0.5) * 200;
        const dz = (rand() - 0.5) * 400;
        hPos2[hi * 3] = cx + dx;
        hPos2[hi * 3 + 1] = dy;
        hPos2[hi * 3 + 2] = cz + dz;
        // Emission-nebula pink (Hα + OIII mix)
        const pinkT = rand();
        hCol2[hi * 3] = 1.0;
        hCol2[hi * 3 + 1] = 0.45 + pinkT * 0.2;
        hCol2[hi * 3 + 2] = 0.7 + pinkT * 0.25;
        hSize2[hi] = 28 + rand() * 34;
        hi++;
      }
    }
    const hiiGeo = new THREE.BufferGeometry();
    hiiGeo.setAttribute("position", new THREE.BufferAttribute(hPos2, 3));
    hiiGeo.setAttribute("color", new THREE.BufferAttribute(hCol2, 3));
    hiiGeo.setAttribute("aSize", new THREE.BufferAttribute(hSize2, 1));

    // ---- Halo (spheroidal, sparse, old population II) ----
    const haloCount = 18000;
    const hPos = new Float32Array(haloCount * 3);
    const hCol = new Float32Array(haloCount * 3);
    const hSize = new Float32Array(haloCount);
    for (let i = 0; i < haloCount; i++) {
      const r = Math.pow(rand(), 0.55) * HALO_RADIUS;
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      hPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      hPos[i * 3 + 1] = r * Math.cos(phi);
      hPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      hCol[i * 3] = 0.95; hCol[i * 3 + 1] = 0.88; hCol[i * 3 + 2] = 0.72;
      hSize[i] = 4 + rand() * 8;
    }
    const haloGeo = new THREE.BufferGeometry();
    haloGeo.setAttribute("position", new THREE.BufferAttribute(hPos, 3));
    haloGeo.setAttribute("color", new THREE.BufferAttribute(hCol, 3));
    haloGeo.setAttribute("aSize", new THREE.BufferAttribute(hSize, 1));

    CACHED_MW = { diskGeo, bulgeGeo, haloGeo, hiiGeo, barGeo };
    return CACHED_MW;
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    // Galaxy itself is fixed; differential rotation happens in the shader.
    // We only counter-rotate by the Sun's omega so the Sun (at R0) appears
    // to orbit while the bulk-flow frame stays comprehensible.
    shader.uniforms.uTime.value = clock.elapsedTime;
  });

  const shader = useMemo(
    () => ({
      uniforms: {
        uTex: { value: tex },
        uPixelRatio: { value: typeof window !== "undefined" ? window.devicePixelRatio : 1 },
        uTime: { value: 0 },
        uVflat: { value: V_FLAT },
        uRcore: { value: R_CORE_LY },
        // Sun's own angular velocity — subtracted so the Sun's frame is the
        // viewer's reference (matches camera at origin).
        uOmegaSun: { value: (2 * Math.PI) / SUN_ORBIT_PERIOD_SEC },
        uDifferential: { value: 1.0 },
      },
      vertexShader: /* glsl */ `
        attribute float aSize;
        varying vec3 vColor;
        uniform float uPixelRatio;
        uniform float uTime;
        uniform float uVflat;
        uniform float uRcore;
        uniform float uOmegaSun;
        uniform float uDifferential;
        void main(){
          vColor = color;
          // Radial distance from galactic center (in galaxy's local XZ plane)
          float r = length(position.xz);
          // Flat rotation curve with solid-body core
          float vrot = (r < uRcore) ? uVflat * (r / uRcore) : uVflat;
          float omega = (r > 0.5) ? (vrot / r) : 0.0;
          // Rotate by (omega - omegaSun) * t so Sun's frame is stationary
          float ang = (omega - uOmegaSun) * uTime * uDifferential;
          float c = cos(ang), s = sin(ang);
          vec3 p = vec3(
            position.x * c - position.z * s,
            position.y,
            position.x * s + position.z * c
          );
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

  return (
    <group position={GALACTIC_CENTER.toArray()}>
      <group ref={groupRef}>
        <points geometry={diskGeo} frustumCulled={false}>
          <shaderMaterial args={[shader]} />
        </points>
        <points geometry={barGeo} frustumCulled={false}>
          <shaderMaterial args={[shader]} />
        </points>
        <points geometry={bulgeGeo} frustumCulled={false}>
          <shaderMaterial args={[shader]} />
        </points>
        <points geometry={hiiGeo} frustumCulled={false}>
          <shaderMaterial args={[shader]} />
        </points>
        <points geometry={haloGeo} frustumCulled={false}>
          <shaderMaterial args={[shader]} />
        </points>
        <mesh>
          <sphereGeometry args={[60, 24, 24]} />
          <meshBasicMaterial color="#ffe6b0" />
        </mesh>
        <sprite scale={[3500, 3500, 1]}>
          <spriteMaterial map={coreTex} blending={THREE.AdditiveBlending} transparent depthWrite={false} />
        </sprite>
      </group>
      <SolarOrbitRing radius={26000} />
    </group>
  );
}

function SolarOrbitRing({ radius }: { radius: number }) {
  const geo = useMemo(() => {
    const segs = 256;
    const pts: number[] = [];
    for (let i = 0; i <= segs; i++) {
      const a = (i / segs) * Math.PI * 2;
      pts.push(Math.cos(a) * radius, 0, Math.sin(a) * radius);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, [radius]);
  const mat = useMemo(() => new THREE.LineBasicMaterial({ color: "#3a5aaa", transparent: true, opacity: 0.18, depthWrite: false }), []);
  const line = useMemo(() => new THREE.Line(geo, mat), [geo, mat]);
  return <primitive object={line} />;
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
  const t = new THREE.CanvasTexture(c);
  t.needsUpdate = true;
  return t;
}

export const GalaxyBackdrop = MilkyWay;

