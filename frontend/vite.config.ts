import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(__dirname, "./src");

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": src,
      "@/app": path.resolve(src, "app"),
      "@/pages": path.resolve(src, "pages"),
      "@/widgets": path.resolve(src, "widgets"),
      "@/features": path.resolve(src, "features"),
      "@/entities": path.resolve(src, "entities"),
      "@/shared": path.resolve(src, "shared"),
    },
  },
});
