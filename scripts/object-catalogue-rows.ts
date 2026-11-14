// Collects every object plotted in the universe into category sheets for the
// downloadable workbook. Run through `npm run export:catalogue`, which pipes this
// JSON into scripts/object-catalogue-xlsx.py.
import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
import { NAMED_STARS } from "../src/stars/data";
import { PLANETS } from "../src/stars/Planets";
import { REAL_SYSTEMS } from "../src/stars/real-exoplanets";
import { OBSERVED_OBJECTS } from "../src/stars/observed-objects";
import { objectHost, MILKY_WAY } from "../src/stars/object-hosts";
import { EXPLORER_GALAXIES } from "../src/stars/exploration-galaxies";
import { galaxyEntries } from "../src/stars/exploration-catalog";
import { getGalaxyByAnyName } from "../src/stars/galaxy-catalog";
import { COSMIC_BENCHMARKS } from "../src/lib/astronomy/cosmic-web/survey-catalogs";

type Cell = string | number | null;
export type Sheet = { name: string; columns: string[]; rows: Cell[][] };

const LY = "Distance (light-years)";
const aka = (aliases?: string[]) => (aliases ?? []).join("; ") || null;
const num = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

export function objectCatalogueSheets(): Sheet[] {
  const sun = NAMED_STARS.find((s) => s.name === "Sun")!;
  const solar: Sheet = {
    name: "Solar System",
    columns: [
      "Name",
      "Type",
      "Orbits",
      "Semi-major axis (AU)",
      "Eccentricity",
      "Mean radius (km)",
      "Notes",
    ],
    // 695,700 km is the IAU 2015 nominal solar radius.
    rows: [
      [
        "Sun",
        "Star (" + sun.spectral + ")",
        null,
        null,
        null,
        695700,
        "Our star; the centre of the Solar System.",
      ],
    ],
  };
  for (const p of PLANETS) {
    solar.rows.push([
      p.name,
      p.name === "Pluto" ? "Dwarf planet" : "Planet",
      "Sun",
      num(p.aAU),
      num(p.e),
      num(p.radiusKm),
      null,
    ]);
    for (const m of p.moons ?? [])
      solar.rows.push([m.name, "Moon", p.name, null, null, null, null]);
  }

  const stars: Sheet = {
    name: "Stars",
    columns: [
      "Name",
      "Type",
      "Spectral type",
      "Constellation",
      "Host galaxy",
      LY,
      "Right ascension",
      "Declination",
      "Apparent magnitude",
      "Temperature (K)",
      "Mass (Sun = 1)",
      "Radius (Sun = 1)",
      "Luminosity (Sun = 1)",
      "Known planets",
      "Also known as",
      "Notes",
    ],
    rows: NAMED_STARS.filter((s) => s !== sun).map((s) => [
      s.name,
      "Star",
      s.spectral,
      s.constellation,
      MILKY_WAY,
      num(s.distance),
      s.ra,
      s.dec,
      num(s.magnitude),
      num(s.temperature),
      num(s.mass),
      num(s.radius),
      num(s.luminosity),
      REAL_SYSTEMS[s.name]?.length ?? null,
      null,
      null,
    ]),
  };
  const extragalacticStars = EXPLORER_GALAXIES.flatMap((g) => galaxyEntries(g.name)).filter(
    (e) => e.kind === "host",
  );
  for (const e of extragalacticStars)
    stars.rows.push([
      e.name,
      "Star (other galaxy)",
      null,
      null,
      e.host,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      e.detail,
    ]);

  const exoplanets: Sheet = {
    name: "Exoplanets",
    columns: [
      "Name",
      "Status",
      "Host star",
      "Host galaxy",
      "Host star distance (light-years)",
      "Constellation",
      "Semi-major axis (AU)",
      "Eccentricity",
      "Orbital period (days)",
      "Radius (Earth = 1)",
      "Radius estimated",
      "Mass (Earth = 1)",
      "Notes",
    ],
    rows: [],
  };
  for (const [starName, planets] of Object.entries(REAL_SYSTEMS)) {
    const star = NAMED_STARS.find((s) => s.name === starName);
    for (const p of planets)
      exoplanets.rows.push([
        p.name,
        "Confirmed",
        starName,
        MILKY_WAY,
        num(star?.distance),
        star?.constellation ?? null,
        num(p.aAU),
        num(p.e),
        num(p.periodDays),
        num(p.radiusEarth),
        p.radiusEstimated ? "Yes" : "No",
        num(p.massEarth),
        null,
      ]);
  }
  const candidates = EXPLORER_GALAXIES.flatMap((g) => galaxyEntries(g.name)).filter(
    (e) => /candidate/i.test(e.type) && e.kind === "planet",
  );
  for (const e of candidates)
    exoplanets.rows.push([
      e.name,
      "Candidate (unconfirmed)",
      null,
      e.host,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      e.detail,
    ]);

  const galaxies: Sheet = {
    name: "Galaxies",
    columns: [
      "Name",
      "Type",
      "Morphology",
      LY,
      "Distance uncertainty (light-years)",
      "Distance method",
      "Group or cluster",
      "Constellation",
      "Right ascension (deg)",
      "Declination (deg)",
      "Redshift",
      "Also known as",
      "Notes",
    ],
    rows: EXPLORER_GALAXIES.map((g) => {
      const c = getGalaxyByAnyName(g.name);
      const note =
        g.name === MILKY_WAY
          ? "Our galaxy; distance is from the Sun to the Galactic Centre."
          : ((g as { note?: string }).note ?? null);
      return [
        g.name,
        c?.type ?? g.type,
        c?.morphologyClass ?? null,
        num(c?.independentDistanceLy ?? g.distance),
        num(c?.distanceUncertaintyLy),
        c?.independentDistanceMethod?.replace(/_/g, " ") ?? null,
        c?.hostGroup ?? null,
        c?.constellation ?? null,
        num(c?.ra),
        num(c?.dec),
        num(c?.redshift),
        aka(c?.aliases),
        note,
      ];
    }),
  };

  const objectColumns = [
    "Name",
    "Category",
    "Subtype",
    "Host galaxy",
    LY,
    "Galactic longitude (deg)",
    "Galactic latitude (deg)",
    "Diameter (light-years)",
    "Observed in",
    "Also known as",
    "Source",
  ];
  const objectSheet = (name: string): Sheet => ({ name, columns: objectColumns, rows: [] });
  const nebulae = objectSheet("Nebulae"),
    blackHoles = objectSheet("Black Holes"),
    remnants = objectSheet("Neutron Stars & Remnants"),
    clusters = objectSheet("Star Clusters"),
    other = objectSheet("Quasars & Gravitational Waves");
  for (const o of OBSERVED_OBJECTS) {
    // Same black-hole rule as the explorer's category filter.
    const sheet =
      o.category === "Black hole" || /black.hole candidate/i.test(o.subtype)
        ? blackHoles
        : o.category === "Nebula"
          ? nebulae
          : ["Neutron star", "Stellar remnant"].includes(o.category)
            ? remnants
            : o.category === "Star cluster"
              ? clusters
              : ["Variable star", "Unusual star", "Supergiant", "Dwarf star"].includes(o.category)
                ? stars
                : other;
    const host = objectHost(o.id) ?? "Not identified";
    if (sheet === stars)
      stars.rows.push([
        o.name,
        o.category,
        o.subtype,
        null,
        host,
        num(o.distance),
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        aka(o.aliases),
        o.observed ?? null,
      ]);
    else
      sheet.rows.push([
        o.name,
        o.category,
        o.subtype,
        host,
        num(o.distance),
        num(o.l),
        num(o.b),
        num(o.diameterLy),
        o.observed ?? null,
        aka(o.aliases),
        o.source ?? null,
      ]);
  }

  const structures: Sheet = {
    name: "Cosmic Structures",
    columns: [
      "Name",
      "Type",
      "Distance (billion light-years)",
      "Diameter (million light-years)",
      "Galactic longitude (deg)",
      "Galactic latitude (deg)",
      "Description",
    ],
    rows: COSMIC_BENCHMARKS.map((b) => [
      b.name,
      b.type[0].toUpperCase() + b.type.slice(1),
      num(b.distanceGlyPlanck),
      num(b.diameterMly),
      num(b.l),
      num(b.b),
      b.description,
    ]),
  };

  const sheets = [
    solar,
    stars,
    exoplanets,
    galaxies,
    nebulae,
    blackHoles,
    remnants,
    clusters,
    other,
    structures,
  ];
  // Self-check: every source object lands in exactly one sheet, and no row is nameless.
  const total = sheets.reduce((n, s) => n + s.rows.length, 0);
  const expected =
    1 +
    PLANETS.reduce((n, p) => n + 1 + (p.moons?.length ?? 0), 0) +
    (NAMED_STARS.length - 1) +
    extragalacticStars.length +
    Object.values(REAL_SYSTEMS).flat().length +
    candidates.length +
    EXPLORER_GALAXIES.length +
    OBSERVED_OBJECTS.length +
    COSMIC_BENCHMARKS.length;
  assert.equal(total, expected);
  for (const s of sheets) {
    assert.ok(s.rows.length > 0, s.name);
    for (const r of s.rows) assert.ok(typeof r[0] === "string" && r[0].trim(), s.name);
    for (const r of s.rows) assert.equal(r.length, s.columns.length, `${s.name}: ${r[0]}`);
  }
  // One combined, filterable list; the Category column names the sheet with full details.
  const all: Sheet = {
    name: "All Objects",
    columns: ["Name", "Category", "Type", "Host galaxy", LY, "Also known as"],
    rows: [],
  };
  for (const s of sheets) {
    const col = (...names: string[]) =>
      names.map((n) => s.columns.indexOf(n)).find((i) => i >= 0) ?? -1;
    const [type, host, distance, gly, alias] = [
      col("Type", "Subtype", "Status"),
      col("Host galaxy"),
      col(LY, "Host star distance (light-years)"),
      col("Distance (billion light-years)"),
      col("Also known as"),
    ];
    for (const r of s.rows)
      all.rows.push([
        r[0],
        s.name,
        type >= 0 ? r[type] : null,
        host >= 0 ? r[host] : s === solar ? MILKY_WAY : null,
        distance >= 0
          ? r[distance]
          : gly >= 0 && typeof r[gly] === "number"
            ? Math.round(r[gly] * 1e9)
            : null,
        alias >= 0 ? r[alias] : null,
      ]);
  }
  return [all, ...sheets];
}

if (import.meta.url === pathToFileURL(process.argv[1]).href)
  process.stdout.write(
    JSON.stringify({
      generated: new Date().toISOString().slice(0, 10),
      sheets: objectCatalogueSheets(),
    }),
  );
