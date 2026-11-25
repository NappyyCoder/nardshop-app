import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import noSecrets from './vite-plugin-no-secrets.js'
import playApi from './vite-plugin-play-api.js'

export default defineConfig(({ command }) => ({
  plugins: [react(), noSecrets(), playApi()],
  // Site root locally and on Vercel. GitHub Pages keeps the /nardshop-app/ subpath.
  base: command === 'serve' || process.env.VERCEL ? '/' : '/nardshop-app/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 3000,
    strictPort: false,
    open: true,
    host: true,
    allowedHosts: true,
    proxy: {
      '/wp-json': {
        target: 'https://nardshop.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
  preview: {
    port: 3000,
    host: true,
    allowedHosts: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
}))
