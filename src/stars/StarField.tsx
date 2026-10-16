/**
 * ESA Gaia DR3 Milky Way Star Atlas & Multi-Resolution StarField
 *
 * Grounded in ESA Gaia DR3 (Gaia Collaboration et al. 2023, A&A 674, A1).
 * Architectural Reference: Gaia Sky (langurmonkey/gaiasky).
 *
 * Features:
 * 1. Catalog-backed star points (bright stars + high-precision 3D solar neighborhood + streamed LOD tiles).
 * 2. Proper-motion visualization: dynamic GPU epoch offset (uEpochYears) showing constellation drift.
 * 3. Color science: Planckian blackbody locus (Teff) + Gaia (BP - RP) photometric colors.
 * 4. Separate Sky-Direction layer: stars with negative/unreliable parallaxes rendered on celestial sphere without fake depths.
 * 5. Device-adaptive scalability tiers (mobile 15k, standard 50k, high 150k, benchmark 500k).
 * 6. Interactive GPU picking with selection retention across tile unload/reload cycles.
 * 7. Optional illustrative procedural background stars, visually and logically distinguishable.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useStore } from "./store";
import { backgroundFocus } from "./sim-clock";
import { gaiaTileManager } from "@/lib/astronomy/gaia/gaia-tile-manager";
import type { GaiaStarRecord } from "@/lib/astronomy/gaia/gaia-catalog";
import { useIsMobile } from "@/hooks/use-mobile";

// Procedural background count adapted by device tier
const PROCEDURAL_COUNT = 14000;

function makeStarTexture(): THREE.Texture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.18, "rgba(255,255,255,0.95)");
  grad.addColorStop(0.45, "rgba(255,255,255,0.35)");
  grad.addColorStop(0.8, "rgba(255,255,255,0.06)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

export function StarField() {
  const pointsRef = useRef<THREE.Points>(null!);
  const materialRef = useRef<THREE.ShaderMaterial>(null!);
  const texture = useMemo(makeStarTexture, []);

  const isMobile = useIsMobile();
  const spectralMode = useStore((s) => s.spectralMode);
  const properMotionYears = useStore((s) => s.properMotionYears);
  const starLODTier = useStore((s) => s.starLODTier);
  const showSkyDirection = useStore((s) => s.showSkyDirectionLayer);
  const showProcedural = useStore((s) => s.showProceduralStars);
  const selectedStar = useStore((s) => s.selectedStar);
  const setSelected = useStore((s) => s.setSelected);
  const flyToStar = useStore((s) => s.flyToStar);

  const spectralTarget = useRef(0);
  const spectralBlend = useRef(0);
  const lastCameraDistance = useRef(8);

  const [catalogStars, setCatalogStars] = useState<GaiaStarRecord[]>(() =>
    gaiaTileManager.getConsolidatedStars(showSkyDirection),
  );

  // Sync device tier with manager
  useEffect(() => {
    if (isMobile) {
      gaiaTileManager.setQualityTier("mobile");
    } else {
      gaiaTileManager.setQualityTier(starLODTier);
    }
  }, [isMobile, starLODTier]);

  // Keep selected star pinned in manager so it survives tile unloads
  useEffect(() => {
    if (selectedStar && "gaiaSourceId" in selectedStar) {
      gaiaTileManager.pinSelectedStar(selectedStar as GaiaStarRecord);
    }
  }, [selectedStar]);

  // Handle LOD streaming updates based on camera motion
  const refreshLOD = useCallback((camDist: number, camPos: THREE.Vector3) => {
    gaiaTileManager.updateLOD(camDist, { x: camPos.x, y: camPos.y, z: camPos.z }).then((stars) => {
      setCatalogStars(stars);
    });
  }, []);

  // Build GPU geometry combining Gaia DR3 catalog stars + optional procedural background
  const { geometry, starLookup } = useMemo(() => {
    const catalogCount = catalogStars.length;
    const bgCount = showProcedural ? (isMobile ? 4000 : PROCEDURAL_COUNT) : 0;
    const totalCount = catalogCount + bgCount;

    const positions = new Float32Array(totalCount * 3);
    const velocities = new Float32Array(totalCount * 3);
    const naturalColors = new Float32Array(totalCount * 3);
    const spectralColors = new Float32Array(totalCount * 3);
    const sizes = new Float32Array(totalCount);
    const phases = new Float32Array(totalCount);
    const isCatalogAttr = new Float32Array(totalCount);
    const isSkyDirectionAttr = new Float32Array(totalCount);

    const lookup: GaiaStarRecord[] = [];

    // 1. Populate Catalog Stars
    for (let i = 0; i < catalogCount; i++) {
      const s = catalogStars[i];
      lookup.push(s);

      positions[i * 3] = s.x;
      positions[i * 3 + 1] = s.y;
      positions[i * 3 + 2] = s.z;

      // 3D velocity vector (ly / kyr) for proper-motion time projection
      velocities[i * 3] = s.properMotion3D.vxLyPerKyr;
      velocities[i * 3 + 1] = s.properMotion3D.vyLyPerKyr;
      velocities[i * 3 + 2] = s.properMotion3D.vzLyPerKyr;

      naturalColors[i * 3] = s.naturalColorRgb.r;
      naturalColors[i * 3 + 1] = s.naturalColorRgb.g;
      naturalColors[i * 3 + 2] = s.naturalColorRgb.b;

      spectralColors[i * 3] = s.spectralColorRgb.r;
      spectralColors[i * 3 + 1] = s.spectralColorRgb.g;
      spectralColors[i * 3 + 2] = s.spectralColorRgb.b;

      // Size calculation: apparent magnitude scaled
      const mag = Math.min(14, Math.max(-2, s.magnitude));
      sizes[i] = Math.max(2.5, 14.5 - mag * 1.15);
      phases[i] = (i * 0.73) % (Math.PI * 2);
      isCatalogAttr[i] = 1.0;
      isSkyDirectionAttr[i] = s.isSkyDirectionLayer ? 1.0 : 0.0;
    }

    // 2. Populate Optional Procedural Background (distinct visual signature)
    if (bgCount > 0) {
      const SCALE_H = 700;
      const R_MAX = 14000;
      let seed = 1234567;
      const rnd = () => {
        seed = (seed * 1664525 + 1013904223) % 4294967296;
        return seed / 4294967296;
      };

      for (let j = 0; j < bgCount; j++) {
        const i = catalogCount + j;
        const r = -Math.log(1 - rnd() * 0.999) * 2400 + 400;
        const rClamped = Math.min(r, R_MAX);
        const theta = rnd() * Math.PI * 2;
        const u = rnd() - 0.5;
        const z = -Math.sign(u) * Math.log(1 - 2 * Math.abs(u) * 0.999) * SCALE_H;

        positions[i * 3] = Math.cos(theta) * rClamped;
        positions[i * 3 + 1] = z;
        positions[i * 3 + 2] = Math.sin(theta) * rClamped;

        velocities[i * 3] = 0;
        velocities[i * 3 + 1] = 0;
        velocities[i * 3 + 2] = 0;

        // Softer background colors to distinguish procedural from observational
        naturalColors[i * 3] = 0.75;
        naturalColors[i * 3 + 1] = 0.8;
        naturalColors[i * 3 + 2] = 0.95;

        spectralColors[i * 3] = 0.6;
        spectralColors[i * 3 + 1] = 0.7;
        spectralColors[i * 3 + 2] = 0.9;

        sizes[i] = 1.2 + rnd() * 1.5;
        phases[i] = rnd() * Math.PI * 2;
        isCatalogAttr[i] = 0.0; // Distinguishable background flag
        isSkyDirectionAttr[i] = 0.0;
      }
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("aVelocity", new THREE.BufferAttribute(velocities, 3));
    g.setAttribute("aColorNatural", new THREE.BufferAttribute(naturalColors, 3));
    g.setAttribute("aColorSpectral", new THREE.BufferAttribute(spectralColors, 3));
    g.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    g.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
    g.setAttribute("aIsCatalog", new THREE.BufferAttribute(isCatalogAttr, 1));
    g.setAttribute("aIsSkyDirection", new THREE.BufferAttribute(isSkyDirectionAttr, 1));

    return { geometry: g, starLookup: lookup };
  }, [catalogStars, showProcedural, isMobile]);

  // Frame animation: update uniforms & camera LOD streaming
  useFrame(({ clock, camera }) => {
    spectralTarget.current = spectralMode ? 1 : 0;
    spectralBlend.current += (spectralTarget.current - spectralBlend.current) * 0.05;

    const camDist = useStore.getState().cameraDistance;
    if (Math.abs(camDist - lastCameraDistance.current) / (lastCameraDistance.current || 1) > 0.15) {
      lastCameraDistance.current = camDist;
      refreshLOD(camDist, camera.position);
    }

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.elapsedTime;
      materialRef.current.uniforms.uSpectral.value = spectralBlend.current;
      materialRef.current.uniforms.uCamDist.value = camDist;
      materialRef.current.uniforms.uEpochYears.value = properMotionYears;
      materialRef.current.uniforms.uFocus.value = backgroundFocus();
    }
  });

  // Custom GPU Shader with proper motion time evolution & photometric rendering
  const shader = useMemo(
    () => ({
      uniforms: {
        uTime: { value: 0 },
        uSpectral: { value: 0 },
        uEpochYears: { value: 0 },
        uTex: { value: texture },
        uPixelRatio: { value: typeof window !== "undefined" ? window.devicePixelRatio : 1 },
        uCamDist: { value: 8 },
        uFocus: { value: 1 },
      },
      vertexShader: /* glsl */ `
        attribute vec3 aVelocity;
        attribute float aSize;
        attribute float aPhase;
        attribute float aIsCatalog;
        attribute float aIsSkyDirection;
        attribute vec3 aColorNatural;
        attribute vec3 aColorSpectral;

        uniform float uTime;
        uniform float uSpectral;
        uniform float uEpochYears;
        uniform float uPixelRatio;
        uniform float uCamDist;

        varying vec3 vColor;
        varying float vAlpha;
        varying float vIsCatalog;
        varying float vIsSkyDirection;

        void main() {
          // Propagate stellar positions forward/backward in cosmic time using Gaia 3D velocities
          // aVelocity is in light-years per 1,000 Earth years
          float kyr = uEpochYears / 1000.0;
          vec3 displacedPos = position + aVelocity * kyr;

          vec3 col = mix(aColorNatural, aColorSpectral, uSpectral);
          vColor = col;
          vIsCatalog = aIsCatalog;
          vIsSkyDirection = aIsSkyDirection;

          vec4 mv = modelViewMatrix * vec4(displacedPos, 1.0);
          float twinkle = 0.88 + 0.22 * sin(uTime * 1.5 + aPhase);

          // Distance and apparent magnitude scaling
          float distToCam = max(-mv.z, 0.5);
          float size = aSize * twinkle * uPixelRatio * (340.0 / distToCam);

          // Background stars only fade in as camera pulls back from Solar System
          float bgFade = smoothstep(100.0, 800.0, uCamDist);
          float visibility = mix(bgFade, 1.0, aIsCatalog);

          // Sky-direction layer is drawn at consistent apparent brightness on celestial sphere
          if (aIsSkyDirection > 0.5) {
            gl_PointSize = clamp(size * 0.85, 2.0, 45.0);
            vAlpha = 0.65 * visibility;
          } else {
            gl_PointSize = clamp(size * mix(bgFade * 0.7, 1.0, aIsCatalog), 1.0, 90.0);
            vAlpha = clamp(1.0 - (length(mv.xyz) / 4500.0), 0.2, 1.0) * visibility;
          }

          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform sampler2D uTex;
        uniform float uFocus;

        varying vec3 vColor;
        varying float vAlpha;
        varying float vIsCatalog;
        varying float vIsSkyDirection;

        void main() {
          vec4 tex = texture2D(uTex, gl_PointCoord);
          if (tex.a < 0.05) discard;

          // Sky direction stars have a subtle reticle halo to distinguish from 3D localized stars
          vec3 finalColor = vColor;
          float alpha = tex.a * vAlpha * uFocus;

          if (vIsSkyDirection > 0.5) {
            // Subtle cyan tint indicator for sky-direction astrometric beacon
            finalColor = mix(vColor, vec3(0.5, 0.85, 1.0), 0.35);
          } else if (vIsCatalog < 0.5) {
            // Procedural background stars rendered softer
            alpha *= 0.65;
          }

          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
    [texture],
  );

  // Proximity Raycasting / Picking on catalog star click
  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (!e.point || starLookup.length === 0) return;

    // Find nearest catalog star to intersection point
    const clickPoint = e.point;
    let closestStar: GaiaStarRecord | null = null;
    let minDistanceSq = 16.0; // Picking radius in light-years

    for (let i = 0; i < starLookup.length; i++) {
      const star = starLookup[i];
      const dx = star.x - clickPoint.x;
      const dy = star.y - clickPoint.y;
      const dz = star.z - clickPoint.z;
      const distSq = dx * dx + dy * dy + dz * dz;
      if (distSq < minDistanceSq) {
        minDistanceSq = distSq;
        closestStar = star;
      }
    }

    if (closestStar) {
      setSelected(closestStar);
      flyToStar(closestStar);
    }
  };

  return (
    <points
      ref={pointsRef}
      geometry={geometry}
      frustumCulled={false}
      onPointerDown={handlePointerDown}
    >
      <shaderMaterial ref={materialRef} args={[shader]} />
    </points>
  );
}
