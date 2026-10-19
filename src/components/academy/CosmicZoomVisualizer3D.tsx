import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import { COSMIC_ZOOM_LAYERS, ZoomLayer } from "@/lib/academy/lessons/module-01-our-place";
import { Cosmos3DAdapter } from "@/lib/cosmos/Cosmos3DAdapter";
import { VisualizationActionController } from "@/lib/cosmos/VisualizationActionController";
import {
  ZoomIn,
  ZoomOut,
  Crosshair,
  Play,
  Pause,
  ChevronRight,
  ChevronLeft,
  Info,
  Sparkles,
  Maximize2,
  Sliders,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// 3D Scene Layers Renderer
function CosmicScene({
  layerIndex,
  locateEarthActive,
  onSelectObjectId,
}: {
  layerIndex: number;
  locateEarthActive: boolean;
  onSelectObjectId: (id: string) => void;
}) {
  const earthMeshRef = useRef<THREE.Mesh>(null);
  const moonMeshRef = useRef<THREE.Mesh>(null);
  const solarGroupRef = useRef<THREE.Group>(null);
  const milkyWayPointsRef = useRef<THREE.Points>(null);
  const cosmicWebPointsRef = useRef<THREE.Points>(null);

  // Rotate planets and galaxies smoothly
  useFrame((_, delta) => {
    if (earthMeshRef.current) earthMeshRef.current.rotation.y += delta * 0.25;
    if (moonMeshRef.current) moonMeshRef.current.rotation.y += delta * 0.15;
    if (solarGroupRef.current) solarGroupRef.current.rotation.y += delta * 0.05;
    if (milkyWayPointsRef.current) milkyWayPointsRef.current.rotation.y += delta * 0.04;
    if (cosmicWebPointsRef.current) cosmicWebPointsRef.current.rotation.y += delta * 0.02;
  });

  // Procedural Milky Way particle buffer
  const [mwPositions, mwColors] = React.useMemo(() => {
    const count = 3000;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const coreCol = new THREE.Color("#fef08a");
    const armCol = new THREE.Color("#38bdf8");

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = Math.random() * 4.5;
      const spinAngle = radius * 3.5;
      const branchAngle = ((i % 2) * (Math.PI * 2)) / 2;
      const randomX = (Math.random() - 0.5) * 0.35 * (radius + 0.5);
      const randomY = (Math.random() - 0.5) * 0.2 * (4.8 - radius);
      const randomZ = (Math.random() - 0.5) * 0.35 * (radius + 0.5);

      pos[i3] = Math.cos(spinAngle + branchAngle) * radius + randomX;
      pos[i3 + 1] = randomY;
      pos[i3 + 2] = Math.sin(spinAngle + branchAngle) * radius + randomZ;

      const mixed = coreCol.clone().lerp(armCol, radius / 4.5);
      col[i3] = mixed.r;
      col[i3 + 1] = mixed.g;
      col[i3 + 2] = mixed.b;
    }
    return [pos, col];
  }, []);

  // Procedural Cosmic Web particle filaments
  const [webPositions, webColors] = React.useMemo(() => {
    const count = 4000;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const galaxyCol = new THREE.Color("#f43f5e");
    const filamentCol = new THREE.Color("#818cf8");

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(Math.random()) * 6.0;

      // Filament clustering modulation
      const filament = Math.sin(theta * 4) * Math.cos(phi * 4);
      const dist = r * (0.8 + 0.3 * filament);

      pos[i3] = dist * Math.sin(phi) * Math.cos(theta);
      pos[i3 + 1] = dist * Math.sin(phi) * Math.sin(theta);
      pos[i3 + 2] = dist * Math.cos(phi);

      const mixed = filamentCol.clone().lerp(galaxyCol, Math.random());
      col[i3] = mixed.r;
      col[i3 + 1] = mixed.g;
      col[i3 + 2] = mixed.b;
    }
    return [pos, col];
  }, []);

  return (
    <group>
      {/* ================= LAYER 0: EARTH ================= */}
      <group visible={layerIndex === 0}>
        {/* Earth Body */}
        <mesh
          ref={earthMeshRef}
          onClick={(e) => {
            if (layerIndex !== 0) return;
            e.stopPropagation();
            onSelectObjectId("earth_body");
          }}
        >
          <sphereGeometry args={[1.5, 48, 48]} />
          <meshStandardMaterial color="#0284c7" roughness={0.6} metalness={0.1} />
        </mesh>

        {/* Atmosphere Halo */}
        <mesh
          onClick={(e) => {
            if (layerIndex !== 0) return;
            e.stopPropagation();
            onSelectObjectId("atmosphere_shell");
          }}
        >
          <sphereGeometry args={[1.62, 32, 32]} />
          <meshBasicMaterial
            color="#38bdf8"
            transparent
            opacity={0.25}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        {/* Low Earth Orbit Path (ISS) */}
        <mesh
          rotation={[-Math.PI / 3, 0, 0]}
          onClick={(e) => {
            if (layerIndex !== 0) return;
            e.stopPropagation();
            onSelectObjectId("iss_orbit");
          }}
        >
          <ringGeometry args={[1.8, 1.83, 64]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* ================= LAYER 1: EARTH & MOON ================= */}
      <group visible={layerIndex === 1}>
        {/* Central Earth */}
        <mesh
          scale={0.9}
          onClick={(e) => {
            if (layerIndex !== 1) return;
            e.stopPropagation();
            onSelectObjectId("earth_body");
          }}
        >
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color="#0284c7" />
        </mesh>

        {/* Lunar Orbit Ellipse */}
        <mesh
          rotation={[-Math.PI / 2.2, 0, 0]}
          onClick={(e) => {
            if (layerIndex !== 1) return;
            e.stopPropagation();
            onSelectObjectId("lunar_orbit_ring");
          }}
        >
          <ringGeometry args={[3.4, 3.42, 64]} />
          <meshBasicMaterial color="#94a3b8" transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>

        {/* The Moon */}
        <mesh
          ref={moonMeshRef}
          position={[3.4, 0.4, 0]}
          scale={0.3}
          onClick={(e) => {
            if (layerIndex !== 1) return;
            e.stopPropagation();
            onSelectObjectId("moon_body");
          }}
        >
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.9} />
        </mesh>
      </group>

      {/* ================= LAYER 2: SOLAR SYSTEM ================= */}
      <group ref={solarGroupRef} visible={layerIndex === 2}>
        {/* Central Sun */}
        <mesh
          onClick={(e) => {
            if (layerIndex !== 2) return;
            e.stopPropagation();
            onSelectObjectId("sun_star");
          }}
        >
          <sphereGeometry args={[1.2, 32, 32]} />
          <meshBasicMaterial color="#fef08a" />
        </mesh>
        <pointLight intensity={layerIndex === 2 ? 3 : 0} color="#ffffff" distance={20} />

        {/* Planet Orbits & Meshes */}
        {[
          { id: "mercury", r: 1.8, size: 0.1, color: "#94a3b8" },
          { id: "venus", r: 2.5, size: 0.18, color: "#fde047" },
          { id: "earth_orbit", r: 3.4, size: 0.22, color: "#38bdf8", isEarth: true },
          { id: "mars", r: 4.2, size: 0.14, color: "#f87171" },
          { id: "jupiter_planet", r: 5.6, size: 0.55, color: "#fb923c" },
          { id: "saturn", r: 7.0, size: 0.45, color: "#facc15" },
          { id: "uranus", r: 8.2, size: 0.32, color: "#2dd4bf" },
          { id: "neptune", r: 9.4, size: 0.3, color: "#60a5fa" },
        ].map((p) => (
          <group key={p.id} rotation={[-Math.PI / 2, 0, 0]}>
            <mesh>
              <ringGeometry args={[p.r, p.r + 0.02, 64]} />
              <meshBasicMaterial
                color={p.isEarth ? "#38bdf8" : "#475569"}
                transparent
                opacity={p.isEarth ? 0.7 : 0.3}
                side={THREE.DoubleSide}
              />
            </mesh>
            <mesh
              position={[p.r, 0, 0]}
              onClick={(e) => {
                if (layerIndex !== 2) return;
                e.stopPropagation();
                onSelectObjectId(p.id);
              }}
            >
              <sphereGeometry args={[p.size, 16, 16]} />
              <meshStandardMaterial color={p.color} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ================= LAYER 3: LOCAL STELLAR NEIGHBORHOOD ================= */}
      <group visible={layerIndex === 3}>
        {/* Central Sun */}
        <mesh
          onClick={(e) => {
            if (layerIndex !== 3) return;
            e.stopPropagation();
            onSelectObjectId("solar_system_star");
          }}
        >
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshBasicMaterial color="#fef08a" />
        </mesh>

        {/* Neighboring Stars */}
        {[
          { id: "alpha_centauri", pos: [2.2, 0.5, 1.0], color: "#fed7aa", size: 0.25 },
          { id: "sirius_star", pos: [-3.5, 1.2, -1.8], color: "#e0f2fe", size: 0.35 },
          { id: "procyon", pos: [-2.0, -1.8, 2.2], color: "#fef9c3", size: 0.22 },
          { id: "vega", pos: [4.2, 2.5, -2.0], color: "#bae6fd", size: 0.3 },
        ].map((s) => (
          <group key={s.id} position={s.pos as [number, number, number]}>
            <mesh
              onClick={(e) => {
                if (layerIndex !== 3) return;
                e.stopPropagation();
                onSelectObjectId(s.id);
              }}
            >
              <sphereGeometry args={[s.size, 16, 16]} />
              <meshBasicMaterial color={s.color} />
            </mesh>
          </group>
        ))}

        {/* Range sphere indicator */}
        <mesh>
          <sphereGeometry args={[5, 24, 24]} />
          <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.12} />
        </mesh>
      </group>

      {/* ================= LAYER 4: THE MILKY WAY GALAXY ================= */}
      <group visible={layerIndex === 4}>
        {/* Spiral Galaxy Particles */}
        <points ref={milkyWayPointsRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[mwPositions, 3]} />
            <bufferAttribute attach="attributes-color" args={[mwColors, 3]} />
          </bufferGeometry>
          <pointsMaterial
            size={0.045}
            vertexColors
            blending={THREE.AdditiveBlending}
            transparent
            opacity={0.8}
          />
        </points>

        {/* Central Sagittarius A* Core */}
        <mesh
          onClick={(e) => {
            if (layerIndex !== 4) return;
            e.stopPropagation();
            onSelectObjectId("sagittarius_a_star");
          }}
        >
          <sphereGeometry args={[0.4, 24, 24]} />
          <meshBasicMaterial color="#fef08a" />
        </mesh>

        {/* Earth / Sun Marker in Orion Spur (2.2 units out from center) */}
        <mesh
          position={[1.8, 0.1, 1.2]}
          onClick={(e) => {
            if (layerIndex !== 4) return;
            e.stopPropagation();
            onSelectObjectId("sun_orion_spur");
          }}
        >
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      </group>

      {/* ================= LAYER 5: THE LOCAL GROUP ================= */}
      <group visible={layerIndex === 5}>
        {/* Milky Way Disk */}
        <mesh
          position={[-2.2, 0, 0]}
          rotation={[Math.PI / 3, 0, 0]}
          onClick={(e) => {
            if (layerIndex !== 5) return;
            e.stopPropagation();
            onSelectObjectId("milky_way_obj");
          }}
        >
          <cylinderGeometry args={[1.4, 1.4, 0.08, 32]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.7} />
        </mesh>

        {/* Andromeda Galaxy M31 */}
        <mesh
          position={[2.5, 1.0, -1.0]}
          rotation={[Math.PI / 4, 0.5, 0]}
          onClick={(e) => {
            if (layerIndex !== 5) return;
            e.stopPropagation();
            onSelectObjectId("andromeda_m31");
          }}
        >
          <cylinderGeometry args={[2.0, 2.0, 0.1, 32]} />
          <meshBasicMaterial color="#fde047" transparent opacity={0.65} />
        </mesh>

        {/* Triangulum Galaxy M33 */}
        <mesh
          position={[0.8, -1.8, 1.5]}
          scale={0.7}
          onClick={(e) => {
            if (layerIndex !== 5) return;
            e.stopPropagation();
            onSelectObjectId("triangulum_m33");
          }}
        >
          <cylinderGeometry args={[0.9, 0.9, 0.06, 24]} />
          <meshBasicMaterial color="#2dd4bf" transparent opacity={0.6} />
        </mesh>
      </group>

      {/* ================= LAYER 6: THE OBSERVABLE UNIVERSE ================= */}
      <group visible={layerIndex === 6}>
        {/* Cosmic Web Particle Filaments */}
        <points ref={cosmicWebPointsRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[webPositions, 3]} />
            <bufferAttribute attach="attributes-color" args={[webColors, 3]} />
          </bufferGeometry>
          <pointsMaterial
            size={0.035}
            vertexColors
            blending={THREE.AdditiveBlending}
            transparent
            opacity={0.6}
          />
        </points>

        {/* Central Origin Marker (Earth) */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>

        {/* CMB Particle Horizon Shell */}
        <mesh
          onClick={(e) => {
            if (layerIndex !== 6) return;
            e.stopPropagation();
            onSelectObjectId("cmb_horizon");
          }}
        >
          <sphereGeometry args={[6.2, 32, 32]} />
          <meshBasicMaterial
            color="#fb7185"
            wireframe
            transparent
            opacity={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* ================= "WHERE IS EARTH?" LOCATOR RETICLE ================= */}
      {locateEarthActive && (
        <group
          position={
            layerIndex === 0
              ? [0, 0, 0]
              : layerIndex === 1
                ? [0, 0, 0]
                : layerIndex === 2
                  ? [3.4, 0, 0]
                  : layerIndex === 3
                    ? [0, 0, 0]
                    : layerIndex === 4
                      ? [1.8, 0.1, 1.2]
                      : layerIndex === 5
                        ? [-2.2, 0, 0]
                        : [0, 0, 0]
          }
        >
          {/* Pulsing ring reticle */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.4, 0.5, 32]} />
            <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} />
          </mesh>
          <mesh rotation={[0, 0, 0]}>
            <ringGeometry args={[0.6, 0.65, 32]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}
    </group>
  );
}

function CosmicZoomCameraController({ targetDistance }: { targetDistance: number }) {
  const prevTargetRef = useRef(targetDistance);
  const animatingRef = useRef(false);
  const dirVec = useRef(new THREE.Vector3());

  useEffect(() => {
    if (Math.abs(prevTargetRef.current - targetDistance) > 0.01) {
      prevTargetRef.current = targetDistance;
      animatingRef.current = true;
    }
  }, [targetDistance]);

  useFrame(({ camera }, delta) => {
    if (!animatingRef.current) return;
    const dt = Math.min(delta, 0.1);
    const currentDist = camera.position.length();
    if (currentDist < 0.001) return;
    const nextDist = THREE.MathUtils.damp(currentDist, targetDistance, 5.5, dt);
    dirVec.current.copy(camera.position).normalize().multiplyScalar(nextDist);
    camera.position.copy(dirVec.current);
    if (Math.abs(nextDist - targetDistance) < 0.03) {
      animatingRef.current = false;
    }
  });

  return null;
}

interface CosmicZoomVisualizer3DProps {
  onInteract?: () => void;
  onLayerChange?: (layerIndex: number) => void;
}

export function CosmicZoomVisualizer3D({ onInteract, onLayerChange }: CosmicZoomVisualizer3DProps) {
  const [currentLayerIndex, setCurrentLayerIndex] = useState(0);
  const [locateEarthActive, setLocateEarthActive] = useState(false);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [isPlayingTour, setIsPlayingTour] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Synchronize with VisualizationActionController & Cosmos3DAdapter (Prompt 03 Section 24)
  useEffect(() => {
    const unregisterAction = VisualizationActionController.registerHandler(
      "cosmic_scale",
      (action) => {
        const scaleLvl =
          typeof (action as any).scaleLevel === "number"
            ? (action as any).scaleLevel
            : typeof action.parameters?.scaleLevel === "number"
              ? (action.parameters.scaleLevel as number)
              : undefined;
        if (typeof scaleLvl === "number" && scaleLvl >= 0 && scaleLvl < COSMIC_ZOOM_LAYERS.length) {
          setCurrentLayerIndex(scaleLvl);
        }
        if (action.targetObject === "earth" || action.cameraAction === "highlight") {
          setLocateEarthActive(true);
        }
      },
    );

    const unregisterScene = Cosmos3DAdapter.getInstance().registerScene({
      sceneId: "cosmic_scale",
      getCurrentSimulationState: () => ({
        sceneId: "cosmic_scale",
        isRunning: isPlayingTour,
        timeScale: 1,
        activeExperimentId: `layer_${currentLayerIndex}`,
        activeParameters: {
          layerIndex: currentLayerIndex,
          layerName: COSMIC_ZOOM_LAYERS[currentLayerIndex]?.name || "Earth",
        },
      }),
      getSelectedObject: () => null,
      focusObject: (targetName: string) => {
        if (targetName.toLowerCase().includes("earth")) {
          setCurrentLayerIndex(0);
          setLocateEarthActive(true);
        } else if (targetName.toLowerCase().includes("moon")) {
          setCurrentLayerIndex(1);
        } else if (targetName.toLowerCase().includes("solar")) {
          setCurrentLayerIndex(2);
        } else if (targetName.toLowerCase().includes("milky")) {
          setCurrentLayerIndex(4);
        }
        return true;
      },
      highlightObject: () => {
        setLocateEarthActive(true);
        return true;
      },
      playDemonstration: () => {
        setIsPlayingTour(true);
        return true;
      },
      pauseSimulation: () => {
        setIsPlayingTour(false);
        return true;
      },
      resumeSimulation: () => {
        setIsPlayingTour(true);
        return true;
      },
    });

    return () => {
      unregisterAction();
      unregisterScene();
    };
  }, [currentLayerIndex, isPlayingTour]);

  const layer = COSMIC_ZOOM_LAYERS[currentLayerIndex];

  // Auto-tour step timer
  useEffect(() => {
    if (!isPlayingTour) return;
    const interval = setInterval(() => {
      setCurrentLayerIndex((prev) => (prev + 1) % COSMIC_ZOOM_LAYERS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPlayingTour]);

  useEffect(() => {
    if (isPlayingTour) {
      onLayerChange?.(currentLayerIndex);
    }
  }, [currentLayerIndex, isPlayingTour, onLayerChange]);

  const handleNextLayer = () => {
    if (currentLayerIndex < COSMIC_ZOOM_LAYERS.length - 1) {
      const next = currentLayerIndex + 1;
      setCurrentLayerIndex(next);
      onLayerChange?.(next);
      onInteract?.();
    }
  };

  const handlePrevLayer = () => {
    if (currentLayerIndex > 0) {
      const prev = currentLayerIndex - 1;
      setCurrentLayerIndex(prev);
      onLayerChange?.(prev);
      onInteract?.();
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setCurrentLayerIndex(val);
    onLayerChange?.(val);
    onInteract?.();
  };

  const handleTriggerLocateEarth = () => {
    setLocateEarthActive(true);
    onInteract?.();
    setTimeout(() => setLocateEarthActive(false), 5000);
  };

  // Find active selected object
  const selectedObject = layer.selectableObjects.find((obj) => obj.id === selectedObjectId);

  return (
    <div className="rounded-3xl border border-cyan-500/30 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-3 py-0.5 rounded-full uppercase tracking-wider">
              Signature 3D Experience • Layer 0{currentLayerIndex + 1} of 07
            </span>
            <span className="text-xs text-slate-400">Cinematic Cosmic Zoom</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            <span>{layer.symbol}</span>
            <span>{layer.name}</span>
          </h3>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Where is Earth Locator Button */}
          <Button
            size="sm"
            onClick={handleTriggerLocateEarth}
            className={`font-semibold transition-all ${
              locateEarthActive
                ? "bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-400/30"
                : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30"
            }`}
          >
            <Crosshair className="size-4 mr-1.5 animate-spin" />
            <span>{locateEarthActive ? "Earth Located!" : "Where is Earth?"}</span>
          </Button>

          {/* Auto Tour Play/Pause */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPlayingTour((p) => !p)}
            className="border-white/10 text-slate-300 hover:text-white"
          >
            {isPlayingTour ? (
              <>
                <Pause className="size-3.5 mr-1 text-amber-400" />
                <span>Pause Tour</span>
              </>
            ) : (
              <>
                <Play className="size-3.5 mr-1 text-emerald-400" />
                <span>Play Tour</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main 3D Canvas Stage */}
      <div className="relative rounded-2xl border border-white/10 bg-slate-950 mt-5 h-[420px] sm:h-[480px] w-full overflow-hidden shadow-inner">
        {mounted ? (
          <Canvas
            camera={{ position: [0, 2.5, layer.cameraDistance], fov: 45 }}
            dpr={[1, 1.5]}
            gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
          >
            <color attach="background" args={["#020617"]} />
            <Stars radius={100} depth={50} count={1600} factor={4} fade />
            <ambientLight intensity={0.4} />
            <directionalLight position={[5, 5, 5]} intensity={1.8} color="#ffffff" />
            <CosmicZoomCameraController targetDistance={layer.cameraDistance} />
            <CosmicScene
              layerIndex={currentLayerIndex}
              locateEarthActive={locateEarthActive}
              onSelectObjectId={(id) => setSelectedObjectId(id)}
            />
            <OrbitControls
              enableZoom={true}
              enableDamping={true}
              dampingFactor={0.08}
              maxDistance={32}
              minDistance={1.8}
              autoRotate={!isPlayingTour}
              autoRotateSpeed={0.4}
            />
          </Canvas>
        ) : (
          <div className="w-full h-full bg-[#020617] flex items-center justify-center text-xs text-cyan-400 font-mono">
            Loading 3D Cosmic Visualizer...
          </div>
        )}

        {/* Top Left: Layer Tag & Metric scale gauge */}
        <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-xl p-3 text-xs pointer-events-none max-w-xs">
          <span className="text-[10px] uppercase font-bold text-cyan-400 block tracking-wider">
            Spatial Dimension
          </span>
          <span className="text-base font-mono font-bold text-amber-300 block">
            {layer.scaleLabel}
          </span>
          <span className="text-[11px] text-slate-300 mt-0.5 block leading-tight">
            {layer.description}
          </span>
        </div>

        {/* Top Right: "Where is Earth?" Active Overlay Note */}
        {locateEarthActive && (
          <div className="absolute top-4 right-4 z-10 bg-cyan-950/90 backdrop-blur-md border border-cyan-400/60 rounded-xl p-3 text-xs text-cyan-200 shadow-xl max-w-xs animate-pulse">
            <span className="font-bold flex items-center gap-1.5 text-cyan-300 mb-0.5">
              <Crosshair className="size-3.5" />
              Earth Beacon Pinpoint
            </span>
            <p className="text-[11px] leading-relaxed">{layer.earthLocationNote}</p>
          </div>
        )}

        {/* Bottom Schematic Distance Compression Notice */}
        <div className="absolute bottom-4 inset-x-4 z-10 flex flex-col sm:flex-row items-center justify-between gap-2 pointer-events-none">
          <div className="bg-slate-950/80 backdrop-blur-md border border-amber-500/30 rounded-xl px-3 py-1.5 text-[11px] text-amber-200 flex items-center gap-1.5 shadow-md">
            <AlertCircle className="size-3.5 text-amber-400 flex-shrink-0" />
            <span>{layer.schematicNotice}</span>
          </div>
          <span className="text-[10px] text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-full border border-white/5">
            Click any 3D object to inspect • Drag to rotate view
          </span>
        </div>
      </div>

      {/* Cosmic Zoom Slider & Step Navigator */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/70 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Sliders className="size-4 text-cyan-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Cosmic Zoom Slider
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevLayer}
              disabled={currentLayerIndex === 0}
              className="text-xs border-white/10 text-slate-300"
            >
              <ChevronLeft className="size-3.5 mr-1" />
              <span>Zoom In</span>
            </Button>
            <span className="text-xs font-mono font-bold text-cyan-400 px-2">
              0{currentLayerIndex + 1} / 0{COSMIC_ZOOM_LAYERS.length}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextLayer}
              disabled={currentLayerIndex === COSMIC_ZOOM_LAYERS.length - 1}
              className="text-xs border-white/10 text-slate-300"
            >
              <span>Zoom Out</span>
              <ChevronRight className="size-3.5 ml-1" />
            </Button>
          </div>
        </div>

        {/* Interactive Slider Input */}
        <input
          type="range"
          min="0"
          max={COSMIC_ZOOM_LAYERS.length - 1}
          step="1"
          value={currentLayerIndex}
          onChange={handleSliderChange}
          className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
        />

        {/* 7 Layer Station Ticks */}
        <div className="grid grid-cols-7 gap-1 mt-3">
          {COSMIC_ZOOM_LAYERS.map((l, idx) => {
            const active = idx === currentLayerIndex;
            return (
              <button
                key={l.index}
                onClick={() => {
                  setCurrentLayerIndex(idx);
                  onLayerChange?.(idx);
                  onInteract?.();
                }}
                className={`py-1.5 px-1 rounded-lg text-center transition-all ${
                  active
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="text-sm block">{l.symbol}</span>
                <span className="text-[9px] font-mono block truncate hidden sm:block mt-0.5">
                  {l.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selectable Objects Inspector Bar */}
      <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/70 p-4">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2.5">
          Select Objects to Discover Relative Sizes:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {layer.selectableObjects.map((obj) => {
            const isSelected = selectedObjectId === obj.id;
            return (
              <button
                key={obj.id}
                onClick={() => setSelectedObjectId(obj.id)}
                className={`text-left p-3 rounded-xl border text-xs transition-all ${
                  isSelected
                    ? "bg-cyan-500/20 border-cyan-400 text-white shadow-md ring-1 ring-cyan-400/40"
                    : "bg-white/[0.02] border-white/5 text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white">{obj.name}</span>
                  <span className="text-[10px] font-mono text-cyan-400 bg-white/5 px-1.5 py-0.5 rounded">
                    {obj.type}
                  </span>
                </div>
                <div className="text-[11px] text-amber-300 font-mono mb-1">{obj.size}</div>
                <p className="text-[11px] text-slate-400 leading-tight line-clamp-2">{obj.info}</p>
              </button>
            );
          })}
        </div>

        {/* Selected Object Detailed Focus Modal Card */}
        {selectedObject && (
          <div className="mt-4 p-4 rounded-xl border border-cyan-500/40 bg-gradient-to-r from-cyan-950/40 to-slate-900/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-cyan-300">{selectedObject.name}</span>
                <span className="text-[10px] text-slate-400">({selectedObject.type})</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed max-w-xl">
                {selectedObject.info}
              </p>
              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400 font-mono">
                <span>Physical Size: {selectedObject.size}</span>
                <span>•</span>
                <span>Distance: {selectedObject.distanceFromEarth}</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedObjectId(null)}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-white/5 self-start sm:self-center"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
