import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Deterministic PRNG for reproducible astronomical star & filament distributions
 */
function createRng(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let r = Math.imul(s ^ (s >>> 15), 1 | s);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Custom GLSL Vertex Shader for Fluid Scroll-Driven Deep-Space Starfield (Zero Cursor Motion)
 */
const STARFIELD_VERTEX_SHADER = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  attribute vec3 aColor;

  uniform float uTime;
  uniform float uScroll;
  uniform float uScrollVelocity;
  uniform float uPixelRatio;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vColor = aColor;

    vec3 pos = position;

    // Continuous deep-space Z-flight driven purely by scroll progress (bidirectional)
    float zSpan = 180.0;
    float scrolledZ = mod(pos.z + uScroll * 110.0 + 90.0, zSpan) - 150.0;
    pos.z = scrolledZ;

    // Subtle orbital swirl around the singularity axis
    float angle = uTime * 0.018 + pos.z * 0.002;
    float ca = cos(angle);
    float sa = sin(angle);
    pos.xy = mat2(ca, -sa, sa, ca) * pos.xy;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Gentle stellar twinkle + scroll-velocity relativistic brightness boost
    float twinkle = 0.82 + 0.18 * sin(uTime * 1.8 + aPhase);
    float velBoost = 1.0 + min(abs(uScrollVelocity) * 1.5, 1.25);
    float depthFade = smoothstep(-150.0, -25.0, pos.z) * (1.0 - smoothstep(-8.0, 2.0, pos.z));
    vAlpha = twinkle * depthFade;

    gl_PointSize = clamp(aSize * velBoost * uPixelRatio * (55.0 / max(-mvPosition.z, 1.0)), 1.0, 13.0);
  }
`;

const STARFIELD_FRAGMENT_SHADER = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float d = length(uv);
    if (d > 0.5) discard;

    // Crisp airy-disk stellar core with soft halo
    float core = exp(-d * d * 28.0);
    float halo = smoothstep(0.5, 0.0, d) * 0.45;
    float intensity = core + halo;

    gl_FragColor = vec4(vColor * intensity, vAlpha * intensity);
  }
`;

/**
 * Custom GLSL Shaders for 3D Relativistic Kerr Accretion Disk
 */
const ACCRETION_VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const ACCRETION_FRAGMENT_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uScroll;

  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 4; i++) {
      v += amp * noise(p);
      p *= 2.03;
      amp *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 centered = (vUv - 0.5) * 2.0;
    float r = length(centered);
    float angle = atan(centered.y, centered.x);

    // Inner ISCO boundary and outer disk falloff
    float innerEdge = smoothstep(0.24, 0.31, r);
    float outerEdge = 1.0 - smoothstep(0.55, 0.98, r);
    float ringMask = innerEdge * outerEdge;
    if (ringMask <= 0.002) discard;

    // Differential Keplerian shear rotation coupled smoothly to time + scroll
    float angularVel = 1.65 / pow(max(r, 0.22), 1.35);
    float spiralAngle = angle + (uTime * 0.38 + uScroll * 3.2) * angularVel + log(max(r, 0.001)) * 5.5;

    vec2 noiseCoord = vec2(r * 9.0, spiralAngle * 1.5);
    float plasma = fbm(noiseCoord + vec2(-uTime * 0.25, uTime * 0.12));
    float fineFilaments = fbm(vec2(r * 22.0, spiralAngle * 3.0));

    // Relativistic Doppler beaming (approaching side brighter & warmer gold-white)
    float doppler = 0.68 + 0.38 * cos(angle + 0.45);

    // Photon ring intense inner spike at r ~ 0.30
    float photonRing = exp(-pow((r - 0.30) * 26.0, 2.0)) * 1.45;

    vec3 hotCore = vec3(1.0, 0.95, 0.84);
    vec3 goldMid = vec3(0.90, 0.66, 0.24);
    vec3 deepAmber = vec3(0.52, 0.21, 0.06);
    vec3 cyanIon = vec3(0.22, 0.74, 0.97);

    float radialTemp = smoothstep(0.95, 0.26, r);
    vec3 baseCol = mix(deepAmber, goldMid, radialTemp);
    baseCol = mix(baseCol, hotCore, pow(radialTemp, 2.6) * doppler);
    baseCol += cyanIon * exp(-pow((r - 0.34) * 14.0, 2.0)) * 0.28 * fineFilaments;

    float density = (0.45 + 0.75 * plasma * fineFilaments + photonRing) * ringMask * doppler;
    gl_FragColor = vec4(baseCol * (1.1 + photonRing), clamp(density * 0.85, 0.0, 0.95));
  }
`;

export function CosmicBackgroundCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // 1. SCENE, CAMERA & RENDERER
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05060a, 0.0085);

    const camera = new THREE.PerspectiveCamera(
      48,
      window.innerWidth / window.innerHeight,
      0.1,
      500,
    );
    camera.position.set(0, 1.2, 22);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(dpr);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 2. DEEP-SPACE GAIA STARFIELD (7,200 STARS)
    const starCount = 7200;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const starSizes = new Float32Array(starCount);
    const starPhases = new Float32Array(starCount);

    const rand = createRng(202610);
    const spectralPalette = [
      new THREE.Color(0xf8fafc), // Starlight Ivory
      new THREE.Color(0xf5d08a), // Relativistic Gold
      new THREE.Color(0xe5a93c), // Accretion Amber
      new THREE.Color(0x38bdf8), // Cerenkov Cyan
      new THREE.Color(0xbae6fd), // O/B Blue-White
      new THREE.Color(0xfde68a), // G-Type Solar Gold
    ];

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      const radius = 6 + Math.pow(rand(), 0.65) * 95;
      const theta = rand() * Math.PI * 2;
      starPositions[i3] = Math.cos(theta) * radius;
      starPositions[i3 + 1] = Math.sin(theta) * radius * 0.72;
      starPositions[i3 + 2] = -rand() * 170;

      const color = spectralPalette[Math.floor(rand() * spectralPalette.length)];
      starColors[i3] = color.r;
      starColors[i3 + 1] = color.g;
      starColors[i3 + 2] = color.b;

      starSizes[i] = 0.7 + Math.pow(rand(), 2.2) * 2.8;
      starPhases[i] = rand() * Math.PI * 2;
    }

    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute("aColor", new THREE.BufferAttribute(starColors, 3));
    starGeometry.setAttribute("aSize", new THREE.BufferAttribute(starSizes, 1));
    starGeometry.setAttribute("aPhase", new THREE.BufferAttribute(starPhases, 1));

    const starUniforms = {
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uScrollVelocity: { value: 0 },
      uPixelRatio: { value: dpr },
    };

    const starMaterial = new THREE.ShaderMaterial({
      vertexShader: STARFIELD_VERTEX_SHADER,
      fragmentShader: STARFIELD_FRAGMENT_SHADER,
      uniforms: starUniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const starPoints = new THREE.Points(starGeometry, starMaterial);
    scene.add(starPoints);

    // 3. 3D RELATIVISTIC KERR SINGULARITY & ACCRETION SYSTEM
    const singularityGroup = new THREE.Group();
    singularityGroup.position.set(5.8, -0.5, -14);
    singularityGroup.rotation.set(0.38, -0.32, 0.24);
    scene.add(singularityGroup);

    const horizonGeo = new THREE.SphereGeometry(2.35, 64, 64);
    const horizonMat = new THREE.MeshBasicMaterial({ color: 0x020305 });
    const horizonMesh = new THREE.Mesh(horizonGeo, horizonMat);
    singularityGroup.add(horizonMesh);

    const photonRingGeo = new THREE.RingGeometry(2.38, 2.75, 96);
    const photonRingMat = new THREE.MeshBasicMaterial({
      color: 0xf5d08a,
      transparent: true,
      opacity: 0.72,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const photonRingMesh = new THREE.Mesh(photonRingGeo, photonRingMat);
    singularityGroup.add(photonRingMesh);

    const diskUniforms = {
      uTime: { value: 0 },
      uScroll: { value: 0 },
    };

    const diskGeo = new THREE.PlaneGeometry(17.5, 17.5, 1, 1);
    const diskMat = new THREE.ShaderMaterial({
      vertexShader: ACCRETION_VERTEX_SHADER,
      fragmentShader: ACCRETION_FRAGMENT_SHADER,
      uniforms: diskUniforms,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const primaryDisk = new THREE.Mesh(diskGeo, diskMat);
    primaryDisk.rotation.x = Math.PI * 0.42;
    singularityGroup.add(primaryDisk);

    const lensedDisk = new THREE.Mesh(diskGeo, diskMat);
    lensedDisk.rotation.x = Math.PI * 0.07;
    lensedDisk.scale.setScalar(0.76);
    singularityGroup.add(lensedDisk);

    // Orbital Coordinate Wireframe Rings
    const astrometryGroup = new THREE.Group();
    scene.add(astrometryGroup);

    const ringRadii = [11, 18, 26];
    const ringGeometries: THREE.BufferGeometry[] = [];
    const ringMaterials: THREE.Material[] = [];

    ringRadii.forEach((r, idx) => {
      const curve = new THREE.EllipseCurve(0, 0, r, r, 0, Math.PI * 2, false, 0);
      const pts = curve.getPoints(128);
      const geo = new THREE.BufferGeometry().setFromPoints(
        pts.map((p) => new THREE.Vector3(p.x, p.y, 0)),
      );
      const mat = new THREE.LineBasicMaterial({
        color: idx === 0 ? 0xe5a93c : 0x38bdf8,
        transparent: true,
        opacity: idx === 0 ? 0.14 : 0.07,
      });
      const line = new THREE.LineLoop(geo, mat);
      line.rotation.x = Math.PI * 0.35 + idx * 0.18;
      line.rotation.y = idx * 0.25;
      astrometryGroup.add(line);
      ringGeometries.push(geo);
      ringMaterials.push(mat);
    });
    astrometryGroup.position.set(0, 0, -24);

    // 4. SCROLL & RESIZE LISTENERS ONLY (NO POINTER/CURSOR MOTION)
    let targetScroll = 0;
    let smoothedScroll = 0;
    let scrollVelocity = 0;

    const updateScroll = () => {
      const maxScroll = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1,
      );
      targetScroll = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
    };

    const handleResize = () => {
      const newDpr = Math.min(window.devicePixelRatio || 1, 2);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(newDpr);
      starUniforms.uPixelRatio.value = newDpr;
      updateScroll();
    };

    updateScroll();
    smoothedScroll = targetScroll;

    window.addEventListener("scroll", updateScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    // 5. FLUID SCROLL ANIMATION LOOP
    let rafId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      rafId = requestAnimationFrame(animate);

      const dt = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.getElapsedTime();

      // Liquid-smooth exponential scroll filter
      const damp = prefersReducedMotion ? 1 : 1 - Math.exp(-8.5 * dt);
      const prevScroll = smoothedScroll;
      smoothedScroll += (targetScroll - smoothedScroll) * damp;

      const rawVel = (smoothedScroll - prevScroll) / Math.max(dt, 0.001);
      scrollVelocity += (rawVel - scrollVelocity) * 0.14;

      starUniforms.uTime.value = elapsed;
      starUniforms.uScroll.value = smoothedScroll;
      starUniforms.uScrollVelocity.value = scrollVelocity;

      diskUniforms.uTime.value = elapsed;
      diskUniforms.uScroll.value = smoothedScroll;

      // Pure Scroll-Driven Camera Trajectory (Zero Cursor Parallax)
      const camTargetX = Math.sin(smoothedScroll * Math.PI * 2) * 1.4;
      const camTargetY = 1.2 - smoothedScroll * 2.2;
      const camTargetZ = 22 - Math.sin(smoothedScroll * Math.PI) * 4.0;

      camera.position.x += (camTargetX - camera.position.x) * 0.08;
      camera.position.y += (camTargetY - camera.position.y) * 0.08;
      camera.position.z += (camTargetZ - camera.position.z) * 0.08;
      camera.lookAt(0, -smoothedScroll * 1.1, -14);

      // Singularity orbital glide across scroll chapters
      const singTargetX = 5.8 - smoothedScroll * 11.5;
      const singTargetY = -0.5 + Math.sin(smoothedScroll * Math.PI * 2) * 2.0;
      const singTargetZ = -14 - Math.sin(smoothedScroll * Math.PI) * 3.2;

      singularityGroup.position.x += (singTargetX - singularityGroup.position.x) * 0.07;
      singularityGroup.position.y += (singTargetY - singularityGroup.position.y) * 0.07;
      singularityGroup.position.z += (singTargetZ - singularityGroup.position.z) * 0.07;

      singularityGroup.rotation.z = 0.24 + smoothedScroll * 0.65;
      singularityGroup.rotation.x = 0.38;

      photonRingMesh.lookAt(camera.position);

      astrometryGroup.rotation.z = elapsed * 0.025 + smoothedScroll * 0.8;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", updateScroll);
      window.removeEventListener("resize", handleResize);

      starGeometry.dispose();
      starMaterial.dispose();
      horizonGeo.dispose();
      horizonMat.dispose();
      photonRingGeo.dispose();
      photonRingMat.dispose();
      diskGeo.dispose();
      diskMat.dispose();
      ringGeometries.forEach((g) => g.dispose());
      ringMaterials.forEach((m) => m.dispose());

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#05060a]"
      aria-hidden="true"
    />
  );
}
