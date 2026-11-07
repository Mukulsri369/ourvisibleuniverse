import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { readVizierTSV, readFitsTable, numeric } from "./source-readers.mjs";
const dir = path.resolve(process.argv[2] || ".cache/nearby-catalogue-sources"),
  out = "src/stars/catalog-data/nearby-v2";
const hash = (s) => crypto.createHash("sha256").update(s).digest("hex");
const retrieved = fs
  .readFileSync(path.join(dir, "ungc-catalog.tsv"), "utf8")
  .match(/^#\s+Date:\s+(\d{4}-\d{2}-\d{2})/m)?.[1];
if (!retrieved) throw Error("VizieR retrieval date absent from source snapshot");
const write = (name, data) => {
  const file = path.join(out, name),
    body = JSON.stringify(data) + "\n";
  if (!fs.existsSync(file) || fs.readFileSync(file, "utf8") !== body) fs.writeFileSync(file, body);
};
const refs = new Map(readVizierTSV(path.join(dir, "ungc-refs.tsv")).map((r) => [r.Ref, r.BibCode]));
const distances = readVizierTSV(path.join(dir, "ungc-distances.tsv"));
const velocities = readVizierTSV(path.join(dir, "ungc-velocities.tsv"));
const ungc = readVizierTSV(path.join(dir, "ungc-catalog.tsv"));
const local = readFitsTable(path.join(dir, "NearbyGalaxies_Jan2021_PUBLIC.fits"));
if (ungc.length !== 869 || local.length !== 144 || distances.length !== 783)
  throw Error("Source edition row-count mismatch");
// Pinned factual transcription; updating the author table requires a reviewed metadata edition.
const classification = JSON.parse(
  fs.readFileSync(path.join(out, "local-group-2019-classifications.json"), "utf8"),
);
if (hash(fs.readFileSync(path.join(dir, "table1_OCT2019.pdf"))) !== classification.pdfSha256)
  throw Error("Unreviewed classification source edition");
const metadata = new Map(
  classification.rows.map(([name, group, morph]) => [name, { group, morph }]),
);
const localColumns = [
  "name",
  "ra",
  "dec",
  "dm",
  "dmPlus",
  "dmMinus",
  "velocity",
  "velocityPlus",
  "velocityMinus",
  "rhArcmin",
  "axisRatio",
  "pa",
  "references",
  "groupCode",
  "morphology",
  "classificationNote",
];
const clean = (v) => (typeof v === "number" && (v === 999 || !Number.isFinite(v)) ? null : v);
const localRows = local.map((r) => {
  const n = r.GalaxyName,
    meta = metadata.get(n);
  const row = [
    n,
    r.RA,
    r.Dec,
    ...["dmod", "dmod+", "dmod-", "vh", "vh+", "vh-", "rh"].map((k) => clean(r[k])),
    clean(r["e=1-b/a"]) === null ? null : 1 - r["e=1-b/a"],
    clean(r.PA),
    r.References,
    meta?.group ?? null,
    meta?.morph ?? null,
    meta?.morph?.includes("?") ? "Uncertain morphology in author table" : null,
  ];
  return row;
});
const ungcColumns = [
  "name",
  "ra",
  "dec",
  "majorArcmin",
  "axisRatio",
  "tType",
  "dwarfMorphology",
  "surfaceBrightnessClass",
  "velocity",
  "distanceMpc",
  "distanceMethod",
  "inclination",
  "tidalIndex",
  "mainDisturber",
  "simbadName",
  "nedName",
  "bMagnitude",
  "absoluteBMagnitude",
  "distanceModulus",
  "dmSigma",
  "distanceBibcode",
  "velocitySigma",
  "velocityBibcode",
];
const ungcRows = ungc.map((r) => {
  const match = distances.filter(
    (d) =>
      d.Name === r.Name &&
      d.n_DM === r.f_Dist &&
      Math.abs(10 ** ((+d.DM - 25) / 5) - +r.Dist) <= Math.max(0.015, +r.Dist * 0.015),
  );
  const d = match.length === 1 ? match[0] : null;
  const velocity = velocities.filter((v) => v.Name === r.Name && v.HRV === r.HRV);
  const v = velocity.length === 1 ? velocity[0] : null;
  return [
    r.Name,
    r.RAJ2000,
    r.DEJ2000,
    ...["a26", "b/a", "TT"].map((k) => numeric(r[k])),
    r.Mcl,
    r.Tdw,
    numeric(r.HRV),
    numeric(r.Dist),
    r.f_Dist,
    ...["i", "Ti1"].map((k) => numeric(r[k])),
    r.MD,
    r.SimbadName,
    r.NEDname,
    numeric(r.Bmag),
    numeric(r.BMag),
    d ? numeric(d.DM) : null,
    d ? numeric(d.e_DM) : null,
    d ? refs.get(d.r_DM) || null : null,
    v ? numeric(v.e_HRV) : null,
    v ? refs.get(v.r_HRV) || null : null,
  ];
});
write("ungc-2013-input.json", { schemaVersion: 1, columns: ungcColumns, rows: ungcRows });
write("local-dwarfs-2021-input.json", { schemaVersion: 1, columns: localColumns, rows: localRows });
const cadc = "https://www.cadc-ccda.hia-iha.nrc-cnrc.gc.ca/files/vault/PANDAS/NearbyGals/";
const rawUrl = (file) =>
  file.startsWith("ungc-")
    ? "https://vizier.cfa.harvard.edu/viz-bin/asu-tsv?-source=J/AJ/145/101/" +
      {
        "ungc-catalog.tsv": "catalog",
        "ungc-distances.tsv": "table6",
        "ungc-refs.tsv": "refs",
        "ungc-velocities.tsv": "table4",
      }[file] +
      "&-out.all&-out.max=unlimited"
    : file === "neargalcat.tdat.gz"
      ? "https://heasarc.gsfc.nasa.gov/FTP/heasarc/dbase/dump/heasarc_neargalcat.tdat.gz"
      : cadc + file;
const files = [
  "ungc-catalog.tsv",
  "ungc-distances.tsv",
  "ungc-refs.tsv",
  "ungc-velocities.tsv",
  "NearbyGalaxies_Jan2021_PUBLIC.fits",
  "References.dat",
  "Comments.dat",
  "Update.log",
  "table1_OCT2019.pdf",
  "neargalcat.tdat.gz",
];
write("source-manifest.json", {
  schemaVersion: 1,
  release: "nearby-2026-11-07-v1",
  retrieved,
  sources: [
    {
      id: "ungc-2013",
      edition: "2013; VizieR metadata publication 2017-06-12",
      catalogue: "J/AJ/145/101/catalog",
      expectedRows: 869,
      url: "https://vizier.cfa.harvard.edu/viz-bin/asu-tsv?-source=J/AJ/145/101/catalog&-out.all&-out.max=unlimited",
      bibcode: "2013AJ....145..101K",
      doi: "10.26093/cds/vizier.51450101",
      rights:
        "Source-specific rights; VizieR scientific-use policy requires attribution and defers commercial rights to the origin. Not labelled CC-BY.",
      rightsUrl: "https://cds.unistra.fr/vizier-org/licences_vizier.html",
      input: "ungc-2013-input.json",
    },
    {
      id: "mcconnachie-2021",
      edition: "January 19, 2021",
      expectedRows: 144,
      url: "https://www.cadc-ccda.hia-iha.nrc-cnrc.gc.ca/files/vault/PANDAS/NearbyGals/NearbyGalaxies_Jan2021_PUBLIC.fits",
      bibcode: "2012AJ....144....4M",
      metadataSupplement:
        "Author October 2019 Table 1; January 2021 Update.log and embedded FITS descriptions",
      rights:
        "Author-provided public scientific data; cite McConnachie and listed original papers. No blanket commercial licence asserted.",
      input: "local-dwarfs-2021-input.json",
    },
  ],
  rawFiles: files.map((file) => ({
    file,
    url: rawUrl(file),
    sha256: hash(fs.readFileSync(path.join(dir, file))),
    bytes: fs.statSync(path.join(dir, file)).size,
  })),
  inputs: [
    "ungc-2013-input.json",
    "local-dwarfs-2021-input.json",
    "local-group-2019-classifications.json",
  ].map((file) => ({
    file,
    sha256: hash(fs.readFileSync(path.join(out, file))),
  })),
  notes: [
    "No copyrighted imagery or publisher prose is included in derived application records. Source files remain outside Git.",
    "These are historical measurement editions, not a 2026 census. Commercial release rights need source-specific confirmation before publication.",
  ],
});
console.log(
  JSON.stringify({
    ungc: ungcRows.length,
    local: localRows.length,
    localClassifications: localRows.filter((r) => r[14]).length,
    missingLocal: localRows.filter((r) => !r[14]).map((r) => r[0]),
  }),
);
