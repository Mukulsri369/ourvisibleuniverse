import fs from "node:fs";
import { spawnSync } from "node:child_process";
const names = [
  "nearby-expansion",
  "nearby-catalog",
  "nearby-source-crosscheck",
  "astronomy",
  "galaxy-explorer",
  "galaxy-entry",
  "galaxy-experience",
  "galaxy-rendering",
  "galaxy-populations",
  "galaxy-landmarks",
  "galaxy-empty-space",
  "galaxy-clarity",
  "exploration-camera-ownership",
  "navigation-flight",
  "andromeda-expansion",
  "andromeda-remaining",
  "nebula",
  "nebula-journey",
  "compact-objects",
  "black-hole",
  "extragalactic-atlas",
];
fs.mkdirSync(".taste-skill/nearby-qa/checks", { recursive: true });
const checks = [];
for (const name of names) {
  const file =
    name === "nearby-source-crosscheck"
      ? "scripts/nearby-source-crosscheck.ts"
      : `scripts/${name}-validation.ts`;
  const start = performance.now();
  const run = spawnSync(process.execPath, ["--import", "tsx", file], {
    encoding: "utf8",
    maxBuffer: 8 * 1024 * 1024,
  });
  fs.writeFileSync(
    `.taste-skill/nearby-qa/checks/${name}.log`,
    (run.stdout ?? "") + (run.stderr ?? ""),
  );
  checks.push({
    command: `node --import tsx ${file}`,
    exitCode: run.status,
    elapsedMs: performance.now() - start,
  });
  console.log(`${run.status === 0 ? "PASS" : "FAIL"}: ${name}`);
  if (run.status !== 0) {
    console.log((run.stdout ?? "").slice(-2500) + (run.stderr ?? "").slice(-2500));
    process.exitCode = 1;
    break;
  }
}
fs.writeFileSync("docs/nearby-galaxy-checks.json", JSON.stringify({ checks }, null, 2) + "\n");
