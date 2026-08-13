import { defineConfig } from 'vite';

/**
 * The site is published under https://<user>.github.io/boot-anatomy/, so the
 * base path has to be set at build time. During local development we serve from
 * the root, so base stays '/'.
 *
 * If you rename the repository or switch to a custom domain / user site
 * (user.github.io), override it with the BASE_PATH environment variable:
 *   BASE_PATH=/ npm run build
 */
const REPO_BASE = '/boot-anatomy/';

export default defineConfig(({ command }) => ({
  base: process.env.BASE_PATH ?? (command === 'build' ? REPO_BASE : '/'),
  build: {
    outDir: 'dist',
    target: 'es2022',
    sourcemap: true,
    chunkSizeWarningLimit: 900, // three.js alone is ~600kB
  },
  server: {
    port: 5173,
    host: true,
  },
}));
