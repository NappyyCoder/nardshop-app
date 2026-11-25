import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import noSecrets from './vite-plugin-no-secrets.js';

export default defineConfig({
  plugins: [react(), noSecrets()],
  base: './',
  publicDir: false,
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'wordpress/nard-coming-soon/build',
    emptyOutDir: true,
    cssCodeSplit: false,
    sourcemap: false,
    rollupOptions: {
      input: path.resolve(__dirname, 'src/coming-soon-main.jsx'),
      output: {
        entryFileNames: 'nard-coming-soon.js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (asset) => (asset.name && asset.name.endsWith('.css')
          ? 'nard-coming-soon.css'
          : 'assets/[name]-[hash][extname]'),
      },
    },
  },
});
