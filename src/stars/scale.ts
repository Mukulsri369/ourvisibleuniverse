/**
 * Compatibility Scale Adapter for Existing Scene Objects
 * Backed by the Central Astronomical Units and ScaleManager Architecture.
 */

import {
  LIGHT_YEARS_PER_AU as SOURCED_LIGHT_YEARS_PER_AU,
  SOLAR_RADIUS_AU as SOURCED_SOLAR_RADIUS_AU,
} from "@/lib/astronomy/constants";
import {
  scaleManager,
  LEGACY_BODY_RADIUS_TO_AU,
  LEGACY_EXO_BODY_MAGNIFY,
  LEGACY_EXO_STAR_MAGNIFY,
  LEGACY_AU_ENHANCED,
  LEGACY_PLANET_SCALE_ENHANCED,
} from "@/lib/astronomy/scale-manager";

/** The scene's astronomical coordinate system uses one unit per light-year. */
export const LIGHT_YEARS_PER_AU = SOURCED_LIGHT_YEARS_PER_AU;

/** Mean solar radius expressed in astronomical units. */
export const SOLAR_RADIUS_AU = SOURCED_SOLAR_RADIUS_AU;

/**
 * Legacy catalog body radii were authored for visibility at galaxy scale.
 * This converts those values back to physical planet/moon/ring dimensions:
 * 0.085 legacy AU becomes 0.000472 AU, approximately Jupiter's radius.
 */
export { LEGACY_BODY_RADIUS_TO_AU };

/**
 * Presentation magnification for extragalactic star systems. At true physical
 * scale a planet is ~1e-9 ly across and simply cannot be seen next to its
 * orbit, so bodies (and moon orbits) are enlarged by a fixed factor while all
 * relative proportions inside a system are preserved.
 */
export const EXO_BODY_MAGNIFY = LEGACY_EXO_BODY_MAGNIFY;
export const EXO_STAR_MAGNIFY = LEGACY_EXO_STAR_MAGNIFY;

/** Legacy catalog body radius/distance -> AU, including the visibility boost. */
export const EXO_BODY_SCALE = LEGACY_BODY_RADIUS_TO_AU * EXO_BODY_MAGNIFY;

/** Presentation multipliers for Solar System bodies */
export const AU_ENHANCED = LEGACY_AU_ENHANCED;
export const PLANET_SCALE_ENHANCED = LEGACY_PLANET_SCALE_ENHANCED;

export { scaleManager };
