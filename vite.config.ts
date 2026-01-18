import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar vendor chunks grandes
          'maplibre': ['maplibre-gl'],
          'react-vendor': ['react', 'react-dom'],
          'utils': ['zustand', 'fuse.js'],
        }
      }
    },
    chunkSizeWarningLimit: 600,
  },
})
