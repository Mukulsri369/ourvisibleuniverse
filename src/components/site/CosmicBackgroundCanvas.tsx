import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Procedural pseudo-random number generator for deterministic texture noise
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
 * High-resolution procedural texture generation for Earth
 * Produces deep ocean blues, continental landmasses, green/tan biomes, and polar ice caps
 */
function createEarthSurfaceTexture(): THREE.CanvasTexture {
  const W = 1024;
  const H = 512;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const rand = createRng(42);

  // Deep ocean base
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, H);
  oceanGrad.addColorStop(0, "#081d3b");
  oceanGrad.addColorStop(0.5, "#0b2545");
  oceanGrad.addColorStop(1, "#081d3b");
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, W, H);

  // Shallow continental shelf water glow
  for (let i = 0; i < 90; i++) {
    const x = rand() * W;
    const y = H * (0.18 + rand() * 0.64);
    const r = 25 + rand() * 70;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, "rgba(20, 80, 130, 0.5)");
    g.addColorStop(1, "rgba(20, 80, 130, 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Continental landmasses
  ctx.globalAlpha = 0.9;
  for (let i = 0; i < 55; i++) {
    const x = rand() * W;
    const y = H * (0.2 + rand() * 0.6);
    const rx = 35 + rand() * 95;
    const ry = 20 + rand() * 55;
    const rot = (rand() - 0.5) * 0.8;
    const isForest = rand() > 0.4;
    ctx.fillStyle = isForest ? "#235c34" : "#6e5a32";

    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
    ctx.fill();

    // Mountain ridges and arid plains inside continent
    const g = ctx.createRadialGradient(x, y, 0, x, y, rx * 0.7);
    g.addColorStop(0, isForest ? "#3c7a4b" : "#8c7243");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, y, rx * 0.7, ry * 0.7, rot, 0, Math.PI * 2);
    ctx.fill();
  }

  // Polar ice caps (Arctic & Antarctic)
  ctx.globalAlpha = 0.95;
  ctx.fillStyle = "#e2e8f0";
  // North pole
  ctx.fillRect(0, 0, W, 22);
  for (let i = 0; i < 30; i++) {
    const x = rand() * W;
    ctx.beginPath();
    ctx.ellipse(x, 22, 15 + rand() * 30, 8 + rand() * 12, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // South pole
  ctx.fillRect(0, H - 28, W, 28);
  for (let i = 0; i < 30; i++) {
    const x = rand() * W;
    ctx.beginPath();
    ctx.ellipse(x, H - 28, 18 + rand() * 35, 10 + rand() * 14, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Procedural Cloud deck texture for Earth (transparent background with drifting white cloud formations)
 */
function createEarthCloudTexture(): THREE.CanvasTexture {
  const W = 1024;
  const H = 512;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const rand = createRng(108);

  ctx.clearRect(0, 0, W, H);

  // Swirling white clouds
  ctx.globalAlpha = 0.65;
  for (let i = 0; i < 110; i++) {
    const x = rand() * W;
    const y = H * (0.15 + rand() * 0.7);
    const w = 40 + rand() * 140;
    const h = 8 + rand() * 22;
    const g = ctx.createRadialGradient(x, y, 0, x, y, w / 2);
    g.addColorStop(0, "rgba(255, 255, 255, 0.9)");
    g.addColorStop(0.5, "rgba(240, 248, 255, 0.5)");
    g.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = g;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1, h / w);
    ctx.translate(-x, -y);
    ctx.beginPath();
    ctx.arc(x, y, w / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * High-resolution procedural texture generation for Venus
 * Produces thick sulfuric acid cloud decks with warm golden and amber chevron swirls
 */
function createVenusSurfaceTexture(): THREE.CanvasTexture {
  const W = 1024;
  const H = 512;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const rand = createRng(77);

  // Base warm amber/sand atmosphere
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, "#d49b4b");
  bgGrad.addColorStop(0.3, "#e2b265");
  bgGrad.addColorStop(0.5, "#d99f48");
  bgGrad.addColorStop(0.7, "#c88a38");
  bgGrad.addColorStop(1, "#bc7e2d");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Horizontal sulfuric cloud layers
  let y = 0;
  while (y < H) {
    const h = 10 + rand() * 32;
    ctx.fillStyle = rand() > 0.5 ? "rgba(245, 208, 138, 0.45)" : "rgba(180, 115, 42, 0.35)";
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= W; x += 32) {
      ctx.lineTo(x, y + Math.sin(x * 0.015 + rand()) * 4);
    }
    ctx.lineTo(W, y + h);
    ctx.lineTo(0, y + h);
    ctx.closePath();
    ctx.fill();
    y += h;
  }

  // Turbulent curved chevron streaks
  ctx.globalAlpha = 0.4;
  for (let i = 0; i < 160; i++) {
    const cy = rand() * H;
    const cx = rand() * W;
    ctx.strokeStyle = rand() > 0.5 ? "#fae29c" : "#9e6122";
    ctx.lineWidth = 1.5 + rand() * 4;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.bezierCurveTo(cx + 50, cy - 6 + rand() * 12, cx + 120, cy - 6 + rand() * 12, cx + 180, cy);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * High-resolution procedural texture generation for Mars
 * Produces rust-red iron silicate soil, dark basaltic maria, and brilliant polar ice caps
 */
function createMarsSurfaceTexture(): THREE.CanvasTexture {
  const W = 1024;
  const H = 512;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const rand = createRng(99);

  // Base rusty red soil
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, "#a23c1e");
  bgGrad.addColorStop(0.5, "#b84724");
  bgGrad.addColorStop(1, "#8e3218");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Dark volcanic basaltic plains (Syrtis Major & maria)
  ctx.globalAlpha = 0.55;
  for (let i = 0; i < 70; i++) {
    const x = rand() * W;
    const y = H * (0.2 + rand() * 0.6);
    const r = 20 + rand() * 85;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, "#4a190f");
    g.addColorStop(0.7, "#692515");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Craters and dusty dunes
  ctx.globalAlpha = 0.4;
  for (let i = 0; i < 180; i++) {
    const x = rand() * W;
    const y = rand() * H;
    const r = 4 + rand() * 18;
    ctx.strokeStyle = rand() > 0.5 ? "#692515" : "#e07548";
    ctx.lineWidth = 1 + rand() * 2;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // North & South Polar Ice Caps
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = "#edf2f7";
  // North polar cap
  ctx.beginPath();
  ctx.ellipse(W * 0.5, 8, W * 0.22, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  // South polar cap
  ctx.beginPath();
  ctx.ellipse(W * 0.5, H - 8, W * 0.18, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 1;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function CosmicBackgroundCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const targetScrollRef = useRef(0);
  const smoothedScrollRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // SCENE & CAMERA
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x04060d, 0.012);

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    camera.position.set(0, 0, 18);

    // RENDERER
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // LIGHTING
    const ambientLight = new THREE.AmbientLight(0x2d3a54, 0.85);
    scene.add(ambientLight);

    // Main directional sunlight
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.6);
    sunLight.position.set(22, 12, 15);
    scene.add(sunLight);

    // Soft rim back-light
    const rimLight = new THREE.DirectionalLight(0x4a72b2, 0.9);
    rimLight.position.set(-20, -10, -10);
    scene.add(rimLight);

    // ==========================================
    // 1. COSMIC STARFIELD & NEBULA PARTICLES
    // ==========================================
    const starCount = 3200;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const starSizes = new Float32Array(starCount);

    const randStar = createRng(1337);
    const starColorPalette = [
      new THREE.Color(0xffffff), // Crisp white
      new THREE.Color(0xdbeafe), // Light ice blue
      new THREE.Color(0x93c5fd), // Cyan blue
      new THREE.Color(0xfef08a), // Warm star gold
      new THREE.Color(0xfbcfe8), // Soft cosmic magenta
    ];

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      // Spread stars wide across the cosmic backdrop
      starPositions[i3] = (randStar() - 0.5) * 160;
      starPositions[i3 + 1] = (randStar() - 0.5) * 140;
      starPositions[i3 + 2] = -15 - randStar() * 120;

      const col = starColorPalette[Math.floor(randStar() * starColorPalette.length)];
      starColors[i3] = col.r;
      starColors[i3 + 1] = col.g;
      starColors[i3 + 2] = col.b;

      starSizes[i] = 0.8 + randStar() * 2.2;
    }

    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute("color", new THREE.BufferAttribute(starColors, 3));

    // Custom points material for stars
    const starMaterial = new THREE.PointsMaterial({
      size: 1.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.88,
      sizeAttenuation: true,
    });
    const starfield = new THREE.Points(starGeometry, starMaterial);
    scene.add(starfield);

    // Nebula dust clusters
    const nebulaCount = 500;
    const nebulaGeometry = new THREE.BufferGeometry();
    const nebulaPositions = new Float32Array(nebulaCount * 3);
    const nebulaColors = new Float32Array(nebulaCount * 3);

    const nebulaPalette = [
      new THREE.Color(0x1e1b4b), // Deep indigo
      new THREE.Color(0x0e7490), // Deep cyan
      new THREE.Color(0x4c1d95), // Deep violet
    ];

    for (let i = 0; i < nebulaCount; i++) {
      const i3 = i * 3;
      nebulaPositions[i3] = (randStar() - 0.5) * 110;
      nebulaPositions[i3 + 1] = (randStar() - 0.5) * 90;
      nebulaPositions[i3 + 2] = -30 - randStar() * 80;

      const col = nebulaPalette[Math.floor(randStar() * nebulaPalette.length)];
      nebulaColors[i3] = col.r;
      nebulaColors[i3 + 1] = col.g;
      nebulaColors[i3 + 2] = col.b;
    }

    nebulaGeometry.setAttribute("position", new THREE.BufferAttribute(nebulaPositions, 3));
    nebulaGeometry.setAttribute("color", new THREE.BufferAttribute(nebulaColors, 3));

    const nebulaMaterial = new THREE.PointsMaterial({
      size: 18.0,
      vertexColors: true,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const nebula = new THREE.Points(nebulaGeometry, nebulaMaterial);
    scene.add(nebula);

    // ==========================================
    // 2. CELESTIAL BODIES (EARTH, VENUS, MARS)
    // ==========================================
    const sphereDetail = 48;

    // --- A. EARTH ---
    const earthGroup = new THREE.Group();
    earthGroup.rotation.z = 0.41; // Natural 23.4° axial tilt
    scene.add(earthGroup);

    const earthTexture = createEarthSurfaceTexture();
    const earthGeo = new THREE.SphereGeometry(2.1, sphereDetail, sphereDetail);
    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.65,
      metalness: 0.1,
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(earthMesh);

    // Earth cloud layer
    const cloudTexture = createEarthCloudTexture();
    const cloudGeo = new THREE.SphereGeometry(2.14, sphereDetail, sphereDetail);
    const cloudMat = new THREE.MeshStandardMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: 0.72,
      blending: THREE.AdditiveBlending,
    });
    const earthClouds = new THREE.Mesh(cloudGeo, cloudMat);
    earthGroup.add(earthClouds);

    // Atmospheric rim halo
    const earthAtmoGeo = new THREE.SphereGeometry(2.24, 32, 32);
    const earthAtmoMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
    });
    const earthAtmo = new THREE.Mesh(earthAtmoGeo, earthAtmoMat);
    earthGroup.add(earthAtmo);

    // --- B. VENUS ---
    const venusGroup = new THREE.Group();
    venusGroup.rotation.z = 3.09; // Natural 177° axial tilt
    scene.add(venusGroup);

    const venusTexture = createVenusSurfaceTexture();
    const venusGeo = new THREE.SphereGeometry(1.85, sphereDetail, sphereDetail);
    const venusMat = new THREE.MeshStandardMaterial({
      map: venusTexture,
      roughness: 0.5,
      metalness: 0.05,
    });
    const venusMesh = new THREE.Mesh(venusGeo, venusMat);
    venusGroup.add(venusMesh);

    // Venus golden haze halo
    const venusAtmoGeo = new THREE.SphereGeometry(1.98, 32, 32);
    const venusAtmoMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.16,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
    });
    const venusAtmo = new THREE.Mesh(venusAtmoGeo, venusAtmoMat);
    venusGroup.add(venusAtmo);

    // --- C. MARS ---
    const marsGroup = new THREE.Group();
    marsGroup.rotation.z = 0.44; // Natural 25.2° axial tilt
    scene.add(marsGroup);

    const marsTexture = createMarsSurfaceTexture();
    const marsGeo = new THREE.SphereGeometry(1.4, sphereDetail, sphereDetail);
    const marsMat = new THREE.MeshStandardMaterial({
      map: marsTexture,
      roughness: 0.8,
      metalness: 0.15,
    });
    const marsMesh = new THREE.Mesh(marsGeo, marsMat);
    marsGroup.add(marsMesh);

    // Mars soft red haze halo
    const marsAtmoGeo = new THREE.SphereGeometry(1.5, 32, 32);
    const marsAtmoMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.14,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
    });
    const marsAtmo = new THREE.Mesh(marsAtmoGeo, marsAtmoMat);
    marsGroup.add(marsAtmo);

    // Initial positions
    earthGroup.position.set(5.5, 1.5, -4);
    venusGroup.position.set(-14, 5, -8);
    venusGroup.scale.setScalar(0.01);
    marsGroup.position.set(14, -6, -8);
    marsGroup.scale.setScalar(0.01);

    // ==========================================
    // 3. SCROLL PROGRESS TRACKING
    // ==========================================
    const calculateScrollRatio = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return 0;
      return Math.min(Math.max(window.scrollY / scrollHeight, 0), 1);
    };

    const handleScroll = () => {
      targetScrollRef.current = calculateScrollRatio();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    // Resize handler
    const handleResize = () => {
      if (!renderer || !camera) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // ==========================================
    // 4. ANIMATION & PARALLAX RENDER LOOP
    // ==========================================
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smooth scroll lerping for inertia and fluid damping
      const scrollDampSpeed = prefersReducedMotion ? 1 : 0.08;
      smoothedScrollRef.current +=
        (targetScrollRef.current - smoothedScrollRef.current) * scrollDampSpeed;
      const s = smoothedScrollRef.current; // 0 (top) to 1 (bottom)

      // Idle self-rotation
      earthMesh.rotation.y += delta * 0.22;
      earthClouds.rotation.y += delta * 0.29; // Clouds drift slightly faster
      venusMesh.rotation.y += delta * 0.16;
      marsMesh.rotation.y += delta * 0.2;

      // Starfield subtle slow drift
      starfield.rotation.y = elapsed * 0.005 + s * 0.12;
      nebula.rotation.y = elapsed * 0.003 - s * 0.08;

      // Responsive viewport coordinate factor
      const aspect = camera.aspect;
      const edgeFactorX = Math.min(Math.max(aspect, 0.7), 2.2);

      // --- EARTH ORBIT & TRAJECTORY ---
      // Earth is positioned on the right flank at the top,
      // and gently glides across mid-right with sine-wave breathing as user scrolls down
      const earthBaseX = 4.6 * edgeFactorX;
      const earthTargetX = earthBaseX - s * 2.2 + Math.cos(elapsed * 0.35) * 0.45;
      const earthTargetY = 1.2 - s * 3.8 + Math.sin(elapsed * 0.45) * 0.4;
      const earthTargetZ = -4 - s * 2.5;

      earthGroup.position.x += (earthTargetX - earthGroup.position.x) * 0.1;
      earthGroup.position.y += (earthTargetY - earthGroup.position.y) * 0.1;
      earthGroup.position.z += (earthTargetZ - earthGroup.position.z) * 0.1;

      // --- VENUS ORBIT & POP-OUT TRAJECTORY ---
      // Pops out smoothly as user begins scrolling down (reaches full scale around s = 0.15)
      // and drifts along the left flank down to the footer
      const venusEntrance = Math.min(Math.max((s - 0.02) / 0.14, 0), 1);
      const venusScale = THREE.MathUtils.lerp(0.01, 1.0, venusEntrance);
      venusGroup.scale.setScalar(venusScale);

      const venusBaseX = -4.8 * edgeFactorX;
      const venusTargetX = venusBaseX + Math.sin(s * Math.PI + elapsed * 0.4) * 0.9;
      const venusTargetY = 2.4 - s * 4.2 + Math.cos(elapsed * 0.4) * 0.35;
      const venusTargetZ = -5 + Math.sin(s * 2.0) * 1.5;

      venusGroup.position.x += (venusTargetX - venusGroup.position.x) * 0.1;
      venusGroup.position.y += (venusTargetY - venusGroup.position.y) * 0.1;
      venusGroup.position.z += (venusTargetZ - venusGroup.position.z) * 0.1;

      // --- MARS ORBIT & POP-OUT TRAJECTORY ---
      // Pops out smoothly around mid-scroll (s >= 0.18, full scale around s = 0.35)
      // and dances along the lower right flank and center-right all the way to the footer
      const marsEntrance = Math.min(Math.max((s - 0.14) / 0.18, 0), 1);
      const marsScale = THREE.MathUtils.lerp(0.01, 1.0, marsEntrance);
      marsGroup.scale.setScalar(marsScale);

      const marsBaseX = 4.2 * edgeFactorX;
      const marsTargetX = marsBaseX - Math.sin(s * 3.0 + elapsed * 0.3) * 1.2;
      const marsTargetY = -1.6 - s * 2.0 + Math.sin(elapsed * 0.5) * 0.3;
      const marsTargetZ = -4.5 + Math.cos(s * 2.5) * 1.2;

      marsGroup.position.x += (marsTargetX - marsGroup.position.x) * 0.1;
      marsGroup.position.y += (marsTargetY - marsGroup.position.y) * 0.1;
      marsGroup.position.z += (marsTargetZ - marsGroup.position.z) * 0.1;

      renderer.render(scene, camera);
    };

    animate();

    // CLEANUP
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);

      // Dispose Three.js resources
      starGeometry.dispose();
      starMaterial.dispose();
      nebulaGeometry.dispose();
      nebulaMaterial.dispose();

      earthGeo.dispose();
      earthMat.dispose();
      earthTexture.dispose();
      cloudGeo.dispose();
      cloudMat.dispose();
      cloudTexture.dispose();
      earthAtmoGeo.dispose();
      earthAtmoMat.dispose();

      venusGeo.dispose();
      venusMat.dispose();
      venusTexture.dispose();
      venusAtmoGeo.dispose();
      venusAtmoMat.dispose();

      marsGeo.dispose();
      marsMat.dispose();
      marsTexture.dispose();
      marsAtmoGeo.dispose();
      marsAtmoMat.dispose();

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    />
  );
}
