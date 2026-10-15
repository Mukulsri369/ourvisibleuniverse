import React from "react";
import { COSMIC_CONCEPTS, CosmicConcept } from "@/lib/cosmic-concepts";

interface HighlightCosmicTextProps {
  text: string;
  onSelectConcept: (concept: CosmicConcept) => void;
  className?: string;
}

// Ordered list of keywords to match, longer phrases first so "cosmic microwave background" matches before "microwave"
const KEYWORD_MAP: Array<{ regex: RegExp; conceptId: string; label: string }> = [
  {
    regex: /\b(cosmic microwave background|CMB)\b/gi,
    conceptId: "cosmic-microwave-background",
    label: "CMB",
  },
  {
    regex: /\b(cosmological redshift|redshifted|redshift|redshifts)\b/gi,
    conceptId: "redshift",
    label: "Redshift",
  },
  { regex: /\b(dark matter)\b/gi, conceptId: "dark-matter", label: "Dark Matter" },
  { regex: /\b(dark energy)\b/gi, conceptId: "dark-energy", label: "Dark Energy" },
  {
    regex: /\b(gravitational lensing|gravitational lens)\b/gi,
    conceptId: "gravitational-lensing",
    label: "Gravitational Lensing",
  },
  {
    regex: /\b(spacetime curvature|general relativity)\b/gi,
    conceptId: "spacetime-curvature",
    label: "General Relativity",
  },
  {
    regex: /\b(big bang nucleosynthesis|nucleosynthesis)\b/gi,
    conceptId: "big-bang-nucleosynthesis",
    label: "Nucleosynthesis",
  },
  {
    regex: /\b(cosmic inflation|inflationary)\b/gi,
    conceptId: "cosmic-inflation",
    label: "Cosmic Inflation",
  },
  {
    regex: /\b(james webb space telescope|james webb|jwst)\b/gi,
    conceptId: "james-webb-telescope",
    label: "James Webb",
  },
  {
    regex: /\b(stellar parallax|parallax)\b/gi,
    conceptId: "stellar-parallax",
    label: "Stellar Parallax",
  },
  {
    regex: /\b(kepler's laws|kepler's first law|keplerian)\b/gi,
    conceptId: "kepler-laws",
    label: "Kepler's Laws",
  },
  {
    regex: /\b(epicycles|epicycle|deferent)\b/gi,
    conceptId: "epicycles-ptolemy",
    label: "Epicycles",
  },
  {
    regex: /\b(heliocentric|heliocentrism)\b/gi,
    conceptId: "heliocentrism",
    label: "Heliocentrism",
  },
  { regex: /\b(eratosthenes)\b/gi, conceptId: "eratosthenes-earth-radius", label: "Eratosthenes" },
];

export function HighlightCosmicText({
  text,
  onSelectConcept,
  className = "",
}: HighlightCosmicTextProps) {
  if (!text) return null;

  // Build combined regex
  const combinedPattern = new RegExp(
    KEYWORD_MAP.map((item) => `(${item.regex.source})`).join("|"),
    "gi",
  );

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = combinedPattern.exec(text)) !== null) {
    const matchedText = match[0];
    const matchStart = match.index;
    const matchEnd = matchStart + matchedText.length;

    // Push preceding normal text
    if (matchStart > lastIndex) {
      parts.push(text.substring(lastIndex, matchStart));
    }

    // Determine matching concept
    const matchedItem = KEYWORD_MAP.find((item) =>
      new RegExp(`^${item.regex.source}$`, "i").test(matchedText),
    );

    if (matchedItem && COSMIC_CONCEPTS[matchedItem.conceptId]) {
      const concept = COSMIC_CONCEPTS[matchedItem.conceptId];
      parts.push(
        <button
          key={`${matchStart}-${matchedText}`}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelectConcept(concept);
          }}
          className="inline-flex items-center gap-0.5 rounded px-1 py-0.2 mx-0.5 font-semibold text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 hover:border-cyan-400 hover:text-white hover:bg-cyan-900/60 transition cursor-pointer text-left align-baseline"
          title={`Click to explore ${concept.title} with NASA & Wikipedia guides`}
        >
          <span>{matchedText}</span>
          <span className="text-[9px] font-mono text-amber-300 opacity-80 ml-0.5">↗</span>
        </button>,
      );
    } else {
      parts.push(matchedText);
    }

    lastIndex = matchEnd;
  }

  // Push remainder
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return <span className={className}>{parts}</span>;
}
