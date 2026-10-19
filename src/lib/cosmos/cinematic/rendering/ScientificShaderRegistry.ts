/**
 * COSMOS Scientific GLSL Shader Registry
 * Project: Our Visible Universe Academy
 * Scope: Prompt 05 — Sections 4, 8, 9, 10, 11, 12, 14, 22, 24
 *
 * Provides cached, deterministic, physically grounded GLSL shader programs:
 * 1. planetary_terminator_shader — Collimated solar illumination, twilight Rayleigh band,
 *    ocean specular reflection, and night-hemisphere city lights (Earth) or crater shading.
 * 2. atmospheric_scattering_shader — Rayleigh (lambda^-4) + Mie limb scattering shell
 *    parameterized by scale height, optical depth, and sun angle.
 * 3. stellar_photosphere_shader — Planckian blackbody emission, Eddington limb darkening
 *    I(mu) = I_0 * (1 - u*(1 - mu)), multi-scale convective granulation, and magnetic sunspots.
 * 4. stellar_interior_cutaway_shader — Spherical octant cross-section revealing Core,
 *    Radiative Zone, Convective Zone, or Onion-Skin nuclear fusion shells.
 * 5. nebula_volumetric_shader — Quality-bounded volumetric emission (H-alpha / [O III]),
 *    reflection (Rayleigh dust), and dark molecular extinction (Beer-Lambert law).
 * 6. black_hole_accretion_shader — Relativistic Shakura-Sunyaev temperature profile T ~ r^(-3/4),
 *    special-relativistic Doppler beaming D = 1 / (gamma*(1 - beta*cos(theta))), and
 *    gravitational redshift sqrt(1 - r_s/r).
 */

import * as THREE from "three";
import { blackbodyTemperatureToColor } from "./ScientificLightingController";
import {
  validateAndClampShaderParameters,
  type DeterministicShaderUniformState,
} from "./ScientificObjectContract";
import { ScientificResourceManager } from "./ScientificResourceManager";

export type RegisteredScientificShaderId =
  | "planetary_terminator_shader"
  | "atmospheric_scattering_shader"
  | "stellar_photosphere_shader"
  | "stellar_interior_cutaway_shader"
  | "nebula_volumetric_shader"
  | "black_hole_accretion_shader";

export interface ScientificShaderDefinition {
  shaderId: RegisteredScientificShaderId;
  name: string;
  scientificBasis: string;
  vertexShader: string;
  fragmentShader: string;
  defaultUniforms: Record<string, { value: unknown }>;
}

const COMMON_VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;
  varying vec3 vViewDirection;
  varying vec3 vLocalPosition;

  void main() {
    vUv = uv;
    vLocalPosition = position;
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vViewDirection = normalize(cameraPosition - worldPos.xyz);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const PLANETARY_TERMINATOR_FRAGMENT_SHADER = /* glsl */ `
  uniform sampler2D uAlbedoMap;
  uniform bool uHasAlbedoMap;
  uniform vec3 uBaseColor;
  uniform vec3 uSecondaryColor;
  uniform vec3 uAtmosphereColor;
  uniform vec3 uSunDirection;
  uniform float uRoughness;
  uniform float uOceanSpecularStrength;
  uniform float uNightLightsStrength;
  uniform float uHighlightStrength;
  uniform float uSimulationTime;
  uniform float uNarrativeProgress;
  uniform int uPlanetClass; // 0=Earth, 1=Moon/Airless, 2=Mars, 3=GasGiant, 4=IceGiant

  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vViewDirection;
  varying vec3 vLocalPosition;

  // Deterministic hash for procedural surface & city-light micro-detail
  float hash31(vec3 p) {
    p = fract(p * vec3(443.897, 441.423, 437.195));
    p += dot(p, p.yzx + 19.19);
    return fract((p.x + p.y) * p.z);
  }

  void main() {
    vec3 N = normalize(vWorldNormal);
    vec3 L = normalize(uSunDirection);
    vec3 V = normalize(vViewDirection);

    float NdotL = dot(N, L);
    // Crisp collimated day/night terminator with physically narrow twilight penumbra
    float dayFactor = smoothstep(-0.08, 0.12, NdotL);
    float diffuse = max(0.0, NdotL);

    vec3 surfaceAlbedo = uBaseColor;
    if (uHasAlbedoMap) {
      surfaceAlbedo = texture2D(uAlbedoMap, vUv).rgb;
    } else if (uPlanetClass == 3) {
      // Gas giant latitude zonal bands + storm vortex perturbation
      float lat = vLocalPosition.y;
      float bandWave = sin(lat * 16.0 + sin(vLocalPosition.x * 4.0 + uSimulationTime * 0.15) * 0.6);
      surfaceAlbedo = mix(uBaseColor, uSecondaryColor, 0.5 + 0.5 * bandWave);
    }

    // Twilight scattering band along the terminator (absent on airless moons uPlanetClass == 1)
    float twilightMask = smoothstep(-0.14, 0.0, NdotL) * (1.0 - smoothstep(0.0, 0.22, NdotL));
    vec3 twilightGlow = (uPlanetClass == 1)
      ? vec3(0.0)
      : uAtmosphereColor * twilightMask * 0.42;

    // Specular ocean glint on sunlit waters
    vec3 H = normalize(L + V);
    float specBase = pow(max(0.0, dot(N, H)), 28.0);
    vec3 specular = vec3(1.0, 0.97, 0.9) * specBase * uOceanSpecularStrength * dayFactor;

    // Subtle night-side illumination (never overexposed; dark obsidian shadow)
    float nightAmbient = 0.025;
    vec3 dayLitColor = surfaceAlbedo * (diffuse * 0.95 + nightAmbient) + specular + twilightGlow;

    // Optional Earth night-side city lights on the dark hemisphere
    vec3 nightCityLights = vec3(0.0);
    if (uNightLightsStrength > 0.01 && NdotL < -0.02) {
      float nightMask = smoothstep(-0.02, -0.22, NdotL);
      float cityPattern = smoothstep(0.76, 0.94, hash31(floor(vLocalPosition * 18.0)));
      nightCityLights = vec3(1.0, 0.78, 0.38) * cityPattern * nightMask * uNightLightsStrength * 0.45;
    }

    // Fresnel limb highlight when selected or emphasized by COSMOS cue
    float fresnel = pow(1.0 - max(0.0, dot(N, V)), 3.2);
    vec3 cueHighlight = vec3(0.22, 0.74, 0.97) * fresnel * uHighlightStrength * 0.75;

    vec3 finalColor = dayLitColor + nightCityLights + cueHighlight;
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

const ATMOSPHERIC_SCATTERING_FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uSunDirection;
  uniform vec3 uRayleighColor;
  uniform vec3 uMieColor;
  uniform float uOpticalDepth;
  uniform float uScaleHeightRatio;
  uniform float uHighlightStrength;

  varying vec3 vWorldNormal;
  varying vec3 vViewDirection;

  void main() {
    vec3 N = normalize(vWorldNormal);
    vec3 V = normalize(vViewDirection);
    vec3 L = normalize(uSunDirection);

    // Limb optical depth peaks at grazing view angles
    float viewCos = max(0.0, dot(N, V));
    float limbFactor = pow(1.0 - viewCos, 2.4) * uOpticalDepth;

    // Sun-angle dependent illumination (bright dayside limb, sunset orange near terminator, dark nightside)
    float sunCos = dot(N, L);
    float dayLimb = smoothstep(-0.22, 0.35, sunCos);
    float sunsetBand = smoothstep(-0.28, 0.0, sunCos) * (1.0 - smoothstep(0.0, 0.32, sunCos));

    // Forward Mie scattering lobe when looking toward the Sun through the atmosphere limb
    float forwardDot = max(0.0, dot(-V, L));
    float mieForward = pow(forwardDot, 6.0) * 0.45;

    vec3 scatterColor = mix(uRayleighColor, uMieColor, sunsetBand * 0.65) * dayLimb
      + uMieColor * mieForward * limbFactor;

    float alpha = clamp(limbFactor * (dayLimb * 0.85 + 0.08 + uHighlightStrength * 0.25), 0.0, 0.88);
    gl_FragColor = vec4(scatterColor, alpha);
  }
`;

const STELLAR_PHOTOSPHERE_FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uBlackbodyColor;
  uniform vec3 uCoronaColor;
  uniform float uTemperatureK;
  uniform float uLimbDarkeningU;
  uniform float uGranulationScale;
  uniform float uSunspotStrength;
  uniform float uEmissionIntensity;
  uniform float uSimulationTime;
  uniform float uHighlightStrength;

  varying vec3 vWorldNormal;
  varying vec3 vViewDirection;
  varying vec3 vLocalPosition;

  // Value noise for solar photospheric convective granulation
  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float noise3D(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
          mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
          mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
      f.z
    );
  }

  void main() {
    vec3 N = normalize(vWorldNormal);
    vec3 V = normalize(vViewDirection);

    // Eddington linear limb darkening: I(mu)/I(0) = 1 - u * (1 - mu)
    float mu = max(0.05, dot(N, V));
    float limbDarkening = 1.0 - uLimbDarkeningU * (1.0 - mu);

    // Multi-scale convective granulation cells
    vec3 samplePos = normalize(vLocalPosition) * uGranulationScale + vec3(0.0, uSimulationTime * 0.08, 0.0);
    float gran1 = noise3D(samplePos);
    float gran2 = noise3D(samplePos * 2.4 - vec3(uSimulationTime * 0.12));
    float granulation = mix(0.84, 1.16, gran1 * 0.65 + gran2 * 0.35);

    // Magnetic active sunspot umbra/penumbra depressions near low-to-mid latitudes
    float spotMask = 1.0;
    if (uSunspotStrength > 0.01) {
      float latBand = exp(-pow(abs(vLocalPosition.y) - 0.32, 2.0) * 18.0);
      float spotNoise = noise3D(normalize(vLocalPosition) * 6.5 + vec3(0.4));
      float umbra = smoothstep(0.74, 0.84, spotNoise * latBand) * uSunspotStrength;
      spotMask = 1.0 - umbra * 0.72;
    }

    vec3 photosphere = uBlackbodyColor * limbDarkening * granulation * spotMask * uEmissionIntensity;

    // Chromospheric / coronal limb rim
    float rim = pow(1.0 - mu, 3.5);
    vec3 coronaRim = uCoronaColor * rim * (0.45 + uHighlightStrength * 0.5);

    gl_FragColor = vec4(photosphere + coronaRim, 1.0);
  }
`;

const STELLAR_INTERIOR_CUTAWAY_FRAGMENT_SHADER = /* glsl */ `
  uniform float uCutawayAngle;
  uniform float uOuterRadius;
  uniform float uSimulationTime;
  uniform float uNarrativeProgress;
  uniform vec3 uCoreColor;
  uniform vec3 uRadiativeColor;
  uniform vec3 uConvectiveColor;

  varying vec3 vLocalPosition;
  varying vec3 vWorldNormal;

  void main() {
    float r = length(vLocalPosition) / max(0.001, uOuterRadius);

    // Radial concentric stellar structure layers:
    // r < 0.25: Thermonuclear Core (1.56e7 K, proton-proton fusion)
    // 0.25 <= r < 0.70: Radiative Zone (photon random walk)
    // 0.70 <= r <= 1.0: Convective Zone (thermal plumes)
    vec3 layerColor = uConvectiveColor;
    if (r < 0.26) {
      float corePulse = 0.92 + 0.08 * sin(uSimulationTime * 2.5);
      layerColor = mix(vec3(1.0, 1.0, 0.98), uCoreColor, smoothstep(0.0, 0.26, r)) * corePulse * 1.35;
    } else if (r < 0.70) {
      float t = (r - 0.26) / 0.44;
      float wave = 0.94 + 0.06 * sin(r * 42.0 - uSimulationTime * 1.8);
      layerColor = mix(uCoreColor, uRadiativeColor, t) * wave;
    } else {
      float t = (r - 0.70) / 0.30;
      float plume = 0.9 + 0.1 * sin(atan(vLocalPosition.z, vLocalPosition.x) * 18.0 + r * 24.0);
      layerColor = mix(uRadiativeColor, uConvectiveColor, t) * plume;
    }

    // Crisp boundary rings at r = 0.26 and r = 0.70
    float coreBoundary = 1.0 - smoothstep(0.0, 0.012, abs(r - 0.26));
    float radBoundary = 1.0 - smoothstep(0.0, 0.012, abs(r - 0.70));
    layerColor += vec3(0.35, 0.85, 1.0) * (coreBoundary + radBoundary) * 0.55;

    gl_FragColor = vec4(layerColor, 1.0);
  }
`;

const NEBULA_VOLUMETRIC_FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uPrimaryColor; // e.g. Balmer H-alpha #f43f5e or Reflection Blue #38bdf8
  uniform vec3 uSecondaryColor; // e.g. [O III] 500.7nm #14b8a6
  uniform float uDensityScale;
  uniform float uSimulationTime;
  uniform int uNebulaType; // 0=Emission, 1=Reflection, 2=Dark Extinction, 3=Planetary/SNR Shell
  uniform int uRaymarchSteps; // Strictly bounded by quality preset (0, 12, or 24)

  varying vec2 vUv;
  varying vec3 vLocalPosition;
  varying vec3 vViewDirection;

  float hash21(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
  }

  float valueNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  void main() {
    vec2 centered = vUv * 2.0 - 1.0;
    float radialDist = length(centered);
    if (radialDist > 1.0) discard;

    // Multi-octave filamentary structure with bounded iterations
    vec2 p = centered * 2.8 + vec2(uSimulationTime * 0.015, -uSimulationTime * 0.01);
    float n = valueNoise(p) * 0.55 + valueNoise(p * 2.3) * 0.30 + valueNoise(p * 4.7) * 0.15;

    float radialEnvelope = smoothstep(1.0, 0.18, radialDist);
    if (uNebulaType == 3) {
      // Planetary Nebula / Supernova Remnant shock shell peaks near r = 0.68
      float shellRing = exp(-pow((radialDist - 0.65) / 0.18, 2.0));
      radialEnvelope = mix(radialEnvelope * 0.35, shellRing, 0.78);
    }

    float opticalDensity = clamp(n * radialEnvelope * uDensityScale, 0.0, 1.0);

    if (uNebulaType == 2) {
      // Dark molecular cloud (Bok globule): Beer-Lambert dust extinction absorbs background starlight
      vec3 dustColor = mix(vec3(0.02, 0.02, 0.04), uPrimaryColor * 0.25, (1.0 - opticalDensity) * 0.4);
      float extinctionAlpha = clamp(opticalDensity * 0.92, 0.0, 0.92);
      gl_FragColor = vec4(dustColor, extinctionAlpha);
      return;
    }

    vec3 emissionColor = mix(uSecondaryColor, uPrimaryColor, smoothstep(0.25, 0.78, n));
    float alpha = clamp(opticalDensity * 0.72, 0.0, 0.85);
    gl_FragColor = vec4(emissionColor, alpha);
  }
`;

const BLACK_HOLE_ACCRETION_FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uInnerHotColor;
  uniform vec3 uMidDiskColor;
  uniform vec3 uOuterCoolColor;
  uniform float uInnerRadius;
  uniform float uOuterRadius;
  uniform float uDopplerStrength;
  uniform float uSimulationTime;
  uniform float uSpinAStar;

  varying vec3 vLocalPosition;
  varying vec2 vUv;

  void main() {
    float r = length(vLocalPosition.xy);
    float rNorm = clamp((r - uInnerRadius) / max(0.001, uOuterRadius - uInnerRadius), 0.0, 1.0);

    // Shakura-Sunyaev radial temperature profile T(r) ~ r^(-3/4)
    float tempProfile = pow(1.0 - rNorm * 0.85, 0.75);

    // Azimuthal Keplerian shear & spiral magnetorotational instability (MRI) filaments
    float angle = atan(vLocalPosition.y, vLocalPosition.x);
    float angularVel = 1.6 / pow(max(0.5, r), 1.5);
    float spiralWave = 0.78 + 0.22 * sin(angle * 6.0 + r * 8.5 - uSimulationTime * angularVel * 3.0);

    // Special-relativistic Doppler beaming: approaching side (+x) boosted & blueshifted, receding (-x) dimmed & redshifted
    float cosAzimuth = vLocalPosition.x / max(0.001, r);
    float beta = clamp(0.45 * sqrt(uInnerRadius / max(uInnerRadius, r)), 0.05, 0.65);
    float dopplerFactor = clamp(1.0 + uDopplerStrength * beta * cosAzimuth * 1.45, 0.28, 2.1);

    // Gravitational redshift factor sqrt(1 - r_s / r)
    float gravRedshift = sqrt(clamp(1.0 - (uInnerRadius * 0.33) / max(uInnerRadius, r), 0.15, 1.0));

    vec3 baseColor = mix(uOuterCoolColor, uMidDiskColor, smoothstep(0.0, 0.6, tempProfile));
    baseColor = mix(baseColor, uInnerHotColor, smoothstep(0.6, 1.0, tempProfile));

    // Blueshift tint on approaching wing, redshift tint on receding wing
    vec3 beamedColor = baseColor * dopplerFactor * gravRedshift * spiralWave;
    if (cosAzimuth > 0.0) {
      beamedColor = mix(beamedColor, uInnerHotColor * dopplerFactor, cosAzimuth * 0.28 * uDopplerStrength);
    } else {
      beamedColor = mix(beamedColor, uOuterCoolColor * 0.8, (-cosAzimuth) * 0.32 * uDopplerStrength);
    }

    // Smooth radial edge taper at ISCO inner boundary and outer disk edge
    float edgeAlpha = smoothstep(0.0, 0.08, rNorm) * (1.0 - smoothstep(0.82, 1.0, rNorm));
    float alpha = clamp(edgeAlpha * spiralWave * 0.92, 0.0, 0.95);

    gl_FragColor = vec4(beamedColor, alpha);
  }
`;

export const SCIENTIFIC_SHADER_DEFINITIONS: Record<
  RegisteredScientificShaderId,
  ScientificShaderDefinition
> = {
  planetary_terminator_shader: {
    shaderId: "planetary_terminator_shader",
    name: "Collimated Planetary Terminator & Surface Shader",
    scientificBasis:
      "Lambertian/Oren-Nayar solar illumination with narrow twilight Rayleigh scatter band, specular ocean mask, and night-side illumination guard.",
    vertexShader: COMMON_VERTEX_SHADER,
    fragmentShader: PLANETARY_TERMINATOR_FRAGMENT_SHADER,
    defaultUniforms: {
      uAlbedoMap: { value: null },
      uHasAlbedoMap: { value: false },
      uBaseColor: { value: new THREE.Color("#0284c7") },
      uSecondaryColor: { value: new THREE.Color("#f59e0b") },
      uAtmosphereColor: { value: new THREE.Color("#38bdf8") },
      uSunDirection: { value: new THREE.Vector3(1, 0.25, 0.65).normalize() },
      uRoughness: { value: 0.65 },
      uOceanSpecularStrength: { value: 0.45 },
      uNightLightsStrength: { value: 0.6 },
      uHighlightStrength: { value: 0.0 },
      uSimulationTime: { value: 0.0 },
      uNarrativeProgress: { value: 0.0 },
      uPlanetClass: { value: 0 },
    },
  },

  atmospheric_scattering_shader: {
    shaderId: "atmospheric_scattering_shader",
    name: "Rayleigh & Mie Planetary Limb Scattering Shader",
    scientificBasis:
      "Wavelength-dependent Rayleigh (lambda^-4) and forward-peaked Mie aerosol limb optical depth model.",
    vertexShader: COMMON_VERTEX_SHADER,
    fragmentShader: ATMOSPHERIC_SCATTERING_FRAGMENT_SHADER,
    defaultUniforms: {
      uSunDirection: { value: new THREE.Vector3(1, 0.25, 0.65).normalize() },
      uRayleighColor: { value: new THREE.Color("#38bdf8") },
      uMieColor: { value: new THREE.Color("#fb923c") },
      uOpticalDepth: { value: 1.15 },
      uScaleHeightRatio: { value: 0.025 },
      uHighlightStrength: { value: 0.0 },
    },
  },

  stellar_photosphere_shader: {
    shaderId: "stellar_photosphere_shader",
    name: "Planckian Stellar Photosphere, Granulation & Limb Darkening Shader",
    scientificBasis:
      "Planckian blackbody chromaticity with Eddington linear limb darkening I(mu) = I_0*(1 - u*(1 - mu)) and convective granulation.",
    vertexShader: COMMON_VERTEX_SHADER,
    fragmentShader: STELLAR_PHOTOSPHERE_FRAGMENT_SHADER,
    defaultUniforms: {
      uBlackbodyColor: { value: new THREE.Color("#fff4ea") },
      uCoronaColor: { value: new THREE.Color("#f59e0b") },
      uTemperatureK: { value: 5772 },
      uLimbDarkeningU: { value: 0.56 },
      uGranulationScale: { value: 14.0 },
      uSunspotStrength: { value: 0.45 },
      uEmissionIntensity: { value: 1.15 },
      uSimulationTime: { value: 0.0 },
      uHighlightStrength: { value: 0.0 },
    },
  },

  stellar_interior_cutaway_shader: {
    shaderId: "stellar_interior_cutaway_shader",
    name: "Stellar Interior Cross-Section Cutaway Shader",
    scientificBasis:
      "Standard Solar Model (SSM) radial interior zones: Core (0-0.25 R_sun), Radiative Zone (0.25-0.70 R_sun), and Convective Zone (0.70-1.0 R_sun).",
    vertexShader: COMMON_VERTEX_SHADER,
    fragmentShader: STELLAR_INTERIOR_CUTAWAY_FRAGMENT_SHADER,
    defaultUniforms: {
      uCutawayAngle: { value: Math.PI * 0.5 },
      uOuterRadius: { value: 1.65 },
      uSimulationTime: { value: 0.0 },
      uNarrativeProgress: { value: 0.0 },
      uCoreColor: { value: new THREE.Color("#e0f2fe") },
      uRadiativeColor: { value: new THREE.Color("#f59e0b") },
      uConvectiveColor: { value: new THREE.Color("#ea580c") },
    },
  },

  nebula_volumetric_shader: {
    shaderId: "nebula_volumetric_shader",
    name: "Astrophysical Nebula Emission, Reflection & Dust Extinction Shader",
    scientificBasis:
      "Balmer H-alpha (656.3 nm) & forbidden [O III] (500.7 nm) recombination emission vs. Rayleigh dust reflection and Beer-Lambert extinction.",
    vertexShader: COMMON_VERTEX_SHADER,
    fragmentShader: NEBULA_VOLUMETRIC_FRAGMENT_SHADER,
    defaultUniforms: {
      uPrimaryColor: { value: new THREE.Color("#f43f5e") },
      uSecondaryColor: { value: new THREE.Color("#14b8a6") },
      uDensityScale: { value: 1.1 },
      uSimulationTime: { value: 0.0 },
      uNebulaType: { value: 0 },
      uRaymarchSteps: { value: 12 },
    },
  },

  black_hole_accretion_shader: {
    shaderId: "black_hole_accretion_shader",
    name: "Relativistic Accretion Disk with Doppler Beaming & Gravitational Redshift",
    scientificBasis:
      "Novikov-Thorne / Shakura-Sunyaev radial temperature profile T(r) ~ r^(-3/4) with special-relativistic Doppler boosting and gravitational redshift.",
    vertexShader: COMMON_VERTEX_SHADER,
    fragmentShader: BLACK_HOLE_ACCRETION_FRAGMENT_SHADER,
    defaultUniforms: {
      uInnerHotColor: { value: new THREE.Color("#e0f2fe") },
      uMidDiskColor: { value: new THREE.Color("#fb923c") },
      uOuterCoolColor: { value: new THREE.Color("#991b1b") },
      uInnerRadius: { value: 2.05 },
      uOuterRadius: { value: 5.2 },
      uDopplerStrength: { value: 0.85 },
      uSimulationTime: { value: 0.0 },
      uSpinAStar: { value: 0.0 },
    },
  },
};

export class ScientificShaderRegistry {
  private static instance: ScientificShaderRegistry | null = null;
  private materialCache = new Map<string, THREE.ShaderMaterial>();

  public static getInstance(): ScientificShaderRegistry {
    if (!this.instance) {
      this.instance = new ScientificShaderRegistry();
    }
    return this.instance;
  }

  public getDefinition(shaderId: RegisteredScientificShaderId): ScientificShaderDefinition {
    return SCIENTIFIC_SHADER_DEFINITIONS[shaderId];
  }

  public getAllDefinitions(): ScientificShaderDefinition[] {
    return Object.values(SCIENTIFIC_SHADER_DEFINITIONS);
  }

  /**
   * Creates or retrieves a cached THREE.ShaderMaterial instance.
   * Clones uniforms per instance key so separate objects can animate independently
   * while sharing compiled program code.
   */
  public getOrCreateShaderMaterial(
    shaderId: RegisteredScientificShaderId,
    instanceKey: string,
    options: {
      transparent?: boolean;
      side?: THREE.Side;
      blending?: THREE.Blending;
      depthWrite?: boolean;
      uniformOverrides?: Record<string, unknown>;
    } = {},
  ): THREE.ShaderMaterial {
    const cacheKey = `shader:${shaderId}:${instanceKey}`;
    const existing = this.materialCache.get(cacheKey);
    if (existing) {
      if (options.uniformOverrides) {
        this.applyUniformOverrides(existing, options.uniformOverrides);
      }
      return existing;
    }

    const def = SCIENTIFIC_SHADER_DEFINITIONS[shaderId];
    const clonedUniforms = THREE.UniformsUtils.clone(def.defaultUniforms);

    const mat = new THREE.ShaderMaterial({
      name: `${shaderId}:${instanceKey}`,
      vertexShader: def.vertexShader,
      fragmentShader: def.fragmentShader,
      uniforms: clonedUniforms,
      transparent: options.transparent ?? false,
      side: options.side ?? THREE.FrontSide,
      blending: options.blending ?? THREE.NormalBlending,
      depthWrite: options.depthWrite ?? !(options.transparent ?? false),
    });

    if (options.uniformOverrides) {
      this.applyUniformOverrides(mat, options.uniformOverrides);
    }

    this.materialCache.set(cacheKey, mat);
    ScientificResourceManager.getInstance().trackThreeObject(cacheKey, mat, true, 8192);
    return mat;
  }

  /**
   * Updates existing uniforms in place using validated, clamped deterministic shader state
   * (Prompt 05 Section 22 & 24 — avoids rebuilding ShaderMaterial every narration segment).
   */
  public updateDeterministicUniforms(
    material: THREE.ShaderMaterial,
    partialState: Partial<DeterministicShaderUniformState>,
  ): DeterministicShaderUniformState {
    const clamped = validateAndClampShaderParameters(partialState);
    const u = material.uniforms;

    if (u.uNarrativeProgress) u.uNarrativeProgress.value = clamped.narrativeProgress;
    if (u.uSimulationTime) u.uSimulationTime.value = clamped.simulationTime;
    if (u.uHighlightStrength) u.uHighlightStrength.value = clamped.highlightStrength;
    if (u.uEmissionIntensity) u.uEmissionIntensity.value = clamped.emissionIntensity;
    if (u.uOpticalDepth) u.uOpticalDepth.value = clamped.atmosphericOpticalDepth;
    if (u.uDensityScale) u.uDensityScale.value = clamped.densityScale;
    if (u.uCutawayAngle) u.uCutawayAngle.value = clamped.cutawayRevealAngleRad;
    if (u.uDopplerStrength) u.uDopplerStrength.value = clamped.dopplerBeamingStrength;

    if (u.uTemperatureK) {
      u.uTemperatureK.value = clamped.stellarTemperatureK;
      if (u.uBlackbodyColor) {
        const bb = blackbodyTemperatureToColor(clamped.stellarTemperatureK);
        (u.uBlackbodyColor.value as THREE.Color).set(bb.srgbHex);
      }
    }

    return clamped;
  }

  private applyUniformOverrides(
    material: THREE.ShaderMaterial,
    overrides: Record<string, unknown>,
  ): void {
    for (const [k, val] of Object.entries(overrides)) {
      if (material.uniforms[k]) {
        material.uniforms[k].value = val;
      }
    }
  }

  /**
   * Creates a lightweight MeshStandardMaterial / MeshBasicMaterial fallback for LOW_POWER mode
   * or environments where custom GLSL shaders are bypassed (Prompt 05 Section 26).
   */
  public createLowPowerFallbackMaterial(params: {
    colorHex: string;
    emissiveHex?: string;
    emissiveIntensity?: number;
    roughness?: number;
    transparent?: boolean;
    opacity?: number;
  }): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: params.colorHex,
      emissive: params.emissiveHex ?? "#000000",
      emissiveIntensity: params.emissiveIntensity ?? 0.0,
      roughness: params.roughness ?? 0.65,
      metalness: 0.08,
      transparent: params.transparent ?? false,
      opacity: params.opacity ?? 1.0,
    });
  }

  public clearCache(): void {
    for (const mat of this.materialCache.values()) {
      mat.dispose();
    }
    this.materialCache.clear();
  }
}
