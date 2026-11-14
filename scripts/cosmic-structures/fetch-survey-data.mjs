// Downloads the public galaxy-survey tables used to build the cosmic-structure fields.
//   npx tsx scripts/cosmic-structures/fetch-survey-data.mjs [--force]   (npm run cosmic:fetch)
// Raw tables go to .taste-skill/cosmic-cache/ (ignored by Git); only the derived per-structure
// files in public/data/cosmic-structures/ are committed. Sources and terms: SURVEY_SOURCES in
// scripts/cosmic-structures/structure-definitions.ts.
import fs from "node:fs";
import path from "node:path";
import { SDSS_BOXES, SIXDF_BOXES, STRUCTURE_DEFINITIONS } from "./structure-definitions.ts";

const CACHE = ".taste-skill/cosmic-cache";
const FORCE = process.argv.includes("--force");
const AGENT = "ovu-cosmic-structures/1.0 (astronomy education; scripted catalogue download)";
const VIZIER = "https://vizier.cfa.harvard.edu/viz-bin/asu-tsv";
const SKYSERVER = "https://skyserver.sdss.org/dr17/SkyServerWS/SearchTools/SqlSearch";
const SIMBAD_TAP = "https://simbad.harvard.edu/simbad/sim-tap/sync";

async function download(url, file) {
  if (!FORCE && fs.existsSync(file) && fs.statSync(file).size > 0) return "cached";
  for (let attempt = 1; ; attempt++) {
    try {
      const response = await fetch(url, { headers: { "User-Agent": AGENT } });
      if (!response.ok) throw Error(`HTTP ${response.status}`);
      const text = await response.text();
      if (/<html/i.test(text.slice(0, 500))) throw Error("HTML error page instead of a table");
      fs.writeFileSync(file, text);
      return "downloaded";
    } catch (error) {
      if (attempt >= 3) throw Error(`${url.slice(0, 120)}…: ${error.message}`);
      await new Promise((resolve) => setTimeout(resolve, 4000 * attempt));
    }
  }
}

function sdssSql({ ra: [ra0, ra1], dec: [dec0, dec1], z: [z0, z1] }) {
  return [
    "select s.ra, s.dec, s.z, s.zErr, p.petroMag_r, p.modelMag_g, p.modelMag_r,",
    "p.extinction_g, p.extinction_r, p.petroR50_r, p.petroR90_r, p.expAB_r, p.deVAB_r,",
    "p.fracDeV_r, p.expPhi_r, p.deVPhi_r",
    "from SpecObj s join PhotoObj p on s.bestObjID = p.objID",
    "where s.class = 'GALAXY' and s.zWarning = 0",
    `and s.z between ${z0} and ${z1} and s.ra >= ${ra0} and s.ra < ${ra1}`,
    `and s.dec between ${dec0} and ${dec1}`,
  ].join(" ");
}

async function main() {
  fs.mkdirSync(CACHE, { recursive: true });
  const report = [];
  const twoMrs = path.join(CACHE, "2mrs.tsv");
  const columns =
    "ID,RAJ2000,DEJ2000,GLON,GLAT,Kcmag,Hcmag,Jcmag,E(B-V),Rext,b/a,type,cz,e_cz,SimbadName";
  report.push([
    "2MRS (Huchra et al. 2012)",
    await download(
      `${VIZIER}?-source=J/ApJS/199/26/table3&-out.max=unlimited&-out=${encodeURIComponent(columns)}`,
      twoMrs,
    ),
  ]);
  for (const [name, box] of Object.entries(SDSS_BOXES)) {
    for (let ra = box.ra[0]; ra < box.ra[1]; ra += 20) {
      const slice = { ...box, ra: [ra, Math.min(ra + 20, box.ra[1])] };
      const file = path.join(CACHE, `sdss-${name}-${slice.ra[0]}-${slice.ra[1]}.csv`);
      const query = new URLSearchParams({ cmd: sdssSql(slice), format: "csv" });
      report.push([
        `SDSS DR17 ${name} RA ${slice.ra.join("-")}`,
        await download(`${SKYSERVER}?${query}`, file),
      ]);
    }
  }
  for (const [name, { ra, dec, cz, radiusDeg }] of Object.entries(SIXDF_BOXES)) {
    const params = [
      "-source=VII/259/6dfgs",
      "-out.max=unlimited",
      "-oc.form=dec",
      "-out=" + encodeURIComponent("_RAJ2000,_DEJ2000,bJmag,rFmag,cz,e_cz,q_cz"),
      // VizieR needs decimal "RA Dec" separated by a space; "200 -31" or "200-31" match nothing.
      "-c=" +
        encodeURIComponent(
          `${((ra[0] + ra[1]) / 2).toFixed(3)} ${((dec[0] + dec[1]) / 2).toFixed(3)}`,
        ),
      radiusDeg ? `-c.rd=${radiusDeg}` : `-c.bd=${ra[1] - ra[0]}x${dec[1] - dec[0]}`,
      `cz=${cz[0]}..${cz[1]}`,
      "q_cz=3..4",
    ];
    const file = path.join(CACHE, `6dfgs-${name}.tsv`);
    report.push([`6dFGS DR3 ${name}`, await download(`${VIZIER}?${params.join("&")}`, file)]);
  }
  // Measured positions and redshifts of the labelled components.
  const ids = [...new Set(STRUCTURE_DEFINITIONS.flatMap((d) => d.components.map((c) => c.simbad)))];
  const list = ids.map((id) => `'${id.replace(/'/g, "''")}'`).join(",");
  const adql =
    "SELECT i.id, b.main_id, b.ra, b.dec, b.rvz_redshift, b.rvz_bibcode, b.coo_bibcode " +
    `FROM ident AS i JOIN basic AS b ON i.oidref = b.oid WHERE i.id IN (${list})`;
  const tap = new URLSearchParams({ REQUEST: "doQuery", LANG: "ADQL", FORMAT: "csv", QUERY: adql });
  report.push([
    "SIMBAD components",
    await download(`${SIMBAD_TAP}?${tap}`, path.join(CACHE, "simbad-components.csv")),
  ]);
  for (const [label, state] of report) console.log(`${state.padEnd(10)} ${label}`);
}

await main();
