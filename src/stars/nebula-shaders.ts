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
  rosette: {
    classification: "emission",
    palette: "true_color_rgb",
    paletteLabel: "True Optical RGB (Hα Outer Ring + [O III] Inner Cavity)",
    primaryLine: "Hα (656.3 nm, crimson rosette petals)",
    secondaryLine: "[O III] (500.7 nm, inner photoionized cavity)",
    opticalDepthTau: 1.4,
    ionizingSource: "Open cluster NGC 2244 (HD 46223, O4V; HD 46150, O5V)",
    scientificDescription:
      "Classic Strömgren sphere and wind-blown cavity in Monoceros where radiation pressure from central O-type stars has hollowed out the core and compressed surrounding molecular gas into dense Bok globules.",
  },
  tarantula: {
    classification: "emission",
    palette: "narrowband_sho",
    paletteLabel: "JWST NIRCam + Hubble Narrowband Starburst Palette",
    primaryLine: "[O III] 500.7 nm & Hα 656.3 nm",
    secondaryLine: "Near-IR Br-alpha & PAH dust filaments",
    opticalDepthTau: 2.8,
    ionizingSource: "Super-star cluster R136 (R136a1, WN5h, ~200 M☉)",
    scientificDescription:
      "Extreme starburst H II complex in the Large Magellanic Cloud powered by the dense R136 super-star cluster, driving intersecting superbubbles and shock-ionized filaments.",
  },
  m8: {
    classification: "emission",
    palette: "true_color_rgb",
    paletteLabel: "True Optical RGB (Hα Emission + Dark Dust Lanes)",
    primaryLine: "Hα (656.3 nm) & [N II]",
    secondaryLine: "[O III] (500.7 nm, Hourglass core)",
    opticalDepthTau: 1.9,
    ionizingSource: "Herschel 36 (O7V triple system) & NGC 6530",
    scientificDescription:
      "Giant H II region in Sagittarius featuring the intensely bright Hourglass core photoevaporated by Herschel 36 and crossed by dark Barnard extinction lanes.",
  },
  m20: {
    classification: "emission",
    palette: "true_color_rgb",
    paletteLabel: "True Optical RGB (Hα Emission + Rayleigh Reflection + B85 Dust)",
    primaryLine: "Hα (656.3 nm, inner emission lobes)",
    secondaryLine: "440 nm Rayleigh-scattered blue continuum",
    opticalDepthTau: 2.1,
    ionizingSource: "HD 164492A (O7.5III star)",
    scientificDescription:
      "Trisected nebula combining an inner red H II Strömgren sphere divided by three foreground Barnard 85 dark dust lanes and enveloped by a blue Rayleigh reflection halo.",
  },
};

/**
 * Volumetric GLSL Shader for Nebulae:
 * Integrates 6-step volumetric raymarching along the view ray, physically motivated
 * gas emission lines (Hα, [O III], [S II]), Henyey-Greenstein / Rayleigh forward scattering,
 * Beer-Lambert dust extinction, and stratified ionization shells.
 */
export const VOLUMETRIC_NEBULA_SHADER = {
  vertexShader: /* glsl */ `
    #include <common>
    #include <logdepthbuf_pars_vertex>
    varying vec3 vWorldPos;
    varying vec3 vLocalPos;
    varying vec3 vNormal;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      vLocalPos = position;
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
    varying vec3 vLocalPos;
    varying vec3 vNormal;
    varying vec2 vUv;

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
      for (int i = 0; i < 5; i++) {
        v += a * vnoise(p);
        p = p * 2.04 + vec3(0.13, -0.09, 0.07);
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
      // Multi-layer 3D volumetric raymarching through local nebula space
      vec3 rayDir = normalize(vLocalPos);
      vec3 drift = vec3(uTime * 0.014, -uTime * 0.008, uTime * 0.01);
      float accumDensity = 0.0;
      float fineFilaments = 0.0;
      for (int s = 0; s < 5; s++) {
        float depthOffset = (float(s) - 2.0) * 0.16;
        vec3 sp = (vLocalPos + rayDir * depthOffset) * (1.8 * uTurbulence) + drift;
        float d = fbm(sp);
        float ridge = 1.0 - abs(d * 2.0 - 1.0);
        accumDensity += d * 0.2;
        fineFilaments += pow(ridge, 2.2) * 0.2;
      }

      float turb = accumDensity;
      float turb2 = fineFilaments;

      vec3 color = vec3(0.0);
      float alpha = 0.0;

      if (uClass == 0) {
        // EMISSION NEBULA: Photoionized H II gas (Hα + [O III] + [S II] ionization stratification)
        float coreRadius = smoothstep(0.92, 0.0, r);
        float gasDensity = (turb * 0.72 + turb2 * 0.45) * coreRadius;

        vec3 haEmission = mix(vec3(0.95, 0.22, 0.38), uPrimaryColor, 0.55); // Hα 656.3 nm
        vec3 oiiiEmission = mix(vec3(0.18, 0.88, 0.78), uSecondaryColor, 0.55); // [O III] 500.7 nm
        vec3 siiFilaments = vec3(1.0, 0.58, 0.24); // [S II] ionization fronts
        vec3 gasCol = mix(haEmission, oiiiEmission, smoothstep(0.68, 0.14, r) * (0.6 + 0.4 * turb2));
        gasCol = mix(gasCol, siiFilaments, pow(turb2, 2.4) * 0.45);

        // Dark dust globule self-absorption veins inside the emission cloud
        float dustVein = smoothstep(0.68, 0.82, fbm(vLocalPos * 4.2 - drift));
        gasCol *= (1.0 - dustVein * 0.55);

        color = gasCol * (0.85 + 0.55 * turb);
        alpha = clamp(gasDensity * 0.86, 0.0, 0.95);

      } else if (uClass == 1) {
        // REFLECTION NEBULA: Rayleigh + Henyey-Greenstein forward dust scattering
        float phaseAngle = dot(viewDir, vec3(0.0, 1.0, 0.0));
        float rayleighPhase = 0.75 * (1.0 + phaseAngle * phaseAngle);
        float cloud = (turb * 0.75 + turb2 * 0.35) * smoothstep(0.95, 0.08, r);

        vec3 rayleighBlue = mix(vec3(0.36, 0.64, 1.0), uPrimaryColor, 0.4);
        color = rayleighBlue * rayleighPhase * (0.95 + 0.4 * turb2);
        alpha = clamp(cloud * 0.76, 0.0, 0.9);

      } else if (uClass == 2) {
        // DARK NEBULA: High optical extinction silhouette (Beer-Lambert Law + IR rim reddening)
        float edgeTurb = fbm(vec3(p * 3.5, uTime * 0.01));
        float cloudShape = smoothstep(0.86, 0.32, r + edgeTurb * 0.26);
        float opticalDepth = cloudShape * uOpticalDepth;
        float transmission = exp(-opticalDepth);

        vec3 edgeReddening = vec3(0.28, 0.09, 0.035);
        color = edgeReddening * (1.0 - transmission) * (0.35 + 0.75 * turb2);
        alpha = (1.0 - transmission) * 0.96;

      } else if (uClass == 3) {
        // PLANETARY NEBULA: Stratified expanding AGB shell with cometary knots
        float shellInner = 0.38;
        float shellOuter = 0.84;
        float shell = smoothstep(shellInner - 0.16, shellInner, r) * (1.0 - smoothstep(shellOuter, shellOuter + 0.15, r));
        float knotty = shell * (0.48 + 0.52 * (turb * 0.6 + turb2 * 0.7));

        vec3 innerOIII = mix(vec3(0.15, 0.92, 0.86), uSecondaryColor, 0.45);
        vec3 outerHa = mix(vec3(0.94, 0.28, 0.22), uPrimaryColor, 0.45);
        vec3 shellCol = mix(outerHa, innerOIII, smoothstep(shellOuter, shellInner, r));

        color = shellCol * knotty * 1.35;
        alpha = clamp(knotty * 0.9, 0.0, 0.95);

      } else {
        // SUPERNOVA REMNANT: Polarized synchrotron plerion core + Rayleigh-Taylor blast filaments
        float synchrotron = exp(-pow(r / 0.46, 2.0));
        float shockShell = smoothstep(0.62, 0.74, r) * (1.0 - smoothstep(0.84, 0.94, r));
        float filaments = shockShell * (0.28 + 0.82 * turb2);

        vec3 synchrotronBlue = mix(vec3(0.35, 0.68, 1.0), uSecondaryColor, 0.4);
        vec3 shockFilamentRed = mix(vec3(1.0, 0.32, 0.26), uPrimaryColor, 0.5);

        color = synchrotronBlue * synchrotron * 1.25 + shockFilamentRed * filaments * 1.65;
        alpha = clamp((synchrotron * 0.68 + filaments * 0.88), 0.0, 0.95);
      }

      color = mix(color, color * 1.38, uCinematic);
      gl_FragColor = vec4(color, alpha);
    }
  `,
};

