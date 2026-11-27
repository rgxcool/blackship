import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';

export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      routesDirectory: './src/app/routes', // routing folder belongs to app
      generatedRouteTree: './src/app/route-tree.gen.ts',
    }),
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
});
