export interface StageBadgeDefinition {
  stageId: number;
  badgeId: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  glowColor: string;
}

export const STAGE_BADGES: Record<number, StageBadgeDefinition> = {
  1: {
    stageId: 1,
    badgeId: "badge_stage_01_space_discoverer",
    title: "Space Discoverer",
    subtitle: "Stage 01 Certified",
    description:
      "Mastered cosmic scale, night sky coordinates, celestial distances, and the speed of light.",
    icon: "🌟",
    glowColor: "#22d3ee",
  },
  2: {
    stageId: 2,
    badgeId: "badge_stage_02_solar_navigator",
    title: "Solar System Navigator",
    subtitle: "Stage 02 Certified",
    description:
      "Mastered Earth-Moon orbital rhythms, planetary worlds, solar space weather, and Keplerian orbital mechanics.",
    icon: "🪐",
    glowColor: "#38bdf8",
  },
  3: {
    stageId: 3,
    badgeId: "badge_stage_03_stellar_astrophysicist",
    title: "Stellar Astrophysicist",
    subtitle: "Stage 03 Certified",
    description:
      "Decoded thermonuclear fusion, HR diagram evolutionary tracks, stellar death supernovae, and exoplanet transit spectroscopy.",
    icon: "✨",
    glowColor: "#fbbf24",
  },
  4: {
    stageId: 4,
    badgeId: "badge_stage_04_galactic_relativist",
    title: "Galactic & Extreme Relativist",
    subtitle: "Stage 04 Certified",
    description:
      "Explored spiral galaxy dynamics, black hole event horizons, gravitational waves, cosmic web filaments, and dark matter halos.",
    icon: "🌀",
    glowColor: "#a855f7",
  },
  5: {
    stageId: 5,
    badgeId: "badge_stage_05_master_cosmologist",
    title: "Master Cosmologist",
    subtitle: "Stage 05 Certified",
    description:
      "Traced 13.8 billion years from Big Bang inflation through the CMB, metric cosmic expansion, cosmological history, and long-term cosmic futures.",
    icon: "🔮",
    glowColor: "#ec4899",
  },
  6: {
    stageId: 6,
    badgeId: "badge_stage_06_cosmic_explorer_laureate",
    title: "Cosmic Explorer Laureate",
    subtitle: "Stage 06 Capstone Certified",
    description:
      "Synthesized telescope instrumentation, space robotics, astrobiological habitability, and unified astrophysics laboratory experimentation.",
    icon: "🏆",
    glowColor: "#10b981",
  },
};
