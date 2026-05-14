import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import pkg from "./package.json" assert { type: "json" };

export default defineConfig({
  plugins: [react()],
  // Expose app version at build time so Settings → About can display it
  // without importing package.json (which would bundle the whole manifest
  // and confuse Rollup's static analysis).
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version)
  },
  build: { outDir: "dist", sourcemap: true }
});
