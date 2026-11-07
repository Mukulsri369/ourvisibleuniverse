import path from "node:path";
import { execFileSync } from "node:child_process";
import base from "./vite.config.mts";
// Read-only contemporaneous source control. Serve the pinned pre-change code
// scene modules, without checking out or overwriting the working tree.
const root = process.cwd().replaceAll("\\", "/");
const revision = process.env.OVU_MOTION_CONTROL_REVISION || "e9477de";
const names = [
  "CameraRig.tsx",
  "CatalogueGalaxyField.tsx",
  "ObservationalGalaxyNode.tsx",
  "SurveyGalaxyField.tsx",
  "GalaxyRadiance.tsx",
  "GalaxyInteriorField.tsx",
  "GalaxyDetail.tsx",
  "galaxy-catalogue-shader.ts",
  "galaxy-volume-shader.ts",
];
const originals = new Map(
  names.map((name) => [
    root + "/src/stars/" + name,
    execFileSync("git", ["show", revision + ":src/stars/" + name], {
      encoding: "utf8",
      maxBuffer: 4 * 1024 * 1024,
    }),
  ]),
);
export default {
  ...base,
  plugins: [
    {
      name: "read-only-motion-source-control",
      enforce: "pre" as const,
      load(id: string) {
        return originals.get(id.split("?")[0].replaceAll("\\", "/"));
      },
    },
    ...base.plugins!,
  ],
  cacheDir: path.join(root, ".taste-skill/nearby-motion/control-cache"),
  server: { host: "127.0.0.1", port: 31756, strictPort: true },
};
