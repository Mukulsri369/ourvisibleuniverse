/**
 * COSMOS Phonetic & Scientific Notation Expander
 * Project: Our Visible Universe Academy
 * Scope: Prompt 13 Intelligent Voice Narration Engine
 *
 * Converts mathematical formulas, astronomical symbols, exponents,
 * LaTeX syntax, and scientific abbreviations into natural, spoken English/Hindi phonetics
 * without altering the visually displayed text.
 */

import type { CosmosLanguage } from "./cosmos-types";

interface ReplacementRule {
  pattern: RegExp;
  replacement: string | ((substring: string, ...args: any[]) => string);
}

const SCIENTIFIC_ENGLISH_RULES: ReplacementRule[] = [
  // 1. Core Physical & Astronomical Equations (Specific patterns first)
  {
    pattern: /F\s*=\s*G\(?m_?1\s*[*·]?\s*m_?2\)?\s*\/\s*r(?:\^2|²)/gi,
    replacement:
      "gravitational force F equals universal gravitational constant G times mass one times mass two divided by distance r squared",
  },
  {
    pattern: /E\s*=\s*mc(?:\^2|²)/gi,
    replacement: "E equals m c squared, expressing the equivalence of mass and energy",
  },
  {
    pattern: /v\s*=\s*H_?0\s*[*·]?\s*d/gi,
    replacement: "recession velocity v equals Hubble constant H-nought times distance d",
  },
  {
    pattern: /P(?:\^2|²)\s*=\s*a(?:\^3|³)/gi,
    replacement:
      "orbital period P squared equals semi-major axis a cubed, following Kepler's third law",
  },
  {
    pattern: /T(?:\^2|²)\s*=\s*a(?:\^3|³)/gi,
    replacement:
      "orbital period T squared equals semi-major axis a cubed, following Kepler's third law",
  },
  {
    pattern: /L\s*=\s*4\s*π\s*R(?:\^2|²)\s*σ\s*T(?:\^4|⁴)/gi,
    replacement:
      "luminosity L equals four pi R squared times the Stefan-Boltzmann constant sigma times temperature T to the fourth power",
  },
  {
    pattern: /λ_?max\s*=\s*b\s*\/\s*T/gi,
    replacement:
      "peak wavelength lambda max equals Wien's displacement constant b divided by absolute temperature T",
  },
  {
    pattern: /z\s*=\s*\(?λ_?obs\s*-\s*λ_?rest\)?\s*\/\s*λ_?rest/gi,
    replacement:
      "cosmological redshift z equals observed wavelength minus rest wavelength divided by rest wavelength",
  },
  {
    pattern:
      /1\s*\+\s*z\s*=\s*\\frac\{\\lambda_\{obs\}\}\{\\lambda_\{emit\}\}\s*=\s*\\frac\{a\(t_\{obs\}\)\}\{a\(t_\{emit\}\)\}/g,
    replacement:
      "one plus redshift z equals observed wavelength over emitted wavelength, which equals scale factor at observation divided by scale factor at emission",
  },
  {
    pattern: /1\s*\+\s*z\s*=\s*λ_?obs\s*\/\s*λ_?emit/gi,
    replacement: "one plus z equals observed wavelength over emitted wavelength",
  },
  {
    pattern: /G_μν\s*\+\s*Λ\s*g_μν\s*=\s*\(8πG\s*\/\s*c\^4\)\s*T_μν/g,
    replacement:
      "the Einstein tensor plus cosmological constant metric equals eight pi G over c to the fourth times the energy-momentum tensor",
  },
  {
    pattern: /⁵⁶Fe\s*\+\s*γ\s*→\s*13\s*⁴He\s*\+\s*4n/g,
    replacement:
      "iron fifty-six photodisintegrates into thirteen helium-four nuclei and four neutrons",
  },
  {
    pattern: /p\s*\+\s*e[⁻-]\s*→\s*n\s*\+\s*ν_?e/g,
    replacement: "a proton and an electron capture to form a neutron and an electron neutrino",
  },
  {
    pattern: /M_Ch\s*[≈=]\s*1\.44\s*M[☉\u2609]/g,
    replacement: "the Chandrasekhar mass limit of approximately 1.44 solar masses",
  },
  { pattern: /\bM_Ch\b/g, replacement: "Chandrasekhar mass limit" },
  {
    pattern: /Γ\s*<\s*4\/3/g,
    replacement: "adiabatic index gamma less than four thirds",
  },
  {
    pattern: /\br_s\s*=\s*2GM\/c(?:\^2|²)\b/gi,
    replacement: "Schwarzschild radius equals two G M over c squared",
  },
  {
    pattern: /\br_s\s*=\s*\\frac\{2GM\}\{c\^2\}\b/gi,
    replacement: "Schwarzschild radius equals two G M over c squared",
  },
  {
    pattern: /v_?(?:esc|escape)\s*=\s*(?:√|\\sqrt\{)?2GM\/R\}?/gi,
    replacement: "escape velocity equals the square root of two G M over radius R",
  },
  {
    pattern: /\bd\s*=\s*1\s*\/\s*p\b/g,
    replacement: "distance d in parsecs equals one divided by parallax angle p in arcseconds",
  },
  {
    pattern: /\bds\^2\s*=\s*-c\^2\s*dt\^2\s*\+\s*a\^2\(t\)[^$\n]+/g,
    replacement: "the Friedmann-Lemaître-Robertson-Walker spacetime metric",
  },

  // 2. Cosmic Scale Factors & Hubble Rates
  { pattern: /\ba\(t\)(?![a-zA-Z0-9_])/g, replacement: "scale factor a of t" },
  { pattern: /\bH\(t\)(?![a-zA-Z0-9_])/g, replacement: "Hubble expansion rate H of t" },
  { pattern: /\bH\(z\)(?![a-zA-Z0-9_])/g, replacement: "Hubble parameter H at redshift z" },
  { pattern: /\bH_0\b/g, replacement: "Hubble constant H-nought" },
  { pattern: /\bH-0\b/g, replacement: "Hubble constant H-nought" },
  { pattern: /\bk_B\s*T\b/g, replacement: "Boltzmann constant times temperature T" },
  { pattern: /\bk_B\b/g, replacement: "Boltzmann constant" },

  // 3. Powers and Exponents
  { pattern: /\bc\^2\b/g, replacement: "c squared" },
  { pattern: /\bc\^4\b/g, replacement: "c to the fourth power" },
  { pattern: /\br\^2\b/g, replacement: "r squared" },
  { pattern: /\br\^3\b/g, replacement: "r cubed" },
  { pattern: /r²\b/g, replacement: "r squared" },
  { pattern: /r³\b/g, replacement: "r cubed" },

  // 4. Astronomical Masses, Radii & Solar Symbols
  { pattern: /\b(\d+(?:\.\d+)?)\s*M[☉\u2609]/g, replacement: "$1 solar masses" },
  { pattern: /\bM[☉\u2609]/g, replacement: "solar masses" },
  { pattern: /\b(\d+(?:\.\d+)?)\s*M_sun\b/gi, replacement: "$1 solar masses" },
  { pattern: /\bM_sun\b/gi, replacement: "solar mass" },
  { pattern: /\b(\d+(?:\.\d+)?)\s*M_\\odot\b/gi, replacement: "$1 solar masses" },
  { pattern: /\bM_\\odot\b/gi, replacement: "solar mass" },
  { pattern: /\b(\d+(?:\.\d+)?)\s*R[☉\u2609]/g, replacement: "$1 solar radii" },
  { pattern: /\bR[☉\u2609]/g, replacement: "solar radii" },
  { pattern: /\b(\d+(?:\.\d+)?)\s*R_sun\b/gi, replacement: "$1 solar radii" },
  { pattern: /\bR_sun\b/gi, replacement: "solar radius" },
  { pattern: /\b(\d+(?:\.\d+)?)\s*L[☉\u2609]/g, replacement: "$1 solar luminosities" },
  { pattern: /\bL[☉\u2609]/g, replacement: "solar luminosities" },
  { pattern: /\b(\d+(?:\.\d+)?)\s*L_sun\b/gi, replacement: "$1 solar luminosities" },
  { pattern: /\bL_sun\b/gi, replacement: "solar luminosity" },
  { pattern: /\b(\d+(?:\.\d+)?)\s*M_Earth\b/gi, replacement: "$1 Earth masses" },
  { pattern: /\bM_Earth\b/gi, replacement: "Earth mass" },
  { pattern: /\b(\d+(?:\.\d+)?)\s*M_Jup\b/gi, replacement: "$1 Jupiter masses" },

  // 5. Distance & Velocity Units
  { pattern: /\b(\d+(?:\.\d+)?)\s*km\/s\b/gi, replacement: "$1 kilometers per second" },
  { pattern: /\b(\d+(?:\.\d+)?)\s*km\/h\b/gi, replacement: "$1 kilometers per hour" },
  { pattern: /\b(\d+(?:\.\d+)?)\s*AU\b/g, replacement: "$1 Astronomical Units" },
  { pattern: /\b1\s*AU\b/g, replacement: "1 Astronomical Unit" },
  { pattern: /\bAU\b/g, replacement: "Astronomical Units" },
  { pattern: /\b(\d+(?:\.\d+)?)\s*Gly\b/g, replacement: "$1 billion light-years" },
  { pattern: /\b(\d+(?:\.\d+)?)\s*Mly\b/g, replacement: "$1 million light-years" },
  { pattern: /\b(\d+(?:\.\d+)?)\s*kly\b/g, replacement: "$1 thousand light-years" },
  { pattern: /\b(\d+(?:\.\d+)?)\s*ly\b/g, replacement: "$1 light-years" },
  { pattern: /\b1\s*ly\b/g, replacement: "1 light-year" },
  { pattern: /\b(\d+(?:\.\d+)?)\s*Gpc\b/g, replacement: "$1 gigaparsecs" },
  { pattern: /\b(\d+(?:\.\d+)?)\s*Mpc\b/g, replacement: "$1 megaparsecs" },
  { pattern: /\b(\d+(?:\.\d+)?)\s*kpc\b/g, replacement: "$1 kiloparsecs" },
  { pattern: /\b(\d+(?:\.\d+)?)\s*pc\b/g, replacement: "$1 parsecs" },
  { pattern: /\b1\s*pc\b/g, replacement: "1 parsec" },

  // 6. Scientific Density & Metric Units
  { pattern: /\bg\/cm\^?3\b/gi, replacement: "grams per cubic centimeter" },
  { pattern: /\bg\/cm³\b/gi, replacement: "grams per cubic centimeter" },
  { pattern: /\bkg\/m\^?3\b/gi, replacement: "kilograms per cubic meter" },
  { pattern: /\bkg\/m³\b/gi, replacement: "kilograms per cubic meter" },
  { pattern: /\bW\/m\^?2\b/gi, replacement: "watts per square meter" },
  { pattern: /\bW\/m²\b/gi, replacement: "watts per square meter" },
  { pattern: /\bkm\b/gi, replacement: "kilometers" },

  // 7. Temperatures
  { pattern: /([+-]?\d+(?:\.\d+)?)\s*°C\b/g, replacement: "$1 degrees Celsius" },
  { pattern: /\b(\d+(?:\.\d+)?)\s*Kelvin\b/gi, replacement: "$1 Kelvin" },
  { pattern: /\b(\d+(?:\.\d+)?)\s*K\b/g, replacement: "$1 Kelvin" },

  // 8. Scientific Powers of 10
  {
    pattern: /(\d+(?:\.\d+)?)\s*[x×]\s*10\^\{?([+-]?\d+)\}?/gi,
    replacement: (_match, coeff, exp) => `${coeff} times ten to the power of ${exp}`,
  },
  {
    pattern: /\b10\^\{?([+-]?\d+)\}?(?![a-zA-Z0-9_])/g,
    replacement: (_match, exp) => `ten to the power of ${exp}`,
  },

  // 9. Nuclear & Chemical Notations
  { pattern: /⁵⁶Fe/g, replacement: "iron fifty-six" },
  { pattern: /⁴He/g, replacement: "helium-four" },
  { pattern: /¹²C/g, replacement: "carbon-twelve" },
  { pattern: /¹⁶O/g, replacement: "oxygen-sixteen" },
  { pattern: /\bFe-56\b/gi, replacement: "iron fifty-six" },
  { pattern: /\bHe-4\b/gi, replacement: "helium-four" },

  // 10. Greek Symbols in Equations
  { pattern: /\\nu_e\b/g, replacement: "electron neutrino" },
  { pattern: /ν_e\b/g, replacement: "electron neutrino" },
  { pattern: /\\nu\b/g, replacement: "neutrino" },
  { pattern: /ν\b/g, replacement: "neutrino" },
  { pattern: /\\gamma\b/g, replacement: "gamma ray" },
  { pattern: /γ\b/g, replacement: "gamma ray" },
  { pattern: /\\mu\b/g, replacement: "mu" },
  { pattern: /μ\b/g, replacement: "mu" },
  { pattern: /\\rho\b/g, replacement: "density rho" },
  { pattern: /ρ\b/g, replacement: "density rho" },
  { pattern: /\\sigma\b/g, replacement: "sigma" },
  { pattern: /σ\b/g, replacement: "sigma" },
  { pattern: /\\lambda\b/g, replacement: "lambda" },
  { pattern: /λ\b/g, replacement: "lambda" },
  { pattern: /\\pi\b/g, replacement: "pi" },
  { pattern: /π\b/g, replacement: "pi" },
  { pattern: /\\Gamma\b/g, replacement: "adiabatic index gamma" },
  { pattern: /Γ\b/g, replacement: "adiabatic index gamma" },
  { pattern: /\\Lambda\b/g, replacement: "cosmological constant lambda" },
  { pattern: /Λ\b/g, replacement: "cosmological constant lambda" },
  { pattern: /\\Omega\b/g, replacement: "density parameter omega" },
  { pattern: /Ω\b/g, replacement: "density parameter omega" },
  { pattern: /\\Delta\b/g, replacement: "change in" },
  { pattern: /Δ\b/g, replacement: "change in" },
  { pattern: /\\theta\b/g, replacement: "theta" },
  { pattern: /θ\b/g, replacement: "theta" },
  { pattern: /\\alpha\b/g, replacement: "alpha" },
  { pattern: /α\b/g, replacement: "alpha" },

  // 11. Common Mathematical & Comparison Symbols
  { pattern: /\\approx/g, replacement: " approximately equals " },
  { pattern: /\s*≈\s*/g, replacement: " approximately equals " },
  { pattern: /\\sim/g, replacement: " on the order of " },
  { pattern: /\s*~\s*(\d)/g, replacement: " approximately $1" },
  { pattern: /\\propto/g, replacement: " is proportional to " },
  { pattern: /\s*∝\s*/g, replacement: " is proportional to " },
  { pattern: /\\pm/g, replacement: " plus or minus " },
  { pattern: /\s*±\s*/g, replacement: " plus or minus " },
  { pattern: /\\le(?:q)?/g, replacement: " less than or equal to " },
  { pattern: /\s*≤\s*/g, replacement: " less than or equal to " },
  { pattern: /\\ge(?:q)?/g, replacement: " greater than or equal to " },
  { pattern: /\s*≥\s*/g, replacement: " greater than or equal to " },
  { pattern: /\\rightarrow/g, replacement: " leads to " },
  { pattern: /\s*→\s*/g, replacement: " leads to " },
  { pattern: /\\cdot/g, replacement: " times " },
  { pattern: /\\times/g, replacement: " times " },
  { pattern: /\\infty/g, replacement: " infinity " },
  { pattern: /∞/g, replacement: " infinity " },
  { pattern: /\\equiv/g, replacement: " is defined as " },
  { pattern: /≡/g, replacement: " is defined as " },

  // 12. LaTeX Fractions & Math Formatting
  {
    pattern: /\\frac\{([^{}]+)\}\{([^{}]+)\}/g,
    replacement: "$1 divided by $2",
  },
  {
    pattern: /\\sqrt\{([^{}]+)\}/g,
    replacement: "the square root of $1",
  },
  {
    pattern: /\\text\{([^{}]+)\}/g,
    replacement: "$1",
  },
  {
    pattern: /\\mathrm\{([^{}]+)\}/g,
    replacement: "$1",
  },
  {
    pattern: /\\mathbf\{([^{}]+)\}/g,
    replacement: "$1",
  },
];

const HINDI_PHONETIC_OVERRIDES: ReplacementRule[] = [
  { pattern: /\bgalaxy\b/gi, replacement: "आकाशगंगा (galaxy)" },
  { pattern: /\bblack hole\b/gi, replacement: "ब्लैक होल (black hole)" },
  { pattern: /\bsolar system\b/gi, replacement: "सौर मंडल (solar system)" },
  { pattern: /\bobservable universe\b/gi, replacement: "दृश्य ब्रह्मांड (observable universe)" },
  { pattern: /\blight-year\b/gi, replacement: "प्रकाश वर्ष (light-year)" },
  { pattern: /\blight-years\b/gi, replacement: "प्रकाश वर्ष (light-years)" },
  { pattern: /\bsupernova\b/gi, replacement: "सुपरनोवा (supernova)" },
  { pattern: /\bneutron star\b/gi, replacement: "न्यूट्रॉन तारा (neutron star)" },
  { pattern: /\bexoplanet\b/gi, replacement: "बहिर्ग्रह (exoplanet)" },
  { pattern: /\bredshift\b/gi, replacement: "रेडशिफ्ट (redshift)" },
];

/**
 * Strips markdown markup, headers, and bullet formatting from spoken audio text
 * while preserving the natural words and sentences.
 */
function cleanMarkdownForSpeech(text: string): string {
  let cleaned = text;

  // Remove leading markdown headers (###, ##, #)
  cleaned = cleaned.replace(/^#{1,6}\s+/gm, "");

  // Remove bold & italic markup (**bold**, *italic*, __bold__, _italic_)
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, "$1");
  cleaned = cleaned.replace(/\*([^*]+)\*/g, "$1");
  cleaned = cleaned.replace(/__([^_]+)__/g, "$1");
  cleaned = cleaned.replace(/_([^_]+)_/g, "$1");

  // Remove list bullets (*, -, +) at line start
  cleaned = cleaned.replace(/^[\s]*[*\-+]\s+/gm, "");

  // Remove numbered list markers (1., 2.) at line start
  cleaned = cleaned.replace(/^[\s]*\d+\.\s+/gm, "");

  // Remove inline and block LaTeX dollar signs ($$ and $)
  cleaned = cleaned.replace(/\$\$/g, "");
  cleaned = cleaned.replace(/\$/g, "");

  // Remove code backticks (`code`)
  cleaned = cleaned.replace(/`([^`]+)`/g, "$1");

  // Remove HTML tags (<br/>, <span>, etc.)
  cleaned = cleaned.replace(/<\/?[a-z][a-z0-9]*[^<>]*>/gi, "");

  return cleaned;
}

/**
 * Transforms written instructional text into spoken narration text with proper pronunciation.
 * Guaranteed to leave visual displayText unchanged.
 */
export function generateSpokenText(displayText: string, language: CosmosLanguage = "en"): string {
  if (!displayText) return "";

  // 1. Clean markdown headers and symbols from speech
  let spoken = cleanMarkdownForSpeech(displayText);

  // 2. Apply scientific equation and notation expansions
  for (const rule of SCIENTIFIC_ENGLISH_RULES) {
    spoken = spoken.replace(rule.pattern, rule.replacement as any);
  }

  // 3. Language adaptations (Hindi / Hinglish phonetics)
  if (language === "hi") {
    for (const rule of HINDI_PHONETIC_OVERRIDES) {
      spoken = spoken.replace(rule.pattern, rule.replacement as any);
    }
  }

  // 4. Remove residual LaTeX backslashes from unrecognized macro names
  spoken = spoken.replace(/\\[a-zA-Z]+/g, "");

  // 5. Clean double spaces, punctuation spacing, and trim
  spoken = spoken
    .replace(/\s+/g, " ")
    .replace(/\s+([,.:;?!])/g, "$1")
    .trim();

  return spoken;
}

/**
 * Derives the epistemic classification of instructional text.
 */
export function inferEpistemicStatus(
  text: string,
  sectionId?: string,
): "fact" | "model" | "hypothesis" | "uncertainty" {
  const lower = (text || "").toLowerCase();

  if (
    lower.includes("uncertainty") ||
    lower.includes("error bar") ||
    lower.includes("tension") ||
    lower.includes("unresolved") ||
    lower.includes("remains unknown") ||
    lower.includes("open question")
  ) {
    return "uncertainty";
  }

  if (
    lower.includes("hypothes") ||
    lower.includes("suggests that") ||
    lower.includes("theorized") ||
    lower.includes("may have") ||
    lower.includes("speculated") ||
    lower.includes("string theory") ||
    lower.includes("multiverse")
  ) {
    return "hypothesis";
  }

  if (
    lower.includes("simulation") ||
    lower.includes("model") ||
    lower.includes("general relativity predicts") ||
    lower.includes("equation of state") ||
    lower.includes("standard model") ||
    lower.includes("cosmological model") ||
    sectionId === "mathOrAnalogy" ||
    lower.includes("analogy")
  ) {
    return "model";
  }

  return "fact";
}
