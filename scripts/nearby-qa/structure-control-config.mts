import path from "node:path";
import { execFileSync } from "node:child_process";
import base from "./vite.config.mts";
// Read-only contemporaneous control for the cosmic-structure fields: serves the pinned
// pre-change structure renderer (StructureCloud) and its callers without touching the tree.
//   OVU_STRUCTURE_CONTROL_REVISION=<rev> node node_modules/vite/bin/vite.js --config scripts/nearby-qa/structure-control-config.mts
const root = process.cwd().replaceAll("\\", "/");
const revision = process.env.OVU_STRUCTURE_CONTROL_REVISION || "69047e4";
const files = [
  "src/stars/LargeScaleStructure3D.tsx",
  "src/stars/StructureCloud.tsx",
  "src/stars/SurveyGalaxyField.tsx",
  "src/lib/astronomy/cosmic-web/survey-catalogs.ts",
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
      name: "read-only-structure-source-control",
      enforce: "pre" as const,
      // StructureCloud.tsx no longer exists on disk; resolve the old import to its pinned source.
      resolveId(source: string) {
        const clean = source.split("?")[0].replaceAll("\\", "/");
        return clean === "./StructureCloud" || clean.endsWith("/src/stars/StructureCloud.tsx")
          ? root + "/src/stars/StructureCloud.tsx"
          : null;
      },
      load(id: string) {
        return originals.get(id.split("?")[0].replaceAll("\\", "/"));
      },
    },
    ...base.plugins!,
  ],
  cacheDir: path.join(root, ".taste-skill/structure-control/cache"),
  server: { host: "127.0.0.1", port: 31756, strictPort: true },
};
