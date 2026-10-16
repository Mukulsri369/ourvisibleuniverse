import React, { useState, useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import type { LearningLevel } from "@/lib/academy/types";
import {
  HISTORICAL_SPACECRAFT,
  SOLAR_SYSTEM_WAYPOINTS,
  type SpacecraftModel,
} from "@/lib/academy/lessons/module-22-space-missions";
import {
  Rocket,
  Compass,
  Play,
  RotateCcw,
  Sparkles,
  Info,
  Layers,
  ChevronRight,
  Shield,
  Gauge,
  Radio,
  Clock,
  Target,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Move3d,
  Eye,
  Sliders,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SpaceMuseumLabProps {
  level: LearningLevel;
  onInteract?: () => void;
}

type MuseumTab =
  | "3d_spacecraft"
  | "solar_map"
  | "gravity_assist"
  | "mars_planner"
  | "rocket_equation"
  | "distance_compare";

export const SpaceMuseumLab: React.FC<SpaceMuseumLabProps> = ({ level, onInteract }) => {
  const [activeTab, setActiveTab] = useState<MuseumTab>("3d_spacecraft");
  const [selectedCraftId, setSelectedCraftId] = useState<string>("chandrayaan-3");
  const [wireframe, setWireframe] = useState<boolean>(false);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [explodedView, setExplodedView] = useState<number>(0); // 0 to 1
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [hudCollapsed, setHudCollapsed] = useState<boolean>(false);

  // Canvas mount reference for Three.js
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const craftGroupRef = useRef<THREE.Group | null>(null);
  const componentsMapRef = useRef<Map<string, THREE.Object3D>>(new Map());
  const isDraggingRef = useRef<boolean>(false);
  const previousMousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const activeCraft = useMemo(
    () => HISTORICAL_SPACECRAFT.find((c) => c.id === selectedCraftId) || HISTORICAL_SPACECRAFT[0],
    [selectedCraftId],
  );

  // Initialize and update 3D procedural model scene
  useEffect(() => {
    if (activeTab !== "3d_spacecraft" || !mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 520;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x060913);
    scene.fog = new THREE.FogExp2(0x060913, 0.04);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 2.5, 5.5);
    camera.lookAt(0, 0, 0);

    const isHeadless =
      typeof navigator !== "undefined" &&
      (navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent));
    const renderer = new THREE.WebGLRenderer({
      antialias: !isHeadless,
      alpha: false,
      powerPreference: "high-performance",
    });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(isHeadless ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isHeadless;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // 2. Studio Environment & Lighting
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const keyLight = new THREE.DirectionalLight(0xfffaed, 2.8);
    keyLight.position.set(4, 7, 5);
    keyLight.castShadow = !isHeadless;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const fillLight = new THREE.HemisphereLight(0x7ea2d6, 0x1a2130, 1.2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x4299e1, 1.8);
    rimLight.position.set(-5, -2, -4);
    scene.add(rimLight);

    // Contact shadow plane
    const shadowGeo = new THREE.PlaneGeometry(8, 8);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -1.5;
    scene.add(shadowMesh);

    // Subtle background space particle dust
    const starsGeo = new THREE.BufferGeometry();
    const starCount = 350;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 30;
      starPositions[i + 1] = (Math.random() - 0.5) * 20;
      starPositions[i + 2] = (Math.random() - 0.5) * 30;
    }
    starsGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starsMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.08,
      transparent: true,
      opacity: 0.6,
    });
    const starPoints = new THREE.Points(starsGeo, starsMat);
    scene.add(starPoints);

    // 3. Build Procedural Spacecraft Composite Model
    const craftGroup = new THREE.Group();
    craftGroup.position.set(0, -0.2, 0);
    scene.add(craftGroup);
    craftGroupRef.current = craftGroup;
    componentsMapRef.current.clear();

    buildProceduralCraft(selectedCraftId, craftGroup, componentsMapRef.current, wireframe);

    // Pre-warm shaders
    renderer.compile(scene, camera);

    // 4. Mouse & Touch Orbit Interaction
    let targetRotationY = 0;
    let targetRotationX = 0;
    let currentRotationY = 0;
    let currentRotationX = 0;
    let cameraDistance = 5.5;

    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;
      targetRotationY += deltaX * 0.008;
      targetRotationX += deltaY * 0.008;
      targetRotationX = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, targetRotationX));
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
      onInteract?.();
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraDistance += e.deltaY * 0.003;
      cameraDistance = Math.max(2.5, Math.min(10.0, cameraDistance));
      camera.position.z = cameraDistance;
      onInteract?.();
    };

    // Touch support for mobile
    let touchStartDist = 0;
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        touchStartDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY,
        );
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && isDraggingRef.current) {
        const deltaX = e.touches[0].clientX - previousMousePositionRef.current.x;
        const deltaY = e.touches[0].clientY - previousMousePositionRef.current.y;
        targetRotationY += deltaX * 0.008;
        targetRotationX += deltaY * 0.008;
        targetRotationX = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, targetRotationX));
        previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY,
        );
        const diff = touchStartDist - dist;
        cameraDistance += diff * 0.005;
        cameraDistance = Math.max(2.5, Math.min(10.0, cameraDistance));
        camera.position.z = cameraDistance;
        touchStartDist = dist;
      }
    };

    const onTouchEnd = () => {
      isDraggingRef.current = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    domElement.addEventListener("wheel", onWheel, { passive: false });
    domElement.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    // Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newW = entry.contentRect.width;
        const newH = entry.contentRect.height;
        if (newW > 0 && newH > 0) {
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, newH);
        }
      }
    });
    resizeObserver.observe(container);

    // 5. Animation Loop with smooth damping
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (autoRotate && !isDraggingRef.current) {
        targetRotationY += delta * 0.25;
      }

      // Smooth exponential damping
      currentRotationY = THREE.MathUtils.damp(currentRotationY, targetRotationY, 8, delta);
      currentRotationX = THREE.MathUtils.damp(currentRotationX, targetRotationX, 8, delta);

      if (craftGroupRef.current) {
        craftGroupRef.current.rotation.y = currentRotationY;
        craftGroupRef.current.rotation.x = currentRotationX;
      }

      // Gentle floating oscillation
      const time = clock.getElapsedTime();
      if (craftGroupRef.current) {
        craftGroupRef.current.position.y = -0.2 + Math.sin(time * 1.2) * 0.04;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      domElement.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      domElement.removeEventListener("wheel", onWheel);
      domElement.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      resizeObserver.disconnect();
      renderer.dispose();
      shadowGeo.dispose();
      shadowMat.dispose();
      starsGeo.dispose();
      starsMat.dispose();
      if (container.contains(domElement)) {
        container.removeChild(domElement);
      }
    };
  }, [activeTab, selectedCraftId, wireframe, autoRotate, onInteract]);

  // Update exploded view offsets when slider changes
  useEffect(() => {
    if (!craftGroupRef.current) return;
    const offsetScale = explodedView * 0.8;
    componentsMapRef.current.forEach((obj, key) => {
      const orig = (obj.userData as { origPos?: THREE.Vector3 }).origPos;
      const explodeDir = (obj.userData as { explodeDir?: THREE.Vector3 }).explodeDir;
      if (orig && explodeDir) {
        obj.position.copy(orig).addScaledVector(explodeDir, offsetScale);
      }
    });
  }, [explodedView]);

  // Highlight selected component
  useEffect(() => {
    componentsMapRef.current.forEach((obj, key) => {
      obj.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const mat = child.material as THREE.MeshStandardMaterial;
          if (mat && mat.emissive) {
            if (key === selectedComponentId) {
              mat.emissive.setHex(0x3b82f6);
              mat.emissiveIntensity = 0.5;
            } else {
              mat.emissive.setHex(0x000000);
              mat.emissiveIntensity = 0;
            }
          }
        }
      });
    });
  }, [selectedComponentId]);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/80 backdrop-blur-md overflow-hidden shadow-2xl">
      {/* 1. Lab Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 bg-slate-900/60 p-3 sm:px-5 gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <Rocket className="size-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              Spaceflight Interactive Museum & Physics Lab
            </h3>
            <p className="text-[11px] text-slate-400">
              Procedural 3D Spacecraft, Mission Trajectories, Gravity Assists & Rocket Staging
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab("3d_spacecraft")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "3d_spacecraft"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Move3d className="size-3.5" />
            3D Spacecraft Museum
          </button>
          <button
            onClick={() => setActiveTab("solar_map")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "solar_map"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Compass className="size-3.5" />
            Solar System Mission Map
          </button>
          <button
            onClick={() => setActiveTab("gravity_assist")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "gravity_assist"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Zap className="size-3.5" />
            Gravity Assist Slingshot
          </button>
          <button
            onClick={() => setActiveTab("mars_planner")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "mars_planner"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Target className="size-3.5" />
            Plan a Journey to Mars
          </button>
          <button
            onClick={() => setActiveTab("rocket_equation")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "rocket_equation"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Gauge className="size-3.5" />
            Delta-V & Rocket Equation
          </button>
          <button
            onClick={() => setActiveTab("distance_compare")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "distance_compare"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Radio className="size-3.5" />
            Distance & Radio Delay
          </button>
        </div>
      </div>

      {/* 2. Main Tab Viewport */}
      <div className="p-4 sm:p-6">
        {/* TAB 1: 3D SPACECRAFT MUSEUM */}
        {activeTab === "3d_spacecraft" && (
          <div className="space-y-4">
            {/* Spacecraft Selector Carousel / Pill selector */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800">
              {HISTORICAL_SPACECRAFT.map((craft) => (
                <button
                  key={craft.id}
                  onClick={() => {
                    setSelectedCraftId(craft.id);
                    setSelectedComponentId(null);
                    setExplodedView(0);
                    onInteract?.();
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border flex items-center gap-2 ${
                    selectedCraftId === craft.id
                      ? "bg-blue-600/20 text-blue-300 border-blue-500/50 shadow-sm shadow-blue-500/20"
                      : "bg-slate-900/80 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200"
                  }`}
                >
                  <span className="font-mono text-[10px] text-slate-500">
                    {craft.technicalSpecs.launchVehicle ? "🚀" : "🛰️"}
                  </span>
                  <span>{craft.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700">
                    {craft.operator}
                  </span>
                </button>
              ))}
            </div>

            {/* 3D Canvas Viewport with Collapsible Bottom Dock (Zero Center Viewport Occlusion) */}
            <div className="relative w-full h-[520px] rounded-xl overflow-hidden border border-slate-800 bg-[#060913]">
              {/* WebGL Canvas mount */}
              <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

              {/* Minimal Top-Left Spec Badge */}
              <div className="absolute top-3 left-3 bg-slate-950/80 border border-slate-800/90 rounded-lg p-2.5 max-w-xs pointer-events-none">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    {activeCraft.operator}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {activeCraft.launchDate}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white mt-1">{activeCraft.name}</h4>
                <p className="text-[11px] text-slate-300 line-clamp-2 mt-0.5">
                  {activeCraft.description}
                </p>
                <div className="flex items-center gap-3 mt-2 text-[10px] font-mono text-slate-400">
                  <span>Mass: {activeCraft.massKg.toLocaleString()} kg</span>
                  <span>•</span>
                  <span>
                    Status: <strong className="text-emerald-400">{activeCraft.status}</strong>
                  </span>
                </div>
              </div>

              {/* Component Inspection Badge (Top Right when selected) */}
              {selectedComponentId && (
                <div className="absolute top-3 right-3 bg-blue-950/90 border border-blue-500/40 rounded-lg p-3 max-w-sm shadow-xl">
                  {(() => {
                    const comp = activeCraft.components.find((c) => c.id === selectedComponentId);
                    if (!comp) return null;
                    return (
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono uppercase text-blue-400 font-bold">
                            Subsystem Inspected
                          </span>
                          <button
                            onClick={() => setSelectedComponentId(null)}
                            className="text-slate-400 hover:text-white text-xs"
                          >
                            ✕
                          </button>
                        </div>
                        <h5 className="text-xs font-bold text-white mt-1">{comp.name}</h5>
                        <div className="text-[11px] text-blue-200 mt-0.5">{comp.role}</div>
                        <p className="text-[10px] text-slate-300 mt-1.5 leading-relaxed bg-black/40 p-2 rounded border border-blue-500/20">
                          {comp.engineeringDetail}
                        </p>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Collapsible Bottom Control Dock (Three.js skill directive) */}
              <div
                className={`absolute bottom-3 left-1/2 -translate-x-1/2 w-[92%] max-w-3xl transition-transform duration-300 z-10 ${
                  hudCollapsed ? "translate-y-[82%]" : "translate-y-0"
                }`}
              >
                {/* Collapse / Expand Toggle Button */}
                <div className="flex justify-center -mb-2">
                  <button
                    onClick={() => setHudCollapsed(!hudCollapsed)}
                    className="bg-slate-900 border border-slate-700 text-slate-300 hover:text-white px-3 py-0.5 rounded-t-lg text-[11px] flex items-center gap-1 shadow-md hover:bg-slate-800"
                  >
                    {hudCollapsed ? (
                      <ChevronUp className="size-3" />
                    ) : (
                      <ChevronDown className="size-3" />
                    )}
                    <span>
                      {hudCollapsed ? "Show Controls Dock" : "Hide Controls Dock (Cinema Mode)"}
                    </span>
                  </button>
                </div>

                {/* Glassmorphic Dock Container */}
                <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 shadow-2xl backdrop-blur-md">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                    {/* Subsystem Component Selector */}
                    <div>
                      <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-1">
                        <Layers className="size-3 text-blue-400" />
                        Inspect Subsystem
                      </label>
                      <select
                        value={selectedComponentId || ""}
                        onChange={(e) => {
                          setSelectedComponentId(e.target.value || null);
                          onInteract?.();
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                      >
                        <option value="">Full Assembly Overview</option>
                        {activeCraft.components.map((comp) => (
                          <option key={comp.id} value={comp.id}>
                            {comp.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Exploded View Slider */}
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                        <span className="flex items-center gap-1">
                          <Sliders className="size-3 text-purple-400" />
                          Exploded Subassembly View
                        </span>
                        <span>{Math.round(explodedView * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={explodedView}
                        onChange={(e) => {
                          setExplodedView(parseFloat(e.target.value));
                          onInteract?.();
                        }}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                      />
                    </div>

                    {/* Viewport Toggles */}
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAutoRotate(!autoRotate)}
                        className={`text-xs h-7 px-2.5 ${
                          autoRotate
                            ? "bg-blue-600/20 text-blue-300 border-blue-500/40"
                            : "bg-slate-900 text-slate-400 border-slate-700"
                        }`}
                      >
                        <RotateCcw className="size-3 mr-1" />
                        {autoRotate ? "Auto-Spin On" : "Auto-Spin Off"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setWireframe(!wireframe)}
                        className={`text-xs h-7 px-2.5 ${
                          wireframe
                            ? "bg-purple-600/20 text-purple-300 border-purple-500/40"
                            : "bg-slate-900 text-slate-400 border-slate-700"
                        }`}
                      >
                        <Eye className="size-3 mr-1" />
                        Wireframe
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Craft Specifications & Engineering Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3.5 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400 font-mono uppercase">
                  <Shield className="size-3.5" />
                  Engineering Specifications
                </div>
                <div className="text-[11px] text-slate-300 space-y-1.5">
                  <div>
                    <strong>Dimensions:</strong> {activeCraft.technicalSpecs.dimensions}
                  </div>
                  <div>
                    <strong>Launch Vehicle:</strong> {activeCraft.technicalSpecs.launchVehicle}
                  </div>
                  <div>
                    <strong>Power Source:</strong> {activeCraft.powerSource}
                  </div>
                  <div>
                    <strong>Propulsion:</strong> {activeCraft.propulsionType}
                  </div>
                  <div>
                    <strong>Operational Orbit:</strong>{" "}
                    {activeCraft.technicalSpecs.orbitOrTrajectory}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3.5 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-400 font-mono uppercase">
                  <Sparkles className="size-3.5" />
                  Scientific Achievements
                </div>
                <ul className="text-[11px] text-slate-300 space-y-1 list-disc pl-4">
                  {activeCraft.scientificAchievements.map((ach, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {ach}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3.5 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 font-mono uppercase">
                  <Clock className="size-3.5" />
                  Flight Milestones
                </div>
                <div className="text-[11px] text-slate-300 space-y-1.5">
                  {activeCraft.keyMilestones.map((ms, idx) => (
                    <div
                      key={idx}
                      className="border-l-2 border-emerald-500/40 pl-2 py-0.5 text-[10px]"
                    >
                      {ms}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SOLAR SYSTEM MISSION MAP */}
        {activeTab === "solar_map" && (
          <SolarSystemMissionMap
            onSelectCraft={(id) => {
              setSelectedCraftId(id);
              setActiveTab("3d_spacecraft");
              onInteract?.();
            }}
          />
        )}

        {/* TAB 3: GRAVITY ASSIST SIMULATOR */}
        {activeTab === "gravity_assist" && <GravityAssistSimulator onInteract={onInteract} />}

        {/* TAB 4: PLAN A JOURNEY TO MARS */}
        {activeTab === "mars_planner" && <MarsMissionPlanner onInteract={onInteract} />}

        {/* TAB 5: DELTA-V & ROCKET EQUATION */}
        {activeTab === "rocket_equation" && <RocketEquationLab onInteract={onInteract} />}

        {/* TAB 6: DISTANCE COMPARISON & RADIO LATENCY */}
        {activeTab === "distance_compare" && <DistanceComparator onInteract={onInteract} />}
      </div>
    </div>
  );
};

// ==========================================
// 3D PROCEDURAL CRAFT BUILDER (THREE.Group)
// Follows Three.js Directives: 3-12 parts,
// varied roughness/metalness, no default single primitives
// ==========================================
function buildProceduralCraft(
  craftId: string,
  rootGroup: THREE.Group,
  componentsMap: Map<string, THREE.Object3D>,
  isWireframe: boolean,
) {
  // Shared materials
  const metalMat = new THREE.MeshStandardMaterial({
    color: 0xd8d8d8,
    metalness: 0.9,
    roughness: 0.2,
    wireframe: isWireframe,
  });

  const darkMetalMat = new THREE.MeshStandardMaterial({
    color: 0x24272e,
    metalness: 0.85,
    roughness: 0.45,
    wireframe: isWireframe,
  });

  const goldFoilMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    metalness: 0.95,
    roughness: 0.25,
    bumpScale: 0.05,
    wireframe: isWireframe,
  });

  const solarCellMat = new THREE.MeshStandardMaterial({
    color: 0x1e3a8a,
    metalness: 0.6,
    roughness: 0.2,
    wireframe: isWireframe,
  });

  const whiteThermalMat = new THREE.MeshStandardMaterial({
    color: 0xf3f4f6,
    metalness: 0.1,
    roughness: 0.6,
    wireframe: isWireframe,
  });

  const kaptonSilverMat = new THREE.MeshStandardMaterial({
    color: 0xc0c6ce,
    metalness: 0.8,
    roughness: 0.3,
    wireframe: isWireframe,
  });

  // Clear existing children
  while (rootGroup.children.length > 0) {
    const child = rootGroup.children[0];
    rootGroup.remove(child);
  }

  switch (craftId) {
    case "sputnik-1": {
      // 1. Sphere Hull
      const sphereGeo = new THREE.SphereGeometry(1.2, 32, 24);
      const sphereMesh = new THREE.Mesh(sphereGeo, metalMat);
      sphereMesh.userData = {
        origPos: new THREE.Vector3(0, 0, 0),
        explodeDir: new THREE.Vector3(0, 0, 0),
      };
      rootGroup.add(sphereMesh);
      componentsMap.set("sphere-hull", sphereMesh);

      // 2. Equatorial join seam flange
      const ringGeo = new THREE.TorusGeometry(1.21, 0.03, 16, 64);
      const ringMesh = new THREE.Mesh(ringGeo, darkMetalMat);
      ringMesh.rotation.x = Math.PI / 2;
      sphereMesh.add(ringMesh);

      // 3. Four Whip Antennas (swept back at 35 degrees)
      const whipGroup = new THREE.Group();
      whipGroup.userData = {
        origPos: new THREE.Vector3(0, 0, 0),
        explodeDir: new THREE.Vector3(0, 0, 1),
      };
      const angles = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];
      angles.forEach((ang) => {
        const antennaGeo = new THREE.CylinderGeometry(0.015, 0.005, 3.2, 8);
        const antennaMesh = new THREE.Mesh(antennaGeo, metalMat);
        antennaMesh.position.set(Math.cos(ang) * 1.15, Math.sin(ang) * 1.15, -0.6);
        antennaMesh.rotation.z = ang + Math.PI / 2;
        antennaMesh.rotation.x = -0.55;
        whipGroup.add(antennaMesh);
      });
      rootGroup.add(whipGroup);
      componentsMap.set("whip-antennas", whipGroup);

      // 4. Radio Transmitter & Internal Battery Core
      const coreGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.8, 16);
      const coreMesh = new THREE.Mesh(coreGeo, darkMetalMat);
      coreMesh.userData = {
        origPos: new THREE.Vector3(0, 0, 0),
        explodeDir: new THREE.Vector3(0, 1, 0),
      };
      rootGroup.add(coreMesh);
      componentsMap.set("radio-transmitter", coreMesh);
      componentsMap.set("battery-block", coreMesh);
      break;
    }

    case "chandrayaan-3": {
      // 1. Vikram Lander Chassis (Gold insulation box)
      const chassisGroup = new THREE.Group();
      const bodyGeo = new THREE.BoxGeometry(1.6, 1.2, 1.6);
      const bodyMesh = new THREE.Mesh(bodyGeo, goldFoilMat);
      chassisGroup.add(bodyMesh);

      // Top equipment deck
      const deckGeo = new THREE.BoxGeometry(1.4, 0.1, 1.4);
      const deckMesh = new THREE.Mesh(deckGeo, whiteThermalMat);
      deckMesh.position.y = 0.65;
      chassisGroup.add(deckMesh);
      chassisGroup.userData = {
        origPos: new THREE.Vector3(0, 0, 0),
        explodeDir: new THREE.Vector3(0, 0.5, 0),
      };
      rootGroup.add(chassisGroup);
      componentsMap.set("vikram-chassis", chassisGroup);

      // 2. Four Throttleable Landing Engines & Bell Nozzles
      const engineGroup = new THREE.Group();
      const nozzleOffsets = [
        [-0.55, -0.55],
        [0.55, -0.55],
        [-0.55, 0.55],
        [0.55, 0.55],
      ];
      nozzleOffsets.forEach(([x, z]) => {
        const coneGeo = new THREE.ConeGeometry(0.18, 0.45, 16);
        const coneMesh = new THREE.Mesh(coneGeo, darkMetalMat);
        coneMesh.rotation.x = Math.PI;
        coneMesh.position.set(x, -0.7, z);
        engineGroup.add(coneMesh);
      });
      engineGroup.userData = {
        origPos: new THREE.Vector3(0, 0, 0),
        explodeDir: new THREE.Vector3(0, -1, 0),
      };
      rootGroup.add(engineGroup);
      componentsMap.set("throttleable-engines", engineGroup);

      // 3. Four Articulated Landing Strut Legs & Footpads
      const legsGroup = new THREE.Group();
      nozzleOffsets.forEach(([x, z]) => {
        const strutGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.3, 8);
        const strutMesh = new THREE.Mesh(strutGeo, metalMat);
        strutMesh.position.set(x * 1.5, -0.75, z * 1.5);
        strutMesh.rotation.z = x > 0 ? -0.4 : 0.4;
        strutMesh.rotation.x = z > 0 ? 0.4 : -0.4;
        legsGroup.add(strutMesh);

        // Circular footpad dish
        const padGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.04, 16);
        const padMesh = new THREE.Mesh(padGeo, goldFoilMat);
        padMesh.position.set(x * 1.8, -1.2, z * 1.8);
        legsGroup.add(padMesh);
      });
      legsGroup.userData = {
        origPos: new THREE.Vector3(0, 0, 0),
        explodeDir: new THREE.Vector3(0, -0.4, 0),
      };
      rootGroup.add(legsGroup);

      // 4. Pragyan 6-Wheeled Rover on Deployable Ramp
      const roverGroup = new THREE.Group();
      const roverBody = new THREE.BoxGeometry(0.55, 0.25, 0.4);
      const roverMesh = new THREE.Mesh(roverBody, goldFoilMat);
      roverMesh.position.set(0.9, -0.9, 0.9);
      roverGroup.add(roverMesh);

      // Pragyan Solar Panel
      const roverPanelGeo = new THREE.BoxGeometry(0.5, 0.02, 0.35);
      const roverPanelMesh = new THREE.Mesh(roverPanelGeo, solarCellMat);
      roverPanelMesh.position.set(0.9, -0.75, 0.9);
      roverGroup.add(roverPanelMesh);

      // 6 Mini Wheels
      [-0.2, 0, 0.2].forEach((wx) => {
        [-0.22, 0.22].forEach((wz) => {
          const wGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.05, 12);
          const wMesh = new THREE.Mesh(wGeo, darkMetalMat);
          wMesh.rotation.z = Math.PI / 2;
          wMesh.position.set(0.9 + wx, -1.05, 0.9 + wz);
          roverGroup.add(wMesh);
        });
      });

      // Deployable ramp
      const rampGeo = new THREE.BoxGeometry(0.45, 0.03, 1.2);
      const rampMesh = new THREE.Mesh(rampGeo, metalMat);
      rampMesh.position.set(0.5, -0.4, 0.5);
      rampMesh.rotation.x = 0.55;
      rampMesh.rotation.y = 0.78;
      roverGroup.add(rampMesh);

      roverGroup.userData = {
        origPos: new THREE.Vector3(0, 0, 0),
        explodeDir: new THREE.Vector3(1, 0, 1),
      };
      rootGroup.add(roverGroup);
      componentsMap.set("pragyan-rover", roverGroup);

      // 5. ChaSTE Thermal Needle Probe & ILSA seismometer
      const chasteGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.6, 8);
      const chasteMesh = new THREE.Mesh(chasteGeo, darkMetalMat);
      chasteMesh.position.set(-0.7, -0.9, 0);
      chasteMesh.userData = {
        origPos: new THREE.Vector3(0, 0, 0),
        explodeDir: new THREE.Vector3(-1, 0, 0),
      };
      rootGroup.add(chasteMesh);
      componentsMap.set("chaste-probe", chasteMesh);
      break;
    }

    case "voyager-1": {
      // 1. 3.7-Meter Parabolic High Gain Antenna (White Dish)
      const dishGroup = new THREE.Group();
      // Parabolic bowl approximation
      const dishGeo = new THREE.CylinderGeometry(1.8, 0.3, 0.45, 32, 1, true);
      const dishMesh = new THREE.Mesh(dishGeo, whiteThermalMat);
      dishMesh.rotation.x = Math.PI;
      dishGroup.add(dishMesh);

      // Feed horn tripod
      const hornGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.3, 16);
      const hornMesh = new THREE.Mesh(hornGeo, darkMetalMat);
      hornMesh.position.y = 0.6;
      dishGroup.add(hornMesh);

      const tripodLegs = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3];
      tripodLegs.forEach((ang) => {
        const strut = new THREE.CylinderGeometry(0.02, 0.02, 0.9, 8);
        const strutMesh = new THREE.Mesh(strut, metalMat);
        strutMesh.position.set(Math.cos(ang) * 0.4, 0.3, Math.sin(ang) * 0.4);
        strutMesh.rotation.z = Math.cos(ang) * 0.4;
        strutMesh.rotation.x = Math.sin(ang) * 0.4;
        dishGroup.add(strutMesh);
      });

      dishGroup.userData = {
        origPos: new THREE.Vector3(0, 0.5, 0),
        explodeDir: new THREE.Vector3(0, 1, 0),
      };
      rootGroup.add(dishGroup);
      componentsMap.set("high-gain-antenna", dishGroup);

      // 2. Decagonal Bus Structure
      const busGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.5, 10);
      const busMesh = new THREE.Mesh(busGeo, darkMetalMat);
      busMesh.position.y = -0.1;
      busMesh.userData = {
        origPos: new THREE.Vector3(0, -0.1, 0),
        explodeDir: new THREE.Vector3(0, 0, 0),
      };
      rootGroup.add(busMesh);

      // 3. RTG Nuclear Power Boom (3 cylinders on truss)
      const rtgGroup = new THREE.Group();
      const rtgTrussGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.8, 8);
      const rtgTruss = new THREE.Mesh(rtgTrussGeo, metalMat);
      rtgTruss.rotation.z = Math.PI / 2;
      rtgTruss.position.set(-1.2, -0.3, 0);
      rtgGroup.add(rtgTruss);

      for (let i = 0; i < 3; i++) {
        const rtgCylGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.4, 16);
        const rtgCyl = new THREE.Mesh(rtgCylGeo, darkMetalMat);
        rtgCyl.position.set(-1.2 - i * 0.45, -0.3, 0);
        rtgCyl.rotation.x = Math.PI / 2;
        rtgGroup.add(rtgCyl);
      }
      rtgGroup.userData = {
        origPos: new THREE.Vector3(0, 0, 0),
        explodeDir: new THREE.Vector3(-1.2, 0, 0),
      };
      rootGroup.add(rtgGroup);
      componentsMap.set("rtg-boom", rtgGroup);

      // 4. Magnetometer 13-Meter Lattice Boom
      const magGroup = new THREE.Group();
      const magBoomGeo = new THREE.CylinderGeometry(0.02, 0.02, 3.8, 8);
      const magBoom = new THREE.Mesh(magBoomGeo, metalMat);
      magBoom.rotation.z = -Math.PI / 3;
      magBoom.position.set(1.6, -0.8, 0.5);
      magGroup.add(magBoom);

      // Magnetometer canister at tip
      const magSensorGeo = new THREE.BoxGeometry(0.15, 0.15, 0.2);
      const magSensor = new THREE.Mesh(magSensorGeo, goldFoilMat);
      magSensor.position.set(3.2, -1.8, 0.5);
      magGroup.add(magSensor);
      magGroup.userData = {
        origPos: new THREE.Vector3(0, 0, 0),
        explodeDir: new THREE.Vector3(1.2, -0.5, 0),
      };
      rootGroup.add(magGroup);
      componentsMap.set("magnetometer-boom", magGroup);

      // 5. The Golden Record mounted on the bus
      const recordGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.02, 32);
      const recordMesh = new THREE.Mesh(recordGeo, goldFoilMat);
      recordMesh.rotation.x = Math.PI / 2;
      recordMesh.position.set(0, -0.1, 0.86);
      recordMesh.userData = {
        origPos: new THREE.Vector3(0, -0.1, 0.86),
        explodeDir: new THREE.Vector3(0, 0, 1),
      };
      rootGroup.add(recordMesh);
      componentsMap.set("golden-record", recordMesh);
      break;
    }

    case "jwst": {
      // 1. 18 Hexagonal Gold Primary Mirror Segments
      const mirrorGroup = new THREE.Group();
      const hexRadius = 0.28;
      // Arranged in 3 concentric rings (procedural coordinates)
      const mirrorPositions: [number, number][] = [
        // Ring 1 (6 mirrors)
        [0, 0.5],
        [0.433, 0.25],
        [0.433, -0.25],
        [0, -0.5],
        [-0.433, -0.25],
        [-0.433, 0.25],
        // Ring 2 (12 mirrors)
        [0, 1.0],
        [0.433, 0.75],
        [0.866, 0.5],
        [0.866, 0],
        [0.866, -0.5],
        [0.433, -0.75],
        [0, -1.0],
        [-0.433, -0.75],
        [-0.866, -0.5],
        [-0.866, 0],
        [-0.866, 0.5],
        [-0.433, 0.75],
      ];

      mirrorPositions.forEach(([x, y]) => {
        const hexGeo = new THREE.CylinderGeometry(hexRadius, hexRadius, 0.04, 6);
        const hexMesh = new THREE.Mesh(hexGeo, goldFoilMat);
        hexMesh.rotation.x = Math.PI / 2;
        hexMesh.position.set(x, y + 0.3, 0.25);
        mirrorGroup.add(hexMesh);
      });
      mirrorGroup.userData = {
        origPos: new THREE.Vector3(0, 0, 0),
        explodeDir: new THREE.Vector3(0, 0.5, 0.8),
      };
      rootGroup.add(mirrorGroup);
      componentsMap.set("hexagonal-mirrors", mirrorGroup);

      // 2. Secondary Mirror & Tripod Struts
      const secondaryGroup = new THREE.Group();
      const secMirrorGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.04, 24);
      const secMirror = new THREE.Mesh(secMirrorGeo, goldFoilMat);
      secMirror.rotation.x = Math.PI / 2;
      secMirror.position.set(0, 0.3, 1.6);
      secondaryGroup.add(secMirror);

      // 3 tripod struts
      const strutAngles = [Math.PI / 2, (7 * Math.PI) / 6, (11 * Math.PI) / 6];
      strutAngles.forEach((ang) => {
        const strutGeo = new THREE.CylinderGeometry(0.015, 0.015, 1.8, 8);
        const strut = new THREE.Mesh(strutGeo, darkMetalMat);
        strut.position.set(Math.cos(ang) * 0.4, 0.3 + Math.sin(ang) * 0.4, 0.9);
        strut.rotation.x = 0.55 * Math.sin(ang);
        strut.rotation.y = -0.55 * Math.cos(ang);
        secondaryGroup.add(strut);
      });
      secondaryGroup.userData = {
        origPos: new THREE.Vector3(0, 0, 0),
        explodeDir: new THREE.Vector3(0, 0, 1.5),
      };
      rootGroup.add(secondaryGroup);
      componentsMap.set("secondary-mirror-tripod", secondaryGroup);

      // 3. 5-Layer Kapton Sunshield (Curved Silver Membranes)
      const sunshieldGroup = new THREE.Group();
      for (let i = 0; i < 5; i++) {
        // Hexagonal stretched diamond shape
        const shieldGeo = new THREE.BoxGeometry(3.6 - i * 0.1, 0.01, 2.2 - i * 0.08);
        const shieldMesh = new THREE.Mesh(shieldGeo, kaptonSilverMat);
        shieldMesh.position.set(0, -0.6 - i * 0.08, 0);
        shieldMesh.rotation.y = Math.PI / 4;
        sunshieldGroup.add(shieldMesh);
      }
      sunshieldGroup.userData = {
        origPos: new THREE.Vector3(0, 0, 0),
        explodeDir: new THREE.Vector3(0, -0.8, 0),
      };
      rootGroup.add(sunshieldGroup);
      componentsMap.set("kapton-sunshield", sunshieldGroup);

      // 4. Spacecraft Bus & MIRI Cryocooler
      const busGroup = new THREE.Group();
      const busBody = new THREE.BoxGeometry(0.8, 0.5, 0.8);
      const busMesh = new THREE.Mesh(busBody, darkMetalMat);
      busMesh.position.set(0, -1.2, 0);
      busGroup.add(busMesh);

      // Solar array panel
      const solarPanel = new THREE.BoxGeometry(1.2, 0.02, 0.4);
      const solarMesh = new THREE.Mesh(solarPanel, solarCellMat);
      solarMesh.position.set(0, -1.4, 0.6);
      solarMesh.rotation.x = 0.4;
      busGroup.add(solarMesh);
      busGroup.userData = {
        origPos: new THREE.Vector3(0, 0, 0),
        explodeDir: new THREE.Vector3(0, -1.2, 0),
      };
      rootGroup.add(busGroup);
      componentsMap.set("miri-cryocooler", busGroup);
      break;
    }

    case "iss": {
      // 1. Central Integrated Truss Structure
      const trussGroup = new THREE.Group();
      const trussGeo = new THREE.CylinderGeometry(0.12, 0.12, 5.0, 8);
      const trussMesh = new THREE.Mesh(trussGeo, metalMat);
      trussMesh.rotation.z = Math.PI / 2;
      trussGroup.add(trussMesh);
      trussGroup.userData = {
        origPos: new THREE.Vector3(0, 0, 0),
        explodeDir: new THREE.Vector3(0, 0, 0),
      };
      rootGroup.add(trussGroup);
      componentsMap.set("integrated-truss", trussGroup);

      // 2. 8 Massive Solar Array Wings (Twin wings on port & starboard)
      const solarWingsGroup = new THREE.Group();
      [-2.1, 2.1].forEach((tx) => {
        [-0.8, 0.8].forEach((tz) => {
          const wingGeo = new THREE.BoxGeometry(0.6, 0.02, 1.8);
          const wingMesh = new THREE.Mesh(wingGeo, solarCellMat);
          wingMesh.position.set(tx, 0, tz);
          solarWingsGroup.add(wingMesh);
        });
      });
      solarWingsGroup.userData = {
        origPos: new THREE.Vector3(0, 0, 0),
        explodeDir: new THREE.Vector3(0, 0.8, 0),
      };
      rootGroup.add(solarWingsGroup);
      componentsMap.set("solar-wings", solarWingsGroup);

      // 3. Pressurized Habitat & Science Lab Modules (Destiny, Unity, Zvezda)
      const labGroup = new THREE.Group();
      // Main central stack
      const mod1 = new THREE.CylinderGeometry(0.3, 0.3, 1.4, 16);
      const mesh1 = new THREE.Mesh(mod1, whiteThermalMat);
      mesh1.position.set(0, -0.3, 0);
      labGroup.add(mesh1);

      // Columbus / Kibo transverse labs
      const mod2 = new THREE.CylinderGeometry(0.28, 0.28, 1.0, 16);
      const mesh2 = new THREE.Mesh(mod2, whiteThermalMat);
      mesh2.rotation.z = Math.PI / 2;
      mesh2.position.set(0, -0.3, 0.4);
      labGroup.add(mesh2);
      labGroup.userData = {
        origPos: new THREE.Vector3(0, 0, 0),
        explodeDir: new THREE.Vector3(0, -0.6, 0),
      };
      rootGroup.add(labGroup);
      componentsMap.set("laboratory-modules", labGroup);

      // 4. Cupola Observation Dome
      const cupolaGeo = new THREE.SphereGeometry(0.18, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
      const cupolaMesh = new THREE.Mesh(cupolaGeo, darkMetalMat);
      cupolaMesh.position.set(0, -0.9, 0.2);
      cupolaMesh.userData = {
        origPos: new THREE.Vector3(0, -0.9, 0.2),
        explodeDir: new THREE.Vector3(0, -1.0, 0),
      };
      rootGroup.add(cupolaMesh);
      componentsMap.set("cupola", cupolaMesh);
      break;
    }

    case "curiosity":
    case "perseverance": {
      // 1. Chassis Body
      const chassisGroup = new THREE.Group();
      const body = new THREE.BoxGeometry(1.6, 0.7, 1.1);
      const bodyMesh = new THREE.Mesh(body, whiteThermalMat);
      chassisGroup.add(bodyMesh);

      // Top solar/equipment deck
      const deck = new THREE.BoxGeometry(1.4, 0.05, 0.9);
      const deckMesh = new THREE.Mesh(deck, darkMetalMat);
      deckMesh.position.y = 0.38;
      chassisGroup.add(deckMesh);
      chassisGroup.userData = {
        origPos: new THREE.Vector3(0, 0, 0),
        explodeDir: new THREE.Vector3(0, 0.5, 0),
      };
      rootGroup.add(chassisGroup);
      componentsMap.set("sample-caching-system", chassisGroup);

      // 2. Rocker-Bogie 6-Wheel Suspension
      const wheelsGroup = new THREE.Group();
      const wheelOffsets = [
        [-0.9, -0.6, -0.75],
        [0, -0.6, -0.85],
        [0.9, -0.6, -0.75],
        [-0.9, -0.6, 0.75],
        [0, -0.6, 0.85],
        [0.9, -0.6, 0.75],
      ];
      wheelOffsets.forEach(([x, y, z]) => {
        const wGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.2, 16);
        const wMesh = new THREE.Mesh(wGeo, darkMetalMat);
        wMesh.rotation.x = Math.PI / 2;
        wMesh.position.set(x, y, z);
        wheelsGroup.add(wMesh);

        // Bogie strut
        const strutGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.6, 8);
        const strut = new THREE.Mesh(strutGeo, metalMat);
        strut.position.set(x, y + 0.3, z * 0.8);
        wheelsGroup.add(strut);
      });
      wheelsGroup.userData = {
        origPos: new THREE.Vector3(0, 0, 0),
        explodeDir: new THREE.Vector3(0, -0.6, 0),
      };
      rootGroup.add(wheelsGroup);
      componentsMap.set("rocker-bogie", wheelsGroup);

      // 3. Remote Sensing Mast (Mastcam & SuperCam Laser)
      const mastGroup = new THREE.Group();
      const mastPole = new THREE.CylinderGeometry(0.04, 0.04, 1.1, 8);
      const mastMesh = new THREE.Mesh(mastPole, metalMat);
      mastMesh.position.set(0.6, 0.9, 0.3);
      mastGroup.add(mastMesh);

      // Mast camera head
      const camHead = new THREE.BoxGeometry(0.35, 0.2, 0.25);
      const camMesh = new THREE.Mesh(camHead, whiteThermalMat);
      camMesh.position.set(0.6, 1.45, 0.3);
      mastGroup.add(camMesh);

      // Dual camera apertures
      [-0.08, 0.08].forEach((cx) => {
        const lens = new THREE.CylinderGeometry(0.04, 0.04, 0.06, 12);
        const lensMesh = new THREE.Mesh(lens, darkMetalMat);
        lensMesh.rotation.z = Math.PI / 2;
        lensMesh.position.set(0.75, 1.45, 0.3 + cx);
        mastGroup.add(lensMesh);
      });
      mastGroup.userData = {
        origPos: new THREE.Vector3(0, 0, 0),
        explodeDir: new THREE.Vector3(0, 0.8, 0),
      };
      rootGroup.add(mastGroup);
      componentsMap.set("remote-sensing-mast", mastGroup);

      // 4. Robotic Arm & Drill Turret
      const armGroup = new THREE.Group();
      const arm1 = new THREE.CylinderGeometry(0.04, 0.04, 0.8, 8);
      const armMesh1 = new THREE.Mesh(arm1, metalMat);
      armMesh1.position.set(0.8, 0.2, -0.4);
      armMesh1.rotation.z = 0.6;
      armGroup.add(armMesh1);

      const turret = new THREE.CylinderGeometry(0.18, 0.18, 0.3, 16);
      const turretMesh = new THREE.Mesh(turret, darkMetalMat);
      turretMesh.position.set(1.3, -0.2, -0.4);
      turretMesh.rotation.x = Math.PI / 2;
      armGroup.add(turretMesh);
      armGroup.userData = {
        origPos: new THREE.Vector3(0, 0, 0),
        explodeDir: new THREE.Vector3(0.8, 0, -0.5),
      };
      rootGroup.add(armGroup);
      componentsMap.set("robotic-arm", armGroup);
      componentsMap.set("pixl-sherloc-turret", armGroup);

      // 5. Rear MMRTG Nuclear Power Generator
      const mmrtgGroup = new THREE.Group();
      const rtgBody = new THREE.CylinderGeometry(0.25, 0.25, 0.65, 16);
      const rtgMesh = new THREE.Mesh(rtgBody, darkMetalMat);
      rtgMesh.rotation.z = Math.PI / 2;
      rtgMesh.position.set(-1.0, 0.2, 0);
      mmrtgGroup.add(rtgMesh);

      // Cooling fins
      const fin = new THREE.BoxGeometry(0.7, 0.35, 0.02);
      const finMesh = new THREE.Mesh(fin, metalMat);
      finMesh.position.set(-1.0, 0.2, 0);
      mmrtgGroup.add(finMesh);
      mmrtgGroup.userData = {
        origPos: new THREE.Vector3(0, 0, 0),
        explodeDir: new THREE.Vector3(-0.9, 0, 0),
      };
      rootGroup.add(mmrtgGroup);
      componentsMap.set("mmrtg-nuclear", mmrtgGroup);
      componentsMap.set("moxie-oxygen-generator", mmrtgGroup);
      break;
    }

    case "aditya-l1": {
      // 1. Spacecraft Main Body
      const busGroup = new THREE.Group();
      const busGeo = new THREE.BoxGeometry(1.2, 1.4, 1.2);
      const busMesh = new THREE.Mesh(busGeo, goldFoilMat);
      busGroup.add(busMesh);
      busGroup.userData = {
        origPos: new THREE.Vector3(0, 0, 0),
        explodeDir: new THREE.Vector3(0, 0, 0),
      };
      rootGroup.add(busGroup);

      // 2. VELC Solar Coronagraph Aperture (Sun-facing)
      const velcGroup = new THREE.Group();
      const tubeGeo = new THREE.CylinderGeometry(0.3, 0.35, 0.6, 24);
      const tubeMesh = new THREE.Mesh(tubeGeo, darkMetalMat);
      tubeMesh.rotation.x = Math.PI / 2;
      tubeMesh.position.set(0, 0.3, 0.7);
      velcGroup.add(tubeMesh);
      velcGroup.userData = {
        origPos: new THREE.Vector3(0, 0, 0),
        explodeDir: new THREE.Vector3(0, 0, 0.8),
      };
      rootGroup.add(velcGroup);
      componentsMap.set("velc-coronagraph", velcGroup);

      // 3. SUIT UV Telescope
      const suitGroup = new THREE.Group();
      const suitGeo = new THREE.BoxGeometry(0.3, 0.3, 0.4);
      const suitMesh = new THREE.Mesh(suitGeo, whiteThermalMat);
      suitMesh.position.set(-0.35, -0.3, 0.65);
      suitGroup.add(suitMesh);
      suitGroup.userData = {
        origPos: new THREE.Vector3(0, 0, 0),
        explodeDir: new THREE.Vector3(-0.5, 0, 0.8),
      };
      rootGroup.add(suitGroup);
      componentsMap.set("suit-telescope", suitGroup);

      // 4. Deployable Solar Panels (Twin Wings)
      const solarGroup = new THREE.Group();
      [-1.4, 1.4].forEach((sx) => {
        const panGeo = new THREE.BoxGeometry(1.2, 0.8, 0.02);
        const panMesh = new THREE.Mesh(panGeo, solarCellMat);
        panMesh.position.set(sx, 0, 0);
        solarGroup.add(panMesh);
      });
      solarGroup.userData = {
        origPos: new THREE.Vector3(0, 0, 0),
        explodeDir: new THREE.Vector3(0, 0.8, 0),
      };
      rootGroup.add(solarGroup);
      componentsMap.set("solar-panels-aditya", solarGroup);

      // 5. 6-Meter Magnetometer Boom
      const magBoomGroup = new THREE.Group();
      const boomGeo = new THREE.CylinderGeometry(0.02, 0.02, 2.5, 8);
      const boomMesh = new THREE.Mesh(boomGeo, metalMat);
      boomMesh.position.set(0, -1.8, -0.4);
      magBoomGroup.add(boomMesh);
      magBoomGroup.userData = {
        origPos: new THREE.Vector3(0, 0, 0),
        explodeDir: new THREE.Vector3(0, -1.0, 0),
      };
      rootGroup.add(magBoomGroup);
      componentsMap.set("magnetometer-boom-aditya", magBoomGroup);
      break;
    }

    default: {
      // Fallback: Apollo LM / general explorer
      const baseGeo = new THREE.CylinderGeometry(0.9, 1.1, 0.9, 8);
      const baseMesh = new THREE.Mesh(baseGeo, goldFoilMat);
      rootGroup.add(baseMesh);

      const topGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
      const topMesh = new THREE.Mesh(topGeo, metalMat);
      topMesh.position.y = 0.85;
      rootGroup.add(topMesh);
      break;
    }
  }
}

// ==========================================
// COMPONENT 2: SOLAR SYSTEM MISSION MAP
// ==========================================
const SolarSystemMissionMap: React.FC<{ onSelectCraft: (id: string) => void }> = ({
  onSelectCraft,
}) => {
  const [selectedDestination, setSelectedDestination] = useState<string>("All");
  const [yearFilter, setYearFilter] = useState<number>(2026);
  const [highlightedWaypoint, setHighlightedWaypoint] = useState<string | null>(null);

  const filteredWaypoints = useMemo(() => {
    return SOLAR_SYSTEM_WAYPOINTS.filter((wp) => {
      if (wp.year > yearFilter) return false;
      if (selectedDestination !== "All") {
        if (selectedDestination === "LEO" && wp.body !== "Earth") return false;
        if (selectedDestination === "Moon" && wp.body !== "Moon") return false;
        if (selectedDestination === "Mars" && wp.body !== "Mars") return false;
        if (
          selectedDestination === "Outer" &&
          !["Jupiter", "Saturn", "Uranus", "Neptune", "Pluto", "Interstellar"].includes(wp.body)
        )
          return false;
        if (selectedDestination === "Lagrange" && !["L1", "L2"].includes(wp.body)) return false;
      }
      return true;
    });
  }, [yearFilter, selectedDestination]);

  return (
    <div className="space-y-4">
      {/* Controls & Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 font-mono">
            Filter Timeline (1957 – {yearFilter}):
          </label>
          <input
            type="range"
            min="1957"
            max="2026"
            value={yearFilter}
            onChange={(e) => setYearFilter(parseInt(e.target.value))}
            className="w-36 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {["All", "LEO", "Moon", "Mars", "Outer", "Lagrange"].map((dest) => (
            <button
              key={dest}
              onClick={() => setSelectedDestination(dest)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedDestination === dest
                  ? "bg-blue-600 text-white font-semibold"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {dest === "Outer" ? "Outer Planets" : dest === "Lagrange" ? "Lagrange L1/L2" : dest}
            </button>
          ))}
        </div>
      </div>

      {/* 2D Concentric Solar System Flight Path Canvas Map */}
      <div className="relative w-full h-[460px] rounded-xl overflow-hidden border border-slate-800 bg-[#04060d] p-4 flex items-center justify-center">
        {/* Planetary orbits SVG */}
        <svg className="w-full h-full max-w-[580px] max-h-[440px]" viewBox="-240 -240 480 480">
          <defs>
            <radialGradient id="sun-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffedd5" />
              <stop offset="40%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Central Sun */}
          <circle cx="0" cy="0" r="16" fill="url(#sun-glow)" />
          <circle cx="0" cy="0" r="7" fill="#fbbf24" />

          {/* Planetary Orbital Rings (logarithmic scale) */}
          {[
            { name: "Mercury", r: 35, color: "#94a3b8" },
            { name: "Venus", r: 52, color: "#fcd34d" },
            { name: "Earth & Moon", r: 76, color: "#38bdf8" },
            { name: "Mars", r: 104, color: "#f87171" },
            { name: "Jupiter", r: 150, color: "#fb923c" },
            { name: "Saturn", r: 185, color: "#e2e8f0" },
            { name: "Interstellar Horizon", r: 228, color: "#a855f7", dashed: true },
          ].map((orbit, idx) => (
            <g key={idx}>
              <circle
                cx="0"
                cy="0"
                r={orbit.r}
                fill="none"
                stroke={orbit.color}
                strokeWidth={orbit.dashed ? "1" : "0.75"}
                strokeDasharray={orbit.dashed ? "3 3" : undefined}
                opacity={0.35}
              />
              <text
                x="4"
                y={-orbit.r + 3}
                fill={orbit.color}
                fontSize="6"
                fontFamily="monospace"
                opacity={0.6}
              >
                {orbit.name}
              </text>
            </g>
          ))}

          {/* Earth-Moon & Lagrange points zoomed indicator */}
          <circle cx="76" cy="0" r="3" fill="#38bdf8" />
          {/* L1 & L2 markers */}
          <circle cx="71" cy="0" r="1.5" fill="#f59e0b" />
          <circle cx="81" cy="0" r="1.5" fill="#ec4899" />

          {/* Mission Waypoint Dots on Orbit */}
          {filteredWaypoints.map((wp) => {
            // Map body to radial distance
            let rad = 76;
            if (wp.body === "Earth") rad = 76;
            else if (wp.body === "Moon") rad = 82;
            else if (wp.body === "L1") rad = 71;
            else if (wp.body === "L2") rad = 81;
            else if (wp.body === "Mars") rad = 104;
            else if (wp.body === "Jupiter") rad = 150;
            else if (wp.body === "Saturn") rad = 185;
            else if (wp.body === "Interstellar") rad = 228;

            const radAngle = (wp.orbitalAngleDeg * Math.PI) / 180;
            const px = rad * Math.cos(radAngle);
            const py = rad * Math.sin(radAngle);
            const isHovered = highlightedWaypoint === wp.id;

            return (
              <g
                key={wp.id}
                className="cursor-pointer transition-all"
                onMouseEnter={() => setHighlightedWaypoint(wp.id)}
                onMouseLeave={() => setHighlightedWaypoint(null)}
                onClick={() => onSelectCraft(wp.spacecraftId)}
              >
                {isHovered && (
                  <circle
                    cx={px}
                    cy={py}
                    r="9"
                    fill="none"
                    stroke="#60a5fa"
                    strokeWidth="1.5"
                    opacity={0.8}
                  />
                )}
                <circle
                  cx={px}
                  cy={py}
                  r={isHovered ? 4.5 : 3}
                  fill={
                    wp.isFlybyOrOrbiter === "Landing"
                      ? "#ef4444"
                      : wp.isFlybyOrOrbiter === "Stationary Halo"
                        ? "#f59e0b"
                        : wp.isFlybyOrOrbiter === "Escape"
                          ? "#a855f7"
                          : "#3b82f6"
                  }
                />
                <text
                  x={px + 5}
                  y={py + 3}
                  fill="#ffffff"
                  fontSize={isHovered ? "7" : "5.5"}
                  fontWeight={isHovered ? "bold" : "normal"}
                  fontFamily="sans-serif"
                >
                  {wp.spacecraftName} ({wp.year})
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Waypoint Detail Card */}
        {highlightedWaypoint && (
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-md bg-slate-900/95 border border-blue-500/50 rounded-xl p-3 shadow-2xl backdrop-blur-md">
            {(() => {
              const wp = SOLAR_SYSTEM_WAYPOINTS.find((w) => w.id === highlightedWaypoint);
              if (!wp) return null;
              return (
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-blue-400 font-bold uppercase">
                      {wp.year} • {wp.body} ({wp.isFlybyOrOrbiter})
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{wp.distanceAU} AU</span>
                  </div>
                  <h4 className="text-xs font-bold text-white mt-0.5">{wp.spacecraftName}</h4>
                  <p className="text-[11px] text-slate-300 mt-1 leading-snug">{wp.event}</p>
                  <Button
                    size="sm"
                    onClick={() => onSelectCraft(wp.spacecraftId)}
                    className="mt-2 text-[10px] h-6 px-2 bg-blue-600 hover:bg-blue-500 text-white"
                  >
                    View 3D Spacecraft Model
                    <ChevronRight className="size-3 ml-1" />
                  </Button>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Trajectory scientific disclaimer */}
      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200">
        <Info className="size-4 shrink-0 text-amber-400" />
        <span>
          <strong>Scientific Note:</strong> Displayed spacecraft routes and orbital radii are
          simplified pedagogical concentric projections. Real interplanetary navigation requires
          precise numerical N-body gravitational integration, mid-course trajectory corrections, and
          non-Keplerian perturbations.
        </span>
      </div>
    </div>
  );
};

// ==========================================
// COMPONENT 3: GRAVITY ASSIST SIMULATOR
// ==========================================
const GravityAssistSimulator: React.FC<{ onInteract?: () => void }> = ({ onInteract }) => {
  const [selectedPlanet, setSelectedPlanet] = useState<"Jupiter" | "Venus" | "Earth">("Jupiter");
  const [flybyApproach, setFlybyApproach] = useState<"trailing" | "leading">("trailing"); // Trailing = accelerate, leading = decelerate
  const [vInfinity, setVInfinity] = useState<number>(12); // km/s
  const [periapsisAltitude, setPeriapsisAltitude] = useState<number>(350000); // km
  const [simPlaying, setSimPlaying] = useState<boolean>(true);
  const [simProgress, setSimProgress] = useState<number>(0);

  // Planet parameters
  const planetSpecs = {
    Jupiter: { orbitalSpeed: 13.07, massRatio: 317.8, radiusKm: 69911, color: "#f97316" },
    Venus: { orbitalSpeed: 35.02, massRatio: 0.815, radiusKm: 6052, color: "#facc15" },
    Earth: { orbitalSpeed: 29.78, massRatio: 1.0, radiusKm: 6371, color: "#38bdf8" },
  };

  const currentPlanet = planetSpecs[selectedPlanet];

  // Deflection angle delta = 2 * arcsin(1 / (1 + r_p * v_inf^2 / mu))
  const deflectionAngleDeg = useMemo(() => {
    const mu = currentPlanet.massRatio * 398600; // km^3 / s^2 approx
    const rp = currentPlanet.radiusKm + periapsisAltitude;
    const denom = 1 + (rp * vInfinity * vInfinity) / mu;
    const sinHalfDelta = 1 / Math.max(1.001, denom);
    const deltaRad = 2 * Math.asin(Math.min(1, sinHalfDelta));
    return Math.round((deltaRad * 180) / Math.PI);
  }, [currentPlanet, periapsisAltitude, vInfinity]);

  // Heliocentric Delta-V boost: Delta-v approx 2 * V_planet * sin(delta / 2)
  const heliocentricDeltaV = useMemo(() => {
    const deltaRad = (deflectionAngleDeg * Math.PI) / 180;
    const factor = flybyApproach === "trailing" ? 1 : -1;
    const dv = factor * 2 * currentPlanet.orbitalSpeed * Math.sin(deltaRad / 2);
    return Math.round(dv * 10) / 10;
  }, [deflectionAngleDeg, flybyApproach, currentPlanet]);

  // Final heliocentric speed
  const finalHeliocentricSpeed = useMemo(() => {
    const baseHelio = 14;
    return Math.max(2, Math.round((baseHelio + heliocentricDeltaV) * 10) / 10);
  }, [heliocentricDeltaV]);

  // Animation tick
  useEffect(() => {
    if (!simPlaying) return;
    const interval = setInterval(() => {
      setSimProgress((prev) => (prev >= 1 ? 0 : prev + 0.015));
    }, 40);
    return () => clearInterval(interval);
  }, [simPlaying]);

  // Compute animated spacecraft position along hyperbolic curve
  const t = (simProgress - 0.5) * 2; // -1 to 1
  const craftX = t * 140;
  // Hyperbola formula y = -sqrt(1 + x^2 / a^2)
  const curveDirection = flybyApproach === "trailing" ? 1 : -1;
  const craftY = curveDirection * (40 / (1 + (t * 2) ** 2)) - (curveDirection > 0 ? 30 : -30);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Controls Column */}
        <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Zap className="size-3.5 text-yellow-400" />
            Slingshot Parameters
          </h4>

          {/* Planet Selector */}
          <div>
            <label className="text-[11px] text-slate-400">Target Planet:</label>
            <div className="grid grid-cols-3 gap-1 mt-1">
              {(["Jupiter", "Venus", "Earth"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setSelectedPlanet(p);
                    onInteract?.();
                  }}
                  className={`py-1 text-xs rounded-lg font-medium transition-all ${
                    selectedPlanet === p
                      ? "bg-blue-600 text-white font-bold"
                      : "bg-slate-800 text-slate-300 hover:text-white"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Geometry: Trailing (Boost) vs Leading (Brake) */}
          <div>
            <label className="text-[11px] text-slate-400">Flyby Geometry:</label>
            <div className="grid grid-cols-2 gap-1 mt-1">
              <button
                onClick={() => {
                  setFlybyApproach("trailing");
                  onInteract?.();
                }}
                className={`py-1 text-xs rounded-lg font-medium transition-all ${
                  flybyApproach === "trailing"
                    ? "bg-emerald-600 text-white font-bold"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                Trailing Edge (Boost +Δv)
              </button>
              <button
                onClick={() => {
                  setFlybyApproach("leading");
                  onInteract?.();
                }}
                className={`py-1 text-xs rounded-lg font-medium transition-all ${
                  flybyApproach === "leading"
                    ? "bg-rose-600 text-white font-bold"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                Leading Edge (Brake -Δv)
              </button>
            </div>
          </div>

          {/* Entry Speed v_infinity */}
          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>Approach Speed (v∞):</span>
              <span className="font-mono text-white">{vInfinity} km/s</span>
            </div>
            <input
              type="range"
              min="5"
              max="25"
              value={vInfinity}
              onChange={(e) => {
                setVInfinity(parseInt(e.target.value));
                onInteract?.();
              }}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Periapsis Altitude */}
          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>Flyby Altitude (Periapsis):</span>
              <span className="font-mono text-white">{periapsisAltitude.toLocaleString()} km</span>
            </div>
            <input
              type="range"
              min="500"
              max="800000"
              step="5000"
              value={periapsisAltitude}
              onChange={(e) => {
                setPeriapsisAltitude(parseInt(e.target.value));
                onInteract?.();
              }}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-800">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSimPlaying(!simPlaying)}
              className="text-xs h-7 bg-slate-800 text-slate-200"
            >
              {simPlaying ? "Pause Animation" : "Resume Trajectory"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSimProgress(0)}
              className="text-xs h-7 text-slate-400 hover:text-white"
            >
              <RotateCcw className="size-3 mr-1" />
              Reset
            </Button>
          </div>
        </div>

        {/* Hyperbolic Visualizer Column (2 spans) */}
        <div className="md:col-span-2 rounded-xl border border-slate-800 bg-[#050814] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <div className="text-xs font-mono text-slate-300">
              Reference Frame:{" "}
              <strong>Planetocentric Hyperbola vs Heliocentric Vector Addition</strong>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                flybyApproach === "trailing"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
              }`}
            >
              {flybyApproach === "trailing" ? "ENERGY BOOST (+Δv)" : "ORBITAL BRAKE (-Δv)"}
            </span>
          </div>

          {/* Canvas SVG trajectory */}
          <div className="relative w-full h-[240px] flex items-center justify-center overflow-hidden">
            <svg className="w-full h-full max-w-[500px]" viewBox="-160 -100 320 200">
              {/* Planet motion vector arrow */}
              <line
                x1="-80"
                y1="60"
                x2="-20"
                y2="60"
                stroke="#f59e0b"
                strokeWidth="2"
                markerEnd="url(#arrow)"
              />
              <text x="-80" y="75" fill="#f59e0b" fontSize="7" fontFamily="monospace">
                Planet Orbit Vector Vp = {currentPlanet.orbitalSpeed} km/s
              </text>

              {/* Central Planet */}
              <circle cx="0" cy="0" r="22" fill={currentPlanet.color} />
              <text
                x="0"
                y="3"
                fill="#ffffff"
                fontSize="7"
                fontWeight="bold"
                textAnchor="middle"
                fontFamily="sans-serif"
              >
                {selectedPlanet}
              </text>

              {/* Hyperbolic Trajectory Guide Path */}
              <path
                d={
                  flybyApproach === "trailing"
                    ? "M -140 -50 Q 0 -15 140 -60"
                    : "M -140 50 Q 0 15 140 60"
                }
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                opacity={0.6}
              />

              {/* Animated Spacecraft */}
              <circle cx={craftX} cy={craftY} r="5" fill="#60a5fa" />
              <circle
                cx={craftX}
                cy={craftY}
                r="8"
                fill="none"
                stroke="#93c5fd"
                strokeWidth="1"
                opacity={0.6}
              />
              <text
                x={craftX + 8}
                y={craftY + 3}
                fill="#ffffff"
                fontSize="7"
                fontFamily="monospace"
              >
                Probe
              </text>
            </svg>
          </div>

          {/* Physics Readouts */}
          <div className="grid grid-cols-3 gap-2 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-center font-mono text-xs">
            <div>
              <div className="text-[10px] text-slate-400">Deflection Angle (δ)</div>
              <div className="text-white font-bold">{deflectionAngleDeg}°</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">Heliocentric Δv Transfer</div>
              <div
                className={`font-bold ${heliocentricDeltaV >= 0 ? "text-emerald-400" : "text-rose-400"}`}
              >
                {heliocentricDeltaV >= 0 ? `+${heliocentricDeltaV}` : heliocentricDeltaV} km/s
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">Final Heliocentric Speed</div>
              <div className="text-blue-300 font-bold">{finalHeliocentricSpeed} km/s</div>
            </div>
          </div>
        </div>
      </div>

      {/* Case Study Callout */}
      <div className="p-3.5 rounded-xl border border-blue-500/30 bg-blue-950/20 space-y-1 text-xs text-slate-300">
        <div className="font-bold text-white flex items-center gap-1.5">
          <Sparkles className="size-4 text-blue-400" />
          The Voyager 2 Grand Tour (175-Year Planetary Alignment)
        </div>
        <p className="text-[11px] leading-relaxed">
          In 1977, Voyager 2 launched into an alignment of the outer gas giants that happens once
          every 175 years. By diving behind Jupiter, Saturn, and Uranus, Voyager 2 absorbed
          successive orbital angular momentum boosts, shaving nearly 20 years off its flight time to
          Neptune without burning any rocket fuel in deep space!
        </p>
      </div>
    </div>
  );
};

// ==========================================
// COMPONENT 4: PLAN A JOURNEY TO MARS CHALLENGE
// ==========================================
const MarsMissionPlanner: React.FC<{ onInteract?: () => void }> = ({ onInteract }) => {
  const [leadAngle, setLeadAngle] = useState<number>(44); // Optimal is ~44 deg
  const [tmiDeltaV, setTmiDeltaV] = useState<number>(3.8); // km/s (optimal 3.6 - 3.9)
  const [arrivalMode, setArrivalMode] = useState<"aerocapture" | "propulsive">("aerocapture");
  const [payloadMassTonnes, setPayloadMassTonnes] = useState<number>(5);

  // Evaluate mission feasibility
  const angleError = Math.abs(leadAngle - 44);
  const deltaVError = Math.abs(tmiDeltaV - 3.8);

  // Hohmann transfer calculations
  const transitDays = Math.round(259 + deltaVError * 25);
  const transitMonths = (transitDays / 30.4).toFixed(1);

  // Propellant budget required
  const arrivalDeltaV = arrivalMode === "propulsive" ? 2.1 : 0.0;
  const totalDeltaV = tmiDeltaV + arrivalDeltaV;

  // Feasibility score (0 - 100)
  const score = Math.max(
    0,
    Math.round(100 - angleError * 3 - deltaVError * 40 - (arrivalMode === "propulsive" ? 15 : 0)),
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Mission Configuration Form */}
        <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Target className="size-3.5 text-rose-400" />
            Mars Mission Architecture
          </h4>

          {/* 1. Earth-Mars Lead Angle */}
          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>Heliocentric Lead Angle:</span>
              <span
                className={`font-mono font-bold ${angleError <= 4 ? "text-emerald-400" : "text-amber-400"}`}
              >
                {leadAngle}° (Optimal: ~44°)
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="70"
              value={leadAngle}
              onChange={(e) => {
                setLeadAngle(parseInt(e.target.value));
                onInteract?.();
              }}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
            <p className="text-[10px] text-slate-500 mt-0.5">
              Mars must be ~44° ahead of Earth in heliocentric longitude at launch.
            </p>
          </div>

          {/* 2. Trans-Mars Injection Delta-V */}
          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>Trans-Mars Injection Δv:</span>
              <span
                className={`font-mono font-bold ${deltaVError <= 0.2 ? "text-emerald-400" : "text-amber-400"}`}
              >
                {tmiDeltaV} km/s (Optimal: ~3.8 km/s)
              </span>
            </div>
            <input
              type="range"
              min="2.5"
              max="5.5"
              step="0.1"
              value={tmiDeltaV}
              onChange={(e) => {
                setTmiDeltaV(parseFloat(e.target.value));
                onInteract?.();
              }}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* 3. Arrival Capture Strategy */}
          <div>
            <label className="text-[11px] text-slate-400">
              Atmospheric Entry vs Propulsive Capture:
            </label>
            <div className="grid grid-cols-2 gap-1 mt-1">
              <button
                onClick={() => {
                  setArrivalMode("aerocapture");
                  onInteract?.();
                }}
                className={`py-1.5 px-2 text-[11px] rounded-lg font-medium text-left transition-all border ${
                  arrivalMode === "aerocapture"
                    ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/50"
                    : "bg-slate-800/60 text-slate-400 border-slate-700"
                }`}
              >
                <div className="font-bold">Aerocapture / EDL</div>
                <div className="text-[9px] text-slate-400">Heat shield + parachute (Saves Δv)</div>
              </button>
              <button
                onClick={() => {
                  setArrivalMode("propulsive");
                  onInteract?.();
                }}
                className={`py-1.5 px-2 text-[11px] rounded-lg font-medium text-left transition-all border ${
                  arrivalMode === "propulsive"
                    ? "bg-rose-950/80 text-rose-300 border-rose-500/50"
                    : "bg-slate-800/60 text-slate-400 border-slate-700"
                }`}
              >
                <div className="font-bold">Propulsive Capture</div>
                <div className="text-[9px] text-slate-400">+2.1 km/s burn (Heavy fuel penalty)</div>
              </button>
            </div>
          </div>

          {/* 4. Payload Mass */}
          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>Scientific Payload Mass:</span>
              <span className="font-mono text-white">{payloadMassTonnes} tonnes</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              value={payloadMassTonnes}
              onChange={(e) => {
                setPayloadMassTonnes(parseInt(e.target.value));
                onInteract?.();
              }}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>
        </div>

        {/* Transfer Orbit Visualizer & Feasibility Verdict */}
        <div className="md:col-span-2 rounded-xl border border-slate-800 bg-[#050814] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-mono text-slate-300">
                Hohmann Transfer Ellipse Model
              </span>
              <span
                className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${
                  score >= 80
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : score >= 50
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                }`}
              >
                Mission Feasibility: {score}% (
                {score >= 80
                  ? "Optimal Transfer"
                  : score >= 50
                    ? "Marginal Feasibility"
                    : "Trajectory Failure"}
                )
              </span>
            </div>

            {/* Elliptical Transfer Diagram */}
            <div className="relative w-full h-[190px] flex items-center justify-center my-2">
              <svg className="w-full h-full max-w-[420px]" viewBox="-120 -80 240 160">
                {/* Sun */}
                <circle cx="-30" cy="0" r="8" fill="#fbbf24" />

                {/* Earth Orbit (1 AU) */}
                <circle
                  cx="-30"
                  cy="0"
                  r="45"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                  opacity={0.5}
                />
                <circle cx="15" cy="0" r="3.5" fill="#38bdf8" />
                <text x="18" y="10" fill="#38bdf8" fontSize="6" fontFamily="monospace">
                  Earth (Departure)
                </text>

                {/* Mars Orbit (1.52 AU) */}
                <circle
                  cx="-30"
                  cy="0"
                  r="68"
                  fill="none"
                  stroke="#f87171"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                  opacity={0.5}
                />
                <circle cx="-30" cy="68" r="3" fill="#f87171" />
                <text x="-25" y="76" fill="#f87171" fontSize="6" fontFamily="monospace">
                  Mars (Arrival)
                </text>

                {/* Semi-elliptical Transfer Arc */}
                <path
                  d="M 15 0 C 15 45, 10 68, -30 68"
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>

          {/* Mission Stats Breakdown */}
          <div className="grid grid-cols-3 gap-2 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-center font-mono text-xs">
            <div>
              <div className="text-[10px] text-slate-400">Transit Duration</div>
              <div className="text-white font-bold">
                {transitDays} days (~{transitMonths} mos)
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">Total Δv Budget</div>
              <div className="text-purple-300 font-bold">{totalDeltaV.toFixed(1)} km/s</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">Required Wet Launch Mass</div>
              <div className="text-blue-300 font-bold">
                ~{(payloadMassTonnes * (arrivalMode === "propulsive" ? 18 : 8.5)).toFixed(0)} tonnes
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// COMPONENT 5: DELTA-V & ROCKET EQUATION LAB
// ==========================================
const RocketEquationLab: React.FC<{ onInteract?: () => void }> = ({ onInteract }) => {
  const [engineType, setEngineType] = useState<string>("hydrolox");
  const [payloadMass, setPayloadMass] = useState<number>(3000); // kg
  const [dryStructuralFraction, setDryStructuralFraction] = useState<number>(0.08); // 8% of propellant
  const [propellantMass, setPropellantMass] = useState<number>(45000); // kg
  const [stagingMode, setStagingMode] = useState<"single" | "two_stage">("single");

  // Engines database with specific impulse (Isp)
  const engines = {
    solid: { name: "Solid Rocket Booster", isp: 265, exhaustVel: 2600, color: "#f97316" },
    kerolox: { name: "Kerosene / LOX (RP-1)", isp: 311, exhaustVel: 3050, color: "#eab308" },
    methalox: { name: "Methane / LOX (Raptor)", isp: 380, exhaustVel: 3720, color: "#3b82f6" },
    hydrolox: { name: "Hydrogen / LOX (RS-25)", isp: 450, exhaustVel: 4410, color: "#a855f7" },
    nuclear: { name: "Nuclear Thermal Propulsion", isp: 900, exhaustVel: 8820, color: "#10b981" },
    ion: { name: "Xenon Ion Hall Thruster", isp: 3000, exhaustVel: 29400, color: "#06b6d4" },
  };

  const selectedEngine = engines[engineType as keyof typeof engines] || engines.hydrolox;

  // Single stage calculation
  // m0 = payload + dry + propellant
  // mf = payload + dry
  const dryMass = propellantMass * dryStructuralFraction;
  const initialMassM0 = payloadMass + dryMass + propellantMass;
  const finalMassMf = payloadMass + dryMass;
  const massRatio = initialMassM0 / finalMassMf;

  // Tsiolkovsky rocket equation: Delta-v = Isp * g0 * ln(m0 / mf)
  const g0 = 9.80665;
  const deltaVSingle = Math.round(selectedEngine.isp * g0 * Math.log(massRatio));

  // Two-stage comparison (equal split of propellant)
  const deltaVTwoStage = Math.round(deltaVSingle * 1.34); // ~34% higher delta-v through dead mass shedding

  const effectiveDeltaV = stagingMode === "single" ? deltaVSingle : deltaVTwoStage;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Input Parameters */}
        <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Gauge className="size-3.5 text-blue-400" />
            Tsiolkovsky Parameters
          </h4>

          {/* Engine Selection */}
          <div>
            <label className="text-[11px] text-slate-400">Propulsion Engine:</label>
            <select
              value={engineType}
              onChange={(e) => {
                setEngineType(e.target.value);
                onInteract?.();
              }}
              className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200"
            >
              {Object.entries(engines).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.name} (Isp: {v.isp}s)
                </option>
              ))}
            </select>
          </div>

          {/* Staging Architecture */}
          <div>
            <label className="text-[11px] text-slate-400">Staging Architecture:</label>
            <div className="grid grid-cols-2 gap-1 mt-1">
              <button
                onClick={() => {
                  setStagingMode("single");
                  onInteract?.();
                }}
                className={`py-1 text-xs rounded-lg font-medium transition-all ${
                  stagingMode === "single"
                    ? "bg-blue-600 text-white font-bold"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                Single Stage (SSTO)
              </button>
              <button
                onClick={() => {
                  setStagingMode("two_stage");
                  onInteract?.();
                }}
                className={`py-1 text-xs rounded-lg font-medium transition-all ${
                  stagingMode === "two_stage"
                    ? "bg-purple-600 text-white font-bold"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                Two-Stage Stacking
              </button>
            </div>
          </div>

          {/* Propellant Mass */}
          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>Propellant Mass:</span>
              <span className="font-mono text-white">{propellantMass.toLocaleString()} kg</span>
            </div>
            <input
              type="range"
              min="5000"
              max="200000"
              step="5000"
              value={propellantMass}
              onChange={(e) => {
                setPropellantMass(parseInt(e.target.value));
                onInteract?.();
              }}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Payload Mass */}
          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>Payload Mass:</span>
              <span className="font-mono text-white">{payloadMass.toLocaleString()} kg</span>
            </div>
            <input
              type="range"
              min="500"
              max="20000"
              step="500"
              value={payloadMass}
              onChange={(e) => {
                setPayloadMass(parseInt(e.target.value));
                onInteract?.();
              }}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>
        </div>

        {/* Mathematical Output & Capability Check */}
        <div className="md:col-span-2 rounded-xl border border-slate-800 bg-[#050814] p-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-mono text-slate-300">Tsiolkovsky Rocket Formula</span>
              <span className="text-xs font-mono text-blue-400">Δv = Isp · g₀ · ln(m₀ / mf)</span>
            </div>

            {/* Primary Delta-V Result Gauge */}
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="text-xs font-mono text-slate-400 uppercase">
                  Calculated Total Δv
                </div>
                <div className="text-3xl font-black text-white font-mono mt-1">
                  {effectiveDeltaV.toLocaleString()}{" "}
                  <span className="text-sm font-normal text-slate-400">m/s</span>
                  <span className="text-sm font-normal text-blue-400 ml-2">
                    ({(effectiveDeltaV / 1000).toFixed(2)} km/s)
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Mass Ratio (m₀/mf): <strong className="text-white">{massRatio.toFixed(2)}</strong>{" "}
                  | Exhaust Velocity:{" "}
                  <strong className="text-blue-300">{selectedEngine.exhaustVel} m/s</strong>
                </div>
              </div>

              {/* Orbital Milestones Capability Meter */}
              <div className="w-full sm:w-64 space-y-1.5 text-xs font-mono">
                {[
                  { name: "Low Earth Orbit (LEO)", threshold: 9400 },
                  { name: "Geostationary Transfer (GTO)", threshold: 11800 },
                  { name: "Trans-Lunar Injection (TLI)", threshold: 12500 },
                  { name: "Mars Escape Trajectory", threshold: 13200 },
                ].map((tier, idx) => {
                  const achieved = effectiveDeltaV >= tier.threshold;
                  return (
                    <div key={idx} className="flex items-center justify-between text-[10px]">
                      <span className={achieved ? "text-emerald-400" : "text-slate-500"}>
                        {achieved ? "✓" : "✗"} {tier.name}
                      </span>
                      <span className="text-slate-500">{tier.threshold / 1000} km/s</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 leading-relaxed mt-3">
            <strong>The Tyranny of the Rocket Equation:</strong> Because delta-v scales with the
            natural logarithm of the mass ratio, a single-stage rocket must be over 90% fuel by mass
            just to reach orbit. Dropping empty tanks (staging) resets the mass fraction, which is
            why Saturn V, Falcon 9, and LVM3 use multi-stage rockets.
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// COMPONENT 6: DISTANCE COMPARATOR & RADIO LATENCY
// ==========================================
const DistanceComparator: React.FC<{ onInteract?: () => void }> = ({ onInteract }) => {
  const [selectedDestinationIndex, setSelectedDestinationIndex] = useState<number>(2);

  const scaleDestinations = [
    {
      name: "International Space Station",
      altitudeKm: 418,
      category: "Low Earth Orbit",
      context: "Humans in space",
    },
    {
      name: "Geostationary Satellites",
      altitudeKm: 35786,
      category: "GEO",
      context: "Weather & communications",
    },
    {
      name: "The Moon (Apollo 11 & Chandrayaan-3)",
      altitudeKm: 384400,
      category: "Cislunar Space",
      context: "First human landing & polar rovers",
    },
    {
      name: "Sun-Earth L1 & L2 (Aditya-L1 / JWST)",
      altitudeKm: 1500000,
      category: "Lagrange Halo Orbits",
      context: "Solar weather & deep infrared",
    },
    {
      name: "Mars (Closest Approach)",
      altitudeKm: 54600000,
      category: "Inner Planets",
      context: "Rovers & sample caching",
    },
    {
      name: "Jupiter (Europa & Io)",
      altitudeKm: 588000000,
      category: "Gas Giants",
      context: "Subsurface oceans & active volcanoes",
    },
    {
      name: "Saturn & Titan (Cassini-Huygens)",
      altitudeKm: 1400000000,
      category: "Ringed Giant",
      context: "Methane lakes & water geysers",
    },
    {
      name: "Voyager 1 (Interstellar Medium)",
      altitudeKm: 24500000000,
      category: "Interstellar Space",
      context: "Farthest human object (>163 AU)",
    },
  ];

  const currentDest = scaleDestinations[selectedDestinationIndex];
  const c = 299792.458; // km/s speed of light
  const oneWaySeconds = currentDest.altitudeKm / c;
  const roundTripSeconds = oneWaySeconds * 2;

  // Format latency nicely
  const formatTime = (sec: number) => {
    if (sec < 1) return `${(sec * 1000).toFixed(1)} milliseconds`;
    if (sec < 60) return `${sec.toFixed(2)} seconds`;
    if (sec < 3600) return `${(sec / 60).toFixed(1)} minutes`;
    return `${(sec / 3600).toFixed(2)} hours`;
  };

  return (
    <div className="space-y-4">
      {/* Slider selector */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">Explore Distance from Earth:</span>
          <span className="text-blue-400 font-bold">{currentDest.name}</span>
        </div>
        <input
          type="range"
          min="0"
          max={scaleDestinations.length - 1}
          value={selectedDestinationIndex}
          onChange={(e) => {
            setSelectedDestinationIndex(parseInt(e.target.value));
            onInteract?.();
          }}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
          <span>LEO (400 km)</span>
          <span>Moon (384k km)</span>
          <span>Mars</span>
          <span>Jupiter</span>
          <span>Voyager 1 (24.5B km)</span>
        </div>
      </div>

      {/* Speed of Light & Radio Latency Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-center">
          <div className="text-[10px] font-mono uppercase text-slate-400">Physical Distance</div>
          <div className="text-xl font-bold text-white font-mono mt-1">
            {currentDest.altitudeKm.toLocaleString()}{" "}
            <span className="text-xs font-normal text-slate-400">km</span>
          </div>
          <div className="text-[11px] text-blue-300 font-mono mt-1">
            {(currentDest.altitudeKm / 149597870.7).toFixed(
              currentDest.altitudeKm > 10000000 ? 2 : 4,
            )}{" "}
            AU
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-center">
          <div className="text-[10px] font-mono uppercase text-slate-400">
            One-Way Radio Latency
          </div>
          <div className="text-xl font-bold text-emerald-400 font-mono mt-1">
            {formatTime(oneWaySeconds)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Speed of light c = 299,792 km/s</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-center">
          <div className="text-[10px] font-mono uppercase text-slate-400">
            Round-Trip Command Delay
          </div>
          <div className="text-xl font-bold text-purple-400 font-mono mt-1">
            {formatTime(roundTripSeconds)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Send command + receive confirmation</div>
        </div>
      </div>

      <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/40 flex items-start gap-2.5 text-xs text-slate-300">
        <Radio className="size-4 shrink-0 text-blue-400 mt-0.5" />
        <div>
          <strong>Why Autonomous Robotics is Required for Deep Space:</strong> When controllers on
          Earth send a command to the Perseverance rover on Mars, it takes up to 22 minutes to
          arrive and another 22 minutes for the reply to return. During a landing or obstacle
          encounter, probes cannot be driven with joysticks; they must make split-second decisions
          using autonomous computer vision and onboard AI!
        </div>
      </div>
    </div>
  );
};
