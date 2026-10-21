// @ts-nocheck
/**
 * COSMOS Scientific Planetary Body & Material Component
 * Project: Our Visible Universe Academy
 * Scope: Prompt 05 — Sections 6, 8, 9, 21, 22
 *
 * Renders physically grounded planets and moons with:
 * - Procedural high-contrast albedo textures (Earth continents/oceans, Lunar craters/maria,
 *   Martian iron-oxide plains, Jovian zonal belts + Great Red Spot, Saturnian rings with
 *   Cassini Division, Ice giant methane atmospheres, and Europan ice lineae)
 * - Collimated solar terminator shading (illuminated day side, twilight Rayleigh band,
 *   dark un-overexposed night side with optional city lights on Earth)
 * - Separate cloud layer and Rayleigh/Mie atmospheric scattering shell where physically present
 * - Zero atmospheric glow on airless worlds (Moon, Europa)
 */

import React, { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { CinematicQualityTier } from "@/lib/cosmos/cinematic-storyboard-types";
import { CosmosAssetLODManager } from "@/lib/cosmos/cinematic/assets";
import {
  CosmosScientificSceneLibrary,
  ScientificMaterialFactory,
  ScientificRenderingQualityAdapter,
  ScientificShaderRegistry,
  computePlanetaryTerminator,
  type PlanetaryBodyPresetId,
} from "@/lib/cosmos/cinematic/rendering";
import { ScientificAtmosphere } from "./ScientificAtmosphere";

export interface ScientificPlanetProps {
  objectId: string;
  sceneId: string;
  presetId: PlanetaryBodyPresetId;
  position?: [number, number, number];
  radius?: number;
  starPosition?: [number, number, number];
  qualityTier: CinematicQualityTier;
  isSimulationRunning?: boolean;
  simulationTimeScale?: number;
  rotationSpeed?: number;
  highlighted?: boolean;
  narrativeProgress?: number;
  showAtmosphereOverride?: boolean;
  onSelectObject?: (objectId: string) => void;
}

export function ScientificPlanetMaterial({
  objectId,
  sceneId,
  presetId,
  position = [0, 0, 0],
  radius = 1.0,
  starPosition = [10, 4, 8],
  qualityTier,
  isSimulationRunning = true,
  simulationTimeScale = 1.0,
  rotationSpeed = 0.28,
  highlighted = false,
  narrativeProgress = 0,
  showAtmosphereOverride,
  onSelectObject,
}: ScientificPlanetProps) {
  const planetMeshRef = useRef<THREE.Mesh>(null);
  const cloudMeshRef = useRef<THREE.Mesh>(null);
  const simTimeRef = useRef(0);

  const factory = ScientificMaterialFactory.getInstance();
  const preset = factory.getPlanetaryPreset(presetId);
  const adapted = useMemo(
    () => ScientificRenderingQualityAdapter.resolveAdaptedParameters(qualityTier),
    [qualityTier],
  );

  const { camera, size } = useThree();
  const albedoTexture = useMemo(
    () => factory.getOrCreatePlanetaryAlbedoTexture(presetId, qualityTier),
    [factory, presetId, qualityTier],
  );

  const normalTexture = useMemo(
    () => factory.getOrCreatePlanetaryNormalTexture(presetId, qualityTier),
    [factory, presetId, qualityTier],
  );

  const ringTexture = useMemo(
    () => (preset.hasRingSystem ? factory.getOrCreatePlanetaryRingTexture() : null),
    [factory, preset.hasRingSystem],
  );

  const terminator = useMemo(
    () => computePlanetaryTerminator(position, starPosition),
    [position, starPosition],
  );

  const shaderMaterial = useMemo(() => {
    if (!adapted.enableCustomFragmentShaders) return null;
    return ScientificShaderRegistry.getInstance().getOrCreateShaderMaterial(
      "planetary_terminator_shader",
      `planet_${sceneId}_${objectId}_${presetId}_${qualityTier}`,
      {
        uniformOverrides: {
          uAlbedoMap: albedoTexture,
          uHasAlbedoMap: true,
          uBaseColor: new THREE.Color(preset.baseColorHex),
          uSecondaryColor: new THREE.Color(preset.secondaryColorHex),
          uAtmosphereColor: new THREE.Color(preset.atmosphereRayleighHex || "#38bdf8"),
          uSunDirection: new THREE.Vector3(...terminator.sunDirection),
          uRoughness: preset.roughness,
          uOceanSpecularStrength: preset.oceanSpecularStrength,
          uNightLightsStrength: preset.nightLightsStrength,
          uHighlightStrength: highlighted ? 0.85 : 0.0,
          uPlanetClass: preset.planetClassIndex,
        },
      },
    );
  }, [
    adapted.enableCustomFragmentShaders,
    sceneId,
    objectId,
    presetId,
    qualityTier,
    albedoTexture,
    preset,
    terminator.sunDirection,
    highlighted,
  ]);

  // Register with CosmosScientificSceneLibrary
  useEffect(() => {
    const lib = CosmosScientificSceneLibrary.getInstance();
    const ctrl = lib.registerObject(
      {
        objectId,
        sceneId,
        name: preset.name,
        scientificObjectType:
          preset.planetClassIndex === 1
            ? "moon_airless"
            : preset.planetClassIndex === 3
              ? "planet_gas_giant"
              : preset.planetClassIndex === 4
                ? "planet_ice_giant"
                : "planet_terrestrial",
        scaleRegime: "planetary_scale",
        scientificRepresentation: "SCALE_ADJUSTED_EDUCATIONAL_MODEL",
        epistemicDisclosure: preset.scientificNotes,
        physicalParameters: {
          axialTiltDeg: preset.axialTiltDeg,
          atmosphericOpticalDepth: preset.atmosphereOpticalDepth,
        },
        displayScale: radius,
        renderingQuality: qualityTier,
        supportedAnimations: ["axial_rotation", "terminator_sweep"],
        supportedHighlights: ["fresnel_rim", "atmosphere_emphasis"],
        supportedCameraTargets: [objectId],
        scientificSources: ["IAU / NASA Solar System Exploration"],
        shaderState: {
          narrativeProgress,
          simulationTime: 0,
          stellarTemperatureK: 5772,
          atmosphericOpticalDepth: preset.atmosphereOpticalDepth,
          highlightStrength: highlighted ? 0.85 : 0,
          emissionIntensity: 1.0,
          densityScale: 1.0,
          cutawayRevealAngleRad: 0,
          dopplerBeamingStrength: 0,
          lensingDeflectionStrength: 0,
          visualizationMode: "photometric",
        },
        resourceLifecycle: {
          createdAt: Date.now(),
          lastUpdatedAt: Date.now(),
          disposed: false,
          geometryCount: 1,
          materialCount: 1,
          textureCount: 1,
        },
      },
      position,
      radius,
    );

    return () => {
      ctrl.disposeResources();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objectId, sceneId, presetId]);

  useFrame((_, delta) => {
    if (isSimulationRunning) {
      const dt = Math.min(delta, 0.1) * simulationTimeScale;
      simTimeRef.current += dt;
      if (planetMeshRef.current) {
        planetMeshRef.current.rotation.y += dt * rotationSpeed;
      }
      if (cloudMeshRef.current) {
        cloudMeshRef.current.rotation.y += dt * (rotationSpeed * 1.18);
      }
    }

    if (shaderMaterial) {
      shaderMaterial.uniforms.uSunDirection.value.set(...terminator.sunDirection);
      ScientificShaderRegistry.getInstance().updateDeterministicUniforms(shaderMaterial, {
        simulationTime: simTimeRef.current,
        narrativeProgress,
        highlightStrength: highlighted ? 0.85 : 0.0,
        atmosphericOpticalDepth: preset.atmosphereOpticalDepth,
      });
    }
    // Evaluate screen-space LOD with hysteresis
    const camDist = camera.position.distanceTo(new THREE.Vector3(...position));
    CosmosAssetLODManager.getInstance().evaluateLOD({
      objectId,
      assetId:
        presetId === "earth" ? "asset_planet_earth_reference_v2" : `asset_planet_${presetId}_v1`,
      displayRadiusUnits: radius,
      cameraDistanceUnits: camDist,
      viewportHeightPx: size.height || 1080,
      qualityTier,
    });
  });

  const segs = adapted.profile.sphereSegments;
  const tiltRad = (preset.axialTiltDeg * Math.PI) / 180;
  const shouldRenderAtmosphere =
    (showAtmosphereOverride ?? preset.hasAtmosphere) && preset.atmosphereOpticalDepth > 0;

  return (
    <group position={position} rotation={[0, 0, tiltRad]}>
      {/* Primary Planetary Body */}
      <mesh
        ref={planetMeshRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelectObject?.(objectId);
        }}
      >
        <sphereGeometry args={[radius, segs, segs]} />
        {shaderMaterial ? (
          <primitive object={shaderMaterial} attach="material" />
        ) : (
          <meshStandardMaterial
            map={albedoTexture}
            normalMap={normalTexture || undefined}
            roughness={preset.roughness}
            metalness={preset.metalness}
            emissive={highlighted ? "#0284c7" : "#000000"}
            emissiveIntensity={highlighted ? 0.35 : 0.0}
          />
        )}
      </mesh>

      {/* Dynamic Tropospheric Cloud Deck (Earth & Cloud-Covered Exoplanets) */}
      {preset.hasCloudLayer && qualityTier !== "LOW_POWER" && (
        <mesh ref={cloudMeshRef}>
          <sphereGeometry args={[radius * 1.014, Math.max(16, segs / 2), Math.max(16, segs / 2)]} />
          <meshStandardMaterial
            color="#f8fafc"
            transparent
            opacity={0.22}
            roughness={0.9}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Rayleigh & Mie Atmospheric Scattering Shell (Absent on Moon & Airless Bodies) */}
      {shouldRenderAtmosphere && (
        <ScientificAtmosphere
          objectId={`${objectId}_atmosphere`}
          planetRadius={radius}
          atmosphereRadiusRatio={preset.atmosphereRadiusRatio}
          opticalDepth={preset.atmosphereOpticalDepth}
          rayleighColorHex={preset.atmosphereRayleighHex}
          mieColorHex={preset.atmosphereMieHex}
          sunDirection={terminator.sunDirection}
          qualityTier={qualityTier}
          sphereSegments={segs}
          highlightStrength={highlighted ? 0.65 : 0.0}
          onSelect={onSelectObject ? () => onSelectObject(objectId) : undefined}
        />
      )}

      {/* Planetary Ring System (Saturn C/B/Cassini/A Rings & Uranus Epsilon Ring) */}
      {preset.hasRingSystem && ringTexture && (
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry
            args={[
              radius * (preset.ringInnerRadiusRatio ?? 1.25),
              radius * (preset.ringOuterRadiusRatio ?? 2.25),
              Math.max(32, segs),
            ]}
          />
          <meshStandardMaterial
            map={ringTexture}
            side={THREE.DoubleSide}
            transparent
            opacity={0.9}
            roughness={0.7}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}
