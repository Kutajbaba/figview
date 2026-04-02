import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Default CSS minify strips quotes from multi-word font-family names, so Tailwind’s
    // `font-sfCompactDisplay` becomes invalid and falls back to inherited `#root` (IBM Plex Mono).
    cssMinify: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
