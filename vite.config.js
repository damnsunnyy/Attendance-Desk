import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  // GitHub Pages serves project sites from /<repository-name>/.
  // Set VITE_BASE_PATH='/' for a custom domain or user site.
  base: process.env.VITE_BASE_PATH || '/',
  root: 'web',
  plugins: [react()],
  build: { outDir: '../dist', emptyOutDir: true },
  server: { proxy: { '/api': 'http://localhost:4000' } },
});
