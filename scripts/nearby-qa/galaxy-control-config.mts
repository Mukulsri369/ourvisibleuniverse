import path from "node:path";
import { execFileSync } from "node:child_process";
import base from "./vite.config.mts";
// Read-only contemporaneous control for galaxy rendering: serves the pinned pre-change galaxy
// shaders, disk layer and star fields without touching the working tree, so before/after renders
// and frame times come from the same machine state.
//   OVU_GALAXY_CONTROL_REVISION=<rev> node node_modules/vite/bin/vite.js --config scripts/nearby-qa/galaxy-control-config.mts
const root = process.cwd().replaceAll("\\", "/");
const revision = process.env.OVU_GALAXY_CONTROL_REVISION || "HEAD";
const files = [
  "src/stars/GalaxyInteriorField.tsx",
  "src/stars/galaxy-disk-layer.ts",
  "src/stars/galaxy-star-data.ts",
  "src/stars/galaxy-volume-shader.ts",
];
const originals = new Map(
  files.map((file) => [
    root + "/" + file,
    execFileSync("git", ["show", revision + ":" + file], {
      encoding: "utf8",
      maxBuffer: 8 * 1024 * 1024,
    }),
  ]),
);
export default {
  ...base,
  plugins: [
    {
      name: "read-only-galaxy-source-control",
      enforce: "pre" as const,
      load(id: string) {
        return originals.get(id.split("?")[0].replaceAll("\\", "/"));
      },
    },
    ...base.plugins!,
  ],
  cacheDir: path.join(root, ".taste-skill/galaxy-control/cache"),
  server: { host: "127.0.0.1", port: 31757, strictPort: true },
};
