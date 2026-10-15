import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import { ArrowDown, Compass, Sparkles, Volume2, VolumeX, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

// 3D Procedural Earth Model with Continental Masses and Atmospheric Atmosphere Rim
function Earth3D({ isMobile }: { isMobile: boolean }) {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);

  // Generate procedural earth texture for zero external network latency
  const [earthTexture, setEarthTexture] = useState<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Deep ocean blue gradient
      const oceanGrad = ctx.createLinearGradient(0, 0, 0, 512);
      oceanGrad.addColorStop(0, "#081d3a");
      oceanGrad.addColorStop(0.5, "#0b2f5b");
      oceanGrad.addColorStop(1, "#051329");
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, 0, 1024, 512);

      // Procedural continent shapes
      ctx.fillStyle = "#1e4d2b"; // landmass dark green
      const landClusters = [
        { x: 250, y: 160, r: 85 }, // North America
        { x: 340, y: 310, r: 75 }, // South America
        { x: 520, y: 170, r: 90 }, // Europe / Africa north
        { x: 550, y: 300, r: 95 }, // Africa south
        { x: 740, y: 180, r: 120 }, // Asia
        { x: 820, y: 350, r: 60 }, // Australia
      ];

      landClusters.forEach((c) => {
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.fill();
        // secondary blobs for jagged coastline effect
        for (let i = 0; i < 7; i++) {
          const angle = (i / 7) * Math.PI * 2;
          const dist = c.r * (0.6 + Math.sin(i * 3) * 0.3);
          ctx.beginPath();
          ctx.arc(
            c.x + Math.cos(angle) * dist,
            c.y + Math.sin(angle) * dist,
            c.r * 0.45,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }
      });

      // City night lights glow dots
      ctx.fillStyle = "#ffd580";
      for (let i = 0; i < 90; i++) {
        const lx = 200 + Math.random() * 650;
        const ly = 100 + Math.random() * 300;
        ctx.beginPath();
        ctx.arc(lx, ly, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Ice caps
      ctx.fillStyle = "#e2f1fc";
      ctx.fillRect(0, 0, 1024, 38);
      ctx.fillRect(0, 480, 1024, 32);

      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      setEarthTexture(tex);
    }
  }, []);

  useFrame((_, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.12;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.16;
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y += delta * 0.08;
    }
  });

  return (
    <group position={[0, -0.2, 0]}>
      {/* Atmosphere Glow Shell */}
      <mesh ref={atmosphereRef} scale={isMobile ? 1.95 : 2.05}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.16}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Earth Body */}
      <mesh ref={earthRef} scale={isMobile ? 1.8 : 1.9}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshStandardMaterial
          map={earthTexture}
          roughness={0.65}
          metalness={0.1}
          emissive="#001830"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Cloud layer */}
      <mesh ref={cloudsRef} scale={isMobile ? 1.83 : 1.93}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.25}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Orbital indicator ring */}
      <mesh rotation={[-Math.PI / 2.3, 0, 0]}>
        <ringGeometry args={[2.5, 2.52, 64]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.25} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function SceneLights() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[6, 4, 5]} intensity={2.2} color="#ffffff" />
      <pointLight position={[-8, -4, -4]} intensity={0.5} color="#0284c7" />
    </>
  );
}

interface AcademyHeroProps {
  onStartExploring: () => void;
  onViewMap: () => void;
}

export function AcademyHero({ onStartExploring, onViewMap }: AcademyHeroProps) {
  const [skipped, setSkipped] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <section className="relative min-h-[92vh] w-full overflow-hidden flex flex-col items-center justify-center bg-slate-950 text-white">
      {/* Background 3D Space Canvas */}
      <div className="absolute inset-0 z-0 pointer-events-auto">
        <Canvas
          camera={{ position: [0, 1.2, isMobile ? 5.2 : 4.4], fov: 45 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        >
          <color attach="background" args={["#020617"]} />
          <Stars
            radius={120}
            depth={60}
            count={isMobile ? 1200 : 2800}
            factor={4}
            saturation={0.5}
            fade
            speed={1}
          />
          <SceneLights />
          <Earth3D isMobile={isMobile} />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.8}
            maxPolarAngle={Math.PI / 1.7}
            minPolarAngle={Math.PI / 2.5}
          />
        </Canvas>
      </div>

      {/* Radial overlay gradient to guarantee legible text */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/70" />
      <div className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.8)_85%)]" />

      {/* Top action badge & Skip intro button */}
      <div className="absolute top-20 inset-x-0 z-20 flex justify-between items-center max-w-7xl mx-auto px-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/50 backdrop-blur-md px-3.5 py-1 text-xs font-medium text-cyan-300">
          <Sparkles className="size-3.5 text-cyan-400 animate-pulse" />
          <span>Interactive Astronomy Curriculum • 24 Modules</span>
        </div>
        <button
          onClick={() => {
            setSkipped(true);
            onStartExploring();
          }}
          className="text-xs text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3 py-1 rounded-full border border-white/10 backdrop-blur-sm"
        >
          Skip Intro ↓
        </button>
      </div>

      {/* Hero Content */}
      <div className="relative z-20 max-w-4xl mx-auto px-6 text-center mt-12 flex flex-col items-center">
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white drop-shadow-md">
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-300">
            COSMIC LEARNING
          </span>
          <span className="block text-white mt-1">ACADEMY</span>
        </h1>

        <p className="mt-4 text-lg sm:text-xl md:text-2xl font-light text-cyan-100/90 tracking-wide">
          &ldquo;From our planet to the edge of the observable universe.&rdquo;
        </p>

        <p className="mt-2 text-sm sm:text-base font-medium text-slate-300/80 tracking-widest uppercase">
          Explore • Experiment • Discover
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Button
            size="lg"
            onClick={onStartExploring}
            className="w-full sm:w-auto px-8 py-6 text-base font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 border-none transition-transform hover:scale-105"
          >
            <Compass className="size-5 mr-2" />
            START EXPLORING
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={onViewMap}
            className="w-full sm:w-auto px-8 py-6 text-base font-semibold border-white/20 bg-slate-900/60 backdrop-blur-md text-white hover:bg-white/10 hover:border-cyan-400 transition-all"
          >
            <Eye className="size-5 mr-2 text-cyan-400" />
            VIEW LEARNING MAP
          </Button>
        </div>

        {/* Interactive Earth Prompt */}
        <p className="mt-6 text-xs text-slate-400/80 flex items-center gap-1.5 animate-bounce">
          <ArrowDown className="size-3.5 text-cyan-400" />
          <span>Drag Earth to rotate • Scroll down for curriculum map</span>
        </p>
      </div>
    </section>
  );
}
