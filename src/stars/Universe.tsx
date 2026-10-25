import { SGR_A_DISTANCE_LY } from "@/lib/astronomy/galactic-scene";
import { galaxyDetailAlpha } from "./galaxy-detail-state";
import { useGalaxyPortrait } from "./useGalaxyPortrait";
import { SurveyGalaxyField } from "./SurveyGalaxyField";
import { MILKY_WAY_APPEARANCE } from "./GalaxyRadiance";
import { makeGalaxyPortrait } from "./galaxy-portrait";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import { SafeHtml as Html } from "./SafeHtml";
import { useStore } from "./store";
import { GALAXY_BY_NAME } from "./galaxy-models";
import { NEARBY_GALAXIES, type NamedGalaxy, type ObservationalGalaxy } from "./galaxy-catalog";
import { LargeScaleStructure3D } from "./LargeScaleStructure3D";

// ---------------------------------------------------------------
// OBSERVATIONAL UNIVERSE ATLAS — HIERARCHICAL RENDERING
//
// Levels:
//   LEVEL 1: Catalog Point (Correct observed sky direction, magnitude/distance scaling)
//   LEVEL 2: Angular Extent & Morphological Profile (Inclination & PA alignment)
//   LEVEL 3: Photorealistic Visual Representation (Multi-wavelength core, arms, dust)
//   LEVEL 4: Detailed 3D Reconstruction Handover (Curated particle models)
//
// Positions of named galaxies come from real equatorial/galactic coordinates
// (RA/Dec -> l, b -> XYZ at measured distance).
// Toggleable between observed galaxies and simulated cosmic-web filaments.
// ---------------------------------------------------------------

export function toXYZ(l: number, b: number, d: number): THREE.Vector3 {
  const lr = (l * Math.PI) / 180;
  const br = (b * Math.PI) / 180;
  // Flip x so galactic-center direction (l=0) points to -x (matches GALACTIC_CENTER at (-SGR_A_DISTANCE_LY, 0, 0))
  const x = -d * Math.cos(br) * Math.cos(lr);
  const y = d * Math.sin(br);
  const z = d * Math.cos(br) * Math.sin(lr);
  return new THREE.Vector3(x, y, z);
}

// Procedural spiral-galaxy texture
function makeSpiralGalaxyTexture(color = "#dfe6ff"): THREE.Texture {
  const size = 256;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  ctx.clearRect(0, 0, size, size);
  const cx = size / 2,
    cy = size / 2;
  // Core glow
  const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.5);
  core.addColorStop(0, "rgba(255,242,215,1)");
  core.addColorStop(0.18, "rgba(255,220,170,0.85)");
  core.addColorStop(0.48, "rgba(195,220,255,0.35)");
  core.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = core;
  ctx.fillRect(0, 0, size, size);

  // Spiral arms with HII star-forming clusters
  ctx.globalCompositeOperation = "lighter";
  const arms = 2;
  for (let a = 0; a < arms; a++) {
    for (let i = 0; i < 2800; i++) {
      const t = i / 2800;
      const r = 8 + t * (size * 0.46);
      const theta = a * Math.PI + t * 6.5 + (Math.random() - 0.5) * 0.32;
      const x = cx + Math.cos(theta) * r;
      const y = cy + Math.sin(theta) * r;
      const alpha = (1 - t) * 0.65;
      ctx.fillStyle = i % 5 === 0 ? `rgba(255,180,200,${alpha})` : `rgba(200,225,255,${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, 1 + Math.random() * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Dust lane absorption
  ctx.globalCompositeOperation = "destination-out";
  for (let a = 0; a < arms; a++) {
    for (let i = 0; i < 600; i++) {
      const t = i / 600;
      const r = 16 + t * (size * 0.38);
      const theta = a * Math.PI + t * 6.4 + 0.18 + (Math.random() - 0.5) * 0.12;
      const x = cx + Math.cos(theta) * r;
      const y = cy + Math.sin(theta) * r;
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.beginPath();
      ctx.arc(x, y, 2 + Math.random() * 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

// Procedural barred spiral galaxy texture
function makeBarredSpiralTexture(): THREE.Texture {
  const size = 256;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const cx = size / 2,
    cy = size / 2;

  // Central stellar bar
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(0.35);
  const barGrad = ctx.createLinearGradient(-size * 0.28, 0, size * 0.28, 0);
  barGrad.addColorStop(0, "rgba(255,230,190,0)");
  barGrad.addColorStop(0.3, "rgba(255,240,210,0.7)");
  barGrad.addColorStop(0.5, "rgba(255,255,240,0.95)");
  barGrad.addColorStop(0.7, "rgba(255,240,210,0.7)");
  barGrad.addColorStop(1, "rgba(255,230,190,0)");
  ctx.fillStyle = barGrad;
  ctx.fillRect(-size * 0.28, -size * 0.05, size * 0.56, size * 0.1);
  ctx.restore();

  // Core glow
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.45);
  g.addColorStop(0, "rgba(255,245,220,1)");
  g.addColorStop(0.2, "rgba(255,220,170,0.8)");
  g.addColorStop(0.5, "rgba(190,210,255,0.25)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);

  // Arms launching from bar ends
  ctx.globalCompositeOperation = "lighter";
  for (let arm = 0; arm < 2; arm++) {
    const baseTheta = 0.35 + arm * Math.PI;
    const startX = cx + Math.cos(baseTheta) * (size * 0.26);
    const startY = cy + Math.sin(baseTheta) * (size * 0.26);
    for (let i = 0; i < 1800; i++) {
      const t = i / 1800;
      const r = t * (size * 0.32);
      const theta = baseTheta + Math.PI / 2 + t * 4.2 + (Math.random() - 0.5) * 0.28;
      const x = startX + Math.cos(theta) * r;
      const y = startY + Math.sin(theta) * r;
      const a = (1 - t) * 0.6;
      ctx.fillStyle = `rgba(195,220,255,${a})`;
      ctx.beginPath();
      ctx.arc(x, y, 1.2 + Math.random() * 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

// Procedural elliptical galaxy texture
function makeEllipticalGalaxyTexture(): THREE.Texture {
  const size = 256;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const cx = size / 2,
    cy = size / 2;
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.5);
  g.addColorStop(0, "rgba(255,245,220,1)");
  g.addColorStop(0.15, "rgba(255,225,175,0.85)");
  g.addColorStop(0.35, "rgba(255,200,140,0.5)");
  g.addColorStop(0.65, "rgba(210,160,100,0.12)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Procedural irregular / starburst galaxy texture
function makeIrregularTexture(): THREE.Texture {
  const size = 256;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 1800; i++) {
    const r = Math.random() * size * 0.42;
    const theta = Math.random() * Math.PI * 2;
    const x = size / 2 + Math.cos(theta) * r;
    const y = size / 2 + Math.sin(theta) * r * 0.72;
    const a = (1 - r / (size * 0.42)) * 0.65;
    const isKnot = Math.random() < 0.2;
    ctx.fillStyle = isKnot ? `rgba(255,190,210,${a})` : `rgba(215,230,255,${a})`;
    ctx.beginPath();
    ctx.arc(x, y, 1.2 + Math.random() * (isKnot ? 2.8 : 1.8), 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Procedural high-z / quasar point texture
function makeHighZTexture(): THREE.Texture {
  const size = 128;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const cx = size / 2,
    cy = size / 2;
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.45);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.2, "rgba(255,120,120,0.9)");
  g.addColorStop(0.5, "rgba(255,70,70,0.3)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeDotTexture(): THREE.Texture {
  const size = 64;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.4, "rgba(255,240,210,0.5)");
  g.addColorStop(1, "rgba(255,220,180,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// -----------------------------------------------------------------------------
// Hierarchical Galaxy Node Component
// -----------------------------------------------------------------------------

function ObservationalGalaxyNode({
  g,
  spiralTex,
  barredTex,
  ellipTex,
  irrTex,
  highZTex,
}: {
  g: ObservationalGalaxy;
  spiralTex: THREE.Texture;
  barredTex: THREE.Texture;
  ellipTex: THREE.Texture;
  irrTex: THREE.Texture;
  highZTex: THREE.Texture;
}) {
  const pos = useMemo(() => toXYZ(g.l, g.b, g.distance), [g]);
  const isHighZ = g.distanceTier === "high_redshift" || g.redshift > 5.0;
  const isBarred = /Barred/i.test(g.type) || /SB/i.test(g.morphologyClass);
  const isElliptical = /Elliptical|Lenticular/i.test(g.type) || /^E|^S0/i.test(g.morphologyClass);
  const isIrregular = /Irregular|Starburst/i.test(g.type) || /dIrr|IBm/i.test(g.morphologyClass);

  const model = GALAXY_BY_NAME.get(g.name);
  const portrait = useMemo(() => (model ? makeGalaxyPortrait(model) : null), [model]);
  useEffect(() => () => portrait?.dispose(), [portrait]);
  const observedPortrait = useGalaxyPortrait(model?.key ?? g.name, portrait ?? spiralTex);
  const tex =
    (observedPortrait.observed ? observedPortrait.texture : portrait) ??
    (isHighZ
      ? highZTex
      : isBarred
        ? barredTex
        : isElliptical
          ? ellipTex
          : isIrregular
            ? irrTex
            : spiralTex);

  const meshRef = useRef<THREE.Mesh>(null!);
  const matRef = useRef<THREE.MeshBasicMaterial>(null!);
  const pickRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  const setVisitGalaxy = useStore((s) => s.setVisitGalaxy);

  // Check if this galaxy has a full 3D particle model (Level 4)
  const hasDetail = GALAXY_BY_NAME.has(g.name);

  const rot = useMemo(() => {
    const incl = ((g.inclination ?? 45) * Math.PI) / 180;
    const pa = ((g.posAngle ?? 0) * Math.PI) / 180;
    return new THREE.Euler(incl, 0, pa);
  }, [g]);

  // Dynamic scale ensuring distant galaxies remain distinguishable without popping

  const normal = useMemo(() => new THREE.Vector3(0, 0, 1).applyEuler(rot), [rot]);
  const direction = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera, size }) => {
    if (!matRef.current || !meshRef.current) return;
    const radius = model?.diskRadius ?? g.size * 0.5;
    const detailEnabled = useStore.getState().subsystems.detailedGalaxies;
    matRef.current.opacity =
      hasDetail && detailEnabled ? 1 - (galaxyDetailAlpha.get(model!.key) ?? 0) : 1;
    matRef.current.color.setScalar(5.5);
    const distance = camera.position.distanceTo(pos);
    const minSize =
      (distance *
        2 *
        Math.tan(THREE.MathUtils.degToRad((camera as THREE.PerspectiveCamera).fov * 0.5)) *
        5) /
      size.height;
    const diameter = Math.max(radius * 2, minSize);
    if (pickRef.current) pickRef.current.scale.setScalar(diameter * 0.5);
    direction.copy(camera.position).sub(pos).normalize();
    const ratio =
      model && ["elliptical", "dwarf"].includes(model.morphology)
        ? 0.85
        : Math.max(0.16, Math.abs(normal.dot(direction)));
    meshRef.current.quaternion.copy(camera.quaternion);
    meshRef.current.scale.set(
      diameter,
      diameter * (observedPortrait.observed ? 1 / observedPortrait.aspect : ratio),
      1,
    );
    meshRef.current.visible = matRef.current.opacity > 0.001;
  });

  const onOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = "pointer";
  };
  const onOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(false);
    document.body.style.cursor = "";
  };
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 4) return;
    e.stopPropagation();
    setVisitGalaxy({
      name: g.name,
      x: pos.x,
      y: pos.y,
      z: pos.z,
      size: g.size,
      distance: g.distance,
      type: g.type,
      view: "overview",
    });
  };

  const distLabel =
    g.distance >= 1_000_000_000
      ? (g.distance / 1_000_000_000).toFixed(2) + " Gly"
      : g.distance >= 1_000_000
        ? (g.distance / 1_000_000).toFixed(2) + " Mly"
        : (g.distance / 1000).toFixed(0) + " kly";

  return (
    <group position={pos}>
      <mesh ref={meshRef} rotation={rot} frustumCulled>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          ref={matRef}
          map={tex}
          color={portrait ? "#ffffff" : g.color}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Invisible pick target */}
      <mesh
        ref={pickRef}
        visible={false}
        onPointerOver={onOver}
        onPointerOut={onOut}
        onClick={onClick}
      >
        <sphereGeometry args={[1, 10, 10]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Mount the tooltip only while hovered; hidden roots must not track the camera. */}
      {hovered && (
        <Billboard>
          <Html center zIndexRange={[15, 0]} style={{ pointerEvents: "none" }}>
            <div
              style={{
                opacity: hovered ? 1 : 0,
                transform: "translate(12px, -12px)",
                color: "#ffffff",
                fontSize: 13,
                fontFamily: "Inter, system-ui, sans-serif",
                letterSpacing: 0.5,
                whiteSpace: "nowrap",
                padding: "5px 10px",
                borderLeft: "2px solid rgba(120,180,255,0.9)",
                background: "rgba(6,9,22,0.85)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.6)",
                transition: "opacity 150ms ease-out",
              }}
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-white">{g.name}</span>
                {hasDetail && (
                  <span className="rounded bg-sky-500/20 px-1 py-0.5 text-[9px] uppercase tracking-wider text-sky-300">
                    ✦ 3D Model
                  </span>
                )}
              </div>
              <div style={{ fontSize: 10, opacity: 0.75, marginTop: 3 }}>
                {g.morphologyClass ? `${g.morphologyClass} · ` : ""}
                {g.type} · {distLabel}
              </div>
              <div style={{ fontSize: 9, opacity: 0.55, marginTop: 1 }}>
                {g.redshift < 0
                  ? `z = ${g.redshift.toFixed(6)} (Blueshifted)`
                  : `z = ${g.redshift.toFixed(g.redshift > 1 ? 3 : 5)}`}
                {g.hostGroup ? ` · ${g.hostGroup}` : ""}
              </div>
            </div>
          </Html>
        </Billboard>
      )}
    </group>
  );
}

// -----------------------------------------------------------------------------
// Large-Scale Spatial Cluster Aggregators
// -----------------------------------------------------------------------------

function ClusterAggregateBillboard({
  name,
  position,
  count,
  color,
}: {
  name: string;
  position: THREE.Vector3;
  count: number;
  color: string;
}) {
  const [hovered, setHovered] = useState(false);
  const setVisitGalaxy = useStore((s) => s.setVisitGalaxy);

  return (
    <group position={position}>
      <Billboard>
        <Html center zIndexRange={[12, 0]} style={{ pointerEvents: "none" }}>
          <div
            style={{
              padding: "2px 8px",
              borderRadius: "4px",
              background: "rgba(10,15,35,0.65)",
              border: `1px solid ${color}`,
              color: "#e2ecff",
              fontSize: "10px",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              opacity: 0.7,
              pointerEvents: "auto",
              cursor: "pointer",
            }}
            onClick={(e) => {
              e.stopPropagation();
              setVisitGalaxy({
                name,
                x: position.x,
                y: position.y,
                z: position.z,
                size: 250_000,
                distance: position.length(),
                type: "Galaxy Cluster",
              });
            }}
          >
            {name} ({count})
          </div>
        </Html>
      </Billboard>
    </group>
  );
}

// -----------------------------------------------------------------------------
// Exported Ingested Galaxies Array with 3D positions
// -----------------------------------------------------------------------------

export const NAMED_GALAXIES = NEARBY_GALAXIES.map((g) => ({
  ...g,
  position: toXYZ(g.l, g.b, g.distance),
}));

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// Large-Scale Structure & Cosmic Web Rendering is handled by LargeScaleStructure3D
// Supporting two strictly segregated data modes:
// Mode A: Observational Survey Reconstructions (SDSS, 2dFGRS, 2MRS, Cosmicflows)
// Mode B: IllustrisTNG Cosmological Hydrodynamic Simulation (TNG300-1)
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// Observable Universe Horizon Shell (46.5 Gly Comoving Boundary)
// -----------------------------------------------------------------------------

function ObservableUniverseShell() {
  const ref = useRef<THREE.Mesh>(null!);
  const geo = useMemo(() => new THREE.SphereGeometry(4.65e10, 48, 32), []);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uTime: { value: 0 }, uOpacity: { value: 0 } },
        vertexShader: /* glsl */ `
          varying vec3 vN;
          void main(){
            vN = normalize(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uTime;
          uniform float uOpacity;
          varying vec3 vN;
          float hash(vec3 p){ return fract(sin(dot(p, vec3(127.1,311.7,74.7))) * 43758.5453); }
          float noise(vec3 p){
            vec3 i = floor(p), f = fract(p);
            float n = mix(mix(mix(hash(i), hash(i+vec3(1,0,0)), f.x),
                              mix(hash(i+vec3(0,1,0)), hash(i+vec3(1,1,0)), f.x), f.y),
                          mix(mix(hash(i+vec3(0,0,1)), hash(i+vec3(1,0,1)), f.x),
                              mix(hash(i+vec3(0,1,1)), hash(i+vec3(1,1,1)), f.x), f.y), f.z);
            return n;
          }
          void main(){
            float n = noise(vN * 12.0) * 0.5 + noise(vN * 40.0) * 0.5;
            vec3 warm = vec3(1.0, 0.55, 0.35);
            vec3 cool = vec3(0.35, 0.55, 1.0);
            vec3 col = mix(cool, warm, n);
            gl_FragColor = vec4(col * 0.28, 0.55 * uOpacity);
          }
        `,
      }),
    [],
  );
  useFrame(({ camera }) => {
    // The horizon is a cosmic-scale diagram, not luminous fog around planets.
    const opacity = THREE.MathUtils.smoothstep(camera.position.length(), 1e9, 2e10);
    mat.uniforms.uOpacity.value = opacity;
    if (ref.current) ref.current.visible = opacity > 0.001;
  });
  return <mesh ref={ref} visible={false} geometry={geo} material={mat} frustumCulled={false} />;
}

// -----------------------------------------------------------------------------
// Milky Way Far-Field Sprite
// -----------------------------------------------------------------------------

function MilkyWayFarSprite() {
  const ref = useRef<THREE.Sprite>(null!);
  const tex = useMemo(() => makeGalaxyPortrait(MILKY_WAY_APPEARANCE), []);
  useEffect(() => () => tex.dispose(), [tex]);
  useFrame(({ camera }) => {
    if (!ref.current) return;
    const d = camera.position.length();
    const a = Math.min(1, Math.max(0, (d - 200_000) / 400_000));
    (ref.current.material as THREE.SpriteMaterial).opacity = a;
    (ref.current.material as THREE.SpriteMaterial).color.setScalar(5.5);
    const diameter = Math.max(100000, d * 0.003);
    ref.current.scale.set(diameter, diameter * 0.65, 1);
    ref.current.visible = useStore.getState().subsystems.milkyWay && a > 0.001;
  });
  return (
    <sprite ref={ref} position={[-SGR_A_DISTANCE_LY, 0, 0]} scale={[100_000, 100_000, 1]}>
      <spriteMaterial
        map={tex}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={0}
      />
    </sprite>
  );
}

// -----------------------------------------------------------------------------
// Main Universe Component
// -----------------------------------------------------------------------------

export function Universe() {
  const spiralTex = useMemo(() => makeSpiralGalaxyTexture(), []);
  const barredTex = useMemo(() => makeBarredSpiralTexture(), []);
  const ellipTex = useMemo(() => makeEllipticalGalaxyTexture(), []);
  const irrTex = useMemo(() => makeIrregularTexture(), []);
  const highZTex = useMemo(() => makeHighZTexture(), []);

  const showCosmicWebDensity = useStore((s) => s.showCosmicWebDensity);
  const showObservedGalaxies = useStore((s) => s.showObservedGalaxies);
  const subsystems = useStore((s) => s.subsystems);

  // Cluster center positions for aggregate markers
  const clusters = useMemo(
    () => [
      {
        name: "Virgo Cluster",
        position: toXYZ(283.8, 74.5, 54_000_000),
        count: 16,
        color: "#8ab4f8",
      },
      {
        name: "Coma Cluster",
        position: toXYZ(58.1, 87.9, 321_000_000),
        count: 8,
        color: "#f28b82",
      },
      {
        name: "Perseus Cluster",
        position: toXYZ(150.6, -13.3, 237_000_000),
        count: 6,
        color: "#fdd663",
      },
      {
        name: "Fornax Cluster",
        position: toXYZ(238.0, -54.6, 58_000_000),
        count: 5,
        color: "#81c995",
      },
    ],
    [],
  );

  return (
    <group>
      <ObservableUniverseShell />
      {subsystems.cosmicWeb && <LargeScaleStructure3D />}
      <MilkyWayFarSprite />
      {showObservedGalaxies && <SurveyGalaxyField />}

      {/* Observed Extragalactic Catalog Nodes */}
      {showObservedGalaxies && (
        <group>
          {NEARBY_GALAXIES.filter((g) => g.name !== "Andromeda (M31)").map((g) => (
            <ObservationalGalaxyNode
              key={g.id ?? g.name}
              g={g}
              spiralTex={spiralTex}
              barredTex={barredTex}
              ellipTex={ellipTex}
              irrTex={irrTex}
              highZTex={highZTex}
            />
          ))}

          {/* Spatial cluster aggregate labels for large scales */}
          {clusters.map((c) => (
            <ClusterAggregateBillboard
              key={c.name}
              name={c.name}
              position={c.position}
              count={c.count}
              color={c.color}
            />
          ))}
        </group>
      )}
    </group>
  );
}
