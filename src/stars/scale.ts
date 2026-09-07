/** The scene's astronomical coordinate system uses one unit per light-year. */
export const LIGHT_YEARS_PER_AU = 1 / 63_241.077;

/** Mean solar radius expressed in astronomical units. */
export const SOLAR_RADIUS_AU = 0.00465047;

/**
 * Legacy catalog body radii were authored for visibility at galaxy scale.
 * This converts those values back to physical planet/moon/ring dimensions:
 * 0.085 legacy AU becomes 0.000472 AU, approximately Jupiter's radius.
 */
export const LEGACY_BODY_RADIUS_TO_AU = 1 / 180;

/**
 * Presentation magnification for extragalactic star systems. At true physical
 * scale a planet is ~1e-9 ly across and simply cannot be seen next to its
 * orbit, so bodies (and moon orbits) are enlarged by a fixed factor while all
 * relative proportions inside a system are preserved.
 */
export const EXO_BODY_MAGNIFY = 500;
export const EXO_STAR_MAGNIFY = 120;

/** Legacy catalog body radius/distance -> AU, including the visibility boost. */
export const EXO_BODY_SCALE = LEGACY_BODY_RADIUS_TO_AU * EXO_BODY_MAGNIFY;
