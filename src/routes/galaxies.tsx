import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useState, useRef, useEffect, useMemo } from "react";
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
  Bookmark,
  Award,
  Layers,
  GraduationCap,
  ShieldCheck,
  Flame,
  Ruler,
  HelpCircle,
  Clock,
  RotateCcw,
} from "lucide-react";
import { useAcademyProgress } from "@/lib/academy/progress";
import { ACADEMY_MODULES } from "@/lib/academy/registry";
import { LearningLevelSelector } from "@/components/academy/LearningLevelSelector";
import { KnowledgeCheck } from "@/components/academy/KnowledgeCheck";
import {
  MODULE_13_SUBLESSONS,
  MODULE_13_QUIZ_QUESTIONS,
  MODULE_13_SOURCES,
  PREREQUISITE_MODULE_IDS,
  NEXT_RECOMMENDED_MODULE,
  type GalaxySublesson,
} from "@/lib/academy/lessons/module-13-galaxies";

export const Route = createFileRoute("/galaxies")({
  head: () => ({
    meta: [
      { title: "Learn About Galaxies — Module 13 | Cosmic Learning Academy" },
      {
        name: "description",
        content:
          "Official Module 13 of the Cosmic Learning Academy: Explore the morphology, stellar populations, and dynamics of spiral, elliptical, and irregular galaxies with interactive 3D simulations and NASA archives.",
      },
      {
        property: "og:title",
        content: "Learn About Galaxies — Module 13 | Cosmic Learning Academy",
      },
      {
        property: "og:description",
        content:
          "Inspect spiral arms, galactic cores, and central supermassive black holes in an interactive 3D galaxy viewer with grade-adaptive astrophysics lessons.",
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
      "The largest member of our Local Group, containing roughly one trillion stars. It is approaching the Milky Way at 110 km/s and will merge with us in approximately 4.5 billion years to form a giant elliptical galaxy.",
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
  const [positions, colors] = useMemo(() => {
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
  const {
    progress,
    selectedLevel,
    setLearningLevel,
    setModuleProgress,
    recordQuizResult,
    toggleBookmark,
  } = useAcademyProgress();

  const [selectedGalaxy, setSelectedGalaxy] = useState<GalaxyItem>(FEATURED_GALAXIES[0]);
  const [mounted, setMounted] = useState(false);
  const [activeSublessonId, setActiveSublessonId] = useState<string>("13-1-morphology");
  const [exploredChapters, setExploredChapters] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("cosmic_academy_explored_galaxies_chapters");
      return stored ? JSON.parse(stored) : ["13-1-morphology"];
    } catch {
      return ["13-1-morphology"];
    }
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const isBookmarked = progress.bookmarks.includes("13");
  const module13Data = progress.moduleProgress["13"] || {
    status: "not_started",
    percent: 0,
  };
  const isCompleted = module13Data.status === "completed";
  const hasNavigatorAchievement = progress.achievements.includes("galaxy_voyager");

  const activeSublesson = useMemo(() => {
    return (
      MODULE_13_SUBLESSONS.find((sub) => sub.id === activeSublessonId) || MODULE_13_SUBLESSONS[0]
    );
  }, [activeSublessonId]);

  // Quiz questions adapted to active grade level
  const quizQuestions = useMemo(() => {
    return MODULE_13_QUIZ_QUESTIONS[selectedLevel] || MODULE_13_QUIZ_QUESTIONS.explorer;
  }, [selectedLevel]);

  // Handler for marking a chapter as explored
  const handleToggleExploreChapter = (chapterId: string) => {
    setExploredChapters((prev) => {
      const next = prev.includes(chapterId)
        ? prev.filter((id) => id !== chapterId)
        : [...prev, chapterId];

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("cosmic_academy_explored_galaxies_chapters", JSON.stringify(next));
        } catch (e) {
          console.error("Failed to persist explored chapters", e);
        }
      }

      // Calculate new progress percent (chapters = 60%, quiz = 40%)
      const chapterWeight = (next.length / MODULE_13_SUBLESSONS.length) * 60;
      const quizPassed = (progress.quizScores["module_13_quiz"]?.score || 0) > 0;
      const totalPercent = Math.min(100, Math.round(chapterWeight + (quizPassed ? 40 : 0)));
      const nextStatus = totalPercent >= 100 ? "completed" : "in_progress";

      setModuleProgress("13", totalPercent, nextStatus);
      return next;
    });
  };

  const handleQuizCompletion = (score: number, total: number) => {
    recordQuizResult("module_13_quiz", score, total);
    // If completed successfully, update module status
    const chapterWeight = (exploredChapters.length / MODULE_13_SUBLESSONS.length) * 60;
    const quizWeight = (score / total) * 40;
    const computedPercent = Math.min(100, Math.round(chapterWeight + quizWeight));
    const finalPercent =
      score >= Math.ceil(total * 0.7) && exploredChapters.length >= 4 ? 100 : computedPercent;
    const status = finalPercent >= 100 ? "completed" : "in_progress";
    setModuleProgress("13", finalPercent, status);
  };

  // Find prerequisite modules from registry
  const prerequisiteModules = useMemo(() => {
    return PREREQUISITE_MODULE_IDS.map((id) => {
      const mod = ACADEMY_MODULES.find((m) => m.id === id);
      const userStatus = progress.moduleProgress[id]?.status || "not_started";
      return {
        id,
        title: mod?.title || `Module ${id}`,
        stageId: mod?.stageId || 1,
        status: userStatus,
        route: mod?.route || "/learn",
      };
    });
  }, [progress.moduleProgress]);

  return (
    <PublicLayout>
      <div className="min-h-screen bg-slate-950 text-slate-100 pt-20 pb-24 selection:bg-cyan-500/30 selection:text-cyan-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Top Breadcrumbs & Main Module Navigation Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-b border-white/10 pb-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Link
                  to="/learn"
                  className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                >
                  <ArrowLeft className="size-3.5" />
                  <span>Cosmic Learning Academy</span>
                </Link>
                <span className="text-slate-500">•</span>
                <span className="text-xs font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded">
                  Official Module 13 • Stage 4
                </span>
                {isCompleted ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="size-3" />
                    Module Completed (100%)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                    Progress: {module13Data.percent}%
                  </span>
                )}
                {hasNavigatorAchievement && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-300 bg-cyan-950/60 border border-cyan-500/40 px-2 py-0.5 rounded-full">
                    <Award className="size-3 text-cyan-400" />
                    Galactic Navigator 🌀
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                Learn About Galaxies
              </h1>
              <p className="mt-1 text-sm sm:text-base text-slate-300 max-w-2xl">
                Explore the morphology, rotation curves, stellar populations, and central
                supermassive black holes of the universe&apos;s greatest island star cities.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleBookmark("13")}
                className={`border-white/10 ${
                  isBookmarked
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    : "text-slate-300 hover:text-white"
                }`}
                title={isBookmarked ? "Bookmarked" : "Bookmark this module"}
              >
                <Bookmark className={`size-3.5 mr-1.5 ${isBookmarked ? "fill-current" : ""}`} />
                <span>{isBookmarked ? "Bookmarked" : "Bookmark"}</span>
              </Button>

              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-white/10 text-white hover:bg-white/5"
              >
                <Link to="/learn">Academy Dashboard</Link>
              </Button>

              <Button
                asChild
                size="sm"
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold"
              >
                <Link to="/universe">Fly in 3D Universe ↗</Link>
              </Button>
            </div>
          </div>

          {/* Module Progress Bar */}
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-semibold text-slate-300 flex items-center gap-2">
                  <Disc className="size-3.5 text-cyan-400" />
                  Module 13 Mastery Track: {exploredChapters.length} of{" "}
                  {MODULE_13_SUBLESSONS.length} Chapters Explored
                </span>
                <span className="font-mono text-cyan-400 font-bold">{module13Data.percent}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-500 via-indigo-400 to-emerald-400 h-full transition-all duration-500"
                  style={{ width: `${Math.max(module13Data.percent, 5)}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0">
              <span className="flex items-center gap-1">
                <ShieldCheck className="size-3.5 text-emerald-400" />
                NASA / IAU Verified Data
              </span>
            </div>
          </div>

          {/* Learning Level Selector (Classes 1-3, 4-6, 7-10) */}
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl">
            <LearningLevelSelector currentLevel={selectedLevel} onSelectLevel={setLearningLevel} />
          </div>

          {/* Recommended Prerequisite Modules Card */}
          <div className="rounded-3xl border border-cyan-500/20 bg-gradient-to-r from-cyan-950/20 via-slate-900/50 to-slate-950/40 p-6 backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block">
                  Recommended Prior Knowledge
                </span>
                <h3 className="text-lg font-bold text-white">Prerequisite Foundations</h3>
              </div>
              <span className="text-xs text-slate-400">
                Understanding these foundations enriches galaxy dynamics
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {prerequisiteModules.map((pre) => {
                const isPreDone = pre.status === "completed";
                const isPreInProgress = pre.status === "in_progress";
                const icon =
                  pre.id === "09" ? (
                    <Flame className="size-4 text-rose-400" />
                  ) : pre.id === "08" ? (
                    <Orbit className="size-4 text-teal-400" />
                  ) : (
                    <Ruler className="size-4 text-indigo-400" />
                  );

                return (
                  <Link
                    key={pre.id}
                    to={pre.route}
                    className="p-3 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/5 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-white/5 border border-white/10 shrink-0">
                        {icon}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                          Module {pre.id}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[150px]">
                          {pre.title}
                        </div>
                      </div>
                    </div>

                    <div>
                      {isPreDone ? (
                        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="size-3" />
                          Done
                        </span>
                      ) : isPreInProgress ? (
                        <span className="text-[10px] font-semibold text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/30">
                          Active
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                          View
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
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
                {mounted ? (
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
                ) : (
                  <div className="w-full h-full bg-[#030712] flex items-center justify-center text-xs text-cyan-400 font-mono">
                    Initializing 3D Galaxy Viewer...
                  </div>
                )}

                {/* Scientifically Accurate Simulation Label (Requirement 12) */}
                <div className="absolute top-3 left-3 max-w-[280px] sm:max-w-md pointer-events-none">
                  <span className="text-[10px] sm:text-[11px] text-cyan-300 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-cyan-500/30 block leading-tight">
                    <span className="font-semibold text-white">Scientific Visualization:</span>{" "}
                    Procedural 3D particle model based on logarithmic spiral arm density and central
                    bulge parameters, scaled for real-time WebGL exploration.
                  </span>
                </div>

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

              {/* Cosmic Flight Direct Action */}
              <div className="rounded-3xl border border-indigo-500/30 bg-indigo-950/20 p-5 backdrop-blur-xl text-center">
                <h4 className="text-sm font-bold text-white mb-1">Full 3D Space Experience</h4>
                <p className="text-xs text-slate-300 mb-3">
                  Visit the Andromeda and Milky Way systems in real 3D scale with 100,000 catalog
                  stars.
                </p>
                <Button
                  asChild
                  size="sm"
                  className="w-full bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold"
                >
                  <Link to="/universe">
                    <span>Fly in 3D Universe</span>
                    <ArrowRight className="size-3.5 ml-1.5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Educational Galaxy Chapters Section (Requirements 5, 6, 7) */}
          <section className="space-y-6 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div>
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block">
                  Module 13 Core Curriculum
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5">
                  Astronomical Chapters & Scientific Principles
                </h2>
              </div>
              <div className="text-xs text-slate-400">
                Adapted for:{" "}
                <span className="text-cyan-300 font-semibold uppercase">{selectedLevel} Level</span>
              </div>
            </div>

            {/* Chapter Selection Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {MODULE_13_SUBLESSONS.map((ch) => {
                const active = ch.id === activeSublessonId;
                const isExplored = exploredChapters.includes(ch.id);

                return (
                  <button
                    key={ch.id}
                    onClick={() => setActiveSublessonId(ch.id)}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      active
                        ? "bg-cyan-500/20 border-cyan-400 text-white shadow-md shadow-cyan-500/10 ring-1 ring-cyan-400/40"
                        : "bg-slate-900/50 border-white/10 text-slate-400 hover:bg-slate-900 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-mono text-[10px] font-bold text-cyan-400">
                        Ch 0{ch.number}
                      </span>
                      {isExplored && <CheckCircle2 className="size-3.5 text-emerald-400" />}
                    </div>
                    <div className="text-xs font-bold text-white line-clamp-1">{ch.shortTitle}</div>
                  </button>
                );
              })}
            </div>

            {/* Active Chapter Detail Card */}
            <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-cyan-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                      Chapter 0{activeSublesson.number} of {MODULE_13_SUBLESSONS.length}
                    </span>
                    <span className="text-xs text-slate-400">
                      Lesson ID: <code className="text-cyan-300">{activeSublesson.id}</code>
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white">
                    {activeSublesson.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1">
                    {activeSublesson.summary}
                  </p>
                </div>

                <Button
                  size="sm"
                  onClick={() => handleToggleExploreChapter(activeSublesson.id)}
                  className={`${
                    exploredChapters.includes(activeSublesson.id)
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                      : "bg-cyan-600 hover:bg-cyan-500 text-white"
                  } font-semibold`}
                >
                  <CheckCircle2 className="size-4 mr-1.5" />
                  <span>
                    {exploredChapters.includes(activeSublesson.id)
                      ? "Chapter Completed"
                      : "Mark Chapter Explored"}
                  </span>
                </Button>
              </div>

              {/* Adapted Grade-Level Explanatory Content */}
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="size-3.5" />
                    Adaptive Lesson Text ({selectedLevel.toUpperCase()})
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    Curriculum verified via NASA & IAU archives
                  </span>
                </div>

                <p className="text-sm sm:text-base text-slate-100 leading-relaxed">
                  {activeSublesson.content[selectedLevel]}
                </p>

                {/* Key Concepts List */}
                <div className="pt-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Key Scientific Takeaways:
                  </span>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-200">
                    {activeSublesson.keyConcepts[selectedLevel].map((kc, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 bg-slate-950/40 border border-white/5 p-2.5 rounded-xl"
                      >
                        <CheckCircle2 className="size-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{kc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Math / Physics Deep Dive (shown for Astronomer or when available) */}
              {activeSublesson.mathOrPhysicsDeepDive && (
                <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-5 space-y-2">
                  <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider block">
                    Astrophysics Deep Dive: {activeSublesson.mathOrPhysicsDeepDive.title}
                  </span>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {activeSublesson.mathOrPhysicsDeepDive.description}
                  </p>
                  {activeSublesson.mathOrPhysicsDeepDive.formula && (
                    <div className="mt-2 font-mono text-xs sm:text-sm bg-slate-950/80 border border-indigo-500/30 p-3 rounded-xl text-cyan-300 text-center">
                      <code>{activeSublesson.mathOrPhysicsDeepDive.formula}</code>
                    </div>
                  )}
                </div>
              )}

              {/* Did You Know & Observational Link Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="rounded-2xl border border-amber-500/20 bg-amber-950/20 p-4">
                  <span className="font-bold text-amber-300 uppercase tracking-wider block mb-1">
                    Did You Know?
                  </span>
                  <p className="text-slate-200 leading-relaxed">{activeSublesson.didYouKnow}</p>
                </div>

                <div className="rounded-2xl border border-cyan-500/20 bg-cyan-950/20 p-4">
                  <span className="font-bold text-cyan-300 uppercase tracking-wider block mb-1">
                    Observational Connection
                  </span>
                  <p className="text-slate-200 leading-relaxed">
                    {activeSublesson.observationalFocus}
                  </p>
                </div>
              </div>

              {/* Research Links */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href={activeSublesson.nasaSourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-cyan-300 hover:text-cyan-200 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <span>NASA Research Dossier</span>
                  <ExternalLink className="size-3" />
                </a>
                <a
                  href={activeSublesson.wikiSourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <span>Wikipedia Encyclopedia Article</span>
                  <ExternalLink className="size-3" />
                </a>
              </div>
            </div>
          </section>

          {/* Honest Development Status Callout (Requirement 13) */}
          <div className="rounded-3xl border border-dashed border-cyan-500/30 bg-slate-900/30 p-6 backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-full font-semibold">
                    🔭 In Active Development
                  </span>
                  <span className="text-xs text-slate-400">Subchapter 13.7 Simulation Sandbox</span>
                </div>
                <h4 className="text-base font-bold text-white">
                  Interactive 3D N-Body Galaxy Collision Simulator
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
                  Our astrophysics simulation engine is currently implementing a multi-threaded
                  Barnes-Hut octree numerical solver to model tidal tail ejection and dynamical
                  friction in real time. The core theoretical chapters, Hubble tuning fork
                  classifications, and 3D catalog galaxy models above are fully operational.
                </p>
              </div>
              <span className="text-xs font-mono text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg shrink-0">
                Syllabus & Math Model Ready
              </span>
            </div>
          </div>

          {/* Step F: Knowledge Check & Quizzes (Requirement 7) */}
          <section className="space-y-4 pt-4">
            <KnowledgeCheck
              quizId="module_13_quiz"
              questions={quizQuestions}
              onCompleteQuiz={handleQuizCompletion}
            />
          </section>

          {/* Post-Completion & Recommended Next Module (Requirement 11) */}
          <div className="rounded-3xl border border-indigo-500/40 bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900/80 p-6 sm:p-8 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl shadow-indigo-950/20">
            <div className="flex items-start gap-4">
              <div className="size-12 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center justify-center shrink-0">
                <Orbit className="size-6 text-indigo-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-0.5 rounded-full uppercase">
                    Stage 4 Next Destination
                  </span>
                  <span className="text-xs text-amber-300 font-semibold">Recommended Next</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                  Module {NEXT_RECOMMENDED_MODULE.id}: {NEXT_RECOMMENDED_MODULE.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  {NEXT_RECOMMENDED_MODULE.reason}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Button
                asChild
                size="lg"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-600/30"
              >
                <Link to="/learn" search={{ module: "14" }}>
                  <span>Preview Module 14 Syllabus</span>
                  <ArrowRight className="size-4 ml-2" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white/10 text-white hover:bg-white/5"
              >
                <Link to="/learn">Return to Academy Map</Link>
              </Button>
            </div>
          </div>

          {/* Primary Grounding Sources */}
          <div className="rounded-2xl border border-white/5 bg-slate-950/60 p-5 text-xs text-slate-400 space-y-2">
            <span className="font-bold uppercase tracking-wider text-slate-300 block">
              Official NASA & IAU Scientific Grounding Archives:
            </span>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {MODULE_13_SOURCES.map((src, i) => (
                <a
                  key={i}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 underline"
                >
                  <span>{src.title}</span>
                  <ExternalLink className="size-2.5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
