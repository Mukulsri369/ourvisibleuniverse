import { ACADEMY_MODULES } from "./registry";
import type { ModuleContract, UserProgress } from "./types";

export interface Recommendation {
  module: ModuleContract;
  reason: string;
  badge: string;
  priority: "primary" | "secondary";
}

export function getAdaptiveRecommendations(progress: UserProgress): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const module01Progress = progress.moduleProgress["01"]?.status;
  const module02Progress = progress.moduleProgress["02"]?.status;
  const module03Progress = progress.moduleProgress["03"]?.status;
  const module04Progress = progress.moduleProgress["04"]?.status;
  const module05Progress = progress.moduleProgress["05"]?.status;
  const module06Progress = progress.moduleProgress["06"]?.status;
  const module07Progress = progress.moduleProgress["07"]?.status;
  const module08Progress = progress.moduleProgress["08"]?.status;
  const module13Progress = progress.moduleProgress["13"]?.status;
  const module19Progress = progress.moduleProgress["19"]?.status;

  // 1. Core Progressive Track
  if (module01Progress !== "completed") {
    const mod01 = ACADEMY_MODULES.find((m) => m.id === "01");
    if (mod01) {
      recommendations.push({
        module: mod01,
        reason:
          module01Progress === "in_progress"
            ? "Continue your journey from home to the outer cosmic horizon."
            : "The essential starting point for all cosmic explorers.",
        badge: "Start Here",
        priority: "primary",
      });
    }
  } else if (module02Progress !== "completed") {
    const mod02 = ACADEMY_MODULES.find((m) => m.id === "02");
    if (mod02) {
      recommendations.push({
        module: mod02,
        reason:
          module02Progress === "in_progress"
            ? "Continue navigating the night sky in your 360° virtual planetarium dome."
            : "Now that you know your cosmic coordinates, look up to navigate the night sky, locate Polaris, and map the constellations.",
        badge: "Next Adventure",
        priority: "primary",
      });
    }
  } else if (module03Progress !== "completed") {
    const mod03 = ACADEMY_MODULES.find((m) => m.id === "03");
    if (mod03) {
      recommendations.push({
        module: mod03,
        reason:
          module03Progress === "in_progress"
            ? "Continue traversing cosmic scales and experimenting with powers of ten in the Cosmic Scale Laboratory."
            : "Explore astronomical units, light-years, the basketball solar system, and why ordinary kilometers fail in deep space.",
        badge: "Scale Explorer",
        priority: "primary",
      });
    }
  } else if (module04Progress !== "completed") {
    const mod04 = ACADEMY_MODULES.find((m) => m.id === "04");
    if (mod04) {
      recommendations.push({
        module: mod04,
        reason:
          module04Progress === "in_progress"
            ? "Continue exploring how light bridges cosmic distances and peering into the past in the 3D Light-Travel simulation."
            : "Explore the cosmic speed limit (c = 300,000 km/s), electromagnetic spectra, and why telescopes are real time machines.",
        badge: "Recommended Next",
        priority: "primary",
      });
    }
  } else if (module05Progress !== "completed") {
    // Recommend Stage 2 Module 05: Earth, Moon & Eclipses
    const mod05 = ACADEMY_MODULES.find((m) => m.id === "05");
    if (mod05) {
      recommendations.push({
        module: mod05,
        reason:
          module05Progress === "in_progress"
            ? "Continue your 3D exploration of Earth's axial tilt, seasonal solstices, lunar phases, and eclipses."
            : "Explore Earth's 23.44° axial tilt, true day/night rotation, the 5.145° lunar orbit inclination, and eclipse geometry.",
        badge: "Stage 2 Gateway",
        priority: "primary",
      });
    }
  } else if (module06Progress !== "completed") {
    // Recommend Stage 2 Module 06: Explore the Solar System
    const mod06 = ACADEMY_MODULES.find((m) => m.id === "06");
    if (mod06) {
      recommendations.push({
        module: mod06,
        reason:
          module06Progress === "in_progress"
            ? "Continue your 3D exploration of orbital mechanics, the 8 planets, dwarf worlds, and planetary rings."
            : "Now that you understand our home world and Moon, venture outward to explore the 8 major planets, gas giants, and Kuiper belt!",
        badge: "Solar System Tour",
        priority: "primary",
      });
    }
  } else if (module07Progress !== "completed") {
    // Recommend Stage 2 Module 07: The Sun: Our Star
    const mod07 = ACADEMY_MODULES.find((m) => m.id === "07");
    if (mod07) {
      recommendations.push({
        module: mod07,
        reason:
          module07Progress === "in_progress"
            ? "Continue peering into the Sun's core, nuclear fusion reactor, and defending satellites against solar storms."
            : "Explore the nuclear fusion engine powering the solar system, peel open internal layers, and simulate solar storms.",
        badge: "Stellar Powerhouse",
        priority: "primary",
      });
    }
  } else if (module08Progress !== "completed") {
    // Recommend Stage 2 Module 08: Gravity, Orbits & Motion
    const mod08 = ACADEMY_MODULES.find((m) => m.id === "08");
    if (mod08) {
      recommendations.push({
        module: mod08,
        reason:
          module08Progress === "in_progress"
            ? "Continue simulating N-body orbits, verifying Kepler's laws, and testing multi-body stability."
            : "Master universal gravitation, orbital insertion velocities, escape trajectories, and multi-body barycenters in the 3D physics lab.",
        badge: "Orbital Mechanics",
        priority: "primary",
      });
    }
  } else if (progress.moduleProgress["09"]?.status !== "completed") {
    // Recommend Stage 3 Module 09: Stars: Colors, Sizes & Temperatures
    const mod09 = ACADEMY_MODULES.find((m) => m.id === "09");
    if (mod09) {
      recommendations.push({
        module: mod09,
        reason:
          progress.moduleProgress["09"]?.status === "in_progress"
            ? "Continue comparing stars in the 3D Stellar Museum, testing blackbody spectra, and plotting stars on the H-R diagram."
            : "Step into Stage 3: compare 3D stellar models, explore Wien's law & blackbody radiation, and decode the Hertzsprung-Russell diagram!",
        badge: "Stage 3 Gateway",
        priority: "primary",
      });
    }
  } else if (progress.moduleProgress["10"]?.status !== "completed") {
    // Recommend Stage 3 Module 10: Birth, Life & Death of Stars
    const mod10 = ACADEMY_MODULES.find((m) => m.id === "10");
    if (mod10) {
      recommendations.push({
        module: mod10,
        reason:
          progress.moduleProgress["10"]?.status === "in_progress"
            ? "Continue following stellar evolutionary tracks, testing core cutaway layers, and predicting supernova fates."
            : "Follow the dramatic lifecycles of stars driven by initial birth mass: molecular clouds, red giants, planetary nebulae, supernovae, and black holes!",
        badge: "Stellar Lifecycles",
        priority: "primary",
      });
    }
  } else if (progress.moduleProgress["11"]?.status !== "completed") {
    // Recommend Stage 3 Module 11: Nebulae & Star Clusters
    const mod11 = ACADEMY_MODULES.find((m) => m.id === "11");
    if (mod11) {
      recommendations.push({
        module: mod11,
        reason:
          progress.moduleProgress["11"]?.status === "in_progress"
            ? "Continue flying through volumetric nebulae, testing gravitational collapse, and decoding false color filters."
            : "Explore the glowing gas and dust clouds where new star systems coalesce into open and globular clusters, and decode the science of astronomical imaging filters!",
        badge: "Stellar Nurseries",
        priority: "primary",
      });
    }
  } else if (progress.moduleProgress["14"]?.status !== "completed") {
    // Recommend Stage 4 Module 14: Black Holes & Neutron Stars
    const mod14 = ACADEMY_MODULES.find((m) => m.id === "14");
    if (mod14) {
      recommendations.push({
        module: mod14,
        reason:
          progress.moduleProgress["14"]?.status === "in_progress"
            ? "Continue investigating event horizons, pulsar beams, and gravitational waves in the Extreme Objects Lab."
            : "Step into Stage 4: investigate event horizons, gravitational lensing, pulsar lighthouses, and spacetime ripples in the Extreme Objects Laboratory!",
        badge: "Extreme Relativist",
        priority: "primary",
      });
    }
  } else if (progress.moduleProgress["15"]?.status !== "completed") {
    // Recommend Stage 4 Module 15: Galaxy Groups, Clusters & Cosmic Web
    const mod15 = ACADEMY_MODULES.find((m) => m.id === "15");
    if (mod15) {
      recommendations.push({
        module: mod15,
        reason:
          progress.moduleProgress["15"]?.status === "in_progress"
            ? "Continue zooming through large-scale structure, cosmic filaments, and mapping density fields."
            : "Ascend to the largest architectural scale in the cosmos: navigate the Local Group, Virgo Cluster, Laniakea, and the cosmic web scaffolding!",
        badge: "Cosmic Scaffolding",
        priority: "primary",
      });
    }
  } else if (progress.moduleProgress["16"]?.status !== "completed") {
    // Recommend Stage 4 Module 16: Dark Matter & Dark Energy
    const mod16 = ACADEMY_MODULES.find((m) => m.id === "16");
    if (mod16) {
      recommendations.push({
        module: mod16,
        reason:
          progress.moduleProgress["16"]?.status === "in_progress"
            ? "Continue testing Vera Rubin's rotation curves, dark halos, and accelerating cosmic expansion."
            : "Investigate the 95% invisible universe: flat galaxy rotation curves, gravitational lensing, and cosmic acceleration in the Dark Sector Physics Bench!",
        badge: "Dark Sector Bench",
        priority: "primary",
      });
    }
  } else if (progress.moduleProgress["17"]?.status !== "completed") {
    // Recommend Stage 5 Module 17: Big Bang & Cosmic Evolution
    const mod17 = ACADEMY_MODULES.find((m) => m.id === "17");
    if (mod17) {
      recommendations.push({
        module: mod17,
        reason:
          progress.moduleProgress["17"]?.status === "in_progress"
            ? "Continue your journey through 13.8 billion years of cosmic evolution in the Cosmic Time Machine."
            : "Step into Stage 5: Journey from the Planck era and BBN to the Cosmic Microwave Background, the Dark Ages, and the birth of first stars in the Cosmic Time Machine!",
        badge: "Cosmic Time Machine",
        priority: "primary",
      });
    }
  } else if (progress.moduleProgress["18"]?.status !== "completed") {
    // Recommend Stage 5 Module 18: The Expanding Universe
    const mod18 = ACADEMY_MODULES.find((m) => m.id === "18");
    if (mod18) {
      recommendations.push({
        module: mod18,
        reason:
          progress.moduleProgress["18"]?.status === "in_progress"
            ? "Continue exploring the Hubble–Lemaître expansion, wavelength stretching, and cosmological horizons."
            : "Investigate cosmic metric expansion: observe receding galaxies, stretch light wavelengths, and explore why bound systems stay intact in the 3D Expansion Observatory!",
        badge: "Cosmic Expansion Observatory",
        priority: "primary",
      });
    }
  } else if (progress.moduleProgress["19"]?.status !== "completed") {
    // Recommend Stage 5 Module 19: Visible Universe History
    const mod19 = ACADEMY_MODULES.find((m) => m.id === "19");
    if (mod19) {
      recommendations.push({
        module: mod19,
        reason:
          progress.moduleProgress["19"]?.status === "in_progress"
            ? "Continue investigating the evolution of cosmological ideas from Ptolemaic epicycles to heliocentrism and modern space observatories."
            : "Discover how human understanding of the cosmos transformed across millennia in the 3D Historical Model Comparator!",
        badge: "Historical Cosmologist",
        priority: "primary",
      });
    }
  } else if (progress.moduleProgress["20"]?.status !== "completed") {
    // Recommend Stage 5 Module 20: The Future of the Universe
    const mod20 = ACADEMY_MODULES.find((m) => m.id === "20");
    if (mod20) {
      recommendations.push({
        module: mod20,
        reason:
          progress.moduleProgress["20"]?.status === "in_progress"
            ? "Continue journeying into deep cosmic time: explore the Sun's evolution, the Milkomeda merger, and cosmic Heat Death in the Future Chronology Lab."
            : "Complete Stage 5: Journey into deep cosmic time across logarithmic eons—from the Sun's red giant phase and Milkomeda to the Degenerate Era, Heat Death, and ultimate cosmic fates!",
        badge: "Cosmic Deep Time",
        priority: "primary",
      });
    }
  }

  // 2. Recommend Module 13 (Galaxies) or post-completion Module 14/15/16/17/18/19
  if (module13Progress !== "completed") {
    const mod13 = ACADEMY_MODULES.find((m) => m.id === "13");
    if (mod13) {
      recommendations.push({
        module: mod13,
        reason: "Explore spiral arms, galactic cores, and interactive 3D models of real galaxies.",
        badge: "Interactive 3D",
        priority: module01Progress === "completed" ? "primary" : "secondary",
      });
    }
  } else if (progress.moduleProgress["14"]?.status !== "completed") {
    const mod14 = ACADEMY_MODULES.find((m) => m.id === "14");
    if (mod14) {
      recommendations.push({
        module: mod14,
        reason:
          "Now that you understand galactic structures and central supermassive black holes, delve into extreme relativity, pulsars, and spacetime singularities!",
        badge: "Extreme Physics",
        priority: "primary",
      });
    }
  } else if (progress.moduleProgress["15"]?.status !== "completed") {
    const mod15 = ACADEMY_MODULES.find((m) => m.id === "15");
    if (mod15) {
      recommendations.push({
        module: mod15,
        reason:
          "Map the grandest cosmic tapestry: filamentary bridges, colossal supervoids, and dark matter scaffolding connecting galaxy clusters across gigaparsecs!",
        badge: "Large Scale Structure",
        priority: "primary",
      });
    }
  } else if (progress.moduleProgress["16"]?.status !== "completed") {
    const mod16 = ACADEMY_MODULES.find((m) => m.id === "16");
    if (mod16) {
      recommendations.push({
        module: mod16,
        reason:
          "Decode the 95% invisible cosmos: simulate galaxy rotation curves with dark halos and track the cosmic acceleration driving our universe's destiny!",
        badge: "Dark Sector Lab",
        priority: "primary",
      });
    }
  } else if (progress.moduleProgress["17"]?.status !== "completed") {
    const mod17 = ACADEMY_MODULES.find((m) => m.id === "17");
    if (mod17) {
      recommendations.push({
        module: mod17,
        reason:
          "Ascend to Stage 5: Explore the full 13.8 billion year history of cosmic evolution, from primordial nucleosynthesis and the CMB to the first stars!",
        badge: "Cosmic Chronology",
        priority: "primary",
      });
    }
  } else if (progress.moduleProgress["18"]?.status !== "completed") {
    const mod18 = ACADEMY_MODULES.find((m) => m.id === "18");
    if (mod18) {
      recommendations.push({
        module: mod18,
        reason:
          "Master the Hubble–Lemaître Law, cosmological redshift, lookback times, and the true meaning of cosmic horizons in the 3D Expansion Observatory!",
        badge: "Cosmic Surveyor",
        priority: "primary",
      });
    }
  } else if (progress.moduleProgress["19"]?.status !== "completed") {
    const mod19 = ACADEMY_MODULES.find((m) => m.id === "19");
    if (mod19) {
      recommendations.push({
        module: mod19,
        reason:
          "Trace humanity's quest to understand the universe: inspect 3D Ptolemaic, Copernican, and modern cosmological models in the Historical Comparator!",
        badge: "Historical Cosmologist",
        priority: "primary",
      });
    }
  } else if (progress.moduleProgress["20"]?.status !== "completed") {
    const mod20 = ACADEMY_MODULES.find((m) => m.id === "20");
    if (mod20) {
      recommendations.push({
        module: mod20,
        reason:
          "Ascend to the cosmic finale: explore stellar evolution, the Milkomeda merger, the Degenerate Era, and Heat Death in the Future Chronology Lab!",
        badge: "Cosmic Deep Time",
        priority: "primary",
      });
    }
  }

  // If user completed all available ready modules, recommend next upcoming stage
  if (recommendations.length === 0) {
    const nextComing = ACADEMY_MODULES.find((m) => m.id === "02") || ACADEMY_MODULES[0];
    recommendations.push({
      module: nextComing,
      reason: "You've mastered the foundation! Review and explore deeper celestial physics.",
      badge: "Mastery Review",
      priority: "primary",
    });
  }

  return recommendations;
}
