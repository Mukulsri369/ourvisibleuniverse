import { galaxyPopulation } from "./galaxy-populations";
import type { GalaxyModel } from "./galaxy-models";

/** Observed morphology constrains the reconstruction; unseen depth is illustrative.
 * See docs/galaxy-reconstruction.md for sources and coverage. */
export function galaxyStructure(m: GalaxyModel) {
  const name = m.name.toLowerCase();
  const population = galaxyPopulation(m);
  const spheroid = population
    ? population.kind === 1 || population.kind === 4
    : ["elliptical", "dwarf"].includes(m.morphology);
  const irregular = ["irregular", "starburst"].includes(m.morphology);
  let feature = 0;
  if (/centaurus a/.test(name)) feature = 1;
  else if (/sombrero/.test(name)) feature = 2;
  else if (/m82|cigar/.test(name)) feature = 3;
  else if (/large magellanic/.test(name)) feature = 4;
  else if (/small magellanic/.test(name)) feature = 5;
  else if (/whirlpool/.test(name)) feature = 6;
  else if (/antennae/.test(name)) feature = 7;
  else if (/quintet/.test(name)) feature = 8;
  else if (/tadpole/.test(name)) feature = 9;
  else if (/cartwheel/.test(name)) feature = 10;
  else if (/hoag/.test(name)) feature = 11;
  else if (/mayall/.test(name)) feature = 12;
  else if (/black eye/.test(name)) feature = 13;
  else if (/m94$/.test(name)) feature = 14;
  else if (/malin/.test(name)) feature = 15;
  const thin = ["edge-on", "lenticular"].includes(m.morphology);
  return {
    population,
    feature,
    spheroid,
    irregular,
    thickness: spheroid ? 0.56 : irregular ? 0.1 : thin ? 0.012 : 0.018,
    flattening: spheroid ? (/m87|m32/.test(name) ? 0.88 : 0.64) : 1,
    bulgeFraction: spheroid
      ? 1
      : irregular
        ? 0.035
        : feature === 2
          ? 0.58
          : Math.min(0.35, Math.max(0.07, m.bulgeRadius / m.diskRadius)),
    ringRadius:
      feature === 11
        ? 0.72
        : feature === 10
          ? 0.77
          : feature === 12
            ? 0.64
            : (m.ringRadius ?? 0) / m.diskRadius,
    armContrast:
      m.morphology === "flocculent" ? 0.42 : /grand-design|barred/.test(m.morphology) ? 0.82 : 0.65,
    dust: feature === 1 ? 1 : spheroid ? 0 : m.dustLanes ? 1 : irregular ? 0.35 : 0,
    // Broken symmetry prevents the same perfect spiral being repeated across the catalogue.
    asymmetry: /m101|triangulum|m66|whale/.test(name) ? 0.16 : irregular ? 0.25 : 0.045,
    rotationRate:
      spheroid || irregular || m.morphology === "interacting" ? 0 : Math.PI / m.rotPeriod,
  };
}
