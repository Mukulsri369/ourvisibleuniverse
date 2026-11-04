import { defineConfig, loadEnv } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";
import paths from "vite-tsconfig-paths";

// Official Cloudflare Worker adapter; production deployment requires separate approval.
export default defineConfig(({ mode }) => {
  const publicEnv = loadEnv(mode, process.cwd(), "VITE_");
  const value = (name: string) => process.env[name] || publicEnv[name];
  if (value("VITE_SUPABASE_PROJECT_ID") !== "pdvwkdggyyrfkoqrpbji" || value("VITE_SUPABASE_URL") !== "https://pdvwkdggyyrfkoqrpbji.supabase.co") {
    throw new Error("Configure the approved OVU Supabase project before building or running the app");
  }
  const publicKey = value("VITE_SUPABASE_PUBLISHABLE_KEY");
  if (!publicKey || publicKey.startsWith("sb_secret_") || publicKey.startsWith("replace_")) throw new Error("A public Supabase publishable/anon key is required; never use a server key");
  return {
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
  };
});
