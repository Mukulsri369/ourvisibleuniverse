import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
const manifest = JSON.parse(
  fs.readFileSync("src/stars/catalog-data/nearby-v2/source-manifest.json", "utf8"),
);
const destination = path.resolve(process.argv[2] || ".cache/nearby-catalogue-sources");
fs.mkdirSync(destination, { recursive: true });
const sha = (data) => crypto.createHash("sha256").update(data).digest("hex");
for (const source of manifest.rawFiles) {
  if (path.basename(source.file) !== source.file || !source.url?.startsWith("https://"))
    throw Error("Unsafe source manifest path/URL");
  const file = path.join(destination, source.file);
  if (fs.existsSync(file)) {
    console.log("Read existing snapshot: " + source.file);
    continue;
  }
  const temporary = file + ".download";
  const result = spawnSync(
    process.platform === "win32" ? "curl.exe" : "curl",
    ["-fLsS", "--connect-timeout", "10", "--max-time", "60", source.url, "-o", temporary],
    { stdio: "inherit" },
  );
  if (result.error || result.status !== 0) throw Error("Source download failed: " + source.file);
  // VizieR response headers contain a fresh request timestamp. The normalized
  // input hashes and --check regeneration establish scientific reproducibility.
  if (sha(fs.readFileSync(temporary)) !== source.sha256)
    console.log("New raw response hash; compare normalized inputs before adopting: " + source.file);
  fs.renameSync(temporary, file);
}
console.log(
  "Raw source snapshots ready. Run prepare-nearby-inputs.mjs, then review the manifest/input diff.",
);
