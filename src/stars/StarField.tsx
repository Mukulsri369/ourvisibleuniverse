import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { NAMED_STARS } from "./data";
import { spectralColor, spectralIndex, spectralIndexColor } from "./spectral";
import { useStore } from "./store";

const BACKGROUND_COUNT = 18000;

function makeStarTexture(): THREE.Texture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.2, "rgba(255,255,255,0.9)");
  grad.addColorStop(0.5, "rgba(255,255,255,0.25)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

export function StarField() {
  const points = useRef<THREE.Points>(null!);
  const material = useRef<THREE.ShaderMaterial>(null!);
  const texture = useMemo(makeStarTexture, []);
  const spectralMode = useStore((s) => s.spectralMode);
  const spectralTarget = useRef(0);
  const spectralBlend = useRef(0);

  const { geometry, naturalColors, spectralColors } = useMemo(() => {
    const count = NAMED_STARS.length + BACKGROUND_COUNT;
    const positions = new Float32Array(count * 3);
    const natural = new Float32Array(count * 3);
    const spectral = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phase = new Float32Array(count);
    const isBg = new Float32Array(count);

    NAMED_STARS.forEach((s, i) => {
      positions[i * 3] = s.x;
      positions[i * 3 + 1] = s.y;
      positions[i * 3 + 2] = s.z;
      const cNat = spectralColor(s.spectral);
      const cSpec = spectralIndexColor(spectralIndex(s.spectral));
      natural[i * 3] = cNat.r; natural[i * 3 + 1] = cNat.g; natural[i * 3 + 2] = cNat.b;
      spectral[i * 3] = cSpec.r; spectral[i * 3 + 1] = cSpec.g; spectral[i * 3 + 2] = cSpec.b;
      // size from magnitude: brighter (lower mag) => larger
      const mag = Math.min(10, Math.max(-2, s.magnitude));
      sizes[i] = Math.max(3, 14 - mag * 1.3);
      phase[i] = Math.random() * Math.PI * 2;
      isBg[i] = 0;
    });

    // Background stars distributed as a real galactic thin-disk slice
    // around the Sun: exponential radial profile + sech-like vertical
    // scale-height (~300 ly). 1 scene unit = 1 light-year.
    const SCALE_H = 300;
    const R_MAX = 6000;     // local neighborhood we render in detail
    for (let j = 0; j < BACKGROUND_COUNT; j++) {
      const i = NAMED_STARS.length + j;
      // exponential-ish radial distribution in the galactic plane
      const r = -Math.log(1 - Math.random() * 0.999) * 900;
      const rClamped = Math.min(r, R_MAX);
      const theta = Math.random() * Math.PI * 2;
      // vertical: laplace-like draw centered on plane, scale-height 300 ly
      const u = Math.random() - 0.5;
      const z = -Math.sign(u) * Math.log(1 - 2 * Math.abs(u) * 0.999) * SCALE_H;
      positions[i * 3] = Math.cos(theta) * rClamped;
      positions[i * 3 + 1] = z;
      positions[i * 3 + 2] = Math.sin(theta) * rClamped;
      // realistic spectral mix in the solar neighborhood (~76% M, 12% K, etc.)
      const roll = Math.random();
      const cls = roll < 0.76 ? "M" : roll < 0.88 ? "K" : roll < 0.955 ? "G" : roll < 0.985 ? "F" : roll < 0.995 ? "A" : "B";
      const cNat = spectralColor(cls);
      const cSpec = spectralIndexColor(spectralIndex(cls));
      natural[i * 3] = cNat.r; natural[i * 3 + 1] = cNat.g; natural[i * 3 + 2] = cNat.b;
      spectral[i * 3] = cSpec.r; spectral[i * 3 + 1] = cSpec.g; spectral[i * 3 + 2] = cSpec.b;
      sizes[i] = 1 + Math.random() * 2.2;
      phase[i] = Math.random() * Math.PI * 2;
      isBg[i] = 1;
    }


    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("aColorNatural", new THREE.BufferAttribute(natural, 3));
    g.setAttribute("aColorSpectral", new THREE.BufferAttribute(spectral, 3));
    g.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    g.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));
    g.setAttribute("aIsBg", new THREE.BufferAttribute(isBg, 1));
    return { geometry: g, naturalColors: natural, spectralColors: spectral };
  }, []);

  // Avoid unused-var lints; the buffers are stored on geometry attributes
  void naturalColors; void spectralColors;

  const cameraDistance = useStore((s) => s.cameraDistance);
  useFrame(({ clock }) => {
    spectralTarget.current = spectralMode ? 1 : 0;
    spectralBlend.current += (spectralTarget.current - spectralBlend.current) * 0.05;
    if (material.current) {
      material.current.uniforms.uTime.value = clock.elapsedTime;
      material.current.uniforms.uSpectral.value = spectralBlend.current;
      material.current.uniforms.uCamDist.value = cameraDistance;
    }
  });

  const shader = useMemo(
    () => ({
      uniforms: {
        uTime: { value: 0 },
        uSpectral: { value: 0 },
        uTex: { value: texture },
        uPixelRatio: { value: typeof window !== "undefined" ? window.devicePixelRatio : 1 },
      },
      vertexShader: /* glsl */ `
        attribute float aSize;
        attribute float aPhase;
        attribute vec3 aColorNatural;
        attribute vec3 aColorSpectral;
        uniform float uTime;
        uniform float uSpectral;
        uniform float uPixelRatio;
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          vec3 col = mix(aColorNatural, aColorSpectral, uSpectral);
          vColor = col;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          float twinkle = 0.85 + 0.25 * sin(uTime * 1.4 + aPhase);
          float size = aSize * twinkle * uPixelRatio * (320.0 / max(-mv.z, 1.0));
          gl_PointSize = clamp(size, 1.0, 80.0);
          vAlpha = clamp(1.0 - (length(mv.xyz) / 4000.0), 0.15, 1.0);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform sampler2D uTex;
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          vec4 tex = texture2D(uTex, gl_PointCoord);
          if (tex.a < 0.05) discard;
          gl_FragColor = vec4(vColor, tex.a * vAlpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
    [texture],
  );

  return (
    <points ref={points} geometry={geometry} frustumCulled={false}>
      <shaderMaterial ref={material} args={[shader]} />
    </points>
  );
}
