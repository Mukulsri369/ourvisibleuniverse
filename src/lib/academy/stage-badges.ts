export interface StageBadgeDefinition {
  stageId: number;
  badgeId: string;
  legacyBadgeIds?: string[];
  title: string;
  subtitle: string;
  description: string;
  theme: string;
  icon: string;
  glowColor: string;
  accentColor: string;
  bgGradient: string;
  borderColor: string;
  requiredModuleIds: string[];
  version: string;
  milestoneQuote: string;
}

export const STAGE_BADGES: Record<number, StageBadgeDefinition> = {
  1: {
    stageId: 1,
    badgeId: "badge_stage_01_first_stargazer",
    legacyBadgeIds: ["badge_stage_01_space_discoverer"],
    title: "First Stargazer",
    subtitle: "Stage 01 Certified",
    description:
      "Awarded after verified completion of modules 01–04: Our Place in the Universe, The Night Sky & Constellations, Cosmic Distances & Scale, and Light, Time & Cosmic Observation.",
    theme: "Earth and stars",
    icon: "🌟",
    glowColor: "#06b6d4",
    accentColor: "text-cyan-400",
    bgGradient: "from-cyan-950/40 via-blue-950/30 to-slate-900/80",
    borderColor: "border-cyan-500/40",
    requiredModuleIds: ["01", "02", "03", "04"],
    version: "1.0.0",
    milestoneQuote:
      "From your home city to the edge of the night sky, you have anchored your place in the cosmos.",
  },
  2: {
    stageId: 2,
    badgeId: "badge_stage_02_solar_navigator",
    legacyBadgeIds: ["badge_stage_02_solar_navigator"],
    title: "Solar Navigator",
    subtitle: "Stage 02 Certified",
    description:
      "Awarded after verified completion of modules 05–08: Earth, Moon & Seasons, The Solar System Worlds, The Sun: Our Living Star, and Gravity & Orbital Mechanics.",
    theme: "Planets and orbital rings",
    icon: "🪐",
    glowColor: "#f59e0b",
    accentColor: "text-amber-400",
    bgGradient: "from-amber-950/40 via-orange-950/30 to-slate-900/80",
    borderColor: "border-amber-500/40",
    requiredModuleIds: ["05", "06", "07", "08"],
    version: "1.0.0",
    milestoneQuote:
      "Mastered planetary systems, solar dynamics, and the orbital physics that keep worlds in balance.",
  },
  3: {
    stageId: 3,
    badgeId: "badge_stage_03_stellar_explorer",
    legacyBadgeIds: ["badge_stage_03_stellar_astrophysicist"],
    title: "Stellar Explorer",
    subtitle: "Stage 03 Certified",
    description:
      "Awarded after verified completion of modules 09–12: Stars & How They Work, Stellar Evolution & Death, Nebulae & Star Nurseries, and Exoplanets & Alien Worlds.",
    theme: "Glowing stellar nursery",
    icon: "✨",
    glowColor: "#ec4899",
    accentColor: "text-pink-400",
    bgGradient: "from-pink-950/40 via-purple-950/30 to-slate-900/80",
    borderColor: "border-pink-500/40",
    requiredModuleIds: ["09", "10", "11", "12"],
    version: "1.0.0",
    milestoneQuote:
      "Decoded thermonuclear star-engines, explosive supernovae remnants, and thousands of alien worlds.",
  },
  4: {
    stageId: 4,
    badgeId: "badge_stage_04_galactic_voyager",
    legacyBadgeIds: ["badge_stage_04_galactic_relativist"],
    title: "Galactic Voyager",
    subtitle: "Stage 04 Certified",
    description:
      "Awarded after verified completion of modules 13–16: Galaxies & the Milky Way, Black Holes & Extreme Objects, The Cosmic Web & Large-Scale Structure, and Dark Matter & Dark Energy.",
    theme: "Spiral galaxy",
    icon: "🌀",
    glowColor: "#a855f7",
    accentColor: "text-purple-400",
    bgGradient: "from-purple-950/40 via-indigo-950/30 to-slate-900/80",
    borderColor: "border-purple-500/40",
    requiredModuleIds: ["13", "14", "15", "16"],
    version: "1.0.0",
    milestoneQuote:
      "Navigated island spiral universes, event horizons, cosmic web filaments, and the invisible dark sector.",
  },
  5: {
    stageId: 5,
    badgeId: "badge_stage_05_cosmic_historian",
    legacyBadgeIds: ["badge_stage_05_master_cosmologist"],
    title: "Cosmic Historian",
    subtitle: "Stage 05 Certified",
    description:
      "Awarded after verified completion of modules 17–20: The Big Bang & Early Cosmos, The Expanding Universe & Redshift, History of Human Cosmology, and The Future of the Universe.",
    theme: "Expanding cosmic horizon",
    icon: "🔮",
    glowColor: "#f43f5e",
    accentColor: "text-rose-400",
    bgGradient: "from-rose-950/40 via-red-950/30 to-slate-900/80",
    borderColor: "border-rose-500/40",
    requiredModuleIds: ["17", "18", "19", "20"],
    version: "1.0.0",
    milestoneQuote:
      "Traced 13.8 billion years from Big Bang inflation through the cosmic microwave background to the far future.",
  },
  6: {
    stageId: 6,
    badgeId: "badge_stage_06_space_scientist",
    legacyBadgeIds: ["badge_stage_06_cosmic_explorer_laureate"],
    title: "Space Scientist",
    subtitle: "Stage 06 Capstone Certified",
    description:
      "Awarded after verified completion of modules 21–24: Telescopes & Observatories, Space Missions & Exploration, Astrobiology & the Search for Life, and The Cosmic Laboratory Capstone.",
    theme: "Observatory and celestial geometry",
    icon: "🔬",
    glowColor: "#10b981",
    accentColor: "text-emerald-400",
    bgGradient: "from-emerald-950/40 via-teal-950/30 to-slate-900/80",
    borderColor: "border-emerald-500/40",
    requiredModuleIds: ["21", "22", "23", "24"],
    version: "1.0.0",
    milestoneQuote:
      "Conducted advanced astronomical instrumentation, orbital missions, astrobiological searches, and unified physics.",
  },
};

/**
 * Helper to look up a stage badge by badgeId or legacy badgeId.
 */
export function getStageBadgeByBadgeId(badgeId: string): StageBadgeDefinition | undefined {
  return Object.values(STAGE_BADGES).find(
    (b) => b.badgeId === badgeId || b.legacyBadgeIds?.includes(badgeId),
  );
}

/**
 * Checks if a badge identifier belongs to a given stage.
 */
export function isBadgeForStage(stageId: number, badgeId: string): boolean {
  const badge = STAGE_BADGES[stageId];
  if (!badge) return false;
  return badge.badgeId === badgeId || Boolean(badge.legacyBadgeIds?.includes(badgeId));
}
