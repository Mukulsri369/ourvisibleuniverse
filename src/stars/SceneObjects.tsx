import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { backgroundFocus } from "./sim-clock";
import { useFrame } from "@react-three/fiber";
import { useStore } from "./store";
import { useSolarMap } from "./solar-textures";
import { NAMED_STARS } from "./data";

const SUN_RADIUS = 0.015;

function makeSolarCoronaTexture(): THREE.Texture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const cx = size / 2;
  const cy = size / 2;

  // Base radial K/F-corona glow
  const g = ctx.createRadialGradient(cx, cy, size * 0.04, cx, cy, size * 0.5);
  g.addColorStop(0.0, "rgba(255, 250, 225, 1.0)");
  g.addColorStop(0.12, "rgba(255, 215, 130, 0.85)");
  g.addColorStop(0.28, "rgba(255, 145, 50, 0.38)");
  g.addColorStop(0.55, "rgba(220, 75, 18, 0.10)");
  g.addColorStop(1.0, "rgba(180, 40, 5, 0.0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);

  // Subtle coronal streamer rays
  ctx.save();
  ctx.translate(cx, cy);
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 24; i++) {
    const angle = (i / 24) * Math.PI * 2 + Math.sin(i * 3.7) * 0.08;
    const isEquatorial = Math.abs(Math.sin(angle)) < 0.45;
    const len = size * (isEquatorial ? 0.48 : 0.34) * (0.82 + 0.18 * Math.cos(i * 5.1));
    const width = size * (isEquatorial ? 0.032 : 0.018);
    ctx.save();
    ctx.rotate(angle);
    const rg = ctx.createLinearGradient(0, 0, len, 0);
    rg.addColorStop(0, "rgba(255, 220, 150, 0.22)");
    rg.addColorStop(0.4, "rgba(255, 150, 60, 0.09)");
    rg.addColorStop(1, "rgba(255, 90, 20, 0)");
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.moveTo(size * 0.05, -width);
    ctx.lineTo(len, 0);
    ctx.lineTo(size * 0.05, width);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

export function Sun() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const chromoRef = useRef<THREE.Mesh>(null!);
  const kCoronaRef = useRef<THREE.Mesh>(null!);
  const coronaRef = useRef<THREE.Sprite>(null!);
  const worldPos = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    if (!window.__exoSizes) window.__exoSizes = new Map();
    window.__exoSizes.set("Sun", SUN_RADIUS);
  }, []);

  const coronaTex = useMemo(() => makeSolarCoronaTexture(), []);
  const solarMap = useSolarMap("Sun", () => coronaTex);

  const photosphereShader = useMemo(
    () => ({
      uniforms: { uTime: { value: 0 }, uMap: { value: solarMap } },
      vertexShader: /* glsl */ `
        #include <common>
        #include <logdepthbuf_pars_vertex>
        varying vec3 vPos;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
          vPos = normalize(position);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * mvPosition;
          #include <logdepthbuf_vertex>
        }
      `,
      fragmentShader: /* glsl */ `
        #include <logdepthbuf_pars_fragment>
        uniform float uTime; uniform sampler2D uMap;
        varying vec3 vPos; varying vec3 vNormal; varying vec3 vViewPosition;
        void main(){
          #include <logdepthbuf_fragment>
          float mu=max(dot(normalize(vNormal),normalize(vViewPosition)),0.0);
          vec2 uv=vec2(atan(vPos.z,vPos.x)/6.283185+0.5,asin(clamp(vPos.y,-1.0,1.0))/3.141593+0.5);
          vec3 tex=texture2D(uMap,uv).rgb;
          float detail=dot(tex,vec3(0.2126,0.7152,0.0722));
          float granule=sin(vPos.x*420.0+uTime*0.6)*sin(vPos.y*430.0-uTime*0.4)*0.012;
          // Visible-light photosphere: warm white, not H-alpha orange lava.
          vec3 col=vec3(1.0,0.91,0.73)*(0.52+detail*0.92+granule);
          col*=0.36+0.64*pow(mu,0.45);
          gl_FragColor=vec4(col*7.0,1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }
      `,
    }),
    [solarMap],
  );

  const chromosphereShader = useMemo(
    () => ({
      uniforms: { uTime: { value: 0 } },
      vertexShader: /* glsl */ `
        #include <common>
        #include <logdepthbuf_pars_vertex>
        varying vec3 vPos;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
          vPos = normalize(position);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * mvPosition;
          #include <logdepthbuf_vertex>
        }
      `,
      fragmentShader: /* glsl */ `
        #include <logdepthbuf_pars_fragment>
        uniform float uTime;
        varying vec3 vPos;
        varying vec3 vNormal;
        varying vec3 vViewPosition;

        float hash(vec3 p) {
          p = fract(p * vec3(443.8975, 397.2973, 491.1871));
          p += dot(p.zxy, p.yxz + 19.19);
          return fract(p.x * p.y * p.z);
        }
        float noise(vec3 p) {
          vec3 i = floor(p), f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          return mix(
            mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
                mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
            mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
                mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
            f.z
          );
        }
        float fbm(vec3 p) {
          float v = 0.0, a = 0.5;
          for (int i = 0; i < 4; i++) {
            v += a * noise(p);
            p = p * 2.1 + vec3(5.3, -9.1, 3.7);
            a *= 0.5;
          }
          return v;
        }

        void main() {
          #include <logdepthbuf_fragment>
          vec3 N = normalize(vNormal);
          vec3 V = normalize(vViewPosition);
          float nv = abs(dot(N, V));

          // Limb-concentrated spicule & solar prominence emission
          float rim = pow(1.0 - nv, 2.8);
          float loopNoise = fbm(vPos * 9.0 + vec3(0.0, uTime * 0.18, -uTime * 0.14));
          float spicule = fbm(vPos * 28.0 - vec3(uTime * 0.35, 0.0, uTime * 0.25));
          float prominence = smoothstep(0.54, 0.86, loopNoise) * (0.6 + 0.8 * spicule);

          vec3 chromoRed = vec3(1.0, 0.26, 0.06);
          vec3 flareGold = vec3(1.0, 0.78, 0.28);
          vec3 col = mix(chromoRed, flareGold, prominence) * rim * (0.75 + 1.35 * prominence);
          float alpha = clamp(rim * (0.42 + 0.58 * prominence), 0.0, 0.92);
          gl_FragColor = vec4(col, alpha);
        }
      `,
    }),
    [],
  );

  const kCoronaShader = useMemo(
    () => ({
      uniforms: { uTime: { value: 0 } },
      vertexShader: /* glsl */ `
        #include <common>
        #include <logdepthbuf_pars_vertex>
        varying vec3 vPos;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
          vPos = normalize(position);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * mvPosition;
          #include <logdepthbuf_vertex>
        }
      `,
      fragmentShader: /* glsl */ `
        #include <logdepthbuf_pars_fragment>
        uniform float uTime;
        varying vec3 vPos;
        varying vec3 vNormal;
        varying vec3 vViewPosition;

        float hash(vec3 p) {
          return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
        }
        float noise(vec3 p) {
          vec3 i = floor(p), f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          return mix(
            mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
                mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
            mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
                mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
            f.z
          );
        }

        void main() {
          #include <logdepthbuf_fragment>
          vec3 N = normalize(vNormal);
          vec3 V = normalize(vViewPosition);
          float nv = abs(dot(N, V));
          float streamer = 0.7 + 0.3 * noise(vPos * 14.0 + vec3(uTime * 0.08));
          // Helmet streamers concentrated toward solar equator
          float eqBoost = 1.0 - 0.35 * vPos.y * vPos.y;
          float glow = pow(1.0 - nv, 2.2) * streamer * eqBoost;
          vec3 col = mix(vec3(1.0, 0.42, 0.12), vec3(1.0, 0.86, 0.52), glow);
          gl_FragColor = vec4(col * glow * 0.20, clamp(glow * 0.12, 0.0, 0.14));
        }
      `,
    }),
    [],
  );

  useFrame(({ clock, camera }) => {
    const t = clock.elapsedTime;
    if (meshRef.current) {
      (meshRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = t;
      meshRef.current.rotation.y = t * 0.025;
      meshRef.current.getWorldPosition(worldPos);
    }
    if (chromoRef.current) {
      (chromoRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = t;
      chromoRef.current.rotation.y = -t * 0.018;
      chromoRef.current.visible = camera.position.distanceTo(worldPos) < SUN_RADIUS * 90;
    }
    if (kCoronaRef.current) {
      (kCoronaRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = t;
      kCoronaRef.current.visible = camera.position.distanceTo(worldPos) < SUN_RADIUS * 90;
    }
    if (coronaRef.current) {
      const camD = camera.position.distanceTo(worldPos);
      // Scale smoothly so close-up views reveal the photosphere & chromosphere without glare washout
      const closeFade = Math.min(1, Math.max(0.22, (camD - SUN_RADIUS * 2.5) / (SUN_RADIUS * 14)));
      const s = (0.13 + Math.sin(t * 0.9) * 0.005) * (0.55 + 0.45 * closeFade);
      coronaRef.current.scale.set(s, s, 1);
      (coronaRef.current.material as THREE.SpriteMaterial).opacity = 0.32 * closeFade;
    }
  });

  return (
    <group>
      {/* Solar Photosphere with 3D convective granulation, sunspots (umbra/penumbra) & faculae */}
      <mesh
        ref={meshRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "";
        }}
        onClick={(e) => {
          e.stopPropagation();
          const st = useStore.getState();
          st.setSelected(NAMED_STARS[0]);
          st.setVisitPlanet("Sun");
        }}
      >
        <sphereGeometry args={[SUN_RADIUS, 96, 64]} />
        <shaderMaterial args={[photosphereShader]} depthWrite depthTest transparent={false} />
      </mesh>

      {/* Dynamic H-alpha Chromosphere & Solar Prominence Rim Shell */}
      <mesh ref={chromoRef} scale={1.008} renderOrder={1}>
        <sphereGeometry args={[SUN_RADIUS, 64, 48]} />
        <shaderMaterial
          args={[chromosphereShader]}
          transparent
          depthWrite={false}
          side={THREE.FrontSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Volumetric Inner K-Corona Helmet Streamer Shell */}
      <mesh ref={kCoronaRef} scale={1.08} renderOrder={2}>
        <sphereGeometry args={[SUN_RADIUS, 48, 32]} />
        <shaderMaterial
          args={[kCoronaShader]}
          transparent
          depthWrite={false}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Outer F-Corona & Streamer Halo Sprite */}
      <sprite ref={coronaRef} scale={[0.13, 0.13, 1]} renderOrder={3}>
        <spriteMaterial
          map={coronaTex}
          transparent
          opacity={0.78}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>

      <pointLight color="#fff2d6" intensity={4.8} distance={8} decay={1.1} />
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
  const w = 512,
    h = 32;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
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
    const opacity =
      Math.max(0, Math.min(0.6, (d - 0.3) / 5)) * Math.max(0, Math.min(1, (60 - d) / 60));
    (ref.current.material as THREE.PointsMaterial).opacity = opacity;
  });
  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        color="#88aaff"
        size={0.05}
        sizeAttenuation
        transparent
        opacity={0}
        depthWrite={false}
      />
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
    const rand = mulberry32(0xc0ffee43);

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
      const r =
        u < 0.7
          ? -Math.log(1 - rand() * 0.999) * 8500 + 1500
          : -Math.log(1 - rand() * 0.999) * 14000 + 6000;
      if (r > DISK_RADIUS) {
        i--;
        continue;
      }

      // Arm selection weighted by strength
      let armIdx = 0;
      if (onArm) {
        const totalW = ARM_STRENGTH.reduce((a, b) => a + b, 0);
        let pick = rand() * totalW;
        for (let a = 0; a < ARM_OFFSETS.length; a++) {
          pick -= ARM_STRENGTH[a];
          if (pick <= 0) {
            armIdx = a;
            break;
          }
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
      const z =
        -Math.sign(uz) * Math.log(1 - 2 * Math.abs(uz) * 0.999) * scaleH * Math.exp(-r / 20000);

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
        dCol[i * 3] = 0.75;
        dCol[i * 3 + 1] = 0.85;
        dCol[i * 3 + 2] = 1.0;
        dSize[i] = 18 + rand() * 22;
      } else if (isRedGiant) {
        dCol[i * 3] = 1.0;
        dCol[i * 3 + 1] = 0.65;
        dCol[i * 3 + 2] = 0.45;
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
    const barLen = 8000,
      barWidth = 1500,
      barHeight = 700;
    const barAngle = (27 * Math.PI) / 180;
    const cosA = Math.cos(barAngle),
      sinA = Math.sin(barAngle);
    const barPos = new Float32Array(barCount * 3);
    const barCol = new Float32Array(barCount * 3);
    const barSize = new Float32Array(barCount);
    for (let i = 0; i < barCount; i++) {
      // Prolate ellipsoid distribution
      const u = rand() - 0.5;
      const v = rand() - 0.5;
      const w = rand() - 0.5;
      const density = Math.exp(-(u * u * 4 + v * v * 6 + w * w * 6));
      if (rand() > density) {
        i--;
        continue;
      }
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
      hCol[i * 3] = 0.95;
      hCol[i * 3 + 1] = 0.88;
      hCol[i * 3 + 2] = 0.72;
      hSize[i] = 4 + rand() * 8;
    }
    const haloGeo = new THREE.BufferGeometry();
    haloGeo.setAttribute("position", new THREE.BufferAttribute(hPos, 3));
    haloGeo.setAttribute("color", new THREE.BufferAttribute(hCol, 3));
    haloGeo.setAttribute("aSize", new THREE.BufferAttribute(hSize, 1));

    const mwSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), HALO_RADIUS * 1.15);
    diskGeo.boundingSphere = mwSphere;
    barGeo.boundingSphere = mwSphere;
    bulgeGeo.boundingSphere = mwSphere;
    hiiGeo.boundingSphere = mwSphere;
    haloGeo.boundingSphere = mwSphere;

    CACHED_MW = { diskGeo, bulgeGeo, haloGeo, hiiGeo, barGeo };
    return CACHED_MW;
  }, []);

  const subsystems = useStore((s) => s.subsystems);

  useFrame(({ clock, camera, gl }) => {
    if (!groupRef.current) return;
    // Galaxy itself is fixed; differential rotation happens in the shader.
    shader.uniforms.uTime.value = clock.elapsedTime;
    shader.uniforms.uPixelRatio.value = gl.getPixelRatio();
    shader.uniforms.uFocus.value = backgroundFocus();

    // Distance-aware continuous fade coordinated with the far-field sprite in Universe.tsx
    const d = camera.position.distanceTo(GALACTIC_CENTER);
    // Smoothly fade out heavy particle cloud between 180,000 and 550,000 ly as far sprite takes over
    const alpha = Math.min(1, Math.max(0, 1 - (d - 180_000) / 370_000));
    shader.uniforms.uOpacity.value = alpha;
    const localDistance =
      (window as unknown as { __liveCameraDistance?: number }).__liveCameraDistance ??
      useStore.getState().cameraDistance;
    const fraction = THREE.MathUtils.lerp(
      0.18,
      1,
      THREE.MathUtils.smoothstep(localDistance, 200, 45000),
    );
    for (const geometry of [diskGeo, bulgeGeo, barGeo, hiiGeo, haloGeo]) {
      geometry.setDrawRange(0, Math.floor(geometry.getAttribute("position").count * fraction));
    }
    groupRef.current.visible = subsystems.milkyWay && alpha > 0.005;
  });

  const shader = useMemo(
    () => ({
      uniforms: {
        uTex: { value: tex },
        uPixelRatio: { value: typeof window !== "undefined" ? window.devicePixelRatio : 1 },
        uFocus: { value: 1 },
        uOpacity: { value: 1 },
        uTime: { value: 0 },
        uVflat: { value: V_FLAT },
        uRcore: { value: R_CORE_LY },
        // Sun's own angular velocity — subtracted so the Sun's frame is the
        // viewer's reference (matches camera at origin).
        uOmegaSun: { value: (2 * Math.PI) / SUN_ORBIT_PERIOD_SEC },
        uDifferential: { value: 1.0 },
      },
      vertexShader: /* glsl */ `
        #include <common>
        #include <logdepthbuf_pars_vertex>
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
          #include <logdepthbuf_vertex>
        }
      `,
      fragmentShader: /* glsl */ `
        #include <logdepthbuf_pars_fragment>
        uniform sampler2D uTex;
        uniform float uFocus;
        uniform float uOpacity;
        varying vec3 vColor;
        void main(){
          #include <logdepthbuf_fragment>
          vec4 t = texture2D(uTex, gl_PointCoord);
          if (t.a < 0.04) discard;
          gl_FragColor = vec4(vColor, t.a * uFocus * uOpacity);
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
        <points geometry={diskGeo} frustumCulled={true}>
          <shaderMaterial args={[shader]} />
        </points>
        <points geometry={barGeo} frustumCulled={true}>
          <shaderMaterial args={[shader]} />
        </points>
        <points geometry={bulgeGeo} frustumCulled={true}>
          <shaderMaterial args={[shader]} />
        </points>
        <points geometry={hiiGeo} frustumCulled={true}>
          <shaderMaterial args={[shader]} />
        </points>
        <points geometry={haloGeo} frustumCulled={true}>
          <shaderMaterial args={[shader]} />
        </points>
        <mesh>
          <sphereGeometry args={[60, 24, 24]} />
          <meshBasicMaterial color="#ffeccc" />
        </mesh>
        <sprite scale={[3500, 3500, 1]}>
          <spriteMaterial
            map={coreTex}
            blending={THREE.AdditiveBlending}
            transparent
            depthWrite={false}
          />
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
  const mat = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: "#3a5aaa",
        transparent: true,
        opacity: 0.18,
        depthWrite: false,
      }),
    [],
  );
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
