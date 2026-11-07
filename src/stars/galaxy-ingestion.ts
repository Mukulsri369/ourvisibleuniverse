import type { ObservationalGalaxy } from "./galaxy-catalog";
import type { GalaxyCatalogueEvidence, GalaxySourceCandidate } from "./galaxy-catalogue-types";
import { icrsToGalactic } from "@/lib/astronomy/coordinates";
import { LIGHT_YEARS_PER_PARSEC } from "@/lib/astronomy/constants";
const roman = (s: string) => {
  const v: Record<string, number> = { i: 1, v: 5, x: 10, l: 50 };
  let n = 0;
  for (let i = 0; i < s.length; i++) n += (v[s[i]] < (v[s[i + 1]] ?? 0) ? -1 : 1) * v[s[i]];
  return String(n);
};
/** Catalogue names only: punctuation/diacritics, catalogue zero padding, and named-dwarf Roman numerals. */
export function galaxyIdentityKey(name: string): string {
  // Preserve the declination sign in coordinate-style survey identifiers.
  name = name.replace(
    /([jJ]\d{4,6}(?:\.\d+)?)([+\-−])(?=\d{2})/g,
    (_, prefix, sign) => prefix + (sign === "+" ? "plus" : "minus"),
  );
  let key = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/^name\s+/, "")
    .replace(/[^a-z0-9]/g, "")
    .replace(/^messier/, "m")
    .replace(/^leda/, "pgc")
    .replace(/^and(?=[ivxl\d])/, "andromeda");
  key = key.replace(/^eso(\d+)g(?=\d)/, "eso$1");
  key = key.replace(/^(m|ngc|ic|ugc|ugca|pgc|ddo|kdg|kkh|kkr|kk|eso)0+(?=\d)/, "$1");
  key = key.replace(
    /^(andromeda|bootes|segue|ursamajor|canesvenatici|leo|pisces|hydra|tucana|carina|crater|aquarius|pictor|grus|cetus)([ivxl]+)$/,
    (all, prefix, suffix) => prefix + roman(suffix),
  );
  return key;
}
const equivalents: Record<string, string> = {
  aquarius: "Aquarius Dwarf",
  antlia: "Antlia Dwarf",
  carina: "Carina Dwarf",
  cetus: "Cetus Dwarf",
  draco: "Draco Dwarf",
  fornax: "Fornax Dwarf",
  phoenix: "Phoenix Dwarf",
  sculptor: "Sculptor Dwarf",
  tucana: "Tucana Dwarf",
  hercules: "Hercules Dwarf",
  ursaminor: "Ursa Minor Dwarf",
  umin: "Ursa Minor Dwarf",
  sexdsph: "Sextans Dwarf",
  sextans1: "Sextans Dwarf",
  sagdsph: "Sagittarius Dwarf",
  sagittariusdsph: "Sagittarius Dwarf",
  sagdir: "Sagittarius Dwarf Irregular",
  sagittariusdirr: "Sagittarius Dwarf Irregular",
  pegasus: "Pegasus Dwarf Irregular",
  pegasusdirr: "Pegasus Dwarf Irregular",
  comai: "Coma Berenices Dwarf",
  comaberenices: "Coma Berenices Dwarf",
  umai: "Ursa Major I",
  umaii: "Ursa Major II",
  cvni: "Canes Venatici I",
  cvnii: "Canes Venatici II",
  triangulum: "M33",
  kk200003: "KKs 3",
  kk230: "KKR 3",
  kdg90: "DDO 113",
  ddo187: "UGC 9128",
  ugca438: "UKS 2323-326",
  leodwarfgalaxy: "Leo A",
  sexa: "Sextans A",
  sexb: "Sextans B",
};
export const sourceIdentityKey = (name: string) => {
  const k = galaxyIdentityKey(name);
  return equivalents[k] ? galaxyIdentityKey(equivalents[k]) : k;
};
export function parseSkyCoordinate(text: string, hours = false): number {
  const pieces = text
    .trim()
    .replace(/^[+-]/, "")
    .split(/[:\s]+/)
    .map(Number);
  if (
    pieces.length !== 3 ||
    pieces.some((n) => !Number.isFinite(n)) ||
    pieces[1] < 0 ||
    pieces[1] >= 60 ||
    pieces[2] < 0 ||
    pieces[2] >= 60
  )
    throw Error("Invalid sexagesimal position");
  const n =
    (pieces[0] + pieces[1] / 60 + pieces[2] / 3600) *
    (hours ? 15 : 1) *
    (text.trim().startsWith("-") ? -1 : 1);
  if (hours ? n < 0 || n >= 360 : n < -90 || n > 90) throw Error("Coordinate outside sky");
  return n;
}
export function modulusError(distanceMpc: number, minus: number, plus = minus) {
  if (!(distanceMpc > 0) || ![minus, plus].every((x) => Number.isFinite(x) && x >= 0))
    throw Error("Invalid distance uncertainty");
  return {
    minus: distanceMpc * (1 - 10 ** (-minus / 5)),
    plus: distanceMpc * (10 ** (plus / 5) - 1),
  };
}
export function angularSeparationArcsec(
  a: { ra: number; dec: number },
  b: { ra: number; dec: number },
) {
  const rad = Math.PI / 180,
    sd = Math.sin(((a.dec - b.dec) * rad) / 2),
    sr = Math.sin(((a.ra - b.ra) * rad) / 2);
  return (
    ((2 *
      Math.asin(
        Math.min(1, Math.sqrt(sd * sd + Math.cos(a.dec * rad) * Math.cos(b.dec * rad) * sr * sr)),
      )) /
      rad) *
    3600
  );
}
export type IngestionDecision = {
  sourceId: string;
  rowName: string;
  status: "added" | "preserved-existing" | "reconciled-source" | "deferred";
  canonicalId?: string;
  reason: string;
  separationArcsec?: number;
  distanceDisagreementMpc?: { adopted: number; source: number };
  positionDisagreementArcsec?: number;
};
export type GalaxyIdentityHistory = { id: string; names: string[] };
export function ingestGalaxySources(
  existing: readonly ObservationalGalaxy[],
  candidates: readonly GalaxySourceCandidate[],
  history: readonly GalaxyIdentityHistory[] = [],
) {
  const added: ObservationalGalaxy[] = [],
    decisions: IngestionDecision[] = [],
    extraAliases: Record<string, string[]> = {};
  const known = new Map<string, Set<ObservationalGalaxy>>();
  const historicalNames = new Map<string, GalaxyIdentityHistory[]>();
  for (const identity of history)
    for (const name of identity.names) {
      const key = sourceIdentityKey(name);
      historicalNames.set(key, [...(historicalNames.get(key) ?? []), identity]);
    }
  const register = (
    g: ObservationalGalaxy,
    names = [g.name, g.preferredName, g.id, ...g.aliases],
  ) => {
    for (const n of names) {
      const k = sourceIdentityKey(n);
      if (!k) continue;
      const set = known.get(k) ?? new Set();
      set.add(g);
      known.set(k, set);
    }
  };
  for (const g of existing) {
    register(g);
    const prefix = g.name.match(/^((?:NGC|IC|UGC|DDO)\s*\d+)\b/i)?.[1];
    if (prefix) register(g, [prefix]);
  }
  for (const c of candidates) {
    const aliases = [...new Set([c.rowName, c.name, ...c.aliases].filter(Boolean))];
    const historical = [
      ...new Map(
        aliases
          .flatMap((name) => historicalNames.get(sourceIdentityKey(name)) ?? [])
          .map((identity) => [identity.id, identity]),
      ).values(),
    ];
    const matches = new Set(aliases.flatMap((n) => [...(known.get(sourceIdentityKey(n)) ?? [])]));
    const reject = (reason: string) =>
      decisions.push({ sourceId: c.sourceId, rowName: c.rowName, status: "deferred", reason });
    if (matches.size > 1) {
      reject("Conflicting cross-catalogue identities; manual reconciliation required");
      continue;
    }
    if (historical.length > 1) {
      reject("Conflicting historical canonical identities; manual review required");
      continue;
    }
    if (matches.size === 1) {
      const g = [...matches][0];
      const adoptedMpc = g.distance / (1e6 * LIGHT_YEARS_PER_PARSEC);
      const distanceDisagreementMpc =
        c.distanceMpc !== null &&
        Math.abs(adoptedMpc - c.distanceMpc) > Math.max(0.01, adoptedMpc * 0.2)
          ? { adopted: adoptedMpc, source: c.distanceMpc }
          : undefined;
      let positionDisagreementArcsec: number | undefined;
      try {
        const delta = angularSeparationArcsec(g, {
          ra: parseSkyCoordinate(c.ra, true),
          dec: parseSkyCoordinate(c.dec),
        });
        if (delta > 60) positionDisagreementArcsec = delta;
      } catch {
        positionDisagreementArcsec = undefined;
      }
      extraAliases[g.id] = [...new Set([...(extraAliases[g.id] ?? []), ...aliases])];
      register(g, aliases);
      decisions.push({
        sourceId: c.sourceId,
        rowName: c.rowName,
        status: existing.includes(g) ? "preserved-existing" : "reconciled-source",
        canonicalId: g.id,
        reason: "Verified source name/alias identity; prior adopted measurements retained",
        ...(distanceDisagreementMpc ? { distanceDisagreementMpc } : {}),
        ...(positionDisagreementArcsec !== undefined ? { positionDisagreementArcsec } : {}),
      });
      continue;
    }
    if (
      c.uncertainIdentity ||
      /^(HIcld)$/i.test(c.morphology ?? "") ||
      /^(Bol520|Segue 3|Willman1|Milky Way)$/i.test(c.rowName)
    ) {
      reject(
        "Candidate, stellar structure, cloud, shared unresolved component centre, or disputed galaxy identity",
      );
      continue;
    }
    if (c.sourceId === "ungc-2013" && c.distanceMpc !== null && c.distanceMpc < 1.5) {
      reject(
        "Nearby identity requires newer Local Group reconciliation; not imported solely from 2013 membership",
      );
      continue;
    }
    if (c.distanceBasis === "flow" || c.distanceBasis === "appearance") {
      reject(
        "Peculiar-velocity-sensitive flow distance or appearance-only distance withheld from this release",
      );
      continue;
    }
    if (!c.morphology && c.tType == null) {
      reject("Morphological galaxy classification not established by the inspected source");
      continue;
    }
    if (
      c.morphology &&
      !/^(?:Sph|dSph|dE(?:em)?|cE|dS0em|S0em|Tr|Ir|Im|Irr|Sm|Sc|BCD|dIrr|\(d\)Irr|dIrr\/dSph|dSph\/dIrr|dE\/dSph)\??$/.test(
        c.morphology,
      )
    ) {
      reject("Unrecognized or uncertain non-galaxy classification; manual review required");
      continue;
    }
    if (!c.distanceMethod) {
      reject("Distance method absent; no independent indicator asserted");
      continue;
    }
    if (
      c.distanceMpc == null ||
      !Number.isFinite(c.distanceMpc) ||
      c.distanceMpc <= 0 ||
      c.distanceMpc > 30 ||
      c.major == null ||
      c.major <= 0 ||
      !Number.isFinite(c.major) ||
      (c.axisRatio !== null &&
        (!Number.isFinite(c.axisRatio) || c.axisRatio <= 0 || c.axisRatio > 1))
    ) {
      reject(
        "Missing or invalid adopted distance / angular extent / axis ratio, or outside selected scope",
      );
      continue;
    }
    let ra: number, dec: number;
    try {
      ra = parseSkyCoordinate(c.ra, true);
      dec = parseSkyCoordinate(c.dec);
    } catch {
      reject("Invalid source coordinate");
      continue;
    }
    const neighbours = [...existing, ...added].filter(
      (g) => angularSeparationArcsec({ ra, dec }, g) < 30,
    );
    if (neighbours.length) {
      reject(
        "Close angular neighbour without a verified alias match; deferred, never merged by coordinates alone",
      );
      continue;
    }
    const morph = c.morphology ?? `T=${c.tType}`;
    const sph = /Sph|dE/.test(morph),
      transition = /Tr|dIrr\/dSph/.test(morph),
      irregular = /^(Ir|Im|Sm|BCD|\(d\)Irr)|dIrr/.test(morph),
      early = c.tType !== null && c.tType !== undefined && c.tType <= 0;
    const type = transition
      ? "Transition dwarf irregular"
      : /BCD/.test(morph)
        ? "Blue compact dwarf"
        : sph
          ? /em/.test(morph)
            ? "Emission-line dwarf elliptical"
            : /Sph/.test(morph)
              ? "Dwarf spheroidal"
              : "Dwarf elliptical"
          : /S0em/.test(morph)
            ? `${morph.startsWith("d") ? "Emission-line dwarf" : "Emission-line"} lenticular`
            : irregular
              ? "Dwarf irregular"
              : early
                ? "Early type (elliptical / lenticular)"
                : c.tType !== null && c.tType !== undefined && c.tType >= 9
                  ? "Irregular"
                  : /Irr/.test(morph)
                    ? "Irregular"
                    : "Spiral";
    const distance = c.distanceMpc * 1e6 * LIGHT_YEARS_PER_PARSEC;
    const size = 2 * distance * Math.tan((c.major * Math.PI) / (180 * 60 * 2));
    const groupNames: Record<string, string> = {
      G: "Milky Way subgroup",
      A: "M31 subgroup",
      L: "Local Group",
      N: "Local Group neighbourhood",
      "A/L": "M31 / Local Group boundary",
      "L/G": "Local Group / Milky Way boundary",
      "G/L": "Milky Way / Local Group boundary",
      "L/A": "Local Group / M31 boundary",
    };
    const sourceUrl =
      c.sourceId === "ungc-2013"
        ? "https://cdsarc.cds.unistra.fr/viz-bin/cat/J/AJ/145/101"
        : "https://www3.cadc-ccda.hia-iha.nrc-cnrc.gc.ca/en/community/nearby/";
    const group =
      c.sourceId === "mcconnachie-2021" && c.groupCode
        ? {
            name: groupNames[c.groupCode] ?? c.groupCode,
            basis: "Author October 2019 Table 1 subgroup code; not inferred from distance",
            confidence: (c.groupCode.includes("/") ? "uncertain" : "catalogue-association") as
              "uncertain" | "catalogue-association",
            source:
              "https://www.cadc-ccda.hia-iha.nrc-cnrc.gc.ca/files/vault/PANDAS/NearbyGals/table1_OCT2019.pdf",
          }
        : c.tidalIndex !== null && c.tidalIndex !== undefined && c.tidalIndex > 0 && c.mainDisturber
          ? {
              name: `UNGC association: ${c.mainDisturber}`,
              basis:
                "UNGC 2013 tidal index Θ1 > 0 and shared main disturber; a catalogue-model association",
              confidence: "catalogue-association" as const,
              source: sourceUrl,
            }
          : undefined;
    let distanceErrorMpc: GalaxyCatalogueEvidence["distanceErrorMpc"];
    if (c.dmMinus != null && c.dmPlus != null)
      distanceErrorMpc = modulusError(c.distanceMpc, c.dmMinus, c.dmPlus);
    else if (c.dmSigma != null) distanceErrorMpc = modulusError(c.distanceMpc, c.dmSigma);
    const evidence: GalaxyCatalogueEvidence = {
      sourceId: c.sourceId,
      edition:
        c.sourceId === "ungc-2013"
          ? "UNGC 2013"
          : "McConnachie January 2021; subgroup/morphology October 2019",
      rowName: c.rowName,
      sourceUrl,
      references: c.references,
      coordinateFrame: "FK5 J2000 (treated as ICRS for scene conversion)",
      distanceMpc: c.distanceMpc,
      distanceMethod: c.distanceMethod,
      distanceBasis: c.distanceBasis,
      distanceErrorMpc,
      ...(c.velocity !== null ? { velocityKmS: c.velocity } : {}),
      ...(c.velocitySigma != null ? { velocityErrorKmS: c.velocitySigma } : {}),
      velocityFrame: "heliocentric",
      sizeDefinition: c.halfLight
        ? "four-half-light-radii-envelope"
        : c.surfaceBrightness === "X"
          ? "Holmberg-or-profile-scale"
          : "Holmberg-B26.5",
      angularMajorArcmin: c.major,
      ...(c.axisRatio !== null ? { axisRatio: c.axisRatio } : {}),
      ...(c.halfLight ? { halfLightRadiusArcmin: c.halfLight } : {}),
      inclinationBasis:
        c.inclination != null && !sph && !irregular && !early && !transition
          ? "catalogue-axis-ratio-estimate"
          : "not-measured",
      positionAngleMeasured: c.pa != null,
      morphology: morph,
      morphologyUncertain: morph.includes("?"),
      group,
      surfaceBrightnessClass: c.surfaceBrightness,
    };
    const id =
      historical[0]?.id ?? `${c.sourceId}-${galaxyIdentityKey(c.rowName.replace(/^\*/, ""))}`;
    if (added.some((g) => g.id === id)) {
      reject("Historical identity reused without a validated alias match; manual review required");
      continue;
    }
    const notes = `${evidence.edition}; source row ${c.rowName}. Adopted distance (${c.distanceBasis}): ${c.distanceMethod}. ${distanceErrorMpc ? "Published modulus errors propagated asymmetrically; source/systematic limitations remain." : "Distance uncertainty is not supplied; this does not imply an exact distance."} ${c.halfLight ? "Display envelope is four major-axis half-light radii, not a measured outer diameter." : "Angular extent is the B-band Holmberg isophote; very low surface-brightness entries may instead use a profile scale."} ${c.pa == null ? "Sky position angle is not supplied; roll is illustrative." : "Position angle is the cited projected major-axis fit."} Individual stars, intrinsic depth, arms, dust and colours are reconstructed. Overview markers can be enlarged for visibility; catalogue centres and travel distances are not compressed.`;
    const g: ObservationalGalaxy = {
      id,
      name: c.name,
      preferredName: c.name,
      aliases: [...new Set([...aliases, ...(historical[0]?.names ?? [])])],
      type,
      ra,
      dec,
      ...icrsToGalactic(ra, dec),
      distance,
      size,
      color: sph || early ? "#e6cda9" : "#b5cced",
      ...(c.inclination != null && !sph && !irregular && !early && !transition
        ? { inclination: c.inclination }
        : {}),
      ...(c.pa != null ? { posAngle: ((c.pa % 180) + 180) % 180 } : {}),
      ...(c.velocity !== null
        ? {
            redshift: c.velocity / 299792.458,
            redshiftMethod: "velocity_proxy",
            radialVelocityKmS: c.velocity,
          }
        : {}),
      ...(c.distanceBasis === "individual-indicator"
        ? { independentDistanceLy: distance, independentDistanceMpc: c.distanceMpc }
        : {}),
      ...(distanceErrorMpc
        ? {
            distanceUncertaintyLy:
              Math.max(distanceErrorMpc.minus, distanceErrorMpc.plus) *
              1e6 *
              LIGHT_YEARS_PER_PARSEC,
          }
        : {}),
      morphologyClass: morph,
      angularDiameterArcmin: {
        major: c.major,
        ...(c.axisRatio !== null ? { minor: c.major * c.axisRatio } : {}),
      },
      ...(group ? { hostGroup: group.name } : {}),
      observationSource: sourceUrl,
      bibcode: c.sourceId === "ungc-2013" ? "2013AJ....145..101K" : "2012AJ....144....4M",
      uncertaintyNotes: notes,
      level: 2,
      distanceTier:
        c.sourceId === "mcconnachie-2021" && c.groupCode && c.groupCode !== "N"
          ? "local_group"
          : "nearby_groups",
      catalogueEvidence: evidence,
    };
    added.push(g);
    register(g);
    decisions.push({
      sourceId: c.sourceId,
      rowName: c.rowName,
      status: "added",
      canonicalId: id,
      reason: "Source identity, galaxy classification, adopted distance and direction validated",
    });
  }
  for (const galaxy of added)
    galaxy.aliases = [...new Set([...galaxy.aliases, ...(extraAliases[galaxy.id] ?? [])])];
  return { added, extraAliases, decisions };
}
