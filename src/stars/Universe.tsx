import { useGalaxyJourney } from "./galaxy-journey";
import { SGR_A_DISTANCE_LY } from "@/lib/astronomy/galactic-scene";

import { GalaxyCatalogCloud } from "./GalaxyCatalogCloud";
import { CatalogueGalaxyField } from "./CatalogueGalaxyField";
import { SurveyGalaxyField } from "./SurveyGalaxyField";
import { MILKY_WAY_APPEARANCE } from "./GalaxyRadiance";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import { SafeHtml as Html } from "./SafeHtml";
import { useStore } from "./store";
import { NEARBY_GALAXIES, type NamedGalaxy } from "./galaxy-catalog";
import { LargeScaleStructure3D } from "./LargeScaleStructure3D";
import { exploreGalaxyAssociation } from "./exploration-navigation";

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
  return (
    <group position={position}>
      <Billboard>
        <Html center zIndexRange={[12, 0]} style={{ pointerEvents: "none" }}>
          <button
            type="button"
            aria-label={`Browse ${name} members`}
            title="Catalogued members only; coverage is incomplete. Cluster centres and viewing envelopes are approximate."
            style={{
              minHeight: 44,
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
              exploreGalaxyAssociation(name, position.toArray() as [number, number, number]);
            }}
          >
            {name} · {count} in atlas
          </button>
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
  const enabled = useStore((s) => s.subsystems.milkyWay);
  return enabled ? (
    <group position={[-SGR_A_DISTANCE_LY, 0, 0]}>
      <GalaxyCatalogCloud model={MILKY_WAY_APPEARANCE} fadeInDistance={0} />
    </group>
  ) : null;
}

// -----------------------------------------------------------------------------
// Main Universe Component
// -----------------------------------------------------------------------------

export function Universe() {
  const showCosmicWebDensity = useStore((s) => s.showCosmicWebDensity);
  const showObservedGalaxies = useStore((s) => s.showObservedGalaxies);
  const subsystems = useStore((s) => s.subsystems);

  // Cluster center positions for aggregate markers
  const clusters = useMemo(
    () => [
      {
        name: "Virgo Cluster",
        position: toXYZ(283.8, 74.5, 54_000_000),
        count: NEARBY_GALAXIES.filter((g) => g.hostGroup === "Virgo Cluster").length,
        color: "#8ab4f8",
      },
      {
        name: "Coma Cluster",
        position: toXYZ(58.1, 87.9, 321_000_000),
        count: NEARBY_GALAXIES.filter((g) => g.hostGroup === "Coma Cluster").length,
        color: "#f28b82",
      },
      {
        name: "Perseus Cluster",
        position: toXYZ(150.6, -13.3, 237_000_000),
        count: NEARBY_GALAXIES.filter((g) => g.hostGroup === "Perseus Cluster").length,
        color: "#fdd663",
      },
      {
        name: "Fornax Cluster",
        position: toXYZ(238.0, -54.6, 58_000_000),
        count: NEARBY_GALAXIES.filter((g) => g.hostGroup === "Fornax Cluster").length,
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
          <CatalogueGalaxyField />

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
