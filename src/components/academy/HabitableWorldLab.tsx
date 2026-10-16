import React, { useState, useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import type { LearningLevel } from "@/lib/academy/types";
import {
  PLANET_PRESETS,
  SEARCH_FOR_LIFE_CASES,
  type PlanetPreset,
  type SearchForLifeCase,
} from "@/lib/academy/lessons/module-23-astrobiology";
import {
  Globe,
  Sun,
  Flame,
  Droplets,
  Wind,
  ShieldAlert,
  Compass,
  Sparkles,
  Info,
  Layers,
  Search,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCw,
  Orbit,
  ArrowRight,
  ChevronRight,
  Maximize2,
  Atom,
  Thermometer,
  Dna,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface HabitableWorldLabProps {
  currentLevel: LearningLevel;
  onInteract?: () => void;
}

export function HabitableWorldLab({ currentLevel, onInteract }: HabitableWorldLabProps) {
  // Top-level tab: "designer" | "ocean_worlds" | "search_game"
  const [activeTab, setActiveTab] = useState<"designer" | "ocean_worlds" | "search_game">(
    "designer",
  );

  // Selected preset or custom
  const [selectedPresetId, setSelectedPresetId] = useState<string>("earth");

  // Custom planet controls
  const [starType, setStarType] = useState<"M" | "K" | "G" | "F" | "A">("G");
  const [orbitalDistanceAU, setOrbitalDistanceAU] = useState<number>(1.0);
  const [planetRadiusEarth, setPlanetRadiusEarth] = useState<number>(1.0);
  const [surfacePressureAtm, setSurfacePressureAtm] = useState<number>(1.0);
  const [albedo, setAlbedo] = useState<number>(0.3);
  const [greenhouseGasFraction, setGreenhouseGasFraction] = useState<number>(0.15);
  const [waterFraction, setWaterFraction] = useState<number>(0.71);
  const [tidalHeatingWatts, setTidalHeatingWatts] = useState<number>(0.08);

  // Ocean worlds / Mars sub-selection
  const [selectedExploratoryWorld, setSelectedExploratoryWorld] = useState<
    "mars" | "europa" | "enceladus"
  >("europa");
  const [showEuropaCrossSection, setShowEuropaCrossSection] = useState<boolean>(false);

  // Search for Life Game state
  const [activeCaseIndex, setActiveCaseIndex] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [caseResults, setCaseResults] = useState<{
    [caseId: string]: { optionId: string; isCorrect: boolean };
  }>({});
  const [showDebrief, setShowDebrief] = useState<boolean>(false);

  // Three.js canvas container ref
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const planetMeshRef = useRef<THREE.Mesh | null>(null);
  const cloudsMeshRef = useRef<THREE.Mesh | null>(null);
  const atmosphereGlowMeshRef = useRef<THREE.Mesh | null>(null);
  const hostStarMeshRef = useRef<THREE.Mesh | null>(null);
  const cutawayGroupRef = useRef<THREE.Group | null>(null);
  const plumesGroupRef = useRef<THREE.Group | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const previousMousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rotationVelocityRef = useRef<{ x: number; y: number }>({ x: 0, y: 0.002 });

  // Star physical properties lookup
  const STAR_PROPERTIES = useMemo(() => {
    return {
      M: {
        name: "M-Dwarf (Red Dwarf)",
        tempK: 3100,
        radiusSun: 0.25,
        luminositySun: 0.008,
        colorHex: 0xff6b4a,
        habitabilityLimitAU: [0.03, 0.2],
      },
      K: {
        name: "K-Dwarf (Orange Dwarf)",
        tempK: 4500,
        radiusSun: 0.7,
        luminositySun: 0.2,
        colorHex: 0xffaa5e,
        habitabilityLimitAU: [0.35, 0.85],
      },
      G: {
        name: "G-Type (Sun-like Yellow)",
        tempK: 5778,
        radiusSun: 1.0,
        luminositySun: 1.0,
        colorHex: 0xfffae0,
        habitabilityLimitAU: [0.95, 1.67],
      },
      F: {
        name: "F-Type (Yellow-White)",
        tempK: 6800,
        radiusSun: 1.3,
        luminositySun: 2.5,
        colorHex: 0xf5f7ff,
        habitabilityLimitAU: [1.3, 2.3],
      },
      A: {
        name: "A-Type (Brilliant Blue-White)",
        tempK: 8500,
        radiusSun: 1.7,
        luminositySun: 20.0,
        colorHex: 0xc8ddff,
        habitabilityLimitAU: [2.5, 4.8],
      },
    };
  }, []);

  // Physical calculations based on user controls
  const physicalCalculations = useMemo(() => {
    const star = STAR_PROPERTIES[starType];
    // Insolation S relative to Earth's flux (S_earth = 1.0)
    // S = L_star / a^2
    const insolationRelative = star.luminositySun / Math.max(0.001, Math.pow(orbitalDistanceAU, 2));
    const solarFluxWm2 = insolationRelative * 1361; // W/m^2

    // Equilibrium temperature: T_eq = [ (S * (1 - A)) / (4 * sigma) ]^0.25
    // sigma = 5.670374e-8 W/m^2 K^4
    const sigma = 5.670374e-8;
    const tEqKelvin = Math.pow((solarFluxWm2 * (1 - albedo)) / (4 * sigma), 0.25);

    // Greenhouse warming: delta_T depends on atmosphere pressure (atm) and greenhouse gas abundance
    // Earth's natural greenhouse is ~33 K at 1 atm with ~0.15 greenhouse gas fraction
    let greenhouseDeltaT = 0;
    if (surfacePressureAtm > 0.0001) {
      greenhouseDeltaT =
        33 * Math.pow(surfacePressureAtm, 0.35) * Math.pow(greenhouseGasFraction / 0.15, 0.5);
      // For runaway greenhouse (Venus analog)
      if (surfacePressureAtm > 50 && greenhouseGasFraction > 0.8) {
        greenhouseDeltaT = Math.min(500, greenhouseDeltaT * 1.5);
      }
    }

    // Tidal / geothermal internal heating addition to surface or subsurface
    const internalThermalBonusKelvin = Math.min(60, tidalHeatingWatts * 80);

    const surfaceTempKelvin = Math.max(10, Math.round(tEqKelvin + greenhouseDeltaT));
    const surfaceTempCelsius = Math.round(surfaceTempKelvin - 273.15);

    // Liquid water phase evaluation
    // Triple point of water: 273.16 K (0.01 °C) at 0.006 atm (6.11 mbar)
    // Boiling point varies with pressure: approx T_boil ≈ 373.15 * (P^0.09) K
    const boilingTempKelvin = 373.15 * Math.pow(Math.max(0.006, surfacePressureAtm), 0.088);
    const freezingTempKelvin = 273.15;

    let waterPhase:
      | "Solid Ice (Glaciated)"
      | "Stable Liquid Water Ocean"
      | "Superheated Steam / Vapor"
      | "Sublimating Ice / No Liquid (Pressure Too Low)";
    let waterPresenceDescription = "";

    if (surfacePressureAtm < 0.006) {
      waterPhase = "Sublimating Ice / No Liquid (Pressure Too Low)";
      waterPresenceDescription =
        "Atmospheric pressure is below water's triple point (6.11 mbar). Liquid water cannot persist stably; water exists purely as ice or sublimates directly into gas (like present-day Mars).";
    } else if (surfaceTempKelvin < freezingTempKelvin) {
      if (tidalHeatingWatts > 0.12 && waterFraction > 0.4) {
        waterPhase = "Solid Ice (Glaciated)";
        waterPresenceDescription =
          "Surface is frozen into an ice shell, but strong tidal/geothermal heating sustains a deep, shielded subsurface global ocean beneath the ice (like Europa or Enceladus)!";
      } else {
        waterPhase = "Solid Ice (Glaciated)";
        waterPresenceDescription =
          "Surface is locked in a cryogenic ice desert or global 'Snowball' glaciation. Liquid water cannot persist on the frozen surface without internal heating.";
      }
    } else if (surfaceTempKelvin <= boilingTempKelvin) {
      waterPhase = "Stable Liquid Water Ocean";
      waterPresenceDescription =
        "Surface temperatures and atmospheric pressure allow vast liquid water oceans, lakes, and active hydrological precipitation cycles.";
    } else {
      waterPhase = "Superheated Steam / Vapor";
      waterPresenceDescription =
        "Extreme temperatures drive water into a runaway greenhouse state, completely boiling oceans into atmospheric steam subject to UV photolysis and hydrogen escape.";
    }

    // Habitable zone status
    const [hzInner, hzOuter] = star.habitabilityLimitAU;
    const isInsideHZ = orbitalDistanceAU >= hzInner && orbitalDistanceAU <= hzOuter;

    // Tidal locking check (around M-dwarf with a < 0.1 AU)
    const isTidallyLocked = starType === "M" && orbitalDistanceAU < 0.08;

    // Atmospheric escape velocity: v_esc = sqrt(2 * G * M / R)
    // Relative to Earth: v_esc_rel = sqrt(M_earth / R_earth)
    const escapeVelocityKms =
      11.186 *
      Math.sqrt(
        Math.max(0.01, planetRadiusEarth * planetRadiusEarth * planetRadiusEarth) /
          Math.max(0.1, planetRadiusEarth),
      );

    // Habitability Assessment
    let habitabilityVerdict: {
      category: string;
      badgeColor: string;
      summary: string;
    };

    if (
      waterPhase === "Stable Liquid Water Ocean" &&
      isInsideHZ &&
      surfacePressureAtm >= 0.5 &&
      surfacePressureAtm <= 5.0
    ) {
      habitabilityVerdict = {
        category: "Habitable-Zone Terrestrial Ocean World",
        badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
        summary:
          "Meets key physical prerequisites: stable liquid surface water, balanced atmospheric pressure, and stellar insolation within the circumstellar habitable zone.",
      };
    } else if (
      tidalHeatingWatts >= 0.12 &&
      waterFraction >= 0.5 &&
      surfaceTempKelvin < freezingTempKelvin
    ) {
      habitabilityVerdict = {
        category: "Subsurface Ocean World (Europa/Enceladus Analogue)",
        badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
        summary:
          "Surface is cryogenic ice, but powerful internal tidal friction maintains a warm, long-lived subsurface liquid water ocean in direct contact with mineral-rich rock.",
      };
    } else if (
      surfaceTempKelvin > boilingTempKelvin ||
      (surfacePressureAtm > 30 && greenhouseGasFraction > 0.5)
    ) {
      habitabilityVerdict = {
        category: "Runaway Greenhouse Hellscape (Venus Analogue)",
        badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/40",
        summary:
          "Uncontrolled greenhouse heating has vaporized volatile reservoirs, resulting in extreme surface temperatures hostile to organic cellular structures.",
      };
    } else if (surfacePressureAtm < 0.006) {
      habitabilityVerdict = {
        category: "Hyper-Arid Cold Vacuum / Desert (Mars Analogue)",
        badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
        summary:
          "Atmosphere is too thin to support liquid water; any exposed ice sublimates directly into gas. Requires subterranean or brine shelters for any potential biology.",
      };
    } else if (surfaceTempKelvin < freezingTempKelvin) {
      habitabilityVerdict = {
        category: "Cryogenic Snowball World",
        badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
        summary:
          "Global runaway glaciation has locked the surface in ice. Lacks sufficient tidal heating for sustained subsurface oceans.",
      };
    } else {
      habitabilityVerdict = {
        category: "Extreme Environment World",
        badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
        summary:
          "Exhibits complex physical parameters requiring specialized photochemical or geochemical analysis.",
      };
    }

    return {
      star,
      insolationRelative,
      solarFluxWm2,
      tEqKelvin,
      greenhouseDeltaT,
      surfaceTempKelvin,
      surfaceTempCelsius,
      waterPhase,
      waterPresenceDescription,
      isInsideHZ,
      hzInner,
      hzOuter,
      isTidallyLocked,
      escapeVelocityKms,
      habitabilityVerdict,
    };
  }, [
    starType,
    orbitalDistanceAU,
    planetRadiusEarth,
    surfacePressureAtm,
    albedo,
    greenhouseGasFraction,
    waterFraction,
    tidalHeatingWatts,
    STAR_PROPERTIES,
  ]);

  // Handle Preset selection
  const handleSelectPreset = (preset: PlanetPreset) => {
    setSelectedPresetId(preset.id);
    setStarType(preset.starType);
    setOrbitalDistanceAU(preset.orbitalDistanceAU);
    setPlanetRadiusEarth(preset.planetRadiusEarth);
    setSurfacePressureAtm(preset.surfacePressureAtm);
    setAlbedo(preset.albedo);
    setGreenhouseGasFraction(preset.greenhouseGasFraction);
    setWaterFraction(preset.waterFraction);
    setTidalHeatingWatts(preset.tidalHeatingWatts);
    if (onInteract) onInteract();
  };

  // Setup Three.js 3D Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Clear previous
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 480;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x030712); // slate-950

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.8, 3.8);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.15);
    scene.add(ambientLight);

    // Star light (Directional light from front-left)
    const starLight = new THREE.DirectionalLight(0xffffff, 2.5);
    starLight.position.set(5, 2, 4);
    scene.add(starLight);

    // Subtle rim light
    const rimLight = new THREE.DirectionalLight(0x4466aa, 0.6);
    rimLight.position.set(-5, -2, -3);
    scene.add(rimLight);

    // Stars background particles
    const starCount = 600;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 50;
      starPositions[i + 1] = (Math.random() - 0.5) * 50;
      starPositions[i + 2] = (Math.random() - 0.5) * 50 - 10;
    }
    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.12,
      transparent: true,
      opacity: 0.8,
    });
    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // Host Star sphere in distant background
    const hostStarGeo = new THREE.SphereGeometry(0.8, 32, 32);
    const hostStarMat = new THREE.MeshBasicMaterial({ color: 0xfffae0 });
    const hostStarMesh = new THREE.Mesh(hostStarGeo, hostStarMat);
    hostStarMesh.position.set(12, 5, -15);
    scene.add(hostStarMesh);
    hostStarMeshRef.current = hostStarMesh;

    // Group for planet and atmosphere
    const planetGroup = new THREE.Group();
    scene.add(planetGroup);

    // Planet Mesh
    const planetGeo = new THREE.SphereGeometry(1.0, 64, 64);
    const planetMat = new THREE.MeshStandardMaterial({
      roughness: 0.7,
      metalness: 0.1,
    });
    const planetMesh = new THREE.Mesh(planetGeo, planetMat);
    planetGroup.add(planetMesh);
    planetMeshRef.current = planetMesh;

    // Cloud layer
    const cloudsGeo = new THREE.SphereGeometry(1.015, 64, 64);
    const cloudsMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.35,
      blending: THREE.NormalBlending,
      roughness: 0.9,
    });
    const cloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat);
    planetGroup.add(cloudsMesh);
    cloudsMeshRef.current = cloudsMesh;

    // Atmosphere Glow Fresnel shell
    const glowGeo = new THREE.SphereGeometry(1.05, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x4da6ff,
      transparent: true,
      opacity: 0.18,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    planetGroup.add(glowMesh);
    atmosphereGlowMeshRef.current = glowMesh;

    // Cutaway group for Europa cross-section
    const cutawayGroup = new THREE.Group();
    cutawayGroup.visible = false;
    scene.add(cutawayGroup);
    cutawayGroupRef.current = cutawayGroup;

    // Core, Mantle, Subsurface ocean, Ice crust cutaway rings
    const coreGeo = new THREE.SphereGeometry(0.4, 32, 32);
    const coreMat = new THREE.MeshStandardMaterial({ color: 0x994422, roughness: 0.5 });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    cutawayGroup.add(coreMesh);

    const mantleGeo = new THREE.SphereGeometry(0.7, 32, 32);
    const mantleMat = new THREE.MeshStandardMaterial({ color: 0x555544, wireframe: true });
    const mantleMesh = new THREE.Mesh(mantleGeo, mantleMat);
    cutawayGroup.add(mantleMesh);

    const oceanGeo = new THREE.SphereGeometry(0.92, 32, 32);
    const oceanMat = new THREE.MeshStandardMaterial({
      color: 0x0066cc,
      transparent: true,
      opacity: 0.65,
    });
    const oceanMesh = new THREE.Mesh(oceanGeo, oceanMat);
    cutawayGroup.add(oceanMesh);

    const iceCrustGeo = new THREE.SphereGeometry(1.0, 32, 32);
    const iceCrustMat = new THREE.MeshStandardMaterial({
      color: 0xddeeff,
      transparent: true,
      opacity: 0.45,
      wireframe: true,
    });
    const iceCrustMesh = new THREE.Mesh(iceCrustGeo, iceCrustMat);
    cutawayGroup.add(iceCrustMesh);

    // Enceladus Plumes Group
    const plumesGroup = new THREE.Group();
    plumesGroup.visible = false;
    scene.add(plumesGroup);
    plumesGroupRef.current = plumesGroup;

    for (let p = 0; p < 8; p++) {
      const plumeGeo = new THREE.ConeGeometry(0.08, 0.45, 16);
      const plumeMat = new THREE.MeshBasicMaterial({
        color: 0xddf0ff,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending,
      });
      const plume = new THREE.Mesh(plumeGeo, plumeMat);
      const angle = (p / 8) * Math.PI * 0.5 - Math.PI * 0.25;
      plume.position.set(Math.sin(angle) * 0.3, -0.98, Math.cos(angle) * 0.3);
      plume.rotation.x = Math.PI;
      plumesGroup.add(plume);
    }

    // Mouse drag controls
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      planetGroup.rotation.y += deltaX * 0.008;
      planetGroup.rotation.x += deltaY * 0.008;
      if (cutawayGroup) {
        cutawayGroup.rotation.y += deltaX * 0.008;
        cutawayGroup.rotation.x += deltaY * 0.008;
      }
      if (plumesGroup) {
        plumesGroup.rotation.y += deltaX * 0.008;
        plumesGroup.rotation.x += deltaY * 0.008;
      }

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    // Touch controls for mobile
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - previousMousePositionRef.current.x;
      const deltaY = e.touches[0].clientY - previousMousePositionRef.current.y;
      planetGroup.rotation.y += deltaX * 0.008;
      planetGroup.rotation.x += deltaY * 0.008;
      previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onTouchEnd = () => {
      isDraggingRef.current = false;
    };
    domElement.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      clock.getDelta();

      // Continuous gentle planetary spin
      if (!isDraggingRef.current) {
        planetGroup.rotation.y += rotationVelocityRef.current.y;
        cloudsMesh.rotation.y += 0.0028;
      }

      // Animate Enceladus plumes pulsing
      if (plumesGroup.visible) {
        const pulse = 1 + Math.sin(clock.getElapsedTime() * 4) * 0.15;
        plumesGroup.scale.set(pulse, pulse, pulse);
      }

      renderer.render(scene, camera);
    };

    animate();

    // Window resize handler
    const handleResize = () => {
      if (!container || !rendererRef.current) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(newWidth, newHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      domElement.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      domElement.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);

      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.dispose();
      }
      starGeometry.dispose();
      starMaterial.dispose();
      planetGeo.dispose();
      cloudsGeo.dispose();
      glowGeo.dispose();
    };
  }, []);

  // Update 3D Visuals when properties change
  useEffect(() => {
    if (
      !planetMeshRef.current ||
      !cloudsMeshRef.current ||
      !atmosphereGlowMeshRef.current ||
      !hostStarMeshRef.current
    )
      return;

    const star = STAR_PROPERTIES[starType];
    const { surfaceTempKelvin, waterPhase } = physicalCalculations;

    // Update Host star color and scale in background
    (hostStarMeshRef.current.material as THREE.MeshBasicMaterial).color.setHex(star.colorHex);
    const starScale = Math.max(0.4, star.radiusSun * 0.9);
    hostStarMeshRef.current.scale.set(starScale, starScale, starScale);

    // If viewing Ocean Worlds sub-mode
    if (activeTab === "ocean_worlds") {
      if (cutawayGroupRef.current) {
        cutawayGroupRef.current.visible =
          selectedExploratoryWorld === "europa" && showEuropaCrossSection;
      }
      if (plumesGroupRef.current) {
        plumesGroupRef.current.visible = selectedExploratoryWorld === "enceladus";
      }

      const pMat = planetMeshRef.current.material as THREE.MeshStandardMaterial;
      const cMat = cloudsMeshRef.current.material as THREE.MeshStandardMaterial;
      const gMat = atmosphereGlowMeshRef.current.material as THREE.MeshBasicMaterial;

      if (selectedExploratoryWorld === "mars") {
        pMat.color.setHex(0xb84f28); // Martian iron oxide rust red
        cMat.opacity = 0.08;
        gMat.color.setHex(0xd47559);
        gMat.opacity = 0.08;
      } else if (selectedExploratoryWorld === "europa") {
        pMat.color.setHex(0xe8eef5); // Bright icy cracked surface
        cMat.opacity = 0.02;
        gMat.color.setHex(0x70b0ff);
        gMat.opacity = 0.05;
      } else if (selectedExploratoryWorld === "enceladus") {
        pMat.color.setHex(0xf8fafc); // Pristine reflective ice
        cMat.opacity = 0.0;
        gMat.color.setHex(0x99ccff);
        gMat.opacity = 0.08;
      }
      return;
    }

    // Default Custom Planet Mode Visuals
    if (cutawayGroupRef.current) cutawayGroupRef.current.visible = false;
    if (plumesGroupRef.current) plumesGroupRef.current.visible = false;

    const pMat = planetMeshRef.current.material as THREE.MeshStandardMaterial;
    const cMat = cloudsMeshRef.current.material as THREE.MeshStandardMaterial;
    const gMat = atmosphereGlowMeshRef.current.material as THREE.MeshBasicMaterial;

    // Planet surface coloration based on water fraction and temperature
    if (waterPhase === "Solid Ice (Glaciated)") {
      pMat.color.setHex(0xe6f2ff); // Snowball ice white-blue
      cMat.opacity = 0.2;
    } else if (waterPhase === "Superheated Steam / Vapor" || surfaceTempKelvin > 450) {
      pMat.color.setHex(0xc27a38); // Scorched Venusian sulfur orange-brown
      cMat.opacity = 0.85; // Dense opaque greenhouse clouds
    } else if (surfacePressureAtm < 0.006) {
      pMat.color.setHex(0xb35a39); // Mars-like red dust
      cMat.opacity = 0.04;
    } else if (waterFraction > 0.85) {
      pMat.color.setHex(0x0e5299); // Deep ocean water world blue
      cMat.opacity = 0.45;
    } else if (waterFraction < 0.15) {
      pMat.color.setHex(0xcc9944); // Dune desert amber
      cMat.opacity = 0.15;
    } else {
      // Balanced Earth-like surface (Ocean blue + Continental Green)
      pMat.color.setHex(0x1a6655);
      cMat.opacity = 0.4;
    }

    // Atmosphere glow coloring based on composition and pressure
    if (surfacePressureAtm < 0.01) {
      gMat.opacity = 0.03;
    } else if (greenhouseGasFraction > 0.6) {
      gMat.color.setHex(0xffaa44); // Titan / Venus hazy greenhouse
      gMat.opacity = 0.35;
    } else {
      gMat.color.setHex(0x4da6ff); // Nitrogen-Oxygen Rayleigh scatter blue
      gMat.opacity = Math.min(0.4, 0.15 + surfacePressureAtm * 0.1);
    }
  }, [
    starType,
    activeTab,
    selectedExploratoryWorld,
    showEuropaCrossSection,
    physicalCalculations,
    STAR_PROPERTIES,
    waterFraction,
    surfacePressureAtm,
    greenhouseGasFraction,
  ]);

  // Handle Search for Life Game response
  const currentCase: SearchForLifeCase = SEARCH_FOR_LIFE_CASES[activeCaseIndex];

  const handleSelectCaseOption = (optionId: string) => {
    setSelectedOptionId(optionId);
    setShowDebrief(true);
    const selected = currentCase.options.find((o) => o.id === optionId);
    if (selected) {
      setCaseResults((prev) => ({
        ...prev,
        [currentCase.id]: { optionId, isCorrect: selected.isCorrect },
      }));
    }
    if (onInteract) onInteract();
  };

  const handleNextCase = () => {
    setSelectedOptionId(null);
    setShowDebrief(false);
    if (activeCaseIndex < SEARCH_FOR_LIFE_CASES.length - 1) {
      setActiveCaseIndex((prev) => prev + 1);
    } else {
      setActiveCaseIndex(0);
    }
  };

  const totalGameCompleted = Object.keys(caseResults).length;
  const totalCorrectCases = Object.values(caseResults).filter((r) => r.isCorrect).length;

  return (
    <div className="space-y-6">
      {/* 1. Sub-navigation tabs: 3D Planet Designer, Solar System Ocean Worlds, Search for Life Game */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-white/10 p-2 rounded-xl backdrop-blur-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <Button
            variant={activeTab === "designer" ? "default" : "ghost"}
            size="sm"
            onClick={() => {
              setActiveTab("designer");
              if (onInteract) onInteract();
            }}
            className={
              activeTab === "designer"
                ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                : "text-slate-400 hover:text-white"
            }
          >
            <Globe className="size-4 mr-2 text-emerald-400" />
            3D Habitable World Designer
          </Button>
          <Button
            variant={activeTab === "ocean_worlds" ? "default" : "ghost"}
            size="sm"
            onClick={() => {
              setActiveTab("ocean_worlds");
              if (onInteract) onInteract();
            }}
            className={
              activeTab === "ocean_worlds"
                ? "bg-blue-600 hover:bg-blue-500 text-white"
                : "text-slate-400 hover:text-white"
            }
          >
            <Droplets className="size-4 mr-2 text-blue-400" />
            Ocean Worlds & Mars Explorer
          </Button>
          <Button
            variant={activeTab === "search_game" ? "default" : "ghost"}
            size="sm"
            onClick={() => {
              setActiveTab("search_game");
              if (onInteract) onInteract();
            }}
            className={
              activeTab === "search_game"
                ? "bg-amber-600 hover:bg-amber-500 text-white"
                : "text-slate-400 hover:text-white"
            }
          >
            <Search className="size-4 mr-2 text-amber-400" />
            Game: Search for Life ({totalCorrectCases}/{SEARCH_FOR_LIFE_CASES.length})
          </Button>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 px-3">
          <Sparkles className="size-3.5 text-emerald-400 animate-pulse" />
          <span>Interactive 3D Simulation</span>
        </div>
      </div>

      {/* 2. Main Simulation Layout */}
      {activeTab === "designer" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: 3D Canvas Viewport (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            <div className="relative w-full aspect-video sm:aspect-square max-h-[520px] bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center">
              {/* Three.js Container */}
              <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

              {/* Viewport Overlay Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${physicalCalculations.habitabilityVerdict.badgeColor} backdrop-blur-md`}
                >
                  {physicalCalculations.habitabilityVerdict.category}
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono text-slate-300 bg-black/60 border border-white/10 backdrop-blur-sm">
                  Star: {physicalCalculations.star.name}
                </span>
              </div>

              {/* Live Physical Readout HUD */}
              <div className="absolute bottom-4 left-4 right-4 grid grid-cols-2 sm:grid-cols-4 gap-2 pointer-events-none">
                <div className="p-2.5 rounded-lg bg-black/75 border border-white/10 backdrop-blur-md">
                  <div className="text-[10px] uppercase font-mono text-slate-400 flex items-center gap-1">
                    <Thermometer className="size-3 text-rose-400" />
                    Surf. Temp
                  </div>
                  <div className="text-base font-bold font-mono text-white">
                    {physicalCalculations.surfaceTempCelsius}°C
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {physicalCalculations.surfaceTempKelvin} K (ΔT: +
                    {Math.round(physicalCalculations.greenhouseDeltaT)}K)
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-black/75 border border-white/10 backdrop-blur-md">
                  <div className="text-[10px] uppercase font-mono text-slate-400 flex items-center gap-1">
                    <Sun className="size-3 text-amber-400" />
                    Insolation (S)
                  </div>
                  <div className="text-base font-bold font-mono text-amber-300">
                    {physicalCalculations.insolationRelative.toFixed(2)}x
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {Math.round(physicalCalculations.solarFluxWm2)} W/m²
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-black/75 border border-white/10 backdrop-blur-md">
                  <div className="text-[10px] uppercase font-mono text-slate-400 flex items-center gap-1">
                    <Droplets className="size-3 text-blue-400" />
                    Water Phase
                  </div>
                  <div className="text-xs font-semibold text-blue-300 truncate">
                    {physicalCalculations.waterPhase.split(" ")[0]}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {surfacePressureAtm >= 0.006 ? "Above Triple Pt" : "Below Triple Pt"}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-black/75 border border-white/10 backdrop-blur-md">
                  <div className="text-[10px] uppercase font-mono text-slate-400 flex items-center gap-1">
                    <Orbit className="size-3 text-emerald-400" />
                    Habitable Zone
                  </div>
                  <div
                    className={`text-xs font-bold ${physicalCalculations.isInsideHZ ? "text-emerald-400" : "text-slate-400"}`}
                  >
                    {physicalCalculations.isInsideHZ ? "INSIDE ZONE" : "OUTSIDE ZONE"}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {physicalCalculations.hzInner.toFixed(2)}–
                    {physicalCalculations.hzOuter.toFixed(2)} AU
                  </div>
                </div>
              </div>

              {/* Rotation Helper Prompt */}
              <div className="absolute top-4 right-4 px-2 py-1 rounded bg-black/60 border border-white/10 text-[10px] text-slate-400 flex items-center gap-1.5 pointer-events-none">
                <RotateCw
                  className="size-3 animate-spin text-slate-400"
                  style={{ animationDuration: "12s" }}
                />
                <span>Drag to Rotate Globe</span>
              </div>
            </div>

            {/* Scientific Habitability Boundary Disclaimer */}
            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-200/90 text-xs leading-relaxed flex items-start gap-3">
              <ShieldAlert className="size-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-300 font-semibold uppercase tracking-wide block mb-1">
                  Scientific Axiom: Habitability is Not Inhabited
                </strong>
                Do not treat a simplistic habitability score as proof that a world can sustain or
                has created life. Habitability merely indicates conditions where a liquid solvent
                (like water) might physically persist. The leap from prebiotic chemistry to
                self-sustaining Darwinian life (abiogenesis) requires specific thermodynamic,
                catalytic, and organic conditions that remain active areas of research.
              </div>
            </div>
          </div>

          {/* Right Column: Planetary Architecture Controls (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            {/* Presets Bar */}
            <div className="bg-slate-900/90 border border-white/10 p-4 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-mono uppercase text-slate-400 flex items-center gap-1.5">
                  <Layers className="size-3.5 text-blue-400" />
                  Planetary Archetype Presets
                </label>
                <span className="text-[11px] text-slate-500">Pick to Load</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PLANET_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-2 rounded-lg text-left text-xs border transition-all ${
                      selectedPresetId === preset.id
                        ? "bg-blue-600/20 border-blue-500 text-white font-medium"
                        : "bg-slate-800/50 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                    }`}
                  >
                    <div className="truncate font-semibold text-slate-200">
                      {preset.name.split(" ")[0]}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {preset.starType}-Star • {preset.orbitalDistanceAU} AU
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Physical Sliders */}
            <div className="bg-slate-900/90 border border-white/10 p-5 rounded-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-xs font-mono uppercase text-emerald-400 flex items-center gap-1.5">
                  <Atom className="size-3.5" />
                  Astrophysical Parameters
                </span>
                <span className="text-xs text-slate-400 font-mono">{starType}-Dwarf System</span>
              </div>

              {/* 1. Host Star Type Selector */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium flex items-center gap-1.5">
                    <Sun className="size-3.5 text-amber-400" />
                    Host Star Spectral Class
                  </span>
                  <span className="font-mono text-amber-400">{STAR_PROPERTIES[starType].name}</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {(["M", "K", "G", "F", "A"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setStarType(s);
                        setSelectedPresetId("custom");
                        if (onInteract) onInteract();
                      }}
                      className={`py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
                        starType === s
                          ? "bg-amber-500/20 border-amber-400 text-amber-200"
                          : "bg-slate-800/60 border-white/5 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500">
                  {starType === "M" &&
                    "Cool Red Dwarf (3,100 K): Abundant, long-lived (~trillions yrs), but young stars flare violently and planets tidally lock."}
                  {starType === "K" &&
                    "Orange Dwarf (4,500 K): Astrobiologists' sweet spot! Long-lived (30-70 Gyr), low flare rate, wide habitable zone."}
                  {starType === "G" &&
                    "Yellow Dwarf (5,778 K): Sun-like, stable for 10 Gyr, supports Earth's thriving carbon-water biosphere."}
                  {starType === "F" &&
                    "Yellow-White (6,800 K): Brighter, wider habitable zone, lifetime ~3-4 billion years."}
                  {starType === "A" &&
                    "Blue-White (8,500 K): Intense UV radiation, lifetimes under 1.5 billion years, difficult for complex evolution."}
                </p>
              </div>

              {/* 2. Semi-Major Axis / Orbital Distance (AU) */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Orbital Distance (Semi-Major Axis)</span>
                  <span className="font-mono text-emerald-400">
                    {orbitalDistanceAU.toFixed(2)} AU
                  </span>
                </div>
                <input
                  type="range"
                  min="0.03"
                  max="4.0"
                  step="0.02"
                  value={orbitalDistanceAU}
                  onChange={(e) => {
                    setOrbitalDistanceAU(parseFloat(e.target.value));
                    setSelectedPresetId("custom");
                    if (onInteract) onInteract();
                  }}
                  className="w-full accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0.03 AU (Ultra-Close)</span>
                  <span className="text-emerald-500/80">
                    HZ: {physicalCalculations.hzInner.toFixed(2)}–
                    {physicalCalculations.hzOuter.toFixed(2)} AU
                  </span>
                  <span>4.0 AU (Outer Fringe)</span>
                </div>
              </div>

              {/* 3. Surface Atmospheric Pressure (atm) */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <Wind className="size-3.5 text-blue-400" />
                    Atmospheric Surface Pressure
                  </span>
                  <span className="font-mono text-blue-400">
                    {surfacePressureAtm < 0.01
                      ? `${(surfacePressureAtm * 1013).toFixed(1)} mbar`
                      : `${surfacePressureAtm.toFixed(2)} atm`}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.001"
                  max="10.0"
                  step="0.05"
                  value={surfacePressureAtm}
                  onChange={(e) => {
                    setSurfacePressureAtm(parseFloat(e.target.value));
                    setSelectedPresetId("custom");
                    if (onInteract) onInteract();
                  }}
                  className="w-full accent-blue-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>&lt;0.01 atm (Mars/Vacuum)</span>
                  <span>1.0 atm (Earth)</span>
                  <span>10.0 atm (Dense Super-Earth)</span>
                </div>
              </div>

              {/* 4. Greenhouse Gas Fraction */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <Flame className="size-3.5 text-rose-400" />
                    Greenhouse Gas Abundance (CO₂, CH₄, H₂O)
                  </span>
                  <span className="font-mono text-rose-400">
                    {(greenhouseGasFraction * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.02"
                  value={greenhouseGasFraction}
                  onChange={(e) => {
                    setGreenhouseGasFraction(parseFloat(e.target.value));
                    setSelectedPresetId("custom");
                    if (onInteract) onInteract();
                  }}
                  className="w-full accent-rose-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0% (Transparent)</span>
                  <span>15% (Earth natural)</span>
                  <span>100% (Runaway Super-Blanket)</span>
                </div>
              </div>

              {/* 5. Surface Water Fraction */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <Droplets className="size-3.5 text-cyan-400" />
                    Hydrosphere / Water Coverage
                  </span>
                  <span className="font-mono text-cyan-400">
                    {(waterFraction * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={waterFraction}
                  onChange={(e) => {
                    setWaterFraction(parseFloat(e.target.value));
                    setSelectedPresetId("custom");
                    if (onInteract) onInteract();
                  }}
                  className="w-full accent-cyan-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0% (Hyper-Arid)</span>
                  <span>71% (Earth Oceans)</span>
                  <span>100% (Hycean / Global Waterworld)</span>
                </div>
              </div>

              {/* 6. Tidal / Geothermal Dissipation (W/m^2) */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <Zap className="size-3.5 text-amber-400" />
                    Internal Tidal / Geothermal Heat Flux
                  </span>
                  <span className="font-mono text-amber-400">
                    {tidalHeatingWatts.toFixed(2)} W/m²
                  </span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="0.5"
                  step="0.01"
                  value={tidalHeatingWatts}
                  onChange={(e) => {
                    setTidalHeatingWatts(parseFloat(e.target.value));
                    setSelectedPresetId("custom");
                    if (onInteract) onInteract();
                  }}
                  className="w-full accent-amber-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0.08 W/m² (Earth geothermal)</span>
                  <span>0.15 W/m² (Europa)</span>
                  <span>0.25 W/m² (Enceladus plumes)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Solar System Ocean Worlds & Mars Explorer Tab */}
      {activeTab === "ocean_worlds" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: 3D Viewport with sub-world controls (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            <div className="relative w-full aspect-video sm:aspect-square max-h-[500px] bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center">
              <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

              {/* Exploration World Selector Tabs Overlay */}
              <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-black/70 border border-white/10 p-1 rounded-xl backdrop-blur-md">
                <button
                  onClick={() => {
                    setSelectedExploratoryWorld("mars");
                    if (onInteract) onInteract();
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedExploratoryWorld === "mars"
                      ? "bg-rose-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Mars
                </button>
                <button
                  onClick={() => {
                    setSelectedExploratoryWorld("europa");
                    if (onInteract) onInteract();
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedExploratoryWorld === "europa"
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Europa (Jupiter)
                </button>
                <button
                  onClick={() => {
                    setSelectedExploratoryWorld("enceladus");
                    if (onInteract) onInteract();
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedExploratoryWorld === "enceladus"
                      ? "bg-cyan-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Enceladus (Saturn)
                </button>
              </div>

              {/* Europa Cutaway Toggle Button */}
              {selectedExploratoryWorld === "europa" && (
                <div className="absolute top-4 right-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowEuropaCrossSection(!showEuropaCrossSection)}
                    className="bg-black/80 border-blue-400/40 text-blue-300 hover:bg-blue-900/40 text-xs"
                  >
                    <Layers className="size-3.5 mr-1.5" />
                    {showEuropaCrossSection
                      ? "Hide Subsurface Cross-Section"
                      : "Show Subsurface Ocean Interior"}
                  </Button>
                </div>
              )}

              {/* Enceladus Plume Indicator */}
              {selectedExploratoryWorld === "enceladus" && (
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-[11px] text-cyan-300 font-mono flex items-center gap-1.5">
                  <Droplets className="size-3 animate-bounce" />
                  <span>Active Cryovolcanic Geysers Venting</span>
                </div>
              )}

              {/* Bottom Info Banner */}
              <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-black/80 border border-white/10 backdrop-blur-md text-xs text-slate-300 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white">
                    {selectedExploratoryWorld === "mars" &&
                      "Mars: Ancient Warm Waters vs Modern Thin Atmosphere"}
                    {selectedExploratoryWorld === "europa" &&
                      "Europa: Jovian Tidal Heating & 100-km Deep Global Sea"}
                    {selectedExploratoryWorld === "enceladus" &&
                      "Enceladus: Saturnian Moon Venting Seafloor Geothermal Organics"}
                  </span>
                </div>
                <span className="font-mono text-slate-400 text-[11px]">Solar System Target</span>
              </div>
            </div>

            {/* Scientific Explanation Callout */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-white/10 text-xs leading-relaxed text-slate-300">
              {selectedExploratoryWorld === "mars" && (
                <div>
                  <strong className="text-rose-400 font-semibold block mb-1">
                    Mars Scientific In-Situ Status:
                  </strong>
                  Over 3.8 billion years ago, Mars possessed a dense atmosphere, river deltas
                  (Jezero Crater), and long-standing lakes. When its internal core dynamo cooled,
                  solar wind sputtering stripped the atmosphere down to 6.1 mbar. NASA's Curiosity
                  and Perseverance rovers have confirmed indigenous organic carbon compounds in
                  mudstones and mapped ancient habitable lakebeds.
                </div>
              )}
              {selectedExploratoryWorld === "europa" && (
                <div>
                  <strong className="text-blue-400 font-semibold block mb-1">
                    Europa Subsurface Ocean Physics:
                  </strong>
                  Gravitational resonance with Io and Ganymede maintains orbital eccentricity,
                  generating massive tidal friction inside Europa. Beneath a 15–25 km ice shell lies
                  a global saltwater ocean estimated at 100 km deep—holding more liquid water than
                  all Earth oceans combined. NASA's Europa Clipper (launched 2024) is currently on
                  trajectory to determine ice thickness, composition, and habitability.
                </div>
              )}
              {selectedExploratoryWorld === "enceladus" && (
                <div>
                  <strong className="text-cyan-400 font-semibold block mb-1">
                    Enceladus Hydrothermal Vent Architecture:
                  </strong>
                  NASA's Cassini spacecraft flew directly through the plumes shooting from
                  Enceladus's south polar 'tiger stripe' fractures. Cassini's mass spectrometer
                  detected water vapor, carbon dioxide, methane, complex organic macromolecules, and
                  native molecular hydrogen (H₂)—conclusive evidence of active serpentinization and
                  hydrothermal vents at the ocean floor!
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Comparative Planetary Metrics (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900/90 border border-white/10 p-5 rounded-2xl space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Compass className="size-4 text-blue-400" />
                Target Environmental Metrics
              </h3>

              {selectedExploratoryWorld === "mars" && (
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-slate-400">Mean Surface Temp:</span>
                    <span className="font-mono text-white">
                      -63°C (210 K) [extremes: -140°C to +20°C]
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-slate-400">Atmospheric Pressure:</span>
                    <span className="font-mono text-rose-400">
                      0.006 atm (6.1 mbar - At Triple Point)
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-slate-400">Atmospheric Composition:</span>
                    <span className="font-mono text-slate-200">95.3% CO₂, 2.6% N₂, 1.9% Ar</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-slate-400">Liquid Water Status:</span>
                    <span className="font-mono text-amber-300">
                      Transient brines / Subsurface permafrost
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-slate-400">Astrobiology Target:</span>
                    <span className="font-mono text-emerald-400">
                      Ancient fossilized biosignatures in lake deltas
                    </span>
                  </div>
                </div>
              )}

              {selectedExploratoryWorld === "europa" && (
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-slate-400">Surface Temp (Equator):</span>
                    <span className="font-mono text-white">-160°C (110 K) [Cryogenic Ice]</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-slate-400">Ice Crust Thickness:</span>
                    <span className="font-mono text-blue-300">15 – 25 kilometers</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-slate-400">Ocean Depth:</span>
                    <span className="font-mono text-blue-400">
                      60 – 150 kilometers (Global Mantle)
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-slate-400">Energy Engine:</span>
                    <span className="font-mono text-amber-400">
                      Tidal heating (Jupiter 4:2:1 Laplace Resonance)
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-slate-400">Seafloor Boundary:</span>
                    <span className="font-mono text-emerald-400">
                      Rocky silicate mantle (Enables Hydrothermal Vents)
                    </span>
                  </div>
                </div>
              )}

              {selectedExploratoryWorld === "enceladus" && (
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-slate-400">Moon Diameter:</span>
                    <span className="font-mono text-white">
                      504 km (Tiny: fits within the UK or Arizona)
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-slate-400">Plume Speed:</span>
                    <span className="font-mono text-cyan-300">
                      ~2,100 km/h (Escape velocity exceeded into Saturn E-Ring)
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-slate-400">Cassini INMS Detections:</span>
                    <span className="font-mono text-emerald-300">
                      H₂O, CO₂, CH₄, H₂, and organic macromolecular rings
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-slate-400">Energy Source:</span>
                    <span className="font-mono text-amber-400">
                      Tidal friction from 2:1 resonance with Dione
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-slate-400">Astrobiological Potential:</span>
                    <span className="font-mono text-emerald-400">
                      Ideal for methanogen-like lithoautotrophic microbes
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Biosignature Search Matrix Box */}
            <div className="bg-slate-900/90 border border-white/10 p-5 rounded-2xl space-y-3">
              <h4 className="text-xs font-mono uppercase text-slate-400 flex items-center gap-1.5">
                <Dna className="size-3.5 text-emerald-400" />
                Comparative CHNOPS Bio-Element Availability
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Terrestrial biology requires Carbon, Hydrogen, Nitrogen, Oxygen, Phosphorus, and
                Sulfur (CHNOPS). In 2023, data from Cassini confirmed native phosphorus
                (orthophosphate) in Enceladus's ocean plumes at concentrations hundreds of times
                higher than Earth's oceans, making Enceladus the first body beyond Earth verified to
                possess all primary bio-elements in accessible solution!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. Game: "Search for Life" Mission Case Investigations */}
      {activeTab === "search_game" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Mission Telemetry & Spectral Scans (6 Cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-slate-900/90 border border-white/10 p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold">
                    CASE {activeCaseIndex + 1} OF {SEARCH_FOR_LIFE_CASES.length}
                  </span>
                  <span className="text-xs font-mono text-slate-400">{currentCase.codename}</span>
                </div>
                <span className="text-xs font-mono text-slate-500">{currentCase.missionType}</span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white mb-1">{currentCase.targetWorld}</h3>
                <p className="text-xs text-slate-400">
                  {currentCase.targetType} • Distance: {currentCase.distanceLightYears} light-years
                </p>
              </div>

              {/* Sensor Telemetry Box */}
              <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-3 font-mono text-xs">
                <div className="text-[11px] uppercase tracking-wide text-amber-400 flex items-center gap-1.5">
                  <Atom className="size-3.5" />
                  Observational Telemetry Feed
                </div>

                <div className="space-y-1.5">
                  <div className="text-slate-400 text-[11px]">Atmospheric Spectral Profile:</div>
                  <div className="space-y-1">
                    {currentCase.dataTelemetry.atmosphericComposition.map((gas, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center text-[11px] py-0.5 border-b border-white/5"
                      >
                        <span className="text-slate-300">{gas.molecule}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-400 font-bold">{gas.percentage}%</span>
                          {gas.note && (
                            <span className="text-[10px] text-amber-300 font-sans">
                              ({gas.note})
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Surface Temp:</span>
                    <span className="text-slate-200">
                      {currentCase.dataTelemetry.surfaceTemperatureK} K
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Host Star:</span>
                    <span className="text-slate-200">{currentCase.dataTelemetry.stellarHost}</span>
                  </div>
                </div>

                <div className="pt-2 text-[11px]">
                  <span className="text-amber-400 block mb-0.5">Special Scientific Anomaly:</span>
                  <span className="text-slate-300 font-sans">
                    {currentCase.dataTelemetry.specialObservation}
                  </span>
                </div>
              </div>

              {/* Potential Abiotic False Positives */}
              <div className="p-3.5 rounded-xl bg-slate-800/40 border border-white/5 text-xs space-y-1.5">
                <div className="text-slate-400 font-semibold flex items-center gap-1.5">
                  <ShieldAlert className="size-3.5 text-rose-400" />
                  Known Abiotic False Positive Mechanisms to Check:
                </div>
                <ul className="list-disc list-inside text-slate-400 space-y-1">
                  {currentCase.potentialFalsePositives.map((fp, i) => (
                    <li key={i}>{fp}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column: Scientific Investigation Decision Terminal (6 Cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-slate-900/90 border border-white/10 p-5 rounded-2xl space-y-4">
              <div className="border-b border-white/10 pb-3">
                <div className="text-xs font-mono uppercase text-emerald-400 flex items-center gap-1.5 mb-1">
                  <Search className="size-3.5" />
                  Investigator Scientific Evaluation
                </div>
                <h4 className="text-sm font-semibold text-white">{currentCase.hypothesis}</h4>
              </div>

              {/* Decision Options */}
              <div className="space-y-3">
                {currentCase.options.map((option) => {
                  const isSelected = selectedOptionId === option.id;
                  let buttonStyle =
                    "bg-slate-800/60 border-white/10 hover:bg-slate-800 hover:border-white/20 text-slate-300";

                  if (showDebrief && isSelected) {
                    buttonStyle = option.isCorrect
                      ? "bg-emerald-950/60 border-emerald-500 text-emerald-200"
                      : "bg-rose-950/60 border-rose-500 text-rose-200";
                  } else if (showDebrief && option.isCorrect) {
                    buttonStyle = "bg-emerald-950/40 border-emerald-500/40 text-emerald-300";
                  }

                  return (
                    <button
                      key={option.id}
                      onClick={() => !showDebrief && handleSelectCaseOption(option.id)}
                      disabled={showDebrief}
                      className={`w-full p-4 rounded-xl text-left text-xs border transition-all flex items-start gap-3 ${buttonStyle}`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {showDebrief && option.isCorrect ? (
                          <CheckCircle2 className="size-4 text-emerald-400" />
                        ) : showDebrief && isSelected && !option.isCorrect ? (
                          <XCircle className="size-4 text-rose-400" />
                        ) : (
                          <div className="size-4 rounded-full border border-slate-500 flex items-center justify-center text-[10px] text-slate-400">
                            •
                          </div>
                        )}
                      </div>
                      <div className="flex-1 leading-relaxed">{option.label}</div>
                    </button>
                  );
                })}
              </div>

              {/* Scientific Debrief Callout */}
              {showDebrief && selectedOptionId && (
                <div className="p-4 rounded-xl bg-slate-800/80 border border-white/10 space-y-3 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    {currentCase.options.find((o) => o.id === selectedOptionId)?.isCorrect ? (
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 font-mono">
                        <CheckCircle2 className="size-4" /> SCIENTIFIC RIGOR UPHELD (+100 PTS)
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-rose-400 flex items-center gap-1 font-mono">
                        <XCircle className="size-4" /> UNVERIFIED PREMATURE CONCLUSION
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {currentCase.options.find((o) => o.id === selectedOptionId)?.scientificDebrief}
                  </p>

                  <div className="pt-2 flex justify-end">
                    <Button
                      onClick={handleNextCase}
                      size="sm"
                      className="bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs"
                    >
                      {activeCaseIndex < SEARCH_FOR_LIFE_CASES.length - 1
                        ? "Next Mission Case"
                        : "Review All Cases"}
                      <ArrowRight className="size-3.5 ml-1.5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Progress Tracker Footer */}
              <div className="flex items-center justify-between text-xs font-mono text-slate-500 pt-3 border-t border-white/5">
                <span>
                  Completed: {totalGameCompleted}/{SEARCH_FOR_LIFE_CASES.length} Cases
                </span>
                <span className="text-amber-400">
                  Score: {totalCorrectCases * 100} Astrobiology Score
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
