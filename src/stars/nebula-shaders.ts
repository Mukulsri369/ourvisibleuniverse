/**
 * Astrophysical Nebula Simulation & Volumetric Shaders
 *
 * Supports 5 distinct astrophysical classes:
 * 1. Emission Nebulae (H II regions): Photoionized by O/B stellar UV flux.
 *    Emission lines: Hα (656.3 nm), [O III] (500.7 nm), [S II] (671.6 nm), Hβ (486.1 nm).
 * 2. Reflection Nebulae: Interstellar dust grains scattering light from nearby stars.
 *    Rayleigh-type scattering phase function P(θ) ∝ 1 + cos²(θ), blue-shifted.
 * 3. Dark Nebulae (Molecular Clouds): Extreme optical depth τ_V >> 1, Beer-Lambert extinction
 *    I = I₀ exp(-τ), background star absorption and reddening.
 * 4. Planetary Nebulae: Expanding ionized gas shells (20-40 km/s) from asymptotic giant branch (AGB) stars,
 *    stratified ionization: inner [O III] core, outer [N II]/Hα envelope surrounding a central White Dwarf.
 * 5. Supernova Remnants: Blast wave shock heating, synchrotron radiation from relativistic electrons,
 *    and turbulent Rayleigh-Taylor filamentary structures.
 *
 * Color Palettes:
 * - Narrowband Hubble Palette (SHO: [S II]=Red, Hα=Green, [O III]=Blue)
 * - True Optical Human-Eye RGB
 * - High-Energy Multiwavelength (Chandra X-ray + Hubble Optical + Spitzer IR)
 */

import * as THREE from "three";

export type NebulaClass = "emission" | "reflection" | "dark" | "planetary" | "supernova_remnant";

export type FilterPalette = "narrowband_sho" | "true_color_rgb" | "multiwavelength_chandra_hubble";

export interface NebulaSpectralProfile {
  classification: NebulaClass;
  palette: FilterPalette;
  paletteLabel: string;
  primaryLine: string; // e.g. "H-alpha 656.3 nm"
  secondaryLine: string; // e.g. "[O III] 500.7 nm"
  opticalDepthTau: number;
  expansionVelocityKmS?: number;
  ionizingSource?: string;
  scientificDescription: string;
}

export const NEBULA_SPECTRAL_DATA: Record<string, NebulaSpectralProfile> = {
  m42: {
    classification: "emission",
    palette: "true_color_rgb",
    paletteLabel: "True Optical RGB (Hα + [O III] Recombination)",
    primaryLine: "Hα (656.3 nm, deep ruby red)",
    secondaryLine: "[O III] (500.7 nm, forbidden green/teal)",
    opticalDepthTau: 1.2,
    ionizingSource: "Trapezium Cluster (Theta-1 Orionis C, O7V)",
    scientificDescription:
      "Active massive star-forming region photoionized by the Trapezium cluster. Visual appearance shows characteristic pink/ruby Hα emission with central teal [O III] core.",
  },
  m16: {
    classification: "emission",
    palette: "narrowband_sho",
    paletteLabel: "Hubble Narrowband Palette (SHO: [S II]=R, Hα=G, [O III]=B)",
    primaryLine: "[S II] 671.6 nm & Hα 656.3 nm",
    secondaryLine: "[O III] 500.7 nm",
    opticalDepthTau: 2.4,
    ionizingSource: "Open cluster NGC 6611",
    scientificDescription:
      "Pillars of Creation: dense columns of cold molecular hydrogen and dust resisting photoevaporation by intense ultraviolet radiation from young massive stars.",
  },
  carina: {
    classification: "emission",
    palette: "narrowband_sho",
    paletteLabel: "Hubble/JWST Narrowband Infrared/Optical Composite",
    primaryLine: "Hα (656.3 nm)",
    secondaryLine: "[O III] (500.7 nm) & Pa-alpha",
    opticalDepthTau: 3.1,
    ionizingSource: "Trumpler 14 & 16 clusters, WR 25, Eta Carinae",
    scientificDescription:
      "One of the largest and most luminous H II complexes in the galaxy. Features the Cosmic Cliffs sculpted by stellar winds.",
  },
  pleiades_nebula: {
    classification: "reflection",
    palette: "true_color_rgb",
    paletteLabel: "True Optical RGB (Rayleigh Dust Scattering)",
    primaryLine: "Continuous scattered B-star spectrum",
    secondaryLine: "Interstellar silicate grain absorption",
    opticalDepthTau: 0.8,
    ionizingSource: "Merope & Maia (hot B-type Pleiades cluster stars)",
    scientificDescription:
      "A transient interstellar dust cloud currently passing through the Pleiades cluster. Light from B-type stars is scattered predominantly in the blue due to Rayleigh-like grain scattering.",
  },
  witch_head: {
    classification: "reflection",
    palette: "true_color_rgb",
    paletteLabel: "True Optical RGB (Scattered Rigel Starlight)",
    primaryLine: "Scattered stellar continuum",
    secondaryLine: "C-H aromatic vibrational bands",
    opticalDepthTau: 0.6,
    ionizingSource: "Rigel (Beta Orionis, B8Ia supergiant)",
    scientificDescription:
      "Faint reflection nebula illuminated by distant supergiant Rigel. Fine dust particles reflect blue light much more efficiently than red light.",
  },
  horsehead: {
    classification: "dark",
    palette: "true_color_rgb",
    paletteLabel: "Optical Absorption Silhouette Against IC 434",
    primaryLine: "Extinction A_V > 15 mag",
    secondaryLine: "Hα (background emission sheet IC 434)",
    opticalDepthTau: 18.5,
    ionizingSource: "Sigma Orionis (background illuminator)",
    scientificDescription:
      "Dense cold molecular gas and dust cloud (Barnard 33) seen in dark silhouette absorbing the red Hα emission from background nebula IC 434.",
  },
  barnard68: {
    classification: "dark",
    palette: "true_color_rgb",
    paletteLabel: "Bok Globule Optical Extinction (A_V ≈ 35 mag)",
    primaryLine: "Cold molecular CO, H2 dust absorption",
    secondaryLine: "Near-infrared transparency window",
    opticalDepthTau: 32.0,
    scientificDescription:
      "Extremely dense, isolated Bok globule on the verge of gravitational collapse into a protostar. Completely opaque in optical wavelengths.",
  },
  m57: {
    classification: "planetary",
    palette: "true_color_rgb",
    paletteLabel: "True Optical Ionization Stratification",
    primaryLine: "[O III] 500.7 nm (central blue-green)",
    secondaryLine: "Hα & [N II] 658.4 nm (outer red ring)",
    opticalDepthTau: 0.4,
    expansionVelocityKmS: 25.0,
    ionizingSource: "Central White Dwarf (T_eff ≈ 125,000 K)",
    scientificDescription:
      "Toroidal planetary nebula shell ejected ~4,000 years ago. Ionization stratification produces an inner helium/[O III] zone surrounded by an outer [N II]/Hα shell.",
  },
  helix: {
    classification: "planetary",
    palette: "narrowband_sho",
    paletteLabel: "Narrowband & Infrared Multi-Shell Composite",
    primaryLine: "[O III] 500.7 nm",
    secondaryLine: "Hα 656.3 nm & [N II]",
    opticalDepthTau: 0.5,
    expansionVelocityKmS: 32.0,
    ionizingSource: "Central Subdwarf O star / White Dwarf",
    scientificDescription:
      "Nearest bright planetary nebula with thousands of gaseous cometary knots shaped by photo-evaporating stellar winds.",
  },
  cats_eye: {
    classification: "planetary",
    palette: "narrowband_sho",
    paletteLabel: "Hubble Narrowband Concentric Shell Palette",
    primaryLine: "[O III] & Hα",
    secondaryLine: "[N II] 658.4 nm",
    opticalDepthTau: 0.7,
    expansionVelocityKmS: 20.0,
    ionizingSource: "Central hot binary white dwarf / Wolf-Rayet nucleus",
    scientificDescription:
      "Structurally complex planetary nebula displaying concentric mass-loss shells ejected in 1,500-year intervals during AGB thermal pulses.",
  },
  butterfly: {
    classification: "planetary",
    palette: "narrowband_sho",
    paletteLabel: "Bipolar High-Excitation Narrowband",
    primaryLine: "[O III] & [Ne V] extreme excitation",
    secondaryLine: "Hα & [S II]",
    opticalDepthTau: 1.5,
    expansionVelocityKmS: 38.0,
    ionizingSource: "Obscured central white dwarf (T_eff > 200,000 K)",
    scientificDescription:
      "Bipolar planetary nebula with fast stellar outflows collimated by a dense equatorial dust torus.",
  },
  m1: {
    classification: "supernova_remnant",
    palette: "multiwavelength_chandra_hubble",
    paletteLabel: "Multiwavelength: Synchrotron (Blue) + Thermal Filaments (Red)",
    primaryLine: "Synchrotron power-law continuum",
    secondaryLine: "Shocked [O III], [S II], Hα filaments",
    opticalDepthTau: 0.3,
    expansionVelocityKmS: 1500.0,
    ionizingSource: "Crab Pulsar (PSR B0531+21, spin period 33 ms)",
    scientificDescription:
      "Remnant of the SN 1054 supernova. Central blue glow is polarized non-thermal synchrotron radiation from relativistic electrons trapped in pulsar magnetic fields.",
  },
  veil: {
    classification: "supernova_remnant",
    palette: "true_color_rgb",
    paletteLabel: "True Optical RGB Shock-Front Emission",
    primaryLine: "[O III] (cyan leading shock front)",
    secondaryLine: "Hα (ruby red trailing cooling gas)",
    opticalDepthTau: 0.2,
    expansionVelocityKmS: 120.0,
    scientificDescription:
      "Cygnus Loop blast wave expanding into the interstellar medium from a core-collapse supernova ~10,000 years ago.",
  },
  cas_a: {
    classification: "supernova_remnant",
    palette: "multiwavelength_chandra_hubble",
    paletteLabel: "Chandra X-ray (Silicon/Sulfur/Iron) + Hubble Optical",
    primaryLine: "Reverse shock thermal X-rays",
    secondaryLine: "Fast-moving optical ejecta knots",
    opticalDepthTau: 0.8,
    expansionVelocityKmS: 4000.0,
    ionizingSource: "Central compact neutron star / black hole",
    scientificDescription:
      "Youngest known core-collapse supernova remnant in the Milky Way (~340 years old). Shows reverse shock heating and nucleosynthesis ejecta knots.",
  },
};

/**
 * Volumetric GLSL Shader for Nebulae:
 * Integrates physically motivated gas emission lines, Rayleigh forward scattering,
 * dust cloud extinction, and stratified ionization.
 */
export const VOLUMETRIC_NEBULA_SHADER = {
  vertexShader: /* glsl */ `
    #include <common>
    #include <logdepthbuf_pars_vertex>
    varying vec3 vWorldPos;
    varying vec3 vNormal;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPos = worldPosition.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
      #include <logdepthbuf_vertex>
    }
  `,
  fragmentShader: /* glsl */ `
    #include <logdepthbuf_pars_fragment>
    uniform float uTime;
    uniform int uClass; // 0=emission, 1=reflection, 2=dark, 3=planetary, 4=supernova
    uniform int uPalette; // 0=narrowband_sho, 1=true_color_rgb, 2=multiwavelength
    uniform vec3 uPrimaryColor;
    uniform vec3 uSecondaryColor;
    uniform float uOpticalDepth;
    uniform float uTurbulence;
    uniform float uCinematic;

    varying vec3 vWorldPos;
    varying vec3 vNormal;
    varying vec2 vUv;

    // Fast 3D simplex/value noise
    float hash(vec3 p) {
      return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
    }
    float vnoise(vec3 p) {
      vec3 i = floor(p), f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      float n000 = hash(i);
      float n100 = hash(i + vec3(1.0, 0.0, 0.0));
      float n010 = hash(i + vec3(0.0, 1.0, 0.0));
      float n110 = hash(i + vec3(1.0, 1.0, 0.0));
      float n001 = hash(i + vec3(0.0, 0.0, 1.0));
      float n101 = hash(i + vec3(1.0, 0.0, 1.0));
      float n011 = hash(i + vec3(0.0, 1.0, 1.0));
      float n111 = hash(i + vec3(1.0, 1.0, 1.0));
      return mix(mix(mix(n000, n100, f.x), mix(n010, n110, f.x), f.y),
                 mix(mix(n001, n101, f.x), mix(n011, n111, f.x), f.y), f.z);
    }
    float fbm(vec3 p) {
      float v = 0.0;
      float a = 0.5;
      for (int i = 0; i < 4; i++) {
        v += a * vnoise(p);
        p *= 2.05;
        a *= 0.5;
      }
      return v;
    }

    void main() {
      #include <logdepthbuf_fragment>
      vec2 p = vUv * 2.0 - 1.0;
      float r = length(p);
      if (r > 1.0) discard;

      vec3 viewDir = normalize(cameraPosition - vWorldPos);
      float rim = 1.0 - max(dot(vNormal, viewDir), 0.0);

      // 3D procedural density sampling
      vec3 samplePos = vWorldPos * 0.12 + vec3(uTime * 0.015, 0.0, uTime * 0.01);
      float turb = fbm(samplePos * uTurbulence);
      float turb2 = fbm(samplePos * uTurbulence * 2.2 + vec3(3.2, 1.5, 7.8));

      vec3 color = vec3(0.0);
      float alpha = 0.0;

      if (uClass == 0) {
        // EMISSION NEBULA: Photoionized H II gas (Hα red + [O III] teal)
        float coreRadius = smoothstep(0.85, 0.0, r);
        float gasDensity = turb * coreRadius;
        
        // Ionization boundary: hotter interior emits [O III], cooler edge emits Hα
        vec3 haEmission = vec3(0.95, 0.22, 0.38); // 656.3 nm
        vec3 oiiiEmission = vec3(0.18, 0.88, 0.78); // 500.7 nm
        vec3 gasCol = mix(haEmission, oiiiEmission, smoothstep(0.65, 0.15, r) * turb2);

        color = gasCol * (0.8 + 0.4 * turb);
        alpha = clamp(gasDensity * 0.82, 0.0, 0.95);

      } else if (uClass == 1) {
        // REFLECTION NEBULA: Rayleigh scattering (∝ λ⁻⁴), dusty blue haze
        float phaseAngle = dot(viewDir, vec3(0.0, 1.0, 0.0));
        float rayleighPhase = 0.75 * (1.0 + phaseAngle * phaseAngle);
        float cloud = turb * smoothstep(0.95, 0.1, r);
        
        vec3 rayleighBlue = vec3(0.38, 0.62, 0.98);
        color = rayleighBlue * rayleighPhase * (0.9 + 0.3 * turb2);
        alpha = clamp(cloud * 0.72, 0.0, 0.9);

      } else if (uClass == 2) {
        // DARK NEBULA: High optical extinction silhouette (Beer-Lambert Law)
        float edgeTurb = fbm(vec3(p * 3.5, uTime * 0.01));
        float cloudShape = smoothstep(0.85, 0.35, r + edgeTurb * 0.25);
        float opticalDepth = cloudShape * uOpticalDepth;
        float transmission = exp(-opticalDepth);
        
        // Dark silhouette with subtle warm infrared reddening at thin edges
        vec3 edgeReddening = vec3(0.22, 0.08, 0.03);
        color = edgeReddening * (1.0 - transmission) * (0.3 + 0.7 * edgeTurb);
        alpha = (1.0 - transmission) * 0.96;

      } else if (uClass == 3) {
        // PLANETARY NEBULA: Stratified expanding shell with central cavity
        float shellInner = 0.42;
        float shellOuter = 0.82;
        float shell = smoothstep(shellInner - 0.15, shellInner, r) * (1.0 - smoothstep(shellOuter, shellOuter + 0.15, r));
        float knotty = shell * (0.55 + 0.45 * turb);

        // Stratification: inner [O III] cyan, outer [N II]/Hα crimson
        vec3 innerOIII = vec3(0.15, 0.92, 0.85);
        vec3 outerHa = vec3(0.92, 0.28, 0.22);
        vec3 shellCol = mix(outerHa, innerOIII, smoothstep(shellOuter, shellInner, r));

        color = shellCol * knotty * 1.25;
        alpha = clamp(knotty * 0.88, 0.0, 0.95);

      } else {
        // SUPERNOVA REMNANT: Synchrotron core + filamentary blast shock
        float synchrotron = exp(-pow(r / 0.45, 2.0));
        float shockShell = smoothstep(0.68, 0.74, r) * (1.0 - smoothstep(0.84, 0.92, r));
        float filaments = shockShell * (0.3 + 0.7 * turb2);

        vec3 synchrotronBlue = vec3(0.35, 0.65, 1.0); // Non-thermal power law
        vec3 shockFilamentRed = vec3(1.0, 0.32, 0.28); // Thermal shock gas

        color = synchrotronBlue * synchrotron * 1.2 + shockFilamentRed * filaments * 1.5;
        alpha = clamp((synchrotron * 0.65 + filaments * 0.85), 0.0, 0.95);
      }

      // In Cinematic mode, boost dynamic range and contrast
      color = mix(color, color * 1.35, uCinematic);

      gl_FragColor = vec4(color, alpha);
    }
  `,
};
