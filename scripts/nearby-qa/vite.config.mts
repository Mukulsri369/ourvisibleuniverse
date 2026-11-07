import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";
import path from "node:path";
const root = process.cwd();
export default defineConfig({
  root,
  plugins: [react(), tailwind()],
  resolve: { alias: { "@": path.join(root, "src") }, dedupe: ["react", "react-dom", "three"] },
  cacheDir: path.join(root, ".taste-skill/nearby-qa/cache"),
  server: { host: "127.0.0.1", port: 31755, strictPort: true },
  define: { "import.meta.env.VITE_ANDROMEDA_QA": "false" },
});
