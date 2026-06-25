import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

export function Sun() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const coronaRef = useRef<THREE.Sprite>(null!);
  const flareRef = useRef<THREE.Sprite>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);

  const coronaTex = useMemo(() => makeRadialTexture("rgba(255,180,80,1)", "rgba(255,100,30,0)"), []);
  const flareTex = useMemo(() => makeFlareTexture(), []);

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

  useFrame(({ clock, camera }) => {
    const t = clock.elapsedTime;
    if (meshRef.current) {
      (meshRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = t;
      meshRef.current.rotation.y = t * 0.05;
    }
    if (coronaRef.current) {
      const s = 4 + Math.sin(t * 0.8) * 0.15;
      coronaRef.current.scale.set(s, s, 1);
    }
    if (flareRef.current) {
      flareRef.current.quaternion.copy(camera.quaternion);
      flareRef.current.scale.set(18, 0.7, 1);
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
        <sphereGeometry args={[1, 64, 64]} />
        <shaderMaterial args={[shader]} />
      </mesh>
      <pointLight color="#ffb060" intensity={3} distance={50} />
      <sprite ref={coronaRef}>
        <spriteMaterial map={coronaTex} blending={THREE.AdditiveBlending} depthWrite={false} transparent />
      </sprite>
      <sprite ref={flareRef}>
        <spriteMaterial map={flareTex} blending={THREE.AdditiveBlending} depthWrite={false} transparent opacity={0.7} />
      </sprite>
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.25, 0.02, 8, 64]} />
        <meshBasicMaterial color="#ffaa55" transparent opacity={0.5} blending={THREE.AdditiveBlending} />
      </mesh>
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
      <ringGeometry args={[3, 50, 64]} />
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
      <pointsMaterial color="#88aaff" size={0.01} sizeAttenuation transparent opacity={0} depthWrite={false} />
    </points>
  );
}

export function GalaxyBackdrop() {
  const ref = useRef<THREE.Mesh>(null!);
  const tex = useMemo(() => makeGalaxyTexture(), []);
  useFrame(({ camera, clock }) => {
    if (!ref.current) return;
    ref.current.lookAt(camera.position);
    ref.current.rotation.z = clock.elapsedTime * 0.005;
    const d = camera.position.length();
    const opacity = Math.max(0, Math.min(0.85, (d - 500) / 1500));
    (ref.current.material as THREE.MeshBasicMaterial).opacity = opacity;
  });
  return (
    <mesh ref={ref} position={[0, 0, -4000]}>
      <planeGeometry args={[9000, 9000]} />
      <meshBasicMaterial map={tex} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}

function makeGalaxyTexture(): THREE.Texture {
  const size = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, size, size);
  const cx = size / 2, cy = size / 2;
  // core glow
  const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.45);
  core.addColorStop(0, "rgba(255,220,180,0.9)");
  core.addColorStop(0.15, "rgba(255,180,120,0.4)");
  core.addColorStop(0.5, "rgba(120,150,255,0.08)");
  core.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = core;
  ctx.fillRect(0, 0, size, size);
  // spiral arms via many small dots
  for (let i = 0; i < 25000; i++) {
    const arm = Math.floor(Math.random() * 4);
    const t = Math.random();
    const r = t * size * 0.48;
    const angle = arm * (Math.PI / 2) + t * 4 + (Math.random() - 0.5) * 0.6;
    const x = cx + Math.cos(angle) * r + (Math.random() - 0.5) * 30 * t;
    const y = cy + Math.sin(angle) * r * 0.55 + (Math.random() - 0.5) * 30 * t;
    const a = (1 - t) * 0.8 * Math.random();
    const hue = 200 + Math.random() * 40;
    ctx.fillStyle = `hsla(${hue}, 80%, 80%, ${a})`;
    ctx.fillRect(x, y, 1.2, 1.2);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}
