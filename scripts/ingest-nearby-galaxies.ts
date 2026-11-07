import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { format, resolveConfig } from "prettier";
import { LIGHT_YEARS_PER_PARSEC } from "../src/lib/astronomy/constants";
import baseline from "../src/stars/catalog-data/nearby-v2/baseline-387de79.json";
import manifest from "../src/stars/catalog-data/nearby-v2/source-manifest.json";
import { OBSERVATIONAL_GALAXY_CATALOG } from "../src/stars/galaxy-catalog";
import { NEARBY_SOURCE_CANDIDATES } from "../src/stars/galaxy-catalogue-sources";
import { ingestGalaxySources, type GalaxyIdentityHistory } from "../src/stars/galaxy-ingestion";
const dir = "src/stars/catalog-data/nearby-v2",
  check = process.argv.includes("--check");
const hash = (s: string | Buffer) => crypto.createHash("sha256").update(s).digest("hex");
for (const input of manifest.inputs) {
  if (hash(fs.readFileSync(path.join(dir, input.file))) !== input.sha256)
    throw Error("Input checksum mismatch: " + input.file);
}
const base = OBSERVATIONAL_GALAXY_CATALOG.filter((g) =>
  baseline.galaxies.some((b) => b.id === g.id),
).map((g) => ({ ...g, aliases: [...baseline.galaxies.find((b) => b.id === g.id)!.aliases] }));
if (base.length !== baseline.count) throw Error("Baseline records missing");
const identityFile = path.join(dir, "identity-history.json");
const previousIdentities: GalaxyIdentityHistory[] = fs.existsSync(identityFile)
  ? JSON.parse(fs.readFileSync(identityFile, "utf8")).identities
  : [];
const output = ingestGalaxySources(base, NEARBY_SOURCE_CANDIDATES, previousIdentities);
const write = (file: string, data: unknown) => {
  const body = JSON.stringify(data, null, 2) + "\n";
  if (check) {
    if (fs.readFileSync(file, "utf8") !== body) throw Error("Generated data drift: " + file);
  } else if (!fs.existsSync(file) || fs.readFileSync(file, "utf8") !== body)
    fs.writeFileSync(file, body);
};
const chunks: string[] = [];
const identities = new Map(previousIdentities.map((identity) => [identity.id, identity]));
for (const galaxy of output.added)
  identities.set(galaxy.id, {
    id: galaxy.id,
    names: [
      ...new Set([...(identities.get(galaxy.id)?.names ?? []), ...galaxy.aliases, galaxy.name]),
    ],
  });
write(identityFile, {
  schemaVersion: 1,
  note: "Canonical IDs and verified historical names survive catalogue-edition and preferred-name changes. Never recycle these IDs.",
  identities: [...identities.values()],
});
for (let offset = 0; offset < output.added.length; offset += 64) {
  const name = `galaxies-${String(offset / 64).padStart(3, "0")}.json`;
  chunks.push(name);
  write(path.join(dir, name), output.added.slice(offset, offset + 64));
}
write(path.join(dir, "aliases.json"), output.extraAliases);
const statuses = Object.fromEntries(
  [...new Set(output.decisions.map((d) => d.status))].map((s) => [
    s,
    output.decisions.filter((d) => d.status === s).length,
  ]),
);
const coverage = {
  schemaVersion: 1,
  release: manifest.release,
  baselineCommit: baseline.commit,
  identityHistory: {
    file: "identity-history.json",
    sha256: hash(fs.readFileSync(identityFile)),
    retiredIds: [...identities.keys()].filter((id) => !output.added.some((g) => g.id === id)),
  },
  baselineCount: base.length,
  addedCount: output.added.length,
  totalCount: base.length + output.added.length,
  inventory: {
    distanceBins: Object.fromEntries(
      [
        [0, 1.5],
        [1.5, 11],
        [11, 30],
        [30, 100],
        [100, Infinity],
      ].map(([lo, hi]) => [
        `${lo}-${hi}`,
        [...base, ...output.added].filter((g) => {
          const mpc = g.distance / (1e6 * LIGHT_YEARS_PER_PARSEC);
          return mpc >= lo && mpc < hi;
        }).length,
      ]),
    ),
    morphology: Object.fromEntries(
      [...new Set([...base, ...output.added].map((g) => g.type))]
        .sort()
        .map((type) => [type, [...base, ...output.added].filter((g) => g.type === type).length]),
    ),
    additionsBySource: Object.fromEntries(
      manifest.sources.map((s) => [
        s.id,
        output.added.filter((g) => g.catalogueEvidence!.sourceId === s.id).length,
      ]),
    ),
    distanceBasis: {
      newIndividualIndicator: output.added.filter(
        (g) => g.catalogueEvidence!.distanceBasis === "individual-indicator",
      ).length,
      newGroupAdoption: output.added.filter(
        (g) => g.catalogueEvidence!.distanceBasis === "group-adoption",
      ).length,
      previousMeasurementsPreserved: base.length,
    },
    newWithPublishedDistanceUncertainty: output.added.filter(
      (g) => g.catalogueEvidence!.distanceErrorMpc,
    ).length,
    newWithUnknownVelocity: output.added.filter((g) => g.radialVelocityKmS === undefined).length,
    newWithUnknownAxisRatio: output.added.filter(
      (g) => g.catalogueEvidence!.axisRatio === undefined,
    ).length,
    newDistanceMethods: Object.fromEntries(
      [...new Set(output.added.map((g) => g.catalogueEvidence!.distanceMethod))]
        .sort()
        .map((method) => [
          method,
          output.added.filter((g) => g.catalogueEvidence!.distanceMethod === method).length,
        ]),
    ),
  },
  expectedHiiCount: 46,
  previousAdditionCount: 126,
  sourceRows: manifest.sources.map((s) => ({
    id: s.id,
    expected: s.expectedRows,
    processed: output.decisions.filter((d) => d.sourceId === s.id).length,
  })),
  statuses,
  chunks: chunks.map((file) => ({ file, sha256: hash(fs.readFileSync(path.join(dir, file))) })),
  addedIds: output.added.map((g) => g.id),
  decisions: output.decisions,
};
write("docs/nearby-galaxy-coverage.json", coverage);
const code = await format(
  chunks.map((file, i) => `import chunk${i} from './catalog-data/nearby-v2/${file}';`).join("\n") +
    "\nimport aliases from './catalog-data/nearby-v2/aliases.json';\nimport type { ObservationalGalaxy } from './galaxy-catalog';\n// Generated by scripts/ingest-nearby-galaxies.ts; edit the versioned inputs, not these imports.\nexport const IMPORTED_GALAXIES: ObservationalGalaxy[] = [" +
    chunks.map((_, i) => `...chunk${i}`).join(",") +
    "] as ObservationalGalaxy[];\nexport const RECONCILED_GALAXY_ALIASES: Record<string,string[]> = aliases;\nexport const IMPORTED_GALAXY_BY_NAME = new Map(IMPORTED_GALAXIES.map(g=>[g.name,g]));\n",
  { ...(await resolveConfig("src/stars/galaxy-catalogue-data.ts")), parser: "typescript" },
);
if (check) {
  if (fs.readFileSync("src/stars/galaxy-catalogue-data.ts", "utf8") !== code)
    throw Error("Generated import drift");
} else if (fs.readFileSync("src/stars/galaxy-catalogue-data.ts", "utf8") !== code)
  fs.writeFileSync("src/stars/galaxy-catalogue-data.ts", code);
console.log(
  JSON.stringify({
    baseline: base.length,
    added: output.added.length,
    total: coverage.totalCount,
    statuses,
    deferrals: output.decisions
      .filter((d) => d.status === "deferred")
      .reduce<Record<string, number>>((a, d) => ((a[d.reason] = (a[d.reason] ?? 0) + 1), a), {}),
  }),
);
