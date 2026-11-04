import { defineConfig } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";
import paths from "vite-tsconfig-paths";

// Independent Worker adapter; the preserved Lovable build remains on its original branch.
export default defineConfig({
  plugins: [
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tanstackStart(),
    react(),
    tailwind(),
    paths(),
  ],
  server: { host: "127.0.0.1", port: 31751, strictPort: true },
  preview: { host: "127.0.0.1", port: 31751, strictPort: true },
  resolve: { dedupe: ["react", "react-dom", "@tanstack/react-router", "@tanstack/react-start"] },
});
