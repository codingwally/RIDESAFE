import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  root: "app",
  publicDir: "../public",
  base: "/RIDESAFE/",
  build: { outDir: "../dist", emptyOutDir: true },
});
