import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useState, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Button } from "@/components/ui/button";
import {
  Compass,
  Disc,
  Sparkles,
  ExternalLink,
  ArrowLeft,
  Orbit,
  Eye,
  Info,
  CheckCircle2,
  BookOpen,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/galaxies")({
  head: () => ({
    meta: [
      { title: "Learn About Galaxies — Module 13 | Cosmic Learning Academy" },
      {
        name: "description",
        content:
          "Explore the morphology, stellar populations, and dynamics of spiral, elliptical, and irregular galaxies with interactive 3D simulations and NASA archives.",
      },
      {
        property: "og:title",
        content: "Learn About Galaxies — Module 13 | Cosmic Learning Academy",
      },
      {
        property: "og:description",
        content:
          "Inspect spiral arms, galactic cores, and central supermassive black holes in an interactive 3D galaxy viewer.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GalaxiesRouteComponent,
});

interface GalaxyItem {
  id: string;
  name: string;
  messier: string;
  morphology: "Spiral" | "Barred Spiral" | "Elliptical" | "Irregular";
  distanceLy: string;
  diameterLy: string;
  starsCount: string;
  constellation: string;
  description: string;
  hubbleType: string;
  colorTheme: string;
  particleColor: string;
  coreColor: string;
  nasaUrl: string;
  wikiUrl: string;
}

const FEATURED_GALAXIES: GalaxyItem[] = [
  {
    id: "andromeda",
    name: "Andromeda Galaxy",
    messier: "M31 (NGC 224)",
    morphology: "Barred Spiral",
    hubbleType: "SA(s)b",
    distanceLy: "2.537 Million Light-Years",
    diameterLy: "220,000 Light-Years",
    starsCount: "1 Trillion Stars",
    constellation: "Andromeda",
    description:
      "The largest member of our Local Group, containing roughly one trillion stars. It is approaching the Milky Way at 110 km/s and will merge with us in approximately 4.5 billion years.",
    colorTheme: "from-cyan-500/20 to-blue-600/30",
    particleColor: "#38bdf8",
    coreColor: "#fef08a",
    nasaUrl:
      "https://science.nasa.gov/mission/hubble/science/science-highlights/hubble-views-the-andromeda-galaxy/",
    wikiUrl: "https://en.wikipedia.org/wiki/Andromeda_Galaxy",
  },
  {
    id: "whirlpool",
    name: "Whirlpool Galaxy",
    messier: "M51 (NGC 5194)",
    morphology: "Spiral",
    hubbleType: "SA(s)bc pec",
    distanceLy: "23 Million Light-Years",
    diameterLy: "76,000 Light-Years",
    starsCount: "100 Billion Stars",
    constellation: "Canes Venatici",
    description:
      "A textbook grand-design spiral galaxy interacting with its smaller companion NGC 5195. The tidal forces from this dance trigger intense waves of star formation in its luminous spiral arms.",
    colorTheme: "from-indigo-500/20 to-purple-600/30",
    particleColor: "#818cf8",
    coreColor: "#fed7aa",
    nasaUrl: "https://science.nasa.gov/missions/hubble/hubble-views-the-whirlpool-galaxy/",
    wikiUrl: "https://en.wikipedia.org/wiki/Whirlpool_Galaxy",
  },
  {
    id: "sombrero",
    name: "Sombrero Galaxy",
    messier: "M104 (NGC 4594)",
    morphology: "Spiral",
    hubbleType: "SA(s)a",
    distanceLy: "29.3 Million Light-Years",
    diameterLy: "50,000 Light-Years",
    starsCount: "800 Billion Stars",
    constellation: "Virgo",
    description:
      "Famous for its brilliant white bulbous core and a dramatic dark absorption dust lane encircling the rim like a Mexican sombrero hat. Hosts a supermassive black hole 1 billion times more massive than our Sun.",
    colorTheme: "from-amber-500/20 to-yellow-600/30",
    particleColor: "#fde047",
    coreColor: "#ffffff",
    nasaUrl:
      "https://science.nasa.gov/mission/hubble/science/science-highlights/sombrero-galaxy-m104/",
    wikiUrl: "https://en.wikipedia.org/wiki/Sombrero_Galaxy",
  },
  {
    id: "triangulum",
    name: "Triangulum Galaxy",
    messier: "M33 (NGC 598)",
    morphology: "Spiral",
    hubbleType: "SA(s)cd",
    distanceLy: "2.73 Million Light-Years",
    diameterLy: "60,000 Light-Years",
    starsCount: "40 Billion Stars",
    constellation: "Triangulum",
    description:
      "The third-largest member of the Local Group. It contains NGC 604, one of the largest known star-forming nebulae in the local universe—nearly 40 times larger than the Orion Nebula.",
    colorTheme: "from-teal-500/20 to-emerald-600/30",
    particleColor: "#2dd4bf",
    coreColor: "#fef08a",
    nasaUrl: "https://science.nasa.gov/missions/hubble/hubble-views-the-triangulum-galaxy/",
    wikiUrl: "https://en.wikipedia.org/wiki/Triangulum_Galaxy",
  },
  {
    id: "lmc",
    name: "Large Magellanic Cloud",
    messier: "LMC",
    morphology: "Irregular",
    hubbleType: "SB(s)m",
    distanceLy: "163,000 Light-Years",
    diameterLy: "14,000 Light-Years",
    starsCount: "20 Billion Stars",
    constellation: "Dorado / Mensa",
    description:
      "A satellite galaxy gravitationally orbiting the Milky Way. Visible to the naked eye from the Southern Hemisphere, it is home to the colossal Tarantula Nebula and was the site of Supernova 1987A.",
    colorTheme: "from-rose-500/20 to-pink-600/30",
    particleColor: "#fb7185",
    coreColor: "#ffffff",
    nasaUrl: "https://science.nasa.gov/missions/hubble/hubble-views-the-large-magellanic-cloud/",
    wikiUrl: "https://en.wikipedia.org/wiki/Large_Magellanic_Cloud",
  },
];

// Interactive 3D Procedural Particle Galaxy Model
function Galaxy3DView({ galaxy }: { galaxy: GalaxyItem }) {
  const pointsRef = useRef<THREE.Points>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  const particlesCount = 3500;
  const [positions, colors] = React.useMemo(() => {
    const pos = new Float32Array(particlesCount * 3);
    const col = new Float32Array(particlesCount * 3);
    const baseColor = new THREE.Color(galaxy.particleColor);
    const coreColor = new THREE.Color(galaxy.coreColor);

    const isSpiral = galaxy.morphology.includes("Spiral");
    const arms = isSpiral ? 2 : 0;

    for (let i = 0; i < particlesCount; i++) {
      const i3 = i * 3;
      const radius = Math.random() * 3.5;
      const spinAngle = radius * (isSpiral ? 3.2 : 0.8);
      const branchAngle = isSpiral ? ((i % arms) * (Math.PI * 2)) / arms : 0;

      const randomX = (Math.random() - 0.5) * 0.4 * (radius + 0.5);
      const randomY = (Math.random() - 0.5) * 0.25 * (3.8 - radius);
      const randomZ = (Math.random() - 0.5) * 0.4 * (radius + 0.5);

      pos[i3] = Math.cos(spinAngle + branchAngle) * radius + randomX;
      pos[i3 + 1] = randomY;
      pos[i3 + 2] = Math.sin(spinAngle + branchAngle) * radius + randomZ;

      // Color gradient: warm core to cool outer arms
      const mixedColor = coreColor.clone().lerp(baseColor, radius / 3.5);
      col[i3] = mixedColor.r;
      col[i3 + 1] = mixedColor.g;
      col[i3 + 2] = mixedColor.b;
    }
    return [pos, col];
  }, [galaxy]);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.08;
    }
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.12;
    }
  });

  return (
    <group rotation={[Math.PI / 4, 0, 0]}>
      {/* Central Galactic Core Glow */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.35, 24, 24]} />
        <meshBasicMaterial color={galaxy.coreColor} transparent opacity={0.8} />
      </mesh>

      {/* Galaxy Particle System */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.035}
          sizeAttenuation
          depthWrite={false}
          vertexColors
          blending={THREE.AdditiveBlending}
          transparent
          opacity={0.85}
        />
      </points>
    </group>
  );
}

function GalaxiesRouteComponent() {
  const [selectedGalaxy, setSelectedGalaxy] = useState<GalaxyItem>(FEATURED_GALAXIES[0]);

  return (
    <PublicLayout>
      <div className="min-h-screen bg-slate-950 text-slate-100 pt-20 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Header Navigation & Breadcrumbs */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-b border-white/10 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Link
                  to="/learn"
                  className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                >
                  <ArrowLeft className="size-3.5" />
                  <span>Cosmic Learning Academy</span>
                </Link>
                <span className="text-slate-500">•</span>
                <span className="text-xs font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded">
                  Module 13 • Stage 4
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                Learn About Galaxies
              </h1>
              <p className="mt-1 text-sm sm:text-base text-slate-300 max-w-2xl">
                Explore the morphology, rotation curves, and central supermassive black holes of the
                universe&apos;s greatest island star cities.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                asChild
                variant="outline"
                className="border-white/10 text-white hover:bg-white/5"
              >
                <Link to="/learn">Academy Curriculum</Link>
              </Button>
              <Button
                asChild
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white"
              >
                <Link to="/universe">Fly in 3D Universe ↗</Link>
              </Button>
            </div>
          </div>

          {/* Interactive 3D Galaxy Viewer Chamber */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left 2 Cols: 3D Canvas Stage */}
            <div className="lg:col-span-2 rounded-3xl border border-cyan-500/30 bg-slate-950 p-6 sm:p-8 relative overflow-hidden shadow-2xl">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <span className="text-xs font-mono text-cyan-400 font-bold block uppercase tracking-wider">
                    {selectedGalaxy.morphology} Galaxy • Hubble Class: {selectedGalaxy.hubbleType}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                    {selectedGalaxy.name}
                  </h2>
                  <span className="text-xs font-mono text-slate-400">{selectedGalaxy.messier}</span>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">Distance from Earth</span>
                  <span className="text-base font-mono font-bold text-amber-300">
                    {selectedGalaxy.distanceLy}
                  </span>
                </div>
              </div>

              {/* 3D Canvas Area */}
              <div className="relative h-[400px] sm:h-[480px] w-full rounded-2xl bg-slate-950/90 border border-white/10 overflow-hidden">
                <Canvas
                  camera={{ position: [0, 3.5, 6], fov: 45 }}
                  dpr={[1, 1.5]}
                  gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
                >
                  <color attach="background" args={["#030712"]} />
                  <Stars radius={90} depth={50} count={1400} factor={3} fade />
                  <ambientLight intensity={0.5} />
                  <pointLight position={[0, 0, 0]} intensity={3} color="#ffffff" />
                  <Galaxy3DView galaxy={selectedGalaxy} />
                  <OrbitControls
                    enableZoom={true}
                    maxDistance={12}
                    minDistance={2}
                    autoRotate
                    autoRotateSpeed={0.5}
                  />
                </Canvas>

                {/* Overlay Prompt */}
                <div className="absolute bottom-3 inset-x-0 flex justify-center pointer-events-none">
                  <span className="text-[11px] text-slate-400 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                    Interactive 3D: Click & drag to rotate • Scroll to zoom
                  </span>
                </div>
              </div>

              {/* Galaxy Narrative */}
              <div className="mt-6 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <p className="text-sm text-slate-200 leading-relaxed">
                  {selectedGalaxy.description}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <a
                    href={selectedGalaxy.nasaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <span>NASA Hubble Archives</span>
                    <ExternalLink className="size-3" />
                  </a>
                  <a
                    href={selectedGalaxy.wikiUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <span>Wikipedia Research Article</span>
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Right Col: Galaxy Selector & Measured Characteristics */}
            <div className="space-y-6">
              {/* Galaxy Selection List */}
              <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-xl">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Disc className="size-4 text-cyan-400" />
                  Select Catalog Galaxy
                </h3>

                <div className="space-y-2">
                  {FEATURED_GALAXIES.map((g) => {
                    const active = g.id === selectedGalaxy.id;
                    return (
                      <button
                        key={g.id}
                        onClick={() => setSelectedGalaxy(g)}
                        className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                          active
                            ? "bg-cyan-500/20 border-cyan-400 text-white shadow-md shadow-cyan-500/10 ring-1 ring-cyan-400/30"
                            : "bg-white/[0.02] border-white/5 text-slate-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <div>
                          <div className="text-sm font-bold text-white">{g.name}</div>
                          <div className="text-[11px] text-slate-400">
                            {g.morphology} • {g.messier}
                          </div>
                        </div>
                        <span className="text-xs font-mono text-cyan-400">
                          {g.distanceLy.split(" ")[0]} ly
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Physical Parameters Card */}
              <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-xl space-y-3">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Measured Physical Data
                </h3>

                <div className="divide-y divide-white/5 text-xs text-slate-300">
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-400">Disk Diameter:</span>
                    <span className="font-mono font-bold text-white">
                      {selectedGalaxy.diameterLy}
                    </span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-400">Estimated Stars:</span>
                    <span className="font-mono font-bold text-white">
                      {selectedGalaxy.starsCount}
                    </span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-400">Host Constellation:</span>
                    <span className="font-mono font-bold text-white">
                      {selectedGalaxy.constellation}
                    </span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-400">Hubble Classification:</span>
                    <span className="font-mono font-bold text-cyan-400">
                      {selectedGalaxy.hubbleType}
                    </span>
                  </div>
                </div>
              </div>

              {/* Link back into Academy Progression */}
              <div className="rounded-3xl border border-indigo-500/30 bg-indigo-950/20 p-5 backdrop-blur-xl text-center">
                <h4 className="text-sm font-bold text-white mb-1">Cosmic Academy Integration</h4>
                <p className="text-xs text-slate-300 mb-3">
                  Completed this exploration? Continue to Stage 4 Module 14: Black Holes & Neutron
                  Stars.
                </p>
                <Button
                  asChild
                  size="sm"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  <Link to="/learn">
                    <span>Back to Academy Dashboard</span>
                    <ArrowRight className="size-3.5 ml-1.5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
