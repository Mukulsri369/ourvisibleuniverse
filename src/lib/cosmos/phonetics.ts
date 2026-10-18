/**
 * COSMOS Phonetic & Scientific Notation Expander
 * Project: Our Visible Universe Academy
 *
 * Converts mathematical formulas, astronomical symbols, exponents,
 * and scientific abbreviations into natural, spoken English/Hindi phonetics
 * without altering the visually displayed text.
 */

import type { CosmosLanguage } from "./cosmos-types";

interface ReplacementRule {
  pattern: RegExp;
  replacement: string;
}

const SCIENTIFIC_ENGLISH_RULES: ReplacementRule[] = [
  // Compound Equations & Specific Scientific Formulations (Run first)
  {
    pattern: /G_μν\s*\+\s*Λ\s*g_μν\s*=\s*\(8πG\s*\/\s*c\^4\)\s*T_μν/g,
    replacement:
      "the Einstein tensor plus cosmological constant metric equals eight pi G over c to the fourth times the energy-momentum tensor",
  },
  {
    pattern: /⁵⁶Fe\s*\+\s*γ\s*→\s*13\s*⁴He\s*\+\s*4n/g,
    replacement: "iron fifty-six photodisintegrates into thirteen helium-four nuclei and four neutrons",
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
  { pattern: /\br_s\s*=\s*2GM\/c\^2\b/g, replacement: "Schwarzschild radius equals two G M over c squared" },
  { pattern: /\bc\^2\b/g, replacement: "c squared" },
  { pattern: /\bc\^4\b/g, replacement: "c to the fourth power" },

  // Astronomical Masses & Solar Symbols
  { pattern: /\b(\d+(?:\.\d+)?)\s*M[☉\u2609]/g, replacement: "$1 solar masses" },
  { pattern: /\bM[☉\u2609]/g, replacement: "solar masses" },
  { pattern: /\b(\d+(?:\.\d+)?)\s*M_sun\b/gi, replacement: "$1 solar masses" },
  { pattern: /\bM_sun\b/gi, replacement: "solar mass" },
  { pattern: /\b(\d+(?:\.\d+)?)\s*M_Earth\b/gi, replacement: "$1 Earth masses" },
  { pattern: /\bM_Earth\b/gi, replacement: "Earth mass" },
  { pattern: /\b(\d+(?:\.\d+)?)\s*M_Jup\b/gi, replacement: "$1 Jupiter masses" },

  // Distance & Velocity Units
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

  // Scientific Density & Metric Units
  { pattern: /\bg\/cm\^?3\b/gi, replacement: "grams per cubic centimeter" },
  { pattern: /\bg\/cm³\b/gi, replacement: "grams per cubic centimeter" },
  { pattern: /\bkg\/m\^?3\b/gi, replacement: "kilograms per cubic meter" },
  { pattern: /\bkg\/m³\b/gi, replacement: "kilograms per cubic meter" },
  { pattern: /\bW\/m\^?2\b/gi, replacement: "watts per square meter" },
  { pattern: /\bW\/m²\b/gi, replacement: "watts per square meter" },
  { pattern: /\bkm\b/gi, replacement: "kilometers" },

  // Temperatures
  { pattern: /([+-]?\d+(?:\.\d+)?)\s*°C\b/g, replacement: "$1 degrees Celsius" },
  { pattern: /\b(\d+(?:\.\d+)?)\s*Kelvin\b/gi, replacement: "$1 Kelvin" },
  { pattern: /\b(\d+(?:\.\d+)?)\s*K\b/g, replacement: "$1 Kelvin" },

  // Scientific Powers of 10
  {
    pattern: /(\d+(?:\.\d+)?)\s*[x×]\s*10\^([+-]?\d+)/gi,
    replacement: (_match, coeff, exp) => {
      return `${coeff} times ten to the power of ${exp}`;
    },
  },
  {
    pattern: /\b10\^([+-]?\d+)\b/g,
    replacement: (_match, exp) => `ten to the power of ${exp}`,
  },

  // Nuclear & Chemical Notations
  { pattern: /⁵⁶Fe/g, replacement: "iron fifty-six" },
  { pattern: /⁴He/g, replacement: "helium-four" },
  { pattern: /¹²C/g, replacement: "carbon-twelve" },
  { pattern: /¹⁶O/g, replacement: "oxygen-sixteen" },
  { pattern: /\bFe-56\b/gi, replacement: "iron fifty-six" },
  { pattern: /\bHe-4\b/gi, replacement: "helium-four" },

  // Greek Symbols in Equations
  { pattern: /ν_e\b/g, replacement: "electron neutrino" },
  { pattern: /ν\b/g, replacement: "neutrino" },
  { pattern: /γ\b/g, replacement: "gamma ray photon" },
  { pattern: /μ\b/g, replacement: "micro" },
  { pattern: /ρ\b/g, replacement: "density rho" },
  { pattern: /Γ\b/g, replacement: "adiabatic index gamma" },
  { pattern: /Λ\b/g, replacement: "cosmological constant lambda" },

  // Mathematical and Comparison Symbols
  { pattern: /\s*≈\s*/g, replacement: " approximately equals " },
  { pattern: /\s*~\s*(\d)/g, replacement: " approximately $1" },
  { pattern: /\s*±\s*/g, replacement: " plus or minus " },
  { pattern: /\s*≤\s*/g, replacement: " less than or equal to " },
  { pattern: /\s*≥\s*/g, replacement: " greater than or equal to " },
  { pattern: /\s*→\s*/g, replacement: " leads to " },
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
];

/**
 * Transforms written text into spoken narration text with proper pronunciation.
 * Guaranteed to leave visual displayText unchanged.
 */
export function generateSpokenText(displayText: string, language: CosmosLanguage = "en"): string {
  if (!displayText) return "";

  let spoken = displayText;

  // Apply scientific rules
  for (const rule of SCIENTIFIC_ENGLISH_RULES) {
    spoken = spoken.replace(rule.pattern, rule.replacement as any);
  }

  // Language adaptations
  if (language === "hi") {
    for (const rule of HINDI_PHONETIC_OVERRIDES) {
      spoken = spoken.replace(rule.pattern, rule.replacement as any);
    }
  }

  // Clean double spaces and trim
  return spoken.replace(/\s+/g, " ").trim();
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
